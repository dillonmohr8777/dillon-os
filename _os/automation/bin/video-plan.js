#!/usr/bin/env node
'use strict';

/**
 * Plan a video. Spends nothing.
 *
 *   node video-plan.js "Bridge Signal 30s explainer" --tier standard --seconds 30
 *   node video-plan.js --storyboard path/to/storyboard.json
 *   node video-plan.js "..." --out plan.json
 */

const fs = require('fs');
const pipeline = require('../lib/video/pipeline');
const { formatPlan } = require('./video-telegram');

function arg(name, fallback = null) {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? fallback : process.argv[i + 1];
}

async function main() {
  const storyboardPath = arg('storyboard');
  const brief = process.argv.slice(2).filter((a) => !a.startsWith('--')).join(' ');

  const input = storyboardPath ? JSON.parse(fs.readFileSync(storyboardPath, 'utf8')) : brief;
  if (!storyboardPath && !brief.trim()) {
    console.error('Usage: video-plan.js "<brief>" [--tier standard] [--seconds 30] [--aspect 16:9]');
    console.error('   or: video-plan.js --storyboard <file.json>');
    process.exit(1);
  }

  const planned = await pipeline.plan(input, {
    tier: arg('tier', 'standard'),
    targetSeconds: Number(arg('seconds', 30)),
    aspectRatio: arg('aspect', '16:9'),
    directorModel: arg('model'),
    directorBaseUrl: arg('director-url'),
  });

  if (!planned.ok && planned.stage) {
    console.error(`Failed at ${planned.stage}: ${planned.error}`);
    if (planned.attempts) console.error(JSON.stringify(planned.attempts, null, 2));
    process.exit(1);
  }

  console.log(formatPlan(planned));

  const out = arg('out');
  if (out) {
    fs.writeFileSync(out, JSON.stringify(planned, null, 2), 'utf8');
    console.log(`\nPlan written to ${out} — render it with:\n  node _os/automation/bin/video-render.js --plan ${out} --confirm`);
  }
}

main().catch((err) => { console.error(err.stack || err.message); process.exit(1); });
