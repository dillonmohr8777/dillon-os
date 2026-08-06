'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const {
  REPO_ROOT,
  repoPath,
  ensureDir,
  readJson,
  writeJson,
  nowISO,
  slugify,
} = require('./fsutil');
const { enqueue } = require('./registry');

const RUN_STATE_DIR = repoPath('12_Brain/state/workflow-runs');
const RUN_REVIEW_DIR = repoPath('12_Brain/07_Reviews/Automation Runs');

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function validateManifest(manifest) {
  const errors = [];
  for (const key of ['workflow_id', 'task', 'maker_id', 'checker_id', 'rollback']) {
    if (!String(manifest?.[key] || '').trim()) errors.push(`${key} is required`);
  }
  if (manifest?.maker_id && manifest?.checker_id && manifest.maker_id === manifest.checker_id) {
    errors.push('maker_id and checker_id must be different');
  }
  if (!Array.isArray(manifest?.artifact_paths) || manifest.artifact_paths.length === 0) {
    errors.push('artifact_paths must contain at least one expected artifact');
  }
  if (!Array.isArray(manifest?.acceptance_tests) || manifest.acceptance_tests.length === 0) {
    errors.push('acceptance_tests must contain at least one test');
  }
  if (manifest?.budget_tokens != null && (!Number.isFinite(manifest.budget_tokens) || manifest.budget_tokens <= 0)) {
    errors.push('budget_tokens must be a positive number');
  }
  if (manifest?.timeout_seconds != null && (!Number.isFinite(manifest.timeout_seconds) || manifest.timeout_seconds <= 0)) {
    errors.push('timeout_seconds must be a positive number');
  }
  if (manifest?.workflow_type === 'website_factory') {
    const demoPath = String(manifest.demo_recording_path || '').trim();
    if (!demoPath) errors.push('website_factory requires demo_recording_path');
    if (manifest.visual_review_required !== true) errors.push('website_factory requires visual_review_required=true');
    if (demoPath && !manifest.artifact_paths?.includes(demoPath)) {
      errors.push('demo_recording_path must be included in artifact_paths');
    }
  }
  return { ok: errors.length === 0, errors };
}

function validateCheckerEvidence(run, evidence) {
  const errors = [];
  if (!evidence?.checker_id || evidence.checker_id !== run.checker_id) {
    errors.push(`Checker identity mismatch: expected ${run.checker_id}`);
  }
  if (evidence?.checker_id === run.maker_id) errors.push('Maker cannot check their own work');
  if (!['pass', 'fail'].includes(evidence?.verdict)) errors.push('Checker verdict must be pass or fail');
  if (!String(evidence?.summary || '').trim()) errors.push('Checker evidence summary is required');
  if (run.workflow_type === 'website_factory') {
    if (evidence?.demo_reviewed !== true) errors.push('website_factory checker must review the screen recording');
    if (!['pass', 'fail'].includes(evidence?.visual_review?.verdict)) {
      errors.push('website_factory checker requires a visual_review verdict');
    }
    if (!String(evidence?.visual_review?.summary || '').trim()) {
      errors.push('website_factory checker requires a visual_review summary');
    }
    if (!Array.isArray(evidence?.visual_review?.viewports) || evidence.visual_review.viewports.length < 2) {
      errors.push('website_factory checker requires at least two reviewed viewports');
    }
    if (evidence?.verdict === 'pass' && evidence?.visual_review?.verdict !== 'pass') {
      errors.push('overall checker verdict cannot pass when visual review fails');
    }
  }
  return { ok: errors.length === 0, errors };
}

function runFile(runId) {
  return path.join(RUN_STATE_DIR, `${runId}.json`);
}

function reviewFile(run) {
  return path.join(RUN_REVIEW_DIR, `${run.run_id} - ${slugify(run.task)}.md`);
}

function assertInsideRepo(candidate) {
  const normalized = String(candidate || '').replaceAll('\\', '/');
  const absolute = path.resolve(REPO_ROOT, normalized);
  const rootWithSep = `${path.resolve(REPO_ROOT)}${path.sep}`;
  if (absolute !== path.resolve(REPO_ROOT) && !absolute.startsWith(rootWithSep)) {
    throw new Error(`Artifact path escapes repository: ${candidate}`);
  }
  return absolute;
}

