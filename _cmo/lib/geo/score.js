/**
 * Aggregation and scoring for a GEO scan.
 *
 * Five rules are enforced structurally here, because each is a place the
 * incumbent category gets it wrong:
 *
 * 1. CHANNELS ARE NEVER BLENDED. An answer obtained by calling a model API
 *    with a search tool and an answer scraped from a consumer chat UI come
 *    from different systems - different system prompt, different reranker, no
 *    personalization. Averaging them produces a number that describes nothing.
 *    Every aggregate is keyed by (engine, channel).
 *
 * 2. CITATION SHARE IS NORMALIZED WITHIN ENGINE. Published measurement finds
 *    ChatGPT citing roughly 15 sources per answer and Gemini roughly 3. The
 *    same single citation is therefore ~7% share on one and ~33% on the other.
 *    Cross-engine averages of raw citation share are arithmetically meaningless.
 *
 * 3. SHARE OF VOICE CARRIES AN `other` BUCKET. SOV is only defined relative to
 *    a competitor set, and a set chosen to flatter the client produces a
 *    flattering number. Every named entity outside the declared set lands in
 *    `other`, the buckets sum to 1 by construction, and a large `other` is
 *    surfaced as a WARNING that the competitor set is wrong - not hidden.
 *
 * 4. GROUNDED AND PARAMETRIC ARE SEPARATED. A mention in an answer that
 *    retrieved the web is a retrieval-eligibility problem - indexation, server
 *    rendering, chunkability, freshness - movable in weeks. A mention with no
 *    retrieval comes from training-data presence, movable over quarters if at
 *    all. Telling a client to "improve their content" when their real problem
 *    is brand-mention volume wastes a quarter.
 *
 * 5. NO DELTA WITHOUT A TEST, AND NO DELTA WITHOUT THE CONTROL COHORT. Control
 *    prompts measure entities the client cannot influence. When they move, the
 *    engine changed. Every client delta is reported net of the control delta.
 */

import {
  wilson, weightedVisibility, twoProportionTest, bootstrapCi,
  netStance, phrasingRobustness, median, Z95,
} from './stats.js';

export const DEFAULT_COMPOSITE_WEIGHTS = Object.freeze({
  visibility: 0.35,
  prominence: 0.20,
  citationShare: 0.25,
  shareOfVoice: 0.10,
  stance: 0.10,
});

/** Above this, the declared competitor set is not describing the market. */
export const OTHER_WARN_THRESHOLD = 0.35;

/** Below this effective sample size, no precision claim is made at all. */
export const MIN_N_EFF = 30;

/**
 * Aggregate raw runs into a scan result.
 *
 * @param {object} input
 * @param {Array}  input.runs           output of extract.scoreRun, one per replicate
 * @param {object} input.manifest       the prompt set (weights + cohorts)
 * @param {string[]} input.competitors  declared competitor brand ids
 * @param {string} input.brandId        the owned brand id
 */
