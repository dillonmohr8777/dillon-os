#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { REPO_ROOT, repoPath, ensureDir, writeJson } = require('../lib/fsutil');
const { validateContract } = require('../lib/outcome-graph');
const { runCanary } = require('../lib/outcome-graph-canary');
const { runCrashReplayCanary } = require('../lib/outcome-graph-durable-canary');
const { auditFiles } = require('../lib/outcome-graph-audit');
const {
  runWeeklyShadow,
  runWeeklyShadowDurable,
} = require('../lib/outcome-graph-weekly-shadow');
const { runWeeklyTrancheDurable } = require('../lib/outcome-graph-weekly-tranche');
const { runCommandCommsDurable } = require('../lib/outcome-graph-command-comms');
const { FOUNDATION_IDS, runFoundationRoutineDurable } = require('../lib/outcome-graph-foundation');
const { GOVERNANCE_IDS, runGovernanceRoutineDurable } = require('../lib/outcome-graph-governance');
const { runPaidMediaPassDurable } = require('../lib/outcome-graph-paid-media');
const { runPerformanceRoutineDurable } = require('../lib/outcome-graph-performance');
const { runReliabilityRoutineDurable } = require('../lib/outcome-graph-reliability');
const { runWebDesignCanaryDurable } = require('../lib/outcome-graph-web-design-canary');
const { runWebsiteFactoryDurable } = require('../lib/outcome-graph-website-factory');
const { createRoutineCatalogReport } = require('../lib/outcome-graph-routine-catalog');
const { planMigrationFile } = require('../lib/outcome-graph-outreach-state');

function argValue(name, fallback = null) {
  const index = process.argv.indexOf(name);
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
}

function insideRepo(candidate) {
  const absolute = path.resolve(candidate);
  const root = path.resolve(REPO_ROOT);
  if (absolute !== root && !absolute.startsWith(root + path.sep)) {
    throw new Error('Output path escapes the Dillon OS repository: ' + candidate);
  }
  return absolute;
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8').replace(/^﻿/, ''));
}

function emit(result) {
  const out = argValue('--out');
  if (out) {
    const outputFile = insideRepo(out);
    ensureDir(path.dirname(outputFile));
    writeJson(outputFile, result);
  }
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
}

function defaultLatestReceipt() {
  const dir = repoPath('12_Brain', 'queue');
  const files = fs.readdirSync(dir)
    .filter((name) => /^claude-loop-\d{4}-\d{2}-\d{2}\.jsonl$/.test(name))
    .sort();
  if (files.length === 0) throw new Error('No Claude loop receipt log was found.');
  return path.join(dir, files[files.length - 1]);
}

