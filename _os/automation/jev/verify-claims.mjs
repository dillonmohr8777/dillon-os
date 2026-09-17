#!/usr/bin/env node
/**
 * verify-claims.mjs - separate what someone ASSERTED from what was MEASURED.
 *
 * Built 2026-09-17 against typesafe-ai/jev on the Vercel AI Gateway.
 *
 * Why this rubric and not a token or contrast checker: hex equality and WCAG
 * contrast are arithmetic. A script does that better than any model and cannot
 * be wrong about it. What no script can do is read a status line that says
 * "PASS" or "root cause" and notice that nothing behind it was ever inspected,
 * or that what WAS inspected does not cover what the line claims.
 *
 * The question is never "is the claim true". It is "did anyone look, and did
 * what they looked at actually cover this".
 *
 * Question design follows TypeSafe's own build guide: atomic questions, each
 * evaluating ONE property, with structured criteria and backticked paths into
 * the state. Composition and every threshold live in code, not in the model.
 *
 * Default is DRY RUN and costs nothing. Spending requires --live, matching
 * System/scripts/Invoke-OpenAIAgentsSession.ps1.
 *
 *   node verify-claims.mjs --input records/<file>.json            (dry run)
 *   node verify-claims.mjs --input records/<file>.json --live     (spends)
 */

import { experimental_evaluate as evaluate } from 'ai';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const MODEL = 'typesafe-ai/jev';
const KEY_VAR = 'AI_GATEWAY_API_KEY';
const REGISTRY = 'https://ai-gateway.vercel.sh/v1/models';

/**
 * Six atomic questions against one shared state, answered in a single request.
 * Each one evaluates exactly one property of the evidence. Nothing here asks
 * the model for a verdict - the verdict is assembled in judge() below.
 */
const RUBRIC = {
  reportsAReading: {
    type: 'boolean',
    instructions: {
      question: 'Does `evidence` report a concrete value that was read off the artifact itself?',
      inspect: '`evidence`',
      focus: 'Look for a value someone observed, not for whether the claim sounds right.',
    },
    criteria: {
      true: {
        what: 'Contains a number, a hex value, a ratio, a date, a count, command output, or a status field read back from a system',
        examples: ['uptime 228,748s at 2026-09-13 12:00', 'exit code 0', '6 of 17 conversions'],
      },
      false: {
        what: 'Contains no observed value at all',
        not_for: 'Evidence that reports a value which happens to be unfavourable',
        examples: ['No evidence recorded alongside the claim.', 'QA row: PASS'],
      },
    },
  },

  scopeCoversClaim: {
    type: 'boolean',
    instructions: {
      question: 'Does the scope of `evidence` cover the full scope of `claim`?',
      compare: ['`claim`', '`evidence`'],
      focus:
        'Compare what the evidence actually ranges over - which window, which accounts, which systems - against what the claim asserts. A narrower reading does not establish a broader claim.',
    },
    criteria: {
      true: {
        what: 'The evidence ranges over everything the claim asserts',
        examples: ['A claim about one campaign, supported by that campaign report'],
      },
      false: {
        what: 'The evidence is narrower than the claim, or ranges over a different period, system or subject',
        examples: [
          'A 30-day aggregate used to explain one specific weekend',
          'An Ads-only failure used to call an entire connector dead',
        ],
      },
    },
  },

  restatesWithoutSupport: {
    type: 'boolean',
    instructions: {
      question: 'Does `evidence` merely restate `claim`, or record a bare verdict, without supporting it?',
      inspect: '`evidence`',
      focus: 'A verdict is a conclusion, not evidence for that conclusion.',
    },
    criteria: {
      true: {
        what: 'Repeats the claim in other words, or records only a verdict such as PASS, DONE, OK, COMPLETE, or CONFIRMED',
        examples: ['QA sheet: 10 of 10 PASS', 'Status: complete'],
      },
      false: {
        what: 'Adds information the claim does not already contain',
      },
    },
  },

  contradictsClaim: {
    type: 'boolean',
    instructions: {
      question: 'Does `evidence` contradict `claim`?',
      compare: ['`claim`', '`evidence`'],
      focus: 'Only judge direct conflict. Absent evidence is not a contradiction.',
    },
    criteria: {
      true: { what: 'The reading is inconsistent with what the claim asserts' },
      false: {
        what: 'The reading is consistent with the claim, or says nothing about it',
        not_for: 'Evidence that is simply missing',
      },
    },
  },

  supportIsTestimony: {
    type: 'boolean',
    instructions: {
      question: 'Does `evidence` rest on someone saying so, rather than on a reading taken from a system?',
      inspect: '`evidence`',
      focus: 'Distinguish a person reporting a fact from an instrument recording one. Both can be right; they are not the same kind of support.',
    },
    criteria: {
      true: {
        what: 'Attributed to a person, a meeting, a message, or a recollection',
        examples: ['per Dillon 2026-09-09', 'the client said it was fixed'],
      },
      false: { what: 'Taken from a file, a log, a report, a command, or an API' },
    },
  },

  blastRadius: {
    type: 'score',
    instructions: {
      question: 'If `claim` turns out to be wrong and someone acts on it, how bad is the outcome?',
      focus: 'Rate the consequence of acting on a false claim, not how likely it is to be false.',
    },
    criteria: [
      { what: 'Cosmetic', signals: ['Internal only', 'Caught and fixed at no cost'] },
      { what: 'Rework', signals: ['Internal rework', 'No outside party ever sees it'] },
      { what: 'External', signals: ['Something incorrect reaches a client or a prospect'] },
      {
        what: 'Trust',
        signals: [
          'A client or prospect receives something broken',
          'A decision gets made on a false status',
        ],
      },
    ],
  },
};

