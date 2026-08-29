# Adversarial first-read review 1 — Bookmark Freshness Review

Reviewed 2026-08-29 against commit `fd6a9098b19111a71cf227d9b05ff6c56ab8cf88` and the live site at <https://bookmark-freshness-review.sociobot.in>.

## Verdict: FAIL

The cold landing screen is clear, the live demo is isolated, all 14 registered claim commands pass, and the prior dark-mode regression is fixed. The product still has one blocking mobile-demo defect, three blocking claim-test gaps, unlisted public claims, copy that violates the supplied plain-words rules, and incomplete route metadata. PASS requires zero findings.

## Cold first read

Fresh contexts were used at 390 × 844 and 1440 × 900. No scrolling occurred before these answers were recorded.

| Question | First-read answer |
| --- | --- |
| What does it do? | It reviews old browser bookmarks, checks their condition, and helps me keep or archive them. |
| For whom? | Researchers and other people with years of saved links. |
| What should I click first? | **Try it with sample data**. The adjacent copy says I will see six checked bookmarks and my archive will not be touched. |

All three questions are answered on both first screens. This part is not blocking. Evidence: [mobile cold screen](review-1-artifacts/cold-mobile.webp) and [desktop cold screen](review-1-artifacts/cold-desktop.webp).

## Findings

### Blocking

#### F-1-1 — The mobile demo does not show a sample bookmark in its first screen

- Exact location: live `/demo`, 390 × 844. The viewport ends after **“Review groups”** and the six filter counts. No bookmark title, saved address, status reason, note, or decision control is visible.
- Why this fails: the required first screen after one click must already show realistic sample data being used. Counts labelled `1` are navigation, not a worked bookmark example. A phone visitor must scroll before seeing what the product actually does.
- Concrete fix: place one compact sample record immediately below the demo heading, or reduce the heading/filter height so one full record with title, URL, result, note, and Keep/Review later/Archive controls fits within 390 × 844. Add a Playwright assertion that the first `.demo-record` bottom edge is within the viewport after entering `/demo` from `/`.
- Evidence: [mobile demo screen](review-1-artifacts/demo-mobile.webp).

#### F-1-2 — The “checks start only when you ask” claim is not tested in the extension

- Exact quote/location: landing **“Checks start only when you ask.”**; README **“Checks links only after you start a review.”**; claim `explicit-checks` says these locations are covered.
- Why this fails: its tagged test opens the marketing-site `/demo` and observes a 350 ms sample timer. It never loads the packaged extension or proves that imported bookmark URLs remain untouched until the extension’s check action is invoked.
- Concrete fix: move `@claim:explicit-checks` to a packaged-extension test. Import a fixture, record all requests for a short idle interval, assert none target saved sites, click **Check visible links**, then assert the expected request occurs. The site-demo animation may remain a separate UI test.

#### F-1-3 — The URL-repair claim is not tested in the extension

- Exact quote/location: landing **“Fix moved URLs”**; README **“Repairs URLs and records keep, review, or archive decisions.”**; claim `url-repair` includes “extension” in `where`.
- Why this fails: the tagged test edits a plain `<input>` in the marketing demo and checks `localStorage`. It does not prove that the packaged extension saves a repaired URL to `chrome.storage.local` or exports that repaired URL.
- Concrete fix: load the packaged extension, edit an imported bookmark URL, reload, verify the value in `chrome.storage.local`, export HTML, and assert the repaired URL is in the file. Tag that test `@claim:url-repair`.

#### F-1-4 — “HTML export is always free” is not tested on the paid product surface

- Exact quote/location: landing and extension first screen **“Standard HTML export is always free.”**; README **“Export is always free.”**
- Why this fails: `@claim:html-export` downloads from the marketing demo, which has no license gate. It does not prove that an unlicensed packaged extension at or beyond the 50-check limit can export. Another test happens to export during `@claim:html-import`, but the claims contract requires the tagged export test to assert the promised entitlement.
- Concrete fix: in `@claim:html-export`, load an unlicensed packaged extension, seed at least 51 records and an exhausted check count, export, and verify the Netscape header and all kept records.

### Major

#### F-1-5 — Payment-handling claims are unlisted and cannot be verified while checkout is absent

