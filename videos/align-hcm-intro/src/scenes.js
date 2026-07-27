/* Align HCM brand intro. Deterministic scene graph.
 *
 * Everything is a pure function of the playhead t (seconds). Nothing reads the
 * clock, nothing uses CSS keyframes or requestAnimationFrame for state. That is
 * what lets render.mjs seek to an exact frame and screenshot it.
 *
 * Public surface: window.__seek(t), window.DURATION, window.FPS
 */

const FPS = 30;
const DURATION = 52.6;

/* ------------------------------------------------------------------ easing */

const E = {
  linear: t => t,
  easeOutQuad: t => t * (2 - t),
  easeInCubic: t => t * t * t,
  easeOutCubic: t => 1 - Math.pow(1 - t, 3),
  easeInOutCubic: t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  easeOutQuart: t => 1 - Math.pow(1 - t, 4),
  easeInOutQuart: t => (t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2),
  easeOutExpo: t => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  easeInExpo: t => (t <= 0 ? 0 : Math.pow(2, 10 * t - 10)),
  easeOutBack: t => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
  easeOutSine: t => Math.sin((t * Math.PI) / 2),
};

const clamp01 = v => (v < 0 ? 0 : v > 1 ? 1 : v);
const lerp = (a, b, t) => a + (b - a) * t;
/* normalised progress of x across [a,b] */
const seg = (x, a, b) => clamp01((x - a) / (b - a));
/* rises 0 to 1 over [a,b] then falls back to 0 over [c,d] */
const pulse = (x, a, b, c, d) => Math.min(seg(x, a, b), 1 - seg(x, c, d));
const px = v => v.toFixed(2) + 'px';

/* ------------------------------------------------------------------ markup */

/* Split a string into per character spans for the stagger reveal.
 * *stars* mark accent words, | forces a line break. Characters are grouped into
 * nowrap word spans so a headline never breaks in the middle of a word, which
 * inline-block characters would otherwise happily do. */
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

/* The mark is drawn in a 138 x 100 unit box: two leaning bars and three dots,
   measured off the end card still. Note this is deliberately not the favicon
   geometry at /hubfs/Site Images/Align Favicon.svg: that is the standalone
   icon, whose bars lean about 44 degrees, where the bars in the wordmark
   lockup are much more upright. The favicon ships as assets/logos/align-mark.svg.
   WORDMARK_PATH is traced from the same still, in its own 494 x 190 box. */
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

function q(root, sel) { return root.querySelector(sel); }
function qa(root, sel) { return Array.from(root.querySelectorAll(sel)); }

/* letters materialise left to right, blurred to sharp, the way the reference
   video reveals its headlines */
function revealChars(el, lt, start, opt = {}) {
  const per = opt.per ?? 0.026;
  const dur = opt.dur ?? 0.66;
  const dy = opt.dy ?? 38;
  const blur = opt.blur ?? 18;
  if (!el.__chs) el.__chs = qa(el, '.ch');
  el.__chs.forEach((c, i) => {
    const p = E.easeOutCubic(seg(lt, start + i * per, start + i * per + dur));
    c.style.opacity = p.toFixed(3);
    c.style.transform = `translate3d(0,${((1 - p) * dy).toFixed(2)}px,0)`;
    c.style.filter = p >= 1 ? 'none' : `blur(${((1 - p) * blur).toFixed(2)}px)`;
  });
}

function showEyebrow(root, lt, start = 0.12) {
  const eb = q(root, '[data-eyebrow]');
  if (!eb) return;
  const p = E.easeOutCubic(seg(lt, start, start + 0.5));
  eb.style.opacity = p.toFixed(3);
  eb.style.transform = `translate3d(${((1 - p) * -22).toFixed(2)}px,0,0)`;
  eb.querySelector('i').style.transform = `scaleX(${E.easeOutQuart(seg(lt, start, start + 0.62)).toFixed(3)})`;
}

function showBody(root, lt, start) {
  const b = q(root, '.body');
  if (!b) return;
  const p = E.easeOutCubic(seg(lt, start, start + 0.7));
  b.style.opacity = (p * 0.98).toFixed(3);
  b.style.transform = `translate3d(0,${((1 - p) * 26).toFixed(2)}px,0)`;
  b.style.filter = p >= 1 ? 'none' : `blur(${((1 - p) * 8).toFixed(2)}px)`;
}

