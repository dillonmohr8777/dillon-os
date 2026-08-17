#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { ingestReportBatch } = require('../lib/reports');

function argValue(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
}

function main() {
  const input = argValue('--from');
  if (!input) {
    console.error('Usage: node _os/automation/bin/report-ingest.js --from <report-run.json> [--validate-only] [--refresh-notes]');
    process.exit(2);
  }
  const file = path.resolve(input);
  if (!fs.existsSync(file)) {
    console.error(`Input does not exist: ${file}`);
    process.exit(2);
  }
  const envelope = JSON.parse(fs.readFileSync(file, 'utf8'));
  const result = ingestReportBatch(envelope, {
    validateOnly: process.argv.includes('--validate-only'),
    refreshExisting: process.argv.includes('--refresh-notes'),
  });
  console.log(JSON.stringify(result, null, 2));
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
