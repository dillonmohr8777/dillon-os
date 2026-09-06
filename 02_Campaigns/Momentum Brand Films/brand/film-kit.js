/* Momentum Brand Films — shared kit.
 *
 * Everything a film needs to be a pure function of t. No timers, no rAF, no
 * Date.now(), no Math.random() at paint time: render/capture.py drives seek(t)
 * frame by frame, so the same t must always produce the same pixels.
 *
 * ES module. Import from a film with:
 *     <script type="module">
 *       import { at, easeEntrance, Lockup } from '../../brand/film-kit.js';
 *     </script>
 */

/* ── easing ──────────────────────────────────────────────────────────────
 * The three curves from tokens.css, solved in JS so motion in script matches
 * motion in CSS exactly. Newton-Raphson with a bisection fallback; ~1e-7.      */

function cubicBezier(x1, y1, x2, y2) {
  const A = (a, b) => 1 - 3 * b + 3 * a;
  const B = (a, b) => 3 * b - 6 * a;
  const C = (a) => 3 * a;
  const calc = (t, a, b) => ((A(a, b) * t + B(a, b)) * t + C(a)) * t;
  const slope = (t, a, b) => 3 * A(a, b) * t * t + 2 * B(a, b) * t + C(a);
  return (x) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 8; i++) {
      const d = slope(t, x1, x2);
      if (Math.abs(d) < 1e-6) break;
      const err = calc(t, x1, x2) - x;
      if (Math.abs(err) < 1e-7) return calc(t, y1, y2);
      t -= err / d;
    }
    let lo = 0, hi = 1;
    t = x;
    for (let i = 0; i < 24; i++) {
      const err = calc(t, x1, x2) - x;
      if (Math.abs(err) < 1e-7) break;
      if (err > 0) hi = t; else lo = t;
      t = (lo + hi) / 2;
    }
    return calc(t, y1, y2);
  };
}

/** --m-ease-standard: hover, tint, small state changes. */
export const easeStandard = cubicBezier(0.2, 0.7, 0.2, 1);
/** --m-ease-entrance: entrances, expo-out. The default for anything arriving. */
export const easeEntrance = cubicBezier(0.16, 1, 0.3, 1);
/** --m-ease-emphatic: deliberate swaps that should feel decided. */
export const easeEmphatic = cubicBezier(0.85, 0, 0.15, 1);
/** Symmetric ease for continuous motion that has to come back. */
export const easeInOut = cubicBezier(0.45, 0, 0.55, 1);

/* ── time ────────────────────────────────────────────────────────────────── */

export const clamp = (v, lo = 0, hi = 1) => (v < lo ? lo : v > hi ? hi : v);
export const lerp = (a, b, p) => a + (b - a) * p;

/**
 * Normalised progress of a beat. `at(t, 4, 2)` is 0 before t=4, ramps to 1
 * across two seconds, and stays 1 after t=6. The workhorse of every film.
 */
export const at = (t, start, dur, ease = easeEntrance) =>
  ease(clamp((t - start) / dur));

/** Progress that goes 0 → 1 → 0: for anything that arrives and then leaves. */
export const pulse = (t, start, inDur, hold, outDur, ease = easeEntrance) => {
  const up = at(t, start, inDur, ease);
  const down = 1 - at(t, start + inDur + hold, outDur, easeStandard);
  return Math.min(up, down);
};

/** Staggered progress for item i of n. */
export const stagger = (t, start, dur, i, step = 0.07, ease = easeEntrance) =>
  at(t, start + i * step, dur, ease);

/** A slow sine, for idle life: bob, drift, breathing. Amplitude 1, period sec. */
export const osc = (t, period = 4, phase = 0) =>
  Math.sin(((t / period) + phase) * Math.PI * 2);

/** Square wave for carets and blinking indicators. 1 for the first half. */
export const blink = (t, period = 1.06) => ((t % period) < period * 0.55 ? 1 : 0);

/* ── text ────────────────────────────────────────────────────────────────── */

/**
 * Character-by-character typing as a function of t. Returns the visible
 * substring. Deterministic — the caret is drawn separately with blink().
 */
export const typed = (text, t, start, dur) =>
  text.slice(0, Math.round(clamp((t - start) / dur) * text.length));

/**
 * Split an element's text into per-word spans once, at load, so each word can
 * be driven independently. Returns the array of spans.
 */
export function words(el) {
  if (el.__words) return el.__words;
  const parts = el.textContent.split(/(\s+)/);
  el.textContent = '';
  const spans = [];
  for (const p of parts) {
    if (/^\s+$/.test(p)) { el.appendChild(document.createTextNode(p)); continue; }
    const s = document.createElement('span');
    s.textContent = p;
    s.style.display = 'inline-block';
    s.style.willChange = 'transform, opacity';
    el.appendChild(s);
    spans.push(s);
  }
  el.__words = spans;
  return spans;
}

/** Rise-and-fade-in a word run on a stagger. The slate's default text entrance. */
export function revealWords(el, t, start, dur = 0.7, step = 0.07, rise = 28) {
  words(el).forEach((s, i) => {
    const p = stagger(t, start, dur, i, step);
    s.style.opacity = p;
    s.style.transform = `translateY(${(1 - p) * rise}px)`;
  });
}

