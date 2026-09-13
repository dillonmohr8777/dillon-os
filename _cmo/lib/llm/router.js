/**
 * The model router.
 *
 * okara routes through Vercel AI Gateway, which solved their integration
 * problem (eight provider SDKs became one endpoint) but left the economic
 * decision invisible to the customer: you buy credits and the vendor decides
 * which model your money bought. Reviewers report "zero transparency on how
 * many credits one CMO initialization actually burns".
 *
 * Here routing is a control the operator owns, per workspace:
 *
 *   TASK CLASS       - work is classified by what it needs, not by who asked.
 *                      Deduping a keyword list does not need a frontier model;
 *                      a client-facing strategy memo does.
 *   PROFILE          - `quality` (the default) runs everything on the premium
 *                      tier. `balanced` and `economy` are explicit opt-ins,
 *                      never silent downgrades.
 *   BUDGET AWARENESS - when a workspace crosses its downshift threshold the
 *                      router degrades gracefully and SAYS SO in the run
 *                      journal, instead of failing or overspending.
 *   FALLBACK CHAIN   - provider outage or a tripped breaker moves to the next
 *                      candidate rather than dropping the run.
 *
 * Every decision returns a `rationale` string that is written to the journal,
 * so "why did this cost that" is always answerable.
 */

import { MODELS, DEFAULT_MODEL, modelSpec } from './pricing.js';
import { ValidationError } from '../core/errors.js';

/**
 * Task classes. `effort` maps to output_config.effort; `expectedOutput` feeds
 * the pre-call budget estimate.
 */
export const TASK_CLASSES = Object.freeze({
  // Cheap, high-volume, mechanical.
  classify:    { label: 'Classification', effort: 'low', expectedOutput: 300, structured: true },
  extract:     { label: 'Extraction', effort: 'low', expectedOutput: 1200, structured: true },
  dedupe:      { label: 'Deduplication', effort: 'low', expectedOutput: 400, structured: true },
  score:       { label: 'Scoring', effort: 'low', expectedOutput: 600, structured: true },

  // Working tier: most agent output.
  draft:       { label: 'Draft copy', effort: 'medium', expectedOutput: 2500, structured: false },
  rewrite:     { label: 'Rewrite', effort: 'medium', expectedOutput: 2000, structured: false },
  brief:       { label: 'Content brief', effort: 'medium', expectedOutput: 1800, structured: true },
  longform:    { label: 'Long-form article', effort: 'high', expectedOutput: 6000, structured: false },

  // Judgement: guardrails, evidence checking, reconciliation.
  critique:    { label: 'Critique / QA', effort: 'high', expectedOutput: 1500, structured: true },
  verify:      { label: 'Claim verification', effort: 'high', expectedOutput: 1200, structured: true },
  reconcile:   { label: 'Attribution reconciliation', effort: 'high', expectedOutput: 2000, structured: true },

  // Hardest reasoning: strategy, synthesis across a whole account.
  strategy:    { label: 'Strategy synthesis', effort: 'xhigh', expectedOutput: 5000, structured: false },
  synthesize:  { label: 'Cross-account synthesis', effort: 'xhigh', expectedOutput: 4000, structured: false },
});

/**
 * Profiles. `quality` is the default and runs the premium tier everywhere -
 * downgrading for cost is the operator's decision, never the system's.
 * Each entry is an ordered fallback chain; the first available model wins.
 */
export const PROFILES = Object.freeze({
  quality: {
    label: 'Quality',
    note: 'Premium tier for every task. The default.',
    chains: {
      frontier: ['claude-fable-5', 'claude-opus-5'],
      premium: ['claude-opus-5', 'claude-opus-4-8', 'claude-sonnet-5'],
      standard: ['claude-opus-5', 'claude-sonnet-5'],
      economy: ['claude-opus-5', 'claude-sonnet-5'],
    },
    byClass: {},
  },
  balanced: {
    label: 'Balanced',
    note: 'Premium for judgement and strategy, standard tier for volume drafting, economy for mechanical passes.',
    chains: {
      frontier: ['claude-opus-5', 'claude-sonnet-5'],
      premium: ['claude-opus-5', 'claude-sonnet-5'],
      standard: ['claude-sonnet-5', 'claude-sonnet-4-6', 'claude-haiku-4-5'],
      economy: ['claude-haiku-4-5', 'claude-sonnet-5'],
    },
    byClass: {
      classify: 'economy', extract: 'economy', dedupe: 'economy', score: 'economy',
      draft: 'standard', rewrite: 'standard', brief: 'standard', longform: 'standard',
      critique: 'premium', verify: 'premium', reconcile: 'premium',
      strategy: 'premium', synthesize: 'premium',
    },
  },
  economy: {
    label: 'Economy',
    note: 'Cheapest viable model per task. Judgement steps stay on the standard tier - never cheaper, because a guardrail that misses is worse than no guardrail.',
    chains: {
      frontier: ['claude-sonnet-5'],
      premium: ['claude-sonnet-5', 'claude-haiku-4-5'],
      standard: ['claude-haiku-4-5', 'claude-sonnet-5'],
      economy: ['claude-haiku-4-5'],
    },
    byClass: {
      classify: 'economy', extract: 'economy', dedupe: 'economy', score: 'economy',
      draft: 'standard', rewrite: 'standard', brief: 'standard', longform: 'standard',
      critique: 'premium', verify: 'premium', reconcile: 'premium',
      strategy: 'premium', synthesize: 'premium',
    },
  },
});

