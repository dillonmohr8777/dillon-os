'use strict';

/**
 * Tests for the prospect radar registry.
 *
 * The properties locked down here are the ones that make a registry worth more
 * than a graded CSV: history is never lost, a business already actioned cannot
 * resurface as a fresh lead, Philadelphia outranks the rest of the state at equal
 * merit, and a site that improved gets pulled out of the build queue before we
 * pitch a redesign to someone who just paid for one.
 */

const test = require('node:test');
const assert = require('node:assert/strict');

const radar = require('../lib/radar');
const { renderDashboard } = require('../lib/radar-dashboard');

const TODAY = '2026-08-06';
const LATER = '2026-10-01';

function emptyRegistry() {
  return { prospects: {} };
}

const candidate = (over = {}) => ({
  domain: 'acme.example',
  business_name: 'Acme Plumbing',
  website: 'https://acme.example',
  vertical: 'plumber',
  vertical_group: 'home-services',
  market: 'PHL',
  area: 'Philadelphia',
  city: 'Philadelphia',
  phone: '215-555-1234',
  ...over,
});

const gradeResult = (over = {}) => ({
  site_quality_score: 35,
  site_quality_band: 'decayed',
  confidence: 0.9,
  tier_reached: 0,
  verdict: 'rebuild',
  opportunity_score: 70,
  offer: 'Tier-A demo site',
  next_action: 'Queue a brief',
  headline: 'decayed',
  findings: [{ delta: -42, reason: 'no viewport meta', dimension: 'mobile' }],
  ...over,
});

/* ------------------------------------------------------------------ *
 * Discovery must never clobber what we already know
 * ------------------------------------------------------------------ */

test('rediscovering a prospect keeps its history and lifecycle', () => {
  const reg = emptyRegistry();
  radar.upsertDiscovered(reg, [candidate()], { today: TODAY });
  radar.recordGrade(reg, 'acme.example', gradeResult(), { today: TODAY });
  radar.setLifecycle(reg, 'acme.example', 'mailed', { today: TODAY });

  const stats = radar.upsertDiscovered(reg, [candidate()], { today: LATER });

  const p = reg.prospects['acme.example'];
  assert.equal(stats.added, 0);
  assert.equal(stats.refreshed, 1);
  assert.equal(p.lifecycle, 'mailed', 'a mailed business must not revert to new');
  assert.equal(p.grades.length, 1, 'history survives rediscovery');
  assert.equal(p.first_seen, TODAY);
  assert.equal(p.times_discovered, 2);
});

test('candidates without a domain are skipped rather than keyed on undefined', () => {
  const reg = emptyRegistry();
  const stats = radar.upsertDiscovered(reg, [candidate({ domain: '' }), candidate()], { today: TODAY });
  assert.equal(stats.added, 1);
  assert.equal(stats.skipped, 1);
  assert.equal(Object.keys(reg.prospects).length, 1);
});

/* ------------------------------------------------------------------ *
 * Grade history and trend
 * ------------------------------------------------------------------ */

test('grades append and a rising score reads as improved', () => {
  const reg = emptyRegistry();
  radar.upsertDiscovered(reg, [candidate()], { today: TODAY });
  radar.recordGrade(reg, 'acme.example', gradeResult({ site_quality_score: 30 }), { today: TODAY });
  radar.recordGrade(reg, 'acme.example', gradeResult({ site_quality_score: 78, verdict: 'ads_seo' }), { today: LATER });

  const p = reg.prospects['acme.example'];
  assert.equal(p.grades.length, 2);
  assert.equal(p.current.sqs, 78);
  assert.equal(p.trend, 'improved');
  assert.equal(p.trend_delta, 48);
});

test('a declining score reads as declined and earns a priority bump', () => {
  const reg = emptyRegistry();
  radar.upsertDiscovered(reg, [candidate()], { today: TODAY });
  radar.recordGrade(reg, 'acme.example', gradeResult({ site_quality_score: 70, verdict: 'polish' }), { today: TODAY });
  const before = reg.prospects['acme.example'].priority_score;
  radar.recordGrade(reg, 'acme.example', gradeResult({ site_quality_score: 40 }), { today: LATER });
  const p = reg.prospects['acme.example'];

  assert.equal(p.trend, 'declined');
  assert.ok(p.priority_score > before, 'a site that got worse should rank higher');
});

