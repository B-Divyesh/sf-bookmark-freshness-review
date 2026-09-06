# Repair 6 handoff — Bookmark Freshness Review

Completed 2026-09-06 for work order `bookmark-freshness-review-repair-6`.

## Result

**PASS** — the six Review 4 findings are repaired. The product remains a local-first browser extension for researchers and professionals reviewing old saved links.

Implementation candidate deployed: `e1cdad8f3c618367b1abc2b470b707ec74cac660`.

The implementation is deployed to `https://bookmark-freshness-review.sociobot.in` as static deployment `2a41e4f7-34a1-4311-a966-3fe9a7905c22`. The live JavaScript, CSS, and extension ZIP matched the final clean build.

## Repairs

1. The site no longer treats a returned license token as a site-local activation. It removes the token from the URL and tells the buyer to paste it in the installed extension’s Link-check limit section. A fresh installed live ZIP proved that a verified pasted token removes the 50-check limit.
2. Demo and extension actions now restore keyboard focus after decisions, note edits, URL edits, checks, and reset.
3. The extension offline/recovery behavior is now an explicit `offline-review` claim with an installed-extension outcome test.
4. The retry behavior is now an explicit `retry-attempt` claim with an outcome test that proves the visible and stored attempt count increases.
5. The older-than-two-years group is now an explicit `older-than-two-years` claim with a frozen-time installed-extension boundary test.
6. The phone demo has one real first record rather than a duplicated mobile-only control set. Its heading order is valid and the complete first record fits inside a 390 × 844 viewport.

Earlier review fixes remain in place: nested bookmark parsing, distinct failed-request wording and retry behavior, demo/real-data isolation, metadata and 404 structure, touch targets, privacy request limits, and real extension persistence.

## Verification

From a clean dependency install:

```sh
npm ci
npm test
npm run build
unzip -t dist/site/downloads/bookmark-freshness-review.zip
```

- `npm ci` completed with 0 reported vulnerabilities.
- `npm test` passed: claim lint for 20 unique claims, production build, 10 Vitest tests, and 42 Playwright tests.
- Every one of the 20 literal commands listed in `.factory/claims.json` was run independently and passed.
- Final build passed, ZIP integrity passed, and `git diff --check` passed. Site output: 6.66 kB gzip JavaScript and 4.65 kB gzip CSS; packaged extension: 110.66 kB.
- A fresh consumer profile installed the ZIP downloaded from the live site. It completed sample mode, real HTML import, reload persistence, offline note edit/reload, and keyboard interaction.
- Fresh desktop and 390 × 844 phone checks found the job, audience, and **Try it with sample data** action before scrolling. One click showed labeled sample data and a populated first review record. Reset changed no real-data sentinel or real license sentinel.
- Live `verify-url.sh` passed for home, both demo URLs, Privacy, Terms, and 404. The intentional unknown-route HTTP 404 showed the designed recovery page.
- Live link crawl returned 2xx for all HTTP links. Light/dark Axe checks on seven routes found zero serious or critical issues. Reduced-motion, 200% text, mobile touch targets, keyboard focus, no horizontal overflow, and console checks passed.
- Live request capture found no third-party archive traffic during the demo. A 40-request invalid-license probe returned 30 HTTP 200 responses and 10 HTTP 429 responses; every 429 had `Retry-After`.
- Current live Lighthouse: desktop and mobile each scored 100 performance, 100 accessibility, 100 best practices, and 100 SEO. Mobile FCP was 1.08 s, LCP 1.46 s, TBT 17.5 ms, and CLS 0.037. JSON evidence is in `/work/.evidence/bookmark-freshness-review-repair-6-lighthouse-*.json`.

## Paid offer and known gap

The free core, standard HTML export, and all safety behavior remain available without payment. The actual paid feature remains a one-time $18 verified extension license that removes the 50 link-check attempt limit. Public billing metadata was written to `/work/.evidence/billing-offer.json`.

Checkout remains intentionally unavailable because the external billing offer has not yet been registered. This is the named dependency for the separate billing-registration operator; no mock checkout or invented provider credentials were added. Before enabling a buy action, that operator must register the offer and configure a safe return path into the installed extension. The static site does not claim offline use; offline review is an installed-extension claim only.

## Supporting files

- `.factory/claims.json` — 20 public claims and executable commands.
- `.factory/demo.md` — sandbox URL, sample, reset, exit, and storage isolation.
- `.factory/copy-audit.md` — landing-page copy audit and terminology.
- `.factory/catalog-description.txt` and `/work/.evidence/catalog-description.txt` — catalog copy.
