#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { runXaiResearch, buildRequest } = require('../lib/xai-research');
const { ingestGrokRun } = require('../lib/intelligence');

function argValue(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
}

function usage() {
  return 'Usage: node _os/automation/bin/xai-research.js --profile <profile.json> [--out <envelope.json>] [--ingest] [--dry-run]';
}

async function main() {
  const profileArg = argValue('--profile');
  if (!profileArg) throw new Error(usage());
  const profileFile = path.resolve(profileArg);
  if (!fs.existsSync(profileFile)) throw new Error(`Profile does not exist: ${profileFile}`);
  const profile = JSON.parse(fs.readFileSync(profileFile, 'utf8'));

  if (process.argv.includes('--dry-run')) {
    console.log(JSON.stringify({ status: 'dry-run', request: buildRequest(profile) }, null, 2));
    return;
  }

  const result = await runXaiResearch(profile);
  const outArg = argValue('--out');
  let outputFile = null;
  if (outArg) {
    outputFile = path.resolve(outArg);
    fs.mkdirSync(path.dirname(outputFile), { recursive: true });
    fs.writeFileSync(outputFile, `${JSON.stringify(result.envelope, null, 2)}\n`, 'utf8');
  }

  const ingest = process.argv.includes('--ingest') ? ingestGrokRun(result.envelope) : null;
  console.log(JSON.stringify({
    status: ingest?.status || 'collected',
    response_id: result.extracted.response_id,
    model: result.extracted.model,
    citations: result.extracted.citations.length,
    tool_calls: result.extracted.tool_call_counts,
    usage: result.extracted.usage,
    cost_usd: result.extracted.cost_usd,
    output_file: outputFile,
    ingest,
  }, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
