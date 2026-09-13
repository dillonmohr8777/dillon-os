/**
 * Prompt-set construction.
 *
 * "AI share of voice is not simply observed in the market. It is generated
 * through the testing methodology." That is the strongest criticism of this
 * category and it is correct, so the prompt set is treated as a versioned,
 * hashed, publishable instrument rather than an internal implementation detail.
 *
 * Five properties make a set defensible:
 *
 *   FROZEN     - the manifest is SHA-256 hashed. Any edit produces a new
 *                version and a marked discontinuity in every trend chart.
 *                Silent prompt-set drift is the main way these tools
 *                manufacture trends that did not happen.
 *   STRATIFIED - coverage is enforced across intent patterns and funnel
 *                stages, so a set cannot quietly become all brand-direct
 *                queries (which flatter the client) or all category queries
 *                (which bury them).
 *   WEIGHTED   - demand-weighted with the exponent damped and a per-prompt
 *                CAP, because one head term at weight 0.9 destroys the
 *                effective sample size.
 *   PARAPHRASED- every canonical prompt carries variants, which buys the
 *                phrasing-robustness metric.
 *   CONTROLLED - a fixed control cohort of prompts the client cannot
 *                influence. When the controls move, the ENGINE changed, not
 *                the client's marketing. This is what converts a dashboard
 *                into an instrument.
 */

import { sha256, canonicalJson, seededRandom } from '../core/hash.js';
import { slug } from '../core/ids.js';

/**
 * The seven intent patterns real buyers use on an answer engine.
 *
 * Templates key off `{seed}` - the harvested keyword or question - so a set
 * built from 30 seeds produces 30 distinct instruments. `{category}`,
 * `{segment}`, `{city}`, `{brand}` and `{competitor}` come from the workspace
 * profile and only ever qualify the seed, never replace it. Anything a
 * template cannot fill is dropped rather than shipped with a literal
 * "{placeholder}" in it.
 */
export const PATTERNS = Object.freeze({
  category_discovery: {
    label: 'Category discovery',
    funnel: 'TOFU',
    commercial: 0.7,
    templates: [
      'What is the best {seed} for {segment}?',
      'Who are the top providers for {seed} right now?',
      'I am looking for {seed} - where should I start?',
    ],
  },
  comparison: {
    label: 'Comparison',
    funnel: 'MOFU',
    commercial: 0.95,
    templates: [
      'How does {brand} compare to {competitor} for {category}?',
      'What are the best alternatives to {competitor}?',
      'Is {brand} or {competitor} better for {segment}?',
    ],
  },
  attribute: {
    label: 'Attribute / qualifier',
    funnel: 'MOFU',
    commercial: 0.85,
    templates: [
      'What is the most affordable option for {seed}?',
      'Which provider is best for {seed} if I need {feature}?',
      'What do people actually recommend for {seed}?',
    ],
  },
  problem: {
    label: 'Problem / job to be done',
    funnel: 'TOFU',
    commercial: 0.45,
    templates: [
      'How do I deal with {seed}?',
      'What should I do about {seed}?',
      'Who do I call about {seed}?',
    ],
  },
  definitional: {
    label: 'Definitional',
    funnel: 'TOFU',
    commercial: 0.15,
    templates: [
      'What is {seed}?',
      'How does {seed} actually work?',
      'Why does {seed} matter?',
    ],
  },
  local: {
    label: 'Local / geo',
    funnel: 'BOFU',
    commercial: 1.0,
    templates: [
      'Who is the best for {seed} in {city}?',
      'I need {seed} near {city} today - who should I call?',
      'Which company in {city} is best for {seed}?',
    ],
  },
  brand_direct: {
    label: 'Brand-direct',
    funnel: 'BOFU',
    commercial: 0.9,
    templates: [
      'Is {brand} any good?',
      'What do people say about {brand}?',
      'How much does {brand} charge for {category}?',
    ],
  },
});

export const DEFAULTS = Object.freeze({
  demandExponent: 0.5,   // dampen head-term dominance
  commercialExponent: 1.0,
  weightCap: 0.05,       // no single prompt may exceed 5% of the instrument
  paraphrases: 3,
  controlShare: 0.15,    // fraction of budget reserved for the control cohort
});

/**
 * Build a prompt set.
 *
 * @param {object} input
 * @param {string} input.setId
 * @param {string} input.locale
 * @param {Array}  input.seeds        [{ term, volume, pattern?, funnel?, commercial? }]
 * @param {object} input.vars         { category, segment, feature, problem, term, city, brand, competitor }
 * @param {Array}  input.competitors  declared competitor set (required for SOV)
 * @param {Array}  input.controls     control-cohort prompts (entities the client cannot influence)
 */
