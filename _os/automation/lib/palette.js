'use strict';

/**
 * Derive a site's colour palette from its own verified logo, and refuse to emit
 * one whose text pairs cannot be read.
 *
 * The reference build states the rule plainly: brand colour is "read off each
 * business's own logo" and "mid-tone accents are deepened until they can carry
 * text", with "11 of 11 palettes pass every text pair". That was true because a
 * person checked. This does the same job by measurement, so a batch of 20 built
 * unattended carries the same guarantee.
 *
 * It reads the logo bitmap that lib/logo-audit.js already decoded and cleared,
 * which is why it can trust that transparent pixels are background and every
 * opaque pixel is really part of the mark. Sampling a logo that still had its
 * plate attached would return the plate colour as the brand colour.
 *
 * Contrast is the hard gate, not a preference. Every foreground/background pair
 * in the emitted token set is measured against WCAG 2.1 and darkened until it
 * passes; a pair that cannot be made to pass fails the palette rather than
 * shipping grey-on-grey.
 */

const AA_NORMAL = 4.5;
const AA_LARGE = 3.0;

/* ---------------------------------------------------------- colour space */

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const to255 = (v) => clamp(Math.round(v), 0, 255);

function toHex([r, g, b]) {
  return `#${[r, g, b].map((v) => to255(v).toString(16).padStart(2, '0')).join('')}`;
}

function fromHex(hex) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(String(hex).trim());
  if (!m) return null;
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
}

function rgbToHsl([r, g, b]) {
  const R = r / 255, G = g / 255, B = b / 255;
  const max = Math.max(R, G, B), min = Math.min(R, G, B);
  const l = (max + min) / 2;
  const d = max - min;
  if (!d) return [0, 0, l];
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  if (max === R) h = ((G - B) / d + (G < B ? 6 : 0)) / 6;
  else if (max === G) h = ((B - R) / d + 2) / 6;
  else h = ((R - G) / d + 4) / 6;
  return [h, s, l];
}

function hslToRgb([h, s, l]) {
  if (!s) return [l * 255, l * 255, l * 255].map(to255);
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hue = (t) => {
    let T = t;
    if (T < 0) T += 1;
    if (T > 1) T -= 1;
    if (T < 1 / 6) return p + (q - p) * 6 * T;
    if (T < 1 / 2) return q;
    if (T < 2 / 3) return p + (q - p) * (2 / 3 - T) * 6;
    return p;
  };
  return [hue(h + 1 / 3), hue(h), hue(h - 1 / 3)].map((v) => to255(v * 255));
}

const withLightness = (rgb, l) => hslToRgb([rgbToHsl(rgb)[0], rgbToHsl(rgb)[1], clamp(l, 0, 1)]);
const withSaturation = (rgb, s) => {
  const [h, , l] = rgbToHsl(rgb);
  return hslToRgb([h, clamp(s, 0, 1), l]);
};

/* -------------------------------------------------------------- contrast */

