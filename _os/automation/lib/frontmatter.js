'use strict';

/**
 * Minimal YAML-ish frontmatter parser/serializer for vault notes.
 * Supports flat scalars, simple arrays ([a, b]), and quoted strings.
 * Intentionally small — no dependency on js-yaml.
 */

function parseFrontmatter(text) {
  if (!text.startsWith('---\n') && !text.startsWith('---\r\n')) {
    return { data: {}, body: text, hasFence: false };
  }
  const end = text.indexOf('\n---', 4);
  if (end === -1) return { data: {}, body: text, hasFence: false };
  const raw = text.slice(4, end).replace(/\r/g, '');
  const body = text.slice(end + 4).replace(/^\r?\n/, '');
  const data = {};
  for (const line of raw.split('\n')) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const m = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!m) continue;
    const key = m[1];
    let val = m[2].trim();
    if (val === '') {
      data[key] = '';
      continue;
    }
    if (val.startsWith('[') && val.endsWith(']')) {
      const inner = val.slice(1, -1).trim();
      data[key] = inner
        ? inner.split(',').map((p) => p.trim().replace(/^["']|["']$/g, ''))
        : [];
      continue;
    }
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (val === 'true') data[key] = true;
    else if (val === 'false') data[key] = false;
    else if (/^-?\d+(\.\d+)?$/.test(val)) data[key] = Number(val);
    else data[key] = val;
  }
  return { data, body, hasFence: true };
}

function serializeValue(v) {
  if (Array.isArray(v)) {
    return '[' + v.map((x) => String(x)).join(', ') + ']';
  }
  if (typeof v === 'string') {
    if (v === '' || /[:#\[\]{}]/.test(v) || v.includes('\n')) {
      return JSON.stringify(v);
    }
    return v;
  }
  if (typeof v === 'boolean' || typeof v === 'number') return String(v);
  if (v === null || v === undefined) return '';
  return JSON.stringify(v);
}

function serializeFrontmatter(data, body) {
  const keys = Object.keys(data);
  const lines = keys.map((k) => `${k}: ${serializeValue(data[k])}`);
  return `---\n${lines.join('\n')}\n---\n${body.startsWith('\n') ? body : '\n' + body}`;
}

const REQUIRED_CLIENT_KEYS = ['status', 'last_touched', 'next_action', 'due'];

function validateClientFrontmatter(data) {
  const missing = [];
  const warnings = [];
  for (const key of REQUIRED_CLIENT_KEYS) {
    if (data[key] === undefined || data[key] === null || data[key] === '') {
      missing.push(key);
    }
  }
  if (data.due && data.due !== 'none' && !/^\d{4}-\d{2}-\d{2}/.test(String(data.due))) {
    warnings.push('due should be YYYY-MM-DD or none');
  }
  if (data.last_touched && !/^\d{4}-\d{2}-\d{2}/.test(String(data.last_touched))) {
    warnings.push('last_touched should be YYYY-MM-DD');
  }
  return {
    ok: missing.length === 0,
    missing,
    warnings,
  };
}

/**
 * Safe repair defaults — never invent due dates or next_action content.
 */
function repairDefaults(data, { today }) {
  const next = { ...data };
  const applied = [];
  if (!next.status) {
    next.status = 'active';
    applied.push('status=active');
  }
  if (!next.last_touched) {
    next.last_touched = today;
    applied.push(`last_touched=${today}`);
  }
  if (!next.next_action) {
    next.next_action = 'TBD — needs human next action';
    applied.push('next_action=TBD');
  }
  if (!next.due) {
    next.due = 'none';
    applied.push('due=none');
  }
  return { data: next, applied };
}

module.exports = {
  parseFrontmatter,
  serializeFrontmatter,
  validateClientFrontmatter,
  repairDefaults,
  REQUIRED_CLIENT_KEYS,
};
