'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { WORKSPACE } = require('./paths');

function parseFrontmatter(text) {
  if (!text.startsWith('---\n')) return { meta: {}, body: text };
  const end = text.indexOf('\n---\n', 4);
  if (end < 0) return { meta: {}, body: text };
  const raw = text.slice(4, end);
  const body = text.slice(end + 5).trim();
  const meta = {};
  for (const line of raw.split('\n')) {
    const idx = line.indexOf(':');
    if (idx < 0) continue;
    meta[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }
  return { meta, body };
}

function loadSkills(root = path.join(WORKSPACE, 'skills')) {
  if (!fs.existsSync(root)) return [];
  const skills = [];
  for (const dir of fs.readdirSync(root, { withFileTypes: true })) {
    if (!dir.isDirectory()) continue;
    const skillPath = path.join(root, dir.name, 'SKILL.md');
    if (!fs.existsSync(skillPath)) continue;
    const text = fs.readFileSync(skillPath, 'utf8');
    const { meta, body } = parseFrontmatter(text);
    skills.push({
      id: dir.name,
      name: meta.name || dir.name,
      description: (meta.description || '').replace(/\s+/g, ' ').trim(),
      body,
      path: skillPath,
    });
  }
  return skills.sort((a, b) => a.id.localeCompare(b.id));
}

function summary(skills) {
  if (!skills.length) return '(no skills installed)';
  return skills.map((s) => `- ${s.id}: ${s.description || s.name}`).join('\n');
}

module.exports = { parseFrontmatter, loadSkills, summary };
