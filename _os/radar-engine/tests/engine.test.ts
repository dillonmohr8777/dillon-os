'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { normalizeDomain, normalizePhone, normalizeEmail, normalizeName, normalizeAddress } = require('../lib/normalize.ts');
const { assertTransition, allowedFrom } = require('../lib/states.ts');
const { MemoryStore } = require('../lib/store.ts');
const { checkSuppression, addSuppression } = require('../lib/suppress.ts');
const { scoreAudit, countAeoGaps } = require('../lib/scoring.ts');
const { selectOffer } = require('../lib/routing.ts');
const { assertSafeScanUrl } = require('../lib/ssrf.ts');
const { validateNarrative } = require('../lib/claims.ts');
const { buildManifest } = require('../lib/manifest.ts');
const { checkReport, renderReportHtml, reportAccessible } = require('../lib/reports.ts');
const { processJobs, applyRetention } = require('../lib/jobs.ts');
const { encryptValue, decryptValue, encryptRow, decryptRow, PREFIX, keyFromHex } = require('../lib/crypto.ts');
const { hmac } = require('../lib/ids.ts');
const { bookingAdapter, captchaAdapter, placesAdapter } = require('../lib/adapters.ts');
const { listMigrationTables, migrate } = require('../lib/store.ts');
const { loadMigrationSchema, encodeRow, JOB_LEASE_MS, CLAIM_JOB_SQL } = require('../lib/schema.ts');
const { containsPii, sanitizeExport } = require('../lib/redact.ts');
const { validateIntake } = require('../lib/intake.ts');
const { runVerticalSlice, finishVerticalSlice, funnelView, createCampaign, submitIntake, resolveProspect, processIntakeAuditJob } = require('../lib/pipeline.ts');
const { funnelPage, createServer } = require('../lib/web.ts');
const { loadConfig } = require('../lib/config.ts');
const { storageAdapter } = require('../lib/reports.ts');
const { createAdapters } = require('../lib/adapters.ts');

describe('normalization', () => {
  it('normalizes domains, phones, names, and addresses', () => {
    assert.equal(normalizeDomain('HTTPS://WWW.CedarRidgeHVAC.example/path'), 'cedarridgehvac.example');
    assert.equal(normalizePhone('(555) 010-0199'), '+15550100199');
    assert.equal(normalizeEmail('Jordan.Hale@CedarRidgeHVAC.example'), 'jordan.hale@cedarridgehvac.example');
    assert.equal(normalizeName('Cedar Ridge Heating & Cooling, LLC'), 'cedar ridge heating cooling');
    assert.ok(normalizeAddress('123 Main Street, Suite 4').includes('st'));
  });
});

describe('state machine', () => {
  it('allows the happy path and rejects illegal jumps', () => {
    assert.equal(assertTransition('discovered', 'deduped'), 'deduped');
    assert.equal(assertTransition('qa_pending', 'report_approved'), 'report_approved');
    assert.equal(assertTransition('proposal', 'won'), 'won');
    assert.throws(() => assertTransition('discovered', 'won'));
    assert.throws(() => assertTransition('suppressed', 'outreach_ready'));
    assert.ok(allowedFrom('qa_pending').has('needs_review'));
  });

  it('emits an event on every transition', async () => {
    const store = new MemoryStore();
    const p = store.insert('prospects', { business_name: 'A', lifecycle: 'discovered', domain: 'a.example' });
    await store.transition(p.id, 'deduped', { actor: 'test', reason: 'ok', correlationId: 'c1' });
    const ev = store.all('events');
    assert.equal(ev.length, 1);
    assert.equal(ev[0].actor, 'test');
    assert.equal(ev[0].payload.from, 'discovered');
    assert.equal(ev[0].correlation_id, 'c1');
  });
});

describe('suppression', () => {
  it('hard-stops on suppressed domains and explains why', () => {
    const store = new MemoryStore();
    addSuppression(store, { kind: 'domain', value: 'optedout.example', reason: 'previous opt-out' });
    const hit = checkSuppression({
      store,
      prospect: { website: 'https://optedout.example', business_name: 'Opted Out HVAC' },
      campaign: { excluded_verticals: [], suppression_policy: {} },
    });
    assert.equal(hit.suppressed, true);
    assert.match(hit.reason, /opt-out|suppressed domain/i);
  });
});

