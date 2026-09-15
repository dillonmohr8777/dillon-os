'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const pricing = require('../lib/video/pricing');
const registry = require('../lib/video/registry');
const router = require('../lib/video/router');
const storyboard = require('../lib/video/storyboard');
const ledger = require('../lib/video/ledger');
const assemble = require('../lib/video/assemble');
const openrouter = require('../lib/video/openrouter');
const director = require('../lib/video/director');
const localRender = require('../lib/video/local-render');

function tmpFile(name) {
  return path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'video-test-')), name);
}

/* ---------------------------------------------------------------- pricing */

test('video token formula reproduces the published Seedance 1.5 Pro rate', () => {
  // ByteDance publishes $0.023/second for Seedance 1.5 Pro at 480p. If this
  // drifts, the token formula is wrong and every Seedance estimate is wrong.
  const model = registry.getModel('bytedance/seedance-1-5-pro');
  const cost = pricing.estimateShotCost(model, {
    resolution: '480p', aspectRatio: '16:9', durationSeconds: 5, audio: true,
  });
  assert.equal(cost.ok, true);
  assert.ok(Math.abs(cost.usdPerSecond - 0.023) < 0.0005,
    `expected ~$0.023/s, got $${cost.usdPerSecond}`);
});

test('resolution labels resolve by short side, so vertical is not double-billed', () => {
  assert.deepEqual(pricing.dimensionsFor('720p', '16:9'), { width: 1280, height: 720 });
  assert.deepEqual(pricing.dimensionsFor('720p', '9:16'), { width: 720, height: 1280 });
  // Same pixel count either way -> identical token cost.
  const model = registry.getModel('bytedance/seedance-1-5-pro');
  const land = pricing.estimateShotCost(model, { resolution: '480p', aspectRatio: '16:9', durationSeconds: 5 });
  const vert = pricing.estimateShotCost(model, { resolution: '480p', aspectRatio: '9:16', durationSeconds: 5 });
  assert.equal(land.usd, vert.usd);
});

test('SKU selection honours resolution and audio, and never picks a contradicting SKU', () => {
  const veo = registry.getModel('google/veo-3.1-lite');
  const quiet = pricing.rateFor(veo, { resolution: '720p', audio: false });
  const loud = pricing.rateFor(veo, { resolution: '720p', audio: true });
  assert.equal(quiet.sku, 'duration_seconds_without_audio_720p');
  assert.equal(quiet.usdPerSecond, 0.03);
  assert.equal(loud.sku, 'duration_seconds_with_audio_720p');
  assert.equal(loud.usdPerSecond, 0.05);
  // A 1080p request must not be priced with a _720p SKU.
  const hd = pricing.rateFor(veo, { resolution: '1080p', audio: true });
  assert.ok(!hd.sku.includes('720p'), `1080p priced with ${hd.sku}`);
});

test('per-generation minimums floor the estimate', () => {
  const aleph = registry.getModel('runway/aleph-2');
  const cost = pricing.estimateShotCost(aleph, { resolution: '720p', aspectRatio: '16:9', durationSeconds: 1 });
  // $0.28/s for 1s is $0.28, but the model has a $0.56 floor.
  assert.equal(cost.usd, 0.56);
  assert.equal(cost.flooredTo, 0.56);
});

test('listed per-second prices are marked listed, token prices estimated', () => {
  const veo = registry.getModel('google/veo-3.1-lite');
  const seedance = registry.getModel('bytedance/seedance-1-5-pro');
  assert.equal(pricing.rateFor(veo, { resolution: '720p', audio: false }).confidence, 'listed');
  assert.equal(pricing.rateFor(seedance, { resolution: '480p', aspectRatio: '16:9' }).confidence, 'estimated');
});

/* --------------------------------------------------------------- registry */

test('capability filter rejects unsupported durations with a usable reason', () => {
  const veo = registry.getModel('google/veo-3.1-lite');
  // Veo 3.1 Lite offers 4, 6 and 8 seconds only.
  const bad = registry.checkCapability(veo, { durationSeconds: 5 });
  assert.equal(bad.ok, false);
  assert.match(bad.reason, /duration 5s unsupported/);
  assert.equal(registry.checkCapability(veo, { durationSeconds: 6 }).ok, true);
});

