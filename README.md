# Bookmark Freshness Review

Review and clean up old bookmarks.

Bookmark Freshness Review is a Chromium browser extension for researchers and professionals with years of saved links. It helps you keep, repair, or archive each bookmark in an imported bookmark archive.

Live site: <https://bookmark-freshness-review.sociobot.in>  
One-click demo: <https://bookmark-freshness-review.sociobot.in/?demo=1>

## What it does

- Imports standard browser bookmark HTML.
- Starts link checks only when you ask.
- Keeps dead pages, restricted pages, moved or changed links, and failed checks separate.
- Finds duplicate URLs after removing common tracking parameters.
- Stores why you saved a bookmark or which browser profile it needs.
- Repairs a moved bookmark URL.
- Keeps review decisions and omits archived bookmarks from export.
- Stores imported archives and edits in extension local storage.
- Exports standard HTML without a license, even after the free check limit.

The free tier includes 50 link-check attempts. Retrying a failed check uses another attempt. An $18 one-time license removes that limit. New purchases are paused while checkout is unavailable. Existing licenses can still be restored.

## Install the packaged extension

1. Download `bookmark-freshness-review.zip` from the live site.
2. Unzip it into a permanent folder.
3. Open `chrome://extensions` in Chrome or Edge.
4. Turn on **Developer mode**.
5. Choose **Load unpacked**, then select the unzipped folder.
6. Open the extension to import a bookmark HTML file.

The extension requests access to website addresses so it can check the links you select. Link checks omit browser credentials. The checker spaces requests apart and honors Retry-After limits.

## Develop and verify

Requires Node.js 22 or newer.

```sh
npm ci
npm run dev             # WXT extension development
npm run dev:site        # landing site and demo
npm run typecheck
npm run lint            # types plus claims-manifest consistency
npm test                # build, unit tests, claim tests, and accessibility checks
npm run build:site      # exact production command
```

`npm run build:site` builds the MV3 extension, packages its ZIP, and writes the deployable site to `dist/site/`. The deployable landing page is `dist/site/index.html`.

Load `.output/chrome-mv3/` as an unpacked extension during development. The production ZIP is staged at `dist/site/downloads/bookmark-freshness-review.zip`.

## Project map

- `entrypoints/` — WXT MV3 background worker and review interface.
- `src/core/` — bookmark parsing, export, duplicate, status, and license logic.
- `site/` — static landing, sandboxed demo, privacy, terms, and 404 routes.
- `tests/` — Vitest core tests and Playwright claim and accessibility tests.
- `.factory/` — brief, design system, claims, demo contract, and handoff.

## Privacy and payment

Imported bookmarks, notes, and decisions stay in browser extension storage. Importing or editing an archive makes no hosted request. A link check starts only after an explicit action. License verification sends only the pasted license token to the Sociobot billing API.

This site loads no analytics, advertising scripts, or third-party fonts. Checkout is not linked while product registration is unavailable. See the live [privacy page](https://bookmark-freshness-review.sociobot.in/privacy) and [terms](https://bookmark-freshness-review.sociobot.in/terms).

## License

MIT. See [LICENSE](LICENSE).
