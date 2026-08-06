'use strict';

/**
 * Shared 0–100 qualify scorer for Mac's Maps pipeline and the Indeed hiring adapter.
 *
 * Higher score = better candidate for a Tier-A site-factory build.
 * Decay is intentional signal (outdated sites convert better for outreach).
 *
 * SCOPE NOTE (2026-08-06): this scorer judges *prospect fit* from intake rows and
 * an optional harvest. It is not the authority on how good a prospect's existing
 * website is — `lib/grader/` is, and it is the gate that decides whether anyone is
 * contacted at all. Run `bin/grade-list.js` first; this scorer ranks what survives.
 * See `12_Brain/protocols/prospect-grading-gate.md`.
 */

const VERTICAL_FIT = new Set([
  'home-services',
  'hvac',
  'plumbing',
  'roofing',
  'landscaping',
  'legal',
  'medical',
  'dental',
  'spa',
  'wellness',
  'restaurant',
  'hospitality',
  'ecommerce',
  'industrial',
  'cannabis',
  'professional-services',
  'cleaning',
  'real-estate',
]);

function asBool(v) {
  return v === true;
}

function num(v, d = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}

function yearNow() {
  return new Date().getUTCFullYear();
}

/**
 * Normalize optional harvest.json (PR #226 shape) into flat decay flags.
 */
function decayFromHarvest(harvest) {
  if (!harvest || typeof harvest !== 'object') {
    return {
      missingViewport: null,
      staleCopyrightYear: null,
      noHttps: null,
      noSchema: null,
      thinCopy: null,
      emptyPhone: null,
      emptyHours: null,
      tableLayout: null,
      slowLoadMs: null,
    };
  }
  const ds = harvest.decaySignals || {};
  const facts = harvest.facts || {};
  const voice = harvest.voice || {};
  const paragraphs = voice.paragraphs || [];
  const siteUrl = harvest.siteUrl || '';
  const copyright = ds.staleCopyrightYear || null;
  const copyrightNum = copyright ? parseInt(copyright, 10) : null;
  const stale =
    copyrightNum && yearNow() - copyrightNum >= 3
      ? true
      : copyrightNum
        ? false
        : null;

  return {
    missingViewport: ds.missingViewport === true ? true : ds.missingViewport === false ? false : null,
    staleCopyrightYear: stale,
    rawCopyrightYear: copyright,
    noHttps: Object.prototype.hasOwnProperty.call(ds, 'noHttps')
      ? asBool(ds.noHttps)
      : siteUrl
        ? !/^https:/i.test(siteUrl)
        : null,
    noSchema: Object.prototype.hasOwnProperty.call(ds, 'noSchema')
      ? asBool(ds.noSchema)
      : Array.isArray(facts.jsonLd)
        ? facts.jsonLd.length === 0
        : null,
    thinCopy: Object.prototype.hasOwnProperty.call(ds, 'thinCopy')
      ? asBool(ds.thinCopy)
      : paragraphs.length > 0
        ? paragraphs.join(' ').length < 400
        : null,
    emptyPhone: !facts.phone,
    emptyHours: !facts.hours,
    tableLayout: asBool(ds.tableLayout),
    slowLoadMs: ds.slowLoadMs != null ? num(ds.slowLoadMs, null) : null,
  };
}

/**
 * Score a normalized prospect + optional harvest.
 * Returns { score, reasons, components, suppress }.
 */
