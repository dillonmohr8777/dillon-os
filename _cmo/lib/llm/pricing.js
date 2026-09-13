/**
 * Model price table and cost accounting.
 *
 * Prices are USD per million tokens, first-party Anthropic API rates as of
 * 2026-08-18. Bedrock and Vertex are partner-operated with separate rates and
 * are NOT covered here.
 *
 * This table is the single place prices live. Every dollar figure the product
 * shows - a run's cost, a workspace's daily spend, a client report's model
 * line - is derived from it, so a rate change is a one-line edit and never a
 * hunt through the codebase.
 *
 * Why this file exists at all: the products in this category meter you in
 * opaque "credits" and will not tell you what an action costs. Reviewers of
 * okara report "zero transparency on how many credits one CMO initialization
 * actually burns". Every number a CMO OS workspace sees is a real dollar
 * figure derived from this table plus the token counts the API returned.
 */

/** @typedef {{ id: string, label: string, tier: string, contextTokens: number, inUsd: number, outUsd: number, maxOutput: number }} ModelSpec */

export const CACHE_WRITE_MULTIPLIER = 1.25; // writing to the cache costs ~1.25x input
export const CACHE_READ_MULTIPLIER = 0.1;   // reading from it costs ~0.1x input
export const BATCH_MULTIPLIER = 0.5;        // Batch API runs at 50%

/**
 * Tiers are how the router reasons about substitution:
 *   frontier - hardest reasoning, long-horizon work
 *   premium  - default working tier
 *   standard - drafting and structured extraction at volume
 *   economy  - classification, tagging, cheap passes
 */
export const MODELS = Object.freeze({
  'claude-fable-5': { id: 'claude-fable-5', label: 'Claude Fable 5', tier: 'frontier', contextTokens: 1_000_000, inUsd: 10, outUsd: 50, maxOutput: 128_000 },
  'claude-opus-5': { id: 'claude-opus-5', label: 'Claude Opus 5', tier: 'premium', contextTokens: 1_000_000, inUsd: 5, outUsd: 25, maxOutput: 128_000 },
  'claude-opus-4-8': { id: 'claude-opus-4-8', label: 'Claude Opus 4.8', tier: 'premium', contextTokens: 1_000_000, inUsd: 5, outUsd: 25, maxOutput: 128_000 },
  // Sonnet 5 carries the promotional rate as its CURRENT EFFECTIVE price.
  // Sources disagree on what happens after 2026-08-31: the cached model
  // reference lists list price $3/$15 with $2/$10 as an introductory rate
  // through that date, while later documentation states the increase will not
  // take effect. Both readings agree on today's price, so the effective rate is
  // what gets billed and the list price is recorded beside it. If a future
  // invoice shows $3/$15, change `inUsd`/`outUsd` here - nothing else needs to
  // move, because every dollar figure in the product derives from this table.
  'claude-sonnet-5': {
    id: 'claude-sonnet-5', label: 'Claude Sonnet 5', tier: 'standard',
    contextTokens: 1_000_000, inUsd: 2, outUsd: 10, maxOutput: 128_000,
    listInUsd: 3, listOutUsd: 15, priceNote: 'promotional rate in effect; list price is $3/$15',
  },
  'claude-sonnet-4-6': { id: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6', tier: 'standard', contextTokens: 1_000_000, inUsd: 3, outUsd: 15, maxOutput: 128_000 },
  'claude-haiku-4-5': { id: 'claude-haiku-4-5', label: 'Claude Haiku 4.5', tier: 'economy', contextTokens: 200_000, inUsd: 1, outUsd: 5, maxOutput: 64_000 },
});

export const DEFAULT_MODEL = 'claude-opus-5';

export function modelSpec(id) {
  return MODELS[id] || null;
}

export function knownModels() {
  return Object.values(MODELS);
}

/**
 * Price one call.
 *
 * `usage` accepts the Anthropic usage object shape directly:
 *   { input_tokens, output_tokens, cache_creation_input_tokens, cache_read_input_tokens }
 * Uncached input, cache writes, and cache reads are each priced on their own
 * multiplier, which is why a well-cached agent run costs a fraction of a
 * naive one and why the ledger shows the saving explicitly.
 */
export function priceCall({ model, usage = {}, batch = false }) {
  const spec = modelSpec(model);
  if (!spec) {
    return { usd: 0, unknownModel: model, tokensIn: 0, tokensOut: 0, breakdown: {}, cacheSavingsUsd: 0 };
  }
  const inTok = num(usage.input_tokens ?? usage.tokensIn);
  const outTok = num(usage.output_tokens ?? usage.tokensOut);
  const cacheWrite = num(usage.cache_creation_input_tokens ?? usage.cacheWrite);
  const cacheRead = num(usage.cache_read_input_tokens ?? usage.cacheRead);

  const perIn = spec.inUsd / 1_000_000;
  const perOut = spec.outUsd / 1_000_000;
  const mult = batch ? BATCH_MULTIPLIER : 1;

  const breakdown = {
    inputUsd: round6(inTok * perIn * mult),
    outputUsd: round6(outTok * perOut * mult),
    cacheWriteUsd: round6(cacheWrite * perIn * CACHE_WRITE_MULTIPLIER * mult),
    cacheReadUsd: round6(cacheRead * perIn * CACHE_READ_MULTIPLIER * mult),
  };
  const usd = round6(breakdown.inputUsd + breakdown.outputUsd + breakdown.cacheWriteUsd + breakdown.cacheReadUsd);

  // What the cached tokens WOULD have cost at full input price, minus what
  // they did cost. This is the number that justifies the caching work.
  const cacheSavingsUsd = round6(cacheRead * perIn * mult * (1 - CACHE_READ_MULTIPLIER));

  return {
    usd,
    model,
    tier: spec.tier,
    tokensIn: inTok + cacheWrite + cacheRead,
    tokensOut: outTok,
    billableInput: inTok,
    cacheWrite,
    cacheRead,
    cacheHitRate: inTok + cacheRead > 0 ? round6(cacheRead / (inTok + cacheRead)) : 0,
    cacheSavingsUsd,
    batch,
    breakdown,
  };
}

/** Pre-call estimate, used by the budget check before spending anything. */
export function estimateCall({ model, promptTokens = 0, expectedOutputTokens = 1200, batch = false }) {
  const spec = modelSpec(model);
  if (!spec) return 0;
  const mult = batch ? BATCH_MULTIPLIER : 1;
  return round6(((promptTokens * spec.inUsd) + (expectedOutputTokens * spec.outUsd)) / 1_000_000 * mult);
}

/**
 * Rough token estimate for budgeting only.
 *
 * This is NOT a tokenizer. It is used to decide whether a call is likely to
 * blow a cap before we make it. Real token counts always come back from the
 * API and overwrite this. ~3.6 chars/token is a conservative English prose
 * approximation that errs high, which is the safe direction for a cap check.
 */
export function estimateTokens(text) {
  if (!text) return 0;
  const s = typeof text === 'string' ? text : JSON.stringify(text);
  return Math.ceil(s.length / 3.6);
}

function num(v) { const n = Number(v || 0); return Number.isFinite(n) ? n : 0; }
function round6(n) { return Math.round(Number(n || 0) * 1e6) / 1e6; }
