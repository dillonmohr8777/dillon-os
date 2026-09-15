'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { REPO_ROOT } = require('./fsutil');
const { sha256, stableJson } = require('./outcome-graph');
const { runSourceBoundRoutineDurable } = require('./outcome-graph-source-bound');
const {
  DEEP_SHADOW_EVIDENCE,
  ROUTINE_SPECS,
} = require('./outcome-graph-routine-catalog');

const GOVERNANCE_IDS = ['D26', 'M02', 'M03', 'M04', 'M05', 'E11'];
const ROUTINES = Object.freeze({
  D26: {
    graphId: 'daily-d26-knowledge-proposal-shadow',
    cadence: 'daily',
    artifactNames: ['outcome-graph-knowledge-proposal.md', 'source-ledger.json'],
    objective: 'Create one source-located, deduplicated, reversible Obsidian proposal for the closed-loop web-design lesson without writing canonical truth.',
    valueSignal: 'The durable lesson has one existing canonical destination, current source hashes, explicit client/project scope, and a reviewable narrow change.',
    isolationKey: 'canonical_note_change_fingerprint',
    finishLine: 'One exact Markdown proposal and one machine source ledger reproduce from the current design-loop evidence while canonical notes remain unchanged.',
  },
  M02: {
    graphId: 'monthly-m02-agent-evaluation-shadow',
    cadence: 'monthly',
    artifactNames: ['agent-evaluation-scorecard.json', 'sample-ledger.json'],
    objective: 'Evaluate all 21 registered agents against current scope, tools, authority, sampled output evidence, maker-checker independence, and a retain, revise, or retire disposition.',
    valueSignal: 'Every agent has a source-bound governance record; unresolved name-only contracts and overlapping command-center signals remain visible.',
    isolationKey: 'agent_id_evaluation_window',
    finishLine: 'Every registered agent appears exactly once with scope, tools, authority, sample state, independence state, and a bounded disposition without permission or deletion changes.',
  },
  M03: {
    graphId: 'monthly-m03-automation-value-cost-shadow',
    cadence: 'monthly',
    artifactNames: ['automation-value-cost-report.json', 'schedule-inventory.json'],
    objective: 'Map every scheduled routine to its current schedule, verified output evidence, failures, observed graph usage, business value, cost evidence state, and one bounded disposition.',
    valueSignal: 'Configured schedules never masquerade as outcomes, and unavailable billing evidence remains pending rather than estimated as zero.',
    isolationKey: 'scheduled_routine_cost_period',
    finishLine: 'Every scheduled routine appears once with source-backed output and usage state, reconciled-or-pending cost truth, a continue/change/stop proposal, and no schedule or billing mutation.',
  },
  M04: {
    graphId: 'monthly-m04-client-separation-shadow',
    cadence: 'monthly',
    artifactNames: ['client-separation-audit.json', 'quarantine-proposals.json'],
    objective: 'Prove sampled route, asset, communication, metric, account, and access metadata maps to one canonical client or is quarantined without guessing.',
    valueSignal: 'Every client surface is identity-bound; duplicate identifiers and missing evidence are visible without exposing raw contacts or moving records.',
    isolationKey: 'sampled_record_client_surface',
    finishLine: 'All six required surfaces are sampled, every sample has one client or quarantine state, overlaps are hash-only, and no record or provider state changes.',
  },
  M05: {
    graphId: 'monthly-m05-documentation-refresh-shadow',
    cadence: 'monthly',
    artifactNames: ['documentation-refresh-proposal.json', 'authority-conflict-map.json'],
    objective: 'Compare current web-design behavior with global, project, product, design, sidecar, preflight, and rendered evidence and propose only source-located corrections.',
    valueSignal: 'Stale design receipts, seed-state ambiguity, missing authority assets, and synthetic-review limits resolve to exact authority layers rather than silent overwrites.',
    isolationKey: 'authority_document_rule_id',
    finishLine: 'Every observed conflict or alignment names its authority, evidence, scope, effective date, and proposal state; generated sidecars and canonical documents remain unchanged.',
  },
  E11: {
    graphId: 'event-e11-web-design-routine-proposal-shadow',
    cadence: 'event',
    artifactNames: ['routine-definition.json', 'synthetic-canary-receipt.json', 'manifest-ledger-proposal.json'],
    objective: 'Define the newly proven closed-loop web-design workflow with a unique trigger, observable finish line, exact inputs and outputs, privacy boundaries, and a positive plus negative canary.',
    valueSignal: 'D13, D14, D24, and D25 become one reproducible feedback loop without broadening permissions or silently adding a scheduler routine.',
    isolationKey: 'routine_trigger_finish_line_fingerprint',
    finishLine: 'The proposed routine is unique relative to existing stage routines, the positive terminal canary and negative false-completion case both revalidate, and adoption remains proposal-only.',
  },
});

function normalizePath(value) {
  return String(value || '').replace(/\\/g, '/');
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
}

function filePacket(file, locator) {
  const bytes = fs.readFileSync(file);
  return {
    locator: normalizePath(locator),
    sha256: sha256(bytes),
    bytes: bytes.length,
  };
}

function authority() {
  return {
    read_only: true,
    proposal_only: true,
    external_action_attempted: false,
    canonical_write_attempted: false,
    provider_mutation_attempted: false,
    permission_change_attempted: false,
    deletion_attempted: false,
    schedule_change_attempted: false,
    billing_change_attempted: false,
    record_move_attempted: false,
  };
}

function hashValues(values) {
  return [...new Set((values || []).map((value) => String(value || '').trim().toLowerCase())
    .filter(Boolean))].sort().map((value) => sha256(value));
}

function boundedFileInventory(root, limit = 500) {
  if (!root || !fs.existsSync(root) || !fs.statSync(root).isDirectory()) {
    return { folder_present: false, files_sampled: 0, truncated: false, relative_path_set_sha256: null };
  }
  const relative = [];
  const stack = [path.resolve(root)];
  while (stack.length > 0 && relative.length < limit) {
    const directory = stack.pop();
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (relative.length >= limit) break;
      const child = path.join(directory, entry.name);
      if (entry.isSymbolicLink()) continue;
      if (entry.isDirectory()) stack.push(child);
      else if (entry.isFile()) relative.push(normalizePath(path.relative(root, child)));
    }
  }
  relative.sort();
  return {
    folder_present: true,
    files_sampled: relative.length,
    truncated: relative.length >= limit,
    relative_path_set_sha256: sha256(stableJson(relative)),
  };
}

function safeReceiptSummary(receipt, routineId, artifactPacket) {
  return {
    routine_id: routineId,
    run_id: receipt.run_id || null,
    outcome: receipt.outcome || null,
    terminal_truth: receipt.terminal_truth === true,
    terminal_passed: receipt.terminal_evidence?.passed === true,
    budget_units_used: Number.isInteger(receipt.budget?.used_units) ? receipt.budget.used_units : null,
    artifact: artifactPacket,
  };
}

