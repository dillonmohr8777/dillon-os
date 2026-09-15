'use strict';

/**
 * Spend ledger and budget guard.
 *
 * Two jobs:
 *
 * 1. BUDGET. Video is the first thing in this vault that spends real money per
 *    invocation, from a Telegram message, potentially while nobody is watching.
 *    Every render checks per-shot, per-job and daily caps before submitting, and
 *    the daily cap is enforced against recorded spend rather than intent — a
 *    crashed job that already billed still counts against the day.
 *
 * 2. LEARNED RATES. pricing.js estimates token-priced models from a formula.
 *    OpenRouter reports the true charge as `usage.cost` on the completed job.
 *    Recording those observations lets the estimator be corrected by evidence:
 *    after a model has been billed a few times, its observed $/second replaces
 *    the derived one, and the estimate stops being a guess.
 *
 * The ledger is append-only JSONL. It is regenerable state, not vault truth, so
 * it lives under _os/automation/state/ and is safe to delete.
 */

const fs = require('fs');
const path = require('path');

const STATE_DIR = path.join(__dirname, '..', '..', 'state');
const LEDGER_PATH = path.join(STATE_DIR, 'video-ledger.jsonl');

function ensureDir(p) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
}

function todayUtc() {
  return new Date().toISOString().slice(0, 10);
}

/** Append one billing observation. */
function record(entry, ledgerPath = LEDGER_PATH) {
  ensureDir(ledgerPath);
  const row = {
    ts: new Date().toISOString(),
    date: todayUtc(),
    job_id: entry.jobId || null,
    model: entry.model || null,
    resolution: entry.resolution || null,
    aspect_ratio: entry.aspectRatio || null,
    duration_seconds: entry.durationSeconds ?? null,
    audio: entry.audio ?? null,
    estimated_usd: entry.estimatedUsd ?? null,
    actual_usd: entry.actualUsd ?? null,
    status: entry.status || 'completed',
    label: entry.label || null,
  };
  fs.appendFileSync(ledgerPath, `${JSON.stringify(row)}\n`, 'utf8');
  return row;
}

function readAll(ledgerPath = LEDGER_PATH) {
  if (!fs.existsSync(ledgerPath)) return [];
  return fs
    .readFileSync(ledgerPath, 'utf8')
    .split('\n')
    .filter((l) => l.trim())
    .map((l) => {
      try {
        return JSON.parse(l);
      } catch {
        // A torn final line from a killed process must not poison the ledger.
        return null;
      }
    })
    .filter(Boolean);
}

/** Total actually billed on a given UTC date. */
function spendOn(date = todayUtc(), ledgerPath = LEDGER_PATH) {
  return readAll(ledgerPath)
    .filter((r) => r.date === date)
    .reduce((sum, r) => sum + (Number(r.actual_usd) || Number(r.estimated_usd) || 0), 0);
}

/**
 * Observed $/second for a (model, resolution, audio) combination.
 *
 * Requires at least `minSamples` billed observations before it will override a
 * derived estimate — a single sample can be distorted by a per-generation floor
 * or a partial refund, and a wrong "learned" rate is worse than an honest guess.
 */
function learnedRate(model, { resolution = null, audio = null, minSamples = 3 } = {}, ledgerPath = LEDGER_PATH) {
  const rows = readAll(ledgerPath).filter(
    (r) =>
      r.model === model &&
      Number(r.actual_usd) > 0 &&
      Number(r.duration_seconds) > 0 &&
      (resolution === null || r.resolution === resolution) &&
      (audio === null || r.audio === audio)
  );
  if (rows.length < minSamples) return null;

  const rates = rows.map((r) => Number(r.actual_usd) / Number(r.duration_seconds)).sort((a, b) => a - b);
  // Median, not mean: one floored or refunded job should not move the rate.
  const mid = Math.floor(rates.length / 2);
  const median = rates.length % 2 ? rates[mid] : (rates[mid - 1] + rates[mid]) / 2;
  return { usdPerSecond: Number(median.toFixed(6)), samples: rows.length, basis: 'observed' };
}

/**
 * Gate a planned job against the caps.
 *
 * @returns {{ok:boolean, reason?:string, dailySpent:number, wouldTotal:number}}
 */
function checkBudget(plannedUsd, budget = {}, opts = {}) {
  const ledgerPath = opts.ledgerPath || LEDGER_PATH;
  const dailySpent = spendOn(todayUtc(), ledgerPath);
  const wouldTotal = dailySpent + plannedUsd;

  const caps = { dailyCap: budget.daily_usd ?? null, perJobCap: budget.per_job_usd ?? null, perShotCap: budget.per_shot_usd ?? null };

  if (budget.per_job_usd != null && plannedUsd > budget.per_job_usd) {
    return {
      ok: false,
      reason: `job estimate $${plannedUsd.toFixed(2)} exceeds per-job cap $${budget.per_job_usd.toFixed(2)}`,
      dailySpent, wouldTotal, ...caps,
    };
  }
  if (budget.daily_usd != null && wouldTotal > budget.daily_usd) {
    return {
      ok: false,
      reason: `this job would bring today's spend to $${wouldTotal.toFixed(2)}, over the $${budget.daily_usd.toFixed(2)} daily cap ($${dailySpent.toFixed(2)} already spent)`,
      dailySpent, wouldTotal, ...caps,
    };
  }
  return { ok: true, dailySpent, wouldTotal, ...caps };
}

/** Estimate-vs-actual accuracy, so drift in the token formula is visible. */
function accuracyReport(ledgerPath = LEDGER_PATH) {
  const rows = readAll(ledgerPath).filter((r) => Number(r.actual_usd) > 0 && Number(r.estimated_usd) > 0);
  const byModel = new Map();
  for (const r of rows) {
    if (!byModel.has(r.model)) byModel.set(r.model, []);
    byModel.get(r.model).push(Number(r.actual_usd) / Number(r.estimated_usd));
  }
  return [...byModel.entries()].map(([model, ratios]) => ({
    model,
    samples: ratios.length,
    meanActualOverEstimate: Number((ratios.reduce((a, b) => a + b, 0) / ratios.length).toFixed(3)),
  }));
}

module.exports = {
  LEDGER_PATH, STATE_DIR,
  record, readAll, spendOn, learnedRate, checkBudget, accuracyReport, todayUtc,
};
