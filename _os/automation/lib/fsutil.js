'use strict';

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '../../..');

function repoPath(...parts) {
  return path.join(REPO_ROOT, ...parts);
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

/**
 * Resolve a repo-relative path, refusing anything that escapes the repository.
 * Vault paths are authored on Windows desktops and consumed by Linux agents, so
 * `\` counts as a separator on every platform — otherwise `..\outside` reads as
 * one harmless filename on Linux and slips past the boundary.
 */
function resolveInsideRepo(candidate, label = 'Path') {
  const normalized = String(candidate == null || candidate === '' ? '.' : candidate).replace(/\\/g, '/');
  const root = path.resolve(REPO_ROOT);
  const absolute = path.resolve(root, normalized);
  if (absolute !== root && !absolute.startsWith(`${root}${path.sep}`)) {
    throw new Error(`${label} escapes repository: ${candidate}`);
  }
  return absolute;
}

function readJson(file, fallback = null) {
  if (!fs.existsSync(file)) return fallback;
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, data) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
}

function appendJsonl(file, row) {
  ensureDir(path.dirname(file));
  fs.appendFileSync(file, JSON.stringify(row) + '\n');
}

function walkMarkdown(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walkMarkdown(full, acc);
    else if (ent.isFile() && ent.name.endsWith('.md')) acc.push(full);
  }
  return acc;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function nowISO() {
  return new Date().toISOString();
}

function slugify(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

module.exports = {
  REPO_ROOT,
  repoPath,
  ensureDir,
  resolveInsideRepo,
  readJson,
  writeJson,
  appendJsonl,
  walkMarkdown,
  todayISO,
  nowISO,
  slugify,
};
