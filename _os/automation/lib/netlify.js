'use strict';

/**
 * Minimal Netlify deploy client for prospect preview sites.
 *
 * Uses the digest deploy flow rather than a zip upload: declare every file with
 * its SHA1, Netlify replies with the subset it does not already hold, and only
 * those get uploaded. Redeploying a batch where one site changed therefore costs
 * one file, not the whole batch.
 *
 * Safety posture, because this is the first thing in the pipeline that can put a
 * page on the public internet:
 *
 *   - Prospect previews are demos, not launches. Every page must already carry
 *     `noindex`; `deploySite` refuses to upload one that does not, rather than
 *     trusting the caller to have remembered.
 *   - The token is read from the environment and never logged, never written to
 *     disk, and never included in a returned object.
 *   - Deploying is not sending. A live preview URL is for Dillon and the team to
 *     review; the human approval gate in Pipeline Spec.md still governs whether
 *     a prospect ever receives it, and `mail_ready` stays `hold` regardless.
 */

const crypto = require('crypto');
const { httpGet } = require('./net');

const API = 'https://api.netlify.com/api/v1';

function token(explicit) {
  const t = explicit || process.env.NETLIFY_AUTH_TOKEN || process.env.NETLIFY_TOKEN || '';
  if (!t) {
    throw new Error(
      'No Netlify token. Set NETLIFY_AUTH_TOKEN (see _os/automation/docs/RADAR-SETUP.md for the DPAPI wrapper).'
    );
  }
  return t;
}

async function api(pathname, { method = 'GET', body = null, tok, contentType = 'application/json', timeoutMs = 60000 } = {}) {
  const res = await httpGet(`${API}${pathname}`, {
    method,
    body,
    timeoutMs,
    maxBytes: 20_000_000,
    headers: { authorization: `Bearer ${tok}`, 'content-type': contentType },
  });
  if (!res.ok) return { ok: false, status: 0, error: res.error };
  let parsed = null;
  try {
    parsed = res.body ? JSON.parse(res.body) : null;
  } catch {
    parsed = null;
  }
  return {
    ok: res.status >= 200 && res.status < 300,
    status: res.status,
    body: parsed,
    // Truncated so a token or a huge HTML error page never lands in a log.
    raw: parsed ? null : String(res.body || '').slice(0, 300),
  };
}

const sha1 = (buf) => crypto.createHash('sha1').update(buf).digest('hex');

/** Find a site by exact name, or create it. */
async function ensureSite(name, opts = {}) {
  const tok = token(opts.token);
  const list = await api(`/sites?per_page=100&filter=all`, { tok });
  if (!list.ok) throw new Error(`listing sites failed: ${list.status} ${list.raw || list.error || ''}`);
  const found = (list.body || []).find((s) => s.name === name);
  if (found) return { id: found.id, name: found.name, url: found.ssl_url || found.url, created: false };

  const made = await api('/sites', { method: 'POST', tok, body: JSON.stringify({ name }) });
  if (!made.ok) throw new Error(`creating site "${name}" failed: ${made.status} ${made.raw || ''}`);
  return { id: made.body.id, name: made.body.name, url: made.body.ssl_url || made.body.url, created: true };
}

/**
 * Deploy a set of in-memory files.
 *
 * @param {string} siteId
 * @param {Map<string,Buffer|string>} files  keys are site-absolute paths, e.g. "/index.html"
 * @param {object} [opts] { token, title, requireNoindex }
 */
async function deployFiles(siteId, files, opts = {}) {
  const tok = token(opts.token);
  const requireNoindex = opts.requireNoindex !== false;

  const buffers = new Map();
  for (const [p, content] of files) {
    const key = p.startsWith('/') ? p : `/${p}`;
    buffers.set(key, Buffer.isBuffer(content) ? content : Buffer.from(String(content), 'utf8'));
  }

  // A prospect demo that is indexable is a mistake that outlives the deploy:
  // it competes with the prospect's own site in search. Refuse rather than warn.
  if (requireNoindex) {
    const indexable = [...buffers.entries()]
      .filter(([p]) => /\.html?$/i.test(p))
      .filter(([, b]) => !/noindex/i.test(b.toString('utf8')))
      .map(([p]) => p);
    if (indexable.length) {
      throw new Error(`refusing to deploy: these pages are missing noindex — ${indexable.join(', ')}`);
    }
  }

  const digests = {};
  for (const [p, b] of buffers) digests[p] = sha1(b);

  const started = await api(`/sites/${siteId}/deploys`, {
    method: 'POST',
    tok,
    body: JSON.stringify({ files: digests, draft: opts.draft !== false, title: opts.title || 'prospect previews' }),
  });
  if (!started.ok) throw new Error(`starting deploy failed: ${started.status} ${started.raw || ''}`);

  const deployId = started.body.id;
  const required = started.body.required || [];
  // Netlify answers with the SHA1s it still needs, so map them back to paths.
  const bySha = new Map();
  for (const [p, s] of Object.entries(digests)) {
    if (!bySha.has(s)) bySha.set(s, p);
  }

  const uploaded = [];
  for (const shaNeeded of required) {
    const p = bySha.get(shaNeeded);
    if (!p) continue;
    const put = await api(`/deploys/${deployId}/files${p}`, {
      method: 'PUT',
      tok,
      body: buffers.get(p),
      contentType: 'application/octet-stream',
      timeoutMs: 120000,
    });
    if (!put.ok) throw new Error(`uploading ${p} failed: ${put.status} ${put.raw || ''}`);
    uploaded.push(p);
  }

  return {
    deployId,
    uploaded: uploaded.length,
    alreadyHeld: buffers.size - uploaded.length,
    total: buffers.size,
    state: started.body.state,
    deployUrl: started.body.deploy_ssl_url || started.body.deploy_url || null,
    siteUrl: started.body.ssl_url || started.body.url || null,
  };
}

/** Poll until the deploy is live or errors out. */
async function waitForDeploy(deployId, opts = {}) {
  const tok = token(opts.token);
  const deadline = Date.now() + (opts.timeoutMs || 180000);
  let last = null;
  while (Date.now() < deadline) {
    const r = await api(`/deploys/${deployId}`, { tok });
    if (!r.ok) return { ok: false, state: 'unknown', error: `${r.status} ${r.raw || ''}` };
    last = r.body;
    if (last.state === 'ready') return { ok: true, state: 'ready', url: last.deploy_ssl_url || last.ssl_url };
    if (last.state === 'error') return { ok: false, state: 'error', error: last.error_message || 'deploy errored' };
    await new Promise((res) => setTimeout(res, 3000));
  }
  return { ok: false, state: last?.state || 'timeout', error: 'timed out waiting for deploy' };
}

module.exports = { ensureSite, deployFiles, waitForDeploy, sha1, api };
