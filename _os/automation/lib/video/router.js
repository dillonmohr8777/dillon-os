'use strict';

/**
 * Shot -> model routing.
 *
 * The point of this module is that most shots should never reach a paid model at
 * all. A title card, a kinetic-type beat, a stick-figure explainer or a chart is
 * deterministic motion graphics; paying a diffusion model per frame to draw text
 * it will spell wrong is the single most expensive mistake available here. Those
 * scene types route to the local renderer for $0.
 *
 * What reaches OpenRouter is the residue: shots that genuinely need generative
 * motion. For those, the router picks the cheapest model that can actually serve
 * the shot's constraints, restricted to the tier's allowlist.
 *
 * Tier membership is editorial (see config/video-routing.json). Price and
 * capability come from the live catalog. Keeping those two separate is what lets
 * the price data be refreshed without re-litigating quality judgements.
 */

const fs = require('fs');
const path = require('path');
const { candidatesFor, loadCatalog, getModel, checkCapability } = require('./registry');
const { estimateShotCost } = require('./pricing');

const ROUTING_PATH = path.join(__dirname, '..', '..', 'config', 'video-routing.json');

function loadRouting(routingPath = ROUTING_PATH) {
  return JSON.parse(fs.readFileSync(routingPath, 'utf8'));
}

/** Snap a requested duration to the nearest duration the model actually offers. */
function snapDuration(model, requested) {
  const options = (model.supported_durations || []).map(Number).filter(Number.isFinite);
  if (!options.length) return requested;
  if (options.includes(Number(requested))) return Number(requested);
  // Ties break toward the SHORTER option. Every model bills per second, so
  // rounding 7s up to 8s rather than down to 6s silently spends 33% more on a
  // duration the director did not ask for. Catalogs are not sorted (Veo lists
  // [8, 4, 6]), so the tie has to be broken explicitly rather than by input order.
  return options.reduce((best, opt) => {
    const d = Math.abs(opt - requested);
    const bd = Math.abs(best - requested);
    if (d < bd) return opt;
    if (d === bd) return Math.min(opt, best);
    return best;
  });
}

/**
 * Route one shot.
 *
 * @param {object} shot   { scene_type, prompt, duration_seconds, aspect_ratio,
 *                          audio, first_frame, last_frame, seed, tier, model }
 * @param {object} opts   { routing, catalog, maxUsd }
 */
