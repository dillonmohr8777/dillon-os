#!/usr/bin/env node
/**
 * B2 - Jev Choice pick for the Gateway video model that animates the Sunburst still.
 * TypeSafe evaluation, `type: 'choice'` with a criteria MAP (option id -> description),
 * per EvaluationModelV4Question in @ai-sdk/provider. Not a string array.
 *
 * Every fact in the criteria map was read off the live gateway registry
 * (https://ai-gateway.vercel.sh/v1/models) at run time, not asserted:
 * video_capabilities.supported_operations is the authoritative i2v signal, and it
 * disagrees with the model NAMES. wan-v2.7-r2v is reference-to-video ONLY;
 * veo-3.1-lite is text-to-video ONLY. Neither can consume the still as a first frame.
 *
 * Writes JEV-VIDEO-PICK.json next to the still.
 *
 *   node pick-video-model.mjs            (spends ~$0.0001 on jev)
 */
import { experimental_evaluate as evaluate } from 'ai';
import { writeFileSync, existsSync, statSync } from 'node:fs';

const MODEL = 'typesafe-ai/jev';
const REGISTRY = 'https://ai-gateway.vercel.sh/v1/models';
const STILL = 'C:/Users/dillo/Documents/qwen/video-gen-tests/2026-09-17/sunburst-still.png';
const OUT = 'C:/Users/dillo/Documents/qwen/video-gen-tests/2026-09-17/JEV-VIDEO-PICK.json';

const CANDIDATES = [
  'bytedance/seedance-2.0-mini',
  'bytedance/seedance-2.0-fast',
  'google/veo-3.1-lite-generate-001',
  'google/veo-3.1-fast-generate-001',
  'klingai/kling-v3.0-i2v',
  'alibaba/wan-v2.7-r2v',
  'spacexai/grok-imagine-video-1.5',
];

