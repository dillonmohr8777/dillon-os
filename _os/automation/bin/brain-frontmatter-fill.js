#!/usr/bin/env node
'use strict';

/**
 * Fill the required brain-note frontmatter defined in 12_Brain/09_Ops/Schema.md
 * (note_type, status, created, updated, source_refs, tags) on notes that are
 * missing it. Test-SecondBrain.ps1 errors on every missing property, and a note
 * without frontmatter is invisible to the Obsidian Bases.
 *
 * Existing values are never overwritten — only absent keys are added. The
 * legacy `source:` key is carried over into `source_refs`.
 *
 * Dry-run by default, matching frontmatter-repair.js. Pass --write to apply.
 *   node _os/automation/bin/brain-frontmatter-fill.js [--write] [--root <dir>]
 */

const fs = require('fs');
const path = require('path');
const { repoPath, todayISO } = require('../lib/fsutil');
const { parseFrontmatter, serializeFrontmatter } = require('../lib/frontmatter');
const { writeRunState } = require('../lib/registry');

const REQUIRED = ['note_type', 'status', 'created', 'updated', 'source_refs', 'tags'];

// Folder -> note_type, per Schema.md's vocabulary.
const TYPE_BY_DIR = {
  '01_Captures': 'capture',
  '02_Entities': 'entity',
  '03_Concepts': 'concept',
  '04_Decisions': 'decision',
  '05_Projects': 'project',
  '06_Research': 'research',
  '07_Reviews': 'review',
  '08_Memory': 'memory',
};

// Default status per type, taken from Schema.md's status vocabulary.
// ponytail: captures default to `unprocessed` rather than proving compile state
// per file — upgrade to a reference scan if capture lifecycle ever drives a Base.
const STATUS_BY_TYPE = {
  capture: 'unprocessed',
  entity: 'active',
  concept: 'active',
  decision: 'active',
  project: 'active',
  research: 'draft',
  review: 'active',
  memory: 'active',
};

function walk(dir, out = []) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, out);
    else if (e.name.endsWith('.md')) out.push(full);
  }
  return out;
}

/** Date from a `YYYY-MM-DD ...` filename, else null. */
function dateFromName(file) {
  const m = path.basename(file).match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : null;
}

function main() {
  const write = process.argv.includes('--write');
  const rootArg = process.argv.includes('--root')
    ? process.argv[process.argv.indexOf('--root') + 1]
    : repoPath('12_Brain');

  const today = todayISO();
  const changes = [];

  for (const dir of Object.keys(TYPE_BY_DIR)) {
    const base = path.join(rootArg, dir);
    for (const file of walk(base)) {
      const text = fs.readFileSync(file, 'utf8');
      const parsed = parseFrontmatter(text);
      const data = { ...(parsed.data || {}) };

      const missing = REQUIRED.filter((k) => !(k in data));
      if (!missing.length) continue;

      const type = TYPE_BY_DIR[dir];
      const applied = [];
      for (const key of missing) {
        let value;
        switch (key) {
          case 'note_type': value = type; break;
          case 'status': value = STATUS_BY_TYPE[type]; break;
          case 'created': value = dateFromName(file) || data.updated || today; break;
          case 'updated': value = data.updated || dateFromName(file) || today; break;
          // Carry the legacy `source:` key forward. Never invent a source:
          // an empty list honestly records "no source captured".
          case 'source_refs': value = data.source ? [data.source] : []; break;
          case 'tags': value = [type]; break;
          default: continue;
        }
        data[key] = value;
        applied.push(`${key}=${JSON.stringify(value)}`);
      }
      if (!applied.length) continue;

      changes.push({ file: path.relative(repoPath(), file), applied, dry_run: !write });
      if (write) {
        const body = parsed.hasFence ? parsed.body : text;
        fs.writeFileSync(file, serializeFrontmatter(data, body));
      }
    }
  }

  const result = {
    automation_id: 'brain-frontmatter-fill',
    status: 'ok',
    dry_run: !write,
    counts: { changed: changes.length },
    changes,
  };
  try { writeRunState('brain-frontmatter-fill', result); } catch { /* registry optional */ }
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

main();
