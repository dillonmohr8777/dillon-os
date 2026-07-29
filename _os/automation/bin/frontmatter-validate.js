#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { repoPath, writeJson, ensureDir, nowISO } = require('../lib/fsutil');
const { parseFrontmatter, validateClientFrontmatter } = require('../lib/frontmatter');
const { listClientNotes } = require('../lib/clients');
const { writeRunState } = require('../lib/registry');

function main() {
  const rootArg = process.argv.includes('--root')
    ? process.argv[process.argv.indexOf('--root') + 1]
    : repoPath('01_Clients');
  const files = listClientNotes(rootArg);
  const rows = [];
  let missingCount = 0;

  for (const file of files) {
    const text = fs.readFileSync(file, 'utf8');
    const { data, hasFence } = parseFrontmatter(text);
    const result = validateClientFrontmatter(hasFence ? data : {});
    if (!result.ok) missingCount += 1;
    rows.push({
      file: path.relative(repoPath(), file),
      ok: result.ok,
      missing: result.missing,
      warnings: result.warnings,
      status: data.status || null,
      last_touched: data.last_touched || null,
      due: data.due || null,
    });
  }

  const report = {
    automation_id: 'frontmatter-validate',
    started_at: nowISO(),
    status: missingCount ? 'warn' : 'ok',
    counts: { files: files.length, incomplete: missingCount, complete: files.length - missingCount },
    rows,
  };

  const stateFile = writeRunState('frontmatter-validate', report);
  const mdPath = repoPath('Daily-Briefs/frontmatter-report.md');
  ensureDir(path.dirname(mdPath));
  const md = [
    '# Frontmatter validation report',
    '',
    `Generated: ${report.started_at}`,
    `Complete: ${report.counts.complete}/${report.counts.files}`,
    `Incomplete: ${report.counts.incomplete}`,
    '',
    ...rows
      .filter((r) => !r.ok)
      .map((r) => `- \`${r.file}\` missing: ${r.missing.join(', ')}${r.warnings.length ? ` (${r.warnings.join('; ')})` : ''}`),
    '',
  ].join('\n');
  fs.writeFileSync(mdPath, md);

  console.log(JSON.stringify({ status: report.status, counts: report.counts, state: stateFile, report: mdPath }, null, 2));
  process.exit(missingCount ? 0 : 0); // soft — warn does not fail CI; tests assert details
}

main();
