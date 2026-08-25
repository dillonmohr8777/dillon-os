import { isIP } from 'node:net';

const CORE_ALLOWED_FIELDS = Object.freeze([
  'company_name',
  'canonical_first_party_domain',
  'canonical_first_party_url',
  'public_company_page_locator',
  'query_fingerprint',
  'retrieved_at',
  'source_lane',
  'verification_state'
]);

const CORE_REQUIRED_FIELDS = Object.freeze(CORE_ALLOWED_FIELDS.filter(
  (field) => field !== 'public_company_page_locator'
));

const CORE_SOURCE_LANES = new Set([
  'exa_company_locator',
  'first_party_company_web',
  'sba_small_business_search',
  'sec_edgar_company_data',
  'usaspending_recipient_data'
]);

const CORE_VERIFICATION_STATES = new Set([
  'locator_only_exact_domain',
  'first_party_confirmed',
  'official_source_confirmed'
]);

const FORBIDDEN_KEY = /(?:^|[_-])(?:e[-_]?mail|phone|telephone|mobile|postal|address|street|contact|person|people|employee|staff|owner|founder|executive|recipient|first[-_]?name|last[-_]?name)(?:$|[_-])/i;
const EMAIL_VALUE = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
const PHONE_VALUE = /(?<!\d)(?:\+?1[ .-]?)?\(?\d{3}\)?[ .-]\d{3}[ .-]\d{4}(?!\d)/;
const POSTAL_VALUE = /\b\d{1,6}\s+[\p{L}0-9][\p{L}0-9 .'-]{1,80}\s(?:street|st\.?|road|rd\.?|avenue|ave\.?|boulevard|blvd\.?|lane|ln\.?|drive|dr\.?|court|ct\.?|way)\b/iu;
const CONTROL_CHARACTER = /[\u0000-\u001f\u007f]/u;
const SPECIAL_USE_SUFFIXES = new Set(['example', 'invalid', 'local', 'localhost', 'internal', 'test']);

export class PublicCompanyAllowlistError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'PublicCompanyAllowlistError';
    this.code = code;
  }
}

function fail(code, message) {
  throw new PublicCompanyAllowlistError(code, message);
}

