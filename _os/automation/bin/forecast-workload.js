#!/usr/bin/env node
'use strict';

// Runs the predictive-work numeric workload series through the verified local
// Chronos-2 research lane as repeated rolling-origin holdouts plus one forward
// shadow forecast. The receipt is evidence only: it cannot reorder the daily
// plan, and software never sets the planner-consumption gate.

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const { ensureDir, readJson, repoPath, writeJson } = require('../lib/fsutil');
const {
  routeForecastRequest,
  validateForecastRun,
} = require('../lib/forecast-router');
const { aggregateGates, evaluateOrigin } = require('../lib/workload-evaluator');

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

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function futureDatesAfter(lastDate, horizon) {
  const dates = [];
  const cursor = new Date(`${lastDate}T00:00:00.000Z`);
  for (let index = 0; index < horizon; index += 1) {
    cursor.setUTCDate(cursor.getUTCDate() + 1);
    dates.push(cursor.toISOString().slice(0, 10));
  }
  return dates;
}

// Origin k holds out the last k*horizon observations and forecasts the
// following `horizon` days from what came before.
function buildOrigin(request, dates, horizon, k) {
  const total = request.targets[0].values.length;
  const end = total - (k - 1) * horizon;
  const contextLength = end - horizon;
  if (contextLength < 32) return null;
  const held = clone(request);
  held.request_id = `${request.request_id}-origin-${contextLength}`;
  held.horizon = horizon;
  held.cutoff_at = `${dates[contextLength - 1]}T23:59:59.000Z`;
  held.targets = request.targets.map((target) => ({
    ...target,
    values: target.values.slice(0, contextLength),
  }));
  held.past_covariates = (request.past_covariates || []).map((series) => ({
    ...series,
    values: series.values.slice(0, contextLength),
  }));
  held.past_future_covariates = (request.past_future_covariates || []).map((series) => ({
    ...series,
    values: series.values.slice(0, contextLength + horizon),
  }));
  held.source_locators = [...request.source_locators, `holdout://origin-${contextLength}-horizon-${horizon}`];
  return {
    origin_index: k,
    context_length: contextLength,
    cutoff_date: dates[contextLength - 1],
    request: held,
    context_dates: dates.slice(0, contextLength),
    future_dates: dates.slice(contextLength, end),
    actual: Object.fromEntries(request.targets.map((target) => [
      target.series_id,
      target.values.slice(contextLength, end),
    ])),
  };
}

function runChronos(requestPath, runPath, crossLearning) {
  const script = path.join(__dirname, 'forecast-chronos2.ps1');
  const args = [
    '-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', script,
    '-RequestPath', requestPath, '-OutputPath', runPath,
  ];
  if (crossLearning) args.push('-CrossLearning');
  const result = spawnSync('powershell', args, { encoding: 'utf8', timeout: 20 * 60 * 1000 });
  return {
    code: result.status,
    stderr: (result.stderr || '').trim().slice(-1500),
    error: result.error?.message || null,
  };
}

// Returns { run } or { rejected: [reasons] }. Invalid output is preserved as
// rejected evidence instead of aborting the whole evaluation.
function loadRun(file, exec) {
  if (!fs.existsSync(file)) {
    return { rejected: [`Chronos did not write a run artifact (${exec.error || exec.stderr || `exit ${exec.code}`})`] };
  }
  const run = readJson(file);
  const validation = validateForecastRun(run);
  const reasons = [...validation.errors];
  if (run.status !== 'ok') reasons.push(`run status ${run.status}: ${(run.block_reasons || []).join('; ')}`);
  return reasons.length ? { rejected: reasons, run } : { run };
}

