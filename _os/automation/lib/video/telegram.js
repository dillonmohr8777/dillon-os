'use strict';

/**
 * Minimal Telegram Bot API client (long polling).
 *
 * Long polling rather than webhooks on purpose: this runs on a Windows desktop
 * behind NAT with no public hostname and no TLS certificate. A webhook would
 * need a tunnel to stay up forever; getUpdates just needs outbound HTTPS.
 *
 * Uploads are multipart because sendVideo with a local file has no JSON form.
 */

const fs = require('fs');
const path = require('path');
const { requestJson } = require('./http');
const { httpGet } = require('../net');

const API = 'https://api.telegram.org';

function token() {
  const t = process.env.TELEGRAM_BOT_TOKEN;
  if (!t || !String(t).trim()) throw new Error('TELEGRAM_BOT_TOKEN is not set');
  return String(t).trim();
}

/** Strip anything token-shaped from text before it is logged. */
function redact(text) {
  return String(text == null ? '' : text).replace(/\b\d{8,10}:[A-Za-z0-9_-]{30,}\b/g, '<bot-token>');
}

async function call(method, params = {}, opts = {}) {
  const res = await requestJson(`${API}/bot${token()}/${method}`, {
    method: 'POST',
    body: params,
    timeoutMs: opts.timeoutMs || 70000,
  });
  if (!res.ok) return { ok: false, error: redact(res.error) };
  if (!res.json?.ok) {
    return { ok: false, error: redact(res.json?.description || `HTTP ${res.status}`) };
  }
  return { ok: true, result: res.json.result };
}

/**
 * Build a multipart/form-data body.
 *
 * Hand-rolled rather than pulled from npm because the rest of _os/automation is
 * dependency-free and this is ~30 lines. Fields and one file are enough for
 * sendVideo and sendDocument.
 */
function multipart(fields, file) {
  const boundary = `----dillonos${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`;
  const parts = [];

  for (const [name, value] of Object.entries(fields)) {
    if (value === undefined || value === null) continue;
    parts.push(Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`, 'utf8'
    ));
  }

  if (file) {
    const filename = path.basename(file.path);
    parts.push(Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="${file.field}"; filename="${filename}"\r\n` +
      `Content-Type: ${file.contentType || 'application/octet-stream'}\r\n\r\n`, 'utf8'
    ));
    parts.push(fs.readFileSync(file.path));
    parts.push(Buffer.from('\r\n', 'utf8'));
  }

  parts.push(Buffer.from(`--${boundary}--\r\n`, 'utf8'));
  return { body: Buffer.concat(parts), contentType: `multipart/form-data; boundary=${boundary}` };
}

/** Telegram rejects bot uploads over 50 MB. Caught here so the error is legible. */
const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;

async function sendVideo(chatId, filePath, caption, opts = {}) {
  if (!fs.existsSync(filePath)) return { ok: false, error: `no such file: ${filePath}` };
  const bytes = fs.statSync(filePath).size;
  if (bytes > MAX_UPLOAD_BYTES) {
    return { ok: false, error: `file is ${(bytes / 1048576).toFixed(1)} MB; Telegram caps bot uploads at 50 MB`, tooLarge: true, bytes };
  }

  const { body, contentType } = multipart(
    {
      chat_id: String(chatId),
      caption: caption ? String(caption).slice(0, 1024) : undefined,
      supports_streaming: 'true',
      ...(opts.width ? { width: String(opts.width) } : {}),
      ...(opts.height ? { height: String(opts.height) } : {}),
    },
    { field: 'video', path: filePath, contentType: 'video/mp4' }
  );

  const res = await httpGet(`${API}/bot${token()}/sendVideo`, {
    method: 'POST',
    headers: { 'content-type': contentType },
    body,
    timeoutMs: opts.timeoutMs || 300000,
    maxBytes: 2_000_000,
  });
  if (!res.ok) return { ok: false, error: redact(res.error) };
  let parsed = null;
  try { parsed = JSON.parse(res.body); } catch { /* non-JSON error page */ }
  if (!parsed?.ok) return { ok: false, error: redact(parsed?.description || `HTTP ${res.status}`) };
  return { ok: true, result: parsed.result, bytes };
}

async function sendDocument(chatId, filePath, caption) {
  if (!fs.existsSync(filePath)) return { ok: false, error: `no such file: ${filePath}` };
  const { body, contentType } = multipart(
    { chat_id: String(chatId), caption: caption ? String(caption).slice(0, 1024) : undefined },
    { field: 'document', path: filePath }
  );
  const res = await httpGet(`${API}/bot${token()}/sendDocument`, {
    method: 'POST', headers: { 'content-type': contentType }, body, timeoutMs: 300000, maxBytes: 2_000_000,
  });
  if (!res.ok) return { ok: false, error: redact(res.error) };
  let parsed = null;
  try { parsed = JSON.parse(res.body); } catch { /* ignore */ }
  if (!parsed?.ok) return { ok: false, error: redact(parsed?.description || `HTTP ${res.status}`) };
  return { ok: true, result: parsed.result };
}

const sendMessage = (chatId, text, opts = {}) =>
  call('sendMessage', {
    chat_id: String(chatId),
    // Telegram hard-caps a message at 4096 characters and errors rather than
    // truncating, so long plans are cut here instead of failing to send.
    text: String(text).slice(0, 4096),
    parse_mode: opts.parseMode || undefined,
    disable_web_page_preview: true,
    reply_markup: opts.replyMarkup ? JSON.stringify(opts.replyMarkup) : undefined,
  });

const getUpdates = (offset, timeoutSeconds = 50) =>
  call('getUpdates', { offset, timeout: timeoutSeconds, allowed_updates: JSON.stringify(['message']) },
    { timeoutMs: (timeoutSeconds + 20) * 1000 });

const getMe = () => call('getMe');

module.exports = { call, sendMessage, sendVideo, sendDocument, getUpdates, getMe, multipart, redact, MAX_UPLOAD_BYTES };
