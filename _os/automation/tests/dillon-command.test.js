'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const {
  parseApprovalItems,
  scanSlackRequests,
  dedupeTasks,
  runDillonCommand,
  loadProfile,
} = require('../lib/dillon-command');
const { repoPath } = require('../lib/fsutil');

test('profile exposes eight parallel lanes', () => {
  const profile = loadProfile();
  assert.equal(profile.lanes.length, 8);
  const ids = profile.lanes.map((l) => l.id);
  assert.deepEqual(ids, [
    'comms',
    'clients',
    'intelligence',
    'websites',
    'outreach',
    'ads',
    'reporting',
    'command',
  ]);
});

test('parseApprovalItems scores billing and disapprovals high', () => {
  const sample = `
- [ ] 2026-08-13 -- [Replenish] -- Approve billing follow-up -- Risk: high
- [ ] 2026-07-12 -- [Bar Crawl USA] -- Approve clearance of 2 disapproved ads -- Risk: high
- [ ] 2026-07-12 -- [Book Funnel] -- Approve publish -- Risk: low
`;
  const items = parseApprovalItems(sample);
  assert.ok(items.length >= 3);
  const billing = items.find((i) => /billing/i.test(i.title));
  const ads = items.find((i) => /disapproved/i.test(i.title));
  assert.equal(billing.category, 'billing_risk');
  assert.equal(ads.category, 'ad_disapproval');
  assert.ok(billing.score > ads.score || billing.score === ads.score);
});

test('scanSlackRequests finds status:new inbox files', () => {
  const tasks = scanSlackRequests();
  assert.ok(tasks.length >= 1);
  assert.ok(tasks.every((t) => t.lane === 'comms'));
});

test('dedupeTasks keeps highest score first', () => {
  const merged = dedupeTasks([
    { id: 'a', title: 'low', score: 10 },
    { id: 'b', title: 'high', score: 90 },
    { id: 'a', title: 'dup', score: 50 },
  ]);
  assert.equal(merged.length, 2);
  assert.equal(merged[0].id, 'b');
});

test('runDillonCommand writes artifacts for today', async () => {
  const date = '2099-01-01';
  const result = await runDillonCommand({ date, updateDashboard: false });
  assert.equal(result.runState.id, 'dillon-command');
  assert.equal(result.runState.date, date);
  assert.equal(result.laneResults.length, 8);
  const runDir = repoPath('automation-runs/dillon-command', date);
  for (const file of ['run-state.json', 'approval-board.md', 'lane-results.json', 'am-report.md']) {
    assert.ok(fs.existsSync(path.join(runDir, file)), `missing ${file}`);
  }
  fs.rmSync(runDir, { recursive: true, force: true });
  const brief = repoPath(`Daily-Briefs/am-report-${date}.md`);
  const board = repoPath(`Daily-Briefs/command-board-${date}.md`);
  if (fs.existsSync(brief)) fs.unlinkSync(brief);
  if (fs.existsSync(board)) fs.unlinkSync(board);
});
