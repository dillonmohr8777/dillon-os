'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const {
  repoPath,
  ensureDir,
  readJson,
  writeJson,
  nowISO,
  slugify,
} = require('./fsutil');
const { enqueue } = require('./registry');

const INGEST_STATE = repoPath('12_Brain/state/grok-intelligence-ingest.json');
const CAPTURE_DIR = repoPath('12_Brain/01_Captures/Grok');
const RESEARCH_DIR = repoPath('12_Brain/06_Research');
const EXPERIMENT_DIR = repoPath('12_Brain/05_Projects/Experiments');

function sha256(value) {
  return crypto.createHash('sha256').update(String(value), 'utf8').digest('hex');
}

function cleanScalar(value, fallback = '') {
  const text = String(value ?? fallback).replace(/\r?\n/g, ' ').trim();
  return text.replace(/"/g, '\\"');
}

function yamlString(value) {
  return `"${cleanScalar(value)}"`;
}

function yamlList(values) {
  const unique = [...new Set((values || []).filter(Boolean).map((v) => String(v).trim()))];
  if (!unique.length) return '[]';
  return `\n${unique.map((v) => `  - ${yamlString(v)}`).join('\n')}`;
}

function extractUrls(text) {
  return [...new Set((String(text || '').match(/https?:\/\/[^\s)\]>"']+/g) || []).map((url) => url.replace(/[.,;:!?]+$/, '')))];
}

function dateOnly(value) {
  const candidate = String(value || nowISO()).slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(candidate) ? candidate : nowISO().slice(0, 10);
}

function normalizeDecision(value) {
  const decision = String(value || 'watch').toLowerCase().trim().replace(/\s+/g, '-');
  const allowed = new Set(['save-to-library', 'sandbox-test', 'watch', 'reject']);
  return allowed.has(decision) ? decision : 'watch';
}

function normalizeCandidate(candidate, index = 0) {
  const name = candidate.name || candidate.title || `Candidate ${index + 1}`;
  const urls = [
    ...(candidate.source_urls || []),
    candidate.source_url,
    candidate.url,
    candidate.asset_url,
  ].filter(Boolean);
  return {
    name: cleanScalar(name),
    decision: normalizeDecision(candidate.decision),
    why: String(candidate.why || candidate.fit || ''),
    expected_benefit: String(candidate.expected_benefit || candidate.benefit || ''),
    source_urls: [...new Set(urls)],
    acceptance_test: String(candidate.acceptance_test || ''),
    independent_checker: String(candidate.independent_checker || 'A different model or deterministic verifier'),
    rollback: String(candidate.rollback || 'Remove the sandbox integration and restore the previous artifact.'),
    human_gate: String(candidate.human_gate || 'Dillon approves adoption after checker pass.'),
    risk: String(candidate.risk || 'medium').toLowerCase(),
    overlap: String(candidate.overlap || ''),
  };
}

function validateGrokEnvelope(envelope) {
  const errors = [];
  if (!envelope || typeof envelope !== 'object') errors.push('input must be a JSON object');
  if (!cleanScalar(envelope?.automation)) errors.push('automation is required');
  if (!cleanScalar(envelope?.run_title || envelope?.title)) errors.push('run_title is required');
  if (!cleanScalar(envelope?.run_at || envelope?.date)) errors.push('run_at is required');
  if (!String(envelope?.content || '').trim()) errors.push('content is required');
  if (envelope?.candidates != null && !Array.isArray(envelope.candidates)) errors.push('candidates must be an array');
  return { ok: errors.length === 0, errors };
}

function renderExperimentNote(experiment) {
  return `---
note_type: project
project_kind: experiment
experiment_id: ${experiment.experiment_id}
status: proposed
experiment_stage: intake
created: ${experiment.created}
updated: ${experiment.created}
owner: Dillon Mohr
area: automation
priority: ${experiment.priority}
outcome: ${yamlString(experiment.outcome)}
next_action: ${yamlString(experiment.next_action)}
review_on: ${experiment.review_on}
verification_status: unverified
risk: ${experiment.risk}
source_refs:${yamlList(experiment.source_refs)}
tags:
  - brain
  - project
  - experiment
  - automation
---

# ${experiment.name}

## Why this may matter

${experiment.why || 'No operating-fit statement was supplied.'}

## Expected benefit

${experiment.expected_benefit || 'Benefit must be measured in the sandbox.'}

## Acceptance contract

- **Maker:** Unassigned implementation agent
- **Independent checker:** ${experiment.independent_checker}
- **Acceptance test:** ${experiment.acceptance_test || 'Define a deterministic acceptance test before implementation.'}
- **Rollback:** ${experiment.rollback}
- **Human gate:** ${experiment.human_gate}
- **Overlap:** ${experiment.overlap || 'Review against installed capabilities before authorization.'}

## Evidence

${experiment.source_refs.length ? experiment.source_refs.map((url) => `- ${url}`).join('\n') : '- Source URL unavailable; keep unverified.'}

## Run history

- ${experiment.created}: Added from Grok intelligence intake. No software installed or account authorized.
`;
}

function createExperiment(candidate, observedDate) {
  const stableSeed = `${candidate.name}|${candidate.source_urls[0] || candidate.why}`;
  const experimentId = `EXP-${sha256(stableSeed).slice(0, 8).toUpperCase()}`;
  const file = path.join(EXPERIMENT_DIR, `${experimentId} - ${slugify(candidate.name)}.md`);
  const experiment = {
    experiment_id: experimentId,
    name: candidate.name,
    created: observedDate,
    priority: candidate.risk === 'high' ? 'high' : 'normal',
    risk: ['low', 'medium', 'high', 'critical'].includes(candidate.risk) ? candidate.risk : 'medium',
    outcome: `Pass the acceptance contract for ${candidate.name} without weakening safety or existing capability.`,
    next_action: candidate.acceptance_test || 'Define and run the bounded sandbox test.',
    review_on: observedDate,
    source_refs: candidate.source_urls,
    why: candidate.why,
    expected_benefit: candidate.expected_benefit,
    acceptance_test: candidate.acceptance_test,
    independent_checker: candidate.independent_checker,
    rollback: candidate.rollback,
    human_gate: candidate.human_gate,
    overlap: candidate.overlap,
  };

  ensureDir(EXPERIMENT_DIR);
  const existed = fs.existsSync(file);
  if (!existed) fs.writeFileSync(file, renderExperimentNote(experiment), 'utf8');
  return { experiment_id: experimentId, file, created: !existed };
}

function renderCapture(envelope, observedDate, sourceRefs, candidates) {
  const runTitle = cleanScalar(envelope.run_title || envelope.title);
  return `---
note_type: capture
status: compiled
created: ${observedDate}
updated: ${observedDate}
observed_at: ${yamlString(envelope.run_at || observedDate)}
source_type: grok_automation
automation: ${yamlString(envelope.automation)}
run_title: ${yamlString(runTitle)}
verification_status: ${envelope.verification_status || 'partial'}
source_refs:${yamlList(sourceRefs)}
tags:
  - brain
  - capture
  - grok
  - x-research
---

# ${runTitle}

> [!source] Immutable Grok run capture
> Automation: **${cleanScalar(envelope.automation)}**
> Run time: **${cleanScalar(envelope.run_at || observedDate)}**
> Coverage: **${cleanScalar(envelope.coverage || 'Not supplied')}**

${String(envelope.content || '').trim()}

## Structured candidates

${candidates.length
    ? candidates.map((candidate) => `### ${candidate.name}

- Decision: **${candidate.decision}**
- Why: ${candidate.why || 'Not supplied'}
- Expected benefit: ${candidate.expected_benefit || 'Not supplied'}
- Acceptance test: ${candidate.acceptance_test || 'Required before adoption'}
- Independent checker: ${candidate.independent_checker}
- Rollback: ${candidate.rollback}
- Human gate: ${candidate.human_gate}
- Sources: ${candidate.source_urls.length ? candidate.source_urls.join(', ') : 'not supplied'}
`).join('\n')
    : 'No structured candidates were supplied. The raw run remains preserved above.'}
`;
}

function renderResearchHeader(observedDate, sourceRefs) {
  return `---
note_type: research
status: partial
created: ${observedDate}
updated: ${observedDate}
owner: Dillon Mohr
question: "What should Dillon OS test or change based on today's Grok and X intelligence?"
verification_status: partial
confidence: 0.75
expires: ${observedDate}
review_on: ${observedDate}
source_refs:${yamlList(sourceRefs)}
tags:
  - brain
  - research
  - grok
  - daily-intelligence
---

# ${observedDate} - Grok daily intelligence

This note compiles immutable Grok run captures. External claims remain time-bound
until independently verified.
`;
}

function appendResearchSection(researchFile, envelope, captureRel, candidates, observedDate, sourceRefs) {
  ensureDir(path.dirname(researchFile));
  let text = fs.existsSync(researchFile)
    ? fs.readFileSync(researchFile, 'utf8')
    : renderResearchHeader(observedDate, sourceRefs);
  text = text.replace(/^updated:\s*\d{4}-\d{2}-\d{2}$/m, `updated: ${observedDate}`);
  const title = cleanScalar(envelope.run_title || envelope.title);
  const section = `

## ${cleanScalar(envelope.automation)} - ${title}

- Capture: [[${captureRel.replace(/\\/g, '/').replace(/\.md$/, '')}]]
- Run time: ${cleanScalar(envelope.run_at)}
- Coverage: ${cleanScalar(envelope.coverage || 'not supplied')}
- Structured candidates: ${candidates.length}

${candidates.length
    ? candidates.map((candidate) => `- **${candidate.name}** - ${candidate.decision}: ${candidate.expected_benefit || candidate.why || 'Review the capture.'}`).join('\n')
    : '- No structured candidates supplied; review the immutable capture.'}
`;
  fs.writeFileSync(researchFile, `${text.trimEnd()}${section}\n`, 'utf8');
}

function ingestGrokRun(envelope, options = {}) {
  const validation = validateGrokEnvelope(envelope);
  if (!validation.ok) throw new Error(`Invalid Grok run envelope: ${validation.errors.join('; ')}`);

  const normalized = {
    ...envelope,
    run_title: envelope.run_title || envelope.title,
    candidates: (envelope.candidates || []).map(normalizeCandidate),
  };
  const payloadHash = sha256(JSON.stringify(normalized));
  const state = readJson(INGEST_STATE, { version: 1, processed: {} });
  if (!options.force && state.processed[payloadHash]) {
    return { status: 'duplicate', payload_hash: payloadHash, ...state.processed[payloadHash] };
  }

  const observedDate = dateOnly(normalized.run_at || normalized.date);
  const rawUrls = [
    normalized.source_url,
    ...extractUrls(normalized.content),
    ...normalized.candidates.flatMap((candidate) => candidate.source_urls),
  ].filter(Boolean);
  const sourceRefs = [...new Set(rawUrls)];
  const captureName = `${observedDate} - ${slugify(normalized.run_title)}.md`;
  let captureFile = path.join(CAPTURE_DIR, captureName);
  ensureDir(CAPTURE_DIR);
  if (fs.existsSync(captureFile) && !options.force) {
    throw new Error(`Capture already exists outside ingest state: ${path.relative(repoPath(), captureFile)}`);
  }
  if (fs.existsSync(captureFile) && options.force) {
    captureFile = path.join(CAPTURE_DIR, `${observedDate} - ${slugify(normalized.run_title)} - ${payloadHash.slice(0, 8)}.md`);
  }
  const captureRel = path.relative(repoPath(), captureFile);
  fs.writeFileSync(captureFile, renderCapture(normalized, observedDate, sourceRefs, normalized.candidates), 'utf8');

  const researchFile = path.join(RESEARCH_DIR, `${observedDate} - Grok daily intelligence.md`);
  appendResearchSection(researchFile, normalized, captureRel, normalized.candidates, observedDate, sourceRefs);

  const experiments = normalized.candidates
    .filter((candidate) => candidate.decision === 'sandbox-test')
    .map((candidate) => createExperiment(candidate, observedDate));

  const record = {
    automation: normalized.automation,
    run_title: normalized.run_title,
    run_at: normalized.run_at,
    captured_at: nowISO(),
    capture_file: path.relative(repoPath(), captureFile),
    research_file: path.relative(repoPath(), researchFile),
    experiment_ids: experiments.map((experiment) => experiment.experiment_id),
  };
  state.processed[payloadHash] = record;
  state.updated_at = nowISO();
  writeJson(INGEST_STATE, state);
  enqueue('grok-intelligence-ingest', 'captured', {
    payload_hash: payloadHash,
    capture_file: record.capture_file,
    research_file: record.research_file,
    experiment_ids: record.experiment_ids,
  });

  return {
    status: 'ingested',
    payload_hash: payloadHash,
    ...record,
  };
}

module.exports = {
  extractUrls,
  normalizeCandidate,
  validateGrokEnvelope,
  createExperiment,
  ingestGrokRun,
};
