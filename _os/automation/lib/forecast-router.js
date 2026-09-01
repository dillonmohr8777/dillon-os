'use strict';

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

const MODEL_ROUTES = Object.freeze({
  'google/timesfm-2.5-200m-pytorch': Object.freeze({
    license_lane: 'apache-2.0',
    availability: 'sandbox-only',
    minimum_context: 32,
    allowed_uses: Object.freeze(['research']),
    allows_client_series: false,
    required_gates: Object.freeze([
      'hardware-preflight',
      'experiment-acceptance',
      'human-promotion-gate',
    ]),
  }),
  'google/timesfm-3.0-pytorch': Object.freeze({
    license_lane: 'research-only',
    availability: 'sandbox-only',
    minimum_context: 32,
    allowed_uses: Object.freeze(['research']),
    allows_client_series: false,
    required_gates: Object.freeze([
      'license-acceptance-authority',
      'hardware-preflight',
      'synthetic-or-public-data-only',
    ]),
  }),
  'bigquery/timesfm-3-managed': Object.freeze({
    license_lane: 'commercial-managed',
    availability: 'not-live',
    minimum_context: 32,
    allowed_uses: Object.freeze([]),
    allows_client_series: false,
    required_gates: Object.freeze([
      'managed-service-live-verification',
      'scoped-project-approval',
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
  }

  return { ok: errors.length === 0, errors };
}

function routeForecastRequest(request) {
  const validation = validateForecastRequest(request);
  const reasons = [...validation.errors];
  const model = MODEL_ROUTES[request?.model_id];
  const contextLength = Array.isArray(request?.targets)
    && Array.isArray(request.targets[0]?.values)
    ? request.targets[0].values.length
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
    if (request.contains_client_series && !model.allows_client_series) {
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
  }

  return {
    schema_version: 1,
    request_id: request?.request_id || null,
    evaluated_at: new Date().toISOString(),
    status: reasons.length === 0 ? 'sandbox-eligible' : 'blocked',
    model_id: request?.model_id || null,
    license_lane: request?.license_lane || null,
    used_for: request?.used_for || null,
    contains_client_series: request?.contains_client_series ?? null,
    context_length: contextLength,
    reasons,
    required_gates: model ? [...model.required_gates] : [],
    forbidden_uses: [...FORBIDDEN_USES],
    authority: 'evidence-only',
    model_executed: false,
  };
}

function validateForecastRun(run) {
  const errors = [];
  if (!isObject(run)) return { ok: false, errors: ['run must be an object'] };

  if (run.schema_version !== 1) errors.push('schema_version must equal 1');
  for (const key of ['run_id', 'request_id', 'series_id', 'client_id', 'model_id', 'license_lane', 'used_for', 'status']) {
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
  if (!model) {
    errors.push(`model_id is not registered: ${run.model_id || '(missing)'}`);
  } else {
    if (run.license_lane !== model.license_lane) {
      errors.push(`license_lane does not match ${run.model_id}`);
    }
    if (run.status === 'ok' && model.availability === 'not-live') {
      errors.push(`${run.model_id} may not produce an ok run before live verification`);
    }
    if (run.contains_client_series && !model.allows_client_series) {
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
  FORBIDDEN_USES,
  MODEL_ROUTES,
  QUANTILE_KEYS,
  routeForecastRequest,
  validateForecastRequest,
  validateForecastRun,
};
