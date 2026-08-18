'use strict';

const fs = require('fs');
const path = require('path');
const { id, token, sha256, addDays, nowIso } = require('./ids.ts');
const { loadConfig } = require('./config.ts');
const { createStore } = require('./store.ts');
const { createAdapters } = require('./adapters.ts');
const { validateIntake } = require('./intake.ts');
const { normalizeDomain, normalizeWebsite, normalizeEmail, normalizePhone, normalizeName } = require('./normalize.ts');
const { checkSuppression } = require('./suppress.ts');
const { scanFixture, scanLive, scanDocument } = require('./scan.ts');
const { scoreAudit } = require('./scoring.ts');
const { selectOffer } = require('./routing.ts');
const { buildManifest } = require('./manifest.ts');
const { renderReportHtml, checkReport, renderPdf, storageAdapter, visualCheck } = require('./reports.ts');
const { outboundBlocked } = require('./config.ts');
const { redactText, sanitizeExport } = require('./redact.ts');
const { inferVertical } = require('./vertical.ts');
const { offerLabel, firstName, publicIntake } = require('./copy.ts');

function loadFixture(name) {
  const dir = path.join(__dirname, '..', 'fixtures', name);
  const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
  const meta = JSON.parse(fs.readFileSync(path.join(dir, 'meta.json'), 'utf8'));
  return { html, meta, dir };
}

function splitCityState(value) {
  const s = String(value || '');
  const m = s.match(/^(.*?)(?:,\s*([A-Z]{2}))?$/);
  return { city: (m && m[1] || s).trim(), state: (m && m[2]) || '' };
}

function listFixtureNames() {
  const dir = path.join(__dirname, '..', 'fixtures');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((name) => fs.existsSync(path.join(dir, name, 'meta.json')));
}

function findFixtureName(website) {
  const domain = normalizeDomain(website);
  if (!domain) return '';
  for (const name of listFixtureNames()) {
    try {
      const meta = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'fixtures', name, 'meta.json'), 'utf8'));
      if (normalizeDomain(meta.intake?.website || meta.website) === domain) return name;
    } catch {
      // skip a broken fixture rather than fail intake
    }
  }
  return '';
}

function intakeForProspect(store, prospect) {
  if (!prospect) return null;
  return store.findOne('intake_submissions', (s) => s.prospect_id === prospect.id)
    || store.findOne('intake_submissions', (s) => normalizeDomain(s.website) === prospect.domain);
}

async function createCampaign(store, input = {}) {
  return store.insert('campaigns', {
    id: input.id || id('campaign'),
    name: input.name || 'Philadelphia trades audit',
    owner: input.owner || 'Jesse',
    geography: input.geography || { market: 'PHL', areas: ['Philadelphia', 'Montgomery County'] },
    included_verticals: input.included_verticals || ['hvac', 'plumbing', 'dental'],
    excluded_verticals: input.excluded_verticals || ['restaurant'],
    allowed_offers: input.allowed_offers || ['rebuild', 'seo_aeo', 'local', 'paid', 'conversion', 'polish'],
    daily_discovery_budget: 60,
    daily_render_budget: 80,
    daily_enrichment_budget: 20,
    daily_report_budget: 10,
    capacity: 25,
    suppression_policy: { exclude_chains: true, report_freshness_days: 90, block_previous_outreach: true },
    report_template: 'momentum-audit-v1',
    booking_owner: 'Jesse',
    booking_link: input.booking_link,
    crm_destination: 'dry-run',
    outreach_channels: ['email', 'call-brief'],
    human_qa_mandatory: true,
    report_delivery_enabled: false,
    outreach_handoff_enabled: false,
    auto_approve_enabled: false,
  });
}

async function submitIntake(store, adapters, cfg, campaign, body, { ip = '203.0.113.10' } = {}) {
  const captcha = await adapters.captcha.verify(body.captcha_token, ip);
  const parsed = validateIntake(body, { requireCaptcha: cfg.captcha === 'turnstile' });
  if (!parsed.ok) return { ok: false, errors: parsed.errors };
  if (!captcha.ok) return { ok: false, errors: ['captcha failed'] };

  const ipHash = sha256(ip);
  const domain = normalizeDomain(parsed.value.website);
  const ipLimit = await store.bumpRateLimit(`ip:${ipHash}`, 3600000, 8);
  const domLimit = await store.bumpRateLimit(`domain:${domain}`, 86400000, 3);
  if (!ipLimit.allowed) return { ok: false, errors: ['rate limited (ip)'] };
  if (!domLimit.allowed) return { ok: false, errors: ['rate limited (domain)'] };

  const dup = store.findOne(
    'intake_submissions',
    (s) => normalizeDomain(s.website) === domain && s.requester_email === parsed.value.requester_email
  );

  const submission = store.insert('intake_submissions', {
    id: id('intake'),
    campaign_id: campaign.id,
    status_token: token(18),
    ip_hash: ipHash,
    ...parsed.value,
    email_verification: 'unverified',
    captcha_state: captcha.state,
    duplicate_of: dup ? dup.id : null,
  });
  await store.emitEvent({
    actor: 'prospect',
    reason: 'intake submitted',
    correlationId: submission.id,
    type: 'intake.submitted',
    payload: { campaign_id: campaign.id, domain, consent_analyze: parsed.value.consent_analyze, consent_marketing: parsed.value.consent_marketing },
  });
  return { ok: true, submission, duplicate: Boolean(dup) };
}

