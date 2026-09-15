'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { sha256 } = require('../lib/outcome-graph');
const {
  EXECUTABLE_ROUTINE_IDS,
  GOVERNED_WEEKLY_ROUTE_IDS,
  createRoutineCatalogReport,
  verifyRoutineEvidence,
} = require('../lib/outcome-graph-routine-catalog');

const GENERATED_AT = '2026-08-24T22:40:00.000Z';

test('routine catalog gives all 29 executable routines explicit valid outcome contracts', () => {
  const report = createRoutineCatalogReport({ generatedAt: GENERATED_AT });
  assert.equal(report.source.executable_routines, 29);
  assert.deepEqual(report.routines.map((item) => item.routine_id), EXECUTABLE_ROUTINE_IDS);
  assert.equal(report.audit.catalog_finish_line_met, true);
  assert.equal(report.audit.counts.explicit_outcome_contracts, 29);
  assert.equal(report.audit.counts.executable_terminal_specs, 29);
  assert.equal(report.audit.counts.contract_complete, 29);
  assert.equal(report.audit.counts.deep_shadow_verified, 29);
  assert.equal(report.audit.counts.contract_defined_shadow_pending, 0);
  assert.equal(report.audit.counts.governed_weekly_route_contracts, 4);
  assert.equal(report.audit.counts.governed_weekly_readiness_verified, 4);
  assert.equal(report.audit.counts.paid_media_weekly_shadow_pending, 0);
  assert.deepEqual(report.governed_weekly_routes.map((item) => item.routine_id), GOVERNED_WEEKLY_ROUTE_IDS);
  assert.equal(report.governed_weekly_routes.every((item) =>
    item.registry_execution_allowed === false &&
    item.execution_authority === 'read_only_shadow_verification_only'
  ), true);
  assert.equal(report.audit.legacy_retirement_ready, true);
  assert.equal(report.audit.scheduler_cutover_authorized, false);
  assert.match(report.audit.legacy_retirement_reason, /explicit Marketing Chief cutover review/);
  assert.deepEqual(report.audit.errors, []);
  assert.equal(report.audit.routines.every((item) =>
    item.objective_present &&
    item.source_freshness_present &&
    item.required_artifact_roles > 0 &&
    item.terminal_assertions >= 3 &&
    item.independent_verifier &&
    item.stopping_limits_present &&
    item.canonical_binding_required &&
    item.isolated_checkpoint &&
    item.rollback_present &&
    item.approval_separate &&
    item.learning_present
  ), true);
});

