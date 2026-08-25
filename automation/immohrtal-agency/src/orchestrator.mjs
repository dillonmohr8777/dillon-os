import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { discovered, STATES, transition } from './state-machine.mjs';
import { Scout, Atlas, Forge, Relay, Proof } from './agents.mjs';
import { assertDraftOnly, prospectKey, sha256, suppressionDecision, validateProspect, validateSource } from './policy.mjs';
import { runCodexModelLane } from './model-lane.mjs';

const moduleRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function ensureDir(directory) { fs.mkdirSync(directory, { recursive: true }); }
function writeJson(file, value) { fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8'); }
function safeSlug(value) { return String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 70) || 'prospect'; }

function draftMarkdown(record) {
  const draft = record.outputs.relay;
  return `# DRAFT ONLY — ${record.prospect.company_name}\n\nStatus: **DO NOT SEND**\n\nApproval: **NOT GRANTED**\n\nTo: ${draft.to || 'No validated address'}\n\nSubject: ${draft.subject}\n\n---\n\n${draft.body}\n\n---\n\nFingerprint: \`${draft.fingerprint}\`\n`;
}

function briefMarkdown(context, records, receipt) {
  const counts = receipt.counts;
  const review = records.filter((item) => item.state === STATES.AWAITING_APPROVAL);
  return `# IMMOHRTAL daily operator brief\n\nRun: \`${context.runId}\`  \nAs of: ${context.asOf}  \nMode: **LOCAL DRAFT ONLY**\n\n## Outcome\n\n- Awaiting approval: ${counts.awaiting_approval}\n- Suppressed: ${counts.suppressed}\n- Duplicate: ${counts.duplicate}\n- Blocked: ${counts.blocked}\n\nNo email was sent. No site was published. No ad spend, CRM write, credential access, or external mutation occurred.\n\n## Review queue\n\n${review.length ? review.map((item) => `- **${item.prospect.company_name}** — ${item.prospect.website} — review exact recipient, subject, body, and source observations. Fingerprint: \`${item.outputs.relay.fingerprint}\``).join('\n') : '- No packages are ready for review.'}\n\n## Approval boundary\n\nApproval is not granted by this run. A later operator must approve the exact prospect, recipient, subject, body, and channel. This version still cannot send or hand off to an external adapter.\n`;
}

function processProspect(prospect, context) {
  let record = discovered(prospect, context.asOf);
  const validity = validateProspect(prospect);
  if (!validity.ok) {
    record.block_reason = validity.reasons.join(' ');
    return transition(record, STATES.BLOCKED, 'orchestrator', context.asOf);
  }
  const suppression = suppressionDecision(prospect, context.suppressions);
  if (suppression.suppressed) {
    record.suppression = { suppressed: true, reason: suppression.reason, opt_out: prospect.opt_out === true, do_not_contact: prospect.do_not_contact === true };
    return transition(record, STATES.SUPPRESSED, 'policy', context.asOf);
  }
  const key = prospectKey(prospect);
  if (context.seen.has(key)) {
    record.duplicate = { key, reason: 'Duplicate domain, contact, or company in the active input or prior local index.' };
    return transition(record, STATES.DUPLICATE, 'policy', context.asOf);
  }
  context.seen.add(key);

  record.outputs.scout = Scout.run(prospect);
  record = transition(record, STATES.SCOUT_REVIEWED, 'Scout', context.asOf);
  record.outputs.atlas = Atlas.run(prospect, record.outputs.scout);
  record = transition(record, STATES.ATLAS_REVIEWED, 'Atlas', context.asOf);
  record.outputs.forge = Forge.run(prospect, record.outputs.scout, record.outputs.atlas);
  record = transition(record, STATES.FORGE_DRAFTED, 'Forge', context.asOf);
  record.outputs.relay = Relay.run(prospect, record.outputs.scout, record.outputs.forge, context.sender);
  record = transition(record, STATES.RELAY_DRAFTED, 'Relay', context.asOf);
  if (context.useModel) {
    const modelResult = runCodexModelLane({
      prospect,
      modelConfig: context.config.model_lane,
      schemaPath: context.schemaPath,
      traceDir: context.traceDir,
      agencyRoot: context.agencyRoot
    });
    record.outputs.model_analysis = modelResult.analysis;
    record.outputs.model_trace = modelResult.trace;
  }
  record.outputs.proof = Proof.run(record);
  if (record.outputs.proof.status !== 'passed') {
    record.block_reason = record.outputs.proof.failures.join(' ');
    return transition(record, STATES.BLOCKED, 'Proof', context.asOf);
  }
  record = transition(record, STATES.PROOF_PASSED, 'Proof', context.asOf);
  return transition(record, STATES.AWAITING_APPROVAL, 'approval-gate', context.asOf);
}

