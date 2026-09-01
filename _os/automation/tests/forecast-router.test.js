'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const { repoPath } = require('../lib/fsutil');
const {
  routeForecastRequest,
  validateForecastRequest,
  validateForecastRun,
} = require('../lib/forecast-router');

function fixture() {
  return JSON.parse(fs.readFileSync(
    repoPath('_os/automation/fixtures/forecast/synthetic-timesfm3-request.json'),
    'utf8',
  ));
}

function chronosFixture() {
  return JSON.parse(fs.readFileSync(
    repoPath('_os/automation/fixtures/forecast/synthetic-chronos2-request.json'),
    'utf8',
  ));
}

function validRun() {
  const quantiles = {};
  for (let percentile = 10; percentile <= 90; percentile += 10) {
    quantiles[`p${percentile}`] = [
      percentile / 10,
      percentile / 10 + 1,
      percentile / 10 + 2,
      percentile / 10 + 3,
    ];
  }
  return {
    schema_version: 1,
    run_id: 'forecast-run-synthetic-001',
    request_id: 'forecast-synthetic-promotion-001',
    as_of: '2026-09-01T17:45:00.000Z',
    client_id: 'portfolio/system',
    series_id: 'synthetic-promotion-demand',
    model_id: 'google/timesfm-3.0-pytorch',
    provider_id: 'google-research',
    runtime_id: 'timesfm[torch]==3.0.0',
    license_lane: 'research-only',
    used_for: 'research',
    horizon: 4,
    contains_client_series: false,
    source_locators: ['synthetic://forecast-router/promotion-demo'],
    status: 'ok',
    forbidden_uses: ['spend', 'send', 'publish', 'conversion-claim'],
    target_outputs: [{
      series_id: 'synthetic-demand',
      point: [...quantiles.p50],
      quantiles,
    }],
  };
}

test('synthetic TimesFM-3 research request is sandbox-eligible without executing a model', () => {
  const request = fixture();
  assert.deepEqual(validateForecastRequest(request), { ok: true, errors: [] });
  const receipt = routeForecastRequest(request);
  assert.equal(receipt.status, 'sandbox-eligible');
  assert.equal(receipt.model_executed, false);
  assert.equal(receipt.authority, 'evidence-only');
  assert.ok(receipt.required_gates.includes('license-acceptance-authority'));
});

test('TimesFM-3 client or automation use fails closed', () => {
  const request = fixture();
  request.client_id = 'momentum-360';
  request.contains_client_series = true;
  request.used_for = 'automation-evidence';
  const receipt = routeForecastRequest(request);
  assert.equal(receipt.status, 'blocked');
  assert.ok(receipt.reasons.some((reason) => reason.includes('may not receive client series')));
  assert.ok(receipt.reasons.some((reason) => reason.includes('used_for=automation-evidence')));
});

test('model and license lane mismatch fails closed', () => {
  const request = fixture();
  request.license_lane = 'apache-2.0';
  const receipt = routeForecastRequest(request);
  assert.equal(receipt.status, 'blocked');
  assert.ok(receipt.reasons.some((reason) => reason.includes('does not match')));
});

test('past-future covariates must cover context plus the entire horizon', () => {
  const request = fixture();
  request.past_future_covariates[0].values.pop();
  const validation = validateForecastRequest(request);
  assert.equal(validation.ok, false);
  assert.ok(validation.errors.some((error) => error.includes('exactly 36 values')));
});

test('Dillon OS lane abstains below one complete 32-step context patch', () => {
  const request = fixture();
  request.targets[0].values = request.targets[0].values.slice(0, 21);
  request.past_covariates[0].values = request.past_covariates[0].values.slice(0, 21);
  request.past_future_covariates[0].values = request.past_future_covariates[0].values.slice(0, 25);
  const receipt = routeForecastRequest(request);
  assert.equal(receipt.status, 'blocked');
  assert.equal(receipt.context_length, 21);
  assert.ok(receipt.reasons.some((reason) => reason.includes('at least 32 contiguous observations')));
});

test('stale, irregular, or leakage-unchecked sources fail closed', () => {
  const stale = fixture();
  stale.source_observed_at = '2026-08-30T17:30:00.000Z';
  assert.ok(routeForecastRequest(stale).reasons.some((reason) => reason.includes('source is stale')));

  const irregular = fixture();
  irregular.cadence_verified = false;
  assert.ok(routeForecastRequest(irregular).reasons.includes('cadence_verified must be true'));

  const unchecked = fixture();
  unchecked.leakage_checked = false;
  assert.ok(routeForecastRequest(unchecked).reasons.includes('leakage_checked must be true'));
});

test('TimesFM 2.5 remains research-only until the experiment promotion gate passes', () => {
  const request = fixture();
  request.model_id = 'google/timesfm-2.5-200m-pytorch';
  request.license_lane = 'apache-2.0';
  request.client_id = 'align-hcm';
  request.contains_client_series = true;
  request.used_for = 'agenda-feature';
  const receipt = routeForecastRequest(request);
  assert.equal(receipt.status, 'blocked');
  assert.ok(receipt.required_gates.includes('experiment-acceptance'));
  assert.ok(receipt.reasons.some((reason) => reason.includes('past-only covariates')));
});

