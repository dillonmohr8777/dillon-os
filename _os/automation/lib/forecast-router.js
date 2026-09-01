'use strict';

const crypto = require('node:crypto');

const QUANTILE_KEYS = Object.freeze([
  'p10',
  'p20',
  'p30',
  'p40',
  'p50',
  'p60',
  'p70',
  'p80',
  'p90',
]);

const FORBIDDEN_USES = Object.freeze([
  'spend',
  'send',
  'publish',
  'conversion-claim',
]);

const CLIENT_RESEARCH_APPROVALS = Object.freeze({
  'EXP-JASON-HUBSPOT-CHRONOS-20260901': Object.freeze({
    request_id: 'forecast-momentum-360-hubspot-contacts-weekly-20260901',
    client_id: 'momentum-360',
    series_id: 'momentum-360-hubspot-contacts-created-weekly',
    horizon: 12,
    model_id: 'amazon/chronos-2',
    used_for: 'research',
    data_class: 'sanitized-aggregate',
    approval_ref: 'direct-user-approval:2026-09-01-jason-hubspot-chronos-pilot',
    input_fingerprint: 'df776a927381ede70f376cee9a34ae4dd9fd42ace1976c9bde1a28ae75a8ff1e',
    source_locators: Object.freeze([
      'hubspot://portal/50612503/contacts/createdate/weekly?cutoff=2026-06-01',
      'clients/momentum-360/deliverables/2026-09-01-hubspot-chronos-forecast-pilot/inputs/hubspot-forecast-evidence-manifest.json',
    ]),
  }),
});

const MODEL_ROUTES = Object.freeze({
  'amazon/chronos-2': Object.freeze({
    provider_id: 'amazon-science',
    runtime_id: 'chronos-forecasting==2.3.1;torch==2.6.0+cpu',
    license_lane: 'apache-2.0',
    availability: 'sandbox-only',
    minimum_context: 32,
    allowed_uses: Object.freeze(['research']),
    allows_client_series: false,
    capabilities: Object.freeze({
      multivariate_targets: true,
      past_covariates: true,
      past_future_covariates: true,
      covariate_mode: 'native',
    }),
    required_gates: Object.freeze([
      'hardware-preflight',
      'walk-forward-baseline',
      'quantile-calibration',
      'experiment-acceptance',
      'human-promotion-gate',
    ]),
  }),
  'google/timesfm-2.5-200m-pytorch': Object.freeze({
    provider_id: 'google-research',
    runtime_id: 'timesfm[torch]',
    license_lane: 'apache-2.0',
    availability: 'sandbox-only',
    minimum_context: 32,
    allowed_uses: Object.freeze(['research']),
    allows_client_series: false,
    capabilities: Object.freeze({
      multivariate_targets: false,
      past_covariates: false,
      past_future_covariates: true,
      covariate_mode: 'external-xreg',
    }),
    required_gates: Object.freeze([
      'hardware-preflight',
      'experiment-acceptance',
      'human-promotion-gate',
    ]),
  }),
  'google/timesfm-3.0-pytorch': Object.freeze({
    provider_id: 'google-research',
    runtime_id: 'timesfm[torch]==3.0.0',
    license_lane: 'research-only',
    availability: 'sandbox-only',
    minimum_context: 32,
    allowed_uses: Object.freeze(['research']),
    allows_client_series: false,
    capabilities: Object.freeze({
      multivariate_targets: true,
      past_covariates: true,
      past_future_covariates: true,
      covariate_mode: 'native',
    }),
    required_gates: Object.freeze([
      'license-acceptance-authority',
      'hardware-preflight',
      'synthetic-or-public-data-only',
    ]),
  }),
  'bigquery/timesfm-3-managed': Object.freeze({
    provider_id: 'google-cloud-bigquery',
    runtime_id: 'bigquery-ai.forecast',
    license_lane: 'commercial-managed',
    availability: 'not-live',
    minimum_context: 32,
    allowed_uses: Object.freeze([]),
    allows_client_series: false,
    capabilities: Object.freeze({
      multivariate_targets: false,
      past_covariates: false,
      past_future_covariates: false,
      covariate_mode: 'none',
    }),
    required_gates: Object.freeze([
      'managed-service-live-verification',
      'scoped-project-approval',
    ]),
  }),
  'Datadog/Toto-2.0-22m': Object.freeze({
    provider_id: 'datadog',
    runtime_id: 'toto',
    license_lane: 'apache-2.0',
    availability: 'sandbox-only',
    minimum_context: 32,
    allowed_uses: Object.freeze(['research']),
    allows_client_series: false,
    capabilities: Object.freeze({
      multivariate_targets: true,
      past_covariates: false,
      past_future_covariates: false,
      covariate_mode: 'none',
    }),
    required_gates: Object.freeze([
      'python-3.12-runtime',
      'hardware-preflight',
      'walk-forward-baseline',
      'quantile-calibration',
      'experiment-acceptance',
      'human-promotion-gate',
    ]),
  }),
});