describe('scoring and routing', () => {
  it('counts jsonld=0, faq=false, and author=false as AEO gaps', () => {
    assert.equal(countAeoGaps([{
      classification: 'aeo',
      metric: 'jsonld=0; faq=false; author=false; entity=true',
      excerpt: 'AEO readiness from on-page signals only. No AI-engine visibility was measured.',
    }]), 3);
    assert.equal(countAeoGaps([{
      classification: 'aeo',
      metric: 'jsonld=2; faq=true; author=true; entity=true',
      excerpt: 'AEO readiness from on-page signals only.',
    }]), 0);
  });

  it('keeps SQS distinct from opportunity and requires a hard fault for rebuild', () => {
    const weak = scoreAudit({
      prospect: { business_name: 'Weak HVAC', website: 'https://weak.example', vertical: 'hvac', review_count: 40, rating: 4.6, area: 'Philadelphia' },
      audit: { reachable: true, https: true, hasViewport: false, httpStatus: 200, url: 'https://weak.example', tier: 0, wordCount: 40, hasCta: false },
      evidenceItems: [
        { classification: 'reachability' }, { classification: 'technical' }, { classification: 'onpage' },
        { classification: 'indexability' }, { classification: 'content' }, { classification: 'conversion' },
        { classification: 'local' }, { classification: 'aeo' }, { classification: 'trust' }, { classification: 'imagery' },
      ],
    });
    assert.notEqual(weak.site_quality_score, weak.rebuild_opportunity);
    assert.ok(weak.hard_faults.includes('no responsive viewport'));
    assert.ok(weak.explanations.length >= 8);
    const aeoExpl = weak.explanations.find((e) => e.score === 'seo_aeo_opportunity');
    assert.ok(aeoExpl, 'seo_aeo explanation required');
    assert.match(aeoExpl.because, /AEO readiness gaps/);
    const route = selectOffer(weak, { allowedOffers: ['rebuild', 'seo_aeo', 'local', 'paid', 'conversion'] });
    assert.equal(route.offer, 'rebuild');

    const strong = scoreAudit({
      prospect: { business_name: 'Strong HVAC', website: 'https://strong.example', vertical: 'hvac', review_count: 80, ad_presence: false, area: 'Philadelphia' },
      audit: {
        reachable: true, https: true, hasViewport: true, httpStatus: 200, url: 'https://strong.example',
        tier: 1, fonts: [{ family: 'Inter', px: 16 }], wordCount: 800, hasCta: true, hasTitle: true,
        hasMetaDescription: true, usesModernLayout: true, usesMediaQueries: true,
      },
      evidenceItems: [
        { classification: 'reachability' }, { classification: 'technical' }, { classification: 'onpage' },
        { classification: 'indexability' }, { classification: 'content' }, { classification: 'conversion' },
        { classification: 'local' }, { classification: 'aeo' }, { classification: 'trust' }, { classification: 'imagery' },
      ],
    });
    const strongRoute = selectOffer(strong, { allowedOffers: ['rebuild', 'seo_aeo', 'paid', 'local'] });
    assert.notEqual(strongRoute.offer, 'rebuild');
    assert.ok(strongRoute.reasons.some((r) => /strong verified|rebuild withheld/i.test(r)));
  });

  it('routes low coverage to needs_review', () => {
    const thin = scoreAudit({
      prospect: { business_name: 'Thin', website: 'https://thin.example', vertical: 'hvac' },
      audit: { reachable: true, https: true, hasViewport: true, tier: 0 },
      evidenceItems: [{ classification: 'reachability' }],
    });
    const route = selectOffer(thin);
    assert.equal(route.route, 'needs_review');
  });
});

describe('SSRF', () => {
  it('blocks localhost, metadata, and private networks', () => {
    assert.throws(() => assertSafeScanUrl('http://127.0.0.1/'));
    assert.throws(() => assertSafeScanUrl('http://localhost/'));
    assert.throws(() => assertSafeScanUrl('http://169.254.169.254/latest'));
    assert.throws(() => assertSafeScanUrl('http://10.0.0.5/'));
    assert.throws(() => assertSafeScanUrl('http://192.168.1.8/'));
    assert.throws(() => assertSafeScanUrl('file:///etc/passwd'));
    assert.doesNotThrow(() => assertSafeScanUrl('https://www.cedarridgehvac.example/'));
  });
});

