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
  getAllSkills,
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
    assert.match(paths, /Bases\/Clients\.base/);
    assert.match(paths, /Bases\/Projects\.base/);
    assert.match(paths, /Bases\/Decisions\.base/);
    assert.match(paths, /templates\/Project\.md/);
    assert.match(paths, /08_Memory\/current\//);
    assert.match(paths, /protocols\//);
    assert.match(paths, /vault-compile/);
    assert.match(paths, /vault-conventions\.mdc/);
    assert.match(paths, /routine-health\.md/);
  });

  // The numbered taxonomy is canonical (2026-08-17). The retired lowercase tree
  // (raw/, entities/, concepts/, decisions/, projects/, research/, memory/,
  // bases/) must not come back: a second tree is invisible to the Bases.
  it('skills and SessionEnd hook point at the numbered 12_Brain tree', () => {
    const compile = fs.readFileSync(path.join(VAULT, '.claude/skills/vault-compile/SKILL.md'), 'utf8');
    assert.match(compile, /12_Brain\/01_Captures\//);
    assert.match(compile, /12_Brain\/02_Entities\//);
    assert.match(compile, /12_Brain\/INDEX\.md/);
    assert.equal(compile.includes('`raw/`'), false, 'skill must not use unprefixed `raw/`');

    const settings = JSON.parse(fs.readFileSync(path.join(VAULT, '.claude/settings.json'), 'utf8'));
    const cmd = settings.hooks.SessionEnd[0].hooks[0].command;
    assert.match(cmd, /12_Brain\/01_Captures\/sessions\/session-log\.md/);
    assert.doesNotMatch(cmd, /\$CLAUDE_PROJECT_DIR\/raw\//);
  });

  it('no retired lowercase brain tree exists', () => {
    for (const dir of ['raw', 'entities', 'concepts', 'decisions', 'projects', 'research', 'memory']) {
      const p = path.join(VAULT, BRAIN, dir);
      // Case-insensitive on Windows, so compare the real on-disk name too.
      if (!fs.existsSync(p)) continue;
      const actual = fs.readdirSync(path.join(VAULT, BRAIN)).find((e) => e.toLowerCase() === dir);
      assert.notEqual(actual, dir, `retired tree present: ${BRAIN}/${dir}`);
    }
  });

  it('Clients.base still queries 01_Clients (working vault)', () => {
    const base = fs.readFileSync(path.join(VAULT, '12_Brain/Bases/Clients.base'), 'utf8');
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
    const entitiesDir = path.join(VAULT, '12_Brain/02_Entities');
    const md = fs.readdirSync(entitiesDir).filter((f) => f.endsWith('.md')).length;
    assert.equal(b.entities, md);
  });

  it('Command Deck includes brain loop skills', () => {
    const names = getSkills(VAULT).map((s) => s.name);
    for (const need of ['vault-compile', 'wiki-lint', 'synthesize', 'session-mine', 'research-sweep']) {
      assert.ok(names.includes(need), `missing skill ${need}`);
    }
  });

  it('engineering skill pack is installed and stays off the Command Deck', () => {
    const needed = [
      'grilling', 'grill-me', 'grill-with-docs', 'domain-modeling', 'handoff',
      'tdd', 'diagnosing-bugs', 'code-review', 'to-spec', 'implement',
      'writing-for-agents', 'ask-dillon-skills',
    ];
    const all = getAllSkills(VAULT).map((s) => s.name);
    const deck = getSkills(VAULT).map((s) => s.name);
    for (const name of needed) {
      assert.ok(all.includes(name), `missing skill ${name}`);
      assert.equal(deck.includes(name), false, `${name} must not be a HUD one-click job`);
    }
  });

  it('preserves Dashboard Today directives for the HUD', () => {
    const state = buildState(VAULT);
    assert.ok(state.directives.length >= 1);
    assert.ok(state.directives.some((d) => d.source === 'Dashboard.md'));
  });
});
