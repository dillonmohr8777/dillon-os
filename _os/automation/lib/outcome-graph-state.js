'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const {
  OutcomeGraphFault,
  OutcomeGraphInterruption,
  runOutcomeGraph,
  sha256,
  stableJson,
  validateContract,
} = require('./outcome-graph');

const STATE_SCHEMA_VERSION = 1;

function nonEmpty(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function nowDate(now) {
  const value = typeof now === 'function' ? now() : new Date();
  const date = value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(date.getTime())) {
    throw new OutcomeGraphFault('invalid_clock', 'Durable state clock returned an invalid date');
  }
  return date;
}

function assertStateRoot(candidate) {
  if (!nonEmpty(candidate)) {
    throw new OutcomeGraphFault('missing_state_root', 'A durable state root is required');
  }
  const root = path.resolve(candidate);
  if (path.parse(root).root === root) {
    throw new OutcomeGraphFault('unsafe_state_root', 'The filesystem root cannot be a durable state root');
  }
  return root;
}

function assertInside(root, candidate) {
  const absolute = path.resolve(candidate);
  const relative = path.relative(root, absolute);
  if (relative.startsWith('..' + path.sep) || relative === '..' || path.isAbsolute(relative)) {
    throw new OutcomeGraphFault('state_path_escape', 'Durable state path escapes its configured root');
  }
  return absolute;
}

function statePath(root, ...parts) {
  return assertInside(root, path.join(root, ...parts));
}

function stateRelative(root, file) {
  const absolute = assertInside(root, file);
  return path.relative(root, absolute).replace(/\\/g, '/');
}

function resolveStateReference(root, reference) {
  if (!nonEmpty(reference)) {
    throw new OutcomeGraphFault('invalid_state_reference', 'Durable state reference is empty');
  }
  return assertInside(root, path.join(root, reference));
}

function readJsonStrict(file, { allowMissing = false } = {}) {
  let text;
  try {
    text = fs.readFileSync(file, 'utf8');
  } catch (error) {
    if (allowMissing && error?.code === 'ENOENT') return null;
    throw new OutcomeGraphFault(
      'state_read_failed',
      'Cannot read durable state ' + file + ': ' + error.message
    );
  }
  try {
    return JSON.parse(text.replace(/^\uFEFF/, ''));
  } catch (error) {
    throw new OutcomeGraphFault(
      'state_corrupt',
      'Durable state is not valid JSON at ' + file + ': ' + error.message
    );
  }
}

function writeJsonAtomic(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temp = file + '.tmp-' + process.pid + '-' + crypto.randomBytes(6).toString('hex');
  const serialized = JSON.stringify(value, null, 2) + '\n';
  let descriptor;
  try {
    descriptor = fs.openSync(temp, 'wx');
    fs.writeFileSync(descriptor, serialized, 'utf8');
    fs.fsyncSync(descriptor);
    fs.closeSync(descriptor);
    descriptor = null;
    fs.renameSync(temp, file);
  } catch (error) {
    if (descriptor !== null && descriptor !== undefined) {
      try { fs.closeSync(descriptor); } catch {}
    }
    try { fs.unlinkSync(temp); } catch {}
    throw new OutcomeGraphInterruption(
      'checkpoint_write_failed',
      'Atomic durable-state write failed for ' + file + ': ' + error.message
    );
  }
}

function readJsonWithSha(file, { allowMissing = false } = {}) {
  let bytes;
  try {
    bytes = fs.readFileSync(file);
  } catch (error) {
    if (allowMissing && error?.code === 'ENOENT') {
      return { value: null, sha256: null, bytes: 0 };
    }
    throw new OutcomeGraphFault(
      'state_read_failed',
      'Cannot read durable state ' + file + ': ' + error.message
    );
  }
  let value;
  try {
    value = JSON.parse(bytes.toString('utf8').replace(/^\uFEFF/, ''));
  } catch (error) {
    throw new OutcomeGraphFault(
      'state_corrupt',
      'Durable state is not valid JSON at ' + file + ': ' + error.message
    );
  }
  return { value, sha256: sha256(bytes), bytes: bytes.length };
}

