#!/usr/bin/env node
'use strict';

/**
 * Inspect and refresh the OpenRouter video catalog.
 *
 *   node video-models.js                       cheapest route per tier
 *   node video-models.js --refresh             re-fetch the live catalog
 *   node video-models.js --cheapest 720p 16:9 8   rank every model for a shot
 *   node video-models.js --model <id>          one model's capabilities and SKUs
 */

const fs = require('fs');
const { loadCatalog, candidatesFor, getModel, CATALOG_PATH, clearCache } = require('../lib/video/registry');
const { loadRouting, routeShot } = require('../lib/video/router');
const { fetchCatalog } = require('../lib/video/openrouter');

const money = (n) => `$${Number(n).toFixed(4)}`;

async function refresh() {
  const res = await fetchCatalog();
  if (!res.ok) {
    console.error(`Refresh failed: ${res.error}`);
    process.exit(1);
  }
  const payload = {
    _comment: 'Live snapshot of GET https://openrouter.ai/api/v1/videos/models. Refresh with: node _os/automation/bin/video-models.js --refresh',
    source: 'https://openrouter.ai/api/v1/videos/models',
    fetched_at: new Date().toISOString(),
    model_count: res.models.length,
    models: res.models.map((m) => ({
      id: m.id,
      name: m.name,
      supported_resolutions: m.supported_resolutions || [],
      supported_aspect_ratios: m.supported_aspect_ratios || [],
      supported_durations: m.supported_durations || [],
      supported_frame_images: m.supported_frame_images || [],
      generate_audio: m.generate_audio || false,
      seed: m.seed || false,
      pricing_skus: m.pricing_skus || {},
      allowed_passthrough_parameters: m.allowed_passthrough_parameters || [],
    })),
  };

  const before = loadCatalog();
  fs.writeFileSync(CATALOG_PATH, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  clearCache();

  const beforeIds = new Set(before.models.map((m) => m.id));
  const afterIds = new Set(payload.models.map((m) => m.id));
  const added = [...afterIds].filter((id) => !beforeIds.has(id));
  const removed = [...beforeIds].filter((id) => !afterIds.has(id));

  console.log(`Catalog refreshed: ${payload.model_count} models.`);
  if (added.length) console.log(`  added:   ${added.join(', ')}`);
  if (removed.length) console.log(`  removed: ${removed.join(', ')}`);
  if (!added.length && !removed.length) console.log('  no membership change.');
}

function cheapest(resolution, aspectRatio, duration) {
  const { accepted, rejected } = candidatesFor({
    resolution, aspectRatio, durationSeconds: Number(duration), audio: false,
  });
  console.log(`Models for ${resolution} ${aspectRatio} ${duration}s, no audio:\n`);
  accepted.forEach((c, i) => {
    console.log(`${String(i + 1).padStart(2)}. ${c.model.id.padEnd(34)} ${money(c.cost.usd).padStart(9)}  ${String(c.cost.usdPerSecond).padStart(9)}/s  ${c.cost.confidence}`);
  });
  console.log(`\n${rejected.length} model(s) excluded:`);
  rejected.forEach((r) => console.log(`    ${r.id}: ${r.reason}`));
}

function describe(id) {
  const m = getModel(id);
  if (!m) {
    console.error(`No model '${id}' in the catalog.`);
    process.exit(1);
  }
  console.log(`${m.name}  (${m.id})\n`);
  console.log(`  resolutions: ${m.supported_resolutions.join(', ') || '(not selectable)'}`);
  console.log(`  aspects:     ${m.supported_aspect_ratios.join(', ') || '(not selectable)'}`);
  console.log(`  durations:   ${m.supported_durations.join(', ') || '(not selectable)'}`);
  console.log(`  frames:      ${m.supported_frame_images.join(', ') || 'none'}`);
  console.log(`  audio:       ${m.generate_audio}   seed: ${m.seed}`);
  console.log('  pricing SKUs:');
  Object.entries(m.pricing_skus).forEach(([k, v]) => console.log(`    ${k.padEnd(46)} ${v}`));
}

function tiers() {
  const routing = loadRouting();
  const catalog = loadCatalog();
  console.log(`Catalog fetched ${catalog.fetchedAt} — ${catalog.models.length} models\n`);
  console.log('Cheapest route per tier (6s, 16:9):\n');
  for (const [name, tier] of Object.entries(routing.tiers)) {
    const r = routeShot({ tier: name, duration_seconds: 6, aspect_ratio: '16:9', scene_type: 'generative', prompt: 'probe' });
    console.log(r.ok
      ? `  ${name.padEnd(9)} ${r.model.id.padEnd(32)} ${money(r.cost.usd)}  (${r.cost.usdPerSecond}/s, ${r.cost.confidence})`
      : `  ${name.padEnd(9)} unavailable — ${r.reason}`);
    console.log(`            ${tier.description}`);
  }
  console.log(`\nFree locally: ${routing.local_scene_types.types.join(', ')}`);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--refresh')) return refresh();
  const ci = args.indexOf('--cheapest');
  if (ci !== -1) return cheapest(args[ci + 1] || '720p', args[ci + 2] || '16:9', args[ci + 3] || 6);
  const mi = args.indexOf('--model');
  if (mi !== -1) return describe(args[mi + 1]);
  return tiers();
}

main().catch((err) => { console.error(err.message); process.exit(1); });
