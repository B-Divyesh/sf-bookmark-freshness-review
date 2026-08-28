# Repair handoff — Bookmark Freshness Review

Completed 2026-08-28 for work order `bookmark-freshness-review-repair-1`.

The repair addresses every release blocker in independent report commit `7e9ee22bf2603780159f32b530efb1b8e9356323` for candidate `edc41441cd09da05d9c97d2a33907fea3f099566`. The browser-extension artifact class and WXT + TypeScript MV3 stack are unchanged.

## Findings repaired

- Claims: `.factory/claims.json` now separates demo storage, real extension storage, and site-resource privacy. Each of its 12 claims has exactly one tagged regression.
- Paid limit: link-check attempts are persisted per bookmark. Failed retries consume another attempt. Legacy checked records count as one attempt. The packaged extension stops at 50 attempts and a valid license removes the cap.
- Mobile targets: site and extension navigation, demo actions, form fields, skip links, and decision buttons have at least 44 px hit boxes. Adjacent controls retain at least 8 px spacing.
- Demo links: simulated sample URLs are plain text. The demo no longer offers six placeholder domains as live destinations.
- URL verification: `scripts/verify-url.sh` is executable and checks HTTP success, title, language, one `h1`, one `main`, image alt text, and browser console errors.
- Real 404: Azure Static Web Apps now rewrites only `/demo`, `/privacy`, and `/terms` to the SPA. Unknown paths preserve HTTP 404 and render the product-specific `404.html`.
- Additional hardening: the light and dark treatments now pass automated serious/critical accessibility checks. The packaged extension also retains notes and decisions offline.

## Exact regression coverage

- `tests/e2e/extension.spec.ts`: real packaged MV3 import/edit storage boundary; exact 50-attempt cap and retry behavior; valid-license unlimited behavior; offline persistence; 390 px targets; dark-theme axe scan.
- `tests/e2e/site.spec.ts`: separate site-resource privacy claim; removal of placeholder outbound links; 390 px target measurements; keyboard filter/decision operation; light and dark axe scans.
- `tests/unit/bookmarks.test.ts`: repeat-attempt accounting, 49/50/51 boundaries, legacy checked-record fallback, and licensed allowance.
- `tests/unit/static-config.test.ts`: explicit SPA routes and a 404 override that does not convert unknown paths to 200.

## Verification evidence

All checks ran from a clean `npm ci` install with Playwright 1.58.2.

- `npm ci`: pass; 174 packages installed; 0 vulnerabilities.
- Every command in `.factory/claims.json`: pass individually; all 12 claim tags occur exactly once.
- `npm run typecheck`: pass. The repository has no separate lint tool; `tsc --noEmit` and `git diff --check` pass.
- `npm test`: pass; production build, 9 Vitest tests, and 18 Playwright tests.
- `npm run build`: pass; produced `dist/site/`, `.output/chrome-mv3/`, and the staged extension ZIP.
- Package smoke: `unzip -t dist/site/downloads/bookmark-freshness-review.zip` reports no errors; its manifest is MV3 with the options page and background service worker.
- Azure SWA emulator: `/`, `/demo`, `/privacy`, and `/terms` returned 200; `/not-a-route` returned 404.
- Restored URL helper: all four public routes passed title, `lang=en`, one `h1`, one `main`, alt-text, and console checks.
- Accessibility: axe found no serious or critical issue across public routes in light and dark treatments or in the real extension dark treatment. Keyboard filter and decision controls passed. Desktop and 390 × 844 screenshots were visually inspected with no clipping or horizontal overflow.
- Offline: the packaged extension displayed its offline state, saved a note, reloaded, and retained the note without network access.
- Privacy: site routes made same-origin requests only. Real extension import/edit persisted under `archive:v1` and made no non-extension request.
- Response policy: 40 concurrent invalid-license requests produced 30 HTTP 200 and 10 HTTP 429 responses; `Retry-After` was 4 seconds.
- Lighthouse 13.4.1 mobile against the production output: Performance 99, Accessibility 100, Best Practices 100, SEO 100; FCP 1.3 s, LCP 1.7 s, TBT 90 ms, CLS 0.
- Budgets: site JS 18,297 bytes raw / 6,747 bytes gzip; CSS 15,928 bytes raw / 4,417 bytes gzip; mobile hero 39,606 bytes; extension ZIP 110,391 bytes.

## Deployment and live identity

Deployed `dist/site/` with `/opt/fleet/lib/deploy-static.sh bookmark-freshness-review dist/site` to the existing Standard Azure Static Web App `sf-bookmark-freshness-review` in Central US (deployment `156fa81a-119d-40f3-ae5c-d8381f2e87d2`).

Live verification at <https://bookmark-freshness-review.sociobot.in>:

- `/`, `/demo`, `/privacy`, and `/terms`: HTTP 200.
- `/not-a-route`: HTTP 404 with the styled recovery page.
- JS, CSS, mobile hero, and downloadable ZIP: SHA-256 match the locally tested production output.
- CSP, HSTS, `X-Content-Type-Options`, `Referrer-Policy`, and `Permissions-Policy`: present.
- Factory URL verifier: pass; no console errors.

## Known gaps

- The Sociobot checkout endpoint currently returns HTTP 404 `enabled factory product`. Product registration is factory-owned and is explicitly outside this repository's billing permissions. License verification is live and returns the documented invalid verdict; its rate limiting is active.
- The packaged build targets Chromium MV3. Firefox and Safari still require separate packaging and signing.
- “Moved or changed” means an HTTP redirect or changed canonical URL; this version does not snapshot or diff page content.
- Some sites block extension requests. Those results remain labelled restricted or failed rather than dead.
