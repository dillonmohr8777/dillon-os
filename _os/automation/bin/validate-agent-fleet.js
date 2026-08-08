#!/usr/bin/env node
'use strict';

const { validateFleet } = require('../lib/agent-fleet.js');

const result = validateFleet();
console.log(JSON.stringify({
  schemaVersion: 1,
  passed: result.passed,
  fleetId: result.fleet.fleetId,
  agentCount: result.agents.length,
  pilotAgentIds: result.fleet.managedPilotAgentIds,
  aliasCount: result.aliases.aliases.length,
  failures: result.failures,
}, null, 2));
process.exitCode = result.passed ? 0 : 1;
