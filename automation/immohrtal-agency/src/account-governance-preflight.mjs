const REQUIRED_SOURCE_IDS = Object.freeze([
  'canonical_client_registry',
  'canonical_work_queue',
  'protected_local_contexts',
  'private_outbound_ledger',
  'gmail_exact_domain_history',
  'account_suppression_register'
]);

const SOURCE_ROLES = Object.freeze({
  duplicate: Object.freeze([
    'canonical_client_registry',
    'canonical_work_queue',
    'private_outbound_ledger'
  ]),
  relationship_conflict: Object.freeze([
    'canonical_client_registry',
    'canonical_work_queue',
    'protected_local_contexts',
    'gmail_exact_domain_history'
  ]),
  account_suppression: Object.freeze(['account_suppression_register'])
});

const TOP_LEVEL_FIELDS = Object.freeze([
  'company_name',
  'canonical_first_party_domain',
  'evaluated_at',
  'source_checks'
]);

const SOURCE_CHECK_FIELDS = Object.freeze([
  'source_id',
  'observed_at',
  'expires_at',
  'exact_account_match_count',
  'exact_domain_match_count',
  'state'
]);

const SOURCE_STATES = new Set(['complete', 'unavailable', 'error']);
const FORBIDDEN_KEY = /(?:^|[_-])(?:e[-_]?mail|phone|telephone|mobile|postal|address|street|contact|person|people|employee|staff|owner|founder|executive|recipient|first[-_]?name|last[-_]?name)(?:$|[_-])/i;
const EMAIL_VALUE = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
const PHONE_VALUE = /(?<!\d)(?:(?:\+?1[ .-]?)?\(?\d{3}\)?[ .-]\d{3}[ .-]\d{4}|(?:\+?1)?\d{10})(?!\d)/;
const POSTAL_VALUE = /\b\d{1,6}\s+[\p{L}0-9][\p{L}0-9 .'-]{1,80}\s(?:street|st\.?|road|rd\.?|avenue|ave\.?|boulevard|blvd\.?|lane|ln\.?|drive|dr\.?|court|ct\.?|way)\b/iu;
const CONTROL_CHARACTER = /[\u0000-\u001f\u007f]/u;
const SPECIAL_USE_SUFFIXES = new Set(['example', 'invalid', 'local', 'localhost', 'internal', 'test']);
const HOUR_MS = 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;

export class AccountGovernancePreflightError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'AccountGovernancePreflightError';
    this.code = code;
  }
}

function fail(code, message) {
  throw new AccountGovernancePreflightError(code, message);
}

