'use strict';

const { REBUILD_CEILING, POLISH_CEILING } = require('./scoring.ts');

const OFFERS = [
  'rebuild',
  'seo_aeo',
  'local',
  'paid',
  'conversion',
  'polish',
  'nurture',
];

/**
 * Highest eligible route, not the highest raw score.
 * Rebuild requires a provable hard fault. Strong verified sites cannot get redesign.
 */
function selectOffer(snapshot, { allowedOffers = OFFERS, minCoverage = 0.35 } = {}) {
  const reasons = [];
  const sqs = snapshot.site_quality_score;
  const hard = snapshot.hard_faults || [];
  const grade = snapshot.grade || {};
  const eligible = [];

  if (snapshot.coverage < minCoverage || snapshot.audit_confidence < 40) {
    reasons.push('low evidence coverage routes to needs_review');
    return {
      offer: null,
      route: 'needs_review',
      eligible: [],
      reasons,
    };
  }

  const allow = (offer) => !allowedOffers.length || allowedOffers.includes(offer);

  if (allow('rebuild')) {
    if (hard.length && (sqs == null || sqs <= REBUILD_CEILING || grade.rebuildable === true)) {
      eligible.push({ offer: 'rebuild', score: snapshot.rebuild_opportunity, why: `hard fault: ${hard[0]}` });
    } else {
      reasons.push('rebuild withheld: no provable hard fault');
    }
  }

  const verifiedStrong = sqs != null && sqs >= 70 && grade.provisional !== true && grade.capped !== true;
  if (verifiedStrong) {
    reasons.push(`strong verified website (SQS ${sqs}) cannot receive a redesign offer`);
  }

  if (allow('seo_aeo') && snapshot.seo_aeo_opportunity >= 45) {
    eligible.push({
      offer: 'seo_aeo',
      score: snapshot.seo_aeo_opportunity,
      why: 'AEO findings describe readiness unless live visibility was measured',
    });
  }
  if (allow('local') && snapshot.local_opportunity >= 45) {
    eligible.push({ offer: 'local', score: snapshot.local_opportunity, why: 'local listing / reputation fit' });
  }
  if (allow('paid') && snapshot.paid_opportunity >= 50 && (verifiedStrong || sqs == null || sqs >= POLISH_CEILING - 10)) {
    eligible.push({ offer: 'paid', score: snapshot.paid_opportunity, why: 'paid media fit on a site that can hold traffic' });
  }
  if (allow('conversion') && snapshot.conversion_opportunity >= 50) {
    eligible.push({ offer: 'conversion', score: snapshot.conversion_opportunity, why: 'CTA / form / trust gaps' });
  }
  if (allow('polish') && sqs != null && sqs > REBUILD_CEILING && sqs <= POLISH_CEILING && !verifiedStrong) {
    eligible.push({ offer: 'polish', score: snapshot.conversion_opportunity, why: 'decent site, specific gaps' });
  }

  eligible.sort((a, b) => {
    const rank = { rebuild: 0, seo_aeo: 1, local: 2, paid: 3, conversion: 4, polish: 5 };
    if (a.offer === 'rebuild') return -1;
    if (b.offer === 'rebuild') return 1;
    return (rank[a.offer] ?? 9) - (rank[b.offer] ?? 9) || b.score - a.score;
  });

  if (!eligible.length) {
    reasons.push('no eligible offer; nurture / relationship only');
    return { offer: 'nurture', route: 'nurture', eligible, reasons };
  }

  const chosen = eligible[0];
  reasons.push(`selected ${chosen.offer} as highest eligible route (${chosen.why})`);
  return { offer: chosen.offer, route: chosen.offer, eligible, reasons };
}

module.exports = { OFFERS, selectOffer };
