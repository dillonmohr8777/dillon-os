/* ============================================================================
   ALIGN ACADEMY — "Align in Motion" film
   Deterministic, frame-indexed canvas renderer. renderFrame(n) is pure:
   every particle position is derived from n + a seeded RNG, never accumulated.
   ========================================================================== */

const W = 1920, H = 1080, FPS = 30, TOTAL = 45 * FPS; // 1350

/* ---------------------------------- palette ------------------------------- */
const C = {
  deep:    '#03081A',
  navy:    '#0A1730',
  mid:     '#102953',
  blue:    '#1B4786',
  blueLit: '#2A63AE',
  orange:  '#F0962A',
  orangeHi:'#FFB454',
  orangeLo:'#B4671A',
  white:   '#FFFFFF',
  muted:   '#9DB2CE',
  dim:     '#5C7299'
};

const FS = {
  serif: 'PlayfairFilm',
  sans:  'MontserratFilm',
  body:  'InterFilm'
};

/* --------------------------------- utilities ------------------------------ */
const clamp = (v, a = 0, b = 1) => v < a ? a : v > b ? b : v;
const lerp  = (a, b, t) => a + (b - a) * t;
const inv   = (v, a, b) => clamp((v - a) / (b - a));

const eOutCubic  = t => 1 - Math.pow(1 - t, 3);
const eOutQuart  = t => 1 - Math.pow(1 - t, 4);
const eOutQuint  = t => 1 - Math.pow(1 - t, 5);
const eOutExpo   = t => t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
const eInCubic   = t => t * t * t;
const eInOutCubic= t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const eInOutQuint= t => t < .5 ? 16 * t ** 5 : 1 - Math.pow(-2 * t + 2, 5) / 2;
const eOutBack   = (t, s = 1.5) => 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2);
const smoothstep = t => t * t * (3 - 2 * t);

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
// Pre-baked random tables so per-particle params are stable across frames.
function table(n, seed) { const r = mulberry32(seed), a = new Float32Array(n); for (let i = 0; i < n; i++) a[i] = r(); return a; }
const R1 = table(20000, 1337), R2 = table(20000, 24601), R3 = table(20000, 90210), R4 = table(20000, 5150);