export function buildPromptSet({
  setId, locale = 'en-US', seeds = [], vars = {}, competitors = [],
  controls = [], options = {}, version = 1,
}) {
  const cfg = { ...DEFAULTS, ...options };
  if (!setId) throw new Error('buildPromptSet requires a setId');
  if (!seeds.length) throw new Error('buildPromptSet requires at least one seed');

  const rng = seededRandom(`${setId}:${version}`);
  const prompts = [];
  let counter = 0;

  for (const seed of seeds) {
    const patternKeys = seed.pattern ? [seed.pattern] : inferPatterns(seed, vars);
    for (const key of patternKeys) {
      const pattern = PATTERNS[key];
      if (!pattern) continue;
      const filled = pattern.templates
        .map((t) => fill(t, {
          ...vars,
          seed: nounPhrase(seed.term),
          term: nounPhrase(seed.term),
          category: vars.category || nounPhrase(seed.term),
        }))
        .filter((text) => !text.includes('{'));           // drop templates we cannot fill
      if (!filled.length) continue;

      counter += 1;
      const canonicalId = `p_${String(counter).padStart(4, '0')}`;
      const variants = filled.slice(0, Math.max(1, cfg.paraphrases));

      prompts.push({
        id: canonicalId,
        canonicalOf: canonicalId,
        text: variants[0],
        paraphrases: variants.slice(1),
        pattern: key,
        funnel: seed.funnel || pattern.funnel,
        seed: seed.term,
        demand: Math.max(1, Number(seed.volume) || 10),
        commercial: seed.commercial ?? pattern.commercial,
        cohort: 'client',
        // Screened in a pilot pass; until then assume nameable and let the
        // pilot demote prompts where no vendor is ever named.
        vendorNameable: null,
        weight: 0,
      });
    }
  }

  // Dedupe identical prompt text. Two different seeds can fill the same
  // template to the same sentence (e.g. "furnace repair" and "hvac near me"
  // both produce the local-pattern question). Left in, the same question
  // would carry double weight and be measured twice, which is a silent
  // instrument defect rather than extra coverage.
  const deduped = [];
  const seenText = new Map();
  for (const p of prompts) {
    const key = normalizeText(p.text);
    if (seenText.has(key)) {
      const first = seenText.get(key);
      // The same question asked from two seeds carries the demand of both.
      first.demand += p.demand;
      first.mergedSeeds = [...(first.mergedSeeds || [first.seed]), p.seed];
      continue;
    }
    seenText.set(key, p);
    deduped.push(p);
  }
  prompts.length = 0;
  prompts.push(...deduped);
  // Renumber so ids stay dense and stable for a given input.
  prompts.forEach((p, i) => {
    const id = `p_${String(i + 1).padStart(4, '0')}`;
    p.id = id;
    p.canonicalOf = id;
  });

  // Control cohort: excluded from weighting, sized as a share of the client set.
  const controlCount = Math.max(
    controls.length ? 1 : 0,
    Math.round(prompts.length * cfg.controlShare),
  );
  const controlPrompts = (controls.length ? controls : DEFAULT_CONTROLS)
    .slice(0, Math.max(1, controlCount))
    .map((text, i) => ({
      id: `c_${String(i + 1).padStart(3, '0')}`,
      canonicalOf: `c_${String(i + 1).padStart(3, '0')}`,
      text,
      paraphrases: [],
      pattern: 'control',
      funnel: 'CONTROL',
      seed: null,
      demand: 0,
      commercial: 0,
      cohort: 'control',
      vendorNameable: null,
      weight: 0,
    }));

  const weighting = applyWeights(prompts, cfg);

  const manifest = {
    setId: slug(setId),
    version,
    locale,
    createdWith: { ...cfg },
    weighting: {
      requestedCap: cfg.weightCap,
      effectiveCap: weighting.cap,
      // True when the requested cap was below 1/n and had to be relaxed.
      // Surfaced so a small prompt set cannot claim precision it lacks.
      capRelaxed: weighting.capRelaxed,
      maxWeight: weighting.effectiveMaxWeight,
      note: weighting.capRelaxed
        ? `requested cap ${cfg.weightCap} is below 1/n for ${prompts.length} prompts; relaxed to ${weighting.cap}. Add prompts to reach the requested cap.`
        : null,
    },
    competitors: competitors.slice(),
    counts: {
      client: prompts.length,
      control: controlPrompts.length,
      byPattern: countBy(prompts, 'pattern'),
      byFunnel: countBy(prompts, 'funnel'),
    },
    prompts: [...prompts, ...controlPrompts],
  };
  manifest.sha256 = sha256(canonicalJson({
    setId: manifest.setId,
    version,
    locale,
    prompts: manifest.prompts.map((p) => ({ id: p.id, text: p.text, paraphrases: p.paraphrases, weight: p.weight, cohort: p.cohort })),
  }));
  // Touch rng so the seeded generator is part of the recorded construction.
  manifest.constructionNonce = Math.floor(rng() * 1e9);
  return manifest;
}

