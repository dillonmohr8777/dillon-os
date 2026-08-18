'use strict';

/**
 * Subset TOML reader for the Windows scheduler source (`automation.toml`).
 *
 * Zero npm dependencies. Supports the shapes the heartbeat actually needs:
 * tables, array-of-tables, dotted keys, quoted keys, strings, booleans,
 * numbers, and simple arrays. Not a complete TOML implementation.
 *
 * Routine buckets: routines / jobs / tasks / automations (object or array).
 * 12-hex-suffixed sibling directories are shadows of a known routine id.
 */

const fs = require('fs');
const path = require('path');

const DEFAULT_SCHEDULER_TOML = Object.freeze([
  'automation.toml',
  '_os/automation/automation.toml',
  '_os/scheduler/automation.toml',
  '12_Brain/registry/automation.toml',
]);

const ROUTINE_BUCKETS = Object.freeze([
  'routines',
  'jobs',
  'tasks',
  'automations',
  'routine',
  'job',
]);

const SHADOW_DIR_RE = /^(.+)-([0-9a-f]{12})$/i;

function posix(rel) {
  return String(rel || '').split(path.sep).join('/');
}

function stripComment(line) {
  let inSingle = false;
  let inDouble = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '\\' && inDouble) {
      i += 1;
      continue;
    }
    if (ch === "'" && !inDouble) inSingle = !inSingle;
    else if (ch === '"' && !inSingle) inDouble = !inDouble;
    else if (ch === '#' && !inSingle && !inDouble) return line.slice(0, i);
  }
  return line;
}

function unescapeString(text) {
  return text
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(/\\r/g, '\r')
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\');
}

function parseScalar(raw) {
  const text = String(raw || '').trim();
  if (text === 'true') return true;
  if (text === 'false') return false;
  if (text === 'null') return null;
  if (/^-?\d+(\.\d+)?$/.test(text)) return Number(text);
  if (
    (text.startsWith('"') && text.endsWith('"') && text.length >= 2)
    || (text.startsWith("'") && text.endsWith("'") && text.length >= 2)
  ) {
    const inner = text.slice(1, -1);
    return text.startsWith('"') ? unescapeString(inner) : inner;
  }
  if (text.startsWith('[') && text.endsWith(']')) {
    const inner = text.slice(1, -1).trim();
    if (!inner) return [];
    return splitTopLevel(inner, ',').map((part) => parseScalar(part));
  }
  return text;
}

function splitTopLevel(text, sep) {
  const parts = [];
  let current = '';
  let inSingle = false;
  let inDouble = false;
  let depth = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '\\' && inDouble) {
      current += ch + (text[i + 1] || '');
      i += 1;
      continue;
    }
    if (ch === "'" && !inDouble) inSingle = !inSingle;
    else if (ch === '"' && !inSingle) inDouble = !inDouble;
    else if (!inSingle && !inDouble) {
      if (ch === '[') depth += 1;
      else if (ch === ']') depth -= 1;
      else if (ch === sep && depth === 0) {
        parts.push(current);
        current = '';
        continue;
      }
    }
    current += ch;
  }
  if (current.trim()) parts.push(current);
  return parts;
}

function parseKeyPath(raw) {
  const text = String(raw || '').trim();
  const parts = [];
  let current = '';
  let inSingle = false;
  let inDouble = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === "'" && !inDouble) {
      inSingle = !inSingle;
      continue;
    }
    if (ch === '"' && !inSingle) {
      inDouble = !inDouble;
      continue;
    }
    if (ch === '.' && !inSingle && !inDouble) {
      if (current) parts.push(current);
      current = '';
      continue;
    }
    current += ch;
  }
  if (current) parts.push(current);
  return parts;
}

function ensureObject(parent, key) {
  if (parent[key] == null || typeof parent[key] !== 'object' || Array.isArray(parent[key])) {
    parent[key] = {};
  }
  return parent[key];
}

function navigate(root, keys, { asArrayTable = false } = {}) {
  let cursor = root;
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const last = i === keys.length - 1;
    if (last && asArrayTable) {
      if (!Array.isArray(cursor[key])) cursor[key] = [];
      const row = {};
      cursor[key].push(row);
      return row;
    }
    if (Array.isArray(cursor[key])) {
      cursor = cursor[key][cursor[key].length - 1] || ensureObject(cursor, key);
    } else {
      cursor = ensureObject(cursor, key);
    }
  }
  return cursor;
}

function parseTomlSubset(text) {
  const root = {};
  let current = root;
  const lines = String(text || '').replace(/^\uFEFF/, '').split(/\r?\n/);
  for (const original of lines) {
    const line = stripComment(original).trim();
    if (!line) continue;
    if (line.startsWith('[[') && line.endsWith(']]')) {
      const keys = parseKeyPath(line.slice(2, -2));
      current = navigate(root, keys, { asArrayTable: true });
      continue;
    }
    if (line.startsWith('[') && line.endsWith(']')) {
      const keys = parseKeyPath(line.slice(1, -1));
      current = navigate(root, keys);
      continue;
    }
    const eq = line.indexOf('=');
    if (eq < 1) continue;
    const keys = parseKeyPath(line.slice(0, eq));
    const value = parseScalar(line.slice(eq + 1));
    if (!keys.length) continue;
    let cursor = current;
    for (let i = 0; i < keys.length - 1; i++) cursor = ensureObject(cursor, keys[i]);
    cursor[keys[keys.length - 1]] = value;
  }
  return root;
}

