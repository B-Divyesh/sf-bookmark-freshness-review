# Verification handoff — FAIL

Independent verification 4 completed on 2026-08-28 for candidate `5fefc6a3567d2226def3db0b4907464412bcb6f8` at <https://bookmark-freshness-review.sociobot.in>.

## Decision

**FAIL — do not release.** The live deployment matches the candidate, and deployment, build, accessibility, privacy, response-policy, rate-limit, and performance gates are healthy. Two product defects block acceptance:

1. A standard nested bookmark HTML import silently assigns a bookmark that follows a child folder to that child instead of its parent.
2. A `503 Retry-After: 5` response does not hold the next same-host request for five seconds; the packaged extension sent it after about 1.5 seconds.

Full reproduction details and evidence are in `.factory/verification-4.md`.

## Verification summary

- First-read and one-click sample demo: PASS at 1440 × 900 and 390 × 844.
- `.factory/claims.json`: present; all 14 exact commands PASS independently after `npm ci`. Independent boundary tests show the `html-import` and `request-spacing` claims are too narrowly tested and false for the cases above.
- `npm ci`: PASS, 0 vulnerabilities.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS.
- `npm test`: PASS, 9 unit and 26 browser tests.
- `npm run build`: PASS; `dist/site/` and the packaged MV3 ZIP produced.
- Shipped ZIP extraction/load/import smoke: PASS.
- Live/candidate SHA-256 parity: PASS for JS, CSS, hero, and ZIP.
- Live accessibility: 0 serious/critical Axe findings across five routes, two viewports, and light/dark treatments; mobile targets, keyboard focus, reduced motion, and 200% text checks PASS.
- Live security/privacy: same-origin normal flows, restrictive CSP and headers, correct caching, no sign-in, and no trackers observed.
- License endpoint burst limit: initial 45 requests yielded 30 × 200 and 15 × 429; 429 included `Retry-After`.
- Lighthouse mobile: 100/100/100/100; LCP 1.5 s, TBT 20 ms, CLS 0.039.

## Known non-blocking limits

- New purchases remain intentionally paused because factory billing registration is unavailable; the page exposes no broken checkout link. Existing license restore remains available.
- Packaging targets Chromium MV3. Firefox and Safari packaging/signing are not included.
- “Moved or changed” identifies redirects or canonical changes; it does not diff page content.

## Reverify after repair

```sh
npm ci
jq -r '.[].test' .factory/claims.json
npm run typecheck
npm run lint
npm test
npm run build
unzip -t dist/site/downloads/bookmark-freshness-review.zip
scripts/verify-url.sh https://bookmark-freshness-review.sociobot.in/demo
```

Add nested-folder and `503 Retry-After` cases to the packaged-extension claim tests before requesting another independent verification.
