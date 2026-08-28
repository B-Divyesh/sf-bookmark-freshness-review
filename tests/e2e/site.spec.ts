import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('@claim:local-demo demo keeps bookmark data local', async ({ page }) => {
  const external: string[] = [];
  page.on('request', request => { if (new URL(request.url()).origin !== 'http://127.0.0.1:4173') external.push(request.url()); });
  await page.goto('/demo');
  await page.getByLabel('Purpose or browser context').first().fill('Needs the work profile.');
  await page.getByLabel('Purpose or browser context').first().blur();
  const keys = await page.evaluate(() => Object.keys(localStorage));
  expect(keys).toEqual(['demo:bookmark-freshness-review:v1']);
  expect(external).toEqual([]);
});

test('@claim:status-separation separates dead pages from failed checks', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: /Dead pages/ }).click();
  await expect(page.getByText('Dead page · 404')).toBeVisible();
  await page.getByRole('button', { name: /Failed checks/ }).click();
  await expect(page.getByRole('heading', { name: 'Check failed' })).toBeVisible();
  await expect(page.getByText('The site did not answer.')).toBeVisible();
});

test('@claim:explicit-checks starts checks only after a button press', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.locator('#route-status')).toHaveText('');
  await page.getByRole('button', { name: 'Run sample check' }).click();
  await expect(page.locator('#route-status')).toContainText('Six sample checks finished.');
});

test('@claim:url-repair saves a repaired URL in the demo sandbox', async ({ page }) => {
  await page.goto('/demo');
  const input = page.getByLabel('Bookmark URL').first();
  await input.fill('https://archive.example.org/repaired');
  await input.blur();
  await page.reload();
  await expect(page.getByLabel('Bookmark URL').first()).toHaveValue('https://archive.example.org/repaired');
});

test('@claim:html-export exports kept bookmarks as standard HTML', async ({ page }) => {
  await page.goto('/demo');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export kept HTML' }).click();
  const download = await downloadPromise;
  const stream = await download.createReadStream();
  let content = '';
  for await (const chunk of stream!) content += chunk.toString();
  expect(content).toContain('<!DOCTYPE NETSCAPE-Bookmark-file-1>');
  expect(content).toContain('Field Notes on Durable Web Archives');
});

test('@claim:paid-license accepts a valid one-time license', async ({ page }) => {
  await page.route('https://api.sociobot.in/**', route => route.fulfill({ json: { valid: true, reason: 'ok', expires_at: null } }));
  await page.goto('/?license=test-license');
  await expect(page.getByText('Full review is active on this browser.')).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('sb_license:bookmark-freshness-review'))).toContain('test-license');
});

test('routes expose one h1, navigation, and no serious accessibility issues', async ({ page }) => {
  for (const route of ['/', '/demo', '/privacy', '/terms', '/missing']) {
    await page.goto(route);
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('h1')).toHaveCount(1);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter(v => ['serious', 'critical'].includes(v.impact ?? ''))).toEqual([]);
  }
});

test('internal links resolve and route changes focus the page heading', async ({ page, request }) => {
  await page.goto('/');
  const internal = await page.locator('a[href]').evaluateAll(links => [...new Set(links.map(link => (link as HTMLAnchorElement).getAttribute('href')!).filter(href => href.startsWith('/')))]);
  for (const href of internal) expect((await request.get(href)).status(), href).toBe(200);
  await page.getByRole('link', { name: 'Demo', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
  await page.goBack();
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
});

test('mobile demo stays within the viewport and keyboard focus is visible', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/demo');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.keyboard.press('Tab');
  await expect(page.locator('.skip-link')).toBeFocused();
});
