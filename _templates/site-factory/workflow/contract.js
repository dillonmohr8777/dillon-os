/**
 * Orchestrator + evaluator handoff contract for the site-factory outreach workflow.
 *
 * Every stage handoff MUST carry:
 *   workflow_id, step_id, task, constraints, upstream_artifacts,
 *   budget_tokens, timeout_seconds
 *
 * Approval is fail-closed: mail_ready stays hold until an explicit human
 * approval step with approved=true. Bounded retries; exhausted retries fail closed.
 *
 * Preserves factory paths used by PR #226; automation ops in PR #228 remain
 * a separate dependency (registry/queue) and must not collide with these files.
 */
const REQUIRED_HANDOFF_FIELDS = [
  'workflow_id',
  'step_id',
  'task',
  'constraints',
  'upstream_artifacts',
  'budget_tokens',
  'timeout_seconds',
];

const DEFAULT_MAX_RETRIES = 2;

function assertHandoff(handoff) {
  if (!handoff || typeof handoff !== 'object') {
    throw new Error('handoff must be an object');
  }
  for (const key of REQUIRED_HANDOFF_FIELDS) {
    if (!(key in handoff)) throw new Error(`handoff missing required field: ${key}`);
  }
  if (typeof handoff.workflow_id !== 'string' || !handoff.workflow_id) {
    throw new Error('workflow_id must be a non-empty string');
  }
  if (typeof handoff.step_id !== 'string' || !handoff.step_id) {
    throw new Error('step_id must be a non-empty string');
  }
  if (typeof handoff.task !== 'string' || !handoff.task) {
    throw new Error('task must be a non-empty string');
  }
  if (!handoff.constraints || typeof handoff.constraints !== 'object') {
    throw new Error('constraints must be an object');
  }
  if (!Array.isArray(handoff.upstream_artifacts)) {
    throw new Error('upstream_artifacts must be an array');
  }
  if (!Number.isFinite(handoff.budget_tokens) || handoff.budget_tokens <= 0) {
    throw new Error('budget_tokens must be a positive number');
  }
  if (!Number.isFinite(handoff.timeout_seconds) || handoff.timeout_seconds <= 0) {
    throw new Error('timeout_seconds must be a positive number');
  }
  return handoff;
}

function createHandoff(partial) {
  return assertHandoff({
    workflow_id: partial.workflow_id,
    step_id: partial.step_id,
    task: partial.task,
    constraints: partial.constraints || {},
    upstream_artifacts: partial.upstream_artifacts || [],
    budget_tokens: partial.budget_tokens ?? 8000,
    timeout_seconds: partial.timeout_seconds ?? 300,
    attempt: partial.attempt ?? 1,
    max_retries: partial.max_retries ?? DEFAULT_MAX_RETRIES,
    created_at: partial.created_at || new Date().toISOString(),
  });
}

/**
 * Fail-closed approval state. Automation may never set mail_ready=ready.
 * Only an explicit human approval record with approved===true may authorize mail.
 */
function approvalState(opts = {}) {
  const humanApproved = opts.approved === true && !!opts.approved_by;
  return {
    qa_ready: opts.qa_ready === 'ready' ? 'ready' : 'hold',
    mail_ready: humanApproved ? 'ready' : 'hold',
    approved: humanApproved,
    approved_by: humanApproved ? opts.approved_by : null,
    approved_at: humanApproved ? opts.approved_at || new Date().toISOString() : null,
    reason: humanApproved
      ? 'explicit human approval'
      : 'fail-closed: awaiting explicit human approval',
  };
}

function canRetry(handoff, evaluation) {
  const attempt = handoff.attempt || 1;
  const max = handoff.max_retries ?? DEFAULT_MAX_RETRIES;
  return evaluation && evaluation.retryable === true && attempt <= max;
}

function nextAttemptHandoff(handoff, evaluation) {
  if (!canRetry(handoff, evaluation)) {
    return null;
  }
  return createHandoff({
    ...handoff,
    attempt: (handoff.attempt || 1) + 1,
    upstream_artifacts: [
      ...handoff.upstream_artifacts,
      { type: 'evaluation', step_id: handoff.step_id, evaluation },
    ],
  });
}

const STAGE_SEQUENCE = [
  'discover',
  'qualify',
  'harvest',
  'brief',
  'build',
  'quality_gate',
  'human_approval',
  'activate',
  'learn',
];

module.exports = {
  REQUIRED_HANDOFF_FIELDS,
  DEFAULT_MAX_RETRIES,
  STAGE_SEQUENCE,
  assertHandoff,
  createHandoff,
  approvalState,
  canRetry,
  nextAttemptHandoff,
};
