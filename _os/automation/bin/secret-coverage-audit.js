#!/usr/bin/env node
'use strict';

/**
 * secret-coverage-audit.js — audit what the secret gate cannot see.
 *
 * `_os/public-safety.js` is the estate's secret gate, and CLAUDE.md advertises
 * it as failing the build on any secret-shaped value. It does — inside
 * `12_Brain/`. `listBrainFiles()` walks that one directory and nothing else, so
 * every tracked file under `10_Sessions/`, `01_Clients/`, `02_Campaigns/`,
 * `System/` and the rest is outside the gate entirely.
 *
 * That became load-bearing on 2026-09-24, when PR #418 landed 661 files of
 * recovered Codex session transcripts under `10_Sessions/`. One Align HCM
 * HubSpot token quoted verbatim in a July transcript was caught and redacted by
 * a person reading the diff. The gate never looked.
 *
 * This script does not change the gate. Widening `listBrainFiles()` would fail
 * the build immediately on files already on `main`, which is a decision for
 * Dillon, not for a nightly routine. This reports the gap so it stops being
 * invisible, and it is the check that tells you when closing the gap is safe.
 *
 * It never echoes a matched value. `scanText()` returns rule ids and counts by
 * design; this prints paths and rule ids only.
 *
 *   node _os/automation/bin/secret-coverage-audit.js            human output
 *   node _os/automation/bin/secret-coverage-audit.js --json     machine output
 *   node _os/automation/bin/secret-coverage-audit.js --strict   exit 1 on any
 *                                                               blocking hit
 *
 * Exit 0 by default even when it finds something: this is a report, and a
 * nightly report that breaks the build is a report nobody runs.
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const {
  SAFE_FIXTURE_ALLOWLIST,
  isBlocking,
  listBrainFiles,
  scanText,
} = require('../../public-safety.js');

const VAULT = path.resolve(__dirname, '..', '..', '..');
const TEXT_FILE = /\.(md|base|canvas|mdc|json|csv|txt|ya?ml)$/i;

/** Tracked text files, repo-relative and POSIX-separated. Tracked is the gate's
 *  concern: an untracked scratch file is not what ships. */
function trackedTextFiles(vaultRoot) {
  const out = execFileSync('git', ['-C', vaultRoot, 'ls-files', '-z'], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
  return out.split('\0').filter((f) => f && TEXT_FILE.test(f));
}

/** The set the gate actually scans, as repo-relative POSIX paths. */
function gatedSet(vaultRoot) {
  return new Set(
    listBrainFiles(vaultRoot).map((f) => path.relative(vaultRoot, f).split(path.sep).join('/')),
  );
}

function topRoot(rel) {
  const i = rel.indexOf('/');
  return i < 0 ? '.' : rel.slice(0, i);
}

function run(vaultRoot = VAULT) {
  const gated = gatedSet(vaultRoot);
  const tracked = trackedTextFiles(vaultRoot);
  const ungated = tracked.filter((f) => !gated.has(f) && !SAFE_FIXTURE_ALLOWLIST.has(f));

  const roots = new Map();
  const byRule = new Map();
  const files = [];

  for (const rel of ungated) {
    const root = topRoot(rel);
    const r = roots.get(root) || { root, files: 0, flagged: 0 };
    r.files += 1;
    roots.set(root, r);

    let text;
    try {
      text = fs.readFileSync(path.join(vaultRoot, rel), 'utf8');
    } catch {
      continue; // unreadable or binary-in-disguise; not this script's problem
    }
    const blocking = scanText(text).filter((h) => isBlocking(h.id));
    if (!blocking.length) continue;

    r.flagged += 1;
    files.push({ file: rel, rules: blocking.map((h) => h.id).sort() });
    for (const h of blocking) byRule.set(h.id, (byRule.get(h.id) || 0) + 1);
  }

  files.sort((a, b) => a.file.localeCompare(b.file));
  return {
    checked: new Date().toISOString(),
    gatedFiles: gated.size,
    ungatedFiles: ungated.length,
    flaggedFiles: files.length,
    byRule: Object.fromEntries([...byRule].sort((a, b) => b[1] - a[1])),
    roots: [...roots.values()].sort((a, b) => b.files - a.files),
    files,
  };
}

function report(res) {
  const L = [];
  L.push(`secret-coverage-audit  ${res.checked}`);
  L.push('');
  L.push(`gate scans        ${res.gatedFiles} tracked files (12_Brain only)`);
  L.push(`gate does not see ${res.ungatedFiles} tracked text files`);
  L.push(`blocking-rule hits in that blind spot: ${res.flaggedFiles} files`);
  L.push('');
  L.push('Ungated tracked text files by root:');
  for (const r of res.roots) {
    const flag = r.flagged ? `  ${r.flagged} flagged` : '';
    L.push(`  ${String(r.files).padStart(5)}  ${r.root}${flag}`);
  }
  if (res.flaggedFiles) {
    L.push('');
    L.push('Files hitting a blocking rule (rule ids only, never the value):');
    for (const f of res.files) L.push(`  ${f.rules.join(',')}  ${f.file}`);
    L.push('');
    L.push('A hit is a lead, not proof: `bitwarden_locator` matches the phrase');
    L.push('"vault item" and `credential_shaped` matches the word "password" followed by a colon in');
    L.push('prose. Each needs a human read before anything is rewritten, and');
    L.push('12_Brain/01_Captures is immutable by protocol.');
  } else {
    L.push('');
    L.push('clean — no blocking-rule hits outside the gate');
  }
  return L.join('\n');
}

function main() {
  const res = run();
  if (process.argv.includes('--json')) console.log(JSON.stringify(res, null, 2));
  else console.log(report(res));
  if (process.argv.includes('--strict') && res.flaggedFiles) process.exit(1);
}

if (require.main === module) main();

module.exports = { run, report, trackedTextFiles, gatedSet, topRoot };
