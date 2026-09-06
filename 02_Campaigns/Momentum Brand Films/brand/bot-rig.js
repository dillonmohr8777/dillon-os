/* Momentum Bot — rig.
   brand/momentum-bot.svg + this file are the whole character. No alternate artwork
   exists and none may be added: every pose in every film is this one shape set with
   different numbers on it.

   ES module, zero dependencies.

     import { mountBot, poseBot, idleBot, MOUTHS } from "../../brand/bot-rig.js";
     const markup = await (await fetch("../../brand/momentum-bot.svg")).text();
     const bot = mountBot(document.querySelector("#bot"), { markup });
     poseBot(bot, { look: [3, -2], blink: 0, mouth: "smile", tilt: -4, bob: -3 });

   PURITY CONTRACT — this module is a pure function of its arguments.
   No timers, no requestAnimationFrame, no Date, no Math.random, no internal state
   that survives a call. poseBot(el, P) called twice with the same P paints an
   identical frame, so render/capture.py can drive it from seek(t) and scrub.

   ------------------------------------------------------------------------------
   poseBot(target, params) — every parameter, its range, and what it does.

   THE DOCUMENTED API (the six the brief names)
     look    [x, y]   -8..8 each, viewBox units. Gaze. Eyes translate by the full
                      amount, mouth follows at 45% x / 25% y so the face turns as a
                      unit rather than sliding its eyes around. Default [0, 0].
     blink   0..1     0 = open, 1 = shut. Collapses the eye primitive about its own
                      centre; 1 leaves a 1.6-unit ink line, never a gap. Default 0.
     mouth   string   'neutral' | 'smile' | 'talk' | 'flat' | 'o'. See MOUTHS.
                      Default 'neutral'.
     tilt    deg      -14..14. Whole body, pivoting at the base (94, 181) so the bot
                      leans like a weeble instead of spinning about its middle.
                      Beyond ~14 it reads as falling over. Default 0.
     bob     units    -10..10, negative is up. Whole body. Default 0.
     scale   number   0.55..1, about the same base pivot. Default 1. Above 1 the artwork
                      leaves the artboard — to render the bot larger, size the container
                      (the <svg> element), do not scale past 1 here.

   EXTENSIONS (optional; safe to ignore, all default to the neutral pose)
     talk     0..1    Mouth openness when mouth === 'talk'. Drive it from t.
                      Default 0.5.
     squash   -0.09..0.09  + is wide-and-short (impact, settle), - is tall-and-thin
                      (anticipation, lift). Volume is preserved by construction. Measured
                      envelope: safe alone across the full range and safe with bob alone,
                      but a lift stacked on a lift is not — with bob below -6, keep
                      |squash| at or under 0.05 or the m clears the top of the artboard.
     eyeArc   -1..1   +1 pleased crescent (lower lid up), 0 round, -1 wide-open.
     lid      0..1    A body-coloured plate, clipped to the live eye, drawn DOWN from
                      the top. Different from blink: blink collapses the eye about its
                      own centre and leaves an ink line; lid cuts a straight edge across
                      it, which is what reads as heavy / sceptical / concentrating.
     eyeRot   deg     -14..14, mirrored. + drops the inner corners = stern.
     brow     -1..1   0 = brows absent (they are opacity 0 and cost nothing at rest).
                      + raised (open, surprised), - furrowed (concentrating).
     sway     deg     -22..22. The script m about its root in the ring's opening.
     mFlex    -0.25..0.20 The m stretches about its root. Safe across that whole range,
                      including with bob at -10. The rig does not clamp; past +0.20 the
                      first arch eventually clears the artboard.
     mSkew    deg     -8..8. The m leans.
     mouthShift units  -9..9. Slides the mouth sideways on the face. A flat mouth
                      pushed to one cheek is the cheapest deadpan in the rig.
     signal   0..1    >0.5 shows the orange spark at the m's exit flick. Hidden by
                      default so the neutral shape count never pays for an accent.
     catchlight 0..1  >0.5 shows two white specks in the eyes. Off by default; the
                      reference mascot has none and neither do we at rest.
   ------------------------------------------------------------------------------ */

const K = 0.5523;                        /* circle constant: blob(r, r, r) is a true circle */
const EYE_R = 19, EYE_ASYM = 0.942;               /* the right eye is 6% smaller and sits 1.2 lower */
const EYE_LX = 77, EYE_LY = 110.4, EYE_RX = 123, EYE_RY = 111.6;
const MOUTH_X = 100, MOUTH_Y = 141;
const ANT_X = 86, ANT_Y = 68;            /* the m's root, in the ring's opening */
const PIVOT_X = 94, PIVOT_Y = 181;       /* base pivot: the bot leans, it does not spin */

