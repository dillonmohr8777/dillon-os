'use strict';

/**
 * The watchdog's whole value is that its exit code is trustworthy. On
 * 2026-09-22 it was not: 16 consecutive `success` runs on GitHub Actions while
 * it evaluated zero jobs, because `cadenceJobs()` filters on a registry field
 * (`enabled`) and a cadence format ("daily via <driver>.md") that no record on
 * `main` has. See 12_Brain/11_Craft/earned-lessons.md, 2026-09-22.
 *
 * These tests pin the one invariant that would have caught it: a green verdict
 * must be backed by a non-zero count of things actually checked.
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const CLI = path.resolve(__dirname, '../bin/cadence-watchdog.js');
const { run, isDueToday } = require('../bin/cadence-watchdog.js');

function runCli(args = []) {
  try {
    const stdout = execFileSync(process.execPath, [CLI, ...args], { encoding: 'utf8' });
    return { code: 0, stdout };
  } catch (err) {
    return { code: err.status, stdout: err.stdout ?? '' };
  }
}

test('a clean verdict is never reported on an empty evaluation set', () => {
  const r = run();
  if (r.ok) {
    assert.ok(
      r.jobsRegistered > 0,
      'reported clean while matching zero cadence jobs — this is the 2026-09-22 blind-watchdog defect',
    );
    assert.equal(r.blind, false);
  } else {
    // Not ok is always fine here; the point is that ok cannot be vacuous.
    assert.ok(r.blind || r.repoStale || r.problems.length > 0, 'a failure must name its cause');
  }
});

test('the verdict always reports its denominator', () => {
  const r = run();
  assert.equal(typeof r.jobsRegistered, 'number');
  assert.equal(typeof r.jobsDue, 'number');
  assert.ok(r.jobsDue <= r.jobsRegistered, 'cannot have more jobs due than registered');
  assert.equal(r.blind, r.jobsRegistered === 0);
});

test('a blind run exits non-zero and says so in human output', () => {
  const r = run();
  const cli = runCli();
  assert.match(cli.stdout, /^coverage {10}\d+ cadence job\(s\) matched/m, 'coverage line must always print');
  if (r.blind) {
    assert.equal(cli.code, 1, 'a watchdog that checked nothing must not exit 0');
    assert.match(cli.stdout, /BLIND/);
  }
});

test('--json carries the coverage fields a reader needs to audit the verdict', () => {
  const cli = runCli(['--json']);
  const parsed = JSON.parse(cli.stdout);
  for (const key of ['ok', 'blind', 'jobsRegistered', 'jobsDue', 'repoStale']) {
    assert.ok(key in parsed, `--json must expose ${key}`);
  }
});

test('due-today still narrows legitimately, and that is not blindness', () => {
  // Weekends and non-first-of-month days genuinely have nothing due. That must
  // stay clean — only an empty REGISTRY match is the failure.
  assert.equal(isDueToday('daily', new Date('2026-09-19T10:00:00')), false); // Saturday
  assert.equal(isDueToday('daily', new Date('2026-09-22T10:00:00')), true); // Tuesday
  assert.equal(isDueToday('weekly', new Date('2026-09-21T10:00:00')), true); // Monday
  assert.equal(isDueToday('monthly', new Date('2026-09-22T10:00:00')), false);
});
