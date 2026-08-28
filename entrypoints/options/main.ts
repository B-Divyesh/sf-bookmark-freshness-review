import './style.css';
import { applyCheck, exportBookmarkHtml, isOlderThanTwoYears, markDuplicates, parseBookmarkHtml } from '../../src/core/bookmarks';
import { CHECKOUT_URL, LICENSE_KEY, verifyLicense, type LicenseCache } from '../../src/core/license';
import { sampleBookmarks } from '../../src/core/sample';
import type { BookmarkRecord, LinkState } from '../../src/core/types';

const STORAGE_KEY = 'archive:v1';
const DEMO_KEY = 'demo:archive:v1';
const demo = new URLSearchParams(location.search).get('demo') === '1';
const app = document.querySelector<HTMLDivElement>('#app')!;
const announcer = document.querySelector<HTMLDivElement>('#announcer')!;

type Filter = 'all' | 'stale' | 'duplicates' | LinkState | 'archive';
let records: BookmarkRecord[] = [];
let filter: Filter = 'all';
let checking = false;
let license: LicenseCache | null = null;
let undoRecord: BookmarkRecord | null = null;

void init();

async function init() {
  const queryLicense = new URLSearchParams(location.search).get('license');
  if (queryLicense) {
    await chrome.storage.local.set({ [LICENSE_KEY]: { token: queryLicense, valid: true, checkedAt: 0 } });
    history.replaceState({}, '', location.pathname + (demo ? '?demo=1' : ''));
  }
  const stored = await chrome.storage.local.get([demo ? DEMO_KEY : STORAGE_KEY, LICENSE_KEY]);
  records = (stored[demo ? DEMO_KEY : STORAGE_KEY] as BookmarkRecord[] | undefined) ?? (demo ? structuredClone(sampleBookmarks) : []);
  license = (stored[LICENSE_KEY] as LicenseCache | undefined) ?? null;
  render();
  if (license?.token && Date.now() - license.checkedAt > 86_400_000) void refreshLicense();
}

function render() {
  if (!records.length) { renderEmpty(); return; }
  const shown = filteredRecords();
  app.innerHTML = `
    ${demo ? '<section class="demo-banner" aria-label="Demo mode"><strong>Demo — sample data, nothing is saved</strong><span><button data-action="reset-demo">Reset demo</button><button data-action="start-real">Start for real</button></span></section>' : ''}
    <section class="workspace-head">
      <div><p class="eyebrow">Archive review bench</p><h1>Decide which bookmarks still belong</h1><p>${records.length} bookmarks stay on this device. Check links only when you choose.</p></div>
      <div class="head-actions"><label class="file-button">Import HTML<input id="import-file" type="file" accept=".html,text/html" /></label><button class="primary" data-action="check">${checking ? 'Checking…' : 'Check visible links'}</button><button data-action="export">Export kept HTML</button></div>
    </section>
    ${!navigator.onLine ? '<p class="state-callout warning" role="status">You are offline. Notes and decisions still work. Link checks will fail until you reconnect.</p>' : ''}
    <div class="review-layout">
      <aside class="filter-rail" aria-label="Review groups">
        <h2>Review groups</h2>${filterButton('all', 'All bookmarks')}${filterButton('stale', 'Older than 2 years')}${filterButton('dead', 'Dead pages')}${filterButton('failed', 'Failed checks')}${filterButton('restricted', 'Login or restricted')}${filterButton('redirected', 'Moved or changed')}${filterButton('duplicates', 'Duplicates')}${filterButton('archive', 'Marked for archive')}
        <section class="progress-slab"><h2>Review progress</h2><strong>${progress()}%</strong><span>${records.filter(r => r.decision !== 'review').length} of ${records.length} decided</span><div><i style="width:${progress()}%"></i></div></section>
        <section class="license-slab"><h2>${license?.valid ? 'Full review active' : 'Review larger archives'}</h2><p>${license?.valid ? 'Your license allows unlimited link checks.' : 'Free includes 50 checks. Pay $18 once for unlimited checks.'}</p>${license?.valid ? '' : `<a class="buy-link" href="${CHECKOUT_URL}" target="_blank" rel="noreferrer">Buy the full review <span class="sr-only">(opens in a new tab)</span></a><button data-action="license">Paste a license</button>`}</section>
      </aside>
      <section class="ledger" aria-labelledby="ledger-title">
        <div class="ledger-head"><div><p class="eyebrow">Current group</p><h2 id="ledger-title" tabindex="-1">${filterLabel(filter)}</h2></div><span>${shown.length} shown</span></div>
        <div class="record-list">${shown.length ? shown.map(recordCard).join('') : `<div class="empty-group"><h3>No bookmarks in this group</h3><p>Choose another group or run a link check.</p></div>`}</div>
      </section>
    </div>
    ${undoRecord ? `<div class="undo" role="status"><span>“${escapeHtml(undoRecord.title)}” marked for archive.</span><button data-action="undo">Undo</button></div>` : ''}`;
  bindEvents();
}

