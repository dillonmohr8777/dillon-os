'use strict';

const { id } = require('./ids.ts');

const SECTIONS = [
  'cover',
  'executive_summary',
  'opportunity_scorecard',
  'website_technical_seo',
  'search_architecture',
  'local_seo',
  'competitive_positioning',
  'conversion_trust',
  'paid_media',
  'content_aeo',
  'roadmap_90_day',
  'sources_limitations',
];

const CLAIM_TYPES = ['measured', 'observed', 'inferred', 'recommendation', 'validation_required'];

function finding(partial) {
  if (!CLAIM_TYPES.includes(partial.type)) throw new Error(`invalid claim type ${partial.type}`);
  return {
    id: partial.id || id('evidence').replace('evd_', 'fnd_'),
    section: partial.section,
    claim: partial.claim,
    type: partial.type,
    evidence_ids: partial.evidence_ids || [],
    confidence: partial.confidence ?? 0.7,
    severity: partial.severity || 'info',
    why_it_matters: partial.why_it_matters,
    recommended_action: partial.recommended_action,
    allowed_wording: partial.allowed_wording,
  };
}

function buildManifest({ prospect, snapshot, evidence, offer, auditId, observedAt, config }) {
  const byClass = (c) => evidence.filter((e) => e.classification === c);
  const findings = [];
  const modules = new Set(['cover', 'executive_summary', 'opportunity_scorecard', 'sources_limitations']);

  const tech = byClass('technical').concat(byClass('reachability'), byClass('performance'));
  if (tech.length) {
    modules.add('website_technical_seo');
    const viewport = tech.find((e) => /viewport=false/.test(e.metric));
    const https = tech.find((e) => /https=false/.test(e.metric));
    if (viewport) {
      findings.push(finding({
        section: 'website_technical_seo',
        claim: 'The homepage markup has no viewport meta tag, so phones render a desktop-width page.',
        type: 'measured',
        evidence_ids: [viewport.id],
        confidence: viewport.confidence,
        severity: 'high',
        why_it_matters: 'A missing viewport is a provable hard fault and a rebuild-eligible defect.',
        recommended_action: 'Add a responsive viewport and a mobile-first layout, or replace the site.',
        allowed_wording: 'Homepage HTML does not include a viewport meta tag.',
      }));
    }
    if (https) {
      findings.push(finding({
        section: 'website_technical_seo',
        claim: 'The final URL is not served over HTTPS.',
        type: 'measured',
        evidence_ids: [https.id],
        confidence: https.confidence,
        severity: 'high',
        why_it_matters: 'Browsers warn on HTTP, and forms on HTTP are not trustworthy.',
        recommended_action: 'Enable TLS and redirect HTTP to HTTPS.',
        allowed_wording: 'The audited URL did not terminate on HTTPS.',
      }));
    }
    const perf = byClass('performance')[0];
    if (perf) {
      findings.push(finding({
        section: 'website_technical_seo',
        claim: `Fetch timing and transfer size were recorded (${perf.metric}). This is not a Lighthouse performance score.`,
        type: 'measured',
        evidence_ids: [perf.id],
        confidence: perf.confidence,
        severity: 'info',
        why_it_matters: 'Weight and response time affect both users and crawlers.',
        recommended_action: 'Reduce blocking assets and compress images if the transfer is large.',
        allowed_wording: 'Page weight and response time come from the HTTP fetch used in this audit.',
      }));
    }
  }

  const onpage = byClass('onpage');
  if (onpage.length) {
    modules.add('search_architecture');
    findings.push(finding({
      section: 'search_architecture',
      claim: `Title, meta description, headings, and canonical were read from homepage markup (${onpage[0].metric}).`,
      type: 'measured',
      evidence_ids: [onpage[0].id],
      confidence: onpage[0].confidence,
      severity: 'medium',
      why_it_matters: 'On-page fields are the baseline a search engine is given.',
      recommended_action: 'Write a unique title and meta description that name the service and city.',
      allowed_wording: 'On-page title and description were taken from the homepage HTML.',
    }));
  }

  const local = byClass('local');
  if (local.length && !/not-queried/.test(local[0].metric)) {
    modules.add('local_seo');
    findings.push(finding({
      section: 'local_seo',
      claim: `A Google listing record was attached (${local[0].metric}). Review count is a fit signal, not proof of budget.`,
      type: 'measured',
      evidence_ids: [local[0].id],
      confidence: local[0].confidence,
      severity: 'medium',
      why_it_matters: 'Local pack visibility and reputation affect inbound calls.',
      recommended_action: 'Confirm NAP consistency and a review response cadence.',
      allowed_wording: 'Listing rating and review count come from the configured Places record.',
    }));
  } else if (local.length) {
    findings.push(finding({
      section: 'local_seo',
      claim: 'Google listing identity was not fetched for this run.',
      type: 'validation_required',
      evidence_ids: [local[0].id],
      confidence: 0.3,
      severity: 'info',
      why_it_matters: 'Without a Places match we cannot claim ranking, hours, or review volume.',
      recommended_action: 'Run Places enrichment before a local-SEO pitch.',
      allowed_wording: 'No Google listing was queried in this audit.',
    }));
  }

  const conv = byClass('conversion');
  if (conv.length) {
    modules.add('conversion_trust');
    findings.push(finding({
      section: 'conversion_trust',
      claim: `Published contact routes: ${conv[0].metric}.`,
      type: 'observed',
      evidence_ids: conv.map((e) => e.id),
      confidence: 0.8,
      severity: 'medium',
      why_it_matters: 'If the next step is buried, paid traffic and SEO both leak.',
      recommended_action: 'Put one primary call and form path above the fold.',
      allowed_wording: 'Contact routes were taken from the business homepage markup.',
    }));
  }

  const aeo = byClass('aeo');
  if (aeo.length) {
    modules.add('content_aeo');
    findings.push(finding({
      section: 'content_aeo',
      claim: `AEO readiness signals: ${aeo[0].metric}. This is on-page readiness, not measured AI-engine visibility.`,
      type: 'observed',
      evidence_ids: [aeo[0].id],
      confidence: aeo[0].confidence,
      severity: 'medium',
      why_it_matters: 'Answer engines need entity clarity, schema, and crawlable copy.',
      recommended_action: 'Add LocalBusiness schema, a direct-answer block, and an expert/author identity.',
      allowed_wording: 'No live ChatGPT, Perplexity, or Google AI Overview ranking was measured.',
    }));
  }

  if (offer === 'paid' || snapshot.paid_opportunity >= 50) {
    modules.add('paid_media');
    findings.push(finding({
      section: 'paid_media',
      claim: 'Paid-media opportunity is inferred from site quality and listing fit. Ad spend was not measured.',
      type: 'inferred',
      evidence_ids: (byClass('local')[0] ? [byClass('local')[0].id] : []).concat(onpage[0] ? [onpage[0].id] : []),
      confidence: 0.45,
      severity: 'info',
      why_it_matters: 'A site that can hold a click is a better ads candidate than a dead domain.',
      recommended_action: 'If the site is strong, pitch Google Ads / Meta Ads rather than a rebuild.',
      allowed_wording: 'This audit did not read ad accounts, spend, or impression share.',
    }));
  }

  modules.add('roadmap_90_day');
  findings.push(finding({
    section: 'roadmap_90_day',
    claim: `Priority offer for this audit: ${offer || 'needs review'}.`,
    type: 'recommendation',
    evidence_ids: evidence.slice(0, 3).map((e) => e.id),
    confidence: snapshot.audit_confidence / 100,
    severity: 'info',
    why_it_matters: 'The selected offer is the highest eligible route, not the highest raw score.',
    recommended_action: 'Complete the 90-day sequence in the report only where evidence exists.',
    allowed_wording: `Recommended next service: ${offer || 'human review'}.`,
  }));

  findings.push(finding({
    section: 'sources_limitations',
    claim: 'This audit used public homepage evidence. Private analytics, CMS, Search Console, and ad accounts were not accessed.',
    type: 'validation_required',
    evidence_ids: evidence.slice(0, 1).map((e) => e.id),
    confidence: 1,
    severity: 'info',
    why_it_matters: 'Unsupported numbers would over-claim.',
    recommended_action: 'Request Search Console / GA / ads access before quoting traffic or spend.',
    allowed_wording: 'Private analytics/CMS access required for traffic, conversion, and spend claims.',
  }));

  return {
    schema: 'audit-manifest/v1',
    audit_id: auditId,
    score_version: snapshot.score_version,
    observed_at: observedAt,
    prospect: {
      business_name: prospect.business_name,
      website: prospect.website,
      domain: prospect.domain,
      city: prospect.city,
      state: prospect.state,
      vertical: prospect.vertical,
    },
    scores: {
      site_quality_score: snapshot.site_quality_score,
      opportunity_score: snapshot.opportunity_score,
      rebuild_opportunity: snapshot.rebuild_opportunity,
      seo_aeo_opportunity: snapshot.seo_aeo_opportunity,
      local_opportunity: snapshot.local_opportunity,
      paid_opportunity: snapshot.paid_opportunity,
      conversion_opportunity: snapshot.conversion_opportunity,
      market_fit_score: snapshot.market_fit_score,
      contactability_score: snapshot.contactability_score,
      audit_confidence: snapshot.audit_confidence,
      priority_score: snapshot.priority_score,
    },
    selected_offer: offer,
    modules: [...modules],
    findings,
    evidence: evidence.map((e) => ({
      id: e.id,
      source: e.source,
      url: e.url,
      provider_record_id: e.provider_record_id,
      captured_at: e.captured_at,
      metric: e.metric,
      excerpt: e.excerpt,
      classification: e.classification,
      confidence: e.confidence,
      freshness_expires_at: e.freshness_expires_at,
      artifact_ref: e.artifact_ref,
    })),
    limitations: [
      'No ranking, traffic, ad spend, conversion volume, or AI-engine visibility is claimed unless a configured provider measured it and the evidence is stored.',
      'Private analytics/CMS access required for those metrics.',
      'Review volume is a fit signal, not proof of budget.',
    ],
    brand: {
      name: config.brandName,
      url: config.contactUrl,
      email: config.contactEmail,
    },
    booking: {
      url: config.bookingUrl,
    },
  };
}

module.exports = { SECTIONS, CLAIM_TYPES, buildManifest, finding };
