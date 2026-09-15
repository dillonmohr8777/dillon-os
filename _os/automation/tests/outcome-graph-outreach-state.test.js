'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { sha256 } = require('../lib/outcome-graph');
const {
  buildProjection,
  createMigrationPlan,
  transitionEntity,
  validateEntity,
  verifyProjection,
} = require('../lib/outcome-graph-outreach-state');

const NOW = '2026-08-24T22:50:00.000Z';

function entity(id, overrides = {}) {
  const contentHash = sha256(Buffer.from(`content:${id}`));
  return {
    schema_version: 1,
    entity_id: id,
    workflow_key: 'fixture_outreach',
    client_id: 'fixture-client',
    version: 1,
    updated_at: NOW,
    last_verified_at: NOW,
    source: {
      locator: 'fixture://canonical-source',
      record_key: `record-${id}`,
      sha256: sha256(Buffer.from(`source:${id}`)),
      captured_at: NOW,
    },
    content_sha256: contentHash,
    batch_wave: null,
    state: {
      eligibility: 'call_ready',
      eligibility_reason: 'source-verified',
      presentation: 'cleared_to_show',
      outreach: 'not_prepared',
    },
    approval: null,
    delivery: null,
    history: [],
    ...overrides,
  };
}

test('cleared to show is a presentation state and never implies outreach approval', () => {
  const row = entity('entity0001');
  assert.equal(validateEntity(row).ok, true);
  assert.equal(row.state.presentation, 'cleared_to_show');
  assert.equal(row.state.outreach, 'not_prepared');
  assert.equal(row.approval, null);

  const projection = buildProjection([row], 'call_list', NOW);
  assert.equal(projection.row_count, 1);
  assert.equal(projection.authority.title_is_not_send_approval, true);
  assert.equal(projection.authority.external_action_authorized, false);
});

test('versioned transitions reject stale writers and bind exact approval before send', () => {
  const pending = entity('entity0002', {
    state: {
      eligibility: 'call_ready',
      eligibility_reason: 'source-verified',
      presentation: 'cleared_to_show',
      outreach: 'approval_pending',
    },
  });
  assert.throws(() => transitionEntity(pending, {
    expected_version: 0,
    patch: { state: { outreach: 'approved' } },
    event: {
      actor: 'human',
      at: NOW,
      reason: 'fixture approval',
      evidence_sha256: 'a'.repeat(64),
    },
  }), /stale entity version/);

  assert.throws(() => transitionEntity(pending, {
    expected_version: 1,
    patch: {
      state: { outreach: 'approved' },
      approval: {
        receipt_sha256: 'b'.repeat(64),
        content_sha256: pending.content_sha256,
        approved_at: NOW,
      },
    },
    event: {
      actor: 'worker',
      at: NOW,
      reason: 'worker cannot approve',
      evidence_sha256: 'a'.repeat(64),
    },
  }), /only Marketing Chief or the human/);

  const approved = transitionEntity(pending, {
    expected_version: 1,
    patch: {
      state: { outreach: 'approved' },
      approval: {
        receipt_sha256: 'b'.repeat(64),
        content_sha256: pending.content_sha256,
        approved_at: NOW,
      },
    },
    event: {
      actor: 'human',
      at: NOW,
      reason: 'approved exact preview',
      evidence_sha256: 'a'.repeat(64),
    },
  });
  assert.equal(approved.version, 2);
  assert.equal(approved.approval.entity_version, 2);
  assert.equal(validateEntity(approved).ok, true);

  const sent = transitionEntity(approved, {
    expected_version: 2,
    patch: {
      state: { outreach: 'sent' },
      delivery: {
        readback_sha256: 'c'.repeat(64),
        sent_at: NOW,
      },
    },
    event: {
      actor: 'marketing-chief',
      at: NOW,
      reason: 'exact approved delivery with provider readback',
      evidence_sha256: 'd'.repeat(64),
    },
  });
  assert.equal(sent.version, 3);
  assert.equal(sent.approval.entity_version, 2);
  assert.equal(sent.delivery.approved_entity_version, 2);
  assert.equal(sent.delivery.sent_entity_version, 3);
  assert.equal(validateEntity(sent).ok, true);
});

test('all list views are generated projections and drift fails closed', () => {
  const rows = [
    entity('entity0011'),
    entity('entity0012', {
      state: {
        eligibility: 'hold',
        eligibility_reason: 'missing-disclosure',
        presentation: 'hidden',
        outreach: 'not_prepared',
      },
    }),
    entity('entity0013', {
      state: {
        eligibility: 'do_not_pitch',
        eligibility_reason: 'closed-business',
        presentation: 'hidden',
        outreach: 'suppressed',
      },
    }),
    entity('entity0014', { batch_wave: 1 }),
  ];
  const callList = buildProjection(rows, 'call_list', NOW);
  const hold = buildProjection(rows, 'hold', NOW);
  const doNotPitch = buildProjection(rows, 'do_not_pitch', NOW);
  const wave = buildProjection(rows, 'wave_1', NOW);
  assert.equal(callList.row_count, 2);
  assert.equal(hold.row_count, 1);
  assert.equal(doNotPitch.row_count, 1);
  assert.equal(wave.row_count, 1);
  assert.equal(verifyProjection(rows, callList).passed, true);

  const independentlyEdited = structuredClone(callList);
  independentlyEdited.rows[0].eligibility_reason = 'edited-outside-canonical-source';
  assert.equal(verifyProjection(rows, independentlyEdited).passed, false);
  assert.equal(verifyProjection(rows, independentlyEdited).findings.includes(
    'projection content differs from canonical rows'
  ), true);
});

test('live aggregate snapshot produces a privacy-safe blocked migration plan', () => {
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
  const plan = createMigrationPlan(snapshot, {
    generatedAt: NOW,
    snapshotLocator: 'System/outcome-graph/source-snapshots/google-drive-list-state-2026-08-24.json',
  });
  assert.equal(plan.current_state, 'blocked_requires_identity_and_projection_reconciliation');
  assert.deepEqual(plan.holds, [
    'momentum_assign_stable_identity_to_every_canonical_row',
    'momentum_reconcile_238_state_rows_to_236_declared_businesses',
    'momentum_prove_one_current_eligibility_state_per_identity',
    'franchise_repair_one_missing_prospect_id',
    'franchise_regenerate_wave_1_from_full_canonical_source',
    'franchise_supersede_conflicting_instruction_document',
  ]);
  assert.equal(plan.authority.plan_only, true);
  assert.equal(plan.authority.drive_write_attempted, false);
  const serialized = JSON.stringify(plan);
  assert.doesNotMatch(serialized, /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  assert.doesNotMatch(serialized, /https?:\/\//i);
});