function hexA(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

/* -------------------------------- canvases -------------------------------- */
const main = document.getElementById('stage');
main.width = W; main.height = H;
const M = main.getContext('2d', { alpha: false });

function buf(w = W, h = H) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
const SA = buf(), SB = buf();                 // scene buffers for wipes
const CA = SA.getContext('2d'), CB = SB.getContext('2d');
const BLOOM_S = 4;
const bloomBuf = buf(W / BLOOM_S, H / BLOOM_S);
const BL = bloomBuf.getContext('2d');
const grainBuf = (() => {                     // one static grain tile, scrolled per frame
  const c = buf(512, 512), x = c.getContext('2d');
  const d = x.createImageData(512, 512), r = mulberry32(7);
  for (let i = 0; i < d.data.length; i += 4) {
    const v = 128 + (r() - .5) * 74;
    d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255;
  }
  x.putImageData(d, 0, 0); return c;
})();

/* ------------------------------ text plumbing ----------------------------- */
function setFont(ctx, size, family, weight = 400, spacing = 0) {
  ctx.font = `${weight} ${size}px "${family}"`;
  ctx.letterSpacing = spacing ? `${spacing}px` : '0px';
}

/** Draw a run of styled segments on one line. Returns total width.
 *  segs: [{t:'text', c:'#fff'}, ...]  align: 'left'|'center' */
function drawRun(ctx, segs, x, y, size, family, weight, spacing, align = 'left', alpha = 1) {
  setFont(ctx, size, family, weight, spacing);
  let total = 0;
  for (const s of segs) total += ctx.measureText(s.t).width;
  let cx = align === 'center' ? x - total / 2 : x;
  ctx.textBaseline = 'alphabetic';
  for (const s of segs) {
    ctx.globalAlpha = alpha * (s.a === undefined ? 1 : s.a);
    ctx.fillStyle = s.c;
    ctx.fillText(s.t, cx, y);
    cx += ctx.measureText(s.t).width;
  }
  ctx.globalAlpha = 1;
  return total;
}
function runWidth(ctx, segs, size, family, weight, spacing) {
  setFont(ctx, size, family, weight, spacing);
  let total = 0; for (const s of segs) total += ctx.measureText(s.t).width;
  return total;
}

/* ---- text → particle targets (the "vertices" that shuffle into words) ---- */
const tpCache = new Map();
function textPoints(text, size, family, weight, spacing, stride) {
  const key = [text, size, family, weight, spacing, stride].join('|');
  if (tpCache.has(key)) return tpCache.get(key);
  const probe = SA.getContext('2d');
  setFont(probe, size, family, weight, spacing);
  const m = probe.measureText(text);
  const asc = Math.ceil(m.actualBoundingBoxAscent || size * .8);
  const dsc = Math.ceil(m.actualBoundingBoxDescent || size * .25);
  const pad = 10;
  const w = Math.ceil(m.width) + pad * 2, h = asc + dsc + pad * 2;
  const c = buf(w, h), x = c.getContext('2d');
  setFont(x, size, family, weight, spacing);
  x.textBaseline = 'alphabetic';
  x.fillStyle = '#fff';
  x.fillText(text, pad, pad + asc);
  const d = x.getImageData(0, 0, w, h).data;
  const pts = [];
  for (let yy = 0; yy < h; yy += stride)
    for (let xx = 0; xx < w; xx += stride)
      if (d[(yy * w + xx) * 4 + 3] > 120) pts.push(xx - pad, yy - (pad + asc));
  const out = { pts: new Float32Array(pts), n: pts.length / 2, width: m.width };
  tpCache.set(key, out);
  return out;
}

/** Particles converge onto a word. p=0 scattered, p=1 seated. */
function assembleText(ctx, text, x, y, size, family, weight, spacing, p, seedOff = 0, align = 'left', spread = 320) {
  const tp = textPoints(text, size, family, weight, spacing, 3);
  const ox = align === 'center' ? x - tp.width / 2 : x;
  const n = tp.n;
  ctx.save();
  for (let i = 0; i < n; i++) {
    const r1 = R1[(i + seedOff) % 20000], r2 = R2[(i + seedOff) % 20000],
          r3 = R3[(i + seedOff) % 20000], r4 = R4[(i + seedOff) % 20000];
    // staggered arrival, ordered loosely left→right for a "sweep in" read
    const lead = (tp.pts[i * 2] / Math.max(1, tp.width)) * .34 + r3 * .3;
    const tt = clamp((p - lead * .55) / (1 - lead * .55 * .9));
    if (tt <= 0) continue;
    const e = eOutQuart(tt);
    const ang = r1 * Math.PI * 2;
    const rad = (0.35 + r2 * 1) * spread * (1 - e);
    const tx = ox + tp.pts[i * 2], ty = y + tp.pts[i * 2 + 1];
    const px = tx + Math.cos(ang) * rad + (1 - e) * (r4 - .5) * 60;
    const py = ty + Math.sin(ang) * rad * .55 - (1 - e) * 40;
    const a = clamp(tt * 1.9) * (1 - Math.pow(tt, 14));   // fade as they seat
    if (a <= .01) continue;
    const warm = r2 > .68;
    ctx.globalAlpha = a * (warm ? .95 : .8);
    ctx.fillStyle = warm ? C.orangeHi : '#EAF2FF';
    const s = 1.3 + (1 - e) * 1.9;
    ctx.fillRect(px, py, s, s);
  }
  ctx.restore();
  ctx.globalAlpha = 1;
}

/* ---------------------------------- icons --------------------------------- */
const svgNS = 'http://www.w3.org/2000/svg';
const probeSvg = document.createElementNS(svgNS, 'svg');
const probePath = document.createElementNS(svgNS, 'path');
probeSvg.appendChild(probePath); probeSvg.setAttribute('width', '0'); probeSvg.setAttribute('height', '0');
document.body.appendChild(probeSvg);
const iconCache = new Map();
function iconGeom(name) {
  if (iconCache.has(name)) return iconCache.get(name);
  const g = ICONS[name].map(d => { probePath.setAttribute('d', d); return { d, p: new Path2D(d), L: probePath.getTotalLength() }; });
  iconCache.set(name, g); return g;
}
/** Stroke-on icon. cx,cy = centre. size = box in px. p = draw progress. */
function drawIcon(ctx, name, cx, cy, size, color, p = 1, lw = 1.7, glow = 0) {
  const g = iconGeom(name), k = size / 24;
  ctx.save();
  ctx.translate(cx - size / 2, cy - size / 2);
  ctx.scale(k, k);
  ctx.lineWidth = lw / k;
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = color;
  if (glow > 0) { ctx.shadowColor = color; ctx.shadowBlur = glow / k; }
  const total = g.reduce((s, o) => s + o.L, 0);
  let done = p * total;
  for (const o of g) {
    if (done <= 0) break;
    const seg = Math.min(o.L, done); done -= seg;
    ctx.setLineDash([seg, o.L + 2]);
    ctx.stroke(o.p);
  }
  ctx.setLineDash([]);
  ctx.restore();
}

/* -------------------------------- background ------------------------------ */
/** Shared deep-navy stage: aurora, starfield, warm floor glow, drifting mesh. */
function background(ctx, f, drift = 0, warm = 1) {
  const t = f / FPS;
  ctx.fillStyle = C.deep; ctx.fillRect(0, 0, W, H);

  // upper-left cool key light (matches the reference lighting)
  let g = ctx.createRadialGradient(W * (0.30 + drift * .04), H * 0.13, 30, W * 0.30, H * 0.13, W * 0.76);
  g.addColorStop(0, hexA(C.blueLit, .52));
  g.addColorStop(.24, hexA(C.blue, .27));
  g.addColorStop(.58, hexA(C.mid, .10));
  g.addColorStop(1, 'rgba(3,8,26,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

  // slow drifting aurora lobes
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const lobes = [
    [0.20 + Math.sin(t * .19) * .05, 0.34 + Math.cos(t * .15) * .05, 660, hexA(C.blue, .095)],
    [0.78 + Math.cos(t * .13) * .05, 0.24 + Math.sin(t * .11) * .04, 600, hexA(C.mid, .105)],
    [0.55 + Math.sin(t * .09 + 2) * .06, 0.74 + Math.cos(t * .12) * .04, 720, hexA('#0F3468', .085)]
  ];
  for (const [lx, ly, lr, col] of lobes) {
    const gg = ctx.createRadialGradient(W * lx, H * ly, 0, W * lx, H * ly, lr);
    gg.addColorStop(0, col); gg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gg; ctx.fillRect(0, 0, W, H);
  }
  ctx.restore();

  // warm floor glow (the orange horizon in the reference)
  if (warm > 0) {
    const wg = ctx.createRadialGradient(W * 0.5, H * 1.10, 20, W * 0.5, H * 1.10, W * 0.46);
    wg.addColorStop(0, hexA('#FF9A2E', .40 * warm));
    wg.addColorStop(.34, hexA(C.orangeLo, .17 * warm));
    wg.addColorStop(.70, hexA('#5A2E10', .07 * warm));
    wg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = wg; ctx.fillRect(0, 0, W, H); ctx.restore();
  }

  // drifting node mesh — faint connected "vertices" living behind everything
  const NM = 46;
  const nx = [], ny = [];
  for (let i = 0; i < NM; i++) {
    const a = R1[i] * 6.283, sp = .06 + R2[i] * .11;
    nx.push((R3[i] * 1.2 - .1 + Math.cos(a + t * sp) * .045) * W);
    ny.push((R4[i] * 1.2 - .1 + Math.sin(a + t * sp * 1.3) * .045) * H);
  }
  ctx.save();
  ctx.lineWidth = 1;
  for (let i = 0; i < NM; i++) for (let j = i + 1; j < NM; j++) {
    const dx = nx[i] - nx[j], dy = ny[i] - ny[j], d2 = dx * dx + dy * dy;
    if (d2 > 44000) continue;
    ctx.strokeStyle = hexA('#5C8FD6', .062 * (1 - d2 / 44000));
    ctx.beginPath(); ctx.moveTo(nx[i], ny[i]); ctx.lineTo(nx[j], ny[j]); ctx.stroke();
  }
  for (let i = 0; i < NM; i++) {
    ctx.fillStyle = hexA(R2[i] > .82 ? C.orange : '#8FB4E4', .24);
    ctx.beginPath(); ctx.arc(nx[i], ny[i], 1.6, 0, 6.283); ctx.fill();
  }
  ctx.restore();

  // faint god-rays raking down from the key light
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.translate(W * 0.30, H * 0.05);
  for (let i = 0; i < 7; i++) {
    const a = -1.30 + i * .30 + Math.sin(t * .13 + i) * .020;
    ctx.save(); ctx.rotate(a);
    const rg = ctx.createLinearGradient(0, 0, 0, 1500);
    rg.addColorStop(0, hexA('#9CC4FF', .0062)); rg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = rg;
    const wdt = 150 + i * 40;
    ctx.beginPath(); ctx.moveTo(-wdt * .12, 0); ctx.lineTo(wdt * .12, 0); ctx.lineTo(wdt, 1500); ctx.lineTo(-wdt, 1500);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  ctx.restore();

  // starfield dust
  ctx.save();
  for (let i = 0; i < 190; i++) {
    const k = i + 400;
    const sx = ((R1[k] + t * (.004 + R2[k] * .01)) % 1) * W;
    const sy = ((R3[k] + t * .002) % 1) * H;
    const tw = .30 + .70 * Math.abs(Math.sin(t * (.6 + R4[k] * 1.6) + R1[k] * 9));
    ctx.globalAlpha = (.13 + R2[k] * .30) * tw;
    ctx.fillStyle = R4[k] > .80 ? C.orange : '#CFE0F5';
    const s = R2[k] > .93 ? 2.2 : 1.4;
    ctx.fillRect(sx, sy, s, s);
  }
  ctx.restore();
}

/* --------------------------------- chrome --------------------------------- */
function kicker(ctx, label, x, y, p) {
  const a = clamp(p * 1.4);
  ctx.save();
  ctx.globalAlpha = a;
  const lineW = 42 * eOutQuart(clamp(p * 1.8));
  ctx.strokeStyle = C.orange; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.moveTo(x, y - 6); ctx.lineTo(x + lineW, y - 6); ctx.stroke();
  ctx.globalAlpha = a * clamp((p - .18) * 3);
  setFont(ctx, 19, FS.sans, 600, 5.6);
  ctx.fillStyle = C.orange; ctx.textBaseline = 'alphabetic';
  ctx.shadowColor = hexA(C.orange, .55); ctx.shadowBlur = 14;
  ctx.fillText(label, x + lineW + 22, y);
  ctx.restore();
}

/** Big translucent watermark word, as in the reference frames. */
function ghost(ctx, word, x, y, size, a) {
  ctx.save();
  setFont(ctx, size, FS.sans, 700, 6);
  ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'center';
  ctx.fillStyle = hexA('#8FB4E4', a);
  ctx.fillText(word, x, y);
  ctx.textAlign = 'left';
  ctx.restore();
}

function chrome(ctx, f) {
  // top progress rail
  const p = f / TOTAL;
  ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fillRect(0, 0, W, 4);
  const gg = ctx.createLinearGradient(0, 0, W * p, 0);
  gg.addColorStop(0, hexA(C.orangeLo, .9)); gg.addColorStop(1, C.orangeHi);
  ctx.fillStyle = gg; ctx.fillRect(0, 0, W * p, 4);
  ctx.save(); ctx.shadowColor = C.orange; ctx.shadowBlur = 18;
  ctx.fillStyle = C.orangeHi; ctx.fillRect(Math.max(0, W * p - 3), 0, 3, 4); ctx.restore();

  // footer plate
  const fh = 46;
  const fg = ctx.createLinearGradient(0, H - fh, 0, H);
  fg.addColorStop(0, 'rgba(3,7,18,0.0)'); fg.addColorStop(.45, 'rgba(3,7,18,0.82)'); fg.addColorStop(1, 'rgba(2,5,14,0.96)');
  ctx.fillStyle = fg; ctx.fillRect(0, H - fh, W, fh);
  ctx.strokeStyle = 'rgba(240,150,42,0.22)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, H - fh + .5); ctx.lineTo(W, H - fh + .5); ctx.stroke();

  const y = H - 17;
  ctx.save();
  ctx.fillStyle = C.orange; ctx.beginPath(); ctx.arc(46, y - 5, 3.4, 0, 6.283); ctx.fill();
  setFont(ctx, 14, FS.sans, 700, 2.2);
  ctx.textBaseline = 'alphabetic'; ctx.fillStyle = '#E9F0FA';
  ctx.fillText('ALIGN HCM', 62, y);
  const w1 = ctx.measureText('ALIGN HCM').width;
  setFont(ctx, 14, FS.sans, 500, 2.2);
  ctx.fillStyle = 'rgba(157,178,206,0.72)';
  ctx.fillText('·  ALIGN ACADEMY  ·  ALIGN IN MOTION', 62 + w1 + 16, y);
  setFont(ctx, 14, FS.sans, 600, 2.6);
  ctx.fillStyle = C.orange; ctx.textAlign = 'right';
  ctx.fillText('ALIGNHCM.COM', W - 46, y);
  ctx.textAlign = 'left';
  ctx.restore();
}

/* ------------------------------ post-processing --------------------------- */
function post(ctx, f) {
  // bloom: downscale → blur → add back
  BL.clearRect(0, 0, bloomBuf.width, bloomBuf.height);
  BL.filter = 'brightness(1.28) saturate(1.12) blur(5px)';
  BL.drawImage(main, 0, 0, bloomBuf.width, bloomBuf.height);
  BL.filter = 'none';
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = .27;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bloomBuf, 0, 0, W, H);
  ctx.restore();

  // vignette
  const v = ctx.createRadialGradient(W / 2, H * .46, H * .30, W / 2, H * .5, H * 1.02);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(.62, 'rgba(0,0,0,0.22)'); v.addColorStop(1, 'rgba(0,0,0,0.76)');
  ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);

  // film grain (tile scrolled by frame so it shimmers)
  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  ctx.globalAlpha = .050;
  const ox = -(f * 37) % 512, oy = -(f * 53) % 512;
  for (let x = ox; x < W; x += 512) for (let y = oy; y < H; y += 512) ctx.drawImage(grainBuf, x, y);
  ctx.restore();
}

/* ============================== SCENE CONTENT ============================== */
const AUDIENCE = [
  { icon: 'shieldCheck', t: 'Administrators', s: 'Configuration, troubleshooting, reporting, security, governance' },
  { icon: 'users',       t: 'Managers',       s: 'Decisions, approvals, scheduling, time, talent, workforce actions' },
  { icon: 'userCheck',   t: 'Employees',      s: 'The self-service tasks employees use most often' }
];
const DELIVERY = [
  { icon: 'presentation', t: 'In-person workshops',   s: 'Hands-on, in the room, on your real workflows.' },
  { icon: 'video',        t: 'Virtual sessions',      s: 'Live instruction for distributed teams.' },
  { icon: 'monitorPlay',  t: 'Self-paced e-learning', s: 'Learn on shift, on demand, on any device.' },
  { icon: 'repeat',       t: 'Ongoing reinforcement', s: 'Because training is never a one-time event.' }
];
const INSIDE = [
  { icon: 'target',   t: 'Role-based design',          s: 'Not generic modules — the work each role actually does' },
  { icon: 'route',    t: 'Custom learning paths',      s: 'Built for HR, payroll, IT, finance and project teams' },
  { icon: 'beaker',   t: 'Safe practice environments', s: 'Make the mistakes before they reach production' },
  { icon: 'lifeBuoy', t: 'Post-launch reinforcement',  s: 'Support that keeps going long after go-live' }
];
const OUTCOMES = [
  { icon: 'trendingUp', t: 'Adoption climbs' },
  { icon: 'lifeBuoy',   t: 'Ticket volume falls' },
  { icon: 'workflow',   t: 'Workarounds disappear' },
  { icon: 'badgeCheck', t: 'The investment pays' }
];

/* =============================== THE SCENES ============================== */

/* ---- shared: particle logo (open + close) -------------------------------- */
const LOGO_N = 5200;
function logoParticles(ctx, p, burst, cx, cy, boxW, f) {
  // p: 0 scattered → 1 formed.  burst: 0 → 1 explode outward.
  const L = window.LOGO, ar = L.aspect;
  const bw = boxW, bh = boxW / ar;
  const x0 = cx - bw / 2, y0 = cy - bh / 2;
  const step = Math.max(1, Math.floor(L.pts.length / LOGO_N));
  ctx.save();
  for (let i = 0, k = 0; i < L.pts.length; i += step, k++) {
    const q = L.pts[i];
    const r1 = R1[k % 20000], r2 = R2[k % 20000], r3 = R3[k % 20000], r4 = R4[k % 20000];
    // jitter off the sampling grid so the crowd reads organic, not halftone
    const jx = (r2 - .5) * 3.4, jy = (r4 - .5) * 3.4;
    const sh = f === undefined ? 0 : 1;
    const wob = sh ? Math.sin(f * .07 + r1 * 9) * .9 : 0;
    const tx = x0 + q[0] * bw + jx + wob, ty = y0 + q[1] * bh + jy + Math.cos(f * .06 + r3 * 9) * .9 * sh;
    // arrival stagger — radial from centre outward
    const lead = r3 * .40;
    const tt = clamp((p - lead) / (1 - lead));
    const e = eOutQuint(tt);
    const ang = r1 * 6.283, rad = (140 + r2 * 980) * (1 - e);
    let px = tx + Math.cos(ang) * rad, py = ty + Math.sin(ang) * rad * .62;
    let a = clamp(tt * 2.2);
    if (burst > 0) {                                    // outward dissolve
      const be = eInCubic(burst);
      const ba = r4 * 6.283, br = (60 + r2 * 1500) * be;
      px += Math.cos(ba) * br; py += Math.sin(ba) * br * .7 - be * 120;
      a *= (1 - clamp(burst * 1.25));
    }
    if (a <= .012) continue;
    const orange = q[2] === 1;
    ctx.globalAlpha = a;
    ctx.fillStyle = orange ? (r2 > .5 ? C.orangeHi : C.orange) : (r2 > .82 ? '#FFF7EA' : '#DDE9FA');
    const s = (1.1 + r3 * 2.3) + (1 - e) * 2.3 + burst * 1.4;
    ctx.fillRect(px, py, s, s);
  }
  ctx.restore();
  ctx.globalAlpha = 1;
}

function shockwave(ctx, cx, cy, p) {
  if (p <= 0 || p >= 1) return;
  const e = eOutQuart(p), fall = (1 - p) * (1 - p);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';

  // expanding soft pressure wave — a gradient shell, never a drawn outline
  const r0 = 90 + e * 640;
  const sh = ctx.createRadialGradient(cx, cy, Math.max(1, r0 * .62), cx, cy, r0 * 1.32);
  sh.addColorStop(0, 'rgba(0,0,0,0)');
  sh.addColorStop(.55, hexA(C.orangeHi, fall * .105));
  sh.addColorStop(.80, hexA(C.orange, fall * .055));
  sh.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = sh; ctx.fillRect(0, 0, W, H);

  // core bloom
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 760);
  g.addColorStop(0, hexA('#FFE1B4', fall * .13)); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

  // anamorphic horizontal streak through the lockup
  const sw = 300 + e * 1500, sy = cy;
  const st = ctx.createLinearGradient(cx - sw, sy, cx + sw, sy);
  st.addColorStop(0, 'rgba(0,0,0,0)');
  st.addColorStop(.5, hexA('#FFD9A6', fall * .30));
  st.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = st;
  const sh2 = 3 + (1 - p) * 12;
  ctx.fillRect(cx - sw, sy - sh2 / 2, sw * 2, sh2);
  ctx.restore();
}

