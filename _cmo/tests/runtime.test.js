/**
 * Runtime invariants.
 *
 * These are the properties that must never regress, because each one is a way
 * the system could quietly do harm: publish twice, let an agent approve itself,
 * overspend, leak one client's data into another's report, or report a number
 * with more confidence than the data supports.
 *
 * Run: node --test tests/*.test.js
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { createStore } from '../lib/store/store.js';
import { frozenClock } from '../lib/core/clock.js';
import { createBudget } from '../lib/runtime/budget.js';
import { createBreaker, breakerRegistry, OPEN, HALF_OPEN, CLOSED } from '../lib/runtime/breaker.js';
import { withRetry } from '../lib/runtime/retry.js';
import { createIdempotencyStore, effectKey } from '../lib/runtime/idempotency.js';
import { createApprovalQueue, riskFor, RISK, canTransition } from '../lib/runtime/approval.js';
import { createJournal, loadJournal, RECORD, REPLAY } from '../lib/runtime/journal.js';
import { ValidationError, fromHttp, isRetryable } from '../lib/core/errors.js';
import { priceCall, estimateTokens } from '../lib/llm/pricing.js';
import { createRouter } from '../lib/llm/router.js';
import { validate } from '../lib/llm/validate.js';
import { cacheKey } from '../lib/llm/cache.js';

const T0 = Date.parse('2026-08-18T09:00:00.000Z');

function harness() {
  const clock = frozenClock(T0);
  const store = createStore({ driver: 'memory', clock });
  return { clock, store };
}

// ---------------------------------------------------------------------------

describe('store: workspace isolation', () => {
  it('never returns one workspace\'s documents from another', async () => {
    const { clock, store } = harness();
    await store.upsertWorkspace({ id: 'client-a' });
    await store.upsertWorkspace({ id: 'client-b' });
    await store.ws('client-a').put('artifacts', 'art_1', { kind: 'article', body: 'a secret' });
    await store.ws('client-a').append('ledger', { usd: 1 });

    assert.equal((await store.ws('client-b').list('artifacts')).length, 0);
    assert.equal((await store.ws('client-b').read('ledger')).length, 0);
    assert.equal(await store.ws('client-b').get('artifacts', 'art_1'), null);
  });

  it('refuses ids that would escape the collection directory', () => {
    const { store } = harness();
    assert.throws(() => store.ws('../etc'), /unsafe workspace id/);
  });

  it('rejects unknown collections rather than silently creating them', async () => {
    const { store } = harness();
    await store.upsertWorkspace({ id: 'a' });
    await assert.rejects(() => store.ws('a').list('secrets'), /unknown collection/);
  });

  it('tail returns the last N valid records', async () => {
    const { store } = harness();
    await store.upsertWorkspace({ id: 'a' });
    for (let i = 0; i < 5; i += 1) await store.ws('a').append('events', { n: i });
    const tail = await store.ws('a').tail('events', 2);
    assert.deepEqual(tail.map((e) => e.n), [3, 4]);
  });
});

describe('approval: separation of duties', () => {
  it('refuses to let any agent approve anything', async () => {
    const { clock, store } = harness();
    await store.upsertWorkspace({ id: 'a' });
    const q = createApprovalQueue({ store, wsId: 'a', clock });
    await q.open({ id: 'apr_1', artifactId: 'art_1', effect: 'publish.cms', title: 'Post', createdBy: 'agent:writer' });

    await assert.rejects(() => q.approve('apr_1', { by: 'agent:writer' }), /agent cannot approve/);
    await assert.rejects(() => q.approve('apr_1', { by: 'agent:qa-critic' }), /agent cannot approve/);
    const ok = await q.approve('apr_1', { by: 'dillon' });
    assert.equal(ok.state, 'approved');
    assert.equal(ok.decidedBy, 'dillon');
  });

  it('refuses when the maker is the checker', async () => {
    const { clock, store } = harness();
    await store.upsertWorkspace({ id: 'a' });
    const q = createApprovalQueue({ store, wsId: 'a', clock });
    await q.open({ id: 'apr_1', artifactId: 'art_1', effect: 'send.email', title: 'Blast', createdBy: 'dillon' });
    await assert.rejects(() => q.approve('apr_1', { by: 'dillon' }), /separation of duties/);
    assert.equal((await q.approve('apr_1', { by: 'sam' })).state, 'approved');
  });

  it('refuses approval while a blocking guardrail is unresolved', async () => {
    const { clock, store } = harness();
    await store.upsertWorkspace({ id: 'a' });
    const q = createApprovalQueue({ store, wsId: 'a', clock });
    await q.open({
      id: 'apr_1', artifactId: 'art_1', effect: 'publish.cms', title: 'Post',
      createdBy: 'agent:writer', guardrails: { blocking: [{ rule: 'unsourced-claim' }] },
    });
    await assert.rejects(() => q.approve('apr_1', { by: 'dillon' }), /blocking guardrails/);
  });

  it('treats an unrecognised effect as high risk, never as low', () => {
    assert.equal(riskFor('publish.cms'), RISK.high);
    assert.equal(riskFor('internal.brief'), RISK.low);
    assert.equal(riskFor('some.new.publisher'), RISK.high);
  });

  it('never auto-approves a high-risk effect even when the policy allows auto-approval', async () => {
    const { clock, store } = harness();
    await store.upsertWorkspace({ id: 'a' });
    const q = createApprovalQueue({ store, wsId: 'a', clock, policy: { autoApproveLow: true } });
    const low = await q.open({ id: 'a1', artifactId: 'x', effect: 'internal.brief', title: 'B', createdBy: 'agent:x' });
    const high = await q.open({ id: 'a2', artifactId: 'y', effect: 'publish.gbp', title: 'P', createdBy: 'agent:x' });
    assert.equal(low.state, 'approved');
    assert.equal(high.state, 'pending');
  });

  it('forbids illegal state transitions', async () => {
    const { clock, store } = harness();
    await store.upsertWorkspace({ id: 'a' });
    const q = createApprovalQueue({ store, wsId: 'a', clock });
    await q.open({ id: 'apr_1', artifactId: 'x', effect: 'publish.cms', title: 'P', createdBy: 'agent:x' });
    await assert.rejects(() => q.markPublished('apr_1', { by: 'dillon' }), /cannot move approval/);
    assert.equal(canTransition('pending', 'approved'), true);
    assert.equal(canTransition('rejected', 'approved'), false);
  });

  it('expires stale pending approvals rather than holding them silently', async () => {
    const { clock, store } = harness();
    await store.upsertWorkspace({ id: 'a' });
    const q = createApprovalQueue({ store, wsId: 'a', clock, policy: { staleAfterDays: 7 } });
    await q.open({ id: 'apr_1', artifactId: 'x', effect: 'publish.cms', title: 'P', createdBy: 'agent:x' });
    assert.equal((await q.expireStale()).length, 0);
    clock.advance(8 * 86_400_000);
    assert.equal((await q.expireStale()).length, 1);
    assert.equal((await q.get('apr_1')).state, 'expired');
  });
});

describe('idempotency: a retry must never publish twice', () => {
  it('performs an effect exactly once for a given key', async () => {
    const { clock, store } = harness();
    await store.upsertWorkspace({ id: 'a' });
    const idem = createIdempotencyStore({ store, wsId: 'a', clock });
    const key = effectKey({ workspaceId: 'a', channel: 'wordpress', target: '/post', content: 'body' });

    let published = 0;
    const first = await idem.once(key, async () => { published += 1; return { postId: 7 }; });
    const second = await idem.once(key, async () => { published += 1; return { postId: 8 }; });
    const third = await idem.once(key, async () => { published += 1; return { postId: 9 }; });

    assert.equal(published, 1);
    assert.equal(first.skipped, false);
    assert.equal(second.skipped, true);
    assert.deepEqual(second.result, { postId: 7 });
    assert.equal(third.skipped, true);
  });

  it('derives the same key from the same intent and a different key from different content', () => {
    const a = effectKey({ workspaceId: 'w', channel: 'gbp', target: 'loc1', content: 'hello' });
    const b = effectKey({ workspaceId: 'w', channel: 'gbp', target: 'loc1', content: 'hello' });
    const c = effectKey({ workspaceId: 'w', channel: 'gbp', target: 'loc1', content: 'HELLO' });
    const d = effectKey({ workspaceId: 'other', channel: 'gbp', target: 'loc1', content: 'hello' });
    assert.equal(a, b);
    assert.notEqual(a, c);
    assert.notEqual(a, d, 'keys must be workspace-scoped');
  });

  it('records a failure without marking the effect done', async () => {
    const { clock, store } = harness();
    await store.upsertWorkspace({ id: 'a' });
    const idem = createIdempotencyStore({ store, wsId: 'a', clock });
    const key = effectKey({ workspaceId: 'a', channel: 'x', target: 't', content: 'c' });
    await assert.rejects(() => idem.once(key, async () => { throw new Error('upstream down'); }));
    assert.equal((await idem.lookup(key)).state, 'failed');
  });
});

describe('budget: spend cannot exceed the cap', () => {
  it('blocks once the daily cap is reached', async () => {
    const { clock, store } = harness();
    await store.upsertWorkspace({ id: 'a' });
    const budget = createBudget({ store, wsId: 'a', clock, limits: { dailyUsd: 1, monthlyUsd: 10, perRunUsd: 5 } });
    assert.equal((await budget.check()).allowed, true);
    await budget.record({ usd: 0.99, model: 'claude-opus-5' });
    assert.equal((await budget.check()).allowed, true);
    await budget.record({ usd: 0.02, model: 'claude-opus-5' });
    assert.equal((await budget.check()).allowed, false);
    await assert.rejects(() => budget.assertAllowed(), /budget exhausted/);
  });

  it('signals downshift before it hard-stops', async () => {
    const { clock, store } = harness();
    await store.upsertWorkspace({ id: 'a' });
    const budget = createBudget({ store, wsId: 'a', clock, limits: { dailyUsd: 1, downshiftAt: 0.7 } });
    await budget.record({ usd: 0.75 });
    const d = await budget.check();
    assert.equal(d.allowed, true, 'still under the cap');
    assert.equal(d.downshift, true, 'but the router should degrade');
  });

  it('enforces a per-run cap independently of the daily cap', async () => {
    const { clock, store } = harness();
    await store.upsertWorkspace({ id: 'a' });
    const budget = createBudget({ store, wsId: 'a', clock, limits: { dailyUsd: 100, perRunUsd: 0.5 } });
    await budget.record({ usd: 0.6, runId: 'run_1' });
    assert.equal((await budget.check({ runId: 'run_1' })).allowed, false);
    assert.equal((await budget.check({ runId: 'run_2' })).allowed, true);
  });

  it('rejects a call whose estimate would breach the cap, before spending', async () => {
    const { clock, store } = harness();
    await store.upsertWorkspace({ id: 'a' });
    const budget = createBudget({ store, wsId: 'a', clock, limits: { dailyUsd: 1 } });
    await budget.record({ usd: 0.9 });
    assert.equal((await budget.check({ estimateUsd: 0.5 })).allowed, false);
    assert.equal((await budget.check({ estimateUsd: 0.05 })).allowed, true);
  });
});

describe('breaker: a dead connector fails fast', () => {
  it('opens after the threshold and half-opens after the cooldown', () => {
    let t = 1000;
    const b = createBreaker({ name: 'ads', threshold: 2, cooldownMs: 500, clock: { now: () => t } });
    assert.equal(b.state, CLOSED);
    b.recordFailure(new Error('a'));
    assert.equal(b.state, CLOSED);
    b.recordFailure(new Error('b'));
    assert.equal(b.state, OPEN);
    assert.equal(b.allows(), false);
    t = 1600;
    assert.equal(b.state, HALF_OPEN);
    b.recordSuccess();
    assert.equal(b.state, CLOSED);
  });

  it('re-opens when the probe fails', () => {
    let t = 0;
    const b = createBreaker({ threshold: 1, cooldownMs: 100, clock: { now: () => t } });
    b.recordFailure(new Error('x'));
    t = 200;
    assert.equal(b.state, HALF_OPEN);
    b.recordFailure(new Error('y'));
    assert.equal(b.state, OPEN);
  });

  it('shares one breaker per name through the registry', () => {
    const reg = breakerRegistry({ threshold: 1 });
    reg.for('gsc').recordFailure(new Error('x'));
    assert.equal(reg.for('gsc').allows(), false);
    assert.equal(reg.for('ga4').allows(), true, 'connectors must not share fate');
  });
});

describe('retry: only retryable errors are retried', () => {
  it('retries a transient failure and gives up on a validation error', async () => {
    let attempts = 0;
    const out = await withRetry(async () => {
      attempts += 1;
      if (attempts < 3) { const e = new Error('reset'); e.code = 'ECONNRESET'; throw e; }
      return 'ok';
    }, { sleep: async () => {}, seed: 'test' });
    assert.equal(out, 'ok');
    assert.equal(attempts, 3);

    let tries = 0;
    await assert.rejects(() => withRetry(async () => { tries += 1; throw new ValidationError('bad shape'); }, { sleep: async () => {} }));
    assert.equal(tries, 1, 'a validation error must not be retried');
  });

  it('honours an explicit Retry-After over its own backoff', async () => {
    const waits = [];
    const err = fromHttp(429, { retry_after: 3 }, { host: 'x' });
    assert.equal(err.retryAfterMs, 3000);
    let n = 0;
    await withRetry(async () => { n += 1; if (n === 1) throw err; return 1; }, { sleep: async (ms) => waits.push(ms) });
    assert.deepEqual(waits, [3000]);
  });

  it('classifies HTTP status codes correctly', () => {
    assert.equal(isRetryable(fromHttp(503, '', {})), true);
    assert.equal(isRetryable(fromHttp(500, '', {})), true);
    assert.equal(isRetryable(fromHttp(401, '', {})), false);
    assert.equal(isRetryable(fromHttp(404, '', {})), false);
  });
});

describe('journal: audit and deterministic replay', () => {
  it('reuses unchanged steps and re-executes from the first change', async () => {
    const { clock, store } = harness();
    await store.upsertWorkspace({ id: 'a' });
    let crawls = 0;
    let writes = 0;

    const run = async (runId, promptVersion, mode, prior, replayOf) => {
      const j = createJournal({ store, wsId: 'a', runId, clock, mode, priorEntries: prior, replayOfRun: replayOf });
      const crawl = await j.step('crawl', async (m) => { crawls += 1; m.usd = 0.02; return { pages: 12 }; }, { inputs: { url: 'u' } });
      const brief = await j.step('brief', async (m) => { m.usd = 0.05; return { h1: 'H', pages: crawl.pages }; }, { inputs: { pages: crawl.pages } });
      await j.step('draft', async (m) => { writes += 1; m.usd = 0.3; return { words: 100 * promptVersion }; }, { inputs: { brief, promptVersion } });
      return j;
    };

    const first = await run('run_1', 1, RECORD, null, null);
    assert.deepEqual(pick(first.stats()), { steps: 3, replayed: 0, live: 3 });

    const recording = await loadJournal(store, 'a', 'run_1');
    assert.equal(recording.length, 3);

    const identical = await run('run_2', 1, REPLAY, recording, 'run_1');
    assert.deepEqual(pick(identical.stats()), { steps: 3, replayed: 3, live: 0 });
    assert.equal(identical.stats().usd, 0, 'a full replay must cost nothing');

    const changed = await run('run_3', 2, REPLAY, recording, 'run_1');
    assert.deepEqual(pick(changed.stats()), { steps: 3, replayed: 2, live: 1 });
    assert.equal(changed.diverged().at.name, 'draft');
    assert.equal(changed.diverged().at.reason, 'inputs changed');

    assert.equal(crawls, 1, 'the expensive step ran once across three runs');
    assert.equal(writes, 2, 'only the changed step re-executed');
  });

  it('keeps the recording clean across repeated replays', async () => {
    const { clock, store } = harness();
    await store.upsertWorkspace({ id: 'a' });
    const record = createJournal({ store, wsId: 'a', runId: 'r1', clock, mode: RECORD });
    await record.step('one', async () => 1, { inputs: {} });
    await record.step('two', async () => 2, { inputs: {} });

    for (const runId of ['r2', 'r3', 'r4']) {
      const prior = await loadJournal(store, 'a', 'r1');
      assert.equal(prior.length, 2, 'replays must not append to the original run');
      const j = createJournal({ store, wsId: 'a', runId, clock, mode: REPLAY, priorEntries: prior, replayOfRun: 'r1' });
      await j.step('one', async () => 99, { inputs: {} });
      await j.step('two', async () => 99, { inputs: {} });
      assert.equal(j.stats().replayed, 2);
    }
  });

  it('records a failing step and rethrows', async () => {
    const { clock, store } = harness();
    await store.upsertWorkspace({ id: 'a' });
    const j = createJournal({ store, wsId: 'a', runId: 'r1', clock, mode: RECORD });
    await assert.rejects(() => j.step('boom', async () => { throw new ValidationError('nope'); }, { inputs: {} }));
    const entries = await store.ws('a').read('journal');
    assert.equal(entries[0].status, 'error');
    assert.equal(entries[0].error.code, 'VALIDATION');
  });
});

function pick(s) { return { steps: s.steps, replayed: s.replayed, live: s.live }; }

describe('pricing and routing', () => {
  it('prices cache reads far below fresh input', () => {
    const cached = priceCall({ model: 'claude-opus-5', usage: { input_tokens: 5000, output_tokens: 2000, cache_read_input_tokens: 100000 } });
    const fresh = priceCall({ model: 'claude-opus-5', usage: { input_tokens: 105000, output_tokens: 2000 } });
    assert.ok(cached.usd < fresh.usd / 3, 'caching must be a large saving');
    assert.ok(cached.cacheSavingsUsd > 0);
    assert.ok(cached.cacheHitRate > 0.9);
  });

  it('returns zero rather than guessing for an unknown model', () => {
    const p = priceCall({ model: 'not-a-model', usage: { input_tokens: 1000 } });
    assert.equal(p.usd, 0);
    assert.equal(p.unknownModel, 'not-a-model');
  });

  it('halves cost for the batch API', () => {
    const a = priceCall({ model: 'claude-sonnet-5', usage: { input_tokens: 100000, output_tokens: 2000 } });
    const b = priceCall({ model: 'claude-sonnet-5', usage: { input_tokens: 100000, output_tokens: 2000 }, batch: true });
    assert.equal(b.usd, a.usd / 2);
  });

  it('defaults every task class to the premium tier', () => {
    const r = createRouter({ profile: 'quality' });
    for (const row of r.table()) assert.equal(row.model, 'claude-opus-5', `${row.taskClass} should default to opus`);
  });

  it('never downshifts a judgement task under budget pressure', () => {
    const r = createRouter({ profile: 'balanced' });
    const draftNormal = r.route('draft').model;
    const draftSqueezed = r.route('draft', { downshift: true }).model;
    assert.notEqual(draftNormal, draftSqueezed, 'drafting may degrade');
    for (const protectedClass of ['verify', 'critique', 'reconcile']) {
      assert.equal(
        r.route(protectedClass).model,
        r.route(protectedClass, { downshift: true }).model,
        `${protectedClass} must not degrade: a cheaper checker produces false confidence`,
      );
    }
  });

  it('falls back to another model when a provider breaker is open', () => {
    const breakers = breakerRegistry({ threshold: 1 });
    breakers.for('model:claude-opus-5').recordFailure(new Error('529'));
    const r = createRouter({ profile: 'quality', breakers });
    const d = r.route('strategy');
    assert.notEqual(d.model, 'claude-opus-5');
    assert.match(d.rationale, /unavailable/);
  });

  it('writes a rationale for every routing decision', () => {
    const r = createRouter({ profile: 'balanced' });
    assert.ok(r.route('longform').rationale.length > 10);
  });

  it('keys the response cache on the model, so a cheap answer is never served as a premium one', () => {
    const base = { system: 's', messages: [{ role: 'user', content: 'q' }], schema: null, effort: 'high' };
    assert.notEqual(
      cacheKey({ ...base, model: 'claude-opus-5' }),
      cacheKey({ ...base, model: 'claude-haiku-4-5' }),
    );
    assert.equal(cacheKey({ ...base, model: 'claude-opus-5' }), cacheKey({ ...base, model: 'claude-opus-5' }));
  });

  it('estimates tokens high rather than low', () => {
    assert.ok(estimateTokens('a'.repeat(360)) >= 100);
  });
});

describe('schema validation', () => {
  it('accepts a conforming object and reports every problem in a bad one', () => {
    const schema = {
      type: 'object',
      properties: {
        name: { type: 'string', minLength: 2 },
        count: { type: 'integer', minimum: 0, maximum: 10 },
        tag: { type: 'string', enum: ['a', 'b'] },
        items: { type: 'array', minItems: 1, items: { type: 'object', properties: { x: { type: 'number' } }, required: ['x'] } },
      },
      required: ['name', 'count', 'items'],
      additionalProperties: false,
    };
    assert.equal(validate({ name: 'ok', count: 3, tag: 'a', items: [{ x: 1 }] }, schema).valid, true);

    const bad = validate({ name: 'x', count: 44, tag: 'z', items: [], extra: 1 }, schema);
    assert.equal(bad.valid, false);
    const joined = bad.errors.join(' | ');
    assert.match(joined, /minLength/);
    assert.match(joined, /above maximum/);
    assert.match(joined, /not one of/);
    assert.match(joined, /at least 1 items/);
    assert.match(joined, /unexpected property/);
  });

  it('flags a missing required property', () => {
    const r = validate({}, { type: 'object', properties: { a: { type: 'string' } }, required: ['a'] });
    assert.equal(r.valid, false);
    assert.match(r.errors[0], /required property missing/);
  });
});