function hashArtifacts(artifactPaths) {
  return artifactPaths.map((artifactPath) => {
    const absolute = assertInsideRepo(artifactPath);
    if (!fs.existsSync(absolute)) {
      return { path: artifactPath, exists: false, sha256: null, bytes: 0 };
    }
    const stat = fs.statSync(absolute);
    if (!stat.isFile()) return { path: artifactPath, exists: true, sha256: null, bytes: 0, kind: 'directory' };
    const bytes = fs.readFileSync(absolute);
    return {
      path: artifactPath,
      exists: true,
      sha256: sha256(bytes),
      bytes: stat.size,
      kind: 'file',
    };
  });
}

function renderReview(run) {
  const makerEvidence = run.maker_evidence || {};
  const checkerEvidence = run.checker_evidence || {};
  return `---
note_type: review
status: ${run.status === 'adoption_ready' ? 'done' : 'active'}
created: ${run.started_at.slice(0, 10)}
updated: ${run.updated_at.slice(0, 10)}
owner: Dillon Mohr
workflow_id: "${run.workflow_id}"
run_id: "${run.run_id}"
verification_status: ${run.status === 'adoption_ready' ? 'verified' : run.status === 'checker_failed' ? 'disputed' : 'partial'}
source_refs:
  - "12_Brain/state/workflow-runs/${run.run_id}.json"
tags:
  - brain
  - review
  - automation
  - maker-checker
---

# ${run.task}

## Handoff contract

- **Workflow:** ${run.workflow_id}
- **Workflow type:** ${run.workflow_type}
- **Maker:** ${run.maker_id}
- **Checker:** ${run.checker_id}
- **Status:** ${run.status}
- **Token budget:** ${run.budget_tokens || 'not set'}
- **Timeout:** ${run.timeout_seconds || 'not set'} seconds
- **Human gate:** ${run.human_gate ? 'required' : 'not required'}
- **Rollback:** ${run.rollback}
${run.demo_recording_path ? `- **Screen recording:** \`${run.demo_recording_path}\`` : ''}

## Expected artifacts

${run.artifact_paths.map((artifact) => `- \`${artifact}\``).join('\n')}

## Acceptance tests

${run.acceptance_tests.map((test, index) => `${index + 1}. ${test}`).join('\n')}

## Maker evidence

${makerEvidence.summary || 'Maker has not completed the handoff.'}

${(makerEvidence.artifacts || []).map((artifact) => `- ${artifact.exists ? 'present' : 'MISSING'}: \`${artifact.path}\`${artifact.sha256 ? ` - sha256 ${artifact.sha256}` : ''}`).join('\n')}

## Independent checker

- Verdict: ${checkerEvidence.verdict || 'pending'}
- Checker: ${checkerEvidence.checker_id || run.checker_id}
- Evidence: ${checkerEvidence.summary || 'pending'}
${run.workflow_type === 'website_factory'
    ? `- Demo reviewed: ${checkerEvidence.demo_reviewed ? 'yes' : 'pending'}
- Visual verdict: ${checkerEvidence.visual_review?.verdict || 'pending'}
- Visual evidence: ${checkerEvidence.visual_review?.summary || 'pending'}
- Viewports: ${(checkerEvidence.visual_review?.viewports || []).join(', ') || 'pending'}`
    : ''}

## Human approval

${run.approval
    ? `Approved by ${run.approval.approver} at ${run.approval.approved_at}: ${run.approval.note}`
    : run.human_gate ? 'Required before adoption.' : 'Not required by this contract.'}
