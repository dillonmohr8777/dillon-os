'use strict';

/**
 * Cost model for OpenRouter video generation.
 *
 * OpenRouter does not price video the way it prices text. Every model carries a
 * `pricing_skus` map, and the SKU families are genuinely different units:
 *
 *   duration_seconds*              USD per output second        (Veo, Wan, Kling, MiniMax)
 *   cents_per_second_output*       cents per output second      (FLUX.3, Runway)
 *   cents_per_video_output_second_*  cents per output second    (Grok Imagine)
 *   video_tokens*                  USD per video token          (Seedance)
 *   cents_per_megapixel_second_*   cents per megapixel-second   (FLUX upscale)
 *   minimum_cents_per_generation   a floor, not a rate          (Runway Aleph)
 *
 * Two consequences drive this module's design:
 *
 * 1. You cannot compare models by reading one number. A model's headline price
 *    is meaningless without the resolution and audio flags, because the SKU key
 *    itself encodes them (`duration_seconds_without_audio_720p` is 2.7x cheaper
 *    than `duration_seconds_with_audio` on the same Veo 3.1 Lite). Picking the
 *    cheapest model therefore means resolving a SKU per candidate *request*,
 *    which is what `rateFor()` does.
 *
 * 2. Seedance is priced per video token, so its cost is quadratic in resolution
 *    and linear in fps — a dimension the per-second models simply do not have.
 *    Rendering 1080p instead of 480p on Seedance is a ~5x cost change with no
 *    change to any number a human would think to look at.
 *
 * Token estimates are labelled `confidence: 'estimated'`. OpenRouter reports the
 * true charge as `usage.cost` on the completed job, and `ledger.js` feeds those
 * observations back as learned rates, so the estimate self-corrects with use.
 */

/**
 * Video-token formula: tokens = (width * height * fps * duration) / 1024.
 *
 * Validated against ByteDance's published Seedance 1.5 Pro rate: 480p/16:9 at
 * 24fps for 5s gives 48,038 tokens, and 48,038 * $0.0000024 = $0.115, i.e.
 * $0.023/second — the figure ByteDance and OpenRouter both quote for that model.
 * The formula reproducing a published price to three decimals is the reason it
 * is trusted here rather than guessed at.
 */
const TOKENS_PER_PIXEL_SECOND_DIVISOR = 1024;
const DEFAULT_FPS = 24;

/** Short-side pixel height for each resolution label OpenRouter uses. */
const RESOLUTION_SHORT_SIDE = {
  '480p': 480,
  '540p': 540,
  '720p': 720,
  '768p': 768,
  '1080p': 1080,
  '1024p': 1024,
  '2K': 1440,
  '4K': 2160,
};

/** SKU key fragments that pin a SKU to one resolution. */
const RESOLUTION_TAGS = ['480p', '540p', '720p', '768p', '1080p', '1024p', '2k', '4k'];

function normaliseResolution(res) {
  if (!res) return null;
  const raw = String(res).trim();
  const upper = raw.toUpperCase();
  if (upper === '2K' || upper === '4K') return upper;
  return raw.toLowerCase();
}

/**
 * Pixel dimensions for a resolution label at a given aspect ratio.
 *
 * OpenRouter labels resolution by short side ("720p" is 1280x720 in 16:9 and
 * 720x1280 in 9:16), so the long side has to be derived from the ratio rather
 * than assumed landscape. Getting this backwards would not error — it would
 * quietly double a Seedance bill on every vertical clip.
 */
function dimensionsFor(resolution, aspectRatio = '16:9') {
  const key = normaliseResolution(resolution);
  const shortSide = RESOLUTION_SHORT_SIDE[key] || RESOLUTION_SHORT_SIDE[String(key).toLowerCase()];
  if (!shortSide) return null;

  const [aRaw, bRaw] = String(aspectRatio || '16:9').split(':').map(Number);
  const a = Number.isFinite(aRaw) && aRaw > 0 ? aRaw : 16;
  const b = Number.isFinite(bRaw) && bRaw > 0 ? bRaw : 9;

  const longSide = Math.round((shortSide * Math.max(a, b)) / Math.min(a, b));
  // Encoders want even dimensions; odd widths break yuv420p chroma subsampling.
  const even = (n) => (n % 2 === 0 ? n : n + 1);
  return a >= b
    ? { width: even(longSide), height: even(shortSide) }
    : { width: even(shortSide), height: even(longSide) };
}

