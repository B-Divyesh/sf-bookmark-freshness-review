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

test('@claim:site-local-resources site loads no analytics, advertising scripts, or third-party fonts', async ({ page }) => {
  const external: string[] = [];
  page.on('request', request => {
    if (new URL(request.url()).origin !== 'http://127.0.0.1:4173') external.push(request.url());
  });
  for (const route of ['/', '/demo', '/privacy', '/terms']) await page.goto(route);
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

test('accepts a valid one-time license return', async ({ page }) => {
  await page.route('https://api.sociobot.in/**', route => route.fulfill({ json: { valid: true, reason: 'ok', expires_at: null } }));
  await page.goto('/?license=test-license');
  await expect(page.getByText('Full review is active on this browser.')).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('sb_license:bookmark-freshness-review'))).toContain('test-license');
});

test('demo sample records do not offer placeholder links as live destinations', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.getByText('Open saved page')).toHaveCount(0);
  await expect(page.locator('.demo-record a[target="_blank"]')).toHaveCount(0);
  await expect(page.getByText('Sample address: archive.example.org').first()).toBeVisible();
});

test('every site control meets the 44px mobile touch-target baseline', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of ['/', '/demo']) {
    await page.goto(route);
    const undersized = await page.locator('button, input, textarea, .site-header nav a, footer nav a, .demo-banner a').evaluateAll(elements =>
      elements.map(element => {
        const box = element.getBoundingClientRect();
        return { label: (element as HTMLElement).innerText || (element as HTMLInputElement).name || element.getAttribute('aria-label') || element.tagName, width: box.width, height: box.height };
      }).filter(target => target.width > 0 && target.height > 0 && (target.width < 44 || target.height < 44))
    );
    expect(undersized, route).toEqual([]);
  }
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

test('dark treatment has no serious accessibility issues', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
  for (const route of ['/', '/demo', '/privacy', '/terms']) {
    await page.goto(route);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter(v => ['serious', 'critical'].includes(v.impact ?? '')), route).toEqual([]);
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

test('keyboard users can operate demo filters and decisions', async ({ page }) => {
  await page.goto('/demo');
  const deadFilter = page.getByRole('button', { name: /Dead pages/ });
  await deadFilter.focus();
  await page.keyboard.press('Space');
  await expect(page.getByRole('heading', { level: 2, name: 'Dead page' })).toBeFocused();
  const archive = page.getByRole('button', { name: 'Archive' });
  await archive.focus();
  await page.keyboard.press('Enter');
  await expect(archive).toHaveAttribute('aria-pressed', 'true');
});
