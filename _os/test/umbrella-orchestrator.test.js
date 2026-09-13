/**
 * Umbrella workflow orchestrator tests.
 * Run: node --test _os/test/umbrella-orchestrator.test.js
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  loadWorkflow,
  runWorkflow,
  isWeekday,
  checkEnv,
} = require('../automation/lib/umbrella-workflow');

const VAULT = path.resolve(__dirname, '..', '..');
const WORKFLOW = path.join(VAULT, '12_Brain/registry/umbrella-workflow.json');

describe('umbrella workflow registry', () => {
  it('loads competitive-task-orchestrator with ordered phases', () => {
    const wf = loadWorkflow(WORKFLOW);
    assert.equal(wf.workflow_id, 'competitive-task-orchestrator');
    const ids = wf.phases.map((p) => p.phase_id);
    assert.deepEqual(ids, ['preflight', 'intel', 'morning', 'learn', 'hygiene', 'synthesize']);
    assert.ok(wf.supersedes.length >= 3);
  });

  it('intel phase has parallel command lanes', () => {
    const wf = loadWorkflow(WORKFLOW);
    const intel = wf.phases.find((p) => p.phase_id === 'intel');
    assert.equal(intel.parallel, true);
    assert.ok(intel.lanes.some((l) => l.lane_id === 'predict-work'));
    assert.ok(intel.lanes.some((l) => l.lane_id === 'connector-health'));
  });

  it('workflow pointer exists', () => {
    const ptr = path.join(VAULT, '_os/automation/workflows/competitive-task-orchestrator.json');
    assert.equal(fs.existsSync(ptr), true);
  });
});

describe('umbrella workflow runner', () => {
  it('dry-run completes all phases without executing commands', async () => {
    const receipt = await runWorkflow({
      workflowPath: WORKFLOW,
      repoRoot: VAULT,
      dryRun: true,
      weekdaysOnly: false,
    });
    assert.equal(receipt.workflow_id, 'competitive-task-orchestrator');
    assert.equal(receipt.phases.length, 6);
    assert.ok(receipt.phases.every((p) => (p.lanes || []).every((l) => l.status === 'dry-run')));
  });

  it('preflight env check returns structured warnings when unset', () => {
    const prev = process.env.DILLON_CLIENT_OPERATIONS_ROOT;
    delete process.env.DILLON_CLIENT_OPERATIONS_ROOT;
    const result = checkEnv(loadWorkflow(WORKFLOW));
    assert.ok(result.warnings.length >= 1);
    if (prev) process.env.DILLON_CLIENT_OPERATIONS_ROOT = prev;
  });

  it('isWeekday matches Mon-Fri UTC', () => {
    assert.equal(isWeekday(new Date('2026-09-08T12:00:00Z')), true);
    assert.equal(isWeekday(new Date('2026-09-06T12:00:00Z')), false);
  });
});