function renderEmpty() {
  app.innerHTML = `
    <section class="empty-start">
      <div><p class="eyebrow">Local archive review</p><h1>Review old bookmarks without uploading them</h1><p>For researchers with years of saved links who need a clear keep-or-archive pass.</p>
      <div class="start-actions"><label class="file-button primary">Import bookmark HTML<input id="import-file" type="file" accept=".html,text/html" /></label><button data-action="sample">Try it with sample data</button></div>
      <ul class="plain-facts"><li>Archive data stays in this browser.</li><li>Checks run only when you start them.</li><li>Standard HTML export is always free.</li></ul></div>
      <div class="empty-diagram" aria-label="A simple diagram showing imported bookmarks sorted into keep, repair, and archive groups"><span>IMPORT</span><i></i><b>KEEP</b><b>REPAIR</b><b>ARCHIVE</b></div>
    </section>`;
  bindEvents();
}

function bindEvents() {
  app.querySelector<HTMLInputElement>('#import-file')?.addEventListener('change', importFile);
  app.querySelectorAll<HTMLElement>('[data-action]').forEach(element => element.addEventListener('click', onAction));
  app.querySelectorAll<HTMLButtonElement>('[data-filter]').forEach(button => button.addEventListener('click', () => { filter = button.dataset.filter as Filter; render(); focusLedger(); }));
  app.querySelectorAll<HTMLTextAreaElement>('[data-note]').forEach(input => input.addEventListener('change', () => updateRecord(input.dataset.note!, { note: input.value })));
  app.querySelectorAll<HTMLInputElement>('[data-url]').forEach(input => input.addEventListener('change', () => updateRecord(input.dataset.url!, { url: input.value, state: 'unchecked', statusCode: undefined, error: undefined, finalUrl: undefined, canonicalUrl: undefined })));
  app.querySelectorAll<HTMLButtonElement>('[data-decision]').forEach(button => button.addEventListener('click', () => setDecision(button.dataset.id!, button.dataset.decision as BookmarkRecord['decision'])));
}

async function onAction(event: Event) {
  const action = (event.currentTarget as HTMLElement).dataset.action;
  if (action === 'sample') { records = structuredClone(sampleBookmarks); await save(); render(); }
  if (action === 'check') await checkVisible();
  if (action === 'export') downloadExport();
  if (action === 'reset-demo') { records = structuredClone(sampleBookmarks); await chrome.storage.local.remove(DEMO_KEY); render(); announce('Demo reset.'); }
  if (action === 'start-real') { await chrome.storage.local.remove(DEMO_KEY); location.href = location.pathname; }
  if (action === 'license') await pasteLicense();
  if (action === 'undo' && undoRecord) { const id = undoRecord.id; undoRecord = null; await updateRecord(id, { decision: 'review' }); }
}

async function importFile(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;
  try {
    const imported = parseBookmarkHtml(await file.text());
    if (!imported.length) throw new Error('No HTTP or HTTPS bookmarks were found.');
    records = imported; filter = 'all'; await save(); render(); announce(`${records.length} bookmarks imported.`);
  } catch (error) {
    announce(error instanceof Error ? error.message : 'The bookmark file could not be read.');
    app.insertAdjacentHTML('afterbegin', '<p class="state-callout danger" role="alert">The file could not be imported. Choose an HTML file exported by your browser.</p>');
  }
}

async function checkVisible() {
  if (checking) return;
  if (!navigator.onLine) { announce('You are offline. Reconnect before checking links.'); return; }
  checking = true; render();
  const visible = filteredRecords().filter(record => record.state === 'unchecked' || record.state === 'failed');
  const allowance = license?.valid ? visible.length : Math.max(0, 50 - records.filter(r => r.checkedAt).length);
  for (const record of visible.slice(0, allowance)) {
    const result = await chrome.runtime.sendMessage({ type: 'CHECK_LINK', url: record.url });
    records = records.map(item => item.id === record.id ? applyCheck(item, result) : item);
    records = markDuplicates(records); await save(); render();
  }
  checking = false; render(); announce(`${Math.min(visible.length, allowance)} link checks finished.`);
}

function filteredRecords(): BookmarkRecord[] {
  if (filter === 'all') return records;
  if (filter === 'stale') return records.filter(record => isOlderThanTwoYears(record));
  if (filter === 'duplicates') return records.filter(record => record.duplicateOf);
  if (filter === 'archive') return records.filter(record => record.decision === 'archive');
  return records.filter(record => record.state === filter);
}

