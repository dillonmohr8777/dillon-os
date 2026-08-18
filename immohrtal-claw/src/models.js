'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { DATA } = require('./paths');

const SELECTED_FILE = path.join(DATA, 'selected-model.json');
const OLLAMA_BASE = (process.env.OLLAMA_HOST || 'http://127.0.0.1:11434').replace(/\/$/, '');

function splitTags(raw, fallback = []) {
  if (raw == null || String(raw).trim() === '') return [...fallback];
  return String(raw).split(',').map((s) => s.trim()).filter(Boolean);
}

/**
 * Ten brains. Dated 2026-08-18.
 * Local five are the strongest open-weight models that actually fit a
 * workstation (dense / small-MoE). The giant 1T-class open weights
 * (Kimi K2.6/K3, DeepSeek V4 Pro, GLM-5.2) are better as APIs, not
 * laptop Ollama pulls.
 * Cloud five: Anthropic, OpenAI, xAI, Cursor Composer, Google Gemini.
 * Gemini is the fifth family — not Claude, OpenAI, Grok, or Composer.
 *
 * Local `acceptTags` are exact workstation near-misses, not prefixes.
 * `gemma4:26b` may stand in for `gemma4:31b`. `gemma4:31b-cloud` may not.
 * `qwen3.5:27b-q4_K_M` must never alias to Qwen3.6 — it returns empty
 * `content` on the OpenAI path (reasoning lives in another field).
 */
