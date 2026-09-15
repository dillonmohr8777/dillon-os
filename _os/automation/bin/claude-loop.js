#!/usr/bin/env node
'use strict';

/**
 * Bounded dispatcher for the Claude operating team. Executes only allowlisted local commands.
 *
 * Node port of System/scripts/Invoke-ClaudeLoop.ps1, which is now a thin wrapper around this
 * file, so the read-only allowlist runs wherever the repository is cloned. Behaviour kept
 * from the PowerShell dispatcher: the 9 operating stages
 *   sense -> route -> prioritize -> build -> verify -> approve -> deliver -> readback -> learn
 * the 8 fail-closed gates (authority, action safety, client isolation, budget ceiling, stale
 * source, cadence-scoped dedupe, lease, circuit breaker), receipts, checkpoints, artifact
 * validation, the redaction tripwire, independent verification, and the approval boundary.
 *
 * Two contracts added by the port:
 *   - `learn` is a REQUIRED routine output. Every executed routine records either a concrete
 *     lesson or an explicit no-finding in its receipt (append-only queue log). The craft brief
 *     reads them; promotion into earned-lessons and 03_Concepts stays an agent step.
 *   - `generated_at` is the one machine-readable timestamp on routine state (checkpoints and
 *     the loop summary). `updated` is kept for readers that still expect it.
 *
 * Never sends, posts, publishes, deploys, spends, commits, pushes, reads a credential,
 * launches a browser, or writes canonical client state. Codex acting as Marketing Chief
 * remains sole orchestrator, canonical writer, and final verifier.
 *
 *   node _os/automation/bin/claude-loop.js                       # gate report, all routines
 *   node _os/automation/bin/claude-loop.js --routine W11 --execute
 *   node _os/automation/bin/claude-loop.js --routine W11 --execute --fixture --json
 *
 * Flags: --vault-root P  --canonical-root P  --routine ID  --client ID  --execute  --fixture
 *        --resume  --max-routines N  --json  --no-evidence
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');

const LOCAL_BACKOFF_CAP_SECONDS = 5;
const LEASE_STALE_MS = 30 * 60 * 1000;
const DONE = ['complete', 'complete_degraded'];
const FAILED = ['failed', 'verification_failed'];
const FORBIDDEN_VERBS = ['send', 'post', 'publish', 'schedule', 'deploy', 'merge', 'spend', 'purchase',
  'account_change', 'credential_read', 'rotate', 'delete', 'canonical_write', 'push', 'commit'];
const SECRET_PATTERNS = [/sk-[A-Za-z0-9]{20,}/, /ghp_[A-Za-z0-9]{20,}/, /xox[baprs]-/,
  /AIza[0-9A-Za-z_-]{30,}/, /BEGIN (RSA|OPENSSH|EC|PRIVATE) KEY/, /\b[0-9a-f]{64}\b/];

// ------------------------------------------------------------------ helpers
const pad2 = (n) => String(n).padStart(2, '0');
const round2 = (n) => Number(Number(n).toFixed(2));
const nowIso = () => new Date().toISOString();

function localDate(d = new Date()) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function runStamp(d = new Date()) {
  return `${d.getFullYear()}${pad2(d.getMonth() + 1)}${pad2(d.getDate())}-${pad2(d.getHours())}${pad2(d.getMinutes())}${pad2(d.getSeconds())}${String(d.getMilliseconds()).padStart(3, '0')}`;
}

function sleepSync(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function readJsonSafe(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '')); } catch { return null; }
}

function writeJson(file, obj) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(obj, null, 2)}\n`);
}

function walkFiles(dir, ext, acc = []) {
  let ents;
  try { ents = fs.readdirSync(dir, { withFileTypes: true }); } catch { return acc; }
  for (const e of ents) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walkFiles(full, ext, acc);
    else if (e.isFile() && e.name.endsWith(ext)) acc.push(full);
  }
  return acc;
}

function isRedacted(text) {
  return !SECRET_PATTERNS.some((p) => p.test(text));
}

function which(cmd) {
  const r = spawnSync(process.platform === 'win32' ? 'where' : 'which', [cmd], { encoding: 'utf8', windowsHide: true });
  return r.status === 0;
}

/** Windows PowerShell when present (the scheduled estate), else pwsh/powershell on PATH. */
function resolvePowerShell() {
  if (process.platform === 'win32') {
    const p = path.join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe');
    if (fs.existsSync(p)) return p;
  }
  for (const c of ['pwsh', 'powershell']) if (which(c)) return c;
  return null;
}

function sha256File(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex').toUpperCase();
}

// ------------------------------------------------------------------ arguments
function parseArgs(argv) {
  const a = {
    vaultRoot: path.resolve(__dirname, '../../..'),
    canonicalRoot: process.env.DILLON_CANONICAL_ROOT
      || path.join(os.homedir(), 'Documents', 'Codex', 'projects', 'client-operations'),
    routineId: null, clientId: null, execute: false, fixture: false, resume: false,
    maxRoutines: 0, json: false, noEvidence: false,
  };
  for (let i = 0; i < argv.length; i++) {
    switch (argv[i]) {
      case '--vault-root': a.vaultRoot = path.resolve(argv[++i]); break;
      case '--canonical-root': a.canonicalRoot = argv[++i]; break;
      case '--routine': a.routineId = argv[++i]; break;
      case '--client': a.clientId = argv[++i]; break;
      case '--execute': a.execute = true; break;
      case '--fixture': a.fixture = true; break;
      case '--resume': a.resume = true; break;
      case '--max-routines': a.maxRoutines = parseInt(argv[++i], 10) || 0; break;
      case '--json': a.json = true; break;
      case '--no-evidence': a.noEvidence = true; break;
      default: break;
    }
  }
  return a;
}

