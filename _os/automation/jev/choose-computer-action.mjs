#!/usr/bin/env node

import { experimental_evaluate as evaluate } from 'ai';
import { pathToFileURL } from 'node:url';
import { createInterface } from 'node:readline';

const MODEL = 'typesafe-ai/jev';
const KEY_VAR = 'AI_GATEWAY_API_KEY';
const REQUEST_SCHEMA = 'dillon.jev_cua_choice_v1';
const RESULT_SCHEMA = 'dillon.jev_cua_choice_result_v1';
const RESERVED = new Set(['reobserve', 'abstain']);
const FLAGS = new Set(['--live', '--mock', '--serve']);
const FORBIDDEN_OBSERVATION_KEY = /(?:^|_)(?:account|arguments?|authorization|base64|bytes|capture_?id|client|content|cookie|coordinates?|credentials?|dom|email|element_?ref|env(?:ironment)?|href|html|image|instructions?|mfa|otp|page_?ref|page_?text|password|passwd|phone|prompt|raw|recipient|screenshot|secret|tenant|token|tool(?:_?name)?|uri|url)(?:_|$)/i;
const SECRETISH_VALUE = /(?:vck_|sk-|ghp_|github_pat_|AIza|xox[baprs]-|Bearer\s+[A-Za-z0-9._-]{16,}|eyJ[A-Za-z0-9_-]{10,}\.)/i;

function reject(message) {
  throw new Error(message);
}

function validateSafeString(value, label, maxLength) {
  if (typeof value !== 'string' || !value.trim() || value.length > maxLength) {
    reject(`${label} must be a non-empty string of at most ${maxLength} characters`);
  }
  if (SECRETISH_VALUE.test(value)) reject(`${label} appears to contain a secret`);
}

function validateObservation(observation) {
  if (!observation || typeof observation !== 'object' || Array.isArray(observation)) {
    reject('observation must be a flat JSON object');
  }

  const entries = Object.entries(observation);
  if (entries.length < 1 || entries.length > 32) reject('observation must contain 1-32 compact fields');

  const validateValue = (value, label) => {
    if (value === null || typeof value === 'boolean') return;
    if (typeof value === 'number' && Number.isFinite(value)) return;
    if (typeof value === 'string') {
      validateSafeString(value, label, 240);
      if (/\r|\n/.test(value)) reject(`${label} must not contain raw multiline content`);
      return;
    }
    reject(`${label} must contain only compact primitive values`);
  };

  for (const [key, value] of entries) {
    if (!/^[a-z][a-z0-9_]{0,63}$/.test(key)) reject(`invalid observation field: ${key}`);
    if (key === 'x' || key === 'y' || FORBIDDEN_OBSERVATION_KEY.test(key)) {
      reject(`forbidden observation field: ${key}`);
    }
    if (Array.isArray(value)) {
      if (value.length > 12) reject(`observation.${key} must contain at most 12 values`);
      value.forEach((item, index) => validateValue(item, `observation.${key}[${index}]`));
    } else {
      validateValue(value, `observation.${key}`);
    }
  }
}

function validateRequest(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) reject('request must be a JSON object');

  const allowed = new Set(['schema', 'goal', 'observationId', 'minProbability', 'observation', 'history', 'candidates']);
  for (const key of Object.keys(value)) if (!allowed.has(key)) reject(`unsupported request field: ${key}`);

  if (value.schema !== REQUEST_SCHEMA) reject(`schema must be ${REQUEST_SCHEMA}`);
  validateSafeString(value.goal, 'goal', 500);
  if (typeof value.observationId !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._:-]{0,63}$/.test(value.observationId)) {
    reject('observationId must be a caller-generated opaque ID of at most 64 characters');
  }
  if (!Number.isFinite(value.minProbability) || value.minProbability < 0.5 || value.minProbability > 1) {
    reject('minProbability must be a caller-stated number from 0.5 through 1');
  }

  validateObservation(value.observation);
  const observationJson = JSON.stringify(value.observation);
  if (observationJson.length > 8000) reject('observation must stay under 8000 JSON characters');

  const history = value.history ?? [];
  if (!Array.isArray(history) || history.length > 3) {
    reject('history must contain at most three strings of at most 300 characters each');
  }
  history.forEach((item, index) => validateSafeString(item, `history[${index}]`, 300));

  if (!Array.isArray(value.candidates) || value.candidates.length < 2 || value.candidates.length > 8) {
    reject('candidates must contain 2-8 bounded choices');
  }

  const seen = new Set();
  for (const candidate of value.candidates) {
    if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) reject('each candidate must be an object');
    const keys = Object.keys(candidate);
    if (keys.some((key) => key !== 'id' && key !== 'description')) reject('candidates may contain only id and description');
    if (typeof candidate.id !== 'string' || !/^[a-z][a-z0-9_-]{0,63}$/.test(candidate.id)) {
      reject(`invalid candidate id: ${String(candidate.id)}`);
    }
    if (seen.has(candidate.id)) reject(`duplicate candidate id: ${candidate.id}`);
    seen.add(candidate.id);
    validateSafeString(candidate.description, `candidate ${candidate.id} description`, 240);
  }

  for (const id of RESERVED) if (!seen.has(id)) reject(`required candidate missing: ${id}`);
  return { ...value, goal: value.goal.trim(), history };
}

