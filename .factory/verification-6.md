# Review and clean up old bookmarks — independent verification 6

Verified 2026-09-06 UTC for work order `bookmark-freshness-review-verify-6`.

- Live URL: <https://bookmark-freshness-review.sociobot.in>
- Implementation reviewed: `e1cdad8f3c618367b1abc2b470b707ec74cac660`
- Documentation handoff reviewed: `3b8ecb6a8ca52aca92d3461f5a2b26f01a85f793`
- Deployment supplied: `2a41e4f7-34a1-4311-a966-3fe9a7905c22`

## Verdict: PASS

**PASS — 0 findings and 0 untested claims.**

The deployed static site and downloadable Chromium MV3 extension match a clean build of the implementation candidate. The one-click demo is isolated, all 20 declared claim commands pass, the full quality gate passes, and the live ZIP completes the real bookmark-review job in a clean browser profile.

Billing offer registration remains an external dependency, not a product defect. The product plainly says purchases are paused and exposes no checkout link while the product checkout endpoint is unavailable.

## First screen before scrolling

Fresh 1440 × 900 desktop and 390 × 844 phone contexts opened the live home page at scroll position zero.

| Question | Visible answer |
| --- | --- |
| Job | Review and clean up old bookmarks, then keep, repair, or archive them. |
| Audience | Researchers with years of saved links. |
| First action | **Try it with sample data**. The adjacent text says it opens a checked sample archive and keeps the real archive separate. |

The three facts about browser storage, user-started checks, and free HTML export are also visible before scrolling. The sample action ends at 538.08 px on the phone and 615 px on desktop. Evidence: [phone first screen](verification-6-artifacts/cold-phone.webp) and [desktop first screen](verification-6-artifacts/cold-desktop.webp).

## One-click sample and data isolation

- One click opened `/?demo=1` with the persistent **Demo — sample data, nothing is saved** label, **Reset demo**, and **Download extension and exit demo**.
- Six realistic records cover alive, dead, login or restricted, moved or changed, duplicate, and failed-check results. The phone's complete first record ends at 766.75 px inside the 844 px viewport. Evidence: [phone sample](verification-6-artifacts/demo-phone.webp) and [desktop sample](verification-6-artifacts/demo-desktop.webp).
- A note edit and archive decision persisted only under `demo:bookmark-freshness-review:v1`. The archive decision was reflected in downloaded standard HTML.
- Reset restored the sample, removed the demo key, retained keyboard focus, and left pre-seeded real archive and license sentinels unchanged.
- Exit removed demo state, returned home, downloaded the extension ZIP, and left both real sentinels unchanged.
- The complete live sample flow made only same-origin requests and produced no console or page errors.

## Declared claims

The repository checkout was clean at the start. `npm ci` installed 174 locked packages with zero reported vulnerabilities. Every literal `test` command in `.factory/claims.json` was then run independently.

| Claim | Result | Observable outcome |
| --- | --- | --- |
| `local-demo` | PASS | Web and extension sample data stayed separate from real archive and license sentinels. |
| `demo-seed` | PASS | Six checked sample records and every stated result class appeared. |
| `extension-local-storage` | PASS | Import and edit persisted in extension storage with no hosted archive request. |
| `offline-review` | PASS | Notes persisted offline and checking resumed after reconnection. |
| `site-local-resources` | PASS | All public route requests stayed on the product origin. |
| `status-separation` | PASS | Dead, restricted, moved or changed, and failed results remained distinct. |
| `explicit-checks` | PASS | A saved site was contacted only after the check action. |
| `html-import` | PASS | Nested standard bookmark HTML retained parent and child folders. |
| `duplicate-detection` | PASS | Tracking and clean URL variants produced one canonical duplicate. |
| `url-repair` | PASS | A repaired URL survived reload and appeared in exported HTML. |
| `decision-persistence` | PASS | Keep, review later, and archive persisted; archived records were omitted from export. |
| `bookmark-ledger` | PASS | Saved year, link result, duplicate state, and note were visible. |
| `older-than-two-years` | PASS | Only the record beyond the exact two-year boundary appeared. |
| `credential-free-checks` | PASS | The controlled receiver saw no Cookie header. |
| `request-spacing` | PASS | Same-host spacing and both 429 and 503 `Retry-After` windows were honored. |
| `html-export` | PASS | All 51 kept records exported after the unlicensed check limit was exhausted. |
| `paid-license` | PASS | Invalid and unreachable verification stayed capped; only verified activation removed the limit. |
| `retry-attempt` | PASS | Retrying a failed check increased stored and visible usage from one to two. |
| `license-token-only` | PASS | Verification sent one GET with only the license parameter and no archive data. |
| `checkout-paused` | PASS | Paused copy appeared and no checkout link was present. |

Claim lint found 20 unique IDs and exactly one matching tagged test for each. A fresh cross-check of the live home, demo, privacy, terms, extension copy, and README found no missing, false, incomplete, or untested public claim.

## Clean build and installed extension

