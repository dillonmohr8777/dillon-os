#!/usr/bin/env node
/**
 * bakeoff.mjs - run YOUR real jobs across candidate models and compare on
 * billed cost, latency and output, instead of trusting a benchmark table.
 *
 * Benchmarks measure someone else's tasks. This measures yours. Every number
 * it prints is read from the Gateway's own response, not computed from a list
 * price: providerMetadata.gateway.cost is what you were actually charged.
 *
 *   node bakeoff.mjs                 dry run, prints the plan and an estimate
 *   node bakeoff.mjs --live          spends, writes bakeoff-results/
 *   node bakeoff.mjs --live --models a,b,c --job report
 */

import { generateText } from 'ai';
import { writeFileSync, mkdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const KEY_VAR = 'AI_GATEWAY_API_KEY';
const OUT_DIR = 'bakeoff-results';

/** Non-US-frontier candidates, cheapest first. Edit freely. */
const MODELS = [
  // Never tried. Top two on Terminal-Bench 4.0 (58.2% and 57.9%).
  'openai/gpt-6-astra',
  'anthropic/claude-fable-5.1',
  // Frontier value: 2M context, reasoning, at an eighth of the above.
  'spacexai/grok-4.20-reasoning',
  'moonshotai/kimi-k3',
  // The benchmark pick: beats Sonnet 5 by 29pts on Terminal-Bench, 1/13th the price.
  'zai/glm-5.3-flash',
  // Cheap tier.
  'deepseek/deepseek-v4-flash',
  'alibaba/qwen3.7-flash',
  'inclusionai/ling-3.0-flash',
  // Control. Everything gets judged against this.
  'anthropic/claude-sonnet-5',
];

/**
 * Real recurring Momentum jobs. Swap the prompts for actual briefs and the
 * comparison gets sharper - generic prompts produce generic differences.
 */
const JOBS = {
  report: {
    what: 'Client report section from measured numbers',
    prompt: `You write client-facing marketing reports for Momentum Digital, a Philadelphia agency.

Write the "What happened" section of a weekly report for a landscaping client, from these MEASURED figures. Do not invent any number that is not here.

- Spend: $1,113 across three search terms, 0 conversions from those three
- Top term by clicks: "timberline landscaping" (a competitor's brand), 6 of 17 total conversions
- Cost per click on the three dead terms: $39 to $54
- Call tracking: not installed. "Phone call lead" is the primary conversion on 9 of 9 campaigns.

Be direct about the problem. No dashes anywhere in the output. Under 250 words.`,
  },
  outreach: {
    what: 'Cold outreach draft',
    prompt: `Write a cold email from Dillon Mohr at Momentum Digital to the owner of a family-run masonry company in Philadelphia.

Their website has no phone number above the fold and no Google Business Profile posts since March. Reference both specifically. Offer a free 15 minute audit. No dashes anywhere. Under 120 words. Subject line separate.`,
  },
  triage: {
    what: 'Structured triage, JSON out',
    prompt: `Classify this client Slack message. Return ONLY valid JSON with keys: urgency (low|medium|high), category (billing|performance|access|scope|other), needs_human (boolean), one_line_summary (string).

Message: "hey so the leads we got this week were all people looking for jobs not customers. third week running. starting to wonder what we are paying for here."`,
  },
  code: {
    what: 'Small coding task with a correctness trap',
    prompt: `Write a Node.js function contrastRatio(hex1, hex2) that returns the WCAG 2.1 contrast ratio between two hex colours.

Requirements: handle 3 and 6 digit hex, with or without a leading #. Apply the sRGB linearisation correctly (the 0.03928 threshold). Return a number rounded to 2 decimals. Include three assert-based self-checks, one of which must be a known AA failure. Code only, no explanation.`,
  },
};

function parseArgs(argv) {
  const get = (flag, fallback) => {
    const i = argv.indexOf(flag);
    return i !== -1 && argv[i + 1] ? argv[i + 1] : fallback;
  };
  return {
    live: argv.includes('--live'),
    models: get('--models', '').split(',').filter(Boolean),
    jobs: get('--job', '').split(',').filter(Boolean),
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const models = args.models.length ? args.models : MODELS;
  const jobs = args.jobs.length ? args.jobs : Object.keys(JOBS);
  const runs = models.length * jobs.length;

  console.log(`models    ${models.length}`);
  console.log(`jobs      ${jobs.join(', ')}`);
  console.log(`runs      ${runs}\n`);

  if (!args.live) {
    console.log('DRY RUN - nothing sent, nothing spent.\n');
    for (const j of jobs) console.log(`  ${j.padEnd(10)} ${JOBS[j].what}`);
    console.log('\nmodels:');
    for (const m of models) console.log(`  ${m}`);
    // Ballpark only. Real cost comes back per call from the Gateway.
    console.log(`\n  ~${runs} calls, most of these models are under $0.001 per call.`);
    console.log('  Expect well under $0.05 total. Exact billed cost is reported per call on the live run.');
    console.log('\nre-run with --live to send it.');
    return;
  }

  if (!process.env[KEY_VAR]) {
    console.error(`${KEY_VAR} is not set.`);
    process.exitCode = 2;
    return;
  }

  mkdirSync(OUT_DIR, { recursive: true });
  const rows = [];

  for (const jobId of jobs) {
    console.log(`\n=== ${jobId}: ${JOBS[jobId].what} ===\n`);
    for (const model of models) {
      const t0 = Date.now();
      try {
        const r = await generateText({ model, prompt: JOBS[jobId].prompt });
        const ms = Date.now() - t0;
        const cost = Number(r.providerMetadata?.gateway?.cost ?? NaN);
        rows.push({ jobId, model, ms, cost, chars: r.text.length, ok: true });
        console.log(
          `  ${model.padEnd(36)} ${String(ms).padStart(6)}ms  ` +
            `$${Number.isFinite(cost) ? cost.toFixed(6) : '   ?  '}  ${String(r.text.length).padStart(5)} chars`,
        );
        writeFileSync(`${OUT_DIR}/${jobId}__${model.replace(/\//g, '_')}.md`, r.text);
      } catch (e) {
        rows.push({ jobId, model, ok: false, error: e.message?.slice(0, 120) });
        console.log(`  ${model.padEnd(36)} FAILED  ${e.message?.split('\n')[0].slice(0, 80)}`);
      }
    }
  }

  const ok = rows.filter((r) => r.ok);
  const total = ok.reduce((n, r) => n + (Number.isFinite(r.cost) ? r.cost : 0), 0);

  console.log(`\n=== totals ===`);
  console.log(`  ${ok.length}/${rows.length} succeeded`);
  console.log(`  $${total.toFixed(6)} billed across all runs (from providerMetadata.gateway.cost)`);
  console.log(`  outputs written to ${OUT_DIR}/ - read them, that is the actual comparison`);

  // Per-model rollup. Cost and speed are measured here; QUALITY IS NOT.
  // Nothing in this script can rank output quality. Read the files.
  console.log(`\n  model                                 avg ms    total $`);
  for (const m of models) {
    const mine = ok.filter((r) => r.model === m);
    if (!mine.length) continue;
    const avg = Math.round(mine.reduce((n, r) => n + r.ms, 0) / mine.length);
    const sum = mine.reduce((n, r) => n + (Number.isFinite(r.cost) ? r.cost : 0), 0);
    console.log(`  ${m.padEnd(36)} ${String(avg).padStart(6)}  ${sum.toFixed(6)}`);
  }

  writeFileSync(`${OUT_DIR}/results.json`, JSON.stringify(rows, null, 2));
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => {
    console.error(e.message);
    process.exit(1);
  });
}
