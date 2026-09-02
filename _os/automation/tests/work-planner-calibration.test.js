'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const {
  applyCalibration,
  buildPlanInputs,
  buildPrediction,
  checkoutProvenance,
  hindcastCalibration,
  loadCatalog,
  renderMarkdown,
} = require('../lib/work-predictor');
const {
  aggregateGates,
  baselines,
  crostonSba,
  evaluateOrigin,
  metrics,
  seasonalNaive7,
} = require('../lib/workload-evaluator');

const catalog = loadCatalog();

function tempClientOps() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'work-planner-v2-'));
  fs.mkdirSync(path.join(root, 'registry'), { recursive: true });
  fs.mkdirSync(path.join(root, 'queue'), { recursive: true });
  fs.writeFileSync(path.join(root, 'registry', 'clients.json'), JSON.stringify({ clients: [] }));
  fs.writeFileSync(path.join(root, 'queue', 'work-items.json'), JSON.stringify({ workItems: [] }));
  return root;
}

function deliverable(root, client, name) {
  fs.mkdirSync(path.join(root, 'clients', client, 'deliverables', name), { recursive: true });
}

function writeQueue(root, workItems) {
  fs.writeFileSync(path.join(root, 'queue', 'work-items.json'), JSON.stringify({ workItems }, null, 2));
}

function weeklyReports(root, client, firstDay, count) {
  for (let index = 0; index < count; index += 1) {
    const date = new Date(Date.UTC(2026, 5, firstDay + index * 7));
    deliverable(root, client, `${date.toISOString().slice(0, 10)}-weekly-report`);
  }
}

test('every candidate is labeled a prediction and only queue rows can be confirmed', (t) => {
  const root = tempClientOps();
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  weeklyReports(root, 'alpha', 1, 8);
  writeQueue(root, [
    {
      id: 'wi-due',
      clientId: 'beta',
      title: 'Build the beta landing page',
      status: 'ready',
      dueAt: '2026-09-05T12:00:00.000Z',
      updatedAt: '2026-09-01T12:00:00.000Z',
    },
    {
      id: 'wi-undated',
      clientId: 'gamma',
      title: 'Configure GA4 tracking integration',
      status: 'in_progress',
      updatedAt: '2026-09-01T12:00:00.000Z',
    },
  ]);
  const prediction = buildPrediction({ clientOpsRoot: root, asOf: '2026-09-02', generatedAt: '2026-09-02T12:00:00.000Z' });
  assert.equal(prediction.status, 'ok');
  for (const candidate of prediction.candidates) assert.equal(candidate.claim_type, 'prediction');
  const due = prediction.candidates.find((candidate) => candidate.candidate_id.includes('wi-due'));
  const undated = prediction.candidates.find((candidate) => candidate.candidate_id.includes('wi-undated'));
  const history = prediction.candidates.find((candidate) => candidate.evidence_tier === 'historical-cadence');
  assert.deepEqual([due.confirmed_request, due.confirmed_deadline], [true, true]);
  assert.deepEqual([undated.confirmed_request, undated.confirmed_deadline], [true, false]);
  assert.deepEqual([history.confirmed_request, history.confirmed_deadline], [false, false]);
  assert.equal(prediction.plan_inputs.hard_commitments.length, 1);
  assert.equal(prediction.plan_inputs.hard_commitments[0].window.start, '2026-09-05');
});

