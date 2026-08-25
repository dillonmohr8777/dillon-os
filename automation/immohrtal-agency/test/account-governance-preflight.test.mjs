import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  ACCOUNT_GOVERNANCE_REQUIRED_SOURCE_IDS,
  AccountGovernancePreflightError,
  evaluateAccountGovernancePreflight
} from '../src/account-governance-preflight.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const policy = JSON.parse(fs.readFileSync(path.join(root, 'config', 'account-governance-policy.json'), 'utf8'));
const testClock = Date.now();
const timestamp = (offsetMs = 0) => new Date(testClock + offsetMs).toISOString();

function sourceCheck(sourceId, overrides = {}) {
  return {
    source_id: sourceId,
    observed_at: timestamp(-15 * 60 * 1000),
    expires_at: timestamp((23 * 60 + 45) * 60 * 1000),
    exact_account_match_count: 0,
    exact_domain_match_count: 0,
    state: 'complete',
    ...overrides
  };
}

function safeInput(overrides = {}) {
  return {
    company_name: 'Acme Field Services, LLC',
    canonical_first_party_domain: 'www.acmefieldservices.com',
    evaluated_at: timestamp(),
    source_checks: ACCOUNT_GOVERNANCE_REQUIRED_SOURCE_IDS.map((sourceId) => sourceCheck(sourceId)),
    ...overrides
  };
}

function captureFailure(input, selectedPolicy = policy) {
  let output;
  let error;
  try {
    output = evaluateAccountGovernancePreflight(input, selectedPolicy);
  } catch (caught) {
    error = caught;
  }
  assert.equal(output, undefined);
  assert.ok(error instanceof AccountGovernancePreflightError);
  return error;
}

test('all six current exact sources produce a bounded account-level clear state', () => {
  const output = evaluateAccountGovernancePreflight(safeInput(), policy);
  assert.equal(output.account_governance_state, 'clear_current_exact_sources');
  assert.equal(output.source_completeness_state, 'complete_current_exact_sources');
  assert.equal(output.duplicate_state, 'clear_current_exact_sources');
  assert.equal(output.relationship_conflict_state, 'clear_current_exact_sources');
  assert.equal(output.account_suppression_state, 'clear_current_exact_sources');
  assert.deepEqual(output.hold_reasons, []);
  assert.equal(output.account_lifecycle, 'RESEARCH_ONLY');
  assert.equal(output.stage, 'P00_ACCOUNT_RESEARCH');
  assert.equal(output.contact_discovery_authorized, false);
  assert.equal(output.outreach_authorized, false);
  assert.equal(output.external_actions, 0);
  assert.equal(Object.isFrozen(output), true);
  assert.equal(Object.isFrozen(output.hold_reasons), true);
});

test('a missing required source fails closed without implying a match', () => {
  const input = safeInput();
  input.source_checks = input.source_checks.filter((check) => check.source_id !== 'canonical_work_queue');
  const output = evaluateAccountGovernancePreflight(input, policy);
  assert.equal(output.account_governance_state, 'held');
  assert.equal(output.duplicate_state, 'held_incomplete_or_stale_sources');
  assert.equal(output.relationship_conflict_state, 'held_incomplete_or_stale_sources');
  assert.ok(output.hold_reasons.includes('canonical_work_queue:missing_source'));
});

test('stale or expired evidence fails closed', () => {
  const input = safeInput();
  input.source_checks = input.source_checks.map((check) => check.source_id === 'gmail_exact_domain_history'
    ? sourceCheck(check.source_id, {
      observed_at: timestamp(-48 * 60 * 60 * 1000),
      expires_at: timestamp(-24 * 60 * 60 * 1000)
    })
    : check);
  const output = evaluateAccountGovernancePreflight(input, policy);
  assert.equal(output.account_governance_state, 'held');
  assert.equal(output.relationship_conflict_state, 'held_incomplete_or_stale_sources');
  assert.ok(output.hold_reasons.includes('gmail_exact_domain_history:stale_observation'));
  assert.ok(output.hold_reasons.includes('gmail_exact_domain_history:expired_observation'));
});

test('a protected-context relationship match creates an exact current hold', () => {
  const input = safeInput();
  input.source_checks = input.source_checks.map((check) => check.source_id === 'protected_local_contexts'
    ? sourceCheck(check.source_id, { exact_account_match_count: 1 })
    : check);
  const output = evaluateAccountGovernancePreflight(input, policy);
  assert.equal(output.relationship_conflict_state, 'relationship_match_current_exact_sources');
  assert.equal(output.account_governance_state, 'held');
  assert.ok(output.hold_reasons.includes('relationship_conflict:exact_match'));
});