async function main() {
  const command = process.argv[2];
  if (command === 'validate') {
    const graphFile = argValue('--graph');
    if (!graphFile) throw new Error('--graph is required');
    const validation = validateContract(readJson(path.resolve(graphFile)));
    emit(validation);
    if (!validation.ok) process.exitCode = 1;
    return;
  }
  if (command === 'canary') {
    const result = await runCanary();
    emit(result);
    if (result.outcome !== 'complete') process.exitCode = 1;
    return;
  }
  if (command === 'crash-canary') {
    const result = await runCrashReplayCanary();
    emit(result);
    if (result.outcome !== 'complete' ||
        !result.proof?.same_run_resumed ||
        !result.proof?.verified_alpha_not_redone ||
        !result.proof?.duplicate_trigger_ran_no_adapters) {
      process.exitCode = 1;
    }
    return;
  }
  if (command === 'audit-legacy') {
    const registryFile = path.resolve(argValue(
      '--registry',
      repoPath('11_Agents', 'claude-operating-team.json')
    ));
    const receiptFile = path.resolve(argValue('--receipts', defaultLatestReceipt()));
    emit(auditFiles(registryFile, receiptFile));
    return;
  }
  if (command === 'catalog-routines') {
    const generatedAt = argValue('--generated-at');
    const result = createRoutineCatalogReport({
      ...(generatedAt ? { generatedAt } : {}),
    });
    emit(result);
    if (!result.audit.catalog_finish_line_met) process.exitCode = 1;
    return;
  }
  if (command === 'plan-outreach-state') {
    const snapshot = argValue('--snapshot');
    if (!snapshot) throw new Error('--snapshot is required');
    const generatedAt = argValue('--generated-at');
    const result = planMigrationFile(path.resolve(snapshot), {
      ...(generatedAt ? { generatedAt } : {}),
    });
    emit(result);
    return;
  }
  if (command === 'shadow-weekly') {
    const outputDir = argValue('--output-dir');
    if (!outputDir) throw new Error('--output-dir is required');
    const result = await runWeeklyShadow({ outputDir: path.resolve(outputDir) });
    emit(result);
    if (result.outcome !== 'complete') process.exitCode = 1;
    return;
  }
  if (command === 'shadow-weekly-durable') {
    const outputDir = argValue('--output-dir');
    if (!outputDir) throw new Error('--output-dir is required');
    const stateRoot = argValue('--state-root');
    const result = await runWeeklyShadowDurable({
      outputDir: path.resolve(outputDir),
      ...(stateRoot ? { stateRoot: path.resolve(stateRoot) } : {}),
    });
    emit(result);
    if (result.outcome !== 'complete') process.exitCode = 1;
    return;
  }
  if (command === 'shadow-weekly-tranche-durable') {
    const outputDir = argValue('--output-dir');
    if (!outputDir) throw new Error('--output-dir is required');
    const stateRoot = argValue('--state-root');
    const referenceDate = argValue('--reference-date');
    const result = await runWeeklyTrancheDurable({
      outputDir: path.resolve(outputDir),
      ...(stateRoot ? { stateRoot: path.resolve(stateRoot) } : {}),
      ...(referenceDate ? { referenceDate } : {}),
    });
    emit(result);
    if (result.outcome !== 'complete') process.exitCode = 1;
    return;
  }
  if (command === 'shadow-command-comms-durable') {
    const outputDir = argValue('--output-dir');
    if (!outputDir) throw new Error('--output-dir is required');
    const stateRoot = argValue('--state-root');
    const referenceDate = argValue('--reference-date');
    const result = await runCommandCommsDurable({
      outputDir: path.resolve(outputDir),
      ...(stateRoot ? { stateRoot: path.resolve(stateRoot) } : {}),
      ...(referenceDate ? { referenceDate } : {}),
    });
    emit(result);
    if (result.outcome !== 'complete') process.exitCode = 1;
    return;
  }
  if (command === 'shadow-paid-media-durable') {
    const outputDir = argValue('--output-dir');
    if (!outputDir) throw new Error('--output-dir is required');
    const routineId = String(argValue('--routine', '')).toUpperCase();
    if (!['W02', 'W03'].includes(routineId)) throw new Error('--routine must be W02 or W03');
    const evidence = argValue('--evidence');
    if (!evidence) throw new Error('--evidence is required');
    const stateRoot = argValue('--state-root');
    const reviewDate = argValue('--review-date');
    const passAArtifact = argValue('--pass-a-artifact');
    if (routineId === 'W03' && !passAArtifact) throw new Error('--pass-a-artifact is required for W03');
    const result = await runPaidMediaPassDurable({
      routineId,
      outputDir: path.resolve(outputDir),
      liveEvidenceFile: path.resolve(evidence),
      ...(stateRoot ? { stateRoot: path.resolve(stateRoot) } : {}),
      ...(reviewDate ? { reviewDate } : {}),
      ...(passAArtifact ? { passAArtifact: path.resolve(passAArtifact) } : {}),
    });
    emit(result);
    if (result.outcome !== 'complete') process.exitCode = 1;
    return;
  }
  if (command === 'shadow-reliability-durable') {
    const outputDir = argValue('--output-dir');
    if (!outputDir) throw new Error('--output-dir is required');
    const routineId = String(argValue('--routine', '')).toUpperCase();
    if (!['D03', 'D07', 'E04', 'E10'].includes(routineId)) {
      throw new Error('--routine must be D03, D07, E04, or E10');
    }
    const stateRoot = argValue('--state-root');
    const referenceDate = argValue('--reference-date');
    const result = await runReliabilityRoutineDurable({
      routineId,
      outputDir: path.resolve(outputDir),
      ...(stateRoot ? { stateRoot: path.resolve(stateRoot) } : {}),
      ...(referenceDate ? { referenceDate } : {}),
    });
    emit(result);
    if (result.outcome !== 'complete') process.exitCode = 1;
    return;
  }
  if (command === 'shadow-performance-durable') {
    const outputDir = argValue('--output-dir');
    if (!outputDir) throw new Error('--output-dir is required');
    const routineId = String(argValue('--routine', '')).toUpperCase();
    if (!['D17', 'D18', 'D19'].includes(routineId)) {
      throw new Error('--routine must be D17, D18, or D19');
    }
    const stateRoot = argValue('--state-root');
    const referenceDate = argValue('--reference-date');
    const result = await runPerformanceRoutineDurable({
      routineId,
      outputDir: path.resolve(outputDir),
      ...(stateRoot ? { stateRoot: path.resolve(stateRoot) } : {}),
      ...(referenceDate ? { referenceDate } : {}),
    });
    emit(result);
    if (result.outcome !== 'complete') process.exitCode = 1;
    return;
  }
  if (command === 'shadow-foundation-durable') {
    const outputDir = argValue('--output-dir');
    if (!outputDir) throw new Error('--output-dir is required');
    const routineId = String(argValue('--routine', '')).toUpperCase();
    if (!FOUNDATION_IDS.includes(routineId)) {
      throw new Error(`--routine must be ${FOUNDATION_IDS.join(', ')}`);
    }
    const stateRoot = argValue('--state-root');
    const referenceDate = argValue('--reference-date');
    const result = await runFoundationRoutineDurable({
      routineId,
      outputDir: path.resolve(outputDir),
      ...(stateRoot ? { stateRoot: path.resolve(stateRoot) } : {}),
      ...(referenceDate ? { referenceDate } : {}),
    });
    emit(result);
    if (result.outcome !== 'complete') process.exitCode = 1;
    return;
  }
  if (command === 'shadow-governance-durable') {
    const outputDir = argValue('--output-dir');
    if (!outputDir) throw new Error('--output-dir is required');
    const routineId = String(argValue('--routine', '')).toUpperCase();
    if (!GOVERNANCE_IDS.includes(routineId)) {
      throw new Error(`--routine must be ${GOVERNANCE_IDS.join(', ')}`);
    }
    const stateRoot = argValue('--state-root');
    const referenceDate = argValue('--reference-date');
    const result = await runGovernanceRoutineDurable({
      routineId,
      outputDir: path.resolve(outputDir),
      ...(stateRoot ? { stateRoot: path.resolve(stateRoot) } : {}),
      ...(referenceDate ? { referenceDate } : {}),
    });
    emit(result);
    if (result.outcome !== 'complete') process.exitCode = 1;
    return;
  }
  if (command === 'shadow-website-factory-durable') {
    const outputDir = argValue('--output-dir');
    if (!outputDir) throw new Error('--output-dir is required');
    const stateRoot = argValue('--state-root');
    const asOf = argValue('--as-of');
    const result = await runWebsiteFactoryDurable({
      outputDir: path.resolve(outputDir),
      ...(stateRoot ? { stateRoot: path.resolve(stateRoot) } : {}),
      ...(asOf ? { asOf } : {}),
    });
    emit(result);
    if (result.outcome !== 'complete') process.exitCode = 1;
    return;
  }
  if (command === 'web-design-canary-durable') {
    const outputDir = argValue('--output-dir');
    const stateRoot = argValue('--state-root');
    const asOf = argValue('--as-of');
    const result = await runWebDesignCanaryDurable({
      ...(outputDir ? { outputDir: path.resolve(outputDir) } : {}),
      ...(stateRoot ? { stateRoot: path.resolve(stateRoot) } : {}),
      ...(asOf ? { asOf } : {}),
    });
    emit(result);
    if (!['complete', 'awaiting_approval'].includes(result.outcome)) process.exitCode = 1;
    return;
  }
  throw new Error(
    'Usage: outcome-graph.js <validate|canary|crash-canary|audit-legacy|catalog-routines|plan-outreach-state|shadow-weekly|shadow-weekly-durable|shadow-weekly-tranche-durable|shadow-command-comms-durable|shadow-paid-media-durable|shadow-reliability-durable|shadow-performance-durable|shadow-foundation-durable|shadow-governance-durable|shadow-website-factory-durable|web-design-canary-durable> ' +
    '[--graph FILE] [--registry FILE] [--receipts FILE] ' +
    '[--snapshot FILE] [--output-dir DIR] [--state-root DIR] [--reference-date YYYY-MM-DD] [--review-date YYYY-MM-DD] ' +
    '[--routine ROUTINE_ID] [--evidence FILE] [--pass-a-artifact FILE] [--generated-at ISO-DATE] [--as-of ISO-DATE] [--out FILE]'
  );
}

main().catch((error) => {
  process.stderr.write(error.message + '\n');
  process.exit(1);
});
