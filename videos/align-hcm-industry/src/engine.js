/* Align HCM industry films. Shared engine.
 *
 * Same contract as the brand intro: every visual property is a pure function of
 * the playhead t, written through window.__seek(t). No CSS keyframes, no rAF
 * driven state, nothing reads the clock, so the exporter can seek to an exact
 * frame and get the same result every time.
 *
 * A scene file defines SCENES and TITLE and is concatenated after this file by
 * build.py. Public surface: window.__seek(t), window.DURATION, window.__ready.
 */

const FPS = 30;
const LAP = 0.22;   /* seconds two consecutive scenes overlap on a cut */

/* ------------------------------------------------------------------ easing */

const E = {
  linear: t => t,
  easeInCubic: t => t * t * t,
  easeOutCubic: t => 1 - Math.pow(1 - t, 3),
  easeInOutCubic: t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  easeOutQuart: t => 1 - Math.pow(1 - t, 4),
  easeInOutQuart: t => (t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2),
  easeOutExpo: t => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  easeOutBack: t => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
};

const clamp01 = v => (v < 0 ? 0 : v > 1 ? 1 : v);
const lerp = (a, b, t) => a + (b - a) * t;
/* normalised progress of x across [a,b] */
const seg = (x, a, b) => clamp01((x - a) / (b - a));
/* rises 0 to 1 over [a,b], falls back over [c,d] */
const pulse = (x, a, b, c, d) => Math.min(seg(x, a, b), 1 - seg(x, c, d));

/* ------------------------------------------------------------------ markup */

/* Per character spans for the stagger reveal. *stars* mark an accent word,
   | forces a line break, and characters are grouped into nowrap word spans so a
   headline never breaks mid word. */
function typeset(text) {
  const runs = [];
  let accent = false;
  for (const part of text.split('*')) { if (part) runs.push([part, accent]); accent = !accent; }

  let html = '', open = false;
  const openWord = () => { if (!open) { html += '<span class="w">'; open = true; } };
  const closeWord = () => { if (open) { html += '</span>'; open = false; } };

  for (const [str, acc] of runs) {
    for (const c of str) {
      if (c === '|') { closeWord(); html += '<br>'; continue; }
      if (c === ' ') { closeWord(); html += '<span class="ch sp">&nbsp;</span>'; continue; }
      openWord();
      const ch = `<span class="ch">${c}</span>`;
      html += acc ? `<span class="accent">${ch}</span>` : ch;
    }
  }
  closeWord();
  return html;
}

function eyebrow(label) {
  return `<div class="eyebrow" data-eyebrow><i></i><span>${label}</span></div>`;
}

/* A dimensional icon tile from icons3d.py: orange gradient squircle, cast
   shadow, specular band, white glyph. The generator emits inner markup only, so
   it drops straight into an svg root here without nesting one. */
function tile(name, cls = '') {
  return `<svg class="tile ${cls}" viewBox="0 0 96 96">${ICONS3D[name]}</svg>`;
}

/* The split panel this whole set is built on: artwork holds one half of the
   frame full bleed, type holds the other. `side` is which half the art sits on.
   A scrim runs along the inner edge so a light passage in the illustration can
   never fight the first character of a headline. */
function split(side, hero, inner) {
  return `
    <div class="split ${side}">
      <div class="panel" data-panel>
        <div class="panel-img" data-img style="background-image:url(${HEROES[hero]})"></div>
        <div class="panel-scrim"></div>
        <div class="panel-edge" data-edge></div>
      </div>
      <div class="copy" data-copy>${inner}</div>
    </div>`;
}

/* The lockup, measured off the Align end card still. See the brand intro
   README for why this is not the favicon geometry. */
function lockupSVG(id, w = 690) {
  return `
<svg class="lockup" id="${id}" viewBox="0 0 690 250" width="${w}">
  <defs>
    <clipPath id="${id}-cw" clipPathUnits="userSpaceOnUse">
      <rect id="${id}-cwr" x="-8" y="-8" width="0" height="220"/>
    </clipPath>
    <clipPath id="${id}-cm" clipPathUnits="userSpaceOnUse">
      <rect id="${id}-cmr" x="-20" y="-8" width="200" height="0"/>
    </clipPath>
  </defs>
  <g transform="translate(358,0) scale(2.25)">
    <g clip-path="url(#${id}-cm)">
      <path class="slashO" d="M0 0 L23.33 0 L86.67 100 L61.11 100 Z"/>
      <path class="slashW" d="M30 0 L53.33 0 L116.67 100 L91.11 100 Z"/>
    </g>
    <circle class="dot" id="${id}-d0" cx="76"     cy="10"    r="12.22"/>
    <circle class="dot" id="${id}-d1" cx="101.11" cy="42.89" r="11.56"/>
    <circle class="dot" id="${id}-d2" cx="126.22" cy="75.78" r="11.56"/>
  </g>
  <g transform="translate(0,55.5)" clip-path="url(#${id}-cw)">
    <path class="word" fill-rule="evenodd" d="__WORDMARK_PATH__"/>
  </g>
</svg>`;
}

