# Independent verification 3 — FAIL

**Candidate:** `7da07f3a16b39562bf71ab8ddab052c8e964d594`

**Live URL:** <https://bookmark-freshness-review.sociobot.in>

**Verified:** 2026-08-28 16:14 UTC from the clean candidate checkout

**Result:** **FAIL — do not release**

The deployed JS, CSS, hero image, and downloadable extension ZIP are byte-for-byte matches for a fresh production build of this candidate. These findings are against the candidate/live release, not a stale deployment.

## Release-blocking findings

### P0 — the desktop first screen does not show the first action

The cold page does explain the job and audience: it is a local browser extension that reviews old bookmarks for researchers with years of saved links. However, at 1440 × 900 the required **Try it with sample data** action starts at `y=945.4`, below the 900 px viewport. The three plain facts are below it. The only visible action-like route is a generic header link named **Demo**, with no adjacent explanation of what clicking it does.

This fails the work order's explicit first-read gate and the plain-words/demo requirement that the first screen state what to click first and visibly offer **Try it with sample data**. The issue reproduces in light and dark treatments. At 390 × 844 the action is barely visible at `y=761.4–810.2`, so this is a desktop layout regression rather than missing functionality.

Evidence: [cold desktop screenshot](verification-artifacts/live-cold-desktop.png) and [cold mobile screenshot](verification-artifacts/live-cold-mobile.png).

### P1 — the required default test gate is nondeterministic and failed a tagged claim

The first post-install `npm test` run exited 1: 22 Playwright tests passed and `@claim:request-spacing` failed. The controlled server observed only **1418 ms** between same-host arrivals, below the test's required **1450 ms**:

```text
Expected: >= 1450
Received:    1418
tests/e2e/extension.spec.ts:135:41
```

A second unchanged `npm test` run passed 23/23. That confirms a timing/concurrency flake; it does not cure the failed mandatory quality gate or the failed claim assertion. The implementation records its host timestamp before the fetch, so differing request latency can reduce server-observed spacing below the intended interval.

### P1 — “Start for real” neither exits nor clears the demo sandbox

After changing a demo note and selecting **Start for real**, the ZIP downloads, but the browser remains on `/demo`, the demo banner remains visible, and `localStorage["demo:bookmark-freshness-review:v1"]` still contains the changed note. This violates the supplied demo contract that leaving demo mode discards demo data (or explicitly offers to keep it). It also makes the action label inaccurate: it starts a download but does not leave demo mode.

Observed after the click:

```json
{
  "url": "https://bookmark-freshness-review.sociobot.in/demo",
  "bannerStillVisible": true,
  "keys": ["demo:bookmark-freshness-review:v1"],
  "note": "must be discarded"
}
```

### P1 — the production 404 page misses the 44 px target baseline

The static `/not-a-route` response is correctly HTTP 404, but its separate stylesheet bypasses the site's fixed target sizing. Measurements in both color treatments:

- Desktop wordmark: 345.9 × 36 px.
- Desktop/mobile **Demo**, **Privacy**, and **Terms** links: 24.8 px high.

All visible controls on the four normal routes meet 44 × 44 px. The regression is isolated to the required 404 page, which the repository's mobile target test does not visit.

### P1 — a privacy promise is not registered or observably proved

The privacy page and README promise that a license check sends **only the license token** to Sociobot. No `.factory/claims.json` entry states that promise. `@claim:paid-license` mocks the API response but does not inspect the request URL, body, headers, or absence of archive data. Source inspection indicates the current request is a GET containing the token, but the claims contract requires observable sandbox proof rather than source-only confidence.

## First-read record

- **What it does:** reviews old bookmarks before they rot.
- **For whom:** researchers with years of saved links who need a keep-or-archive pass.
- **What to click first:** not stated by a visible primary action in the 1440 × 900 first viewport; the named sample-data action is 45 px below the fold.
- **One-click demo:** `/demo` works, but the mandated named CTA is not visible on the desktop first screen.

## Required claims gate

`.factory/claims.json` exists with 13 unique IDs and exactly one matching tag each. The initial command attempted before dependency installation could not resolve `@playwright/test`; after the required `npm ci`, every exact manifest command passed individually from its documented demo entry point:

| Claim | Exact listed command result |
| --- | --- |
| `local-demo` | PASS, 1 test |
| `extension-local-storage` | PASS, build + 1 test |
| `site-local-resources` | PASS, 1 test |
| `status-separation` | PASS, 1 test |
| `explicit-checks` | PASS, 1 test |
| `html-import` | PASS, build + 1 test |
| `duplicate-detection` | PASS, build + 1 test |
| `url-repair` | PASS, 1 test |
| `credential-free-checks` | PASS, build + 1 test |
| `request-spacing` | PASS alone, build + 1 test; failed later in `npm test` |
| `html-export` | PASS, 1 test |
| `paid-license` | PASS, build + 1 test |
| `checkout-paused` | PASS, 1 test |

The individual results do not override the release blockers above: the request-spacing claim failed under the repository's required default suite, and the license-request privacy promise is absent from the manifest.

## Build and test evidence

- `npm ci`: PASS; 174 packages installed, 0 reported vulnerabilities.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS; TypeScript and 13-claim manifest verification.
- First `npm test`: **FAIL**, 9/9 Vitest and 22/23 Playwright; request-spacing assertion received 1418 ms instead of at least 1450 ms.
- Second unchanged `npm test`: PASS, 9/9 Vitest and 23/23 Playwright. This demonstrates the flake.
- Exact `npm run build`: PASS; produced `dist/site/`, `.output/chrome-mv3/`, and the staged ZIP.
- `unzip -t dist/site/downloads/bookmark-freshness-review.zip`: PASS.
- `git diff --check`: PASS.