function writeRevisionedJson(file, value, expectedSha256) {
  const current = readJsonWithSha(file, { allowMissing: true });
  if (arguments.length >= 3 && current.sha256 !== expectedSha256) {
    throw new OutcomeGraphInterruption(
      'state_revision_conflict',
      'Durable state changed outside the active lease at ' + file
    );
  }
  const currentRevision = Number.isInteger(current.value?.state_revision)
    ? current.value.state_revision
    : 0;
  const next = {
    ...value,
    state_revision: currentRevision + 1,
    previous_state_sha256: current.sha256,
  };
  writeJsonAtomic(file, next);
  const readback = readJsonWithSha(file);
  if (stableJson(readback.value) !== stableJson(next)) {
    throw new OutcomeGraphInterruption(
      'state_readback_failed',
      'Durable state readback did not match the atomic write at ' + file
    );
  }
  return readback;
}

function validateCanonicalBinding(binding) {
  const errors = [];
  if (!nonEmpty(binding?.locator)) errors.push('locator is required');
  if (!(nonEmpty(binding?.version) || Number.isFinite(binding?.version))) {
    errors.push('version is required');
  }
  if (!/^[a-f0-9]{64}$/i.test(String(binding?.sha256 || ''))) {
    errors.push('sha256 must be a SHA-256 digest');
  }
  if (errors.length > 0) {
    throw new OutcomeGraphFault(
      'invalid_canonical_binding',
      'Canonical binding is invalid: ' + errors.join('; ')
    );
  }
  return {
    locator: binding.locator.trim(),
    version: String(binding.version),
    sha256: String(binding.sha256).toLowerCase(),
    captured_at: nonEmpty(binding.captured_at) ? binding.captured_at : null,
  };
}

function canonicalBindingFingerprint(binding) {
  const normalized = validateCanonicalBinding(binding);
  return sha256(stableJson({
    locator: normalized.locator,
    version: normalized.version,
    sha256: normalized.sha256,
  }));
}

function semanticContractFingerprint(contract) {
  const normalized = structuredClone(contract);
  if (normalized.source_freshness) delete normalized.source_freshness.checked_at;
  return sha256(stableJson(normalized));
}

function computeDedupeIdentity(contract, binding) {
  return sha256(stableJson({
    graph_id: contract.graph_id,
    dedupe_key: contract.governance.dedupe_key,
    contract_fingerprint: semanticContractFingerprint(contract),
    canonical_binding_fingerprint: canonicalBindingFingerprint(binding),
  }));
}

function leaseDirectory(root, identity) {
  if (!/^[a-f0-9]{64}$/i.test(String(identity || ''))) {
    throw new OutcomeGraphFault('invalid_dedupe_identity', 'Dedupe identity must be a SHA-256 digest');
  }
  return statePath(root, 'leases', identity + '.lock');
}

