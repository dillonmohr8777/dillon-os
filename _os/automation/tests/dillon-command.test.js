'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const {
  loadProfile,
  initRun,
  loadRunState,
  synthesizeBoard,
  collectOpenSlackItems,
  runDirFor,
} = require('../lib/dillon-command');
const { repoPath } = require('../lib/fsutil');

test('profile has eight parallel lanes', () => {
  const profile = loadProfile();
  assert.equal(profile.id, 'dillon-command');
  assert.equal(profile.lanes.length, 8);
  const ids = profile.lanes.map((l) => l.id);
  assert.deepEqual(ids, ['comms', 'clients', 'intelligence', 'websites', 'outreach', 'ads', 'reporting', 'command']);
});

test('init creates run folder and lane manifest', () => {
  const date = '2099-01-15';
  const dir = runDirFor(date);
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });

  const { dir: created, state } = initRun(date);
  assert.equal(state.lanes.length, 8);
  assert.equal(fs.existsSync(path.join(created, 'run-state.json')), true);
  assert.equal(fs.existsSync(path.join(created, 'lane-manifest.md')), true);

  const reloaded = loadRunState(date);
  assert.equal(reloaded.run_id, `dillon-command-${date}`);
});

test('synthesize writes approval board with slack open loops', () => {
  const date = '2099-01-16';
  const dir = runDirFor(date);
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
  initRun(date);

  const open = collectOpenSlackItems();
  assert.ok(open.length >= 1, 'fixture slack notes with status:new should exist');

  const { boardPath } = synthesizeBoard(date);
  const board = fs.readFileSync(boardPath, 'utf8');
  assert.match(board, /Approval board/);
  assert.match(board, /Lane status/);
  assert.match(board, /comms/);
});

test('dillon-command skill exists for HUD discovery', () => {
  const skill = repoPath('.claude/skills/dillon-command/SKILL.md');
  assert.equal(fs.existsSync(skill), true);
  const text = fs.readFileSync(skill, 'utf8');
  assert.match(text, /eight parallel lanes/i);
});
