# Polish round 2 handoff — Bookmark Freshness Review

Completed 2026-08-29 for work order `bookmark-freshness-review-polish-2`. The browser-extension artifact and static deployment class are unchanged.

## Delivered

- Closed all six findings in `.factory/review-2.md` and rechecked all 36 earlier findings.
- Removed optimistic license activation. Invalid, unreachable, and legacy unverified tokens cannot remove the 50-check limit.
- Isolated extension-demo licenses under a `demo:` key and removed all demo keys on Reset and Exit without changing real data.
- Added the required direct `/?demo=1` entry while retaining `/demo` as its canonical alias.
- Rewrote the paid, process, privacy, and demo headings in plain words.
- Updated `.factory/claims.json`, `.factory/demo.md`, `.factory/copy-audit.md`, README, and the verb-first 102-character catalog description.
- Preserved the concrete-and-moss visual system and WXT MV3 extension package.

## Exact verification

- Repair commit deployed: `ea570e81be80e20a8206902995188154c994b942`.
- Clean clone: `/tmp/bookmark-polish2-claims-lxnvbT/repo`.
- `npm ci`: passed; 174 packages, zero audit findings.
- All 17 exact claim commands from `.factory/claims.json`: passed independently; summary at `/tmp/bookmark-polish2-claim-summary.json`, individual logs at `/tmp/bookmark-polish2-claim-<id>.log`.
- Clean-clone `npm test`: passed; lint and claims validation, production build, 10 Vitest tests, and 38 Playwright tests.
- `npm run build`: passed and wrote `dist/site/`; site JavaScript is 7.12 KB gzip, CSS is 4.62 KB gzip, and the extension ZIP is 110.57 KB.
- Local `scripts/verify-url.sh` passed on `/`, `/?demo=1`, `/privacy`, and `/terms` with no console errors.
- Browser coverage passed for keyboard operation, route focus/history, mobile touch targets and overflow, light/dark Axe scans, privacy request capture, offline edits, metadata, download, and real HTTP 404 behavior.
- Local Lighthouse: performance 99, accessibility 100, best practices 100, SEO 100; LCP 1.7 s, CLS 0.037, TBT 100 ms.
- Live Lighthouse: performance 100, accessibility 100, best practices 100, SEO 100; LCP 1.4 s, CLS 0.037, TBT 0 ms.

## Deployment and live proof

- Production: <https://bookmark-freshness-review.sociobot.in>
- One-click isolated demo: <https://bookmark-freshness-review.sociobot.in/?demo=1>
- Deployment ID: `c1eeb026-913f-4716-bbe4-1297679492ee`.
- Live `verify-url.sh` passed on home, query demo, `/demo`, `/privacy`, and `/terms`: correct title/lang, one h1/main, no missing alt, and no console errors.
- Home, query demo, `/demo`, `/privacy`, and `/terms` returned HTTP 200; the extension ZIP returned 200; an unknown route returned the designed HTTP 404.
- Cold 390 × 844 demo check showed the banner, Reset/Exit controls, and a complete sample record ending at 818 px. Screenshot: `.factory/polish-2-live-demo-mobile.png`.
- Live light and dark scans across all public routes reported zero serious/critical Axe violations.
- Live aborted license verification showed the 50-check-limit error, did not show paid status, and stored no token.
- Live `/?demo=1&license=…` made no billing request, stripped the license parameter, and left real-license storage empty.

## Run and verify

```sh
npm ci
npm test
npm run build
scripts/verify-url.sh 'http://127.0.0.1:4173/?demo=1'
```

## Known gaps and next steps

No known acceptance gaps or unresolved review findings. Checkout remains intentionally paused, as documented and tested, until product registration is available.
