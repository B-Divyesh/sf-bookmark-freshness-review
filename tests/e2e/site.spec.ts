import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('@claim:local-demo demo keeps bookmark data local', async ({ page }) => {
  const external: string[] = [];
  page.on('request', request => { if (new URL(request.url()).origin !== 'http://127.0.0.1:4173') external.push(request.url()); });
  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('archive:v1', 'REAL ARCHIVE SENTINEL'));
  await page.goto('/demo');
  const demoLedger = page.locator('.demo-ledger');
  await demoLedger.getByLabel('Purpose or browser profile').first().fill('Needs the work profile.');
  await demoLedger.getByLabel('Purpose or browser profile').first().blur();
  expect(await page.evaluate(() => localStorage.getItem('archive:v1'))).toBe('REAL ARCHIVE SENTINEL');
  expect(await page.evaluate(() => localStorage.getItem('demo:bookmark-freshness-review:v1'))).toContain('Needs the work profile.');
  await page.getByRole('button', { name: 'Reset demo' }).click();
  expect(await page.evaluate(() => localStorage.getItem('archive:v1'))).toBe('REAL ARCHIVE SENTINEL');
  await page.getByRole('button', { name: 'Download extension and exit demo' }).click();
  expect(await page.evaluate(() => localStorage.getItem('demo:bookmark-freshness-review:v1'))).toBeNull();
  expect(await page.evaluate(() => localStorage.getItem('archive:v1'))).toBe('REAL ARCHIVE SENTINEL');
  expect(external).toEqual([]);
});

test('desktop and mobile first screens show the sample action, explanation, and three facts', async ({ page }) => {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    const firstScreen = [
      page.getByRole('link', { name: 'Try it with sample data' }),
      page.getByText('Open a checked sample archive. Your archive stays separate.'),
      page.locator('.plain-facts')
    ];
    for (const locator of firstScreen) {
      await expect(locator).toBeVisible();
      const box = await locator.boundingBox();
      expect(box, await locator.textContent() ?? 'first-screen element').not.toBeNull();
      expect(box!.y + box!.height, JSON.stringify(viewport)).toBeLessThanOrEqual(viewport.height);
    }
  }
});

test('Start for real downloads the extension, discards demo data, and exits the sandbox', async ({ page }) => {
  await page.goto('/demo');
  await page.locator('.demo-ledger').getByLabel('Purpose or browser profile').first().fill('This change must be discarded.');
  await page.locator('.demo-ledger').getByLabel('Purpose or browser profile').first().blur();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download extension and exit demo' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('bookmark-freshness-review.zip');
  await expect(page).toHaveURL('/');
  await expect(page.locator('.demo-banner')).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.getItem('demo:bookmark-freshness-review:v1'))).toBeNull();
});

test('@claim:site-local-resources site loads no analytics, advertising scripts, or third-party fonts', async ({ page }) => {
  const external: string[] = [];
  page.on('request', request => {
    if (new URL(request.url()).origin !== 'http://127.0.0.1:4173') external.push(request.url());
  });
  for (const route of ['/', '/demo', '/privacy', '/terms']) await page.goto(route);
  expect(external).toEqual([]);
});

test('@claim:status-separation keeps dead, restricted, moved, and failed checks separate', async ({ page }) => {
  await page.goto('/demo');
  const ledger = page.locator('.demo-ledger');
  await page.getByRole('button', { name: /Dead pages/ }).click();
  await expect(ledger.getByText('Dead page · 404')).toBeVisible();
  await page.getByRole('button', { name: /Failed checks/ }).click();
  await expect(ledger.getByRole('heading', { name: 'Check failed' })).toBeVisible();
  await expect(ledger.getByText('The site did not answer.')).toBeVisible();
  await page.getByRole('button', { name: /Login or restricted/ }).click();
  await expect(ledger.getByRole('heading', { name: 'Login or restricted' })).toBeVisible();
  await expect(ledger.getByText('Open in the work profile. Library login required.')).toBeVisible();
  await page.getByRole('button', { name: /Moved or changed/ }).click();
  await expect(ledger.getByRole('heading', { name: 'Moved or changed' })).toBeVisible();
  await expect(ledger.getByText('Moved or changed · 200')).toBeVisible();
});

test('sample check gives a visible completion message', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.locator('#route-status')).toHaveText('');
  await page.getByRole('button', { name: 'Run sample check' }).click();
  await expect(page.locator('#route-status')).toContainText('Six sample checks finished.');
});

test('demo saves a repaired URL in its sandbox', async ({ page }) => {
  await page.goto('/demo');
  const input = page.locator('.demo-ledger').getByLabel('Bookmark URL').first();
  await input.fill('https://archive.example.org/repaired');
  await input.blur();
  await page.reload();
  await expect(page.getByLabel('Bookmark URL').first()).toHaveValue('https://archive.example.org/repaired');
});

test('demo exports kept bookmarks as standard HTML', async ({ page }) => {
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

test('@claim:demo-seed starts the demo with six realistic checked bookmark records', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.locator('.demo-ledger .demo-record')).toHaveCount(6);
  await expect(page.locator('.demo-ledger .state-alive')).toHaveCount(2);
  await expect(page.locator('.demo-ledger .state-dead')).toHaveCount(1);
  await expect(page.locator('.demo-ledger .state-restricted')).toHaveCount(1);
  await expect(page.locator('.demo-ledger .state-redirected')).toHaveCount(1);
  await expect(page.locator('.demo-ledger .state-failed')).toHaveCount(1);
});

