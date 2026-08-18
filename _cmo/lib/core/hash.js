/**
 * Stable hashing and canonical JSON.
 *
 * Prompt hashes, idempotency keys, cache keys, and evidence digests all
 * depend on two objects with the same content hashing the same, whatever
 * order their keys were built in.
 */

import { createHash } from 'node:crypto';

/** Deterministic JSON: object keys sorted, undefined dropped, no whitespace. */
export function canonicalJson(value) {
  return JSON.stringify(canonicalize(value));
}

function canonicalize(value) {
  if (value === null || typeof value !== 'object') {
    return typeof value === 'number' && !Number.isFinite(value) ? String(value) : value;
  }
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value instanceof Date) return value.toISOString();
  const out = {};
  for (const key of Object.keys(value).sort()) {
    if (value[key] === undefined) continue;
    out[key] = canonicalize(value[key]);
  }
  return out;
}

export function sha256(input) {
  const text = typeof input === 'string' ? input : canonicalJson(input);
  return createHash('sha256').update(text, 'utf8').digest('hex');
}

/** Short, human-quotable digest. Used in journals and UI ("prompt f3a91c2b"). */
export function digest(input, length = 12) {
  return sha256(input).slice(0, length);
}

/**
 * Deterministic pseudo-random generator (mulberry32) seeded from any value.
 * Anywhere the runtime needs a random-looking choice it uses this, seeded
 * from the run id, so the same run replays identically.
 */
export function seededRandom(seed) {
  let a = typeof seed === 'number' ? seed >>> 0 : parseInt(sha256(seed).slice(0, 8), 16) >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
