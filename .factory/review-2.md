# Adversarial first-read review 2 — Bookmark Freshness Review

Reviewed 2026-08-29 against commit `1c617dae7d7f75d02603f81b5ccc6cf19738b3db` and the live site at <https://bookmark-freshness-review.sociobot.in>.

## Verdict: FAIL

The cold first screen is clear, the web demo works in one click, every registered claim command passes, earlier review findings remain fixed, and routing/accessibility checks pass. The product still fails because an unverified license is treated as paid when verification cannot connect, and the packaged-extension demo writes a real license outside its demo namespace. One misleading paid heading and three context-free headings also remain. PASS requires zero findings.

## Cold first read

Fresh browser contexts were used at 390 × 844 and 1440 × 900. These answers were recorded before scrolling.

| Question | First-read answer |
| --- | --- |
| What does it do? | It reviews and cleans up old browser bookmarks, including keep, repair, and archive choices. |
| For whom? | Researchers with years of saved links. |
| What should I click first? | **Try it with sample data**. The adjacent copy says it opens a checked sample archive and keeps my archive separate. |

All three answers are visible in the first viewport at both sizes. The mobile viewport also contains all three plain facts. No blocking first-read finding applies.

## Findings

### Blocking

#### F-2-1 — A failed license check accepts any token and removes the paid limit

- Exact location: `entrypoints/options/main.ts`, `init()`, writes `{ token: queryLicense, valid: true, checkedAt: 0 }` before verification. `refreshLicense()` catches a network failure and leaves that value valid. The same optimistic write exists in `site/src/main.ts`, `captureLicense()`.
- Live evidence: with requests to `api.sociobot.in` aborted, opening `/?license=not-a-paid-license` displayed **“Full review is active on this browser.”** and stored `{"token":"not-a-paid-license","valid":true,"checkedAt":0}`.
- Packaged-extension evidence: the same failed-verification path displayed **“Full review active”** and allowed all 51 seeded records to consume a check attempt, although the free limit is 50.
- Why this fails: the page says **“An $18 one-time license removes that limit.”** An arbitrary unverified string removes it whenever verification is unavailable. The passing `@claim:paid-license` test covers only a mocked valid response and misses the denial and network-failure boundaries.
- Concrete fix: never set `valid: true` before a successful verification response. Store a pending token separately, retain only a previously verified cache if offline use is intended, and show a pending/error state. Expand `@claim:paid-license` to test a valid response, an invalid response, and an aborted verification; the last two must stay capped at 50 attempts on reload.

#### F-2-2 — The packaged-extension demo saves a license to real storage

- Exact location: packaged extension `options.html?demo=1`, **“Paste a license”**; `entrypoints/options/main.ts` always writes `LICENSE_KEY` (`sb_license:bookmark-freshness-review`) rather than a `demo:` key. **Reset demo** and **Exit demo** remove only `demo:archive:v1`.
- Reproduction: enter `demo-entered-license` through **Paste a license**, then choose **Exit demo**. `chrome.storage.local` still contains `sb_license:bookmark-freshness-review` with that token and no demo key.
- Why this fails: the banner says **“Demo — sample data, nothing is saved.”** The sandbox contract says nothing done in demo mode may persist to real storage. It can also overwrite a pre-existing real license.
- Concrete fix: hide license entry in demo mode, or use `demo:sb_license:bookmark-freshness-review` and remove it on Reset and Exit. Extend `@claim:local-demo` to exercise the packaged extension with a pre-seeded real archive and real-license sentinel, then verify both are unchanged after license actions, reset, and exit.

### Major

#### F-2-3 — The pricing heading falsely frames the limit as archive size

- Exact quotes: landing paid section **“Review a larger archive for $18”**; packaged extension license panel **“Review larger archives.”**
- Why this fails: the tested restriction is 50 link-check attempts, not archive size. Import, notes, decisions, repair, and HTML export are not capped at 50 bookmarks. A visitor can reasonably read these headings as a charge for importing or reviewing a large archive.
- Concrete fix: use **“Remove the 50-check limit for $18”** on the landing page and **“Link-check limit”** in the extension. Keep the existing tested explanation underneath.

