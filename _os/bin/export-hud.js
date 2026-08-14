#!/usr/bin/env node
'use strict';

/**
 * Build a read-only phone snapshot of D.I.L.L.O.N. OS.
 *
 *   node _os/bin/export-hud.js
 *
 * Writes `_os/hud-dist/`. That folder is gitignored. Publish it with
 * `node _os/bin/hud-deploy.js` so the HUD is a URL on a phone, not a
 * localhost tab that dies when the laptop sleeps.
 *
 * Command Deck is stripped: the hosted view cannot launch skills.
 */

const fs = require('node:fs');
const path = require('node:path');
const { buildState } = require('../vault-state');
const { writeIcons } = require('../hud-icons');
const { scanText } = require('../public-safety');

const ROOT = path.resolve(__dirname, '..', '..');
const PUBLIC = path.join(ROOT, '_os', 'public');
const OUT = path.join(ROOT, '_os', 'hud-dist');
const SITE = 'https://dillon-os-hud.netlify.app';

function copy(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

function main() {
  const generated = new Date().toISOString();
  const state = buildState(ROOT);
  state.mode = 'readonly';
  state.jobs = [];
  state.generated = generated;
  state.phoneUrl = SITE;

  const json = JSON.stringify(state);
  const hits = scanText(json);
  if (hits.length) {
    const summary = hits.map((h) => `${h.id}x${h.count}`).join(', ');
    throw new Error(`refusing to export HUD state: public-safety ${summary}`);
  }

  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });
  writeIcons(path.join(OUT, 'icons'), fs, path);
  writeIcons(path.join(PUBLIC, 'icons'), fs, path);

  let html = fs.readFileSync(path.join(PUBLIC, 'index.html'), 'utf8');
  const boot = `<script>window.__HUD__={mode:"readonly",stateUrl:"./state.json",generated:${JSON.stringify(generated)},phoneUrl:${JSON.stringify(SITE)}};</script>\n`;
  html = html.replace('<script>', `${boot}<script>`);
  if (!html.includes('window.__HUD__')) throw new Error('failed to inject readonly HUD bootstrap');
  if (!/noindex/i.test(html)) throw new Error('HUD HTML is missing noindex');

  fs.writeFileSync(path.join(OUT, 'index.html'), html);
  fs.writeFileSync(path.join(OUT, 'state.json'), json);
  copy(path.join(PUBLIC, 'manifest.webmanifest'), path.join(OUT, 'manifest.webmanifest'));
  copy(path.join(PUBLIC, 'sw.js'), path.join(OUT, 'sw.js'));
  fs.writeFileSync(path.join(OUT, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
  fs.writeFileSync(
    path.join(OUT, '_headers'),
    '/*\n  X-Robots-Tag: noindex, nofollow\n  Cache-Control: no-cache\n',
  );

  const summary = {
    out: path.relative(ROOT, OUT),
    generated,
    notes: state.vitals.notes,
    jesse238: state.outreach && state.outreach.jesse238,
    url: SITE,
  };
  console.log(`HUD snapshot → ${summary.out}`);
  console.log(`notes ${summary.notes} · jesse-238 ${summary.jesse238} · ${generated}`);
  console.log(`phone URL (after deploy): ${SITE}`);
  return summary;
}

if (require.main === module) {
  try { main(); }
  catch (err) {
    console.error(String(err.message || err));
    process.exit(1);
  }
}

module.exports = { main, OUT, SITE };
