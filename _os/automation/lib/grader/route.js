'use strict';

/**
 * The funnel. This is the answer to Mac's 2026-08-05 note: "we need the List >
 * Grader ... so we dont contact businesses that dont need a website or social
 * content."
 *
 * Every prospect leaves here in exactly one lane, with the offer that lane
 * carries. A business with a good site does not get a website pitch — it gets a
 * different pitch, or nothing.
 */

const WEIGHTS = require('./weights.json');

const LANES = {
  build: {
    id: 'build',
    rank: 1,
    label: 'Build — no site to beat',
    offer: 'Full site build. They have no website, so the demo is the entire pitch.',
    pitch_website: true,
    action: 'queue_site_factory',
  },
  rebuild: {
    id: 'rebuild',
    rank: 2,
    label: 'Rebuild — site is hurting them',
    offer: 'Full mirror-and-improve rebuild. Lead the outreach with their two worst measured gaps.',
    pitch_website: true,
    action: 'queue_site_factory',
  },
  refresh: {
    id: 'refresh',
    rank: 3,
    label: 'Refresh — dated but working',
    offer: 'Targeted upgrade, not a teardown. Hero, mobile, and speed. Cheaper build, shorter pitch.',
    pitch_website: true,
    action: 'queue_light_build',
  },
  adjacent: {
    id: 'adjacent',
    rank: 4,
    label: 'Adjacent offer — site is fine',
    offer: 'Do not pitch a website. Pitch what the grade shows is actually missing: GBP, social content, 360 tour, ads, or AEO.',
    pitch_website: false,
    action: 'route_to_non_web_offer',
  },
  hands_off: {
    id: 'hands_off',
    rank: 5,
    label: 'Hands off — nothing to sell here',
    offer: 'No offer. Their site is excellent and a cold pitch costs us credibility.',
    pitch_website: false,
    action: 'suppress',
  },
  park: {
    id: 'park',
    rank: 6,
    label: 'Park — not worth a build',
    offer: 'Site needs work but the business cannot carry the spend. Park until something changes.',
    pitch_website: false,
    action: 'park',
  },
  enrich: {
    id: 'enrich',
    rank: 5,
    label: 'Enrich — site side says go, money side unknown',
    offer: 'The website gap is real. Pull reviews, rating, and ad presence, then this routes itself.',
    pitch_website: null,
    action: 'enrich_then_regrade',
  },
  manual: {
    id: 'manual',
    rank: 7,
    label: 'Manual review — grader could not decide',
    offer: 'A human opens the site. The grader refuses to guess.',
    pitch_website: null,
    action: 'human_review',
  },
  suppressed: {
    id: 'suppressed',
    rank: 8,
    label: 'Suppressed — already ours',
    offer: 'Existing client, active deal, or previously mailed.',
    pitch_website: false,
    action: 'suppress',
  },
};

/** Which non-web offer the gaps point at, for the adjacent lane. */
function adjacentOffer(signal) {
  if (!signal) return 'GBP and social content audit';
  const failed = new Set((signal.topGaps || []).map((g) => g.id));
  const picks = [];
  if (failed.has('structuredData') || failed.has('napOnPage') || failed.has('crawlFiles')) picks.push('local SEO and AEO cleanup (schema, NAP, crawlability)');
  if (failed.has('imageCraft') || failed.has('heroPresence')) picks.push('photography and 360 tour');
  if (failed.has('socialProof')) picks.push('social content program');
  if (failed.has('primaryCta') || failed.has('contactPath')) picks.push('conversion and booking flow');
  if (failed.has('responseTime') || failed.has('htmlWeight')) picks.push('performance tune-up');
  if (!picks.length) picks.push('GBP content and paid search, since the site itself is not the gap');
  return picks.slice(0, 2).join(' + ');
}

/**
 * @param {object} args
 * @param {string} args.state resolve() state
 * @param {object|null} args.signal scoreSignal() result
 * @param {object} args.viability scoreViability() result
 * @returns {object} lane decision
 */