function logoLockup(ctx, cx, cy, boxW, a, withUrl) {
  if (a <= .01) return;
  const img = window.LOGOIMG, ar = img.naturalWidth / img.naturalHeight;
  const bw = boxW, bh = bw / ar;
  ctx.save();
  ctx.globalAlpha = a;
  ctx.shadowColor = hexA('#7FB0FF', .5); ctx.shadowBlur = 46;
  ctx.drawImage(img, cx - bw / 2, cy - bh / 2, bw, bh);
  ctx.restore();
  // tagline
  ctx.save();
  ctx.globalAlpha = a;
  setFont(ctx, 22, FS.sans, 700, 8.4);
  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = C.orange;
  ctx.shadowColor = hexA(C.orange, .5); ctx.shadowBlur = 16;
  ctx.fillText('HUMAN CAPITAL MANAGEMENT', cx, cy + bh / 2 + 62);
  if (withUrl) {
    ctx.shadowBlur = 0;
    setFont(ctx, 16, FS.sans, 500, 6.2);
    ctx.fillStyle = 'rgba(157,178,206,0.88)';
    ctx.fillText('ALIGNHCM.COM', cx, cy + bh / 2 + 108);
  }
  ctx.textAlign = 'left';
  ctx.restore();
}

function sceneLogoIn(ctx, f, a, b) {
  const n = f - a, len = b - a;
  background(ctx, f, 0, .55 + .45 * inv(n, 40, 100));
  const form  = eOutCubic(inv(n, 4, 78));
  const burst = inv(n, 104, len + 26);
  const cx = W * .5, cy = H * .47;
  shockwave(ctx, cx, cy, inv(n, 74, 112));
  logoParticles(ctx, form, burst, cx, cy, 720, n);
  const lock = inv(n, 76, 96) * (1 - clamp(burst * 1.6));
  logoLockup(ctx, cx, cy, 720, lock * .92, false);
  // bright flash at the moment of formation
  const fl = 1 - inv(n, 74, 96);
  if (n > 70 && fl > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = hexA(C.orangeHi, fl * .055); ctx.fillRect(0, 0, W, H); ctx.restore(); }
}

