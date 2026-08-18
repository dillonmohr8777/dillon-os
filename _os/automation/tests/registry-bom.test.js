'use strict';

/**
 * A UTF-8 BOM in a JSON file that Node reads breaks every automation that loads
 * it. On 2026-08-18 a conflict resolution rewrote
 * 12_Brain/registry/automations.json with PowerShell `Set-Content -Encoding utf8`,
 * which always adds a BOM, and queue-status.js (the build command for every
 * `analyst` routine) began dying with "Unexpected token".
 *
 * Two guards: readJson must tolerate a BOM, and the tracked registry must not
 * carry one.
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { readJson, repoPath } = require('../lib/fsutil');

test('readJson parses a BOM-prefixed file', () => {
  const tmp = path.join(os.tmpdir(), `bom-${process.pid}.json`);
  fs.writeFileSync(tmp, '﻿{"ok":true}', 'utf8');
  try {
    assert.deepEqual(readJson(tmp), { ok: true });
  } finally {
    fs.unlinkSync(tmp);
  }
});

test('readJson still parses a clean file and honours the fallback', () => {
  const tmp = path.join(os.tmpdir(), `clean-${process.pid}.json`);
  fs.writeFileSync(tmp, '{"ok":1}', 'utf8');
  try {
    assert.deepEqual(readJson(tmp), { ok: 1 });
  } finally {
    fs.unlinkSync(tmp);
  }
  assert.equal(readJson(path.join(os.tmpdir(), 'definitely-absent.json'), 'fb'), 'fb');
});

test('the tracked automation registry carries no BOM', () => {
  const raw = fs.readFileSync(repoPath('12_Brain/registry/automations.json'));
  assert.notEqual(raw.slice(0, 3).toString('hex'), 'efbbbf', 'registry must be BOM-free');
});

test('every registry automation still parses and has an id', () => {
  const reg = readJson(repoPath('12_Brain/registry/automations.json'));
  assert.ok(Array.isArray(reg.automations) && reg.automations.length > 0);
  for (const a of reg.automations) assert.ok(a.id, 'automation without an id');
});
