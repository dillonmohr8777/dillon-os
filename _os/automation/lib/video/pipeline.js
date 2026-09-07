'use strict';

/**
 * Orchestration: brief -> storyboard -> routed shots -> clips -> master + cuts.
 *
 * Split deliberately into `plan()` and `execute()`.
 *
 * `plan()` spends nothing. It runs the director, validates the storyboard, routes
 * every scene and totals the cost. `execute()` is the only function here that can
 * bill, and it refuses to start unless it is handed a plan that already passed
 * the budget gate. That split is what makes an approval step possible at all:
 * Telegram shows the plan and its price, a human says go, and the same plan
 * object is executed unchanged. Re-planning at approval time would let the price
 * a human agreed to differ from the price they get charged.
 */

const fs = require('fs');
const path = require('path');

const { direct } = require('./director');
const { validateStoryboard, normaliseStoryboard } = require('./storyboard');
const { routeStoryboard, loadRouting } = require('./router');
const { loadCatalog } = require('./registry');
const openrouter = require('./openrouter');
const localRender = require('./local-render');
const assemble = require('./assemble');
const ledger = require('./ledger');
const { dimensionsFor } = require('./pricing');

const OUTPUT_ROOT = process.env.VIDEO_OUTPUT_ROOT
  || path.join(__dirname, '..', '..', 'state', 'video-jobs');