function isPlainObject(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function assertExactFieldSet(actual, expected, code) {
  if (!Array.isArray(actual) || actual.length !== expected.length) {
    fail(code, 'Public-source policy cannot widen or omit the fixed company allowlist.');
  }
  const actualSet = new Set(actual);
  if (actualSet.size !== expected.length || expected.some((field) => !actualSet.has(field))) {
    fail(code, 'Public-source policy cannot widen or omit the fixed company allowlist.');
  }
}

function assertSafePolicy(policy) {
  if (!isPlainObject(policy) || !isPlainObject(policy.safety)) {
    fail('UNSAFE_POLICY', 'A valid fail-closed public-source policy is required.');
  }

  const requiredSafety = {
    pure_local: true,
    network_enabled: false,
    automatic_fetch_enabled: false,
    raw_payload_persistence: false,
    raw_payload_logging: false,
    deny_unknown_fields: true,
    external_actions_authorized: false,
    cadence_changed: false
  };
  for (const [key, expected] of Object.entries(requiredSafety)) {
    if (policy.safety[key] !== expected) {
      fail('UNSAFE_POLICY', 'Public-source policy attempted to relax a mandatory safety control.');
    }
  }

  assertExactFieldSet(policy.allowed_fields, CORE_ALLOWED_FIELDS, 'UNSAFE_POLICY_FIELDS');
  assertExactFieldSet(policy.required_fields, CORE_REQUIRED_FIELDS, 'UNSAFE_POLICY_FIELDS');
  assertExactFieldSet(policy.optional_fields, ['public_company_page_locator'], 'UNSAFE_POLICY_FIELDS');

  if (!Array.isArray(policy.allowed_source_lanes) || policy.allowed_source_lanes.length === 0 ||
      policy.allowed_source_lanes.some((lane) => !CORE_SOURCE_LANES.has(lane))) {
    fail('UNSAFE_POLICY_SOURCE_LANE', 'Public-source policy contains an unsupported source lane.');
  }
  if (!Array.isArray(policy.allowed_verification_states) || policy.allowed_verification_states.length === 0 ||
      policy.allowed_verification_states.some((state) => !CORE_VERIFICATION_STATES.has(state))) {
    fail('UNSAFE_POLICY_VERIFICATION_STATE', 'Public-source policy contains an unsafe verification state.');
  }

  const maximumNameLength = Number(policy.limits?.max_company_name_length);
  const maximumNodes = Number(policy.limits?.max_input_object_nodes);
  const maximumAccounts = Number(policy.limits?.max_persisted_accounts_per_run);
  if (!Number.isInteger(maximumNameLength) || maximumNameLength < 2 || maximumNameLength > 160 ||
      !Number.isInteger(maximumNodes) || maximumNodes < 1 || maximumNodes > 1000 ||
      !Number.isInteger(maximumAccounts) || maximumAccounts < 1 || maximumAccounts > 8) {
    fail('UNSAFE_POLICY_LIMITS', 'Public-source policy limits must stay within the fixed safety ceiling.');
  }

  if (policy.output_contract?.contact_discovery_authorized !== false ||
      policy.output_contract?.outreach_authorized !== false ||
      policy.output_contract?.external_actions !== 0 ||
      policy.output_contract?.account_lifecycle !== 'RESEARCH_ONLY' ||
      policy.output_contract?.stage !== 'P00_ACCOUNT_RESEARCH') {
    fail('UNSAFE_POLICY_OUTPUT', 'Public-source policy attempted to cross the research-only boundary.');
  }

  return {
    maximumNameLength,
    maximumNodes,
    allowedSourceLanes: new Set(policy.allowed_source_lanes),
    allowedVerificationStates: new Set(policy.allowed_verification_states)
  };
}

function assertDataOnlyObjectGraph(root, maximumNodes) {
  const stack = [root];
  const seen = new WeakSet();
  let visited = 0;

  while (stack.length) {
    const value = stack.pop();
    if (value === null || typeof value !== 'object') continue;
    if (seen.has(value)) continue;
    seen.add(value);
    visited += 1;
    if (visited > maximumNodes) {
      fail('INPUT_TOO_COMPLEX', 'Candidate input exceeded the local validation complexity ceiling.');
    }

    const descriptors = Object.getOwnPropertyDescriptors(value);
    for (const key of Reflect.ownKeys(descriptors)) {
      if (typeof key !== 'string') {
        fail('UNKNOWN_FIELD', 'Candidate contains fields outside the public company allowlist.');
      }
      if (FORBIDDEN_KEY.test(key)) {
        fail('FORBIDDEN_FIELD', 'Candidate contains a prohibited personal or contact field.');
      }
      const descriptor = descriptors[key];
      if ('get' in descriptor || 'set' in descriptor) {
        fail('ACCESSOR_FIELD', 'Candidate must contain data fields only.');
      }
      if (descriptor.value !== null && typeof descriptor.value === 'object') {
        stack.push(descriptor.value);
      }
    }
  }
}

function assertCandidateShape(candidate, maximumNodes) {
  if (!isPlainObject(candidate)) {
    fail('INVALID_CANDIDATE', 'Candidate must be a plain local data object.');
  }
  assertDataOnlyObjectGraph(candidate, maximumNodes);

  const keys = Reflect.ownKeys(candidate);
  if (keys.some((key) => typeof key !== 'string') || keys.some((key) => !CORE_ALLOWED_FIELDS.includes(key))) {
    fail('UNKNOWN_FIELD', 'Candidate contains fields outside the public company allowlist.');
  }
  const missing = CORE_REQUIRED_FIELDS.some((field) => !Object.hasOwn(candidate, field));
  if (missing) fail('MISSING_FIELD', 'Candidate is missing a required public company field.');
}

function requireString(value, code) {
  if (typeof value !== 'string' || !value.trim() || CONTROL_CHARACTER.test(value)) {
    fail(code, 'Public company field must be a non-empty control-free string.');
  }
  return value.normalize('NFKC').trim();
}

function normalizeCompanyName(value, maximumLength) {
  const normalized = requireString(value, 'INVALID_COMPANY_NAME').replace(/\s+/gu, ' ');
  if (normalized.length < 2 || normalized.length > maximumLength ||
      EMAIL_VALUE.test(normalized) || PHONE_VALUE.test(normalized) || POSTAL_VALUE.test(normalized) ||
      /^(?:https?|ftp|javascript|data):/i.test(normalized)) {
    fail('INVALID_COMPANY_NAME', 'Company name is invalid or contains prohibited contact data.');
  }
  return normalized;
}

function assertPublicHostname(hostname) {
  if (!hostname || hostname.length > 253 || isIP(hostname) !== 0 || !hostname.includes('.')) {
    fail('UNSAFE_DOMAIN', 'Canonical domain must be a public DNS hostname.');
  }
  const labels = hostname.split('.');
  if (labels.some((label) => !label || label.length > 63 || !/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i.test(label)) ||
      SPECIAL_USE_SUFFIXES.has(labels.at(-1))) {
    fail('UNSAFE_DOMAIN', 'Canonical domain must be a public DNS hostname.');
  }
}

function normalizeDomain(value) {
  let domain = requireString(value, 'UNSAFE_DOMAIN').toLowerCase();
  if (/[\/@:?#[\]]/u.test(domain) || !/^[a-z0-9.-]+$/u.test(domain)) {
    fail('UNSAFE_DOMAIN', 'Canonical domain must contain a hostname only.');
  }
  domain = domain.replace(/\.$/u, '').replace(/^www\./u, '');
  if (domain.includes('..')) fail('UNSAFE_DOMAIN', 'Canonical domain must be a public DNS hostname.');
  assertPublicHostname(domain);
  return domain;
}

function safeUrl(value, code) {
  const raw = requireString(value, code);
  let parsed;
  try {
    parsed = new URL(raw);
  } catch {
    fail(code, 'URL is not a safe absolute HTTPS URL.');
  }
  if (parsed.protocol !== 'https:' || parsed.username || parsed.password || parsed.port || parsed.search || parsed.hash) {
    fail(code, 'URL is not a safe absolute HTTPS URL.');
  }
  const hostname = parsed.hostname.toLowerCase().replace(/\.$/u, '');
  assertPublicHostname(hostname);
  return { parsed, hostname };
}

function normalizeCanonicalUrl(value, canonicalDomain) {
  const { parsed, hostname } = safeUrl(value, 'UNSAFE_CANONICAL_URL');
  const domainComparableHost = hostname.replace(/^www\./u, '');
  if (domainComparableHost !== canonicalDomain || parsed.pathname !== '/') {
    fail('AMBIGUOUS_IDENTITY', 'Canonical URL and first-party domain do not identify the same origin root.');
  }
  return `https://${hostname}/`;
}

function normalizeCompanyPageLocator(value) {
  if (value === undefined) return undefined;
  const { parsed, hostname } = safeUrl(value, 'UNSAFE_COMPANY_PAGE_LOCATOR');
  const comparableHost = hostname.replace(/^www\./u, '');
  let decodedPath;
  try {
    decodedPath = decodeURIComponent(parsed.pathname).toLowerCase();
  } catch {
    fail('UNSAFE_COMPANY_PAGE_LOCATOR', 'Company-page locator contains an invalid encoded path.');
  }
  if (comparableHost !== 'linkedin.com' || /^\/in(?:\/|$)/u.test(decodedPath)) {
    fail('PERSONAL_PROFILE_OR_UNSAFE_LOCATOR', 'Only a public LinkedIn company-page locator is permitted.');
  }
  const match = decodedPath.match(/^\/company\/([a-z0-9](?:[a-z0-9-]{0,98}[a-z0-9])?)\/?$/u);
  if (!match) {
    fail('PERSONAL_PROFILE_OR_UNSAFE_LOCATOR', 'Only a public LinkedIn company-page locator is permitted.');
  }
  return `https://www.linkedin.com/company/${match[1]}/`;
}

function normalizeFingerprint(value) {
  const fingerprint = requireString(value, 'INVALID_QUERY_FINGERPRINT').toLowerCase();
  if (!/^[a-f0-9]{64}$/u.test(fingerprint)) {
    fail('INVALID_QUERY_FINGERPRINT', 'Query fingerprint must be a SHA-256 lowercase hexadecimal digest.');
  }
  return fingerprint;
}

function normalizeRetrievedAt(value) {
  const retrievedAt = requireString(value, 'INVALID_RETRIEVED_AT');
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/u.test(retrievedAt)) {
    fail('INVALID_RETRIEVED_AT', 'retrieved_at must be an ISO-8601 timestamp with an explicit time zone.');
  }
  const timestamp = Date.parse(retrievedAt);
  if (!Number.isFinite(timestamp)) fail('INVALID_RETRIEVED_AT', 'retrieved_at is not a valid timestamp.');
  return new Date(timestamp).toISOString();
}

function normalizeEnum(value, allowed, code) {
  const normalized = requireString(value, code);
  if (!allowed.has(normalized)) fail(code, 'Field value is not in the fail-closed policy allowlist.');
  return normalized;
}

export function sanitizePublicCompanyCandidate(candidate, policy) {
  const safePolicy = assertSafePolicy(policy);
  assertCandidateShape(candidate, safePolicy.maximumNodes);

  const companyName = normalizeCompanyName(candidate.company_name, safePolicy.maximumNameLength);
  const canonicalDomain = normalizeDomain(candidate.canonical_first_party_domain);
  const canonicalUrl = normalizeCanonicalUrl(candidate.canonical_first_party_url, canonicalDomain);
  const companyPageLocator = normalizeCompanyPageLocator(candidate.public_company_page_locator);
  const queryFingerprint = normalizeFingerprint(candidate.query_fingerprint);
  const retrievedAt = normalizeRetrievedAt(candidate.retrieved_at);
  const sourceLane = normalizeEnum(candidate.source_lane, safePolicy.allowedSourceLanes, 'UNSAFE_SOURCE_LANE');
  const verificationState = normalizeEnum(
    candidate.verification_state,
    safePolicy.allowedVerificationStates,
    'AMBIGUOUS_OR_UNSAFE_VERIFICATION_STATE'
  );

  const output = {
    company_name: companyName,
    canonical_first_party_domain: canonicalDomain,
    canonical_first_party_url: canonicalUrl,
    query_fingerprint: queryFingerprint,
    retrieved_at: retrievedAt,
    source_lane: sourceLane,
    verification_state: verificationState
  };
  if (companyPageLocator !== undefined) output.public_company_page_locator = companyPageLocator;
  return Object.freeze(output);
}

export const PUBLIC_COMPANY_OUTPUT_FIELDS = CORE_ALLOWED_FIELDS;
