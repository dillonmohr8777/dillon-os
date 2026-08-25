import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  PUBLIC_COMPANY_OUTPUT_FIELDS,
  PublicCompanyAllowlistError,
  sanitizePublicCompanyCandidate
} from '../src/public-company-allowlist.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const policy = JSON.parse(fs.readFileSync(path.join(root, 'config', 'public-source-policy.json'), 'utf8'));
const fingerprint = 'A'.repeat(64);

function safeCandidate(overrides = {}) {
  return {
    company_name: '  Acme   Field Services, LLC  ',
    canonical_first_party_domain: 'WWW.AcmeFieldServices.com.',
    canonical_first_party_url: 'https://www.acmefieldservices.com/',
    public_company_page_locator: 'https://linkedin.com/company/acme-field-services/',
    query_fingerprint: fingerprint,
    retrieved_at: '2026-08-25T17:29:35-04:00',
    source_lane: 'exa_company_locator',
    verification_state: 'first_party_confirmed',
    ...overrides
  };
}

function captureFailure(candidate, selectedPolicy = policy) {
  let output;
  let error;
  try {
    output = sanitizePublicCompanyCandidate(candidate, selectedPolicy);
  } catch (caught) {
    error = caught;
  }
  assert.equal(output, undefined, 'Unsafe candidate must never produce partial output.');
  assert.ok(error instanceof PublicCompanyAllowlistError);
  return error;
}

test('safe candidate is normalized into the exact immutable allowlist', () => {
  const output = sanitizePublicCompanyCandidate(safeCandidate(), policy);

  assert.deepEqual(output, {
    company_name: 'Acme Field Services, LLC',
    canonical_first_party_domain: 'acmefieldservices.com',
    canonical_first_party_url: 'https://www.acmefieldservices.com/',
    query_fingerprint: 'a'.repeat(64),
    retrieved_at: '2026-08-25T21:29:35.000Z',
    source_lane: 'exa_company_locator',
    verification_state: 'first_party_confirmed',
    public_company_page_locator: 'https://www.linkedin.com/company/acme-field-services/'
  });
  assert.equal(Object.isFrozen(output), true);
  assert.deepEqual(new Set(Object.keys(output)), new Set(PUBLIC_COMPANY_OUTPUT_FIELDS));
});

test('unknown fields are denied by default and never copied', () => {
  const error = captureFailure(safeCandidate({ raw_payload: { score: 99 } }));
  assert.equal(error.code, 'UNKNOWN_FIELD');
  assert.doesNotMatch(error.message, /score|99/u);
});

test('nested PII is rejected before an output object exists', () => {
  const adversarial = safeCandidate({
    enrichment: {
      owner: {
        person_name: 'Synthetic Person',
        email: 'synthetic.person@example.invalid'
      },
      contact: {
        phone: '202-555-0147',
        postal_address: '123 Main Street'
      }
    }
  });

  const error = captureFailure(adversarial);
  assert.equal(error.code, 'FORBIDDEN_FIELD');
  assert.doesNotMatch(error.message, /Synthetic|example\.invalid|555|Main Street/u);
});

test('personal and encoded personal LinkedIn paths never reach output', () => {
  for (const locator of [
    'https://www.linkedin.com/in/synthetic-person/',
    'https://linkedin.com/%69%6e/synthetic-person/',
    'https://www.linkedin.com/pub/synthetic-person/'
  ]) {
    const error = captureFailure(safeCandidate({ public_company_page_locator: locator }));
    assert.equal(error.code, 'PERSONAL_PROFILE_OR_UNSAFE_LOCATOR');
  }
});

test('email, phone, postal, contact, and person fields are rejected', () => {
  const prohibited = [
    ['contact_email', 'synthetic@example.invalid'],
    ['phone_number', '202-555-0182'],
    ['postal_address', '456 Market Road'],
    ['contact', 'Synthetic Contact'],
    ['person_name', 'Synthetic Person']
  ];
  for (const [field, value] of prohibited) {
    const error = captureFailure(safeCandidate({ [field]: value }));
    assert.equal(error.code, 'FORBIDDEN_FIELD');
    assert.doesNotMatch(error.message, /synthetic|555|Market Road/i);
  }
});

