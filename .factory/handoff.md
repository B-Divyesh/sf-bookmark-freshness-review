# Review 2 handoff — Bookmark Freshness Review

Completed 2026-08-29 for work order `bookmark-freshness-review-review-2` against commit `1c617dae7d7f75d02603f81b5ccc6cf19738b3db`.

## Delivered

- Wrote `.factory/review-2.md` with a **FAIL** verdict and six findings.
- Made no product-code, dependency, build, or deployment change.
- Rechecked all 36 findings from review 1 against the live site and source; none require reopening under the same ID.

## Verification

- Fresh clone: `/tmp/bookmark-review2-clean-7eueCt/repo`.
- `npm ci` — passed; 174 packages and zero audit findings.
- Every exact command in `.factory/claims.json` — 17/17 passed as written.
- `npm test` — passed: production build, 10 Vitest tests, and 34 Playwright tests.
- Live cold checks at 390 × 844 and 1440 × 900 — first-read gate passed.
- Live demo edit/reset/exit request and storage probe — web sandbox passed; first complete mobile sample record ended at 744.4px.
- Live `scripts/verify-url.sh` on home, demo, privacy, terms, and 404 — passed.
- Live Axe checks across five routes, mobile/desktop, and light/dark — zero serious or critical findings; no overflow or undersized visible controls.
- Link crawl — all HTTP(S) destinations returned 200; unknown routes returned the designed HTTP 404.

## Blocking evidence left for repair

1. An arbitrary query-string license remains `valid: true` when verification cannot connect. The packaged extension then processed 51 records despite the 50-check free limit.
2. **Paste a license** inside the packaged-extension demo writes `sb_license:bookmark-freshness-review`; that production key survives **Exit demo**.

The review also records one misleading paid heading and three context-free headings. Exact quotes, reproduction evidence, and required tests are in `.factory/review-2.md`.

## Verify after repair

```sh
npm ci
npm test
npm run build
scripts/verify-url.sh http://127.0.0.1:4173/demo
```

Add negative paid-license coverage for invalid and unreachable verification, plus extension-demo license isolation with pre-existing real archive and license sentinels, before requesting another review.