### Minor

#### F-2-4 — “Check and add context” is an abstract step heading

- Exact location: landing, step 2 heading **“Check and add context.”**
- Why this fails: heard in a heading list, it does not say what is checked or what “context” means.
- Concrete fix: **“Check links and add notes.”**

#### F-2-5 — “It does not” does not identify its section

- Exact location: landing privacy aside heading **“It does not.”**
- Why this fails: the heading makes no sense out of context and forces a screen-reader user to inspect the following list.
- Concrete fix: **“What the extension does not do.”**

#### F-2-6 — The demo h1 does not name bookmarks

- Exact location: live `/demo` h1 **“Decide what still belongs.”**
- Why this fails: “what” and “belongs” are vague when the h1 is read alone. The route headline should name the job.
- Concrete fix: **“Decide which bookmarks to keep.”**

## Copy audit

Counts treat hyphenated terms, versions, dates, and prices as one word. Repeated labels are listed once. Structural list numerals are omitted. The generated-image alt text is included. README commands and bare paths inside the code block are not prose; their explanatory sentences are included.

No sentence exceeds 22 words. No banned marketing adjective appears. Terminology is consistent except for the misleading archive-size heading in F-2-3.

### Landing page

| Copy unit | Words | Result |
| --- | ---: | --- |
| Bookmark Freshness Review | 3 | Pass |
| Demo | 1 | Pass |
| How it works | 3 | Pass |
| Privacy | 1 | Pass |
| A local browser extension | 4 | Pass |
| Review and clean up old bookmarks | 6 | Pass |
| For researchers with years of saved links who need clear keep, repair, or archive choices. | 15 | Pass |
| Try it with sample data | 5 | Pass |
| Open a checked sample archive. | 5 | Pass |
| Your archive stays separate. | 4 | Pass |
| Download the Chrome extension | 4 | Pass |
| ZIP · v1.0 | 2 | Pass |
| Archive data stays in your browser. | 6 | Pass |
| Checks start only when you ask. | 6 | Pass |
| Standard HTML export is always free. | 6 | Pass |
| A concrete archive drawer with paper slips and moss, showing an old collection being carefully reviewed. | 16 | Pass |
| Choose whether to keep, repair, or archive each bookmark. | 9 | Pass |
| 01 · Bookmark review preview | 4 | Pass |
| See bookmarks that need a decision | 6 | Pass |
| See saved year, link result, duplicate status, and a note for each bookmark. | 13 | Pass |
| Open the working demo | 4 | Pass |
| Review groups | 2 | Pass |
| Dead pages | 2 | Pass |
| Login or restricted | 3 | Pass |
| Duplicates | 1 | Pass |
| Old lab wiki | 3 | Pass |
| Research methods · saved 2016 | 4 | Pass |
| Dead page | 2 | Pass |
| Journal article | 2 | Pass |
| Sources · saved 2020 | 3 | Pass |
| Data handbook | 2 | Pass |
| Sources · saved 2021 | 3 | Pass |
| Alive | 1 | Pass |
| 02 · How bookmark review works | 5 | Pass |
| Review bookmarks in three steps | 5 | Pass |
| Import bookmark HTML | 3 | Pass |
| Choose a standard browser bookmark HTML file. | 7 | Pass |
| Check and add context | 4 | F-2-4 |
| Start a link check. | 4 | Pass |
| Note the purpose, profile, or login each link needs. | 9 | Pass |
| Keep, repair, or archive | 4 | Pass |
| Fix moved URLs, choose a decision, then export standard HTML. | 10 | Pass |
| 03 · Where bookmark data goes | 5 | Pass |
| Your bookmarks stay in browser storage | 6 | Pass |
| The extension stores bookmarks, notes, and decisions in browser storage. | 10 | Pass |
| The product has no cloud archive. | 6 | Pass |
| Read the privacy details | 4 | Pass |
| It does not | 3 | F-2-5 |
| Upload an archive | 3 | Pass |
| Guess why you saved a link | 6 | Pass |
| Lock export behind payment | 4 | Pass |
| One-time license | 2 | Pass |
| Review a larger archive for $18 | 6 | F-2-3 |
| Free use includes 50 link-check attempts. | 6 | Pass |
| One payment removes that limit on this browser. | 8 | Pass |
| $18 once | 2 | Pass |
| Purchases are paused while checkout is unavailable. | 7 | Pass |
| Restore a license | 3 | Pass |
| Existing licenses still work. | 4 | Pass |
| Full review is active on this browser. | 7 | F-2-1 when verification fails |
| Read the terms. | 3 | Pass |
| Bookmark data stays in browser extension storage. | 7 | Pass |
| Terms | 1 | Pass |
| Built by Param Factory | 4 | Pass |
| opens in a new tab | 5 | Pass |
| v1.0 · build 2026.08.29 | 3 | Pass |
| Generated illustration disclosed in the design notes. | 7 | Pass |