describe('manifest and claims', () => {
  it('rejects narrative facts that are not in the manifest', () => {
    const manifest = buildManifest({
      prospect: { business_name: 'Cedar Ridge Heating and Cooling', website: 'https://www.cedarridgehvac.example', city: 'Hatboro', state: 'PA', vertical: 'hvac' },
      snapshot: {
        score_version: 'radar-v2.0.0',
        site_quality_score: 26,
        opportunity_score: 70,
        rebuild_opportunity: 80,
        seo_aeo_opportunity: 60,
        local_opportunity: 50,
        paid_opportunity: 40,
        conversion_opportunity: 55,
        market_fit_score: 70,
        contactability_score: 60,
        audit_confidence: 80,
        priority_score: 72,
      },
      evidence: [{ id: 'evd_1', source: 'fixture', url: 'https://www.cedarridgehvac.example', metric: 'viewport=false', excerpt: 'no viewport', classification: 'technical', confidence: 0.9, captured_at: '2026-08-13T00:00:00Z' }],
      offer: 'rebuild',
      auditId: 'aud_1',
      observedAt: '2026-08-13T00:00:00Z',
      config: { brandName: 'NeedMomentum', contactUrl: 'https://needmomentum.com', contactEmail: 'hello@needmomentum.com', bookingUrl: 'https://needmomentum.com/book' },
    });
    const bad = validateNarrative(manifest, 'They spend $12,000 a month on Google Ads and rank #1 vs Rival HVAC.');
    assert.equal(bad.ok, false);
    const good = validateNarrative(manifest, 'Homepage HTML does not include a viewport meta tag.');
    assert.equal(good.ok, true);
  });
});

describe('privacy', () => {
  it('round-trips AES-256-GCM field encryption and rejects a short key', () => {
    const key = keyFromHex('a'.repeat(64));
    const cipher = encryptValue('jordan.hale@cedarridgehvac.example', key);
    assert.ok(String(cipher).startsWith(PREFIX));
    assert.equal(decryptValue(cipher, key), 'jordan.hale@cedarridgehvac.example');
    assert.equal(decryptValue('plain', key), 'plain');
    assert.equal(encryptValue(cipher, key), cipher);
    const protectedRow = encryptRow('intake_submissions', {
      business_description: 'Local roofing company', growth_goals: 'More booked estimates',
    }, key);
    assert.ok(String(protectedRow.business_description).startsWith(PREFIX));
    assert.equal(decryptRow('intake_submissions', protectedRow, key).business_description, 'Local roofing company');
    assert.ok(String(protectedRow.growth_goals).startsWith(PREFIX));
    assert.equal(decryptRow('intake_submissions', protectedRow, key).growth_goals, 'More booked estimates');
    const exported = sanitizeExport({ business_description: 'Local roofing company', growth_goals: 'More booked estimates' });
    assert.equal(exported.business_description, undefined);
    assert.equal(exported.growth_goals, undefined);
    assert.throws(() => keyFromHex('short'));
  });

  it('retention revokes expired reports and anonymizes aged PII', async () => {
    const store = new MemoryStore();
    const now = new Date('2026-08-13T00:00:00Z');
    store.insert('reports', {
      id: 'report-old',
      expires_at: '2026-01-01T00:00:00Z',
      created_at: '2025-01-01T00:00:00Z',
    });
    store.insert('intake_submissions', {
      id: 'intake-old',
      requester_name: 'Jordan Hale',
      requester_email: 'jordan.hale@cedarridgehvac.example',
      requester_phone: '555-010-0199',
      business_description: 'Local roofing company',
      growth_goals: 'More booked estimates',
      notes: 'call back',
      created_at: '2025-01-01T00:00:00Z',
    });
    store.insert('contacts', {
      id: 'contact-old',
      value: 'jordan.hale@cedarridgehvac.example',
      person_name: 'Jordan Hale',
      person_title: 'Owner',
      created_at: '2025-01-01T00:00:00Z',
    });
    const result = await applyRetention(store, { retentionDays: 365 }, now);
    assert.ok(result.revoked.includes('report-old'));
    assert.ok(store.get('reports', 'report-old').revoked_at);
    assert.equal(reportAccessible(store.get('reports', 'report-old'), now), false);
    assert.equal(store.get('intake_submissions', 'intake-old').requester_email, '[deleted]');
    assert.equal(store.get('intake_submissions', 'intake-old').business_description, '');
    assert.equal(store.get('intake_submissions', 'intake-old').growth_goals, '');
    assert.equal(store.get('contacts', 'contact-old').value, '[deleted]');
    assert.equal(store.get('contacts', 'contact-old').person_name, null);
  });
});