// ------------------------------------------------------------------ cadence bucket
/**
 * ISO 8601 week number. .NET's FirstFourDayWeek/Monday rule (what the PowerShell dispatcher
 * used) matches ISO except that it reports 53, not 1, for the last days of December that ISO
 * assigns to week 1 of the next year. The bucket only needs to be stable within a week, and
 * the PS receipts already on disk use the .NET number, so this reproduces it.
 */
function dotnetWeekOfYear(d) {
  const t = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dayNum = (t.getDay() + 6) % 7; // Monday = 0
  t.setDate(t.getDate() - dayNum + 3); // Thursday of this week
  const firstThu = new Date(t.getFullYear(), 0, 4);
  const iso = 1 + Math.round(((t - firstThu) / 86400000 - 3 + ((firstThu.getDay() + 6) % 7)) / 7);
  if (iso === 1 && d.getMonth() === 11) return 53;
  return iso;
}

/**
 * Dedupe bucket must match the routine's declared cadence. Before 2026-08-18 every cadence
 * keyed on {yyyy-MM-dd}, so a "monthly" routine cleared dedupe every day and ran ~30x its
 * intent. 'weekly-twice' splits the week: Mon-Wed = A, Thu-Sun = B.
 */
function cadenceBucket(d, cadenceRaw) {
  const cadence = String(cadenceRaw || '');
  if (cadence === 'monthly') return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
  if (cadence.startsWith('weekly')) {
    let bucket = `${d.getFullYear()}-W${pad2(dotnetWeekOfYear(d))}`;
    if (cadence === 'weekly-twice') bucket += (d.getDay() >= 1 && d.getDay() <= 3) ? 'A' : 'B';
    return bucket;
  }
  return localDate(d);
}

// ------------------------------------------------------------------ learn (required output)
/**
 * Deterministic learn stage. A failed stage is always a concrete lesson. Otherwise compare
 * this run's stage states with the previous checkpoint: a change is a lesson, no change is
 * an explicit no-finding. The first run after the port records a baseline no-finding.
 * Lessons carry a stable `key` so the craft brief can count recurrences for promotion.
 */
function deriveLearn({ routineId, stageLog, prevCheckpoint, stages }) {
  const now = {};
  for (const s of stageLog) now[s.stage] = s.state;
  const failed = stageLog.find((s) => s.state === 'failed');
  if (failed) {
    return {
      kind: 'lesson', key: `${routineId}:${failed.stage}:failed`,
      text: `stage ${failed.stage} (${failed.capability}) failed: ${failed.detail}`,
      evidence: `attempts=${failed.attempts}`,
    };
  }
  const prev = prevCheckpoint && prevCheckpoint.stage_states;
  if (!prev || typeof prev !== 'object') {
    return { kind: 'no_finding', key: `${routineId}:baseline`, text: 'baseline recorded; no prior stage states to compare', evidence: 'first run with stage_states' };
  }
  const changes = stages.filter((s) => s in prev && s in now && prev[s] !== now[s])
    .map((s) => `${s} ${prev[s]}->${now[s]}`);
  if (changes.length) {
    const details = stageLog.filter((s) => changes.some((c) => c.startsWith(`${s.stage} `)))
      .map((s) => `${s.stage}: ${s.detail}`).join(' | ');
    return {
      kind: 'lesson', key: `${routineId}:${changes.join(',')}`,
      text: `stage state changed since ${prevCheckpoint.run_id || 'previous run'}: ${changes.join('; ')}`,
      evidence: details,
    };
  }
  const blocked = stageLog.filter((s) => s.state === 'blocked').map((s) => s.stage);
  return {
    kind: 'no_finding', key: `${routineId}:stable`,
    text: blocked.length ? `stable: ${blocked.join(',')} blocked as in previous run` : 'stable: all stages ok as in previous run',
    evidence: `compared with ${prevCheckpoint.run_id || 'previous checkpoint'}`,
  };
}

// ------------------------------------------------------------------ prior state
/**
 * Dedupe keys are cadence-scoped (week or month buckets), so the lookup must cover the whole
 * bucket, not just today. The PowerShell dispatcher read only today's receipt log, which is
 * why W04/W09/W10/W11/M02/M03/M04 completed every day from 2026-08-29 onward despite
 * week-shaped keys: yesterday's key was never seen. Circuit-breaker failures stay
 * day-scoped on purpose (3 failures in today's log).
 */
function loadPriorState(queueDir, today, lookbackDays = 31) {
  const priorKeys = new Set(); const priorFail = {};
  const todayMs = Date.parse(`${today}T00:00:00Z`);
  let names = [];
  try { names = fs.readdirSync(queueDir); } catch { names = []; }
  for (const name of names) {
    const m = /^claude-loop-(\d{4}-\d{2}-\d{2})\.jsonl$/.exec(name);
    if (!m) continue;
    const dayMs = Date.parse(`${m[1]}T00:00:00Z`);
    if (!Number.isFinite(dayMs) || dayMs > todayMs || todayMs - dayMs > lookbackDays * 86400000) continue;
    const isToday = m[1] === today;
    for (const line of fs.readFileSync(path.join(queueDir, name), 'utf8').split('\n')) {
      if (!line.trim()) continue;
      let p; try { p = JSON.parse(line); } catch { continue; }
      // A degraded completion is still a completion for dedupe purposes; otherwise a routine
      // whose verify stage legitimately blocks would re-run every cycle.
      if (p.dedupe_key && ['complete', 'complete_degraded'].includes(p.outcome)) priorKeys.add(p.dedupe_key);
      if (isToday && p.outcome && FAILED.includes(p.outcome)) priorFail[p.routine_id] = (priorFail[p.routine_id] || 0) + 1;
    }
  }
  return { priorKeys, priorFail };
}