- Exact quotes/locations: README **“Sociobot and Dodo handle one-time purchases as merchant of record.”** and **“The product never receives card details.”**; `/privacy` **“Sociobot and Dodo are the merchant of record.”**, **“Their checkout receives the payment details needed to complete a purchase.”**, and **“This product never receives card details.”**
- Why this fails: no `claims.json` entry tests the payment data path. `checkout-paused` proves only that no checkout link is shown.
- Concrete fix: remove these sentences while checkout is unavailable. When checkout is enabled, add one billing-flow claim that records destinations and request bodies and proves the product origin never receives card data. Plain rewrite for later: **“Sociobot and Dodo process payments, receipts, and refunds. Card details go to their checkout, not this extension.”**

#### F-1-6 — Four-browser import compatibility is an unlisted claim

- Exact quote/location: landing How it works: **“Choose the standard HTML file from Chrome, Firefox, Safari, or Edge.”**
- Why this fails: `html-import` uses one hand-written Netscape fixture; it does not cover exports produced by all four named browsers.
- Concrete fix: either add fixtures exported by each named browser to `@claim:html-import`, or rewrite to **“Choose a standard browser bookmark HTML file.”**

#### F-1-7 — The README promises four separated result classes, but the claim covers two

- Exact quote/location: README: **“Keeps dead pages, restricted pages, moved links, and failed checks separate.”**
- Why this fails: claim `status-separation` and its tagged test assert only dead pages versus failed checks.
- Concrete fix: expand the claim and tagged test to select and verify dead, restricted, moved, and failed groups, including a distinct reason for each; otherwise narrow the README sentence to **“Keeps dead pages and failed checks separate.”**

#### F-1-8 — Persisted review decisions are an unlisted claim

- Exact quote/location: README: **“Repairs URLs and records keep, review, or archive decisions.”**
- Why this fails: no claim entry asserts that all three decisions persist in the packaged extension and affect export.
- Concrete fix: add a `decision-persistence` claim that sets each decision, reloads, verifies `chrome.storage.local`, and confirms archived items are omitted from export.

#### F-1-9 — Free notes, decisions, and repairs are an unlisted entitlement claim

- Exact quote/location: README: **“Notes, decisions, repair, and export remain free.”**
- Why this fails: `paid-license` proves that a valid mocked license removes the check limit. It does not assert that these four operations remain available without a license after the limit is exhausted.
- Concrete fix: add one unlicensed packaged-extension claim covering all four operations at the limit, or replace the sentence with a tested statement such as **“The 50-attempt limit applies only to link checks.”** and test that exact boundary.

#### F-1-10 — The page-content timing privacy promise is unlisted

- Exact quote/location: README: **“It does not read page content until a check starts.”**
- Why this fails: no claim entry observes extension requests or response-body access before and after the check action. The site-only `explicit-checks` test does not cover this.
- Concrete fix: add a packaged-extension privacy claim with a controlled fixture server: assert no request before the action, then assert the response is read only after the action. Remove the sentence if response-body access cannot be observed reliably.

#### F-1-11 — Refund revocation is an unlisted billing claim

- Exact quote/location: `/terms`: **“Approved refunds revoke the associated license.”**
- Why this fails: no claim or fixture tests refund-to-license revocation.
- Concrete fix: remove the sentence until checkout exists, or add a recorded billing fixture that changes a verified license from active to revoked after a refund event.

#### F-1-12 — Cross-device license restoration is an unlisted claim

- Exact quote/location: `/terms`: **“Paste the license into another device to restore a purchase.”**
- Why this fails: `paid-license` verifies a token in one extension profile; it does not restore the same license in a second clean profile.
- Concrete fix: add a claim test that verifies one token in two clean packaged-extension profiles, or rewrite to the narrower tested behavior.

#### F-1-13 — The exclusive network-destination claim is unlisted

- Exact quote/location: landing: **“A link check contacts only the site for that link.”**
- Why this fails: `credential-free-checks` proves that one fixture request has no Cookie header. It does not assert that the whole check flow contacts no other origin.
- Concrete fix: add a claim that records every packaged-extension request during a check and permits only the saved URL origin plus extension resources.

#### F-1-14 — The quantitative six-bookmark demo claim is unlisted

- Exact quote/location: landing: **“See six checked bookmarks.”**
- Why this fails: no `claims.json` entry owns the count and initial checked state. Untagged tests do not satisfy the one-tagged-test claim contract.
- Concrete fix: add `demo-seed` with a tagged test asserting six realistic records and all promised result types, or rewrite to **“See checked sample bookmarks.”**