- `npm test`: PASS — claim lint, production build, 10 Vitest tests, and 42 Playwright tests.
- `npm run build` within that gate produced `dist/site/` and the packaged extension.
- `unzip -t dist/site/downloads/bookmark-freshness-review.zip`: PASS.
- The live ZIP was downloaded, extracted, and loaded in a new persistent Chromium consumer profile. It is byte-for-byte equal to the clean build.
- The installed extension showed six sample records and preserved real archive and license sentinels through sample edit and reset.
- An invalid import showed a clear recovery instruction. A nested three-record Netscape bookmark file imported as `Parent`, `Child`, `Parent`.
- An offline note survived reload. After reconnecting, the three controlled product URLs became alive or moved results.
- Archiving one record omitted it from exported standard HTML. The archive, note, results, folders, and decision survived closing and reopening the browser profile.
- Keyboard focus remained on replacement controls after decisions, note edits, checks, and reset. Evidence: [installed extension](verification-6-artifacts/live-extension-real.webp).

## Live routes, accessibility, privacy, and recovery

- `scripts/verify-url.sh` passed `/`, `/?demo=1`, `/demo`, `/privacy`, `/terms`, and `/404.html`: correct title, `lang=en`, one `h1`, one `main`, complete alt text, and no console errors.
- Independent Axe runs covered six routes at phone and desktop sizes in light and dark modes: zero serious or critical violations in all 24 combinations.
- Heading order, labels, landmarks, skip link, keyboard operation, focus restoration, and route announcements passed. Every visible phone control measured at least 44 × 44 CSS px.
- Normal-size layouts had no horizontal overflow. At 200% root text size, all text and controls remained present and operable; long display headings required horizontal panning on some 390 px legal/demo views but no content or function was lost.
- Reduced-motion mode had no running animations. No tested route flashed or autoplayed media.
- All internal user-facing links returned HTTP 200. The external factory credit was inspected but not requested. `mailto:` links were correctly explicit.
- `/`, `/demo`, `/privacy`, and `/terms` return 200 with route-specific titles and metadata. An unknown URL returns an intentional HTTP 404 with the designed header, footer, legal links, and home action.
- `robots.txt` and `sitemap.xml` return 200 and list all public routes.
- Security responses include CSP with `frame-ancestors 'none'`, HSTS, `nosniff`, strict-origin referrer policy, and a restrictive permissions policy.
- A returned `?license=` value is removed from the live site URL, creates no site license value or external request, and leaves the instruction to paste the token in the installed extension.
- A 40-request invalid-license burst, after one earlier request in the same window, returned 29 HTTP 200 and 11 HTTP 429 responses. Every 429 included `Retry-After: 4`, consistent with the 30-request allowance.

The product has no hosted archive backend, account, tenant, or product database. Tenant isolation, SQLite restart persistence, and a product health endpoint are therefore not applicable. The static site makes no offline claim. The installed extension's offline storage and recovery behavior was tested. It has no self-update promise beyond normal browser extension installation.

## Performance and deployment identity

Fresh Lighthouse 13.0.1 results against the live home page:

| Profile | Performance | Accessibility | Best practices | SEO | FCP | LCP | TBT | CLS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Mobile | 100 | 100 | 100 | 100 | 1.08 s | 1.46 s | 1 ms | 0.037 |
| Desktop | 100 | 100 | 100 | 100 | 0.29 s | 0.41 s | 0 ms | 0.011 |

Budgets pass: JavaScript is 19,030 bytes raw / 6,730 bytes gzip; CSS is 17,494 bytes raw / 4,649 bytes gzip; the phone hero is 39,606 bytes; the extension ZIP is 110,663 bytes. Mobile Lighthouse transferred 106,633 bytes.

| Artifact | SHA-256 | Live equals clean build |
| --- | --- | --- |
| Site JavaScript | `9fd51b5f9ff88a61de25f81010a93dbfb2ab299368fa9daf373d483134e3aa1c` | Yes |
| Site CSS | `07227ec9393c9ff43e4cd024f682663239e65e388c7cd7098447d8106a2b284c` | Yes |
| Extension ZIP | `da342a9a4342b66d4b4553606755df8a8dcda20a1428f4a55c46c15178561728` | Yes |

## Earlier finding disposition

Every earlier review and verification finding was checked against current live behavior, the clean build, or a current tagged outcome test.

