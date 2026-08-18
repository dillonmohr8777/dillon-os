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

  return {
    host: process.env.CLAW_HOST || '127.0.0.1',
    port: intEnv('PORT', 4800),
    contextTokens: intEnv('CLAW_CONTEXT_TOKENS', 128000),
    maxToolIters: intEnv('CLAW_MAX_TOOL_ITERS', 16),
    memoryMaxBytes: intEnv('CLAW_MEMORY_MAX_BYTES', 8 * 1024 * 1024 * 1024),
    searchScanBytes: intEnv('CLAW_SEARCH_SCAN_BYTES', 32 * 1024 * 1024),
    allowExec: process.env.CLAW_ALLOW_EXEC === '1',
    provider: {
      kind: hasRemote ? 'openai' : 'booth',
      baseUrl,
      model: model || 'immohrtal-claw-booth',
      apiKey,
    },
    product: {
      name: 'IMMOHRTAL CLAW',
      sessionTag: 'SESSION 001 // CLAW HARNESS',
      coordinates: '42.1292 N / 80.0851 W',
    },
  };
}

module.exports = { loadConfig };
