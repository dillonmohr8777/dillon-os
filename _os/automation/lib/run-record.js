'use strict';
// One run record per agent run, appended to _os/automation/runs.jsonl.
// This is the join between a definition (12_Brain/registry/automations.json),
// a run, and its transcript. run-ledger.jsonl stays as-is for the heartbeat.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const VAULT = path.resolve(__dirname, '..', '..', '..');
const RUNS = path.join(VAULT, '_os/automation/runs.jsonl');

const STATUSES = new Set(['ok', 'failed', 'skipped', 'running']);

function appendRun(rec, file = RUNS) {
  if (!rec || typeof rec.agent_id !== 'string' || !rec.agent_id) throw new Error('agent_id required');
  if (!STATUSES.has(rec.status)) throw new Error(`status must be one of ${[...STATUSES].join('|')}`);
  const row = {
    agent_id: rec.agent_id,
    run_id: rec.run_id || crypto.randomUUID(),
    started: rec.started || new Date().toISOString(),
    ended: rec.ended || (rec.status === 'running' ? null : new Date().toISOString()),
    exit_code: Number.isInteger(rec.exit_code) ? rec.exit_code : null,
    status: rec.status,
    artifact: rec.artifact || null,
    transcript: rec.transcript || null,
    tokens: Number.isInteger(rec.tokens) ? rec.tokens : null,
    note: rec.note || '',
  };
  fs.appendFileSync(file, JSON.stringify(row) + '\n');
  return row;
}

// agent_id -> most recent row. Last line wins, so a 'running' row followed by
// an 'ok' row for the same run_id resolves to 'ok'.
function lastRuns(file = RUNS) {
  if (!fs.existsSync(file)) return {};
  const out = {};
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    if (!line.trim()) continue;
    try { const r = JSON.parse(line); out[r.agent_id] = r; } catch { /* skip bad line, never crash the HUD */ }
  }
  return out;
}

module.exports = { appendRun, lastRuns, RUNS };

if (require.main === module) {
  const assert = require('assert');
  const tmp = path.join(require('os').tmpdir(), `runs-${process.pid}.jsonl`);
  const a = appendRun({ agent_id: 'x', status: 'running' }, tmp);
  appendRun({ agent_id: 'x', run_id: a.run_id, status: 'ok', exit_code: 0, artifact: 'a.md' }, tmp);
  appendRun({ agent_id: 'y', status: 'failed', exit_code: 1, note: 'boom' }, tmp);
  const last = lastRuns(tmp);
  assert.strictEqual(last.x.status, 'ok');
  assert.strictEqual(last.x.run_id, a.run_id);
  assert.strictEqual(last.y.exit_code, 1);
  assert.throws(() => appendRun({ agent_id: 'z', status: 'nope' }, tmp));
  fs.unlinkSync(tmp);
  console.log('run-record ok');
}
