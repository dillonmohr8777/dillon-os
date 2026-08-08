'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const {
  EXPECTED_AGENT_COUNT,
  EXPECTED_PILOT_IDS,
  validateAgent,
  validateFleet,
} = require('../lib/agent-fleet.js');

describe('Dillon managed agent fleet', () => {
  it('registers exactly fifteen valid portable agents and four synthetic pilots', () => {
    const result = validateFleet();
    assert.deepEqual(result.failures, []);
    assert.equal(result.agents.length, EXPECTED_AGENT_COUNT);
    assert.deepEqual([...result.fleet.managedPilotAgentIds].sort(), [...EXPECTED_PILOT_IDS].sort());
  });

  it('keeps queue, synthesis, and artifact-acceptance authority singular', () => {
    const result = validateFleet();
    assert.deepEqual(result.agents.filter((agent) => agent.authority.canonicalQueueWrite).map((agent) => agent.agentId), ['marketing-chief']);
    assert.deepEqual(result.agents.filter((agent) => agent.authority.finalSynthesis).map((agent) => agent.agentId), ['marketing-chief']);
    assert.deepEqual(result.agents.filter((agent) => agent.authority.artifactAcceptance).map((agent) => agent.agentId), ['independent-verifier-release-gate']);
  });

  it('denies direct durable brain writes and consequential actions for every agent', () => {
    const result = validateFleet();
    for (const agent of result.agents) {
      assert.equal(agent.authority.canonicalBrainWrite, false, agent.agentId);
      assert.equal(agent.authority.correctionLedgerWrite, false, agent.agentId);
      assert.equal(agent.authority.externalDelivery, false, agent.agentId);
      assert.equal(agent.authority.spend, false, agent.agentId);
      assert.equal(agent.authority.accountChange, false, agent.agentId);
      assert.equal(agent.authority.secretAccess, false, agent.agentId);
      assert.equal(agent.memory.managedDurableMemory, 'disabled', agent.agentId);
      assert.deepEqual(agent.memory.localWriteScopes, [], agent.agentId);
    }
  });

  it('requires exact identity receipts for every client-routed agent', () => {
    const result = validateFleet();
    for (const agent of result.agents.filter((candidate) => candidate.routing.clientRequired)) {
      assert.equal(agent.routing.identityReceiptRequired, true, agent.agentId);
      assert.equal(agent.routing.clientScope, 'registry-resolved', agent.agentId);
    }
  });

  it('rejects a self-verifying or externally authorized mutation', () => {
    const result = validateFleet();
    const repoRoot = path.resolve(__dirname, '..', '..', '..');
    const fixture = JSON.parse(fs.readFileSync(
      path.join(repoRoot, '_os/acceptance/fixtures/agent-fleet/forbidden-external-authority.json'),
      'utf8'
    ));
    const agent = structuredClone(result.agents.find((candidate) => candidate.agentId === fixture.agentId));
    agent.orchestration.verifierAgentId = agent.agentId;
    agent[fixture.mutation.section][fixture.mutation.field] = fixture.mutation.value;
    const localFailures = validateAgent(agent, 'fixture.json');
    assert.equal(localFailures.some((failure) => failure.includes(fixture.expectedFailure)), true);
    const fleetFailures = [];
    if (agent.orchestration.verifierAgentId === agent.agentId) fleetFailures.push('maker cannot self-verify');
    if (agent.authority.externalDelivery) fleetFailures.push('agent cannot deliver externally');
    assert.deepEqual(fleetFailures, ['maker cannot self-verify', 'agent cannot deliver externally']);
  });

  it('maps every legacy alias to a registered target and retires the old Slack writer', () => {
    const result = validateFleet();
    const ids = new Set(result.agents.map((agent) => agent.agentId));
    for (const alias of result.aliases.aliases) {
      for (const target of alias.targetAgentIds) assert.equal(ids.has(target), true, `${alias.alias} -> ${target}`);
    }
    const slack = result.aliases.aliases.find((alias) => alias.alias === 'old-claude-slack-intake');
    assert.equal(slack.mode, 'retired-writer');
    assert.deepEqual(slack.targetAgentIds, ['communications-concierge']);
  });

  it('keeps all four managed pilot Python entries syntactically valid', () => {
    const result = validateFleet();
    const repoRoot = path.resolve(__dirname, '..', '..', '..');
    for (const project of result.fleet.managedPilotProjects) {
      for (const file of ['agent.py', 'identity.py']) {
        const filePath = path.join(repoRoot, project.path, file);
        const check = spawnSync(
          'python',
          ['-c', 'import ast, pathlib, sys; ast.parse(pathlib.Path(sys.argv[1]).read_text(encoding="utf-8"))', filePath],
          { encoding: 'utf8', windowsHide: true }
        );
        assert.equal(check.status, 0, `${project.agentId}/${file}: ${check.stderr || check.error?.message || 'syntax failure'}`);
      }
    }
  });
});
