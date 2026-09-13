/**
 * Retry with exponential backoff and full jitter.
 *
 * Full jitter (random between 0 and the computed ceiling) rather than fixed
 * backoff, because when a connector rate-limits us the whole fleet of agent
 * runs gets throttled at the same instant - fixed backoff would send them all
 * back at the same instant too, and the second wave fails identically.
 */

import { isRetryable, RateLimitError } from '../core/errors.js';
import { seededRandom } from '../core/hash.js';

export const DEFAULT_POLICY = Object.freeze({
  attempts: 4,
  baseMs: 500,
  maxMs: 30_000,
  factor: 2,
});

export function backoffMs(attempt, policy = DEFAULT_POLICY, rng = Math.random) {
  const ceiling = Math.min(policy.maxMs, policy.baseMs * policy.factor ** (attempt - 1));
  return Math.round(rng() * ceiling);
}

/**
 * Run `fn` with retries.
 *
 * `sleep` is injectable so tests run instantly and so a replay can skip
 * sleeping altogether. `onRetry` receives every backoff decision - the engine
 * writes those into the run journal so a slow run is explainable after the
 * fact instead of just looking slow.
 */
export async function withRetry(fn, {
  policy = DEFAULT_POLICY,
  sleep = (ms) => new Promise((r) => setTimeout(r, ms)),
  onRetry = null,
  seed = null,
  label = 'op',
} = {}) {
  const rng = seed == null ? Math.random : seededRandom(seed);
  let lastError;
  for (let attempt = 1; attempt <= policy.attempts; attempt += 1) {
    try {
      return await fn(attempt);
    } catch (err) {
      lastError = err;
      const canRetry = isRetryable(err) && attempt < policy.attempts;
      if (!canRetry) throw err;
      // Honour an explicit Retry-After over our own guess.
      const explicit = err instanceof RateLimitError && err.retryAfterMs ? err.retryAfterMs : null;
      const waitMs = explicit ?? backoffMs(attempt, policy, rng);
      if (onRetry) await onRetry({ label, attempt, waitMs, error: err, explicit: Boolean(explicit) });
      await sleep(waitMs);
    }
  }
  throw lastError;
}
