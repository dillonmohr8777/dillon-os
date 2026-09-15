'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { REPO_ROOT } = require('./fsutil');
const { sha256, stableJson } = require('./outcome-graph');

const ELIGIBILITY_STATES = Object.freeze(['call_ready', 'hold', 'do_not_pitch']);
const PRESENTATION_STATES = Object.freeze(['cleared_to_show', 'hidden']);
const OUTREACH_STATES = Object.freeze([
  'not_prepared',
  'draft_ready',
  'approval_pending',
  'approved',
  'sent',
  'suppressed',
]);

const OUTREACH_TRANSITIONS = Object.freeze({
  not_prepared: new Set(['not_prepared', 'draft_ready', 'suppressed']),
  draft_ready: new Set(['draft_ready', 'not_prepared', 'approval_pending', 'suppressed']),
  approval_pending: new Set(['approval_pending', 'draft_ready', 'approved', 'suppressed']),
  approved: new Set(['approved', 'approval_pending', 'sent', 'suppressed']),
  sent: new Set(['sent']),
  suppressed: new Set(['suppressed', 'not_prepared']),
});

function validSha(value) {
  return /^[a-f0-9]{64}$/i.test(String(value || ''));
}

function validIso(value) {
  return typeof value === 'string' && Number.isFinite(new Date(value).getTime());
}

function clone(value) {
  return structuredClone(value);
}

function normalize(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\.\/+/, '');
}

function validateEntity(entity) {
  const errors = [];
  if (entity?.schema_version !== 1) errors.push('schema_version must equal 1');
  if (!/^[a-z0-9][a-z0-9_-]{7,127}$/i.test(String(entity?.entity_id || ''))) {
    errors.push('entity_id must be a stable opaque identifier with at least 8 characters');
  }
  if (/[\s@:/]/.test(String(entity?.entity_id || ''))) {
    errors.push('entity_id must not contain an address, URL, whitespace, or provider locator');
  }
  if (!String(entity?.workflow_key || '').trim()) errors.push('workflow_key is required');
  if (!String(entity?.client_id || '').trim()) errors.push('client_id is required');
  if (!Number.isInteger(entity?.version) || entity.version < 1) errors.push('version must be a positive integer');
  if (!validIso(entity?.updated_at)) errors.push('updated_at must be an ISO timestamp');
  if (!validIso(entity?.last_verified_at)) errors.push('last_verified_at must be an ISO timestamp');
  if (!String(entity?.source?.locator || '').trim()) errors.push('source.locator is required');
  if (!String(entity?.source?.record_key || '').trim()) errors.push('source.record_key is required');
  if (!validSha(entity?.source?.sha256)) errors.push('source.sha256 must be a SHA-256');
  if (!validIso(entity?.source?.captured_at)) errors.push('source.captured_at must be an ISO timestamp');
  if (!validSha(entity?.content_sha256)) errors.push('content_sha256 must be a SHA-256');
  if (!ELIGIBILITY_STATES.includes(entity?.state?.eligibility)) errors.push('invalid eligibility state');
  if (!String(entity?.state?.eligibility_reason || '').trim()) errors.push('eligibility_reason is required');
  if (!PRESENTATION_STATES.includes(entity?.state?.presentation)) errors.push('invalid presentation state');
  if (!OUTREACH_STATES.includes(entity?.state?.outreach)) errors.push('invalid outreach state');
  if (entity?.batch_wave !== null && entity?.batch_wave !== undefined &&
      (!Number.isInteger(entity.batch_wave) || entity.batch_wave < 1)) {
    errors.push('batch_wave must be null or a positive integer');
  }
  if (entity?.state?.eligibility === 'do_not_pitch' &&
      !['not_prepared', 'suppressed'].includes(entity?.state?.outreach)) {
    errors.push('do_not_pitch entities cannot enter an outreach preparation or delivery state');
  }
  if (entity?.state?.eligibility === 'hold' &&
      ['approved', 'sent'].includes(entity?.state?.outreach)) {
    errors.push('held entities cannot be approved or sent');
  }
  if (['approved', 'sent'].includes(entity?.state?.outreach)) {
    if (!validSha(entity?.approval?.receipt_sha256)) errors.push('approved state requires an approval receipt SHA-256');
    if (!validSha(entity?.approval?.content_sha256)) errors.push('approved state requires an approved content SHA-256');
    const expectedApprovalVersion = entity.state.outreach === 'approved'
      ? entity.version
      : entity.version - 1;
    if (!Number.isInteger(entity?.approval?.entity_version) ||
        entity.approval.entity_version !== expectedApprovalVersion) {
      errors.push('approval must bind the exact approved entity version');
    }
    if (entity?.approval?.content_sha256 !== entity?.content_sha256) {
      errors.push('approval must bind the exact current content SHA-256');
    }
    if (!validIso(entity?.approval?.approved_at)) errors.push('approved state requires approved_at');
  }
  if (entity?.state?.outreach === 'sent') {
    if (!validSha(entity?.delivery?.readback_sha256)) errors.push('sent state requires a provider readback SHA-256');
    if (!validIso(entity?.delivery?.sent_at)) errors.push('sent state requires sent_at');
    if (entity?.delivery?.approved_entity_version !== entity?.approval?.entity_version) {
      errors.push('delivery must bind the exact approved entity version');
    }
    if (entity?.delivery?.sent_entity_version !== entity?.version) {
      errors.push('delivery must bind the exact sent entity version');
    }
  }
  return { ok: errors.length === 0, errors };
}

