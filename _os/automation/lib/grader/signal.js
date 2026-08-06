'use strict';

const WEIGHTS = require('./weights.json');
const { scan } = require('./htmlscan');
const { gradeDimensions } = require('./dimensions');

function bandFor(score) {
  if (score == null) return null;
  return WEIGHTS.bands.find((b) => score >= b.min && score <= b.max) || null;
}

/** Distance to the nearest band edge. Small distance = worth a closer look. */
function boundaryDistance(score) {
  if (score == null) return null;
  const edges = WEIGHTS.bands.flatMap((b) => [b.min, b.max + 1]).filter((e) => e > 0 && e < 100);
  return Math.min(...edges.map((e) => Math.abs(score - e)));
}

/**
 * Turn a fetched page into a SIGNAL score.
 * Higher SIGNAL = their current site is already good = worse outreach target.
 */
function scoreSignal(page, { render = null } = {}) {
  const scanned = scan(page.html || '', page.finalUrl || page.requestedUrl || '');

  // A render pass overrides the static guesses it can actually measure.
  if (render) {
    if (render.textLength != null) scanned.words = Math.max(scanned.words, render.words ?? scanned.words);
    if (render.hasViewportBehavior != null) {
      scanned.viewportResponsive = scanned.viewportResponsive || render.hasViewportBehavior;
    }
    if (render.usesModernCss) {
      scanned.modernCss.customProps = scanned.modernCss.customProps || render.usesModernCss.customProps;
      scanned.modernCss.grid = scanned.modernCss.grid || render.usesModernCss.grid;
      scanned.modernCss.flex = scanned.modernCss.flex || render.usesModernCss.flex;
      scanned.modernCss.clamp = scanned.modernCss.clamp || render.usesModernCss.clamp;
    }
    if (render.webfonts) scanned.webfonts = true;
  }

  const { dimensions, ledger } = gradeDimensions({ ...page, render }, scanned);

  let total = 0;
  let determinedMax = 0;
  for (const dim of Object.values(dimensions)) {
    if (dim.score == null) continue;
    total += dim.score;
    determinedMax += dim.max;
  }
  // Confidence is the share of the 100 points this pass could actually judge.
  const confidence = Number(
    (ledger.filter((c) => c.points != null).reduce((a, c) => a + c.max, 0) / ledger.reduce((a, c) => a + c.max, 0)).toFixed(3)
  );

  const raw = determinedMax > 0 ? Math.round(total * (100 / determinedMax)) : null;

  // Craft gate. Stakes checks are what keep a site from being broken; craft
  // checks are what make it good. A site that only clears the stakes cannot
  // climb into a high band, because shipping HTTPS and a viewport tag in 2026
  // is not an achievement — it is the floor.
  const craftChecks = ledger.filter((c) => c.tier === 'craft' && c.points != null);
  const craftAvailable = craftChecks.reduce((a, c) => a + c.max, 0);
  const craftAwarded = craftChecks.reduce((a, c) => a + c.points, 0);
  const craftRatio = craftAvailable > 0 ? Number((craftAwarded / craftAvailable).toFixed(3)) : null;

  let score = raw;
  let cappedBy = null;
  const applyCap = (ceiling, reason, extra = {}) => {
    if (raw == null || ceiling >= score) return;
    score = ceiling;
    cappedBy = { ceiling, rawScore: raw, reason, ...extra };
  };

  if (raw != null && craftRatio != null) {
    const cap = WEIGHTS.craftGate.caps.find((c) => craftRatio >= c.minCraftRatio);
    if (cap) applyCap(cap.ceiling, `only ${Math.round(craftRatio * 100)}% of craft points earned`, { craftRatio });
  }

  // Obsolescence ceiling. These failures are disqualifying rather than costly:
  // a page with no viewport and a marquee is not redeemed by loading fast, and
  // an obsolete page loads fast precisely because it is obsolete.
  const tellIds = WEIGHTS.obsolescenceCeiling.tells;
  const failedTells = ledger.filter((c) => tellIds.includes(c.id) && c.points != null && c.points < c.max);
  if (failedTells.length) {
    const cap = WEIGHTS.obsolescenceCeiling.caps.find((c) => failedTells.length >= c.minTells);
    if (cap) {
      applyCap(cap.ceiling, `${failedTells.length} disqualifying tell(s): ${failedTells.map((t) => t.evidence).join('; ')}`, {
        tells: failedTells.map((t) => ({ id: t.id, evidence: t.evidence })),
      });
    }
  }

  const band = bandFor(score);

  const failures = ledger
    .filter((c) => c.points != null && c.points < c.max)
    .sort((a, b) => b.max - a.max - (b.points - a.points))
    .map((c) => ({ id: c.id, dimension: c.dimension, label: c.label, lost: Number((c.max - c.points).toFixed(2)), evidence: c.evidence }));

  const strengths = ledger
    .filter((c) => c.points != null && c.points === c.max && c.max >= 3)
    .map((c) => ({ id: c.id, dimension: c.dimension, label: c.label, evidence: c.evidence }));

  return {
    score,
    band: band ? band.id : null,
    bandLabel: band ? band.label : null,
    bandMeaning: band ? band.meaning : null,
    rawScore: raw,
    craftRatio,
    cappedBy,
    confidence,
    lowConfidence: confidence < WEIGHTS.confidence.escalateBelow,
    nearBoundary: boundaryDistance(score) != null && boundaryDistance(score) <= WEIGHTS.boundaryMargin,
    inAmbiguousBand: score != null && score >= WEIGHTS.ambiguousBand.low && score <= WEIGHTS.ambiguousBand.high,
    dimensions: Object.fromEntries(
      Object.entries(dimensions).map(([k, v]) => [k, { letter: v.letter, label: v.label, score: v.score, max: v.max, determined: Number(v.determined.toFixed(2)) }])
    ),
    // The three biggest point losses double as the outreach hook.
    topGaps: failures.slice(0, 5),
    strengths: strengths.slice(0, 6),
    checks: ledger,
    scanSummary: {
      words: scanned.words,
      bytesKb: Math.round(scanned.bytes / 1024),
      images: scanned.images.count,
      internalPages: scanned.nav.internalPathCount,
      copyrightYear: scanned.copyrightYear,
      jsonLdTypes: scanned.jsonLd.types.slice(0, 5),
      looksLikeJsShell: scanned.looksLikeJsShell,
      title: scanned.title,
    },
    weightsVersion: WEIGHTS.version,
  };
}

module.exports = { scoreSignal, bandFor, boundaryDistance };
