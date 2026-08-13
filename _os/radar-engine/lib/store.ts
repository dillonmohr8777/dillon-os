'use strict';

const fs = require('fs');
const path = require('path');
const { id, nowIso } = require('./ids.ts');
const { assertTransition } = require('./states.ts');

function stamp(row, extra = {}) {
  const now = nowIso();
  return {
    created_at: row.created_at || now,
    updated_at: now,
    provenance: row.provenance || { actor: 'system', source: 'radar-v2' },
    ...row,
    ...extra,
  };
}

class MemoryStore {
  constructor() {
    this.kind = 'memory';
    this.tables = {
      campaigns: new Map(),
      prospects: new Map(),
      prospect_sources: new Map(),
      prospect_identities: new Map(),
      suppressions: new Map(),
      intake_submissions: new Map(),
      audit_runs: new Map(),
      evidence_items: new Map(),
      score_snapshots: new Map(),
      reports: new Map(),
      report_versions: new Map(),
      contacts: new Map(),
      contact_sources: new Map(),
      outreach_drafts: new Map(),
      approvals: new Map(),
      crm_handoffs: new Map(),
      bookings: new Map(),
      sales_outcomes: new Map(),
      events: new Map(),
      jobs: new Map(),
      rate_limits: new Map(),
    };
    this.locks = new Map();
  }

  async close() {}

  insert(table, row) {
    const rec = stamp({ id: row.id || id(table.replace(/s$/, '')), ...row });
    this.tables[table].set(rec.id, rec);
    return rec;
  }

  update(table, idValue, patch) {
    const cur = this.tables[table].get(idValue);
    if (!cur) throw new Error(`${table} ${idValue} not found`);
    const next = stamp({ ...cur, ...patch, id: cur.id, created_at: cur.created_at });
    this.tables[table].set(idValue, next);
    return next;
  }

  get(table, idValue) {
    return this.tables[table].get(idValue) || null;
  }

  all(table) {
    return [...this.tables[table].values()];
  }

  find(table, pred) {
    return this.all(table).filter(pred);
  }

  findOne(table, pred) {
    return this.all(table).find(pred) || null;
  }

  async emitEvent({ actor, reason, correlationId, prospectId, type, payload }) {
    return this.insert('events', {
      id: id('event'),
      actor: actor || 'system',
      reason: reason || '',
      timestamp: nowIso(),
      correlation_id: correlationId || null,
      prospect_id: prospectId || null,
      type,
      payload: payload || {},
    });
  }

  async transition(prospectId, to, { actor, reason, correlationId } = {}) {
    const p = this.get('prospects', prospectId);
    if (!p) throw new Error(`prospect ${prospectId} not found`);
    const from = p.lifecycle;
    assertTransition(from, to);
    const updated = this.update('prospects', prospectId, { lifecycle: to });
    await this.emitEvent({
      actor: actor || 'system',
      reason: reason || `transition ${from} -> ${to}`,
      correlationId,
      prospectId,
      type: 'lifecycle.transition',
      payload: { from, to },
    });
    return updated;
  }

  async enqueueJob({ type, idempotencyKey, payload, maxRetries = 5 }) {
    const existing = this.findOne('jobs', (j) => j.idempotency_key === idempotencyKey);
    if (existing) return { job: existing, duplicate: true };
    const job = this.insert('jobs', {
      id: id('job'),
      type,
      idempotency_key: idempotencyKey,
      payload: payload || {},
      status: 'queued',
      retry_count: 0,
      max_retries: maxRetries,
      next_attempt_at: nowIso(),
      locked_at: null,
      locked_by: null,
      last_error: null,
      dead_letter: false,
    });
    return { job, duplicate: false };
  }

  async claimJob(workerId) {
    const now = Date.now();
    const due = this.all('jobs')
      .filter((j) => j.status === 'queued' && !j.dead_letter && new Date(j.next_attempt_at).getTime() <= now)
      .sort((a, b) => new Date(a.next_attempt_at) - new Date(b.next_attempt_at));
    const job = due[0];
    if (!job) return null;
    if (this.locks.has(job.id)) return null;
    this.locks.set(job.id, workerId);
    return this.update('jobs', job.id, {
      status: 'running',
      locked_at: nowIso(),
      locked_by: workerId,
    });
  }

  backoffMs(retryCount) {
    const override = Number(process.env.RADAR_V2_JOB_BACKOFF_MS);
    if (Number.isFinite(override)) return override;
    return Math.min(30 * 60 * 1000, 1000 * Math.pow(2, retryCount));
  }

  async completeJob(jobId) {
    this.locks.delete(jobId);
    return this.update('jobs', jobId, { status: 'succeeded', locked_at: null, locked_by: null });
  }