function assertValidEntity(entity) {
  const validation = validateEntity(entity);
  if (!validation.ok) throw new Error(validation.errors.join('; '));
  return entity;
}

function transitionEntity(entity, transition) {
  assertValidEntity(entity);
  if (!Number.isInteger(transition?.expected_version) || transition.expected_version !== entity.version) {
    throw new Error(`stale entity version: expected ${entity.version}, received ${transition?.expected_version}`);
  }
  if (!validSha(transition?.event?.evidence_sha256)) {
    throw new Error('transition event requires an evidence SHA-256');
  }
  if (!validIso(transition?.event?.at)) throw new Error('transition event requires an ISO timestamp');
  if (!String(transition?.event?.reason || '').trim()) throw new Error('transition event requires a reason');
  if (!['worker', 'marketing-chief', 'human'].includes(transition?.event?.actor)) {
    throw new Error('transition actor must be worker, marketing-chief, or human');
  }

  const next = clone(entity);
  next.version += 1;
  next.updated_at = transition.event.at;
  next.last_verified_at = transition.event.at;
  next.state = { ...next.state, ...(transition.patch?.state || {}) };
  if (Object.prototype.hasOwnProperty.call(transition.patch || {}, 'batch_wave')) {
    next.batch_wave = transition.patch.batch_wave;
  }
  if (transition.patch?.content_sha256) next.content_sha256 = transition.patch.content_sha256;
  if (Object.prototype.hasOwnProperty.call(transition.patch || {}, 'approval')) {
    next.approval = transition.patch.approval;
  }
  if (Object.prototype.hasOwnProperty.call(transition.patch || {}, 'delivery')) {
    next.delivery = transition.patch.delivery;
  }

  const oldOutreach = entity.state.outreach;
  const newOutreach = next.state.outreach;
  if (!OUTREACH_TRANSITIONS[oldOutreach]?.has(newOutreach)) {
    throw new Error(`invalid outreach transition ${oldOutreach} -> ${newOutreach}`);
  }
  if (newOutreach === 'approved') {
    if (!['marketing-chief', 'human'].includes(transition.event.actor)) {
      throw new Error('only Marketing Chief or the human may bind exact approval');
    }
    if (next.approval) next.approval.entity_version = next.version;
  }
  if (newOutreach === 'sent') {
    if (transition.event.actor !== 'human' && transition.event.actor !== 'marketing-chief') {
      throw new Error('a worker cannot transition an entity to sent');
    }
    if (next.approval?.entity_version !== entity.version) {
      throw new Error('send transition requires approval bound to the immediately prior entity version');
    }
    // The immutable approval stays bound to the pre-send version; delivery
    // records both that approved version and the new sent-state version.
    if (next.delivery) {
      next.delivery.approved_entity_version = entity.version;
      next.delivery.sent_entity_version = next.version;
    }
  }
  if (!['approved', 'sent'].includes(newOutreach)) {
    next.approval = null;
    next.delivery = null;
  }

  next.history = [...(entity.history || []), {
    event_id: transition.event.event_id || sha256(stableJson({
      entity_id: entity.entity_id,
      from_version: entity.version,
      to_version: next.version,
      evidence_sha256: transition.event.evidence_sha256,
      at: transition.event.at,
    })).slice(0, 24),
    from_version: entity.version,
    to_version: next.version,
    from_state: clone(entity.state),
    to_state: clone(next.state),
    actor: transition.event.actor,
    reason: transition.event.reason,
    evidence_sha256: transition.event.evidence_sha256,
    at: transition.event.at,
  }];
  assertValidEntity(next);
  return next;
}