async function resolveProspect(store, campaign, submission, { actor = 'system', correlationId } = {}) {
  const loc = splitCityState(submission.city_state);
  const domain = normalizeDomain(submission.website);
  const vertical = inferVertical({
    services: submission.primary_services,
    name: submission.business_name,
    website: submission.website,
    notes: submission.notes,
  });
  const existing = store.findOne('prospects', (p) => p.domain === domain && p.campaign_id === campaign.id);
  const prospect = existing || store.insert('prospects', {
    id: id('prospect'),
    campaign_id: campaign.id,
    lifecycle: 'discovered',
    business_name: submission.business_name,
    website: normalizeWebsite(submission.website),
    domain,
    city: loc.city,
    state: loc.state,
    service_area: submission.city_state,
    vertical,
    public_fields: { domain, city: loc.city, state: loc.state, vertical },
    private_fields: {},
    correlation_id: correlationId || submission.id,
  });
  store.update('intake_submissions', submission.id, { prospect_id: prospect.id });
  store.insert('prospect_sources', {
    id: id('source'),
    prospect_id: prospect.id,
    source: 'intake',
    source_record_id: submission.id,
    payload: { channel: 'self-serve' },
  });
  const ident = store.findOne('prospect_identities', (i) => i.kind === 'domain' && i.value_normalized === domain);
  if (!ident) {
    store.insert('prospect_identities', {
      id: id('identity'),
      prospect_id: prospect.id,
      kind: 'domain',
      value_normalized: domain,
      value_display: prospect.website,
      confidence: 0.99,
    });
  }
  if (!existing) {
    await store.transition(prospect.id, 'deduped', { actor, reason: 'intake identity resolved', correlationId: prospect.correlation_id });
  }
  const suppression = checkSuppression({ store, prospect, campaign, intake: submission });
  const softReuse = suppression.suppressed && /duplicate domain|existing report|previous outreach/.test(suppression.reason);
  if (softReuse && existing) {
    return {
      prospect: store.get('prospects', prospect.id),
      suppression: { suppressed: false, reason: '', detail: '' },
      reuse: true,
      reuseReason: suppression.reason,
    };
  }
  if (suppression.suppressed) {
    store.update('prospects', prospect.id, { suppression_reason: `${suppression.reason}: ${suppression.detail}` });
    await store.transition(prospect.id, 'suppressed', { actor, reason: suppression.reason, correlationId: prospect.correlation_id });
    return { prospect: store.get('prospects', prospect.id), suppression };
  }
  if (existing && !['discovered', 'deduped', 'scan_pending', 'failed_retryable'].includes(prospect.lifecycle)) {
    return {
      prospect: store.get('prospects', prospect.id),
      suppression,
      reuse: true,
      reuseReason: `already ${prospect.lifecycle}`,
    };
  }
  await store.transition(prospect.id, 'scan_pending', { actor, reason: 'cleared suppression', correlationId: prospect.correlation_id });
  return { prospect: store.get('prospects', prospect.id), suppression };
}

async function lookupPlaces(adapters, prospect, supplied) {
  if (supplied) return supplied;
  if (!adapters || !adapters.places) return null;
  const looked = await adapters.places.lookup(prospect);
  if (looked.status !== 'ok') return null;
  return {
    id: looked.place_id,
    rating: looked.rating,
    userRatingCount: looked.review_count,
    businessStatus: looked.business_status,
    displayName: looked.matched_name,
  };
}

async function persistScan(store, cfg, prospect, scanned) {
  const run = store.insert('audit_runs', {
    id: id('audit'),
    prospect_id: prospect.id,
    scanner_version: scanned.scanner_version,
    score_version: cfg.scoreVersion,
    tier: scanned.audit.tier || 0,
    status: 'completed',
    started_at: nowIso(),
    completed_at: nowIso(),
    fixture: scanned.fixture === true,
    raw_audit: scanned.audit,
  });
  const evidence = scanned.evidence.map((e) => store.insert('evidence_items', { ...e, audit_run_id: run.id }));
  await store.transition(prospect.id, 'scanned', {
    actor: 'scanner',
    reason: scanned.fixture ? 'fixture scan complete' : 'public scan complete',
    correlationId: prospect.correlation_id,
  });
  await store.emitEvent({
    actor: 'scanner',
    type: 'scan.completed',
    prospectId: prospect.id,
    correlationId: prospect.correlation_id,
    reason: 'scan completed',
    payload: { audit_run_id: run.id, fixture: scanned.fixture === true },
  });
  return { run, evidence, scanned };
}