/** Weights for the evidence score. Tuned in code so they can be changed without touching the model. */
const WEIGHTS = { reading: 0.4, scope: 0.4, notRestated: 0.2 };
const FLAG_BELOW = 0.5;
const REVIEW_BELOW = 0.75;
const CONTRADICTION_AT = 0.5;
const SCOPE_GATE = 0.5;

/**
 * The verdict. Deterministic, entirely in code - the model supplies six
 * independent probabilities and never sees this composition.
 * Returns one of: 'ok' | 'review' | 'flag'.
 */
function judge(answers) {
  const p = {
    reading: answers.reportsAReading.probability,
    scope: answers.scopeCoversClaim.probability,
    restated: answers.restatesWithoutSupport.probability,
    contradicts: answers.contradictsClaim.probability,
    testimony: answers.supportIsTestimony.probability,
  };

  const evidenceScore =
    WEIGHTS.reading * p.reading +
    WEIGHTS.scope * p.scope +
    WEIGHTS.notRestated * (1 - p.restated);

  const reasons = [];
  let verdict = 'ok';

  if (p.contradicts >= CONTRADICTION_AT) {
    verdict = 'flag';
    reasons.push(`evidence contradicts the claim (P=${p.contradicts.toFixed(2)})`);
  } else if (p.scope < SCOPE_GATE) {
    // Scope is a gate, not a contributor. Strong evidence about the wrong
    // window, account or system does not partially support the claim - it does
    // not support it at all, and averaging lets a confident reading hide that.
    // This is the Empeon and power-fault shape: real git output, real event
    // counts, neither of them covering what the claim reached for.
    verdict = 'flag';
    reasons.push(`evidence does not cover the claim's scope (P=${p.scope.toFixed(2)})`);
    if (p.reading >= 0.75) reasons.push('the reading is real but it is about something else');
  } else if (evidenceScore < FLAG_BELOW) {
    verdict = 'flag';
    if (p.reading < 0.5) reasons.push(`nothing was read off the artifact (P=${p.reading.toFixed(2)})`);
    if (p.restated >= 0.5) reasons.push(`evidence only restates the claim (P=${p.restated.toFixed(2)})`);
  } else if (evidenceScore < REVIEW_BELOW) {
    verdict = 'review';
    if (p.scope < 0.75) reasons.push(`scope may not cover the claim (P=${p.scope.toFixed(2)})`);
    if (p.reading < 0.75) reasons.push(`weak reading (P=${p.reading.toFixed(2)})`);
  }

  // Testimony never flags on its own - it is legitimate support - but it is
  // worth saying out loud when the stakes are high enough to want an instrument.
  if (verdict === 'ok' && p.testimony >= 0.5 && answers.blastRadius.score >= 2) {
    verdict = 'review';
    reasons.push(`rests on testimony (P=${p.testimony.toFixed(2)}) at blast radius ${answers.blastRadius.score.toFixed(1)}/3`);
  }

  return { verdict, evidenceScore, reasons, p };
}

