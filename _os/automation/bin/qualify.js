#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { repoPath, readJson, writeJson, ensureDir, nowISO, todayISO, slugify } = require('../lib/fsutil');
const { scoreProspect } = require('../lib/scorer');
const { fromMapsIntake } = require('../lib/adapters/maps-prospect');
const { fromIndeedIntake } = require('../lib/adapters/indeed-signal');
const { buildSuppressSets } = require('../lib/clients');
const { writeRunState, enqueue } = require('../lib/registry');

function parseArgs(argv) {
  const out = { adapter: 'auto', from: null, writeNotes: true, clientsRoot: repoPath('01_Clients') };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--adapter') out.adapter = argv[++i];
    else if (a === '--from') out.from = argv[++i];
    else if (a === '--no-notes') out.writeNotes = false;
    else if (a === '--clients-root') out.clientsRoot = argv[++i];
  }
  return out;
}

function detectAdapter(doc, forced) {
  if (forced && forced !== 'auto') return forced;
  if (doc && (doc.signals || doc.jobs || doc.adapter === 'indeed')) return 'indeed';
  if (Array.isArray(doc) && doc[0] && (doc[0].role || doc[0].job_title || doc[0].job_id)) return 'indeed';
  return 'maps';
}

function prospectNote(p) {
  const fm = [
    '---',
    `prospect_id: ${JSON.stringify(p.prospect_id)}`,
    `business_name: ${JSON.stringify(p.business_name)}`,
    `source: ${p.source}`,
    `website: ${p.website || ''}`,
    `vertical: ${p.vertical || ''}`,
    `status: ${p.status}`,
    `score: ${p.score}`,
    `last_touched: ${p.last_touched}`,
    `next_action: ${JSON.stringify(p.next_action || '')}`,
    'tags: [prospect, scored]',
    '---',
    '',
    `# ${p.business_name}`,
    '',
    `Score: **${p.score}**/100 (${p.status})`,
    '',
    '## Reasons',
    ...p.score_reasons.map((r) => `- ${r}`),
    '',
    '## Source payload',
    '```json',
    JSON.stringify(
      {
        hiring_signal: p.hiring_signal,
        place_id: p.place_id,
        review_count: p.review_count,
        rating: p.rating,
        market: p.market,
      },
      null,
      2
    ),
    '```',
    '',
    '## Next',
    p.status === 'queued_build'
      ? 'Eligible for Tier-A site-factory brief (PR #226). Human approval required before any outreach activate.'
      : p.status === 'suppressed'
        ? 'Suppressed — existing client or pipeline conflict.'
        : 'Below build threshold or missing website — enrich and rescore.',
    '',
  ];
  return fm.join('\n');
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.from) {
    console.error('Usage: node qualify.js --from <intake.json> [--adapter maps|indeed|auto] [--no-notes]');
    process.exit(1);
  }

  const absFrom = path.isAbsolute(args.from) ? args.from : repoPath(args.from);
  const doc = readJson(absFrom);
  const adapter = detectAdapter(doc, args.adapter);
  const prospects = adapter === 'indeed' ? fromIndeedIntake(doc) : fromMapsIntake(doc);
  const { suppressIds, suppressDomains } = buildSuppressSets(args.clientsRoot);

  const scored = [];
  for (const p of prospects) {
    let harvest = null;
    if (p.harvest_path) {
      const hp = path.isAbsolute(p.harvest_path) ? p.harvest_path : repoPath(p.harvest_path);
      harvest = readJson(hp, null);
    }
    const result = scoreProspect(p, { harvest, suppressIds, suppressDomains });
    const merged = {
      ...p,
      score: result.score,
      score_reasons: result.reasons,
      status: result.status,
      last_touched: todayISO(),
      next_action:
        result.status === 'queued_build'
          ? 'Draft site-factory brief'
          : result.status === 'suppressed'
            ? 'none'
            : 'Enrich website/harvest and rescore',
      components: result.components,
    };
    scored.push(merged);
    if (merged.status === 'queued_build') {
      enqueue('discover-qualify', 'enqueue_build', {
        prospect_id: merged.prospect_id,
        score: merged.score,
        website: merged.website,
        source: merged.source,
      });
    }
  }

  if (args.writeNotes) {
    const outDir = repoPath('08_Prospects');
    ensureDir(outDir);
    for (const p of scored) {
      const name = `${slugify(p.business_name) || 'prospect'}-${slugify(p.prospect_id).slice(0, 24)}.md`;
      fs.writeFileSync(path.join(outDir, name), prospectNote(p));
    }
  }

  const summary = {
    automation_id: 'discover-qualify',
    started_at: nowISO(),
    adapter,
    status: 'ok',
    dry_run: false,
    counts: {
      total: scored.length,
      queued_build: scored.filter((p) => p.status === 'queued_build').length,
      scored: scored.filter((p) => p.status === 'scored').length,
      suppressed: scored.filter((p) => p.status === 'suppressed').length,
    },
    prospects: scored.map((p) => ({
      prospect_id: p.prospect_id,
      business_name: p.business_name,
      source: p.source,
      score: p.score,
      status: p.status,
      reasons: p.score_reasons,
    })),
  };

  const stateFile = writeRunState('discover-qualify', summary);
  const outJson = repoPath('12_Brain/state/qualify-last.json');
  writeJson(outJson, summary);
  console.log(JSON.stringify({ status: summary.status, adapter, counts: summary.counts, state: stateFile }, null, 2));
}

main();
