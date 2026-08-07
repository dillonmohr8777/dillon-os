'use strict';

/**
 * Tests for the prospect website grader.
 *
 * The bugs these lock down are the ones found during the 2026-08-06 calibration
 * run over 500 Philadelphia prospects. Each was capable of sending a redesign
 * pitch to a business whose website is already good, or of dropping a genuine
 * rebuild target — the two failures the grader exists to prevent.
 */

const test = require('node:test');
const assert = require('node:assert/strict');

const { gradeSite, mergeAudits, TIER0_SCORE_CEILING } = require('../lib/site-grader');
const { analyzeTier0, visibleText, detectPlatform } = require('../lib/site-audit');
const { routeOpportunity, shouldEscalate, verticalTier } = require('../lib/opportunity');
const { toCandidates, classify, isChain, isNonSiteDomain, normalizeDomain, buildQuery } = require('../lib/discovery');
const { scoreProspect } = require('../lib/scorer');

const html = (body, head = '') => `<!doctype html><html><head>${head}</head><body>${body}</body></html>`;
const res = (body, head = '', over = {}) => ({
  ok: true,
  status: 200,
  finalUrl: 'https://example.com/',
  headers: {},
  html: html(body, head),
  bytes: 4000,
  responseMs: 400,
  hops: [{ url: 'https://example.com/', status: 200 }],
  ...over,
});

const MODERN_HEAD =
  '<meta name="viewport" content="width=device-width,initial-scale=1">' +
  '<title>Acme Plumbing</title>' +
  '<meta name="description" content="Acme Plumbing serves the whole Philadelphia region with 24 hour emergency service.">' +
  '<meta property="og:title" content="Acme"><meta property="og:image" content="https://x/y.jpg">' +
  '<script type="application/ld+json">{"@type":"Plumber","name":"Acme"}</script>' +
  '<script type="application/ld+json">{"@type":"LocalBusiness"}</script>' +
  '<style>@media (max-width: 700px){.a{display:flex}} .b{display:grid} :root{--c:#fff}</style>';

/** A homepage with everything Tier 0 can possibly reward. */
const STRONG_BODY =
  '<h1>Acme Plumbing</h1>' +
  `<p>${'Trusted Philadelphia plumbers since nineteen seventy eight serving every neighborhood. '.repeat(45)}</p>` +
  '<p>Mon-Fri 8am-6pm, Sat 9am-2pm, Sun closed</p>' +
  '<a href="tel:2155551234">(215) 555-1234</a><a href="/book">Book now</a>' +
  '<form action="/contact"><input name="e"></form>' +
  '<a href="https://calendly.com/acme">Schedule</a>' +
  '<img src="a.webp" alt="crew" loading="lazy"><img src="b.webp" alt="van" loading="lazy">' +
  '<img src="c.webp" alt="shop" loading="lazy"><img src="d.webp" alt="team">';

/* ------------------------------------------------------------------ *
 * Scoring fundamentals
 * ------------------------------------------------------------------ */

test('unknown evidence lowers confidence instead of scoring zero', () => {
  const g = gradeSite({ tier: 0, url: 'https://example.com/' });
  // Nothing measured at all: refuse to grade rather than report a damning 0.
  assert.equal(g.score, null);
  assert.equal(g.band, 'ungraded');
  assert.equal(g.confidence, 0);
  assert.ok(g.unknown.length > 0);
});

test('a dead domain is graded, not treated as missing evidence', () => {
  const g = gradeSite({ tier: 0, url: 'https://gone.example/', reachable: false, error: 'ENOTFOUND' });
  assert.ok(g.score != null && g.score < 30, `expected a low score, got ${g.score}`);
  assert.equal(g.rebuildable, true);
});

test('a decayed site scores below a modern one on the same audit shape', () => {
  const decayed = gradeSite(analyzeTier0(res('<p>Call us.</p>', '<title>x</title>', {
    finalUrl: 'http://old.example/',
  }), 'http://old.example/'));
  const modern = gradeSite(analyzeTier0(res(
    `<h1>Acme Plumbing</h1><p>${'Trusted Philadelphia plumbers since 1978. '.repeat(30)}</p>` +
    '<a href="tel:2155551234">(215) 555-1234</a><a href="/contact">Get a quote</a>' +
    '<img src="a.webp" alt="crew"><img src="b.webp" alt="van"><img src="c.webp" alt="shop">',
    MODERN_HEAD
  ), 'https://example.com/'));

  assert.ok(decayed.score < modern.score, `decayed ${decayed.score} should be < modern ${modern.score}`);
  assert.equal(decayed.rebuildable, true);
});

