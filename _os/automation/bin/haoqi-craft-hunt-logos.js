#!/usr/bin/env node
'use strict';

/**
 * Hunt exact homepage logos for type-mark keepers. Never invent a mark.
 */

const fs = require('fs');
const path = require('path');
const { repoPath, ensureDir } = require('../lib/fsutil');
const { httpGet } = require('../lib/net');
const { harvestImages } = require('../lib/harvest-images');
const { logoUrls, writeLogo } = require('./haoqi-craft-batch');

const ROOT = repoPath('haoqi-radar-sites');

const TARGETS = [
  ['chestnut-hill-animal-hospital', 'http://chestnuthillvet.com/'],
  ['county-line-veterinary-hospital', 'https://www.warminsterhorshamvet.com/'],
  ['wynnewood-eyecare', 'https://www.wynnewoodeyecare.com/'],
  ['union-jack-s-olde-congo-hotel', 'http://www.unionjackscongo.com/'],
  ['eastern-dragon', 'http://easterndragonfood.com/'],
  ['francis-kaufman-house', 'https://www.franciskaufmanhouse.com/'],
  ['sciacca-service-center', 'http://sciaccaservicecenter.com/'],
  ['l-a-verruni-landscaping', 'http://www.verrunilandscaping.com/'],
  ['bg-electric-service', 'https://www.bgelectricservicellc.com/'],
  ['holiday-hair', 'https://www.holidayhair.com/'],
  ['belle-palace-nail-spa', 'https://warrington.bellepalace.com/'],
  ['j-pro', 'https://www.j-propools.com/'],
  ['kevin-t-coyne-attorney-at-law', 'https://kevintcoyneattorneyatlaw.com/'],
];

function extraGuesses(base) {
  const host = new URL(base).origin;
  return [
    `${host}/logo.png`,
    `${host}/logo.svg`,
    `${host}/images/logo.png`,
    `${host}/images/logo.svg`,
    `${host}/img/logo.png`,
    `${host}/wp-content/uploads/logo.png`,
    `${host}/assets/logo.png`,
    `${host}/assets/images/logo.png`,
  ].map((src) => ({ src, alt: 'logo' }));
}

function allImgs(html, base) {
  const out = [];
  for (const tag of html.match(/<img\b[^>]*>/gi) || []) {
    const src =
      (tag.match(/\b(?:data-src|data-lazy-src|srcset|src)=["']([^"'\s,]+)/i) || [])[1] || '';
    if (!src || /^data:/i.test(src)) continue;
    try {
      out.push({ src: new URL(src, base).href, alt: (tag.match(/\balt=["']([^"']*)/i) || [])[1] || '' });
    } catch {
      /* skip */
    }
  }
  return out;
}

async function hunt([slug, url]) {
  const assets = path.join(ROOT, slug, 'assets');
  ensureDir(assets);
  let html = '';
  let finalUrl = url;
  try {
    const res = await httpGet(url, { timeoutMs: 20000, maxBytes: 3_000_000 });
    if (res.ok) {
      html = String(res.body || '');
      finalUrl = res.finalUrl || url;
    }
    return {
      slug,
      status: res.status,
      ok: res.ok,
      bytes: html.length,
      finalUrl,
      logos: html ? logoUrls(html, finalUrl) : [],
      imgs: html ? allImgs(html, finalUrl).slice(0, 20) : [],
    };
  } catch (err) {
    return { slug, error: String(err.message || err), logos: [], imgs: [] };
  }
}

async function apply(row) {
  const assets = path.join(ROOT, row.slug, 'assets');
  const candidates = [...(row.logos || []), ...extraGuesses(row.finalUrl || TARGETS.find((t) => t[0] === row.slug)[1])];
  const harvest = { finalUrl: row.finalUrl, images: candidates };
  const picked = await harvestImages(harvest, { max: 6, minWidth: 80, minBytes: 800, timeoutMs: 15000 });
  const destPng = path.join(assets, 'logo.png');
  const destSvg = path.join(assets, 'logo.svg');
  if (picked.logo?.buffer) {
    if (picked.logo.ext === 'svg') {
      fs.writeFileSync(destSvg, picked.logo.buffer);
      return { slug: row.slug, saved: 'logo.svg', src: picked.logo.src, w: picked.logo.width };
    }
    const cut = writeLogo(picked.logo.buffer, destPng);
    return {
      slug: row.slug,
      saved: cut.ok ? 'logo.png' : '',
      reason: cut.reason,
      src: picked.logo.src,
      w: picked.logo.width,
    };
  }
  return {
    slug: row.slug,
    saved: '',
    reason: 'no honest logo',
    candidates: candidates.slice(0, 8).map((c) => c.src),
    status: row.status,
    error: row.error,
  };
}

async function main() {
  const rows = [];
  for (const t of TARGETS) {
    const found = await hunt(t);
    const applied = await apply(found);
    rows.push({
      ...applied,
      status: found.status,
      bytes: found.bytes,
      found: (found.logos || []).map((l) => l.src),
      imgs: (found.imgs || []).map((i) => `${i.src} :: ${i.alt}`),
    });
    process.stdout.write(`${applied.slug} ${applied.saved || applied.reason}\n`);
  }
  fs.writeFileSync('/tmp/haoqi-logo-hunt.json', JSON.stringify(rows, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