test('Chronos-2 is the license-permissive native-covariate canary, not a promoted production route', () => {
  const request = chronosFixture();
  assert.deepEqual(validateForecastRequest(request), { ok: true, errors: [] });
  const receipt = routeForecastRequest(request);
  assert.equal(receipt.status, 'sandbox-eligible');
  assert.equal(receipt.provider_id, 'amazon-science');
  assert.equal(receipt.runtime_id, 'chronos-forecasting>=2.0');
  assert.deepEqual(receipt.capabilities, {
    multivariate_targets: true,
    past_covariates: true,
    past_future_covariates: true,
    covariate_mode: 'native',
  });
  assert.ok(receipt.required_gates.includes('walk-forward-baseline'));
  assert.ok(receipt.required_gates.includes('quantile-calibration'));
  assert.equal(receipt.model_executed, false);

  request.client_id = 'align-hcm';
  request.contains_client_series = true;
  request.used_for = 'automation-evidence';
  const blocked = routeForecastRequest(request);
  assert.equal(blocked.status, 'blocked');
  assert.ok(blocked.reasons.some((reason) => reason.includes('may not receive client series')));
  assert.ok(blocked.reasons.some((reason) => reason.includes('used_for=automation-evidence')));
});

test('model capability mismatches fail closed instead of implying TimesFM-3 parity', () => {
  const xreg = fixture();
  xreg.model_id = 'google/timesfm-2.5-200m-pytorch';
  xreg.license_lane = 'apache-2.0';
  xreg.targets.push({
    series_id: 'synthetic-replies',
    values: [...xreg.targets[0].values],
  });
  const xregReceipt = routeForecastRequest(xreg);
  assert.equal(xregReceipt.status, 'blocked');
  assert.ok(xregReceipt.reasons.some((reason) => reason.includes('joint multivariate targets')));
  assert.ok(xregReceipt.reasons.some((reason) => reason.includes('past-only covariates')));

  const toto = fixture();
  toto.model_id = 'Datadog/Toto-2.0-22m';
  toto.license_lane = 'apache-2.0';
  const covariateReceipt = routeForecastRequest(toto);
  assert.equal(covariateReceipt.status, 'blocked');
  assert.ok(covariateReceipt.reasons.some((reason) => reason.includes('past-only covariates')));
  assert.ok(covariateReceipt.reasons.some((reason) => reason.includes('known-future covariates')));

  toto.past_covariates = [];
  toto.past_future_covariates = [];
  const noCovariateReceipt = routeForecastRequest(toto);
  assert.equal(noCovariateReceipt.status, 'sandbox-eligible');
  assert.equal(noCovariateReceipt.capabilities.covariate_mode, 'none');
});

test('managed TimesFM-3 route stays blocked until it is live-verified', () => {
  const request = fixture();
  request.model_id = 'bigquery/timesfm-3-managed';
  request.license_lane = 'commercial-managed';
  const receipt = routeForecastRequest(request);
  assert.equal(receipt.status, 'blocked');
  assert.ok(receipt.reasons.some((reason) => reason.includes('not live or verified')));
});

test('run validation cannot bypass model availability, use, or client-data gates', () => {
  const clientRun = validRun();
  clientRun.model_id = 'google/timesfm-2.5-200m-pytorch';
  clientRun.provider_id = 'google-research';
  clientRun.runtime_id = 'timesfm[torch]';
  clientRun.license_lane = 'apache-2.0';
  clientRun.used_for = 'automation-evidence';
  clientRun.contains_client_series = true;
  const clientResult = validateForecastRun(clientRun);
  assert.equal(clientResult.ok, false);
  assert.ok(clientResult.errors.some((error) => error.includes('client series')));
  assert.ok(clientResult.errors.some((error) => error.includes('used_for=automation-evidence')));

  const managedRun = validRun();
  managedRun.model_id = 'bigquery/timesfm-3-managed';
  managedRun.provider_id = 'google-cloud-bigquery';
  managedRun.runtime_id = 'bigquery-ai.forecast';
  managedRun.license_lane = 'commercial-managed';
  managedRun.used_for = 'research';
  const managedResult = validateForecastRun(managedRun);
  assert.equal(managedResult.ok, false);
  assert.ok(managedResult.errors.some((error) => error.includes('before live verification')));

  const mismatchedRuntime = validRun();
  mismatchedRuntime.provider_id = 'unknown-provider';
  mismatchedRuntime.runtime_id = 'unknown-runtime';
  const mismatchResult = validateForecastRun(mismatchedRuntime);
  assert.equal(mismatchResult.ok, false);
  assert.ok(mismatchResult.errors.some((error) => error.includes('provider_id does not match')));
  assert.ok(mismatchResult.errors.some((error) => error.includes('runtime_id does not match')));
});

test('forecast output requires full monotonic p10-p90 bands and TimesFM point equals p50', () => {
  const run = validRun();
  assert.deepEqual(validateForecastRun(run), { ok: true, errors: [] });

  run.target_outputs[0].quantiles.p70[2] = 0;
  run.target_outputs[0].point[0] += 0.25;
  const invalid = validateForecastRun(run);
  assert.equal(invalid.ok, false);
  assert.ok(invalid.errors.some((error) => error.includes('quantiles cross')));
  assert.ok(invalid.errors.some((error) => error.includes('point must equal p50')));
});

test('forecast-run JSON schema records all nine quantile keys', () => {
  const requestSchema = JSON.parse(fs.readFileSync(
    repoPath('12_Brain/schemas/forecast-request.json'),
    'utf8',
  ));
  const schema = JSON.parse(fs.readFileSync(
    repoPath('12_Brain/schemas/forecast-run.json'),
    'utf8',
  ));
  assert.ok(requestSchema.properties.model_id.enum.includes('amazon/chronos-2'));
  assert.ok(requestSchema.properties.model_id.enum.includes('Datadog/Toto-2.0-22m'));
  assert.ok(schema.required.includes('provider_id'));
  assert.ok(schema.required.includes('runtime_id'));
  const quantileProperties = schema.$defs.quantiles.properties;
  assert.deepEqual(Object.keys(quantileProperties).sort(), [
    'p10', 'p20', 'p30', 'p40', 'p50', 'p60', 'p70', 'p80', 'p90',
  ]);
});