### README

| Copy unit | Words | Result |
| --- | ---: | --- |
| Bookmark Freshness Review | 3 | Pass |
| Review and clean up old bookmarks. | 6 | Pass |
| Bookmark Freshness Review is a Chromium browser extension for researchers and professionals with years of saved links. | 17 | Pass |
| It helps you keep, repair, or archive each bookmark in an imported bookmark archive. | 14 | Pass |
| Live site | 2 | Pass |
| One-click demo | 2 | Pass |
| What it does | 3 | Pass |
| Imports standard browser bookmark HTML. | 5 | Pass |
| Starts link checks only when you ask. | 7 | Pass |
| Keeps dead pages, restricted pages, moved or changed links, and failed checks separate. | 13 | Pass |
| Finds duplicate URLs after removing common tracking parameters. | 8 | Pass |
| Stores why you saved a bookmark or which browser profile it needs. | 12 | Pass |
| Repairs a moved bookmark URL. | 5 | Pass |
| Keeps review decisions and omits archived bookmarks from export. | 9 | Pass |
| Stores imported archives and edits in extension local storage. | 9 | Pass |
| Exports standard HTML without a license, even after the free check limit. | 12 | Pass |
| The free tier includes 50 link-check attempts. | 7 | Pass |
| Retrying a failed check uses another attempt. | 7 | Pass |
| An $18 one-time license removes that limit. | 7 | F-2-1 on failed verification |
| New purchases are paused while checkout is unavailable. | 8 | Pass |
| Existing licenses can still be restored. | 6 | Pass when verification succeeds |
| Install the packaged extension | 4 | Pass |
| Download bookmark-freshness-review.zip from the live site. | 6 | Pass |
| Unzip it into a permanent folder. | 6 | Pass |
| Open chrome://extensions in Chrome or Edge. | 6 | Pass |
| Turn on Developer mode. | 4 | Pass |
| Choose Load unpacked, then select the unzipped folder. | 8 | Pass |
| Open the extension to import a bookmark HTML file. | 9 | Pass |
| The extension requests access to website addresses so it can check the links you select. | 15 | Pass |
| Link checks omit browser credentials. | 5 | Pass |
| The checker spaces requests apart and honors Retry-After limits. | 9 | Pass |
| Develop and verify | 3 | Pass |
| Requires Node.js 22 or newer. | 5 | Pass |
| npm run build:site builds the MV3 extension, packages its ZIP, and writes the deployable site to dist/site/. | 17 | Pass; technical section |
| The deployable landing page is dist/site/index.html. | 6 | Pass |
| Load .output/chrome-mv3/ as an unpacked extension during development. | 8 | Pass |
| The production ZIP is staged at dist/site/downloads/bookmark-freshness-review.zip. | 7 | Pass |
| Project map | 2 | Pass |
| entrypoints/ — WXT MV3 background worker and review interface. | 9 | Pass; technical section |
| src/core/ — bookmark parsing, export, duplicate, status, and license logic. | 10 | Pass |
| site/ — static landing, sandboxed demo, privacy, terms, and 404 routes. | 11 | Pass |
| tests/ — Vitest core tests and Playwright claim and accessibility tests. | 11 | Pass; technical section |
| .factory/ — brief, design system, claims, demo contract, and handoff. | 10 | Pass |
| Privacy and payment | 3 | Pass |
| Imported bookmarks, notes, and decisions stay in browser extension storage. | 10 | Pass |
| Importing or editing an archive makes no hosted request. | 9 | Pass |
| A link check starts only after an explicit action. | 9 | Pass |
| License verification sends only the pasted license token to the Sociobot billing API. | 13 | Pass |
| This site loads no analytics, advertising scripts, or third-party fonts. | 10 | Pass |
| Checkout is not linked while product registration is unavailable. | 9 | Pass |
| See the live privacy page and terms. | 7 | Pass |
| License | 1 | Pass |
| MIT. | 1 | Pass |
| See LICENSE. | 2 | Pass |

