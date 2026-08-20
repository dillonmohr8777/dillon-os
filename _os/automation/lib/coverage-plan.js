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
  // Philadelphia and the collar counties still carry the majority: own
  // photography, local proof and a drivable meeting all exist here.
  { name: 'Philadelphia', adminLevel: 8, state: 'Pennsylvania', market: 'PHL', share: 0.22 },
  { name: 'Montgomery County', adminLevel: 6, state: 'Pennsylvania', market: 'PHL', share: 0.10 },
  { name: 'Delaware County', adminLevel: 6, state: 'Pennsylvania', market: 'PHL', share: 0.09 },
  { name: 'Bucks County', adminLevel: 6, state: 'Pennsylvania', market: 'PHL', share: 0.08 },
  { name: 'Chester County', adminLevel: 6, state: 'Pennsylvania', market: 'PHL', share: 0.08 },

  // The expansion. Every one of these is a real metro with its own trades and
  // medical base, reachable in a day, and — the point — not yet mined out.
  { name: 'Lehigh County', adminLevel: 6, state: 'Pennsylvania', market: 'ABE', share: 0.06 },
  { name: 'Northampton County', adminLevel: 6, state: 'Pennsylvania', market: 'ABE', share: 0.04 },
  { name: 'Berks County', adminLevel: 6, state: 'Pennsylvania', market: 'RDG', share: 0.05 },
  { name: 'Lancaster County', adminLevel: 6, state: 'Pennsylvania', market: 'LNS', share: 0.05 },
  { name: 'York County', adminLevel: 6, state: 'Pennsylvania', market: 'YRK', share: 0.04 },
  { name: 'Dauphin County', adminLevel: 6, state: 'Pennsylvania', market: 'HAR', share: 0.04 },
  { name: 'Cumberland County', adminLevel: 6, state: 'Pennsylvania', market: 'HAR', share: 0.03 },
  { name: 'Luzerne County', adminLevel: 6, state: 'Pennsylvania', market: 'AVP', share: 0.03 },
  { name: 'Lackawanna County', adminLevel: 6, state: 'Pennsylvania', market: 'AVP', share: 0.03 },
  { name: 'Allegheny County', adminLevel: 6, state: 'Pennsylvania', market: 'PGH', share: 0.04 },
  { name: 'Westmoreland County', adminLevel: 6, state: 'Pennsylvania', market: 'PGH', share: 0.02 },
];

/**
 * How many consecutive barren visits before a cell is treated as mined out.
 *
 * This is the fix for the failure that actually stopped the radar. On
 * 2026-08-18 the sweep ran, reported `status: ok`, pulled 144 candidates and
 * added **none**: every one was already in the registry. It then did the same
 * thing the next day, and would have continued indefinitely.
 *
 * The mechanism is worth stating plainly, because the planner was working
 * exactly as designed. Philadelphia held 273 of 1,088 rows — 25% against a 34%
 * target — so it had the largest deficit, so it got the whole budget, every
 * day. But OpenStreetMap has no more Philadelphia businesses of these verticals
 * to give. A deficit that discovery *cannot* close still reads as the top
 * priority forever, so the budget drained into an exhausted cell each morning
 * and the registry stopped growing.
 *
 * So yield is now remembered per cell. A cell that returns nothing new twice in
 * a row is skipped in favour of one that can still produce, and it becomes
 * eligible again after `SATURATION_COOLDOWN_DAYS` — OSM does get edited, and a
 * permanent ban would be as wrong as no ban at all.
 */