/* ------------------------------------------------------------------ *
 * The Tier 0 ceiling — the core safety property
 * ------------------------------------------------------------------ */

test('Tier 0 cannot certify a site as strong: score is capped and marked provisional', () => {
  const g = gradeSite(analyzeTier0(res(STRONG_BODY, MODERN_HEAD), 'https://example.com/'));

  assert.equal(g.provisional, true);
  assert.equal(g.capped, true);
  assert.equal(g.band, 'unconfirmed', `a Tier 0 grade of ${g.score} must not claim a "do not rebuild" band`);
  assert.notEqual(g.band, 'elite');
  assert.notEqual(g.band, 'strong');
  assert.equal(g.rebuildable, null, 'an unrendered grade must not answer the rebuild question either way');
  assert.match(g.headline, /never rendered|unconfirmed/i);
});

test('rendered evidence lifts the cap', () => {
  const base = analyzeTier0(res(STRONG_BODY, MODERN_HEAD), 'https://example.com/');
  const rendered = mergeAudits(base, {
    tier: 1,
    fonts: [{ family: 'Söhne', maxSizePx: 64 }, { family: 'Inter', maxSizePx: 18 }],
    palette: [{ hex: '#0B3D2E' }, { hex: '#F5F0E6' }, { hex: '#C8A24A' }, { hex: '#111111' }, { hex: '#FFFFFF' }],
    horizontalOverflow: { phone: false, tablet: false, desktop: false },
    usesMediaQueries: true,
    usesModernLayout: true,
    loadMs: 900,
    tapTargetsOk: true,
  });
  const g = gradeSite(rendered);
  assert.equal(g.capped, false);
  assert.equal(g.provisional, false);
  assert.ok(['strong', 'elite'].includes(g.band), `rendered grade should be able to claim strong/elite, got ${g.band} at ${g.score}`);
  assert.equal(g.rebuildable, false, 'a rendered strong site is a definite do-not-rebuild');
  assert.ok(g.score >= TIER0_SCORE_CEILING, `rendered score ${g.score} should reach ${TIER0_SCORE_CEILING}+`);
});

test('a capped grade routes to verify — never to rebuild or skip', () => {
  const grade = gradeSite(analyzeTier0(res(STRONG_BODY, MODERN_HEAD), 'https://example.com/'));
  const route = routeOpportunity({ business_name: 'Acme', website: 'https://example.com/', vertical: 'plumbing', phone: '215' }, { grade });

  assert.equal(route.verdict, 'verify');
  assert.equal(shouldEscalate(route, { tier: 0 }).escalate, true);
});

/* ------------------------------------------------------------------ *
 * Client-side rendering must not be mistaken for a thin site
 * ------------------------------------------------------------------ */

test('client-rendered pages keep positive findings but suppress absence penalties', () => {
  const spa = analyzeTier0(
    res('<div id="root"></div>' + `<script>${'x'.repeat(80000)}</script>`, MODERN_HEAD),
    'https://spa.example/'
  );
  assert.equal(spa.renderPending, true);

  const g = gradeSite(spa);
  const negatives = g.findings.filter((f) => f.delta < 0).map((f) => f.reason);
  assert.ok(
    !negatives.some((r) => /only \d+ words|thin homepage copy/.test(r)),
    `client-rendered page should not be penalised for source word count: ${negatives.join(' | ')}`
  );
  assert.ok(
    !negatives.some((r) => /no phone number/.test(r)),
    'absence of a phone in source is not evidence on a client-rendered page'
  );
});

/* ------------------------------------------------------------------ *
 * Tier 0 detection accuracy
 * ------------------------------------------------------------------ */

test('schema.org @context is not mixed content', () => {
  const a = analyzeTier0(
    res('<p>hi</p>', '<script type="application/ld+json">{"@context":"http://schema.org"}</script>'),
    'https://example.com/'
  );
  assert.equal(a.mixedContent, false);
});

test('a real insecure asset is mixed content', () => {
  const a = analyzeTier0(res('<img src="http://cdn.example/x.jpg">'), 'https://example.com/');
  assert.equal(a.mixedContent, true);
});

test('parked and under-construction pages are detected', () => {
  assert.equal(analyzeTier0(res('<h1>This domain is for sale</h1>'), 'https://x.example/').parked, true);
  assert.equal(analyzeTier0(res('<h1>Site under construction</h1>'), 'https://x.example/').underConstruction, true);
});

