#!/usr/bin/env node
'use strict';

// Runs the predictive-work numeric workload series through the verified local
// Chronos-2 research lane. The output is a shadow receipt only: it cannot
// reorder the daily plan until repeated holdouts and a human promotion gate pass.

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const { ensureDir, readJson, repoPath, writeJson } = require('../lib/fsutil');
const {
  routeForecastRequest,
  validateForecastRun,
} = require('../lib/forecast-router');

function argValue(name, fallback = null) {
  const index = process.argv.indexOf(name);
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
}

const hasFlag = (name) => process.argv.includes(name);

function integerArg(name, fallback, { min = 1, max = 60 } = {}) {
  const raw = argValue(name);
  if (raw === null) return fallback;
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed < min || parsed > max) {
    throw new Error(`${name} must be an integer between ${min} and ${max}`);
  }
  return parsed;
}

function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

function mean(values) {
  return values.length ? sum(values) / values.length : null;
}

function metrics(predicted, actual) {
  const errors = actual.map((value, index) => Math.abs(predicted[index] - value));
  const denominator = sum(actual.map((value) => Math.abs(value)));
  return {
    mae: +mean(errors).toFixed(4),
    wape: denominator > 0 ? +((sum(errors) / denominator) * 100).toFixed(2) : null,
  };
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function buildHoldout(request, dates, holdout) {
  const contextLength = request.targets[0].values.length;
  if (contextLength - holdout < 32) {
    throw new Error(`Holdout ${holdout} leaves fewer than 32 observations`);
  }
  const held = clone(request);
  held.request_id = `${request.request_id}-holdout-${holdout}`;
  held.horizon = holdout;
  held.cutoff_at = `${dates[contextLength - holdout - 1]}T23:59:59.000Z`;
  held.targets = request.targets.map((target) => ({
    ...target,
    values: target.values.slice(0, -holdout),
  }));
  held.past_covariates = (request.past_covariates || []).map((series) => ({
    ...series,
    values: series.values.slice(0, -holdout),
  }));
  held.past_future_covariates = (request.past_future_covariates || []).map((series) => ({
    ...series,
    values: series.values.slice(0, contextLength),
  }));
  held.source_locators = [...request.source_locators, `holdout://last-${holdout}-observations`];
  const actual = Object.fromEntries(request.targets.map((target) => [
    target.series_id,
    target.values.slice(-holdout),
  ]));
  return { request: held, actual };
}

function runChronos(requestPath, runPath, crossLearning) {
  const script = path.join(__dirname, 'forecast-chronos2.ps1');
  const args = [
    '-NoProfile',
    '-NonInteractive',
    '-ExecutionPolicy',
    'Bypass',
    '-File',
    script,
    '-RequestPath',
    requestPath,
    '-OutputPath',
    runPath,
  ];
  if (crossLearning) args.push('-CrossLearning');
  const result = spawnSync('powershell', args, {
    encoding: 'utf8',
    timeout: 20 * 60 * 1000,
  });
  return {
    code: result.status,
    stdout: (result.stdout || '').trim().slice(-4000),
    stderr: (result.stderr || '').trim().slice(-2000),
    error: result.error?.message || null,
  };
}

function requireValidRun(file) {
  if (!fs.existsSync(file)) throw new Error(`Chronos did not write a run artifact: ${file}`);
  const run = readJson(file);
  const validation = validateForecastRun(run);
  if (!validation.ok) throw new Error(`Invalid Chronos run: ${validation.errors.join('; ')}`);
  if (run.status !== 'ok') throw new Error(`Chronos run status is ${run.status}: ${(run.block_reasons || []).join('; ')}`);
  return run;
}

function evaluateHoldout(request, run, actual) {
  const evaluations = [];
  for (const output of run.target_outputs) {
    const target = request.targets.find((row) => row.series_id === output.series_id);
    const truth = actual[output.series_id];
    if (!target || !truth) continue;
    const context = target.values;
    const persistenceValue = context[context.length - 1];
    const trailingMean = mean(context.slice(-7));
    const persistence = truth.map(() => persistenceValue);
    const trailing = truth.map(() => trailingMean);
    const covered = truth.filter((value, index) => (
      value >= output.quantiles.p10[index] && value <= output.quantiles.p90[index]
    )).length;
    evaluations.push({
      series_id: output.series_id,
      actual: truth,
      chronos: metrics(output.point, truth),
      persistence: metrics(persistence, truth),
      trailing_seven_day_mean: metrics(trailing, truth),
      p10_p90_coverage: +(covered / truth.length).toFixed(4),
    });
  }
  return evaluations;
}

function totalForecastRows(run) {
  return run.target_outputs.map((output) => ({
    series_id: output.series_id,
    horizon: output.point.length,
    point_total: +sum(output.point.map((value) => Math.max(0, value))).toFixed(2),
    p10_total: +sum(output.quantiles.p10.map((value) => Math.max(0, value))).toFixed(2),
    p50_total: +sum(output.quantiles.p50.map((value) => Math.max(0, value))).toFixed(2),
    p90_total: +sum(output.quantiles.p90.map((value) => Math.max(0, value))).toFixed(2),
  }));
}

function renderMarkdown(receipt) {
  const lines = [
    `# Chronos workload shadow — ${receipt.as_of}`,
    '',
    `Decision: **${receipt.decision}**. Authority: **${receipt.authority}**.`,
    '',
    '## Preliminary holdout',
    '',
    '| Series | Chronos WAPE | Persistence WAPE | Trailing-7 WAPE | p10-p90 coverage |',
    '| --- | ---: | ---: | ---: | ---: |',
  ];
  for (const row of receipt.holdout.evaluations) {
    lines.push(`| ${row.series_id} | ${row.chronos.wape ?? 'n/a'}% | ${row.persistence.wape ?? 'n/a'}% | ${row.trailing_seven_day_mean.wape ?? 'n/a'}% | ${(row.p10_p90_coverage * 100).toFixed(1)}% |`);
  }
  lines.push(
    '',
    '## Next 14-day shadow band',
    '',
    '| Series | Point total | p10 total | p50 total | p90 total |',
    '| --- | ---: | ---: | ---: | ---: |',
  );
  for (const row of receipt.forecast.summary) {
    lines.push(`| ${row.series_id} | ${row.point_total} | ${row.p10_total} | ${row.p50_total} | ${row.p90_total} |`);
  }
  lines.push(
    '',
    `Gates: single holdout baseline ${receipt.gates.single_holdout_beats_best_baseline ? 'PASS' : 'FAIL'}, `
      + `quantile coverage ${receipt.gates.single_holdout_quantile_calibration ? 'PASS' : 'FAIL'}, `
      + `repeated holdouts ${receipt.gates.repeated_holdouts ? 'PASS' : 'FAIL'}, `
      + `planner consumption ${receipt.gates.planner_consumption ? 'PASS' : 'FAIL'}.`,
    '',
    'The totals are shadow evidence about workload volume. They do not create client work, deadlines, conversion claims, approvals, or permission to reorder the plan.',
    '',
  );
  return lines.join('\n');
}

function main() {
  const input = argValue('--from');
  if (!input) throw new Error('--from <predicted-work.json> is required');
  const prediction = readJson(path.resolve(input));
  const request = prediction?.chronos_shadow?.request;
  if (!request) throw new Error('Prediction artifact has no routeable Chronos shadow request');
  const dates = prediction.workload_series?.dates;
  if (!Array.isArray(dates) || dates.length !== request.targets[0].values.length) {
    throw new Error('Prediction workload dates do not match the forecast request context');
  }

  const route = routeForecastRequest(request);
  if (route.status !== 'sandbox-eligible') {
    throw new Error(`Forecast router blocked workload request: ${route.reasons.join('; ')}`);
  }

  const outDir = path.resolve(argValue(
    '--out',
    repoPath('12_Brain', 'state', 'work-predictor', `chronos-${prediction.as_of}`),
  ));
  const holdoutLength = integerArg('--holdout', 14, { min: 4, max: 28 });
  const crossLearning = hasFlag('--cross-learning');
  const dryRun = hasFlag('--dry-run');

  if (dryRun) {
    console.log(JSON.stringify({
      status: 'sandbox-eligible',
      dry_run: true,
      out_dir: outDir,
      route,
    }, null, 2));
    return;
  }

  ensureDir(outDir);
  writeJson(path.join(outDir, 'route-receipt.json'), route);
  writeJson(path.join(outDir, 'forecast-request.json'), request);

  const holdout = buildHoldout(request, dates, holdoutLength);
  const holdoutRequestPath = path.join(outDir, 'holdout-request.json');
  const holdoutRunPath = path.join(outDir, 'holdout-run.json');
  writeJson(holdoutRequestPath, holdout.request);
  const holdoutExec = runChronos(holdoutRequestPath, holdoutRunPath, crossLearning);
  if (holdoutExec.code !== 0) {
    throw new Error(`Chronos holdout failed: ${holdoutExec.error || holdoutExec.stderr || holdoutExec.stdout || `exit ${holdoutExec.code}`}`);
  }
  const holdoutRun = requireValidRun(holdoutRunPath);
  const evaluations = evaluateHoldout(holdout.request, holdoutRun, holdout.actual);

  const forecastRunPath = path.join(outDir, 'forecast-run.json');
  const forecastExec = runChronos(path.join(outDir, 'forecast-request.json'), forecastRunPath, crossLearning);
  if (forecastExec.code !== 0) {
    throw new Error(`Chronos forecast failed: ${forecastExec.error || forecastExec.stderr || forecastExec.stdout || `exit ${forecastExec.code}`}`);
  }
  const forecastRun = requireValidRun(forecastRunPath);

  const total = evaluations.find((row) => row.series_id === 'work-packages-total');
  const baselineWapes = total
    ? [total.persistence.wape, total.trailing_seven_day_mean.wape].filter((value) => value !== null)
    : [];
  const beatsBaseline = Boolean(
    total
    && total.chronos.wape !== null
    && baselineWapes.length
    && total.chronos.wape < Math.min(...baselineWapes),
  );
  const calibration = Boolean(total && total.p10_p90_coverage >= 0.7 && total.p10_p90_coverage <= 0.9);
  const gates = {
    single_holdout_beats_best_baseline: beatsBaseline,
    single_holdout_quantile_calibration: calibration,
    repeated_holdouts: false,
    planner_consumption: false,
  };
  const receipt = {
    schema_version: 1,
    experiment_id: 'EXP-DILLON-WORKLOAD-CHRONOS-SHADOW-20260902',
    as_of: prediction.as_of,
    generated_at: new Date().toISOString(),
    source_fingerprint: prediction.sources.source_fingerprint,
    authority: 'research-evidence-only',
    decision: beatsBaseline && calibration ? 'continue-shadow-backtests' : 'retain-deterministic-baseline-primary',
    cross_learning: crossLearning,
    holdout: {
      observations: holdoutLength,
      evaluations,
    },
    forecast: {
      horizon: request.horizon,
      summary: totalForecastRows(forecastRun),
    },
    gates,
    forbidden_uses: ['spend', 'send', 'publish', 'conversion-claim', 'automatic-plan-reordering'],
    artifact_paths: [
      'route-receipt.json',
      'holdout-request.json',
      'holdout-run.json',
      'forecast-request.json',
      'forecast-run.json',
    ],
  };
  const receiptPath = path.join(outDir, 'workload-forecast-receipt.json');
  const summaryPath = path.join(outDir, 'workload-forecast-summary.md');
  const latestReceiptPath = path.resolve(argValue(
    '--latest-receipt',
    repoPath('12_Brain', 'state', 'work-predictor', 'latest-chronos.json'),
  ));
  writeJson(receiptPath, receipt);
  fs.writeFileSync(summaryPath, `${renderMarkdown(receipt).trimEnd()}\n`);
  writeJson(latestReceiptPath, receipt);

  console.log(JSON.stringify({
    status: 'ok',
    out_dir: outDir,
    receipt: receiptPath,
    summary: summaryPath,
    latest_receipt: latestReceiptPath,
    decision: receipt.decision,
    gates,
    forecast: receipt.forecast.summary,
  }, null, 2));
}

try {
  main();
} catch (error) {
  console.error(error.stack || error.message);
  process.exit(1);
}