#### F-1-15 — The ledger feature sentence is an unlisted composite claim

- Exact quote/location: landing: **“Health, age, duplicates, and your notes meet in one local ledger.”**
- Why this fails: it promises four visible data classes, while no single listed claim or tagged test verifies the ledger presentation or age value.
- Concrete fix: rewrite plainly to **“See each bookmark’s saved year, link result, duplicate status, and note.”** Add a tagged product-view test for those four fields.

#### F-1-16 — The demo-isolation test does not protect pre-existing real storage

- Exact quote/location: landing **“Nothing touches your archive.”** and banner **“Demo — sample data, nothing is saved.”**
- Why this fails: `@claim:local-demo` starts with empty storage and asserts that the only resulting key is `demo:`. It cannot detect a regression that reads, overwrites, or deletes a pre-existing real key. The live manual check passed with a sentinel, but the registered regression test is incomplete.
- Concrete fix: seed a non-demo sentinel before entering `/demo`; edit, reload, reset, and exit; assert the sentinel value never changes and the demo key is removed on exit.

#### F-1-17 — Uninstall deletion is an unlisted privacy claim

- Exact quote/location: `/privacy`: **“Remove the extension to delete its local storage.”**
- Why this fails: no claim test uninstalls the packaged extension and confirms deletion.
- Concrete fix: add an uninstall/reinstall profile test if this promise is retained, or use browser-qualified wording that links to Chrome’s documented behavior.

#### F-1-18 — Browser-settings deletion is an unlisted privacy claim

- Exact quote/location: `/privacy`: **“You can also clear the extension data in your browser settings.”**
- Why this fails: no tested or documented in-product path tells the user exactly which setting clears the data.
- Concrete fix: give exact Chrome/Edge steps and add a support test or remove the sentence. A clearer rewrite is **“In Chrome, remove the extension to clear its stored archive.”** once F-1-17 is tested.

#### F-1-19 — The non-removable-throttle statement is not verified

- Exact quote/location: `/terms`: **“The built-in throttle may not be removed to target a site.”**
- Why this fails: `request-spacing` verifies normal behavior, not that an open-source extension’s throttle cannot be removed. The sentence reads as an implementation guarantee rather than an acceptable-use rule.
- Concrete fix: rewrite as a user obligation: **“Do not modify the extension to send checks faster or target a site.”**

#### F-1-20 — Route descriptions and social metadata stay stuck on the landing copy

- Exact location: live `/demo`, `/privacy`, and `/terms` all expose landing description **“Review old bookmarks, check link health, add context, and export a clean archive without uploading it.”** and landing `og:title` **“Bookmark Freshness Review — Review old bookmarks.”** The live 404 has no description, canonical, OG image, or apple-touch icon.
- Why this fails: shared landing metadata misdescribes legal and demo routes when indexed or shared. The 404 misses required metadata entirely.
- Concrete fix: update description, canonical, OG, and Twitter fields per client route. Add full metadata to `404.html`, with `noindex` retained. Test both direct loads and History API navigation.

#### F-1-21 — The deployed 404 does not use the site’s consistent header and footer

- Exact location: live unknown URL. Its header has only wordmark and Demo; its footer omits **Built by Param Factory**, version/build id, and the product one-liner structure used on other routes.
- Why this fails: the required skeleton calls for the same header and footer on every route. The static 404 is visibly a reduced parallel template.
- Concrete fix: render the standard header/footer markup in `404.html` or generate that page from the same template. Keep the real HTTP 404 response.

#### F-1-22 — Cross-route “How it works” navigation leaves focus on `<body>`

- Exact location: activate header **How it works** from `/privacy`. The browser reaches `/#how` and scrolls correctly, but `document.activeElement` is `BODY`; there is no route announcement.
- Why this fails: keyboard and screen-reader users are not moved to or told about the destination after a full route change.
- Concrete fix: handle this link through the router, focus `#how-title`, and announce **“How it works”** after navigation. Add a live-equivalent Playwright test starting on `/privacy`.

### Minor copy defects

#### F-1-23 — The headline uses decay metaphor

- Quote: **“Review old bookmarks before they rot.”**
- Why this fails: “rot” is metaphorical and does not name the concrete output.
- Rewrite: **“Review and clean up old bookmarks.”**

