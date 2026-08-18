#!/usr/bin/env node
'use strict';

/**
 * Second Haoqi 25-pack: unused radar rows only.
 * Exact homepage logos. Generated atmosphere when they have no photos.
 */

const fs = require('fs');
const path = require('path');
const { repoPath, readJson } = require('../lib/fsutil');
const { QUEUE: QUEUE1, DONE, slugify, buildOne, logoUrls } = require('./haoqi-craft-batch');

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
]);

const QUEUE2 = [
  'havercrowndental.com',
  'leeshoagieshorsham.com',
  'banbanasianbistro.net',
  'chestnuthillvet.com',
  'wynnewoodeyecare.com',
  'accuratetemperatures.com',
  'liveurgentcare.com',
  'johnnysitaliano.com',
  'unionjackscongo.com',
  'franciskaufmanhouse.com',
  'beijingchinesefoodpa.com',
  'grandsportautobody.com',
  'fusiongyms.com',
  'easterndragonfood.com',
  'sciaccaservicecenter.com',
  'firstclassautoland.com',
  'highlineaston.com',
  'bellepalacewarrington.com',
  'weathersmotors.com',
  'balancestudios.net',
  'glocker.com',
  'carcrashinjuryfirm.com',
  'euphorianailbar.com',
  'gopronails.com',
  'kevintcoyneattorneyatlaw.com',
  'mackshairstudio.com',
  'owmlaw.com',
  'j-propools.com',
  'townebc.com',
  'hollywoodnailsbensalem.com',
];

function existingDomains() {
  const have = new Set();
  for (const ent of fs.readdirSync(ROOT, { withFileTypes: true })) {
    if (!ent.isDirectory() || ent.name === 'lib') continue;
    const html = fs.readFileSync(path.join(ROOT, ent.name, 'index.html'), 'utf8');
    for (const m of html.matchAll(/https?:\/\/(?:www\.)?([^/"']+)/g)) {
      have.add(m[1].replace(/^www\./, ''));
    }
  }
  return have;
}

function parseArgs(argv) {
  const o = { limit: 25 };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--limit') o.limit = Number(argv[++i]) || 25;
  }
  return o;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const registry = readJson(repoPath('12_Brain/state/radar/registry.json'));
  const byDomain = registry.prospects;
  const have = new Set(
    fs.readdirSync(ROOT, { withFileTypes: true }).filter((e) => e.isDirectory() && e.name !== 'lib').map((e) => e.name),
  );
  const haveDomains = existingDomains();
  const built = [];
  const skipped = [];

  for (const domain of QUEUE2) {
    if (built.length >= args.limit) break;
    const prospect = byDomain[domain];
    if (!prospect) {
      skipped.push({ domain, reason: 'not in registry' });
      continue;
    }
    if (BLOCK.has(domain) || haveDomains.has(domain)) {
      skipped.push({ domain, reason: 'blocked or already shipped' });
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
      haveDomains.add(domain);
      process.stderr.write(`ok ${row.slug} logo=${row.logo} photos=${row.photos}\n`);
    } catch (err) {
      skipped.push({ domain, reason: String(err.message || err).slice(0, 140) });
      process.stderr.write(`fail ${err.message}\n`);
    }
  }

  const report = { built: built.length, skipped: skipped.length, sites: built, skippedRows: skipped };
  fs.writeFileSync(path.join(ROOT, 'batch-2.json'), `${JSON.stringify(report, null, 2)}\n`);
  process.stdout.write(`${JSON.stringify({ built: built.length, slugs: built.map((s) => s.slug) }, null, 2)}\n`);
  if (built.length < args.limit) {
    process.stderr.write(`only built ${built.length} of ${args.limit}\n`);
    process.exit(1);
  }
}

module.exports = { QUEUE2, BLOCK, slugify, logoUrls };

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
