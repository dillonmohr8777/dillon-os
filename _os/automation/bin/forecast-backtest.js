#!/usr/bin/env node
'use strict';

// Rolling-origin backtest for a registered rolling client research approval.
// Evidence only: it cannot spend, send, publish, or promote a model.

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const {
  CLIENT_RESEARCH_APPROVALS,
  requestInputFingerprint,
  routeForecastRequest,
  validateForecastRun,
} = require('../lib/forecast-router');

const DEFAULT_EXPERIMENT = 'EXP-JASON-HUBSPOT-CHRONOS-BACKTEST-20260902';
const DEFAULT_SOURCE_OBSERVED_AT = '2026-09-01T20:58:23.653Z';

function argValue(name, fallback = null) {
  const index = process.argv.indexOf(name);
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
}
const hasFlag = (name) => process.argv.includes(name);

function weekStartIso(from, index) {
  const date = new Date(`${from}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + index * 7);
  return date.toISOString();
}

function readSeriesCsv(file) {
  return fs.readFileSync(file, 'utf8').trim().split(/\r?\n/).slice(1)
    .map((line) => Number(line.split(',')[2]));
}

function metrics(pred, actual) {
  const abs = pred.map((p, i) => Math.abs(p - actual[i]));
  const mae = abs.reduce((a, b) => a + b, 0) / abs.length;
  const wape = abs.reduce((a, b) => a + b, 0) / Math.max(1e-9, actual.reduce((a, b) => a + Math.abs(b), 0));
  const smape = pred.reduce((sum, p, i) => sum + (2 * Math.abs(p - actual[i])) / Math.max(1e-9, Math.abs(p) + Math.abs(actual[i])), 0) / pred.length;
  return { mae: +mae.toFixed(4), wape: +(wape * 100).toFixed(2), smape: +(smape * 100).toFixed(2) };
}

function buildRequest(approval, origin, asOf, sourceObservedAt) {
  const request = {
    schema_version: 1,
    request_id: `${approval.request_id_prefix}-origin-${origin}`,
    as_of: asOf,
    cutoff_at: weekStartIso(approval.series_week_starts_from, origin - 1),
    source_observed_at: sourceObservedAt,
    max_source_age_hours: 720,
    client_id: approval.client_id,
    route_verified: true,
    cadence_verified: true,
    leakage_checked: true,
    series_id: approval.series_id,
    frequency: 'week',
    horizon: approval.horizon,
    targets: [{ series_id: 'hubspot_contacts_created', values: approval.series_values.slice(0, origin) }],
    past_covariates: [],
    past_future_covariates: [],
    source_locators: [...approval.source_locators],
    contains_client_series: true,
    model_id: approval.model_id,
    license_lane: 'apache-2.0',
    used_for: approval.used_for,
  };
  request.client_experiment = {
    experiment_id: DEFAULT_EXPERIMENT,
    approval_ref: approval.approval_ref,
    data_class: approval.data_class,
    backtest_origin: origin,
    input_fingerprint: requestInputFingerprint(request),
  };
  return request;
}

function runChronos(requestPath, runPath) {
  const script = path.join(__dirname, 'forecast-chronos2.ps1');
  const result = spawnSync('powershell', [
    '-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', script,
    '-RequestPath', requestPath, '-OutputPath', runPath,
  ], { encoding: 'utf8', timeout: 15 * 60 * 1000 });
  return { code: result.status, stderr: (result.stderr || '').trim().slice(-800) };
}

function main() {
  const experimentId = argValue('--experiment', DEFAULT_EXPERIMENT);
  const approval = CLIENT_RESEARCH_APPROVALS[experimentId];
  if (!approval || !approval.rolling) throw new Error(`${experimentId} is not a registered rolling approval`);

  const seriesCsv = argValue('--series');
  if (seriesCsv) {
    const csv = readSeriesCsv(path.resolve(seriesCsv));
    const approved = approval.series_values;
    const prefixMatches = JSON.stringify(csv.slice(0, approved.length)) === JSON.stringify(approved);
    if (!prefixMatches) throw new Error('Series CSV differs from the approved series. Register a new rolling approval; do not edit history.');
    if (csv.length > approved.length) {
      console.log(JSON.stringify({ status: 'new-data', new_rows: csv.length - approved.length, action: 'register a new rolling approval before forecasting the extended series' }, null, 2));
      process.exitCode = 2;
      return;
    }
  }

  const outDir = path.resolve(argValue('--out', path.join(process.env.LOCALAPPDATA || os.tmpdir(), 'Codex', 'Forecasting', 'backtests', experimentId)));
  fs.mkdirSync(path.join(outDir, 'requests'), { recursive: true });
  fs.mkdirSync(path.join(outDir, 'runs'), { recursive: true });
  const dryRun = hasFlag('--dry-run');
  const asOf = new Date().toISOString();
  const sourceObservedAt = argValue('--source-observed-at', DEFAULT_SOURCE_OBSERVED_AT);
  const maxOrigin = approval.series_values.length - approval.horizon;
  const origins = [];
  for (let k = approval.min_context; k <= maxOrigin; k += 1) origins.push(k);

  const perOrigin = [];
  for (const origin of origins) {
    const request = buildRequest(approval, origin, asOf, sourceObservedAt);
    const requestPath = path.join(outDir, 'requests', `${request.request_id}.json`);
    fs.writeFileSync(requestPath, JSON.stringify(request, null, 2));
    const route = routeForecastRequest(request);
    const row = { origin, cutoff_at: request.cutoff_at, route_status: route.status, route_reasons: route.reasons };
    if (route.status !== 'sandbox-eligible' || dryRun) { perOrigin.push(row); continue; }

    const runPath = path.join(outDir, 'runs', `${request.request_id}-run.json`);
    const exec = runChronos(requestPath, runPath);
    row.exit_code = exec.code;
    if (!fs.existsSync(runPath)) { row.error = exec.stderr || 'no run artifact'; perOrigin.push(row); continue; }
    const run = JSON.parse(fs.readFileSync(runPath, 'utf8'));
    const validation = validateForecastRun(run);
    row.run_status = run.status;
    row.run_valid = validation.ok;
    row.run_errors = validation.errors;
    if (run.status !== 'ok' || !validation.ok) { perOrigin.push(row); continue; }

    const context = approval.series_values.slice(0, origin);
    const actual = approval.series_values.slice(origin, origin + approval.horizon);
    const out = run.target_outputs[0];
    const persistence = actual.map(() => context[context.length - 1]);
    const trailingMean = context.slice(-4).reduce((a, b) => a + b, 0) / 4;
    const trailing = actual.map(() => trailingMean);
    const covered = actual.filter((a, i) => a >= out.quantiles.p10[i] && a <= out.quantiles.p90[i]).length;
    row.actual = actual;
    row.chronos = metrics(out.point, actual);
    row.persistence = metrics(persistence, actual);
    row.trailing_four_week_mean = metrics(trailing, actual);
    row.p10_p90_coverage = +(covered / actual.length).toFixed(4);
    row.mean_interval_width = +(out.quantiles.p90.reduce((s, v, i) => s + (v - out.quantiles.p10[i]), 0) / actual.length).toFixed(2);
    row.chronos_beats_persistence = row.chronos.wape < row.persistence.wape;
    perOrigin.push(row);
  }

  const scored = perOrigin.filter((r) => r.chronos);
  const mean = (key, sub) => (scored.length ? +(scored.reduce((s, r) => s + r[key][sub], 0) / scored.length).toFixed(2) : null);
  const wins = scored.filter((r) => r.chronos_beats_persistence).length;
  const coverage = scored.length ? +(scored.reduce((s, r) => s + r.p10_p90_coverage, 0) / scored.length).toFixed(4) : null;
  const gates = {
    walk_forward_baseline: scored.length > 0 && wins * 3 >= scored.length * 2,
    quantile_calibration: coverage !== null && coverage >= 0.7 && coverage <= 0.9,
  };
  const receipt = {
    schema_version: 1,
    experiment_id: experimentId,
    approval_ref: approval.approval_ref,
    generated_at: asOf,
    mode: dryRun ? 'dry-run' : 'executed',
    model_id: approval.model_id,
    horizon: approval.horizon,
    origins_planned: origins.length,
    origins_scored: scored.length,
    summary: scored.length ? {
      chronos_mean_wape: mean('chronos', 'wape'),
      persistence_mean_wape: mean('persistence', 'wape'),
      trailing_four_week_mean_wape: mean('trailing_four_week_mean', 'wape'),
      chronos_wins_vs_persistence: `${wins}/${scored.length}`,
      mean_p10_p90_coverage: coverage,
    } : null,
    gates,
    decision: gates.walk_forward_baseline && gates.quantile_calibration ? 'promotion-candidate-pending-human-gate' : 'retain-evidence-only',
    forbidden_uses: ['spend', 'send', 'publish', 'conversion-claim'],
    authority: 'evidence-only',
    origins: perOrigin,
  };
  fs.writeFileSync(path.join(outDir, 'backtest-receipt.json'), JSON.stringify(receipt, null, 2));

  const lines = [
    `# Rolling-origin backtest: ${experimentId}`, '',
    `Generated ${asOf}. Mode: ${receipt.mode}. Decision: **${receipt.decision}**.`, '',
    '| Origin | Cutoff week | Chronos WAPE | Persistence WAPE | Trailing-4 WAPE | p10-p90 coverage | Beats persistence |',
    '| ---: | --- | ---: | ---: | ---: | ---: | --- |',
    ...scored.map((r) => `| ${r.origin} | ${r.cutoff_at.slice(0, 10)} | ${r.chronos.wape}% | ${r.persistence.wape}% | ${r.trailing_four_week_mean.wape}% | ${(r.p10_p90_coverage * 100).toFixed(0)}% | ${r.chronos_beats_persistence ? 'yes' : 'no'} |`),
    '',
    receipt.summary ? `Mean WAPE: Chronos ${receipt.summary.chronos_mean_wape}%, persistence ${receipt.summary.persistence_mean_wape}%, trailing-4 ${receipt.summary.trailing_four_week_mean_wape}%. Wins ${receipt.summary.chronos_wins_vs_persistence}. Coverage ${(coverage * 100).toFixed(1)}% (target 80%).` : 'No origins scored.',
    '', 'Gates: walk-forward-baseline ' + (gates.walk_forward_baseline ? 'PASS' : 'FAIL') + ', quantile-calibration ' + (gates.quantile_calibration ? 'PASS' : 'FAIL') + '. Human promotion gate not evaluated here.',
    '', 'Evidence only. Contacts created are CRM activity, not leads, conversions, or revenue.',
  ];
  fs.writeFileSync(path.join(outDir, 'backtest-summary.md'), `${lines.join('\n')}\n`);
  console.log(JSON.stringify({ out_dir: outDir, decision: receipt.decision, summary: receipt.summary, gates, origins_scored: scored.length, unscored: perOrigin.filter((r) => !r.chronos).map((r) => ({ origin: r.origin, route_status: r.route_status, run_status: r.run_status, error: r.error, reasons: r.route_reasons?.length ? r.route_reasons : r.run_errors })) }, null, 2));
  if (!dryRun && scored.length !== origins.length) process.exitCode = 1;
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
