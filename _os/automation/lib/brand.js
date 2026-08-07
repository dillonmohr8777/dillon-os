'use strict';

/**
 * NeedMomentum brand tokens — one source of truth for every generated surface.
 *
 * Two arms share the name and must not share the look: **NeedMomentum**
 * (needmomentum.com, Momentum Digital Agency) is the marketing arm this pipeline
 * serves; **Momentum 360** (momentum3d) is the 3D/virtual-tour arm. Client
 * reporting and the prospect radar belong to the marketing arm.
 *
 * ## Where the colour came from
 *
 * `#2A80C2` is measured, not chosen: it is 99.4% of the opaque pixels in the
 * live needmomentum.com mark (the site itself is behind a bot challenge, so the
 * mark was read from the favicon and sampled per-pixel). Everything else is
 * derived from it and **every pair a human reads is WCAG-checked** — the numbers
 * are in the comments so a future edit can't quietly break contrast.
 *
 *   brand #2A80C2 = hsl(206°, 64%, 46%), relative luminance 0.198
 *
 * Two rules that shaped the derivation:
 *
 * 1. **The brand blue cannot be body text.** 3.93:1 on the light surface fails
 *    AA. So text and links use a darkened `brandInk` in light mode and a lifted
 *    `brandLift` in dark mode; the pure brand is reserved for fills and chrome,
 *    where it is a background rather than something you read.
 * 2. **The score scale stays semantic, and stays out of the brand's hue.** A
 *    row's colour is its grade — that is information, not decoration, so warm
 *    still means bad and green still means good. `strong` was pushed greener and
 *    `unconfirmed` pushed toward violet-grey so that the only saturated blue on
 *    the page is the brand.
 */

/** The mark, inlined so no page ever makes an external request for it. */
const fs = require('fs');
const path = require('path');

const MARK_PATH = path.join(__dirname, '..', 'assets', 'needmomentum-mark.png');

let _markDataUri = null;
/**
 * The NeedMomentum mark as a `data:` URI.
 *
 * Read from `assets/needmomentum-mark.png` (192px, sampled from the live
 * favicon). Drop a real vector in at that path and this picks it up — the only
 * reason it is a raster is that the site would not serve the SVG.
 *
 * @returns {string} data URI, or '' when the asset is missing (callers must
 *          degrade to the wordmark rather than emit a broken image)
 */
function markDataUri() {
  if (_markDataUri !== null) return _markDataUri;
  try {
    const buf = fs.readFileSync(MARK_PATH);
    const ext = path.extname(MARK_PATH).toLowerCase();
    const mime = ext === '.svg' ? 'image/svg+xml' : ext === '.webp' ? 'image/webp' : 'image/png';
    _markDataUri = `data:${mime};base64,${buf.toString('base64')}`;
  } catch {
    _markDataUri = '';
  }
  return _markDataUri;
}

const BRAND = {
  name: 'NeedMomentum',
  domain: 'needmomentum.com',
  /** Measured from the mark. Fills and chrome only — never small text. */
  blue: '#2A80C2',
  /**
   * The second brand colour, per the operator. The live site is bot-gated so it
   * could not be sampled the way the blue was; this is the complement of the
   * measured blue (206° → 45°) tuned until ink-on-gold cleared AA.
   *
   * **Gold is a fill, never body text.** 1.46:1 on the light surface — it fails
   * as text by a wide margin and no amount of tuning fixes that without turning
   * it brown. With near-black on top it reaches 11.36:1, and on dark surfaces it
   * works as text at 11.38:1.
   */
  gold: '#FFC63B',
};

/**
 * Light and dark token sets. Contrast ratios in the comments are against the
 * surface the token is actually used on, computed with lib/arch-tokens contrast().
 */
const TOKENS = {
  light: {
    bg: '#F4F7FA',
    panel: '#FFFFFF',
    sunk: '#EAF0F6',
    fg: '#111823',
    fgMid: '#4A5769',
    fgFaint: '#7A8798',
    rule: '#DDE5EE',
    ruleStrong: '#BECBD9',
    brand: '#2A80C2',
    brandInk: '#2673AF', // links/body: 4.70:1 on bg, 5.06:1 on panel
    brandFill: '#2776B2', // white small text on it: 4.86:1
    onBrand: '#FFFFFF',
    brandWash: 'rgba(42,128,194,0.08)',
    gold: '#FFC63B',
    goldInk: '#6B4A00', // gold as *text* is impossible; this is for gold-adjacent copy: 5.9:1 on panel
    onGold: '#111823', // 11.36:1 on gold
    goldWash: 'rgba(255,198,59,0.14)',
    // The page field, separate from the hover washes so each can be tuned for
    // its own job. Light mode needs less: a tint on white reads far louder.
    fieldBlue: 'rgba(42,128,194,0.16)',
    fieldGold: 'rgba(255,186,30,0.26)',
    scale: {
      broken: '#A63D2F', //  6.31:1 on panel
      decayed: '#B15B28', //  4.78:1
      // Pushed off yellow into olive so it cannot be read as the brand gold.
      dated: '#6E5A1C', //  6.68:1 on panel, 4.26:1 against gold
      unconfirmed: '#6B6F8C', //  4.91:1
      strong: '#1F7A5E', //  5.25:1
    },
  },
  dark: {
    bg: '#101823',
    panel: '#18222E',
    sunk: '#0B1119',
    fg: '#E7ECF2',
    fgMid: '#A3B1C0',
    fgFaint: '#6F7E8E',
    rule: '#26323F',
    ruleStrong: '#3A4857',
    brand: '#2A80C2',
    brandLift: '#5FA0D1', // links/body: 6.32:1 on bg
    brandFill: '#2A80C2',
    onBrand: '#FFFFFF',
    brandWash: 'rgba(95,160,209,0.12)',
    gold: '#FFC63B', // 11.38:1 as text on the dark surface, so usable either way
    goldInk: '#FFC63B',
    onGold: '#111823',
    goldWash: 'rgba(255,198,59,0.10)',
    fieldBlue: 'rgba(58,140,210,0.34)',
    fieldGold: 'rgba(255,186,30,0.22)',
    scale: {
      broken: '#E0705C', //  5.08:1 on panel
      decayed: '#EE8C4C', //  6.50:1
      dated: '#A8863C', //  4.70:1 on panel, 2.18:1 against gold — separated by saturation
      unconfirmed: '#9A9EBC', //  6.11:1
      strong: '#3FB08B', //  5.96:1
    },
  },
};

