#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const test = require('node:test');

const script = path.join(__dirname, 'compose-netlify-release.js');

test('composes twenty routes onto a dynamically sized production hub', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'radar-compose-'));
  const base = path.join(root, 'base');
  const batch = path.join(root, 'batch');
  const output = path.join(root, 'output');
  fs.mkdirSync(path.join(base, 'sites'), { recursive: true });
  fs.mkdirSync(path.join(batch, 'briefs'), { recursive: true });
  fs.mkdirSync(path.join(batch, 'sites'), { recursive: true });

  const indexed = 262;
  const routeDirectories = 271;
  const links = Array.from({ length: indexed }, (_, index) => `<a href="/sites/existing-${index + 1}/">Existing</a>`).join('');
  fs.writeFileSync(path.join(base, 'index.html'), `<!doctype html><title>${indexed} Call Ready Businesses</title><strong>${indexed}</strong> callable businesses<strong>${routeDirectories}</strong> total routes<span id="visible">${indexed}</span> visible<main><div>${links}</div></main>`);
  fs.writeFileSync(path.join(base, '_headers'), '/*\n  X-Robots-Tag: noindex\n');
  for (let index = 0; index < routeDirectories; index += 1) {
    fs.mkdirSync(path.join(base, 'sites', `existing-${index + 1}`), { recursive: true });
  }

  const results = Array.from({ length: 20 }, (_, index) => ({ slug: `new-${index + 1}`, qaReady: 'ready' }));
  fs.writeFileSync(path.join(batch, 'FINAL-AUDIT.json'), JSON.stringify({ status: 'PASS', failures: [], runId: '20260826-052000' }));
  fs.writeFileSync(path.join(batch, 'batch-summary.json'), JSON.stringify({ ok: true, qaReadyCount: 20, results }));
  results.forEach((result, index) => {
    fs.writeFileSync(path.join(batch, 'briefs', `${result.slug}.json`), JSON.stringify({
      name: `New Business ${index + 1}`,
      address: 'Pennsylvania',
      category: 'Test',
    }));
    const site = path.join(batch, 'sites', result.slug);
    fs.mkdirSync(site, { recursive: true });
    fs.writeFileSync(path.join(site, 'index.html'), '<!doctype html><meta name="robots" content="noindex,nofollow">');
  });

  const execution = spawnSync(process.execPath, [script, `--base=${base}`, `--batch=${batch}`, `--output=${output}`], { encoding: 'utf8' });
  assert.equal(execution.status, 0, execution.stderr);
  const html = fs.readFileSync(path.join(output, 'index.html'), 'utf8');
  const manifest = JSON.parse(fs.readFileSync(path.join(output, 'RELEASE-MANIFEST.json'), 'utf8'));
  assert.equal((html.match(/href="\/sites\//g) || []).length, 282);
  assert.match(html, /282 Call Ready Businesses/);
  assert.match(html, /<strong>282<\/strong> callable businesses/);
  assert.match(html, /<strong>291<\/strong> total routes/);
  assert.match(html, /<span id="visible">282<\/span> visible/);
  assert.equal(manifest.base.indexedBusinesses, 262);
  assert.equal(manifest.release.indexedBusinesses, 282);
  assert.equal(manifest.release.routeDirectories, 291);
  assert.equal(manifest.release.noindexHeader, true);
});
