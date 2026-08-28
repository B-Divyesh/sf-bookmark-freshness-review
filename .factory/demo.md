# Demo sandbox

- URL: `https://bookmark-freshness-review.sociobot.in/demo` (local: `http://127.0.0.1:4173/demo`).
- Sample: six realistic research bookmarks covering alive, dead, restricted, moved, duplicate, and failed states. Notes and review decisions are included.
- Reset: use **Reset demo** in the persistent banner.
- Leave: use **Start for real** to discard demo changes, return home, and download the packaged extension.
- Storage: demo changes use only `localStorage["demo:bookmark-freshness-review:v1"]`. The demo does not read the extension archive or its storage.
- Network: the demo makes no bookmark or third-party requests. The license flow is outside the demo and runs only after a license action.
- Extension claim entry point: the packaged options page uses `options.html?demo=1` and stores fixtures under `chrome.storage.local["demo:archive:v1"]`. Import, duplicate, request-privacy, throttling, and paid-limit claims start there in fresh profiles.
