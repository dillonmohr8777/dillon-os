'use strict';

const fs = require('node:fs');
const http = require('node:http');
const { WEB, OPENAPI, INBOX } = require('./paths');
const { assertInside } = require('./sandbox');
const { runTurn, newId } = require('./agent-loop');
const session = require('./session-store');
const memory = require('./memory-store');
const { loadSkills } = require('./skills-loader');
const traces = require('./traces');
const { buildSystemPrompt } = require('./context-builder');
const { bus } = require('./bus');
const { authorized, isOpenPath, cookieHeader } = require('./auth');
const { parseJsonlChunk } = require('./jsonl');
const { listStatus } = require('./models');
const { selectModel } = require('./config');

function sendJson(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'access-control-allow-origin': '*',
  });
  res.end(payload);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function contentType(file) {
  if (file.endsWith('.js')) return 'text/javascript; charset=utf-8';
  if (file.endsWith('.css')) return 'text/css; charset=utf-8';
  if (file.endsWith('.svg')) return 'image/svg+xml';
  if (file.endsWith('.png')) return 'image/png';
  if (file.endsWith('.txt')) return 'text/plain; charset=utf-8';
  if (file.endsWith('.webmanifest')) return 'application/manifest+json';
  if (file.endsWith('.yaml') || file.endsWith('.yml')) return 'text/yaml; charset=utf-8';
  return 'text/html; charset=utf-8';
}

function serveStatic(req, res) {
  const url = new URL(req.url, 'http://127.0.0.1');
  const rel = url.pathname === '/' ? 'index.html' : url.pathname.replace(/^\/+/, '');
  let file;
  try {
    file = assertInside(WEB, rel);
  } catch {
    res.writeHead(404);
    res.end('not found');
    return;
  }
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404);
    res.end('not found');
    return;
  }
  res.writeHead(200, { 'content-type': contentType(file) });
  fs.createReadStream(file).pipe(res);
}