const FREQUENCIES = new Set(['hour', 'day', 'week', 'month', 'quarter']);
const USED_FOR = new Set(['agenda-feature', 'automation-evidence', 'research']);

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isIsoDateTime(value) {
  return isNonEmptyString(value)
    && value.includes('T')
    && Number.isFinite(Date.parse(value));
}

function requestInputFingerprint(request) {
  const material = {
    client_id: request?.client_id,
    series_id: request?.series_id,
    cutoff_at: request?.cutoff_at,
    horizon: request?.horizon,
    targets: request?.targets,
    past_covariates: request?.past_covariates,
    past_future_covariates: request?.past_future_covariates,
    source_locators: request?.source_locators,
    model_id: request?.model_id,
  };
  return crypto.createHash('sha256').update(JSON.stringify(material)).digest('hex');
}

function validateClientExperimentShape(value, label, errors) {
  if (!isObject(value)) {
    errors.push(`${label} must be an object`);
    return false;
  }
  for (const key of ['experiment_id', 'approval_ref', 'data_class', 'input_fingerprint']) {
    if (!isNonEmptyString(value[key])) errors.push(`${label}.${key} is required`);
  }
  return true;
}

function resolveClientRequestApproval(request) {
  const reasons = [];
  if (!request?.contains_client_series) return { ok: false, reasons };
  if (!isObject(request.client_experiment)) {
    return { ok: false, reasons: ['client_experiment is required for client series'] };
  }
  const approval = CLIENT_RESEARCH_APPROVALS[request.client_experiment.experiment_id];
  if (!approval) {
    return { ok: false, reasons: ['client_experiment is not registered for local research'] };
  }
  for (const key of ['request_id', 'client_id', 'series_id', 'horizon', 'model_id', 'used_for']) {
    if (request[key] !== approval[key]) reasons.push(`client experiment ${key} does not match approval`);
  }
  for (const key of ['approval_ref', 'data_class', 'input_fingerprint']) {
    if (request.client_experiment[key] !== approval[key]) {
      reasons.push(`client experiment ${key} does not match approval`);
    }
  }
  if (requestInputFingerprint(request) !== approval.input_fingerprint) {
    reasons.push('client experiment input fingerprint does not match approval');
  }
  if (JSON.stringify(request.source_locators) !== JSON.stringify(approval.source_locators)) {
    reasons.push('client experiment source_locators do not match approval');
  }
  return { ok: reasons.length === 0, reasons, experiment_id: request.client_experiment.experiment_id };
}

