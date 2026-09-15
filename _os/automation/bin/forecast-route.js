#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const {
  routeForecastRequest,
  validateForecastRequest,
  validateForecastRun,
} = require('../lib/forecast-router');

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
  if (command === 'route') {
    result = routeForecastRequest(readJsonArg('--from'));
  } else if (command === 'validate-request') {
    result = validateForecastRequest(readJsonArg('--from'));
  } else if (command === 'validate-run') {
    result = validateForecastRun(readJsonArg('--from'));
  } else {
    throw new Error(
      'Usage: forecast-route.js <route|validate-request|validate-run> --from <json>',
    );
  }

  console.log(JSON.stringify(result, null, 2));
  if (result.ok === false || result.status === 'blocked') process.exitCode = 1;
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