test('platform detection separates legacy builders from modern ones', () => {
  assert.equal(detectPlatform('<link href="/wp-content/themes/x.css">'), 'wordpress');
  assert.equal(detectPlatform('<div id="SITE_CONTAINER" class="wixstatic"></div>'), 'wix');
  assert.equal(detectPlatform('<p>plain html</p>'), '');
});

test('visibleText strips script and style content', () => {
  const t = visibleText('<style>.a{color:red}</style><script>var x=1</script><p>Real copy here</p>');
  assert.equal(t, 'Real copy here');
});

/* ------------------------------------------------------------------ *
 * Opportunity routing
 * ------------------------------------------------------------------ */

test('a strong site routes to ads/SEO, never to rebuild', () => {
  const grade = { score: 88, band: 'elite', confidence: 1, capped: false, provisional: false, tier: 1 };
  const route = routeOpportunity(
    { business_name: 'Good Co', website: 'https://good.example/', vertical: 'dentist', phone: '215', review_count: 30 },
    { grade }
  );
  assert.equal(route.verdict, 'ads_seo');
  assert.ok(/ads|seo|gbp/i.test(route.offer));
  assert.ok(route.opportunity_score <= 59, 'a great site must not top a rebuild-shaped queue');
});

test('missing ability-to-pay data is not scored as inability to pay', () => {
  const grade = { score: 30, band: 'decayed', confidence: 0.9, capped: false, provisional: false, tier: 1 };
  const bare = routeOpportunity(
    { business_name: 'Bare', website: 'https://bare.example/', vertical: 'hvac', phone: '215' },
    { grade }
  );
  assert.equal(bare.verdict, 'rebuild', `expected rebuild, got ${bare.verdict} at opportunity ${bare.opportunity_score}`);
  assert.ok(bare.components.missing_signals.includes('ability_to_pay'));
  assert.ok(bare.opportunity_confidence < 1);
});

test('location_count of 1 is not treated as ability-to-pay evidence', () => {
  const grade = { score: 30, band: 'decayed', confidence: 0.9, capped: false, provisional: false, tier: 1 };
  const r = routeOpportunity(
    { business_name: 'Solo', website: 'https://solo.example/', vertical: 'hvac', phone: '215', location_count: 1 },
    { grade }
  );
  assert.ok(r.components.missing_signals.includes('ability_to_pay'));
  assert.equal(r.verdict, 'rebuild');
});

test('suppression beats every other signal', () => {
  const r = routeOpportunity(
    { prospect_id: 'x', business_name: 'Client', website: 'https://client.example/', vertical: 'hvac' },
    { grade: { score: 10, band: 'broken', confidence: 1 }, suppressDomains: new Set(['client.example']) }
  );
  assert.equal(r.verdict, 'suppress');
  assert.equal(r.opportunity_score, 0);
});

test('previously mailed prospects are suppressed', () => {
  const r = routeOpportunity(
    { business_name: 'Mailed', website: 'https://m.example/', vertical: 'hvac', previously_mailed: true },
    { grade: { score: 10, band: 'broken', confidence: 1 } }
  );
  assert.equal(r.verdict, 'suppress');
});

test('no website at all is the strongest rebuild case', () => {
  const r = routeOpportunity({ business_name: 'No Site', website: '', vertical: 'roofing' });
  assert.equal(r.verdict, 'rebuild');
  assert.equal(r.site_quality_score, 0);
});

test('escalation stops on decisive scores and continues on boundary cases', () => {
  const low = routeOpportunity(
    { business_name: 'x', website: 'https://a.example/', vertical: 'hvac', phone: '1' },
    { grade: { score: 22, band: 'broken', confidence: 0.9, capped: false } }
  );
  assert.equal(shouldEscalate(low, { tier: 0 }).escalate, false);

  const boundary = routeOpportunity(
    { business_name: 'y', website: 'https://b.example/', vertical: 'hvac', phone: '1' },
    { grade: { score: 58, band: 'dated', confidence: 0.9, capped: false } }
  );
  assert.equal(shouldEscalate(boundary, { tier: 0 }).escalate, true);
});

test('verticalTier ranks Momentum-fit verticals above the rest', () => {
  assert.equal(verticalTier('hvac').tier, 'strong');
  assert.equal(verticalTier('restaurant').tier, 'medium');
  assert.equal(verticalTier('heavy-steel-fabrication').tier, 'strong', 'should match on the head token');
  assert.equal(verticalTier('').tier, 'unknown');
});

/* ------------------------------------------------------------------ *
 * The legacy qualify scorer must not contradict the grader
 * ------------------------------------------------------------------ */