export function aggregateScan({
  runs = [], manifest = null, competitors = [], brandId,
  compositeWeights = DEFAULT_COMPOSITE_WEIGHTS, z = Z95,
}) {
  const promptById = new Map((manifest?.prompts || []).map((p) => [p.id, p]));
  const groups = groupBy(runs, (r) => `${r.engine}|${r.channel || 'unknown'}`);

  const engines = [];
  for (const [key, groupRuns] of groups) {
    const [engine, channel] = key.split('|');
    engines.push(aggregateEngine({
      engine, channel, runs: groupRuns, promptById, competitors, brandId, compositeWeights, z,
    }));
  }
  engines.sort((a, b) => b.composite.value - a.composite.value);

  const warnings = engines.flatMap((e) => e.warnings.map((w) => ({ engine: e.engine, channel: e.channel, ...w })));
  const channels = [...new Set(engines.map((e) => e.channel))];
  if (channels.length > 1) {
    warnings.push({
      code: 'MIXED_CHANNELS',
      severity: 'info',
      message: `this scan used ${channels.length} acquisition channels (${channels.join(', ')}); results are reported separately per channel and must not be averaged`,
    });
  }

  return {
    promptSet: manifest
      ? { setId: manifest.setId, version: manifest.version, sha256: manifest.sha256, weighting: manifest.weighting || null }
      : null,
    brandId,
    competitors: competitors.slice(),
    compositeWeights: { ...compositeWeights },
    engines,
    // Deliberately no single cross-engine "AI visibility score". Engines differ
    // in citation density by roughly 5x; one blended number would be exactly
    // the false precision this engine exists to avoid.
    crossEngine: {
      note: 'Reported per engine. No blended cross-engine score is produced: citation density differs by roughly 5x between engines, which makes an averaged score arithmetically invalid.',
      presenceByEngine: Object.fromEntries(engines.map((e) => [`${e.engine}/${e.channel}`, e.visibility.value])),
      compositeByEngine: Object.fromEntries(engines.map((e) => [`${e.engine}/${e.channel}`, e.composite.value])),
    },
    warnings,
    totals: {
      runs: runs.length,
      clientRuns: runs.filter((r) => promptById.get(r.promptId)?.cohort !== 'control').length,
      controlRuns: runs.filter((r) => promptById.get(r.promptId)?.cohort === 'control').length,
      engines: engines.length,
      channels,
    },
  };
}