function route({ state, signal, viability, rendered = false }) {
  const minV = WEIGHTS.lanes.minViability;
  const v = viability.score;
  // "We have not enriched this row yet" is not the same as "we judged them and
  // said no." Only a known-low viability parks a prospect.
  const moneyKnown = viability.enriched;
  const affordable = moneyKnown ? v >= minV : null;

  // Shared handling for every state where there is no site to beat. No website
  // is the strongest signal in the whole system, so it never gets parked on a
  // guess: unenriched rows go to enrich, known-poor rows go to park.
  const noSiteLane = (why) => {
    if (affordable === false) return { lane: LANES.park, why: `${why}, but viability ${v} is below the ${minV} floor` };
    if (affordable === null) return { lane: LANES.enrich, why: `${why} — confirm ability to pay, then build` };
    return { lane: LANES.build, why };
  };

  const decide = () => {
    if (viability.suppressed) return { lane: LANES.suppressed, why: 'On the suppress list' };

    if (state === 'no-site') return noSiteLane('No website on record');
    if (state === 'social-only') return noSiteLane('Social profile only, no site of their own');
    if (state === 'directory-only') return noSiteLane('Only third-party directory listings');
    if (state === 'platform-stub') return noSiteLane('Builder stub, not a real site');
    if (state === 'dead') return noSiteLane('Domain on file does not resolve or serve a page');

    // States where grading is unsafe. Never guess into an outreach decision.
    if (state === 'blocked') return { lane: LANES.manual, why: 'Bot wall blocked the grade — could be an excellent site' };
    if (state === 'unverified-owner') return { lane: LANES.manual, why: 'Could not confirm the domain belongs to this business' };
    // A client-rendered site graded from static HTML scores like an empty page.
    // Refuse the number until a render pass has actually seen it.
    if (state === 'js-shell' && !rendered) {
      return { lane: LANES.manual, why: 'Client-rendered site: static HTML is not the page, needs a render pass' };
    }

    if (!signal || signal.score == null) return { lane: LANES.manual, why: 'No usable grade' };
    if (signal.lowConfidence) return { lane: LANES.manual, why: `Only ${Math.round(signal.confidence * 100)}% of checks were determinable` };

    const s = signal.score;
    // The excellent band suppresses outreach regardless of what they can pay.
    if (s >= 80) return { lane: LANES.hands_off, why: `SIGNAL ${s} — already an excellent site` };
    if (affordable === false) return { lane: LANES.park, why: `SIGNAL ${s} but viability ${v} is below the ${minV} floor` };
    if (s >= 65) return { lane: LANES.adjacent, why: `SIGNAL ${s} — site is solid, the gap is elsewhere` };
    if (affordable === null) {
      return { lane: LANES.enrich, why: `SIGNAL ${s} — ${s >= 45 ? 'dated' : 'weak'} site, but ability to pay is unknown` };
    }
    if (s >= 45) return { lane: LANES.refresh, why: `SIGNAL ${s} — dated, not broken` };
    return { lane: LANES.rebuild, why: `SIGNAL ${s} — real gaps a rebuild fixes` };
  };

  const { lane, why } = decide();

  // Opportunity: how much headroom a rebuild would actually create.
  const opportunity = state === 'live' || state === 'js-shell' ? (signal && signal.score != null ? 100 - signal.score : null) : 100;
  // Priority orders the weekly 25. Opportunity is meaningless without the money
  // to act on it, so it is a product, not a sum.
  const priority = opportunity == null ? null : Math.round((opportunity / 100) * (v / 100) * 100);

  return {
    lane: lane.id,
    lane_label: lane.label,
    lane_rank: lane.rank,
    pitch_website: lane.pitch_website,
    action: lane.action,
    offer: lane.id === 'adjacent' ? `${lane.offer} Best fit here: ${adjacentOffer(signal)}.` : lane.offer,
    why,
    opportunity,
    // An unenriched guess should never outrank a prospect we actually know.
    priority:
      lane.pitch_website === false || lane.id === 'manual' || lane.id === 'park'
        ? 0
        : lane.id === 'enrich'
          ? Math.round((priority || 0) * 0.7)
          : priority,
    outreach_eligible: lane.id === 'build' || lane.id === 'rebuild' || lane.id === 'refresh',
    needs_enrichment: lane.id === 'enrich',
  };
}

module.exports = { route, LANES, adjacentOffer };
