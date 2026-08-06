'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const http = require('http');
const path = require('path');

const { repoPath } = require('../lib/fsutil');
const { scan } = require('../lib/grader/htmlscan');
const { scoreSignal } = require('../lib/grader/signal');
const { scoreViability } = require('../lib/grader/viability');
const { route } = require('../lib/grader/route');
const { resolveTarget, ungradeableReason, clientRenderedBy, stubReason, nameMatch } = require('../lib/grader/resolve');
const { gradeFixture, runOfflineCalibration } = require('../lib/grader/calibrate');
const { gradeTarget, PASS } = require('../lib/grader');
const { renderGrade, playwrightAvailable } = require('../lib/grader/render');
const WEIGHTS = require('../lib/grader/weights.json');

const FIX = repoPath('_os/automation/fixtures/grader');
const readFix = (f) => fs.readFileSync(path.join(FIX, f), 'utf8');

function pageOf(html, over = {}) {
  return {
    ok: true,
    status: 200,
    requestedUrl: 'https://fixture.example/',
    finalUrl: 'https://fixture.example/',
    protocol: 'https',
    headers: { 'content-type': 'text/html' },
    html,
    redirects: [],
    ttfbMs: 300,
    fetchMs: 300,
    robots: { reachable: true },
    sitemap: { reachable: true },
    ...over,
  };
}

// ---------------------------------------------------------------- weights

test('weights sum to exactly 100 across the six dimensions', () => {
  let total = 0;
  for (const dim of Object.values(WEIGHTS.dimensions)) {
    const sum = Object.values(dim.checks).reduce((a, c) => a + c.points, 0);
    assert.equal(sum, dim.max, `${dim.label} checks sum to ${sum}, declared max ${dim.max}`);
    total += dim.max;
  }
  assert.equal(total, 100);
});

test('every check declares a tier and the craft split matches the gate config', () => {
  let stakes = 0;
  let craft = 0;
  for (const dim of Object.values(WEIGHTS.dimensions)) {
    for (const [id, c] of Object.entries(dim.checks)) {
      assert.ok(c.tier === 'craft' || c.tier === 'stakes', `${id} has no tier`);
      if (c.tier === 'craft') craft += c.points;
      else stakes += c.points;
    }
  }
  assert.equal(craft, WEIGHTS.craftGate.craftPoints);
  assert.equal(stakes, WEIGHTS.craftGate.stakesPoints);
});

test('bands tile 0 to 100 with no gap or overlap', () => {
  const sorted = [...WEIGHTS.bands].sort((a, b) => a.min - b.min);
  assert.equal(sorted[0].min, 0);
  assert.equal(sorted[sorted.length - 1].max, 100);
  for (let i = 1; i < sorted.length; i++) {
    assert.equal(sorted[i].min, sorted[i - 1].max + 1, `gap between ${sorted[i - 1].id} and ${sorted[i].id}`);
  }
});

// ---------------------------------------------------------------- scoring

test('a modern well-built site lands in the excellent band', () => {
  const s = gradeFixture('excellent.html');
  assert.equal(s.band, 'excellent');
  assert.ok(s.score >= 85, `expected >= 85, got ${s.score}`);
  assert.equal(s.confidence, 1);
});

test('a 2019 bootstrap site lands in dated, not excellent and not broken', () => {
  const s = gradeFixture('middling.html');
  assert.equal(s.band, 'dated');
  assert.ok(s.score >= 45 && s.score <= 64, `expected 45-64, got ${s.score}`);
});

test('obsolescence ceiling stops a fast primitive site scoring above broken', () => {
  const s = gradeFixture('dated.html');
  assert.equal(s.band, 'broken');
  assert.ok(s.cappedBy, 'expected a cap to be applied');
  assert.ok(s.cappedBy.tells.length >= 3, 'expected 3+ disqualifying tells');
  // The point of the cap: raw scoring alone would have let it through.
  assert.ok(s.rawScore > s.score, `raw ${s.rawScore} should exceed capped ${s.score}`);
});