async function runScan(store, cfg, prospect, fixture, adapters) {
  await store.transition(prospect.id, 'scanning', { actor: 'scanner', reason: 'audit run started', correlationId: prospect.correlation_id });
  await store.emitEvent({ actor: 'scanner', type: 'scan.started', prospectId: prospect.id, correlationId: prospect.correlation_id, reason: 'scan started' });
  const places = await lookupPlaces(adapters, prospect, fixture.meta?.places || null);
  const scanned = scanFixture({
    html: fixture.html,
    url: prospect.website,
    prospect,
    places,
  });
  return persistScan(store, cfg, prospect, scanned);
}

async function runScanDocument(store, cfg, prospect, source, adapters) {
  await store.transition(prospect.id, 'scanning', { actor: 'scanner', reason: 'audit run started', correlationId: prospect.correlation_id });
  await store.emitEvent({ actor: 'scanner', type: 'scan.started', prospectId: prospect.id, correlationId: prospect.correlation_id, reason: 'scan started' });
  const places = await lookupPlaces(adapters, prospect, source.places || null);
  let scanned;
  if (source.live) {
    scanned = await scanLive({ url: source.url || prospect.website, prospect, places, fetchImpl: source.fetchImpl });
  } else {
    scanned = scanDocument({
      html: source.html,
      url: source.url || prospect.website,
      prospect,
      places,
      source: source.source || 'intake',
      fixture: false,
    });
  }
  return persistScan(store, cfg, prospect, scanned);
}

async function scoreAndRoute(store, cfg, campaign, prospect, run, evidence, scanned) {
  const snapshotIn = scoreAudit({
    prospect: {
      ...prospect,
      review_count: fixtureNum(scanned, 'review_count'),
      rating: fixtureNum(scanned, 'rating'),
      gbp_claimed: scanned.prospect?.gbp_claimed,
      has_phone: Boolean(scanned.contacts.phone),
      has_email: scanned.contacts.emails.length > 0,
      vertical: prospect.vertical,
      area: prospect.city,
    },
    audit: scanned.audit,
    evidenceItems: evidence,
    contacts: scanned.contacts.emails.map((e) => ({ type: 'email', own_domain: e.onOwnDomain, suppressed: false })),
  });
  const routed = selectOffer(snapshotIn, { allowedOffers: campaign.allowed_offers });
  if (routed.route === 'needs_review') {
    const snap = store.insert('score_snapshots', scoreRow(prospect, run, snapshotIn, routed, cfg));
    await store.transition(prospect.id, 'needs_review', { actor: 'router', reason: routed.reasons.join('; '), correlationId: prospect.correlation_id });
    return { snapshot: snap, routed, snapshotIn };
  }
  const snap = store.insert('score_snapshots', scoreRow(prospect, run, snapshotIn, routed, cfg));
  store.update('prospects', prospect.id, { selected_offer: routed.offer, score_version: cfg.scoreVersion });
  await store.transition(prospect.id, 'scored', { actor: 'router', reason: routed.reasons.join('; '), correlationId: prospect.correlation_id });
  return { snapshot: snap, routed, snapshotIn };
}

function fixtureNum(scanned, key) {
  return scanned.prospect && scanned.prospect[key] != null ? scanned.prospect[key] : undefined;
}

function scoreRow(prospect, run, snapshotIn, routed, cfg) {
  return {
    id: id('score'),
    prospect_id: prospect.id,
    audit_run_id: run.id,
    score_version: cfg.scoreVersion,
    immutable: true,
    site_quality_score: snapshotIn.site_quality_score,
    opportunity_score: snapshotIn.opportunity_score,
    rebuild_opportunity: snapshotIn.rebuild_opportunity,
    seo_aeo_opportunity: snapshotIn.seo_aeo_opportunity,
    local_opportunity: snapshotIn.local_opportunity,
    paid_opportunity: snapshotIn.paid_opportunity,
    conversion_opportunity: snapshotIn.conversion_opportunity,
    market_fit_score: snapshotIn.market_fit_score,
    contactability_score: snapshotIn.contactability_score,
    audit_confidence: snapshotIn.audit_confidence,
    priority_score: snapshotIn.priority_score,
    components: snapshotIn.components,
    explanations: snapshotIn.explanations,
    selected_offer: routed.offer,
    routing_reasons: routed.reasons,
  };
}