function resolveClientRunApproval(run) {
  const reasons = [];
  if (!run?.contains_client_series) return { ok: false, reasons };
  if (!isObject(run.client_experiment)) {
    return { ok: false, reasons: ['client_experiment is required for client forecast output'] };
  }
  const approval = CLIENT_RESEARCH_APPROVALS[run.client_experiment.experiment_id];
  if (!approval) {
    return { ok: false, reasons: ['client_experiment is not registered for local research'] };
  }
  for (const key of ['request_id', 'client_id', 'series_id', 'horizon', 'model_id', 'used_for']) {
    if (run[key] !== approval[key]) reasons.push(`client experiment output ${key} does not match approval`);
  }
  for (const key of ['approval_ref', 'data_class', 'input_fingerprint']) {
    if (run.client_experiment[key] !== approval[key]) {
      reasons.push(`client experiment output ${key} does not match approval`);
    }
  }
  if (JSON.stringify(run.source_locators) !== JSON.stringify(approval.source_locators)) {
    reasons.push('client experiment output source_locators do not match approval');
  }
  return { ok: reasons.length === 0, reasons, experiment_id: run.client_experiment.experiment_id };
}

function validateNumericVector(value, label, errors, minimumLength = 1) {
  if (!Array.isArray(value) || value.length < minimumLength) {
    errors.push(`${label} must be an array with at least ${minimumLength} values`);
    return false;
  }
  if (!value.every((item) => typeof item === 'number' && Number.isFinite(item))) {
    errors.push(`${label} must contain only finite numbers`);
    return false;
  }
  return true;
}

function validateNamedSeriesList(value, label, errors, expectedLength, options = {}) {
  if (!Array.isArray(value)) {
    errors.push(`${label} must be an array`);
    return;
  }
  if (options.required && value.length === 0) {
    errors.push(`${label} must contain at least one series`);
    return;
  }
  const seen = new Set();
  value.forEach((series, index) => {
    const prefix = `${label}[${index}]`;
    if (!isObject(series)) {
      errors.push(`${prefix} must be an object`);
      return;
    }
    if (!isNonEmptyString(series.series_id)) {
      errors.push(`${prefix}.series_id is required`);
    } else if (seen.has(series.series_id)) {
      errors.push(`${label} contains duplicate series_id ${series.series_id}`);
    } else {
      seen.add(series.series_id);
    }
    if (validateNumericVector(series.values, `${prefix}.values`, errors, 2)
      && Number.isInteger(expectedLength)
      && series.values.length !== expectedLength) {
      errors.push(`${prefix}.values must contain exactly ${expectedLength} values`);
    }
  });
}

