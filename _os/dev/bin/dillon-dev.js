#!/usr/bin/env node
'use strict';

const path = require('path');
const { readProfile, doctor, verify } = require('../lib/dev-environment');

function argValue(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
}

function usage() {
  return [
    'Dillon development environment prototype',
    '',
    'Usage:',
    '  node _os/dev/bin/dillon-dev.js doctor [--profile <profile.json>]',
    '  node _os/dev/bin/dillon-dev.js verify [--profile <profile.json>]',
    '',
    'The command is local, allowlisted, and fail-closed. It never installs, deploys,',
    'opens a browser, reads secrets, or performs an external write.',
  ].join('\n');
}

function main() {
  const command = process.argv[2] || 'help';
  if (['help', '--help', '-h'].includes(command)) {
    console.log(usage());
    return;
  }
  const profileFile = path.resolve(argValue('--profile') || '_os/dev/profiles/site-factory-sandbox.json');
  const profile = readProfile(profileFile);
  const result = command === 'doctor' ? doctor(profile) : command === 'verify' ? verify(profile) : null;
  if (!result) throw new Error(usage());
  console.log(JSON.stringify(result, null, 2));
  if (result.status !== 'pass') process.exitCode = 1;
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
