#!/usr/bin/env node
/**
 * One command for Mac's pipeline.
 *
 *   node _os/outreach-engine/bin/run-engine.js --source jesse-238
 *   node _os/outreach-engine/bin/run-engine.js --source jesse-238 --count 12
 *   node _os/outreach-engine/bin/run-engine.js --source demo --allow-partial --skip-qa
 *
 * Never sends mail. mail_ready stays hold.
 */
'use strict';

const { runEngine } = require('../lib/pipeline');

function parseArgs(argv) {
  const out = { source: 'jesse-238', count: null, batchId: null, allowPartial: false, skipQa: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--source') out.source = argv[++i];
    else if (a === '--count') out.count = Number(argv[++i]);
    else if (a === '--batch') out.batchId = argv[++i];
    else if (a === '--from') out.from = argv[++i];
    else if (a === '--allow-partial') out.allowPartial = true;
    else if (a === '--skip-qa') out.skipQa = true;
    else if (a === '--quiet') out.quiet = true;
  }
  return out;
}

async function main() {
  const opts = parseArgs(process.argv);
  const summary = await runEngine(opts);
  console.log(
    `${summary.batchId}: ${summary.count} prospects · qa_ready ${summary.qaReadyCount} · mail_ready=hold · ${summary.batchDir}`
  );
  process.exitCode = summary.ok ? 0 : 1;
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
