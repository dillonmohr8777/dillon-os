'use strict';

/**
 * Opportunity Score + offer routing.
 *
 * The Site Quality Score (./site-grader.js) answers "how good is their site?"
 * This file answers the question that actually spends money: "what do we do
 * about it?"
 *
 * The reason this is a router and not a filter: Mac's objection was that some
 * prospects already have really great websites. The naive fix is to drop them.
 * That throws away the best-qualified businesses on the list — a company with a
 * genuinely excellent site has already proven it invests in marketing, which is
 * exactly who you want to sell Google Ads, Meta Ads, local SEO, and GBP content
 * to. Those are services Momentum and Dillon already sell.
 *
 * So a high Site Quality Score does not disqualify a prospect. It changes the
 * offer:
 *
 *   rebuild   site is dated/decayed + business can pay  -> Tier-A demo site, direct mail + QR
 *   polish    site is decent with specific gaps         -> landing page / CRO engagement
 *   ads_seo   site is strong but nobody can find them   -> Google Ads / local SEO / GBP
 *   nurture   strong site AND strong visibility         -> relationship, no cold pitch
 *   enrich    not enough evidence to decide             -> deepen the audit, re-run
 *   suppress  existing client / prior contact / no site -> out of the pool
 *
 * Only `rebuild` consumes a site-factory build slot. That is the saving.
 */

const { gradeSite } = require('./site-grader');

/** Verticals with a Momentum industry page + case study. Mirrors Market Roster. */
const STRONG_VERTICALS = new Set([
  'home-services', 'hvac', 'plumbing', 'roofing', 'landscaping', 'concrete',
  'electrical', 'electrician', 'painting', 'construction', 'contractor',
  'remodeling', 'dryer-vent', 'janitorial', 'cleaning', 'restoration', 'paving',
  'medical', 'medical-healthcare', 'dental', 'dentist', 'chiropractic',
  'dermatology', 'plastic-surgery', 'podiatry', 'optometry', 'veterinary',
  'spa', 'wellness', 'salon', 'med-spa',
  'legal', 'law-firm', 'attorney',
  'industrial', 'manufacturing', 'fabrication', 'metalwork', 'machining',
  'cannabis', 'dispensary',
  'multi-location', 'franchise',
]);

const MEDIUM_VERTICALS = new Set([
  'restaurant', 'bar', 'gastropub', 'brewery', 'cafe', 'coffee', 'bakery',
  'specialty-foods', 'ice-cream', 'hospitality', 'catering', 'food-truck',
  'professional-services', 'accounting', 'insurance', 'consulting',
  'real-estate', 'fitness', 'gym', 'auto-repair', 'towing',
  'arts-culture', 'historic-site', 'botanical-garden', 'venue', 'retail',
]);

/** Score bands that make a rebuild pitch land vs. insult. */
const REBUILD_CEILING = 55;   // at or below: rebuild is an obvious upgrade
const POLISH_CEILING = 74;    // 56–74: fixable, sell a page not a site
const MIN_CONFIDENCE = 0.5;   // below this we do not route, we enrich

function num(v, d = null) {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}

function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n));
}