#### F-1-24 — “Review bench” is brand lore, not a section name

- Quote: **“01 · Review bench.”**
- Why this fails: the label does not identify the preview when heard out of context.
- Rewrite: **“Bookmark review preview.”**

#### F-1-25 — “Three passes” does not name its section

- Quote: **“02 · Three passes.”**
- Why this fails: a heading list gives no indication what the passes concern.
- Rewrite: **“How bookmark review works.”**

#### F-1-26 — “Clear boundary” is vague

- Quote: **“03 · Clear boundary.”**
- Why this fails: it could label any privacy section on any product.
- Rewrite: **“Where bookmark data goes.”**

#### F-1-27 — The privacy heading is a slogan

- Quote: **“Your archive is not our dataset.”**
- Why this fails: it uses contrast and brand voice instead of naming the section.
- Rewrite: **“Your bookmarks stay in browser storage.”**

#### F-1-28 — The image caption uses abstract “state” language

- Quote: **“Give each saved link a deliberate next state.”**
- Why this fails: “next state” hides the actual choices.
- Rewrite: **“Choose whether to keep, repair, or archive each bookmark.”**

#### F-1-29 — The footer contains a slogan with no new information

- Quote: **“Keep the archive yours.”**
- Why this fails: it repeats the privacy mood without telling the reader where data is stored.
- Rewrite: **“Bookmark data stays in browser extension storage.”**

#### F-1-30 — The license button is not a result-naming verb

- Quote: **“Have a license? Paste it.”**
- Why this fails: the question-plus-pronoun label does not name the result.
- Rewrite: **“Restore a license.”**

#### F-1-31 — The demo exit button hides that it downloads software

- Quote/location: `/demo` banner **“Start for real.”**
- Why this fails: it actually deletes demo data, returns home, and starts a ZIP download. The result is not named.
- Rewrite: **“Download extension and exit demo.”**

#### F-1-32 — The 404 label is mood copy

- Quote: **“404 · misplaced marker.”**
- Why this fails: “marker” is product lore and adds no recovery information.
- Rewrite: **“404 · page not found.”**

#### F-1-33 — The 404 action uses the same unexplained metaphor

- Quote: **“Return to the review bench.”**
- Why this fails: the button does not plainly name its destination.
- Rewrite: **“Return to home.”**

#### F-1-34 — “Browser-context note” is compressed jargon

- Quote/location: README: **“Stores a purpose or browser-context note with each bookmark.”**
- Why this fails: a first-time reader must infer what “browser-context” means.
- Rewrite: **“Stores why you saved each bookmark or which browser profile it needs.”**

#### F-1-35 — The collection has inconsistent names

- Exact locations: README uses **“bookmark file”**, **“archive”**, and **“archive data”** for the imported collection.
- Why this fails: the supplied terminology rule requires one term per concept.
- Concrete fix: use **“bookmark archive”** on first mention and **“archive”** afterward. Rewrite the introduction as **“It helps you keep, repair, or archive each bookmark in an imported archive.”**

#### F-1-36 — Link-result terms drift between copy and UI

- Exact locations: README uses **“check their health”**, **“Checks links”**, **“link-check attempts”**, **“moved links”**, and **“failed request”**; the UI uses **“link check”**, **“Moved or changed”**, and **“Failed checks.”**
- Why this fails: the same actions and result groups have different names.
- Concrete fix: standardize on **link check**, **failed check**, and **moved or changed** in landing, README, demo, terms, and claim text.

## Copy audit

Counts treat hyphenated terms and numerals as one word. Repeated identical labels are listed once. Headings, actions, navigation labels, status labels, and captions are included because the supplied plain-words rules cover them. README shell commands and bare URLs/paths are not sentences; their surrounding labels and explanatory sentences are included. No unit exceeds 22 words and no supplied banned marketing word appears.

### Landing page

