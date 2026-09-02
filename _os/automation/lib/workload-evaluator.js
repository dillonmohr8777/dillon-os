'use strict';

// Pure evaluation helpers for the Chronos workload shadow: count-aware and
// intermittent-demand baselines, scaled metrics, a deterministic empirical
// band, and the repeated-origin gate. No I/O, no model calls.

function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

function mean(values) {
  return values.length ? sum(values) / values.length : null;
}

function weekdayOf(dateIso) {
  return new Date(`${dateIso}T00:00:00.000Z`).getUTCDay();
}

function quantile(values, p) {
  const sorted = [...values].sort((a, b) => a - b);
  if (!sorted.length) return 0;
  const index = (sorted.length - 1) * p;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower);
}

// Croston (1972) with the Syntetos-Boylan approximation. Daily work-package
// arrivals are intermittent counts, which is the regime this method is for.
function crostonSba(context, horizon, alpha = 0.1) {
  let level = null;
  let interval = null;
  let gap = 1;
  for (const value of context) {
    if (value > 0) {
      if (level === null) {
        // First demand: no preceding inter-demand interval exists yet.
        level = value;
      } else {
        level += alpha * (value - level);
        interval = interval === null ? gap : interval + alpha * (gap - interval);
      }
      gap = 1;
    } else {
      gap += 1;
    }
  }
  if (level === null) return Array.from({ length: horizon }, () => 0);
  // A single demand in the whole context implies one demand per context length.
  const effectiveInterval = interval === null ? context.length : interval;
  const rate = (level / effectiveInterval) * (1 - alpha / 2);
  return Array.from({ length: horizon }, () => +rate.toFixed(4));
}

function seasonalNaive7(context, horizon) {
  const week = context.slice(-7);
  if (week.length < 7) {
    return Array.from({ length: horizon }, () => context[context.length - 1]);
  }
  return Array.from({ length: horizon }, (_, index) => week[index % 7]);
}

function weekdayBuckets(context, contextDates) {
  const buckets = new Map();
  context.forEach((value, index) => {
    const day = weekdayOf(contextDates[index]);
    if (!buckets.has(day)) buckets.set(day, []);
    buckets.get(day).push(value);
  });
  return buckets;
}

function dayOfWeekMean(context, contextDates, futureDates) {
  const buckets = weekdayBuckets(context, contextDates);
  const overall = mean(context) ?? 0;
  return futureDates.map((date) => {
    const bucket = buckets.get(weekdayOf(date));
    return bucket && bucket.length ? +mean(bucket).toFixed(4) : overall;
  });
}

// Deterministic p10-p90 band from same-weekday history. Chronos coverage is
// only interesting if it beats what this free band already achieves.
function empiricalDayOfWeekBand(context, contextDates, futureDates) {
  const buckets = weekdayBuckets(context, contextDates);
  const pick = (date) => buckets.get(weekdayOf(date)) || context;
  return {
    p10: futureDates.map((date) => quantile(pick(date), 0.1)),
    p90: futureDates.map((date) => quantile(pick(date), 0.9)),
  };
}

function baselines(context, contextDates, futureDates) {
  const horizon = futureDates.length;
  const last = context[context.length - 1];
  return {
    persistence: futureDates.map(() => last),
    trailing_seven_day_mean: futureDates.map(() => mean(context.slice(-7))),
    trailing_28_day_mean: futureDates.map(() => mean(context.slice(-28))),
    zero: futureDates.map(() => 0),
    seasonal_naive_7: seasonalNaive7(context, horizon),
    day_of_week_mean: dayOfWeekMean(context, contextDates, futureDates),
    croston_sba: crostonSba(context, horizon),
  };
}

function inSampleSeasonalMae(context, season = 7) {
  if (context.length <= season) return null;
  const errors = [];
  for (let index = season; index < context.length; index += 1) {
    errors.push(Math.abs(context[index] - context[index - season]));
  }
  const value = mean(errors);
  return value && value > 0 ? value : null;
}

