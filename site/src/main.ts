import './style.css';
import { exportBookmarkHtml } from '../../src/core/bookmarks';
import { CHECKOUT_URL, LICENSE_KEY, verifyLicense, type LicenseCache } from '../../src/core/license';
import { sampleBookmarks } from '../../src/core/sample';
import type { BookmarkRecord, LinkState } from '../../src/core/types';

const root = document.querySelector<HTMLDivElement>('#site')!;
const routeStatus = document.querySelector<HTMLDivElement>('#route-status')!;
const DEMO_KEY = 'demo:bookmark-freshness-review:v1';
const build = '2026.08.28';
let demoRecords: BookmarkRecord[] = loadDemo();
let demoFilter: 'all' | LinkState | 'duplicates' = 'all';
let license = loadLicense();

void captureLicense();
renderRoute();

function renderRoute() {
  const path = location.pathname.replace(/\/$/, '') || '/';
  if (path === '/') renderPage(homePage(), 'Bookmark Freshness Review — Review old bookmarks', '/');
  else if (path === '/demo') renderPage(demoPage(), 'Demo — Bookmark Freshness Review', '/demo');
  else if (path === '/privacy') renderPage(privacyPage(), 'Privacy — Bookmark Freshness Review', '/privacy');
  else if (path === '/terms') renderPage(termsPage(), 'Terms — Bookmark Freshness Review', '/terms');
  else renderPage(notFoundPage(), 'Page not found — Bookmark Freshness Review', path);
  bind();
}

function renderPage(main: string, title: string, canonicalPath: string) {
  document.title = title;
  document.querySelector<HTMLLinkElement>('link[rel="canonical"]')!.href = `https://bookmark-freshness-review.sociobot.in${canonicalPath}`;
  root.innerHTML = `${header()}<main id="main" tabindex="-1">${main}</main>${footer()}`;
}

function header() {
  return `<header class="site-header"><a class="wordmark route-link" href="/" aria-label="Bookmark Freshness Review home"><span class="plot-mark" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span>Bookmark<br>Freshness Review</span></a><nav aria-label="Main navigation"><a class="route-link" href="/demo">Demo</a><a href="/#how">How it works</a><a class="route-link" href="/privacy">Privacy</a></nav></header>`;
}

function footer() {
  return `<footer><div><a class="wordmark route-link" href="/"><span class="plot-mark" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span>Bookmark<br>Freshness Review</span></a><p>Review old bookmarks. Keep the archive yours.</p></div><nav aria-label="Footer navigation"><a class="route-link" href="/privacy">Privacy</a><a class="route-link" href="/terms">Terms</a><a href="https://hello-factory.sociobot.in" target="_blank" rel="noreferrer">Built by Param Factory <span class="sr-only">(opens in a new tab)</span></a></nav><p class="build">v1.0 · build ${build}<br>Generated illustration disclosed in the design notes.</p></footer>`;
}