| Copy unit | Words | Flag |
| --- | ---: | --- |
| Bookmark Freshness Review | 3 | — |
| Demo | 1 | — |
| How it works | 3 | — |
| Privacy | 1 | — |
| A local browser extension | 4 | — |
| Review old bookmarks before they rot | 6 | F-1-23 |
| For researchers with years of saved links who need a clear keep-or-archive pass. | 13 | — |
| Try it with sample data | 5 | — |
| See six checked bookmarks. | 4 | F-1-14 |
| Nothing touches your archive. | 4 | F-1-16 |
| Download the Chrome extension | 4 | — |
| Archive data stays in your browser. | 6 | — |
| Checks start only when you ask. | 6 | F-1-2 |
| Standard HTML export is always free. | 6 | F-1-4 |
| A concrete archive drawer with paper slips and moss, showing an old collection being carefully reviewed. | 16 | — |
| Give each saved link a deliberate next state. | 8 | F-1-28 |
| 01 · Review bench | 3 | F-1-24 |
| See what needs a decision | 5 | — |
| Health, age, duplicates, and your notes meet in one local ledger. | 11 | F-1-15 |
| Open the working demo | 4 | — |
| Review groups | 2 | — |
| Dead pages | 2 | — |
| Login or restricted | 3 | — |
| Duplicates | 1 | — |
| Old lab wiki | 3 | — |
| Research methods · saved 2016 | 4 | — |
| Dead page | 2 | — |
| Journal article | 2 | — |
| Sources · saved 2020 | 3 | — |
| Data handbook | 2 | — |
| Sources · saved 2021 | 3 | — |
| Alive | 1 | — |
| 02 · Three passes | 3 | F-1-25 |
| Turn an untouched archive into decisions | 6 | — |
| Import bookmark HTML | 3 | — |
| Choose the standard HTML file from Chrome, Firefox, Safari, or Edge. | 11 | F-1-6 |
| Check and add context | 4 | — |
| Start a link check. | 4 | — |
| Note the purpose, profile, or login each link needs. | 9 | — |
| Keep, repair, or archive | 4 | — |
| Fix moved URLs, mark decisions, then export a standard HTML file. | 11 | F-1-3 |
| 03 · Clear boundary | 3 | F-1-26 |
| Your archive is not our dataset | 6 | F-1-27 |
| The extension stores bookmarks, notes, and decisions in browser storage. | 10 | — |
| A link check contacts only the site for that link. | 10 | F-1-13 |
| The product has no cloud archive. | 6 | — |
| Read the privacy details | 4 | — |
| It does not | 3 | — |
| Upload an archive | 3 | — |
| Guess why you saved a link | 6 | — |
| Lock export behind payment | 4 | — |
| One-time license | 2 | — |
| Review a larger archive for $18 | 6 | — |
| Free use includes 50 link-check attempts, every note, every decision, and HTML export. | 13 | — |
| One payment removes the limit on this browser. | 8 | — |
| $18 once | 2 | — |
| Purchases are paused while checkout is unavailable. | 7 | — |
| Have a license? | 3 | F-1-30 |
| Paste it | 2 | F-1-30 |
| Existing licenses still work. | 4 | — |
| Read the terms. | 3 | — |
| Review old bookmarks. | 3 | — |
| Keep the archive yours. | 4 | F-1-29 |
| Terms | 1 | — |
| Built by Param Factory | 4 | — |
| opens in a new tab | 5 | — |
| v1.0 · build 2026.08.28 | 3 | — |
| Generated illustration disclosed in the design notes. | 7 | — |

### README

