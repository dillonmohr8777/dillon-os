'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const { repoPath } = require('../lib/fsutil');
const { validateGrokEnvelope, normalizeCandidate, extractUrls } = require('../lib/intelligence');
const { validateManifest, hashArtifacts } = require('../lib/evaluator');
const { evaluateCandidate } = require('../lib/mcp-gate');
const { analyzeSite, robotsPolicy } = require('../lib/aeo-trust');

test('Grok envelope validation and candidate normalization are deterministic', () => {
  const fixture = JSON.parse(fs.readFileSync(repoPath('_os/automation/fixtures/grok/daily-x-scout.json'), 'utf8'));
  assert.equal(validateGrokEnvelope(fixture).ok, true);
  assert.equal(normalizeCandidate({ title: 'New tool', decision: 'SANDBOX TEST' }).decision, 'sandbox-test');
  assert.deepEqual(extractUrls('Use https://example.com/a. Then https://example.com/a.'), ['https://example.com/a']);
});

test('maker and checker must be distinct', () => {
  const fixture = JSON.parse(fs.readFileSync(repoPath('_os/automation/fixtures/workflows/sample-workflow.json'), 'utf8'));
  assert.equal(validateManifest(fixture).ok, true);
  const invalid = { ...fixture, checker_id: fixture.maker_id };
  assert.equal(validateManifest(invalid).ok, false);
  assert.ok(validateManifest(invalid).errors.includes('maker_id and checker_id must be different'));
});

test('artifact hashing rejects paths outside the repository', () => {
  assert.throws(() => hashArtifacts(['..\\outside.txt']), /escapes repository/);
});

test('MCP acceptance gate stays sandbox-only while Inspector is pending', () => {
  const candidate = JSON.parse(fs.readFileSync(repoPath('_os/automation/fixtures/mcp/context7-candidate.json'), 'utf8'));
  const result = evaluateCandidate(candidate);
  assert.equal(result.verdict, 'sandbox-only');
  assert.deepEqual(result.pending_tests, ['inspector']);
});

test('MCP acceptance gate rejects critical broad permissions', () => {
  const candidate = JSON.parse(fs.readFileSync(repoPath('_os/automation/fixtures/mcp/context7-candidate.json'), 'utf8'));
  candidate.permissions = ['full access'];
  candidate.tests.inspector.status = 'pass';
  const result = evaluateCandidate(candidate);
  assert.equal(result.verdict, 'reject');
});

test('AEO trust gate passes healthy fixture and blocks broken fixture', () => {
  const healthy = analyzeSite(repoPath('_os/automation/fixtures/sites/aeo-healthy'));
  const broken = analyzeSite(repoPath('_os/automation/fixtures/sites/aeo-broken'));
  assert.equal(healthy.status, 'pass');
  assert.equal(healthy.critical_failures.length, 0);
  assert.equal(broken.status, 'fail');
  assert.ok(broken.critical_failures.includes('robots-ai-access'));
  assert.ok(broken.critical_failures.includes('placeholder-copy'));
});

test('robots parser gives named bot policy priority over wildcard', () => {
  const robots = 'User-agent: *\nDisallow: /\n\nUser-agent: GPTBot\nAllow: /\n';
  assert.equal(robotsPolicy(robots, 'GPTBot').blocked, false);
  assert.equal(robotsPolicy(robots, 'ClaudeBot').blocked, true);
});
