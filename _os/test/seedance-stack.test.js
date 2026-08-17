/**
 * Deterministic tests for the Seedance / Krea / OCR stack.
 * Run: node --test _os/test/seedance-stack.test.js
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { getSkills } = require('../vault-state');

const VAULT = path.resolve(__dirname, '..', '..');

function read(rel) {
  return fs.readFileSync(path.join(VAULT, rel), 'utf8');
}

describe('seedance stack skills', () => {
  it('registers seedance, krea-2, and mistral-ocr on the Command Deck', () => {
    const names = getSkills(VAULT).map((item) => item.name);
    for (const need of ['seedance', 'krea-2', 'mistral-ocr']) {
      assert.ok(names.includes(need), `missing skill ${need}`);
    }
    const seedance = getSkills(VAULT).find((item) => item.name === 'seedance');
    assert.match(seedance.description, /Seedance|one-take|video/i);
    assert.match(seedance.description, /Draft|draft/);
  });

  it('seedance drafts only and does not claim 4K as the live path', () => {
    const skill = read('.claude/skills/seedance/SKILL.md');
    assert.match(skill, /does \*\*not\*\* generate, publish, or spend/);
    assert.match(skill, /Tier 2/);
    assert.match(skill, /needsAuth/);
    assert.match(skill, /mcp-gate\.js/);
    assert.match(skill, /480p or\s+\*\*720p\*\*|480p\/720p|480p or 720p/);
    assert.match(skill, /Do not tell Dillon the live path outputs 4K/);
    assert.match(skill, /generate_audio/);
    assert.match(skill, /omni_reference/);
    assert.doesNotMatch(skill, /renders native 4K|outputs native 4K|live path is 4K/i);
    assert.equal(skill.includes('/motion-design') && skill.includes('CSS'), true);
  });

  it('krea-2 refuses weight downloads and keeps harvest first', () => {
    const skill = read('.claude/skills/krea-2/SKILL.md');
    assert.match(skill, /GENERATE_SIMILAR/);
    assert.match(skill, /12B/);
    assert.match(skill, /Tier 2/);
    assert.match(skill, /never as official photography/);
    assert.match(skill, /Generate nothing/);
  });

  it('mistral-ocr stops without a key and does not spend', () => {
    const skill = read('.claude/skills/mistral-ocr/SKILL.md');
    assert.match(skill, /MISTRAL_API_KEY/);
    assert.match(skill, /If it is missing, stop/);
    assert.match(skill, /Do not call the API/);
    assert.match(skill, /12_Brain\/private\//);
  });
});

describe('seedance stack vault pages', () => {
  it('INDEX lists the new wiki pages', () => {
    const index = read('12_Brain/INDEX.md');
    assert.match(index, /Seedance 2\.5/);
    assert.match(index, /Krea 2/);
    assert.match(index, /Mistral OCR 4/);
    assert.match(index, /One-Take Ad Video/);
    assert.match(index, /Honeycove Seedance Roundup/);
  });

  it('compiled pages carry source and expiry', () => {
    for (const rel of [
      '12_Brain/entities/Seedance 2.5.md',
      '12_Brain/entities/Krea 2.md',
      '12_Brain/entities/Mistral OCR 4.md',
      '12_Brain/concepts/One-Take Ad Video.md',
      '12_Brain/research/Honeycove Seedance Roundup.md',
      '12_Brain/decisions/2026-08-17 - Institute Seedance 2.5 and gated companions.md',
    ]) {
      const page = read(rel);
      assert.match(page, /source:/);
      assert.match(page, /2026-08-17 Honeycove Seedance Roundup Receipts/);
      assert.match(page, /expires: 2026-11-17/);
    }
  });

  it('decision keeps AgentWorld, Ornith, and GPT-5.6 watch-only', () => {
    const decision = read(
      '12_Brain/decisions/2026-08-17 - Institute Seedance 2.5 and gated companions.md',
    );
    assert.match(decision, /watch-only/);
    assert.match(decision, /Qwen-AgentWorld/);
    assert.match(decision, /Ornith/);
    assert.match(decision, /GPT-5\.6/);
    assert.match(decision, /Do not claim 4K/);
  });

  it('site-factory GENERATE_SIMILAR points at /krea-2', () => {
    const apply = read('_templates/site-factory/apply-harvest-images.js');
    assert.match(apply, /\/krea-2/);
    assert.match(apply, /Tier 2/);
  });
});
