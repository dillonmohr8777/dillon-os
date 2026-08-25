'use strict';

/**
 * Decide what tomorrow's discovery sweep should look for.
 *
 * ## Why this replaces the old rotation
 *
 * Discovery used to concentrate on Philadelphia and a short list of nearby
 * counties. That made the daily job look healthy while most of Pennsylvania
 * never entered the candidate pool at all.
 *
 * The reason is that the rotation is even in *slots*, not in *rows*. Montgomery
 * is a large, densely-mapped county, so one Montgomery slot returns far more
 * businesses than one Philadelphia slot. Rotating fairly over unequal yields
 * produces unequal coverage, forever, with no feedback to correct it.
 *
 * This planner covers all 67 Pennsylvania counties, grouped into six operating
 * regions. Every daily run selects at least one under-covered county from each
 * region, then spends any additional area slots on the largest remaining
 * deficits. The result is a literal statewide sweep every day without sending
 * one giant, abusive query to the community-run Overpass service.
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
 * Statewide operating regions. These are coverage buckets, not political or
 * tourism designations. Every county appears exactly once, and every region is
 * represented in every default daily plan.
 */
const PA_REGIONS = [
  {
    key: 'southeast', label: 'Southeast',
    counties: ['Philadelphia', 'Bucks', 'Chester', 'Delaware', 'Montgomery', 'Berks', 'Lehigh', 'Northampton'],
  },
  {
    key: 'south-central', label: 'South Central',
    counties: ['Lancaster', 'Lebanon', 'York', 'Adams', 'Cumberland', 'Dauphin', 'Franklin', 'Perry', 'Fulton', 'Juniata', 'Mifflin'],
  },
  {
    key: 'northeast', label: 'Northeast',
    counties: ['Lackawanna', 'Luzerne', 'Monroe', 'Pike', 'Wayne', 'Susquehanna', 'Wyoming', 'Schuylkill', 'Carbon', 'Columbia', 'Montour', 'Northumberland', 'Snyder', 'Union'],
  },
  {
    key: 'north-central', label: 'North Central',
    counties: ['Centre', 'Clinton', 'Lycoming', 'Tioga', 'Potter', 'McKean', 'Cameron', 'Elk', 'Clearfield', 'Sullivan', 'Bradford'],
  },
  {
    key: 'southwest', label: 'Southwest',
    counties: ['Allegheny', 'Armstrong', 'Beaver', 'Bedford', 'Blair', 'Cambria', 'Fayette', 'Greene', 'Huntingdon', 'Indiana', 'Somerset', 'Washington', 'Westmoreland'],
  },
  {
    key: 'northwest', label: 'Northwest',
    counties: ['Butler', 'Clarion', 'Crawford', 'Erie', 'Forest', 'Jefferson', 'Lawrence', 'Mercer', 'Venango', 'Warren'],
  },
];

/**
 * Equal regional coverage, divided evenly among the counties in that region.
 * This prevents the Philadelphia metro from dominating simply because it is
 * densely mapped while still giving every part of the state a daily lane.
 */
const AREA_TARGETS = PA_REGIONS.flatMap((region) =>
  region.counties.map((county) => ({
    name: county === 'Philadelphia' ? 'Philadelphia' : `${county} County`,
    adminLevel: county === 'Philadelphia' ? 8 : 6,
    state: 'Pennsylvania',
    market: 'PA',
    region: region.key,
    regionLabel: region.label,
    share: (1 / PA_REGIONS.length) / region.counties.length,
  }))
);

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
 * @param {number} [opts.maxAreas=6] how many counties to visit in one run. The
 *        default is one county from each Pennsylvania operating region.
 * @param {number} [opts.groupsPerArea=3]
 * @param {string} [opts.today] ISO date used to rotate equally thin counties
 * @returns {{targets:Array, budget:number, throttled:boolean, total:number,
 *            reason:string, areaDeficits:Array, groupDeficits:Array}}
 */