function sceneLogoOut(ctx, f, a, b) {
  const n = f - a, len = b - a;
  background(ctx, f, .3, 1);
  const form = eOutCubic(inv(n, 2, 62));
  const cx = W * .5, cy = H * .45;
  shockwave(ctx, cx, cy, inv(n, 56, 96));
  logoParticles(ctx, form, 0, cx, cy, 720, n);
  logoLockup(ctx, cx, cy, 720, inv(n, 58, 80), true);
  // gentle settle glow at the very end
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 1000);
  g.addColorStop(0, hexA(C.blueLit, .10 * inv(n, 60, len))); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
}

/* ---- headline statement -------------------------------------------------- */
function sceneHeadline(ctx, f, a, b) {
  const n = f - a, len = b - a;
  background(ctx, f, .15, 1);
  ghost(ctx, 'ACADEMY', W * .68, H * .855, 126, .015 * inv(n, 10, 60));
  kicker(ctx, 'ALIGN ACADEMY™', 132, 176, inv(n, -12, 12));

  const L1 = [{ t: 'A system either ', c: C.white }, { t: 'transforms', c: C.orangeHi }, { t: ' your operations —', c: C.white }];
  const L2 = [{ t: 'or it ', c: C.white }, { t: 'gathers dust', c: C.orangeHi }, { t: '.', c: C.white }];
  const size = 84, x = 132;

  // per-line mask reveal: slide up out of a clip band + blur→sharp
  const lines = [{ segs: L1, y: 470, d: -16 }, { segs: L2, y: 570, d: 4 }];
  for (const ln of lines) {
    const p = eOutQuint(inv(n, ln.d, ln.d + 46));
    if (p <= 0) continue;
    ctx.save();
    ctx.beginPath(); ctx.rect(x - 20, ln.y - size * 1.02, W, size * 1.30); ctx.clip();
    ctx.globalAlpha = clamp(p * 1.5);
    ctx.filter = `blur(${(1 - p) * 12}px)`;
    ctx.translate(0, (1 - p) * size * .92);
    drawRun(ctx, ln.segs, x, ln.y, size, FS.serif, 700, 0, 'left');
    ctx.filter = 'none';
    ctx.restore();
  }

  // specular sheen sweeping the headline
  const sw = inv(n, 40, 92);
  if (sw > 0 && sw < 1) {
    ctx.save();
    ctx.beginPath(); ctx.rect(x - 20, 380, 1500, 220); ctx.clip();
    ctx.globalCompositeOperation = 'lighter';
    const sx = lerp(-320, 1700, eInOutCubic(sw));
    const g = ctx.createLinearGradient(sx, 0, sx + 300, 0);
    g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.5, 'rgba(255,235,205,0.13)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.fillRect(x - 20, 380, 1520, 220);
    ctx.restore();
  }

  // rule + sub
  const rp = eOutQuart(inv(n, 48, 80));
  ctx.save();
  ctx.strokeStyle = hexA(C.orange, .75); ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x, 636); ctx.lineTo(x + 210 * rp, 636); ctx.stroke();
  ctx.restore();
  const sp = eOutQuart(inv(n, 56, 94));
  ctx.save();
  ctx.globalAlpha = sp;
  ctx.translate(0, (1 - sp) * 18);
  setFont(ctx, 29, FS.body, 400, .2);
  ctx.fillStyle = 'rgba(200,215,235,0.92)'; ctx.textBaseline = 'alphabetic';
  ctx.fillText('The difference lies entirely in training.', x, 700);
  ctx.restore();

  // graduation cap drawing itself in, bottom-right
  const ip = eOutCubic(inv(n, 26, 62));
  drawIcon(ctx, 'cap', W - 296, H * .565, 250, hexA(C.orange, .40 * inv(n, 24, 56)), ip, 1.8, 34);
}