function validateForecastRequest(request) {
  const errors = [];
  if (!isObject(request)) return { ok: false, errors: ['request must be an object'] };

  if (request.schema_version !== 1) errors.push('schema_version must equal 1');
  for (const key of ['request_id', 'series_id', 'client_id', 'frequency', 'model_id', 'license_lane', 'used_for']) {
    if (!isNonEmptyString(request[key])) errors.push(`${key} is required`);
  }
  if (!isIsoDateTime(request.as_of)) errors.push('as_of must be an ISO-8601 date-time');
  if (!isIsoDateTime(request.cutoff_at)) errors.push('cutoff_at must be an ISO-8601 date-time');
  if (!isIsoDateTime(request.source_observed_at)) {
    errors.push('source_observed_at must be an ISO-8601 date-time');
  }
  if (isIsoDateTime(request.as_of) && isIsoDateTime(request.source_observed_at)) {
    const sourceAgeHours = (Date.parse(request.as_of) - Date.parse(request.source_observed_at)) / 3600000;
    if (sourceAgeHours < 0) errors.push('source_observed_at may not be after as_of');
    if (Number.isFinite(request.max_source_age_hours)
      && sourceAgeHours > request.max_source_age_hours) {
      errors.push(`source is stale by ${sourceAgeHours.toFixed(2)} hours`);
    }
  }
  if (isIsoDateTime(request.cutoff_at)
    && isIsoDateTime(request.source_observed_at)
    && Date.parse(request.cutoff_at) > Date.parse(request.source_observed_at)) {
    errors.push('cutoff_at may not be after source_observed_at');
  }
  if (typeof request.max_source_age_hours !== 'number'
    || !Number.isFinite(request.max_source_age_hours)
    || request.max_source_age_hours <= 0) {
    errors.push('max_source_age_hours must be a positive number');
  }
  if (!Number.isInteger(request.horizon) || request.horizon < 1) {
    errors.push('horizon must be a positive integer');
  }
  if (!FREQUENCIES.has(request.frequency)) {
    errors.push(`frequency must be one of ${Array.from(FREQUENCIES).join(', ')}`);
  }
  if (!USED_FOR.has(request.used_for)) {
    errors.push(`used_for must be one of ${Array.from(USED_FOR).join(', ')}`);
  }
  if (typeof request.contains_client_series !== 'boolean') {
    errors.push('contains_client_series must be a boolean');
  }
  if (typeof request.route_verified !== 'boolean') {
    errors.push('route_verified must be a boolean');
  } else if (request.route_verified !== true) {
    errors.push('route_verified must be true');
  }
  if (request.cadence_verified !== true) {
    errors.push('cadence_verified must be true');
  }
  if (request.leakage_checked !== true) {
    errors.push('leakage_checked must be true');
  }
  if (!Array.isArray(request.source_locators)
    || request.source_locators.length === 0
    || request.source_locators.some((locator) => !isNonEmptyString(locator))) {
    errors.push('source_locators must contain at least one non-empty locator');
  }

  validateNamedSeriesList(request.targets, 'targets', errors, null, { required: true });
  const contextLength = Array.isArray(request.targets)
    && request.targets.length > 0
    && Array.isArray(request.targets[0]?.values)
    ? request.targets[0].values.length
    : null;

  if (Number.isInteger(contextLength)) {
    validateNamedSeriesList(request.targets, 'targets', errors, contextLength, { required: true });
    validateNamedSeriesList(request.past_covariates || [], 'past_covariates', errors, contextLength);
    const futureLength = Number.isInteger(request.horizon)
      ? contextLength + request.horizon
      : null;
    validateNamedSeriesList(
      request.past_future_covariates || [],
      'past_future_covariates',
      errors,
      futureLength,
    );
  }

  if (request.contains_client_series) {
    if (request.client_id === 'portfolio/system') {
      errors.push('client_id must be an exact client route when contains_client_series is true');
    }
    validateClientExperimentShape(request.client_experiment, 'client_experiment', errors);
  } else if (request.client_experiment !== undefined) {
    errors.push('client_experiment is allowed only when contains_client_series is true');
  }

  return { ok: errors.length === 0, errors };
}

