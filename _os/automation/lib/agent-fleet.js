'use strict';

const fs = require('node:fs');
const path = require('node:path');

const REPO_ROOT = path.resolve(__dirname, '..', '..', '..');
const FLEET_PATH = '12_Brain/registry/agent-fleet.json';
const EXPECTED_AGENT_COUNT = 15;
const EXPECTED_PILOT_IDS = [
  'evidence-market-intelligence',
  'web-product',
  'independent-verifier-release-gate',
  'runtime-watchtower-agent-sre',
];
const GATED_ACTIONS = [
  'external_delivery',
  'publishing',
  'deployment',
  'spend',
  'account_change',
  'destructive',
  'human_authentication',
  'business_decision',
];
const REQUIRED_PILOT_RESTRICTIONS = [
  'synthetic_or_public_only',
  'no_external_actions',
  'no_private_data',
  'no_managed_memory',
  'no_channels',
  'no_schedules',
];

function readJson(relativePath, root = REPO_ROOT) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function hasAll(values, required) {
  return required.every((value) => values.includes(value));
}

function validateAgent(agent, manifestPath) {
  const failures = [];
  const categories = new Set(['control', 'delivery', 'assurance', 'sentinel']);
  const patterns = new Set(['sequential', 'parallel', 'router', 'orchestrator', 'evaluator']);
  const runtimeDefaults = new Set(['local', 'hybrid']);
  const managedEligibility = new Set(['blocked-local', 'synthetic', 'later-read-only']);
  const requiredStrings = ['agentId', 'displayName', 'category', 'purpose'];
  for (const field of requiredStrings) {
    if (typeof agent[field] !== 'string' || !agent[field].trim()) failures.push(`${manifestPath}: invalid ${field}`);
  }
  if (agent.schemaVersion !== 1) failures.push(`${manifestPath}: schemaVersion must be 1`);
  if (!/^[a-z][a-z0-9-]+$/.test(agent.agentId || '')) failures.push(`${manifestPath}: invalid agentId`);
  if (!categories.has(agent.category)) failures.push(`${manifestPath}: invalid category`);

  for (const objectField of ['orchestration', 'authority', 'routing', 'memory', 'tools', 'actionClasses', 'runtime', 'budget', 'evidence']) {
    if (!agent[objectField] || typeof agent[objectField] !== 'object' || Array.isArray(agent[objectField])) {
      failures.push(`${manifestPath}: missing ${objectField}`);
    }
  }
  if (failures.length) return failures;

  if (!patterns.has(agent.orchestration.pattern)) failures.push(`${manifestPath}: invalid orchestration pattern`);
  if (!runtimeDefaults.has(agent.runtime.default)) failures.push(`${manifestPath}: invalid runtime default`);
  if (!managedEligibility.has(agent.runtime.managedEligibility)) failures.push(`${manifestPath}: invalid managed eligibility`);

  if (agent.orchestration.maxWorkers < 0 || agent.orchestration.maxWorkers > 3) failures.push(`${manifestPath}: maxWorkers must be 0..3`);
  if (agent.orchestration.maxDepth < 0 || agent.orchestration.maxDepth > 1) failures.push(`${manifestPath}: maxDepth must be 0..1`);
  if (!agent.orchestration.canDelegate && (agent.orchestration.maxWorkers !== 0 || agent.orchestration.maxDepth !== 0)) {
    failures.push(`${manifestPath}: non-delegating agent must use zero worker/depth limits`);
  }
  if (agent.orchestration.canDelegate && (agent.orchestration.maxWorkers < 1 || agent.orchestration.maxDepth !== 1)) {
    failures.push(`${manifestPath}: delegating agent must have workers and depth one`);
  }

  const authorityKeys = [
    'canonicalQueueWrite',
    'canonicalBrainWrite',
    'correctionLedgerWrite',
    'externalDelivery',
    'spend',
    'accountChange',
    'secretAccess',
    'artifactAcceptance',
    'finalSynthesis',
  ];
  for (const field of authorityKeys) {
    if (typeof agent.authority[field] !== 'boolean') failures.push(`${manifestPath}: authority.${field} must be boolean`);
  }
  for (const field of ['canonicalBrainWrite', 'correctionLedgerWrite', 'externalDelivery', 'spend', 'accountChange', 'secretAccess']) {
    if (agent.authority[field]) failures.push(`${manifestPath}: authority.${field} is reserved for deterministic local services`);
  }
  if (agent.routing.clientRequired && !agent.routing.identityReceiptRequired) {
    failures.push(`${manifestPath}: client work requires an identity receipt`);
  }
  if (agent.memory.managedDurableMemory !== 'disabled') failures.push(`${manifestPath}: managed durable memory must be disabled`);
  if (!Array.isArray(agent.memory.localWriteScopes) || agent.memory.localWriteScopes.length) {
    failures.push(`${manifestPath}: agents cannot directly write durable memory`);
  }
  if (!hasAll(agent.actionClasses.approvalGated || [], GATED_ACTIONS)) {
    failures.push(`${manifestPath}: missing shared approval-gated action classes`);
  }
  if (!Array.isArray(agent.tools.deny) || !agent.tools.deny.includes('raw_secrets')) {
    failures.push(`${manifestPath}: raw_secrets must be denied`);
  }
  if (!Number.isInteger(agent.budget.tokens) || agent.budget.tokens < 1) failures.push(`${manifestPath}: invalid token budget`);
  if (!Number.isInteger(agent.budget.timeoutSeconds) || agent.budget.timeoutSeconds < 1) failures.push(`${manifestPath}: invalid timeout`);
  if (!Number.isInteger(agent.budget.maxRetries) || agent.budget.maxRetries < 0 || agent.budget.maxRetries > 3) {
    failures.push(`${manifestPath}: invalid maxRetries`);
  }
  if (!agent.evidence.sourceLocatorsRequired || !agent.evidence.artifactHashesRequired || !agent.evidence.degradedReceiptRequired) {
    failures.push(`${manifestPath}: evidence gates must fail closed`);
  }
  if (!Array.isArray(agent.acceptanceChecks) || !agent.acceptanceChecks.length) failures.push(`${manifestPath}: acceptance checks required`);

  if (agent.runtime.managedPilot) {
    if (agent.runtime.managedEligibility !== 'synthetic') failures.push(`${manifestPath}: managed pilot must be synthetic`);
    if (!hasAll(agent.runtime.managedRestrictions || [], REQUIRED_PILOT_RESTRICTIONS)) {
      failures.push(`${manifestPath}: managed pilot restrictions incomplete`);
    }
  }
  return failures;
}

