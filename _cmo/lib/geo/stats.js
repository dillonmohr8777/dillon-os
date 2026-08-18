/**
 * Statistics for AI-answer visibility measurement.
 *
 * This file is the product's central honesty claim, so it is worth stating
 * what it is defending against. The GEO tool category reports single-run point
 * estimates as fact: "you are #4, up two spots, 17% visibility". LLM outputs
 * are non-deterministic by construction - published work finds an identical
 * prompt at temperature 0 producing dozens of distinct completions - so a
 * one-shot observation is closer to a coin flip than a measurement, and
 * independent testing of shipped tools has found roughly two-thirds accuracy
 * with wrong-brand attributions among the errors.
 *
 * Consequences enforced here:
 *
 *   - Every proportion ships with a WILSON interval, not a normal
 *     approximation. At 3-10 replicates the normal approximation produces
 *     intervals outside [0,1], which is how "0% +/- 12%" gets printed.
 *   - Every aggregate ships with its EFFECTIVE SAMPLE SIZE, so skewed prompt
 *     weights cannot masquerade as precision.
 *   - No delta is ever reported as a change unless a two-proportion test says
 *     it is one.
 *   - Confidence on the weighted composite comes from a BLOCK BOOTSTRAP that
 *     resamples prompts, not runs: runs within a prompt are correlated, and
 *     resampling them understates variance.
 */

import { seededRandom } from '../core/hash.js';

export const Z95 = 1.959964;
export const Z90 = 1.644854;
export const Z99 = 2.575829;

/**
 * Wilson score interval for a binomial proportion.
 *
 * @param {number} successes
 * @param {number} trials
 * @param {number} z
 * @returns {{p:number, low:number, high:number, center:number, half:number, n:number}}
 */
export function wilson(successes, trials, z = Z95) {
  const n = Math.max(0, Math.round(trials));
  if (n === 0) return { p: 0, low: 0, high: 1, center: 0.5, half: 0.5, n: 0 };
  const x = Math.min(n, Math.max(0, successes));
  const p = x / n;
  const z2 = z * z;
  const denom = 1 + z2 / n;
  const center = (p + z2 / (2 * n)) / denom;
  const half = (z / denom) * Math.sqrt((p * (1 - p)) / n + z2 / (4 * n * n));
  return {
    p: r6(p),
    center: r6(center),
    half: r6(half),
    low: r6(Math.max(0, center - half)),
    high: r6(Math.min(1, center + half)),
    n,
  };
}

/**
 * Weighted visibility across prompts for one engine.
 *
 * @param {Array<{weight:number, successes:number, trials:number}>} cells
 * @returns {object} value, CI, effective sample size, coverage, zero-inflation
 */