const CATALOG = [
  {
    id: 'qwen3.6-27b',
    slot: 'local-1',
    group: 'local',
    family: 'qwen',
    vendor: 'Alibaba',
    label: 'Qwen3.6 27B',
    api: 'openai',
    model: process.env.CLAW_QWEN_MODEL || 'qwen3.6:27b',
    ollama: process.env.CLAW_QWEN_MODEL || 'qwen3.6:27b',
    acceptTags: splitTags(process.env.CLAW_QWEN_ALIASES, []),
    baseUrlEnv: 'OLLAMA_HOST',
    defaultBaseUrl: `${OLLAMA_BASE}/v1`,
    keyEnv: 'OLLAMA_API_KEY',
    defaultKey: 'ollama',
    why: 'Best dense local generalist under Apache 2.0. Default local brain.',
  },
  {
    id: 'gemma4-31b',
    slot: 'local-2',
    group: 'local',
    family: 'gemma',
    vendor: 'Google',
    label: 'Gemma 4 31B',
    api: 'openai',
    model: process.env.CLAW_GEMMA_MODEL || 'gemma4:31b',
    ollama: process.env.CLAW_GEMMA_MODEL || 'gemma4:31b',
    acceptTags: splitTags(process.env.CLAW_GEMMA_ALIASES, ['gemma4:26b']),
    defaultBaseUrl: `${OLLAMA_BASE}/v1`,
    defaultKey: 'ollama',
    why: 'Strongest Google open-weight dense model you can actually run locally. Accepts gemma4:26b exactly, never gemma4:31b-cloud.',
  },
  {
    id: 'qwen3-coder',
    slot: 'local-3',
    group: 'local',
    family: 'qwen',
    vendor: 'Alibaba',
    label: 'Qwen3-Coder-Next',
    api: 'openai',
    model: process.env.CLAW_CODER_MODEL || 'qwen3-coder:latest',
    ollama: process.env.CLAW_CODER_MODEL || 'qwen3-coder:latest',
    acceptTags: splitTags(process.env.CLAW_CODER_ALIASES, ['qwen3-coder:30b']),
    defaultBaseUrl: `${OLLAMA_BASE}/v1`,
    defaultKey: 'ollama',
    why: 'Best local coding / tool-calling specialist. Accepts qwen3-coder:30b exactly.',
  },
  {
    id: 'llama4-scout',
    slot: 'local-4',
    group: 'local',
    family: 'llama',
    vendor: 'Meta',
    label: 'Llama 4 Scout',
    api: 'openai',
    model: process.env.CLAW_LLAMA_MODEL || 'llama4:scout',
    ollama: process.env.CLAW_LLAMA_MODEL || 'llama4:scout',
    acceptTags: splitTags(process.env.CLAW_LLAMA_ALIASES, []),
    defaultBaseUrl: `${OLLAMA_BASE}/v1`,
    defaultKey: 'ollama',
    why: 'Meta long-context local. Ultra-long window; heavier RAM.',
  },
  {
    id: 'deepseek-v4-flash',
    slot: 'local-5',
    group: 'local',
    family: 'deepseek',
    vendor: 'DeepSeek',
    label: 'DeepSeek V4 Flash',
    api: 'openai',
    model: process.env.CLAW_DEEPSEEK_LOCAL_MODEL || 'deepseek-v4:flash',
    ollama: process.env.CLAW_DEEPSEEK_LOCAL_MODEL || 'deepseek-v4:flash',
    acceptTags: splitTags(process.env.CLAW_DEEPSEEK_ALIASES, []),
    defaultBaseUrl: `${OLLAMA_BASE}/v1`,
    defaultKey: 'ollama',
    why: 'Best local-path DeepSeek. V4 Pro is server-class; Flash is the one you can host.',
  },
  {
    id: 'claude-opus-5',
    slot: 'cloud-1',
    group: 'cloud',
    family: 'anthropic',
    vendor: 'Anthropic',
    label: 'Claude Opus 5',
    api: 'anthropic',
    model: process.env.CLAW_ANTHROPIC_MODEL || 'claude-opus-5',
    defaultBaseUrl: 'https://api.anthropic.com',
    keyEnv: 'ANTHROPIC_API_KEY',
    altKeyEnv: 'CLAW_ANTHROPIC_API_KEY',
    why: 'Align HCM Anthropic subscription. First cloud brain. 1M context, tools native.',
  },
  {
    id: 'gpt-5.6-sol',
    slot: 'cloud-2',
    group: 'cloud',
    family: 'openai',
    vendor: 'OpenAI',
    label: 'GPT-5.6 Sol',
    api: 'openai',
    model: process.env.CLAW_OPENAI_MODEL || 'gpt-5.6-sol',
    defaultBaseUrl: 'https://api.openai.com/v1',
    keyEnv: 'OPENAI_API_KEY',
    why: 'OpenAI flagship Sol tier. Needs OPENAI_API_KEY. Probe hits /v1/models.',
  },
  {
    id: 'grok-4.6',
    slot: 'cloud-3',
    group: 'cloud',
    family: 'xai',
    vendor: 'xAI',
    label: 'Grok 4.6',
    api: 'openai',
    model: process.env.CLAW_GROK_MODEL || 'grok-4.6',
    defaultBaseUrl: 'https://api.x.ai/v1',
    keyEnv: 'XAI_API_KEY',
    altKeyEnv: 'GROK_API_KEY',
    why: 'xAI Grok 4.6. Second cloud brain after Opus 5. Needs XAI_API_KEY. Probe hits api.x.ai/v1/models.',
  },
  {
    id: 'composer-2.5',
    slot: 'cloud-4',
    group: 'cloud',
    family: 'cursor',
    vendor: 'Cursor',
    label: 'Composer 2.5',
    api: 'openai',
    model: process.env.CLAW_COMPOSER_MODEL || 'composer-2.5',
    baseUrlEnv: 'CLAW_COMPOSER_BASE_URL',
    keyEnv: 'CLAW_COMPOSER_API_KEY',
    why: 'Cursor Composer 2.5. No public API. Ready only if you set a private gateway URL.',
    cursorOnly: true,
  },
  {
    id: 'gemini-2.5-pro',
    slot: 'cloud-5',
    group: 'cloud',
    family: 'google',
    vendor: 'Google',
    label: 'Gemini 2.5 Pro',
    api: 'google',
    model: process.env.CLAW_GEMINI_MODEL || 'gemini-2.5-pro',
    defaultBaseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    keyEnv: 'GEMINI_API_KEY',
    altKeyEnv: 'GOOGLE_API_KEY',
    why: 'Google. The fifth cloud family — not Anthropic, OpenAI, xAI, or Cursor.',
  },
];

let lastOllamaTags = [];

function rememberOllamaTags(tags) {
  lastOllamaTags = Array.isArray(tags) ? tags.filter(Boolean) : [];
  return lastOllamaTags;
}

function catalog() {
  return CATALOG.map((m) => ({ ...m, acceptTags: [...(m.acceptTags || [])] }));
}

function findModel(id) {
  return CATALOG.find((m) => m.id === id || m.model === id) || null;
}

function readKey(entry) {
  const keys = [entry.keyEnv, entry.altKeyEnv].filter(Boolean);
  for (const name of keys) {
    const val = process.env[name];
    if (val) return val;
  }
  return entry.defaultKey || '';
}

function readBaseUrl(entry) {
  if (entry.baseUrlEnv && process.env[entry.baseUrlEnv]) {
    return String(process.env[entry.baseUrlEnv]).replace(/\/$/, '');
  }
  return entry.defaultBaseUrl || '';
}

function readPersistedId() {
  try {
    if (!fs.existsSync(SELECTED_FILE)) return '';
    const raw = JSON.parse(fs.readFileSync(SELECTED_FILE, 'utf8'));
    return String(raw.id || '');
  } catch {
    return '';
  }
}