function acquireLease(rootCandidate, identity, options = {}) {
  const root = assertStateRoot(rootCandidate);
  const leaseSeconds = Number.isInteger(options.leaseSeconds) && options.leaseSeconds > 0
    ? options.leaseSeconds
    : 300;
  const ownerId = nonEmpty(options.ownerId)
    ? options.ownerId
    : process.pid + '-' + crypto.randomBytes(8).toString('hex');
  const lockDir = leaseDirectory(root, identity);
  fs.mkdirSync(path.dirname(lockDir), { recursive: true });

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const acquiredAt = nowDate(options.now);
    try {
      fs.mkdirSync(lockDir);
      const owner = {
        schema_version: STATE_SCHEMA_VERSION,
        owner_id: ownerId,
        acquired_at: acquiredAt.toISOString(),
        expires_at: new Date(acquiredAt.getTime() + leaseSeconds * 1000).toISOString(),
      };
      writeJsonAtomic(path.join(lockDir, 'owner.json'), owner);
      return { root, identity, ownerId, lockDir, leaseSeconds, now: options.now };
    } catch (error) {
      if (error?.code !== 'EEXIST') throw error;
      const ownerFile = path.join(lockDir, 'owner.json');
      const owner = readJsonStrict(ownerFile);
      const expiresAt = Date.parse(owner.expires_at);
      if (!Number.isFinite(expiresAt)) {
        throw new OutcomeGraphFault(
          'dedupe_lease_corrupt',
          'The existing dedupe lease has no valid expiration'
        );
      }
      if (expiresAt > acquiredAt.getTime()) {
        throw new OutcomeGraphFault(
          'dedupe_lease_active',
          'Another run owns the dedupe lease until ' + owner.expires_at
        );
      }

      const quarantine = assertInside(
        root,
        lockDir + '.stale-' + ownerId + '-' + crypto.randomBytes(4).toString('hex')
      );
      try {
        fs.renameSync(lockDir, quarantine);
      } catch (renameError) {
        if (renameError?.code === 'ENOENT' || renameError?.code === 'EEXIST') continue;
        throw renameError;
      }
      fs.rmSync(quarantine, { recursive: true, force: true });
    }
  }
  throw new OutcomeGraphFault('dedupe_lease_race', 'Could not acquire the dedupe lease safely');
}

function renewLease(lease) {
  const ownerFile = assertInside(lease.root, path.join(lease.lockDir, 'owner.json'));
  const owner = readJsonStrict(ownerFile);
  if (owner.owner_id !== lease.ownerId) {
    throw new OutcomeGraphInterruption(
      'dedupe_lease_lost',
      'The durable run no longer owns its dedupe lease'
    );
  }
  const renewedAt = nowDate(lease.now);
  writeJsonAtomic(ownerFile, {
    ...owner,
    renewed_at: renewedAt.toISOString(),
    expires_at: new Date(renewedAt.getTime() + lease.leaseSeconds * 1000).toISOString(),
  });
}

function releaseLease(lease) {
  if (!lease || !fs.existsSync(lease.lockDir)) return false;
  const ownerFile = assertInside(lease.root, path.join(lease.lockDir, 'owner.json'));
  let owner;
  try {
    owner = readJsonStrict(ownerFile);
  } catch {
    return false;
  }
  if (owner.owner_id !== lease.ownerId) return false;
  const verifiedLockDir = assertInside(lease.root, lease.lockDir);
  fs.rmSync(verifiedLockDir, { recursive: true, force: true });
  return true;
}

function makeDurableRunId(contract, startedAt) {
  return 'OGD-' + startedAt.slice(0, 10).replace(/-/g, '') + '-' +
    sha256(contract.graph_id + '|' + startedAt + '|' + crypto.randomBytes(8).toString('hex'))
      .slice(0, 12)
      .toUpperCase();
}

function stripResumeLocators(value) {
  if (Array.isArray(value)) return value.map(stripResumeLocators);
  if (value && typeof value === 'object') {
    return Object.entries(value).reduce((out, [key, child]) => {
      if (key !== 'resume_locator') out[key] = stripResumeLocators(child);
      return out;
    }, {});
  }
  return value;
}

function appendEvent(checkpoint, event, at, details = {}) {
  const events = Array.isArray(checkpoint.events) ? checkpoint.events : [];
  const sequence = Number.isInteger(checkpoint.event_sequence)
    ? checkpoint.event_sequence + 1
    : 1;
  events.push({ sequence, event, at, ...details });
  checkpoint.events = events.slice(-200);
  checkpoint.event_sequence = sequence;
  checkpoint.last_event = event;
  checkpoint.updated_at = at;
}

async function readBinding(reader) {
  if (typeof reader !== 'function') {
    throw new OutcomeGraphFault(
      'missing_canonical_binding_reader',
      'Durable execution requires a canonical binding reader'
    );
  }
  return validateCanonicalBinding(await reader());
}

