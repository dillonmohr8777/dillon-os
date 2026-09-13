/**
 * Per-connector circuit breaker.
 *
 * Without this, one expired Google Ads refresh token turns every scheduled
 * run for every client into a slow failure, and the daily feed arrives empty
 * with no explanation. With it, the connector trips once, every dependent
 * step is skipped fast with a named reason, and the workspace still gets a
 * feed built from the connectors that do work.
 *
 * States: closed (normal) -> open (failing, skip fast) -> half_open (one
 * probe allowed) -> closed on success, back to open on failure.
 */

import { CircuitOpenError } from '../core/errors.js';

export const CLOSED = 'closed';
export const OPEN = 'open';
export const HALF_OPEN = 'half_open';

export function createBreaker({
  name = 'connector',
  threshold = 3,          // consecutive failures before opening
  cooldownMs = 120_000,   // how long to stay open before probing
  clock = { now: () => Date.now() },
  onTransition = null,
} = {}) {
  let state = CLOSED;
  let failures = 0;
  let openedAt = null;
  let lastError = null;
  let successes = 0;
  let trips = 0;

  function transition(next, reason) {
    if (state === next) return;
    const prev = state;
    state = next;
    if (onTransition) onTransition({ name, from: prev, to: next, reason, at: clock.now() });
  }

  function snapshot() {
    return {
      name,
      state,
      failures,
      successes,
      trips,
      openedAt,
      lastError: lastError ? { code: lastError.code, message: lastError.message } : null,
      retryAt: state === OPEN && openedAt != null ? openedAt + cooldownMs : null,
    };
  }

  /** Move open -> half_open once the cooldown has elapsed. */
  function refresh() {
    if (state === OPEN && openedAt != null && clock.now() - openedAt >= cooldownMs) {
      transition(HALF_OPEN, 'cooldown elapsed');
    }
    return state;
  }

  return {
    get name() { return name; },
    get state() { return refresh(); },
    snapshot,

    /** True when a call is allowed right now. */
    allows() {
      return refresh() !== OPEN;
    },

    recordSuccess() {
      successes += 1;
      failures = 0;
      lastError = null;
      if (state !== CLOSED) transition(CLOSED, 'probe succeeded');
    },

    recordFailure(err) {
      lastError = err || null;
      failures += 1;
      if (state === HALF_OPEN) {
        openedAt = clock.now();
        trips += 1;
        transition(OPEN, 'probe failed');
        return;
      }
      if (failures >= threshold) {
        openedAt = clock.now();
        trips += 1;
        transition(OPEN, `${failures} consecutive failures`);
      }
    },

    /** Wrap a call. Throws CircuitOpenError instead of calling when open. */
    async run(fn) {
      if (!this.allows()) {
        const s = snapshot();
        throw new CircuitOpenError(`${name} circuit is open`, { retryAt: s.retryAt, lastError: s.lastError });
      }
      try {
        const out = await fn();
        this.recordSuccess();
        return out;
      } catch (err) {
        this.recordFailure(err);
        throw err;
      }
    },

    reset() {
      state = CLOSED; failures = 0; openedAt = null; lastError = null;
    },
  };
}

/** A registry so every connector in a process shares one breaker each. */
export function breakerRegistry(defaults = {}) {
  const breakers = new Map();
  return {
    for(name, options = {}) {
      if (!breakers.has(name)) breakers.set(name, createBreaker({ name, ...defaults, ...options }));
      return breakers.get(name);
    },
    snapshot() {
      return [...breakers.values()].map((b) => b.snapshot());
    },
    resetAll() {
      for (const b of breakers.values()) b.reset();
    },
  };
}
