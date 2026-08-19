'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../../..');

test('unslop and grill-me skills exist so slash commands resolve', () => {
  const files = [
    '.claude/skills/unslop/SKILL.md',
    '.claude/skills/grill-me/SKILL.md',
    '.github/skills/unslop/SKILL.md',
    '.github/skills/grill-me/SKILL.md',
    '.github/skills/dillon-plan-grill/SKILL.md',
  ];
  for (const rel of files) {
    const text = fs.readFileSync(path.join(ROOT, rel), 'utf8');
    assert.match(text, /^---\nname: /);
    assert.match(text, /\ndescription: /);
  }
  const unslop = fs.readFileSync(path.join(ROOT, '.claude/skills/unslop/SKILL.md'), 'utf8');
  assert.match(unslop, /run\.js --treat/);
  assert.match(unslop, /Prohibited[\s\S]*Netlify deploy/);
  assert.doesNotMatch(unslop, /netlify deploy --prod/i);
  const grill = fs.readFileSync(path.join(ROOT, '.claude/skills/grill-me/SKILL.md'), 'utf8');
  assert.match(grill, /\/grilling/);
});
