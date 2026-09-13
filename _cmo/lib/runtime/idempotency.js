/**
 * Idempotency for side effects.
 *
 * The rule this enforces: a retry must never publish the same post twice.
 * Any step that touches the outside world - publishing to WordPress, posting
 * to a social account, sending an email, mutating an ad campaign - claims an
 * idempotency key first. The claim is written to the run journal, so it
 * survives a process crash and a replay.
 *
 * Keys are derived from the semantic identity of the effect (workspace +
 * channel + target + content hash), never from a timestamp or a random value,
 * so the same intent produces the same key on every attempt.
 */

import { digest } from '../core/hash.js';

export function effectKey({ workspaceId, channel, target = '', content = '', extra = null }) {
  if (!workspaceId) throw new Error('effectKey requires workspaceId');
  if (!channel) throw new Error('effectKey requires channel');
  return `${workspaceId}:${channel}:${digest({ target, content, extra }, 16)}`;
}

export function createIdempotencyStore({ store, wsId, clock }) {
  const ws = store.ws(wsId);
  const COLL = 'connectors';           // reuse the connectors collection
  const docId = (key) => `effect-${digest(key, 20)}`;

  return {
    /**
     * Claim a key. Returns:
     *   { claimed: true }                       first time
     *   { claimed: false, prior }               already done - caller must skip
     */
    async claim(key, meta = {}) {
      const id = docId(key);
      const prior = await ws.get(COLL, id);
      if (prior && prior.state === 'done') return { claimed: false, prior };
      if (prior && prior.state === 'inflight') {
        // A crashed attempt left this in flight. Allow one takeover, but say so.
        return { claimed: true, takeover: true, prior };
      }
      await ws.put(COLL, id, { kind: 'effect', key, state: 'inflight', claimedAt: clock.iso(), ...meta });
      return { claimed: true, takeover: false };
    },

    async complete(key, result = {}) {
      const id = docId(key);
      const prior = (await ws.get(COLL, id)) || { kind: 'effect', key };
      return ws.put(COLL, id, { ...prior, state: 'done', completedAt: clock.iso(), result });
    },

    async fail(key, error) {
      const id = docId(key);
      const prior = (await ws.get(COLL, id)) || { kind: 'effect', key };
      return ws.put(COLL, id, { ...prior, state: 'failed', failedAt: clock.iso(), error });
    },

    async lookup(key) {
      return ws.get(COLL, docId(key));
    },

    /**
     * Run `fn` at most once for `key`. This is the wrapper every publisher uses.
     */
    async once(key, fn, meta = {}) {
      const claim = await this.claim(key, meta);
      if (!claim.claimed) {
        return { skipped: true, reason: 'already performed', result: claim.prior.result ?? null, key };
      }
      try {
        const result = await fn({ takeover: Boolean(claim.takeover) });
        await this.complete(key, result);
        return { skipped: false, result, key, takeover: Boolean(claim.takeover) };
      } catch (err) {
        await this.fail(key, { code: err.code || 'UNKNOWN', message: String(err.message || err) });
        throw err;
      }
    },
  };
}
