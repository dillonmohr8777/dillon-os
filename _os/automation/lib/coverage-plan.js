'use strict';

/**
 * Decide what tomorrow's discovery sweep should look for.
 *
 * ## Why this replaces the old rotation
 *
 * Discovery used to pick its target by day-of-year: seven slots, Philadelphia
 * taking one of them. The comment claimed that "keeps coverage even". It does
 * not, and the registry proves it — Montgomery County reached 389 rows against
 * Philadelphia's 175, a 2.2:1 skew *away* from the market this pipeline is
 * supposed to serve.
 *
 * The reason is that the rotation is even in *slots*, not in *rows*. Montgomery
 * is a large, densely-mapped county, so one Montgomery slot returns far more
 * businesses than one Philadelphia slot. Rotating fairly over unequal yields
 * produces unequal coverage, forever, with no feedback to correct it.
 *
 * So this plans from the registry instead. It compares what each county and
 * vertical actually holds against what it *should* hold, and spends the day's
 * budget on the largest deficits. That makes coverage self-correcting: the
 * thinner a cell is, the more of tomorrow it gets, until it is no longer thin.
 *
 * ## Why the budget is small
 *
 * The factory builds 25 sites a week and 118 rebuild targets are already
 * queued — roughly five months of work. Discovering 200 businesses a day would
 * not add pipeline, it would add hoard: the registry stops being a decision tool
 * and becomes a list nobody reads. It would also break the dashboard, whose
 * embedded payload starts failing to render somewhere between 1,500 and 2,000
 * rows — measured, see REGISTRY_SOFT_CAP.
 *
 * So the daily default is deliberately modest and most of the day's effort goes
 * to *confirming* what is already known — re-auditing what went stale and
 * rendering the rows whose verdict is still a guess. Discovery throttles further
 * as the registry approaches its useful size, because past that point another
 * unaudited row is worth less than a rendered one.
 */

const { VERTICAL_GROUPS } = require('./discovery');

/**
 * Target share of the registry per area.
 *
 * These are shares of the *whole* registry, not of a single day. Philadelphia
 * dominates because that is where local proof, own photography and a drivable
 * meeting actually exist — the same reasoning behind the geography weight in
 * radar.priorityScore, expressed as a coverage goal rather than a ranking nudge.
 *
 * Sums to 1.0.
 */
const AREA_TARGETS = [
  { name: 'Philadelphia', adminLevel: 8, state: 'Pennsylvania', market: 'PHL', share: 0.34 },
  { name: 'Delaware County', adminLevel: 6, state: 'Pennsylvania', market: 'PHL', share: 0.15 },
  { name: 'Montgomery County', adminLevel: 6, state: 'Pennsylvania', market: 'PHL', share: 0.14 },
  { name: 'Bucks County', adminLevel: 6, state: 'Pennsylvania', market: 'PHL', share: 0.13 },
  { name: 'Chester County', adminLevel: 6, state: 'Pennsylvania', market: 'PHL', share: 0.12 },
  { name: 'Lehigh County', adminLevel: 6, state: 'Pennsylvania', market: 'PA', share: 0.04 },
  { name: 'Berks County', adminLevel: 6, state: 'Pennsylvania', market: 'PA', share: 0.03 },
  { name: 'Lancaster County', adminLevel: 6, state: 'Pennsylvania', market: 'PA', share: 0.03 },
  { name: 'Allegheny County', adminLevel: 6, state: 'Pennsylvania', market: 'PGH', share: 0.02 },
];

/**
 * Target share per vertical group.
 *
 * Weighted by how well the group converts for this offer, not by how many of
 * them OpenStreetMap happens to hold. That distinction matters: OSM under-maps
 * suburban trades badly, so a plan that simply followed availability would keep
 * over-collecting restaurants and under-collecting the contractors that actually
 * close. Sums to 1.0.
 */
const GROUP_TARGETS = {
  'home-services': 0.30,
  medical: 0.18,
  legal: 0.15,
  'spa-wellness': 0.10,
  auto: 0.09,
  retail: 0.07,
  industrial: 0.06,
  food: 0.05,
};

/**
 * How big a registry the dashboard can actually render.
 *
 * These caps exist to stop the daily job driving the page past the size where
 * `renderDashboard` refuses to emit. Getting them wrong is not a tuning
 * question — a cap above the real ceiling means the throttle never fires and the
 * sweep wedges permanently.
 *
 * I got them wrong once, so the numbers here are now measured by *rendering*
 * synthetic registries rather than extrapolating a bytes-per-row figure:
 *
 *   1,500 rows -> 1.18MB   ok
 *   2,000 rows -> 1.54MB   THROWS
 *   2,400 rows -> 1.83MB   THROWS
 *
 * The earlier estimate assumed per-row cost stays flat. It does not: the
 * interned string table grows ~1.43 entries per row, because headlines and fault
 * text embed measured numbers and so are nearly unique per prospect. Interning
 * de-duplicates the genuinely repeated strings and cannot help with the rest.
 *
 * tests/radar.test.js renders at the hard cap and fails if it throws, so these
 * cannot silently drift above the ceiling again.
 */
const REGISTRY_SOFT_CAP = 1200;
const REGISTRY_HARD_CAP = 1500;

/** Default daily budgets. Deliberately modest for discovery — see the file header. */
const DAILY = {
  discover: 60,
  render: 80,
  enrich: 60,
  // Imagery checks are cheap (a fetch plus a few image HEAD-equivalents) and
  // answer the question that actually gates a build, so the whole rebuild queue
  // gets covered within a couple of days and then only re-checked on TTL.
  imagery: 60,
};

function num(v, d = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}