test('contact values cannot be smuggled through company_name', () => {
  for (const companyName of [
    'synthetic@example.invalid',
    '202-555-0199',
    '789 Example Avenue'
  ]) {
    const error = captureFailure(safeCandidate({ company_name: companyName }));
    assert.equal(error.code, 'INVALID_COMPANY_NAME');
  }
});

test('unsafe schemes, credentials, ports, private hosts, and URL payloads fail closed', () => {
  const unsafeCandidates = [
    { canonical_first_party_url: 'http://www.acmefieldservices.com/' },
    { canonical_first_party_url: 'javascript:alert(1)' },
    { canonical_first_party_url: 'https://user:secret@www.acmefieldservices.com/' },
    { canonical_first_party_url: 'https://www.acmefieldservices.com:8443/' },
    { canonical_first_party_url: 'https://www.acmefieldservices.com/?email=synthetic@example.invalid' },
    { canonical_first_party_url: 'https://www.acmefieldservices.com/about' },
    { canonical_first_party_domain: '127.0.0.1', canonical_first_party_url: 'https://127.0.0.1/' },
    { canonical_first_party_domain: 'localhost', canonical_first_party_url: 'https://localhost/' },
    { canonical_first_party_domain: 'other-company.com' },
    { public_company_page_locator: 'http://www.linkedin.com/company/acme-field-services/' }
  ];
  for (const override of unsafeCandidates) captureFailure(safeCandidate(override));
});

test('ambiguous identity and unsupported source lanes fail closed', () => {
  const ambiguous = captureFailure(safeCandidate({ verification_state: 'ambiguous_identity' }));
  assert.equal(ambiguous.code, 'AMBIGUOUS_OR_UNSAFE_VERIFICATION_STATE');

  const unsupportedSource = captureFailure(safeCandidate({ source_lane: 'generated_people_list' }));
  assert.equal(unsupportedSource.code, 'UNSAFE_SOURCE_LANE');
});

test('policy cannot enable fetches, writes, external actions, wider fields, or larger batches', () => {
  const mutations = [
    (value) => { value.safety.network_enabled = true; },
    (value) => { value.safety.automatic_fetch_enabled = true; },
    (value) => { value.safety.raw_payload_persistence = true; },
    (value) => { value.safety.raw_payload_logging = true; },
    (value) => { value.safety.external_actions_authorized = true; },
    (value) => { value.safety.cadence_changed = true; },
    (value) => { value.allowed_fields.push('contact_email'); },
    (value) => { value.allowed_verification_states.push('ambiguous_identity'); },
    (value) => { value.limits.max_persisted_accounts_per_run = 9; }
  ];

  for (const mutate of mutations) {
    const unsafePolicy = structuredClone(policy);
    mutate(unsafePolicy);
    captureFailure(safeCandidate(), unsafePolicy);
  }
});

test('adapter source has no filesystem, network, console, or serialization side effect', () => {
  const source = fs.readFileSync(path.join(root, 'src', 'public-company-allowlist.mjs'), 'utf8');
  assert.doesNotMatch(source, /node:fs|node:http|node:https|fetch\s*\(|console\.|JSON\.stringify|writeFile|appendFile/u);
  assert.equal(policy.safety.pure_local, true);
  assert.equal(policy.safety.network_enabled, false);
  assert.equal(policy.safety.automatic_fetch_enabled, false);
  assert.equal(policy.safety.raw_payload_persistence, false);
  assert.equal(policy.safety.raw_payload_logging, false);
  assert.equal(policy.safety.external_actions_authorized, false);
  assert.equal(policy.safety.cadence_changed, false);
});
