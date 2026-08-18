'use strict';

/**
 * Guards the web escalation ladder's safety properties. The functional rungs are
 * verified by running the CLI; these tests cover the parts that must never
 * regress silently:
 *
 *   1. The forbidden surfaces stay forbidden (port 9222, default profile).
 *   2. Every job's ladder names only engines that exist.
 *   3. Stealth is only claimed on the one Firecrawl schema that has it.
 *   4. Agent-only rungs are declared, not omitted.
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { repoPath, readJson } = require('../lib/fsutil');

const POLICY = readJson(repoPath('System/browser-access.policy.json'));
const CLI = repoPath('_os/automation/bin/browser-access.js');

test('policy forbids port 9222 and the default profile', () => {
  assert.ok(POLICY.forbidden.ports.includes(9222), '9222 must stay forbidden');
  assert.ok(POLICY.forbidden.profiles.includes('default'));
  assert.ok(POLICY.forbidden.chrome_flags.includes('--extension'));
  // The reason must travel with the rule; a bare list invites relaxation.
  assert.match(POLICY.forbidden.why, /logged-in|authenticated/i);
});

test('the CLI refuses a forbidden port instead of fetching it', () => {
  let code = 0;
  let stderr = '';
  try {
    execFileSync(process.execPath, [CLI, 'fetch', 'http://localhost:9222/json/version'],
      { encoding: 'utf8', timeout: 30000, stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (e) {
    code = e.status;
    stderr = (e.stderr || '').toString();
  }
  assert.equal(code, 3, 'a forbidden port must exit 3, not fetch');
  assert.match(stderr, /REFUSED: port 9222/);
});

test('every job ladder references engines that exist', () => {
  for (const [job, ladder] of Object.entries(POLICY.jobs)) {
    assert.ok(Array.isArray(ladder) && ladder.length, `${job} has no ladder`);
    for (const engine of ladder) {
      if (engine === 'history_export') continue; // handled by its own policy block
      assert.ok(POLICY.engines[engine], `job ${job} names unknown engine ${engine}`);
    }
  }
});

test('stealth is claimed only on FIRECRAWL_BATCH_SCRAPE', () => {
  const stealthy = Object.entries(POLICY.engines)
    .filter(([, e]) => e.args && e.args.proxy === 'stealth')
    .map(([name, e]) => ({ name, tool: e.tool }));
  assert.equal(stealthy.length, 1, 'exactly one engine may claim stealth');
  assert.equal(stealthy[0].tool, 'FIRECRAWL_BATCH_SCRAPE');
  // SEARCH and SCRAPE schemas have no proxy field, so they must not claim one.
  for (const key of ['firecrawl_search', 'firecrawl_scrape']) {
    assert.ok(!(POLICY.engines[key].args || {}).proxy, `${key} must not claim a proxy`);
  }
});

test('the cloudflare ladder leads with the stealth-capable engine', () => {
  assert.equal(POLICY.jobs.cloudflare[0], 'firecrawl_batch_stealth');
});

test('agent-only engines are declared so the ladder is not understated', () => {
  const agentOnly = Object.entries(POLICY.engines)
    .filter(([, e]) => e.kind === 'agent_tool').map(([n]) => n);
  assert.ok(agentOnly.length >= 5, 'WebFetch, WebSearch and the Firecrawl trio');
  const out = execFileSync(process.execPath, [CLI, 'probe', '--json'],
    { encoding: 'utf8', timeout: 60000 });
  const rows = JSON.parse(out);
  for (const name of agentOnly) {
    const row = rows.find((r) => r.engine === name);
    assert.ok(row, `probe omitted ${name}`);
    assert.equal(row.live, 'agent-only', `${name} must report agent-only`);
  }
});

test('logged-in work is operator-only and never CLI-drivable', () => {
  assert.equal(POLICY.engines.claude_in_chrome.kind, 'operator_only');
  assert.deepEqual(POLICY.jobs.logged_in, ['claude_in_chrome']);
});

test('the history export destination is declared gitignored', () => {
  const h = POLICY.history_export;
  assert.equal(h.gitignored, true);
  assert.match(h.destination, /^12_Brain\/private\//);
  const ignore = fs.readFileSync(repoPath('.gitignore'), 'utf8');
  assert.match(ignore, /12_Brain\/private/, 'private layer must be gitignored');
});

test('policy path referenced by the CLI matches the real file', () => {
  const src = fs.readFileSync(CLI, 'utf8');
  assert.match(src, /System\/browser-access\.policy\.json/);
  assert.ok(fs.existsSync(path.join(repoPath('System'), 'browser-access.policy.json')));
});
