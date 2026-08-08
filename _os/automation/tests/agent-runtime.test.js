const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {
  AgentRun,
  artifactEvidence,
  assertSafeLocator,
  validateManifest,
} = require('../lib/agent-runtime.js');

function fixtureRoot() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'agent-runtime-'));
}

function options(root, overrides = {}) {
  return {
    manifestPath: path.join(root, 'run-manifest.json'),
    agentId: 'web-product',
    verifierAgentId: 'independent-verifier-release-gate',
    workflowId: 'fixture-workflow',
    triggerIdentity: { kind: 'user', locator: 'local:test-runner' },
    sourceLocators: ['fixture:agent-runtime'],
    approval: { gate: 'none', status: 'not_required' },
    items: [
      { id: 'alpha', input: { value: 1 } },
      { id: 'beta', input: { value: 2 } },
    ],
    ...overrides,
  };
}

describe('Agent Runtime Contract v1', () => {
  it('writes the manifest before work and keeps a valid previous revision', () => {
    const root = fixtureRoot();
    const run = new AgentRun(options(root));
    const manifestPath = path.join(root, 'run-manifest.json');
    assert.ok(fs.existsSync(manifestPath));
    validateManifest(JSON.parse(fs.readFileSync(manifestPath, 'utf8')));

    run.startItem('alpha');
    const previous = JSON.parse(fs.readFileSync(`${manifestPath}.previous`, 'utf8'));
    validateManifest(previous);
    assert.equal(previous.items[0].status, 'pending');
  });

  it('resumes an interrupted item but never repeats a completed item', () => {
    const root = fixtureRoot();
    const run = new AgentRun(options(root));
    run.startItem('alpha');
    run.finishItem('alpha', { status: 'completed', checkpoint: { value: 'done' } });
    run.startItem('beta');

    const resumed = new AgentRun(options(root));
    assert.equal(resumed.shouldRun('alpha'), false);
    assert.equal(resumed.getItem('alpha').checkpoint.value, 'done');
    assert.equal(resumed.shouldRun('beta'), true);
    assert.equal(resumed.getItem('beta').status, 'pending');
  });

  it('fails closed when a completed item input changes', () => {
    const root = fixtureRoot();
    const run = new AgentRun(options(root));
    run.startItem('alpha');
    run.finishItem('alpha', { status: 'completed' });
    const changed = options(root);
    changed.items[0] = { id: 'alpha', input: { value: 99 } };
    assert.throws(() => new AgentRun(changed), /input changed for alpha/);
  });

  it('fails closed when a different identity tries to resume the run', () => {
    const root = fixtureRoot();
    new AgentRun(options(root));
    const changed = options(root, {
      triggerIdentity: { kind: 'connector', locator: 'connector:different-owner' },
    });
    assert.throws(() => new AgentRun(changed), /trigger identity changed/);
  });

  it('binds maker and verifier identities and rejects drift or self-verification', () => {
    const root = fixtureRoot();
    new AgentRun(options(root));
    assert.throws(
      () => new AgentRun(options(root, { agentId: 'evidence-market-intelligence' })),
      /agent identity changed/
    );
    assert.throws(
      () => new AgentRun(options(fixtureRoot(), {
        agentId: 'web-product',
        verifierAgentId: 'web-product',
      })),
      /maker and verifier must be different/
    );
  });

  it('hashes bounded artifacts and rejects private source locators', () => {
    const root = fixtureRoot();
    fs.writeFileSync(path.join(root, 'result.txt'), 'deterministic evidence', 'utf8');
    const evidence = artifactEvidence(root, ['result.txt']);
    assert.equal(evidence.length, 1);
    assert.match(evidence[0].sha256, /^[a-f0-9]{64}$/);
    assert.equal(evidence[0].bytes, 22);
    assert.throws(() => assertSafeLocator('C:\\Users\\Example\\private.txt'), /private absolute path/);
  });
});
