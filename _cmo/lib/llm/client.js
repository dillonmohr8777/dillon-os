/**
 * The LLM client: one call path for the whole product.
 *
 * Everything a model call needs to be accountable happens here, in order:
 *
 *   1. ROUTE     - task class -> model, budget-aware, with a written rationale
 *   2. BUDGET    - estimate and check the cap BEFORE spending
 *   3. CACHE     - identical call served free (never for measurement replicates)
 *   4. BREAKER   - skip a provider that is already failing
 *   5. RETRY     - backoff on transient errors only
 *   6. VALIDATE  - structured output checked against its schema, with one
 *                  repair attempt before the step fails
 *   7. PRICE     - real dollars from real token counts
 *   8. RECORD    - ledger entry + journal meter, attributed to agent and run
 *
 * No agent calls a provider directly. That is what makes "what did this cost
 * and why did it say that" answerable for every artifact in the system.
 */

import { createRouter, TASK_CLASSES } from './router.js';
import { priceCall, estimateCall, estimateTokens } from './pricing.js';
import { cacheKey, createCache } from './cache.js';
import { validate } from './validate.js';
import { withRetry, DEFAULT_POLICY } from '../runtime/retry.js';
import { ValidationError, BudgetError } from '../core/errors.js';

export function createLlmClient({
  provider,
  router = null,
  budget = null,
  breakers = null,
  cache = null,
  clock,
  logger = null,
  profile = 'quality',
  retryPolicy = DEFAULT_POLICY,
}) {
  if (!provider) throw new ValidationError('createLlmClient requires a provider');
  const route = router || createRouter({ profile, breakers });
  const responses = cache || createCache({ clock });

  /**
   * @param {object} req
   * @param {string}  req.taskClass  key of TASK_CLASSES
   * @param {string}  req.system     stable prefix (brand profile / voice) - keep byte-identical for cache hits
   * @param {string|Array} req.user  the volatile part of the prompt
   * @param {object}  req.schema     { name, description, input_schema } to force structured output
   * @param {object}  req.meter      journal step meter; cost and sources are written into it
   * @param {string}  req.agent      agent id, for cost attribution
   * @param {string}  req.runId      run id, for the per-run cap
   * @param {boolean} req.nocache    true for measurement replicates - never cache these
   */
  async function complete({
    taskClass = 'draft', system = '', user = '', schema = null,
    meter = null, agent = null, runId = null, nocache = false,
    maxTokens = null, pin = null,
  }) {
    const task = TASK_CLASSES[taskClass];
    if (!task) throw new ValidationError(`unknown task class: ${taskClass}`);

    // 1. Route (budget decides whether to ask for a downshift)
    let downshift = false;
    let budgetDecision = null;
    if (budget) {
      budgetDecision = await budget.check({ runId });
      downshift = budgetDecision.downshift;
      if (!budgetDecision.allowed) {
        throw new BudgetError(`budget exhausted: ${budgetDecision.reasons.join('; ')}`, {
          remaining: budgetDecision.remaining, agent, runId,
        });
      }
    }
    const decision = route.route(taskClass, { downshift, pin });
    const messages = Array.isArray(user) ? user : [{ role: 'user', content: String(user) }];
    const cap = maxTokens || Math.max(1024, Math.round(task.expectedOutput * 1.6));

    // 2. Pre-flight cost check against the remaining cap
    const promptTokens = estimateTokens(system) + estimateTokens(messages);
    const estimate = estimateCall({ model: decision.model, promptTokens, expectedOutputTokens: task.expectedOutput });
    if (budget) {
      const pre = await budget.check({ estimateUsd: estimate, runId });
      if (!pre.allowed) {
        throw new BudgetError(`call would exceed budget: ${pre.reasons.join('; ')}`, {
          estimateUsd: estimate, remaining: pre.remaining, model: decision.model, agent,
        });
      }
    }

    const key = cacheKey({ model: decision.model, system, messages, schema, effort: decision.effort });

    // 3. Cache
    if (!nocache) {
      const hit = await responses.get(key);
      if (hit) {
        if (meter) {
          meter.model = decision.model;
          meter.notes.push(`cache hit (${key.slice(0, 8)}) - $0.00, routed ${decision.rationale}`);
        }
        return { ...hit, cached: true, decision, usd: 0 };
      }
    }

    // 4-6. Breaker + retry + validate
    const breaker = breakers ? breakers.for(`model:${decision.model}`) : null;
    const attemptCall = async (extraInstruction = null) => {
      const msgs = extraInstruction
        ? [...messages, { role: 'user', content: extraInstruction }]
        : messages;
      const call = () => provider.complete({
        model: decision.model,
        system,
        messages: msgs,
        schema,
        effort: decision.effort,
        maxTokens: cap,
        taskClass,
      });
      return breaker ? breaker.run(call) : call();
    };

    let raw = await withRetry(() => attemptCall(), {
      policy: retryPolicy,
      seed: `${runId || 'norun'}:${key}`,
      label: `${agent || 'llm'}:${taskClass}`,
      onRetry: ({ attempt, waitMs, error }) => {
        if (meter) meter.notes.push(`retry ${attempt} after ${waitMs}ms: ${error.code || error.message}`);
        if (logger) logger.warn('llm retry', { attempt, waitMs, code: error.code, model: decision.model });
      },
    });

    let repaired = false;
    if (schema) {
      const check = validate(raw.parsed, schema.input_schema);
      if (!check.valid) {
        // One repair attempt with the errors fed back, then give up. An
        // unbounded repair loop is how a cheap step becomes an expensive one.
        if (logger) logger.warn('structured output failed validation, repairing', { schema: schema.name, errors: check.errors.slice(0, 3) });
        const instruction = `Your previous response did not satisfy the ${schema.name} schema. Fix exactly these problems and return the corrected object:\n${check.errors.slice(0, 12).map((e) => `- ${e}`).join('\n')}`;
        const second = await attemptCall(instruction);
        const recheck = validate(second.parsed, schema.input_schema);
        // Bill the failed attempt too - it really was spent.
        recordSpend(raw, decision, { agent, runId, taskClass, meter, note: 'discarded: schema validation failed' });
        if (!recheck.valid) {
          throw new ValidationError(`structured output failed schema ${schema.name} after one repair`, {
            schema: schema.name, errors: recheck.errors.slice(0, 12), model: decision.model,
          });
        }
        raw = second;
        repaired = true;
      }
    }

    // 7-8. Price and record
    const priced = recordSpend(raw, decision, { agent, runId, taskClass, meter, note: repaired ? 'accepted after repair' : null });

    const result = {
      text: raw.text,
      parsed: raw.parsed,
      model: raw.model || decision.model,
      usage: raw.usage,
      usd: priced.usd,
      cached: false,
      repaired,
      decision,
      provider: raw.provider,
      truncated: Boolean(raw.truncated),
    };
    if (!nocache) await responses.set(key, { text: result.text, parsed: result.parsed, model: result.model, usage: result.usage, provider: result.provider }, { nocache });
    return result;
  }

  // Declared before recordSpend so the closure never sits in a temporal dead
  // zone if a future caller reaches recordSpend earlier in the module's life.
  const pendingLedger = [];

  function recordSpend(raw, decision, { agent, runId, taskClass, meter, note }) {
    const priced = priceCall({ model: raw.model || decision.model, usage: raw.usage });
    if (meter) {
      meter.usd += priced.usd;
      meter.tokensIn += priced.tokensIn;
      meter.tokensOut += priced.tokensOut;
      meter.model = raw.model || decision.model;
      meter.notes.push(`${taskClass} -> ${priced.model} $${priced.usd.toFixed(4)}${note ? ` (${note})` : ''}; ${decision.rationale}`);
    }
    if (budget) {
      // Fire-and-forget would lose ledger entries on crash; awaited by callers
      // through the returned promise below.
      pendingLedger.push(budget.record({
        usd: priced.usd, model: priced.model, tier: priced.tier, agent, runId, taskClass,
        tokensIn: priced.tokensIn, tokensOut: priced.tokensOut,
        cacheRead: priced.cacheRead, cacheSavingsUsd: priced.cacheSavingsUsd,
        note: note || undefined,
      }));
    }
    return priced;
  }

  return {
    complete,
    router: route,
    cacheStats: () => responses.stats(),
    /** Await all ledger writes. Called at the end of a run. */
    flush: async () => {
      const p = pendingLedger.splice(0, pendingLedger.length);
      await Promise.all(p);
    },
  };
}