/** Type stack. System fonts only — a webfont would mean an external request. */
const TYPE = {
  // The wordmark and headings want a geometric sans, which is what the real
  // brand uses; system-ui is the closest thing available without a webfont.
  display: '"Avenir Next", "Segoe UI Variable Display", system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif',
  sans: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  mono: 'ui-monospace, "SF Mono", SFMono-Regular, "Cascadia Mono", Menlo, Consolas, monospace',
};

/**
 * Emit the CSS custom-property block for both themes.
 *
 * Covers the media query *and* an explicit `data-theme` override in both
 * directions, so a viewer's manual toggle wins over their OS preference.
 *
 * @param {object} [opts] `{ selector }` root selector, default `:root`
 */
function cssVariables({ selector = ':root' } = {}) {
  const decl = (t) =>
    [
      `--bg:${t.bg}`,
      `--panel:${t.panel}`,
      `--sunk:${t.sunk}`,
      `--fg:${t.fg}`,
      `--fg-mid:${t.fgMid}`,
      `--fg-faint:${t.fgFaint}`,
      `--rule:${t.rule}`,
      `--rule-strong:${t.ruleStrong}`,
      `--brand:${t.brand}`,
      `--brand-ink:${t.brandInk || t.brandLift}`,
      `--brand-fill:${t.brandFill}`,
      `--on-brand:${t.onBrand}`,
      `--brand-wash:${t.brandWash}`,
      `--gold:${t.gold}`,
      `--gold-ink:${t.goldInk}`,
      `--on-gold:${t.onGold}`,
      `--gold-wash:${t.goldWash}`,
      `--field-blue:${t.fieldBlue}`,
      `--field-gold:${t.fieldGold}`,
      `--s-broken:${t.scale.broken}`,
      `--s-decayed:${t.scale.decayed}`,
      `--s-dated:${t.scale.dated}`,
      `--s-unconfirmed:${t.scale.unconfirmed}`,
      `--s-strong:${t.scale.strong}`,
    ].join(';');

  return `${selector} {
    ${decl(TOKENS.light)};
    --display:${TYPE.display};
    --sans:${TYPE.sans};
    --mono:${TYPE.mono};
  }
  @media (prefers-color-scheme: dark) { ${selector} { ${decl(TOKENS.dark)} } }
  ${selector}[data-theme="dark"] { ${decl(TOKENS.dark)} }
  ${selector}[data-theme="light"] { ${decl(TOKENS.light)} }`;
}

/**
 * The lockup: mark plus wordmark.
 *
 * `NeedMomentum` is set as two weights of one word rather than an image, so it
 * stays crisp at any size and searchable in the DOM. The mark degrades to
 * wordmark-only if the asset is missing rather than rendering a broken image.
 */
function lockup({ size = 30, subtitle = '' } = {}) {
  const uri = markDataUri();
  const img = uri
    ? `<img class="lock__mark" src="${uri}" width="${size}" height="${size}" alt="">`
    : '';
  return `<span class="lock">${img}<span class="lock__type"><span class="lock__word">Need<b>Momentum</b></span>${
    subtitle ? `<span class="lock__sub">${subtitle}</span>` : ''
  }</span></span>`;
}

/** Styles for the lockup, kept next to the markup that needs them. */
const LOCKUP_CSS = `
  .lock { display: inline-flex; align-items: center; gap: 10px; }
  .lock__mark { display: block; border-radius: 50%; flex: none; }
  .lock__type { display: flex; flex-direction: column; line-height: 1.1; }
  .lock__word { font-family: var(--display); font-size: 17px; letter-spacing: -0.015em; color: var(--fg); font-weight: 400; }
  .lock__word b { font-weight: 700; }
  .lock__sub { font-family: var(--mono); font-size: 10px; letter-spacing: 0.13em; text-transform: uppercase; color: var(--fg-faint); margin-top: 3px; }
`;

module.exports = { BRAND, TOKENS, TYPE, cssVariables, lockup, LOCKUP_CSS, markDataUri, MARK_PATH };