function persistId(id) {
  fs.mkdirSync(DATA, { recursive: true });
  fs.writeFileSync(SELECTED_FILE, `${JSON.stringify({ id, ts: new Date().toISOString() }, null, 2)}\n`);
}

function pickDefaultId() {
  if (process.env.CLAW_MODEL) return process.env.CLAW_MODEL;
  const persisted = readPersistedId();
  if (persisted && findModel(persisted)) return persisted;
  if (readKey(findModel('claude-opus-5'))) return 'claude-opus-5';
  if (readKey(findModel('grok-4.6'))) return 'grok-4.6';
  if (readKey(findModel('gpt-5.6-sol'))) return 'gpt-5.6-sol';
  if (readKey(findModel('gemini-2.5-pro'))) return 'gemini-2.5-pro';
  if (process.env.OPENAI_BASE_URL && process.env.OPENAI_MODEL) return 'custom-openai';
  return 'rehearsal';
}

function customOpenAI() {
  return {
    id: 'custom-openai',
    slot: 'custom',
    group: 'custom',
    family: 'openai',
    vendor: 'OpenAI',
    label: process.env.OPENAI_MODEL || 'custom OpenAI-compat',
    api: 'openai',
    model: process.env.OPENAI_MODEL,
    defaultBaseUrl: process.env.OPENAI_BASE_URL,
    why: 'Legacy OPENAI_BASE_URL + OPENAI_MODEL override.',
  };
}

function resolveEntry(id) {
  if (id === 'rehearsal' || !id) {
    return {
      id: 'rehearsal',
      slot: 'rehearsal',
      group: 'local',
      family: 'claw',
      vendor: 'IMMOHRTAL',
      label: 'Rehearsal',
      api: 'rehearsal',
      model: 'immohrtal-claw-rehearsal',
      why: 'No remote model. Harness still runs.',
    };
  }
  if (id === 'custom-openai') return customOpenAI();
  return findModel(id);
}

/**
 * Ollama tags must match exactly. Prefix matching looks harmless and is not:
 * a box holding `gemma4:31b-cloud` would report `gemma4:31b` ready, then 404
 * on the first real call. An untagged catalog entry means the :latest tag.
 */
function hasTag(tags, want) {
  if (!want) return false;
  const full = want.includes(':') ? want : `${want}:latest`;
  return tags.includes(full);
}

function wantedOllamaTags(entry) {
  if (!entry || !entry.ollama) return [];
  const extras = Array.isArray(entry.acceptTags) ? entry.acceptTags : [];
  return [entry.ollama, ...extras];
}

function resolveOllamaTag(entry, tags = lastOllamaTags) {
  if (!entry || !entry.ollama) return entry ? entry.model : '';
  for (const want of wantedOllamaTags(entry)) {
    if (hasTag(tags, want)) return want.includes(':') ? want : `${want}:latest`;
  }
  return entry.ollama;
}

function readiness(entry, ollamaTags = []) {
  if (!entry || entry.api === 'rehearsal') {
    return { ready: true, blocker: '' };
  }
  if (entry.cursorOnly && !readBaseUrl(entry)) {
    return {
      ready: false,
      blocker: 'Composer 2.5 is Cursor-IDE-only. Set CLAW_COMPOSER_BASE_URL if you have a private gateway.',
    };
  }
  const baseUrl = readBaseUrl(entry);
  const apiKey = readKey(entry);
  if (!baseUrl) return { ready: false, blocker: 'missing base URL' };
  if (entry.api !== 'openai' || !entry.ollama) {
    if (!apiKey) return { ready: false, blocker: `missing ${entry.keyEnv || 'API key'}` };
    return { ready: true, blocker: '' };
  }
  const wanted = wantedOllamaTags(entry);
  if (ollamaTags.length && !wanted.some((tag) => hasTag(ollamaTags, tag))) {
    const hint = wanted.length > 1 ? wanted.join(' | ') : entry.ollama;
    return { ready: false, blocker: `ollama pull ${hint}` };
  }
  return { ready: true, blocker: ollamaTags.length ? '' : 'Ollama not probed; pull the tag on the box' };
}

