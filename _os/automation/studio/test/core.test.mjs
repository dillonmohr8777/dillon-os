import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

// Point the studio at a throwaway data root BEFORE importing modules that read it.
const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "radar-studio-test-"));
process.env.PROSPECT_RADAR_STUDIO_HOME = tmpRoot;

const { openDb } = await import("../core/db.mjs");
const { StageMachine, STATUS, inputHash, canonicalJson, manifestOf, verifyManifest } = await import("../core/stage-machine.mjs");
const { RunLock } = await import("../core/lock.mjs");
const { Budgets, Semaphore } = await import("../core/scheduler.mjs");

test("migrations apply and are idempotent", () => {
  const db = openDb(path.join(tmpRoot, "state", "state.db"));
  const tables = db.prepare(`SELECT name FROM sqlite_master WHERE type='table'`).all().map((r) => r.name);
  for (const t of ["runs", "stage_executions", "llm_calls", "budgets", "built_sites", "evidence", "design_signatures"]) {
    assert.ok(tables.includes(t), `missing table ${t}`);
  }
  db.close();
});

test("canonical json is key-order independent", () => {
  assert.equal(canonicalJson({ b: 1, a: [{ d: 2, c: 3 }] }), canonicalJson({ a: [{ c: 3, d: 2 }], b: 1 }));
});

test("input hash: stable, sensitive to impl_version, insensitive to upstream order", () => {
  const base = { stage: "copy", implVersion: "1", params: { words: [1100, 1700] }, upstream: ["aa", "bb"], external: { model: "m" } };
  assert.equal(inputHash(base), inputHash({ ...base, upstream: ["bb", "aa"] }));
  assert.notEqual(inputHash(base), inputHash({ ...base, implVersion: "2" }));
});

test("stage machine: full lifecycle + memo + manifest verification", () => {
  const db = openDb(path.join(tmpRoot, "state", "state.db"));
  const sm = new StageMachine(db);
  db.prepare(`INSERT OR IGNORE INTO runs (run_id, run_date, phase, status, started_at) VALUES ('t1','t1','research','active',?)`).run(Date.now());

  const ih = inputHash({ stage: "research", implVersion: "1", upstream: [] });
  const row = sm.create("t1", "p1", "research", ih);
  assert.equal(row.status, STATUS.READY);

  const lease = sm.lease(row.id);
  // artifacts-first, DB-commit-last
  const dir = path.join(tmpRoot, "work", "t1", "p1");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "facts.json"), JSON.stringify({ ok: true }));
  const manifest = manifestOf([path.join(dir, "facts.json")], dir);
  sm.succeed(row.id, lease, { manifest, verifier: "schema", verifierVersion: "1" });

  const memo = sm.findMemo("p1", "research", ih);
  assert.ok(memo, "memo hit expected");
  assert.ok(verifyManifest(JSON.parse(memo.output_manifest)));

  // tamper -> memo must reject
  fs.writeFileSync(path.join(dir, "facts.json"), "tampered");
  assert.equal(sm.findMemo("p1", "research", ih), null);
  db.close();
});

test("stage machine: illegal transition throws; stale lease reaped", () => {
  const db = openDb(path.join(tmpRoot, "state", "state.db"));
  const sm = new StageMachine(db, { leaseStaleMs: 1 });
  const ih = inputHash({ stage: "build", implVersion: "1" });
  const row = sm.create("t1", "p2", "build", ih);
  assert.throws(() => sm.transition(row.id, STATUS.READY, STATUS.SUCCEEDED));
  sm.lease(row.id);
  db.prepare(`UPDATE stage_executions SET heartbeat_at = 0 WHERE id = ?`).run(row.id);
  assert.equal(sm.reapStale(), 1);
  assert.equal(sm.get("t1", "p2", "build", row.attempt).status, STATUS.CANCELLED);
  db.close();
});

test("run lock: exclusive, stale takeover", () => {
  const dir = path.join(tmpRoot, "locks");
  const a = new RunLock(dir, "t", { staleMs: 60_000 }).acquire();
  assert.throws(() => new RunLock(dir, "t").acquire(), /another run holds/);
  a.release();
  const b = new RunLock(dir, "t").acquire();
  b.release();
});

test("budgets: reserve refuses over cap; settle adjusts", () => {
  const db = openDb(path.join(tmpRoot, "state", "state.db"));
  const budgets = new Budgets(db, "t1");
  budgets.init({ images_count: 10 });
  const settle = budgets.reserve("images_count", 6);
  assert.ok(settle);
  assert.equal(budgets.reserve("images_count", 6), null); // 6+6 > 10 refused
  settle(4); // actual was 4 -> 2 freed
  assert.ok(budgets.reserve("images_count", 6));
  db.close();
});

test("semaphore caps concurrency", async () => {
  const sem = new Semaphore(2);
  let active = 0, peak = 0;
  await Promise.all(Array.from({ length: 6 }, () => sem.run(async () => {
    active++; peak = Math.max(peak, active);
    await new Promise((r) => setTimeout(r, 10));
    active--;
  })));
  assert.equal(peak, 2);
});