test('a site that improved is ranked below one that did not', () => {
  const reg = emptyRegistry();
  radar.upsertDiscovered(reg, [candidate(), candidate({ domain: 'b.example', business_name: 'B' })], { today: TODAY });
  // Same opportunity, same geography; only the trajectory differs.
  radar.recordGrade(reg, 'acme.example', gradeResult({ site_quality_score: 20 }), { today: TODAY });
  radar.recordGrade(reg, 'acme.example', gradeResult({ site_quality_score: 45 }), { today: LATER });
  radar.recordGrade(reg, 'b.example', gradeResult({ site_quality_score: 45 }), { today: LATER });

  assert.ok(
    reg.prospects['b.example'].priority_score > reg.prospects['acme.example'].priority_score,
    'the improving site should not outrank the steady one'
  );
});

test('history is capped so the registry cannot grow without bound', () => {
  const reg = emptyRegistry();
  radar.upsertDiscovered(reg, [candidate()], { today: TODAY });
  for (let i = 0; i < 20; i++) {
    radar.recordGrade(reg, 'acme.example', gradeResult({ site_quality_score: 30 + i }), { today: TODAY });
  }
  const p = reg.prospects['acme.example'];
  assert.equal(p.grades.length, 12);
  assert.equal(p.current.sqs, 49, 'the newest grade survives the trim');
});

/* ------------------------------------------------------------------ *
 * Recheck scheduling — the thing a flat CSV cannot do
 * ------------------------------------------------------------------ */

test('each verdict earns its own recheck cadence', () => {
  const reg = emptyRegistry();
  radar.upsertDiscovered(reg, [candidate(), candidate({ domain: 'v.example' })], { today: TODAY });
  radar.recordGrade(reg, 'acme.example', gradeResult({ verdict: 'rebuild' }), { today: TODAY });
  radar.recordGrade(reg, 'v.example', gradeResult({ verdict: 'verify' }), { today: TODAY });

  assert.equal(reg.prospects['acme.example'].next_recheck, radar.addDays(TODAY, radar.RECHECK_DAYS.rebuild));
  assert.equal(reg.prospects['v.example'].next_recheck, radar.addDays(TODAY, radar.RECHECK_DAYS.verify));
  assert.ok(
    radar.RECHECK_DAYS.verify < radar.RECHECK_DAYS.ads_seo,
    'rows blocked on a render should come back sooner than ones we decided to leave alone'
  );
});

test('never-graded prospects are audited before merely-stale ones', () => {
  const reg = emptyRegistry();
  radar.upsertDiscovered(reg, [candidate({ domain: 'stale.example' }), candidate({ domain: 'fresh.example' })], { today: TODAY });
  radar.recordGrade(reg, 'stale.example', gradeResult(), { today: TODAY });

  const due = radar.dueForRecheck(reg, { today: LATER, limit: 10 });
  assert.equal(due[0].domain, 'fresh.example', 'an ungraded prospect is a blind spot and goes first');
});

test('clients and excluded prospects never come up for recheck', () => {
  const reg = emptyRegistry();
  radar.upsertDiscovered(reg, [candidate({ domain: 'c.example' }), candidate({ domain: 'x.example' })], { today: TODAY });
  radar.setLifecycle(reg, 'c.example', 'client');
  radar.setLifecycle(reg, 'x.example', 'excluded');

  assert.equal(radar.dueForRecheck(reg, { today: LATER, limit: 10 }).length, 0);
});

test('setLifecycle rejects an unknown state', () => {
  const reg = emptyRegistry();
  radar.upsertDiscovered(reg, [candidate()], { today: TODAY });
  assert.throws(() => radar.setLifecycle(reg, 'acme.example', 'nonsense'), /invalid lifecycle/);
});

/* ------------------------------------------------------------------ *
 * Philadelphia priority
 * ------------------------------------------------------------------ */

test('Philadelphia outranks the rest of Pennsylvania at equal merit', () => {
  const reg = emptyRegistry();
  radar.upsertDiscovered(
    reg,
    [
      candidate({ domain: 'phl.example', area: 'Philadelphia', city: 'Philadelphia', market: 'PHL' }),
      candidate({ domain: 'collar.example', area: 'Bucks County', city: 'Doylestown', market: 'PHL' }),
      candidate({ domain: 'pgh.example', area: 'Allegheny County', city: 'Pittsburgh', market: 'PGH' }),
    ],
    { today: TODAY }
  );
  for (const d of ['phl.example', 'collar.example', 'pgh.example']) {
    radar.recordGrade(reg, d, gradeResult({ opportunity_score: 80 }), { today: TODAY });
  }

  const phl = reg.prospects['phl.example'].priority_score;
  const collar = reg.prospects['collar.example'].priority_score;
  const pgh = reg.prospects['pgh.example'].priority_score;

  assert.ok(phl > collar, `Philadelphia (${phl}) should outrank the collar counties (${collar})`);
  assert.ok(collar > pgh, `the collar counties (${collar}) should outrank Pittsburgh (${pgh})`);
});

