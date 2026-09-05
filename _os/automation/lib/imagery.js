'use strict';

/**
 * Can we actually build a homepage concept for this prospect today?
 *
 * The deliverable is **one page**, not a site: the arch template asks for six
 * content photographs plus a logo. That is a much lower bar than a full rebuild,
 * and getting it wrong cost real time — the pipeline reported builds as blocked
 * on imagery when a fifth of the queue was buildable.
 *
 * Two mistakes produced that wrong answer, both now fixed:
 *
 * 1. **The need was sized for a whole site** rather than one page.
 * 2. **The harvester only read `<img src>`.** Lazy-loading themes park a spacer
 *    GIF there and put the real photograph in `data-src` or `srcset`, so sites
 *    with plenty of imagery looked empty. Andorra Family Dentistry went from 0
 *    usable to 8 at 1920×1037 on that fix alone.
 *
 * So buildability is measured, per prospect, and stored on the row — because
 * "which 25 do I build this week" should be a filter, not an afternoon of
 * opening tabs.
 *
 * Nothing here ever substitutes another business's photographs. A prospect with
 * no usable imagery is reported as such and stays unbuildable until that is
 * solved by generation, by asking them, or by a photographer.
 */

const { harvestLite } = require('./harvest-lite');
const { harvestImages } = require('./harvest-images');
const { assessLogoEligibility, applyLogoEligibility, sameSite } = require('./logo-eligibility');