/* THE ONE PRIMITIVE.
   Both eyes and the mouth are instances of this. w = half width, up = rise above the
   baseline, down = drop below it. Negative values are legal and give crescents, which
   is where every expression in the range comes from. */
export function blob(w, up, down) {
  const a = (n) => Math.round(n * 1000) / 1000;
  return `M${a(-w)} 0` +
    `C${a(-w)} ${a(-up * K)} ${a(-w * K)} ${a(-up)} 0 ${a(-up)}` +
    `C${a(w * K)} ${a(-up)} ${a(w)} ${a(-up * K)} ${a(w)} 0` +
    `C${a(w)} ${a(down * K)} ${a(w * K)} ${a(down)} 0 ${a(down)}` +
    `C${a(-w * K)} ${a(down)} ${a(-w)} ${a(down * K)} ${a(-w)} 0Z`;
}

/* Mouth shapes, as [halfWidth, rise, drop]. A negative rise tucks the top lip below
   the baseline and gives the flat-topped ink crescent; a positive rise opens it. */
export const MOUTHS = {
  neutral: [10.5, -1.6, 8.6],  /* small closed smile, flat on top */
  smile:   [14, -0.4, 14.5],   /* open grin */
  flat:    [11, 1, 1],         /* a closed line. this is the deadpan */
  o:       [6.6, 7.4, 7.4],    /* round, surprised */
  talk:    null                /* computed from params.talk */
};

const DEFAULTS = {
  look: [0, 0], blink: 0, mouth: "neutral", talk: 0.5,
  tilt: 0, bob: 0, scale: 1, squash: 0, mouthShift: 0,
  eyeArc: 0, lid: 0, eyeRot: 0, brow: 0,
  sway: 0, mFlex: 0, mSkew: 0, signal: 0, catchlight: 0
};

/* Named poses. Presets are a convenience only — a film may pass raw numbers. */
export const POSES = {
  neutral:   {},
  thinking:  { tilt: -5, bob: -2, squash: 0.02, lid: 0.42, look: [5, -5],
               mouth: "flat", mouthShift: -6.5, brow: -0.25, sway: 15, mFlex: -0.14, mSkew: 3 },
  pleased:   { tilt: 4, bob: -4.5, squash: -0.035, eyeArc: 1, mouth: "smile",
               sway: -9, mFlex: 0.16, mSkew: -2 },
  focused:   { tilt: 0, bob: 1.5, squash: 0.04, lid: 0.16, eyeRot: 13,
               look: [0, 1], mouth: "flat", brow: -0.8, sway: 3, mFlex: -0.2 },
  surprised: { tilt: 6, bob: -7, squash: -0.055, eyeArc: -1, look: [0, -1.5],
               mouth: "o", brow: 0.85, sway: -12, signal: 1, mFlex: 0.05, mSkew: -4 },
  talking:   { tilt: -2, bob: -1, mouth: "talk", talk: 0.7, look: [1.5, 0], sway: 6, brow: 0.25 },
  blink:     { blink: 1 }
};

let seq = 0;

/* ---------------------------------------------------------------- mount */

/* mountBot(host, { markup, prefix, size })
   host   — an element to render into (its contents are replaced), or an element that
            already contains an <svg> from momentum-bot.svg (pass no markup).
   markup — the text of brand/momentum-bot.svg. Fetch it once and reuse the string.
   prefix — optional instance id prefix; one is generated if omitted.
   size   — optional CSS width applied to the svg (e.g. "120px").
   Returns a handle: { host, svg, refs, pose(params) }. Ids inside the SVG are
   rewritten to the instance prefix so any number of bots can share one document. */
