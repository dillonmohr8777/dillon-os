'use strict';

/**
 * Site Quality Score (SQS) — how good is the prospect's CURRENT website?
 *
 * This exists because the qualify scorer in ./scorer.js can only detect decay.
 * A prospect with a genuinely excellent site scores zero decay there, then picks
 * up review/vertical/ad points and lands in `queued_build` anyway — so the
 * factory spends a Tier-A build pitching a redesign to someone whose site is
 * already better than the mirror. That is Mac's 2026-08-05 objection: "some of
 * these already have really great websites."
 *
 * SQS is the missing half. High SQS = their site is good = do NOT pitch a rebuild.
 * The rebuild decision itself lives in ./opportunity.js, which consumes this.
 *
 * Design rules:
 *
 * 1. Unknown is not zero. Every dimension reports `evidence: 'measured' |
 *    'partial' | 'unknown'`. A dimension with no evidence is dropped from the
 *    weighted mean instead of scoring 0, and it lowers `confidence`. A site we
 *    could not render must never be graded "terrible" by default — that is how
 *    you mail a redesign to a business with a great site behind a bot wall.
 * 2. Grade in tiers. Tier 0 uses raw HTML + headers only (no browser, cheap
 *    enough for hundreds of candidates). Tier 1 adds rendered-DOM evidence.
 *    Tier 2 adds a human/agent taste verdict. Later tiers overwrite earlier
 *    findings for the same dimension; they never silently merge.
 * 3. Every point is traceable. `findings[]` carries a signed delta, the
 *    dimension, and a plain-English reason, so a prospect note can show its work.
 *
 * Scale anchor (calibrated against the Philly-100 corpus in
 * _os/automation/fixtures/prospects/philly-100-completed.json):
 *
 *   85–100  elite — modern, fast, well-structured. Never pitch a rebuild.
 *   70– 84  strong — good site with gaps. Pitch CRO / landing pages, not a rebuild.
 *   50– 69  dated but functional. Rebuild is a real upgrade; lead with proof.
 *   30– 49  clearly decayed. Prime rebuild target.
 *    0– 29  broken or effectively absent. Prime rebuild target.
 */

const CURRENT_YEAR_FALLBACK = 2026;

/**
 * Score at or above which a site would normally be left alone. An unrendered
 * grade that reaches it is reported as `unconfirmed` rather than `strong`, so no
 * prospect is ever skipped on markup evidence alone — the Tier 1 render is what
 * earns that verdict.
 */
const TIER0_SCORE_CEILING = 70;

/**
 * Below this share of the rubric there is not enough evidence to call it a
 * grade at all, and gradeSite() returns a null score instead of a number that
 * looks authoritative.
 */
const MIN_GRADEABLE_CONFIDENCE = 0.25;

/**
 * Six dimensions, weighted. Weights sum to 100 but are renormalized over
 * whichever dimensions actually have evidence, so a Tier 0 grade and a Tier 1
 * grade stay on the same 0–100 scale.
 */
const DIMENSIONS = {
  foundation: {
    weight: 20,
    label: 'Foundation',
    about: 'HTTPS, resolves, no server errors, real domain, no parked/expired page',
  },
  mobile: {
    weight: 22,
    label: 'Mobile',
    about: 'Viewport meta, responsive layout, no horizontal overflow, tap-target sizing',
  },
  performance: {
    weight: 16,
    label: 'Performance',
    about: 'Response time, payload weight, image discipline, render-blocking bulk',
  },
  craft: {
    weight: 18,
    label: 'Design craft',
    about: 'Modern layout primitives, type scale, palette depth, custom vs default styling',
  },
  content: {
    weight: 14,
    label: 'Content & conversion',
    about: 'Copy depth, visible phone/CTA, hours, working contact path',
  },
  discoverability: {
    weight: 10,
    label: 'Discoverability',
    about: 'Title, meta description, schema.org, OG tags, alt text, freshness',
  },
};

