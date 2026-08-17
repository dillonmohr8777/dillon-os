#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const {
  createRun,
  loadRun,
  recordMaker,
  recordChecker,
  approveRun,
  gateRun,
} = require('../lib/evaluator');

function argValue(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
}

function readJsonArg(flag) {
  const value = argValue(flag);
  if (!value) throw new Error(`${flag} is required`);
  const file = path.resolve(value);
  if (!fs.existsSync(file)) throw new Error(`File not found: ${file}`);
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function main() {
  const command = process.argv[2];
  let result;
  if (command === 'start') {
    result = createRun(readJsonArg('--from'));
  } else if (command === 'maker') {
    result = recordMaker(argValue('--run'), readJsonArg('--evidence'));
  } else if (command === 'check') {
    result = recordChecker(argValue('--run'), readJsonArg('--evidence'));
  } else if (command === 'approve') {
    result = approveRun(argValue('--run'), {
      approver: argValue('--approver'),
      note: argValue('--note'),
    });
  } else if (command === 'status') {
    result = loadRun(argValue('--run'));
  } else if (command === 'gate') {
    result = gateRun(argValue('--run'));
  } else {
    throw new Error('Usage: workflow-gate.js <start|maker|check|approve|status|gate> [options]');
  }
  console.log(JSON.stringify(result, null, 2));
  if (command === 'gate' && !result.passed) process.exitCode = 1;
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
