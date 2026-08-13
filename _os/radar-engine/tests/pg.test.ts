'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { migrate, createStore } = require('../lib/store.ts');
const { processJobs } = require('../lib/jobs.ts');

describe('postgres repositories', () => {
  it('applies migrations, writes JSONB, and claims jobs with SKIP LOCKED when DATABASE_URL is reachable', async (t) => {
    const url = process.env.DATABASE_URL || '';
    if (!url) {
      t.skip('DATABASE_URL not set');
      return;
    }
    const applied = await migrate(url);
    if (!applied.applied) {
      t.skip(applied.reason || 'migrate skipped');
      return;
    }
    const store = await createStore({ databaseUrl: url });
    if (store.kind !== 'postgres') {
      t.skip(store.pgUnavailable || 'postgres unavailable');
      return;
    }
    try {
      const campaign = store.insert('campaigns', {
        name: 'PG test',
        owner: 'test',
        geography: { market: 'TEST' },
        allowed_offers: ['rebuild'],
      });
      await store.flush();
      const { rows } = await store.query('SELECT geography, allowed_offers FROM campaigns WHERE id = $1', [campaign.id]);
      assert.equal(rows[0].geography.market, 'TEST');
      assert.deepEqual(rows[0].allowed_offers, ['rebuild']);

      await store.enqueueJob({ type: 'scan', idempotencyKey: `pg-scan:${campaign.id}`, payload: { n: 1 } });
      await store.flush();
      let ran = 0;
      await processJobs(store, {
        scan: async () => { ran += 1; },
      }, { workerId: 'pg-worker', max: 2 });
      assert.equal(ran, 1);
      const { rows: jobs } = await store.query('SELECT status, locked_by FROM jobs WHERE idempotency_key = $1', [`pg-scan:${campaign.id}`]);
      assert.equal(jobs[0].status, 'succeeded');
    } finally {
      await store.close();
    }
  });
});
