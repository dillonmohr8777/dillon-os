const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const RUN_STATUSES = new Set([
  'running',
  'degraded',
  'failed',
  'awaiting_review',
  'complete',
]);
const ITEM_STATUSES = new Set([
  'pending',
  'running',
  'completed',
  'failed',
  'blocked',
  'skipped',
]);
const TRIGGER_KINDS = new Set(['user', 'schedule', 'connector']);
const APPROVAL_GATES = new Set(['none', 'explicit', 'human_authentication']);
const APPROVAL_STATUSES = new Set(['not_required', 'pending', 'approved']);

function isoNow(clock = () => new Date()) {
  return clock().toISOString();
}

function sha256Buffer(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function sha256File(filePath) {
  return sha256Buffer(fs.readFileSync(filePath));
}

function stableItemInputHash(value) {
  return sha256Buffer(typeof value === 'string' || Buffer.isBuffer(value) ? value : JSON.stringify(value));
}

function assertSafeLocator(locator, field = 'locator') {
  if (typeof locator !== 'string' || !locator.trim()) {
    throw new Error(`${field} must be a non-empty string`);
  }
  const value = locator.trim();
  if (/^[A-Za-z]:[\\/]/.test(value) || /^\\\\/.test(value) || /^\/(?:Users|home)\//i.test(value)) {
    throw new Error(`${field} must not expose a private absolute path`);
  }
  if (/(?:api[_-]?key|token|password|secret)\s*[=:]/i.test(value)) {
    throw new Error(`${field} must not contain credential-shaped data`);
  }
  return value;
}

function assertTriggerIdentity(identity) {
  if (!identity || typeof identity !== 'object') {
    throw new Error('triggerIdentity is required');
  }
  if (!TRIGGER_KINDS.has(identity.kind)) {
    throw new Error('triggerIdentity.kind must be user, schedule, or connector');
  }
  return {
    kind: identity.kind,
    locator: assertSafeLocator(identity.locator, 'triggerIdentity.locator'),
  };
}

function validateManifest(manifest) {
  if (!manifest || typeof manifest !== 'object') throw new Error('run manifest must be an object');
  if (manifest.schemaVersion !== 1) throw new Error('run manifest schemaVersion must be 1');
  if (typeof manifest.workflowId !== 'string' || !manifest.workflowId) {
    throw new Error('run manifest workflowId is required');
  }
  if (typeof manifest.runId !== 'string' || !manifest.runId) throw new Error('run manifest runId is required');
  assertTriggerIdentity(manifest.triggerIdentity);
  if (!Array.isArray(manifest.sourceLocators)) throw new Error('run manifest sourceLocators must be an array');
  manifest.sourceLocators.forEach((locator, index) => assertSafeLocator(locator, `sourceLocators[${index}]`));
  if (!manifest.approval || !APPROVAL_GATES.has(manifest.approval.gate)) {
    throw new Error('run manifest approval.gate is invalid');
  }
  if (!APPROVAL_STATUSES.has(manifest.approval.status)) {
    throw new Error('run manifest approval.status is invalid');
  }
  if (!manifest.budget || typeof manifest.budget !== 'object') throw new Error('run manifest budget is required');
  if (manifest.budget.tokens != null && (!Number.isInteger(manifest.budget.tokens) || manifest.budget.tokens < 0)) {
    throw new Error('run manifest budget.tokens must be a non-negative integer or null');
  }
  if (
    manifest.budget.timeoutSeconds != null &&
    (!Number.isFinite(manifest.budget.timeoutSeconds) || manifest.budget.timeoutSeconds < 0)
  ) {
    throw new Error('run manifest budget.timeoutSeconds must be a non-negative number or null');
  }
  if (!RUN_STATUSES.has(manifest.status)) throw new Error(`invalid run status: ${manifest.status}`);
  if (!Array.isArray(manifest.items)) throw new Error('run manifest items must be an array');
  const seen = new Set();
  for (const item of manifest.items) {
    if (!item || typeof item.id !== 'string' || !item.id) throw new Error('run item id is required');
    if (seen.has(item.id)) throw new Error(`duplicate run item id: ${item.id}`);
    seen.add(item.id);
    if (!ITEM_STATUSES.has(item.status)) throw new Error(`invalid item status for ${item.id}: ${item.status}`);
    if (!Number.isInteger(item.attempts) || item.attempts < 0) {
      throw new Error(`item attempts must be a non-negative integer: ${item.id}`);
    }
    if (item.maxAttempts != null && (!Number.isInteger(item.maxAttempts) || item.maxAttempts < 1)) {
      throw new Error(`item maxAttempts must be a positive integer: ${item.id}`);
    }
  }
  return manifest;
}

function atomicWriteJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const payload = `${JSON.stringify(value, null, 2)}\n`;
  JSON.parse(payload);
  const tempPath = `${filePath}.${process.pid}.${crypto.randomUUID()}.tmp`;
  const previousPath = `${filePath}.previous`;
  const fd = fs.openSync(tempPath, 'wx');
  try {
    fs.writeFileSync(fd, payload, 'utf8');
    fs.fsyncSync(fd);
  } finally {
    fs.closeSync(fd);
  }
  if (fs.existsSync(filePath)) fs.copyFileSync(filePath, previousPath);
  fs.renameSync(tempPath, filePath);
}

