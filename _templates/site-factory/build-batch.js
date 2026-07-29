#!/usr/bin/env node
/**
 * Weekly batch runner. Builds a whole outreach batch (target: 25 sites) and emits
 * everything the pipeline downstream needs.
 *
 *   node _templates/site-factory/build-batch.js <batch-dir> [--skip-qa]
 *
 * Expected input:
 *   <batch-dir>/batch.json      batch metadata (id, market, week, deployBaseUrl)
 *   <batch-dir>/briefs/*.json   one brief per prospect
 *
 * Emitted output:
 *   <batch-dir>/sites/<slug>/   the built sites
 *   <batch-dir>/index.html      review hub, one link for the whole batch
 *   <batch-dir>/manifest.csv    sheet-ready rows for Zapier to QRTiger
 *   <batch-dir>/prospects.csv   mail-merge rows with an address ready flag
 *   <batch-dir>/batch-report.md vault-ready report with spec compliance and QA results
 *
 * Pipeline context: 02_Campaigns/AI Site Builder Outreach Engine/Pipeline Spec.md
 * Canonical spec:   philly-sites/DESIGN-SYSTEM.md
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');
const { buildSite } = require('./build-site.js');

const batchDir = process.argv[2];
const skipQa = process.argv.includes('--skip-qa');
if (!batchDir || !fs.existsSync(path.join(batchDir, 'batch.json'))) {
  console.error('Usage: node build-batch.js <batch-dir> [--skip-qa]   (batch-dir must contain batch.json)');
  process.exit(1);
}

const batch = JSON.parse(fs.readFileSync(path.join(batchDir, 'batch.json'), 'utf8'));
const briefsDir = path.join(batchDir, 'briefs');
const briefFiles = fs.existsSync(briefsDir) ? fs.readdirSync(briefsDir).filter((f) => f.endsWith('.json')).sort() : [];
if (!briefFiles.length) {
  console.error(`No briefs found in ${briefsDir}`);
  process.exit(1);
}

// Canonical targets measured across the existing 25 sites.
const SPEC = { sections: [9, 11], words: [350, 500], images: [12, 13], kb: [27, 37] };
const TARGET_COUNT = batch.targetCount || 25;

const sitesRoot = path.join(batchDir, 'sites');
fs.mkdirSync(sitesRoot, { recursive: true });

const csvCell = (v) => {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const esc = (s) =>
  String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const results = [];
const imageHashes = new Map(); // content hash -> [slug/file]

console.log(`Batch ${batch.id} | ${briefFiles.length} briefs | market: ${batch.market || 'n/a'}\n`);

for (const [i, file] of briefFiles.entries()) {
  const briefPath = path.join(briefsDir, file);
  const row = { file, warnings: [], failures: [] };
  let brief;
  try {
    brief = JSON.parse(fs.readFileSync(briefPath, 'utf8'));
  } catch (err) {
    row.slug = file.replace(/\.json$/, '');
    row.failures.push(`brief does not parse: ${err.message}`);
    results.push(row);
    continue;
  }

  row.slug = brief.slug;
  row.name = brief.name;
  row.vertical = brief.vertical || brief.category || '';
  row.market = brief.market || batch.market || '';
  row.address = brief.address || '';
  row.phone = brief.phone || '';
  row.sourceUrl = brief.url || '';
  row.prospectId = brief.prospectId || `${(batch.idPrefix || 'B').toUpperCase()}${String(i + 1).padStart(3, '0')}`;

  try {
    const built = buildSite(brief, sitesRoot);
    row.sections = built.sections.length;
    row.words = built.words;
    row.images = built.images;
    row.kb = +(built.htmlBytes / 1024).toFixed(1);
    row.outDir = built.outDir;
    row.missingAssets = built.missingAssets;

    // Spec compliance against the measured canonical range
    if (row.sections < SPEC.sections[0]) row.warnings.push(`thin: ${row.sections} sections (target ${SPEC.sections[0]}-${SPEC.sections[1]})`);
    if (row.words < SPEC.words[0]) row.warnings.push(`thin copy: ${row.words} words (target ${SPEC.words[0]}-${SPEC.words[1]})`);
    if (row.images < SPEC.images[0]) row.warnings.push(`few images: ${row.images} (target ${SPEC.images[0]}-${SPEC.images[1]})`);
    if (built.missingAssets.length) row.failures.push(`${built.missingAssets.length} missing asset file(s)`);

    // Duplicate imagery across the whole batch: every photo must be unique
    const assetsDir = path.join(built.outDir, 'assets');
    if (fs.existsSync(assetsDir)) {
      for (const f of fs.readdirSync(assetsDir)) {
        const full = path.join(assetsDir, f);
        if (!fs.statSync(full).isFile()) continue;
        const hash = crypto.createHash('sha1').update(fs.readFileSync(full)).digest('hex');
        const key = `${brief.slug}/${f}`;
        if (imageHashes.has(hash)) imageHashes.get(hash).push(key);
        else imageHashes.set(hash, [key]);
      }
    }
    console.log(`[${i + 1}/${briefFiles.length}] ${brief.slug}: ${row.sections} sections, ${row.words} words, ${row.images} images, ${row.kb} KB`);
  } catch (err) {
    row.failures.push(`build failed: ${err.message}`);
    console.log(`[${i + 1}/${briefFiles.length}] ${brief.slug}: BUILD FAILED ${err.message}`);
  }
  results.push(row);
}

// Cross-batch duplicate image report
const duplicates = [...imageHashes.values()].filter((list) => list.length > 1);
duplicates.forEach((list) => {
  list.forEach((key) => {
    const slug = key.split('/')[0];
    const row = results.find((r) => r.slug === slug);
    if (row) row.failures.push(`duplicate image shared across batch: ${key}`);
  });
});

// Per-site QA
if (!skipQa) {
  console.log('\nRunning QA...');
  for (const row of results) {
    if (!row.outDir || !fs.existsSync(row.outDir)) continue;
    try {
      const out = execFileSync('node', [path.join(__dirname, 'qa.js'), row.outDir], { encoding: 'utf8' });
      row.qa = 'PASS';
      row.qaWarnings = (out.match(/ {2}WARN {2}.+/g) || []).map((s) => s.replace(/ {2}WARN {2}/, ''));
    } catch (err) {
      const out = (err.stdout || '') + (err.stderr || '');
      row.qa = 'FAIL';
      row.qaFailures = (out.match(/ {2}FAIL {2}.+/g) || []).map((s) => s.replace(/ {2}FAIL {2}/, ''));
      row.failures.push(...(row.qaFailures || ['QA failed']));
    }
    console.log(`  ${row.slug}: ${row.qa}`);
  }
}

// ---- Outputs ----
const built = results.filter((r) => r.outDir && !r.failures.length);
const blocked = results.filter((r) => r.failures.length);
const deployBase = (batch.deployBaseUrl || '').replace(/\/$/, '');
const utm = `utm_source=directmail&utm_medium=qr&utm_campaign=${encodeURIComponent(batch.id)}`;
const targetUrl = (r) => (deployBase ? `${deployBase}/sites/${r.slug}/?${utm}&utm_content=${r.prospectId}` : '');

// manifest.csv: the sheet Zapier reads to generate QR codes
const manifestHeader = ['prospect_id', 'business', 'market', 'vertical', 'slug', 'site_url', 'qr_target_url', 'source_url', 'qa', 'spec_sections', 'spec_words', 'spec_images'];
const manifestRows = results.map((r) =>
  [r.prospectId, r.name, r.market, r.vertical, r.slug, deployBase ? `${deployBase}/sites/${r.slug}/` : '', targetUrl(r), r.sourceUrl, r.qa || (r.failures.length ? 'FAIL' : 'NOT RUN'), r.sections ?? '', r.words ?? '', r.images ?? '']
    .map(csvCell)
    .join(',')
);
fs.writeFileSync(path.join(batchDir, 'manifest.csv'), [manifestHeader.join(','), ...manifestRows].join('\n') + '\n');

// prospects.csv: the mail-merge sheet. mail_ready gates the PostGrid/StackAdapt zap.
const prospectHeader = ['prospect_id', 'business', 'address', 'phone', 'market', 'vertical', 'qr_target_url', 'mail_ready', 'approved_by', 'mailed_on', 'scanned', 'call_booked', 'notes'];
const prospectRows = results.map((r) => {
  const ready = r.qa === 'PASS' && r.address && !r.failures.length ? 'ready' : 'hold';
  return [r.prospectId, r.name, r.address, r.phone, r.market, r.vertical, targetUrl(r), ready, '', '', '', '', r.failures.join('; ')]
    .map(csvCell)
    .join(',');
});
fs.writeFileSync(path.join(batchDir, 'prospects.csv'), [prospectHeader.join(','), ...prospectRows].join('\n') + '\n');

// index.html: the one link the bosses review
const verticals = [...new Set(results.map((r) => r.vertical).filter(Boolean))];
const filterButtons = ['all', ...verticals]
  .map((v, i) => `<button data-filter="${esc(v)}"${i === 0 ? ' class="active"' : ''}>${esc(v === 'all' ? 'All' : v)}</button>`)
  .join('');
const cards = results
  .map((r) => {
    const href = r.outDir ? `sites/${r.slug}/index.html` : '#';
    const status = r.failures.length ? '<span class="bad">Blocked</span>' : r.qa === 'PASS' ? '<span class="good">QA pass</span>' : '<span class="warn">QA not run</span>';
    return `<a class="card" data-kind="${esc(r.vertical)}" href="${esc(href)}"><span class="meta"><span>${esc(r.prospectId)}</span><span>${esc(r.vertical)}</span></span><h2>${esc(r.name || r.slug)}</h2><p>${esc(r.address || 'Address not verified')}</p><span class="row">${status}<span class="spec">${r.sections ?? '-'} sec / ${r.words ?? '-'} words</span></span><span class="open">Open homepage</span></a>`;
  })
  .join('\n');

const hub = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow,noarchive"><title>${esc(batch.title || batch.id)} | Batch Review</title><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500;600&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet"><style>
:root{--bg:#0b0d12;--ink:#f2f5fb;--muted:#9aa5b8;--accent:#b6f36d;--line:#ffffff1e;--card:#ffffff0a}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.6 "Space Grotesk",sans-serif;-webkit-font-smoothing:antialiased}
.wrap{width:min(1280px,calc(100% - 40px));margin:auto}
header{padding:84px 0 40px}
.k{font:600 11px/1 "IBM Plex Mono",monospace;letter-spacing:.16em;text-transform:uppercase;color:var(--accent)}
h1{font-size:clamp(2.6rem,6vw,4.6rem);line-height:1.02;letter-spacing:-.03em;margin:18px 0 20px;max-width:18ch;text-wrap:balance}
header p{max-width:680px;color:var(--muted);margin:0;text-wrap:pretty}
.stats{display:flex;flex-wrap:wrap;gap:28px;margin-top:32px;padding-top:28px;border-top:1px solid var(--line)}
.stats div{min-width:110px}
.stats strong{display:block;font-size:1.9rem;line-height:1.1}
.stats span{font:600 11px "IBM Plex Mono",monospace;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}
.controls{position:sticky;top:0;z-index:5;background:#0b0d12e6;backdrop-filter:blur(18px);border-bottom:1px solid var(--line)}
.controls .wrap{display:flex;gap:10px;flex-wrap:wrap;padding:14px 0}
.controls button{min-height:44px;padding:0 16px;border-radius:10px;border:1px solid var(--line);background:transparent;color:var(--ink);font:600 12px "IBM Plex Mono",monospace;letter-spacing:.04em;cursor:pointer;transition:border-color .2s ease,background .2s ease}
.controls button:hover,.controls button.active{border-color:var(--accent);background:#b6f36d1a}
.controls input{flex:1;min-width:200px;min-height:44px;padding:0 14px;border-radius:10px;border:1px solid var(--line);background:transparent;color:var(--ink);font:14px "Space Grotesk",sans-serif}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px;padding:34px 0 90px}
.card{display:flex;flex-direction:column;gap:10px;padding:22px;border:1px solid var(--line);border-radius:16px;background:var(--card);text-decoration:none;color:inherit;transition:transform .22s ease,border-color .22s ease}
.card:hover{transform:translateY(-4px);border-color:var(--accent)}
.card[hidden]{display:none}
.meta{display:flex;justify-content:space-between;gap:12px;font:600 11px "IBM Plex Mono",monospace;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)}
.card h2{margin:0;font-size:1.3rem;line-height:1.2;letter-spacing:-.01em}
.card p{margin:0;color:var(--muted);font-size:.9rem}
.row{display:flex;justify-content:space-between;gap:10px;align-items:center;font:600 11px "IBM Plex Mono",monospace;letter-spacing:.06em}
.good{color:var(--accent)}.warn{color:#f3d96d}.bad{color:#ff8080}
.spec{color:var(--muted)}
.open{margin-top:auto;padding-top:8px;font:600 11px "IBM Plex Mono",monospace;letter-spacing:.1em;text-transform:uppercase;color:var(--accent)}
footer{padding:40px 0 70px;border-top:1px solid var(--line);color:var(--muted);font-size:.85rem}
</style></head><body>
<div class="wrap"><header><span class="k">${esc(batch.market || 'Batch')} | Week of ${esc(batch.week || '')}</span><h1>${esc(batch.title || batch.id)}</h1><p>${esc(batch.note || 'Prebuilt prospect homepages for outreach review. Every site is a private noindex draft built from the business\u2019s own copy, imagery, and brand colors, then upgraded on design, UX, motion, and technical quality.')}</p>
<div class="stats"><div><strong>${results.length}</strong><span>Prospects</span></div><div><strong>${built.length}</strong><span>Ready</span></div><div><strong>${blocked.length}</strong><span>Blocked</span></div><div><strong>${TARGET_COUNT}</strong><span>Weekly target</span></div></div>
</header></div>
<div class="controls"><div class="wrap">${filterButtons}<input id="q" type="search" placeholder="Search business"></div></div>
<main class="wrap"><div class="grid">
${cards}
</div></main>
<div class="wrap"><footer>Private staging concept. Details should be reconfirmed on each official website before publication. Batch ${esc(batch.id)}, generated ${new Date().toISOString().slice(0, 10)}.</footer></div>
<script>
const cards=[...document.querySelectorAll('.card')],q=document.querySelector('#q');let kind='all';
function apply(){const s=q.value.toLowerCase().trim();cards.forEach(c=>{const name=c.querySelector('h2').textContent.toLowerCase();c.hidden=(kind!=='all'&&c.dataset.kind!==kind)||(s&&!name.includes(s))})}
document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{kind=b.dataset.filter;document.querySelectorAll('[data-filter]').forEach(x=>x.classList.toggle('active',x===b));apply()});
q.oninput=apply;
</script></body></html>`;
fs.writeFileSync(path.join(batchDir, 'index.html'), hub);

// batch-report.md for the vault
const avg = (k) => (built.length ? Math.round(built.reduce((s, r) => s + (r[k] || 0), 0) / built.length) : 0);
const report = `---
tags: [campaign, batch, report]
campaign: "[[AI Site Builder Outreach Engine]]"
batch: ${batch.id}
market: ${batch.market || ''}
week: ${batch.week || ''}
generated: ${new Date().toISOString().slice(0, 10)}
---

# Batch Report: ${batch.id}

${built.length} of ${results.length} sites ready. Weekly target is ${TARGET_COUNT}.

## Spec compliance

Canonical targets from \`philly-sites/DESIGN-SYSTEM.md\`: ${SPEC.sections[0]} to ${SPEC.sections[1]} sections, ${SPEC.words[0]} to ${SPEC.words[1]} words, ${SPEC.images[0]} to ${SPEC.images[1]} images.

Batch averages: **${avg('sections')} sections, ${avg('words')} words, ${avg('images')} images, ${avg('kb')} KB**.

| Prospect | Business | Sections | Words | Images | QA | Notes |
|---|---|---|---|---|---|---|
${results
  .map(
    (r) =>
      `| ${r.prospectId} | ${r.name || r.slug} | ${r.sections ?? '-'} | ${r.words ?? '-'} | ${r.images ?? '-'} | ${r.qa || (r.failures.length ? 'FAIL' : 'not run')} | ${[...r.warnings, ...r.failures].join('; ') || 'clean'} |`
  )
  .join('\n')}

## Blocked (${blocked.length})

${blocked.length ? blocked.map((r) => `- **${r.name || r.slug}**: ${r.failures.join('; ')}`).join('\n') : 'None. Every site passed.'}

## Duplicate imagery

${duplicates.length ? duplicates.map((list) => `- ${list.join(' = ')}`).join('\n') : 'No duplicate images across the batch.'}

## Outputs

- Review hub: \`index.html\` (the one link to send)
- QR sheet: \`manifest.csv\` (Zapier reads \`qr_target_url\`)
- Mail merge: \`prospects.csv\` (\`mail_ready\` gates the send)

## Next steps

1. Human taste pass on the hub. Anything dull or off-brand goes back for a design revision.
2. Deploy the batch, then confirm every preview loads and is still \`noindex\`.
3. Send the hub link plus a five-minute Loom to Mac and Melissa for approval.
4. On approval, push \`prospects.csv\` to the shared sheet and let the QR and mail zaps run.
5. Record scans, calls, and closes back into this note under Results.

## Results

_Fill in after the mail drop: pieces mailed, scans, calls booked, closes, revenue._
`;
fs.writeFileSync(path.join(batchDir, 'batch-report.md'), report);

console.log(`\n${built.length}/${results.length} ready | avg ${avg('sections')} sections, ${avg('words')} words, ${avg('images')} images`);
if (blocked.length) console.log(`Blocked: ${blocked.map((r) => r.slug).join(', ')}`);
console.log(`\nWrote:\n  ${path.join(batchDir, 'index.html')}\n  ${path.join(batchDir, 'manifest.csv')}\n  ${path.join(batchDir, 'prospects.csv')}\n  ${path.join(batchDir, 'batch-report.md')}`);
process.exitCode = blocked.length ? 1 : 0;
