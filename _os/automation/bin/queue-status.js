#!/usr/bin/env node
'use strict';

/**
 * Observe path for the automation registry: what each automation last wrote and how stale
 * that state is. Staleness is measured from `generated_at` (the one timestamp contract in
 * 12_Brain/schemas/automation-run.json); `written_at` is the backward-compatible fallback.
 */

const fs = require('fs');
const path = require('path');
const { repoPath, readJson, nowISO } = require('../lib/fsutil');
const { loadRegistry } = require('../lib/registry');

/**
 * Hours after which a state file counts as stale. An explicit `stale_after_hours` on the
 * registry entry wins; otherwise the cadence text decides. Unknown cadence => null (not
 * assessable), never a guess.
 */
function staleAfterHours(automation) {
  if (Number.isFinite(automation.stale_after_hours)) return automation.stale_after_hours;
  const c = String(automation.cadence || '').toLowerCase();
  if (/hourly/.test(c)) return 2;
  if (/daily/.test(c)) return 26;
  if (/weekly/.test(c)) return 7 * 24 + 2;
  if (/monthly/.test(c)) return 31 * 24 + 2;
  return null;
}

function staleness(automation, state, now = Date.now()) {
  const stamp = state && (state.generated_at || state.written_at);
  const t = Date.parse(stamp);
  if (!Number.isFinite(t)) return { generated_at: null, age_hours: null, stale: null, timestamp_contract: false };
  const ageHours = Number(((now - t) / 3.6e6).toFixed(2));
  const window = staleAfterHours(automation);
  return {
    generated_at: stamp,
    age_hours: ageHours,
    stale: window === null ? null : ageHours > window,
    timestamp_contract: typeof state.generated_at === 'string',
  };
}

function main() {
  const registry = loadRegistry();
  const stateDir = repoPath('12_Brain/state');
  const queueDir = repoPath('12_Brain/queue');
  const states = fs.existsSync(stateDir)
    ? fs.readdirSync(stateDir).filter((f) => f.endsWith('.json'))
    : [];
  const queues = fs.existsSync(queueDir)
    ? fs.readdirSync(queueDir).filter((f) => f.endsWith('.jsonl'))
    : [];

  const last = {};
  for (const f of states) {
    last[f.replace(/\.json$/, '')] = readJson(path.join(stateDir, f));
  }

  const automations = registry.automations.map((a) => {
    const s = last[a.id];
    return {
      id: a.id,
      status: a.status,
      tier: a.tier,
      last: s ? { status: s.status, written_at: s.written_at, counts: s.counts, ...staleness(a, s) } : null,
    };
  });

  console.log(
    JSON.stringify(
      {
        generated_at: nowISO(),
        automations,
        stale: automations.filter((a) => a.last && a.last.stale === true).map((a) => a.id),
        missing_timestamp_contract: automations
          .filter((a) => a.last && !a.last.timestamp_contract).map((a) => a.id),
        gates: registry.gates,
        queue_files: queues,
      },
      null,
      2
    )
  );
}

if (require.main === module) main();

module.exports = { staleAfterHours, staleness };
