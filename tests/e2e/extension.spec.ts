import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { chromium } from 'playwright';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';

const REAL_LICENSE_KEY = 'sb_license:bookmark-freshness-review';
const DEMO_LICENSE_KEY = 'demo:sb_license:bookmark-freshness-review';

const importFixture = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<DL><p><DT><H3>Research</H3><DL><p>
<DT><A HREF="https://example.test/paper?utm_source=mail" ADD_DATE="1500000000">Tracked paper</A>
<DT><A HREF="https://example.test/paper" ADD_DATE="1600000000">Clean paper</A>
</DL><p></DL><p>`;

const nestedImportFixture = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<DL><p><DT><H3>Parent</H3><DL><p>
<DT><A HREF="https://example.test/parent-before">Parent before</A>
<DT><H3>Child</H3><DL><p><DT><A HREF="https://example.test/child">Child item</A></DL><p>
<DT><A HREF="https://example.test/parent-after">Parent after</A>
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

test('@claim:local-demo keeps website and extension demo changes separate from real data', async ({ page: sitePage }) => {
  const external: string[] = [];
  sitePage.on('request', request => { if (new URL(request.url()).origin !== 'http://127.0.0.1:4173') external.push(request.url()); });
  await sitePage.goto('/');
  await sitePage.evaluate(() => localStorage.setItem('archive:v1', 'REAL ARCHIVE SENTINEL'));
  await sitePage.goto('/demo');
  const demoLedger = sitePage.locator('.demo-ledger');
  await demoLedger.getByLabel('Purpose or browser profile').first().fill('Needs the work profile.');
  await demoLedger.getByLabel('Purpose or browser profile').first().blur();
  await sitePage.getByRole('button', { name: 'Reset demo' }).click();
  await sitePage.getByRole('button', { name: 'Download extension and exit demo' }).click();
  expect(await sitePage.evaluate(() => localStorage.getItem('archive:v1'))).toBe('REAL ARCHIVE SENTINEL');
  expect(await sitePage.evaluate(() => localStorage.getItem('demo:bookmark-freshness-review:v1'))).toBeNull();
  expect(external).toEqual([]);

  const { context, page, userDataDir } = await openExtension('bookmark-review-demo-isolation-');
  const realArchive = [{
    id: 'real-sentinel', title: 'Real archive sentinel', url: 'https://real.example.test', folder: 'Real archive', note: 'Do not change', decision: 'keep', state: 'unchecked'
  }];
  const realLicense = { token: 'real-license-sentinel', valid: true, checkedAt: Date.now(), verified: true };
  try {
    await context.route('https://api.sociobot.in/**', route => route.fulfill({ json: { valid: true, reason: 'ok', expires_at: null } }));
    await page.evaluate(async ({ archive, license, licenseKey }) => chrome.storage.local.set({ 'archive:v1': archive, [licenseKey]: license }), { archive: realArchive, license: realLicense, licenseKey: REAL_LICENSE_KEY });

    page.once('dialog', dialog => dialog.accept('demo-entered-license'));
    await page.getByRole('button', { name: 'Paste a license' }).click();
    await expect(page.getByText('Full review active')).toBeVisible();
    let stored = await page.evaluate(async () => chrome.storage.local.get(null));
    expect(stored[REAL_LICENSE_KEY]).toEqual(realLicense);
    expect(stored[DEMO_LICENSE_KEY]).toMatchObject({ token: 'demo-entered-license', valid: true, verified: true });

    await page.getByRole('button', { name: 'Reset demo' }).click();
    stored = await page.evaluate(async () => chrome.storage.local.get(null));
    expect(stored[REAL_LICENSE_KEY]).toEqual(realLicense);
    expect(stored['archive:v1']).toEqual(realArchive);
    expect(stored[DEMO_LICENSE_KEY]).toBeUndefined();
    expect(stored['demo:archive:v1']).toBeUndefined();

    page.once('dialog', dialog => dialog.accept('second-demo-license'));
    await page.getByRole('button', { name: 'Paste a license' }).click();
    await expect(page.getByText('Full review active')).toBeVisible();
    await page.getByRole('button', { name: 'Exit demo' }).click();
    await expect(page).toHaveURL(/options\.html$/);
    stored = await page.evaluate(async () => chrome.storage.local.get(null));
    expect(stored[REAL_LICENSE_KEY]).toEqual(realLicense);
    expect(stored['archive:v1']).toEqual(realArchive);
    expect(stored[DEMO_LICENSE_KEY]).toBeUndefined();
    expect(stored['demo:archive:v1']).toBeUndefined();
  } finally {
    await context.close();
    rmSync(userDataDir, { recursive: true, force: true });
  }
});

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
    await expect(page.getByRole('heading', { name: 'Link-check limit' })).toBeVisible();
    await page.getByRole('button', { name: 'Exit demo' }).click();
    await expect(page).toHaveURL(`chrome-extension://${extensionId}/options.html`);
    await page.locator('#import-file').setInputFiles({
      name: 'bookmarks.html', mimeType: 'text/html', buffer: Buffer.from('<!DOCTYPE NETSCAPE-Bookmark-file-1><DL><p><DT><H3>Research</H3><DL><p><DT><A HREF="https://example.test/paper">Paper</A></DL><p></DL><p>')
    });
    await expect(page.getByRole('heading', { name: 'Decide which bookmarks still belong' })).toBeVisible();
    const note = page.getByLabel('Purpose or browser profile');
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