function assertCanonicalSet(entities) {
  if (!Array.isArray(entities) || entities.length === 0) {
    throw new Error('canonical entity set must contain at least one row');
  }
  const ids = new Set();
  for (const entity of entities) {
    assertValidEntity(entity);
    if (ids.has(entity.entity_id)) throw new Error(`duplicate entity_id ${entity.entity_id}`);
    ids.add(entity.entity_id);
  }
  return entities;
}

function projectionPredicate(name, entity) {
  if (name === 'call_list') {
    return entity.state.eligibility === 'call_ready' && entity.state.presentation === 'cleared_to_show';
  }
  if (name === 'hold') return entity.state.eligibility === 'hold';
  if (name === 'do_not_pitch') return entity.state.eligibility === 'do_not_pitch';
  if (name === 'wave_1') return entity.batch_wave === 1;
  if (name === 'draft_ready') return ['draft_ready', 'approval_pending', 'approved'].includes(entity.state.outreach);
  throw new Error(`unknown projection ${name}`);
}

function buildProjection(entities, name, generatedAt) {
  assertCanonicalSet(entities);
  if (!validIso(generatedAt)) throw new Error('generatedAt must be an ISO timestamp');
  const rows = entities.filter((entity) => projectionPredicate(name, entity))
    .map((entity) => ({
      entity_id: entity.entity_id,
      entity_version: entity.version,
      content_sha256: entity.content_sha256,
      eligibility: entity.state.eligibility,
      eligibility_reason: entity.state.eligibility_reason,
      presentation: entity.state.presentation,
      outreach: entity.state.outreach,
      batch_wave: entity.batch_wave ?? null,
    }))
    .sort((a, b) => a.entity_id.localeCompare(b.entity_id));
  const canonicalBinding = entities.map((entity) => ({
    entity_id: entity.entity_id,
    version: entity.version,
    content_sha256: entity.content_sha256,
  })).sort((a, b) => a.entity_id.localeCompare(b.entity_id));
  return {
    schema_version: 1,
    projection: name,
    generated_at: generatedAt,
    generated_not_edited: true,
    row_count: rows.length,
    canonical_set_sha256: sha256(stableJson(canonicalBinding)),
    rows_sha256: sha256(stableJson(rows)),
    rows,
    authority: {
      projection_is_not_canonical_state: true,
      title_is_not_send_approval: true,
      external_action_authorized: false,
    },
  };
}

function verifyProjection(entities, artifact) {
  let expected;
  try {
    expected = buildProjection(entities, artifact?.projection, artifact?.generated_at);
  } catch (error) {
    return { passed: false, findings: [error.message] };
  }
  const findings = [];
  if (artifact?.generated_not_edited !== true) findings.push('projection is not marked generated-only');
  if (artifact?.row_count !== expected.row_count) findings.push('projection row count drifted');
  if (artifact?.canonical_set_sha256 !== expected.canonical_set_sha256) findings.push('canonical set binding drifted');
  if (artifact?.rows_sha256 !== expected.rows_sha256) findings.push('projection rows drifted');
  if (stableJson(artifact?.rows || []) !== stableJson(expected.rows)) findings.push('projection content differs from canonical rows');
  if (artifact?.authority?.title_is_not_send_approval !== true ||
      artifact?.authority?.external_action_authorized !== false) {
    findings.push('projection authority boundary drifted');
  }
  return { passed: findings.length === 0, findings, expected };
}