function normalizedName(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\b(inc|llc|ltd|corp|corporation)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Confirm that the official page identifies the same business before a logo is
 * trusted. URL reachability alone is deliberately not enough: a parked domain,
 * redirect target, or wrong business can still return HTTP 200.
 */
function exactIdentity(prospect, harvest) {
  const expected = normalizedName(prospect?.business_name || prospect?.name);
  if (!expected) return { match: false, reason: 'business_identity_unverified' };
  const facts = harvest?.facts || {};
  const voice = harvest?.voice || {};
  const candidates = [facts.businessNameFromLd, voice.title, voice.metaDescription, ...(voice.headings || [])]
    .map(normalizedName)
    .filter(Boolean);
  if (!candidates.length) return { match: false, reason: 'business_identity_unverified' };
  const matching = candidates.find((candidate) => {
    return candidate === expected || (` ${candidate} `).includes(` ${expected} `);
  });
  return matching ? { match: true, observed: matching } : { match: false, reason: 'business_identity_mismatch' };
}

function officialSiteLogoEvidence(prospect, harvest, logo, website) {
  if (!logo) return { status: 'pending', reason: 'logo_not_found' };
  const identity = exactIdentity(prospect, harvest);
  if (!identity.match) {
    return {
      status: identity.reason === 'business_identity_mismatch' ? 'rejected' : 'pending',
      reason: identity.reason,
      source_kind: 'official_site',
      source_url: logo.url,
      identity_match: identity.reason === 'business_identity_mismatch' ? 'mismatch' : 'unverified',
    };
  }
  return {
    status: 'pending',
    eligible: false,
    reason: 'logo_visual_validation_missing',
    source_kind: 'official_site',
    source_url: logo.url,
    source_page: harvest.finalUrl || website,
    identity_match: 'exact',
    exact_match: false,
    source_sha256: logo.sha256,
    width: logo.width,
    height: logo.height,
    bytes: logo.bytes,
    fetched_at: new Date().toISOString(),
    fetch_status: 200,
    image_format: logo.ext,
    transformation: 'none; byte-for-byte first-party asset',
  };
}

/**
 * Content-photo slots in the arch homepage template.
 *
 * Counted from a real build, not from the reference's `assets/image-` string
 * count: the generated page asks for `image-1` … `image-6` plus a logo used
 * twice. An earlier threshold of 4 came from grepping the template and was too
 * lenient — it reported 28 prospects buildable where 22 actually clear the bar,
 * and 18 clear it with a logo as well.
 *
 * A build with unfilled slots renders broken-image icons, so this is a floor,
 * not a target. Raising the buildable count is a *template* problem — degrade the
 * gallery to fewer tiles when a prospect has fewer photographs — not a reason to
 * lower the number here.
 */
const HOMEPAGE_IMAGE_SLOTS = 6;

/** How long an imagery check stays trustworthy. Sites change slowly. */
const IMAGERY_TTL_DAYS = 45;

/**
 * Check one prospect's imagery.
 *
 * @returns {{usable:number, logo:boolean, found:number, widest:number,
 *            buildable:boolean, logo_eligibility:object, reason:string}}
 */
async function checkImagery(website, opts = {}) {
  const need = opts.need ?? HOMEPAGE_IMAGE_SLOTS;
  const prospect = opts.prospect || { website, business_name: opts.businessName || '' };
  const prior = assessLogoEligibility(prospect);
  const out = {
    usable: 0,
    logo: false,
    found: 0,
    widest: 0,
    buildable: false,
    logo_eligibility: { eligible: false, status: 'pending', reason: 'logo_fetch_failed' },
    reason: '',
  };
  if (!website) {
    out.reason = 'no website on file';
    return out;
  }

  let harvest;
  try {
    harvest = await (opts.harvestLite || harvestLite)(website, { timeoutMs: opts.timeoutMs || 18000 });
  } catch (err) {
    out.reason = `harvest failed: ${String(err?.message || err).slice(0, 60)}`;
    return out;
  }
  if (!harvest || !Array.isArray(harvest.images)) {
    out.reason = 'harvest returned nothing to inspect';
    return out;
  }
  out.found = harvest.images.length;

  let picked;
  try {
    picked = await (opts.harvestImages || harvestImages)(harvest, {
      max: 8,
      // This function reads only `.length` and one `.width`; it has no use for
      // the image bodies and holding them would be ~570MB at full concurrency.
      metadataOnly: true,
      // Below this a photograph cannot carry a hero without visible softness.
      minWidth: opts.minWidth || 360,
      minBytes: opts.minBytes || 5000,
      timeoutMs: opts.timeoutMs || 12000,
    });
  } catch (err) {
    out.reason = `image fetch failed: ${String(err?.message || err).slice(0, 60)}`;
    return out;
  }

  out.usable = picked.images.length;
  const discovered = officialSiteLogoEvidence(prospect, harvest, picked.logo, website);
  let refreshed = picked.logo;
  // An exact reviewed social asset can be re-fetched only while the official
  // page still links the matched profile. Failure always revokes active status.
  if (prior.eligible && prior.source_kind === 'official_social' &&
      (harvest.officialSocialUrls || []).includes(prior.profile_url)) {
    try {
      refreshed = (await (opts.harvestImages || harvestImages)({ finalUrl: website,
        images: [{ src: prior.source_url, alt: 'business logo' }] }, { metadataOnly: true, max: 1 })).logo;
    } catch { refreshed = null; }
  }
  const matchesReview = prior.eligible && exactIdentity(prospect, harvest).match &&
    sameSite(harvest.finalUrl || website, website) && refreshed?.url === prior.source_url &&
    refreshed?.sha256 === prior.source_sha256;
  const logoEvidence = matchesReview
    ? assessLogoEligibility({ ...prospect, logo_eligibility: { ...prior, fetched_at: new Date().toISOString() } })
    : discovered;
  out.logo_eligibility = logoEvidence;
  out.logo = logoEvidence.eligible === true;
  out.widest = picked.images[0]?.width || 0;
  out.buildable = out.usable >= need && !!logoEvidence.eligible;
  out.reason = out.buildable
    ? `${out.usable} usable image(s) and a verified exact logo`
    : out.found === 0
      ? `no images in the markup at all — logo hold: ${logoEvidence.reason}`
      : out.usable < need
        ? `only ${out.usable} of ${need} slots can be filled from their own imagery`
        : `logo hold: ${logoEvidence.reason}`;
  return out;
}

/** True when a stored check is too old to trust. */
function imageryStale(prospect, { today, ttlDays = IMAGERY_TTL_DAYS } = {}) {
  const checked = prospect?.imagery?.checked;
  if (!checked) return true;
  const days = (Date.parse(`${today}T00:00:00Z`) - Date.parse(`${checked}T00:00:00Z`)) / 86400000;
  return !Number.isFinite(days) || days >= ttlDays;
}

/**
 * Survey a set of prospects, writing results onto their registry rows.
 *
 * @param {object} registry radar.load() output — mutated in place
 * @param {Array} prospects rows to check
 * @param {object} [opts] `{ today, concurrency, need, onProgress }`
 * @returns {Promise<{checked:number, buildable:number, partial:number, none:number, logo_verified:number, logo_pending:number, logo_rejected:number}>}
 */
async function surveyImagery(registry, prospects, opts = {}) {
  const today = opts.today;
  const concurrency = opts.concurrency || 6;
  const need = opts.need ?? HOMEPAGE_IMAGE_SLOTS;
  const stats = { checked: 0, buildable: 0, partial: 0, none: 0, logo_verified: 0, logo_pending: 0, logo_rejected: 0 };

  let cursor = 0;
  async function worker() {
    while (cursor < prospects.length) {
      const p = prospects[cursor++];
      const res = await checkImagery(p.website, { ...opts, prospect: p, businessName: p.business_name, need });
      const row = registry.prospects[p.domain];
      if (row) {
        row.imagery = {
          checked: today,
          usable: res.usable,
          logo: res.logo,
          logo_eligibility: res.logo_eligibility,
          found: res.found,
          widest: res.widest,
          buildable: res.buildable,
          reason: res.reason,
        };
        applyLogoEligibility(row, res.logo_eligibility, { today });
      }
      stats.checked += 1;
      if (res.logo_eligibility?.eligible) stats.logo_verified += 1;
      else if (res.logo_eligibility?.status === 'rejected') stats.logo_rejected += 1;
      else stats.logo_pending += 1;
      if (res.buildable) stats.buildable += 1;
      else if (res.usable > 0) stats.partial += 1;
      else stats.none += 1;
      if (opts.onProgress) opts.onProgress(stats.checked, prospects.length);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, prospects.length) }, worker));
  return stats;
}

module.exports = { checkImagery, surveyImagery, imageryStale, HOMEPAGE_IMAGE_SLOTS, IMAGERY_TTL_DAYS };