function aggregateEngine({ engine, channel, runs, promptById, competitors, brandId, compositeWeights, z }) {
  const isControl = (promptId) => promptById.get(promptId)?.cohort === 'control';
  const clientRuns = runs.filter((r) => !isControl(r.promptId));
  const controlRuns = runs.filter((r) => isControl(r.promptId));
  const warnings = [];

  // --- per-prompt cells ----------------------------------------------------
  const byPrompt = groupBy(clientRuns, (r) => r.promptId);
  const cells = [];
  for (const [promptId, promptRuns] of byPrompt) {
    const prompt = promptById.get(promptId);
    const trials = promptRuns.length;
    const successes = promptRuns.filter((r) => r.present).length;
    cells.push({
      promptId,
      pattern: prompt?.pattern || null,
      funnel: prompt?.funnel || null,
      text: prompt?.text || null,
      weight: prompt?.weight ?? 1 / Math.max(1, byPrompt.size),
      successes,
      trials,
      interval: wilson(successes, trials, z),
      meanProminence: mean(promptRuns.filter((r) => r.present).map((r) => r.prominence)),
      meanMentions: mean(promptRuns.map((r) => r.mentionCount)),
    });
  }
  cells.sort((a, b) => b.weight - a.weight);

  const visibility = weightedVisibility(cells, z);

  // Bootstrap over PROMPTS, seeded on the engine so the interval is stable
  // across page loads. An interval that moves when you refresh is not an
  // interval.
  const visibilityBootstrap = bootstrapCi(
    cells,
    (draw) => {
      const total = draw.reduce((a, c) => a + c.weight, 0) || draw.length;
      return draw.reduce((a, c) => a + (c.weight / total) * (c.successes / c.trials), 0);
    },
    { iterations: 1000, seed: `vis:${engine}:${channel}` },
  );

  // --- prominence, conditional on presence ---------------------------------
  // Never blended with absence: "rarely mentioned but always first" and "often
  // mentioned but always last" are different problems with different fixes.
  const presentRuns = clientRuns.filter((r) => r.present);
  const prominence = {
    meanGivenPresence: mean(presentRuns.map((r) => r.prominence)),
    n: presentRuns.length,
    medianOrdinal: median(presentRuns.map((r) => r.ordinal)),
  };

  // --- citations -----------------------------------------------------------
  const cited = clientRuns.filter((r) => r.totalCitations > 0);
  const medianCitations = median(cited.map((r) => r.totalCitations));
  const ownedAll = sum(clientRuns.map((r) => r.ownedCitations));
  const allAll = sum(clientRuns.map((r) => r.totalCitations));
  const ownedCond = sum(cited.map((r) => r.ownedCitations));
  const allCond = sum(cited.map((r) => r.totalCitations));
  const withOwned = clientRuns.filter((r) => r.ownedCitations > 0).length;

  const citation = {
    presenceRate: clientRuns.length ? r6(withOwned / clientRuns.length) : 0,
    interval: wilson(withOwned, clientRuns.length, z),
    shareAll: allAll ? r6(ownedAll / allAll) : 0,
    shareConditional: allCond ? r6(ownedCond / allCond) : 0,
    medianCitationsPerResponse: medianCitations,
    // Multiplying conditional share by this engine's citation density puts
    // engines on a comparable footing: one citation out of 15 and one out of 3
    // both become "one citation's worth of the answer".
    shareNormalized: medianCitations > 0 && allCond ? r6(Math.min(1, (ownedCond / allCond) * medianCitations)) : 0,
    citedResponses: cited.length,
  };

  // --- share of voice, with a mandatory `other` bucket ---------------------
  const declared = new Set(competitors);
  const competitorTally = new Map();
  let otherWeighted = 0;
  let brandWeighted = 0;
  const otherNames = new Map();

  for (const r of clientRuns) {
    const w = promptById.get(r.promptId)?.weight ?? (1 / Math.max(1, byPrompt.size));
    for (const b of r.brandsPresent || []) {
      const contribution = w * b.mentions;
      if (b.brandId === brandId) { brandWeighted += contribution; continue; }
      if (declared.has(b.brandId)) {
        competitorTally.set(b.brandId, (competitorTally.get(b.brandId) || 0) + contribution);
      } else {
        otherWeighted += contribution;
        otherNames.set(b.name || b.brandId, (otherNames.get(b.name || b.brandId) || 0) + contribution);
      }
    }
  }
  const competitorSum = [...competitorTally.values()].reduce((a, b) => a + b, 0);
  const denominator = brandWeighted + competitorSum + otherWeighted;

  const shareOfVoice = {
    brand: denominator ? r6(brandWeighted / denominator) : 0,
    competitors: Object.fromEntries(
      [...competitorTally.entries()].map(([k, v]) => [k, denominator ? r6(v / denominator) : 0]),
    ),
    other: denominator ? r6(otherWeighted / denominator) : 0,
    // The names in `other` are the correction: they are the brands the market
    // actually returns that the declared set omitted.
    otherTopNames: [...otherNames.entries()]
      .sort((a, b) => b[1] - a[1]).slice(0, 8)
      .map(([name, v]) => ({ name, share: denominator ? r6(v / denominator) : 0 })),
    declaredCompetitors: competitors.slice(),
    denominatorWeightedMentions: r6(denominator),
  };
  // Buckets sum to 1 by construction, which is the property that makes the
  // warning below meaningful rather than cosmetic.
  shareOfVoice.sumCheck = r6(
    shareOfVoice.brand + Object.values(shareOfVoice.competitors).reduce((a, b) => a + b, 0) + shareOfVoice.other,
  );

  if (shareOfVoice.other > OTHER_WARN_THRESHOLD) {
    warnings.push({
      code: 'COMPETITOR_SET_INCOMPLETE',
      severity: 'warn',
      message: `${Math.round(shareOfVoice.other * 100)}% of weighted mentions fall outside the declared competitor set - share of voice is not describing this market. Add: ${shareOfVoice.otherTopNames.slice(0, 4).map((o) => o.name).join(', ') || 'the brands listed in otherTopNames'}`,
      other: shareOfVoice.other,
    });
  }
  if (!competitors.length) {
    warnings.push({
      code: 'NO_COMPETITOR_SET',
      severity: 'warn',
      message: 'no competitor set was declared, so share of voice is undefined. It is reported as brand-vs-other only.',
    });
  }

  // --- stance: being named on an avoid-list is not visibility --------------
  const stanceCounts = { recommended: 0, neutral: 0, cautioned: 0, negative: 0 };
  for (const r of presentRuns) {
    const s = r.stance || 'neutral';
    if (stanceCounts[s] === undefined) stanceCounts.neutral += 1;
    else stanceCounts[s] += 1;
  }
  const stance = {
    counts: { ...stanceCounts },
    net: netStance(stanceCounts),
    // Reported so a consumer can see whether stance was actually classified or
    // silently defaulted to neutral.
    classified: presentRuns.filter((r) => r.stance).length,
    unclassified: presentRuns.filter((r) => !r.stance).length,
  };
  if (stance.unclassified > 0 && stance.classified === 0 && presentRuns.length > 0) {
    warnings.push({
      code: 'STANCE_NOT_CLASSIFIED',
      severity: 'info',
      message: `stance was not classified on ${stance.unclassified} runs, so the stance term contributes 0 to the composite rather than a guess`,
    });
  }

  // --- grounded vs parametric ---------------------------------------------
  // The single most actionable split in the whole measurement, because the two
  // have different levers and different time horizons.
  const grounded = clientRuns.filter((r) => r.grounded === true);
  const parametric = clientRuns.filter((r) => r.grounded === false);
  const retrieval = {
    groundedRuns: grounded.length,
    parametricRuns: parametric.length,
    unknownRuns: clientRuns.length - grounded.length - parametric.length,
    groundedMentionRate: grounded.length ? r6(grounded.filter((r) => r.present).length / grounded.length) : null,
    parametricMentionRate: parametric.length ? r6(parametric.filter((r) => r.present).length / parametric.length) : null,
    groundedInterval: grounded.length ? wilson(grounded.filter((r) => r.present).length, grounded.length, z) : null,
    parametricInterval: parametric.length ? wilson(parametric.filter((r) => r.present).length, parametric.length, z) : null,
  };
  retrieval.lever = diagnoseLever(retrieval);

  // --- phrasing robustness -------------------------------------------------
  // Computed per canonical prompt across its paraphrase runs.
  const byCanonical = groupBy(clientRuns.filter((r) => r.canonicalId), (r) => r.canonicalId);
  const robustness = [];
  for (const [canonicalId, group] of byCanonical) {
    const byVariant = groupBy(group, (r) => r.variantIndex ?? 0);
    if (byVariant.size < 2) continue;
    const rates = [...byVariant.values()].map((g) => g.filter((r) => r.present).length / g.length);
    const pr = phrasingRobustness(rates);
    if (pr != null) {
      robustness.push({
        canonicalId,
        robustness: pr,
        variantRates: rates.map(r6),
        weight: promptById.get(canonicalId)?.weight ?? null,
      });
    }
  }
  robustness.sort((a, b) => a.robustness - b.robustness);

  // --- control cohort ------------------------------------------------------
  const controlPresent = controlRuns.filter((r) => r.present).length;
  const control = {
    runs: controlRuns.length,
    // The control brand should essentially never appear in control answers.
    // If it does, the alias table has a false-positive problem.
    presenceRate: controlRuns.length ? r6(controlPresent / controlRuns.length) : null,
    interval: controlRuns.length ? wilson(controlPresent, controlRuns.length, z) : null,
  };
  if (control.presenceRate != null && control.presenceRate > 0.05) {
    warnings.push({
      code: 'CONTROL_CONTAMINATION',
      severity: 'warn',
      message: `the brand appears in ${Math.round(control.presenceRate * 100)}% of control-cohort answers, which it should not. The alias table is probably matching something it should not - check negativeAliases.`,
    });
  }

  // --- composite -----------------------------------------------------------
  const parts = {
    visibility: visibility.value,
    prominence: prominence.meanGivenPresence,
    citationShare: citation.shareNormalized,
    shareOfVoice: shareOfVoice.brand,
    stance: Math.max(0, stance.net),
  };
  const value = r6(100 * Object.entries(compositeWeights)
    .reduce((acc, [k, w]) => acc + w * (parts[k] ?? 0), 0));

  const compositeBootstrap = bootstrapCi(
    cells,
    (draw) => {
      const total = draw.reduce((a, c) => a + c.weight, 0) || draw.length;
      const vis = draw.reduce((a, c) => a + (c.weight / total) * (c.successes / c.trials), 0);
      const prom = mean(draw.filter((c) => c.successes > 0).map((c) => c.meanProminence));
      return 100 * (
        compositeWeights.visibility * vis
        + compositeWeights.prominence * prom
        + compositeWeights.citationShare * parts.citationShare
        + compositeWeights.shareOfVoice * parts.shareOfVoice
        + compositeWeights.stance * parts.stance
      );
    },
    { iterations: 1000, seed: `comp:${engine}:${channel}` },
  );

  if (visibility.nEff < MIN_N_EFF) {
    warnings.push({
      code: 'LOW_EFFECTIVE_SAMPLE',
      severity: 'warn',
      message: `effective sample size is ${visibility.nEff.toFixed(1)} (below ${MIN_N_EFF}); treat these numbers as directional only and add prompts or replicates before reporting a trend`,
      nEff: visibility.nEff,
    });
  }

  const composite = {
    value,
    low: r6(compositeBootstrap.low),
    high: r6(compositeBootstrap.high),
    parts,
    // Naming the metric honestly is the point. "34% visibility" invites the
    // reader to think 34% of real users saw the brand. They did not.
    metricName: `WeightedPresenceRate(${engine}/${channel}, prompts=${cells.length}, nEff=${visibility.nEff.toFixed(0)})`,
    interpretation: `In this prompt set, the brand appeared in ${(visibility.value * 100).toFixed(1)}% of weighted prompt runs on ${engine}. This is a property of this instrument, not a share of real user queries.`,
  };

  return {
    engine, channel, cells, visibility, visibilityBootstrap,
    prominence, citation, shareOfVoice, stance, retrieval, robustness, control,
    composite, warnings,
    runs: { total: runs.length, client: clientRuns.length, control: controlRuns.length },
  };
}

