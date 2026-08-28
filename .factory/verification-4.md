# Independent verification 4 — FAIL

**Candidate:** `5fefc6a3567d2226def3db0b4907464412bcb6f8`  
**Live URL:** <https://bookmark-freshness-review.sociobot.in>  
**Verified:** 2026-08-28 UTC from the clean candidate checkout  
**Result:** **FAIL — do not release**

The live JS, CSS, hero image, and downloadable extension ZIP are byte-for-byte matches for a fresh production build of this candidate. The two release blockers below are therefore candidate defects, not a stale-deployment or deployment-only failure.

## Release-blocking findings

### P1 — standard nested bookmark imports silently assign records to the wrong folder

The packaged extension does not preserve folder context for a common nested Netscape bookmark export. I imported this representative structure through the real extension UI:

```text
Parent
  Parent before
  Child
    Child item
  Parent after
```

The extension stored:

```json
[
  {"title":"Parent before","folder":"Parent"},
  {"title":"Child item","folder":"Child"},
  {"title":"Parent after","folder":"Child"}
]
```

`Parent after` belongs to `Parent`, but is silently moved into `Child`. This is data-integrity loss in the core import job for users with years of organized links. The parser in `src/core/bookmarks.ts:27-53` assigns each anchor to the nearest preceding `<H3>` without following nested `<DL>` scope. The tagged `@claim:html-import` test uses only one flat folder and therefore passes while the public “Imports standard browser bookmark HTML” claim is false for a routine boundary case.

### P1 — the checker ignores `Retry-After` on HTTP 503

Using the real packaged extension and a controlled same-host server, the first URL returned:

```http
HTTP/1.1 503 Service Unavailable
Retry-After: 5
```

The extension requested the next URL on that host **1,505 ms** later, not after five seconds. Both requests reached the server, and the second record became `Alive · 200`.

The implementation in `entrypoints/background.ts:43` records a blocked host only when `statusCode === 429`. HTTP `Retry-After` also applies to 503 responses. This violates the README and privacy-page promise that the checker “honors Retry-After limits” and the researched constraint to honor site limits. The tagged `@claim:request-spacing` test covers only a 429 fixture, so it passes without proving the full claim.

## Mandatory first gates

### First-read and one-click demo — PASS

A cold live visit answers all three required questions in the first viewport:

- What: “Review old bookmarks before they rot.”
- For whom: researchers with years of saved links who need a keep-or-archive pass.
- First action: **Try it with sample data**, next to “See six checked bookmarks. Nothing touches your archive.”

One click opens `/demo`, immediately showing six realistic bookmarks and a persistent **Demo — sample data, nothing is saved** banner with **Reset demo** and **Start for real**.

Measured first-viewport bounds:

| Viewport | Sample CTA bottom | Explanation bottom | Three facts bottom | Result |
| --- | ---: | ---: | ---: | --- |
| 1440 × 900 | 669.4 px | 666.7 px | 859.8 px | PASS |
| 390 × 844 | 552.9 px | 602.3 px | 792.7 px | PASS |

### Required claims — listed commands PASS after clean install; independent outcomes expose two false boundaries

As instructed, I first attempted all commands before any other repository action. The clean checkout had no `node_modules`, so that raw attempt ended on missing `@playwright/test` or `wxt` for all 14 entries. `npm ci` then installed the locked dependencies with zero audit findings. I reran every manifest command independently; all 14 passed:

| Claim | Exact manifest command result |
| --- | --- |
| `local-demo` | PASS — 1 Playwright test |
| `extension-local-storage` | PASS — extension build + 1 Playwright test |
| `site-local-resources` | PASS — 1 Playwright test |
| `status-separation` | PASS — 1 Playwright test |
| `explicit-checks` | PASS — 1 Playwright test |
| `html-import` | PASS — extension build + 1 Playwright test |
| `duplicate-detection` | PASS — extension build + 1 Playwright test |
| `url-repair` | PASS — 1 Playwright test |
| `credential-free-checks` | PASS — extension build + 1 Playwright test |
| `request-spacing` | PASS — extension build + 1 Playwright test |
| `html-export` | PASS — 1 Playwright test |
| `paid-license` | PASS — extension build + 1 Playwright test |
| `license-token-only` | PASS — 1 Playwright test |
| `checkout-paused` | PASS — 1 Playwright test |

The manifest has 14 unique IDs and exactly one matching tag each. Passing narrow fixtures does not cure the two observable claim failures above: nested standard imports and 503 `Retry-After` are both within the words a visitor is asked to rely on.

## Build and repository gates

- `npm ci`: PASS; 174 packages installed, 0 vulnerabilities.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS; TypeScript and 14-claim manifest consistency.
- `npm test`: PASS; exact production build, 9/9 Vitest tests, and 26/26 Playwright tests under the configured two-worker parallel run.
- `npm run build`: PASS; produced `dist/site/`, `.output/chrome-mv3/`, and `dist/site/downloads/bookmark-freshness-review.zip`.
- `unzip -t dist/site/downloads/bookmark-freshness-review.zip`: PASS.
- Extracted the shipped ZIP into a fresh directory and loaded it as a clean Chromium consumer: PASS; the extension opened, imported a record, wrote `archive:v1`, and produced no page error.
- `git diff --check`: PASS before verification documentation was written.

## Independent functional exercise

### Packaged MV3 extension