function validatePilotProject(project, agent, root = REPO_ROOT) {
  const failures = [];
  const projectRoot = path.join(root, project.path);
  for (const relativePath of ['agent.py', 'instructions.md', 'identity.py', 'pyproject.toml', 'pilot.json']) {
    if (!fs.existsSync(path.join(projectRoot, relativePath))) failures.push(`${project.path}: missing ${relativePath}`);
  }
  for (const forbiddenPath of ['memory.py', '.env', 'channels', 'schedules']) {
    if (fs.existsSync(path.join(projectRoot, forbiddenPath))) failures.push(`${project.path}: forbidden ${forbiddenPath}`);
  }
  const agentEntry = fs.existsSync(path.join(projectRoot, 'agent.py'))
    ? fs.readFileSync(path.join(projectRoot, 'agent.py'), 'utf8')
    : '';
  if (!agentEntry.includes('define_deep_agent')) failures.push(`${project.path}: agent.py must use define_deep_agent`);
  if (!agentEntry.includes(`name="${agent.agentId}"`)) failures.push(`${project.path}: agent.py name must match agentId`);
  if (!agentEntry.includes('GeneralPurposeSubagentProfile(enabled=False)')) failures.push(`${project.path}: default general-purpose subagent must be disabled`);
  if (!agentEntry.includes('subagents=[]')) failures.push(`${project.path}: no implicit synchronous subagents allowed`);
  const instructions = fs.existsSync(path.join(projectRoot, 'instructions.md'))
    ? fs.readFileSync(path.join(projectRoot, 'instructions.md'), 'utf8')
    : '';
  for (const phrase of ['Synthetic or public-source data only', 'No external actions', 'Agent Runtime Contract v1']) {
    if (!instructions.includes(phrase)) failures.push(`${project.path}: instructions missing ${phrase}`);
  }
  const pilotPath = path.join(projectRoot, 'pilot.json');
  if (fs.existsSync(pilotPath)) {
    const pilot = JSON.parse(fs.readFileSync(pilotPath, 'utf8'));
    if (pilot.agentId !== agent.agentId) failures.push(`${project.path}: pilot agentId mismatch`);
    if (pilot.status !== 'scaffold' || pilot.deployed !== false) failures.push(`${project.path}: pilot must remain an undeployed scaffold`);
    if (!Array.isArray(pilot.allowedData) || pilot.allowedData.some((value) => !['synthetic', 'public', 'redacted_runtime_metadata'].includes(value))) {
      failures.push(`${project.path}: pilot data class is not safe`);
    }
    for (const capability of ['private_data', 'external_actions', 'managed_memory', 'channels', 'schedules', 'raw_secrets']) {
      if (!(pilot.forbiddenCapabilities || []).includes(capability)) failures.push(`${project.path}: pilot must forbid ${capability}`);
    }
  }
  return failures;
}

