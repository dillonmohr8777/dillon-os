'use strict';

/**
 * The storyboard is the contract between the director (a language model) and the
 * renderer (which spends money).
 *
 * Everything a local model produces is validated here before a single shot is
 * submitted. That ordering is the whole safety story: a hallucinated 47-second
 * scene, a scene_type that does not exist, or a missing prompt costs nothing if
 * it is caught at plan time, and costs real dollars if it is caught at spend time.
 *
 * Validation is strict and returns every problem at once rather than throwing on
 * the first, because the director is asked to repair its own output and needs the
 * complete list to do it in one pass.
 */

const SCENE_TYPES = new Set([
  // Rendered locally, $0.
  'title_card', 'stick_figure', 'kinetic_type', 'chart', 'ui_mock',
  'logo_sting', 'lower_third', 'end_card',
  // Sent to a generative video model.
  'generative',
]);

const ASPECT_RATIOS = new Set(['21:9', '16:9', '4:3', '3:2', '1:1', '2:3', '3:4', '9:16', '9:21']);
const TIERS = new Set(['draft', 'standard', 'branded', 'premium']);

const MAX_SCENES = 40;
const MAX_SCENE_SECONDS = 30;
const MIN_SCENE_SECONDS = 1;

function isPlainObject(v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

/**
 * @returns {{ok:boolean, errors:string[], warnings:string[]}}
 */
function validateStoryboard(sb) {
  const errors = [];
  const warnings = [];

  if (!isPlainObject(sb)) return { ok: false, errors: ['storyboard must be an object'], warnings };

  if (!sb.title || typeof sb.title !== 'string') errors.push('title: required string');
  if (sb.aspect_ratio && !ASPECT_RATIOS.has(sb.aspect_ratio)) {
    errors.push(`aspect_ratio: '${sb.aspect_ratio}' is not one OpenRouter accepts (${[...ASPECT_RATIOS].join(', ')})`);
  }
  if (sb.tier && !TIERS.has(sb.tier)) errors.push(`tier: '${sb.tier}' unknown (${[...TIERS].join(', ')})`);

  if (!Array.isArray(sb.scenes) || sb.scenes.length === 0) {
    errors.push('scenes: required non-empty array');
    return { ok: false, errors, warnings };
  }
  if (sb.scenes.length > MAX_SCENES) {
    errors.push(`scenes: ${sb.scenes.length} exceeds the ${MAX_SCENES}-scene cap`);
  }

  const seenIds = new Set();
  sb.scenes.forEach((scene, i) => {
    const at = `scenes[${i}]`;
    if (!isPlainObject(scene)) {
      errors.push(`${at}: must be an object`);
      return;
    }

    if (scene.id) {
      if (seenIds.has(scene.id)) errors.push(`${at}.id: duplicate '${scene.id}'`);
      seenIds.add(scene.id);
    }

    if (!scene.scene_type || !SCENE_TYPES.has(scene.scene_type)) {
      errors.push(`${at}.scene_type: '${scene.scene_type}' invalid (${[...SCENE_TYPES].join(', ')})`);
    }

    const d = Number(scene.duration_seconds);
    if (!Number.isFinite(d) || d < MIN_SCENE_SECONDS || d > MAX_SCENE_SECONDS) {
      errors.push(`${at}.duration_seconds: must be ${MIN_SCENE_SECONDS}-${MAX_SCENE_SECONDS}, got ${scene.duration_seconds}`);
    }

    // A generative scene with no prompt would bill for whatever the model
    // invents. Local scenes need text instead.
    if (scene.scene_type === 'generative') {
      if (!scene.prompt || String(scene.prompt).trim().length < 8) {
        errors.push(`${at}.prompt: generative scenes need a prompt of at least 8 characters`);
      }
    } else if (scene.scene_type && SCENE_TYPES.has(scene.scene_type)) {
      const hasText = scene.text || scene.headline || scene.caption || scene.narration;
      if (!hasText) warnings.push(`${at}: local scene has no text, headline, caption or narration — it will render blank`);
    }

    if (scene.tier && !TIERS.has(scene.tier)) errors.push(`${at}.tier: '${scene.tier}' unknown`);
    if (scene.aspect_ratio && !ASPECT_RATIOS.has(scene.aspect_ratio)) {
      errors.push(`${at}.aspect_ratio: '${scene.aspect_ratio}' invalid`);
    }
    if (scene.seed !== undefined && scene.seed !== null && !Number.isFinite(Number(scene.seed))) {
      errors.push(`${at}.seed: must be a number`);
    }
  });

  const total = sb.scenes.reduce((s, sc) => s + (Number(sc?.duration_seconds) || 0), 0);
  if (sb.target_duration_seconds) {
    const target = Number(sb.target_duration_seconds);
    // 25% drift is the point where a "30 second ad" stops being one.
    if (Number.isFinite(target) && Math.abs(total - target) > target * 0.25) {
      warnings.push(`scene durations total ${total}s against a ${target}s target`);
    }
  }

  return { ok: errors.length === 0, errors, warnings, totalDurationSeconds: total };
}

/** Fill defaults so downstream code never guesses. Does not mutate the input. */
function normaliseStoryboard(sb, defaults = {}) {
  const aspect = sb.aspect_ratio || defaults.aspect_ratio || '4:3';
  const tier = sb.tier || defaults.tier || 'standard';

  return {
    ...sb,
    aspect_ratio: aspect,
    tier,
    scenes: (sb.scenes || []).map((scene, i) => ({
      id: scene.id || `s${i + 1}`,
      scene_type: scene.scene_type || 'generative',
      duration_seconds: Number(scene.duration_seconds) || 5,
      aspect_ratio: scene.aspect_ratio || aspect,
      tier: scene.tier || tier,
      ...scene,
      // Re-apply after the spread so the computed values win over undefined keys.
      ...(scene.id ? {} : { id: `s${i + 1}` }),
    })),
  };
}

/**
 * The JSON contract handed to the director model, in prose it can follow.
 * Kept next to the validator deliberately — if one changes without the other,
 * every generation fails validation and the drift is obvious immediately.
 */
function schemaPrompt() {
  return [
    'Return ONLY a JSON object. No markdown fence, no commentary.',
    '',
    '{',
    '  "title": string,',
    '  "target_duration_seconds": number,',
    '  "aspect_ratio": one of ' + [...ASPECT_RATIOS].join(' | ') + ',',
    '  "tier": one of ' + [...TIERS].join(' | ') + ',',
    '  "scenes": [',
    '    {',
    '      "id": short string,',
    '      "scene_type": one of ' + [...SCENE_TYPES].join(' | ') + ',',
    `      "duration_seconds": number between ${MIN_SCENE_SECONDS} and ${MAX_SCENE_SECONDS},`,
    '      "prompt": string (REQUIRED and >=8 chars when scene_type is "generative"; omit otherwise),',
    '      "headline": string (on-screen text for local scene types),',
    '      "caption": string (burned-in caption, <= 90 chars),',
    '      "narration": string (voiceover line for this scene)',
    '    }',
    '  ]',
    '}',
    '',
    'Rules that matter:',
    '- Use "generative" ONLY when the shot needs real filmed-looking motion.',
    '- Anything that is words on screen, a logo, a chart, a UI, or a stick-figure',
    '  explainer MUST use a local scene_type. Those render for free and spell text',
    '  correctly; generative models bill per second and misspell on-screen text.',
    '- Prefer 4-8 second scenes. Keep the scene count under 12 for a 30s piece.',
    '- Write prompts as camera direction: subject, action, framing, lighting, motion.',
  ].join('\n');
}

module.exports = {
  SCENE_TYPES, ASPECT_RATIOS, TIERS,
  MAX_SCENES, MAX_SCENE_SECONDS, MIN_SCENE_SECONDS,
  validateStoryboard, normaliseStoryboard, schemaPrompt,
};
