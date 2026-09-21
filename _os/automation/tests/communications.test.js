'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { repoPath } = require('../lib/fsutil');
const {
  validateCommunicationEnvelope,
  normalizeCommunicationItems,
  communicationEventFingerprint,
  filterNewCommunicationItems,
  renderDailyReview,
  appendReview,
} = require('../lib/communications');

function fixture() {
  return JSON.parse(fs.readFileSync(repoPath('_os/automation/fixtures/communications/daily-communication-run.json'), 'utf8'));
}

test('communication envelope accepts curated Gmail and Slack receipts', () => {
  const envelope = fixture();
  assert.deepEqual(validateCommunicationEnvelope(envelope), { ok: true, errors: [] });
});

test('communication envelope rejects raw bodies and apparent secret values', () => {
  const envelope = fixture();
  envelope.items[0].raw_body = 'Do not persist this.';
  envelope.items[0].summary = 'access token: example-value';
  const result = validateCommunicationEnvelope(envelope);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.includes('forbidden field')));
  assert.ok(result.errors.some((error) => error.includes('secret value')));
});

test('communication envelope blocks cross-client write targets', () => {
  const envelope = fixture();
  envelope.items[0].write_targets.push('01_Clients/Another Client/overview.md');
  const result = validateCommunicationEnvelope(envelope);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.includes('crosses the routed client folder')));
});

test('communication item normalization deduplicates within a run', () => {
  const envelope = fixture();
  envelope.items.push({ ...envelope.items[0] });
  const normalized = normalizeCommunicationItems(envelope.items);
  assert.equal(normalized.length, 2);
});

test('cross-run event fingerprint ignores key drift but allows a later thread event', () => {
  const item = fixture().items[0];
  const sameEvent = {
    ...item,
    dedupe_key: `${item.source_type}:replacement-key`,
    occurred_at: new Date(item.occurred_at).toISOString(),
  };
  const laterEvent = {
    ...sameEvent,
    occurred_at: new Date(Date.parse(item.occurred_at) + 60_000).toISOString(),
  };
  const processed = {
    [item.dedupe_key]: {
      source_ref: item.source_ref,
      occurred_at: item.occurred_at,
    },
  };

  assert.equal(communicationEventFingerprint(sameEvent), communicationEventFingerprint(item));
  assert.notEqual(communicationEventFingerprint(laterEvent), communicationEventFingerprint(item));
  assert.deepEqual(filterNewCommunicationItems([sameEvent], processed), []);
  assert.deepEqual(filterNewCommunicationItems([laterEvent], processed), [laterEvent]);
});

test('daily communication review surfaces priority and preserves the no-send boundary', () => {
  const envelope = fixture();
  envelope.items[0].priority = 'high';
  const review = renderDailyReview(envelope, envelope.items, '12_Brain/01_Captures/Communications/example.md');
  assert.match(review, /## Do first/);
  assert.match(review, /Nothing was sent, posted, published, purchased, or changed/);
  assert.match(review, /high_priority_count: 1/);
});

test('same-day review append keeps one document title and labels the additional run', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'daily-comms-review-'));
  const reviewFile = path.join(tempDir, 'review.md');
  try {
    const first = '# 2026-08-01 - Communication Intelligence\n\n## Executive pulse\n\n- First run.\n\n- Run: COMMS-FIRST\n';
    const second = '# 2026-08-01 - Communication Intelligence\n\n## Executive pulse\n\n- Second run.\n\n## Run receipt\n\n- Run: COMMS-SECOND\n';
    assert.equal(appendReview(reviewFile, first, 'COMMS-FIRST'), 'created');
    assert.equal(appendReview(reviewFile, second, 'COMMS-SECOND'), 'appended');
    const merged = fs.readFileSync(reviewFile, 'utf8');
    assert.equal((merged.match(/^# /gm) || []).length, 1);
    assert.match(merged, /## Additional run - COMMS-SECOND/);
    assert.match(merged, /### Executive pulse/);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});