const BANDS = [
  { min: 85, band: 'elite', rebuildable: false },
  { min: 70, band: 'strong', rebuildable: false },
  { min: 50, band: 'dated', rebuildable: true },
  { min: 30, band: 'decayed', rebuildable: true },
  { min: 0, band: 'broken', rebuildable: true },
];

function num(v, d = null) {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}

function isBool(v) {
  return v === true || v === false;
}

function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n));
}

/**
 * One dimension's running tally. Starts from a neutral baseline and moves in
 * both directions, so a dimension can genuinely earn its way to 100 (which a
 * decay-only model can never do).
 */
/**
 * Baseline 50, not 60. Calibration run over 500 Philadelphia prospects
 * (2026-08-06) showed a 60 baseline made "no evidence either way" a passing
 * grade: the median site landed at 76 and nothing at all qualified for a
 * rebuild. Table stakes should sit mid-scale so a site has to earn its way up.
 */
function dimension(key, baseline = 50) {
  return {
    key,
    score: baseline,
    evidence: 'unknown',
    signals: 0,
    findings: [],
    /** Record a signed adjustment with a reason. */
    add(delta, reason, { strong = true } = {}) {
      this.score = clamp(this.score + delta, 0, 100);
      this.signals += 1;
      if (strong && this.evidence !== 'measured') this.evidence = 'measured';
      else if (!strong && this.evidence === 'unknown') this.evidence = 'partial';
      this.findings.push({ dimension: key, delta, reason });
      return this;
    },
    /** Mark that we looked and found nothing conclusive. */
    weak(reason) {
      if (this.evidence === 'unknown') this.evidence = 'partial';
      this.findings.push({ dimension: key, delta: 0, reason });
      return this;
    },
  };
}

/* ------------------------------------------------------------------ *
 * Dimension graders. Each takes the audit object and returns a
 * dimension tally. They read only what the audit actually provides.
 * ------------------------------------------------------------------ */

function gradeFoundation(a) {
  const d = dimension('foundation');
  const url = String(a.url || '');

  if (a.reachable === false) {
    // A dead domain is a real, gradeable finding — not missing evidence.
    d.add(-60, `domain does not resolve or refused connection${a.error ? ` (${a.error})` : ''}`);
    return d;
  }

  const status = num(a.httpStatus);
  if (status != null) {
    if (status >= 500) d.add(-45, `server error ${status}`);
    else if (status >= 400) d.add(-40, `client error ${status}`);
    else if (status >= 300) d.add(-4, `homepage redirects (${status})`);
    else d.add(3, `homepage returns ${status}`);
  }

  if (isBool(a.https)) {
    if (a.https) d.add(5, 'served over HTTPS');
    else d.add(-30, 'no HTTPS — browsers mark it "Not secure"');
  } else if (url) {
    // An http:// URL in the candidate list is a weak but real negative. An
    // https:// one proves nothing — nobody fetched it — so record nothing and
    // let this dimension stay `unknown`. Counting it as measured evidence let a
    // completely unaudited prospect score 58/100 at 20% confidence, which is how
    // an ungraded site sneaks past a routing threshold.
    if (/^http:/i.test(url)) d.add(-30, 'listed URL is http:// — no HTTPS', { strong: false });
  }

  if (a.httpsRedirect === false && (a.https === true || /^https:/i.test(url))) {
    d.add(-5, 'http:// does not redirect to https://', { strong: false });
  }
  if (a.brokenTls === true) {
    d.add(-40, `TLS is broken (${a.error || 'invalid certificate'}) — browsers show a full-page security warning`);
  }
  if (a.mixedContent === true) d.add(-10, 'mixed content — insecure assets on a secure page');
  if (a.parked === true) d.add(-45, 'parked / for-sale / placeholder page, not a real site');
  if (a.wwwMismatch === true) d.add(-4, 'www and root hostnames disagree', { strong: false });

  // A builder that pins the whole site to one platform's ceiling.
  const plat = String(a.platform || '').toLowerCase();
  if (/wix|godaddy|weebly|squarespace|wordpress|shopify|webflow|duda|bizland|homestead|networksolutions/.test(plat)) {
    if (/bizland|homestead|networksolutions|godaddy|weebly/.test(plat)) {
      d.add(-12, `legacy site builder detected (${plat})`);
    } else {
      d.add(2, `modern platform detected (${plat})`, { strong: false });
    }
  }

  if (a.frameset === true) d.add(-25, 'uses HTML framesets — pre-2005 markup');
  if (a.flash === true) d.add(-20, 'references Flash content');

  // Unlike design craft, foundation is fully observable from a single fetch: we
  // know for certain whether the site is HTTPS, returns 200, is parked, or ships
  // framesets. So when every check passes, say so — otherwise a flawless
  // foundation topped out at 58 and dragged down the whole grade of a healthy
  // site, purely because the baseline assumes ignorance we do not have here.
  const faultFree =
    a.reachable === true &&
    (status == null || (status >= 200 && status < 300)) &&
    a.https === true &&
    a.parked !== true &&
    a.frameset !== true &&
    a.flash !== true &&
    a.brokenTls !== true &&
    a.mixedContent !== true;
  if (faultFree) d.add(12, 'clean foundation: HTTPS, 200, no legacy markup, no mixed content');

  return d;
}

