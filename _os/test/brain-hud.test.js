/**
 * Deterministic tests for the 12_Brain layer + D.I.L.L.O.N. HUD wiring.
 * Run: node --test _os/test/brain-hud.test.js
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  BRAIN,
  FORBIDDEN_BRAIN,
  assertBrainStructure,
  buildState,
  getBrainVitals,
  getSkills,
  requiredBrainPaths,
} = require('../vault-state');

const VAULT = path.resolve(__dirname, '..', '..');

describe('12_Brain canonical structure', () => {
  it('does not create a competing 1Z_Brain tree', () => {
    assert.equal(fs.existsSync(path.join(VAULT, FORBIDDEN_BRAIN)), false);
  });

  it('has the required 12_Brain paths', () => {
    const result = assertBrainStructure(VAULT);
    assert.equal(result.forbiddenRival, false);
    assert.deepEqual(result.missing, [], `missing: ${result.missing.join(', ')}`);
    assert.equal(result.ok, true);
  });

  it('requiredBrainPaths covers Bases, templates, protocols, memory, skills, rules', () => {
    const paths = requiredBrainPaths().join('\n');
    assert.match(paths, /bases\/Clients\.base/);
    assert.match(paths, /bases\/Projects\.base/);
    assert.match(paths, /bases\/Decisions\.base/);
    assert.match(paths, /templates\/Project\.md/);
    assert.match(paths, /memory\/current\//);
    assert.match(paths, /protocols\//);
    assert.match(paths, /vault-compile/);
    assert.match(paths, /vault-conventions\.mdc/);
    assert.match(paths, /routine-health\.md/);
  });

  it('skills and SessionEnd hook point at 12_Brain, not root raw/', () => {
    const compile = fs.readFileSync(path.join(VAULT, '.claude/skills/vault-compile/SKILL.md'), 'utf8');
    assert.match(compile, /12_Brain\/raw\//);
    assert.match(compile, /12_Brain\/entities\//);
    assert.match(compile, /12_Brain\/INDEX\.md/);
    assert.equal(compile.includes('`raw/`'), false, 'skill must not use unprefixed `raw/`');

    const settings = JSON.parse(fs.readFileSync(path.join(VAULT, '.claude/settings.json'), 'utf8'));
    const cmd = settings.hooks.SessionEnd[0].hooks[0].command;
    assert.match(cmd, /12_Brain\/raw\/sessions\/session-log\.md/);
    assert.doesNotMatch(cmd, /\$CLAUDE_PROJECT_DIR\/raw\//);
  });

  it('Clients.base still queries 01_Clients (working vault)', () => {
    const base = fs.readFileSync(path.join(VAULT, '12_Brain/bases/Clients.base'), 'utf8');
    assert.match(base, /file\.inFolder\("01_Clients"\)/);
  });
});

describe('D.I.L.L.O.N. HUD vault state', () => {
  it('buildState exposes brain vitals from 12_Brain', () => {
    const state = buildState(VAULT);
    assert.ok(state.brain);
    assert.equal(state.brain.path, BRAIN);
    assert.equal(state.brain.present, true);
    assert.equal(state.brain.forbiddenRival, false);
    assert.equal(state.brain.indexPresent, true);
    assert.ok(state.brain.entities >= 1);
    assert.ok(state.brain.concepts >= 1);
    assert.ok(state.brain.decisions >= 1);
    assert.ok(state.brain.memory >= 1);
    assert.ok(state.brain.protocols >= 1);
    assert.ok(typeof state.vitals.brain === 'number');
    assert.ok(state.vitals.brain >= state.brain.entities);
  });

  it('getBrainVitals matches filesystem counts', () => {
    const b = getBrainVitals(VAULT);
    const entitiesDir = path.join(VAULT, '12_Brain/entities');
    const md = fs.readdirSync(entitiesDir).filter((f) => f.endsWith('.md')).length;
    assert.equal(b.entities, md);
  });

  it('Command Deck includes brain loop skills', () => {
    const names = getSkills(VAULT).map((s) => s.name);
    for (const need of ['vault-compile', 'wiki-lint', 'synthesize', 'session-mine', 'research-sweep']) {
      assert.ok(names.includes(need), `missing skill ${need}`);
    }
  });

  it('preserves Dashboard Today directives for the HUD', () => {
    const state = buildState(VAULT);
    assert.ok(state.directives.length >= 1);
    assert.ok(state.directives.some((d) => d.source === 'Dashboard.md'));
  });
});