/**
 * Build the day's discovery plan from the registry's current shape.
 *
 * @param {object} registry radar.load() output
 * @param {object} [opts]
 * @param {number} [opts.budget] rows to aim to add today; defaults to DAILY.discover
 * @param {number} [opts.maxAreas=3] how many areas to visit in one run — each
 *        area costs several Overpass queries, and that API is a free community
 *        service, so a run stays polite rather than sweeping everything nightly
 * @param {number} [opts.groupsPerArea=3]
 * @returns {{targets:Array, budget:number, throttled:boolean, total:number,
 *            reason:string, areaDeficits:Array, groupDeficits:Array}}
 */
function planDiscovery(registry, opts = {}) {
  const all = Object.values(registry?.prospects || {});
  const total = all.length;
  const maxAreas = opts.maxAreas ?? 3;
  const groupsPerArea = opts.groupsPerArea ?? 3;

  const requested = num(opts.budget, DAILY.discover);
  let budget = requested;
  let reason = `targeting the thinnest cells against a ${total}-row registry`;

  // Throttle as the registry approaches the size where another unaudited row is
  // worth less than a rendered one. A linear ramp between the caps rather than a
  // step: a cliff would take the job from a full day's discovery to none
  // overnight, and there is no reason for the last row under the cap and the
  // first row over it to be treated so differently.
  if (total >= REGISTRY_HARD_CAP) {
    budget = 0;
    reason =
      `registry is at ${total} rows (hard cap ${REGISTRY_HARD_CAP}) — discovery paused. ` +
      'The day goes to re-auditing and rendering instead. Raise the cap only after ' +
      'trimming the dashboard payload or excluding closed prospects.';
  } else if (total >= REGISTRY_SOFT_CAP) {
    const span = REGISTRY_HARD_CAP - REGISTRY_SOFT_CAP;
    const room = REGISTRY_HARD_CAP - total;
    const factor = Math.max(0, Math.min(1, room / span));
    budget = Math.max(0, Math.round(requested * factor));
    reason =
      `registry is at ${total} rows, past the ${REGISTRY_SOFT_CAP} soft cap — ` +
      `discovery ramped from ${requested} to ${budget}`;
  }

  // `throttled` means the budget was actually cut, not merely that a threshold
  // was crossed. Reporting a throttle that changed nothing would be noise.
  const throttled = budget < requested;

  // Where are we, per area and per group?
  const areaCount = new Map();
  const groupCount = new Map();
  for (const p of all) {
    const a = p.area || p.market || 'unknown';
    areaCount.set(a, (areaCount.get(a) || 0) + 1);
    const g = p.vertical_group || 'other';
    groupCount.set(g, (groupCount.get(g) || 0) + 1);
  }

  // Deficit against target, measured after today's budget lands so the plan
  // aims at where the registry *will* be rather than where it was.
  const projected = total + budget;

  const areaDeficits = AREA_TARGETS.map((a) => {
    const have = areaCount.get(a.name) || 0;
    const want = Math.round(projected * a.share);
    return { ...a, have, want, deficit: want - have };
  }).sort((x, y) => y.deficit - x.deficit);

  const groupDeficits = Object.entries(GROUP_TARGETS)
    .map(([group, share]) => {
      const have = groupCount.get(group) || 0;
      const want = Math.round(projected * share);
      return { group, share, have, want, deficit: want - have };
    })
    .sort((x, y) => y.deficit - x.deficit);

  if (budget === 0) {
    return { targets: [], budget, throttled, total, reason, areaDeficits, groupDeficits };
  }

  // Only areas actually behind target are worth a query. If every area is at or
  // above target the registry is balanced, so fall back to the single largest
  // (least negative) deficit rather than querying nothing and reporting success.
  let chosenAreas = areaDeficits.filter((a) => a.deficit > 0).slice(0, maxAreas);
  if (!chosenAreas.length) {
    chosenAreas = areaDeficits.slice(0, 1);
    reason = `every area is at or above target; topping up ${chosenAreas[0].name}`;
  }

  const chosenGroups = (() => {
    const behind = groupDeficits.filter((g) => g.deficit > 0);
    const pool = behind.length ? behind : groupDeficits;
    return pool.slice(0, groupsPerArea).map((g) => g.group).filter((g) => VERTICAL_GROUPS[g]);
  })();

  // Split the budget across areas in proportion to how far behind each one is.
  const deficitSum = chosenAreas.reduce((s, a) => s + Math.max(1, a.deficit), 0);
  const targets = chosenAreas.map((a) => {
    const weight = Math.max(1, a.deficit) / deficitSum;
    return {
      name: a.name,
      adminLevel: a.adminLevel,
      state: a.state,
      market: a.market,
      groups: chosenGroups,
      // Per-area cap, so one dense county cannot absorb the whole day again —
      // which is exactly how the old rotation produced the Montgomery skew.
      cap: Math.max(5, Math.round(budget * weight)),
      have: a.have,
      want: a.want,
      deficit: a.deficit,
    };
  });

  return { targets, budget, throttled, total, reason, areaDeficits, groupDeficits };
}

/**
 * One-line, human-readable summary of the plan for the run log and the digest.
 */
function describePlan(plan) {
  if (!plan.targets.length) return plan.reason;
  const parts = plan.targets.map(
    (t) => `${t.name} +${t.cap} (has ${t.have}, wants ${t.want})`
  );
  return `${parts.join(' · ')} — groups: ${plan.targets[0].groups.join(', ')}`;
}

module.exports = {
  planDiscovery,
  describePlan,
  AREA_TARGETS,
  GROUP_TARGETS,
  DAILY,
  REGISTRY_SOFT_CAP,
  REGISTRY_HARD_CAP,
};
