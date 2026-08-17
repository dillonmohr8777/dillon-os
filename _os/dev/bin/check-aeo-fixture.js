#!/usr/bin/env node
'use strict';

const { repoPath } = require('../../automation/lib/fsutil');
const { analyzeSite } = require('../../automation/lib/aeo-trust');

const result = analyzeSite(repoPath('_os/automation/fixtures/sites/aeo-healthy'));
console.log(JSON.stringify({
  status: result.status,
  critical_failures: result.critical_failures,
  warnings: result.warnings,
}, null, 2));
if (result.status !== 'pass') process.exit(1);
