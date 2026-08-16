#!/usr/bin/env node
'use strict';

/**
 * List unused radar rows for the next Haoqi 25-pack.
 * Prints scored candidates that are not already on disk.
 */

const fs = require('fs');
const path = require('path');
const { repoPath, readJson } = require('../lib/fsutil');
const { pickWord, scoreProspect } = require('../lib/haoqi-craft-words');
const { slugify } = require('./haoqi-craft-batch');

const ROOT = repoPath('haoqi-radar-sites');
const BLOCK = new Set([
  'govertical.com',
  'manatawnystillworks.com',
  'malvernvision.com',
  'goldeneaglejewelry-philadelphia.com',
  'sensezerofloat.com',
  'fantacbeautybar.com',
  'attitudealley.com',
  'jdsherocomplex.com',
  'redhillgreenhouse.com',
  'jarmanairconditioning.com',
  'orthodontists.com',
  'malvernveterinaryhospital.vetstreet.com',
  'centralbucks.fit4mom.com',
  'satoshigear.mymusclepay.com',
  'theedgefitnessclubs.com',
  'lexus.com',
  'wilkielexus.com',
  'ferrariphiladelphia.com',
  'pacificomarplelincoln.com',
]);

function existingSlugs() {
  return new Set(
    fs
      .readdirSync(ROOT, { withFileTypes: true })
      .filter((e) => e.isDirectory() && e.name !== 'lib')
      .map((e) => e.name),
  );
}

function existingDomains() {
  const have = new Set();
  for (const slug of existingSlugs()) {
    const html = fs.readFileSync(path.join(ROOT, slug, 'index.html'), 'utf8');
    for (const m of html.matchAll(/https?:\/\/(?:www\.)?([^/"']+)/g)) {
      have.add(m[1].replace(/^www\./, '').toLowerCase());
    }
  }
  return have;
}

function otherVaultSlugs() {
  const out = new Set();
  for (const dir of ['philly-sites', '01_Clients']) {
    const abs = repoPath(dir);
    if (!fs.existsSync(abs)) continue;
    for (const ent of fs.readdirSync(abs, { withFileTypes: true })) {
      if (ent.isDirectory()) out.add(ent.name.toLowerCase());
    }
  }
  return out;
}

function main() {
  const registry = readJson(repoPath('12_Brain/state/radar/registry.json'));
  const have = existingSlugs();
  const haveDomains = existingDomains();
  const other = otherVaultSlugs();
  const rows = [];
  for (const [domain, p] of Object.entries(registry.prospects)) {
    const host = domain.replace(/^www\./, '').toLowerCase();
    if (BLOCK.has(host)) continue;
    if (haveDomains.has(host)) continue;
    if (/va\.gov|lexus|ferrari|wilkie|fit4mom|mymusclepay|vetstreet|orthodontists\.com/.test(host)) continue;
    const slug = slugify(p.business_name, p.domain);
    if (have.has(slug) || other.has(slug)) continue;
    const scored = scoreProspect(p);
    if (scored.skip || !scored.word) continue;
    if (scored.quality < 84) continue;
    rows.push({
      domain: host,
      name: p.business_name,
      slug,
      word: scored.word,
      vertical: p.vertical,
      city: p.city || p.area || '',
      website: p.website || `https://${host}`,
      opportunity: scored.opportunity,
      verdict: scored.verdict,
      score: Math.round(scored.score * 10) / 10,
    });
  }
  rows.sort((a, b) => b.score - a.score);
  const used = new Map();
  const picked = [];
  for (const row of rows) {
    const n = used.get(row.word) || 0;
    if (n >= 4) continue;
    used.set(row.word, n + 1);
    picked.push(row);
    if (picked.length >= 80) break;
  }
  process.stdout.write(JSON.stringify({ unused: rows.length, picked }, null, 2) + '\n');
}

main();
