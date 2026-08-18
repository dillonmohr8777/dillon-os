#!/usr/bin/env node
'use strict';

/**
 * Third unused Haoqi 25-pack: exact logos when honest, generated atmosphere,
 * recut copy. Never invent a mark.
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { repoPath } = require('../lib/fsutil');
const { writeLogo } = require('./haoqi-craft-batch');
const { render } = require('../lib/haoqi-craft-page');
const { parsePage, buildPage } = require('./haoqi-craft-recut');
const overrides = require('../lib/haoqi-craft-overrides-3');

const ROOT = repoPath('haoqi-radar-sites');
const GEN = '/opt/cursor/artifacts/assets';
const STAMP_PY = repoPath('_os/automation/lib/haoqi-stamp-logo.py');

const KEEP3 = [
  'briglia-dental-group',
  'companion-pet-hospital',
  'art-city-vets',
  'marvin-e-kanze',
  'toto-s-heating-and-cooling',
  'airmasterpa',
  'chelsvig-electric',
  'married-to-electric',
  'platinum-plumbing-and-heating',
  'see',
  'philly-vision-care',
  'little-s-ice-cream-and-water-ice',
  'kiwi-yogurt',
  'aqua-sport',
  'avanda-flower-shop',
  'greenleaf-turf-solutions',
  'primex-garden-center',
  'chiropractic-wellness-associates',
  'frederick-w-oster-fine-violins',
  'pro-nails',
  'glocker-and-realtors',
  'rocket-tan',
  'artesano-cafe',
  'plastic-surgery-solutions',
  'captain-car-wash',
];

const GEN_MAP3 = {
  'briglia-dental-group': 'gen_briglia_dental.png',
  'companion-pet-hospital': 'gen_companion_pet.png',
  'art-city-vets': 'gen_art_city_vets.png',
  'marvin-e-kanze': 'gen_marvin_kanze.png',
  'toto-s-heating-and-cooling': 'gen_totos_hvac.png',
  airmasterpa: 'gen_airmaster.png',
  'chelsvig-electric': 'gen_chelsvig_electric.png',
  'married-to-electric': 'gen_married_electric.png',
  'platinum-plumbing-and-heating': 'gen_platinum_plumbing.png',
  see: 'gen_see_eyewear.png',
  'philly-vision-care': 'gen_philly_vision.png',
  'little-s-ice-cream-and-water-ice': 'gen_littles_ice.png',
  'kiwi-yogurt': 'gen_kiwi_yogurt.png',
  'aqua-sport': 'gen_aqua_sport.png',
  'avanda-flower-shop': 'gen_avanda_flowers.png',
  'greenleaf-turf-solutions': 'gen_greenleaf_turf.png',
  'primex-garden-center': 'gen_primex_garden.png',
  'chiropractic-wellness-associates': 'gen_cwa_chiro.png',
  'frederick-w-oster-fine-violins': 'gen_oster_violins.png',
  'pro-nails': 'gen_pro_nails.png',
  'glocker-and-realtors': 'gen_glocker_realty.png',
  'rocket-tan': 'gen_rocket_tan.png',
  'artesano-cafe': 'gen_artesano_cafe.png',
  'plastic-surgery-solutions': 'gen_plastic_surgery.png',
  'captain-car-wash': 'gen_captain_wash.png',
};

const APPLY_LOGOS = [
  ['marvin-e-kanze', '/tmp/haoqi3-logos/marvin.png'],
  ['kiwi-yogurt', '/tmp/haoqi3-logos/kiwi.png'],
  ['primex-garden-center', '/tmp/haoqi3-logos/primex.png'],
  ['frederick-w-oster-fine-violins', '/tmp/haoqi3-logos/oster.png'],
  ['artesano-cafe', '/tmp/haoqi3-logos/artesano.jpg'],
];

const DROP_LOGOS = [
  'art-city-vets',
  'philly-vision-care',
  'little-s-ice-cream-and-water-ice',
  'avanda-flower-shop',
  'pro-nails',
  'glocker-and-realtors',
  'rocket-tan',
  'plastic-surgery-solutions',
  'captain-car-wash',
];

const DROP_PHOTOS = {
  'art-city-vets': ['image-1.png'],
  'plastic-surgery-solutions': ['image-1.jpg', 'image-2.jpg', 'image-3.jpg'],
};

function runPy(args) {
  const run = spawnSync('python3', args, { encoding: 'utf8' });
  if (run.status !== 0) {
    throw new Error((run.stderr || run.stdout || 'python fail').trim());
  }
  return (run.stdout || '').trim();
}

function svgToPng(svgPath, destPng) {
  const html = `<!doctype html><meta charset="utf-8"><style>
html,body{margin:0;background:#fff} img{display:block;width:720px;height:auto}
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
      '--window-size=760,220',
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
  const cut = writeLogo(fs.readFileSync(shot), destPng);
  try {
    fs.unlinkSync(shot);
  } catch {
    /* keep */
  }
  return cut;
}

