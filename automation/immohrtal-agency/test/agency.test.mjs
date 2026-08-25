import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { loadInput, loadSuppressions, parseCsv } from '../src/input-adapters.mjs';
import { executeRun } from '../src/orchestrator.mjs';
import { STATES, discovered, transition } from '../src/state-machine.mjs';
import { buildDriveSnapshot } from '../src/drive-snapshot-adapter.mjs';
import { extractHtmlEvidence } from '../src/evidence.mjs';
import { Relay } from '../src/agents.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const config = JSON.parse(fs.readFileSync(path.join(root, 'config', 'default.json'), 'utf8'));
const asOf = '2026-08-24T12:00:00.000Z';

test('state machine rejects skipping maker-checker stages', () => {
  const record = discovered({ prospect_id: 'x' }, asOf);
  assert.throws(() => transition(record, STATES.AWAITING_APPROVAL, 'test', asOf), /Illegal state transition/);
});

test('Relay always uses the canonical IMMOHRTAL outreach identity', () => {
  const legacyBrand = ['MOHR', 'MEDIA'].join(' ');
  const legacyDomain = ['themohr', 'media.com'].join('');
  const draft = Relay.run(
    {
      company_name: 'Example Company',
      contact_name: 'Casey',
      website: 'https://example.test',
      concept_url: 'https://concept.example.test'
    },
    { live_evidence: null },
    { workstreams: [{ name: 'Website optimization' }] },
    { name: 'Dillon Mohr', business_name: legacyBrand }
  );

  assert.match(draft.body, /\nIMMOHRTAL Marketing Solutions\nhttps:\/\/www\.immohrtalmarketing\.com$/);
  assert.equal(draft.body.toLowerCase().includes(legacyDomain), false);
  assert.equal(draft.body.includes(legacyBrand), false);
  assert.equal(/[-–—]/u.test(draft.body), false);
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
  assert.deepEqual(first.receipt.external_actions, { gmail_drafts_created: 0, sent: 0, published: 0, spend_changes: 0, crm_writes: 0, credential_accesses: 0 });
  assert.ok(fs.existsSync(path.join(first.runDir, 'gmail-draft-manifest.json')));
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

test('legacy scheduled source is disabled and the canonical replacement is research only', () => {
  const legacy = JSON.parse(fs.readFileSync(path.join(root, 'config', 'source-metadata.json'), 'utf8'));
  const replacement = JSON.parse(fs.readFileSync(path.join(root, 'config', 'requalification-source.json'), 'utf8'));
  const runner = fs.readFileSync(path.join(root, 'Run-ImmohrtalAgencyDaily.ps1'), 'utf8');
  const installer = fs.readFileSync(path.join(root, 'Install-ImmohrtalAgencySchedule.ps1'), 'utf8');

  assert.equal(legacy.disabled, true);
  assert.equal(legacy.sources.cleared.sheet_id, '1mK1di7eMV6SUI226pwEoFrA-7pBkV_3y2BG5PwDIiwY');
  assert.equal(legacy.canonical_replacement.sheet_id, replacement.sheet_id);
  assert.equal(replacement.outreach_ready, false);
  assert.equal(replacement.external_actions_authorized, false);
  assert.match(runner, /Fail-closed source isolation/);
  assert.match(runner, /canonical replacement is research only/);
  assert.match(installer, /Schedule installation is blocked by source isolation/);
  assert.match(installer, /canonical replacement is research only/);
  assert.match(installer, /configured source is not the authorized IMMOHRTAL Sheet/);
});

test('Drive snapshot adapter imports only email-ready allowlist rows and builds hard suppressions', () => {
  const metadata = {
    source_id: 'drive', default_market: 'Philadelphia region',
    sources: {
      cleared: { sheet_id: 'allow', title: 'CALL LIST', tab: 'Untitled', modified_time: asOf },
      hold: { sheet_id: 'hold' }, do_not_pitch: { sheet_id: 'dnc' }
    }
  };
  const result = buildDriveSnapshot({
    metadata, capturedAt: asOf,
    clearedText: ',Business,Best email,Our concept,Vertical\n0,Alpha,hello@alpha.test,https://example.com/alpha,plumber\n1,Beta,,https://example.com/beta,roofing\n',
    holdText: ',Business,Fix,Their site\n0,Hold Co,Needs review,https://hold.test\n',
    doNotPitchText: ',Business,Why,Their site\n0,Skip Co,Closed,https://skip.test\n'
  });
  assert.equal(result.input.prospects.length, 1);
  assert.equal(result.input.prospects[0].website_kind, 'prebuilt_concept');
  assert.equal(result.suppressions.entries.filter((entry) => entry.type === 'company').length, 2);
  assert.equal(result.counts.excluded_without_email_or_concept, 1);
});

test('HTML evidence extractor returns bounded title, h1, and description', () => {
  const evidence = extractHtmlEvidence('<html><head><title> Alpha &amp; Co </title><meta name="description" content="Clear local service."></head><body><h1>Built for people</h1></body></html>');
  assert.deepEqual(evidence, { title: 'Alpha & Co', h1: 'Built for people', meta_description: 'Clear local service.' });
});