`;
}

function persistRun(run) {
  run.updated_at = nowISO();
  ensureDir(RUN_STATE_DIR);
  writeJson(runFile(run.run_id), run);
  ensureDir(RUN_REVIEW_DIR);
  fs.writeFileSync(reviewFile(run), renderReview(run), 'utf8');
  return run;
}

function createRun(manifest) {
  const validation = validateManifest(manifest);
  if (!validation.ok) throw new Error(`Invalid workflow manifest: ${validation.errors.join('; ')}`);
  const startedAt = nowISO();
  const seed = `${manifest.workflow_id}|${manifest.task}|${startedAt}|${manifest.maker_id}|${manifest.checker_id}`;
  const runId = `RUN-${startedAt.slice(0, 10)}-${sha256(seed).slice(0, 8).toUpperCase()}`;
  const run = {
    run_id: runId,
    workflow_id: manifest.workflow_id,
    workflow_type: manifest.workflow_type || 'general',
    task: manifest.task,
    constraints: manifest.constraints || [],
    upstream_artifacts: manifest.upstream_artifacts || [],
    maker_id: manifest.maker_id,
    checker_id: manifest.checker_id,
    artifact_paths: manifest.artifact_paths,
    acceptance_tests: manifest.acceptance_tests,
    rollback: manifest.rollback,
    demo_recording_path: manifest.demo_recording_path || null,
    visual_review_required: manifest.visual_review_required === true,
    human_gate: manifest.human_gate !== false,
    budget_tokens: manifest.budget_tokens || null,
    timeout_seconds: manifest.timeout_seconds || null,
    status: 'maker_pending',
    started_at: startedAt,
    updated_at: startedAt,
    maker_evidence: null,
    checker_evidence: null,
    approval: null,
  };
  persistRun(run);
  enqueue('maker-checker', 'run_started', { run_id: runId, workflow_id: run.workflow_id });
  return run;
}

function loadRun(runId) {
  const run = readJson(runFile(runId), null);
  if (!run) throw new Error(`Run not found: ${runId}`);
  return run;
}

function recordMaker(runId, evidence) {
  const run = loadRun(runId);
  if (!['maker_pending', 'maker_failed'].includes(run.status)) {
    throw new Error(`Run ${runId} is not accepting maker evidence from status ${run.status}`);
  }
  if (evidence.maker_id && evidence.maker_id !== run.maker_id) {
    throw new Error(`Maker identity mismatch: expected ${run.maker_id}`);
  }
  const artifacts = hashArtifacts(evidence.artifact_paths || run.artifact_paths);
  const missing = artifacts.filter((artifact) => !artifact.exists);
  run.maker_evidence = {
    maker_id: run.maker_id,
    recorded_at: nowISO(),
    summary: String(evidence.summary || ''),
    command_results: evidence.command_results || [],
    artifacts,
  };
  run.status = missing.length ? 'maker_failed' : 'awaiting_check';
  persistRun(run);
  enqueue('maker-checker', 'maker_recorded', { run_id: runId, status: run.status, missing: missing.map((item) => item.path) });
  return run;
}

function recordChecker(runId, evidence) {
  const run = loadRun(runId);
  if (run.status !== 'awaiting_check') throw new Error(`Run ${runId} is not awaiting an independent check`);
  const validation = validateCheckerEvidence(run, evidence);
  if (!validation.ok) throw new Error(validation.errors.join('; '));
  run.checker_evidence = {
    checker_id: evidence.checker_id,
    recorded_at: nowISO(),
    verdict: evidence.verdict,
    summary: evidence.summary,
    test_results: evidence.test_results || [],
    demo_reviewed: evidence.demo_reviewed === true,
    visual_review: evidence.visual_review || null,
  };
  run.status = evidence.verdict === 'pass' ? 'checker_passed' : 'checker_failed';
  persistRun(run);
  enqueue('maker-checker', 'checker_recorded', { run_id: runId, verdict: evidence.verdict });
  return run;
}

function approveRun(runId, approval) {
  const run = loadRun(runId);
  if (run.status !== 'checker_passed') throw new Error(`Run ${runId} cannot be approved from status ${run.status}`);
  if (!String(approval.approver || '').trim()) throw new Error('approver is required');
  if (!String(approval.note || '').trim()) throw new Error('approval note is required');
  run.approval = {
    approver: approval.approver,
    note: approval.note,
    approved_at: nowISO(),
  };
  run.status = 'adoption_ready';
  persistRun(run);
  enqueue('maker-checker', 'human_approved', { run_id: runId, approver: approval.approver });
  return run;
}

function gateRun(runId) {
  const run = loadRun(runId);
  const passed = run.status === 'adoption_ready' || (run.status === 'checker_passed' && !run.human_gate);
  return {
    run_id: runId,
    status: run.status,
    passed,
    reason: passed
      ? 'Independent checker passed and the approval contract is satisfied.'
      : run.status === 'checker_passed'
        ? 'Independent checker passed; human approval is still required.'
        : `Gate blocked at status ${run.status}.`,
  };
}

module.exports = {
  validateManifest,
  validateCheckerEvidence,
  createRun,
  loadRun,
  recordMaker,
  recordChecker,
  approveRun,
  gateRun,
  hashArtifacts,
};