test('@claim:html-import imports nested standard bookmark HTML through the packaged extension demo', async () => {
  const { context, page, userDataDir } = await openExtension('bookmark-review-import-');
  try {
    await page.locator('#import-file').setInputFiles({ name: 'bookmarks.html', mimeType: 'text/html', buffer: Buffer.from(nestedImportFixture) });
    await expect(page.getByText('3 bookmarks stay on this device.')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Parent after' })).toBeVisible();
    const stored = await page.evaluate(async () => chrome.storage.local.get(null));
    expect((stored['demo:archive:v1'] as Array<{ title: string; folder: string }>).map(({ title, folder }) => ({ title, folder }))).toEqual([
      { title: 'Parent before', folder: 'Parent' },
      { title: 'Child item', folder: 'Child' },
      { title: 'Parent after', folder: 'Parent' }
    ]);
    expect(stored['archive:v1']).toBeUndefined();
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Export kept HTML' }).click();
    const download = await downloadPromise;
    const stream = await download.createReadStream();
    let exported = '';
    for await (const chunk of stream!) exported += chunk.toString();
    expect(exported).toContain('<H3>Parent</H3>\n  <DL><p>\n    <DT><A HREF="https://example.test/parent-before">Parent before</A>\n    <DT><A HREF="https://example.test/parent-after">Parent after</A>');
    expect(exported).toContain('<H3>Child</H3>');
  } finally {
    await context.close();
    rmSync(userDataDir, { recursive: true, force: true });
  }
});

test('@claim:explicit-checks does not contact saved sites before the packaged extension check action', async ({}, testInfo) => {
  const session = `explicit-${testInfo.workerIndex}-${Date.now()}`;
  const { context, page, userDataDir } = await openExtension('bookmark-review-explicit-');
  try {
    await page.locator('#import-file').setInputFiles({
      name: 'explicit-check.html', mimeType: 'text/html',
      buffer: Buffer.from(`<!DOCTYPE NETSCAPE-Bookmark-file-1><DL><p><DT><A HREF="http://127.0.0.1:4173/__test-link/${session}/saved">Saved site</A></DL><p>`)
    });
    await page.waitForTimeout(700);
    expect(await (await fetch(`http://127.0.0.1:4173/__test-log/${session}`)).json()).toEqual([]);
    await page.getByRole('button', { name: 'Check visible links' }).click();
    await expect.poll(async () => (await (await fetch(`http://127.0.0.1:4173/__test-log/${session}`)).json()).length).toBe(1);
  } finally {
    await context.close();
    rmSync(userDataDir, { recursive: true, force: true });
  }
});

test('@claim:url-repair saves a repaired URL and exports it from the packaged extension', async () => {
  const { context, page, userDataDir } = await openExtension('bookmark-review-repair-');
  try {
    await page.locator('#import-file').setInputFiles({
      name: 'repair.html', mimeType: 'text/html',
      buffer: Buffer.from('<!DOCTYPE NETSCAPE-Bookmark-file-1><DL><p><DT><A HREF="https://example.test/old">Moved paper</A></DL><p>')
    });
    const input = page.getByLabel('Bookmark URL');
    await input.fill('https://example.test/repaired');
    await input.blur();
    await page.reload();
    await expect(page.getByLabel('Bookmark URL')).toHaveValue('https://example.test/repaired');
    expect(await page.evaluate(async () => chrome.storage.local.get('demo:archive:v1'))).toMatchObject({
      'demo:archive:v1': [expect.objectContaining({ url: 'https://example.test/repaired' })]
    });
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Export kept HTML' }).click();
    const download = await downloadPromise;
    const stream = await download.createReadStream();
    let exported = '';
    for await (const chunk of stream!) exported += chunk.toString();
    expect(exported).toContain('https://example.test/repaired');
  } finally {
    await context.close();
    rmSync(userDataDir, { recursive: true, force: true });
  }
});

test('@claim:decision-persistence keeps review decisions in extension storage and omits archived bookmarks from export', async () => {
  const { context, page, userDataDir } = await openExtension('bookmark-review-decisions-');
  try {
    await page.locator('#import-file').setInputFiles({ name: 'decisions.html', mimeType: 'text/html', buffer: Buffer.from(`<!DOCTYPE NETSCAPE-Bookmark-file-1><DL><p>
      <DT><A HREF="https://example.test/keep">Keep item</A><DT><A HREF="https://example.test/review">Review item</A><DT><A HREF="https://example.test/archive">Archive item</A></DL><p>`) });
    await page.getByRole('heading', { name: 'Keep item' }).locator('xpath=ancestor::article').getByRole('button', { name: 'Keep' }).click();
    await page.getByRole('heading', { name: 'Archive item' }).locator('xpath=ancestor::article').getByRole('button', { name: 'Archive' }).click();
    await page.reload();
    const stored = await page.evaluate(async () => chrome.storage.local.get('demo:archive:v1'));
    const decisions = (stored['demo:archive:v1'] as Array<{ title: string; decision: string }>).map(({ title, decision }) => ({ title, decision }));
    expect(decisions).toEqual([{ title: 'Keep item', decision: 'keep' }, { title: 'Review item', decision: 'review' }, { title: 'Archive item', decision: 'archive' }]);
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Export kept HTML' }).click();
    const stream = await (await downloadPromise).createReadStream();
    let exported = '';
    for await (const chunk of stream!) exported += chunk.toString();
    expect(exported).toContain('Keep item');
    expect(exported).toContain('Review item');
    expect(exported).not.toContain('Archive item');
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

test('@claim:request-spacing spaces demo requests and honors 429 and 503 Retry-After limits', async ({}, testInfo) => {
  test.setTimeout(45_000);
  const session = `request-spacing-${testInfo.workerIndex}-${Date.now()}`;
  const { context, page, userDataDir } = await openExtension('bookmark-review-spacing-');
  try {
    const fixture = `<!DOCTYPE NETSCAPE-Bookmark-file-1><DL><p>
      <DT><A HREF="http://127.0.0.1:4173/__test-link/${session}/spaced-one">Spacing one</A>
      <DT><A HREF="http://127.0.0.1:4173/__test-link/${session}/spaced-two">Spacing two</A>
      <DT><A HREF="http://127.0.0.1:4173/__test-link/${session}/unavailable?status=503&amp;retryAfter=5">Temporarily unavailable</A>
      <DT><A HREF="http://127.0.0.1:4173/__test-link/${session}/unavailable-follow-up">Unavailable follow-up</A>
      <DT><A HREF="http://localhost:4173/__test-link/${session}/limited?status=429&amp;retryAfter=3">Rate limited</A>
      <DT><A HREF="http://localhost:4173/__test-link/${session}/blocked">Blocked follow-up</A>
      </DL><p>`;
    await page.locator('#import-file').setInputFiles({ name: 'spacing-check.html', mimeType: 'text/html', buffer: Buffer.from(fixture) });
    await page.getByRole('button', { name: 'Check visible links' }).click();
    await expect.poll(async () => {
      const stored = await page.evaluate(async () => chrome.storage.local.get('demo:archive:v1'));
      return (stored['demo:archive:v1'] as Array<{ state: string }>).filter(record => record.state !== 'unchecked').length;
    }, { timeout: 20_000 }).toBe(6);

    const probes = await fetch(`http://127.0.0.1:4173/__test-log/${session}`).then(response => response.json()) as Array<{ path: string; at: number }>;
    const spaced = probes.filter(probe => probe.path.startsWith('spaced-'));
    expect(spaced).toHaveLength(2);
    expect(spaced[1].at - spaced[0].at).toBeGreaterThanOrEqual(1_450);
    expect(probes.filter(probe => probe.path === 'unavailable')).toHaveLength(1);
    // Wait through the full advertised window: a packaged extension must not
    // send a same-host follow-up before a 503 Retry-After expires.
    await page.waitForTimeout(5_100);
    const after503 = await fetch(`http://127.0.0.1:4173/__test-log/${session}`).then(response => response.json()) as Array<{ path: string; at: number }>;
    expect(after503.filter(probe => probe.path === 'unavailable-follow-up')).toHaveLength(0);
    expect(probes.filter(probe => probe.path === 'limited')).toHaveLength(1);
    expect(probes.filter(probe => probe.path === 'blocked')).toHaveLength(0);
    await page.getByRole('button', { name: /Login or restricted/ }).click();
    await expect(page.getByText('3 shown')).toBeVisible();
  } finally {
    await context.close();
    rmSync(userDataDir, { recursive: true, force: true });
  }
});

test('@claim:paid-license keeps invalid and unreachable licenses capped and removes the limit only after valid verification', async () => {
  test.setTimeout(70_000);
  async function verifyBoundary(mode: 'valid' | 'invalid' | 'unreachable') {
    const { context, page, userDataDir } = await openExtension(`bookmark-review-limit-${mode}-`);
    const records = Array.from({ length: 51 }, (_, index) => ({
      id: `limit-${index}`,
      title: `Bookmark ${index + 1}`,
      url: `not-a-valid-url-${index}`,
      folder: 'Limit fixture',
      note: '',
      decision: 'review',
      state: index < 50 ? 'failed' : 'unchecked',
      checkAttempts: index < 50 ? 1 : 0
    }));
    try {
      await context.route('https://api.sociobot.in/**', route => mode === 'unreachable'
        ? route.abort()
        : route.fulfill({ json: { valid: mode === 'valid', reason: mode === 'valid' ? 'ok' : 'invalid', expires_at: null } }));
      await page.evaluate(async seeded => chrome.storage.local.set({ 'demo:archive:v1': seeded }), records);
      await page.goto(`${page.url()}&license=${mode}-license`);
      if (mode === 'valid') await expect(page.getByText('Full review active')).toBeVisible();
      else await expect(page.locator('.license-message')).toContainText(mode === 'invalid' ? 'This license is not active. The 50-check limit still applies.' : 'The license could not be checked. The 50-check limit still applies.');

      await page.getByRole('button', { name: 'Check visible links' }).click();
      const expectedAttempts = mode === 'valid' ? 101 : 50;
      await expect.poll(async () => page.evaluate(async () => {
        const stored = await chrome.storage.local.get('demo:archive:v1');
        return (stored['demo:archive:v1'] as Array<{ checkAttempts?: number }>).reduce((total, record) => total + (record.checkAttempts ?? 0), 0);
      })).toBe(expectedAttempts);
      await page.reload();
      await page.getByRole('button', { name: 'Check visible links' }).click();
      await expect.poll(async () => page.evaluate(async () => {
        const stored = await chrome.storage.local.get('demo:archive:v1');
        return (stored['demo:archive:v1'] as Array<{ checkAttempts?: number }>).reduce((total, record) => total + (record.checkAttempts ?? 0), 0);
      })).toBe(mode === 'valid' ? 152 : 50);
      const stored = await page.evaluate(async () => chrome.storage.local.get(null));
      expect(stored[REAL_LICENSE_KEY]).toBeUndefined();
      if (mode === 'valid') expect(stored[DEMO_LICENSE_KEY]).toMatchObject({ valid: true, verified: true });
      if (mode === 'invalid') expect(stored[DEMO_LICENSE_KEY]).toMatchObject({ valid: false, verified: true });
      if (mode === 'unreachable') expect(stored[DEMO_LICENSE_KEY]).toBeUndefined();
    } finally {
      await context.close();
      rmSync(userDataDir, { recursive: true, force: true });
    }
  }

  await verifyBoundary('invalid');
  await verifyBoundary('unreachable');
  await verifyBoundary('valid');
});

test('@claim:html-export exports every kept bookmark without a license after the 50-check limit', async () => {
  const { context, page, userDataDir } = await openExtension('bookmark-review-free-export-');
  try {
    const records = Array.from({ length: 51 }, (_, index) => ({
      id: `free-export-${index}`, title: `Kept bookmark ${index + 1}`, url: `https://example.test/${index + 1}`,
      folder: 'Free export', note: '', decision: 'keep', state: 'unchecked', checkAttempts: 1
    }));
    await page.evaluate(async seeded => chrome.storage.local.set({ 'demo:archive:v1': seeded }), records);
    await page.reload();
    await expect(page.getByText('51 of 50 free link checks used. A one-time license removes the limit.')).toBeVisible();
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Export kept HTML' }).click();
    const stream = await (await downloadPromise).createReadStream();
    let exported = '';
    for await (const chunk of stream!) exported += chunk.toString();
    expect(exported).toContain('<!DOCTYPE NETSCAPE-Bookmark-file-1>');
    expect(exported).toContain('Kept bookmark 1');
    expect(exported).toContain('Kept bookmark 51');
    expect((exported.match(/<DT><A /g) ?? [])).toHaveLength(51);
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
    const note = page.getByLabel('Purpose or browser profile').first();
    await note.fill('Saved while offline.');
    await note.blur();
    await page.reload();
    await expect(page.getByLabel('Purpose or browser profile').first()).toHaveValue('Saved while offline.');
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
    const cards = await page.locator('.record').evaluateAll(elements => elements.map(element => {
      const heading = element.querySelector('h3')!;
      const foreground = getComputedStyle(heading).color;
      const background = getComputedStyle(element).backgroundColor;
      const channels = (color: string) => color.match(/[\d.]+/g)!.slice(0, 3).map(Number);
      const luminance = (color: string) => {
        const linear = channels(color).map(channel => {
          const value = channel / 255;
          return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
        });
        return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
      };
      const light = Math.max(luminance(foreground), luminance(background));
      const dark = Math.min(luminance(foreground), luminance(background));
      return { state: [...element.classList].find(name => name.startsWith('state-')), foreground, background, contrast: (light + 0.05) / (dark + 0.05) };
    }));
    expect(cards.map(card => card.state).sort()).toEqual(['state-alive', 'state-alive', 'state-dead', 'state-failed', 'state-redirected', 'state-restricted']);
    for (const card of cards) {
      expect(card.foreground, card.state).toBe('rgb(240, 238, 226)');
      expect(card.background, card.state).toBe('rgb(43, 48, 42)');
      expect(card.contrast, card.state).toBeGreaterThanOrEqual(4.5);
    }
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter(v => ['serious', 'critical'].includes(v.impact ?? ''))).toEqual([]);
  } finally {
    await context.close();
    rmSync(userDataDir, { recursive: true, force: true });
  }
});