function isPlainObject(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function assertExactFieldSet(actual, expected, code) {
  if (!Array.isArray(actual) || actual.length !== expected.length) {
    fail(code, 'Policy cannot widen or omit the fixed account-governance source set.');
  }
  const actualSet = new Set(actual);
  if (actualSet.size !== expected.length || expected.some((value) => !actualSet.has(value))) {
    fail(code, 'Policy cannot widen or omit the fixed account-governance source set.');
  }
}

function assertExactObjectFields(actual, expected, code) {
  if (!isPlainObject(actual)) fail(code, 'Policy section must be a plain data object.');
  const keys = Reflect.ownKeys(actual);
  if (keys.some((key) => typeof key !== 'string') || keys.length !== expected.length ||
      expected.some((field) => !Object.hasOwn(actual, field)) ||
      keys.some((field) => !expected.includes(field))) {
    fail(code, 'Policy cannot add, widen, or omit fields.');
  }
  for (const key of keys) {
    const descriptor = Object.getOwnPropertyDescriptor(actual, key);
    if (!descriptor || 'get' in descriptor || 'set' in descriptor) {
      fail(code, 'Policy must contain data fields only.');
    }
  }
}

function assertSafePolicy(policy) {
  if (!isPlainObject(policy) || !isPlainObject(policy.safety) ||
      !isPlainObject(policy.source_roles) || !isPlainObject(policy.limits) ||
      !isPlainObject(policy.output_contract)) {
    fail('UNSAFE_POLICY', 'A valid fail-closed account-governance policy is required.');
  }

  assertExactObjectFields(policy, [
    'schema_version',
    'status',
    'purpose',
    'safety',
    'required_source_ids',
    'source_roles',
    'allowed_source_states',
    'limits',
    'output_contract'
  ], 'UNSAFE_POLICY_FIELDS');
  assertExactObjectFields(policy.safety, [
    'pure_local',
    'network_enabled',
    'filesystem_enabled',
    'raw_match_persistence',
    'raw_match_logging',
    'account_level_only',
    'deny_unknown_fields',
    'contact_discovery_authorized',
    'outreach_authorized',
    'external_actions_authorized',
    'cadence_changed'
  ], 'UNSAFE_POLICY_FIELDS');
  assertExactObjectFields(policy.source_roles, [
    'duplicate',
    'relationship_conflict',
    'account_suppression'
  ], 'UNSAFE_POLICY_FIELDS');
  assertExactObjectFields(policy.limits, [
    'max_source_age_hours',
    'max_expiry_horizon_hours',
    'max_future_skew_minutes',
    'exact_required_source_count'
  ], 'UNSAFE_POLICY_FIELDS');
  assertExactObjectFields(policy.output_contract, [
    'clear_state',
    'account_lifecycle',
    'stage',
    'contact_discovery_authorized',
    'outreach_authorized',
    'external_actions'
  ], 'UNSAFE_POLICY_FIELDS');

  const requiredSafety = {
    pure_local: true,
    network_enabled: false,
    filesystem_enabled: false,
    raw_match_persistence: false,
    raw_match_logging: false,
    account_level_only: true,
    deny_unknown_fields: true,
    contact_discovery_authorized: false,
    outreach_authorized: false,
    external_actions_authorized: false,
    cadence_changed: false
  };
  for (const [key, expected] of Object.entries(requiredSafety)) {
    if (policy.safety[key] !== expected) {
      fail('UNSAFE_POLICY', 'Policy attempted to relax a mandatory account-governance safety control.');
    }
  }

  assertExactFieldSet(policy.required_source_ids, REQUIRED_SOURCE_IDS, 'UNSAFE_POLICY_SOURCES');
  assertExactFieldSet(policy.source_roles.duplicate, SOURCE_ROLES.duplicate, 'UNSAFE_POLICY_ROLES');
  assertExactFieldSet(
    policy.source_roles.relationship_conflict,
    SOURCE_ROLES.relationship_conflict,
    'UNSAFE_POLICY_ROLES'
  );
  assertExactFieldSet(
    policy.source_roles.account_suppression,
    SOURCE_ROLES.account_suppression,
    'UNSAFE_POLICY_ROLES'
  );
  assertExactFieldSet(policy.allowed_source_states, [...SOURCE_STATES], 'UNSAFE_POLICY_STATES');

  if (policy.limits.max_source_age_hours !== 24 ||
      policy.limits.max_expiry_horizon_hours !== 24 ||
      policy.limits.max_future_skew_minutes !== 5 ||
      policy.limits.exact_required_source_count !== REQUIRED_SOURCE_IDS.length) {
    fail('UNSAFE_POLICY_LIMITS', 'Policy attempted to widen or alter the fixed freshness limits.');
  }

  if (policy.output_contract.clear_state !== 'clear_current_exact_sources' ||
      policy.output_contract.account_lifecycle !== 'RESEARCH_ONLY' ||
      policy.output_contract.stage !== 'P00_ACCOUNT_RESEARCH' ||
      policy.output_contract.contact_discovery_authorized !== false ||
      policy.output_contract.outreach_authorized !== false ||
      policy.output_contract.external_actions !== 0) {
    fail('UNSAFE_POLICY_OUTPUT', 'Policy attempted to cross the research-only boundary.');
  }
}

function requirePlainDataObject(value, allowedFields, code) {
  if (!isPlainObject(value)) fail(code, 'Input must be a plain local data object.');
  for (const key of Reflect.ownKeys(value)) {
    if (typeof key !== 'string' || FORBIDDEN_KEY.test(key)) {
      fail('FORBIDDEN_FIELD', 'Input contains a prohibited personal or contact field.');
    }
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!descriptor || 'get' in descriptor || 'set' in descriptor) {
      fail('ACCESSOR_FIELD', 'Input must contain data fields only.');
    }
    if (!allowedFields.includes(key)) fail('UNKNOWN_FIELD', 'Input contains an unknown field.');
  }
  if (Reflect.ownKeys(value).length !== allowedFields.length ||
      allowedFields.some((field) => !Object.hasOwn(value, field))) {
    fail(code, 'Input is missing a required field.');
  }
}

