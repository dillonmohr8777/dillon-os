#!/usr/bin/env node
'use strict';

/**
 * Deploy one site-factory batch as a single Netlify site:
 * one hub URL plus /sites/<slug>/ for each prospect.
 *
 *   node _os/automation/bin/batch-deploy.js \
 *     --batch "02_Campaigns/AI Site Builder Outreach Engine/batches/phl-2026-w34"
 *
 * Safety:
 *   - Site is pinned by exact name (from --site or batch.json deployBaseUrl).
 *     Never uses the Netlify CLI link, so this cannot overwrite immohrtal-site
 *     or a client property.
 *   - lib/netlify.js refuses any HTML page missing noindex.
 *   - prospects.csv / briefs / helper scripts are not uploaded.
 *   - Deploying is not mailing. mail_ready stays hold.
 *
 * Needs NETLIFY_AUTH_TOKEN. See _os/automation/docs/RADAR-SETUP.md.
 */

const fs = require('fs');
const path = require('path');
const { repoPath, readJson } = require('../lib/fsutil');
const { collectBatchFiles, siteNameFromBatch } = require('../lib/batch-files');
const { ensureSite, deployFiles, waitForDeploy } = require('../lib/netlify');
const { httpGet } = require('../lib/net');

const DEFAULT_BATCH = '02_Campaigns/AI Site Builder Outreach Engine/batches/phl-2026-w34';

function parseArgs(argv) {
  const o = { batch: DEFAULT_BATCH, site: '', dryRun: false, skipVerify: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--batch') o.batch = argv[++i];
    else if (a === '--site') o.site = argv[++i];
    else if (a === '--dry-run') o.dryRun = true;
    else if (a === '--skip-verify') o.skipVerify = true;
    else if (a === '--help' || a === '-h') o.help = true;
  }
  return o;
}

async function verifyLive(baseUrl, slugs) {
  const paths = ['/', ...slugs.map((s) => `/sites/${s}/`)];
  const failures = [];
  for (const p of paths) {
    const url = `${baseUrl}${p}`;
    const res = await httpGet(url, { timeoutMs: 20000, maxBytes: 400_000 });
    if (!res.ok || res.status !== 200) {
      failures.push(`${url} → ${res.status || 0} ${res.error || ''}`.trim());
      continue;
    }
    const html = String(res.body || '');
    if (!/noindex/i.test(html)) failures.push(`${url} missing noindex`);
  }
  return failures;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(fs.readFileSync(__filename, 'utf8').split('*/')[0].split('/**')[1].replace(/^\s*\* ?/gm, ''));
    process.exit(0);
  }

  const batchDir = path.isAbsolute(args.batch) ? args.batch : repoPath(args.batch);
  const batch = readJson(path.join(batchDir, 'batch.json'), {});
  const siteName = String(args.site || siteNameFromBatch(batch) || '').trim();
  if (!/^[a-z0-9][a-z0-9-]{0,62}$/.test(siteName)) {
    throw new Error(`refusing to deploy: invalid or missing site name "${siteName}"`);
  }

  const { files, slugs } = collectBatchFiles(batchDir);
  const htmlPages = [...files.keys()].filter((p) => p.endsWith('.html'));
  console.log(
    `batch ${batch.id || path.basename(batchDir)} · site ${siteName} · ` +
      `${slugs.length} prospects · ${files.size} files · ${htmlPages.length} html`
  );

  if (args.dryRun) {
    console.log('dry run: nothing deployed.');
    for (const slug of slugs) console.log(`  /sites/${slug}/`);
    return;
  }

  const site = await ensureSite(siteName);
  if (site.name !== siteName) {
    throw new Error(`refusing to deploy: ensureSite returned "${site.name}", expected "${siteName}"`);
  }
  console.log(`pinned site ${site.id} ${site.created ? '(created)' : '(existing)'} → ${site.url}`);

  const dep = await deployFiles(site.id, files, {
    title: `batch ${batch.id || siteName} hub + ${slugs.length} sites`,
    draft: false,
    requireNoindex: true,
  });
  console.log(`deploy ${dep.deployId} — uploaded ${dep.uploaded}/${dep.total}`);

  const done = await waitForDeploy(dep.deployId, { timeoutMs: 300000 });
  if (!done.ok) {
    console.error(`deploy did not go live: ${done.state} ${done.error || ''}`);
    process.exit(1);
  }

  const hub = `https://${siteName}.netlify.app`;
  console.log(`\nHUB: ${hub}`);
  for (const slug of slugs) console.log(`  ${hub}/sites/${slug}/`);

  if (!args.skipVerify) {
    const failures = await verifyLive(hub, slugs);
    if (failures.length) {
      console.error(`\nverify failed (${failures.length}):`);
      for (const f of failures) console.error(`  ${f}`);
      process.exit(1);
    }
    console.log(`\nverified ${1 + slugs.length} URLs · HTTP 200 · noindex present`);
  }

  console.log('mail_ready stays hold. nothing mailed.');
}

main().catch((err) => {
  console.error(String(err.message || err));
  process.exit(1);
});
