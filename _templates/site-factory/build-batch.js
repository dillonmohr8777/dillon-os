#!/usr/bin/env node
/**
 * Weekly batch runner. Builds a whole outreach batch (target: 25 sites) and emits
 * everything the pipeline downstream needs — fail-closed on approval.
 *
 *   node _templates/site-factory/build-batch.js <batch-dir> [--allow-partial] [--skip-qa]
 *
 * --allow-partial   test/preview only: allow brief count != batch.targetCount
 * --skip-qa         skip visual QA (rows stay qa_ready=hold; not a production success)
 *
 * Generated prospects.csv ALWAYS sets mail_ready=hold. Only a later explicit human
 * approval may flip mail_ready. qa_ready reflects full QA + spec gates.
 *
 * Requireable: const { runBatch } = require('./build-batch.js')
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { buildSite } = require('./build-site.js');
const { runQa: defaultRunQa } = require('./qa.js');
const { SPEC, checkSpec } = require('./lib/spec.js');
const { assertSafeSlug } = require('./lib/validate.js');

const csvCell = (v) => {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const esc = (s) =>
  String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * @param {string} batchDir
 * @param {{ allowPartial?: boolean, skipQa?: boolean, quiet?: boolean, runQa?: Function }} [options]
 */
async function runBatch(batchDir, options = {}) {
  const allowPartial = !!options.allowPartial;
  const skipQa = !!options.skipQa;
  const runQa = options.runQa || defaultRunQa;
  const log = options.quiet ? () => {} : console.log.bind(console);

  if (!batchDir || !fs.existsSync(path.join(batchDir, 'batch.json'))) {
    throw new Error('Usage: node build-batch.js <batch-dir> [--allow-partial] [--skip-qa]   (batch-dir must contain batch.json)');
  }

  const batch = JSON.parse(fs.readFileSync(path.join(batchDir, 'batch.json'), 'utf8'));
  const briefsDir = path.join(batchDir, 'briefs');
  const briefFiles = fs.existsSync(briefsDir)
    ? fs.readdirSync(briefsDir).filter((f) => f.endsWith('.json')).sort()
    : [];
  if (!briefFiles.length) {
    throw new Error(`No briefs found in ${briefsDir}`);
  }

  const TARGET_COUNT = batch.targetCount ?? 25;
  const countMismatch = briefFiles.length !== TARGET_COUNT;
  const batchFailures = [];

  if (countMismatch && !allowPartial) {
    batchFailures.push(
      `brief count ${briefFiles.length} != targetCount ${TARGET_COUNT}; pass --allow-partial for test/preview only`
    );
  } else if (countMismatch && allowPartial) {
    log(`WARN: partial batch allowed (${briefFiles.length}/${TARGET_COUNT})`);
  }

  const sitesRoot = path.join(batchDir, 'sites');
  fs.mkdirSync(sitesRoot, { recursive: true });

  const results = [];
  const imageHashes = new Map();

  log(`Batch ${batch.id} | ${briefFiles.length} briefs | market: ${batch.market || 'n/a'}\n`);

  // Production mismatch: do not claim success. Still emit held rows for diagnosis.
  const forceHoldAll = countMismatch && !allowPartial;

  for (const [i, file] of briefFiles.entries()) {
    const briefPath = path.join(briefsDir, file);
    const row = {
      file,
      warnings: [],
      failures: [],
      qa: 'NOT_RUN',
      visualQa: 'skipped',
      qaReady: 'hold',
      mailReady: 'hold', // NEVER flipped by automation
      specFailures: [],
    };
    let brief;
    try {
      brief = JSON.parse(fs.readFileSync(briefPath, 'utf8'));
    } catch (err) {
      row.slug = file.replace(/\.json$/, '');
      row.failures.push(`brief does not parse: ${err.message}`);
      results.push(row);
      continue;
    }

    try {
      row.slug = assertSafeSlug(brief.slug);
    } catch (err) {
      row.slug = String(brief.slug || file.replace(/\.json$/, ''));
      row.failures.push(err.message);
      results.push(row);
      continue;
    }

    row.name = brief.name;
    row.vertical = brief.vertical || brief.category || '';
    row.market = brief.market || batch.market || '';
    row.address = brief.address || '';
    row.phone = brief.phone || '';
    row.sourceUrl = brief.url || '';
    row.prospectId =
      brief.prospectId || `${(batch.idPrefix || 'B').toUpperCase()}${String(i + 1).padStart(3, '0')}`;

    if (forceHoldAll) {
      row.failures.push(...batchFailures);
      row.warnings.push('batch held: targetCount mismatch without --allow-partial');
      results.push(row);
      continue;
    }

    try {
      const built = buildSite(brief, sitesRoot);
      row.sections = built.sections.length;
      row.words = built.words;
      row.images = built.images;
      row.kb = +(built.htmlBytes / 1024).toFixed(1);
      row.outDir = built.outDir;
      row.missingAssets = built.missingAssets;

      const specFails = checkSpec({
        sections: row.sections,
        words: row.words,
        images: row.images,
      });
      row.specFailures = specFails;
      if (specFails.length) row.failures.push(...specFails);

      if (built.missingAssets.length) {
        row.failures.push(`${built.missingAssets.length} missing asset file(s)`);
      }

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
      log(
        `[${i + 1}/${briefFiles.length}] ${brief.slug}: ${row.sections} sections, ${row.words} words, ${row.images} images, ${row.kb} KB`
      );
    } catch (err) {
      row.failures.push(`build failed: ${err.message}`);
      log(`[${i + 1}/${briefFiles.length}] ${brief.slug}: BUILD FAILED ${err.message}`);
    }
    results.push(row);
  }

  const duplicates = [...imageHashes.values()].filter((list) => list.length > 1);
  duplicates.forEach((list) => {
    list.forEach((key) => {
      const slug = key.split('/')[0];
      const row = results.find((r) => r.slug === slug);
      if (row) row.failures.push(`duplicate image shared across batch: ${key}`);
    });
  });

  // Per-site QA
  if (!forceHoldAll) {
    log('\nRunning QA...');
    for (const row of results) {
      if (!row.outDir || !fs.existsSync(row.outDir)) {
        row.qa = 'NOT_RUN';
        row.visualQa = 'skipped';
        continue;
      }
      try {
        const qaResult = await runQa(row.outDir, { skipVisual: skipQa });
        row.qa = qaResult.status;
        row.visualQa = qaResult.visualQa;
        row.qaWarnings = qaResult.warnings;
        row.qaFailures = qaResult.failures;
        if (!qaResult.fullQa) {
          if (qaResult.status === 'STATIC_ONLY' || qaResult.visualQa === 'skipped') {
            row.failures.push(`visual QA skipped (${qaResult.visualReason}); not a full QA pass`);
          }
          row.failures.push(...(qaResult.failures || []));
        }
      } catch (err) {
        row.qa = 'FAIL';
        row.visualQa = 'error';
        row.failures.push(`QA failed: ${err.message}`);
      }
      log(`  ${row.slug}: ${row.qa} (visual=${row.visualQa})`);
    }
  }

  // Gate qa_ready: full QA PASS + no failures + address present. mail_ready always hold.
  for (const row of results) {
    row.mailReady = 'hold';
    const eligible =
      !forceHoldAll &&
      row.qa === 'PASS' &&
      row.visualQa === 'ran' &&
      !row.failures.length &&
      !!row.address;
    row.qaReady = eligible ? 'ready' : 'hold';
  }

  const qaReadyCount = results.filter((r) => r.qaReady === 'ready').length;
  const blocked = results.filter((r) => r.qaReady !== 'ready');
  const deployBase = (batch.deployBaseUrl || '').replace(/\/$/, '');
  const utm = `utm_source=directmail&utm_medium=qr&utm_campaign=${encodeURIComponent(batch.id)}`;
  const targetUrl = (r) =>
    deployBase ? `${deployBase}/sites/${r.slug}/?${utm}&utm_content=${r.prospectId}` : '';

  const manifestHeader = [
    'prospect_id',
    'business',
    'market',
    'vertical',
    'slug',
    'site_url',
    'qr_target_url',
    'source_url',
    'qa',
    'visual_qa',
    'qa_ready',
    'mail_ready',
    'spec_sections',
    'spec_words',
    'spec_images',
  ];
  const manifestRows = results.map((r) =>
    [
      r.prospectId,
      r.name,
      r.market,
      r.vertical,
      r.slug,
      deployBase ? `${deployBase}/sites/${r.slug}/` : '',
      targetUrl(r),
      r.sourceUrl,
      r.qa,
      r.visualQa,
      r.qaReady,
      r.mailReady,
      r.sections ?? '',
      r.words ?? '',
      r.images ?? '',
    ]
      .map(csvCell)
      .join(',')
  );
  fs.writeFileSync(
    path.join(batchDir, 'manifest.csv'),
    [manifestHeader.join(','), ...manifestRows].join('\n') + '\n'
  );

  // mail_ready is ALWAYS hold in generated output. Human approval flips it later.
  const prospectHeader = [
    'prospect_id',
    'business',
    'address',
    'phone',
    'market',
    'vertical',
    'qr_target_url',
    'qa_ready',
    'mail_ready',
    'approved_by',
    'mailed_on',
    'scanned',
    'call_booked',
    'notes',
  ];
  const prospectRows = results.map((r) =>
    [
      r.prospectId,
      r.name,
      r.address,
      r.phone,
      r.market,
      r.vertical,
      targetUrl(r),
      r.qaReady,
      'hold',
      '',
      '',
      '',
      '',
      [...r.warnings, ...r.failures].join('; '),
    ]
      .map(csvCell)
      .join(',')
  );
  fs.writeFileSync(
    path.join(batchDir, 'prospects.csv'),
    [prospectHeader.join(','), ...prospectRows].join('\n') + '\n'
  );

  const verticals = [...new Set(results.map((r) => r.vertical).filter(Boolean))];
  const filterButtons = ['all', ...verticals]
    .map(
      (v, i) =>
        `<button data-filter="${esc(v)}"${i === 0 ? ' class="active"' : ''}>${esc(v === 'all' ? 'All' : v)}</button>`
    )
    .join('');
  const cards = results
    .map((r) => {
      const href = r.outDir ? `sites/${r.slug}/index.html` : '#';
      let status;
      if (r.qaReady === 'ready') status = '<span class="good">QA ready</span>';
      else if (r.failures.length) status = '<span class="bad">Held</span>';
      else status = '<span class="warn">Held</span>';
      return `<a class="card" data-kind="${esc(r.vertical)}" href="${esc(href)}"><span class="meta"><span>${esc(r.prospectId)}</span><span>${esc(r.vertical)}</span></span><h2>${esc(r.name || r.slug)}</h2><p>${esc(r.address || 'Address not verified')}</p><span class="row">${status}<span class="spec">${r.sections ?? '-'} sec / ${r.words ?? '-'} words · mail hold</span></span><span class="open">Open homepage</span></a>`;
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
.controls button{min-height:44px;padding:0 16px;border-radius:10px;border:1px solid var(--line);background:transparent;color:var(--ink);font:600 12px "IBM Plex Mono",monospace;letter-spacing:.04em;cursor:pointer}
.controls button.active{border-color:var(--accent);background:#b6f36d1a}
.controls input{flex:1;min-width:200px;min-height:44px;padding:0 14px;border-radius:10px;border:1px solid var(--line);background:transparent;color:var(--ink);font:14px "Space Grotesk",sans-serif}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px;padding:34px 0 90px}
.card{display:flex;flex-direction:column;gap:10px;padding:22px;border:1px solid var(--line);border-radius:16px;background:var(--card);text-decoration:none;color:inherit}
.card[hidden]{display:none}
.meta{display:flex;justify-content:space-between;gap:12px;font:600 11px "IBM Plex Mono",monospace;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)}
.card h2{margin:0;font-size:1.3rem;line-height:1.2}
.card p{margin:0;color:var(--muted);font-size:.9rem}
.row{display:flex;justify-content:space-between;gap:10px;align-items:center;font:600 11px "IBM Plex Mono",monospace;letter-spacing:.06em}
.good{color:var(--accent)}.warn{color:#f3d96d}.bad{color:#ff8080}
.spec{color:var(--muted)}
.open{margin-top:auto;padding-top:8px;font:600 11px "IBM Plex Mono",monospace;letter-spacing:.1em;text-transform:uppercase;color:var(--accent)}
footer{padding:40px 0 70px;border-top:1px solid var(--line);color:var(--muted);font-size:.85rem}
</style></head><body>
<div class="wrap"><header><span class="k">${esc(batch.market || 'Batch')} | Week of ${esc(batch.week || '')}</span><h1>${esc(batch.title || batch.id)}</h1><p>${esc(batch.note || 'Prebuilt prospect homepages for outreach review. mail_ready stays hold until explicit human approval.')}</p>
<div class="stats"><div><strong>${results.length}</strong><span>Prospects</span></div><div><strong>${qaReadyCount}</strong><span>QA ready</span></div><div><strong>${blocked.length}</strong><span>Held</span></div><div><strong>${TARGET_COUNT}</strong><span>Weekly target</span></div></div>
</header></div>
<div class="controls"><div class="wrap">${filterButtons}<input id="q" type="search" placeholder="Search business"></div></div>
<main class="wrap"><div class="grid">
${cards}
</div></main>
<div class="wrap"><footer>Private staging. Batch ${esc(batch.id)}. Generated mail_ready=hold on every row.</footer></div>
<script>
const cards=[...document.querySelectorAll('.card')],q=document.querySelector('#q');let kind='all';
function apply(){const s=q.value.toLowerCase().trim();cards.forEach(c=>{const name=c.querySelector('h2').textContent.toLowerCase();c.hidden=(kind!=='all'&&c.dataset.kind!==kind)||(s&&!name.includes(s))})}
document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{kind=b.dataset.filter;document.querySelectorAll('[data-filter]').forEach(x=>x.classList.toggle('active',x===b));apply()});
q.oninput=apply;
</script></body></html>`;
  fs.writeFileSync(path.join(batchDir, 'index.html'), hub);

  const builtForAvg = results.filter((r) => r.sections != null);
  const avg = (k) =>
    builtForAvg.length
      ? Math.round(builtForAvg.reduce((s, r) => s + (r[k] || 0), 0) / builtForAvg.length)
      : 0;

  const report = `---
tags: [campaign, batch, report]
campaign: "[[AI Site Builder Outreach Engine]]"
batch: ${batch.id}
market: ${batch.market || ''}
week: ${batch.week || ''}
generated: ${new Date().toISOString().slice(0, 10)}
mail_ready_default: hold
qa_ready_count: ${qaReadyCount}
---

# Batch Report: ${batch.id}

${qaReadyCount} of ${results.length} sites qa_ready. Weekly target is ${TARGET_COUNT}.
**mail_ready is hold on every generated row.** Only explicit human approval may flip it.

${batchFailures.length ? `## Batch gate failures\n\n${batchFailures.map((f) => `- ${f}`).join('\n')}\n` : ''}
## Spec compliance

Canonical targets: ${SPEC.sections[0]}-${SPEC.sections[1]} sections, ${SPEC.words[0]}-${SPEC.words[1]} words, ${SPEC.images[0]}-${SPEC.images[1]} images. Spec misses block \`qa_ready\`.

Batch averages: **${avg('sections')} sections, ${avg('words')} words, ${avg('images')} images, ${avg('kb')} KB**.

| Prospect | Business | Sections | Words | Images | QA | Visual | qa_ready | mail_ready | Notes |
|---|---|---|---|---|---|---|---|---|---|
${results
  .map(
    (r) =>
      `| ${r.prospectId} | ${r.name || r.slug} | ${r.sections ?? '-'} | ${r.words ?? '-'} | ${r.images ?? '-'} | ${r.qa} | ${r.visualQa} | ${r.qaReady} | hold | ${[...r.warnings, ...r.failures].join('; ') || 'clean'} |`
  )
  .join('\n')}

## Held (${blocked.length})

${blocked.length ? blocked.map((r) => `- **${r.name || r.slug}**: ${r.failures.join('; ') || 'held'}`).join('\n') : 'None.'}

## Duplicate imagery

${duplicates.length ? duplicates.map((list) => `- ${list.join(' = ')}`).join('\n') : 'No duplicate images across the batch.'}

## Outputs

- Review hub: \`index.html\`
- QR sheet: \`manifest.csv\`
- Mail merge: \`prospects.csv\` (\`qa_ready\` for review; \`mail_ready\` always hold until human approval)

## Next steps

1. Human taste pass on the hub.
2. Explicit human approval flips \`mail_ready\` to ready on approved rows only.
3. Deploy stays Tier 2. No outreach send from this runner.
`;
  fs.writeFileSync(path.join(batchDir, 'batch-report.md'), report);

  // Machine-readable summary for orchestrator / tests
  const summary = {
    batchId: batch.id,
    targetCount: TARGET_COUNT,
    briefCount: briefFiles.length,
    allowPartial,
    skipQa,
    forceHoldAll,
    batchFailures,
    qaReadyCount,
    mailReadyAlwaysHold: true,
    results: results.map((r) => ({
      slug: r.slug,
      prospectId: r.prospectId,
      qa: r.qa,
      visualQa: r.visualQa,
      qaReady: r.qaReady,
      mailReady: r.mailReady,
      sections: r.sections,
      words: r.words,
      images: r.images,
      failures: r.failures,
      warnings: r.warnings,
    })),
    ok: !forceHoldAll && blocked.length === 0 && qaReadyCount === results.length,
  };
  fs.writeFileSync(path.join(batchDir, 'batch-summary.json'), JSON.stringify(summary, null, 2));

  log(
    `\n${qaReadyCount}/${results.length} qa_ready | mail_ready=hold on all | avg ${avg('sections')} sections, ${avg('words')} words, ${avg('images')} images`
  );
  if (forceHoldAll) log(`BATCH HELD: ${batchFailures.join('; ')}`);
  if (blocked.length) log(`Held: ${blocked.map((r) => r.slug).join(', ')}`);
  log(
    `\nWrote:\n  ${path.join(batchDir, 'index.html')}\n  ${path.join(batchDir, 'manifest.csv')}\n  ${path.join(batchDir, 'prospects.csv')}\n  ${path.join(batchDir, 'batch-report.md')}\n  ${path.join(batchDir, 'batch-summary.json')}`
  );

  return summary;
}

module.exports = { runBatch, SPEC };

if (require.main === module) {
  const batchDir = process.argv[2];
  const allowPartial = process.argv.includes('--allow-partial');
  const skipQa = process.argv.includes('--skip-qa');
  runBatch(batchDir, { allowPartial, skipQa })
    .then((summary) => {
      process.exitCode = summary.ok ? 0 : 1;
    })
    .catch((err) => {
      console.error(err.message || err);
      process.exit(1);
    });
}
