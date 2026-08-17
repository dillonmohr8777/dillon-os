#!/usr/bin/env node
'use strict';

const { runDillonCommand } = require('../lib/dillon-command');

async function main() {
  const agentMode = process.argv.includes('--agent-mode');
  const jsonOnly = process.argv.includes('--json');

  const dateArgIdx = process.argv.indexOf('--date');
  const date = dateArgIdx >= 0 ? process.argv[dateArgIdx + 1] : undefined;

  const result = await runDillonCommand({ date, agentMode });

  if (agentMode || jsonOnly) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  console.log(`Dillon Command Center run complete for ${result.date}`);
  console.log(`Run folder: ${result.runDir}`);
  console.log(`Approval board: ${result.boardPath}`);
  console.log(`Counts: ${JSON.stringify(result.counts)}`);
  console.log('');
  console.log('Next: fan out lane agents using agent-manifest.json, or run with --agent-mode for the cloud prompt payload.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
