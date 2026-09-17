#!/usr/bin/env node
/**
 * The one runnable check. Covers judge(), which is the only thing that decides
 * anything. No network, no model, no cost. Run: node test-verify-claims.mjs
 */
import assert from 'node:assert/strict';
import { RUBRIC, judge, stateFor, WEIGHTS } from './verify-claims.mjs';

const answers = (o = {}) => ({
  reportsAReading: { type: 'boolean', probability: o.reading ?? 0.95 },
  scopeCoversClaim: { type: 'boolean', probability: o.scope ?? 0.95 },
  restatesWithoutSupport: { type: 'boolean', probability: o.restated ?? 0.02 },
  contradictsClaim: { type: 'boolean', probability: o.contradicts ?? 0.02 },
  supportIsTestimony: { type: 'boolean', probability: o.testimony ?? 0.02 },
  blastRadius: { type: 'score', score: o.blast ?? 1.0 },
});

// A measured claim with matching scope passes clean.
assert.equal(judge(answers()).verdict, 'ok');
assert.deepEqual(judge(answers()).reasons, []);

// A bare PASS verdict: nothing read, pure restatement. Must flag.
const barePass = judge(answers({ reading: 0.03, scope: 0.5, restated: 0.96, blast: 3 }));
assert.equal(barePass.verdict, 'flag');
assert.ok(barePass.reasons.some((r) => /nothing was read/.test(r)));
assert.ok(barePass.reasons.some((r) => /only restates/.test(r)));

// The scope failure: a real, strong reading that covers the wrong range.
// This is the power-fault case, and the one a naive "is it supported" question
// would wave through, because the evidence is genuine - just not about this.
const scopeGap = judge(answers({ reading: 0.98, scope: 0.04, restated: 0.05 }));
assert.equal(scopeGap.verdict, 'flag', 'strong evidence of the wrong thing must still flag');
assert.ok(scopeGap.reasons.some((r) => /does not cover the claim/.test(r)));

// Contradiction short-circuits regardless of how good the evidence looks.
const contradicted = judge(answers({ reading: 0.99, scope: 0.99, contradicts: 0.91 }));
assert.equal(contradicted.verdict, 'flag');
assert.equal(contradicted.reasons.length, 1, 'contradiction reports one reason, not a pile');
assert.ok(/contradicts/.test(contradicted.reasons[0]));

// Testimony alone never flags - people are legitimate sources - but at high
// blast radius it routes to review rather than passing silently.
assert.equal(judge(answers({ testimony: 0.9, blast: 0.5 })).verdict, 'ok');
const testimonyHighStakes = judge(answers({ testimony: 0.9, blast: 2.4 }));
assert.equal(testimonyHighStakes.verdict, 'review');
assert.ok(/testimony/.test(testimonyHighStakes.reasons[0]));

// Middling evidence lands in review, not flag: the band exists.
const middling = judge(answers({ reading: 0.6, scope: 0.62, restated: 0.3 }));
assert.equal(middling.verdict, 'review');

// Weighted score is the documented combination, and is bounded [0,1].
const j = judge(answers({ reading: 1, scope: 1, restated: 0 }));
assert.equal(j.evidenceScore, WEIGHTS.reading + WEIGHTS.scope + WEIGHTS.notRestated);
assert.equal(judge(answers({ reading: 0, scope: 0, restated: 1 })).evidenceScore, 0);
assert.ok(Math.abs(WEIGHTS.reading + WEIGHTS.scope + WEIGHTS.notRestated - 1) < 1e-9, 'weights sum to 1');

// Rubric stays inside the provider spec: choice needs a nonempty map, score
// needs >= 2 ordered levels, every question carries instructions.
for (const [id, q] of Object.entries(RUBRIC)) {
  assert.ok(['boolean', 'choice', 'score'].includes(q.type), `${id} has a valid type`);
  assert.ok(q.instructions, `${id} has instructions`);
  if (q.type === 'score') assert.ok(q.criteria.length >= 2, `${id} needs two ordered levels`);
  if (q.type === 'choice') assert.ok(Object.keys(q.criteria).length > 0, `${id} needs options`);
}

// Ground truth must never reach the model.
const s = stateFor({ id: 'x', claim: 'c', evidence: 'e', source: 'src', groundTruth: 'LEAK' });
assert.deepEqual(s, { claim: 'c', evidence: 'e', source: 'src' });
assert.ok(!JSON.stringify(s).includes('LEAK'), 'groundTruth must be held out of the state');

console.log('verify-claims: all checks pass');