describe('jobs', () => {
  it('is idempotent, retries with backoff, and dead-letters', async () => {
    const store = new MemoryStore();
    process.env.RADAR_V2_JOB_BACKOFF_MS = '0';
    const a = await store.enqueueJob({ type: 'scan', idempotencyKey: 'scan:1', payload: { n: 1 } });
    const b = await store.enqueueJob({ type: 'scan', idempotencyKey: 'scan:1', payload: { n: 1 } });
    assert.equal(a.duplicate, false);
    assert.equal(b.duplicate, true);
    let attempts = 0;
    await processJobs(store, {
      scan: async () => {
        attempts += 1;
        throw new Error('boom');
      },
    }, { max: 8 });
    const job = store.get('jobs', a.job.id);
    assert.equal(job.dead_letter, true);
    assert.ok(attempts >= 6);
  });

  it('reclaims an expired intake lease after restart but leaves external jobs untouched', async () => {
    const store = new MemoryStore();
    const intake = await store.enqueueJob({ type: 'intake.audit', idempotencyKey: 'intake-lease:1' });
    const firstClaim = await store.claimJob('worker-before-crash');
    assert.equal(firstClaim.id, intake.job.id);
    store.update('jobs', intake.job.id, {
      locked_at: new Date(Date.now() - JOB_LEASE_MS - 1000).toISOString(),
    });
    store.locks.clear();

    const reclaimed = await store.claimJob('worker-after-restart');
    assert.equal(reclaimed.id, intake.job.id);
    assert.equal(reclaimed.status, 'running');
    assert.equal(reclaimed.locked_by, 'worker-after-restart');
    await store.completeJob(reclaimed.id);
    assert.equal(await store.claimJob('worker-again'), null);

    const external = await store.enqueueJob({ type: 'crm.send', idempotencyKey: 'crm-lease:1' });
    await store.claimJob('external-worker');
    store.update('jobs', external.job.id, {
      locked_at: new Date(Date.now() - JOB_LEASE_MS - 1000).toISOString(),
    });
    store.locks.clear();
    assert.equal(await store.claimJob('worker-after-restart'), null);
    assert.equal(store.get('jobs', external.job.id).status, 'running');
  });
});

describe('webhooks', () => {
  it('verifies booking signatures', () => {
    const cfg = { webhookSecret: 'test-secret' };
    const adapter = bookingAdapter(cfg);
    const body = '{"type":"booking.completed"}';
    assert.equal(adapter.verifySignature(body, hmac('test-secret', body)), true);
    assert.equal(adapter.verifySignature(body, 'nope'), false);
  });
});

