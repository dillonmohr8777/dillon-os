#!/usr/bin/env node
'use strict';

const path = require('path');
const { listStarters, pickStarter, EXAMPLE_BRIEF_PATH } = require('./lib/starters');

const cwd = process.cwd();
const args = process.argv.slice(2);
const json = args.includes('--json');
const query = args.filter((arg) => arg !== '--json').join(' ').trim();

function rel(filePath) {
  return path.relative(cwd, filePath).split(path.sep).join('/');
}

if (!query) {
  const rows = listStarters();
  if (json) {
    console.log(JSON.stringify({ starters: rows, fallback: rel(EXAMPLE_BRIEF_PATH) }, null, 2));
    process.exit(0);
  }
  console.log('Main factory templates:\n');
  for (const row of rows) {
    console.log(`${row.attitude.padEnd(12)} ${row.slug.padEnd(24)} ${row.use}`);
  }
  console.log(`\nFallback schema: ${rel(EXAMPLE_BRIEF_PATH)}`);
  console.log('Pick one: node _templates/site-factory/pick-starter.js "<vertical or attitude>"');
  process.exit(0);
}

const result = pickStarter(query);
if (json) {
  const payload = { ...result, path: result.path ? rel(result.path) : null };
  if (payload.candidates) {
    payload.candidates = payload.candidates.map((entry) => entry.slug);
  }
  console.log(JSON.stringify(payload, null, 2));
  process.exit(result.ok ? 0 : 2);
}

if (result.ambiguous) {
  console.error(`ambiguous query ${JSON.stringify(query)}; candidates: ${result.candidates.map((entry) => entry.slug).join(', ')}`);
  process.exit(2);
}

if (result.fallback) {
  console.error(`no starter matched ${JSON.stringify(query)}; using example-brief.json`);
}
console.log(rel(result.path));
