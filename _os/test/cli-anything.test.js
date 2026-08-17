/**
 * Deterministic tests for the CLI-Anything / CLI-first fallback.
 * Run: node --test _os/test/cli-anything.test.js
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { getSkills } = require('../vault-state');
const {
  VERDICTS,
  audit,
  loadSnapshot,
  lookup,
  parseCatalogMarkdown,
} = require('../automation/lib/cli-first');

const VAULT = path.resolve(__dirname, '..', '..');

function read(rel) {
  return fs.readFileSync(path.join(VAULT, rel), 'utf8');
}

describe('cli-anything skill', () => {
  it('is registered on the Command Deck with a fallback description', () => {
    const skill = getSkills(VAULT).find((item) => item.name === 'cli-anything');
    assert.ok(skill, 'missing .claude/skills/cli-anything/SKILL.md');
    assert.match(skill.description, /MCP/i);
    assert.match(skill.description, /CLI/i);
  });

  it('refuses to auto-install or skip the MCP gate', () => {
    const skill = read('.claude/skills/cli-anything/SKILL.md');
    assert.match(skill, /mcp-gate\.js/);
    assert.match(skill, /Install nothing/);
    assert.match(skill, /Tier 2/);
    assert.match(skill, /does \*\*not\*\*.*skip the MCP gate/s);
    assert.match(skill, /Do not open a new MCP/);
  });

  it('keeps the honest blocker table', () => {
    const skill = read('.claude/skills/cli-anything/SKILL.md');
    assert.match(skill, /GitHub MCP/);
    assert.match(skill, /\*\*Fixed\*\* by `gh`/);
    assert.match(skill, /LandingFolio/);
    assert.match(skill, /\*\*Not fixed\*\*/);
    assert.match(skill, /VE Twini/);
  });
});

describe('cli-first snapshot and lookup', () => {
  it('loads a dated snapshot with only known verdicts', () => {
    const snapshot = loadSnapshot();
    assert.equal(snapshot.updated, '2026-08-17');
    assert.ok(snapshot.blockers.length >= 8);
    for (const blocker of snapshot.blockers) {
      assert.ok(VERDICTS.has(blocker.verdict), blocker.id);
    }
  });

  it('maps GitHub MCP failure to the official gh CLI', () => {
    const result = lookup('GitHub MCP authentication failed');
    assert.equal(result.blockers[0].id, 'github-mcp-auth');
    assert.equal(result.blockers[0].verdict, 'fixed');
    assert.ok(result.entries.some((entry) => entry.id === 'gh' && entry.already_on_path));
  });

  it('does not claim LandingFolio or Slack OAuth are fixed', () => {
    const landing = lookup('LandingFolio Inspector pending');
    assert.equal(landing.blockers[0].id, 'landingfolio-inspector');
    assert.equal(landing.blockers[0].verdict, 'not-fixed');
    const slack = lookup('Slack oauth_refresh_token_rejected');
    assert.equal(slack.blockers[0].id, 'slack-oauth');
    assert.equal(slack.blockers[0].verdict, 'not-fixed');
  });

  it('treats Exa rate limits as partial and VE Twini as not-fixed', () => {
    const exa = lookup('Exa MCP free-tier rate limit');
    assert.equal(exa.blockers[0].id, 'exa-mcp-rate-limit');
    assert.equal(exa.blockers[0].verdict, 'partial');
    assert.ok(exa.entries.some((entry) => entry.id === 'exa' && (entry.needs || []).includes('EXA_API_KEY')));
    const x = lookup('X MCP failed live tool discovery');
    assert.equal(x.blockers[0].id, 'x-mcp-discovery');
    assert.equal(x.blockers[0].verdict, 'not-fixed');
    assert.equal(x.entries.some((entry) => entry.id === 've-twini'), false);
  });

  it('ranks short X queries as not-fixed and hides VE Twini unless named', () => {
    for (const query of ['X', 'X MCP', 'X MCP discovery fail', 'x-mcp-discovery', 'twitter']) {
      const result = lookup(query);
      assert.equal(result.blockers[0].id, 'x-mcp-discovery', query);
      assert.equal(result.blockers[0].verdict, 'not-fixed', query);
      assert.equal(result.entries.some((entry) => entry.id === 've-twini'), false, query);
    }
    const named = lookup('ve-twini');
    assert.ok(named.entries.some((entry) => entry.id === 've-twini' && entry.recommend === false));
    const lone = lookup('X');
    assert.deepEqual(lone.blockers.map((item) => item.id), ['x-mcp-discovery']);
  });

  it('does not let n8n win Slack or Ads lookups', () => {
    const slack = lookup('Slack oauth');
    assert.equal(slack.blockers[0].id, 'slack-oauth');
    assert.equal(slack.entries.some((entry) => entry.id === 'n8n'), false);
    const ads = lookup('Google Ads MCP not connected');
    assert.equal(ads.blockers[0].id, 'ads-platform-mcps');
    assert.equal(ads.blockers[0].verdict, 'not-fixed');
  });

  it('audit counts every historical blocker', () => {
    const report = audit();
    assert.equal(report.counts.fixed, 1);
    assert.equal(report.counts['not-fixed'], 5);
    assert.ok(report.counts.partial >= 1);
    assert.ok(report.counts['already-unblocked'] >= 1);
  });

  it('parses live-catalog markdown rows without executing installs', () => {
    const rows = parseCatalogMarkdown([
      '| Name | Description | Install |',
      '|------|-------------|---------|',
      '| **Exa** | AI-powered web search | `cli-hub install exa` |',
      '| **GIMP** | Raster image processing | `cli-hub install gimp` |',
    ].join('\n'));
    assert.deepEqual(rows.map((row) => row.id), ['exa', 'gimp']);
    assert.equal(rows[0].install, 'cli-hub install exa');
  });
});

describe('cli-first CLI', () => {
  it('prints the GitHub fix without installing anything', () => {
    const result = spawnSync(
      process.execPath,
      [path.join(VAULT, '_os/automation/bin/cli-first.js'), '--query', 'github mcp', '--json'],
      { encoding: 'utf8' },
    );
    assert.equal(result.status, 0, result.stderr);
    const payload = JSON.parse(result.stdout);
    assert.equal(payload.blockers[0].id, 'github-mcp-auth');
    assert.doesNotMatch(result.stdout, /pip install/i);
  });
});
