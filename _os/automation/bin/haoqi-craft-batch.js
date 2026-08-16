#!/usr/bin/env node
'use strict';

/**
 * Build 25 Haoqi craft demos from unused radar rows.
 *
 *   node _os/automation/bin/haoqi-craft-batch.js
 *   node _os/automation/bin/haoqi-craft-batch.js --limit 25
 *
 * Skips jarman-sales and andorra-family-dentistry. Uses their exact logo
 * when the harvest finds one, background cut to alpha.
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { repoPath, ensureDir, readJson } = require('../lib/fsutil');
const { harvestLite } = require('../lib/harvest-lite');
const { harvestImages } = require('../lib/harvest-images');
const { pickWord } = require('../lib/haoqi-craft-words');
const { render } = require('../lib/haoqi-craft-page');
const copy = require('../lib/haoqi-craft-copy');

const DONE = new Set(['jarman-sales', 'andorra-family-dentistry']);
const BLOCK_DOMAINS = new Set([
  'govertical.com', // domain now a SC developer, not the Philly gym
  'manatawnystillworks.com', // parked / gambling parking page
  'malvernvision.com', // dead
  'goldeneaglejewelry-philadelphia.com',
  'sensezerofloat.com',
  'fantacbeautybar.com',
  'attitudealley.com',
  'jdsherocomplex.com', // parked BrandRep page
  'redhillgreenhouse.com', // challenge wall, no readable copy
]);
const ROOT = repoPath('haoqi-radar-sites');
const LOGO_PY = repoPath('_os/automation/lib/haoqi-logo.py');

const QUEUE = [
  'padentalgroup.com',
  'smileculture.com',
  'alwaysdentalcare.com',
  'govertical.com',
  'duttonroadvetclinic.com',
  'floralandhardyofskippack.com',
  'southamptonhottub.com',
  'blshoes.com',
  'erlegal.com',
  'buxmontlaw.com',
  'mtairypediatrics.com',
  'pekinggourmetpottstown.com',
  'wjalandscaping.com',
  'pennsburgdiner.com',
  'heartandsoultattoos.com',
  'oaksitaliandeli.com',
  'dreamteampa.com',
  'zuberrealty.com',
  'sensezerofloat.com',
  'manatawnystillworks.com',
  'malvernvision.com',
  'saltersfireplace.com',
  'goldeneaglejewelry-philadelphia.com',
  'thejuicemerchant.com',
  'speckschicken.com',
  'fantacbeautybar.com',
  'redhillgreenhouse.com',
  'attitudealley.com',
  'kineticptpa.com',
  'electric-direct.net',
  'sprinklesicecreamelkinspark.com',
  'jdsherocomplex.com',
  'dangersalon.tv',
  'mcsheasardmore.com',
  'boylebrothersenergy.com',
  'bpmfitnessphl.com',
  'wynnewoodeyecare.com',
  'chestnuthillvet.com',
  'unionjackscongo.com',
  'leeshoagieshorsham.com',
  'accuratetemperatures.com',
  'fortitudefitness.info',
  'liveurgentcare.com',
  'banbanasianbistro.net',
  'johnnysitaliano.com',
  'havercrowndental.com',
];

function slugify(name, domain) {
  const host = String(domain || '')
    .toLowerCase()
    .replace(/\.(com|net|org|info|tv|us)$/i, '')
    .replace(/\./g, '-');
  const s = String(name || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/,.*$/, '')
    .replace(/\b(inc|llc|p\.?c\.?|co)\b/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 36);
  if (!s) return host;
  if (s.length > 32 || /eisenberg|rothweiler|winkler/.test(s)) return host.replace(/of-skippack|elkinspark/, '').slice(0, 36);
  return s;
}

function parseArgs(argv) {
  const o = { limit: 25 };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--limit') o.limit = Number(argv[++i]) || 25;
  }
  return o;
}

function logoUrls(html, base) {
  const out = [];
  const push = (src, alt) => {
    if (!src || /^data:/i.test(src)) return;
    try {
      out.push({ src: new URL(src, base).href, alt: alt || 'logo' });
    } catch {
      /* skip */
    }
  };
  for (const tag of html.match(/<link\b[^>]*>/gi) || []) {
    if (!/rel=["'][^"']*(icon|apple-touch-icon|mask-icon)[^"']*/i.test(tag)) continue;
    if (/shortcut icon/i.test(tag) && /\.ico/i.test(tag)) continue;
    const href = (tag.match(/\bhref=["']([^"']+)/i) || [])[1];
    push(href, 'logo');
  }
  for (const tag of html.match(/<img\b[^>]*>/gi) || []) {
    const blob = tag.toLowerCase();
    if (!/logo|brandmark|wordmark|navbar-brand|site-logo|custom-logo/.test(blob)) continue;
    const src =
      (tag.match(/\b(?:data-src|data-lazy-src|src)=["']([^"']+)/i) || [])[1] ||
      '';
    const alt = (tag.match(/\balt=["']([^"']*)/i) || [])[1] || 'logo';
    push(src, alt);
  }
  return out;
}

function splitAddress(raw, prospect) {
  const text = String(raw || '');
  const m = text.match(
    /^(.+?)(?:,\s*)?([A-Za-z .'-]+),\s*([A-Z]{2})\s+(\d{5})(?:-\d{4})?/,
  );
  if (m) {
    return { street: m[1].replace(/,\s*$/, '').trim(), city: m[2].trim(), region: m[3], postcode: m[4] };
  }
  return {
    street: text && !prospect.city ? text : '',
    city: prospect.city || prospect.area || '',
    region: prospect.state || 'PA',
    postcode: prospect.postcode || '',
  };
}

function writeLogo(buf, destPng) {
  const tmp = `${destPng}.src`;
  fs.writeFileSync(tmp, buf);
  const run = spawnSync('python3', [LOGO_PY, tmp, destPng], { encoding: 'utf8' });
  if (run.status !== 0 || !fs.existsSync(destPng)) {
    try {
      fs.unlinkSync(tmp);
    } catch {
      /* keep */
    }
    return { ok: false, reason: (run.stderr || run.stdout || 'logo rejected').trim() };
  }
  try {
    fs.unlinkSync(tmp);
  } catch {
    /* keep */
  }
  return { ok: true, reason: (run.stdout || '').trim() };
}

function extOf(item) {
  const e = String(item.ext || 'jpg').replace('jpeg', 'jpg');
  return e === 'svg' ? 'svg' : e;
}

async function buildOne(prospect) {
  const wordPick = pickWord(prospect);
  if (wordPick.skip || !wordPick.word) return { skip: true, reason: wordPick.why };
  const slug = slugify(prospect.business_name, prospect.domain);
  if (DONE.has(slug)) return { skip: true, reason: 'already shipped' };
  const siteUrl = prospect.website || `https://${prospect.domain}`;
  const harvest = await harvestLite(siteUrl, { timeoutMs: 22000 });
  if (!harvest || harvest.ok === false) {
    return { skip: true, reason: harvest?.reason || 'harvest failed' };
  }

  let html = '';
  try {
    const { httpGet } = require('../lib/net');
    const res = await httpGet(harvest.finalUrl || siteUrl, { timeoutMs: 20000, maxBytes: 3_000_000 });
    if (res.ok) html = String(res.body || '');
  } catch {
    html = '';
  }
  const extra = html ? logoUrls(html, harvest.finalUrl || siteUrl) : [];
  const merged = {
    ...harvest,
    images: [...extra, ...(harvest.images || [])],
  };
  const picked = await harvestImages(merged, { max: 8, minWidth: 280, minBytes: 2500, timeoutMs: 15000 });

  const dir = path.join(ROOT, slug);
  const assets = path.join(dir, 'assets');
  ensureDir(assets);

  let logoName = '';
  const logoBuf = picked.logo?.buffer;
  if (logoBuf) {
    if (picked.logo.ext === 'svg') {
      fs.writeFileSync(path.join(assets, 'logo.svg'), logoBuf);
      logoName = 'logo.svg';
    } else {
      const cut = writeLogo(logoBuf, path.join(assets, 'logo.png'));
      if (cut.ok) logoName = 'logo.png';
    }
  }

  const photos = (picked.images || []).filter((img) => img.buffer && !img.isLogo && img.ext !== 'svg');
  const written = [];
  photos.slice(0, 3).forEach((img, i) => {
    const ext = extOf(img);
    const name = `image-${i + 1}.${ext === 'svg' ? 'png' : ext}`;
    fs.writeFileSync(path.join(assets, name), img.buffer);
    written.push({
      src: name,
      alt: img.alt || `${prospect.business_name} photograph from their site`,
      width: img.width || 1200,
      height: img.height || 900,
      caption: img.alt ? img.alt.slice(0, 40) : 'From their site',
    });
  });

  const addr = splitAddress(harvest.facts?.address, prospect);
  const titles = copy.titlesFor(wordPick.word, prospect.vertical);
  const name = prospect.business_name;
  const city = addr.city || prospect.city || 'Philadelphia';
  const headline = copy.pickHeadline(harvest, name, wordPick.word);
  const page = {
    slug,
    name,
    vertical: prospect.vertical,
    siteUrl: harvest.finalUrl || siteUrl,
    word: wordPick.word,
    phone: harvest.facts?.phone || '',
    hours: harvest.facts?.hours || '',
    street: addr.street,
    city,
    region: addr.region || 'PA',
    postcode: addr.postcode,
    palette: harvest.brand?.paletteHints || [],
    logo: logoName,
    mark: copy.markFromName(name),
    sign: copy.signFromName(name),
    shotMeta: `${String(city).slice(0, 18).toUpperCase()}  ${addr.postcode || ''}`.trim(),
    title: `${name} | ${city}`,
    description: copy.tidy(harvest.voice?.metaDescription || harvest.voice?.title || `${name} in ${city}.`),
    headline,
    lede: copy.pickLede(harvest, name, city),
    offerTitle: titles.offer,
    offers: copy.pickOffers(harvest, prospect.vertical),
    proofTitle: titles.proof,
    proofs: copy.pickProofs(harvest, name),
    processTitle: titles.process,
    steps: copy.pickSteps(harvest, prospect.vertical),
    expTitle: titles.exp,
    experience: copy.pickExperience(harvest),
    areaTitle: titles.area,
    areas: copy.pickAreas(harvest, city, harvest.facts?.hours || ''),
    storyTitle: copy.tidy((harvest.voice?.headings || []).find((h) => /about|story|family|since|welcome/i.test(h)) || name),
    story: copy.pickStory(harvest, name),
    galleryTitle: 'From their site',
    visitTitle: 'Come in',
    closeTitle: titles.close,
    closeBody: copy.firstSentence(harvest.voice?.paragraphs?.find((p) => p.length > 60) || `${name} in ${city}.`, 180),
    navWork: titles.offer.split(' ')[0],
    navStory: 'Story',
    ghostLabel: 'Plan a visit',
    ghostHref: '#visit',
    images: {
      portrait: written[0] || null,
      story: written[1] || null,
      gallery: written[2] || null,
    },
    note: `Prospect demo. noindex. Copy mirrored from ${harvest.finalUrl || siteUrl} on 2026-08-16.${logoName ? ' Header mark is their logo, background cut to alpha.' : ' No clean logo on the homepage, so the mark stays type.'}${written.length ? ' Photographs are theirs.' : ' No usable photographs on the homepage.'}`,
  };

  fs.writeFileSync(path.join(dir, 'index.html'), render(page));
  return {
    skip: false,
    slug,
    name,
    word: wordPick.word,
    logo: !!logoName,
    photos: written.length,
    phone: !!page.phone,
  };
}

function existingSlugs() {
  return fs
    .readdirSync(ROOT, { withFileTypes: true })
    .filter((e) => e.isDirectory() && e.name !== 'lib')
    .map((e) => e.name);
}

function existingDomains() {
  const have = new Set();
  for (const slug of existingSlugs()) {
    const html = fs.readFileSync(path.join(ROOT, slug, 'index.html'), 'utf8');
    for (const m of html.matchAll(/https?:\/\/(?:www\.)?([^/"']+)/g)) {
      have.add(m[1].replace(/^www\./, ''));
    }
  }
  return have;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const registry = readJson(repoPath('12_Brain/state/radar/registry.json'));
  const byDomain = registry.prospects;
  const have = new Set(existingSlugs());
  const haveDomains = existingDomains();
  const built = [];
  const skipped = [];

  for (const domain of QUEUE) {
    if (built.length >= args.limit) break;
    const prospect = byDomain[domain];
    if (!prospect) {
      skipped.push({ domain, reason: 'not in registry' });
      continue;
    }
    if (BLOCK_DOMAINS.has(domain)) {
      skipped.push({ domain, reason: 'blocked domain' });
      continue;
    }
    if (haveDomains.has(domain) || haveDomains.has(domain.replace(/^www\./, ''))) {
      skipped.push({ domain, reason: 'domain already shipped' });
      continue;
    }
    const slug = slugify(prospect.business_name, prospect.domain);
    if (DONE.has(slug) || have.has(slug)) {
      skipped.push({ domain, reason: `already on disk as ${slug}` });
      continue;
    }
    process.stderr.write(`harvest ${domain} … `);
    try {
      const row = await buildOne(prospect);
      if (row.skip) {
        skipped.push({ domain, reason: row.reason });
        process.stderr.write(`skip ${row.reason}\n`);
        continue;
      }
      built.push(row);
      have.add(row.slug);
      process.stderr.write(`ok ${row.slug} logo=${row.logo} photos=${row.photos}\n`);
    } catch (err) {
      skipped.push({ domain, reason: String(err.message || err).slice(0, 120) });
      process.stderr.write(`fail ${err.message}\n`);
    }
  }

  const report = { built: built.length, skipped: skipped.length, sites: built, skippedRows: skipped };
  fs.writeFileSync(path.join(ROOT, 'batch-25.json'), `${JSON.stringify(report, null, 2)}\n`);
  process.stdout.write(`${JSON.stringify({ built: built.length, slugs: built.map((s) => s.slug) }, null, 2)}\n`);
  if (built.length < args.limit) {
    process.stderr.write(`only built ${built.length} of ${args.limit}\n`);
    process.exit(1);
  }
}

module.exports = { QUEUE, DONE, slugify, buildOne, logoUrls };

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