// Read the registry live so the criteria map cannot go stale.
const reg = await fetch(REGISTRY);
if (!reg.ok) {
  console.log(`FAIL: registry returned ${reg.status}`);
  process.exitCode = 1;
} else {
  const all = (await reg.json()).data ?? [];

  const facts = {};
  for (const id of CANDIDATES) {
    const m = all.find((x) => x.id === id);
    if (!m) { facts[id] = { present: false }; continue; }
    const v = m.video_capabilities ?? {};
    const p = m.pricing ?? {};
    facts[id] = {
      present: true,
      name: m.name,
      operations: v.supported_operations ?? [],
      resolutions: v.supported_resolutions ?? [],
      durationsSeconds: v.supported_durations_seconds ?? [],
      fps: v.supported_fps ?? [],
      generateAudio: Boolean(v.generate_audio),
      zdr: m.zdr,
      perSecond: p.video_duration_pricing ?? null,
      perToken: p.video_token_pricing ?? null,
      description: (m.description ?? '').slice(0, 300),
    };
  }

  const stillOk = existsSync(STILL);
  const stillBytes = stillOk ? statSync(STILL).size : 0;

  const cheap = (f) => {
    if (!f.present) return 'not in the gateway registry';
    const i2v = f.operations.includes('image-to-video');
    const r2v = f.operations.includes('reference-to-video');
    const t2v = f.operations.includes('text-to-video');
    const price = f.perSecond
      ? f.perSecond.map((t) => `${t.resolution ?? t.mode ?? ''}${t.audio === undefined ? '' : t.audio ? '+audio' : ''}=$${t.cost_per_second}/s`).join(', ')
      : f.perToken
        ? `token-priced $${f.perToken.tiers?.[0]?.no_video_input?.cost_per_million_tokens}/M`
        : 'no pricing published';
    return [
      `ops=[${f.operations.join('|')}]`,
      `image-to-video=${i2v ? 'YES' : 'NO'}`,
      `reference-to-video=${r2v ? 'YES' : 'NO'}`,
      `text-to-video=${t2v ? 'YES' : 'NO'}`,
      `res=[${f.resolutions.join('/')}]`,
      `dur=[${f.durationsSeconds[0]}-${f.durationsSeconds[f.durationsSeconds.length - 1]}s]`,
      `fps=[${f.fps.join('/')}]`,
      `audio=${f.generateAudio}`,
      `zdr=${f.zdr}`,
      price,
    ].join('; ');
  };

  const criteria = {};
  for (const id of CANDIDATES) criteria[id] = cheap(facts[id]);
  criteria.block = null; // no description: decline to pick at all

  const state = {
    task: 'Animate one existing 1536x1024 PNG keyframe into a single 5-8 second 16:9 mp4. One clip only tonight, a hard cap.',
    still: {
      path: STILL,
      exists: stillOk,
      bytes: stillBytes,
      width: 1536,
      height: 1024,
      aspect: '3:2 (crop or letterbox to 16:9)',
      model: 'openai/gpt-image-2.5-sunburst',
      qc: 'PASS - free vision QC returned SHIP: soft clay/cream 3D render, floating phone + dashboard, sparse signal-orange #E27113 accents (arrow, dots, CTA pill), clean negative space on the left third, no logos, no watermark, no faces, no readable text.',
    },
    requirement: 'The chosen model MUST be able to take the still as the visual starting point. A text-to-video-only model would ignore the artwork and invent its own frame, which defeats the purpose.',
    motionIntent: 'Subtle premium motion only: slow camera push-in, gentle parallax float on the phone and dashboard, the orange arrow easing upward, soft light shift. No scene change, no new objects, no morphing of the clay surfaces.',
    constraints: {
      budget: 'One clip. Cheapest option that reliably preserves the source frame is preferred over cinematic maximum.',
      duration: '5-8 seconds',
      aspect: '16:9 landscape',
      audio: 'Not required; a silent clip is acceptable.',
      mustPreserveSourceFrame: true,
      noHiggsfield: true,
    },
    registryFacts: facts,
  };

  const r = await evaluate({
    model: MODEL,
    state,
    questions: {
      pickVideoModel: {
        type: 'choice',
        instructions: {
          question: 'Which single model should animate `still` given `requirement`, `motionIntent` and `constraints`?',
          decide: [
            'Hard gate first: the model must list image-to-video or reference-to-video in `ops`. A model whose only op is text-to-video cannot honour `mustPreserveSourceFrame` and must not be picked, however cheap it is.',
            'Then prefer the cheapest per-second or per-token rate among the models that pass the gate.',
            'Then prefer one whose `dur` range covers 5-8s and whose `res` covers 720p or better.',
            'Subtle-motion fidelity to a static source frame matters more than cinematic range or native audio here; `audio` is not required.',
            'Pick `block` only if NO option passes the hard gate, or if the still does not exist.',
          ],
          inspect: '`still`, `requirement`, `constraints`, and each option description',
        },
        criteria,
      },
    },
  });

  const a = r.answers.pickVideoModel;
  const chosen = a.choice;
  const chosenModelId = chosen === 'block' ? null : chosen;

  const result = {
    decidedAt: new Date().toISOString(),
    decidedBy: MODEL,
    resolvedModel: r.response?.modelId ?? 'not reported',
    questionType: 'choice',
    criteriaMapSize: Object.keys(criteria).length,
    choice: chosen,
    modelId: chosenModelId,
    probabilities: a.probabilities ?? null,
    usage: r.usage ?? null,
    gatewayReportedCost: r.providerMetadata?.gateway?.cost ?? null,
    still: { path: STILL, exists: stillOk, bytes: stillBytes },
    registryFacts: facts,
    criteriaSent: criteria,
  };

  writeFileSync(OUT, JSON.stringify(result, null, 2));

  console.log(`choice      ${chosen}`);
  console.log(`modelId     ${chosenModelId ?? '(none - block)'}`);
  console.log(`resolved    ${result.resolvedModel}`);
  if (a.probabilities) {
    console.log('distribution:');
    for (const [k, v] of Object.entries(a.probabilities).sort((x, y) => y[1] - x[1])) {
      console.log(`  ${(v * 100).toFixed(1).padStart(5)}%  ${k}`);
    }
  }
  console.log(`usage       ${JSON.stringify(r.usage ?? {})}`);
  console.log(`cost        ${result.gatewayReportedCost !== null ? '$' + result.gatewayReportedCost : 'not reported by gateway'}`);
  console.log(`wrote       ${OUT}`);
}
