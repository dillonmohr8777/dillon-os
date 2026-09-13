#!/usr/bin/env node
/**
 * The CMO OS server.
 *
 * Zero-dependency `node:http`, matching the vault's existing HUD. No build
 * step, no bundler, no framework: `node bin/serve.js` and it is running.
 *
 * The API is the same surface the CLI uses, and it is documented at
 * GET /api. That is deliberate - the closed incumbent exposes "no public API,
 * no MCP server, and no Zapier or Make hooks", so an operator cannot wire it
 * into anything. Everything here is reachable over HTTP and over the CLI.
 *
 * Binds to 127.0.0.1 by default. This process holds client data and can spend
 * money; it is not something to expose on an interface by accident.
 */

import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApp } from '../lib/app.js';
import { describeAgentList, laneSummary } from '../lib/agents/registry-view.js';
import { rollup } from '../lib/runtime/budget.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(HERE, '..', 'public');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

export function startServer(app = null) {
  const application = app || createApp();
  const { config, logger } = application;

  const server = http.createServer(async (req, res) => {
    const started = Date.now();
    let url;
    try {
      url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    } catch {
      return send(res, 400, { error: 'bad request line' });
    }

    try {
      if (url.pathname.startsWith('/api')) {
        await handleApi(application, req, res, url);
      } else {
        await serveStatic(res, url.pathname);
      }
    } catch (err) {
      logger.error('request failed', { path: url.pathname, code: err.code, message: err.message });
      if (!res.headersSent) {
        send(res, err.code === 'VALIDATION' ? 400 : 500, {
          error: err.message || 'internal error',
          code: err.code || 'INTERNAL',
        });
      }
    } finally {
      logger.debug('request', { method: req.method, path: url.pathname, ms: Date.now() - started });
    }
  });

  server.listen(config.port, config.host, () => {
    process.stdout.write(`\n  CMO OS  http://${config.host}:${config.port}\n`);
    process.stdout.write(`  provider ${application.provider.name}${application.provider.isMock ? ' (offline, deterministic)' : ''}  ·  store ${application.store.driver}  ·  routing ${config.routingProfile}\n`);
    process.stdout.write(`  API reference: http://${config.host}:${config.port}/api\n\n`);
  });
  return server;
}

// ---------------------------------------------------------------------------