/**
 * Weighting: w_i proportional to demand^alpha * commercial^beta, normalized,
 * then capped and renormalized. The cap is applied iteratively because
 * renormalizing after a cap can push another prompt over it.
 */
export function applyWeights(prompts, cfg = DEFAULTS) {
  if (!prompts.length) return { prompts, cap: cfg.weightCap, capRelaxed: false };

  // A cap below 1/n is unsatisfiable: n prompts each at most `cap` cannot sum
  // to 1. Rather than silently exceed the stated cap (which would make the
  // reported effective sample size a lie), relax it to exactly 1/n and say so.
  const floorCap = 1 / prompts.length;
  const capRelaxed = cfg.weightCap < floorCap;
  const cap = capRelaxed ? floorCap : cfg.weightCap;

  let raw = prompts.map((p) => (p.demand ** cfg.demandExponent) * ((p.commercial || 0.01) ** cfg.commercialExponent));
  let sum = raw.reduce((a, b) => a + b, 0) || 1;
  let w = raw.map((r) => r / sum);

  for (let pass = 0; pass < 40; pass += 1) {
    const over = w.some((x) => x > cap + 1e-9);
    if (!over) break;
    w = w.map((x) => Math.min(x, cap));
    const total = w.reduce((a, b) => a + b, 0);
    // If capping every prompt still cannot reach 1, the cap is below 1/n and
    // uniform weights are the only consistent answer.
    if (total <= 0) { w = prompts.map(() => 1 / prompts.length); break; }
    if (Math.abs(total - 1) < 1e-9) break;
    const headroom = w.map((x) => (x < cap - 1e-12 ? x : 0));
    const headSum = headroom.reduce((a, b) => a + b, 0);
    if (headSum <= 0) { w = prompts.map(() => 1 / prompts.length); break; }
    const deficit = 1 - total;
    w = w.map((x, i) => (x < cap - 1e-12 ? x + (headroom[i] / headSum) * deficit : x));
  }

  const finalSum = w.reduce((a, b) => a + b, 0) || 1;
  prompts.forEach((p, i) => { p.weight = Math.round((w[i] / finalSum) * 1e6) / 1e6; });
  return { prompts, cap: round6(cap), capRelaxed, effectiveMaxWeight: round6(Math.max(...prompts.map((p) => p.weight))) };
}

/**
 * Apply pilot results: demote prompts where no vendor is ever named.
 * A prompt that never names a vendor cannot produce brand visibility, so
 * keeping it only burns budget and dilutes the instrument.
 */
export function screenPromptSet(manifest, pilotResults, { minNameRate = 1 / 3 } = {}) {
  const byId = new Map(pilotResults.map((r) => [r.promptId, r]));
  const kept = [];
  const dropped = [];
  for (const p of manifest.prompts) {
    if (p.cohort === 'control') { kept.push(p); continue; }
    const result = byId.get(p.id);
    const nameRate = result ? result.anyBrandRate : null;
    const nameable = nameRate == null ? true : nameRate >= minNameRate;
    const next = { ...p, vendorNameable: nameable, pilotNameRate: nameRate };
    if (nameable) kept.push(next);
    else dropped.push(next);
  }
  const clientPrompts = kept.filter((p) => p.cohort === 'client');
  const reweighted = applyWeights(clientPrompts, manifest.createdWith || DEFAULTS);
  const next = {
    ...manifest,
    version: (manifest.version || 1) + 1,
    prompts: kept,
    weighting: {
      requestedCap: (manifest.createdWith || DEFAULTS).weightCap,
      effectiveCap: reweighted.cap,
      capRelaxed: reweighted.capRelaxed,
      maxWeight: reweighted.effectiveMaxWeight,
      note: reweighted.capRelaxed
        ? `requested cap is below 1/n for ${clientPrompts.length} prompts; relaxed to ${reweighted.cap}.`
        : null,
    },
    screened: {
      at: new Date(0).toISOString().slice(0, 10),
      droppedCount: dropped.length,
      droppedIds: dropped.map((d) => d.id),
      minNameRate,
    },
    counts: {
      ...manifest.counts,
      client: clientPrompts.length,
      control: kept.length - clientPrompts.length,
    },
  };
  next.sha256 = sha256(canonicalJson({
    setId: next.setId, version: next.version, locale: next.locale,
    prompts: next.prompts.map((p) => ({ id: p.id, text: p.text, paraphrases: p.paraphrases, weight: p.weight, cohort: p.cohort })),
  }));
  return next;
}

