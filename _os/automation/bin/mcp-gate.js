#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { writeMcpReview } = require('../lib/mcp-gate');

function argValue(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
}

function main() {
  const input = argValue('--from');
  if (!input) throw new Error('Usage: mcp-gate.js --from <candidate.json> [--inspect] [--config <mcp.json> --server <name>]');
  const file = path.resolve(input);
  if (!fs.existsSync(file)) throw new Error(`Candidate file not found: ${file}`);
  const candidate = JSON.parse(fs.readFileSync(file, 'utf8'));
  const result = writeMcpReview(candidate, {
    inspect: process.argv.includes('--inspect'),
    config: argValue('--config'),
    server: argValue('--server'),
    timeout_ms: Number(argValue('--timeout-ms') || 120000),
  });
  console.log(JSON.stringify(result, null, 2));
  if (!result.evaluation.accepted) process.exitCode = 1;
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