function showGhost(root, lt, dur) {
  const g = q(root, '.ghost');
  if (!g) return;
  const inP = E.easeOutCubic(seg(lt, 0, 0.9));
  const drift = seg(lt, 0, dur);
  g.style.opacity = (0.052 * inP).toFixed(4);
  g.style.transform = `translate(-50%,-50%) scale(${lerp(1.0, 1.11, drift).toFixed(4)})`;
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

/* ------------------------------------------------------------------ scenes */

/* Platform marks sit in light cards so each one can wear its own colours: UKG
   and Workday are near black teal and simply disappear on navy.

   Logos differ wildly in proportion, so sizing them to a common width or a
   common height makes some shout and others whisper. Each is scaled to the
   same optical area instead, with a per mark weight for ink density: ADP is a
   heavy outlined slab, Dayforce is airy lowercase. The card's own padding sets
   the clear space, and max-width/max-height on the image is the hard guarantee
   that nothing can ever crowd or overrun its box. */
const LOGO_AREA = 23500;
const PLATFORMS = [
  { key: 'ukg',      name: 'UKG',      aspect: 483 / 186,  weight: 1.00 },
  { key: 'dayforce', name: 'Dayforce', aspect: 900 / 214,  weight: 1.07 },
  { key: 'workday',  name: 'Workday',  aspect: 838 / 337,  weight: 1.00 },
  { key: 'adp',      name: 'ADP',      aspect: 1200 / 545, weight: 0.86 },
];

function platformCell(p) {
  const h = Math.sqrt((LOGO_AREA * p.weight) / p.aspect);
  const w = h * p.aspect;
  return `<div class="pcell"><img src="${LOGOS[p.key]}" alt="${p.name}"
            style="width:${w.toFixed(0)}px;height:${h.toFixed(0)}px"></div>`;
}
const SERVICES = [
  ['Assessments', 'assessments'],
  ['Implementation', 'implementation'],
  ['Training', 'training'],
  ['Integrations', 'integration'],
  ['Data conversion', 'data-conversion'],
  ['SmartCare support', 'support'],
  ['Optimization', 'optimization'],
  ['Fractional teams', 'fractional'],
  ['Client side leads', 'client-side'],
  ['M&A support', 'ma'],
];

function icon(name, cls = '') {
  return `<svg class="ico ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]}</svg>`;
}
// "Go-live" is the one deliberate hyphen on screen: it is the industry term,
// and Align writes it that way. build/copycheck.mjs allowlists it.
const FRICTION = ['Data conversion', 'Integrations', 'Parallel payroll', 'Go-live', 'Adoption'];

const SCENES = [

  /* 1. cold open ------------------------------------------------------- */
  {
    id: 's1', in: 0.0, out: 4.2,
    html: `
      <div class="ghost wide">HCM</div>
      <div class="pad">
        ${eyebrow('Human Capital Management')}
        <h1 class="serif" data-h1>${typeset('Go-live is not|*the finish line*.')}</h1>
      </div>`,
    draw(root, lt, dur) {
      showGhost(root, lt, dur);
      showEyebrow(root, lt, 0.1);
      revealChars(q(root, '[data-h1]'), lt, 0.34, { per: 0.031 });
    },
  },

  /* 2. the turn -------------------------------------------------------- */
  {
    id: 's2', in: 4.2, out: 8.3,
    html: `
      <div class="ghost">NOW WHAT</div>
      <div class="pad">
        <h1 class="serif sm" data-h1>${typeset('The platform is live.|The *operation* has to run.')}</h1>
        <p class="body">One absence can move a schedule, trigger overtime, reassign a credentialed
          employee, and create a payroll exception <span class="hi">before the shift is over</span>.</p>
      </div>`,
    draw(root, lt, dur) {
      showGhost(root, lt, dur);
      revealChars(q(root, '[data-h1]'), lt, 0.06, { per: 0.028 });
      showBody(root, lt, 0.86);
      const glow = seg(lt, 0.7, 1.3);
      qa(root, '.accent .ch').forEach(c => {
        c.style.textShadow = `0 0 ${34 + glow * 22}px rgba(240,153,76,${0.4 + glow * 0.3}), 0 0 ${84 + glow * 40}px rgba(240,90,40,${0.22 + glow * 0.2})`;
      });
    },
  },

  /* 3. the same five walls, chips stagger in --------------------------- */
  {
    id: 's3', in: 8.3, out: 13.0,
    html: `
      <div class="pad" style="right:840px">
        ${eyebrow('Operational realities')}
        <h1 class="serif s3" data-h1>${typeset('Every rollout hits|the same five walls.')}</h1>
      </div>
      <div class="chips">
        ${FRICTION.map(f => `<div class="chip">${f}</div>`).join('')}
      </div>`,
    draw(root, lt, dur) {
      showEyebrow(root, lt, 0.08);
      revealChars(q(root, '[data-h1]'), lt, 0.24, { per: 0.019, dur: 0.6 });
      qa(root, '.chip').forEach((c, i) => {
        const s = 0.9 + i * 0.2;
        const p = E.easeOutBack(seg(lt, s, s + 0.56));
        const flare = pulse(lt, s, s + 0.26, s + 0.5, s + 1.3);
        c.style.opacity = E.easeOutCubic(seg(lt, s, s + 0.3)).toFixed(3);
        c.style.transform = `translate3d(${((1 - p) * 86).toFixed(2)}px,0,0) scale(${lerp(0.86, 1, clamp01(p)).toFixed(3)})`;
        c.style.boxShadow = `0 20px 54px rgba(4,8,18,.55), `
          + `0 0 ${(26 + flare * 54).toFixed(0)}px rgba(240,120,50,${(0.18 + flare * 0.42).toFixed(3)}), `
          + `inset 0 1px 0 rgba(255,214,170,${(0.14 + flare * 0.22).toFixed(3)})`;
      });
    },
  },

  /* 4. burst into the logo --------------------------------------------- */
  {
    id: 's4', in: 13.0, out: 16.6,
    html: `
      <div class="burst"></div>
      <div class="ring"></div>
      <div class="center" data-lock>${lockupSVG('l4')}</div>`,
    draw(root, lt, dur) {
      const b = q(root, '.burst');
      const bp = seg(lt, 0.0, 0.62);
      b.style.opacity = (pulse(lt, 0.0, 0.16, 0.34, 0.95) * 0.95).toFixed(3);
      b.style.transform = `scale(${lerp(0.16, 1.5, E.easeOutExpo(bp)).toFixed(3)})`;

      const r = q(root, '.ring');
      const rp = E.easeOutExpo(seg(lt, 0.04, 1.0));
      r.style.opacity = ((1 - seg(lt, 0.1, 0.8)) * 0.85).toFixed(3);
      r.style.transform = `scale(${lerp(0.2, 4.6, rp).toFixed(3)})`;

      const lock = q(root, '[data-lock]');
      const assemble = seg(lt, 0.22, 1.5);
      drawLockup(root, 'l4', assemble);
      const settle = E.easeOutQuart(seg(lt, 0.22, 1.3));
      lock.style.transform = `scale(${lerp(0.9, 1, settle).toFixed(4)})`;
    },
    wash(lt) { return pulse(lt, 0.0, 0.1, 0.16, 0.6) * 0.62; },
  },

  /* 5. who we are ------------------------------------------------------ */
  {
    id: 's5', in: 16.6, out: 20.6,
    html: `
      <div class="ghost">SPECIALISTS</div>
      <div class="pad">
        ${eyebrow('Who we are')}
        <h1 class="serif" data-h1>${typeset('We are the team that|*finishes the work*.')}</h1>
        <p class="body">An implementation, support, and optimization firm built entirely around HCM.</p>
      </div>`,
    draw(root, lt, dur) {
      showGhost(root, lt, dur);
      showEyebrow(root, lt, 0.08);
      revealChars(q(root, '[data-h1]'), lt, 0.28, { per: 0.024 });
      showBody(root, lt, 1.05);
    },
  },

  /* 6. platform grid --------------------------------------------------- */
  {
    id: 's6', in: 20.6, out: 25.6,
    html: `
      <div class="pad" style="left:130px;right:130px">
        ${eyebrow('One partner, every platform')}
        <div class="pgrid">${PLATFORMS.map(platformCell).join('')}</div>
        <p class="body" style="max-width:none;text-align:center;font-size:34px">Certified consultants on every platform we support.</p>
      </div>`,
    draw(root, lt, dur) {
      showEyebrow(root, lt, 0.06);
      qa(root, '.pcell').forEach((c, i) => {
        const s = 0.34 + i * 0.13;
        const p = E.easeOutQuart(seg(lt, s, s + 0.66));
        c.style.opacity = p.toFixed(3);
        c.style.transform = `translate3d(0,${((1 - p) * 46).toFixed(2)}px,0) scale(${lerp(0.9, 1, p).toFixed(3)})`;
        c.style.filter = p >= 1 ? 'none' : `blur(${((1 - p) * 12).toFixed(2)}px)`;
        const flare = pulse(lt, s, s + 0.3, s + 0.5, s + 1.15);
        c.style.boxShadow = `0 26px 62px rgba(3,7,16,.55), `
          + `0 0 ${(28 + flare * 46).toFixed(0)}px rgba(240,153,76,${(0.10 + flare * 0.40).toFixed(3)})`;
      });
      showBody(root, lt, 1.5);
    },
  },

  /* 7. what we do, ticker ---------------------------------------------- */
  {
    id: 's7', in: 25.6, out: 29.6,
    html: `
      <div class="pad" style="justify-content:flex-start;padding-top:150px">${eyebrow('What we do')}</div>
      <div class="ticker">
        <div class="track">
          ${SERVICES.map(([label, ic], i) => `<div class="row" data-i="${i}">${icon(ic)}<span class="num">${String(i + 1).padStart(2, '0')}</span>${label}</div>`).join('')}
        </div>
      </div>`,
    draw(root, lt, dur) {
      showEyebrow(root, lt, 0.04);
      const N = SERVICES.length;
      const run = seg(lt, 0.28, dur - 0.2);
      const k = run * (N - 1);
      const i0 = Math.floor(k), fr = k - i0;
      const pos = i0 + E.easeInOutQuart(clamp01((fr - 0.3) / 0.55));
      const enter = E.easeOutCubic(seg(lt, 0.1, 0.6));
      qa(root, '.row').forEach((r, i) => {
        const d = i - pos;
        const ad = Math.abs(d);
        r.style.transform = `translate3d(0,${(d * 132 - 60).toFixed(2)}px,0) scale(${Math.max(0.6, 1 - ad * 0.11).toFixed(3)})`;
        r.style.opacity = (Math.max(0, 1 - ad * 0.46) * enter).toFixed(3);
        r.style.filter = ad < 0.25 ? 'none' : `blur(${Math.min(9, ad * 3.4).toFixed(2)}px)`;
        r.style.color = ad < 0.5 ? '#ffffff' : '#8ea0c4';
      });
    },
  },

  /* 8. SmartCare bracket ------------------------------------------------ */
  {
    id: 's8', in: 29.6, out: 33.6,
    html: `
      <div class="center">
        <div class="bracket">
          <span class="br" data-l>{</span>
          <div class="sclogo" data-w role="img" aria-label="SmartCare by Align HCM">${SMARTCARE_SVG}</div>
          <span class="br" data-r>}</span>
        </div>
        <p class="body" style="text-align:center;margin-top:30px;max-width:none">Ongoing HCM support after go-live. <span class="hi">Most callbacks inside the hour.</span></p>
      </div>`,
    draw(root, lt, dur) {
      const lp = E.easeOutBack(seg(lt, 0.06, 0.68));
      const rp = E.easeOutBack(seg(lt, 0.12, 0.74));
      q(root, '[data-l]').style.transform = `translate3d(${((1 - lp) * -140).toFixed(1)}px,0,0)`;
      q(root, '[data-r]').style.transform = `translate3d(${((1 - rp) * 140).toFixed(1)}px,0,0)`;
      q(root, '[data-l]').style.opacity = clamp01(lp * 1.5).toFixed(3);
      q(root, '[data-r]').style.opacity = clamp01(rp * 1.5).toFixed(3);
      const wp = E.easeOutQuart(seg(lt, 0.34, 1.0));
      const w = q(root, '[data-w]');
      w.style.opacity = wp.toFixed(3);
      w.style.transform = `scale(${lerp(0.86, 1, wp).toFixed(3)})`;
      w.style.filter = wp >= 1 ? 'none' : `blur(${((1 - wp) * 16).toFixed(2)}px)`;
      showBody(root, lt, 1.05);
    },
  },

  /* 9. the review count rolls up ---------------------------------------- */
  {
    id: 's9', in: 33.6, out: 38.0,
    html: `
      <div class="center">
        <div class="countline"><span class="num" data-num>0</span><span class="lab" data-lab>five star reviews</span></div>
        <div class="stars">${'<span>&#9733;</span>'.repeat(5)}</div>
      </div>`,
    draw(root, lt, dur) {
      const p = E.easeOutExpo(seg(lt, 0.18, 1.75));
      const v = Math.round(p * 100);
      q(root, '[data-num]').textContent = v >= 100 ? '100+' : String(v);
      const n = q(root, '[data-num]');
      n.style.opacity = E.easeOutCubic(seg(lt, 0.1, 0.4)).toFixed(3);
      n.style.transform = `scale(${lerp(0.82, 1, E.easeOutBack(seg(lt, 0.1, 0.9))).toFixed(3)})`;
      const lp = E.easeOutCubic(seg(lt, 0.95, 1.6));
      const lab = q(root, '[data-lab]');
      lab.style.opacity = lp.toFixed(3);
      lab.style.transform = `translate3d(${((1 - lp) * 34).toFixed(2)}px,0,0)`;
      qa(root, '.stars span').forEach((s, i) => {
        const sp = E.easeOutBack(seg(lt, 1.35 + i * 0.075, 1.35 + i * 0.075 + 0.4));
        s.style.opacity = clamp01(sp * 1.5).toFixed(3);
        s.style.transform = `scale(${Math.max(0, sp).toFixed(3)})`;
      });
    },
    wash(lt) { return pulse(lt, 1.7, 1.82, 1.86, 2.3) * 0.2; },
  },

  /* 10. the outcome ----------------------------------------------------- */
  {
    id: 's10', in: 38.0, out: 42.6,
    html: `
      <div class="ghost">OUTCOMES</div>
      <div class="pad">
        ${eyebrow('Operational impact')}
        <h1 class="serif sm" data-h1>${typeset('From system problems|to *measurable outcomes*.')}</h1>
      </div>`,
    draw(root, lt, dur) {
      showGhost(root, lt, dur);
      showEyebrow(root, lt, 0.08);
      revealChars(q(root, '[data-h1]'), lt, 0.26, { per: 0.021 });
    },
  },

  /* 11. kill complexity, light sweep ------------------------------------ */
  {
    id: 's11', in: 42.6, out: 46.8,
    html: `
      <div class="center">
        <div class="sweepwrap" style="font-family:var(--serif);font-weight:700;font-size:168px;letter-spacing:-.01em">
          <span class="base" data-base>Kill complexity.</span>
          <span class="shine" data-shine>Kill complexity.</span>
        </div>
      </div>`,
    draw(root, lt, dur) {
      const p = E.easeOutQuart(seg(lt, 0.1, 0.95));
      const base = q(root, '[data-base]');
      const wrap = q(root, '.sweepwrap');
      base.style.opacity = p.toFixed(3);
      base.style.filter = p >= 1 ? 'none' : `blur(${((1 - p) * 22).toFixed(2)}px)`;
      wrap.style.transform = `scale(${lerp(1.06, 1, p).toFixed(4)})`;
      const sp = seg(lt, 0.85, 2.05);
      const sh = q(root, '[data-shine]');
      sh.style.opacity = pulse(lt, 0.85, 0.95, 1.9, 2.1).toFixed(3);
      sh.style.backgroundPosition = `${lerp(-70, 170, E.easeInOutCubic(sp)).toFixed(1)}% 0`;
    },
  },

  /* 12. end card, rebuilt from the supplied still ------------------------ */
  {
    id: 's12', in: 46.8, out: 52.6,
    html: `
      <div class="endcard">
        <div data-lock>${lockupSVG('l12', 940)}</div>
        <div class="lockup-cap" data-cap>Human Capital Management</div>
        <div class="hairline" data-hair></div>
        <div class="tag" data-tag>Built for the people <span class="accent">who keep it running.</span></div>
        <div class="url" data-url>ALIGNHCM.COM</div>
      </div>`,
    draw(root, lt, dur) {
      drawLockup(root, 'l12', seg(lt, 0.1, 1.5));
      const lock = q(root, '[data-lock]');
      const lp = E.easeOutQuart(seg(lt, 0.05, 1.2));
      lock.style.transform = `scale(${lerp(0.94, 1, lp).toFixed(4)})`;

      const cap = q(root, '[data-cap]');
      const cp = E.easeOutCubic(seg(lt, 0.95, 1.6));
      cap.style.opacity = cp.toFixed(3);
      cap.style.letterSpacing = `${lerp(0.34, 0.215, cp).toFixed(4)}em`;

      const hp = E.easeOutQuart(seg(lt, 1.35, 2.0));
      q(root, '[data-hair]').style.transform = `scaleX(${hp.toFixed(3)})`;

      const tag = q(root, '[data-tag]');
      const tp = E.easeOutQuart(seg(lt, 1.6, 2.5));
      tag.style.opacity = tp.toFixed(3);
      tag.style.transform = `translate3d(0,${((1 - tp) * 24).toFixed(2)}px,0)`;
      tag.style.filter = tp >= 1 ? 'none' : `blur(${((1 - tp) * 10).toFixed(2)}px)`;

      const up = E.easeOutCubic(seg(lt, 2.3, 3.0));
      const url = q(root, '[data-url]');
      url.style.opacity = (up * 0.95).toFixed(3);
      url.style.letterSpacing = `${lerp(0.6, 0.38, up).toFixed(4)}em`;
    },
    wash(lt) { return pulse(lt, 0.0, 0.08, 0.12, 0.5) * 0.28; },
  },
];

/* ------------------------------------------------------------------- build */

const stage = document.getElementById('stage');
const layerScenes = document.getElementById('scenes');

SCENES.forEach(s => {
  const el = document.createElement('div');
  el.className = 'scene';
  el.id = s.id;
  el.innerHTML = s.html;
  layerScenes.appendChild(el);
  s.el = el;
});

/* Watermark words vary a lot in length. Measure each one once the webfonts are
   in and shrink it so it always sits inside the frame instead of bleeding off
   both edges. */
function fitGhosts() {
  document.querySelectorAll('.ghost').forEach(g => {
    const base = parseFloat(getComputedStyle(g).fontSize);
    const w = g.offsetWidth;
    if (w > 1620) g.style.fontSize = (base * (1620 / w)).toFixed(1) + 'px';
  });
}

/* Scenes start hidden, so the browser never requests the faces they use and
   document.fonts.ready resolves against nothing. Force every scene visible for
   one layout pass first, so the real fonts are pending when we wait on them.
   Without this the exporter can write early frames in fallback metrics. */
const FACES = [
  '400 16px Inter', '500 16px Inter', '600 16px Inter', '700 16px Inter', '800 16px Inter',
  '700 16px "Playfair Display"', '900 16px "Playfair Display"', 'italic 700 16px "Playfair Display"',
];

async function warmup() {
  await Promise.all(FACES.map(f => document.fonts.load(f)));
  await document.fonts.ready;
  const scenes = Array.from(document.querySelectorAll('.scene'));
  const was = scenes.map(s => s.classList.contains('on'));
  scenes.forEach(s => s.classList.add('on'));
  void document.body.offsetHeight;
  fitGhosts();
  scenes.forEach((s, i) => { if (!was[i]) s.classList.remove('on'); });
}

const orbBlue = document.querySelector('.bg-orb.blue');
const orbEmber = document.querySelector('.bg-orb.ember');
const orbAccent = document.querySelector('.bg-orb.accent');
const washEl = document.querySelector('.wash');
const ruleTop = document.querySelector('.rule-top');
const footerEl = document.querySelector('.footer');
const grainEl = document.querySelector('.bg-grain');

/* ------------------------------------------------------------------- seek */

const LAP = 0.20;   /* seconds of overlap between consecutive scenes */

function seek(t) {
  t = Math.max(0, Math.min(DURATION, t));

  /* ambient drift, slow enough to read as a living stage rather than motion */
  orbBlue.style.transform = `translate3d(${(Math.sin(t * 0.20) * 90).toFixed(2)}px,${(Math.cos(t * 0.15) * 60).toFixed(2)}px,0) scale(${(1 + Math.sin(t * 0.11) * 0.08).toFixed(4)})`;
  orbEmber.style.transform = `translate3d(${(Math.cos(t * 0.17) * -80).toFixed(2)}px,${(Math.sin(t * 0.13) * 55).toFixed(2)}px,0) scale(${(1 + Math.cos(t * 0.09) * 0.1).toFixed(4)})`;
  grainEl.style.transform = `translate3d(${((t * 37) % 180).toFixed(1)}px,${((t * 23) % 180).toFixed(1)}px,0)`;

  /* top rule draws in at the head, footer joins a beat later */
  ruleTop.style.transform = `scaleX(${E.easeOutExpo(seg(t, 0.05, 1.4)).toFixed(4)})`;
  footerEl.style.opacity = (E.easeOutCubic(seg(t, 0.5, 1.5)) * (1 - seg(t, DURATION - 0.35, DURATION) * 0.0)).toFixed(3);

  let wash = 0;
  let accentGlow = 0;

  for (const s of SCENES) {
    const live = t >= s.in && t < s.out + LAP;
    if (live !== s.__live) { s.el.classList.toggle('on', live); s.__live = live; }
    if (!live) continue;

    const dur = s.out - s.in;
    const lt = t - s.in;

    /* A scene hangs on for LAP seconds past its out point while the next one
       fades up over the same window. The two opacities sum to roughly one, so
       a cut never dips through black, and the incoming content is already
       forming by the time the outgoing clears. */
    const inP = E.easeOutCubic(seg(lt, 0, LAP));
    const outP = E.easeInCubic(seg(lt, dur, dur + LAP));
    s.el.style.opacity = (inP * (1 - outP)).toFixed(3);
    s.el.style.transform = `scale(${(lerp(1.03, 1.0, inP) * lerp(1, 1.035, outP)).toFixed(4)})`;

    /* content freezes at its end state through the overlap */
    s.draw(s.el, Math.min(lt, dur), dur);
    if (s.wash) wash = Math.max(wash, s.wash(lt));
    if (s.id === 's4') accentGlow = pulse(lt, 0, 0.14, 0.3, 1.1);
  }

  washEl.style.opacity = wash.toFixed(3);
  orbAccent.style.opacity = (accentGlow * 0.75).toFixed(3);
  orbAccent.style.transform = `scale(${(1 + accentGlow * 0.7).toFixed(3)})`;
}

window.__seek = seek;
window.DURATION = DURATION;
window.FPS = FPS;
/* the exporter and the live player both wait on this before the first paint */
window.__ready = warmup();

/* ------------------------------------------------------------- fit + player */

function fit() {
  const pad = document.body.classList.contains('export') ? 0 : 60;
  const s = Math.min((window.innerWidth - pad) / 1920, (window.innerHeight - pad) / 1080);
  stage.style.transform = `scale(${s})`;
}
window.addEventListener('resize', fit);
fit();

(function player() {
  const ui = document.getElementById('ui');
  if (!ui) return;
  const btn = ui.querySelector('button');
  const range = ui.querySelector('input');
  const read = ui.querySelector('.t');
  range.max = String(DURATION);
  let playing = false, raf = 0, last = 0, head = 0;

  function paint() {
    range.value = String(head);
    read.textContent = head.toFixed(2) + ' / ' + DURATION.toFixed(2) + ' s';
    seek(head);
  }
  function tick(now) {
    if (!playing) return;
    const dt = (now - last) / 1000; last = now;
    head += dt;
    if (head >= DURATION) { head = 0; }
    paint();
    raf = requestAnimationFrame(tick);
  }
  btn.onclick = () => {
    playing = !playing;
    btn.textContent = playing ? 'Pause' : 'Play';
    if (playing) { last = performance.now(); raf = requestAnimationFrame(tick); }
    else cancelAnimationFrame(raf);
  };
  range.oninput = () => { head = parseFloat(range.value); paint(); };
  window.__ready.then(paint);
})();
