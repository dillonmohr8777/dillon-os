'use strict';

/**
 * Token derivation and arch-skin assignment for the arch generation.
 *
 * Spec: _templates/arch-factory/ARCH-GENERATION.md
 *
 * Two jobs, both of which the deployed batch 3/4 sites do and the old profile
 * factory did badly:
 *
 * 1. **Pick a palette that belongs to the business**, derived from colours their
 *    own site declares where possible, and falling back to a vertical-appropriate
 *    family rather than a generic blue.
 * 2. **Decide `--on-accent` by measuring contrast**, not by hoping. The reference
 *    page carries a comment saying white is the default and the token is emitted
 *    only when the accent is too light for white to reach AA — so this has to be
 *    real WCAG maths, otherwise a light-accent brand ships unreadable buttons.
 */

/** The 21 skins shipped in reference/engine.css, grouped by what they suit. */
const ARCH_SKINS = {
  industrial: ['circuit-live', 'forge-iron', 'field-grid', 'build-blocks', 'poured-slab'],
  medical: ['clinic-orbit', 'porcelain', 'soft-arch', 'one-on-one'],
  wellness: ['fresh-bloom', 'stone-garden', 'zen-strata', 'aurora-drift'],
  trades: ['picket-run', 'ridge-line', 'pitch-shift', 'kinetic-blueprint'],
  professional: ['case-file', 'impact-dossier', 'gilded-sheen'],
  fluid: ['aqua-lane', 'liquid-suite'],
};

const ALL_SKINS = Object.values(ARCH_SKINS).flat();

/** Which skin family suits which vertical group. */
const GROUP_TO_FAMILY = {
  'home-services': 'trades',
  industrial: 'industrial',
  medical: 'medical',
  'spa-wellness': 'wellness',
  legal: 'professional',
  auto: 'industrial',
  retail: 'wellness',
  food: 'wellness',
  other: 'professional',
};

/**
 * Display/text font pairs observed on the live sites, grouped to match skin
 * families so a dental practice does not get a stencil face.
 */
const FONT_PAIRS = {
  industrial: [
    ['Archivo', 'Instrument Sans'],
    ['Anton', 'Instrument Sans'],
    ['Bebas Neue', 'Work Sans'],
  ],
  medical: [
    ['Fraunces', 'Instrument Sans'],
    ['Bricolage Grotesque', 'Instrument Sans'],
    ['Outfit', 'Work Sans'],
  ],
  wellness: [
    ['Bricolage Grotesque', 'Instrument Sans'],
    ['Fraunces', 'Work Sans'],
  ],
  trades: [
    ['Bebas Neue', 'Instrument Sans'],
    ['Archivo', 'Work Sans'],
    ['Anton', 'Work Sans'],
  ],
  professional: [
    ['Fraunces', 'Instrument Sans'],
    ['Archivo', 'Instrument Sans'],
  ],
  fluid: [['Bricolage Grotesque', 'Work Sans']],
};

/**
 * Fallback accent families by skin family, used when the prospect's own site
 * declares nothing usable. Drawn from the accents observed live (#176B5E teal,
 * #9C4E36 rust, #0C7894 cyan, #D7A243 gold, #DE6B3F orange) so a generated site
 * still sits inside the batch's palette range.
 */
const FALLBACK_ACCENTS = {
  industrial: ['#0C7894', '#9C4E36', '#B4552C'],
  medical: ['#176B5E', '#2C6E8F', '#3A6EA5'],
  wellness: ['#176B5E', '#6E8F4A', '#D7A243'],
  trades: ['#DE6B3F', '#9C4E36', '#B4552C'],
  professional: ['#2C4A6E', '#176B5E', '#8A6A2F'],
  fluid: ['#0C7894', '#2C6E8F'],
};

/* ------------------------------------------------------------------ *
 * Colour maths — sRGB, relative luminance, WCAG contrast ratio
 * ------------------------------------------------------------------ */