/**
 * Which lever actually moves this brand's visibility on this engine.
 * This is the recommendation clients cannot get anywhere else.
 */
function diagnoseLever(retrieval) {
  const g = retrieval.groundedMentionRate;
  const p = retrieval.parametricMentionRate;
  if (g == null && p == null) return { code: 'UNKNOWN', message: 'grounding was not recorded for these runs, so no lever can be diagnosed' };
  if (g == null) return { code: 'PARAMETRIC_ONLY', message: 'only ungrounded runs were observed; visibility here depends on training-data presence (brand mentions, Wikipedia, YouTube, Reddit), which moves over quarters not weeks' };
  if (p == null) return { code: 'GROUNDED_ONLY', message: 'only grounded runs were observed; visibility here depends on retrieval eligibility (indexation, server-rendered HTML, chunkability, freshness), which can move in weeks' };
  const gap = g - p;
  if (gap > 0.15) {
    return {
      code: 'RETRIEVAL_WORKING',
      message: `retrieval is doing the work (grounded ${(g * 100).toFixed(0)}% vs parametric ${(p * 100).toFixed(0)}%). Keep investing in indexation, server-rendered content and freshness; brand-building will not be the fast lever here.`,
    };
  }
  if (gap < -0.15) {
    return {
      code: 'BRAND_MEMORY_WORKING',
      message: `the model already knows the brand (parametric ${(p * 100).toFixed(0)}% vs grounded ${(g * 100).toFixed(0)}%) but retrieval is not surfacing it. This is a technical retrieval problem - check server-rendered HTML, robots.txt for search-class AI crawlers, and whether the pages that answer these prompts exist at all.`,
    };
  }
  return {
    code: 'BALANCED',
    message: `grounded and parametric rates are within 15 points (${(g * 100).toFixed(0)}% vs ${(p * 100).toFixed(0)}%); both levers contribute roughly equally`,
  };
}