function toProvider(entry, tags = lastOllamaTags) {
  if (!entry || entry.api === 'rehearsal') {
    return {
      kind: 'rehearsal',
      api: 'rehearsal',
      model: 'immohrtal-claw-rehearsal',
      baseUrl: '',
      apiKey: '',
      modelId: 'rehearsal',
      label: 'Rehearsal',
      family: 'claw',
      vendor: 'IMMOHRTAL',
      resolvedTag: 'immohrtal-claw-rehearsal',
    };
  }
  const resolved = entry.ollama ? resolveOllamaTag(entry, tags) : entry.model;
  return {
    kind: entry.api === 'rehearsal' ? 'rehearsal' : 'live',
    api: entry.api,
    model: resolved,
    catalogTag: entry.model,
    baseUrl: readBaseUrl(entry),
    apiKey: readKey(entry),
    modelId: entry.id,
    label: entry.label,
    family: entry.family,
    vendor: entry.vendor || '',
    resolvedTag: resolved,
  };
}

async function probeOllama() {
  try {
    const res = await fetch(`${OLLAMA_BASE}/api/tags`, { signal: AbortSignal.timeout(800) });
    if (!res.ok) return rememberOllamaTags([]);
    const json = await res.json();
    return rememberOllamaTags((json.models || []).map((m) => m.name || m.model).filter(Boolean));
  } catch {
    return rememberOllamaTags([]);
  }
}

/**
 * Live reachability, not just "is a key present". Every provider exposes a
 * cheap model-list endpoint, so a probe costs one GET and no tokens.
 * Opt-in only: the picker calls this when Dillon presses Probe, never on
 * every page load.
 */
async function probeCloud(entry) {
  const baseUrl = readBaseUrl(entry);
  const apiKey = readKey(entry);
  if (!baseUrl || !apiKey) return null;
  const base = baseUrl.replace(/\/$/, '');
  let url = `${base}/models`;
  const headers = {};
  if (entry.api === 'anthropic') {
    url = `${base}/v1/models`;
    headers['x-api-key'] = apiKey;
    headers['anthropic-version'] = '2023-06-01';
  } else if (entry.api === 'google') {
    url = `${base}/models?key=${encodeURIComponent(apiKey)}`;
  } else {
    headers.authorization = `Bearer ${apiKey}`;
  }
  try {
    const res = await fetch(url, { headers, signal: AbortSignal.timeout(6000) });
    if (res.ok) return { ok: true };
    const body = await res.text();
    return { ok: false, reason: `HTTP ${res.status} ${body.slice(0, 120).replace(/\s+/g, ' ')}` };
  } catch (err) {
    return { ok: false, reason: err.name === 'TimeoutError' ? 'probe timed out' : err.message };
  }
}

function publicModel(entry, tags, hit) {
  const ready = readiness(entry, tags);
  const resolved = entry.ollama ? resolveOllamaTag(entry, tags) : entry.model;
  const wanted = wantedOllamaTags(entry);
  const row = {
    id: entry.id,
    slot: entry.slot,
    group: entry.group,
    family: entry.family,
    vendor: entry.vendor || '',
    label: entry.label,
    model: resolved,
    catalogTag: entry.model,
    acceptTags: wanted.filter((t) => t !== entry.ollama),
    keyEnv: entry.keyEnv || (entry.ollama ? 'OLLAMA_HOST' : ''),
    why: entry.why,
    ready: ready.ready,
    blocker: ready.blocker,
    probed: Boolean(hit),
    needs: entry.ollama
      ? `ollama ${wanted.join(' | ')}`
      : (entry.keyEnv || 'API key'),
  };
  if (hit && ready.ready && !hit.ok) {
    row.ready = false;
    row.blocker = `probe failed: ${hit.reason}`;
  }
  return row;
}

async function listStatus({ probe = false } = {}) {
  const tags = await probeOllama();
  const selected = pickDefaultId();
  const cloudProbes = new Map();
  if (probe) {
    const targets = CATALOG.filter((m) => m.group === 'cloud');
    const results = await Promise.all(targets.map((e) => probeCloud(e)));
    targets.forEach((e, i) => cloudProbes.set(e.id, results[i]));
  }

  return {
    selected,
    probed: probe,
    ollama: { host: OLLAMA_BASE, tags, reachable: tags.length > 0 },
    models: CATALOG.map((entry) => publicModel(entry, tags, cloudProbes.get(entry.id))),
  };
}

function resolveSelection(id) {
  const wanted = id || pickDefaultId();
  const entry = resolveEntry(wanted);
  if (!entry) {
    throw new Error(`unknown model: ${wanted}`);
  }
  return { entry, provider: toProvider(entry) };
}

module.exports = {
  CATALOG,
  catalog,
  findModel,
  pickDefaultId,
  persistId,
  resolveSelection,
  listStatus,
  readiness,
  probeOllama,
  probeCloud,
  hasTag,
  splitTags,
  wantedOllamaTags,
  resolveOllamaTag,
  rememberOllamaTags,
  SELECTED_FILE,
};
