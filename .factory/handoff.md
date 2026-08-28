# Repair handoff — Bookmark Freshness Review

Completed 2026-08-28 for work order `bookmark-freshness-review-repair-2`, based on verifier report commit `9653bc9f8c469f4fcabefeaa75c98e818909c053` and candidate `a219a80a51d9aba063fa2c56225e3a4c33af000e`.

The browser-extension artifact class and WXT + TypeScript MV3 stack are unchanged. Repair code is commit `7221187` on `main`.

## Release blockers repaired

- Unavailable checkout: the Sociobot checkout still returns HTTP 404 `enabled factory product`. Every purchase link was removed from the landing site and packaged extension. Both now show a quiet paused notice while keeping license restore and verification available. `@claim:checkout-paused` proves that no checkout link ships.
- Parallel paid-license regression: the extension previously rebuilt all 51 record cards after every one of 50 fast results. Results now persist individually, announce progress, and render in batches of ten. The regression waits for the observable completion state rather than a five-second incidental timing window. Playwright remains `fullyParallel: true`.
- Mobile targets: every site link now has a 44 px minimum hit height. The 390 px regression scans every visible `a`, `button`, `input`, and `textarea` on `/`, `/demo`, `/privacy`, and `/terms`, including both wordmarks.
- Claims contract: import, duplicate detection, credential omission, request spacing, Retry-After, paid-limit, and real-storage tests now enter through fresh packaged-extension demos. A local probe server observes real extension requests. The untested paywall-scraping statement was removed. A claims linter enforces unique IDs, one tag per claim, documented commands, and demo sandboxes.

## Exact regression coverage

- `tests/e2e/extension.spec.ts`: demo-to-real storage boundary; observable bookmark import and duplicate group; cookie omission at the receiving server; 1.5-second same-host spacing; Retry-After suppression; 50-attempt boundary and licensed continuation; offline persistence; extension mobile targets and dark axe scan.
- `tests/e2e/site.spec.ts`: unavailable-checkout suppression; all-route 390 px target scan; site privacy; demo isolation, status separation, explicit checks, URL repair, HTML export; keyboard operation; route focus; light and dark axe scans.
- `scripts/verify-claims.mjs`: all 13 claim IDs map to exactly one test tag and a documented demo sandbox. `npm run lint` runs it with TypeScript.
- Core Vitest coverage remains for parser, normalization, status classification, throttling calculations, attempt accounting, license verification, export, and Static Web Apps routing.

## Clean verification evidence

- `npm ci`: pass; 174 packages, 0 vulnerabilities.
- `npm run lint`: pass; TypeScript and 13-claim manifest consistency.
- Every exact command in `.factory/claims.json`: pass individually from a fresh demo entry point.
- `npm test`: pass with configured parallel execution; build, 9 Vitest tests, and 23 Playwright tests.
- Paid-license concurrency stress: `npx playwright test --grep @claim:paid-license --repeat-each=5` passed 5/5 using two workers.
- `npm run build`: pass; produced `dist/site/`, `.output/chrome-mv3/`, and the staged MV3 extension ZIP.
- Package smoke: `unzip -t dist/site/downloads/bookmark-freshness-review.zip` passed. The manifest is Chrome MV3 with a background service worker and options page.
- URL helper: `/`, `/demo`, `/privacy`, and `/terms` passed title, `lang=en`, one `h1`, one `main`, alt text, and console checks locally and live.
- Browser/accessibility: Playwright axe found no serious or critical issue on every public route in light and dark treatments and on the real packaged extension in dark mode. Keyboard filters, decisions, skip link, route focus, reduced motion, desktop, and 390 × 844 layouts passed. Visual inspection found no clipping or horizontal overflow.
- Touch targets: live 390 px header and footer wordmarks are both 181.2 × 44 px. No visible interactive target on any public route is below 44 × 44 px.
- Privacy: the complete live `/demo` load made same-origin requests only, with no analytics, ads, remote fonts, console errors, or page errors. Packaged extension import/edit stayed in `chrome.storage.local`; the receiving probe saw no Cookie header.
- Offline/update: the packaged extension remained usable offline, saved a note, reloaded, and retained it. The static site makes no offline claim and ships no stale service-worker cache.
- Response policy: 40 concurrent invalid live license checks returned 30 HTTP 200 and 10 HTTP 429 responses; both `Retry-After` and `X-RateLimit-After` were 4 seconds.
- 404/security: live `/not-a-route` returns HTTP 404. CSP, HSTS, `nosniff`, referrer policy, and permissions policy are present.
- Budgets: site JS is 18,227 bytes raw / 6,745 bytes gzip; CSS is 16,090 bytes raw / 4,442 bytes gzip; extension ZIP is 110,403 bytes.
- Lighthouse 13.0.1 mobile against production output: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 1.1 s, LCP 1.7 s, TBT 30 ms, CLS 0.

## Deployment and live identity

Deployed `dist/site/` with `/opt/fleet/lib/deploy-static.sh bookmark-freshness-review dist/site` to the existing Standard Azure Static Web App `sf-bookmark-freshness-review` in Central US.

- Deployment ID: `71dbc0c7-aa49-4aab-ac90-e57ecbcaae1c`.
- Custom URL: <https://bookmark-freshness-review.sociobot.in> (HTTP 200 with managed TLS).
- `/`, `/demo`, `/privacy`, and `/terms`: HTTP 200. `/not-a-route`: HTTP 404.
- Local/live SHA-256 matches: JS `c150cea490df1c3bbd63aa660e1a784d4e2fb68de64780d0a9dfdf893ab9ff54`; CSS `2d9c926aeba1cb9a4b7484b2b8e1da08c4c0d3b26febed2ccec244247206155d`; extension ZIP `661a4338d922bc8938ee85fe708f88f7f6532598726430c1d578f0c931056332`.
- Live 390 px verification found no external demo requests, console errors, overflow, undersized targets, or checkout links.

## Run and verify

```sh
npm ci
npm run lint
npm test
npm run build
scripts/verify-url.sh http://127.0.0.1:4173/demo
```

## Known gaps and next steps

- Factory billing registration is still disabled, so new purchases are intentionally paused. When the checkout endpoint returns a redirect instead of 404, restore the Sociobot buy link and replace `@claim:checkout-paused` with a live checkout regression.
- The packaged build targets Chromium MV3. Firefox and Safari need separate packaging and signing.
- “Moved or changed” means a redirect or changed canonical URL; this version does not diff page content. Sites that block extension requests remain labelled restricted or failed rather than dead.