const SATURATION_STRIKES = 2;
const SATURATION_COOLDOWN_DAYS = 30;

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
 * Before the payload was tiered (radar-dashboard.DETAIL_ROWS):
 *
 *   1,500 rows -> 1.18MB   ok
 *   2,000 rows -> 1.54MB   THROWS
 *
 * After tiering the drawer-only fields, re-measured the same way:
 *
 *   1,500 rows -> 1.13MB   ok
 *   1,800 rows -> 1.32MB   ok
 *   2,000 rows -> 1.45MB   ok
 *   2,200 rows -> 1.57MB   THROWS
 *
 * So the ceiling moved from roughly 1,900 rows to roughly 2,100. That is a
 * smaller gain than tiering promised, and the reason is worth recording: the
 * payload is dominated by genuinely unique per-row text — headlines, faults and
 * next actions all embed measured numbers — and the table itself needs the
 * headline and the first fault, so neither interning nor tiering can remove
 * them. Only ~7% of the page was drawer-only detail. A materially higher ceiling
 * needs the rows fetched on demand rather than embedded, which is a different
 * design, not a tuning pass.
 *
 * The earlier estimate assumed per-row cost stays flat. It does not: the
 * interned string table grows ~1.43 entries per row.
 *
 * tests/radar.test.js renders at the hard cap and fails if it throws, so these
 * cannot silently drift above the ceiling again.
 */
const REGISTRY_SOFT_CAP = 1700;
const REGISTRY_HARD_CAP = 2000;

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

  // Yield memory, written by the sweep after each run (see recordAreaYield).
  const yields = registry?.discovery_yield || {};
  const today = opts.today || null;

  const isSaturated = (name) => {
    const y = yields[name];
    if (!y || (y.barren_streak || 0) < SATURATION_STRIKES) return false;
    // Cooldown: OSM gets edited, so a mined-out cell is rested, not banned.
    if (today && y.last_barren) {
      const days = (Date.parse(`${today}T00:00:00Z`) - Date.parse(`${y.last_barren}T00:00:00Z`)) / 86400000;
      if (Number.isFinite(days) && days >= SATURATION_COOLDOWN_DAYS) return false;
    }
    return true;
  };

  const areaDeficits = AREA_TARGETS.map((a) => {
    const have = areaCount.get(a.name) || 0;
    const want = Math.round(projected * a.share);
    return { ...a, have, want, deficit: want - have, saturated: isSaturated(a.name) };
  }).sort((x, y) => {
    // A deficit discovery cannot close is not a priority. Saturated cells sort
    // last regardless of how far below target they look, which is what stops the
    // budget draining into an exhausted Philadelphia every morning.
    if (x.saturated !== y.saturated) return x.saturated ? 1 : -1;
    return y.deficit - x.deficit;
  });

  const saturatedNames = areaDeficits.filter((a) => a.saturated).map((a) => a.name);
  if (saturatedNames.length) {
    reason += `; skipping ${saturatedNames.length} mined-out cell(s): ${saturatedNames.slice(0, 4).join(', ')}`;
  }

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


/**
 * Remember what a cell actually produced, so the planner can stop aiming at a
 * deficit that discovery is unable to close.
 *
 * Called by the sweep once per targeted area with the number of *new* rows that
 * area contributed. Zero increments a barren streak; anything above zero clears
 * it, because a cell that just yielded is plainly not mined out.
 *
 * @param {object} registry radar.load() output - mutated in place
 * @param {string} area area name as it appears in AREA_TARGETS
 * @param {number} added new rows this area contributed today
 * @param {string} today ISO date
 */
function recordAreaYield(registry, area, added, today) {
  if (!registry || !area) return null;
  if (!registry.discovery_yield) registry.discovery_yield = {};
  const y = registry.discovery_yield[area] || { barren_streak: 0 };
  y.last_seen = today;
  if (Number(added) > 0) {
    y.barren_streak = 0;
    y.last_yield = today;
    y.last_added = Number(added);
  } else {
    y.barren_streak = (y.barren_streak || 0) + 1;
    y.last_barren = today;
    y.last_added = 0;
  }
  registry.discovery_yield[area] = y;
  return y;
}

module.exports = {
  planDiscovery,
  describePlan,
  recordAreaYield,
  AREA_TARGETS,
  GROUP_TARGETS,
  DAILY,
  REGISTRY_SOFT_CAP,
  REGISTRY_HARD_CAP,
  SATURATION_STRIKES,
  SATURATION_COOLDOWN_DAYS,
};