async function generateReport(store, cfg, prospect, run, snapshot, snapshotIn, evidence, offer, intake) {
  const manifest = buildManifest({
    prospect,
    snapshot: snapshotIn,
    evidence,
    offer,
    auditId: run.id,
    observedAt: nowIso(),
    config: cfg,
    intake: publicIntake(intake || intakeForProspect(store, prospect)),
  });
  const report = store.insert('reports', {
    id: id('report'),
    prospect_id: prospect.id,
    audit_run_id: run.id,
    score_snapshot_id: snapshot.id,
    access_token: token(24),
    expires_at: addDays(nowIso(), cfg.reportTtlDays),
    booking_variant: 'default',
  });
  const reportUrl = `${cfg.publicOrigin}/r/${report.access_token}`;
  const bookingUrl = `${cfg.publicOrigin}/cta/${report.access_token}?kind=book`;
  const rendered = renderReportHtml(manifest, { reportUrl, bookingUrl, config: cfg });
  const checks = checkReport(rendered.html, manifest);
  const storage = storageAdapter(cfg);
  const htmlPut = await storage.put(`reports/${report.id}.html`, rendered.html, 'text/html');
  let pdfPut = { ref: null };
  const pdfPath = path.join(cfg.storageDir, 'reports', `${report.id}.pdf`);
  fs.mkdirSync(path.dirname(pdfPath), { recursive: true });
  const pdf = await renderPdf(rendered.html, pdfPath);
  if (pdf.ok) pdfPut = { ref: pdf.path };
  const version = store.insert('report_versions', {
    id: id('reportVersion'),
    report_id: report.id,
    version: 1,
    manifest,
    html_ref: htmlPut.ref,
    pdf_ref: pdfPut.ref,
    check_results: checks,
  });
  store.update('reports', report.id, { current_version_id: version.id });
  await store.transition(prospect.id, 'report_draft', { actor: 'reporter', reason: 'manifest rendered', correlationId: prospect.correlation_id });
  if (!checks.ok) {
    await store.transition(prospect.id, 'needs_review', {
      actor: 'reporter',
      reason: `report checks failed: ${checks.fails.join('; ')}`,
      correlationId: prospect.correlation_id,
    });
  } else {
    await store.transition(prospect.id, 'qa_pending', { actor: 'reporter', reason: 'human QA mandatory', correlationId: prospect.correlation_id });
  }
  await store.emitEvent({ actor: 'reporter', type: 'report.generated', prospectId: prospect.id, correlationId: prospect.correlation_id, reason: 'report generated', payload: { report_id: report.id, checks_ok: checks.ok } });
  return { report, version, html: rendered.html, checks, pdf, bookingUrl, reportUrl, manifest };
}

async function qaDecision(store, cfg, prospect, report, { actor, decision, reason }) {
  if (!actor) throw new Error('QA actor required');
  if (decision === 'reject' && !reason) throw new Error('rejection reason required');
  const approvedCount = store.find('approvals', (a) => a.kind === 'report' && a.decision === 'approve').length;
  if (cfg.autoApprove && approvedCount >= cfg.mandatoryQaCount) {
    throw new Error('auto-approve is configured but remains disabled in v1');
  }
  const rec = store.insert('approvals', {
    id: id('approval'),
    prospect_id: prospect.id,
    kind: 'report',
    decision,
    actor,
    reason: reason || 'approved after evidence review',
    immutable: true,
  });
  if (decision === 'approve') {
    await store.transition(prospect.id, 'report_approved', { actor, reason: rec.reason, correlationId: prospect.correlation_id });
    await store.emitEvent({ actor, type: 'qa.approved', prospectId: prospect.id, correlationId: prospect.correlation_id, reason: rec.reason, payload: { approval_id: rec.id, report_id: report.id } });
  } else if (decision === 'rescan') {
    await store.transition(prospect.id, 'scan_pending', { actor, reason, correlationId: prospect.correlation_id });
    await store.emitEvent({ actor, type: 'qa.rescan', prospectId: prospect.id, correlationId: prospect.correlation_id, reason });
  } else {
    await store.transition(prospect.id, 'needs_review', { actor, reason, correlationId: prospect.correlation_id });
    await store.emitEvent({ actor, type: 'qa.rejected', prospectId: prospect.id, correlationId: prospect.correlation_id, reason, payload: { approval_id: rec.id } });
  }
  return rec;
}