function writeSse(res, event, data) {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

function createServer(config) {
  memory.bootstrap();

  return http.createServer(async (req, res) => {
    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'access-control-allow-origin': '*',
        'access-control-allow-headers': 'content-type, authorization',
        'access-control-allow-methods': 'GET,POST,OPTIONS',
      });
      res.end();
      return;
    }

    const url = new URL(req.url, 'http://127.0.0.1');

    try {
      if (req.method === 'POST' && url.pathname === '/api/login') {
        const body = await readBody(req);
        const token = String(body.token || '').trim();
        if (!config.gateToken || token !== config.gateToken) {
          sendJson(res, 401, { error: 'bad gate code' });
          return;
        }
        const secure = req.headers['x-forwarded-proto'] === 'https';
        res.writeHead(200, {
          'content-type': 'application/json; charset=utf-8',
          'set-cookie': cookieHeader(token, secure),
        });
        res.end(JSON.stringify({ ok: true }));
        return;
      }

      if (!isOpenPath(url.pathname) && !authorized(req, config)) {
        sendJson(res, 401, { error: 'gate required', gate: true });
        return;
      }

      if (req.method === 'GET' && url.pathname === '/api/health') {
        sendJson(res, 200, {
          ok: true,
          product: config.product.name,
          provider: config.provider.kind,
          model: config.provider.model,
          modelId: config.modelId,
          brains: 10,
          memory: memory.stats(),
          skills: loadSkills().map((s) => s.id),
          gated: Boolean(config.gateToken),
          tunnel: Boolean(config.tunnel),
          chatgpt: 'later',
        });
        return;
      }

      if (req.method === 'GET' && url.pathname === '/api/state') {
        const built = buildSystemPrompt(config);
        sendJson(res, 200, {
          product: config.product,
          provider: {
            kind: config.provider.kind,
            api: config.provider.api,
            model: config.provider.model,
            resolvedTag: config.provider.resolvedTag || config.provider.model,
            id: config.modelId,
            label: config.provider.label,
            family: config.provider.family,
            vendor: config.provider.vendor || '',
          },
          memory: memory.stats(),
          sessions: session.listSessions(),
          skills: built.skills.map((s) => ({
            id: s.id,
            name: s.name,
            description: s.description,
            available: s.available !== false,
            missing: s.missing || [],
          })),
          contextTokens: config.contextTokens,
          memoryMaxBytes: config.memoryMaxBytes,
          gated: Boolean(config.gateToken),
        });
        return;
      }

      if (req.method === 'GET' && url.pathname === '/api/models') {
        sendJson(res, 200, await listStatus({ probe: url.searchParams.get('probe') === '1' }));
        return;
      }

      if (req.method === 'POST' && url.pathname === '/api/model') {
        const body = await readBody(req);
        const next = selectModel(String(body.id || '').trim(), config);
        sendJson(res, 200, {
          ok: true,
          id: next.modelId,
          label: next.provider.label,
          api: next.provider.api,
          model: next.provider.model,
        });
        return;
      }

      if (req.method === 'GET' && url.pathname === '/api/inbox') {
        const raw = fs.existsSync(INBOX) ? fs.readFileSync(INBOX, 'utf8') : '';
        sendJson(res, 200, { messages: parseJsonlChunk(raw).slice(-20).reverse() });
        return;
      }

      if (req.method === 'GET' && url.pathname === '/openapi.yaml') {
        res.writeHead(200, { 'content-type': 'text/yaml; charset=utf-8' });
        fs.createReadStream(OPENAPI).pipe(res);
        return;
      }

      if (req.method === 'GET' && url.pathname === '/v1/models') {
        sendJson(res, 200, {
          object: 'list',
          data: [{ id: config.provider.model, object: 'model', owned_by: 'immohrtal-claw' }],
        });
        return;
      }

      if (req.method === 'POST' && url.pathname === '/api/chat') {
        const body = await readBody(req);
        const sessionId = body.session_id || newId('sess');
        const text = String(body.message || '').trim();
        if (!text) {
          sendJson(res, 400, { error: 'message required' });
          return;
        }
        bus.publishInbound({ sessionId, text, channel: 'web' });
        const stream = body.stream !== false;
        if (!stream) {
          const result = await runTurn({ config, sessionId, userText: text });
          sendJson(res, 200, result);
          return;
        }
        res.writeHead(200, {
          'content-type': 'text/event-stream; charset=utf-8',
          'cache-control': 'no-store',
          connection: 'keep-alive',
          // Cloudflare tunnel and any nginx in front will buffer SSE without
          // this, which turns streaming back into one late blob on the phone.
          'x-accel-buffering': 'no',
          'access-control-allow-origin': '*',
        });
        const result = await runTurn({
          config,
          sessionId,
          userText: text,
          onEvent: (evt) => writeSse(res, evt.type, evt),
        });
        writeSse(res, 'done', result);
        res.end();
        return;
      }

      if (req.method === 'POST' && url.pathname === '/v1/chat/completions') {
        const body = await readBody(req);
        const user = [...(body.messages || [])].reverse().find((m) => m.role === 'user');
        const text = user?.content || '';
        const sessionId = body.user || newId('gpt');
        const result = await runTurn({ config, sessionId, userText: String(text) });
        sendJson(res, 200, {
          id: result.turnId,
          object: 'chat.completion',
          created: Math.floor(Date.now() / 1000),
          model: config.provider.model,
          choices: [{
            index: 0,
            message: { role: 'assistant', content: result.content },
            finish_reason: 'stop',
          }],
        });
        return;
      }

      if (req.method === 'GET' && url.pathname.startsWith('/api/traces/')) {
        const turnId = url.pathname.slice('/api/traces/'.length);
        sendJson(res, 200, { turnId, events: traces.loadTrace(turnId) });
        return;
      }

      if (req.method === 'GET' && (
        url.pathname === '/'
        || url.pathname.startsWith('/assets/')
        || /\.(js|css|svg|png|html|txt|webmanifest)$/.test(url.pathname)
      )) {
        serveStatic(req, res);
        return;
      }

      sendJson(res, 404, { error: 'not found' });
    } catch (err) {
      sendJson(res, 500, { error: err.message });
    }
  });
}

module.exports = { createServer };
