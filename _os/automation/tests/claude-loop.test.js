'use strict';

/**
 * Deterministic checks for the Node dispatcher and the two contracts it introduced:
 * `learn` as a required routine output, and `generated_at` as the one timestamp on state.
 * Gate-report runs are read-only (--no-evidence); nothing here executes a routine.
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync, spawnSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '../../..');
const CLI = path.join(ROOT, '_os/automation/bin/claude-loop.js');
const loop = require('../bin/claude-loop');
const { stampRunState, ISO_TIMESTAMP } = require('../lib/registry');
const { staleness } = require('../bin/queue-status');
const { analyse, promotionCandidates } = require('../bin/agent-craft-brief');

// ---------------------------------------------------------------- cadence buckets
test('daily cadence keys on the local date', () => {
  assert.equal(loop.cadenceBucket(new Date(2026, 8, 2), 'daily'), '2026-09-02');
  assert.equal(loop.cadenceBucket(new Date(2026, 8, 2), 'event'), '2026-09-02');
});

test('weekly and monthly cadences key on week and month, twice-weekly splits the week', () => {
  const wed = new Date(2026, 8, 2); // Wednesday
  const thu = new Date(2026, 8, 3);
  assert.equal(loop.cadenceBucket(wed, 'weekly'), '2026-W36');
  assert.equal(loop.cadenceBucket(wed, 'monthly'), '2026-09');
  assert.equal(loop.cadenceBucket(wed, 'weekly-twice'), '2026-W36A');
  assert.equal(loop.cadenceBucket(thu, 'weekly-twice'), '2026-W36B');
});

test('week number reproduces the .NET FirstFourDayWeek/Monday rule the PS receipts used', () => {
  // 2026-01-01 is a Thursday: ISO week 1, .NET week 1.
  assert.equal(loop.dotnetWeekOfYear(new Date(2026, 0, 1)), 1);
  // 2025-12-29 (Monday) is ISO 2026-W01; .NET reports 53 for late-December week-1 days.
  assert.equal(loop.dotnetWeekOfYear(new Date(2025, 11, 29)), 53);
  // 2027-01-01 (Friday) is ISO 2026-W53; both rules report 53.
  assert.equal(loop.dotnetWeekOfYear(new Date(2027, 0, 1)), 53);
});

test('dedupe reads the whole cadence window, not just today; breaker stays day-scoped', () => {
  const os = require('node:os');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-loop-dedupe-'));
  const line = (o) => `${JSON.stringify(o)}\n`;
  // yesterday: a weekly routine completed and another routine failed
  fs.writeFileSync(path.join(tmp, 'claude-loop-2026-09-01.jsonl'),
    line({ routine_id: 'W04', outcome: 'complete', dedupe_key: 'internal:2026-W36:W04' })
    + line({ routine_id: 'E05', outcome: 'failed', dedupe_key: 'internal:2026-09-01:E05' }));
  // today: one degraded completion, one failure
  fs.writeFileSync(path.join(tmp, 'claude-loop-2026-09-02.jsonl'),
    line({ routine_id: 'D03', outcome: 'complete_degraded', dedupe_key: 'internal:2026-09-02:D03' })
    + line({ routine_id: 'E05', outcome: 'verification_failed', dedupe_key: 'internal:2026-09-02:E05' })
    + '{"torn":\n');
  // too old to matter, and a future-dated file that must be ignored
  fs.writeFileSync(path.join(tmp, 'claude-loop-2026-07-01.jsonl'), line({ routine_id: 'M02', outcome: 'complete', dedupe_key: 'internal:2026-07:M02' }));
  fs.writeFileSync(path.join(tmp, 'claude-loop-2026-09-09.jsonl'), line({ routine_id: 'W10', outcome: 'complete', dedupe_key: 'internal:2026-W37:W10' }));
  try {
    const { priorKeys, priorFail } = loop.loadPriorState(tmp, '2026-09-02');
    assert.ok(priorKeys.has('internal:2026-W36:W04'), 'yesterday\'s weekly key must block today');
    assert.ok(priorKeys.has('internal:2026-09-02:D03'), 'degraded completion counts');
    assert.equal(priorKeys.has('internal:2026-07:M02'), false, 'outside the 31-day lookback');
    assert.equal(priorKeys.has('internal:2026-W37:W10'), false, 'future-dated files are ignored');
    assert.deepEqual(priorFail, { E05: 1 }, 'only today\'s failures feed the breaker');
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------- learn contract
const STAGES = ['sense', 'route', 'prioritize', 'build', 'verify', 'approve', 'deliver', 'readback', 'learn'];
const okLog = (overrides = {}) => STAGES.slice(0, 8).map((stage) => ({
  stage, capability: 'x', state: overrides[stage] || 'ok', detail: `${stage} detail`, attempts: 1,
}));

test('a failed stage is always a concrete lesson', () => {
  const log = okLog().slice(0, 4);
  log[3].state = 'failed'; log[3].detail = 'exit 1; stdout is not valid JSON';
  const l = loop.deriveLearn({ routineId: 'W11', stageLog: log, prevCheckpoint: null, stages: STAGES });
  assert.equal(l.kind, 'lesson');
  assert.equal(l.key, 'W11:build:failed');
  assert.match(l.text, /stage build .* failed: exit 1/);
});

test('first run with no prior stage states is an explicit no-finding baseline', () => {
  const l = loop.deriveLearn({ routineId: 'D03', stageLog: okLog(), prevCheckpoint: { run_id: 'old' }, stages: STAGES });
  assert.equal(l.kind, 'no_finding');
  assert.equal(l.key, 'D03:baseline');
});

test('a stage whose state changed since the last checkpoint is a keyed lesson', () => {
  const prev = { run_id: 'LOOP-1', stage_states: Object.fromEntries(STAGES.slice(0, 8).map((s) => [s, 'ok'])) };
  const l = loop.deriveLearn({ routineId: 'D03', stageLog: okLog({ verify: 'blocked' }), prevCheckpoint: prev, stages: STAGES });
  assert.equal(l.kind, 'lesson');
  assert.equal(l.key, 'D03:verify ok->blocked');
  assert.match(l.text, /since LOOP-1/);
});

test('an unchanged run is an explicit no-finding, never silence', () => {
  const prev = { run_id: 'LOOP-1', stage_states: { ...Object.fromEntries(STAGES.slice(0, 8).map((s) => [s, 'ok'])), verify: 'blocked' } };
  const l = loop.deriveLearn({ routineId: 'D03', stageLog: okLog({ verify: 'blocked' }), prevCheckpoint: prev, stages: STAGES });
  assert.equal(l.kind, 'no_finding');
  assert.equal(l.key, 'D03:stable');
  assert.match(l.text, /verify blocked as in previous run/);
});

test('the craft brief counts learn output and applies the two-day promotion rule', () => {
  const days = [
    { day: '2026-09-01', rows: [
      { routine_id: 'A', outcome: 'complete', learn: { kind: 'no_finding', key: 'A:stable' } },
      { routine_id: 'B', outcome: 'failed', learn: { kind: 'lesson', key: 'B:build:failed', text: 'build failed' } },
      { routine_id: 'C', outcome: 'complete' }, // pre-contract receipt
    ] },
    { day: '2026-09-02', rows: [
      { routine_id: 'B', outcome: 'failed', learn: { kind: 'lesson', key: 'B:build:failed', text: 'build failed' } },
      { routine_id: 'D', outcome: 'complete', learn: { kind: 'lesson', key: 'D:verify ok->blocked', text: 'changed' } },
    ] },
  ];
  const { learn } = analyse(days);
  assert.equal(learn.lessons.length, 3);
  assert.equal(learn.no_findings, 1);
  assert.equal(learn.missing, 1);
  const c = promotionCandidates(learn.lessons);
  assert.deepEqual(c.map((x) => x.key), ['B:build:failed']);
  assert.deepEqual(c[0].days, ['2026-09-01', '2026-09-02']);
});

// ---------------------------------------------------------------- generated_at contract
test('writeRunState stamps generated_at and keeps written_at equal to it', () => {
  const s = stampRunState('x', { status: 'ok' }, '2026-09-02T12:00:00.000Z');
  assert.equal(s.generated_at, '2026-09-02T12:00:00.000Z');
  assert.equal(s.written_at, s.generated_at);
  assert.equal(s.automation_id, 'x');
  // a malformed caller value is replaced, a valid one is honoured
  assert.equal(stampRunState('x', { generated_at: 'yesterday' }, '2026-09-02T12:00:00.000Z').generated_at, '2026-09-02T12:00:00.000Z');
  assert.equal(stampRunState('x', { generated_at: '2026-09-01T00:00:00Z' }, '2026-09-02T12:00:00.000Z').generated_at, '2026-09-01T00:00:00Z');
});

test('the automation-run schema requires generated_at and its pattern matches the stamp', () => {
  const schema = JSON.parse(fs.readFileSync(path.join(ROOT, '12_Brain/schemas/automation-run.json'), 'utf8'));
  assert.ok(schema.required.includes('generated_at'));
  const re = new RegExp(schema.properties.generated_at.pattern);
  assert.ok(re.test(new Date().toISOString()));
  assert.ok(ISO_TIMESTAMP.test(new Date().toISOString()));
  assert.equal(re.test('2026-09-02'), false, 'a bare date is not the contract');
});

test('queue-status staleness is measured from generated_at with a cadence window', () => {
  const now = Date.parse('2026-09-02T12:00:00Z');
  const daily = { cadence: 'daily' };
  assert.equal(staleness(daily, { generated_at: '2026-09-02T10:00:00Z' }, now).stale, false);
  assert.equal(staleness(daily, { generated_at: '2026-09-01T00:00:00Z' }, now).stale, true);
  // legacy written_at still yields an age but flags the missing contract
  const legacy = staleness(daily, { written_at: '2026-09-02T10:00:00Z' }, now);
  assert.equal(legacy.stale, false);
  assert.equal(legacy.timestamp_contract, false);
  assert.equal(staleness({ cadence: 'on demand' }, { generated_at: '2026-01-01T00:00:00Z' }, now).stale, null);
  assert.equal(staleness({ cadence: 'on demand', stale_after_hours: 1 }, { generated_at: '2026-01-01T00:00:00Z' }, now).stale, true);
  assert.equal(staleness(daily, {}, now).generated_at, null);
});

// ---------------------------------------------------------------- allowlist and gates
test('allowlist entries are bounded: every command has a timeout, validator, and tier', () => {
  const al = loop.buildAllowlist(ROOT);
  assert.ok(Object.keys(al).length >= 6);
  for (const [id, c] of Object.entries(al)) {
    assert.ok(c.timeout > 0, `${id} timeout`);
    assert.ok(['json_overall_pass', 'json_with_issues', 'json_verdict', 'nonempty_stdout'].includes(c.validate), `${id} validate`);
    assert.ok([0, 1].includes(c.tier), `${id} tier`);
    assert.ok(Array.isArray(c.ok_exit) && Array.isArray(c.blocked_exit), `${id} exit codes`);
    for (const a of c.args) assert.equal(loop.FORBIDDEN_VERBS.some((v) => String(a).toLowerCase() === v), false, `${id} arg ${a}`);
  }
  // every build target resolves to a real allowlist id or an internal read-only capability
  for (const v of Object.values(loop.ROLE_BUILD)) assert.ok(al[v], `role build ${v}`);
  for (const v of Object.values(loop.ROUTINE_BUILD)) {
    assert.ok(al[v] || ['repo_readonly', 'comms_triage_readonly'].includes(v), `routine build ${v}`);
  }
});

test('redaction tripwire catches secret-shaped output', () => {
  assert.equal(loop.isRedacted('exit 0; errors=0'), true);
  assert.equal(loop.isRedacted('token sk-abcdefghijklmnopqrstuvwxyz'), false);
  assert.equal(loop.isRedacted('z'.repeat(64)), true, 'non-hex is fine');
  assert.equal(loop.isRedacted('f'.repeat(64)), false, 'a bare sha256 is not');
});

// ---------------------------------------------------------------- end to end in a throwaway vault
test('fixture execution completes 9 stages, records learn, stamps generated_at, and dedupes on rerun', () => {
  const os = require('node:os');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-loop-vault-'));
  const copy = (rel) => {
    const src = path.join(ROOT, rel); const dst = path.join(tmp, rel);
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.cpSync(src, dst, { recursive: true });
  };
  copy('11_Agents/claude-operating-team.json');
  copy('12_Brain/09_Ops/AGENT_PROTOCOL.md');
  copy('System/scripts');
  copy('_os/automation/bin');
  copy('_os/automation/lib');
  const reg = JSON.parse(fs.readFileSync(path.join(tmp, '11_Agents/claude-operating-team.json'), 'utf8'));
  // An analyst routine with no per-routine override builds with queue_status (node, read-only).
  const r = reg.routines.find((x) => x.claude_role === 'analyst' && x.claude_may_execute
    && !Object.keys(loop.ROUTINE_BUILD).includes(x.routine_id));
  assert.ok(r, 'need an analyst routine to exercise the node build path');
  const args = ['--vault-root', tmp, '--canonical-root', path.join(tmp, 'no-canonical'), '--routine', r.routine_id, '--execute', '--fixture', '--json'];
  try {
    const first = JSON.parse(execFileSync(process.execPath, [CLI, ...args], { encoding: 'utf8', cwd: tmp, maxBuffer: 64 * 1024 * 1024 }));
    const row = first.rows[0];
    assert.ok(['complete', 'complete_degraded'].includes(row.outcome), `outcome ${row.outcome} blocked_by ${row.blocked_by}`);
    assert.equal(row.stages.length, 9);
    assert.equal(row.stages[3].capability, 'queue_status');
    assert.equal(row.stages[8].capability, 'derive_lesson');
    assert.equal(row.independent_verification.verified, true);
    assert.equal(row.learn.kind, 'no_finding');
    assert.equal(row.learn.key, `${r.routine_id}:baseline`);
    // checkpoint: generated_at contract plus the stage states the next learn compares against
    const cp = JSON.parse(fs.readFileSync(path.join(tmp, r.checkpoint_resume), 'utf8'));
    assert.equal(cp.last_stage, 'learn');
    assert.ok(ISO_TIMESTAMP.test(cp.generated_at));
    assert.equal(cp.updated, cp.generated_at);
    assert.equal(Object.keys(cp.stage_states).length, 9);
    // receipt: one appended line carrying learn
    const day = loop.localDate();
    const lines = fs.readFileSync(path.join(tmp, `12_Brain/queue/claude-loop-${day}.jsonl`), 'utf8').trim().split('\n');
    assert.equal(lines.length, 1);
    const receipt = JSON.parse(lines[0]);
    assert.equal(receipt.learn.kind, 'no_finding');
    assert.equal(receipt.dedupe_key, row.dedupe_key);
    // loop summary state follows the same contract
    const summary = JSON.parse(fs.readFileSync(path.join(tmp, '12_Brain/state/claude-loop.json'), 'utf8'));
    assert.ok(ISO_TIMESTAMP.test(summary.generated_at));
    assert.equal(summary.counts.executed, 1);
    // second run: cadence-scoped dedupe blocks, and nothing is appended
    const second = JSON.parse(execFileSync(process.execPath, [CLI, ...args], { encoding: 'utf8', cwd: tmp, maxBuffer: 64 * 1024 * 1024 }));
    assert.equal(second.rows[0].outcome, 'blocked');
    assert.match(second.rows[0].blocked_by, /G6_dedupe/);
    assert.equal(second.rows[0].stages.length, 0);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('gate report for one routine is read-only and keeps the PS receipt shape', () => {
  const out = execFileSync(process.execPath, [CLI, '--routine', 'D03', '--json', '--no-evidence'], { encoding: 'utf8', cwd: ROOT });
  const j = JSON.parse(out);
  assert.equal(j.harness, 'Invoke-ClaudeLoop');
  assert.equal(j.mode, 'gate-report');
  assert.equal(j.canonical_write_attempted, false);
  assert.equal(j.external_action_attempted, false);
  assert.equal(j.rows.length, 1);
  const row = j.rows[0];
  assert.equal(row.gates.length, 8);
  assert.deepEqual(row.gates.map((g) => g.gate), ['G1_authority', 'G2_action_safety', 'G3_client_isolation',
    'G4_budget_ceiling', 'G5_stale_source', 'G6_dedupe', 'G7_lease', 'G8_circuit_breaker']);
  assert.match(row.dedupe_key, /^internal:\d{4}-\d{2}-\d{2}:D03$/);
  assert.ok(['blocked', 'eligible_not_executed'].includes(row.outcome));
  assert.equal(row.stages.length, 0, 'gate report executes no stage');
  for (const k of ['route', 'artifact_paths', 'sources_and_freshness', 'checks', 'assumptions', 'privacy_state',
    'approval_state', 'external_action_attempted', 'next_safest_action']) assert.ok(k in row.receipt, k);
});

test('an unknown client id fails isolation and an unknown routine blocks the run', () => {
  const iso = JSON.parse(execFileSync(process.execPath, [CLI, '--routine', 'W09', '--client', 'definitely-not-a-client', '--json', '--no-evidence'], { encoding: 'utf8', cwd: ROOT }));
  assert.match(iso.rows[0].blocked_by, /G3_client_isolation/);
  const r = spawnSync(process.execPath, [CLI, '--routine', 'NOPE', '--json', '--no-evidence'], { encoding: 'utf8', cwd: ROOT });
  assert.equal(r.status, 1);
  assert.match(r.stdout, /BLOCKED: no such routine/);
});