test('legacy scorer penalises an already-great site', () => {
  const p = { prospect_id: 'a', business_name: 'Great Co', website: 'https://great.example', vertical: 'hvac', review_count: 120, ad_presence: true };
  const without = scoreProspect(p);
  const withGreat = scoreProspect(p, { siteQuality: { score: 92, capped: false } });
  assert.ok(withGreat.score < without.score, 'a great site must lower the build score');
  assert.equal(withGreat.components.site_quality, -35);
});

test('legacy scorer half-counts a provisional Tier 0 grade', () => {
  const p = { prospect_id: 'a', business_name: 'Maybe', website: 'https://maybe.example', vertical: 'hvac' };
  const full = scoreProspect(p, { siteQuality: { score: 92, capped: false } });
  const prov = scoreProspect(p, { siteQuality: { score: 92, capped: true } });
  assert.ok(prov.score > full.score, 'an uncertified grade should penalise less');
});

test('legacy scorer is unchanged when no site quality is supplied', () => {
  const p = { prospect_id: 'a', business_name: 'X', website: 'https://x.example', vertical: 'hvac', review_count: 50 };
  assert.equal(scoreProspect(p).components.site_quality, undefined);
});

/* ------------------------------------------------------------------ *
 * Discovery
 * ------------------------------------------------------------------ */

test('discovery drops chains, social-only listings and duplicate domains', () => {
  const elements = [
    { type: 'node', id: 1, tags: { name: 'CVS Pharmacy', amenity: 'pharmacy', website: 'https://cvs.com' } },
    { type: 'node', id: 2, tags: { name: 'Chain By Brand', craft: 'plumber', website: 'https://c.example', brand: 'Whatever' } },
    { type: 'node', id: 3, tags: { name: 'Joe Plumbing', craft: 'plumber', website: 'https://facebook.com/joe' } },
    { type: 'node', id: 4, tags: { name: 'Real Plumbing', craft: 'plumber', website: 'https://realplumbing.example' } },
    { type: 'node', id: 5, tags: { name: 'Real Plumbing South', craft: 'plumber', website: 'https://realplumbing.example/south' } },
    { type: 'node', id: 6, tags: { name: 'No Website Co', craft: 'plumber' } },
  ];
  const { candidates, stats } = toCandidates(elements, { market: 'PHL' });

  assert.equal(candidates.length, 1);
  assert.equal(candidates[0].business_name, 'Real Plumbing');
  assert.equal(candidates[0].location_count, 2, 'second location folds into the first');
  assert.equal(stats.chain, 2);
  assert.equal(stats.non_site_domain, 1);
  assert.equal(stats.no_website, 1);
});

test('discovery honours the already-built exclusion list', () => {
  const elements = [{ type: 'node', id: 1, tags: { name: 'Done Already', craft: 'plumber', website: 'https://done.example' } }];
  const { candidates, stats } = toCandidates(elements, { excludeDomains: new Set(['done.example']) });
  assert.equal(candidates.length, 0);
  assert.equal(stats.excluded_already_done, 1);
});

test('classify does not confuse a tag value nested in another', () => {
  assert.equal(classify({ shop: 'car_repair' }).group, 'auto');
  assert.equal(classify({ craft: 'plumber' }).group, 'home-services');
  assert.equal(classify({ amenity: 'dentist' }).group, 'medical');
  assert.equal(classify({ shop: 'nothing_we_track' }).group, 'other');
});

test('county queries nest inside the state to stay unambiguous', () => {
  const q = buildQuery({ name: 'Montgomery County', adminLevel: 6, state: 'Pennsylvania' }, ['medical']);
  assert.match(q, /area\["name"="Pennsylvania"\]/);
  assert.match(q, /map_to_area/);
  assert.doesNotMatch(q, /is_in:state/, 'is_in:state does not exist in OSM and silently returned zero rows');
});

test('chain and non-site helpers behave', () => {
  assert.equal(isChain({ name: "Joe's Plumbing" }), false);
  assert.equal(isChain({ name: 'Planet Fitness' }), true);
  assert.equal(isNonSiteDomain('instagram.com'), true);
  assert.equal(isNonSiteDomain('joesplumbing.com'), false);
  assert.equal(normalizeDomain('https://WWW.Example.com/path'), 'example.com');
});

/* ------------------------------------------------------------------ *
 * Merge semantics
 * ------------------------------------------------------------------ */

test('mergeAudits never lets a later tier erase an earlier measurement', () => {
  const merged = mergeAudits({ tier: 0, reachable: true, hasViewport: true }, { tier: 1, hasViewport: undefined, loadMs: 800 });
  assert.equal(merged.hasViewport, true);
  assert.equal(merged.loadMs, 800);
  assert.equal(merged.tier, 1);
});

