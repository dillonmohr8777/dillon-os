#!/usr/bin/env node
'use strict';

/**
 * Build arch-generation drafts from the radar's build queue and deploy them as
 * private Netlify previews.
 *
 *   node _os/automation/bin/arch-deploy.js --limit 3
 *
 * Deploying is not sending. Every page ships `noindex`, the Netlify deploy is a
 * draft, and the human approval gate in Pipeline Spec.md still governs whether a
 * prospect ever sees one. `mail_ready` stays `hold` throughout.
 *
 * Options
 *   --from <file>     build queue JSON (default the radar's build-15 file)
 *   --limit <n>       how many to build (default 3)
 *   --site <name>     Netlify site name (default momentum-arch-factory-drafts)
 *   --allow-drafts    deploy even though builds are not `shippable`. Required
 *                     today, because five sections still carry reference copy —
 *                     the flag exists so that is a conscious choice each time
 *                     rather than something the script quietly does.
 *   --dry-run         build and report, deploy nothing
 *
 * Needs NETLIFY_AUTH_TOKEN. See _os/automation/docs/RADAR-SETUP.md.
 */

const fs = require('fs');
const path = require('path');
const { repoPath, readJson, ensureDir, todayISO } = require('../lib/fsutil');
const { buildArchSite } = require('../lib/arch-build');
const { ensureSite, deployFiles, waitForDeploy } = require('../lib/netlify');

const DEFAULT_QUEUE = '12_Brain/state/radar/build-15-2026-08-06.json';
const OUT_DIR = '_templates/arch-factory/out';

function parseArgs(argv) {
  const o = { from: DEFAULT_QUEUE, limit: 3, site: 'momentum-arch-factory-drafts', allowDrafts: false, dryRun: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--from') o.from = argv[++i];
    else if (a === '--limit') o.limit = Math.max(1, parseInt(argv[++i], 10) || 3);
    else if (a === '--site') o.site = argv[++i];
    else if (a === '--allow-drafts') o.allowDrafts = true;
    else if (a === '--dry-run') o.dryRun = true;
    else if (a === '--help' || a === '-h') o.help = true;
  }
  return o;
}

function hubHtml(built, stamp) {
  const rows = built
    .map(
      (b) =>
        `<li><a href="/sites/${b.slug}/">${b.slug}</a>` +
        `<span class="m">arch-${b.arch} · ${b.wordCount} words · ${b.tokens.accent}</span>` +
        `<span class="b">${b.blockers.length} blocker${b.blockers.length === 1 ? '' : 's'}</span></li>`
    )
    .join('');
  return `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><title>Arch factory drafts — ${stamp}</title>
<style>
 body{font:16px/1.55 system-ui,sans-serif;max-width:46rem;margin:0 auto;padding:3rem 1.25rem;color:#17232b;background:#eef1f3}
 h1{font-size:1.6rem;margin:0 0 .25rem} .sub{color:#5a6b78;margin:0 0 1.5rem}
 .warn{border-left:3px solid #C4622D;background:#fff;padding:.9rem 1.1rem;margin:0 0 1.75rem}
 ul{list-style:none;padding:0;margin:0} li{display:flex;flex-wrap:wrap;gap:.5rem 1rem;align-items:baseline;
  padding:.7rem 0;border-bottom:1px solid #d6dde2}
 a{color:#2c5573;font-weight:600} .m{font:12.5px ui-monospace,monospace;color:#6b7a86}
 .b{font:12.5px ui-monospace,monospace;color:#A63D2F;margin-left:auto}
 @media(prefers-color-scheme:dark){body{background:#131a20;color:#e2e7ea}.warn{background:#1b242c}
  a{color:#7fa3c4}li{border-color:#2a353f}}
</style>
<h1>Arch factory — drafts</h1>
<p class="sub">${stamp} · ${built.length} build${built.length === 1 ? '' : 's'} · noindex, draft deploy</p>
<div class="warn"><strong>Not for prospects.</strong> Structure, tokens, skins and motion are real. Copy in five
sections (story, gallery, feature, visit, service-guide) is still the reference template, so the words are wrong for
these businesses. Deployed so the design can be judged by eye — which is the one thing the grader cannot measure.</div>
<ul>${rows}</ul>`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(fs.readFileSync(__filename, 'utf8').split('*/')[0].split('/**')[1].replace(/^\s*\* ?/gm, ''));
    process.exit(0);
  }

  const queuePath = path.isAbsolute(args.from) ? args.from : repoPath(args.from);
  const doc = readJson(queuePath, null);
  if (!doc) {
    console.error(`No build queue at ${args.from}. Run bin/radar-refresh.js first.`);
    process.exit(1);
  }
  const rows = (doc.prospects || doc).slice(0, args.limit);
  const stamp = todayISO();

  const usedSkins = new Set();
  const built = [];
  const files = new Map();

  for (const r of rows) {
    const site = buildArchSite(
      {
        business_name: r.business_name,
        vertical: r.vertical,
        vertical_group: r.vertical_group,
        city: r.city,
        area: r.area,
        phone: r.phone || '',
        address: r.address || '',
        domain: r.domain,
      },
      { usedSkins }
    );
    built.push(site);
    files.set(`/sites/${site.slug}/index.html`, site.html);

    // Keep a local copy so a build can be inspected without the network.
    const outDir = repoPath(path.join(OUT_DIR, site.slug));
    ensureDir(outDir);
    fs.writeFileSync(path.join(outDir, 'index.html'), site.html);

    console.log(
      `${site.slug.padEnd(34)} arch-${site.arch.padEnd(18)} ${site.wordCount} words  ` +
        `${site.shippable ? 'SHIPPABLE' : `${site.blockers.length} blocker(s)`}`
    );
  }
  files.set('/index.html', hubHtml(built, stamp));

  const unshippable = built.filter((b) => !b.shippable);
  if (unshippable.length && !args.allowDrafts) {
    console.error(
      `\n${unshippable.length} of ${built.length} builds are not shippable. Pass --allow-drafts to deploy them ` +
        'as review-only previews, or fix the blockers first:'
    );
    for (const b of unshippable) console.error(`  ${b.slug}: ${b.blockers.join('; ')}`);
    process.exit(2);
  }

  if (args.dryRun) {
    console.log('\ndry run: built and written locally, nothing deployed.');
    return;
  }

  const site = await ensureSite(args.site);
  console.log(`\nsite: ${site.name} ${site.created ? '(created)' : '(existing)'}`);
  const dep = await deployFiles(site.id, files, { title: `arch factory drafts ${stamp}`, draft: true });
  console.log(`deploy ${dep.deployId} — uploaded ${dep.uploaded}/${dep.total}`);
  const done = await waitForDeploy(dep.deployId);
  if (!done.ok) {
    console.error(`deploy did not go live: ${done.state} ${done.error || ''}`);
    process.exit(1);
  }
  console.log(`\nLIVE: ${done.url}`);
  console.log('noindex on every page, draft deploy, mail_ready stays hold.');
}

main().catch((err) => {
  console.error(String(err.message || err));
  process.exit(1);
});
