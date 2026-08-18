'use strict';

/**
 * The connector-health CLI is the only thing standing between "a connector is
 * reachable" and "a routine is allowed to act on ad-platform data". Its whole
 * value is refusing to say yes when it should not, so that is what these test.
 *
 * Contract: it reads a state file an MCP-capable agent wrote. It must never
 * contact a provider, never invent a status, and never call a connector usable
 * unless the agent recorded status=active AND read_verified=true AND the
 * observation is inside the window.
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const CLI = path.resolve(__dirname, '../bin/connector-health.js');
const SRC = fs.readFileSync(CLI, 'utf8');

function run(args = []) {
  try {
    return { code: 0, out: JSON.parse(execFileSync(process.execPath, [CLI, ...args], { encoding: 'utf8' })) };
  } catch (e) {
    // Exit 2 is "blocked", a legitimate outcome that still prints JSON.
    return { code: e.status, out: JSON.parse(e.stdout) };
  }
}

test('never contacts a provider', () => {
  for (const forbidden of ['https://', 'fetch(', 'axios', 'require(\'http', 'require("http']) {
    assert.equal(SRC.includes(forbidden), false, `CLI must not reach the network: found ${forbidden}`);
  }
});

test('reports the recorded state and marks only verified connectors usable', () => {
  const { out } = run(['--window-hours', '48']);
  assert.equal(out.automation_id, 'connector-health');
  for (const c of out.connectors) {
    if (c.usable) {
      assert.equal(c.status, 'active', `${c.toolkit} usable without active status`);
      assert.equal(c.read_verified, true, `${c.toolkit} usable without a verified read`);
      assert.ok(c.age_hours <= 48, `${c.toolkit} usable while stale`);
    }
  }
  assert.equal(out.counts.usable + out.counts.unusable, out.counts.connectors);
});

test('a connector that is active but unread is NOT usable', () => {
  // googleads is active (OAuth fine) but its read failed on a 429 quota error.
  // Active-but-unread must not clear the gate; that is the whole point.
  const { out } = run(['--window-hours', '48']);
  const ads = out.connectors.find((c) => c.toolkit === 'googleads');
  if (ads) {
    assert.equal(ads.status, 'active');
    assert.equal(ads.read_verified, false);
    assert.equal(ads.usable, false, 'active without a verified read must stay unusable');
  }
});

test('a zero-hour window makes everything unusable and exits 2', () => {
  const { code, out } = run(['--window-hours', '0']);
  assert.equal(out.counts.usable, 0, 'nothing can be fresh inside a zero window');
  assert.equal(out.status, 'blocked');
  assert.equal(code, 2, 'no fresh connector must exit 2 (blocked), not 0');
});

test('exit 0 only when at least one connector is usable', () => {
  const { code, out } = run(['--window-hours', '48']);
  assert.equal(code === 0, out.counts.usable > 0);
  assert.equal(out.status, out.counts.usable ? 'ok' : 'blocked');
});