  async failJob(jobId, error) {
    const job = this.get('jobs', jobId);
    this.locks.delete(jobId);
    const retry = (job.retry_count || 0) + 1;
    if (retry > (job.max_retries || 5)) {
      return this.update('jobs', jobId, {
        status: 'dead_letter',
        dead_letter: true,
        retry_count: retry,
        last_error: String(error),
        locked_at: null,
        locked_by: null,
      });
    }
    const next = new Date(Date.now() + this.backoffMs(retry)).toISOString();
    return this.update('jobs', jobId, {
      status: 'queued',
      retry_count: retry,
      next_attempt_at: next,
      last_error: String(error),
      locked_at: null,
      locked_by: null,
    });
  }

  async bumpRateLimit(key, windowMs = 3600000, max = 5) {
    const windowStart = new Date(Math.floor(Date.now() / windowMs) * windowMs).toISOString();
    const existing = this.findOne('rate_limits', (r) => r.key === key && r.window_start === windowStart);
    if (!existing) {
      this.insert('rate_limits', { id: id('rate'), key, window_start: windowStart, count: 1 });
      return { allowed: true, count: 1 };
    }
    const count = existing.count + 1;
    this.update('rate_limits', existing.id, { count });
    return { allowed: count <= max, count };
  }
}

class PgStore {
  constructor(pool) {
    this.kind = 'postgres';
    this.pool = pool;
    this.memory = new MemoryStore();
  }

  async close() {
    await this.pool.end();
  }

  async query(sql, params = []) {
    return this.pool.query(sql, params);
  }

  insert(table, row) {
    return this.memory.insert(table, row);
  }
  update(table, idValue, patch) {
    return this.memory.update(table, idValue, patch);
  }
  get(table, idValue) {
    return this.memory.get(table, idValue);
  }
  all(table) {
    return this.memory.all(table);
  }
  find(table, pred) {
    return this.memory.find(table, pred);
  }
  findOne(table, pred) {
    return this.memory.findOne(table, pred);
  }
  emitEvent(args) {
    return this.memory.emitEvent(args);
  }
  transition(prospectId, to, meta) {
    return this.memory.transition(prospectId, to, meta);
  }
  enqueueJob(args) {
    return this.memory.enqueueJob(args);
  }
  claimJob(workerId) {
    return this.memory.claimJob(workerId);
  }
  completeJob(jobId) {
    return this.memory.completeJob(jobId);
  }
  failJob(jobId, error) {
    return this.memory.failJob(jobId, error);
  }
  bumpRateLimit(key, windowMs, max) {
    return this.memory.bumpRateLimit(key, windowMs, max);
  }

  async persistAll() {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      for (const [table, rows] of Object.entries(this.memory.tables)) {
        for (const row of rows.values()) {
          const keys = Object.keys(row);
          const cols = keys.map((k) => `"${k}"`).join(', ');
          const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
          const updates = keys
            .filter((k) => k !== 'id')
            .map((k) => `"${k}" = EXCLUDED."${k}"`)
            .join(', ');
          const values = keys.map((k) => {
            const v = row[k];
            if (v && typeof v === 'object' && !(v instanceof Date)) return JSON.stringify(v);
            return v;
          });
          await client.query(
            `INSERT INTO ${table} (${cols}) VALUES (${placeholders}) ON CONFLICT (id) DO UPDATE SET ${updates}`,
            values
          );
        }
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}

async function migrate(databaseUrl) {
  const sqlPath = path.join(__dirname, '..', 'migrations', '001_init.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');
  if (!databaseUrl) {
    return { applied: false, reason: 'DATABASE_URL not set; schema file validated only' };
  }
  const { Pool } = require('pg');
  const pool = new Pool({ connectionString: databaseUrl });
  try {
    await pool.query(sql);
    await pool.query(
      `INSERT INTO schema_migrations (id) VALUES ($1) ON CONFLICT (id) DO NOTHING`,
      ['001_init']
    );
    return { applied: true, reason: '001_init' };
  } finally {
    await pool.end();
  }
}

async function createStore({ databaseUrl } = {}) {
  if (!databaseUrl) return new MemoryStore();
  const { Pool } = require('pg');
  const pool = new Pool({ connectionString: databaseUrl });
  try {
    await pool.query('SELECT 1');
  } catch (err) {
    await pool.end().catch(() => {});
    const store = new MemoryStore();
    store.pgUnavailable = String(err.message || err);
    return store;
  }
  const store = new PgStore(pool);
  store.pgReady = true;
  return store;
}

function listMigrationTables() {
  const sql = fs.readFileSync(path.join(__dirname, '..', 'migrations', '001_init.sql'), 'utf8');
  const tables = [...sql.matchAll(/CREATE TABLE IF NOT EXISTS (\w+)/g)].map((m) => m[1]);
  return tables;
}

module.exports = {
  MemoryStore,
  PgStore,
  createStore,
  migrate,
  listMigrationTables,
};