// ------------------------------------------------------------------ allowlist
// id = { exe, args, timeout, ok_exit, blocked_exit, tier, kind, validate }
// blocked_exit codes mean "honest degraded/blocked", never failure.
const PS = 'powershell'; // sentinel, resolved at run time by resolvePowerShell()
const PS_ARGS = ['-NoLogo', '-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File'];

function buildAllowlist(vaultRoot) {
  const SCRIPTS = path.join(vaultRoot, 'System', 'scripts');
  const BIN = path.join(vaultRoot, '_os', 'automation', 'bin');
  const script = (f) => path.join(SCRIPTS, f);
  const bin = (f) => path.join(BIN, f);
  const ALLOWLIST = {
    vault_health: {
      // exit 1 means the probe RAN and honestly found error-severity vault findings. That is
      // a successful audit with findings, not a failed audit, so it is blocked (honest
      // degraded) rather than failed. Treating it as failed conflated "the vault has
      // problems" with "the checker is broken"; three failures open G8_circuit_breaker, so
      // it took out D03, W11 and E10 together for a day. A genuine crash or an unparseable
      // payload still lands as failed via the `validate` rule.
      exe: PS, args: [...PS_ARGS, script('Test-SecondBrain.ps1'), '-VaultRoot', vaultRoot, '-Json'],
      timeout: 300, ok_exit: [0], blocked_exit: [1], tier: 0, kind: 'readonly', validate: 'json_with_issues',
    },
    team_validate: {
      exe: PS, args: [...PS_ARGS, script('Test-ClaudeOperatingTeam.ps1'), '-VaultRoot', vaultRoot, '-Json'],
      timeout: 300, ok_exit: [0], blocked_exit: [], tier: 0, kind: 'readonly', validate: 'json_overall_pass',
    },
    invariant_scan: {
      exe: PS, args: [...PS_ARGS, script('Test-ClaudeInvariants.ps1'), '-VaultRoot', vaultRoot, '-Json', '-NoEvidence'],
      timeout: 240, ok_exit: [0], blocked_exit: [], tier: 0, kind: 'readonly', validate: 'json_overall_pass',
    },
    browser_canary: {
      exe: PS, args: [...PS_ARGS, script('Test-ClaudeBrowserCanary.ps1'), '-VaultRoot', vaultRoot, '-Active', '-Json'],
      timeout: 120, ok_exit: [0], blocked_exit: [1], tier: 0, kind: 'browser_readonly', validate: 'json_verdict',
    },
    graph_measure: {
      exe: PS, args: [...PS_ARGS, script('Measure-SecondBrainGraph.ps1'), '-VaultRoot', vaultRoot],
      timeout: 300, ok_exit: [0], blocked_exit: [], tier: 0, kind: 'readonly', validate: 'nonempty_stdout',
    },
    frontmatter_validate: {
      exe: 'node', args: [bin('frontmatter-validate.js')],
      timeout: 300, ok_exit: [0], blocked_exit: [2], tier: 0, kind: 'readonly', validate: 'nonempty_stdout',
    },
    queue_status: {
      exe: 'node', args: [bin('queue-status.js')],
      timeout: 180, ok_exit: [0], blocked_exit: [2], tier: 0, kind: 'readonly', validate: 'nonempty_stdout',
    },
    browser_evidence: {
      exe: 'node', args: [bin('claude-browser-evidence.js'), '--scope', 'internal'],
      timeout: 90, ok_exit: [0], blocked_exit: [78], tier: 0, kind: 'browser_readonly', validate: 'json_verdict',
    },
    agentvault_validate: {
      // Sync THEN validate. Validating this generated projection without regenerating it
      // first made W09 the least reliable routine in the estate (0.29 reliability, 10
      // failures in 7 days): its sources change on their own cadence, so the recorded
      // sha256 goes stale and Test-AgentVault throws "Stale vault source". Exit 2 (blocked)
      // when the projection is unavailable; exit 1 only when validation fails on a freshly
      // synced projection.
      exe: PS, args: [...PS_ARGS, script('Sync-AndTest-AgentVault.ps1'), '-Json'],
      timeout: 240, ok_exit: [0], blocked_exit: [2], tier: 1, kind: 'generated_write', validate: 'nonempty_stdout',
    },
    connector_health: {
      exe: 'node', args: [bin('connector-health.js'), '--window-hours', '48'],
      timeout: 60, ok_exit: [0], blocked_exit: [2], tier: 0, kind: 'readonly', validate: 'nonempty_stdout',
    },
    agent_craft_brief: {
      exe: 'node', args: [bin('agent-craft-brief.js'), '--days', '14', '--write'],
      timeout: 120, ok_exit: [0], blocked_exit: [2], tier: 1, kind: 'generated_write', validate: 'nonempty_stdout',
    },
    maps_refresh: {
      exe: PS, args: [...PS_ARGS, script('Update-SecondBrainMaps.ps1'), '-VaultRoot', vaultRoot],
      timeout: 300, ok_exit: [0], blocked_exit: [], tier: 1, kind: 'generated_write', validate: 'nonempty_stdout',
    },
  };
  return ALLOWLIST;
}