describe('outbound adapters', () => {
  it('fails Turnstile closed without a live verify flag', async () => {
    const missing = captchaAdapter({ captcha: 'turnstile', captchaSecret: '' });
    assert.equal((await missing.verify('tok')).ok, false);
    const gated = captchaAdapter({ captcha: 'turnstile', captchaSecret: 'secret' });
    assert.equal((await gated.verify('tok')).state, 'live-verify-disabled');
  });

  it('skips Places unless RADAR_V2_PLACES_LIVE is on', async () => {
    const prev = process.env.RADAR_V2_PLACES_LIVE;
    delete process.env.RADAR_V2_PLACES_LIVE;
    const skipped = await placesAdapter({ placesApiKey: 'fake' }).lookup({ website: 'https://a.example', business_name: 'A' });
    assert.equal(skipped.status, 'skipped');
    const noKey = await placesAdapter({}).lookup({ website: 'https://a.example', business_name: 'A' });
    assert.equal(noKey.status, 'skipped');
    if (prev == null) delete process.env.RADAR_V2_PLACES_LIVE;
    else process.env.RADAR_V2_PLACES_LIVE = prev;
  });

  it('object storage writes privately and refuses path traversal', async () => {
    const dir = require('path').join(__dirname, '..', 'artifacts', 'storage-test');
    const store = storageAdapter({ storage: 'object', storageDir: dir, s3Bucket: 'unused' });
    const put = await store.put('reports/t.html', '<p>ok</p>', 'text/html');
    assert.match(put.ref, /^object:\/\//);
    assert.equal(put.dryRun, true);
    const got = await store.get(put.ref);
    assert.match(String(got), /ok/);
    await assert.rejects(() => store.get('/etc/passwd'));
  });

  it('does not insert a second identity for the same domain', async () => {
    const store = new MemoryStore();
    const adapters = createAdapters(loadConfig());
    const campaign = await createCampaign(store);
    const body = {
      business_name: 'Acme HVAC',
      website: 'https://acmehvac.example',
      city_state: 'Hatboro, PA',
      requester_name: 'Pat',
      role: 'owner',
      requester_email: 'pat@acmehvac.example',
      primary_services: 'hvac',
      growth_goals: 'leads',
      current_channels: 'none',
      consent_analyze: true,
    };
    const first = await submitIntake(store, adapters, loadConfig(), campaign, body);
    await resolveProspect(store, campaign, first.submission);
    const second = await submitIntake(store, adapters, loadConfig(), campaign, body, { ip: '203.0.113.11' });
    await resolveProspect(store, campaign, second.submission);
    const ids = store.find('prospect_identities', (i) => i.kind === 'domain' && i.value_normalized === 'acmehvac.example');
    assert.equal(ids.length, 1);
  });
});

describe('intake validation', () => {
  it('requires analyze consent and does not treat it as marketing consent', () => {
    const missing = validateIntake({
      business_name: 'A', website: 'https://a.example', city_state: 'Hatboro, PA',
      requester_name: 'J', role: 'owner', requester_email: 'j@a.example',
      primary_services: 'hvac', growth_goals: 'leads', current_channels: 'none',
    });
    assert.equal(missing.ok, false);
    const ok = validateIntake({
      business_name: 'Acme', website: 'https://a.example', city_state: 'Hatboro, PA',
      requester_name: 'Jordan Hale', role: 'owner', requester_email: 'j@a.example',
      primary_services: 'hvac', growth_goals: 'leads', current_channels: 'none',
      consent_analyze: true,
    });
    assert.equal(ok.ok, true);
    assert.equal(ok.value.consent_marketing, false);
  });

  it('waits for the submitted event write before returning success', async () => {
    const cfg = { ...loadConfig(), captcha: 'off', captchaSecret: '' };
    const store = new MemoryStore();
    const originalEmitEvent = store.emitEvent.bind(store);
    let markEventQueued;
    const eventQueued = new Promise((resolve) => { markEventQueued = resolve; });
    let finishWrite;
    const pendingWrite = new Promise((resolve) => { finishWrite = resolve; });
    let eventWritePending = false;
    store.flush = async () => { if (eventWritePending) await pendingWrite; };
    store.emitEvent = async (args) => {
      const event = await originalEmitEvent(args);
      eventWritePending = true;
      markEventQueued();
      return event;
    };
    const campaign = await createCampaign(store);
    const body = {
      business_name: 'Acme HVAC', website: 'https://acmehvac.example', city_state: 'Hatboro, PA',
      requester_name: 'Pat', role: 'owner', requester_email: 'pat@acmehvac.example',
      primary_services: 'hvac', growth_goals: 'leads', current_channels: 'none', consent_analyze: true,
    };

    const resultPromise = submitIntake(store, createAdapters(cfg), cfg, campaign, body);
    await eventQueued;
    let settled = false;
    void resultPromise.then(() => { settled = true; }, () => { settled = true; });
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(settled, false);

    finishWrite();
    const result = await resultPromise;
    assert.equal(result.ok, true);
    assert.equal(store.findOne('events', (event) => event.type === 'intake.submitted')?.correlation_id, result.submission.id);
  });

  it('does not return success when the submitted event write fails', async () => {
    const cfg = { ...loadConfig(), captcha: 'off', captchaSecret: '' };
    const store = new MemoryStore();
    const originalEmitEvent = store.emitEvent.bind(store);
    let markEventQueued;
    const eventQueued = new Promise((resolve) => { markEventQueued = resolve; });
    let failWrite;
    const pendingWrite = new Promise((_, reject) => { failWrite = reject; });
    let eventWritePending = false;
    store.flush = async () => { if (eventWritePending) await pendingWrite; };
    store.emitEvent = async (args) => {
      const event = await originalEmitEvent(args);
      eventWritePending = true;
      markEventQueued();
      return event;
    };
    const campaign = await createCampaign(store);
    const body = {
      business_name: 'Acme HVAC', website: 'https://acmehvac.example', city_state: 'Hatboro, PA',
      requester_name: 'Pat', role: 'owner', requester_email: 'pat@acmehvac.example',
      primary_services: 'hvac', growth_goals: 'leads', current_channels: 'none', consent_analyze: true,
    };

    const resultPromise = submitIntake(store, createAdapters(cfg), cfg, campaign, body);
    await eventQueued;
    failWrite(new Error('event persistence failed'));
    await assert.rejects(resultPromise, /event persistence failed/);
  });

  it('queues a six-field request, scans the public page, and creates a QA-pending report without inventing a business name', async () => {
    const storageDir = fs.mkdtempSync(path.join(os.tmpdir(), 'radar-intake-e2e-'));
    const cfg = { ...loadConfig({ databaseUrl: '', storageDir, storage: 'fs', publicOrigin: 'https://audit.example' }), captcha: 'off', captchaSecret: '' };
    const store = new MemoryStore();
    let flushCalls = 0;
    store.flush = async () => { flushCalls += 1; };
    const campaign = await createCampaign(store);
    const server = createServer({ store, adapters: createAdapters(cfg), campaign, cfg });
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    const base = `http://127.0.0.1:${server.address().port}`;
    try {
      const form = await (await fetch(`${base}/intake`)).text();
      for (const name of ['name', 'phone', 'email', 'website', 'business_description', 'goals']) {
        assert.match(form, new RegExp(`name="${name}"`));
      }
      assert.doesNotMatch(form, /name="business_name"/);

      const invalid = await fetch(`${base}/intake`, {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          name: 'Jordan Hale', phone: '5550100199', email: 'bad', website: 'http://192.168.1.2',
          business_description: 'Local roofing company', goals: 'More qualified leads',
        }),
      });
      const invalidHtml = await invalid.text();
      assert.equal(invalid.status, 400);
      assert.match(invalidHtml, /role="alert"/);
      assert.match(invalidHtml, /aria-invalid="true" aria-describedby="email-error"/);
      assert.match(invalidHtml, /aria-invalid="true" aria-describedby="website-error"/);
      assert.equal(store.all('intake_submissions').length, 0);

      const accepted = await fetch(`${base}/intake`, {
        method: 'POST',
        redirect: 'manual',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          name: 'Jordan Hale', phone: '5550100199', email: 'jordan@example.org',
          website: 'https://www.example.org', business_description: 'Local roofing company',
          goals: 'More qualified leads', consent_analyze: 'on',
        }),
      });
      assert.equal(accepted.status, 303);
      assert.equal(flushCalls, 3);
      assert.ok(store.findOne('events', (event) => event.type === 'intake.submitted'));
      const submission = store.all('intake_submissions')[0];
      assert.equal(submission.business_name, null);
      assert.equal(submission.business_description, 'Local roofing company');
      assert.equal(submission.consent_review_call, true);
      const job = store.findOne('jobs', (row) => row.type === 'intake.audit');
      assert.ok(job);
      assert.equal(job.status, 'queued');

      const receiptResponse = await fetch(new URL(accepted.headers.get('location'), base));
      assert.equal(receiptResponse.headers.get('cache-control'), 'no-store');
      assert.equal(receiptResponse.headers.get('referrer-policy'), 'no-referrer');
      const receipt = await receiptResponse.text();
      assert.match(receipt, /Request received/);
      assert.match(receipt, /audit is queued/i);
      assert.doesNotMatch(receipt, /Jordan Hale|jordan@example\.org|\+1555010199|5550100199/);
      assert.match(receipt, /https:\/\/example\.org/);
      assert.match(receipt, /report has not been generated or emailed yet/);

      const html = '<!doctype html><html><head><title>Roofing services</title><meta name="viewport" content="width=device-width"><meta name="description" content="Roof repair and replacement"></head><body><h1>Roofing services</h1><p>Roof repair and replacement for residential properties.</p><a href="tel:5550100200">Call now</a><form><input name="email"></form></body></html>';
      let fetchedUrl = '';
      const fetchPageFn = async (url) => {
        fetchedUrl = url;
        return {
          ok: true, status: 200, finalUrl: url, html, body: html,
          headers: { 'content-type': 'text/html; charset=utf-8' },
          bytes: Buffer.byteLength(html), responseMs: 25, hops: [{ url, status: 200 }],
        };
      };
      const processed = await processJobs(store, {
        'intake.audit': (payload) => processIntakeAuditJob(store, cfg, payload, { fetchPageFn }),
      }, { workerId: 'intake-e2e', max: 1 });
      assert.equal(processed[0].status, 'succeeded');
      assert.equal(new URL(fetchedUrl).origin, 'https://example.org');
      const linkedSubmission = store.get('intake_submissions', submission.id);
      const prospect = store.get('prospects', linkedSubmission.prospect_id);
      assert.ok(prospect);
      assert.equal(prospect.business_name, null);
      assert.equal(prospect.vertical, null);
      assert.equal(prospect.lifecycle, 'qa_pending');
      const audit = store.findOne('audit_runs', (row) => row.prospect_id === prospect.id);
      assert.equal(audit.fixture, false);
      assert.equal(audit.raw_audit.reachable, true);
      assert.equal(store.find('evidence_items', (row) => row.audit_run_id === audit.id).length > 0, true);
      const report = store.findOne('reports', (row) => row.prospect_id === prospect.id);
      assert.ok(report?.current_version_id);
      const version = store.get('report_versions', report.current_version_id);
      assert.match(version.manifest.prospect.website, /example\.org/);
      assert.equal(version.manifest.prospect.business_name, null);
      const reportHtml = fs.readFileSync(version.html_ref, 'utf8');
      assert.match(reportHtml, /Website audit/);
      assert.match(reportHtml, /https:\/\/example\.org/);
      assert.equal(store.all('outreach_drafts').length, 0);
      assert.equal(store.all('crm_handoffs').length, 0);

      const reportBeforeQa = await fetch(`${base}/r/${report.access_token}`);
      assert.equal(reportBeforeQa.status, 404);
      const completedResponse = await fetch(new URL(accepted.headers.get('location'), base));
      const completedReceipt = await completedResponse.text();
      assert.match(completedReceipt, /awaiting human quality review/i);
      assert.match(completedReceipt, /Nothing has been emailed/);
      assert.doesNotMatch(completedReceipt, /Jordan Hale|jordan@example\.org|\+1555010199|5550100199/);
    } finally {
      await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
      fs.rmSync(storageDir, { recursive: true, force: true });
    }
  });
});

