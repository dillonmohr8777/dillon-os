#!/usr/bin/env node
'use strict';

/**
 * The daily job-search run.
 *
 * Finds marketing/growth roles that fit Dillon's real background, ranks them by
 * fit AND realistic odds, drafts tailored application material from logged
 * evidence, and writes the result where he reads it every morning.
 *
 * Hard rules this obeys:
 *   - DRAFT ONLY. It never sends, submits, applies, or emails. It writes files.
 *   - UNATTENDED. No prompts, no approval gates, no interactive input. A source
 *     failing is logged and the run continues; only a total wipeout exits non-zero.
 *
 * Usage:
 *   node _os/automation/bin/job-search-daily.js [--date YYYY-MM-DD] [--top N]
 *                                               [--dry-run] [--fixture path]
 */

const fs = require('node:fs');
const path = require('node:path');
const { repoPath, ensureDir, readJson, writeJson, nowISO, todayISO } = require('../lib/fsutil');
const { collectAll } = require('../lib/job-search/sources');
const { rankAll } = require('../lib/job-search/scoring');
const { draftFor } = require('../lib/job-search/drafting');
const { renderRankedList, renderDraft, renderBrief } = require('../lib/job-search/render');

const HOME = ['02_FullTimeJob', 'JobSearch'];

function parseArgs(argv) {
  const args = { date: null, top: 8, dryRun: false, fixture: null };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--date') args.date = argv[++i];
    else if (arg === '--top') args.top = Number(argv[++i]);
    else if (arg === '--dry-run') args.dryRun = true;
    else if (arg === '--fixture') args.fixture = argv[++i];
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!Number.isInteger(args.top) || args.top < 1 || args.top > 25) {
    throw new Error('--top must be an integer from 1 to 25');
  }
  if (args.date && !/^\d{4}-\d{2}-\d{2}$/.test(args.date)) {
    throw new Error('--date must be YYYY-MM-DD');
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const date = args.date || todayISO();
  const startedAt = nowISO();

  const profile = readJson(repoPath(...HOME, 'profile', 'dillon-profile.json'));
  const sources = readJson(repoPath(...HOME, 'profile', 'sources.json'));
  const evidence = readJson(repoPath(...HOME, 'profile', 'evidence.json'), { items: [] });
  if (!profile) throw new Error('profile/dillon-profile.json is missing — cannot score without it');
  if (!sources) throw new Error('profile/sources.json is missing — cannot fetch without it');

  const errors = [];
  let collected;
  if (args.fixture) {
    // Offline path, used by the tests and by --dry-run so the run is provable
    // without depending on somebody else's uptime.
    const fixture = readJson(path.resolve(args.fixture));
    collected = { jobs: fixture.jobs || [], raw_count: (fixture.jobs || []).length, sources: fixture.sources || [] };
  } else {
    collected = await collectAll(sources, { onError: (label, message) => errors.push(`${label}: ${message}`) });
  }

  const { ranked, rejected } = rankAll(collected.jobs, profile, Date.parse(`${date}T12:00:00Z`) || Date.now());

  const drafts = {};
  for (const row of ranked.slice(0, args.top)) {
    drafts[row.job_id] = draftFor(row, profile, evidence);
  }

  const sourcesOk = collected.sources.filter((s) => s.ok).length;
  const stats = {
    raw_count: collected.raw_count,
    deduped: collected.jobs.length,
    eligible: ranked.length,
    rejected: rejected.length,
    sources: collected.sources,
    sources_ok: sourcesOk,
    sources_total: collected.sources.length,
  };

  if (args.dryRun) {
    console.log(JSON.stringify({
      status: 'dry-run', date, stats,
      top: ranked.slice(0, args.top).map((r) => ({
        title: r.title, company: r.company,
        fit: r.fit_score, odds: r.odds_score, priority: r.priority_score,
      })),
    }, null, 2));
    return;
  }

  // --- write the day's output -------------------------------------------------
  const dailyDir = repoPath(...HOME, 'daily');
  const appsDir = repoPath(...HOME, 'applications', date);
  ensureDir(dailyDir);

  const listPath = path.join(dailyDir, `${date}-ranked-roles.md`);
  fs.writeFileSync(listPath, `${renderRankedList({ date, ranked, drafts, stats, profile })}\n`);

  const draftPaths = [];
  if (Object.keys(drafts).length) ensureDir(appsDir);
  for (const row of ranked.slice(0, args.top)) {
    const draft = drafts[row.job_id];
    if (!draft) continue;
    const file = path.join(appsDir, `${date}-${row.job_id}-draft.md`);
    fs.writeFileSync(file, `${renderDraft({ date, row, draft, profile })}\n`);
    draftPaths.push(path.relative(repoPath(), file));
  }

  // Daily-Briefs is the folder he actually opens at 07:00, so the short version
  // goes there and links back to the full list.
  const briefPath = repoPath('Daily-Briefs', `job-search-${date}.md`);
  ensureDir(path.dirname(briefPath));
  fs.writeFileSync(briefPath, `${renderBrief({ date, ranked, stats })}\n`);

  const statePath = repoPath('12_Brain', 'state', 'job-search-daily.json');
  writeJson(statePath, {
    status: errors.length && !ranked.length ? 'degraded' : 'ok',
    date,
    started_at: startedAt,
    finished_at: nowISO(),
    stats,
    errors,
    outputs: {
      ranked_list: path.relative(repoPath(), listPath),
      brief: path.relative(repoPath(), briefPath),
      drafts: draftPaths,
    },
    top: ranked.slice(0, args.top).map((r) => ({
      job_id: r.job_id, title: r.title, company: r.company, url: r.url,
      fit: r.fit_score, odds: r.odds_score, priority: r.priority_score,
    })),
  });

  console.log(JSON.stringify({
    status: 'ok', date,
    eligible: ranked.length, screened: stats.raw_count,
    drafts: draftPaths.length,
    sources: `${sourcesOk}/${stats.sources_total}`,
    ranked_list: path.relative(repoPath(), listPath),
    brief: path.relative(repoPath(), briefPath),
    errors: errors.slice(0, 5),
  }, null, 2));

  // A run that reached zero sources is a real failure and should go red in CI.
  // A run that found no matching roles is not.
  if (sourcesOk === 0 && !args.fixture) {
    console.error('Every source failed — check network egress or board slugs.');
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(`Job search daily failed: ${error.message}`);
  process.exitCode = 1;
});
