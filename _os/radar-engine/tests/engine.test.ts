'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
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
const { encryptValue, decryptValue, PREFIX, keyFromHex } = require('../lib/crypto.ts');
const { hmac } = require('../lib/ids.ts');
const { bookingAdapter, captchaAdapter, placesAdapter } = require('../lib/adapters.ts');
const { listMigrationTables } = require('../lib/store.ts');
const { loadMigrationSchema, encodeRow, CLAIM_JOB_SQL } = require('../lib/schema.ts');
const { containsPii } = require('../lib/redact.ts');
const { validateIntake } = require('../lib/intake.ts');
const { runVerticalSlice, finishVerticalSlice, funnelView, createCampaign, submitIntake, resolveProspect, processSubmission, draftCopy } = require('../lib/pipeline.ts');
const { funnelPage, createServer } = require('../lib/web.ts');
const { loadConfig } = require('../lib/config.ts');
const { storageAdapter } = require('../lib/reports.ts');
const { createAdapters } = require('../lib/adapters.ts');
const { inferVertical } = require('../lib/vertical.ts');
const { offerLabel } = require('../lib/copy.ts');
const { createStore } = require('../lib/store.ts');

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
    assert.throws(() => assertSafeScanUrl('http://[::ffff:127.0.0.1]/'));
    assert.throws(() => assertSafeScanUrl('http://[::ffff:169.254.169.254]/'));
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
    const withIntake = {
      ...manifest,
      intake: { growth_goals: 'we spend 12000 a month', primary_services: 'hvac', current_channels: 'ads', role: 'owner' },
    };
    const stillBad = validateNarrative(withIntake, 'They spend $12,000 a month on Google Ads and rank #1 vs Rival HVAC.');
    assert.equal(stillBad.ok, false);
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
    assert.match(CLAIM_JOB_SQL, /FOR UPDATE SKIP LOCKED/);
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
    assert.match(html, /NeedMomentum/);
    assert.match(html, /Source appendix/);
    assert.match(html, /Private analytics\/CMS access required/);
    assert.equal(containsPii(html, { allowAgencyEmail: true }).leaked, false);
    const rendered = renderReportHtml(result.report.manifest, {
      reportUrl: result.report.reportUrl,
      bookingUrl: result.report.bookingUrl,
      config: result.cfg,
    });
    assert.equal(checkReport(rendered.html, result.report.manifest).ok, true);
    assert.match(html, /SEO \+ MARKETING AUDIT/);
    assert.match(html, /What you told us/);
    assert.match(html, /more service calls from nearby homeowners/);
    assert.match(html, /This audit did not name or rank competitors/);
    assert.match(html, /website rebuild/);
    assert.equal(/\u2014/.test(html), false);
    assert.equal(result.prospect.vertical, 'hvac');
    assert.match(result.outreach.emailDraft.body, /Free public presence audit|This is a draft for a human to send/);
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
    assert.equal(cfg.liveScan, false);
  });
});

describe('vertical inference', () => {
  it('reads HVAC, dental, and remodeling from intake language', () => {
    assert.equal(inferVertical({ services: 'heating, air conditioning', name: 'Cedar Ridge' }), 'hvac');
    assert.equal(inferVertical({ services: 'family dentistry', name: 'Bright Smile Dental' }), 'dental');
    assert.equal(inferVertical({ services: 'kitchen remodel', name: 'Fallston Remodeling' }), 'remodeling');
    assert.equal(inferVertical({ services: 'widgets' }), 'unknown');
    assert.equal(offerLabel('seo_aeo'), 'SEO and AI search');
  });
});

