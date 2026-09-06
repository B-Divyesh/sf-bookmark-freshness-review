# Review old bookmarks — independent review 4

Reviewed 2026-09-06 UTC for work order `bookmark-freshness-review-review-4`.

- Live URL: <https://bookmark-freshness-review.sociobot.in>
- Implementation candidate: `ea570e81be80e20a8206902995188154c994b942`
- Documentation commit reviewed: `97e30fb303c367e2c17be3dbb94aa7ecaa76e3dd`

## Verdict: FAIL

There are **6 findings**: 5 major and 1 minor. There are **3 public claims without the required manifest-tagged tests**. PASS requires zero findings and zero untested claims.

All 17 declared claim commands pass, and the live files match the clean build. Those passes do not cover the findings below.

## First screen before scrolling

Fresh 1440 × 900 desktop and 390 × 844 phone contexts were opened at scroll position zero.

| Question | Answer visible before scrolling |
| --- | --- |
| Job | Review and clean up old bookmarks, then choose keep, repair, or archive. |
| Audience | Researchers with years of saved links. |
| First action | **Try it with sample data**. The next text says it opens a checked sample archive and keeps the real archive separate. |

Both first screens also show the three facts about browser storage, user-started checks, and free HTML export. The language is direct and contains none of the supplied banned words.

## Findings

### Major — F-4-1: Restoring a license on the site does not unlock the extension

The live paid section offers **Restore a license** and then says **Full review is active on this browser.** The browser extension keeps licenses in `chrome.storage.local`; the site writes a different value in the site's `localStorage`. Browser origin isolation prevents that site value from unlocking the extension.

Evidence from one fresh Chromium profile with the live downloadable ZIP installed:

1. A successful mocked verification on the live site displayed **Full review is active on this browser.**
2. The site stored `sb_license:bookmark-freshness-review` in site storage.
3. The installed extension still displayed **Link-check limit**.
4. Neither the real nor demo extension license key existed.

This is an incomplete end-to-end test of the registered `paid-license` claim. Its packaged-extension test proves that pasting a valid token inside the extension works, while a separate site test proves only that the site stores a token. No test proves the public site action unlocks the product.

Fix: remove the site-side activation message and direct users to paste the license inside the extension, or provide an explicit secure transfer that the extension consumes. Add one test that begins with the public restore action and ends with the extension's 50-check limit removed.

### Major — F-4-2: Core keyboard actions discard focus

The live demo and installed extension replace their complete app markup after record changes. The activated control disappears, and keyboard focus falls to `<body>`.

- Live `/demo`: focus **Archive**, press Enter, and the decision changes, but `document.activeElement` becomes `BODY`.
- Live `/demo`: focus **Run sample check**, press Enter, and the completion message appears, but focus becomes `BODY`.
- Installed live ZIP: focus a record's exact **Archive** button and press Enter. The button changes to `aria-pressed="true"`, but focus becomes `BODY`.

A keyboard user must restart from the skip link and traverse the page after each decision. Axe does not detect this interaction failure.

Fix: update the changed record in place or restore focus to the corresponding replacement control after rendering. Preserve a useful focus target after async checks. Add exact focus assertions after record, note, URL, reset, and check actions.

### Major — F-4-3: The offline behavior is absent from the claims manifest

The installed extension publicly says: **You are offline. Notes and decisions still work. Link checks will fail until you reconnect.** `.factory/claims.json` has no offline claim or exact tagged command.

The default suite contains an untagged offline test and it passed in this review. Incidental suite coverage does not meet the contract that every public claim has one manifest entry and one `@claim:<id>` test.

Fix: register the claim and tag its existing fresh-context browser test, including offline reload and recovery after reconnecting.

### Major — F-4-4: The retry-cost claim is absent from the claims manifest

README and `/terms` say: **Retrying a failed check uses another attempt.** No claim entry names that behavior. A unit test counts two failed attempts, but it is not a registered observable claim test.

Fix: register this claim and add a tagged packaged-extension test that retries one failed bookmark and verifies the displayed used-attempt count increases by one.

### Major — F-4-5: The stale-bookmark group is absent from the claims manifest

The extension exposes **Older than 2 years** as a review group. This is a core brief feature and a public functional claim. The manifest has no matching claim. A unit test covers the date helper, but no tagged installed-extension test proves the group shown to a user.

Fix: register the claim and add a tagged packaged-extension test with records immediately below, at, and above the two-year boundary.

### Minor — F-4-6: The phone demo duplicates an interactive record before its section heading

At 390 px, `.demo-priority` renders a complete editable copy of the first bookmark before the **Review groups** and **All bookmarks** `h2` elements. The same bookmark and controls appear again in the six-record ledger. The accessible heading order starts `h1` → record `h3` → `h2`, contrary to the required ordered outline.

The compact copy does meet the visual first-screen requirement, but screen-reader and keyboard users encounter the same bookmark twice and hear an `h3` before its section heading.

Fix: use one responsive record instance, or make the compact preview non-interactive and hidden from the accessibility tree while keeping one correctly headed interactive record. Add mobile assertions for heading order and unique form controls.

