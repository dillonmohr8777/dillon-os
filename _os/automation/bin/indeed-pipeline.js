#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { repoPath, nowISO, slugify } = require('../lib/fsutil');
const { buildJobSearchQuery } = require('../lib/indeed-api');
const { runIndeedPipeline } = require('../lib/indeed-pipeline');

function parseArgs(argv) {
  const args = { what: null, where: null, radius: 25, limit: 25, out: null, dryRun: false, from: null, noNotes: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--what') args.what = argv[++i];
    else if (arg === '--where') args.where = argv[++i];
    else if (arg === '--radius') args.radius = Number(argv[++i]);
    else if (arg === '--limit') args.limit = Number(argv[++i]);
    else if (arg === '--out') args.out = argv[++i];
    else if (arg === '--from') args.from = argv[++i];
    else if (arg === '--dry-run') args.dryRun = true;
    else if (arg === '--no-notes') args.noNotes = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return args;
}

function insideRepo(requested) {
  const resolved = path.resolve(path.isAbsolute(requested) ? requested : repoPath(requested));
  const root = `${path.resolve(repoPath())}${path.sep}`.toLowerCase();
  if (!`${resolved}${path.sep}`.toLowerCase().startsWith(root)) {
    throw new Error('Input and output must stay inside the dillon-os repository');
  }
  return resolved;
}

function defaultOutput(args) {
  const stamp = nowISO().replace(/[:.]/g, '-');
  const slug = slugify(`${args.what}-${args.where}`) || 'job-search';
  return repoPath('_os', 'automation', 'incoming', 'indeed', `${stamp}-${slug}.json`);
}

function qualifyCommand(input, noNotes) {
  const command = [
    repoPath('_os', 'automation', 'bin', 'qualify.js'),
    '--adapter',
    'indeed',
    '--from',
    path.relative(repoPath(), input),
  ];
  if (noNotes) command.push('--no-notes');
  const result = spawnSync(process.execPath, command, {
    cwd: repoPath(),
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  if (result.status !== 0) {
    throw new Error(`Shared qualification failed: ${(result.stderr || result.stdout || '').trim()}`);
  }
  const stdout = (result.stdout || '').trim();
  return stdout ? JSON.parse(stdout) : null;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.from && (!args.what || !args.where)) {
    throw new Error('Usage: node indeed-pipeline.js --what <role> --where <market> [options]');
  }

  if (args.from) {
    const input = insideRepo(args.from);
    if (!fs.existsSync(input)) throw new Error(`Input not found: ${args.from}`);
    const qualification = qualifyCommand(input, args.noNotes);
    console.log(JSON.stringify({ status: 'ok', mode: 'replay', input, qualification }, null, 2));
    return;
  }

  const search = { what: args.what, where: args.where, radius: args.radius, limit: args.limit };
  const query = buildJobSearchQuery(search);
  const output = insideRepo(args.out || defaultOutput(args));
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
      next: 'Remove --dry-run only after approved Partner API access is configured.',
      query,
    }, null, 2));
    return;
  }

  const result = await runIndeedPipeline({
    search,
    output,
    qualifyFn: (input) => qualifyCommand(input, args.noNotes),
  });
  console.log(JSON.stringify({
    status: 'ok',
    signals: result.envelope.signals.length,
    output,
    qualification: result.qualification,
  }, null, 2));
}

main().catch((error) => {
  console.error(`Indeed pipeline failed: ${error.message}`);
  process.exitCode = 1;
});
