'use strict';

const { resolveSelection, persistId, findModel } = require('./models');

function intEnv(name, fallback) {
  const raw = process.env[name];
  if (raw == null || raw === '') return fallback;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) ? n : fallback;
}

let live = null;

function buildConfig(modelId) {
  const tunnel = process.env.CLAW_TUNNEL === '1';
  const gateToken = process.env.CLAW_GATE_TOKEN || '';
  const { entry, provider } = resolveSelection(modelId);

  return {
    host: process.env.CLAW_HOST || '127.0.0.1',
    port: intEnv('PORT', 4800),
    contextTokens: intEnv('CLAW_CONTEXT_TOKENS', 128000),
    maxToolIters: intEnv('CLAW_MAX_TOOL_ITERS', 24),
    memoryMaxBytes: intEnv('CLAW_MEMORY_MAX_BYTES', 8 * 1024 * 1024 * 1024),
    searchScanBytes: intEnv('CLAW_SEARCH_SCAN_BYTES', 32 * 1024 * 1024),
    allowExec: process.env.CLAW_ALLOW_EXEC === '1',
    heartbeatMs: intEnv('CLAW_HEARTBEAT_MS', 0),
    tunnel,
    gateToken,
    modelId: entry.id,
    provider,
    product: {
      name: 'IMMOHRTAL CLAW',
      sessionTag: 'PERSONAL AGENT',
      line: 'PicoClaw-class. Not a music product.',
    },
  };
}

function loadConfig() {
  live = buildConfig();
  return live;
}

function getConfig() {
  return live || loadConfig();
}

function selectModel(id, config) {
  if (id !== 'rehearsal' && id !== 'custom-openai' && !findModel(id)) {
    throw new Error(`unknown model: ${id}`);
  }
  persistId(id);
  process.env.CLAW_MODEL = id;
  const next = buildConfig(id);
  if (config) {
    Object.assign(config, next);
    config.provider = next.provider;
  }
  live = next;
  return next;
}

module.exports = { loadConfig, getConfig, selectModel, intEnv };
