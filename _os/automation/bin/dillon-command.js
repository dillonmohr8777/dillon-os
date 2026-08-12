#!/usr/bin/env node
'use strict';

/**
 * Dillon Command Center — one umbrella workflow.
 *
 * Runs parallel Tier-0 lane scouts (deterministic CLI steps), scans vault
 * signals, and writes a single approval board + agent manifest for cloud or
 * Codex commanders to fan out skill-based workers.
 *
 * Usage:
 *   node _os/automation/bin/dillon-command.js
 *   node _os/automation/bin/dillon-command.js --agent-mode
 *   node _os/automation/bin/dillon-command.js --dry-run --lanes comms,clients,command
 */

const { runCommandCenter } = require('../lib/command-center');

runCommandCenter(process.argv.slice(2))
  .then((result) => {
    console.log(JSON.stringify(result, null, 2));
    if (result.cli_results?.some((r) => r.status === 'error')) process.exit(1);
  })
  .catch((err) => {
    console.error(err.message || err);
    process.exit(1);
  });
