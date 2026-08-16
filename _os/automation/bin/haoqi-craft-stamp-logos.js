#!/usr/bin/env node
'use strict';

/**
 * Cut new exact logos and stamp every honest mark onto generated atmosphere.
 * Never invent a mark. Type stays when no real logo exists.
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { repoPath } = require('../lib/fsutil');
const { writeLogo } = require('./haoqi-craft-batch');
const { KEEP, GEN_MAP } = require('./haoqi-craft-attach-gen');

const ROOT = repoPath('haoqi-radar-sites');
const GEN = '/opt/cursor/artifacts/assets';
const LOGO_PY = repoPath('_os/automation/lib/haoqi-logo.py');
const STAMP_PY = repoPath('_os/automation/lib/haoqi-stamp-logo.py');

const NEW_LOGOS = [
  ['j-pro', '/tmp/haoqi-logo-hunt/jpro.png'],
  ['weathers-motors-and-auto-sales', '/tmp/haoqi-logo-hunt/weathers-logo.jpg'],
  ['wynnewood-eyecare', '/tmp/haoqi-logo-hunt/wynnewood.png'],
];

function runPy(args) {
  const run = spawnSync('python3', args, { encoding: 'utf8' });
  if (run.status !== 0) {
    throw new Error((run.stderr || run.stdout || 'python fail').trim());
  }
  return (run.stdout || '').trim();
}

function svgToPng(svgPath, destPng) {
  const html = `<!doctype html><meta charset="utf-8"><style>
html,body{margin:0;background:#fff} img{display:block;width:680px;height:auto}
</style><img src="${path.basename(svgPath)}">`;
  const dir = path.dirname(svgPath);
  const htmlPath = path.join(dir, '_stamp.html');
  fs.writeFileSync(htmlPath, html);
  const shot = destPng.replace(/\.png$/, '.chrome.png');
  const chrome = spawnSync(
    'google-chrome-stable',
    [
      '--headless=new',
      '--no-sandbox',
      '--disable-gpu',
      '--hide-scrollbars',
      `--window-size=700,360`,
      `--screenshot=${shot}`,
      `file://${htmlPath}`,
    ],
    { encoding: 'utf8' },
  );
  try {
    fs.unlinkSync(htmlPath);
  } catch {
    /* keep */
  }
  if (chrome.status !== 0 || !fs.existsSync(shot)) {
    throw new Error(chrome.stderr || 'chrome svg render failed');
  }
  return runPy([LOGO_PY, shot, destPng]);
}

function extractEmbeddedPng(svgPath, destPng) {
  const svg = fs.readFileSync(svgPath, 'utf8');
  const m = svg.match(/xlink:href="data:image\/png;base64,([^"]+)"/);
  if (!m) return '';
  const tmp = `${destPng}.src`;
  fs.writeFileSync(tmp, Buffer.from(m[1], 'base64'));
  const out = runPy([LOGO_PY, tmp, destPng]);
  try {
    fs.unlinkSync(tmp);
  } catch {
    /* keep */
  }
  return out;
}

function logoPath(slug) {
  const assets = path.join(ROOT, slug, 'assets');
  const png = path.join(assets, 'logo.png');
  const svg = path.join(assets, 'logo.svg');
  if (fs.existsSync(png)) return png;
  if (fs.existsSync(svg)) return svg;
  return '';
}

function stampOne(slug) {
  const logo = logoPath(slug);
  const genName = GEN_MAP[slug];
  const scene = genName && path.join(GEN, genName);
  if (!logo || !scene || !fs.existsSync(scene)) {
    return { slug, stamped: false, reason: !logo ? 'no logo' : 'no scene' };
  }
  let mark = logo;
  if (logo.endsWith('.svg')) {
    const raster = path.join(ROOT, slug, 'assets', 'logo-raster.png');
    if (slug === 'train-and-nourish') extractEmbeddedPng(logo, raster);
    else svgToPng(logo, raster);
    mark = raster;
  }
  const dest = path.join(ROOT, slug, 'assets', 'image-gen.webp');
  const out = runPy([STAMP_PY, scene, mark, dest]);
  return { slug, stamped: true, out, mark: path.basename(mark) };
}

function applyNewLogos() {
  const rows = [];
  for (const [slug, src] of NEW_LOGOS) {
    if (!fs.existsSync(src)) {
      rows.push({ slug, ok: false, reason: `missing ${src}` });
      continue;
    }
    const dest = path.join(ROOT, slug, 'assets', 'logo.png');
    const cut = writeLogo(fs.readFileSync(src), dest);
    rows.push({ slug, ...cut, dest });
  }
  return rows;
}

function main() {
  const applied = applyNewLogos();
  const stamped = KEEP.map(stampOne);
  process.stdout.write(`${JSON.stringify({ applied, stamped }, null, 2)}\n`);
}

module.exports = { stampOne, applyNewLogos };

if (require.main === module) main();