describe('intake to report', () => {
  it('does not force HVAC when the form is a dental practice', async () => {
    const store = await createStore({ databaseUrl: '' });
    const adapters = createAdapters(loadConfig({ databaseUrl: '' }));
    const campaign = await createCampaign(store);
    const body = {
      business_name: 'Bright Smile Dental',
      website: 'https://brightsmile.example',
      city_state: 'Hatboro, PA',
      requester_name: 'Pat Lee',
      role: 'owner',
      requester_email: 'pat@brightsmile.example',
      primary_services: 'family dentistry and Invisalign',
      growth_goals: 'more new patient exams',
      current_channels: 'referrals',
      consent_analyze: true,
    };
    const first = await submitIntake(store, adapters, loadConfig({ databaseUrl: '' }), campaign, body);
    const resolved = await resolveProspect(store, campaign, first.submission);
    assert.equal(resolved.prospect.vertical, 'dental');
  });

  it('turns a fixture intake into a qa_pending branded report', async () => {
    const store = await createStore({ databaseUrl: '' });
    const cfg = loadConfig({ databaseUrl: '', liveScan: false });
    const adapters = createAdapters(cfg);
    const campaign = await createCampaign(store);
    const meta = require('../fixtures/cedar-ridge-hvac/meta.json');
    const submitted = await submitIntake(store, adapters, cfg, campaign, meta.intake);
    const processed = await processSubmission(store, adapters, cfg, campaign, submitted.submission);
    assert.equal(processed.ok, true);
    assert.equal(processed.prospect.lifecycle, 'qa_pending');
    assert.equal(processed.prospect.vertical, 'hvac');
    assert.match(processed.report.html, /SEO \+ MARKETING AUDIT/);
    assert.match(processed.report.html, /What you told us/);
    assert.equal(processed.report.checks.ok, true, processed.report.checks.fails.join(','));
  });

  it('serves intake through status without live outbound', async () => {
    const store = await createStore({ databaseUrl: '' });
    const cfg = loadConfig({ databaseUrl: '', liveScan: false, qaToken: 'qa-test' });
    const adapters = createAdapters(cfg);
    const campaign = await createCampaign(store);
    const server = createServer({ store, adapters, campaign, cfg });
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    const { port } = server.address();
    try {
      const meta = require('../fixtures/cedar-ridge-hvac/meta.json');
      const params = new URLSearchParams({
        business_name: meta.intake.business_name,
        website: meta.intake.website,
        city_state: meta.intake.city_state,
        requester_name: meta.intake.requester_name,
        role: meta.intake.role,
        requester_email: meta.intake.requester_email,
        primary_services: meta.intake.primary_services,
        growth_goals: meta.intake.growth_goals,
        current_channels: meta.intake.current_channels,
        consent_analyze: 'on',
      });
      const posted = await fetch(`http://127.0.0.1:${port}/intake`, {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: params,
        redirect: 'manual',
      });
      assert.equal(posted.status, 303);
      const loc = posted.headers.get('location');
      assert.match(loc, /^\/status\//);
      const status = await fetch(`http://127.0.0.1:${port}${loc}`);
      const html = await status.text();
      assert.match(html, /Cedar Ridge Heating and Cooling/);
      assert.match(html, /in human review/);
      const privacy = await (await fetch(`http://127.0.0.1:${port}/privacy`)).text();
      assert.doesNotMatch(privacy, /Placeholder/);
      const prospect = store.findOne('prospects', (p) => p.domain === 'cedarridgehvac.example');
      assert.equal(prospect.lifecycle, 'qa_pending');
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it('reuses an in flight audit instead of crashing on a second submit', async () => {
    const store = await createStore({ databaseUrl: '' });
    const cfg = loadConfig({ databaseUrl: '', liveScan: false });
    const adapters = createAdapters(cfg);
    const campaign = await createCampaign(store);
    const meta = require('../fixtures/cedar-ridge-hvac/meta.json');
    const first = await submitIntake(store, adapters, cfg, campaign, meta.intake);
    const processed = await processSubmission(store, adapters, cfg, campaign, first.submission);
    assert.equal(processed.prospect.lifecycle, 'qa_pending');
    const second = await submitIntake(store, adapters, cfg, campaign, {
      ...meta.intake,
      requester_email: 'other@cedarridgehvac.example',
    }, { ip: '203.0.113.20' });
    const again = await processSubmission(store, adapters, cfg, campaign, second.submission);
    assert.equal(again.ok, true);
    assert.equal(again.reuse, true);
    assert.equal(store.get('prospects', processed.prospect.id).lifecycle, 'qa_pending');
  });

  it('redacts phones and emails from intake before they reach the report', async () => {
    const store = await createStore({ databaseUrl: '' });
    const cfg = loadConfig({ databaseUrl: '', liveScan: false });
    const adapters = createAdapters(cfg);
    const campaign = await createCampaign(store);
    const meta = require('../fixtures/cedar-ridge-hvac/meta.json');
    const submitted = await submitIntake(store, adapters, cfg, campaign, {
      ...meta.intake,
      growth_goals: 'call me at 555-010-0199 or jordan.hale@gmail.com',
    });
    const processed = await processSubmission(store, adapters, cfg, campaign, submitted.submission);
    assert.equal(processed.ok, true);
    assert.doesNotMatch(processed.report.html, /555-010-0199/);
    assert.doesNotMatch(processed.report.html, /jordan\.hale@gmail\.com/);
    assert.match(processed.report.html, /redacted/);
    assert.equal(processed.report.checks.ok, true, processed.report.checks.fails.join(','));
    assert.equal(processed.prospect.lifecycle, 'qa_pending');
  });

  it('writes owner facing outreach drafts that stay unsent', () => {
    const draft = draftCopy(
      { business_name: 'Cedar Ridge Heating and Cooling' },
      {
        selected_offer: 'rebuild',
        site_quality_score: 41,
        explanations: [{ because: 'provable hard faults: no responsive viewport' }],
      },
      'http://127.0.0.1:4343/r/test',
      'http://127.0.0.1:4343/cta/test',
      { requester_name: 'Jordan Hale', growth_goals: 'more service calls from nearby homeowners' }
    );
    assert.match(draft.email.subject, /Free public presence audit/);
    assert.match(draft.email.body, /Hi Jordan/);
    assert.match(draft.email.body, /Nothing here has been emailed/);
    assert.match(draft.callBrief.body, /website rebuild/);
  });
});