describe('migrations', () => {
  it('declares every required table', () => {
    const tables = listMigrationTables();
    for (const need of [
      'campaigns', 'prospects', 'prospect_sources', 'prospect_identities', 'suppressions',
      'intake_submissions', 'audit_runs', 'evidence_items', 'score_snapshots', 'reports',
      'report_versions', 'contacts', 'contact_sources', 'outreach_drafts', 'approvals',
      'crm_handoffs', 'bookings', 'sales_outcomes', 'events', 'jobs',
    ]) {
      assert.ok(tables.includes(need), need);
    }
  });

  it('encodes JSONB objects and text arrays without double-stringifying', () => {
    const schema = loadMigrationSchema();
    assert.ok(schema.intake_submissions.columns.includes('business_description'));
    assert.ok(schema.intake_submissions.columns.includes('consent_review_call'));
    assert.ok(schema.prospects.columns.includes('business_name'));
    assert.ok(schema.jobs.columns.includes('payload'));
    assert.ok(schema.jobs.jsonb.has('payload'));
    assert.ok(schema.campaigns.arrays.has('allowed_offers'));
    const encoded = encodeRow(schema, 'campaigns', {
      id: 'cmp_1',
      name: 'Test',
      owner: 'Jesse',
      geography: { market: 'PHL' },
      allowed_offers: ['rebuild', 'seo_aeo'],
      provenance: { actor: 'test' },
    });
    assert.equal(typeof encoded.geography, 'string');
    assert.equal(JSON.parse(encoded.geography).market, 'PHL');
    assert.deepEqual(encoded.allowed_offers, ['rebuild', 'seo_aeo']);
    const intake = encodeRow(schema, 'intake_submissions', {
      id: 'intake_1', business_name: null, business_description: 'Local roofing company', consent_review_call: true,
    });
    assert.equal(intake.business_name, null);
    assert.equal(intake.business_description, 'Local roofing company');
    assert.equal(intake.consent_review_call, true);
    assert.match(CLAIM_JOB_SQL, /FOR UPDATE SKIP LOCKED/);
    assert.match(CLAIM_JOB_SQL, /type = 'intake\.audit'/);
  });

  it('provides a forward migration for databases that already applied the original schema', async () => {
    const sql = fs.readFileSync(path.join(__dirname, '..', 'migrations', '002_intake_six_fields.sql'), 'utf8');
    const prospectMigration = fs.readFileSync(path.join(__dirname, '..', 'migrations', '003_nullable_prospect_identity.sql'), 'utf8');
    assert.match(sql, /ALTER TABLE intake_submissions ALTER COLUMN business_name DROP NOT NULL/);
    assert.match(sql, /ADD COLUMN IF NOT EXISTS business_description TEXT/);
    assert.match(sql, /ADD COLUMN IF NOT EXISTS consent_review_call BOOLEAN NOT NULL DEFAULT FALSE/);
    assert.match(prospectMigration, /ALTER TABLE prospects ALTER COLUMN business_name DROP NOT NULL/);
    assert.equal((await migrate('')).applied, false);
  });
});

