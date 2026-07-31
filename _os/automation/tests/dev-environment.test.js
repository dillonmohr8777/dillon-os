'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { repoPath } = require('../lib/fsutil');
const { insideRepo, readProfile, doctor } = require('../../dev/lib/dev-environment');

test('Dillon dev doctor passes the isolated site-factory profile', () => {
  const profile = readProfile(repoPath('_os/dev/profiles/site-factory-sandbox.json'));
  const result = doctor(profile);
  assert.equal(result.status, 'pass');
  assert.equal(result.workspace, path.join('_os', 'automation', 'fixtures', 'sites', 'aeo-healthy'));
  assert.equal(result.checks.filter((check) => check.id.startsWith('skill:')).length, 3);
});

test('Dillon dev environment rejects paths outside the repository', () => {
  for (const escape of ['../outside', '..\\outside', '/etc/passwd']) {
    assert.throws(() => insideRepo(escape), /escapes repository/, `should reject ${escape}`);
  }
});
