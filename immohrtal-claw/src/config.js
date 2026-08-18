'use strict';

function intEnv(name, fallback) {
  const raw = process.env[name];
  if (raw == null || raw === '') return fallback;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) ? n : fallback;
}

function loadConfig() {
  const apiKey = process.env.OPENAI_API_KEY || '';
  const baseUrl = (process.env.OPENAI_BASE_URL || '').replace(/\/$/, '');
  const model = process.env.OPENAI_MODEL || '';
  const hasRemote = Boolean(baseUrl && model);
  const tunnel = process.env.CLAW_TUNNEL === '1';
  const gateToken = process.env.CLAW_GATE_TOKEN || '';

  return {
    host: process.env.CLAW_HOST || '127.0.0.1',
    port: intEnv('PORT', 4800),
    contextTokens: intEnv('CLAW_CONTEXT_TOKENS', 128000),
    maxToolIters: intEnv('CLAW_MAX_TOOL_ITERS', 16),
    memoryMaxBytes: intEnv('CLAW_MEMORY_MAX_BYTES', 8 * 1024 * 1024 * 1024),
    searchScanBytes: intEnv('CLAW_SEARCH_SCAN_BYTES', 32 * 1024 * 1024),
    allowExec: process.env.CLAW_ALLOW_EXEC === '1',
    heartbeatMs: intEnv('CLAW_HEARTBEAT_MS', 0),
    tunnel,
    gateToken,
    provider: {
      kind: hasRemote ? 'openai' : 'rehearsal',
      baseUrl,
      model: model || 'immohrtal-claw-rehearsal',
      apiKey,
    },
    product: {
      name: 'IMMOHRTAL CLAW',
      sessionTag: 'PERSONAL AGENT',
      line: 'PicoClaw-class. Not a music product.',
    },
  };
}

module.exports = { loadConfig };
