#!/usr/bin/env node
'use strict';

const path = require('path');
const { runAeoTrustGate } = require('../lib/aeo-trust');

function argValue(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
}

const siteDir = argValue('--path');
if (!siteDir) {
  console.error('Usage: node _os/automation/bin/aeo-trust-gate.js --path <site-directory> [--profile <profile.json>]');
  process.exit(2);
}

try {
  const result = runAeoTrustGate(path.resolve(siteDir), { profile: argValue('--profile') });
  console.log(JSON.stringify({
    status: result.status,
    critical_failures: result.critical_failures,
    warnings: result.warnings,
    state_file: result.state_file,
    report_file: result.report_file,
  }, null, 2));
  process.exit(result.status === 'fail' ? 1 : 0);
} catch (error) {
  console.error(error.stack || error.message);
  process.exit(2);
}