test('@claim:bookmark-ledger shows a saved year, link result, duplicate status, and note', async ({ page }) => {
  await page.goto('/demo');
  const ledger = page.locator('.demo-ledger');
  await expect(ledger.getByText(/saved 2021/).first()).toBeVisible();
  await expect(ledger.getByText('Alive').first()).toBeVisible();
  await page.getByRole('button', { name: /Duplicates/ }).click();
  await expect(ledger.getByText('Duplicate of another bookmark in this sample.')).toBeVisible();
  await expect(ledger.getByLabel('Purpose or browser profile').first()).not.toHaveValue('');
});

test('accepts a valid one-time license return', async ({ page }) => {
  await page.route('https://api.sociobot.in/**', route => route.fulfill({ json: { valid: true, reason: 'ok', expires_at: null } }));
  await page.goto('/?license=test-license');
  await expect(page.getByText('Full review is active on this browser.')).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('sb_license:bookmark-freshness-review'))).toContain('test-license');
});

test('@claim:license-token-only license verification sends only the token and no archive data', async ({ page }) => {
  const requests: Array<{ method: string; url: string; body: string | null; headers: Record<string, string> }> = [];
  await page.route('https://api.sociobot.in/**', async route => {
    const request = route.request();
    requests.push({ method: request.method(), url: request.url(), body: request.postData(), headers: request.headers() });
    await route.fulfill({ json: { valid: true, reason: 'ok', expires_at: null } });
  });
  await page.goto('/demo');
  await page.locator('.demo-ledger').getByLabel('Purpose or browser profile').first().fill('PRIVATE ARCHIVE SENTINEL');
  await page.locator('.demo-ledger').getByLabel('Purpose or browser profile').first().blur();
  await page.goto('/?license=privacy-test-token');
  await expect(page.getByText('Full review is active on this browser.')).toBeVisible();
  expect(requests).toHaveLength(1);
  const requestUrl = new URL(requests[0].url);
  expect(requests[0].method).toBe('GET');
  expect(requests[0].body).toBeNull();
  expect(requestUrl.pathname).toBe('/api/v1/products/bookmark-freshness-review/verify');
  expect([...requestUrl.searchParams.entries()]).toEqual([['license', 'privacy-test-token']]);
  expect(JSON.stringify(requests[0])).not.toContain('PRIVATE ARCHIVE SENTINEL');
  expect(requests[0].headers.authorization).toBeUndefined();
  expect(requests[0].headers.cookie).toBeUndefined();
});

test('@claim:checkout-paused does not link to checkout while product registration is unavailable', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('link', { name: 'Bookmark Freshness Review home' }).click();
  await expect(page.getByText('Purchases are paused while checkout is unavailable.')).toBeVisible();
  await expect(page.locator('a[href*="/checkout"]')).toHaveCount(0);
});

test('demo sample records do not offer placeholder links as live destinations', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.getByText('Open saved page')).toHaveCount(0);
  await expect(page.locator('.demo-record a[target="_blank"]')).toHaveCount(0);
  await expect(page.locator('.demo-ledger').getByText('Sample address: archive.example.org').first()).toBeVisible();
});

test('every site control meets the 44px mobile touch-target baseline', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of ['/', '/demo', '/privacy', '/terms', '/404.html']) {
    await page.goto(route);
    const undersized = await page.locator('a[href], button, input, textarea').evaluateAll(elements =>
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
    if (route === '/demo') {
      const cards = await page.locator('.demo-ledger .demo-record').evaluateAll(elements => elements.map(element => {
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
    }
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
  await page.goto('/privacy');
  await page.getByRole('link', { name: 'How it works' }).click();
  await expect(page.getByRole('heading', { name: 'Review bookmarks in three steps' })).toBeFocused();
  await expect(page.locator('#route-status')).toHaveText('How bookmark review works');
});

test('routes update title, description, canonical, and social metadata', async ({ page }) => {
  await page.goto('/privacy');
  await expect(page).toHaveTitle('Privacy — Bookmark Freshness Review');
  expect(await page.locator('meta[name="description"]').getAttribute('content')).toContain('stores');
  expect(await page.locator('link[rel="canonical"]').getAttribute('href')).toBe('https://bookmark-freshness-review.sociobot.in/privacy');
  expect(await page.locator('meta[property="og:url"]').getAttribute('content')).toBe('https://bookmark-freshness-review.sociobot.in/privacy');
  await page.getByRole('link', { name: 'Demo' }).click();
  await expect(page).toHaveTitle('Demo — Bookmark Freshness Review');
  expect(await page.locator('meta[property="og:description"]').getAttribute('content')).toContain('sample bookmark archive');
});

test('static 404 keeps the site skeleton and complete metadata', async ({ page }) => {
  await page.goto('/404.html');
  await expect(page).toHaveTitle('Page not found — Bookmark Freshness Review');
  await expect(page.locator('header nav')).toBeVisible();
  await expect(page.locator('footer').getByText('Built by Param Factory')).toBeVisible();
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveCount(1);
  await expect(page.locator('meta[property="og:image"]')).toHaveCount(1);
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter(v => ['serious', 'critical'].includes(v.impact ?? ''))).toEqual([]);
});

test('mobile demo stays within the viewport and keyboard focus is visible', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/demo');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const firstRecord = page.locator('.demo-priority .demo-record');
  await expect(firstRecord).toBeVisible();
  const box = await firstRecord.boundingBox();
  expect(box!.y + box!.height).toBeLessThanOrEqual(844);
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
