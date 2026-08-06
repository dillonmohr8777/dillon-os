'use strict';

/**
 * The calibration loop. Without this, a grader is one person's opinion frozen
 * into constants and nobody can tell when a weight change breaks it.
 *
 * An anchor is a site plus the band a human says it belongs in. Offline anchors
 * are HTML fixtures, so they are deterministic and run in CI. Live anchors are
 * real prospect URLs and only run when asked, because they change under us.
 *
 * Every human override recorded in 12_Brain/state/grader-overrides.json is
 * replayed here as an anchor, which is how Mac saying "Suraya is fine" becomes
 * a permanent regression test instead of a Slack message that scrolls away.
 */

const fs = require('fs');
const path = require('path');
const { repoPath, readJson } = require('../fsutil');
const { scoreSignal, bandFor } = require('./signal');
const { scan } = require('./htmlscan');
const WEIGHTS = require('./weights.json');

const FIXTURE_DIR = repoPath('_os/automation/fixtures/grader');
const CALIBRATION = repoPath('12_Brain/registry/grader-calibration.json');
const OVERRIDES = repoPath('12_Brain/state/grader-overrides.json');

/**
 * Grade a fixture the same way a fetched page is graded, with fixed timing so
 * the result never drifts with the speed of the machine running the test.
 */
function gradeFixture(file, { ttfbMs = 300, robots = true, sitemap = true } = {}) {
  const html = fs.readFileSync(path.isAbsolute(file) ? file : path.join(FIXTURE_DIR, file), 'utf8');
  const page = {
    ok: true,
    status: 200,
    requestedUrl: 'https://fixture.example/',
    finalUrl: 'https://fixture.example/',
    protocol: 'https',
    headers: { 'content-type': 'text/html' },
    html,
    redirects: [],
    ttfbMs,
    fetchMs: ttfbMs,
    robots: { reachable: robots },
    sitemap: { reachable: sitemap },
  };
  return scoreSignal(page, {});
}

const BAND_INDEX = WEIGHTS.bands.reduce((acc, b, i) => ({ ...acc, [b.id]: i }), {});

/** How far off a band verdict is, in bands. 0 = on target. */
function bandDistance(actualBand, expectedBand) {
  if (actualBand == null || expectedBand == null) return null;
  const a = BAND_INDEX[actualBand];
  const e = BAND_INDEX[expectedBand];
  if (a == null || e == null) return null;
  return Math.abs(a - e);
}

/**
 * Run every offline anchor and report accuracy.
 * @returns {{ok:boolean, total:number, exact:number, within1:number, rows:Array}}
 */
function runOfflineCalibration({ anchors = null } = {}) {
  const doc = anchors ? { anchors } : readJson(CALIBRATION, { anchors: [] });
  const offline = (doc.anchors || []).filter((a) => a.fixture);
  const rows = [];

  for (const anchor of offline) {
    const signal = gradeFixture(anchor.fixture);
    const dist = bandDistance(signal.band, anchor.expect_band);
    const inRange =
      anchor.expect_score_range
        ? signal.score >= anchor.expect_score_range[0] && signal.score <= anchor.expect_score_range[1]
        : null;
    rows.push({
      id: anchor.id,
      fixture: anchor.fixture,
      expect_band: anchor.expect_band,
      actual_band: signal.band,
      score: signal.score,
      raw_score: signal.rawScore,
      craft_ratio: signal.craftRatio,
      capped: Boolean(signal.cappedBy),
      expect_score_range: anchor.expect_score_range || null,
      in_range: inRange,
      band_distance: dist,
      pass: dist === 0 && inRange !== false,
      why: anchor.why || null,
    });
  }

  const exact = rows.filter((r) => r.band_distance === 0).length;
  const within1 = rows.filter((r) => r.band_distance != null && r.band_distance <= 1).length;
  const failures = rows.filter((r) => !r.pass);

  return {
    ok: failures.length === 0,
    total: rows.length,
    exact,
    within1,
    exactRate: rows.length ? Number((exact / rows.length).toFixed(3)) : null,
    rows,
    failures,
    weightsVersion: WEIGHTS.version,
  };
}

/** Live anchors: real URLs a human has already judged. Network required. */
async function runLiveCalibration({ anchors = null } = {}) {
  const { gradeTarget, PASS } = require('./index');
  const doc = anchors ? { anchors } : readJson(CALIBRATION, { anchors: [] });
  const live = (doc.anchors || []).filter((a) => a.url);
  const rows = [];

  for (const anchor of live) {
    const result = await gradeTarget(
      {
        prospect_id: `calib:${anchor.id}`,
        business_name: anchor.business_name || anchor.id,
        slug: anchor.id,
        website: anchor.url,
        vertical: anchor.vertical || '',
        review_count: anchor.review_count ?? null,
        rating: anchor.rating ?? null,
        has_phone: true,
      },
      { maxPass: anchor.allow_render ? PASS.RENDER : PASS.STATIC, crawlFiles: true, shots: false }
    );
    const actualBand = result.signal ? result.signal.band : null;
    const dist = bandDistance(actualBand, anchor.expect_band);
    // A pass that could not run is a coverage gap, not a wrong weight. Blocked
    // and unrendered client-side sites get reported and skipped, because
    // counting them as failures would push us to loosen the very guards that
    // stop us mailing a business whose site is actually fine.
    const passLimited =
      result.lane === 'manual' && /render pass|bot wall|challenge|HTTP 202|WAF|could not confirm/i.test(result.why || '');
    rows.push({
      id: anchor.id,
      url: anchor.url,
      state: result.state,
      expect_band: anchor.expect_band,
      actual_band: actualBand,
      score: result.signal ? result.signal.score : null,
      expect_lane: anchor.expect_lane || null,
      actual_lane: result.lane,
      band_distance: dist,
      unreadable: result.signal == null || passLimited,
      unreadable_reason: passLimited ? result.why : result.signal == null ? result.state_reason : null,
      pass: anchor.expect_lane ? result.lane === anchor.expect_lane : dist === 0,
      why: anchor.why || null,
    });
  }

  const readable = rows.filter((r) => !r.unreadable);
  return {
    ok: rows.every((r) => r.pass || r.unreadable),
    total: rows.length,
    readable: readable.length,
    unreadable: rows.length - readable.length,
    passed: rows.filter((r) => r.pass).length,
    rows,
    failures: rows.filter((r) => !r.pass && !r.unreadable),
    weightsVersion: WEIGHTS.version,
  };
}

/**
 * Turn recorded human overrides into anchors. This is the learning step: the
 * grader is wrong, a human says so once, and the disagreement becomes a test.
 */
function anchorsFromOverrides(file = OVERRIDES) {
  const doc = readJson(file, { overrides: {} });
  const out = [];
  for (const [key, ov] of Object.entries(doc.overrides || {})) {
    if (!ov.url || !ov.expect_band) continue;
    out.push({
      id: `override:${key}`,
      url: ov.url,
      business_name: ov.business_name || key,
      expect_band: ov.expect_band,
      expect_lane: ov.lane || null,
      why: ov.reason || 'recorded human override',
      source: 'override',
    });
  }
  return out;
}

module.exports = { gradeFixture, runOfflineCalibration, runLiveCalibration, anchorsFromOverrides, bandDistance, FIXTURE_DIR, CALIBRATION, OVERRIDES };