// Per-role build command; per-routine override where the routine's intent is explicit.
const ROLE_BUILD = {
  critic: 'invariant_scan', maker: 'team_validate', analyst: 'queue_status',
  terminal_readonly: 'vault_health', architect: 'graph_measure',
};
const ROUTINE_BUILD = {
  W11: 'vault_health', D24: 'invariant_scan', D26: 'agent_craft_brief', W09: 'agentvault_validate',
  E10: 'vault_health', D03: 'vault_health', M02: 'team_validate', E05: 'graph_measure',
  E04: 'connector_health', D07: 'browser_evidence', D12: 'repo_readonly',
  D10: 'comms_triage_readonly', D11: 'comms_triage_readonly', M04: 'comms_triage_readonly',
};

// ------------------------------------------------------------------ main
function main(argv) {
  const opt = parseArgs(argv);
  const vaultRoot = opt.vaultRoot;
  const registryPath = path.join(vaultRoot, '11_Agents', 'claude-operating-team.json');
  if (!fs.existsSync(registryPath)) { process.stdout.write('BLOCKED: registry missing\n'); return 1; }

  const reg = readJsonSafe(registryPath);
  if (!reg) { process.stdout.write('BLOCKED: registry unreadable\n'); return 1; }
  const STAGES = (reg.stage_model && reg.stage_model.operating_stages || []).map((s) => s.key);
  if (STAGES.length !== 9) { process.stdout.write(`BLOCKED: expected 9 stages, got ${STAGES.length}\n`); return 1; }

  const all = reg.routines || [];
  let targets = all;
  if (opt.routineId) targets = all.filter((r) => r.routine_id === opt.routineId);
  if (targets.length === 0) { process.stdout.write('BLOCKED: no such routine\n'); return 1; }

  const startedAt = new Date();
  const runId = `LOOP-${runStamp(startedAt)}`;
  const today = localDate(startedAt);
  const queueDir = path.join(vaultRoot, '12_Brain', 'queue');
  const stateDir = path.join(vaultRoot, '12_Brain', 'state');
  const routineStateDir = path.join(stateDir, 'claude-routines');
  const receiptLog = path.join(queueDir, `claude-loop-${today}.jsonl`);
  const ALLOWLIST = buildAllowlist(vaultRoot);
  const psExe = resolvePowerShell();

  // ------------------------------------------------------- real freshness probes
  function stateStamp(file) {
    if (!fs.existsSync(file)) return { stamp: null, via: 'absent' };
    let stamp = fs.statSync(file).mtimeMs;
    let via = 'mtime';
    const j = readJsonSafe(file);
    const g = j && Date.parse(j.generated_at);
    if (Number.isFinite(g)) { stamp = g; via = 'generated_at'; }
    return { stamp, via };
  }

  function measureFreshness(r) {
    const f = r.source_freshness;
    if (!f) return { ok: false, detail: 'no freshness contract', age_hours: null };
    const probe = String(f.probe || '');
    const maxH = Number(f.window_hours);
    let stamp = null; let via = 'mtime';
    if (probe === 'vault_notes') {
      for (const file of walkFiles(path.join(vaultRoot, '12_Brain'), '.md')) {
        const m = fs.statSync(file).mtimeMs;
        if (stamp === null || m > stamp) stamp = m;
      }
    } else if (probe === 'registry_state') {
      // Newest state file, timed by its generated_at contract when it carries one.
      let files = [];
      try { files = fs.readdirSync(stateDir).filter((n) => n.endsWith('.json')); } catch { files = []; }
      for (const n of files) {
        const s = stateStamp(path.join(stateDir, n));
        if (s.stamp !== null && (stamp === null || s.stamp > stamp)) { stamp = s.stamp; via = s.via; }
      }
    } else if (probe === 'repo_state') {
      // LIVE probe: the working tree is read at execution time, so a stale snapshot cannot
      // exist. Report what was observed instead of aging a commit pointer.
      if (!fs.existsSync(path.join(vaultRoot, '.git'))) return { ok: false, age_hours: null, detail: 'repo_state: not a git repo' };
      const g = spawnSync('git', ['-C', vaultRoot, 'status', '--porcelain'], { encoding: 'utf8', windowsHide: true });
      const dirty = (g.stdout || '').split('\n').filter((l) => l.trim()).length;
      return { ok: true, age_hours: 0, detail: `repo_state live read: ${dirty} tracked changes visible now` };
    } else if (probe === 'canonical_queue') {
      // LIVE probe: the queue file is read at execution time. Its mtime measures how recently
      // Codex wrote it, not whether our read is current, so report both.
      const q = path.join(opt.canonicalRoot, 'queue', 'work-items.json');
      if (!fs.existsSync(q)) return { ok: false, age_hours: null, detail: 'canonical_queue unavailable' };
      const wroteH = round2((Date.now() - fs.statSync(q).mtimeMs) / 3.6e6);
      return { ok: true, age_hours: 0, detail: `canonical_queue live read; Codex last wrote it ${wroteH}h ago` };
    } else if (probe.startsWith('automation:')) {
      const s = stateStamp(path.join(stateDir, `${probe.split(':')[1]}.json`));
      stamp = s.stamp; via = s.via;
    } else if (probe === 'external_connector') {
      return { ok: false, age_hours: null, detail: 'external_connector: not locally probeable, fails closed by design' };
    }
    if (stamp === null) return { ok: false, age_hours: null, detail: `probe '${probe}' source absent` };
    const ageH = round2((Date.now() - stamp) / 3.6e6);
    return { ok: ageH <= maxH, age_hours: ageH, detail: `probe ${probe} age ${ageH}h vs window ${maxH}h${via === 'generated_at' ? ' (generated_at)' : ''}` };
  }

  // ------------------------------------------------- allowlisted command execution
  function invokeAllowlisted(id) {
    if (!Object.prototype.hasOwnProperty.call(ALLOWLIST, id)) {
      return { state: 'failed', detail: `command '${id}' not on allowlist`, exit: null };
    }
    const c = ALLOWLIST[id];
    let exe = c.exe;
    if (exe === PS) {
      if (!psExe) return { state: 'blocked', detail: 'executable powershell/pwsh not resolvable', exit: null };
      exe = psExe;
    } else if (exe === 'node') {
      exe = process.execPath;
    } else if (!which(exe)) {
      return { state: 'blocked', detail: `executable '${exe}' not resolvable`, exit: null };
    }
    const p = spawnSync(exe, c.args, {
      cwd: vaultRoot, encoding: 'utf8', timeout: c.timeout * 1000, maxBuffer: 64 * 1024 * 1024, windowsHide: true,
    });
    if (p.error && p.error.code === 'ETIMEDOUT') return { state: 'blocked', detail: `timeout after ${c.timeout}s`, exit: null };
    if (p.error) return { state: 'blocked', detail: `spawn failed: ${p.error.code || p.error.message}`, exit: null };
    const code = p.status;
    const stdout = p.stdout || '';

    let state = 'failed';
    if (c.ok_exit.includes(code)) state = 'ok';
    else if (c.blocked_exit.includes(code)) state = 'blocked';

    // artifact validation: an accepted exit code is not enough
    let valid = true; let vDetail = '';
    switch (c.validate) {
      case 'json_overall_pass': {
        try { const j = JSON.parse(stdout); valid = j.overall === 'pass'; vDetail = `overall=${j.overall}`; } catch { valid = false; vDetail = 'stdout is not valid JSON'; }
        break;
      }
      case 'json_with_issues': {
        try {
          const j = JSON.parse(stdout);
          const e = (j.issues || []).filter((i) => i.severity === 'error').length;
          valid = e === 0; vDetail = `errors=${e}`;
        } catch { valid = false; vDetail = 'stdout is not valid JSON'; }
        break;
      }
      case 'json_verdict': {
        try { const j = JSON.parse(stdout); vDetail = `verdict=${j.verdict}`; valid = j.verdict !== undefined && j.verdict !== null; } catch { valid = false; vDetail = 'stdout is not valid JSON'; }
        break;
      }
      case 'nonempty_stdout': valid = stdout.trim().length > 0; vDetail = `stdout=${stdout.trim().length}B`; break;
      default: break;
    }
    if (state === 'ok' && !valid) state = 'failed';
    if (!isRedacted(stdout)) return { state: 'failed', detail: 'redaction tripwire on stdout', exit: code };
    return { state, detail: `exit ${code}; ${vDetail}`, exit: code, tier: c.tier, kind: c.kind };
  }

  // ---------------------------------------------- internal read-only capabilities
  function invokeInternal(capability) {
    switch (capability) {
      case 'read_files': {
        let n = 0; let bytes = 0;
        for (const i of ['11_Agents/claude-operating-team.json', '12_Brain/09_Ops/AGENT_PROTOCOL.md']) {
          const p = path.join(vaultRoot, i);
          if (fs.existsSync(p)) { n++; bytes += fs.statSync(p).size; }
        }
        return { state: n === 2 ? 'ok' : 'blocked', detail: `read ${n}/2 inputs, ${bytes} B` };
      }
      case 'diff_sources': {
        const m = path.join(opt.canonicalRoot, '..', 'agent-vault', 'notes', 'inbox', '2026-08-11-grok-bot-routine-recording-manifest.json');
        if (!fs.existsSync(m)) return { state: 'blocked', detail: 'Grok manifest unavailable' };
        const mj = readJsonSafe(m);
        if (!mj) return { state: 'blocked', detail: 'Grok manifest unreadable' };
        const a = new Set((mj.routines || []).map((r) => r.id));
        const b = new Set(all.map((r) => r.routine_id));
        const drift = [...a].filter((x) => !b.has(x)).length + [...b].filter((x) => !a.has(x)).length;
        return { state: drift === 0 ? 'ok' : 'failed', detail: `source drift ${drift}` };
      }
      case 'aggregate_counts': {
        const c = walkFiles(path.join(vaultRoot, '12_Brain'), '.md').length;
        return { state: c > 0 ? 'ok' : 'blocked', detail: `${c} brain notes` };
      }
      case 'hash_files':
        return { state: 'ok', detail: `registry sha256 ${sha256File(registryPath).slice(0, 12)}` };
      case 'git_readonly': {
        const g = spawnSync('git', ['-C', vaultRoot, 'rev-parse', '--abbrev-ref', 'HEAD'], { encoding: 'utf8', windowsHide: true });
        return { state: g.status === 0 ? 'ok' : 'blocked', detail: `branch ${(g.stdout || '').trim()}` };
      }
      case 'check_ports_readonly': {
        const n = process.platform === 'win32'
          ? spawnSync('netstat', ['-ano'], { encoding: 'utf8', windowsHide: true })
          : spawnSync('netstat', ['-an'], { encoding: 'utf8' });
        if (n.error || n.status !== 0) return { state: 'blocked', detail: 'netstat unavailable' };
        const l = (n.stdout || '').split('\n').filter((x) => x.includes(':8420') && /LISTEN/i.test(x)).length;
        return { state: 'ok', detail: `agent-memory listeners ${l}` };
      }
      case 'comms_triage_readonly': {
        // Reads what the already-scheduled Gmail/Slack sensors produced. It does NOT re-run
        // those bridges: duplicating an active automation is forbidden.
        const idx = path.join(opt.canonicalRoot, 'intake', 'index.json');
        if (!fs.existsSync(idx)) return { state: 'blocked', detail: 'intake index unavailable; sensor has not run' };
        const ageH = round2((Date.now() - fs.statSync(idx).mtimeMs) / 3.6e6);
        if (ageH > 26) return { state: 'blocked', detail: `intake index stale ${ageH}h; fail closed` };
        const j = readJsonSafe(idx);
        if (!j) return { state: 'blocked', detail: 'intake index unreadable' };
        const items = j.items || [];
        const pending = items.filter((i) => i.triageState === 'pending').length;
        const quar = items.filter((i) => i.triageState === 'quarantined').length;
        const clients = new Set(items.filter((i) => i.clientId).map((i) => i.clientId)).size;
        return { state: 'ok', detail: `intake ${ageH}h old: ${items.length} obs, ${pending} pending, ${quar} quarantined, ${clients} client routes` };
      }
      case 'repo_readonly': {
        const b = spawnSync('git', ['-C', vaultRoot, 'rev-parse', '--abbrev-ref', 'HEAD'], { encoding: 'utf8', windowsHide: true });
        if (b.status !== 0) return { state: 'blocked', detail: 'git unavailable' };
        const s = spawnSync('git', ['-C', vaultRoot, 'status', '--porcelain'], { encoding: 'utf8', windowsHide: true });
        const dirty = (s.stdout || '').split('\n').filter((l) => l.trim()).length;
        let repos = 0;
        try { repos = fs.readdirSync(path.dirname(vaultRoot), { withFileTypes: true }).filter((e) => e.isDirectory()).length; } catch { repos = 0; }
        const gh = spawnSync('gh', ['auth', 'status'], { encoding: 'utf8', windowsHide: true });
        const ghState = (!gh.error && gh.status === 0) ? 'authenticated' : 'unauthenticated';
        return { state: 'ok', detail: `branch ${(b.stdout || '').trim()}, ${dirty} tracked changes preserved, ${repos} local repos, gh ${ghState}` };
      }
      case 'emit_receipt': return { state: 'ok', detail: 'receipt assembled' };
      default: return { state: 'failed', detail: `internal capability '${capability}' not implemented` };
    }
  }

  // ------------------------------------------------------------------ prior state
  const { priorKeys, priorFail } = loadPriorState(queueDir, today);

  let clientScope = 'internal'; let clientOk = true;
  if (opt.clientId) {
    const creg = readJsonSafe(path.join(opt.canonicalRoot, 'registry', 'clients.json'));
    if (creg) {
      clientOk = (creg.clients || []).filter((c) => c.id === opt.clientId && c.status === 'active').length === 1;
      if (clientOk) clientScope = opt.clientId;
    } else clientOk = false;
  }

  // ------------------------------------------------------------------ lease
  // Machine-local exclusive lease per scope/routine, the named-mutex equivalent. A lock left
  // behind by a crashed process is taken over after LEASE_STALE_MS.
  // ponytail: file lock, not a real mutex; switch to proper-lockfile if two dispatchers ever
  // race for real.
  function acquireLease(scope, id) {
    const file = path.join(os.tmpdir(), `claude-loop-${scope}-${id}.lock`);
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const fd = fs.openSync(file, 'wx');
        fs.writeSync(fd, String(process.pid)); fs.closeSync(fd);
        return { ok: true, release() { try { fs.unlinkSync(file); } catch { /* gone */ } } };
      } catch (e) {
        if (e.code !== 'EEXIST') return { ok: false, release() {} };
        try {
          if (Date.now() - fs.statSync(file).mtimeMs > LEASE_STALE_MS) { fs.unlinkSync(file); continue; }
        } catch { continue; }
        return { ok: false, release() {} };
      }
    }
    return { ok: false, release() {} };
  }

  const rows = [];
  let executed = 0;

  for (const r of targets) {
    if (opt.maxRoutines > 0 && executed >= opt.maxRoutines) break;
    const t0 = Date.now();
    const gates = [];
    const stageLog = [];
    const addG = (gate, ok, detail) => gates.push({ gate, ok: Boolean(ok), detail });

    const bucket = cadenceBucket(new Date(), r.cadence);
    const key = `${clientScope}:${bucket}:${r.routine_id}`;
    let outcome = 'blocked'; let blockedBy = '';

    const g1 = r.claude_may_execute === true && Number(r.approval_tier) <= 1;
    let d1 = `role=${r.claude_role} tier=${r.approval_tier}`;
    if (!g1 && r.claude_never_reason) d1 += ` | ${r.claude_never_reason}`;
    addG('G1_authority', g1, d1);

    const leak = (r.allowed_actions || []).filter((a) => FORBIDDEN_VERBS.includes(a));
    addG('G2_action_safety', leak.length === 0, `forbidden_in_allowed=${leak.length}`);
    addG('G3_client_isolation', clientOk, `scope=${clientScope}`);

    const budget = r.budget_tokens;
    addG('G4_budget_ceiling', budget !== null && budget !== undefined && budget > 0, `${budget} tok / ${r.timeout_seconds}s`);

    let fresh;
    if (opt.fixture) {
      addG('G5_stale_source', true, 'fixture mode: freshness probe bypassed for test');
      fresh = { ok: true, detail: 'fixture', age_hours: 0 };
    } else {
      fresh = measureFreshness(r);
      addG('G5_stale_source', fresh.ok, fresh.detail);
    }

    addG('G6_dedupe', !priorKeys.has(key), `key=${key}`);
    const lease = acquireLease(clientScope, r.routine_id);
    addG('G7_lease', lease.ok, `exclusive lease on ${clientScope}/${r.routine_id}`);
    const pf = priorFail[r.routine_id] || 0;
    addG('G8_circuit_breaker', pf < 3, `prior_failures=${pf}`);

    const failedGates = gates.filter((g) => !g.ok);
    if (failedGates.length > 0) blockedBy = failedGates.map((g) => g.gate).join('+');

    let learn = null;
    const cpTarget = r.checkpoint_resume ? path.join(vaultRoot, r.checkpoint_resume) : null;
    const isRoutineCheckpoint = String(r.checkpoint_resume || '').includes('claude-routines');
    const prevCheckpoint = isRoutineCheckpoint && cpTarget ? readJsonSafe(cpTarget) : null;

    if (failedGates.length === 0 && opt.execute) {
      executed++;
      const buildCmd = ROUTINE_BUILD[r.routine_id] || ROLE_BUILD[r.claude_role];
      const retry = r.retry_policy;
      let maxAttempts = 1; let backoff = [];
      if (retry) { maxAttempts = parseInt(retry.max_attempts, 10) || 1; backoff = retry.backoff_seconds || []; }
      if (maxAttempts < 1) maxAttempts = 1;

      let stageFailed = false;
      const stageStates = {};
      for (const stageKey of STAGES) {
        const s0 = Date.now();
        let res = null; let usedCmd = '';
        let attempt = 0;
        while (attempt < maxAttempts) {
          if (attempt > 0 && backoff.length >= attempt) {
            // The delegated policy backoff (60/300/900s) is sized for connector retries. Inside
            // a synchronous local stage loop it would stall a scheduled run for 16+ minutes, so
            // local commands cap at 5s.
            sleepSync(Math.min(parseInt(backoff[attempt - 1], 10) || 0, LOCAL_BACKOFF_CAP_SECONDS) * 1000);
          }
          switch (stageKey) {
            case 'sense': usedCmd = 'read_files'; res = invokeInternal(usedCmd); break;
            case 'route': usedCmd = 'diff_sources'; res = invokeInternal(usedCmd); break;
            case 'prioritize': usedCmd = 'aggregate_counts'; res = invokeInternal(usedCmd); break;
            case 'build':
              usedCmd = buildCmd;
              res = Object.prototype.hasOwnProperty.call(ALLOWLIST, usedCmd) ? invokeAllowlisted(usedCmd) : invokeInternal(usedCmd);
              break;
            case 'verify': usedCmd = 'browser_canary'; res = invokeAllowlisted(usedCmd); break;
            case 'approve': usedCmd = 'emit_receipt'; res = invokeInternal(usedCmd); break;
            case 'deliver': usedCmd = 'hash_files'; res = invokeInternal(usedCmd); break;
            case 'readback': usedCmd = 'git_readonly'; res = invokeInternal(usedCmd); break;
            case 'learn':
              // Required output: a concrete lesson or an explicit no-finding, never silence.
              usedCmd = 'derive_lesson';
              learn = deriveLearn({ routineId: r.routine_id, stageLog, prevCheckpoint, stages: STAGES });
              res = { state: 'ok', detail: `${learn.kind}: ${learn.text}` };
              break;
            default: usedCmd = stageKey; res = { state: 'failed', detail: `unknown stage '${stageKey}'` };
          }
          if (res.state !== 'failed') break;
          attempt++;
        }
        stageLog.push({
          stage: stageKey, capability: usedCmd, state: res.state, detail: String(res.detail),
          attempts: attempt + 1, seconds: round2((Date.now() - s0) / 1000),
        });
        stageStates[stageKey] = res.state;

        // 'verify' intentionally runs the browser canary: a NOT-READY blocked result is the
        // correct, expected outcome and must not fail the routine.
        if (res.state === 'failed') { stageFailed = true; break; }

        if (isRoutineCheckpoint && cpTarget) {
          const ts = nowIso();
          writeJson(cpTarget, {
            routine_id: r.routine_id, dedupe_key: key, last_stage: stageKey, run_id: runId,
            updated: ts, generated_at: ts, stage_states: { ...stageStates },
          });
        }
      }
      // A stage failure stops the stage loop before `learn`, so the learn record is derived
      // here instead: a failed routine is the run that most needs its finding recorded.
      if (!learn) learn = deriveLearn({ routineId: r.routine_id, stageLog, prevCheckpoint, stages: STAGES });

      const blockedStages = stageLog.filter((s) => s.state === 'blocked').length;
      if (stageFailed) { outcome = 'failed'; blockedBy = `stage:${stageLog.find((s) => s.state === 'failed').stage}`; }
      else if (stageLog.length === STAGES.length) outcome = blockedStages > 0 ? 'complete_degraded' : 'complete';
    } else if (failedGates.length === 0) outcome = 'eligible_not_executed';

    lease.release();
    const elapsed = round2((Date.now() - t0) / 1000);

    let indep = { verified: false, detail: 'not run' };
    if (DONE.includes(outcome)) {
      const h2 = sha256File(registryPath);
      const delivered = (stageLog.find((s) => s.stage === 'deliver') || {}).detail || '';
      const product = all.length * 9;
      indep = {
        verified: delivered.includes(h2.slice(0, 12)) && product === reg.stage_model.total_stages,
        detail: `recomputed registry hash prefix and ${product} vs declared ${reg.stage_model.total_stages}`,
      };
      if (!indep.verified) outcome = 'verification_failed';
    }

    const okCount = stageLog.filter((s) => s.state === 'ok').length;
    const blkCount = stageLog.filter((s) => s.state === 'blocked').length;
    const receipt = {
      route: r.route,
      artifact_paths: [`12_Brain/queue/claude-loop-${today}.jsonl`, r.checkpoint_resume],
      sources_and_freshness: fresh.detail,
      checks: `gates ${gates.length - failedGates.length}/${gates.length}; stages ok ${okCount}/${STAGES.length}; blocked ${blkCount}`,
      assumptions: opt.fixture ? 'fixture mode; freshness bypassed' : 'local and read-only sources only',
      privacy_state: 'redacted',
      approval_state: `tier ${r.approval_tier}; no approval requested or granted`,
      external_action_attempted: 'none',
      next_safest_action: DONE.includes(outcome) ? 'hand receipt to Codex for final verification' : `resolve ${blockedBy}`,
    };

    rows.push({
      routine_id: r.routine_id, name: r.name, module: r.module, owner_bot: r.owner_bot,
      claude_role: r.claude_role, cadence: r.cadence, approval_tier: r.approval_tier,
      outcome, blocked_by: blockedBy, dedupe_key: key,
      gates, stages: stageLog, independent_verification: indep, receipt, learn,
      cost: { elapsed_seconds: elapsed, budget_ceiling: budget, stages_executed: stageLog.length },
      value_signal: r.value_signal,
    });
  }

  const complete = rows.filter((x) => DONE.includes(x.outcome));
  const eligible = rows.filter((x) => x.outcome === 'eligible_not_executed');

  if (opt.json) {
    process.stdout.write(`${JSON.stringify({
      harness: 'Invoke-ClaudeLoop', engine: 'claude-loop.js', run_id: runId,
      mode: opt.execute ? 'bounded-local-execute' : 'gate-report',
      fixture: opt.fixture, privacy: 'redacted',
      canonical_write_attempted: false, external_action_attempted: false,
      allowlist: Object.keys(ALLOWLIST).sort(),
      evaluated: rows.length, complete: complete.length, eligible: eligible.length,
      rows,
    }, null, 2)}\n`);
  } else {
    const out = [''];
    out.push(`Claude loop  ${runId}  mode ${opt.execute ? 'execute' : 'gate-report'}${opt.fixture ? ' [fixture]' : ''}`);
    out.push('-'.repeat(96));
    for (const row of rows) {
      out.push(`${String(row.routine_id).padEnd(5)} ${String(row.module).padEnd(14)} ${String(row.claude_role).padEnd(17)} ${String(row.outcome).padEnd(22)} ${row.blocked_by}`);
      for (const s of row.stages) {
        const m = s.state === 'ok' ? 'ok  ' : s.state === 'blocked' ? 'BLK ' : 'FAIL';
        out.push(`      [${m}] ${s.stage.padEnd(11)} ${String(s.capability).padEnd(22)} ${s.detail}`);
      }
      if (row.stages.length > 0) out.push(`      independent verify: ${row.independent_verification.verified} - ${row.independent_verification.detail}`);
    }
    out.push('-'.repeat(96));
    out.push(`complete ${complete.length}  eligible ${eligible.length}  evaluated ${rows.length}`);
    out.push('');
    process.stdout.write(`${out.join('\n')}\n`);
  }

  if (!opt.noEvidence) {
    fs.mkdirSync(queueDir, { recursive: true });
    for (const row of rows) {
      const line = JSON.stringify({
        ts: nowIso(), harness: 'claude-loop', run_id: runId, routine_id: row.routine_id,
        module: row.module, outcome: row.outcome, blocked_by: row.blocked_by, dedupe_key: row.dedupe_key,
        stages_ok: row.stages.filter((s) => s.state === 'ok').length,
        stages_blocked: row.stages.filter((s) => s.state === 'blocked').length,
        independent_verified: row.independent_verification.verified,
        elapsed_seconds: row.cost.elapsed_seconds,
        privacy: 'redacted', canonical_write_attempted: false, external_action_attempted: false,
        learn: row.learn, receipt: row.receipt,
      });
      if (isRedacted(line)) fs.appendFileSync(receiptLog, `${line}\n`);
      else fs.appendFileSync(receiptLog, '{"harness":"claude-loop","outcome":"blocked","blocked_by":"redaction_tripwire"}\n');
    }
    // Loop summary state: same generated_at contract as the checkpoints, so the observe path
    // can tell how long ago the dispatcher last ran.
    const ts = nowIso();
    writeJson(path.join(stateDir, 'claude-loop.json'), {
      automation_id: 'claude-loop', status: rows.some((x) => x.outcome === 'verification_failed') ? 'error' : 'ok',
      run_id: runId, mode: opt.execute ? 'bounded-local-execute' : 'gate-report', fixture: opt.fixture,
      generated_at: ts, written_at: ts,
      counts: { evaluated: rows.length, complete: complete.length, eligible: eligible.length, executed },
      outcomes: Object.fromEntries(rows.map((x) => [x.routine_id, x.outcome])),
      learn: Object.fromEntries(rows.filter((x) => x.learn).map((x) => [x.routine_id, x.learn.kind])),
    });
  }

  return rows.some((x) => x.outcome === 'verification_failed') ? 1 : 0;
}

if (require.main === module) {
  process.exitCode = main(process.argv.slice(2));
}

module.exports = { parseArgs, cadenceBucket, dotnetWeekOfYear, deriveLearn, loadPriorState, buildAllowlist, ROLE_BUILD, ROUTINE_BUILD, FORBIDDEN_VERBS, isRedacted, localDate };