/* ---- vertex-shuffle list (the signature move) --------------------------- */
function shuffleList(ctx, f, a, b, items, label, ghostWord) {
  const n = f - a, len = b - a;
  background(ctx, f, .1, 1);
  ghost(ctx, ghostWord, W * .5, H * .885, 112, .013 * inv(n, 8, 50));
  kicker(ctx, label, 132, 176, inv(n, 2, 24));

  const N = items.length;
  const intro = 26, outro = 22;
  const body = len - intro - outro;
  const slot = body / N;
  // eased float index so the stack glides rather than snaps
  const raw = (n - intro) / slot;
  let idx = 0;
  for (let i = 0; i < N; i++) idx += eInOutQuint(clamp((raw - i) * 1.85 - .42)); // glide, don't snap
  idx = clamp(idx, 0, N - 1);
  const active = Math.round(clamp(raw, 0, N - 1));

  const cy = H * .52, gap = 118;
  ctx.save();
  for (let i = 0; i < N; i++) {
    const d = i - idx, ad = Math.abs(d);
    if (ad > 2.6) continue;
    const y = cy + d * gap * (1 - clamp(ad * .06));
    const near = clamp(1 - ad);                        // 1 at centre
    const size = lerp(46, 78, near);
    const alpha = ad < 1 ? lerp(.42, 1, near) : Math.max(0, .42 - (ad - 1) * .24);
    if (alpha <= .012) continue;
    const col = near > .55 ? C.white : hexA('#A9C2E2', 1);
    const icoCol = near > .55 ? C.orange : hexA(C.orange, .40);

    ctx.save();
    ctx.globalAlpha = alpha;
    if (ad > .14) ctx.filter = `blur(${Math.min(5, (ad - .14) * 3.4)}px)`;

    // measure to lay out icon + label as one centred group
    setFont(ctx, size, FS.serif, 700, 0);
    const tw = ctx.measureText(items[i].t).width;
    const isz = size * 1.28, gapx = 26;
    const groupW = isz + gapx + tw;
    const gx = W * .5 - groupW / 2;
    const tx = gx + isz + gapx;

    // glow plate under the active row
    if (near > .5) {
      const gp = (near - .5) / .5;
      const Rg = groupW * .66;
      ctx.save();
      ctx.translate(W * .5, y - size * .30);
      ctx.scale(1, .40);
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, Rg);
      g.addColorStop(0, hexA('#FFE0B0', .13 * gp));
      g.addColorStop(.55, hexA('#FFC98A', .045 * gp));
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(-Rg, -Rg, Rg * 2, Rg * 2);
      ctx.restore();
    }

    // icon (draws itself on when the row becomes active)
    const iconP = i === active ? eOutCubic(clamp((raw - i + .60) * 5.0)) : 1;
    drawIcon(ctx, items[i].icon, gx + isz / 2, y - size * .33, isz, icoCol, iconP, 2.7, near > .55 ? 24 : 0);

    // label
    ctx.fillStyle = col; ctx.textBaseline = 'alphabetic';
    if (near > .55) { ctx.shadowColor = 'rgba(190,215,255,0.45)'; ctx.shadowBlur = 26; }
    ctx.fillText(items[i].t, tx, y);
    ctx.filter = 'none';
    ctx.restore();

    // vertices shuffling into the active label
    if (i === active) {
      const ap = eOutCubic(clamp((raw - i + .48) * 1.9));
      if (ap < 1) assembleText(ctx, items[i].t, tx, y, size, FS.serif, 700, 0, ap, i * 911, 'left', 260);
      // supporting line
      const sp = clamp((raw - i + .40) * 2.4) * (1 - clamp((raw - i - .62) * 3));
      if (sp > .02) {
        ctx.save();
        ctx.globalAlpha = clamp(sp);
        setFont(ctx, 24, FS.body, 400, .6);
        ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(176,196,222,0.92)';
        ctx.fillText(items[i].s, W * .5, y + 54);
        ctx.textAlign = 'left';
        ctx.restore();
      }
    }
  }
  ctx.restore();

  positionSpine(ctx, 140, H * .5, N, idx, inv(n, 12, 40));
}

/** Vertical section spine: one tick per item, active one elongated. No numerals. */
function positionSpine(ctx, x, cy, N, idx, a) {
  if (a <= .01) return;
  const pitch = 46, top = cy - ((N - 1) * pitch) / 2;
  ctx.save();
  ctx.globalAlpha = a;
  ctx.strokeStyle = 'rgba(150,185,230,0.30)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(x + .5, top - 26); ctx.lineTo(x + .5, top + (N - 1) * pitch + 26); ctx.stroke();
  for (let i = 0; i < N; i++) {
    const on = clamp(1 - Math.abs(i - idx));
    const y = top + i * pitch;
    ctx.globalAlpha = a * (.28 + on * .72);
    if (on > .35) {
      ctx.fillStyle = C.orange;
      ctx.shadowColor = hexA(C.orange, .8); ctx.shadowBlur = 12;
      ctx.beginPath(); ctx.roundRect(x - 2, y - 15 * on, 4.4, 30 * on + 3, 2.2); ctx.fill();
      ctx.shadowBlur = 0;
    } else {
      ctx.fillStyle = '#7E9AC0';
      ctx.beginPath(); ctx.arc(x + .5, y, 3, 0, 6.283); ctx.fill();
    }
  }
  ctx.restore();
}

