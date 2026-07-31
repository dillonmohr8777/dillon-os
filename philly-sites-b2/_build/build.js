const fs = require('fs');
const path = require('path');
const K = require('./kernel');
const { sites } = require('./data');

const ROOT = path.join(__dirname, '..');
const ARCH = {};
for (const f of fs.readdirSync(path.join(__dirname, 'arch')).sort()) {
  Object.assign(ARCH, require(path.join(__dirname, 'arch', f)));
}

const only = process.argv.slice(2).filter(a => !a.startsWith('-'));
let built = 0, skipped = 0;
const report = [];

for (const site of sites) {
  if (only.length && !only.includes(site.slug) && !only.includes(site.archetype)) continue;
  const make = ARCH[site.archetype];
  if (!make) { skipped++; report.push([site.slug, site.archetype, 'MISSING ARCHETYPE', 0]); continue; }
  const spec = make(site);
  const html = K.page({ site, ...spec });
  const out = path.join(ROOT, site.slug, 'index.html');
  fs.writeFileSync(out, html);
  built++;
  report.push([site.slug, site.archetype, 'ok', Buffer.byteLength(html)]);
}

const w = Math.max(...report.map(r => r[0].length));
for (const r of report) console.log(r[0].padEnd(w), r[1].padEnd(18), r[2].padEnd(20), (r[3] / 1024).toFixed(1) + 'kb');
console.log(`\nbuilt ${built}, missing ${skipped}, total ${sites.length}`);