| Earlier finding | Current proof | Disposition |
| --- | --- | --- |
| F-1-1 | The complete first phone record ends at 766.75 px. | Fixed |
| F-1-2 | `explicit-checks` observes no saved-site request before the extension action. | Fixed |
| F-1-3 | `url-repair` checks storage, reload, and exported HTML. | Fixed |
| F-1-4 | `html-export` exports 51 records after the unlicensed limit. | Fixed |
| F-1-5 | Merchant/card-handling promises remain absent while checkout is paused. | Fixed |
| F-1-6 | Copy promises standard browser bookmark HTML, not four named formats. | Fixed |
| F-1-7 | Four result classes have separate visible outcome checks. | Fixed |
| F-1-8 | Three decisions persist and archived records stay out of export. | Fixed |
| F-1-9 | Only link checks are limited; export remains free at the boundary. | Fixed |
| F-1-10 | The untested page-content timing promise remains absent. | Fixed |
| F-1-11 | The untested refund-revocation promise remains absent. | Fixed |
| F-1-12 | The untested cross-device restoration promise remains absent. | Fixed |
| F-1-13 | The unsupported exclusive-destination wording remains absent. | Fixed |
| F-1-14 | `demo-seed` proves six checked samples and their states. | Fixed |
| F-1-15 | `bookmark-ledger` proves year, result, duplicate status, and note. | Fixed |
| F-1-16 | Real archive and license sentinels survive sample edit, reset, and exit. | Fixed |
| F-1-17 | The uninstall-deletion promise remains absent. | Fixed |
| F-1-18 | The browser-settings deletion promise remains absent. | Fixed |
| F-1-19 | Terms state a user obligation, not an unremovable-throttle guarantee. | Fixed |
| F-1-20 | Every route has its own title, description, canonical, and social metadata. | Fixed |
| F-1-21 | The real 404 retains the standard header, footer, legal links, credit, and build ID. | Fixed |
| F-1-22 | Privacy → How it works focuses and announces the target; Back restores heading focus. | Fixed |
| F-1-23–F-1-29 | Job, section, caption, privacy, and footer copy remain literal and useful. | Fixed |
| F-1-30 | The site no longer offers a misleading license action; restoration points to the extension. | Fixed |
| F-1-31 | The exit action names the download and discards the sample. | Fixed |
| F-1-32–F-1-33 | The 404 label and home action remain plain. | Fixed |
| F-1-34–F-1-36 | Browser-profile, archive, and link-result terms remain consistent. | Fixed |
| F-2-1 | Invalid and unreachable verification do not activate paid state. | Fixed |
| F-2-2 | Extension sample archive and license keys are isolated and removed on reset/exit. | Fixed |
| F-2-3 | Pricing names the 50-check limit rather than archive size. | Fixed |
| F-2-4–F-2-6 | Step, privacy section, and sample page headings plainly name their content. | Fixed |
| F-4-1 | Site return tokens are discarded and restoration points to the installed extension. | Fixed |
| F-4-2 | Live site and installed extension retain focus after all changed actions. | Fixed |
| F-4-3 | `offline-review` is registered and passes its installed-extension outcome test. | Fixed |
| F-4-4 | `retry-attempt` is registered and proves the visible/stored count increase. | Fixed |
| F-4-5 | `older-than-two-years` proves the exact date boundary in the installed extension. | Fixed |
| F-4-6 | The phone has one record control set and ordered `h1` → `h2` → `h3` headings. | Fixed |
| Verification 1: incomplete claims | Twenty public claims are registered and outcome-tested. | Fixed |
| Verification 1: small phone targets | No visible phone target is below 44 × 44 px. | Fixed |
| Verification 1: dead sample links | Sample addresses are labels, not dead outgoing actions. | Fixed |
| Verification 1: missing URL helper | `scripts/verify-url.sh` exists and passes all applicable live routes. | Fixed |
| Verification 1: HTTP 200 unknown route | The deployed unknown route returns HTTP 404. | Fixed |
| Verification 2: broken checkout CTA | No checkout action is shown while registration is unavailable. | Fixed |
| Verification 2: failing default suite | The clean default suite passes 42 Playwright tests with two workers. | Fixed |
| Verification 2: short wordmark targets | Header/footer wordmarks meet the 44 px phone baseline. | Fixed |
| Verification 2: non-observable claims | Import, duplicate, credentials, and spacing run in installed extension sandboxes. | Fixed |
| Verification 3: desktop action below fold | The action and explanation end at 615 px in a 900 px viewport. | Fixed |
| Verification 3: request-spacing flake | The default parallel suite and independent claim command both pass. | Fixed |
| Verification 3: sample exit retained data | Exit discards sample state, returns home, and downloads the ZIP. | Fixed |
| Verification 3: 404 targets | The live 404 has no phone target below 44 px. | Fixed |
| Verification 3: token-only promise | `license-token-only` inspects method, path, parameters, body, and archive absence. | Fixed |
| Verification 4: nested folder corruption | Parent, child, then parent import and export preserve folder scope. | Fixed |
| Verification 4: 503 Retry-After ignored | The installed-extension claim proves both 429 and 503 delays. | Fixed |

Reviews 3 and verification 5 had no findings. No earlier finding regressed.

## External dependency and missed-feature check

The product checkout endpoint currently returns HTTP 404 because the Sociobot billing offer is not registered. The site and extension accurately show a paused notice and no purchase link, so this does not break a promised path. The separate billing operator must register the one-time $18 offer before purchases can be enabled.

No AI feature is warranted. Link status, duplicate normalization, age grouping, review decisions, and HTML import/export are deterministic local tasks. Hosted AI or sync would weaken the stated privacy boundary.
