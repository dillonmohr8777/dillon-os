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
if (!base || !batch || !output || !fs.existsSync(path.join(base, 'index.html')) || !fs.existsSync(path.join(batch, 'FINAL-AUDIT.json'))) {
  throw new Error('Usage: compose-netlify-release.js --base=<exact current production snapshot> --batch=<verified batch> --output=<new directory>');
}
if (fs.existsSync(output)) throw new Error(`Refusing to overwrite existing output: ${output}`);

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const hash = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const esc = (value) => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const audit = readJson(path.join(batch, 'FINAL-AUDIT.json'));
const summary = readJson(path.join(batch, 'batch-summary.json'));
if (audit.status !== 'PASS' || audit.failures.length || !summary.ok || summary.qaReadyCount !== 20) {
  throw new Error('The new batch is not a complete audited 20/20 release.');
}

const baseHtml = fs.readFileSync(path.join(base, 'index.html'), 'utf8');
const existingLinks = [...baseHtml.matchAll(/href="\/sites\/([^/"]+)\/"/g)].map((match) => match[1]);
const existingRoutes = fs.readdirSync(path.join(base, 'sites'), { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name);
const records = summary.results.map((result, index) => {
  const brief = readJson(path.join(batch, 'briefs', `${result.slug}.json`));
  return { ...result, order: existingLinks.length + index + 1, name: brief.name, address: brief.address, category: brief.category };
});
const collisions = records.filter((record) => existingRoutes.includes(record.slug) || existingLinks.includes(record.slug));
if (existingLinks.length < 1 || records.length !== 20 || collisions.length) {
  throw new Error(`Route gate failed: indexed=${existingLinks.length}, new=${records.length}, collisions=${collisions.map((item) => item.slug).join(',') || 'none'}`);
}

fs.cpSync(base, output, { recursive: true, errorOnExist: true });
for (const record of records) {
  fs.cpSync(path.join(batch, 'sites', record.slug), path.join(output, 'sites', record.slug), { recursive: true, errorOnExist: true });
}
const cards = records.map((record) => `<a class="build" href="/sites/${esc(record.slug)}/" data-search="${esc(`${record.name} ${record.slug} ${record.address} ${record.category} radar-next20-${audit.runId}`.toLowerCase())}">
  <span>${String(record.order).padStart(3, '0')}</span>
  <strong>${esc(record.name)}</strong>
  <small>${esc(record.address)} · ${esc(record.category)}</small>
  <em>Call ready · six-viewport QA passed</em>
</a>`).join('\n');

const finalIndexedBusinesses = existingLinks.length + records.length;
const finalRouteDirectories = existingRoutes.length + records.length;
let html = baseHtml
  .replace(/\d+ Call Ready Businesses/g, `${finalIndexedBusinesses} Call Ready Businesses`)
  .replace(/<strong>\d+<\/strong> callable businesses/, `<strong>${finalIndexedBusinesses}</strong> callable businesses`)
  .replace(/<strong>\d+<\/strong> total routes/, `<strong>${finalRouteDirectories}</strong> total routes`)
  .replace(/<span id="visible">\d+<\/span> visible/, `<span id="visible">${finalIndexedBusinesses}</span> visible`)
  .replace('</div></main>', `${cards}\n</div></main>`);
if ((html.match(/href="\/sites\//g) || []).length !== finalIndexedBusinesses || html === baseHtml) {
  throw new Error(`Hub transformation did not produce exactly ${finalIndexedBusinesses} indexed site links.`);
}
fs.writeFileSync(path.join(output, 'index.html'), html, 'utf8');

const finalRoutes = fs.readdirSync(path.join(output, 'sites'), { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name);
const manifest = {
  schema: 1,
  composedAt: new Date().toISOString(),
  targetSite: { name: 'momentum-prospect-radar-next20-2026-08-11', id: '3cf338d4-6813-4712-a6dc-d27e8778cae9' },
  base: { indexedBusinesses: existingLinks.length, routeDirectories: existingRoutes.length, indexSha256: hash(path.join(base, 'index.html')) },
  addition: { batch: path.basename(batch), businesses: records.length, slugs: records.map((item) => item.slug), finalAudit: audit.status },
  release: {
    indexedBusinesses: finalIndexedBusinesses,
    routeDirectories: finalRoutes.length,
    indexSha256: hash(path.join(output, 'index.html')),
    noindexHeader: fs.readFileSync(path.join(output, '_headers'), 'utf8').includes('X-Robots-Tag: noindex'),
    mailReady: 'hold',
  },
};
fs.writeFileSync(path.join(output, 'RELEASE-MANIFEST.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
console.log(JSON.stringify(manifest, null, 2));
