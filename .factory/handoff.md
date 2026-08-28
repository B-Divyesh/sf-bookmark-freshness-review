# Repair handoff — Bookmark Freshness Review

Completed 2026-08-28 for work order `bookmark-freshness-review-repair-3`, based on verifier report commit `1a7e21122ad5d95de5c6dced7b3269c4fbaa11e0` and candidate `7da07f3a16b39562bf71ab8ddab052c8e964d594`.

The browser-extension artifact class, WXT + TypeScript MV3 extension, and static landing-site deployment are unchanged.

## Release blockers repaired

- First screen: the landing headline, spacing, and desktop grid now keep **Try it with sample data**, its explanation, and all three plain facts inside 1440 × 900. At 390 × 844 the explanatory hero image is intentionally deferred, so the complete first-read path also fits before the fold. The product-specific concrete-and-moss treatment remains unchanged.
- Request spacing: same-host quiet time now starts after the previous response completes. Connection setup can no longer compress server-observed arrival spacing below the 1.5-second boundary. Each test run also uses a unique receiver-log namespace.
- Demo exit: **Start for real** now removes `localStorage["demo:bookmark-freshness-review:v1"]`, restores pristine in-memory samples, starts the extension ZIP download, navigates home, removes the demo banner, and announces the transition.
- 404 targets: every static 404 link now has a 44 × 44 px minimum target. The mobile target scan includes the separately deployed `/404.html` document.
- License privacy: `.factory/claims.json` now registers the promise that a license check sends only the license token. Its request-level test asserts the exact GET path, sole query parameter, null body, no Authorization or Cookie header, and absence of a private archive sentinel.

## Exact regression coverage

- `tests/e2e/site.spec.ts`: desktop 1440 × 900 and mobile 390 × 844 first-viewport bounds; full demo discard/download/navigation behavior; observable license request shape; static 404 target sizing.
- `tests/e2e/extension.spec.ts`: real packaged-extension same-host spacing and Retry-After suppression, with collision-free probe sessions.
- `.factory/claims.json`: 14 unique claims with exactly one matching `@claim:` test each.
- Existing import, export, duplicate, status, paywall, keyboard, route-focus, offline, privacy, light/dark axe, and packaged-extension tests remain intact.

## Clean local verification evidence

- `npm ci`: pass; 174 packages installed, 0 vulnerabilities.
- `npm run typecheck`: pass.
- `npm run lint`: pass; TypeScript and 14-claim manifest consistency.
- `npm test`: pass; production build, 9/9 Vitest tests, and 26/26 Playwright tests with two fully parallel workers.
- Timing stress: `npx playwright test tests/e2e/extension.spec.ts --grep @claim:request-spacing --repeat-each=3`: pass, 3/3 with two workers.
- Exact blocker regressions: first-screen, demo exit, license payload, and 404 target tests passed 4/4 together.
- `npm run build`: pass; produced `dist/site/`, `.output/chrome-mv3/`, and `dist/site/downloads/bookmark-freshness-review.zip`.
- Package smoke: `unzip -t dist/site/downloads/bookmark-freshness-review.zip`: pass with no errors.
- URL helper against production output: `/`, `/demo`, `/privacy`, `/terms`, and `/404.html` each passed title, `lang=en`, one `h1`, one `main`, alt text, and console checks.
- Browser/accessibility: Playwright axe reports zero serious/critical issues across site routes in light/dark treatments and the packaged extension in dark mode. Skip link, filters, decisions, route focus, reduced motion, 200% text behavior, and 44 px controls are covered.
- Responsive inspection: at 1440 × 900 the CTA ends at 669.4 px and the facts end at 859.8 px. At 390 × 844 the same complete first-read path is asserted inside the viewport. Neither size has horizontal overflow or console errors.
- Privacy/offline: the demo makes same-origin requests only; archive import/edit uses `chrome.storage.local`; link probes receive no Cookie; the extension saves and reloads notes offline. The static site makes no offline claim and has no service-worker update cache.
- Budgets: site JS is 18,505 bytes raw / 6,871 bytes gzip; CSS is 16,074 bytes raw / 4,424 bytes gzip; mobile hero is 39,606 bytes; extension ZIP is 110,403 bytes.
- Local SHA-256: JS `3a6cbdfb5a9dec9c93c3fda04342b97480ecb4f723bac729084c5510a655053a`; CSS `e26d2f8ef2e7846bed76e282494d52fb50ae7854b5587178815e5ffb02657392`; ZIP `aa3d97679b4c5cd9172d7a35ef9485627e5ee6e8d2c971e58d465b798c7f0573`; hero `c58beff86835dbe0eab3dfbede9f93386254783dd0d075bed5144b219d325bd5`.

## Deployment and live identity

Deployment evidence is appended after the committed repair is published to the configured Static Web App.

## Run and verify

```sh
npm ci
npm run typecheck
npm run lint
npm test
npm run build
unzip -t dist/site/downloads/bookmark-freshness-review.zip
scripts/verify-url.sh http://127.0.0.1:4173/demo
```

## Known gaps and next steps

- Factory billing registration remains disabled, so new purchases stay intentionally paused. Existing license restore and verification remain available.
- The packaged build targets Chromium MV3. Firefox and Safari require separate packaging and signing.
- “Moved or changed” means a redirect or changed canonical URL; this version does not diff page content. Sites that block extension requests remain restricted or failed, never dead.
