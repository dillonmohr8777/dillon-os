'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { routeForecastRequest } = require('../lib/forecast-router');
const {
  buildPrediction,
  classifyWork,
  loadCatalog,
  renderMarkdown,
} = require('../lib/work-predictor');

const catalog = loadCatalog();

function tempClientOps() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'work-predictor-'));
  fs.mkdirSync(path.join(root, 'registry'), { recursive: true });
  fs.mkdirSync(path.join(root, 'queue'), { recursive: true });
  fs.writeFileSync(path.join(root, 'registry', 'clients.json'), JSON.stringify({ clients: [] }));
  return root;
}

function deliverable(root, client, name) {
  fs.mkdirSync(path.join(root, 'clients', client, 'deliverables', name), { recursive: true });
}

function writeQueue(root, workItems) {
  fs.writeFileSync(path.join(root, 'queue', 'work-items.json'), JSON.stringify({ workItems }, null, 2));
}

test('classifies Dillon-specific website, integration, report, and BOK packages', () => {
  assert.equal(classifyWork('homepage redesign and Netlify build', 'example', catalog).primary.id, 'website-design-build');
  assert.equal(classifyWork('configure Tock reservation webhook and GA4', 'puttery-nyc', catalog).primary.id, 'data-source-integration');
  assert.equal(classifyWork('August monthly client reports', 'momentum-360', catalog).primary.id, 'branded-client-report');
  assert.equal(classifyWork('three blogs and three images for the weekly designed template', 'bok-law-firm', catalog).primary.id, 'bok-weekly-designed-content-kit');
});

test('builds owner-verified BOK recurrence, queue evidence, and a routeable workload request', (t) => {
  const root = tempClientOps();
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));

  deliverable(root, 'bok-law-firm', '2026-08-12-social-content');
  deliverable(root, 'bok-law-firm', '2026-08-19-social-content');
  deliverable(root, 'bok-law-firm', '2026-08-26-social-content');
  for (let index = 0; index < 40; index += 1) {
    const date = new Date(Date.UTC(2026, 6, 20 + index));
    deliverable(root, 'sample-client', `${date.toISOString().slice(0, 10)}-website-build-${index}`);
  }
  writeQueue(root, [{
    id: 'wi-puttery',
    clientId: 'puttery-nyc',
    title: 'Complete Puttery production attribution integration',
    nextAction: 'Verify the reservation webhook and analytics access after launch gates clear.',
    status: 'blocked',
    updatedAt: '2026-09-01T18:00:00.000Z',
    source: { locator: 'fixture://puttery' },
  }]);

  const prediction = buildPrediction({
    clientOpsRoot: root,
    asOf: '2026-09-02',
    generatedAt: '2026-09-02T12:00:00.000Z',
    lookaheadDays: 35,
    historyDays: 90,
  });
  const bok = prediction.candidates.find((candidate) => candidate.work_package_id === 'bok-weekly-designed-content-kit');
  assert.ok(bok);
  assert.equal(bok.predicted_window.start, '2026-09-08');
  assert.equal(bok.evidence_tier, 'owner-verified-recurrence');
  assert.ok(bok.artifact_manifest.some((row) => row.includes('Three expected topic')));

  const puttery = prediction.candidates.find((candidate) => candidate.candidate_id.includes('wi-puttery'));
  assert.ok(puttery);
  assert.equal(puttery.work_package_id, 'data-source-integration');
  assert.equal(puttery.state, 'blocked');
  assert.ok(puttery.human_gates.some((gate) => gate.includes('blocked')));

  assert.equal(prediction.workload_series.observations, 90);
  assert.equal(prediction.chronos_shadow.status, 'request-ready');
  const route = routeForecastRequest(prediction.chronos_shadow.request);
  assert.equal(route.status, 'sandbox-eligible');
  assert.equal(route.authority, 'evidence-only');
});

test('consolidates a repeated multi-client reporting window into one batch watch', (t) => {
  const root = tempClientOps();
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  for (const client of ['alpha', 'beta', 'gamma', 'delta']) {
    deliverable(root, client, '2026-08-10-weekly-report');
    deliverable(root, client, '2026-08-24-weekly-report');
  }
  writeQueue(root, []);
  const prediction = buildPrediction({
    clientOpsRoot: root,
    asOf: '2026-09-02',
    generatedAt: '2026-09-02T12:00:00.000Z',
    lookaheadDays: 14,
    historyDays: 90,
  });
  const batch = prediction.candidates.find((candidate) => candidate.client_id === 'portfolio/multiple');
  assert.ok(batch);
  assert.equal(batch.work_package_id, 'branded-client-report');
  assert.equal(batch.clients.length, 4);
  assert.equal(batch.predicted_window.start, '2026-09-07');
});

test('withholds sparse package-type targets from Chronos', (t) => {
  const root = tempClientOps();
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  for (let index = 0; index < 20; index += 1) {
    const date = new Date(Date.UTC(2026, 7, 1 + index));
    deliverable(root, 'sample-client', `${date.toISOString().slice(0, 10)}-website-build-${index}`);
  }
  writeQueue(root, []);
  const prediction = buildPrediction({
    clientOpsRoot: root,
    asOf: '2026-09-02',
    generatedAt: '2026-09-02T12:00:00.000Z',
    historyDays: 90,
  });
  assert.deepEqual(
    prediction.chronos_shadow.request.targets.map((target) => target.series_id),
    ['work-packages-total'],
  );
  assert.ok(prediction.chronos_shadow.sparse_series_withheld.some((row) => row.series_id === 'work-packages-website-design-build'));
});

test('completed queue items do not re-enter the predicted work stack', (t) => {
  const root = tempClientOps();
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  writeQueue(root, [{
    id: 'wi-done',
    clientId: 'example',
    title: 'Build website',
    status: 'done',
    updatedAt: '2026-09-01T12:00:00.000Z',
  }]);
  const prediction = buildPrediction({
    clientOpsRoot: root,
    asOf: '2026-09-02',
    generatedAt: '2026-09-02T12:00:00.000Z',
  });
  assert.equal(prediction.candidates.some((candidate) => candidate.candidate_id.includes('wi-done')), false);
});

test('rendered brief preserves evidence-only and external-action boundaries', (t) => {
  const root = tempClientOps();
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  writeQueue(root, []);
  const prediction = buildPrediction({
    clientOpsRoot: root,
    asOf: '2026-09-02',
    generatedAt: '2026-09-02T12:00:00.000Z',
  });
  const markdown = renderMarkdown(prediction);
  assert.match(markdown, /Chronos workload shadow/);
  assert.match(markdown, /cannot send, publish, spend, change an account, or mutate the canonical queue/);
  assert.deepEqual(prediction.forbidden_actions, [
    'send',
    'publish',
    'spend',
    'account-change',
    'canonical-queue-mutation',
  ]);
});