/* ---- delivery carousel (placement borrowed from the industry film) ------- */
function sceneDelivery(ctx, f, a, b) {
  const n = f - a, len = b - a;
  background(ctx, f, .2, 1);
  ghost(ctx, 'DELIVERY', W * .5, H * .90, 100, .013 * inv(n, 10, 56));
  kicker(ctx, 'HOW WE DELIVER', 132, 176, inv(n, 2, 24));

  const N = DELIVERY.length;
  const intro = 30, outro = 26, body = len - intro - outro, slot = body / N;
  const raw = (n - intro) / slot;
  let idx = 0;
  for (let i = 0; i < N; i++) idx += eInOutQuint(clamp((raw - i) * 1.9 - .45));
  idx = clamp(idx, 0, N - 1);
  const active = Math.round(clamp(raw, 0, N - 1));

  const cxC = W * .5, cyC = H * .47;
  const cw = 404, ch = 476, pitch = 452;

  // draw far cards first
  const order = [];
  for (let i = 0; i < N; i++) order.push(i);
  order.sort((p, q) => Math.abs(q - idx) - Math.abs(p - idx));

  for (const i of order) {
    const d = i - idx, ad = Math.abs(d);
    if (ad > 2.2) continue;
    const near = clamp(1 - ad);
    const sc = lerp(.74, 1, eOutCubic(near));
    const x = cxC + d * pitch * lerp(.86, 1, near);
    const y = cyC + (1 - near) * 26;
    const alpha = ad < 1 ? lerp(.34, 1, near) : Math.max(0, .34 - (ad - 1) * .28);
    if (alpha <= .015) continue;
    const rotY = clamp(d * .28, -.5, .5);              // faked perspective via horizontal squash
    const w = cw * sc * (1 - Math.abs(rotY) * .22), h = ch * sc;

    ctx.save();
    ctx.globalAlpha = alpha;
    if (ad > .1) ctx.filter = `blur(${Math.min(5.5, (ad - .1) * 4)}px)`;

    // card body
    const rx = x - w / 2, ry = y - h / 2, r = 22 * sc;
    ctx.beginPath(); ctx.roundRect(rx, ry, w, h, r);
    const cg = ctx.createLinearGradient(rx, ry, rx + w * .5, ry + h);
    cg.addColorStop(0, `rgba(38,72,126,${.86 * lerp(.62, 1, near)})`);
    cg.addColorStop(1, `rgba(10,23,50,${.94 * lerp(.62, 1, near)})`);
    ctx.fillStyle = cg;
    if (near > .6) { ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 48; ctx.shadowOffsetY = 22; }
    ctx.fill();
    ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;

    // hairline + orange top accent on the focused card
    ctx.strokeStyle = near > .6 ? hexA(C.orange, .62) : 'rgba(150,185,230,0.26)';
    ctx.lineWidth = 1.4; ctx.stroke();
    if (near > .55) {
      const gp = (near - .55) / .45;
      ctx.save(); ctx.beginPath(); ctx.roundRect(rx, ry, w, h, r); ctx.clip();
      const tg = ctx.createLinearGradient(rx, ry, rx + w, ry);
      tg.addColorStop(0, 'rgba(240,150,42,0)'); tg.addColorStop(.5, hexA(C.orangeHi, .95 * gp)); tg.addColorStop(1, 'rgba(240,150,42,0)');
      ctx.fillStyle = tg; ctx.fillRect(rx, ry, w, 3.2);
      // inner sheen
      const ig = ctx.createLinearGradient(rx, ry, rx + w * .7, ry + h);
      ig.addColorStop(0, `rgba(255,255,255,${.055 * gp})`); ig.addColorStop(.6, 'rgba(255,255,255,0)');
      ctx.fillStyle = ig; ctx.fillRect(rx, ry, w, h);
      ctx.restore();
    }

    // icon plate — this is the slot a supplied still would drop into later
    const ipy = y - h * .16;
    const plate = w * .40;
    ctx.save();
    ctx.beginPath(); ctx.roundRect(x - plate / 2, ipy - plate / 2, plate, plate, plate * .26);
    ctx.fillStyle = near > .6 ? 'rgba(240,150,42,0.10)' : 'rgba(140,175,220,0.06)';
    ctx.fill();
    ctx.strokeStyle = near > .6 ? hexA(C.orange, .30) : 'rgba(140,175,220,0.14)';
    ctx.lineWidth = 1.2; ctx.stroke();
    ctx.restore();
    const iconP = i === active ? eOutCubic(clamp((raw - i + .60) * 4.4)) : 1;
    drawIcon(ctx, DELIVERY[i].icon, x, ipy, plate * .56, near > .55 ? C.orangeHi : hexA(C.orange, .45),
             iconP, 2.2, near > .55 ? 24 : 0);

    // card copy
    ctx.textAlign = 'center';
    setFont(ctx, 29 * sc, FS.serif, 700, 0);
    ctx.fillStyle = near > .55 ? C.white : 'rgba(190,210,235,0.9)';
    if (near > .6) { ctx.shadowColor = 'rgba(190,215,255,0.35)'; ctx.shadowBlur = 18; }
    wrapCentre(ctx, DELIVERY[i].t, x, y + h * .18, w * .84, 35 * sc);
    ctx.shadowBlur = 0;
    setFont(ctx, 18 * sc, FS.body, 400, .3);
    ctx.fillStyle = 'rgba(160,182,210,0.86)';
    wrapCentre(ctx, DELIVERY[i].s, x, y + h * .30, w * .78, 23 * sc);
    ctx.textAlign = 'left';
    ctx.filter = 'none';
    ctx.restore();
  }

  // horizontal position rail under the deck — ticks only, never numerals
  ctx.save();
  const ry2 = cyC + ch / 2 + 74, aRail = inv(n, 14, 42);
  ctx.globalAlpha = aRail * .5;
  ctx.strokeStyle = 'rgba(140,175,220,0.20)'; ctx.lineWidth = 1;
  const railHalf = (N - 1) * 19 + 26;
  ctx.beginPath(); ctx.moveTo(W * .5 - railHalf, ry2 + .5); ctx.lineTo(W * .5 + railHalf, ry2 + .5); ctx.stroke();
  for (let i = 0; i < N; i++) {
    const on = clamp(1 - Math.abs(i - idx));
    const x = W * .5 + (i - (N - 1) / 2) * 38;
    ctx.globalAlpha = aRail * (.28 + on * .72);
    ctx.fillStyle = on > .35 ? C.orange : '#7E9AC0';
    ctx.beginPath();
    if (on > .35) {
      ctx.shadowColor = hexA(C.orange, .8); ctx.shadowBlur = 12;
      ctx.roundRect(x - 13 * on - 1, ry2 - 2.1, 26 * on + 3, 4.2, 2.1);
    } else ctx.arc(x, ry2, 2.5, 0, 6.283);
    ctx.fill(); ctx.shadowBlur = 0;
  }
  ctx.restore();
}

function wrapCentre(ctx, text, x, y, maxW, lh) {
  const words = text.split(' ');
  const lines = []; let cur = '';
  for (const w of words) {
    const t = cur ? cur + ' ' + w : w;
    if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t;
  }
  if (cur) lines.push(cur);
  ctx.textBaseline = 'alphabetic';
  lines.forEach((l, i) => ctx.fillText(l, x, y + i * lh));
  return lines.length;
}

