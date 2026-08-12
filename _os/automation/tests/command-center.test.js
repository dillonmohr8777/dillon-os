'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const {
  loadProfile,
  scanVaultSignals,
  collectCliSteps,
  buildApprovalItems,
  renderApprovalBoard,
  laneAgentInstructions,
} = require('../lib/command-center');
const { repoPath } = require('../lib/fsutil');

test('dillon-command profile loads with 8 lanes', () => {
  const profile = loadProfile();
  assert.equal(profile.id, 'dillon-command');
  assert.equal(profile.lanes.length, 8);
  assert.ok(profile.lanes.some((l) => l.id === 'command'));
  assert.ok(profile.lanes.some((l) => l.id === 'comms'));
});

test('collectCliSteps gathers parallel lane commands', () => {
  const profile = loadProfile();
  const parallel = profile.lanes.filter((l) => l.parallel !== false && l.id !== 'command');
  const steps = collectCliSteps(parallel);
  assert.ok(steps.length >= 3);
  assert.ok(steps.some((s) => s.command.includes('frontmatter-validate')));
  assert.ok(steps.some((s) => s.command.includes('site-health')));
});

test('scanVaultSignals returns numeric counters', () => {
  const signals = scanVaultSignals('2026-08-12');
  assert.equal(typeof signals.inbox_unprocessed, 'number');
  assert.equal(typeof signals.slack_new_requests, 'number');
  assert.equal(typeof signals.clients_stalled, 'number');
  assert.ok(signals.briefs_present);
});

test('buildApprovalItems surfaces inbox and slack pressure', () => {
  const items = buildApprovalItems(
    { slack_new_requests: 2, inbox_unprocessed: 3, clients_stalled: 1, briefs_present: { am_report: false } },
    [],
    loadProfile()
  );
  assert.ok(items.some((i) => i.title.includes('Slack')));
  assert.ok(items.some((i) => i.title.includes('inbox')));
  assert.ok(items.some((i) => i.tier === 2));
});

test('renderApprovalBoard includes lane list', () => {
  const profile = loadProfile();
  const board = renderApprovalBoard({
    date: '2026-08-12',
    signals: scanVaultSignals('2026-08-12'),
    items: [{ rank: 1, tier: 0, lane: 'comms', title: 'Test', action: 'Act', urgency: 'low' }],
    lanes: profile.lanes,
    agentInstructions: profile.lanes.map((l) => laneAgentInstructions(l, '2026-08-12')),
  });
  assert.match(board, /Approval board/);
  assert.match(board, /comms/);
  assert.match(board, /One push rule/);
});

test('dillon-command CLI writes run artifacts', async () => {
  const { runCommandCenter } = require('../lib/command-center');
  const date = '2099-01-01-test';
  const outDir = repoPath('automation-runs/dillon-command', date);
  try {
    const result = await runCommandCenter(['--date', date, '--lanes', 'clients,command']);
    assert.equal(result.workflow, 'dillon-command');
    assert.ok(fs.existsSync(path.join(outDir, 'approval-board.md')));
    assert.ok(fs.existsSync(path.join(outDir, 'agent-manifest.json')));
    assert.ok(fs.existsSync(path.join(outDir, 'run-state.json')));
  } finally {
    if (fs.existsSync(outDir)) fs.rmSync(outDir, { recursive: true, force: true });
    const stateFile = repoPath('12_Brain/state/dillon-command.json');
    if (fs.existsSync(stateFile)) {
      const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
      if (state.date === date) fs.unlinkSync(stateFile);
    }
  }
});
