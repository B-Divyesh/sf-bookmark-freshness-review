import { describe, expect, test } from 'vitest';
import { applyCheck, exportBookmarkHtml, isOlderThanTwoYears, markDuplicates, normalizeUrl, parseBookmarkHtml } from '../../src/core/bookmarks';
import { sampleBookmarks } from '../../src/core/sample';
import { checkAllowance, FREE_CHECK_LIMIT, usedCheckAttempts } from '../../src/core/check-limit';
import { classifyHttpStatus, linkRequestInit, MIN_HOST_INTERVAL_MS, retryDelay } from '../../src/core/link-status';
import { verifyLicense } from '../../src/core/license';

const fixture = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<TITLE>Bookmarks</TITLE><H1>Bookmarks</H1><DL><p>
<DT><H3 ADD_DATE="1700000000">Methods &amp; tools</H3><DL><p>
<DT><A HREF="https://example.com/paper?utm_source=mail" ADD_DATE="1500000000">Useful &amp; old</A>
<DT><A HREF="https://example.com/paper" ADD_DATE="1600000000">Useful mirror</A>
</DL><p></DL><p>`;

describe('bookmark archive format', () => {
  test('imports standard bookmark HTML at the core boundary', () => {
    const records = parseBookmarkHtml(fixture);
    expect(records).toHaveLength(2);
    expect(records[0]).toMatchObject({ title: 'Useful & old', folder: 'Methods & tools', addedAt: 1_500_000_000_000 });
    expect(records[1].duplicateOf).toBe(records[0].id);
  });

  test('detects tracking variants at the core boundary', () => {
    expect(normalizeUrl('https://EXAMPLE.com/a/?utm_campaign=x#part')).toBe('https://example.com/a');
    expect(markDuplicates(parseBookmarkHtml(fixture))[1].duplicateOf).toBeTruthy();
  });

  test('marks links older than two years', () => {
    expect(isOlderThanTwoYears(parseBookmarkHtml(fixture)[0], Date.UTC(2026, 0, 1))).toBe(true);
  });

  test('exports kept bookmarks with notes in Netscape HTML', () => {
    const records = structuredClone(sampleBookmarks);
    records[0].note = 'Open for the methods chapter.';
    records[1].decision = 'archive';
    const html = exportBookmarkHtml(records);
    expect(html).toContain('<!DOCTYPE NETSCAPE-Bookmark-file-1>');
    expect(html).toContain('<DD>Open for the methods chapter.');
    expect(html).not.toContain('Old lab wiki');
  });

  test('keeps dead, restricted, and failed requests distinct', () => {
    expect(classifyHttpStatus(404)).toBe('dead');
    expect(classifyHttpStatus(410)).toBe('dead');
    expect(classifyHttpStatus(403)).toBe('restricted');
    expect(classifyHttpStatus(429)).toBe('restricted');
    expect(classifyHttpStatus(500)).toBe('failed');
    expect(classifyHttpStatus(200)).toBe('alive');
  });

  test('omits browser credentials from link checks at the core boundary', () => {
    expect(linkRequestInit()).toMatchObject({ method: 'GET', credentials: 'omit', redirect: 'follow' });
  });

  test('calculates host spacing and Retry-After limits at the core boundary', () => {
    expect(MIN_HOST_INTERVAL_MS).toBeGreaterThanOrEqual(1_500);
    expect(retryDelay('10')).toBe(10_000);
    expect(retryDelay('600')).toBe(600_000);
  });

  test('counts retries and enforces the exact free-check boundary', async () => {
    const unchecked = { ...sampleBookmarks[0], checkedAt: undefined, checkAttempts: undefined, state: 'unchecked' as const };
    const failedOnce = applyCheck(unchecked, { state: 'failed', error: 'Temporary failure.' });
    const failedTwice = applyCheck(failedOnce, { state: 'failed', error: 'Temporary failure.' });
    expect(failedOnce.checkAttempts).toBe(1);
    expect(failedTwice.checkAttempts).toBe(2);
    expect(usedCheckAttempts([{ ...sampleBookmarks[0], checkAttempts: undefined }])).toBe(1);

    const records = Array.from({ length: FREE_CHECK_LIMIT }, (_, index) => ({
      ...sampleBookmarks[0], id: `attempt-${index}`, checkAttempts: 1, checkedAt: Date.now()
    }));
    expect(usedCheckAttempts(records)).toBe(FREE_CHECK_LIMIT);
    expect(checkAllowance(records.slice(0, FREE_CHECK_LIMIT - 1), false)).toBe(1);
    expect(checkAllowance(records, false)).toBe(0);
    expect(checkAllowance([...records, failedOnce], false)).toBe(0);

    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => new Response(JSON.stringify({ valid: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    try {
      expect(await verifyLicense('test-license')).toBe(true);
      expect(checkAllowance(records, true)).toBe(Number.POSITIVE_INFINITY);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