function filterButton(value: Filter, label: string): string {
  const count = value === 'all' ? records.length : value === 'stale' ? records.filter(r => isOlderThanTwoYears(r)).length : value === 'duplicates' ? records.filter(r => r.duplicateOf).length : value === 'archive' ? records.filter(r => r.decision === 'archive').length : records.filter(r => r.state === value).length;
  return `<button class="filter-button" data-filter="${value}" aria-pressed="${filter === value}"><span>${label}</span><b>${count}</b></button>`;
}

function recordCard(record: BookmarkRecord): string {
  return `<article class="record state-${record.state}" data-id="${record.id}">
    <div class="record-main"><div class="record-title"><span class="status-mark" aria-hidden="true"></span><div><h3>${escapeHtml(record.title)}</h3><p>${escapeHtml(record.folder)}${record.addedAt ? ` · saved ${new Date(record.addedAt).getUTCFullYear()}` : ''}</p></div></div>
    <span class="status-label">${statusLabel(record)}</span></div>
    <label class="url-label">Bookmark URL<input data-url="${record.id}" type="url" value="${escapeHtml(record.url)}" /></label>
    ${record.finalUrl && normalizeDisplay(record.finalUrl) !== normalizeDisplay(record.url) ? `<p class="change-note">Now resolves to ${escapeHtml(record.finalUrl)}</p>` : ''}
    ${record.duplicateOf ? '<p class="change-note">Duplicate of another bookmark in this archive.</p>' : ''}
    ${record.error ? `<p class="error-note">${escapeHtml(record.error)}</p>` : ''}
    <label class="note-label">Purpose or browser context<textarea data-note="${record.id}" rows="2" placeholder="Why keep it? Which profile or login does it need?">${escapeHtml(record.note)}</textarea></label>
    <div class="decision-row" aria-label="Review decision"><button data-decision="keep" data-id="${record.id}" aria-pressed="${record.decision === 'keep'}">Keep</button><button data-decision="review" data-id="${record.id}" aria-pressed="${record.decision === 'review'}">Review later</button><button data-decision="archive" data-id="${record.id}" aria-pressed="${record.decision === 'archive'}">Archive</button></div>
  </article>`;
}

function statusLabel(record: BookmarkRecord): string {
  const labels: Record<LinkState, string> = { unchecked: 'Not checked', alive: 'Alive', redirected: 'Moved or changed', restricted: 'Login or restricted', dead: 'Dead page', failed: 'Check failed' };
  return `${labels[record.state]}${record.statusCode ? ` · ${record.statusCode}` : ''}`;
}

async function setDecision(id: string, decision: BookmarkRecord['decision']) {
  const original = records.find(r => r.id === id);
  if (decision === 'archive' && original && original.decision !== 'archive') undoRecord = { ...original };
  await updateRecord(id, { decision }); announce(`Bookmark marked ${decision === 'review' ? 'for later review' : decision}.`);
}

async function updateRecord(id: string, changes: Partial<BookmarkRecord>) {
  records = records.map(record => record.id === id ? { ...record, ...changes } : record); await save(); render();
}

async function save() { await chrome.storage.local.set({ [demo ? DEMO_KEY : STORAGE_KEY]: records }); }

function downloadExport() {
  const blob = new Blob([exportBookmarkHtml(records)], { type: 'text/html;charset=utf-8' });
  const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = 'reviewed-bookmarks.html'; link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000); announce('Kept bookmarks exported as HTML.');
}

async function pasteLicense() {
  const token = prompt('Paste your Bookmark Freshness Review license:')?.trim();
  if (!token) return;
  try {
    const valid = await verifyLicense(token); license = { token, valid, checkedAt: Date.now() }; await chrome.storage.local.set({ [LICENSE_KEY]: license }); render(); announce(valid ? 'Full review activated.' : 'This license is not active.');
  } catch { announce('The license could not be checked. Try again when you are online.'); }
}

async function refreshLicense() {
  if (!license) return;
  try { license = { ...license, valid: await verifyLicense(license.token), checkedAt: Date.now() }; await chrome.storage.local.set({ [LICENSE_KEY]: license }); render(); } catch { /* Cached state keeps first paint usable offline. */ }
}

function progress() { return records.length ? Math.round(records.filter(r => r.decision !== 'review').length / records.length * 100) : 0; }
function filterLabel(value: Filter) { return ({ all: 'All bookmarks', stale: 'Older than two years', duplicates: 'Canonical duplicates', archive: 'Marked for archive', unchecked: 'Not checked', alive: 'Alive', redirected: 'Moved or changed', restricted: 'Login or restricted', dead: 'Dead pages', failed: 'Failed checks' } as Record<Filter, string>)[value]; }
function normalizeDisplay(value: string) { try { const u = new URL(value); u.hash = ''; return u.toString(); } catch { return value; } }
function focusLedger() { requestAnimationFrame(() => document.querySelector<HTMLElement>('#ledger-title')?.focus()); }
function announce(message: string) { announcer.textContent = message; }
function escapeHtml(value: string) { return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

addEventListener('online', render);
addEventListener('offline', render);
