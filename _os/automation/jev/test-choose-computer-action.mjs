import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  REQUEST_SCHEMA,
  canExecute,
  choose,
  makeCriteria,
  mockChoice,
  parseArgs,
  parseRequest,
  validateRequest,
} from './choose-computer-action.mjs';

const request = {
  schema: REQUEST_SCHEMA,
  goal: 'Inspect the next section of the local responsive preview.',
  observationId: 'preview-hero-1',
  minProbability: 0.8,
  observation: { current_section: 'hero', next_section_visible: false },
  history: ['Captured the hero at the current breakpoint.'],
  candidates: [
    { id: 'scroll_one_viewport', description: 'Scroll down one viewport in the local preview.' },
    { id: 'reobserve', description: 'Refresh the UI observation before acting.' },
    { id: 'abstain', description: 'Stop without changing the UI.' },
  ],
};

const valid = validateRequest(request);
assert.deepEqual(makeCriteria(valid), {
  scroll_one_viewport: 'Scroll down one viewport in the local preview.',
  reobserve: 'Refresh the UI observation before acting.',
  abstain: 'Stop without changing the UI.',
});
assert.equal(mockChoice(valid), 'abstain');
assert.equal(parseRequest(JSON.stringify(request)).goal, request.goal);
assert.throws(
  () => validateRequest({ ...request, candidates: request.candidates.filter(({ id }) => id !== 'abstain') }),
  /required candidate missing: abstain/,
);
assert.throws(
  () => validateRequest({ ...request, candidates: [...request.candidates, request.candidates[0]] }),
  /duplicate candidate id: scroll_one_viewport/,
);
assert.throws(() => validateRequest({ ...request, tool: 'click' }), /unsupported request field: tool/);
assert.throws(() => validateRequest({ ...request, observation: { credentials: 'not-allowed' } }), /forbidden observation field/);
assert.throws(() => validateRequest({ ...request, observation: { safe: { nested: true } } }), /compact primitive values/);
assert.throws(() => validateRequest({ ...request, observation: { safe: 'line one\nline two' } }), /raw multiline content/);
assert.throws(() => validateRequest({ ...request, observation: { safe: 'vck_example_not_a_real_key' } }), /appears to contain a secret/);
assert.throws(() => parseArgs(['--liv']), /unsupported argument: --liv/);
assert.throws(() => parseRequest('{'), /invalid JSON/);

const mock = await choose(valid, { live: false });
assert.equal(mock.choice, 'abstain');
const gate = { currentObservationId: request.observationId, candidateIds: request.candidates.map(({ id }) => id) };
assert.deepEqual(canExecute(mock, gate), { ok: false, reason: 'unexpected_provider' });

const answer = (probability = 0.98) => ({
  answers: {
    nextAction: {
      choice: 'scroll_one_viewport',
      probabilities: {
        scroll_one_viewport: probability,
        reobserve: (1 - probability) / 2,
        abstain: (1 - probability) / 2,
      },
    },
  },
  response: { modelId: 'typesafe-ai/jev' },
  providerMetadata: { gateway: { cost: '0' } },
});

const live = await choose(valid, { live: true, apiKey: 'test-only', evaluator: async () => answer() });
assert.deepEqual(canExecute(live, gate), { ok: true, reason: 'eligible' });
assert.deepEqual(canExecute(live, { ...gate, currentObservationId: 'newer-observation' }), { ok: false, reason: 'stale_observation' });
assert.deepEqual(canExecute(live, { ...gate, candidateIds: ['reobserve', 'abstain'] }), { ok: false, reason: 'unknown_candidate' });
await assert.rejects(
  choose(valid, { live: true, apiKey: 'test-only', evaluator: async () => answer(0.34) }),
  /below minProbability/,
);
await assert.rejects(
  choose(valid, { live: true, apiKey: 'test-only', evaluator: async () => ({ answers: {} }) }),
  /unknown candidate/,
);
await assert.rejects(
  choose(valid, { live: true, apiKey: 'test-only', evaluator: async () => { throw new Error('provider timeout'); } }),
  /provider timeout/,
);

const child = spawn(process.execPath, [fileURLToPath(new URL('./choose-computer-action.mjs', import.meta.url)), '--serve', '--mock'], {
  stdio: ['pipe', 'pipe', 'pipe'],
});
let stdout = '';
let stderr = '';
child.stdout.on('data', (chunk) => { stdout += chunk; });
child.stderr.on('data', (chunk) => { stderr += chunk; });
child.stdin.end(`{}\n${JSON.stringify(request)}\n`);
const exitCode = await new Promise((resolve) => child.on('close', resolve));
assert.equal(exitCode, 0, stderr);
const responses = stdout.trim().split(/\r?\n/).map(JSON.parse);
assert.equal(responses.length, 2);
assert.match(responses[0].error, /schema must be/);
assert.equal(responses[1].choice, 'abstain');
assert.equal(responses[1].observationId, request.observationId);

const typo = spawn(process.execPath, [fileURLToPath(new URL('./choose-computer-action.mjs', import.meta.url)), '--liv'], {
  stdio: ['pipe', 'pipe', 'pipe'],
});
let typoError = '';
typo.stderr.on('data', (chunk) => { typoError += chunk; });
typo.stdin.end(`${JSON.stringify(request)}\n`);
const typoExit = await new Promise((resolve) => typo.on('close', resolve));
assert.equal(typoExit, 64);
assert.match(typoError, /unsupported argument: --liv/);

console.log('choose-computer-action self-check passed');
