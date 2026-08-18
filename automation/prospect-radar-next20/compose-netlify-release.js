#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const args = Object.fromEntries(process.argv.slice(2).map((arg) => {
  const split = arg.indexOf('=');
  return split === -1 ? [arg, true] : [arg.slice(0, split), arg.slice(split + 1)];
}));

const base = path.resolve(String(args['--base'] || ''));
const batch = path.resolve(String(args['--batch'] || ''));
const output = path.resolve(String(args['--output'] || ''));
const required = [
  path.join(base, 'index.html'),
  path.join(base, '_headers'),
  path.join(base, 'sites'),
  path.join(batch, 'FINAL-AUDIT.json'),
  path.join(batch, 'batch-summary.json'),
  path.join(batch, 'briefs'),
  path.join(batch, 'sites'),
];

if (!base || !batch || !output || required.some((item) => !fs.existsSync(item))) {
  throw new Error('Usage: compose-netlify-release.js --base=<current production snapshot> --batch=<verified next20 batch> --output=<new empty release directory>');
}
if (fs.existsSync(output)) throw new Error(`Refusing to overwrite existing output: ${output}`);

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const esc = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');
const hash = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

const category = (vertical) => {
  const value = String(vertical || '').toLowerCase();
  if (/dent|veter|pharma|medical|orthodont/.test(value)) return 'Medical';
  if (/food|restaurant|pub|bakery|cafe|bar/.test(value)) return 'Food';
  if (/auto|transport|car/.test(value)) return 'Automotive';
  if (/beauty|wellness|massage|hair|spa|skin|nail/.test(value)) return 'Wellness';
  if (/industrial|manufact|supply|mason|electric|plumb/.test(value)) return 'Industrial';
  if (/insurance|tax|legal|lawyer|consult|professional/.test(value)) return 'Professional Services';
  return 'Home Services';
};

const audit = readJson(path.join(batch, 'FINAL-AUDIT.json'));
const summary = readJson(path.join(batch, 'batch-summary.json'));
if (audit.status !== 'PASS' || audit.failures.length !== 0 || summary.ok !== true || summary.qaReadyCount !== 20) {
  throw new Error('The new batch is not a complete 20/20 audited release.');
}

const oldSlugs = fs.readdirSync(path.join(base, 'sites'), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();
const newRecords = summary.results.map((result) => {
  const brief = readJson(path.join(batch, 'briefs', `${result.slug}.json`));
  return {
    slug: result.slug,
    prospectId: result.prospectId,
    name: brief.name,
    address: brief.address,
    kind: category(brief.vertical || brief.category),
    sections: result.sections,
    words: result.words,
  };
});
const newSlugs = newRecords.map((record) => record.slug).sort();
const collisions = newSlugs.filter((slug) => oldSlugs.includes(slug));
if (oldSlugs.length !== 30 || newSlugs.length !== 20 || collisions.length) {
  throw new Error(`Route gate failed: old=${oldSlugs.length}, new=${newSlugs.length}, collisions=${collisions.join(',') || 'none'}`);
}

fs.cpSync(base, output, { recursive: true, errorOnExist: true });
const headersPath = path.join(output, '_headers');
let headers = fs.readFileSync(headersPath, 'utf8');
headers = headers.replace(
  "script-src 'self'; style-src 'self';",
  "script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
);
if (!headers.includes("script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';")) {
  throw new Error('Release CSP does not permit the existing static pages to load their embedded CSS and JavaScript.');
}
fs.writeFileSync(headersPath, headers, 'utf8');
for (const record of newRecords) {
  fs.cpSync(
    path.join(batch, 'sites', record.slug),
    path.join(output, 'sites', record.slug),
    { recursive: true, errorOnExist: true }
  );
}

const cards = newRecords.map((record) =>
  `<a class="card" data-kind="${esc(record.kind)}" href="/sites/${esc(record.slug)}/"><span class="meta"><span>${esc(record.prospectId)}</span><span>${esc(record.kind)}</span></span><h2>${esc(record.name)}</h2><p>${esc(record.address)}</p><span class="row"><span class="good">QA ready</span><span class="spec">${record.sections} sections • ${record.words} words • mail hold</span></span><span class="open">Open homepage</span></a>`
).join('\n');

const indexPath = path.join(output, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');
const before = html;
html = html
  .replaceAll('Prospect Radar next 30', 'Prospect Radar next 50')
  .replace('Philadelphia metro | Prospect Radar', 'Pennsylvania | Prospect Radar')
  .replace('Thirty source-checked private concepts in one review hub. Build QA is complete; mail_ready stays hold until explicit human approval.', 'Fifty source-checked private concepts in one review hub. Build QA is complete; mail_ready stays hold until explicit human approval.')
  .replace('<div class="stats"><div><strong>30</strong><span>Prospects</span></div><div><strong>30</strong><span>QA ready</span></div><div><strong>0</strong><span>QA held</span></div><div><strong>30</strong><span>Weekly target</span></div></div>', '<div class="stats"><div><strong>50</strong><span>Prospects</span></div><div><strong>50</strong><span>QA ready</span></div><div><strong>0</strong><span>QA held</span></div><div><strong>20</strong><span>Daily target</span></div></div>')
  .replace(/<a class="scroll-lab-banner"[\s\S]*?<\/a>/, '')
  .replace('</div></main>', `${cards}\n</div></main>`)
  .replace('Private staging. Address and media QA reviewed August 9, 2026. mail_ready=hold remains on every row pending explicit human approval.', 'Private staging. Fifty source-checked concepts. mail_ready=hold remains on every row pending explicit human approval.')
  .replaceAll('Â·', '•')
  .replace('<!-- Scroll Lab overlay: baseline 165; builds 166-168 -->', '');
if (html === before || (html.match(/class=['"]card['"]/g) || []).length !== 50 || /<a class="scroll-lab-banner"/.test(html)) {
  throw new Error('Hub transformation did not produce the expected 50-card non-lab index.');
}
fs.writeFileSync(indexPath, html, 'utf8');

const allSlugs = fs.readdirSync(path.join(output, 'sites'), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();
const files = [];
const walk = (directory) => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(file);
    else files.push(file);
  }
};
walk(output);

const manifest = {
  composedAt: new Date().toISOString(),
  targetSite: {
    name: 'momentum-prospect-radar-next10-2026-08-08',
    id: '4c6ea488-5a2f-4bc7-ba54-7d3456784487',
  },
  base: {
    directory: base,
    routes: oldSlugs.length,
    indexSha256: hash(path.join(base, 'index.html')),
    preservedLabRoute: fs.existsSync(path.join(output, 'labs', 'prospect-3d-scroll-trio', 'index.html')),
  },
  addition: {
    batch: path.basename(batch),
    routes: newSlugs.length,
    finalAuditStatus: audit.status,
    slugs: newSlugs,
  },
  release: {
    directory: output,
    routes: allSlugs.length,
    contentFileCount: files.length,
    contentBytes: files.reduce((total, file) => total + fs.statSync(file).size, 0),
    indexSha256: hash(indexPath),
    noindexHeader: fs.readFileSync(path.join(output, '_headers'), 'utf8').includes('X-Robots-Tag: noindex'),
    inlineStaticAssetsAllowed: fs.readFileSync(path.join(output, '_headers'), 'utf8').includes("script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"),
    rootFeaturesScrollLab: false,
    mailReady: 'hold',
  },
};
fs.writeFileSync(path.join(output, 'RELEASE-MANIFEST.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
console.log(JSON.stringify(manifest, null, 2));
