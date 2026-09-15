#!/usr/bin/env node
'use strict';

// Evidence-backed predictive work planner.
// It reads canonical queue and deliverable history, writes local planning
// artifacts, and never mutates the canonical queue or performs external work.

const fs = require('fs');
const os = require('os');
const path = require('path');

const { ensureDir, readJson, repoPath, writeJson } = require('../lib/fsutil');
const { buildPrediction, renderMarkdown } = require('../lib/work-predictor');

function argValue(name, fallback = null) {
  const index = process.argv.indexOf(name);
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
}

const hasFlag = (name) => process.argv.includes(name);

function integerArg(name, fallback, { min = 1, max = 365 } = {}) {
  const raw = argValue(name);
  if (raw === null) return fallback;
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed < min || parsed > max) {
    throw new Error(`${name} must be an integer between ${min} and ${max}`);
  }
  return parsed;
}

function discoverClientOpsRoot() {
  const explicit = argValue('--client-ops-root') || process.env.DILLON_CLIENT_OPERATIONS_ROOT;
  // Cloud routines clone repositories side by side under /home/user; the
  // Windows box keeps the canonical checkout under Documents/Codex.
  const candidates = [
    explicit,
    path.join(os.homedir(), 'Documents', 'Codex', 'projects', 'client-operations'),
    path.resolve(repoPath(), '..', 'client-operations-canonical'),
    path.resolve(repoPath(), '..', 'client-operations'),
  ].filter(Boolean);
  return candidates.find((candidate) => fs.existsSync(path.join(candidate, 'registry', 'clients.json')))
    || explicit
    || null;
}

function main() {
  const asOf = argValue('--as-of', new Date().toISOString().slice(0, 10));
  const lookaheadDays = integerArg('--lookahead-days', 35, { min: 1, max: 120 });
  const historyDays = integerArg('--history-days', 90, { min: 32, max: 365 });
  const maxCandidates = integerArg('--max-candidates', 24, { min: 1, max: 100 });
  const clientOpsRoot = discoverClientOpsRoot();
  const generatedAt = argValue('--generated-at');
  const stateDir = path.resolve(argValue('--state-dir', repoPath('12_Brain', 'state', 'work-predictor')));
  const prediction = buildPrediction({
    clientOpsRoot,
    asOf,
    generatedAt,
    lookaheadDays,
    historyDays,
    maxCandidates,
  });

  const chronosReceiptPath = path.resolve(argValue(
    '--chronos-receipt',
    path.join(stateDir, 'latest-chronos.json'),
  ));
  const chronosReceipt = readJson(chronosReceiptPath, null);
  if (chronosReceipt && chronosReceipt.source_fingerprint === prediction.sources.source_fingerprint) {
    prediction.chronos_shadow.status = 'evaluated-shadow';
    prediction.chronos_shadow.latest_receipt = {
      generated_at: chronosReceipt.generated_at,
      decision: chronosReceipt.decision,
      authority: chronosReceipt.authority,
      gates: chronosReceipt.gates,
      holdout: chronosReceipt.holdout,
      forecast: chronosReceipt.forecast,
      source_ref: '12_Brain/state/work-predictor/latest-chronos.json',
    };
  } else if (chronosReceipt) {
    prediction.blind_spots.push('The latest Chronos receipt has a different source fingerprint and was not attached to this brief.');
  }

  const dryRun = hasFlag('--dry-run');
  const outDir = path.resolve(argValue('--out-dir', repoPath('Daily-Briefs')));
  const stem = `predicted-work-${prediction.as_of}`;
  const jsonPath = path.join(outDir, `${stem}.json`);
  const markdownPath = path.join(outDir, `${stem}.md`);
  const statePath = path.join(stateDir, 'latest.json');
  const forecastRequestPath = path.join(stateDir, `workload-forecast-request-${prediction.as_of}.json`);

  if (!dryRun) {
    ensureDir(outDir);
    ensureDir(stateDir);
    writeJson(jsonPath, prediction);
    fs.writeFileSync(markdownPath, `${renderMarkdown(prediction).trimEnd()}\n`);
    writeJson(statePath, prediction);
    if (prediction.chronos_shadow.request) writeJson(forecastRequestPath, prediction.chronos_shadow.request);
  }

  console.log(JSON.stringify({
    status: 'ok',
    dry_run: dryRun,
    as_of: prediction.as_of,
    candidates: prediction.candidates.length,
    deliverable_events_scanned: prediction.sources.deliverable_events_scanned,
    active_queue_items_scanned: prediction.sources.active_queue_items_scanned,
    chronos_shadow_status: prediction.chronos_shadow.status,
    output: dryRun ? null : {
      json: jsonPath,
      markdown: markdownPath,
      state: statePath,
      forecast_request: prediction.chronos_shadow.request ? forecastRequestPath : null,
    },
    top_candidates: prediction.candidates.slice(0, 8).map((candidate) => ({
      candidate_id: candidate.candidate_id,
      client_id: candidate.client_id,
      work_package_id: candidate.work_package_id,
      confidence: candidate.confidence,
      window: candidate.predicted_window,
    })),
  }, null, 2));
}

try {
  main();
} catch (error) {
  console.error(error.stack || error.message);
  process.exit(1);
}
