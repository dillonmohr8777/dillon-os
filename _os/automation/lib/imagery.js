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
 *            buildable:boolean, reason:string}}
 */
async function checkImagery(website, opts = {}) {
  const need = opts.need ?? HOMEPAGE_IMAGE_SLOTS;
  const out = { usable: 0, logo: false, found: 0, widest: 0, buildable: false, reason: '' };
  if (!website) {
    out.reason = 'no website on file';
    return out;
  }

  let harvest;
  try {
    harvest = await harvestLite(website, { timeoutMs: opts.timeoutMs || 18000 });
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
    picked = await harvestImages(harvest, {
      max: 8,
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
  out.logo = !!picked.logo;
  out.widest = picked.images[0]?.width || 0;
  out.buildable = out.usable >= need;
  out.reason = out.buildable
    ? `${out.usable} usable image(s)${out.logo ? ' and a logo' : ' but no logo found'}`
    : out.found === 0
      ? 'no images in the markup at all — likely client-rendered or genuinely image-free'
      : `only ${out.usable} of ${need} slots can be filled from their own imagery`;
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
 * @returns {Promise<{checked:number, buildable:number, partial:number, none:number}>}
 */
async function surveyImagery(registry, prospects, opts = {}) {
  const today = opts.today;
  const concurrency = opts.concurrency || 6;
  const need = opts.need ?? HOMEPAGE_IMAGE_SLOTS;
  const stats = { checked: 0, buildable: 0, partial: 0, none: 0 };

  let cursor = 0;
  async function worker() {
    while (cursor < prospects.length) {
      const p = prospects[cursor++];
      const res = await checkImagery(p.website, { ...opts, need });
      const row = registry.prospects[p.domain];
      if (row) {
        row.imagery = {
          checked: today,
          usable: res.usable,
          logo: res.logo,
          found: res.found,
          widest: res.widest,
          buildable: res.buildable,
          reason: res.reason,
        };
      }
      stats.checked += 1;
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
