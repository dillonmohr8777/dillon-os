#!/usr/bin/env node
'use strict';

// Counts the three wiki-lint checks that are arithmetic, so the routine stops
// guessing them.
//
// WHY THIS EXISTS. On 2026-09-16 the nightly wiki-lint pass graded the vault
// "FAILING - Critical INDEX sync issue" on three numbers, and all three were
// wrong when counted: "220+ empty link stubs [[]] in 12_Brain/INDEX.md" (the
// real count in that file is 0, and vault-wide only three tracked files carry
// the pattern - two of which are the hygiene reports quoting it), and "53
// orphan pages not listed in INDEX.md" (47 of the 54 names it listed are
// indexed, 40 of them in the very file the skill names). A grade computed from
// unverified counts is worse than no grade: it costs a run, it cannot be
// diffed against last night, and nobody can act on it.
//
// WHAT THIS PROVES, and only this: empty [[]] stubs, wikilinks that resolve to
// no file, and pages absent from both indexes. Duplicates, contradictions,
// missing sources and expiry are judgment and stay with the model.
//
// Read-only. No dependencies. Writes nothing, takes no external action.
// Usage:  node _os/automation/bin/wiki-lint-check.js [--json]

const fs = require('fs');
const path = require('path');

const VAULT = path.resolve(__dirname, '..', '..', '..');
const SCAN_DIRS = ['12_Brain/02_Entities', '12_Brain/03_Concepts'];
const SCAN_FILES = ['12_Brain/INDEX.md'];
const INDEXES = ['INDEX.md', '12_Brain/INDEX.md'];

// Every .md in the vault, so a wikilink can be resolved by full path or by
// bare note name the way Obsidian resolves it.
function walk(dir, out = []) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    if (e.name === '.git' || e.name === 'node_modules') continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, out);
    else if (e.name.endsWith('.md')) out.push(path.relative(VAULT, full).split(path.sep).join('/'));
  }
  return out;
}

const allNotes = walk(VAULT);
const byPath = new Set(allNotes.map((p) => p.replace(/\.md$/, '')));
const byName = new Set(allNotes.map((p) => path.basename(p, '.md')));

function targetsOf(file) {
  const scanned = [];
  for (const rel of SCAN_FILES) if (rel === file || !file) scanned.push(rel);
  return scanned;
}

const scanned = [];
for (const d of SCAN_DIRS) {
  for (const p of walk(path.join(VAULT, d))) scanned.push(p);
}
for (const f of SCAN_FILES) {
  if (fs.existsSync(path.join(VAULT, f))) scanned.push(f);
}

const emptyStubs = [];
const unresolved = [];

for (const rel of scanned) {
  const text = fs.readFileSync(path.join(VAULT, rel), 'utf8');
  const stubs = (text.match(/\[\[\s*\]\]/g) || []).length;
  if (stubs) emptyStubs.push({ file: rel, count: stubs });

  for (const m of text.matchAll(/\[\[([^\]]+)\]\]/g)) {
    // [[path/or/name|alias]] and [[name#heading]]
    const target = m[1].split('|')[0].split('#')[0].trim();
    if (!target) continue;
    const clean = target.replace(/\.md$/, '');
    if (byPath.has(clean) || byName.has(path.basename(clean))) continue;
    // Not every wikilink points at a note. Bases, canvases, skill folders and
    // relative paths are real targets in Obsidian, so resolve them on disk
    // before calling anything dead.
    const onDisk = [
      path.join(VAULT, target),
      path.join(VAULT, path.dirname(rel), target),
    ];
    if (onDisk.some((p) => fs.existsSync(p))) continue;
    unresolved.push({ file: rel, target });
  }
}

// Orphans: a page under the scanned dirs whose name appears in neither index.
// Substring match on purpose - the indexes link by full path with an alias,
// and a name that appears anywhere in an index is reachable from it.
const indexText = INDEXES.filter((f) => fs.existsSync(path.join(VAULT, f)))
  .map((f) => fs.readFileSync(path.join(VAULT, f), 'utf8'))
  .join('\n');

const orphans = [];
for (const d of SCAN_DIRS) {
  for (const rel of walk(path.join(VAULT, d))) {
    const name = path.basename(rel, '.md');
    if (name === 'README') continue;
    if (!indexText.includes(name)) orphans.push(rel);
  }
}

const result = {
  generated: new Date().toISOString(),
  scanned_files: scanned.length,
  indexes_checked: INDEXES,
  empty_stubs: { total: emptyStubs.reduce((n, e) => n + e.count, 0), files: emptyStubs },
  unresolved_links: { total: unresolved.length, links: unresolved },
  orphans: { total: orphans.length, pages: orphans },
};

if (process.argv.includes('--json')) {
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
} else {
  console.log(`wiki-lint-check - ${scanned.length} files scanned against ${byPath.size} notes`);
  console.log(`empty [[]] stubs:  ${result.empty_stubs.total}`);
  for (const e of emptyStubs) console.log(`  ${e.count}  ${e.file}`);
  console.log(`unresolved links:  ${unresolved.length}`);
  for (const u of unresolved.slice(0, 40)) console.log(`  ${u.file} -> [[${u.target}]]`);
  if (unresolved.length > 40) console.log(`  ... ${unresolved.length - 40} more`);
  console.log(`orphan pages:      ${orphans.length}  (absent from ${INDEXES.join(' and ')})`);
  for (const o of orphans) console.log(`  ${o}`);
}
