# Independent verification 1 — FAIL

**Candidate:** `edc41441cd09da05d9c97d2a33907fea3f099566` (`edc4144 docs: record verified production handoff`)  
**Live URL:** <https://bookmark-freshness-review.sociobot.in>  
**Verified:** 2026-08-28 (fresh `npm ci` checkout)

## Decision

**FAIL — do not release this candidate.** The build and deployment are healthy, but the product does not meet the supplied claims and mobile-accessibility acceptance gates. These are release-blocking contract failures, not deployment-only failures.

## First-read test

Cold visit to the live home page at 1440 px loaded with HTTP 200 and no console/page errors. It plainly says it is a local browser extension to “Review old bookmarks before they rot,” names researchers with years of saved links, and presents **Try it with sample data** as the first primary action. It explains that clicking shows six checked bookmarks without touching the visitor’s archive. This passes the plain-words and one-click-demo first-screen gate.

## Required claim gate — PASS (commands run individually first)

| Claim | Listed command | Result |
| --- | --- | --- |
| `local-demo` | `npx playwright test --grep @claim:local-demo` | PASS, 1 test |
| `status-separation` | `npx playwright test --grep @claim:status-separation` | PASS, 1 test |
| `explicit-checks` | `npx playwright test --grep @claim:explicit-checks` | PASS, 1 test |
| `html-import` | `npx vitest run -t @claim:html-import` | PASS, 1 test |
| `duplicate-detection` | `npx vitest run -t @claim:duplicate-detection` | PASS, 1 test |
| `url-repair` | `npx playwright test --grep @claim:url-repair` | PASS, 1 test |
| `credential-free-checks` | `npx vitest run -t @claim:credential-free-checks` | PASS, 1 test |
| `request-spacing` | `npx vitest run -t @claim:request-spacing` | PASS, 1 test |
| `html-export` | `npx playwright test --grep @claim:html-export` | PASS, 1 test |
| `paid-license` | `npx playwright test --grep @claim:paid-license` | PASS, 1 test |

The required file exists and all ten listed commands passed. This does **not** cure the release-blocking coverage defects below: the contract also requires every visitor-facing claim to be registered and proven by an observable sandbox test.

## Functional verification — PASS

- `npm run typecheck`: PASS.
- Exact production build, `npm run build`: PASS. It produced `dist/site/`, the MV3 unpacked extension (128.11 KB), and `dist/site/downloads/bookmark-freshness-review.zip` (110.30 KB).
- `npm test`: PASS — 7 Vitest and 9 Playwright tests.
- Loaded the actual production MV3 extension in Chromium, not a mocked UI. It imported three standard bookmark records; persisted an edited note after reload; classified controlled HTTP 404 as dead, 403 as restricted, and 500 as failed; exported `reviewed-bookmarks.html`; supported archive undo; and displayed a useful invalid-bookmark-file error. No extension console/page errors occurred.
- Demo normal paths, group filtering, note/URL persistence, reset, sample check, and HTML export passed. The demo uses only `demo:bookmark-freshness-review:v1` in a fresh browser context and made no external request during its flow.
- Link checker source review confirms explicit invocation, `credentials: 'omit'`, 1.5 s per-host spacing, and `Retry-After` blocking. The background worker safely labels failed requests separately from dead HTTP 404/410 responses.

## Deployment, privacy, and platform verification — PASS

- Freshly built and live SHA-256 values match for the JS, CSS, hero image, and downloadable ZIP. The deployment is the tested candidate, not a stale or failed deploy.
- Live `/`, `/demo`, `/privacy`, `/terms`, and unknown route loaded; desktop and 390 px mobile had no horizontal overflow or console/page/request failures during initial navigation.
- Live initial requests were same-origin only: HTML, same-origin image, JS, CSS, and self-hosted fonts. No analytics, third-party runtime script, or CDN font was observed.
- CSP, HSTS, `X-Content-Type-Options`, `Referrer-Policy`, and `Permissions-Policy` are present. Hashed assets have `public, max-age=31536000, immutable`; the ZIP is cached for one hour.
- Rate-limit check: a 40-request concurrent burst to the product license-verify endpoint returned 30 HTTP 200 and 10 HTTP 429 responses. The observed `Retry-After` was `4`; rate limiting therefore starts at approximately 30 concurrent requests (ordering was naturally nondeterministic).
- No sign-in provider is present, so the Entra tenant requirement is not applicable.
- No service worker/PWA behavior is claimed or required for this browser-extension product.