test('craft gate keeps a stakes-only site out of the top band', () => {
  // Every table-stakes check passes; almost every craft check fails.
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Kensington Roofing and Siding Contractors in Philadelphia</title>
    <meta name="description" content="Roofing and siding contractor serving Kensington and the river wards since 1998.">
    <meta property="og:title" content="Kensington Roofing"><meta name="twitter:card" content="summary">
    </head><body><header><nav><a href="/a">A</a><a href="/b">B</a><a href="/c">C</a></nav></header>
    <main><h1>Kensington Roofing</h1><h2>Services</h2><p>Roofing and siding.</p></main>
    <footer><a href="https://facebook.com/x">Facebook</a></footer></body></html>`;
  const s = scoreSignal(pageOf(html));
  assert.ok(s.craftRatio < 0.55, `craft ratio should be low, got ${s.craftRatio}`);
  assert.ok(s.score <= 79, `stakes-only site scored ${s.score}, should be capped out of excellent`);
});

test('unknown checks lower confidence instead of scoring zero', () => {
  const html = readFix('excellent.html');
  const withCrawl = scoreSignal(pageOf(html));
  const withoutCrawl = scoreSignal(pageOf(html, { robots: null, sitemap: null }));
  assert.ok(withoutCrawl.confidence < withCrawl.confidence, 'unknown crawl files should cut confidence');
  // Score must stay comparable, not collapse, because unknowns are excluded.
  assert.ok(Math.abs(withoutCrawl.score - withCrawl.score) <= 3, `score swung from ${withCrawl.score} to ${withoutCrawl.score}`);
});

test('top gaps are ordered by points lost so outreach leads with the worst thing', () => {
  const s = gradeFixture('middling.html');
  const lost = s.topGaps.map((g) => g.lost);
  assert.deepEqual(lost, [...lost].sort((a, b) => b - a));
  assert.ok(s.topGaps[0].evidence, 'a gap must carry evidence, not just a label');
});

// ---------------------------------------------------------------- resolve

test('an HTTP 202 WAF stall is refused, not graded as an empty site', () => {
  const reason = ungradeableReason({ status: 202, headers: {}, html: '<html><body>x</body></html>' });
  assert.match(reason, /202/);
});

test('a challenge header is refused even when the status looks fine', () => {
  const reason = ungradeableReason({
    status: 200,
    headers: { 'sg-captcha': 'challenge' },
    html: '<html><body>' + 'word '.repeat(500) + '</body></html>',
  });
  assert.match(reason, /sg-captcha/);
});

test('a real but thin site is NOT mistaken for a client-rendered shell', () => {
  // This is the expensive false positive: thin sites are our best prospects.
  const html = readFix('middling.html');
  const s = scan(html, 'https://x.example/');
  assert.equal(clientRenderedBy(html, s.words, s.scripts.external, s.images.count), null);
});

test('a framework shell with no server-rendered content is detected', () => {
  const html = readFix('spa-shell.html');
  const s = scan(html, 'https://x.example/');
  const hits = clientRenderedBy(html, s.words, s.scripts.external, s.images.count);
  assert.ok(hits && hits.length, 'expected client-rendered detection');
});

test('server-rendered content on a framework host is still graded', () => {
  // 300+ words and 40 images means the static HTML is the page, framework or not.
  const html = '<html><head><script>Static.SQUARESPACE_CONTEXT={}</script></head><body>' +
    '<img src="a.jpg">'.repeat(40) + 'word '.repeat(400) + '</body></html>';
  const s = scan(html, 'https://x.example/');
  assert.equal(clientRenderedBy(html, s.words, s.scripts.external, s.images.count), null);
});

test('a parked page is classified as a stub, not as a bot wall', () => {
  const reason = stubReason({ html: readFix('stub.html') });
  assert.ok(reason, 'expected a stub reason');
  assert.match(reason, /placeholder/i);
});

test('name matching confirms ownership and rejects a stranger domain', () => {
  const mine = nameMatch('Gallagher Fabrication & Machine', { finalUrl: 'https://gallagherfab.com/', html: '<h1>Gallagher Fabrication and Machine</h1>' });
  assert.equal(mine.matched, true);
  const theirs = nameMatch('Gallagher Fabrication & Machine', { finalUrl: 'https://someoneelse.com/', html: '<h1>Acme Widgets of Ohio</h1>' });
  assert.equal(theirs.matched, false);
});

test('a prospect with no urls resolves by what evidence exists', async () => {
  const none = await resolveTarget({ business_name: 'Gracies Painting' });
  assert.equal(none.state, 'no-site');

  const dir = await resolveTarget({ business_name: 'Gracies Painting', evidence_urls: ['https://www.dc21.org/contractors/'] });
  assert.equal(dir.state, 'directory-only');

  const social = await resolveTarget({ business_name: 'Philadelphia Record Exchange', evidence_urls: ['https://www.instagram.com/philarecx/'] });
  assert.equal(social.state, 'social-only');
});

// ---------------------------------------------------------------- viability

test('missing review data is unknown, not zero reviews', () => {
  const v = scoreViability({ prospect_id: 'x', vertical: 'plumbing', has_phone: true, review_count: null });
  assert.equal(v.enriched, false, 'a row with no review data must not count as enriched');
  assert.ok(v.reasons.some((r) => /floor/i.test(r)), 'expected the unknown floor to be explained');

  const known = scoreViability({ prospect_id: 'y', vertical: 'plumbing', has_phone: true, review_count: 0 });
  assert.equal(known.enriched, true, 'an explicit zero IS data');
});

test('suppression short-circuits everything else', () => {
  const v = scoreViability({ prospect_id: 'z', website: 'https://barcrawlusa.com', vertical: 'restaurant' }, { suppressDomains: new Set(['barcrawlusa.com']) });
  assert.equal(v.suppressed, true);
  assert.equal(v.score, 0);
});

// ---------------------------------------------------------------- routing

const viab = (score, enriched = true) => ({ score, enriched, suppressed: false, reasons: [], components: {} });
const sig = (score, over = {}) => ({ score, band: null, confidence: 1, lowConfidence: false, topGaps: [], ...over });

test('an excellent site is never pitched a website, however rich the prospect', () => {
  const d = route({ state: 'live', signal: sig(88), viability: viab(100) });
  assert.equal(d.lane, 'hands_off');
  assert.equal(d.pitch_website, false);
  assert.equal(d.outreach_eligible, false);
  assert.equal(d.priority, 0);
});

test('a solid site routes to a non-web offer instead of a rebuild', () => {
  const d = route({ state: 'live', signal: sig(72, { topGaps: [{ id: 'structuredData' }, { id: 'socialProof' }] }), viability: viab(70) });
  assert.equal(d.lane, 'adjacent');
  assert.equal(d.pitch_website, false);
  assert.match(d.offer, /local SEO|social content/i);
});

test('no website plus a viable business is the top of the funnel', () => {
  const d = route({ state: 'directory-only', signal: null, viability: viab(70) });
  assert.equal(d.lane, 'build');
  assert.equal(d.outreach_eligible, true);
  assert.equal(d.opportunity, 100);
});

test('unknown ability to pay routes to enrich, never to park', () => {
  const d = route({ state: 'no-site', signal: null, viability: viab(35, false) });
  assert.equal(d.lane, 'enrich');
  assert.equal(d.needs_enrichment, true);
  assert.ok(d.priority > 0, 'enrich still carries priority, discounted');
});

test('known-low ability to pay parks the prospect', () => {
  const d = route({ state: 'no-site', signal: null, viability: viab(20, true) });
  assert.equal(d.lane, 'park');
  assert.equal(d.priority, 0);
});

test('a client-rendered site is never routed on its unrendered score', () => {
  const unrendered = route({ state: 'js-shell', signal: sig(31), viability: viab(80), rendered: false });
  assert.equal(unrendered.lane, 'manual', 'an unrendered shell must go to a human');

  const rendered = route({ state: 'js-shell', signal: sig(88), viability: viab(80), rendered: true });
  assert.equal(rendered.lane, 'hands_off', 'once rendered, the score is trustworthy');
});

test('a bot wall goes to manual review, never to outreach', () => {
  const d = route({ state: 'blocked', signal: null, viability: viab(90) });
  assert.equal(d.lane, 'manual');
  assert.equal(d.outreach_eligible, false);
});

test('low confidence refuses to route on the number', () => {
  const d = route({ state: 'live', signal: sig(20, { lowConfidence: true, confidence: 0.4 }), viability: viab(80) });
  assert.equal(d.lane, 'manual');
});

test('priority multiplies opportunity by ability to pay', () => {
  const richWeak = route({ state: 'live', signal: sig(20), viability: viab(90) });
  const poorWeak = route({ state: 'live', signal: sig(20), viability: viab(50) });
  assert.ok(richWeak.priority > poorWeak.priority, `${richWeak.priority} should beat ${poorWeak.priority}`);

  const richDated = route({ state: 'live', signal: sig(60), viability: viab(90) });
  assert.ok(richWeak.priority > richDated.priority, 'a worse site is the better target at equal money');
});

// ---------------------------------------------------------------- iteration

test('the static pass earns a render escalation only when it cannot decide', () => {
  const { renderReasons } = require('../lib/grader');
  assert.deepEqual(renderReasons('live', sig(95, { inAmbiguousBand: false })), [], 'a confident score needs no render');
  assert.ok(renderReasons('live', sig(55, { inAmbiguousBand: true })).length, 'the decision band earns a render');
  assert.ok(renderReasons('blocked', null).length, 'a bot wall earns a render');
  assert.ok(renderReasons('js-shell', null).length, 'a shell earns a render');
});

test('a grade carries an expiry so stale knowledge announces itself', async () => {
  const r = await gradeTarget(
    { prospect_id: 'x', business_name: 'Gracies Painting', slug: 'gracies', vertical: 'painting', has_phone: true },
    { maxPass: PASS.RESOLVE, crawlFiles: false }
  );
  assert.match(r.expires, /^\d{4}-\d{2}-\d{2}$/);
  assert.ok(r.expires > r.graded_at, 'expiry must be in the future');
  assert.equal(r.weights_version, WEIGHTS.version);
});

test('a human override is replayed and capped', async () => {
  const base = { prospect_id: 'ov', business_name: 'Gracies Painting', slug: 'gracies', vertical: 'painting', has_phone: true, review_count: 90, rating: 4.8 };
  const forced = await gradeTarget(base, {
    maxPass: PASS.RESOLVE,
    crawlFiles: false,
    override: { lane: 'hands_off', reason: 'Mac looked at it, site is fine' },
  });
  assert.equal(forced.lane, 'hands_off');
  assert.match(forced.why, /Mac looked at it/);
});

test('offline calibration passes at the gate the registry declares', () => {
  const result = runOfflineCalibration();
  assert.ok(result.total >= 3, 'expected at least three offline anchors');
  assert.equal(result.ok, true, `calibration failures: ${JSON.stringify(result.failures, null, 2)}`);
  assert.equal(result.exactRate, 1);
});

// ---------------------------------------------------------------- render pass

test('the render pass really drives a browser', async (t) => {
  if (!playwrightAvailable()) return t.skip('playwright not installed');

  // Serve a fixture on loopback so the pass is exercised without leaving the box.
  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'content-type': 'text/html' });
    res.end(readFix('excellent.html'));
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${server.address().port}/`;

  try {
    const r = await renderGrade(url, { slug: 'render-selftest', shots: false, timeoutMs: 20000 });
    if (!r.available) return t.skip(`render unavailable: ${r.reason}`);
    assert.equal(r.navError, undefined === r.navError ? undefined : null, `navigation failed: ${r.navError}`);
    assert.ok(r.words > 200, `expected rendered text, got ${r.words} words`);
    assert.equal(r.h1Count, 1);
    assert.ok(r.mobile && r.mobile.overflowPx <= 4, `unexpected mobile overflow: ${r.mobile && r.mobile.overflowPx}`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
