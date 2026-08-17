'use strict';

/**
 * Google Places enrichment — the ability-to-pay signals OpenStreetMap does not
 * carry.
 *
 * Discovery gives us a business, a vertical and a website. It cannot tell us
 * whether the business can afford us. Without review volume, rating, or evidence
 * they already buy marketing, `opportunity_confidence` in lib/opportunity.js
 * caps at 0.65 and the rebuild queue is ordered purely by how bad the sites are
 * — correct as far as it goes, but blind to who would actually sign.
 *
 * Three things this module is careful about, in order of how much damage the
 * alternative does:
 *
 * 1. **Match verification.** A text search for "Jarman Sales & Service" can
 *    return a national chain with 40,000 reviews. Attributing that to a small
 *    HVAC contractor would rocket it up the queue on borrowed credibility. So a
 *    result is only accepted when the website domain Google returns matches the
 *    domain we already hold. No domain match, no enrichment — we would rather
 *    stay at 0.65 confidence than rank on a wrong identity.
 * 2. **Cost.** Every call is billed. The field mask is kept to exactly what the
 *    opportunity model reads, results are cached in the radar registry with a
 *    `places_checked` date, and the caller decides who is worth enriching —
 *    review counts drift slowly, so a re-check every few months is plenty.
 * 3. **Graceful absence.** With no API key this module reports `skipped` and
 *    changes nothing. The pipeline must never require it.
 *
 * Key comes from GOOGLE_PLACES_API_KEY, injected by the PowerShell wrapper from
 * a DPAPI-protected file — never committed, never logged.
 */

const { httpGet } = require('./net');

const SEARCH_URL = 'https://places.googleapis.com/v1/places:searchText';

/**
 * Exactly the fields the opportunity model reads. Widening this costs money per
 * call for data nothing consumes.
 */
const FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.websiteUri',
  'places.rating',
  'places.userRatingCount',
  'places.businessStatus',
  'places.formattedAddress',
].join(',');

/** Review counts move slowly; this is how long an enrichment stays fresh. */
const CACHE_DAYS = 150;