function jobId() {
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '');
  return `vid-${stamp}-${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Brief (or a ready-made storyboard) -> priced plan. Spends nothing.
 */
async function plan(input, opts = {}) {
  const routing = opts.routing || loadRouting();
  const catalog = opts.catalog || loadCatalog();

  let storyboard;
  if (typeof input === 'object' && input && Array.isArray(input.scenes)) {
    storyboard = normaliseStoryboard(input, { aspect_ratio: opts.aspectRatio, tier: opts.tier });
  } else {
    const directed = await direct(String(input), {
      targetSeconds: opts.targetSeconds || 30,
      aspectRatio: opts.aspectRatio || routing.defaults?.master?.aspect_ratio || '4:3',
      tier: opts.tier || 'standard',
      brandRules: opts.brandRules,
      model: opts.directorModel,
      baseUrl: opts.directorBaseUrl,
    });
    if (!directed.ok) return { ok: false, stage: 'director', error: directed.error, attempts: directed.attempts };
    storyboard = directed.storyboard;
  }

  const check = validateStoryboard(storyboard);
  if (!check.ok) return { ok: false, stage: 'validate', error: check.errors.join('; '), errors: check.errors };

  const routed = routeStoryboard(storyboard, { routing, catalog, tier: opts.tier, maxUsd: opts.maxShotUsd });
  const budget = ledger.checkBudget(routed.totalUsd, routing.budget, { ledgerPath: opts.ledgerPath });

  return {
    ok: routed.ok,
    id: opts.id || jobId(),
    stage: 'planned',
    storyboard,
    routed,
    warnings: check.warnings,
    totalUsd: routed.totalUsd,
    localCount: routed.localCount,
    paidCount: routed.paidCount,
    costConfidence: routed.costConfidence,
    budget,
    failures: routed.failures,
  };
}

/** Render one locally-drawn scene to a clip. */
function renderLocalScene(scene, dir, opts) {
  const frames = localRender.renderFrames(scene, path.join(dir, 'frames'), {
    width: opts.width, height: opts.height, fps: opts.fps, brand: opts.brand, resume: opts.resume,
  });
  if (!frames.ok) return { ok: false, error: frames.reason };

  const clipPath = path.join(dir, 'clip.mp4');
  const enc = assemble.encodeFrames(path.join(dir, 'frames'), clipPath, { fps: opts.fps, bin: opts.ffmpegBin });
  if (!enc.ok) return { ok: false, error: enc.error };
  return { ok: true, path: clipPath, bytes: enc.bytes, engine: 'local', usd: 0 };
}

/** Submit, wait for and download one generative scene. */
async function renderPaidScene(routedShot, dir, opts) {
  const scene = routedShot.shot;
  const model = routedShot.model;

  const submitted = await openrouter.submit({
    model: model.id,
    prompt: scene.prompt,
    durationSeconds: routedShot.durationSeconds,
    resolution: routedShot.need.resolution,
    aspectRatio: routedShot.need.aspectRatio,
    audio: routedShot.need.audio,
    seed: scene.seed,
    firstFrame: scene.first_frame,
    lastFrame: scene.last_frame,
    inputReferences: scene.input_references,
  });
  if (!submitted.ok) return { ok: false, error: submitted.error, engine: 'openrouter' };

  if (typeof opts.onSubmit === 'function') opts.onSubmit(scene, submitted);

  const finished = await openrouter.waitFor(submitted.id, {
    pollingUrl: submitted.pollingUrl,
    timeoutMs: opts.jobTimeoutMs,
    onTick: opts.onTick,
  });

  // Record the billing observation whether or not the download succeeds — the
  // charge happened at generation time, not at download time.
  const actualUsd = finished.cost ?? null;
  ledger.record({
    jobId: submitted.id,
    model: model.id,
    resolution: routedShot.need.resolution,
    aspectRatio: routedShot.need.aspectRatio,
    durationSeconds: routedShot.durationSeconds,
    audio: routedShot.need.audio,
    estimatedUsd: routedShot.cost.usd,
    actualUsd,
    status: finished.ok ? 'completed' : (finished.timedOut ? 'timeout' : 'failed'),
    label: opts.label || null,
  }, opts.ledgerPath);

  if (!finished.ok) {
    return { ok: false, error: finished.error, engine: 'openrouter', jobId: submitted.id, timedOut: finished.timedOut, usd: actualUsd || 0 };
  }

  const clipPath = path.join(dir, 'clip.mp4');
  fs.mkdirSync(dir, { recursive: true });
  const dl = await openrouter.download(finished, clipPath);
  if (!dl.ok) return { ok: false, error: `generated but download failed: ${dl.error}`, jobId: submitted.id, usd: actualUsd || 0 };

  return {
    ok: true, path: clipPath, bytes: dl.bytes, engine: 'openrouter',
    model: model.id, jobId: submitted.id,
    usd: actualUsd ?? routedShot.cost.usd,
    costWasEstimated: actualUsd == null,
  };
}

/**
 * Execute a plan. THIS SPENDS MONEY.
 *
 * Requires `confirm: true` — not as ceremony, but because this function is
 * reachable from a Telegram message, and a typo should never be able to start a
 * paid render.
 */
async function execute(planned, opts = {}) {
  if (!opts.confirm) {
    return { ok: false, stage: 'confirm', error: 'execute() requires confirm:true — it bills OpenRouter' };
  }
  if (!planned || !planned.ok) {
    return { ok: false, stage: 'plan', error: 'refusing to execute a plan that did not succeed' };
  }
  if (planned.budget && !planned.budget.ok) {
    return { ok: false, stage: 'budget', error: planned.budget.reason };
  }

  const routing = opts.routing || loadRouting();
  const fps = opts.fps || routing.defaults?.fps || 24;
  const aspect = planned.storyboard.aspect_ratio || routing.defaults?.master?.aspect_ratio || '4:3';

  // Master dimensions: the configured master when its aspect matches, otherwise
  // derived from the storyboard's aspect so a 9:16 piece is not letterboxed into
  // a 4:3 master and then re-padded back out.
  const configured = routing.defaults?.master;
  const master = configured && configured.aspect_ratio === aspect
    ? { width: configured.width, height: configured.height }
    : dimensionsFor('1080p', aspect) || { width: 1080, height: 1350 };

  const ff = assemble.probe(opts.ffmpegBin);
  if (!ff.ok) {
    return {
      ok: false, stage: 'ffmpeg',
      error: `ffmpeg cannot assemble video here — missing ${ff.missing.join(', ')}${ff.bin ? ` (found ${ff.bin})` : ''}. Install a full ffmpeg build and set FFMPEG_PATH.`,
      probe: ff,
    };
  }

  const jobDir = path.join(opts.outputRoot || OUTPUT_ROOT, planned.id);
  fs.mkdirSync(jobDir, { recursive: true });
  fs.writeFileSync(path.join(jobDir, 'plan.json'), JSON.stringify(planned, null, 2), 'utf8');

  const clips = [];
  const results = [];
  let spentUsd = 0;

  for (const routedShot of planned.routed.routed) {
    const sceneDir = path.join(jobDir, `scene-${String(routedShot.index + 1).padStart(2, '0')}`);
    fs.mkdirSync(sceneDir, { recursive: true });

    if (typeof opts.onScene === 'function') opts.onScene(routedShot);

    const res = routedShot.engine === 'local'
      ? renderLocalScene(routedShot.shot, sceneDir, { ...opts, width: master.width, height: master.height, fps, ffmpegBin: ff.bin })
      : await renderPaidScene(routedShot, sceneDir, { ...opts, label: planned.id });

    results.push({ index: routedShot.index, id: routedShot.shot.id, ...res });
    spentUsd += Number(res.usd) || 0;

    if (res.ok) clips.push(res.path);
    else if (!opts.continueOnError) {
      return { ok: false, stage: 'render', error: `scene ${routedShot.index + 1} failed: ${res.error}`, results, spentUsd, jobDir };
    }
  }

  if (!clips.length) return { ok: false, stage: 'render', error: 'no clips rendered', results, spentUsd, jobDir };

  const masterPath = path.join(jobDir, 'master.mp4');
  const cat = assemble.concatClips(clips, masterPath, {
    width: master.width, height: master.height, fps, bin: ff.bin,
  });
  if (!cat.ok) return { ok: false, stage: 'assemble', error: cat.error, results, spentUsd, jobDir };

  const srt = assemble.buildSrt(planned.storyboard.scenes);
  if (srt.trim()) fs.writeFileSync(path.join(jobDir, 'captions.srt'), srt, 'utf8');

  // Derivatives are optional: a failed 9:16 cut should not discard a good master.
  const derivatives = [];
  for (const d of (opts.derivatives || routing.defaults?.derivatives || [])) {
    const outPath = path.join(jobDir, `${d.name}.mp4`);
    const res = assemble.deriveAspect(masterPath, outPath, { width: d.width, height: d.height, bin: ff.bin });
    derivatives.push({ name: d.name, ok: res.ok, path: res.ok ? outPath : null, error: res.error || null });
  }

  return {
    ok: true, stage: 'complete',
    id: planned.id, jobDir,
    masterPath, derivatives,
    captionsPath: srt.trim() ? path.join(jobDir, 'captions.srt') : null,
    results, clips,
    spentUsd: Number(spentUsd.toFixed(4)),
    estimatedUsd: planned.totalUsd,
  };
}

module.exports = { OUTPUT_ROOT, plan, execute, jobId, renderLocalScene, renderPaidScene };