function forecastSummary(run) {
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
  const pct = (value) => (value === null || value === undefined ? 'n/a' : `${(value * 100).toFixed(1)}%`);
  const lines = [
    `# Chronos workload shadow — ${receipt.as_of}`,
    '',
    `Decision: **${receipt.decision}**. Authority: **${receipt.authority}**. Horizon ${receipt.horizon} days, ${receipt.aggregate.origins_planned} rolling origins.`,
    '',
    '## Rolling-origin holdouts (portfolio total)',
    '',
    '| Origin cutoff | Context | Zero share | Chronos MAE | Best baseline | Baseline MAE | Croston-SBA MAE | Seasonal-7 MAE | Chronos p10-p90 cov. | Weekday band cov. | Verdict |',
    '| --- | ---: | ---: | ---: | --- | ---: | ---: | ---: | ---: | ---: | --- |',
  ];
  for (const origin of receipt.origins) {
    if (origin.status !== 'scored') {
      lines.push(`| ${origin.cutoff_date} | ${origin.context_length} | | | | | | | | | REJECTED: ${origin.rejected_reasons.join('; ').replace(/\|/g, '/')} |`);
      continue;
    }
    const e = origin.evaluation;
    lines.push(`| ${origin.cutoff_date} | ${origin.context_length} | ${pct(e.zero_share)} | ${e.chronos.mae} | ${e.best_baseline.method} | ${e.best_baseline.mae} | ${e.baselines.croston_sba.mae} | ${e.baselines.seasonal_naive_7.mae} | ${pct(e.p10_p90_coverage)} | ${pct(e.empirical_day_of_week_band_coverage)} | ${e.chronos_beats_best_baseline ? 'Chronos wins' : 'baseline wins'} |`);
  }
  const a = receipt.aggregate;
  lines.push(
    '',
    `Aggregate: Chronos won ${a.chronos_wins_vs_best_baseline} of ${a.origins_scored} scored origins (${a.origins_rejected} rejected). Mean MAE Chronos ${a.mean_chronos_mae ?? 'n/a'} vs best baseline ${a.mean_best_baseline_mae ?? 'n/a'}. Mean p10-p90 coverage ${pct(a.mean_p10_p90_coverage)} against the free weekday band's ${pct(a.mean_empirical_band_coverage)}.`,
    '',
    '## Forward shadow band',
    '',
  );
  if (receipt.forecast.status === 'ok') {
    lines.push('| Series | Horizon | Point total | p10 total | p50 total | p90 total |', '| --- | ---: | ---: | ---: | ---: | ---: |');
    for (const row of receipt.forecast.summary) {
      lines.push(`| ${row.series_id} | ${row.horizon} | ${row.point_total} | ${row.p10_total} | ${row.p50_total} | ${row.p90_total} |`);
    }
  } else {
    lines.push(`Forward forecast rejected: ${receipt.forecast.rejected_reasons.join('; ')}`);
  }
  const g = a.gates;
  lines.push(
    '',
    `Gates: all origins valid ${g.all_origins_valid ? 'PASS' : 'FAIL'}; repeated holdouts beat best baseline ${g.repeated_holdouts_beat_best_baseline ? 'PASS' : 'FAIL'}; repeated-holdout calibration ${g.repeated_holdouts_quantile_calibration ? 'PASS' : 'FAIL'}; repeated holdouts overall ${g.repeated_holdouts ? 'PASS' : 'FAIL'}; planner consumption ${g.planner_consumption ? 'PASS' : 'FAIL'}.`,
    '',
    a.planner_consumption_reason,
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
  const horizon = integerArg('--horizon', integerArg('--holdout', 7, { min: 4, max: 28 }), { min: 4, max: 28 });
  const originCount = integerArg('--origins', 4, { min: 1, max: 12 });
  const crossLearning = hasFlag('--cross-learning');
  const dryRun = hasFlag('--dry-run');

  const plannedOrigins = [];
  for (let k = 1; k <= originCount; k += 1) {
    const origin = buildOrigin(request, dates, horizon, k);
    if (!origin) break;
    plannedOrigins.push(origin);
  }
  if (!plannedOrigins.length) throw new Error('Not enough history for a single origin with 32 context observations');

  if (dryRun) {
    console.log(JSON.stringify({
      status: 'sandbox-eligible',
      dry_run: true,
      out_dir: outDir,
      horizon,
      origins: plannedOrigins.map((origin) => ({
        cutoff_date: origin.cutoff_date,
        context_length: origin.context_length,
        route: routeForecastRequest(origin.request).status,
      })),
      route,
    }, null, 2));
    return;
  }

  ensureDir(path.join(outDir, 'origins'));
  writeJson(path.join(outDir, 'route-receipt.json'), route);
  writeJson(path.join(outDir, 'forecast-request.json'), request);

  const origins = [];
  for (const origin of plannedOrigins) {
    const stem = path.join(outDir, 'origins', `origin-${origin.context_length}`);
    const requestPath = `${stem}-request.json`;
    const runPath = `${stem}-run.json`;
    writeJson(requestPath, origin.request);
    const row = {
      origin_index: origin.origin_index,
      cutoff_date: origin.cutoff_date,
      context_length: origin.context_length,
      horizon,
      artifact_paths: [path.relative(outDir, requestPath), path.relative(outDir, runPath)],
    };
    const originRoute = routeForecastRequest(origin.request);
    if (originRoute.status !== 'sandbox-eligible') {
      origins.push({ ...row, status: 'rejected-route', rejected_reasons: originRoute.reasons });
      continue;
    }
    const exec = runChronos(requestPath, runPath, crossLearning);
    const loaded = loadRun(runPath, exec);
    if (loaded.rejected) {
      origins.push({ ...row, status: 'rejected-run', rejected_reasons: loaded.rejected });
      continue;
    }
    const evaluations = {};
    for (const output of loaded.run.target_outputs) {
      const target = origin.request.targets.find((entry) => entry.series_id === output.series_id);
      const actual = origin.actual[output.series_id];
      if (!target || !actual) continue;
      evaluations[output.series_id] = evaluateOrigin({
        context: target.values,
        contextDates: origin.context_dates,
        futureDates: origin.future_dates,
        actual,
        output,
      });
    }
    const total = evaluations['work-packages-total'];
    if (!total) {
      origins.push({ ...row, status: 'rejected-run', rejected_reasons: ['run did not return the portfolio total series'] });
      continue;
    }
    origins.push({ ...row, status: 'scored', evaluation: total, other_series: Object.keys(evaluations).filter((id) => id !== 'work-packages-total') });
  }

  const forecastRunPath = path.join(outDir, 'forecast-run.json');
  const forecastExec = runChronos(path.join(outDir, 'forecast-request.json'), forecastRunPath, crossLearning);
  const forecastLoaded = loadRun(forecastRunPath, forecastExec);
  const forecast = forecastLoaded.rejected
    ? { status: 'rejected', horizon: request.horizon, rejected_reasons: forecastLoaded.rejected, future_dates: futureDatesAfter(dates[dates.length - 1], request.horizon) }
    : { status: 'ok', horizon: request.horizon, future_dates: futureDatesAfter(dates[dates.length - 1], request.horizon), summary: forecastSummary(forecastLoaded.run) };

  const aggregate = aggregateGates(origins);
  const receipt = {
    schema_version: 2,
    experiment_id: 'EXP-DILLON-WORKLOAD-CHRONOS-SHADOW-20260902',
    as_of: prediction.as_of,
    generated_at: new Date().toISOString(),
    source_fingerprint: prediction.sources.source_fingerprint,
    authority: 'research-evidence-only',
    model_id: request.model_id,
    horizon,
    cross_learning: crossLearning,
    decision: aggregate.gates.repeated_holdouts ? 'continue-shadow-backtests' : 'retain-deterministic-baseline-primary',
    baseline_methods: ['persistence', 'trailing_seven_day_mean', 'trailing_28_day_mean', 'zero', 'seasonal_naive_7', 'day_of_week_mean', 'croston_sba'],
    origins,
    aggregate,
    gates: aggregate.gates,
    forecast,
    forbidden_uses: ['spend', 'send', 'publish', 'conversion-claim', 'automatic-plan-reordering'],
    artifact_paths: [
      'route-receipt.json',
      'forecast-request.json',
      'forecast-run.json',
      ...origins.flatMap((origin) => origin.artifact_paths),
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
    aggregate: { ...aggregate, best_baseline_methods: undefined },
    forecast: forecast.status === 'ok' ? forecast.summary : forecast,
  }, null, 2));
  if (aggregate.origins_rejected) process.exitCode = 2;
}

try {
  main();
} catch (error) {
  console.error(error.stack || error.message);
  process.exit(1);
}