async function handleApi(app, req, res, url) {
  const parts = url.pathname.split('/').filter(Boolean); // ['api', ...]
  const seg = parts.slice(1);
  const method = req.method.toUpperCase();

  // GET /api - the reference
  if (!seg.length) {
    return send(res, 200, {
      name: 'CMO OS API',
      version: '0.1.0',
      note: 'Every capability the UI has is here, and every one is also on the CLI. Nothing is UI-only.',
      endpoints: [
        'GET  /api/health',
        'GET  /api/agents',
        'GET  /api/workspaces',
        'GET  /api/ws/:wsId/overview',
        'GET  /api/ws/:wsId/artifacts?limit=50',
        'GET  /api/ws/:wsId/artifacts/:artifactId',
        'GET  /api/ws/:wsId/approvals',
        'POST /api/ws/:wsId/approvals/:approvalId/approve   { by, note }',
        'POST /api/ws/:wsId/approvals/:approvalId/reject     { by, note }',
        'GET  /api/ws/:wsId/runs?limit=25',
        'GET  /api/ws/:wsId/runs/:runId/explain',
        'POST /api/ws/:wsId/runs   { agentId, params, dryRun }',
        'POST /api/ws/:wsId/runs/:runId/replay',
        'GET  /api/ws/:wsId/cost',
        'GET  /api/ws/:wsId/events?limit=100',
      ],
    });
  }

  if (seg[0] === 'health' && method === 'GET') {
    return send(res, 200, app.health());
  }

  if (seg[0] === 'agents' && method === 'GET') {
    return send(res, 200, { agents: describeAgentList(), lanes: laneSummary() });
  }

  if (seg[0] === 'workspaces' && method === 'GET') {
    const list = await app.store.listWorkspaces();
    const enriched = [];
    for (const w of list) {
      const ws = app.store.ws(w.id);
      const pending = await ws.list('approvals', { where: { state: 'pending' } });
      const ledger = await ws.read('ledger');
      const spend = rollup(ledger, app.clock.iso());
      const runs = await ws.list('runs', { limit: 1 });
      enriched.push({
        ...w,
        pendingApprovals: pending.length,
        highRiskPending: pending.filter((p) => p.risk === 'high').length,
        blockedPending: pending.filter((p) => p.guardrails?.blocking?.length).length,
        spend: { today: spend.todayUsd, month: spend.monthUsd, calls: spend.calls },
        lastRunAt: runs[0]?.startedAt || null,
      });
    }
    return send(res, 200, { workspaces: enriched });
  }

  if (seg[0] === 'ws') {
    const wsId = seg[1];
    if (!wsId) return send(res, 400, { error: 'workspace id required' });
    const exists = await app.store.getWorkspace(wsId);
    if (!exists) return send(res, 404, { error: `no workspace ${wsId}` });
    const w = app.workspace(wsId);
    const rest = seg.slice(2);

    if (!rest.length || (rest[0] === 'overview' && method === 'GET')) {
      return send(res, 200, await overview(app, w, exists));
    }

    if (rest[0] === 'artifacts' && method === 'GET') {
      if (rest[1]) {
        const artifact = await w.ws.get('artifacts', rest[1]);
        if (!artifact) return send(res, 404, { error: 'no such artifact' });
        return send(res, 200, artifact);
      }
      const limit = Number(url.searchParams.get('limit') || 50);
      return send(res, 200, { artifacts: await w.ws.list('artifacts', { limit }) });
    }

    if (rest[0] === 'approvals') {
      if (method === 'GET' && !rest[1]) return send(res, 200, await w.approvals.board());
      if (method === 'POST' && rest[1] && rest[2]) {
        const body = await readJsonBody(req);
        const by = String(body.by || '').trim();
        if (!by) return send(res, 400, { error: 'a decision must record who made it: pass "by"' });
        try {
          const out = rest[2] === 'approve'
            ? await w.approvals.approve(rest[1], { by, note: body.note || '' })
            : rest[2] === 'reject'
              ? await w.approvals.reject(rest[1], { by, note: body.note || '' })
              : null;
          if (!out) return send(res, 400, { error: `unknown action ${rest[2]}` });
          return send(res, 200, out);
        } catch (err) {
          // A guardrail or separation-of-duties refusal is a 409, not a 500:
          // the request was well-formed, the policy said no.
          return send(res, err.code === 'GUARDRAIL' ? 409 : 400, { error: err.message, code: err.code, meta: err.meta });
        }
      }
    }

    if (rest[0] === 'runs') {
      if (method === 'GET' && !rest[1]) {
        const limit = Number(url.searchParams.get('limit') || 25);
        return send(res, 200, { runs: await w.ws.list('runs', { limit }) });
      }
      if (method === 'GET' && rest[1] && rest[2] === 'explain') {
        const out = await w.engine.explain(rest[1]);
        if (!out.header) return send(res, 404, { error: 'no such run' });
        return send(res, 200, out);
      }
      if (method === 'POST' && rest[1] && rest[2] === 'replay') {
        const prior = await w.ws.get('runs', rest[1]);
        if (!prior) return send(res, 404, { error: 'no such run' });
        const out = await w.engine.run({ agentId: prior.agentId, params: {}, replayOf: rest[1] });
        return send(res, 200, out);
      }
      if (method === 'POST' && !rest[1]) {
        const body = await readJsonBody(req);
        if (!body.agentId) return send(res, 400, { error: 'agentId required' });
        const out = await w.engine.run({ agentId: body.agentId, params: body.params || {}, dryRun: Boolean(body.dryRun) });
        return send(res, 200, out);
      }
    }

    if (rest[0] === 'cost' && method === 'GET') {
      const ledger = await w.ws.read('ledger');
      const r = rollup(ledger, app.clock.iso());
      return send(res, 200, {
        rollup: r,
        caps: w.budget.caps,
        cacheSavingsUsd: round6(ledger.reduce((a, e) => a + (e.cacheSavingsUsd || 0), 0)),
        recent: ledger.slice(-40).reverse(),
      });
    }

    if (rest[0] === 'events' && method === 'GET') {
      const limit = Number(url.searchParams.get('limit') || 100);
      return send(res, 200, { events: (await w.ws.tail('events', limit)).reverse() });
    }
  }

  return send(res, 404, { error: `no route for ${method} ${url.pathname}`, hint: 'GET /api lists every route' });
}