- Fresh real mode showed a useful import-first empty state and empty storage.
- Invalid text input produced an assertive recovery message: “The file could not be imported. Choose an HTML file exported by your browser.” The live announcer also explained that no HTTP(S) bookmarks were found.
- A malformed bookmark URL became **Check failed** with “This bookmark has an invalid URL.” Correcting it to the controlled local endpoint and checking again recovered to **Moved or changed · 200**.
- Archiving a record excluded it from downloaded Netscape HTML. **Undo** restored `Review later`, and the next export included it again.
- The normal flat import, UTM duplicate detection, folder/timestamp persistence, notes, free-check limit, valid-license behavior, cookie omission, 429 throttling, and offline edit/reload paths pass the repository’s real-extension tests.
- The nested-folder and 503 failures are listed as release blockers.

### Live demo

- Six realistic records cover alive, dead, restricted, moved, duplicate, and failed results.
- Dead pages and failed checks remain separate.
- A note persisted across reload under the sole key `demo:bookmark-freshness-review:v1`.
- Reset restored the sample. **Start for real** downloaded `bookmark-freshness-review.zip`, removed the demo key and banner, and returned to `/`.
- Archive/export and repaired-URL persistence pass the tagged tests.
- No third-party or bookmark request occurred in the demo flow.

## Accessibility, responsive behavior, and visual review

- `scripts/verify-url.sh` passes live `/`, `/demo`, `/privacy`, `/terms`, and `/404.html`: correct route title, `lang=en`, one `h1`, one `main`, no missing alt text, and no console error.
- Independent Axe scans of `/`, `/demo`, `/privacy`, `/terms`, and the real HTTP 404 at `/not-a-route`, at 1440 × 900 and 390 × 844, in light and dark treatments: **0 serious/critical violations** in all 20 combinations.
- Every visible link, button, input, and textarea met 44 × 44 px in those combinations. There was no horizontal overflow.
- Keyboard smoke: first Tab focused the skip link with a visible `3px` lichen outline and `3px` offset; Space activated a review filter and moved focus to its result heading. Decision buttons respond to Enter and expose `aria-pressed` in the suite.
- Reduced motion capped observed transition/animation duration at `0.01 ms`.
- At 390 px with root text enlarged to 200%, the demo stayed at 390 px scroll width with no horizontal overflow.
- Cold desktop and mobile visual inspection found a clear, product-specific concrete-and-moss treatment with no overlap or clipped first action.
- The only console message in the combined route sweep was Chromium’s expected failed-resource entry for deliberately navigating to the HTTP 404. Normal routes had none.

## Privacy, network, security, and routing

- Live normal routes and the full demo made only same-origin runtime requests. No analytics, ads, remote scripts, or third-party fonts were observed.
- Packaged-extension import and edit use `chrome.storage.local`; the claim test observes no hosted request. Link checks omit Cookie, and the license-request test observes one GET containing only `license=<token>`, with no body, archive sentinel, Authorization, or Cookie.
- CSP limits runtime resources to self and connections to self plus `https://api.sociobot.in`. HSTS, `X-Content-Type-Options: nosniff`, strict-origin referrer policy, and restrictive permissions policy are present on 200 and 404 responses.
- `/`, `/demo`, `/privacy`, and `/terms` return 200. Unknown routes return the designed page with HTTP 404. All user-facing normal links resolve to 200; `mailto:` links are explicit. The 404 page’s self-referential skip URL naturally remains 404.
- Hashed assets use `Cache-Control: public, max-age=31536000, immutable`; the ZIP uses a one-hour cache; HTML revalidates after 30 seconds.
- There is no sign-in, so the Microsoft Entra authority requirement is not applicable.
- This is a browser extension, not a PWA. Landing-page service-worker update/offline reload is not claimed. The MV3 background worker and extension offline persistence were exercised.

## Server endpoint rate limit

The only product-used server endpoint is Sociobot license verification. An initial 45-request concurrent burst returned **30 × HTTP 200 and 15 × HTTP 429**, establishing an observed initial threshold of 30 accepted requests. A repeated burst within the window returned 4 × 200 and 41 × 429. Captured 429 responses included:

```text
Retry-After: 2
X-RateLimit-After: 2
```

This gate passes.

## Candidate/live identity, caching, and budgets

Fresh local/live SHA-256 values match:

| Artifact | SHA-256 |
| --- | --- |
| JS `index-btrLuy6H.js` | `3a6cbdfb5a9dec9c93c3fda04342b97480ecb4f723bac729084c5510a655053a` |
| CSS `index-DijPqBzv.css` | `e26d2f8ef2e7846bed76e282494d52fb50ae7854b5587178815e5ffb02657392` |
| Hero `hero-concrete-moss-1280.webp` | `c58beff86835dbe0eab3dfbede9f93386254783dd0d075bed5144b219d325bd5` |
| Downloadable extension ZIP | `aa3d97679b4c5cd9172d7a35ef9485627e5ee6e8d2c971e58d465b798c7f0573` |

Budgets pass: site JS 18,505 B raw / 6.82 KiB gzip; CSS 16,069 B raw / 4.42 KiB gzip; loaded WOFF2 fonts 53,336 B; mobile hero 39,606 B; extension ZIP 110,403 B.

Fresh Lighthouse 13.0.1 mobile results against the live URL: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 1.1 s, LCP 1.5 s, TBT 20 ms, CLS 0.039, total transfer 104 KiB. INP is not available from a navigation-only lab run.

## Required remediation

1. Parse bookmark HTML structurally so folder scope returns to the parent after a nested `<DL>` closes. Add a real packaged-extension claim fixture with a bookmark before, inside, and after a child folder, and assert the stored/exported folders.
2. Honor a valid `Retry-After` header on every applicable response, including HTTP 503. Add a packaged-extension test that returns `503 Retry-After` and proves no same-host follow-up arrives before the limit.
3. Rerun every manifest command, the complete default suite, exact build, clean ZIP smoke, and live parity checks before release.
