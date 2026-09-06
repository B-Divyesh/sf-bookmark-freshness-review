# Review and clean up old bookmarks — independent review 5

Reviewed 2026-09-06 UTC for work order `bookmark-freshness-review-review-5`.

- Live URL: <https://bookmark-freshness-review.sociobot.in>
- Implementation candidate: `e1cdad8f3c618367b1abc2b470b707ec74cac660`
- Documentation commit reviewed: `7260e52011a2dc4088484a8ce9bdb7785c912bf2`

## Verdict

**PASS — 0 findings and 0 untested claims.**

No product code changed in this review. The implementation candidate is the last product-changing commit. The later commits through `7260e52` contain verification documentation. A clean build of that revision exactly matches the deployed JavaScript, CSS, and extension ZIP, so the live runtime is the reviewed implementation.

## First screen before scrolling

Fresh desktop (1440 × 1000) and phone (390 × 844) browser contexts opened the live home page at scroll position zero.

| Check | Visible result |
| --- | --- |
| Job | “Review and clean up old bookmarks.” |
| Audience | Researchers with years of saved links who need keep, repair, or archive choices. |
| First action | **Try it with sample data**. Its adjacent text says it opens a checked sample archive and keeps the real archive separate. |

Both views also show the three facts: archive data stays in the browser, checks start only when requested, and standard HTML export is free. There were no console errors.

## Demo and product paths

- The first action opened `?demo=1` and immediately showed six realistic populated records.
- The persistent banner said **“Demo — sample data, nothing is saved”** and exposed **Reset demo** and **Download extension and exit demo**.
- A pre-seeded real archive sentinel remained unchanged after entry, reset, and the sample flow. Reset restored the six-record sample and retained the banner.
- The live sample flow, including **Run sample check**, requested only `https://bookmark-freshness-review.sociobot.in`.
- The clean installed-extension tests exercised normal import, nested folders, invalid input, URL repair, duplicate grouping, decisions and export, offline edit/reload then reconnection, failed-check retry, 429/503 `Retry-After`, license failures and valid verification, and relaunch persistence.
- The ZIP passed `unzip -t`.

## Claims and clean checks

`npm ci` in a new detached worktree installed 174 packages with no reported vulnerabilities. Every literal command in `.factory/claims.json` was run independently; all 20 passed.

| Claim IDs | Result |
| --- | --- |
| `local-demo`, `demo-seed`, `extension-local-storage`, `offline-review` | PASS |
| `site-local-resources`, `status-separation`, `explicit-checks`, `html-import` | PASS |
| `duplicate-detection`, `url-repair`, `decision-persistence`, `bookmark-ledger` | PASS |
| `older-than-two-years`, `credential-free-checks`, `request-spacing`, `html-export` | PASS |
| `paid-license`, `retry-attempt`, `license-token-only`, `checkout-paused` | PASS |

`npm test` also passed: claims-manifest validation, production build, 10 Vitest tests, and 42 Playwright tests using two workers. The manifest has 20 unique IDs and one matching tagged observable test per ID. I compared the live landing page, demo, privacy page, terms, extension copy, and README with the manifest; no missing, false, incomplete, or untested public claim remains.

The fresh build measured 6,660 bytes gzip JavaScript, 4,650 bytes gzip CSS, and a 110,663-byte packaged ZIP. These are within the required static-site budgets.

## Live structure, accessibility, and privacy

- `scripts/verify-url.sh` passed on `/`, `/demo`, `/privacy`, `/terms`, and `/404.html`: each had its own title, `lang`, exactly one `h1`, exactly one `main`, no missing image alt text, and no console error.
- The unknown-route response is the designed recovery page with intentional HTTP 404. It is not a defect.
- The passing Playwright suite includes desktop and phone accessibility checks in light and dark treatments, reduced-motion checks, heading order, keyboard focus after record actions, 44 px target checks, and Axe serious/critical checks.
- The live site response has the expected local-only CSP, security headers, robots file, sitemap, route-specific metadata, legal pages, and a consistent 404 header/footer.
- The demo’s live request log contained no third-party origin. The extension’s claim tests verify local archive storage, explicit link checks, omitted credentials, and token-only license verification.