/* ---- outcome constellation ---------------------------------------------- */
function sceneOutcome(ctx, f, a, b) {
  const n = f - a, len = b - a;
  background(ctx, f, .25, 1);
  ghost(ctx, 'ADOPTION', W * .5, H * .90, 104, .013 * inv(n, 10, 54));
  kicker(ctx, 'WHY IT MATTERS', 132, 176, inv(n, 2, 24));

  const cx = W * .5, cy = H * .50, t = n / FPS;
  const N = OUTCOMES.length;
  const nodes = OUTCOMES.map((o, i) => {
    const base = -Math.PI / 2 + (i / N) * 6.283;
    const ang = base + Math.sin(t * .28 + i) * .045 + t * .055;
    const rr = 350 + Math.sin(t * .5 + i * 1.7) * 12;
    return { ...o, x: cx + Math.cos(ang) * rr * 1.30, y: cy + Math.sin(ang) * rr * .70, i };
  });

  // links + travelling pulses
  ctx.save();
  nodes.forEach((nd, i) => {
    const p = eOutCubic(inv(n, 16 + i * 11, 16 + i * 11 + 26));
    if (p <= 0) return;
    ctx.globalAlpha = .30 * p;
    ctx.strokeStyle = hexA(C.orange, .55); ctx.lineWidth = 1.3;
    ctx.setLineDash([7, 9]);
    ctx.beginPath(); ctx.moveTo(cx, cy);
    ctx.lineTo(lerp(cx, nd.x, p), lerp(cy, nd.y, p)); ctx.stroke();
    ctx.setLineDash([]);
    if (p >= .999) {
      const q = ((t * .55 + i * .25) % 1);
      const px = lerp(cx, nd.x, q), py = lerp(cy, nd.y, q);
      ctx.globalAlpha = Math.sin(q * Math.PI) * .95;
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = C.orangeHi;
      ctx.shadowColor = C.orange; ctx.shadowBlur = 16;
      ctx.beginPath(); ctx.arc(px, py, 3.4, 0, 6.283); ctx.fill();
      ctx.shadowBlur = 0; ctx.globalCompositeOperation = 'source-over';
    }
  });
  ctx.restore();

  // hub
  const hp = eOutBack(clamp(inv(n, 2, 30)));
  if (hp > 0) {
    ctx.save();
    ctx.globalAlpha = clamp(inv(n, 2, 22));
    const rr = 104 * hp;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rr * 2.6);
    g.addColorStop(0, hexA(C.orange, .26)); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(cx - 340, cy - 340, 680, 680);
    ctx.beginPath(); ctx.arc(cx, cy, rr, 0, 6.283);
    ctx.fillStyle = 'rgba(10,22,46,0.88)'; ctx.fill();
    ctx.strokeStyle = hexA(C.orange, .70); ctx.lineWidth = 2; ctx.stroke();
    // rotating dashed ring
    ctx.save();
    ctx.translate(cx, cy); ctx.rotate(t * .35);
    ctx.strokeStyle = hexA(C.orangeHi, .40); ctx.lineWidth = 1.4;
    ctx.setLineDash([16, 14]);
    ctx.beginPath(); ctx.arc(0, 0, rr + 22, 0, 6.283); ctx.stroke();
    ctx.restore();
    drawIcon(ctx, 'cap', cx, cy - 4, 94, C.orangeHi, eOutCubic(inv(n, 8, 34)), 2.4, 26);
    ctx.restore();
  }

  // nodes
  nodes.forEach(nd => {
    const p = eOutBack(clamp(inv(n, 28 + nd.i * 11, 28 + nd.i * 11 + 26)));
    if (p <= 0) return;
    const al = clamp(inv(n, 28 + nd.i * 11, 28 + nd.i * 11 + 18));
    ctx.save();
    ctx.globalAlpha = al;
    const rr = 58 * p;
    ctx.beginPath(); ctx.arc(nd.x, nd.y, rr, 0, 6.283);
    ctx.fillStyle = 'rgba(14,30,58,0.90)'; ctx.fill();
    ctx.strokeStyle = 'rgba(240,150,42,0.45)'; ctx.lineWidth = 1.5; ctx.stroke();
    const gl = ctx.createRadialGradient(nd.x, nd.y, 0, nd.x, nd.y, rr * 2.4);
    gl.addColorStop(0, hexA(C.orange, .14)); gl.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gl; ctx.fillRect(nd.x - 160, nd.y - 160, 320, 320);
    drawIcon(ctx, nd.icon, nd.x, nd.y, 52, C.orangeHi, eOutCubic(clamp((p - .15) * 2.2)), 2.1, 18);
    // label placed outward from the hub
    const dx = nd.x - cx, dy = nd.y - cy, L = Math.hypot(dx, dy) || 1;
    const lx = nd.x + (dx / L) * 96, ly = nd.y + (dy / L) * 68 + 9;
    ctx.globalAlpha = al * clamp((p - .35) * 2);
    setFont(ctx, 30, FS.serif, 700, 0);
    ctx.textAlign = dx < -40 ? 'right' : dx > 40 ? 'left' : 'center';
    ctx.fillStyle = C.white;
    ctx.shadowColor = 'rgba(0,0,0,0.8)'; ctx.shadowBlur = 12;
    ctx.fillText(nd.t, lx, ly);
    ctx.textAlign = 'left';
    ctx.restore();
  });
}

/* ---- closing statement --------------------------------------------------- */
function sceneClosing(ctx, f, a, b) {
  const n = f - a, len = b - a;
  background(ctx, f, .3, 1);
  ghost(ctx, 'ALIGN ACADEMY', W * .5, H * .855, 86, .022 * inv(n, 6, 40));
  const kp = inv(n, -12, 10);
  // centred kicker
  ctx.save();
  ctx.globalAlpha = kp;
  setFont(ctx, 18, FS.sans, 600, 5.6);
  ctx.textAlign = 'center'; ctx.fillStyle = C.orange;
  ctx.shadowColor = hexA(C.orange, .5); ctx.shadowBlur = 14;
  ctx.fillText('ALIGN ACADEMY™', W * .5, H * .30);
  ctx.textAlign = 'left';
  ctx.restore();

  const size = 76;
  const L1 = [{ t: 'Empower your team to', c: C.white }];
  const L2 = [{ t: 'maximize', c: C.orangeHi }, { t: ' your HCM investment.', c: C.white }];
  const rows = [{ segs: L1, y: H * .48, d: -14 }, { segs: L2, y: H * .48 + 96, d: 2 }];
  for (const r of rows) {
    const p = eOutQuint(inv(n, r.d, r.d + 40));
    if (p <= 0) continue;
    ctx.save();
    ctx.globalAlpha = clamp(p * 1.6);
    ctx.filter = `blur(${(1 - p) * 9}px)`;
    drawRun(ctx, r.segs, W * .5, r.y, size, FS.serif, 700, 0, 'center');
    ctx.filter = 'none';
    ctx.restore();
    // vertices settling onto the words
    const ap = eOutCubic(inv(n, r.d, r.d + 52));
    if (ap < 1) {
      let acc = W * .5 - runWidth(ctx, r.segs, size, FS.serif, 700, 0) / 2;
      for (const s of r.segs) {
        assembleText(ctx, s.t, acc, r.y, size, FS.serif, 700, 0, ap, r.d * 77, 'left', 300);
        setFont(ctx, size, FS.serif, 700, 0);
        acc += ctx.measureText(s.t).width;
      }
    }
  }
  const rp = eOutQuart(inv(n, 28, 58));
  ctx.save();
  ctx.strokeStyle = hexA(C.orange, .8); ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(W * .5 - 130 * rp, H * .48 + 156); ctx.lineTo(W * .5 + 130 * rp, H * .48 + 156); ctx.stroke();
  ctx.restore();
}

