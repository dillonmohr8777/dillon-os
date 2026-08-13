'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { migrate, createStore } = require('../lib/store.ts');
const { processJobs } = require('../lib/jobs.ts');

describe('postgres repositories', () => {
  it('applies migrations, hydrates, writes JSONB, and claims jobs with SKIP LOCKED', async (t) => {
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
    const stamp = Date.now();
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

      await store.close();
      const reloaded = await createStore({ databaseUrl: url });
      assert.equal(reloaded.kind, 'postgres');
      const hydrated = reloaded.get('campaigns', campaign.id);
      assert.ok(hydrated);
      assert.equal(hydrated.name, 'PG test');
      assert.equal(hydrated.geography.market, 'TEST');

      await reloaded.enqueueJob({ type: 'scan', idempotencyKey: `pg-scan:${stamp}`, payload: { n: 1 } });
      await reloaded.flush();
      let ran = 0;
      await processJobs(reloaded, {
        scan: async () => { ran += 1; },
      }, { workerId: 'pg-worker', max: 2 });
      assert.equal(ran, 1);
      const { rows: jobs } = await reloaded.query('SELECT status, locked_by FROM jobs WHERE idempotency_key = $1', [`pg-scan:${stamp}`]);
      assert.equal(jobs[0].status, 'succeeded');
      await reloaded.close();

      const prevKey = process.env.RADAR_V2_FIELD_KEY;
      process.env.RADAR_V2_FIELD_KEY = 'ab'.repeat(32);
      try {
        const locked = await createStore({ databaseUrl: url });
        const prospect = locked.insert('prospects', {
          business_name: 'Encrypt HVAC',
          lifecycle: 'discovered',
          domain: `encrypt-${Date.now()}.example`,
        });
        const contact = locked.insert('contacts', {
          prospect_id: prospect.id,
          value: 'jordan.hale@cedarridgehvac.example',
          type: 'email',
          person_name: 'Jordan Hale',
          person_title: 'Owner',
          source: 'own-site',
        });
        await locked.flush();
        const { rows: raw } = await locked.query('SELECT value FROM contacts WHERE id = $1', [contact.id]);
        assert.match(String(raw[0].value), /^enc:v1:/);
        await locked.close();
        const decrypted = await createStore({ databaseUrl: url });
        assert.equal(decrypted.get('contacts', contact.id).value, 'jordan.hale@cedarridgehvac.example');
        await decrypted.close();
      } finally {
        if (prevKey == null) delete process.env.RADAR_V2_FIELD_KEY;
        else process.env.RADAR_V2_FIELD_KEY = prevKey;
      }
    } catch (err) {
      await store.close().catch(() => {});
      throw err;
    }
  });
});
