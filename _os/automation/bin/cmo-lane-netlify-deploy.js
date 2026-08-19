#!/usr/bin/env node
/**
 * Draft-deploy the CMO lane operator board to a pinned Netlify site.
 *
 * Never creates a site. Never overlays a client site. Draft by default.
 * HTML must already contain noindex.
 *
 *   node _os/automation/bin/cmo-lane-netlify-deploy.js --dry-run
 *   CMO_LANE_NETLIFY_SITE_ID=… NETLIFY_AUTH_TOKEN=… node _os/automation/bin/cmo-lane-netlify-deploy.js
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { repoPath } = require('../lib/fsutil');
const { deployFiles, waitForDeploy } = require('../lib/netlify');

const PUBLISH_DIR = repoPath('_os/cmo-lane/public');
const SITE_ENV = 'CMO_LANE_NETLIFY_SITE_ID';

function parseArgs(argv) {
  return {
    dryRun: argv.includes('--dry-run') || !argv.includes('--publish'),
    publish: argv.includes('--publish'),
    help: argv.includes('--help') || argv.includes('-h'),
  };
}

function collectFiles(dir, prefix = '') {
  const files = new Map();
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      for (const [k, v] of collectFiles(full, rel)) files.set(k, v);
    } else {
      files.set(`/${rel.replace(/\\/g, '/')}`, fs.readFileSync(full));
    }
  }
  return files;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(`Usage: node _os/automation/bin/cmo-lane-netlify-deploy.js [--dry-run|--publish]
Pin an existing site with ${SITE_ENV}. The script never creates a site.`);
    process.exit(0);
  }

  const files = collectFiles(PUBLISH_DIR);
  if (!files.has('/index.html')) {
    throw new Error('missing _os/cmo-lane/public/index.html');
  }

  const siteId = (process.env[SITE_ENV] || '').trim();
  const payload = {
    ok: true,
    dry_run: !args.publish,
    file_count: files.size,
    paths: [...files.keys()],
    site_env: SITE_ENV,
    site_id_present: Boolean(siteId),
    draft: true,
    never_create_site: true,
  };

  if (!args.publish) {
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  if (!siteId) {
    throw new Error(`${SITE_ENV} is not set. Pin an existing Netlify site; refusing to create one.`);
  }

  const started = await deployFiles(siteId, files, {
    title: 'cmo-lane operator board',
    draft: true,
    requireNoindex: true,
  });
  const waited = await waitForDeploy(started.deployId);
  console.log(JSON.stringify({ ...payload, dry_run: false, deploy: started, wait: waited }, null, 2));
  if (!waited.ok) process.exit(1);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
