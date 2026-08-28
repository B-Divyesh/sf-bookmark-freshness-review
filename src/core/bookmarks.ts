import type { BookmarkRecord, CheckResult } from './types';

const TRACKERS = new Set(['fbclid', 'gclid', 'mc_cid', 'mc_eid']);

export function normalizeUrl(raw: string): string {
  try {
    const url = new URL(raw);
    url.hash = '';
    for (const key of [...url.searchParams.keys()]) {
      if (key.toLowerCase().startsWith('utm_') || TRACKERS.has(key.toLowerCase())) url.searchParams.delete(key);
    }
    url.hostname = url.hostname.toLowerCase();
    if (url.pathname !== '/') url.pathname = url.pathname.replace(/\/+$/, '');
    url.searchParams.sort();
    return url.toString();
  } catch {
    return raw.trim();
  }
}

function idFor(url: string, index: number): string {
  let hash = 2166136261;
  for (const char of `${url}:${index}`) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return `b${(hash >>> 0).toString(36)}`;
}

export function parseBookmarkHtml(html: string): BookmarkRecord[] {
  const anchors = [...html.matchAll(/<A\s+([^>]*?)>([\s\S]*?)<\/A>/gi)];
  const folders = [...html.matchAll(/<H3\b[^>]*>([\s\S]*?)<\/H3>/gi)].map(match => ({
    position: match.index ?? 0,
    name: decodeEntities(stripTags(match[1])).trim() || 'Imported'
  }));

  const records = anchors.flatMap((match, index) => {
    const attrs = match[1];
    const href = attribute(attrs, 'HREF');
    if (!href || !/^https?:\/\//i.test(href)) return [];
    const addDate = Number(attribute(attrs, 'ADD_DATE'));
    let nearestFolder = 'Imported';
    for (const { position, name } of folders) {
      if (position <= (match.index ?? 0)) nearestFolder = name;
      else break;
    }
    return [{
      id: idFor(href, index),
      title: decodeEntities(stripTags(match[2])).trim() || new URL(href).hostname,
      url: decodeEntities(href),
      folder: nearestFolder,
      addedAt: Number.isFinite(addDate) && addDate > 0 ? addDate * 1000 : undefined,
      note: '', decision: 'review' as const, state: 'unchecked' as const
    }];
  });
  return markDuplicates(records);
}

function attribute(attrs: string, name: string): string | undefined {
  const quoted = attrs.match(new RegExp(`${name}\\s*=\\s*(["'])(.*?)\\1`, 'i'));
  if (quoted) return quoted[2];
  return attrs.match(new RegExp(`${name}\\s*=\\s*([^\\s>]+)`, 'i'))?.[1];
}

function stripTags(value: string): string { return value.replace(/<[^>]+>/g, ''); }
function decodeEntities(value: string): string {
  return value.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
}

export function markDuplicates(records: BookmarkRecord[]): BookmarkRecord[] {
  const first = new Map<string, string>();
  return records.map(record => {
    const key = normalizeUrl(record.canonicalUrl || record.finalUrl || record.url);
    const duplicateOf = first.get(key);
    if (!duplicateOf) first.set(key, record.id);
    return { ...record, duplicateOf };
  });
}

export function applyCheck(record: BookmarkRecord, result: CheckResult): BookmarkRecord {
  return { ...record, ...result, checkedAt: Date.now(), checkAttempts: (record.checkAttempts ?? (record.checkedAt ? 1 : 0)) + 1 };
}

export function isOlderThanTwoYears(record: BookmarkRecord, now = Date.now()): boolean {
  return Boolean(record.addedAt && record.addedAt < now - 2 * 365.25 * 24 * 60 * 60 * 1000);
}

export function exportBookmarkHtml(records: BookmarkRecord[]): string {
  const kept = records.filter(record => record.decision !== 'archive');
  const folders = new Map<string, BookmarkRecord[]>();
  for (const record of kept) {
    const list = folders.get(record.folder) ?? [];
    list.push(record);
    folders.set(record.folder, list);
  }
  const lines = ['<!DOCTYPE NETSCAPE-Bookmark-file-1>', '<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">', '<TITLE>Bookmarks</TITLE>', '<H1>Bookmarks</H1>', '<DL><p>'];
  for (const [folder, items] of folders) {
    lines.push(`  <DT><H3>${escapeHtml(folder)}</H3>`, '  <DL><p>');
    for (const item of items) {
      const added = item.addedAt ? ` ADD_DATE="${Math.floor(item.addedAt / 1000)}"` : '';
      lines.push(`    <DT><A HREF="${escapeHtml(item.url)}"${added}>${escapeHtml(item.title)}</A>`);
      if (item.note) lines.push(`    <DD>${escapeHtml(item.note)}`);
    }
    lines.push('  </DL><p>');
  }
  lines.push('</DL><p>');
  return lines.join('\n');
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