test('hindcast calibration lowers confidence for a tier that keeps missing and stays bounded', () => {
  const events = [];
  // Alpha ships every 7 days like clockwork through the judging window; beta
  // shipped three times in June and then stopped, so its projections miss.
  for (let index = 0; index < 14; index += 1) {
    const date = new Date(Date.UTC(2026, 5, 1 + index * 7)).toISOString().slice(0, 10);
    events.push({ event_id: `alpha:${date}`, date, client_id: 'alpha', work_package_id: 'branded-client-report' });
  }
  for (const day of ['2026-06-02', '2026-06-09', '2026-06-16']) {
    events.push({ event_id: `beta:${day}`, date: day, client_id: 'beta', work_package_id: 'content-seo-package' });
  }
  const calibration = hindcastCalibration(events, catalog, '2026-08-31', { origins: [7, 14, 21, 28, 35, 42], lookaheadDays: 14 });
  const tier = calibration.tiers['historical-cadence'];
  assert.ok(tier, 'historical tier was judged');
  assert.ok(tier.predicted >= 3);
  assert.ok(tier.hit_rate > 0 && tier.hit_rate < 1, `mixed hit rate expected, got ${tier.hit_rate}`);
  assert.ok(tier.multiplier >= 0.6 && tier.multiplier <= 1);
  assert.equal(calibration.profiles['branded-client-report'].hit, calibration.profiles['branded-client-report'].predicted);

  const candidate = {
    evidence_tier: 'historical-cadence',
    confidence: 0.8,
    confidence_label: 'likely',
  };
  applyCalibration([candidate], calibration);
  assert.equal(candidate.calibration.applied, true);
  assert.equal(candidate.calibration.raw_confidence, 0.8);
  assert.ok(candidate.confidence <= 0.8);
  assert.ok(candidate.confidence >= 0.8 * 0.6);

  const thin = hindcastCalibration(events.slice(0, 2), catalog, '2026-06-20');
  const queueOnly = { evidence_tier: 'canonical-queue', confidence: 0.9, confidence_label: 'confirmed-pattern' };
  applyCalibration([queueOnly], thin);
  assert.equal(queueOnly.calibration, undefined, 'queue rows are never calibrated by hindcast');
});

test('plan inputs cap predicted preparation, exclude gated rows, and go empty when degraded', () => {
  const window = (start) => ({ start, end: start, basis: 'weekly' });
  const candidates = [
    { candidate_id: 'a', client_id: 'a', work_package_id: 'x', work_package_label: 'X', evidence_tier: 'owner-verified-recurrence', confidence: 0.9, confidence_label: 'confirmed-pattern', state: 'scheduled-pattern', claim_type: 'prediction', confirmed_request: false, confirmed_deadline: false, predicted_window: window('2026-09-03'), artifact_manifest: ['1', '2', '3', '4'], prepare_now: ['first'] },
    { candidate_id: 'b', client_id: 'b', work_package_id: 'x', work_package_label: 'X', evidence_tier: 'historical-cadence', confidence: 0.7, confidence_label: 'watch', state: 'cadence-watch', claim_type: 'prediction', confirmed_request: false, confirmed_deadline: false, predicted_window: window('2026-09-05'), artifact_manifest: [], prepare_now: [] },
    { candidate_id: 'c', client_id: 'c', work_package_id: 'x', work_package_label: 'X', evidence_tier: 'historical-cadence', confidence: 0.65, confidence_label: 'watch', state: 'cadence-watch', claim_type: 'prediction', confirmed_request: false, confirmed_deadline: false, predicted_window: window('2026-09-06'), artifact_manifest: [], prepare_now: [] },
    { candidate_id: 'late', client_id: 'd', work_package_id: 'x', work_package_label: 'X', evidence_tier: 'historical-cadence', confidence: 0.9, confidence_label: 'confirmed-pattern', state: 'cadence-watch', claim_type: 'prediction', confirmed_request: false, confirmed_deadline: false, predicted_window: window('2026-09-20'), artifact_manifest: [], prepare_now: [] },
    { candidate_id: 'weak', client_id: 'e', work_package_id: 'x', work_package_label: 'X', evidence_tier: 'historical-cadence', confidence: 0.5, confidence_label: 'watch', state: 'cadence-watch', claim_type: 'prediction', confirmed_request: false, confirmed_deadline: false, predicted_window: window('2026-09-03'), artifact_manifest: [], prepare_now: [] },
    { candidate_id: 'blocked', client_id: 'f', work_package_id: 'x', work_package_label: 'X', evidence_tier: 'canonical-queue', confidence: 0.7, confidence_label: 'watch', state: 'blocked', claim_type: 'prediction', confirmed_request: true, confirmed_deadline: false, predicted_window: { start: null, end: null, basis: 'when-gate-clears' }, artifact_manifest: [], prepare_now: [] },
  ];
  const plan = buildPlanInputs(candidates, '2026-09-02', 'ok');
  assert.deepEqual(plan.predicted_preparation.map((row) => row.candidate_id), ['a', 'b']);
  assert.equal(plan.predicted_preparation[0].label, 'predicted preparation');
  assert.equal(plan.predicted_preparation[0].budget_minutes, 45);
  assert.deepEqual(plan.predicted_preparation[0].first_artifacts, ['1', '2', '3']);
  assert.deepEqual(plan.gated.map((row) => row.candidate_id), ['blocked']);
  assert.equal(plan.wip_limit, 5);

  const degraded = buildPlanInputs(candidates, '2026-09-02', 'degraded');
  assert.deepEqual(degraded.predicted_preparation, []);
  assert.match(degraded.predicted_preparation_withheld_reason, /degraded/);
});

