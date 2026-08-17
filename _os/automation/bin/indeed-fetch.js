#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { ensureDir, nowISO, repoPath, slugify } = require('../lib/fsutil');
const { buildJobSearchQuery, fetchHiringSignals } = require('../lib/indeed-api');

function parseArgs(argv) {
  const args = {
    what: null,
    where: null,
    radius: 25,
    limit: 25,
    out: null,
    dryRun: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--what') args.what = argv[++i];
    else if (arg === '--where') args.where = argv[++i];
    else if (arg === '--radius') args.radius = Number(argv[++i]);
    else if (arg === '--limit') args.limit = Number(argv[++i]);
    else if (arg === '--out') args.out = argv[++i];
    else if (arg === '--dry-run') args.dryRun = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return args;
}

function defaultOutput(args) {
  const stamp = nowISO().replace(/[:.]/g, '-');
  const slug = slugify(`${args.what}-${args.where}`) || 'job-search';
  return repoPath('_os', 'automation', 'incoming', 'indeed', `${stamp}-${slug}.json`);
}

function resolveOutput(requested, args) {
  const output = requested
    ? path.resolve(path.isAbsolute(requested) ? requested : repoPath(requested))
    : defaultOutput(args);
  const root = `${path.resolve(repoPath())}${path.sep}`.toLowerCase();
  if (!`${output}${path.sep}`.toLowerCase().startsWith(root)) {
    throw new Error('Output must stay inside the dillon-os repository');
  }
  return output;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const search = {
    what: args.what,
    where: args.where,
    radius: args.radius,
    limit: args.limit,
  };
  const query = buildJobSearchQuery(search);
  const output = resolveOutput(args.out, args);

  if (args.dryRun) {
    console.log(JSON.stringify({
      status: 'dry-run',
      provider: 'Indeed official Partner GraphQL API',
      search,
      output,
      credentials_present: {
        access_token: Boolean(process.env.INDEED_ACCESS_TOKEN),
        client_credentials: Boolean(process.env.INDEED_CLIENT_ID && process.env.INDEED_CLIENT_SECRET),
      },
      query,
    }, null, 2));
    return;
  }

  const signals = await fetchHiringSignals(search);
  const envelope = {
    adapter: 'indeed',
    collection_method: 'indeed-official-job-search-api',
    endpoint: 'https://apis.indeed.com/graphql',
    fetched_at: nowISO(),
    search,
    signals,
  };
  ensureDir(path.dirname(output));
  fs.writeFileSync(output, `${JSON.stringify(envelope, null, 2)}\n`);
  console.log(JSON.stringify({
    status: 'ok',
    signals: signals.length,
    output,
    next_command: `node _os/automation/bin/qualify.js --adapter indeed --from ${path.relative(repoPath(), output)}`,
  }, null, 2));
}

main().catch((error) => {
  console.error(`Indeed fetch failed: ${error.message}`);
  process.exitCode = 1;
});