function validateFleet(root = REPO_ROOT) {
  const failures = [];
  const fleet = readJson(FLEET_PATH, root);
  if (fleet.schemaVersion !== 1) failures.push('fleet schemaVersion must be 1');
  if (fleet.canonicalQueueSystem !== 'client-operations') failures.push('client-operations must remain canonical queue');
  if (fleet.canonicalBrainSystem !== 'dillon-os') failures.push('dillon-os must remain canonical brain');
  if (fleet.maxWorkers !== 3 || fleet.maxDepth !== 1) failures.push('fleet limits must be three workers and depth one');
  const clarification = fleet.clarificationProtocol;
  if (!clarification || typeof clarification !== 'object' || Array.isArray(clarification)) {
    failures.push('fleet requires the Grill Me clarification protocol');
  } else {
    if (clarification.id !== 'grill-me-v1') failures.push('fleet clarification protocol must be grill-me-v1');
    if (clarification.invocation !== 'explicit-user-only') failures.push('Grill Me must remain explicitly user-invoked');
    if (clarification.scope !== 'all-registered-agents') failures.push('Grill Me must be available to all registered agents');
    if (clarification.sessionOwner !== 'current-task-agent') failures.push('Grill Me must stay with the current task owner');
    for (const field of ['canonicalQueueWrite', 'canonicalBrainWrite', 'approvalGrant', 'externalActions', 'artifactAcceptance']) {
      if (clarification[field] !== false) failures.push(`Grill Me cannot hold ${field} authority`);
    }
    for (const relativePath of [clarification.skillPath, clarification.receiptSchemaPath]) {
      const unsafe = typeof relativePath !== 'string' || path.isAbsolute(relativePath) || relativePath.includes('..');
      if (unsafe || !fs.existsSync(path.join(root, relativePath))) {
        failures.push(`Grill Me integration is missing ${relativePath || 'a required path'}`);
      }
    }
  }
  if (!Array.isArray(fleet.agentManifestPaths) || fleet.agentManifestPaths.length !== EXPECTED_AGENT_COUNT) {
    failures.push(`fleet must contain exactly ${EXPECTED_AGENT_COUNT} manifests`);
  }

  const agents = [];
  const seenIds = new Set();
  for (const manifestPath of fleet.agentManifestPaths || []) {
    if (path.isAbsolute(manifestPath) || manifestPath.includes('..')) {
      failures.push(`unsafe manifest path: ${manifestPath}`);
      continue;
    }
    const absolutePath = path.join(root, manifestPath);
    if (!fs.existsSync(absolutePath)) {
      failures.push(`missing manifest: ${manifestPath}`);
      continue;
    }
    const agent = readJson(manifestPath, root);
    failures.push(...validateAgent(agent, manifestPath));
    if (seenIds.has(agent.agentId)) failures.push(`duplicate agentId: ${agent.agentId}`);
    seenIds.add(agent.agentId);
    agents.push(agent);
  }

  const queueWriters = agents.filter((agent) => agent.authority.canonicalQueueWrite);
  if (queueWriters.length !== 1 || queueWriters[0].agentId !== fleet.supervisorAgentId) {
    failures.push('Marketing Chief must be the only canonical queue writer');
  }
  const brainWriters = agents.filter((agent) => agent.authority.canonicalBrainWrite || agent.authority.correctionLedgerWrite);
  if (brainWriters.length) failures.push('agent manifests cannot write canonical brain or correction state');
  const externalActors = agents.filter((agent) => agent.authority.externalDelivery || agent.authority.spend || agent.authority.accountChange || agent.authority.secretAccess);
  if (externalActors.length) failures.push('agents cannot directly deliver, spend, change accounts, or access secrets');
  const artifactAcceptors = agents.filter((agent) => agent.authority.artifactAcceptance);
  if (artifactAcceptors.length !== 1 || artifactAcceptors[0].agentId !== 'independent-verifier-release-gate') {
    failures.push('Independent Verifier must be the only artifact acceptance agent');
  }
  const finalSynthesizers = agents.filter((agent) => agent.authority.finalSynthesis);
  if (finalSynthesizers.length !== 1 || finalSynthesizers[0].agentId !== fleet.supervisorAgentId) {
    failures.push('Marketing Chief must be the only final synthesis agent');
  }
  for (const agent of agents) {
    const verifierId = agent.orchestration.verifierAgentId;
    if (verifierId && !seenIds.has(verifierId)) failures.push(`${agent.agentId}: verifier does not exist`);
    if (verifierId === agent.agentId) failures.push(`${agent.agentId}: maker cannot self-verify`);
  }

  const pilotIds = [...(fleet.managedPilotAgentIds || [])].sort();
  if (JSON.stringify(pilotIds) !== JSON.stringify([...EXPECTED_PILOT_IDS].sort())) failures.push('managed pilot roster must contain the approved four agents');
  const manifestPilotIds = agents.filter((agent) => agent.runtime.managedPilot).map((agent) => agent.agentId).sort();
  if (JSON.stringify(manifestPilotIds) !== JSON.stringify(pilotIds)) failures.push('managed pilot flags do not match fleet registry');
  for (const project of fleet.managedPilotProjects || []) {
    const agent = agents.find((candidate) => candidate.agentId === project.agentId);
    if (!agent) failures.push(`${project.path}: project agent is not registered`);
    else failures.push(...validatePilotProject(project, agent, root));
  }

  const aliases = readJson(fleet.legacyAliasRegistry, root);
  const seenAliases = new Set();
  for (const alias of aliases.aliases || []) {
    if (seenAliases.has(alias.alias)) failures.push(`duplicate legacy alias: ${alias.alias}`);
    seenAliases.add(alias.alias);
    if (!['alias', 'split', 'retired-writer'].includes(alias.mode)) failures.push(`${alias.alias}: invalid alias mode`);
    if (!Array.isArray(alias.targetAgentIds) || !alias.targetAgentIds.length) failures.push(`${alias.alias}: target required`);
    for (const target of alias.targetAgentIds || []) {
      if (!seenIds.has(target)) failures.push(`${alias.alias}: unknown target ${target}`);
    }
  }

  return { passed: failures.length === 0, failures, fleet, agents, aliases };
}

module.exports = {
  EXPECTED_AGENT_COUNT,
  EXPECTED_PILOT_IDS,
  GATED_ACTIONS,
  REQUIRED_PILOT_RESTRICTIONS,
  validateAgent,
  validateFleet,
  validatePilotProject,
};
