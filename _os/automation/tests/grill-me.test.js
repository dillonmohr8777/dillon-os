'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { AgentRun, artifactEvidence } = require('../lib/agent-runtime.js');
const { GrillSession, validateSession } = require('../lib/grill-me.js');

const repoRoot = path.resolve(__dirname, '..', '..', '..');
const fixture = JSON.parse(fs.readFileSync(
  path.join(repoRoot, '_os/automation/fixtures/grill-me/fleet-plan.json'),
  'utf8',
));

function tempRoot() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'grill-me-test-'));
}

describe('Grill Me protocol', () => {
  it('asks one dependency-ready question at a time and includes a recommendation', () => {
    const root = tempRoot();
    const sessionPath = path.join(root, 'session.json');
    const session = new GrillSession({ sessionPath, ...fixture });
    const first = session.askNext();
    assert.equal(first.id, 'authority-boundary');
    assert.match(first.prompt, /^Q1\/3:/);
    assert.match(first.prompt, /Recommended answer:/);
    assert.equal(session.session.branches.filter((branch) => branch.status === 'asked').length, 1);
    assert.deepEqual(session.askNext(), first);

    session.answerCurrent('Use a shared protocol owned by the current task agent.');
    assert.throws(() => session.askNext(), /source-answerable/);
    session.resolveFromSource('runtime-seam', {
      answer: 'Attach the receipt to Agent Runtime Contract v1.',
      source: 'codebase',
      evidenceLocators: ['repo:_os/automation/lib/agent-runtime.js'],
    });
    const third = session.askNext();
    assert.equal(third.id, 'invocation-policy');
    session.answerCurrent('Keep it explicitly user-invoked.');

    assert.equal(session.session.status, 'shared_understanding');
    assert.equal(session.session.decisions.length, 3);
    assert.equal(session.session.currentQuestionId, null);
    assert.ok(Object.values(session.session.authority).every((value) => value === false));
    assert.equal(validateSession(session.session), session.session);

    const resumed = new GrillSession({ sessionPath });
    assert.equal(resumed.session.status, 'shared_understanding');
    assert.equal(resumed.askNext(), null);
    const changed = structuredClone(fixture);
    changed.branches[0].question = 'A changed question?';
    assert.throws(() => new GrillSession({ sessionPath, ...changed }), /decision tree changed/);
    fs.rmSync(root, { recursive: true, force: true });
  });

  it('rejects dependency cycles, redundant source questions, and protected receipt paths', () => {
    const root = tempRoot();
    const cyclic = structuredClone(fixture);
    cyclic.branches[0].dependsOn = ['invocation-policy'];
    assert.throws(() => new GrillSession({ sessionPath: path.join(root, 'cycle.json'), ...cyclic }), /dependency cycle/);
    assert.throws(() => new GrillSession({ sessionPath: path.join(root, '12_Brain', 'session.json'), ...fixture }), /protected brain/);
    fs.rmSync(root, { recursive: true, force: true });
  });

  it('attaches a hashed shared-understanding receipt to Agent Runtime Contract v1', () => {
    const root = tempRoot();
    const sessionPath = path.join(root, 'grill-receipt.json');
    const session = new GrillSession({ sessionPath, ...fixture });
    session.askNext();
    session.answerCurrent('Use the shared protocol.');
    session.resolveFromSource('runtime-seam', {
      answer: 'Use the existing runtime evidence seam.',
      source: 'codebase',
      evidenceLocators: ['repo:_os/automation/lib/agent-runtime.js'],
    });
    session.askNext();
    session.answerCurrent('Explicit invocation only.');

    const run = new AgentRun({
      manifestPath: path.join(root, 'agent-run.json'),
      agentId: 'marketing-chief',
      verifierAgentId: 'independent-verifier-release-gate',
      workflowId: 'grill-me-runtime-test',
      triggerIdentity: { kind: 'user', locator: 'thread:synthetic-grill-me' },
      sourceLocators: ['fixture:grill-me/fleet-plan.json'],
      items: [{ id: 'plan', input: fixture.subject }],
    });
    assert.equal(run.manifest.clarification.status, 'not_invoked');
    const [receipt] = artifactEvidence(root, ['grill-receipt.json']);
    run.setClarification({ status: 'shared_understanding', receipt });
    run.startItem('plan');
    run.finishItem('plan', { status: 'completed', retryable: false });
    run.setAcceptanceChecks([{ id: 'grill.shared-understanding', status: 'pass' }]);
    run.finalize('complete');
    assert.equal(run.manifest.clarification.receipt.sha256, receipt.sha256);
    assert.equal(run.manifest.status, 'complete');
    fs.rmSync(root, { recursive: true, force: true });
  });

  it('does not allow a completed run to hide an in-progress interview', () => {
    const root = tempRoot();
    const run = new AgentRun({
      manifestPath: path.join(root, 'agent-run.json'),
      agentId: 'marketing-chief',
      verifierAgentId: 'independent-verifier-release-gate',
      workflowId: 'grill-me-in-progress-test',
      triggerIdentity: { kind: 'user', locator: 'thread:synthetic-grill-me' },
      items: [{ id: 'plan', input: 'pending decisions' }],
    });
    run.setClarification({ status: 'in_progress' });
    run.setAcceptanceChecks([{ id: 'grill.receipt-attached', status: 'pass' }]);
    assert.throws(() => run.finalize('complete'), /in-progress Grill Me session/);
    fs.rmSync(root, { recursive: true, force: true });
  });
});
