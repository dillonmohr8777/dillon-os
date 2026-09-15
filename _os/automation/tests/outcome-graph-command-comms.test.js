'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { sha256, stableJson } = require('../lib/outcome-graph');
const {
  FINAL_NAMES,
  evaluateDriveList,
  runCommandCommsDurable,
} = require('../lib/outcome-graph-command-comms');

function fixtureSources() {
  const window = {
    prepared: '2026-08-24',
    period_start: '2026-08-17',
    period_end: '2026-08-23',
    month: '2026-08',
  };
  const rankingProbe = {
    passed: true,
    exit_code: 0,
    signal: null,
    timed_out: false,
    failure_kind: null,
    client_id: null,
    stdout_sha256: 'a'.repeat(64),
    stderr_sha256: 'b'.repeat(64),
  };
  rankingProbe.probe_sha256 = sha256(stableJson(rankingProbe));
  const manifest = [
    { locator: 'fixture/queue.json', sha256: '1'.repeat(64), bytes: 100 },
    { locator: 'fixture/registry.json', sha256: '2'.repeat(64), bytes: 100 },
    { locator: 'fixture/drafts.json', sha256: '3'.repeat(64), bytes: 100 },
    { locator: 'runtime://fixture/ranking', sha256: rankingProbe.probe_sha256, bytes: 100 },
  ];
  return {
    captured_at: new Date().toISOString(),
    as_of: '2026-08-24T16:00:00.000Z',
    window,
    queue: {
      locator: 'client-operations/queue/work-items.json',
      sha256: '1'.repeat(64),
      revision: 9,
      updated_at: '2026-08-24T15:00:00.000Z',
      mode: 'manual-pilot',
      wip_policy: {},
      items: [{
        id: 'wi-fixture',
        version: 2,
        dedupe_key: 'fixture:week:W01',
        client_id: 'fixture-client',
        title: 'Finish the fixture outcome',
        status: 'verification',
        lane: 'normal',
        priority: { level: 'P1', rationale: 'Fixture evidence.' },
        owner: 'marketing-chief',
        next_action: 'Verify the fixture artifact.',
        due_at: '2026-08-25T16:00:00.000Z',
        review_at: null,
        updated_at: '2026-08-24T15:00:00.000Z',
        routing: {
          status: 'resolved',
          registryStatus: 'active',
          verifiedAt: '2026-08-24T14:00:00.000Z',
        },
        evidence: {
          as_of: '2026-08-24T14:00:00.000Z',
          freshness: 'current',
          ref_count: 1,
        },
        execution: { actionClass: 'read_only_verification' },
        approval: { tier: 'automatic', status: 'not_required' },
        definition_of_done_count: 1,
      }],
    },
    registry: {
      locator: 'client-operations/registry/clients.json',
      sha256: '2'.repeat(64),
      clients: [{ id: 'fixture-client', status: 'active', display_name: 'Fixture Client' }],
    },
    portfolio: {
      locator: 'client-operations/state/portfolio-priorities.json',
      sha256: '4'.repeat(64),
      generated_at: '2026-08-24T14:00:00.000Z',
      entries: [{
        client_id: 'fixture-client',
        route_status: 'resolved',
        rank: 1,
        tier: 'critical',
        active_work_eligible: true,
      }],
    },
    control: {
      locator: 'client-operations/CONTROL.md',
      sha256: '5'.repeat(64),
      queue_revision: 9,
    },
    system_health: {
      locator: 'client-operations/state/system-health.json',
      sha256: '6'.repeat(64),
      as_of: '2026-08-24T15:00:00.000Z',
      overall: 'healthy',
      reported_queue_revision: 9,
      warning_count: 0,
    },
    ranking_probe: rankingProbe,
    drafts: {
      locator: 'System/outcome-graph/source-snapshots/fixture-drafts.json',
      sha256: '3'.repeat(64),
      source_set_sha256: '7'.repeat(64),
      signature_contract_sha256: '8'.repeat(64),
      connector_receipt: {
        list_pages: 1,
        pagination_complete: true,
        drafts_in_window: 2,
        threads_requested: 2,
        threads_returned: 2,
      },
      privacy: {
        redacted: true,
        contains_secrets: false,
        contains_direct_identifiers: false,
        contains_raw_communications: false,
      },
      authority: { draft_only: true, send_authorized: false, canonical_write_authorized: false },
      items: [
        {
          draft_key: 'draft-good',
          input_fingerprint: '9'.repeat(64),
          captured_timestamp: '2026-08-20T12:00:00.000Z',
          client_route: { status: 'resolved_active', candidates: ['fixture-client'] },
          thread_context: { kind: 'reply_thread', reply_all_parity: true },
          checks: {
            complete_readback: true,
            draft_label: true,
            subject_present: true,
            primary_recipient_present: true,
            own_address_excluded: true,
            quoted_history_absent: true,
            canonical_signature_markers: true,
            rendered_dash_absent: true,
            canonical_source_bound: true,
          },
          recipient_counts: { to: 1, cc: 1, bcc: 0 },
          has_attachment: false,
          approval_state: 'pending_exact_preview_approval',
          external_action_attempted: false,
        },
        {
          draft_key: 'draft-held',
          input_fingerprint: '0'.repeat(64),
          captured_timestamp: '2026-08-21T12:00:00.000Z',
          client_route: { status: 'unresolved', candidates: [] },
          thread_context: { kind: 'new_thread', reply_all_parity: null },
          checks: {
            complete_readback: true,
            draft_label: true,
            subject_present: true,
            primary_recipient_present: true,
            own_address_excluded: true,
            quoted_history_absent: true,
            canonical_signature_markers: true,
            rendered_dash_absent: false,
            canonical_source_bound: false,
          },
          recipient_counts: { to: 1, cc: 0, bcc: 0 },
          has_attachment: false,
          approval_state: 'pending_exact_preview_approval',
          external_action_attempted: false,
        },
      ],
    },
    context: {
      w10: {
        locator: 'fixture/W10.json',
        sha256: 'f'.repeat(64),
        proposal_only: true,
        canonical_write_attempted: false,
        external_action_attempted: false,
        ranked_proposals: 1,
      },
    },
    source_manifest: manifest,
    source_set_sha256: sha256(stableJson(manifest)),
  };
}

