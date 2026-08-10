// Stage state machine: immutable attempt rows, Merkle input hashing,
// lease/heartbeat in-flight detection, memoized SUCCEEDED lookups.
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

export const STATUS = Object.freeze({
  PENDING: "PENDING", READY: "READY", RUNNING: "RUNNING", SUCCEEDED: "SUCCEEDED",
  FAILED: "FAILED", CANCELLED: "CANCELLED", EXHAUSTED: "EXHAUSTED", QUARANTINED: "QUARANTINED",
});

const LEGAL = {
  PENDING: ["READY"],
  READY: ["RUNNING", "EXHAUSTED"],
  RUNNING: ["SUCCEEDED", "FAILED", "CANCELLED"],
  FAILED: ["READY", "QUARANTINED"],
  CANCELLED: ["READY"],
  SUCCEEDED: [], EXHAUSTED: [], QUARANTINED: [],
};

export function canonicalJson(value) {
  return JSON.stringify(sortValue(value));
}
function sortValue(v) {
  if (Array.isArray(v)) return v.map(sortValue);
  if (v && typeof v === "object" && v.constructor === Object) {
    const out = {};
    for (const k of Object.keys(v).sort()) out[k] = sortValue(v[k]);
    return out;
  }
  return v;
}

export function sha256(data) {
  return crypto.createHash("sha256").update(data).digest("hex");
}

export function fileSha256(file) {
  return sha256(fs.readFileSync(file));
}

// input_hash: stage identity + hand-bumped impl_version + the declared config
// subset + sorted upstream output hashes + external pins (model, template sha).
// Never git HEAD: a refactor must not rebuild the world.
export function inputHash({ stage, implVersion, params = {}, upstream = [], external = {} }) {
  return sha256(canonicalJson({
    stage,
    impl_version: implVersion,
    params,
    upstream: [...upstream].sort(),
    external,
  }));
}

export function manifestOf(files, baseDir) {
  const entries = files.map((f) => {
    const abs = path.isAbsolute(f) ? f : path.join(baseDir, f);
    const st = fs.statSync(abs);
    return { path: path.relative(baseDir, abs).replace(/\\/g, "/"), sha256: fileSha256(abs), bytes: st.size };
  }).sort((a, b) => a.path.localeCompare(b.path));
  return { baseDir, entries, output_hash: sha256(canonicalJson(entries)) };
}

export function verifyManifest(manifest) {
  for (const e of manifest.entries) {
    const abs = path.join(manifest.baseDir, e.path);
    if (!fs.existsSync(abs) || fileSha256(abs) !== e.sha256) return false;
  }
  return true;
}

export class StageMachine {
  constructor(db, { leaseStaleMs = 90_000 } = {}) {
    this.db = db;
    this.leaseStaleMs = leaseStaleMs;
  }

  // Memo lookup: a SUCCEEDED row for this (prospect, stage, input_hash) whose
  // artifacts still verify on disk.
  findMemo(prospectId, stage, inputHashValue) {
    const row = this.db.prepare(
      `SELECT * FROM stage_executions WHERE prospect_id = ? AND stage = ? AND input_hash = ? AND status = 'SUCCEEDED'`
    ).get(prospectId, stage, inputHashValue);
    if (!row) return null;
    const manifest = row.output_manifest ? JSON.parse(row.output_manifest) : null;
    if (manifest && !verifyManifest(manifest)) return null; // trust nothing on resume
    return row;
  }

  nextAttempt(runId, prospectId, stage) {
    const r = this.db.prepare(
      `SELECT COALESCE(MAX(attempt), 0) AS a FROM stage_executions WHERE run_id = ? AND prospect_id = ? AND stage = ?`
    ).get(runId, prospectId, stage);
    return (r?.a ?? 0) + 1;
  }

  create(runId, prospectId, stage, inputHashValue, status = STATUS.READY) {
    const attempt = this.nextAttempt(runId, prospectId, stage);
    this.db.prepare(
      `INSERT INTO stage_executions (run_id, prospect_id, stage, attempt, input_hash, status, started_at)
       VALUES (?, ?, ?, ?, ?, ?, NULL)`
    ).run(runId, prospectId, stage, attempt, inputHashValue, status);
    return this.get(runId, prospectId, stage, attempt);
  }

  get(runId, prospectId, stage, attempt) {
    return this.db.prepare(
      `SELECT * FROM stage_executions WHERE run_id = ? AND prospect_id = ? AND stage = ? AND attempt = ?`
    ).get(runId, prospectId, stage, attempt);
  }

  transition(id, from, to, fields = {}) {
    if (!LEGAL[from]?.includes(to)) throw new Error(`illegal transition ${from} -> ${to}`);
    const sets = ["status = ?"]; const vals = [to];
    for (const [k, v] of Object.entries(fields)) { sets.push(`${k} = ?`); vals.push(v); }
    vals.push(id, from);
    const res = this.db.prepare(
      `UPDATE stage_executions SET ${sets.join(", ")} WHERE id = ? AND status = ?`
    ).run(...vals);
    if (res.changes !== 1) throw new Error(`transition raced: id=${id} expected ${from}`);
  }

  lease(id) {
    const leaseId = crypto.randomUUID();
    this.transition(id, STATUS.READY, STATUS.RUNNING, {
      lease_id: leaseId, heartbeat_at: Date.now(), started_at: Date.now(),
    });
    return leaseId;
  }

  heartbeat(id, leaseId) {
    this.db.prepare(
      `UPDATE stage_executions SET heartbeat_at = ? WHERE id = ? AND lease_id = ? AND status = 'RUNNING'`
    ).run(Date.now(), id, leaseId);
  }

  succeed(id, leaseId, { manifest, verifier, verifierVersion, cost, cacheHit = false }) {
    const res = this.db.prepare(
      `UPDATE stage_executions SET status = 'SUCCEEDED', output_hash = ?, output_manifest = ?,
        verifier = ?, verifier_version = ?, cost_json = ?, cache_hit = ?, finished_at = ?
       WHERE id = ? AND lease_id = ? AND status = 'RUNNING'`
    ).run(manifest?.output_hash ?? null, manifest ? JSON.stringify(manifest) : null,
      verifier ?? null, verifierVersion ?? null, cost ? JSON.stringify(cost) : null,
      cacheHit ? 1 : 0, Date.now(), id, leaseId);
    if (res.changes !== 1) throw new Error(`succeed raced: id=${id}`);
  }

  fail(id, leaseId, reason, cost) {
    const res = this.db.prepare(
      `UPDATE stage_executions SET status = 'FAILED', failure_reason = ?, cost_json = ?, finished_at = ?
       WHERE id = ? AND lease_id = ? AND status = 'RUNNING'`
    ).run(String(reason).slice(0, 4000), cost ? JSON.stringify(cost) : null, Date.now(), id, leaseId);
    if (res.changes !== 1) throw new Error(`fail raced: id=${id}`);
  }

  // Reap RUNNING rows with stale heartbeats -> CANCELLED (then re-enqueue as READY rows).
  reapStale() {
    const cutoff = Date.now() - this.leaseStaleMs;
    const stale = this.db.prepare(
      `SELECT id FROM stage_executions WHERE status = 'RUNNING' AND (heartbeat_at IS NULL OR heartbeat_at < ?)`
    ).all(cutoff);
    for (const { id } of stale) {
      this.db.prepare(`UPDATE stage_executions SET status = 'CANCELLED', finished_at = ? WHERE id = ? AND status = 'RUNNING'`)
        .run(Date.now(), id);
    }
    return stale.length;
  }
}