function routeForecastRequest(request) {
  const validation = validateForecastRequest(request);
  const reasons = [...validation.errors];
  const clientApproval = resolveClientRequestApproval(request);
  reasons.push(...clientApproval.reasons);
  const model = MODEL_ROUTES[request?.model_id];
  const contextLength = Array.isArray(request?.targets)
    && Array.isArray(request.targets[0]?.values)
    ? request.targets[0].values.length
    : null;
  const targetCount = Array.isArray(request?.targets) ? request.targets.length : null;
  const pastCovariateCount = Array.isArray(request?.past_covariates)
    ? request.past_covariates.length
    : null;
  const pastFutureCovariateCount = Array.isArray(request?.past_future_covariates)
    ? request.past_future_covariates.length
    : null;

  if (!model) {
    reasons.push(`model_id is not registered: ${request?.model_id || '(missing)'}`);
  } else {
    if (request.license_lane !== model.license_lane) {
      reasons.push(
        `license_lane ${request.license_lane} does not match ${request.model_id} (${model.license_lane})`,
      );
    }
    if (model.availability === 'not-live') {
      reasons.push(`${request.model_id} is not live or verified for Dillon OS`);
    }
    if (request.contains_client_series && !model.allows_client_series && !clientApproval.ok) {
      reasons.push(`${request.model_id} may not receive client series in its current lane`);
    }
    if (!model.allowed_uses.includes(request.used_for)) {
      reasons.push(`${request.model_id} is not approved for used_for=${request.used_for}`);
    }
    if (Number.isInteger(contextLength) && contextLength < model.minimum_context) {
      reasons.push(
        `${request.model_id} requires at least ${model.minimum_context} contiguous observations for this Dillon OS lane`,
      );
    }
    if (Number.isInteger(targetCount)
      && targetCount > 1
      && !model.capabilities.multivariate_targets) {
      reasons.push(`${request.model_id} does not support joint multivariate targets`);
    }
    if (Number.isInteger(pastCovariateCount)
      && pastCovariateCount > 0
      && !model.capabilities.past_covariates) {
      reasons.push(`${request.model_id} does not support past-only covariates`);
    }
    if (Number.isInteger(pastFutureCovariateCount)
      && pastFutureCovariateCount > 0
      && !model.capabilities.past_future_covariates) {
      reasons.push(`${request.model_id} does not support known-future covariates`);
    }
  }

  return {
    schema_version: 1,
    request_id: request?.request_id || null,
    evaluated_at: new Date().toISOString(),
    status: reasons.length === 0 ? 'sandbox-eligible' : 'blocked',
    model_id: request?.model_id || null,
    provider_id: model?.provider_id || null,
    runtime_id: model?.runtime_id || null,
    license_lane: request?.license_lane || null,
    used_for: request?.used_for || null,
    contains_client_series: request?.contains_client_series ?? null,
    client_experiment_authorized: clientApproval.ok,
    client_experiment_id: clientApproval.experiment_id || null,
    context_length: contextLength,
    target_count: targetCount,
    reasons,
    required_gates: model ? [...model.required_gates] : [],
    capabilities: model ? { ...model.capabilities } : null,
    forbidden_uses: [...FORBIDDEN_USES],
    authority: 'evidence-only',
    model_executed: false,
  };
}