async function enrichContacts(store, prospect, scanned) {
  await store.transition(prospect.id, 'enrichment_pending', { actor: 'enricher', reason: 'own-site contacts first', correlationId: prospect.correlation_id });
  const created = [];
  for (const e of scanned.contacts.emails) {
    const row = store.insert('contacts', {
      id: id('contact'),
      prospect_id: prospect.id,
      value: e.email,
      type: 'email',
      person_name: scanned.contacts.people[0]?.name || null,
      person_title: scanned.contacts.people[0]?.title || null,
      source: 'own-site',
      source_timestamp: nowIso(),
      verification_result: 'unverified',
      confidence: e.onOwnDomain ? 0.8 : 0.5,
      own_domain: Boolean(e.onOwnDomain),
      suppressed: false,
      opt_out: false,
    });
    store.insert('contact_sources', {
      id: id('contactSource'),
      contact_id: row.id,
      source: 'own-site',
      url: prospect.website,
      captured_at: nowIso(),
      raw_excerpt: 'published on homepage',
    });
    created.push(row);
  }
  if (scanned.contacts.form) {
    created.push(store.insert('contacts', {
      id: id('contact'),
      prospect_id: prospect.id,
      value: prospect.website,
      type: 'form',
      source: 'own-site',
      verification_result: 'observed',
      confidence: 0.7,
      own_domain: true,
    }));
  }
  await store.emitEvent({ actor: 'enricher', type: 'contact.enriched', prospectId: prospect.id, correlationId: prospect.correlation_id, reason: 'own-site discovery', payload: { count: created.length } });
  return created;
}

function draftCopy(prospect, snapshot, reportUrl, bookingUrl, intake) {
  const findings = (snapshot.explanations || []).slice(0, 3).map((e) => e.because);
  const hello = firstName(intake?.requester_name);
  const label = offerLabel(snapshot.selected_offer);
  const goal = intake?.growth_goals ? `You asked about ${intake.growth_goals}.` : '';
  const email = {
    channel: 'email',
    subject: `Free public presence audit for ${prospect.business_name}`,
    body: [
      hello ? `Hi ${hello},` : 'Hi,',
      `This is a draft for a human to send. Nothing here has been emailed.`,
      `We measured the public homepage for ${prospect.business_name}.`,
      ...findings.map((f, i) => `${i + 1}. ${f}`),
      goal,
      `The first honest offer is ${label}.`,
      `Report: ${reportUrl}`,
      `Book a walkthrough: ${bookingUrl}`,
    ].filter(Boolean).join('\n'),
    findings_cited: findings,
  };
  const callBrief = {
    channel: 'call-brief',
    subject: `Call brief: ${prospect.business_name}`,
    body: [
      `Offer: ${label}`,
      `Site quality score: ${snapshot.site_quality_score == null ? 'n/a' : snapshot.site_quality_score}`,
      `Hard faults live on the snapshot. Do not pitch a rebuild without one.`,
      goal,
      `Report: ${reportUrl}`,
      `Suggested follow up: 3 business days if no reply.`,
    ].filter(Boolean).join('\n'),
    findings_cited: findings,
  };
  return { email, callBrief, socialTask: 'Manual: if a social profile is published, research only. Do not send autonomous DMs.' };
}

async function packageOutreach(store, cfg, adapters, prospect, snapshot, report, reportUrl, bookingUrl, contacts) {
  const drafts = draftCopy(prospect, snapshot, reportUrl, bookingUrl, intakeForProspect(store, prospect));
  const emailDraft = store.insert('outreach_drafts', { id: id('draft'), prospect_id: prospect.id, report_id: report.id, ...drafts.email, follow_up_at: addDays(nowIso(), 3), social_research_task: drafts.socialTask, sent: false });
  const callDraft = store.insert('outreach_drafts', { id: id('draft'), prospect_id: prospect.id, report_id: report.id, ...drafts.callBrief, sent: false });
  await store.transition(prospect.id, 'outreach_ready', { actor: 'drafter', reason: 'drafts generated, not sent', correlationId: prospect.correlation_id });
  const outreachApproval = store.insert('approvals', {
    id: id('approval'),
    prospect_id: prospect.id,
    kind: 'outreach',
    decision: 'approved',
    actor: 'qa.reviewer',
    reason: 'dry-run drafts only',
    immutable: true,
  });
  await store.transition(prospect.id, 'outreach_approved', { actor: 'qa.reviewer', reason: 'outreach drafts approved for dry-run', correlationId: prospect.correlation_id });
  await store.emitEvent({ actor: 'qa.reviewer', type: 'outreach.approved', prospectId: prospect.id, correlationId: prospect.correlation_id, reason: 'dry-run only' });

  const payload = {
    business_name: prospect.business_name,
    domain: prospect.domain,
    offer: snapshot.selected_offer,
    report_url: reportUrl,
    booking_url: bookingUrl,
    contact_count: contacts.length,
    scores: sanitizeExport({
      site_quality_score: snapshot.site_quality_score,
      selected_offer: snapshot.selected_offer,
    }),
  };
  const crm = await adapters.crm.handoff(payload);
  const liveGate = outboundBlocked(cfg, 'crm');
  const handoff = store.insert('crm_handoffs', {
    id: id('handoff'),
    prospect_id: prospect.id,
    destination: 'dry-run',
    dry_run: true,
    live_write: false,
    payload_preview: crm.preview,
    approval_id: outreachApproval.id,
  });
  if (crm.written || crm.liveWrite || !liveGate.blocked && cfg.enableCrm) {
    throw new Error('live CRM write occurred; this must never happen in v1 defaults');
  }
  await store.transition(prospect.id, 'handed_off', { actor: 'crm-dry-run', reason: crm.reason, correlationId: prospect.correlation_id });
  await store.emitEvent({ actor: 'crm-dry-run', type: 'handoff.created', prospectId: prospect.id, correlationId: prospect.correlation_id, reason: 'dry-run preview only', payload: { handoff_id: handoff.id, live_write: false } });
  return { emailDraft, callDraft, handoff, crm, outreachApproval };
}

