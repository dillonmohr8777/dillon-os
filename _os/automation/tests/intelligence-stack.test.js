'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const { repoPath } = require('../lib/fsutil');
const { validateGrokEnvelope, normalizeCandidate, extractUrls } = require('../lib/intelligence');
const { validateManifest, hashArtifacts } = require('../lib/evaluator');
const { evaluateCandidate } = require('../lib/mcp-gate');
const { analyzeSite, robotsPolicy } = require('../lib/aeo-trust');
const {
  buildTools,
  buildRequest,
  extractCandidates,
  extractResponse,
  buildEnvelope,
  runXaiResearch,
} = require('../lib/xai-research');

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

test('xAI research request is bounded to X and optional web search', () => {
  const now = new Date('2026-07-30T14:00:00.000Z');
  const profile = {
    model: 'grok-4.5',
    lookback_hours: 24,
    include_web_search: true,
    focus: ['Agent workflows'],
  };
  const tools = buildTools(profile, now);
  assert.deepEqual(tools.map((tool) => tool.type), ['x_search', 'web_search']);
  assert.equal(tools[0].from_date, '2026-07-29T14:00:00.000Z');
  assert.equal(tools[0].to_date, '2026-07-30T14:00:00.000Z');
  const request = buildRequest(profile, now);
  assert.equal(request.model, 'grok-4.5');
  assert.equal(request.max_output_tokens, undefined);
  assert.match(request.input[0].content, /untrusted evidence/);
  assert.match(request.input[0].content, /no more than 12 X searches and 4 web searches/);
});

test('xAI response extraction preserves unique citations and usage', () => {
  const extracted = extractResponse({
    id: 'response-1',
    model: 'grok-4.5',
    citations: ['https://x.com/example/status/1'],
    usage: { total_tokens: 123, cost_in_usd_ticks: 456 },
    output: [
      { type: 'x_search_call' },
      {
        type: 'message',
        content: [{
          type: 'output_text',
          text: 'Finding [[1]](https://x.com/example/status/1)',
          annotations: [{
            type: 'url_citation',
            url: 'https://x.com/example/status/1',
            title: '1',
          }],
        }],
      },
    ],
  });
  assert.equal(extracted.text, 'Finding [[1]](https://x.com/example/status/1)');
  assert.deepEqual(extracted.citations, ['https://x.com/example/status/1']);
  assert.deepEqual(extracted.tool_calls, ['x_search_call']);
  assert.deepEqual(extracted.tool_call_counts, { x_search: 1, web_search: 0 });
  assert.equal(extracted.usage.total_tokens, 123);
  assert.equal(extracted.cost_usd, 0.0000000456);
});

test('xAI candidate extraction is bounded and fails closed', () => {
  const text = `Report
\`\`\`candidates_json
[{"name":"Scoped skill","decision":"sandbox-test","source_urls":["https://example.com"]}]
\`\`\``;
  assert.deepEqual(extractCandidates(text), [{
    name: 'Scoped skill',
    decision: 'sandbox-test',
    source_urls: ['https://example.com'],
  }]);
  assert.deepEqual(extractCandidates('```candidates_json\nnot json\n```'), []);
});

test('xAI research runner produces an ingestible source-linked envelope', async () => {
  const now = new Date('2026-07-30T14:00:00.000Z');
  const fetchImpl = async (_url, options) => {
    assert.match(options.headers.Authorization, /^Bearer /);
    const request = JSON.parse(options.body);
    assert.equal(request.tools[0].type, 'x_search');
    return {
      ok: true,
      json: async () => ({
        id: 'response-2',
        model: 'grok-4.5',
        citations: ['https://x.com/example/status/2'],
        usage: { total_tokens: 200 },
        output: [{
          type: 'message',
          content: [{
            type: 'output_text',
            text: 'Source-linked result.',
            annotations: [],
          }],
        }],
      }),
    };
  };
  const result = await runXaiResearch({
    automation: 'Test X Search',
    run_title: 'Test pulse',
    lookback_hours: 24,
    include_web_search: false,
    focus: ['Test'],
  }, { apiKey: 'test-key-not-real', fetchImpl, now });
  const envelope = buildEnvelope({}, result.extracted, now);
  assert.equal(validateGrokEnvelope(result.envelope).ok, true);
  assert.match(envelope.content, /https:\/\/x\.com\/example\/status\/2/);
  assert.equal(result.envelope.verification_status, 'partial');
});