function makeCriteria(request) {
  return Object.fromEntries(request.candidates.map(({ id, description }) => [id, description.trim()]));
}

function mockChoice(request) {
  return request.candidates.some(({ id }) => id === 'abstain') ? 'abstain' : 'reobserve';
}

async function choose(request, { live, evaluator = evaluate, apiKey = process.env[KEY_VAR] }) {
  const criteria = makeCriteria(request);
  const started = performance.now();

  if (!live) {
    const choice = mockChoice(request);
    return {
      schema: RESULT_SCHEMA,
      provider: 'mock',
      choice,
      selectedProbability: 1,
      probabilities: Object.fromEntries(Object.keys(criteria).map((id) => [id, id === choice ? 1 : 0])),
      model: 'mock',
      observationId: request.observationId,
      minProbability: request.minProbability,
      elapsedMs: Math.round(performance.now() - started),
      billedCostUsd: 0,
    };
  }

  if (!apiKey) reject(`${KEY_VAR} is not set`);

  const result = await evaluator({
    model: MODEL,
    maxRetries: 0,
    abortSignal: AbortSignal.timeout(2500),
    state: {
      goal: request.goal,
      observation: request.observation,
      history: request.history,
    },
    questions: {
      nextAction: {
        type: 'choice',
        instructions: {
          question: 'Which supplied candidate is the safest useful next action for `goal` from this fresh `observation`?',
          rules: [
            'Choose only one supplied candidate ID.',
            'Choose reobserve when the observation is stale, incomplete, or ambiguous.',
            'Choose abstain when no supplied action is safe or relevant.',
            'Do not invent an action, target, coordinate, argument, or tool.',
          ],
          inspect: '`goal`, `observation`, recent `history`, and the complete candidate descriptions',
        },
        criteria,
      },
    },
  });

  const answer = result.answers?.nextAction;
  const choice = answer?.choice;
  if (!Object.hasOwn(criteria, choice)) reject(`Jev returned an unknown candidate: ${String(choice)}`);
  const selectedProbability = answer.probabilities?.[choice];
  if (!Number.isFinite(selectedProbability)) reject('Jev returned no usable confidence');
  if (selectedProbability < request.minProbability) {
    reject(`Jev confidence ${selectedProbability} is below minProbability ${request.minProbability}`);
  }

  return {
    schema: RESULT_SCHEMA,
    provider: 'vercel-ai-gateway',
    choice,
    selectedProbability,
    probabilities: answer.probabilities,
    model: result.response?.modelId ?? MODEL,
    observationId: request.observationId,
    minProbability: request.minProbability,
    elapsedMs: Math.round(performance.now() - started),
    billedCostUsd: result.providerMetadata?.gateway?.cost ?? null,
  };
}

function canExecute(result, { currentObservationId, candidateIds } = {}) {
  if (!result || result.schema !== RESULT_SCHEMA) return { ok: false, reason: 'invalid_result' };
  if (result.provider !== 'vercel-ai-gateway') return { ok: false, reason: 'unexpected_provider' };
  if (result.model !== MODEL) return { ok: false, reason: 'unexpected_model' };
  if (!currentObservationId || result.observationId !== currentObservationId) return { ok: false, reason: 'stale_observation' };
  if (!Array.isArray(candidateIds) || !candidateIds.includes(result.choice)) return { ok: false, reason: 'unknown_candidate' };
  if (RESERVED.has(result.choice)) return { ok: false, reason: result.choice };
  if (!Number.isFinite(result.minProbability) || !Number.isFinite(result.selectedProbability) || result.selectedProbability < result.minProbability) {
    return { ok: false, reason: 'low_confidence' };
  }
  return { ok: true, reason: 'eligible' };
}

async function readRequest() {
  let raw = '';
  for await (const chunk of process.stdin) raw += chunk;
  return parseRequest(raw);
}

function parseRequest(raw) {
  if (!raw.trim()) reject('expected one JSON request on stdin');
  try {
    return validateRequest(JSON.parse(raw));
  } catch (error) {
    if (error instanceof SyntaxError) reject(`invalid JSON: ${error.message}`);
    throw error;
  }
}

async function serve({ live }) {
  const lines = createInterface({ input: process.stdin, crlfDelay: Infinity });
  for await (const raw of lines) {
    if (!raw.trim()) continue;
    try {
      const result = await choose(parseRequest(raw), { live });
      process.stdout.write(`${JSON.stringify(result)}\n`);
    } catch (error) {
      process.stdout.write(`${JSON.stringify({ schema: RESULT_SCHEMA, error: error.message })}\n`);
    }
  }
}

function parseArgs(argv) {
  for (const arg of argv) if (!FLAGS.has(arg)) reject(`unsupported argument: ${arg}`);
  const args = new Set(argv);
  if (args.has('--live') && args.has('--mock')) reject('choose either --live or --mock');
  return { live: args.has('--live'), serve: args.has('--serve') };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.serve) return serve({ live: args.live });
  const request = await readRequest();
  const result = await choose(request, { live: args.live });
  process.stdout.write(`${JSON.stringify(result)}\n`);
}

export { REQUEST_SCHEMA, RESULT_SCHEMA, canExecute, choose, makeCriteria, mockChoice, parseArgs, parseRequest, validateObservation, validateRequest };

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = /AI_GATEWAY_API_KEY/.test(error.message) ? 2 : 64;
  });
}