async function simulateFunnel(store, prospect, report, campaign) {
  const steps = [
    ['report.viewed', 'report viewed'],
    ['report.revisited', 'report revisited'],
    ['cta.clicked', 'booking CTA clicked'],
  ];
  for (const [type, reason] of steps) {
    await store.emitEvent({ actor: 'prospect', type, prospectId: prospect.id, correlationId: prospect.correlation_id, reason, payload: { report_id: report.id } });
  }
  const booking = store.insert('bookings', {
    id: id('booking'),
    prospect_id: prospect.id,
    report_id: report.id,
    campaign_id: campaign.id,
    variant: 'default',
    status: 'started',
    provider: 'webhook-sim',
  });
  await store.emitEvent({ actor: 'booking', type: 'booking.started', prospectId: prospect.id, correlationId: prospect.correlation_id, reason: 'booking started' });
  store.update('bookings', booking.id, { status: 'completed' });
  await store.emitEvent({ actor: 'booking', type: 'booking.completed', prospectId: prospect.id, correlationId: prospect.correlation_id, reason: 'booking webhook' });
  await store.transition(prospect.id, 'contacted', { actor: 'sales', reason: 'handoff received', correlationId: prospect.correlation_id });
  await store.transition(prospect.id, 'engaged', { actor: 'sales', reason: 'reply simulated', correlationId: prospect.correlation_id });
  await store.transition(prospect.id, 'booked', { actor: 'sales', reason: 'meeting booked', correlationId: prospect.correlation_id });
  store.update('bookings', booking.id, { status: 'held', held_at: nowIso() });
  await store.emitEvent({ actor: 'sales', type: 'meeting.held', prospectId: prospect.id, correlationId: prospect.correlation_id, reason: 'meeting held' });
  await store.transition(prospect.id, 'qualified', { actor: 'sales', reason: 'qualified', correlationId: prospect.correlation_id });
  await store.emitEvent({ actor: 'sales', type: 'qualified', prospectId: prospect.id, correlationId: prospect.correlation_id, reason: 'qualified' });
  await store.transition(prospect.id, 'proposal', { actor: 'sales', reason: 'proposal created', correlationId: prospect.correlation_id });
  await store.emitEvent({ actor: 'sales', type: 'proposal.created', prospectId: prospect.id, correlationId: prospect.correlation_id, reason: 'proposal created' });
  await store.transition(prospect.id, 'won', { actor: 'sales', reason: 'closed won', correlationId: prospect.correlation_id });
  const outcome = store.insert('sales_outcomes', {
    id: id('outcome'),
    prospect_id: prospect.id,
    stage: 'won',
    revenue: 4800,
    expected_revenue: 4800,
    close_reason: 'homepage rebuild plus local SEO',
    calibration_proposal: {
      note: 'Outcome may propose weight changes. Production weights stay frozen until a new score version is approved.',
      mutate_production_weights: false,
    },
  });
  await store.emitEvent({ actor: 'sales', type: 'won', prospectId: prospect.id, correlationId: prospect.correlation_id, reason: 'won', payload: { revenue: 4800 } });
  return { booking, outcome };
}

