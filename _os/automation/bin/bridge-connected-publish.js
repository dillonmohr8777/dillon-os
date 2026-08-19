#!/usr/bin/env node
/**
 * Publish the Connected / Modern Network static build to the existing unified
 * review site. Never creates a site. Never binds an API origin.
 *
 *   NETLIFY_AUTH_TOKEN=… node _os/automation/bin/bridge-connected-publish.js <staging/network>
 *   node _os/automation/bin/bridge-connected-publish.js <dir> --dry-run
 *
 * Site is pinned by exact name + hostname:
 *   bridge-connected-signal / https://bridge-connected-signal.netlify.app
 *
 * After a successful production deploy this script purges the site CDN.
 * A digest deploy over a prior Next.js runtime can otherwise leave a
 * Durable-cache copy of `/` until revalidation.
 *
 * This script publishes the Next.js Modern Network restyle
 * (/create /my-profile /explore). It will refuse the original
 * Connected Industry Prototype Suite. To restore that dark-plum 3D
 * package, use bridge-connected-suite-restore.js against
 * latest-signal-app/site. Do not leave a push-to-prod trigger in place.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { api, deployFiles, waitForDeploy } = require('../lib/netlify');

const SITE_NAME = 'bridge-connected-signal';
const EXPECTED_HOST = 'bridge-connected-signal.netlify.app';
const REQUIRED_ROUTES = [
  '/index.html',
  '/community/index.html',
  '/create/index.html',
  '/my-profile/index.html',
  '/explore/index.html',
];
const SKIP_NAMES = new Set(['.DS_Store', 'Thumbs.db']);

function parseArgs(argv) {
  const rest = argv.filter((a) => a !== '--dry-run' && a !== '--help' && a !== '-h');
  return {
    dir: rest[0] || '',
    dryRun: argv.includes('--dry-run'),
    help: argv.includes('--help') || argv.includes('-h'),
  };
}

function collectFiles(dir) {
  const root = path.resolve(dir);
  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) {
    throw new Error(`staging directory missing: ${dir}`);
  }
  const files = new Map();
  const walk = (abs) => {
    for (const ent of fs.readdirSync(abs, { withFileTypes: true })) {
      if (SKIP_NAMES.has(ent.name)) continue;
      if (ent.name === 'node_modules' || ent.name === '.next') {
        throw new Error(`refusing to deploy: ${ent.name} found under ${abs}`);
      }
      const full = path.join(abs, ent.name);
      if (ent.isDirectory()) {
        walk(full);
        continue;
      }
      if (!ent.isFile()) continue;
      const rel = path.relative(root, full).split(path.sep).join('/');
      files.set(`/${rel}`, fs.readFileSync(full));
    }
  };
  walk(root);
  return files;
}

function htmlTag(html) {
  const match = String(html).match(/<html\b[^>]*>/i);
  return match ? match[0] : '';
}

function validateStaging(files) {
  const errors = [];
  if (process.env.NEXT_PUBLIC_BRIDGE_API_BASE) {
    errors.push('NEXT_PUBLIC_BRIDGE_API_BASE must stay unset');
  }
  if (!files.has('/_redirects')) {
    errors.push('missing /_redirects');
  } else {
    const redirects = files.get('/_redirects').toString('utf8');
    for (const line of ['/studio /create', '/business /my-profile', '/signal /explore']) {
      if (!redirects.includes(line)) errors.push(`missing redirect ${line}`);
    }
  }
  for (const route of REQUIRED_ROUTES) {
    if (!files.has(route)) errors.push(`missing ${route}`);
  }
  const index = files.get('/index.html');
  if (!index) {
    errors.push('missing /index.html');
  } else {
    const html = index.toString('utf8');
    const tag = htmlTag(html);
    if (!/data-theme="network"/.test(tag)) {
      errors.push('index.html html tag is not data-theme="network"');
    }
    if (/data-theme="current"/.test(tag)) {
      errors.push('index.html html tag is still Trusted Current');
    }
    if (!/noindex/i.test(html)) errors.push('index.html missing noindex');
    if (!html.includes('Modern Network')) errors.push('index.html missing Modern Network chip');
    if (!html.includes(EXPECTED_HOST)) {
      errors.push('index.html missing unified-host theme script');
    }
    if (html.includes('Trusted Current')) {
      errors.push('index.html still mentions Trusted Current');
    }
  }
  if (errors.length) throw new Error(`refusing to deploy: ${errors.join('; ')}`);
  return {
    files: files.size,
    html: [...files.keys()].filter((p) => /\.html?$/i.test(p)).length,
  };
}

function netlifyToken() {
  return process.env.NETLIFY_AUTH_TOKEN || process.env.NETLIFY_TOKEN || '';
}

async function purgeSiteCache(site) {
  const tok = netlifyToken();
  const purged = await api('/purge', {
    method: 'POST',
    tok,
    body: JSON.stringify({ site_id: site.id, site_slug: SITE_NAME }),
  });
  if (!purged.ok && purged.status !== 202) {
    throw new Error(`cache purge failed: ${purged.status} ${purged.raw || purged.error || ''}`);
  }
  return { ok: true, status: purged.status || 202 };
}

async function resolvePinnedSite() {
  const tok = netlifyToken();
  if (!tok) {
    throw new Error('No Netlify token. Set NETLIFY_AUTH_TOKEN.');
  }
  const byDomain = await api(`/sites/${EXPECTED_HOST}`, { tok });
  let body = byDomain.ok ? byDomain.body : null;
  if (!body || !body.id) {
    const listed = await api(
      `/sites?per_page=100&filter=all&name=${encodeURIComponent(SITE_NAME)}`,
      { tok },
    );
    if (!listed.ok) {
      throw new Error(`listing sites failed: ${listed.status} ${listed.raw || listed.error || ''}`);
    }
    body = (listed.body || []).find((s) => s.name === SITE_NAME) || null;
  }
  if (!body || !body.id) {
    throw new Error(`No existing Netlify site named "${SITE_NAME}". Refusing to create one.`);
  }
  if (body.name !== SITE_NAME) {
    throw new Error(`refusing: domain maps to "${body.name}", expected "${SITE_NAME}"`);
  }
  if (/safety/i.test(body.name)) {
    throw new Error(`refusing: will not publish to safety duplicate ${body.name}`);
  }
  const url = body.ssl_url || body.url || '';
  let host = '';
  try {
    host = new URL(url).hostname;
  } catch {
    throw new Error(`refusing: site URL is not parseable`);
  }
  if (host !== EXPECTED_HOST) {
    throw new Error(`refusing: site host is ${host}, expected ${EXPECTED_HOST}`);
  }
  return { id: body.id, name: body.name, url };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.dir) {
    console.log(
      'Usage: node _os/automation/bin/bridge-connected-publish.js <staging/network> [--dry-run]',
    );
    process.exit(args.help ? 0 : 1);
  }

  const files = collectFiles(args.dir);
  const summary = validateStaging(files);
  console.log(
    `validated ${summary.files} files (${summary.html} html) for ${SITE_NAME} (${EXPECTED_HOST})`,
  );

  if (args.dryRun) {
    console.log('dry run: nothing published.');
    return;
  }

  const site = await resolvePinnedSite();
  console.log(`pinned site ${site.name} ${site.url}`);
  const sha = process.env.BRIDGE_SOURCE_SHA || 'local';
  const dep = await deployFiles(site.id, files, {
    title: `Connected purple ${sha}`,
    draft: false,
    requireNoindex: true,
  });
  console.log(`deploy ${dep.deployId} uploaded ${dep.uploaded}/${dep.total}`);
  const waited = await waitForDeploy(dep.deployId, { timeoutMs: 180000 });
  if (!waited.ok) throw new Error(`deploy did not go live: ${waited.state} ${waited.error || ''}`);
  await purgeSiteCache(site);
  console.log(`purged CDN cache for ${EXPECTED_HOST}`);
  console.log(`live ${waited.url || site.url}`);
}

module.exports = {
  SITE_NAME,
  EXPECTED_HOST,
  REQUIRED_ROUTES,
  collectFiles,
  validateStaging,
  htmlTag,
  parseArgs,
  resolvePinnedSite,
  purgeSiteCache,
};

if (require.main === module) {
  main().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}