function metrics(predicted, actual, context) {
  const errors = actual.map((value, index) => Math.abs(predicted[index] - value));
  const denominator = sum(actual.map((value) => Math.abs(value)));
  const scale = inSampleSeasonalMae(context);
  return {
    mae: +mean(errors).toFixed(4),
    wape: denominator > 0 ? +((sum(errors) / denominator) * 100).toFixed(2) : null,
    mase: scale ? +(mean(errors) / scale).toFixed(4) : null,
  };
}

function coverage(actual, p10, p90) {
  const covered = actual.filter((value, index) => value >= p10[index] && value <= p90[index]).length;
  return +(covered / actual.length).toFixed(4);
}

function evaluateOrigin({ context, contextDates, futureDates, actual, output }) {
  const base = baselines(context, contextDates, futureDates);
  const rows = Object.fromEntries(
    Object.entries(base).map(([name, values]) => [name, metrics(values, actual, context)]),
  );
  const chronos = metrics(output.point, actual, context);
  const [bestName, bestMetrics] = Object.entries(rows).sort((a, b) => a[1].mae - b[1].mae)[0];
  const band = empiricalDayOfWeekBand(context, contextDates, futureDates);
  return {
    actual,
    zero_share: +(actual.filter((value) => value === 0).length / actual.length).toFixed(4),
    chronos,
    baselines: rows,
    best_baseline: { method: bestName, mae: bestMetrics.mae, wape: bestMetrics.wape },
    chronos_beats_best_baseline: chronos.mae < bestMetrics.mae,
    p10_p90_coverage: coverage(actual, output.quantiles.p10, output.quantiles.p90),
    empirical_day_of_week_band_coverage: coverage(actual, band.p10, band.p90),
    mean_interval_width: +mean(output.quantiles.p90.map((value, index) => value - output.quantiles.p10[index])).toFixed(2),
  };
}

function aggregateGates(origins, { minOrigins = 3 } = {}) {
  const scored = origins.filter((origin) => origin.status === 'scored');
  const rejected = origins.length - scored.length;
  const wins = scored.filter((origin) => origin.evaluation.chronos_beats_best_baseline).length;
  const meanCoverage = scored.length
    ? mean(scored.map((origin) => origin.evaluation.p10_p90_coverage))
    : null;
  const enough = scored.length >= minOrigins;
  const gates = {
    all_origins_valid: origins.length > 0 && rejected === 0,
    repeated_holdouts_beat_best_baseline: enough && wins * 3 >= scored.length * 2,
    repeated_holdouts_quantile_calibration: enough && meanCoverage !== null
      && meanCoverage >= 0.7 && meanCoverage <= 0.9,
    planner_consumption: false,
  };
  gates.repeated_holdouts = gates.all_origins_valid
    && gates.repeated_holdouts_beat_best_baseline
    && gates.repeated_holdouts_quantile_calibration;
  return {
    origins_planned: origins.length,
    origins_scored: scored.length,
    origins_rejected: rejected,
    chronos_wins_vs_best_baseline: wins,
    mean_p10_p90_coverage: meanCoverage === null ? null : +meanCoverage.toFixed(4),
    mean_empirical_band_coverage: scored.length
      ? +mean(scored.map((origin) => origin.evaluation.empirical_day_of_week_band_coverage)).toFixed(4)
      : null,
    mean_chronos_mae: scored.length ? +mean(scored.map((origin) => origin.evaluation.chronos.mae)).toFixed(4) : null,
    mean_best_baseline_mae: scored.length ? +mean(scored.map((origin) => origin.evaluation.best_baseline.mae)).toFixed(4) : null,
    best_baseline_methods: scored.map((origin) => origin.evaluation.best_baseline.method),
    gates,
    planner_consumption_reason: 'Software never sets planner_consumption. A human promotion decision must be recorded separately, and only after repeated holdouts pass.',
  };
}

module.exports = {
  aggregateGates,
  baselines,
  coverage,
  crostonSba,
  dayOfWeekMean,
  empiricalDayOfWeekBand,
  evaluateOrigin,
  inSampleSeasonalMae,
  metrics,
  seasonalNaive7,
};