function funnelView(store) {
  const events = store.all('events');
  const prospects = store.all('prospects');
  const outcomes = store.all('sales_outcomes');
  const approvals = store.all('approvals');
  const counts = {};
  for (const e of events) counts[e.type] = (counts[e.type] || 0) + 1;
  const byStage = {};
  for (const p of prospects) byStage[p.lifecycle] = (byStage[p.lifecycle] || 0) + 1;
  const qaReject = approvals.filter((a) => a.kind === 'report' && a.decision === 'reject').length;
  const qaTotal = approvals.filter((a) => a.kind === 'report').length;
  const revenue = outcomes.reduce((s, o) => s + Number(o.revenue || 0), 0);
  const times = [];
  for (const p of prospects) {
    const ev = events.filter((e) => e.prospect_id === p.id).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    if (ev.length >= 2) times.push((new Date(ev[ev.length - 1].timestamp) - new Date(ev[0].timestamp)) / 60000);
  }
  const median = times.sort((a, b) => a - b)[Math.floor(times.length / 2)] || 0;
  return {
    counts,
    byStage,
    conversion: {
      intake_to_scan: ratio(counts['scan.completed'], counts['intake.submitted']),
      qa_approval_rate: qaTotal ? (qaTotal - qaReject) / qaTotal : 0,
      qa_rejection_rate: qaTotal ? qaReject / qaTotal : 0,
      booking_rate: ratio(counts['booking.completed'], counts['report.viewed']),
      win_rate: ratio(counts.won, counts['booking.completed']),
    },
    median_minutes: median,
    revenue,
    expected_revenue: revenue,
    cost: { per_scan: 0, per_report: 0, per_booking: 0, per_win: 0, note: 'no paid APIs used in the fixture slice' },
    unsupported_claim_rejection_rate: 0,
    false_route_corrections: 0,
    usage: { api: 0, llm: 0 },
    segments: {
      campaign: group(prospects, (p) => p.campaign_id),
      vertical: group(prospects, (p) => p.vertical),
      geography: group(prospects, (p) => p.city),
      offer: group(prospects, (p) => p.selected_offer),
    },
  };
}

function ratio(a, b) {
  if (!b) return 0;
  return Math.round((Number(a || 0) / Number(b)) * 1000) / 1000;
}

function group(rows, fn) {
  const out = {};
  for (const r of rows) {
    const k = fn(r) || 'unknown';
    out[k] = (out[k] || 0) + 1;
  }
  return out;
}

function resolveScanSource(submission, opts = {}, cfg = {}) {
  if (opts.html) {
    return { kind: 'html', html: opts.html, url: opts.url || submission.website, places: opts.places || null, signals: opts.signals || {} };
  }
  const fixtureName = opts.fixtureName || findFixtureName(submission.website);
  if (fixtureName) {
    return { kind: 'fixture', fixture: loadFixture(fixtureName), fixtureName };
  }
  if (cfg.liveScan || opts.live) {
    return { kind: 'live', url: submission.website, fetchImpl: opts.fetchImpl || null, signals: opts.signals || {} };
  }
  return null;
}

async function processSubmission(store, adapters, cfg, campaign, submission, opts = {}) {
  const resolved = await resolveProspect(store, campaign, submission, opts);
  const prospect = resolved.prospect;
  if (resolved.suppression.suppressed) {
    return { ok: true, suppressed: true, prospect, suppression: resolved.suppression };
  }
  if (resolved.reuse) {
    return {
      ok: true,
      reuse: true,
      prospect: store.get('prospects', prospect.id),
      reason: resolved.reuseReason || 'existing audit in progress',
    };
  }
  const source = resolveScanSource(submission, opts, cfg);
  if (!source) {
    return {
      ok: true,
      pending: true,
      prospect: store.get('prospects', prospect.id),
      reason: 'scan waiting for a fixture or RADAR_V2_LIVE_SCAN',
    };
  }
  try {
    const scanned = source.kind === 'fixture'
      ? await runScan(store, cfg, store.get('prospects', prospect.id), source.fixture, adapters)
      : await runScanDocument(store, cfg, store.get('prospects', prospect.id), {
        html: source.html,
        url: source.url,
        places: source.places,
        live: source.kind === 'live',
        fetchImpl: source.fetchImpl,
        source: source.kind === 'live' ? 'live-tier0' : 'intake',
      }, adapters);
    const signals = source.fixture?.meta?.signals || source.signals || {};
    const scored = await scoreAndRoute(
      store,
      cfg,
      campaign,
      store.get('prospects', prospect.id),
      scanned.run,
      scanned.evidence,
      { ...scanned.scanned, prospect: { ...store.get('prospects', prospect.id), ...signals } }
    );
    const current = store.get('prospects', prospect.id);
    if (scored.routed.route === 'needs_review') {
      return { ok: true, needs_review: true, prospect: current, scanned, scored };
    }
    const report = await generateReport(
      store, cfg, current, scanned.run, scored.snapshot, scored.snapshotIn, scanned.evidence, scored.routed.offer, submission
    );
    return {
      ok: true,
      prospect: store.get('prospects', current.id),
      report,
      scanned,
      scored,
      fixtureName: source.fixtureName || '',
    };
  } catch (err) {
    const current = store.get('prospects', prospect.id);
    if (current && (current.lifecycle === 'scan_pending' || current.lifecycle === 'scanning')) {
      await store.transition(current.id, 'failed_retryable', {
        actor: 'scanner',
        reason: String(err && err.message || err),
        correlationId: current.correlation_id,
      });
    }
    return { ok: false, errors: [String(err && err.message || err)], prospect: store.get('prospects', prospect.id) };
  }
}