test('candidate ranking is cheapest-first and reports exclusions', () => {
  const { accepted, rejected } = registry.candidatesFor({
    resolution: '720p', aspectRatio: '16:9', durationSeconds: 8, audio: false,
  });
  assert.ok(accepted.length > 3);
  for (let i = 1; i < accepted.length; i += 1) {
    assert.ok(accepted[i].cost.usd >= accepted[i - 1].cost.usd, 'candidates must be sorted by cost');
  }
  assert.ok(rejected.every((r) => typeof r.reason === 'string' && r.reason.length > 0));
});

/* ----------------------------------------------------------------- router */

test('local scene types never reach a paid model', () => {
  for (const type of ['title_card', 'chart', 'stick_figure', 'kinetic_type', 'ui_mock', 'logo_sting', 'lower_third', 'end_card']) {
    const r = router.routeShot({ scene_type: type, duration_seconds: 4 });
    assert.equal(r.engine, 'local', `${type} routed to ${r.engine}`);
    assert.equal(r.cost.usd, 0);
  }
});

test('duration snaps per model rather than globally', () => {
  // 5s is unsupported by Veo (4/6/8) but supported by Seedance. A global snap
  // would exclude one of them; a per-model snap keeps both in the running.
  const veo = registry.getModel('google/veo-3.1-lite');
  assert.equal(router.snapDuration(veo, 5), 4);
  assert.equal(router.snapDuration(veo, 7), 6);
  assert.equal(router.snapDuration(registry.getModel('alibaba/wan-3.0'), 7), 7);
});

test('a tier only routes to models on its allowlist', () => {
  const routing = router.loadRouting();
  for (const tierName of ['standard', 'branded', 'premium']) {
    const r = router.routeShot({ tier: tierName, scene_type: 'generative', prompt: 'a probe shot', duration_seconds: 6, aspect_ratio: '16:9' });
    assert.equal(r.ok, true, `${tierName}: ${r.reason}`);
    assert.ok(routing.tiers[tierName].allow.includes(r.model.id),
      `${tierName} routed to ${r.model.id}, which is not on its allowlist`);
  }
});

test('a pinned model that cannot serve the shot fails at plan time', () => {
  const r = router.routeShot({
    scene_type: 'generative', prompt: 'a probe shot',
    model: 'minimax/hailuo-3', resolution: '720p', duration_seconds: 6, aspect_ratio: '16:9',
  });
  // Hailuo 3 is 2K-only; asking for 720p must not silently succeed.
  assert.equal(r.ok, false);
});

test('the per-shot budget cap blocks an over-cap route', () => {
  const r = router.routeShot(
    { tier: 'premium', scene_type: 'generative', prompt: 'a probe shot', duration_seconds: 8, aspect_ratio: '16:9' },
    { maxUsd: 0.01 }
  );
  assert.equal(r.ok, false);
  assert.match(r.reason, /exceeds per-shot cap/);
});

test('routing a storyboard totals only the paid scenes', () => {
  const sb = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'fixtures', 'video', 'saas-explainer.json'), 'utf8'));
  const routed = router.routeStoryboard(sb);
  assert.equal(routed.ok, true);
  assert.equal(routed.localCount + routed.paidCount, sb.scenes.length);
  assert.ok(routed.localCount >= 5, 'most scenes in this fixture should render locally');
  const paidSum = routed.routed.filter((r) => r.engine === 'openrouter').reduce((s, r) => s + r.cost.usd, 0);
  // totalUsd is deliberately rounded to 4dp for display; compare at that precision.
  assert.ok(Math.abs(routed.totalUsd - paidSum) < 1e-4);
});

/* ------------------------------------------------------------- storyboard */

