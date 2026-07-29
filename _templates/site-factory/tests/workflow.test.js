const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  createHandoff,
  assertHandoff,
  approvalState,
  canRetry,
  nextAttemptHandoff,
  REQUIRED_HANDOFF_FIELDS,
} = require('../workflow/contract.js');
const { evaluateStep } = require('../workflow/evaluator.js');
const { runWorkflow } = require('../workflow/orchestrator.js');

describe('workflow contract', () => {
  it('requires full handoff fields', () => {
    for (const key of REQUIRED_HANDOFF_FIELDS) {
      const partial = {
        workflow_id: 'wf-1',
        step_id: 'build',
        task: 'build sites',
        constraints: { no_outreach: true },
        upstream_artifacts: [],
        budget_tokens: 1000,
        timeout_seconds: 60,
      };
      delete partial[key];
      assert.throws(() => assertHandoff(partial), new RegExp(key));
    }
    const ok = createHandoff({
      workflow_id: 'wf-1',
      step_id: 'build',
      task: 'build sites',
      constraints: { no_outreach: true },
      upstream_artifacts: [],
      budget_tokens: 1000,
      timeout_seconds: 60,
    });
    assert.equal(ok.workflow_id, 'wf-1');
  });

  it('fail-closes mail_ready without explicit human approval', () => {
    const held = approvalState({ qa_ready: 'ready' });
    assert.equal(held.qa_ready, 'ready');
    assert.equal(held.mail_ready, 'hold');
    assert.equal(held.approved, false);

    const open = approvalState({
      qa_ready: 'ready',
      approved: true,
      approved_by: 'Mac Frederick',
    });
    assert.equal(open.mail_ready, 'ready');
    assert.equal(open.approved, true);
  });

  it('bounds retries then fail-closes', () => {
    const handoff = createHandoff({
      workflow_id: 'wf-1',
      step_id: 'build',
      task: 'build',
      constraints: {},
      upstream_artifacts: [],
      budget_tokens: 100,
      timeout_seconds: 10,
      attempt: 1,
      max_retries: 2,
    });
    const evalFail = { status: 'fail', retryable: true, reason: 'flake' };
    assert.equal(canRetry(handoff, evalFail), true);
    const next = nextAttemptHandoff(handoff, evalFail);
    assert.equal(next.attempt, 2);
    const last = { ...next, attempt: 3 };
    assert.equal(canRetry(last, evalFail), false);
    assert.equal(nextAttemptHandoff(last, evalFail), null);
  });
});

describe('workflow evaluator', () => {
  it('rejects automation setting mail_ready=ready', () => {
    const r = evaluateStep({
      step_id: 'build',
      handoff: createHandoff({
        workflow_id: 'wf',
        step_id: 'build',
        task: 'x',
        constraints: {},
        upstream_artifacts: [],
        budget_tokens: 1,
        timeout_seconds: 1,
      }),
      artifact: { mail_ready: 'ready' },
      approval: approvalState(),
    });
    assert.equal(r.status, 'fail');
    assert.equal(r.retryable, false);
  });

  it('rejects static-only / skipped visual QA at quality_gate', () => {
    const handoff = createHandoff({
      workflow_id: 'wf',
      step_id: 'quality_gate',
      task: 'qa',
      constraints: {},
      upstream_artifacts: [],
      budget_tokens: 1,
      timeout_seconds: 1,
    });
    const r = evaluateStep({
      step_id: 'quality_gate',
      handoff,
      artifact: { qa: 'STATIC_ONLY', visual_qa: 'skipped', qa_ready: 'hold' },
      approval: approvalState(),
    });
    assert.equal(r.status, 'fail');
    assert.equal(r.machine.visual_qa, 'skipped');
  });
});

describe('workflow orchestrator', () => {
  it('blocks activate without human approval (fail-closed)', async () => {
    const result = await runWorkflow({
      workflow_id: 'wf-test-1',
      handlers: {
        quality_gate: async () => ({ qa: 'PASS', visual_qa: 'ran', qa_ready: 'ready' }),
        human_approval: async () => ({ approved: false }),
      },
    });
    assert.equal(result.ok, false);
    assert.equal(result.approval.mail_ready, 'hold');
    assert.ok(result.log.some((e) => e.status === 'fail_closed' || e.step_id === 'human_approval'));
  });

  it('allows activate only after explicit human approval', async () => {
    const result = await runWorkflow({
      workflow_id: 'wf-test-2',
      handlers: {
        quality_gate: async () => ({ qa: 'PASS', visual_qa: 'ran', qa_ready: 'ready' }),
        human_approval: async () => ({
          approved: true,
          approved_by: 'Melissa Silber',
          approved_at: '2026-07-29T00:00:00.000Z',
        }),
        activate: async () => ({ staged: true, mailed: false }),
      },
    });
    assert.equal(result.ok, true);
    assert.equal(result.approval.mail_ready, 'ready');
    assert.equal(result.approval.approved_by, 'Melissa Silber');
    assert.ok(result.log.some((e) => e.step_id === 'activate' && e.status === 'pass'));
  });
});