describe('vertical slice', () => {
  it('runs a fictional fixture from intake through won without live outbound', async () => {
    const result = await runVerticalSlice({ fixtureName: 'cedar-ridge-hvac', reviewer: 'qa.reviewer', configOverrides: { databaseUrl: '' } });
    assert.equal(result.prospect.lifecycle, 'won');
    assert.equal(result.offer.offer, 'rebuild');
    assert.ok((result.snapshot.components.site_quality.hard_faults || []).length > 0);
    assert.equal(result.approval.decision, 'approve');
    assert.equal(result.outreach.handoff.dry_run, true);
    assert.equal(result.outreach.handoff.live_write, false);
    assert.equal(result.adaptersCalled.crmLive, false);
    assert.equal(result.adaptersCalled.emailSent, false);
    assert.deepEqual(result.network.outbound, []);
    assert.equal(result.funnel.revenue, 4800);
    assert.ok(result.report.checks.ok, result.report.checks.fails.join(','));
    const html = result.report.html;
    assert.match(html, /noindex/);
    assert.match(html, /Momentum Digital/);
    assert.match(html, /Source appendix/);
    assert.match(html, /Private analytics\/CMS access required/);
    assert.equal(containsPii(html, { allowAgencyEmail: true }).leaked, false);
    const rendered = renderReportHtml(result.report.manifest, {
      reportUrl: result.report.reportUrl,
      bookingUrl: result.report.bookingUrl,
      config: result.cfg,
    });
    assert.equal(checkReport(rendered.html, result.report.manifest).ok, true);
    assert.equal(result.cfg.enableCrm, false);
    assert.equal(result.cfg.enableOutreach, false);
    assert.equal(loadConfig().killSwitch, true);
  });

  it('pauses at qa_pending so human review can happen before won', async () => {
    const paused = await runVerticalSlice({ fixtureName: 'cedar-ridge-hvac', reviewer: 'qa.reviewer', pauseAt: 'qa_pending', configOverrides: { databaseUrl: '' } });
    assert.equal(paused.prospect.lifecycle, 'qa_pending');
    assert.equal(paused.offer.offer, 'rebuild');
    const finished = await finishVerticalSlice(paused);
    assert.equal(finished.prospect.lifecycle, 'won');
    const html = funnelPage(funnelView(finished.store));
    assert.match(html, /<h1>Funnel<\/h1>/);
    assert.match(html, /QA approval/);
    assert.match(html, /noindex/);
    assert.doesNotMatch(html, /"counts":/);
  });

  it('refuses delivery and live handoff without approval and with kill switch on', async () => {
    const cfg = loadConfig();
    assert.equal(cfg.killSwitch, true);
    assert.equal(cfg.enableReportDelivery, false);
    assert.equal(cfg.enableCrm, false);
    assert.equal(cfg.enableOutreach, false);
  });
});