/** Runs a scan will need: prompts x engines x replicates, control included. */
export function scanPlan(manifest, { engines, replicates = 5 }) {
  const clientPrompts = manifest.prompts.filter((p) => p.cohort === 'client');
  const controlPrompts = manifest.prompts.filter((p) => p.cohort === 'control');
  const runs = (clientPrompts.length + controlPrompts.length) * engines.length * replicates;
  return {
    prompts: clientPrompts.length,
    controls: controlPrompts.length,
    engines: engines.length,
    replicates,
    runs,
    // Precision comes from prompt breadth x replicates on the AGGREGATE, not
    // from many replicates of one prompt.
    aggregateRunsPerEngine: (clientPrompts.length) * replicates,
  };
}

const DEFAULT_CONTROLS = Object.freeze([
  'What is the best cordless drill for home use?',
  'Who makes the most reliable dishwasher?',
  'What is the best note-taking app for students?',
  'Which airline has the most legroom in economy?',
  'What is the best beginner acoustic guitar?',
  'Who are the top providers of commercial laundry equipment?',
  'What is the best budget espresso machine?',
  'Which brand of running shoe lasts longest?',
]);

/**
 * Infer which patterns a seed should be measured under.
 *
 * A seed is not one prompt - it is a topic that buyers approach from several
 * angles, and stratified coverage across those angles is what stops the
 * instrument from flattering (all brand-direct) or burying (all definitional)
 * the client. So an unlabelled seed fans out across the patterns that fit it
 * rather than collapsing to whichever one matched first.
 */
function inferPatterns(seed, vars) {
  const t = String(seed.term || '').toLowerCase();
  const out = new Set();

  // Explicit shape signals win, and are measured on their own terms.
  const isQuestion = /^(what|how|why|when|does|is|can) /.test(t);
  const isDefinitional = /^what is|^what are|^how does/.test(t);
  const isProblem = /\b(not |won'?t |stopped |broken|leak|fail|error|noise|smell)/.test(t);
  const isComparison = /\bvs\b|\bversus\b|alternative|compare|better than/.test(t);

  if (isComparison) out.add('comparison');
  if (isDefinitional) out.add('definitional');
  if (isProblem) out.add('problem');

  // A commercial service/product seed gets the full commercial spread. These
  // are the prompts where a vendor can actually be named, so they carry the
  // measurement.
  if (!isQuestion && !isProblem && !isComparison) {
    out.add('category_discovery');
    out.add('attribute');
    if (vars.city) out.add('local');
  }

  // Brand-direct only when the seed genuinely names the brand - otherwise the
  // set fills with questions the client is guaranteed to win, which inflates
  // visibility without measuring anything.
  if (vars.brand && t.includes(String(vars.brand).toLowerCase())) out.add('brand_direct');

  // A comparison seed still needs both sides declared to be fillable.
  if (out.has('comparison') && !(vars.brand && vars.competitor)) out.delete('comparison');

  if (!out.size) out.add('category_discovery');
  return [...out];
}

function fill(template, vars) {
  return template.replace(/\{(\w+)\}/g, (m, key) => (vars[key] ? String(vars[key]) : m));
}

/**
 * Reduce a harvested seed to the bare noun phrase the templates expect.
 *
 * Seeds arrive as whatever people type into a search box - "what is a heat
 * pump", "furnace won't turn on?", "acme hvac vs comfort pros". Inserted raw,
 * a template produces "What is what is a heat pump?", which is not a question
 * any human asks and therefore not a valid measurement.
 */
export function nounPhrase(term) {
  let t = String(term || '').trim().replace(/\?+$/, '');
  // Strip a leading interrogative stem - the template supplies its own.
  // Keep the article: "what is a heat pump" -> "a heat pump", so the template
  // yields "What is a heat pump?" rather than "What is heat pump?".
  t = t.replace(/^(what|which)\s+(is|are|was|were)\s+/i, '');
  t = t.replace(/^(how)\s+(do|does|did)\s+(i|you|we)?\s*/i, '');
  t = t.replace(/^(how|why|when|where|who)\s+(do|does|did|is|are|can|should)\s*/i, '');
  t = t.replace(/^(best|top|cheapest|affordable)\s+/i, '');
  // For an "X vs Y" seed the measurable topic is X, not the whole phrase.
  const vs = t.match(/^(.*?)\s+(?:vs\.?|versus)\s+/i);
  if (vs && vs[1].trim()) t = vs[1].trim();
  return t.trim() || String(term || '').trim();
}

function normalizeText(text) {
  return String(text || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function round6(n) { return Math.round(Number(n || 0) * 1e6) / 1e6; }

function countBy(items, field) {
  return items.reduce((acc, i) => { acc[i[field]] = (acc[i[field]] || 0) + 1; return acc; }, {});
}