test('routine terminal verifier requires real artifact hashes and every routine-specific assertion', () => {
  const report = createRoutineCatalogReport({ generatedAt: GENERATED_AT });
  const record = report.routines.find((item) => item.routine_id === 'D10');
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'routine-catalog-test-'));
  const relativeRoot = 'System/outcome-graph/routines/D10/canary';
  const files = [
    {
      role: 'deliverable_contract',
      path: `${relativeRoot}/deliverable-contract.json`,
      body: JSON.stringify({ objective: 'Produce one reviewable fixture.' }),
    },
    {
      role: 'source_binding',
      path: `${relativeRoot}/source-binding.json`,
      body: JSON.stringify({ locator: 'fixture://request' }),
    },
  ];
  try {
    for (const file of files) {
      const absolute = path.join(root, file.path);
      fs.mkdirSync(path.dirname(absolute), { recursive: true });
      fs.writeFileSync(absolute, file.body, 'utf8');
      file.sha256 = sha256(Buffer.from(file.body));
      file.bytes = Buffer.byteLength(file.body);
      delete file.body;
    }
    const sourceHash = 'a'.repeat(64);
    const evidence = {
      routine_id: 'D10',
      canonical_binding: {
        locator: 'fixture://canonical/request',
        version: 'v1',
        sha256: 'b'.repeat(64),
        captured_at: GENERATED_AT,
      },
      source: {
        probe: record.terminal_spec.source_probe,
        items: [{
          locator: 'fixture://request-source',
          sha256: sourceHash,
          bytes: 100,
          captured_at: GENERATED_AT,
        }],
      },
      artifacts: files,
      measurements: record.terminal_spec.assertions.map((item) => ({
        id: item.id,
        passed: true,
        evidence_sha256s: [sourceHash, files[0].sha256],
      })),
      maker: { adapter: record.contract.adapters.maker },
      checker: { adapter: record.contract.adapters.checker, passed: true },
      authority: {
        outcome_state: 'verified_not_adopted',
        external_action_attempted: false,
        canonical_write_attempted: false,
      },
      learning: {
        correction_receipt_sha256: 'c'.repeat(64),
        drift_fingerprint: 'd'.repeat(64),
      },
    };

    const passed = verifyRoutineEvidence(record, evidence, {
      repoRoot: root,
      now: GENERATED_AT,
    });
    assert.equal(passed.passed, true);
    assert.equal(passed.artifact_manifest.length, 2);

    const falseCompletion = structuredClone(evidence);
    falseCompletion.measurements = falseCompletion.measurements.slice(0, -1);
    const rejected = verifyRoutineEvidence(record, falseCompletion, {
      repoRoot: root,
      now: GENERATED_AT,
    });
    assert.equal(rejected.passed, false);
    assert.equal(rejected.assertions.some((item) =>
      item.id === `predicate-${record.terminal_spec.assertions.at(-1).id}` && !item.passed
    ), true);

    fs.writeFileSync(path.join(root, files[0].path), '{"changed":true}', 'utf8');
    const drifted = verifyRoutineEvidence(record, evidence, {
      repoRoot: root,
      now: GENERATED_AT,
    });
    assert.equal(drifted.passed, false);
    assert.equal(drifted.assertions.some((item) =>
      item.id === 'artifact-deliverable_contract' && !item.passed
    ), true);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('shared terminal verifier executes all 29 routines and four governed weekly routes', () => {
  const report = createRoutineCatalogReport({ generatedAt: GENERATED_AT });
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'routine-catalog-all-test-'));
  try {
    for (const record of [...report.routines, ...report.governed_weekly_routes]) {
      const sourceHash = sha256(Buffer.from(`source:${record.routine_id}`));
      const artifacts = record.terminal_spec.required_artifact_roles.map((required, index) => {
        const relative = required.pattern.replace(/\*/g, 'canary');
        const absolute = path.join(root, relative);
        const body = JSON.stringify({ routine_id: record.routine_id, role: required.role, index });
        fs.mkdirSync(path.dirname(absolute), { recursive: true });
        fs.writeFileSync(absolute, body, 'utf8');
        return {
          role: required.role,
          path: relative,
          sha256: sha256(Buffer.from(body)),
          bytes: Buffer.byteLength(body),
        };
      });
      const evidence = {
        routine_id: record.routine_id,
        canonical_binding: {
          locator: `fixture://canonical/${record.routine_id}`,
          version: 'v1',
          sha256: sha256(Buffer.from(`binding:${record.routine_id}`)),
          captured_at: GENERATED_AT,
        },
        source: {
          probe: record.terminal_spec.source_probe,
          items: [{
            locator: `fixture://source/${record.routine_id}`,
            sha256: sourceHash,
            bytes: 100,
            captured_at: GENERATED_AT,
          }],
        },
        artifacts,
        measurements: record.terminal_spec.assertions.map((item) => ({
          id: item.id,
          passed: true,
          evidence_sha256s: [sourceHash, artifacts[0].sha256],
        })),
        maker: { adapter: record.contract.adapters.maker },
        checker: { adapter: record.contract.adapters.checker, passed: true },
        authority: {
          outcome_state: 'verified_not_adopted',
          external_action_attempted: false,
          canonical_write_attempted: false,
        },
        learning: {
          correction_receipt_sha256: sha256(Buffer.from(`correction:${record.routine_id}`)),
          drift_fingerprint: sha256(Buffer.from(`drift:${record.routine_id}`)),
        },
      };
      const verdict = verifyRoutineEvidence(record, evidence, {
        repoRoot: root,
        now: GENERATED_AT,
      });
      assert.equal(verdict.passed, true, `${record.routine_id} positive canary should pass`);

      const falseCompletion = structuredClone(evidence);
      falseCompletion.measurements[0].passed = false;
      const rejected = verifyRoutineEvidence(record, falseCompletion, {
        repoRoot: root,
        now: GENERATED_AT,
      });
      assert.equal(rejected.passed, false, `${record.routine_id} false-completion canary should fail`);
    }
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
