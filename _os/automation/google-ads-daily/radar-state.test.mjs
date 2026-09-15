import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState, plan, applyEvent, localEight, lookupKeys } from './radar-state.mjs';
const day = '2026-09-05T00:00:00Z'; // 8 PM Eastern on September 4
test('first scan is bounded and preserves overlap after completion', () => {
  let s = initialState(); const p = plan(s, day); const w = p.windows.slack;
  assert.equal(Date.parse(day) / 1000 - w.afterUnix, 172800);
  assert.equal(w.beforeUnix - w.afterUnix, 21600);
  s = applyEvent(s, { action: 'source-start', source: 'slack', ...w }, day);
  s = applyEvent(s, { action: 'source-complete', source: 'slack', beforeUnix: w.beforeUnix, paginationExhausted: true }, day);
  assert.equal(plan(s, day).windows.slack.afterUnix, w.beforeUnix - 900);
});
test('partial pagination never advances successful coverage', () => {
  let s = initialState(); const w = plan(s, day).windows.gmail;
  s = applyEvent(s, { action: 'source-start', source: 'gmail', ...w }, day);
  s = applyEvent(s, { action: 'source-page', source: 'gmail', cursor: 'page2' }, day);
  assert.equal(s.sources.gmail.throughUnix, null);
  assert.equal(plan(s, day).windows.gmail.cursor, 'page2');
  assert.throws(() => applyEvent(s, { action: 'source-complete', source: 'gmail', beforeUnix: w.beforeUnix }, day));
});
test('wrong upper bound and skipped windows are rejected', () => {
  let s = initialState(); const w = plan(s, day).windows.slack;
  s = applyEvent(s, { action: 'source-start', source: 'slack', ...w }, day);
  assert.throws(() => applyEvent(s, { action: 'source-complete', source: 'slack', beforeUnix: 1, paginationExhausted: true }, day));
});
test('bedtime happens once per Eastern date and is separate from scan success', () => {
  let s = initialState(); const now = '2026-09-05T04:40:00Z';
  assert.equal(plan(s, now).bedtimeDue, true);
  assert.equal(plan(s, now).allowNewWork, false);
  s = applyEvent(s, { action: 'daily', name: 'bedtime', status: 'notified' }, now);
  assert.equal(plan(s, now).bedtimeDue, false);
});
test('pause until eight survives restarts and resumes at the right time', () => {
  let s = applyEvent(initialState(), { action: 'pause-until-eight' }, '2026-09-05T04:40:00Z');
  s = JSON.parse(JSON.stringify(s));
  assert.equal(s.pauseUntil, '2026-09-05T12:00:00.000Z');
  assert.equal(plan(s, '2026-09-05T11:59:00Z').allowNewWork, false);
  assert.equal(plan(s, '2026-09-05T12:00:00Z').resumeDue, true);
});
test('eight AM handles winter time and the fall DST change', () => {
  assert.equal(localEight('2026-11-01T04:40:00Z'), '2026-11-01T13:00:00.000Z');
  assert.equal(localEight('2026-12-01T05:40:00Z'), '2026-12-01T13:00:00.000Z');
});
test('night work needs explicit approval and does not persist to another date', () => {
  const at = '2026-09-05T04:40:00Z';
  const s = applyEvent(initialState(), { action: 'overnight-approved' }, at);
  assert.equal(plan(s, at).allowNewWork, true);
  assert.equal(plan(s, '2026-09-06T04:40:00Z').allowNewWork, false);
});
test('seen source keys are deduplicated and raw fields are not retained', () => {
  const e = { action: 'seen', key: 'slack:C123:123.001', disposition: 'reviewed', rawBody: 'not persisted' };
  let s = applyEvent(initialState(), e, day); s = applyEvent(s, e, day);
  assert.equal(s.seen.length, 1); assert.equal(JSON.stringify(s).includes('not persisted'), false);
});
test('registered sessions cannot duplicate a source or exceed the concurrency limit', () => {
  let s = applyEvent(initialState(), { action: 'wake-start', wakeId: 'first' }, day);
  for (let n = 0; n < 3; n++) {
    if (n === 2) s = applyEvent(s, { action: 'wake-start', wakeId: 'second' }, day);
    s = applyEvent(s, { action: 'register-thread', threadId: 'thread' + n, sourceKey: 'source' + n, clientId: 'momentum-360' }, day);
  }
  assert.throws(() => applyEvent(s, { action: 'register-thread', threadId: 'thread4', sourceKey: 'source4', clientId: 'momentum-360' }, day));
  assert.throws(() => applyEvent(s, { action: 'register-thread', threadId: 'thread5', sourceKey: 'source1', clientId: 'momentum-360' }, day));
});
test('daily lead job is due in the morning once, not during the night', () => {
  let s = initialState(); assert.equal(plan(s, '2026-09-05T04:40:00Z').leadTableDue, false);
  assert.equal(plan(s, '2026-09-05T12:05:00Z').leadTableDue, true);
  s = applyEvent(s, { action: 'daily', name: 'leadTable', status: 'dispatched' }, '2026-09-05T12:05:00Z');
  assert.equal(plan(s, '2026-09-05T12:20:00Z').leadTableDue, false);
});
test('approval before midnight applies to the upcoming night only', () => {
  const s = applyEvent(initialState(), { action: 'overnight-approved' }, '2026-09-05T03:50:00Z');
  assert.equal(plan(s, '2026-09-05T04:40:00Z').allowNewWork, true);
  assert.equal(plan(s, '2026-09-06T04:40:00Z').allowNewWork, false);
});
test('paused work is not duplicated and resume cannot exceed capacity', () => {
  let s = applyEvent(initialState(), { action: 'wake-start', wakeId: 'first' }, day);
  s = applyEvent(s, { action: 'register-thread', threadId: 'old', sourceKey: 'outcome', clientId: 'momentum-360' }, day);
  s = applyEvent(s, { action: 'thread-status', threadId: 'old', status: 'paused' }, day);
  assert.throws(() => applyEvent(s, { action: 'register-thread', threadId: 'duplicate', sourceKey: 'outcome', clientId: 'momentum-360' }, day));
  for (let n = 0; n < 3; n++) {
    if (n === 1) s = applyEvent(s, { action: 'wake-start', wakeId: 'second' }, day);
    s = applyEvent(s, { action: 'register-thread', threadId: 'new' + n, sourceKey: 'new' + n, clientId: 'momentum-360' }, day);
  }
  assert.throws(() => applyEvent(s, { action: 'thread-status', threadId: 'old', status: 'active' }, day));
});
test('source failures back off without advancing coverage, then clear on success', () => {
  let s = initialState(); const w = plan(s, day).windows.gmail;
  s = applyEvent(s, { action: 'source-start', source: 'gmail', ...w }, day);
  s = applyEvent(s, { action: 'source-failed', source: 'gmail', reason: 'auth' }, day);
  assert.equal(plan(s, day).sourceRetry.gmail.due, false);
  assert.equal(plan(s, '2026-09-05T00:16:00Z').sourceRetry.gmail.due, true);
  assert.equal(s.sources.gmail.throughUnix, null);
  s = applyEvent(s, { action: 'source-failed', source: 'gmail', reason: 'auth' }, day);
  assert.equal(s.sources.gmail.failure.retryAt, '2026-09-05T01:00:00.000Z');
  s = applyEvent(s, { action: 'source-complete', source: 'gmail', beforeUnix: w.beforeUnix, paginationExhausted: true }, day);
  assert.equal(s.sources.gmail.failure, null);
});
test('daily leads catch up after a missed morning window', () => {
  assert.equal(plan(initialState(), '2026-09-05T16:00:00Z').leadTableDue, true);
  assert.equal(plan(initialState(), '2026-09-06T03:59:00Z').leadTableDue, true);
});
test('two new tasks per persisted wake, including repeated wake-start', () => {
  let s = applyEvent(initialState(), { action: 'wake-start', wakeId: 'one' }, day);
  for (let n = 0; n < 2; n++) s = applyEvent(s, { action: 'register-thread', threadId: 't' + n, sourceKey: 'o' + n, clientId: 'momentum-360' }, day);
  s = JSON.parse(JSON.stringify(s));
  s = applyEvent(s, { action: 'wake-start', wakeId: 'one' }, day);
  assert.throws(() => applyEvent(s, { action: 'register-thread', threadId: 'third', sourceKey: 'third', clientId: 'momentum-360' }, day));
  s = applyEvent(s, { action: 'wake-start', wakeId: 'two' }, day);
  s = applyEvent(s, { action: 'register-thread', threadId: 'third', sourceKey: 'third', clientId: 'momentum-360' }, day);
  assert.equal(s.threads.length, 3);
});
test('provider page cap narrows and restarts without claiming unseen coverage', () => {
  let s = initialState(); const w = plan(s, day).windows.slack;
  s = applyEvent(s, { action: 'source-start', source: 'slack', ...w }, day);
  s = applyEvent(s, { action: 'source-page', source: 'slack', cursor: 'page21' }, day);
  s = applyEvent(s, { action: 'source-narrow', source: 'slack', beforeUnix: w.afterUnix + 3600 }, day);
  assert.equal(s.sources.slack.throughUnix, null);
  assert.equal(s.sources.slack.window.cursor, null);
  const boundary = s.sources.slack.window.beforeUnix;
  s = applyEvent(s, { action: 'source-complete', source: 'slack', beforeUnix: boundary, paginationExhausted: true }, day);
  assert.equal(plan(s, day).windows.slack.afterUnix, boundary - 900);
  assert.ok(plan(s, day).windows.slack.beforeUnix <= boundary + 21600);
});
test('daily Google Ads reports start at nine, catch up once, respect pause and DST', () => {
  let s = initialState();
  assert.equal(plan(s, '2026-09-05T12:59:00Z').googleAdsReportDue, false);
  assert.equal(plan(s, '2026-09-05T13:00:00Z').googleAdsReportDue, true);
  assert.equal(plan(s, '2026-09-06T03:59:00Z').googleAdsReportDue, true);
  s = applyEvent(s, {action:'daily',name:'googleAdsReport',status:'dispatched'}, '2026-09-05T13:00:00Z');
  assert.equal(plan(s, '2026-09-05T18:00:00Z').googleAdsReportDue, false);
  assert.equal(plan(s, '2026-09-06T13:00:00Z').googleAdsReportDue, true);
  const p = {...initialState(), pauseUntil:'2026-09-05T18:00:00Z'};
  assert.equal(plan(p, '2026-09-05T13:00:00Z').googleAdsReportDue, false);
  assert.equal(plan(initialState(), '2026-12-01T13:59:00Z').googleAdsReportDue, false);
  assert.equal(plan(initialState(), '2026-12-01T14:00:00Z').googleAdsReportDue, true);
});
test('bounded fingerprint lookup avoids loading the full state into a model', () => {
  const s = applyEvent(initialState(), { action: 'seen', key: 'gmail:one', disposition: 'reviewed' }, day);
  const r = lookupKeys(s, ['gmail:one', 'gmail:two', 'gmail:one']);
  assert.equal(r.known.length, 1);
  assert.deepEqual(r.unseen, ['gmail:two']);
  assert.throws(() => lookupKeys(s, Array(1001).fill('gmail:one')));
  assert.throws(() => lookupKeys(s, ['raw message with spaces']));
});
