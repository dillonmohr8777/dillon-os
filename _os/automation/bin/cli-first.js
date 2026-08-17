#!/usr/bin/env node
'use strict';

const {
  audit,
  fetchLiveCatalog,
  formatReport,
  lookup,
  matchLive,
} = require('../lib/cli-first');

function argValue(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
}

async function main() {
  const query = argValue('--query') || process.argv.slice(2).filter((arg) => !arg.startsWith('--')).join(' ');
  const asJson = process.argv.includes('--json');
  const live = process.argv.includes('--live');
  const result = query ? lookup(query) : audit();
  let liveResult = null;
  if (live) {
    const catalog = await fetchLiveCatalog();
    liveResult = {
      url: catalog.url,
      entries: matchLive(query, catalog.entries),
    };
    result.live = liveResult;
  }
  if (asJson) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }
  process.stdout.write(formatReport(result, { live: liveResult }));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