async function runDurableOutcomeGraph(contract, options = {}) {
  const validation = validateContract(contract);
  if (!validation.ok) {
    throw new OutcomeGraphFault('invalid_contract', validation.errors.join('; '));
  }
  const root = assertStateRoot(options.stateRoot);
  fs.mkdirSync(root, { recursive: true });
  const initialBinding = await readBinding(options.readCanonicalBinding);
  const bindingFingerprint = canonicalBindingFingerprint(initialBinding);
  const contractFingerprint = semanticContractFingerprint(contract);
  const dedupeIdentity = computeDedupeIdentity(contract, initialBinding);
  const dedupeFile = statePath(root, 'dedupe', dedupeIdentity + '.json');
  let lease;

  try {
    const effectiveLeaseSeconds = Math.max(
      Number.isInteger(options.leaseSeconds) && options.leaseSeconds > 0
        ? options.leaseSeconds
        : 300,
      contract.stopping.timeout_seconds + 30
    );
    lease = acquireLease(root, dedupeIdentity, {
      leaseSeconds: effectiveLeaseSeconds,
      ownerId: options.ownerId,
      now: options.now,
    });

    const lockedBinding = await readBinding(options.readCanonicalBinding);
    if (canonicalBindingFingerprint(lockedBinding) !== bindingFingerprint) {
      throw new OutcomeGraphFault(
        'canonical_state_drift_before_start',
        'Canonical state changed while the durable dedupe lease was being acquired'
      );
    }

    let dedupeState = readJsonWithSha(dedupeFile, { allowMissing: true });
    let dedupeRecord = dedupeState.value;
    let dedupeSha256 = dedupeState.sha256;
    if (dedupeRecord &&
        ['complete', 'awaiting_approval'].includes(dedupeRecord.status)) {
      const receiptFile = resolveStateReference(root, dedupeRecord.receipt.path);
      const receiptBytes = fs.readFileSync(receiptFile);
      if (sha256(receiptBytes) !== dedupeRecord.receipt.sha256) {
        throw new OutcomeGraphFault(
          'dedupe_receipt_corrupt',
          'The completed dedupe record does not match its receipt hash'
        );
      }
      const storedResult = JSON.parse(receiptBytes.toString('utf8').replace(/^\uFEFF/, ''));
      const priorResult = stripResumeLocators(storedResult);
      const stillTrue = typeof options.verifyCompletedResult === 'function'
        ? await options.verifyCompletedResult(priorResult)
        : false;
      if (stillTrue === true || stillTrue?.ok === true) {
        let dedupeNeedsWrite = !Number.isInteger(dedupeRecord.state_revision);
        if (stableJson(storedResult) !== stableJson(priorResult)) {
          writeJsonAtomic(receiptFile, priorResult);
          const sanitizedBytes = fs.readFileSync(receiptFile);
          dedupeRecord = {
            ...dedupeRecord,
            receipt: {
              path: stateRelative(root, receiptFile),
              sha256: sha256(sanitizedBytes),
              bytes: sanitizedBytes.length,
            },
            updated_at: nowDate(options.now).toISOString(),
          };
          dedupeNeedsWrite = true;
        }
        if (dedupeNeedsWrite) {
          dedupeState = writeRevisionedJson(dedupeFile, dedupeRecord, dedupeSha256);
          dedupeRecord = dedupeState.value;
          dedupeSha256 = dedupeState.sha256;
        }
        const completedCheckpointFile = resolveStateReference(
          root,
          dedupeRecord.checkpoint.path
        );
        const completedCheckpointState = readJsonWithSha(completedCheckpointFile);
        const sanitizedCheckpoint = stripResumeLocators(completedCheckpointState.value);
        if (!Number.isInteger(completedCheckpointState.value.state_revision) ||
            stableJson(completedCheckpointState.value) !== stableJson(sanitizedCheckpoint)) {
          writeRevisionedJson(
            completedCheckpointFile,
            sanitizedCheckpoint,
            completedCheckpointState.sha256
          );
        }
        return {
          ...priorResult,
          deduped: true,
          durable_state: {
            ...priorResult.durable_state,
            dedupe_hit: true,
          },
        };
      }
      dedupeRecord = {
        ...dedupeRecord,
        status: 'invalidated',
        invalidated_at: nowDate(options.now).toISOString(),
        invalidated_reason: 'Previously completed artifacts no longer revalidate.',
      };
      dedupeState = writeRevisionedJson(dedupeFile, dedupeRecord, dedupeSha256);
      dedupeRecord = dedupeState.value;
      dedupeSha256 = dedupeState.sha256;
    }

    let checkpoint = null;
    let checkpointSha256 = null;
    let resumed = false;
    if (dedupeRecord?.status === 'active') {
      if (dedupeRecord.contract_fingerprint !== contractFingerprint ||
          dedupeRecord.canonical_binding_fingerprint !== bindingFingerprint) {
        throw new OutcomeGraphFault(
          'active_dedupe_mismatch',
          'The active dedupe record does not match this contract and canonical binding'
        );
      }
      const checkpointState = readJsonWithSha(
        resolveStateReference(root, dedupeRecord.checkpoint.path)
      );
      checkpoint = checkpointState.value;
      checkpointSha256 = checkpointState.sha256;
      if (checkpoint.dedupe_identity !== dedupeIdentity ||
          checkpoint.run_id !== dedupeRecord.run_id) {
        throw new OutcomeGraphFault(
          'checkpoint_identity_mismatch',
          'The active checkpoint is bound to a different run or dedupe identity'
        );
      }
      resumed = true;
    }

    const startDate = resumed
      ? new Date(checkpoint.started_at)
      : nowDate(options.now);
    const startedAt = startDate.toISOString();
    const runId = resumed ? checkpoint.run_id : makeDurableRunId(contract, startedAt);
    const runDir = statePath(root, 'runs', runId);
    const checkpointFile = statePath(runDir, 'checkpoint.json');
    const receiptFile = statePath(runDir, 'receipt.json');

    if (!checkpoint) {
      checkpoint = {
        schema_version: STATE_SCHEMA_VERSION,
        run_id: runId,
        graph_id: contract.graph_id,
        dedupe_identity: dedupeIdentity,
        dedupe_key: contract.governance.dedupe_key,
        contract_fingerprint: contractFingerprint,
        canonical_binding: initialBinding,
        canonical_binding_fingerprint: bindingFingerprint,
        status: 'running',
        started_at: startedAt,
        updated_at: startedAt,
        event_sequence: 0,
        events: [],
        engine: null,
      };
      appendEvent(checkpoint, 'run_started', startedAt, { resumed: false });
      const checkpointState = writeRevisionedJson(checkpointFile, checkpoint, null);
      checkpoint = checkpointState.value;
      checkpointSha256 = checkpointState.sha256;
      dedupeRecord = {
        schema_version: STATE_SCHEMA_VERSION,
        graph_id: contract.graph_id,
        dedupe_key: contract.governance.dedupe_key,
        dedupe_identity: dedupeIdentity,
        contract_fingerprint: contractFingerprint,
        canonical_binding: initialBinding,
        canonical_binding_fingerprint: bindingFingerprint,
        status: 'active',
        run_id: runId,
        checkpoint: { path: stateRelative(root, checkpointFile) },
        created_at: startedAt,
        updated_at: startedAt,
      };
      dedupeState = writeRevisionedJson(dedupeFile, dedupeRecord, dedupeSha256);
      dedupeRecord = dedupeState.value;
      dedupeSha256 = dedupeState.sha256;
    } else {
      appendEvent(checkpoint, 'run_resumed', nowDate(options.now).toISOString(), { resumed: true });
      const checkpointState = writeRevisionedJson(
        checkpointFile,
        checkpoint,
        checkpointSha256
      );
      checkpoint = checkpointState.value;
      checkpointSha256 = checkpointState.sha256;
    }

    const persistProgress = async (progress) => {
      const at = nowDate(options.now).toISOString();
      checkpoint.engine = progress.engine;
      checkpoint.status = 'running';
      appendEvent(checkpoint, progress.event, at, {
        graph_attempt: progress.engine?.graph_attempt || null,
        item_id: progress.item_id || null,
      });
      const checkpointState = writeRevisionedJson(
        checkpointFile,
        checkpoint,
        checkpointSha256
      );
      checkpoint = checkpointState.value;
      checkpointSha256 = checkpointState.sha256;
      dedupeRecord = {
        ...dedupeRecord,
        status: 'active',
        updated_at: at,
      };
      dedupeState = writeRevisionedJson(dedupeFile, dedupeRecord, dedupeSha256);
      dedupeRecord = dedupeState.value;
      dedupeSha256 = dedupeState.sha256;
      renewLease(lease);
      if (typeof options.onCheckpoint === 'function') {
        await options.onCheckpoint(structuredClone(checkpoint), progress);
      }
    };

    let result = await runOutcomeGraph(contract, {
      adapters: options.adapters,
      now: options.now,
      runId,
      startedAt,
      resumeState: checkpoint.engine,
      verifyResumedWorker: options.verifyResumedWorker,
      onProgress: persistProgress,
    });

    if (result.terminal_truth && typeof options.beforeFinalBindingCheck === 'function') {
      await options.beforeFinalBindingCheck(result, {
        run_id: runId,
        dedupe_identity: dedupeIdentity,
        checkpoint: structuredClone(checkpoint),
      });
    }

    const finalBinding = await readBinding(options.readCanonicalBinding);
    const finalBindingFingerprint = canonicalBindingFingerprint(finalBinding);
    if (finalBindingFingerprint !== bindingFingerprint) {
      result = {
        ...result,
        provisional_outcome: result.outcome,
        outcome: 'blocked',
        terminal_truth: false,
        blocked_by: 'canonical_state_drift',
        reason: 'Canonical state changed before the durable completion record was committed.',
        final_canonical_binding: finalBinding,
      };
    }

    const finishedAt = nowDate(options.now).toISOString();
    result = stripResumeLocators({
      ...result,
      deduped: false,
      durable_state: {
        schema_version: STATE_SCHEMA_VERSION,
        dedupe_identity: dedupeIdentity,
        dedupe_hit: false,
        resumed,
        canonical_binding: initialBinding,
        canonical_binding_fingerprint: bindingFingerprint,
        contract_fingerprint: contractFingerprint,
        checkpoint: stateRelative(root, checkpointFile),
      },
    });
    writeJsonAtomic(receiptFile, result);
    const receiptBytes = fs.readFileSync(receiptFile);
    const receipt = {
      path: stateRelative(root, receiptFile),
      sha256: sha256(receiptBytes),
      bytes: receiptBytes.length,
    };
    const finalStatus = ['complete', 'awaiting_approval'].includes(result.outcome)
      ? result.outcome
      : 'blocked';
    checkpoint.status = finalStatus;
    checkpoint.engine = stripResumeLocators(checkpoint.engine);
    checkpoint.receipt = receipt;
    appendEvent(checkpoint, 'receipt_committed', finishedAt, { outcome: result.outcome });
    const finalCheckpointState = writeRevisionedJson(
      checkpointFile,
      checkpoint,
      checkpointSha256
    );
    checkpoint = finalCheckpointState.value;
    checkpointSha256 = finalCheckpointState.sha256;
    dedupeRecord = {
      ...dedupeRecord,
      status: finalStatus,
      updated_at: finishedAt,
      completed_at: finalStatus === 'blocked' ? null : finishedAt,
      receipt,
    };
    dedupeState = writeRevisionedJson(dedupeFile, dedupeRecord, dedupeSha256);
    dedupeRecord = dedupeState.value;
    dedupeSha256 = dedupeState.sha256;
    return result;
  } finally {
    releaseLease(lease);
  }
}

module.exports = {
  STATE_SCHEMA_VERSION,
  acquireLease,
  canonicalBindingFingerprint,
  computeDedupeIdentity,
  readJsonStrict,
  readJsonWithSha,
  releaseLease,
  renewLease,
  runDurableOutcomeGraph,
  semanticContractFingerprint,
  stripResumeLocators,
  validateCanonicalBinding,
  writeJsonAtomic,
  writeRevisionedJson,
};
