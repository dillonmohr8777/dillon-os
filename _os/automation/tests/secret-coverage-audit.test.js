'use strict';

/**
 * The audit's whole value is that it reports a gap honestly and never leaks the
 * thing it found. These tests pin both: the partition against the real gate,
 * and the promise that no matched value is ever printed.
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const CLI = path.resolve(__dirname, '../bin/secret-coverage-audit.js');
const VAULT = path.resolve(__dirname, '../../..');
const { run, report, gatedSet, topRoot } = require('../bin/secret-coverage-audit.js');
const { listBrainFiles } = require('../../public-safety.js');

function json(args = []) {
  return JSON.parse(execFileSync(process.execPath, [CLI, '--json', ...args], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  }));
}

test('the gated set is exactly what public-safety.js scans', () => {
  const gated = gatedSet(VAULT);
  assert.equal(gated.size, listBrainFiles(VAULT).length);
  for (const rel of gated) assert.ok(rel.startsWith('12_Brain/'), `${rel} is not under 12_Brain`);
});

test('gated and ungated do not overlap, and the blind spot is real', () => {
  const res = run(VAULT);
  const gated = gatedSet(VAULT);
  for (const f of res.files) assert.ok(!gated.has(f.file), `${f.file} counted as ungated but is gated`);
  // The gap this script exists to measure. If this ever hits zero the gate has
  // been widened and the script's framing needs rewriting, not silencing.
  assert.ok(res.ungatedFiles > 0, 'expected tracked text files outside 12_Brain');
  assert.ok(res.gatedFiles > 0, 'expected the gate to scan something');
});

test('10_Sessions is outside the gate — the case that motivated this', () => {
  const res = run(VAULT);
  const roots = new Map(res.roots.map((r) => [r.root, r.files]));
  assert.ok((roots.get('10_Sessions') || 0) > 0, '10_Sessions must appear in the blind spot');
  assert.equal([...gatedSet(VAULT)].filter((f) => f.startsWith('10_Sessions/')).length, 0);
});

test('output carries rule ids and paths, never a matched value', () => {
  const res = run(VAULT);
  const text = report(res);
  for (const f of res.files) {
    assert.ok(text.includes(f.file));
    for (const id of f.rules) assert.ok(text.includes(id));
    // Nothing from the file body may appear in the report.
    const body = fs.readFileSync(path.join(VAULT, f.file), 'utf8');
    for (const line of body.split('\n')) {
      const t = line.trim();
      if (t.length < 24) continue;
      assert.ok(!text.includes(t), `report echoed source content from ${f.file}`);
    }
  }
});

test('--strict is the only mode that can fail, and plain mode never does', () => {
  const res = json();
  assert.ok(Number.isInteger(res.flaggedFiles));
  if (res.flaggedFiles > 0) {
    assert.throws(() => execFileSync(process.execPath, [CLI, '--strict'], {
      encoding: 'utf8',
      stdio: 'pipe',
      maxBuffer: 64 * 1024 * 1024,
    }));
  }
});

test('topRoot splits on the first segment', () => {
  assert.equal(topRoot('10_Sessions/a/b.md'), '10_Sessions');
  assert.equal(topRoot('README.md'), '.');
});
