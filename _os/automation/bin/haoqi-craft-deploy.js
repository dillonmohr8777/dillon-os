#!/usr/bin/env node
/**
 * Publish the Haoqi radar craft demos to a new, pinned Netlify site.
 *
 *   NETLIFY_AUTH_TOKEN=… node _os/automation/bin/haoqi-craft-deploy.js
 *   node _os/automation/bin/haoqi-craft-deploy.js --dry-run
 *
 * Site is pinned by exact name: haoqi-radar-craft
 * Source folder: haoqi-radar-sites/
 *
 * Creates that site if it is missing. Refuses every name on the live-site
 * blocklist. HTML without noindex is refused by lib/netlify.js.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { repoPath } = require('../lib/fsutil');
const { httpGet } = require('../lib/net');
const { ensureSite, findSite, deployFiles, waitForDeploy } = require('../lib/netlify');

const SITE_NAME = 'haoqi-radar-craft';
const SOURCE_DIR = 'haoqi-radar-sites';
const LIVE_ORIGIN = `https://${SITE_NAME}.netlify.app`;

const BLOCKED_SITES = Object.freeze([
  'immohrtal-site',
  'momentum-workshop-pilot',
  'momentum-prospect-radar',
  'momentum-showcase-top5',
  'momentum-arch-factory-drafts',
  'omega-landscaping-landing-page',
  'philly-site-builder-hub-0711',
  'philly-25-homepage-concepts-batch-2',
  'philly-25-homepage-concepts-batch-3',
]);

const SKIP_NAMES = new Set(['README.md', '.DS_Store', 'Thumbs.db']);

const VERIFY_PATHS = [
  '/',
  '/jarman-sales/',
  '/andorra-family-dentistry/',
  '/pennsylvania-dental-group/',
  '/dutton-road-vet/',
  '/southampton-hot-tub/',
  '/lib/craft.js',
  '/lib/craft.css',
  '/jarman-sales/assets/image-1.webp',
  '/andorra-family-dentistry/assets/image-1.webp',
];

function parseArgs(argv) {
  const o = { dryRun: false, skipVerify: false, site: SITE_NAME };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dry-run') o.dryRun = true;
    else if (a === '--skip-verify') o.skipVerify = true;
    else if (a === '--site') o.site = argv[++i];
    else if (a === '--help' || a === '-h') o.help = true;
  }
  return o;
}

function assertSiteName(name) {
  const pinned = name || SITE_NAME;
  if (pinned !== SITE_NAME) {
    throw new Error(`refusing site "${pinned}". This script only deploys ${SITE_NAME}.`);
  }
  if (BLOCKED_SITES.includes(pinned)) {
    throw new Error(`refusing blocked live site "${pinned}".`);
  }
  return pinned;
}

function collectFiles(rootDir) {
  const files = new Map();
  function walk(dir, rel) {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      if (ent.name.startsWith('.') || SKIP_NAMES.has(ent.name)) continue;
      const full = path.join(dir, ent.name);
      const nextRel = rel ? `${rel}/${ent.name}` : ent.name;
      if (ent.isDirectory()) {
        if (ent.name === 'node_modules') continue;
        walk(full, nextRel);
        continue;
      }
      if (!ent.isFile()) continue;
      files.set(`/${nextRel}`, fs.readFileSync(full));
    }
  }
  walk(rootDir, '');
  return files;
}

async function pinSite(name) {
  try {
    const found = await findSite(name);
    return { ...found, created: false };
  } catch (err) {
    if (!String(err.message).includes(`No existing Netlify site named "${name}"`)) {
      throw err;
    }
    return ensureSite(name);
  }
}

async function verifyLive(origin) {
  const results = [];
  for (const rel of VERIFY_PATHS) {
    const url = `${origin}${rel}`;
    const binary = /\.(webp|png|jpe?g|gif|woff2?)$/i.test(rel);
    const res = await httpGet(url, {
      encoding: binary ? null : 'utf8',
      maxBytes: 8_000_000,
      timeoutMs: 30000,
    });
    if (!res.ok || res.status !== 200) {
      throw new Error(`verify ${rel} failed: ${res.status || ''} ${res.error || ''}`.trim());
    }
    if (!binary) {
      const body = String(res.body || '');
      if (rel.endsWith('/') && !/noindex/i.test(body)) {
        throw new Error(`verify ${rel} failed: missing noindex`);
      }
    }
    results.push({ path: rel, status: res.status });
  }
  return results;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(fs.readFileSync(__filename, 'utf8').split('*/')[0].split('/**')[1].replace(/^\s*\* ?/gm, ''));
    process.exit(0);
  }

  const siteName = assertSiteName(args.site);
  const root = repoPath(SOURCE_DIR);
  if (!fs.existsSync(path.join(root, 'index.html'))) {
    throw new Error(`missing ${SOURCE_DIR}/index.html`);
  }

  const files = collectFiles(root);
  const names = [...files.keys()].sort();
  if (!files.has('/index.html') || !files.has('/jarman-sales/index.html')) {
    throw new Error('refusing to deploy: hub or Jarman page missing');
  }
  if (!files.has('/andorra-family-dentistry/index.html')) {
    throw new Error('refusing to deploy: Andorra page missing');
  }
  if (!files.has('/_headers')) {
    throw new Error('refusing to deploy: _headers missing');
  }

  console.log(`assembled ${files.size} files for ${siteName}`);
  console.log(names.join('\n'));

  if (args.dryRun) {
    console.log('dry run: nothing published.');
    return;
  }

  const site = await pinSite(siteName);
  if (site.name !== siteName) {
    throw new Error(`pin mismatch: expected ${siteName}, got ${site.name}`);
  }
  console.log(`pinned site ${site.name} (${site.id}) ${site.url}${site.created ? ' created' : ''}`);

  const dep = await deployFiles(site.id, files, {
    title: 'Haoqi radar craft demos',
    draft: false,
    requireNoindex: true,
  });
  console.log(
    `deploy ${dep.deployId} uploaded ${dep.uploaded}/${dep.total} (already held ${dep.alreadyHeld})`,
  );
  const waited = await waitForDeploy(dep.deployId);
  if (!waited.ok) throw new Error(`deploy did not go live: ${waited.state} ${waited.error || ''}`);
  console.log(`live ${LIVE_ORIGIN}`);
  if (waited.url) console.log(`this deploy ${waited.url}`);

  if (!args.skipVerify) {
    const checked = await verifyLive(LIVE_ORIGIN);
    for (const row of checked) console.log(`verify ${row.path} ${row.status}`);
  }
}

module.exports = {
  SITE_NAME,
  SOURCE_DIR,
  LIVE_ORIGIN,
  BLOCKED_SITES,
  SKIP_NAMES,
  VERIFY_PATHS,
  assertSiteName,
  collectFiles,
  parseArgs,
};

if (require.main === module) {
  main().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}