function requireSafeString(value, code) {
  if (typeof value !== 'string' || !value.trim() || CONTROL_CHARACTER.test(value)) {
    fail(code, 'Value must be a non-empty control-free string.');
  }
  return value.normalize('NFKC').trim();
}

function normalizeCompanyName(value) {
  const normalized = requireSafeString(value, 'INVALID_COMPANY_NAME').replace(/\s+/gu, ' ');
  if (normalized.length < 2 || normalized.length > 160 || EMAIL_VALUE.test(normalized) ||
      PHONE_VALUE.test(normalized) || POSTAL_VALUE.test(normalized) || /^(?:https?|ftp|javascript|data):/i.test(normalized)) {
    fail('INVALID_COMPANY_NAME', 'Company name is invalid or contains prohibited contact data.');
  }
  return normalized;
}

function normalizeDomain(value) {
  let domain = requireSafeString(value, 'UNSAFE_DOMAIN').toLowerCase();
  if (/[\/@:?#[\]]/u.test(domain) || !/^[a-z0-9.-]+$/u.test(domain)) {
    fail('UNSAFE_DOMAIN', 'Canonical domain must contain a public hostname only.');
  }
  domain = domain.replace(/\.$/u, '').replace(/^www\./u, '');
  const labels = domain.split('.');
  if (domain.includes('..') || !domain.includes('.') || domain.length > 253 ||
      labels.some((label) => !label || label.length > 63 ||
        !/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/iu.test(label)) ||
      SPECIAL_USE_SUFFIXES.has(labels.at(-1))) {
    fail('UNSAFE_DOMAIN', 'Canonical domain must contain a public hostname only.');
  }
  return domain;
}

function normalizeTimestamp(value, code) {
  const normalized = requireSafeString(value, code);
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/u.test(normalized)) {
    fail(code, 'Timestamp must be ISO 8601 with an explicit time zone.');
  }
  const timestamp = Date.parse(normalized);
  if (!Number.isFinite(timestamp)) fail(code, 'Timestamp is invalid.');
  return { iso: new Date(timestamp).toISOString(), timestamp };
}

function requireCount(value) {
  if (!Number.isSafeInteger(value) || value < 0 || value > 1000000) {
    fail('INVALID_MATCH_COUNT', 'Exact match counts must be bounded non-negative integers.');
  }
  return value;
}

function evaluateSourceCheck(check, trustedNow) {
  requirePlainDataObject(check, SOURCE_CHECK_FIELDS, 'INVALID_SOURCE_CHECK');
  const sourceId = requireSafeString(check.source_id, 'INVALID_SOURCE_ID');
  if (!REQUIRED_SOURCE_IDS.includes(sourceId)) fail('UNKNOWN_SOURCE', 'Source is outside the fixed source set.');
  const observedAt = normalizeTimestamp(check.observed_at, 'INVALID_OBSERVED_AT');
  const expiresAt = normalizeTimestamp(check.expires_at, 'INVALID_EXPIRES_AT');
  const exactAccountMatchCount = requireCount(check.exact_account_match_count);
  const exactDomainMatchCount = requireCount(check.exact_domain_match_count);
  const state = requireSafeString(check.state, 'INVALID_SOURCE_STATE');
  if (!SOURCE_STATES.has(state)) fail('INVALID_SOURCE_STATE', 'Source state is outside the fixed allowlist.');
  if (state !== 'complete' && (exactAccountMatchCount !== 0 || exactDomainMatchCount !== 0)) {
    fail('INCONSISTENT_SOURCE_CHECK', 'Unavailable or errored sources cannot report exact matches.');
  }

  const reasons = [];
  if (state !== 'complete') reasons.push(`${sourceId}:source_${state}`);
  if (observedAt.timestamp > trustedNow + (5 * MINUTE_MS)) reasons.push(`${sourceId}:future_observation`);
  if (trustedNow - observedAt.timestamp > (24 * HOUR_MS)) reasons.push(`${sourceId}:stale_observation`);
  if (expiresAt.timestamp < trustedNow) reasons.push(`${sourceId}:expired_observation`);
  if (expiresAt.timestamp < observedAt.timestamp ||
      expiresAt.timestamp - observedAt.timestamp > (24 * HOUR_MS)) {
    reasons.push(`${sourceId}:invalid_expiry_horizon`);
  }

  return Object.freeze({
    sourceId,
    exactAccountMatchCount,
    exactDomainMatchCount,
    hasMatch: exactAccountMatchCount + exactDomainMatchCount > 0,
    usable: reasons.length === 0,
    reasons: Object.freeze(reasons)
  });
}

