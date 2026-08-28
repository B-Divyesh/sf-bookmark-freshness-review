import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { chromium } from 'playwright';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';

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
    await page.goto(`chrome-extension://${extensionId}/options.html`);
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
    await page.goto(`chrome-extension://${extensionId}/options.html`);
    const records = Array.from({ length: 51 }, (_, index) => ({
      id: `limit-${index}`,
      title: `Bookmark ${index + 1}`,
      url: `not-a-valid-url-${index}`,
      folder: 'Limit fixture',
      note: '',
      decision: 'review',
      state: 'unchecked'
    }));
    await page.evaluate(async seeded => chrome.storage.local.set({ 'archive:v1': seeded }), records);
    await page.reload();

    await page.getByRole('button', { name: 'Check visible links' }).click();
    await expect(page.getByText('50 of 50 free link checks used. Pay $18 once for unlimited checks.')).toBeVisible();
    await expect.poll(async () => page.evaluate(async () => {
      const stored = await chrome.storage.local.get('archive:v1');
      return (stored['archive:v1'] as Array<{ checkAttempts?: number }>).reduce((total, record) => total + (record.checkAttempts ?? 0), 0);
    })).toBe(50);

    await page.getByRole('button', { name: 'Check visible links' }).click();
    await expect.poll(async () => page.evaluate(async () => {
      const stored = await chrome.storage.local.get('archive:v1');
      return (stored['archive:v1'] as Array<{ checkAttempts?: number }>).reduce((total, record) => total + (record.checkAttempts ?? 0), 0);
    })).toBe(50);

    await page.goto(`chrome-extension://${extensionId}/options.html?license=test-license`);
    await expect(page.getByText('Full review active')).toBeVisible();
    await expect.poll(async () => page.evaluate(async () => {
      const stored = await chrome.storage.local.get('sb_license:bookmark-freshness-review');
      return (stored['sb_license:bookmark-freshness-review'] as { checkedAt: number }).checkedAt;
    })).toBeGreaterThan(0);
    await page.getByRole('button', { name: 'Check visible links' }).click();
    await expect.poll(async () => page.evaluate(async () => {
      const stored = await chrome.storage.local.get('archive:v1');
      return (stored['archive:v1'] as Array<{ checkAttempts?: number }>).reduce((total, record) => total + (record.checkAttempts ?? 0), 0);
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