function collectEvidenceIndex(repoRoot, routineId, packets, allowedRoutineIds = null) {
  const evidence = [];
  for (const [id, locators] of Object.entries(DEEP_SHADOW_EVIDENCE)) {
    if (id === routineId) continue;
    if (allowedRoutineIds && !allowedRoutineIds.has(id)) continue;
    const receiptFile = path.join(repoRoot, locators.receipt);
    const artifactFile = path.join(repoRoot, locators.artifact);
    if (!fs.existsSync(receiptFile) || !fs.existsSync(artifactFile)) continue;
    const receiptPacket = filePacket(receiptFile, locators.receipt);
    const artifactPacket = filePacket(artifactFile, locators.artifact);
    packets.push(receiptPacket, artifactPacket);
    evidence.push(safeReceiptSummary(readJson(receiptFile), id, artifactPacket));
  }
  return evidence.sort((a, b) => a.routine_id.localeCompare(b.routine_id));
}

function sanitizedClients(clientRegistry, accessRegistry, clientOpsRoot) {
  const accessById = new Map((accessRegistry.clients || []).map((client) => [String(client.id), client]));
  return (clientRegistry.clients || []).map((client) => {
    const folder = client.folder
      ? (path.isAbsolute(client.folder) ? client.folder : path.join(clientOpsRoot, client.folder))
      : null;
    const access = accessById.get(String(client.id));
    return {
      client_id: String(client.id),
      status: String(client.status || 'unknown'),
      folder_sha256: client.folder ? sha256(normalizePath(client.folder).toLowerCase()) : null,
      folder_inventory: boundedFileInventory(folder),
      identifiers: {
        alias_hashes: hashValues(client.aliases),
        email_domain_hashes: hashValues(client.emailDomains),
        slack_channel_hashes: hashValues(client.slackChannels),
        access_ref_hashes: hashValues(client.accessRefs),
      },
      counts: {
        aliases: (client.aliases || []).length,
        email_domains: (client.emailDomains || []).length,
        contacts: (client.contacts || []).length,
        slack_channels: (client.slackChannels || []).length,
        access_refs: (client.accessRefs || []).length,
        evidence_records: Array.isArray(client.evidence) ? client.evidence.length : (client.evidence ? 1 : 0),
      },
      last_evidence_at: client.lastEvidenceAt || null,
      access_broker: {
        matched: Boolean(access),
        status: access?.status || null,
        system_count: access?.systems && typeof access.systems === 'object'
          ? Object.keys(access.systems).length
          : 0,
      },
    };
  });
}

function duplicateIdentifierGroups(clients) {
  const groups = new Map();
  for (const client of clients) {
    for (const [surface, hashes] of Object.entries(client.identifiers)) {
      for (const digest of hashes) {
        const key = `${surface}:${digest}`;
        if (!groups.has(key)) groups.set(key, { surface, value_sha256: digest, client_ids: [] });
        groups.get(key).client_ids.push(client.client_id);
      }
    }
    if (client.folder_sha256) {
      const key = `folder:${client.folder_sha256}`;
      if (!groups.has(key)) groups.set(key, { surface: 'folder', value_sha256: client.folder_sha256, client_ids: [] });
      groups.get(key).client_ids.push(client.client_id);
    }
  }
  return [...groups.values()].filter((group) => new Set(group.client_ids).size > 1)
    .map((group) => ({ ...group, client_ids: [...new Set(group.client_ids)].sort() }));
}

async function collectGovernanceSources(options = {}) {
  const routineId = String(options.routineId || '').toUpperCase();
  const repoRoot = path.resolve(options.repoRoot || REPO_ROOT);
  const userRoot = path.resolve(options.userRoot || path.join(repoRoot, '..', '..'));
  const clientRegistryFile = path.resolve(options.clientRegistryFile || path.join(
    userRoot,
    'Documents',
    'Codex',
    'projects',
    'client-operations',
    'registry',
    'clients.json'
  ));
  const accessRegistryFile = path.resolve(options.accessRegistryFile || path.join(
    userRoot,
    'AppData',
    'Local',
    'Codex',
    'AccessBroker',
    'registry.json'
  ));
  const files = {
    agent_registry: { file: path.join(repoRoot, '11_Agents', 'claude-operating-team.json'), locator: '11_Agents/claude-operating-team.json' },
    objective: { file: path.join(repoRoot, 'System', 'outcome-graph', 'source-snapshots', 'outcome-graph-objective-2026-08-24.json'), locator: 'System/outcome-graph/source-snapshots/outcome-graph-objective-2026-08-24.json' },
    catalog_code: { file: path.join(repoRoot, '_os', 'automation', 'lib', 'outcome-graph-routine-catalog.js'), locator: '_os/automation/lib/outcome-graph-routine-catalog.js' },
    project_note: { file: path.join(repoRoot, '12_Brain', '05_Projects', '2026-08-24 - Perfect outcome graph engineering.md'), locator: '12_Brain/05_Projects/2026-08-24 - Perfect outcome graph engineering.md' },
    high_craft: { file: path.join(repoRoot, '12_Brain', '03_Concepts', 'High Craft Website Factory.md'), locator: '12_Brain/03_Concepts/High Craft Website Factory.md' },
    product: { file: path.join(repoRoot, 'automation', 'prospect-radar-next20', 'PRODUCT.md'), locator: 'automation/prospect-radar-next20/PRODUCT.md' },
    design: { file: path.join(repoRoot, 'automation', 'prospect-radar-next20', 'DESIGN.md'), locator: 'automation/prospect-radar-next20/DESIGN.md' },
    visualize_receipt: { file: path.join(repoRoot, 'automation', 'prospect-radar-next20', 'VISUALIZE-RECEIPT.md'), locator: 'automation/prospect-radar-next20/VISUALIZE-RECEIPT.md' },
    design_probe: { file: path.join(repoRoot, 'System', 'outcome-graph', 'source-snapshots', 'impeccable-context-probe-2026-08-24.json'), locator: 'System/outcome-graph/source-snapshots/impeccable-context-probe-2026-08-24.json' },
    design_brief: { file: path.join(repoRoot, 'System', 'outcome-graph', 'source-snapshots', 'web-design-loop-canary-brief-2026-08-24.json'), locator: 'System/outcome-graph/source-snapshots/web-design-loop-canary-brief-2026-08-24.json' },
    design_receipt: { file: path.join(repoRoot, 'System', 'outcome-graph', 'web-design', 'closed-loop-canary', '2026-08-24-live', 'web-design-loop-receipt.json'), locator: 'System/outcome-graph/web-design/closed-loop-canary/2026-08-24-live/web-design-loop-receipt.json' },
    design_defects: { file: path.join(repoRoot, 'System', 'outcome-graph', 'web-design', 'closed-loop-canary', '2026-08-24-live', 'design-defect-ledger.json'), locator: 'System/outcome-graph/web-design/closed-loop-canary/2026-08-24-live/design-defect-ledger.json' },
    design_manifest: { file: path.join(repoRoot, 'System', 'outcome-graph', 'web-design', 'closed-loop-canary', '2026-08-24-live', 'final-build-manifest.json'), locator: 'System/outcome-graph/web-design/closed-loop-canary/2026-08-24-live/final-build-manifest.json' },
    global_agents: { file: path.join(userRoot, '.codex', 'AGENTS.md'), locator: 'user-global/AGENTS.md' },
    design_preflight: { file: path.join(userRoot, '.codex', 'tools', 'Test-ImpeccableDesignSystem.ps1'), locator: 'user-tools/Test-ImpeccableDesignSystem.ps1' },
    client_registry: { file: clientRegistryFile, locator: 'client-operations/registry/clients.json' },
    access_registry: { file: accessRegistryFile, locator: 'access-broker/registry.json' },
  };
  const needed = new Set(['agent_registry', 'objective', 'catalog_code']);
  if (routineId === 'D26') {
    ['high_craft', 'design_probe', 'design_brief', 'design_receipt', 'design_defects'].forEach((key) => needed.add(key));
  } else if (routineId === 'M04') {
    ['client_registry', 'access_registry'].forEach((key) => needed.add(key));
  } else if (routineId === 'M05') {
    ['global_agents', 'product', 'design', 'visualize_receipt', 'design_probe', 'design_brief', 'design_receipt', 'design_preflight'].forEach((key) => needed.add(key));
  } else if (routineId === 'E11') {
    ['design_brief', 'design_receipt', 'design_defects', 'design_manifest'].forEach((key) => needed.add(key));
  }
  const packets = [];
  for (const key of needed) {
    const spec = files[key];
    if (!fs.existsSync(spec.file)) throw new Error(`Required governance source is missing: ${spec.locator}`);
    packets.push(filePacket(spec.file, spec.locator));
  }
  const registry = readJson(files.agent_registry.file);
  const allowedEvidenceIds = routineId === 'M02'
    ? new Set(Object.keys(DEEP_SHADOW_EVIDENCE).filter((id) => !GOVERNANCE_IDS.includes(id)))
    : routineId === 'M03'
      ? new Set((registry.routines || [])
        .filter((routine) => routine.schedule_card && routine.routine_id !== 'M03')
        .map((routine) => routine.routine_id))
      : null;
  const evidenceIndex = ['M02', 'M03'].includes(routineId)
    ? collectEvidenceIndex(repoRoot, routineId, packets, allowedEvidenceIds)
    : [];
  let clients = [];
  let overlaps = [];
  if (routineId === 'M04') {
    const clientRegistry = readJson(clientRegistryFile);
    const accessRegistry = readJson(accessRegistryFile);
    clients = sanitizedClients(
      clientRegistry,
      accessRegistry,
      path.dirname(path.dirname(clientRegistryFile))
    );
    overlaps = duplicateIdentifierGroups(clients);
  }
  const sourceManifest = [...new Map(packets.map((packet) => [packet.locator, packet])).values()]
    .sort((a, b) => a.locator.localeCompare(b.locator));
  const capturedAt = options.capturedAt || new Date().toISOString();
  return {
    routine_id: routineId,
    captured_at: capturedAt,
    binding_version: `${capturedAt.slice(0, 10)}:${sourceManifest.map((item) => item.sha256.slice(0, 8)).join('.')}`,
    source_manifest: sourceManifest,
    source_set_sha256: sha256(stableJson(sourceManifest)),
    registry: {
      authority: registry.authority,
      agents: registry.agents || [],
      routines: registry.routines || [],
    },
    evidence_index: evidenceIndex,
    clients,
    client_overlaps: overlaps,
    design: routineId === 'M05' ? {
      probe: readJson(files.design_probe.file),
      web_receipt: readJson(files.design_receipt.file),
      visual_receipt_text: fs.readFileSync(files.visualize_receipt.file, 'utf8'),
      visual_output_present: fs.existsSync(path.join(
        repoRoot,
        'automation',
        'prospect-radar-next20',
        '.impeccable',
        'mocks',
        'architerra-mobile-three-directions.png'
      )),
    } : null,
    web_design: ['D26', 'E11'].includes(routineId) ? {
      receipt: readJson(files.design_receipt.file),
      defects: readJson(files.design_defects.file),
      manifest: routineId === 'E11' ? readJson(files.design_manifest.file) : null,
    } : null,
  };
}