## Demo and data isolation

- One click on **Try it with sample data** opened `/?demo=1` with six realistic records.
- The 390 × 844 first demo screen showed the persistent **Demo — sample data, nothing is saved** label, Reset, Exit, and a complete sample record. Its bottom edge was 818.06 px.
- The records cover alive, dead, restricted, moved or changed, duplicate, and failed results.
- Editing a note and decision created only `localStorage["demo:bookmark-freshness-review:v1"]`.
- **Reset demo** removed the demo key and restored the original note.
- **Download extension and exit demo** removed demo state, returned home, and downloaded `bookmark-freshness-review.zip`.
- Pre-seeded real archive and license values remained byte-for-byte unchanged through edit, reset, and exit.
- `/?demo=1&license=...` stripped the license parameter, stored no license, and made no external request.
- The live sample flow made only same-origin requests and produced no console error.

## Declared claims

A fresh clone was checked out at documentation commit `97e30fb303c367e2c17be3dbb94aa7ecaa76e3dd`. `npm ci` installed 174 packages with zero audit findings. Every exact command in `.factory/claims.json` ran independently.

| Claim | Result |
| --- | --- |
| `local-demo` | PASS |
| `demo-seed` | PASS |
| `extension-local-storage` | PASS |
| `site-local-resources` | PASS |
| `status-separation` | PASS |
| `explicit-checks` | PASS |
| `html-import` | PASS |
| `duplicate-detection` | PASS |
| `url-repair` | PASS |
| `decision-persistence` | PASS |
| `bookmark-ledger` | PASS |
| `credential-free-checks` | PASS |
| `request-spacing` | PASS |
| `html-export` | PASS |
| `paid-license` | PASS as written; incomplete end-to-end scope in F-4-1 |
| `license-token-only` | PASS |
| `checkout-paused` | PASS |

The three missing claim entries in F-4-3 through F-4-5 are counted as untested claims under the claims contract, even though the default suite contains partial or untagged coverage.

## Installed extension and recovery paths

The live ZIP was unpacked and loaded as an MV3 extension in a fresh Chromium profile.

- Clean start showed the import action and one-click sample action.
- Sample mode showed six populated records and used only `demo:archive:v1`.
- An invalid HTML file showed an alert that explains which file to choose next.
- A valid Netscape bookmark file imported with its title, folder, and timestamp.
- The imported record survived closing and relaunching the browser profile.
- With the browser offline, the notice appeared and a note edit survived reload.
- The ZIP passed `unzip -t`.

The complete suite also covers empty groups, canonical duplicates, URL repair, all three decisions, undo, 429 and 503 `Retry-After`, the 50-attempt boundary, invalid and unreachable licenses, credential omission, and HTML export.

## Accessibility, structure, privacy, and performance

- `/`, `/?demo=1`, `/demo`, `/privacy`, `/terms`, and `/404.html` pass `scripts/verify-url.sh`.
- Light and dark Axe scans at desktop and phone sizes found zero serious or critical automated violations on every public route and the designed 404.
- All routes have `lang="en"`, one `h1`, one `main`, route-specific titles and metadata, a skip link, header, footer, and no missing image alt text.
- Every visible phone control measured at least 44 × 44 CSS px. No route had horizontal overflow.
- Visible focus uses a 3 px outline with a 3 px offset. Tab, Enter, Space, route focus, Back, and the skip link work apart from F-4-2.
- Reduced-motion mode had no running animations. A 200% text-size check had no horizontal overflow or lost main content.
- All discovered HTTP links returned 200. `mailto:` links were inspected but not requested.
- An unknown route returned the expected HTTP 404 with the designed recovery page. Its browser resource error is expected and is not a defect.
- `robots.txt` and `sitemap.xml` returned 200 and list the public routes.
- Security headers include CSP with `frame-ancestors 'none'`, HSTS, nosniff, strict-origin referrer policy, and a restrictive permissions policy.
- Live mobile Lighthouse: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 1.1 s, LCP 1.4 s, TBT 20 ms, CLS 0.037.
- Site JavaScript is 20,453 bytes raw / 7.12 kB gzip; CSS is 17,185 bytes raw / 4.62 kB gzip. The 720 px hero is 39,606 bytes.
- The license verification endpoint accepted 30 requests in a 40-request burst and returned 10 HTTP 429 responses. Every 429 included `Retry-After: 4`.

No site offline or service-worker update claim is made. This is a browser extension with a static site, not a product backend, so tenant isolation, product SQLite persistence, and product health endpoints do not apply.

## Build and live identity

The last implementation change is `ea570e81be80e20a8206902995188154c994b942`. Commits after it change only factory reports and evidence. The reviewed documentation commit is `97e30fb303c367e2c17be3dbb94aa7ecaa76e3dd`.

