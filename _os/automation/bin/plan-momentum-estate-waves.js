#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { REPO_ROOT, repoPath, writeJson } = require('../lib/fsutil');
const { buildMomentumWavePlan } = require('../lib/momentum-estate-wave-plan');

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

function main() {
  const manifestPath = insideRepo(argValue('--manifest', repoPath('System', 'outcome-graph', 'web-design', 'momentum-238-reconciled-manifest-2026-08-24.json')));
  const outputPath = insideRepo(argValue('--out', repoPath('System', 'outcome-graph', 'web-design', 'momentum-238-wave-plan-2026-08-24.json')));
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8').replace(/^\uFEFF/, ''));
  const result = buildMomentumWavePlan(manifest, {
    waveSize: Number(argValue('--wave-size', '20')),
    maxParallel: Number(argValue('--max-parallel', '3')),
  });
  writeJson(outputPath, result);
  process.stdout.write(JSON.stringify({
    state: result.state,
    output: outputPath,
    counts: result.counts,
    plan_fingerprint_sha256: result.plan_fingerprint_sha256,
  }, null, 2) + '\n');
}

try {
  main();
} catch (error) {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exitCode = 1;
}