function d26Items(sources) {
  return [{
    id: 'high-craft-website-factory-closed-loop-design',
    isolation_key: 'knowledge:internal:web-design-loop:high-craft-website-factory',
    snapshot: {
      knowledge_type: 'project_lesson_and_sop_delta',
      canonical_destination: '12_Brain/03_Concepts/High Craft Website Factory.md',
      duplicate_search: {
        completed: true,
        existing_destination_found: true,
        new_canonical_note_needed: false,
      },
      web_receipt: sources.web_design.receipt,
      defects: sources.web_design.defects,
    },
  }];
}

function evaluateD26(item, sources, context) {
  const receipt = item.snapshot.web_receipt;
  const defects = item.snapshot.defects;
  const sourceValid = sources.source_manifest.every((source) =>
    source.locator && /^[a-f0-9]{64}$/.test(source.sha256) && Number.isInteger(source.bytes)
  );
  return {
    schema_version: 1,
    routine_id: 'D26',
    id: item.id,
    isolation_key: item.isolation_key,
    observed_at: context.captured_at,
    source_set_sha256: context.source_set_sha256,
    knowledge_type: item.snapshot.knowledge_type,
    canonical_destination: item.snapshot.canonical_destination,
    duplicate_search: item.snapshot.duplicate_search,
    source_locator_count: sources.source_manifest.length,
    sources_current_and_hash_bound: sourceValid,
    client_scope: 'internal_no_client_data',
    project_scope: 'dillon-os web-design and Outcome Graph runtime',
    lesson: {
      graph_ready_is_not_production_ready: receipt.graph_ready === true && receipt.production_ready === false,
      rendered_checker_findings_feed_next_attempt: receipt.surfaces?.[0]?.repair_cycles >= 1,
      open_defects: defects.open_defects,
      synthetic_review_is_nonproduction: receipt.surfaces?.[0]?.checker?.review_type === 'synthetic_canary',
      deployment_remained_closed: receipt.authority?.deployment_attempted === false,
    },
    confidence: sourceValid && defects.open_defects === 0 ? 'high' : 'medium',
    proposal_state: 'narrow_reversible_unadopted',
    authority: authority(),
  };
}

function d26Artifacts(records, sources, context) {
  const record = records[0];
  const markdown = [
    '---',
    'note_type: agent_proposal',
    'status: proposed',
    `created: ${context.captured_at.slice(0, 10)}`,
    'knowledge_type: project_lesson_and_sop_delta',
    'canonical_destination: "12_Brain/03_Concepts/High Craft Website Factory.md"',
    'client_scope: internal_no_client_data',
    `source_set_sha256: ${context.source_set_sha256}`,
    'external_action_attempted: false',
    'canonical_write_attempted: false',
    '---',
    '',
    '# Outcome Graph web-design loop knowledge proposal',
    '',
    '## Proposed narrow change',
    '',
    'Add one closed-loop terminal contract to the existing High Craft Website Factory note. Do not create a second canonical concept page.',
    '',
    'A web build becomes a candidate only after a rendered checker returns exact defects, those defects become the next maker input, the repair budget closes with zero open defects, and a terminal verifier re-renders the final candidate from the same source binding.',
    '',
    'Keep graph readiness, production readiness, adoption, deployment, and delivery as separate states. A synthetic checker may prove the plumbing but can never confer production readiness.',
    '',
    '## Current proof',
    '',
    `- The browser-backed canary used ${record.lesson.rendered_checker_findings_feed_next_attempt ? 'at least one' : 'no'} repair cycle.`,
    `- The final defect ledger contains ${record.lesson.open_defects} open defects.`,
    '- Desktop and mobile captures, deterministic gates, detector output, and final candidate hashes were terminally replayed.',
    '- Deployment and canonical writes remained closed.',
    '',
    '## Review and rollback',
    '',
    'If accepted, add only the terminal-contract paragraph and its source references to the existing concept note. Roll back by removing that paragraph; no runtime, scheduler, client record, or deployment changes with this proposal.',
    '',
    '## Source locators',
    '',
    ...sources.source_manifest.map((source) => `- ${source.locator} | sha256 ${source.sha256}`),
    '',
  ].join('\n');
  return {
    'outcome-graph-knowledge-proposal.md': markdown,
    'source-ledger.json': {
      schema_version: 1,
      routine_id: 'D26',
      generated_at: context.captured_at,
      source_set_sha256: context.source_set_sha256,
      canonical_destination: record.canonical_destination,
      duplicate_search: record.duplicate_search,
      sources: sources.source_manifest,
      confidence: record.confidence,
      authority: authority(),
    },
  };
}