function normVertical(v) {
  return String(v || '')
    .toLowerCase()
    .trim()
    .replace(/&/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function verticalTier(vertical) {
  const v = normVertical(vertical);
  if (!v) return { tier: 'unknown', pts: 4 };
  if (STRONG_VERTICALS.has(v)) return { tier: 'strong', pts: 15 };
  if (MEDIUM_VERTICALS.has(v)) return { tier: 'medium', pts: 9 };
  // Match on the head token too: "heavy-steel-fabrication" -> fabrication.
  for (const part of v.split('-')) {
    if (STRONG_VERTICALS.has(part)) return { tier: 'strong', pts: 15 };
    if (MEDIUM_VERTICALS.has(part)) return { tier: 'medium', pts: 9 };
  }
  return { tier: 'weak', pts: 5 };
}

/**
 * Ability to pay — 0–30. Review volume and footprint as revenue proxies, plus
 * the strongest signal of all: they already buy marketing.
 */
function abilityToPay(p, reasons) {
  let pts = 0;
  const reviews = num(p.review_count, 0);
  const rating = num(p.rating, 0);

  if (reviews >= 300) { pts += 12; reasons.push('+12 pay: 300+ reviews — high volume business'); }
  else if (reviews >= 100) { pts += 10; reasons.push('+10 pay: 100+ reviews'); }
  else if (reviews >= 40) { pts += 7; reasons.push('+7 pay: 40+ reviews'); }
  else if (reviews >= 15) { pts += 4; reasons.push('+4 pay: 15+ reviews'); }
  else if (reviews > 0) { pts += 1; reasons.push('+1 pay: few reviews'); }

  if (p.ad_presence === true) { pts += 10; reasons.push('+10 pay: already buying ads'); }
  const locations = num(p.location_count, 1);
  if (locations >= 3) { pts += 6; reasons.push(`+6 pay: ${locations} locations`); }
  else if (locations === 2) { pts += 3; reasons.push('+3 pay: 2 locations'); }
  if (num(p.employee_count, 0) >= 20) { pts += 3; reasons.push('+3 pay: 20+ employees'); }
  if (p.hiring_signal) { pts += 2; reasons.push('+2 pay: actively hiring'); }
  if (rating >= 4.5 && reviews >= 25) { pts += 2; reasons.push('+2 pay: 4.5+ rating with volume'); }

  return clamp(pts, 0, 30);
}

/**
 * Visibility gap — 0–20. A well-reviewed business with a weak web presence has
 * demand we can capture. This is also the signal that makes ads/SEO the right
 * offer for a prospect whose site is already good.
 */
function visibilityGap(p, sqs, reasons) {
  let pts = 0;
  const reviews = num(p.review_count, 0);
  const rating = num(p.rating, 0);

  if (reviews >= 40 && sqs != null && sqs <= REBUILD_CEILING) {
    pts += 10;
    reasons.push('+10 gap: real reputation, weak website');
  }
  if (p.gbp_claimed === false) { pts += 6; reasons.push('+6 gap: Google Business Profile unclaimed'); }
  if (p.local_rank != null && num(p.local_rank, 99) > 10) {
    pts += 5;
    reasons.push(`+5 gap: local rank ${p.local_rank} despite ${reviews} reviews`);
  }
  if (p.ad_presence === false && reviews >= 25) {
    pts += 4;
    reasons.push('+4 gap: no ad presence in a category that buys ads');
  }
  if (reviews > 0 && reviews < 10 && rating >= 4.5) {
    pts += 3;
    reasons.push('+3 gap: great rating, almost no review volume');
  }
  return clamp(pts, 0, 20);
}

/** Reachability — 0–10. Straight from the verified-contacts sheet. */
function reachability(p, reasons) {
  const readiness = String(p.outreach_readiness || '').toUpperCase();
  const hasEmail = p.has_email === true || num(p.email_count, 0) > 0 || /READY/.test(readiness);
  const hasPhone = !!p.phone || p.has_phone === true || /READY|PHONE/.test(readiness);

  if (hasEmail && hasPhone) { reasons.push('+10 reach: verified phone + email'); return 10; }
  if (hasPhone) { reasons.push('+6 reach: verified phone / contact form only'); return 6; }
  if (hasEmail) { reasons.push('+5 reach: email only'); return 5; }
  reasons.push('+0 reach: no verified contact route');
  return 0;
}

/**
 * Route a graded prospect to an offer.
 *
 * @param {object} prospect        normalized prospect row
 * @param {object} [options]
 * @param {object} [options.audit]     site-audit output; graded here if `grade` absent
 * @param {object} [options.grade]     pre-computed gradeSite() result
 * @param {Set}    [options.suppressIds]
 * @param {Set}    [options.suppressDomains]
 * @param {object} [options.thresholds] { rebuildCeiling, polishCeiling, minConfidence, buildFloor }
 */
function routeOpportunity(prospect, options = {}) {
  const p = prospect || {};
  const reasons = [];
  const th = {
    rebuildCeiling: REBUILD_CEILING,
    polishCeiling: POLISH_CEILING,
    minConfidence: MIN_CONFIDENCE,
    buildFloor: 55, // minimum opportunity score to actually consume a build slot
    ...(options.thresholds || {}),
  };

  const website = String(p.website || '').trim();
  const domain = website.replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/\/.*$/, '').toLowerCase();
  const suppressIds = options.suppressIds || new Set();
  const suppressDomains = options.suppressDomains || new Set();

  if (suppressIds.has(p.prospect_id) || (domain && suppressDomains.has(domain))) {
    return {
      verdict: 'suppress',
      offer: 'none',
      opportunity_score: 0,
      site_quality_score: null,
      site_quality_band: 'not-graded',
      confidence: 0,
      reasons: ['suppressed: existing client or prior pipeline contact'],
      components: {},
      next_action: 'none — already in the book',
      grade: null,
    };
  }

  if (p.previously_mailed === true) {
    return {
      verdict: 'suppress',
      offer: 'none',
      opportunity_score: 0,
      site_quality_score: null,
      site_quality_band: 'not-graded',
      confidence: 0,
      reasons: ['suppressed: already mailed in a prior batch'],
      components: {},
      next_action: 'none — do not double-mail',
      grade: null,
    };
  }

  const grade = options.grade || (options.audit ? gradeSite(options.audit, options.gradeOpts) : null);
  const sqs = grade ? grade.score : null;
  const confidence = grade ? grade.confidence : 0;

  if (!website) {
    return {
      verdict: 'rebuild',
      offer: 'first website (no site exists)',
      opportunity_score: clamp(45 + abilityToPay(p, reasons) / 2, 0, 100),
      site_quality_score: 0,
      site_quality_band: 'absent',
      confidence: 1,
      reasons: ['no website at all — the whole offer is "you have no site"', ...reasons],
      components: { replaceability: 40 },
      next_action: 'Confirm they truly have no site (check GBP link), then queue a Tier-A build',
      grade,
    };
  }

  // Replaceability — 0–40, the inverse of site quality. This is the term that
  // stops a great site from earning a build slot.
  let replaceability = 0;
  if (sqs != null) {
    replaceability = Math.round(clamp((100 - sqs) * 0.4, 0, 40));
    reasons.push(`+${replaceability} replaceability: site quality ${sqs}/100 (${grade.band})`);
  }

  const pay = abilityToPay(p, reasons);
  const gap = visibilityGap(p, sqs, reasons);
  const vert = verticalTier(p.vertical || p.category);
  reasons.push(`+${vert.pts} vertical: ${normVertical(p.vertical || p.category) || 'unknown'} (${vert.tier})`);
  const reach = reachability(p, reasons);

  // Absent is not zero — the same rule the grader applies to dimensions.
  //
  // A discovery source like OpenStreetMap carries no review count, rating, ad
  // spend or GBP status. Summing raw points made every such prospect score ~41
  // against a build floor of 55, so the 2026-08-06 run routed 121 genuinely
  // decayed sites to `nurture` for the crime of having no review data attached.
  // Instead, score as a percentage of the maximum available from the signals we
  // actually have, and report how much of the model was backed by real data.
  const MAXIMA = { replaceability: 40, ability_to_pay: 30, visibility_gap: 20, vertical: 15, reachability: 10 };
  // Only fields that can actually carry a positive signal count as "data".
  // `location_count: 1` is the default every discovery row gets — treating it as
  // evidence added 30 points to the denominator that nothing could ever earn,
  // which is what kept 119 decayed sites out of the build queue.
  const hasPayData =
    p.review_count != null || p.rating != null || p.ad_presence != null ||
    num(p.location_count, 1) > 1 || p.employee_count != null || p.hiring_signal != null;
  const hasGapData =
    p.review_count != null || p.gbp_claimed != null || p.local_rank != null || p.ad_presence != null;
  const hasVertical = !!normVertical(p.vertical || p.category);
  const hasReach = !!p.phone || p.has_phone != null || p.has_email != null || p.email_count != null || !!p.outreach_readiness;

  const available = {
    replaceability: sqs != null,
    ability_to_pay: hasPayData,
    visibility_gap: hasGapData,
    vertical: hasVertical,
    reachability: hasReach,
  };
  const earned = { replaceability, ability_to_pay: pay, visibility_gap: gap, vertical: vert.pts, reachability: reach };

  let pointsEarned = 0;
  let pointsPossible = 0;
  const missing = [];
  for (const [k, max] of Object.entries(MAXIMA)) {
    if (available[k]) {
      pointsEarned += earned[k];
      pointsPossible += max;
    } else {
      missing.push(k);
    }
  }
  const components = { ...earned, available, missing_signals: missing };
  // How much of the opportunity model had real data behind it.
  const opportunity_confidence =
    Math.round((pointsPossible / Object.values(MAXIMA).reduce((a, b) => a + b, 0)) * 100) / 100;
  if (missing.length) {
    reasons.push(
      `no data for ${missing.join(', ')} — scored against the ${pointsPossible} points available, not penalised for absence`
    );
  }
  let opportunity = pointsPossible > 0 ? clamp(Math.round((pointsEarned / pointsPossible) * 100), 0, 100) : 0;

  // Route.
  let verdict;
  let offer;
  let next_action;

  if (sqs == null || confidence < th.minConfidence) {
    verdict = 'enrich';
    offer = 'undecided';
    next_action =
      sqs == null
        ? 'Re-audit: no usable evidence. Check the URL, then run Tier 1 (rendered) audit.'
        : `Confidence ${Math.round(confidence * 100)}% is too low to route. Run the Tier 1 rendered audit.`;
    reasons.push(`routing withheld: confidence ${Math.round(confidence * 100)}% < ${Math.round(th.minConfidence * 100)}%`);
  } else if (grade && grade.capped) {
    // Tier 0 found no disqualifying fault, so this site is not a confident
    // rebuild — but markup alone cannot certify it as good either. Routing it
    // either way here is the mistake: `rebuild` risks pitching a redesign to a
    // business with a great site, `ads_seo` risks walking away from a genuine
    // rebuild target. Send it to the render queue instead.
    verdict = 'verify';
    offer = 'undecided — needs a rendered audit';
    next_action = 'Run Tier 1 (rendered) audit: no markup faults found, but design was never seen';
    reasons.push(`score capped at ${sqs} — Tier 0 cannot certify a site as good`);
  } else if (sqs <= th.rebuildCeiling) {
    if (opportunity >= th.buildFloor) {
      verdict = 'rebuild';
      offer = 'Tier-A demo site + direct mail QR';
      next_action = 'Queue a site-factory brief (/mirror-and-improve)';
    } else {
      verdict = 'nurture';
      offer = 'low-cost touch only';
      next_action = `Bad site but opportunity ${opportunity} < build floor ${th.buildFloor} — not worth a build slot`;
      reasons.push(`below build floor: weak ability to pay / reach`);
    }
  } else if (sqs <= th.polishCeiling) {
    verdict = 'polish';
    offer = 'landing page + CRO engagement';
    next_action = 'Pitch a single high-intent landing page, not a full rebuild — their site is decent';
    reasons.push(`site is decent (${sqs}) — a full rebuild pitch would not land`);
  } else {
    // The great-website case. Their site is not the problem.
    const wantsTraffic = gap >= 6 || p.ad_presence !== true || num(p.review_count, 0) < 60;
    if (wantsTraffic) {
      verdict = 'ads_seo';
      offer = 'Google Ads / Meta Ads / local SEO + GBP content';
      next_action = 'Do NOT pitch a rebuild. Pitch traffic: ads, local SEO, GBP content';
      reasons.push(`site is strong (${sqs}) — sell traffic, not a rebuild`);
    } else {
      verdict = 'nurture';
      offer = 'relationship / referral only';
      next_action = 'Strong site and strong visibility — no cold pitch, keep warm';
      reasons.push(`site strong (${sqs}) and visibility healthy — nothing obvious to sell cold`);
    }
    // A great site should never top the priority queue on a rebuild-shaped score.
    opportunity = Math.min(opportunity, 59);
  }

  return {
    verdict,
    offer,
    opportunity_score: opportunity,
    opportunity_confidence,
    site_quality_score: sqs,
    site_quality_band: grade ? grade.band : 'ungraded',
    confidence,
    tier: grade ? grade.tier : 0,
    reasons,
    components,
    next_action,
    grade,
  };
}

/**
 * Decide whether a candidate is worth escalating to a more expensive audit
 * tier. This is what makes the grader iterative instead of one-shot: after
 * Tier 0, most of a 300-row list is already decided.
 *
 * @returns {{escalate:boolean, reason:string}}
 */
function shouldEscalate(route, { tier = 0, thresholds = {} } = {}) {
  const th = { rebuildCeiling: REBUILD_CEILING, polishCeiling: POLISH_CEILING, minConfidence: MIN_CONFIDENCE, ...thresholds };
  const sqs = route.site_quality_score;

  if (tier >= 2) return { escalate: false, reason: 'already at the deepest tier' };
  if (route.verdict === 'suppress') return { escalate: false, reason: 'suppressed' };

  if (sqs == null) return { escalate: true, reason: 'ungraded — needs rendered evidence' };
  if (route.confidence < th.minConfidence) {
    return { escalate: true, reason: `confidence ${Math.round(route.confidence * 100)}% too low to decide` };
  }
  if (route.verdict === 'verify') {
    return { escalate: true, reason: 'Tier 0 found no faults but never saw the design — render required' };
  }

  // Clear-cut cases stop here and save the render.
  if (sqs <= 30) return { escalate: false, reason: `decisively decayed at ${sqs} — no deeper audit needed` };
  if (sqs >= 88) return { escalate: false, reason: `decisively strong at ${sqs} — route to ads/SEO, skip the render` };

  // The band where a render actually changes the decision.
  const nearBoundary =
    Math.abs(sqs - th.rebuildCeiling) <= 15 || Math.abs(sqs - th.polishCeiling) <= 12;
  if (nearBoundary) {
    return { escalate: true, reason: `score ${sqs} sits near a routing boundary — render to confirm` };
  }
  if (tier === 1 && route.verdict === 'rebuild') {
    return { escalate: true, reason: 'rebuild candidate — needs the Tier 2 taste pass before a build slot' };
  }
  return { escalate: false, reason: `score ${sqs} is unambiguous for verdict "${route.verdict}"` };
}

module.exports = {
  routeOpportunity,
  shouldEscalate,
  verticalTier,
  normVertical,
  abilityToPay,
  visibilityGap,
  reachability,
  STRONG_VERTICALS,
  MEDIUM_VERTICALS,
  REBUILD_CEILING,
  POLISH_CEILING,
  MIN_CONFIDENCE,
};
