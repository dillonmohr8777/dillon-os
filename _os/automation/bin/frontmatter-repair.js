#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { repoPath, nowISO, todayISO } = require('../lib/fsutil');
const {
  parseFrontmatter,
  serializeFrontmatter,
  validateClientFrontmatter,
  repairDefaults,
} = require('../lib/frontmatter');
const { listClientNotes } = require('../lib/clients');
const { writeRunState } = require('../lib/registry');

function main() {
  const dryRun = process.argv.includes('--dry-run') || !process.argv.includes('--write');
  // Default is dry-run unless --write is explicit
  const rootArg = process.argv.includes('--root')
    ? process.argv[process.argv.indexOf('--root') + 1]
    : repoPath('01_Clients');

  const files = listClientNotes(rootArg);
  const changes = [];
  const today = todayISO();

  for (const file of files) {
    const text = fs.readFileSync(file, 'utf8');
    const parsed = parseFrontmatter(text);
    const data = parsed.hasFence ? { ...parsed.data } : { ...(parsed.data || {}) };
    const before = validateClientFrontmatter(data);
    if (before.ok) continue;
    const { data: next, applied } = repairDefaults(data, { today });
    if (!applied.length) continue;
    changes.push({ file: path.relative(repoPath(), file), applied, dry_run: dryRun });
    if (!dryRun) {
      const body = parsed.hasFence ? parsed.body : text;
      fs.writeFileSync(file, serializeFrontmatter(next, body));
    }
  }

  const report = {
    automation_id: 'frontmatter-repair',
    started_at: nowISO(),
    status: 'dry-run',
    dry_run: dryRun,
    counts: { candidates: changes.length },
    changes,
  };
  report.status = dryRun ? 'dry-run' : 'ok';
  const stateFile = writeRunState('frontmatter-repair', report);
  console.log(JSON.stringify({ status: report.status, dry_run: dryRun, counts: report.counts, state: stateFile }, null, 2));
}

main();
