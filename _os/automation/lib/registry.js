'use strict';

const { repoPath, readJson, writeJson, appendJsonl, nowISO } = require('./fsutil');

function loadRegistry() {
  return readJson(repoPath('12_Brain/registry/automations.json'), { automations: [], gates: {} });
}

function loadProperties() {
  return readJson(repoPath('12_Brain/registry/properties.json'), { properties: [] });
}

const ISO_TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/;

/**
 * The one timestamp contract for automation state (12_Brain/schemas/automation-run.json):
 * `generated_at` is an ISO-8601 instant stamped at write time. `written_at` is kept for
 * readers that still expect it and always equals `generated_at`. A caller-supplied
 * `generated_at` is honoured only when it is a valid timestamp; anything else is replaced,
 * so a state file can never carry a malformed or missing stamp.
 */
function stampRunState(automationId, state, now = nowISO()) {
  const supplied = state && state.generated_at;
  const generatedAt = (typeof supplied === 'string' && ISO_TIMESTAMP.test(supplied)) ? supplied : now;
  return { ...state, automation_id: automationId, generated_at: generatedAt, written_at: generatedAt };
}

function writeRunState(automationId, state) {
  const file = repoPath('12_Brain/state', `${automationId}.json`);
  writeJson(file, stampRunState(automationId, state));
  return file;
}

function enqueue(automationId, action, payload = {}) {
  const day = nowISO().slice(0, 10);
  const file = repoPath('12_Brain/queue', `${automationId}-${day}.jsonl`);
  const row = {
    ts: nowISO(),
    automation_id: automationId,
    action,
    ...payload,
  };
  appendJsonl(file, row);
  return { file, row };
}

module.exports = {
  loadRegistry,
  loadProperties,
  stampRunState,
  writeRunState,
  enqueue,
  ISO_TIMESTAMP,
};
