#!/usr/bin/env node
/**
 * D.I.L.L.O.N. OS — visual agentic OS server.
 *
 * Zero-dependency Node (18+) server that:
 *   - serves the HUD dashboard (public/index.html)
 *   - reads live metrics, directives, docs, and config out of the Obsidian vault
 *   - surfaces the canonical `12_Brain/` second-brain layer in vitals
 *   - runs one-click skills headlessly via `claude -p "/skill"` and streams
 *     output back to the HUD over SSE
 *
 * Run:  node _os/server.js        (from the vault root, or anywhere)
 * Then: open http://127.0.0.1:4242
 */

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
const crypto = require('node:crypto');
const { buildState, getSkills } = require('./vault-state');

const VAULT = path.resolve(__dirname, '..');
const PUBLIC = path.join(__dirname, 'public');
const PORT = Number(process.env.OS_PORT || 4242);
const HOST = process.env.OS_HOST || '127.0.0.1';

// ---------------------------------------------------------------------------
// Skill runner — headless Claude Code jobs with SSE log streaming
// ---------------------------------------------------------------------------

const jobs = new Map(); // id -> { id, skill, status, started, ended, log: [], watchers: Set<res> }

function jobSummary(j) {
  return { id: j.id, skill: j.skill, status: j.status, started: j.started, ended: j.ended };
}

function pushLog(job, line) {
  job.log.push(line);
  if (job.log.length > 2000) job.log.splice(0, job.log.length - 2000);
  const data = `data: ${JSON.stringify({ line, status: job.status })}\n\n`;
  for (const res of job.watchers) res.write(data);
}

function startJob(skillName) {
  const known = getSkills(VAULT).some((s) => s.name === skillName);
  if (!known) return { error: `unknown skill: ${skillName}` };
  if ([...jobs.values()].some((j) => j.status === 'running' && j.skill === skillName)) {
    return { error: `${skillName} is already running` };
  }
  const id = crypto.randomBytes(6).toString('hex');
  const job = { id, skill: skillName, status: 'running', started: Date.now(), ended: null, log: [], watchers: new Set() };
  jobs.set(id, job);

  const args = ['-p', `/${skillName}`, '--permission-mode', 'acceptEdits'];
  let child;
  try {
    child = spawn('claude', args, { cwd: VAULT, env: process.env });
  } catch (err) {
    job.status = 'failed'; job.ended = Date.now();
    pushLog(job, `!! could not launch claude CLI: ${err.message}`);
    return { id };
  }
  pushLog(job, `>> claude ${args.join(' ')}`);
  pushLog(job, `>> cwd ${VAULT}`);

  const onChunk = (buf) => {
    for (const line of buf.toString().split('\n')) if (line.trim()) pushLog(job, line);
  };
  child.stdout.on('data', onChunk);
  child.stderr.on('data', (buf) => onChunk(Buffer.from('!! ' + buf.toString())));
  child.on('error', (err) => {
    job.status = 'failed'; job.ended = Date.now();
    pushLog(job, `!! ${err.code === 'ENOENT' ? 'claude CLI not found on PATH — install Claude Code first' : err.message}`);
  });
  child.on('close', (code) => {
    if (job.status !== 'failed') job.status = code === 0 ? 'done' : 'failed';
    job.ended = Date.now();
    pushLog(job, code === 0 ? `>> ${skillName} complete` : `!! exited with code ${code}`);
    for (const res of job.watchers) res.end();
    job.watchers.clear();
  });
  return { id };
}

function statePayload() {
  const state = buildState(VAULT);
  state.jobs = [...jobs.values()].map(jobSummary).sort((a, b) => b.started - a.started).slice(0, 10);
  return state;
}

// ---------------------------------------------------------------------------
// HTTP
// ---------------------------------------------------------------------------

function json(res, code, body) {
  const data = JSON.stringify(body);
  res.writeHead(code, { 'content-type': 'application/json', 'cache-control': 'no-store' });
  res.end(data);
}

const PUBLIC_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
};