/** Video tokens for a clip, per the formula documented above. */
function videoTokens({ resolution, aspectRatio, durationSeconds, fps = DEFAULT_FPS }) {
  const dims = dimensionsFor(resolution, aspectRatio);
  if (!dims || !durationSeconds) return null;
  return (dims.width * dims.height * fps * durationSeconds) / TOKENS_PER_PIXEL_SECOND_DIVISOR;
}

/**
 * Parse a SKU key into a family plus the attributes it pins.
 *
 * A SKU with no attributes is the generic fallback; one that pins resolution and
 * audio is the most specific. Specificity is what `rateFor` ranks on.
 */
function parseSku(key) {
  const k = String(key).toLowerCase();

  let family = null;
  if (k.includes('megapixel_second')) family = 'megapixel_second';
  else if (k.startsWith('minimum_cents_per_generation')) family = 'minimum';
  else if (k.includes('video_tokens')) family = 'video_tokens';
  else if (k.includes('duration_seconds')) family = 'per_second_usd';
  else if (k.includes('per_second_output') || k.includes('video_output_second')) family = 'per_second_cents';
  else if (k.includes('per_image_input')) family = 'per_image_cents';
  else if (k === 'reference_images') family = 'per_reference_image_usd';

  const attrs = {};
  for (const tag of RESOLUTION_TAGS) {
    // `_4k` and `_1080p` are suffix-delimited, so match on word boundaries to
    // avoid "1024p" swallowing "24p" style fragments.
    if (new RegExp(`(^|_)${tag}(_|$)`).test(k)) {
      attrs.resolution = tag === '2k' || tag === '4k' ? tag.toUpperCase() : tag;
      break;
    }
  }
  if (k.includes('with_audio')) attrs.audio = true;
  if (k.includes('without_audio')) attrs.audio = false;
  if (k.includes('text_to_video')) attrs.mode = 'text_to_video';
  if (k.includes('image_to_video')) attrs.mode = 'image_to_video';
  if (k.includes('with_video_input') || k.includes('video_continuation')) attrs.mode = 'video_input';
  if (k.includes('precise')) attrs.quality = 'precise';
  if (k.includes('creative')) attrs.quality = 'creative';

  return { key, family, attrs };
}

/**
 * Choose the SKU that best matches a request.
 *
 * Rules, in order:
 *   - a SKU whose pinned attribute contradicts the request is discarded outright
 *     (a `_720p` SKU cannot price a 1080p clip),
 *   - among survivors, more matched attributes wins,
 *   - ties break toward the cheaper rate, so an ambiguous catalog never silently
 *     bills at the higher of two equally-plausible SKUs.
 */
function selectSku(skus, context, families) {
  const wanted = new Set(families);
  const candidates = [];

  for (const [key, rawValue] of Object.entries(skus || {})) {
    const parsed = parseSku(key);
    if (!parsed.family || !wanted.has(parsed.family)) continue;

    const value = Number(rawValue);
    if (!Number.isFinite(value)) continue;

    let matched = 0;
    let conflict = false;
    for (const [attr, skuValue] of Object.entries(parsed.attrs)) {
      const requested = context[attr];
      if (requested === undefined || requested === null) {
        // Request is silent on this attribute. A pinned SKU is still usable,
        // it just earns no specificity credit.
        continue;
      }
      if (String(skuValue) === String(requested)) matched += 1;
      else conflict = true;
    }
    if (conflict) continue;

    candidates.push({ ...parsed, value, matched });
  }

  if (!candidates.length) return null;
  candidates.sort((a, b) => (b.matched - a.matched) || (a.value - b.value));
  return candidates[0];
}

/**
 * Resolve the effective USD-per-second rate for one model under one request.
 *
 * @returns {{usdPerSecond:number, sku:string, basis:string, confidence:string}|null}
 */