function homePage() {
  return `<section class="hero">
    <div class="hero-copy"><p class="eyebrow">A local browser extension</p><h1>Review old bookmarks before they rot</h1><p class="lede">For researchers with years of saved links who need a clear keep-or-archive pass.</p>
      <div class="hero-action"><a class="button primary route-link" href="/demo">Try it with sample data</a><span>See six checked bookmarks. Nothing touches your archive.</span></div><a id="download" class="download-link" href="/downloads/bookmark-freshness-review.zip" download>Download the Chrome extension <span>ZIP · v1.0</span></a>
      <ul class="plain-facts"><li>Archive data stays in your browser.</li><li>Checks start only when you ask.</li><li>Standard HTML export is always free.</li></ul>
    </div>
    <figure class="hero-art"><picture><source media="(max-width: 720px)" srcset="/assets/hero-concrete-moss-720.webp"><img src="/assets/hero-concrete-moss-1280.webp" width="1280" height="853" alt="A concrete archive drawer with paper slips and moss, showing an old collection being carefully reviewed." fetchpriority="high" decoding="async"></picture><figcaption>Give each saved link a deliberate next state.</figcaption></figure>
  </section>
  <section class="live-preview" aria-labelledby="preview-title"><div class="section-tag">01 · Review bench</div><div class="preview-heading"><div><h2 id="preview-title">See what needs a decision</h2><p>Health, age, duplicates, and your notes meet in one local ledger.</p></div><a class="text-link route-link" href="/demo">Open the working demo →</a></div>${previewLedger()}</section>
  <section id="how" class="how" aria-labelledby="how-title"><div class="section-tag">02 · Three passes</div><h2 id="how-title">Turn an untouched archive into decisions</h2><ol><li><span>1</span><div><h3>Import bookmark HTML</h3><p>Choose the standard HTML file from Chrome, Firefox, Safari, or Edge.</p></div></li><li><span>2</span><div><h3>Check and add context</h3><p>Start a throttled check. Note the purpose, profile, or login each link needs.</p></div></li><li><span>3</span><div><h3>Keep, repair, or archive</h3><p>Fix moved URLs, mark decisions, then export a standard HTML file.</p></div></li></ol></section>
  <section class="privacy-block" aria-labelledby="boundary-title"><div class="section-tag">03 · Clear boundary</div><div><h2 id="boundary-title">Your archive is not our dataset</h2><p>The extension stores bookmarks, notes, and decisions in browser storage. A link check contacts only the site for that link. No analytics, account, hosted sync, or AI summary sits between you and the archive.</p><a class="text-link route-link" href="/privacy">Read the privacy details →</a></div><aside><h3>It does not</h3><ul><li>Upload an archive</li><li>Scrape paywalled pages</li><li>Guess why you saved a link</li><li>Lock export behind payment</li></ul></aside></section>
  <section class="paid" aria-labelledby="paid-title"><div><p class="eyebrow">One-time license</p><h2 id="paid-title">Review a larger archive for $18</h2><p>Free use includes 50 link checks, every note, every decision, and HTML export. One payment removes the check limit on your devices.</p></div><div class="purchase-slab"><strong>$18</strong><span>once</span><a class="button primary" href="${CHECKOUT_URL}">Buy the full review</a><button class="button secondary" data-action="paste-license">Have a license? Paste it</button><small>Sociobot and Dodo handle payment and refunds. <a class="route-link" href="/terms">Read the terms.</a></small>${license?.valid ? '<p class="license-ok" role="status">Full review is active on this browser.</p>' : ''}</div></section>`;
}

function previewLedger() {
  const items = [sampleBookmarks[1], sampleBookmarks[2], sampleBookmarks[4]];
  return `<div class="ledger-preview"><div class="ledger-nav"><strong>Review groups</strong><span>Dead pages <b>1</b></span><span>Login or restricted <b>1</b></span><span>Duplicates <b>1</b></span></div><div class="ledger-sheet">${items.map(record => `<article class="mini-record state-${record.state}"><span class="status-dot" aria-hidden="true"></span><div><h3>${record.title}</h3><p>${record.folder} · saved ${new Date(record.addedAt!).getUTCFullYear()}</p></div><strong>${statusText(record.state)}</strong></article>`).join('')}</div></div>`;
}

function demoPage() {
  const visible = demoRecords.filter(record => demoFilter === 'all' ? true : demoFilter === 'duplicates' ? Boolean(record.duplicateOf) : record.state === demoFilter);
  return `<section class="demo-banner" aria-label="Demo mode"><strong>Demo — sample data, nothing is saved</strong><span><button data-action="reset-demo">Reset demo</button><a class="button" href="/downloads/bookmark-freshness-review.zip" download>Start for real</a></span></section>
  <section class="demo-head"><p class="eyebrow">Six sample bookmarks</p><h1>Decide what still belongs</h1><p>Change a note or decision. Demo changes use a separate sandbox.</p><div><button class="button primary" data-action="sample-check">Run sample check</button><button class="button" data-action="export-demo">Export kept HTML</button></div></section>
  <section class="demo-workspace" aria-label="Sample bookmark review"><aside><h2>Review groups</h2>${demoFilterButton('all', 'All')}${demoFilterButton('dead', 'Dead pages')}${demoFilterButton('failed', 'Failed checks')}${demoFilterButton('restricted', 'Login or restricted')}${demoFilterButton('redirected', 'Moved or changed')}${demoFilterButton('duplicates', 'Duplicates')}</aside><div class="demo-ledger"><div class="demo-ledger-head"><h2>${demoFilter === 'all' ? 'All bookmarks' : demoFilter === 'duplicates' ? 'Duplicates' : statusText(demoFilter)}</h2><span>${visible.length} shown</span></div>${visible.length ? visible.map(demoRecord).join('') : '<div class="empty-demo"><h3>No bookmarks in this group</h3><p>Choose another group to see sample bookmarks.</p></div>'}</div></section>`;
}

