'use strict';

/**
 * The video model catalog: load it, filter it by what a shot actually needs,
 * and rank the survivors by real cost for that shot.
 *
 * The catalog snapshot in config/video-models.json is a verbatim projection of
 * GET /api/v1/videos/models. Capabilities are read from it rather than hardcoded
 * because they move: durations, resolutions and aspect ratios differ per model
 * and change when OpenRouter adds a version. A hardcoded list would send a 12s
 * request to a model that caps at 10s and fail at spend time instead of plan time.
 */

const fs = require('fs');
const path = require('path');
const { estimateShotCost } = require('./pricing');

const CATALOG_PATH = path.join(__dirname, '..', '..', 'config', 'video-models.json');

let cached = null;

function loadCatalog(catalogPath = CATALOG_PATH) {
  if (cached && cached.path === catalogPath) return cached.catalog;
  const raw = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  const catalog = {
    source: raw.source,
    fetchedAt: raw.fetched_at,
    models: raw.models || [],
  };
  cached = { path: catalogPath, catalog };
  return catalog;
}

function clearCache() {
  cached = null;
}

function getModel(id, catalog = loadCatalog()) {
  return catalog.models.find((m) => m.id === id) || null;
}

/** Normalise a resolution label so '2k'/'2K' and '4k'/'4K' compare equal. */
function resKey(res) {
  const s = String(res || '').trim();
  return /^[24]k$/i.test(s) ? s.toUpperCase() : s.toLowerCase();
}

/**
 * Does this model satisfy a shot's hard requirements?
 *
 * Returns a reason string on failure so `/plan` can explain why a model the user
 * expected to see was excluded, instead of silently omitting it.
 */
function checkCapability(model, need = {}) {
  const fail = (reason) => ({ ok: false, reason });

  if (need.resolution) {
    const supported = (model.supported_resolutions || []).map(resKey);
    // An empty list means the model does not expose resolution as a choice
    // (upscalers, avatar models); treat that as "not selectable by resolution".
    if (!supported.length) return fail('model does not expose resolution options');
    if (!supported.includes(resKey(need.resolution))) {
      return fail(`resolution ${need.resolution} unsupported (has ${model.supported_resolutions.join(', ')})`);
    }
  }

  if (need.aspectRatio) {
    const supported = model.supported_aspect_ratios || [];
    if (!supported.length) return fail('model does not expose aspect ratio options');
    if (!supported.includes(need.aspectRatio)) {
      return fail(`aspect ${need.aspectRatio} unsupported (has ${supported.join(', ')})`);
    }
  }

  if (need.durationSeconds) {
    const supported = model.supported_durations || [];
    if (!supported.length) return fail('model does not expose duration options');
    if (!supported.includes(Number(need.durationSeconds))) {
      return fail(`duration ${need.durationSeconds}s unsupported (has ${supported.join(', ')})`);
    }
  }

  if (need.audio && !model.generate_audio) return fail('model cannot generate audio');
  if (need.seed && !model.seed) return fail('model does not accept a seed');

  if (need.firstFrame && !(model.supported_frame_images || []).includes('first_frame')) {
    return fail('model does not accept a first frame image');
  }
  if (need.lastFrame && !(model.supported_frame_images || []).includes('last_frame')) {
    return fail('model does not accept a last frame image');
  }

  return { ok: true };
}

/**
 * Every model that can serve this shot, cheapest first.
 *
 * `rejected` is returned alongside so callers can show the near-misses. Knowing
 * that Veo was dropped for "duration 5s unsupported (has 4, 6, 8)" is far more
 * actionable than an empty candidate list.
 */
function candidatesFor(need = {}, catalog = loadCatalog()) {
  const accepted = [];
  const rejected = [];

  for (const model of catalog.models) {
    const cap = checkCapability(model, need);
    if (!cap.ok) {
      rejected.push({ id: model.id, reason: cap.reason });
      continue;
    }
    const cost = estimateShotCost(model, {
      resolution: need.resolution,
      aspectRatio: need.aspectRatio,
      durationSeconds: need.durationSeconds,
      audio: need.audio,
      mode: need.mode,
      referenceImages: need.referenceImages,
      fps: need.fps,
    });
    if (!cost.ok) {
      rejected.push({ id: model.id, reason: cost.reason });
      continue;
    }
    accepted.push({ model, cost });
  }

  accepted.sort((a, b) => a.cost.usd - b.cost.usd);
  return { accepted, rejected };
}

module.exports = {
  CATALOG_PATH,
  loadCatalog,
  clearCache,
  getModel,
  checkCapability,
  candidatesFor,
};