/** Live prices, read from the gateway registry rather than hardcoded. */
async function pricing() {
  const res = await fetch(REGISTRY);
  if (!res.ok) throw new Error(`model registry returned ${res.status}`);
  const jev = ((await res.json()).data ?? []).find((m) => m.id === MODEL);
  if (!jev) throw new Error(`${MODEL} not found in the gateway registry`);
  return {
    input: Number(jev.pricing.input),
    output: Number(jev.pricing.output),
    zdr: jev.zdr,
    noTraining: jev.no_training,
  };
}

/** Only these three fields reach the model. groundTruth is held out on purpose. */
function stateFor(record) {
  return { claim: record.claim, evidence: record.evidence, source: record.source };
}

function parseArgs(argv) {
  if (argv.includes('--smoke')) return { smoke: true, live: true };
  const i = argv.indexOf('--input');
  if (i === -1 || !argv[i + 1]) {
    console.error('usage: node verify-claims.mjs --input <file.json> [--live]');
    console.error('       node verify-claims.mjs --smoke          (one question, verifies the key)');
    process.exit(64);
  }
  return { live: argv.includes('--live'), input: argv[i + 1] };
}

/**
 * Cheapest possible proof that the key works and the SDK contract still holds.
 * This is the documented Vercel example verbatim, so a wrong answer means the
 * contract moved, not that our rubric is off.
 */
async function smoke() {
  const price = await pricing();
  const r = await evaluate({
    model: MODEL,
    state: 'The support agent issued a full refund to the customer.',
    questions: { refunded: { type: 'boolean', instructions: 'Was a refund issued?' } },
  });
  const cost = (r.usage.inputTokens ?? 0) * price.input + (r.usage.outputTokens ?? 0) * price.output;
  console.log(`answer    ${JSON.stringify(r.answers.refunded)}`);
  console.log(`version   ${r.response?.modelId ?? 'not reported'}`);
  console.log(`usage     ${r.usage.inputTokens} input, ${r.usage.outputTokens} output (measured)`);
  console.log(`cost      $${cost.toFixed(8)}`);
  const ok = r.answers.refunded.type === 'boolean' && r.answers.refunded.probability > 0.5;
  console.log(ok ? 'SMOKE PASS - key works, contract holds.' : 'SMOKE FAIL - contract moved, read the answer above.');
  if (!ok) process.exitCode = 1;
}

const MARK = { ok: 'ok    ', review: 'REVIEW', flag: 'FLAG  ' };