function artifactEvidence(rootDir, artifactPaths) {
  const root = path.resolve(rootDir);
  return [...new Set(artifactPaths)].sort().map((artifactPath) => {
    const absolute = path.resolve(root, artifactPath);
    const relative = path.relative(root, absolute);
    if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
      throw new Error(`artifact escapes run root: ${artifactPath}`);
    }
    const stat = fs.statSync(absolute);
    if (!stat.isFile()) throw new Error(`artifact is not a file: ${artifactPath}`);
    return {
      path: relative.split(path.sep).join('/'),
      sha256: sha256File(absolute),
      bytes: stat.size,
    };
  });
}

function createRunId(workflowId, clock) {
  const stamp = isoNow(clock).replace(/[-:.TZ]/g, '').slice(0, 14);
  return `RUN-${workflowId}-${stamp}-${crypto.randomUUID().slice(0, 8)}`;
}

class AgentRun {
  constructor(options) {
    if (!options || typeof options !== 'object') throw new Error('AgentRun options are required');
    this.manifestPath = path.resolve(options.manifestPath);
    this.clock = options.clock || (() => new Date());
    this.maxAttempts = options.maxAttempts ?? 3;
    if (!Number.isInteger(this.maxAttempts) || this.maxAttempts < 1) {
      throw new Error('maxAttempts must be a positive integer');
    }
    const itemInputs = options.items || [];
    if (!Array.isArray(itemInputs) || !itemInputs.length) throw new Error('AgentRun items are required');
    const declaredTriggerIdentity = assertTriggerIdentity(options.triggerIdentity);
    const declaredSourceLocators = (options.sourceLocators || []).map((locator, index) =>
      assertSafeLocator(locator, `sourceLocators[${index}]`)
    );
    const declaredItems = itemInputs.map((item) => ({
      id: assertSafeLocator(item.id, 'item.id'),
      inputHash: item.inputHash || stableItemInputHash(item.input ?? item.id),
      status: 'pending',
      attempts: 0,
      maxAttempts: this.maxAttempts,
      checkpoint: null,
      artifacts: [],
      verification: [],
      retryable: true,
      lastError: null,
    }));

    if (fs.existsSync(this.manifestPath)) {
      this.manifest = validateManifest(JSON.parse(fs.readFileSync(this.manifestPath, 'utf8')));
      if (this.manifest.workflowId !== options.workflowId) {
        throw new Error(`run manifest workflow mismatch: ${this.manifest.workflowId}`);
      }
      if (options.runId && this.manifest.runId !== options.runId) {
        throw new Error(`run manifest id mismatch: ${this.manifest.runId}`);
      }
      if (JSON.stringify(this.manifest.triggerIdentity) !== JSON.stringify(declaredTriggerIdentity)) {
        throw new Error('run trigger identity changed; start a new run manifest');
      }
      if (JSON.stringify(this.manifest.sourceLocators) !== JSON.stringify(declaredSourceLocators)) {
        throw new Error('run source locators changed; start a new run manifest');
      }
      if ((this.manifest.clientId ?? null) !== (options.clientId ?? null)) {
        throw new Error('run client route changed; start a new run manifest');
      }
      if ((this.manifest.workItemId ?? null) !== (options.workItemId ?? null)) {
        throw new Error('run work item changed; start a new run manifest');
      }
      const currentById = new Map(this.manifest.items.map((item) => [item.id, item]));
      if (currentById.size !== declaredItems.length) {
        throw new Error('run item set changed; start a new run manifest');
      }
      for (const declared of declaredItems) {
        const current = currentById.get(declared.id);
        if (!current) throw new Error(`run item set changed; missing ${declared.id}`);
        if (current.inputHash !== declared.inputHash) {
          throw new Error(`run item input changed for ${declared.id}; start a new run manifest`);
        }
        if ((current.maxAttempts ?? this.maxAttempts) !== this.maxAttempts) {
          throw new Error(`run retry limit changed for ${declared.id}; start a new run manifest`);
        }
        if (current.status === 'running') {
          current.status = 'pending';
          current.lastError = 'interrupted before checkpoint completion';
        }
      }
      this.manifest.status = 'running';
      this.manifest.updatedAt = isoNow(this.clock);
      this.save();
      return;
    }

    const startedAt = isoNow(this.clock);
    this.manifest = {
      schemaVersion: 1,
      workflowId: options.workflowId,
      runId: options.runId || createRunId(options.workflowId, this.clock),
      workItemId: options.workItemId ?? null,
      clientId: options.clientId ?? null,
      triggerIdentity: declaredTriggerIdentity,
      sourceLocators: declaredSourceLocators,
      approval: {
        gate: options.approval?.gate || 'none',
        status: options.approval?.status || 'not_required',
      },
      budget: {
        tokens: options.budget?.tokens ?? null,
        timeoutSeconds: options.budget?.timeoutSeconds ?? null,
      },
      steps: [],
      items: declaredItems,
      acceptanceChecks: [],
      artifacts: [],
      status: 'running',
      startedAt,
      updatedAt: startedAt,
    };
    validateManifest(this.manifest);
    this.save();
  }

