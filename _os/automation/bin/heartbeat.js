#!/usr/bin/env node
'use strict';

/**
 * System heartbeat — one command that fails the run when a power is ungoverned.
 *
 *   node _os/automation/bin/heartbeat.js
 *   node _os/automation/bin/heartbeat.js --as-of 2026-08-17 --no-write --json
 *
 * Exit: clean or advisory-only → 0; unresolved critical → 2; crash → 1.
 */

const fs = require('fs');
const path = require('path');
const { repoPath, ensureDir, writeJson } = require('../lib/fsutil');
const {
  STATE_FILE,
  MANIFEST_FILE,
  runHeartbeat,
  collectLiveInput,
  renderManifest,
  exitCodeFor,
} = require('../lib/heartbeat');

function argValue(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
}

function usage() {
  return `Usage: node _os/automation/bin/heartbeat.js [--as-of YYYY-MM-DD] [--definitions <dir-or-toml>] [--input <fixture.json>] [--no-write] [--json]`;
}

function main() {
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(usage());
    return;
  }

  const asOf = argValue('--as-of');
  const definitionsDir = argValue('--definitions');
  const inputPath = argValue('--input');
  const noWrite = process.argv.includes('--no-write');
  const jsonOut = process.argv.includes('--json');

  let input;
  if (inputPath) {
    const file = path.resolve(inputPath);
    if (!fs.existsSync(file)) throw new Error(`Input fixture not found: ${file}`);
    input = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (asOf) input.as_of = asOf;
  } else {
    input = collectLiveInput({ asOf, definitionsDir });
  }

  const result = runHeartbeat(input, { asOf: asOf || input.as_of });

  if (!noWrite) {
    const stateFile = repoPath(STATE_FILE);
    const manifestFile = repoPath(MANIFEST_FILE);
    writeJson(stateFile, result);
    ensureDir(path.dirname(manifestFile));
    fs.writeFileSync(manifestFile, renderManifest(result), 'utf8');
    result.artifacts = { state: STATE_FILE, manifest: MANIFEST_FILE };
  }

  if (jsonOut) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(renderManifest(result).trimEnd());
    console.log(`\nexit ${exitCodeFor(result)}`);
  }
  process.exitCode = exitCodeFor(result);
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