test('missing canonical sources degrade the brief instead of silently predicting', () => {
  const prediction = buildPrediction({ clientOpsRoot: null, asOf: '2026-09-02', generatedAt: '2026-09-02T12:00:00.000Z' });
  assert.equal(prediction.status, 'degraded');
  assert.deepEqual(prediction.plan_inputs.predicted_preparation, []);
  const markdown = renderMarkdown(prediction);
  assert.match(markdown, /STATUS: DEGRADED/);
  assert.match(markdown, /Only canonical queue rows are confirmed requests/);
});

test('checkout provenance records branch, head, and dirty state of the source checkout', (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'work-planner-git-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const git = (...args) => execFileSync('git', ['-C', root, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  git('init', '-q', '-b', 'main');
  git('-c', 'user.email=t@example.com', '-c', 'user.name=t', 'commit', '-q', '--allow-empty', '-m', 'init');
  fs.writeFileSync(path.join(root, 'dirty.txt'), 'x');
  const provenance = checkoutProvenance(root);
  assert.equal(provenance.git, true);
  assert.equal(provenance.branch, 'main');
  assert.equal(provenance.dirty_files, 1);
  assert.equal(provenance.canonical_main, false);
  assert.deepEqual(checkoutProvenance(path.join(root, 'missing')), { available: false });
});

test('six preparation contracts carry exact inputs, templates, readiness, outputs, QA, and gates', () => {
  const required = ['website-design-build', 'branded-client-report', 'bok-weekly-designed-content-kit', 'prototype-wireframe', 'data-source-integration', 'repository-environment-configuration'];
  for (const id of required) {
    const profile = catalog.profiles.find((row) => row.id === id);
    const contract = profile.preparation_contract;
    assert.ok(contract, `${id} has a preparation contract`);
    for (const key of ['inputs', 'templates', 'output_formats', 'qa', 'gates']) {
      assert.ok(Array.isArray(contract[key]) && contract[key].length > 0, `${id}.${key}`);
    }
    for (const key of ['assets', 'data', 'repository']) assert.ok(Array.isArray(contract.readiness[key]), `${id}.readiness.${key}`);
  }
  const bok = catalog.profiles.find((row) => row.id === 'bok-weekly-designed-content-kit');
  assert.deepEqual(bok.client_ids, ['bok-law-firm']);
  assert.ok(bok.preparation_contract.inputs[0].includes('BOK_Corrected_Weekly_Social_Content.pdf'));
  assert.ok(bok.preparation_contract.qa.some((row) => row.includes('western Pennsylvania')));
});

