#!/usr/bin/env node
/**
 * Authenticated webhook receiver for the local D.I.L.L.O.N. OS.
 */

const http = require('node:http');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const PORT = 8644;
const HOST = '127.0.0.1';
const MAX_BODY_BYTES = 1024 * 1024;
const MAX_LOG_ENTRIES = 100;
const DEFAULT_LOG_FILE = path.join(__dirname, '../12_Brain/state/webhook-log.json');
const DEFAULT_SECRET_FILE = path.join(__dirname, '../12_Brain/private/webhook-secret.txt');

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
  });
  res.end(JSON.stringify(payload));
}

function loadOrCreateSecret(secretFile = DEFAULT_SECRET_FILE) {
  try {
    const secret = fs.readFileSync(secretFile, 'utf8').trim();
    if (!/^[a-f0-9]{64}$/i.test(secret)) {
      throw new Error('Webhook secret must be a 64-character hexadecimal value');
    }
    return secret;
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    fs.mkdirSync(path.dirname(secretFile), { recursive: true });
    const secret = crypto.randomBytes(32).toString('hex');
    fs.writeFileSync(secretFile, `${secret}\n`, { mode: 0o600 });
    return secret;
  }
}

function verifySignature(payload, signature, secret) {
  if (typeof signature !== 'string' || !/^sha256=[a-f0-9]{64}$/i.test(signature)) {
    return false;
  }
  const expected = `sha256=${crypto.createHmac('sha256', secret).update(payload).digest('hex')}`;
  const actualBuffer = Buffer.from(signature.toLowerCase());
  const expectedBuffer = Buffer.from(expected);
  return actualBuffer.length === expectedBuffer.length
    && crypto.timingSafeEqual(actualBuffer, expectedBuffer);
}

function logWebhook(logFile, type, body) {
  let logs = [];
  try {
    logs = JSON.parse(fs.readFileSync(logFile, 'utf8'));
    if (!Array.isArray(logs)) logs = [];
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error('Could not read webhook log; starting a new log');
    }
  }

  logs.push({
    timestamp: new Date().toISOString(),
    type,
    body,
  });
  fs.writeFileSync(logFile, `${JSON.stringify(logs.slice(-MAX_LOG_ENTRIES), null, 2)}\n`, {
    mode: 0o600,
  });
}

function createWebhookServer({ secret, logFile = DEFAULT_LOG_FILE } = {}) {
  if (!secret) throw new Error('A webhook secret is required');

  return http.createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');

    if (url.pathname === '/health' && req.method === 'GET') {
      return sendJson(res, 200, { status: 'healthy', timestamp: new Date().toISOString() });
    }

    const routeMatch = url.pathname.match(/^\/webhook\/([A-Za-z0-9._-]{1,64})$/);
    if (!routeMatch || req.method !== 'POST') {
      return sendJson(res, 404, { error: 'Not found' });
    }
    if (!String(req.headers['content-type'] || '').toLowerCase().startsWith('application/json')) {
      return sendJson(res, 415, { error: 'Content-Type must be application/json' });
    }

    const chunks = [];
    let size = 0;
    let tooLarge = false;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        tooLarge = true;
        sendJson(res, 413, { error: 'Payload too large' });
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });

    req.on('end', () => {
      if (tooLarge || res.writableEnded) return;
      const payload = Buffer.concat(chunks);
      const signature = req.headers['x-webhook-signature']
        || req.headers['x-hub-signature-256'];
      if (!verifySignature(payload, signature, secret)) {
        return sendJson(res, 401, { error: 'Valid signature required' });
      }

      let body;
      try {
        body = JSON.parse(payload.toString('utf8'));
      } catch {
        return sendJson(res, 400, { error: 'Body must be valid JSON' });
      }

      const eventType = routeMatch[1];
      logWebhook(logFile, eventType, body);
      console.log(`[${new Date().toISOString()}] Authenticated webhook received: ${eventType}`);
      return sendJson(res, 200, {
        success: true,
        eventType,
        received: new Date().toISOString(),
      });
    });
  });
}

if (require.main === module) {
  const server = createWebhookServer({ secret: loadOrCreateSecret() });
  server.listen(PORT, HOST, () => {
    console.log(`Webhook Gateway running on http://${HOST}:${PORT}`);
    console.log('Authentication required for /webhook/{event-type}');
  });
}

module.exports = {
  MAX_BODY_BYTES,
  createWebhookServer,
  loadOrCreateSecret,
  verifySignature,
};