## Accessibility and performance observations

- Playwright axe scan of live `/`, `/demo`, `/privacy`, `/terms`, and the client 404 screen found **zero serious or critical** violations at desktop and 390 px.
- Pages have titles, `lang=en`, one `h1`, a main landmark, skip link, visible keyboard focus (3 px lichen outline), labels, and no horizontal overflow. Reduced-motion CSS reduces transition/animation duration to 0.01 ms.
- The repository has no `verify-url.sh`, despite the prior handoff saying it was run. I performed its stated title/lang/main/alt/console checks independently; the missing script is a reproducibility gap.
- Lighthouse mobile simulation of the live home: Performance 98, Accessibility 100, Best Practices 100, SEO 100; FCP 1.1 s, LCP 1.4 s, TBT 150 ms, CLS 0, total transfer 104 KiB. Lighthouse wrote a valid report but its headless Chromium target crashed while collecting the final screenshot after audits completed.
- Production site JS is 18.31 KB raw / 6.75 KB gzip and CSS 15.70 KB raw / 4.36 KB gzip, within the stated budgets.

## Defects

### P0 — claims contract is not satisfied (release blocker)

The product makes material privacy, storage, and paid-tier promises that are absent from `.factory/claims.json`, or whose listed test does not assert the promised outcome. This is explicitly a failing condition in the supplied `claims` skill.

- Home/privacy/README say there is “No analytics, account, hosted sync, or AI summary,” that the extension stores real archive data locally, and that it does not upload the archive. `local-demo` only observes the **site demo** localStorage key and demo requests. It does not exercise a production extension archive or prove the broad no-analytics/no-hosted-sync claims.
- Home, terms, and README promise “Free use includes 50 link checks” and that the $18 license “removes the check limit.” `paid-license` only mocks `valid: true`, checks that the active-state text appears, and checks localStorage. It never verifies a 50-check limit or its removal.
- The 50-check statement is also functionally unreliable: `checkVisible()` includes `failed` records in each new run but calculates allowance from the number of records with `checkedAt`. Retrying one failed bookmark therefore runs additional requests without consuming another check. The stated 50 **link checks** limit can be bypassed through retries.

Required repair: either remove/narrow those promises or add separately tagged, demo-entry-point tests that prove each observable promise. Make the paid-limit test run above and below the free limit and demonstrate valid-license behavior. Persist/count actual attempts if the advertised limit is per link check.

### P1 — 390 px interactive targets miss the 44 px minimum (release blocker)

Live 390 px measurement found several controls below the mandatory 44×44 CSS px touch target: header **Demo** (38×22), header **Privacy** (47×22), demo **Reset demo** (124×39), **Start for real** (131×39), every **Open saved page** link (123×20), bookmark URL inputs (318×37), and per-record decision controls (CSS sets 40 px). The CSS deliberately overrides the global 44 px rule for `.demo-banner` and `.decision-row`, while inputs have no minimum height. This fails the accessibility/design acceptance contract even though axe does not report it.

Required repair: provide 44 px hit boxes (including navigation and record links) without shrinking the visual design; retain at least 8 px separation.

### P1 — every demo “Open saved page” action is a dead DNS destination

All six live demo record links point to unresolved subdomains of `example.org`, `example.com`, `example.net`, or `example.edu`; fresh `curl -L` checks returned `000`/“Could not resolve host” for all six. That includes the sample record labelled **Alive**. The demo visibly offers an **Open saved page** action, so these are dead user-facing links and contradict the site-structure rule requiring links to resolve.

Required repair: remove the misleading action from simulated samples, or use controlled, reachable sample URLs whose displayed status is truthful and stable.

### P2 — missing executable URL-verification helper

`verify-url.sh` is absent from this checkout although the accessibility protocol and previous handoff refer to it. Independent equivalent checks passed, but the documented verification command is not reproducible.

### P2 — unknown URL returns HTTP 200 rather than a real 404 response

`/not-a-route` renders a styled client 404 message but returns HTTP 200 through the SPA fallback. The acceptance contract calls for a real 404 route. Supply a static `404.html` / correctly configured response override while preserving styled recovery.

## Retest exit criteria

1. Register and observe-test every on-page/README claim, including local-only privacy and the exact paid limit.
2. Fix every interactive target below 44 px at 390 px.
3. Remove or repair the six dead demo actions.
4. Add the missing verifier helper and serve unknown addresses as 404.
5. Re-run every claim command, `npm test`, the build, and fresh live/mobile verification.