test('intermittent-demand baselines behave on known count series', () => {
  assert.deepEqual(crostonSba([0, 0, 0, 0], 3), [0, 0, 0]);
  const steady = crostonSba([2, 0, 2, 0, 2, 0, 2, 0], 2);
  assert.ok(steady[0] > 0.8 && steady[0] < 1.1, `Croston-SBA of a 2-every-2-days series should sit near 1/day, got ${steady[0]}`);
  assert.deepEqual(seasonalNaive7([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14], 9), [8, 9, 10, 11, 12, 13, 14, 8, 9]);

  const contextDates = Array.from({ length: 35 }, (_, index) => new Date(Date.UTC(2026, 6, 1 + index)).toISOString().slice(0, 10));
  const context = contextDates.map((date) => (new Date(`${date}T00:00:00Z`).getUTCDay() === 1 ? 5 : 0));
  const futureDates = Array.from({ length: 7 }, (_, index) => new Date(Date.UTC(2026, 7, 5 + index)).toISOString().slice(0, 10));
  const actual = futureDates.map((date) => (new Date(`${date}T00:00:00Z`).getUTCDay() === 1 ? 5 : 0));
  const rows = baselines(context, contextDates, futureDates);
  assert.deepEqual(rows.day_of_week_mean, actual, 'day-of-week mean nails a pure weekly pattern');
  assert.equal(metrics(rows.seasonal_naive_7, actual, context).mae, 0);
  assert.ok(metrics(rows.persistence, actual, context).mae > 0);
  assert.equal(metrics(rows.zero, actual, context).wape, 100);
});

test('rolling-origin gate needs three valid wins out of four, calibrated coverage, and no rejected origins', () => {
  const contextDates = Array.from({ length: 40 }, (_, index) => new Date(Date.UTC(2026, 6, 1 + index)).toISOString().slice(0, 10));
  const futureDates = Array.from({ length: 7 }, (_, index) => new Date(Date.UTC(2026, 7, 10 + index)).toISOString().slice(0, 10));
  const context = contextDates.map((_, index) => (index % 3 === 0 ? 3 : 0));
  // The last week breaks the pattern slightly so no deterministic baseline is perfect.
  const actual = [3, 0, 0, 3, 0, 1, 4];
  const good = { point: [3, 0, 0, 3, 0, 1, 4], quantiles: { p10: [2, -1, -1, 2, -1, 0, 3], p90: [4, 1, 1, 4, 1, 2, 5] } };
  const bad = { point: [9, 9, 9, 9, 9, 9, 9], quantiles: { p10: [8, 8, 8, 8, 8, 8, 8], p90: [10, 10, 10, 10, 10, 10, 10] } };
  const scored = (output) => ({ status: 'scored', evaluation: evaluateOrigin({ context, contextDates, futureDates, actual, output }) });

  const wins = aggregateGates([scored(good), scored(good), scored(good), scored(bad)]);
  assert.equal(wins.chronos_wins_vs_best_baseline, 3);
  assert.equal(wins.gates.repeated_holdouts_beat_best_baseline, true);
  assert.equal(wins.gates.planner_consumption, false, 'software never opens planner consumption');

  const rejected = aggregateGates([scored(good), scored(good), scored(good), { status: 'rejected-run', rejected_reasons: ['quantiles cross'] }]);
  assert.equal(rejected.origins_rejected, 1);
  assert.equal(rejected.gates.all_origins_valid, false);
  assert.equal(rejected.gates.repeated_holdouts, false);

  const overconfident = aggregateGates([scored(bad), scored(bad), scored(bad), scored(bad)]);
  assert.equal(overconfident.gates.repeated_holdouts_beat_best_baseline, false);
  assert.equal(overconfident.mean_p10_p90_coverage, 0);
  assert.equal(aggregateGates([scored(good), scored(good)]).gates.repeated_holdouts, false, 'two origins are not repeated evidence');
});