function createMigrationPlan(snapshot, options = {}) {
  if (!snapshot?.workflows?.momentum_concept_outreach || !snapshot?.workflows?.franchise_workshop) {
    throw new Error('snapshot must contain Momentum and franchise workflow aggregates');
  }
  const generatedAt = options.generatedAt || new Date().toISOString();
  const momentum = snapshot.workflows.momentum_concept_outreach;
  const franchise = snapshot.workflows.franchise_workshop;
  const holds = [];
  if (momentum.identity_integrity?.stable_identity_column_present !== true) {
    holds.push('momentum_assign_stable_identity_to_every_canonical_row');
  }
  if (momentum.identity_integrity?.unexplained_identity_delta !== 0) {
    holds.push('momentum_reconcile_238_state_rows_to_236_declared_businesses');
  }
  if (momentum.identity_integrity?.cross_state_exclusivity_provable !== true) {
    holds.push('momentum_prove_one_current_eligibility_state_per_identity');
  }
  if (franchise.full_send_ready_projection?.missing_prospect_id_rows !== 0) {
    holds.push('franchise_repair_one_missing_prospect_id');
  }
  if (franchise.projection_checks?.separate_wave_1_exact_projection !== true) {
    holds.push('franchise_regenerate_wave_1_from_full_canonical_source');
  }
  if (franchise.documentation_checks?.one_unambiguous_current_instruction_source !== true) {
    holds.push('franchise_supersede_conflicting_instruction_document');
  }
  return {
    schema_version: 1,
    generated_at: generatedAt,
    source_snapshot: {
      locator: options.snapshotLocator || 'privacy-safe Google Drive list snapshot',
      sha256: sha256(stableJson(snapshot)),
      captured_at: snapshot.captured_at,
    },
    objective: 'Replace independently editable list sheets with one versioned identity-keyed canonical state table and generated read-only projections.',
    current_state: holds.length === 0 ? 'ready_for_controlled_migration' : 'blocked_requires_identity_and_projection_reconciliation',
    holds,
    target_model: {
      canonical_unit: 'one opaque stable entity_id per real business or prospect',
      separate_state_dimensions: ['eligibility', 'presentation', 'outreach', 'approval', 'delivery'],
      transition_contract: ['expected_version', 'from_state', 'to_state', 'reason', 'actor', 'evidence_sha256', 'timestamp'],
      required_bindings: ['source_sha256', 'content_sha256', 'entity_version', 'instruction_version', 'approval_receipt_sha256', 'delivery_readback_sha256'],
      generated_projections: ['call_list', 'hold', 'do_not_pitch', 'wave_1', 'draft_ready'],
    },
    migration_sequence: [
      'Freeze independent edits and export one read-only source snapshot.',
      'Assign or repair opaque stable IDs in the full canonical source.',
      'Reconcile duplicate identities and the 238-versus-236 Momentum delta.',
      'Choose exactly one eligibility state and reason per identity.',
      'Separate presentation clearance from outreach and approval state.',
      'Regenerate CALL LIST, HOLD, DO NOT PITCH, Wave 1, and draft-ready views from queries.',
      'Make one versioned instruction document current and mark predecessors superseded.',
      'Run exact row, hash, projection, privacy, and approval-boundary readback before adoption.',
    ],
    acceptance_assertions: [
      'Every canonical row has one unique stable entity_id and current entity_version.',
      'Momentum distinct identities, state rows, and duplicate resolution reconcile exactly.',
      'Every generated projection exactly reproduces from the bound canonical set hash.',
      'The franchise full source has 720 of 720 stable IDs and Wave 1 matches 50 of 50 rows exactly.',
      'Exactly one current instruction version governs each workflow.',
      'Cleared to show, draft ready, verified outcome, exact approval, and sent readback remain separate states.',
    ],
    authority: {
      plan_only: true,
      drive_write_attempted: false,
      contact_mutation_attempted: false,
      send_attempted: false,
      canonical_queue_write_attempted: false,
      exact_human_approval_still_required: true,
    },
  };
}

function planMigrationFile(snapshotFile, options = {}) {
  const absolute = path.resolve(snapshotFile);
  const repoRoot = path.resolve(options.repoRoot || REPO_ROOT);
  if (absolute !== repoRoot && !absolute.startsWith(repoRoot + path.sep)) {
    throw new Error('snapshot path escapes the repository');
  }
  const snapshot = JSON.parse(fs.readFileSync(absolute, 'utf8').replace(/^\uFEFF/, ''));
  return createMigrationPlan(snapshot, {
    ...options,
    snapshotLocator: normalize(path.relative(repoRoot, absolute)),
  });
}

module.exports = {
  ELIGIBILITY_STATES,
  OUTREACH_STATES,
  PRESENTATION_STATES,
  assertCanonicalSet,
  buildProjection,
  createMigrationPlan,
  planMigrationFile,
  transitionEntity,
  validateEntity,
  verifyProjection,
};
