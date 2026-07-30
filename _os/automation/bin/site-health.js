#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { repoPath, ensureDir, nowISO } = require('../lib/fsutil');
const { loadProperties, writeRunState } = require('../lib/registry');
const { runSentinel, renderReport } = require('../lib/sentinel');

async function main() {
  const dryRun = !process.argv.includes('--live');
  const live = process.argv.includes('--live');
  const canary = process.argv.includes('--canary');
  const fixturesOnly = process.argv.includes('--fixtures-only');

  let { properties } = loadProperties();
  if (dryRun || fixturesOnly) {
    properties = properties.filter((p) => p.fixture || String(p.url || '').startsWith('fixture://'));
    // Always include fixtures in dry-run; if none matched somehow, load defaults
    if (!properties.length) {
      properties = loadProperties().properties.filter((p) => p.fixture);
    }
  }

  // When --dry-run (default), still evaluate fixtures; skip live URLs
  if (!live) {
    const all = loadProperties().properties;
    const fixtures = all.filter((p) => p.fixture);
    const liveSkipped = all.filter((p) => !p.fixture);
    const run = await runSentinel(fixtures, { live: false, canary: false });
    // Attach skipped live properties as informational
    for (const p of liveSkipped) {
      run.results.push({
        id: p.id,
        name: p.name,
        url: p.url,
        mode: 'dry-run-skip-live',
        ok: true,
        status: 'skipped',
        checks: [{ id: 'live_skipped', ok: true, detail: 'skipped in dry-run; pass --live to GET', severity: 'info' }],
      });
      run.counts.total += 1;
      run.counts.skipped = (run.counts.skipped || 0) + 1;
    }

    const md = renderReport(run);
    const mdPath = repoPath('Daily-Briefs/site-health-report.md');
    ensureDir(path.dirname(mdPath));
    fs.writeFileSync(mdPath, md);
    const stateFile = writeRunState('site-health-sentinel', {
      automation_id: 'site-health-sentinel',
      started_at: nowISO(),
      status: run.status === 'fail' ? 'error' : run.status === 'warn' ? 'warn' : 'dry-run',
      dry_run: true,
      counts: run.counts,
      results: run.results,
      artifact_paths: [mdPath],
    });
    console.log(JSON.stringify({ status: run.status, dry_run: true, counts: run.counts, state: stateFile, report: mdPath }, null, 2));
    return;
  }

  const run = await runSentinel(loadProperties().properties, { live, canary });
  const md = renderReport(run);
  const mdPath = repoPath('Daily-Briefs/site-health-report.md');
  ensureDir(path.dirname(mdPath));
  fs.writeFileSync(mdPath, md);
  const stateFile = writeRunState('site-health-sentinel', {
    automation_id: 'site-health-sentinel',
    started_at: nowISO(),
    status: run.status === 'fail' ? 'error' : run.status === 'warn' ? 'warn' : 'ok',
    dry_run: false,
    counts: run.counts,
    results: run.results,
    artifact_paths: [mdPath],
  });
  console.log(JSON.stringify({ status: run.status, dry_run: false, counts: run.counts, state: stateFile, report: mdPath }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