test('W07 Drive-list verifier detects identity, projection, and instruction drift', () => {
  const snapshot = JSON.parse(fs.readFileSync(path.join(
    __dirname,
    '..',
    '..',
    '..',
    'System',
    'outcome-graph',
    'source-snapshots',
    'google-drive-list-state-2026-08-24.json'
  ), 'utf8'));

  const records = Object.entries(snapshot.workflows).map(([workflowKey, workflow]) =>
    evaluateDriveList({
      workflow_key: workflowKey,
      workflow,
      captured_at: snapshot.captured_at,
      as_of: '2026-08-24T23:59:59.999Z',
      source_locator: 'fixture/google-drive-list-state.json',
      source_sha256: 'd'.repeat(64),
    })
  );

  const momentum = records.find((record) => record.workflow_key === 'momentum_concept_outreach');
  const franchise = records.find((record) => record.workflow_key === 'franchise_workshop');
  assert.deepEqual(momentum.findings, [
    'canonical_row_identity_present',
    'declared_distinct_business_count_reconciled',
    'cross_state_exclusivity_provable',
  ]);
  assert.deepEqual(franchise.findings, [
    'every_full_source_row_has_stable_identity',
    'wave_1_is_exact_projection',
    'one_current_instruction_source',
  ]);
  assert.equal(records.every((record) => record.ready_for_draft_generation === false), true);
  assert.equal(records.every((record) => record.external_action_attempted === false), true);
});

test('W01 W07 readiness shadow preserves negative truth, privacy, authority, and dedupe', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'command-comms-test-'));
  const outputDir = path.join(root, 'output');
  const stateRoot = path.join(root, 'state');
  const template = fixtureSources();
  const collectSources = async () => ({
    ...structuredClone(template),
    captured_at: new Date().toISOString(),
  });
  const options = {
    outputDir,
    stateRoot,
    logicalRoot: 'fixture-command-comms',
    safeOutput: false,
    collectSources,
    window: template.window,
  };

  try {
    const first = await runCommandCommsDurable(options);
    assert.equal(first.outcome, 'complete');
    assert.equal(first.terminal_truth, true);
    assert.equal(first.deduped, false);
    assert.equal(first.graph_iterations[0].workers.length, 5);

    const w01 = JSON.parse(fs.readFileSync(path.join(outputDir, FINAL_NAMES[0]), 'utf8'));
    const w07 = JSON.parse(fs.readFileSync(path.join(outputDir, FINAL_NAMES[1]), 'utf8'));
    assert.equal(w01.workflow_ready, true);
    assert.equal(w01.summary.ready_items, 1);
    assert.equal(w07.workflow_ready, false);
    assert.equal(w07.summary.drafts, 2);
    assert.equal(w07.summary.ready_for_exact_preview, 1);
    assert.equal(w07.summary.unresolved_routes, 1);
    assert.equal(w07.summary.dash_rule_failed, 1);
    assert.equal(w07.summary.missing_canonical_source_binding, 1);
    assert.equal(w07.authority.external_action_attempted, false);

    const published = FINAL_NAMES.map((name) =>
      fs.readFileSync(path.join(outputDir, name), 'utf8')
    ).join('\n');
    assert.doesNotMatch(published, /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
    assert.doesNotMatch(published, /draft_id|message_id|thread_id|snippet/i);
    assert.doesNotMatch(published, /resume_locator/i);

    const duplicate = await runCommandCommsDurable(options);
    assert.equal(duplicate.outcome, 'complete');
    assert.equal(duplicate.deduped, true);
    assert.equal(duplicate.run_id, first.run_id);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