function demoFilterButton(value: typeof demoFilter, label: string) {
  const count = demoRecords.filter(record => value === 'all' ? true : value === 'duplicates' ? Boolean(record.duplicateOf) : record.state === value).length;
  return `<button data-demo-filter="${value}" aria-pressed="${demoFilter === value}"><span>${label}</span><b>${count}</b></button>`;
}

function demoRecord(record: BookmarkRecord) {
  return `<article class="demo-record state-${record.state}"><header><span class="status-dot" aria-hidden="true"></span><div><h3>${escapeHtml(record.title)}</h3><a href="${escapeHtml(record.url)}" target="_blank" rel="noreferrer">${escapeHtml(new URL(record.url).hostname)} <span class="sr-only">(opens in a new tab)</span></a></div><strong>${statusText(record.state)}${record.statusCode ? ` · ${record.statusCode}` : ''}</strong></header>${record.error ? `<p class="record-error">${escapeHtml(record.error)}</p>` : ''}${record.duplicateOf ? '<p class="record-change">Duplicate of another bookmark in this sample.</p>' : ''}<label>Purpose or browser context<textarea data-demo-note="${record.id}" rows="2">${escapeHtml(record.note)}</textarea></label><div class="decision-row"><button data-demo-decision="keep" data-id="${record.id}" aria-pressed="${record.decision === 'keep'}">Keep</button><button data-demo-decision="review" data-id="${record.id}" aria-pressed="${record.decision === 'review'}">Review later</button><button data-demo-decision="archive" data-id="${record.id}" aria-pressed="${record.decision === 'archive'}">Archive</button></div></article>`;
}

function privacyPage() {
  return `<article class="legal"><p class="eyebrow">Effective 28 August 2026</p><h1>Your bookmarks stay on your device</h1><p class="lede">Bookmark Freshness Review is a local browser extension. It has no account system or hosted bookmark database.</p><h2>What the extension stores</h2><p>The extension stores imported bookmarks, purpose notes, review decisions, check results, and your license in browser storage. Demo data uses a separate <code>demo:</code> storage key.</p><h2>When a network request happens</h2><p>A link check contacts the saved website after you start the check. The request may reveal your IP address to that site. The checker omits browser credentials and throttles requests. A license check sends only the license token to Sociobot.</p><h2>What we do not collect</h2><p>We do not receive your archive, notes, decisions, or checked page content. This site loads no analytics, advertising scripts, or third-party fonts.</p><h2>Payments</h2><p>Sociobot and Dodo are the merchant of record. Their checkout receives the payment details needed to complete a purchase. This product never receives card details.</p><h2>Delete your data</h2><p>Remove the extension to delete its local storage. You can also clear the extension data in your browser settings.</p><h2>Questions</h2><p>Email <a href="mailto:privacy@sociobot.in">privacy@sociobot.in</a>.</p></article>`;
}

function termsPage() {
  return `<article class="legal"><p class="eyebrow">Effective 28 August 2026</p><h1>Terms for using this extension</h1><p class="lede">Use Bookmark Freshness Review to inspect archives that you have the right to access.</p><h2>The service</h2><p>The free tier includes 50 link checks, local notes and decisions, and standard HTML export. The $18 one-time license removes the link-check limit for the current product version.</p><h2>Link-check results</h2><p>A failed request does not prove that a page is dead. Sites can block automated requests or require a login. Review a result before deleting a bookmark.</p><h2>Purchases and refunds</h2><p>Sociobot and Dodo handle checkout as the merchant of record. Approved refunds revoke the associated license. Paste the license into another device to restore a purchase.</p><h2>Acceptable use</h2><p>Do not use the checker to overload sites or bypass access controls. The built-in throttle may not be removed to target a site.</p><h2>Warranty</h2><p>The software is provided as-is under the MIT License. Keep a backup before replacing a bookmark archive.</p><h2>Questions</h2><p>Email <a href="mailto:support@sociobot.in">support@sociobot.in</a>.</p></article>`;
}

function notFoundPage() {
  return `<section class="not-found"><div class="broken-plot" aria-hidden="true"><i></i><i></i><i></i></div><p class="eyebrow">404 · misplaced marker</p><h1>This page is not in the archive</h1><p>The address may be old or incomplete.</p><a class="button primary route-link" href="/">Return to the review bench</a></section>`;
}

