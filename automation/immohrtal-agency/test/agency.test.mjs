import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { loadInput, loadSuppressions, parseCsv } from '../src/input-adapters.mjs';
import { executeRun } from '../src/orchestrator.mjs';
import { STATES, discovered, transition } from '../src/state-machine.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const config = JSON.parse(fs.readFileSync(path.join(root, 'config', 'default.json'), 'utf8'));
const asOf = '2026-08-24T12:00:00.000Z';

test('state machine rejects skipping maker-checker stages', () => {
  const record = discovered({ prospect_id: 'x' }, asOf);
  assert.throws(() => transition(record, STATES.AWAITING_APPROVAL, 'test', asOf), /Illegal state transition/);
});

test('CSV adapter preserves booleans and list fields', () => {
  const rows = parseCsv('prospect_id,company_name,website,market,category,allowed_channels,opt_out,do_not_contact,observations\na,A,https://a.example,X,legal,email|phone,false,true,one|two\n');
  assert.deepEqual(rows[0].allowed_channels, ['email', 'phone']);
  assert.deepEqual(rows[0].observations, ['one', 'two']);
  assert.equal(rows[0].opt_out, false);
  assert.equal(rows[0].do_not_contact, true);
});

test('orchestrator is deterministic, suppresses opt-outs, and stops at approval', () => {
  const input = loadInput(path.join(root, 'fixtures', 'prospects.json'));
  const suppressions = loadSuppressions(path.join(root, 'fixtures', 'suppressions.json'));
  const firstRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'immohrtal-a-'));
  const secondRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'immohrtal-b-'));
  const first = executeRun({ config, input, suppressions, runId: '20260824-120000', asOf, outputRoot: firstRoot });
  const second = executeRun({ config, input, suppressions, runId: '20260824-120000', asOf, outputRoot: secondRoot });
  assert.equal(first.receipt.counts.awaiting_approval, 2);
  assert.equal(first.receipt.counts.suppressed, 1);
  assert.deepEqual(first.receipt.artifact_sha256, second.receipt.artifact_sha256);
  assert.ok(first.records.filter((record) => record.state === STATES.AWAITING_APPROVAL).every((record) => record.approval_gate.status === 'NOT_GRANTED'));
  assert.deepEqual(first.receipt.external_actions, { sent: 0, published: 0, spend_changes: 0, crm_writes: 0, credential_accesses: 0 });
});

test('global suppression and within-run dedupe are fail-closed', () => {
  const input = loadInput(path.join(root, 'fixtures', 'prospects.csv'));
  input.prospects.push({ ...input.prospects[0], prospect_id: 'fixture-summit-copy' });
  const suppressions = loadSuppressions(path.join(root, 'fixtures', 'suppressions.json'));
  const outputRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'immohrtal-c-'));
  const result = executeRun({ config, input, suppressions, runId: '20260824-120001', asOf, outputRoot });
  assert.equal(result.receipt.counts.awaiting_approval, 1);
  assert.equal(result.receipt.counts.suppressed, 1);
  assert.equal(result.receipt.counts.duplicate, 1);
});

test('Momentum 360 labeled sources and external-action config are rejected', () => {
  const input = loadInput(path.join(root, 'fixtures', 'prospects.json'));
  input.source.label = 'Momentum 360 export';
  const outputRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'immohrtal-d-'));
  assert.throws(() => executeRun({ config, input, suppressions: [], runId: '20260824-120002', asOf, outputRoot }), /Momentum 360 sources are forbidden/);
  const unsafe = structuredClone(config);
  unsafe.policy.external_actions = true;
  const cleanInput = loadInput(path.join(root, 'fixtures', 'prospects.json'));
  assert.throws(() => executeRun({ config: unsafe, input: cleanInput, suppressions: [], runId: '20260824-120003', asOf, outputRoot }), /Fail-closed/);
});

