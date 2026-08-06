'use strict';

/**
 * The iterative grader.
 *
 * Passes escalate only when the cheaper pass could not decide. That is what
 * makes it affordable to point at a list of a thousand rows instead of the
 * twenty-five we already picked by hand.
 *
 *   Pass 0  resolve   1 request     what is this URL, is it even theirs
 *   Pass 1  static    1-3 requests  the 100-point SIGNAL grade
 *   Pass 2  render    headless run  only for blocked / JS-shell / ambiguous
 *   Pass 3  eyes      agent vision  only near a lane boundary (advisory only)
 *
 * A run is a pure function of (target, weights version, pass ceiling), so the
 * cache is safe and a re-grade of an unchanged list costs nothing.
 */

const crypto = require('crypto');
const WEIGHTS = require('./weights.json');
const { resolveTarget } = require('./resolve');
const { scoreSignal } = require('./signal');
const { scoreViability } = require('./viability');
const { route } = require('./route');
const { probe } = require('./http');
const { renderGrade, playwrightAvailable } = require('./render');
const { todayISO, nowISO, slugify } = require('../fsutil');

const PASS = { RESOLVE: 0, STATIC: 1, RENDER: 2, EYES: 3 };

/** Grades expire so stale knowledge announces itself, per the vault rules. */
function expiryFor(lane) {
  const days = lane === 'hands_off' || lane === 'adjacent' ? 180 : 90;
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function fingerprint(target, maxPass) {
  return crypto
    .createHash('sha256')
    .update(JSON.stringify({ w: WEIGHTS.version, maxPass, url: target.website || null, cand: target.candidate_urls || [], ev: target.evidence_urls || [] }))
    .digest('hex')
    .slice(0, 16);
}

/**
 * Should we spend a render pass on this?
 * Reasons are returned so a run log can prove the escalation was earned.
 */
function renderReasons(state, signal) {
  const reasons = [];
  if (state === 'blocked') reasons.push('bot wall blocked the static pass');
  if (state === 'js-shell') reasons.push('content is client-rendered');
  if (signal) {
    if (signal.lowConfidence) reasons.push(`static confidence only ${Math.round(signal.confidence * 100)}%`);
    if (signal.inAmbiguousBand) reasons.push(`SIGNAL ${signal.score} sits in the ${WEIGHTS.ambiguousBand.low}-${WEIGHTS.ambiguousBand.high} decision band`);
  }
  return reasons;
}

function eyesReasons(signal) {
  const reasons = [];
  if (!signal || signal.score == null) return reasons;
  if (signal.nearBoundary) reasons.push(`SIGNAL ${signal.score} is within ${WEIGHTS.boundaryMargin} points of a lane boundary`);
  return reasons;
}

/**
 * Grade one prospect.
 *
 * @param {object} target       { prospect_id, business_name, slug, website, candidate_urls, evidence_urls, vertical, review_count, ... }
 * @param {object} opts
 * @param {number} opts.maxPass highest pass allowed (default RENDER)
 * @param {Set}    opts.suppressIds / opts.suppressDomains
 * @param {object} opts.override  human override for this prospect, if any
 * @param {boolean} opts.crawlFiles  probe robots.txt + sitemap.xml (default true)
 */
async function gradeTarget(target, opts = {}) {
  const {
    maxPass = PASS.RENDER,
    suppressIds = new Set(),
    suppressDomains = new Set(),
    override = null,
    crawlFiles = true,
    shots = true,
  } = opts;

  const startedAt = nowISO();
  const passesRun = [];
  const escalations = [];

  // ---- Pass 0: resolve -----------------------------------------------------
  const resolved = await resolveTarget(target);
  passesRun.push('resolve');

  let signal = null;
  let render = null;

  // ---- Pass 1: static ------------------------------------------------------
  if (resolved.page && resolved.page.html) {
    const page = { ...resolved.page, robots: null, sitemap: null };
    if (crawlFiles) {
      try {
        const origin = new URL(page.finalUrl).origin;
        const [robots, sitemap] = await Promise.all([probe(origin, '/robots.txt'), probe(origin, '/sitemap.xml')]);
        page.robots = robots;
        page.sitemap = sitemap;
      } catch {
        /* leave as unknown so the check reports unknown, not failure */
      }
    }
    signal = scoreSignal(page, {});
    passesRun.push('static');
    resolved.gradedPage = page;
  }

  // ---- Pass 2: render (earned, not default) --------------------------------
  const wantRender = renderReasons(resolved.state, signal);
  if (maxPass >= PASS.RENDER && wantRender.length) {
    const url = resolved.url;
    if (!url) {
      escalations.push({ pass: 'render', skipped: 'no URL to render' });
    } else if (!playwrightAvailable()) {
      escalations.push({ pass: 'render', skipped: 'playwright not installed', reasons: wantRender });
    } else {
      render = await renderGrade(url, { slug: target.slug || slugify(target.business_name) || 'site', shots });
      passesRun.push('render');
      escalations.push({
        pass: 'render',
        reasons: wantRender,
        // A render that launched but could not navigate is a failed pass, not a
        // pass with a bad result. Say so, so the row routes to manual review
        // instead of inheriting a static score of an unreadable page.
        ...(render.available === false ? { skipped: render.reason } : {}),
        ...(render.navError ? { failed: render.navError.split('\n')[0] } : {}),
      });
      if (render.available && !render.navError) {
        const base = resolved.gradedPage || { ...resolved.page };
        // A rendered page supersedes the static HTML for everything it measured.
        const merged = {
          ...base,
          html: base && base.html ? base.html : '',
          ttfbMs: base ? base.ttfbMs : null,
        };
        if (render.words != null) {
          signal = scoreSignal(merged, { render });
        }
        if (render.mobile && render.mobile.overflowPx > 8) {
          signal.renderFindings = [`${render.mobile.overflowPx}px horizontal overflow at 390px wide`];
        }
      }
    }
  }

  // ---- Pass 3: eyes (advisory; an agent or human fills this in) ------------
  const wantEyes = eyesReasons(signal);
  if (maxPass >= PASS.EYES && wantEyes.length) {
    escalations.push({
      pass: 'eyes',
      reasons: wantEyes,
      requires: render && render.screenshots ? render.screenshots : 'a render pass with screenshots',
      instruction:
        'Open the screenshots and answer three questions: does it look expensive, does it look like this specific business, is the palette dull. Record the verdict as an override with a reason.',
      status: 'pending',
    });
  }

  // ---- Viability + routing -------------------------------------------------
  const rendered = Boolean(render && render.available && !render.navError);
  const viability = scoreViability(target, { suppressIds, suppressDomains });
  let decision = route({ state: resolved.state, signal, viability, rendered });

  // ---- Human override replay ----------------------------------------------
  let appliedOverride = null;
  if (override) {
    appliedOverride = { ...override, applied_at: todayISO() };
    if (override.lane) {
      decision = { ...decision, lane: override.lane, lane_label: `${override.lane} (human override)`, why: override.reason || 'human override', overridden: true };
    }
    if (override.signal_adjustment != null && signal) {
      const cap = WEIGHTS.eyesAdjustmentCap;
      const delta = Math.max(-cap, Math.min(cap, Number(override.signal_adjustment)));
      const adjusted = Math.max(0, Math.min(100, signal.score + delta));
      signal = { ...signal, score: adjusted, adjustedBy: delta, adjustmentReason: override.reason || null };
      decision = route({ state: resolved.state, signal, viability, rendered });
      decision.overridden = true;
      decision.why = `${decision.why} (human adjustment ${delta >= 0 ? '+' : ''}${delta}: ${override.reason || 'no reason given'})`;
    }
  }

  return {
    prospect_id: target.prospect_id || null,
    business_name: target.business_name || null,
    slug: target.slug || slugify(target.business_name),
    batch: target.batch || null,
    vertical: target.vertical || null,
    graded_at: todayISO(),
    graded_iso: startedAt,
    expires: expiryFor(decision.lane),
    weights_version: WEIGHTS.version,
    fingerprint: fingerprint(target, maxPass),

    url_on_file: target.website || null,
    url_graded: resolved.url,
    final_url: resolved.page ? resolved.page.finalUrl : null,
    state: resolved.state,
    state_reason: resolved.reason,
    resolve_notes: resolved.notes || [],

    signal: signal
      ? {
          score: signal.score,
          band: signal.band,
          band_label: signal.bandLabel,
          band_meaning: signal.bandMeaning,
          raw_score: signal.rawScore,
          craft_ratio: signal.craftRatio,
          capped_by: signal.cappedBy,
          confidence: signal.confidence,
          dimensions: signal.dimensions,
          top_gaps: signal.topGaps,
          strengths: signal.strengths,
          scan: signal.scanSummary,
          render_findings: signal.renderFindings || [],
          adjusted_by: signal.adjustedBy || 0,
        }
      : null,

    viability: { score: viability.score, enriched: viability.enriched, reasons: viability.reasons, components: viability.components },

    ...decision,

    passes_run: passesRun,
    escalations,
    override: appliedOverride,
    render: render ? { available: render.available, reason: render.reason || null, load_ms: render.loadMs || null, mobile: render.mobile || null, screenshots: render.screenshots || null } : null,
    checks: signal ? signal.checks : [],
  };
}

/**
 * Grade a list with a concurrency cap. Order of results matches input order.
 * `overrides` is keyed by prospect_id or slug so a human verdict recorded once
 * keeps applying on every future run without a second network pass.
 */
async function gradeList(targets, opts = {}) {
  const { concurrency = 4, onResult = null, overrides = {} } = opts;
  const { pool } = require('./http');
  return pool(targets, concurrency, async (target, i) => {
    const override = overrides[target.prospect_id] || overrides[target.slug] || null;
    const result = await gradeTarget(target, { ...opts, override });
    if (onResult) onResult(result, i, targets.length);
    return result;
  });
}

module.exports = { gradeTarget, gradeList, PASS, expiryFor, renderReasons, WEIGHTS };