test('an account suppression match remains suppressed', () => {
  const input = safeInput();
  input.source_checks = input.source_checks.map((check) => check.source_id === 'account_suppression_register'
    ? sourceCheck(check.source_id, { exact_domain_match_count: 1 })
    : check);
  const output = evaluateAccountGovernancePreflight(input, policy);
  assert.equal(output.account_suppression_state, 'suppressed_current_exact_sources');
  assert.equal(output.account_governance_state, 'held');
  assert.ok(output.hold_reasons.includes('account_suppression:exact_match'));
});

test('duplicate counts in the canonical queue hold the account', () => {
  const input = safeInput();
  input.source_checks = input.source_checks.map((check) => check.source_id === 'canonical_work_queue'
    ? sourceCheck(check.source_id, { exact_account_match_count: 2 })
    : check);
  const output = evaluateAccountGovernancePreflight(input, policy);
  assert.equal(output.duplicate_state, 'duplicate_match_current_exact_sources');
  assert.equal(output.account_governance_state, 'held');
});

test('personal or contact fields and values are rejected before output', () => {
  const withContactField = safeInput({ contact_email: 'synthetic@example.invalid' });
  assert.equal(captureFailure(withContactField).code, 'FORBIDDEN_FIELD');
  assert.equal(captureFailure(safeInput({ company_name: 'synthetic@example.invalid' })).code, 'INVALID_COMPANY_NAME');
  assert.equal(captureFailure(safeInput({ company_name: '202-555-0199' })).code, 'INVALID_COMPANY_NAME');
  assert.equal(captureFailure(safeInput({ company_name: '2025550199 LLC' })).code, 'INVALID_COMPANY_NAME');
  assert.equal(captureFailure(safeInput({ company_name: '123 Example Avenue' })).code, 'INVALID_COMPANY_NAME');
});

test('a caller cannot backdate the evaluation clock to clear stale evidence', () => {
  const oldInput = safeInput({
    evaluated_at: '2020-01-01T12:00:00Z',
    source_checks: ACCOUNT_GOVERNANCE_REQUIRED_SOURCE_IDS.map((sourceId) => sourceCheck(sourceId, {
      observed_at: '2020-01-01T11:45:00Z',
      expires_at: '2020-01-02T11:45:00Z'
    }))
  });
  assert.equal(captureFailure(oldInput).code, 'UNTRUSTED_EVALUATION_TIME');
});

test('policy cannot widen sources, freshness, contact authority, or actions', () => {
  const mutations = [
    (value) => { value.required_source_ids.pop(); },
    (value) => { value.required_source_ids.push('people_enrichment'); },
    (value) => { value.source_roles.relationship_conflict.pop(); },
    (value) => { value.limits.max_source_age_hours = 168; },
    (value) => { value.safety.network_enabled = true; },
    (value) => { value.safety.raw_match_persistence = true; },
    (value) => { value.send_authorized = true; },
    (value) => { value.safety.publish_authorized = true; },
    (value) => { value.output_contract.send_authorized = true; },
    (value) => { value.output_contract.contact_discovery_authorized = true; },
    (value) => { value.output_contract.outreach_authorized = true; },
    (value) => { value.output_contract.external_actions = 1; }
  ];
  for (const mutate of mutations) {
    const unsafePolicy = structuredClone(policy);
    mutate(unsafePolicy);
    captureFailure(safeInput(), unsafePolicy);
  }
});

test('adapter source has no filesystem, network, console, or serialization side effects', () => {
  const source = fs.readFileSync(path.join(root, 'src', 'account-governance-preflight.mjs'), 'utf8');
  assert.doesNotMatch(source, /node:fs|node:http|node:https|fetch\s*\(|console\.|JSON\.stringify|writeFile|appendFile/u);
  assert.equal(policy.safety.pure_local, true);
  assert.equal(policy.safety.network_enabled, false);
  assert.equal(policy.safety.filesystem_enabled, false);
  assert.equal(policy.safety.raw_match_persistence, false);
  assert.equal(policy.safety.raw_match_logging, false);
  assert.equal(policy.safety.contact_discovery_authorized, false);
  assert.equal(policy.safety.outreach_authorized, false);
  assert.equal(policy.safety.external_actions_authorized, false);
});
