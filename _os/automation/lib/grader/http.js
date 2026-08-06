'use strict';

/**
 * Polite HTTP for the grader. Read-only GETs of public homepages, identified,
 * rate-limited, and capped. Never POSTs, never authenticates, never follows a
 * link off the target host.
 */

const UA = 'MomentumSiteGrader/1.0 (+https://needmomentum.com; prospect website audit; contact dillon)';
const DEFAULT_TIMEOUT_MS = 15000;
const MAX_BYTES = 3 * 1024 * 1024;
const MAX_REDIRECTS = 6;

function normalizeUrl(raw) {
  if (!raw) return null;
  let s = String(raw).trim();
  if (!s) return null;
  if (!/^https?:\/\//i.test(s)) s = `https://${s.replace(/^\/+/, '')}`;
  try {
    const u = new URL(s);
    if (!/^https?:$/.test(u.protocol)) return null;
    u.hash = '';
    return u.toString();
  } catch {
    return null;
  }
}

async function readCapped(res) {
  const reader = res.body && res.body.getReader ? res.body.getReader() : null;
  if (!reader) return await res.text();
  const chunks = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    chunks.push(value);
    if (total >= MAX_BYTES) {
      try { await reader.cancel(); } catch { /* already closed */ }
      break;
    }
  }
  return Buffer.concat(chunks.map((c) => Buffer.from(c))).toString('utf8');
}

/**
 * GET with manual redirect following so the chain itself becomes evidence.
 * Resolves (never throws) into a uniform shape.
 */
async function get(url, { timeoutMs = DEFAULT_TIMEOUT_MS, method = 'GET', maxRedirects = MAX_REDIRECTS } = {}) {
  const started = Date.now();
  const redirects = [];
  let current = normalizeUrl(url);
  if (!current) return { ok: false, error: 'invalid-url', requestedUrl: url, redirects, fetchMs: 0 };

  for (let hop = 0; hop <= maxRedirects; hop++) {
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), timeoutMs);
    const hopStart = Date.now();
    let res;
    try {
      res = await fetch(current, {
        method,
        redirect: 'manual',
        signal: ac.signal,
        headers: {
          'user-agent': UA,
          accept: 'text/html,application/xhtml+xml',
          'accept-language': 'en-US,en;q=0.9',
        },
      });
    } catch (err) {
      clearTimeout(timer);
      const kind = /abort/i.test(err.name || '') ? 'timeout' : 'network';
      return {
        ok: false,
        error: kind,
        errorDetail: err.message,
        requestedUrl: url,
        finalUrl: current,
        redirects,
        fetchMs: Date.now() - started,
      };
    }
    clearTimeout(timer);
    const ttfbMs = Date.now() - hopStart;

    if (res.status >= 300 && res.status < 400 && res.headers.get('location')) {
      const next = normalizeUrl(new URL(res.headers.get('location'), current).toString());
      redirects.push({ from: current, to: next, status: res.status });
      if (!next) break;
      current = next;
      continue;
    }

    let html = '';
    const ct = res.headers.get('content-type') || '';
    if (method !== 'HEAD' && /text\/html|application\/xhtml|text\/plain|application\/xml|text\/xml/i.test(ct)) {
      try { html = await readCapped(res); } catch { html = ''; }
    } else if (method !== 'HEAD' && !ct) {
      try { html = await readCapped(res); } catch { html = ''; }
    }

    const headers = {};
    res.headers.forEach((v, k) => { headers[k.toLowerCase()] = v; });

    return {
      ok: res.status >= 200 && res.status < 300,
      status: res.status,
      requestedUrl: url,
      finalUrl: current,
      protocol: new URL(current).protocol.replace(':', ''),
      contentType: ct,
      server: res.headers.get('server') || null,
      headers,
      html,
      redirects,
      ttfbMs,
      fetchMs: Date.now() - started,
    };
  }

  return { ok: false, error: 'too-many-redirects', requestedUrl: url, finalUrl: current, redirects, fetchMs: Date.now() - started };
}

/** Cheap existence probe for robots.txt / sitemap.xml. */
async function probe(origin, path, timeoutMs = 8000) {
  const res = await get(`${origin}${path}`, { timeoutMs, maxRedirects: 3 });
  const reachable = Boolean(res.ok && (res.html || '').trim().length > 0);
  return { reachable, status: res.status || null };
}

/** Run tasks with a concurrency cap so a 500-row list stays polite. */
async function pool(items, limit, worker) {
  const results = new Array(items.length);
  let next = 0;
  const runners = Array.from({ length: Math.max(1, Math.min(limit, items.length)) }, async () => {
    for (;;) {
      const i = next++;
      if (i >= items.length) return;
      try {
        results[i] = await worker(items[i], i);
      } catch (err) {
        results[i] = { __error: err.message };
      }
    }
  });
  await Promise.all(runners);
  return results;
}

module.exports = { get, probe, pool, normalizeUrl, UA };
