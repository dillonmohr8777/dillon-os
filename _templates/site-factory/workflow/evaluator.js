/**
 * Evaluator for orchestrator stage handoffs.
 * Fail-closed on approval and on any attempt to set mail_ready=ready from automation.
 */
const { validateWebsiteQualityEvidence } = require('./contract.js');

function evaluateStep({ step_id, handoff, artifact, error, approval }) {
  if (error) {
    return {
      status: 'fail',
      retryable: true,
      reason: error,
      machine: { step_id, error: true },
    };
  }

  if (!handoff || !handoff.constraints) {
    return {
      status: 'fail',
      retryable: false,
      reason: 'missing handoff constraints',
      machine: { step_id, contract: 'invalid' },
    };
  }

  // Automation must never authorize mail.
  if (artifact && artifact.mail_ready === 'ready' && step_id !== 'human_approval') {
    return {
      status: 'fail',
      retryable: false,
      reason: 'automation attempted to set mail_ready=ready; fail-closed',
      machine: { step_id, mail_ready: 'illegal' },
    };
  }

  if (step_id === 'quality_gate') {
    if (!artifact) {
      return {
        status: 'fail',
        retryable: true,
        reason: 'quality_gate produced no artifact',
        machine: { step_id, missing: true },
      };
    }
    if (artifact.visual_qa === 'skipped' || artifact.qa === 'STATIC_ONLY') {
      return {
        status: 'fail',
        retryable: false,
        reason: 'visual QA skipped; static-only is not a full QA pass',
        machine: {
          step_id,
          qa: artifact.qa || null,
          visual_qa: artifact.visual_qa || 'skipped',
          qa_ready: 'hold',
        },
      };
    }
    if (artifact.qa_ready !== 'ready' || artifact.qa !== 'PASS') {
      return {
        status: 'fail',
        retryable: true,
        reason: 'quality_gate did not reach qa_ready=ready with full PASS',
        machine: {
          step_id,
          qa: artifact.qa,
          visual_qa: artifact.visual_qa,
          qa_ready: artifact.qa_ready || 'hold',
        },
      };
    }
    const evidence = validateWebsiteQualityEvidence(artifact);
    if (!evidence.ok) {
      return {
        status: 'fail',
        retryable: false,
        reason: `website evidence incomplete: ${evidence.errors.join('; ')}`,
        machine: {
          step_id,
          qa: artifact.qa,
          visual_qa: artifact.visual_qa,
          qa_ready: 'hold',
          evidence_errors: evidence.errors,
        },
      };
    }
  }

  if (step_id === 'human_approval') {
    if (!artifact || artifact.approved !== true || !artifact.approved_by) {
      return {
        status: 'fail',
        retryable: false,
        reason: 'human approval not granted; fail-closed',
        machine: { step_id, approved: false, mail_ready: 'hold' },
      };
    }
  }

  if (step_id === 'activate') {
    if (!approval || approval.approved !== true || approval.mail_ready !== 'ready') {
      return {
        status: 'fail',
        retryable: false,
        reason: 'activate blocked without approved mail_ready',
        machine: { step_id, blocked: true },
      };
    }
  }

  if (artifact && artifact.skipped) {
    // Unregistered handlers are allowed as soft pass except for gated stages above.
    return {
      status: 'pass',
      retryable: false,
      reason: artifact.reason || 'skipped',
      machine: { step_id, skipped: true },
    };
  }

  return {
    status: 'pass',
    retryable: false,
    reason: 'ok',
    machine: { step_id, ok: true },
  };
}

module.exports = { evaluateStep };
