#!/usr/bin/env node
'use strict';

/**
 * Publish the unslop batch to one new noindex Netlify hub.
 *
 *   node automation/prospect-unslop/deploy.js
 *   node automation/prospect-unslop/deploy.js --dry-run
 *
 * Pins site name radar-unslop-20260819. Refuses client sites and the existing
 * next20 hub. Deploying is not mailing. Pages stay noindex.
 */

const fs = require('fs');
const path = require('path');
const { ensureSite, deployFiles, waitForDeploy } = require('../../_os/automation/lib/netlify');

const ROOT = path.resolve(__dirname, '../..');
const BATCH = path.join(ROOT, '02_Campaigns', 'AI Site Builder Outreach Engine', 'batches', 'radar-unslop-20260819');
const SITE_NAME = 'radar-unslop-20260819';

const FORBIDDEN_EXACT = new Set([
  'omega-landscaping-landing-page',
  'shadow-heating-website',
  'shadow-heating-cooling',
  'momentum-prospect-radar-next20-2026-08-11',
  'momentum-prospect-radar-next10-2026-08-08',
  'momentum-workshop-pilot',
  'momentum-prospect-radar',
]);

const FORBIDDEN_SUBSTR = [
  'omega-landscaping',
  'shadow-heating',
  'kimberly-james',
  'align-hcm',
  'bar-crawl',
  'replenish',
  'fagan-painting',
  'capsule-tonic',
];

function assertSafeNetlifySite(name) {
  const n = String(name || '').toLowerCase();
  if (!n) throw new Error('Netlify site name is empty');
  if (FORBIDDEN_EXACT.has(n)) {
    throw new Error(`Refusing to deploy onto protected site "${name}"`);
  }
  for (const needle of FORBIDDEN_SUBSTR) {
    if (n.includes(needle)) {
      throw new Error(`Refusing to deploy onto protected site "${name}"`);
    }
  }
  if (n !== SITE_NAME && !n.startsWith(`${SITE_NAME}-`)) {
    throw new Error(`Refusing to deploy onto "${name}". Pin ${SITE_NAME}.`);
  }
  return true;
}

function collectFiles(dir) {
  const files = new Map();
  const add = (rel, abs) => {
    files.set(rel.startsWith('/') ? rel : `/${rel}`, fs.readFileSync(abs));
  };
  add('/index.html', path.join(dir, 'index.html'));
  add('/robots.txt', path.join(dir, 'robots.txt'));
  add('/_headers', path.join(dir, '_headers'));
  const sitesRoot = path.join(dir, 'sites');
  for (const slug of fs.readdirSync(sitesRoot)) {
    const siteDir = path.join(sitesRoot, slug);
    if (!fs.statSync(siteDir).isDirectory()) continue;
    const html = path.join(siteDir, 'index.html');
    if (!fs.existsSync(html)) continue;
    add(`/sites/${slug}/index.html`, html);
    const assets = path.join(siteDir, 'assets');
    if (!fs.existsSync(assets)) continue;
    for (const name of fs.readdirSync(assets)) {
      if (!/\.(webp|png|svg|jpe?g)$/i.test(name)) continue;
      add(`/sites/${slug}/assets/${name}`, path.join(assets, name));
    }
  }
  return files;
}

async function verifyLive(origin) {
  const checks = [
    '/',
    '/robots.txt',
    '/sites/narberth-pizza/',
    '/sites/kehans-auto-service/',
    '/sites/narberth-pizza/assets/collage-6.webp',
    '/sites/kehans-auto-service/assets/collage-10.webp',
  ];
  const out = [];
  for (const rel of checks) {
    const res = await fetch(`${origin}${rel}`, { redirect: 'follow', signal: AbortSignal.timeout(30000) });
    const sample = rel.endsWith('.webp') ? '' : await res.text();
    const row = {
      path: rel,
      status: res.status,
      noindex: /noindex/i.test(sample) || /x-robots-tag/i.test(JSON.stringify(res.headers.get('x-robots-tag') || '')),
      disallow: /disallow:\s*\//i.test(sample),
      cinematic: /cinematic-frame/.test(sample),
      bytes: Number(res.headers.get('content-length') || sample.length || 0),
    };
    if (rel === '/robots.txt') row.ok = res.status === 200 && row.disallow;
    else if (rel.endsWith('.webp')) row.ok = res.status === 200 && row.bytes > 8000;
    else if (rel === '/') row.ok = res.status === 200 && /noindex/i.test(sample);
    else row.ok = res.status === 200 && /noindex/i.test(sample) && row.cinematic;
    out.push(row);
  }
  return out;
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  assertSafeNetlifySite(SITE_NAME);
  const qaPath = path.join(BATCH, 'QA.json');
  const qa = JSON.parse(fs.readFileSync(qaPath, 'utf8'));
  if (qa.ready !== 136 || qa.blocked || qa.missingBody || qa.heroReuse || qa.collisions) {
    throw new Error(`QA is not green: ready=${qa.ready} blocked=${qa.blocked} missingBody=${qa.missingBody} heroReuse=${qa.heroReuse}`);
  }
  if (!fs.existsSync(path.join(BATCH, 'robots.txt')) || !fs.existsSync(path.join(BATCH, '_headers'))) {
    throw new Error('batch is missing robots.txt or _headers');
  }
  const files = collectFiles(BATCH);
  const htmlCount = [...files.keys()].filter((p) => p.endsWith('.html')).length;
  const bytes = [...files.values()].reduce((n, b) => n + b.length, 0);
  console.log(JSON.stringify({ site: SITE_NAME, files: files.size, html: htmlCount, mb: Math.round(bytes / 1024 / 1024) }));
  if (dryRun) return;

  const site = await ensureSite(SITE_NAME);
  assertSafeNetlifySite(site.name);
  if (site.id && FORBIDDEN_EXACT.has(String(site.name).toLowerCase())) {
    throw new Error(`Refusing site id bind for ${site.name}`);
  }
  console.log(JSON.stringify({ pinned: site.name, created: site.created, url: site.url }));
  const dep = await deployFiles(site.id, files, {
    title: 'radar-unslop-20260819 noindex hub',
    draft: false,
    requireNoindex: true,
  });
  console.log(JSON.stringify({ deployId: dep.deployId, uploaded: dep.uploaded, total: dep.total, siteUrl: dep.siteUrl }));
  const done = await waitForDeploy(dep.deployId, { timeoutMs: 600000 });
  if (!done.ok) throw new Error(`deploy did not go live: ${done.state} ${done.error || ''}`);
  const origin = (site.url || done.url || `https://${SITE_NAME}.netlify.app`).replace(/\/$/, '');
  const checks = await verifyLive(origin);
  const failed = checks.filter((c) => !c.ok);
  console.log(JSON.stringify({ live: origin, checks, failed: failed.length }));
  if (failed.length) {
    throw new Error(`live verify failed: ${failed.map((c) => c.path + ':' + c.status).join(', ')}`);
  }
}

module.exports = { SITE_NAME, assertSafeNetlifySite, collectFiles, FORBIDDEN_EXACT };

if (require.main === module) {
  main().catch((err) => {
    console.error(String(err.message || err));
    process.exit(1);
  });
}