| Artifact | SHA-256 | Live matches clean build |
| --- | --- | --- |
| Site JavaScript | `44e420251ed203f36d68a92dae98aa231be8ce7ecc4d20e9cfdb4c49b6096f8e` | Yes |
| Site CSS | `84fa431223f687055ebc33e7b4db2b65a0921ea0aa2ea8052f05d3a2cdbb5086` | Yes |
| Extension ZIP | `20444454f255a87640a3083e1ffe1779e48af4c5b7fb4bfa09c26bfb51d59232` | Yes |

`npm test` passed from the clean checkout: claim validation, typecheck, production build, 10 Vitest tests, and 38 Playwright tests. `npm run build` produced `dist/site/` and the packaged extension.

## Earlier findings

Every earlier finding was checked against the current live files, clean tests, or current public copy. Earlier report statements alone were not treated as proof.

| Earlier ID | Current evidence | Disposition |
| --- | --- | --- |
| F-1-1 | The complete phone sample record ends at 818.06 px in an 844 px viewport. | Fixed |
| F-1-2 | `explicit-checks` observes no saved-site request before the extension action. | Fixed |
| F-1-3 | `url-repair` checks extension storage, reload, and exported HTML. | Fixed |
| F-1-4 | `html-export` exports 51 kept records after the free limit. | Fixed |
| F-1-5 | Merchant and card-handling promises remain absent while checkout is paused. | Fixed |
| F-1-6 | Public copy says standard browser bookmark HTML without unsupported browser-format claims. | Fixed |
| F-1-7 | Dead, restricted, moved or changed, and failed results remain distinct. | Fixed |
| F-1-8 | Keep, review later, and archive persist; archived records are omitted from export. | Fixed |
| F-1-9 | The paid boundary remains the 50-check limit; HTML export remains free. | Fixed |
| F-1-10 | The page-content timing promise remains absent. | Fixed |
| F-1-11 | The refund-revocation promise remains absent. | Fixed |
| F-1-12 | The cross-device restoration promise remains absent. | Fixed |
| F-1-13 | The exclusive network-destination promise remains absent. | Fixed |
| F-1-14 | `demo-seed` verifies six source records and every result state. | Fixed |
| F-1-15 | `bookmark-ledger` verifies year, result, duplicate status, and note. | Fixed |
| F-1-16 | Web and extension demo sentinel tests preserve real archive and license data. | Fixed |
| F-1-17 | The browser-uninstall deletion promise remains absent. | Fixed |
| F-1-18 | The browser-settings deletion promise remains absent. | Fixed |
| F-1-19 | Terms state a user obligation instead of an impossible throttle guarantee. | Fixed |
| F-1-20 | Titles, descriptions, canonicals, Open Graph, and Twitter metadata remain route-specific. | Fixed |
| F-1-21 | The HTTP 404 retains navigation, footer, legal links, factory credit, and build ID. | Fixed |
| F-1-22 | Privacy → How it works focuses and announces the target; Back restores the privacy heading. | Fixed |
| F-1-23 | The landing `h1` is “Review and clean up old bookmarks.” | Fixed |
| F-1-24 | The preview label remains “Bookmark review preview.” | Fixed |
| F-1-25 | The process label remains “How bookmark review works.” | Fixed |
| F-1-26 | The privacy label remains “Where bookmark data goes.” | Fixed |
| F-1-27 | The privacy heading names browser storage. | Fixed |
| F-1-28 | The illustration caption names keep, repair, and archive. | Fixed |
| F-1-29 | Every footer states where bookmark data is stored. | Fixed |
| F-1-30 | The action remains “Restore a license.” F-4-1 concerns what that action actually unlocks. | Fixed wording; new functional finding |
| F-1-31 | The demo exit action names the download and discards demo state. | Fixed |
| F-1-32 | The 404 label remains “404 · page not found.” | Fixed |
| F-1-33 | The 404 action remains “Return to home.” | Fixed |
| F-1-34 | Public copy uses “browser profile.” | Fixed |
| F-1-35 | Imported collections use “bookmark archive,” then “archive.” | Fixed |
| F-1-36 | Link check, failed check, and moved or changed remain consistent. | Fixed |
| F-2-1 | Invalid, unreachable, and unverified licenses do not activate paid state. | Fixed; F-4-1 is the separate site-to-extension handoff gap |
| F-2-2 | Demo archive and license keys remain demo-prefixed and are removed on Reset and Exit. | Fixed |
| F-2-3 | Pricing names the 50-check limit rather than archive size. | Fixed |
| F-2-4 | The step heading remains “Check links and add notes.” | Fixed |
| F-2-5 | The section heading remains “What the extension does not do.” | Fixed |
| F-2-6 | The demo `h1` remains “Decide which bookmarks to keep.” | Fixed |

## Missed feature check

No AI feature is justified. Link status, duplicate normalization, age grouping, decisions, and HTML import/export are deterministic and local-first. Hosted sync would conflict with the brief's privacy boundary.

## Required next work

Repair the license handoff, preserve keyboard focus after rerenders, remove the duplicate mobile form and heading skip, and register the three missing public claims with tagged observable tests. Then rerun every exact claim command, the full suite, the installed live ZIP flow, and the live parity checks.
