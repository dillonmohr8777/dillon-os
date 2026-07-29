'use strict';

const { repoPath, readJson, writeJson, appendJsonl, nowISO } = require('./fsutil');

function loadRegistry() {
  return readJson(repoPath('12_Brain/registry/automations.json'), { automations: [], gates: {} });
}

function loadProperties() {
  return readJson(repoPath('12_Brain/registry/properties.json'), { properties: [] });
}

function writeRunState(automationId, state) {
  const file = repoPath('12_Brain/state', `${automationId}.json`);
  writeJson(file, { ...state, automation_id: automationId, written_at: nowISO() });
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
  writeRunState,
  enqueue,
};
