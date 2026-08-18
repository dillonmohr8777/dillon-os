#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { repoPath, readJson, writeJson, nowISO } = require('../lib/fsutil');
const { readRows } = require('../lib/prospects');
const {
  numberOrNull,
  summarize,
  groupSummary,
  buildLearningProfile,
  loadAllResults,
} = require('../lib/learning');

function parseArgs(argv) {
  const args = {
    batchDir: null,
    outcomes: null,
    batchesRoot: repoPath('02_Campaigns', 'AI Site Builder Outreach Engine', 'batches'),
    writeState: true,
  };
  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index];
    if (arg === '--batch-dir') args.batchDir = argv[++index];
    else if (arg === '--outcomes') args.outcomes = argv[++index];
    else if (arg === '--batches-root') args.batchesRoot = argv[++index];
  }
  return args;
}

function mapById(rows) {
  return new Map(rows.filter(Boolean).map((row) => [String(row.prospect_id || ''), row]));
}

function present(row, field) {
  return row && row[field] != null && String(row[field]).trim() !== '';
}

function outcomeValue(outcome, prior, field) {
  if (present(outcome, field)) return outcome[field];
  if (present(prior, field)) return prior[field];
  return null;
}

function formatRate(value) {
  return value == null ? 'pending' : `${(value * 100).toFixed(1)}%`;
}

function markdownTable(groups) {
  const rows = Object.entries(groups);
  if (!rows.length) return 'No measured outcomes yet.';
  return [
    '| Segment | Prospects | Mailed | Scans | Calls | Closes | Revenue | Call rate |',
    '|---|---:|---:|---:|---:|---:|---:|---:|',
    ...rows.map(([name, summary]) =>
      `| ${name} | ${summary.prospects} | ${summary.mailed} | ${summary.scans} | ${summary.calls_booked} | ${summary.closes} | $${summary.revenue.toFixed(2)} | ${formatRate(summary.call_rate)} |`
    ),
  ].join('\n');
}

