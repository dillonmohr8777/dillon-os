'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { migrate, createStore, PgStore } = require('../lib/store.ts');
const { PREFIX } = require('../lib/crypto.ts');
const { loadMigrationSchema } = require('../lib/schema.ts');
const { processJobs } = require('../lib/jobs.ts');
const { submitIntake, processIntakeAuditJob } = require('../lib/pipeline.ts');
const { createAdapters } = require('../lib/adapters.ts');
const { loadConfig } = require('../lib/config.ts');

it('rolls back an incomplete intake and repairs a missing audit job on retry', async () => {
  const saved = Object.fromEntries(['intake_submissions', 'jobs', 'events'].map((name) => [name, new Map()]));
  let staged = [];
  let failEvent = true;
  let rollbacks = 0;
  let locks = 0;
  const client = {
    async query(sql, args = []) {
      if (sql === 'BEGIN') { staged = []; return { rows: [] }; }
      if (sql === 'COMMIT') {
        for (const [table, row] of staged) saved[table].set(row.id, row);
        staged = [];
        return { rows: [] };
      }
      if (sql === 'ROLLBACK') { staged = []; rollbacks += 1; return { rows: [] }; }
      if (sql.includes('pg_advisory_xact_lock')) { locks += 1; return { rows: [] }; }
      if (sql.startsWith('SELECT * FROM intake_submissions')) {
        return { rows: [...saved.intake_submissions.values()].filter((row) => args[0].includes(row.website)) };
      }
      if (sql.startsWith('SELECT * FROM jobs')) {
        return { rows: [...saved.jobs.values()].filter((row) => row.idempotency_key === args[0]) };
      }
      throw new Error(`unexpected SQL: ${sql}`);
    },
    release() {},
  };
  const store = new PgStore({ connect: async () => client });
  store.bumpRateLimit = async () => ({ allowed: true });
  store.upsertRow = async (table, row, executor) => {
    assert.equal(executor, client);
    if (table === 'events' && failEvent) throw new Error('synthetic event write failure');
    staged.push([table, row]);
  };
  const cfg = { ...loadConfig({ databaseUrl: '' }), captcha: 'off' };
  const body = {
    name: 'Jordan Hale', phone: '5550100199', email: 'jordan@example.org',
    website: 'https://www.example.org', business_description: 'Local roofing company',
    goals: 'More qualified leads', consent_analyze: true,
  };
  const accept = (campaignId = 'campaign-test') => submitIntake(store, createAdapters(cfg), cfg, { id: campaignId }, body);

  await assert.rejects(accept(), /synthetic event write failure/);
  assert.equal(rollbacks, 1);
  for (const table of Object.keys(saved)) {
    assert.equal(saved[table].size, 0, `${table} persisted after rollback`);
    assert.equal(store.all(table).length, 0, `${table} leaked into cache`);
  }

  failEvent = false;
  const accepted = await accept();
  assert.equal(accepted.ok, true);
  assert.equal(accepted.duplicate, false);
  assert.equal(saved.intake_submissions.size, 1);
  assert.equal(saved.jobs.size, 1);
  assert.equal(saved.events.size, 1);
  assert.equal([...saved.jobs.values()][0].payload.submission_id, accepted.submission.id);
  assert.equal([...saved.events.values()][0].correlation_id, accepted.submission.id);
  assert.equal(store.all('jobs').length, 1);

  saved.jobs.clear();
  store.memory.tables.jobs.clear();
  const retried = await accept('campaign-second');
  assert.equal(retried.ok, true);
  assert.equal(retried.duplicate, true);
  assert.equal(retried.submission.duplicate_of, accepted.submission.id);
  assert.equal(saved.jobs.size, 1);
  assert.equal([...saved.jobs.values()][0].payload.submission_id, accepted.submission.id);
  assert.equal(saved.events.size, 2);
  assert.equal([...saved.jobs.values()][0].payload.campaign_id, 'campaign-test');
  assert.equal(locks, 3);
});

it('reads claimed intake data and campaign from shared PostgreSQL storage', async () => {
  const previousKey = process.env.RADAR_V2_FIELD_KEY;
  process.env.RADAR_V2_FIELD_KEY = 'cd'.repeat(32);
  const tables = new Map();
  const schema = loadMigrationSchema();
  const pool = {
    async query(sql, values = []) {
      const insert = sql.match(/^INSERT INTO (\w+) \(([^)]+)\) VALUES/);
      if (insert) {
        const [, table, columns] = insert;
        const row = Object.fromEntries(columns.split(', ').map((column, index) => [column.replaceAll('"', ''), values[index]]));
        for (const column of schema[table].jsonb) {
          if (typeof row[column] === 'string') row[column] = JSON.parse(row[column]);
        }
        if (!tables.has(table)) tables.set(table, new Map());
        tables.get(table).set(row.id, row);
        return { rows: [] };
      }
      const select = sql.match(/^SELECT \* FROM (\w+) WHERE id = \$1$/);
      if (select) return { rows: [tables.get(select[1])?.get(values[0])].filter(Boolean) };
      throw new Error(`unexpected SQL: ${sql}`);
    },
  };

  try {
    const writer = new PgStore(pool, schema);
    const campaign = writer.insert('campaigns', {
      id: 'campaign-shared', name: 'Shared campaign', allowed_offers: ['rebuild'],
    });
    const submission = writer.insert('intake_submissions', {
      id: 'intake-shared', campaign_id: campaign.id, requester_email: 'private@example.org',
      business_description: 'Private business details', website: 'https://example.org',
    });
    await writer.flush();
    assert.ok(tables.get('intake_submissions').get(submission.id).requester_email.startsWith(PREFIX));

    const worker = new PgStore(pool, schema);
    assert.equal(worker.get('intake_submissions', submission.id), null);
    const freshSubmission = await worker.readThrough('intake_submissions', submission.id);
    const freshCampaign = await worker.readThrough('campaigns', submission.campaign_id);
    assert.equal(freshSubmission.requester_email, 'private@example.org');
    assert.equal(freshSubmission.business_description, 'Private business details');
    assert.deepEqual(freshCampaign.allowed_offers, ['rebuild']);
    await assert.rejects(
      processIntakeAuditJob(worker, {}, { submission_id: 'missing', campaign_id: 'missing' }),
      /intake submission was not found/
    );
  } finally {
    if (previousKey == null) delete process.env.RADAR_V2_FIELD_KEY;
    else process.env.RADAR_V2_FIELD_KEY = previousKey;
  }
});

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