function servePublic(pathname, res) {
  const rel = decodeURIComponent(pathname).replace(/^\/+/, '');
  if (!rel || rel.includes('..') || path.isAbsolute(rel)) return false;
  const resolved = path.resolve(path.join(PUBLIC, rel));
  const root = path.resolve(PUBLIC) + path.sep;
  if (resolved !== path.resolve(PUBLIC) && !resolved.startsWith(root)) return false;
  if (!fs.existsSync(resolved) || fs.statSync(resolved).isDirectory()) return false;
  const ext = path.extname(resolved);
  res.writeHead(200, {
    'content-type': PUBLIC_TYPES[ext] || 'application/octet-stream',
    'cache-control': ext === '.png' ? 'public, max-age=86400' : 'no-store',
  });
  res.end(fs.readFileSync(resolved));
  return true;
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const p = url.pathname;

  if (p === '/' || p === '/index.html') {
    try {
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
      res.end(fs.readFileSync(path.join(PUBLIC, 'index.html')));
    } catch { json(res, 500, { error: 'public/index.html missing' }); }
    return;
  }

  if (p === '/favicon.ico') {
    const icon = path.join(PUBLIC, 'icons', 'icon-192.png');
    if (fs.existsSync(icon)) {
      res.writeHead(200, { 'content-type': 'image/png', 'cache-control': 'no-store' });
      return res.end(fs.readFileSync(icon));
    }
    res.writeHead(204); return res.end();
  }

  const publicFile = servePublic(p, res);
  if (publicFile) return;

  if (p === '/api/state' && req.method === 'GET') {
    try { json(res, 200, statePayload()); }
    catch (err) { json(res, 500, { error: err.message }); }
    return;
  }

  if (p === '/api/run' && req.method === 'POST') {
    let body = '';
    req.on('data', (c) => { body += c; if (body.length > 4096) req.destroy(); });
    req.on('end', () => {
      try {
        const { skill } = JSON.parse(body || '{}');
        const result = startJob(String(skill || ''));
        json(res, result.error ? 400 : 200, result);
      } catch { json(res, 400, { error: 'bad request' }); }
    });
    return;
  }

  const stream = p.match(/^\/api\/jobs\/([a-f0-9]+)\/stream$/);
  if (stream && req.method === 'GET') {
    const job = jobs.get(stream[1]);
    if (!job) return json(res, 404, { error: 'no such job' });
    res.writeHead(200, {
      'content-type': 'text/event-stream',
      'cache-control': 'no-store',
      connection: 'keep-alive',
    });
    for (const line of job.log) res.write(`data: ${JSON.stringify({ line, status: job.status })}\n\n`);
    if (job.status !== 'running') return res.end();
    job.watchers.add(res);
    req.on('close', () => job.watchers.delete(res));
    return;
  }

  if (p === '/api/outreach/book' && req.method === 'POST') {
    let body = '';
    req.on('data', (c) => { body += c; if (body.length > 8192) req.destroy(); });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const batchId = String(payload.batch_id || 'jesse-238').replace(/[^a-z0-9._-]/gi, '');
        const prospectId = String(payload.prospect_id || '').slice(0, 40);
        if (!prospectId) return json(res, 400, { error: 'prospect_id required' });
        const dir = path.join(VAULT, '02_Campaigns/AI Site Builder Outreach Engine/batches', batchId);
        if (!fs.existsSync(dir)) return json(res, 404, { error: 'unknown batch' });
        const row = {
          type: 'call_booked',
          prospect_id: prospectId,
          at: new Date().toISOString(),
        };
        fs.appendFileSync(path.join(dir, 'bookings.jsonl'), JSON.stringify(row) + '\n');
        try {
          const { loadLedger, saveLedger, recordEvent, emptyLedger } = require('./outreach-engine/lib/ledger');
          let ledger = loadLedger(dir);
          if (!ledger) {
            const batch = JSON.parse(fs.readFileSync(path.join(dir, 'batch.json'), 'utf8'));
            ledger = emptyLedger(batch);
          }
          recordEvent(ledger, row);
          saveLedger(dir, ledger);
        } catch { /* ledger is best-effort */ }
        json(res, 200, { ok: true, held: true });
      } catch {
        json(res, 400, { error: 'bad request' });
      }
    });
    return;
  }

  const outreach = p.match(/^\/outreach\/([a-z0-9._-]+)(?:\/(.*))?$/i);
  if (outreach && req.method === 'GET') {
    const batchId = outreach[1];
    const rel = decodeURIComponent(outreach[2] || 'index.html').replace(/^\/+/, '');
    if (rel.includes('..') || path.isAbsolute(rel)) return json(res, 400, { error: 'bad path' });
    const root = path.join(VAULT, '02_Campaigns/AI Site Builder Outreach Engine/batches', batchId);
    const file = path.join(root, rel);
    const resolved = path.resolve(file);
    if (!resolved.startsWith(path.resolve(root) + path.sep) && resolved !== path.resolve(root)) {
      return json(res, 400, { error: 'bad path' });
    }
    if (!fs.existsSync(resolved) || fs.statSync(resolved).isDirectory()) {
      const index = path.join(resolved, 'index.html');
      if (fs.existsSync(index)) {
        res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
        return res.end(fs.readFileSync(index));
      }
      return json(res, 404, { error: 'not found' });
    }
    const ext = path.extname(resolved);
    const types = { '.html': 'text/html; charset=utf-8', '.svg': 'image/svg+xml', '.csv': 'text/csv; charset=utf-8', '.json': 'application/json', '.md': 'text/markdown; charset=utf-8' };
    res.writeHead(200, { 'content-type': types[ext] || 'application/octet-stream', 'cache-control': 'no-store' });
    return res.end(fs.readFileSync(resolved));
  }

  json(res, 404, { error: 'not found' });
});

server.listen(PORT, HOST, () => {
  console.log(`D.I.L.L.O.N. OS online → http://${HOST}:${PORT}`);
  console.log(`vault: ${VAULT}`);
  console.log(`brain: ${path.join(VAULT, '12_Brain')}`);
});
