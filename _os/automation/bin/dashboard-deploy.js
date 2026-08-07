#!/usr/bin/env node
'use strict';

/**
 * Publish the prospect radar dashboard to a permanent Netlify URL.
 *
 *   node _os/automation/bin/dashboard-deploy.js
 *
 * The dashboard is regenerated on disk by every radar sweep, but a file in the
 * vault is not a thing you can open on a phone at 7am. This pushes the current
 * one to a stable site so the URL never changes between sweeps.
 *
 * noindex is enforced by lib/netlify.js: the dashboard names hundreds of real
 * businesses alongside a score for their website, which is not something that
 * should ever be indexed.
 *
 * Options
 *   --site <name>   Netlify site (default momentum-prospect-radar)
 *   --dry-run       report what would be published, publish nothing
 */

const fs = require('fs');
const path = require('path');
const { repoPath, todayISO } = require('../lib/fsutil');
const radar = require('../lib/radar');
const { renderDashboard } = require('../lib/radar-dashboard');
const { ensureSite, deployFiles, waitForDeploy } = require('../lib/netlify');

const CSV_PATH = '12_Brain/state/radar/build-queue.csv';

function parseArgs(argv) {
  const o = { site: 'momentum-prospect-radar', dryRun: false };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--site') o.site = argv[++i];
    else if (argv[i] === '--dry-run') o.dryRun = true;
    else if (argv[i] === '--help' || argv[i] === '-h') o.help = true;
  }
  return o;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(fs.readFileSync(__filename, 'utf8').split('*/')[0].split('/**')[1].replace(/^\s*\* ?/gm, ''));
    process.exit(0);
  }

  const today = todayISO();
  const summary = radar.summarize(radar.load(), { today });

  // Sweep health comes off disk here: by the time this runs, radar-last.json is
  // the record of the sweep that produced the registry we just loaded.
  let lastRun = null;
  try {
    lastRun = JSON.parse(fs.readFileSync(repoPath('12_Brain/state/radar-last.json'), 'utf8'));
  } catch {
    // No sweep has completed yet, or the file is unreadable. The strip is
    // omitted rather than faked — an absent record is not a healthy one.
  }

  const html = renderDashboard(summary, { run: lastRun });

  const files = new Map();
  files.set('/index.html', html);

  // Ship the build queue alongside it so the CSV is one click away.
  const csv = repoPath(CSV_PATH);
  if (fs.existsSync(csv)) files.set('/build-queue.csv', fs.readFileSync(csv));

  console.log(
    `tracked ${summary.total} · build queue ${summary.build_queue_size} · ` +
      `needs render ${(summary.needs_render || []).length} · mean quality ${summary.mean_site_quality}`
  );

  if (args.dryRun) {
    console.log('dry run: nothing published.');
    return;
  }

  const site = await ensureSite(args.site);
  // Not a draft: this one wants a stable URL that survives every sweep.
  const dep = await deployFiles(site.id, files, { title: `radar ${today}`, draft: false });
  const done = await waitForDeploy(dep.deployId);
  if (!done.ok) {
    console.error(`deploy failed: ${done.state} ${done.error || ''}`);
    process.exit(1);
  }
  console.log(`\nDASHBOARD: https://${site.name}.netlify.app`);
  console.log(`this deploy: ${done.url}`);
}

main().catch((err) => {
  console.error(String(err.message || err));
  process.exit(1);
});