function gradeMobile(a) {
  const d = dimension('mobile');

  if (isBool(a.hasViewport)) {
    if (a.hasViewport) d.add(9, 'responsive viewport meta present');
    else d.add(-42, 'no viewport meta — page renders desktop-width on phones');
  }

  if (isBool(a.tableLayout)) {
    if (a.tableLayout) d.add(-22, 'table-based page layout');
  }

  const overflow = a.horizontalOverflow;
  if (overflow && typeof overflow === 'object') {
    const bad = Object.entries(overflow).filter(([, v]) => v === true).map(([k]) => k);
    if (bad.length) d.add(-10 * Math.min(2, bad.length), `horizontal overflow at ${bad.join(', ')}`);
    else d.add(8, 'no horizontal overflow at phone/tablet/desktop');
  }

  if (isBool(a.usesMediaQueries)) {
    if (a.usesMediaQueries) d.add(6, 'stylesheet carries media queries');
    else d.add(-14, 'no media queries — layout is fixed-width');
  }

  if (isBool(a.usesModernLayout)) {
    if (a.usesModernLayout) d.add(6, 'flexbox/grid layout', { strong: false });
  }

  const fixedPx = num(a.fixedWidthPx);
  if (fixedPx != null && fixedPx >= 900) d.add(-12, `hard-coded ${fixedPx}px page width`);

  if (isBool(a.tapTargetsOk)) {
    if (a.tapTargetsOk === false) d.add(-8, 'tap targets smaller than 44px', { strong: false });
  }

  const minFont = num(a.minBodyFontPx);
  if (minFont != null && minFont > 0 && minFont < 13) {
    d.add(-6, `body text as small as ${minFont}px`, { strong: false });
  }
  return d;
}