function bind() {
  root.querySelectorAll<HTMLAnchorElement>('a.route-link').forEach(link => link.addEventListener('click', event => { if (!isPlainClick(event)) return; event.preventDefault(); navigate(new URL(link.href).pathname); }));
  root.querySelectorAll<HTMLButtonElement>('[data-demo-filter]').forEach(button => button.addEventListener('click', () => { demoFilter = button.dataset.demoFilter as typeof demoFilter; renderRoute(); root.querySelector<HTMLElement>('.demo-ledger h2')?.focus(); }));
  root.querySelectorAll<HTMLTextAreaElement>('[data-demo-note]').forEach(area => area.addEventListener('change', () => changeDemo(area.dataset.demoNote!, { note: area.value })));
  root.querySelectorAll<HTMLButtonElement>('[data-demo-decision]').forEach(button => button.addEventListener('click', () => changeDemo(button.dataset.id!, { decision: button.dataset.demoDecision as BookmarkRecord['decision'] })));
  root.querySelectorAll<HTMLElement>('[data-action]').forEach(element => element.addEventListener('click', onAction));
}

async function onAction(event: Event) {
  const action = (event.currentTarget as HTMLElement).dataset.action;
  if (action === 'reset-demo') { localStorage.removeItem(DEMO_KEY); demoRecords = structuredClone(sampleBookmarks); demoFilter = 'all'; renderRoute(); announce('Demo reset.'); }
  if (action === 'export-demo') { download(exportBookmarkHtml(demoRecords.filter(r => r.decision !== 'archive'))); announce('Sample bookmarks exported as HTML.'); }
  if (action === 'sample-check') { const button = event.currentTarget as HTMLButtonElement; button.textContent = 'Checking sample…'; button.disabled = true; setTimeout(() => { renderRoute(); announce('Six sample checks finished. Dead pages and failed checks remain separate.'); }, 350); }
  if (action === 'paste-license') await pasteLicense();
}

function changeDemo(id: string, changes: Partial<BookmarkRecord>) { demoRecords = demoRecords.map(r => r.id === id ? { ...r, ...changes } : r); localStorage.setItem(DEMO_KEY, JSON.stringify(demoRecords)); renderRoute(); announce('Demo bookmark updated.'); }
function loadDemo(): BookmarkRecord[] { try { return JSON.parse(localStorage.getItem(DEMO_KEY) || 'null') || structuredClone(sampleBookmarks); } catch { return structuredClone(sampleBookmarks); } }
function loadLicense(): LicenseCache | null { try { return JSON.parse(localStorage.getItem(LICENSE_KEY) || 'null'); } catch { return null; } }

async function captureLicense() {
  const token = new URLSearchParams(location.search).get('license');
  if (!token) return;
  license = { token, valid: true, checkedAt: 0 }; localStorage.setItem(LICENSE_KEY, JSON.stringify(license)); history.replaceState({}, '', location.pathname); renderRoute();
  try { license = { token, valid: await verifyLicense(token), checkedAt: Date.now() }; localStorage.setItem(LICENSE_KEY, JSON.stringify(license)); renderRoute(); } catch { /* Optimistic cached access stays available until the next check. */ }
}

async function pasteLicense() {
  const token = prompt('Paste your Bookmark Freshness Review license:')?.trim(); if (!token) return;
  try { license = { token, valid: await verifyLicense(token), checkedAt: Date.now() }; localStorage.setItem(LICENSE_KEY, JSON.stringify(license)); renderRoute(); announce(license.valid ? 'Full review activated.' : 'This license is not active.'); } catch { announce('The license could not be checked. Try again when you are online.'); }
}

function download(content: string) { const url = URL.createObjectURL(new Blob([content], { type: 'text/html;charset=utf-8' })); const a = document.createElement('a'); a.href = url; a.download = 'reviewed-bookmarks.html'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 500); }
function navigate(path: string) { history.pushState({}, '', path); renderRoute(); requestAnimationFrame(() => { root.querySelector<HTMLElement>('h1')?.focus(); document.querySelector<HTMLElement>('#main')?.focus(); }); announce(document.title); scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); }
function announce(value: string) { routeStatus.textContent = value; }
function isPlainClick(event: MouseEvent) { return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey; }
function statusText(state: LinkState) { return ({ unchecked: 'Not checked', alive: 'Alive', redirected: 'Moved or changed', restricted: 'Login or restricted', dead: 'Dead page', failed: 'Check failed' })[state]; }
function escapeHtml(value: string) { return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

addEventListener('popstate', () => { renderRoute(); announce(document.title); });