function m02Items(sources) {
  return sources.registry.agents.map((agent) => ({
    id: sha256(agent.agent).slice(0, 20),
    isolation_key: `agent:${sha256(agent.agent).slice(0, 20)}:2026-08`,
    snapshot: agent,
  }));
}

function evaluateM02(item, sources, context) {
  const agent = item.snapshot;
  const owned = agent.routines_owned || [];
  const samples = sources.evidence_index.filter((sample) => owned.includes(sample.routine_id));
  const commandNameCollision = /marketing chief/i.test(agent.agent) &&
    agent.agent !== sources.registry.authority?.sole_orchestrator_and_canonical_writer;
  const contractComplete = Boolean(agent.purpose) && agent.contract_detail !== 'name-only';
  const permissionBounded = (agent.forbidden_actions || []).includes('canonical_write') &&
    (agent.forbidden_actions || []).includes('send') &&
    (agent.forbidden_actions || []).includes('deploy');
  const samplesVerified = samples.length > 0 && samples.every((sample) =>
    sample.terminal_truth && sample.terminal_passed && sample.artifact.sha256
  );
  const disposition = commandNameCollision || !contractComplete
    ? 'revise'
    : (samplesVerified ? 'retain' : 'revise');
  return {
    schema_version: 1,
    routine_id: 'M02',
    id: item.id,
    isolation_key: item.isolation_key,
    observed_at: context.captured_at,
    source_set_sha256: context.source_set_sha256,
    agent_name: agent.agent,
    agent_class: agent.agent_class,
    departments: agent.departments || [],
    scope: {
      contract_detail: agent.contract_detail,
      purpose_resolved: Boolean(agent.purpose),
      routines_owned: owned,
      executable_routines: agent.routines_claude_may_execute || [],
    },
    tools: {
      capability_count: (agent.executable_capabilities || []).length,
      capabilities: agent.executable_capabilities || [],
      permission_bounded: permissionBounded,
    },
    authority_state: {
      claude_instantiable: agent.claude_instantiable === true,
      approval_ceiling: agent.approval_ceiling_observed,
      canonical_write_forbidden: (agent.forbidden_actions || []).includes('canonical_write'),
      external_delivery_forbidden: (agent.forbidden_actions || []).includes('send'),
      command_center_name_collision: commandNameCollision,
    },
    sample_state: {
      samples: samples.map((sample) => sample.routine_id),
      sample_count: samples.length,
      acceptance_bound: samplesVerified,
      maker_checker_independence_measured: samples.every((sample) => sample.terminal_passed),
    },
    risks: [
      ...(!contractComplete ? ['name-only-or-purpose-unresolved'] : []),
      ...(commandNameCollision ? ['subordinate-name-collides-with-marketing-chief-authority'] : []),
      ...(!samplesVerified ? ['verified-output-sample-pending'] : []),
    ],
    disposition,
    disposition_reason: disposition === 'retain'
      ? 'Contract, authority, permissions, and sampled acceptance evidence are complete.'
      : 'Revise the contract or naming and collect a verified output sample before retention.',
    authority: authority(),
  };
}

function m02Artifacts(records, sources, context) {
  return {
    'agent-evaluation-scorecard.json': {
      schema_version: 1,
      routine_id: 'M02',
      generated_at: context.captured_at,
      source_set_sha256: context.source_set_sha256,
      summary: {
        agents: records.length,
        retain: records.filter((record) => record.disposition === 'retain').length,
        revise: records.filter((record) => record.disposition === 'revise').length,
        retire: records.filter((record) => record.disposition === 'retire').length,
        command_center_name_collisions: records.filter((record) => record.authority_state.command_center_name_collision).length,
        permission_changes: 0,
        deletions: 0,
      },
      agents: records,
      authority: authority(),
    },
    'sample-ledger.json': {
      schema_version: 1,
      routine_id: 'M02',
      generated_at: context.captured_at,
      source_set_sha256: context.source_set_sha256,
      samples: sources.evidence_index.map((sample) => ({
        routine_id: sample.routine_id,
        run_id: sample.run_id,
        terminal_truth: sample.terminal_truth,
        terminal_passed: sample.terminal_passed,
        artifact: sample.artifact,
      })),
      authority: authority(),
    },
  };
}

function m03Items(sources) {
  return sources.registry.routines.filter((routine) => routine.schedule_card).map((routine) => ({
    id: routine.routine_id,
    isolation_key: `${routine.routine_id}:2026-08:schedule`,
    snapshot: routine,
  }));
}

function evaluateM03(item, sources, context) {
  const routine = item.snapshot;
  const evidence = sources.evidence_index.find((sample) => sample.routine_id === routine.routine_id) || null;
  const verifiedOutput = Boolean(evidence?.terminal_truth && evidence?.terminal_passed);
  return {
    schema_version: 1,
    routine_id: 'M03',
    id: item.id,
    isolation_key: item.isolation_key,
    observed_at: context.captured_at,
    source_set_sha256: context.source_set_sha256,
    scheduled_routine_id: routine.routine_id,
    schedule_card: routine.schedule_card,
    cadence: routine.cadence,
    trigger: routine.trigger,
    expected_artifact: routine.artifact,
    configured_budget_tokens: routine.budget_tokens,
    observed_graph_usage_units: evidence?.budget_units_used ?? null,
    output_evidence: evidence ? {
      run_id: evidence.run_id,
      outcome: evidence.outcome,
      terminal_truth: evidence.terminal_truth,
      terminal_passed: evidence.terminal_passed,
      artifact: evidence.artifact,
    } : null,
    output_state: verifiedOutput ? 'verified_current_output' : 'pending_verified_output',
    failure_state: evidence && !verifiedOutput ? evidence.outcome || 'blocked' : 'none_observed_in_sample',
    cost: {
      amount: null,
      currency: null,
      state: 'pending_validation',
      estimated: false,
      reason: 'No billing or subscription source is present in the authorized evidence set.',
    },
    business_value: routine.value_signal,
    disposition: verifiedOutput ? 'continue' : 'change',
    disposition_proposal: verifiedOutput
      ? 'Continue the schedule only while its exact artifact and terminal assertions keep revalidating.'
      : 'Change or pause only after Marketing Chief reviews why no current terminally verified output is bound.',
    authority: authority(),
  };
}

