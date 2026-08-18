#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { buildSite } = require('../site-factory/build-site');
const { listStarters, loadStarterBySlug } = require('../site-factory/lib/starters');

const ROOT = __dirname;
const SITES = path.join(ROOT, 'sites');

function writePlaceholderWebp(filePath, color) {
  const result = spawnSync(
    'ffmpeg',
    [
      '-y',
      '-f',
      'lavfi',
      '-i',
      `color=c=${color}:s=1600x1066`,
      '-frames:v',
      '1',
      '-c:v',
      'libwebp',
      '-quality',
      '50',
      filePath,
    ],
    { stdio: 'pipe' },
  );
  if (result.status !== 0) {
    const err = (result.stderr || result.stdout || '').toString().slice(-400);
    throw new Error(`ffmpeg failed for ${filePath}: ${err}`);
  }
}

function writeHub(results) {
  const cards = results
    .map(
      (r) => `<a class="card" href="sites/${r.slug}/index.html"><strong>${r.name}</strong><span>${r.attitude} · ${r.category}</span></a>`,
    )
    .join('');
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Factory starter templates</title><style>
body{margin:0;font:16px/1.45 system-ui,sans-serif;background:#111;color:#f4f1ea}
main{max-width:980px;margin:0 auto;padding:48px 20px}
h1{font-size:clamp(2rem,5vw,3.4rem);margin:0 0 12px}
p{max-width:62ch;color:#cfc8bb}
.grid{display:grid;gap:14px;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));margin-top:28px}
.card{display:flex;flex-direction:column;gap:6px;padding:18px;border:1px solid #444;border-radius:14px;color:inherit;text-decoration:none;background:#1a1a1a}
.card:hover{border-color:#6dff9b}
.card span{color:#9aa;font-size:.9rem}
</style></head><body><main><h1>Factory starter templates</h1><p>The six main website-factory templates. One vertical per attitude. Canonical briefs live in <code>_templates/site-factory/starters/</code>. Private staging. Noindex. Not Variant exports and not client sites.</p><div class="grid">${cards}</div></main></body></html>`;
  fs.writeFileSync(path.join(ROOT, 'index.html'), html);
}

function main() {
  fs.mkdirSync(SITES, { recursive: true });
  const colors = ['#C45C26', '#4F7A3C', '#8A5A44', '#1F4B99', '#3D6B73', '#6DFF9B', '#E2B84A', '#C47A2C', '#C9A36A', '#E23B2E', '#D4B48A', '#7AA2FF'];
  const results = [];
  for (const entry of listStarters()) {
    const brief = loadStarterBySlug(entry.slug);
    const built = buildSite(brief, SITES);
    const assetDir = path.join(built.outDir, 'assets');
    for (let i = 1; i <= 12; i += 1) {
      writePlaceholderWebp(path.join(assetDir, `image-${i}.webp`), colors[i - 1]);
    }
    results.push({
      slug: brief.slug,
      name: brief.name,
      attitude: brief.attitude,
      category: brief.category,
      htmlBytes: built.htmlBytes,
      missingAssets: built.missingAssets,
    });
    console.log(`built ${brief.slug} ${(built.htmlBytes / 1024).toFixed(1)} KB missing=${built.missingAssets.join(',') || 'none'}`);
  }
  writeHub(results);
  fs.writeFileSync(path.join(ROOT, 'pack-summary.json'), JSON.stringify({ generated_at: new Date().toISOString(), source: '_templates/site-factory/starters', results }, null, 2) + '\n');
}

main();