/**
 * Compare two scans of the SAME prompt-set version.
 *
 * Refuses to compare across prompt-set versions, because a changed instrument
 * makes any delta uninterpretable - that is the mechanism by which this
 * category manufactures trends that did not happen.
 */
export function compareScans(before, after, { alpha = 0.05 } = {}) {
  const problems = [];
  if (before?.promptSet?.sha256 && after?.promptSet?.sha256 && before.promptSet.sha256 !== after.promptSet.sha256) {
    problems.push({
      code: 'PROMPT_SET_CHANGED',
      severity: 'blocking',
      message: `the prompt set changed between these scans (${before.promptSet.sha256.slice(0, 12)} -> ${after.promptSet.sha256.slice(0, 12)}). A delta across different instruments is not a measurement; this is reported as a discontinuity, not a trend.`,
    });
  }

  const byKey = (scan) => new Map((scan?.engines || []).map((e) => [`${e.engine}|${e.channel}`, e]));
  const b = byKey(before);
  const a = byKey(after);
  const comparisons = [];

  for (const [key, afterEngine] of a) {
    const beforeEngine = b.get(key);
    if (!beforeEngine) continue;
    const bx = beforeEngine.cells.reduce((acc, c) => acc + c.successes, 0);
    const bn = beforeEngine.cells.reduce((acc, c) => acc + c.trials, 0);
    const ax = afterEngine.cells.reduce((acc, c) => acc + c.successes, 0);
    const an = afterEngine.cells.reduce((acc, c) => acc + c.trials, 0);
    const test = twoProportionTest(bx, bn, ax, an, alpha);

    // Net out engine drift measured by the control cohort.
    const controlBefore = beforeEngine.control?.presenceRate;
    const controlAfter = afterEngine.control?.presenceRate;
    const controlDelta = (controlBefore != null && controlAfter != null) ? r6(controlAfter - controlBefore) : null;
    const adjustedDelta = controlDelta == null ? null : r6(test.delta - controlDelta);

    comparisons.push({
      engine: afterEngine.engine,
      channel: afterEngine.channel,
      rawDelta: test.delta,
      controlDelta,
      adjustedDelta,
      significant: test.significant,
      pValue: test.pValue,
      z: test.z,
      before: { presence: beforeEngine.visibility.value, composite: beforeEngine.composite.value },
      after: { presence: afterEngine.visibility.value, composite: afterEngine.composite.value },
      verdict: verdictFor(test, controlDelta, adjustedDelta),
    });
  }

  return { problems, comparisons, comparable: problems.every((p) => p.severity !== 'blocking') };
}

