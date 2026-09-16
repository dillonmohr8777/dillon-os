#!/usr/bin/env node
'use strict';

/**
 * Push the agent roster to the cloud console mirror (Cloudflare D1) so the
 * console at _os/cloud-console/worker.js has something to read when this
 * desktop is off. See 12_Brain/07_Reviews/2026-09-09 - Machine power fault
 * diagnosis.md for why that matters.
 *
 *   node _os/automation/bin/sync-cloud-console.js
 *
 * Reads the same two sources the local HUD reads (12_Brain/registry/
 * automations.json + lastRuns() from ../lib/run-record.js) and upserts them
 * into D1 over the plain Cloudflare REST API. This runs as a bare `node`
 * child process (spawned fire-and-forget from server.js, and once per
 * cadence pass from the driver), so it has no MCP tool access and must
 * authenticate itself.
 *
 * Needs two env vars, same names already used as GitHub Actions secrets for
 * the radar-d1 Worker (.github/workflows/deploy-radar-d1-worker.yml):
 *   CLOUDFLARE_API_TOKEN    : D1 edit scope on the momentum-console database
 *   CLOUDFLARE_ACCOUNT_ID   : the account the database lives in
 * Neither is set on this machine yet. Missing either is not an error: this
 * script logs one line and exits 0 so it never breaks the server or a
 * cadence pass. Set both the same way the radar ones were set, then this
 * starts working with no code change.
 *
 * Zero new npm dependencies. Uses Node 18+'s built-in fetch, same baseline
 * _os/server.js already assumes.
 */

const path = require('path');
const { lastRuns } = require('../lib/run-record');

const VAULT = path.resolve(__dirname, '..', '..', '..');
const REGISTRY = path.join(VAULT, '12_Brain', 'registry', 'automations.json');

// Locator only, not a secret, same pattern as MOMENTUM_HUD_TOKEN in server.js.
const DATABASE_ID = 'e9e219c7-740c-4573-8008-f192317ed992';
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN || null;
const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || null;
const API = (accountId) => `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${DATABASE_ID}/query`;

async function d1(sql, params) {
  const res = await fetch(API(ACCOUNT_ID), {
    method: 'POST',
    headers: { authorization: `Bearer ${API_TOKEN}`, 'content-type': 'application/json' },
    body: JSON.stringify({ sql, params }),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok || !body || body.success === false) {
    const msg = body && body.errors ? JSON.stringify(body.errors) : `HTTP ${res.status}`;
    throw new Error(`D1 query failed: ${msg}`);
  }
  return body;
}

function agentRows() {
  const registry = JSON.parse(require('fs').readFileSync(REGISTRY, 'utf8'));
  const now = new Date().toISOString();
  return registry.automations.map((a) => [
    a.id, a.name, a.lane || null, a.function || 'unassigned', a.audience || 'internal',
    a.cadence || null, a.enabled ? 1 : 0, a.lifecycle || null, a.kind || null,
    JSON.stringify(a.outputs || []), now,
  ]);
}

function runRows() {
  const last = lastRuns();
  return Object.keys(last).map((agentId) => {
    const r = last[agentId];
    return [agentId, r.run_id || null, r.started || null, r.ended || null,
      Number.isInteger(r.exit_code) ? r.exit_code : null, r.status || null,
      r.artifact || null, r.note || null];
  });
}

async function main() {
  if (!API_TOKEN || !ACCOUNT_ID) {
    console.log('sync-cloud-console: skipped, CLOUDFLARE_API_TOKEN / CLOUDFLARE_ACCOUNT_ID not set');
    return;
  }

  const agents = agentRows();
  const runs = runRows();

  if (agents.length) {
    const sql = `INSERT OR REPLACE INTO agents (id,name,lane,function,audience,cadence,enabled,lifecycle,kind,outputs,updated_at) VALUES ${agents.map(() => '(?,?,?,?,?,?,?,?,?,?,?)').join(',')}`;
    await d1(sql, agents.flat());
  }
  if (runs.length) {
    const sql = `INSERT OR REPLACE INTO runs (agent_id,run_id,started,ended,exit_code,status,artifact,note) VALUES ${runs.map(() => '(?,?,?,?,?,?,?,?)').join(',')}`;
    await d1(sql, runs.flat());
  }
  await d1('INSERT OR REPLACE INTO sync_meta (key, value) VALUES (?, ?)', ['last_synced_at', new Date().toISOString()]);

  console.log(`sync-cloud-console: ${agents.length} agents (${agents.filter((r) => r[6] === 1).length} enabled), ${runs.length} runs synced`);
}

main().catch((err) => {
  console.error('sync-cloud-console:', err.message);
  process.exitCode = 1;
});
