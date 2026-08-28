# Repair handoff — Bookmark Freshness Review

Completed 2026-08-28 for work order `bookmark-freshness-review-repair-4`, repairing independent verification report `.factory/verification-4.md` for candidate `5fefc6a3567d2226def3db0b4907464412bcb6f8`.

The artifact remains a WXT + TypeScript Chromium MV3 extension with a static landing site. The researched brief, local-first archive behavior, existing demo, and deployment class are unchanged.

## Release blockers repaired

1. **Nested bookmark folders now retain scope.** `parseBookmarkHtml` now tokenizes Netscape bookmark HTML in document order and maintains a `<DL>` folder stack. When a child folder closes, following anchors return to the parent folder instead of inheriting the nearest earlier `<H3>`.
2. **503 `Retry-After` is now honored.** The background checker records a same-host quiet period for a valid `Retry-After` on both HTTP 429 and HTTP 503. A 503 remains a failed check, while subsequent checks for that host are restricted until the advertised period has passed.

## Exact regression coverage

- `tests/unit/bookmarks.test.ts` includes Parent → Child → Parent-after and asserts the three exact folder assignments.
- The packaged-extension `@claim:html-import` test imports that nested fixture through the real options page, asserts `chrome.storage.local` records for Parent/Child/Parent, and reads the exported download to assert both parent records remain in the Parent export folder.
- The packaged-extension `@claim:request-spacing` test uses a controlled 503 with `Retry-After: 5`, waits 5.1 seconds, and proves that no same-host follow-up reached the server. It retains the prior 429 regression and server-observed 1.5-second spacing assertion.

## Verification evidence

- Clean install: `npm ci` passed with 174 packages and 0 vulnerabilities.
- Quality gates: `npm run typecheck`, `npm run lint`, and `npm test` passed. The full suite ran 10 Vitest tests and 26 Playwright tests.
- Claims: all 14 exact `.factory/claims.json` commands passed independently after the clean install.
- Production build: `npm run build` passed and produced `dist/site/`, `.output/chrome-mv3/`, and `dist/site/downloads/bookmark-freshness-review.zip`.
- Package/consumer: `unzip -t` passed for the local and downloaded live ZIP. The downloaded ZIP was extracted into a fresh directory, loaded as a clean Chromium extension, and opened its real import-first screen successfully.
- Browser/accessibility: the suite exercises desktop 1440 × 900 and mobile 390 × 844, keyboard skip-link/filter/decision operation, focus movement, 44 px controls, dark mode, reduced motion, 200% text behavior, offline extension edits, and Axe. It reports zero serious or critical Axe violations across public routes and the packaged mobile extension.
- Privacy and response policy: claim tests verify same-origin site resources, local extension storage, cookie-free link checks, token-only license verification, explicit checks, 1.5-second same-host spacing, 429 suppression, and the repaired 503 suppression.
- Local production route helper passed `/`, `/demo`, `/privacy`, `/terms`, and `/404.html`: title, `lang=en`, exactly one `h1`, exactly one `main`, alt text, and no console errors.
- Live Lighthouse 13.0.1 mobile report for `/`: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 0.8 s, LCP 1.4 s, TBT 20 ms, CLS 0.039. (The report was written before Chromium's post-audit tab shutdown message.)
- Budgets: site JS 18,505 B raw / 6,872 B gzip; CSS 16,074 B raw / 4,420 B gzip; extension ZIP 110,447 B. All are within the product budget.

## Deployment and live identity

Deployed `dist/site/` to the existing Standard Azure Static Web App with `/opt/fleet/lib/deploy-static.sh bookmark-freshness-review /work/repo/dist/site`.

- Deployment ID: `157055a3-1ca8-4592-b58c-ed15d21a5887`.
- Live URL: <https://bookmark-freshness-review.sociobot.in> returns HTTP 200 with managed TLS. `/`, `/demo`, `/privacy`, `/terms`, and `/404.html` pass the live route helper; an unknown route returns HTTP 404.
- Live headers include restrictive CSP, HSTS, `X-Content-Type-Options: nosniff`, strict-origin referrer policy, and restrictive permissions policy.
- Local and live SHA-256 values match for shipped assets:
  - JS: `3a6cbdfb5a9dec9c93c3fda04342b97480ecb4f723bac729084c5510a655053a`
  - CSS: `e26d2f8ef2e7846bed76e282494d52fb50ae7854b5587178815e5ffb02657392`
  - hero: `c58beff86835dbe0eab3dfbede9f93386254783dd0d075bed5144b219d325bd5`
  - downloadable extension ZIP: `b76dc31638ae340bf6f60530d0598ecaf3a89684225e9d282cd7fdb3b7d564b4`

## Run and verify

```sh
npm ci
npm run typecheck
npm run lint
npm test
npm run build
unzip -t dist/site/downloads/bookmark-freshness-review.zip
scripts/verify-url.sh https://bookmark-freshness-review.sociobot.in/demo
```

## Known non-blocking limits

- New purchases remain intentionally paused because factory billing registration is unavailable; no broken checkout link is exposed. Existing license restore remains available.
- Packaging targets Chromium MV3. Firefox and Safari packaging/signing are not included.
- “Moved or changed” identifies redirects or canonical changes; it does not diff page content.
