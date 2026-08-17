#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { REPO_ROOT, ensureDir, writeJson } = require('../lib/fsutil');
const { parseCsv, buildDirectMailPlan } = require('../lib/direct-mail');

function arg(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
}

function insideRepo(candidate) {
  const resolved = path.resolve(REPO_ROOT, candidate);
  const relative = path.relative(REPO_ROOT, resolved);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error('Input and output paths must stay inside the Dillon OS repository.');
  }
  return resolved;
}

function main() {
  const sourceArg = arg('--from');
  if (!sourceArg) {
    throw new Error(
      'Usage: node _os/automation/bin/direct-mail-plan.js --from <prospects.csv> [--out <plan.json>] [--unit-cost <amount>]'
    );
  }

  const source = insideRepo(sourceArg);
  if (!fs.existsSync(source)) throw new Error(`Input not found: ${sourceArg}`);

  const rows = parseCsv(fs.readFileSync(source, 'utf8'));
  const plan = buildDirectMailPlan(rows, {
    vendor: arg('--vendor') || 'postgrid',
    unitCost: arg('--unit-cost'),
  });
  plan.source = path.relative(REPO_ROOT, source).replaceAll('\\', '/');
  plan.generated_at = new Date().toISOString();

  const outArg =
    arg('--out') ||
    path.join(path.dirname(path.relative(REPO_ROOT, source)), 'direct-mail-plan.json');
  const out = insideRepo(outArg);
  ensureDir(path.dirname(out));
  writeJson(out, plan);

  process.stdout.write(
    [
      `PostGrid test-mode activation plan: ${plan.test_preview_eligible}/${plan.rows} eligible`,
      `Live send authorized: ${plan.live_send_authorized}`,
      `External action performed: ${plan.external_action_performed}`,
      `Wrote: ${path.relative(REPO_ROOT, out)}`,
    ].join('\n') + '\n'
  );
}

try {
  main();
} catch (error) {
  process.stderr.write(`${error.message || error}\n`);
  process.exitCode = 1;
}