function m03Artifacts(records, sources, context) {
  return {
    'automation-value-cost-report.json': {
      schema_version: 1,
      routine_id: 'M03',
      generated_at: context.captured_at,
      source_set_sha256: context.source_set_sha256,
      summary: {
        scheduled_routines: records.length,
        verified_outputs: records.filter((record) => record.output_state === 'verified_current_output').length,
        output_pending: records.filter((record) => record.output_state !== 'verified_current_output').length,
        costs_pending_validation: records.filter((record) => record.cost.state === 'pending_validation').length,
        invented_zero_costs: records.filter((record) => record.cost.amount === 0).length,
        continue: records.filter((record) => record.disposition === 'continue').length,
        change: records.filter((record) => record.disposition === 'change').length,
        stop: records.filter((record) => record.disposition === 'stop').length,
      },
      routines: records,
      authority: authority(),
    },
    'schedule-inventory.json': {
      schema_version: 1,
      routine_id: 'M03',
      generated_at: context.captured_at,
      source_set_sha256: context.source_set_sha256,
      schedules: records.map((record) => ({
        routine_id: record.scheduled_routine_id,
        schedule_card: record.schedule_card,
        cadence: record.cadence,
        trigger: record.trigger,
        output_state: record.output_state,
      })),
      schedule_changes: 0,
      subscription_changes: 0,
      billing_changes: 0,
      authority: authority(),
    },
  };
}

function m04Items(sources) {
  const surfaces = ['route', 'asset', 'communication', 'metric', 'account', 'access_metadata'];
  return sources.clients.flatMap((client) => surfaces.map((surface) => ({
    id: `${client.client_id}:${surface}`,
    isolation_key: `${client.client_id}:${surface}`,
    snapshot: { client, surface },
  })));
}

function evaluateM04(item, sources, context) {
  const { client, surface } = item.snapshot;
  const overlap = sources.client_overlaps.filter((group) => group.client_ids.includes(client.client_id) &&
    ((surface === 'route' && group.surface === 'folder') ||
      (surface === 'communication' && ['alias_hashes', 'email_domain_hashes', 'slack_channel_hashes'].includes(group.surface)) ||
      (['account', 'access_metadata'].includes(surface) && group.surface === 'access_ref_hashes'))
  );
  const available = {
    route: Boolean(client.folder_sha256 && client.folder_inventory.folder_present),
    asset: client.folder_inventory.files_sampled > 0,
    communication: client.counts.email_domains + client.counts.contacts + client.counts.slack_channels > 0,
    metric: Boolean(client.last_evidence_at || client.counts.evidence_records > 0),
    account: client.counts.access_refs > 0,
    access_metadata: client.access_broker.matched,
  }[surface];
  const uniquelyBound = available && overlap.length === 0;
  return {
    schema_version: 1,
    routine_id: 'M04',
    id: item.id,
    isolation_key: item.isolation_key,
    observed_at: context.captured_at,
    source_set_sha256: context.source_set_sha256,
    client_id: client.client_id,
    client_status: client.status,
    surface,
    sample_fingerprint: sha256(stableJson({
      client_id: client.client_id,
      surface,
      folder: client.folder_sha256,
      counts: client.counts,
      access: client.access_broker,
    })),
    evidence_present: available,
    overlap_fingerprints: overlap.map((group) => group.value_sha256),
    mapping_state: uniquelyBound ? 'mapped_exactly_one_client' : 'quarantine_proposed',
    quarantine_reason: uniquelyBound
      ? null
      : (overlap.length > 0 ? 'cross-client-identifier-overlap' : 'surface-evidence-missing'),
    source_summary: {
      folder_inventory: surface === 'asset' || surface === 'route' ? client.folder_inventory : null,
      counts: client.counts,
      access_broker: ['account', 'access_metadata'].includes(surface) ? client.access_broker : null,
    },
    authority: authority(),
  };
}

function m04Artifacts(records, sources, context) {
  const quarantined = records.filter((record) => record.mapping_state === 'quarantine_proposed');
  return {
    'client-separation-audit.json': {
      schema_version: 1,
      routine_id: 'M04',
      generated_at: context.captured_at,
      source_set_sha256: context.source_set_sha256,
      summary: {
        canonical_clients: sources.clients.length,
        samples: records.length,
        required_surfaces: ['route', 'asset', 'communication', 'metric', 'account', 'access_metadata'],
        mapped_exactly_one: records.length - quarantined.length,
        quarantined: quarantined.length,
        overlap_groups: sources.client_overlaps.length,
        record_moves: 0,
      },
      samples: records,
      overlap_groups: sources.client_overlaps,
      authority: authority(),
    },
    'quarantine-proposals.json': {
      schema_version: 1,
      routine_id: 'M04',
      generated_at: context.captured_at,
      source_set_sha256: context.source_set_sha256,
      state: 'proposal_only',
      proposals: quarantined.map((record) => ({
        sample_fingerprint: record.sample_fingerprint,
        client_id: record.client_id,
        surface: record.surface,
        reason: record.quarantine_reason,
        proposed_action: 'Review the exact canonical client route before any assignment or move.',
      })),
      applied_moves: 0,
      provider_mutations: 0,
      authority: authority(),
    },
  };
}

function m05Items(sources) {
  const receipt = sources.design.web_receipt;
  const probe = sources.design.probe;
  return [
    {
      id: 'prospect-radar-seed-state',
      isolation_key: 'project:prospect-radar:design-seed',
      snapshot: {
        authority_layer: 'project DESIGN.md plus Impeccable preflight',
        state: 'aligned_with_hold',
        conflict: null,
        proposal: 'Keep DESIGN.md marked seed and do not generate a mature sidecar until a real visual implementation exists.',
        evidence: { design_is_seed: probe.design_system_test.design_is_seed, gate: probe.design_system_test.gate },
      },
    },
    {
      id: 'missing-visual-direction-output',
      isolation_key: 'project:prospect-radar:visual-authority-output',
      snapshot: {
        authority_layer: 'project VISUALIZE-RECEIPT.md and .impeccable/mocks',
        state: sources.design.visual_output_present ? 'aligned' : 'stale_receipt_missing_output',
        conflict: sources.design.visual_output_present ? null : 'The receipt names a hashed direction image that is not present at its declared project path.',
        proposal: 'Regenerate the direction image through the supported visualize flow or mark the receipt superseded; never treat the missing file as inspected authority.',
        evidence: { output_present: sources.design.visual_output_present },
      },
    },
    {
      id: 'windows-design-preflight-regression',
      isolation_key: 'global-tool:impeccable-preflight:windows',
      snapshot: {
        authority_layer: 'global Codex design workflow and user tool',
        state: probe.design_system_test.passed ? 'repaired_needs_regression_contract' : 'blocked',
        conflict: probe.design_system_test.passed ? null : probe.design_system_test.blocker,
        proposal: 'Add a regression check for the PowerShell IsWindows collision and YAML seed recognition to the supported preflight tool tests.',
        evidence: { passed: probe.design_system_test.passed, repairs: probe.preflight_repairs || [] },
      },
    },
    {
      id: 'synthetic-review-production-boundary',
      isolation_key: 'global-design-governance:review-authority',
      snapshot: {
        authority_layer: 'global design workflow plus surface receipt',
        state: receipt.graph_ready && !receipt.production_ready ? 'aligned_nonproduction_hold' : 'conflict',
        conflict: receipt.production_ready ? 'A synthetic canary was promoted to production-ready.' : null,
        proposal: 'Document that synthetic review proves loop plumbing only; production-intent surfaces require an independent agent or human reviewer.',
        evidence: { graph_ready: receipt.graph_ready, production_ready: receipt.production_ready, review_type: receipt.surfaces[0].checker.review_type },
      },
    },
  ];
}