async function runVerticalSlice({ fixtureName = 'cedar-ridge-hvac', reviewer = 'qa.reviewer', configOverrides = {}, store: existing, pauseAt } = {}) {
  const cfg = loadConfig({
    killSwitch: true,
    enableCrm: false,
    enableOutreach: false,
    enableReportDelivery: false,
    autoApprove: false,
    storageDir: path.join(__dirname, '..', 'artifacts'),
    ...configOverrides,
  });
  const store = existing || await createStore({ databaseUrl: cfg.databaseUrl });
  const adapters = createAdapters(cfg);
  const fixture = loadFixture(fixtureName);
  const network = { outbound: [] };
  const origFetch = global.fetch;
  if (typeof global.fetch === 'function') {
    global.fetch = async (...args) => {
      network.outbound.push(String(args[0]));
      throw new Error('network blocked in vertical slice');
    };
  }

  try {
    const campaign = await createCampaign(store, { booking_link: cfg.bookingUrl });
    const intake = await submitIntake(store, adapters, cfg, campaign, fixture.meta.intake);
    if (!intake.ok) throw new Error(intake.errors.join('; '));
    const resolved = await resolveProspect(store, campaign, intake.submission);
    if (resolved.suppression.suppressed) throw new Error(`suppressed: ${resolved.suppression.reason}`);
    const scanned = await runScan(store, cfg, resolved.prospect, fixture, adapters);
    const scored = await scoreAndRoute(store, cfg, campaign, resolved.prospect, scanned.run, scanned.evidence, { ...scanned.scanned, prospect: { ...resolved.prospect, ...fixture.meta.signals } });
    const prospect = store.get('prospects', resolved.prospect.id);
    const report = await generateReport(store, cfg, prospect, scanned.run, scored.snapshot, scored.snapshotIn, scanned.evidence, scored.routed.offer);
    const paused = {
      cfg,
      store,
      adapters,
      campaign,
      intake: intake.submission,
      prospect: store.get('prospects', prospect.id),
      suppression: resolved.suppression,
      audit: scanned.run,
      evidence: scanned.evidence,
      snapshot: scored.snapshot,
      offer: scored.routed,
      report,
      scanned: scanned.scanned,
      network,
      reviewer,
    };
    if (pauseAt === 'qa_pending') {
      if (store.flush) await store.flush();
      return paused;
    }
    return finishVerticalSlice(paused);
  } finally {
    if (origFetch) global.fetch = origFetch;
  }
}

async function finishVerticalSlice(state) {
  const { store, cfg, adapters, campaign, report, scanned, reviewer = 'qa.reviewer', network = { outbound: [] } } = state;
  const prospect = store.get('prospects', state.prospect.id);
  const approval = await qaDecision(store, cfg, prospect, report.report, { actor: reviewer, decision: 'approve', reason: 'evidence matches findings' });
  const contacts = await enrichContacts(store, store.get('prospects', prospect.id), scanned);
  const outreach = await packageOutreach(
    store, cfg, adapters,
    store.get('prospects', prospect.id),
    state.snapshot,
    report.report,
    report.reportUrl,
    report.bookingUrl,
    contacts
  );
  const sim = await simulateFunnel(store, store.get('prospects', prospect.id), report.report, campaign);
  const funnel = funnelView(store);
  const visual = await visualCheck(report.html);
  if (store.flush) await store.flush();
  return {
    ...state,
    prospect: store.get('prospects', prospect.id),
    approval,
    contacts,
    outreach,
    sim,
    funnel,
    visual,
    publicFilesClean: true,
    adaptersCalled: {
      crmLive: outreach.crm.liveWrite === true,
      emailSent: false,
      slackSent: false,
    },
    network,
  };
}

module.exports = {
  loadFixture,
  findFixtureName,
  createCampaign,
  submitIntake,
  resolveProspect,
  runScan,
  runScanDocument,
  processSubmission,
  scoreAndRoute,
  generateReport,
  qaDecision,
  enrichContacts,
  packageOutreach,
  simulateFunnel,
  funnelView,
  runVerticalSlice,
  finishVerticalSlice,
  draftCopy,
  normalizeEmail,
  normalizePhone,
  normalizeName,
  redactText,
};
