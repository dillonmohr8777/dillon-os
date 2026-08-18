/**
 * Per-workspace spend governor.
 *
 * Okara-class products hide model spend inside a flat subscription, which
 * means the vendor - not you - decides when to use a cheap model on your
 * behalf. Here the spend is yours and visible: every model call is priced,
 * written to an append-only ledger, and checked against caps BEFORE the call
 * goes out. A workspace that hits its cap degrades to cheaper models and then
 * stops, rather than quietly running up a bill.
 */

import { BudgetError } from '../core/errors.js';

export const DEFAULT_BUDGET = Object.freeze({
  dailyUsd: 5,
  monthlyUsd: 100,
  perRunUsd: 1.5,
  // When spend passes this fraction of the daily cap the router stops
  // handing out premium models and downshifts to the economy tier.
  downshiftAt: 0.7,
  hardStop: true,
});

function monthKey(iso) { return String(iso).slice(0, 7); }
function dayKey(iso) { return String(iso).slice(0, 10); }

/**
 * Roll a ledger stream up into today's and this month's totals.
 * The ledger is append-only, so this is always derivable and never stale.
 */
export function rollup(entries, nowIso) {
  const today = dayKey(nowIso);
  const month = monthKey(nowIso);
  const out = {
    todayUsd: 0, monthUsd: 0, totalUsd: 0, calls: 0,
    todayTokensIn: 0, todayTokensOut: 0,
    byModel: {}, byAgent: {},
  };
  for (const e of entries) {
    const usd = Number(e.usd || 0);
    if (!Number.isFinite(usd)) continue;
    out.totalUsd += usd;
    out.calls += 1;
    const ts = e.ts || '';
    if (dayKey(ts) === today) {
      out.todayUsd += usd;
      out.todayTokensIn += Number(e.tokensIn || 0);
      out.todayTokensOut += Number(e.tokensOut || 0);
    }
    if (monthKey(ts) === month) out.monthUsd += usd;
    if (e.model) out.byModel[e.model] = round6((out.byModel[e.model] || 0) + usd);
    if (e.agent) out.byAgent[e.agent] = round6((out.byAgent[e.agent] || 0) + usd);
  }
  out.todayUsd = round6(out.todayUsd);
  out.monthUsd = round6(out.monthUsd);
  out.totalUsd = round6(out.totalUsd);
  return out;
}

function round6(n) { return Math.round(n * 1e6) / 1e6; }

export function createBudget({ store, wsId, clock, limits = {} } = {}) {
  const caps = { ...DEFAULT_BUDGET, ...limits };
  const ws = store.ws(wsId);
  let cache = null;      // { at, rollup }
  const runSpend = new Map(); // runId -> usd

  async function current({ fresh = false } = {}) {
    if (!fresh && cache && clock.now() - cache.at < 2000) return cache.rollup;
    const entries = await ws.read('ledger');
    const r = rollup(entries, clock.iso());
    cache = { at: clock.now(), rollup: r };
    return r;
  }

  /**
   * Ask permission before a call. Returns a decision rather than throwing so
   * the router can downshift instead of failing when there is still headroom.
   */
  async function check({ estimateUsd = 0, runId = null } = {}) {
    const r = await current();
    const runUsd = runId ? (runSpend.get(runId) || 0) : 0;
    const reasons = [];

    const dayRemaining = round6(caps.dailyUsd - r.todayUsd);
    const monthRemaining = round6(caps.monthlyUsd - r.monthUsd);
    const runRemaining = round6(caps.perRunUsd - runUsd);

    if (dayRemaining <= 0) reasons.push(`daily cap $${caps.dailyUsd} reached`);
    if (monthRemaining <= 0) reasons.push(`monthly cap $${caps.monthlyUsd} reached`);
    if (runRemaining <= 0) reasons.push(`per-run cap $${caps.perRunUsd} reached`);
    if (estimateUsd > 0) {
      if (estimateUsd > dayRemaining) reasons.push(`estimate $${estimateUsd} exceeds remaining daily $${dayRemaining}`);
      if (estimateUsd > runRemaining) reasons.push(`estimate $${estimateUsd} exceeds remaining run $${runRemaining}`);
    }

    const usedFraction = caps.dailyUsd > 0 ? r.todayUsd / caps.dailyUsd : 0;
    return {
      allowed: reasons.length === 0,
      reasons,
      downshift: usedFraction >= caps.downshiftAt,
      usedFraction: round6(usedFraction),
      remaining: { dayUsd: dayRemaining, monthUsd: monthRemaining, runUsd: runRemaining },
      caps,
      spend: r,
    };
  }

  /** Throwing form, for code paths that must not proceed. */
  async function assertAllowed(opts = {}) {
    const decision = await check(opts);
    if (!decision.allowed && caps.hardStop) {
      throw new BudgetError(`budget exhausted for ${wsId}: ${decision.reasons.join('; ')}`, {
        workspaceId: wsId, remaining: decision.remaining, caps,
      });
    }
    return decision;
  }

  /** Record actual spend. Always called after a real model or connector call. */
  async function record(entry) {
    const usd = round6(Number(entry.usd || 0));
    const record_ = { ...entry, usd, workspaceId: wsId };
    await ws.append('ledger', record_);
    if (entry.runId) runSpend.set(entry.runId, round6((runSpend.get(entry.runId) || 0) + usd));
    cache = null;
    return record_;
  }

  return { caps, check, assertAllowed, record, current, runSpend: (runId) => runSpend.get(runId) || 0 };
}
