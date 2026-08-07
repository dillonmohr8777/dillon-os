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
const { renderDashboard, projectRows, crossTab } = require('../lib/radar-dashboard');
const {
  planDiscovery, AREA_TARGETS, REGISTRY_SOFT_CAP, REGISTRY_HARD_CAP,
} = require('../lib/coverage-plan');
const { classifyEmail } = require('../lib/contacts');
const contactStore = require('../lib/contact-store');

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
  // Pinned to the blue theme: no media query, so a viewer whose OS is in light
  // mode still sees the branded surface rather than a cream one.
  assert.doesNotMatch(html, /prefers-color-scheme/, 'the page must not follow the OS theme');
  assert.match(html, /:root \{\s*--bg:#101823/, 'blue is the base theme, not an override');
  assert.match(html, /\[data-theme="light"\]/, 'the light theme stays reachable by attribute');
  assert.match(html, /\[data-theme="dark"\]/);
  assert.match(html, /noindex/, 'this page names real businesses and must never be indexed');

  // The page is interactive, so it now has inline script — but the property that
  // actually matters is unchanged and is asserted directly rather than through
  // the old "no <script> at all" proxy: nothing may be loaded from anywhere.
  // It must work from file://, from Netlify, and with the network unplugged.
  assert.doesNotMatch(html, /<script[^>]+\bsrc\s*=/i, 'no external script');
  assert.doesNotMatch(html, /<link[^>]+\bhref\s*=/i, 'no external stylesheet or preload');
  assert.doesNotMatch(html, /@import/i, 'no CSS import');
  assert.doesNotMatch(html, /\burl\(\s*['"]?https?:/i, 'no remote asset in CSS');
  // The brand mark and the search icon are inlined as data: URIs. Those are
  // bytes already in the document, not a fetch — what must never appear is an
  // <img> pointing at a host.
  assert.doesNotMatch(html, /<img[^>]+\bsrc\s*=\s*['"](?!data:)/i, 'images must be inlined, never remote');
  assert.match(html, /<img class="lock__mark" src="data:image\//, 'the NeedMomentum mark ships inline');

  // Any absolute URL left in the document must be a link the user clicks, never
  // something the page fetches on load.
  const hosts = [...html.matchAll(/https?:\/\/([a-z0-9.-]+)/gi)].map((m) => m[1].toLowerCase());
  const fetched = hosts.filter((h) => /^(fonts|cdn|unpkg|cdnjs|ajax|use)\./.test(h));
  assert.deepEqual(fetched, [], `page must not reference asset CDNs, found: ${fetched.join(', ')}`);
});

test('the dashboard embeds every prospect, not just the queues', () => {
  const reg = emptyRegistry();
  const domains = ['a.example', 'b.example', 'c.example', 'd.example'];
  radar.upsertDiscovered(reg, domains.map((d) => candidate({ domain: d })), { today: TODAY });
  radar.recordGrade(reg, 'a.example', gradeResult({ verdict: 'rebuild', site_quality_score: 21 }), { today: TODAY });
  radar.recordGrade(reg, 'b.example', gradeResult({ verdict: 'polish', site_quality_score: 61 }), { today: TODAY });
  radar.recordGrade(reg, 'c.example', gradeResult({ verdict: 'nurture', site_quality_score: 88 }), { today: TODAY });
  // d.example stays ungraded on purpose — an unaudited row is still a row.

  const s = radar.summarize(reg, { today: TODAY });
  assert.equal(s.prospects.length, 4, 'summarize must expose the whole actionable set');

  const rows = projectRows(s.prospects);
  assert.equal(rows.length, 4);
  assert.deepEqual(rows.map((r) => r.d).sort(), domains);
  // Only one row is in the rebuild queue, but all four ship to the client.
  assert.equal(s.build_queue_size, 1);

  const html = renderDashboard(s);
  const island = html.match(/<script type="application\/json" id="radar-rows">([\s\S]*?)<\/script>/);
  assert.ok(island, 'the row payload must be embedded as a JSON island');
  const payload = JSON.parse(island[1]);
  assert.equal(payload.rows.length, 4, 'every prospect must survive the round-trip into the page');
  assert.deepEqual(payload.rows.map((r) => r.d).sort(), domains);
});

test('projectRows keeps dimension evidence, not just the score', () => {
  const reg = emptyRegistry();
  radar.upsertDiscovered(reg, [candidate()], { today: TODAY });
  radar.recordGrade(
    reg,
    'acme.example',
    gradeResult({
      dimensions: {
        foundation: { label: 'Foundation', score: 67, evidence: 'measured', weight: 20 },
        craft: { label: 'Design craft', score: 50, evidence: 'unknown', weight: 18 },
        mobile: { label: 'Mobile', score: 41, evidence: 'partial', weight: 22 },
      },
    }),
    { today: TODAY }
  );

  const stored = reg.prospects['acme.example'].current.dimensions;
  assert.deepEqual(stored.foundation, { score: 67, evidence: 'measured' });
  assert.deepEqual(stored.craft, { score: 50, evidence: 'unknown' });
  // History stays lean: only `current` carries the breakdown.
  assert.equal(reg.prospects['acme.example'].grades[0].dimensions, undefined);

  const [row] = projectRows([reg.prospects['acme.example']]);
  assert.deepEqual(row.dm.foundation, [67, 2], 'measured encodes as 2');
  assert.deepEqual(row.dm.mobile, [41, 1], 'partial encodes as 1');
  assert.deepEqual(row.dm.craft, [50, 0], 'unknown encodes as 0 so the UI can mark it unmeasured');
});

test('the dashboard escapes business names rather than injecting them', () => {
  const reg = emptyRegistry();
  const nasty = '</script><img src=x onerror=alert(1)>Bad & "Co"';
  radar.upsertDiscovered(reg, [candidate({ business_name: nasty })], { today: TODAY });
  radar.recordGrade(reg, 'acme.example', gradeResult(), { today: TODAY });

  const html = renderDashboard(radar.summarize(reg, { today: TODAY }));
  assert.doesNotMatch(html, /<img src=x onerror/);

  // The JSON island is the dangerous surface: a literal </script> in a business
  // name would close the tag and turn the rest of the payload into markup.
  const island = html.match(/<script type="application\/json" id="radar-rows">([\s\S]*?)<\/script>/);
  assert.ok(island, 'island must still be parseable after a hostile name');
  const payload = JSON.parse(island[1]);
  assert.equal(payload.rows[0].n, nasty, 'the name round-trips intact');
  assert.doesNotMatch(island[1], /<\/script/i, 'no raw closing tag may survive inside the island');
});

test('the dashboard survives an empty registry', () => {
  const html = renderDashboard(radar.summarize(emptyRegistry(), { today: TODAY }));

  // Scoped to the markup: the client script legitimately contains the strings
  // "undefined" and "NaN" in its own null-guards, so asserting over the whole
  // document would only ever prove that those guards exist.
  const markup = html.replace(/<script[\s\S]*?<\/script>/gi, '');
  assert.doesNotMatch(markup, /NaN|undefined/, 'no unformatted value may reach the page');

  const island = html.match(/<script type="application\/json" id="radar-rows">([\s\S]*?)<\/script>/);
  assert.deepEqual(JSON.parse(island[1]).rows, [], 'an empty registry embeds an empty row set, not a crash');
});

test('the dashboard refuses to emit a page too large to open', () => {
  const reg = emptyRegistry();
  radar.upsertDiscovered(reg, [candidate()], { today: TODAY });
  radar.recordGrade(reg, 'acme.example', gradeResult(), { today: TODAY });
  const s = radar.summarize(reg, { today: TODAY });
  // The guard exists so registry growth fails at generation rather than
  // silently producing something unusable on a phone.
  assert.throws(() => renderDashboard(s, { maxBytes: 1000 }), /over the .* limit/);
});

test('crossTab counts each prospect once per county and vertical', () => {
  const rows = [
    { a: 'Philadelphia', g: 'medical', r: 'rebuild' },
    { a: 'Philadelphia', g: 'medical', r: 'polish' },
    { a: 'Bucks County', g: 'legal', r: 'rebuild' },
  ];
  const ct = crossTab(rows);
  assert.equal(ct.areas.get('Philadelphia'), 2);
  assert.equal(ct.groups.get('medical'), 2);
  assert.deepEqual(ct.cells.get('Philadelphia medical'), { n: 2, rebuild: 1 });
  assert.deepEqual(ct.cells.get('Bucks County legal'), { n: 1, rebuild: 1 });
});

test('addDays and daysBetween agree', () => {
  assert.equal(radar.addDays('2026-08-06', 45), '2026-09-20');
  assert.equal(radar.daysBetween('2026-08-06', '2026-09-20'), 45);
  assert.equal(radar.addDays('2026-12-30', 5), '2027-01-04', 'must roll over the year');
});

/* ------------------------------------------------------------------ *
 * Google Places enrichment
 * ------------------------------------------------------------------ */

const places = require('../lib/places');

/** Fake httpGet returning a canned Places response. */
const fakePlaces = (placesArray, over = {}) => async () => ({
  ok: true,
  status: 200,
  body: JSON.stringify({ places: placesArray }),
  ...over,
});

test('enrichment only accepts a result whose website matches our domain', async () => {
  const row = { business_name: 'Jarman Sales', domain: 'jarmanairconditioning.com', city: 'Philadelphia' };
  // A national chain outranks the local business in the text search.
  const r = await places.enrichProspect(row, {
    apiKey: 'test',
    fetchImpl: fakePlaces([
      { id: 'chain', displayName: { text: 'Jarman HVAC Nationwide' }, websiteUri: 'https://bigchain.com', rating: 4.8, userRatingCount: 40000 },
    ]),
  });
  assert.equal(r.status, 'no_match', 'a chain must never lend its reviews to a local business');
  assert.equal(r.review_count, undefined);
});

test('enrichment accepts the row whose domain does match, not the first result', async () => {
  const row = { business_name: 'Jarman Sales', domain: 'jarmanairconditioning.com', city: 'Philadelphia' };
  const r = await places.enrichProspect(row, {
    apiKey: 'test',
    fetchImpl: fakePlaces([
      { id: 'chain', displayName: { text: 'Big Chain' }, websiteUri: 'https://bigchain.com', rating: 4.9, userRatingCount: 40000 },
      { id: 'real', displayName: { text: 'Jarman Sales & Service' }, websiteUri: 'https://www.jarmanairconditioning.com/', rating: 4.6, userRatingCount: 52 },
    ]),
  });
  assert.equal(r.status, 'ok');
  assert.equal(r.review_count, 52);
  assert.equal(r.rating, 4.6);
  assert.equal(r.place_id, 'real');
});

test('domainsMatch is strict about identity but tolerates www and subdomains', () => {
  assert.equal(places.domainsMatch('https://www.acme.com/x', 'acme.com'), true);
  assert.equal(places.domainsMatch('https://shop.acme.com', 'acme.com'), true);
  assert.equal(places.domainsMatch('https://acme-plumbing.com', 'acme.com'), false);
  assert.equal(places.domainsMatch('https://notacme.com', 'acme.com'), false);
  assert.equal(places.domainsMatch('', 'acme.com'), false);
});

test('enrichment is a no-op without an API key', async () => {
  const saved = process.env.GOOGLE_PLACES_API_KEY;
  delete process.env.GOOGLE_PLACES_API_KEY;
  try {
    const r = await places.enrichProspect({ business_name: 'A', domain: 'a.example' }, {});
    assert.equal(r.status, 'skipped');
    assert.match(r.reason, /GOOGLE_PLACES_API_KEY/);
  } finally {
    if (saved) process.env.GOOGLE_PLACES_API_KEY = saved;
  }
});

test('a rejected key and an exhausted quota report distinguishable errors', async () => {
  const row = { business_name: 'A', domain: 'a.example' };
  const forbidden = await places.enrichProspect(row, {
    apiKey: 'bad', fetchImpl: async () => ({ ok: true, status: 403, body: '{}' }),
  });
  assert.equal(forbidden.status, 'error');
  assert.match(forbidden.reason, /403/);

  const throttled = await places.enrichProspect(row, {
    apiKey: 'x', fetchImpl: async () => ({ ok: true, status: 429, body: '{}' }),
  });
  assert.match(throttled.reason, /429|quota/);
});

test('applyEnrichment adds signal and records the attempt without breaking ranking', () => {
  const reg = emptyRegistry();
  radar.upsertDiscovered(reg, [candidate()], { today: TODAY });
  radar.recordGrade(reg, 'acme.example', gradeResult(), { today: TODAY });
  const before = reg.prospects['acme.example'].priority_score;

  // A no-match still stamps the date so we do not pay to rediscover the absence.
  places.applyEnrichment(reg.prospects['acme.example'], { status: 'no_match', reason: 'none' }, { today: TODAY });
  assert.equal(reg.prospects['acme.example'].places_checked, TODAY);
  assert.equal(reg.prospects['acme.example'].review_count, undefined);
  assert.equal(reg.prospects['acme.example'].priority_score, before, 'a failed lookup must not move the ranking');

  places.applyEnrichment(reg.prospects['acme.example'], { status: 'ok', review_count: 120, rating: 4.7, place_id: 'p1' }, { today: LATER });
  const p = reg.prospects['acme.example'];
  assert.equal(p.review_count, 120);
  assert.equal(p.rating, 4.7);
  assert.equal(p.places_status, 'ok');
});

test('a permanently closed business is excluded outright', () => {
  const reg = emptyRegistry();
  radar.upsertDiscovered(reg, [candidate()], { today: TODAY });
  radar.recordGrade(reg, 'acme.example', gradeResult(), { today: TODAY });
  places.applyEnrichment(
    reg.prospects['acme.example'],
    { status: 'ok', business_status: 'CLOSED_PERMANENTLY', review_count: 12 },
    { today: TODAY }
  );
  const p = reg.prospects['acme.example'];
  assert.equal(p.lifecycle, 'excluded', 'there is nobody left to pitch');
  assert.equal(radar.priorityScore(p), 0);
});

test('needsEnrichment backs off further on a known no-match', () => {
  const base = { lifecycle: 'graded', places_checked: '2026-01-01' };
  // 150-day window for a previous hit, double that for a previous miss.
  assert.equal(places.needsEnrichment({ ...base, places_status: 'ok' }, { today: '2026-06-30' }), true);
  assert.equal(places.needsEnrichment({ ...base, places_status: 'no_match' }, { today: '2026-06-30' }), false);
  assert.equal(places.needsEnrichment({ lifecycle: 'graded' }, { today: TODAY }), true, 'never checked = needs a check');
  assert.equal(places.needsEnrichment({ lifecycle: 'client' }, { today: TODAY }), false);
});

test('enrichment feeds the opportunity model and lifts its confidence', () => {
  const { routeOpportunity } = require('../lib/opportunity');
  const grade = { score: 32, band: 'decayed', confidence: 0.9, capped: false, provisional: false, tier: 1 };
  const bare = routeOpportunity({ business_name: 'A', website: 'https://a.example', vertical: 'hvac', has_phone: true }, { grade });
  const enriched = routeOpportunity(
    { business_name: 'A', website: 'https://a.example', vertical: 'hvac', has_phone: true, review_count: 180, rating: 4.8 },
    { grade }
  );
  assert.ok(
    enriched.opportunity_confidence > bare.opportunity_confidence,
    `review data should raise confidence: ${bare.opportunity_confidence} -> ${enriched.opportunity_confidence}`
  );
  assert.ok(!enriched.components.missing_signals.includes('ability_to_pay'));
});

/* ------------------------------------------------------------------ *
 * Arch builder — the reference must never bleed into a prospect's page
 * ------------------------------------------------------------------ */

const { buildArchSite } = require('../lib/arch-build');
const archTokens = require('../lib/arch-tokens');

const prospect = (over = {}) => ({
  business_name: 'Andorra Family Dentistry',
  vertical: 'dentist',
  vertical_group: 'medical',
  city: 'Philadelphia',
  phone: '(215) 483-1420',
  address: '8945 Ridge Ave, Philadelphia, PA 19128',
  ...over,
});

test('a prospect with no phone never inherits the reference number', () => {
  // The build queue is sanitized for a public repo, so `phone` is routinely
  // absent. An earlier version guarded the whole phone block on `if (tel)`, and
  // three drafts deployed carrying a Folcroft painting company's number as their
  // call-to-action. A wrong number sends the prospect's customers to a stranger.
  const r = buildArchSite(prospect({ phone: '' }));
  assert.doesNotMatch(r.html, /6102379900/, 'reference phone digits must not survive');
  assert.doesNotMatch(r.html, /\(610\) 237-9900/, 'reference phone must not survive formatted');
  const tels = [...r.html.matchAll(/href="tel:([^"]*)"/g)].map((m) => m[1]).filter(Boolean);
  assert.deepEqual(tels, [], 'with no verified number there must be no tel: link at all');
});

test('a prospect with a phone gets theirs, and only theirs', () => {
  const r = buildArchSite(prospect());
  const tels = [...new Set([...r.html.matchAll(/href="tel:([^"]*)"/g)].map((m) => m[1]))];
  assert.deepEqual(tels, ['2154831420']);
  assert.doesNotMatch(r.html, /6102379900/);
});

test('the reference identity never survives a build', () => {
  const r = buildArchSite(prospect());
  for (const s of ['Advanced Commercial Interior', 'Folcroft', '1050 E Ashland Ave', 'Ashland%20Ave']) {
    assert.ok(!r.html.includes(s), `reference string "${s}" leaked into the output`);
  }
  // Maps links carry the address URL-encoded, which a plain-text swap misses.
  const maps = [...r.html.matchAll(/maps\.google\.com\/\?q=([^"]*)/g)].map((m) => decodeURIComponent(m[1]));
  for (const q of maps) assert.doesNotMatch(q, /Folcroft|Ashland/);
});

test('alt text describes the prospect, not the reference photographs', () => {
  const r = buildArchSite(prospect());
  const alts = [...r.html.matchAll(/<img[^>]+alt="([^"]*)"/g)].map((m) => m[1]);
  assert.ok(alts.length > 0);
  for (const a of alts) assert.doesNotMatch(a, /commercial wall|neutral coating|painter rolling/i);
});

test('every build is noindex and none claims to be shippable while leaking', () => {
  const r = buildArchSite(prospect());
  assert.equal(r.noindex, true);
  // Five sections still carry reference prose, so nothing may report shippable.
  assert.equal(r.shippable, false);
  assert.ok(r.blockers.length > 0, 'an unshippable build must say why');
});

test('arch skins are unique across a batch and suit the vertical', () => {
  const used = new Set();
  const a = buildArchSite(prospect({ business_name: 'A Dental' }), { usedSkins: used });
  const b = buildArchSite(prospect({ business_name: 'B Dental' }), { usedSkins: used });
  assert.notEqual(a.arch, b.arch, 'two sites in one batch must not share a skin');
  assert.ok(archTokens.ARCH_SKINS.medical.includes(a.arch), `${a.arch} is not a medical skin`);
});

test('token contrast maths matches WCAG at known anchors', () => {
  assert.equal(Math.round(archTokens.contrast('#FFFFFF', '#FFFFFF')), 1);
  assert.equal(Math.round(archTokens.contrast('#000000', '#FFFFFF')), 21);
  // A light gold accent cannot carry white text, so on-accent must flip.
  assert.equal(archTokens.onColor('#D7A243').color, '#090909');
  assert.equal(archTokens.onColor('#176B5E').color, '#FFFFFF');
});

/* ------------------------------------------------------------------ *
 * Coverage planning — the thing that decides what tomorrow looks for
 * ------------------------------------------------------------------ */

function registryWith(counts) {
  // counts: { 'Philadelphia': {'home-services': 3, medical: 1}, ... }
  const reg = emptyRegistry();
  let n = 0;
  const rows = [];
  for (const [area, groups] of Object.entries(counts)) {
    for (const [group, howMany] of Object.entries(groups)) {
      for (let i = 0; i < howMany; i++) {
        rows.push(candidate({
          domain: `d${n++}.example`, area, city: area, vertical_group: group,
        }));
      }
    }
  }
  radar.upsertDiscovered(reg, rows, { today: TODAY });
  return reg;
}

test('the plan sends the budget to the areas furthest behind target', () => {
  // Mirrors the real skew that motivated this: one county badly over-collected,
  // the priority market badly under-collected.
  const reg = registryWith({
    'Montgomery County': { 'home-services': 400 },
    Philadelphia: { 'home-services': 100 },
  });
  const plan = planDiscovery(reg, { budget: 60 });

  const names = plan.targets.map((t) => t.name);
  assert.ok(names.includes('Philadelphia'), 'the under-served priority market must be targeted');
  assert.ok(!names.includes('Montgomery County'), 'an over-collected county must not be targeted');

  const mont = plan.areaDeficits.find((a) => a.name === 'Montgomery County');
  assert.ok(mont.deficit < 0, 'over-target areas carry a negative deficit');
});

test('no single area can absorb the whole budget', () => {
  const reg = registryWith({ 'Montgomery County': { food: 500 } });
  const plan = planDiscovery(reg, { budget: 60 });
  for (const t of plan.targets) {
    assert.ok(t.cap <= plan.budget, `${t.name} cap ${t.cap} must not exceed the day's budget`);
  }
  const capSum = plan.targets.reduce((s, t) => s + t.cap, 0);
  // Caps are per-area ceilings, not reservations, so they may sum above the
  // budget — but the run stops at the budget, and no one cap may swallow it all.
  assert.ok(plan.targets.length > 1, 'the budget spreads across multiple areas');
});

test('the plan picks verticals that are behind, not verticals that are plentiful', () => {
  const reg = registryWith({
    Philadelphia: { food: 300, 'home-services': 5 },
  });
  const plan = planDiscovery(reg, { budget: 60 });
  const groups = plan.targets[0].groups;
  assert.ok(groups.includes('home-services'), 'an under-collected high-value group must be chosen');
  assert.ok(!groups.includes('food'), 'an over-collected group must not be chosen');
});

test('discovery throttles as the registry approaches its useful size', () => {
  const under = registryWith({ Philadelphia: { 'home-services': 100 } });
  assert.equal(planDiscovery(under, { budget: 60 }).throttled, false);

  // Past the soft cap the budget shrinks; past the hard cap it stops entirely,
  // because another unaudited row is worth less than a rendered one — and the
  // dashboard's embedded payload has a real ceiling.
  const soft = { prospects: {} };
  for (let i = 0; i < REGISTRY_SOFT_CAP + 10; i++) soft.prospects[`s${i}`] = { domain: `s${i}`, area: 'Philadelphia' };
  const softPlan = planDiscovery(soft, { budget: 60 });
  assert.equal(softPlan.throttled, true);
  assert.ok(softPlan.budget < 60, 'the soft cap reduces the budget');

  const hard = { prospects: {} };
  for (let i = 0; i < REGISTRY_HARD_CAP + 10; i++) hard.prospects[`h${i}`] = { domain: `h${i}`, area: 'Philadelphia' };
  const hardPlan = planDiscovery(hard, { budget: 60 });
  assert.equal(hardPlan.budget, 0, 'the hard cap stops discovery');
  assert.equal(hardPlan.targets.length, 0);
  assert.match(hardPlan.reason, /hard cap/);
});

test('a balanced registry still produces something to do', () => {
  // If every area is at or above target, planning nothing and reporting success
  // would look identical to a broken sweep. It tops up instead.
  const reg = { prospects: {} };
  for (const a of AREA_TARGETS) {
    const n = Math.round(1000 * a.share) + 5;
    for (let i = 0; i < n; i++) {
      reg.prospects[`${a.name}-${i}`] = { domain: `${a.name}-${i}`, area: a.name, vertical_group: 'home-services' };
    }
  }
  const plan = planDiscovery(reg, { budget: 60 });
  assert.ok(plan.targets.length >= 1, 'a balanced registry still gets a target');
  assert.ok(plan.budget > 0);
});

test('the dashboard payload interns repeated text and the client can resolve it', () => {
  const reg = emptyRegistry();
  radar.upsertDiscovered(reg, [candidate(), candidate({ domain: 'b.example', business_name: 'B Co' })], { today: TODAY });
  // Two prospects, identical generated copy — the point of interning.
  const g = gradeResult({ headline: 'same headline', offer: 'same offer', next_action: 'same next' });
  radar.recordGrade(reg, 'acme.example', g, { today: TODAY });
  radar.recordGrade(reg, 'b.example', g, { today: TODAY });

  const html = renderDashboard(radar.summarize(reg, { today: TODAY }));
  const payload = JSON.parse(html.match(/id="radar-rows">([\s\S]*?)<\/script>/)[1]);

  assert.ok(Array.isArray(payload.meta.strings), 'a string table must ship');
  // The shared sentences appear once in the table, not once per row.
  assert.equal(payload.meta.strings.filter((v) => v === 'same headline').length, 1);
  for (const row of payload.rows) {
    assert.equal(typeof row.hl, 'number', 'headline is an index, not a string');
    assert.equal(payload.meta.strings[row.hl], 'same headline');
    assert.ok(Array.isArray(row.f), 'faults are an index array');
    for (const i of row.f) assert.equal(typeof i, 'number');
  }
  // Faults share the table, so the fault text must still be recoverable.
  const faultText = payload.rows[0].f.map((i) => payload.meta.strings[i]);
  assert.ok(faultText.includes('no viewport meta'), `faults must round-trip, got ${faultText}`);
});

test('an empty field interns to -1 rather than pointing at the wrong string', () => {
  const reg = emptyRegistry();
  radar.upsertDiscovered(reg, [candidate()], { today: TODAY });
  radar.recordGrade(reg, 'acme.example', gradeResult({ offer: '', next_action: '' }), { today: TODAY });
  const html = renderDashboard(radar.summarize(reg, { today: TODAY }));
  const payload = JSON.parse(html.match(/id="radar-rows">([\s\S]*?)<\/script>/)[1]);
  assert.equal(payload.rows[0].of, -1, 'empty must be -1, never index 0');
  assert.equal(payload.rows[0].na, -1);
});

/* ------------------------------------------------------------------ *
 * Guards for the defects a code review found — each of these failed
 * before its fix, and none was caught by any pre-existing test.
 * ------------------------------------------------------------------ */

test('the row projection has no duplicate keys', () => {
  // `cf` was defined twice in projectRows — once as confidence, once as the
  // contact-form flag. Object literals do not warn, the later definition won,
  // and 743 of 747 rows shipped a fabricated "0%" confidence to the published
  // page. Nothing in the suite noticed, so the source is checked directly.
  const src = require('fs').readFileSync(require.resolve('../lib/radar-dashboard'), 'utf8');
  const body = src.slice(src.indexOf('function projectRows'), src.indexOf('/** County × vertical'));
  const keys = [...body.matchAll(/^\s{6}([a-z]{1,3}):/gm)].map((m) => m[1]);
  const seen = new Set();
  const dupes = keys.filter((k) => (seen.has(k) ? true : (seen.add(k), false)));
  assert.deepEqual(dupes, [], `projectRows defines these keys twice: ${dupes.join(', ')}`);
});

test('confidence survives the projection as a real percentage', () => {
  const reg = emptyRegistry();
  radar.upsertDiscovered(reg, [candidate()], { today: TODAY });
  radar.recordGrade(reg, 'acme.example', gradeResult({ confidence: 0.91 }), { today: TODAY });
  const [row] = projectRows([reg.prospects['acme.example']]);
  assert.equal(row.cf, 91, 'confidence must be a percentage, not a boolean flag');
});

test('the dashboard renders at the hard cap without throwing', () => {
  // The caps existed to stop the daily job driving the page past the size where
  // renderDashboard refuses to emit — but they were set from an extrapolated
  // bytes-per-row figure and both landed ABOVE the real ceiling, so the throttle
  // could never fire. Only rendering catches that.
  const reg = emptyRegistry();
  for (let i = 0; i < REGISTRY_HARD_CAP; i++) {
    const d = `d${i}.example`;
    radar.upsertDiscovered(reg, [candidate({ domain: d, business_name: `Biz ${i}` })], { today: TODAY });
    // Headlines and faults embed measured numbers, so they are near-unique per
    // prospect and the interned table grows with the registry. A synthetic set
    // of identical strings would compress unrealistically well and pass a test
    // the real data fails.
    radar.recordGrade(reg, d, gradeResult({
      site_quality_score: 20 + (i % 60),
      headline: `${20 + (i % 60)}/100 decayed (provisional — Tier 0 only). Worst: no viewport meta on ${d}.`,
      findings: [
        { delta: -42, reason: `no viewport meta — page renders desktop-width (${i})`, dimension: 'mobile' },
        { delta: -18, reason: `slow first response: ${1000 + i}ms`, dimension: 'performance' },
      ],
    }), { today: TODAY });
  }
  const s = radar.summarize(reg, { today: TODAY });
  assert.equal(s.total, REGISTRY_HARD_CAP);
  assert.doesNotThrow(
    () => renderDashboard(s),
    `renderDashboard must not throw at the hard cap of ${REGISTRY_HARD_CAP} rows — ` +
      'lower REGISTRY_HARD_CAP or shrink the payload'
  );
});

test('the change feed reports totals, not the truncated list length', () => {
  const reg = emptyRegistry();
  // 60 arrivals, well past the feed's 40-event display cap.
  const rows = Array.from({ length: 60 }, (_, i) => candidate({ domain: `n${i}.example`, business_name: `New ${i}` }));
  radar.upsertDiscovered(reg, rows, { today: TODAY });
  const s = radar.summarize(reg, { today: TODAY });

  assert.equal(s.today.length, 40, 'the displayed list is capped');
  assert.equal(s.today_totals.found, 60, 'the total must be the pre-cap count');
  assert.equal(s.today_totals.found, s.new_today, 'the feed total and new_today must agree');

  const html = renderDashboard(s);
  assert.match(html, /Newly found <b>60<\/b>/, 'the page must show 60, not the capped 40');
});

test('a same-day re-grade does not erase the previous sweep comparison', () => {
  const reg = emptyRegistry();
  radar.upsertDiscovered(reg, [candidate()], { today: TODAY });
  radar.recordGrade(reg, 'acme.example', gradeResult({ verdict: 'verify' }), { today: TODAY });
  // A sweep flips the verdict, then --regrade appends a second grade the same day.
  radar.recordGrade(reg, 'acme.example', gradeResult({ verdict: 'rebuild' }), { today: LATER });
  radar.recordGrade(reg, 'acme.example', gradeResult({ verdict: 'rebuild' }), { today: LATER });

  const s = radar.summarize(reg, { today: LATER });
  const flip = s.today.find((e) => e.kind === 'verdict');
  assert.ok(flip, 'the verify -> rebuild flip must survive a same-day re-grade');
  assert.equal(flip.from, 'verify');
  assert.equal(flip.to, 'rebuild');
});

test('an own-domain address is matched on a label boundary', () => {
  // A bare endsWith made info@notsmilecare.com read as smilecare.com's own
  // address, and because own-domain sorts first it became the primary row in the
  // mail-merge sheet.
  const own = 'smilecare.com';
  const isOwn = (d) => d === own || d.endsWith(`.${own}`);
  assert.equal(isOwn(classifyEmail('info@smilecare.com').domain), true);
  assert.equal(isOwn(classifyEmail('info@mail.smilecare.com').domain), true);
  assert.equal(isOwn(classifyEmail('info@notsmilecare.com').domain), false);
  assert.equal(isOwn(classifyEmail('info@evilsmilecare.com').domain), false);
});

test('the placeholder filter drops fakes without dropping real addresses', () => {
  for (const real of ['hello@emailus.com', 'info@testkitchen.com', 'contact@domainhome.com', 'jane@wixomlaw.com']) {
    assert.ok(classifyEmail(real), `${real} is a real address and must survive`);
  }
  for (const fake of ['you@example.com', 'info@wix.com', 'a@test.com', 'noreply@acme.com', 'logo@thing.png']) {
    assert.equal(classifyEmail(fake), null, `${fake} must be rejected`);
  }
});

test('an agency address is a signal, never a contact', () => {
  const c = classifyEmail('info@askmagnify.com');
  assert.equal(c.agency, 'askmagnify.com', 'the incumbent agency must be identified');
  // Subdomains of an agency count; a lookalike does not.
  assert.equal(classifyEmail('a@mail.askmagnify.com').agency, 'askmagnify.com');
  assert.equal(classifyEmail('a@notaskmagnify.com').agency, null);
});

test('the suppression list fails closed on a damaged file', () => {
  const fs = require('fs');
  const os = require('os');
  const path = require('path');
  // Must sit under 12_Brain/private — contact-store refuses to touch anything else.
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'radar-')) + '/12_Brain/private';
  fs.mkdirSync(dir, { recursive: true });
  const good = path.join(dir, 'ok.json');
  const bad = path.join(dir, 'bad.json');

  fs.writeFileSync(good, JSON.stringify({ emails: ['a@b.co'] }));
  assert.equal(contactStore.loadSuppressed(good).has('a@b.co'), true);

  // Absent is a legitimate first run.
  assert.equal(contactStore.loadSuppressed(path.join(dir, 'missing.json')).size, 0);

  // Truncated is not. Returning an empty set here would silently un-suppress
  // everyone who has ever bounced, complained or asked to be removed.
  fs.writeFileSync(bad, '{"emails": ["a@b.co"');
  assert.throws(() => contactStore.loadSuppressed(bad), /not valid JSON/);
});

test('the contact store refuses to write outside the private layer', () => {
  // The one guarantee that keeps email addresses out of a public repository.
  assert.throws(
    () => contactStore.save({ contacts: {} }, '/tmp/somewhere-public/contacts.json'),
    /must live under 12_Brain\/private/
  );
});