function runLearning(options) {
  if (!options.batchDir) throw new Error('learn requires --batch-dir <batch-directory>');
  const batchDir = path.resolve(options.batchDir);
  const prospectsFile = path.join(batchDir, 'prospects.csv');
  if (!fs.existsSync(prospectsFile)) throw new Error(`Missing batch prospects.csv: ${prospectsFile}`);

  const batch = readJson(path.join(batchDir, 'batch.json'), { id: path.basename(batchDir) });
  const prospects = readRows(prospectsFile);
  const manifest = fs.existsSync(path.join(batchDir, 'manifest.csv'))
    ? readRows(path.join(batchDir, 'manifest.csv'))
    : [];
  const qualified = readJson(path.join(batchDir, 'qualified.json'), { prospects: [] });
  const outcomes = options.outcomes
    ? readRows(path.isAbsolute(options.outcomes) ? options.outcomes : path.resolve(options.outcomes))
    : [];
  const existingDoc = readJson(path.join(batchDir, 'results.json'), { records: [] });

  const manifestById = mapById(manifest);
  const qualifiedById = mapById(qualified.prospects || qualified.rows || []);
  const outcomesById = mapById(outcomes);
  const existingById = mapById(existingDoc.records || existingDoc);

  const records = prospects.map((prospect) => {
    const id = String(prospect.prospect_id || '');
    const manifestRow = manifestById.get(id) || {};
    const qualifiedRow = qualifiedById.get(id) || {};
    const outcome = outcomesById.get(id) || {};
    const prior = existingById.get(id) || {};
    const slug = manifestRow.slug || prior.slug || '';
    const brief = slug
      ? readJson(path.join(batchDir, 'briefs', `${slug}.json`), {})
      : {};
    const mailedOn = outcomeValue(outcome, prior, 'mailed_on') || prospect.mailed_on || null;
    const piecesMailed = outcomeValue(outcome, prior, 'pieces_mailed');
    return {
      prospect_id: id,
      business: prospect.business || prior.business || '',
      market: prospect.market || prior.market || batch.market || '',
      vertical: prospect.vertical || prior.vertical || qualifiedRow.vertical || '',
      attitude: outcomeValue(outcome, prior, 'attitude') || brief.attitude || 'unknown',
      slug,
      qualify_score: numberOrNull(qualifiedRow.score ?? prior.qualify_score),
      qa_ready: prospect.qa_ready || prior.qa_ready || 'hold',
      mail_ready: prospect.mail_ready || prior.mail_ready || 'hold',
      mailed_on: mailedOn,
      pieces_mailed: numberOrNull(piecesMailed) ?? (mailedOn ? 1 : null),
      scans: numberOrNull(outcomeValue(outcome, prior, 'scans')),
      calls_booked: numberOrNull(outcomeValue(outcome, prior, 'calls_booked')),
      closes: numberOrNull(outcomeValue(outcome, prior, 'closes')),
      revenue: numberOrNull(outcomeValue(outcome, prior, 'revenue')),
      notes: outcomeValue(outcome, prior, 'notes') || prospect.notes || '',
    };
  });

  const summary = summarize(records);
  const result = {
    version: 1,
    batch_id: batch.id || path.basename(batchDir),
    updated_at: nowISO(),
    outcome_source: options.outcomes || null,
    outbound_actions: false,
    summary,
    by_vertical: groupSummary(records, 'vertical'),
    by_attitude: groupSummary(records, 'attitude'),
    records,
  };
  writeJson(path.join(batchDir, 'results.json'), result);

  const report = `---
tags: [campaign, batch, results]
batch: ${result.batch_id}
updated: ${result.updated_at.slice(0, 10)}
outbound_actions: false
---

# Results: ${result.batch_id}

Outcome fields remain pending until measured data is imported. The learning step never sends outreach, flips mail approval, or invents missing results.

## Totals

| Prospects | Mailed | Scans | Calls | Closes | Revenue | Scan rate | Call rate | Close rate |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| ${summary.prospects} | ${summary.mailed} | ${summary.scans} | ${summary.calls_booked} | ${summary.closes} | $${summary.revenue.toFixed(2)} | ${formatRate(summary.scan_rate)} | ${formatRate(summary.call_rate)} | ${formatRate(summary.close_rate)} |

## By vertical

${markdownTable(result.by_vertical)}

## By design direction

${markdownTable(result.by_attitude)}

## Record status

| Prospect | Business | Vertical | Attitude | Mailed | Scans | Calls | Closes | Revenue |
|---|---|---|---|---|---:|---:|---:|---:|
${records.map((record) =>
    `| ${record.prospect_id} | ${record.business} | ${record.vertical || 'unknown'} | ${record.attitude} | ${record.mailed_on || 'pending'} | ${record.scans ?? 'pending'} | ${record.calls_booked ?? 'pending'} | ${record.closes ?? 'pending'} | ${record.revenue == null ? 'pending' : `$${record.revenue.toFixed(2)}`} |`
  ).join('\n')}
`;
  fs.writeFileSync(path.join(batchDir, 'results.md'), report);

  let allResults = loadAllResults(options.batchesRoot);
  const relative = path.relative(path.resolve(options.batchesRoot), path.join(batchDir, 'results.json'));
  if (relative.startsWith('..') || path.isAbsolute(relative)) allResults = allResults.concat(records);
  const learningProfile = buildLearningProfile(allResults);
  if (options.writeState !== false) {
    writeJson(repoPath('12_Brain', 'state', 'outreach-learning.json'), learningProfile);
  }
  return { result, learningProfile };
}

if (require.main === module) {
  try {
    const { result, learningProfile } = runLearning(parseArgs(process.argv.slice(2)));
    console.log(JSON.stringify({
      status: 'ok',
      batch_id: result.batch_id,
      summary: result.summary,
      learned_verticals: Object.keys(learningProfile.verticals).length,
    }, null, 2));
  } catch (error) {
    console.error(error.message || error);
    process.exit(1);
  }
}

module.exports = { parseArgs, runLearning };