function validateForecastRun(run) {
  const errors = [];
  if (!isObject(run)) return { ok: false, errors: ['run must be an object'] };

  if (run.schema_version !== 1) errors.push('schema_version must equal 1');
  for (const key of ['run_id', 'request_id', 'series_id', 'client_id', 'model_id', 'provider_id', 'runtime_id', 'license_lane', 'used_for', 'status']) {
    if (!isNonEmptyString(run[key])) errors.push(`${key} is required`);
  }
  if (!isIsoDateTime(run.as_of)) errors.push('as_of must be an ISO-8601 date-time');
  if (!Number.isInteger(run.horizon) || run.horizon < 1) {
    errors.push('horizon must be a positive integer');
  }
  if (!['ok', 'blocked', 'error', 'dry-run'].includes(run.status)) {
    errors.push('status must be ok, blocked, error, or dry-run');
  }
  if (!USED_FOR.has(run.used_for)) {
    errors.push(`used_for must be one of ${Array.from(USED_FOR).join(', ')}`);
  }
  if (typeof run.contains_client_series !== 'boolean') {
    errors.push('contains_client_series must be a boolean');
  }
  if (run.contains_client_series) {
    validateClientExperimentShape(run.client_experiment, 'client_experiment', errors);
  } else if (run.client_experiment !== undefined) {
    errors.push('client_experiment is allowed only when contains_client_series is true');
  }
  if (!Array.isArray(run.source_locators)
    || run.source_locators.length === 0
    || run.source_locators.some((locator) => !isNonEmptyString(locator))) {
    errors.push('source_locators must contain at least one non-empty locator');
  }
  for (const forbidden of FORBIDDEN_USES) {
    if (!Array.isArray(run.forbidden_uses) || !run.forbidden_uses.includes(forbidden)) {
      errors.push(`forbidden_uses must include ${forbidden}`);
    }
  }

  const model = MODEL_ROUTES[run.model_id];
  const clientApproval = resolveClientRunApproval(run);
  errors.push(...clientApproval.reasons);
  if (!model) {
    errors.push(`model_id is not registered: ${run.model_id || '(missing)'}`);
  } else {
    if (run.license_lane !== model.license_lane) {
      errors.push(`license_lane does not match ${run.model_id}`);
    }
    if (run.provider_id !== model.provider_id) {
      errors.push(`provider_id does not match ${run.model_id}`);
    }
    if (run.runtime_id !== model.runtime_id) {
      errors.push(`runtime_id does not match ${run.model_id}`);
    }
    if (run.status === 'ok' && model.availability === 'not-live') {
      errors.push(`${run.model_id} may not produce an ok run before live verification`);
    }
    if (run.contains_client_series && !model.allows_client_series && !clientApproval.ok) {
      errors.push(`${run.model_id} output may not contain client series in its current lane`);
    }
    if (!model.allowed_uses.includes(run.used_for)) {
      errors.push(`${run.model_id} output is not approved for used_for=${run.used_for}`);
    }
  }

  const outputs = run.target_outputs;
  if (run.status === 'ok' && (!Array.isArray(outputs) || outputs.length === 0)) {
    errors.push('target_outputs is required when status is ok');
  }
  if (Array.isArray(outputs)) {
    const seen = new Set();
    outputs.forEach((output, outputIndex) => {
      const prefix = `target_outputs[${outputIndex}]`;
      if (!isObject(output)) {
        errors.push(`${prefix} must be an object`);
        return;
      }
      if (!isNonEmptyString(output.series_id)) {
        errors.push(`${prefix}.series_id is required`);
      } else if (seen.has(output.series_id)) {
        errors.push(`target_outputs contains duplicate series_id ${output.series_id}`);
      } else {
        seen.add(output.series_id);
      }
      const pointOk = validateNumericVector(output.point, `${prefix}.point`, errors, 1);
      if (pointOk && Number.isInteger(run.horizon) && output.point.length !== run.horizon) {
        errors.push(`${prefix}.point must contain exactly ${run.horizon} values`);
      }
      if (!isObject(output.quantiles)) {
        errors.push(`${prefix}.quantiles must be an object`);
        return;
      }
      for (const key of QUANTILE_KEYS) {
        const vector = output.quantiles[key];
        const vectorOk = validateNumericVector(vector, `${prefix}.quantiles.${key}`, errors, 1);
        if (vectorOk && Number.isInteger(run.horizon) && vector.length !== run.horizon) {
          errors.push(`${prefix}.quantiles.${key} must contain exactly ${run.horizon} values`);
        }
      }
      const keys = Object.keys(output.quantiles).sort();
      const expectedKeys = [...QUANTILE_KEYS].sort();
      if (keys.join('|') !== expectedKeys.join('|')) {
        errors.push(`${prefix}.quantiles must contain exactly p10 through p90`);
      }
      if (QUANTILE_KEYS.every((key) => Array.isArray(output.quantiles[key]))) {
        for (let step = 0; step < run.horizon; step += 1) {
          const values = QUANTILE_KEYS.map((key) => output.quantiles[key][step]);
          if (values.every((value) => typeof value === 'number' && Number.isFinite(value))) {
            for (let index = 1; index < values.length; index += 1) {
              if (values[index] < values[index - 1]) {
                errors.push(`${prefix}.quantiles cross at horizon index ${step}`);
                break;
              }
            }
          }
        }
      }
      if (run.model_id.startsWith('google/timesfm-')
        && Array.isArray(output.point)
        && Array.isArray(output.quantiles.p50)
        && output.point.length === output.quantiles.p50.length) {
        const differs = output.point.some(
          (value, index) => Math.abs(value - output.quantiles.p50[index]) > 1e-6,
        );
        if (differs) errors.push(`${prefix}.point must equal p50 for TimesFM outputs`);
      }
    });
  }

  return { ok: errors.length === 0, errors };
}

module.exports = {
  CLIENT_RESEARCH_APPROVALS,
  FORBIDDEN_USES,
  MODEL_ROUTES,
  QUANTILE_KEYS,
  routeForecastRequest,
  validateForecastRequest,
  validateForecastRun,
};
