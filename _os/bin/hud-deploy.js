#!/usr/bin/env node
'use strict';

/**
 * Publish the read-only D.I.L.L.O.N. OS HUD to a stable phone URL.
 *
 *   node _os/bin/export-hud.js
 *   node _os/bin/hud-deploy.js
 *
 * Default site: dillon-os-hud → https://dillon-os-hud.netlify.app
 * Needs NETLIFY_AUTH_TOKEN. Does not send mail, does not run skills.
 *
 * Options
 *   --site <name>   Netlify site (default dillon-os-hud)
 *   --dry-run       report files, publish nothing
 */

const fs = require('node:fs');
const path = require('node:path');
const { OUT, SITE, main: exportHud } = require('./export-hud');
const { ensureSite, deployFiles, waitForDeploy } = require('../automation/lib/netlify');

function parseArgs(argv) {
  const o = { site: 'dillon-os-hud', dryRun: false };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--site') o.site = argv[++i];
    else if (argv[i] === '--dry-run') o.dryRun = true;
    else if (argv[i] === '--help' || argv[i] === '-h') o.help = true;
  }
  return o;
}

function collect(dir, prefix = '') {
  const files = new Map();
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = prefix ? `${prefix}/${ent.name}` : ent.name;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      for (const [k, v] of collect(full, rel)) files.set(k, v);
    } else {
      files.set(`/${rel}`, fs.readFileSync(full));
    }
  }
  return files;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(fs.readFileSync(__filename, 'utf8').split('*/')[0].split('/**')[1].replace(/^\s*\* ?/gm, ''));
    process.exit(0);
  }

  exportHud();
  const files = collect(OUT);
  console.log(`pack ${files.size} files`);
  if (args.dryRun) {
    console.log('dry run: nothing published.');
    console.log(`intended URL: ${SITE}`);
    return;
  }

  const site = await ensureSite(args.site);
  const dep = await deployFiles(site.id, files, { title: `hud ${new Date().toISOString().slice(0, 10)}`, draft: false });
  const done = await waitForDeploy(dep.deployId);
  if (!done.ok) {
    console.error(`deploy failed: ${done.state} ${done.error || ''}`);
    process.exit(1);
  }
  console.log(`\nHUD: https://${site.name}.netlify.app`);
  console.log(`this deploy: ${done.url}`);
}

main().catch((err) => {
  console.error(String(err.message || err));
  process.exit(1);
});