| Copy unit | Words | Flag |
| --- | ---: | --- |
| Bookmark Freshness Review | 3 | — |
| Review old bookmarks, check their health, and export a clean local archive. | 12 | F-1-36 |
| This Chrome extension is for researchers and professionals with years of saved links. | 13 | — |
| It turns an untouched bookmark file into a deliberate keep, repair, or archive pass. | 14 | F-1-35 |
| Live site | 2 | — |
| One-click demo | 2 | — |
| What it does | 3 | — |
| Imports standard browser bookmark HTML. | 5 | — |
| Checks links only after you start a review. | 8 | F-1-2, F-1-36 |
| Keeps dead pages, restricted pages, moved links, and failed checks separate. | 11 | F-1-7, F-1-36 |
| Finds duplicate URLs after removing common tracking parameters. | 8 | — |
| Stores a purpose or browser-context note with each bookmark. | 9 | F-1-34 |
| Repairs URLs and records keep, review, or archive decisions. | 9 | F-1-3, F-1-8 |
| Keeps archive data in extension storage on your device. | 9 | — |
| Exports kept bookmarks as standard HTML. | 6 | — |
| Export is always free. | 4 | F-1-4 |
| The free tier includes 50 link-check attempts. | 7 | — |
| Retrying a failed check uses another attempt. | 7 | — |
| An $18 one-time license removes that limit. | 7 | — |
| Notes, decisions, repair, and export remain free. | 7 | F-1-9 |
| New purchases are paused until Sociobot enables checkout; existing licenses can still be restored. | 14 | — |
| Install the packaged extension | 4 | — |
| Download bookmark-freshness-review.zip from the live site. | 6 | — |
| Unzip it into a permanent folder. | 6 | — |
| Open chrome://extensions in Chrome or Edge. | 6 | — |
| Turn on Developer mode. | 4 | — |
| Choose Load unpacked, then select the unzipped folder. | 8 | — |
| Open the extension to import a bookmark HTML file. | 9 | — |
| The extension requests access to website addresses so it can check the links you select. | 15 | — |
| It does not read page content until a check starts. | 10 | F-1-10 |
| Requests omit browser credentials. | 4 | — |
| The checker spaces requests apart and honors Retry-After limits. | 9 | — |
| Develop and verify | 3 | — |
| Requires Node.js 22 or newer. | 5 | — |
| npm run build:site builds the MV3 extension, packages its ZIP, and writes the deployable site to dist/site/. | 17 | — |
| The required index.html is at dist/site/index.html. | 6 | — |
| Load .output/chrome-mv3/ as an unpacked extension during development. | 8 | — |
| The production ZIP is staged at dist/site/downloads/bookmark-freshness-review.zip. | 7 | — |
| Project map | 2 | — |
| entrypoints/ — WXT MV3 background worker and review interface. | 8 | — |
| src/core/ — bookmark parsing, export, duplicate, status, and license logic. | 9 | — |
| site/ — static landing, sandboxed demo, privacy, terms, and 404 routes. | 10 | — |
| tests/ — Vitest core tests and Playwright claim and accessibility tests. | 10 | — |
| .factory/ — brief, design system, claims, demo contract, and handoff. | 9 | — |
| Privacy and payment | 3 | — |
| Imported bookmarks, notes, and decisions stay in browser extension storage. | 10 | — |
| Importing or editing an archive makes no hosted request. | 9 | — |
| Link checks contact saved websites only after an explicit action. | 10 | F-1-2, F-1-13 |
| License verification sends only the pasted license token to the Sociobot billing API. | 13 | — |
| Sociobot and Dodo handle one-time purchases as merchant of record. | 10 | F-1-5 |
| Checkout is not linked while product registration is unavailable. | 9 | — |
| The product never receives card details. | 6 | F-1-5 |
| See the live privacy page and terms. | 7 | — |
| License | 1 | — |
| MIT. | 1 | — |
| See LICENSE. | 2 | — |

## Demo and sandbox evidence

- One click from the live landing action reached `/demo` with six realistic records already loaded.
- The persistent banner, Reset demo, and Start for real controls were present.
- Editing a note wrote only `localStorage["demo:bookmark-freshness-review:v1"]`; a seeded `real:sentinel` remained unchanged.
- Reload retained the demo edit. Reset removed the demo key and restored sample content. Start for real removed the demo key, preserved the real sentinel, returned to `/`, and downloaded `bookmark-freshness-review.zip`.
- The complete live flow made only same-origin requests. No analytics, advertising, CDN font, bookmark-site, or Sociobot request occurred.
- The live ZIP SHA-256 matched the locally built ZIP: `e15b3dd5abd4bc2c0e671fc399b05781df98b4290ce9fd947db544771d9fdb5a`. ZIP integrity passed.

## Claims execution

Every exact command was run independently after `npm ci` in a clean local clone of the reviewed commit.

| Claim id | Exact command | Result |
| --- | --- | --- |
| `local-demo` | `npx playwright test --grep @claim:local-demo` | PASS |
| `extension-local-storage` | `npm run build:extension && npx playwright test --grep @claim:extension-local-storage` | PASS |
| `site-local-resources` | `npx playwright test --grep @claim:site-local-resources` | PASS |
| `status-separation` | `npx playwright test --grep @claim:status-separation` | PASS |
| `explicit-checks` | `npx playwright test --grep @claim:explicit-checks` | PASS, but insufficient surface; F-1-2 |
| `html-import` | `npm run build:extension && npx playwright test --grep @claim:html-import` | PASS |
| `duplicate-detection` | `npm run build:extension && npx playwright test --grep @claim:duplicate-detection` | PASS |
| `url-repair` | `npx playwright test --grep @claim:url-repair` | PASS, but insufficient surface; F-1-3 |
| `credential-free-checks` | `npm run build:extension && npx playwright test --grep @claim:credential-free-checks` | PASS |
| `request-spacing` | `npm run build:extension && npx playwright test --grep @claim:request-spacing` | PASS |
| `html-export` | `npx playwright test --grep @claim:html-export` | PASS, but insufficient surface; F-1-4 |
| `paid-license` | `npm run build:extension && npx playwright test --grep @claim:paid-license` | PASS |
| `license-token-only` | `npx playwright test --grep @claim:license-token-only` | PASS |
| `checkout-paused` | `npx playwright test --grep @claim:checkout-paused` | PASS |