function normalizeStatus(body) {
  if (body == null || typeof body !== 'object') return 'ACTIVE';
  if (body.status != null && String(body.status).trim()) {
    return String(body.status).trim().toUpperCase();
  }
  if (body.state != null && String(body.state).trim()) {
    return String(body.state).trim().toUpperCase();
  }
  if (body.enabled === false || body.active === false) return 'PAUSED';
  return 'ACTIVE';
}

function isPausedStatus(status) {
  return ['PAUSED', 'DISABLED', 'STOPPED', 'RETIRED', 'INACTIVE'].includes(String(status || '').toUpperCase());
}

function asRoutine(id, body, source) {
  if (!id) return null;
  const record = (body && typeof body === 'object' && !Array.isArray(body)) ? body : {};
  const status = normalizeStatus(record);
  const command = record.command || record.cmd || record.script || null;
  return {
    id: String(id),
    name: record.name || record.title || String(id),
    status,
    command,
    source,
    path: record.path || command || source,
    kind: 'scheduler',
    active: !isPausedStatus(status),
  };
}

function routinesFromParsed(data, source) {
  const out = [];
  if (!data || typeof data !== 'object' || Array.isArray(data)) return out;
  for (const bucket of ROUTINE_BUCKETS) {
    const node = data[bucket];
    if (node == null) continue;
    if (Array.isArray(node)) {
      for (const item of node) {
        if (!item || typeof item !== 'object' || Array.isArray(item)) continue;
        const id = item.id || item.name || item.key;
        const routine = asRoutine(id, item, source);
        if (routine) out.push(routine);
      }
    } else if (typeof node === 'object') {
      for (const [id, body] of Object.entries(node)) {
        const routine = asRoutine(id, body, source);
        if (routine) out.push(routine);
      }
    }
  }
  if (out.length) return out;
  for (const [id, body] of Object.entries(data)) {
    if (!body || typeof body !== 'object' || Array.isArray(body)) continue;
    if (body.status == null && body.state == null && body.enabled == null && body.schedule == null) {
      continue;
    }
    const routine = asRoutine(id, body, source);
    if (routine) out.push(routine);
  }
  return out;
}

function parseSchedulerToml(text, source) {
  const data = parseTomlSubset(text);
  return routinesFromParsed(data, source || 'automation.toml');
}

function loadSchedulerTomlFile(file, root) {
  const text = fs.readFileSync(file, 'utf8');
  const rel = posix(path.relative(root, file));
  return parseSchedulerToml(text, rel);
}

function listImmediateDirs(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter((ent) => ent.isDirectory())
    .map((ent) => ({ name: ent.name, full: path.join(dir, ent.name) }));
}

function collectShadowDefinitions(dir, knownIds, root) {
  const out = [];
  const known = new Set([...knownIds].map((id) => String(id).toLowerCase()));
  if (!known.size) return out;
  for (const ent of listImmediateDirs(dir)) {
    const match = ent.name.match(SHADOW_DIR_RE);
    if (!match) continue;
    const canonical = match[1];
    if (!known.has(canonical.toLowerCase())) continue;
    const rel = posix(path.relative(root, ent.full));
    out.push({
      id: canonical,
      name: canonical,
      status: 'ACTIVE',
      command: null,
      source: rel,
      path: rel,
      kind: 'shadow',
      active: true,
      shadow: true,
    });
  }
  return out;
}

function resolveSchedulerSource(root, definitionsDir) {
  if (definitionsDir) {
    const full = path.isAbsolute(definitionsDir)
      ? definitionsDir
      : path.join(root, definitionsDir);
    const rel = posix(path.relative(root, full) || definitionsDir);
    if (!fs.existsSync(full)) {
      return {
        status: 'absent',
        path: rel,
        dir: null,
        reason: `path not found: ${rel}`,
      };
    }
    const stat = fs.statSync(full);
    if (stat.isFile()) {
      return {
        status: 'present',
        path: posix(path.relative(root, full)),
        dir: path.dirname(full),
        reason: null,
      };
    }
    const named = ['automation.toml', 'scheduler.toml']
      .map((name) => path.join(full, name))
      .find((candidate) => fs.existsSync(candidate));
    return {
      status: 'present',
      path: named ? posix(path.relative(root, named)) : rel,
      dir: full,
      reason: null,
    };
  }

  for (const rel of DEFAULT_SCHEDULER_TOML) {
    const full = path.join(root, rel);
    if (fs.existsSync(full) && fs.statSync(full).isFile()) {
      return {
        status: 'present',
        path: posix(rel),
        dir: path.dirname(full),
        reason: null,
      };
    }
  }
  return {
    status: 'absent',
    path: null,
    dir: null,
    reason: 'no automation.toml in default locations',
  };
}

module.exports = {
  DEFAULT_SCHEDULER_TOML,
  SHADOW_DIR_RE,
  parseTomlSubset,
  parseSchedulerToml,
  loadSchedulerTomlFile,
  collectShadowDefinitions,
  resolveSchedulerSource,
  routinesFromParsed,
};