function gradePerformance(a) {
  const d = dimension('performance');

  const ttfb = num(a.responseMs);
  if (ttfb != null) {
    if (ttfb > 6000) d.add(-30, `homepage responded in ${ttfb}ms`);
    else if (ttfb > 3000) d.add(-18, `slow first response: ${ttfb}ms`);
    else if (ttfb > 1500) d.add(-8, `sluggish first response: ${ttfb}ms`);
    else if (ttfb <= 600) d.add(10, `fast first response: ${ttfb}ms`);
    else d.add(4, `acceptable first response: ${ttfb}ms`);
  }

  const load = num(a.loadMs);
  if (load != null) {
    if (load > 8000) d.add(-22, `full load ${load}ms`);
    else if (load > 5000) d.add(-14, `full load ${load}ms`);
    else if (load > 3000) d.add(-6, `full load ${load}ms`);
    else d.add(8, `full load ${load}ms`);
  }

  const bytes = num(a.transferBytes);
  if (bytes != null) {
    const mb = bytes / 1_000_000;
    if (mb > 8) d.add(-20, `${mb.toFixed(1)}MB homepage payload`);
    else if (mb > 4) d.add(-10, `${mb.toFixed(1)}MB homepage payload`);
    else if (mb < 1.5) d.add(6, `lean ${mb.toFixed(1)}MB payload`);
  }

  const oversized = num(a.oversizedImages);
  if (oversized != null) {
    if (oversized >= 5) d.add(-12, `${oversized} images shipped far larger than displayed`);
    else if (oversized >= 2) d.add(-6, `${oversized} oversized images`);
  }

  if (isBool(a.usesModernImageFormats)) {
    if (a.usesModernImageFormats) d.add(6, 'serves webp/avif', { strong: false });
    else d.add(-5, 'no webp/avif — all legacy image formats', { strong: false });
  }
  if (isBool(a.usesLazyLoading) && a.usesLazyLoading) {
    d.add(3, 'lazy-loads offscreen images', { strong: false });
  }

  const reqs = num(a.requestCount);
  if (reqs != null && reqs > 120) d.add(-8, `${reqs} network requests on the homepage`, { strong: false });
  return d;
}

