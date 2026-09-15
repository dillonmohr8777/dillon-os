#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { REPO_ROOT, repoPath } = require('../lib/fsutil');
const { collectMomentumParticleLogoCandidates } = require('../lib/momentum-particle-logo-candidates');

function argValue(name, fallback = null) {
  const index = process.argv.indexOf(name);
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
}

function insideRepo(candidate) {
  const absolute = path.resolve(candidate);
  const root = path.resolve(REPO_ROOT);
  if (absolute !== root && !absolute.startsWith(`${root}${path.sep}`)) {
    throw new Error(`Path escapes the Dillon OS repository: ${candidate}`);
  }
  return absolute;
}

async function main() {
  const manifestPath = insideRepo(argValue('--manifest', repoPath('System', 'outcome-graph', 'web-design', 'momentum-238-reconciled-manifest-2026-08-24.json')));
  const outputPath = insideRepo(argValue('--out', repoPath('System', 'outcome-graph', 'web-design', 'momentum-particle-logo-candidates-2026-08-24', 'candidate-manifest.json')));
  const assetsDir = insideRepo(argValue('--assets', path.join(path.dirname(outputPath), 'assets')));
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8').replace(/^\uFEFF/, ''));
  const logicalAssetPrefix = path.relative(REPO_ROOT, assetsDir).replace(/\\/g, '/');
  const result = await collectMomentumParticleLogoCandidates(manifest, {
    outputPath,
    assetsDir,
    logicalAssetPrefix,
    concurrency: Number(argValue('--concurrency', '3')),
    timeoutMs: Number(argValue('--timeout-ms', '15000')),
  });
  process.stdout.write(`${JSON.stringify({
    state: result.state,
    output: outputPath,
    counts: result.counts,
    authority: result.authority,
  }, null, 2)}\n`);
}

main().catch((error) => {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exitCode = 1;
});