function dropWrong() {
  const rows = [];
  for (const slug of DROP_LOGOS) {
    for (const file of ['logo.png', 'logo.svg']) {
      const abs = path.join(ROOT, slug, 'assets', file);
      if (fs.existsSync(abs)) {
        fs.unlinkSync(abs);
        rows.push({ slug, dropped: file });
      }
    }
  }
  for (const [slug, files] of Object.entries(DROP_PHOTOS)) {
    for (const file of files) {
      const abs = path.join(ROOT, slug, 'assets', file);
      if (fs.existsSync(abs)) {
        fs.unlinkSync(abs);
        rows.push({ slug, dropped: file });
      }
    }
  }
  return rows;
}

function cutBlackOnly(src, dest) {
  const py = `
from PIL import Image
im = Image.open(${JSON.stringify(src)}).convert("RGBA")
pix = im.load()
w, h = im.size
for y in range(h):
    for x in range(w):
        r, g, b, a = pix[x, y]
        if r <= 32 and g <= 32 and b <= 32:
            pix[x, y] = (0, 0, 0, 0)
bbox = im.getbbox()
if bbox:
    pad = 4
    x0, y0, x1, y1 = bbox
    im = im.crop((max(0, x0 - pad), max(0, y0 - pad), min(w, x1 + pad), min(h, y1 + pad)))
im.save(${JSON.stringify(dest)}, "PNG")
print(im.size)
`;
  const run = spawnSync('python3', ['-c', py], { encoding: 'utf8' });
  if (run.status !== 0 || !fs.existsSync(dest)) {
    return { ok: false, reason: (run.stderr || 'black-only cut failed').trim() };
  }
  return { ok: true, reason: `black-only ${String(run.stdout || '').trim()}` };
}

function applyLogos() {
  const rows = [];
  for (const [slug, src] of APPLY_LOGOS) {
    if (!fs.existsSync(src)) {
      rows.push({ slug, ok: false, reason: `missing ${src}` });
      continue;
    }
    const dest = path.join(ROOT, slug, 'assets', 'logo.png');
    const cut = slug === 'kiwi-yogurt' ? cutBlackOnly(src, dest) : writeLogo(fs.readFileSync(src), dest);
    rows.push({ slug, ...cut });
  }
  const airSvg = path.join(ROOT, 'airmasterpa', 'assets', 'logo.svg');
  const airPng = path.join(ROOT, 'airmasterpa', 'assets', 'logo.png');
  if (fs.existsSync(airSvg)) {
    rows.push({ slug: 'airmasterpa', ...svgToPng(airSvg, airPng) });
  }
  return rows;
}

