'use strict';

/**
 * Request helper for the video stack.
 *
 * Public hosts go through lib/net.js `httpGet`, which already handles proxy
 * tunnelling, redirects, byte caps and binary bodies — and, importantly, refuses
 * to talk to loopback or RFC1918 addresses so a URL from a model response can
 * never turn this into an internal port scanner.
 *
 * The local director is the one deliberate exception. Ollama and LM Studio live
 * on http://localhost:11434 and http://localhost:1234, so the SSRF guard has to
 * be bypassed for them. It is bypassed only when the caller passes
 * `allowLoopback: true`, and only for hosts that are genuinely loopback — an
 * operator pointing OPENAI_BASE_URL at a LAN box still gets the guard.
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const { URL } = require('url');
const { httpGet } = require('../net');

const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '0.0.0.0']);

function isLoopback(urlStr) {
  try {
    const host = new URL(String(urlStr)).hostname.toLowerCase().replace(/^\[|\]$/g, '');
    return LOOPBACK_HOSTS.has(host) || /^127\./.test(host);
  } catch {
    return false;
  }
}

/** Direct request to an explicitly-approved loopback endpoint (no proxy, no guard). */
function loopbackRequest(urlStr, { method = 'GET', headers = {}, body = null, timeoutMs = 120000 } = {}) {
  return new Promise((resolve) => {
    const u = new URL(String(urlStr));
    const lib = u.protocol === 'https:' ? https : http;
    const payload = body == null ? null : Buffer.isBuffer(body) ? body : Buffer.from(String(body), 'utf8');

    const req = lib.request(
      u,
      {
        method,
        headers: {
          ...(payload ? { 'content-length': String(payload.length) } : {}),
          ...headers,
        },
        timeout: timeoutMs,
      },
      (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () =>
          resolve({
            ok: true,
            status: res.statusCode || 0,
            headers: res.headers,
            body: Buffer.concat(chunks).toString('utf8'),
          })
        );
      }
    );
    req.on('timeout', () => { req.destroy(new Error(`timeout after ${timeoutMs}ms`)); });
    req.on('error', (err) => resolve({ ok: false, error: err.message }));
    if (payload) req.write(payload);
    req.end();
  });
}

/**
 * JSON request. Returns { ok, status, json, body, error }.
 *
 * A non-2xx status is NOT an error here — the caller decides. OpenRouter returns
 * structured error bodies on 4xx that are more useful than a thrown string.
 */
async function requestJson(url, opts = {}) {
  const { method = 'GET', headers = {}, body = null, timeoutMs = 120000, allowLoopback = false } = opts;

  const payload = body == null ? null : typeof body === 'string' ? body : JSON.stringify(body);
  const reqHeaders = {
    accept: 'application/json',
    ...(payload ? { 'content-type': 'application/json' } : {}),
    ...headers,
  };

  const res = allowLoopback && isLoopback(url)
    ? await loopbackRequest(url, { method, headers: reqHeaders, body: payload, timeoutMs })
    : await httpGet(url, { method, headers: reqHeaders, body: payload, timeoutMs, maxBytes: 20_000_000 });

  if (!res.ok) return { ok: false, error: res.error || 'request failed', status: res.status };

  let json = null;
  try {
    json = res.body ? JSON.parse(res.body) : null;
  } catch {
    // Leave json null; body is returned so the caller can report what came back.
  }
  return { ok: true, status: res.status, json, body: res.body, headers: res.headers };
}

/** Stream a binary URL to disk. Used for finished MP4s. */
async function downloadToFile(url, destPath, opts = {}) {
  const res = await httpGet(url, {
    timeoutMs: opts.timeoutMs || 300000,
    // Video files are large and must not be decoded as text; encoding:null keeps
    // the raw Buffer intact. Decoding an MP4 as utf8 corrupts every byte >0x7F
    // and still writes a plausible-looking file.
    encoding: null,
    maxBytes: opts.maxBytes || 500_000_000,
    headers: opts.headers || {},
  });
  if (!res.ok) return { ok: false, error: res.error };
  if (res.status && res.status >= 400) return { ok: false, error: `HTTP ${res.status}` };
  const buf = Buffer.isBuffer(res.body) ? res.body : Buffer.from(res.body || '', 'binary');
  fs.writeFileSync(destPath, buf);
  return { ok: true, path: destPath, bytes: buf.length };
}

module.exports = { requestJson, downloadToFile, isLoopback };