function verdictFor(test, controlDelta, adjustedDelta) {
  if (!test.significant) {
    return `no significant change (p=${test.pValue.toFixed(3)}); the ${(test.delta * 100).toFixed(1)}pp movement is within sampling noise and should not be reported as a change`;
  }
  if (controlDelta != null && Math.abs(controlDelta) > 0.05) {
    return `raw change ${(test.delta * 100).toFixed(1)}pp is significant, but the control cohort moved ${(controlDelta * 100).toFixed(1)}pp over the same window, so the engine itself shifted. Attributable change is ${(adjustedDelta * 100).toFixed(1)}pp.`;
  }
  return `significant change of ${(test.delta * 100).toFixed(1)}pp (p=${test.pValue.toFixed(4)}), control cohort stable`;
}

function groupBy(items, keyFn) {
  const m = new Map();
  for (const item of items || []) {
    const k = keyFn(item);
    if (!m.has(k)) m.set(k, []);
    m.get(k).push(item);
  }
  return m;
}

function mean(values) {
  const v = (values || []).filter((n) => Number.isFinite(n));
  return v.length ? r6(v.reduce((a, b) => a + b, 0) / v.length) : 0;
}

function sum(values) {
  return (values || []).reduce((a, b) => a + (Number(b) || 0), 0);
}

function r6(n) { return Math.round(Number(n || 0) * 1e6) / 1e6; }
