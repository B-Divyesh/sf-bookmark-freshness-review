import { chromium } from 'playwright';

const target = process.argv[2];
if (!target) {
  console.error('Usage: ./scripts/verify-url.sh <url>');
  process.exit(2);
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const errors = [];
page.on('console', message => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });
page.on('pageerror', error => errors.push(`page: ${error.message}`));
try {
  const response = await page.goto(target, { waitUntil: 'networkidle' });
  const result = await page.evaluate(() => ({
    lang: document.documentElement.lang,
    title: document.title,
    h1: document.querySelectorAll('h1').length,
    main: document.querySelectorAll('main').length,
    missingAlt: [...document.images].filter(image => !image.hasAttribute('alt')).map(image => image.currentSrc || image.src)
  }));
  if (!response?.ok()) errors.push(`HTTP ${response?.status() ?? 'no response'}`);
  if (!result.lang) errors.push('missing html lang');
  if (!result.title) errors.push('missing title');
  if (result.h1 !== 1) errors.push(`expected one h1, found ${result.h1}`);
  if (result.main !== 1) errors.push(`expected one main, found ${result.main}`);
  if (result.missingAlt.length) errors.push(`images missing alt: ${result.missingAlt.join(', ')}`);
  if (errors.length) throw new Error(errors.join('\n'));
  console.log(`PASS ${target}\n  title: ${result.title}\n  lang: ${result.lang}\n  h1: ${result.h1}; main: ${result.main}; missing alt: 0; console errors: 0`);
} finally {
  await browser.close();
}
