'use strict';

/**
 * OpenRouter video generation client.
 *
 * Video is asynchronous, unlike chat completions:
 *
 *   POST /api/v1/videos          -> 202 { id, polling_url, status: 'pending' }
 *   GET  /api/v1/videos/{id}     -> { status, unsigned_urls[], usage: { cost } }
 *   GET  /api/v1/videos/{id}/content?index=0  -> the file
 *
 * Two details matter for cost control:
 *
 * - `usage.cost` on the completed job is the ONLY authoritative price. Everything
 *   in pricing.js is a pre-flight estimate. Callers are expected to hand the
 *   returned cost to ledger.js so estimates get corrected by observation.
 * - A submitted job bills even if this process dies before polling finishes.
 *   `submit()` therefore returns the job id immediately and `waitFor()` is
 *   separate, so a crashed render can be resumed against the same job instead of
 *   paying twice for the same shot.
 */

const { requestJson, downloadToFile } = require('./http');

const API_BASE = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
const TERMINAL = new Set(['completed', 'failed', 'cancelled', 'canceled', 'error']);

function apiKey() {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key || !String(key).trim()) {
    throw new Error('OPENROUTER_API_KEY is not set. Export it before rendering; never commit it.');
  }
  return String(key).trim();
}

function authHeaders() {
  return {
    authorization: `Bearer ${apiKey()}`,
    // OpenRouter attributes usage to these; they are public identifiers, not secrets.
    'http-referer': process.env.OPENROUTER_SITE_URL || 'https://momentum-digital.local/dillon-os',
    'x-title': process.env.OPENROUTER_SITE_NAME || 'Dillon OS Video Stack',
  };
}

/**
 * Redact anything key-shaped before it reaches a log or a Telegram message.
 * The gateway echoes API errors to chat, and OpenRouter error bodies sometimes
 * quote the offending Authorization header back.
 */
function redact(text) {
  return String(text == null ? '' : text)
    .replace(/sk-or-[A-Za-z0-9._-]+/g, 'sk-or-***')
    .replace(/(Bearer\s+)[A-Za-z0-9._-]{8,}/gi, '$1***');
}

/** Build the POST body for one routed shot. */
function buildRequest({ model, prompt, durationSeconds, resolution, aspectRatio, audio, seed, firstFrame, lastFrame, inputReferences, provider }) {
  const body = { model, prompt: String(prompt || '').trim() };

  if (durationSeconds) body.duration = Number(durationSeconds);
  if (resolution) body.resolution = resolution;
  if (aspectRatio) body.aspect_ratio = aspectRatio;
  if (audio !== undefined && audio !== null) body.generate_audio = Boolean(audio);
  if (seed !== undefined && seed !== null) body.seed = Number(seed);

  const frames = [];
  if (firstFrame) frames.push({ type: 'image_url', image_url: { url: firstFrame }, frame_type: 'first_frame' });
  if (lastFrame) frames.push({ type: 'image_url', image_url: { url: lastFrame }, frame_type: 'last_frame' });
  if (frames.length) body.frame_images = frames;

  if (Array.isArray(inputReferences) && inputReferences.length) {
    body.input_references = inputReferences.map((url) => ({ type: 'image_url', image_url: { url } }));
  }
  if (provider && typeof provider === 'object') body.provider = provider;

  return body;
}

/** Submit a generation. Returns { ok, id, pollingUrl, status }. */
async function submit(shotRequest, opts = {}) {
  const body = buildRequest(shotRequest);
  const res = await requestJson(`${API_BASE}/videos`, {
    method: 'POST',
    headers: authHeaders(),
    body,
    timeoutMs: opts.timeoutMs || 120000,
  });

  if (!res.ok) return { ok: false, error: redact(res.error), request: body };
  if (res.status >= 400) {
    const message = res.json?.error?.message || res.body || `HTTP ${res.status}`;
    return { ok: false, status: res.status, error: redact(message), request: body };
  }

  const job = res.json || {};
  if (!job.id) return { ok: false, error: `no job id in response: ${redact(res.body).slice(0, 400)}`, request: body };

  return {
    ok: true,
    id: job.id,
    pollingUrl: job.polling_url || `${API_BASE}/videos/${job.id}`,
    status: job.status || 'pending',
    request: body,
  };
}

/** Poll a job once. */
async function poll(jobId, opts = {}) {
  const url = opts.pollingUrl || `${API_BASE}/videos/${jobId}`;
  const res = await requestJson(url, { headers: authHeaders(), timeoutMs: opts.timeoutMs || 60000 });
  if (!res.ok) return { ok: false, error: redact(res.error) };
  if (res.status >= 400) {
    return { ok: false, status: res.status, error: redact(res.json?.error?.message || res.body || `HTTP ${res.status}`) };
  }
  const job = res.json || {};
  return {
    ok: true,
    id: job.id || jobId,
    status: job.status || 'pending',
    urls: job.unsigned_urls || [],
    // usage.cost is the real charge. Absent while pending.
    cost: job.usage?.cost ?? null,
    isByok: job.usage?.is_byok ?? null,
    error: job.error ? redact(job.error.message || String(job.error)) : null,
    raw: job,
  };
}

/**
 * Poll until terminal.
 *
 * Backs off from 3s to 20s. Video jobs take tens of seconds to minutes, so a
 * tight loop is pure rate-limit pressure with no latency benefit.
 */
async function waitFor(jobId, opts = {}) {
  const timeoutMs = opts.timeoutMs || 15 * 60 * 1000;
  const started = Date.now();
  let delay = opts.initialDelayMs || 3000;
  const maxDelay = opts.maxDelayMs || 20000;
  const sleep = opts.sleep || ((ms) => new Promise((r) => setTimeout(r, ms)));

  for (;;) {
    const res = await poll(jobId, opts);
    if (!res.ok) return res;
    if (typeof opts.onTick === 'function') opts.onTick(res, Date.now() - started);

    if (TERMINAL.has(String(res.status).toLowerCase())) {
      if (String(res.status).toLowerCase() === 'completed') return res;
      return { ...res, ok: false, error: res.error || `job ${jobId} ended as ${res.status}` };
    }

    if (Date.now() - started > timeoutMs) {
      // Deliberately not a failure of the job — it is still running and still
      // billing. Returning the id lets the caller resume instead of resubmitting.
      return { ok: false, timedOut: true, id: jobId, status: res.status, error: `still ${res.status} after ${Math.round((Date.now() - started) / 1000)}s` };
    }

    await sleep(delay);
    delay = Math.min(Math.round(delay * 1.5), maxDelay);
  }
}

/** Download a finished job's output. */
async function download(job, destPath, opts = {}) {
  const index = opts.index || 0;
  const direct = Array.isArray(job.urls) && job.urls[index];
  if (direct) {
    const res = await downloadToFile(direct, destPath, opts);
    if (res.ok) return res;
  }
  return downloadToFile(`${API_BASE}/videos/${job.id}/content?index=${index}`, destPath, {
    ...opts,
    headers: authHeaders(),
  });
}

/** Live catalog fetch, used by bin/video-models.js --refresh. */
async function fetchCatalog() {
  const res = await requestJson(`${API_BASE}/videos/models`, { timeoutMs: 60000 });
  if (!res.ok || res.status >= 400) return { ok: false, error: redact(res.error || `HTTP ${res.status}`) };
  return { ok: true, models: res.json?.data || [] };
}

module.exports = { API_BASE, buildRequest, submit, poll, waitFor, download, fetchCatalog, redact, apiKey };
