/**
 * Identifiers.
 *
 * Ids are lexicographically sortable (time prefix in base36) and carry a
 * type prefix so a bare id in a log line is self-describing:
 *   run_m4x1p0q2_7f3a   artifact_m4x1p0q2_be21
 */

import { randomBytes } from 'node:crypto';
import { seededRandom } from './hash.js';

const PREFIXES = new Set([
  'ws', 'run', 'job', 'art', 'apr', 'ev', 'promptset', 'scan', 'exp',
  'led', 'note', 'conn', 'sched', 'rep', 'brief', 'act',
]);

export function newId(prefix, { clock, rng } = {}) {
  if (!PREFIXES.has(prefix)) throw new Error(`unknown id prefix: ${prefix}`);
  const ms = clock ? clock.now() : Date.now();
  const time = ms.toString(36).padStart(9, '0');
  const rand = rng
    ? Math.floor(rng() * 0xffff).toString(16).padStart(4, '0')
    : randomBytes(2).toString('hex');
  return `${prefix}_${time}_${rand}`;
}

/** Deterministic id factory - same seed and sequence produces same ids. */
export function idFactory(seed, clock) {
  const rng = seededRandom(seed);
  return (prefix) => newId(prefix, { clock, rng });
}

const SLUG_MAX = 64;

export function slug(text, fallback = 'item') {
  const out = String(text ?? '')
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, SLUG_MAX)
    .replace(/-+$/g, '');
  return out || fallback;
}

export function idPrefix(id) {
  const i = String(id ?? '').indexOf('_');
  return i === -1 ? null : String(id).slice(0, i);
}
