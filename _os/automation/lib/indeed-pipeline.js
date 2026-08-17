'use strict';

const fs = require('node:fs');
const { ensureDir, nowISO } = require('./fsutil');
const { fetchHiringSignals } = require('./indeed-api');

function buildEnvelope({ search, signals, fetchedAt = nowISO() }) {
  return {
    schema_version: 1,
    adapter: 'indeed',
    provider: 'Indeed official Partner GraphQL API',
    collection_method: 'indeed-official-job-search-api',
    endpoint: 'https://apis.indeed.com/graphql',
    fetched_at: fetchedAt,
    search,
    signals,
  };
}

function writeEnvelope(output, envelope) {
  ensureDir(require('node:path').dirname(output));
  fs.writeFileSync(output, `${JSON.stringify(envelope, null, 2)}\n`);
  return output;
}

async function runIndeedPipeline({
  search,
  output,
  fetchFn,
  accessToken,
  clientId,
  clientSecret,
  qualifyFn = async () => null,
  fetchedAt,
} = {}) {
  const signals = await fetchHiringSignals(search, {
    fetchFn,
    accessToken,
    clientId,
    clientSecret,
  });
  const envelope = buildEnvelope({ search, signals, fetchedAt });
  writeEnvelope(output, envelope);
  const qualification = await qualifyFn(output);
  return { envelope, qualification, output };
}

module.exports = { buildEnvelope, writeEnvelope, runIndeedPipeline };
