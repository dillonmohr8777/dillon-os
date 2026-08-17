#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const {
  validateCommunicationEnvelope,
  ingestCommunicationRun,
} = require('../lib/communications');

function argValue(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
}

function main() {
  const input = argValue('--from');
  if (!input) {
    console.error('Usage: node _os/automation/bin/communication-ingest.js --from <communication-run.json> [--validate-only] [--force]');
    process.exit(2);
  }
  const file = path.resolve(input);
  if (!fs.existsSync(file)) {
    console.error(`Input does not exist: ${file}`);
    process.exit(2);
  }
  const envelope = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (process.argv.includes('--validate-only')) {
    const result = validateCommunicationEnvelope(envelope);
    console.log(JSON.stringify(result, null, 2));
    if (!result.ok) process.exit(1);
    return;
  }
  const result = ingestCommunicationRun(envelope, { force: process.argv.includes('--force') });
  console.log(JSON.stringify(result, null, 2));
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
