# Bookmark Freshness Review

Review old bookmarks, check their health, and export a clean local archive.

This Chrome extension is for researchers and professionals with years of saved links. It turns an untouched bookmark file into a deliberate keep, repair, or archive pass.

Live site: <https://bookmark-freshness-review.sociobot.in>  
One-click demo: <https://bookmark-freshness-review.sociobot.in/demo>

## What it does

- Imports standard browser bookmark HTML.
- Checks links only after you start a review.
- Keeps dead pages, restricted pages, moved links, and failed checks separate.
- Finds duplicate URLs after removing common tracking parameters.
- Stores a purpose or browser-context note with each bookmark.
- Repairs URLs and records keep, review, or archive decisions.
- Keeps archive data in extension storage on your device.
- Exports kept bookmarks as standard HTML. Export is always free.

The free tier includes 50 link-check attempts. Retrying a failed check uses another attempt. An $18 one-time license removes that limit. Notes, decisions, repair, and export remain free. New purchases are paused until Sociobot enables checkout; existing licenses can still be restored.

## Install the packaged extension

1. Download `bookmark-freshness-review.zip` from the live site.
2. Unzip it into a permanent folder.
3. Open `chrome://extensions` in Chrome or Edge.
4. Turn on **Developer mode**.
5. Choose **Load unpacked**, then select the unzipped folder.
6. Open the extension to import a bookmark HTML file.

The extension requests access to website addresses so it can check the links you select. It does not read page content until a check starts. Requests omit browser credentials. The checker spaces requests apart and honors Retry-After limits.

## Develop and verify

Requires Node.js 22 or newer.

```sh
npm install
npm run dev             # WXT extension development
npm run dev:site        # landing site and demo
npm run typecheck
npm run lint            # types plus claims-manifest consistency
npm test                # build, unit tests, claim tests, and accessibility checks
npm run build:site      # exact production command
```

`npm run build:site` builds the MV3 extension, packages its ZIP, and writes the deployable site to `dist/site/`. The required `index.html` is at `dist/site/index.html`.

Load `.output/chrome-mv3/` as an unpacked extension during development. The production ZIP is staged at `dist/site/downloads/bookmark-freshness-review.zip`.

## Project map

- `entrypoints/` — WXT MV3 background worker and review interface.
- `src/core/` — bookmark parsing, export, duplicate, status, and license logic.
- `site/` — static landing, sandboxed demo, privacy, terms, and 404 routes.
- `tests/` — Vitest core tests and Playwright claim and accessibility tests.
- `.factory/` — brief, design system, claims, demo contract, and handoff.

## Privacy and payment

Imported bookmarks, notes, and decisions stay in browser extension storage. Importing or editing an archive makes no hosted request. Link checks contact saved websites only after an explicit action. License verification sends only the pasted license token to the Sociobot billing API.

Sociobot and Dodo handle one-time purchases as merchant of record. Checkout is not linked while product registration is unavailable. The product never receives card details. See the live [privacy page](https://bookmark-freshness-review.sociobot.in/privacy) and [terms](https://bookmark-freshness-review.sociobot.in/terms).

## License

MIT. See [LICENSE](LICENSE).
