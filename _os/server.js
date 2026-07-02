#!/usr/bin/env node
/**
 * D.I.L.L.O.N. OS — visual agentic OS server.
 *
 * Zero-dependency Node (18+) server that:
 *   - serves the HUD dashboard (public/index.html)
 *   - reads live metrics, directives, docs, and config out of the Obsidian vault
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

const VAULT = path.resolve(__dirname, '..');
const PUBLIC = path.join(__dirname, 'public');
const PORT = Number(process.env.OS_PORT || 4242);
const HOST = process.env.OS_HOST || '127.0.0.1';

// Folders that are not "notes" — skipped by every vault walk.
const SKIP = new Set(['.git', '.obsidian', '.claude', '_os', 'node_modules']);

// ---------------------------------------------------------------------------
// Vault reading
// ---------------------------------------------------------------------------

function walkNotes(dir, out = []) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    if (e.name.startsWith('.') || SKIP.has(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walkNotes(full, out);
    else if (e.isFile() && e.name.endsWith('.md')) {
      try {
        const st = fs.statSync(full);
        out.push({ path: full, rel: path.relative(VAULT, full), mtime: st.mtimeMs, size: st.size });
      } catch { /* raced deletion */ }
    }
  }
  return out;
}

function readText(rel) {
  try { return fs.readFileSync(path.join(VAULT, rel), 'utf8'); } catch { return null; }
}

/** Minimal YAML frontmatter parser: flat `key: value` pairs only. */
function frontmatter(text) {
  const out = {};
  if (!text || !text.startsWith('---')) return out;
  const end = text.indexOf('\n---', 3);
  if (end === -1) return out;
  for (const line of text.slice(3, end).split('\n')) {
    const m = line.match(/^(\w[\w-]*):\s*(.+)\s*$/);
    if (m) out[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  }
  return out;
}

function countTasks(text) {
  const open = (text.match(/^\s*[-*] \[ \]/gm) || []).length;
  const done = (text.match(/^\s*[-*] \[[xX]\]/gm) || []).length;
  return { open, done };
}

/** Notes modified per day for the trailing `days` days (index 0 = oldest). */
function activitySeries(notes, days = 14) {
  const series = new Array(days).fill(0);
  const now = Date.now();
  for (const n of notes) {
    const age = Math.floor((now - n.mtime) / 86400000);
    if (age >= 0 && age < days) series[days - 1 - age]++;
  }
  return series;
}

function section(text, heading) {
  if (!text) return '';
  const re = new RegExp(`^##\\s+${heading}\\s*$`, 'mi');
  const m = re.exec(text);
  if (!m) return '';
  const rest = text.slice(m.index + m[0].length);
  const next = rest.search(/^##\s+/m);
  return next === -1 ? rest : rest.slice(0, next);
}

function getConfig() {
  const text = readText(path.join('System', 'OS Config.md')) || '';
  const fm = frontmatter(text);
  const schedule = (section(text, 'Schedule').match(/^\s*[-*]\s+(.+)$/gm) || [])
    .map((l) => l.replace(/^\s*[-*]\s+/, ''));
  return {
    callsign: fm.callsign || 'D.I.L.L.O.N.',
    subtitle: fm.subtitle || 'personal agentic operating system',
    operator: fm.operator || 'operator',
    primaryDirective: fm.primary_directive || 'SET primary_directive IN System/OS Config.md',
    goalLabel: fm.goal_label || 'GOAL',
    goalCurrent: Number(fm.goal_current) || 0,
    goalTarget: Number(fm.goal_target) || 0,
    schedule,
  };
}

function getDirectives() {
  const out = [];
  const dash = readText('Dashboard.md') || '';
  for (const m of section(dash, 'Today').matchAll(/^\s*[-*] \[( |[xX])\]\s+(.+)$/gm)) {
    if (m[2].trim()) out.push({ text: m[2].trim(), done: m[1] !== ' ', source: 'Dashboard.md' });
  }
  // Fall back to / top up from the newest daily brief's priority stack.
  if (out.filter((d) => !d.done).length < 3) {
    const briefs = walkNotes(path.join(VAULT, 'Daily-Briefs')).sort((a, b) => b.mtime - a.mtime);
    if (briefs[0]) {
      const text = readText(briefs[0].rel) || '';
      const stack = section(text, ".*Priority Stack");
      for (const m of stack.matchAll(/^\s*\d+\.\s+(.+)$/gm)) {
        const line = m[1].split(/(?<=[.!?])\s/)[0].trim();
        if (line && !out.some((d) => d.text === line)) {
          out.push({ text: line, done: false, source: path.basename(briefs[0].rel) });
        }
      }
    }
  }
  return out.slice(0, 8);
}

function getSkills() {
  const dir = path.join(VAULT, '.claude', 'skills');
  const skills = [];
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return skills; }
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    const text = readText(path.join('.claude', 'skills', e.name, 'SKILL.md'));
    if (!text) continue;
    const fm = frontmatter(text);
    skills.push({ name: fm.name || e.name, description: fm.description || '' });
  }
  // Deck order: daily cadence first, then the rest alphabetically.
  const order = ['am-report', 'inbox-brief', 'plan-today', 'client-pulse',
    'metrics-pull', 'content-scan', 'week-review', 'vault-clean'];
  skills.sort((a, b) => {
    const ai = order.indexOf(a.name), bi = order.indexOf(b.name);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi) || a.name.localeCompare(b.name);
  });
  return skills;
}

