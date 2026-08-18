#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const firstBatch = path.join(root, '02_Campaigns', 'AI Site Builder Outreach Engine', 'batches', 'radar-next15-2026-08-08');
const secondBatch = path.join(root, '02_Campaigns', 'AI Site Builder Outreach Engine', 'batches', 'radar-next15-20260808-232850');
const output = path.join(root, '02_Campaigns', 'AI Site Builder Outreach Engine', 'batches', 'radar-next30-2026-08-09');

const esc = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const category = (vertical) => {
  const v = String(vertical || '').toLowerCase();
  if (/dent|veter|pharma|medical|orthodont/.test(v)) return 'Medical';
  if (/food|restaurant|pub|bakery|cafe|bar/.test(v)) return 'Food';
  if (/auto|transport|car/.test(v)) return 'Automotive';
  if (/beauty|wellness|massage|hair|spa|skin|nail/.test(v)) return 'Wellness';
  if (/industrial|manufact|supply|mason|electric|plumb/.test(v)) return 'Industrial';
  if (/insurance|tax|legal|jewel|professional/.test(v)) return 'Professional Services';
  return 'Home Services';
};

function collect(batchDir, sourceLabel) {
  const summary = readJson(path.join(batchDir, 'batch-summary.json'));
  const briefsDir = path.join(batchDir, 'briefs');
  const targetsPath = path.join(batchDir, 'targets.json');
  const targets = fs.existsSync(targetsPath) ? readJson(targetsPath) : [];
  const targetBySlug = new Map(targets.map((target) => [target.slug, target]));
  return summary.results.map((result, index) => {
    const briefPath = path.join(briefsDir, `${result.slug}.json`);
    const brief = fs.existsSync(briefPath) ? readJson(briefPath) : {};
    const target = targetBySlug.get(result.slug) || {};
    const name = brief.name || target.businessName || target.radarName || result.slug;
    const vertical = brief.vertical || target.vertical || target.category || '';
    const address = brief.address || target.address || '';
    return {
      rank: index + 1,
      source: sourceLabel,
      slug: result.slug,
      prospectId: result.prospectId || `${sourceLabel}-${String(index + 1).padStart(3, '0')}`,
      name,
      vertical,
      kind: category(vertical),
      address: address || 'Address not verified',
      qaReady: result.qaReady === 'ready' ? 'QA ready' : 'Held',
      qaClass: result.qaReady === 'ready' ? 'good' : 'warn',
      sections: result.sections || 0,
      words: result.words || 0,
    };
  });
}

function copySites(batchDir, records) {
  const sourceRoot = path.join(batchDir, 'sites');
  const destRoot = path.join(output, 'sites');
  fs.mkdirSync(destRoot, { recursive: true });
  for (const record of records) {
    fs.cpSync(path.join(sourceRoot, record.slug), path.join(destRoot, record.slug), { recursive: true });
  }
}

function main() {
  fs.rmSync(output, { recursive: true, force: true });
  fs.mkdirSync(output, { recursive: true });
  const records = [
    ...collect(firstBatch, 'RADAR-NEXT15-A'),
    ...collect(secondBatch, 'RADAR-NEXT15-B'),
  ];
  copySites(firstBatch, records.slice(0, 15));
  copySites(secondBatch, records.slice(15));

  const sourceIndex = fs.readFileSync(path.join(firstBatch, 'index.html'), 'utf8');
  const style = sourceIndex.match(/<style>[\s\S]*?<\/style>/i)?.[0] || '';
  const kinds = [...new Set(records.map((record) => record.kind))];
  const buttons = ['All', ...kinds].map((kind, index) =>
    `<button data-filter="${esc(kind)}"${index === 0 ? ' class="active"' : ''}>${esc(kind)}</button>`
  ).join('');
  const cards = records.map((record) => `<a class="card" data-kind="${esc(record.kind)}" href="sites/${esc(record.slug)}/index.html"><span class="meta"><span>${esc(record.prospectId)}</span><span>${esc(record.kind)}</span></span><h2>${esc(record.name)}</h2><p>${esc(record.address)}</p><span class="row"><span class="${record.qaClass}">${esc(record.qaReady)}</span><span class="spec">${record.sections} sections / ${record.words} words · mail hold</span></span><span class="open">Open homepage</span></a>`).join('\n');
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow,noarchive"><title>Prospect Radar next 30 | Batch Review</title>${style}</head><body>
<div class="wrap"><header><span class="k">Philadelphia metro | Prospect Radar</span><h1>Prospect Radar next 30</h1><p>Two adjacent private concept batches in one review hub. mail_ready stays hold until explicit human approval.</p>
<div class="stats"><div><strong>30</strong><span>Prospects</span></div><div><strong>${records.filter((record) => record.qaReady === 'QA ready').length}</strong><span>QA ready</span></div><div><strong>${records.filter((record) => record.qaReady !== 'QA ready').length}</strong><span>QA held</span></div><div><strong>30</strong><span>Weekly target</span></div></div>
</header></div>
<div class="controls"><div class="wrap">${buttons}<input id="q" type="search" placeholder="Search business"></div></div>
<main class="wrap"><div class="grid">${cards}</div></main>
<div class="wrap"><footer>Private staging. Combined batches radar-next15-2026-08-08 and radar-next15-20260808-232850. Generated mail_ready=hold on every row.</footer></div>
<script>const cards=[...document.querySelectorAll('.card')],q=document.querySelector('#q');let kind='All';function apply(){const s=q.value.toLowerCase().trim();cards.forEach(c=>{const name=c.querySelector('h2').textContent.toLowerCase();c.hidden=(kind!=='All'&&c.dataset.kind!==kind)||(s&&!name.includes(s))})}document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{kind=b.dataset.filter;document.querySelectorAll('[data-filter]').forEach(x=>x.classList.toggle('active',x===b));apply()});q.oninput=apply;</script></body></html>`;
  fs.writeFileSync(path.join(output, 'index.html'), html, 'utf8');
  fs.writeFileSync(path.join(output, 'COMPOSITION.json'), JSON.stringify({
    batch: 'radar-next30-2026-08-09',
    sourceBatches: [path.basename(firstBatch), path.basename(secondBatch)],
    targetCount: records.length,
    qaReadyCount: records.filter((record) => record.qaReady === 'QA ready').length,
    mailReady: 'hold',
    records,
  }, null, 2) + '\n', 'utf8');
  console.log(JSON.stringify({ output, targetCount: records.length, hubLinks: records.length }));
}

main();
