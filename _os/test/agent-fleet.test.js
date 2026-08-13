/**
 * Deterministic checks for the 15-agent fleet, 54-routine map, and 22-repo map.
 * Run: node --test _os/test/agent-fleet.test.js
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const VAULT = path.resolve(__dirname, '..', '..');
const REGISTRY = path.join(VAULT, '12_Brain/registry/agent-fleet.json');

function load() {
  return JSON.parse(fs.readFileSync(REGISTRY, 'utf8'));
}

function exists(rel) {
  return fs.existsSync(path.join(VAULT, rel));
}

describe('agent fleet registry', () => {
  it('parses and matches the proven 15 / 54 / 22 counts', () => {
    const fleet = load();
    assert.equal(fleet.chain.length, 15);
    assert.equal(fleet.routines.length, 54);
    assert.equal(fleet.repos.length, 22);
    assert.equal(fleet.honesty.routines_proven, 54);
    assert.equal(fleet.honesty.github_repos_enumerable, 16);
    assert.equal(fleet.honesty.in_vault_codebases, 6);
    assert.equal(fleet.max_invoke_depth, 2);
    assert.equal(fleet.pattern, 'supervisor');
  });

  it('has unique callsigns, chain ids 1-15, and unique routine numbers', () => {
    const fleet = load();
    const callsigns = [
      ...fleet.chain.map((a) => a.callsign),
      ...fleet.surfaces.map((a) => a.callsign),
    ];
    assert.equal(new Set(callsigns).size, callsigns.length);
    const ids = fleet.chain.map((a) => a.id).sort((a, b) => a - b);
    assert.deepEqual(ids, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
    const nums = fleet.routines.map((r) => r.n).sort((a, b) => a - b);
    assert.deepEqual(nums, Array.from({ length: 54 }, (_, i) => i + 1));
    const repoNums = fleet.repos.map((r) => r.n).sort((a, b) => a - b);
    assert.deepEqual(repoNums, Array.from({ length: 22 }, (_, i) => i + 1));
  });

  it('every chain and surface file plus Cursor invocable exists', () => {
    const fleet = load();
    const missing = [];
    for (const agent of [...fleet.chain, ...fleet.surfaces]) {
      if (!exists(agent.file)) missing.push(agent.file);
      if (!exists(agent.cursor_agent)) missing.push(agent.cursor_agent);
    }
    assert.deepEqual(missing, []);
  });

  it('every routine and repo owner is a known callsign', () => {
    const fleet = load();
    const known = new Set([
      ...fleet.chain.map((a) => a.callsign),
      ...fleet.surfaces.map((a) => a.callsign),
    ]);
    const badRoutines = fleet.routines.filter((r) => !known.has(r.owner)).map((r) => r.id);
    const badRepos = fleet.repos.filter((r) => !known.has(r.owner)).map((r) => r.id);
    assert.deepEqual(badRoutines, []);
    assert.deepEqual(badRepos, []);
  });

  it('alias agents point at a real chain callsign', () => {
    const fleet = load();
    const callsigns = new Set(fleet.chain.map((a) => a.callsign));
    for (const agent of fleet.chain) {
      if (agent.alias_of) assert.ok(callsigns.has(agent.alias_of), agent.callsign);
    }
    const ari = fleet.chain.find((a) => a.callsign === 'ari');
    const remy = fleet.chain.find((a) => a.callsign === 'remy');
    assert.equal(ari.alias_of, 'ads');
    assert.equal(remy.alias_of, 'reporting');
  });
});

describe('agent fleet wiki wiring', () => {
  it('INDEX, protocol, decision, and maps exist and mention the fleet', () => {
    const index = fs.readFileSync(path.join(VAULT, '12_Brain/INDEX.md'), 'utf8');
    assert.match(index, /Fleet Roster/);
    assert.match(index, /Agent Fleet/);
    assert.match(index, /Routine Map/);
    assert.match(index, /Repo Map/);

    assert.equal(exists('12_Brain/protocols/Agent Fleet Protocol.md'), true);
    assert.equal(exists('12_Brain/entities/Agent Fleet.md'), true);
    assert.equal(exists('11_Agents/Fleet Roster.md'), true);
    assert.equal(exists('11_Agents/Routine Map.md'), true);
    assert.equal(exists('11_Agents/Repo Map.md'), true);
    assert.equal(
      exists('12_Brain/decisions/2026-08-12 - 15-agent fleet is the operational chain.md'),
      true,
    );
  });

  it('does not create a competing 1Z_Brain tree', () => {
    assert.equal(fs.existsSync(path.join(VAULT, '1Z_Brain')), false);
  });

  it('Master Agent delegations include the chain callsigns', () => {
    const master = fs.readFileSync(path.join(VAULT, '11_Agents/Master Agent.md'), 'utf8');
    for (const need of ['orchestrator', 'leo', 'cora', 'calvin', 'sage', 'piper', 'guardrail', 'align']) {
      assert.match(master, new RegExp('`' + need + '`'));
    }
  });
});
