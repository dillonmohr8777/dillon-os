#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { ingestGrokRun } = require('../lib/intelligence');

function argValue(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
}

function main() {
  const input = argValue('--from');
  if (!input) {
    console.error('Usage: node _os/automation/bin/grok-ingest.js --from <grok-run.json> [--force]');
    process.exit(2);
  }
  const file = path.resolve(input);
  if (!fs.existsSync(file)) {
    console.error(`Input does not exist: ${file}`);
    process.exit(2);
  }
  const envelope = JSON.parse(fs.readFileSync(file, 'utf8'));
  const result = ingestGrokRun(envelope, { force: process.argv.includes('--force') });
  console.log(JSON.stringify(result, null, 2));
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