test('validation rejects the failure modes a director model actually produces', () => {
  const bad = storyboard.validateStoryboard({
    title: 'T',
    scenes: [
      { scene_type: 'generative', duration_seconds: 5 },              // no prompt
      { scene_type: 'invented_type', duration_seconds: 4, prompt: 'x yyyyyyy' },
      { scene_type: 'generative', duration_seconds: 240, prompt: 'a long shot of a city' },
      { id: 'dup', scene_type: 'title_card', duration_seconds: 3, headline: 'a' },
      { id: 'dup', scene_type: 'title_card', duration_seconds: 3, headline: 'b' },
    ],
  });
  assert.equal(bad.ok, false);
  const joined = bad.errors.join('\n');
  assert.match(joined, /scenes\[0\]\.prompt/);
  assert.match(joined, /scenes\[1\]\.scene_type/);
  assert.match(joined, /scenes\[2\]\.duration_seconds/);
  assert.match(joined, /duplicate 'dup'/);
});

test('a valid storyboard passes and totals its duration', () => {
  const sb = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'fixtures', 'video', 'saas-explainer.json'), 'utf8'));
  const check = storyboard.validateStoryboard(sb);
  assert.equal(check.ok, true, check.errors.join('; '));
  assert.equal(check.totalDurationSeconds, 30);
});

test('normalise fills ids and inherits aspect and tier', () => {
  const n = storyboard.normaliseStoryboard(
    { title: 'T', scenes: [{ scene_type: 'title_card', duration_seconds: 3, headline: 'x' }] },
    { aspect_ratio: '9:16', tier: 'draft' }
  );
  assert.equal(n.scenes[0].id, 's1');
  assert.equal(n.scenes[0].aspect_ratio, '9:16');
  assert.equal(n.scenes[0].tier, 'draft');
});

test('the schema prompt and the validator agree on scene types', () => {
  // If these drift, every director generation fails validation.
  const prompt = storyboard.schemaPrompt();
  for (const type of storyboard.SCENE_TYPES) {
    assert.ok(prompt.includes(type), `schemaPrompt does not mention scene type '${type}'`);
  }
});

/* ----------------------------------------------------------------- ledger */

test('learned rate needs several samples and uses the median', () => {
  const p = tmpFile('ledger.jsonl');
  const entry = { model: 'm/x', resolution: '480p', durationSeconds: 5, audio: true, estimatedUsd: 0.1 };
  ledger.record({ ...entry, actualUsd: 0.10 }, p);
  ledger.record({ ...entry, actualUsd: 0.12 }, p);
  assert.equal(ledger.learnedRate('m/x', { resolution: '480p', audio: true }, p), null, 'two samples is not enough');

  ledger.record({ ...entry, actualUsd: 0.11 }, p);
  ledger.record({ ...entry, actualUsd: 9.99 }, p); // an outlier must not dominate
  const learned = ledger.learnedRate('m/x', { resolution: '480p', audio: true }, p);
  assert.equal(learned.samples, 4);
  assert.ok(learned.usdPerSecond < 0.05, `median should ignore the outlier, got ${learned.usdPerSecond}`);
});

test('budget gate blocks per-job and daily breaches', () => {
  const p = tmpFile('ledger.jsonl');
  const caps = { per_job_usd: 12, daily_usd: 40 };
  assert.equal(ledger.checkBudget(50, caps, { ledgerPath: p }).ok, false);

  ledger.record({ model: 'm/x', durationSeconds: 10, estimatedUsd: 38, actualUsd: 38 }, p);
  const blocked = ledger.checkBudget(5, caps, { ledgerPath: p });
  assert.equal(blocked.ok, false);
  assert.match(blocked.reason, /daily cap/);
  assert.equal(ledger.checkBudget(1, caps, { ledgerPath: p }).ok, true);
});

test('a torn ledger line does not poison reads', () => {
  const p = tmpFile('ledger.jsonl');
  ledger.record({ model: 'm/x', durationSeconds: 5, actualUsd: 1 }, p);
  fs.appendFileSync(p, '{"model":"m/x","truncated_'); // simulate a killed process
  assert.equal(ledger.readAll(p).length, 1);
});

/* --------------------------------------------------------------- openrouter */