export function weightedVisibility(cells, z = Z95) {
  const usable = cells.filter((c) => c && c.trials > 0);
  if (!usable.length) {
    return { value: 0, low: 0, high: 0, variance: 0, nEff: 0, prompts: 0, coverage: 0, zeroShare: 1 };
  }
  // Renormalize so weights sum to 1 over the cells we actually have.
  const total = usable.reduce((a, c) => a + (Number(c.weight) || 0), 0) || usable.length;
  const norm = usable.map((c) => ({
    w: (Number(c.weight) || 1 / usable.length) / total,
    p: c.successes / c.trials,
    n: c.trials,
  }));

  const value = norm.reduce((a, c) => a + c.w * c.p, 0);
  const variance = norm.reduce((a, c) => a + c.w * c.w * ((c.p * (1 - c.p)) / c.n), 0);
  let half = z * Math.sqrt(variance);

  // Degenerate case that matters more than it looks. When every cell is 0 (or
  // every cell is 1), the per-cell binomial variance is exactly 0, so the
  // weighted interval collapses to zero width and the product reports
  // "0.0% [0.0-0.0]" off 54 runs. That is precisely the false precision this
  // engine exists to prevent: 54 runs of nothing is consistent with a true rate
  // up to several percent. Fall back to a Wilson interval on the POOLED counts,
  // which stays honest at the boundary.
  const pooledSuccesses = usable.reduce((a, c) => a + c.successes, 0);
  const pooledTrials = usable.reduce((a, c) => a + c.trials, 0);
  let degenerate = false;
  if (variance === 0 && pooledTrials > 0) {
    degenerate = true;
    const w = wilson(pooledSuccesses, pooledTrials, z);
    return {
      value: r6(value),
      low: r6(Math.min(value, w.low)),
      high: r6(Math.max(value, w.high)),
      half: r6(w.half),
      variance: 0,
      nEff: sumW2(norm) > 0 ? r6(avgTrialsOf(norm) / sumW2(norm)) : 0,
      prompts: norm.length,
      coverage: r6(norm.filter((c) => c.p > 0).length / norm.length),
      zeroShare: r6(1 - norm.filter((c) => c.p > 0).length / norm.length),
      // Named so a consumer can see why the interval came from a different
      // estimator than usual.
      intervalMethod: 'wilson-pooled (zero variance across cells)',
      pooled: { successes: pooledSuccesses, trials: pooledTrials },
    };
  }
  const sumW2v = sumW2(norm);
  const avgTrials = avgTrialsOf(norm);
  // Kish effective sample size. Equal weights over k prompts with R replicates
  // gives k*R; skewed weights collapse it, which is the number to report.
  const nEff = sumW2v > 0 ? r6(avgTrials / sumW2v) : 0;
  const present = norm.filter((c) => c.p > 0).length;

  return {
    value: r6(value),
    low: r6(Math.max(0, value - half)),
    high: r6(Math.min(1, value + half)),
    half: r6(half),
    variance: r6(variance),
    nEff,
    prompts: norm.length,
    // Coverage answers a question the weighted mean hides: on how many
    // prompts does the brand appear at all? Most prompts return zero for
    // most brands, and a mean alone makes that look like a small number
    // rather than a structural absence.
    coverage: r6(present / norm.length),
    zeroShare: r6(1 - present / norm.length),
    intervalMethod: 'weighted-normal',
    pooled: { successes: pooledSuccesses, trials: pooledTrials },
  };
}

function sumW2(norm) { return norm.reduce((a, c) => a + c.w * c.w, 0); }
function avgTrialsOf(norm) { return norm.reduce((a, c) => a + c.n, 0) / norm.length; }

/**
 * Two-proportion z-test. Used before any "up 3 points" claim is made.
 * Returns significant=false when the movement is indistinguishable from noise.
 */
export function twoProportionTest(x1, n1, x2, n2, alpha = 0.05) {
  if (!n1 || !n2) return { significant: false, z: 0, pValue: 1, reason: 'insufficient data' };
  const p1 = x1 / n1;
  const p2 = x2 / n2;
  const pooled = (x1 + x2) / (n1 + n2);
  const se = Math.sqrt(pooled * (1 - pooled) * (1 / n1 + 1 / n2));
  if (se === 0) return { significant: false, z: 0, pValue: 1, delta: r6(p2 - p1), reason: 'zero variance' };
  const z = (p2 - p1) / se;
  const pValue = 2 * (1 - normalCdf(Math.abs(z)));
  return {
    significant: pValue < alpha,
    z: r6(z),
    pValue: r6(pValue),
    delta: r6(p2 - p1),
    from: r6(p1),
    to: r6(p2),
    alpha,
  };
}

/** Standard normal CDF (Abramowitz & Stegun 7.1.26 on erf). */
export function normalCdf(x) {
  return 0.5 * (1 + erf(x / Math.SQRT2));
}

function erf(x) {
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * ax);
  const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-ax * ax);
  return sign * y;
}

/**
 * Sample-size planning. How many runs for a given margin of error.
 * n = z^2 * p(1-p) / m^2
 */
export function requiredRuns(marginOfError, p = 0.5, z = Z95) {
  if (!marginOfError || marginOfError <= 0) return Infinity;
  return Math.ceil((z * z * p * (1 - p)) / (marginOfError * marginOfError));
}

/** The inverse: the margin of error a given design actually buys. */
export function marginOfError(runs, p = 0.5, z = Z95) {
  if (!runs || runs <= 0) return 1;
  return r6(z * Math.sqrt((p * (1 - p)) / runs));
}

/**
 * Block bootstrap over PROMPTS (not runs).
 *
 * Prompts are the unit of exchangeability. Replicates of the same prompt are
 * correlated, so resampling runs would produce a falsely narrow interval on
 * exactly the headline number people quote.
 *
 * `seed` makes it deterministic, which matters because a confidence interval
 * that changes when you refresh the page is not a confidence interval.
 */
