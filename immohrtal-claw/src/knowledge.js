'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { ROOT } = require('./paths');
const { assertInside } = require('./sandbox');

const DEFAULT_VAULT = path.resolve(ROOT, '..');

const ALLOW_TOP = new Set([
  'INDEX.md',
  'Dashboard.md',
  'AGENTS.md',
  'CLAUDE.md',
  '12_Brain',
  '01_Clients',
  'System',
  'Daily-Briefs',
  '04_SOPs',
  '11_Agents',
  '00_Inbox',
]);

const SKIP_DIR = new Set([
  'private',
  'node_modules',
  '.git',
  'data',
  'queue',
  'dist',
  '.next',
  'generated-stock-library',
  'font-cache',
]);

const SKIP_FILE = /\.(env|key|pem|p12|sqlite|db)$/i;

function vaultRoot() {
  return path.resolve(process.env.CLAW_VAULT_ROOT || DEFAULT_VAULT);
}

function isAllowedRel(rel) {
  const top = rel.split(/[\\/]/)[0];
  if (!ALLOW_TOP.has(top)) return false;
  const parts = rel.split(/[\\/]/);
  if (parts.some((p) => SKIP_DIR.has(p))) return false;
  if (SKIP_FILE.test(rel)) return false;
  if (rel.includes('12_Brain/private')) return false;
  return true;
}

function walkMarkdown(root, maxFiles = 1200) {
  const out = [];
  const stack = [root];
  while (stack.length && out.length < maxFiles) {
    const dir = stack.pop();
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue;
      const abs = path.join(dir, entry.name);
      const rel = path.relative(root, abs).replace(/\\/g, '/');
      if (entry.isDirectory()) {
        if (SKIP_DIR.has(entry.name)) continue;
        if (dir === root && !ALLOW_TOP.has(entry.name)) continue;
        if (rel && !isAllowedRel(rel) && !ALLOW_TOP.has(entry.name)) continue;
        stack.push(abs);
        continue;
      }
      if (!entry.name.endsWith('.md')) continue;
      if (!isAllowedRel(rel)) continue;
      out.push({ abs, rel });
      if (out.length >= maxFiles) break;
    }
  }
  return out;
}

function tokens(text) {
  return String(text || '')
    .toLowerCase()
    .split(/[^a-z0-9]+/g)
    .filter((w) => w.length > 2);
}

function searchKnowledge({ query, limit = 8 }) {
  const root = vaultRoot();
  const q = tokens(query);
  if (!q.length) return [];
  const scored = [];
  for (const file of walkMarkdown(root)) {
    let text;
    try {
      const stat = fs.statSync(file.abs);
      if (stat.size > 400_000) continue;
      text = fs.readFileSync(file.abs, 'utf8');
    } catch {
      continue;
    }
    const lower = text.toLowerCase();
    let hits = 0;
    for (const w of q) {
      if (lower.includes(w)) hits += 1;
    }
    if (!hits) continue;
    const first = lower.indexOf(q[0]);
    const start = Math.max(0, first - 180);
    scored.push({
      path: file.rel,
      score: hits + (file.rel === 'INDEX.md' ? 3 : 0),
      snippet: text.slice(start, start + 700).trim(),
    });
  }
  return scored.sort((a, b) => b.score - a.score).slice(0, limit);
}

function readKnowledge(relPath) {
  const root = vaultRoot();
  const rel = String(relPath || '').replace(/^\/+/, '');
  if (!rel || rel.includes('..')) throw new Error('path escapes knowledge base');
  if (!isAllowedRel(rel)) throw new Error('path is outside the knowledge allowlist');
  const abs = assertInside(root, rel);
  if (!fs.existsSync(abs) || fs.statSync(abs).isDirectory()) {
    throw new Error('file not found');
  }
  const text = fs.readFileSync(abs, 'utf8');
  return {
    ok: true,
    path: rel,
    bytes: text.length,
    content: text.slice(0, 80_000),
  };
}

module.exports = {
  vaultRoot,
  isAllowedRel,
  searchKnowledge,
  readKnowledge,
  walkMarkdown,
};