function planDiscovery(registry, opts = {}) {
  const all = Object.values(registry?.prospects || {});
  const total = all.length;
  const maxAreas = opts.maxAreas ?? PA_REGIONS.length;
  const groupsPerArea = opts.groupsPerArea ?? 3;
  const today = /^\d{4}-\d{2}-\d{2}$/.test(String(opts.today || ''))
    ? String(opts.today)
    : new Date().toISOString().slice(0, 10);
  const dayNumber = Math.floor(Date.parse(`${today}T00:00:00Z`) / 86400000);

  const requested = num(opts.budget, DAILY.discover);
  let budget = requested;
  let reason = `statewide Pennsylvania coverage across ${PA_REGIONS.length} regions and ${AREA_TARGETS.length} counties`;

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
    const lastAttempt = registry?.coverage_attempts?.[a.name]?.last_attempt || null;
    return { ...a, have, want, deficit: want - have, lastAttempt };
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

  // Give every region a daily lane. Within each region, choose the county with
  // the largest deficit. If maxAreas is smaller than the region count (manual
  // runs only), keep the regions with the largest top deficit. Extra slots go
  // to the largest remaining county deficits statewide.
  const regionalPicks = PA_REGIONS
    .map((region) => {
      const candidates = areaDeficits.filter((a) => a.region === region.key);
      const order = AREA_TARGETS.filter((a) => a.region === region.key).map((a) => a.name);
      const offset = ((dayNumber % order.length) + order.length) % order.length;
      const rotatedRank = (name) => {
        const index = order.indexOf(name);
        return ((index - offset) % order.length + order.length) % order.length;
      };
      // Never-swept counties go first. After every county has been attempted,
      // the oldest successful sweep goes first. Deficit then decides among
      // equally fresh counties, with the date rotation as the final tie-break.
      candidates.sort((a, b) => {
        if (!a.lastAttempt && b.lastAttempt) return -1;
        if (a.lastAttempt && !b.lastAttempt) return 1;
        if (a.lastAttempt && b.lastAttempt && a.lastAttempt !== b.lastAttempt) {
          return a.lastAttempt.localeCompare(b.lastAttempt);
        }
        return (b.deficit - a.deficit) || (rotatedRank(a.name) - rotatedRank(b.name));
      });
      return candidates[0];
    })
    .filter(Boolean)
    .sort((a, b) => b.deficit - a.deficit);
  let chosenAreas = regionalPicks.slice(0, Math.min(maxAreas, regionalPicks.length));
  if (chosenAreas.length < maxAreas) {
    const picked = new Set(chosenAreas.map((a) => a.name));
    chosenAreas = chosenAreas.concat(
      areaDeficits.filter((a) => !picked.has(a.name)).slice(0, maxAreas - chosenAreas.length)
    );
  }
  if (!chosenAreas.length) {
    chosenAreas = areaDeficits.slice(0, 1);
    reason = `statewide registry balanced; topping up ${chosenAreas[0].name}`;
  }

  const chosenGroups = (() => {
    const behind = groupDeficits.filter((g) => g.deficit > 0);
    const pool = behind.length ? behind : groupDeficits;
    return pool.slice(0, groupsPerArea).map((g) => g.group).filter((g) => VERTICAL_GROUPS[g]);
  })();

  // Split the budget across areas in proportion to how far behind each one is,
  // reserving at least one slot per selected region. Integer allocation sums
  // exactly to the daily budget so an early county cannot consume the final
  // region's reservation before its query runs.
  const deficitSum = chosenAreas.reduce((s, a) => s + Math.max(1, a.deficit), 0);
  const guaranteed = budget >= chosenAreas.length ? 1 : 0;
  const caps = chosenAreas.map(() => guaranteed);
  let remaining = Math.max(0, budget - guaranteed * chosenAreas.length);
  const shares = chosenAreas.map((a) => (remaining * Math.max(1, a.deficit)) / deficitSum);
  for (let i = 0; i < shares.length; i++) {
    const whole = Math.floor(shares[i]);
    caps[i] += whole;
    remaining -= whole;
  }
  const remainderOrder = shares
    .map((share, i) => ({ i, fraction: share - Math.floor(share) }))
    .sort((a, b) => b.fraction - a.fraction);
  for (let i = 0; i < remaining; i++) caps[remainderOrder[i % remainderOrder.length].i] += 1;

  const targets = chosenAreas.map((a, index) => {
    return {
      name: a.name,
      adminLevel: a.adminLevel,
      state: a.state,
      market: a.market,
      region: a.region,
      regionLabel: a.regionLabel,
      groups: chosenGroups,
      // Per-area cap, so one dense county cannot absorb the whole day again —
      // which is exactly how the old rotation produced the Montgomery skew.
      cap: caps[index],
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
    (t) => `${t.regionLabel}: ${t.name} +${t.cap} (has ${t.have}, wants ${t.want})`
  );
  return `${parts.join(' · ')} — groups: ${plan.targets[0].groups.join(', ')}`;
}

module.exports = {
  planDiscovery,
  describePlan,
  AREA_TARGETS,
  PA_REGIONS,
  GROUP_TARGETS,
  DAILY,
  REGISTRY_SOFT_CAP,
  REGISTRY_HARD_CAP,
};