function routeShot(shot = {}, opts = {}) {
  const routing = opts.routing || loadRouting();
  const catalog = opts.catalog || loadCatalog();

  const localTypes = new Set(routing.local_scene_types?.types || []);
  if (shot.scene_type && localTypes.has(shot.scene_type)) {
    return {
      ok: true,
      engine: 'local',
      model: null,
      reason: `scene_type '${shot.scene_type}' renders locally`,
      cost: { ok: true, usd: 0, usdPerSecond: 0, basis: 'local', confidence: 'exact', durationSeconds: Number(shot.duration_seconds) || 0 },
      shot,
    };
  }

  const tierName = shot.tier || opts.tier || 'standard';
  const tier = routing.tiers?.[tierName];
  if (!tier) return { ok: false, reason: `unknown tier '${tierName}'`, shot };

  const resolution = shot.resolution || tier.resolution;
  const aspectRatio = shot.aspect_ratio || routing.defaults?.master?.aspect_ratio || '16:9';
  const audio = shot.audio === undefined ? Boolean(tier.audio) : Boolean(shot.audio);

  const need = {
    resolution,
    aspectRatio,
    audio,
    firstFrame: Boolean(shot.first_frame),
    lastFrame: Boolean(shot.last_frame),
    seed: shot.seed !== undefined && shot.seed !== null,
    mode: shot.first_frame ? 'image_to_video' : 'text_to_video',
    referenceImages: Array.isArray(shot.input_references) ? shot.input_references.length : 0,
    fps: routing.defaults?.fps,
  };

  // An explicitly pinned model bypasses tier selection but is still capability-
  // and budget-checked, so a pin can fail loudly at plan time rather than at spend.
  if (shot.model) {
    const model = getModel(shot.model, catalog);
    if (!model) return { ok: false, reason: `pinned model '${shot.model}' not in catalog`, shot };
    const duration = snapDuration(model, Number(shot.duration_seconds) || 5);
    // A pin still has to clear capability. Pricing alone will happily quote a
    // 720p shot on a 2K-only model, and the failure would then surface as an API
    // rejection after the rest of the storyboard had already been billed.
    const cap = checkCapability(model, { ...need, durationSeconds: duration });
    if (!cap.ok) return { ok: false, reason: `pinned model '${shot.model}' cannot serve this shot: ${cap.reason}`, shot };
    const cost = estimateShotCost(model, { ...need, durationSeconds: duration });
    if (!cost.ok) return { ok: false, reason: cost.reason, shot };
    return { ok: true, engine: 'openrouter', model, pinned: true, durationSeconds: duration, cost, need, shot };
  }

  const allow = tier.allow === '*' ? null : new Set(tier.allow || []);
  const prefer = tier.prefer || [];

  // Duration is snapped per candidate model: models disagree about which
  // durations exist (Veo offers 4/6/8, Wan offers every second to 30), so a
  // single global snap would exclude models that could have served the shot.
  const requested = Number(shot.duration_seconds) || 5;
  const pool = [];
  const rejected = [];

  for (const model of catalog.models) {
    if (allow && !allow.has(model.id)) continue;
    const duration = snapDuration(model, requested);
    const { accepted, rejected: rej } = candidatesFor(
      { ...need, durationSeconds: duration },
      { models: [model], source: catalog.source, fetchedAt: catalog.fetchedAt }
    );
    if (accepted.length) pool.push({ ...accepted[0], durationSeconds: duration });
    else if (rej.length) rejected.push(rej[0]);
  }

  if (!pool.length) {
    return {
      ok: false,
      reason: `no model in tier '${tierName}' can serve this shot`,
      rejected,
      need,
      shot,
    };
  }

  // Cheapest wins, but a preferred model that ties on price wins the tie — the
  // preference list is how a known-good model beats an untested one at equal cost.
  pool.sort((a, b) => {
    const delta = a.cost.usd - b.cost.usd;
    if (Math.abs(delta) > 1e-9) return delta;
    const ai = prefer.indexOf(a.model.id);
    const bi = prefer.indexOf(b.model.id);
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  });

  const chosen = pool[0];
  const maxUsd = opts.maxUsd ?? routing.budget?.per_shot_usd;
  if (maxUsd != null && chosen.cost.usd > maxUsd) {
    return {
      ok: false,
      reason: `cheapest option ${chosen.model.id} at $${chosen.cost.usd.toFixed(4)} exceeds per-shot cap $${maxUsd}`,
      alternatives: pool.slice(0, 5).map((p) => ({ id: p.model.id, usd: p.cost.usd })),
      shot,
    };
  }

  return {
    ok: true,
    engine: 'openrouter',
    tier: tierName,
    model: chosen.model,
    durationSeconds: chosen.durationSeconds,
    cost: chosen.cost,
    need,
    alternatives: pool.slice(1, 4).map((p) => ({ id: p.model.id, usd: p.cost.usd })),
    shot,
  };
}

/** Route a whole storyboard and total it up. */
function routeStoryboard(storyboard = {}, opts = {}) {
  const routing = opts.routing || loadRouting();
  const catalog = opts.catalog || loadCatalog();
  const scenes = storyboard.scenes || [];

  const routed = scenes.map((scene, i) =>
    ({ index: i, ...routeShot({ tier: storyboard.tier, aspect_ratio: storyboard.aspect_ratio, ...scene }, { ...opts, routing, catalog }) })
  );

  const failures = routed.filter((r) => !r.ok);
  const totalUsd = routed.reduce((sum, r) => sum + (r.ok ? r.cost.usd : 0), 0);
  const localCount = routed.filter((r) => r.ok && r.engine === 'local').length;
  const anyEstimated = routed.some((r) => r.ok && r.cost.confidence === 'estimated');

  return {
    ok: failures.length === 0,
    routed,
    failures,
    totalUsd: Number(totalUsd.toFixed(4)),
    localCount,
    paidCount: routed.filter((r) => r.ok && r.engine === 'openrouter').length,
    costConfidence: anyEstimated ? 'estimated' : 'listed',
    budget: routing.budget,
  };
}

module.exports = { ROUTING_PATH, loadRouting, snapDuration, routeShot, routeStoryboard };
