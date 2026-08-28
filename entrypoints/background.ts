import { normalizeUrl } from '../src/core/bookmarks';
import type { CheckResult } from '../src/core/types';
import { defineBackground } from 'wxt/utils/define-background';
import { classifyHttpStatus, linkRequestInit, MIN_HOST_INTERVAL_MS, retryDelay } from '../src/core/link-status';

let queue = Promise.resolve();
let lastRequestAt = 0;
const lastHostAt = new Map<string, number>();
const blockedUntil = new Map<string, number>();

export default defineBackground(() => {
  chrome.action.onClicked.addListener(() => chrome.runtime.openOptionsPage());
  chrome.runtime.onMessage.addListener((message: unknown, _sender, sendResponse) => {
    if (!isCheckMessage(message)) return false;
    queue = queue.then(() => checkLink(message.url)).then(sendResponse, error => sendResponse({ state: 'failed', error: readableError(error) }));
    return true;
  });
});

function isCheckMessage(value: unknown): value is { type: 'CHECK_LINK'; url: string } {
  return Boolean(value && typeof value === 'object' && (value as { type?: string }).type === 'CHECK_LINK' && typeof (value as { url?: unknown }).url === 'string');
}

async function checkLink(rawUrl: string): Promise<CheckResult> {
  let url: URL;
  try { url = new URL(rawUrl); } catch { return { state: 'failed', error: 'This bookmark has an invalid URL.' }; }
  if (!['http:', 'https:'].includes(url.protocol)) return { state: 'failed', error: 'Only HTTP and HTTPS links can be checked.' };

  const now = Date.now();
  const blocked = blockedUntil.get(url.hostname) ?? 0;
  if (blocked > now) return { state: 'restricted', statusCode: 429, error: `This site asked checks to wait until ${new Date(blocked).toLocaleTimeString()}.` };
  const globalWait = Math.max(0, 750 - (now - lastRequestAt));
  const hostWait = Math.max(0, MIN_HOST_INTERVAL_MS - (now - (lastHostAt.get(url.hostname) ?? 0)));
  await delay(Math.max(globalWait, hostWait));
  lastRequestAt = Date.now();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);
  try {
    const response = await fetch(url, { ...linkRequestInit(), signal: controller.signal });
    const finalUrl = response.url || url.toString();
    const statusCode = response.status;
    // Retry-After is a server-directed quiet period for rate limits (429) and
    // temporary overloads (503). Do not send another request to that host
    // while it is active, even though a 503 itself remains a failed check.
    const retryAfter = response.headers.get('retry-after');
    if (retryAfter && (statusCode === 429 || statusCode === 503)) {
      blockedUntil.set(url.hostname, Date.now() + retryDelay(retryAfter));
    }
    const state = classifyHttpStatus(statusCode);
    if (state === 'dead' || state === 'restricted') return { state, statusCode, finalUrl };
    if (state === 'failed') return { state, statusCode, finalUrl, error: statusCode >= 500 ? `The site returned ${statusCode}. Try again later.` : `The site returned ${statusCode}.` };

    let canonicalUrl: string | undefined;
    if ((response.headers.get('content-type') ?? '').includes('text/html')) {
      const html = (await response.text()).slice(0, 250_000);
      const canonical = html.match(/<link\b[^>]*rel=["'][^"']*canonical[^"']*["'][^>]*>/i)?.[0];
      const href = canonical?.match(/href=["']([^"']+)["']/i)?.[1];
      if (href) {
        try { canonicalUrl = new URL(href, finalUrl).toString(); } catch { /* Ignore malformed page metadata. */ }
      }
    }
    const changed = normalizeUrl(finalUrl) !== normalizeUrl(url.toString()) || Boolean(canonicalUrl && normalizeUrl(canonicalUrl) !== normalizeUrl(url.toString()));
    return { state: changed ? 'redirected' : 'alive', statusCode, finalUrl, canonicalUrl };
  } catch (error) {
    return { state: 'failed', error: readableError(error) };
  } finally {
    clearTimeout(timeout);
    // Start the same-host quiet period after the response finishes. Measuring
    // from fetch start allowed connection setup on the first request to make
    // server-observed arrivals closer together than MIN_HOST_INTERVAL_MS.
    lastHostAt.set(url.hostname, Date.now());
  }
}

function delay(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)); }
function readableError(error: unknown): string {
  if (error instanceof DOMException && error.name === 'AbortError') return 'The site did not answer within 12 seconds.';
  return 'The request failed. Check your connection, then try again.';
}