## Live build comparison

| Asset | Live SHA-256 equals clean build |
| --- | --- |
| Site JavaScript | Yes — `9fd51b5f9ff88a61de25f81010a93dbfb2ab299368fa9daf373d483134e3aa1c` |
| Site CSS | Yes — `07227ec9393c9ff43e4cd024f682663239e65e388c7cd7098447d8106a2b284c` |
| Extension ZIP | Yes — `da342a9a4342b66d4b4553606755df8a8dcda20a1428f4a55c46c15178561728` |

The latest fresh Lighthouse evidence in `verification-6.md` remains applicable because these assets are byte-identical: mobile Performance/Accessibility/Best Practices/SEO were 100/100/100/100 and desktop was 100/100/100/100.

## Earlier finding disposition

I read review 1–4, verification 1–6, and polish 1–2. The current checks below re-prove every prior finding, including the earlier minor copy and mobile-structure items.

| Earlier findings | Current proof and disposition |
| --- | --- |
| F-1-1 | Phone demo shows a complete first record within the viewport. Fixed. |
| F-1-2–F-1-4 | `explicit-checks`, `url-repair`, and `html-export` passed in the packaged extension. Fixed. |
| F-1-5–F-1-6 | Unsupported payment and named-browser-format promises remain absent; checkout is visibly paused. Fixed. |
| F-1-7–F-1-9 | Separate result classes, persisted decisions, and free export at the limit passed their current claim tests. Fixed. |
| F-1-10–F-1-13 | Unsupported content-timing, refund, cross-device, and exclusive-destination promises remain absent. Fixed. |
| F-1-14–F-1-16 | Six-result demo seed, ledger fields, and real-data sentinel isolation passed. Fixed. |
| F-1-17–F-1-19 | Unsupported deletion and unremovable-throttle claims remain absent; terms state the user’s obligation accurately. Fixed. |
| F-1-20–F-1-22 | Route metadata, complete 404 structure, and route focus behavior pass current route tests. Fixed. |
| F-1-23–F-1-29 | Earlier minor plain-language copy findings remain fixed; the current copy audit has no over-length or banned-word flags. Fixed. |
| F-1-30–F-1-36 | License wording, demo exit, 404 wording/actions, and consistent archive/link terms remain accurate. Fixed. |
| F-2-1–F-2-6 | Invalid/unreachable licenses stay capped; demo keys are isolated; pricing, steps, privacy, and sample headings remain clear. Fixed. |
| F-4-1 | Site restoration correctly directs to the installed extension and does not claim a site unlock. Fixed. |
| F-4-2 | Current Playwright tests pass focus retention after record edits, reset, and checks. Fixed. |
| F-4-3–F-4-5 | Registered `offline-review`, `retry-attempt`, and `older-than-two-years` tests passed in clean packaged-extension contexts. Fixed. |
| F-4-6 | Phone test passes one record control set and ordered heading outline. Fixed. |
| Verification 1 | Earlier incomplete-claims, small-target, dead-sample-link, helper, and HTTP-200-404 findings are covered by the current manifest, target/route tests, and live 404 check. Fixed. |
| Verification 2 | Checkout, full-suite reliability, wordmark targets, and observable extension claim gaps are covered by the current passing suite and paused checkout state. Fixed. |
| Verification 3 | Desktop first action, spacing reliability, sample exit, 404 targets, and token-only request tests remain passing. Fixed. |
| Verification 4 | Nested folder import/export and both 429 and 503 `Retry-After` behavior passed current installed-extension checks. Fixed. |
| Review 3 and verification 5 | Those reports had no findings; no regression was observed. |

## External dependency

The one-time $18 billing offer is not registered. The product does not show a purchase link and plainly says purchases are paused, so no user-facing path is falsely promised. Billing registration remains a separate operator task before checkout can be enabled. This is not a finding against the current product.

This product has no hosted archive backend, tenant, account, or SQLite service. Backend health, restart-persistence, and tenant-isolation checks do not apply.