/* ── determinism ─────────────────────────────────────────────────────────── */

/**
 * Seeded PRNG. Call once at load to generate any scatter, jitter or noise, and
 * store the results — never call it inside seek(), or the render will boil.
 */
export function rng(seed = 0x9e3779b9) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let x = Math.imul(a ^ (a >>> 15), 1 | a);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

/** A fixed grain texture as a data URL. Generate once at load, never per frame. */
export function grainURL(size = 160, alpha = 0.045, seed = 7) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(size, size);
  const r = rng(seed);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 128 + (r() - 0.5) * 255;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = Math.round(alpha * 255);
  }
  ctx.putImageData(img, 0, 0);
  return c.toDataURL();
}

/* ── brand furniture ─────────────────────────────────────────────────────── */

let markPromise = null;
/** Fetch and cache the official mark's SVG source. */
export function markSVG(base = '../../brand/') {
  if (!markPromise) markPromise = fetch(base + 'momentum-mark.svg').then((r) => r.text());
  return markPromise;
}

/**
 * The closing lockup, used identically by all six films: the official mark,
 * MOMENTUM in the display face, an optional line, and the domain.
 *
 * Every film ends on this, so it lives in one place. If the official wordmark
 * artwork ever arrives, replace the <span class="lk-word"> here and all six
 * films inherit it.
 *
 *   const lock = await Lockup(el, { line: 'Philadelphia. Since 2015.' });
 *   // then, inside seek(t):
 *   lock.pose(at(t, 27, 1.2));
 */
export async function Lockup(el, opts = {}) {
  const {
    base = '../../brand/',
    line = '',
    domain = 'needmomentum.com',
    dark = false,
    markSize = 96,
    wordSize = 64,
    align = 'center',
  } = opts;

  const svg = await markSVG(base);
  const ink = dark ? 'var(--m-on-deep)' : 'var(--m-ink)';
  const quiet = dark ? 'var(--m-on-deep-muted)' : 'var(--m-muted)';
  const markColor = dark ? 'var(--m-brand-lift)' : 'var(--m-mark)';

  el.innerHTML = `
    <div class="lk-row" style="display:flex;align-items:center;gap:${markSize * 0.28}px;justify-content:${align};">
      <span class="lk-mark" style="width:${markSize}px;height:${markSize}px;display:block;color:${markColor};flex:0 0 auto">${svg}</span>
      <span class="lk-word" style="font-family:var(--m-font-display);font-size:${wordSize}px;letter-spacing:-.02em;line-height:.9;color:${ink}">MOMENTUM</span>
    </div>
    ${line ? `<div class="lk-line" style="font-family:var(--m-font-text);font-weight:400;font-size:${wordSize * 0.3}px;color:${quiet};margin-top:${wordSize * 0.34}px;text-align:${align}">${line}</div>` : ''}
    <div class="lk-domain" style="font-family:var(--m-font-text);font-weight:700;font-size:${wordSize * 0.26}px;letter-spacing:.06em;color:${quiet};margin-top:${wordSize * (line ? 0.16 : 0.34)}px;text-align:${align}">${domain}</div>`;

  const mark = el.querySelector('.lk-mark');
  const word = el.querySelector('.lk-word');
  const lineEl = el.querySelector('.lk-line');
  const dom = el.querySelector('.lk-domain');
  const m = mark.querySelector('svg');
  if (m) { m.setAttribute('width', '100%'); m.setAttribute('height', '100%'); m.style.display = 'block'; }

  return {
    el,
    /**
     * p: 0..1 overall entrance. The mark scales in, the word wipes from the
     * left, the line and domain follow on a stagger.
     */
    pose(p) {
      const pm = easeEntrance(clamp(p / 0.5));
      const pw = easeEntrance(clamp((p - 0.14) / 0.55));
      const pl = easeEntrance(clamp((p - 0.42) / 0.5));
      const pd = easeEntrance(clamp((p - 0.56) / 0.5));
      el.style.opacity = p > 0 ? 1 : 0;
      mark.style.transform = `scale(${lerp(0.72, 1, pm)})`;
      mark.style.opacity = pm;
      word.style.clipPath = `inset(0 ${(1 - pw) * 100}% 0 0)`;
      word.style.opacity = pw > 0 ? 1 : 0;
      if (lineEl) { lineEl.style.opacity = pl; lineEl.style.transform = `translateY(${(1 - pl) * 10}px)`; }
      dom.style.opacity = pd; dom.style.transform = `translateY(${(1 - pd) * 10}px)`;
    },
  };
}

/* ── QA helper ───────────────────────────────────────────────────────────── */

/**
 * Relative luminance and contrast ratio, so a film can assert its own pairs.
 * Used by render/contrast.py; exported here so a film can self-check in dev.
 */
export function contrast(hexA, hexB) {
  const lum = (hex) => {
    const n = parseInt(hex.replace('#', ''), 16);
    const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255]
      .map((v) => v / 255)
      .map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  };
  const a = lum(hexA), b = lum(hexB);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}