export const DEFAULT_PROFILE = 'quality';

/**
 * Task classes whose model must never be downshifted by a budget squeeze.
 * A cheaper drafter produces worse copy, which a human catches. A cheaper
 * claim-verifier produces false confidence, which nobody catches.
 */
const NEVER_DOWNSHIFT = new Set(['verify', 'critique', 'reconcile']);

export function createRouter({
  profile = DEFAULT_PROFILE,
  available = null,           // Set of usable model ids; null = all known
  breakers = null,            // breakerRegistry, to skip models whose provider is down
  overrides = {},             // per-task-class hard pin: { longform: 'claude-opus-5' }
} = {}) {
  const spec = PROFILES[profile];
  if (!spec) throw new ValidationError(`unknown routing profile: ${profile}`, { profile, known: Object.keys(PROFILES) });

  function usable(modelId) {
    if (!MODELS[modelId]) return false;
    if (available && !available.has(modelId)) return false;
    if (breakers) {
      const b = breakers.for(`model:${modelId}`);
      if (b && !b.allows()) return false;
    }
    return true;
  }

  /**
   * Choose a model.
   *
   * @param {string} taskClass  key of TASK_CLASSES
   * @param {object} opts
   * @param {boolean} opts.downshift  budget governor asked for a cheaper tier
   * @param {string}  opts.pin        caller-forced model id
   */
  function route(taskClass, { downshift = false, pin = null } = {}) {
    const task = TASK_CLASSES[taskClass];
    if (!task) throw new ValidationError(`unknown task class: ${taskClass}`, { taskClass, known: Object.keys(TASK_CLASSES) });

    const notes = [];
    const hardPin = pin || overrides[taskClass] || null;
    if (hardPin) {
      if (!MODELS[hardPin]) throw new ValidationError(`pinned model is unknown: ${hardPin}`);
      return decision(hardPin, taskClass, task, [`pinned to ${hardPin}`], profile, false);
    }

    let tier = spec.byClass[taskClass] || defaultTierFor(taskClass);
    notes.push(`profile ${profile} maps ${taskClass} -> ${tier} tier`);

    let didDownshift = false;
    if (downshift && !NEVER_DOWNSHIFT.has(taskClass)) {
      const cheaper = downshiftTier(tier);
      if (cheaper !== tier) {
        notes.push(`budget threshold crossed: downshifted ${tier} -> ${cheaper}`);
        tier = cheaper;
        didDownshift = true;
      }
    } else if (downshift) {
      notes.push(`budget threshold crossed but ${taskClass} is protected from downshift`);
    }

    const chain = spec.chains[tier] || spec.chains.standard;
    const picked = chain.find(usable);
    if (!picked) {
      // Last resort: anything usable at all, cheapest first.
      const anyModel = Object.values(MODELS)
        .sort((a, b) => a.outUsd - b.outUsd)
        .map((m) => m.id)
        .find(usable);
      if (!anyModel) {
        throw new ValidationError('no model is currently available', { taskClass, tier, chain });
      }
      notes.push(`chain [${chain.join(', ')}] unavailable; fell back to ${anyModel}`);
      return decision(anyModel, taskClass, task, notes, profile, didDownshift);
    }
    if (picked !== chain[0]) notes.push(`preferred ${chain[0]} unavailable; using ${picked}`);
    return decision(picked, taskClass, task, notes, profile, didDownshift);
  }

  return {
    profile,
    route,
    /** Every task class and what it would resolve to right now. For the UI. */
    table({ downshift = false } = {}) {
      return Object.keys(TASK_CLASSES).map((k) => {
        try {
          const d = route(k, { downshift });
          return { taskClass: k, label: TASK_CLASSES[k].label, model: d.model, tier: d.tier, effort: d.effort };
        } catch (err) {
          return { taskClass: k, label: TASK_CLASSES[k].label, model: null, error: err.message };
        }
      });
    },
  };
}

function decision(model, taskClass, task, notes, profile, downshifted) {
  const ms = modelSpec(model);
  return {
    model,
    tier: ms?.tier || 'unknown',
    taskClass,
    effort: task.effort,
    expectedOutput: task.expectedOutput,
    structured: task.structured,
    profile,
    downshifted,
    rationale: notes.join('; '),
  };
}

function defaultTierFor(taskClass) {
  const t = TASK_CLASSES[taskClass];
  if (!t) return 'standard';
  if (['strategy', 'synthesize'].includes(taskClass)) return 'premium';
  if (['classify', 'extract', 'dedupe', 'score'].includes(taskClass)) return 'economy';
  if (['critique', 'verify', 'reconcile'].includes(taskClass)) return 'premium';
  return 'standard';
}

function downshiftTier(tier) {
  return { frontier: 'premium', premium: 'standard', standard: 'economy', economy: 'economy' }[tier] || 'economy';
}

export { DEFAULT_MODEL };
