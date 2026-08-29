# Polish round 1 — finding closure

Candidate repaired: `dc38dbae83e02a7f50c01b35abd3b2eab22f33d4`  
Review closed: `ed93292811324db13a2e967bf4a8c3fe76da1f80`

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Added a compact, complete sample record before mobile filters and asserted its bottom edge at 390 × 844. | `mobile demo stays within the viewport` |
| F-1-2 | Moved `explicit-checks` to packaged-extension request-idle/action coverage. | `@claim:explicit-checks` |
| F-1-3 | Moved URL repair to packaged-extension storage, reload, and export coverage. | `@claim:url-repair` |
| F-1-4 | Tested unlicensed export with 51 kept records after the check limit. | `@claim:html-export` |
| F-1-5 | Removed checkout/card-data promises while checkout is paused. | `@claim:checkout-paused` |
| F-1-6 | Rewrote browser-specific import wording to standard bookmark HTML. | `@claim:html-import` |
| F-1-7 | Expanded separated result coverage to dead, restricted, moved, and failed. | `@claim:status-separation` |
| F-1-8 | Added persistent keep/review/archive storage and export coverage. | `@claim:decision-persistence` |
| F-1-9 | Narrowed free-tier copy to the tested 50-check limit and free export. | `@claim:paid-license`, `@claim:html-export` |
| F-1-10 | Removed the unverifiable page-content timing promise. | Copy audit |
| F-1-11 | Removed the refund-revocation promise while checkout is paused. | Copy audit |
| F-1-12 | Removed the cross-device restoration promise. | Copy audit |
| F-1-13 | Removed the exclusive-destination promise. | Copy audit |
| F-1-14 | Added six-record, all-result demo-seed claim coverage. | `@claim:demo-seed` |
| F-1-15 | Added saved year to records and asserted ledger fields. | `@claim:bookmark-ledger` |
| F-1-16 | Seeded a real-storage sentinel and tested edit, reset, exit, and isolation. | `@claim:local-demo` |
| F-1-17 | Removed browser-uninstall deletion promise. | Copy audit |
| F-1-18 | Removed undocumented browser-settings deletion promise. | Copy audit |
| F-1-19 | Rewrote throttle language as an acceptable-use obligation. | `/terms` route test |
| F-1-20 | Set route-specific title, description, canonical, OG, and Twitter metadata; completed static 404 metadata. | `routes update title…`, `static 404…` |
| F-1-21 | Gave static 404 the standard header, footer, factory link, build ID, and product one-liner. | `static 404…` |
| F-1-22 | Routed `/#how`, focused its heading, and announced the destination. | `internal links resolve…` |
| F-1-23 | Rewrote headline to “Review and clean up old bookmarks.” | `.factory/copy-audit.md` |
| F-1-24 | Renamed “Review bench” to “Bookmark review preview.” | `.factory/copy-audit.md` |
| F-1-25 | Renamed “Three passes” to “How bookmark review works.” | `.factory/copy-audit.md` |
| F-1-26 | Renamed “Clear boundary” to “Where bookmark data goes.” | `.factory/copy-audit.md` |
| F-1-27 | Rewrote privacy heading to browser-storage wording. | `.factory/copy-audit.md` |
| F-1-28 | Rewrote caption with keep, repair, and archive choices. | `.factory/copy-audit.md` |
| F-1-29 | Rewrote footer with browser-storage information. | `.factory/copy-audit.md` |
| F-1-30 | Renamed license action “Restore a license.” | Site route test |
| F-1-31 | Renamed demo exit action “Download extension and exit demo.” | `Start for real downloads…` |
| F-1-32 | Rewrote 404 label to “404 · page not found.” | `static 404…` |
| F-1-33 | Rewrote 404 action to “Return to home.” | `static 404…` |
| F-1-34 | Replaced “browser-context” with “browser profile.” | `.factory/copy-audit.md` |
| F-1-35 | Standardized imported collection wording as bookmark archive/archive. | `.factory/copy-audit.md` |
| F-1-36 | Standardized link check, failed check, and moved or changed terms. | `.factory/copy-audit.md` |

Local evidence before deployment: `npm test` passed (10 Vitest, 34 Playwright), all 17 claims passed through the suite, and `npm run build` wrote `dist/site/`. Post-deploy evidence and the final live URL are recorded in `.factory/handoff.md`.
