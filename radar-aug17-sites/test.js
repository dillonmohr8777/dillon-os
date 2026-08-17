#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { sites, ROOT } = require('./build.js');

assert.strictEqual(sites.length, 22, '22 sites, Casselle omitted');
assert.ok(!sites.some((s) => /casselle/i.test(s.slug + s.name)), 'Casselle must stay out');

for (const site of sites) {
  const htmlPath = path.join(ROOT, site.slug, 'index.html');
  assert.ok(fs.existsSync(htmlPath), `${site.slug} html`);
  const html = fs.readFileSync(htmlPath, 'utf8');
  assert.ok(html.includes('noindex,nofollow'), `${site.slug} noindex`);
  assert.ok(html.includes('application/ld+json'), `${site.slug} jsonld`);
  assert.ok((site.buzz || '').trim().split(/\s+/).length === 2, `${site.slug} buzz is two words`);
  assert.strictEqual(site.slots.length, 3, `${site.slug} has 3 slots`);
  for (const slot of site.slots) {
    assert.ok(html.includes('data-prompt='), `${site.slug} keeps prompts`);
    const webp = path.join(ROOT, site.slug, `assets/image-${slot.n}.webp`);
    if (fs.existsSync(webp)) {
      assert.ok(html.includes(`assets/image-${slot.n}.webp`), `${site.slug} wires image ${slot.n}`);
      assert.ok(!html.includes(`SLOT ${String(slot.n).padStart(2, '0')} · waiting`), `${site.slug} slot ${slot.n} not placeholder`);
      const img = html.match(new RegExp(`<img src="assets/image-${slot.n}\\.webp"[^>]*>`));
      assert.ok(img && /alt="[^"]+"/.test(img[0]), `${site.slug} image ${slot.n} has alt`);
    }
  }
}

const hub = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
assert.ok(hub.includes('Casselle blocked') || hub.includes('Casselle is omitted'), 'hub names the block');

const wired = sites.reduce((n, s) => n + s.slots.filter((slot) => fs.existsSync(path.join(ROOT, s.slug, `assets/image-${slot.n}.webp`))).length, 0);
console.log(`ok · ${sites.length} sites · ${wired}/66 plates wired`);
if (process.argv.includes('--require-images')) {
  assert.strictEqual(wired, 66, 'all 66 plates present');
}