export function mountBot(host, opts = {}) {
  let svg;
  if (opts.markup) {
    const pfx = opts.prefix || `mb${++seq}-`;
    host.innerHTML = opts.markup.split("mb-").join(pfx);
    svg = host.querySelector("svg");
    svg.__mbPrefix = pfx;
  } else {
    svg = host.tagName && host.tagName.toLowerCase() === "svg" ? host : host.querySelector("svg");
    if (!svg) throw new Error("mountBot: no markup given and no <svg> in host");
    if (!svg.__mbPrefix) svg.__mbPrefix = "mb-";
  }
  svg.removeAttribute("width");
  svg.removeAttribute("height");
  if (opts.size) { svg.style.width = opts.size; svg.style.height = opts.size; }

  const p = svg.__mbPrefix;
  const g = (n) => svg.querySelector(`[id="${p}${n}"]`);
  svg.__mbRefs = {
    fit: g("fit"), root: g("root"), body: g("body"), ring: g("ring"),
    antenna: g("antenna"), mStroke: g("m-stroke"), spark: g("spark"),
    eyeL: g("eye-l"), eyeR: g("eye-r"),
    clipL: g("clipshape-l"), clipR: g("clipshape-r"),
    lidL: g("lid-l"), lidR: g("lid-r"),
    pupilL: g("pupil-l"), pupilR: g("pupil-r"),
    mouth: g("mouth"), browL: g("brow-l"), browR: g("brow-r")
  };
  const handle = {
    host, svg, refs: svg.__mbRefs,
    pose(params) { poseBot(svg, params); return handle; }
  };
  poseBot(svg, {});
  return handle;
}

/* ----------------------------------------------------------------- pose */

function resolveTarget(t) {
  if (!t) throw new Error("poseBot: no target");
  if (t.svg) return t.svg;                                   /* a handle */
  if (t.tagName && t.tagName.toLowerCase() === "svg") return t;
  const s = t.querySelector && t.querySelector("svg");
  if (!s) throw new Error("poseBot: target contains no mounted bot");
  return s;
}

function merge(params) {
  let p = params;
  if (typeof p === "string") p = POSES[p] || {};
  const o = {};
  for (const k in DEFAULTS) o[k] = (p && p[k] !== undefined) ? p[k] : DEFAULTS[k];
  o.look = [o.look[0] || 0, o.look[1] || 0];
  return o;
}

/* Eye shape from the arc / lid / blink numbers. One primitive, three dials.
   eyeArc  > 0 lifts the lower contour past the baseline  -> pleased crescent
   eyeArc  < 0 inflates both contours                     -> wide-open
   blink       collapses both toward a 1.6-unit line      -> shut
   The lid is NOT here: it is a clipped plate applied over the finished eye, so the
   eye keeps its round lower contour and gains a straight upper edge. */
function eyeGeom(p) {
  const pos = Math.max(0, p.eyeArc), neg = Math.max(0, -p.eyeArc);
  let up = EYE_R * (1 + 0.20 * neg - 0.05 * pos);
  let down = EYE_R * (1 + 0.20 * neg - 1.28 * pos);
  const shut = 0.8;
  const open = 1 - Math.max(0, Math.min(1, p.blink));
  up = shut + (up - shut) * open;
  down = shut + (down - shut) * open;
  return { w: EYE_R * (1 + 0.06 * neg), up, down };
}

function mouthGeom(p) {
  if (p.mouth === "talk") {
    const a = Math.max(0, Math.min(1, p.talk));
    return [10.4 - 3.6 * a, -1.4 + 8.4 * a, 3.4 + 4.8 * a];
  }
  return MOUTHS[p.mouth] || MOUTHS.neutral;
}

