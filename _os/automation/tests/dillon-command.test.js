'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const {
  loadProfile,
  collectSlackIntake,
  collectOpenSlackLoops,
  scanClientMovement,
  rankP0Items,
  renderApprovalBoard,
  renderAgentManifest,
  runDillonCommand,
} = require('../lib/dillon-command');
const { repoPath } = require('../lib/fsutil');

test('profile loads eight parallel lanes', () => {
  const profile = loadProfile();
  assert.equal(profile.id, 'dillon-command');
  assert.equal(profile.lanes.length, 8);
  const ids = profile.lanes.map((l) => l.id);
  assert.deepEqual(ids, ['command', 'comms', 'clients', 'intelligence', 'websites', 'outreach', 'ads', 'reporting']);
});

test('collectSlackIntake reads inbox slack notes', () => {
  const items = collectSlackIntake();
  assert.ok(items.length >= 4, `expected slack fixtures, got ${items.length}`);
  assert.ok(items.every((i) => i.file.startsWith('00_Inbox/slack/')));
});

test('open slack loops filter status new', () => {
  const open = collectOpenSlackLoops();
  assert.ok(open.length >= 1);
  assert.ok(open.every((i) => i.status === 'new' || i.status === 'open'));
});

test('rankP0Items surfaces ad-task ahead of fyi', () => {
  const profile = loadProfile();
  const ranked = rankP0Items({
    openSlack: [
      { file: 'a.md', type: 'fyi', status: 'new' },
      { file: 'b.md', type: 'ad-task', status: 'new' },
    ],
    websiteBuilds: [],
    clientScan: { moving: [], stalled: [] },
    profile,
  });
  assert.equal(ranked[0].type || ranked[0].title, ranked[0].title);
  assert.match(ranked[0].title, /^b$/);
});

test('renderApprovalBoard includes lane table', () => {
  const profile = loadProfile();
  const md = renderApprovalBoard({
    date: '2026-08-17',
    laneResults: { comms: { status: 'ok', summary: 'test', artifacts: [] } },
    ranked: [],
    profile,
  });
  assert.match(md, /Dillon Command Center/);
  assert.match(md, /Lane status/);
  assert.match(md, /comms/);
});

test('agent manifest lists all lanes with skills', () => {
  const profile = loadProfile();
  const manifest = renderAgentManifest({
    date: '2026-08-17',
    profile,
    laneResults: {},
  });
  assert.equal(manifest.lanes.length, 8);
  assert.ok(manifest.instructions.length >= 3);
});

test('runDillonCommand writes run artifacts', async () => {
  const date = '2099-01-01-test';
  const runDir = repoPath('automation-runs/dillon-command', date);
  if (fs.existsSync(runDir)) {
    fs.rmSync(runDir, { recursive: true, force: true });
  }
  const result = await runDillonCommand({ date });
  assert.equal(result.date, date);
  assert.ok(fs.existsSync(repoPath(result.boardPath)));
  assert.ok(fs.existsSync(repoPath(result.statePath)));
  assert.ok(fs.existsSync(repoPath(result.manifestPath)));
  const state = JSON.parse(fs.readFileSync(repoPath(result.statePath), 'utf8'));
  assert.equal(state.id, 'dillon-command');
  assert.ok(state.counts.slack_total >= 0);
  fs.rmSync(runDir, { recursive: true, force: true });
});
