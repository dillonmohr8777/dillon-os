#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { repoPath, readJson } = require('../lib/fsutil');
const { loadRegistry } = require('../lib/registry');

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

  console.log(
    JSON.stringify(
      {
        automations: registry.automations.map((a) => ({
          id: a.id,
          status: a.status,
          tier: a.tier,
          last: last[a.id]
            ? { status: last[a.id].status, written_at: last[a.id].written_at, counts: last[a.id].counts }
            : null,
        })),
        gates: registry.gates,
        queue_files: queues,
      },
      null,
      2
    )
  );
}

main();