export function executeRun({ config, input, suppressions, runId, asOf, outputRoot, priorKeys = [], useModel = false, agencyRoot = null }) {
  assertDraftOnly(config);
  validateSource(input.source, config);
  if (!/^\d{8}-\d{6}$/.test(runId)) throw new Error('Run ID must use yyyyMMdd-HHmmss.');
  if (Number.isNaN(Date.parse(asOf))) throw new Error('asOf must be a valid ISO date.');
  if (input.prospects.length > config.limits.max_prospects_per_run) throw new Error(`Input exceeds max_prospects_per_run=${config.limits.max_prospects_per_run}.`);
  if (useModel && input.prospects.length > config.model_lane.max_prospects_per_run) throw new Error(`Model input exceeds model_lane.max_prospects_per_run=${config.model_lane.max_prospects_per_run}.`);

  const runDir = path.resolve(outputRoot, runId);
  ensureDir(runDir);
  const completeReceipt = path.join(runDir, 'run-receipt.json');
  if (fs.existsSync(completeReceipt)) {
    const existing = JSON.parse(fs.readFileSync(completeReceipt, 'utf8'));
    if (existing.status.startsWith('complete') && existing.input_sha256 === sha256(input)) return { runDir, receipt: existing, resumed: true };
    throw new Error('Run directory already contains a receipt that does not match this input.');
  }

  const context = {
    runId,
    asOf,
    suppressions,
    seen: new Set(priorKeys),
    sender: { name: config.business.sender_name, email: config.business.sender_email, business_name: config.business.name },
    useModel,
    config,
    agencyRoot: agencyRoot || moduleRoot,
    schemaPath: path.resolve(agencyRoot || moduleRoot, 'schemas', 'model-analysis.schema.json'),
    traceDir: path.join(runDir, 'model-traces')
  };
  const records = input.prospects.map((prospect) => processProspect(prospect, context));
  const packages = records.filter((record) => record.state === STATES.AWAITING_APPROVAL).map((record) => ({
    prospect_id: record.prospect.prospect_id,
    company_name: record.prospect.company_name,
    approval_gate: record.approval_gate,
    draft: record.outputs.relay
  }));
  const counts = {
    total: records.length,
    awaiting_approval: records.filter((item) => item.state === STATES.AWAITING_APPROVAL).length,
    suppressed: records.filter((item) => item.state === STATES.SUPPRESSED).length,
    duplicate: records.filter((item) => item.state === STATES.DUPLICATE).length,
    blocked: records.filter((item) => item.state === STATES.BLOCKED).length
  };
  const queuePath = path.join(runDir, 'prospect-queue.json');
  const packagePath = path.join(runDir, 'outreach-packages.json');
  writeJson(queuePath, { run_id: runId, as_of: asOf, states: Object.values(STATES), records });
  writeJson(packagePath, { run_id: runId, mode: 'DRAFT_ONLY_DO_NOT_SEND', packages });
  const draftDir = path.join(runDir, 'outreach-drafts');
  ensureDir(draftDir);
  for (const record of records.filter((item) => item.state === STATES.AWAITING_APPROVAL)) {
    const base = `${safeSlug(record.prospect.company_name)}-${safeSlug(record.prospect.prospect_id)}`;
    writeJson(path.join(draftDir, `${base}.json`), { prospect: record.prospect, approval_gate: record.approval_gate, draft: record.outputs.relay });
    fs.writeFileSync(path.join(draftDir, `${base}.md`), draftMarkdown(record), 'utf8');
  }
  const receipt = {
    automation: 'IMMOHRTAL Agency Daily Orchestrator',
    run_id: runId,
    as_of: asOf,
    status: counts.blocked ? 'complete_with_blocks' : 'complete',
    mode: 'local_draft_only',
    analysis_mode: useModel ? 'codex_cli_model_analysis' : 'deterministic_only',
    input_source: input.source,
    input_sha256: sha256(input),
    counts,
    agents: [
      { name: Scout.name, role: Scout.role, kind: 'maker' },
      { name: Atlas.name, role: Atlas.role, kind: 'maker' },
      { name: Forge.name, role: Forge.role, kind: 'maker' },
      { name: Relay.name, role: Relay.role, kind: 'maker' },
      { name: Proof.name, role: Proof.role, kind: 'checker' }
    ],
    approval: { required: true, granted: false, adapter_handoff_enabled: false },
    model_traces: records.filter((record) => record.outputs.model_trace).map((record) => ({ prospect_id: record.prospect.prospect_id, ...record.outputs.model_trace })),
    external_actions: { sent: 0, published: 0, spend_changes: 0, crm_writes: 0, credential_accesses: 0 },
    artifacts: {
      operator_brief: 'operator-brief.md',
      prospect_queue: 'prospect-queue.json',
      outreach_packages: 'outreach-packages.json',
      draft_directory: 'outreach-drafts'
    },
    artifact_sha256: {
      prospect_queue: sha256(fs.readFileSync(queuePath)),
      outreach_packages: sha256(fs.readFileSync(packagePath))
    }
  };
  fs.writeFileSync(path.join(runDir, 'operator-brief.md'), briefMarkdown(context, records, receipt), 'utf8');
  receipt.artifact_sha256.operator_brief = sha256(fs.readFileSync(path.join(runDir, 'operator-brief.md')));
  writeJson(completeReceipt, receipt);
  return { runDir, receipt, records, resumed: false };
}
