'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {
  assertAgentId,
  assertSafeLocator,
  assertTriggerIdentity,
  atomicWriteJson,
} = require('./agent-runtime.js');

const PROTOCOL_ID = 'grill-me-v1';
const SESSION_STATUSES = new Set(['in_progress', 'shared_understanding', 'blocked']);
const BRANCH_STATUSES = new Set(['pending', 'asked', 'resolved']);
const RESOLUTION_SOURCES = new Set(['user', 'codebase', 'vault', 'connected_source', 'runtime']);

function isoNow(clock = () => new Date()) {
  return clock().toISOString();
}

function assertText(value, field) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${field} must be a non-empty string`);
  return value.trim();
}

function assertIso(value, field) {
  if (typeof value !== 'string' || Number.isNaN(Date.parse(value)) || new Date(value).toISOString() !== value) {
    throw new Error(`${field} must be an ISO timestamp`);
  }
}

function assertSessionPath(sessionPath) {
  const resolved = path.resolve(sessionPath);
  const parts = resolved.split(path.sep).map((part) => part.toLowerCase());
  if (parts.includes('.git') || parts.includes('12_brain') || parts.includes('queue')) {
    throw new Error('Grill Me receipts must stay outside protected brain, queue, and git state');
  }
  if (path.extname(resolved).toLowerCase() !== '.json') throw new Error('Grill Me session path must be a JSON file');
  return resolved;
}

function assertBranchGraph(branches) {
  if (!Array.isArray(branches) || !branches.length) throw new Error('at least one decision branch is required');
  const ids = new Set();
  for (const branch of branches) {
    assertSafeLocator(branch.id, 'branch.id');
    if (ids.has(branch.id)) throw new Error(`duplicate branch id: ${branch.id}`);
    ids.add(branch.id);
  }
  for (const branch of branches) {
    if (!Array.isArray(branch.dependsOn || [])) throw new Error(`${branch.id}: dependsOn must be an array`);
    for (const dependency of branch.dependsOn || []) {
      if (!ids.has(dependency)) throw new Error(`${branch.id}: unknown dependency ${dependency}`);
      if (dependency === branch.id) throw new Error(`${branch.id}: branch cannot depend on itself`);
    }
  }
  const visiting = new Set();
  const visited = new Set();
  const byId = new Map(branches.map((branch) => [branch.id, branch]));
  function visit(id) {
    if (visiting.has(id)) throw new Error(`decision branch dependency cycle at ${id}`);
    if (visited.has(id)) return;
    visiting.add(id);
    for (const dependency of byId.get(id).dependsOn || []) visit(dependency);
    visiting.delete(id);
    visited.add(id);
  }
  for (const id of ids) visit(id);
}

function normalizeBranches(branches) {
  assertBranchGraph(branches);
  return branches.map((branch, index) => ({
    id: assertSafeLocator(branch.id, `branches[${index}].id`),
    title: assertText(branch.title || branch.id, `branches[${index}].title`),
    question: assertText(branch.question, `branches[${index}].question`),
    recommendation: assertText(branch.recommendation, `branches[${index}].recommendation`),
    rationale: assertText(branch.rationale, `branches[${index}].rationale`),
    dependsOn: [...(branch.dependsOn || [])],
    codebaseAnswerable: branch.codebaseAnswerable === true,
    status: 'pending',
    answer: null,
    resolutionSource: null,
    evidenceLocators: [],
    resolvedAt: null,
  }));
}

function branchDefinition(branch) {
  return {
    id: branch.id,
    title: branch.title || branch.id,
    question: branch.question,
    recommendation: branch.recommendation,
    rationale: branch.rationale,
    dependsOn: [...(branch.dependsOn || [])],
    codebaseAnswerable: branch.codebaseAnswerable === true,
  };
}

function validateSession(session) {
  if (!session || typeof session !== 'object' || Array.isArray(session)) throw new Error('Grill Me session must be an object');
  if (session.schemaVersion !== 1 || session.protocolId !== PROTOCOL_ID) throw new Error('invalid Grill Me protocol version');
  assertSafeLocator(session.sessionId, 'sessionId');
  assertAgentId(session.owningAgentId, 'owningAgentId');
  assertText(session.subject, 'subject');
  assertTriggerIdentity(session.triggerIdentity);
  if (!Array.isArray(session.sourceLocators)) throw new Error('sourceLocators must be an array');
  session.sourceLocators.forEach((locator, index) => assertSafeLocator(locator, `sourceLocators[${index}]`));
  if (!SESSION_STATUSES.has(session.status)) throw new Error(`invalid Grill Me status: ${session.status}`);
  if (!Number.isInteger(session.revision) || session.revision < 0) throw new Error('revision must be a non-negative integer');
  assertIso(session.startedAt, 'startedAt');
  assertIso(session.updatedAt, 'updatedAt');
  if (session.finishedAt != null) assertIso(session.finishedAt, 'finishedAt');
  const authorityKeys = [
    'canonicalQueueWrite', 'canonicalBrainWrite', 'approvalGrant', 'externalDelivery',
    'spend', 'accountChange', 'artifactAcceptance',
  ];
  if (
    !session.authority
    || Object.keys(session.authority).length !== authorityKeys.length
    || authorityKeys.some((key) => session.authority[key] !== false)
  ) {
    throw new Error('Grill Me cannot hold write, approval, delivery, spend, account, or acceptance authority');
  }
  if (!Array.isArray(session.branches)) throw new Error('branches must be an array');
  assertBranchGraph(session.branches);
  const asked = session.branches.filter((branch) => branch.status === 'asked');
  if (asked.length > 1) throw new Error('Grill Me may have at most one active question');
  for (const branch of session.branches) {
    if (!BRANCH_STATUSES.has(branch.status)) throw new Error(`${branch.id}: invalid branch status`);
    assertText(branch.question, `${branch.id}.question`);
    assertText(branch.recommendation, `${branch.id}.recommendation`);
    assertText(branch.rationale, `${branch.id}.rationale`);
    if (branch.status === 'resolved') {
      assertText(branch.answer, `${branch.id}.answer`);
      if (!RESOLUTION_SOURCES.has(branch.resolutionSource)) throw new Error(`${branch.id}: invalid resolution source`);
      assertIso(branch.resolvedAt, `${branch.id}.resolvedAt`);
      if (branch.resolutionSource !== 'user' && (!Array.isArray(branch.evidenceLocators) || !branch.evidenceLocators.length)) {
        throw new Error(`${branch.id}: source-resolved branch requires evidence locators`);
      }
    }
    (branch.evidenceLocators || []).forEach((locator, index) => assertSafeLocator(locator, `${branch.id}.evidenceLocators[${index}]`));
  }
  const activeId = asked[0]?.id || null;
  if ((session.currentQuestionId || null) !== activeId) throw new Error('currentQuestionId does not match the active branch');
  const allResolved = session.branches.every((branch) => branch.status === 'resolved');
  if (session.status === 'shared_understanding' && !allResolved) throw new Error('shared understanding requires every branch to be resolved');
  if (session.status === 'shared_understanding' && !session.finishedAt) throw new Error('shared understanding requires finishedAt');
  if (!Array.isArray(session.decisions)) throw new Error('decisions must be an array');
  if (session.decisions.length !== session.branches.filter((branch) => branch.status === 'resolved').length) {
    throw new Error('decision count must match resolved branch count');
  }
  return session;
}

function branchShape(branch, session) {
  const resolved = session.branches.filter((candidate) => candidate.status === 'resolved').length;
  return {
    id: branch.id,
    ordinal: resolved + 1,
    total: session.branches.length,
    question: branch.question,
    recommendation: branch.recommendation,
    rationale: branch.rationale,
    prompt: `Q${resolved + 1}/${session.branches.length}: ${branch.question}\nRecommended answer: ${branch.recommendation} ${branch.rationale}`,
  };
}

class GrillSession {
  constructor(options = {}) {
    this.sessionPath = assertSessionPath(options.sessionPath);
    this.clock = options.clock || (() => new Date());
    if (fs.existsSync(this.sessionPath)) {
      this.session = validateSession(JSON.parse(fs.readFileSync(this.sessionPath, 'utf8')));
      if (options.owningAgentId && this.session.owningAgentId !== options.owningAgentId) {
        throw new Error('Grill Me owning agent changed; start a new session');
      }
      if (options.subject && this.session.subject !== options.subject.trim()) {
        throw new Error('Grill Me subject changed; start a new session');
      }
      if (options.sessionId && this.session.sessionId !== options.sessionId) {
        throw new Error('Grill Me session identity changed; start a new session');
      }
      if (options.triggerIdentity && JSON.stringify(this.session.triggerIdentity) !== JSON.stringify(assertTriggerIdentity(options.triggerIdentity))) {
        throw new Error('Grill Me trigger identity changed; start a new session');
      }
      if (options.sourceLocators) {
        const declared = options.sourceLocators.map((locator, index) => assertSafeLocator(locator, `sourceLocators[${index}]`));
        if (JSON.stringify(this.session.sourceLocators) !== JSON.stringify(declared)) {
          throw new Error('Grill Me source locators changed; start a new session');
        }
      }
      if (options.branches) {
        assertBranchGraph(options.branches);
        const current = this.session.branches.map(branchDefinition);
        const declared = options.branches.map(branchDefinition);
        if (JSON.stringify(current) !== JSON.stringify(declared)) {
          throw new Error('Grill Me decision tree changed; start a new session');
        }
      }
      return;
    }
    const startedAt = isoNow(this.clock);
    this.session = {
      schemaVersion: 1,
      protocolId: PROTOCOL_ID,
      sessionId: options.sessionId || `GRILL-${crypto.randomUUID()}`,
      owningAgentId: assertAgentId(options.owningAgentId, 'owningAgentId'),
      subject: assertText(options.subject, 'subject'),
      triggerIdentity: assertTriggerIdentity(options.triggerIdentity),
      sourceLocators: (options.sourceLocators || []).map((locator, index) => assertSafeLocator(locator, `sourceLocators[${index}]`)),
      invocation: 'explicit-user-only',
      questionPolicy: 'one-at-a-time-depth-first',
      status: 'in_progress',
      revision: 0,
      currentQuestionId: null,
      branches: normalizeBranches(options.branches),
      decisions: [],
      blockedReason: null,
      authority: {
        canonicalQueueWrite: false,
        canonicalBrainWrite: false,
        approvalGrant: false,
        externalDelivery: false,
        spend: false,
        accountChange: false,
        artifactAcceptance: false,
      },
      startedAt,
      updatedAt: startedAt,
      finishedAt: null,
    };
    this.save();
  }

  save() {
    this.session.updatedAt = isoNow(this.clock);
    validateSession(this.session);
    atomicWriteJson(this.sessionPath, this.session);
  }

  readyBranch() {
    if (this.session.status !== 'in_progress') return null;
    const active = this.session.branches.find((branch) => branch.status === 'asked');
    if (active) return active;
    return this.session.branches.find((branch) => (
      branch.status === 'pending'
      && branch.dependsOn.every((dependency) => this.session.branches.find((candidate) => candidate.id === dependency)?.status === 'resolved')
    )) || null;
  }

  askNext() {
    const branch = this.readyBranch();
    if (!branch) return null;
    if (branch.status === 'pending' && branch.codebaseAnswerable) {
      throw new Error(`${branch.id} is marked source-answerable; inspect and resolve it before asking Dillon`);
    }
    if (branch.status === 'pending') {
      branch.status = 'asked';
      this.session.currentQuestionId = branch.id;
      this.save();
    }
    return branchShape(branch, this.session);
  }

  recordResolution(branch, answer, resolutionSource, evidenceLocators = []) {
    branch.status = 'resolved';
    branch.answer = assertText(answer, `${branch.id}.answer`);
    branch.resolutionSource = resolutionSource;
    branch.evidenceLocators = evidenceLocators.map((locator, index) => assertSafeLocator(locator, `${branch.id}.evidenceLocators[${index}]`));
    branch.resolvedAt = isoNow(this.clock);
    this.session.currentQuestionId = null;
    this.session.revision += 1;
    this.session.decisions.push({
      branchId: branch.id,
      answer: branch.answer,
      recommendation: branch.recommendation,
      resolutionSource,
      evidenceLocators: branch.evidenceLocators,
      resolvedAt: branch.resolvedAt,
    });
    if (this.session.branches.every((candidate) => candidate.status === 'resolved')) {
      this.session.status = 'shared_understanding';
      this.session.finishedAt = isoNow(this.clock);
    }
    this.save();
    return this.session;
  }

  answerCurrent(answer, evidenceLocators = []) {
    const branch = this.session.branches.find((candidate) => candidate.status === 'asked');
    if (!branch) throw new Error('there is no active Grill Me question');
    return this.recordResolution(branch, answer, 'user', evidenceLocators);
  }

  resolveFromSource(branchId, options = {}) {
    const branch = this.session.branches.find((candidate) => candidate.id === branchId);
    if (!branch) throw new Error(`unknown decision branch: ${branchId}`);
    if (branch.status !== 'pending') throw new Error(`${branchId} is not pending`);
    if (!branch.dependsOn.every((dependency) => this.session.branches.find((candidate) => candidate.id === dependency)?.status === 'resolved')) {
      throw new Error(`${branchId} dependencies are not resolved`);
    }
    const source = options.source || 'codebase';
    if (!RESOLUTION_SOURCES.has(source) || source === 'user') throw new Error('source resolution must use a non-user evidence source');
    if (!Array.isArray(options.evidenceLocators) || !options.evidenceLocators.length) {
      throw new Error('source resolution requires at least one evidence locator');
    }
    return this.recordResolution(branch, options.answer, source, options.evidenceLocators);
  }

  block(reason) {
    if (this.session.status !== 'in_progress') throw new Error('only an active Grill Me session can be blocked');
    this.session.status = 'blocked';
    this.session.blockedReason = assertText(reason, 'blockedReason');
    this.session.finishedAt = isoNow(this.clock);
    this.session.revision += 1;
    this.save();
    return this.session;
  }
}

module.exports = {
  BRANCH_STATUSES,
  GrillSession,
  PROTOCOL_ID,
  RESOLUTION_SOURCES,
  SESSION_STATUSES,
  assertBranchGraph,
  assertSessionPath,
  validateSession,
};