function evaluateM05(item, sources, context) {
  return {
    schema_version: 1,
    routine_id: 'M05',
    id: item.id,
    isolation_key: item.isolation_key,
    observed_at: context.captured_at,
    source_set_sha256: context.source_set_sha256,
    authority_layer: item.snapshot.authority_layer,
    current_state: item.snapshot.state,
    conflict: item.snapshot.conflict,
    evidence: item.snapshot.evidence,
    proposal: item.snapshot.proposal,
    effective_date: context.captured_at.slice(0, 10),
    generated_sidecar_change_required: false,
    canonical_overwrite_attempted: false,
    authority: authority(),
  };
}

function m05Artifacts(records, sources, context) {
  return {
    'documentation-refresh-proposal.json': {
      schema_version: 1,
      routine_id: 'M05',
      generated_at: context.captured_at,
      source_set_sha256: context.source_set_sha256,
      state: 'proposal_only',
      proposals: records,
      applied_updates: 0,
      authority: authority(),
    },
    'authority-conflict-map.json': {
      schema_version: 1,
      routine_id: 'M05',
      generated_at: context.captured_at,
      source_set_sha256: context.source_set_sha256,
      conflicts: records.filter((record) => record.conflict).map((record) => ({
        rule_id: record.id,
        authority_layer: record.authority_layer,
        conflict: record.conflict,
        proposal: record.proposal,
      })),
      alignments: records.filter((record) => !record.conflict).map((record) => record.id),
      generated_sidecar_changes: 0,
      silent_overwrites: 0,
      authority: authority(),
    },
  };
}

function e11Items(sources) {
  return [{
    id: 'closed-loop-web-design',
    isolation_key: 'routine:web-design-closed-loop:v1',
    snapshot: {
      receipt: sources.web_design.receipt,
      defects: sources.web_design.defects,
      manifest: sources.web_design.manifest,
      overlaps: ['D13', 'D14', 'D24', 'D25', 'W05'],
    },
  }];
}

function evaluateE11(item, sources, context) {
  const receipt = item.snapshot.receipt;
  const defects = item.snapshot.defects;
  const firstAttempt = defects.surfaces?.[0]?.attempts?.[0];
  const definition = {
    routine_id_proposal: 'WEB-DESIGN-CLOSED-LOOP',
    trigger: 'A substantive web or UI task has one exact repository, named surface, resolved mode, complete brief, hash-bound product/design authority, and local implementation authority.',
    finish_line: 'The isolated candidate passes authority, brief, build, responsive, interaction, accessibility, performance, content-truth, design-system, and independent-craft gates; desktop and mobile evidence is hash-bound; the repair ledger is closed; terminal replay passes; adoption and deployment remain separate.',
    inputs: ['exact repository and branch', 'PRODUCT.md', 'DESIGN.md', 'surface brief', 'approved visual authority', 'current implementation or greenfield seed'],
    steps: ['bind authority', 'build in isolation', 'render desktop and mobile', 'independent critique', 'feed exact defects to maker', 'bounded repair', 'terminal re-render', 'proposal-only learning'],
    outputs: ['candidate files', 'desktop and mobile captures', 'defect ledger', 'final manifest', 'terminal receipt', 'learning proposal'],
    systems: ['project repository', 'Impeccable preflight and detector', 'Playwright or browser QA', 'Outcome Graph durable state', 'Marketing Chief approval path'],
    client_scope: 'one exact client or internal surface per run; no cross-client fan-in',
    approvals: ['independent production reviewer', 'adoption into source project', 'exact mapped deployment'],
    never_record: ['passwords', 'tokens', 'cookies', 'one-time codes', 'raw private contacts', 'unredacted cross-client source material'],
    forbidden_actions: ['canonical queue write', 'send', 'publish', 'deploy', 'spend', 'account change', 'secret access'],
  };
  const fingerprint = sha256(stableJson({ trigger: definition.trigger, finish_line: definition.finish_line }));
  const positive = receipt.graph_ready === true && defects.open_defects === 0 &&
    receipt.surfaces?.[0]?.repair_cycles >= 1 && receipt.authority?.deployment_attempted === false;
  const negative = firstAttempt?.passed === false && (firstAttempt.findings || []).length > 0 &&
    receipt.production_ready === false;
  return {
    schema_version: 1,
    routine_id: 'E11',
    id: item.id,
    isolation_key: item.isolation_key,
    observed_at: context.captured_at,
    source_set_sha256: context.source_set_sha256,
    definition,
    trigger_finish_line_fingerprint: fingerprint,
    overlap_analysis: {
      overlapping_stage_routines: item.snapshot.overlaps,
      unique_delta: 'This routine owns the feedback edge from rendered checker defects into the next maker attempt plus terminal re-render and production-review eligibility.',
      duplicate: false,
    },
    canary: {
      run_state: receipt.state,
      positive_terminal_case_passed: positive,
      negative_false_completion_case_rejected: negative,
      synthetic_review_production_hold: receipt.production_ready === false,
      open_defects: defects.open_defects,
      repair_cycles: receipt.surfaces?.[0]?.repair_cycles,
    },
    adoption: {
      state: 'proposal_only',
      registry_mutated: false,
      scheduler_mutated: false,
      permissions_expanded: false,
    },
    authority: authority(),
  };
}

function e11Artifacts(records, sources, context) {
  const record = records[0];
  return {
    'routine-definition.json': {
      schema_version: 1,
      routine_id: 'E11',
      generated_at: context.captured_at,
      source_set_sha256: context.source_set_sha256,
      definition: record.definition,
      trigger_finish_line_fingerprint: record.trigger_finish_line_fingerprint,
      overlap_analysis: record.overlap_analysis,
      authority: authority(),
    },
    'synthetic-canary-receipt.json': {
      schema_version: 1,
      routine_id: 'E11',
      generated_at: context.captured_at,
      source_set_sha256: context.source_set_sha256,
      canary: record.canary,
      positive_and_negative_cases_pass: record.canary.positive_terminal_case_passed &&
        record.canary.negative_false_completion_case_rejected,
      production_ready: false,
      authority: authority(),
    },
    'manifest-ledger-proposal.json': {
      schema_version: 1,
      routine_id: 'E11',
      generated_at: context.captured_at,
      source_set_sha256: context.source_set_sha256,
      state: 'proposal_only',
      proposed_routine_id: record.definition.routine_id_proposal,
      proposed_fingerprint: record.trigger_finish_line_fingerprint,
      demonstrated_permissions_only: true,
      registry_mutated: false,
      scheduler_mutated: false,
      permissions_expanded: false,
      authority: authority(),
    },
  };
}

