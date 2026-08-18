'use strict';

const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');

function resolveDir(envName, fallback) {
  const raw = process.env[envName];
  return raw ? path.resolve(raw) : fallback;
}

const DATA = resolveDir('CLAW_DATA_DIR', path.join(ROOT, 'data'));
const WORKSPACE = resolveDir('CLAW_WORKSPACE', path.join(ROOT, 'workspace'));

module.exports = {
  ROOT,
  WORKSPACE,
  WEB: path.join(ROOT, 'web'),
  DATA,
  SESSIONS: path.join(DATA, 'sessions'),
  TRACES: path.join(DATA, 'traces'),
  LONG_TERM: path.join(DATA, 'long-term.jsonl'),
  MEMORY_INDEX: path.join(DATA, 'memory-index.json'),
  NOTES: path.join(DATA, 'notes'),
  CRON: path.join(DATA, 'cron.json'),
  INBOX: path.join(DATA, 'inbox.jsonl'),
  SPAWNS: path.join(DATA, 'spawns.jsonl'),
  OPENAPI: path.join(ROOT, 'openapi.yaml'),
  ENV_FILE: path.join(ROOT, '.env'),
};