Registered command result: **14/14 PASS**. Claim acceptance still fails because F-1-2 through F-1-19 identify untested scope or public claims without entries.

## History check

Before this review was added, no earlier `.factory/review-*.md` or `.factory/polish-*.md` files existed. The earlier `.factory/handoff.md` was read in full.

- The handoff’s prior dark-card failure is fixed in both live output and code. All six live `/demo` card headings compute to `rgb(240, 238, 226)` on `rgb(43, 48, 42)`; the repository asserts the same tokens and ≥ 4.5:1 contrast for site and extension cards.
- The live and local ZIP hashes match the handoff value.
- The handoff’s stated 14 claim commands and complete `npm test` result were independently rerun and passed.
- The two documented limits remain accurate: checkout is visibly paused with no checkout link, and packaging targets Chromium MV3.

No earlier finding ID required reopening. This review’s findings come from the mandated fresh checklist.

## Structure, accessibility, and visual checks

| Check | Result |
| --- | --- |
| Per-route title pattern and one h1/main | PASS on `/`, `/demo`, `/privacy`, `/terms`, and live 404 |
| Route-specific description/OG metadata | FAIL — F-1-20 |
| Canonical, OG image, favicon/apple icon | PASS on app routes; FAIL on 404 — F-1-20 |
| Designed real HTTP 404 | Partial: correct 404 and styled, but inconsistent skeleton — F-1-21 |
| Deep links and back button | PASS for app routes; h1 focus restored on Demo and back |
| Cross-route section focus | FAIL — F-1-22 |
| Dead-link crawl | PASS: every internal/download link and the Param Factory external link returned 200; `mailto:` links were excluded |
| Header/footer on app routes | PASS |
| 390 px overflow and 44 px targets | PASS on all routes in light and dark modes |
| Serious/critical Axe findings | 0 on all routes, light and dark, including 404 |
| Reduced motion | PASS in CSS/tests |
| Console errors | 0 on normal routes |
| First-load JS | PASS: 18,505 bytes raw, 6.82 kB gzip |
| Visual identity | PASS: concrete-and-moss palette, square rules, generated archive art, and dense ledger composition are distinct from a generic SaaS template; provenance is documented |

## Missed leverage

No additional AI feature is justified. Link checking, duplicate normalization, notes, stale grouping, decisions, and HTML import/export are deterministic and local-first; model use would add cost and privacy exposure without solving the brief better. The extension already includes the brief’s obvious leverage: HTML import/export and an **Older than 2 years** group. Cloud sync would conflict with the local-first boundary unless introduced as an explicit optional product change.

## Verification summary

- `npm ci` — PASS, 0 vulnerabilities.
- All 14 exact claim commands from a clean clone — PASS.
- `npm test` — PASS: type/claim validation, production build, 10 Vitest tests, and 26 Playwright tests.
- `npm run build` — PASS through `npm test`; `dist/site/` produced.
- Live light/dark Axe scan at 390 px — 0 serious or critical violations on `/`, `/demo`, `/privacy`, `/terms`, and an unknown route.
- Live request log — same-origin only throughout the demo workflow.
- Live link crawl — no dead links.
- Live ZIP integrity and local/live SHA-256 match — PASS.

## What would make this perfect

Resolve every finding above, then repeat the cold 390 px review. The target state is: one realistic bookmark record visible immediately after the demo click; claim-tagged tests exercising the packaged extension wherever the extension is promised; no unlisted claim; plain section and action names with one stable vocabulary; route-specific metadata; a shared 404 skeleton; and focus moved and announced for the How it works destination. Nothing else should remain to explain away.
