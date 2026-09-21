'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {
  normalizedFirstSeen,
  compareCandidatesChronologically,
  chooseOldestReady,
} = require('./chronological-priority');

test('oldest first_seen date outranks a later higher opportunity score', () => {
  const older = { firstSeen: '2026-08-08', opportunity: 40, domain: 'older.example' };
  const newer = { firstSeen: '2026-08-19', opportunity: 99, domain: 'newer.example' };
  assert.ok(compareCandidatesChronologically(older, newer) < 0);
});

test('rebuild score is only a same-date tie-breaker', () => {
  const lower = { firstSeen: '2026-08-10', opportunity: 55, quality: 30, domain: 'lower.example' };
  const higher = { firstSeen: '2026-08-10', opportunity: 65, quality: 30, domain: 'higher.example' };
  assert.ok(compareCandidatesChronologically(higher, lower) < 0);
});

test('missing or invalid dates sort last and the selected set stays chronological', () => {
  assert.equal(normalizedFirstSeen(''), '9999-12-31');
  const ready = [
    { candidate: { firstSeen: '', opportunity: 100, domain: 'missing.example' } },
    { candidate: { firstSeen: '2026-08-19', opportunity: 80, domain: 'newer.example' } },
    { candidate: { firstSeen: '2026-08-08', opportunity: 50, domain: 'older.example' } },
  ];
  assert.deepEqual(
    chooseOldestReady(ready, 2).map((item) => item.candidate.domain),
    ['older.example', 'newer.example']
  );
});
