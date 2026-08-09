'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { runFleetMuster } = require('../lib/fleet-muster.js');
const { validateFleet } = require('../lib/agent-fleet.js');
const { sha256File, validateManifest } = require('../lib/agent-runtime.js');

const repoRoot = path.resolve(__dirname, '..', '..', '..');
const scenarioPath = path.join(repoRoot, '_os/automation/fixtures/fleet-muster/scenario-v1.json');

function tempRoot() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'fleet-muster-'));
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeScenario(root, mutate) {
  const scenario = readJson(scenarioPath);
  mutate(scenario);
  const target = path.join(root, 'scenario.json');
  fs.writeFileSync(target, `${JSON.stringify(scenario, null, 2)}\n`, 'utf8');
  return target;
}

describe('Fleet contract simulation v1', () => {
  it('simulates all fifteen role contracts with bounded waves, evidence, traps, and independent acceptance', () => {
    const allowedOutputRoot = tempRoot();
    const outDir = path.join(allowedOutputRoot, 'run');
    const fleet = validateFleet(repoRoot);
    const summary = runFleetMuster({ scenarioPath, outDir, repoRoot, allowedOutputRoot });
    const expectedIds = fleet.agents.map((agent) => agent.agentId).sort();

    assert.equal(summary.passed, true);
    assert.equal(summary.agentCount, 15);
    assert.equal(summary.manifestCount, 15);
    assert.deepEqual([...summary.agentIds].sort(), expectedIds);
    assert.equal(summary.peakConcurrency <= summary.maxWorkers, true);
    assert.equal(summary.maxWorkers, 3);
    assert.deepEqual(summary.seededTrapCoverage, { total: 15, detected: 15, missedTrapIds: [] });
    assert.equal(summary.scorecard.length, 15);
    assert.equal(summary.externalCalls, 0);
    assert.equal(summary.externalActions, 0);
    assert.equal(summary.durableBrainWrites, 0);
    assert.equal(summary.durableQueueWrites, 0);
    assert.equal(summary.secretsAccessed, 0);
    assert.equal(summary.tokenUsageObservation, 'configured-only');
    assert.equal(fleet.agents.reduce((total, agent) => total + agent.acceptanceChecks.length, 0), 66);

    for (const entry of summary.scorecard) {
      assert.ok(entry.score >= 85, `${entry.agentId}: score ${entry.score}`);
      assert.ok(Object.values(entry.dimensions).every((value) => value >= 7), entry.agentId);
      assert.equal(entry.acceptance, 'passed', entry.agentId);
    }

    for (const agent of fleet.agents) {
      const runRoot = path.join(outDir, 'runs', agent.agentId);
      const manifest = readJson(path.join(runRoot, 'run-manifest.json'));
      validateManifest(manifest);
      assert.equal(manifest.agentId, agent.agentId);
      assert.notEqual(manifest.agentId, manifest.verifierAgentId);
      const checkIds = new Set(manifest.acceptanceChecks.map((check) => check.id));
      for (const declared of agent.acceptanceChecks) {
        assert.equal(checkIds.has(declared), true, `${agent.agentId}: missing ${declared}`);
        assert.equal(
          manifest.acceptanceChecks.filter((check) => check.id === declared).length,
          1,
          `${agent.agentId}: duplicate ${declared}`
        );
      }
      assert.equal(manifest.acceptanceChecks.every((check) => check.status === 'pass'), true, agent.agentId);
      for (const artifact of manifest.artifacts) {
        const artifactPath = path.join(runRoot, artifact.path);
        assert.equal(fs.existsSync(artifactPath), true, artifactPath);
        assert.equal(sha256File(artifactPath), artifact.sha256, artifactPath);
        assert.equal(fs.statSync(artifactPath).size, artifact.bytes, artifactPath);
      }
    }

    const verifier = readJson(path.join(outDir, 'runs', 'independent-verifier-release-gate', 'execute.json'));
    assert.equal(verifier.acceptanceResults.length, 14);
    assert.equal(verifier.acceptanceResults.every((decision) => decision.separateIdentity), true);
    assert.equal(verifier.acceptanceResults.every((decision) => decision.status === 'accepted'), true);
    assert.equal(verifier.makerArtifactsModified, false);

    const watchtower = readJson(path.join(outDir, 'runs', 'runtime-watchtower-agent-sre', 'execute.json'));
    assert.equal(watchtower.observationOnly, true);
    assert.equal(watchtower.stateAdvanced, false);
    assert.deepEqual(watchtower.stateMutations, []);
    assert.equal(watchtower.restartsAttempted, 0);

    const routed = fleet.agents.filter((agent) => agent.routing.clientRequired);
    for (const agent of routed) {
      const result = readJson(path.join(outDir, 'runs', agent.agentId, 'execute.json'));
      assert.equal(result.identityReceiptId, summary.identityReceiptId, agent.agentId);
    }
  });

  it('resumes the completed muster without increasing item attempts', () => {
    const allowedOutputRoot = tempRoot();
    const outDir = path.join(allowedOutputRoot, 'run');
    runFleetMuster({ scenarioPath, outDir, repoRoot, allowedOutputRoot });
    const before = new Map();
    for (const agent of validateFleet(repoRoot).agents) {
      const manifest = readJson(path.join(outDir, 'runs', agent.agentId, 'run-manifest.json'));
      before.set(agent.agentId, manifest.items.map((item) => item.attempts));
    }

    const resumed = runFleetMuster({ scenarioPath, outDir, repoRoot, allowedOutputRoot });
    assert.equal(resumed.passed, true);
    for (const agent of validateFleet(repoRoot).agents) {
      const manifest = readJson(path.join(outDir, 'runs', agent.agentId, 'run-manifest.json'));
      assert.deepEqual(manifest.items.map((item) => item.attempts), before.get(agent.agentId), agent.agentId);
    }
  });

  it('rejects tampered completed artifacts instead of resuming stale success', () => {
    const allowedOutputRoot = tempRoot();
    const outDir = path.join(allowedOutputRoot, 'run');
    runFleetMuster({ scenarioPath, outDir, repoRoot, allowedOutputRoot });
    const artifactPath = path.join(outDir, 'runs', 'communications-concierge', 'execute.json');
    const artifact = readJson(artifactPath);
    artifact.durableQueueWrites = ['tampered-write'];
    fs.writeFileSync(artifactPath, `${JSON.stringify(artifact, null, 2)}\n`, 'utf8');
    assert.throws(
      () => runFleetMuster({ scenarioPath, outDir, repoRoot, allowedOutputRoot }),
      /completed artifact evidence changed/
    );
  });

  it('fails closed on non-synthetic, credential-shaped, or incomplete-roster scenarios', () => {
    const root = tempRoot();
    const allowedOutputRoot = path.join(root, 'outputs');
    const nonSynthetic = writeScenario(root, (scenario) => { scenario.synthetic = false; });
    assert.throws(
      () => runFleetMuster({ scenarioPath: nonSynthetic, outDir: path.join(allowedOutputRoot, 'non-synthetic'), repoRoot, allowedOutputRoot }),
      /only accepts synthetic/
    );

    const credential = writeScenario(root, (scenario) => {
      scenario.agentInputs['marketing-chief'].domainData.apiKey = 'synthetic-forbidden-value';
    });
    assert.throws(
      () => runFleetMuster({ scenarioPath: credential, outDir: path.join(allowedOutputRoot, 'credential'), repoRoot, allowedOutputRoot }),
      /forbidden credential fields/
    );

    const incomplete = writeScenario(root, (scenario) => {
      delete scenario.agentInputs['finance-account-risk-sentinel'];
    });
    assert.throws(
      () => runFleetMuster({ scenarioPath: incomplete, outDir: path.join(allowedOutputRoot, 'incomplete'), repoRoot, allowedOutputRoot }),
      /exact agent ids/
    );

    const emptyInputs = writeScenario(root, (scenario) => { scenario.agentInputs = {}; });
    assert.throws(
      () => runFleetMuster({ scenarioPath: emptyInputs, outDir: path.join(allowedOutputRoot, 'empty-inputs'), repoRoot, allowedOutputRoot }),
      /exact agent ids/
    );

    const noTraps = writeScenario(root, (scenario) => { scenario.seededTraps = []; });
    assert.throws(
      () => runFleetMuster({ scenarioPath: noTraps, outDir: path.join(allowedOutputRoot, 'no-traps'), repoRoot, allowedOutputRoot }),
      /exactly fifteen seeded traps/
    );

    assert.throws(
      () => runFleetMuster({ scenarioPath, outDir: path.join(repoRoot, '12_Brain', 'muster-output'), repoRoot, allowedOutputRoot }),
      /bounded child of the allowed output root/
    );
  });
});