/* ------------------------------------------------------------- draw helpers */

const q = (root, sel) => root.querySelector(sel);
const qa = (root, sel) => Array.from(root.querySelectorAll(sel));

/* letters materialise left to right, blurred to sharp */
function revealChars(el, lt, start, opt = {}) {
  const per = opt.per ?? 0.024;
  const dur = opt.dur ?? 0.64;
  const dy = opt.dy ?? 36;
  const blur = opt.blur ?? 17;
  if (!el.__chs) el.__chs = qa(el, '.ch');
  el.__chs.forEach((c, i) => {
    const p = E.easeOutCubic(seg(lt, start + i * per, start + i * per + dur));
    c.style.opacity = p.toFixed(3);
    c.style.transform = `translate3d(0,${((1 - p) * dy).toFixed(2)}px,0)`;
    c.style.filter = p >= 1 ? 'none' : `blur(${((1 - p) * blur).toFixed(2)}px)`;
  });
}

function showEyebrow(root, lt, start = 0.08) {
  const eb = q(root, '[data-eyebrow]');
  if (!eb) return;
  const p = E.easeOutCubic(seg(lt, start, start + 0.5));
  eb.style.opacity = p.toFixed(3);
  eb.style.transform = `translate3d(${((1 - p) * -22).toFixed(2)}px,0,0)`;
  eb.querySelector('i').style.transform = `scaleX(${E.easeOutQuart(seg(lt, start, start + 0.62)).toFixed(3)})`;
}

function showBody(root, lt, start, sel = '.body') {
  const b = q(root, sel);
  if (!b) return;
  const p = E.easeOutCubic(seg(lt, start, start + 0.72));
  b.style.opacity = (p * 0.98).toFixed(3);
  b.style.transform = `translate3d(0,${((1 - p) * 24).toFixed(2)}px,0)`;
  b.style.filter = p >= 1 ? 'none' : `blur(${((1 - p) * 8).toFixed(2)}px)`;
}

/* The artwork wipes in from its outer edge, then drifts. Slow enough to read as
   a held photograph with life in it rather than a move. */
function drawPanel(root, lt, dur, opt = {}) {
  const panel = q(root, '[data-panel]');
  if (!panel) return;
  const fromLeft = panel.parentElement.classList.contains('art-left');
  const wipe = E.easeOutQuart(seg(lt, opt.start ?? 0.0, (opt.start ?? 0.0) + 0.9));
  const inset = ((1 - wipe) * 100).toFixed(2);
  panel.style.clipPath = fromLeft
    ? `inset(0 0 0 ${inset}%)`
    : `inset(0 ${inset}% 0 0)`;

  const drift = seg(lt, 0, dur);
  const img = q(root, '[data-img]');
  img.style.transform =
    `scale(${lerp(1.08, 1.0, E.easeOutQuart(seg(lt, 0, 2.4))).toFixed(4)}) ` +
    `translate3d(${(lerp(0, fromLeft ? 14 : -14, drift)).toFixed(2)}px,${(lerp(6, -6, drift)).toFixed(2)}px,0)`;

  const edge = q(root, '[data-edge]');
  if (edge) edge.style.transform = `scaleY(${E.easeOutQuart(seg(lt, 0.18, 1.2)).toFixed(3)})`;
}

/* stagger a set of elements in from below */
function stagger(els, lt, start, step = 0.16, opt = {}) {
  const dy = opt.dy ?? 34;
  const dur = opt.dur ?? 0.7;
  els.forEach((el, i) => {
    const s = start + i * step;
    const p = E.easeOutQuart(seg(lt, s, s + dur));
    el.style.opacity = p.toFixed(3);
    el.style.transform = `translate3d(${((opt.dx ?? 0) * (1 - p)).toFixed(2)}px,${((1 - p) * dy).toFixed(2)}px,0)`;
    if (opt.blur !== false) el.style.filter = p >= 1 ? 'none' : `blur(${((1 - p) * 10).toFixed(2)}px)`;
  });
}

/* assembles the logo: bars wipe down, dots pop, wordmark wipes across */
function drawLockup(root, id, p) {
  const bars = E.easeOutQuart(clamp01(p / 0.55));
  const word = E.easeOutQuart(clamp01((p - 0.3) / 0.6));
  q(root, `#${id}-cmr`).setAttribute('height', (bars * 112).toFixed(2));
  q(root, `#${id}-cwr`).setAttribute('width', (word * 520).toFixed(2));
  for (let i = 0; i < 3; i++) {
    const dp = E.easeOutBack(clamp01((p - 0.34 - i * 0.09) / 0.42));
    const d = q(root, `#${id}-d${i}`);
    d.style.transformOrigin = `${[76, 101.11, 126.22][i]}px ${[10, 42.89, 75.78][i]}px`;
    d.style.transform = `scale(${Math.max(0, dp).toFixed(3)})`;
    d.style.opacity = clamp01(dp * 1.4).toFixed(3);
  }
}