function relativeLuminance([r, g, b]) {
  const f = (v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

/** WCAG 2.1 contrast ratio, 1..21. */
function contrastRatio(a, b) {
  const A = relativeLuminance(a), B = relativeLuminance(b);
  const [hi, lo] = A > B ? [A, B] : [B, A];
  return (hi + 0.05) / (lo + 0.05);
}

const WHITE = [255, 255, 255];

/** Whichever of white / ink reads better on this background. */
function bestForeground(background, ink) {
  const w = contrastRatio(background, WHITE);
  const i = contrastRatio(background, ink);
  return w >= i ? { color: WHITE, ratio: w } : { color: ink, ratio: i };
}

/**
 * Push a background darker (or lighter) until the best available foreground
 * clears `target`.
 *
 * Direction is chosen by which side the colour is already on, so a pale mint
 * lightens toward ink-on-mint and a mid navy darkens toward white-on-navy,
 * rather than every colour marching to black.
 *
 * Returns `background` and `foreground` as separate, explicitly named fields.
 * They were once both called `color` on merged objects, and the spread silently
 * replaced the background with the foreground -- so every brand colour derived
 * from a logo came out as #ffffff or the ink, while the contrast audit passed
 * and reported the palette healthy. Distinct names are what stop that returning.
 */
function forceContrast(background, ink, target = AA_NORMAL) {
  const initial = bestForeground(background, ink);
  if (initial.ratio >= target) {
    return { background, foreground: initial.color, ratio: initial.ratio, adjusted: false };
  }

  const [h, s, l] = rgbToHsl(background);
  const goDark = contrastRatio(background, WHITE) >= contrastRatio(background, ink);
  for (let step = 1; step <= 100; step++) {
    const nl = goDark ? l - step / 100 : l + step / 100;
    if (nl < 0 || nl > 1) break;
    const candidate = hslToRgb([h, s, nl]);
    const fg = bestForeground(candidate, ink);
    if (fg.ratio >= target) {
      return { background: candidate, foreground: fg.color, ratio: fg.ratio, adjusted: true };
    }
  }
  // Last resort: pure black or white keeps text readable rather than shipping
  // an unreadable pair. The caller still sees `exhausted` and can reject.
  const fallback = goDark ? [0, 0, 0] : WHITE;
  const fg = bestForeground(fallback, ink);
  return { background: fallback, foreground: fg.color, ratio: fg.ratio, adjusted: true, exhausted: true };
}

/* ------------------------------------------------------ logo colour reads */

/**
 * Dominant colours of a decoded logo, transparent pixels excluded.
 *
 * Buckets in HSL rather than RGB so that the many near-identical antialiased
 * shades along a mark's edge collapse into the one colour a person would name.
 */
function dominantColors(rgba, width, height, { max = 6 } = {}) {
  const buckets = new Map();
  for (let p = 0; p < width * height; p++) {
    const o = p * 4;
    if (rgba[o + 3] < 200) continue; // background or antialiased edge
    const rgb = [rgba[o], rgba[o + 1], rgba[o + 2]];
    const [h, s, l] = rgbToHsl(rgb);
    // 24 hue bins, 4 saturation bins, 6 lightness bins.
    const key = `${Math.round(h * 24)}:${Math.round(s * 4)}:${Math.round(l * 6)}`;
    const hit = buckets.get(key);
    if (hit) {
      hit.n++; hit.r += rgb[0]; hit.g += rgb[1]; hit.b += rgb[2];
    } else {
      buckets.set(key, { n: 1, r: rgb[0], g: rgb[1], b: rgb[2] });
    }
  }
  return [...buckets.values()]
    .sort((a, b) => b.n - a.n)
    .slice(0, max)
    .map((k) => {
      const rgb = [k.r / k.n, k.g / k.n, k.b / k.n].map(to255);
      const [h, s, l] = rgbToHsl(rgb);
      return { rgb, hex: toHex(rgb), count: k.n, hue: h, saturation: s, lightness: l };
    });
}

/** Is this a colour a brand could be built on, or is it ink/paper/grey? */
const isChromatic = (c) => c.saturation >= 0.18 && c.lightness > 0.08 && c.lightness < 0.94;

/** Smallest distance around the hue wheel, 0..0.5. */
const hueGap = (a, b) => {
  const d = Math.abs(a - b) % 1;
  return Math.min(d, 1 - d);
};

/* ----------------------------------------------------------- the palette */

/**
 * Build the 22-token contract the reference stylesheet expects.
 *
 * `--paper`, `--ink` and `--stripe` are deliberately not read off the logo:
 * they are the page's neutral ground and stay constant across the batch so ten
 * sites read as one system, which is the whole point of a shared reference.
 */
function buildPalette(logo, { ink = '#2c2927', paper = '#ffffff' } = {}) {
  const inkRgb = fromHex(ink) || [44, 41, 39];
  const paperRgb = fromHex(paper) || WHITE;

  const colors = Array.isArray(logo) ? logo : dominantColors(logo.rgba, logo.width, logo.height);
  const chromatic = colors.filter(isChromatic);
  if (!chromatic.length) {
    return { ok: false, reason: 'logo_has_no_usable_brand_color', colors };
  }

  const brandSeed = chromatic[0];
  // An accent wants to be visibly a different colour, not a second shade of the
  // brand. Failing that, rotate to a warm complement rather than repeat the hue.
  const accentSeed = chromatic.slice(1).find((c) => hueGap(c.hue, brandSeed.hue) > 0.08)
    || { rgb: hslToRgb([(brandSeed.hue + 0.5) % 1, Math.max(0.45, brandSeed.saturation), 0.38]) };

  // Brand and accent must both be able to carry white or ink text.
  const brand = forceContrast(withLightness(brandSeed.rgb, clamp(rgbToHsl(brandSeed.rgb)[2], 0.22, 0.46)), inkRgb);
  const accent = forceContrast(withLightness(accentSeed.rgb, clamp(rgbToHsl(accentSeed.rgb)[2], 0.24, 0.44)), inkRgb);

  const brandRgb = brand.background;
  const accentRgb = accent.background;
  const [bh, bs] = rgbToHsl(brandRgb);

  const header = forceContrast(hslToRgb([bh, clamp(bs * 0.9, 0.12, 0.7), 0.16]), inkRgb);
  const hero = forceContrast(hslToRgb([bh, clamp(bs * 0.75, 0.1, 0.6), 0.58]), inkRgb, AA_LARGE);
  const brandDp = forceContrast(withLightness(brandRgb, 0.2), inkRgb);
  const field = hslToRgb([bh, clamp(bs * 0.35, 0.04, 0.3), 0.955]);
  const fieldPair = forceContrast(field, inkRgb);

  const tokens = {
    '--brand': toHex(brandRgb),
    '--brand-lt': toHex(withLightness(brandRgb, clamp(rgbToHsl(brandRgb)[2] + 0.12, 0, 1))),
    '--brand-dp': toHex(brandDp.background),
    '--hero': toHex(hero.background),
    '--accent': toHex(accentRgb),
    '--accent-ui': toHex(accentRgb),
    '--script': toHex(hslToRgb([bh, clamp(bs * 0.8, 0.1, 0.6), 0.7])),
    '--header': toHex(header.background),
    '--paper': toHex(paperRgb),
    '--ink': toHex(inkRgb),
    '--stripe': toHex(hslToRgb([bh, clamp(bs * 0.25, 0.03, 0.2), 0.92])),
    // Brand and accent used as *text on paper* need their own, darker values.
    '--brand-ink': toHex(darkenUntilReadableOn(paperRgb, brandRgb)),
    '--accent-ink': toHex(darkenUntilReadableOn(paperRgb, accentRgb)),
    '--field': toHex(fieldPair.background),
    '--wash': toHex(hslToRgb([bh, clamp(bs * 0.2, 0.02, 0.16), 0.9])),
    '--wash-2': toHex(hslToRgb([rgbToHsl(accentRgb)[0], clamp(rgbToHsl(accentRgb)[1] * 0.3, 0.03, 0.24), 0.9])),
    '--on-brand': toHex(bestForeground(brandRgb, inkRgb).color),
    '--on-accent': toHex(bestForeground(accentRgb, inkRgb).color),
    '--on-header': toHex(header.foreground),
    '--on-hero': toHex(hero.foreground),
    '--on-footer': toHex(brandDp.foreground),
    '--on-field': toHex(fieldPair.foreground),
  };

  const audit = validatePalette(tokens);
  return { ok: audit.ok, tokens, contrast: audit.pairs, failures: audit.failures, colors, reason: audit.ok ? null : 'palette_contrast_failed' };
}

/** Walk a colour darker until it can be read on `background`. */
function darkenUntilReadableOn(background, color, target = AA_NORMAL) {
  const [h, s] = rgbToHsl(color);
  for (let l = rgbToHsl(color)[2]; l >= 0; l -= 0.01) {
    const candidate = hslToRgb([h, s, l]);
    if (contrastRatio(background, candidate) >= target) return candidate;
  }
  return [0, 0, 0];
}

/**
 * Every text pair the reference stylesheet actually paints.
 *
 * Kept as data rather than prose so a build can assert it, and so adding a
 * surface to the template forces a line here instead of quietly shipping an
 * unchecked pair.
 */
const TEXT_PAIRS = [
  ['--on-brand', '--brand', AA_NORMAL],
  ['--on-accent', '--accent', AA_NORMAL],
  ['--on-header', '--header', AA_NORMAL],
  ['--on-hero', '--hero', AA_LARGE],
  ['--on-footer', '--brand-dp', AA_NORMAL],
  ['--on-field', '--field', AA_NORMAL],
  ['--ink', '--paper', AA_NORMAL],
  ['--ink', '--stripe', AA_NORMAL],
  ['--brand-ink', '--paper', AA_NORMAL],
  ['--accent-ink', '--paper', AA_NORMAL],
];

/** Measure every declared text pair. Returns which passed and which did not. */
function validatePalette(tokens) {
  const pairs = TEXT_PAIRS.map(([fg, bg, target]) => {
    const F = fromHex(tokens[fg]), B = fromHex(tokens[bg]);
    const ratio = F && B ? contrastRatio(F, B) : 0;
    return { fg, bg, target, ratio: Number(ratio.toFixed(2)), pass: ratio >= target };
  });
  const failures = pairs.filter((p) => !p.pass);
  return { ok: !failures.length, pairs, failures };
}

/** Render a palette as the `[data-site="slug"]` block the stylesheet expects. */
function toCssBlock(slug, tokens) {
  const body = Object.entries(tokens).map(([k, v]) => `  ${k}: ${v};`).join('\n');
  return `[data-site="${slug}"] {\n${body}\n}`;
}

module.exports = {
  AA_NORMAL, AA_LARGE, TEXT_PAIRS,
  buildPalette, validatePalette, dominantColors, toCssBlock,
  contrastRatio, relativeLuminance, bestForeground, forceContrast,
  rgbToHsl, hslToRgb, toHex, fromHex, isChromatic, hueGap,
};
