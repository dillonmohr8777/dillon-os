/**
 * Minimal orchestrator: walks stage handoffs under the contract, evaluates each
 * step, retries within bounds, and fail-closes on approval / exhausted retries.
 * Does not send outreach, deploy, or flip mail_ready.
 */
const {
  createHandoff,
  approvalState,
  canRetry,
  nextAttemptHandoff,
  STAGE_SEQUENCE,
} = require('./contract.js');
const { evaluateStep } = require('./evaluator.js');

/**
 * @param {object} opts
 * @param {string} opts.workflow_id
 * @param {Record<string, Function>} opts.handlers  step_id -> async (handoff) => artifact
 * @param {object} [opts.seed] initial upstream context
 * @param {object} [opts.constraints]
 */
async function runWorkflow(opts) {
  const workflow_id = opts.workflow_id;
  if (!workflow_id) throw new Error('workflow_id required');
  const handlers = opts.handlers || {};
  const constraints = {
    no_outreach: true,
    no_deploy: true,
    mail_ready_default: 'hold',
    ...(opts.constraints || {}),
  };

  let upstream = opts.seed ? [opts.seed] : [];
  const log = [];
  let approval = approvalState({ qa_ready: 'hold' });

  for (const step_id of STAGE_SEQUENCE) {
    if (step_id === 'activate' && !approval.approved) {
      log.push({
        step_id,
        status: 'skipped',
        reason: 'fail-closed: human_approval not granted; activate blocked',
      });
      break;
    }

    let handoff = createHandoff({
      workflow_id,
      step_id,
      task: `Run stage ${step_id}`,
      constraints,
      upstream_artifacts: upstream,
      budget_tokens: opts.budget_tokens || 8000,
      timeout_seconds: opts.timeout_seconds || 300,
    });

    let finished = false;
    while (!finished) {
      const handler = handlers[step_id];
      let artifact = null;
      let error = null;
      try {
        if (typeof handler === 'function') {
          artifact = await handler(handoff);
        } else {
          artifact = { skipped: true, reason: 'no handler registered' };
        }
      } catch (err) {
        error = err.message || String(err);
      }

      const evaluation = evaluateStep({
        step_id,
        handoff,
        artifact,
        error,
        approval,
      });
      log.push({
        step_id,
        attempt: handoff.attempt,
        status: evaluation.status,
        evaluation,
      });

      if (evaluation.status === 'pass') {
        if (artifact) upstream = [...upstream, { type: 'artifact', step_id, artifact }];
        if (step_id === 'quality_gate' && artifact && artifact.qa_ready === 'ready') {
          approval = approvalState({ qa_ready: 'ready' });
        }
        if (step_id === 'human_approval') {
          approval = approvalState({
            qa_ready: approval.qa_ready,
            approved: artifact && artifact.approved === true,
            approved_by: artifact && artifact.approved_by,
            approved_at: artifact && artifact.approved_at,
          });
        }
        finished = true;
      } else if (canRetry(handoff, evaluation)) {
        handoff = nextAttemptHandoff(handoff, evaluation);
      } else {
        log.push({
          step_id,
          status: 'fail_closed',
          reason: evaluation.reason || 'step failed and retries exhausted',
        });
        return {
          workflow_id,
          ok: false,
          approval: approvalState({ qa_ready: approval.qa_ready }),
          log,
        };
      }
    }
  }

  return {
    workflow_id,
    ok: true,
    approval,
    log,
  };
}

module.exports = { runWorkflow };