function recutOne(slug) {
  const over = overrides[slug];
  if (!over) throw new Error(`missing override ${slug}`);
  const html = fs.readFileSync(path.join(ROOT, slug, 'index.html'), 'utf8');
  const parsed = parsePage(html);
  const page = buildPage(slug, parsed, over);
  const hasLogo = !over.dropLogo && (page.logo === 'logo.png' || page.logo === 'logo.svg');
  const genNote = ' Portrait is generated atmosphere for the trade, not their photography.';
  const logoNote = hasLogo
    ? ' Header mark is their logo, background cut to alpha.'
    : ' No clean logo on the homepage, so the mark stays type.';
  page.note = `Prospect demo. noindex. Copy mirrored from ${page.siteUrl} on 2026-08-16, then recut so proof, process, and area follow the Jarman and Andorra arc.${logoNote}${genNote}`;
  if (hasLogo) {
    page.images.portrait = {
      src: 'image-gen.webp',
      alt: `Generated atmosphere for ${page.name} with their exact logo`,
      width: 1400,
      height: 1050,
    };
  } else {
    page.images.portrait = {
      src: 'image-gen.webp',
      alt: `Generated atmosphere for ${page.name}`,
      width: 1400,
      height: 1050,
    };
  }
  fs.writeFileSync(path.join(ROOT, slug, 'index.html'), render(page));
  return { slug, logo: page.logo || 'type', word: page.word };
}

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

function logoPath(slug) {
  const assets = path.join(ROOT, slug, 'assets');
  const png = path.join(assets, 'logo.png');
  const svg = path.join(assets, 'logo.svg');
  if (fs.existsSync(png)) return png;
  if (fs.existsSync(svg)) return svg;
  return '';
}

function attachAndStamp(slug) {
  const genName = GEN_MAP3[slug];
  const scene = genName && path.join(GEN, genName);
  if (!scene || !fs.existsSync(scene)) {
    return { slug, stamped: false, reason: 'no scene' };
  }
  const dest = path.join(ROOT, slug, 'assets', 'image-gen.webp');
  const logo = logoPath(slug);
  if (logo && !DROP_LOGOS.includes(slug)) {
    let mark = logo;
    if (logo.endsWith('.svg')) {
      const raster = path.join(ROOT, slug, 'assets', 'logo-raster.png');
      svgToPng(logo, raster);
      mark = raster;
    }
    const out = runPy([STAMP_PY, scene, mark, dest]);
    return { slug, stamped: true, out };
  }
  toWebp(scene, dest);
  return { slug, stamped: false, reason: 'type mark' };
}

function rebuildHub() {
  const slugs = fs
    .readdirSync(ROOT, { withFileTypes: true })
    .filter((e) => e.isDirectory() && e.name !== 'lib')
    .map((e) => e.name)
    .sort();
  const cards = slugs
    .map((slug) => {
      const html = fs.readFileSync(path.join(ROOT, slug, 'index.html'), 'utf8');
      const name = (html.match(/"name":"([^"]+)"/) || [, slug])[1];
      const word = (html.match(/word:\s*"([^"]+)"/) || [])[1] || '';
      const logo = /has-logo/.test(html);
      const mark = slug.replace(/-/g, '.').toUpperCase();
      return `    <a class="card" href="${slug}/">
      <strong>${mark}.</strong>
      <p>${name}. Glass line <code>${word}</code>.${logo ? ' Their logo.' : ''}</p>
    </a>`;
    })
    .join('\n');
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
    <p>Prospect demos only. noindex. Same visual language as haoqi.design. Two-word glass lines. Exact logos when a real mark exists. Generated atmosphere carries that exact logo when we have one, and is labeled as generated.</p>
${cards}
  </main>
</body>
</html>
`;
  fs.writeFileSync(path.join(ROOT, 'index.html'), html);
  return slugs.length;
}

function main() {
  const dropped = dropWrong();
  const applied = applyLogos();
  const recut = KEEP3.map(recutOne);
  const stamped = KEEP3.map(attachAndStamp);
  const hub = rebuildHub();
  process.stdout.write(`${JSON.stringify({ dropped, applied, recut, stamped, hub }, null, 2)}\n`);
}

module.exports = { KEEP3, GEN_MAP3, DROP_LOGOS };

if (require.main === module) main();