export function bootstrapCi(cells, statFn, { iterations = 2000, z = Z95, seed = 'cmo-bootstrap' } = {}) {
  const usable = cells.filter((c) => c && c.trials > 0);
  if (usable.length < 2) {
    const only = usable.length === 1 ? statFn(usable) : 0;
    return { value: r6(only), low: r6(only), high: r6(only), iterations: 0, note: 'too few prompts to bootstrap' };
  }
  const rng = seededRandom(seed);
  const samples = new Array(iterations);
  for (let i = 0; i < iterations; i += 1) {
    const draw = new Array(usable.length);
    for (let j = 0; j < usable.length; j += 1) {
      draw[j] = usable[Math.floor(rng() * usable.length)];
    }
    samples[i] = statFn(draw);
  }
  samples.sort((a, b) => a - b);
  const alpha = (1 - (z === Z95 ? 0.95 : z === Z90 ? 0.90 : 0.99)) / 2;
  return {
    value: r6(statFn(usable)),
    low: r6(percentile(samples, alpha)),
    high: r6(percentile(samples, 1 - alpha)),
    iterations,
  };
}

export function percentile(sortedArr, q) {
  if (!sortedArr.length) return 0;
  const idx = (sortedArr.length - 1) * q;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sortedArr[lo];
  return sortedArr[lo] + (sortedArr[hi] - sortedArr[lo]) * (idx - lo);
}

/**
 * Variance-weighted EWMA (a scalar Kalman update).
 *
 * A noisy day should move the trend line less than a precise one. Plotting raw
 * daily values is how a category convinced itself that engine jitter was
 * client performance.
 */
export function kalmanUpdate(prior, priorVar, observation, obsVar) {
  if (prior == null) return { estimate: r6(observation), variance: r6(obsVar) };
  const k = priorVar / (priorVar + obsVar || 1);
  return {
    estimate: r6(prior + k * (observation - prior)),
    variance: r6((1 - k) * priorVar),
    gain: r6(k),
  };
}

/**
 * Prominence of a brand inside one answer.
 * ordinal j -> 1/log2(j+1); position -> how early the first mention lands.
 */
export function prominence({ ordinal, firstOffset, responseLength }) {
  const j = Math.max(1, Number(ordinal) || 1);
  const rankScore = 1 / Math.log2(j + 1);
  const len = Math.max(1, Number(responseLength) || 1);
  const positionScore = Math.max(0, Math.min(1, 1 - (Number(firstOffset) || 0) / len));
  return r6(0.6 * rankScore + 0.4 * positionScore);
}

/**
 * Net stance. A mention inside "vendors to avoid" is not visibility, but every
 * mention-counting tool scores it as such.
 */
export function netStance({ recommended = 0, neutral = 0, cautioned = 0, negative = 0 }) {
  const total = recommended + neutral + cautioned + negative;
  if (!total) return 0;
  return r6((recommended - negative - 0.5 * cautioned) / total);
}

/**
 * Phrasing robustness: how stable presence is across paraphrases of the same
 * question. Low robustness on a high-weight prompt means the brand's
 * visibility is fragile to wording - actionable, and unavailable elsewhere.
 */
export function phrasingRobustness(paraphraseRates) {
  const rates = (paraphraseRates || []).filter((r) => Number.isFinite(r));
  if (rates.length < 2) return null;
  const mean = rates.reduce((a, b) => a + b, 0) / rates.length;
  const variance = rates.reduce((a, b) => a + (b - mean) ** 2, 0) / rates.length;
  return r6(Math.max(0, 1 - Math.sqrt(variance) / 0.5));
}

/** Population standard deviation. */
export function stdev(values) {
  const v = (values || []).filter((n) => Number.isFinite(n));
  if (v.length < 2) return 0;
  const mean = v.reduce((a, b) => a + b, 0) / v.length;
  return r6(Math.sqrt(v.reduce((a, b) => a + (b - mean) ** 2, 0) / v.length));
}

export function median(values) {
  const v = (values || []).filter((n) => Number.isFinite(n)).sort((a, b) => a - b);
  if (!v.length) return 0;
  const mid = Math.floor(v.length / 2);
  return v.length % 2 ? v[mid] : (v[mid - 1] + v[mid]) / 2;
}

function r6(n) { return Math.round(Number(n || 0) * 1e6) / 1e6; }