### Terminology

| Concept | Observed term | Result |
| --- | --- | --- |
| Imported collection | bookmark archive; archive after first mention | Consistent |
| Network action | link check | Consistent |
| Unsuccessful request | failed check | Consistent |
| Redirect or canonical change | moved or changed | Consistent |
| Review choices | keep, review later, archive | Consistent |
| Paid restriction | 50 link-check attempts versus “larger archive” | F-2-3 |

## Demo and sandbox evidence

- One click on the cold landing CTA reached `/demo`; no setup or account was required.
- At 390 × 844, the first complete `.demo-record` occupied y=444.8 through y=744.4. It showed a realistic title, sample address, saved year, result, note, and Keep/Review later/Archive controls without scrolling.
- The persistent banner contained **“Demo — sample data, nothing is saved”**, **Reset demo**, and **Download extension and exit demo**.
- A web-demo note edit created only `localStorage["demo:bookmark-freshness-review:v1"]`; a seeded `real:sentinel` remained byte-for-byte unchanged.
- Reset removed the demo key and restored the sample. Exit removed the demo key, preserved the sentinel, returned to `/`, and downloaded `bookmark-freshness-review.zip`.
- Every observed web request was same-origin. No bookmark site, analytics, advertising, font CDN, or Sociobot request occurred in the demo flow.
- The packaged-extension demo violates isolation for license storage; see F-2-2.

## Claims execution

The repository was cloned without shared working files to `/tmp/bookmark-review2-clean-7eueCt/repo` at the reviewed commit. `npm ci` installed 174 packages with zero audit findings. Every exact command in `.factory/claims.json` was then run independently.

| Claim ID | Exact command | Registered result | Independent boundary result |
| --- | --- | --- | --- |
| `local-demo` | `npx playwright test --grep @claim:local-demo` | PASS | Web sandbox passes; extension license storage fails F-2-2 |
| `demo-seed` | `npx playwright test --grep @claim:demo-seed` | PASS | PASS |
| `extension-local-storage` | `npm run build:extension && npx playwright test --grep @claim:extension-local-storage` | PASS | PASS |
| `site-local-resources` | `npx playwright test --grep @claim:site-local-resources` | PASS | PASS |
| `status-separation` | `npx playwright test --grep @claim:status-separation` | PASS | PASS |
| `explicit-checks` | `npm run build:extension && npx playwright test --grep @claim:explicit-checks` | PASS | PASS |
| `html-import` | `npm run build:extension && npx playwright test --grep @claim:html-import` | PASS | PASS |
| `duplicate-detection` | `npm run build:extension && npx playwright test --grep @claim:duplicate-detection` | PASS | PASS |
| `url-repair` | `npm run build:extension && npx playwright test --grep @claim:url-repair` | PASS | PASS |
| `decision-persistence` | `npm run build:extension && npx playwright test --grep @claim:decision-persistence` | PASS | PASS |
| `bookmark-ledger` | `npx playwright test --grep @claim:bookmark-ledger` | PASS | PASS |
| `credential-free-checks` | `npm run build:extension && npx playwright test --grep @claim:credential-free-checks` | PASS | PASS |
| `request-spacing` | `npm run build:extension && npx playwright test --grep @claim:request-spacing` | PASS | PASS, including 429 and 503 fixtures |
| `html-export` | `npm run build:extension && npx playwright test --grep @claim:html-export` | PASS | PASS |
| `paid-license` | `npm run build:extension && npx playwright test --grep @claim:paid-license` | PASS | FAIL on verification failure; F-2-1 |
| `license-token-only` | `npx playwright test --grep @claim:license-token-only` | PASS | PASS |
| `checkout-paused` | `npx playwright test --grep @claim:checkout-paused` | PASS | PASS |

