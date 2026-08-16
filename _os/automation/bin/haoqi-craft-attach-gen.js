#!/usr/bin/env node
'use strict';

/**
 * Keep 25 unused Haoqi skins, attach exact logos and generated atmosphere.
 * Generated photos are labeled as generated. Logos are theirs.
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { repoPath } = require('../lib/fsutil');

const ROOT = repoPath('haoqi-radar-sites');
const GEN = '/opt/cursor/artifacts/assets';

const KEEP = [
  'colmar-dentistry-for-kids',
  'glen-eagle-pediatric-dentistry',
  'havercrown-dental',
  'chestnut-hill-animal-hospital',
  'county-line-veterinary-hospital',
  'wynnewood-eyecare',
  'live-urgent-care',
  'johnny-s-pizza',
  'union-jack-s-olde-congo-hotel',
  'golden-sea',
  'eastern-dragon',
  'francis-kaufman-house',
  'fusion-gyms',
  'train-and-nourish',
  'balance-studios',
  'weathers-motors-and-auto-sales',
  'sciacca-service-center',
  'advance-exterior-solutions',
  'l-a-verruni-landscaping',
  'bg-electric-service',
  'holiday-hair',
  'belle-palace-nail-spa',
  'j-pro',
  'carcrashinjuryfirm',
  'kevin-t-coyne-attorney-at-law',
];

const GEN_MAP = {
  'colmar-dentistry-for-kids': 'gen_colmar_pediatric.png',
  'glen-eagle-pediatric-dentistry': 'gen_glen_eagle_pediatric.png',
  'havercrown-dental': 'gen_havercrown_dental.png',
  'chestnut-hill-animal-hospital': 'gen_chestnut_vet.png',
  'county-line-veterinary-hospital': 'gen_county_line_vet.png',
  'wynnewood-eyecare': 'gen_wynnewood_eyecare.png',
  'live-urgent-care': 'gen_live_urgent.png',
  'johnny-s-pizza': 'gen_johnnys_pizza.png',
  'union-jack-s-olde-congo-hotel': 'gen_union_jack.png',
  'golden-sea': 'gen_golden_sea.png',
  'eastern-dragon': 'gen_eastern_dragon.png',
  'francis-kaufman-house': 'gen_francis_kaufman.png',
  'fusion-gyms': 'gen_fusion_gym.png',
  'train-and-nourish': 'gen_train_nourish.png',
  'balance-studios': 'gen_balance_studios.png',
  'weathers-motors-and-auto-sales': 'gen_weathers_motors.png',
  'sciacca-service-center': 'gen_sciacca_service.png',
  'advance-exterior-solutions': 'gen_advance_exterior.png',
  'l-a-verruni-landscaping': 'gen_verruni_landscaping.png',
  'bg-electric-service': 'gen_bg_electric.png',
  'holiday-hair': 'gen_holiday_hair.png',
  'belle-palace-nail-spa': 'gen_belle_palace.png',
  'j-pro': 'gen_j_pro_pool.png',
  'carcrashinjuryfirm': 'gen_carcrash_law.png',
  'kevin-t-coyne-attorney-at-law': 'gen_coyne_law.png',
};

const ORIG = new Set([
  'always-dental-care', 'andorra-family-dentistry', 'benjamin-lovell-shoes', 'boyle-energy-heating',
  'bpm-fitness', 'dream-team', 'dutton-road-vet', 'electric-direct', 'erlegal', 'floral-and-hardy',
  'heart-and-soul-tattoo', 'jarman-sales', 'kinetic-physical-therapy', 'mcmenamin-and-margiotti',
  'mt-airy-pediatrics', 'new-pennsburg-diner', 'oaks-italian-deli', 'peking-gourmet',
  'pennsylvania-dental-group', 'salters-fireplace', 'smile-culture-dental', 'southampton-hot-tub',
  'specks-chicken', 'sprinkles-icecream', 'the-juice-merchant', 'wja-landscaping', 'zuber-realty',
]);

function toWebp(src, dest) {
  const py = `
from PIL import Image
im = Image.open(${JSON.stringify(src)}).convert("RGB")
im.thumbnail((1400, 1050))
im.save(${JSON.stringify(dest)}, "WEBP", quality=80)
print(im.size)
`;
  const run = spawnSync('python3', ['-c', py], { encoding: 'utf8' });
  if (run.status !== 0) throw new Error(run.stderr || 'webp fail');
}

function patchPage(slug) {
  const file = path.join(ROOT, slug, 'index.html');
  let html = fs.readFileSync(file, 'utf8');
  const name = (html.match(/<title>([^|<]+)/) || [, slug])[1].trim();
  const assets = path.join(ROOT, slug, 'assets');
  fs.mkdirSync(assets, { recursive: true });

  const hasLogo = fs.existsSync(path.join(assets, 'logo.png')) || fs.existsSync(path.join(assets, 'logo.svg'));
  if (hasLogo && !/has-logo/.test(html)) {
    const logoFile = fs.existsSync(path.join(assets, 'logo.svg')) ? 'logo.svg' : 'logo.png';
    html = html.replace(
      /<a class="mark" href="#main">[\s\S]*?<\/a>/,
      `<a class="mark has-logo" href="#main"><img src="assets/${logoFile}" alt="${name}"></a>`,
    );
  }

  const gen = GEN_MAP[slug];
  const genSrc = gen && path.join(GEN, gen);
  if (genSrc && fs.existsSync(genSrc)) {
    const dest = path.join(assets, 'image-gen.webp');
    toWebp(genSrc, dest);
    const alt = `Generated atmosphere for ${name}`;
    if (/portrait-empty/.test(html)) {
      html = html.replace(
        /<figure class="portrait-empty" aria-hidden="true"><\/figure>/,
        `<figure>\n        <img src="assets/image-gen.webp" alt="${alt}" width="1400" height="1050" loading="lazy">\n      </figure>`,
      );
    } else if (!/assets\/image-/.test(html)) {
      html = html.replace(
        /<section class="portrait">\s*<figure>/,
        `<section class="portrait">\n      <figure>\n        <img src="assets/image-gen.webp" alt="${alt}" width="1400" height="1050" loading="lazy">\n      </figure>\n      <figure hidden>`,
      );
    }
    if (/<section class="story"[\s\S]*?<\/section>/.test(html) && !/class="story"[\s\S]*<figure/.test(html)) {
      html = html.replace(
        /(<\/div>\s*)(<\/section>\s*<section class="(?:gallery|process)")/,
        `$1      <figure class="reveal">\n        <img src="assets/image-gen.webp" alt="${alt}" width="1400" height="1050" loading="lazy">\n      </figure>\n    $2`,
      );
    }
    html = html.replace(
      /No usable photographs on the homepage\./,
      'Portrait is generated atmosphere for the trade, not their photography.',
    );
    if (!/generated atmosphere/.test(html)) {
      html = html.replace(
        /(Prospect demo\. noindex\.[^<]*)/,
        '$1 Portrait is generated atmosphere for the trade, not their photography.',
      );
    }
  }

  fs.writeFileSync(file, html);
  return { slug, logo: hasLogo, gen: !!(genSrc && fs.existsSync(genSrc)) };
}

function dropExtras() {
  const dropped = [];
  for (const ent of fs.readdirSync(ROOT, { withFileTypes: true })) {
    if (!ent.isDirectory() || ent.name === 'lib') continue;
    if (ORIG.has(ent.name) || KEEP.includes(ent.name)) continue;
    fs.rmSync(path.join(ROOT, ent.name), { recursive: true, force: true });
    dropped.push(ent.name);
  }
  return dropped;
}

function wordOf(html) {
  return (html.match(/word:\s*"([^"]+)"/) || [])[1] || '';
}

function nameOf(html) {
  const j = html.match(/"name":"([^"]+)"/);
  return j ? j[1] : '';
}

function rebuildHub() {
  const slugs = fs.readdirSync(ROOT, { withFileTypes: true })
    .filter((e) => e.isDirectory() && e.name !== 'lib')
    .map((e) => e.name)
    .sort();
  const cards = slugs.map((slug) => {
    const html = fs.readFileSync(path.join(ROOT, slug, 'index.html'), 'utf8');
    const name = nameOf(html) || slug;
    const word = wordOf(html);
    const logo = /has-logo/.test(html);
    const mark = slug.replace(/-/g, '.').toUpperCase();
    return `    <a class="card" href="${slug}/">
      <strong>${mark}.</strong>
      <p>${name}. Glass line <code>${word}</code>.${logo ? ' Their logo.' : ''}</p>
    </a>`;
  }).join('\n');
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title>Haoqi craft demos · ${slugs.length} radar rebuilds</title>
  <style>
    body { margin: 0; font-family: "IBM Plex Mono", ui-monospace, monospace; background: #eef5fb; color: #111; padding: 32px 20px 80px; }
    main { max-width: 760px; margin: 0 auto; }
    h1 { font-family: "Archivo Black", sans-serif; text-transform: uppercase; line-height: 0.95; }
    a { color: #02537e; }
    .card { display: block; background: #fff; border: 1px solid #111; padding: 18px; margin: 14px 0; text-decoration: none; color: inherit; }
    .card strong { font-family: "Archivo Black", sans-serif; letter-spacing: 0.04em; }
    p { max-width: 58ch; }
    code { font-size: 0.9em; }
  </style>
</head>
<body>
  <main>
    <h1>Haoqi craft on ${slugs.length} radar rebuilds</h1>
    <p>Prospect demos only. noindex. Same visual language as haoqi.design. Two-word glass lines. Exact logos when the homepage had one. Generated atmosphere fills empty photo slots and is labeled as generated.</p>
${cards}
  </main>
</body>
</html>
`;
  fs.writeFileSync(path.join(ROOT, 'index.html'), html);
  return slugs.length;
}

function main() {
  const luc = path.join(ROOT, 'live-urgent-care/assets/logo.png');
  if (!fs.existsSync(luc)) {
    console.error('live-urgent-care logo missing');
  }
  const dropped = dropExtras();
  const rows = KEEP.map(patchPage);
  const count = rebuildHub();
  process.stdout.write(`${JSON.stringify({ keep: rows, dropped, hub: count }, null, 2)}\n`);
}

module.exports = { KEEP, GEN_MAP };

if (require.main === module) main();
