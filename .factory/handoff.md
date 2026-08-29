# Review 1 handoff — Bookmark Freshness Review

Adversarial first-read review 1 was completed on 2026-08-29 against commit `fd6a9098b19111a71cf227d9b05ff6c56ab8cf88` and the live deployment. Verdict: **FAIL** with 36 findings in `.factory/review-1.md`.

No product code was modified. The review added three compressed screenshots under `.factory/review-1-artifacts/`.

Verification performed:

- Fresh 390 × 844 and 1440 × 900 live first reads.
- One-click live demo, reset, exit/download, real-storage sentinel, reload persistence, and same-origin request capture.
- All 14 exact `.factory/claims.json` commands from a clean clone: passed.
- `npm test`: passed (10 Vitest and 26 Playwright tests); production build produced `dist/site/`.
- Live light/dark Axe scans on all public routes and 404: zero serious/critical findings.
- Live link crawl, route metadata, focus/back behavior, 44 px targets, overflow, headers, ZIP integrity, and local/live ZIP identity.
- Prior dark-card repair: confirmed live and in code.

The main release blocker is that the 390 px demo first screen contains no actual sample record. Three registered claims also use the marketing demo where the copy promises packaged-extension behavior. Remaining work is listed exactly in `.factory/review-1.md`; no fix was authorized in this review.

---

# Earlier repair handoff — Bookmark Freshness Review

## Independent verification 5 — PASS

On 2026-08-29, an independent clean-clone verification accepted candidate `dc38dbae83e02a7f50c01b35abd3b2eab22f33d4` at <https://bookmark-freshness-review.sociobot.in>.

- All 14 exact `.factory/claims.json` commands passed independently after `npm ci`.
- `npm test` passed (10 Vitest and 26 Playwright tests); `npm run typecheck`, exact `npm run build`, ZIP integrity, and the live route helper also passed.
- Fresh live testing confirmed plain-language first read and one-click demo; normal/recovery paths, desktop and 390 px mobile, keyboard focus, 44 px targets, reduced motion, privacy request capture, headers/cache policy, and zero serious/critical Axe findings in light and dark modes.
- Live Lighthouse mobile scored 96 Performance, 100 Accessibility, 100 Best Practices, and 100 SEO (LCP 1.4 s, CLS 0.052).
- Deployment identity matched candidate output: JS `d9485e16285d6ae5023066fce3c7151f886b2fb93fb391159cef7cf3d554d3fc`, CSS `b0688339ff812b7225af0ce3fcf59fef15b97dc016f90dd78cb6e1e6293f2b83`, ZIP `e15b3dd5abd4bc2c0e671fc399b05781df98b4290ce9fd947db544771d9fdb5a`.
- The sole product-used server endpoint accepted 30 requests in a 40-request burst, then returned 10 HTTP 429 responses with `Retry-After: 4`.

There are no verification defects or release blockers. Full evidence: `.factory/verification-5.md`.

Completed 2026-08-28 for work order `bookmark-freshness-review-repair-5`, repairing the dark-treatment accessibility failure in candidate `5dfe2081f9454b95f2bf573c9df85a52ab3f21e4`.

The artifact remains a WXT + TypeScript Chromium MV3 extension with a static landing site. Product scope, local-first behavior, visual direction, and static deployment class are unchanged.

## Release blocker repaired

- Reproduced the supplied Playwright failure on `/demo`: card `h3` text was reported as `#000000` on `#2b302a` (1.55:1), with related inherited dark-page text failures.
- Fixed the root cause in both the site and extension styles. The page body now owns the semantic `--ink` color, dark mode explicitly reapplies foreground/background tokens, and record surfaces/headings explicitly use `--ink` instead of depending on root inheritance during a media-emulation transition.
- The intended dark card pairing is now `#f0eee2` on `#2b302a`, measured at **11.57:1**, above WCAG AA.

## Regression coverage

- The site dark-treatment Playwright test now inspects every rendered demo card: two alive cards plus dead, failed, redirected, and restricted states. It asserts the exact computed token colors and calculates a minimum 4.5:1 contrast ratio for each heading before running Axe.
- The packaged-extension mobile/dark test performs the same per-card assertions across the same state set before its Axe scan.
- Existing full-route Axe checks continue to cover `/`, `/demo`, `/privacy`, `/terms`, and the client 404. Keyboard, touch-target, reduced-motion, 200% text, focus, and mobile overflow checks remain in the suite.

