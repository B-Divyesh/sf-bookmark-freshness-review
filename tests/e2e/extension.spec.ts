import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { chromium } from 'playwright';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';

const importFixture = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<DL><p><DT><H3>Research</H3><DL><p>
<DT><A HREF="https://example.test/paper?utm_source=mail" ADD_DATE="1500000000">Tracked paper</A>
<DT><A HREF="https://example.test/paper" ADD_DATE="1600000000">Clean paper</A>
</DL><p></DL><p>`;

async function openExtension(userDataPrefix: string, path = '/options.html?demo=1') {
  const userDataDir = mkdtempSync(resolve(tmpdir(), userDataPrefix));
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    args: ['--headless=new', `--disable-extensions-except=${resolve('.output/chrome-mv3')}`, `--load-extension=${resolve('.output/chrome-mv3')}`]
  });
  const worker = context.serviceWorkers()[0] ?? await context.waitForEvent('serviceworker');
  const extensionId = new URL(worker.url()).host;
  const page = await context.newPage();
  await page.goto(`chrome-extension://${extensionId}${path}`);
  return { context, page, userDataDir };
}

test('@claim:extension-local-storage imports and edits an archive without a hosted request', async () => {
  test.setTimeout(45_000);
  const userDataDir = mkdtempSync(resolve(tmpdir(), 'bookmark-review-extension-'));
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    args: ['--headless=new', `--disable-extensions-except=${resolve('.output/chrome-mv3')}`, `--load-extension=${resolve('.output/chrome-mv3')}`]
  });
  try {
    const worker = context.serviceWorkers()[0] ?? await context.waitForEvent('serviceworker');
    const extensionId = new URL(worker.url()).host;
    const page = await context.newPage();
    const external: string[] = [];
    context.on('request', request => { if (new URL(request.url()).protocol !== 'chrome-extension:') external.push(request.url()); });
    await page.goto(`chrome-extension://${extensionId}/options.html?demo=1`);
    await page.getByRole('button', { name: 'Start for real' }).click();
    await expect(page).toHaveURL(`chrome-extension://${extensionId}/options.html`);
    await page.locator('#import-file').setInputFiles({
      name: 'bookmarks.html', mimeType: 'text/html', buffer: Buffer.from('<!DOCTYPE NETSCAPE-Bookmark-file-1><DL><p><DT><H3>Research</H3><DL><p><DT><A HREF="https://example.test/paper">Paper</A></DL><p></DL><p>')
    });
    await expect(page.getByRole('heading', { name: 'Decide which bookmarks still belong' })).toBeVisible();
    const note = page.getByLabel('Purpose or browser context');
    await note.fill('Use for the literature review.');
    await note.blur();
    await expect.poll(async () => page.evaluate(async () => await new Promise<Record<string, unknown>>(resolve => chrome.storage.local.get(null, resolve)))).toMatchObject({
      'archive:v1': [expect.objectContaining({ title: 'Paper', note: 'Use for the literature review.' })]
    });
    expect(external).toEqual([]);
  } finally {
    await context.close();
    rmSync(userDataDir, { recursive: true, force: true });
  }
});