function gradeCraft(a) {
  const d = dimension('craft');
  // Design craft cannot be judged from source HTML. Tier 0 has no computed
  // palette, no rendered type scale, no screenshot — so its signals are logged
  // as weak (half weight, honest confidence) and only real Tier 1 palette/font
  // measurements or a Tier 2 taste score make this dimension "measured".
  // Before this, every Tier 0 grade reported craft=78 at 100% confidence, which
  // made a plain WordPress page look identical to a beautifully designed one.
  const rendered = Array.isArray(a.fonts) && a.fonts.length > 0;
  const soft = (delta, reason) => (rendered ? d.add(delta, reason) : d.add(delta * 0.5, reason, { strong: false }));

  const fonts = Array.isArray(a.fonts) ? a.fonts : [];
  if (fonts.length) {
    const families = fonts.map((f) => String(f.family || f || '').toLowerCase());
    const defaultsOnly = families.every((f) =>
      /^(times|times new roman|serif|sans-serif|arial|helvetica|helvetica neue|verdana|tahoma|courier|ms sans serif|-apple-system|system-ui)$/.test(f)
    );
    if (defaultsOnly) d.add(-18, 'browser-default typography only — no intentional typeface');
    else d.add(10, `intentional typeface: ${fonts[0].family || fonts[0]}`);

    if (families.some((f) => /comic sans|papyrus|impact|brush script/.test(f))) {
      d.add(-12, 'novelty typeface in the type stack');
    }

    const maxSize = Math.max(0, ...fonts.map((f) => num(f.maxSizePx, 0)));
    if (maxSize > 0) {
      if (maxSize >= 44) d.add(8, `display type reaches ${Math.round(maxSize)}px — real hierarchy`);
      else if (maxSize < 26) d.add(-10, `largest type is only ${Math.round(maxSize)}px — flat hierarchy`);
    }
    if (fonts.length > 4) d.add(-5, `${fonts.length} typefaces in play`, { strong: false });
  }

  const palette = Array.isArray(a.palette) ? a.palette : [];
  if (palette.length) {
    const hexes = palette.map((p) => String(p.hex || p || '').toUpperCase());
    const distinct = new Set(hexes).size;
    if (distinct <= 2) d.add(-14, 'effectively monochrome — no brand color in the palette');
    else if (distinct >= 5) d.add(8, `${distinct} distinct surface colors — considered palette`);
    const allGrey = hexes.every((h) => /^#([0-9A-F])\1([0-9A-F])\3([0-9A-F])\5$/.test(h) || /^#(FF|F|000|FFF)/.test(h));
    if (allGrey && distinct <= 3) d.add(-6, 'palette is grey/black/white only', { strong: false });
  }

  if (isBool(a.usesModernLayout)) {
    if (a.usesModernLayout) soft(8, 'CSS grid/flex layout — modern construction');
    else soft(-12, 'no grid/flex — float or table construction');
  }
  if (isBool(a.usesCustomProperties) && a.usesCustomProperties) {
    d.add(4, 'CSS custom properties — maintained design system', { strong: false });
  }
  if (isBool(a.inlineStyleHeavy) && a.inlineStyleHeavy) {
    soft(-8, 'layout driven by inline style attributes');
  }
  if (isBool(a.hasHeroImage)) {
    if (a.hasHeroImage) soft(6, 'real hero imagery above the fold');
    else if (!a.renderPending) soft(-8, 'no hero image — text-only opening');
  }

  const stock = num(a.stockImageRatio);
  if (stock != null && stock > 0.6) d.add(-8, 'homepage imagery reads as stock', { strong: false });

  // Tier 2 human/agent taste verdict, 1–5. Overrides nothing; it nudges hard.
  const taste = num(a.tasteScore);
  if (taste != null) {
    const map = { 1: -24, 2: -12, 3: 0, 4: 14, 5: 24 };
    const delta = map[Math.round(clamp(taste, 1, 5))] ?? 0;
    d.add(delta, `taste pass rated ${taste}/5${a.tasteNote ? `: ${a.tasteNote}` : ''}`);
  }
  return d;
}

function gradeContent(a) {
  const d = dimension('content');
  // On a client-rendered page, absence in the source proves nothing. Keep the
  // positives, hold the negatives, and let Tier 1 settle it.
  const pending = a.renderPending === true && a.tier < 1;
  const miss = (delta, reason) =>
    pending
      ? d.weak(`${reason} — unconfirmed, page renders client-side`)
      : d.add(delta, reason);

  const words = num(a.wordCount);
  if (words != null && !pending) {
    if (words < 80) d.add(-26, `only ${words} words on the homepage`);
    else if (words < 200) d.add(-14, `thin homepage copy (${words} words)`);
    else if (words > 450) d.add(10, `substantial homepage copy (${words} words)`);
    else d.add(4, `adequate homepage copy (${words} words)`);
  } else if (words != null && pending) {
    if (words > 450) d.add(10, `substantial homepage copy (${words} words)`);
    else d.weak(`only ${words} words in source, but the page renders client-side — needs Tier 1`);
  }

  if (isBool(a.phoneVisible)) {
    if (a.phoneVisible) d.add(7, 'phone number on the homepage');
    else miss(-16, 'no phone number on the homepage');
  }
  if (isBool(a.clickToCall)) {
    if (a.clickToCall) d.add(6, 'tap-to-call link present');
    else if (!pending) d.add(-6, 'phone is not a tel: link', { strong: false });
  }
  if (isBool(a.hasCta)) {
    if (a.hasCta) d.add(6, 'clear primary call to action');
    else miss(-14, 'no obvious call to action');
  }
  if (isBool(a.hoursVisible)) {
    if (a.hoursVisible) d.add(5, 'hours published');
    else if (!pending) d.add(-5, 'no hours published', { strong: false });
  }
  if (isBool(a.hasContactPath)) {
    if (a.hasContactPath) d.add(4, 'reachable contact form or address');
    else miss(-10, 'no contact form or address found');
  }
  if (isBool(a.hasBookingFlow) && a.hasBookingFlow) {
    d.add(8, 'online booking / ordering flow');
  }

  const brokenLinks = num(a.brokenLinks);
  if (brokenLinks != null && brokenLinks > 0) {
    d.add(-Math.min(14, 4 * brokenLinks), `${brokenLinks} broken link(s)`);
  }
  if (isBool(a.underConstruction) && a.underConstruction) {
    d.add(-20, '"under construction" or placeholder copy still live');
  }
  return d;
}

function gradeDiscoverability(a, { currentYear }) {
  const d = dimension('discoverability');

  if (isBool(a.hasTitle)) {
    if (a.hasTitle) d.add(3, 'page title present');
    else d.add(-14, 'no page title');
  }
  if (isBool(a.hasMetaDescription)) {
    if (a.hasMetaDescription) d.add(6, 'meta description present');
    else d.add(-12, 'no meta description');
  }

  const schema = num(a.schemaCount);
  if (schema != null) {
    if (schema >= 2) d.add(12, `${schema} schema.org blocks`);
    else if (schema === 1) d.add(6, 'one schema.org block');
    else d.add(-12, 'no schema.org structured data');
  }
  if (isBool(a.hasLocalBusinessSchema) && a.hasLocalBusinessSchema) {
    d.add(6, 'LocalBusiness schema — GBP-aligned');
  }
  if (isBool(a.hasOgTags)) {
    if (a.hasOgTags) d.add(5, 'Open Graph tags — shares render properly');
    else d.add(-6, 'no Open Graph tags — link previews are blank');
  }

  const altRatio = num(a.altTextRatio);
  const imgs = num(a.imageCount, 0);
  // Alt-text ratio over 2 images is noise, and on a client-rendered page the
  // images are not in the source at all.
  if (altRatio != null && imgs >= 3 && !(a.renderPending === true && a.tier < 1)) {
    if (altRatio >= 0.8) d.add(6, 'nearly all images have alt text');
    else if (altRatio < 0.3) d.add(-8, 'most images have no alt text');
  }

  const year = num(a.copyrightYear);
  if (year != null && year > 1990) {
    const age = currentYear - year;
    if (age >= 5) d.add(-16, `copyright still says ${year} (${age} years stale)`);
    else if (age >= 3) d.add(-10, `copyright says ${year}`);
    else if (age <= 1) d.add(6, `copyright current (${year})`);
  }
  if (isBool(a.hasSitemap) && a.hasSitemap) d.add(3, 'sitemap.xml present', { strong: false });
  if (isBool(a.noindex) && a.noindex) d.add(-20, 'homepage is noindex — invisible to search');
  return d;
}

/* ------------------------------------------------------------------ */

/**
 * Grade one audited site.
 *
 * @param {object} audit  Output of lib/site-audit.js (any tier), or a
 *                        hand-authored object with the same field names.
 * @param {object} [opts]
 * @param {number} [opts.currentYear]  Injected for deterministic tests.
 * @param {object} [opts.weights]      Dimension weight overrides (calibration).
 * @returns {{score:number, band:string, rebuildable:boolean, confidence:number,
 *            tier:number, dimensions:object, findings:Array, unknown:string[],
 *            headline:string}}
 */
function gradeSite(audit, opts = {}) {
  const a = audit && typeof audit === 'object' ? audit : {};
  const currentYear = num(opts.currentYear, null) ?? num(a.currentYear, null) ?? CURRENT_YEAR_FALLBACK;
  const weights = { ...opts.weights };

  // An unreachable site is a complete verdict, not thin evidence. It only lights
  // up one dimension, so the confidence floor below would otherwise refuse to
  // grade it — and a dead domain is the single most actionable finding the whole
  // pipeline can produce.
  if (a.reachable === false) {
    const fd = gradeFoundation(a);
    return {
      score: Math.round(fd.score * 0.25),
      band: 'broken',
      rebuildable: true,
      provisional: false,
      capped: false,
      hard_faults: [`domain does not resolve${a.error ? ` (${a.error})` : ''}`],
      confidence: 1,
      tier: num(a.tier, 0),
      url: a.url || '',
      dimensions: Object.fromEntries(
        Object.entries(DIMENSIONS).map(([k, spec]) => [
          k,
          {
            label: spec.label,
            about: spec.about,
            score: k === 'foundation' ? Math.round(fd.score) : 0,
            weight: spec.weight,
            appliedWeight: k === 'foundation' ? spec.weight : 0,
            evidence: k === 'foundation' ? 'measured' : 'moot',
            signals: k === 'foundation' ? fd.signals : 0,
          },
        ])
      ),
      findings: fd.findings,
      unknown: [],
      headline:
        `Site does not load${a.error ? ` (${a.error})` : ''}. Nothing to grade and nothing to lose — ` +
        'the strongest possible rebuild case. Verify the URL is current before pitching.',
    };
  }

  const tallies = {
    foundation: gradeFoundation(a),
    mobile: gradeMobile(a),
    performance: gradePerformance(a),
    craft: gradeCraft(a),
    content: gradeContent(a),
    discoverability: gradeDiscoverability(a, { currentYear }),
  };

  // Weighted mean over dimensions that actually have evidence.
  let weighted = 0;
  let weightSum = 0;
  const unknown = [];
  const dimensions = {};

  for (const [key, spec] of Object.entries(DIMENSIONS)) {
    const t = tallies[key];
    const w = num(weights[key], null) ?? spec.weight;
    // 'partial' evidence counts at half weight: we looked, we learned a little.
    const factor = t.evidence === 'measured' ? 1 : t.evidence === 'partial' ? 0.5 : 0;
    dimensions[key] = {
      label: spec.label,
      about: spec.about,
      score: Math.round(t.score),
      weight: w,
      appliedWeight: Math.round(w * factor * 10) / 10,
      evidence: t.evidence,
      signals: t.signals,
    };
    if (factor === 0) {
      unknown.push(key);
      continue;
    }
    weighted += t.score * w * factor;
    weightSum += w * factor;
  }

  const totalWeight = Object.entries(DIMENSIONS).reduce(
    (s, [k, spec]) => s + (num(weights[k], null) ?? spec.weight),
    0
  );
  // Confidence is how much of the rubric we managed to actually measure.
  const confidence = totalWeight > 0 ? Math.round((weightSum / totalWeight) * 100) / 100 : 0;

  // With no evidence at all, refuse to grade. `null` is honest; 0 is a lie that
  // would route a possibly-great site straight into a rebuild pitch.
  // A number derived from a tenth of the rubric is not a grade, it is noise that
  // downstream thresholds will happily act on. Refuse to emit one.
  let score = weightSum > 0 && confidence >= MIN_GRADEABLE_CONFIDENCE
    ? Math.round(weighted / weightSum)
    : null;

  // Tier 0 sees source HTML, never pixels. It can prove a site is BAD (no
  // viewport, no HTTPS, dead domain, table layout) but it cannot prove a site is
  // GOOD — a dated 2014 contractor template and a beautifully art-directed build
  // are indistinguishable in markup. The 2026-08-06 calibration run showed
  // exactly that failure: dated HVAC and roofing sites scored 80-82 and got
  // routed away from a rebuild purely for having a viewport tag and a phone
  // number.
  //
  // So an unrendered grade is capped and marked provisional. Certifying a site
  // as strong/elite — the decision that makes us walk away from a prospect —
  // requires rendered evidence.
  const rendered = num(a.tier, 0) >= 1 || (Array.isArray(a.fonts) && a.fonts.length > 0);
  const provisional = score != null && !rendered;

  let bandEntry = score == null ? null : BANDS.find((b) => score >= b.min);

  // The score itself is left alone — distorting the number to force a cap made
  // it harder to read and to calibrate. Instead the *claim* is capped: an
  // unrendered grade may never report a band that means "do not rebuild", and
  // `capped` marks any provisional grade clean enough that walking away would be
  // the natural call. Routing turns that into a `verify` verdict rather than
  // guessing in either direction.
  const capped = provisional && bandEntry != null && bandEntry.rebuildable === false;
  if (capped) {
    bandEntry = { band: 'unconfirmed', rebuildable: null };
  }
  const findings = Object.values(tallies).flatMap((t) => t.findings);

  /**
   * Faults Tier 0 can prove outright, as opposed to score pressure it merely
   * infers. The asymmetry at the heart of this grader cuts both ways: markup
   * cannot certify a site as good, but it *can* certify specific defects — a
   * missing viewport tag either is or is not in the source.
   *
   * Only these justify letting an unrendered grade queue a build. A `rebuild`
   * verdict assembled purely from soft pressure (slowish response, thinnish
   * copy, no schema) is a hypothesis, and the caller should treat it as one.
   */
  const hardFaults = [];
  if (a.reachable === false) hardFaults.push('domain does not resolve');
  if (a.parked === true) hardFaults.push('parked or placeholder page');
  if (a.hasViewport === false) hardFaults.push('no responsive viewport');
  if (a.https === false) hardFaults.push('no HTTPS');
  if (a.brokenTls === true) hardFaults.push('broken TLS certificate');
  if (a.frameset === true) hardFaults.push('HTML framesets');
  if (a.flash === true) hardFaults.push('Flash content');
  if (a.tableLayout === true) hardFaults.push('table-based layout');
  if (a.underConstruction === true) hardFaults.push('under-construction placeholder copy');
  const st = num(a.httpStatus);
  if (st != null && st >= 400) hardFaults.push(`homepage returns ${st}`);
  if (a.horizontalOverflow && Object.values(a.horizontalOverflow).some((v) => v === true)) {
    hardFaults.push('horizontal overflow on a real viewport');
  }

  return {
    score,
    band: bandEntry ? bandEntry.band : 'ungraded',
    rebuildable: bandEntry ? bandEntry.rebuildable : null,
    provisional,
    capped,
    hard_faults: hardFaults,
    confidence,
    tier: num(a.tier, 0),
    url: a.url || '',
    dimensions,
    findings: findings.sort((x, y) => Math.abs(y.delta) - Math.abs(x.delta)),
    unknown,
    headline: headlineFor(score, bandEntry, confidence, findings, { provisional, capped }),
  };
}

function headlineFor(score, bandEntry, confidence, findings, { provisional = false, capped = false } = {}) {
  if (score == null) return 'Ungraded — no usable evidence collected. Re-audit before deciding.';
  const worst = findings
    .filter((f) => f.delta < 0)
    .slice(0, 2)
    .map((f) => f.reason);
  const best = findings
    .filter((f) => f.delta > 0)
    .slice(0, 2)
    .map((f) => f.reason);
  const conf = confidence < 0.55 ? ' (low confidence — deepen the audit)' : '';
  if (capped) {
    return `${score}/100 unconfirmed${conf}. Markup checks found no disqualifying fault, but the design was never rendered, ` +
      'so this is not yet a decision. Run the Tier 1 audit before skipping this prospect.';
  }
  if (provisional) {
    return `${score}/100 ${bandEntry.band} (provisional — Tier 0 only)${conf}. Worst: ${
      findings.filter((f) => f.delta < 0).slice(0, 2).map((f) => f.reason).join('; ') || 'none recorded'
    }.`;
  }
  if (!bandEntry.rebuildable) {
    return `${score}/100 ${bandEntry.band}${conf}. Do not pitch a rebuild. Strengths: ${
      best.join('; ') || 'none recorded'
    }.`;
  }
  return `${score}/100 ${bandEntry.band}${conf}. Rebuild is a real upgrade. Worst: ${
    worst.join('; ') || 'none recorded'
  }.`;
}

/**
 * Merge a deeper-tier audit over a shallower one. Later tiers win per field,
 * but a later tier never erases a field it did not measure.
 */
function mergeAudits(...audits) {
  const out = {};
  for (const a of audits) {
    if (!a || typeof a !== 'object') continue;
    for (const [k, v] of Object.entries(a)) {
      if (v === undefined || v === null) continue;
      out[k] = v;
    }
  }
  out.tier = Math.max(0, ...audits.filter(Boolean).map((a) => num(a.tier, 0)));
  return out;
}

module.exports = {
  gradeSite,
  mergeAudits,
  DIMENSIONS,
  BANDS,
  TIER0_SCORE_CEILING,
  MIN_GRADEABLE_CONFIDENCE,
};
