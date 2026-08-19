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
const zlib = require('zlib');
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
const sha256 = (buf) => crypto.createHash('sha256').update(buf).digest('hex');

function dosDateTime(date = new Date()) {
  const t =
    ((date.getHours() & 0x1f) << 11) |
    ((date.getMinutes() & 0x3f) << 5) |
    (Math.floor(date.getSeconds() / 2) & 0x1f);
  const d =
    (((date.getFullYear() - 1980) & 0x7f) << 9) |
    (((date.getMonth() + 1) & 0x0f) << 5) |
    (date.getDate() & 0x1f);
  return { time: t, date: d };
}

/**
 * Store-method ZIP with one file. Used to upload a Netlify function without
 * depending on a zip CLI. Does not log file contents.
 */
function zipStoreSingleFile(filename, content) {
  const data = Buffer.isBuffer(content) ? content : Buffer.from(String(content), 'utf8');
  const name = Buffer.from(String(filename), 'utf8');
  const crc = zlib.crc32(data) >>> 0;
  const { time, date } = dosDateTime();

  const local = Buffer.alloc(30);
  local.writeUInt32LE(0x04034b50, 0);
  local.writeUInt16LE(20, 4);
  local.writeUInt16LE(0, 6);
  local.writeUInt16LE(0, 8);
  local.writeUInt16LE(time, 10);
  local.writeUInt16LE(date, 12);
  local.writeUInt32LE(crc, 14);
  local.writeUInt32LE(data.length, 18);
  local.writeUInt32LE(data.length, 22);
  local.writeUInt16LE(name.length, 26);
  local.writeUInt16LE(0, 28);

  const central = Buffer.alloc(46);
  central.writeUInt32LE(0x02014b50, 0);
  central.writeUInt16LE(20, 4);
  central.writeUInt16LE(20, 6);
  central.writeUInt16LE(0, 8);
  central.writeUInt16LE(0, 10);
  central.writeUInt16LE(time, 12);
  central.writeUInt16LE(date, 14);
  central.writeUInt32LE(crc, 18);
  central.writeUInt32LE(data.length, 22);
  central.writeUInt32LE(data.length, 26);
  central.writeUInt16LE(name.length, 30);
  central.writeUInt16LE(0, 32);
  central.writeUInt16LE(0, 34);
  central.writeUInt16LE(0, 36);
  central.writeUInt16LE(0, 38);
  central.writeUInt32LE(0, 40);
  central.writeUInt32LE(0, 42);

  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(1, 8);
  eocd.writeUInt16LE(1, 10);
  eocd.writeUInt32LE(46 + name.length, 12);
  eocd.writeUInt32LE(30 + name.length + data.length, 16);
  eocd.writeUInt16LE(0, 20);

  return Buffer.concat([local, name, data, central, name, eocd]);
}

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

/** Find a site by exact name. Throws if missing. Never creates. */
async function findSite(name, opts = {}) {
  const tok = token(opts.token);
  const list = await api(`/sites?per_page=100&filter=all&name=${encodeURIComponent(name)}`, { tok });
  if (!list.ok) throw new Error(`listing sites failed: ${list.status} ${list.raw || list.error || ''}`);
  const found = (list.body || []).find((s) => s.name === name);
  if (!found) {
    throw new Error(`No existing Netlify site named "${name}". Refusing to create one.`);
  }
  return { id: found.id, name: found.name, url: found.ssl_url || found.url };
}

