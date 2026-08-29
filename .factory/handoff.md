# Polish 1 handoff — Bookmark Freshness Review

Completed 2026-08-29 for `bookmark-freshness-review-polish-1`.

## Delivered

- Repaired every finding in `.factory/review-1.md`; the ID-by-ID mapping is in `.factory/polish-1.md`.
- Preserved the concrete-and-moss visual system and Chromium MV3 extension + static-site artifact class.
- Made `/demo` and extension `?demo=1` isolated sample paths with reset/exit actions. The 390 × 844 live first screen now contains a complete sample record; evidence: `.factory/polish-1-live-demo-mobile.png` (record bottom: 744 px).
- Added 17 registered, uniquely tagged claim tests in `.factory/claims.json`, including extension-level explicit checking, URL repair, entitlement-safe export, and decision persistence.
- Rewrote landing, README, legal, demo, footer, and 404 copy in plain words. The catalog description is verb-first and 75 characters.
- Added per-route metadata, static 404 metadata and shared skeleton, and cross-route heading focus/announcement.

## Verification

Fresh clone: `/tmp/bookmark-freshness-review-clean-02870f9` at commit `02870f9b5220e5d88315858508211e5674f487be`.

- `npm ci` — passed, 0 vulnerabilities.
- Every one of the 17 exact commands in `.factory/claims.json` was run independently from that fresh clone — all passed.
- Current checkout: `npm test` — passed: claims manifest/type validation, production build, 10 Vitest tests, and 34 Playwright tests.
- `npm run build` — passed; produced `dist/site/`.
- `unzip -t dist/site/downloads/bookmark-freshness-review.zip` — passed.
- Final ZIP SHA-256: `3cde121fed19ee20968cd1cbb9980d9c58c97c0965c1c655b80a39ee89a9bb52`.
- Budget: initial site JS 19,622 B raw / 6.92 kB gzip; CSS 17,185 B raw / 4.62 kB gzip.
- `scripts/verify-url.sh` passed locally and live for `/`, `/demo`, `/privacy`, `/terms`, and `/404.html`: title, lang, one h1, main, alt text, and no console errors.
- Playwright Axe found 0 serious/critical violations for every public route, dark treatment, and direct static 404. The standalone Axe CLI was attempted but cannot locate a system Chrome binary in this container; the Playwright Chromium-based Axe scan is the recorded accessibility evidence.
- Live cold check: all four main route titles/canonicals were correct; Axe found 0 serious/critical violations; unknown route returned HTTP 404; mobile demo record bottom was 744 px. Screenshot: `.factory/polish-1-live-demo-mobile.png`.

## Deployment

- Repair commits: `02870f9b5220e5d88315858508211e5674f487be`, `e82101562e11b8070a0687f371396b420ef4f16a`.
- Pushed to `main` and deployed with `/opt/fleet/lib/deploy-static.sh bookmark-freshness-review /work/repo/dist/site`.
- Azure Static Web Apps deployment ID: `0e86fbb1-dd1a-450d-9b65-a593d8879ee4` (Succeeded).
- Live URL: <https://bookmark-freshness-review.sociobot.in>.

## Known gaps

None from the cumulative review. New purchases remain intentionally paused because checkout registration is unavailable; no checkout link or payment-data promise is exposed.

## Run locally

```sh
npm ci
npm test
npm run build
scripts/verify-url.sh http://127.0.0.1:4174/demo
```
