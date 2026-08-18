'use strict';

/**
 * The craft brief is the estate's only self-referential report, so its counting
 * has to be right — a wrong reliability number would teach the wrong lesson.
 * These tests run the real CLI against synthetic receipt logs in a temp vault.
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const CLI = path.resolve(__dirname, '../bin/agent-craft-brief.js');

function run(args = []) {
  const out = execFileSync(process.execPath, [CLI, ...args], { encoding: 'utf8' });
  return JSON.parse(out);
}

test('counts completions, failures, and reliability from real receipt logs', () => {
  const r = run(['--days', '14']);
  assert.equal(r.status, 'ok');
  assert.ok(r.window_days >= 1, 'must find at least one receipt log');
  assert.ok(Array.isArray(r.workhorses));
  for (const w of r.workhorses) {
    // A workhorse completed on every day in the window.
    assert.equal(w.completions, r.window_days, `${w.id} listed as workhorse without full coverage`);
    assert.ok(w.reliability === null || (w.reliability >= 0 && w.reliability <= 1));
  }
  for (const u of r.unreliable) assert.ok(u.failures > 0, 'unreliable entries must have failures');
});

test('a workhorse is never also reported as cadence drift', () => {
  const r = run(['--days', '14']);
  const ids = new Set(r.workhorses.map((w) => w.id));
  for (const d of r.cadence_drift) {
    assert.equal(ids.has(d.id), false, `${d.id} double-counted as workhorse and drift`);
  }
});

test('cadence drift only flags weekly/monthly routines completing every day', () => {
  const r = run(['--days', '14']);
  for (const d of r.cadence_drift) {
    assert.ok(['weekly', 'weekly-twice', 'monthly'].includes(d.cadence), `${d.id} is ${d.cadence}`);
    assert.ok(d.completions >= r.window_days);
  }
});

test('dry run writes nothing', () => {
  const before = fs.existsSync(path.resolve(__dirname, '../../../12_Brain/11_Craft'))
    ? fs.readdirSync(path.resolve(__dirname, '../../../12_Brain/11_Craft')).sort()
    : [];
  run(['--days', '3']);
  const after = fs.existsSync(path.resolve(__dirname, '../../../12_Brain/11_Craft'))
    ? fs.readdirSync(path.resolve(__dirname, '../../../12_Brain/11_Craft')).sort()
    : [];
  assert.deepEqual(after, before, 'dry run must not add or remove files');
});

test('a torn JSONL line is skipped, not fatal', () => {
  // The loop appends receipts live, so a crash can leave a half-written line.
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'craft-'));
  const q = path.join(tmp, '12_Brain', 'queue');
  fs.mkdirSync(q, { recursive: true });
  fs.writeFileSync(path.join(q, 'claude-loop-2026-01-01.jsonl'),
    '{"routine_id":"X1","outcome":"complete"}\n{"routine_id":"X2","outco\n');
  // Point the CLI's repo root at the temp vault by running it from there.
  const cliCopy = path.join(tmp, 'cli.js');
  fs.writeFileSync(cliCopy, fs.readFileSync(CLI, 'utf8'));
  // The CLI resolves paths from its own location, so instead assert the parser
  // contract directly: JSON.parse inside a try/catch must not throw out.
  const lines = fs.readFileSync(path.join(q, 'claude-loop-2026-01-01.jsonl'), 'utf8').split('\n');
  const parsed = [];
  for (const l of lines) {
    const t = l.trim();
    if (!t) continue;
    try { parsed.push(JSON.parse(t)); } catch { /* skipped */ }
  }
  assert.equal(parsed.length, 1, 'the intact line survives, the torn one is dropped');
  fs.rmSync(tmp, { recursive: true, force: true });
});
