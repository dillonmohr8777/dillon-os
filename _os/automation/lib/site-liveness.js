'use strict';

/**
 * Decide whether a prospect's recorded URL still serves a real website.
 *
 * Measured across 150 never-audited registry rows, ~39% did not: parked
 * 114-byte pages whose whole body is `window.onload=...href="/lander"`,
 * 169-byte placeholder shells, suspended accounts, dead hosts. The radar had
 * no notion of this, and the consequence was worse than wasted requests --
 * `priority_score` rewards a broken site, and a parked domain grades as
 * maximally broken, so the deadest rows in the registry sorted to the top and
 * consumed the daily logo budget first.
 *
 * A not-live verdict is a hold on *that URL*, never a judgement about the
 * business. Companies move hosts and let domains lapse, so the state carries a
 * date and is re-checked rather than being treated as permanent.
 */

/** Body markers that identify a domain parking or for-sale interstitial. */
const PARKED_MARKERS = [
  /window\.(?:onload|location)[^<]{0,120}["']\/lander["']/i,
  /sedoparking|parkingcrew|bodis\.com|afternic|dan\.com\/domain/i,
  /\bthis domain (?:name )?(?:is|may be) for sale\b/i,
  /\bbuy this domain\b/i,
  /\bdomain (?:parking|is parked)\b/i,
  /\bgodaddy[^<]{0,60}\bparked\b/i,
];

/** Title/heading text that means the page exists but carries no business. */
const DEAD_TITLES = [
  /^(?:just a moment|attention required|please wait)/i,
  /^(?:404|403|error)\b|page not found|not found$/i,
  /^account suspended|suspended (?:account|page)/i,
  /^(?:coming soon|under construction|site (?:temporarily )?unavailable)/i,
  /^(?:index of \/|apache2? (?:ubuntu )?default page|welcome to nginx)/i,
  /^(?:default web site page|it works!)$/i,
];

/**
 * A body this small cannot hold a homepage. Chosen from the observed shapes:
 * parked redirects are 114 bytes and placeholder shells 169, while the smallest
 * genuine small-business homepage in the sample was several kilobytes.
 */
const MIN_BODY_BYTES = 600;

/**
 * @returns {{state:'live'|'parked'|'empty'|'error'|'unreachable', reason:string}}
 */
function classifySite(html, { status = 200, title = '' } = {}) {
  if (!status) return { state: 'unreachable', reason: 'no response from the host' };
  if (status >= 400) return { state: 'error', reason: `host returned HTTP ${status}` };

  const body = String(html || '');
  for (const marker of PARKED_MARKERS) {
    if (marker.test(body)) return { state: 'parked', reason: 'domain parking or for-sale page' };
  }

  const headline = String(title || (body.match(/<title[^>]*>([^<]*)/i) || [])[1] || '').trim();
  for (const dead of DEAD_TITLES) {
    if (dead.test(headline)) return { state: 'empty', reason: `placeholder page: ${headline.slice(0, 40)}` };
  }

  // Readable copy outranks byte count. A small hand-written homepage is still a
  // real business, and the radar exists to find exactly those; only pages with
  // nothing to read fall back to the size heuristic.
  const text = body.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  if (text.length >= 200) return { state: 'live', reason: '' };

  if (body.length < MIN_BODY_BYTES) {
    return { state: 'empty', reason: `body is only ${body.length} bytes` };
  }
  // A homepage with neither text nor imagery is a shell whatever its size.
  if (text.length < 120 && !/<img|background(?:-image)?\s*:\s*url\(/i.test(body)) {
    return { state: 'empty', reason: 'no readable content or imagery' };
  }
  return { state: 'live', reason: '' };
}

const isLive = (liveness) => !liveness || liveness.state === 'live';

/**
 * How long to leave a not-live URL alone before looking again.
 *
 * Long enough that a dead domain stops consuming the daily budget, short
 * enough that a business which rebuilds its site re-enters the pipeline within
 * a quarter rather than being written off.
 */
const LIVENESS_RECHECK_DAYS = { parked: 60, empty: 45, error: 21, unreachable: 21, live: 45 };

function livenessStale(row, { today, state } = {}) {
  const checked = row?.liveness?.checked;
  if (!checked) return true;
  const days = LIVENESS_RECHECK_DAYS[state || row?.liveness?.state] ?? 45;
  const t = Date.parse(checked);
  const now = Date.parse(today) || Date.now();
  if (!Number.isFinite(t)) return true;
  return (now - t) / 86400000 >= days;
}

module.exports = { classifySite, isLive, livenessStale, LIVENESS_RECHECK_DAYS, MIN_BODY_BYTES };
