/* ==========================================================================
   PAPERBOUND — 00_util.js
   Math, RNG, easing, tweens, tiny event bus, misc helpers.
   ========================================================================== */
'use strict';

var PB = window.PB || (window.PB = {});

PB.U = (function () {

  /* ---- math ------------------------------------------------------------ */
  function clamp(v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function invLerp(a, b, v) { return b === a ? 0 : (v - a) / (b - a); }
  function approach(cur, tgt, step) {
    if (cur < tgt) return Math.min(cur + step, tgt);
    if (cur > tgt) return Math.max(cur - step, tgt);
    return tgt;
  }
  function sign(v) { return v < 0 ? -1 : (v > 0 ? 1 : 0); }
  function dist2(ax, ay, bx, by) { var dx = ax - bx, dy = ay - by; return dx * dx + dy * dy; }
  function dist(ax, ay, bx, by) { return Math.sqrt(dist2(ax, ay, bx, by)); }
  function wrap(v, n) { return ((v % n) + n) % n; }
  function round2(v) { return Math.round(v * 100) / 100; }

  /* Axis-aligned box overlap in the (x, z) ground plane. */
  function boxHit(ax, az, aw, ad, bx, bz, bw, bd) {
    return Math.abs(ax - bx) * 2 < (aw + bw) && Math.abs(az - bz) * 2 < (ad + bd);
  }

  /* ---- rng ------------------------------------------------------------- */
  /* Deterministic 32-bit RNG (mulberry32). Battles use a seeded stream so a
     replay of the same inputs behaves the same; cosmetics use Math.random. */
  function RNG(seed) {
    this.s = (seed >>> 0) || 0x9e3779b9;
  }
  RNG.prototype.next = function () {
    this.s = (this.s + 0x6D2B79F5) >>> 0;
    var t = this.s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  RNG.prototype.int = function (n) { return Math.floor(this.next() * n); };
  RNG.prototype.range = function (a, b) { return a + this.next() * (b - a); };
  RNG.prototype.chance = function (p) { return this.next() < p; };
  RNG.prototype.pick = function (arr) { return arr[this.int(arr.length)]; };

  var _global = new RNG(0x1234abcd);
  function rnd() { return Math.random(); }
  function rndRange(a, b) { return a + Math.random() * (b - a); }
  function rndInt(n) { return Math.floor(Math.random() * n); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function chance(p) { return Math.random() < p; }
  function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }

  /* ---- easing ---------------------------------------------------------- */
  var Ease = {
    linear: function (t) { return t; },
    inQuad: function (t) { return t * t; },
    outQuad: function (t) { return t * (2 - t); },
    inOutQuad: function (t) { return t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t; },
    inCubic: function (t) { return t * t * t; },
    outCubic: function (t) { return (--t) * t * t + 1; },
    inOutCubic: function (t) { return t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1; },
    outBack: function (t) { var c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
    outElastic: function (t) {
      var c4 = (2 * Math.PI) / 3;
      return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
    },
    outBounce: function (t) {
      var n1 = 7.5625, d1 = 2.75;
      if (t < 1 / d1) return n1 * t * t;
      if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
      if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    },
    inOutSine: function (t) { return -(Math.cos(Math.PI * t) - 1) / 2; }
  };

  /* ---- tween pool ------------------------------------------------------ */
  /* Frame-counted tweens: everything in this game runs on a fixed 60fps step,
     so durations are expressed in frames, not milliseconds. */
  function Tweener() { this.list = []; }
  Tweener.prototype.to = function (obj, props, frames, ease, onDone) {
    var from = {}, k;
    for (k in props) from[k] = obj[k];
    var tw = { obj: obj, from: from, to: props, t: 0, dur: Math.max(1, frames | 0), ease: ease || Ease.outQuad, done: onDone || null, dead: false };
    this.list.push(tw);
    return tw;
  };
  Tweener.prototype.step = function () {
    for (var i = 0; i < this.list.length; i++) {
      var tw = this.list[i];
      if (tw.dead) continue;
      tw.t++;
      var p = tw.ease(Math.min(1, tw.t / tw.dur));
      for (var k in tw.to) tw.obj[k] = tw.from[k] + (tw.to[k] - tw.from[k]) * p;
      if (tw.t >= tw.dur) { tw.dead = true; if (tw.done) tw.done(); }
    }
    for (var j = this.list.length - 1; j >= 0; j--) if (this.list[j].dead) this.list.splice(j, 1);
  };
  Tweener.prototype.clear = function () { this.list.length = 0; };

  /* ---- event bus ------------------------------------------------------- */
  function Bus() { this.map = {}; }
  Bus.prototype.on = function (ev, fn) { (this.map[ev] || (this.map[ev] = [])).push(fn); return fn; };
  Bus.prototype.off = function (ev, fn) {
    var a = this.map[ev]; if (!a) return;
    var i = a.indexOf(fn); if (i >= 0) a.splice(i, 1);
  };
  Bus.prototype.emit = function (ev, data) {
    var a = this.map[ev]; if (!a) return;
    for (var i = 0; i < a.length; i++) a[i](data);
  };

  /* ---- misc ------------------------------------------------------------ */
  function clone(o) {
    if (o === null || typeof o !== 'object') return o;
    if (Array.isArray(o)) { var a = new Array(o.length); for (var i = 0; i < o.length; i++) a[i] = clone(o[i]); return a; }
    var r = {}; for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) r[k] = clone(o[k]);
    return r;
  }
  function extend(dst) {
    for (var i = 1; i < arguments.length; i++) {
      var src = arguments[i]; if (!src) continue;
      for (var k in src) if (Object.prototype.hasOwnProperty.call(src, k)) dst[k] = src[k];
    }
    return dst;
  }
  function pad(n, w) { var s = '' + n; while (s.length < w) s = '0' + s; return s; }
  function timeStr(frames) {
    var sec = Math.floor(frames / 60), m = Math.floor(sec / 60), h = Math.floor(m / 60);
    return pad(h, 2) + ':' + pad(m % 60, 2) + ':' + pad(sec % 60, 2);
  }
  function commas(n) { return ('' + n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }

  /* Colour helpers — sprites derive their outline / shade from a base fill so
     a whole character can be recoloured from one hex value. */
  function hex2rgb(h) {
    h = h.replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function rgb2hex(r, g, b) {
    return '#' + ((1 << 24) + (Math.round(r) << 16) + (Math.round(g) << 8) + Math.round(b)).toString(16).slice(1);
  }
  function shade(hexc, amt) { // amt -1..1
    var c = hex2rgb(hexc);
    for (var i = 0; i < 3; i++) {
      c[i] = amt < 0 ? c[i] * (1 + amt) : c[i] + (255 - c[i]) * amt;
    }
    return rgb2hex(c[0], c[1], c[2]);
  }
  function mix(a, b, t) {
    var x = hex2rgb(a), y = hex2rgb(b);
    return rgb2hex(lerp(x[0], y[0], t), lerp(x[1], y[1], t), lerp(x[2], y[2], t));
  }
  function rgba(hexc, a) {
    var c = hex2rgb(hexc);
    return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')';
  }

  return {
    clamp: clamp, lerp: lerp, invLerp: invLerp, approach: approach, sign: sign,
    dist: dist, dist2: dist2, wrap: wrap, round2: round2, boxHit: boxHit,
    RNG: RNG, rng: _global, rnd: rnd, rndRange: rndRange, rndInt: rndInt,
    pick: pick, chance: chance, shuffle: shuffle,
    Ease: Ease, Tweener: Tweener, Bus: Bus,
    clone: clone, extend: extend, pad: pad, timeStr: timeStr, commas: commas,
    hex2rgb: hex2rgb, rgb2hex: rgb2hex, shade: shade, mix: mix, rgba: rgba
  };
})();
