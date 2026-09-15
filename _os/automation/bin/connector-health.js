#!/usr/bin/env node
'use strict';

/**
 * Connector health probe.
 *
 * The loop's `external_connector` freshness probe fails closed unconditionally,
 * with the comment "not locally probeable". That was true when nothing could
 * reach an ad platform from this machine. It is no longer the whole story:
 * Composio holds active connections, so reachability CAN be established — just
 * not by a PowerShell script with no MCP access.
 *
 * So the write and the read are split:
 *
 *   WRITE  an MCP-capable agent (`paid-media-analyst`) calls Composio, then
 *          records what it actually observed into 12_Brain/state/connector-health.json.
 *   READ   this CLI validates that file and reports which connectors are fresh.
 *          The loop can then use `automation:connector-health` as a real G5 probe
 *          instead of a blanket refusal.
 *
 * This CLI never contacts a provider and never invents a status. If no agent has
 * recorded a connector recently, that connector is stale and its routines stay
 * blocked — which is the correct outcome, not a failure.
 *
 *   node _os/automation/bin/connector-health.js [--window-hours 48] [--json]
 *
 * Exit 0 = at least one connector fresh. Exit 2 = none fresh (blocked, not failed).
 */

const { repoPath, readJson } = require('../lib/fsutil');

const STATE = repoPath('12_Brain/state/connector-health.json');

function argInt(flag, dflt) {
  const i = process.argv.indexOf(flag);
  if (i < 0) return dflt;
  const n = parseInt(process.argv[i + 1], 10);
  return Number.isFinite(n) ? n : dflt;
}

function evaluateState(state, windowHours, nowMs = Date.now()) {
  const rows = state.connectors.map((c) => {
    // Age from the connector's own observation stamp and the actual evaluation
    // clock. File mtime is ingestion recency, not provider-evidence recency.
    const seen = Date.parse(c.last_verified_utc || '');
    const ageH = Number.isFinite(seen) ? Number(((nowMs - seen) / 3.6e6).toFixed(2)) : null;
    const usable = c.status === 'active' && c.read_verified === true &&
      ageH !== null && ageH >= 0 && ageH <= windowHours;
    return {
      toolkit: c.toolkit,
      status: c.status,
      read_verified: c.read_verified === true,
      observed_at_utc: Number.isFinite(seen) ? new Date(seen).toISOString() : null,
      age_hours: ageH,
      usable,
      note: c.note || null,
    };
  });

  // generated_at is the shared timestamp contract; recorded_at_utc is what the
  // MCP agent has written so far and stays the fallback.
  const snapshotStamp = state.generated_at || state.recorded_at_utc || '';
  const recordedAt = Date.parse(snapshotStamp);
  return {
    rows,
    generated_at: Number.isFinite(recordedAt) ? snapshotStamp : null,
    snapshot_age_hours: Number.isFinite(recordedAt)
      ? Number(((nowMs - recordedAt) / 3.6e6).toFixed(2))
      : null,
  };
}

function main() {
  const windowHours = argInt('--window-hours', 48);
  const state = readJson(STATE, null);

  if (!state || !Array.isArray(state.connectors)) {
    const out = {
      automation_id: 'connector-health',
      status: 'blocked',
      detail: 'no connector-health state recorded; an MCP-capable agent must write it first',
      state_path: '12_Brain/state/connector-health.json',
    };
    process.stdout.write(`${JSON.stringify(out, null, 2)}\n`);
    process.exit(2);
  }

  const { rows, snapshot_age_hours: snapshotAgeHours, generated_at: generatedAt } = evaluateState(
    state,
    windowHours
  );

  const fresh = rows.filter((r) => r.usable);
  const out = {
    automation_id: 'connector-health',
    status: fresh.length ? 'ok' : 'blocked',
    window_hours: windowHours,
    snapshot_age_hours: snapshotAgeHours,
    generated_at: generatedAt,
    counts: { connectors: rows.length, usable: fresh.length, unusable: rows.length - fresh.length },
    connectors: rows,
    recorded_by: state.recorded_by || 'unknown',
    recorded_at_utc: state.recorded_at_utc || null,
  };
  process.stdout.write(`${JSON.stringify(out, null, 2)}\n`);
  process.exit(fresh.length ? 0 : 2);
}

if (require.main === module) main();

module.exports = { evaluateState };
