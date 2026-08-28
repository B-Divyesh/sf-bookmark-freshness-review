# Verification handoff — FAIL

Independent verification completed 2026-08-28 for work order `bookmark-freshness-review-verify-3`.

**Candidate:** `7da07f3a16b39562bf71ab8ddab052c8e964d594`

**Live URL:** <https://bookmark-freshness-review.sociobot.in>
**Decision:** **FAIL — do not release**

The live JS, CSS, hero, and extension ZIP exactly match the candidate's fresh production build. This is not a deployment-only failure. No product code was changed during verification.

## Release blockers

1. At 1440 × 900, the required **Try it with sample data** action begins at `y=945.4` and is absent from the cold first viewport. The mandatory first-read gate fails.
2. The first `npm test` run failed `@claim:request-spacing` at 1418 ms versus the asserted 1450 ms minimum. An unchanged repeat passed, proving the mandatory gate is flaky.
3. Live **Start for real** downloads the ZIP but remains in `/demo`, keeps the demo banner, and retains changed demo localStorage instead of discarding/exiting the sandbox.
4. The deployed static 404 page has 24.8–36 px navigation links, below the non-negotiable 44 px target minimum.
5. “A license check sends only the license token to Sociobot” is a public privacy promise with no claims entry or request-payload assertion.

Full evidence and remediation details are in [verification-3.md](verification-3.md). First-screen captures are under [.factory/verification-artifacts](verification-artifacts/).

## What passed

- All 13 exact claim commands passed individually after `npm ci`.
- `npm run typecheck`, `npm run lint`, and exact `npm run build` passed.
- One of two unchanged `npm test` runs passed completely; the other failed as described above.
- Fresh packaged-extension import, duplicate, link-status, invalid-input recovery, storage, archive/export/undo, credential, and offline flows passed.
- Live demo isolation, reset, status separation, decisions, and HTML export passed, apart from the exit/discard defect.
- Axe found zero serious/critical violations across all public routes at desktop/mobile in light/dark mode; keyboard, focus, reduced motion, and 200% text smoke checks passed outside the 404 target-size defect.
- Privacy requests, security headers, routing, caching, link crawl, package integrity, and deployment parity passed.
- License verification rate limiting began after 30 accepted burst requests; 429 responses included `Retry-After: 4`.
- Lighthouse mobile: 93 performance, 100 accessibility, 100 best practices, 100 SEO; LCP 1.4 s and CLS 0.

## Reproduce

```sh
npm ci
jq -r '.[] | [.id,.test] | @tsv' .factory/claims.json
npm run typecheck
npm run lint
npm test
npm run build
scripts/verify-url.sh https://bookmark-freshness-review.sociobot.in/demo
```

Repeat `npm test` to expose the request-spacing timing instability. Inspect the live home at 1440 × 900 and `/not-a-route` at 390 × 844. On `/demo`, edit a note and click **Start for real**; the URL, banner, and `demo:bookmark-freshness-review:v1` key remain.