## Independent functional exercise

### Live demo

- Loaded six realistic records and all six review groups.
- Changed a note, reloaded, and observed only `demo:bookmark-freshness-review:v1` in localStorage.
- Ran the sample check and received the completion announcement.
- Confirmed dead (`404`) and failed (`The site did not answer`) results remain separate.
- Archived a record and exported valid Netscape HTML with five anchors; the archived title was absent.
- Reset restored all six samples and removed the demo storage key.
- No external requests, console errors, or page errors occurred in this flow.
- The **Start for real** failure is documented above.

### Fresh packaged MV3 extension

Loaded `.output/chrome-mv3` in a fresh Chromium profile and used the real options page/background worker:

- Demo-to-real transition produced an empty real archive and no residual demo storage.
- A malformed file showed both an alert and a useful recovery instruction.
- A Netscape fixture imported six HTTP(S) bookmarks, their folder and timestamp, and filtered a `javascript:` URL.
- UTM and clean URL variants produced one canonical duplicate.
- Import, note editing, and reload made no hosted request; data used `chrome.storage.local["archive:v1"]`.
- A malformed bookmark URL became **Check failed** with “This bookmark has an invalid URL.” Correcting it and checking again recovered to **Alive · 200**.
- Controlled endpoints produced alive, moved, 404 dead, 403 restricted, and 500 failed outcomes. Receiver logs contained no Cookie header.
- Archive/export excluded the record, Undo restored its review state, and the standard HTML download was valid.
- Offline messaging appeared; note edits persisted across an offline reload.
- No extension console/page errors or unexpected network requests occurred.

## Accessibility and responsive evidence

- Playwright Axe scans on `/`, `/demo`, `/privacy`, `/terms`, and `/not-a-route`, at 1440 × 900 and 390 × 844, in light and dark treatments: **0 serious/critical violations**.
- Normal routes have `lang=en`, route-specific titles, one `h1`, one `main`, ordered headings, alt text, skip links, and no horizontal overflow.
- Keyboard-only smoke: first Tab reveals the skip link with a 3 px lichen focus outline; Space selects a review group and moves focus to its heading; Enter changes a decision with correct `aria-pressed` state.
- Reduced-motion mode matched and reduced maximum transition/animation duration to 0.01 ms.
- A 200% root text-size check at 390 px produced no horizontal overflow or clipped controls.
- Every normal-route control met 44 × 44 px. The static 404 failure is listed above.
- `scripts/verify-url.sh` passes the four normal routes. It fails `/not-a-route` because Chromium logs the intentional document 404 as a failed resource; the 404 still renders a titled, semantic recovery page.

## Privacy, security, routing, and service boundaries

- All initial and complete demo-flow requests were same-origin; no analytics, advertising scripts, remote fonts, or trackers were observed.
- CSP limits scripts/styles/fonts to self and connections to self plus the Sociobot API. HSTS, `nosniff`, strict-origin referrer policy, and a restrictive permissions policy are present.
- Hashed JS/CSS/images use one-year immutable caching. The ZIP uses a one-hour cache; HTML uses a 30-second revalidation window.
- All user-facing links across normal routes resolved with HTTP 200, except explicit `mailto:` links. The external Param Factory link returned 200.
- `/`, `/demo`, `/privacy`, and `/terms` return 200; unknown paths return the designed static page with HTTP 404. `robots.txt` and `sitemap.xml` are present and valid.
- License API burst: 45 rapid requests returned **30 × 200** and **15 × 429**. Every 429 carried `Retry-After: 4` and `X-RateLimit-After: 4`; observed threshold is 30 accepted requests per burst window.
- No sign-in exists, so the Entra authority requirement is not applicable.
- This is an MV3 browser extension, not a PWA; service-worker offline-update testing for the landing site is not applicable. Extension background-worker and offline persistence were exercised.

## Deployment identity and budgets

Fresh local/live SHA-256 matches:

- JS `index-D7GYavJ8.js`: `c150cea490df1c3bbd63aa660e1a784d4e2fb68de64780d0a9dfdf893ab9ff54`
- CSS `index-CyZKYlKF.css`: `2d9c926aeba1cb9a4b7484b2b8e1da08c4c0d3b26febed2ccec244247206155d`
- Hero `hero-concrete-moss-1280.webp`: `c58beff86835dbe0eab3dfbede9f93386254783dd0d075bed5144b219d325bd5`
- Extension ZIP: `661a4338d922bc8938ee85fe708f88f7f6532598726430c1d578f0c931056332`

Budgets pass: JS 18,227 B raw / 6,799 B gzip; CSS 16,090 B raw / 4,451 B gzip; loaded WOFF2 fonts total 53,336 B; mobile hero 39,606 B; ZIP 110,403 B. Lighthouse 13.0.1 mobile against live returned Performance 93, Accessibility 100, Best Practices 100, SEO 100; FCP 1.1 s, LCP 1.4 s, TBT 340 ms, CLS 0, total transfer 104 KiB.

## Required remediation

1. Keep the exact sample-data CTA and its explanatory sentence inside the desktop first viewport at common viewport heights.
2. Make same-host throttling and its tagged test deterministic under the default two-worker `npm test` run; measure the guaranteed boundary consistently.
3. Make **Start for real** explicitly leave/discard the demo sandbox, or rename it to the action it performs and add a separate discard transition.
4. Apply the 44 px target rule to the static 404 page and include that deployed page in the mobile target regression.
5. Register and inspect-test the promise that license checks send only the token and no archive data.
