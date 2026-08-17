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

function todayISO(date = new Date(), timeZone = process.env.DILLON_TIMEZONE || 'America/New_York') {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
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
  readJson,
  writeJson,
  appendJsonl,
  walkMarkdown,
  todayISO,
  nowISO,
  slugify,
};
