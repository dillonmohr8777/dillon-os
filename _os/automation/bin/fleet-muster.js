#!/usr/bin/env node
'use strict';

const path = require('node:path');
const { runFleetMuster } = require('../lib/fleet-muster.js');

function parseArgs(argv) {
  const values = {};
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (!['--scenario', '--out', '--allowed-output-root'].includes(argument)) throw new Error(`unknown argument: ${argument}`);
    const value = argv[index + 1];
    if (!value || value.startsWith('--')) throw new Error(`${argument} requires a value`);
    values[argument.slice(2)] = value;
    index += 1;
  }
  if (!values.scenario) throw new Error('--scenario is required');
  if (!values.out) throw new Error('--out is required');
  return values;
}

try {
  const args = parseArgs(process.argv.slice(2));
  const summary = runFleetMuster({
    scenarioPath: path.resolve(args.scenario),
    outDir: path.resolve(args.out),
    allowedOutputRoot: args['allowed-output-root'] ? path.resolve(args['allowed-output-root']) : undefined,
  });
  process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
  process.exitCode = summary.passed ? 0 : 2;
} catch (error) {
  process.stderr.write(`${JSON.stringify({ passed: false, error: error.message }, null, 2)}\n`);
  process.exitCode = 1;
}
