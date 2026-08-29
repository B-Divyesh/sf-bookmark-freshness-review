# Polish round 2 — finding closure

Candidate repaired: `1c617dae7d7f75d02603f81b5ccc6cf19738b3db`  
Review closed: `79e97fa71d5398e3058dfa98f004f566a2375da0`  
Repair commit deployed: `ea570e81be80e20a8206902995188154c994b942`

Every earlier finding was rechecked in the current source, clean-clone tests, and the deployed site. Review 1 items remain closed; review 2 items received new repair work.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Kept the compact mobile-first sample record ahead of filters. | `mobile demo stays within the viewport`; live screenshot `.factory/polish-2-live-demo-mobile.png` ends at 818 px in a 390 × 844 viewport. |
| F-1-2 | Kept explicit-check coverage in the packaged extension. | `@claim:explicit-checks` passed from the clean clone. |
| F-1-3 | Kept extension storage, reload, and export coverage for URL repair. | `@claim:url-repair` passed from the clean clone. |
| F-1-4 | Kept free export coverage for 51 records after the check limit. | `@claim:html-export` passed from the clean clone. |
| F-1-5 | Checkout and card-data promises remain removed while checkout is paused. | `@claim:checkout-paused`; live home and legal-page copy check. |
| F-1-6 | Browser-specific import wording remains replaced with standard bookmark HTML. | `@claim:html-import`; `.factory/copy-audit.md`. |
| F-1-7 | Dead, restricted, moved, and failed results remain separate. | `@claim:status-separation`. |
| F-1-8 | Keep, review, and archive decisions remain persistent and affect export. | `@claim:decision-persistence`. |
| F-1-9 | Paid scope remains limited to the tested 50 link-check attempts; export stays free. | `@claim:paid-license`; `@claim:html-export`. |
| F-1-10 | The untestable page-content timing promise remains removed. | `.factory/copy-audit.md`; live README/legal cross-check. |
| F-1-11 | The untested refund-revocation promise remains removed. | Live `/terms` copy check. |
| F-1-12 | The untested cross-device restoration promise remains removed. | Live `/terms` copy check. |
| F-1-13 | The untested exclusive network-destination promise remains removed. | `@claim:credential-free-checks`; live copy check. |
| F-1-14 | The demo still contains six checked records spanning every promised result. | `@claim:demo-seed`. |
| F-1-15 | Saved year, result, duplicate status, and note remain visible. | `@claim:bookmark-ledger`. |
| F-1-16 | Strengthened isolation to cover real archive and license sentinels in both web and extension demos. | `@claim:local-demo`; live `/?demo=1` storage/request probe. |
| F-1-17 | The untested uninstall-deletion promise remains removed. | Live `/privacy` copy check. |
| F-1-18 | The undocumented browser-settings deletion promise remains removed. | Live `/privacy` copy check. |
| F-1-19 | Terms retain an acceptable-use obligation instead of an impossible anti-modification guarantee. | Live `/terms` check; route suite. |
| F-1-20 | Route-specific title, description, canonical, Open Graph, and Twitter metadata remain complete. | `routes update title, description, canonical, and social metadata`; live `verify-url.sh` on all routes. |
| F-1-21 | The real HTTP 404 retains the site header, footer, factory link, build ID, and product line. | `static 404 keeps the site skeleton and complete metadata`; live unknown route returned 404. |
| F-1-22 | `/#how` still restores history, focuses its heading, and announces the destination. | `internal links resolve and route changes focus the page heading`. |
| F-1-23 | The first-screen headline remains “Review and clean up old bookmarks.” | Mobile/desktop first-screen test; live cold check. |
| F-1-24 | “Bookmark review preview” remains the product-preview label. | `.factory/copy-audit.md`; live home check. |
| F-1-25 | “How bookmark review works” remains the process-section label. | `.factory/copy-audit.md`; live home check. |
| F-1-26 | “Where bookmark data goes” remains the privacy-section label. | `.factory/copy-audit.md`; live home check. |
| F-1-27 | Privacy heading remains “Your bookmarks stay in browser storage.” | `.factory/copy-audit.md`; live home check. |
| F-1-28 | The illustration caption still names keep, repair, and archive choices. | `.factory/copy-audit.md`; live home check. |
| F-1-29 | The footer still states where bookmark data is stored. | Live footer check on every route. |
| F-1-30 | The license action remains “Restore a license.” | `landing headings describe their sections`; live home check. |
| F-1-31 | Demo exit remains “Download extension and exit demo” and discards the sandbox. | `Start for real downloads the extension…`; `@claim:local-demo`. |
| F-1-32 | Static 404 label remains “404 · page not found.” | `static 404 keeps the site skeleton…`; live 404 check. |
| F-1-33 | Static 404 action remains “Return to home.” | `static 404 keeps the site skeleton…`; live 404 check. |
| F-1-34 | “Browser profile” remains the only user-facing term. | `.factory/copy-audit.md`; `@claim:bookmark-ledger`. |
| F-1-35 | Imported collections remain named bookmark archive/archive. | `.factory/copy-audit.md`. |
| F-1-36 | Link check, failed check, and moved or changed remain consistent. | `.factory/copy-audit.md`; `@claim:status-separation`. |
| F-2-1 | Removed optimistic unlocks. Only a successful API response writes a verified cache; invalid/unreachable and legacy unverified states stay capped after reload. | `@claim:paid-license`; `site rejects invalid, unreachable, and legacy optimistic license states`; live aborted-verification probe stored no token and showed the 50-check message. |
| F-2-2 | Added `demo:sb_license:bookmark-freshness-review`; demo Reset and Exit remove it and preserve real archive/license sentinels. | `@claim:local-demo`; `.factory/demo.md`. |
| F-2-3 | Replaced archive-size wording with “Remove the 50-check limit for $18” and “Link-check limit.” | `landing headings describe their sections`; packaged-extension heading assertion; live home check. |
| F-2-4 | Replaced “Check and add context” with “Check links and add notes.” | `landing headings describe their sections`; live home check. |
| F-2-5 | Replaced “It does not” with “What the extension does not do.” | `landing headings describe their sections`; live home check. |
| F-2-6 | Replaced the demo h1 with “Decide which bookmarks to keep.” | `query demo entry opens the isolated sample with clear headings`; live `/?demo=1` check and screenshot. |

## Verification summary

- Fresh clone: `/tmp/bookmark-polish2-claims-lxnvbT/repo` at `ea570e81be80e20a8206902995188154c994b942`.
- Every exact command in `.factory/claims.json`: 17/17 passed independently.
- Fresh-clone `npm test`: passed; 10 Vitest tests and 38 Playwright tests.
- Production bundle: 7.12 KB gzip JavaScript and 4.62 KB gzip CSS; packaged extension ZIP 110.57 KB.
- Local Lighthouse: performance 99, accessibility 100, best practices 100, SEO 100; LCP 1.7 s, CLS 0.037, TBT 100 ms.
- Live Lighthouse: performance 100, accessibility 100, best practices 100, SEO 100; LCP 1.4 s, CLS 0.037, TBT 0 ms.
- Live URL: <https://bookmark-freshness-review.sociobot.in/?demo=1>. Both light and dark checks across home, query demo, `/demo`, `/privacy`, and `/terms` had zero serious/critical Axe violations.
- Live 404: <https://bookmark-freshness-review.sociobot.in/not-a-real-route-polish-2> returned HTTP 404 with the designed page and legal links.
- Deployment ID: `c1eeb026-913f-4716-bbe4-1297679492ee`.

No finding of any severity remains open.
