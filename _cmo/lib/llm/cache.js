/**
 * Content-addressed response cache.
 *
 * Distinct from provider-side prompt caching, and complementary to it: prompt
 * caching makes a repeated PREFIX cheap, this makes a repeated WHOLE CALL free.
 *
 * The rule that keeps it honest: the cache key includes the model id. A cached
 * Sonnet answer must never be served as an Opus answer, because the whole
 * point of the routing table is that the operator knows which model produced
 * which artifact.
 *
 * There is one thing this cache must never do, and it is enforced by the
 * `nocache` flag the GEO scanner sets: caching a measurement replicate would
 * fabricate precision. Replicates exist to sample real variance; serving the
 * same stored answer five times turns a wide confidence interval into a
 * fake-narrow one.
 */

import { digest, canonicalJson } from '../core/hash.js';

export function cacheKey({ model, system, messages, schema, effort }) {
  return digest(canonicalJson({
    model,
    system: system || '',
    messages: messages || [],
    schema: schema ? { name: schema.name, shape: schema.input_schema } : null,
    effort: effort || null,
  }), 32);
}

export function createCache({ store = null, wsId = null, max = 500, ttlMs = 24 * 3600 * 1000, clock } = {}) {
  const mem = new Map(); // key -> { at, value }
  const stats = { hits: 0, misses: 0, writes: 0, skipped: 0 };

  function now() { return clock ? clock.now() : Date.now(); }

  function evict() {
    while (mem.size > max) {
      const oldest = mem.keys().next().value;
      mem.delete(oldest);
    }
  }

  return {
    stats: () => ({ ...stats, size: mem.size }),

    async get(key) {
      const hit = mem.get(key);
      if (!hit) { stats.misses += 1; return null; }
      if (now() - hit.at > ttlMs) { mem.delete(key); stats.misses += 1; return null; }
      // Refresh recency so hot entries survive eviction.
      mem.delete(key);
      mem.set(key, hit);
      stats.hits += 1;
      return hit.value;
    },

    async set(key, value, { nocache = false } = {}) {
      if (nocache) { stats.skipped += 1; return value; }
      mem.set(key, { at: now(), value });
      stats.writes += 1;
      evict();
      return value;
    },

    clear() { mem.clear(); },
  };
}
