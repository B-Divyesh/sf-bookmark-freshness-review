# Independent verification 5 — PASS

**Candidate:** `dc38dbae83e02a7f50c01b35abd3b2eab22f33d4`  
**Verified:** 2026-08-29 UTC  
**Live URL:** <https://bookmark-freshness-review.sociobot.in>  
**Result:** **PASS** — no release-blocking defects identified.

## Cold first read

A fresh desktop and 390 px mobile visit plainly says: “Review old bookmarks before they rot.” It names “researchers with years of saved links” and presents **Try it with sample data** with the immediate outcome “See six checked bookmarks. Nothing touches your archive.”

This answers what it does, who it is for, and what to click first in plain words. The action is one click: it opens `/demo` with six realistic records, a persistent “Demo — sample data, nothing is saved” banner, **Reset demo**, and **Start for real**.

## Clean-clone claims and quality gates

Fresh clone procedure: `git clone`, checkout of the candidate, then `npm ci` (174 packages; 0 audit vulnerabilities). Every command in `.factory/claims.json` was run independently against the shipped demo entry point and passed:

| Claim ID | Result |
| --- | --- |
| `local-demo` | PASS |
| `extension-local-storage` | PASS |
| `site-local-resources` | PASS |
| `status-separation` | PASS |
| `explicit-checks` | PASS |
| `html-import` | PASS |
| `duplicate-detection` | PASS |
| `url-repair` | PASS |
| `credential-free-checks` | PASS |
| `request-spacing` | PASS |
| `html-export` | PASS |
| `paid-license` | PASS |
| `license-token-only` | PASS |
| `checkout-paused` | PASS |

Additional clean-clone results:

- `npm test`: PASS — claim-manifest validation, type/lint, production build, 10 Vitest tests, and 26 Playwright tests. The final Playwright record reports `status: "passed"` and no failed tests.
- `npm run typecheck`: PASS.
- `npm run build`: PASS. Static site JS is 18,505 B raw / 6.82 kB gzip; CSS is 16,186 B raw / 4.42 kB gzip. Extension ZIP is 110,458 B.
- `unzip -t dist/site/downloads/bookmark-freshness-review.zip`: PASS.
- `scripts/verify-url.sh https://bookmark-freshness-review.sociobot.in/`: PASS — title, `lang=en`, one `h1`, one `main`, no missing alt text, no console errors.

The packaged Chromium MV3 extension is covered by the claims and full suite: standard HTML import including nested folders, UTM canonical duplicates, note/URL repair persistence, invalid-file recovery, credential-free checks, 429 and 503 `Retry-After`, 50-attempt enforcement, license removal of that limit, offline edits, export, and demo-sandbox exit are all exercised.

## Live product verification

- Live `/`, `/demo`, `/privacy`, `/terms`, and `/404.html` returned 200 and supplied their own correct titles and one main heading. An unknown route correctly returned HTTP 404 with its styled recovery page.
- The live demo ran a sample check and announced “Six sample checks finished.” It keeps **Dead pages** and **Failed checks** as distinct review groups.
- Browser request capture throughout the home, demo, privacy, terms, and 404 flow contained only `bookmark-freshness-review.sociobot.in` resources. There were no analytics, ads, third-party fonts, archive uploads, page errors, or normal-route console errors.
- Response headers include HSTS, `X-Content-Type-Options: nosniff`, strict-origin referrer policy, restrictive permissions policy, and a self-only CSP with only the documented Sociobot verification origin in `connect-src`. Hashed JS, CSS, and hero assets use one-year immutable caching.
- Desktop and 390 px mobile had no horizontal overflow. A live mobile measurement found no rendered link, button, or file input below 44 × 44 CSS px. Keyboard focus reached visible controls with a 3 px focus outline.
- Playwright Axe scans found zero serious or critical findings on home, demo, privacy, and terms in both light and dark treatments. Reduced-motion emulation showed no active animation.
- Live Lighthouse mobile: Performance **96**, Accessibility **100**, Best Practices **100**, SEO **100**; FCP 1.0 s, LCP 1.4 s, TBT 220 ms, CLS 0.052.

## Privacy, rate limit, and deployment identity

- The claim tests prove demo storage isolation, local extension storage, no hosted archive request, cookie omission for checks, and token-only license verification.
- Fresh direct test of `https://api.sociobot.in/api/v1/products/bookmark-freshness-review/verify` with one client made 40 concurrent invalid-license requests: **30** received HTTP 200 and **10** received HTTP 429. Every observed 429 had `Retry-After: 4`; observed allowance is 30 accepted requests per burst window.
- Live JS SHA-256 matched candidate build: `d9485e16285d6ae5023066fce3c7151f886b2fb93fb391159cef7cf3d554d3fc`.
- Live CSS SHA-256 matched candidate build: `b0688339ff812b7225af0ce3fcf59fef15b97dc016f90dd78cb6e1e6293f2b83`.
- Live downloadable extension ZIP SHA-256 matched candidate build: `e15b3dd5abd4bc2c0e671fc399b05781df98b4290ce9fd947db544771d9fdb5a`.

## Defects by severity

None identified. The browser’s console reports the expected failed document resource when deliberately navigating to an HTTP 404 URL; normal routes, including `/404.html`, have no console errors.

## Scope notes

This artifact is a Chromium MV3 browser extension, not a PWA or hosted backend. PWA service-worker update/offline reload testing and application health/persistence endpoints do not apply. The product has no sign-in flow. New checkout is intentionally paused; no checkout link is exposed, while existing license restoration remains available.