function normalizeDomain(url) {
  if (!url) return '';
  let s = String(url).trim();
  if (!/^https?:\/\//i.test(s)) s = `https://${s}`;
  try {
    return new URL(s).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return '';
  }
}

/**
 * Do two domains refer to the same business? Exact match, or one is a subdomain
 * of the other. Deliberately strict: a fuzzy match here silently attributes one
 * business's reputation to another.
 */
function domainsMatch(a, b) {
  const x = normalizeDomain(a);
  const y = normalizeDomain(b);
  if (!x || !y) return false;
  if (x === y) return true;
  return x.endsWith(`.${y}`) || y.endsWith(`.${x}`);
}

/** The query text. Name plus locality, because names repeat across a metro. */
function buildQueryText(row) {
  const parts = [row.business_name];
  if (row.city) parts.push(row.city);
  else if (row.area) parts.push(row.area);
  if (row.state) parts.push(row.state);
  else parts.push('PA');
  return parts.filter(Boolean).join(', ');
}

/**
 * Look one prospect up.
 *
 * @param {object} row      { business_name, website|domain, city, area, state }
 * @param {object} [opts]   { apiKey, timeoutMs, fetchImpl }
 * @returns {Promise<{status:string, reason?:string, rating?:number,
 *                    review_count?:number, place_id?:string,
 *                    business_status?:string, matched_name?:string}>}
 *          status: 'ok' | 'no_match' | 'skipped' | 'error'
 */
async function enrichProspect(row, opts = {}) {
  const apiKey = String(opts.apiKey || process.env.GOOGLE_PLACES_API_KEY || '').trim();
  if (!apiKey) return { status: 'skipped', reason: 'no GOOGLE_PLACES_API_KEY set' };

  const ourDomain = row.domain || normalizeDomain(row.website);
  if (!ourDomain) return { status: 'skipped', reason: 'no domain to verify a match against' };

  const fetchImpl = opts.fetchImpl || httpGet;
  const body = JSON.stringify({
    textQuery: buildQueryText(row),
    maxResultCount: 5,
    languageCode: 'en',
    regionCode: 'US',
  });

  let res;
  try {
    res = await fetchImpl(SEARCH_URL, {
      method: 'POST',
      body,
      timeoutMs: opts.timeoutMs || 15000,
      maxBytes: 400_000,
      headers: {
        'content-type': 'application/json',
        'x-goog-api-key': apiKey,
        'x-goog-fieldmask': FIELD_MASK,
      },
      userAgent: 'MomentumSiteGrader/1.0 (prospect enrichment)',
    });
  } catch (err) {
    return { status: 'error', reason: String(err?.message || err).slice(0, 160) };
  }

  if (!res.ok) return { status: 'error', reason: res.error || 'request failed' };

  // `fatal: true` means every remaining lookup will fail the same way, so the
  // caller must stop rather than spend the budget rediscovering it. Google
  // answers a malformed key with 400, not 403 — the first version of this checked
  // only 403/429 and happily burned the whole daily budget on 400s.
  if (res.status === 400) {
    return { status: 'error', fatal: true, reason: 'HTTP 400 — malformed request or invalid API key' };
  }
  if (res.status === 401 || res.status === 403) {
    return {
      status: 'error',
      fatal: true,
      reason: `HTTP ${res.status} — key rejected, or Places API (New) not enabled on the project`,
    };
  }
  if (res.status === 429) {
    return { status: 'error', fatal: true, reason: 'HTTP 429 — quota exceeded, back off' };
  }
  if (res.status !== 200) return { status: 'error', reason: `HTTP ${res.status}` };

  let doc;
  try {
    doc = JSON.parse(res.body);
  } catch (err) {
    return { status: 'error', reason: `unparseable response: ${err.message}` };
  }
  if (doc.error) {
    const code = Number(doc.error.code);
    return {
      status: 'error',
      fatal: code === 400 || code === 401 || code === 403 || code === 429,
      reason: String(doc.error.message || doc.error.status).slice(0, 160),
    };
  }

  const places = Array.isArray(doc.places) ? doc.places : [];
  if (!places.length) return { status: 'no_match', reason: 'no results for the query' };

  // Identity is established by the domain, never by name similarity or position.
  const hit = places.find((pl) => domainsMatch(pl.websiteUri, ourDomain));
  if (!hit) {
    return {
      status: 'no_match',
      reason: `${places.length} result(s), none whose website matches ${ourDomain}`,
      candidates_seen: places.length,
    };
  }

  const out = {
    status: 'ok',
    place_id: hit.id || null,
    matched_name: hit.displayName?.text || '',
    business_status: hit.businessStatus || null,
  };
  if (Number.isFinite(Number(hit.rating))) out.rating = Number(hit.rating);
  if (Number.isFinite(Number(hit.userRatingCount))) out.review_count = Number(hit.userRatingCount);
  return out;
}

/**
 * Is this prospect's enrichment stale enough to re-query?
 * A row that was checked and genuinely had no match is not retried on the same
 * cadence — repeatedly paying to rediscover an absence is waste.
 */
function needsEnrichment(p, { today, cacheDays = CACHE_DAYS } = {}) {
  if (!p) return false;
  if (p.lifecycle === 'client' || p.lifecycle === 'excluded') return false;
  if (!p.places_checked) return true;
  const elapsed = Math.round(
    (new Date(`${today}T00:00:00Z`) - new Date(`${p.places_checked}T00:00:00Z`)) / 86400000
  );
  const window = p.places_status === 'no_match' ? cacheDays * 2 : cacheDays;
  return elapsed >= window;
}

/**
 * Fold an enrichment result onto a registry row. Only ever adds signal; a failed
 * or unmatched lookup records that it was attempted so we do not pay twice, and
 * leaves the ranking exactly as it was.
 */
function applyEnrichment(p, result, { today } = {}) {
  if (!p || !result) return p;
  p.places_checked = today;
  p.places_status = result.status;
  if (result.status !== 'ok') {
    p.places_note = result.reason || '';
    return p;
  }
  if (result.review_count != null) p.review_count = result.review_count;
  if (result.rating != null) p.rating = result.rating;
  if (result.place_id) p.place_id = result.place_id;
  if (result.business_status) p.business_status = result.business_status;
  // Google marking a place permanently closed is decisive, and worth more than
  // any site grade: there is nobody left to pitch.
  if (result.business_status === 'CLOSED_PERMANENTLY') {
    p.lifecycle = 'excluded';
    p.lifecycle_note = 'Google reports this business permanently closed';
  }
  delete p.places_note;
  return p;
}

module.exports = {
  enrichProspect,
  needsEnrichment,
  applyEnrichment,
  domainsMatch,
  buildQueryText,
  normalizeDomain,
  FIELD_MASK,
  CACHE_DAYS,
  SEARCH_URL,
};
