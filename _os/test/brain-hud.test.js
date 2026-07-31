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
  BRAIN_LANES,
  FORBIDDEN_BRAIN,
  assertBrainStructure,
  buildState,
  getBrainVitals,
  getLintHealth,
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
    assert.match(paths, /registry\/wiki-lint\.json/);
  });

  it('every numbered lane keeps an index INDEX.md can link', () => {
    const paths = requiredBrainPaths();
    for (const lane of BRAIN_LANES) {
      assert.ok(paths.includes(`12_Brain/${lane}/README.md`), `${lane} missing from required paths`);
    }
  });

  it('INDEX.md links every numbered lane index', () => {
    const index = fs.readFileSync(path.join(VAULT, '12_Brain/INDEX.md'), 'utf8');
    for (const lane of BRAIN_LANES) {
      assert.ok(index.includes(`12_Brain/${lane}/README`), `INDEX.md does not link ${lane}`);
    }
  });

  it('no numbered lane duplicates a record type the wiki already owns', () => {
    // The 04_Decisions / 05_Projects / 06_Research lanes were retired because two
    // homes for one record type meant no single place to read the truth.
    // See 12_Brain/decisions/2026-07-31 - One home per record type.md.
    for (const retired of ['04_Decisions', '05_Projects', '06_Research']) {
      assert.equal(
        fs.existsSync(path.join(VAULT, '12_Brain', retired)),
        false,
        `${retired} duplicates a wiki folder and must not come back`,
      );
      assert.ok(!BRAIN_LANES.includes(retired));
    }
    for (const canonical of ['decisions', 'projects', 'research']) {
      assert.ok(fs.existsSync(path.join(VAULT, '12_Brain', canonical)));
    }
  });

  it('Experiment Queue and Projects Bases point at the migrated folders', () => {
    const experiments = fs.readFileSync(path.join(VAULT, '12_Brain/bases/Experiment Queue.base'), 'utf8');
    assert.match(experiments, /12_Brain\/projects\/Experiments/);
    assert.doesNotMatch(experiments, /05_Projects/);

    const projects = fs.readFileSync(path.join(VAULT, '12_Brain/bases/Projects.base'), 'utf8');
    assert.match(projects, /file\.inFolder\("12_Brain\/projects"\)/);
    assert.match(projects, /not:/, 'Projects.base must exclude Experiments/');
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

  it('counts the dated automation lanes, not just the compiled wiki', () => {
    const b = getBrainVitals(VAULT);
    for (const lane of BRAIN_LANES) {
      assert.ok(b.lanes[lane] >= 1, `lane ${lane} should hold at least its index`);
    }
    const summed = BRAIN_LANES.reduce((n, lane) => n + b.lanes[lane], 0);
    assert.equal(b.laneTotal, summed);
    assert.ok(buildState(VAULT).vitals.brain >= b.laneTotal);
  });

  it('surfaces the last wiki-lint result so drift is visible on the HUD', () => {
    const lint = getLintHealth(VAULT);
    assert.ok(lint, 'expected 12_Brain/state/wiki-lint.json from a lint run');
    assert.ok(['ok', 'warn', 'fail'].includes(lint.status), `unexpected status ${lint.status}`);
    assert.equal(lint.errors, 0, 'committed state should record a brain layer with no lint errors');
    assert.ok(lint.reachable > 0);
  });

  it('surfaces the re-verification queue so the sweep has a visible backlog', () => {
    const { reverify } = getLintHealth(VAULT);
    assert.ok(reverify, 'lint health should carry a re-verification queue');
    assert.equal(typeof reverify.soon, 'number');
    assert.equal(typeof reverify.stale, 'number');
    assert.equal(reverify.stale, 0, 'no page should be sitting past its expires: date');
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