test('@claim:html-import imports standard bookmark HTML through the extension demo', async () => {
  const { context, page, userDataDir } = await openExtension('bookmark-review-import-');
  try {
    await page.locator('#import-file').setInputFiles({ name: 'bookmarks.html', mimeType: 'text/html', buffer: Buffer.from(importFixture) });
    await expect(page.getByText('2 bookmarks stay on this device.')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Tracked paper' })).toBeVisible();
    const stored = await page.evaluate(async () => chrome.storage.local.get(null));
    expect(stored['demo:archive:v1']).toEqual(expect.arrayContaining([
      expect.objectContaining({ title: 'Tracked paper', folder: 'Research', addedAt: 1_500_000_000_000 })
    ]));
    expect(stored['archive:v1']).toBeUndefined();
  } finally {
    await context.close();
    rmSync(userDataDir, { recursive: true, force: true });
  }
});

test('@claim:duplicate-detection shows tracking variants as duplicates in the extension demo', async () => {
  const { context, page, userDataDir } = await openExtension('bookmark-review-duplicates-');
  try {
    await page.locator('#import-file').setInputFiles({ name: 'bookmarks.html', mimeType: 'text/html', buffer: Buffer.from(importFixture) });
    await page.getByRole('button', { name: /Duplicates/ }).click();
    await expect(page.getByRole('heading', { name: 'Canonical duplicates' })).toBeFocused();
    await expect(page.getByText('1 shown')).toBeVisible();
    await expect(page.getByText('Duplicate of another bookmark in this archive.')).toBeVisible();
  } finally {
    await context.close();
    rmSync(userDataDir, { recursive: true, force: true });
  }
});

test('@claim:credential-free-checks omits browser cookies during a demo link check', async () => {
  const session = 'credential-free';
  const { context, page, userDataDir } = await openExtension('bookmark-review-credentials-');
  try {
    await context.addCookies([{ name: 'private_session', value: 'must-not-leave', domain: '127.0.0.1', path: '/' }]);
    await page.locator('#import-file').setInputFiles({
      name: 'credential-check.html', mimeType: 'text/html',
      buffer: Buffer.from(`<!DOCTYPE NETSCAPE-Bookmark-file-1><DL><p><DT><A HREF="http://127.0.0.1:4173/__test-link/${session}/only">Local credential probe</A></DL><p>`)
    });
    await page.getByRole('button', { name: 'Check visible links' }).click();
    await expect.poll(async () => {
      const stored = await page.evaluate(async () => chrome.storage.local.get('demo:archive:v1'));
      return (stored['demo:archive:v1'] as Array<{ state: string }>)[0]?.state;
    }, { timeout: 15_000 }).toBe('redirected');
    const probes = await fetch(`http://127.0.0.1:4173/__test-log/${session}`).then(response => response.json()) as Array<{ cookie: string }>;
    expect(probes).toHaveLength(1);
    expect(probes[0].cookie).toBe('');
  } finally {
    await context.close();
    rmSync(userDataDir, { recursive: true, force: true });
  }
});

test('@claim:request-spacing spaces demo requests and honors Retry-After', async () => {
  test.setTimeout(45_000);
  const session = 'request-spacing';
  const { context, page, userDataDir } = await openExtension('bookmark-review-spacing-');
  try {
    const fixture = `<!DOCTYPE NETSCAPE-Bookmark-file-1><DL><p>
      <DT><A HREF="http://127.0.0.1:4173/__test-link/${session}/spaced-one">Spacing one</A>
      <DT><A HREF="http://127.0.0.1:4173/__test-link/${session}/spaced-two">Spacing two</A>
      <DT><A HREF="http://localhost:4173/__test-link/${session}/limited?status=429&amp;retryAfter=3">Rate limited</A>
      <DT><A HREF="http://localhost:4173/__test-link/${session}/blocked">Blocked follow-up</A>
      </DL><p>`;
    await page.locator('#import-file').setInputFiles({ name: 'spacing-check.html', mimeType: 'text/html', buffer: Buffer.from(fixture) });
    await page.getByRole('button', { name: 'Check visible links' }).click();
    await expect.poll(async () => {
      const stored = await page.evaluate(async () => chrome.storage.local.get('demo:archive:v1'));
      return (stored['demo:archive:v1'] as Array<{ state: string }>).filter(record => record.state !== 'unchecked').length;
    }, { timeout: 20_000 }).toBe(4);

    const probes = await fetch(`http://127.0.0.1:4173/__test-log/${session}`).then(response => response.json()) as Array<{ path: string; at: number }>;
    const spaced = probes.filter(probe => probe.path.startsWith('spaced-'));
    expect(spaced).toHaveLength(2);
    expect(spaced[1].at - spaced[0].at).toBeGreaterThanOrEqual(1_450);
    expect(probes.filter(probe => probe.path === 'limited')).toHaveLength(1);
    expect(probes.filter(probe => probe.path === 'blocked')).toHaveLength(0);
    await page.getByRole('button', { name: /Login or restricted/ }).click();
    await expect(page.getByText('2 shown')).toBeVisible();
  } finally {
    await context.close();
    rmSync(userDataDir, { recursive: true, force: true });
  }
});

test('@claim:paid-license enforces 50 attempts and removes the limit for a valid license', async () => {
  test.setTimeout(45_000);
  const userDataDir = mkdtempSync(resolve(tmpdir(), 'bookmark-review-limit-'));
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    args: ['--headless=new', `--disable-extensions-except=${resolve('.output/chrome-mv3')}`, `--load-extension=${resolve('.output/chrome-mv3')}`]
  });
  try {
    await context.route('https://api.sociobot.in/**', route => route.fulfill({
      json: { valid: true, reason: 'ok', expires_at: null }
    }));
    const worker = context.serviceWorkers()[0] ?? await context.waitForEvent('serviceworker');
    const extensionId = new URL(worker.url()).host;
    const page = await context.newPage();
    await page.goto(`chrome-extension://${extensionId}/options.html?demo=1`);
    const records = Array.from({ length: 51 }, (_, index) => ({
      id: `limit-${index}`,
      title: `Bookmark ${index + 1}`,
      url: `not-a-valid-url-${index}`,
      folder: 'Limit fixture',
      note: '',
      decision: 'review',
      state: 'unchecked'
    }));
    await page.evaluate(async seeded => chrome.storage.local.set({ 'demo:archive:v1': seeded }), records);
    await page.reload();

    await page.getByRole('button', { name: 'Check visible links' }).click();
    await expect(page.getByText('50 of 50 free link checks used. A one-time license removes the limit.')).toBeVisible({ timeout: 30_000 });
    await expect.poll(async () => page.evaluate(async () => {
      const stored = await chrome.storage.local.get('demo:archive:v1');
      return (stored['demo:archive:v1'] as Array<{ checkAttempts?: number }>).reduce((total, record) => total + (record.checkAttempts ?? 0), 0);
    })).toBe(50);

    await page.getByRole('button', { name: 'Check visible links' }).click();
    await expect.poll(async () => page.evaluate(async () => {
      const stored = await chrome.storage.local.get('demo:archive:v1');
      return (stored['demo:archive:v1'] as Array<{ checkAttempts?: number }>).reduce((total, record) => total + (record.checkAttempts ?? 0), 0);
    })).toBe(50);

    await page.goto(`chrome-extension://${extensionId}/options.html?demo=1&license=test-license`);
    await expect(page.getByText('Full review active')).toBeVisible();
    await expect.poll(async () => page.evaluate(async () => {
      const stored = await chrome.storage.local.get('sb_license:bookmark-freshness-review');
      return (stored['sb_license:bookmark-freshness-review'] as { checkedAt: number }).checkedAt;
    })).toBeGreaterThan(0);
    await page.getByRole('button', { name: 'Check visible links' }).click();
    await expect.poll(async () => page.evaluate(async () => {
      const stored = await chrome.storage.local.get('demo:archive:v1');
      return (stored['demo:archive:v1'] as Array<{ checkAttempts?: number }>).reduce((total, record) => total + (record.checkAttempts ?? 0), 0);
    })).toBe(101);
  } finally {
    await context.close();
    rmSync(userDataDir, { recursive: true, force: true });
  }
});

