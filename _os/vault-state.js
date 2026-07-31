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

/**
 * Numbered lanes, counted separately from the compiled wiki because they hold a
 * different kind of note: immutable captures, acceptance reports, live incidents
 * and maps. Record types that the wiki already owns — decisions, projects,
 * research — deliberately have no lane; see
 * 12_Brain/decisions/2026-07-31 - One home per record type.md.
 */
const BRAIN_LANES = ['01_Captures', '07_Reviews', '09_Ops', '10_Maps'];

/**
 * Last wiki-lint result, so brain-layer drift is visible on the HUD instead of
 * only in CI. Null when the lint has never run in this checkout.
 */
function getLintHealth(vault) {
  const file = path.join(vault, BRAIN, 'state', 'wiki-lint.json');
  if (!fs.existsSync(file)) return null;
  try {
    const state = JSON.parse(fs.readFileSync(file, 'utf8'));
    const findings = Array.isArray(state.findings) ? state.findings : [];
    const countRule = (rule) => findings.filter((f) => f.rule === rule).length;
    return {
      status: state.status || 'unknown',
      errors: state.counts?.errors ?? null,
      warnings: state.counts?.warnings ?? null,
      reachable: state.counts?.reachable ?? null,
      // The re-verification queue for the next /research-sweep: pages inside the
      // expiry horizon plus any already past it. Surfaced so the sweep has a
      // visible backlog instead of only a line in CI output.
      reverify: { soon: countRule('expires-soon'), stale: countRule('expires-fresh') },
      ranAt: state.written_at || state.started_at || null,
    };
  } catch {
    return {
      status: 'unreadable',
      errors: null,
      warnings: null,
      reachable: null,
      reverify: null,
      ranAt: null,
    };
  }
}

/** Brain-layer vitals derived from the canonical 12_Brain tree. */
function getBrainVitals(vault) {
  const root = path.join(vault, BRAIN);
  const present = fs.existsSync(root) && fs.statSync(root).isDirectory();
  const forbidden = fs.existsSync(path.join(vault, FORBIDDEN_BRAIN));
  const lanes = {};
  let laneTotal = 0;
  for (const lane of BRAIN_LANES) {
    lanes[lane] = countMdIn(vault, path.join(BRAIN, lane));
    laneTotal += lanes[lane];
  }
  return {
    present,
    forbiddenRival: forbidden,
    path: BRAIN,
    entities: countMdIn(vault, path.join(BRAIN, 'entities')),
    concepts: countMdIn(vault, path.join(BRAIN, 'concepts')),
    projects: countMdIn(vault, path.join(BRAIN, 'projects')),
    decisions: countMdIn(vault, path.join(BRAIN, 'decisions')),
    research: countMdIn(vault, path.join(BRAIN, 'research')),
    memory: countMdIn(vault, path.join(BRAIN, 'memory')),
    protocols: countMdIn(vault, path.join(BRAIN, 'protocols')),
    raw: countMdIn(vault, path.join(BRAIN, 'raw')),
    lanes,
    laneTotal,
    lint: getLintHealth(vault),
    indexPresent: fs.existsSync(path.join(root, 'INDEX.md')),
  };
}

/** Required 12_Brain structure for reconcile/port completeness. */
function requiredBrainPaths() {
  return [
    '12_Brain/INDEX.md',
    '12_Brain/README.md',
    '12_Brain/Brain Map.canvas',
    '12_Brain/raw/README.md',
    '12_Brain/raw/sessions/session-log.md',
    '12_Brain/private/README.md',
    '12_Brain/entities/README.md',
    '12_Brain/concepts/README.md',
    '12_Brain/concepts/Second Brain Architecture.md',
    '12_Brain/projects/README.md',
    '12_Brain/decisions/README.md',
    '12_Brain/research/README.md',
    '12_Brain/memory/README.md',
    '12_Brain/memory/current/Brain Layer Canonical.md',
    '12_Brain/protocols/README.md',
    '12_Brain/protocols/Compiler Protocol.md',
    '12_Brain/protocols/HUD Protocol.md',
    // Each dated automation lane keeps an index so INDEX.md can link one line per
    // lane and every record stays reachable.
    ...BRAIN_LANES.map((lane) => `12_Brain/${lane}/README.md`),
    '12_Brain/registry/wiki-lint.json',
    '12_Brain/decisions/2026-07-31 - One home per record type.md',
    '12_Brain/bases/Clients.base',
    '12_Brain/bases/Projects.base',
    '12_Brain/bases/Decisions.base',
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
      brain:
        brain.entities +
        brain.concepts +
        brain.projects +
        brain.decisions +
        brain.memory +
        brain.protocols +
        brain.laneTotal,
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
  getLintHealth,
  BRAIN_LANES,
  requiredBrainPaths,
  assertBrainStructure,
  buildState,
};
