'use strict';

const { gradeSite } = require('../../automation/lib/site-grader');
const { routeOpportunity, REBUILD_CEILING, POLISH_CEILING } = require('../../automation/lib/opportunity');
const { priorityScore, geoWeight } = require('../../automation/lib/radar');

const SCORE_VERSION = 'radar-v2.0.0';

function clamp(n, lo = 0, hi = 100) {
  return Math.max(lo, Math.min(hi, Math.round(n)));
}

function num(v, d = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}

function countAeoGaps(aeoItems) {
  let gaps = 0;
  for (const e of aeoItems || []) {
    const text = `${e.metric || ''} ${e.excerpt || ''}`;
    if (/missing|absent|blocked/i.test(text)) gaps += 1;
    const jsonld = text.match(/jsonld=(\d+)/i);
    if (jsonld && Number(jsonld[1]) === 0) gaps += 1;
    if (/faq=false/i.test(text)) gaps += 1;
    if (/author=false/i.test(text)) gaps += 1;
  }
  return gaps;
}

function coverage(evidenceItems) {
  const classes = new Set((evidenceItems || []).map((e) => e.classification));
  const needed = [
    'reachability', 'technical', 'onpage', 'indexability', 'content',
    'conversion', 'local', 'aeo', 'trust', 'imagery',
  ];
  const hit = needed.filter((c) => classes.has(c)).length;
  return hit / needed.length;
}

/**
 * Build the V2 score snapshot. Reuses SQS + opportunity components.
 * Never stores only a final opaque number.
 */
function scoreAudit({ prospect, audit, evidenceItems = [], contacts = [], gradeOpts = {} }) {
  const grade = gradeSite(audit, gradeOpts);
  const v1 = routeOpportunity(prospect, { audit, grade });
  const sqs = v1.site_quality_score;
  const hardFaults = grade.hard_faults || [];
  const cov = coverage(evidenceItems);
  const explanations = [];

  const rebuild = hardFaults.length
    ? clamp(70 + hardFaults.length * 6 + (sqs == null ? 10 : Math.max(0, 55 - sqs) * 0.4))
    : clamp((sqs == null ? 20 : Math.max(0, 55 - sqs)) * 0.8);
  explanations.push({
    score: 'rebuild_opportunity',
    value: rebuild,
    because: hardFaults.length
      ? `provable hard faults: ${hardFaults.join('; ')}`
      : 'no provable hard fault; rebuild stays ineligible even if the site looks dated',
  });

  const disc = num(grade.dimensions?.discoverability?.score, 50);
  const aeoItems = evidenceItems.filter((e) => e.classification === 'aeo');
  const aeoGaps = countAeoGaps(aeoItems);
  const seoAeo = clamp(100 - disc * 0.45 - aeoGaps * 8);
  explanations.push({
    score: 'seo_aeo_opportunity',
    value: seoAeo,
    because: `discoverability ${disc}/100, ${aeoGaps} AEO readiness gaps (readiness, not live AI visibility)`,
  });

  const reviews = num(prospect.review_count, 0);
  const gbp = prospect.gbp_claimed;
  const local = clamp(
    (gbp === false ? 35 : 10) +
      (reviews > 0 && reviews < 40 ? 25 : reviews >= 40 ? 15 : 8) +
      (num(prospect.rating, 0) >= 4.5 && reviews < 25 ? 20 : 5)
  );
  explanations.push({
    score: 'local_opportunity',
    value: local,
    because: 'review volume is a fit signal, not proof of budget',
  });

  const paid = clamp(
    (prospect.ad_presence === false ? 40 : 10) +
      (reviews >= 25 ? 25 : 8) +
      (sqs != null && sqs >= 70 ? 20 : 5)
  );
  explanations.push({
    score: 'paid_opportunity',
    value: paid,
    because: prospect.ad_presence === true
      ? 'already buying ads; paid is a fit, not a cold open'
      : 'no measured ad presence; opportunity is inferred, not spend',
  });

  const hasCta = audit.hasCta === true || audit.hasPhone === true || audit.hasForm === true;
  const conversion = clamp(
    (hasCta ? 20 : 45) +
      (audit.hasForm === true ? 10 : 25) +
      (num(audit.wordCount, 0) < 150 ? 20 : 5)
  );
  explanations.push({
    score: 'conversion_opportunity',
    value: conversion,
    because: hasCta ? 'a contact path exists; conversion gaps are on-page' : 'no clear CTA or phone action observed',
  });

  const vertPts = num(v1.components?.vertical, 5);
  const geo = geoWeight(prospect);
  const market = clamp(vertPts * 5 + geo * 30);
  explanations.push({
    score: 'market_fit_score',
    value: market,
    because: `vertical component ${vertPts}, geography weight ${geo}`,
  });

  const ownEmail = contacts.some((c) => c.type === 'email' && c.own_domain && !c.suppressed);
  const contactability = clamp(
    (ownEmail ? 55 : 0) +
      (contacts.some((c) => c.type === 'form') ? 20 : 0) +
      (contacts.some((c) => c.type === 'phone') || prospect.has_phone ? 20 : 0) +
      (contacts.some((c) => c.person_name) ? 10 : 0)
  );
  explanations.push({
    score: 'contactability_score',
    value: contactability,
    because: ownEmail ? 'own-domain email published on the business site' : 'no own-domain email; forms/phones only if published',
  });

  const auditConfidence = clamp(
    (num(grade.confidence, 0) * 70 + cov * 30)
  );
  explanations.push({
    score: 'audit_confidence',
    value: auditConfidence,
    because: `grader confidence ${grade.confidence}, evidence coverage ${Math.round(cov * 100)}%`,
  });

  const fakeRow = {
    current: { opportunity: v1.opportunity_score },
    area: prospect.area,
    city: prospect.city,
    market: prospect.market,
    county: prospect.county,
    trend: prospect.trend,
    lifecycle: 'new',
  };
  const basePriority = priorityScore(fakeRow);
  const priority = clamp(basePriority * 0.7 + contactability * 0.15 + market * 0.15);

  const components = {
    site_quality: {
      score: sqs,
      band: v1.site_quality_band,
      dimensions: grade.dimensions || {},
      hard_faults: hardFaults,
      provisional: grade.provisional === true,
      capped: grade.capped === true,
    },
    opportunity_v1: v1.components || {},
    evidence_coverage: cov,
    v1_verdict: v1.verdict,
    v1_offer: v1.offer,
  };

  return {
    score_version: SCORE_VERSION,
    immutable: true,
    site_quality_score: sqs,
    opportunity_score: v1.opportunity_score,
    rebuild_opportunity: rebuild,
    seo_aeo_opportunity: seoAeo,
    local_opportunity: local,
    paid_opportunity: paid,
    conversion_opportunity: conversion,
    market_fit_score: market,
    contactability_score: contactability,
    audit_confidence: auditConfidence,
    priority_score: priority,
    components,
    explanations,
    grade,
    v1,
    hard_faults: hardFaults,
    coverage: cov,
  };
}

module.exports = {
  SCORE_VERSION,
  scoreAudit,
  coverage,
  countAeoGaps,
  REBUILD_CEILING,
  POLISH_CEILING,
};
