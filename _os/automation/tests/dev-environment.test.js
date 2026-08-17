'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const { repoPath } = require('../lib/fsutil');
const { insideRepo, readProfile, doctor } = require('../../dev/lib/dev-environment');

test('Dillon dev doctor passes the isolated site-factory profile', () => {
  const profile = readProfile(repoPath('_os/dev/profiles/site-factory-sandbox.json'));
  const result = doctor(profile);
  assert.equal(result.status, 'pass');
  // Compare on a normalized separator: the profile stores a Windows-style path,
  // but path.join in doctor() emits the host separator, so a literal backslash
  // comparison only ever passed on Windows.
  // Normalize both separators rather than just path.sep: the profile stores a
  // Windows-style path and doctor() may pass it through or re-join it, so the
  // comparison must not depend on which host is running the suite.
  assert.equal(
    result.workspace.replace(/\\/g, '/'),
    '_os/automation/fixtures/sites/aeo-healthy'
  );
  assert.equal(result.checks.filter((check) => check.id.startsWith('skill:')).length, 3);
});

test('Dillon dev environment rejects paths outside the repository', () => {
  // Use the host separator. A hardcoded '..\\outside' is real traversal on
  // Windows but just an odd filename on Linux, so the guard went untested there.
  assert.throws(() => insideRepo(path.join('..', 'outside')), /escapes repository/);
  assert.throws(() => insideRepo(path.join('..', '..', 'etc', 'passwd')), /escapes repository/);
  assert.throws(() => insideRepo('/etc/passwd'), /escapes repository/);
  // A path that stays inside is still accepted.
  assert.ok(insideRepo(path.join('sub', 'ok.txt')).endsWith('ok.txt'));
});