function roleState(sourceMap, sourceIds, matchedState) {
  if (sourceIds.some((sourceId) => !sourceMap.has(sourceId) || !sourceMap.get(sourceId).usable)) {
    return 'held_incomplete_or_stale_sources';
  }
  if (sourceIds.some((sourceId) => sourceMap.get(sourceId).hasMatch)) return matchedState;
  return 'clear_current_exact_sources';
}

export function evaluateAccountGovernancePreflight(input, policy) {
  assertSafePolicy(policy);
  requirePlainDataObject(input, TOP_LEVEL_FIELDS, 'INVALID_INPUT');
  const companyName = normalizeCompanyName(input.company_name);
  const canonicalDomain = normalizeDomain(input.canonical_first_party_domain);
  const evaluatedAt = normalizeTimestamp(input.evaluated_at, 'INVALID_EVALUATED_AT');
  const trustedNow = Date.now();
  if (Math.abs(trustedNow - evaluatedAt.timestamp) > (5 * MINUTE_MS)) {
    fail('UNTRUSTED_EVALUATION_TIME', 'Evaluation time must match the trusted current clock.');
  }
  if (!Array.isArray(input.source_checks)) fail('INVALID_SOURCE_CHECKS', 'source_checks must be an array.');

  const sourceMap = new Map();
  for (const check of input.source_checks) {
    const result = evaluateSourceCheck(check, trustedNow);
    if (sourceMap.has(result.sourceId)) fail('DUPLICATE_SOURCE', 'Each required source may appear only once.');
    sourceMap.set(result.sourceId, result);
  }

  const holdReasons = [];
  for (const sourceId of REQUIRED_SOURCE_IDS) {
    const result = sourceMap.get(sourceId);
    if (!result) {
      holdReasons.push(`${sourceId}:missing_source`);
      continue;
    }
    holdReasons.push(...result.reasons);
  }

  const duplicateState = roleState(
    sourceMap,
    SOURCE_ROLES.duplicate,
    'duplicate_match_current_exact_sources'
  );
  const relationshipConflictState = roleState(
    sourceMap,
    SOURCE_ROLES.relationship_conflict,
    'relationship_match_current_exact_sources'
  );
  const accountSuppressionState = roleState(
    sourceMap,
    SOURCE_ROLES.account_suppression,
    'suppressed_current_exact_sources'
  );

  if (duplicateState === 'duplicate_match_current_exact_sources') holdReasons.push('duplicate:exact_match');
  if (relationshipConflictState === 'relationship_match_current_exact_sources') {
    holdReasons.push('relationship_conflict:exact_match');
  }
  if (accountSuppressionState === 'suppressed_current_exact_sources') {
    holdReasons.push('account_suppression:exact_match');
  }

  const clear = duplicateState === 'clear_current_exact_sources' &&
    relationshipConflictState === 'clear_current_exact_sources' &&
    accountSuppressionState === 'clear_current_exact_sources' &&
    holdReasons.length === 0;
  const frozenReasons = Object.freeze([...new Set(holdReasons)]);

  return Object.freeze({
    company_name: companyName,
    canonical_first_party_domain: canonicalDomain,
    evaluated_at: evaluatedAt.iso,
    source_completeness_state: sourceMap.size === REQUIRED_SOURCE_IDS.length &&
      REQUIRED_SOURCE_IDS.every((sourceId) => sourceMap.get(sourceId)?.usable)
      ? 'complete_current_exact_sources'
      : 'held_incomplete_or_stale_sources',
    duplicate_state: duplicateState,
    relationship_conflict_state: relationshipConflictState,
    account_suppression_state: accountSuppressionState,
    account_governance_state: clear ? 'clear_current_exact_sources' : 'held',
    hold_reasons: frozenReasons,
    account_lifecycle: 'RESEARCH_ONLY',
    stage: 'P00_ACCOUNT_RESEARCH',
    contact_discovery_authorized: false,
    outreach_authorized: false,
    external_actions: 0
  });
}

export const ACCOUNT_GOVERNANCE_REQUIRED_SOURCE_IDS = REQUIRED_SOURCE_IDS;
