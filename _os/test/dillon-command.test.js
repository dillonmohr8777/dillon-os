/**
 * Dillon Command Center umbrella workflow tests.
 * Run: node --test _os/test/dillon-command.test.js
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  loadProfile,
  runCycle,
  listSlackInbox,
  scanApprovalQueue,
  rankP0,
} = require('../automation/lib/dillon-command');

const VAULT = path.resolve(__dirname, '..', '..');

describe('Dillon Command Center profile', () => {
  it('loads eight parallel lanes', () => {
    const profile = loadProfile();
    assert.equal(profile.workflow_id, 'dillon-command');
    assert.equal(profile.parallel_lanes, 8);
    assert.ok(profile.lanes.comms);
    assert.ok(profile.lanes.command);
    assert.equal(profile.lanes.command.depends_on.length, 7);
  });
});

describe('Vault collectors', () => {
  it('finds slack inbox files', () => {
    const items = listSlackInbox();
    assert.ok(Array.isArray(items));
    assert.ok(items.length >= 4, 'expected stale slack inbox fixtures');
  });

  it('parses approval queue counts', () => {
    const q = scanApprovalQueue();
    assert.ok(q.total > 0);
    assert.ok(q.items.length > 0);
  });
});

describe('Umbrella cycle', () => {
  it('dry-run completes all lanes without writing artifacts', async () => {
    const { runState, workerLanes, board } = await runCycle({ dryRun: true, agentMode: true });
    assert.equal(runState.workflow_id, 'dillon-command');
    assert.equal(runState.external_action_attempted, 'none');
    assert.equal(Object.keys(workerLanes).length, 8);
    assert.match(board, /P0 stack/);
    assert.ok(workerLanes.command.synthesis);
  });

  it('live run writes artifacts and state', async () => {
    const date = new Date().toISOString().slice(0, 10);
    const { runState } = await runCycle({ agentMode: true, date });
    const runDir = path.join(VAULT, 'automation-runs/dillon-command', date);
    assert.ok(fs.existsSync(path.join(runDir, 'approval-board.md')));
    assert.ok(fs.existsSync(path.join(runDir, 'run-state.json')));
    assert.ok(fs.existsSync(path.join(VAULT, 'Daily-Briefs', `am-report-${date}.md`)));
    assert.ok(fs.existsSync(path.join(VAULT, '12_Brain/state/dillon-command.json')));
    assert.equal(runState.lanes.length, 8);
  });
});

describe('P0 ranking', () => {
  it('surfaces urgent slack and billing items first', () => {
    const lanes = {
      comms: {
        lane: 'comms',
        collectors: {
          slack_inbox: {
            items: [{ title: 'Bot alert', client: 'Momentum', priority: 'urgent', file: 'x.md' }],
          },
        },
        tasks: [],
      },
      ads: {
        lane: 'ads',
        collectors: {
          approval_ads_items: [{ line: 'Replenish billing blocked', client: 'Replenish', risk: 'high' }],
        },
        tasks: [],
      },
    };
    const p0 = rankP0(lanes);
    assert.ok(p0.length >= 2);
    assert.match(p0[0].title, /Bot alert|billing/i);
  });
});