  save() {
    this.manifest.updatedAt = isoNow(this.clock);
    validateManifest(this.manifest);
    atomicWriteJson(this.manifestPath, this.manifest);
  }

  getItem(id) {
    const item = this.manifest.items.find((candidate) => candidate.id === id);
    if (!item) throw new Error(`unknown run item: ${id}`);
    return item;
  }

  shouldRun(id) {
    const item = this.getItem(id);
    if (item.status === 'completed' || item.status === 'blocked' || item.status === 'skipped') return false;
    if (item.status === 'failed' && (!item.retryable || item.attempts >= (item.maxAttempts ?? this.maxAttempts))) {
      return false;
    }
    return true;
  }

  assertBudget() {
    const timeoutSeconds = this.manifest.budget.timeoutSeconds;
    if (Number.isFinite(timeoutSeconds) && timeoutSeconds >= 0) {
      const elapsed = (Date.now() - Date.parse(this.manifest.startedAt)) / 1000;
      if (elapsed > timeoutSeconds) throw new Error(`run timeout budget exhausted after ${elapsed.toFixed(3)}s`);
    }
  }

  startItem(id) {
    this.assertBudget();
    const item = this.getItem(id);
    if (!this.shouldRun(id)) throw new Error(`run item is not resumable: ${id}`);
    item.status = 'running';
    item.attempts += 1;
    item.lastError = null;
    item.startedAt = isoNow(this.clock);
    this.save();
    return item;
  }

  finishItem(id, outcome = {}) {
    const item = this.getItem(id);
    const status = outcome.status || 'completed';
    if (!ITEM_STATUSES.has(status) || status === 'pending' || status === 'running') {
      throw new Error(`invalid finished item status: ${status}`);
    }
    item.status = status;
    item.retryable = outcome.retryable === true;
    item.checkpoint = outcome.checkpoint ?? item.checkpoint;
    item.artifacts = outcome.artifacts || [];
    item.verification = outcome.verification || [];
    item.lastError = outcome.error || null;
    item.finishedAt = isoNow(this.clock);
    this.save();
    return item;
  }

  updateItem(id, patch = {}) {
    const item = this.getItem(id);
    if ('checkpoint' in patch) item.checkpoint = patch.checkpoint;
    if ('artifacts' in patch) item.artifacts = patch.artifacts;
    if ('verification' in patch) item.verification = patch.verification;
    this.save();
  }

  setAcceptanceChecks(checks) {
    this.manifest.acceptanceChecks = checks;
    this.save();
  }

  finalize(status, options = {}) {
    if (!RUN_STATUSES.has(status) || status === 'running') throw new Error(`invalid final run status: ${status}`);
    this.manifest.status = status;
    if (options.approval) this.manifest.approval = options.approval;
    if (options.artifacts) this.manifest.artifacts = options.artifacts;
    if (options.steps) this.manifest.steps = options.steps;
    this.manifest.finishedAt = isoNow(this.clock);
    this.save();
    return this.manifest;
  }
}

module.exports = {
  AgentRun,
  RUN_STATUSES,
  ITEM_STATUSES,
  artifactEvidence,
  assertSafeLocator,
  assertTriggerIdentity,
  atomicWriteJson,
  sha256File,
  stableItemInputHash,
  validateManifest,
};
