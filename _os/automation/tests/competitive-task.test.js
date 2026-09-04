'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('node:child_process');
const { repoPath } = require('../lib/fsutil');

const runner = repoPath('_os/automation/bin/competitive-task-run.js');
const workflow = repoPath('_os/automation/workflows/competitive-task-orchestrator.json');

test('competitive-task workflow declares parallel phase and consolidator', () => {
  const doc = JSON.parse(fs.readFileSync(workflow, 'utf8'));
  assert.equal(doc.workflow_id, 'competitive-task-orchestrator');
  assert.equal(doc.pattern, 'orchestrator');
  assert.equal(doc.phase_1_parallel.length, 6);
  assert.equal(doc.phase_2_sequential[0].id, 'memory-consolidator');
  assert.ok(doc.supersedes.includes('daily-morning-orchestrator-dry-board'));
});

test('competitive-task agent registry files exist', () => {
  const agents = [
    'gmail-intel',
    'slack-intel',
    'vault-pulse',
    'codex-session-sync',
    'domain-ads-seo',
    'content-routines',
    'memory-consolidator',
  ];
  for (const id of agents) {
    const file = repoPath('.cursor/agents', `${id}.md`);
    assert.ok(fs.existsSync(file), `missing agent ${id}`);
    const text = fs.readFileSync(file, 'utf8');
    assert.match(text, /^---\nname: /);
  }
});

test('competitive-task-run dry-run returns structured result', () => {
  const out = execFileSync(process.execPath, [runner, '--dry-run', '--date', '2026-09-04'], {
    encoding: 'utf8',
  });
  const result = JSON.parse(out);
  assert.equal(result.ok, true);
  assert.equal(result.dry_run, true);
  assert.equal(result.date, '2026-09-04');
});

test('competitive-task-run writes brief and run state', () => {
  const date = '2099-01-15';
  const runDir = repoPath('automation-runs/competitive-task-orchestrator', date);
  const brief = repoPath('Daily-Briefs/competitive-task-today.md');
  const state = repoPath('12_Brain/state/competitive-task-orchestrator.json');
  const priorBrief = fs.existsSync(brief) ? fs.readFileSync(brief, 'utf8') : null;

  execFileSync(process.execPath, [runner, '--date', date], { encoding: 'utf8' });

  assert.ok(fs.existsSync(path.join(runDir, 'run-state.json')));
  assert.ok(fs.existsSync(path.join(runDir, 'lane-outputs/vault-pulse.md')));
  assert.ok(fs.existsSync(state));
  const briefText = fs.readFileSync(brief, 'utf8');
  assert.match(briefText, /# Competitive Task — 2099-01-15/);

  if (priorBrief) fs.writeFileSync(brief, priorBrief);
  else fs.unlinkSync(brief);
  fs.rmSync(runDir, { recursive: true, force: true });
  if (fs.existsSync(state)) fs.unlinkSync(state);
});
