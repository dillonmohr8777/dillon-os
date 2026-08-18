'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { WORKSPACE } = require('./paths');
const { loadSkills, summary } = require('./skills-loader');
const memory = require('./memory-store');

function readWorkspaceFile(name) {
  const file = path.join(WORKSPACE, name);
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8').trim() : '';
}

function estimateTokens(text) {
  return Math.ceil(String(text || '').length / 4);
}

function trimToBudget(text, tokenBudget) {
  const maxChars = Math.max(1000, tokenBudget * 4);
  if (text.length <= maxChars) return text;
  return `${text.slice(0, maxChars)}\n\n[truncated to context budget]`;
}

function buildSystemPrompt(config) {
  const skills = loadSkills();
  const parts = [
    `# ${config.product.name}`,
    config.product.sessionTag,
    config.product.line,
    'You are IMMOHRTAL CLAW, a PicoClaw-class personal agent. Use tools. Persist what matters. You are not a music product.',
    '## Soul',
    readWorkspaceFile('SOUL.md'),
    '## Agent',
    readWorkspaceFile('AGENT.md'),
    '## User',
    readWorkspaceFile('USER.md'),
    '## Identity',
    readWorkspaceFile('IDENTITY.md'),
    '## Tools',
    readWorkspaceFile('TOOLS.md'),
    '## Heartbeat',
    readWorkspaceFile('HEARTBEAT.md'),
    '## Compiled memory',
    memory.readIfExists(memory.memoryMdPath()) || '(empty)',
    '## Today',
    memory.readIfExists(memory.dailyPath()) || '(no daily notes yet)',
    '## Skills',
    summary(skills),
    '## Operating rules',
    '- Workspace tools stay inside the CLAW workspace.',
    '- Do not invent credentials, spend, publish, or send.',
    '- Prefer memory_write for durable facts, memory_search before guessing.',
    '- Name the skill you are using when a SKILL.md applies.',
  ].filter(Boolean);

  const raw = parts.join('\n\n');
  const budget = Math.floor(config.contextTokens * 0.45);
  return {
    prompt: trimToBudget(raw, budget),
    tokens: estimateTokens(raw),
    skills,
  };
}

module.exports = { buildSystemPrompt, estimateTokens, trimToBudget };
