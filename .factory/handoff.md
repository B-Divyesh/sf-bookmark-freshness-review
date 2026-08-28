# Handoff — Bookmark Freshness Review

Completed 2026-08-28 for work order `bookmark-freshness-review-build-1`.

## What shipped

- A WXT and TypeScript Manifest V3 extension in `.output/chrome-mv3/`.
- A packaged Chrome extension at `dist/site/downloads/bookmark-freshness-review.zip`.
- A static Vite site in `dist/site/` with `/`, `/demo`, `/privacy`, `/terms`, and a styled 404 route.
- Local Netscape bookmark HTML import and export.
- On-demand, sequential URL checks with a 750 ms global interval and a 1.5 second per-host interval.
- `Retry-After` handling that skips new requests to a rate-limited host until its delay ends.
- Separate alive, dead, restricted, moved or canonical-changed, failed, and unchecked states.
- Duplicate detection after canonical URL normalization and common tracking-parameter removal.
- Older-than-two-years grouping, editable URLs, purpose or browser-context notes, and keep/review/archive decisions.
- Undo for archive decisions and HTML export that excludes archived records.
- A 50-check free tier. An $18 one-time license removes the check limit.
- Sociobot checkout, pasted-license restore, namespaced token storage, at-most-daily verification on open, and cached offline access.
- An isolated demo with six realistic records, reset, export, URL repair, notes, and decisions.
- Original concrete-and-moss art, responsive WebP files, self-hosted fonts, social metadata, icons, and security-header configuration.

No infrastructure, DNS, billing registration, or live deployment was changed.

## Run and verify

```sh
npm install
npm run typecheck
npm test
npm run build:site
```

The exact production command is `npm run build:site`. It writes `dist/site/index.html` and stages the extension ZIP inside the deploy root.

Verification completed from the production build:

- `npm run typecheck`: pass.
- `npm audit`: 0 vulnerabilities.
- `npm test`: pass; 7 Vitest tests and 9 Playwright tests.
- All ten claims in `.factory/claims.json`: pass through their listed commands.
- Axe: no serious or critical findings on home, demo, privacy, terms, or 404 routes.
- Factory `verify-url.sh`: 200 response, `lang=en`, one `h1`, one `main`, zero missing alt text, zero unlabeled buttons, and zero console errors.
- Headed Chromium extension smoke test: MV3 worker loaded, two fixture bookmarks imported, six isolated demo records rendered, and zero console errors.
- Mobile check: no horizontal overflow at 390 × 844 and a visible keyboard focus path.
- Internal-link crawl: every same-origin link returned 200.

Lighthouse 13.4.1 mobile simulation against `dist/site/`:

| Category or metric | Result |
| --- | ---: |
| Performance | 100 |
| Accessibility | 100 |
| Best practices | 100 |
| SEO | 100 |
| First contentful paint | 1.1 s |
| Largest contentful paint | 1.7 s |
| Total blocking time | 0 ms |
| Cumulative layout shift | 0 |

Budgets:

- Site JavaScript: 18.31 KB raw, 6.75 KB gzip.
- Site CSS: 15.70 KB raw, 4.36 KB gzip.
- Loaded WOFF2 fonts: 53.33 KB total.
- Mobile hero WebP: 39.61 KB; desktop hero WebP: 119.42 KB.
- Extension: 128.11 KB unpacked; 110.30 KB ZIP.

## Privacy and product choices

- Real archive data uses `chrome.storage.local` under `archive:v1`.
- Extension demo data uses `demo:archive:v1`; site demo data uses `demo:bookmark-freshness-review:v1`.
- Sample mode never reads or overwrites a real archive.
- Bookmark checks send only the selected URL to its own host and omit browser credentials.
- The site has no analytics or third-party runtime scripts.
- The one-time price was set to $18 because the brief required paid monetization but gave no price.
- Export, notes, repairs, decisions, and accessibility features remain free.

## Known gaps and next steps

- The factory must register the paid product and configure the live checkout return URL before release.
- The packaged build targets Chromium MV3. Firefox and Safari packages need separate review and signing.
- “Moved or changed” means an HTTP redirect or changed canonical URL. V1 does not snapshot or diff page content.
- Some sites block extension requests. Those results stay labeled as restricted or failed instead of dead.
- Live URL checking was not run against third-party sites during verification. Automated tests use local fixtures and the isolated demo.