test('a failed render cannot mark a reachable site unreachable', () => {
  // auditTier1 returns tier:0 + tier1Failed instead of reachable:false precisely
  // so this merge cannot destroy a good Tier 0 result.
  const merged = mergeAudits(
    { tier: 0, reachable: true, hasViewport: true, httpStatus: 200 },
    { tier: 0, tier1Failed: true, tier1Error: 'ERR_CONNECTION_RESET' }
  );
  assert.equal(merged.reachable, true);
  assert.equal(merged.tier1Failed, true);
  assert.ok(gradeSite(merged).score > 30, 'a render failure must not crater the score');
});

/* ------------------------------------------------------------------ *
 * Fixes from the 2026-08-06 PR review
 * ------------------------------------------------------------------ */

test('routing failures on our side are never called a dead domain', () => {
  const { classifyFetchError } = require('../lib/net');
  // EHOSTUNREACH and ENETUNREACH read like the host is gone, but they are our
  // network failing to route. Calling them dead would mail "your site is down"
  // to a business whose site is fine.
  for (const e of ['EHOSTUNREACH', 'ENETUNREACH', 'ENETDOWN', 'EADDRNOTAVAIL']) {
    assert.equal(classifyFetchError(e), 'inconclusive', `${e} must not be authoritative`);
  }
  // Only an answer from the other side is authoritative.
  assert.equal(classifyFetchError('ENOTFOUND'), 'dead');
  assert.equal(classifyFetchError('ECONNREFUSED'), 'dead');
  // Unrecognised errors default to inconclusive, not dead.
  assert.equal(classifyFetchError('SOMETHING_NOVEL'), 'inconclusive');
});

test('hard faults list only what Tier 0 can actually prove', () => {
  const noViewport = gradeSite(analyzeTier0(res('<p>Call us for service today.</p>', '<title>t</title>'), 'https://x.example/'));
  assert.ok(noViewport.hard_faults.includes('no responsive viewport'));

  const dead = gradeSite({ tier: 0, url: 'https://d.example/', reachable: false, error: 'ENOTFOUND' });
  assert.ok(dead.hard_faults.length > 0, 'a dead domain is the hardest fault there is');

  // A site with every provable box ticked has no hard faults, even though soft
  // pressure may still push its score down.
  const clean = gradeSite(analyzeTier0(res(STRONG_BODY, MODERN_HEAD), 'https://example.com/'));
  assert.deepEqual(clean.hard_faults, [], `expected no hard faults, got ${clean.hard_faults.join('; ')}`);
});

test('sanitizeForGit strips address and contact detail but keeps ranking signal', () => {
  const { sanitizeForGit, GIT_UNSAFE_FIELDS } = require('../lib/discovery');
  const row = {
    domain: 'acme.example',
    business_name: 'Acme',
    city: 'Philadelphia',
    postcode: '19147',
    street: '123 Main Street',
    phone: '215-555-1234',
    lat: 39.94,
    lon: -75.15,
    osm_id: 12345,
    osm_type: 'node',
    vertical: 'plumber',
  };
  const safe = sanitizeForGit(row);

  for (const f of GIT_UNSAFE_FIELDS) {
    assert.equal(safe[f], undefined, `${f} must not survive into a tracked file`);
  }
  // Presence is preserved so reachability scoring still works.
  assert.equal(safe.has_phone, true);
  assert.equal(safe.city, 'Philadelphia');
  assert.equal(safe.postcode, '19147');
  assert.equal(safe.domain, 'acme.example');
  // The input is untouched: the in-memory pipeline still has what it needs.
  assert.equal(row.phone, '215-555-1234');
  // A row with no phone records the absence rather than leaving it undefined.
  assert.equal(sanitizeForGit({ domain: 'b.example' }).has_phone, false);
  // Arrays are handled too.
  assert.equal(sanitizeForGit([row, row]).length, 2);
});

test('reachability reads has_phone as well as a literal phone', () => {
  const grade = { score: 30, band: 'decayed', confidence: 0.9, capped: false, provisional: false, tier: 1 };
  const withBool = routeOpportunity(
    { business_name: 'A', website: 'https://a.example/', vertical: 'hvac', has_phone: true },
    { grade }
  );
  assert.ok(withBool.components.reachability > 0, 'a sanitized row must still score reachability');
  assert.ok(!withBool.components.missing_signals.includes('reachability'));
});