test('request bodies use the documented field names', () => {
  const body = openrouter.buildRequest({
    model: 'google/veo-3.1-lite', prompt: 'a shot', durationSeconds: 8,
    resolution: '720p', aspectRatio: '16:9', audio: false, seed: 7,
    firstFrame: 'https://example.com/a.png', inputReferences: ['https://example.com/r.png'],
  });
  assert.equal(body.duration, 8);
  assert.equal(body.aspect_ratio, '16:9');
  assert.equal(body.generate_audio, false);
  assert.equal(body.frame_images[0].frame_type, 'first_frame');
  assert.equal(body.frame_images[0].image_url.url, 'https://example.com/a.png');
  assert.equal(body.input_references[0].type, 'image_url');
});

test('api keys are redacted from anything that could be echoed to chat', () => {
  const leaked = openrouter.redact('failed with sk-or-v1-abcdef0123456789 and Authorization: Bearer abcdef0123456789');
  assert.ok(!leaked.includes('abcdef0123456789'), leaked);
  assert.match(leaked, /sk-or-\*\*\*/);
});

/* ----------------------------------------------------------------- director */

test('json extraction survives braces inside strings and surrounding prose', () => {
  const out = director.extractJson('Sure!\n```json\n{"a":"a } brace","b":{"c":1}}\n```\nHope that helps');
  assert.deepEqual(out, { a: 'a } brace', b: { c: 1 } });
  assert.equal(director.extractJson('no json here'), null);
});

test('the director defaults to a local endpoint, not a paid one', () => {
  const cfg = director.directorConfig();
  assert.equal(cfg.isOpenRouter, false);
  assert.match(cfg.baseUrl, /localhost/);
});

/* -------------------------------------------------------------- assemble */

test('ffmpeg probe reports missing capabilities rather than claiming success', () => {
  // The Playwright-bundled ffmpeg is built --disable-everything with VP8 only.
  // Treating it as usable produces a confusing failure after money is spent.
  const stripped = '/opt/pw-browsers/ffmpeg-1011/ffmpeg-linux';
  if (!fs.existsSync(stripped)) return; // not present off this image
  const probe = assemble.probe(stripped);
  assert.equal(probe.ok, false);
  assert.ok(probe.missing.length > 0);
});

test('srt timings accumulate across scenes', () => {
  const srt = assemble.buildSrt([
    { duration_seconds: 3, caption: 'one' },
    { duration_seconds: 2.5, caption: 'two' },
  ]);
  assert.match(srt, /00:00:00,000 --> 00:00:03,000/);
  assert.match(srt, /00:00:03,000 --> 00:00:05,500/);
});

/* ----------------------------------------------------------- local render */

test('local scenes escape user text into HTML', () => {
  const html = localRender.sceneHtml({
    id: 's1', scene_type: 'title_card', duration_seconds: 3,
    headline: '<script>alert(1)</script>', caption: 'a & b',
  }, { width: 1080, height: 1350 });
  assert.ok(!html.includes('<script>alert(1)</script>'), 'headline was not escaped');
  assert.ok(html.includes('&lt;script&gt;'));
  assert.ok(html.includes('a &amp; b'));
});

test('local scenes are seekable rather than time-dependent', () => {
  const html = localRender.sceneHtml({ id: 's1', scene_type: 'title_card', duration_seconds: 3, headline: 'x' }, {});
  // Frame N must be a pure function of N, so the page reads ?t= and seeks.
  assert.match(html, /currentTime = t \* 1000/);
  assert.ok(!/requestAnimationFrame/.test(html), 'rAF would make frames depend on wall clock');
});

test('chart bars normalise to the largest value so they cannot overflow', () => {
  const html = localRender.sceneHtml({
    id: 'c', scene_type: 'chart', duration_seconds: 4,
    items: [{ label: 'a', value: 10 }, { label: 'b', value: 1000 }],
  }, {});
  const pcts = [...html.matchAll(/--pct:(\d+)%/g)].map((m) => Number(m[1]));
  assert.deepEqual(pcts, [1, 100]);
});