/**
 * Deploy a set of in-memory files.
 *
 * @param {string} siteId
 * @param {Map<string,Buffer|string>} files  keys are site-absolute paths, e.g. "/index.html"
 * @param {object} [opts] { token, title, requireNoindex, functions }
 *   functions: Map|object of functionName -> zip Buffer
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

  const functionZips = opts.functions
    ? opts.functions instanceof Map
      ? opts.functions
      : new Map(Object.entries(opts.functions))
    : new Map();
  const functionDigests = {};
  const zipByName = new Map();
  const zipBySha = new Map();
  for (const [name, zip] of functionZips) {
    const buf = Buffer.isBuffer(zip) ? zip : Buffer.from(zip);
    // Netlify hashes site files with SHA1 and function zips with SHA256.
    const digest = sha256(buf);
    functionDigests[name] = digest;
    zipByName.set(name, buf);
    zipBySha.set(digest, name);
    zipBySha.set(sha1(buf), name);
  }

  const startedBody = {
    files: digests,
    draft: opts.draft !== false,
    title: opts.title || 'prospect previews',
  };
  if (Object.keys(functionDigests).length) startedBody.functions = functionDigests;

  const started = await api(`/sites/${siteId}/deploys`, {
    method: 'POST',
    tok,
    body: JSON.stringify(startedBody),
  });
  if (!started.ok) throw new Error(`starting deploy failed: ${started.status} ${started.raw || ''}`);

  const deployId = started.body.id;
  const required = started.body.required || [];
  // Netlify answers with the SHA1s it still needs, so map them back to paths.
  const bySha = new Map();
  for (const [p, s] of Object.entries(digests)) {
    if (!bySha.has(s)) bySha.set(s, p);
  }

  // Upload functions before files. File PUTs can finalize the deploy; a later
  // function PUT then 400s with "Deploy has already been finalized."
  const requiredFns = started.body.required_functions || [];
  const namesToUpload = new Set();
  for (const item of requiredFns) {
    if (zipByName.has(item)) namesToUpload.add(item);
    else if (zipBySha.has(item)) namesToUpload.add(zipBySha.get(item));
  }
  if (!requiredFns.length) {
    for (const name of zipByName.keys()) namesToUpload.add(name);
  }

  const uploadedFunctions = [];
  for (const name of namesToUpload) {
    const zip = zipByName.get(name);
    if (!zip) continue;
    const put = await api(
      `/deploys/${deployId}/functions/${encodeURIComponent(name)}?runtime=js&size=${zip.length}`,
      {
        method: 'PUT',
        tok,
        body: zip,
        contentType: 'application/zip',
        timeoutMs: 120000,
      },
    );
    if (!put.ok) {
      const detail =
        (put.body && (put.body.message || put.body.error || put.body.errors || put.body.code)) ||
        put.raw ||
        '';
      throw new Error(`uploading function ${name} failed: ${put.status} ${String(detail).slice(0, 180)}`);
    }
    uploadedFunctions.push(name);
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
    functionsUploaded: uploadedFunctions.length,
    functionsTotal: zipByName.size,
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

async function deployZipArchive(siteId, zipBuffer, opts = {}) {
  const tok = token(opts.token);
  const zip = Buffer.isBuffer(zipBuffer) ? zipBuffer : Buffer.from(zipBuffer);
  const title = encodeURIComponent(opts.title || 'Connected Industry Prototype Suite');
  const started = await api(`/sites/${siteId}/deploys?title=${title}`, {
    method: 'POST',
    tok,
    body: zip,
    contentType: 'application/zip',
    timeoutMs: 180000,
  });
  if (!started.ok) {
    const detail =
      (started.body && (started.body.message || started.body.error || started.body.code)) ||
      started.raw ||
      '';
    throw new Error(`zip deploy failed: ${started.status} ${String(detail).slice(0, 180)}`);
  }
  return {
    deployId: started.body.id,
    uploaded: zip.length,
    alreadyHeld: 0,
    total: zip.length,
    functionsUploaded: 1,
    functionsTotal: 1,
    state: started.body.state,
    deployUrl: started.body.deploy_ssl_url || started.body.deploy_url || null,
    siteUrl: started.body.ssl_url || started.body.url || null,
  };
}

module.exports = {
  ensureSite,
  findSite,
  deployFiles,
  waitForDeploy,
  sha1,
  sha256,
  api,
  zipStoreSingleFile,
  deployZipArchive,
};
