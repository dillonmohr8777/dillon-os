'use strict';

/**
 * Job source adapters. Every endpoint here is public and unauthenticated on
 * purpose: the daily run has to work with no secret in the environment, or it
 * cannot run unattended.
 *
 * Each adapter normalizes to one shape so scoring never learns a board's quirks:
 *   { job_id, source, title, company, location, remote, url, posted_at, description, tags }
 */

const crypto = require('node:crypto');

const USER_AGENT = 'dillon-os-job-search/1 (personal job search; contact via github.com/dillonmohr8777)';
const DEFAULT_TIMEOUT_MS = 25000;

function stableId(source, company, title, url) {
  const identity = [source, company, title, url]
    .map((v) => String(v || '').trim().toLowerCase())
    .join('\n');
  return crypto.createHash('sha256').update(identity).digest('hex').slice(0, 20);
}

/** Job descriptions arrive as HTML. Scoring reads plain words, so flatten first. */
function stripHtml(html) {
  return String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#\d+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function getJson(url, { timeoutMs = DEFAULT_TIMEOUT_MS, fetchFn = globalThis.fetch } = {}) {
  if (typeof fetchFn !== 'function') throw new Error('Node 18 or newer is required for fetch');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchFn(url, {
      headers: { Accept: 'application/json', 'User-Agent': USER_AGENT },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

function toISO(value) {
  if (value == null || value === '') return null;
  // Arbeitnow sends unix seconds; the rest send ISO-ish strings.
  const date = typeof value === 'number' ? new Date(value * 1000) : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

async function fetchRemotive(options = {}) {
  const payload = await getJson('https://remotive.com/api/remote-jobs', options);
  const jobs = Array.isArray(payload && payload.jobs) ? payload.jobs : [];
  return jobs.map((job) => ({
    job_id: stableId('remotive', job.company_name, job.title, job.url),
    source: 'remotive',
    title: String(job.title || ''),
    company: String(job.company_name || ''),
    location: String(job.candidate_required_location || 'Remote'),
    remote: true,
    url: String(job.url || ''),
    posted_at: toISO(job.publication_date),
    description: stripHtml(job.description),
    tags: Array.isArray(job.tags) ? job.tags.map(String) : [],
    salary_text: String(job.salary || ''),
  }));
}

async function fetchArbeitnow(options = {}) {
  const payload = await getJson('https://www.arbeitnow.com/api/job-board-api', options);
  const jobs = Array.isArray(payload && payload.data) ? payload.data : [];
  return jobs.map((job) => ({
    job_id: stableId('arbeitnow', job.company_name, job.title, job.url),
    source: 'arbeitnow',
    title: String(job.title || ''),
    company: String(job.company_name || ''),
    location: String(job.location || ''),
    remote: Boolean(job.remote),
    url: String(job.url || ''),
    posted_at: toISO(job.created_at),
    description: stripHtml(job.description),
    tags: Array.isArray(job.tags) ? job.tags.map(String) : [],
    salary_text: '',
  }));
}


/**
 * Himalayas and Jobicy are remote-only boards, which matters now that remote is
 * a hard requirement: every row they return already clears that gate, so they
 * are far denser than a general board where 90% of rows are on-site.
 */
async function fetchHimalayas(options = {}, { pages = 6, pageSize = 20 } = {}) {
  const all = [];
  for (let page = 0; page < pages; page += 1) {
    const url = `https://himalayas.app/jobs/api?limit=${pageSize}&offset=${page * pageSize}`;
    // A later page failing should not discard the pages already collected.
    let payload;
    try {
      payload = await getJson(url, options);
    } catch {
      break;
    }
    const jobs = Array.isArray(payload && payload.jobs) ? payload.jobs : [];
    if (!jobs.length) break;
    all.push(...jobs);
  }
  return all.map((job) => ({
    job_id: stableId('himalayas', job.companyName, job.title, job.applicationLink),
    source: 'himalayas',
    title: String(job.title || ''),
    company: String(job.companyName || ''),
    // locationRestrictions is the authoritative field: [] means genuinely open.
    location: Array.isArray(job.locationRestrictions) && job.locationRestrictions.length
      ? job.locationRestrictions.join(', ')
      : 'Remote - Worldwide',
    remote: true,
    url: String(job.applicationLink || ''),
    posted_at: toISO(job.pubDate),
    description: stripHtml(job.description || job.excerpt),
    tags: Array.isArray(job.categories) ? job.categories.map(String) : [],
    salary_text: job.minSalary && job.maxSalary ? `${job.minSalary}-${job.maxSalary} ${job.currency || ''}`.trim() : '',
  }));
}

async function fetchJobicy(options = {}, { industries = ['marketing', 'business'] } = {}) {
  const all = [];
  for (const industry of ['', ...industries]) {
    const url = `https://jobicy.com/api/v2/remote-jobs?count=50${industry ? `&industry=${encodeURIComponent(industry)}` : ''}`;
    let payload;
    try {
      payload = await getJson(url, options);
    } catch {
      continue;
    }
    const jobs = Array.isArray(payload && payload.jobs) ? payload.jobs : [];
    all.push(...jobs);
  }
  return all.map((job) => ({
    job_id: stableId('jobicy', job.companyName, job.jobTitle, job.url),
    source: 'jobicy',
    title: String(job.jobTitle || ''),
    company: String(job.companyName || ''),
    location: String(job.jobGeo || 'Remote'),
    remote: true,
    url: String(job.url || ''),
    posted_at: toISO(job.pubDate),
    description: stripHtml(job.jobDescription || job.jobExcerpt),
    tags: [...(Array.isArray(job.jobIndustry) ? job.jobIndustry : []), job.jobLevel].filter(Boolean).map(String),
    salary_text: job.salaryMin && job.salaryMax ? `${job.salaryMin}-${job.salaryMax} ${job.salaryCurrency || ''}`.trim() : '',
  }));
}

/**
 * Greenhouse/Lever/Ashby are per-company boards. A slug that has moved or closed
 * returns 404, and that must never fail the sweep — one dead company is not a
 * reason to lose the day's list. Every board adapter resolves to [] on error and
 * records the failure through onError instead of throwing.
 */
async function fetchGreenhouseBoard(slug, options = {}) {
  const url = `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(slug)}/jobs?content=true`;
  const payload = await getJson(url, options);
  const jobs = Array.isArray(payload && payload.jobs) ? payload.jobs : [];
  return jobs.map((job) => ({
    job_id: stableId('greenhouse', slug, job.title, job.absolute_url),
    source: `greenhouse:${slug}`,
    title: String(job.title || ''),
    company: String((job.company_name || slug) || ''),
    location: String((job.location && job.location.name) || ''),
    remote: /remote|anywhere/i.test((job.location && job.location.name) || ''),
    url: String(job.absolute_url || ''),
    posted_at: toISO(job.first_published || job.updated_at),
    description: stripHtml(job.content),
    tags: [],
    salary_text: '',
  }));
}

async function fetchLeverBoard(slug, options = {}) {
  const url = `https://api.lever.co/v0/postings/${encodeURIComponent(slug)}?mode=json`;
  const payload = await getJson(url, options);
  const jobs = Array.isArray(payload) ? payload : [];
  return jobs.map((job) => ({
    job_id: stableId('lever', slug, job.text, job.hostedUrl),
    source: `lever:${slug}`,
    title: String(job.text || ''),
    company: slug,
    location: String((job.categories && job.categories.location) || ''),
    remote: /remote|anywhere/i.test(
      `${(job.categories && job.categories.location) || ''} ${(job.workplaceType || '')}`,
    ),
    url: String(job.hostedUrl || ''),
    posted_at: toISO(job.createdAt),
    description: stripHtml(job.descriptionPlain || job.description),
    tags: [(job.categories && job.categories.team) || ''].filter(Boolean).map(String),
    salary_text: '',
  }));
}

async function fetchAshbyBoard(slug, options = {}) {
  const url = `https://api.ashbyhq.com/posting-api/job-board/${encodeURIComponent(slug)}?includeCompensation=true`;
  const payload = await getJson(url, options);
  const jobs = Array.isArray(payload && payload.jobs) ? payload.jobs : [];
  return jobs.map((job) => ({
    job_id: stableId('ashby', slug, job.title, job.jobUrl),
    source: `ashby:${slug}`,
    title: String(job.title || ''),
    company: String(job.companyName || slug),
    location: String(job.location || ''),
    remote: Boolean(job.isRemote) || /remote|anywhere/i.test(job.location || ''),
    url: String(job.jobUrl || job.applyUrl || ''),
    posted_at: toISO(job.publishedAt),
    description: stripHtml(job.descriptionPlain || job.descriptionHtml),
    tags: [job.department, job.team].filter(Boolean).map(String),
    salary_text: String((job.compensation && job.compensation.summary) || ''),
  }));
}

/**
 * Runs every configured source. Board failures are collected, not thrown:
 * a partial list this morning beats no list at all.
 */
async function collectAll(sources, { onError = () => {}, options = {} } = {}) {
  const tasks = [];

  for (const agg of sources.aggregators || []) {
    if (!agg.enabled) continue;
    if (agg.id === 'remotive') tasks.push(['remotive', () => fetchRemotive(options)]);
    if (agg.id === 'arbeitnow') tasks.push(['arbeitnow', () => fetchArbeitnow(options)]);
    if (agg.id === 'himalayas') tasks.push(['himalayas', () => fetchHimalayas(options)]);
    if (agg.id === 'jobicy') tasks.push(['jobicy', () => fetchJobicy(options)]);
  }
  for (const slug of sources.greenhouse_boards || []) {
    tasks.push([`greenhouse:${slug}`, () => fetchGreenhouseBoard(slug, options)]);
  }
  for (const slug of sources.lever_boards || []) {
    tasks.push([`lever:${slug}`, () => fetchLeverBoard(slug, options)]);
  }
  for (const slug of sources.ashby_boards || []) {
    tasks.push([`ashby:${slug}`, () => fetchAshbyBoard(slug, options)]);
  }

  const settled = await Promise.allSettled(tasks.map(([, run]) => run()));
  const jobs = [];
  const sourceStats = [];
  settled.forEach((result, index) => {
    const label = tasks[index][0];
    if (result.status === 'fulfilled') {
      jobs.push(...result.value);
      sourceStats.push({ source: label, ok: true, count: result.value.length });
    } else {
      const message = (result.reason && result.reason.message) || String(result.reason);
      onError(label, message);
      sourceStats.push({ source: label, ok: false, error: message });
    }
  });

  // The same role can appear on an aggregator and the company's own board.
  // Company boards are the better row (canonical apply URL), so they win ties.
  const seen = new Map();
  for (const job of jobs) {
    const key = `${job.company.trim().toLowerCase()}::${job.title.trim().toLowerCase()}`;
    const existing = seen.get(key);
    if (!existing) { seen.set(key, job); continue; }
    const incomingIsBoard = !/^(remotive|arbeitnow|himalayas|jobicy)$/.test(job.source);
    const existingIsBoard = !/^(remotive|arbeitnow|himalayas|jobicy)$/.test(existing.source);
    if (incomingIsBoard && !existingIsBoard) seen.set(key, job);
  }

  return { jobs: [...seen.values()], raw_count: jobs.length, sources: sourceStats };
}

module.exports = {
  stableId,
  stripHtml,
  toISO,
  getJson,
  fetchRemotive,
  fetchArbeitnow,
  fetchHimalayas,
  fetchJobicy,
  fetchGreenhouseBoard,
  fetchLeverBoard,
  fetchAshbyBoard,
  collectAll,
};
