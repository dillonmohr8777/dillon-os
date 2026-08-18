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

const fs = require('fs');
const { repoPath, readJson } = require('../lib/fsutil');

const STATE = repoPath('12_Brain/state/connector-health.json');

function argInt(flag, dflt) {
  const i = process.argv.indexOf(flag);
  if (i < 0) return dflt;
  const n = parseInt(process.argv[i + 1], 10);
  return Number.isFinite(n) ? n : dflt;
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

  const nowMs = fs.statSync(STATE).mtimeMs;
  const rows = state.connectors.map((c) => {
    // Age from the connector's own observation stamp, not the file mtime: one
    // stale connector inside a freshly-rewritten file must still read as stale.
    const seen = Date.parse(c.last_verified_utc || '');
    const ageH = Number.isFinite(seen) ? Number(((nowMs - seen) / 3.6e6).toFixed(2)) : null;
    const usable = c.status === 'active' && c.read_verified === true
      && ageH !== null && ageH <= windowHours;
    return {
      toolkit: c.toolkit,
      status: c.status,
      read_verified: c.read_verified === true,
      age_hours: ageH,
      usable,
      note: c.note || null,
    };
  });

  const fresh = rows.filter((r) => r.usable);
  const out = {
    automation_id: 'connector-health',
    status: fresh.length ? 'ok' : 'blocked',
    window_hours: windowHours,
    counts: { connectors: rows.length, usable: fresh.length, unusable: rows.length - fresh.length },
    connectors: rows,
    recorded_by: state.recorded_by || 'unknown',
    recorded_at_utc: state.recorded_at_utc || null,
  };
  process.stdout.write(`${JSON.stringify(out, null, 2)}\n`);
  process.exit(fresh.length ? 0 : 2);
}

main();