/* ================================ TIMELINE =============================== */
const SCENES = [
  { id: 'logoIn',   a: 0,    b: 132,  fn: sceneLogoIn },
  { id: 'headline', a: 132,  b: 282,  fn: sceneHeadline },
  { id: 'audience', a: 282,  b: 500,  fn: (c, f, a, b) => shuffleList(c, f, a, b, AUDIENCE, 'WHO WE TRAIN', 'ROLES') },
  { id: 'delivery', a: 500,  b: 748,  fn: sceneDelivery },
  { id: 'inside',   a: 748,  b: 968,  fn: (c, f, a, b) => shuffleList(c, f, a, b, INSIDE, "WHAT'S INSIDE", 'CURRICULUM') },
  { id: 'outcome',  a: 968,  b: 1148, fn: sceneOutcome },
  { id: 'closing',  a: 1148, b: 1252, fn: sceneClosing },
  { id: 'logoOut',  a: 1252, b: 1350, fn: sceneLogoOut }
];
// boundary transitions: 'dissolve' for the particle hand-offs, diagonal wipes between
const TRANS = [
  { at: 132,  half: 11, type: 'dissolve' },
  { at: 282,  half: 12, type: 'wipe', dir: 1 },
  { at: 500,  half: 12, type: 'wipe', dir: -1 },
  { at: 748,  half: 12, type: 'wipe', dir: 1 },
  { at: 968,  half: 12, type: 'wipe', dir: -1 },
  { at: 1148, half: 12, type: 'wipe', dir: 1 },
  { at: 1252, half: 11, type: 'dissolve' }
];

function sceneAt(f) {
  for (let i = 0; i < SCENES.length; i++) if (f < SCENES[i].b || i === SCENES.length - 1) return i;
  return SCENES.length - 1;
}

/** Diagonal shear wipe with a hot leading edge and spark spray. */
function wipe(ctx, outC, inC, p, dir, f) {
  const SKEW = 300, MG = 60;
  const e = eInOutQuint(p);
  const travel = W + SKEW + MG * 2;
  const edge = dir > 0 ? -SKEW / 2 - MG + e * travel : W + SKEW / 2 + MG - e * travel;
  const ex = y => edge + (0.5 - y / H) * SKEW * dir;

  // outgoing, pushed away + softened
  ctx.save();
  const push = e * 90 * dir;
  ctx.filter = `blur(${e * 3.4}px) brightness(${1 - e * .22})`;
  ctx.drawImage(outC, -push * .5, 0, W, H);
  ctx.filter = 'none';
  ctx.restore();

  // incoming clipped to the sheared half, arriving with a touch of parallax
  ctx.save();
  ctx.beginPath();
  if (dir > 0) { ctx.moveTo(-MG, 0); ctx.lineTo(ex(0), 0); ctx.lineTo(ex(H), H); ctx.lineTo(-MG, H); }
  else { ctx.moveTo(W + MG, 0); ctx.lineTo(ex(0), 0); ctx.lineTo(ex(H), H); ctx.lineTo(W + MG, H); }
  ctx.closePath(); ctx.clip();
  const pin = (1 - e) * 120 * dir;
  ctx.filter = `blur(${(1 - e) * 2.2}px)`;
  ctx.drawImage(inC, pin, 0, W, H);
  ctx.filter = 'none';
  // chromatic fringe hugging the edge
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = .16;
  ctx.drawImage(inC, pin + 5 * dir, 0, W, H);
  ctx.restore();

  // the hot edge itself
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const grd = ctx.createLinearGradient(ex(H / 2) - 120 * dir, 0, ex(H / 2) + 26 * dir, 0);
  grd.addColorStop(0, 'rgba(240,150,42,0)');
  grd.addColorStop(.70, hexA(C.orange, .17));
  grd.addColorStop(1, hexA(C.orangeHi, .40));
  ctx.fillStyle = grd;
  ctx.beginPath();
  ctx.moveTo(ex(0) - 150 * dir, 0); ctx.lineTo(ex(0), 0); ctx.lineTo(ex(H), H); ctx.lineTo(ex(H) - 150 * dir, H);
  ctx.closePath(); ctx.fill();

  ctx.strokeStyle = '#FFD9A0'; ctx.lineWidth = 2.6;
  ctx.shadowColor = C.orangeHi; ctx.shadowBlur = 34;
  ctx.beginPath(); ctx.moveTo(ex(0), 0); ctx.lineTo(ex(H), H); ctx.stroke();
  ctx.lineWidth = 1.1; ctx.shadowBlur = 12; ctx.strokeStyle = '#FFFFFF';
  ctx.beginPath(); ctx.moveTo(ex(0), 0); ctx.lineTo(ex(H), H); ctx.stroke();
  ctx.restore();

  // sparks blown off the leading edge
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 340; i++) {
    const yy = R1[i + 900] * H;
    const age = (R2[i + 900] + e * (1.4 + R3[i + 900] * 1.9)) % 1;
    const off = age * (140 + R4[i + 900] * 300);
    const px = ex(yy) - off * dir, py = yy + (R3[i + 900] - .5) * 44 - age * 26;
    const al = (1 - age) * (1 - age) * .85 * Math.sin(Math.PI * clamp(e * 1.15));
    if (al <= .02) continue;
    ctx.globalAlpha = al;
    ctx.fillStyle = R4[i + 900] > .55 ? C.orangeHi : '#FFF3DF';
    const s = .9 + R2[i + 900] * 2.1;
    ctx.fillRect(px, py, s, s);
  }
  ctx.restore();

  // flash bloom at mid-swipe
  const fl = Math.sin(Math.PI * p);
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = hexA(C.orangeHi, fl * .045); ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

/* ------------------------------- frame entry ------------------------------ */
function renderFrame(f) {
  f = clamp(f, 0, TOTAL - 1);
  const si = sceneAt(f);
  const tr = TRANS.find(t => f >= t.at - t.half && f < t.at + t.half);

  if (!tr) {
    const s = SCENES[si];
    M.save(); s.fn(M, f, s.a, s.b); M.restore();
  } else {
    const iOut = SCENES.findIndex(s => s.b === tr.at);
    const iIn = iOut + 1;
    const p = (f - (tr.at - tr.half)) / (tr.half * 2);
    const so = SCENES[iOut], sn = SCENES[iIn];
    CA.save(); so.fn(CA, f, so.a, so.b); CA.restore();
    CB.save(); sn.fn(CB, f, sn.a, sn.b); CB.restore();
    if (tr.type === 'wipe') {
      wipe(M, SA, SB, p, tr.dir, f);
    } else {
      // dissolve: cross-fade with a warm flash and a slight scale breath
      M.drawImage(SA, 0, 0);
      const e = eInOutCubic(p);
      M.save();
      M.globalAlpha = e;
      const k = lerp(1.045, 1, eOutCubic(p));
      M.drawImage(SB, W * (1 - k) / 2, H * (1 - k) / 2, W * k, H * k);
      M.restore();
      M.save(); M.globalCompositeOperation = 'lighter';
      M.fillStyle = hexA(C.orangeHi, Math.sin(Math.PI * p) * .055); M.fillRect(0, 0, W, H);
      M.restore();
    }
  }

  post(M, f);
  chrome(M, f);
  return true;
}

window.renderFrame = renderFrame;
window.TOTAL_FRAMES = TOTAL;
window.FILM_READY = false;

/* --------------------------------- preload -------------------------------- */
(async function boot() {
  const lp = await fetch('assets/logo_points.json').then(r => r.json());
  window.LOGO = { aspect: lp.aspect, pts: lp.pts };
  const img = new Image();
  await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = 'assets/logo_dark.png'; });
  window.LOGOIMG = img;
  await document.fonts.ready;
  // warm the glyph caches so the first captured frames match later ones
  for (const fam of [FS.serif, FS.sans, FS.body]) { setFont(M, 80, fam, 700, 0); M.measureText('Align Academy'); }
  window.FILM_READY = true;
})();
