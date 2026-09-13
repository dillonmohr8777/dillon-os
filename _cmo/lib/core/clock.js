/**
 * Injectable clock.
 *
 * Every timestamp in CMO OS comes from a clock instance, never from
 * `Date.now()` directly. That is what makes runs replayable: a journal
 * replay installs a frozen clock and the run produces byte-identical
 * output.
 */

export function systemClock() {
  return {
    kind: 'system',
    now: () => Date.now(),
    iso: () => new Date().toISOString(),
    date: () => new Date().toISOString().slice(0, 10),
  };
}

/**
 * A clock frozen at `startMs` that only advances when you tell it to.
 * Used by tests and by journal replay.
 */
export function frozenClock(startMs = Date.parse('2026-01-01T00:00:00.000Z')) {
  let t = startMs;
  return {
    kind: 'frozen',
    now: () => t,
    iso: () => new Date(t).toISOString(),
    date: () => new Date(t).toISOString().slice(0, 10),
    advance: (ms) => {
      t += ms;
      return t;
    },
    set: (ms) => {
      t = ms;
      return t;
    },
  };
}

export function parseIso(value, fallback = null) {
  if (!value) return fallback;
  const ms = Date.parse(value);
  return Number.isFinite(ms) ? ms : fallback;
}

export const DAY_MS = 86_400_000;
export const HOUR_MS = 3_600_000;

/** Whole days between two ISO timestamps (b - a). Negative when b precedes a. */
export function daysBetween(aIso, bIso) {
  const a = parseIso(aIso);
  const b = parseIso(bIso);
  if (a === null || b === null) return null;
  return Math.round((b - a) / DAY_MS);
}

export function addDays(iso, days) {
  const ms = parseIso(iso);
  if (ms === null) return null;
  return new Date(ms + days * DAY_MS).toISOString();
}