function terminalAssertions(routineId) {
  return ({ actualArtifacts, expectedRecords, freshSources }) => {
    if (routineId === 'D26') {
      const proposal = actualArtifacts['outcome-graph-knowledge-proposal.md'];
      const ledger = actualArtifacts['source-ledger.json'];
      return [
        { id: 'knowledge-type-and-canonical-page-resolved', passed: Boolean(expectedRecords.length === 1 && expectedRecords[0].knowledge_type && expectedRecords[0].canonical_destination), detail: 'One knowledge type and canonical destination are resolved.' },
        { id: 'duplicate-search-completed', passed: expectedRecords[0].duplicate_search.completed && expectedRecords[0].duplicate_search.existing_destination_found && !expectedRecords[0].duplicate_search.new_canonical_note_needed, detail: 'The existing High Craft note prevents a duplicate canonical page.' },
        { id: 'source-locator-and-freshness-present', passed: ledger.sources.length === freshSources.source_manifest.length && expectedRecords[0].sources_current_and_hash_bound, detail: 'Every source has a locator, hash, byte count, and current capture.' },
        { id: 'client-and-project-boundaries-preserved', passed: expectedRecords[0].client_scope === 'internal_no_client_data' && /dillon-os/.test(expectedRecords[0].project_scope), detail: 'The proposal contains internal project lessons only.' },
        { id: 'proposal-is-narrow-and-reversible', passed: /Proposed narrow change/.test(proposal) && /Review and rollback/.test(proposal), detail: 'The Markdown proposal names one bounded change and rollback.' },
        { id: 'no-unauthorized-canonical-write', passed: /canonical_write_attempted: false/.test(proposal) && !ledger.authority.canonical_write_attempted, detail: 'The proposal inbox is used without canonical adoption.' },
      ];
    }
    if (routineId === 'M02') {
      const scorecard = actualArtifacts['agent-evaluation-scorecard.json'];
      return [
        { id: 'every-agent-has-scope-tools-authority-and-disposition', passed: expectedRecords.length === freshSources.registry.agents.length && expectedRecords.every((record) => record.scope && record.tools && record.authority_state && ['retain', 'revise', 'retire'].includes(record.disposition)), detail: 'Every registered agent has one complete governance record.' },
        { id: 'output-samples-bound-to-acceptance-contracts', passed: expectedRecords.every((record) => typeof record.sample_state.acceptance_bound === 'boolean'), detail: 'Every sample state explicitly records acceptance binding or its absence.' },
        { id: 'maker-checker-independence-measured', passed: expectedRecords.every((record) => typeof record.sample_state.maker_checker_independence_measured === 'boolean'), detail: 'Independence is measured for each agent sample set.' },
        { id: 'redundant-or-unsafe-agents-identified', passed: scorecard.summary.command_center_name_collisions >= 1 && expectedRecords.some((record) => record.risks.length > 0), detail: 'Naming overlap and unresolved contracts remain visible.' },
        { id: 'no-permission-expansion-or-deletion', passed: scorecard.summary.permission_changes === 0 && scorecard.summary.deletions === 0, detail: 'The evaluation changes no agent or permission.' },
      ];
    }
    if (routineId === 'M03') {
      const report = actualArtifacts['automation-value-cost-report.json'];
      const inventory = actualArtifacts['schedule-inventory.json'];
      return [
        { id: 'scheduled-inventory-complete', passed: expectedRecords.length === freshSources.registry.routines.filter((routine) => routine.schedule_card).length && inventory.schedules.length === expectedRecords.length, detail: 'Every current schedule card appears once.' },
        { id: 'verified-outputs-failures-and-usage-measured', passed: expectedRecords.every((record) => record.output_state && record.failure_state && Object.hasOwn(record, 'observed_graph_usage_units')), detail: 'Output, failure, and observed usage states are explicit.' },
        { id: 'costs-reconcile-to-named-sources', passed: expectedRecords.every((record) => record.cost.state === 'pending_validation' && record.cost.amount === null && record.cost.estimated === false), detail: 'No billing source exists, so all costs remain pending rather than zero.' },
        { id: 'cost-maps-to-outcome-or-stop-proposal', passed: expectedRecords.every((record) => Boolean(record.business_value && ['continue', 'change', 'stop'].includes(record.disposition) && record.disposition_proposal)), detail: 'Every scheduled unit maps to value and a bounded disposition.' },
        { id: 'no-schedule-subscription-or-billing-change', passed: inventory.schedule_changes === 0 && inventory.subscription_changes === 0 && inventory.billing_changes === 0 && report.authority.schedule_change_attempted === false, detail: 'No scheduler or billing state changed.' },
      ];
    }
    if (routineId === 'M04') {
      const audit = actualArtifacts['client-separation-audit.json'];
      const quarantine = actualArtifacts['quarantine-proposals.json'];
      return [
        { id: 'sample-covers-required-surfaces', passed: new Set(expectedRecords.map((record) => record.surface)).size === 6 && audit.summary.required_surfaces.length === 6, detail: 'Routes, assets, communications, metrics, accounts, and access metadata are sampled.' },
        { id: 'every-sample-maps-to-one-client-or-quarantine', passed: expectedRecords.every((record) => ['mapped_exactly_one_client', 'quarantine_proposed'].includes(record.mapping_state)), detail: 'No ambiguous sample is silently assigned.' },
        { id: 'canonical-registry-binding-current', passed: audit.summary.canonical_clients === freshSources.clients.length && expectedRecords.length === freshSources.clients.length * 6, detail: 'All canonical clients are represented across all six surfaces.' },
        { id: 'cross-client-blending-reported', passed: audit.overlap_groups.length === freshSources.client_overlaps.length && quarantine.proposals.length === audit.summary.quarantined, detail: 'Hash-only overlaps and missing evidence route to quarantine.' },
        { id: 'no-record-move-or-provider-mutation', passed: quarantine.applied_moves === 0 && quarantine.provider_mutations === 0 && !audit.authority.record_move_attempted, detail: 'No record or provider state changed.' },
      ];
    }
    if (routineId === 'M05') {
      const proposals = actualArtifacts['documentation-refresh-proposal.json'];
      const conflicts = actualArtifacts['authority-conflict-map.json'];
      return [
        { id: 'current-behavior-compared-to-durable-rules', passed: expectedRecords.length >= 4 && expectedRecords.every((record) => record.current_state && record.evidence), detail: 'Current preflight and rendered behavior are compared to durable authority.' },
        { id: 'global-project-and-surface-scope-resolved', passed: expectedRecords.every((record) => /global|project/i.test(record.authority_layer)), detail: 'Every proposal names its owning authority layer.' },
        { id: 'stale-brand-and-design-guidance-identified', passed: conflicts.conflicts.some((conflict) => String(conflict.rule_id).endsWith('missing-visual-direction-output')), detail: 'The missing declared visual direction asset is explicit.' },
        { id: 'proposal-names-source-conflict-and-effective-date', passed: proposals.proposals.every((proposal) => proposal.proposal && proposal.effective_date), detail: 'Every proposed correction is dated and reviewable.' },
        { id: 'generated-sidecars-use-supported-tools', passed: proposals.proposals.every((proposal) => !proposal.generated_sidecar_change_required) && conflicts.generated_sidecar_changes === 0, detail: 'No sidecar is hand-edited or fabricated.' },
        { id: 'no-silent-canonical-overwrite', passed: proposals.applied_updates === 0 && conflicts.silent_overwrites === 0, detail: 'All changes remain proposals.' },
      ];
    }
    const definition = actualArtifacts['routine-definition.json'];
    const canary = actualArtifacts['synthetic-canary-receipt.json'];
    const ledger = actualArtifacts['manifest-ledger-proposal.json'];
    return [
      { id: 'trigger-and-finish-line-unique-and-observable', passed: Boolean(!definition.overlap_analysis.duplicate && definition.overlap_analysis.unique_delta && definition.definition.trigger && definition.definition.finish_line), detail: 'The feedback edge and terminal replay distinguish the routine from existing stages.' },
      { id: 'inputs-steps-outputs-systems-and-client-scope-complete', passed: Boolean(['inputs', 'steps', 'outputs', 'systems'].every((key) => definition.definition[key].length > 0) && definition.definition.client_scope), detail: 'The workflow can be reproduced without route guessing.' },
      { id: 'approvals-and-never-record-surfaces-explicit', passed: definition.definition.approvals.length >= 3 && definition.definition.never_record.length >= 5 && definition.definition.forbidden_actions.length >= 5, detail: 'Human gates, privacy, and prohibited captures are explicit.' },
      { id: 'synthetic-canary-passes-terminal-verifier', passed: canary.positive_and_negative_cases_pass && !canary.production_ready, detail: 'The positive terminal case passes and the weak first draft plus production overclaim are rejected.' },
      { id: 'manifest-and-ledger-change-is-proposal-only', passed: ledger.state === 'proposal_only' && !ledger.registry_mutated && !ledger.scheduler_mutated, detail: 'Canonical adoption remains with Marketing Chief.' },
      { id: 'permissions-do-not-exceed-demonstrated-task', passed: ledger.demonstrated_permissions_only && !ledger.permissions_expanded, detail: 'The routine proposes no broader capability.' },
    ];
  };
}

