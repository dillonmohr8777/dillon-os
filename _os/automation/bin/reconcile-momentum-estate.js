#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { REPO_ROOT, repoPath, writeJson } = require('../lib/fsutil');
const { buildMomentumEstate } = require('../lib/momentum-estate-reconciliation');

function argValue(name, fallback = null) {
  const index = process.argv.indexOf(name);
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
}

function insideRepo(candidate) {
  const absolute = path.resolve(candidate);
  const root = path.resolve(REPO_ROOT);
  if (absolute !== root && !absolute.startsWith(root + path.sep)) {
    throw new Error(`Output path escapes the Dillon OS repository: ${candidate}`);
  }
  return absolute;
}

function requiredFile(candidate, label) {
  const absolute = path.resolve(candidate);
  if (!fs.existsSync(absolute)) throw new Error(`${label} does not exist: ${absolute}`);
  return absolute;
}

function main() {
  const current = requiredFile(
    argValue('--current', repoPath('System', 'outcome-graph', 'source-snapshots', 'momentum-current-238-rows-2026-08-24.json')),
    'Current snapshot'
  );
  const aliases = requiredFile(
    argValue('--aliases', repoPath('System', 'outcome-graph', 'web-design', 'momentum-identity-aliases-2026-08-24.json')),
    'Alias decisions'
  );
  const inventoryArg = argValue('--inventory');
  if (!inventoryArg) throw new Error('--inventory is required');
  const inventory = requiredFile(inventoryArg, 'Predecessor inventory');
  const output = insideRepo(
    argValue('--out', repoPath('System', 'outcome-graph', 'web-design', 'momentum-238-reconciled-manifest-2026-08-24.json'))
  );

  const result = buildMomentumEstate({
    currentSnapshotText: fs.readFileSync(current, 'utf8'),
    predecessorCsvText: fs.readFileSync(inventory, 'utf8'),
    aliasDecisionText: fs.readFileSync(aliases, 'utf8'),
  });
  writeJson(output, result);
  process.stdout.write(JSON.stringify({
    state: result.state,
    output,
    counts: result.counts,
    duplicate_businesses: result.duplicate_businesses.map((row) => row.predecessor_slug),
  }, null, 2) + '\n');
}

try {
  main();
} catch (error) {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exitCode = 1;
}
