#!/usr/bin/env node
'use strict';

/**
 * Execute a plan. THIS SPENDS MONEY, so --confirm is mandatory.
 *
 *   node video-render.js --plan plan.json --confirm
 *   node video-render.js --storyboard sb.json --tier draft --confirm
 */

const fs = require('fs');
const pipeline = require('../lib/video/pipeline');
const { formatPlan } = require('./video-telegram');

function arg(name, fallback = null) {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? fallback : process.argv[i + 1];
}
const has = (name) => process.argv.includes(`--${name}`);

async function main() {
  const planPath = arg('plan');
  const storyboardPath = arg('storyboard');
  const brief = process.argv.slice(2).filter((a) => !a.startsWith('--') && a !== planPath && a !== storyboardPath).join(' ');

  let planned;
  if (planPath) {
    planned = JSON.parse(fs.readFileSync(planPath, 'utf8'));
  } else {
    const input = storyboardPath ? JSON.parse(fs.readFileSync(storyboardPath, 'utf8')) : brief;
    if (!storyboardPath && !brief.trim()) {
      console.error('Usage: video-render.js --plan <plan.json> --confirm');
      console.error('   or: video-render.js --storyboard <sb.json> [--tier draft] --confirm');
      process.exit(1);
    }
    planned = await pipeline.plan(input, {
      tier: arg('tier', 'standard'),
      targetSeconds: Number(arg('seconds', 30)),
      aspectRatio: arg('aspect', '16:9'),
    });
  }

  if (!planned.ok) {
    console.error(`Plan is not renderable: ${planned.error || planned.failures?.map((f) => f.reason).join('; ')}`);
    process.exit(1);
  }

  console.log(formatPlan(planned));

  if (!has('confirm')) {
    console.log('\nNothing rendered. Re-run with --confirm to spend the estimate above.');
    process.exit(0);
  }

  const result = await pipeline.execute(planned, {
    confirm: true,
    continueOnError: has('continue-on-error'),
    onScene: (r) => console.log(`  scene ${r.index + 1}: ${r.engine === 'local' ? 'local render' : r.model.id}`),
  });

  if (!result.ok) {
    console.error(`\nFailed at ${result.stage}: ${result.error}`);
    if (result.spentUsd) console.error(`Spent before failing: $${result.spentUsd.toFixed(4)}`);
    process.exit(1);
  }

  console.log(`\nMaster:   ${result.masterPath}`);
  result.derivatives.forEach((d) => console.log(`${(d.name + ':').padEnd(10)}${d.ok ? d.path : `FAILED — ${d.error}`}`));
  if (result.captionsPath) console.log(`Captions: ${result.captionsPath}`);
  console.log(`\nSpent $${result.spentUsd.toFixed(4)} (estimated $${result.estimatedUsd.toFixed(4)})`);
}

main().catch((err) => { console.error(err.stack || err.message); process.exit(1); });