No other claim-like landing, README, privacy, or terms sentence lacks a corresponding claim entry. F-2-1 is a missing negative boundary in an existing claim, not an absent manifest entry.

## Earlier-finding history

Every finding in `.factory/review-1.md` was checked against the live site and current source, not accepted from `.factory/polish-1.md` alone.

| Earlier ID | Live and code confirmation | Status |
| --- | --- | --- |
| F-1-1 | The first complete mobile demo record ends at 744.4px in an 844px viewport. | Fixed |
| F-1-2 | `explicit-checks` now loads the packaged extension, waits idle, then observes a request only after the action. | Fixed |
| F-1-3 | `url-repair` now verifies extension storage, reload, and exported HTML. | Fixed |
| F-1-4 | `html-export` seeds 51 unlicensed records at the limit and verifies all exported rows. | Fixed |
| F-1-5 | Merchant-of-record and card-handling promises remain removed. | Fixed |
| F-1-6 | Landing copy now says “standard browser bookmark HTML file” without four-browser compatibility claims. | Fixed |
| F-1-7 | The tagged test selects dead, restricted, moved or changed, and failed groups separately. | Fixed |
| F-1-8 | `decision-persistence` verifies keep/review/archive storage and archive omission from export. | Fixed |
| F-1-9 | Copy limits the paid entitlement to link checks and free HTML export, apart from the separately identified misleading heading in F-2-3. | Fixed; no same-ID regression |
| F-1-10 | The page-content timing promise remains absent. | Fixed |
| F-1-11 | Refund revocation wording remains absent. | Fixed |
| F-1-12 | Cross-device restoration wording remains absent. | Fixed |
| F-1-13 | The exclusive network-destination sentence remains absent. | Fixed |
| F-1-14 | `demo-seed` verifies six checked records and every listed result state. | Fixed |
| F-1-15 | `bookmark-ledger` verifies saved year, result, duplicate status, and note. | Fixed |
| F-1-16 | The web demo test seeds and preserves a real archive sentinel across edit, reset, and exit. | Fixed for the cited archive case; F-2-2 is a distinct extension-license leak |
| F-1-17 | Uninstall-deletion wording remains absent. | Fixed |
| F-1-18 | Browser-settings deletion wording remains absent. | Fixed |
| F-1-19 | Terms use the user obligation “Do not modify the extension…” rather than an impossible guarantee. | Fixed |
| F-1-20 | `/`, `/demo`, `/privacy`, `/terms`, and 404 expose route-specific title, description, canonical, OG, and Twitter metadata. | Fixed |
| F-1-21 | The real HTTP 404 contains the standard nav, footer links, product one-liner, factory link, and build ID. | Fixed |
| F-1-22 | `/privacy` → `/#how` focuses `#how-title` and announces “How bookmark review works.” | Fixed |
| F-1-23 | Landing h1 is “Review and clean up old bookmarks.” | Fixed |
| F-1-24 | Section label is “Bookmark review preview.” | Fixed |
| F-1-25 | Section label is “How bookmark review works.” | Fixed |
| F-1-26 | Section label is “Where bookmark data goes.” | Fixed |
| F-1-27 | Privacy heading is “Your bookmarks stay in browser storage.” | Fixed |
| F-1-28 | Caption names keep, repair, and archive. | Fixed |
| F-1-29 | Footer says bookmark data stays in browser extension storage. | Fixed |
| F-1-30 | Action is “Restore a license.” | Fixed |
| F-1-31 | Demo action is “Download extension and exit demo.” | Fixed |
| F-1-32 | Static and SPA 404 labels say “404 · page not found.” | Fixed |
| F-1-33 | 404 action is “Return to home.” | Fixed |
| F-1-34 | README explains “which browser profile it needs.” | Fixed |
| F-1-35 | README uses bookmark archive/archive consistently. | Fixed |
| F-1-36 | Link check, failed check, and moved or changed remain consistent. | Fixed |

