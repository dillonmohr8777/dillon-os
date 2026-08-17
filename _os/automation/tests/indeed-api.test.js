'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  buildJobSearchQuery,
  normalizeJobSearch,
  resolveAccessToken,
  fetchHiringSignals,
} = require('../lib/indeed-api');
const { buildEnvelope, runIndeedPipeline } = require('../lib/indeed-pipeline');

test('Indeed query validates bounds and escapes user strings', () => {
  const query = buildJobSearchQuery({
    what: 'Marketing "Manager"',
    where: 'Philadelphia, PA',
    radius: 20,
    limit: 10,
  });
  assert.match(query, /Marketing \\"Manager\\"/);
  assert.match(query, /radius: 20/);
  assert.match(query, /limit: 10/);
  assert.throws(() => buildJobSearchQuery({ what: 'SEO', where: 'PA', limit: 500 }), /limit/);
});

test('Indeed official results normalize to stable shared-adapter signals', () => {
  const data = {
    jobSearch: {
      results: [
        { job: { title: 'Marketing Manager', sourceEmployerName: 'Harbor HVAC' } },
      ],
    },
  };
  const search = { what: 'marketing', where: 'Philadelphia, PA' };
  const first = normalizeJobSearch(data, search);
  const second = normalizeJobSearch(data, search);
  assert.equal(first.length, 1);
  assert.equal(first[0].job_id, second[0].job_id);
  assert.equal(first[0].company, 'Harbor HVAC');
  assert.equal(first[0].collection_method, 'indeed-official-job-search-api');
});

test('Indeed client credentials are exchanged without logging or persisting them', async () => {
  let request;
  const fetchFn = async (url, options) => {
    request = { url, options };
    return {
      ok: true,
      status: 200,
      async json() {
        return { access_token: 'ephemeral-token', expires_in: 3600 };
      },
    };
  };
  const token = await resolveAccessToken({
    clientId: 'client-id',
    clientSecret: 'client-secret',
    fetchFn,
  });
  assert.equal(token, 'ephemeral-token');
  assert.match(request.options.body.toString(), /grant_type=client_credentials/);
  assert.match(request.options.headers.Authorization, /^Basic /);
  assert.doesNotMatch(request.options.body.toString(), /client-id|client-secret/);
});

test('Indeed live search uses bearer auth and returns adapter-ready rows', async () => {
  const fetchFn = async (url, options) => {
    assert.match(options.headers.Authorization, /^Bearer /);
    return {
      ok: true,
      status: 200,
      async json() {
        return {
          data: {
            jobSearch: {
              results: [
                { job: { title: 'SEO Director', sourceEmployerName: 'Example Services' } },
              ],
            },
          },
        };
      },
    };
  };
  const signals = await fetchHiringSignals(
    { what: 'marketing', where: 'Philadelphia, PA', radius: 25, limit: 5 },
    { accessToken: 'ephemeral-token', fetchFn }
  );
  assert.equal(signals[0].role, 'SEO Director');
  assert.equal(signals[0].location, 'Philadelphia, PA');
});

test('Indeed envelope preserves the official source and search contract', () => {
  const envelope = buildEnvelope({
    search: { what: 'marketing', where: 'Philadelphia, PA', radius: 25, limit: 5 },
    signals: [{ job_id: 'official-1', company: 'Example Services', role: 'SEO Director' }],
    fetchedAt: '2026-07-31T12:00:00.000Z',
  });
  assert.equal(envelope.adapter, 'indeed');
  assert.equal(envelope.collection_method, 'indeed-official-job-search-api');
  assert.equal(envelope.signals.length, 1);
});

test('Indeed pipeline runs fetch, writes an envelope, and hands off to shared qualification', async () => {
  let qualifiedInput;
  const output = require('../lib/fsutil').repoPath('_os/automation/fixtures/prospects/indeed-pipeline-test.json');
  const result = await runIndeedPipeline({
    search: { what: 'marketing', where: 'Philadelphia, PA', radius: 25, limit: 5 },
    output,
    accessToken: 'ephemeral-token',
    fetchedAt: '2026-07-31T12:00:00.000Z',
    fetchFn: async () => ({
      ok: true,
      status: 200,
      async json() {
        return { data: { jobSearch: { results: [{ job: { title: 'SEO Director', sourceEmployerName: 'Example Services' } }] } } };
      },
    }),
    qualifyFn: async (input) => {
      qualifiedInput = input;
      return { status: 'ok', adapter: 'indeed' };
    },
  });
  assert.equal(result.envelope.signals.length, 1);
  assert.equal(qualifiedInput, output);
  require('node:fs').unlinkSync(output);
});