async function overview(app, w, workspace) {
  const [artifacts, runs, board, ledger, events, profile] = await Promise.all([
    w.ws.list('artifacts', { limit: 60 }),
    w.ws.list('runs', { limit: 20 }),
    w.approvals.board(),
    w.ws.read('ledger'),
    w.ws.tail('events', 40),
    w.ws.getSingleton('profile'),
  ]);
  const spend = rollup(ledger, app.clock.iso());

  // The latest GEO scan, surfaced because it is the measurement the whole
  // organic lane is judged on.
  const scanArtifact = artifacts.find((a) => a.kind === 'scan');

  return {
    workspace,
    profile: profile ? { name: profile.name, url: profile.url, category: profile.category, serviceArea: profile.serviceArea, competitors: (profile.competitors || []).length } : null,
    // The feed: what an operator actually looks at each morning, newest first,
    // with the blocked items visibly blocked rather than quietly dropped.
    feed: artifacts.map((a) => ({
      id: a.id, kind: a.kind, title: a.title, summary: a.summary,
      risk: a.risk, effect: a.effect, status: a.status,
      agentId: a.agentId, runId: a.runId,
      guardrails: {
        passed: a.guardrails?.passed,
        score: a.guardrails?.score,
        blocking: (a.guardrails?.blocking || []).map((b) => ({ rule: b.rule, message: b.message })),
        warnings: (a.guardrails?.warnings || []).map((b) => ({ rule: b.rule, message: b.message })),
        claims: (a.guardrails?.claims || []).length,
      },
      evidenceCount: (a.evidence || []).length,
      updatedAt: a.updatedAt,
    })),
    approvals: {
      counts: board.counts,
      oldestPendingDays: board.oldestPendingDays,
      waiting: board.waitingOnHuman.map((a) => ({
        id: a.id, title: a.title, risk: a.risk, effect: a.effect,
        artifactId: a.artifactId, createdBy: a.createdBy, openedAt: a.openedAt,
        blocking: (a.guardrails?.blocking || []).map((b) => b.rule),
      })),
      readyToPublish: board.readyToPublish.map((a) => ({ id: a.id, title: a.title, effect: a.effect, decidedBy: a.decidedBy })),
    },
    runs: runs.map((r) => ({
      id: r.id, agentId: r.agentId, lane: r.lane, status: r.status,
      usd: r.usd, steps: r.steps, live: r.liveSteps, replayed: r.replayedSteps,
      startedAt: r.startedAt, summary: r.summary || r.skipReason || r.error?.message, replayOf: r.replayOf,
    })),
    cost: {
      today: spend.todayUsd, month: spend.monthUsd, total: spend.totalUsd, calls: spend.calls,
      byModel: spend.byModel, byAgent: spend.byAgent,
      caps: w.budget.caps,
      cacheSavingsUsd: round6(ledger.reduce((a, e) => a + (e.cacheSavingsUsd || 0), 0)),
    },
    geo: scanArtifact?.data?.scan
      ? {
        artifactId: scanArtifact.id,
        promptSet: scanArtifact.data.scan.promptSet,
        simulated: Boolean(scanArtifact.data.scan.simulated),
        reportable: Boolean(scanArtifact.data.scan.reportable),
        engines: scanArtifact.data.scan.engines.map((e) => ({
          engine: e.engine, channel: e.channel, simulated: Boolean(e.simulated), answeredBy: e.answeredBy || [],
          visibility: e.visibility.value, low: e.visibility.low, high: e.visibility.high,
          nEff: e.visibility.nEff, coverage: e.visibility.coverage,
          composite: e.composite.value, metricName: e.composite.metricName,
          citationShareNormalized: e.citation.shareNormalized,
          medianCitations: e.citation.medianCitationsPerResponse,
          sov: e.shareOfVoice, lever: e.retrieval.lever,
          controlPresence: e.control.presenceRate,
        })),
        warnings: scanArtifact.data.scan.warnings,
        note: scanArtifact.data.scan.crossEngine.note,
      }
      : null,
    connectors: app.health().connectors,
    events: events.reverse(),
  };
}

// ---------------------------------------------------------------------------

async function serveStatic(res, pathname) {
  const rel = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  // Resolve, then verify the result is still inside PUBLIC_DIR. Checking the
  // input for ".." is not enough - encoded traversal and symlinks both slip past
  // a string check.
  const target = path.resolve(PUBLIC_DIR, rel);
  if (target !== PUBLIC_DIR && !target.startsWith(PUBLIC_DIR + path.sep)) {
    return send(res, 403, { error: 'forbidden' });
  }
  try {
    const body = await fs.readFile(target);
    res.writeHead(200, {
      'content-type': MIME[path.extname(target)] || 'application/octet-stream',
      'cache-control': 'no-cache',
      'x-content-type-options': 'nosniff',
      // The UI is entirely self-contained; nothing loads from a third party.
      'content-security-policy': "default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; script-src 'self'; connect-src 'self'",
      'referrer-policy': 'no-referrer',
    });
    res.end(body);
  } catch (err) {
    if (err.code === 'ENOENT') return send(res, 404, { error: 'not found' });
    throw err;
  }
}

function send(res, status, payload) {
  const body = JSON.stringify(payload, null, 2);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(body),
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
  });
  res.end(body);
}

async function readJsonBody(req, limit = 1_000_000) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) throw Object.assign(new Error('request body too large'), { code: 'VALIDATION' });
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw Object.assign(new Error('body must be valid JSON'), { code: 'VALIDATION' });
  }
}

function round6(n) { return Math.round(Number(n || 0) * 1e6) / 1e6; }

// Direct execution: `node bin/serve.js`
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
  startServer();
}