test('geoWeight falls back sensibly for unlabelled rows', () => {
  assert.equal(radar.geoWeight({ city: 'Philadelphia' }), 1);
  assert.equal(radar.geoWeight({ market: 'PHL' }), 0.9);
  assert.ok(radar.geoWeight({ market: 'ERI' }) < 0.9);
});

test('an actioned prospect cannot outrank a fresh one', () => {
  const reg = emptyRegistry();
  radar.upsertDiscovered(reg, [candidate(), candidate({ domain: 'new.example' })], { today: TODAY });
  radar.recordGrade(reg, 'acme.example', gradeResult({ opportunity_score: 95 }), { today: TODAY });
  radar.recordGrade(reg, 'new.example', gradeResult({ opportunity_score: 70 }), { today: TODAY });
  radar.setLifecycle(reg, 'acme.example', 'mailed');

  assert.ok(reg.prospects['new.example'].priority_score > reg.prospects['acme.example'].priority_score);
  radar.setLifecycle(reg, 'acme.example', 'client');
  assert.equal(reg.prospects['acme.example'].priority_score, 0);
});

/* ------------------------------------------------------------------ *
 * Summary + dashboard
 * ------------------------------------------------------------------ */

test('summarize separates the build queue from the traffic queue', () => {
  const reg = emptyRegistry();
  radar.upsertDiscovered(
    reg,
    [candidate(), candidate({ domain: 'good.example' }), candidate({ domain: 'mid.example' })],
    { today: TODAY }
  );
  radar.recordGrade(reg, 'acme.example', gradeResult({ verdict: 'rebuild', site_quality_score: 30 }), { today: TODAY });
  radar.recordGrade(reg, 'good.example', gradeResult({ verdict: 'ads_seo', site_quality_score: 90, site_quality_band: 'elite' }), { today: TODAY });
  radar.recordGrade(reg, 'mid.example', gradeResult({ verdict: 'polish', site_quality_score: 65, site_quality_band: 'dated' }), { today: TODAY });

  const s = radar.summarize(reg, { today: TODAY });
  assert.equal(s.build_queue_size, 1);
  assert.equal(s.build_queue[0].domain, 'acme.example');
  assert.equal(s.traffic_queue.length, 1);
  assert.equal(s.traffic_queue[0].domain, 'good.example');
  assert.equal(s.by_verdict.polish, 1);
  assert.equal(s.by_area.Philadelphia.total, 3);
});

test('the dashboard renders self-contained HTML with no external requests', () => {
  const reg = emptyRegistry();
  radar.upsertDiscovered(reg, [candidate()], { today: TODAY });
  radar.recordGrade(reg, 'acme.example', gradeResult({ site_quality_score: 20 }), { today: TODAY });
  radar.recordGrade(reg, 'acme.example', gradeResult({ site_quality_score: 34 }), { today: LATER });

  const html = renderDashboard(radar.summarize(reg, { today: LATER }));

  assert.match(html, /<title>Prospect Radar/);
  assert.match(html, /Acme Plumbing/);
  assert.match(html, /data-theme="dark"/, 'must honour the viewer theme toggle, not only the media query');
  assert.match(html, /prefers-color-scheme: dark/);
  assert.match(html, /<svg class="spark"/, 'two grades should draw a sparkline');
  // No external hosts: no CDN fonts, no remote images, no script tags.
  assert.doesNotMatch(html, /<script/i);
  assert.doesNotMatch(html, /https?:\/\/(?:fonts|cdn|unpkg|cdnjs)\./i);
  assert.doesNotMatch(html, /@import/i);
});

test('the dashboard escapes business names rather than injecting them', () => {
  const reg = emptyRegistry();
  radar.upsertDiscovered(reg, [candidate({ business_name: '<img src=x onerror=alert(1)>Bad & Co' })], { today: TODAY });
  radar.recordGrade(reg, 'acme.example', gradeResult(), { today: TODAY });

  const html = renderDashboard(radar.summarize(reg, { today: TODAY }));
  assert.doesNotMatch(html, /<img src=x onerror/);
  assert.match(html, /&lt;img src=x onerror/);
  assert.match(html, /Bad &amp; Co/);
});

test('the dashboard survives an empty registry', () => {
  const html = renderDashboard(radar.summarize(emptyRegistry(), { today: TODAY }));
  assert.match(html, /Nothing qualifies for a rebuild/);
  assert.doesNotMatch(html, /NaN|undefined/);
});

test('addDays and daysBetween agree', () => {
  assert.equal(radar.addDays('2026-08-06', 45), '2026-09-20');
  assert.equal(radar.daysBetween('2026-08-06', '2026-09-20'), 45);
  assert.equal(radar.addDays('2026-12-30', 5), '2027-01-04', 'must roll over the year');
});
