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
const { checkReport, renderReportHtml } = require('../lib/reports.ts');
const { processJobs } = require('../lib/jobs.ts');
const { hmac } = require('../lib/ids.ts');
const { bookingAdapter } = require('../lib/adapters.ts');
const { listMigrationTables } = require('../lib/store.ts');
const { containsPii } = require('../lib/redact.ts');
const { validateIntake } = require('../lib/intake.ts');
const { runVerticalSlice } = require('../lib/pipeline.ts');
const { loadConfig } = require('../lib/config.ts');

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
});

describe('vertical slice', () => {
  it('runs a fictional fixture from intake through won without live outbound', async () => {
    const result = await runVerticalSlice({ fixtureName: 'cedar-ridge-hvac', reviewer: 'qa.reviewer' });
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
    assert.equal(result.cfg.enableCrm, false);
    assert.equal(result.cfg.enableOutreach, false);
    assert.equal(loadConfig().killSwitch, true);
  });

  it('refuses delivery and live handoff without approval and with kill switch on', async () => {
    const cfg = loadConfig();
    assert.equal(cfg.killSwitch, true);
    assert.equal(cfg.enableReportDelivery, false);
    assert.equal(cfg.enableCrm, false);
    assert.equal(cfg.enableOutreach, false);
  });
});
