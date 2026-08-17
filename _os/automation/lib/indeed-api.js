'use strict';

const crypto = require('crypto');

const GRAPHQL_ENDPOINT = 'https://apis.indeed.com/graphql';
const TOKEN_ENDPOINT = 'https://apis.indeed.com/oauth/v2/tokens';

function boundedInteger(value, fallback, min, max, label) {
  const parsed = value == null ? fallback : Number(value);
  if (!Number.isInteger(parsed) || parsed < min || parsed > max) {
    throw new Error(`${label} must be an integer from ${min} to ${max}`);
  }
  return parsed;
}

function buildJobSearchQuery({ what, where, radius = 25, limit = 25 }) {
  if (!what || !String(what).trim()) throw new Error('what is required');
  if (!where || !String(where).trim()) throw new Error('where is required');
  const safeRadius = boundedInteger(radius, 25, 1, 100, 'radius');
  const safeLimit = boundedInteger(limit, 25, 1, 50, 'limit');
  return `query {
  jobSearch(
    location: {
      radius: ${safeRadius}
      radiusUnit: MILES
      where: ${JSON.stringify(String(where).trim())}
    }
    what: ${JSON.stringify(String(what).trim())}
    limit: ${safeLimit}
  ) {
    results {
      job {
        title
        sourceEmployerName
      }
    }
  }
}`;
}

function stableJobId(job, search) {
  const identity = [
    job.sourceEmployerName || '',
    job.title || '',
    search.where || '',
  ].map((value) => String(value).trim().toLowerCase()).join('\n');
  return `official-${crypto.createHash('sha256').update(identity).digest('hex').slice(0, 24)}`;
}

function normalizeJobSearch(data, search) {
  const results = data && data.jobSearch && Array.isArray(data.jobSearch.results)
    ? data.jobSearch.results
    : [];
  return results
    .map((result) => result && result.job)
    .filter((job) => job && job.title && job.sourceEmployerName)
    .map((job) => ({
      job_id: stableJobId(job, search),
      company: String(job.sourceEmployerName),
      role: String(job.title),
      location: String(search.where),
      market: String(search.where),
      posted_at: null,
      job_url: null,
      collection_method: 'indeed-official-job-search-api',
    }));
}

async function requestJson(url, options, fetchFn = globalThis.fetch) {
  if (typeof fetchFn !== 'function') throw new Error('Node 18 or newer is required for fetch');
  const response = await fetchFn(url, options);
  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new Error(`Indeed request failed with HTTP ${response.status}`);
  }
  if (!response.ok) {
    const code = payload && (payload.error || payload.code);
    throw new Error(`Indeed request failed with HTTP ${response.status}${code ? ` (${code})` : ''}`);
  }
  return payload;
}

async function resolveAccessToken({
  accessToken = process.env.INDEED_ACCESS_TOKEN,
  clientId = process.env.INDEED_CLIENT_ID,
  clientSecret = process.env.INDEED_CLIENT_SECRET,
  fetchFn = globalThis.fetch,
} = {}) {
  if (accessToken) return accessToken;
  if (!clientId || !clientSecret) {
    throw new Error(
      'Indeed partner access is not configured. Set INDEED_ACCESS_TOKEN or both INDEED_CLIENT_ID and INDEED_CLIENT_SECRET in an approved secret store.'
    );
  }
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    scope: 'employer_access',
  });
  const payload = await requestJson(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`, 'utf8').toString('base64')}`,
    },
    body,
  }, fetchFn);
  if (!payload.access_token) throw new Error('Indeed token response did not include an access token');
  return payload.access_token;
}

async function fetchHiringSignals(search, options = {}) {
  const token = await resolveAccessToken(options);
  const query = buildJobSearchQuery(search);
  const payload = await requestJson(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables: {} }),
  }, options.fetchFn);
  if (Array.isArray(payload.errors) && payload.errors.length) {
    const messages = payload.errors
      .map((error) => error && error.message)
      .filter(Boolean)
      .slice(0, 3)
      .join('; ');
    throw new Error(`Indeed GraphQL rejected the search${messages ? `: ${messages}` : ''}`);
  }
  return normalizeJobSearch(payload.data, search);
}

module.exports = {
  GRAPHQL_ENDPOINT,
  TOKEN_ENDPOINT,
  buildJobSearchQuery,
  stableJobId,
  normalizeJobSearch,
  resolveAccessToken,
  fetchHiringSignals,
};
