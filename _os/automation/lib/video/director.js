'use strict';

/**
 * The director: a language model that turns a one-line brief into a validated
 * storyboard. It never renders anything and never spends video money.
 *
 * It defaults to a LOCAL model over an OpenAI-compatible endpoint (Ollama, LM
 * Studio, llama.cpp), because scripting, shot-listing and caption writing are
 * exactly the work a 27B-class model does well and the work that would otherwise
 * be billed per token forever. OpenRouter is the fallback, not the default.
 *
 * The repair loop is the reason this is worth a module rather than one prompt:
 * a director model reliably produces *almost* valid JSON, and handing it back
 * its own validation errors fixes it far more cheaply than a human re-running
 * the command. Only a storyboard that passes validateStoryboard() is returned,
 * so nothing downstream has to defend against a malformed plan.
 */

const { requestJson } = require('./http');
const { validateStoryboard, normaliseStoryboard, schemaPrompt } = require('./storyboard');

const DEFAULT_LOCAL_BASE = 'http://localhost:11434/v1';

function directorConfig(overrides = {}) {
  const baseUrl = overrides.baseUrl || process.env.VIDEO_DIRECTOR_BASE_URL || DEFAULT_LOCAL_BASE;
  const isOpenRouter = /openrouter\.ai/i.test(baseUrl);
  return {
    baseUrl: baseUrl.replace(/\/+$/, ''),
    model: overrides.model || process.env.VIDEO_DIRECTOR_MODEL || (isOpenRouter ? 'deepseek/deepseek-v4-pro-0813' : 'qwen3.8:27b'),
    apiKey: overrides.apiKey || (isOpenRouter ? process.env.OPENROUTER_API_KEY : process.env.VIDEO_DIRECTOR_API_KEY || 'local'),
    isOpenRouter,
    temperature: overrides.temperature ?? 0.7,
    timeoutMs: overrides.timeoutMs || 180000,
  };
}

/** Pull the first balanced JSON object out of a model response. */
function extractJson(text) {
  if (!text) return null;
  const cleaned = String(text).replace(/^\s*```(?:json)?/i, '').replace(/```\s*$/, '');

  const start = cleaned.indexOf('{');
  if (start === -1) return null;

  // Brace counting rather than a regex: prompts routinely contain braces inside
  // string values, and a greedy match would swallow trailing prose.
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < cleaned.length; i += 1) {
    const ch = cleaned[i];
    if (escaped) { escaped = false; continue; }
    if (ch === '\\') { escaped = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === '{') depth += 1;
    else if (ch === '}') {
      depth -= 1;
      if (depth === 0) {
        try {
          return JSON.parse(cleaned.slice(start, i + 1));
        } catch {
          return null;
        }
      }
    }
  }
  return null;
}

async function chat(messages, cfg) {
  const res = await requestJson(`${cfg.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${cfg.apiKey}`,
      ...(cfg.isOpenRouter ? { 'x-title': 'Dillon OS Video Director' } : {}),
    },
    body: {
      model: cfg.model,
      messages,
      temperature: cfg.temperature,
      // Ollama and LM Studio both honour this; OpenRouter passes it through to
      // providers that support it and ignores it elsewhere.
      response_format: { type: 'json_object' },
    },
    timeoutMs: cfg.timeoutMs,
    allowLoopback: true,
  });

  if (!res.ok) return { ok: false, error: res.error };
  if (res.status >= 400) {
    return { ok: false, error: res.json?.error?.message || `HTTP ${res.status}: ${String(res.body).slice(0, 300)}` };
  }
  const content = res.json?.choices?.[0]?.message?.content;
  if (!content) return { ok: false, error: `no content in director response: ${String(res.body).slice(0, 300)}` };
  return { ok: true, content };
}

function systemPrompt(brandRules) {
  return [
    'You are a video director. You produce shot lists as strict JSON.',
    '',
    schemaPrompt(),
    ...(brandRules ? ['', 'Brand rules that override your defaults:', brandRules] : []),
  ].join('\n');
}

/**
 * Brief -> validated storyboard.
 *
 * @param {string} brief
 * @param {object} opts { targetSeconds, aspectRatio, tier, brandRules, maxRepairs, model, baseUrl }
 */
async function direct(brief, opts = {}) {
  const cfg = directorConfig(opts);
  const maxRepairs = opts.maxRepairs ?? 2;

  const userPrompt = [
    `Brief: ${brief}`,
    `Target duration: ${opts.targetSeconds || 30} seconds.`,
    `Aspect ratio: ${opts.aspectRatio || '4:3'}.`,
    `Tier: ${opts.tier || 'standard'}.`,
    '',
    'Produce the storyboard now.',
  ].join('\n');

  const messages = [
    { role: 'system', content: systemPrompt(opts.brandRules) },
    { role: 'user', content: userPrompt },
  ];

  const attempts = [];

  for (let attempt = 0; attempt <= maxRepairs; attempt += 1) {
    const res = await chat(messages, cfg);
    if (!res.ok) {
      return { ok: false, error: res.error, attempts, config: { model: cfg.model, baseUrl: cfg.baseUrl } };
    }

    const parsed = extractJson(res.content);
    if (!parsed) {
      attempts.push({ attempt, error: 'response was not parseable JSON' });
      messages.push({ role: 'assistant', content: res.content });
      messages.push({ role: 'user', content: 'That was not valid JSON. Return ONLY the JSON object, no prose, no code fence.' });
      continue;
    }

    const normalised = normaliseStoryboard(parsed, { aspect_ratio: opts.aspectRatio, tier: opts.tier });
    const check = validateStoryboard(normalised);
    if (check.ok) {
      return {
        ok: true,
        storyboard: normalised,
        warnings: check.warnings,
        totalDurationSeconds: check.totalDurationSeconds,
        attempts: attempts.concat([{ attempt, error: null }]),
        config: { model: cfg.model, baseUrl: cfg.baseUrl },
      };
    }

    attempts.push({ attempt, error: check.errors.join('; ') });
    messages.push({ role: 'assistant', content: JSON.stringify(parsed) });
    messages.push({
      role: 'user',
      content: `That storyboard failed validation:\n- ${check.errors.join('\n- ')}\nReturn a corrected JSON object fixing every listed problem.`,
    });
  }

  return {
    ok: false,
    error: `director could not produce a valid storyboard in ${maxRepairs + 1} attempts`,
    attempts,
    config: { model: cfg.model, baseUrl: cfg.baseUrl },
  };
}

module.exports = { direct, directorConfig, extractJson, systemPrompt, DEFAULT_LOCAL_BASE };
