import { describe, expect, test } from 'vitest';
import { exportBookmarkHtml, isOlderThanTwoYears, markDuplicates, normalizeUrl, parseBookmarkHtml } from '../../src/core/bookmarks';
import { sampleBookmarks } from '../../src/core/sample';
import { classifyHttpStatus, linkRequestInit, MIN_HOST_INTERVAL_MS, retryDelay } from '../../src/core/link-status';

const fixture = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<TITLE>Bookmarks</TITLE><H1>Bookmarks</H1><DL><p>
<DT><H3 ADD_DATE="1700000000">Methods &amp; tools</H3><DL><p>
<DT><A HREF="https://example.com/paper?utm_source=mail" ADD_DATE="1500000000">Useful &amp; old</A>
<DT><A HREF="https://example.com/paper" ADD_DATE="1600000000">Useful mirror</A>
</DL><p></DL><p>`;

describe('bookmark archive format', () => {
  test('@claim:html-import imports standard bookmark HTML', () => {
    const records = parseBookmarkHtml(fixture);
    expect(records).toHaveLength(2);
    expect(records[0]).toMatchObject({ title: 'Useful & old', folder: 'Methods & tools', addedAt: 1_500_000_000_000 });
    expect(records[1].duplicateOf).toBe(records[0].id);
  });

  test('@claim:duplicate-detection ignores tracking parameters', () => {
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

  test('@claim:credential-free-checks omits browser credentials from link checks', () => {
    expect(linkRequestInit()).toMatchObject({ method: 'GET', credentials: 'omit', redirect: 'follow' });
  });

  test('@claim:request-spacing enforces host spacing and Retry-After limits', () => {
    expect(MIN_HOST_INTERVAL_MS).toBeGreaterThanOrEqual(1_500);
    expect(retryDelay('10')).toBe(10_000);
    expect(retryDelay('600')).toBe(600_000);
  });
});
