# Independent verification 2 — FAIL

**Candidate:** `a219a80a51d9aba063fa2c56225e3a4c33af000e`  
**Live URL:** <https://bookmark-freshness-review.sociobot.in>  
**Verified:** 2026-08-28 (UTC)  
**Result:** **FAIL — do not release**

The deployed JS, CSS, and downloadable extension ZIP SHA-256 values match a fresh production build of the candidate. This is therefore a finding against the candidate/live release, not an older deployment.

## First-read test

Cold desktop load in a fresh browser context gave a clear result: this is a local browser extension for researchers with old saved links; it helps them decide which links to keep or archive; the visible first action is **“Try it with sample data”**, which says it will show six checked bookmarks without touching the archive. This requirement passes.

## Release-blocking findings

### P1 — the advertised $18 purchase path is live but returns 404

The live **Buy the full review** link targets:

`https://api.sociobot.in/api/v1/products/bookmark-freshness-review/checkout`

Fresh GET at 15:03 UTC returned **HTTP 404** with `{"error":"enabled factory product","status":404}`. The landing page sells an $18 one-time license, but a user cannot enter checkout. The previous builder handoff calls this factory-owned; it is still a live, user-visible release blocker until the factory enables the product or the paid CTA is removed.

### P1 — required `npm test` fails reproducibly under its configured parallel execution

After clean `npm ci`, the exact default command failed twice:

`npm test` → 17 passed, 1 failed (exit 1)

The failing test is `tests/e2e/extension.spec.ts:39`, `@claim:paid-license enforces 50 attempts and removes the limit for a valid license`. It waits five seconds for `50 of 50 free link checks used…` after processing 50 records and times out. `playwright.config.ts` enables `fullyParallel: true`; running all Playwright tests serially (`npx playwright test --workers=1`) passes 18/18, and the claim passes alone. That establishes a concurrency/timing defect in the mandated quality gate, not a passing suite. The definition of done requires `npm test` to pass.

### P1 — mobile wordmark links miss the 44 px touch-target requirement

On the live `/demo` page at 390 × 844, both interactive wordmark links (header and footer) measured **181.2 × 38 px**. The product and factory accessibility contracts require every touch target to be at least 44 × 44 px. The visible focus style is good, but the hit target is still 6 px too short. The existing target test misses these two links.

### P1 — claims coverage does not meet the demo-sandbox contract

Five user-reliant claims are tested by direct core Vitest tests rather than an observable flow entered from the demo: `html-import`, `duplicate-detection`, `credential-free-checks`, and `request-spacing` (and their test commands do not open the shipped demo). The claims contract requires every claim to be exercised from a fresh demo entry point and asserts observable behavior. In addition, the public landing statement **“It does not scrape paywalled pages”** has no corresponding entry in `.factory/claims.json`. The claims rules classify unlisted claim-like statements as a failed review.

## Required claims

`.factory/claims.json` exists and has 12 distinct IDs, each tagged exactly once. From a clean checkout, the first command invocation correctly could not start before dependencies were installed (`@playwright/test` missing); after the required `npm ci`, every exact listed command passed individually:

| Claim | Result |
| --- | --- |
| `local-demo` | pass |
| `extension-local-storage` | pass |
| `site-local-resources` | pass |
| `status-separation` | pass |
| `explicit-checks` | pass |
| `html-import` | pass |
| `duplicate-detection` | pass |
| `url-repair` | pass |
| `credential-free-checks` | pass |
| `request-spacing` | pass |
| `html-export` | pass |
| `paid-license` | pass alone; fails in required full suite as above |

## Other verification evidence

- `npm ci`: pass; 174 packages, 0 reported vulnerabilities.
- `npm run typecheck`: pass. No lint script is defined. `git diff --check`: pass.
- `npm run build`: pass; produced `dist/site/`, `.output/chrome-mv3/`, and `dist/site/downloads/bookmark-freshness-review.zip` (110,390 bytes). `unzip -t` of the packaged extension passes; it is Chrome MV3 with options and a background worker.
- Serial complete E2E run: `npx playwright test --workers=1` passes 18/18 in 37.3 s. This is diagnostic evidence only; it does not replace the failing default `npm test` gate.
- Demo end-to-end, live: six realistic sample records appear; keyboard Enter selects Dead pages; changing a note persists in the demo namespace; a malformed repaired URL becomes unchecked and leaves the dead filter with a recovery empty state; Reset restores the six shipped samples; export downloads `reviewed-bookmarks.html`.
- Demo privacy: during the complete live demo flow, requests were same-origin only; there were no console or page errors. The demo banner and reset/start-for-real controls are present.
- Accessibility: `scripts/verify-url.sh` passes `/`, `/demo`, `/privacy`, and `/terms` (title, `lang=en`, one `h1`, one `main`, image alt text, no console errors). Playwright Axe scans of all four routes in light and dark color schemes found zero serious/critical violations. Keyboard focus uses a visible 3 px lichen outline. The standalone `npx @axe-core/cli` could not launch in this container because it does not discover Playwright’s Chromium binary; the equivalent installed Playwright Axe integration was used instead.
- Mobile/reduced motion: live demo has no horizontal overflow at 390 px and record controls meet 44 px; reduced-motion transition duration is effectively zero (`0.00001s`). The two wordmark failures above remain.
- Privacy/network: no analytics, ads, remote fonts, or third-party demo requests were observed. CSP is restrictive (`default-src 'self'`; API connect allowance only for Sociobot); HSTS, `nosniff`, referrer and permissions policies are present. There is no sign-in flow.
- Rate limiting: a 45-request concurrent burst to the live license verification endpoint produced **30 × 200, then 15 × 429**. A subsequent request was HTTP 429 with `Retry-After: 2`, `X-RateLimit-After: 2`; observed threshold: 30 requests.
- Caching: hashed JS/CSS/hero assets return `Cache-Control: public, max-age=31536000, immutable`; the downloadable ZIP has a 1-hour cache. Live `/not-a-route` is a styled HTTP 404; `/`, `/demo`, `/privacy`, and `/terms` are 200.
- Bundle budgets: site JS is 18,297 bytes raw / 6,747 gzip; CSS is 15,928 bytes raw / 4,417 gzip; mobile hero is 39,606 bytes; all are within stated budgets. A fresh Lighthouse CLI run could not connect to the container's Playwright Chromium, so no new Lighthouse score is claimed.

## Candidate/live identity

Fresh production output matched the live deployment exactly:

- JS `index-DwZKmd5J.js`: `fd6c2569757847a167e9f14d1d0a9b7893f5e6f9208313ac91cbf42abc5ad2e4`
- CSS `index-JLsGAU_.css`: `65b6d3b27893e4b6afafc65ec6e146d522bca31f04c9d3d01e611c5b5d812eb0`
- Extension ZIP: `53bc25cdee3dede5542de5c2298a9cd295a7bef21feb3299af83581ab3eb159b`

## Remediation before another verification

1. Enable the Sociobot checkout product (or remove the paid CTA until it is enabled) and independently verify checkout redirects.
2. Make the paid-license test reliable under the default parallel `npm test` configuration; do not rely on serial execution.
3. Increase header/footer wordmark link hit boxes to at least 44 px high and extend the touch-target test to all interactive controls.
4. Move every claim test through the fresh demo entry point, and add a claim plus observable test for the no-paywall-scraping statement (or remove that statement).
