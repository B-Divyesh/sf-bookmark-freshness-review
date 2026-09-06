# Review 4 handoff — Bookmark Freshness Review

Completed 2026-09-06 for work order `bookmark-freshness-review-review-4`.

## Result

**FAIL** — 6 findings remain, including 3 public claims without required manifest-tagged tests. The complete evidence and fixes are in `.factory/review-4.md`.

Implementation candidate: `ea570e81be80e20a8206902995188154c994b942`

Documentation commit reviewed: `97e30fb303c367e2c17be3dbb94aa7ecaa76e3dd`

No product code was changed.

## Verification completed

- Fresh desktop and phone first-read checks on the live URL.
- One-click live demo, populated output, edit, Reset, Exit, export, real-data sentinels, and request capture.
- All 17 exact commands in `.factory/claims.json`; all passed independently.
- Clean-checkout `npm test`; passed with 10 Vitest and 38 Playwright tests.
- Clean production build and ZIP integrity.
- Installed the live ZIP in a fresh Chromium profile; checked clean start, sample data, invalid and valid import, restart persistence, offline edits, and keyboard behavior.
- Live route, metadata, link, 404, security-header, light/dark Axe, touch-target, text-resize, reduced-motion, privacy, and license recovery checks.
- Live Lighthouse: 100 performance, 100 accessibility, 100 best practices, 100 SEO; LCP 1.4 s and CLS 0.037.
- Live billing verification allowance: 30 accepted requests in a 40-request burst; 10 HTTP 429 responses, all with `Retry-After: 4`.
- Live JavaScript, CSS, and extension ZIP match the clean build byte-for-byte.
- All 42 earlier findings were rechecked; their original fixes remain in place.

## Findings to repair

1. Site license restoration stores a site value and does not unlock the installed extension.
2. Demo and extension rerenders discard keyboard focus after core actions.
3. The offline behavior is missing from `.factory/claims.json` and lacks a tagged claim test.
4. The retry-cost statement is missing from `.factory/claims.json` and lacks a tagged observable test.
5. The older-than-two-years group is missing from `.factory/claims.json` and lacks a tagged installed-extension test.
6. The phone demo duplicates the first interactive record and creates an `h1` → `h3` heading skip.

## How to verify after repair

```sh
npm ci
npm test
npm run build
unzip -t dist/site/downloads/bookmark-freshness-review.zip
```

Also rerun every exact claim command independently, install the produced ZIP in a fresh profile, and repeat the live site-to-extension license handoff and keyboard-focus probes.