function scoreProspect(prospect, { harvest = null, suppressIds = new Set(), suppressDomains = new Set() } = {}) {
  const reasons = [];
  const components = {};
  let score = 0;

  const website = (prospect.website || '').toLowerCase();
  const domain = website.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  const id = prospect.prospect_id || '';

  if (suppressIds.has(id) || (domain && suppressDomains.has(domain))) {
    return {
      score: 0,
      reasons: ['suppressed: existing client or prior pipeline'],
      components: { suppressed: true },
      status: 'suppressed',
      suppress: true,
    };
  }

  const decay = decayFromHarvest(harvest);
  // Decay block — up to 40 pts (outdated = good target)
  let decayPts = 0;
  if (decay.missingViewport === true) {
    decayPts += 10;
    reasons.push('+10 decay: missing viewport');
  }
  if (decay.staleCopyrightYear === true) {
    decayPts += 8;
    reasons.push(`+8 decay: stale copyright ${decay.rawCopyrightYear}`);
  }
  if (decay.noHttps === true) {
    decayPts += 8;
    reasons.push('+8 decay: no https');
  }
  if (decay.noSchema === true) {
    decayPts += 4;
    reasons.push('+4 decay: no schema');
  }
  if (decay.thinCopy === true) {
    decayPts += 4;
    reasons.push('+4 decay: thin homepage copy');
  }
  if (decay.emptyPhone) {
    decayPts += 3;
    reasons.push('+3 decay: empty phone on site');
  }
  if (decay.emptyHours) {
    decayPts += 3;
    reasons.push('+3 decay: empty hours on site');
  }
  if (decay.tableLayout === true) {
    decayPts += 4;
    reasons.push('+4 decay: table layout');
  }
  if (decay.slowLoadMs != null && decay.slowLoadMs > 4000) {
    decayPts += 4;
    reasons.push(`+4 decay: slow load ${decay.slowLoadMs}ms`);
  }
  decayPts = Math.min(40, decayPts);
  components.decay = decayPts;
  score += decayPts;

  // Local visibility / social proof — up to 20
  const reviews = num(prospect.review_count, 0);
  const rating = num(prospect.rating, 0);
  let visibility = 0;
  if (reviews >= 100) {
    visibility += 12;
    reasons.push('+12 ability: 100+ reviews');
  } else if (reviews >= 40) {
    visibility += 9;
    reasons.push('+9 ability: 40+ reviews');
  } else if (reviews >= 15) {
    visibility += 6;
    reasons.push('+6 ability: 15+ reviews');
  } else if (reviews >= 5) {
    visibility += 3;
    reasons.push('+3 ability: 5+ reviews');
  }
  if (rating >= 4.5 && reviews >= 10) {
    visibility += 4;
    reasons.push('+4 proof: rating ≥ 4.5');
  }
  // Gap signal: high reviews but weak site (has decay) already counted; add gap bonus
  if (reviews >= 40 && decayPts >= 15) {
    visibility += 4;
    reasons.push('+4 gap: strong reviews, weak site');
  }
  visibility = Math.min(20, visibility);
  components.visibility = visibility;
  score += visibility;

  // Vertical fit — up to 15
  const vertical = String(prospect.vertical || prospect.category || '')
    .toLowerCase()
    .replace(/\s+/g, '-');
  let vertPts = 0;
  if (VERTICAL_FIT.has(vertical)) {
    vertPts = 15;
    reasons.push(`+15 vertical fit: ${vertical}`);
  } else if (vertical) {
    vertPts = 6;
    reasons.push(`+6 partial vertical: ${vertical}`);
  }
  components.vertical = vertPts;
  score += vertPts;

  // Ad presence — up to 10
  if (prospect.ad_presence === true) {
    components.ads = 10;
    score += 10;
    reasons.push('+10 ad presence: already buying marketing');
  } else {
    components.ads = 0;
  }

  // Has website usable for harvest — up to 5.
  // A missing website used to read as a penalty here ("hard to harvest"), which
  // inverted the strongest signal in the funnel: a business with no site at all is
  // the best target, because the demo is the entire pitch. It now scores the same
  // as having one and is flagged for the no-site build path instead.
  if (website) {
    components.website = 5;
    score += 5;
    reasons.push('+5 has website URL to harvest');
  } else {
    components.website = 5;
    score += 5;
    components.no_site = true;
    reasons.push('+5 no website at all — strongest build target, demo is the whole pitch');
  }

  // Indeed / hiring signal — up to 15 (second discover source)
  const hs = prospect.hiring_signal;
  if (hs && (prospect.source === 'indeed' || hs.source === 'indeed' || hs.role)) {
    let hire = 10;
    reasons.push('+10 hiring signal present');
    if (/marketing|seo|social|content|growth|digital/i.test(hs.role || '')) {
      hire += 5;
      reasons.push('+5 marketing-shaped role');
    }
    hire = Math.min(15, hire);
    components.hiring = hire;
    score += hire;
  } else {
    components.hiring = 0;
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  // A no-website prospect is eligible too; requiring a website here is what kept
  // the best targets out of the build queue.
  let status = 'scored';
  if (score >= 60) status = 'queued_build';
  if (score < 35) status = 'scored';

  return { score, reasons, components, status, suppress: false, decay };
}

module.exports = {
  scoreProspect,
  decayFromHarvest,
  VERTICAL_FIT,
};