export function poseBot(target, params) {
  const svg = resolveTarget(target);
  const r = svg.__mbRefs;
  if (!r) throw new Error("poseBot: target was never mounted");
  const p = merge(params);
  const s = p.squash, sc = p.scale;

  /* whole body: bob, then scale + lean + squash about the base pivot */
  r.root.setAttribute("transform",
    `translate(0,${p.bob.toFixed(3)}) translate(${PIVOT_X},${PIVOT_Y})` +
    ` rotate(${p.tilt.toFixed(3)}) scale(${(sc * (1 + s)).toFixed(5)},${(sc * (1 - s)).toFixed(5)})` +
    ` translate(${-PIVOT_X},${-PIVOT_Y})`);

  /* eyes — same primitive twice, the right one 6% smaller and 1.2 lower.
     That deliberate inequality is what makes the pair read as looking, not staring. */
  const e = eyeGeom(p);
  const dL = blob(e.w, e.up, e.down);
  const dR = blob(e.w * EYE_ASYM, e.up * EYE_ASYM, e.down * EYE_ASYM);
  const tl = `translate(${(EYE_LX + p.look[0]).toFixed(3)},${(EYE_LY + p.look[1]).toFixed(3)}) rotate(${p.eyeRot.toFixed(2)})`;
  const tr = `translate(${(EYE_RX + p.look[0]).toFixed(3)},${(EYE_RY + p.look[1]).toFixed(3)}) rotate(${(-p.eyeRot).toFixed(2)})`;
  r.eyeL.setAttribute("d", dL); r.eyeL.setAttribute("transform", tl);
  r.eyeR.setAttribute("d", dR); r.eyeR.setAttribute("transform", tr);

  /* lid: a body-coloured plate clipped to the live eye shape, parked above it at 0 */
  if (r.clipL) { r.clipL.setAttribute("d", dL); r.clipL.setAttribute("transform", tl); }
  if (r.clipR) { r.clipR.setAttribute("d", dR); r.clipR.setAttribute("transform", tr); }
  if (r.lidL) {
    const k = Math.max(0, Math.min(1, p.lid));
    const tyL = -e.up + k * (e.up + e.down);
    const tyR = tyL * EYE_ASYM;
    r.lidL.setAttribute("transform", `${tl} translate(0,${tyL.toFixed(3)})`);
    r.lidR.setAttribute("transform", `${tr} translate(0,${tyR.toFixed(3)})`);
  }

  /* catchlights — off unless a film asks */
  if (r.pupilL) {
    const on = p.catchlight > 0.5 ? 1 : 0;
    r.pupilL.setAttribute("opacity", on); r.pupilR.setAttribute("opacity", on);
    if (on) {
      const t = `translate(${p.look[0].toFixed(2)},${p.look[1].toFixed(2)})`;
      r.pupilL.setAttribute("transform", t); r.pupilR.setAttribute("transform", t);
    }
  }

  /* mouth */
  const m = mouthGeom(p);
  r.mouth.setAttribute("d", blob(m[0], m[1], m[2]));
  r.mouth.setAttribute("transform",
    `translate(${(MOUTH_X + p.mouthShift + p.look[0] * 0.45).toFixed(3)},${(MOUTH_Y + p.look[1] * 0.25).toFixed(3)})`);

  /* brows — absent at rest, so the neutral pose is six painted shapes */
  if (r.browL) {
    const b = Math.max(-1, Math.min(1, p.brow));
    const o = Math.abs(b);
    r.browL.setAttribute("opacity", o.toFixed(3));
    r.browR.setAttribute("opacity", o.toFixed(3));
    /* furrow drops the INNER ends, raise lifts them: one signed rotation, mirrored */
    const dy = -4 * b + p.look[1] * 0.8;
    const rot = b < 0 ? -16 * b : -6 * b;
    r.browL.setAttribute("transform",
      `translate(${(EYE_LX + p.look[0]).toFixed(2)},${(EYE_LY + dy).toFixed(2)}) rotate(${rot.toFixed(2)})`);
    r.browR.setAttribute("transform",
      `translate(${(EYE_RX + p.look[0]).toFixed(2)},${(EYE_RY + dy).toFixed(2)}) rotate(${(-rot).toFixed(2)})`);
  }

  /* the script m */
  r.antenna.setAttribute("transform",
    `rotate(${p.sway.toFixed(3)},${ANT_X},${ANT_Y})` +
    ` translate(${ANT_X},${ANT_Y}) scale(1,${(1 + p.mFlex).toFixed(4)}) skewX(${p.mSkew.toFixed(3)})` +
    ` translate(${-ANT_X},${-ANT_Y})`);
  if (r.spark) r.spark.setAttribute("opacity", p.signal > 0.5 ? 1 : 0);

  return svg;
}

/* --------------------------------------------------------------- idle */

/* idleBot(t) -> params. An ambient loop for any film that needs the bot merely
   present: breathe, a slow lean, the m swaying, and a blink every 4.4s. Pure in t
   (seconds); sample it straight out of seek(t) and spread it with poseBot. */
export function idleBot(t, phase = 0) {
  const u = t + phase;
  const breathe = Math.sin(u * 1.9);
  const c = ((u % 4.4) + 4.4) % 4.4;
  const blink = c < 0.16 ? 1 - Math.abs(c - 0.08) / 0.08 : 0;
  return {
    bob: breathe * 2.2,
    squash: -breathe * 0.014,
    tilt: Math.sin(u * 0.9) * 1.6,
    sway: Math.sin(u * 1.3 + 0.6) * 5,
    mFlex: Math.sin(u * 1.9 + 1.2) * 0.05,
    blink: blink
  };
}

/* Merge helper: poseBot(el, mixBot("pleased", idleBot(t))) */
export function mixBot(...parts) {
  const out = {};
  for (const part of parts) {
    const q = typeof part === "string" ? (POSES[part] || {}) : (part || {});
    for (const k in q) out[k] = q[k];
  }
  return out;
}

export default { mountBot, poseBot, idleBot, mixBot, blob, POSES, MOUTHS };