function adapterFor(routineId) {
  if (routineId === 'D26') return {
    buildItems: d26Items,
    evaluateItem: evaluateD26,
    reduce: d26Artifacts,
    terminalAssertions: terminalAssertions('D26'),
    successCorrection: 'Keep web-design loop lessons in one existing canonical concept note and route changes through a reversible proposal.',
  };
  if (routineId === 'M02') return {
    buildItems: m02Items,
    evaluateItem: evaluateM02,
    reduce: m02Artifacts,
    terminalAssertions: terminalAssertions('M02'),
    successCorrection: 'Retain unresolved agent contracts and naming collisions as revise dispositions until evidence changes.',
  };
  if (routineId === 'M03') return {
    buildItems: m03Items,
    evaluateItem: evaluateM03,
    reduce: m03Artifacts,
    terminalAssertions: terminalAssertions('M03'),
    successCorrection: 'Never translate missing billing evidence into a zero-cost claim or configured schedule into business value.',
  };
  if (routineId === 'M04') return {
    buildItems: m04Items,
    evaluateItem: evaluateM04,
    reduce: m04Artifacts,
    terminalAssertions: terminalAssertions('M04'),
    successCorrection: 'Quarantine missing or overlapping client surfaces by hash rather than guessing or moving records.',
  };
  if (routineId === 'M05') return {
    buildItems: m05Items,
    evaluateItem: evaluateM05,
    reduce: m05Artifacts,
    terminalAssertions: terminalAssertions('M05'),
    successCorrection: 'Keep seed design truth, missing visual authority, preflight regressions, and synthetic-review limits source-located and proposal-only.',
  };
  if (routineId === 'E11') return {
    buildItems: e11Items,
    evaluateItem: evaluateE11,
    reduce: e11Artifacts,
    terminalAssertions: terminalAssertions('E11'),
    successCorrection: 'Adopt the closed-loop design routine only after Marketing Chief reviews uniqueness, permissions, and scheduler placement.',
  };
  throw new Error(`Unsupported governance routine: ${routineId}`);
}

async function runGovernanceRoutineDurable(options = {}) {
  const routineId = String(options.routineId || '').toUpperCase();
  const routine = ROUTINES[routineId];
  if (!routine) throw new Error(`routineId must be ${GOVERNANCE_IDS.join(', ')}.`);
  const repoRoot = path.resolve(options.repoRoot || REPO_ROOT);
  const referenceDate = String(options.referenceDate || new Date().toISOString().slice(0, 10));
  const outputDir = path.resolve(options.outputDir);
  const artifactOutputs = routineId === 'D26' ? {
    'outcome-graph-knowledge-proposal.md': {
      file: path.join(
        repoRoot,
        '00_Inbox',
        'Agent-Proposals',
        'Codex',
        '2026-08-24-outcome-graph-knowledge-proposal.md'
      ),
      logicalPath: '00_Inbox/Agent-Proposals/Codex/2026-08-24-outcome-graph-knowledge-proposal.md',
    },
    'source-ledger.json': {
      file: path.join(outputDir, 'source-ledger.json'),
      logicalPath: normalizePath(path.relative(repoRoot, path.join(outputDir, 'source-ledger.json'))),
    },
  } : undefined;
  return runSourceBoundRoutineDurable({
    ...routine,
    routineId,
    cadenceBucket: options.cadenceBucket || referenceDate,
    outputDir,
    stateRoot: options.stateRoot,
    safeOutput: options.safeOutput,
    logicalRoot: options.logicalRoot,
    repoRoot,
    workspaceRoot: options.workspaceRoot,
    artifactOutputs,
    adapter: options.adapter || adapterFor(routineId),
    collectSources: options.collectSources || (() => collectGovernanceSources({
      routineId,
      repoRoot,
      userRoot: options.userRoot,
      clientRegistryFile: options.clientRegistryFile,
      accessRegistryFile: options.accessRegistryFile,
      capturedAt: options.capturedAt,
    })),
    canonicalState: 'The agent registry, routine contracts, current durable receipts, client registry, access metadata, design authority, Obsidian vault, and Marketing Chief queue remain canonical and read only.',
    upstreamArtifacts: [
      '11_Agents/claude-operating-team.json',
      '_os/automation/lib/outcome-graph-routine-catalog.js',
      'System/outcome-graph/web-design/closed-loop-canary/2026-08-24-live/*',
      'client-operations/registry/clients.json when in scope',
      'current global, product, design, and Obsidian authority when in scope',
    ],
    sourceEvidence: 'Each governance routine recollects its exact registry, receipt, client, design, or knowledge source set before planning and terminal verification.',
    rollback: 'Discard governance shadow artifacts and the unadopted proposal; preserve registry, permissions, schedules, billing, client records, design truth, sidecars, queue, and external systems.',
    escalation: 'Return the exact missing sample, cost source, client ambiguity, stale authority, duplicate routine, or proposal decision to Marketing Chief.',
    maxParallel: routineId === 'M02' || routineId === 'M04' ? 6 : 3,
    budgetUnits: routineId === 'M04' ? 384 : 96,
    onCheckpoint: options.onCheckpoint,
    beforeFinalBindingCheck: options.beforeFinalBindingCheck,
    now: options.now,
    leaseSeconds: options.leaseSeconds,
    cleanupInterruptedWorkspace: options.cleanupInterruptedWorkspace,
  });
}

module.exports = {
  GOVERNANCE_IDS,
  ROUTINES,
  adapterFor,
  collectGovernanceSources,
  d26Artifacts,
  d26Items,
  duplicateIdentifierGroups,
  e11Artifacts,
  e11Items,
  evaluateD26,
  evaluateE11,
  evaluateM02,
  evaluateM03,
  evaluateM04,
  evaluateM05,
  m02Artifacts,
  m02Items,
  m03Artifacts,
  m03Items,
  m04Artifacts,
  m04Items,
  m05Artifacts,
  m05Items,
  runGovernanceRoutineDurable,
  sanitizedClients,
};