test('keeps review work available when the browser goes offline', async () => {
  const userDataDir = mkdtempSync(resolve(tmpdir(), 'bookmark-review-offline-'));
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    args: ['--headless=new', `--disable-extensions-except=${resolve('.output/chrome-mv3')}`, `--load-extension=${resolve('.output/chrome-mv3')}`]
  });
  try {
    const worker = context.serviceWorkers()[0] ?? await context.waitForEvent('serviceworker');
    const extensionId = new URL(worker.url()).host;
    const page = await context.newPage();
    await page.goto(`chrome-extension://${extensionId}/options.html?demo=1`);
    await context.setOffline(true);
    await expect(page.getByText('You are offline. Notes and decisions still work.')).toBeVisible();
    const note = page.getByLabel('Purpose or browser context').first();
    await note.fill('Saved while offline.');
    await note.blur();
    await page.reload();
    await expect(page.getByLabel('Purpose or browser context').first()).toHaveValue('Saved while offline.');
  } finally {
    await context.close();
    rmSync(userDataDir, { recursive: true, force: true });
  }
});

test('extension demo meets mobile targets and dark-theme accessibility', async () => {
  const userDataDir = mkdtempSync(resolve(tmpdir(), 'bookmark-review-a11y-'));
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    viewport: { width: 390, height: 844 },
    colorScheme: 'dark',
    reducedMotion: 'reduce',
    args: ['--headless=new', `--disable-extensions-except=${resolve('.output/chrome-mv3')}`, `--load-extension=${resolve('.output/chrome-mv3')}`]
  });
  try {
    const worker = context.serviceWorkers()[0] ?? await context.waitForEvent('serviceworker');
    const extensionId = new URL(worker.url()).host;
    const page = await context.newPage();
    await page.goto(`chrome-extension://${extensionId}/options.html?demo=1`);
    const undersized = await page.locator('button, input:not([type="file"]), textarea, a').evaluateAll(elements =>
      elements.map(element => {
        const box = element.getBoundingClientRect();
        return { label: (element as HTMLElement).innerText || element.getAttribute('aria-label') || element.tagName, width: box.width, height: box.height };
      }).filter(target => target.width > 0 && target.height > 0 && (target.width < 44 || target.height < 44))
    );
    expect(undersized).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter(v => ['serious', 'critical'].includes(v.impact ?? ''))).toEqual([]);
  } finally {
    await context.close();
    rmSync(userDataDir, { recursive: true, force: true });
  }
});