## Structure, links, accessibility, and visual identity

| Check | Result |
| --- | --- |
| Title pattern | PASS: home is `Bookmark Freshness Review — Review bookmarks`; other routes use `Route — Bookmark Freshness Review` |
| One h1 and one main | PASS on `/`, `/demo`, `/privacy`, `/terms`, `/404.html`, and a real HTTP 404 |
| Description, canonical, OG/Twitter, favicon | PASS per route; 404 includes `noindex`, canonical, OG image, SVG icon, and apple-touch icon |
| Designed 404 | PASS: unknown URL returns HTTP 404 with the concrete-and-moss recovery page and standard site skeleton |
| Deep links, back button, route focus | PASS: demo and privacy deep links load; navigation/back focus the h1; `/#how` focuses and announces its h2 |
| Dead-link crawl | PASS: home, demo, `/#how`, privacy, terms, ZIP, Param Factory, robots, and sitemap returned 200; `mailto:` links were excluded |
| Header/footer | PASS on every route |
| Live console and resource smoke | PASS: `scripts/verify-url.sh` found zero console errors on all five public documents |
| Axe | PASS: zero serious/critical findings across 20 route/viewport/theme combinations |
| Mobile targets and overflow | PASS: zero visible controls below 44 × 44px and no horizontal overflow in those combinations |
| Reduced motion | PASS in the source and test suite |
| Build budget | PASS: site JS 19.62kB raw / 6.92kB gzip; CSS 17.19kB raw / 4.62kB gzip |
| Visual identity | PASS: asymmetric concrete-and-moss field-station layout, hard rules/shadows, original archive art, and ledger composition are distinct from a generic SaaS template |

## Quality-gate summary

- Clean clone `npm ci` — PASS; 174 packages, zero vulnerabilities.
- All 17 exact registered claim commands — PASS as written.
- Clean clone `npm test` — PASS: claim/type validation, production build, 10 Vitest tests, and 34 Playwright tests.
- `npm run build` through the suite — PASS; `dist/site/` and the packaged extension ZIP were produced.
- Live `scripts/verify-url.sh` — PASS on `/`, `/demo`, `/privacy`, `/terms`, and `/404.html`.
- Live request log — same-origin only for cold home and the full web-demo edit/reset/exit flow.
- Independent negative license and extension-demo storage probes — FAIL; F-2-1 and F-2-2.

## Missed leverage

No additional AI feature is justified. Link status, duplicate normalization, age grouping, decisions, and HTML import/export are deterministic and local-first. The brief's obvious leverage is already present: standard HTML import/export and an **Older than 2 years** group. Cloud sync would change the stated privacy boundary rather than complete the current job.

## What would make this perfect

Fix the license state machine so only a verified token can activate paid checks, and test invalid and unreachable verification paths. Keep every extension-demo write in a demo namespace or remove license entry from demo mode. Then replace the archive-size pricing heading and the three context-free headings. Rerun all 17 claim commands, the full suite, the 390px demo, and the failed-verification probes. Nothing else remains from this review.
