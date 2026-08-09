'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const {
  AUTOMATION_ID,
  LANES,
  buildPlan,
  writePlan,
  writeBoard,
  scanSlackInbox,
  scanClientPulse,
} = require('../lib/command-loop');
const { repoPath } = require('../lib/fsutil');

test('command-loop defines seven lanes with memory-consolidator sequential', () => {
  assert.equal(LANES.length, 7);
  const parallel = LANES.filter((l) => l.parallel);
  const consolidator = LANES.find((l) => l.id === 'memory-consolidator');
  assert.equal(parallel.length, 6);
  assert.equal(consolidator.parallel, false);
  assert.ok(consolidator.depends_on.length >= 6);
});

test('buildPlan includes vault snapshot and blockers', () => {
  const plan = buildPlan({ date: '2026-08-09' });
  assert.equal(plan.automation_id, AUTOMATION_ID);
  assert.equal(plan.date, '2026-08-09');
  assert.ok(plan.vault_snapshot.slack);
  assert.ok(plan.vault_snapshot.clients);
  assert.ok(Array.isArray(plan.lanes));
  assert.ok(Array.isArray(plan.blockers));
});

test('scanSlackInbox finds new items in fixtures', () => {
  const slack = scanSlackInbox();
  assert.ok(slack.total >= 4);
  assert.ok(slack.new >= 4);
});

test('scanClientPulse surfaces urgent clients', () => {
  const clients = scanClientPulse();
  assert.ok(clients.total > 0);
  const atRisk = clients.urgent.find((c) => c.client === 'Hardwood Artisan');
  assert.ok(atRisk);
  assert.equal(atRisk.status, 'at_risk');
});

test('writePlan and writeBoard create run artifacts', () => {
  const plan = buildPlan({ date: '2099-01-01' });
  const planFile = writePlan(plan);
  assert.ok(fs.existsSync(planFile));
  const { boardFile, priorities } = writeBoard(plan);
  assert.ok(fs.existsSync(boardFile));
  assert.ok(priorities.p0.length >= 1);
  fs.rmSync(repoPath('automation-runs', AUTOMATION_ID, '2099-01-01'), { recursive: true, force: true });
});
