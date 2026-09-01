#!/usr/bin/env node
/**
 * Vault state helpers for D.I.L.L.O.N. OS.
 * Pure filesystem reads — no HTTP. Used by server.js and deterministic tests.
 */
const fs = require('node:fs');
const path = require('node:path');

const BRAIN = '12_Brain';
const FORBIDDEN_BRAIN = '1Z_Brain';

// Folders that are not "notes" — skipped by every vault walk.
const SKIP = new Set(['.git', '.obsidian', '.claude', '_os', 'node_modules', 'immohrtal-site', 'mohr-media-site', 'philly-sites']);

function walkNotes(vault, dir = vault, out = []) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    if (e.name.startsWith('.') || SKIP.has(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walkNotes(vault, full, out);
    else if (e.isFile() && e.name.endsWith('.md')) {
      try {
        const st = fs.statSync(full);
        out.push({ path: full, rel: path.relative(vault, full), mtime: st.mtimeMs, size: st.size });
      } catch { /* raced deletion */ }
    }
  }
  return out;
}

function readText(vault, rel) {
  try { return fs.readFileSync(path.join(vault, rel), 'utf8'); } catch { return null; }
}

/** Minimal YAML frontmatter parser: flat `key: value` pairs only. */
function frontmatter(text) {
  const out = {};
  if (!text || !text.startsWith('---')) return out;
  const end = text.indexOf('\n---', 3);
  if (end === -1) return out;
  for (const line of text.slice(3, end).split('\n')) {
    const m = line.match(/^(\w[\w-]*)\s*:\s*(.+)\s*$/);
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

function getConfig(vault) {
  const text = readText(vault, path.join('System', 'OS Config.md')) || '';
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

function getDirectives(vault) {
  const out = [];
  const dash = readText(vault, 'Dashboard.md') || '';
  for (const m of section(dash, 'Today').matchAll(/^\s*[-*] \[( |[xX])\]\s+(.+)$/gm)) {
    if (m[2].trim()) out.push({ text: m[2].trim(), done: m[1] !== ' ', source: 'Dashboard.md' });
  }
  if (out.filter((d) => !d.done).length < 3) {
    const briefs = walkNotes(vault, path.join(vault, 'Daily-Briefs')).sort((a, b) => b.mtime - a.mtime);
    if (briefs[0]) {
      const text = readText(vault, briefs[0].rel) || '';
      const stack = section(text, '.*Priority Stack');
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

function getSkills(vault) {
  const dir = path.join(vault, '.claude', 'skills');
  const skills = [];
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return skills; }
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    const text = readText(vault, path.join('.claude', 'skills', e.name, 'SKILL.md'));
    if (!text) continue;
    const fm = frontmatter(text);
    skills.push({ name: fm.name || e.name, description: fm.description || '' });
  }
  const order = [
    'am-report', 'inbox-brief', 'plan-today', 'client-pulse',
    'metrics-pull', 'content-scan', 'week-review', 'vault-clean',
    'session-mine', 'vault-compile', 'wiki-lint', 'synthesize', 'research-sweep',
  ];
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

function countMdIn(vault, relDir) {
  const full = path.join(vault, relDir);
  if (!fs.existsSync(full)) return 0;
  return walkNotes(vault, full).length;
}

/** Brain-layer vitals derived from the canonical 12_Brain tree. */
function getBrainVitals(vault) {
  const root = path.join(vault, BRAIN);
  const present = fs.existsSync(root) && fs.statSync(root).isDirectory();
  const forbidden = fs.existsSync(path.join(vault, FORBIDDEN_BRAIN));
  return {
    present,
    forbiddenRival: forbidden,
    path: BRAIN,
    entities: countMdIn(vault, path.join(BRAIN, '02_Entities')),
    concepts: countMdIn(vault, path.join(BRAIN, '03_Concepts')),
    projects: countMdIn(vault, path.join(BRAIN, '05_Projects')),
    decisions: countMdIn(vault, path.join(BRAIN, '04_Decisions')),
    research: countMdIn(vault, path.join(BRAIN, '06_Research')),
    memory: countMdIn(vault, path.join(BRAIN, '08_Memory')),
    protocols: countMdIn(vault, path.join(BRAIN, 'protocols')),
    raw: countMdIn(vault, path.join(BRAIN, '01_Captures')),
    indexPresent: fs.existsSync(path.join(root, 'INDEX.md')),
  };
}

/** Required 12_Brain structure for reconcile/port completeness. */
function requiredBrainPaths() {
  return [
    '12_Brain/INDEX.md',
    '12_Brain/README.md',
    '12_Brain/Brain Map.canvas',
    '12_Brain/01_Captures/README.md',
    '12_Brain/01_Captures/sessions/session-log.md',
    '12_Brain/private/README.md',
    '12_Brain/02_Entities/README.md',
    '12_Brain/03_Concepts/README.md',
    '12_Brain/03_Concepts/Second Brain Architecture.md',
    '12_Brain/05_Projects/README.md',
    '12_Brain/04_Decisions/README.md',
    '12_Brain/06_Research/README.md',
    '12_Brain/08_Memory/README.md',
    '12_Brain/08_Memory/current/Brain Layer Canonical.md',
    '12_Brain/protocols/README.md',
    '12_Brain/protocols/Compiler Protocol.md',
    '12_Brain/protocols/HUD Protocol.md',
    '12_Brain/Bases/Clients.base',
    '12_Brain/Bases/Projects.base',
    '12_Brain/Bases/Decisions.base',
    '12_Brain/templates/Project.md',
    '12_Brain/templates/Decision.md',
    '12_Brain/templates/Memory As-Of.md',
    '12_Brain/System/Second Brain Ops.md',
    '12_Brain/System/Health Automation.md',
    'CLAUDE.md',
    'INDEX.md',
    '.claude/skills/vault-compile/SKILL.md',
    '.claude/skills/wiki-lint/SKILL.md',
    '.claude/skills/synthesize/SKILL.md',
    '.claude/skills/session-mine/SKILL.md',
    '.claude/skills/research-sweep/SKILL.md',
    '.claude/settings.json',
    '.cursor/rules/vault-conventions.mdc',
    '.cursor/rules/writing-rules.mdc',
    'System/routine-health.md',
    '.gitignore',
  ];
}

function assertBrainStructure(vault) {
  const missing = [];
  for (const rel of requiredBrainPaths()) {
    if (!fs.existsSync(path.join(vault, rel))) missing.push(rel);
  }
  const rival = fs.existsSync(path.join(vault, FORBIDDEN_BRAIN));
  return { ok: missing.length === 0 && !rival, missing, forbiddenRival: rival };
}

// ---------------------------------------------------------------------------
// Loop health — how long since each automation last wrote its state file.
// ---------------------------------------------------------------------------

const STATE_DIR = path.join(BRAIN, 'state');
const REGISTRY_FILE = path.join(BRAIN, 'registry', 'automations.json');
const CONNECTOR_FILE = path.join(STATE_DIR, 'connector-health.json');

/** Timestamp fields the automations actually write, checked in this order. */
const STAMP_KEYS = [
  'written_at', 'recorded_at_utc', 'last_cycle_utc', 'updated_utc', 'updated_at',
  'updated', 'last_run', 'checked_at', 'started_at', 'asOf', 'generatedAtUtc',
  'last_successful_run', 'verifiedAt',
];

/** Age bands. 48h matches connector-health.js; a week is one missed weekly cadence. */
const LOOP_BANDS = { FRESH_H: 48, STALE_H: 168 };

function readJsonFile(vault, rel) {
  const text = readText(vault, rel);
  if (text == null) return null;
  try { return JSON.parse(text.replace(/^﻿/, '')); } catch { return null; }
}

/** Newest parseable timestamp among STAMP_KEYS, top level first, then one level down. */
function newestStamp(obj) {
  if (!obj || typeof obj !== 'object') return null;
  let best = null;
  const take = (v) => {
    if (typeof v !== 'string') return;
    const ms = Date.parse(v);
    if (Number.isFinite(ms) && (best === null || ms > best)) best = ms;
  };
  for (const k of STAMP_KEYS) take(obj[k]);
  if (best !== null) return best;
  for (const v of Object.values(obj)) {
    if (v && typeof v === 'object' && !Array.isArray(v)) for (const k of STAMP_KEYS) take(v[k]);
  }
  return best;
}

function loopBand(ageHours) {
  if (ageHours == null) return 'unknown';
  if (ageHours <= LOOP_BANDS.FRESH_H) return 'fresh';
  if (ageHours <= LOOP_BANDS.STALE_H) return 'stale';
  return 'dead';
}

const BAND_RANK = { dead: 0, stale: 1, unknown: 2, fresh: 3 };

/**
 * One row per automation: registry entries joined to their state file by id,
 * plus loose state files no registry entry claims (still real loops, just
 * unregistered). Age comes from the timestamp the automation wrote, never the
 * file mtime — a fresh clone would otherwise make every loop look alive.
 */
function getLoopHealth(vault, now = Date.now()) {
  const registry = readJsonFile(vault, REGISTRY_FILE);
  const automations = Array.isArray(registry) ? registry : (registry && registry.automations) || [];
  const stateDir = path.join(vault, STATE_DIR);
  let files = [];
  try { files = fs.readdirSync(stateDir).filter((f) => f.endsWith('.json')); } catch { /* no state yet */ }
  const stamps = new Map();
  for (const f of files) {
    const id = f.replace(/\.json$/, '');
    if (id === 'connector-health') continue;            // reported separately
    stamps.set(id, newestStamp(readJsonFile(vault, path.join(STATE_DIR, f))));
  }

  const rows = [];
  const claimed = new Set();
  for (const a of automations) {
    if (!a || !a.id) continue;
    // A registry entry owns <id>.json plus every state file it names among its
    // outputs. Claim them all so a second output never surfaces as "unregistered",
    // and read the newest stamp across them.
    const keys = [a.id, ...(a.outputs || []).map((o) => path.basename(String(o), '.json'))]
      .filter((k) => stamps.has(k));
    let stamp = null;
    for (const k of keys) {
      claimed.add(k);
      const v = stamps.get(k);
      if (v != null && (stamp === null || v > stamp)) stamp = v;
    }
    const ageHours = stamp == null ? null : Math.max(0, (now - stamp) / 3.6e6);
    rows.push({
      id: a.id, name: a.name || a.id, cadence: a.cadence || '', registryStatus: a.status || '',
      registered: true, lastRun: stamp == null ? null : new Date(stamp).toISOString(),
      ageHours: ageHours == null ? null : Number(ageHours.toFixed(1)), band: loopBand(ageHours),
    });
  }
  for (const [id, stamp] of stamps) {
    if (claimed.has(id)) continue;
    const ageHours = stamp == null ? null : Math.max(0, (now - stamp) / 3.6e6);
    rows.push({
      id, name: id.replace(/-/g, ' '), cadence: '', registryStatus: 'unregistered',
      registered: false, lastRun: stamp == null ? null : new Date(stamp).toISOString(),
      ageHours: ageHours == null ? null : Number(ageHours.toFixed(1)), band: loopBand(ageHours),
    });
  }
  rows.sort((a, b) => (BAND_RANK[a.band] - BAND_RANK[b.band]) || ((b.ageHours ?? -1) - (a.ageHours ?? -1)) || a.id.localeCompare(b.id));

  const counts = { fresh: 0, stale: 0, dead: 0, unknown: 0 };
  for (const r of rows) counts[r.band]++;
  const worst = rows.length ? rows[0].band : 'unknown';
  return { rows, counts, worst, total: rows.length };
}

/** Connector observations recorded by an MCP-capable agent (see connector-health.js). */
function getConnectorHealth(vault, now = Date.now()) {
  const state = readJsonFile(vault, CONNECTOR_FILE);
  const list = state && Array.isArray(state.connectors) ? state.connectors : [];
  const rows = list.map((c) => {
    const seen = Date.parse(c.last_verified_utc || '');
    const ageHours = Number.isFinite(seen) ? Math.max(0, (now - seen) / 3.6e6) : null;
    const usable = c.status === 'active' && c.read_verified === true && ageHours != null && ageHours <= LOOP_BANDS.FRESH_H;
    return {
      toolkit: c.toolkit, status: c.status || 'unknown', readVerified: c.read_verified === true,
      ageHours: ageHours == null ? null : Number(ageHours.toFixed(1)), usable, note: c.note || '',
    };
  });
  rows.sort((a, b) => Number(b.usable) - Number(a.usable) || a.toolkit.localeCompare(b.toolkit));
  return {
    recordedAt: state && state.recorded_at_utc ? state.recorded_at_utc : null,
    recordedBy: state && state.recorded_by ? state.recorded_by : null,
    rows, usable: rows.filter((r) => r.usable).length, total: rows.length,
  };
}

function buildState(vault) {
  const notes = walkNotes(vault);
  let open = 0, done = 0;
  for (const n of notes) {
    if (n.size > 512 * 1024) continue;
    const t = countTasks(readText(vault, n.rel) || '');
    open += t.open; done += t.done;
  }
  const inDir = (name) => notes.filter((n) => n.rel.startsWith(name + path.sep) || n.rel.startsWith(name + '/')).length;
  const recent = [...notes].sort((a, b) => b.mtime - a.mtime);
  const weekTouches = notes.filter((n) => Date.now() - n.mtime < 7 * 86400000).length;
  const brain = getBrainVitals(vault);

  return {
    now: Date.now(),
    config: getConfig(vault),
    vitals: {
      notes: notes.length,
      inbox: inDir('00_Inbox'),
      clients: inDir('01_Clients'),
      content: inDir('03_Content'),
      sessions: inDir('10_Sessions'),
      agents: inDir('11_Agents'),
      brain: brain.entities + brain.concepts + brain.projects + brain.decisions + brain.memory + brain.protocols,
      tasksOpen: open,
      tasksDone: done,
      weekTouches,
      activity: activitySeries(notes),
    },
    brain,
    directives: getDirectives(vault),
    docs: recent.slice(0, 7).map((n) => ({ rel: n.rel, name: path.basename(n.rel, '.md'), ago: relTime(n.mtime) })),
    wire: recent.slice(0, 12).map((n) => ({ text: `${path.basename(n.rel, '.md')} touched`, ago: relTime(n.mtime) })),
    skills: getSkills(vault),
    loops: getLoopHealth(vault),
    connectors: getConnectorHealth(vault),
  };
}

module.exports = {
  BRAIN,
  FORBIDDEN_BRAIN,
  SKIP,
  walkNotes,
  readText,
  frontmatter,
  countTasks,
  activitySeries,
  section,
  getConfig,
  getDirectives,
  getSkills,
  getBrainVitals,
  getLoopHealth,
  getConnectorHealth,
  newestStamp,
  loopBand,
  LOOP_BANDS,
  requiredBrainPaths,
  assertBrainStructure,
  buildState,
};
