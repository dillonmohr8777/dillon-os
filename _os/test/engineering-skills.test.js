/**
 * Engineering skill pack wiring: Matt Pocock loop adapted for Dillon OS.
 * Run: node --test _os/test/engineering-skills.test.js
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const VAULT = path.resolve(__dirname, '..', '..');

function read(rel) {
  return fs.readFileSync(path.join(VAULT, rel), 'utf8');
}

const CLAUDE_PACK = [
  'grilling', 'grill-me', 'grill-with-docs', 'domain-modeling', 'handoff',
  'tdd', 'diagnosing-bugs', 'code-review', 'to-spec', 'implement',
  'writing-for-agents', 'ask-dillon-skills', 'unslop',
];

describe('Dillon-adapted engineering skills', () => {
  it('installs every Claude skill with a SKILL.md', () => {
    for (const name of CLAUDE_PACK) {
      const p = path.join(VAULT, '.claude/skills', name, 'SKILL.md');
      assert.equal(fs.existsSync(p), true, `missing ${name}`);
      const text = fs.readFileSync(p, 'utf8');
      assert.match(text, /^---\nname: /);
    }
  });

  it('keeps interactive skills off the Command Deck', () => {
    for (const name of CLAUDE_PACK) {
      const text = read(`.claude/skills/${name}/SKILL.md`);
      assert.match(text, /command_deck:\s*false/, `${name} must set command_deck: false`);
    }
  });

  it('grilling uses the frontier interview and Dillon gates', () => {
    const text = read('.claude/skills/grilling/SKILL.md');
    assert.match(text, /design tree/i);
    assert.match(text, /frontier/i);
    assert.match(text, /approval/i);
    assert.match(text, /mattpocock\/skills/);
  });

  it('does not send specs to GitHub issues', () => {
    const spec = read('.claude/skills/to-spec/SKILL.md');
    assert.match(spec, /12_Brain\/05_Projects/);
    assert.match(spec, /Do not create GitHub issues/);
    const router = read('.claude/skills/ask-dillon-skills/SKILL.md');
    assert.match(router, /wayfinder/i);
    assert.match(router, /Not installed/i);
  });

  it('Copilot wrappers exist and point at the Claude primitives', () => {
    const grill = read('.github/skills/dillon-plan-grill/SKILL.md');
    assert.match(grill, /grilling\/SKILL\.md/);
    assert.match(grill, /Do not implement/);
    const review = read('.github/skills/dillon-code-review/SKILL.md');
    assert.match(review, /code-review\/SKILL\.md/);
    assert.match(review, /Standards/);
    assert.match(review, /Spec/);
    const unslop = read('.github/skills/dillon-unslop/SKILL.md');
    assert.match(unslop, /unslop\/SKILL\.md/);
    assert.match(unslop, /writing-rules/);
    assert.doesNotMatch(unslop, /Must always apply/);
  });

  it('unslop is a named copy pass, not an always-on rewrite', () => {
    const skill = read('.claude/skills/unslop/SKILL.md');
    assert.match(skill, /Do not treat this skill as always-on/i);
    assert.match(skill, /System\/writing-rules\.md/);
    assert.match(skill, /Do not rewrite captures/i);
    assert.match(skill, /pstack/);
    assert.doesNotMatch(skill, /Must always apply/);

    const house = read('System/writing-rules.md');
    assert.match(house, /unslop/);
    assert.match(house, /Do not treat unslop as always-on/);

    const map = read('12_Brain/09_Ops/engineering-skills.md');
    assert.match(map, /Do not treat unslop as always-on/);
  });

  it('operator map and glossary exist', () => {
    const map = read('12_Brain/09_Ops/engineering-skills.md');
    assert.match(map, /grill-with-docs/);
    assert.match(map, /command_deck: false/);
    const glossary = read('12_Brain/09_Ops/engineering-glossary.md');
    assert.match(glossary, /\*\*Frontier\*\*/);
    assert.match(glossary, /\*\*Seam\*\*/);
  });
});