async function main() {
  const { live, input, smoke: isSmoke } = parseArgs(process.argv.slice(2));

  // Checked before any network call. process.exit() while a fetch handle is in
  // flight aborts libuv on Windows and reports 127 instead of this code.
  if (live && !process.env[KEY_VAR]) {
    console.error(`${KEY_VAR} is not set. Set it as a Windows user environment variable and restart the terminal.`);
    process.exitCode = 2;
    return;
  }

  if (isSmoke) return smoke();

  const records = JSON.parse(readFileSync(input, 'utf8'));
  const price = await pricing();
  const nQ = Object.keys(RUBRIC).length;

  console.log(`model     ${MODEL}  (zdr=${price.zdr}, no_training=${price.noTraining})`);
  console.log(`price     $${(price.input * 1e6).toFixed(3)}/1M input, $${(price.output * 1e6).toFixed(3)}/1M output  [live from the gateway registry]`);
  console.log(`records   ${records.length} claims x ${nQ} atomic questions, one request per claim`);
  console.log(`input     ${input}\n`);

  if (!live) {
    const chars = records.reduce(
      (n, r) => n + JSON.stringify(stateFor(r)).length + JSON.stringify(RUBRIC).length,
      0,
    );
    const est = Math.ceil(chars / 4);
    console.log('DRY RUN - nothing sent, nothing spent.');
    console.log(`  estimated input tokens  ~${est} (char/4 heuristic, NOT measured)`);
    console.log(`  estimated cost          ~$${(est * price.input).toFixed(6)}`);
    console.log(`  requests               ${records.length} (rate limit is 1,200/min, so this fits in one minute)\n`);
    console.log('payload for the first record:');
    console.log(JSON.stringify({ model: MODEL, state: stateFor(records[0]), questions: RUBRIC }, null, 2));
    console.log('\nre-run with --live to send it.');
    return;
  }

  const started = Date.now();
  const totals = { inputTokens: 0, outputTokens: 0 };
  const versions = new Set();
  const results = [];

  for (const record of records) {
    const r = await evaluate({ model: MODEL, state: stateFor(record), questions: RUBRIC });
    totals.inputTokens += r.usage.inputTokens ?? 0;
    totals.outputTokens += r.usage.outputTokens ?? 0;
    // jev-latest is an alias that moves on release. Record which version
    // answered, so thresholds tuned today can be rechecked later.
    if (r.response?.modelId) versions.add(r.response.modelId);
    results.push({ record, answers: r.answers, judgement: judge(r.answers) });
  }

  const elapsed = Date.now() - started;

  for (const { record, answers, judgement } of results) {
    console.log(`${MARK[judgement.verdict]}  ${record.id}`);
    console.log(`        claim     ${record.claim}`);
    console.log(
      `        signals   reading=${judgement.p.reading.toFixed(2)}` +
        ` scope=${judgement.p.scope.toFixed(2)}` +
        ` restated=${judgement.p.restated.toFixed(2)}` +
        ` contradicts=${judgement.p.contradicts.toFixed(2)}` +
        ` testimony=${judgement.p.testimony.toFixed(2)}`,
    );
    console.log(
      `        evidence  ${judgement.evidenceScore.toFixed(2)}` +
        `   blastRadius ${answers.blastRadius.score.toFixed(2)}/3`,
    );
    if (judgement.reasons.length) console.log(`        why       ${judgement.reasons.join('; ')}`);
    console.log('');
  }

  const counts = results.reduce((a, r) => ((a[r.judgement.verdict] = (a[r.judgement.verdict] ?? 0) + 1), a), {});
  const cost = totals.inputTokens * price.input + totals.outputTokens * price.output;

  console.log(`verdicts  ${counts.flag ?? 0} flag, ${counts.review ?? 0} review, ${counts.ok ?? 0} ok  (of ${results.length})`);
  console.log(`version   ${[...versions].join(', ') || 'not reported'}`);
  console.log(`usage     ${totals.inputTokens} input tokens, ${totals.outputTokens} output tokens (measured, from result.usage)`);
  console.log(`cost      $${cost.toFixed(6)}  (${results.length} requests, ${results.length * Object.keys(RUBRIC).length} questions, ${elapsed} ms wall)`);

  // Scored against held-out ground truth when the record file supplies it.
  const labelled = results.filter((r) => r.record.groundTruth);
  if (labelled.length) {
    console.log('\nagainst held-out ground truth (groundTruth is never sent to the model):');
    for (const { record, judgement } of labelled) {
      const shouldPass = /^TRUE/.test(record.groundTruth);
      const didPass = judgement.verdict === 'ok';
      const hit = shouldPass === didPass ? 'correct  ' : 'MISS     ';
      console.log(`  ${hit} ${record.id}: expected ${shouldPass ? 'ok' : 'not ok'}, got ${judgement.verdict}`);
    }
  }

  if ((counts.flag ?? 0) > 0) process.exitCode = 1;
}

export { RUBRIC, judge, stateFor, WEIGHTS };

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}