function rateFor(model, request = {}) {
  const context = {
    resolution: normaliseResolution(request.resolution) === '2k' ? '2K' : (request.resolution || null),
    audio: request.audio === undefined ? null : Boolean(request.audio),
    mode: request.mode || null,
    quality: request.quality || null,
  };
  if (context.resolution) {
    const n = normaliseResolution(context.resolution);
    context.resolution = n === '2k' ? '2K' : n === '4k' ? '4K' : n;
  }

  const skus = model.pricing_skus || {};

  const perSecondUsd = selectSku(skus, context, ['per_second_usd']);
  if (perSecondUsd) {
    return {
      usdPerSecond: perSecondUsd.value,
      sku: perSecondUsd.key,
      basis: 'per_second',
      confidence: 'listed',
    };
  }

  const perSecondCents = selectSku(skus, context, ['per_second_cents']);
  if (perSecondCents) {
    return {
      usdPerSecond: perSecondCents.value / 100,
      sku: perSecondCents.key,
      basis: 'per_second',
      confidence: 'listed',
    };
  }

  const tokenSku = selectSku(skus, context, ['video_tokens']);
  if (tokenSku) {
    const tokens = videoTokens({
      resolution: request.resolution,
      aspectRatio: request.aspectRatio,
      durationSeconds: 1,
      fps: request.fps || DEFAULT_FPS,
    });
    if (tokens == null) return null;
    return {
      usdPerSecond: tokens * tokenSku.value,
      sku: tokenSku.key,
      basis: 'video_tokens',
      // The formula is validated but undocumented; the ledger overrides this
      // with an observed rate once the model has actually been billed.
      confidence: 'estimated',
    };
  }

  const mps = selectSku(skus, context, ['megapixel_second']);
  if (mps) {
    const dims = dimensionsFor(request.resolution, request.aspectRatio);
    if (!dims) return null;
    const megapixels = (dims.width * dims.height) / 1_000_000;
    return {
      usdPerSecond: (mps.value / 100) * megapixels,
      sku: mps.key,
      basis: 'megapixel_second',
      confidence: 'estimated',
    };
  }

  return null;
}

/**
 * Full cost estimate for one shot, including per-generation floors and the
 * per-image surcharges some models add for reference frames.
 */
function estimateShotCost(model, request = {}) {
  const rate = rateFor(model, request);
  if (!rate) {
    return { ok: false, reason: `no priceable SKU for ${model.id}`, model: model.id };
  }

  const duration = Number(request.durationSeconds) || 0;
  let usd = rate.usdPerSecond * duration;
  const extras = [];

  const referenceImages = Number(request.referenceImages) || 0;
  if (referenceImages > 0) {
    const perRefUsd = selectSku(model.pricing_skus, {}, ['per_reference_image_usd']);
    const perImgCents = selectSku(model.pricing_skus, {}, ['per_image_cents']);
    if (perRefUsd) {
      const add = perRefUsd.value * referenceImages;
      usd += add;
      extras.push({ sku: perRefUsd.key, usd: add });
    } else if (perImgCents) {
      const add = (perImgCents.value / 100) * referenceImages;
      usd += add;
      extras.push({ sku: perImgCents.key, usd: add });
    }
  }

  // Minimum-per-generation is a floor applied after everything else. Runway
  // Aleph's $0.56 floor means a 1-second test clip costs the same as a 2-second
  // one, which changes which model is actually cheapest for short shots.
  const floor = selectSku(model.pricing_skus, {}, ['minimum']);
  let flooredTo = null;
  if (floor) {
    const floorUsd = floor.value / 100;
    if (usd < floorUsd) {
      flooredTo = floorUsd;
      usd = floorUsd;
    }
  }

  return {
    ok: true,
    model: model.id,
    usd: Number(usd.toFixed(6)),
    usdPerSecond: Number(rate.usdPerSecond.toFixed(6)),
    durationSeconds: duration,
    sku: rate.sku,
    basis: rate.basis,
    confidence: rate.confidence,
    extras,
    flooredTo,
  };
}

module.exports = {
  DEFAULT_FPS,
  RESOLUTION_SHORT_SIDE,
  dimensionsFor,
  videoTokens,
  parseSku,
  selectSku,
  rateFor,
  estimateShotCost,
};