function relTime(ms) {
  const s = Math.floor((Date.now() - ms) / 1000);
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

function buildState() {
  const notes = walkNotes(VAULT);
  let open = 0, done = 0;
  // Task scan bounded to smaller files so a huge export can't stall the tick.
  for (const n of notes) {
    if (n.size > 512 * 1024) continue;
    const t = countTasks(readText(n.rel) || '');
    open += t.open; done += t.done;
  }
  const inDir = (name) => notes.filter((n) => n.rel.startsWith(name + path.sep)).length;
  const recent = [...notes].sort((a, b) => b.mtime - a.mtime);
  const weekTouches = notes.filter((n) => Date.now() - n.mtime < 7 * 86400000).length;

  return {
    now: Date.now(),
    config: getConfig(),
    vitals: {
      notes: notes.length,
      inbox: inDir('00_Inbox'),
      clients: inDir('01_Clients'),
      content: inDir('03_Content'),
      sessions: inDir('10_Sessions'),
      agents: inDir('11_Agents'),
      tasksOpen: open,
      tasksDone: done,
      weekTouches,
      activity: activitySeries(notes),
    },
    directives: getDirectives(),
    docs: recent.slice(0, 7).map((n) => ({ rel: n.rel, name: path.basename(n.rel, '.md'), ago: relTime(n.mtime) })),
    wire: recent.slice(0, 12).map((n) => ({ text: `${path.basename(n.rel, '.md')} touched`, ago: relTime(n.mtime) })),
    skills: getSkills(),
    jobs: [...jobs.values()].map(jobSummary).sort((a, b) => b.started - a.started).slice(0, 10),
  };
}

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
  const known = getSkills().some((s) => s.name === skillName);
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

// ---------------------------------------------------------------------------
// HTTP
// ---------------------------------------------------------------------------

function json(res, code, body) {
  const data = JSON.stringify(body);
  res.writeHead(code, { 'content-type': 'application/json', 'cache-control': 'no-store' });
  res.end(data);
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

  if (p === '/favicon.ico') { res.writeHead(204); return res.end(); }

  if (p === '/api/state' && req.method === 'GET') {
    try { json(res, 200, buildState()); }
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

  json(res, 404, { error: 'not found' });
});

server.listen(PORT, HOST, () => {
  console.log(`D.I.L.L.O.N. OS online → http://${HOST}:${PORT}`);
  console.log(`vault: ${VAULT}`);
});
