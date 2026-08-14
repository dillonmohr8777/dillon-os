/**
 * End-to-end outreach engine.
 *
 * Mac's chain: scrape → database → site builder → QR → direct mail → gatekeep.
 * Human approval is a hard gate. This runner never sends mail or flips mail_ready.
 *
 *   const { runEngine } = require('./pipeline')
 *   await runEngine({ source: 'jesse-238', count: 5, batchDir })
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { encodeSvg } = require('./qr');
const { mailPieceHtml } = require('./mail-piece');
const { gatekeepHtml, trackedUrl, fallbackUrl } = require('./gatekeep');
const { emitSheets } = require('./sheet');
const { emptyLedger, saveLedger } = require('./ledger');
const { loadJesse238, summarize } = require('./jesse-238');
const { briefFromProspect } = require('./brief-factory');
const { writeUniqueAssets } = require('./assets');
const { repoPath, ensureDir, todayISO, slugify } = require('../../automation/lib/fsutil');

const BATCH_ROOT = '02_Campaigns/AI Site Builder Outreach Engine/batches';

function csvCell(v) {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function writeCsv(file, header, rows) {
  const lines = [header.join(',')];
  for (const r of rows) lines.push(header.map((h) => csvCell(r[h])).join(','));
  fs.writeFileSync(file, lines.join('\n') + '\n');
}

function selectProspects(opts) {
  const source = opts.source || 'jesse-238';
  if (source === 'jesse-238') {
    const pack = loadJesse238(opts.from);
    const list = pack.prospects.slice(0, opts.count || pack.prospects.length);
    return {
      pack,
      summary: summarize({ ...pack, prospects: list }),
      prospects: list,
      alreadyBuilt: true,
      deployBaseUrl: opts.deployBaseUrl || pack.hub,
    };
  }
  if (source === 'demo') {
    const file = opts.from || path.join(__dirname, '..', 'fixtures', 'demo-prospects.json');
    const doc = JSON.parse(fs.readFileSync(file, 'utf8'));
    return {
      pack: doc,
      summary: { count: doc.prospects.length },
      prospects: doc.prospects,
      alreadyBuilt: false,
      deployBaseUrl: opts.deployBaseUrl || 'http://127.0.0.1:4242/outreach/demo',
    };
  }
  throw new Error(`unknown source: ${source}`);
}

function activatePack(batchDir, batch, prospects, deployBaseUrl) {
  const qrDir = path.join(batchDir, 'qr');
  const gateDir = path.join(batchDir, 'gate');
  const mailDir = path.join(batchDir, 'mail');
  ensureDir(qrDir);
  ensureDir(gateDir);
  ensureDir(mailDir);

  const rows = prospects.map((p) => {
    const slug = p.slug || slugify(p.business_name);
    const qrTarget = trackedUrl(`${deployBaseUrl}`, slug, batch.id, p.prospect_id) ||
      fallbackUrl(p.live_site, batch.id, p.prospect_id);
    const encoded = encodeSvg(qrTarget, { scale: 3, margin: 3 });
    fs.writeFileSync(path.join(qrDir, `${slug}.svg`), encoded.svg);
    const gate = gatekeepHtml({
      ...p,
      batch_id: batch.id,
      live_site: fallbackUrl(p.live_site, batch.id, p.prospect_id) || p.live_site,
    });
    ensureDir(path.join(gateDir, slug));
    fs.writeFileSync(path.join(gateDir, slug, 'index.html'), gate);
    const mail = mailPieceHtml({
      ...p,
      name: p.business_name,
      qrSvg: encoded.svg,
      qr_target_url: qrTarget,
    });
    fs.writeFileSync(path.join(mailDir, `${slug}.html`), mail);
    return {
      ...p,
      slug,
      qr_target_url: qrTarget,
      qr_version: encoded.version,
      qa_ready: p.qa_ready || 'hold',
      mail_ready: 'hold',
    };
  });

  const sheets = emitSheets(rows, batch);
  fs.writeFileSync(path.join(batchDir, 'zapier.csv'), sheets.zapier);
  fs.writeFileSync(path.join(batchDir, 'qrtiger.csv'), sheets.qrtiger);
  fs.writeFileSync(path.join(batchDir, 'postgrid.csv'), sheets.postgrid);

  writeCsv(
    path.join(batchDir, 'prospects.csv'),
    [
      'prospect_id',
      'business',
      'vertical',
      'live_site',
      'qr_target_url',
      'qa_ready',
      'mail_ready',
      'approved_by',
      'has_email',
      'batch',
    ],
    rows.map((r) => ({
      prospect_id: r.prospect_id,
      business: r.business_name,
      vertical: r.vertical,
      live_site: r.live_site,
      qr_target_url: r.qr_target_url,
      qa_ready: r.qa_ready,
      mail_ready: 'hold',
      approved_by: '',
      has_email: r.has_email ? 'yes' : 'no',
      batch: r.batch || batch.id,
    }))
  );

  writeCsv(
    path.join(batchDir, 'manifest.csv'),
    ['prospect_id', 'business', 'slug', 'qr_target_url', 'live_site', 'qa_ready', 'mail_ready'],
    rows.map((r) => ({
      prospect_id: r.prospect_id,
      business: r.business_name,
      slug: r.slug,
      qr_target_url: r.qr_target_url,
      live_site: r.live_site,
      qa_ready: r.qa_ready,
      mail_ready: 'hold',
    }))
  );

  return rows;
}

function writeHub(batchDir, batch, rows) {
  const esc = (s) =>
    String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  const cards = rows
    .map(
      (r) => `<a class="card" href="gate/${esc(r.slug)}/index.html">
  <span class="meta"><span>${esc(r.prospect_id)}</span><span>${esc(r.vertical)}</span></span>
  <h2>${esc(r.business_name)}</h2>
  <p>${esc(r.batch || batch.id)} · mail hold</p>
  <span class="row"><a href="${esc(r.live_site)}">Live site</a><a href="mail/${esc(r.slug)}.html">Mail proof</a><a href="qr/${esc(r.slug)}.svg">QR</a></span>
</a>`
    )
    .join('\n');
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow">
<title>${esc(batch.title)}</title>
<style>
:root{--bg:#0b0d12;--ink:#f2f5fb;--muted:#9aa5b8;--accent:#b6f36d;--line:#ffffff1e;--card:#ffffff0a}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.5 "Space Grotesk",system-ui,sans-serif}
.wrap{width:min(1200px,calc(100% - 40px));margin:auto}header{padding:72px 0 28px}
.k{font:600 11px ui-monospace,monospace;letter-spacing:.16em;text-transform:uppercase;color:var(--accent)}
h1{font-size:clamp(2.2rem,5vw,3.8rem);letter-spacing:-.03em;margin:12px 0 10px}
header p{color:var(--muted);max-width:62ch}
.stats{display:flex;gap:28px;margin-top:24px;padding-top:20px;border-top:1px solid var(--line)}
.stats strong{display:block;font-size:1.8rem}
.stats span{font:600 11px ui-monospace,monospace;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px;padding:28px 0 80px}
.card{display:flex;flex-direction:column;gap:8px;padding:18px;border:1px solid var(--line);border-radius:16px;background:var(--card);text-decoration:none;color:inherit}
.meta{display:flex;justify-content:space-between;font:600 11px ui-monospace,monospace;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
.card h2{margin:0;font-size:1.2rem}.card p{margin:0;color:var(--muted);font-size:.9rem}
.row{display:flex;gap:12px;margin-top:auto;font:600 11px ui-monospace,monospace;text-transform:uppercase}
.row a{color:var(--accent)}
</style></head><body>
<div class="wrap"><header>
<span class="k">Outreach engine · ${esc(batch.id)}</span>
<h1>${esc(batch.title)}</h1>
<p>${esc(batch.note)}. QR, mail proof, and the sales-call gate are generated. mail_ready stays hold until Mac or Melissa approve the exact list.</p>
<div class="stats">
<div><strong>${rows.length}</strong><span>Prospects</span></div>
<div><strong>${rows.filter((r) => r.qa_ready === 'ready').length}</strong><span>QA ready</span></div>
<div><strong>0</strong><span>Mail ready</span></div>
</div>
</header>
<div class="grid">${cards}</div>
</div></body></html>`;
  fs.writeFileSync(path.join(batchDir, 'index.html'), html);
}

async function maybeBuildNewSites(batchDir, batch, prospects, opts) {
  if (opts.alreadyBuilt) return { built: false, qaReadyCount: prospects.filter((p) => p.qa_ready === 'ready').length };
  const { runBatch } = require('../../../_templates/site-factory/build-batch.js');
  const briefsDir = path.join(batchDir, 'briefs');
  ensureDir(briefsDir);
  prospects.forEach((p, i) => {
    const brief = briefFromProspect(p, i);
    fs.writeFileSync(path.join(briefsDir, `${p.slug}.json`), JSON.stringify(brief, null, 2) + '\n');
  });
  const sitesRoot = path.join(batchDir, 'sites');
  ensureDir(sitesRoot);
  const { buildSite } = require('../../../_templates/site-factory/build-site.js');
  prospects.forEach((p, i) => {
    const brief = JSON.parse(fs.readFileSync(path.join(briefsDir, `${p.slug}.json`), 'utf8'));
    buildSite(brief, sitesRoot);
    writeUniqueAssets(path.join(sitesRoot, p.slug), i + 1);
  });
  const summary = await runBatch(batchDir, {
    allowPartial: !!opts.allowPartial,
    skipQa: !!opts.skipQa,
    quiet: !!opts.quiet,
    runQa: opts.runQa,
  });
  return { built: true, summary };
}

async function runEngine(opts = {}) {
  const selected = selectProspects(opts);
  const id = opts.batchId || (selected.alreadyBuilt ? 'jesse-238' : 'demo');
  const batchDir = opts.batchDir || repoPath(BATCH_ROOT, id);
  ensureDir(batchDir);
  const batch = {
    id,
    title: opts.title || (selected.alreadyBuilt ? 'Jesse 238 · QR + mail + gatekeep' : 'Demo outreach batch'),
    market: 'Philadelphia, PA',
    week: todayISO(),
    targetCount: selected.prospects.length,
    deployBaseUrl: selected.deployBaseUrl,
    note: selected.alreadyBuilt
      ? 'Sites already live as noindex drafts. This pack adds QR codes, mail proofs, Zapier CSVs, and the sales-call gate.'
      : 'Factory demo. Fictional businesses only.',
    hypothesis: 'QR on a mail piece through a gatekeep landing books more calls than cold phone alone.',
  };
  fs.writeFileSync(path.join(batchDir, 'batch.json'), JSON.stringify(batch, null, 2) + '\n');

  const build = await maybeBuildNewSites(batchDir, batch, selected.prospects, {
    alreadyBuilt: selected.alreadyBuilt,
    allowPartial: opts.allowPartial,
    skipQa: opts.skipQa,
    quiet: opts.quiet,
    runQa: opts.runQa,
  });

  const rows = activatePack(batchDir, batch, selected.prospects, selected.deployBaseUrl);
  writeHub(batchDir, batch, rows);
  saveLedger(batchDir, emptyLedger(batch));

  const summary = {
    ok: rows.every((r) => r.mail_ready === 'hold'),
    batchId: batch.id,
    source: opts.source || 'jesse-238',
    count: rows.length,
    qaReadyCount: rows.filter((r) => r.qa_ready === 'ready').length,
    mailReadyAlwaysHold: true,
    alreadyBuilt: selected.alreadyBuilt,
    deployBaseUrl: selected.deployBaseUrl,
    batchDir,
    built: build.built,
    stats: selected.summary,
  };
  fs.writeFileSync(path.join(batchDir, 'engine-summary.json'), JSON.stringify(summary, null, 2) + '\n');
  return summary;
}

module.exports = { runEngine, selectProspects, activatePack, BATCH_ROOT };