function hexToRgb(hex) {
  let h = String(hex || '').trim().replace(/^#/, '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}

function rgbToHex([r, g, b]) {
  return '#' + [r, g, b].map((n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0')).join('').toUpperCase();
}

/** WCAG relative luminance. */
function luminance(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  const [r, g, b] = rgb.map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio, 1 to 21. */
function contrast(a, b) {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/**
 * Text colour for a surface: white or near-black, whichever reaches further.
 * Returns both the choice and its ratio so a caller can flag a surface that
 * fails AA on both, which means the surface colour itself is wrong.
 */
function onColor(surface) {
  const white = contrast(surface, '#FFFFFF');
  const black = contrast(surface, '#090909');
  const pick = white >= black ? '#FFFFFF' : '#090909';
  return { color: pick, ratio: Math.round(Math.max(white, black) * 100) / 100, passesAA: Math.max(white, black) >= 4.5 };
}

function mix(a, b, t) {
  const ra = hexToRgb(a);
  const rb = hexToRgb(b);
  if (!ra || !rb) return a;
  return rgbToHex(ra.map((v, i) => v + (rb[i] - v) * t));
}

/** Rotate hue for a secondary accent that is related but distinct. */
function shiftHue(hex, deg) {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  let [r, g, b] = rgb.map((v) => v / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  let h = 0;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  h = (h + deg + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const seg = Math.floor(h / 60) % 6;
  const table = [[c, x, 0], [x, c, 0], [0, c, x], [0, x, c], [x, 0, c], [c, 0, x]][seg];
  return rgbToHex(table.map((v) => (v + m) * 255));
}

/* ------------------------------------------------------------------ */

/**
 * Pick the brand accent. Prefers a colour the prospect's own site declares —
 * that is their real brand, and it is the whole reason harvest-lite collects
 * paletteHints — with a saturation floor so a washed-out grey-blue does not
 * become the accent of the whole page.
 */
function pickAccent(paletteHints, family, seed) {
  const hints = Array.isArray(paletteHints) ? paletteHints : [];
  for (const h of hints) {
    const rgb = hexToRgb(h.hex);
    if (!rgb) continue;
    const max = Math.max(...rgb);
    const min = Math.min(...rgb);
    const sat = max === 0 ? 0 : (max - min) / max;
    const lum = luminance(h.hex);
    // Saturated enough to read as a brand colour, and mid-range enough to carry
    // white or black text on a button.
    if (sat >= 0.28 && lum > 0.03 && lum < 0.62) {
      return { accent: h.hex.toUpperCase(), source: 'their site' };
    }
  }
  const pool = FALLBACK_ACCENTS[family] || FALLBACK_ACCENTS.professional;
  return { accent: pool[seed % pool.length], source: 'vertical fallback' };
}

/** Stable per-slug integer, so a rebuild of the same prospect is identical. */
function seedFrom(str) {
  let h = 0;
  for (const ch of String(str)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

/**
 * Derive the full token set for one prospect.
 *
 * @param {object} p       { domain|slug, vertical_group, business_name }
 * @param {object} [opts]  { paletteHints, usedSkins:Set, fontHints }
 */
function deriveTokens(p, opts = {}) {
  const slug = p.slug || p.domain || p.business_name || 'site';
  const seed = seedFrom(slug);
  const family = GROUP_TO_FAMILY[p.vertical_group] || 'professional';

  // One skin per site, no repeats inside a batch.
  const preferred = ARCH_SKINS[family] || ALL_SKINS;
  const used = opts.usedSkins || new Set();
  // Walk the family's skins from a stable offset so the same prospect always
  // gets the same skin, then fall outside the family only if every in-family
  // skin is taken. Twenty-one skins across a 15-site batch means that is rare.
  let skin = null;
  for (let i = 0; i < preferred.length; i++) {
    const candidate = preferred[(seed + i) % preferred.length];
    if (!used.has(candidate)) {
      skin = candidate;
      break;
    }
  }
  if (!skin) skin = ALL_SKINS.find((s) => !used.has(s)) || preferred[seed % preferred.length];
  used.add(skin);

  const { accent, source: accentSource } = pickAccent(opts.paletteHints, family, seed);
  const accent2 = shiftHue(accent, family === 'medical' || family === 'wellness' ? 40 : -35);

  // Paper and ink are tinted toward the accent rather than neutral — the
  // observed range is #EEE9E1 to #F8F4EC, never pure white.
  const paper = mix('#FFFFFF', accent, 0.055);
  const ink = mix('#0B0B0B', accent, 0.18);
  const panel = mix(paper, accent, 0.22);
  const deep = mix('#0A0A0A', accent, 0.28);

  const [display, text] = (FONT_PAIRS[family] || FONT_PAIRS.professional)[
    seed % (FONT_PAIRS[family] || FONT_PAIRS.professional).length
  ];

  // Radius and border weight set the era. Observed: 0/6/26px and 0/1/2px.
  const radii = family === 'industrial' || family === 'trades' ? ['0px', '0px', '6px'] : ['26px', '26px', '6px'];
  const borders = family === 'industrial' || family === 'trades' ? ['1px', '2px', '0px'] : ['0px', '1px', '0px'];

  const onAccent = onColor(accent);
  const onPaper = onColor(paper);
  const onPanel = onColor(panel);
  const onDeep = onColor(deep);

  const warnings = [];
  for (const [name, res] of [['accent', onAccent], ['paper', onPaper], ['panel', onPanel], ['deep', onDeep]]) {
    if (!res.passesAA) warnings.push(`${name} surface only reaches ${res.ratio}:1 — below AA 4.5`);
  }

  return {
    slug,
    arch: skin,
    family,
    tokens: {
      paper,
      ink,
      accent,
      accent2,
      panel,
      deep,
      // Emitted only when white is not the right choice, matching the reference.
      onAccent: onAccent.color === '#FFFFFF' ? null : onAccent.color,
      display,
      text,
      r: radii[seed % radii.length],
      bw: borders[seed % borders.length],
    },
    contrast: {
      accent: onAccent,
      paper: onPaper,
      panel: onPanel,
      deep: onDeep,
    },
    accentSource,
    warnings,
  };
}

module.exports = {
  deriveTokens,
  onColor,
  contrast,
  luminance,
  mix,
  shiftHue,
  hexToRgb,
  rgbToHex,
  pickAccent,
  seedFrom,
  ARCH_SKINS,
  ALL_SKINS,
  GROUP_TO_FAMILY,
  FONT_PAIRS,
  FALLBACK_ACCENTS,
};
