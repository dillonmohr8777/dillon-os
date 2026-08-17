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
  assert.ok(!html.includes('class="img-slot"'), `${site.slug} has no placeholder slot`);
  assert.ok(!html.includes('waiting on generated'), `${site.slug} has no waiting caption`);
  for (const slot of site.slots) {
    assert.ok(html.includes('data-prompt='), `${site.slug} keeps prompts`);
    const webp = path.join(ROOT, site.slug, `assets/image-${slot.n}.webp`);
    assert.ok(fs.existsSync(webp), `${site.slug} image ${slot.n} exists`);
    assert.ok(html.includes(`assets/image-${slot.n}.webp`), `${site.slug} wires image ${slot.n}`);
    const img = html.match(new RegExp(`<img src="assets/image-${slot.n}\\.webp"[^>]*>`));
    assert.ok(img && /alt="[^"]+"/.test(img[0]), `${site.slug} image ${slot.n} has alt`);
  }
}

const hub = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
assert.ok(hub.includes('Casselle blocked') || hub.includes('Casselle is omitted'), 'hub names the block');
assert.ok(hub.includes('3/3 plates'), 'hub shows all plates filled');

const wired = sites.reduce((n, s) => n + s.slots.filter((slot) => fs.existsSync(path.join(ROOT, s.slug, `assets/image-${slot.n}.webp`))).length, 0);
assert.strictEqual(wired, 66, 'all 66 plates present');
console.log(`ok · ${sites.length} sites · ${wired}/66 plates wired`);
