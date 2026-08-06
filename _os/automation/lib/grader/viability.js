'use strict';

/**
 * The second axis. SIGNAL says whether their site needs work; viability says
 * whether this business is worth the build. Both are needed, because the worst
 * possible outreach target is a one-truck operation with a terrible site and no
 * budget, and the second worst is a great business whose site is already good.
 */

const WEIGHTS = require('./weights.json');

const FULL_FIT = new Set([
  'home-services', 'hvac', 'plumbing', 'roofing', 'electrical', 'landscaping', 'concrete',
  'painting', 'construction', 'cleaning', 'janitorial', 'fence', 'remodeling',
  'medical', 'dental', 'chiropractic', 'podiatry', 'physical-therapy', 'derm', 'plastic-surgery',
  'spa', 'wellness', 'legal', 'law', 'industrial', 'manufacturing', 'fabrication',
  'cannabis', 'multi-location', 'franchise',
]);
const PARTIAL_FIT = new Set([
  'restaurant', 'hospitality', 'food', 'bakery', 'bar', 'cafe', 'retail',
  'professional-services', 'accounting', 'insurance', 'real-estate', 'arts-culture', 'nonprofit',
]);

function normalizeVertical(v) {
  return String(v || '').toLowerCase().trim().replace(/[\s_&/]+/g, '-').replace(/^-|-$/g, '');
}

/**
 * Missing is not zero. Number(null) is 0 and Number('') is 0, so a naive coerce
 * turns "we never pulled review data" into "this business has no reviews" and
 * parks a perfectly good prospect.
 */
function num(v) {
  if (v == null || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/**
 * @returns {{score:number, reasons:string[], components:object, enriched:boolean, suppressed:boolean}}
 */
function scoreViability(prospect, { suppressIds = new Set(), suppressDomains = new Set() } = {}) {
  const cfg = WEIGHTS.viability;
  const reasons = [];
  const components = {};
  let score = 0;

  const domain = String(prospect.website || '')
    .replace(/^https?:\/\//i, '')
    .replace(/[/?#].*$/, '')
    .replace(/^www\./i, '')
    .toLowerCase();

  if (suppressIds.has(prospect.prospect_id) || (domain && suppressDomains.has(domain))) {
    return {
      score: 0,
      reasons: ['suppressed: existing client, active deal, or previously mailed'],
      components: { suppressed: true },
      enriched: true,
      suppressed: true,
    };
  }

  const reviews = num(prospect.review_count);
  const rating = num(prospect.rating);
  let known = 0;

  if (reviews != null) {
    known++;
    const tier = cfg.reviewTiers.find((t) => reviews >= t.min);
    if (tier) {
      score += tier.points;
      components.reviews = tier.points;
      reasons.push(`+${tier.points} ${tier.label}`);
    } else {
      components.reviews = 0;
      reasons.push('no reviews on record');
    }
    if (rating != null && rating >= cfg.ratingBonus.minRating && reviews >= cfg.ratingBonus.minReviews) {
      score += cfg.ratingBonus.points;
      components.rating = cfg.ratingBonus.points;
      reasons.push(`+${cfg.ratingBonus.points} ${cfg.ratingBonus.label}`);
    }
  }

  const vertical = normalizeVertical(prospect.vertical || prospect.category);
  if (vertical) {
    known++;
    if (FULL_FIT.has(vertical)) {
      score += cfg.verticalFit.full;
      components.vertical = cfg.verticalFit.full;
      reasons.push(`+${cfg.verticalFit.full} vertical fit: ${vertical} has an industry page`);
    } else if (PARTIAL_FIT.has(vertical)) {
      score += cfg.verticalFit.partial;
      components.vertical = cfg.verticalFit.partial;
      reasons.push(`+${cfg.verticalFit.partial} partial fit: ${vertical}`);
    } else {
      components.vertical = 0;
      reasons.push(`unmapped vertical: ${vertical}`);
    }
  }

  if (prospect.ad_presence === true) {
    known++;
    score += cfg.adPresence;
    components.ads = cfg.adPresence;
    reasons.push(`+${cfg.adPresence} already buying ads`);
  }
  if (prospect.multi_location === true || num(prospect.location_count) > 1) {
    known++;
    score += cfg.multiLocation;
    components.multiLocation = cfg.multiLocation;
    reasons.push(`+${cfg.multiLocation} multiple locations`);
  }
  if (prospect.has_phone || prospect.public_email_count > 0) {
    known++;
    score += cfg.contactable;
    components.contactable = cfg.contactable;
    reasons.push(`+${cfg.contactable} reachable contact route on file`);
  }
  if (prospect.photography_available === true) {
    score += cfg.photographyAvailable;
    components.photography = cfg.photographyAvailable;
    reasons.push(`+${cfg.photographyAvailable} usable photography available`);
  }
  const hs = prospect.hiring_signal;
  if (hs && /marketing|seo|social|content|growth|digital/i.test(hs.role || '')) {
    known++;
    score += cfg.hiringMarketing;
    components.hiring = cfg.hiringMarketing;
    reasons.push(`+${cfg.hiringMarketing} hiring a marketing role`);
  }

  const enriched = known >= 3;
  if (!enriched && score < cfg.unknownFloor) {
    reasons.push(`floored at ${cfg.unknownFloor}: too little known to judge, needs enrichment`);
    score = cfg.unknownFloor;
  }

  return {
    score: Math.max(0, Math.min(cfg.max, Math.round(score))),
    reasons,
    components,
    enriched,
    suppressed: false,
  };
}

module.exports = { scoreViability, normalizeVertical, FULL_FIT, PARTIAL_FIT };