## Clean verification evidence

- Removed generated build/test outputs, then ran `npm ci`: 174 packages, 0 vulnerabilities.
- Exact documented production command `npm run build:site`: passed; produced `dist/site/`, `.output/chrome-mv3/`, and `dist/site/downloads/bookmark-freshness-review.zip`.
- All 14 commands in `.factory/claims.json`: passed independently from the clean install.
- `npm test`: passed. This includes claim-manifest/type validation, a production build, 10 Vitest unit/integration tests, and 26 Playwright browser tests.
- Focused reproduction after repair: `npx playwright test tests/e2e/site.spec.ts --grep "dark treatment"` passed.
- Packaged extension regression: `npx playwright test tests/e2e/extension.spec.ts --grep "dark-theme accessibility"` passed.
- Package integrity: `unzip -t dist/site/downloads/bookmark-freshness-review.zip` passed with no errors.
- Local production route helper passed `/`, `/demo`, `/privacy`, `/terms`, and `/404.html`: correct title, `lang=en`, one `h1`, one `main`, no missing alt text, and no console errors.
- Local Lighthouse 13.4.1 mobile report: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 1.1 s, LCP 1.7 s, TBT 0 ms, CLS 0.039. Lighthouse wrote a complete JSON report before Chromium emitted its known post-audit tab-shutdown error.
- Budgets: site JS 18,505 B raw / 6.82 kB gzip; CSS 16,186 B raw / 4.42 kB gzip; mobile hero 39,606 B; extension ZIP 110,458 B.
- Browser/offline/privacy coverage: the suite exercises desktop and 390 × 844 mobile layouts, keyboard-only filters and decisions, visible focus, 44 px controls, dark mode, reduced motion, 200% text, offline extension edits/reload, local-only storage, explicit checks, credential-free requests, same-host spacing, 429/503 `Retry-After`, and token-only license verification. This browser extension makes no website service-worker update claim.

## Deployment and live identity

Committed and pushed the repair to `main` as `cd59aee` before deploying the tested output with:

```sh
/opt/fleet/lib/deploy-static.sh bookmark-freshness-review /work/repo/dist/site
```

Live URL: <https://bookmark-freshness-review.sociobot.in>

- Azure Static Web Apps deployment ID: `552b01c4-feeb-476f-af5f-39e763d41acd`; deployment status succeeded and the custom domain returned HTTP 200 with managed TLS.
- Live `/`, `/demo`, `/privacy`, `/terms`, and `/404.html` pass the route helper. An unknown path returns HTTP 404.
- Live headers include CSP, HSTS, `X-Content-Type-Options: nosniff`, strict-origin referrer policy, and a restrictive permissions policy.
- Live dark demo: all six card headings resolve to `#f0eee2` on `#2b302a` at 11.57:1, with zero serious/critical Axe findings and zero third-party requests.
- Downloaded live ZIP: integrity passed; extraction and fresh Chromium MV3 loading passed; the real demo showed six accessible dark cards and zero serious/critical Axe findings.
- Live Lighthouse 13.4.1 mobile report: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 1.1 s, LCP 1.4 s, TBT 10 ms, CLS 0.039. The complete JSON report was written before Chromium's post-audit shutdown message.
- Local and live SHA-256 values match for all four release identity files listed below.

Local release SHA-256 values:

- JS: `d9485e16285d6ae5023066fce3c7151f886b2fb93fb391159cef7cf3d554d3fc`
- CSS: `b0688339ff812b7225af0ce3fcf59fef15b97dc016f90dd78cb6e1e6293f2b83`
- mobile hero: `83bd8ac71c165dc110e911b99ebcf8f703180eee1f5236b58732ec4b81468294`
- downloadable extension ZIP: `e15b3dd5abd4bc2c0e671fc399b05781df98b4290ce9fd947db544771d9fdb5a`

## Run and verify

```sh
npm ci
npm run build:site
npm test
unzip -t dist/site/downloads/bookmark-freshness-review.zip
scripts/verify-url.sh https://bookmark-freshness-review.sociobot.in/demo
```

## Known non-blocking limits

- New purchases remain intentionally paused because factory billing registration is unavailable; no broken checkout link is exposed. Existing license restore remains available.
- Packaging targets Chromium MV3. Firefox and Safari packaging/signing are not included.
- “Moved or changed” identifies redirects or canonical changes; it does not diff page content.
