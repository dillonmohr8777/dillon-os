<title>PAPERBOUND — The Seven Seals of Foldheim</title>
<style>
/* ==========================================================================
   PAPERBOUND — css/game.css
   The page is only a frame: everything visible is drawn into the canvas.
   ========================================================================== */

* { box-sizing: border-box; }

html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  background: #17101f;
  background-image:
    radial-gradient(circle at 50% 0%, #2c1f3c 0%, #17101f 60%),
    repeating-linear-gradient(0deg, rgba(255,255,255,.014) 0 2px, transparent 2px 4px);
  overflow: hidden;
  -webkit-tap-highlight-color: transparent;
  font-family: "Trebuchet MS", "Lucida Grande", "Segoe UI", Verdana, sans-serif;
}

#frame {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

#game {
  display: block;
  image-rendering: auto;
  border-radius: 6px;
  box-shadow:
    0 0 0 3px #0c0812,
    0 18px 48px rgba(0, 0, 0, .6),
    0 2px 0 rgba(255, 255, 255, .05) inset;
  touch-action: none;
  background: #0f0a18;
}

/* ---- on-screen controls: hidden unless the device is touch-primary ------ */
#touchpad { display: none; }

@media (hover: none) and (pointer: coarse) {
  #touchpad {
    display: block;
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 5;
  }
  #touchpad .dpad,
  #touchpad .face,
  #touchpad .sys { position: absolute; pointer-events: auto; }

  #touchpad .dpad { left: 14px;  bottom: 16px; width: 148px; height: 148px; }
  #touchpad .face { right: 14px; bottom: 16px; width: 168px; height: 148px; }
  #touchpad .sys  { right: 14px; top: 12px; display: flex; gap: 8px; }

  .tb {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 50px; height: 50px;
    border: 2px solid rgba(255, 248, 224, .55);
    border-radius: 12px;
    background: rgba(42, 28, 60, .5);
    color: #fff8e0;
    font: bold 17px/1 "Trebuchet MS", sans-serif;
    backdrop-filter: blur(2px);
    user-select: none;
    -webkit-user-select: none;
  }
  .tb.on { background: rgba(224, 72, 60, .7); transform: scale(.94); }
  .tb.big   { width: 64px; height: 64px; font-size: 20px; }
  .tb.small { width: 42px; height: 42px; font-size: 14px; }
  .tb.tiny  { position: static; width: 40px; height: 32px; font-size: 13px; border-radius: 8px; }

  .dpad .up    { left: 49px; top: 0; }
  .dpad .left  { left: 0;    top: 49px; }
  .dpad .right { left: 98px; top: 49px; }
  .dpad .down  { left: 49px; top: 98px; }

  .face .big   { right: 0;   bottom: 8px; }
  .face .tb:not(.big):not(.small) { right: 70px; bottom: 20px; }
  .face .small:nth-of-type(1) { right: 8px;  bottom: 82px; }
  .face .small:nth-of-type(2) { right: 58px; bottom: 92px; }
}

/* Landscape phones get a shorter frame; keep the canvas from being squeezed. */
@media (max-height: 460px) {
  #game { border-radius: 0; box-shadow: 0 0 0 2px #0c0812; }
}

/* --- standalone / embedded frame ------------------------------------------ */
:root { color-scheme: dark; }
html, body { width: 100%; }
#pb-fallback {
  position: fixed; left: 0; right: 0; bottom: 10px;
  text-align: center; color: #8a7a9a;
  font: 13px/1.5 "Trebuchet MS", "Lucida Grande", "Segoe UI", Verdana, sans-serif;
  letter-spacing: .04em; pointer-events: none;
}
#pb-fallback b { color: #f7edd6; font-weight: bold; }
#pb-fallback i { color: #e0483c; font-style: normal; }
@media (max-height: 620px) { #pb-fallback { display: none; } }
@media (prefers-reduced-motion: reduce) { #game { transition: none; } }
</style>

<div id="frame">
  <canvas id="game" width="960" height="540" aria-label="Paperbound game screen"></canvas>

  <div id="touchpad" aria-hidden="true">
    <div class="dpad">
      <button data-btn="up"    class="tb up">&#9650;</button>
      <button data-btn="left"  class="tb left">&#9664;</button>
      <button data-btn="right" class="tb right">&#9654;</button>
      <button data-btn="down"  class="tb down">&#9660;</button>
    </div>
    <div class="face">
      <button data-btn="x" class="tb small">C</button>
      <button data-btn="y" class="tb small">V</button>
      <button data-btn="b" class="tb">X</button>
      <button data-btn="a" class="tb big">Z</button>
    </div>
    <div class="sys">
      <button data-btn="l" class="tb tiny">Q</button>
      <button data-btn="start" class="tb tiny">&#9776;</button>
      <button data-btn="select" class="tb tiny">&#9636;</button>
      <button data-btn="r" class="tb tiny">E</button>
    </div>
  </div>
</div>

<p id="pb-fallback">
  <b>Arrows</b> move &nbsp;&middot;&nbsp; <i>Z</i> jump / talk &nbsp;&middot;&nbsp;
  <i>X</i> mallet &nbsp;&middot;&nbsp; <i>C</i> partner &nbsp;&middot;&nbsp;
  <i>V</i> fold &nbsp;&middot;&nbsp; <i>Q&thinsp;/&thinsp;E</i> run &nbsp;&middot;&nbsp;
  <i>Esc</i> satchel &nbsp;&middot;&nbsp; <i>Tab</i> map
</p>

<script>

/* ===== 00_util.js ===== */
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

/* ===== 01_input.js ===== */
/* ==========================================================================
   PAPERBOUND — 01_input.js
   Keyboard + gamepad + touch, unified into six logical buttons.
   Action commands need frame-accurate press timing, so every button tracks
   the frame it went down and a short press buffer.
   ========================================================================== */
'use strict';

PB.Input = (function () {

  var BUTTONS = ['left', 'right', 'up', 'down', 'a', 'b', 'x', 'y', 'l', 'r', 'start', 'select'];

  var KEYMAP = {
    ArrowLeft: 'left', KeyA: 'left',
    ArrowRight: 'right', KeyD: 'right',
    ArrowUp: 'up', KeyW: 'up',
    ArrowDown: 'down', KeyS: 'down',
    KeyZ: 'a', Space: 'a', Enter: 'a', KeyJ: 'a',
    KeyX: 'b', KeyK: 'b', Backspace: 'b',
    KeyC: 'x', KeyL: 'x',
    KeyV: 'y',
    KeyQ: 'l', Comma: 'l',
    KeyE: 'r', Period: 'r',
    Escape: 'start', Tab: 'select'
  };

  var PADMAP = { 0: 'a', 1: 'b', 2: 'x', 3: 'y', 4: 'l', 5: 'r', 9: 'start', 8: 'select', 12: 'up', 13: 'down', 14: 'left', 15: 'right' };

  var st = {};
  BUTTONS.forEach(function (b) {
    st[b] = { down: false, pressed: false, released: false, held: 0, buffer: 0, raw: false };
  });

  var frame = 0;
  var anyKeyPressed = false;
  var enabled = true;
  /* Recording is used by the automated smoke test to replay a scripted run. */
  var scripted = null, scriptIdx = 0;

  function keyDown(e) {
    var b = KEYMAP[e.code];
    if (b) { st[b].raw = true; e.preventDefault(); }
    if (e.code === 'F2' || e.code === 'F3' || e.code === 'F4') return; // leave debug keys to listeners
    if (e.code === 'Tab') e.preventDefault();
  }
  function keyUp(e) {
    var b = KEYMAP[e.code];
    if (b) { st[b].raw = false; e.preventDefault(); }
  }

  function bind(el) {
    window.addEventListener('keydown', keyDown, { passive: false });
    window.addEventListener('keyup', keyUp, { passive: false });
    window.addEventListener('blur', function () { BUTTONS.forEach(function (b) { st[b].raw = false; }); });
    bindTouch(el);
  }

  /* ---- on-screen touch pad (mobile) ------------------------------------ */
  var touchBtns = [];
  function bindTouch(el) {
    if (!el) return;
    var pad = document.getElementById('touchpad');
    if (!pad) return;
    var nodes = pad.querySelectorAll('[data-btn]');
    for (var i = 0; i < nodes.length; i++) {
      (function (node) {
        var b = node.getAttribute('data-btn');
        var set = function (v) { return function (ev) { ev.preventDefault(); st[b].raw = v; node.classList.toggle('on', v); }; };
        node.addEventListener('touchstart', set(true), { passive: false });
        node.addEventListener('touchend', set(false), { passive: false });
        node.addEventListener('touchcancel', set(false), { passive: false });
        node.addEventListener('mousedown', set(true));
        node.addEventListener('mouseup', set(false));
        node.addEventListener('mouseleave', set(false));
        touchBtns.push(node);
      })(nodes[i]);
    }
  }

  function pollPad() {
    if (!navigator.getGamepads) return;
    var pads = navigator.getGamepads();
    for (var p = 0; p < pads.length; p++) {
      var gp = pads[p]; if (!gp) continue;
      for (var i in PADMAP) {
        if (gp.buttons[i] && gp.buttons[i].pressed) st[PADMAP[i]].raw = true;
      }
      var ax0 = gp.axes[0] || 0, ax1 = gp.axes[1] || 0;
      if (ax0 < -0.4) st.left.raw = true;
      if (ax0 > 0.4) st.right.raw = true;
      if (ax1 < -0.4) st.up.raw = true;
      if (ax1 > 0.4) st.down.raw = true;
    }
  }

  /* Called once per fixed update, before any game logic. */
  function update() {
    frame++;
    anyKeyPressed = false;
    if (navigator.getGamepads) {
      // gamepad "raw" is additive on top of keyboard, so clear pad-only bits first
      pollPad();
    }
    if (scripted) applyScript();
    for (var i = 0; i < BUTTONS.length; i++) {
      var b = BUTTONS[i], s = st[b];
      var raw = enabled ? s.raw : false;
      s.pressed = raw && !s.down;
      s.released = !raw && s.down;
      s.down = raw;
      s.held = raw ? s.held + 1 : 0;
      if (s.pressed) { s.buffer = 6; anyKeyPressed = true; }
      else if (s.buffer > 0) s.buffer--;
    }
  }

  /* Gamepad raw bits must be cleared after the frame or they latch on. */
  function postUpdate() {
    if (!navigator.getGamepads) return;
    var pads = navigator.getGamepads(), active = false;
    for (var p = 0; p < pads.length; p++) if (pads[p]) active = true;
    if (!active) return;
    // Recompute raw purely from keyboard next frame; pollPad re-adds pad state.
    for (var i = 0; i < BUTTONS.length; i++) {
      var b = BUTTONS[i];
      if (!keyHeld(b)) st[b].raw = false;
    }
  }
  var heldKeys = {};
  window.addEventListener('keydown', function (e) { if (KEYMAP[e.code]) heldKeys[KEYMAP[e.code]] = true; });
  window.addEventListener('keyup', function (e) { if (KEYMAP[e.code]) heldKeys[KEYMAP[e.code]] = false; });
  function keyHeld(b) { return !!heldKeys[b]; }

  function down(b) { return st[b] ? st[b].down : false; }
  function pressed(b) { return st[b] ? st[b].pressed : false; }
  function released(b) { return st[b] ? st[b].released : false; }
  function held(b) { return st[b] ? st[b].held : 0; }
  /* consume() eats a buffered press — used by action commands so a press a few
     frames early still counts, but only once. */
  function consume(b) {
    var s = st[b]; if (!s) return false;
    if (s.buffer > 0) { s.buffer = 0; return true; }
    return false;
  }
  function clearAll() {
    BUTTONS.forEach(function (b) { st[b].buffer = 0; st[b].pressed = false; });
  }
  function axisX() { return (down('right') ? 1 : 0) - (down('left') ? 1 : 0); }
  function axisZ() { return (down('down') ? 1 : 0) - (down('up') ? 1 : 0); }
  function anyPressed() { return anyKeyPressed; }
  function setEnabled(v) { enabled = v; }

  /* ---- scripted input (smoke test harness) ----------------------------- */
  function runScript(steps) { scripted = steps; scriptIdx = 0; }
  function applyScript() {
    if (scriptIdx >= scripted.length) { scripted = null; return; }
    var s = scripted[scriptIdx];
    if (s.wait > 0) { s.wait--; return; }
    if (s.btn) st[s.btn].raw = (s.phase !== 'up');
    scriptIdx++;
  }

  return {
    bind: bind, update: update, postUpdate: postUpdate,
    down: down, pressed: pressed, released: released, held: held, consume: consume,
    clearAll: clearAll, axisX: axisX, axisZ: axisZ, anyPressed: anyPressed,
    setEnabled: setEnabled, runScript: runScript,
    BUTTONS: BUTTONS, state: st,
    get frame() { return frame; }
  };
})();

/* ===== 02_audio.js ===== */
/* ==========================================================================
   PAPERBOUND — 02_audio.js
   Everything you hear is synthesised at runtime: no audio files ship with the
   game. A tiny tracker schedules note events a fraction of a second ahead of
   the audio clock so timing does not depend on the render loop.
   ========================================================================== */
'use strict';

PB.Audio = (function () {

  var ctx = null, master = null, musicBus = null, sfxBus = null;
  var ready = false, muted = false;
  var musicVol = 0.55, sfxVol = 0.7;
  var song = null, songName = '', step = 0, nextTime = 0, stepDur = 0.125;
  var LOOKAHEAD = 0.22;
  var noiseBuf = null;
  var pendingSong = null;
  var fadeOutUntil = 0;

  var NOTES = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

  function freq(name) {
    if (!name || name === '-' || name === '.') return 0;
    var m = /^([A-G])([#b]?)(-?\d)$/.exec(name);
    if (!m) return 0;
    var n = NOTES[m[1]];
    if (m[2] === '#') n++; else if (m[2] === 'b') n--;
    var oct = parseInt(m[3], 10);
    var midi = (oct + 1) * 12 + n;
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  function init() {
    if (ctx) return;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = muted ? 0 : 1; master.connect(ctx.destination);
    musicBus = ctx.createGain(); musicBus.gain.value = musicVol; musicBus.connect(master);
    sfxBus = ctx.createGain(); sfxBus.gain.value = sfxVol; sfxBus.connect(master);
    // white noise source buffer for percussion / paper rustle
    var len = ctx.sampleRate * 1.0;
    noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
    var d = noiseBuf.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    ready = true;
    if (pendingSong) { var p = pendingSong; pendingSong = null; play(p); }
  }

  function resume() {
    if (!ctx) init();
    if (ctx && ctx.state === 'suspended') ctx.resume();
  }

  /* ---- one-shot voice -------------------------------------------------- */
  function voice(opt) {
    if (!ready) return;
    var t0 = opt.t || ctx.currentTime;
    var bus = opt.bus || sfxBus;
    var g = ctx.createGain();
    g.connect(bus);
    var src;
    if (opt.wave === 'noise') {
      src = ctx.createBufferSource(); src.buffer = noiseBuf; src.loop = true;
      if (opt.filter) {
        var f = ctx.createBiquadFilter();
        f.type = opt.filter; f.frequency.value = opt.cut || 1200; f.Q.value = opt.q || 1;
        src.connect(f); f.connect(g);
      } else src.connect(g);
    } else {
      src = ctx.createOscillator();
      src.type = opt.wave || 'square';
      src.frequency.setValueAtTime(Math.max(20, opt.f0 || 440), t0);
      if (opt.f1 !== undefined) {
        if (opt.glide === 'exp') src.frequency.exponentialRampToValueAtTime(Math.max(20, opt.f1), t0 + (opt.dur || 0.2));
        else src.frequency.linearRampToValueAtTime(Math.max(20, opt.f1), t0 + (opt.dur || 0.2));
      }
      if (opt.vib) {
        var lfo = ctx.createOscillator(), lg = ctx.createGain();
        lfo.frequency.value = opt.vib; lg.gain.value = opt.vibAmt || 6;
        lfo.connect(lg); lg.connect(src.frequency);
        lfo.start(t0); lfo.stop(t0 + (opt.dur || 0.2) + 0.05);
      }
      src.connect(g);
    }
    var v = (opt.vol === undefined ? 0.25 : opt.vol);
    var a = opt.atk === undefined ? 0.005 : opt.atk;
    var dur = opt.dur || 0.2;
    var rel = opt.rel === undefined ? 0.04 : opt.rel;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(v, t0 + a);
    if (opt.sus !== undefined) {
      g.gain.linearRampToValueAtTime(v * opt.sus, t0 + a + (opt.dec || 0.05));
    }
    g.gain.setValueAtTime(g.gain.value, t0 + dur);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur + rel);
    src.start(t0);
    src.stop(t0 + dur + rel + 0.02);
  }

  /* ---- sfx library ----------------------------------------------------- */
  var SFX = {
    blip:      { wave: 'square',   f0: 700,  dur: 0.03, vol: 0.11, rel: 0.02 },
    blip2:     { wave: 'square',   f0: 900,  dur: 0.03, vol: 0.09, rel: 0.02 },
    cursor:    { wave: 'square',   f0: 620,  f1: 780,  dur: 0.05, vol: 0.16 },
    ok:        { wave: 'square',   f0: 660,  f1: 990,  dur: 0.09, vol: 0.2 },
    cancel:    { wave: 'square',   f0: 480,  f1: 260,  dur: 0.1,  vol: 0.18 },
    error:     { wave: 'sawtooth', f0: 190,  f1: 130,  dur: 0.16, vol: 0.16 },
    jump:      { wave: 'square',   f0: 420,  f1: 880,  dur: 0.12, vol: 0.2, glide: 'exp' },
    land:      { wave: 'noise',    filter: 'lowpass', cut: 700, dur: 0.07, vol: 0.16 },
    step:      { wave: 'noise',    filter: 'bandpass', cut: 2200, q: 2, dur: 0.035, vol: 0.06 },
    hit:       { wave: 'noise',    filter: 'lowpass', cut: 2600, dur: 0.09, vol: 0.28 },
    hitBig:    { wave: 'noise',    filter: 'lowpass', cut: 1400, dur: 0.2,  vol: 0.34 },
    mallet:    { wave: 'noise',    filter: 'lowpass', cut: 900, dur: 0.14, vol: 0.32 },
    hurt:      { wave: 'square',   f0: 330,  f1: 110,  dur: 0.22, vol: 0.24 },
    guard:     { wave: 'square',   f0: 1200, f1: 1600, dur: 0.06, vol: 0.22 },
    superguard:{ wave: 'square',   f0: 1500, f1: 2400, dur: 0.11, vol: 0.26, vib: 30, vibAmt: 40 },
    stylish:   { wave: 'triangle', f0: 1046, f1: 1568, dur: 0.14, vol: 0.24 },
    coin:      { wave: 'square',   f0: 1046, f1: 1568, dur: 0.1,  vol: 0.2 },
    heal:      { wave: 'triangle', f0: 523,  f1: 1046, dur: 0.26, vol: 0.22 },
    fp:        { wave: 'triangle', f0: 784,  f1: 1318, dur: 0.2,  vol: 0.2 },
    fold:      { wave: 'noise',    filter: 'bandpass', cut: 3400, q: 3, dur: 0.16, vol: 0.2 },
    rustle:    { wave: 'noise',    filter: 'highpass', cut: 2800, dur: 0.22, vol: 0.14 },
    fire:      { wave: 'noise',    filter: 'bandpass', cut: 1100, q: 0.7, dur: 0.4, vol: 0.24 },
    ice:       { wave: 'triangle', f0: 1800, f1: 900,  dur: 0.3,  vol: 0.2, vib: 18, vibAmt: 60 },
    zap:       { wave: 'sawtooth', f0: 1400, f1: 220,  dur: 0.18, vol: 0.2 },
    water:     { wave: 'noise',    filter: 'lowpass', cut: 600, dur: 0.34, vol: 0.2 },
    door:      { wave: 'noise',    filter: 'lowpass', cut: 500, dur: 0.3, vol: 0.2 },
    chest:     { wave: 'square',   f0: 523,  f1: 1046, dur: 0.3, vol: 0.2 },
    levelup:   { wave: 'square',   f0: 523,  f1: 1568, dur: 0.5, vol: 0.24 },
    seal:      { wave: 'triangle', f0: 392,  f1: 1568, dur: 0.7, vol: 0.26, vib: 6, vibAmt: 14 },
    roar:      { wave: 'sawtooth', f0: 150,  f1: 60,   dur: 0.7, vol: 0.3, vib: 12, vibAmt: 20 },
    defeat:    { wave: 'square',   f0: 660,  f1: 130,  dur: 0.7, vol: 0.22 },
    danger:    { wave: 'square',   f0: 880,  f1: 880,  dur: 0.09, vol: 0.2 },
    charge:    { wave: 'square',   f0: 220,  f1: 880,  dur: 0.45, vol: 0.16 },
    swap:      { wave: 'square',   f0: 880,  f1: 590,  dur: 0.09, vol: 0.16 },
    tear:      { wave: 'noise',    filter: 'bandpass', cut: 1800, q: 1.4, dur: 0.5, vol: 0.26 }
  };

  function sfx(name, detune) {
    if (!ready) { init(); if (!ready) return; }
    var o = SFX[name];
    if (!o) return;
    var c = {}; for (var k in o) c[k] = o[k];
    if (detune) { if (c.f0) c.f0 *= detune; if (c.f1) c.f1 *= detune; }
    c.bus = sfxBus;
    voice(c);
  }

  /* Layered stingers built from the primitive voices. */
  function chord(freqs, dur, wave, vol) {
    if (!ready) return;
    var t = ctx.currentTime;
    for (var i = 0; i < freqs.length; i++) {
      voice({ wave: wave || 'square', f0: freqs[i], dur: dur || 0.4, vol: (vol || 0.14), t: t + i * 0.02, bus: sfxBus, rel: 0.25 });
    }
  }
  function fanfare(kind) {
    if (!ready) { init(); if (!ready) return; }
    var t = ctx.currentTime, seq;
    if (kind === 'victory') seq = [[523, .11], [659, .11], [784, .11], [1046, .34]];
    else if (kind === 'levelup') seq = [[659, .1], [784, .1], [1046, .1], [1318, .38]];
    else if (kind === 'item') seq = [[784, .09], [1046, .22]];
    else if (kind === 'seal') seq = [[392, .14], [523, .14], [659, .14], [784, .14], [1046, .5]];
    else seq = [[523, .12], [784, .3]];
    var at = 0;
    for (var i = 0; i < seq.length; i++) {
      voice({ wave: 'square', f0: seq[i][0], dur: seq[i][1], vol: 0.2, t: t + at, bus: sfxBus, rel: 0.12 });
      voice({ wave: 'triangle', f0: seq[i][0] / 2, dur: seq[i][1], vol: 0.16, t: t + at, bus: sfxBus, rel: 0.12 });
      at += seq[i][1];
    }
  }

  /* ---- tracker --------------------------------------------------------- */
  /* A song is { bpm, div, tracks:[{wave, vol, oct, seq:"C4 . E4 - ..."}] }.
     "." sustains the previous note, "-" is a rest. All tracks must be the
     same length in steps; the shortest simply loops within the pattern. */
  var SONGS = {};
  function defineSong(name, def) {
    def.tracks.forEach(function (tr) {
      if (typeof tr.seq === 'string') tr.notes = tr.seq.trim().split(/\s+/);
      else tr.notes = tr.seq;
    });
    def.len = def.tracks.reduce(function (m, t) { return Math.max(m, t.notes.length); }, 0);
    SONGS[name] = def;
  }

  function play(name) {
    if (songName === name) return;
    if (!ready) { pendingSong = name; init(); if (!ready) { songName = name; return; } }
    songName = name;
    song = SONGS[name] || null;
    step = 0;
    if (song) {
      stepDur = 60 / song.bpm / (song.div || 4);
      nextTime = ctx.currentTime + 0.05;
    }
  }
  function stop() { song = null; songName = ''; }

  function tick() {
    if (!ready || !song) return;
    var now = ctx.currentTime;
    while (nextTime < now + LOOKAHEAD) {
      scheduleStep(step, nextTime);
      step++;
      nextTime += stepDur;
      if (step >= song.len) step = 0;
    }
  }

  function scheduleStep(s, t) {
    for (var i = 0; i < song.tracks.length; i++) {
      var tr = song.tracks[i];
      var n = tr.notes[s % tr.notes.length];
      if (!n || n === '.' || n === '-') continue;
      if (tr.wave === 'noise' || n === 'x' || n === 'X' || n === 'o') {
        // percussion lane: x = hat, X = snare, o = kick
        if (n === 'o') voice({ wave: 'sine', f0: 150, f1: 45, dur: 0.1, vol: (tr.vol || .3) * .9, t: t, bus: musicBus, glide: 'exp' });
        else if (n === 'X') voice({ wave: 'noise', filter: 'bandpass', cut: 1900, q: 0.9, dur: 0.09, vol: (tr.vol || .3) * .5, t: t, bus: musicBus });
        else voice({ wave: 'noise', filter: 'highpass', cut: 6500, dur: 0.03, vol: (tr.vol || .3) * .26, t: t, bus: musicBus });
        continue;
      }
      var f = freq(n);
      if (!f) continue;
      // sustain: extend while following steps are "."
      var hold = 1, k = s + 1;
      while (k < s + 16 && tr.notes[k % tr.notes.length] === '.') { hold++; k++; }
      voice({
        wave: tr.wave || 'square', f0: f, dur: stepDur * hold * 0.92,
        vol: tr.vol === undefined ? 0.13 : tr.vol, t: t, bus: musicBus,
        atk: tr.atk === undefined ? 0.008 : tr.atk,
        rel: tr.rel === undefined ? 0.05 : tr.rel,
        vib: tr.vib, vibAmt: tr.vibAmt
      });
    }
  }

  function setMusicVol(v) { musicVol = PB.U.clamp(v, 0, 1); if (musicBus) musicBus.gain.value = musicVol; }
  function setSfxVol(v) { sfxVol = PB.U.clamp(v, 0, 1); if (sfxBus) sfxBus.gain.value = sfxVol; }
  function getMusicVol() { return musicVol; }
  function getSfxVol() { return sfxVol; }
  function setMuted(v) { muted = v; if (master) master.gain.value = v ? 0 : 1; }
  function isMuted() { return muted; }

  return {
    init: init, resume: resume, tick: tick, sfx: sfx, chord: chord, fanfare: fanfare,
    play: play, stop: stop, defineSong: defineSong,
    setMusicVol: setMusicVol, setSfxVol: setSfxVol, getMusicVol: getMusicVol, getSfxVol: getSfxVol,
    setMuted: setMuted, isMuted: isMuted,
    get current() { return songName; }
  };
})();

/* ===== 03_paper.js ===== */
/* ==========================================================================
   PAPERBOUND — 03_paper.js
   The papercraft look: flat fills, heavy ink outlines, lifted drop shadows,
   fibre texture, torn edges, and the signature "turn a flat sprite edge-on"
   flip. Every shape helper routes its colours through F()/S() so an entire
   sprite can be re-rendered as a silhouette for shadows and flash effects.
   ========================================================================== */
'use strict';

PB.Paper = (function () {

  var U = PB.U;
  var mode = null;          // silhouette override {fill, stroke}
  var texCanvas = null;     // tiled fibre texture
  var vignette = null;

  function F(c) { return mode ? mode.fill : c; }
  function S(c) { return mode ? (mode.stroke || 'rgba(0,0,0,0)') : c; }
  function setMode(m) { mode = m; }
  function silhouette(color) { mode = { fill: color, stroke: color }; }
  function clearMode() { mode = null; }

  /* ---- ink outline colour derived from the fill ------------------------ */
  function ink(fill) { return U.shade(fill, -0.55); }
  function lit(fill) { return U.shade(fill, 0.22); }

  /* ---- primitives ------------------------------------------------------ */
  function poly(ctx, pts, fill, stroke, lw) {
    if (pts.length < 2) return;
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.closePath();
    if (fill) { ctx.fillStyle = F(fill); ctx.fill(); }
    if (stroke !== null) { ctx.lineWidth = lw || 2; ctx.strokeStyle = S(stroke || ink(fill || '#000')); ctx.lineJoin = 'round'; ctx.stroke(); }
  }

  function line(ctx, pts, stroke, lw, cap) {
    if (pts.length < 2) return;
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.lineWidth = lw || 2;
    ctx.lineCap = cap || 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = S(stroke);
    ctx.stroke();
  }

  function rr(ctx, x, y, w, h, r, fill, stroke, lw) {
    r = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    if (fill) { ctx.fillStyle = F(fill); ctx.fill(); }
    if (stroke !== null) { ctx.lineWidth = lw || 2; ctx.strokeStyle = S(stroke || ink(fill || '#000')); ctx.stroke(); }
  }

  function ell(ctx, x, y, rx, ry, fill, stroke, lw, rot) {
    ctx.beginPath();
    ctx.ellipse(x, y, Math.abs(rx), Math.abs(ry), rot || 0, 0, Math.PI * 2);
    if (fill) { ctx.fillStyle = F(fill); ctx.fill(); }
    if (stroke !== null) { ctx.lineWidth = lw || 2; ctx.strokeStyle = S(stroke || ink(fill || '#000')); ctx.stroke(); }
  }

  /* Organic wobbly circle — the go-to shape for blobby paper creatures. */
  function blob(ctx, x, y, r, wob, seed, fill, stroke, lw, squashY) {
    var n = 14, pts = [];
    squashY = squashY === undefined ? 1 : squashY;
    for (var i = 0; i < n; i++) {
      var a = (i / n) * Math.PI * 2;
      var k = 1 + Math.sin(a * 3 + seed) * wob * 0.5 + Math.sin(a * 5 - seed * 1.7) * wob * 0.3;
      pts.push([x + Math.cos(a) * r * k, y + Math.sin(a) * r * k * squashY]);
    }
    ctx.beginPath();
    for (var j = 0; j <= n; j++) {
      var p0 = pts[(j) % n], p1 = pts[(j + 1) % n];
      var mx = (p0[0] + p1[0]) / 2, my = (p0[1] + p1[1]) / 2;
      if (j === 0) ctx.moveTo(mx, my);
      else ctx.quadraticCurveTo(p0[0], p0[1], mx, my);
    }
    ctx.closePath();
    if (fill) { ctx.fillStyle = F(fill); ctx.fill(); }
    if (stroke !== null) { ctx.lineWidth = lw || 2; ctx.strokeStyle = S(stroke || ink(fill || '#000')); ctx.stroke(); }
  }

  function star(ctx, x, y, rOut, rIn, points, rot, fill, stroke, lw) {
    var pts = [];
    for (var i = 0; i < points * 2; i++) {
      var a = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2 + (rot || 0);
      var r = (i % 2 === 0) ? rOut : rIn;
      pts.push([x + Math.cos(a) * r, y + Math.sin(a) * r]);
    }
    poly(ctx, pts, fill, stroke, lw);
  }

  /* Jagged torn-paper edge, used for terrain silhouettes and banners. */
  function tornEdge(ctx, x0, x1, y, amp, step, seed, fill, down, bottomY) {
    var pts = [], x = x0, i = 0;
    while (x < x1) {
      var n = Math.sin(x * 0.037 + seed) * 0.5 + Math.sin(x * 0.011 - seed * 2.3) * 0.5;
      pts.push([x, y + n * amp + (i % 2 ? amp * 0.25 : -amp * 0.2)]);
      x += step; i++;
    }
    pts.push([x1, y]);
    if (down) { pts.push([x1, bottomY]); pts.push([x0, bottomY]); }
    else { pts.push([x1, bottomY]); pts.push([x0, bottomY]); }
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (var k = 1; k < pts.length; k++) ctx.lineTo(pts[k][0], pts[k][1]);
    ctx.closePath();
    ctx.fillStyle = F(fill);
    ctx.fill();
  }

  /* ---- fibre texture --------------------------------------------------- */
  function buildTexture(w, h) {
    texCanvas = document.createElement('canvas');
    texCanvas.width = 128; texCanvas.height = 128;
    var c = texCanvas.getContext('2d');
    var img = c.createImageData(128, 128);
    for (var i = 0; i < img.data.length; i += 4) {
      var v = 128 + (Math.random() * 26 - 13);
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 26;
    }
    c.putImageData(img, 0, 0);
    // faint horizontal fibres
    c.globalAlpha = 0.05;
    c.strokeStyle = '#000';
    for (var j = 0; j < 40; j++) {
      c.beginPath();
      var y = Math.random() * 128;
      c.moveTo(0, y);
      c.bezierCurveTo(42, y + Math.random() * 4 - 2, 86, y + Math.random() * 4 - 2, 128, y);
      c.lineWidth = Math.random() * 0.8;
      c.stroke();
    }
    c.globalAlpha = 1;

    vignette = document.createElement('canvas');
    vignette.width = w; vignette.height = h;
    var vc = vignette.getContext('2d');
    var g = vc.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.32, w / 2, h / 2, Math.max(w, h) * 0.74);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(24,16,40,0.36)');
    vc.fillStyle = g; vc.fillRect(0, 0, w, h);
  }

  function overlayTexture(ctx, w, h, alpha) {
    if (!texCanvas) buildTexture(w, h);
    var p = ctx.createPattern(texCanvas, 'repeat');
    ctx.save();
    ctx.globalAlpha = alpha === undefined ? 0.55 : alpha;
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = p;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  function overlayVignette(ctx, w, h) {
    if (!vignette) buildTexture(w, h);
    ctx.drawImage(vignette, 0, 0);
  }

  /* ---- shadows --------------------------------------------------------- */
  /* Soft contact shadow on the ground plane. */
  function groundShadow(ctx, x, y, rx, ry, alpha) {
    var g = ctx.createRadialGradient(x, y, 0, x, y, Math.max(1, rx));
    g.addColorStop(0, 'rgba(30,20,50,' + (alpha === undefined ? 0.34 : alpha) + ')');
    g.addColorStop(0.65, 'rgba(30,20,50,' + (alpha === undefined ? 0.2 : alpha * 0.6) + ')');
    g.addColorStop(1, 'rgba(30,20,50,0)');
    ctx.save();
    ctx.translate(x, y); ctx.scale(1, ry / Math.max(1, rx)); ctx.translate(-x, -y);
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, rx, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  /* Draw fn twice: once offset + darkened (the paper lifted off the page),
     once normally. */
  function withDropShadow(ctx, dx, dy, alpha, fn) {
    ctx.save();
    ctx.translate(dx, dy);
    silhouette('rgba(28,18,45,' + (alpha === undefined ? 0.28 : alpha) + ')');
    fn(ctx);
    clearMode();
    ctx.restore();
    fn(ctx);
  }

  /* ---- the paper flip -------------------------------------------------- */
  /* t in 0..1 sweeps a sprite edge-on and back — how paper characters turn
     around. Returns the horizontal scale to apply. */
  function flipScale(t) {
    var s = Math.cos(t * Math.PI);
    return Math.abs(s) < 0.04 ? (s < 0 ? -0.04 : 0.04) : s;
  }

  /* ---- text ------------------------------------------------------------ */
  var FONT = '"Trebuchet MS", "Lucida Grande", "Segoe UI", Verdana, sans-serif';
  function font(size, weight) { return (weight || 'bold') + ' ' + size + 'px ' + FONT; }

  function text(ctx, str, x, y, o) {
    o = o || {};
    var size = o.size || 16;
    ctx.save();
    ctx.font = font(size, o.weight);
    ctx.textAlign = o.align || 'left';
    ctx.textBaseline = o.baseline || 'alphabetic';
    if (o.shadow !== false) {
      ctx.fillStyle = o.shadowColor || 'rgba(20,12,36,0.4)';
      ctx.fillText(str, x + (o.sx || 2), y + (o.sy || 2));
    }
    if (o.outline !== false) {
      ctx.lineWidth = o.ow || Math.max(2.5, size * 0.22);
      ctx.strokeStyle = o.outlineColor || '#2a1c3c';
      ctx.lineJoin = 'round';
      ctx.miterLimit = 2;
      ctx.strokeText(str, x, y);
    }
    ctx.fillStyle = o.color || '#fff';
    ctx.fillText(str, x, y);
    ctx.restore();
  }

  /* Per-character rendering with an optional sine wave — used for shouting,
     wobbling and the "spooky" dialogue style. */
  function textWave(ctx, str, x, y, o) {
    o = o || {};
    var size = o.size || 16;
    ctx.save();
    ctx.font = font(size, o.weight);
    ctx.textBaseline = o.baseline || 'alphabetic';
    var total = 0, w = [];
    for (var i = 0; i < str.length; i++) { w[i] = ctx.measureText(str[i]).width; total += w[i]; }
    var cx = (o.align === 'center') ? x - total / 2 : (o.align === 'right' ? x - total : x);
    for (var j = 0; j < str.length; j++) {
      var dy = o.amp ? Math.sin(o.phase + j * (o.freq || 0.6)) * o.amp : 0;
      var dx = o.ampX ? Math.cos(o.phase * 1.3 + j * 0.9) * o.ampX : 0;
      ctx.lineWidth = o.ow || Math.max(2.5, size * 0.22);
      ctx.strokeStyle = o.outlineColor || '#2a1c3c';
      ctx.lineJoin = 'round'; ctx.miterLimit = 2;
      if (o.outline !== false) ctx.strokeText(str[j], cx + dx, y + dy);
      ctx.fillStyle = o.color || '#fff';
      ctx.fillText(str[j], cx + dx, y + dy);
      cx += w[j];
    }
    ctx.restore();
  }

  function measure(ctx, str, size, weight) {
    ctx.save(); ctx.font = font(size, weight);
    var w = ctx.measureText(str).width;
    ctx.restore();
    return w;
  }

  /* Word-wrap that respects inline colour tags of the form <c:#ff0>..</c>
     by measuring the tag-stripped text. */
  function wrap(ctx, str, maxW, size, weight) {
    var words = str.split(' '), lines = [], cur = '';
    ctx.save(); ctx.font = font(size, weight);
    for (var i = 0; i < words.length; i++) {
      if (words[i] === '\n') { lines.push(cur); cur = ''; continue; }
      var test = cur ? cur + ' ' + words[i] : words[i];
      if (ctx.measureText(stripTags(test)).width > maxW && cur) { lines.push(cur); cur = words[i]; }
      else cur = test;
    }
    if (cur) lines.push(cur);
    ctx.restore();
    return lines;
  }
  function stripTags(s) { return s.replace(/<\/?[a-z]+(:[^>]*)?>/g, ''); }

  /* ---- 9-slice paper panel -------------------------------------------- */
  function panel(ctx, x, y, w, h, o) {
    o = o || {};
    var r = o.radius === undefined ? 12 : o.radius;
    var fill = o.fill || '#fdf6e3';
    var edge = o.edge || U.shade(fill, -0.4);
    ctx.save();
    // lifted shadow
    ctx.globalAlpha = o.shadowAlpha === undefined ? 0.3 : o.shadowAlpha;
    rr(ctx, x + 5, y + 6, w, h, r, '#1c1230', null);
    ctx.globalAlpha = 1;
    // backing sheet, slightly rotated for the stacked-paper feel
    if (o.stack !== false) {
      ctx.save();
      ctx.translate(x + w / 2, y + h / 2); ctx.rotate(o.stackRot || -0.008); ctx.translate(-x - w / 2, -y - h / 2);
      rr(ctx, x - 3, y - 2, w + 6, h + 4, r, U.shade(fill, -0.12), edge, 2);
      ctx.restore();
    }
    rr(ctx, x, y, w, h, r, fill, edge, o.lw || 3);
    // inner highlight
    ctx.globalAlpha = 0.5;
    rr(ctx, x + 4, y + 4, w - 8, h - 8, Math.max(2, r - 4), null, U.shade(fill, 0.5), 1.5);
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  /* Speech bubble with a tail pointing at (tx, ty). */
  function bubble(ctx, x, y, w, h, tx, ty, o) {
    o = o || {};
    var fill = o.fill || '#fffdf5';
    var edge = o.edge || '#3a2a1a';
    ctx.save();
    ctx.globalAlpha = 0.28;
    rr(ctx, x + 5, y + 6, w, h, 14, '#1c1230', null);
    ctx.globalAlpha = 1;
    if (tx !== null && tx !== undefined) {
      var ax = U.clamp(tx, x + 18, x + w - 18);
      var side = ty > y + h / 2 ? 1 : -1;
      var baseY = side > 0 ? y + h - 2 : y + 2;
      poly(ctx, [[ax - 13, baseY], [ax + 13, baseY], [tx, ty]], fill, edge, 3);
    }
    rr(ctx, x, y, w, h, 14, fill, edge, 3);
    if (tx !== null && tx !== undefined) {
      var ax2 = U.clamp(tx, x + 18, x + w - 18);
      var side2 = ty > y + h / 2 ? 1 : -1;
      var by = side2 > 0 ? y + h - 2 : y + 2;
      poly(ctx, [[ax2 - 11, by - side2 * 3], [ax2 + 11, by - side2 * 3], [tx, ty]], fill, null, 0);
    }
    ctx.restore();
  }

  /* ---- misc effects ---------------------------------------------------- */
  function sparkle(ctx, x, y, r, color, rot) {
    ctx.save();
    ctx.translate(x, y); ctx.rotate(rot || 0);
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.quadraticCurveTo(r * 0.16, -r * 0.16, r, 0);
    ctx.quadraticCurveTo(r * 0.16, r * 0.16, 0, r);
    ctx.quadraticCurveTo(-r * 0.16, r * 0.16, -r, 0);
    ctx.quadraticCurveTo(-r * 0.16, -r * 0.16, 0, -r);
    ctx.fillStyle = F(color || '#fff8c0');
    ctx.fill();
    ctx.restore();
  }

  function creaseLines(ctx, x, y, w, h, n, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha === undefined ? 0.09 : alpha;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    for (var i = 1; i < n; i++) {
      var px = x + (w / n) * i;
      ctx.beginPath(); ctx.moveTo(px, y); ctx.lineTo(px, y + h); ctx.stroke();
    }
    ctx.restore();
  }

  return {
    F: F, S: S, setMode: setMode, silhouette: silhouette, clearMode: clearMode,
    ink: ink, lit: lit,
    poly: poly, line: line, rr: rr, ell: ell, blob: blob, star: star, tornEdge: tornEdge,
    buildTexture: buildTexture, overlayTexture: overlayTexture, overlayVignette: overlayVignette,
    groundShadow: groundShadow, withDropShadow: withDropShadow, flipScale: flipScale,
    text: text, textWave: textWave, measure: measure, wrap: wrap, stripTags: stripTags,
    panel: panel, bubble: bubble, sparkle: sparkle, creaseLines: creaseLines,
    font: font, FONT: FONT
  };
})();

/* ===== 04_sprites.js ===== */
/* ==========================================================================
   PAPERBOUND — 04_sprites.js
   Characters are not images. Each one is a small config (colours, proportions,
   features) fed to a shared archetype renderer, so the whole cast reads as one
   papercraft set: flat fills, thick ink lines, big expressive eyes.

   Origin for every sprite is the FEET at (0,0); up is -y.
   ========================================================================== */
'use strict';

PB.Sprites = (function () {

  var U = PB.U, P = PB.Paper;
  var lib = {};

  function define(id, cfg) { cfg.id = id; lib[id] = cfg; return cfg; }
  function get(id) { return lib[id] || lib.unknown; }
  function has(id) { return !!lib[id]; }
  function all() { return lib; }

  /* ---- animation clock -------------------------------------------------- */
  function anim(st) {
    var t = st.t || 0;
    var a = st.anim || 'idle';
    var sp = st.animSpeed || 1;
    var o = { t: t, a: a, bob: 0, swing: 0, lean: 0, squash: 1, stretch: 1, armL: 0, armR: 0, rot: 0, yOff: 0 };
    switch (a) {
      case 'walk':
        o.swing = Math.sin(t * 0.30 * sp);
        o.bob = Math.abs(Math.sin(t * 0.30 * sp)) * 2.2;
        o.rot = Math.sin(t * 0.30 * sp) * 0.05;
        break;
      case 'run':
        o.swing = Math.sin(t * 0.48 * sp);
        o.bob = Math.abs(Math.sin(t * 0.48 * sp)) * 3.4;
        o.lean = 0.13;
        o.rot = Math.sin(t * 0.48 * sp) * 0.07;
        break;
      case 'jump':
        o.swing = -0.75; o.stretch = 1.1; o.squash = 0.94; o.armL = -1.1; o.armR = -0.9;
        break;
      case 'fall':
        o.swing = 0.5; o.armL = -1.4; o.armR = -1.2;
        break;
      case 'hurt':
        o.rot = Math.sin(t * 1.4) * 0.24; o.lean = -0.2; o.squash = 1.05; o.stretch = 0.93;
        break;
      case 'defeat':
        o.rot = -1.35; o.yOff = 6; o.squash = 1.15; o.stretch = 0.8;
        break;
      case 'attack':
        o.lean = 0.3; o.armL = -1.6; o.armR = -1.9; o.swing = -0.4;
        break;
      case 'cast':
        o.armL = -2.1; o.armR = -2.1; o.bob = Math.sin(t * 0.2) * 2.5; o.stretch = 1.03;
        break;
      case 'cheer':
        o.armL = -2.4; o.armR = -2.4; o.bob = Math.abs(Math.sin(t * 0.34)) * 6; o.stretch = 1.04;
        break;
      case 'guard':
        o.armL = -1.5; o.armR = -1.5; o.squash = 1.08; o.stretch = 0.9; o.lean = -0.1;
        break;
      case 'sleep':
        o.bob = Math.sin(t * 0.06) * 1.6; o.rot = 0.1; o.squash = 1.03;
        break;
      case 'dizzy':
        o.rot = Math.sin(t * 0.22) * 0.18; o.bob = Math.sin(t * 0.11) * 2;
        break;
      case 'talk':
        o.bob = Math.abs(Math.sin(t * 0.42)) * 1.4;
        break;
      default: // idle
        o.bob = Math.sin(t * 0.055) * 1.5;
        o.squash = 1 + Math.sin(t * 0.055) * 0.015;
        o.stretch = 1 - Math.sin(t * 0.055) * 0.015;
    }
    return o;
  }

  /* ---- eyes ------------------------------------------------------------- */
  function eye(ctx, x, y, w, h, cfg, st, side) {
    var style = cfg.eyeStyle || 'round';
    var white = cfg.eyeWhite || '#ffffff';
    var pupil = cfg.eyePupil || '#241a30';
    var blink = st.blink || 0;
    var look = st.look || 0;
    if (st.anim === 'defeat' || st.dead) style = 'cross';
    if (st.anim === 'dizzy') style = 'spiral';
    if (st.anim === 'sleep') style = 'sleepy';

    if (blink > 0.6 && style !== 'cross' && style !== 'spiral') {
      P.line(ctx, [[x - w, y], [x + w, y]], pupil, Math.max(2, h * 0.4));
      return;
    }
    switch (style) {
      case 'cross':
        P.line(ctx, [[x - w * .8, y - h * .8], [x + w * .8, y + h * .8]], pupil, Math.max(2.2, w * 0.35));
        P.line(ctx, [[x + w * .8, y - h * .8], [x - w * .8, y + h * .8]], pupil, Math.max(2.2, w * 0.35));
        break;
      case 'spiral':
        ctx.save(); ctx.beginPath();
        for (var i = 0; i < 26; i++) {
          var a = i * 0.5, r = (i / 26) * w;
          var px = x + Math.cos(a + st.t * 0.1) * r, py = y + Math.sin(a + st.t * 0.1) * r * (h / w);
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.strokeStyle = pupil; ctx.lineWidth = Math.max(1.5, w * 0.22); ctx.stroke(); ctx.restore();
        break;
      case 'happy':
        ctx.beginPath();
        ctx.arc(x, y + h * .35, w, Math.PI * 1.15, Math.PI * 1.85);
        ctx.strokeStyle = P.S(pupil); ctx.lineWidth = Math.max(2.2, w * 0.34); ctx.lineCap = 'round'; ctx.stroke();
        break;
      case 'sleepy':
        ctx.beginPath();
        ctx.arc(x, y - h * .3, w, Math.PI * 0.18, Math.PI * 0.82);
        ctx.strokeStyle = P.S(pupil); ctx.lineWidth = Math.max(2.2, w * 0.32); ctx.lineCap = 'round'; ctx.stroke();
        break;
      case 'angry':
        P.ell(ctx, x, y, w, h, white, pupil, 1.6);
        P.ell(ctx, x + look * w * .3, y + h * .18, w * .46, h * .58, pupil, null);
        P.line(ctx, [[x - w * 1.1, y - h * 1.5], [x + w * .9, y - h * .55]], pupil, Math.max(2.4, w * 0.3));
        break;
      case 'void':
        P.ell(ctx, x, y, w, h, '#120b1e', '#000', 1.2);
        P.ell(ctx, x + look * w * .3, y - h * .2, w * .28, h * .3, cfg.eyeGlow || '#ff5a7a', null);
        break;
      case 'goggle':
        P.ell(ctx, x, y, w * 1.35, h * 1.2, cfg.detail || '#8fd3ff', pupil, 2.4);
        P.ell(ctx, x - w * .3, y - h * .35, w * .32, h * .28, 'rgba(255,255,255,0.8)', null);
        break;
      case 'single':
        P.ell(ctx, x, y, w * 1.5, h * 1.4, white, pupil, 2);
        P.ell(ctx, x + look * w * .4, y + h * .1, w * .6, h * .7, pupil, null);
        P.ell(ctx, x + look * w * .4 - w * .22, y - h * .2, w * .2, h * .22, '#fff', null);
        break;
      case 'star':
        P.star(ctx, x, y, w * 1.15, w * 0.5, 5, st.t * 0.02, cfg.eyeGlow || '#ffe066', pupil, 1.6);
        break;
      case 'dot':
        P.ell(ctx, x, y, w * .55, h * .55, pupil, null);
        break;
      case 'oval':
        P.ell(ctx, x, y, w, h * 1.25, white, pupil, 1.8);
        P.ell(ctx, x + look * w * .3, y + h * .2, w * .46, h * .6, pupil, null);
        P.ell(ctx, x + look * w * .3 - w * .18, y - h * .15, w * .17, h * .2, '#fff', null);
        break;
      default: // round
        P.ell(ctx, x, y, w, h, white, pupil, 1.8);
        P.ell(ctx, x + look * w * .32, y + h * .12, w * .5, h * .6, pupil, null);
        P.ell(ctx, x + look * w * .32 - w * .2, y - h * .18, w * .18, h * .2, '#fff', null);
    }
  }

  function mouth(ctx, x, y, w, cfg, st) {
    var m = cfg.mouth || 'smile';
    var col = cfg.mouthColor || '#3a2438';
    if (st.anim === 'defeat') m = 'frown';
    var talkOpen = (st.talking && Math.sin(st.t * 0.42) > 0) ? 1 : 0;
    if (st.talking && m !== 'none') m = talkOpen ? 'open' : 'flat';
    switch (m) {
      case 'none': break;
      case 'flat': P.line(ctx, [[x - w * .5, y], [x + w * .5, y]], col, 2.2); break;
      case 'frown':
        ctx.beginPath(); ctx.arc(x, y + w * .55, w * .55, Math.PI * 1.2, Math.PI * 1.8);
        ctx.strokeStyle = col; ctx.lineWidth = 2.4; ctx.lineCap = 'round'; ctx.stroke(); break;
      case 'grin':
        ctx.beginPath(); ctx.arc(x, y - w * .18, w * .62, Math.PI * 0.12, Math.PI * 0.88);
        ctx.strokeStyle = col; ctx.lineWidth = 2.6; ctx.lineCap = 'round'; ctx.stroke();
        P.line(ctx, [[x - w * .3, y + w * .12], [x - w * .3, y + w * .34]], col, 1.6);
        P.line(ctx, [[x + w * .3, y + w * .12], [x + w * .3, y + w * .34]], col, 1.6);
        break;
      case 'open':
        P.ell(ctx, x, y + w * .1, w * .42, w * .38, cfg.mouthIn || '#7a2f44', col, 2);
        break;
      case 'fang':
        P.ell(ctx, x, y + w * .06, w * .5, w * .34, cfg.mouthIn || '#5a1f30', col, 2);
        P.poly(ctx, [[x - w * .34, y - w * .22], [x - w * .16, y - w * .22], [x - w * .25, y + w * .14]], '#fff', col, 1.2);
        P.poly(ctx, [[x + w * .34, y - w * .22], [x + w * .16, y - w * .22], [x + w * .25, y + w * .14]], '#fff', col, 1.2);
        break;
      case 'beak':
        P.poly(ctx, [[x - w * .5, y - w * .2], [x + w * .5, y], [x - w * .5, y + w * .2]], cfg.beak || '#f0b040', null);
        break;
      case 'wave':
        ctx.beginPath(); ctx.moveTo(x - w * .5, y);
        ctx.quadraticCurveTo(x - w * .25, y - w * .3, x, y);
        ctx.quadraticCurveTo(x + w * .25, y + w * .3, x + w * .5, y);
        ctx.strokeStyle = col; ctx.lineWidth = 2.2; ctx.stroke(); break;
      case 'smirk':
        ctx.beginPath(); ctx.moveTo(x - w * .4, y + w * .08);
        ctx.quadraticCurveTo(x + w * .1, y + w * .22, x + w * .48, y - w * .18);
        ctx.strokeStyle = col; ctx.lineWidth = 2.4; ctx.lineCap = 'round'; ctx.stroke(); break;
      default: // smile
        ctx.beginPath(); ctx.arc(x, y - w * .1, w * .5, Math.PI * 0.14, Math.PI * 0.86);
        ctx.strokeStyle = col; ctx.lineWidth = 2.4; ctx.lineCap = 'round'; ctx.stroke();
    }
  }

  /* ---- shared feature bits --------------------------------------------- */
  function feature(ctx, name, cfg, st, A, headX, headY, hw, hh) {
    var d = cfg.detail || '#ffffff';
    switch (name) {
      case 'crown':
        P.poly(ctx, [[headX - hw * .72, headY - hh * .92], [headX - hw * .44, headY - hh * 1.5],
          [headX - hw * .16, headY - hh * 1.02], [headX + hw * .16, headY - hh * 1.62],
          [headX + hw * .44, headY - hh * 1.02], [headX + hw * .72, headY - hh * 1.44],
          [headX + hw * .78, headY - hh * .88]], cfg.crownColor || '#ffd24a', null, 2);
        break;
      case 'horns':
        P.poly(ctx, [[headX - hw * .8, headY - hh * .6], [headX - hw * 1.25, headY - hh * 1.5], [headX - hw * .42, headY - hh * .95]], cfg.hornColor || '#f2e6cf', null, 2);
        P.poly(ctx, [[headX + hw * .8, headY - hh * .6], [headX + hw * 1.25, headY - hh * 1.5], [headX + hw * .42, headY - hh * .95]], cfg.hornColor || '#f2e6cf', null, 2);
        break;
      case 'antenna':
        P.line(ctx, [[headX, headY - hh * .9], [headX + Math.sin(st.t * 0.06) * 5, headY - hh * 1.7]], P.ink(cfg.body), 2.4);
        P.ell(ctx, headX + Math.sin(st.t * 0.06) * 5, headY - hh * 1.78, 4.5, 4.5, cfg.antennaColor || '#ff7ab0', null);
        break;
      case 'tuft':
        P.poly(ctx, [[headX - hw * .3, headY - hh * .88], [headX - hw * .1, headY - hh * 1.55],
          [headX + hw * .12, headY - hh * 1.0], [headX + hw * .34, headY - hh * 1.4],
          [headX + hw * .4, headY - hh * .82]], cfg.tuftColor || cfg.body2 || '#7ad17a', null, 2);
        break;
      case 'hat':
        P.ell(ctx, headX, headY - hh * .86, hw * 1.35, hh * .22, cfg.hatColor || '#d84a4a', null, 2);
        P.rr(ctx, headX - hw * .68, headY - hh * 1.62, hw * 1.36, hh * .82, 6, cfg.hatColor || '#d84a4a', null, 2);
        break;
      case 'cap':
        ctx.save();
        ctx.beginPath(); ctx.arc(headX, headY - hh * .18, hw * 1.02, Math.PI, Math.PI * 2); ctx.closePath();
        ctx.fillStyle = cfg.hatColor || '#e0483c'; ctx.fill();
        ctx.lineWidth = 2; ctx.strokeStyle = P.ink(cfg.hatColor || '#e0483c'); ctx.stroke();
        P.ell(ctx, headX - hw * .95, headY - hh * .2, hw * .62, hh * .17, cfg.hatColor || '#e0483c', null, 2);
        ctx.restore();
        break;
      case 'visor':
        P.rr(ctx, headX - hw * .95, headY - hh * .42, hw * 1.9, hh * .5, 5, cfg.visorColor || '#66e0ff', null, 2);
        ctx.save(); ctx.globalAlpha = .6;
        P.line(ctx, [[headX - hw * .7, headY - hh * .1], [headX - hw * .2, headY - hh * .36]], '#fff', 2);
        ctx.restore();
        break;
      case 'scarf':
        P.rr(ctx, headX - hw * .9, headY + hh * .72, hw * 1.8, 9, 4, cfg.scarfColor || '#e05a6a', null, 2);
        P.poly(ctx, [[headX + hw * .5, headY + hh * .8], [headX + hw * 1.5 + Math.sin(st.t * 0.08) * 5, headY + hh * 1.2],
          [headX + hw * 1.35, headY + hh * 1.7], [headX + hw * .5, headY + hh * 1.1]], cfg.scarfColor || '#e05a6a', null, 2);
        break;
      case 'cape':
        var sway = Math.sin(st.t * 0.05) * 6;
        P.poly(ctx, [[-cfg.bw * .6, -cfg.bh * 1.5], [cfg.bw * .6, -cfg.bh * 1.5],
          [cfg.bw * 1.05 + sway, -cfg.bh * .1], [0, -cfg.bh * .3], [-cfg.bw * 1.05 - sway, -cfg.bh * .1]],
          cfg.capeColor || '#5a2b6e', null, 2.5);
        break;
      case 'wings':
        var fl = Math.sin(st.t * 0.35) * 0.5;
        for (var s = -1; s <= 1; s += 2) {
          ctx.save();
          ctx.translate(s * cfg.bw * .8, -cfg.bh * 1.05);
          ctx.rotate(s * (0.5 + fl));
          P.poly(ctx, [[0, 0], [s * 26, -14], [s * 34, 4], [s * 16, 12]], cfg.wingColor || '#ffffff', null, 2);
          ctx.restore();
        }
        break;
      case 'spikes':
        for (var k = -1; k <= 1; k++) {
          P.poly(ctx, [[k * hw * .55 - 6, headY - hh * .78], [k * hw * .55, headY - hh * 1.5], [k * hw * .55 + 6, headY - hh * .78]],
            cfg.spikeColor || '#e8e4d8', null, 2);
        }
        break;
      case 'glasses':
        P.ell(ctx, headX - hw * .36, headY - hh * .06, hw * .3, hh * .26, 'rgba(210,240,255,0.55)', '#2a2030', 2);
        P.ell(ctx, headX + hw * .36, headY - hh * .06, hw * .3, hh * .26, 'rgba(210,240,255,0.55)', '#2a2030', 2);
        P.line(ctx, [[headX - hw * .08, headY - hh * .08], [headX + hw * .08, headY - hh * .08]], '#2a2030', 2);
        break;
      case 'monocle':
        P.ell(ctx, headX + hw * .38, headY - hh * .06, hw * .34, hh * .3, 'rgba(255,245,200,0.4)', '#2a2030', 2.4);
        P.line(ctx, [[headX + hw * .38, headY + hh * .24], [headX + hw * .5, headY + hh * .8]], '#2a2030', 1.6);
        break;
      case 'bow':
        P.poly(ctx, [[headX, headY - hh * .82], [headX - hw * .7, headY - hh * 1.22], [headX - hw * .66, headY - hh * .52]], cfg.bowColor || '#ff7ab0', null, 2);
        P.poly(ctx, [[headX, headY - hh * .82], [headX + hw * .7, headY - hh * 1.22], [headX + hw * .66, headY - hh * .52]], cfg.bowColor || '#ff7ab0', null, 2);
        P.ell(ctx, headX, headY - hh * .86, 5, 5, U.shade(cfg.bowColor || '#ff7ab0', -0.2), null);
        break;
      case 'flame':
        var fw = 1 + Math.sin(st.t * 0.3) * 0.16;
        P.poly(ctx, [[headX - hw * .4, headY - hh * .9], [headX, headY - hh * (1.4 + 0.5 * fw)],
          [headX + hw * .4, headY - hh * .9]], '#ff9f2e', null, 0);
        P.poly(ctx, [[headX - hw * .22, headY - hh * .95], [headX, headY - hh * (1.2 + 0.4 * fw)],
          [headX + hw * .22, headY - hh * .95]], '#ffe066', null, 0);
        break;
      case 'halo':
        P.ell(ctx, headX, headY - hh * 1.5, hw * .7, hh * .16, null, cfg.haloColor || '#ffe680', 3);
        break;
      case 'inkdrip':
        for (var q = -1; q <= 1; q++) {
          var dy = ((st.t * 0.7 + q * 23) % 34);
          P.ell(ctx, headX + q * hw * .55, headY + hh * .6 + dy, 3, 5 + dy * 0.15, cfg.inkColor || '#1b1226', null);
        }
        break;

      /* ---- plumber-hero kit: the silhouette this game is modelled on ----
         Drawn inside the head transform, so all offsets are head-relative. */
      case 'nose': {
        var nx = headX + (cfg.noseX === undefined ? .12 : cfg.noseX) * hw;
        var ny = headY + (cfg.noseY === undefined ? .3 : cfg.noseY) * hh;
        P.ell(ctx, nx, ny, hw * .3, hh * .28, cfg.nose || U.shade(cfg.head || cfg.body, -0.05), null, 2);
        P.ell(ctx, nx - hw * .09, ny - hh * .1, hw * .1, hh * .09, 'rgba(255,255,255,.5)', null);
        break;
      }
      case 'moustache': {
        var mc = cfg.hair || '#4a2d18';
        var my = headY + hh * .56, mw2 = hw * .5;
        ctx.beginPath();
        ctx.moveTo(headX - hw * .06, my - hh * .06);
        ctx.quadraticCurveTo(headX - mw2 * 1.1, my - hh * .16, headX - mw2 * 1.35, my + hh * .3);
        ctx.quadraticCurveTo(headX - mw2 * .7, my + hh * .16, headX - hw * .04, my + hh * .2);
        ctx.quadraticCurveTo(headX + mw2 * .7, my + hh * .16, headX + mw2 * 1.35, my + hh * .3);
        ctx.quadraticCurveTo(headX + mw2 * 1.1, my - hh * .16, headX + hw * .06, my - hh * .06);
        ctx.closePath();
        ctx.fillStyle = P.F(mc); ctx.fill();
        ctx.lineWidth = 2; ctx.strokeStyle = P.S(U.shade(mc, -0.4)); ctx.lineJoin = 'round'; ctx.stroke();
        break;
      }
      case 'sideburns':
        P.poly(ctx, [[headX - hw * .96, headY - hh * .1], [headX - hw * .58, headY - hh * .06],
          [headX - hw * .62, headY + hh * .5], [headX - hw * 1.0, headY + hh * .38]],
          cfg.hair || '#4a2d18', null, 1.8);
        P.poly(ctx, [[headX + hw * .96, headY - hh * .1], [headX + hw * .58, headY - hh * .06],
          [headX + hw * .62, headY + hh * .5], [headX + hw * 1.0, headY + hh * .38]],
          cfg.hair || '#4a2d18', null, 1.8);
        break;
      case 'hair':
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(headX, headY, hw, hh, 0, Math.PI, Math.PI * 2);
        ctx.closePath(); ctx.clip();
        P.ell(ctx, headX, headY - hh * .12, hw * 1.02, hh * .86, cfg.hair || '#4a2d18', null, 0);
        ctx.restore();
        break;
      /* Round-brimmed cap with a circular emblem — worn over 'hair'. */
      case 'heroCap': {
        var hc = cfg.hatColor || '#e0483c';
        var capBase = headY - hh * .30;   // sits just above the eyes
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(headX, capBase, hw * 1.04, hh * .82, 0, Math.PI, Math.PI * 2);
        ctx.closePath();
        ctx.fillStyle = P.F(hc); ctx.fill();
        ctx.lineWidth = 2.4; ctx.strokeStyle = P.S(U.shade(hc, -0.45)); ctx.stroke();
        ctx.restore();
        // short brim sweeping forward over the nose
        ctx.beginPath();
        ctx.moveTo(headX + hw * .16, capBase - hh * .04);
        ctx.quadraticCurveTo(headX + hw * 1.06, capBase - hh * .3, headX + hw * 1.24, capBase + hh * .14);
        ctx.quadraticCurveTo(headX + hw * .82, capBase + hh * .1, headX + hw * .16, capBase + hh * .12);
        ctx.closePath();
        ctx.fillStyle = P.F(hc); ctx.fill();
        ctx.lineWidth = 2.4; ctx.strokeStyle = P.S(U.shade(hc, -0.45)); ctx.stroke();
        // round emblem on the front of the cap
        P.ell(ctx, headX - hw * .1, capBase - hh * .38, hw * .38, hh * .34, cfg.emblemBg || '#fdf6e3', U.shade(hc, -0.45), 2.2);
        if (cfg.capLetter) {
          P.text(ctx, cfg.capLetter, headX - hw * .1, capBase - hh * .38 + hh * .2,
            { size: hh * .56, align: 'center', color: hc, outline: false, shadow: false });
        }
        break;
      }
    }
  }

  function features(ctx, cfg, st, A, headX, headY, hw, hh, layer) {
    var list = (layer === 'back' ? cfg.featuresBack : cfg.features) || [];
    for (var i = 0; i < list.length; i++) feature(ctx, list[i], cfg, st, A, headX, headY, hw, hh);
  }

  /* ---- archetype: biped ------------------------------------------------- */
  function drawBiped(ctx, cfg, st) {
    var A = anim(st);
    var bw = cfg.bw || 15, bh = cfg.bh || 20;      // torso half-width, half-height
    var hw = cfg.hw || 15, hh = cfg.hh || 14;      // head half-size
    var legH = cfg.legH || 14, armL = cfg.armLen || 15;
    var body = cfg.body || '#4aa3d8', limb = cfg.limb || U.shade(body, -0.16);
    var shoe = cfg.shoe || '#8a4a2a';
    var hipY = -legH;
    var torsoY = hipY - bh + A.bob * -0.4;
    var headY = torsoY - bh - hh * 0.62 + A.bob * -0.5;

    ctx.save();
    ctx.translate(0, A.yOff);
    ctx.rotate(A.rot + A.lean * 0.5);

    features(ctx, cfg, st, A, 0, headY, hw, hh, 'back');

    // legs
    for (var s = -1; s <= 1; s += 2) {
      var sw = A.swing * s * 0.55;
      ctx.save();
      ctx.translate(s * bw * 0.44, hipY);
      ctx.rotate(sw);
      P.rr(ctx, -cfg.legW / 2 || -4.5, 0, cfg.legW || 9, legH + 2, 4, cfg.legColor || limb, null, 2);
      P.ell(ctx, 0, legH + 2, (cfg.shoeW || 8), (cfg.shoeH || 5), shoe, null, 2);
      ctx.restore();
    }

    // back arm
    drawArm(ctx, cfg, st, A, -1, bw, torsoY, armL, limb);

    // torso
    ctx.save();
    ctx.scale(A.squash, A.stretch);
    if (cfg.torso === 'round') P.blob(ctx, 0, torsoY, bw * 1.05, 0.06, cfg.seed || 1, body, null, 2.4);
    else P.rr(ctx, -bw, torsoY - bh, bw * 2, bh * 2 + 3, cfg.torsoR === undefined ? 8 : cfg.torsoR, body, null, 2.4);
    if (cfg.belly) P.ell(ctx, 0, torsoY + bh * .28, bw * .62, bh * .5, cfg.belly, null, 1.8);
    if (cfg.vest) {
      P.poly(ctx, [[-bw, torsoY - bh], [-bw * .3, torsoY - bh], [-bw * .45, torsoY + bh], [-bw, torsoY + bh]], cfg.vest, null, 2);
      P.poly(ctx, [[bw, torsoY - bh], [bw * .3, torsoY - bh], [bw * .45, torsoY + bh], [bw, torsoY + bh]], cfg.vest, null, 2);
    }
    /* Dungarees: bib over the shirt, two straps, two brass buttons. The single
       most recognisable half of the plumber-hero silhouette. */
    if (cfg.overalls) {
      var oc = cfg.overalls, ok = U.shade(oc, -0.42);
      P.rr(ctx, -bw * .82, torsoY - bh * .18, bw * 1.64, bh * 1.3, 5, oc, ok, 2.2);
      for (var os = -1; os <= 1; os += 2) {
        P.rr(ctx, os * bw * .52 - bw * .13, torsoY - bh * 1.02, bw * .26, bh * .92, 2.5, oc, ok, 2);
        P.ell(ctx, os * bw * .52, torsoY - bh * .14, bw * .13, bw * .13, cfg.buttonColor || '#ffe066', ok, 1.4);
      }
      P.line(ctx, [[-bw * .5, torsoY + bh * .5], [bw * .5, torsoY + bh * .5]], ok, 1.4);
    }
    if (cfg.emblem) {
      P.star(ctx, 0, torsoY + bh * .1, bw * .38, bw * .16, 5, 0, cfg.emblem, null, 1.4);
    }
    if (cfg.buttons) for (var b = 0; b < cfg.buttons; b++) P.ell(ctx, 0, torsoY - bh * .4 + b * 9, 3, 3, cfg.buttonColor || '#ffe066', null, 1.2);
    ctx.restore();

    // head
    ctx.save();
    ctx.translate(0, headY);
    ctx.rotate(A.lean * -0.25 + (cfg.headTilt || 0));
    ctx.scale(A.squash, A.stretch);
    if (cfg.headShape === 'square') P.rr(ctx, -hw, -hh, hw * 2, hh * 2, cfg.headR === undefined ? 7 : cfg.headR, cfg.head || body, null, 2.4);
    else if (cfg.headShape === 'blob') P.blob(ctx, 0, 0, hw, 0.07, (cfg.seed || 1) + 3, cfg.head || body, null, 2.4, hh / hw);
    else P.ell(ctx, 0, 0, hw, hh, cfg.head || body, null, 2.4);
    if (cfg.snout) P.ell(ctx, hw * .5, hh * .32, hw * .42, hh * .3, U.shade(cfg.head || body, 0.14), null, 1.6);
    var ex = cfg.eyeGap === undefined ? hw * 0.42 : cfg.eyeGap;
    var ey = cfg.eyeY === undefined ? -hh * 0.12 : cfg.eyeY;
    var ew = cfg.eyeW || hw * 0.26, ehh = cfg.eyeH || hh * 0.32;
    eye(ctx, -ex, ey, ew, ehh, cfg, st, -1);
    if (cfg.eyeStyle !== 'single') eye(ctx, ex, ey, ew, ehh, cfg, st, 1);
    mouth(ctx, cfg.mouthX || 0, (cfg.mouthY === undefined ? hh * 0.5 : cfg.mouthY), cfg.mouthW || hw * 0.55, cfg, st);
    if (cfg.blush) {
      P.ell(ctx, -hw * .72, hh * .34, hw * .2, hh * .12, U.rgba(cfg.blush, .55), null);
      P.ell(ctx, hw * .72, hh * .34, hw * .2, hh * .12, U.rgba(cfg.blush, .55), null);
    }
    features(ctx, cfg, st, A, 0, 0, hw, hh, 'front');
    ctx.restore();

    // front arm
    drawArm(ctx, cfg, st, A, 1, bw, torsoY, armL, limb);

    if (cfg.held) drawHeld(ctx, cfg, st, A, bw, torsoY, armL);

    ctx.restore();
  }

  function drawArm(ctx, cfg, st, A, side, bw, torsoY, armL, limb) {
    var base = side > 0 ? A.armR : A.armL;
    var sw = base !== 0 ? base : -A.swing * side * 0.6;
    ctx.save();
    ctx.translate(side * bw * 0.92, torsoY - (cfg.bh || 20) * 0.42);
    ctx.rotate(sw + side * 0.18);
    P.rr(ctx, -(cfg.armW || 7) / 2, 0, cfg.armW || 7, armL, 3.5, limb, null, 2);
    P.ell(ctx, 0, armL + 2, cfg.handR || 5, cfg.handR || 5, cfg.hand || cfg.glove || U.shade(limb, 0.3), null, 2);
    ctx.restore();
  }

  function drawHeld(ctx, cfg, st, A, bw, torsoY, armL) {
    var h = cfg.held;
    ctx.save();
    ctx.translate(bw * 0.92, torsoY - (cfg.bh || 20) * 0.42);
    ctx.rotate((A.armR !== 0 ? A.armR : -A.swing * 0.6) + 0.18);
    ctx.translate(0, armL + 4);
    if (h === 'mallet') {
      P.rr(ctx, -2.5, -2, 5, 20, 2, '#a9713f', null, 2);
      P.rr(ctx, -11, -12, 22, 12, 3, '#d9dde3', null, 2.4);
      P.line(ctx, [[-11, -6], [11, -6]], '#8a939e', 1.6);
    } else if (h === 'staff') {
      P.rr(ctx, -2, -26, 4, 42, 2, '#8f6a3f', null, 2);
      P.star(ctx, 0, -30, 8, 3.4, 5, st.t * 0.02, cfg.staffGem || '#7fe0ff', null, 1.6);
    } else if (h === 'quill') {
      P.poly(ctx, [[0, 4], [-3, -20], [3, -22], [5, 4]], '#fdf6e3', null, 1.8);
      P.line(ctx, [[0, 4], [1, -18]], '#c8bfa8', 1.2);
    } else if (h === 'shears') {
      P.line(ctx, [[-6, 0], [6, -22]], '#cfd6de', 4);
      P.line(ctx, [[6, 0], [-6, -22]], '#cfd6de', 4);
      P.ell(ctx, -6, 2, 4, 4, null, '#7c848f', 2.4);
      P.ell(ctx, 6, 2, 4, 4, null, '#7c848f', 2.4);
    } else if (h === 'lantern') {
      P.line(ctx, [[0, -2], [0, 4]], '#6b5638', 2);
      P.rr(ctx, -7, 4, 14, 16, 4, U.rgba('#ffcc55', .9), '#8a6a2a', 2);
      P.ell(ctx, 0, 12, 4, 5, '#fff3b0', null);
    } else if (h === 'book') {
      P.rr(ctx, -9, -6, 18, 14, 2, cfg.bookColor || '#7b4fa0', null, 2);
      P.line(ctx, [[0, -6], [0, 8]], '#f6efd8', 2);
    } else if (h === 'wrench') {
      P.rr(ctx, -2, -4, 4, 20, 2, '#b9c1cb', null, 2);
      P.poly(ctx, [[-6, -6], [6, -6], [4, 2], [-4, 2]], '#b9c1cb', null, 2);
    } else if (h === 'flag') {
      P.rr(ctx, -1.5, -30, 3, 44, 1.5, '#8f6a3f', null, 1.6);
      P.poly(ctx, [[1.5, -30], [22 + Math.sin(st.t * .08) * 3, -25], [1.5, -14]], cfg.flagColor || '#e05a6a', null, 2);
    }
    ctx.restore();
  }

  /* ---- archetype: blob (legs-only creatures) ---------------------------- */
  function drawBlob(ctx, cfg, st) {
    var A = anim(st);
    var r = cfg.r || 20, sy = cfg.squashY === undefined ? 0.92 : cfg.squashY;
    var body = cfg.body || '#a4703c';
    var footY = -(cfg.footH || 6);
    var cy = footY - r * sy + A.bob * -0.5;

    ctx.save();
    ctx.translate(0, A.yOff);
    ctx.rotate(A.rot);

    features(ctx, cfg, st, A, 0, cy, r, r * sy, 'back');

    // feet
    for (var s = -1; s <= 1; s += 2) {
      var off = A.swing * s * 3.2;
      P.ell(ctx, s * r * 0.44 + off, footY + 2, cfg.footW || 8, cfg.footH || 6, cfg.foot || U.shade(body, -0.3), null, 2);
    }

    ctx.save();
    ctx.scale(A.squash, A.stretch);
    P.blob(ctx, 0, cy, r, cfg.wob === undefined ? 0.05 : cfg.wob, cfg.seed || 2, body, null, 2.6, sy);
    if (cfg.cap) {
      ctx.save();
      ctx.beginPath(); ctx.ellipse(0, cy, r * 1.02, r * sy * 1.02, 0, Math.PI, Math.PI * 2); ctx.closePath();
      ctx.clip();
      P.blob(ctx, 0, cy, r * 1.02, 0.05, cfg.seed || 2, cfg.cap, null, 0, sy);
      ctx.restore();
      P.line(ctx, [[-r * .95, cy], [r * .95, cy]], P.ink(body), 2);
    }
    if (cfg.belly) P.ell(ctx, 0, cy + r * sy * .34, r * .56, r * sy * .38, cfg.belly, null, 1.8);
    if (cfg.stripes) {
      ctx.save();
      ctx.beginPath(); ctx.ellipse(0, cy, r, r * sy, 0, 0, Math.PI * 2); ctx.clip();
      for (var i = -3; i <= 3; i++) P.line(ctx, [[i * 11 - 6, cy - r], [i * 11 + 6, cy + r]], U.rgba(cfg.stripes, .5), 5);
      ctx.restore();
    }
    var ex = cfg.eyeGap === undefined ? r * 0.36 : cfg.eyeGap;
    var ey = cy + (cfg.eyeY === undefined ? -r * sy * 0.18 : cfg.eyeY);
    eye(ctx, -ex, ey, cfg.eyeW || r * 0.24, cfg.eyeH || r * 0.28, cfg, st, -1);
    if (cfg.eyeStyle !== 'single') eye(ctx, ex, ey, cfg.eyeW || r * 0.24, cfg.eyeH || r * 0.28, cfg, st, 1);
    mouth(ctx, 0, cy + (cfg.mouthY === undefined ? r * sy * 0.42 : cfg.mouthY), cfg.mouthW || r * 0.5, cfg, st);
    if (cfg.blush) {
      P.ell(ctx, -r * .66, cy + r * sy * .26, r * .16, r * .1, U.rgba(cfg.blush, .5), null);
      P.ell(ctx, r * .66, cy + r * sy * .26, r * .16, r * .1, U.rgba(cfg.blush, .5), null);
    }
    ctx.restore();

    if (cfg.arms) {
      for (var q = -1; q <= 1; q += 2) {
        ctx.save();
        ctx.translate(q * r * 0.92, cy + r * sy * 0.1);
        ctx.rotate(q * (0.5 + A.swing * 0.3) + (q > 0 ? A.armR : A.armL));
        P.rr(ctx, -3, 0, 6, cfg.armLen || 12, 3, cfg.limb || U.shade(body, -0.2), null, 2);
        P.ell(ctx, 0, (cfg.armLen || 12) + 2, 4.5, 4.5, cfg.hand || U.shade(body, 0.2), null, 2);
        ctx.restore();
      }
    }
    features(ctx, cfg, st, A, 0, cy, r, r * sy, 'front');
    ctx.restore();
  }

  /* ---- archetype: floater ----------------------------------------------- */
  function drawFloater(ctx, cfg, st) {
    var A = anim(st);
    var r = cfg.r || 18;
    var hover = -(cfg.hover || 34) + Math.sin((st.t || 0) * 0.06) * 4 + A.bob * -0.4;
    var body = cfg.body || '#c8a2e8';

    ctx.save();
    ctx.translate(0, hover + A.yOff);
    ctx.rotate(A.rot + Math.sin((st.t || 0) * 0.04) * 0.05);

    if (cfg.trail) {
      for (var i = 3; i >= 1; i--) {
        ctx.globalAlpha = 0.12 * i / 3;
        P.blob(ctx, 0, i * 5, r * (1 - i * .12), 0.06, cfg.seed || 5, body, null, 0, cfg.squashY || 1);
      }
      ctx.globalAlpha = 1;
    }

    features(ctx, cfg, st, A, 0, 0, r, r * (cfg.squashY || 1), 'back');

    if (cfg.wingStyle === 'bat' || cfg.wingStyle === 'feather' || cfg.wingStyle === 'fly') {
      var flap = Math.sin((st.t || 0) * (cfg.flapSpeed || 0.36));
      for (var s = -1; s <= 1; s += 2) {
        ctx.save();
        ctx.translate(s * r * 0.7, -r * 0.15);
        ctx.rotate(s * (0.25 + flap * 0.6));
        if (cfg.wingStyle === 'bat') {
          P.poly(ctx, [[0, 0], [s * 26, -12], [s * 20, -2], [s * 28, 4], [s * 18, 6], [s * 22, 14], [s * 6, 10]], cfg.wingColor || '#6b4d8f', null, 2);
        } else if (cfg.wingStyle === 'fly') {
          P.ell(ctx, s * 15, -4, 15, 6, U.rgba(cfg.wingColor || '#dff2ff', .72), P.ink(body), 1.4, s * 0.25);
        } else {
          P.poly(ctx, [[0, 0], [s * 24, -16], [s * 32, 2], [s * 14, 12]], cfg.wingColor || '#fff8e8', null, 2);
        }
        ctx.restore();
      }
    }

    ctx.save();
    ctx.scale(A.squash, A.stretch);
    if (cfg.shape === 'square') P.rr(ctx, -r, -r * (cfg.squashY || 1), r * 2, r * 2 * (cfg.squashY || 1), cfg.headR || 6, body, null, 2.4);
    else if (cfg.shape === 'diamond') P.poly(ctx, [[0, -r * 1.2], [r, 0], [0, r * 1.2], [-r, 0]], body, null, 2.4);
    else P.blob(ctx, 0, 0, r, cfg.wob === undefined ? 0.05 : cfg.wob, cfg.seed || 5, body, null, 2.4, cfg.squashY || 1);
    var ex = cfg.eyeGap === undefined ? r * 0.36 : cfg.eyeGap;
    eye(ctx, -ex, (cfg.eyeY || -r * 0.1), cfg.eyeW || r * 0.26, cfg.eyeH || r * 0.3, cfg, st, -1);
    if (cfg.eyeStyle !== 'single') eye(ctx, ex, (cfg.eyeY || -r * 0.1), cfg.eyeW || r * 0.26, cfg.eyeH || r * 0.3, cfg, st, 1);
    mouth(ctx, 0, (cfg.mouthY === undefined ? r * 0.45 : cfg.mouthY), cfg.mouthW || r * 0.5, cfg, st);
    ctx.restore();

    if (cfg.tail) {
      var tw = Math.sin((st.t || 0) * 0.09) * 8;
      P.line(ctx, [[0, r * .8], [tw * .5, r * 1.5], [tw, r * 2.2]], cfg.tailColor || U.shade(body, -0.2), 4);
      P.ell(ctx, tw, r * 2.4, 5, 5, cfg.tailColor || U.shade(body, -0.2), null, 1.6);
    }
    features(ctx, cfg, st, A, 0, 0, r, r * (cfg.squashY || 1), 'front');
    ctx.restore();

    // tether shadow marker so floaters still read as grounded
    if (cfg.marker !== false) {
      ctx.save(); ctx.globalAlpha = 0.16;
      P.ell(ctx, 0, -3, r * 0.5, r * 0.16, '#1c1230', null);
      ctx.restore();
    }
  }

  /* ---- archetype: object (animated inanimate things) -------------------- */
  function drawObject(ctx, cfg, st) {
    var A = anim(st);
    var w = cfg.w || 30, h = cfg.h || 40;
    ctx.save();
    ctx.translate(0, A.yOff - (cfg.lift || 0));
    ctx.rotate(A.rot + (cfg.tilt || 0));
    ctx.scale(A.squash, A.stretch);
    if (cfg.custom) cfg.custom(ctx, cfg, st, A, P, U);
    else P.rr(ctx, -w / 2, -h, w, h, cfg.r || 5, cfg.body || '#c8b48a', null, 2.4);
    if (cfg.face !== false) {
      var ex = cfg.eyeGap === undefined ? w * 0.22 : cfg.eyeGap;
      var ey = cfg.eyeY === undefined ? -h * 0.62 : cfg.eyeY;
      eye(ctx, -ex, ey, cfg.eyeW || w * 0.13, cfg.eyeH || h * 0.1, cfg, st, -1);
      if (cfg.eyeStyle !== 'single') eye(ctx, ex, ey, cfg.eyeW || w * 0.13, cfg.eyeH || h * 0.1, cfg, st, 1);
      mouth(ctx, 0, cfg.mouthY === undefined ? -h * 0.42 : cfg.mouthY, cfg.mouthW || w * 0.3, cfg, st);
    }
    ctx.restore();
  }

  /* ---- archetype: serpent (segmented) ----------------------------------- */
  function drawSerpent(ctx, cfg, st) {
    var A = anim(st);
    var n = cfg.segments || 6, r0 = cfg.r || 18;
    var body = cfg.body || '#5fbf7a';
    var t = st.t || 0;
    ctx.save();
    ctx.translate(0, A.yOff);
    for (var i = n - 1; i >= 0; i--) {
      var p = i / (n - 1);
      var sx = -i * (cfg.gap || 20) * (cfg.dir || 1);
      var sy = -(cfg.hover || 40) + Math.sin(t * 0.07 - i * 0.55) * (cfg.wave || 12) - p * (cfg.rise || 0);
      var rr2 = r0 * (1 - p * (cfg.taper === undefined ? 0.45 : cfg.taper));
      P.blob(ctx, sx, sy, rr2, 0.04, (cfg.seed || 7) + i, i === 0 ? (cfg.head || body) : body, null, 2.4, cfg.squashY || 1);
      if (cfg.fins && i > 0 && i % 2 === 1) {
        P.poly(ctx, [[sx, sy - rr2], [sx - 6, sy - rr2 - 12], [sx + 8, sy - rr2 - 4]], cfg.finColor || U.shade(body, -0.25), null, 2);
      }
      if (i === 0) {
        var ex = rr2 * 0.34;
        eye(ctx, -ex, sy - rr2 * 0.18, rr2 * 0.24, rr2 * 0.28, cfg, st, -1);
        eye(ctx, ex, sy - rr2 * 0.18, rr2 * 0.24, rr2 * 0.28, cfg, st, 1);
        mouth(ctx, 0, sy + rr2 * 0.44, rr2 * 0.55, cfg, st);
        features(ctx, cfg, st, A, 0, sy, rr2, rr2, 'front');
      }
    }
    ctx.restore();
  }

  /* ---- archetype: mech --------------------------------------------------- */
  function drawMech(ctx, cfg, st) {
    var A = anim(st);
    var bw = cfg.bw || 24, bh = cfg.bh || 26, legH = cfg.legH || 16;
    var body = cfg.body || '#8e97a6', trim = cfg.trim || '#f0a63c';
    var torsoY = -legH - bh + A.bob * -0.3;
    ctx.save();
    ctx.translate(0, A.yOff);
    ctx.rotate(A.rot);
    features(ctx, cfg, st, A, 0, torsoY - bh, bw * .7, bh * .5, 'back');
    // legs
    for (var s = -1; s <= 1; s += 2) {
      ctx.save();
      ctx.translate(s * bw * 0.5, -legH);
      ctx.rotate(A.swing * s * 0.35);
      P.rr(ctx, -6, 0, 12, legH + 3, 3, U.shade(body, -0.2), null, 2.2);
      P.rr(ctx, -9, legH, 18, 6, 2, U.shade(body, -0.35), null, 2);
      ctx.restore();
    }
    // arms
    for (var q = -1; q <= 1; q += 2) {
      ctx.save();
      ctx.translate(q * bw * 1.0, torsoY - bh * 0.3);
      ctx.rotate(q * 0.2 + (q > 0 ? A.armR : A.armL) - A.swing * q * 0.35);
      P.rr(ctx, -5, 0, 10, cfg.armLen || 18, 3, U.shade(body, -0.12), null, 2.2);
      if (cfg.claw) P.poly(ctx, [[-7, (cfg.armLen || 18)], [7, (cfg.armLen || 18)], [4, (cfg.armLen || 18) + 11], [-4, (cfg.armLen || 18) + 11]], trim, null, 2);
      else P.ell(ctx, 0, (cfg.armLen || 18) + 3, 6, 6, trim, null, 2);
      ctx.restore();
    }
    // chassis
    ctx.save(); ctx.scale(A.squash, A.stretch);
    P.rr(ctx, -bw, torsoY - bh, bw * 2, bh * 2, cfg.r || 6, body, null, 2.6);
    P.rr(ctx, -bw * .62, torsoY - bh * .5, bw * 1.24, bh * .9, 4, U.shade(body, -0.22), null, 2);
    for (var b = -1; b <= 1; b++) P.ell(ctx, b * bw * .4, torsoY + bh * .55, 3, 3, trim, null, 1.4);
    if (cfg.gauge) {
      P.ell(ctx, 0, torsoY - bh * .05, bw * .3, bh * .28, '#f6efd8', '#2a2030', 2);
      P.line(ctx, [[0, torsoY - bh * .05], [Math.cos(st.t * .07) * bw * .2, torsoY - bh * .05 + Math.sin(st.t * .07) * bh * .16]], '#c8443c', 2);
    }
    // head
    var hy = torsoY - bh - (cfg.hh || 12);
    P.rr(ctx, -(cfg.hw || 14), hy - (cfg.hh || 12), (cfg.hw || 14) * 2, (cfg.hh || 12) * 2, cfg.headR || 5, cfg.head || U.shade(body, 0.1), null, 2.4);
    var ex2 = cfg.eyeGap === undefined ? (cfg.hw || 14) * 0.42 : cfg.eyeGap;
    eye(ctx, -ex2, hy, cfg.eyeW || 4.5, cfg.eyeH || 4.5, cfg, st, -1);
    if (cfg.eyeStyle !== 'single') eye(ctx, ex2, hy, cfg.eyeW || 4.5, cfg.eyeH || 4.5, cfg, st, 1);
    mouth(ctx, 0, hy + (cfg.hh || 12) * .55, (cfg.hw || 14) * .5, cfg, st);
    features(ctx, cfg, st, A, 0, hy, cfg.hw || 14, cfg.hh || 12, 'front');
    ctx.restore();
    ctx.restore();
  }

  /* ---- archetype: beast (quadruped) -------------------------------------- */
  function drawBeast(ctx, cfg, st) {
    var A = anim(st);
    var bw = cfg.bw || 30, bh = cfg.bh || 17, legH = cfg.legH || 14;
    var body = cfg.body || '#b06a3a';
    var torsoY = -legH - bh + A.bob * -0.4;
    ctx.save();
    ctx.translate(0, A.yOff); ctx.rotate(A.rot);
    for (var i = 0; i < 4; i++) {
      var s = i < 2 ? -1 : 1;
      var xo = (i % 2 ? bw * .62 : -bw * .58) + (i < 2 ? -3 : 3);
      ctx.save();
      ctx.translate(xo, -legH);
      ctx.rotate(A.swing * (i % 2 ? 1 : -1) * 0.4);
      P.rr(ctx, -4.5, 0, 9, legH + 3, 3.5, i < 2 ? U.shade(body, -0.2) : U.shade(body, -0.1), null, 2);
      P.ell(ctx, 0, legH + 3, 6.5, 4.5, cfg.paw || U.shade(body, -0.35), null, 2);
      ctx.restore();
    }
    if (cfg.tail) {
      var tw = Math.sin(st.t * 0.08) * 10;
      P.line(ctx, [[-bw * .95, torsoY], [-bw * 1.3, torsoY - 8 + tw * .3], [-bw * 1.5, torsoY - 18 + tw]], cfg.tailColor || U.shade(body, -0.15), 6);
    }
    ctx.save(); ctx.scale(A.squash, A.stretch);
    P.blob(ctx, 0, torsoY, bw, 0.05, cfg.seed || 9, body, null, 2.6, bh / bw);
    if (cfg.mane) P.blob(ctx, bw * .55, torsoY - bh * .1, bw * .48, 0.14, (cfg.seed || 9) + 2, cfg.mane, null, 2.2, 1);
    var hx = bw * .78, hy = torsoY - bh * .8;
    P.blob(ctx, hx, hy, cfg.hw || 15, 0.06, (cfg.seed || 9) + 4, cfg.head || body, null, 2.4, (cfg.hh || 13) / (cfg.hw || 15));
    if (cfg.snout) P.ell(ctx, hx + (cfg.hw || 15) * .62, hy + (cfg.hh || 13) * .3, (cfg.hw || 15) * .38, (cfg.hh || 13) * .3, U.shade(cfg.head || body, .14), null, 1.8);
    eye(ctx, hx - (cfg.hw || 15) * .18, hy - (cfg.hh || 13) * .2, 4, 4.5, cfg, st, -1);
    eye(ctx, hx + (cfg.hw || 15) * .38, hy - (cfg.hh || 13) * .2, 4, 4.5, cfg, st, 1);
    mouth(ctx, hx + (cfg.hw || 15) * .4, hy + (cfg.hh || 13) * .48, (cfg.hw || 15) * .45, cfg, st);
    features(ctx, cfg, st, A, hx, hy, cfg.hw || 15, cfg.hh || 13, 'front');
    ctx.restore();
    ctx.restore();
  }

  var ARCH = {
    biped: drawBiped, blob: drawBlob, floater: drawFloater,
    object: drawObject, serpent: drawSerpent, mech: drawMech, beast: drawBeast
  };

  /* ---- public draw ------------------------------------------------------- */
  /* st: {t, anim, flip, flipT, scale, alpha, tint, tintAmt, squashX, squashY,
          blink, look, talking, dead} */
  function drawRaw(ctx, id, st) {
    var cfg = get(id);
    if (!cfg) return;
    var fn = ARCH[cfg.arch] || drawBiped;
    fn(ctx, cfg, st);
    if (cfg.overlay) cfg.overlay(ctx, cfg, st, P, U);
  }

  function height(id) {
    var c = get(id); if (!c) return 40;
    if (c.height) return c.height;
    if (c.arch === 'blob') return (c.r || 20) * 2 * (c.squashY === undefined ? .92 : c.squashY) + (c.footH || 6);
    if (c.arch === 'floater') return (c.hover || 34) + (c.r || 18);
    if (c.arch === 'object') return c.h || 40;
    if (c.arch === 'mech') return (c.legH || 16) + (c.bh || 26) * 2 + (c.hh || 12) * 2;
    if (c.arch === 'beast') return (c.legH || 14) + (c.bh || 17) * 2 + (c.hh || 13);
    if (c.arch === 'serpent') return (c.hover || 40) + (c.r || 18);
    return (c.legH || 14) + (c.bh || 20) * 2 + (c.hh || 14) * 2 + 4;
  }
  function widthOf(id) {
    var c = get(id); if (!c) return 30;
    if (c.width) return c.width;
    if (c.arch === 'blob' || c.arch === 'floater') return (c.r || 20) * 2.1;
    if (c.arch === 'object') return c.w || 30;
    if (c.arch === 'beast') return (c.bw || 30) * 2.2;
    return (c.bw || 15) * 2.4;
  }

  /* Full draw: contact shadow, paper-turn flip, drop shadow, tint flash. */
  function draw(ctx, id, x, y, st) {
    st = st || {};
    var cfg = get(id); if (!cfg) return;
    var sc = (st.scale === undefined ? 1 : st.scale) * (cfg.scale || 1);
    var fs = st.flipT !== undefined ? P.flipScale(st.flipT) : (st.flip === -1 ? -1 : 1);
    ctx.save();
    if (st.alpha !== undefined) ctx.globalAlpha *= st.alpha;

    if (st.shadow !== false) {
      var hgt = height(id) * sc;
      var sw = widthOf(id) * sc * 0.42 * Math.max(0.3, Math.abs(fs));
      P.groundShadow(ctx, x + (st.shadowDX || 0), y + 2, sw, sw * 0.34, st.shadowAlpha === undefined ? 0.3 : st.shadowAlpha);
    }

    ctx.translate(x, y - (st.lift || 0));
    ctx.scale(sc * fs * (st.squashX || 1), sc * (st.squashY || 1));
    if (st.rot) ctx.rotate(st.rot * (fs < 0 ? -1 : 1));

    // lifted paper drop shadow
    if (st.dropShadow !== false) {
      ctx.save();
      ctx.translate(3.2, 3.2);
      P.silhouette('rgba(30,18,48,0.24)');
      drawRaw(ctx, id, st);
      P.clearMode();
      ctx.restore();
    }

    if (st.tint && st.tintAmt > 0) {
      drawRaw(ctx, id, st);
      ctx.save();
      ctx.globalAlpha = st.tintAmt;
      P.silhouette(st.tint);
      drawRaw(ctx, id, st);
      P.clearMode();
      ctx.restore();
    } else {
      drawRaw(ctx, id, st);
    }
    ctx.restore();
  }

  /* Icon-sized portrait used in menus and dialogue frames. */
  function portrait(ctx, id, x, y, size, st) {
    st = st || {};
    var h = height(id) || 50;
    var sc = size / h;
    ctx.save();
    ctx.beginPath(); ctx.rect(x - size * .62, y - size, size * 1.24, size * 1.06); ctx.clip();
    draw(ctx, id, x, y, { t: st.t || 0, anim: st.anim || 'idle', scale: sc, shadow: false, dropShadow: false, blink: st.blink, talking: st.talking });
    ctx.restore();
  }

  define('unknown', { arch: 'blob', r: 16, body: '#b0a8c0', eyeStyle: 'round', mouth: 'flat' });

  return {
    define: define, get: get, has: has, all: all,
    draw: draw, drawRaw: drawRaw, portrait: portrait,
    height: height, width: widthOf, anim: anim, eye: eye, mouth: mouth
  };
})();

/* ===== 05_cast.js ===== */
/* ==========================================================================
   PAPERBOUND — 05_cast.js
   The whole roster: hero, partners, townsfolk, 44 rank-and-file enemies,
   16 mini-bosses & chapter bosses, and the superbosses.
   Every entry is an archetype config from 04_sprites.js.
   ========================================================================== */
'use strict';

(function () {
  var S = PB.Sprites, def = S.define, P = PB.Paper, U = PB.U;

  /* Shared palette so the world reads as one printed set. */
  var C = PB.PALETTE = {
    paper: '#f7edd6', paperDeep: '#e6d7b4', card: '#fdf6e3',
    ink: '#2a1c3c', inkSoft: '#4a3a5c',
    red: '#e0483c', rose: '#f07a8a', orange: '#f28c33', gold: '#f5c02e',
    lime: '#8fcf52', green: '#4fae62', teal: '#39b3a6', sky: '#57b8ea',
    blue: '#3f76c9', indigo: '#5a4fb0', violet: '#8a5fc0', plum: '#6b3f7a',
    brown: '#a9713f', bark: '#7a5230', stone: '#9aa3b0', steel: '#6f7a8c',
    snow: '#eaf4ff', ice: '#9fd8f0', flame: '#ff7a2e', ember: '#ffb545',
    blot: '#3a2a4a', blotDeep: '#1c1226', void_: '#f2f0ff'
  };

  /* ======================================================================
     HERO + PARTNERS
     ====================================================================== */

  /* The hero. Built to read at a glance as the plumber-hero silhouette this
     whole game is modelled on: red cap and shirt, blue dungarees, white
     gloves, brown boots, big nose, big moustache, and a paper-thin body that
     turns edge-on when he changes direction. */
  def('pip', {
    arch: 'biped', seed: 1,
    bw: 14, bh: 16, hw: 16, hh: 15, legH: 13, armLen: 14, legW: 9, armW: 7,
    body: '#e0483c',                 // shirt
    overalls: '#3f6ac9',             // dungarees
    legColor: '#3f6ac9',
    limb: '#f0c49a',                 // bare arms
    head: '#f5cda4',
    hand: '#fdf9f0',                 // white gloves
    handR: 6,
    shoe: '#8a4a20', shoeW: 10, shoeH: 6,
    hair: '#4a2d18',
    hatColor: '#e0483c', emblemBg: '#fdf9f0', capLetter: 'P',
    buttonColor: '#ffe066',
    torsoR: 7,
    eyeStyle: 'oval', eyeGap: 5.6, eyeW: 3.6, eyeH: 4.4, eyeY: 1.5,
    eyePupil: '#2f4a8a',
    mouth: 'smile', mouthY: 13, mouthW: 8,
    noseX: .1, noseY: .36,
    features: ['hair', 'heroCap', 'nose', 'moustache']
  });
  /* Capless variant used in a couple of cutscenes. */
  def('pip_plain', U.extend(U.clone(S.get('pip')), { features: ['hair', 'nose', 'moustache'] }));

  def('twigby', {
    arch: 'blob', seed: 2, r: 17, squashY: 0.94, footH: 5, footW: 7,
    body: '#b07a42', cap: '#8a5a30', foot: '#6d4726', belly: '#d8a86a',
    eyeStyle: 'round', eyeGap: 6.4, eyeW: 4.4, eyeH: 5.2, mouth: 'smile',
    blush: '#e0906a', arms: true, armLen: 10, limb: '#96632f',
    features: ['tuft'], tuftColor: '#6fbb52'
  });

  def('lumen', {
    arch: 'floater', seed: 3, r: 15, hover: 34, squashY: 1.18, trail: true,
    body: '#ffd066', wingStyle: null,
    eyeStyle: 'oval', eyeGap: 5.6, eyeW: 3.6, eyeH: 4, mouth: 'smile', mouthY: 8,
    eyePupil: '#6b4a12',
    overlay: function (ctx, cfg, st, P, U) {
      var hv = -34 + Math.sin((st.t || 0) * 0.06) * 4;
      ctx.save();
      ctx.globalAlpha = 0.22 + Math.sin((st.t || 0) * 0.09) * 0.06;
      P.ell(ctx, 0, hv, 30, 34, '#ffe9a8', null);
      ctx.restore();
      P.line(ctx, [[0, hv - 17], [0, hv - 25]], '#8a6a2a', 2);
      P.ell(ctx, 0, hv - 27, 4, 3, '#c8a06a', null, 1.4);
    }
  });

  def('bloop', {
    arch: 'blob', seed: 4, r: 18, squashY: 0.82, footH: 5, footW: 9,
    body: '#4fbce0', cap: '#2f96bd', foot: '#2a7a99', belly: '#bdefff',
    eyeStyle: 'round', eyeGap: 7, eyeW: 4.6, eyeH: 5.4, mouth: 'wave', mouthW: 12,
    arms: true, armLen: 9, limb: '#3fa6cc',
    overlay: function (ctx, cfg, st, P) {
      // folded prow, so the origami-boat form reads even on land
      P.poly(ctx, [[-19, -20], [0, -30], [19, -20]], '#eaf8ff', null, 2);
    }
  });

  def('snip', {
    arch: 'biped', seed: 5,
    bw: 11, bh: 14, hw: 13, hh: 12, legH: 15, armLen: 15, legW: 6, armW: 5.5,
    body: '#d8455c', limb: '#f0e2c8', head: '#f7ecd8', shoe: '#3a2a4a',
    torsoR: 6, eyeStyle: 'oval', eyeGap: 5.4, eyeW: 3.6, eyeH: 4.4,
    mouth: 'smirk', mouthY: 6, held: 'shears',
    features: ['tuft'], tuftColor: '#f5c02e', buttons: 2, buttonColor: '#ffe37a'
  });

  def('margo', {
    arch: 'biped', seed: 6,
    bw: 10, bh: 21, hw: 12, hh: 13, legH: 12, armLen: 14, legW: 6, armW: 5,
    body: '#7b4fa0', limb: '#e8dcc4', head: '#f4e8d2', shoe: '#4a3560',
    torsoR: 4, eyeStyle: 'oval', eyeGap: 5, eyeW: 3.4, eyeH: 4.2,
    mouth: 'flat', mouthY: 6, held: 'book', bookColor: '#3f76c9',
    features: ['glasses'],
    overlay: function (ctx, cfg, st, P) {
      // tassel of a bookmark
      P.line(ctx, [[0, -68], [0, -78]], '#f5c02e', 2.4);
      P.ell(ctx, 0, -80, 3.6, 3.6, '#f5c02e', null, 1.4);
    }
  });

  def('volt', {
    arch: 'mech', seed: 7,
    bw: 15, bh: 15, hw: 11, hh: 9, legH: 11, armLen: 12, r: 5,
    body: '#c9ced8', trim: '#f5c02e', head: '#e3e8f0', gauge: true,
    eyeStyle: 'goggle', eyeGap: 5, eyeW: 3.4, eyeH: 3.4, detail: '#66e0ff',
    mouth: 'flat', held: null, features: ['antenna'], antennaColor: '#66e0ff'
  });

  /* ======================================================================
     TOWNSFOLK / NPCS
     ====================================================================== */
  function folk(id, o) {
    return def(id, U.extend({
      arch: 'blob', r: 17, squashY: .95, footH: 5, arms: true, armLen: 10,
      eyeStyle: 'round', eyeGap: 6.2, eyeW: 4, eyeH: 4.8, mouth: 'smile', seed: 11
    }, o));
  }
  folk('villager_a', { body: '#e8b96a', cap: '#c8964a', blush: '#e08a6a' });
  folk('villager_b', { body: '#9fd0e8', cap: '#6fb0cc', mouth: 'grin' });
  folk('villager_c', { body: '#d8a0c8', cap: '#b878a8', eyeStyle: 'happy' });
  folk('villager_d', { body: '#a8d8a0', cap: '#78b070', mouth: 'flat' });
  folk('elder_quill', {
    arch: 'biped', bw: 11, bh: 15, hw: 14, hh: 13, legH: 10, armLen: 13,
    body: '#cfc2e0', head: '#f2e6cc', limb: '#e6dac2', shoe: '#6b5a80',
    eyeStyle: 'sleepy', mouth: 'flat', features: ['glasses'], held: 'staff', staffGem: '#c8a0f0', seed: 12
  });
  folk('mayor_folio', {
    arch: 'biped', bw: 15, bh: 17, hw: 16, hh: 14, legH: 10, armLen: 13,
    body: '#5a7fc0', head: '#f4e2c4', limb: '#e6d6bc', shoe: '#2f4a70',
    eyeStyle: 'round', mouth: 'grin', features: ['hat'], hatColor: '#2f4a70', buttons: 3, seed: 13
  });
  folk('shopkeep_ream', {
    arch: 'blob', r: 19, body: '#f0a63c', cap: '#c87e26', arms: true,
    eyeStyle: 'happy', mouth: 'grin', blush: '#e07a4a', seed: 14
  });
  folk('smith_deckle', {
    arch: 'biped', bw: 17, bh: 17, hw: 15, hh: 13, legH: 11, armLen: 14,
    body: '#8a6a4a', head: '#e0b088', limb: '#c8956a', shoe: '#4a3020',
    eyeStyle: 'angry', mouth: 'grin', held: 'mallet', seed: 15
  });
  folk('chef_pulp', {
    arch: 'blob', r: 18, body: '#f2e6cc', cap: '#ffffff', arms: true,
    eyeStyle: 'happy', mouth: 'smile', seed: 16, features: ['hat'], hatColor: '#ffffff'
  });
  folk('badgesmith_foil', {
    arch: 'floater', r: 15, hover: 30, body: '#c8a2e8', wingStyle: 'feather',
    wingColor: '#f0e4ff', eyeStyle: 'star', mouth: 'smile', seed: 17
  });
  folk('sage_vellum', {
    arch: 'floater', r: 17, hover: 40, body: '#f4f0e0', trail: true,
    eyeStyle: 'oval', mouth: 'flat', seed: 18, features: ['halo'], haloColor: '#ffe680'
  });
  folk('courier_nib', {
    arch: 'biped', bw: 10, bh: 15, hw: 12, hh: 12, legH: 14, armLen: 14,
    body: '#3a2a4a', head: '#d8cce8', limb: '#5a4a6a', shoe: '#1c1226',
    eyeStyle: 'oval', mouth: 'smirk', held: 'quill', seed: 19, features: ['scarf'], scarfColor: '#8a5fc0'
  });
  folk('barker_tilt', {
    arch: 'biped', bw: 13, bh: 16, hw: 14, hh: 13, legH: 12, armLen: 14,
    body: '#d8455c', head: '#f7ecd8', limb: '#e8d8bc', shoe: '#3a2a4a',
    eyeStyle: 'round', mouth: 'grin', features: ['hat'], hatColor: '#3a2a4a', seed: 20
  });
  folk('miner_grit', {
    arch: 'blob', r: 18, body: '#a08a6a', cap: '#f5c02e', arms: true,
    eyeStyle: 'round', mouth: 'flat', seed: 21
  });
  folk('sailor_keel', {
    arch: 'biped', bw: 13, bh: 15, hw: 14, hh: 12, legH: 12, armLen: 13,
    body: '#4f8fc0', head: '#e8c8a0', limb: '#d8b890', shoe: '#2a3a50',
    eyeStyle: 'round', mouth: 'grin', features: ['cap'], hatColor: '#f7f2e4', seed: 22
  });
  folk('scholar_ibis', {
    arch: 'biped', bw: 10, bh: 19, hw: 12, hh: 12, legH: 12, armLen: 13,
    body: '#4f7a5c', head: '#f0e2c8', limb: '#dccdb0', shoe: '#2f4a38',
    eyeStyle: 'oval', mouth: 'flat', features: ['monocle'], held: 'book', bookColor: '#7b4fa0', seed: 23
  });
  folk('guard_gild', {
    arch: 'mech', bw: 16, bh: 16, hw: 12, hh: 10, legH: 12, armLen: 14,
    body: '#c8b06a', trim: '#8a6a2a', eyeStyle: 'dot', mouth: 'none', claw: false, seed: 24
  });
  folk('kid_dot', { arch: 'blob', r: 12, body: '#f0d060', cap: '#d8a83c', arms: true, armLen: 7, eyeStyle: 'happy', mouth: 'grin', blush: '#e08a6a', seed: 25 });
  folk('kid_dash', { arch: 'blob', r: 12, body: '#8fd0f0', cap: '#5aa8cc', arms: true, armLen: 7, eyeStyle: 'round', mouth: 'smile', seed: 26 });
  folk('grandma_creased', {
    arch: 'blob', r: 17, body: '#d8c8e0', cap: '#b0a0c0', arms: true,
    eyeStyle: 'sleepy', mouth: 'smile', seed: 27, features: ['glasses']
  });
  folk('bard_octavo', {
    arch: 'biped', bw: 12, bh: 15, hw: 13, hh: 12, legH: 12, armLen: 13,
    body: '#5a4fb0', head: '#f2e0c4', limb: '#e0cdb0', shoe: '#3a2f70',
    eyeStyle: 'happy', mouth: 'grin', features: ['tuft'], tuftColor: '#f5c02e', seed: 28
  });
  folk('ferrier_stamp', {
    arch: 'blob', r: 19, body: '#7fae7f', cap: '#5a8a5a', arms: true,
    eyeStyle: 'round', mouth: 'flat', seed: 29
  });
  folk('archivist_marge', {
    arch: 'biped', bw: 11, bh: 17, hw: 13, hh: 12, legH: 11, armLen: 13,
    body: '#a0526a', head: '#f2e2ca', limb: '#e0cdb0', shoe: '#5a2f3a',
    eyeStyle: 'oval', mouth: 'flat', features: ['glasses'], held: 'book', bookColor: '#4f7a5c', seed: 30
  });

  /* ======================================================================
     ENEMIES — Chapter 1 : Creasewood
     ====================================================================== */
  def('snapleaf', {
    arch: 'blob', seed: 31, r: 16, squashY: .8, footH: 4, footW: 6,
    body: '#6fbb52', cap: '#4f9a38', foot: '#3a6a28', belly: '#a8dc8a',
    eyeStyle: 'angry', eyeGap: 6, mouth: 'fang', mouthW: 10, mouthIn: '#3a5a28'
  });
  def('thornhopper', {
    arch: 'blob', seed: 32, r: 15, squashY: .9, footH: 6,
    body: '#4f8a5c', foot: '#2f5a38', eyeStyle: 'angry', mouth: 'frown',
    features: ['spikes'], spikeColor: '#d8e0c8'
  });
  def('barkbug', {
    arch: 'beast', seed: 33, bw: 20, bh: 12, legH: 8, hw: 11, hh: 10,
    body: '#8a5a30', head: '#a9713f', paw: '#5a3a1c', snout: true,
    eyeStyle: 'dot', mouth: 'fang', features: ['horns'], hornColor: '#e8dcc0'
  });
  def('mossback', {
    arch: 'blob', seed: 34, r: 21, squashY: .78, footH: 5,
    body: '#7a8a5a', cap: '#4f7a3c', foot: '#4a5a3a', stripes: '#3f6a2c',
    eyeStyle: 'sleepy', mouth: 'flat'
  });
  def('twigling', {
    arch: 'biped', seed: 35, bw: 7, bh: 12, hw: 9, hh: 9, legH: 13, armLen: 13, legW: 5, armW: 4,
    body: '#8a6a3c', head: '#a08050', limb: '#7a5a30', shoe: '#5a4020',
    eyeStyle: 'dot', mouth: 'flat', features: ['tuft'], tuftColor: '#6fbb52'
  });
  def('petalwisp', {
    arch: 'floater', seed: 36, r: 12, hover: 40, body: '#f0a0c0',
    wingStyle: 'feather', wingColor: '#ffe0ee', eyeStyle: 'happy', mouth: 'smile', trail: true
  });

  /* ---- Chapter 2 : Emberfold -------------------------------------------- */
  def('emberling', {
    arch: 'blob', seed: 37, r: 14, squashY: .95, footH: 5,
    body: '#ff7a2e', cap: '#ffb545', foot: '#c04a10',
    eyeStyle: 'angry', mouth: 'grin', features: ['flame']
  });
  def('cinderfly', {
    arch: 'floater', seed: 38, r: 12, hover: 44, body: '#ffb545',
    wingStyle: 'fly', wingColor: '#fff0c0', eyeStyle: 'round', mouth: 'fang', trail: true
  });
  def('ashgoyle', {
    arch: 'biped', seed: 39, bw: 15, bh: 17, hw: 15, hh: 13, legH: 11, armLen: 15,
    body: '#6a5a5a', head: '#7a6a68', limb: '#5a4a4a', shoe: '#3a2f2f',
    eyeStyle: 'void', eyeGlow: '#ff7a2e', mouth: 'fang', features: ['horns'], hornColor: '#3a2f2f'
  });
  def('magmite', {
    arch: 'blob', seed: 40, r: 17, squashY: .86, footH: 5,
    body: '#c8442a', cap: '#ff8a3a', foot: '#8a2a18', stripes: '#ffb545',
    eyeStyle: 'angry', mouth: 'flat'
  });
  def('wickling', {
    arch: 'object', seed: 41, w: 18, h: 42, body: '#f4e8d0', r: 8,
    eyeY: -30, eyeGap: 4.5, eyeStyle: 'round', mouth: 'smile', mouthY: -22,
    custom: function (ctx, cfg, st, A, P) {
      P.rr(ctx, -9, -38, 18, 38, 8, '#f4e8d0', null, 2.4);
      P.line(ctx, [[0, -38], [0, -46]], '#6b5638', 2);
      var f = 1 + Math.sin((st.t || 0) * 0.3) * 0.2;
      P.poly(ctx, [[-5, -46], [0, -46 - 12 * f], [5, -46]], '#ff9f2e', null, 0);
      P.poly(ctx, [[-2.6, -47], [0, -47 - 7 * f], [2.6, -47]], '#ffe066', null, 0);
    }
  });
  def('slagmaw', {
    arch: 'beast', seed: 42, bw: 24, bh: 14, legH: 10, hw: 13, hh: 12,
    body: '#5a3a3a', head: '#7a4a3a', paw: '#2f1f1f', mane: '#ff7a2e', snout: true,
    eyeStyle: 'void', eyeGlow: '#ffb545', mouth: 'fang', tail: true, tailColor: '#ff7a2e'
  });

  /* ---- Chapter 3 : Sogport / Sunken Ream --------------------------------- */
  def('drizzler', {
    arch: 'floater', seed: 43, r: 14, hover: 38, body: '#8fd0f0', squashY: 1.2,
    eyeStyle: 'sleepy', mouth: 'wave', trail: true, tail: true, tailColor: '#5aa8cc'
  });
  def('soggle', {
    arch: 'blob', seed: 44, r: 18, squashY: .72, footH: 4,
    body: '#5a8a9a', cap: '#3f6a7a', foot: '#2f4a58', belly: '#9fc8d8',
    eyeStyle: 'sleepy', mouth: 'frown'
  });
  def('barnacleaf', {
    arch: 'blob', seed: 45, r: 16, squashY: .95, footH: 5,
    body: '#8a9a6a', cap: '#c8d0b0', foot: '#5a6a4a',
    eyeStyle: 'angry', mouth: 'fang', features: ['spikes'], spikeColor: '#e8ecd8'
  });
  def('inkfish', {
    arch: 'floater', seed: 46, r: 15, hover: 36, body: '#5a4a7a', squashY: 1.15,
    eyeStyle: 'oval', mouth: 'flat', tail: true, tailColor: '#3a2a5a',
    features: ['inkdrip'], inkColor: '#2a1c3c'
  });
  def('tidewisp', {
    arch: 'floater', seed: 47, r: 13, hover: 42, body: '#7fe0d0',
    wingStyle: 'feather', wingColor: '#d0fff8', eyeStyle: 'happy', mouth: 'smile', trail: true
  });
  def('brinehound', {
    arch: 'beast', seed: 48, bw: 22, bh: 13, legH: 12, hw: 12, hh: 11,
    body: '#3f6a8a', head: '#4f7a9a', paw: '#2a4a60', snout: true, tail: true,
    eyeStyle: 'angry', mouth: 'fang', mane: '#8fd0f0'
  });

  /* ---- Chapter 4 : Cardstock Carnival ------------------------------------ */
  def('clipling', {
    arch: 'biped', seed: 49, bw: 8, bh: 12, hw: 10, hh: 10, legH: 12, armLen: 12, legW: 5, armW: 4,
    body: '#c0c8d4', head: '#d8dee8', limb: '#a8b0bc', shoe: '#7a828e',
    eyeStyle: 'dot', mouth: 'smirk'
  });
  def('juggloon', {
    arch: 'floater', seed: 50, r: 16, hover: 40, body: '#e8506a', squashY: 1.1,
    eyeStyle: 'happy', mouth: 'grin', tail: true, tailColor: '#f5c02e', trail: false
  });
  def('confettoid', {
    arch: 'blob', seed: 51, r: 15, squashY: .95, footH: 5,
    body: '#f5c02e', cap: '#e8506a', foot: '#c8963c', stripes: '#57b8ea',
    eyeStyle: 'star', mouth: 'grin', arms: true
  });
  def('trapezoid', {
    arch: 'biped', seed: 52, bw: 13, bh: 14, hw: 12, hh: 11, legH: 18, armLen: 18,
    body: '#8a5fc0', head: '#f0e0c8', limb: '#a87fd0', shoe: '#5a3f80',
    eyeStyle: 'oval', mouth: 'smirk', features: ['bow'], bowColor: '#f5c02e'
  });
  def('papercut', {
    arch: 'floater', seed: 53, r: 13, hover: 34, body: '#f0f4f8', shape: 'diamond',
    eyeStyle: 'angry', mouth: 'fang', eyePupil: '#c8443c', trail: true
  });
  def('stiltjack', {
    arch: 'biped', seed: 54, bw: 10, bh: 13, hw: 12, hh: 11, legH: 30, armLen: 16, legW: 4,
    body: '#e8506a', head: '#f7ecd8', limb: '#f0a0b0', shoe: '#3a2a4a',
    eyeStyle: 'round', mouth: 'grin', features: ['hat'], hatColor: '#5a4fb0'
  });

  /* ---- Chapter 5 : Glyphhaven -------------------------------------------- */
  def('footnote', {
    arch: 'floater', seed: 55, r: 11, hover: 30, body: '#f2e8d0', shape: 'square',
    eyeStyle: 'dot', mouth: 'flat', headR: 3
  });
  def('erratum', {
    arch: 'floater', seed: 56, r: 14, hover: 38, body: '#c8443c', shape: 'square',
    eyeStyle: 'angry', mouth: 'frown', headR: 3, trail: true
  });
  def('glyphling', {
    arch: 'blob', seed: 57, r: 14, squashY: .95, footH: 5,
    body: '#5a4fb0', cap: '#3f3a90', foot: '#2f2a70', arms: true,
    eyeStyle: 'oval', mouth: 'flat', features: ['halo'], haloColor: '#c8a2e8'
  });
  def('redliner', {
    arch: 'biped', seed: 58, bw: 9, bh: 16, hw: 11, hh: 10, legH: 12, armLen: 15,
    body: '#c8443c', head: '#f0dcc8', limb: '#e07a70', shoe: '#7a2a24',
    eyeStyle: 'angry', mouth: 'flat', held: 'quill'
  });
  def('dogear', {
    arch: 'blob', seed: 59, r: 17, squashY: .8, footH: 4,
    body: '#e8d8b0', cap: '#c8b48a', foot: '#a08a60',
    eyeStyle: 'sleepy', mouth: 'smile'
  });
  def('marginalis', {
    arch: 'floater', seed: 60, r: 16, hover: 44, body: '#7b4fa0', wingStyle: 'bat',
    wingColor: '#4a2f6a', eyeStyle: 'void', eyeGlow: '#f0a0ff', mouth: 'fang'
  });

  /* ---- Chapter 6 : Frostfold --------------------------------------------- */
  def('frostling', {
    arch: 'blob', seed: 61, r: 15, squashY: .95, footH: 5,
    body: '#dff0ff', cap: '#9fd8f0', foot: '#7ab8d8', blush: '#8fc8e8',
    eyeStyle: 'round', mouth: 'flat'
  });
  def('snowcrease', {
    arch: 'biped', seed: 62, bw: 14, bh: 16, hw: 14, hh: 13, legH: 10, armLen: 14,
    body: '#eaf4ff', head: '#f7fbff', limb: '#cfe4f4', shoe: '#7ab8d8',
    eyeStyle: 'angry', mouth: 'fang', features: ['horns'], hornColor: '#9fd8f0'
  });
  def('icicleimp', {
    arch: 'floater', seed: 63, r: 12, hover: 40, body: '#9fd8f0', shape: 'diamond',
    eyeStyle: 'angry', mouth: 'smirk', trail: true
  });
  def('chillbug', {
    arch: 'beast', seed: 64, bw: 18, bh: 11, legH: 8, hw: 10, hh: 9,
    body: '#7ab8d8', head: '#9fd8f0', paw: '#4f8aa8', snout: true,
    eyeStyle: 'dot', mouth: 'fang'
  });
  def('glaciat', {
    arch: 'blob', seed: 65, r: 22, squashY: .84, footH: 6,
    body: '#bfe4f8', cap: '#eaf7ff', foot: '#6fa8c8', stripes: '#8fc8e8',
    eyeStyle: 'sleepy', mouth: 'flat'
  });
  def('flurrik', {
    arch: 'floater', seed: 66, r: 13, hover: 46, body: '#ffffff',
    wingStyle: 'feather', wingColor: '#dff0ff', eyeStyle: 'happy', mouth: 'smile', trail: true
  });

  /* ---- Chapter 7 : Foilworks --------------------------------------------- */
  def('sparkbit', {
    arch: 'floater', seed: 67, r: 11, hover: 36, body: '#ffe066', shape: 'diamond',
    eyeStyle: 'dot', mouth: 'flat', trail: true
  });
  def('foilrat', {
    arch: 'beast', seed: 68, bw: 17, bh: 10, legH: 8, hw: 10, hh: 9,
    body: '#b0bcc8', head: '#c8d2dc', paw: '#7a848e', snout: true, tail: true,
    eyeStyle: 'angry', mouth: 'fang'
  });
  def('coglet', {
    arch: 'mech', seed: 69, bw: 12, bh: 12, hw: 9, hh: 8, legH: 9, armLen: 10,
    body: '#8e97a6', trim: '#f0a63c', eyeStyle: 'dot', mouth: 'none'
  });
  def('voltoid', {
    arch: 'blob', seed: 70, r: 16, squashY: .95, footH: 5, arms: true,
    body: '#5fd0e8', cap: '#2fa8c8', foot: '#2a7a90',
    eyeStyle: 'angry', mouth: 'fang', features: ['antenna'], antennaColor: '#ffe066'
  });
  def('wirewing', {
    arch: 'floater', seed: 71, r: 13, hover: 42, body: '#6f7a8c', wingStyle: 'fly',
    wingColor: '#cfe0ff', eyeStyle: 'goggle', detail: '#ffe066', mouth: 'flat'
  });
  def('pressbot', {
    arch: 'mech', seed: 72, bw: 20, bh: 18, hw: 12, hh: 10, legH: 12, armLen: 16,
    body: '#6f7a8c', trim: '#c8443c', claw: true, gauge: true,
    eyeStyle: 'single', eyeGap: 0, mouth: 'none'
  });

  /* ---- Chapter 8 : The Blot ---------------------------------------------- */
  def('blotling', {
    arch: 'blob', seed: 73, r: 15, squashY: .9, footH: 5, wob: 0.12,
    body: '#3a2a4a', cap: '#1c1226', foot: '#120b1e',
    eyeStyle: 'void', eyeGlow: '#f0a0ff', mouth: 'fang', mouthIn: '#120b1e'
  });
  def('smudgeling', {
    arch: 'floater', seed: 74, r: 14, hover: 34, body: '#4a3560', wob: .14,
    eyeStyle: 'void', eyeGlow: '#8fe0ff', mouth: 'flat', trail: true,
    features: ['inkdrip'], inkColor: '#1c1226'
  });
  def('inkhound', {
    arch: 'beast', seed: 75, bw: 23, bh: 13, legH: 12, hw: 12, hh: 11,
    body: '#2a1c3c', head: '#3a2a4a', paw: '#120b1e', mane: '#5a3f7a', snout: true, tail: true,
    eyeStyle: 'void', eyeGlow: '#ff5a7a', mouth: 'fang'
  });
  def('nibguard', {
    arch: 'mech', seed: 76, bw: 17, bh: 17, hw: 11, hh: 10, legH: 13, armLen: 15,
    body: '#4a4258', trim: '#8a5fc0', claw: true,
    eyeStyle: 'void', eyeGlow: '#c8a2e8', mouth: 'none'
  });
  def('erasure', {
    arch: 'floater', seed: 77, r: 17, hover: 40, body: '#f2f0ff', wob: .1,
    eyeStyle: 'void', eyeGlow: '#2a1c3c', eyePupil: '#2a1c3c', mouth: 'none', trail: true
  });
  def('blotknight', {
    arch: 'biped', seed: 78, bw: 16, bh: 18, hw: 14, hh: 12, legH: 12, armLen: 16,
    body: '#2f2440', head: '#4a3560', limb: '#3a2a4a', shoe: '#120b1e',
    eyeStyle: 'void', eyeGlow: '#ff5a7a', mouth: 'none',
    features: ['horns'], hornColor: '#8a5fc0', featuresBack: ['cape'], capeColor: '#1c1226'
  });

  /* ---- roaming / neutral -------------------------------------------------- */
  def('crumple', {
    arch: 'blob', seed: 79, r: 14, squashY: .95, footH: 4, wob: .2,
    body: '#e0d8c0', cap: '#c8bfa0', foot: '#a89a78',
    eyeStyle: 'round', mouth: 'flat'
  });
  def('wadball', {
    arch: 'blob', seed: 80, r: 17, squashY: 1, footH: 0, wob: .26,
    body: '#d8cfb4', foot: '#b8ae90', eyeStyle: 'angry', mouth: 'fang'
  });
  def('staplebug', {
    arch: 'beast', seed: 81, bw: 15, bh: 9, legH: 7, hw: 9, hh: 8,
    body: '#9aa3b0', head: '#b0bcc8', paw: '#6f7a8c',
    eyeStyle: 'dot', mouth: 'fang', features: ['horns'], hornColor: '#d8dee8'
  });
  def('gluegoop', {
    arch: 'blob', seed: 82, r: 16, squashY: .7, footH: 3, wob: .18,
    body: '#f0e8c0', cap: '#e0d49a', foot: '#c8bc80',
    eyeStyle: 'sleepy', mouth: 'wave'
  });

  /* ======================================================================
     MINI-BOSSES
     ====================================================================== */
  def('thistleguard', {
    arch: 'biped', seed: 90, bw: 19, bh: 20, hw: 16, hh: 14, legH: 12, armLen: 17,
    body: '#3f6a3c', head: '#4f7a48', limb: '#2f5a2c', shoe: '#1f3a1c',
    eyeStyle: 'angry', mouth: 'fang', features: ['spikes', 'horns'],
    spikeColor: '#c8d8a8', hornColor: '#8a5a30', height: 92
  });
  def('wick_and_wisp', {
    arch: 'floater', seed: 91, r: 18, hover: 44, body: '#ff9f2e', trail: true,
    eyeStyle: 'angry', mouth: 'grin', features: ['flame']
  });
  def('barnacle_bosun', {
    arch: 'biped', seed: 92, bw: 20, bh: 19, hw: 16, hh: 14, legH: 11, armLen: 17,
    body: '#3f6a7a', head: '#5a8a9a', limb: '#2f5060', shoe: '#1f3a48',
    eyeStyle: 'single', eyeGap: 0, mouth: 'fang', held: 'mallet',
    features: ['hat'], hatColor: '#2a1c3c', height: 90
  });
  def('trimmet', {
    arch: 'biped', seed: 93, bw: 13, bh: 16, hw: 13, hh: 12, legH: 22, armLen: 20,
    body: '#e8506a', head: '#f7ecd8', limb: '#f0a0b0', shoe: '#3a2a4a',
    eyeStyle: 'smirk', mouth: 'grin', held: 'shears',
    features: ['hat'], hatColor: '#f5c02e', height: 96
  });
  def('footnote_fenn', {
    arch: 'floater', seed: 94, r: 19, hover: 46, body: '#7b4fa0', shape: 'square',
    headR: 4, eyeStyle: 'void', eyeGlow: '#ffe066', mouth: 'flat', trail: true,
    features: ['glasses']
  });
  def('fenrisk', {
    arch: 'beast', seed: 95, bw: 30, bh: 17, legH: 15, hw: 16, hh: 14,
    body: '#c8e0f0', head: '#e0f0ff', paw: '#7ab8d8', mane: '#ffffff', snout: true, tail: true,
    eyeStyle: 'angry', eyePupil: '#3f76c9', mouth: 'fang', height: 96
  });
  def('foreman_ratchet', {
    arch: 'mech', seed: 96, bw: 24, bh: 22, hw: 14, hh: 12, legH: 15, armLen: 20,
    body: '#7a848e', trim: '#f0a63c', claw: true, gauge: true,
    eyeStyle: 'goggle', detail: '#ff7a2e', mouth: 'none', height: 106
  });
  def('captain_sable', {
    arch: 'biped', seed: 97, bw: 18, bh: 20, hw: 15, hh: 13, legH: 14, armLen: 18,
    body: '#241a34', head: '#3f2f52', limb: '#2f2440', shoe: '#0f0a18',
    eyeStyle: 'void', eyeGlow: '#ff5a7a', mouth: 'none', held: 'staff', staffGem: '#c8a2e8',
    featuresBack: ['cape'], capeColor: '#160f22', features: ['horns'], hornColor: '#8a5fc0', height: 104
  });

  /* ======================================================================
     CHAPTER BOSSES
     ====================================================================== */
  def('bramblejack', {
    arch: 'biped', seed: 100, scale: 1.35,
    bw: 20, bh: 22, hw: 18, hh: 16, legH: 16, armLen: 22, legW: 9, armW: 8,
    body: '#2f5a3a', head: '#3f6a44', limb: '#24462c', shoe: '#16301c',
    eyeStyle: 'angry', eyePupil: '#ffe066', eyeGap: 8, mouth: 'fang', mouthIn: '#1a2f18',
    features: ['horns', 'spikes'], hornColor: '#8a5a30', spikeColor: '#c8d8a8',
    overlay: function (ctx, cfg, st, P) {
      // marionette strings
      ctx.save(); ctx.globalAlpha = .38;
      P.line(ctx, [[-18, -104], [-26, -190]], '#e8dcc0', 1.4);
      P.line(ctx, [[18, -104], [26, -190]], '#e8dcc0', 1.4);
      P.line(ctx, [[0, -118], [4, -190]], '#e8dcc0', 1.4);
      ctx.restore();
    }
  });
  def('pyra_sizzlefold', {
    arch: 'biped', seed: 101, scale: 1.28,
    bw: 17, bh: 24, hw: 16, hh: 14, legH: 14, armLen: 20,
    body: '#e8562e', head: '#ffd8a0', limb: '#ff8a4a', shoe: '#8a2a10',
    eyeStyle: 'angry', eyePupil: '#8a2a10', mouth: 'smirk',
    features: ['crown', 'flame'], crownColor: '#ffd24a',
    featuresBack: ['cape'], capeColor: '#c02a18', held: 'staff', staffGem: '#ff9f2e'
  });
  def('nautilus_grim', {
    arch: 'serpent', seed: 102, segments: 8, r: 24, gap: 30, hover: 66, wave: 16,
    body: '#2f5a8a', head: '#3f6a9a', fins: true, finColor: '#1f3f60', taper: .5,
    eyeStyle: 'angry', eyePupil: '#ffe066', mouth: 'fang', mouthIn: '#16283f',
    features: ['horns'], hornColor: '#c8e0f0', height: 110
  });
  def('great_kerf', {
    arch: 'biped', seed: 103, scale: 1.3,
    bw: 18, bh: 24, hw: 16, hh: 14, legH: 20, armLen: 22,
    body: '#b02a3a', head: '#f7ecd8', limb: '#d8455c', shoe: '#2a1c3c',
    eyeStyle: 'angry', eyePupil: '#b02a3a', mouth: 'grin',
    features: ['hat'], hatColor: '#2a1c3c', held: 'shears',
    featuresBack: ['cape'], capeColor: '#7a1a26', buttons: 3, buttonColor: '#f5c02e'
  });
  def('the_redactor', {
    arch: 'floater', seed: 104, r: 30, hover: 62, body: '#1c1226', shape: 'square', headR: 4,
    eyeStyle: 'void', eyeGlow: '#c8443c', mouth: 'none', trail: true, scale: 1.15,
    overlay: function (ctx, cfg, st, P, U) {
      var hv = -62 + Math.sin((st.t || 0) * 0.06) * 4;
      for (var i = 0; i < 4; i++) {
        var w = 26 + (i % 2) * 22, y = hv - 22 + i * 15;
        ctx.save(); ctx.globalAlpha = .9;
        P.rr(ctx, -w / 2 + Math.sin((st.t || 0) * .03 + i) * 8, y, w, 7, 2, '#0f0a18', null, 0);
        ctx.restore();
      }
    }
  });
  def('crinkle_wyrm', {
    arch: 'serpent', seed: 105, segments: 9, r: 25, gap: 31, hover: 70, wave: 14,
    body: '#cfe8f8', head: '#eaf7ff', fins: true, finColor: '#8fc8e8', taper: .48,
    eyeStyle: 'angry', eyePupil: '#3f76c9', mouth: 'fang', mouthIn: '#4f8aa8',
    features: ['horns'], hornColor: '#ffffff', height: 116
  });
  def('chief_ampere', {
    arch: 'mech', seed: 106, scale: 1.35,
    bw: 30, bh: 28, hw: 17, hh: 14, legH: 18, armLen: 24, r: 8,
    body: '#5f6a7c', trim: '#ffe066', claw: true, gauge: true, head: '#7a848e',
    eyeStyle: 'goggle', detail: '#66e0ff', mouth: 'none',
    features: ['antenna'], antennaColor: '#ffe066'
  });
  def('duke_smudge', {
    arch: 'biped', seed: 107, scale: 1.32,
    bw: 17, bh: 26, hw: 16, hh: 14, legH: 16, armLen: 22,
    body: '#241a34', head: '#3f2f52', limb: '#2f2440', shoe: '#0f0a18',
    eyeStyle: 'void', eyeGlow: '#ff5a7a', mouth: 'smirk', mouthColor: '#c8a2e8',
    features: ['crown', 'monocle'], crownColor: '#6b4d8f',
    featuresBack: ['cape'], capeColor: '#160f22', held: 'quill'
  });
  def('smudge_ascendant', {
    arch: 'biped', seed: 108, scale: 1.6,
    bw: 22, bh: 30, hw: 19, hh: 16, legH: 18, armLen: 26,
    body: '#160f22', head: '#2a1c3c', limb: '#1f1630', shoe: '#0a0612',
    eyeStyle: 'void', eyeGlow: '#ff2e5a', mouth: 'fang', mouthIn: '#3a0a18',
    features: ['crown', 'horns'], crownColor: '#8a5fc0', hornColor: '#5a3f7a',
    featuresBack: ['cape', 'wings'], capeColor: '#0f0a18', wingColor: '#2f2440'
  });
  def('the_blank', {
    arch: 'floater', seed: 109, r: 40, hover: 78, body: '#f7f5ff', wob: .04, scale: 1.2,
    eyeStyle: 'void', eyeGlow: '#0f0a18', eyePupil: '#0f0a18', mouth: 'none',
    overlay: function (ctx, cfg, st, P, U) {
      var hv = -78 + Math.sin((st.t || 0) * 0.04) * 5;
      ctx.save();
      ctx.globalAlpha = .16 + Math.sin((st.t || 0) * .05) * .05;
      for (var i = 1; i <= 3; i++) P.ell(ctx, 0, hv, 40 + i * 13, 40 + i * 13, '#ffffff', null);
      ctx.restore();
    }
  });

  /* ======================================================================
     SUPERBOSSES
     ====================================================================== */
  def('origami_sovereign', {
    arch: 'biped', seed: 120, scale: 1.5,
    bw: 20, bh: 28, hw: 18, hh: 15, legH: 17, armLen: 24,
    body: '#f0e2c0', head: '#faf2dc', limb: '#e0cfa8', shoe: '#c8a05a',
    eyeStyle: 'star', eyeGlow: '#f5c02e', mouth: 'flat',
    features: ['crown'], crownColor: '#f5c02e',
    featuresBack: ['wings'], wingColor: '#fffaf0', held: 'staff', staffGem: '#f5c02e'
  });
  /* Pip's silhouette exactly — drained of every colour, and holding the mallet
     the wrong way round. */
  def('first_draft', {
    arch: 'biped', seed: 121, scale: 1.15,
    bw: 14, bh: 16, hw: 16, hh: 15, legH: 13, armLen: 14, legW: 9, armW: 7,
    body: '#8e97a6', overalls: '#5f6a7c', legColor: '#5f6a7c',
    limb: '#c8c2b4', head: '#d8d2c4', hand: '#eceae2', handR: 6,
    shoe: '#4a4a44', shoeW: 10, shoeH: 6,
    hair: '#3a3a38', hatColor: '#7a828e', emblemBg: '#c8c2b4', capLetter: '?',
    buttonColor: '#a8a294', torsoR: 7,
    eyeStyle: 'void', eyeGlow: '#ffffff', eyeGap: 5.6, eyeW: 3.6, eyeH: 4.4, eyeY: 1.5,
    mouth: 'flat', mouthY: 13, mouthW: 8, noseX: .1, noseY: .36,
    features: ['hair', 'heroCap', 'nose', 'moustache'], held: 'mallet'
  });
  def('vermillion', {
    arch: 'serpent', seed: 122, segments: 10, r: 27, gap: 32, hover: 76, wave: 18,
    body: '#a01828', head: '#c8243a', fins: true, finColor: '#5a0a14', taper: .42,
    eyeStyle: 'void', eyeGlow: '#ffe066', mouth: 'fang', mouthIn: '#3a0510',
    features: ['horns', 'crown'], hornColor: '#f0c0c8', crownColor: '#ffd24a', height: 128
  });

  /* ======================================================================
     PROPS (drawn with the same pipeline so they share the paper look)
     ====================================================================== */
  function prop(id, w, h, fn, extra) {
    return def(id, U.extend({ arch: 'object', w: w, h: h, face: false, custom: fn }, extra || {}));
  }
  prop('tree_pine', 60, 120, function (ctx, cfg, st, A, P) {
    P.rr(ctx, -7, -34, 14, 34, 3, '#7a5230', null, 2.4);
    for (var i = 0; i < 3; i++) {
      var y = -34 - i * 26, w = 34 - i * 8;
      P.poly(ctx, [[-w, y], [0, y - 40], [w, y]], i % 2 ? '#4f9a48' : '#3f8a3c', null, 2.4);
    }
  });
  prop('tree_round', 70, 118, function (ctx, cfg, st, A, P) {
    P.rr(ctx, -8, -40, 16, 40, 4, '#8a5a30', null, 2.4);
    P.blob(ctx, 0, -74, 36, .09, 3, '#5aa84e', null, 2.6, .82);
    P.blob(ctx, -20, -60, 20, .1, 5, '#4f9a48', null, 2.4, .8);
    P.blob(ctx, 22, -62, 21, .1, 7, '#66b85a', null, 2.4, .8);
  });
  prop('bush', 46, 34, function (ctx, cfg, st, A, P) {
    P.blob(ctx, 0, -16, 22, .13, 11, '#4f9a48', null, 2.4, .72);
    P.blob(ctx, -13, -12, 13, .14, 13, '#5aa84e', null, 2.2, .74);
    P.blob(ctx, 14, -13, 14, .14, 17, '#43893f', null, 2.2, .74);
  });
  prop('rock', 44, 32, function (ctx, cfg, st, A, P) {
    P.blob(ctx, 0, -14, 21, .16, 19, '#9aa3b0', null, 2.4, .68);
    P.line(ctx, [[-8, -18], [2, -10]], '#7a848e', 1.6);
  });
  prop('sign', 34, 46, function (ctx, cfg, st, A, P) {
    P.rr(ctx, -3, -28, 6, 28, 2, '#8a5a30', null, 2);
    P.rr(ctx, -17, -46, 34, 20, 3, '#c8a06a', null, 2.4);
    P.line(ctx, [[-11, -39], [11, -39]], '#7a5230', 2);
    P.line(ctx, [[-11, -34], [6, -34]], '#7a5230', 2);
  });
  prop('crate', 36, 34, function (ctx, cfg, st, A, P) {
    P.rr(ctx, -18, -34, 36, 34, 3, '#c8a06a', null, 2.4);
    P.line(ctx, [[-18, -34], [18, 0]], '#8a6a3a', 2);
    P.line(ctx, [[18, -34], [-18, 0]], '#8a6a3a', 2);
  });
  prop('barrel', 32, 40, function (ctx, cfg, st, A, P) {
    P.rr(ctx, -15, -40, 30, 40, 8, '#a9713f', null, 2.4);
    P.line(ctx, [[-15, -30], [15, -30]], '#6f4a28', 2.4);
    P.line(ctx, [[-15, -12], [15, -12]], '#6f4a28', 2.4);
  });
  prop('lamp', 24, 74, function (ctx, cfg, st, A, P) {
    P.rr(ctx, -3, -60, 6, 60, 2, '#4a4258', null, 2);
    P.poly(ctx, [[-12, -60], [12, -60], [8, -74], [-8, -74]], '#ffe9a8', null, 2.2);
    P.ell(ctx, 0, -66, 5, 6, '#fff6cc', null);
  });
  prop('house_small', 130, 120, function (ctx, cfg, st, A, P) {
    P.rr(ctx, -56, -84, 112, 84, 5, '#e8d8b0', null, 2.6);
    P.poly(ctx, [[-66, -84], [0, -122], [66, -84]], '#c8543c', null, 2.6);
    P.rr(ctx, -16, -44, 32, 44, 4, '#8a5a30', null, 2.4);
    P.ell(ctx, 8, -22, 3, 3, '#f5c02e', null);
    P.rr(ctx, -44, -70, 22, 20, 3, '#8fd0f0', null, 2.2);
    P.rr(ctx, 22, -70, 22, 20, 3, '#8fd0f0', null, 2.2);
  });
  prop('shop_stall', 140, 110, function (ctx, cfg, st, A, P) {
    P.rr(ctx, -58, -60, 116, 60, 4, '#d8c49a', null, 2.6);
    for (var i = 0; i < 6; i++) P.rr(ctx, -60 + i * 20, -84, 20, 24, 2, i % 2 ? '#e8506a' : '#f7ecd8', null, 2);
    P.rr(ctx, -64, -90, 128, 8, 3, '#8a5a30', null, 2.2);
  });
  prop('pillar', 40, 130, function (ctx, cfg, st, A, P) {
    P.rr(ctx, -16, -120, 32, 120, 3, '#d8cfb4', null, 2.4);
    P.rr(ctx, -20, -130, 40, 14, 3, '#e6ddc2', null, 2.4);
    P.rr(ctx, -20, -12, 40, 12, 3, '#e6ddc2', null, 2.4);
    P.creaseLines(ctx, -14, -118, 28, 106, 4, .12);
  });
  prop('chest', 40, 34, function (ctx, cfg, st, A, P) {
    P.rr(ctx, -19, -22, 38, 22, 3, '#b07a42', null, 2.4);
    P.rr(ctx, -20, -34, 40, 14, 5, '#c8964a', null, 2.4);
    P.rr(ctx, -5, -26, 10, 10, 2, '#f5c02e', null, 2);
  });
  prop('savepoint', 46, 52, function (ctx, cfg, st, A, P) {
    var g = 0.5 + Math.sin((st.t || 0) * 0.07) * 0.5;
    P.rr(ctx, -14, -12, 28, 12, 3, '#8a7a5a', null, 2.2);
    ctx.save(); ctx.globalAlpha = .25 + g * .35;
    P.ell(ctx, 0, -32, 24, 26, '#8fe0ff', null);
    ctx.restore();
    P.star(ctx, 0, -32, 17, 7, 5, (st.t || 0) * 0.012, '#bff0ff', '#4f8aa8', 2.2);
  });
  prop('heartblock', 40, 44, function (ctx, cfg, st, A, P) {
    P.rr(ctx, -18, -40, 36, 36, 5, '#f07a8a', null, 2.6);
    P.blob(ctx, 0, -22, 10, .1, 3, '#ffd0d8', null, 2, 1);
  });
  prop('blockq', 36, 38, function (ctx, cfg, st, A, P) {
    P.rr(ctx, -17, -36, 34, 34, 4, '#f5c02e', null, 2.6);
    P.text(ctx, '?', 0, -12, { size: 24, align: 'center', color: '#fff', outlineColor: '#8a6a12' });
  });
  prop('brickblock', 36, 38, function (ctx, cfg, st, A, P) {
    P.rr(ctx, -17, -36, 34, 34, 3, '#c8783c', null, 2.6);
    P.line(ctx, [[-17, -25], [17, -25]], '#8a4a20', 2);
    P.line(ctx, [[-17, -13], [17, -13]], '#8a4a20', 2);
    P.line(ctx, [[0, -36], [0, -25]], '#8a4a20', 2);
    P.line(ctx, [[-8, -25], [-8, -13]], '#8a4a20', 2);
    P.line(ctx, [[9, -25], [9, -13]], '#8a4a20', 2);
  });
  prop('spring', 34, 26, function (ctx, cfg, st, A, P) {
    for (var i = 0; i < 4; i++) P.ell(ctx, 0, -4 - i * 6, 14 - i, 4, '#c8443c', null, 2);
    P.rr(ctx, -16, -30, 32, 6, 3, '#e8dcc0', null, 2.2);
  });
  prop('soil', 44, 12, function (ctx, cfg, st, A, P) {
    P.ell(ctx, 0, -5, 21, 8, '#7a5230', null, 2.2);
    P.ell(ctx, 0, -7, 15, 5, '#5a3a20', null, 1.6);
  });
  prop('crack', 30, 60, function (ctx, cfg, st, A, P) {
    P.line(ctx, [[0, 0], [-5, -18], [4, -34], [-3, -56]], '#2a1c3c', 4);
  });
  prop('seam', 26, 58, function (ctx, cfg, st, A, P) {
    for (var i = 0; i < 6; i++) P.line(ctx, [[-8, -6 - i * 9], [8, -10 - i * 9]], '#c8a06a', 3.4);
  });
  prop('glyph', 34, 34, function (ctx, cfg, st, A, P) {
    ctx.save(); ctx.globalAlpha = .5 + Math.sin((st.t || 0) * .06) * .3;
    P.star(ctx, 0, -18, 15, 6, 6, (st.t || 0) * .008, '#c8a2e8', '#5a4fb0', 2);
    ctx.restore();
  });
  prop('switch_plate', 40, 14, function (ctx, cfg, st, A, P) {
    P.ell(ctx, 0, -6, 19, 8, '#c8443c', null, 2.4);
    P.ell(ctx, 0, -9, 13, 5, '#e8756a', null, 1.6);
  });
  prop('brazier', 36, 60, function (ctx, cfg, st, A, P) {
    P.rr(ctx, -6, -34, 12, 34, 3, '#6f7a8c', null, 2.2);
    P.poly(ctx, [[-17, -46], [17, -46], [12, -32], [-12, -32]], '#8e97a6', null, 2.4);
    var f = 1 + Math.sin((st.t || 0) * .28) * .18;
    P.poly(ctx, [[-11, -46], [0, -46 - 26 * f], [11, -46]], '#ff8a2e', null, 0);
    P.poly(ctx, [[-6, -47], [0, -47 - 16 * f], [6, -47]], '#ffe066', null, 0);
  });
  prop('bookshelf', 90, 130, function (ctx, cfg, st, A, P) {
    P.rr(ctx, -44, -128, 88, 128, 3, '#7a5230', null, 2.6);
    for (var r = 0; r < 4; r++) {
      P.rr(ctx, -40, -122 + r * 31, 80, 27, 2, '#5a3a20', null, 1.6);
      for (var b = 0; b < 7; b++) {
        var cols = ['#c8443c', '#3f76c9', '#4f9a48', '#f5c02e', '#8a5fc0', '#e8756a', '#39b3a6'];
        P.rr(ctx, -38 + b * 11, -120 + r * 31, 9, 23, 1, cols[(b + r) % 7], null, 1.2);
      }
    }
  });
  prop('anvil', 46, 34, function (ctx, cfg, st, A, P) {
    P.rr(ctx, -12, -10, 24, 10, 2, '#4a5260', null, 2.2);
    P.poly(ctx, [[-22, -30], [22, -30], [16, -14], [-16, -14]], '#6f7a8c', null, 2.4);
  });
  prop('gear', 52, 52, function (ctx, cfg, st, A, P) {
    ctx.save(); ctx.translate(0, -26); ctx.rotate((st.t || 0) * .01);
    for (var i = 0; i < 8; i++) {
      var a = i / 8 * Math.PI * 2;
      P.rr(ctx, Math.cos(a) * 22 - 5, Math.sin(a) * 22 - 5, 10, 10, 2, '#8e97a6', null, 1.8);
    }
    P.ell(ctx, 0, 0, 19, 19, '#9aa3b0', null, 2.4);
    P.ell(ctx, 0, 0, 7, 7, '#5a626e', null, 2);
    ctx.restore();
  });
  prop('icechunk', 48, 46, function (ctx, cfg, st, A, P) {
    P.poly(ctx, [[-22, 0], [-16, -34], [4, -46], [22, -26], [16, 0]], '#bfe4f8', null, 2.4);
    ctx.save(); ctx.globalAlpha = .5;
    P.line(ctx, [[-10, -8], [-4, -32]], '#ffffff', 3);
    ctx.restore();
  });
  prop('coral', 44, 60, function (ctx, cfg, st, A, P) {
    P.line(ctx, [[0, 0], [0, -30]], '#e8768a', 7);
    P.line(ctx, [[0, -22], [-16, -46]], '#e8768a', 6);
    P.line(ctx, [[0, -26], [16, -52]], '#f09aa8', 6);
  });
  prop('tent', 150, 132, function (ctx, cfg, st, A, P) {
    P.poly(ctx, [[-72, 0], [0, -128], [72, 0]], '#e8506a', null, 2.6);
    for (var i = -2; i <= 2; i++) {
      if (i % 2) P.poly(ctx, [[i * 28 - 14, 0], [0, -128], [i * 28 + 14, 0]], '#f7ecd8', null, 0);
    }
    P.poly(ctx, [[-72, 0], [0, -128], [72, 0]], null, '#8a1a2a', 2.6);
    P.star(ctx, 0, -134, 11, 5, 5, 0, '#f5c02e', null, 2);
  });
  prop('inkpool', 70, 16, function (ctx, cfg, st, A, P) {
    P.blob(ctx, 0, -7, 33, .1, 23, '#241a34', null, 2.2, .24);
  });
  prop('banner', 40, 100, function (ctx, cfg, st, A, P) {
    var sw = Math.sin((st.t || 0) * .04) * 4;
    P.poly(ctx, [[-16, -98], [16, -98], [16 + sw, -22], [0 + sw, -34], [-16 + sw, -22]], '#8a5fc0', null, 2.4);
    P.star(ctx, sw * .4, -66, 11, 4.5, 5, 0, '#f5c02e', null, 1.8);
  });

  /* Coin / collectible sprites reuse the object archetype. */
  prop('coin', 22, 24, function (ctx, cfg, st, A, P) {
    var w = Math.abs(Math.cos((st.t || 0) * .1));
    P.ell(ctx, 0, -12, 10 * (0.25 + w * .75), 11, '#f5c02e', null, 2.2);
    if (w > .4) P.ell(ctx, 0, -12, 5 * w, 6, '#ffe37a', null, 1.4);
  });
  prop('sealshard', 30, 32, function (ctx, cfg, st, A, P) {
    ctx.save(); ctx.globalAlpha = .3 + Math.sin((st.t || 0) * .08) * .2;
    P.ell(ctx, 0, -16, 20, 20, '#ffe9a8', null);
    ctx.restore();
    P.star(ctx, 0, -16, 14, 6, 5, (st.t || 0) * .015, '#ffe066', '#c8963c', 2.2);
  });
})();

/* ===== 06_items.js ===== */
/* ==========================================================================
   PAPERBOUND — 06_items.js
   Consumables, key items, cooking recipes, and the procedural icon renderer
   they all share.
   ========================================================================== */
'use strict';

PB.Items = (function () {
  var P = PB.Paper, U = PB.U;
  var db = {};

  /* ---- icons ------------------------------------------------------------ */
  /* Every icon is drawn into a 32x32 box centred on (x, y). */
  var ICON = {
    leaf: function (c, a, b) {
      P.poly(c, [[0, 11], [-10, -2], [-3, -12], [8, -9], [11, 2]], a, null, 2);
      P.line(c, [[0, 11], [2, -8]], b, 1.6);
    },
    berry: function (c, a, b) {
      P.ell(c, -3, 3, 7, 7, a, null, 2); P.ell(c, 5, 1, 6, 6, U.shade(a, .12), null, 2);
      P.poly(c, [[0, -5], [-7, -12], [3, -10]], b, null, 1.6);
    },
    bottle: function (c, a, b) {
      P.rr(c, -6, -12, 12, 6, 2, b, null, 1.8);
      P.rr(c, -8, -6, 16, 20, 5, a, null, 2.2);
      P.ell(c, -3, 2, 2.5, 3.5, 'rgba(255,255,255,.5)', null);
    },
    flask: function (c, a, b) {
      P.poly(c, [[-4, -13], [4, -13], [10, 12], [-10, 12]], a, null, 2.2);
      P.rr(c, -5, -15, 10, 4, 2, b, null, 1.6);
      P.ell(c, 0, 6, 6, 3, U.shade(a, .3), null, 1.2);
    },
    cake: function (c, a, b) {
      P.rr(c, -11, -2, 22, 14, 3, a, null, 2.2);
      P.rr(c, -11, -8, 22, 7, 3, b, null, 2);
      P.ell(c, 0, -11, 3, 3, '#e8506a', null, 1.4);
    },
    bomb: function (c, a, b) {
      P.ell(c, 0, 3, 11, 11, a, null, 2.4);
      P.rr(c, -3, -11, 6, 5, 2, b, null, 1.6);
      P.line(c, [[0, -11], [6, -17]], '#c8a06a', 2);
      P.ell(c, -4, -1, 3, 2.5, 'rgba(255,255,255,.4)', null);
    },
    star: function (c, a, b) { P.star(c, 0, 0, 13, 5.5, 5, 0, a, b, 2); },
    card: function (c, a, b) {
      P.rr(c, -9, -12, 18, 24, 2, '#fdf6e3', null, 2);
      P.rr(c, -6, -9, 12, 12, 1, a, null, 1.4);
      P.line(c, [[-6, 6], [6, 6]], b, 1.6);
    },
    key: function (c, a, b) {
      P.ell(c, -4, -6, 6, 6, null, a, 3);
      P.line(c, [[-1, -2], [7, 10]], a, 3.2);
      P.line(c, [[4, 6], [8, 3]], a, 2.6);
      P.line(c, [[7, 10], [11, 7]], a, 2.6);
    },
    seal: function (c, a, b) {
      P.ell(c, 0, 0, 12, 12, b, null, 2);
      P.star(c, 0, 0, 9, 3.6, 5, 0, a, null, 1.6);
    },
    cloth: function (c, a, b) {
      P.poly(c, [[-11, -8], [11, -10], [9, 9], [-9, 11]], a, null, 2.2);
      P.line(c, [[-6, -4], [6, -6]], b, 1.6);
      P.line(c, [[-6, 2], [6, 0]], b, 1.6);
    },
    coil: function (c, a, b) {
      for (var i = 0; i < 4; i++) P.ell(c, 0, -8 + i * 5.5, 10 - i, 3.4, a, null, 1.8);
    },
    shell: function (c, a, b) {
      P.ell(c, 0, 2, 12, 10, a, null, 2.2);
      for (var i = -2; i <= 2; i++) P.line(c, [[0, -8], [i * 5, 11]], b, 1.4);
    },
    gear: function (c, a, b) {
      for (var i = 0; i < 6; i++) { var an = i / 6 * Math.PI * 2; P.rr(c, Math.cos(an) * 10 - 3, Math.sin(an) * 10 - 3, 6, 6, 1, a, null, 1.4); }
      P.ell(c, 0, 0, 7.5, 7.5, a, null, 2); P.ell(c, 0, 0, 3, 3, b, null, 1.4);
    },
    book: function (c, a, b) {
      P.rr(c, -10, -12, 20, 24, 2, a, null, 2.2);
      P.rr(c, -7, -9, 14, 18, 1, '#f6efd8', null, 1.2);
      P.line(c, [[0, -9], [0, 9]], b, 1.6);
    },
    orb: function (c, a, b) {
      P.ell(c, 0, 0, 11, 11, a, null, 2.2);
      P.ell(c, -3.5, -3.5, 3.5, 3, 'rgba(255,255,255,.55)', null);
      P.ell(c, 0, 0, 11, 11, null, b, 1.4);
    },
    scroll: function (c, a, b) {
      P.rr(c, -10, -9, 20, 18, 2, '#f4e8cc', null, 2);
      P.ell(c, -10, 0, 3, 9.5, a, null, 1.8);
      P.ell(c, 10, 0, 3, 9.5, a, null, 1.8);
      P.line(c, [[-5, -3], [5, -3]], b, 1.4); P.line(c, [[-5, 2], [3, 2]], b, 1.4);
    },
    bolt: function (c, a, b) {
      P.poly(c, [[2, -13], [-8, 2], [-1, 2], [-3, 13], [8, -2], [1, -2]], a, b, 1.8);
    },
    drop: function (c, a, b) {
      P.poly(c, [[0, -13], [8, 2], [0, 12], [-8, 2]], a, null, 2.2);
      P.ell(c, -2.5, 3, 2.5, 3, 'rgba(255,255,255,.5)', null);
    },
    crown: function (c, a, b) {
      P.poly(c, [[-11, 6], [-11, -4], [-5, 2], [0, -9], [5, 2], [11, -4], [11, 6]], a, null, 2);
      P.ell(c, 0, 6, 11, 2.6, b, null, 1.4);
    }
  };

  function drawIcon(ctx, id, x, y, size) {
    var it = db[id];
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(size / 32, size / 32);
    if (it && it.ic && ICON[it.ic[0]]) ICON[it.ic[0]](ctx, it.ic[1], it.ic[2] || U.shade(it.ic[1], -0.4));
    else ICON.card('#9aa3b0', '#5a626e');
    ctx.restore();
  }

  /* ---- definitions ------------------------------------------------------
     type:  'heal'   usable anywhere
            'battle' battle only
            'key'    quest item, never consumed by the player
     fx:    { hp, fp, sp, dmg, target, element, status, cure, buff, revive, ... }
     ------------------------------------------------------------------------ */
  function I(id, name, o) { o.id = id; o.name = name; db[id] = o; return o; }

  /* --- restoratives --- */
  I('pulpberry', 'Pulp Berry', { ic: ['berry', '#e8506a'], type: 'heal', price: 5, sell: 2, fx: { hp: 5 }, desc: 'A tart little berry. Restores 5 HP.' });
  I('honeyleaf', 'Honeyleaf', { ic: ['leaf', '#f5c02e'], type: 'heal', price: 6, sell: 3, fx: { fp: 5 }, desc: 'Sticky and sweet. Restores 5 FP.' });
  I('reamcake', 'Ream Cake', { ic: ['cake', '#f0b0c0', '#f7ecd8'], type: 'heal', price: 12, sell: 5, fx: { hp: 10 }, desc: 'Layered like a fresh ream. Restores 10 HP.' });
  I('inktea', 'Ink Tea', { ic: ['bottle', '#7b4fa0', '#4a3560'], type: 'heal', price: 14, sell: 6, fx: { fp: 8 }, desc: 'Bitter, bracing. Restores 8 FP.' });
  I('foldroll', 'Fold Roll', { ic: ['cake', '#e8b96a', '#c8964a'], type: 'heal', price: 22, sell: 9, fx: { hp: 10, fp: 5 }, desc: 'Restores 10 HP and 5 FP.' });
  I('creambun', 'Cream Bun', { ic: ['cake', '#f7ecd8', '#f0d8a0'], type: 'heal', price: 30, sell: 12, fx: { hp: 15 }, desc: 'Restores 15 HP.' });
  I('deeproot', 'Deep Root Tonic', { ic: ['flask', '#4f9a48', '#8a5a30'], type: 'heal', price: 40, sell: 16, fx: { fp: 15 }, desc: 'Restores 15 FP.' });
  I('grandfeast', 'Grand Feast', { ic: ['cake', '#f5c02e', '#e8506a'], type: 'heal', price: 90, sell: 40, fx: { hp: 30, fp: 30 }, desc: 'A whole spread. Restores 30 HP and 30 FP.' });
  I('lifeleaf', 'Life Leaf', { ic: ['leaf', '#7fe0d0'], type: 'heal', price: 60, sell: 25, fx: { revive: true, hp: 10 }, desc: 'Held in reserve, it revives you with 10 HP the moment you fall.' });
  I('lastpage', 'Last Page', { ic: ['scroll', '#f0a63c', '#8a5a30'], type: 'heal', price: 120, sell: 50, fx: { revive: true, hp: 30, fp: 10 }, desc: 'Revives you with 30 HP and 10 FP when you fall.' });
  I('sealwater', 'Seal Water', { ic: ['drop', '#ffe066', '#c8963c'], type: 'heal', price: 45, sell: 18, fx: { sp: 200 }, desc: 'Restores 2 Seal Energy.' });

  /* --- cures --- */
  I('antidote', 'Antidote Leaf', { ic: ['leaf', '#8fcf52'], type: 'heal', price: 8, sell: 3, fx: { cure: ['poison'] }, desc: 'Cures Poison.' });
  I('drycloth', 'Dry Cloth', { ic: ['cloth', '#f2e6cc'], type: 'heal', price: 8, sell: 3, fx: { cure: ['soggy', 'burn'] }, desc: 'Cures Soggy and Burn.' });
  I('smellingink', 'Smelling Ink', { ic: ['bottle', '#57b8ea', '#2f6a9a'], type: 'heal', price: 10, sell: 4, fx: { cure: ['sleep', 'dizzy'] }, desc: 'Cures Sleep and Dizzy.' });
  I('tonicwash', 'Tonic Wash', { ic: ['flask', '#7fe0d0', '#39b3a6'], type: 'heal', price: 28, sell: 11, fx: { cureAll: true }, desc: 'Washes away every negative status.' });
  I('pressiron', 'Pressing Iron', { ic: ['gear', '#c8d2dc', '#6f7a8c'], type: 'heal', price: 18, sell: 7, fx: { cure: ['crumple', 'shrink'] }, desc: 'Cures Crumpled and Shrunk.' });

  /* --- offensive --- */
  I('wadbomb', 'Wad Bomb', { ic: ['bomb', '#4a4258'], type: 'battle', price: 12, sell: 5, fx: { dmg: 6, target: 'one' }, desc: 'Deals 6 damage to one foe.' });
  I('bigwadbomb', 'Big Wad Bomb', { ic: ['bomb', '#2a1c3c'], type: 'battle', price: 34, sell: 14, fx: { dmg: 7, target: 'all' }, desc: 'Deals 7 damage to every foe.' });
  I('emberpod', 'Ember Pod', { ic: ['orb', '#ff7a2e', '#c04a10'], type: 'battle', price: 16, sell: 6, fx: { dmg: 6, target: 'all', element: 'fire', status: { type: 'burn', chance: .5, turns: 3 } }, desc: 'Burns all foes for 6 fire damage.' });
  I('frostnut', 'Frost Nut', { ic: ['orb', '#9fd8f0', '#4f8aa8'], type: 'battle', price: 16, sell: 6, fx: { dmg: 5, target: 'all', element: 'ice', status: { type: 'freeze', chance: .4, turns: 2 } }, desc: 'Chills all foes for 5 ice damage.' });
  I('thunderrag', 'Thunder Rag', { ic: ['bolt', '#ffe066', '#c8963c'], type: 'battle', price: 18, sell: 7, fx: { dmg: 5, target: 'all', element: 'shock', pierce: true }, desc: 'Deals 5 piercing shock damage to all foes.' });
  I('papercutstar', 'Papercut Star', { ic: ['star', '#f0f4f8', '#c8443c'], type: 'battle', price: 20, sell: 8, fx: { dmg: 5, target: 'one', element: 'cut', pierce: true }, desc: 'Ignores defence. 5 damage to one foe.' });
  I('sleepysheet', 'Sleepy Sheet', { ic: ['cloth', '#c8a2e8'], type: 'battle', price: 20, sell: 8, fx: { target: 'all', status: { type: 'sleep', chance: .7, turns: 3 } }, desc: 'Tries to put every foe to sleep.' });
  I('dizzydust', 'Dizzy Dust', { ic: ['drop', '#f5c02e', '#8a6a12'], type: 'battle', price: 15, sell: 6, fx: { target: 'all', status: { type: 'dizzy', chance: .7, turns: 3 } }, desc: 'Tries to make every foe Dizzy.' });
  I('tanglet', 'Tangle Twine', { ic: ['coil', '#a9713f'], type: 'battle', price: 24, sell: 10, fx: { target: 'one', status: { type: 'tangled', chance: .8, turns: 2 } }, desc: 'Binds one foe so it cannot act.' });
  I('inkbomb', 'Ink Bomb', { ic: ['bomb', '#241a34'], type: 'battle', price: 22, sell: 9, fx: { dmg: 4, target: 'all', element: 'ink', status: { type: 'inked', chance: .8, turns: 3 } }, desc: 'Blinds all foes and deals 4 damage.' });
  I('venomvial', 'Venom Vial', { ic: ['bottle', '#8fcf52', '#3f6a2c'], type: 'battle', price: 20, sell: 8, fx: { dmg: 2, target: 'one', status: { type: 'poison', chance: .9, turns: 5 } }, desc: 'Poisons one foe badly.' });
  I('shreddisc', 'Shred Disc', { ic: ['gear', '#cfd6de', '#7c848f'], type: 'battle', price: 40, sell: 16, fx: { dmg: 8, target: 'one', element: 'cut' }, desc: 'A whirling blade. 8 damage to one foe.' });

  /* --- buffs --- */
  I('boldbrew', 'Bold Brew', { ic: ['flask', '#e0483c', '#8a2018'], type: 'battle', price: 26, sell: 10, fx: { buff: { type: 'atkUp', amt: 2, turns: 3 } }, desc: 'Attack +2 for 3 turns.' });
  I('ironsheet', 'Iron Sheet', { ic: ['card', '#9aa3b0', '#4a5260'], type: 'battle', price: 26, sell: 10, fx: { buff: { type: 'defUp', amt: 2, turns: 3 } }, desc: 'Defence +2 for 3 turns.' });
  I('swiftdraft', 'Swift Draft', { ic: ['cloth', '#8fd0f0'], type: 'battle', price: 30, sell: 12, fx: { buff: { type: 'dodgy', amt: 1, turns: 3 } }, desc: 'Half of all attacks miss you for 3 turns.' });
  I('focusink', 'Focus Ink', { ic: ['bottle', '#5a4fb0', '#2f2a70'], type: 'battle', price: 24, sell: 9, fx: { buff: { type: 'charge', amt: 3, turns: 99 } }, desc: 'Your next attack deals 3 extra damage.' });
  I('mirrorfoil', 'Mirror Foil', { ic: ['card', '#e8f0f8', '#8e97a6'], type: 'battle', price: 44, sell: 18, fx: { buff: { type: 'thorns', amt: 2, turns: 3 } }, desc: 'Reflects 2 damage back at melee attackers for 3 turns.' });
  I('secondwindvial', 'Second Wind', { ic: ['drop', '#7fe0d0', '#39b3a6'], type: 'battle', price: 50, sell: 20, fx: { buff: { type: 'regen', amt: 3, turns: 4 } }, desc: 'Recover 3 HP at the end of each of your turns.' });

  /* --- utility --- */
  I('escapenote', 'Escape Note', { ic: ['scroll', '#8fcf52', '#3f6a2c'], type: 'battle', price: 10, sell: 4, fx: { escape: true }, desc: 'Flee any battle instantly. Bosses excepted.' });
  I('repelpowder', 'Repel Powder', { ic: ['drop', '#c8a2e8', '#5a4fb0'], type: 'heal', price: 24, sell: 10, fx: { repel: 3600 }, desc: 'Weak foes avoid you for a while.' });
  I('mysterywad', 'Mystery Wad', { ic: ['orb', '#f0e8c0', '#a89a78'], type: 'battle', price: 16, sell: 6, fx: { mystery: true }, desc: 'Nobody knows. Roll the dice.' });
  I('crowdcandy', 'Crowd Candy', { ic: ['star', '#f07a8a', '#c8443c'], type: 'battle', price: 18, sell: 7, fx: { audience: 30 }, desc: 'Wins over 30 audience members at once.' });

  /* --- cooked-only dishes --- */
  I('foldcake', 'Foldover Cake', { ic: ['cake', '#f5c02e', '#e8b96a'], type: 'heal', price: 0, sell: 22, fx: { hp: 20, fp: 10 }, desc: 'Restores 20 HP and 10 FP.' });
  I('emberstew', 'Ember Stew', { ic: ['flask', '#ff7a2e', '#8a2a10'], type: 'heal', price: 0, sell: 26, fx: { hp: 15, buff: { type: 'atkUp', amt: 2, turns: 4 } }, desc: 'Restores 15 HP and raises Attack.' });
  I('glacierjelly', 'Glacier Jelly', { ic: ['orb', '#bfe4f8', '#4f8aa8'], type: 'heal', price: 0, sell: 26, fx: { fp: 12, buff: { type: 'defUp', amt: 2, turns: 4 } }, desc: 'Restores 12 FP and raises Defence.' });
  I('sovereignroast', 'Sovereign Roast', { ic: ['cake', '#e8b96a', '#a9713f'], type: 'heal', price: 0, sell: 70, fx: { hp: 40, fp: 20 }, desc: 'A legendary meal. 40 HP and 20 FP.' });
  I('twicefolded', 'Twice-Folded Tart', { ic: ['cake', '#f0b0c0', '#8a5fc0'], type: 'heal', price: 0, sell: 34, fx: { hp: 12, fp: 12, cureAll: true }, desc: '12 HP, 12 FP, and cures everything.' });
  I('inkespresso', 'Ink Espresso', { ic: ['bottle', '#2a1c3c', '#8a5fc0'], type: 'heal', price: 0, sell: 30, fx: { fp: 20, buff: { type: 'charge', amt: 2, turns: 99 } }, desc: 'Restores 20 FP and charges your next hit.' });
  I('paperplanepie', 'Paper Plane Pie', { ic: ['cake', '#8fd0f0', '#f7ecd8'], type: 'heal', price: 0, sell: 28, fx: { hp: 10, buff: { type: 'dodgy', amt: 1, turns: 4 } }, desc: '10 HP and makes you hard to hit.' });
  I('sevenlayer', 'Seven-Layer Seal', { ic: ['seal', '#ffe066', '#c8963c'], type: 'heal', price: 0, sell: 90, fx: { hp: 25, fp: 25, sp: 300 }, desc: 'Restores 25 HP, 25 FP and 3 Seal Energy.' });
  I('burntoffering', 'Burnt Offering', { ic: ['cake', '#4a4258', '#2a1c3c'], type: 'heal', price: 0, sell: 1, fx: { hp: 1 }, desc: 'Something went wrong. Restores 1 HP.' });

  /* --- key items --- */
  function K(id, name, ic, desc) { I(id, name, { ic: ic, type: 'key', price: 0, sell: 0, fx: {}, desc: desc }); }
  K('map_foldheim', 'Foldheim Map', ['scroll', '#8fcf52'], 'A map of the whole realm. Press the pause key to read it.');
  K('crease_key', 'Creasewood Key', ['key', '#8fcf52'], 'Opens the thicket gate in Creasewood.');
  K('emberkey', 'Furnace Key', ['key', '#ff7a2e'], 'Opens the Emberfold furnace door.');
  K('tidepass', 'Tide Pass', ['card', '#57b8ea'], 'Lets you board the Sogport ferry.');
  K('bigtop_ticket', 'Big Top Ticket', ['card', '#e8506a'], 'Admits one to the Cardstock Carnival main tent.');
  K('libcard', 'Reader\'s Card', ['card', '#7b4fa0'], 'Grants access to the Glyphhaven stacks.');
  K('summitrope', 'Summit Rope', ['coil', '#e8dcc0'], 'Strong enough for the Frostfold cliffs.');
  K('foilbadge', 'Foundry Pass', ['gear', '#f0a63c'], 'Opens the Foilworks security gates.');
  K('blotlantern', 'Blot Lantern', ['orb', '#8a5fc0'], 'Its cold light holds back the Blot.');
  K('coliseum_pass', 'Coliseum Pass', ['crown', '#f5c02e'], 'Entry to the Folded Coliseum.');
  K('foundry_steel', 'Emberfold Steel', ['gear', '#c8443c'], 'A bar of foundry steel. Deckle in Quillton would want to see this.');
  K('lantern_oil', 'Lamp Oil', ['bottle', '#f0a63c'], 'Thick, slow-burning oil for the Emberfold lamps.');
  K('harbor_manifest', 'Harbour Manifest', ['scroll', '#57b8ea'], 'The Sogport shipping manifest, water-stained but legible.');
  K('carnival_ticket', 'Torn Ticket', ['card', '#e8506a'], 'A child\'s carnival ticket, dropped in the funhouse.');
  K('bell_key', 'Bell Crank', ['key', '#9fd8f0'], 'Turns the frozen bell mechanisms of the Frostfold passes.');
  K('cog_bundle', 'Bundle of Cogs', ['gear', '#8e97a6'], 'Six discarded cogs from the Foilworks floor. Volt wants them.');
  K('smudge_letters', 'Unsent Letters', ['scroll', '#4a3560'], 'Nine letters Duke Smudge wrote and never sent. They get sadder.');
  K('vault_sigil', 'Vault Sigil', ['seal', '#7b4fa0'], 'Opens the restricted vault beneath Glyphhaven.');
  K('press_key', 'Pressroom Key', ['key', '#f0a63c'], 'Opens the Foilworks pressroom.');
  K('citadel_writ', 'Citadel Writ', ['scroll', '#241a34'], 'A forged writ of passage into the Smudge Citadel.');
  K('cookbook', 'Pulp Cookbook', ['book', '#e8506a'], 'Chef Pulp\'s recipes. Now you know what pairs with what.');
  K('recipe_note', 'Scrawled Recipe', ['scroll', '#f5c02e'], 'A half-legible note about a legendary roast.');
  for (var s = 1; s <= 7; s++) {
    K('seal' + s, 'Seal of the Crown ' + ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'][s - 1], ['seal', '#ffe066', '#c8963c'],
      'One of the seven torn seals of the Origami Crown.');
  }
  K('crown_core', 'Crown Core', ['crown', '#ffd24a'], 'The heart of the Origami Crown, still warm.');

  /* ---- recipes ---------------------------------------------------------- */
  /* [a, b] -> result. Order does not matter. */
  var RECIPES = [
    ['pulpberry', 'reamcake', 'foldcake'],
    ['emberpod', 'reamcake', 'emberstew'],
    ['frostnut', 'inktea', 'glacierjelly'],
    ['grandfeast', 'foldroll', 'sovereignroast'],
    ['creambun', 'honeyleaf', 'twicefolded'],
    ['inktea', 'deeproot', 'inkespresso'],
    ['honeyleaf', 'swiftdraft', 'paperplanepie'],
    ['sealwater', 'grandfeast', 'sevenlayer'],
    ['pulpberry', 'honeyleaf', 'foldroll'],
    ['reamcake', 'reamcake', 'creambun'],
    ['inktea', 'inktea', 'deeproot'],
    ['antidote', 'drycloth', 'tonicwash'],
    ['wadbomb', 'wadbomb', 'bigwadbomb'],
    ['wadbomb', 'emberpod', 'shreddisc'],
    ['lifeleaf', 'grandfeast', 'lastpage'],
    ['mysterywad', 'mysterywad', 'grandfeast'],
    ['boldbrew', 'ironsheet', 'mirrorfoil'],
    ['deeproot', 'sealwater', 'sevenlayer'],
    ['pulpberry', 'venomvial', 'antidote'],
    ['frostnut', 'emberpod', 'thunderrag']
  ];

  function cook(a, b) {
    for (var i = 0; i < RECIPES.length; i++) {
      var r = RECIPES[i];
      if ((r[0] === a && r[1] === b) || (r[0] === b && r[1] === a)) return r[2];
    }
    return 'burntoffering';
  }

  function get(id) { return db[id]; }
  function all() { return db; }
  function isKey(id) { return db[id] && db[id].type === 'key'; }
  function list(type) {
    var out = [];
    for (var k in db) if (!type || db[k].type === type) out.push(db[k]);
    return out;
  }

  return { get: get, all: all, list: list, isKey: isKey, drawIcon: drawIcon, cook: cook, RECIPES: RECIPES, ICON: ICON };
})();

/* ===== 07_badges.js ===== */
/* ==========================================================================
   PAPERBOUND — 07_badges.js
   52 badges. Two kinds:
     kind:'move'    — unlocks an extra command in the hero's attack menus
     kind:'passive' — the battle engine reads `mod` keys directly
   `bp` is the Badge Point cost of wearing it.
   ========================================================================== */
'use strict';

PB.Badges = (function () {
  var db = {}, order = [];

  function B(id, name, bp, desc, o) {
    o = o || {};
    o.id = id; o.name = name; o.bp = bp; o.desc = desc;
    o.kind = o.kind || 'passive';
    o.color = o.color || '#f5c02e';
    db[id] = o; order.push(id);
    return o;
  }

  /* ======================= attack badges ================================= */
  B('powerstomp', 'Power Stomp', 2, 'Adds Power Stomp: a heavier landing that deals 2 extra damage.',
    { kind: 'move', color: '#e0483c', move: 'stomp_power', slot: 'stomp' });
  B('multibounce', 'Multibounce', 2, 'Adds Multibounce: chain-hop across every grounded foe.',
    { kind: 'move', color: '#e0483c', move: 'stomp_multi', slot: 'stomp' });
  B('sleepystomp', 'Sleepy Stomp', 2, 'Adds Sleepy Stomp: a lullaby landing that may put a foe to sleep.',
    { kind: 'move', color: '#8a5fc0', move: 'stomp_sleep', slot: 'stomp' });
  B('dizzystomp', 'Dizzy Stomp', 2, 'Adds Dizzy Stomp: rattles a foe until it staggers.',
    { kind: 'move', color: '#f5c02e', move: 'stomp_dizzy', slot: 'stomp' });
  B('piercestomp', 'Pin Stomp', 3, 'Adds Pin Stomp: drives straight through a foe\'s defence.',
    { kind: 'move', color: '#57b8ea', move: 'stomp_pierce', slot: 'stomp' });
  B('tornadostomp', 'Updraft Stomp', 3, 'Adds Updraft Stomp: knocks every flying foe out of the air.',
    { kind: 'move', color: '#8fd0f0', move: 'stomp_tornado', slot: 'stomp' });
  B('springstomp', 'Spring Stomp', 4, 'Adds Spring Stomp: three rising hops, each stronger than the last.',
    { kind: 'move', color: '#8fcf52', move: 'stomp_spring', slot: 'stomp' });

  B('powermallet', 'Power Mallet', 2, 'Adds Power Mallet: a two-handed swing for 2 extra damage.',
    { kind: 'move', color: '#a9713f', move: 'mallet_power', slot: 'mallet' });
  B('quakemallet', 'Quake Mallet', 3, 'Adds Quake Mallet: shakes the stage and hits every grounded foe.',
    { kind: 'move', color: '#a9713f', move: 'mallet_quake', slot: 'mallet' });
  B('firemallet', 'Ember Mallet', 3, 'Adds Ember Mallet: a burning strike that sets paper alight.',
    { kind: 'move', color: '#ff7a2e', move: 'mallet_fire', slot: 'mallet' });
  B('icemallet', 'Frost Mallet', 3, 'Adds Frost Mallet: a chilling strike that can freeze a foe solid.',
    { kind: 'move', color: '#9fd8f0', move: 'mallet_ice', slot: 'mallet' });
  B('shrinkmallet', 'Shrink Mallet', 3, 'Adds Shrink Mallet: flattens a foe so its attacks lose their bite.',
    { kind: 'move', color: '#c8a2e8', move: 'mallet_shrink', slot: 'mallet' });
  B('piercemallet', 'Wedge Mallet', 3, 'Adds Wedge Mallet: ignores defence entirely.',
    { kind: 'move', color: '#6f7a8c', move: 'mallet_pierce', slot: 'mallet' });
  B('spinslam', 'Spin Slam', 5, 'Adds Spin Slam: three furious swings at a single foe.',
    { kind: 'move', color: '#e0483c', move: 'mallet_spin', slot: 'mallet' });
  B('creasecutter', 'Crease Cutter', 4, 'Adds Crease Cutter: a slicing arc that halves a foe\'s defence.',
    { kind: 'move', color: '#cfd6de', move: 'mallet_crease', slot: 'mallet' });

  /* ======================= stat passives ================================= */
  B('powerplus', 'Power Plus', 6, 'Every attack you make deals 1 extra damage.', { mod: { atk: 1 }, color: '#e0483c' });
  B('powerplus2', 'Power Plus P', 6, 'Your partner\'s attacks deal 1 extra damage.', { mod: { atkP: 1 }, color: '#e0483c' });
  B('defendplus', 'Defend Plus', 6, 'Reduces all damage you take by 1.', { mod: { def: 1 }, color: '#57b8ea' });
  B('defendplus2', 'Defend Plus P', 6, 'Reduces all damage your partner takes by 1.', { mod: { defP: 1 }, color: '#57b8ea' });
  B('hpplus', 'HP Plus', 3, 'Raises maximum HP by 5.', { mod: { maxHp: 5 }, color: '#f07a8a' });
  B('fpplus', 'FP Plus', 3, 'Raises maximum FP by 5.', { mod: { maxFp: 5 }, color: '#8fcf52' });
  B('hpplusp', 'HP Plus P', 3, 'Raises your partner\'s maximum HP by 5.', { mod: { maxHpP: 5 }, color: '#f07a8a' });
  B('happyheart', 'Happy Heart', 3, 'Recover 1 HP at the end of each of your turns.', { mod: { regenHp: 1 }, color: '#f07a8a' });
  B('happyflower', 'Happy Flower', 3, 'Recover 1 FP at the end of each of your turns.', { mod: { regenFp: 1 }, color: '#8fcf52' });
  B('happyseal', 'Happy Seal', 4, 'Recover a little Seal Energy each turn.', { mod: { regenSp: 20 }, color: '#ffe066' });
  B('flowersaver', 'Flower Saver', 4, 'Every move costs 1 less FP, to a minimum of 1.', { mod: { fpDiscount: 1 }, color: '#8fcf52' });
  B('flowersaverp', 'Flower Saver P', 4, 'Your partner\'s moves cost 1 less FP.', { mod: { fpDiscountP: 1 }, color: '#8fcf52' });

  /* ======================= risk / reward ================================= */
  B('powerrush', 'Power Rush', 2, 'While you are at 5 HP or less, your attacks deal 3 extra damage.', { mod: { powerRush: 3 }, color: '#e0483c' });
  B('megarush', 'Mega Rush', 1, 'While you are at exactly 1 HP, your attacks deal 6 extra damage.', { mod: { megaRush: 6 }, color: '#c8443c' });
  B('laststand', 'Last Stand', 2, 'While you are at 5 HP or less, incoming damage is halved.', { mod: { lastStand: 1 }, color: '#57b8ea' });
  B('closecall', 'Close Call', 2, 'While you are at 5 HP or less, foes often miss you outright.', { mod: { closeCall: .35 }, color: '#8fd0f0' });
  B('allornothing', 'All or Nothing', 4, 'Perfect action commands add 2 damage. Anything less deals none at all.', { mod: { allOrNothing: 2 }, color: '#f5c02e' });
  B('fragilefold', 'Fragile Fold', 0, 'You take double damage, but earn 50% more Seal Points.', { mod: { fragile: 1, spBonus: .5 }, color: '#8a5fc0', challenge: true });
  B('featherweight', 'Featherweight', 0, 'All your attacks deal exactly 1 damage. Coins earned are doubled.', { mod: { featherweight: 1, coinBonus: 1 }, color: '#f5c02e', challenge: true });
  B('nofolding', 'Purist Crease', 0, 'Origami Forms are disabled, but you gain 2 extra BP.', { mod: { noForms: 1, bonusBp: 2 }, color: '#6f7a8c', challenge: true });

  /* ======================= defence / status ============================== */
  B('feelingfine', 'Feeling Fine', 4, 'You cannot be afflicted with any negative status.', { mod: { statusImmune: 1 }, color: '#7fe0d0' });
  B('feelingfinep', 'Feeling Fine P', 4, 'Your partner cannot be afflicted with any negative status.', { mod: { statusImmuneP: 1 }, color: '#7fe0d0' });
  B('spikeshield', 'Spike Shield', 2, 'Stomping a spiked foe no longer hurts you.', { mod: { spikeShield: 1 }, color: '#9aa3b0' });
  B('fireshield', 'Ember Shield', 2, 'Stomping a burning foe no longer hurts you.', { mod: { fireShield: 1 }, color: '#ff7a2e' });
  B('icepower', 'Ice Power', 2, 'You take no damage from frozen foes and deal 1 extra to them.', { mod: { icePower: 1 }, color: '#9fd8f0' });
  B('zaptap', 'Zap Tap', 4, 'Foes that touch you take 1 shock damage.', { mod: { zapTap: 1 }, color: '#ffe066' });
  B('returnpost', 'Return Postage', 3, 'Reflect a quarter of the damage you take back at the attacker.', { mod: { returnPost: .25 }, color: '#c8a2e8' });
  B('damagedodge', 'Damage Dodge', 2, 'A perfectly timed Guard reduces damage by 2 more.', { mod: { damageDodge: 2 }, color: '#57b8ea' });
  B('prettylucky', 'Pretty Lucky', 2, 'Foes sometimes miss you entirely.', { mod: { luck: .12 }, color: '#8fcf52' });
  B('luckyday', 'Lucky Day', 5, 'Foes miss you far more often.', { mod: { luck: .28 }, color: '#8fcf52' });

  /* ======================= technique ===================================== */
  B('charge', 'Charge', 2, 'Adds Charge to Tactics: bank 2 extra damage onto your next attack.',
    { kind: 'move', color: '#f5c02e', move: 'tac_charge', slot: 'tactics' });
  B('chargep', 'Charge P', 2, 'Adds Charge to your partner\'s Tactics.', { kind: 'move', color: '#f5c02e', move: 'tac_charge_p', slot: 'tacticsP' });
  B('doubledip', 'Double Dip', 3, 'Use two items in a single turn.', { mod: { itemsPerTurn: 2 }, color: '#f07a8a' });
  B('tripledip', 'Triple Dip', 6, 'Use three items in a single turn.', { mod: { itemsPerTurn: 3 }, color: '#f07a8a' });
  B('quickchange', 'Quick Change', 4, 'Swapping partners no longer uses up your turn.', { mod: { quickChange: 1 }, color: '#39b3a6' });
  B('deepfocus', 'Deep Focus', 1, 'Appeal restores considerably more Seal Energy.', { mod: { deepFocus: 40 }, color: '#ffe066' });
  B('stylishsavvy', 'Stylish Savvy', 2, 'Stylish finishes fill the Encore gauge twice as fast.', { mod: { stylish: 1 }, color: '#f07a8a' });
  B('crowdpleaser', 'Crowd Pleaser', 3, 'The audience grows twice as fast and throws twice as many gifts.', { mod: { crowd: 1 }, color: '#e8506a' });
  B('origamiadept', 'Origami Adept', 3, 'Origami Forms cost 2 less FP and last one turn longer.', { mod: { formDiscount: 2, formTurns: 1 }, color: '#57b8ea' });
  B('firststrike', 'First Strike', 3, 'Hitting a foe in the field before battle deals double first-strike damage.', { mod: { firstStrike: 1 }, color: '#e0483c' });
  B('timingtutor', 'Timing Tutor', 1, 'Shows a hint bar for every action command.', { mod: { tutor: 1 }, color: '#8fd0f0' });
  B('peekaboo', 'Peekaboo', 3, 'Shows each foe\'s remaining HP in battle.', { mod: { peekaboo: 1 }, color: '#c8a2e8' });

  /* ======================= economy ======================================= */
  B('payoff', 'Pay-Off', 2, 'Foes drop a coin whenever you damage them.', { mod: { payoff: 1 }, color: '#f5c02e' });
  B('refund', 'Refund', 3, 'Recover 75% of an item\'s value in coins when you use it.', { mod: { refund: .75 }, color: '#f5c02e' });
  B('runawaypay', 'Runaway Pay', 2, 'Fleeing no longer costs you Seal Points.', { mod: { runawayPay: 1 }, color: '#8fcf52' });
  B('moneymoney', 'Money Money', 4, 'Coins found in the field are worth double.', { mod: { coinBonus: 1 }, color: '#f5c02e' });
  B('itemhunter', 'Item Hunter', 3, 'Foes drop items far more often.', { mod: { dropRate: 1 }, color: '#8fcf52' });
  B('sealseeker', 'Seal Seeker', 3, 'Earn 25% more Seal Points from every battle.', { mod: { spBonus: .25 }, color: '#ffe066' });

  function get(id) { return db[id]; }
  function all() { return db; }
  function list() { return order.map(function (k) { return db[k]; }); }

  /* Sum every `mod` key across a set of equipped badge ids. */
  function mods(ids) {
    var m = {};
    for (var i = 0; i < ids.length; i++) {
      var b = db[ids[i]];
      if (!b || !b.mod) continue;
      for (var k in b.mod) m[k] = (m[k] || 0) + b.mod[k];
    }
    return m;
  }
  function movesFrom(ids, slot) {
    var out = [];
    for (var i = 0; i < ids.length; i++) {
      var b = db[ids[i]];
      if (b && b.kind === 'move' && b.slot === slot) out.push(b.move);
    }
    return out;
  }
  function cost(ids) {
    var t = 0;
    for (var i = 0; i < ids.length; i++) if (db[ids[i]]) t += db[ids[i]].bp;
    return t;
  }

  return { get: get, all: all, list: list, mods: mods, movesFrom: movesFrom, cost: cost };
})();

/* ===== 08_moves.js ===== */
/* ==========================================================================
   PAPERBOUND — 08_moves.js
   Hero attacks, Origami Forms, Seal Powers, partner abilities and duets.

   cmd.type is one of: press | mash | charge | multi | seq | aim | hold |
                       rotate | none
   target: oneAny | oneGround | oneAir | front | allGround | allAir | all |
           self | ally | party
   ========================================================================== */
'use strict';

PB.Moves = (function () {
  var db = {};
  function M(id, o) { o.id = id; db[id] = o; return o; }

  /* ============================ HERO : STOMP ============================= */
  /* Stomp is the flexible option: reaches airborne foes, but a spiked or
     burning top punishes you for landing on it. */
  M('stomp', {
    name: 'Stomp', cat: 'stomp', fp: 0, target: 'oneAny', power: [1, 2, 3], hits: 2,
    contact: 'top', element: 'blunt',
    cmd: { type: 'press', dur: 46, good: [0.62, 0.86], perfect: [0.72, 0.80] },
    desc: 'Two quick hops on a single foe. Reaches anything in the air.'
  });
  M('stomp_power', {
    name: 'Power Stomp', cat: 'stomp', fp: 2, target: 'oneAny', power: [3, 4, 5], hits: 1,
    contact: 'top', element: 'blunt',
    cmd: { type: 'charge', dur: 70, zone: [0.68, 0.92] },
    desc: 'Wind up, then drop with everything you have.'
  });
  M('stomp_multi', {
    name: 'Multibounce', cat: 'stomp', fp: 2, target: 'allGround', power: [1, 2, 3], hits: 1, chain: true,
    contact: 'top', element: 'blunt',
    cmd: { type: 'multi', n: 6, spacing: 24 },
    desc: 'Bounce from foe to foe. Keep the rhythm and the chain keeps going.'
  });
  M('stomp_sleep', {
    name: 'Sleepy Stomp', cat: 'stomp', fp: 2, target: 'oneAny', power: [1, 2, 2], hits: 1,
    contact: 'top', element: 'blunt', status: { type: 'sleep', chance: .6, turns: 3 },
    cmd: { type: 'hold', dur: 78, width: .2 },
    desc: 'A slow, lulling landing. Often puts the foe to sleep.'
  });
  M('stomp_dizzy', {
    name: 'Dizzy Stomp', cat: 'stomp', fp: 2, target: 'oneAny', power: [1, 2, 3], hits: 1,
    contact: 'top', element: 'blunt', status: { type: 'dizzy', chance: .65, turns: 3 },
    cmd: { type: 'rotate', dur: 66, target: 14 },
    desc: 'Spin the foe like a top until it cannot aim straight.'
  });
  M('stomp_pierce', {
    name: 'Pin Stomp', cat: 'stomp', fp: 3, target: 'oneAny', power: [2, 3, 4], hits: 1,
    contact: 'top', element: 'blunt', pierce: true,
    cmd: { type: 'aim', dur: 110, speed: .026, zone: .17 },
    desc: 'Land on the one crease that defence cannot cover.'
  });
  M('stomp_tornado', {
    name: 'Updraft Stomp', cat: 'stomp', fp: 3, target: 'allAir', power: [2, 3, 4], hits: 1,
    contact: 'none', element: 'wind', ground: true,
    cmd: { type: 'mash', dur: 66, need: 18 },
    desc: 'Whip up a gust that drags every flier to the floor.'
  });
  M('stomp_spring', {
    name: 'Spring Stomp', cat: 'stomp', fp: 4, target: 'oneAny', power: [1, 2, 3], hits: 3, escalate: 1,
    contact: 'top', element: 'blunt',
    cmd: { type: 'multi', n: 3, spacing: 30, rising: true },
    desc: 'Three rising hops, each one harder than the last.'
  });

  /* ============================ HERO : MALLET ============================ */
  /* Mallet only reaches the front grounded foe, but it hits far harder and
     spikes on top cannot punish it. */
  M('mallet', {
    name: 'Mallet', cat: 'mallet', fp: 0, target: 'front', power: [2, 3, 4], hits: 1,
    contact: 'side', element: 'blunt',
    cmd: { type: 'charge', dur: 62, zone: [0.7, 0.95] },
    desc: 'A solid swing at whatever is standing closest.'
  });
  M('mallet_power', {
    name: 'Power Mallet', cat: 'mallet', fp: 2, target: 'front', power: [4, 5, 6], hits: 1,
    contact: 'side', element: 'blunt',
    cmd: { type: 'charge', dur: 80, zone: [0.76, 0.94] },
    desc: 'Both hands, full arc. Hold the swing to the very edge.'
  });
  M('mallet_quake', {
    name: 'Quake Mallet', cat: 'mallet', fp: 3, target: 'allGround', power: [2, 3, 4], hits: 1,
    contact: 'none', element: 'blunt',
    cmd: { type: 'mash', dur: 72, need: 20 },
    desc: 'Hammer the stage until every grounded foe loses its footing.'
  });
  M('mallet_fire', {
    name: 'Ember Mallet', cat: 'mallet', fp: 3, target: 'front', power: [3, 4, 5], hits: 1,
    contact: 'side', element: 'fire', status: { type: 'burn', chance: .7, turns: 3 },
    cmd: { type: 'mash', dur: 60, need: 16 },
    desc: 'Friction lights the head of the hammer. Paper does not like it.'
  });
  M('mallet_ice', {
    name: 'Frost Mallet', cat: 'mallet', fp: 3, target: 'front', power: [3, 4, 5], hits: 1,
    contact: 'side', element: 'ice', status: { type: 'freeze', chance: .55, turns: 2 },
    cmd: { type: 'hold', dur: 80, width: .18 },
    desc: 'Draw the cold in slowly, then let it out all at once.'
  });
  M('mallet_shrink', {
    name: 'Shrink Mallet', cat: 'mallet', fp: 3, target: 'front', power: [2, 3, 3], hits: 1,
    contact: 'side', element: 'blunt', status: { type: 'shrink', chance: .7, turns: 4 },
    cmd: { type: 'seq', n: 4 },
    desc: 'Flatten a foe until its attacks barely land.'
  });
  M('mallet_pierce', {
    name: 'Wedge Mallet', cat: 'mallet', fp: 3, target: 'front', power: [3, 4, 5], hits: 1,
    contact: 'side', element: 'blunt', pierce: true,
    cmd: { type: 'aim', dur: 120, speed: .028, zone: .15 },
    desc: 'Find the seam. Defence stops mattering.'
  });
  M('mallet_spin', {
    name: 'Spin Slam', cat: 'mallet', fp: 5, target: 'front', power: [2, 3, 4], hits: 3,
    contact: 'side', element: 'blunt',
    cmd: { type: 'rotate', dur: 84, target: 20 },
    desc: 'Three revolutions, three impacts, one very flat foe.'
  });
  M('mallet_crease', {
    name: 'Crease Cutter', cat: 'mallet', fp: 4, target: 'front', power: [3, 4, 5], hits: 1,
    contact: 'side', element: 'cut', status: { type: 'crumple', chance: .8, turns: 4 },
    cmd: { type: 'press', dur: 38, good: [0.66, 0.88], perfect: [0.75, 0.82] },
    desc: 'A clean slice down the fold line. Halves what it does not cut.'
  });

  /* ============================ ORIGAMI FORMS ============================
     The signature system. Folding costs FP up front and reshapes what Pip
     is for a few turns — a standing trade rather than a one-off attack. */
  M('form_crane', {
    name: 'Crane Form', cat: 'form', fp: 4, target: 'self', turns: 3,
    form: { id: 'crane', evade: .5, counter: 2, atk: 0, def: 0 },
    cmd: { type: 'seq', n: 3 },
    desc: 'Fold into a crane. Half of all attacks miss, and each miss counters for 2.'
  });
  M('form_fortress', {
    name: 'Fortress Form', cat: 'form', fp: 4, target: 'self', turns: 3,
    form: { id: 'fortress', def: 3, atk: -1, thorns: 1 },
    cmd: { type: 'mash', dur: 60, need: 14 },
    desc: 'Fold into a block. Defence +3 and attackers take 1, but your attacks soften.'
  });
  M('form_dart', {
    name: 'Dart Form', cat: 'form', fp: 5, target: 'self', turns: 3,
    form: { id: 'dart', atk: 2, def: -2, pierce: true },
    cmd: { type: 'charge', dur: 72, zone: [0.72, 0.94] },
    desc: 'Fold into a dart. Attack +2 and every hit pierces, but you crumple easily.'
  });
  M('form_lantern', {
    name: 'Lantern Form', cat: 'form', fp: 6, target: 'self', turns: 4,
    form: { id: 'lantern', regen: 3, regenParty: 2, light: true },
    cmd: { type: 'hold', dur: 90, width: .22 },
    desc: 'Fold into a lantern. You and your partner recover HP every turn.'
  });
  M('form_shear', {
    name: 'Shear Form', cat: 'form', fp: 6, target: 'self', turns: 3,
    form: { id: 'shear', atk: 1, extraHit: 1, element: 'cut' },
    cmd: { type: 'rotate', dur: 78, target: 18 },
    desc: 'Fold into shears. Every attack strikes twice and cuts clean.'
  });
  M('form_unfold', {
    name: 'Unfold', cat: 'form', fp: 0, target: 'self',
    unfold: true, cmd: { type: 'none' },
    desc: 'Return to your ordinary shape at once.'
  });

  /* ============================ SEAL POWERS ==============================
     Fuelled by Seal Energy (SE). 100 SE = one wedge on the gauge. */
  M('seal_refold', {
    name: 'Refold', cat: 'seal', se: 100, target: 'party',
    heal: { hp: 10 }, cmd: { type: 'mash', dur: 60, need: 16 },
    desc: 'Smooth out the creases. Restores 10 HP to you and your partner.'
  });
  M('seal_ember', {
    name: 'Emberseal', cat: 'seal', se: 100, target: 'all', power: 4, element: 'fire',
    status: { type: 'burn', chance: .5, turns: 3 },
    cmd: { type: 'press', dur: 44, good: [0.6, 0.88], perfect: [0.71, 0.8] },
    desc: 'A ring of controlled fire. 4 damage to every foe.'
  });
  M('seal_tidewash', {
    name: 'Tidewash', cat: 'seal', se: 200, target: 'party',
    heal: { hp: 8, cureAll: true }, cmd: { type: 'hold', dur: 84, width: .24 },
    desc: 'A clean rinse. Restores 8 HP and washes off every ailment.'
  });
  M('seal_kerf', {
    name: 'Kerfstrike', cat: 'seal', se: 200, target: 'oneAny', power: 10, pierce: true, element: 'cut',
    cmd: { type: 'aim', dur: 130, speed: .03, zone: .16 },
    desc: 'One perfect cut. 10 damage that no defence can blunt.'
  });
  M('seal_redaction', {
    name: 'Redaction', cat: 'seal', se: 200, target: 'all',
    status: { type: 'silence', chance: 1, turns: 3 }, debuff: { def: -2, turns: 3 },
    cmd: { type: 'seq', n: 5 },
    desc: 'Black out their playbook. Foes lose their special moves and 2 Defence.'
  });
  M('seal_glacier', {
    name: 'Glacial Press', cat: 'seal', se: 300, target: 'all', power: 6, element: 'ice',
    status: { type: 'freeze', chance: .7, turns: 2 },
    cmd: { type: 'rotate', dur: 90, target: 22 },
    desc: 'Press the whole stage flat under ice. 6 damage and a deep freeze.'
  });
  M('seal_blank', {
    name: 'Blank Slate', cat: 'seal', se: 300, target: 'field',
    blankSlate: true, cmd: { type: 'multi', n: 5, spacing: 22 },
    desc: 'Wipe the page. Clears every buff on the field, heals 15 HP/FP and fills the Encore gauge.'
  });

  /* ============================ TACTICS ================================== */
  M('tac_defend', { name: 'Defend', cat: 'tactic', fp: 0, target: 'self', defend: true, cmd: { type: 'none' }, desc: 'Brace. Halves damage this turn.' });
  M('tac_appeal', { name: 'Appeal', cat: 'tactic', fp: 0, target: 'self', appeal: true, cmd: { type: 'none' }, desc: 'Play to the crowd for Seal Energy and applause.' });
  M('tac_swap', { name: 'Swap', cat: 'tactic', fp: 0, target: 'self', swap: true, cmd: { type: 'none' }, desc: 'Bring out a different partner.' });
  M('tac_run', { name: 'Run', cat: 'tactic', fp: 0, target: 'self', run: true, cmd: { type: 'mash', dur: 60, need: 18 }, desc: 'Try to leave. Costs Seal Points.' });
  M('tac_charge', { name: 'Charge', cat: 'tactic', fp: 2, target: 'self', buff: { type: 'charge', amt: 2, turns: 99 }, cmd: { type: 'charge', dur: 66, zone: [0.7, 0.95] }, desc: 'Bank 2 extra damage onto your next attack.' });
  M('tac_charge_p', { name: 'Charge', cat: 'tactic', fp: 2, target: 'self', buff: { type: 'charge', amt: 2, turns: 99 }, cmd: { type: 'charge', dur: 66, zone: [0.7, 0.95] }, desc: 'Bank 2 extra damage onto your partner\'s next attack.' });

  /* ============================ PARTNERS ================================= */
  /* rank 1 moves are available immediately; rank 2/3 unlock with Foil Shards. */

  // --- Twigby (Sprout) -------------------------------------------------
  M('tw_bonk', {
    name: 'Bonk', cat: 'partner', fp: 0, target: 'front', power: [2, 3, 4], hits: 1, rank: 1,
    contact: 'side', element: 'blunt',
    cmd: { type: 'press', dur: 44, good: [0.6, 0.86], perfect: [0.7, 0.79] },
    desc: 'A blunt little headbutt. Costs nothing.'
  });
  M('tw_study', {
    name: 'Study', cat: 'partner', fp: 0, target: 'oneAny', rank: 1, tattle: true,
    cmd: { type: 'none' },
    desc: 'Read a foe aloud: HP, Attack, Defence and its weak points.'
  });
  M('tw_thornshot', {
    name: 'Thornshot', cat: 'partner', fp: 3, target: 'oneAny', power: [4, 5, 6], hits: 1, rank: 2,
    pierce: true, element: 'cut',
    cmd: { type: 'aim', dur: 110, speed: .026, zone: .18 },
    desc: 'Fires a seed-thorn that slips past armour.'
  });
  M('tw_rootsnare', {
    name: 'Root Snare', cat: 'partner', fp: 4, target: 'allGround', power: [2, 3, 3], hits: 1, rank: 3,
    status: { type: 'tangled', chance: .6, turns: 2 },
    cmd: { type: 'mash', dur: 70, need: 20 },
    desc: 'Roots burst through the stage and bind everything standing on it.'
  });

  // --- Lumen ------------------------------------------------------------
  M('lu_flare', {
    name: 'Flare', cat: 'partner', fp: 0, target: 'oneAny', power: [2, 3, 4], hits: 1, rank: 1,
    element: 'fire',
    cmd: { type: 'press', dur: 42, good: [0.62, 0.88], perfect: [0.72, 0.81] },
    desc: 'A short, bright burst of flame. Reaches fliers.'
  });
  M('lu_kindle', {
    name: 'Kindle', cat: 'partner', fp: 2, target: 'ally', rank: 1,
    buff: { type: 'atkUp', amt: 2, turns: 3 },
    cmd: { type: 'hold', dur: 72, width: .24 },
    desc: 'Warms an ally up. Attack +2 for three turns.'
  });
  M('lu_sunburst', {
    name: 'Sunburst', cat: 'partner', fp: 4, target: 'all', power: [3, 4, 5], hits: 1, rank: 2,
    element: 'fire', status: { type: 'burn', chance: .5, turns: 3 },
    cmd: { type: 'charge', dur: 76, zone: [0.72, 0.95] },
    desc: 'Flares out in every direction. Burns the whole stage.'
  });
  M('lu_beacon', {
    name: 'Beacon', cat: 'partner', fp: 5, target: 'party', rank: 3,
    heal: { hp: 10, cureAll: true },
    cmd: { type: 'multi', n: 4, spacing: 26 },
    desc: 'A steady light. Heals 10 HP and clears every ailment.'
  });

  // --- Bloop ------------------------------------------------------------
  M('bl_splash', {
    name: 'Splash', cat: 'partner', fp: 0, target: 'oneAny', power: [2, 3, 4], hits: 1, rank: 1,
    element: 'water', status: { type: 'soggy', chance: .4, turns: 3 },
    cmd: { type: 'press', dur: 44, good: [0.6, 0.86], perfect: [0.7, 0.79] },
    desc: 'A well-aimed slap of water. Soggy foes hit softer.'
  });
  M('bl_bubble', {
    name: 'Bubble Shield', cat: 'partner', fp: 3, target: 'ally', rank: 1,
    buff: { type: 'defUp', amt: 3, turns: 3 },
    cmd: { type: 'hold', dur: 80, width: .22 },
    desc: 'Wraps an ally in a bubble. Defence +3 for three turns.'
  });
  M('bl_tidalroll', {
    name: 'Tidal Roll', cat: 'partner', fp: 4, target: 'all', power: [3, 4, 5], hits: 1, rank: 2,
    element: 'water', status: { type: 'soggy', chance: .7, turns: 3 },
    cmd: { type: 'rotate', dur: 76, target: 18 },
    desc: 'Rolls the whole stage under a wave.'
  });
  M('bl_deluge', {
    name: 'Deluge', cat: 'partner', fp: 6, target: 'all', power: [5, 6, 7], hits: 1, rank: 3,
    element: 'water', douse: true,
    cmd: { type: 'mash', dur: 80, need: 24 },
    desc: 'A wall of water. Snuffs out anything burning, foe or field.'
  });

  // --- Snip -------------------------------------------------------------
  M('sn_snip', {
    name: 'Snip Snip', cat: 'partner', fp: 0, target: 'front', power: [2, 3, 4], hits: 2, rank: 1,
    element: 'cut', halveDef: true,
    cmd: { type: 'multi', n: 2, spacing: 26 },
    desc: 'Two quick cuts that shear a foe\'s defence in half for the turn.'
  });
  M('sn_ribbon', {
    name: 'Ribbon Whirl', cat: 'partner', fp: 3, target: 'all', power: [2, 3, 3], hits: 2, rank: 1,
    element: 'cut',
    cmd: { type: 'rotate', dur: 70, target: 16 },
    desc: 'Spins on the spot, catching every foe twice.'
  });
  M('sn_confetti', {
    name: 'Confetti Cut', cat: 'partner', fp: 4, target: 'oneAny', power: [5, 6, 7], hits: 1, rank: 2,
    element: 'cut', status: { type: 'poison', chance: .6, turns: 4 },
    cmd: { type: 'seq', n: 4 },
    desc: 'A hundred tiny cuts. The paper keeps fraying afterwards.'
  });
  M('sn_curtain', {
    name: 'Curtain Call', cat: 'partner', fp: 6, target: 'all', power: [4, 5, 6], hits: 1, rank: 3,
    element: 'cut', status: { type: 'crumple', chance: .8, turns: 4 },
    cmd: { type: 'charge', dur: 84, zone: [0.74, 0.96] },
    desc: 'Brings the curtain down on everyone. Defence falls with it.'
  });

  // --- Margo ------------------------------------------------------------
  M('mg_footnote', {
    name: 'Footnote', cat: 'partner', fp: 0, target: 'oneAny', power: [2, 3, 4], hits: 1, rank: 1,
    pierce: true,
    cmd: { type: 'press', dur: 40, good: [0.64, 0.88], perfect: [0.73, 0.81] },
    desc: 'A small correction, delivered at speed. Ignores defence.'
  });
  M('mg_annotate', {
    name: 'Annotate', cat: 'partner', fp: 2, target: 'oneAny', rank: 1,
    debuff: { def: -2, vuln: 2, turns: 4 },
    cmd: { type: 'seq', n: 3 },
    desc: 'Marks a foe up. Defence -2, and it takes 2 extra damage from everything.'
  });
  M('mg_redline', {
    name: 'Redline', cat: 'partner', fp: 4, target: 'oneAny', power: [5, 6, 7], hits: 1, rank: 2,
    status: { type: 'silence', chance: .8, turns: 3 },
    cmd: { type: 'aim', dur: 116, speed: .028, zone: .17 },
    desc: 'Strikes a foe\'s best move off the page.'
  });
  M('mg_index', {
    name: 'Index', cat: 'partner', fp: 6, target: 'all', power: [3, 4, 5], hits: 1, rank: 3,
    status: { type: 'inked', chance: .8, turns: 3 },
    cmd: { type: 'mash', dur: 78, need: 22 },
    desc: 'Files every foe under "blinded".'
  });

  // --- Volt -------------------------------------------------------------
  M('vo_sparker', {
    name: 'Sparker', cat: 'partner', fp: 0, target: 'oneAny', power: [2, 3, 4], hits: 1, rank: 1,
    element: 'shock',
    cmd: { type: 'mash', dur: 46, need: 12 },
    desc: 'A crackling jolt. Reaches anything, grounded or not.'
  });
  M('vo_overclock', {
    name: 'Overclock', cat: 'partner', fp: 3, target: 'ally', rank: 1,
    buff: { type: 'charge', amt: 4, turns: 99 },
    cmd: { type: 'rotate', dur: 72, target: 18 },
    desc: 'Winds an ally up. Their next attack deals 4 extra damage.'
  });
  M('vo_chain', {
    name: 'Chain Lightning', cat: 'partner', fp: 4, target: 'all', power: [3, 4, 5], hits: 1, rank: 2,
    element: 'shock', pierce: true,
    cmd: { type: 'seq', n: 5 },
    desc: 'Arcs between every foe on the stage, straight through armour.'
  });
  M('vo_magnet', {
    name: 'Magnet Pull', cat: 'partner', fp: 5, target: 'all', power: [3, 4, 4], hits: 1, rank: 3,
    element: 'shock', ground: true, status: { type: 'dizzy', chance: .5, turns: 2 },
    cmd: { type: 'hold', dur: 88, width: .2 },
    desc: 'Drags every flier to the floor and rattles the lot of them.'
  });

  /* ============================ DUETS (Encore) ===========================
     Unleashed when the Encore gauge fills. One per partner. */
  M('duet_twigby', {
    name: 'Duet: Thicket Bloom', cat: 'duet', target: 'all', power: 10, element: 'cut', pierce: true,
    status: { type: 'tangled', chance: .8, turns: 2 },
    cmd: { type: 'mash', dur: 100, need: 30 },
    desc: 'Pip plants, Twigby grows: the whole stage erupts in thorns.'
  });
  M('duet_lumen', {
    name: 'Duet: Solar Fold', cat: 'duet', target: 'all', power: 12, element: 'fire',
    status: { type: 'burn', chance: .9, turns: 4 },
    cmd: { type: 'charge', dur: 110, zone: [0.8, 0.98] },
    desc: 'Pip folds a mirror; Lumen fills it with the sun.'
  });
  M('duet_bloop', {
    name: 'Duet: Full Fathom', cat: 'duet', target: 'all', power: 11, element: 'water',
    status: { type: 'soggy', chance: 1, turns: 4 }, douse: true,
    cmd: { type: 'rotate', dur: 108, target: 30 },
    desc: 'The stage floods to the rafters and drains in one breath.'
  });
  M('duet_snip', {
    name: 'Duet: Paper Chain', cat: 'duet', target: 'all', power: 6, hits: 3, element: 'cut',
    cmd: { type: 'multi', n: 8, spacing: 18 },
    desc: 'A chain of cut-out dancers whirls through the whole line-up.'
  });
  M('duet_margo', {
    name: 'Duet: Full Revision', cat: 'duet', target: 'all', power: 13, pierce: true,
    status: { type: 'silence', chance: 1, turns: 4 }, debuff: { def: -3, turns: 4 },
    cmd: { type: 'seq', n: 8 },
    desc: 'Margo rewrites the scene and Pip staples it shut.'
  });
  M('duet_volt', {
    name: 'Duet: Grand Circuit', cat: 'duet', target: 'all', power: 12, element: 'shock', pierce: true,
    status: { type: 'dizzy', chance: .8, turns: 3 }, ground: true,
    cmd: { type: 'hold', dur: 120, width: .16 },
    desc: 'Volt closes the loop; Pip is the conductor.'
  });

  function get(id) { return db[id]; }
  function all() { return db; }
  /* Power scales with hero rank (1..3) or partner rank. */
  function power(move, rank) {
    if (move.power === undefined) return 0;
    if (typeof move.power === 'number') return move.power;
    return move.power[Math.max(0, Math.min(move.power.length - 1, (rank || 1) - 1))];
  }

  return { get: get, all: all, power: power };
})();

/* ===== 09_enemies.js ===== */
/* ==========================================================================
   PAPERBOUND — 09_enemies.js
   The bestiary. Every foe carries its own move table and a weighted AI.

   flags: ground | air | spiked (punishes stomps) | fiery (punishes contact)
          electric (punishes contact) | icy | slick (mallet slides off)
          ceiling | heavy (immune to ground/flip) | boss
   weak/resist/immune are element or status keys.
   ========================================================================== */
'use strict';

PB.Enemies = (function () {
  var db = {};

  /* Enemy move factory. */
  function m(name, power, o) {
    o = o || {};
    o.name = name; o.power = power;
    o.target = o.target || 'random';
    o.weight = o.weight === undefined ? 10 : o.weight;
    o.anim = o.anim || 'lunge';
    o.guardable = o.guardable !== false;
    return o;
  }

  function E(id, name, o) {
    o.id = id; o.name = name;
    o.sprite = o.sprite || id;
    o.flags = o.flags || ['ground'];
    o.weak = o.weak || []; o.resist = o.resist || []; o.immune = o.immune || [];
    o.moves = o.moves || [m('Tackle', o.atk)];
    o.tier = o.tier || 1;
    o.sp = o.sp === undefined ? Math.max(1, Math.round(o.hp * 0.6 + o.atk)) : o.sp;
    o.coins = o.coins === undefined ? Math.max(1, Math.round(o.tier * 1.6)) : o.coins;
    db[id] = o;
    return o;
  }

  var has = function (e, f) { return e.flags.indexOf(f) >= 0; };

  /* ===================== CHAPTER 1 — CREASEWOOD ========================== */
  E('snapleaf', 'Snapleaf', {
    tier: 1, hp: 6, atk: 2, def: 0, flags: ['ground'], weak: ['fire'], resist: ['water'],
    tattle: 'A Snapleaf. 6 HP, 2 Attack, no Defence. It only knows how to lunge, and it lunges very badly. Fire makes short work of it — it is, after all, a leaf.',
    moves: [m('Chomp', 2), m('Leaf Spin', 1, { hits: 2, weight: 6 })],
    drops: [['pulpberry', .3]]
  });
  E('thornhopper', 'Thornhopper', {
    tier: 1, hp: 7, atk: 2, def: 1, flags: ['ground', 'spiked'], weak: ['fire'],
    tattle: 'A Thornhopper. 7 HP, 2 Attack, 1 Defence, and a back full of thorns. Do not stomp it unless you enjoy regret — swing the mallet instead.',
    moves: [m('Thorn Hop', 2), m('Bramble Roll', 3, { weight: 5, telegraph: 'It curls up tight...' })],
    drops: [['honeyleaf', .25]]
  });
  E('barkbug', 'Barkbug', {
    tier: 1, hp: 9, atk: 2, def: 2, flags: ['ground', 'heavy'], weak: ['fire', 'shock'], resist: ['blunt'],
    tattle: 'A Barkbug. 9 HP, 2 Attack, and 2 Defence under all that bark. Blunt hits bounce off. Pierce it, cut it, or burn it.',
    moves: [m('Gore', 3), m('Shell Up', 0, { guard: 3, turns: 2, weight: 5, telegraph: 'It tucks into its bark.' })],
    drops: [['pulpberry', .2]]
  });
  E('mossback', 'Mossback', {
    tier: 1, hp: 12, atk: 1, def: 1, flags: ['ground'], weak: ['fire'], resist: ['water'], immune: ['poison'],
    tattle: 'A Mossback. 12 HP but only 1 Attack — it would much rather nap than fight. It regrows a little every turn, so finish it quickly.',
    moves: [m('Slump', 1), m('Photosynthesise', 0, { heal: 3, target: 'self', weight: 8, telegraph: 'It soaks up the light.' })],
    drops: [['antidote', .25]]
  });
  E('twigling', 'Twigling', {
    tier: 1, hp: 5, atk: 3, def: 0, flags: ['ground'], weak: ['fire'],
    tattle: 'A Twigling. Only 5 HP, but 3 Attack — brittle and mean. Take it out first or it will keep poking holes in you.',
    moves: [m('Twig Jab', 3), m('Rally', 0, { atkBuff: 1, target: 'allies', weight: 4, telegraph: 'It rattles its branches.' })],
    drops: [['pulpberry', .3]]
  });
  E('petalwisp', 'Petalwisp', {
    tier: 1, hp: 5, atk: 2, def: 0, flags: ['air'], weak: ['wind', 'shock'], resist: ['fire'],
    tattle: 'A Petalwisp, drifting well out of mallet range. 5 HP. Stomp it, shock it, or knock it down with a gust.',
    moves: [m('Pollen Puff', 2, { status: { type: 'sleep', chance: .3, turns: 2 } })],
    drops: [['honeyleaf', .3]]
  });

  /* ===================== CHAPTER 2 — EMBERFOLD =========================== */
  E('emberling', 'Emberling', {
    tier: 2, hp: 9, atk: 3, def: 0, flags: ['ground', 'fiery'], weak: ['water', 'ice'], immune: ['burn'],
    tattle: 'An Emberling. 9 HP, 3 Attack, and it is on fire, so touching it hurts. Douse it with water first and it becomes a very ordinary lump.',
    moves: [m('Singe', 3, { element: 'fire', status: { type: 'burn', chance: .4, turns: 3 } }), m('Flare Up', 4, { element: 'fire', weight: 5, telegraph: 'It flares white-hot!' })],
    drops: [['emberpod', .2]]
  });
  E('cinderfly', 'Cinderfly', {
    tier: 2, hp: 7, atk: 3, def: 0, flags: ['air', 'fiery'], weak: ['water', 'wind'], immune: ['burn'],
    tattle: 'A Cinderfly. 7 HP, airborne, and burning. Stomping it is a bad idea without an Ember Shield. Water clips its wings nicely.',
    moves: [m('Cinder Dive', 3, { element: 'fire' }), m('Ash Cloud', 1, { target: 'both', status: { type: 'inked', chance: .5, turns: 2 }, weight: 5 })],
    drops: [['drycloth', .25]]
  });
  E('ashgoyle', 'Ashgoyle', {
    tier: 2, hp: 14, atk: 4, def: 2, flags: ['ground', 'heavy'], weak: ['water', 'shock'], resist: ['fire'],
    tattle: 'An Ashgoyle. 14 HP, 4 Attack, 2 Defence. Slow, heavy, and entirely made of yesterday\'s fire. Water is its least favourite thing.',
    moves: [m('Slam', 4), m('Ash Breath', 3, { target: 'both', element: 'fire', weight: 6, telegraph: 'Soot gathers in its throat.' })],
    drops: [['ironsheet', .15]]
  });
  E('magmite', 'Magmite', {
    tier: 2, hp: 11, atk: 3, def: 1, flags: ['ground', 'fiery'], weak: ['water'], immune: ['burn', 'freeze'],
    tattle: 'A Magmite. 11 HP, 3 Attack, 1 Defence. It splits its own crust to throw at you. Soggy it and it stops splitting.',
    moves: [m('Crust Toss', 3, { element: 'fire' }), m('Molten Spit', 4, { element: 'fire', status: { type: 'burn', chance: .6, turns: 3 }, weight: 6 })],
    drops: [['emberpod', .2]]
  });
  E('wickling', 'Wickling', {
    tier: 2, hp: 8, atk: 2, def: 0, flags: ['ground', 'fiery'], weak: ['water', 'wind'], immune: ['burn'],
    tattle: 'A Wickling. 8 HP and a very short fuse — literally. When its wick burns down it detonates, so either finish it fast or put it out.',
    moves: [m('Wick Whip', 2, { element: 'fire' }), m('Burn Down', 7, { target: 'both', element: 'fire', selfKO: true, weight: 3, cond: 'lowhp', telegraph: 'Its wick is almost gone!' })],
    drops: [['drycloth', .3]]
  });
  E('slagmaw', 'Slagmaw', {
    tier: 2, hp: 16, atk: 4, def: 1, flags: ['ground', 'fiery'], weak: ['water', 'ice'], immune: ['burn'],
    tattle: 'A Slagmaw. 16 HP, 4 Attack. It swallows fire and spits it back out hotter. Bloop makes this fight considerably shorter.',
    moves: [m('Maul', 4, { hits: 2 }), m('Slag Spray', 3, { target: 'both', element: 'fire', status: { type: 'burn', chance: .5, turns: 3 }, weight: 7 })],
    drops: [['boldbrew', .15]]
  });

  /* ===================== CHAPTER 3 — SOGPORT ============================= */
  E('drizzler', 'Drizzler', {
    tier: 3, hp: 11, atk: 3, def: 0, flags: ['air'], weak: ['shock'], resist: ['water', 'fire'],
    tattle: 'A Drizzler. 11 HP, floats, and rains on everything. Shock travels beautifully through wet paper — ask Volt.',
    moves: [m('Downpour', 3, { target: 'both', element: 'water', status: { type: 'soggy', chance: .5, turns: 3 } })],
    drops: [['drycloth', .3]]
  });
  E('soggle', 'Soggle', {
    tier: 3, hp: 15, atk: 3, def: 2, flags: ['ground'], weak: ['shock', 'fire'], resist: ['water'], immune: ['soggy'],
    tattle: 'A Soggle. 15 HP, 2 Defence, and permanently waterlogged. Heavy and slow. Dry it out with fire and its Defence falls apart.',
    moves: [m('Sop', 3, { status: { type: 'soggy', chance: .6, turns: 3 } }), m('Wring Out', 0, { heal: 5, target: 'self', weight: 5 })],
    drops: [['pressiron', .2]]
  });
  E('barnacleaf', 'Barnacleaf', {
    tier: 3, hp: 13, atk: 4, def: 2, flags: ['ground', 'spiked'], weak: ['shock'], resist: ['water', 'cut'],
    tattle: 'A Barnacleaf. 13 HP, 4 Attack, 2 Defence and a crust of spikes. Never stomp it. Blunt force and shock both work.',
    moves: [m('Shell Scrape', 4, { element: 'cut' }), m('Clamp', 3, { status: { type: 'tangled', chance: .4, turns: 2 }, weight: 6 })],
    drops: [['papercutstar', .2]]
  });
  E('inkfish', 'Inkfish', {
    tier: 3, hp: 12, atk: 3, def: 1, flags: ['air'], weak: ['shock'], resist: ['ink', 'water'],
    tattle: 'An Inkfish. 12 HP and a bottomless supply of ink. Being Inked halves your accuracy, so bring Margo or a Tonic Wash.',
    moves: [m('Ink Jet', 3, { element: 'ink', status: { type: 'inked', chance: .7, turns: 3 } }), m('Tentacle', 4, { weight: 7 })],
    drops: [['inkbomb', .2]]
  });
  E('tidewisp', 'Tidewisp', {
    tier: 3, hp: 10, atk: 3, def: 0, flags: ['air'], weak: ['shock'], resist: ['water'],
    tattle: 'A Tidewisp. 10 HP. Harmless-looking, and then it heals everything else on the stage. Kill it first. Always kill it first.',
    moves: [m('Mist', 2, { element: 'water' }), m('Tide Song', 0, { heal: 6, target: 'allies', weight: 12, telegraph: 'It hums a rising note.' })],
    drops: [['pulpberry', .35]]
  });
  E('brinehound', 'Brinehound', {
    tier: 3, hp: 18, atk: 5, def: 1, flags: ['ground'], weak: ['shock'], resist: ['water'],
    tattle: 'A Brinehound. 18 HP, 5 Attack — the hardest hitter on the docks. It bites twice if you let it get close.',
    moves: [m('Savage Bite', 5, { hits: 2 }), m('Howl', 0, { atkBuff: 2, target: 'allies', weight: 5, telegraph: 'It throws back its head.' })],
    drops: [['boldbrew', .2]]
  });

  /* ===================== CHAPTER 4 — CARDSTOCK CARNIVAL ================== */
  E('clipling', 'Clipling', {
    tier: 4, hp: 12, atk: 4, def: 3, flags: ['ground', 'heavy'], weak: ['shock', 'fire'], resist: ['cut', 'blunt'],
    tattle: 'A Clipling. 12 HP and a genuinely irritating 3 Defence. Piercing moves and shock cut straight through. Blunt does almost nothing.',
    moves: [m('Pinch', 4), m('Clamp Down', 0, { guard: 4, turns: 2, weight: 6 })],
    drops: [['papercutstar', .25]]
  });
  E('juggloon', 'Juggloon', {
    tier: 4, hp: 14, atk: 4, def: 0, flags: ['air'], weak: ['cut', 'wind'], resist: ['blunt'],
    tattle: 'A Juggloon. 14 HP, no Defence, and full of hot air. One good cut pops it. It throws whatever it is juggling at you.',
    moves: [m('Juggle Toss', 4, { hits: 3, power: 2 }), m('Pop Off', 6, { weight: 4, cond: 'lowhp', selfKO: true, telegraph: 'It swells alarmingly.' })],
    drops: [['crowdcandy', .25]]
  });
  E('confettoid', 'Confettoid', {
    tier: 4, hp: 13, atk: 3, def: 1, flags: ['ground'], weak: ['water'], resist: ['cut'],
    tattle: 'A Confettoid. 13 HP. It bursts into a shower of confetti that dazzles the whole party. Water turns the confetti into pulp.',
    moves: [m('Streamer Whip', 3), m('Confetti Burst', 2, { target: 'both', status: { type: 'dizzy', chance: .6, turns: 2 }, weight: 8 })],
    drops: [['crowdcandy', .3]]
  });
  E('trapezoid', 'Trapezoid', {
    tier: 4, hp: 16, atk: 5, def: 1, flags: ['air'], weak: ['shock'], resist: ['blunt'],
    tattle: 'A Trapezoid. 16 HP, 5 Attack, and it swings in from above where the mallet cannot follow. Ground it with Volt or Updraft Stomp.',
    moves: [m('Swing Kick', 5), m('Aerial Drop', 6, { weight: 5, telegraph: 'It climbs to the top of the arc.' })],
    drops: [['swiftdraft', .2]]
  });
  E('papercut', 'Papercut', {
    tier: 4, hp: 10, atk: 6, def: 0, flags: ['air'], weak: ['water', 'blunt'], resist: ['cut'],
    tattle: 'A Papercut. Only 10 HP, but 6 Attack and it always goes for the soft edges. Kill it immediately. This is not negotiable.',
    moves: [m('Slice', 6, { element: 'cut', status: { type: 'poison', chance: .3, turns: 3 } })],
    drops: [['papercutstar', .3]]
  });
  E('stiltjack', 'Stiltjack', {
    tier: 4, hp: 17, atk: 4, def: 2, flags: ['ground'], weak: ['cut'], resist: ['blunt'],
    tattle: 'A Stiltjack. 17 HP, 2 Defence, and standing far too high to mallet comfortably. Cut the stilts out from under it.',
    moves: [m('Stomp Down', 4), m('High Kick', 5, { target: 'hero', weight: 7 })],
    drops: [['ironsheet', .2]]
  });

  /* ===================== CHAPTER 5 — GLYPHHAVEN =========================== */
  E('footnote', 'Footnote', {
    tier: 5, hp: 9, atk: 3, def: 1, flags: ['air'], weak: ['fire'], resist: ['ink'],
    tattle: 'A Footnote. 9 HP. Individually trivial; they never come alone. Fire is very effective and very frowned upon in a library.',
    moves: [m('Cite', 3), m('Summon Footnote', 0, { summon: 'footnote', weight: 6, telegraph: 'It references something below.' })],
    drops: [['pulpberry', .3]]
  });
  E('erratum', 'Erratum', {
    tier: 5, hp: 16, atk: 5, def: 2, flags: ['air'], weak: ['fire', 'light'], resist: ['ink'],
    tattle: 'An Erratum. 16 HP, 5 Attack. It copies your last move back at you, badly. Vary your attacks and it stays confused.',
    moves: [m('Correction', 5, { element: 'ink' }), m('Mirror Error', 4, { copyLast: true, weight: 7, telegraph: 'It reads your last move aloud.' })],
    drops: [['inkbomb', .2]]
  });
  E('glyphling', 'Glyphling', {
    tier: 5, hp: 14, atk: 4, def: 2, flags: ['ground'], weak: ['shock'], resist: ['ink', 'light'],
    tattle: 'A Glyphling. 14 HP, 2 Defence. It shields whatever is next to it, so it is always the wrong thing to attack second.',
    moves: [m('Rune Bolt', 4, { element: 'light' }), m('Ward', 0, { guard: 3, turns: 2, target: 'allies', weight: 8 })],
    drops: [['ironsheet', .2]]
  });
  E('redliner', 'Redliner', {
    tier: 5, hp: 15, atk: 5, def: 1, flags: ['ground'], weak: ['fire'], immune: ['inked'],
    tattle: 'A Redliner. 15 HP, 5 Attack, and it silences your Seal Powers. Deal with it before you plan anything clever.',
    moves: [m('Strike Through', 5, { element: 'cut' }), m('Red Pen', 3, { status: { type: 'silence', chance: .7, turns: 3 }, weight: 8, telegraph: 'It uncaps a red pen.' })],
    drops: [['tonicwash', .2]]
  });
  E('dogear', 'Dogear', {
    tier: 5, hp: 20, atk: 3, def: 3, flags: ['ground', 'heavy'], weak: ['cut'], resist: ['blunt'], immune: ['crumple'],
    tattle: 'A Dogear. 20 HP and 3 Defence — a very stubborn crease. Snip cuts through it in one turn. Everything else takes several.',
    moves: [m('Fold Over', 3, { status: { type: 'crumple', chance: .5, turns: 3 } }), m('Press Flat', 5, { weight: 6 })],
    drops: [['pressiron', .25]]
  });
  E('marginalis', 'Marginalis', {
    tier: 5, hp: 19, atk: 6, def: 2, flags: ['air'], weak: ['light'], resist: ['ink'],
    tattle: 'A Marginalis. 19 HP, 6 Attack, and it drains HP to heal itself. Lumen\'s light hurts it badly.',
    moves: [m('Margin Slash', 6, { element: 'cut' }), m('Drain Note', 4, { drain: true, weight: 8, telegraph: 'It leans in close to read you.' })],
    drops: [['inktea', .25]]
  });

  /* ===================== CHAPTER 6 — FROSTFOLD ============================ */
  E('frostling', 'Frostling', {
    tier: 6, hp: 16, atk: 5, def: 1, flags: ['ground', 'icy'], weak: ['fire'], immune: ['freeze'],
    tattle: 'A Frostling. 16 HP, 5 Attack. It freezes whatever it touches. Lumen or any fire move melts its Defence right off.',
    moves: [m('Chill Touch', 5, { element: 'ice', status: { type: 'freeze', chance: .4, turns: 2 } })],
    drops: [['frostnut', .25]]
  });
  E('snowcrease', 'Snowcrease', {
    tier: 6, hp: 22, atk: 6, def: 3, flags: ['ground', 'icy', 'heavy'], weak: ['fire'], resist: ['ice', 'blunt'],
    tattle: 'A Snowcrease. 22 HP, 6 Attack, 3 Defence. A wall of packed snow with a grudge. Burn it or pierce it; nothing else dents it.',
    moves: [m('Avalanche Arm', 6), m('Pack Down', 0, { guard: 4, heal: 4, target: 'self', turns: 2, weight: 6 })],
    drops: [['glacierjelly', .15]]
  });
  E('icicleimp', 'Icicleimp', {
    tier: 6, hp: 14, atk: 6, def: 0, flags: ['air', 'icy'], weak: ['fire', 'wind'], immune: ['freeze'],
    tattle: 'An Icicleimp. 14 HP, 6 Attack, no Defence at all. Glass cannon. Break the glass.',
    moves: [m('Icicle Drop', 6, { element: 'ice', pierce: true })],
    drops: [['frostnut', .3]]
  });
  E('chillbug', 'Chillbug', {
    tier: 6, hp: 18, atk: 5, def: 2, flags: ['ground', 'icy'], weak: ['fire'], resist: ['ice'],
    tattle: 'A Chillbug. 18 HP, 5 Attack. It scuttles behind you and bites the back of your knees, which is exactly as rude as it sounds.',
    moves: [m('Frost Bite', 5, { element: 'ice', hits: 2, power: 3 }), m('Burrow', 0, { evade: 1, turns: 1, weight: 5, telegraph: 'It vanishes into the drift.' })],
    drops: [['pulpberry', .3]]
  });
  E('glaciat', 'Glaciat', {
    tier: 6, hp: 28, atk: 6, def: 4, flags: ['ground', 'icy', 'heavy'], weak: ['fire'], resist: ['ice', 'blunt', 'cut'], immune: ['freeze', 'tangled'],
    tattle: 'A Glaciat. 28 HP and a monstrous 4 Defence. Blunt and cut both slide off. Fire, shock, and anything piercing are your friends here.',
    moves: [m('Glacier Slam', 6), m('Deep Freeze', 4, { target: 'both', element: 'ice', status: { type: 'freeze', chance: .5, turns: 2 }, weight: 6 })],
    drops: [['lifeleaf', .12]]
  });
  E('flurrik', 'Flurrik', {
    tier: 6, hp: 15, atk: 4, def: 0, flags: ['air'], weak: ['fire', 'wind'], resist: ['ice'],
    tattle: 'A Flurrik. 15 HP. It blows the whole party around and makes everyone miss. Ground it fast.',
    moves: [m('Flurry', 3, { target: 'both', element: 'ice' }), m('Whiteout', 0, { target: 'both', status: { type: 'inked', chance: .8, turns: 3 }, weight: 8 })],
    drops: [['smellingink', .25]]
  });

  /* ===================== CHAPTER 7 — FOILWORKS ============================ */
  E('sparkbit', 'Sparkbit', {
    tier: 7, hp: 14, atk: 5, def: 0, flags: ['air', 'electric'], weak: ['water'], immune: ['shock'],
    tattle: 'A Sparkbit. 14 HP and live to the touch — contact attacks hurt you back. Water shorts it out instantly.',
    moves: [m('Arc', 5, { element: 'shock' })],
    drops: [['thunderrag', .25]]
  });
  E('foilrat', 'Foilrat', {
    tier: 7, hp: 19, atk: 6, def: 2, flags: ['ground'], weak: ['shock'], resist: ['cut'],
    tattle: 'A Foilrat. 19 HP, 6 Attack. It steals coins and runs. If you want your money back, be quick about it.',
    moves: [m('Gnaw', 6), m('Snatch', 2, { steal: true, weight: 6, telegraph: 'Its eyes go to your purse.' })],
    drops: [['pulpberry', .25]]
  });
  E('coglet', 'Coglet', {
    tier: 7, hp: 16, atk: 5, def: 4, flags: ['ground', 'heavy'], weak: ['shock'], resist: ['blunt', 'cut'], immune: ['poison', 'sleep'],
    tattle: 'A Coglet. 16 HP behind 4 Defence. It repairs itself if you leave it alone. Piercing damage is the only sane answer.',
    moves: [m('Piston Punch', 5), m('Self-Repair', 0, { heal: 6, target: 'self', weight: 7 })],
    drops: [['pressiron', .25]]
  });
  E('voltoid', 'Voltoid', {
    tier: 7, hp: 20, atk: 6, def: 1, flags: ['ground', 'electric'], weak: ['water'], immune: ['shock'],
    tattle: 'A Voltoid. 20 HP, 6 Attack, and it electrifies its friends. Water is a bad idea for it and an excellent idea for you.',
    moves: [m('Discharge', 6, { element: 'shock' }), m('Energise', 0, { atkBuff: 2, target: 'allies', weight: 7, telegraph: 'The air starts to hum.' })],
    drops: [['thunderrag', .25]]
  });
  E('wirewing', 'Wirewing', {
    tier: 7, hp: 17, atk: 6, def: 1, flags: ['air', 'electric'], weak: ['water'], immune: ['shock'],
    tattle: 'A Wirewing. 17 HP, airborne and live. It jams your action commands, so expect the timing windows to lie to you.',
    moves: [m('Buzz Strike', 6, { element: 'shock' }), m('Jam', 0, { target: 'both', status: { type: 'dizzy', chance: .8, turns: 2 }, weight: 7 })],
    drops: [['smellingink', .25]]
  });
  E('pressbot', 'Pressbot', {
    tier: 7, hp: 30, atk: 8, def: 4, flags: ['ground', 'heavy'], weak: ['shock', 'water'], resist: ['blunt', 'cut'], immune: ['poison', 'sleep', 'dizzy'],
    tattle: 'A Pressbot. 30 HP, 8 Attack, 4 Defence. It flattens things for a living and is very good at it. Bring everything you have.',
    moves: [m('Hydraulic Press', 8, { status: { type: 'crumple', chance: .6, turns: 3 } }), m('Overheat', 6, { target: 'both', element: 'fire', weight: 5, telegraph: 'Steam vents from every seam.' })],
    drops: [['lastpage', .1]]
  });

  /* ===================== CHAPTER 8 — THE BLOT ============================= */
  E('blotling', 'Blotling', {
    tier: 8, hp: 22, atk: 7, def: 2, flags: ['ground'], weak: ['light', 'fire'], resist: ['ink'], immune: ['inked'],
    tattle: 'A Blotling. 22 HP, 7 Attack. Raw spilled ink with an opinion. Light hurts it more than anything else does.',
    moves: [m('Splatter', 7, { element: 'ink', status: { type: 'inked', chance: .5, turns: 3 } }), m('Absorb', 4, { drain: true, weight: 6 })],
    drops: [['inktea', .25]]
  });
  E('smudgeling', 'Smudgeling', {
    tier: 8, hp: 19, atk: 6, def: 1, flags: ['air'], weak: ['light'], resist: ['ink'], immune: ['inked'],
    tattle: 'A Smudgeling. 19 HP. It smears your stats — expect Attack and Defence to slide. Lumen burns it off cleanly.',
    moves: [m('Smear', 6, { element: 'ink' }), m('Blur', 0, { target: 'both', debuff: { atk: -2, def: -1, turns: 3 }, weight: 8, telegraph: 'The stage goes soft at the edges.' })],
    drops: [['tonicwash', .25]]
  });
  E('inkhound', 'Inkhound', {
    tier: 8, hp: 26, atk: 8, def: 2, flags: ['ground'], weak: ['light', 'fire'], resist: ['ink'],
    tattle: 'An Inkhound. 26 HP, 8 Attack, and it hunts in pairs. If you see one, the other is already behind you.',
    moves: [m('Rend', 8, { hits: 2, power: 5 }), m('Bay', 0, { summon: 'blotling', weight: 5, telegraph: 'Its howl echoes down the hall.' })],
    drops: [['boldbrew', .2]]
  });
  E('nibguard', 'Nibguard', {
    tier: 8, hp: 28, atk: 7, def: 5, flags: ['ground', 'heavy'], weak: ['shock'], resist: ['blunt', 'cut', 'ink'], immune: ['poison', 'sleep'],
    tattle: 'A Nibguard. 28 HP behind 5 Defence — the toughest shell in the Citadel. Pierce it or shock it; nothing else registers.',
    moves: [m('Nib Thrust', 7, { pierce: true }), m('Guard Stance', 0, { guard: 5, turns: 2, weight: 6 })],
    drops: [['mirrorfoil', .15]]
  });
  E('erasure', 'Erasure', {
    tier: 8, hp: 24, atk: 7, def: 3, flags: ['air'], weak: ['ink'], resist: ['light', 'fire', 'ice', 'shock'], immune: ['crumple'],
    tattle: 'An Erasure. 24 HP, and it deletes things — your buffs, your Forms, occasionally your item. Ink is the one thing it cannot unmake.',
    moves: [m('Rub Out', 7, { dispel: true }), m('Blank', 5, { target: 'both', status: { type: 'silence', chance: .6, turns: 3 }, weight: 7 })],
    drops: [['sealwater', .2]]
  });
  E('blotknight', 'Blotknight', {
    tier: 8, hp: 34, atk: 9, def: 4, flags: ['ground', 'heavy'], weak: ['light'], resist: ['ink', 'cut'], immune: ['tangled'],
    tattle: 'A Blotknight. 34 HP, 9 Attack, 4 Defence. Duke Smudge\'s personal guard, and it fights like it. No shortcuts here.',
    moves: [m('Cleave', 9, { element: 'cut' }), m('Ink Wall', 0, { guard: 4, target: 'allies', turns: 2, weight: 5 }), m('Executioner', 12, { weight: 4, cond: 'heroLow', telegraph: 'It raises the blade high.' })],
    drops: [['lastpage', .15]]
  });

  /* ===================== ROAMING / OPTIONAL =============================== */
  E('crumple', 'Crumple', {
    tier: 1, hp: 4, atk: 1, def: 0, flags: ['ground'], weak: ['fire'],
    tattle: 'A Crumple. 4 HP, 1 Attack. A discarded draft that woke up angry. It is not very good at being angry.',
    moves: [m('Bump', 1)], drops: [['pulpberry', .4]]
  });
  E('wadball', 'Wadball', {
    tier: 3, hp: 14, atk: 4, def: 2, flags: ['ground', 'heavy'], weak: ['fire', 'water'], resist: ['blunt'],
    tattle: 'A Wadball. 14 HP, 2 Defence. Rolls over anything in its way. Wet paper does not roll.',
    moves: [m('Roll Over', 4), m('Compact', 0, { guard: 3, turns: 2, weight: 5 })],
    drops: [['pressiron', .2]]
  });
  E('staplebug', 'Staplebug', {
    tier: 4, hp: 12, atk: 5, def: 3, flags: ['ground', 'spiked', 'heavy'], weak: ['shock'], resist: ['blunt', 'cut'],
    tattle: 'A Staplebug. 12 HP, 3 Defence and spiked. Do not stomp it. Shock is the clean answer.',
    moves: [m('Staple', 5, { pierce: true })], drops: [['papercutstar', .25]]
  });
  E('gluegoop', 'Gluegoop', {
    tier: 5, hp: 20, atk: 3, def: 1, flags: ['ground'], weak: ['fire', 'ice'], immune: ['tangled', 'crumple'],
    tattle: 'A Gluegoop. 20 HP. It sticks you in place, which is worse than it sounds when there are Papercuts about.',
    moves: [m('Stick', 3, { status: { type: 'tangled', chance: .6, turns: 2 } }), m('Engulf', 5, { weight: 6 })],
    drops: [['tonicwash', .2]]
  });

  /* ===================== MINI-BOSSES ====================================== */
  E('thistleguard', 'Thistleguard', {
    tier: 1, hp: 30, atk: 4, def: 2, flags: ['ground', 'spiked', 'heavy', 'miniboss'], weak: ['fire'], immune: ['tangled'],
    sp: 30, coins: 20,
    tattle: 'Thistleguard, warden of the thicket gate. 30 HP, 4 Attack, 2 Defence, and covered in thorns — stomping it will cost you. Fire strips the thorns; then the mallet does the rest.',
    moves: [
      m('Thorn Sweep', 4, { target: 'both' }),
      m('Bramble Wall', 0, { guard: 3, turns: 2, weight: 7, telegraph: 'It raises a wall of brambles.' }),
      m('Impale', 7, { pierce: true, weight: 6, telegraph: 'Every thorn turns toward you.' })
    ],
    drops: [['reamcake', 1]]
  });
  E('wick_and_wisp', 'Wick & Wisp', {
    tier: 2, hp: 34, atk: 5, def: 1, flags: ['air', 'fiery', 'miniboss'], weak: ['water'], immune: ['burn'],
    sp: 36, coins: 24,
    tattle: 'Wick & Wisp, the Foundry\'s twin lamplighters — one body, two tempers. 34 HP, 5 Attack. Airborne and burning, so stomping hurts. Bloop turns this fight around completely.',
    moves: [
      m('Twin Flame', 5, { target: 'both', element: 'fire' }),
      m('Wick Snap', 6, { element: 'fire', status: { type: 'burn', chance: .7, turns: 3 }, weight: 8 }),
      m('Relight', 0, { heal: 8, target: 'self', weight: 5, cond: 'lowhp', telegraph: 'The pair flare back to life.' })
    ],
    drops: [['drycloth', 1]]
  });
  E('barnacle_bosun', 'Barnacle Bosun', {
    tier: 3, hp: 44, atk: 6, def: 3, flags: ['ground', 'spiked', 'miniboss'], weak: ['shock'], resist: ['water'],
    sp: 44, coins: 30,
    tattle: 'The Barnacle Bosun, who runs the Sogport wreck like a ship he no longer has. 44 HP, 6 Attack, 3 Defence, spiked. Volt\'s shock cuts through the salt water and the armour at once.',
    moves: [
      m('Anchor Swing', 6),
      m('Rally the Crew', 0, { summon: 'barnacleaf', weight: 6, telegraph: 'He whistles for the crew.' }),
      m('Broadside', 4, { target: 'both', hits: 2, weight: 7, telegraph: 'He wheels the deck gun around.' })
    ],
    drops: [['ironsheet', 1]]
  });
  E('trimmet', 'Trimmet', {
    tier: 4, hp: 52, atk: 7, def: 2, flags: ['ground', 'miniboss'], weak: ['water'], resist: ['cut'],
    sp: 52, coins: 36,
    tattle: 'Trimmet, understudy to the Great Kerf and desperate about it. 52 HP, 7 Attack. She copies whatever you did last turn, so keep changing your mind.',
    moves: [
      m('Snip Flurry', 4, { hits: 3, element: 'cut' }),
      m('Understudy', 5, { copyLast: true, weight: 8, telegraph: 'She watches your hands very carefully.' }),
      m('Spotlight', 3, { target: 'both', status: { type: 'dizzy', chance: .7, turns: 2 }, weight: 6 })
    ],
    drops: [['swiftdraft', 1]]
  });
  E('footnote_fenn', 'Footnote Fenn', {
    tier: 5, hp: 58, atk: 7, def: 3, flags: ['air', 'miniboss'], weak: ['fire', 'light'], resist: ['ink'],
    sp: 58, coins: 40,
    tattle: 'Footnote Fenn, who has read every book in Glyphhaven and remembers all the worst parts. 58 HP, 7 Attack, 3 Defence. He buries you in citations — clear the small ones or they add up fast.',
    moves: [
      m('Citation Storm', 3, { target: 'both', hits: 2 }),
      m('Append', 0, { summon: 'footnote', count: 2, weight: 9, telegraph: 'He appends two more notes.' }),
      m('Errata', 7, { element: 'ink', status: { type: 'silence', chance: .6, turns: 2 }, weight: 7 })
    ],
    drops: [['tonicwash', 1]]
  });
  E('fenrisk', 'Fenrisk', {
    tier: 6, hp: 66, atk: 8, def: 3, flags: ['ground', 'icy', 'miniboss'], weak: ['fire'], resist: ['ice'], immune: ['freeze'],
    sp: 66, coins: 46,
    tattle: 'Fenrisk, the white hound of the Frostfold passes. 66 HP, 8 Attack, 3 Defence. It hunts whoever is weakest, so keep your partner\'s HP up.',
    moves: [
      m('Rime Fang', 8, { element: 'ice', status: { type: 'freeze', chance: .4, turns: 2 } }),
      m('Cull', 10, { target: 'weakest', weight: 8, telegraph: 'It fixes on the weaker of you.' }),
      m('Blizzard Howl', 4, { target: 'both', element: 'ice', debuff: { atk: -2, turns: 3 }, weight: 6 })
    ],
    drops: [['glacierjelly', 1]]
  });
  E('foreman_ratchet', 'Foreman Ratchet', {
    tier: 7, hp: 74, atk: 9, def: 5, flags: ['ground', 'heavy', 'miniboss'], weak: ['shock', 'water'], resist: ['blunt', 'cut'], immune: ['poison', 'sleep'],
    sp: 74, coins: 52,
    tattle: 'Foreman Ratchet, who runs the Foilworks floor and has never once been under budget. 74 HP, 9 Attack and a brutal 5 Defence. Piercing and shock are the only things that touch him.',
    moves: [
      m('Rivet Gun', 5, { hits: 2, pierce: true }),
      m('Assembly Line', 0, { summon: 'coglet', count: 2, weight: 7, telegraph: 'The line starts up behind him.' }),
      m('Overpressure', 9, { target: 'both', weight: 6, cond: 'lowhp', telegraph: 'Every gauge redlines.' })
    ],
    drops: [['mirrorfoil', 1]]
  });
  E('captain_sable', 'Captain Sable', {
    tier: 8, hp: 88, atk: 10, def: 4, flags: ['ground', 'miniboss'], weak: ['light'], resist: ['ink', 'cut'], immune: ['inked', 'sleep'],
    sp: 88, coins: 60,
    tattle: 'Captain Sable of the Blotguard. 88 HP, 10 Attack, 4 Defence. She fights cleanly and hits like a printing press. Light is her only real weakness, and she knows it.',
    moves: [
      m('Sable Cut', 10, { element: 'cut' }),
      m('Ink Veil', 0, { guard: 4, evade: .4, turns: 2, weight: 6, telegraph: 'Ink pools around her.' }),
      m('Condemn', 6, { target: 'both', element: 'ink', status: { type: 'inked', chance: .8, turns: 3 }, weight: 7 })
    ],
    drops: [['lastpage', 1]]
  });

  /* ===================== CHAPTER BOSSES ===================================
     Bosses have `phases`: when HP drops below `at` (fraction), the phase
     fires once — printing a line, applying stat mods, and swapping movesets. */
  E('bramblejack', 'Bramblejack', {
    tier: 1, hp: 45, atk: 5, def: 1, flags: ['ground', 'boss'], weak: ['fire'], immune: ['tangled', 'sleep'],
    sp: 60, coins: 40, noRun: true,
    tattle: 'Bramblejack, the Thorn Marionette. 45 HP, 5 Attack, 1 Defence. Someone else is pulling those strings — cut them and he loses his rhythm. Fire is his weakness, and he hates being off-balance.',
    moves: [
      m('Puppet Swipe', 5),
      m('Thorn Volley', 3, { target: 'both', hits: 2, weight: 8 }),
      m('String Pull', 0, { atkBuff: 2, target: 'self', weight: 5, telegraph: 'The strings above him go taut.' })
    ],
    phases: [{
      at: .5, say: 'Bramblejack: "CUT? CUT MY STRINGS? I DANCE FOR NO ONE—"',
      mods: { atk: 2 }, add: [m('Frenzy', 4, { target: 'both', hits: 2 }), m('Root Cage', 3, { status: { type: 'tangled', chance: .7, turns: 2 } })]
    }],
    drops: [['seal1', 1]]
  });
  E('pyra_sizzlefold', 'Duchess Pyra Sizzlefold', {
    tier: 2, hp: 62, atk: 6, def: 2, flags: ['ground', 'fiery', 'boss'], weak: ['water'], resist: ['fire'], immune: ['burn', 'sleep'],
    sp: 90, coins: 55, noRun: true,
    tattle: 'Duchess Pyra Sizzlefold, who rules the Emberfold and dresses for it. 62 HP, 6 Attack, 2 Defence, and permanently alight — contact attacks burn you. Douse her and she loses both the Defence and the temper.',
    moves: [
      m('Cinder Fan', 4, { target: 'both', element: 'fire' }),
      m('Sizzling Rebuke', 6, { element: 'fire', status: { type: 'burn', chance: .6, turns: 3 }, weight: 9 }),
      m('Court Summons', 0, { summon: 'emberling', count: 2, weight: 6, telegraph: 'She claps twice for the court.' })
    ],
    phases: [{
      at: .45, say: 'Pyra: "You have RUINED the drapes. Very well — we burn the whole wing."',
      mods: { atk: 2, def: -1 }, add: [m('Inferno Waltz', 5, { target: 'both', element: 'fire', hits: 2 })]
    }],
    drops: [['seal2', 1]]
  });
  E('nautilus_grim', 'Nautilus Grim', {
    tier: 3, hp: 80, atk: 7, def: 3, flags: ['air', 'boss'], weak: ['shock'], resist: ['water'], immune: ['soggy', 'tangled'],
    sp: 120, coins: 70, noRun: true,
    tattle: 'Nautilus Grim, the coil that sank the Sunken Ream. 80 HP, 7 Attack, 3 Defence. It coils to raise its Defence and uncoils to strike. Shock the water and the whole length of it lights up.',
    moves: [
      m('Coil Crush', 7),
      m('Undertow', 4, { target: 'both', element: 'water', status: { type: 'soggy', chance: .6, turns: 3 }, weight: 8 }),
      m('Deep Coil', 0, { guard: 4, turns: 2, weight: 7, telegraph: 'It winds in on itself.' })
    ],
    phases: [{
      at: .5, say: 'The coil unwinds to its full length. The water goes very still.',
      mods: { atk: 2, def: -2 }, add: [m('Maelstrom', 6, { target: 'both', element: 'water', hits: 2 })]
    }, {
      at: .2, say: 'Nautilus Grim: "...ssssalt. and. sssssilence."',
      mods: { atk: 3 }, add: [m('Abyss Bite', 12, { target: 'hero' })]
    }],
    drops: [['seal3', 1]]
  });
  E('great_kerf', 'The Great Kerf', {
    tier: 4, hp: 96, atk: 8, def: 3, flags: ['ground', 'boss'], weak: ['water'], resist: ['cut'], immune: ['crumple'],
    sp: 150, coins: 85, noRun: true,
    tattle: 'The Great Kerf, ringmaster of the Cardstock Carnival. 96 HP, 8 Attack, 3 Defence. He plays to the crowd — every cheer he earns makes him stronger, so keep the audience on YOUR side.',
    moves: [
      m('Ringmaster\'s Cut', 8, { element: 'cut' }),
      m('Crowd Work', 0, { stealAudience: 20, atkBuff: 1, target: 'self', weight: 8, telegraph: 'He turns to the crowd and bows.' }),
      m('Send in the Acts', 0, { summon: 'clipling', count: 2, weight: 6 })
    ],
    phases: [{
      at: .55, say: 'Kerf: "LADIES AND GENTLEFOLD — the SECOND act!"',
      mods: { atk: 2 }, add: [m('Twelve-Blade Finale', 4, { target: 'both', hits: 3, element: 'cut' })]
    }, {
      at: .22, say: 'Kerf: "No. No, no, no. They are looking at YOU."',
      mods: { atk: 3, def: -1 }, add: [m('Curtain Drop', 13, { target: 'hero' })]
    }],
    drops: [['seal4', 1]]
  });
  E('the_redactor', 'The Redactor', {
    tier: 5, hp: 110, atk: 9, def: 4, flags: ['air', 'boss'], weak: ['light', 'fire'], resist: ['ink'], immune: ['inked', 'silence'],
    sp: 190, coins: 100, noRun: true,
    tattle: 'The Redactor. 110 HP, 9 Attack, 4 Defence. It removes things: your buffs, your Forms, and eventually your moves. It cannot redact what it cannot read, so Lumen\'s light is your lifeline.',
    moves: [
      m('Black Bar', 9, { element: 'ink' }),
      m('Redact', 0, { target: 'both', dispel: true, status: { type: 'silence', chance: .8, turns: 3 }, weight: 9, telegraph: 'A bar slides across the page.' }),
      m('Classified', 5, { target: 'both', element: 'ink', status: { type: 'inked', chance: .8, turns: 3 }, weight: 7 })
    ],
    phases: [{
      at: .6, say: 'THE REDACTOR: "███ ███ ██ ████ ████ ██████."',
      mods: { atk: 2 }, add: [m('Full Censure', 6, { target: 'both', hits: 2, element: 'ink' })]
    }, {
      at: .25, say: 'The bars peel away. Underneath, there is nothing written at all.',
      mods: { def: -3, atk: 3 }, add: [m('Unwritten', 14, { target: 'random', pierce: true })]
    }],
    drops: [['seal5', 1]]
  });
  E('crinkle_wyrm', 'Crinkle, the Glacier Wyrm', {
    tier: 6, hp: 130, atk: 10, def: 4, flags: ['air', 'icy', 'boss'], weak: ['fire'], resist: ['ice', 'blunt'], immune: ['freeze', 'soggy'],
    sp: 240, coins: 120, noRun: true,
    tattle: 'Crinkle, the Glacier Wyrm. 130 HP, 10 Attack, 4 Defence. It armours itself in fresh ice every few turns — melt the shell with fire before you try anything else, or you will be here all week.',
    moves: [
      m('Rime Coil', 10, { element: 'ice' }),
      m('Glacier Shell', 0, { guard: 5, turns: 3, weight: 9, telegraph: 'Fresh ice sheets over its scales.' }),
      m('Hailstorm', 5, { target: 'both', element: 'ice', hits: 2, weight: 8 })
    ],
    phases: [{
      at: .55, say: 'The shell cracks. Something older is moving underneath it.',
      mods: { atk: 2 }, add: [m('Frostbite Lash', 7, { target: 'both', element: 'ice', status: { type: 'freeze', chance: .5, turns: 2 } })]
    }, {
      at: .22, say: 'Crinkle: "warm... thing... STOP being WARM..."',
      mods: { atk: 4, def: -2 }, add: [m('Absolute Zero', 16, { target: 'random', element: 'ice' })]
    }],
    drops: [['seal6', 1]]
  });
  E('chief_ampere', 'Chief Engineer Ampere', {
    tier: 7, hp: 150, atk: 11, def: 5, flags: ['ground', 'electric', 'heavy', 'boss'], weak: ['water'], resist: ['blunt', 'cut'], immune: ['shock', 'poison', 'sleep', 'tangled'],
    sp: 300, coins: 140, noRun: true,
    tattle: 'Chief Engineer Ampere. 150 HP, 11 Attack, 5 Defence, and live to the touch. Every contact attack shocks you back. Water is the great equaliser — Bloop can flood the floor and short the whole chassis.',
    moves: [
      m('Piston Hammer', 11),
      m('Grounding Rod', 0, { guard: 5, thorns: 3, turns: 3, weight: 8, telegraph: 'It drives a rod into the floor.' }),
      m('Arc Flash', 6, { target: 'both', element: 'shock', pierce: true, weight: 9 }),
      m('Deploy Coglets', 0, { summon: 'coglet', count: 2, weight: 5 })
    ],
    phases: [{
      at: .6, say: 'AMPERE: "EFFICIENCY BELOW TARGET. SWITCHING TO OVERDRIVE."',
      mods: { atk: 3 }, add: [m('Overdrive Slam', 8, { target: 'both', hits: 2 })]
    }, {
      at: .25, say: 'AMPERE: "I WAS BUILT TO PRESS. I WILL PRESS UNTIL I AM SWITCHED OFF."',
      mods: { atk: 4, def: -2 }, add: [m('Total Discharge', 18, { target: 'both', element: 'shock', pierce: true })]
    }],
    drops: [['seal7', 1]]
  });
  E('duke_smudge', 'Duke Smudge', {
    tier: 8, hp: 170, atk: 12, def: 5, flags: ['ground', 'boss'], weak: ['light'], resist: ['ink', 'cut'], immune: ['inked', 'sleep', 'dizzy'],
    sp: 400, coins: 180, noRun: true,
    tattle: 'Duke Smudge. 170 HP, 12 Attack, 5 Defence. Everything he does is a signature — he writes conditions onto the stage and then enforces them. He is also, and he would hate this, only ink. Light undoes ink.',
    moves: [
      m('Signature', 12, { element: 'ink' }),
      m('Clause of Silence', 0, { target: 'both', status: { type: 'silence', chance: .9, turns: 3 }, weight: 8, telegraph: 'He inscribes a clause in the air.' }),
      m('Blotguard', 0, { summon: 'nibguard', weight: 6 }),
      m('Contract', 7, { target: 'both', element: 'ink', drain: true, weight: 8 })
    ],
    phases: [{
      at: .6, say: 'Smudge: "You are a smear on a very fine page, courier. Let me correct that."',
      mods: { atk: 3 }, add: [m('Overwrite', 9, { target: 'both', dispel: true })]
    }, {
      at: .25, say: 'Smudge: "I served the Blank so it would spare ME. Do you understand? It spares NO ONE."',
      mods: { atk: 4, def: -2 }, add: [m('Final Draft', 20, { target: 'hero', element: 'ink' })]
    }],
    drops: [['crown_core', 1]]
  });
  E('smudge_ascendant', 'Smudge Ascendant', {
    tier: 8, hp: 210, atk: 14, def: 6, flags: ['ground', 'boss'], weak: ['light'], resist: ['ink', 'cut', 'blunt'], immune: ['inked', 'sleep', 'dizzy', 'tangled'],
    sp: 500, coins: 220, noRun: true,
    tattle: 'Smudge Ascendant — the Duke with the Blank pouring through him. 210 HP, 14 Attack, 6 Defence. He is not steering any more. Light still works; keep the Seals ready and do not stop moving.',
    moves: [
      m('Ascendant Blot', 14, { element: 'ink' }),
      m('Unmaking Hand', 8, { target: 'both', dispel: true, pierce: true, weight: 9 }),
      m('Voidcall', 0, { summon: 'erasure', weight: 6 }),
      m('The Last Word', 22, { target: 'hero', weight: 4, cond: 'heroLow', telegraph: 'Everything on the page goes quiet.' })
    ],
    phases: [{
      at: .5, say: 'SMUDGE ASCENDANT: "I AM THE LAST LINE. AFTER ME, MARGIN."',
      mods: { atk: 3, def: -1 }, add: [m('Margin Collapse', 9, { target: 'both', hits: 2, pierce: true })]
    }],
    drops: []
  });
  E('the_blank', 'The Blank', {
    tier: 8, hp: 260, atk: 15, def: 7, flags: ['air', 'boss'], weak: ['ink'], resist: ['light', 'fire', 'ice', 'shock', 'cut', 'blunt', 'water'],
    immune: ['inked', 'sleep', 'dizzy', 'tangled', 'poison', 'burn', 'freeze', 'crumple', 'shrink', 'silence'],
    sp: 900, coins: 400, noRun: true,
    tattle: 'The Blank. 260 HP, 15 Attack, 7 Defence, and it resists nearly everything — because nearly everything is *something*. Ink is the one weapon it has no answer to. Write on it. Keep writing on it.',
    moves: [
      m('Erase', 15, { pierce: true }),
      m('White Out', 8, { target: 'both', dispel: true, status: { type: 'silence', chance: .7, turns: 2 }, weight: 9 }),
      m('Unpage', 10, { target: 'both', pierce: true, weight: 8 }),
      m('Nothing At All', 0, { guard: 6, evade: .5, turns: 2, weight: 6, telegraph: 'The page in front of you goes completely empty.' })
    ],
    phases: [{
      at: .7, say: 'THE BLANK: "there was nothing before you. i am simply patient."',
      mods: { atk: 2 }, add: [m('Silence Absolute', 11, { target: 'both', pierce: true })]
    }, {
      at: .4, say: 'THE BLANK: "you keep making MARKS. why do you keep making MARKS."',
      mods: { atk: 3, def: -1 }, add: [m('Full Erasure', 13, { target: 'both', dispel: true, pierce: true })]
    }, {
      at: .15, say: 'THE BLANK: "...stop. STOP WRITING. STOP—"',
      mods: { atk: 5, def: -3 }, add: [m('Last Blank', 24, { target: 'hero', pierce: true })]
    }],
    drops: []
  });

  /* ===================== SUPERBOSSES ====================================== */
  E('origami_sovereign', 'The Origami Sovereign', {
    tier: 8, hp: 300, atk: 14, def: 6, flags: ['ground', 'boss'], weak: [], resist: ['cut', 'blunt', 'ink'],
    immune: ['sleep', 'dizzy', 'tangled', 'crumple', 'shrink'],
    sp: 800, coins: 500, noRun: true,
    tattle: 'The Origami Sovereign, champion of the Folded Coliseum since before the Crown was torn. 300 HP, 14 Attack, 6 Defence. It refolds itself into a new stance every few turns and each stance answers a different strategy. There is no single trick. There is only playing well.',
    moves: [
      m('Sovereign Fold', 14),
      m('Crane Stance', 0, { guard: 3, evade: .5, turns: 3, weight: 8, telegraph: 'It folds into a crane.' }),
      m('Dart Stance', 0, { atkBuff: 4, turns: 3, target: 'self', weight: 8, telegraph: 'It folds into a dart.' }),
      m('Thousand Cranes', 5, { target: 'both', hits: 3, weight: 7 })
    ],
    phases: [{
      at: .5, say: 'The Sovereign inclines its head. "Adequate. Again."', mods: { atk: 3 },
      add: [m('Perfect Crease', 18, { target: 'random', pierce: true })]
    }],
    drops: [['sovereignroast', 1]]
  });
  E('first_draft', 'The First Draft', {
    tier: 8, hp: 240, atk: 13, def: 5, flags: ['ground', 'boss'], weak: ['ink'], resist: ['blunt'],
    immune: ['sleep', 'silence'],
    sp: 700, coins: 400, noRun: true,
    tattle: 'The First Draft — the version of you that got crumpled and thrown away. 240 HP, 13 Attack, 5 Defence. It knows every move you know, because it learned them first. It copies your last action every single turn. The only way to beat it is to stop being predictable.',
    moves: [
      m('Rough Stomp', 13),
      m('Mirror', 10, { copyLast: true, weight: 14, telegraph: 'It moves exactly as you did.' }),
      m('Crumpled Fury', 6, { target: 'both', hits: 2, weight: 7 })
    ],
    phases: [{
      at: .4, say: 'The First Draft: "you got to be the FAIR COPY. i got the BIN."', mods: { atk: 4 },
      add: [m('Revision', 16, { target: 'hero', pierce: true })]
    }],
    drops: [['lastpage', 1]]
  });
  E('vermillion', 'Vermillion, the Unbound Blot', {
    tier: 8, hp: 400, atk: 17, def: 7, flags: ['air', 'boss'], weak: [], resist: ['ink', 'cut', 'blunt', 'fire', 'ice', 'shock', 'water'],
    immune: ['sleep', 'dizzy', 'tangled', 'crumple', 'shrink', 'poison', 'burn', 'freeze', 'silence', 'inked'],
    sp: 1500, coins: 900, noRun: true,
    tattle: 'Vermillion, the Unbound Blot. 400 HP, 17 Attack, 7 Defence, and resistant to everything you own. This is the fight the Coliseum warns people about. Duets, Seals, and perfect action commands — nothing less will do.',
    moves: [
      m('Unbound Lash', 17, { pierce: true }),
      m('Crimson Flood', 10, { target: 'both', hits: 2, weight: 9 }),
      m('Rewrite Reality', 0, { dispel: true, target: 'both', atkBuff: 3, weight: 8, telegraph: 'The stage itself starts to run.' }),
      m('Seven Coils', 6, { target: 'both', hits: 3, weight: 8 })
    ],
    phases: [{
      at: .66, say: 'VERMILLION: "the Crown bound me for SEVEN HUNDRED YEARS."', mods: { atk: 3 },
      add: [m('Scarlet Ruin', 14, { target: 'both', pierce: true })]
    }, {
      at: .33, say: 'VERMILLION: "and you think a COURIER holds it now?"', mods: { atk: 5, def: -2 },
      add: [m('Unbinding', 26, { target: 'hero', pierce: true })]
    }],
    drops: [['sevenlayer', 1]]
  });

  function get(id) { return db[id]; }
  function all() { return db; }
  function list() { var a = []; for (var k in db) a.push(db[k]); return a; }
  function byTier(t) { return list().filter(function (e) { return e.tier === t && !e.flags.some(function (f) { return f === 'boss' || f === 'miniboss'; }); }); }

  return { get: get, all: all, list: list, byTier: byTier, has: has, m: m };
})();

/* ===== 10_partners.js ===== */
/* ==========================================================================
   PAPERBOUND — 10_partners.js
   Six partners. Each brings four battle abilities, one field ability that
   opens up the overworld, and one Encore duet.
   ========================================================================== */
'use strict';

PB.Partners = (function () {
  var db = {}, order = [];

  function P(id, o) { o.id = id; db[id] = o; order.push(id); return o; }

  P('twigby', {
    name: 'Twigby', sprite: 'twigby', chapter: 0,
    title: 'the Acorn Scout',
    maxHp: [10, 15, 22],
    moves: ['tw_bonk', 'tw_study', 'tw_thornshot', 'tw_rootsnare'],
    duet: 'duet_twigby',
    field: { id: 'sprout', name: 'Sprout', verb: 'grow', desc: 'Grow a vine from loose soil and climb it.' },
    bio: 'A scout from the Creasewood canopy who volunteered before anyone finished asking. Reads foes better than anyone alive and refuses to be told he is small.',
    joinLine: 'Twigby: "Right! Official Creasewood scout, reporting. I read foes, I hit things, and I do not get lost. Mostly."'
  });

  P('lumen', {
    name: 'Lumen', sprite: 'lumen', chapter: 2,
    title: 'the Kept Flame',
    maxHp: [14, 20, 28],
    moves: ['lu_flare', 'lu_kindle', 'lu_sunburst', 'lu_beacon'],
    duet: 'duet_lumen',
    field: { id: 'light', name: 'Kindle', verb: 'light', desc: 'Light a dark room, and burn away paper barriers.' },
    bio: 'The last lamp of the Emberfold foundry, lit before the furnaces and never once allowed to go out. Warm, exact, and quietly terrified of water.',
    joinLine: 'Lumen: "I have been burning for four hundred years with nothing to read by. Take me somewhere with a view."'
  });

  P('bloop', {
    name: 'Bloop', sprite: 'bloop', chapter: 3,
    title: 'the Folded Boat',
    maxHp: [18, 25, 34],
    moves: ['bl_splash', 'bl_bubble', 'bl_tidalroll', 'bl_deluge'],
    duet: 'duet_bloop',
    field: { id: 'ferry', name: 'Ferry', verb: 'sail', desc: 'Unfold into a boat and carry the party across water.' },
    bio: 'Folded by a Sogport child from a single page of a shipping manifest, and somehow seaworthy ever since. Cheerful. Extremely buoyant. Not a strong swimmer, ironically.',
    joinLine: 'Bloop: "Water! You need water crossed! I am EXACTLY the right shape for that. Hop on, hop on."'
  });

  P('snip', {
    name: 'Snip', sprite: 'snip', chapter: 4,
    title: 'the Understudy',
    maxHp: [16, 23, 31],
    moves: ['sn_snip', 'sn_ribbon', 'sn_confetti', 'sn_curtain'],
    duet: 'duet_snip',
    field: { id: 'cut', name: 'Cut', verb: 'cut', desc: 'Cut taped seams, ropes and stitched barriers.' },
    bio: 'Fired from the Cardstock Carnival for upstaging the Great Kerf during a matinee. Considers this the finest review she has ever received.',
    joinLine: 'Snip: "He fired me for being BETTER than him. In front of nine hundred people. So — where are we going and who am I cutting?"'
  });

  P('margo', {
    name: 'Margo', sprite: 'margo', chapter: 5,
    title: 'the Marginalia',
    maxHp: [15, 22, 30],
    moves: ['mg_footnote', 'mg_annotate', 'mg_redline', 'mg_index'],
    duet: 'duet_margo',
    field: { id: 'read', name: 'Read', verb: 'read', desc: 'Read glyphs, translate signs and reveal hidden platforms.' },
    bio: 'A bookmark who spent two centuries holding one page of a book nobody came back to finish. Now reads everything, out loud, whether asked or not.',
    joinLine: 'Margo: "Two hundred and six years on page four hundred and twelve. I would very much like to see how any story ends. Even this one."'
  });

  P('volt', {
    name: 'Volt', sprite: 'volt', chapter: 7,
    title: 'the Spare Part',
    maxHp: [20, 28, 38],
    moves: ['vo_sparker', 'vo_overclock', 'vo_chain', 'vo_magnet'],
    duet: 'duet_volt',
    field: { id: 'power', name: 'Power', verb: 'power', desc: 'Charge dead switches and drag metal with a magnet.' },
    bio: 'Assembled from the Foilworks reject bin by nobody in particular. Ampere logged it as scrap. It has been quietly correcting his blueprints ever since.',
    joinLine: 'Volt: "*click* — LOG ENTRY. Reclassified from SCRAP to CREW. Correcting record. Correcting record. ...Done."'
  });

  function get(id) { return db[id]; }
  function all() { return db; }
  function list() { return order.map(function (k) { return db[k]; }); }
  function maxHp(id, rank) {
    var p = db[id]; if (!p) return 10;
    return p.maxHp[Math.max(0, Math.min(2, (rank || 1) - 1))];
  }
  /* Moves available at a given rank: rank 1 gives the two rank-1 moves,
     rank 2 adds the third, rank 3 adds the fourth. */
  function moves(id, rank) {
    var p = db[id]; if (!p) return [];
    var out = [];
    for (var i = 0; i < p.moves.length; i++) {
      var mv = PB.Moves.get(p.moves[i]);
      if (mv && (mv.rank || 1) <= (rank || 1)) out.push(p.moves[i]);
    }
    return out;
  }

  return { get: get, all: all, list: list, maxHp: maxHp, moves: moves, order: order };
})();

/* ===== 11_state.js ===== */
/* ==========================================================================
   PAPERBOUND — 11_state.js
   The save object and every rule that reads or writes it: levelling, party
   stats, inventory limits, flags, quests, and three localStorage slots.
   ========================================================================== */
'use strict';

PB.State = (function () {
  var U = PB.U;
  var SAVE_KEY = 'paperbound.save.';
  var CFG_KEY = 'paperbound.config';
  var VERSION = 3;

  var S = null;                  // the live save object

  var ITEM_CAP = 20, STORE_CAP = 40, KEY_CAP = 64;

  function fresh(name, difficulty) {
    return {
      v: VERSION,
      name: name || 'Pip',
      difficulty: difficulty || 'normal',   // relaxed | normal | folded
      chapter: 0,
      level: 1, sp: 0, spTotal: 0,
      hp: 15, maxHp: 15,
      fp: 8, maxFp: 8,
      bp: 3,
      se: 100, maxSe: 100,        // Seal Energy; max grows with each Seal
      stompRank: 1, malletRank: 1,
      coins: 0,
      shards: 0,                  // Foil Shards upgrade partners
      partners: {},               // id -> {rank, hp, unlocked}
      active: null,
      items: [],
      store: [],
      keyItems: [],
      badges: { owned: [], equipped: [] },
      seals: [],                  // unlocked Seal Power move ids
      forms: [],                  // unlocked Origami Form move ids
      recipes: [],                // discovered recipe result ids
      flags: {},
      quests: {},                 // id -> {state:'open'|'done', progress}
      tattled: {},
      defeated: {},               // enemy id -> count
      map: 'quill_square', spawn: 'default',
      coliseumRank: 0,
      frames: 0,
      stats: { battles: 0, wins: 0, flees: 0, stylish: 0, damage: 0, taken: 0, steps: 0, superguards: 0 }
    };
  }

  function start(name, difficulty) {
    S = fresh(name, difficulty);
    givePartner('twigby');
    S.active = 'twigby';
    addKey('map_foldheim');
    unlockForm('form_crane');
    return S;
  }

  function get() { return S; }
  function set(obj) { S = obj; migrate(); return S; }

  function migrate() {
    if (!S) return;
    var d = fresh();
    for (var k in d) if (S[k] === undefined) S[k] = d[k];
    for (var sk in d.stats) if (S.stats[sk] === undefined) S.stats[sk] = d.stats[sk];
    S.v = VERSION;
  }

  /* ---- levelling --------------------------------------------------------
     100 Seal Points per level, flat, like the games this owes a debt to.
     On level-up the player picks HP +5 / FP +5 / BP +3. */
  function spToNext() { return 100; }
  function addSp(n) {
    var m = badgeMods();
    n = Math.max(0, Math.round(n * (1 + (m.spBonus || 0))));
    S.sp += n; S.spTotal += n;
    var levels = 0;
    while (S.sp >= spToNext() && S.level < 40) { S.sp -= spToNext(); S.level++; levels++; }
    return { gained: n, levels: levels };
  }
  function applyLevelChoice(choice) {
    if (choice === 'hp') { S.maxHp += 5; S.hp = Math.min(maxHp(), S.hp + 5); }
    else if (choice === 'fp') { S.maxFp += 5; S.fp = Math.min(maxFp(), S.fp + 5); }
    else { S.bp += 3; }
  }

  /* ---- derived stats ----------------------------------------------------- */
  function badgeMods() { return PB.Badges.mods(S ? S.badges.equipped : []); }
  function maxHp() { return S.maxHp + (badgeMods().maxHp || 0); }
  function maxFp() { return S.maxFp + (badgeMods().maxFp || 0); }
  function maxBp() { return S.bp + (badgeMods().bonusBp || 0); }
  function bpUsed() { return PB.Badges.cost(S.badges.equipped); }
  function bpFree() { return maxBp() - bpUsed(); }
  function partnerMaxHp(id) {
    var p = S.partners[id]; if (!p) return 0;
    return PB.Partners.maxHp(id, p.rank) + (badgeMods().maxHpP || 0);
  }
  function heal(hp, fp) {
    if (hp) S.hp = U.clamp(S.hp + hp, 0, maxHp());
    if (fp) S.fp = U.clamp(S.fp + fp, 0, maxFp());
  }
  function healParty(hp) {
    heal(hp, 0);
    var a = S.active;
    if (a && S.partners[a]) S.partners[a].hp = U.clamp(S.partners[a].hp + hp, 0, partnerMaxHp(a));
  }
  function fullHeal() {
    S.hp = maxHp(); S.fp = maxFp();
    for (var k in S.partners) S.partners[k].hp = partnerMaxHp(k);
  }
  function addSe(n) { S.se = U.clamp(S.se + n, 0, S.maxSe); }

  /* ---- partners ---------------------------------------------------------- */
  function givePartner(id) {
    if (S.partners[id]) return false;
    S.partners[id] = { rank: 1, hp: PB.Partners.maxHp(id, 1) };
    if (!S.active) S.active = id;
    return true;
  }
  function hasPartner(id) { return !!S.partners[id]; }
  function partnerList() {
    return PB.Partners.order.filter(function (id) { return !!S.partners[id]; });
  }
  function rankUp(id) {
    var p = S.partners[id]; if (!p || p.rank >= 3) return false;
    p.rank++;
    p.hp = partnerMaxHp(id);
    return true;
  }
  function setActive(id) { if (S.partners[id]) S.active = id; }
  function activePartner() { return S.active && S.partners[S.active] ? S.active : null; }

  /* ---- inventory --------------------------------------------------------- */
  function itemCount() { return S.items.length; }
  function addItem(id, toStore) {
    if (!PB.Items.get(id)) return false;
    if (PB.Items.isKey(id)) return addKey(id);
    if (!toStore && S.items.length < ITEM_CAP) { S.items.push(id); return true; }
    if (S.store.length < STORE_CAP) { S.store.push(id); return 'store'; }
    return false;
  }
  function removeItem(id) {
    var i = S.items.indexOf(id);
    if (i < 0) return false;
    S.items.splice(i, 1); return true;
  }
  function hasItem(id) { return S.items.indexOf(id) >= 0; }
  function addKey(id) {
    if (S.keyItems.indexOf(id) >= 0) return false;
    if (S.keyItems.length >= KEY_CAP) return false;
    S.keyItems.push(id); return true;
  }
  function hasKey(id) { return S.keyItems.indexOf(id) >= 0; }
  function removeKey(id) {
    var i = S.keyItems.indexOf(id);
    if (i < 0) return false;
    S.keyItems.splice(i, 1); return true;
  }
  function addCoins(n) {
    var m = badgeMods();
    if (n > 0 && m.coinBonus) n = Math.round(n * (1 + m.coinBonus));
    S.coins = U.clamp(S.coins + n, 0, 9999);
    return n;
  }

  /* ---- badges / forms / seals -------------------------------------------- */
  function giveBadge(id) {
    if (!PB.Badges.get(id) || S.badges.owned.indexOf(id) >= 0) return false;
    S.badges.owned.push(id); return true;
  }
  function hasBadge(id) { return S.badges.owned.indexOf(id) >= 0; }
  function isEquipped(id) { return S.badges.equipped.indexOf(id) >= 0; }
  function equipBadge(id) {
    if (!hasBadge(id) || isEquipped(id)) return false;
    var b = PB.Badges.get(id);
    if (b.bp > bpFree()) return false;
    S.badges.equipped.push(id); return true;
  }
  function unequipBadge(id) {
    var i = S.badges.equipped.indexOf(id);
    if (i < 0) return false;
    S.badges.equipped.splice(i, 1);
    S.hp = Math.min(S.hp, maxHp()); S.fp = Math.min(S.fp, maxFp());
    return true;
  }
  function unlockForm(id) {
    if (S.forms.indexOf(id) >= 0) return false;
    S.forms.push(id); return true;
  }
  function unlockSeal(id) {
    if (S.seals.indexOf(id) >= 0) return false;
    S.seals.push(id);
    S.maxSe = Math.min(700, 100 + S.seals.length * 100);
    S.se = S.maxSe;
    return true;
  }
  function learnRecipe(id) {
    if (S.recipes.indexOf(id) >= 0) return false;
    S.recipes.push(id); return true;
  }

  /* ---- flags & quests ----------------------------------------------------- */
  function flag(k, v) {
    if (v === undefined) return S.flags[k];
    S.flags[k] = v; return v;
  }
  function hasFlag(k) { return !!S.flags[k]; }
  function questStart(id) { if (!S.quests[id]) S.quests[id] = { state: 'open', p: 0 }; }
  function questProgress(id, n) {
    if (!S.quests[id]) questStart(id);
    S.quests[id].p += (n === undefined ? 1 : n);
  }
  function questDone(id) { if (!S.quests[id]) questStart(id); S.quests[id].state = 'done'; }
  function questState(id) { return S.quests[id] ? S.quests[id].state : 'none'; }
  function tattle(id) { S.tattled[id] = true; }
  function isTattled(id) { return !!S.tattled[id]; }
  function recordDefeat(id) { S.defeated[id] = (S.defeated[id] || 0) + 1; }

  /* ---- difficulty ---------------------------------------------------------
     Damage the player takes is scaled; Seal Point income moves the other way
     so a harder run also levels a little faster. */
  var DIFF = {
    relaxed: { inDmg: .6, outDmg: 1.25, sp: .85, label: 'Relaxed' },
    normal: { inDmg: 1, outDmg: 1, sp: 1, label: 'Normal' },
    folded: { inDmg: 1.5, outDmg: .9, sp: 1.3, label: 'Folded' }
  };
  function diff() { return DIFF[S && S.difficulty ? S.difficulty : 'normal']; }

  /* ---- persistence -------------------------------------------------------- */
  function canStore() {
    try { return typeof localStorage !== 'undefined'; } catch (e) { return false; }
  }
  function save(slot) {
    if (!canStore() || !S) return false;
    try {
      localStorage.setItem(SAVE_KEY + slot, JSON.stringify(S));
      return true;
    } catch (e) { return false; }
  }
  function load(slot) {
    if (!canStore()) return null;
    try {
      var raw = localStorage.getItem(SAVE_KEY + slot);
      if (!raw) return null;
      var o = JSON.parse(raw);
      S = o; migrate();
      return S;
    } catch (e) { return null; }
  }
  function peek(slot) {
    if (!canStore()) return null;
    try {
      var raw = localStorage.getItem(SAVE_KEY + slot);
      if (!raw) return null;
      var o = JSON.parse(raw);
      return {
        name: o.name, level: o.level, chapter: o.chapter, coins: o.coins,
        frames: o.frames, map: o.map, seals: (o.seals || []).length,
        difficulty: o.difficulty || 'normal'
      };
    } catch (e) { return null; }
  }
  function erase(slot) {
    if (!canStore()) return;
    try { localStorage.removeItem(SAVE_KEY + slot); } catch (e) { }
  }
  function saveConfig(cfg) {
    if (!canStore()) return;
    try { localStorage.setItem(CFG_KEY, JSON.stringify(cfg)); } catch (e) { }
  }
  function loadConfig() {
    if (!canStore()) return null;
    try { return JSON.parse(localStorage.getItem(CFG_KEY) || 'null'); } catch (e) { return null; }
  }

  return {
    VERSION: VERSION, ITEM_CAP: ITEM_CAP, STORE_CAP: STORE_CAP,
    fresh: fresh, start: start, get: get, set: set,
    spToNext: spToNext, addSp: addSp, applyLevelChoice: applyLevelChoice,
    badgeMods: badgeMods, maxHp: maxHp, maxFp: maxFp, maxBp: maxBp,
    bpUsed: bpUsed, bpFree: bpFree, partnerMaxHp: partnerMaxHp,
    heal: heal, healParty: healParty, fullHeal: fullHeal, addSe: addSe,
    givePartner: givePartner, hasPartner: hasPartner, partnerList: partnerList,
    rankUp: rankUp, setActive: setActive, activePartner: activePartner,
    itemCount: itemCount, addItem: addItem, removeItem: removeItem, hasItem: hasItem,
    addKey: addKey, hasKey: hasKey, removeKey: removeKey, addCoins: addCoins,
    giveBadge: giveBadge, hasBadge: hasBadge, isEquipped: isEquipped,
    equipBadge: equipBadge, unequipBadge: unequipBadge,
    unlockForm: unlockForm, unlockSeal: unlockSeal, learnRecipe: learnRecipe,
    flag: flag, hasFlag: hasFlag,
    questStart: questStart, questProgress: questProgress, questDone: questDone, questState: questState,
    tattle: tattle, isTattled: isTattled, recordDefeat: recordDefeat,
    diff: diff, DIFF: DIFF,
    save: save, load: load, peek: peek, erase: erase,
    saveConfig: saveConfig, loadConfig: loadConfig
  };
})();

/* ===== 12_actioncmd.js ===== */
/* ==========================================================================
   PAPERBOUND — 12_actioncmd.js
   Nine timed minigames, one per attack style. Each returns
     { tier: 0 | 1 | 2, ratio: 0..1 }
   where tier 2 is a perfect and opens the Stylish window.

   Widgets draw themselves near the bottom of the battle stage. The exact
   perfect band is only drawn when the Timing Tutor badge is worn.
   ========================================================================== */
'use strict';

PB.ActionCmd = (function () {
  var U = PB.U, P = PB.Paper, In = PB.Input, A = PB.Audio;

  var SEQ_KEYS = ['left', 'right', 'up', 'down'];
  var SEQ_GLYPH = { left: '◀', right: '▶', up: '▲', down: '▼' };

  function Cmd(spec, opts) {
    opts = opts || {};
    this.spec = spec || { type: 'none' };
    this.type = this.spec.type || 'none';
    this.tutor = !!opts.tutor;
    this.label = opts.label || '';
    this.t = 0;
    this.done = false;
    this.result = null;
    this.flash = 0;
    this.pop = [];              // little feedback bursts
    this.init();
  }

  Cmd.prototype.init = function () {
    var s = this.spec;
    switch (this.type) {
      case 'press':
        this.dur = s.dur || 46;
        this.good = s.good || [0.6, 0.88];
        this.perfect = s.perfect || [0.7, 0.8];
        this.pressed = -1;
        break;
      case 'charge':
        this.dur = s.dur || 66;
        this.zone = s.zone || [0.7, 0.94];
        this.charge = 0; this.released = -1; this.startedHold = false; this.overshoot = false;
        break;
      case 'mash':
        this.dur = s.dur || 60; this.need = s.need || 16; this.count = 0; this.last = false;
        break;
      case 'multi':
        this.n = s.n || 4; this.spacing = s.spacing || 24; this.rising = !!s.rising;
        this.idx = 0; this.hits = 0; this.windowW = 9; this.nextAt = this.spacing;
        this.marks = []; this.missedChain = false;
        this.dur = this.spacing * (this.n + 1);
        break;
      case 'seq':
        this.n = s.n || 4; this.keys = []; this.idx = 0; this.fails = 0;
        for (var i = 0; i < this.n; i++) this.keys.push(SEQ_KEYS[U.rndInt(4)]);
        this.dur = 34 + this.n * 22;
        break;
      case 'aim':
        this.dur = s.dur || 110; this.speed = s.speed || 0.026; this.zoneW = s.zone || 0.17;
        this.zoneC = 0.32 + U.rnd() * 0.36;
        this.cursor = 0; this.dir = 1; this.stopped = -1;
        break;
      case 'hold':
        this.dur = s.dur || 78; this.width = s.width || 0.2;
        this.needle = 0.5; this.vel = 0; this.zoneC = 0.5; this.inFrames = 0;
        this.drift = (U.rnd() < .5 ? -1 : 1) * 0.0035;
        break;
      case 'rotate':
        this.dur = s.dur || 72; this.need = s.target || 16; this.count = 0; this.want = 'left';
        this.spin = 0;
        break;
      default:
        this.dur = 1;
    }
  };

  /* Returns true when finished. */
  Cmd.prototype.update = function () {
    if (this.done) return true;
    this.t++;
    if (this.flash > 0) this.flash--;
    for (var i = this.pop.length - 1; i >= 0; i--) {
      var p = this.pop[i]; p.t++; p.y -= 0.8; if (p.t > 30) this.pop.splice(i, 1);
    }
    var f = this['up_' + this.type];
    if (f) f.call(this); else this.finish(1, 1);
    return this.done;
  };

  Cmd.prototype.finish = function (tier, ratio) {
    this.done = true;
    this.result = { tier: tier, ratio: U.clamp(ratio, 0, 1) };
    if (tier === 2) A.sfx('stylish');
    else if (tier === 1) A.sfx('blip2');
    else A.sfx('error');
  };
  Cmd.prototype.burst = function (txt, color) {
    this.pop.push({ txt: txt, c: color || '#fff', t: 0, y: 0, x: U.rndRange(-14, 14) });
  };

  /* ---- press ------------------------------------------------------------- */
  Cmd.prototype.up_press = function () {
    var p = this.t / this.dur;
    if (this.pressed < 0 && (In.pressed('a') || In.consume('a'))) {
      this.pressed = p;
      if (p >= this.perfect[0] && p <= this.perfect[1]) { this.burst('PERFECT', '#ffe066'); this.finish(2, 1); }
      else if (p >= this.good[0] && p <= this.good[1]) { this.burst('GOOD', '#8fcf52'); this.finish(1, .75); }
      else { this.burst('MISS', '#e0483c'); this.finish(0, 0); }
      return;
    }
    if (this.t > this.dur) { this.burst('MISS', '#e0483c'); this.finish(0, 0); }
  };

  /* ---- charge ------------------------------------------------------------ */
  Cmd.prototype.up_charge = function () {
    if (In.down('a')) { this.startedHold = true; this.charge = Math.min(1.25, this.charge + 1 / this.dur); }
    if (this.charge > 0.02 && !In.down('a')) {
      var c = this.charge;
      if (c > 1.02) { this.burst('OVER!', '#e0483c'); this.finish(0, 0); return; }
      var mid = (this.zone[0] + this.zone[1]) / 2, half = (this.zone[1] - this.zone[0]) / 2;
      var d = Math.abs(c - mid);
      if (d <= half * 0.36) { this.burst('PERFECT', '#ffe066'); this.finish(2, 1); }
      else if (c >= this.zone[0] && c <= this.zone[1]) { this.burst('GOOD', '#8fcf52'); this.finish(1, .78); }
      else { this.burst('MISS', '#e0483c'); this.finish(0, Math.max(0, c * .4)); }
      return;
    }
    if (this.charge >= 1.25 || this.t > this.dur * 1.6) { this.burst('OVER!', '#e0483c'); this.finish(0, 0); }
  };

  /* ---- mash -------------------------------------------------------------- */
  Cmd.prototype.up_mash = function () {
    if (In.pressed('a')) { this.count++; A.sfx('blip', 1 + this.count * 0.012); }
    if (this.t >= this.dur) {
      var r = this.count / this.need;
      if (r >= 1) { this.burst('PERFECT', '#ffe066'); this.finish(2, 1); }
      else if (r >= 0.55) { this.burst('GOOD', '#8fcf52'); this.finish(1, U.clamp(r, .5, .99)); }
      else { this.burst('WEAK', '#e0483c'); this.finish(0, r * .5); }
    }
  };

  /* ---- multi ------------------------------------------------------------- */
  Cmd.prototype.up_multi = function () {
    // spawn a mark every `spacing` frames
    if (this.idx < this.n && this.t >= this.nextAt) {
      this.marks.push({ at: this.t + this.spacing, hit: false, resolved: false });
      this.idx++; this.nextAt += this.spacing;
    }
    var press = In.pressed('a');
    for (var i = 0; i < this.marks.length; i++) {
      var mk = this.marks[i];
      if (mk.resolved) continue;
      var d = this.t - mk.at;
      if (press && Math.abs(d) <= this.windowW) {
        mk.hit = true; mk.resolved = true; this.hits++; press = false;
        A.sfx('blip2', 1 + this.hits * 0.05);
        this.burst('' + this.hits, '#8fcf52');
      } else if (d > this.windowW) {
        mk.resolved = true;
        if (!this.missedChain) { this.missedChain = true; }
      }
    }
    if (this.t > this.dur + this.spacing) {
      var r = this.hits / this.n;
      if (r >= 1) { this.burst('PERFECT', '#ffe066'); this.finish(2, 1); }
      else if (this.hits > 0) this.finish(1, r);
      else { this.burst('MISS', '#e0483c'); this.finish(0, 0); }
    }
  };

  /* ---- seq --------------------------------------------------------------- */
  Cmd.prototype.up_seq = function () {
    var k, i;
    for (i = 0; i < SEQ_KEYS.length; i++) {
      k = SEQ_KEYS[i];
      if (In.pressed(k)) {
        if (k === this.keys[this.idx]) {
          this.idx++; A.sfx('blip2', 1 + this.idx * 0.06); this.flash = 6;
          if (this.idx >= this.n) { this.burst('PERFECT', '#ffe066'); this.finish(2, 1); return; }
        } else {
          this.fails++; A.sfx('error'); this.flash = 10;
          if (this.fails >= 2) {
            var r0 = this.idx / this.n;
            if (r0 > 0) { this.finish(1, r0 * .8); } else this.finish(0, 0);
            return;
          }
        }
      }
    }
    if (this.t >= this.dur) {
      var r = this.idx / this.n;
      if (r >= 0.5) { this.burst('GOOD', '#8fcf52'); this.finish(1, r); }
      else { this.burst('TOO SLOW', '#e0483c'); this.finish(0, r * .4); }
    }
  };

  /* ---- aim --------------------------------------------------------------- */
  Cmd.prototype.up_aim = function () {
    if (this.stopped < 0) {
      this.cursor += this.speed * this.dir;
      if (this.cursor > 1) { this.cursor = 1; this.dir = -1; }
      if (this.cursor < 0) { this.cursor = 0; this.dir = 1; }
      if (In.pressed('a')) {
        this.stopped = this.cursor;
        var d = Math.abs(this.cursor - this.zoneC);
        if (d <= this.zoneW * 0.3) { this.burst('BULLSEYE', '#ffe066'); this.finish(2, 1); }
        else if (d <= this.zoneW) { this.burst('HIT', '#8fcf52'); this.finish(1, 1 - d / this.zoneW * .35); }
        else { this.burst('WIDE', '#e0483c'); this.finish(0, 0); }
        return;
      }
    }
    if (this.t >= this.dur) { this.burst('MISS', '#e0483c'); this.finish(0, 0); }
  };

  /* ---- hold -------------------------------------------------------------- */
  Cmd.prototype.up_hold = function () {
    var ax = In.axisX();
    this.vel += ax * 0.0026 + this.drift;
    if (this.t % 46 === 0) this.drift = -this.drift * (0.7 + U.rnd() * .6);
    this.vel *= 0.9;
    this.needle = U.clamp(this.needle + this.vel, 0, 1);
    if (this.needle <= 0 || this.needle >= 1) this.vel = 0;
    this.zoneC = 0.5 + Math.sin(this.t * 0.021) * 0.2;
    var inside = Math.abs(this.needle - this.zoneC) <= this.width / 2;
    if (inside) { this.inFrames++; if (this.t % 8 === 0) A.sfx('blip', 1.4); }
    if (this.t >= this.dur) {
      var r = this.inFrames / this.dur;
      if (r >= 0.85) { this.burst('PERFECT', '#ffe066'); this.finish(2, 1); }
      else if (r >= 0.45) { this.burst('GOOD', '#8fcf52'); this.finish(1, r); }
      else { this.burst('SLIPPED', '#e0483c'); this.finish(0, r * .5); }
    }
  };

  /* ---- rotate ------------------------------------------------------------ */
  Cmd.prototype.up_rotate = function () {
    if (In.pressed(this.want)) {
      this.count++; this.want = this.want === 'left' ? 'right' : 'left';
      this.spin += 0.7; A.sfx('blip', 1 + this.count * 0.02);
    } else if (In.pressed(this.want === 'left' ? 'right' : 'left')) {
      this.spin += 0.1;
    }
    this.spin *= 0.94;
    if (this.t >= this.dur) {
      var r = this.count / this.need;
      if (r >= 1) { this.burst('PERFECT', '#ffe066'); this.finish(2, 1); }
      else if (r >= 0.55) { this.burst('GOOD', '#8fcf52'); this.finish(1, U.clamp(r, .5, .99)); }
      else { this.burst('SLOW', '#e0483c'); this.finish(0, r * .5); }
    }
  };

  /* ======================================================================
     DRAWING
     ====================================================================== */
  var BW = 260, BH = 20;

  Cmd.prototype.draw = function (ctx, cx, cy) {
    if (this.type === 'none') return;
    ctx.save();
    var f = this['dr_' + this.type];
    if (f) f.call(this, ctx, cx, cy);
    // hint label
    if (this.label) P.text(ctx, this.label, cx, cy - 30, { size: 13, align: 'center', color: '#fff8e0' });
    // feedback pops
    for (var i = 0; i < this.pop.length; i++) {
      var p = this.pop[i];
      ctx.globalAlpha = U.clamp(1 - p.t / 30, 0, 1);
      P.text(ctx, p.txt, cx + p.x, cy - 42 + p.y, { size: 20, align: 'center', color: p.c });
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  };

  function track(ctx, cx, cy, w, h) {
    P.rr(ctx, cx - w / 2 - 3, cy - h / 2 - 3, w + 6, h + 6, 8, 'rgba(28,18,45,0.72)', '#f7edd6', 2.5);
    P.rr(ctx, cx - w / 2, cy - h / 2, w, h, 5, '#4a3a5c', null, 0);
  }

  Cmd.prototype.dr_press = function (ctx, cx, cy) {
    track(ctx, cx, cy, BW, BH);
    var x0 = cx - BW / 2;
    // target band
    P.rr(ctx, x0 + BW * this.good[0], cy - BH / 2, BW * (this.good[1] - this.good[0]), BH, 3, 'rgba(143,207,82,0.5)', null, 0);
    if (this.tutor) P.rr(ctx, x0 + BW * this.perfect[0], cy - BH / 2, BW * (this.perfect[1] - this.perfect[0]), BH, 3, 'rgba(255,224,102,0.85)', null, 0);
    var p = U.clamp(this.t / this.dur, 0, 1);
    var mx = x0 + BW * p;
    P.rr(ctx, mx - 3, cy - BH / 2 - 5, 6, BH + 10, 3, '#fff8e0', '#2a1c3c', 2);
    P.text(ctx, 'Z', cx, cy + BH / 2 + 18, { size: 12, align: 'center', color: '#f7edd6' });
  };

  Cmd.prototype.dr_charge = function (ctx, cx, cy) {
    track(ctx, cx, cy, BW, BH);
    var x0 = cx - BW / 2;
    P.rr(ctx, x0 + BW * this.zone[0], cy - BH / 2, BW * (this.zone[1] - this.zone[0]), BH, 3, 'rgba(143,207,82,0.5)', null, 0);
    if (this.tutor) {
      var mid = (this.zone[0] + this.zone[1]) / 2, half = (this.zone[1] - this.zone[0]) / 2 * 0.36;
      P.rr(ctx, x0 + BW * (mid - half), cy - BH / 2, BW * half * 2, BH, 3, 'rgba(255,224,102,0.85)', null, 0);
    }
    var c = U.clamp(this.charge, 0, 1.25);
    var col = c > 1.02 ? '#e0483c' : (c >= this.zone[0] ? '#ffe066' : '#57b8ea');
    P.rr(ctx, x0, cy - BH / 2, BW * Math.min(1, c), BH, 3, col, null, 0);
    if (c > 1) {
      ctx.globalAlpha = .5 + Math.sin(this.t * .5) * .4;
      P.rr(ctx, x0, cy - BH / 2, BW, BH, 3, '#e0483c', null, 0);
      ctx.globalAlpha = 1;
    }
    P.text(ctx, In.down('a') ? 'release Z in the band' : 'HOLD Z', cx, cy + BH / 2 + 18, { size: 12, align: 'center', color: '#f7edd6' });
  };

  Cmd.prototype.dr_mash = function (ctx, cx, cy) {
    track(ctx, cx, cy, BW, BH);
    var x0 = cx - BW / 2;
    var r = U.clamp(this.count / this.need, 0, 1);
    P.rr(ctx, x0, cy - BH / 2, BW * r, BH, 3, r >= 1 ? '#ffe066' : '#8fcf52', null, 0);
    P.line(ctx, [[x0 + BW * 0.55, cy - BH / 2 - 4], [x0 + BW * 0.55, cy + BH / 2 + 4]], '#f7edd6', 2);
    // time remaining
    var tr = 1 - U.clamp(this.t / this.dur, 0, 1);
    P.rr(ctx, x0, cy + BH / 2 + 6, BW * tr, 4, 2, '#e0483c', null, 0);
    P.text(ctx, 'MASH Z!  ' + this.count + '/' + this.need, cx, cy + BH / 2 + 26, { size: 12, align: 'center', color: '#f7edd6' });
  };

  Cmd.prototype.dr_multi = function (ctx, cx, cy) {
    var y = cy;
    P.rr(ctx, cx - BW / 2 - 3, y - 16, BW + 6, 32, 8, 'rgba(28,18,45,0.72)', '#f7edd6', 2.5);
    // the target ring sits in the centre; marks converge on it
    P.ell(ctx, cx, y, 13, 13, null, '#ffe066', 3);
    for (var i = 0; i < this.marks.length; i++) {
      var mk = this.marks[i];
      var d = mk.at - this.t;
      if (mk.resolved && !mk.hit) continue;
      if (mk.hit) continue;
      if (d < -this.windowW || d > this.spacing * 1.6) continue;
      var px = cx + (d / (this.spacing * 1.6)) * (BW / 2 - 6);
      P.ell(ctx, px, y, 8, 8, '#57b8ea', '#f7edd6', 2);
    }
    P.text(ctx, 'Z on the ring   ' + this.hits + '/' + this.n, cx, y + 30, { size: 12, align: 'center', color: '#f7edd6' });
  };

  Cmd.prototype.dr_seq = function (ctx, cx, cy) {
    var n = this.n, gap = 34, w = n * gap;
    P.rr(ctx, cx - w / 2 - 12, cy - 22, w + 24, 44, 10, 'rgba(28,18,45,0.72)', '#f7edd6', 2.5);
    for (var i = 0; i < n; i++) {
      var x = cx - w / 2 + gap * i + gap / 2;
      var doneK = i < this.idx;
      var cur = i === this.idx;
      P.rr(ctx, x - 14, cy - 15, 28, 30, 6, doneK ? '#8fcf52' : (cur ? '#ffe066' : '#4a3a5c'), '#2a1c3c', 2);
      P.text(ctx, SEQ_GLYPH[this.keys[i]], x, cy + 8, { size: 18, align: 'center', color: doneK || cur ? '#2a1c3c' : '#f7edd6', outline: false, shadow: false });
    }
    var tr = 1 - U.clamp(this.t / this.dur, 0, 1);
    P.rr(ctx, cx - w / 2, cy + 22, w * tr, 4, 2, '#e0483c', null, 0);
    if (this.flash > 0) {
      ctx.globalAlpha = this.flash / 10 * .4;
      P.rr(ctx, cx - w / 2 - 12, cy - 22, w + 24, 44, 10, '#e0483c', null, 0);
      ctx.globalAlpha = 1;
    }
  };

  Cmd.prototype.dr_aim = function (ctx, cx, cy) {
    track(ctx, cx, cy, BW, BH);
    var x0 = cx - BW / 2;
    var zc = this.zoneC, zw = this.zoneW;
    P.rr(ctx, x0 + BW * (zc - zw), cy - BH / 2, BW * zw * 2, BH, 3, 'rgba(143,207,82,0.45)', null, 0);
    P.rr(ctx, x0 + BW * (zc - zw * .3), cy - BH / 2, BW * zw * .6, BH, 3, 'rgba(255,224,102,0.8)', null, 0);
    var mx = x0 + BW * (this.stopped >= 0 ? this.stopped : this.cursor);
    P.poly(ctx, [[mx, cy - BH / 2 - 10], [mx - 6, cy - BH / 2 - 20], [mx + 6, cy - BH / 2 - 20]], '#fff8e0', '#2a1c3c', 2);
    P.rr(ctx, mx - 2, cy - BH / 2, 4, BH, 2, '#fff8e0', null, 0);
    P.text(ctx, 'Z to fire', cx, cy + BH / 2 + 18, { size: 12, align: 'center', color: '#f7edd6' });
  };

  Cmd.prototype.dr_hold = function (ctx, cx, cy) {
    track(ctx, cx, cy, BW, BH);
    var x0 = cx - BW / 2;
    P.rr(ctx, x0 + BW * (this.zoneC - this.width / 2), cy - BH / 2, BW * this.width, BH, 3, 'rgba(143,207,82,0.55)', null, 0);
    var mx = x0 + BW * this.needle;
    var inside = Math.abs(this.needle - this.zoneC) <= this.width / 2;
    P.rr(ctx, mx - 3, cy - BH / 2 - 6, 6, BH + 12, 3, inside ? '#ffe066' : '#e0483c', '#2a1c3c', 2);
    var r = this.inFrames / this.dur;
    P.rr(ctx, x0, cy + BH / 2 + 7, BW * r, 5, 2, '#8fcf52', null, 0);
    P.text(ctx, '◀ ▶ keep it in the band', cx, cy + BH / 2 + 26, { size: 12, align: 'center', color: '#f7edd6' });
  };

  Cmd.prototype.dr_rotate = function (ctx, cx, cy) {
    P.rr(ctx, cx - 90, cy - 30, 180, 60, 10, 'rgba(28,18,45,0.72)', '#f7edd6', 2.5);
    ctx.save();
    ctx.translate(cx - 44, cy);
    ctx.rotate(this.count * 0.5 + this.spin);
    P.ell(ctx, 0, 0, 19, 19, null, '#f7edd6', 3);
    P.ell(ctx, 0, -19, 5.5, 5.5, '#ffe066', '#2a1c3c', 2);
    ctx.restore();
    var glyph = this.want === 'left' ? '◀' : '▶';
    P.text(ctx, glyph, cx + 22, cy + 9, { size: 26, align: 'center', color: '#ffe066' });
    var r = U.clamp(this.count / this.need, 0, 1);
    P.rr(ctx, cx - 6, cy + 16, 88 * r, 5, 2, '#8fcf52', null, 0);
    P.text(ctx, this.count + '/' + this.need, cx + 60, cy - 12, { size: 12, align: 'center', color: '#f7edd6' });
    var tr = 1 - U.clamp(this.t / this.dur, 0, 1);
    P.rr(ctx, cx - 84, cy + 24, 168 * tr, 3, 2, '#e0483c', null, 0);
  };

  /* ======================================================================
     GUARD — the defensive counterpart. Not a Cmd; the battle scene drives it
     directly because it has to interleave with enemy attack animation.
     ====================================================================== */
  function Guard(impactFrame) {
    this.impact = impactFrame;
    this.t = 0;
    this.result = 'none';   // none | guard | superguard
    this.pressedAt = -1;
    this.usedA = false; this.usedB = false;
  }
  Guard.GUARD_WINDOW = 9;
  Guard.SUPER_WINDOW = 4;

  Guard.prototype.update = function () {
    this.t++;
    var d = this.impact - this.t;   // frames until impact
    if (!this.usedB && In.pressed('b')) {
      this.usedB = true;
      if (d >= -1 && d <= Guard.SUPER_WINDOW) { this.result = 'superguard'; A.sfx('superguard'); }
      else A.sfx('error');
    }
    if (!this.usedA && In.pressed('a')) {
      this.usedA = true;
      if (d >= -1 && d <= Guard.GUARD_WINDOW && this.result === 'none') { this.result = 'guard'; A.sfx('guard'); }
      else if (this.result === 'none') A.sfx('error');
    }
    return this.t >= this.impact;
  };
  Guard.prototype.draw = function (ctx, cx, cy) {
    var d = this.impact - this.t;
    if (d > 40 || d < -6) return;
    var a = U.clamp(1 - Math.abs(d) / 40, 0, 1);
    ctx.save();
    ctx.globalAlpha = a * .9;
    P.ell(ctx, cx, cy, 26 + d * 1.1, 26 + d * 1.1, null, d <= Guard.SUPER_WINDOW ? '#ffe066' : '#f7edd6', 3);
    P.ell(ctx, cx, cy, 12, 12, null, '#57b8ea', 2.5);
    ctx.restore();
  };

  function make(spec, opts) { return new Cmd(spec, opts); }

  return { Cmd: Cmd, make: make, Guard: Guard, SEQ_GLYPH: SEQ_GLYPH };
})();

/* ===== 13_ui.js ===== */
/* ==========================================================================
   PAPERBOUND — 13_ui.js
   Dialogue boxes with a typewriter and inline styling, list menus, the field
   HUD, toasts, and screen transitions.

   Inline tags understood by the dialogue box:
     <c:#ffcc00>coloured</c>   <w>wavy</w>   <s>shaky</s>
     <b>big</b>                <d>slow</d>   |  (pause for input)
   ========================================================================== */
'use strict';

PB.UI = (function () {
  var U = PB.U, P = PB.Paper, In = PB.Input, A = PB.Audio, Spr = PB.Sprites;

  var W = 960, H = 540;

  /* ======================================================================
     Text parsing
     ====================================================================== */
  function parse(str) {
    var out = [], i = 0;
    var color = null, wave = false, shake = false, big = false, slow = false;
    while (i < str.length) {
      if (str[i] === '<') {
        var close = str.indexOf('>', i);
        if (close > 0) {
          var tag = str.slice(i + 1, close);
          i = close + 1;
          if (tag[0] === '/') {
            if (tag === '/c') color = null;
            else if (tag === '/w') wave = false;
            else if (tag === '/s') shake = false;
            else if (tag === '/b') big = false;
            else if (tag === '/d') slow = false;
          } else if (tag.indexOf('c:') === 0) color = tag.slice(2);
          else if (tag === 'w') wave = true;
          else if (tag === 's') shake = true;
          else if (tag === 'b') big = true;
          else if (tag === 'd') slow = true;
          continue;
        }
      }
      out.push({ ch: str[i], color: color, wave: wave, shake: shake, big: big, slow: slow });
      i++;
    }
    return out;
  }

  function layout(ctx, chars, maxW, size) {
    // greedy word wrap over the styled character list
    var lines = [[]], cur = lines[0], w = 0;
    var word = [], wordW = 0;
    ctx.save();
    function flushWord() {
      if (!word.length) return;
      if (w + wordW > maxW && cur.length) { lines.push(cur = []); w = 0; }
      for (var k = 0; k < word.length; k++) cur.push(word[k]);
      w += wordW; word = []; wordW = 0;
    }
    for (var i = 0; i < chars.length; i++) {
      var c = chars[i];
      if (c.ch === '\n') { flushWord(); lines.push(cur = []); w = 0; continue; }
      ctx.font = P.font(c.big ? size * 1.3 : size);
      var cw = ctx.measureText(c.ch).width;
      c.w = cw;
      if (c.ch === ' ') { flushWord(); if (cur.length) { cur.push(c); w += cw; } }
      else { word.push(c); wordW += cw; }
    }
    flushWord();
    ctx.restore();
    return lines;
  }

  /* ======================================================================
     Dialogue box
     ====================================================================== */
  function Dialogue() {
    this.active = false;
    this.queue = [];
    this.lines = [];
    this.shown = 0;
    this.t = 0;
    this.speaker = '';
    this.portrait = null;
    this.style = 'normal';
    this.choices = null;
    this.choiceIdx = 0;
    this.onChoice = null;
    this.waitInput = false;
    this.doneCb = null;
    this.speed = 1.6;
    this.total = 0;
    this.holdFast = false;
    this.anchor = null;      // {x,y} world-space tail target
    this.pageBreak = -1;
  }

  Dialogue.prototype.say = function (text, opts) {
    opts = opts || {};
    this.queue.push({ text: text, opts: opts });
    if (!this.active) this.next();
  };
  Dialogue.prototype.ask = function (text, choices, cb, opts) {
    opts = opts || {};
    opts.choices = choices; opts.onChoice = cb;
    this.queue.push({ text: text, opts: opts });
    if (!this.active) this.next();
  };
  Dialogue.prototype.next = function () {
    if (!this.queue.length) {
      this.active = false;
      var cb = this.doneCb; this.doneCb = null;
      if (cb) cb();
      return;
    }
    var q = this.queue.shift();
    var o = q.opts;
    this.active = true;
    this.speaker = o.speaker || '';
    this.portrait = o.portrait || null;
    this.style = o.style || 'normal';
    this.choices = o.choices || null;
    this.onChoice = o.onChoice || null;
    this.choiceIdx = 0;
    this.anchor = o.anchor || null;
    this.chars = parse(q.text);
    this.shown = 0; this.t = 0; this.waitInput = false;
    this.lines = null;   // laid out lazily on first draw (needs ctx)
    this.speed = o.speed || 1.6;
    A.sfx('blip');
  };
  Dialogue.prototype.skipAll = function () {
    this.queue.length = 0; this.active = false; this.choices = null;
    var cb = this.doneCb; this.doneCb = null; if (cb) cb();
  };
  Dialogue.prototype.isBusy = function () { return this.active; };

  Dialogue.prototype.update = function () {
    if (!this.active) return;
    this.t++;
    if (this.choices && this.shown >= this.chars.length) {
      if (In.pressed('up')) { this.choiceIdx = U.wrap(this.choiceIdx - 1, this.choices.length); A.sfx('cursor'); }
      if (In.pressed('down')) { this.choiceIdx = U.wrap(this.choiceIdx + 1, this.choices.length); A.sfx('cursor'); }
      if (In.pressed('a')) {
        A.sfx('ok');
        var idx = this.choiceIdx, cb = this.onChoice;
        this.choices = null; this.onChoice = null;
        this.next();
        if (cb) cb(idx);
      }
      return;
    }
    if (this.shown < this.chars.length) {
      var sp = this.speed * ((In.down('a') || In.down('b')) ? 4 : 1);
      var before = Math.floor(this.shown);
      this.shown = Math.min(this.chars.length, this.shown + sp);
      var after = Math.floor(this.shown);
      if (after > before) {
        var c = this.chars[after - 1];
        if (c && c.ch !== ' ' && after % 2 === 0) A.sfx(this.style === 'boss' ? 'blip' : 'blip2', 0.85 + U.rnd() * .3);
      }
      if (In.pressed('a') && this.t > 4) this.shown = this.chars.length;
    } else {
      if (In.pressed('a')) { A.sfx('ok'); this.next(); }
    }
  };

  Dialogue.prototype.draw = function (ctx) {
    if (!this.active) return;
    var bw = 720, bh = 128;
    var bx = (W - bw) / 2, by = H - bh - 26;
    if (this.style === 'top') by = 26;

    var fill = '#fffdf5', edge = '#3a2a1a', txtCol = '#2a1c3c';
    if (this.style === 'boss') { fill = '#241a34'; edge = '#8a5fc0'; txtCol = '#f0e4ff'; }
    else if (this.style === 'sys') { fill = '#eef4fb'; edge = '#3f76c9'; txtCol = '#1e2c44'; }
    else if (this.style === 'narr') { fill = '#f6efdd'; edge = '#8a6a3a'; txtCol = '#4a3a24'; }

    P.panel(ctx, bx, by, bw, bh, { fill: fill, edge: edge, radius: 14 });

    var padL = 26;
    if (this.portrait && Spr.has(this.portrait)) {
      padL = 116;
      P.rr(ctx, bx + 14, by + 12, 86, bh - 24, 10, U.shade(fill, -0.08), edge, 2.5);
      ctx.save();
      ctx.beginPath(); ctx.rect(bx + 16, by + 14, 82, bh - 28); ctx.clip();
      Spr.portrait(ctx, this.portrait, bx + 57, by + bh - 18, 92, { t: this.t, anim: 'talk', talking: this.shown < this.chars.length });
      ctx.restore();
    }
    if (this.speaker) {
      var nw = P.measure(ctx, this.speaker, 15) + 22;
      P.rr(ctx, bx + padL - 6, by - 15, nw, 27, 8, edge, U.shade(edge, .3), 2);
      P.text(ctx, this.speaker, bx + padL + 5, by + 4, { size: 15, color: fill === '#241a34' ? '#f0e4ff' : '#fffdf5' });
    }

    var size = 18, lineH = 27, maxW = bw - padL - 30;
    if (!this.lines) this.lines = layout(ctx, this.chars, maxW, size);

    var idx = 0, shownN = Math.floor(this.shown);
    ctx.save();
    ctx.textBaseline = 'alphabetic';
    for (var li = 0; li < this.lines.length && li < 4; li++) {
      var line = this.lines[li];
      var x = bx + padL, y = by + 34 + li * lineH;
      for (var ci = 0; ci < line.length; ci++) {
        var c = line[ci];
        if (idx >= shownN) { idx++; continue; }
        var dy = 0, dx = 0;
        if (c.wave) dy = Math.sin(this.t * 0.16 + idx * 0.5) * 3;
        if (c.shake) { dy += U.rndRange(-1.4, 1.4); dx += U.rndRange(-1.4, 1.4); }
        var sz = c.big ? size * 1.3 : size;
        ctx.font = P.font(sz);
        ctx.lineWidth = 3.4; ctx.lineJoin = 'round'; ctx.miterLimit = 2;
        ctx.strokeStyle = fill === '#241a34' ? '#120b1e' : '#fffdf5';
        ctx.strokeText(c.ch, x + dx, y + dy);
        ctx.fillStyle = c.color || txtCol;
        ctx.fillText(c.ch, x + dx, y + dy);
        x += c.w; idx++;
      }
      idx += 0;
    }
    ctx.restore();

    if (this.choices && shownN >= this.chars.length) {
      var cw = 0, i;
      for (i = 0; i < this.choices.length; i++) cw = Math.max(cw, P.measure(ctx, this.choices[i], 17));
      cw += 56;
      var chh = this.choices.length * 30 + 18;
      var cxp = bx + bw - cw - 18, cyp = by - chh - 12;
      P.panel(ctx, cxp, cyp, cw, chh, { fill: fill, edge: edge, radius: 10, stack: false });
      for (i = 0; i < this.choices.length; i++) {
        var sel = i === this.choiceIdx;
        if (sel) P.rr(ctx, cxp + 8, cyp + 9 + i * 30, cw - 16, 28, 6, U.rgba(edge, .18), null, 0);
        P.text(ctx, this.choices[i], cxp + 34, cyp + 30 + i * 30, { size: 17, color: txtCol, outline: false, shadow: false });
        if (sel) P.poly(ctx, [[cxp + 16, cyp + 16 + i * 30], [cxp + 26, cyp + 23 + i * 30], [cxp + 16, cyp + 30 + i * 30]], '#e0483c', '#2a1c3c', 1.6);
      }
    } else if (shownN >= this.chars.length) {
      var bob = Math.sin(this.t * 0.12) * 3;
      P.poly(ctx, [[bx + bw - 34, by + bh - 26 + bob], [bx + bw - 20, by + bh - 26 + bob], [bx + bw - 27, by + bh - 16 + bob]],
        '#e0483c', '#2a1c3c', 2);
    }
  };

  /* ======================================================================
     List menu
     ====================================================================== */
  function Menu(opts) {
    this.items = opts.items || [];
    this.idx = 0; this.scroll = 0;
    this.rows = opts.rows || 6;
    this.x = opts.x || 40; this.y = opts.y || 40;
    this.w = opts.w || 300; this.rowH = opts.rowH || 30;
    this.title = opts.title || '';
    this.onPick = opts.onPick || null;
    this.onCancel = opts.onCancel || null;
    this.onMove = opts.onMove || null;
    this.drawRow = opts.drawRow || null;
    this.fill = opts.fill || '#fdf6e3';
    this.edge = opts.edge || '#8a6a3a';
    this.txt = opts.txt || '#2a1c3c';
    this.desc = opts.desc || null;
    this.t = 0;
    this.enabled = opts.enabled || null;   // fn(item, i) -> bool
    this.closed = false;
  }
  Menu.prototype.setItems = function (it) {
    this.items = it;
    this.idx = U.clamp(this.idx, 0, Math.max(0, it.length - 1));
    this.fixScroll();
  };
  Menu.prototype.fixScroll = function () {
    if (this.idx < this.scroll) this.scroll = this.idx;
    if (this.idx >= this.scroll + this.rows) this.scroll = this.idx - this.rows + 1;
    this.scroll = U.clamp(this.scroll, 0, Math.max(0, this.items.length - this.rows));
  };
  Menu.prototype.update = function () {
    this.t++;
    if (!this.items.length) {
      if (In.pressed('b')) { A.sfx('cancel'); if (this.onCancel) this.onCancel(); }
      return;
    }
    var moved = false;
    if (In.pressed('up')) { this.idx = U.wrap(this.idx - 1, this.items.length); moved = true; }
    if (In.pressed('down')) { this.idx = U.wrap(this.idx + 1, this.items.length); moved = true; }
    if (In.pressed('l')) { this.idx = U.clamp(this.idx - this.rows, 0, this.items.length - 1); moved = true; }
    if (In.pressed('r')) { this.idx = U.clamp(this.idx + this.rows, 0, this.items.length - 1); moved = true; }
    if (moved) { A.sfx('cursor'); this.fixScroll(); if (this.onMove) this.onMove(this.items[this.idx], this.idx); }
    if (In.pressed('a')) {
      if (this.enabled && !this.enabled(this.items[this.idx], this.idx)) { A.sfx('error'); return; }
      A.sfx('ok');
      if (this.onPick) this.onPick(this.items[this.idx], this.idx);
    }
    if (In.pressed('b')) { A.sfx('cancel'); if (this.onCancel) this.onCancel(); }
  };
  Menu.prototype.height = function () {
    return Math.min(this.rows, Math.max(1, this.items.length)) * this.rowH + (this.title ? 34 : 14) + 12;
  };
  Menu.prototype.draw = function (ctx) {
    var h = this.height();
    P.panel(ctx, this.x, this.y, this.w, h, { fill: this.fill, edge: this.edge, radius: 12 });
    var top = this.y + (this.title ? 34 : 12);
    if (this.title) {
      P.rr(ctx, this.x + 10, this.y + 8, this.w - 20, 24, 6, U.rgba(this.edge, .16), null, 0);
      P.text(ctx, this.title, this.x + 18, this.y + 25, { size: 15, color: this.edge, outline: false, shadow: false });
    }
    if (!this.items.length) {
      P.text(ctx, '— nothing here —', this.x + this.w / 2, top + 22, { size: 15, align: 'center', color: U.rgba(this.txt, .5), outline: false, shadow: false });
      return;
    }
    var n = Math.min(this.rows, this.items.length);
    for (var i = 0; i < n; i++) {
      var gi = this.scroll + i;
      if (gi >= this.items.length) break;
      var it = this.items[gi];
      var ry = top + i * this.rowH;
      var sel = gi === this.idx;
      var ok = !this.enabled || this.enabled(it, gi);
      if (sel) {
        P.rr(ctx, this.x + 8, ry + 1, this.w - 16, this.rowH - 3, 7, U.rgba(this.edge, .2), U.rgba(this.edge, .5), 1.6);
        P.poly(ctx, [[this.x + 14, ry + 8], [this.x + 23, ry + this.rowH / 2], [this.x + 14, ry + this.rowH - 8]], '#e0483c', '#2a1c3c', 1.6);
      }
      if (this.drawRow) this.drawRow(ctx, it, this.x + 30, ry, this.w - 44, this.rowH, sel, ok, gi);
      else {
        var label = typeof it === 'string' ? it : (it.label || it.name || '?');
        P.text(ctx, label, this.x + 32, ry + this.rowH / 2 + 6, { size: 16, color: ok ? this.txt : U.rgba(this.txt, .38), outline: false, shadow: false });
      }
    }
    if (this.items.length > this.rows) {
      var trackH = n * this.rowH - 8;
      var th = Math.max(18, trackH * this.rows / this.items.length);
      var tp = (this.scroll / Math.max(1, this.items.length - this.rows)) * (trackH - th);
      P.rr(ctx, this.x + this.w - 12, top + 4, 5, trackH, 3, U.rgba(this.edge, .18), null, 0);
      P.rr(ctx, this.x + this.w - 12, top + 4 + tp, 5, th, 3, U.rgba(this.edge, .6), null, 0);
    }
    if (this.desc) {
      var d = this.desc(this.items[this.idx], this.idx);
      if (d) {
        var dy = this.y + h + 8;
        var lines = P.wrap(ctx, d, this.w - 28, 14);
        var dh = lines.length * 19 + 18;
        P.panel(ctx, this.x, dy, this.w, dh, { fill: this.fill, edge: this.edge, radius: 10, stack: false });
        for (var li = 0; li < lines.length; li++) {
          P.text(ctx, lines[li], this.x + 14, dy + 25 + li * 19, { size: 14, color: this.txt, outline: false, shadow: false });
        }
      }
    }
  };

  /* ======================================================================
     Toasts
     ====================================================================== */
  var toasts = [];
  function toast(text, icon, color) {
    toasts.push({ text: text, icon: icon || null, color: color || '#fdf6e3', t: 0, life: 150, y: 0 });
    if (toasts.length > 5) toasts.shift();
  }
  function updateToasts() {
    for (var i = toasts.length - 1; i >= 0; i--) {
      var t = toasts[i]; t.t++;
      if (t.t > t.life) toasts.splice(i, 1);
    }
  }
  function drawToasts(ctx) {
    for (var i = 0; i < toasts.length; i++) {
      var t = toasts[i];
      var a = t.t < 12 ? t.t / 12 : (t.t > t.life - 20 ? (t.life - t.t) / 20 : 1);
      var y = 92 + i * 44;
      var w = P.measure(ctx, t.text, 16) + (t.icon ? 60 : 34);
      ctx.save();
      ctx.globalAlpha = U.clamp(a, 0, 1);
      P.panel(ctx, W - w - 22, y, w, 36, { fill: t.color, edge: U.shade(t.color, -.45), radius: 10, stack: false });
      var tx = W - w - 6;
      if (t.icon) { PB.Items.drawIcon(ctx, t.icon, tx + 4, y + 18, 26); tx += 26; }
      P.text(ctx, t.text, tx + 10, y + 24, { size: 16, color: '#2a1c3c', outline: false, shadow: false });
      ctx.restore();
    }
  }

  /* ======================================================================
     Field HUD
     ====================================================================== */
  function drawHud(ctx, S, opts) {
    opts = opts || {};
    if (!S) return;
    var x = 16, y = 14, w = 264, h = 66;
    P.panel(ctx, x, y, w, h, { fill: '#fdf6e3', edge: '#8a6a3a', radius: 12, stackRot: -0.012 });

    // hero chip
    ctx.save();
    ctx.beginPath(); ctx.arc(x + 32, y + 33, 24, 0, Math.PI * 2); ctx.clip();
    P.ell(ctx, x + 32, y + 33, 24, 24, '#e8dcc0', null, 0);
    Spr.portrait(ctx, 'pip', x + 32, y + 55, 54, { t: opts.t || 0 });
    ctx.restore();
    P.ell(ctx, x + 32, y + 33, 24, 24, null, '#8a6a3a', 2.5);

    P.text(ctx, 'Lv ' + S.level, x + 62, y + 22, { size: 14, color: '#4a3a24', outline: false, shadow: false });

    bar(ctx, x + 62, y + 28, 120, 12, S.hp / PB.State.maxHp(), '#e0483c', '#f0908a');
    P.text(ctx, S.hp + '/' + PB.State.maxHp(), x + 188, y + 38, { size: 13, color: '#4a3a24', outline: false, shadow: false });
    bar(ctx, x + 62, y + 46, 120, 12, S.fp / PB.State.maxFp(), '#4fae62', '#8fcf52');
    P.text(ctx, S.fp + '/' + PB.State.maxFp(), x + 188, y + 56, { size: 13, color: '#4a3a24', outline: false, shadow: false });

    // coins + seal energy
    var cx2 = x + w + 12;
    P.panel(ctx, cx2, y, 118, 32, { fill: '#fdf6e3', edge: '#8a6a3a', radius: 10, stack: false });
    var spin = Math.abs(Math.cos((opts.t || 0) * .045));
    P.ell(ctx, cx2 + 18, y + 16, 9 * (0.3 + spin * .7), 10, '#f5c02e', '#8a6a2a', 2);
    if (spin > .45) P.ell(ctx, cx2 + 18, y + 16, 4.5 * spin, 5, '#ffe37a', null);
    P.text(ctx, '' + S.coins, cx2 + 40, y + 22, { size: 16, color: '#4a3a24', outline: false, shadow: false });

    // seal wedges
    var wedges = Math.max(1, S.seals.length);
    P.panel(ctx, cx2, y + 38, 118, 28, { fill: '#fdf6e3', edge: '#8a6a3a', radius: 10, stack: false });
    for (var i = 0; i < wedges; i++) {
      var filled = S.se >= (i + 1) * 100;
      var partial = !filled && S.se > i * 100 ? (S.se - i * 100) / 100 : 0;
      var sx = cx2 + 14 + i * 15;
      P.star(ctx, sx, y + 52, 7, 3, 5, 0, filled ? '#ffe066' : (partial > 0 ? U.mix('#6b5a3a', '#ffe066', partial) : '#cfc2a8'), '#8a6a3a', 1.4);
    }

    // partner chip
    var ap = S.active;
    if (ap && S.partners[ap]) {
      var px = 16, py = y + h + 10;
      P.panel(ctx, px, py, 196, 44, { fill: '#fdf6e3', edge: '#8a6a3a', radius: 10, stack: false });
      ctx.save();
      ctx.beginPath(); ctx.arc(px + 24, py + 22, 17, 0, Math.PI * 2); ctx.clip();
      P.ell(ctx, px + 24, py + 22, 17, 17, '#e8dcc0', null, 0);
      Spr.portrait(ctx, PB.Partners.get(ap).sprite, px + 24, py + 40, 40, { t: opts.t || 0 });
      ctx.restore();
      P.ell(ctx, px + 24, py + 22, 17, 17, null, '#8a6a3a', 2);
      P.text(ctx, PB.Partners.get(ap).name, px + 48, py + 19, { size: 13, color: '#4a3a24', outline: false, shadow: false });
      bar(ctx, px + 48, py + 24, 100, 10, S.partners[ap].hp / PB.State.partnerMaxHp(ap), '#3f76c9', '#8fd0f0');
      P.text(ctx, S.partners[ap].hp + '/' + PB.State.partnerMaxHp(ap), px + 152, py + 33, { size: 12, color: '#4a3a24', outline: false, shadow: false });
    }
  }

  function bar(ctx, x, y, w, h, ratio, c1, c2) {
    ratio = U.clamp(ratio, 0, 1);
    P.rr(ctx, x, y, w, h, h / 2, '#3a2f24', null, 0);
    if (ratio > 0) {
      P.rr(ctx, x + 1, y + 1, Math.max(2, (w - 2) * ratio), h - 2, (h - 2) / 2, c1, null, 0);
      P.rr(ctx, x + 1, y + 1, Math.max(2, (w - 2) * ratio), (h - 2) * .45, (h - 2) / 4, U.rgba(c2, .8), null, 0);
    }
    P.rr(ctx, x, y, w, h, h / 2, null, U.rgba('#000', .35), 1.2);
  }

  /* ======================================================================
     Transitions
     ====================================================================== */
  function Fader() { this.a = 0; this.dir = 0; this.speed = .06; this.cb = null; this.color = '#0f0a18'; this.mode = 'fade'; }
  Fader.prototype.out = function (cb, speed, color, mode) {
    this.dir = 1; this.cb = cb || null; this.speed = speed || .06;
    if (color) this.color = color;
    this.mode = mode || 'fade';
  };
  Fader.prototype.in = function (cb, speed) { this.dir = -1; this.cb = cb || null; this.speed = speed || .06; };
  Fader.prototype.update = function () {
    if (!this.dir) return;
    this.a = U.clamp(this.a + this.dir * this.speed, 0, 1);
    if ((this.dir > 0 && this.a >= 1) || (this.dir < 0 && this.a <= 0)) {
      this.dir = 0;
      var c = this.cb; this.cb = null;
      if (c) c();
    }
  };
  Fader.prototype.busy = function () { return this.dir !== 0 || this.a > 0; };
  Fader.prototype.draw = function (ctx) {
    if (this.a <= 0) return;
    ctx.save();
    if (this.mode === 'iris') {
      var r = (1 - this.a) * Math.max(W, H) * 0.78;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.rect(0, 0, W, H);
      ctx.arc(W / 2, H / 2, Math.max(0, r), 0, Math.PI * 2, true);
      ctx.fill();
    } else if (this.mode === 'page') {
      // a sheet of paper sliding across
      ctx.fillStyle = this.color;
      var yy = -H + this.a * H * 2;
      ctx.save(); ctx.translate(0, yy); ctx.rotate(-0.03);
      ctx.fillRect(-40, -20, W + 80, H + 40);
      ctx.restore();
    } else {
      ctx.globalAlpha = this.a;
      ctx.fillStyle = this.color;
      ctx.fillRect(0, 0, W, H);
    }
    ctx.restore();
  };

  /* ======================================================================
     Misc widgets
     ====================================================================== */
  function prompt(ctx, text, x, y) {
    var w = P.measure(ctx, text, 14) + 30;
    ctx.save();
    ctx.globalAlpha = .92;
    P.rr(ctx, x - w / 2, y - 15, w, 28, 8, '#fdf6e3', '#8a6a3a', 2.4);
    P.text(ctx, text, x, y + 5, { size: 14, align: 'center', color: '#2a1c3c', outline: false, shadow: false });
    ctx.restore();
  }

  function damageNumber(ctx, n, x, y, t, color, crit) {
    var a = U.clamp(1 - t / 52, 0, 1);
    var yy = y - Math.min(34, t * 1.6) - (crit ? Math.sin(t * .3) * 3 : 0);
    ctx.save(); ctx.globalAlpha = a;
    P.text(ctx, n, x, yy, { size: crit ? 30 : 24, align: 'center', color: color || '#fff', outlineColor: '#2a1c3c', ow: 5 });
    ctx.restore();
  }

  function title(ctx, text, y, opts) {
    opts = opts || {};
    P.textWave(ctx, text, W / 2, y, {
      size: opts.size || 46, align: 'center', color: opts.color || '#fff8e0',
      outlineColor: opts.outlineColor || '#2a1c3c', ow: 8,
      amp: opts.amp === undefined ? 4 : opts.amp, freq: .5, phase: (opts.t || 0) * .05
    });
  }

  return {
    W: W, H: H,
    Dialogue: Dialogue, Menu: Menu, Fader: Fader,
    parse: parse, layout: layout,
    toast: toast, updateToasts: updateToasts, drawToasts: drawToasts, toasts: toasts,
    drawHud: drawHud, bar: bar, prompt: prompt, damageNumber: damageNumber, title: title
  };
})();

/* ===== 14_battle.js ===== */
/* ==========================================================================
   PAPERBOUND — 14_battle.js
   Turn-based stage combat. Hero and partner each act, then every foe acts.

   Sequencing is written as generators and stepped one frame at a time by
   Coro, which keeps multi-beat animations readable:
       yield 20;                  // wait 20 frames
       yield {cmd: actionCommand}; // run a minigame, receive its result
       yield {until: fn};          // block until fn() is true
   ========================================================================== */
'use strict';

PB.Battle = (function () {
  var U = PB.U, P = PB.Paper, In = PB.Input, A = PB.Audio, Spr = PB.Sprites;
  var UI = PB.UI, St = PB.State, Mv = PB.Moves, En = PB.Enemies, It = PB.Items;
  var AC = PB.ActionCmd;

  var W = 960, H = 540;
  var FLOOR = 392;            // stage baseline
  /* The party sits clear of the command menu in the bottom-left, and the four
     foe slots stay inside the curtains. */
  var HERO_X = 424, PART_X = 322;
  var FOE_X = [612, 700, 782, 856];

  /* ======================================================================
     Coroutine runner
     ====================================================================== */
  function Coro(gen) { this.g = gen; this.wait = 0; this.until = null; this.cmd = null; this.guard = null; this.done = false; this.send = undefined; }
  Coro.prototype.step = function (ctxObj) {
    if (this.done) return true;
    if (this.wait > 0) { this.wait--; return false; }
    if (this.cmd) {
      if (!this.cmd.update()) return false;
      this.send = this.cmd.result; this.cmd = null;
    }
    if (this.guard) {
      if (!this.guard.update()) return false;
      this.send = this.guard; this.guard = null;
    }
    if (this.until) { if (!this.until()) return false; this.until = null; }
    var r;
    try { r = this.g.next(this.send); }
    catch (e) { if (window.console) console.error('battle coroutine', e); this.done = true; return true; }
    this.send = undefined;
    if (r.done) { this.done = true; return true; }
    var v = r.value;
    if (typeof v === 'number') this.wait = v;
    else if (v && v.cmd) this.cmd = v.cmd;
    else if (v && v.guard) this.guard = v.guard;
    else if (v && v.until) this.until = v.until;
    return false;
  };
  Coro.prototype.drawExtra = function (ctx) {
    if (this.cmd) this.cmd.draw(ctx, W / 2, H - 118);
  };

  /* ======================================================================
     Combatants
     ====================================================================== */
  function mkHero() {
    var S = St.get();
    return {
      side: 'player', kind: 'hero', id: 'pip', name: S.name, sprite: 'pip',
      hp: S.hp, maxHp: St.maxHp(), atk: 0, def: 0,
      flags: ['ground'], weak: [], resist: [], immune: [],
      st: [], buffs: [], form: null, formTurns: 0,
      x: HERO_X, y: FLOOR, z: 0, anim: 'idle', t: U.rndInt(60), flip: 1,
      down: false, defending: false, hitFlash: 0, shake: 0, lift: 0
    };
  }
  function mkPartner(id) {
    var S = St.get(), pd = PB.Partners.get(id);
    return {
      side: 'player', kind: 'partner', id: id, name: pd.name, sprite: pd.sprite,
      hp: S.partners[id].hp, maxHp: St.partnerMaxHp(id), atk: 0, def: 0,
      rank: S.partners[id].rank,
      flags: ['ground'], weak: [], resist: [], immune: [],
      st: [], buffs: [],
      x: PART_X, y: FLOOR, z: 0, anim: 'idle', t: U.rndInt(60), flip: 1,
      down: false, defending: false, hitFlash: 0, shake: 0, lift: 0
    };
  }
  function mkFoe(eid, slot) {
    var d = En.get(eid);
    if (!d) d = En.get('crumple');
    var air = d.flags.indexOf('air') >= 0;
    return {
      side: 'enemy', kind: 'enemy', id: d.id, name: d.name, sprite: d.sprite, data: d,
      hp: d.hp, maxHp: d.hp, atk: d.atk, def: d.def,
      flags: d.flags.slice(), weak: d.weak.slice(), resist: d.resist.slice(), immune: d.immune.slice(),
      st: [], buffs: [], guardTurns: 0, guardAmt: 0, evade: 0, evadeTurns: 0,
      moves: d.moves.slice(), phaseIdx: 0,
      slot: slot, x: FOE_X[slot] || (FOE_X[3] + (slot - 3) * 70), y: FLOOR, z: 0,
      anim: 'idle', t: U.rndInt(60), flip: -1, down: false, hitFlash: 0, shake: 0, lift: air ? 0 : 0,
      grounded: !air, lastCopy: null
    };
  }

  function isAir(c) { return c.flags.indexOf('air') >= 0 && c.grounded !== true; }
  function hasFlag(c, f) { return c.flags.indexOf(f) >= 0; }

  /* ======================================================================
     Status effects
     ====================================================================== */
  var STATUS = {
    poison: { name: 'Poison', color: '#8fcf52', dot: 2, icon: 'drop' },
    burn: { name: 'Burn', color: '#ff7a2e', dot: 2, icon: 'orb' },
    freeze: { name: 'Frozen', color: '#9fd8f0', skip: true, icon: 'orb' },
    sleep: { name: 'Asleep', color: '#c8a2e8', skip: true, wake: true, icon: 'orb' },
    dizzy: { name: 'Dizzy', color: '#f5c02e', miss: .5, icon: 'star' },
    soggy: { name: 'Soggy', color: '#57b8ea', atk: -2, icon: 'drop' },
    crumple: { name: 'Crumpled', color: '#a9713f', def: -2, icon: 'card' },
    inked: { name: 'Inked', color: '#4a3560', miss: .45, icon: 'bottle' },
    shrink: { name: 'Shrunk', color: '#c8a2e8', atkMul: .5, icon: 'orb' },
    tangled: { name: 'Tangled', color: '#8a5a30', skip: true, icon: 'coil' },
    silence: { name: 'Silenced', color: '#2a1c3c', silence: true, icon: 'card' },
    electrified: { name: 'Electrified', color: '#ffe066', thorns: 1, icon: 'bolt' }
  };
  var BUFFS = {
    atkUp: { name: 'Attack Up', color: '#e0483c' },
    defUp: { name: 'Defence Up', color: '#57b8ea' },
    dodgy: { name: 'Dodgy', color: '#8fd0f0' },
    charge: { name: 'Charged', color: '#f5c02e' },
    regen: { name: 'Regen', color: '#7fe0d0' },
    thorns: { name: 'Thorns', color: '#c8a2e8' },
    vuln: { name: 'Marked', color: '#f07a8a' }
  };

  function statusImmune(c) {
    if (c.kind === 'hero') return !!St.badgeMods().statusImmune;
    if (c.kind === 'partner') return !!St.badgeMods().statusImmuneP;
    return false;
  }
  function addStatus(c, type, turns, amt) {
    if (!STATUS[type]) return false;
    if (c.immune.indexOf(type) >= 0) return false;
    if (statusImmune(c)) return false;
    if (c.down) return false;
    for (var i = 0; i < c.st.length; i++) {
      if (c.st[i].type === type) { c.st[i].turns = Math.max(c.st[i].turns, turns); return true; }
    }
    c.st.push({ type: type, turns: turns, amt: amt || 0 });
    return true;
  }
  function hasStatus(c, t) {
    for (var i = 0; i < c.st.length; i++) if (c.st[i].type === t) return true;
    return false;
  }
  function clearStatus(c, t) {
    for (var i = c.st.length - 1; i >= 0; i--) if (c.st[i].type === t) c.st.splice(i, 1);
  }
  function clearAllStatus(c) { c.st.length = 0; }
  function addBuff(c, type, amt, turns) {
    for (var i = 0; i < c.buffs.length; i++) {
      if (c.buffs[i].type === type) {
        c.buffs[i].amt = type === 'charge' ? c.buffs[i].amt + amt : Math.max(c.buffs[i].amt, amt);
        c.buffs[i].turns = Math.max(c.buffs[i].turns, turns);
        return;
      }
    }
    c.buffs.push({ type: type, amt: amt, turns: turns });
  }
  function buffAmt(c, type) {
    for (var i = 0; i < c.buffs.length; i++) if (c.buffs[i].type === type) return c.buffs[i].amt;
    return 0;
  }
  function clearBuff(c, type) {
    for (var i = c.buffs.length - 1; i >= 0; i--) if (c.buffs[i].type === type) c.buffs.splice(i, 1);
  }
  function dispel(c) { c.buffs.length = 0; if (c.kind === 'hero') { c.form = null; c.formTurns = 0; } }

  function statMod(c, key) {
    var v = 0;
    for (var i = 0; i < c.st.length; i++) {
      var d = STATUS[c.st[i].type];
      if (d && d[key]) v += d[key];
    }
    return v;
  }
  function statMul(c, key) {
    var v = 1;
    for (var i = 0; i < c.st.length; i++) {
      var d = STATUS[c.st[i].type];
      if (d && d[key] !== undefined) v *= d[key];
    }
    return v;
  }

  /* ======================================================================
     The scene
     ====================================================================== */
  function Battle(cfg, onEnd) {
    this.cfg = cfg || {};
    this.onEnd = onEnd || function () { };
    this.t = 0;
    this.phase = 'intro';
    this.co = null;
    this.log = [];
    this.numbers = [];
    this.fx = [];
    this.shake = 0;
    this.dlg = new UI.Dialogue();
    this.fader = new UI.Fader();
    this.result = null;
    this.round = 0;
    this.actor = null;
    this.menuStack = [];
    this.audience = cfg.audience === undefined ? 24 : cfg.audience;
    this.audienceMax = 100;
    this.encore = 0;
    this.itemsUsed = 0;
    this.ranAway = false;
    this.spGained = 0; this.coinsGained = 0; this.itemsGained = [];
    this.firstStrike = cfg.firstStrike || 0;   // 1 = player advantage, -1 = ambushed
    this.boss = !!cfg.boss;
    this.bg = cfg.bg || 'stage';
    this.tattleTarget = null;
    this.lastPlayerMove = null;
    this.msg = null; this.msgT = 0;
    this.crowdTossT = 0;

    var S = St.get();
    this.hero = mkHero();
    this.partner = S.active ? mkPartner(S.active) : null;
    this.foes = [];
    var list = cfg.enemies || ['crumple'];
    for (var i = 0; i < list.length && i < 5; i++) this.foes.push(mkFoe(list[i], i));

    this.everyone = function () {
      var a = [this.hero];
      if (this.partner) a.push(this.partner);
      return a.concat(this.foes);
    };
    A.play(cfg.music || (this.boss ? 'boss' : 'battle'));
    this.co = new Coro(this.introSeq());
  }

  Battle.prototype.alive = function (side) {
    var out = [];
    if (side === 'enemy') {
      for (var i = 0; i < this.foes.length; i++) if (!this.foes[i].down) out.push(this.foes[i]);
    } else {
      if (!this.hero.down) out.push(this.hero);
      if (this.partner && !this.partner.down) out.push(this.partner);
    }
    return out;
  };
  Battle.prototype.frontFoe = function () {
    var a = this.alive('enemy').filter(function (f) { return !isAir(f); });
    if (!a.length) return null;
    a.sort(function (p, q) { return p.x - q.x; });
    return a[0];
  };

  /* ---- feedback helpers --------------------------------------------------- */
  Battle.prototype.number = function (txt, x, y, color, crit) {
    this.numbers.push({ txt: '' + txt, x: x, y: y, t: 0, c: color || '#fff', crit: !!crit });
  };
  Battle.prototype.say = function (txt, style, speaker, portrait) {
    this.dlg.say(txt, { style: style || 'normal', speaker: speaker || '', portrait: portrait || null });
  };
  Battle.prototype.banner = function (txt, col) { this.msg = { txt: txt, c: col || '#ffe066' }; this.msgT = 70; };
  Battle.prototype.puff = function (x, y, color, n, spd) {
    for (var i = 0; i < (n || 8); i++) {
      this.fx.push({
        k: 'bit', x: x, y: y, vx: U.rndRange(-1, 1) * (spd || 3), vy: U.rndRange(-3.4, -0.6) * (spd ? spd / 3 : 1),
        r: U.rndRange(2.5, 6), c: color || '#f7edd6', t: 0, life: 42, rot: U.rndRange(0, 6.28), vr: U.rndRange(-.3, .3)
      });
    }
  };
  Battle.prototype.slash = function (x, y, color) { this.fx.push({ k: 'slash', x: x, y: y, c: color || '#fff', t: 0, life: 18, a: U.rndRange(-.7, .7) }); };
  Battle.prototype.ring = function (x, y, color, r) { this.fx.push({ k: 'ring', x: x, y: y, c: color || '#fff', t: 0, life: 26, r: r || 40 }); };

  /* ---- audience ------------------------------------------------------------ */
  Battle.prototype.addAudience = function (n) {
    var m = St.badgeMods();
    if (n > 0 && m.crowd) n *= 2;
    this.audience = U.clamp(this.audience + n, 0, this.audienceMax);
  };
  Battle.prototype.addEncore = function (n) {
    var m = St.badgeMods();
    if (m.stylish) n *= 2;
    this.encore = U.clamp(this.encore + n, 0, 100);
  };

  /* ======================================================================
     Damage
     ====================================================================== */
  function elementMult(target, element) {
    if (!element || element === 'none') return 1;
    if (target.immune.indexOf(element) >= 0) return 0;
    if (target.weak.indexOf(element) >= 0) return 1.5;
    if (target.resist.indexOf(element) >= 0) return 0.5;
    return 1;
  }

  Battle.prototype.attackerPower = function (src, move) {
    var p = 0, m = St.badgeMods();
    if (src.kind === 'hero') {
      p += (m.atk || 0);
      if (src.form) {
        var f = Mv.get(src.form) && Mv.get(src.form).form;
        if (f && f.atk) p += f.atk;
      }
      var S = St.get();
      if (St.maxHp() > 0) {
        if (S.hp <= 1 && m.megaRush) p += m.megaRush;
        else if (S.hp <= 5 && m.powerRush) p += m.powerRush;
      }
    } else if (src.kind === 'partner') p += (m.atkP || 0);
    p += buffAmt(src, 'atkUp');
    p += buffAmt(src, 'charge');
    p += statMod(src, 'atk');
    p = Math.round(p * statMul(src, 'atkMul'));
    return p;
  };

  Battle.prototype.defenceOf = function (c) {
    var d = 0, m = St.badgeMods();
    if (c.kind === 'enemy') d = c.def + (c.guardTurns > 0 ? c.guardAmt : 0);
    else {
      if (c.kind === 'hero') {
        d = (m.def || 0);
        if (c.form) { var f = Mv.get(c.form) && Mv.get(c.form).form; if (f && f.def) d += f.def; }
      } else d = (m.defP || 0);
    }
    d += buffAmt(c, 'defUp');
    d += statMod(c, 'def');
    return d;
  };

  /* Returns the number actually dealt. Applies status, thorns and death. */
  Battle.prototype.dealDamage = function (src, tgt, raw, opts) {
    opts = opts || {};
    if (tgt.down) return 0;
    var dmg = raw;
    var mult = elementMult(tgt, opts.element);
    if (mult === 0) { this.number('IMMUNE', tgt.x, tgt.y - 70, '#9aa3b0'); return 0; }
    dmg = mult > 1 ? Math.ceil(dmg * mult) : (mult < 1 ? Math.floor(dmg * mult) : dmg);
    if (!opts.pierce) dmg -= this.defenceOf(tgt);
    dmg += buffAmt(tgt, 'vuln');
    var m = St.badgeMods();
    if (tgt.side === 'player') {
      if (tgt.defending) dmg = Math.ceil(dmg / 2);
      if (opts.guard === 'guard') dmg -= 1 + (m.damageDodge || 0);
      if (opts.guard === 'superguard') dmg = 0;
      if (m.lastStand && St.get().hp <= 5 && tgt.kind === 'hero') dmg = Math.ceil(dmg / 2);
      if (m.fragile) dmg = Math.round(dmg * 2);
      dmg = Math.round(dmg * St.diff().inDmg);
      if (m.icePower && hasFlag(src, 'icy')) dmg = 0;
    } else {
      dmg = Math.round(dmg * St.diff().outDmg);
      if (m.featherweight && src && src.side === 'player') dmg = Math.min(dmg, 1);
      if (m.icePower && hasStatus(tgt, 'freeze')) dmg += 1;
    }
    dmg = Math.max(0, dmg);

    if (dmg === 0) {
      this.number(opts.guard === 'superguard' ? 'BLOCK!' : '0', tgt.x, tgt.y - 70, '#cfd6de');
    } else {
      tgt.hp = Math.max(0, tgt.hp - dmg);
      tgt.hitFlash = 14; tgt.shake = 10;
      this.number(dmg, tgt.x, tgt.y - 70, tgt.side === 'player' ? '#ff8a8a' : '#fff8e0', mult > 1);
      this.shake = Math.min(16, this.shake + 3 + dmg * .4);
      A.sfx(dmg >= 8 ? 'hitBig' : 'hit');
      this.puff(tgt.x, tgt.y - 30, mult > 1 ? '#ffe066' : '#f7edd6', 6 + Math.min(10, dmg));
      if (mult > 1) this.banner('WEAK POINT!', '#ffe066');
      if (tgt.side === 'player') St.get().stats.taken += dmg;
      else St.get().stats.damage += dmg;
      if (src && src.side === 'player' && m.payoff) { this.coinsGained += 1; }
    }

    // wake sleepers
    if (dmg > 0 && hasStatus(tgt, 'sleep')) clearStatus(tgt, 'sleep');
    if (dmg > 0 && hasStatus(tgt, 'freeze') && opts.element === 'fire') clearStatus(tgt, 'freeze');
    if (dmg > 0 && hasStatus(tgt, 'burn') && (opts.element === 'water' || opts.douse)) clearStatus(tgt, 'burn');

    // status rider
    if (dmg > 0 && opts.status && U.chance(opts.status.chance * (opts.perfect ? 1.4 : 1))) {
      if (addStatus(tgt, opts.status.type, opts.status.turns)) {
        this.number(STATUS[opts.status.type].name + '!', tgt.x, tgt.y - 92, STATUS[opts.status.type].color);
      }
    }
    if (opts.halveDef && tgt.kind === 'enemy') { tgt.def = Math.floor(tgt.def / 2); this.number('DEF HALVED', tgt.x, tgt.y - 92, '#cfd6de'); }

    // thorns / contact punishment
    if (src && opts.contact && opts.contact !== 'none' && dmg >= 0 && !tgt.down) {
      var back = 0, why = '';
      if (tgt.side === 'enemy') {
        if (opts.contact === 'top' && hasFlag(tgt, 'spiked') && !(src.kind === 'hero' && m.spikeShield)) { back = 1; why = 'spike'; }
        if (hasFlag(tgt, 'fiery') && !(src.kind === 'hero' && m.fireShield)) { back = Math.max(back, 1); why = 'fire'; }
        if (hasFlag(tgt, 'electric')) { back = Math.max(back, 1); why = 'shock'; }
        back += buffAmt(tgt, 'thorns');
      } else {
        if (m.zapTap) { back += 1; why = 'shock'; }
        if (m.returnPost) back += Math.round(dmg * m.returnPost);
        back += buffAmt(tgt, 'thorns');
        if (tgt.kind === 'hero' && tgt.form === 'form_fortress') back += 1;
      }
      if (back > 0 && !src.down) {
        src.hp = Math.max(0, src.hp - back);
        src.hitFlash = 10;
        this.number(back, src.x, src.y - 70, '#ffb0b0');
        A.sfx(why === 'shock' ? 'zap' : (why === 'fire' ? 'fire' : 'hit'));
        this.checkDown(src);
      }
    }

    this.checkDown(tgt);
    return dmg;
  };

  Battle.prototype.checkDown = function (c) {
    if (c.hp > 0 || c.down) return;
    if (c.kind === 'hero') {
      // Life Leaf style auto-revive
      var S = St.get();
      var rev = null;
      for (var i = 0; i < S.items.length; i++) {
        var d = It.get(S.items[i]);
        if (d && d.fx && d.fx.revive) { rev = S.items[i]; break; }
      }
      if (rev) {
        var fx = It.get(rev).fx;
        S.items.splice(S.items.indexOf(rev), 1);
        c.hp = Math.min(c.maxHp, fx.hp || 10);
        S.hp = c.hp;
        if (fx.fp) St.heal(0, fx.fp);
        this.banner(It.get(rev).name + '!', '#7fe0d0');
        A.fanfare('item');
        this.number('REVIVED', c.x, c.y - 92, '#7fe0d0');
        return;
      }
    }
    c.down = true; c.anim = 'defeat';
    A.sfx('defeat');
    this.puff(c.x, c.y - 30, '#e8dcc0', 14, 4);
    if (c.side === 'enemy') {
      this.addAudience(5);
      St.recordDefeat(c.id);
    }
  };

  Battle.prototype.healTarget = function (c, hp, fp) {
    if (c.down) return;
    if (hp) {
      var before = c.hp;
      c.hp = Math.min(c.maxHp, c.hp + hp);
      if (c.hp > before) { this.number('+' + (c.hp - before), c.x, c.y - 70, '#8fcf52'); this.ring(c.x, c.y - 34, '#8fcf52', 34); }
    }
    if (fp && c.kind === 'hero') {
      var S = St.get();
      var b2 = S.fp;
      St.heal(0, fp);
      if (S.fp > b2) this.number('+' + (S.fp - b2) + ' FP', c.x + 24, c.y - 92, '#8fd0f0');
    }
    A.sfx('heal');
  };

  /* ======================================================================
     Sequences
     ====================================================================== */
  Battle.prototype.introSeq = function* () {
    var self = this;
    this.phase = 'intro';
    yield 26;
    if (this.cfg.introLine) {
      this.say(this.cfg.introLine, this.boss ? 'boss' : 'normal', this.cfg.introSpeaker || '', this.cfg.introPortrait || null);
      yield { until: function () { return !self.dlg.isBusy(); } };
    }
    if (this.firstStrike > 0) {
      this.banner('FIRST STRIKE!', '#8fcf52');
      var f = this.alive('enemy')[0];
      if (f) {
        var m = St.badgeMods();
        var d = (2 + St.get().stompRank) * (m.firstStrike ? 2 : 1);
        yield* this.hopAttack(this.hero, f, function () {
          self.dealDamage(self.hero, f, d, { contact: 'top', element: 'blunt' });
        });
      }
      yield 16;
    } else if (this.firstStrike < 0) {
      this.banner('AMBUSHED!', '#e0483c');
      var e0 = this.alive('enemy')[0];
      if (e0) {
        yield* this.foeLunge(e0, this.hero, function () {
          self.dealDamage(e0, self.hero, e0.atk, { contact: 'side' });
        });
      }
      yield 16;
    }
    yield* this.roundStart();
  };

  Battle.prototype.roundStart = function* () {
    this.round++;
    var i;
    // reset per-round flags
    var all = this.everyone();
    for (i = 0; i < all.length; i++) { all[i].defending = false; }
    for (i = 0; i < this.foes.length; i++) {
      var f = this.foes[i];
      if (f.guardTurns > 0) f.guardTurns--;
      if (f.evadeTurns > 0) f.evadeTurns--; else f.evade = 0;
    }
    yield* this.playerPhase();
  };

  Battle.prototype.playerPhase = function* () {
    var self = this;
    // hero
    if (!this.hero.down) {
      var skip = yield* this.statusGate(this.hero);
      if (!skip) { this.actor = this.hero; yield* this.heroTurn(); }
      yield* this.endOfEntityTurn(this.hero);
    }
    if (this.checkBattleEnd()) { yield* this.finishSeq(); return; }
    // partner
    if (this.partner && !this.partner.down) {
      var skip2 = yield* this.statusGate(this.partner);
      if (!skip2) { this.actor = this.partner; yield* this.partnerTurn(); }
      yield* this.endOfEntityTurn(this.partner);
    }
    this.actor = null;
    if (this.checkBattleEnd()) { yield* this.finishSeq(); return; }
    if (this.ranAway) { yield* this.finishSeq(); return; }
    yield* this.crowdGift();
    yield* this.enemyPhase();
  };

  /* Frozen / asleep / tangled skip the turn and tick down. */
  Battle.prototype.statusGate = function* (c) {
    var blocked = null;
    for (var i = 0; i < c.st.length; i++) {
      var d = STATUS[c.st[i].type];
      if (d && d.skip) { blocked = c.st[i]; break; }
    }
    if (!blocked) return false;
    this.banner(c.name + ' is ' + STATUS[blocked.type].name + '!', STATUS[blocked.type].color);
    this.number(STATUS[blocked.type].name, c.x, c.y - 92, STATUS[blocked.type].color);
    c.anim = blocked.type === 'sleep' ? 'sleep' : 'hurt';
    yield 52;
    c.anim = 'idle';
    return true;
  };

  Battle.prototype.endOfEntityTurn = function* (c) {
    var i, d, m = St.badgeMods();
    // damage over time
    for (i = c.st.length - 1; i >= 0; i--) {
      d = STATUS[c.st[i].type];
      if (d && d.dot && !c.down) {
        c.hp = Math.max(0, c.hp - d.dot);
        this.number(d.dot, c.x, c.y - 70, d.color);
        c.hitFlash = 8;
        A.sfx('hit');
        this.checkDown(c);
      }
      c.st[i].turns--;
      if (c.st[i].turns <= 0) c.st.splice(i, 1);
    }
    // regen buffs / badges
    if (!c.down) {
      var reg = buffAmt(c, 'regen');
      if (c.kind === 'hero') {
        if (m.regenHp) reg += m.regenHp;
        if (m.regenFp) St.heal(0, m.regenFp);
        if (m.regenSp) St.addSe(m.regenSp);
        if (c.form === 'form_lantern') reg += 3;
      }
      if (c.kind === 'partner' && this.hero.form === 'form_lantern') reg += 2;
      if (reg > 0) this.healTarget(c, reg, 0);
    }
    for (i = c.buffs.length - 1; i >= 0; i--) {
      if (c.buffs[i].type === 'charge') continue;   // charge persists until used
      c.buffs[i].turns--;
      if (c.buffs[i].turns <= 0) c.buffs.splice(i, 1);
    }
    if (c.kind === 'hero' && c.form) {
      c.formTurns--;
      if (c.formTurns <= 0) {
        this.banner('Form released', '#cfd6de');
        c.form = null;
      }
    }
    this.syncState();
    if (this.checkBattleEnd()) return;
    yield 6;
  };

  Battle.prototype.crowdGift = function* () {
    var m = St.badgeMods();
    var chance = this.audience / 300 * (m.crowd ? 2 : 1);
    if (!U.chance(chance)) return;
    var kind = U.rnd();
    this.crowdTossT = 40;
    A.sfx('coin');
    if (kind < .45) { this.healTarget(this.hero, 3, 0); this.banner('The crowd tosses a snack!', '#f07a8a'); }
    else if (kind < .8) { St.heal(0, 3); this.number('+3 FP', this.hero.x + 20, this.hero.y - 96, '#8fd0f0'); this.banner('The crowd tosses a flower!', '#8fcf52'); }
    else { St.addSe(60); this.banner('The crowd is roaring!', '#ffe066'); }
    yield 30;
  };

  /* ======================================================================
     Hero turn — menu driven
     ====================================================================== */
  Battle.prototype.heroTurn = function* () {
    var self = this;
    this.itemsUsed = 0;
    var doneTurn = false;
    while (!doneTurn) {
      var pick = yield* this.runMenu(function () { return self.buildHeroRoot(); });
      if (!pick) continue;
      if (pick.act === 'cancel') continue;
      var r = yield* this.performPlayerAction(this.hero, pick);
      if (r !== 'again') doneTurn = true;
    }
  };
  Battle.prototype.partnerTurn = function* () {
    var self = this;
    var doneTurn = false;
    while (!doneTurn) {
      var pick = yield* this.runMenu(function () { return self.buildPartnerRoot(); });
      if (!pick) continue;
      if (pick.act === 'cancel') continue;
      var r = yield* this.performPlayerAction(this.partner, pick);
      if (r !== 'again') doneTurn = true;
    }
  };

  /* ---- menu plumbing ------------------------------------------------------
     runMenu pushes a Menu and blocks until the player picks a leaf entry or
     backs all the way out. Leaves resolve to {move, targetMode} objects. */
  Battle.prototype.runMenu = function* (rootBuilder) {
    var self = this;
    var chosen = null, cancelled = false;
    var stack = [rootBuilder()];
    this.menuStack = stack;
    while (chosen === null && !cancelled) {
      var top = stack[stack.length - 1];
      var out = null;
      top.onPick = function (item) {
        if (item.disabled) { A.sfx('error'); return; }
        if (item.sub) { out = { push: item.sub() }; }
        else out = { leaf: item };
      };
      top.onCancel = function () { out = { pop: true }; };
      yield { until: function () { top.update(); return out !== null; } };
      if (out.push) { stack.push(out.push); this.menuStack = stack; }
      else if (out.pop) {
        stack.pop(); this.menuStack = stack;
        if (!stack.length) { if (this.actor === this.hero) { stack = [rootBuilder()]; this.menuStack = stack; } else cancelled = true; }
      } else if (out.leaf) chosen = out.leaf;
    }
    this.menuStack = [];
    return chosen || { act: 'cancel' };
  };

  function mkMenu(title, items, x, y, w, desc) {
    return new UI.Menu({
      title: title, items: items, x: x === undefined ? 26 : x, y: y === undefined ? H - 216 : y,
      w: w || 268, rows: 6, rowH: 29, fill: '#fdf6e3', edge: '#8a6a3a', desc: desc,
      drawRow: function (ctx, it, rx, ry, rw, rh, sel, ok) {
        var col = it.disabled ? 'rgba(42,28,60,.35)' : '#2a1c3c';
        if (it.icon) { It.drawIcon(ctx, it.icon, rx + 10, ry + rh / 2, 22); rx += 22; }
        P.text(ctx, it.label, rx + 4, ry + rh / 2 + 6, { size: 15, color: col, outline: false, shadow: false });
        if (it.cost) P.text(ctx, it.cost, rx + rw - 8, ry + rh / 2 + 6, { size: 14, align: 'right', color: it.disabled ? 'rgba(42,28,60,.35)' : '#8a5a30', outline: false, shadow: false });
      }
    });
  }

  Battle.prototype.buildHeroRoot = function () {
    var self = this, S = St.get(), m = St.badgeMods();
    var items = [];
    items.push({ label: 'Stomp', sub: function () { return self.buildMoveMenu('stomp'); } });
    items.push({ label: 'Mallet', sub: function () { return self.buildMoveMenu('mallet'); } });
    if (S.forms.length && !m.noForms) items.push({ label: 'Fold', sub: function () { return self.buildFormMenu(); } });
    if (S.seals.length) items.push({
      label: 'Seals', sub: function () { return self.buildSealMenu(); },
      disabled: hasStatus(this.hero, 'silence')
    });
    if (this.encore >= 100 && this.partner && !this.partner.down) {
      items.push({ label: '★ ENCORE ★', sub: null, encore: true, move: PB.Partners.get(this.partner.id).duet, user: 'duet' });
    }
    items.push({ label: 'Items', sub: function () { return self.buildItemMenu(self.hero); }, disabled: !S.items.length });
    items.push({ label: 'Tactics', sub: function () { return self.buildTacticsMenu(self.hero); } });
    return mkMenu(S.name, items, 26, H - 232, 246, function (it) {
      if (it.encore) return 'Unleash the duet you and your partner have been building all fight.';
      return null;
    });
  };
  Battle.prototype.buildPartnerRoot = function () {
    var self = this, S = St.get();
    var items = [];
    items.push({ label: 'Abilities', sub: function () { return self.buildPartnerMoves(); } });
    items.push({ label: 'Items', sub: function () { return self.buildItemMenu(self.partner); }, disabled: !S.items.length });
    items.push({ label: 'Tactics', sub: function () { return self.buildTacticsMenu(self.partner); } });
    return mkMenu(this.partner.name, items, 26, H - 232, 246);
  };

  Battle.prototype.fpCost = function (move, who) {
    var m = St.badgeMods();
    var c = move.fp || 0;
    if (!c) return 0;
    var disc = who === 'partner' ? (m.fpDiscountP || 0) : (m.fpDiscount || 0);
    if (move.cat === 'form') disc += (m.formDiscount || 0);
    return Math.max(1, c - disc);
  };

  Battle.prototype.buildMoveMenu = function (slot) {
    var self = this, S = St.get();
    var ids = [slot].concat(PB.Badges.movesFrom(S.badges.equipped, slot));
    var items = ids.map(function (id) {
      var mv = Mv.get(id); if (!mv) return null;
      var cost = self.fpCost(mv, 'hero');
      return {
        label: mv.name, cost: cost ? cost + ' FP' : '—', move: id, user: 'hero',
        disabled: cost > S.fp, desc: mv.desc
      };
    }).filter(Boolean);
    return mkMenu(slot === 'stomp' ? 'Stomp' : 'Mallet', items, 288, H - 232, 274,
      function (it) { return it ? Mv.get(it.move).desc : null; });
  };
  Battle.prototype.buildFormMenu = function () {
    var self = this, S = St.get();
    var ids = S.forms.slice();
    if (this.hero.form) ids.push('form_unfold');
    var items = ids.map(function (id) {
      var mv = Mv.get(id); if (!mv) return null;
      var cost = self.fpCost(mv, 'hero');
      return {
        label: mv.name + (self.hero.form === id ? ' (active)' : ''), cost: cost ? cost + ' FP' : '—',
        move: id, user: 'hero', disabled: cost > S.fp || self.hero.form === id
      };
    }).filter(Boolean);
    return mkMenu('Origami Forms', items, 288, H - 232, 274, function (it) { return it ? Mv.get(it.move).desc : null; });
  };
  Battle.prototype.buildSealMenu = function () {
    var self = this, S = St.get();
    var items = S.seals.map(function (id) {
      var mv = Mv.get(id); if (!mv) return null;
      return {
        label: mv.name, cost: (mv.se / 100) + ' SE', move: id, user: 'hero',
        disabled: S.se < mv.se
      };
    }).filter(Boolean);
    return mkMenu('Seal Powers', items, 288, H - 232, 274, function (it) { return it ? Mv.get(it.move).desc : null; });
  };
  Battle.prototype.buildPartnerMoves = function () {
    var self = this, S = St.get();
    var ids = PB.Partners.moves(this.partner.id, this.partner.rank);
    var items = ids.map(function (id) {
      var mv = Mv.get(id); if (!mv) return null;
      var cost = self.fpCost(mv, 'partner');
      return { label: mv.name, cost: cost ? cost + ' FP' : '—', move: id, user: 'partner', disabled: cost > S.fp };
    }).filter(Boolean);
    return mkMenu(this.partner.name, items, 288, H - 232, 274, function (it) { return it ? Mv.get(it.move).desc : null; });
  };
  Battle.prototype.buildItemMenu = function (user) {
    var S = St.get();
    var items = S.items.map(function (id, i) {
      var d = It.get(id);
      return { label: d.name, icon: id, item: id, index: i, user: user === this.hero ? 'hero' : 'partner' };
    }, this);
    return mkMenu('Items', items, 288, H - 232, 274, function (it) { return it ? It.get(it.item).desc : null; });
  };
  Battle.prototype.buildTacticsMenu = function (user) {
    var self = this, S = St.get();
    var isHero = user === this.hero;
    var items = [];
    items.push({ label: 'Defend', move: 'tac_defend', user: isHero ? 'hero' : 'partner' });
    items.push({ label: 'Appeal', move: 'tac_appeal', user: isHero ? 'hero' : 'partner' });
    var extra = PB.Badges.movesFrom(S.badges.equipped, isHero ? 'tactics' : 'tacticsP');
    for (var i = 0; i < extra.length; i++) {
      var mv = Mv.get(extra[i]);
      if (mv) items.push({ label: mv.name, cost: this.fpCost(mv, isHero ? 'hero' : 'partner') + ' FP', move: extra[i], user: isHero ? 'hero' : 'partner', disabled: this.fpCost(mv, 'hero') > S.fp });
    }
    if (isHero && St.partnerList().length > 1) items.push({ label: 'Swap Partner', sub: function () { return self.buildSwapMenu(); } });
    if (!this.cfg.noRun && !this.boss) items.push({ label: 'Run Away', move: 'tac_run', user: isHero ? 'hero' : 'partner' });
    return mkMenu('Tactics', items, 288, H - 232, 274, function (it) { return it && it.move ? Mv.get(it.move).desc : null; });
  };
  Battle.prototype.buildSwapMenu = function () {
    var self = this, S = St.get();
    var items = St.partnerList().filter(function (id) { return id !== S.active; }).map(function (id) {
      var p = PB.Partners.get(id);
      return { label: p.name, swap: id, cost: S.partners[id].hp + ' HP' };
    });
    return mkMenu('Swap to…', items, 574, H - 232, 210);
  };

  /* ---- targeting ---------------------------------------------------------- */
  Battle.prototype.pickTarget = function* (mode, user) {
    var self = this;
    var pool = [];
    if (mode === 'front') { var f = this.frontFoe(); pool = f ? [f] : []; }
    else if (mode === 'oneGround') pool = this.alive('enemy').filter(function (e) { return !isAir(e); });
    else if (mode === 'oneAir') pool = this.alive('enemy').filter(isAir);
    else if (mode === 'oneAny') pool = this.alive('enemy');
    else if (mode === 'ally') pool = this.alive('player');
    else return { auto: true };
    if (!pool.length) return null;
    if (pool.length === 1 && mode === 'front') return { list: pool };
    var idx = 0, out = null;
    this.targetCursor = { pool: pool, idx: 0 };
    yield {
      until: function () {
        if (In.pressed('left') || In.pressed('up')) { idx = U.wrap(idx - 1, pool.length); A.sfx('cursor'); }
        if (In.pressed('right') || In.pressed('down')) { idx = U.wrap(idx + 1, pool.length); A.sfx('cursor'); }
        self.targetCursor.idx = idx;
        if (In.pressed('a')) { A.sfx('ok'); out = { list: [pool[idx]] }; return true; }
        if (In.pressed('b')) { A.sfx('cancel'); out = null; return true; }
        return false;
      }
    };
    this.targetCursor = null;
    return out;
  };

  Battle.prototype.resolveTargets = function (move, user, picked) {
    var t = move.target;
    if (t === 'all') return this.alive('enemy');
    if (t === 'allGround') return this.alive('enemy').filter(function (e) { return !isAir(e); });
    if (t === 'allAir') return this.alive('enemy').filter(isAir);
    if (t === 'self') return [user];
    if (t === 'party') return this.alive('player');
    if (t === 'field') return this.alive('enemy');
    return picked ? picked.list : [];
  };

  /* ---- perform ------------------------------------------------------------ */
  Battle.prototype.performPlayerAction = function* (user, pick) {
    var self = this, S = St.get();

    if (pick.swap) {
      var m = St.badgeMods();
      S.partners[S.active].hp = this.partner.hp;
      S.active = pick.swap;
      this.partner = mkPartner(pick.swap);
      A.sfx('swap');
      this.banner(this.partner.name + ' steps in!', '#8fd0f0');
      yield 30;
      return m.quickChange ? 'again' : 'done';
    }

    if (pick.item) {
      var used = yield* this.useItem(user, pick.item, pick.index);
      if (!used) return 'again';
      this.itemsUsed++;
      var cap = St.badgeMods().itemsPerTurn || 1;
      return this.itemsUsed < cap ? 'again' : 'done';
    }

    var id = pick.move;
    var move = Mv.get(id);
    if (!move) return 'done';

    // targeting
    var picked = null;
    var needPick = ['oneAny', 'oneGround', 'oneAir', 'front', 'ally'].indexOf(move.target) >= 0;
    if (needPick) {
      picked = yield* this.pickTarget(move.target, user);
      if (!picked) return 'again';
      if (!picked.list || !picked.list.length) { this.banner('No valid target.', '#e0483c'); yield 24; return 'again'; }
    }

    // cost
    if (move.se) {
      if (S.se < move.se) { A.sfx('error'); return 'again'; }
      S.se -= move.se;
    } else {
      var cost = this.fpCost(move, user.kind === 'partner' ? 'partner' : 'hero');
      if (cost > S.fp) { A.sfx('error'); return 'again'; }
      S.fp -= cost;
    }
    if (pick.encore) { this.encore = 0; }

    this.lastPlayerMove = id;
    yield* this.executeMove(user, move, picked, { encore: !!pick.encore });
    return 'done';
  };

  Battle.prototype.useItem = function* (user, itemId, index) {
    var self = this, S = St.get(), d = It.get(itemId);
    if (!d) return false;
    var fx = d.fx || {};
    var picked = null;
    if (fx.dmg && fx.target === 'one') {
      picked = yield* this.pickTarget('oneAny', user);
      if (!picked) return false;
    }
    // remove
    var i = S.items.indexOf(itemId);
    if (i >= 0) S.items.splice(i, 1);
    var m = St.badgeMods();
    if (m.refund) this.coinsGained += Math.round((d.sell || 0) * m.refund);

    user.anim = 'cast'; A.sfx('ok');
    yield 18;
    this.ring(user.x, user.y - 40, '#ffe066', 40);

    if (fx.mystery) {
      var roll = U.rnd();
      if (roll < .3) fx = { hp: 15, fp: 5 };
      else if (roll < .5) fx = { dmg: 8, target: 'all' };
      else if (roll < .65) fx = { buff: { type: 'atkUp', amt: 3, turns: 3 } };
      else if (roll < .8) fx = { target: 'all', status: { type: 'sleep', chance: .8, turns: 3 } };
      else if (roll < .92) fx = { sp: 200 };
      else fx = { dmg: 3, target: 'self' };
      this.banner('Mystery!', '#f5c02e');
      yield 16;
    }

    if (fx.hp || fx.fp) {
      this.healTarget(this.hero, fx.hp || 0, fx.fp || 0);
      if (this.partner && !this.partner.down && fx.hp) this.healTarget(this.partner, fx.hp, 0);
    }
    if (fx.sp) { St.addSe(fx.sp); this.number('+SEAL', this.hero.x, this.hero.y - 100, '#ffe066'); A.sfx('seal'); }
    if (fx.cureAll) { clearAllStatus(this.hero); if (this.partner) clearAllStatus(this.partner); this.banner('Cleansed!', '#7fe0d0'); }
    if (fx.cure) for (var c = 0; c < fx.cure.length; c++) { clearStatus(this.hero, fx.cure[c]); if (this.partner) clearStatus(this.partner, fx.cure[c]); }
    if (fx.buff) { addBuff(user, fx.buff.type, fx.buff.amt, fx.buff.turns); this.number(BUFFS[fx.buff.type].name, user.x, user.y - 92, BUFFS[fx.buff.type].color); }
    if (fx.audience) { this.addAudience(fx.audience); this.banner('The crowd loves it!', '#f07a8a'); }
    if (fx.escape) { this.ranAway = true; this.banner('Escaped!', '#8fcf52'); yield 24; return true; }
    if (fx.dmg || fx.status) {
      var targets = fx.target === 'all' ? this.alive('enemy') : (picked ? picked.list : this.alive('enemy').slice(0, 1));
      for (var k = 0; k < targets.length; k++) {
        var tg = targets[k];
        if (fx.dmg) {
          this.slash(tg.x, tg.y - 40, '#ffe066');
          this.dealDamage(user, tg, fx.dmg, { element: fx.element, pierce: fx.pierce, status: fx.status, contact: 'none' });
        } else if (fx.status && U.chance(fx.status.chance)) {
          if (addStatus(tg, fx.status.type, fx.status.turns)) this.number(STATUS[fx.status.type].name + '!', tg.x, tg.y - 92, STATUS[fx.status.type].color);
        }
        yield 6;
      }
    }
    user.anim = 'idle';
    this.syncState();
    yield 18;
    return true;
  };

  /* ---- the main attack routine -------------------------------------------- */
  Battle.prototype.executeMove = function* (user, move, picked, opts) {
    var self = this, S = St.get();
    opts = opts || {};
    var m = St.badgeMods();

    // pure tactics
    if (move.defend) { user.defending = true; user.anim = 'guard'; this.banner(user.name + ' braces.', '#57b8ea'); yield 34; user.anim = 'idle'; return; }
    if (move.appeal) {
      user.anim = 'cheer'; A.sfx('stylish');
      var gain = 60 + (m.deepFocus || 0);
      St.addSe(gain);
      this.addAudience(8);
      this.addEncore(6);
      this.banner('Appeal! Seal Energy up.', '#ffe066');
      this.ring(user.x, user.y - 40, '#ffe066', 50);
      yield 40; user.anim = 'idle'; return;
    }
    if (move.run) {
      var cmd = AC.make(move.cmd, { tutor: !!m.tutor, label: 'Get away!' });
      var res = yield { cmd: cmd };
      if (res.tier >= 1) {
        this.ranAway = true;
        if (!m.runawayPay) { S.sp = Math.max(0, S.sp - 20); }
        St.get().stats.flees++;
        this.banner('Got away!', '#8fcf52');
      } else this.banner('Could not escape!', '#e0483c');
      yield 26; return;
    }
    if (move.unfold) { user.form = null; user.formTurns = 0; this.banner('Unfolded.', '#cfd6de'); A.sfx('fold'); yield 24; return; }

    // form
    if (move.form) {
      var cmdF = AC.make(move.cmd, { tutor: !!m.tutor, label: move.name });
      user.anim = 'cast';
      var rF = yield { cmd: cmdF };
      A.sfx('fold');
      this.ring(user.x, user.y - 40, '#8fd0f0', 54);
      this.puff(user.x, user.y - 40, '#f7edd6', 12, 2.4);
      user.form = move.id;
      user.formTurns = (move.turns || 3) + (m.formTurns || 0) + (rF.tier === 2 ? 1 : 0);
      this.banner(move.name + '!', '#57b8ea');
      if (rF.tier === 2) { this.addEncore(10); this.addAudience(4); S.stats.stylish++; }
      yield 34; user.anim = 'idle'; return;
    }

    // targets
    var targets = this.resolveTargets(move, user, picked);
    if (move.target === 'party') targets = this.alive('player');
    if (!targets.length && !move.heal && !move.blankSlate) { this.banner('Nothing to hit.', '#e0483c'); yield 20; return; }

    // tattle
    if (move.tattle) {
      var tgt = targets[0];
      if (tgt) {
        St.tattle(tgt.id);
        this.tattleTarget = tgt;
        user.anim = 'cast';
        yield 20;
        this.say(tgt.data.tattle, 'normal', this.partner ? this.partner.name : 'Study', this.partner ? this.partner.sprite : null);
        yield { until: function () { return !self.dlg.isBusy(); } };
        this.tattleTarget = null;
        user.anim = 'idle';
      }
      return;
    }

    // buffs / debuffs with no damage
    if (!move.power && (move.buff || move.debuff || move.heal || move.blankSlate)) {
      var cmdB = AC.make(move.cmd, { tutor: !!m.tutor, label: move.name });
      user.anim = 'cast';
      var rB = yield { cmd: cmdB };
      var scale = rB.tier === 0 ? .5 : (rB.tier === 2 ? 1.25 : 1);
      A.sfx(move.cat === 'seal' ? 'seal' : 'heal');
      if (move.blankSlate) {
        var foes = this.alive('enemy');
        for (var bi = 0; bi < foes.length; bi++) { dispel(foes[bi]); foes[bi].guardTurns = 0; }
        this.healTarget(this.hero, 15, 15);
        if (this.partner && !this.partner.down) this.healTarget(this.partner, 15, 0);
        this.encore = 100;
        this.banner('BLANK SLATE!', '#f7f5ff');
        this.ring(W / 2, FLOOR - 60, '#ffffff', 220);
      }
      if (move.heal) {
        var hs = Math.round((move.heal.hp || 0) * scale);
        for (var hi = 0; hi < targets.length; hi++) {
          if (move.heal.cureAll) clearAllStatus(targets[hi]);
          this.healTarget(targets[hi], hs, 0);
        }
      }
      if (move.buff) {
        for (var ui = 0; ui < targets.length; ui++) {
          addBuff(targets[ui], move.buff.type, move.buff.amt, move.buff.turns);
          this.number(BUFFS[move.buff.type].name, targets[ui].x, targets[ui].y - 92, BUFFS[move.buff.type].color);
        }
      }
      if (move.debuff) {
        for (var di = 0; di < targets.length; di++) {
          var td = targets[di];
          if (move.debuff.def) { td.def = Math.max(0, td.def + move.debuff.def); this.number('DEF ' + move.debuff.def, td.x, td.y - 92, '#8fd0f0'); }
          if (move.debuff.vuln) addBuff(td, 'vuln', move.debuff.vuln, move.debuff.turns || 3);
          if (move.debuff.atk) { td.atk = Math.max(0, td.atk + move.debuff.atk); }
        }
      }
      if (move.status) {
        for (var si = 0; si < targets.length; si++) {
          if (U.chance(move.status.chance * (rB.tier === 2 ? 1.3 : 1))) {
            if (addStatus(targets[si], move.status.type, move.status.turns)) this.number(STATUS[move.status.type].name + '!', targets[si].x, targets[si].y - 92, STATUS[move.status.type].color);
          }
        }
      }
      if (rB.tier === 2) { this.addEncore(10); this.addAudience(4); S.stats.stylish++; }
      this.banner(move.name + '!', move.cat === 'seal' ? '#ffe066' : '#8fcf52');
      yield 32; user.anim = 'idle';
      this.syncState();
      return;
    }

    /* ---- damaging attack ---- */
    var rank = user.kind === 'partner' ? user.rank : (move.cat === 'mallet' ? S.malletRank : S.stompRank);
    var base = Mv.power(move, rank);
    var cmdSpec = move.cmd || { type: 'none' };
    var label = move.name;
    var cmd = AC.make(cmdSpec, { tutor: !!m.tutor, label: label });
    user.anim = 'attack';
    var res = yield { cmd: cmd };

    // Stylish window: a quick B press right after a perfect command.
    var stylish = false;
    if (res.tier === 2) {
      this.stylishWindow = 16;
      var sw = 16, got = false;
      yield {
        until: function () {
          sw--; self.stylishWindow = sw;
          if (In.pressed('b')) { got = true; return true; }
          return sw <= 0;
        }
      };
      this.stylishWindow = 0;
      if (got) {
        stylish = true; S.stats.stylish++;
        A.sfx('stylish'); this.banner('STYLISH!', '#f07a8a');
        this.addEncore(14); this.addAudience(8);
        for (var s = 0; s < 3; s++) this.fx.push({ k: 'star', x: user.x + U.rndRange(-20, 20), y: user.y - 50, t: 0, life: 34, c: '#ffe066' });
      } else { this.addEncore(7); this.addAudience(3); }
    } else if (res.tier === 1) { this.addEncore(3); this.addAudience(1); }
    else { this.addAudience(-2); }

    // damage per target
    var powerAdd = this.attackerPower(user, move);
    var hits = (move.hits || 1) + (user.kind === 'hero' && user.form === 'form_shear' ? 1 : 0);
    var pierce = move.pierce || (user.kind === 'hero' && user.form === 'form_dart');
    var element = move.element;
    if (user.kind === 'hero' && user.form === 'form_shear' && (!element || element === 'blunt')) element = 'cut';

    var perHit = base + powerAdd;
    if (res.tier === 2) perHit += 1;
    if (res.tier === 0) {
      if (m.allOrNothing) perHit = 0;
      else perHit = Math.floor(perHit * 0.5);
    } else if (m.allOrNothing && res.tier === 2) perHit += m.allOrNothing;
    // ratio-scaled commands
    if (['mash', 'hold', 'rotate', 'multi'].indexOf(cmdSpec.type) >= 0 && res.tier === 1) {
      perHit = Math.max(1, Math.round(perHit * (0.6 + res.ratio * 0.4)));
    }
    if (stylish) perHit += 1;
    if (opts.encore) perHit += 2;
    perHit = Math.max(0, perHit);

    var usedCharge = buffAmt(user, 'charge') > 0;

    // animation + application
    if (move.cat === 'duet') {
      yield* this.duetSeq(user, move, targets, perHit, element, pierce, res);
    } else if (move.chain) {
      // Multibounce: one hop per target, stopping at the number of hits landed
      var maxT = Math.max(1, Math.min(targets.length, Math.max(1, cmd.hits || targets.length)));
      for (var ci = 0; ci < maxT; ci++) {
        var tc = targets[ci];
        if (!tc || tc.down) continue;
        yield* this.hopAttack(user, tc, (function (tt) {
          return function () {
            self.dealDamage(user, tt, perHit, { element: element, pierce: pierce, status: move.status, contact: move.contact, perfect: res.tier === 2, halveDef: move.halveDef, douse: move.douse });
          };
        })(tc));
      }
    } else if (move.target === 'all' || move.target === 'allGround' || move.target === 'allAir') {
      yield* this.areaAttack(user, move, targets, function (tt, i) {
        self.dealDamage(user, tt, perHit, { element: element, pierce: pierce, status: move.status, contact: move.contact, perfect: res.tier === 2, douse: move.douse });
      });
    } else {
      var tgt2 = targets[0];
      for (var h = 0; h < hits; h++) {
        if (!tgt2 || tgt2.down) break;
        var pw = perHit + (move.escalate ? move.escalate * h : 0);
        if (move.cat === 'stomp' || move.contact === 'top') {
          yield* this.hopAttack(user, tgt2, (function (p) {
            return function () {
              self.dealDamage(user, tgt2, p, { element: element, pierce: pierce, status: move.status, contact: move.contact, perfect: res.tier === 2, halveDef: move.halveDef, douse: move.douse });
            };
          })(pw));
        } else {
          yield* this.meleeAttack(user, tgt2, (function (p) {
            return function () {
              self.dealDamage(user, tgt2, p, { element: element, pierce: pierce, status: move.status, contact: move.contact, perfect: res.tier === 2, halveDef: move.halveDef, douse: move.douse });
            };
          })(pw), element);
        }
        yield 5;
      }
    }

    if (move.ground) {
      for (var gi = 0; gi < targets.length; gi++) {
        if (isAir(targets[gi])) { targets[gi].grounded = true; this.number('GROUNDED', targets[gi].x, targets[gi].y - 92, '#8fd0f0'); }
      }
    }
    if (move.douse) {
      for (var di2 = 0; di2 < targets.length; di2++) {
        var fd = targets[di2], fi = fd.flags.indexOf('fiery');
        if (fi >= 0) { fd.flags.splice(fi, 1); this.number('DOUSED', fd.x, fd.y - 92, '#57b8ea'); }
      }
    }
    if (usedCharge) clearBuff(user, 'charge');

    user.anim = 'idle';
    this.syncState();
    yield 16;
  };

  /* ---- attack animations ---------------------------------------------------- */
  Battle.prototype.hopAttack = function* (user, tgt, apply) {
    var sx = user.x, sy = user.y;
    var tx = tgt.x - 4, ty = tgt.y - (isAir(tgt) ? 40 : 0);
    var n = 14;
    for (var i = 1; i <= n; i++) {
      var p = i / n;
      user.x = U.lerp(sx, tx, p);
      user.lift = Math.sin(p * Math.PI) * 74 + (isAir(tgt) ? p * 40 : 0);
      user.anim = 'jump';
      yield 1;
    }
    A.sfx('jump');
    user.lift = 0; user.anim = 'attack';
    apply();
    this.puff(tgt.x, tgt.y - 16, '#f7edd6', 6, 2);
    yield 10;
    for (var j = 1; j <= 12; j++) {
      var q = j / 12;
      user.x = U.lerp(tx, sx, q);
      user.lift = Math.sin(q * Math.PI) * 46;
      yield 1;
    }
    user.x = sx; user.y = sy; user.lift = 0; user.anim = 'idle';
  };

  Battle.prototype.meleeAttack = function* (user, tgt, apply, element) {
    var sx = user.x;
    var tx = tgt.x - 56;
    var n = 10;
    for (var i = 1; i <= n; i++) { user.x = U.lerp(sx, tx, U.Ease.outQuad(i / n)); user.anim = 'run'; yield 1; }
    user.anim = 'attack';
    yield 6;
    A.sfx(element === 'fire' ? 'fire' : (element === 'ice' ? 'ice' : (element === 'cut' ? 'fold' : 'mallet')));
    this.slash(tgt.x - 10, tgt.y - 34, element === 'fire' ? '#ff9f2e' : (element === 'ice' ? '#bfe4f8' : (element === 'cut' ? '#ffffff' : '#ffe066')));
    apply();
    yield 12;
    for (var j = 1; j <= 10; j++) { user.x = U.lerp(tx, sx, j / 10); yield 1; }
    user.x = sx; user.anim = 'idle';
  };

  Battle.prototype.areaAttack = function* (user, move, targets, apply) {
    user.anim = 'cast';
    var col = move.element === 'fire' ? '#ff8a2e' : move.element === 'ice' ? '#bfe4f8'
      : move.element === 'shock' ? '#ffe066' : move.element === 'water' ? '#57b8ea'
        : move.element === 'cut' ? '#ffffff' : '#f5c02e';
    A.sfx(move.element === 'fire' ? 'fire' : move.element === 'ice' ? 'ice' : move.element === 'shock' ? 'zap' : move.element === 'water' ? 'water' : 'hitBig');
    this.ring(W / 2 + 120, FLOOR - 50, col, 190);
    this.shake = 12;
    yield 14;
    for (var i = 0; i < targets.length; i++) {
      if (targets[i].down) continue;
      this.slash(targets[i].x, targets[i].y - 36, col);
      apply(targets[i], i);
      yield 4;
    }
    yield 10;
    user.anim = 'idle';
  };

  Battle.prototype.duetSeq = function* (user, move, targets, perHit, element, pierce, res) {
    var self = this;
    this.duetFlash = 60;
    A.sfx('seal');
    this.banner(move.name, '#f07a8a');
    var hero = this.hero, part = this.partner;
    var hx = hero.x, px = part ? part.x : 0;
    for (var i = 1; i <= 20; i++) {
      hero.x = U.lerp(hx, W / 2 - 40, i / 20);
      if (part) part.x = U.lerp(px, W / 2 - 100, i / 20);
      hero.anim = 'cheer'; if (part) part.anim = 'cheer';
      yield 1;
    }
    yield 20;
    var hits = move.hits || 1;
    for (var h = 0; h < hits; h++) {
      this.ring(W / 2 + 140, FLOOR - 60, '#ffe066', 240);
      this.shake = 18;
      A.sfx('hitBig');
      for (var t = 0; t < targets.length; t++) {
        if (targets[t].down) continue;
        this.slash(targets[t].x, targets[t].y - 40, '#ffe066');
        this.dealDamage(user, targets[t], perHit, { element: element, pierce: pierce, status: move.status, contact: 'none', perfect: true, douse: move.douse });
      }
      yield 14;
    }
    if (move.debuff) {
      for (var d = 0; d < targets.length; d++) if (move.debuff.def) targets[d].def = Math.max(0, targets[d].def + move.debuff.def);
    }
    this.duetFlash = 0;
    for (var j = 1; j <= 16; j++) {
      hero.x = U.lerp(W / 2 - 40, hx, j / 16);
      if (part) part.x = U.lerp(W / 2 - 100, px, j / 16);
      yield 1;
    }
    hero.x = hx; if (part) part.x = px;
    hero.anim = 'idle'; if (part) part.anim = 'idle';
    this.addAudience(20);
  };

  /* ======================================================================
     Enemy phase
     ====================================================================== */
  Battle.prototype.enemyPhase = function* () {
    var self = this;
    var foes = this.alive('enemy');
    for (var i = 0; i < foes.length; i++) {
      var f = foes[i];
      if (f.down) continue;
      if (this.checkBattleEnd()) break;
      this.actor = f;
      var skip = yield* this.statusGate(f);
      if (!skip) yield* this.foeAct(f);
      yield* this.endOfEntityTurn(f);
      if (this.checkBattleEnd()) break;
      yield 8;
    }
    this.actor = null;
    if (this.checkBattleEnd()) { yield* this.finishSeq(); return; }
    yield* this.roundStart();
  };

  Battle.prototype.pickFoeMove = function (f) {
    var pool = [], i;
    var hpRatio = f.hp / f.maxHp;
    for (i = 0; i < f.moves.length; i++) {
      var mv = f.moves[i];
      if (mv.cond === 'lowhp' && hpRatio > 0.35) continue;
      if (mv.cond === 'heroLow' && this.hero.hp > this.hero.maxHp * 0.4) continue;
      if (mv.summon && this.foes.length >= 5) continue;
      if (mv.copyLast && !this.lastPlayerMove) continue;
      if (mv.guard && f.guardTurns > 0) continue;
      var w = mv.weight;
      pool.push({ mv: mv, w: w });
    }
    if (!pool.length) return f.moves[0];
    var total = 0;
    for (i = 0; i < pool.length; i++) total += pool[i].w;
    var r = U.rnd() * total;
    for (i = 0; i < pool.length; i++) { r -= pool[i].w; if (r <= 0) return pool[i].mv; }
    return pool[0].mv;
  };

  Battle.prototype.foeAct = function* (f) {
    var self = this, S = St.get();
    // boss phase transitions
    if (f.data.phases) {
      while (f.phaseIdx < f.data.phases.length && f.hp / f.maxHp <= f.data.phases[f.phaseIdx].at) {
        var ph = f.data.phases[f.phaseIdx++];
        if (ph.say) { this.say(ph.say, 'boss', f.name, f.sprite); yield { until: function () { return !self.dlg.isBusy(); } }; }
        if (ph.mods) { if (ph.mods.atk) f.atk += ph.mods.atk; if (ph.mods.def) f.def = Math.max(0, f.def + ph.mods.def); }
        if (ph.add) f.moves = f.moves.concat(ph.add);
        A.sfx('roar'); this.shake = 20;
        this.ring(f.x, f.y - 50, '#e0483c', 120);
        yield 24;
      }
    }

    var mv = this.pickFoeMove(f);
    if (!mv) return;

    if (mv.telegraph) { this.banner(mv.telegraph, '#f5c02e'); yield 34; }

    // non-attacking behaviours
    if (mv.guard) {
      f.guardTurns = mv.turns || 2; f.guardAmt = mv.guard;
      if (mv.thorns) addBuff(f, 'thorns', mv.thorns, mv.turns || 2);
      if (mv.evade) { f.evade = mv.evade; f.evadeTurns = mv.turns || 2; }
      if (mv.heal) this.healTarget(f, mv.heal, 0);
      if (mv.target === 'allies') { var al = this.alive('enemy'); for (var g = 0; g < al.length; g++) { al[g].guardTurns = mv.turns || 2; al[g].guardAmt = mv.guard; } }
      f.anim = 'guard'; this.number('DEF UP', f.x, f.y - 92, '#57b8ea');
      A.sfx('guard');
      yield 34; f.anim = 'idle'; return;
    }
    if (mv.heal && !mv.power) {
      var tgts = mv.target === 'allies' ? this.alive('enemy') : [f];
      f.anim = 'cast'; A.sfx('heal');
      for (var h = 0; h < tgts.length; h++) this.healTarget(tgts[h], mv.heal, 0);
      yield 34; f.anim = 'idle'; return;
    }
    if (mv.atkBuff && !mv.power) {
      var t2 = mv.target === 'allies' ? this.alive('enemy') : [f];
      f.anim = 'cheer';
      for (var b = 0; b < t2.length; b++) { addBuff(t2[b], 'atkUp', mv.atkBuff, mv.turns || 3); this.number('ATK UP', t2[b].x, t2[b].y - 92, '#e0483c'); }
      A.sfx('charge');
      yield 34; f.anim = 'idle'; return;
    }
    if (mv.summon) {
      var cnt = mv.count || 1;
      f.anim = 'cast'; A.sfx('roar');
      for (var s = 0; s < cnt && this.foes.length < 5; s++) {
        var nf = mkFoe(mv.summon, this.foes.length);
        nf.x = FOE_X[Math.min(3, this.foes.length)] + (this.foes.length > 3 ? 60 : 0);
        this.foes.push(nf);
        this.puff(nf.x, nf.y - 30, '#c8a2e8', 10, 3);
      }
      this.banner(f.name + ' calls for backup!', '#e0483c');
      yield 40; f.anim = 'idle'; return;
    }
    if (mv.stealAudience) {
      var st2 = Math.min(this.audience, mv.stealAudience);
      this.audience -= st2;
      if (mv.atkBuff) addBuff(f, 'atkUp', mv.atkBuff, 3);
      f.anim = 'cheer'; A.sfx('stylish');
      this.banner(f.name + ' wins over the crowd!', '#e0483c');
      yield 40; f.anim = 'idle'; return;
    }
    if (mv.evade && !mv.power) {
      f.evade = mv.evade; f.evadeTurns = mv.turns || 1;
      this.number('EVASIVE', f.x, f.y - 92, '#8fd0f0');
      yield 30; return;
    }

    // choose a victim
    var victims = [];
    var players = this.alive('player');
    if (!players.length) return;
    if (mv.target === 'both') victims = players.slice();
    else if (mv.target === 'hero') victims = [this.hero.down ? players[0] : this.hero];
    else if (mv.target === 'partner') victims = [this.partner && !this.partner.down ? this.partner : players[0]];
    else if (mv.target === 'weakest') {
      players.sort(function (a, b) { return (a.hp / a.maxHp) - (b.hp / b.maxHp); });
      victims = [players[0]];
    } else victims = [U.pick(players)];

    var power = mv.power;
    if (mv.copyLast && this.lastPlayerMove) {
      var lm = Mv.get(this.lastPlayerMove);
      if (lm && lm.power) power = Math.max(power, Mv.power(lm, 2) + 2);
      this.banner(f.name + ' copies your move!', '#e0483c');
    }
    power += buffAmt(f, 'atkUp') + statMod(f, 'atk');
    power = Math.max(0, Math.round(power * statMul(f, 'atkMul')));

    var hits = mv.hits || 1;
    for (var v = 0; v < victims.length; v++) {
      var tv = victims[v];
      if (tv.down) continue;
      for (var hh = 0; hh < hits; hh++) {
        if (tv.down) break;
        // accuracy: dizzy/inked make the foe miss
        var missChance = statMod(f, 'miss');
        var m2 = St.badgeMods();
        var dodge = (m2.luck || 0) + (buffAmt(tv, 'dodgy') ? .5 : 0);
        if (tv.kind === 'hero' && tv.form === 'form_crane') dodge += .5;
        if (m2.closeCall && tv.kind === 'hero' && St.get().hp <= 5) dodge += m2.closeCall;
        if (U.chance(missChance) || U.chance(dodge)) {
          yield* this.foeLunge(f, tv, function () { });
          this.number('MISS', tv.x, tv.y - 70, '#8fd0f0');
          A.sfx('swap');
          if (tv.kind === 'hero' && tv.form === 'form_crane') {
            this.dealDamage(tv, f, 2, { contact: 'none' });
            this.number('COUNTER', f.x, f.y - 92, '#8fd0f0');
          }
          continue;
        }
        // guard window
        var self2 = this;
        var guard = new AC.Guard(30);
        this.activeGuard = guard;
        var appliedPower = (hits > 1 && mv.power !== power) ? Math.max(1, Math.round(power / 1.6)) : power;
        yield* this.foeLunge(f, tv, null, guard);
        var gr = guard.result;
        this.activeGuard = null;
        if (gr === 'superguard') St.get().stats.superguards++;
        this.dealDamage(f, tv, appliedPower, {
          element: mv.element, pierce: mv.pierce, status: mv.status,
          contact: mv.contact === undefined ? 'side' : mv.contact, guard: gr
        });
        if (gr === 'superguard' && (mv.contact === undefined || mv.contact === 'side')) {
          this.dealDamage(tv, f, 1, { contact: 'none' });
          this.number('COUNTER', f.x, f.y - 92, '#ffe066');
        }
        if (gr !== 'none') { this.addAudience(gr === 'superguard' ? 6 : 2); this.addEncore(gr === 'superguard' ? 8 : 3); }
        if (mv.drain && !f.down) this.healTarget(f, Math.max(1, Math.round(appliedPower / 2)), 0);
        if (mv.dispel) { dispel(tv); this.number('DISPELLED', tv.x, tv.y - 92, '#c8a2e8'); }
        if (mv.steal) {
          var S2 = St.get();
          if (S2.coins > 0) { var amt = Math.min(S2.coins, 5 + U.rndInt(10)); S2.coins -= amt; this.number('-' + amt + ' coins', tv.x, tv.y - 100, '#f5c02e'); }
        }
        if (mv.debuff) {
          if (mv.debuff.atk) addBuff(tv, 'atkUp', mv.debuff.atk, mv.debuff.turns || 3);
          if (mv.debuff.def) addBuff(tv, 'defUp', mv.debuff.def, mv.debuff.turns || 3);
        }
        yield 8;
      }
    }
    if (mv.selfKO) {
      f.hp = 0; this.checkDown(f);
      this.puff(f.x, f.y - 30, '#ff8a2e', 18, 5);
    }
    this.syncState();
    f.anim = 'idle';
    yield 10;
  };

  Battle.prototype.foeLunge = function* (f, tgt, apply, guard) {
    var sx = f.x;
    var tx = tgt.x + 62;
    var n = 12;
    for (var i = 1; i <= n; i++) {
      f.x = U.lerp(sx, tx, U.Ease.inQuad(i / n));
      f.anim = 'run';
      if (guard) guard.update();
      yield 1;
    }
    f.anim = 'attack';
    A.sfx('hit');
    for (var k = 0; k < 6; k++) { if (guard) guard.update(); yield 1; }
    if (apply) apply();
    if (guard) { while (guard.t < guard.impact) { guard.update(); yield 1; } }
    yield 6;
    for (var j = 1; j <= 10; j++) { f.x = U.lerp(tx, sx, j / 10); yield 1; }
    f.x = sx; f.anim = 'idle';
  };

  /* ======================================================================
     End of battle
     ====================================================================== */
  Battle.prototype.checkBattleEnd = function () {
    if (this.result) return true;
    if (!this.alive('enemy').length) { this.result = 'win'; return true; }
    if (this.hero.down) { this.result = 'lose'; return true; }
    if (this.ranAway) { this.result = 'flee'; return true; }
    return false;
  };

  Battle.prototype.syncState = function () {
    var S = St.get();
    S.hp = U.clamp(this.hero.hp, 0, St.maxHp());
    if (this.partner && S.partners[this.partner.id]) S.partners[this.partner.id].hp = U.clamp(this.partner.hp, 0, this.partner.maxHp);
  };

  Battle.prototype.finishSeq = function* () {
    var self = this, S = St.get();
    this.syncState();
    this.phase = 'end';
    yield 24;

    if (this.result === 'lose') {
      A.stop();
      this.banner('DOWN...', '#e0483c');
      yield 60;
      this.phase = 'gameover';
      return;
    }
    if (this.result === 'flee') {
      yield 16;
      this.close();
      return;
    }

    // rewards
    S.stats.battles++; S.stats.wins++;
    var sp = 0, coins = this.coinsGained;
    for (var i = 0; i < this.foes.length; i++) {
      var d = this.foes[i].data;
      var scaled = Math.max(1, Math.round(d.sp * (1 - U.clamp((S.level - d.tier * 3) / 22, 0, 0.65))));
      sp += scaled;
      coins += d.coins + U.rndInt(3);
      var m = St.badgeMods();
      var dropChance = m.dropRate ? 2 : 1;
      if (d.drops) for (var k = 0; k < d.drops.length; k++) {
        if (U.chance(Math.min(1, d.drops[k][1] * dropChance))) this.itemsGained.push(d.drops[k][0]);
      }
    }
    sp = Math.round(sp * St.diff().sp);
    this.spGained = sp;
    this.coinsGained = coins;

    A.play('victory');
    A.fanfare('victory');
    this.phase = 'victory';
    this.hero.anim = 'cheer';
    if (this.partner && !this.partner.down) this.partner.anim = 'cheer';
    yield 40;

    var lv = St.addSp(sp);
    St.addCoins(coins);
    for (var g = 0; g < this.itemsGained.length; g++) St.addItem(this.itemsGained[g]);

    yield { until: function () { return In.pressed('a') || self.victoryT > 260; } };

    // level ups
    for (var l = 0; l < lv.levels; l++) {
      yield* this.levelUpSeq();
    }
    this.close();
  };

  Battle.prototype.levelUpSeq = function* () {
    var self = this, S = St.get();
    this.phase = 'levelup';
    A.fanfare('levelup');
    var choice = 0;
    var picked = null;
    this.levelMenu = new UI.Menu({
      title: 'LEVEL ' + S.level + '!  Choose an upgrade',
      items: [
        { label: 'Heart  —  Max HP +5', k: 'hp' },
        { label: 'Flower —  Max FP +5', k: 'fp' },
        { label: 'Badge  —  BP +3', k: 'bp' }
      ],
      x: W / 2 - 190, y: 190, w: 380, rowH: 40, rows: 3,
      onPick: function (it) { picked = it.k; },
      onCancel: function () { }
    });
    yield { until: function () { self.levelMenu.update(); return picked !== null; } };
    St.applyLevelChoice(picked);
    St.heal(999, 999);
    this.hero.maxHp = St.maxHp();
    this.hero.hp = S.hp;
    this.levelMenu = null;
    this.phase = 'victory';
    A.sfx('levelup');
    yield 30;
  };

  Battle.prototype.close = function () {
    var self = this;
    this.syncState();
    this.fader.out(function () {
      self.onEnd({ result: self.result, sp: self.spGained, coins: self.coinsGained, items: self.itemsGained });
    }, .07, '#0f0a18');
  };

  /* ======================================================================
     Update / draw
     ====================================================================== */
  Battle.prototype.update = function () {
    this.t++;
    if (this.phase === 'victory') this.victoryT = (this.victoryT || 0) + 1;
    this.fader.update();
    this.dlg.update();

    if (this.phase === 'gameover') {
      if (In.pressed('a')) {
        var self = this;
        this.fader.out(function () { self.onEnd({ result: 'lose' }); }, .06);
      }
      return;
    }

    if (this.co && !this.dlg.isBusy()) this.co.step(this);

    var all = this.everyone();
    for (var i = 0; i < all.length; i++) {
      var c = all[i];
      c.t++;
      if (c.hitFlash > 0) c.hitFlash--;
      if (c.shake > 0) c.shake--;
      if (c.down && c.anim !== 'defeat') c.anim = 'defeat';
    }
    for (var n = this.numbers.length - 1; n >= 0; n--) {
      this.numbers[n].t++;
      if (this.numbers[n].t > 56) this.numbers.splice(n, 1);
    }
    for (var f = this.fx.length - 1; f >= 0; f--) {
      var e = this.fx[f]; e.t++;
      if (e.k === 'bit') { e.x += e.vx; e.y += e.vy; e.vy += 0.18; e.rot += e.vr; }
      if (e.k === 'star') { e.y -= 1.4; }
      if (e.t > e.life) this.fx.splice(f, 1);
    }
    if (this.shake > 0) this.shake *= 0.86;
    if (this.msgT > 0) this.msgT--;
    if (this.crowdTossT > 0) this.crowdTossT--;
    if (this.duetFlash > 0) this.duetFlash--;

    // remove defeated foes after their collapse animation
    for (var q = this.foes.length - 1; q >= 0; q--) {
      if (this.foes[q].down) {
        this.foes[q].deadT = (this.foes[q].deadT || 0) + 1;
        if (this.foes[q].deadT > 46) this.foes.splice(q, 1);
      }
    }
  };

  /* ---- stage ------------------------------------------------------------- */
  function drawStage(ctx, b) {
    var t = b.t;
    // backdrop
    var g = ctx.createLinearGradient(0, 0, 0, H);
    var pal = STAGE_BG[b.bg] || STAGE_BG.stage;
    g.addColorStop(0, pal[0]); g.addColorStop(1, pal[1]);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    // back scenery: layered torn paper hills
    for (var l = 0; l < 3; l++) {
      var y = 210 + l * 40;
      P.tornEdge(ctx, -20, W + 20, y, 14 - l * 3, 26, l * 3.3, U.rgba(pal[2 + l] || pal[1], 1), true, FLOOR + 6);
    }

    // stage floor
    P.rr(ctx, -20, FLOOR, W + 40, H - FLOOR, 0, pal[5] || '#8a5a30', null, 0);
    P.line(ctx, [[0, FLOOR], [W, FLOOR]], U.shade(pal[5] || '#8a5a30', -.35), 4);
    ctx.save(); ctx.globalAlpha = .12;
    for (var p = 0; p < 22; p++) P.line(ctx, [[p * 46 - 10, FLOOR], [p * 46 - 40, H]], '#000', 2);
    ctx.restore();

    // footlights
    for (var fl = 0; fl < 9; fl++) {
      var fx2 = 60 + fl * 108;
      P.ell(ctx, fx2, FLOOR + 8, 13, 7, '#f5c02e', '#8a6a2a', 2);
      ctx.save(); ctx.globalAlpha = .075 + Math.sin(t * .04 + fl) * .025;
      ctx.beginPath();
      ctx.moveTo(fx2 - 13, FLOOR + 6); ctx.lineTo(fx2 + 13, FLOOR + 6);
      ctx.lineTo(fx2 + 78, 120); ctx.lineTo(fx2 - 78, 120);
      ctx.closePath(); ctx.fillStyle = '#ffe9a8'; ctx.fill();
      ctx.restore();
    }

    // curtains
    var cw = 92;
    for (var s = 0; s < 2; s++) {
      var x0 = s === 0 ? 0 : W - cw;
      ctx.save();
      P.rr(ctx, x0 - 8, -12, cw + 16, 330, 10, '#8a1a2a', '#5a0a16', 3);
      for (var d = 0; d < 5; d++) {
        P.line(ctx, [[x0 + 12 + d * 22, -8], [x0 + 16 + d * 22, 320]], U.rgba('#5a0a16', .5), 6);
      }
      ctx.restore();
    }
    P.rr(ctx, -10, -24, W + 20, 56, 10, '#8a1a2a', '#5a0a16', 3);
    for (var sc = 0; sc < 18; sc++) {
      P.ell(ctx, 20 + sc * 54, 30, 28, 18, '#a02434', '#5a0a16', 2.4);
    }

    // audience
    drawAudience(ctx, b);
  }

  var STAGE_BG = {
    stage: ['#3a2a4a', '#1c1226', '#4a3560', '#3f2f52', '#2f2440', '#8a5a30'],
    forest: ['#7fc7e8', '#cfe9c0', '#4f9a48', '#3f8a3c', '#2f6a2c', '#8a5a30'],
    ember: ['#f09a4a', '#5a1a10', '#c8442a', '#8a2a18', '#5a1a10', '#6a3a22'],
    harbor: ['#8fd0f0', '#2f5a7a', '#4f8aa8', '#3f6a8a', '#2f4a60', '#7a6a4a'],
    carnival: ['#f0a0c0', '#5a2b6e', '#8a5fc0', '#6b3f7a', '#4a2f5a', '#8a1a2a'],
    library: ['#d8c8a0', '#4a3560', '#7b4fa0', '#5a3f7a', '#3f2f52', '#7a5230'],
    frost: ['#cfe8f8', '#4f7a9a', '#9fd8f0', '#7ab8d8', '#4f8aa8', '#8fb0c8'],
    foundry: ['#c8b48a', '#3a3f4a', '#6f7a8c', '#5a626e', '#3f4650', '#5a5f6a'],
    blot: ['#4a3560', '#0f0a18', '#2f2440', '#241a34', '#160f22', '#241a34'],
    void_: ['#f2f0ff', '#c8c4e0', '#e0dcf0', '#d0ccE8', '#bfbad8', '#a8a4c0'],
    coliseum: ['#f0d8a0', '#8a5a30', '#c8a06a', '#a9713f', '#7a5230', '#c8a06a']
  };

  function drawAudience(ctx, b) {
    var rows = 2, per = 22;
    var n = Math.round(U.clamp(b.audience, 0, 100) / 100 * rows * per);
    var t = b.t;
    var cheering = b.msgT > 40 || b.crowdTossT > 0;
    var i = 0;
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < per; c++) {
        if (i >= n) break;
        var x = 24 + c * 43 + (r % 2) * 20;
        var y = H - 34 + r * 22;
        var bob = Math.sin(t * (cheering ? 0.28 : 0.05) + i * 0.7) * (cheering ? 5 : 1.6);
        var col = AUD_COL[i % AUD_COL.length];
        ctx.save();
        ctx.globalAlpha = 0.95;
        P.ell(ctx, x, y - bob, 14, 13, col, U.shade(col, -.4), 2);
        P.ell(ctx, x - 4.5, y - bob - 1, 2.2, 2.6, '#2a1c3c', null);
        P.ell(ctx, x + 4.5, y - bob - 1, 2.2, 2.6, '#2a1c3c', null);
        ctx.restore();
        i++;
      }
    }
    // stage lip
    P.rr(ctx, -10, H - 58, W + 20, 12, 4, '#5a3a20', '#3a2412', 2.4);
  }
  var AUD_COL = ['#e8b96a', '#9fd0e8', '#d8a0c8', '#a8d8a0', '#f0c060', '#c0a8e8', '#f0a090', '#88ccc0'];

  /* ---- combatant drawing --------------------------------------------------- */
  function drawCombatant(ctx, b, c) {
    var st = {
      t: c.t, anim: c.anim,
      flip: c.side === 'enemy' ? -1 : 1,
      scale: 1.42,
      lift: c.lift || 0,
      tint: c.hitFlash > 0 ? '#ffffff' : null,
      tintAmt: c.hitFlash > 0 ? (c.hitFlash / 14) * .85 : 0,
      blink: (c.t % 190 < 8) ? 1 : 0,
      talking: false
    };
    var x = c.x + (c.shake > 0 ? U.rndRange(-c.shake / 2.4, c.shake / 2.4) : 0);
    var y = c.y;
    if (c.down) {
      st.alpha = Math.max(0, 1 - (c.deadT || 0) / 46);
      st.rot = -1.2;
    }
    if (hasStatus(c, 'freeze')) { st.tint = '#9fd8f0'; st.tintAmt = .5; }
    if (hasStatus(c, 'inked')) { st.tint = '#2a1c3c'; st.tintAmt = .35; }
    if (hasStatus(c, 'shrink')) st.scale = st.scale * .68;
    if (c.kind === 'hero' && c.form) st.scale *= 1.02;
    Spr.draw(ctx, c.sprite, x, y, st);

    // form aura
    if (c.kind === 'hero' && c.form) {
      var fm = Mv.get(c.form);
      var col = c.form === 'form_crane' ? '#8fd0f0' : c.form === 'form_fortress' ? '#9aa3b0'
        : c.form === 'form_dart' ? '#e0483c' : c.form === 'form_lantern' ? '#ffe066' : '#cfd6de';
      ctx.save(); ctx.globalAlpha = .25 + Math.sin(c.t * .08) * .1;
      P.ell(ctx, x, y - 40, 42, 50, null, col, 3);
      ctx.restore();
      P.text(ctx, fm.name.replace(' Form', ''), x, y + 22, { size: 11, align: 'center', color: col });
    }

    // status icons
    var sy = y - Spr.height(c.sprite) * 1.15 - 18;
    for (var i = 0; i < c.st.length; i++) {
      var d = STATUS[c.st[i].type];
      if (!d) continue;
      var ix = x - (c.st.length - 1) * 9 + i * 18;
      P.ell(ctx, ix, sy, 8, 8, d.color, '#2a1c3c', 1.8);
      P.text(ctx, '' + c.st[i].turns, ix, sy + 4, { size: 10, align: 'center', color: '#2a1c3c', outline: false, shadow: false });
    }
    for (var q = 0; q < c.buffs.length; q++) {
      var bd = BUFFS[c.buffs[q].type];
      if (!bd) continue;
      var bx = x - (c.buffs.length - 1) * 9 + q * 18;
      P.star(ctx, bx, sy - 18, 7, 3, 5, 0, bd.color, '#2a1c3c', 1.4);
    }

    // enemy HP bar (Peekaboo, tattled, or boss)
    if (c.side === 'enemy' && !c.down) {
      var show = St.badgeMods().peekaboo || St.isTattled(c.id) || hasFlag(c, 'boss');
      if (show) {
        var bw = hasFlag(c, 'boss') ? 84 : 56;
        UI.bar(ctx, x - bw / 2, y + 12, bw, 8, c.hp / c.maxHp, '#e0483c', '#f0908a');
        if (St.badgeMods().peekaboo) P.text(ctx, c.hp + '/' + c.maxHp, x, y + 32, { size: 11, align: 'center', color: '#fff' });
      }
      if (c.guardTurns > 0) P.text(ctx, '🛡', x + 28, y - 6, { size: 14, align: 'center', color: '#57b8ea' });
    }
  }

  Battle.prototype.draw = function (ctx) {
    var self = this;
    ctx.save();
    if (this.shake > 0.4) ctx.translate(U.rndRange(-this.shake, this.shake), U.rndRange(-this.shake, this.shake) * .5);

    drawStage(ctx, this);

    if (this.duetFlash > 0) {
      ctx.save(); ctx.globalAlpha = U.clamp(this.duetFlash / 60, 0, 1) * .35;
      ctx.fillStyle = '#ffe9a8'; ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }

    // depth sort
    var all = this.everyone().slice().sort(function (a, b2) { return (a.y - (a.lift || 0)) - (b2.y - (b2.lift || 0)); });
    for (var i = 0; i < all.length; i++) drawCombatant(ctx, this, all[i]);

    // fx
    for (var f = 0; f < this.fx.length; f++) {
      var e = this.fx[f];
      var a = 1 - e.t / e.life;
      ctx.save(); ctx.globalAlpha = U.clamp(a, 0, 1);
      if (e.k === 'bit') {
        ctx.translate(e.x, e.y); ctx.rotate(e.rot);
        P.rr(ctx, -e.r / 2, -e.r / 2, e.r, e.r * .7, 1, e.c, null, 0);
      } else if (e.k === 'slash') {
        ctx.translate(e.x, e.y); ctx.rotate(e.a);
        var w2 = 70 * (0.4 + e.t / e.life);
        P.poly(ctx, [[-w2, -4], [w2, -10], [w2, 10], [-w2, 4]], e.c, null, 0);
      } else if (e.k === 'ring') {
        var rr2 = e.r * (e.t / e.life);
        P.ell(ctx, e.x, e.y, rr2, rr2 * .5, null, e.c, 4);
      } else if (e.k === 'star') {
        P.star(ctx, e.x, e.y, 10, 4, 5, e.t * .1, e.c, '#2a1c3c', 1.4);
      }
      ctx.restore();
    }

    // damage numbers
    for (var n = 0; n < this.numbers.length; n++) {
      var num = this.numbers[n];
      UI.damageNumber(ctx, num.txt, num.x, num.y, num.t, num.c, num.crit);
    }

    ctx.restore();

    // ---- HUD ----
    this.drawBattleHud(ctx);

    // target cursor
    if (this.targetCursor) {
      var tc = this.targetCursor.pool[this.targetCursor.idx];
      if (tc) {
        var bob = Math.sin(this.t * .18) * 4;
        P.poly(ctx, [[tc.x - 14, tc.y - 104 - bob], [tc.x + 14, tc.y - 104 - bob], [tc.x, tc.y - 84 - bob]], '#ffe066', '#2a1c3c', 2.4);
        P.text(ctx, tc.name, tc.x, tc.y - 112 - bob, { size: 13, align: 'center', color: '#fff8e0' });
      }
    }

    // menus
    for (var mi = 0; mi < this.menuStack.length; mi++) this.menuStack[mi].draw(ctx);

    // action command widget
    if (this.co) this.co.drawExtra(ctx);
    if (this.activeGuard) this.activeGuard.draw(ctx, this.hero.x, this.hero.y - 44);
    if (this.stylishWindow > 0) {
      var sa = this.stylishWindow / 16;
      ctx.save(); ctx.globalAlpha = sa;
      P.text(ctx, 'X for STYLISH!', W / 2, H - 150, { size: 22, align: 'center', color: '#f07a8a' });
      ctx.restore();
    }

    // banner
    if (this.msgT > 0 && this.msg) {
      var ba = U.clamp(this.msgT / 22, 0, 1);
      ctx.save(); ctx.globalAlpha = ba;
      P.textWave(ctx, this.msg.txt, W / 2, 118, { size: 26, align: 'center', color: this.msg.c, amp: 2, phase: this.t * .1 });
      ctx.restore();
    }

    if (this.phase === 'victory') this.drawVictory(ctx);
    if (this.phase === 'levelup' && this.levelMenu) {
      ctx.save(); ctx.fillStyle = 'rgba(15,10,24,.6)'; ctx.fillRect(0, 0, W, H); ctx.restore();
      UI.title(ctx, 'LEVEL UP!', 150, { t: this.t, color: '#ffe066', size: 40 });
      this.levelMenu.draw(ctx);
    }
    if (this.phase === 'gameover') {
      ctx.save(); ctx.fillStyle = 'rgba(15,10,24,.82)'; ctx.fillRect(0, 0, W, H); ctx.restore();
      UI.title(ctx, 'CRUMPLED', 230, { t: this.t, color: '#e0483c', size: 52 });
      P.text(ctx, 'Press Z to continue', W / 2, 300, { size: 18, align: 'center', color: '#f7edd6' });
    }

    this.dlg.draw(ctx);
    this.fader.draw(ctx);
  };

  Battle.prototype.drawBattleHud = function (ctx) {
    var S = St.get();
    // hero panel
    P.panel(ctx, 14, 12, 214, 62, { fill: '#fdf6e3', edge: '#8a6a3a', radius: 10, stackRot: -.01 });
    P.text(ctx, S.name, 26, 32, { size: 15, color: '#4a3a24', outline: false, shadow: false });
    P.text(ctx, 'Lv' + S.level, 190, 32, { size: 13, align: 'right', color: '#8a6a3a', outline: false, shadow: false });
    UI.bar(ctx, 26, 38, 108, 11, this.hero.hp / this.hero.maxHp, '#e0483c', '#f0908a');
    P.text(ctx, this.hero.hp + '/' + this.hero.maxHp, 140, 48, { size: 12, color: '#4a3a24', outline: false, shadow: false });
    UI.bar(ctx, 26, 54, 108, 11, S.fp / St.maxFp(), '#4fae62', '#8fcf52');
    P.text(ctx, S.fp + '/' + St.maxFp(), 140, 64, { size: 12, color: '#4a3a24', outline: false, shadow: false });

    // partner panel
    if (this.partner) {
      P.panel(ctx, 236, 12, 186, 62, { fill: '#fdf6e3', edge: '#8a6a3a', radius: 10, stack: false });
      P.text(ctx, this.partner.name, 248, 32, { size: 15, color: '#4a3a24', outline: false, shadow: false });
      P.text(ctx, 'R' + this.partner.rank, 408, 32, { size: 12, align: 'right', color: '#8a6a3a', outline: false, shadow: false });
      UI.bar(ctx, 248, 40, 108, 12, this.partner.hp / this.partner.maxHp, '#3f76c9', '#8fd0f0');
      P.text(ctx, this.partner.hp + '/' + this.partner.maxHp, 362, 51, { size: 12, color: '#4a3a24', outline: false, shadow: false });
    }

    // seal energy
    var sx = W - 232, sy = 12;
    P.panel(ctx, sx, sy, 218, 62, { fill: '#fdf6e3', edge: '#8a6a3a', radius: 10, stack: false });
    P.text(ctx, 'SEAL', sx + 12, sy + 22, { size: 12, color: '#8a6a3a', outline: false, shadow: false });
    var wedges = Math.max(1, S.seals.length);
    for (var i = 0; i < wedges; i++) {
      var filled = S.se >= (i + 1) * 100;
      var partial = !filled && S.se > i * 100 ? (S.se - i * 100) / 100 : 0;
      P.star(ctx, sx + 62 + i * 21, sy + 18, 9, 4, 5, 0,
        filled ? '#ffe066' : (partial > 0 ? U.mix('#7a6a4a', '#ffe066', partial) : '#cfc2a8'), '#8a6a3a', 1.6);
    }
    // encore gauge
    P.text(ctx, 'ENCORE', sx + 12, sy + 46, { size: 12, color: '#8a6a3a', outline: false, shadow: false });
    UI.bar(ctx, sx + 66, sy + 36, 136, 13, this.encore / 100, this.encore >= 100 ? '#f5c02e' : '#8a5fc0', '#c8a2e8');
    if (this.encore >= 100) {
      ctx.save(); ctx.globalAlpha = .5 + Math.sin(this.t * .16) * .5;
      P.text(ctx, 'READY', sx + 134, sy + 47, { size: 11, align: 'center', color: '#2a1c3c', outline: false, shadow: false });
      ctx.restore();
    }
    // audience
    P.panel(ctx, W - 232, 82, 218, 26, { fill: '#fdf6e3', edge: '#8a6a3a', radius: 8, stack: false });
    P.text(ctx, 'CROWD', W - 220, 100, { size: 11, color: '#8a6a3a', outline: false, shadow: false });
    UI.bar(ctx, W - 168, 89, 142, 12, this.audience / 100, '#e8506a', '#f0a0b0');
  };

  Battle.prototype.drawVictory = function (ctx) {
    var S = St.get();
    ctx.save(); ctx.fillStyle = 'rgba(15,10,24,.5)'; ctx.fillRect(0, 0, W, H); ctx.restore();
    var bw = 400, bh = 208, bx = (W - bw) / 2, by = 130;
    P.panel(ctx, bx, by, bw, bh, { fill: '#fdf6e3', edge: '#8a6a3a', radius: 14 });
    UI.title(ctx, 'VICTORY', by - 22, { t: this.t, size: 38, color: '#ffe066' });
    P.text(ctx, 'Seal Points', bx + 32, by + 52, { size: 17, color: '#4a3a24', outline: false, shadow: false });
    P.text(ctx, '+' + this.spGained, bx + bw - 32, by + 52, { size: 17, align: 'right', color: '#c8443c', outline: false, shadow: false });
    P.text(ctx, 'Coins', bx + 32, by + 84, { size: 17, color: '#4a3a24', outline: false, shadow: false });
    P.text(ctx, '+' + this.coinsGained, bx + bw - 32, by + 84, { size: 17, align: 'right', color: '#c8963c', outline: false, shadow: false });
    // next level bar
    P.text(ctx, 'Lv ' + S.level, bx + 32, by + 118, { size: 15, color: '#8a6a3a', outline: false, shadow: false });
    UI.bar(ctx, bx + 84, by + 106, bw - 150, 14, S.sp / St.spToNext(), '#f5c02e', '#ffe37a');
    P.text(ctx, S.sp + '/' + St.spToNext(), bx + bw - 32, by + 118, { size: 13, align: 'right', color: '#8a6a3a', outline: false, shadow: false });
    var iy = by + 142;
    if (this.itemsGained.length) {
      P.text(ctx, 'Found:', bx + 32, iy + 14, { size: 15, color: '#4a3a24', outline: false, shadow: false });
      for (var i = 0; i < Math.min(5, this.itemsGained.length); i++) {
        It.drawIcon(ctx, this.itemsGained[i], bx + 104 + i * 34, iy + 8, 28);
      }
    }
    ctx.save(); ctx.globalAlpha = .6 + Math.sin(this.t * .1) * .4;
    P.text(ctx, 'Z to continue', W / 2, by + bh + 26, { size: 15, align: 'center', color: '#f7edd6' });
    ctx.restore();
  };

  function start(cfg, onEnd) { return new Battle(cfg, onEnd); }

  return { start: start, Battle: Battle, STATUS: STATUS, BUFFS: BUFFS, FLOOR: FLOOR };
})();

/* ===== 15_script.js ===== */
/* ==========================================================================
   PAPERBOUND — 15_script.js
   The cutscene / interaction interpreter.

   A script is an array of command arrays, e.g.
       [ ['say','twigby','Look at THAT.'],
         ['flag','saw_gate',true],
         ['battle',{enemies:['snapleaf','snapleaf']}] ]

   Scripts run as generators stepped by the world scene, so they can block on
   dialogue, battles, movement and fades without any callback nesting.
   ========================================================================== */
'use strict';

PB.Script = (function () {
  var U = PB.U, St = PB.State, A = PB.Audio, UI = PB.UI;

  /* Speaker shorthand -> {name, portrait}. Anything not listed is treated as
     a literal display name with no portrait. */
  var SPEAKERS = {
    pip: { name: 'Pip', portrait: 'pip' },
    twigby: { name: 'Twigby', portrait: 'twigby' },
    lumen: { name: 'Lumen', portrait: 'lumen' },
    bloop: { name: 'Bloop', portrait: 'bloop' },
    snip: { name: 'Snip', portrait: 'snip' },
    margo: { name: 'Margo', portrait: 'margo' },
    volt: { name: 'Volt', portrait: 'volt' },
    narr: { name: '', portrait: null, style: 'narr' },
    sys: { name: '', portrait: null, style: 'sys' }
  };
  function speaker(key) {
    if (!key) return { name: '', portrait: null };
    if (SPEAKERS[key]) return SPEAKERS[key];
    if (PB.Sprites.has(key)) {
      var nm = key.replace(/_/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); });
      return { name: nm, portrait: key };
    }
    return { name: key, portrait: null };
  }
  function defineSpeaker(key, name, portrait, style) { SPEAKERS[key] = { name: name, portrait: portrait, style: style }; }

  /* ======================================================================
     run(world, script) -> generator
     `world` supplies the hooks the commands need.
     ====================================================================== */
  function* run(world, script, ctxVars) {
    if (!script || !script.length) return;
    var vars = ctxVars || {};
    for (var i = 0; i < script.length; i++) {
      var c = script[i];
      if (!c) continue;
      if (typeof c === 'function') { c(world, vars); continue; }
      var op = c[0];
      var r = yield* exec(world, op, c, vars);
      if (r === 'stop') return;
    }
  }

  function* exec(world, op, c, vars) {
    var S = St.get();
    switch (op) {

      /* ---- dialogue ---- */
      case 'say': {
        var sp = speaker(c[1]);
        var opts = U.extend({ speaker: sp.name, portrait: sp.portrait, style: sp.style || 'normal' }, c[3] || {});
        world.dlg.say(c[2], opts);
        yield { until: function () { return !world.dlg.isBusy(); } };
        break;
      }
      case 'sayx': {  // explicit: ['sayx', name, portrait, text, style]
        world.dlg.say(c[3], { speaker: c[1], portrait: c[2], style: c[4] || 'normal' });
        yield { until: function () { return !world.dlg.isBusy(); } };
        break;
      }
      case 'ask': {
        var sp2 = speaker(c[1]);
        var choice = -1;
        world.dlg.ask(c[2], c[3], function (i) { choice = i; },
          { speaker: sp2.name, portrait: sp2.portrait, style: sp2.style || 'normal' });
        yield { until: function () { return choice >= 0 && !world.dlg.isBusy(); } };
        var branch = c[4] && c[4][choice];
        vars.choice = choice;
        if (branch) { var r = yield* run(world, branch, vars); if (r === 'stop') return 'stop'; }
        break;
      }

      /* ---- flow ---- */
      case 'wait': yield (c[1] || 30); break;
      case 'stop': return 'stop';
      case 'func': if (c[1]) c[1](world, vars); break;
      case 'ifflag': {
        if (St.hasFlag(c[1])) { if (c[2]) { var r2 = yield* run(world, c[2], vars); if (r2 === 'stop') return 'stop'; } }
        else if (c[3]) { var r3 = yield* run(world, c[3], vars); if (r3 === 'stop') return 'stop'; }
        break;
      }
      case 'ifnotflag': {
        if (!St.hasFlag(c[1])) { var r4 = yield* run(world, c[2], vars); if (r4 === 'stop') return 'stop'; }
        else if (c[3]) { var r5 = yield* run(world, c[3], vars); if (r5 === 'stop') return 'stop'; }
        break;
      }
      case 'ifitem': {
        var have = St.hasKey(c[1]) || St.hasItem(c[1]);
        if (have) { if (c[2]) { var r6 = yield* run(world, c[2], vars); if (r6 === 'stop') return 'stop'; } }
        else if (c[3]) { var r7 = yield* run(world, c[3], vars); if (r7 === 'stop') return 'stop'; }
        break;
      }
      case 'ifpartner': {
        if (St.hasPartner(c[1])) { if (c[2]) { var r8 = yield* run(world, c[2], vars); if (r8 === 'stop') return 'stop'; } }
        else if (c[3]) { var r9 = yield* run(world, c[3], vars); if (r9 === 'stop') return 'stop'; }
        break;
      }
      case 'ifquest': {
        if (St.questState(c[1]) === c[2]) { if (c[3]) { var ra = yield* run(world, c[3], vars); if (ra === 'stop') return 'stop'; } }
        else if (c[4]) { var rb = yield* run(world, c[4], vars); if (rb === 'stop') return 'stop'; }
        break;
      }
      case 'sub': { var rc = yield* run(world, c[1], vars); if (rc === 'stop') return 'stop'; break; }

      /* ---- state ---- */
      case 'flag': St.flag(c[1], c[2] === undefined ? true : c[2]); break;
      case 'chapterset': S.chapter = c[1]; break;
      case 'quest':
        if (c[2] === 'start') St.questStart(c[1]);
        else if (c[2] === 'done') { St.questDone(c[1]); UI.toast('Quest complete: ' + (c[3] || c[1]), null, '#8fcf52'); A.fanfare('item'); }
        else St.questProgress(c[1], c[2]);
        break;

      /* ---- rewards ---- */
      case 'give': {
        var d = PB.Items.get(c[1]);
        if (d) {
          var ok = St.addItem(c[1]);
          A.fanfare('item');
          if (ok === 'store') UI.toast(d.name + ' → storage', c[1], '#e8dcc0');
          else if (ok) UI.toast('Got ' + d.name + '!', c[1], '#fdf6e3');
          else UI.toast('Bag full! ' + d.name + ' left behind.', c[1], '#f0a0a0');
        }
        break;
      }
      case 'givekey': {
        var kd = PB.Items.get(c[1]);
        if (kd) { St.addKey(c[1]); A.fanfare('item'); UI.toast('Got ' + kd.name + '!', c[1], '#ffe9a8'); }
        break;
      }
      case 'takekey': St.removeKey(c[1]); break;
      case 'coins': { var got = St.addCoins(c[1]); A.sfx('coin'); UI.toast('+' + got + ' coins', 'seal1', '#ffe9a8'); break; }
      case 'badge': {
        if (St.giveBadge(c[1])) { A.fanfare('item'); UI.toast('Badge: ' + PB.Badges.get(c[1]).name, null, '#f5c02e'); }
        break;
      }
      case 'shard': {
        S.shards += (c[1] || 1);
        A.fanfare('item');
        UI.toast('Foil Shard ×' + (c[1] || 1), null, '#c8d2dc');
        break;
      }
      case 'rankup': {
        if (St.rankUp(c[1])) {
          A.fanfare('levelup');
          var pn = PB.Partners.get(c[1]).name;
          UI.toast(pn + ' ranked up!', null, '#8fd0f0');
        }
        break;
      }
      case 'form': if (St.unlockForm(c[1])) { A.fanfare('seal'); UI.toast('New Form: ' + PB.Moves.get(c[1]).name, null, '#8fd0f0'); } break;
      case 'seal': if (St.unlockSeal(c[1])) { A.fanfare('seal'); UI.toast('Seal Power: ' + PB.Moves.get(c[1]).name, null, '#ffe066'); } break;
      case 'recipe': St.learnRecipe(c[1]); break;
      case 'upgrade':
        if (c[1] === 'stomp') { S.stompRank = Math.min(3, S.stompRank + 1); UI.toast('Stomp upgraded!', null, '#e0483c'); }
        else { S.malletRank = Math.min(3, S.malletRank + 1); UI.toast('Mallet upgraded!', null, '#a9713f'); }
        A.fanfare('levelup');
        break;
      case 'heal': St.fullHeal(); A.sfx('heal'); UI.toast('Fully restored', null, '#8fcf52'); break;
      case 'toast': UI.toast(c[1], c[2] || null, c[3] || '#fdf6e3'); break;

      /* ---- party ---- */
      case 'partner': {
        var pd = PB.Partners.get(c[1]);
        if (pd && St.givePartner(c[1])) {
          St.setActive(c[1]);
          A.fanfare('levelup');
          UI.toast(pd.name + ' joined!', null, '#8fd0f0');
        }
        break;
      }
      case 'setactive': St.setActive(c[1]); break;

      /* ---- world ---- */
      case 'entity': world.setEntity(c[1], c[2]); break;
      case 'move': {
        var done = false;
        world.moveEntity(c[1], c[2], c[3], c[4] || 2, function () { done = true; });
        yield { until: function () { return done; } };
        break;
      }
      case 'movenowait': world.moveEntity(c[1], c[2], c[3], c[4] || 2, null); break;
      case 'face': world.faceEntity(c[1], c[2]); break;
      case 'anim': world.animEntity(c[1], c[2]); break;
      case 'spawn': world.spawnEntity(c[1]); break;
      case 'despawn': world.despawnEntity(c[1]); break;
      case 'hop': { var hd = false; world.hopEntity(c[1], c[2] || 1, function () { hd = true; }); yield { until: function () { return hd; } }; break; }
      case 'camera': { world.cameraTo(c[1], c[2] || 60); yield (c[3] === undefined ? (c[2] || 60) : c[3]); break; }
      case 'camerafree': world.cameraFollow(); break;
      case 'shake': world.shake = c[1] || 10; break;

      /* ---- presentation ---- */
      case 'music': A.play(c[1]); break;
      case 'stopmusic': A.stop(); break;
      case 'sfx': A.sfx(c[1]); break;
      case 'fanfare': A.fanfare(c[1]); break;
      case 'fadeout': {
        var f1 = false;
        world.fader.out(function () { f1 = true; }, c[2] || .06, c[1] || '#0f0a18', c[3]);
        yield { until: function () { return f1; } };
        break;
      }
      case 'fadein': {
        var f2 = false;
        world.fader.in(function () { f2 = true; }, c[1] || .06);
        yield { until: function () { return f2; } };
        break;
      }
      case 'chapter': {
        world.chapterCard = { n: c[1], title: c[2], sub: c[3] || '', t: 0 };
        S.chapter = c[1];
        A.fanfare('seal');
        yield { until: function () { return world.chapterCard === null; } };
        break;
      }
      case 'title': {
        world.bigText = { txt: c[1], t: 0, life: c[2] || 120, color: c[3] || '#fff8e0' };
        yield (c[2] || 120);
        break;
      }

      /* ---- transitions ---- */
      case 'goto': {
        var g = false;
        world.travel(c[1], c[2] || 'default', function () { g = true; });
        yield { until: function () { return g; } };
        break;
      }
      case 'setspawn': S.map = c[1]; S.spawn = c[2] || 'default'; break;

      /* ---- battle ---- */
      case 'battle': {
        var res = null;
        world.startBattle(c[1] || {}, function (r) { res = r; });
        yield { until: function () { return res !== null; } };
        vars.battle = res;
        if (res.result === 'lose') return 'stop';
        if (c[2] && res.result === 'win') { var rw = yield* run(world, c[2], vars); if (rw === 'stop') return 'stop'; }
        break;
      }

      /* ---- shops & services ---- */
      case 'shop': {
        var sd = false;
        world.openShop(c[1], function () { sd = true; });
        yield { until: function () { return sd; } };
        break;
      }
      case 'inn': {
        var idone = false;
        world.openInn(c[1] || 5, function () { idone = true; });
        yield { until: function () { return idone; } };
        break;
      }
      case 'cook': {
        var cd = false;
        world.openCook(function () { cd = true; });
        yield { until: function () { return cd; } };
        break;
      }
      case 'save': {
        var svd = false;
        world.openSave(function () { svd = true; });
        yield { until: function () { return svd; } };
        break;
      }
      case 'credits': world.rollCredits(); yield { until: function () { return false; } }; break;

      default:
        if (window.console) console.warn('unknown script op', op);
    }
    return null;
  }

  return { run: run, speaker: speaker, defineSpeaker: defineSpeaker, SPEAKERS: SPEAKERS };
})();

/* ===== 16_world.js ===== */
/* ==========================================================================
   PAPERBOUND — 16_world.js
   The overworld: a 2.5D plane where x runs left/right, z runs into the screen
   (0 = far, 1 = near) and y is height above the floor. Sprites are flat paper
   billboards sorted by depth, which is exactly how the games this is modelled
   on fake a third dimension.
   ========================================================================== */
'use strict';

PB.Maps = (function () {
  var db = {};
  function define(id, o) { o.id = id; db[id] = o; return o; }
  function get(id) { return db[id]; }
  function all() { return db; }
  function has(id) { return !!db[id]; }
  return { define: define, get: get, all: all, has: has };
})();

PB.World = (function () {
  var U = PB.U, P = PB.Paper, In = PB.Input, A = PB.Audio, Spr = PB.Sprites;
  var UI = PB.UI, St = PB.State, Maps = PB.Maps, Sc = PB.Script;

  var W = 960, H = 540;
  var HORIZON = 296, DEPTH = 124;
  var GRAV = 0.62, JUMP_V = 10.4, WALK = 3.1, RUN = 4.5;

  function proj(x, z, y, camX) {
    return { sx: x - camX, sy: HORIZON + z * DEPTH - (y || 0), sc: 0.98 + z * 0.44 };
  }

  /* ======================================================================
     Entities
     ====================================================================== */
  function Ent(o) {
    U.extend(this, {
      id: o.id || ('e' + U.rndInt(1e9)), kind: o.kind || 'npc',
      sprite: o.sprite || 'villager_a', x: o.x || 0, z: o.z === undefined ? .5 : o.z, y: o.y || 0,
      vx: 0, vz: 0, vy: 0, flip: o.face === 'left' ? -1 : 1, flipT: o.face === 'left' ? 1 : 0,
      anim: 'idle', t: U.rndInt(200), scale: o.scale || 1, name: o.name || '',
      script: o.script || null, solid: o.solid !== false, hidden: !!o.hidden,
      moveTo: null, moveCb: null, speed: 2, hopCb: null,
      bob: !!o.bob, data: o
    }, {});
  }

  /* ======================================================================
     World scene
     ====================================================================== */
  function World(game) {
    this.game = game;
    this.t = 0;
    this.map = null;
    this.camX = 0; this.camTarget = null; this.camLock = false; this.camLerp = .1;
    this.player = { x: 0, z: .5, y: 0, vx: 0, vz: 0, vy: 0, onGround: true, flip: 1, flipT: 0, anim: 'idle', t: 0, standing: null, form: null, formT: 0, gliding: false };
    this.partnerEnt = { x: 0, z: .5, y: 0, flip: 1, flipT: 0, anim: 'idle', t: 0, trail: [] };
    this.ents = [];
    this.foes = [];
    this.pickups = [];
    this.gizmos = [];
    this.triggers = [];
    this.blocks = [];
    this.dlg = new UI.Dialogue();
    this.fader = new UI.Fader();
    this.co = null;              // running script coroutine
    this.busy = false;           // cutscene lock
    this.shake = 0;
    this.chapterCard = null;
    this.bigText = null;
    this.hint = null;
    this.battle = null;
    this.battleCb = null;
    this.overlay = null;         // shop / pause / save panel
    this.darkness = 0;
    this.lightRadius = 0;
    this.swing = 0;
    this.fx = [];
    this.encounterCooldown = 0;
    this.lastSafe = { x: 0, z: .5 };
    this.repel = 0;
    this.stepT = 0;
    this.credits = null;
    this.fastTravel = false;
  }

  /* ---- loading ------------------------------------------------------------ */
  World.prototype.load = function (mapId, spawnId) {
    var m = Maps.get(mapId);
    if (!m) { if (window.console) console.error('missing map', mapId); m = Maps.get('quill_square'); }
    this.map = m;
    var S = St.get();
    S.map = m.id; S.spawn = spawnId || 'default';

    this.ents = []; this.foes = []; this.pickups = []; this.gizmos = []; this.triggers = []; this.blocks = [];
    this.fx = []; this.hint = null; this.darkness = m.dark ? 1 : 0;

    var i;
    (m.solids || []).forEach(function (s) {
      this.blocks.push({ x: s.x, z: s.z === undefined ? .5 : s.z, w: s.w, d: s.d === undefined ? .3 : s.d, h: s.h || 40, sprite: s.sprite, wall: !!s.wall, id: s.id, hidden: !!s.hidden, water: !!s.water });
    }, this);
    (m.props || []).forEach(function (p) {
      this.ents.push(new Ent({ id: p.id, kind: 'prop', sprite: p.sprite, x: p.x, z: p.z, y: p.y || 0, scale: p.scale, face: p.face, solid: false, hidden: p.hidden }));
    }, this);
    (m.npcs || []).forEach(function (n) {
      this.ents.push(new Ent(U.extend({ kind: 'npc' }, n)));
    }, this);
    (m.foes || []).forEach(function (f) {
      if (f.flag && St.hasFlag(f.flag)) return;
      if (f.killFlag && St.hasFlag(f.killFlag)) return;
      this.foes.push({
        id: f.id || ('f' + U.rndInt(1e9)), type: f.type, group: f.group || [f.type],
        x: f.x, z: f.z === undefined ? .5 : f.z, y: 0, homeX: f.x, patrol: f.patrol || 0,
        dir: 1, t: U.rndInt(200), anim: 'walk', flip: 1, flipT: 0, stunned: 0, dead: false,
        killFlag: f.killFlag, boss: !!f.boss, cfg: f.cfg || null, speed: f.speed || 1.1,
        chase: f.chase === undefined ? true : f.chase, vy: 0
      });
    }, this);
    (m.items || []).forEach(function (it) {
      if (it.flag && St.hasFlag(it.flag)) return;
      this.pickups.push(U.extend({ t: U.rndInt(200), taken: false }, it));
    }, this);
    (m.gizmos || []).forEach(function (g) {
      this.gizmos.push(U.extend({ t: U.rndInt(200), used: !!(g.flag && St.hasFlag(g.flag)) }, g));
    }, this);
    (m.triggers || []).forEach(function (tr) {
      this.triggers.push(U.extend({ fired: !!(tr.flag && St.hasFlag(tr.flag)) }, tr));
    }, this);

    var sp = (m.spawns && m.spawns[spawnId]) || (m.spawns && m.spawns.default) || { x: (m.bounds.x0 + 60), z: .5 };
    this.player.x = sp.x; this.player.z = sp.z === undefined ? .5 : sp.z;
    this.player.y = sp.y || 0; this.player.vx = this.player.vy = this.player.vz = 0;
    this.player.onGround = true;
    if (sp.face === 'left') { this.player.flip = -1; this.player.flipT = 1; }
    this.lastSafe = { x: this.player.x, z: this.player.z };
    this.partnerEnt.x = this.player.x - 30; this.partnerEnt.z = this.player.z;
    this.camX = this.clampCam(this.player.x - W / 2);
    this.camLock = false;

    A.play(m.music || 'town');
    this.busy = false;
    this.co = null;
    if (m.onEnter) {
      var script = typeof m.onEnter === 'function' ? m.onEnter() : m.onEnter;
      if (script && script.length) this.runScript(script);
    }
  };

  World.prototype.clampCam = function (x) {
    var b = this.map.bounds;
    var span = b.x1 - b.x0;
    if (span <= W) return b.x0 - (W - span) / 2;
    return U.clamp(x, b.x0, b.x1 - W);
  };

  /* ---- script plumbing ----------------------------------------------------- */
  World.prototype.runScript = function (script, vars) {
    if (!script) return;
    this.busy = true;
    this.coro = makeCoro(Sc.run(this, script, vars || {}));
    this.player.anim = 'idle';
  };
  function makeCoro(gen) {
    return {
      g: gen, wait: 0, until: null, done: false,
      step: function () {
        if (this.done) return true;
        if (this.wait > 0) { this.wait--; return false; }
        if (this.until) { if (!this.until()) return false; this.until = null; }
        var r;
        try { r = this.g.next(); }
        catch (e) { if (window.console) console.error('script error', e); this.done = true; return true; }
        if (r.done) { this.done = true; return true; }
        var v = r.value;
        if (typeof v === 'number') this.wait = v;
        else if (v && v.until) this.until = v.until;
        return false;
      }
    };
  }

  /* ---- script hooks -------------------------------------------------------- */
  World.prototype.findEnt = function (id) {
    if (id === 'player' || id === 'pip') return this.player;
    if (id === 'partner') return this.partnerEnt;
    for (var i = 0; i < this.ents.length; i++) if (this.ents[i].id === id) return this.ents[i];
    for (var j = 0; j < this.foes.length; j++) if (this.foes[j].id === id) return this.foes[j];
    return null;
  };
  World.prototype.moveEntity = function (id, x, z, speed, cb) {
    var e = this.findEnt(id);
    if (!e) { if (cb) cb(); return; }
    e.moveTo = { x: x, z: z === undefined ? e.z : z }; e.speed = speed || 2; e.moveCb = cb || null;
    e.anim = 'walk';
  };
  World.prototype.faceEntity = function (id, dir) {
    var e = this.findEnt(id); if (!e) return;
    e.flip = dir === 'left' ? -1 : 1;
    e.flipT = dir === 'left' ? 1 : 0;
  };
  World.prototype.animEntity = function (id, an) { var e = this.findEnt(id); if (e) e.anim = an; };
  World.prototype.hopEntity = function (id, n, cb) {
    var e = this.findEnt(id); if (!e) { if (cb) cb(); return; }
    e.vy = 8; e.hopCb = cb; A.sfx('jump');
  };
  World.prototype.setEntity = function (id, props) { var e = this.findEnt(id); if (e) U.extend(e, props); };
  World.prototype.spawnEntity = function (def) { this.ents.push(new Ent(def)); };
  World.prototype.despawnEntity = function (id) {
    for (var i = this.ents.length - 1; i >= 0; i--) if (this.ents[i].id === id) this.ents.splice(i, 1);
    for (var j = this.foes.length - 1; j >= 0; j--) if (this.foes[j].id === id) this.foes.splice(j, 1);
  };
  World.prototype.cameraTo = function (x, frames) { this.camLock = true; this.camTarget = x; this.camLerp = 2 / Math.max(4, frames); };
  World.prototype.cameraFollow = function () { this.camLock = false; this.camLerp = .1; };
  World.prototype.travel = function (mapId, spawn, cb) {
    var self = this;
    A.sfx('door');
    this.fader.out(function () {
      self.load(mapId, spawn);
      self.fader.in(function () { if (cb) cb(); }, .07);
    }, .08, '#0f0a18');
  };
  World.prototype.startBattle = function (cfg, cb) {
    var self = this;
    A.sfx('tear');
    this.fader.out(function () {
      self.battle = PB.Battle.start(cfg, function (res) {
        self.battle = null;
        A.play(self.map.music || 'town');
        self.fader.in(null, .07);
        if (res.result === 'lose') { self.game.gameOver(); return; }
        if (cb) cb(res);
      });
      self.fader.in(null, .09);
    }, .1, '#0f0a18', 'iris');
  };
  World.prototype.openShop = function (shopId, cb) { this.overlay = PB.Menus.shop(this, shopId, cb); };
  World.prototype.openInn = function (price, cb) { this.overlay = PB.Menus.inn(this, price, cb); };
  World.prototype.openCook = function (cb) { this.overlay = PB.Menus.cook(this, cb); };
  World.prototype.openSave = function (cb) { this.overlay = PB.Menus.save(this, cb); };
  World.prototype.rollCredits = function () { this.game.rollCredits(); };

  /* ======================================================================
     Collision
     ====================================================================== */
  World.prototype.blockAt = function (x, z, y, r) {
    r = r || 13;
    for (var i = 0; i < this.blocks.length; i++) {
      var b = this.blocks[i];
      if (b.hidden) continue;
      if (Math.abs(x - b.x) < b.w / 2 + r && Math.abs(z - b.z) < b.d / 2 + .06) {
        if (b.wall || y < b.h - 3) return b;
      }
    }
    return null;
  };
  World.prototype.floorAt = function (x, z, fromY) {
    var best = 0, bb = null;
    for (var i = 0; i < this.blocks.length; i++) {
      var b = this.blocks[i];
      if (b.hidden || b.wall) continue;
      if (Math.abs(x - b.x) < b.w / 2 + 4 && Math.abs(z - b.z) < b.d / 2 + .04) {
        if (b.h <= fromY + 6 && b.h > best) { best = b.h; bb = b; }
      }
    }
    return { y: best, block: bb };
  };
  World.prototype.inPit = function (x, z) {
    var pits = this.map.pits || [];
    for (var i = 0; i < pits.length; i++) {
      var p = pits[i];
      if (x > p.x0 && x < p.x1 && z > (p.z0 === undefined ? -1 : p.z0) && z < (p.z1 === undefined ? 2 : p.z1)) return p;
    }
    return null;
  };
  World.prototype.inWater = function (x, z) {
    var ws = this.map.water || [];
    for (var i = 0; i < ws.length; i++) {
      var w = ws[i];
      if (x > w.x0 && x < w.x1 && z > (w.z0 === undefined ? -1 : w.z0) && z < (w.z1 === undefined ? 2 : w.z1)) return w;
    }
    return null;
  };

  /* ======================================================================
     Update
     ====================================================================== */
  World.prototype.update = function () {
    this.t++;
    St.get().frames++;
    this.fader.update();
    this.dlg.update();
    UI.updateToasts();
    if (this.repel > 0) this.repel--;
    if (this.encounterCooldown > 0) this.encounterCooldown--;

    if (this.battle) { this.battle.update(); return; }
    if (this.credits) { this.updateCredits(); return; }

    if (this.chapterCard) {
      this.chapterCard.t++;
      if (this.chapterCard.t > 190 || (this.chapterCard.t > 40 && In.pressed('a'))) this.chapterCard = null;
      return;
    }
    if (this.bigText) { this.bigText.t++; if (this.bigText.t > this.bigText.life) this.bigText = null; }

    if (this.overlay) {
      this.overlay.update();
      if (this.overlay.closed) { var cb = this.overlay.onClose; this.overlay = null; if (cb) cb(); }
      return;
    }

    // running cutscene
    if (this.coro && !this.coro.done) {
      if (!this.dlg.isBusy()) this.coro.step();
      if (this.coro.done) { this.coro = null; this.busy = false; }
    }

    if (!this.busy && !this.fader.busy()) {
      if (In.pressed('start')) { this.overlay = PB.Menus.pause(this); A.sfx('ok'); return; }
      if (In.pressed('select')) { this.overlay = PB.Menus.worldmap(this); A.sfx('ok'); return; }
      this.updatePlayer();
    } else {
      this.player.vx = U.approach(this.player.vx, 0, .6);
      this.player.x += this.player.vx;
    }

    this.updatePhysics();
    this.updatePartner();
    this.updateEnts();
    this.updateFoes();
    this.updatePickups();
    this.updateHint();
    this.updateTriggers();
    this.updateCamera();

    for (var i = this.fx.length - 1; i >= 0; i--) {
      var e = this.fx[i]; e.t++;
      if (e.vx !== undefined) { e.x += e.vx; e.y += e.vy; e.vy += .2; }
      if (e.t > e.life) this.fx.splice(i, 1);
    }
    if (this.shake > 0) this.shake *= .86;
    if (this.swing > 0) this.swing--;
    if (this.player.formT > 0) this.player.formT--;
  };

  World.prototype.updatePlayer = function () {
    var p = this.player, m = this.map;
    var ax = In.axisX(), az = In.axisZ();
    var run = In.down('r') || In.down('l');
    var sp = (run ? RUN : WALK) * (p.form === 'weight' ? .55 : 1);

    if (ax || az) {
      var len = Math.sqrt(ax * ax + az * az) || 1;
      p.vx = (ax / len) * sp;
      p.vz = (az / len) * sp * 0.011;
      if (ax !== 0) {
        var want = ax > 0 ? 0 : 1;
        p.flipT = U.approach(p.flipT, want, .22);
      }
      p.anim = p.onGround ? (run ? 'run' : 'walk') : p.anim;
      if (p.onGround) {
        this.stepT++;
        if (this.stepT % (run ? 9 : 13) === 0) { A.sfx('step'); St.get().stats.steps++; }
      }
    } else {
      p.vx = U.approach(p.vx, 0, 1.2);
      p.vz = U.approach(p.vz, 0, .01);
      if (p.onGround) p.anim = 'idle';
    }

    // jump
    if (In.pressed('a') && p.onGround && !this.talkTarget()) {
      p.vy = JUMP_V; p.onGround = false; p.anim = 'jump'; A.sfx('jump');
    }
    // glide (Plane form)
    p.gliding = false;
    if (!p.onGround && p.vy < 0 && In.down('a') && St.hasFlag('form_plane')) {
      p.vy = Math.max(p.vy, -1.7); p.gliding = true; p.anim = 'fall';
      if (this.t % 6 === 0) A.sfx('rustle', 1.6);
    }

    // interact
    if (In.pressed('a') && p.onGround) {
      var tgt = this.talkTarget();
      if (tgt) { this.interact(tgt); In.clearAll(); return; }
    }
    // mallet swing
    if (In.pressed('b') && this.swing <= 0) {
      this.swing = 22; A.sfx('mallet'); p.anim = 'attack';
      this.fieldSwing();
    }
    // partner ability
    if (In.pressed('x')) this.usePartnerAbility();
    // fold (contextual)
    if (In.pressed('y')) this.useFold();
    // cycle partner
    if (In.pressed('l') && In.pressed('r')) { /* both = run, ignore */ }
  };

  World.prototype.updatePhysics = function () {
    var p = this.player, b = this.map.bounds;
    // x axis
    var nx = p.x + p.vx;
    if (!this.blockAt(nx, p.z, p.y)) p.x = nx; else p.vx = 0;
    p.x = U.clamp(p.x, b.x0 + 14, b.x1 - 14);
    // z axis
    var nz = U.clamp(p.z + p.vz, b.z0 === undefined ? .06 : b.z0, b.z1 === undefined ? .98 : b.z1);
    if (!this.blockAt(p.x, nz, p.y)) p.z = nz; else p.vz = 0;
    // y axis
    p.vy -= GRAV;
    p.y += p.vy;
    var f = this.floorAt(p.x, p.z, p.y - p.vy);
    if (p.y <= f.y) {
      if (!p.onGround && p.vy < -3) { A.sfx('land'); this.puff(p.x, p.z, f.y, '#e8dcc0', 5); }
      p.y = f.y; p.vy = 0; p.onGround = true; p.standing = f.block;
      if (p.anim === 'jump' || p.anim === 'fall') p.anim = 'idle';
    } else {
      p.onGround = false;
      if (p.vy < 0 && !p.gliding) p.anim = 'fall';
    }
    if (p.onGround) {
      var pit = this.inPit(p.x, p.z);
      if (pit) this.fallInPit(pit);
      else if (this.inWater(p.x, p.z) && this.player.form !== 'boat') this.fallInWater();
      else { this.lastSafe.x = p.x; this.lastSafe.z = p.z; }
    }
    p.t++;
  };

  World.prototype.fallInPit = function (pit) {
    var self = this, S = St.get();
    this.busy = true;
    A.sfx('hurt');
    var dmg = Math.max(1, Math.round(2 * St.diff().inDmg));
    S.hp = Math.max(1, S.hp - dmg);
    UI.toast('-' + dmg + ' HP', null, '#f0a0a0');
    this.fader.out(function () {
      self.player.x = pit.to ? pit.to.x : self.lastSafe.x;
      self.player.z = pit.to ? pit.to.z : self.lastSafe.z;
      self.player.y = 0; self.player.vy = 0;
      self.fader.in(function () { self.busy = false; }, .08);
    }, .1, '#0f0a18');
  };
  World.prototype.fallInWater = function () {
    var self = this;
    this.busy = true;
    A.sfx('water');
    this.fader.out(function () {
      self.player.x = self.lastSafe.x; self.player.z = self.lastSafe.z; self.player.y = 0; self.player.vy = 0;
      self.fader.in(function () { self.busy = false; }, .08);
    }, .12, '#3f6a8a');
  };

  World.prototype.puff = function (x, z, y, color, n) {
    for (var i = 0; i < (n || 6); i++) {
      this.fx.push({ k: 'bit', x: x + U.rndRange(-10, 10), z: z, y: y, vx: U.rndRange(-1.2, 1.2), vy: U.rndRange(1, 3), r: U.rndRange(2, 5), c: color, t: 0, life: 30 });
    }
  };

  /* ---- partner follows ------------------------------------------------------ */
  World.prototype.updatePartner = function () {
    var pe = this.partnerEnt, p = this.player;
    var id = St.get().active;
    if (!id) return;
    pe.sprite = PB.Partners.get(id).sprite;
    var tx = p.x - (p.flipT > .5 ? -34 : 34), tz = p.z - .04;
    var dx = tx - pe.x, dz = tz - pe.z;
    var d = Math.abs(dx);
    if (d > 6) {
      pe.x += U.clamp(dx * .16, -5.4, 5.4);
      pe.anim = d > 40 ? 'run' : 'walk';
      pe.flipT = U.approach(pe.flipT, dx > 0 ? 0 : 1, .2);
    } else pe.anim = 'idle';
    pe.z += dz * .16;
    pe.y = U.lerp(pe.y, Math.max(0, p.y - 6), .2);
    pe.t++;
  };

  /* ---- npcs ----------------------------------------------------------------- */
  World.prototype.updateEnts = function () {
    for (var i = 0; i < this.ents.length; i++) {
      var e = this.ents[i];
      e.t++;
      if (e.moveTo) {
        var dx = e.moveTo.x - e.x, dz = e.moveTo.z - e.z;
        var dist = Math.abs(dx) + Math.abs(dz) * 300;
        if (dist < e.speed + .5) {
          e.x = e.moveTo.x; e.z = e.moveTo.z; e.moveTo = null; e.anim = 'idle';
          if (e.moveCb) { var cb = e.moveCb; e.moveCb = null; cb(); }
        } else {
          var ang = Math.atan2(dz * 300, dx);
          e.x += Math.cos(ang) * e.speed;
          e.z += Math.sin(ang) * e.speed / 300;
          e.flipT = U.approach(e.flipT, dx > 0 ? 0 : 1, .2);
          e.anim = 'walk';
        }
      }
      if (e.vy || e.y > 0) {
        e.vy -= GRAV; e.y += e.vy;
        if (e.y <= 0) { e.y = 0; e.vy = 0; if (e.hopCb) { var hc = e.hopCb; e.hopCb = null; hc(); } }
      }
      if (e.data && e.data.wander && !e.moveTo && !this.busy && U.chance(.004)) {
        e.moveTo = { x: e.data.x + U.rndRange(-e.data.wander, e.data.wander), z: U.clamp(e.z + U.rndRange(-.1, .1), .1, .95) };
        e.speed = 1.1;
      }
    }
  };

  /* ---- field foes ------------------------------------------------------------ */
  World.prototype.updateFoes = function () {
    var p = this.player;
    for (var i = this.foes.length - 1; i >= 0; i--) {
      var f = this.foes[i];
      f.t++;
      if (f.stunned > 0) { f.stunned--; f.anim = 'dizzy'; continue; }
      if (this.busy || this.fader.busy()) { f.anim = 'idle'; continue; }

      var dx = p.x - f.x, dist = Math.abs(dx);
      var seeing = f.chase && dist < 170 && Math.abs(p.z - f.z) < .34 && this.repel <= 0;
      if (seeing) {
        f.x += U.sign(dx) * f.speed * 1.5;
        f.z += U.sign(p.z - f.z) * .006;
        f.flipT = U.approach(f.flipT, dx > 0 ? 0 : 1, .25);
        f.anim = 'run';
      } else if (f.patrol > 0) {
        f.x += f.dir * f.speed * .6;
        if (f.x > f.homeX + f.patrol) f.dir = -1;
        if (f.x < f.homeX - f.patrol) f.dir = 1;
        f.flipT = U.approach(f.flipT, f.dir > 0 ? 0 : 1, .18);
        f.anim = 'walk';
      } else f.anim = 'idle';

      // contact
      if (this.encounterCooldown <= 0 && Math.abs(p.x - f.x) < 26 && Math.abs(p.z - f.z) < .17 && p.y < 34) {
        this.beginFieldBattle(f, p.y > 8 ? 1 : (f.anim === 'run' && !seeing ? 0 : (seeing ? -1 : 0)));
        return;
      }
    }
  };

  World.prototype.fieldSwing = function () {
    var p = this.player;
    var reach = p.flipT > .5 ? -52 : 52;
    for (var i = 0; i < this.foes.length; i++) {
      var f = this.foes[i];
      if (Math.abs((p.x + reach) - f.x) < 40 && Math.abs(p.z - f.z) < .2) {
        f.stunned = 90;
        this.puff(f.x, f.z, 20, '#ffe066', 6);
        A.sfx('hit');
        this.beginFieldBattle(f, 1);
        return;
      }
    }
    // break blocks / hit gizmos
    for (var g = 0; g < this.gizmos.length; g++) {
      var gz = this.gizmos[g];
      if (gz.kind === 'block' && Math.abs((p.x + reach) - gz.x) < 34 && Math.abs(p.z - gz.z) < .2) {
        this.activateGizmo(gz);
        return;
      }
    }
    this.puff(p.x + reach * .6, p.z, 10, '#e8dcc0', 4);
  };

  World.prototype.beginFieldBattle = function (foe, advantage) {
    var self = this;
    this.encounterCooldown = 90;
    var group = foe.group && foe.group.length ? foe.group : [foe.type];
    var cfg = U.extend({
      enemies: group, firstStrike: advantage,
      bg: this.map.battleBg || 'stage',
      music: foe.boss ? 'boss' : 'battle',
      boss: !!foe.boss
    }, foe.cfg || {});
    this.startBattle(cfg, function (res) {
      if (res.result === 'win') {
        self.removeFoe(foe);
        if (foe.killFlag) St.flag(foe.killFlag, true);
        if (foe.onWin) self.runScript(foe.onWin);
      } else if (res.result === 'flee') {
        self.encounterCooldown = 180; self.repel = 240;
        foe.stunned = 120;
      }
    });
  };
  World.prototype.removeFoe = function (foe) {
    var i = this.foes.indexOf(foe);
    if (i >= 0) this.foes.splice(i, 1);
  };

  /* ---- pickups --------------------------------------------------------------- */
  World.prototype.updatePickups = function () {
    var p = this.player;
    for (var i = this.pickups.length - 1; i >= 0; i--) {
      var it = this.pickups[i];
      it.t++;
      if (it.taken) continue;
      if (it.kind === 'coin' || it.kind === 'shard') {
        if (Math.abs(p.x - it.x) < 26 && Math.abs(p.z - it.z) < .2 && Math.abs(p.y - (it.y || 0)) < 40) {
          it.taken = true;
          if (it.kind === 'coin') { var got = St.addCoins(it.amount || 1); A.sfx('coin'); UI.toast('+' + got + ' coins', 'seal1', '#ffe9a8'); }
          else { St.get().shards += 1; A.fanfare('item'); UI.toast('Foil Shard!', null, '#c8d2dc'); }
          if (it.flag) St.flag(it.flag, true);
          this.pickups.splice(i, 1);
        }
      }
    }
  };

  /* ---- interaction ------------------------------------------------------------ */
  World.prototype.talkTarget = function () {
    var p = this.player, best = null, bd = 999;
    var reachX = 46;
    for (var i = 0; i < this.ents.length; i++) {
      var e = this.ents[i];
      if (e.kind !== 'npc' || e.hidden || !e.script) continue;
      var d = Math.abs(p.x - e.x);
      if (d < reachX && Math.abs(p.z - e.z) < .22 && d < bd) { bd = d; best = { type: 'npc', ent: e }; }
    }
    for (var g = 0; g < this.gizmos.length; g++) {
      var gz = this.gizmos[g];
      if (gz.hidden) continue;
      if (gz.kind === 'soil' || gz.kind === 'seam' || gz.kind === 'glyph' || gz.kind === 'crack' || gz.kind === 'generator' || gz.kind === 'dockside') continue;
      var d2 = Math.abs(p.x - gz.x);
      if (d2 < reachX && Math.abs(p.z - (gz.z === undefined ? .5 : gz.z)) < .24 && d2 < bd) { bd = d2; best = { type: 'gizmo', giz: gz }; }
    }
    for (var k = 0; k < this.pickups.length; k++) {
      var pk = this.pickups[k];
      if (pk.taken || (pk.kind !== 'chest' && pk.kind !== 'blockq')) continue;
      var d3 = Math.abs(p.x - pk.x);
      if (d3 < reachX && Math.abs(p.z - pk.z) < .24 && d3 < bd) { bd = d3; best = { type: 'pickup', pk: pk }; }
    }
    // exits are walked into, not talked to, except doors
    for (var x = 0; x < (this.map.exits || []).length; x++) {
      var ex = this.map.exits[x];
      if (!ex.door) continue;
      var d4 = Math.abs(p.x - ex.x);
      if (d4 < reachX && Math.abs(p.z - (ex.z === undefined ? .5 : ex.z)) < .3 && d4 < bd) { bd = d4; best = { type: 'exit', ex: ex }; }
    }
    return best;
  };

  World.prototype.interact = function (tgt) {
    var self = this;
    if (tgt.type === 'npc') {
      var e = tgt.ent;
      e.flipT = this.player.x > e.x ? 0 : 1;
      var sc = typeof e.script === 'function' ? e.script(this) : e.script;
      this.runScript(sc);
    } else if (tgt.type === 'gizmo') {
      this.activateGizmo(tgt.giz);
    } else if (tgt.type === 'pickup') {
      this.openChest(tgt.pk);
    } else if (tgt.type === 'exit') {
      this.useExit(tgt.ex);
    }
  };

  World.prototype.openChest = function (pk) {
    if (pk.taken) return;
    pk.taken = true;
    A.sfx('chest');
    if (pk.flag) St.flag(pk.flag, true);
    var script = [];
    if (pk.item) script.push(['give', pk.item]);
    if (pk.key) script.push(['givekey', pk.key]);
    if (pk.badge) script.push(['badge', pk.badge]);
    if (pk.coins) script.push(['coins', pk.coins]);
    if (pk.shard) script.push(['shard', pk.shard]);
    if (pk.script) script = script.concat(pk.script);
    this.runScript(script);
  };

  World.prototype.useExit = function (ex) {
    if (ex.needsFlag && !St.hasFlag(ex.needsFlag)) {
      if (ex.lockedMsg) this.runScript([['say', 'narr', ex.lockedMsg]]);
      return;
    }
    if (ex.needsKey && !St.hasKey(ex.needsKey)) {
      this.runScript([['say', 'narr', ex.lockedMsg || 'It is locked tight.']]);
      return;
    }
    if (ex.script) { this.runScript(ex.script); return; }
    this.runScript([['goto', ex.to, ex.spawn || 'default']]);
  };

  /* ---- gizmos ---------------------------------------------------------------- */
  World.prototype.activateGizmo = function (g) {
    var self = this;
    if (g.once && g.used) {
      if (g.usedMsg) this.runScript([['say', 'narr', g.usedMsg]]);
      return;
    }
    switch (g.kind) {
      case 'sign':
        this.runScript([['say', 'narr', g.text || '...']]);
        break;
      case 'save':
        this.runScript([['say', 'sys', 'Rest here and record your progress?'], ['save']]);
        break;
      case 'heartblock':
        St.fullHeal();
        A.fanfare('item');
        UI.toast('Fully restored!', null, '#f07a8a');
        this.ringFx(g.x, g.z, '#f07a8a');
        break;
      case 'block':
        g.used = true;
        A.sfx('chest');
        this.runScript((g.item ? [['give', g.item]] : []).concat(g.coins ? [['coins', g.coins]] : []).concat(g.script || []));
        break;
      case 'switch':
        g.used = true;
        A.sfx('ok');
        this.shake = 8;
        this.runScript(g.script || []);
        break;
      case 'spring':
        this.player.vy = 17; this.player.onGround = false; A.sfx('jump', 1.3);
        break;
      case 'shop': this.runScript([['shop', g.shop]]); break;
      case 'inn': this.runScript([['inn', g.price || 5]]); break;
      case 'cook': this.runScript([['cook']]); break;
      default:
        if (g.script) this.runScript(g.script);
    }
    if (g.once) g.used = true;
    if (g.flag) St.flag(g.flag, true);
  };

  World.prototype.ringFx = function (x, z, c) { this.fx.push({ k: 'ring', x: x, z: z, y: 20, c: c, t: 0, life: 30 }); };

  /* ---- partner field ability --------------------------------------------------- */
  World.prototype.usePartnerAbility = function () {
    var S = St.get(), id = S.active;
    if (!id) return;
    var pd = PB.Partners.get(id), ability = pd.field.id;
    var p = this.player;
    // find a gizmo in range that this ability answers
    for (var i = 0; i < this.gizmos.length; i++) {
      var g = this.gizmos[i];
      if (g.hidden) continue;
      if (g.needs !== ability) continue;
      if (Math.abs(p.x - g.x) > 62 || Math.abs(p.z - (g.z === undefined ? .5 : g.z)) > .3) continue;
      if (g.once && g.used) continue;
      this.doAbility(ability, g);
      return;
    }
    // ambient effects with no target
    if (ability === 'light') {
      this.lightRadius = 260; this.lightT = 300;
      A.sfx('fire');
      UI.toast('Lumen brightens the room.', null, '#ffe9a8');
      return;
    }
    A.sfx('error');
    this.flashHint(pd.name + ' has nothing to work with here.');
  };

  World.prototype.doAbility = function (ability, g) {
    var self = this;
    g.used = true;
    if (g.flag) St.flag(g.flag, true);
    switch (ability) {
      case 'sprout':
        A.sfx('rustle');
        g.grown = true;
        this.blocks.push({ x: g.x, z: g.z === undefined ? .5 : g.z, w: 46, d: .22, h: g.height || 110, sprite: null, vine: true });
        this.puff(g.x, g.z, 10, '#6fbb52', 10);
        UI.toast('A vine springs up!', null, '#8fcf52');
        break;
      case 'light':
        A.sfx('fire');
        this.lightRadius = 300; this.lightT = 600;
        this.puff(g.x, g.z, 30, '#ffb545', 12);
        break;
      case 'cut':
        A.sfx('fold');
        this.puff(g.x, g.z, 30, '#f7edd6', 12);
        break;
      case 'ferry':
        A.sfx('water');
        break;
      case 'read':
        A.sfx('blip2');
        break;
      case 'power':
        A.sfx('zap');
        this.shake = 10;
        this.puff(g.x, g.z, 30, '#ffe066', 12);
        break;
    }
    // unhide linked blocks, remove barriers, run script
    if (g.reveals) {
      for (var i = 0; i < this.blocks.length; i++) if (this.blocks[i].id === g.reveals) this.blocks[i].hidden = false;
      for (var j = 0; j < this.ents.length; j++) if (this.ents[j].id === g.reveals) this.ents[j].hidden = false;
      for (var k = 0; k < this.gizmos.length; k++) if (this.gizmos[k].id === g.reveals) this.gizmos[k].hidden = false;
    }
    if (g.removes) {
      for (var b = this.blocks.length - 1; b >= 0; b--) if (this.blocks[b].id === g.removes) this.blocks.splice(b, 1);
      for (var e = this.ents.length - 1; e >= 0; e--) if (this.ents[e].id === g.removes) this.ents.splice(e, 1);
    }
    if (g.script) this.runScript(g.script);
  };

  /* ---- origami field forms ------------------------------------------------------ */
  World.prototype.useFold = function () {
    var p = this.player;
    // slip through a crack
    for (var i = 0; i < this.gizmos.length; i++) {
      var g = this.gizmos[i];
      if (g.kind !== 'crack' && g.kind !== 'plate') continue;
      if (Math.abs(p.x - g.x) > 52 || Math.abs(p.z - (g.z === undefined ? .5 : g.z)) > .3) continue;
      if (g.kind === 'crack' && St.hasFlag('form_slip')) {
        A.sfx('fold');
        this.runScript([['fadeout', '#f7edd6', .12], ['func', function (w) {
          w.player.x = g.to ? g.to.x : p.x + 90;
          w.player.z = g.to && g.to.z !== undefined ? g.to.z : p.z;
          if (g.to && g.to.map) { w.load(g.to.map, g.to.spawn || 'default'); }
        }], ['fadein', .12]]);
        return;
      }
      if (g.kind === 'plate' && St.hasFlag('form_weight')) {
        A.sfx('mallet');
        this.shake = 10;
        g.used = true;
        if (g.flag) St.flag(g.flag, true);
        if (g.removes) for (var b = this.blocks.length - 1; b >= 0; b--) if (this.blocks[b].id === g.removes) this.blocks.splice(b, 1);
        if (g.reveals) for (var c = 0; c < this.blocks.length; c++) if (this.blocks[c].id === g.reveals) this.blocks[c].hidden = false;
        if (g.script) this.runScript(g.script);
        UI.toast('The plate sinks with a clunk.', null, '#cfd6de');
        return;
      }
    }
    if (St.hasFlag('form_plane')) { this.flashHint('Hold Z while falling to glide.'); A.sfx('rustle'); }
    else { A.sfx('error'); }
  };

  World.prototype.flashHint = function (txt) { this.hintMsg = { txt: txt, t: 0 }; };

  /* ---- hints & triggers ---------------------------------------------------------- */
  World.prototype.updateHint = function () {
    if (this.hintMsg) { this.hintMsg.t++; if (this.hintMsg.t > 90) this.hintMsg = null; }
    if (this.lightT > 0) { this.lightT--; if (this.lightT <= 0) this.lightRadius = 0; }
    this.hint = null;
    if (this.busy) return;
    var tgt = this.talkTarget();
    if (tgt) {
      var label = 'Z  Talk';
      if (tgt.type === 'gizmo') {
        var k = tgt.giz.kind;
        label = k === 'sign' ? 'Z  Read' : k === 'save' ? 'Z  Save' : k === 'shop' ? 'Z  Shop'
          : k === 'inn' ? 'Z  Rest' : k === 'cook' ? 'Z  Cook' : k === 'heartblock' ? 'Z  Restore'
            : k === 'switch' ? 'Z  Press' : 'Z  Use';
        if (tgt.giz.label) label = 'Z  ' + tgt.giz.label;
      } else if (tgt.type === 'pickup') label = 'Z  Open';
      else if (tgt.type === 'exit') label = 'Z  Enter';
      this.hint = { txt: label, x: tgt.ent ? tgt.ent.x : (tgt.giz ? tgt.giz.x : (tgt.pk ? tgt.pk.x : tgt.ex.x)), z: (tgt.ent || tgt.giz || tgt.pk || tgt.ex).z };
    } else {
      // partner ability prompt
      var S = St.get(), id = S.active;
      if (id) {
        var ab = PB.Partners.get(id).field;
        var p = this.player;
        for (var i = 0; i < this.gizmos.length; i++) {
          var g = this.gizmos[i];
          if (g.hidden || g.needs !== ab.id || (g.once && g.used)) continue;
          if (Math.abs(p.x - g.x) < 62 && Math.abs(p.z - (g.z === undefined ? .5 : g.z)) < .3) {
            this.hint = { txt: 'C  ' + ab.name, x: g.x, z: g.z };
            return;
          }
        }
        for (var j = 0; j < this.gizmos.length; j++) {
          var g2 = this.gizmos[j];
          if (g2.hidden || (g2.once && g2.used)) continue;
          if (g2.kind === 'crack' && St.hasFlag('form_slip') && Math.abs(p.x - g2.x) < 52) { this.hint = { txt: 'V  Slip through', x: g2.x, z: g2.z }; return; }
          if (g2.kind === 'plate' && St.hasFlag('form_weight') && Math.abs(p.x - g2.x) < 52) { this.hint = { txt: 'V  Press down', x: g2.x, z: g2.z }; return; }
        }
      }
    }
  };

  World.prototype.updateTriggers = function () {
    if (this.busy) return;
    var p = this.player;
    for (var i = 0; i < this.triggers.length; i++) {
      var tr = this.triggers[i];
      if (tr.fired && tr.once !== false) continue;
      if (tr.needsFlag && !St.hasFlag(tr.needsFlag)) continue;
      if (tr.notFlag && St.hasFlag(tr.notFlag)) continue;
      if (Math.abs(p.x - tr.x) < (tr.w || 60) / 2 && Math.abs(p.z - (tr.z === undefined ? .5 : tr.z)) < (tr.d || 1) / 2) {
        tr.fired = true;
        if (tr.flag) St.flag(tr.flag, true);
        this.runScript(tr.script);
        return;
      }
    }
    // walk-in exits
    for (var e = 0; e < (this.map.exits || []).length; e++) {
      var ex = this.map.exits[e];
      if (ex.door) continue;
      if (Math.abs(p.x - ex.x) < (ex.w || 40) / 2 && Math.abs(p.z - (ex.z === undefined ? .5 : ex.z)) < (ex.d || 1) / 2) {
        this.useExit(ex);
        return;
      }
    }
  };

  World.prototype.updateCamera = function () {
    if (this.camLock && this.camTarget !== null) {
      this.camX = U.lerp(this.camX, this.clampCam(this.camTarget - W / 2), this.camLerp);
    } else {
      var want = this.clampCam(this.player.x - W / 2 + (this.player.flipT > .5 ? -40 : 40));
      this.camX = U.lerp(this.camX, want, .09);
    }
  };

  /* ======================================================================
     Drawing
     ====================================================================== */
  World.prototype.draw = function (ctx) {
    if (this.battle) { this.battle.draw(ctx); return; }
    if (this.credits) { this.drawCredits(ctx); return; }

    ctx.save();
    if (this.shake > .4) ctx.translate(U.rndRange(-this.shake, this.shake), U.rndRange(-this.shake, this.shake) * .6);

    PB.Themes.draw(ctx, this.map.theme || 'town', this.camX, this.t, this.map);

    // build the draw list
    var list = [];
    var i;
    for (i = 0; i < this.blocks.length; i++) {
      var b = this.blocks[i];
      if (b.hidden) continue;
      list.push({ z: b.z, y: 0, kind: 'block', o: b });
    }
    for (i = 0; i < this.ents.length; i++) {
      if (this.ents[i].hidden) continue;
      list.push({ z: this.ents[i].z, y: this.ents[i].y, kind: 'ent', o: this.ents[i] });
    }
    for (i = 0; i < this.foes.length; i++) list.push({ z: this.foes[i].z, y: 0, kind: 'foe', o: this.foes[i] });
    for (i = 0; i < this.pickups.length; i++) if (!this.pickups[i].taken) list.push({ z: this.pickups[i].z, y: 0, kind: 'pick', o: this.pickups[i] });
    for (i = 0; i < this.gizmos.length; i++) if (!this.gizmos[i].hidden) list.push({ z: this.gizmos[i].z === undefined ? .5 : this.gizmos[i].z, y: 0, kind: 'giz', o: this.gizmos[i] });
    list.push({ z: this.partnerEnt.z, y: 0, kind: 'partner', o: this.partnerEnt });
    list.push({ z: this.player.z, y: 0, kind: 'player', o: this.player });
    for (i = 0; i < this.fx.length; i++) list.push({ z: this.fx[i].z, y: 0, kind: 'fx', o: this.fx[i] });

    list.sort(function (a, b2) { return a.z - b2.z; });

    for (i = 0; i < list.length; i++) this.drawItem(ctx, list[i]);

    // darkness
    if (this.map.dark) {
      var lr = this.lightRadius;
      ctx.save();
      ctx.globalCompositeOperation = 'source-over';
      var pp = proj(this.player.x, this.player.z, 0, this.camX);
      var g = ctx.createRadialGradient(pp.sx, pp.sy - 30, Math.max(20, lr * .3), pp.sx, pp.sy - 30, Math.max(70, lr));
      g.addColorStop(0, 'rgba(8,6,16,0)');
      g.addColorStop(.7, 'rgba(8,6,16,0.55)');
      g.addColorStop(1, 'rgba(8,6,16,0.94)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }

    ctx.restore();

    P.overlayTexture(ctx, W, H, .4);
    P.overlayVignette(ctx, W, H);

    // hint bubble
    if (this.hint) {
      var hp = proj(this.hint.x, this.hint.z === undefined ? .5 : this.hint.z, 0, this.camX);
      UI.prompt(ctx, this.hint.txt, hp.sx, hp.sy - 96);
    }
    if (this.hintMsg) {
      ctx.save(); ctx.globalAlpha = U.clamp(1 - this.hintMsg.t / 90, 0, 1);
      UI.prompt(ctx, this.hintMsg.txt, W / 2, H - 150);
      ctx.restore();
    }

    UI.drawHud(ctx, St.get(), { t: this.t });
    P.text(ctx, this.map.name || '', W - 18, H - 18, { size: 14, align: 'right', color: '#f7edd6' });
    UI.drawToasts(ctx);

    if (this.bigText) {
      var a = U.clamp(Math.min(this.bigText.t, this.bigText.life - this.bigText.t) / 20, 0, 1);
      ctx.save(); ctx.globalAlpha = a;
      UI.title(ctx, this.bigText.txt, H / 2, { t: this.t, color: this.bigText.color, size: 40 });
      ctx.restore();
    }

    this.dlg.draw(ctx);
    if (this.overlay) this.overlay.draw(ctx);
    if (this.chapterCard) this.drawChapterCard(ctx);
    this.fader.draw(ctx);
  };

  World.prototype.drawItem = function (ctx, item) {
    var o = item.o, pr;
    switch (item.kind) {
      case 'block': {
        pr = proj(o.x, o.z, 0, this.camX);
        if (pr.sx < -220 || pr.sx > W + 220) return;
        if (o.vine) {
          P.rr(ctx, pr.sx - 9, pr.sy - o.h, 18, o.h, 8, '#4f9a48', '#2f6a2c', 2.4);
          for (var v = 0; v < o.h / 26; v++) {
            P.ell(ctx, pr.sx + (v % 2 ? 13 : -13), pr.sy - 16 - v * 26, 12, 8, '#6fbb52', '#2f6a2c', 2, v % 2 ? .3 : -.3);
          }
          P.ell(ctx, pr.sx, pr.sy - o.h, 26, 8, '#6fbb52', '#2f6a2c', 2.4);
        } else if (o.sprite) {
          Spr.draw(ctx, o.sprite, pr.sx, pr.sy, { t: this.t, scale: pr.sc * (o.scale || 1), shadow: true });
        } else if (!o.wall) {
          var w2 = o.w, hh = o.h;
          P.rr(ctx, pr.sx - w2 / 2, pr.sy - hh, w2, hh, 5, '#c8a06a', '#8a5a30', 2.6);
          P.creaseLines(ctx, pr.sx - w2 / 2, pr.sy - hh, w2, hh, 3, .1);
          P.rr(ctx, pr.sx - w2 / 2 - 3, pr.sy - hh - 6, w2 + 6, 9, 3, '#d8b47a', '#8a5a30', 2.2);
        }
        break;
      }
      case 'ent': {
        pr = proj(o.x, o.z, o.y, this.camX);
        if (pr.sx < -240 || pr.sx > W + 240) return;
        Spr.draw(ctx, o.sprite, pr.sx, pr.sy, {
          t: o.t, anim: o.anim, flipT: o.flipT, scale: pr.sc * (o.scale || 1),
          blink: (o.t % 210 < 8) ? 1 : 0
        });
        if (o.kind === 'npc' && o.name && !this.busy) {
          var d = Math.abs(this.player.x - o.x);
          if (d < 120) {
            ctx.save(); ctx.globalAlpha = U.clamp((120 - d) / 60, 0, 1) * .9;
            P.text(ctx, o.name, pr.sx, pr.sy - Spr.height(o.sprite) * pr.sc - 12, { size: 13, align: 'center', color: '#fff8e0' });
            ctx.restore();
          }
        }
        break;
      }
      case 'foe': {
        pr = proj(o.x, o.z, o.y, this.camX);
        if (pr.sx < -200 || pr.sx > W + 200) return;
        var ed = PB.Enemies.get(o.type);
        Spr.draw(ctx, ed ? ed.sprite : 'crumple', pr.sx, pr.sy, {
          t: o.t, anim: o.stunned > 0 ? 'dizzy' : o.anim, flipT: o.flipT, scale: pr.sc * 1.02
        });
        if (o.boss) P.text(ctx, ed ? ed.name : '', pr.sx, pr.sy - 96, { size: 13, align: 'center', color: '#f0a0a0' });
        if (o.stunned > 0) {
          for (var s = 0; s < 3; s++) {
            var a2 = this.t * .08 + s * 2.1;
            P.star(ctx, pr.sx + Math.cos(a2) * 20, pr.sy - 70 + Math.sin(a2) * 7, 6, 2.6, 5, 0, '#ffe066', '#8a6a2a', 1.4);
          }
        }
        break;
      }
      case 'pick': {
        pr = proj(o.x, o.z, o.y || 0, this.camX);
        if (pr.sx < -80 || pr.sx > W + 80) return;
        if (o.kind === 'coin') Spr.draw(ctx, 'coin', pr.sx, pr.sy - (o.y || 0), { t: o.t, scale: pr.sc });
        else if (o.kind === 'shard') Spr.draw(ctx, 'sealshard', pr.sx, pr.sy, { t: o.t, scale: pr.sc });
        else if (o.kind === 'chest') Spr.draw(ctx, 'chest', pr.sx, pr.sy, { t: o.t, scale: pr.sc });
        else if (o.kind === 'blockq') Spr.draw(ctx, 'blockq', pr.sx, pr.sy - 46, { t: o.t, scale: pr.sc, shadow: false });
        break;
      }
      case 'giz': {
        pr = proj(o.x, o.z === undefined ? .5 : o.z, 0, this.camX);
        if (pr.sx < -100 || pr.sx > W + 100) return;
        var spr = GIZMO_SPRITE[o.kind];
        if (o.sprite) spr = o.sprite;
        if (spr) Spr.draw(ctx, spr, pr.sx, pr.sy, { t: o.t, scale: pr.sc * (o.scale || 1) });
        if (o.needs && !(o.once && o.used)) {
          ctx.save(); ctx.globalAlpha = .35 + Math.sin(this.t * .07) * .18;
          P.ell(ctx, pr.sx, pr.sy - 18, 26, 12, '#ffe066', null);
          ctx.restore();
        }
        break;
      }
      case 'partner': {
        var S = St.get();
        if (!S.active) return;
        pr = proj(o.x, o.z, o.y, this.camX);
        Spr.draw(ctx, PB.Partners.get(S.active).sprite, pr.sx, pr.sy, {
          t: o.t, anim: o.anim, flipT: o.flipT, scale: pr.sc,
          blink: (o.t % 230 < 8) ? 1 : 0
        });
        break;
      }
      case 'player': {
        pr = proj(o.x, o.z, o.y, this.camX);
        var an = o.anim;
        if (this.swing > 12) an = 'attack';
        Spr.draw(ctx, 'pip', pr.sx, pr.sy, {
          t: o.t, anim: an, flipT: o.flipT, scale: pr.sc,
          blink: (o.t % 200 < 8) ? 1 : 0,
          squashX: o.gliding ? 1.18 : 1, squashY: o.gliding ? .86 : 1
        });
        if (o.gliding) {
          ctx.save(); ctx.globalAlpha = .5;
          P.poly(ctx, [[pr.sx - 30, pr.sy - 40], [pr.sx + 30, pr.sy - 46], [pr.sx + 10, pr.sy - 26]], '#f7edd6', '#8a6a3a', 2);
          ctx.restore();
        }
        if (this.swing > 0 && this.swing > 8) {
          var dir = o.flipT > .5 ? -1 : 1;
          ctx.save(); ctx.globalAlpha = U.clamp(this.swing / 22, 0, 1);
          ctx.translate(pr.sx + dir * 30, pr.sy - 34);
          ctx.rotate(dir * (1.2 - this.swing * .06));
          P.rr(ctx, -4, -4, 8, 26, 3, '#a9713f', '#6f4a28', 2);
          P.rr(ctx, -14, -18, 28, 16, 4, '#d9dde3', '#8a939e', 2.4);
          ctx.restore();
        }
        break;
      }
      case 'fx': {
        pr = proj(o.x, o.z, o.y || 0, this.camX);
        var al = 1 - o.t / o.life;
        ctx.save(); ctx.globalAlpha = U.clamp(al, 0, 1);
        if (o.k === 'ring') {
          var rr2 = 50 * (o.t / o.life);
          P.ell(ctx, pr.sx, pr.sy - 24, rr2, rr2 * .4, null, o.c, 3);
        } else {
          P.rr(ctx, pr.sx - o.r / 2, pr.sy - (o.y || 0) - o.r / 2, o.r, o.r * .7, 1, o.c, null, 0);
        }
        ctx.restore();
        break;
      }
    }
  };

  var GIZMO_SPRITE = {
    sign: 'sign', save: 'savepoint', heartblock: 'heartblock', block: 'brickblock',
    switch: 'switch_plate', spring: 'spring', soil: 'soil', crack: 'crack', seam: 'seam',
    glyph: 'glyph', shop: 'shop_stall', inn: 'house_small', cook: 'barrel',
    generator: 'gear', plate: 'switch_plate', brazier: 'brazier', dockside: 'barrel'
  };

  World.prototype.drawChapterCard = function (ctx) {
    var c = this.chapterCard;
    var a = U.clamp(Math.min(c.t, 190 - c.t) / 26, 0, 1);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = 'rgba(15,10,24,.86)'; ctx.fillRect(0, 0, W, H);
    var slide = U.Ease.outCubic(U.clamp(c.t / 30, 0, 1));
    ctx.translate((1 - slide) * -60, 0);
    P.rr(ctx, 120, 190, 720, 160, 14, '#f7edd6', '#8a6a3a', 4);
    P.text(ctx, c.n === 0 ? 'PROLOGUE' : 'CHAPTER ' + c.n, W / 2, 244, { size: 20, align: 'center', color: '#8a6a3a', outline: false, shadow: false });
    P.text(ctx, c.title, W / 2, 290, { size: 34, align: 'center', color: '#2a1c3c', outline: false, shadow: false });
    if (c.sub) P.text(ctx, c.sub, W / 2, 324, { size: 16, align: 'center', color: '#6b5a3a', outline: false, shadow: false });
    ctx.restore();
  };

  /* ---- credits ------------------------------------------------------------------ */
  World.prototype.startCredits = function (lines) { this.credits = { lines: lines, y: H + 40, t: 0 }; A.play('credits'); };
  World.prototype.updateCredits = function () {
    this.credits.t++;
    this.credits.y -= .55;
    if (In.down('a')) this.credits.y -= 2.2;
    if (this.credits.y < -this.credits.lines.length * 34 - 100) this.game.toTitle();
  };
  World.prototype.drawCredits = function (ctx) {
    ctx.fillStyle = '#0f0a18'; ctx.fillRect(0, 0, W, H);
    for (var i = 0; i < this.credits.lines.length; i++) {
      var l = this.credits.lines[i];
      var y = this.credits.y + i * 34;
      if (y < -40 || y > H + 40) continue;
      var big = l.charAt(0) === '#';
      P.text(ctx, big ? l.slice(1) : l, W / 2, y, {
        size: big ? 24 : 17, align: 'center',
        color: big ? '#ffe066' : '#f7edd6'
      });
    }
    P.overlayTexture(ctx, W, H, .3);
  };

  return {
    World: World, proj: proj, HORIZON: HORIZON, DEPTH: DEPTH,
    create: function (game) { return new World(game); }
  };
})();

/* ===== 17_themes.js ===== */
/* ==========================================================================
   PAPERBOUND — 17_themes.js
   Procedural parallax backdrops. Everything is torn paper: flat bands with
   ragged edges, layered back to front, sliding at different rates.
   ========================================================================== */
'use strict';

PB.Themes = (function () {
  var U = PB.U, P = PB.Paper;
  var W = 960, H = 540;
  var HOR = 296, DEP = 124;

  /* pal: [skyTop, skyBottom, far, mid, near, floor, floorEdge, front] */
  var T = {
    town: { pal: ['#8fd0f0', '#dff0ff', '#7fae7f', '#5aa84e', '#4f9a48', '#c8a06a', '#8a5a30', '#a9713f'], clouds: 1, hills: 1 },
    forest: { pal: ['#7fc7e8', '#cfe9c0', '#3f8a3c', '#357a34', '#2f6a2c', '#7a9a52', '#4f6a2c', '#5a7a3a'], clouds: 1, trees: 1 },
    ember: { pal: ['#f0a04a', '#8a2a10', '#8a2a18', '#6a1c10', '#4a120a', '#6a3a22', '#3a1a0e', '#4a2214'], embers: 1, hills: 1 },
    harbor: { pal: ['#8fd0f0', '#cfe9f8', '#4f8aa8', '#3f6a8a', '#2f4a60', '#8a7a5a', '#5a4a30', '#6a5a3a'], clouds: 1, waves: 1 },
    carnival: { pal: ['#5a2b6e', '#a05fb0', '#6b3f7a', '#5a3268', '#43254f', '#8a1a2a', '#5a0a16', '#6a1420'], stars: 1, bunting: 1 },
    library: { pal: ['#d8c8a0', '#f0e2c4', '#8a7a5a', '#6b5a3a', '#4a3f2a', '#7a5230', '#4a3020', '#5a3a20'], shelves: 1, dust: 1 },
    frost: { pal: ['#bfe0f4', '#eaf7ff', '#9fd8f0', '#7ab8d8', '#5f9ec0', '#e8f4ff', '#a8c8dc', '#cfe4f0'], snow: 1, hills: 1 },
    foundry: { pal: ['#3f4650', '#7a848e', '#5a626e', '#4a5058', '#3a4048', '#5a5f6a', '#31363e', '#42474f'], pipes: 1, sparks: 1 },
    blot: { pal: ['#4a3560', '#1c1226', '#2f2440', '#241a34', '#160f22', '#241a34', '#0f0a18', '#1c1226'], drips: 1, stars: 1 },
    voidt: { pal: ['#ffffff', '#eeecfa', '#e4e0f4', '#d8d4ec', '#cbc6e2', '#f4f2ff', '#c8c4dc', '#e0dcf0'], blank: 1 },
    coliseum: { pal: ['#f0c880', '#f7e6c0', '#c8a06a', '#a9713f', '#8a5a30', '#e0c290', '#a9713f', '#c8a06a'], crowd: 1, banners: 1 },
    cave: { pal: ['#2a2438', '#3a3450', '#3a3450', '#2f2a44', '#241f36', '#4a4258', '#2a2438', '#332e48'], drips: 1 },
    interior: { pal: ['#c8a878', '#e8d8b0', '#b09068', '#a08058', '#8a6a48', '#8a5a30', '#5a3a20', '#6f4a28'], indoor: 1 },
    volcano: { pal: ['#c8442a', '#3a0f08', '#6a1c10', '#4a120a', '#320c06', '#5a2a18', '#2a0e08', '#3a1610'], embers: 1 },
    sea: { pal: ['#2f5a7a', '#5f9ec0', '#3f6a8a', '#2f4a60', '#22384a', '#5a6a5a', '#33403a', '#42504a'], bubbles: 1, waves: 1 }
  };

  function tornBand(ctx, y, bottom, color, amp, seed, off) {
    ctx.beginPath();
    ctx.moveTo(-20, bottom);
    var x = -20;
    while (x < W + 20) {
      var n = Math.sin((x + off) * 0.011 + seed) * .6 + Math.sin((x + off) * 0.031 - seed * 1.7) * .4;
      ctx.lineTo(x, y + n * amp);
      x += 18;
    }
    ctx.lineTo(W + 20, bottom);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }

  function draw(ctx, theme, camX, t, map) {
    var cfg = T[theme] || T.town;
    var pal = cfg.pal;

    // sky
    var g = ctx.createLinearGradient(0, 0, 0, HOR + 40);
    g.addColorStop(0, pal[0]); g.addColorStop(1, pal[1]);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, HOR + 60);

    if (cfg.stars) {
      for (var s = 0; s < 60; s++) {
        var sx = U.wrap(s * 137.5 - camX * .04, W + 40) - 20;
        var sy = (s * 53) % (HOR - 30) + 10;
        var tw = .4 + Math.sin(t * .03 + s) * .3;
        ctx.globalAlpha = tw; P.star(ctx, sx, sy, 3 + (s % 3), 1.2, 4, 0, '#fff8e0', null, 0); ctx.globalAlpha = 1;
      }
    }
    if (cfg.clouds) {
      for (var c = 0; c < 7; c++) {
        var cx = U.wrap(c * 260 - camX * .08 + t * .12, W + 500) - 250;
        var cy = 40 + (c * 41) % 110;
        ctx.globalAlpha = .85;
        P.blob(ctx, cx, cy, 42, .12, c * 3, '#ffffff', null, 0, .42);
        P.blob(ctx, cx + 40, cy + 6, 30, .14, c * 5, '#ffffff', null, 0, .44);
        P.blob(ctx, cx - 38, cy + 8, 26, .16, c * 7, '#f4faff', null, 0, .46);
        ctx.globalAlpha = 1;
      }
    }
    if (cfg.blank) {
      ctx.globalAlpha = .25;
      for (var bl = 0; bl < 8; bl++) {
        var bx = U.wrap(bl * 190 - camX * .1, W + 300) - 150;
        P.rr(ctx, bx, 40 + (bl * 37) % 160, 120, 4, 2, '#c8c4dc', null, 0);
      }
      ctx.globalAlpha = 1;
    }

    // far / mid / near bands
    tornBand(ctx, HOR - 116, HOR + 30, pal[2], 22, 1.3, camX * .16);
    tornBand(ctx, HOR - 74, HOR + 30, pal[3], 17, 3.1, camX * .3);
    tornBand(ctx, HOR - 36, HOR + 30, pal[4], 13, 5.7, camX * .5);

    if (cfg.trees) {
      for (var tr = 0; tr < 16; tr++) {
        var tx = U.wrap(tr * 172 - camX * .5, W + 400) - 200;
        var th = 70 + (tr * 31) % 44;
        ctx.globalAlpha = .9;
        P.poly(ctx, [[tx - 26, HOR - 30], [tx, HOR - 30 - th], [tx + 26, HOR - 30]], U.shade(pal[4], -.12), null, 0);
        P.rr(ctx, tx - 4, HOR - 34, 8, 14, 2, U.shade(pal[4], -.4), null, 0);
        ctx.globalAlpha = 1;
      }
    }
    if (cfg.shelves) {
      for (var sh = 0; sh < 12; sh++) {
        var shx = U.wrap(sh * 230 - camX * .35, W + 480) - 240;
        P.rr(ctx, shx, HOR - 190, 180, 190, 3, U.shade(pal[3], -.15), U.shade(pal[3], -.4), 2);
        for (var r = 0; r < 5; r++) {
          for (var b = 0; b < 11; b++) {
            var cols = ['#c8443c', '#3f76c9', '#4f9a48', '#f5c02e', '#8a5fc0', '#39b3a6'];
            P.rr(ctx, shx + 8 + b * 15, HOR - 182 + r * 37, 12, 30, 1, U.rgba(cols[(b + r) % 6], .85), null, 0);
          }
        }
      }
    }
    if (cfg.pipes) {
      for (var pi = 0; pi < 10; pi++) {
        var px = U.wrap(pi * 210 - camX * .3, W + 420) - 210;
        P.rr(ctx, px, 30, 26, HOR - 60, 6, U.shade(pal[3], -.18), U.shade(pal[3], -.45), 2.4);
        P.rr(ctx, px - 6, 110 + (pi * 29) % 90, 38, 14, 4, U.shade(pal[2], .1), U.shade(pal[3], -.4), 2);
      }
    }
    if (cfg.bunting) {
      for (var bu = 0; bu < 24; bu++) {
        var bx2 = U.wrap(bu * 62 - camX * .42, W + 200) - 100;
        var sag = Math.sin(bu * .8) * 8;
        P.poly(ctx, [[bx2, 46 + sag], [bx2 + 26, 46 + sag], [bx2 + 13, 76 + sag]],
          ['#e8506a', '#f5c02e', '#57b8ea', '#8fcf52'][bu % 4], '#2a1c3c', 1.6);
      }
      P.line(ctx, [[-20, 44], [W + 20, 44]], '#2a1c3c', 2);
    }
    if (cfg.banners) {
      for (var bn = 0; bn < 8; bn++) {
        var bnx = U.wrap(bn * 220 - camX * .4, W + 440) - 220;
        var sw = Math.sin(t * .03 + bn) * 5;
        P.poly(ctx, [[bnx, 30], [bnx + 44, 30], [bnx + 44 + sw, 150], [bnx + 22 + sw, 132], [bnx + sw, 150]], '#8a1a2a', '#5a0a16', 2.4);
        P.star(ctx, bnx + 22 + sw * .5, 84, 13, 5, 5, 0, '#f5c02e', null, 1.8);
      }
    }
    if (cfg.crowd) {
      for (var cr = 0; cr < 46; cr++) {
        var crx = U.wrap(cr * 44 - camX * .22, W + 120) - 60;
        var cry = 190 + (cr % 3) * 16;
        var bob = Math.sin(t * .07 + cr) * 2;
        P.ell(ctx, crx, cry + bob, 11, 10, ['#e8b96a', '#9fd0e8', '#d8a0c8', '#a8d8a0'][cr % 4], '#5a4a30', 1.6);
      }
    }

    // floor plane
    var fg = ctx.createLinearGradient(0, HOR - 12, 0, HOR + DEP + 60);
    fg.addColorStop(0, U.shade(pal[5], -.16));
    fg.addColorStop(.4, pal[5]);
    fg.addColorStop(1, U.shade(pal[5], .08));
    ctx.fillStyle = fg;
    ctx.fillRect(0, HOR - 12, W, H - HOR + 12);
    P.line(ctx, [[0, HOR - 10], [W, HOR - 10]], pal[6], 3);

    // floor grain — receding lines sell the depth
    ctx.save();
    ctx.globalAlpha = .12;
    for (var fl = 0; fl < 26; fl++) {
      var flx = U.wrap(fl * 84 - camX, W + 200) - 100;
      P.line(ctx, [[flx, HOR - 8], [flx - 70, H]], '#000', 2);
    }
    for (var q = 0; q < 5; q++) {
      var qy = HOR + q * 30;
      P.line(ctx, [[0, qy], [W, qy]], '#000', 1);
    }
    ctx.restore();

    if (cfg.waves) {
      ctx.save(); ctx.globalAlpha = .5;
      for (var wv = 0; wv < 4; wv++) {
        var wy = HOR - 24 + wv * 9;
        ctx.beginPath();
        for (var wx = -20; wx < W + 20; wx += 10) {
          var yy = wy + Math.sin((wx + camX * .3 + t * 1.4 + wv * 40) * .02) * 3;
          if (wx === -20) ctx.moveTo(wx, yy); else ctx.lineTo(wx, yy);
        }
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.stroke();
      }
      ctx.restore();
    }
    if (cfg.embers) {
      for (var em = 0; em < 26; em++) {
        var ex = U.wrap(em * 91 - camX * .6 + Math.sin(t * .02 + em) * 26, W + 60) - 30;
        var ey = U.wrap(HOR + 60 - (t * 1.1 + em * 47), HOR + 120);
        ctx.globalAlpha = U.clamp(ey / (HOR + 60), 0, 1) * .8;
        P.ell(ctx, ex, ey, 2.6, 2.6, em % 3 ? '#ff9f2e' : '#ffe066', null);
        ctx.globalAlpha = 1;
      }
    }
    if (cfg.snow) {
      for (var sn = 0; sn < 60; sn++) {
        var nx = U.wrap(sn * 67 - camX * .35 + Math.sin(t * .015 + sn) * 32, W + 40) - 20;
        var ny = U.wrap(t * .9 + sn * 43, H + 40) - 20;
        ctx.globalAlpha = .75;
        P.ell(ctx, nx, ny, 2.4 + (sn % 3) * .7, 2.4 + (sn % 3) * .7, '#ffffff', null);
        ctx.globalAlpha = 1;
      }
    }
    if (cfg.sparks) {
      for (var sk = 0; sk < 14; sk++) {
        if ((t + sk * 37) % 180 > 24) continue;
        var kx = U.wrap(sk * 143 - camX * .3, W + 60) - 30;
        var ky = 120 + (sk * 61) % 140;
        P.star(ctx, kx, ky, 6, 2, 4, t * .3, '#ffe066', null, 0);
      }
    }
    if (cfg.dust) {
      for (var du = 0; du < 30; du++) {
        var dx = U.wrap(du * 111 - camX * .2 + Math.sin(t * .01 + du) * 20, W + 40) - 20;
        var dy = U.wrap(du * 79 + Math.sin(t * .008 + du * 2) * 30, H);
        ctx.globalAlpha = .28;
        P.ell(ctx, dx, dy, 2, 2, '#fff8e0', null);
        ctx.globalAlpha = 1;
      }
    }
    if (cfg.drips) {
      for (var dr = 0; dr < 12; dr++) {
        var rx = U.wrap(dr * 167 - camX * .5, W + 80) - 40;
        var ry = U.wrap(t * 1.5 + dr * 91, HOR - 30);
        ctx.globalAlpha = .5;
        P.ell(ctx, rx, ry, 2.4, 5.5, theme === 'blot' ? '#160f22' : '#5a6a8a', null);
        ctx.globalAlpha = 1;
      }
    }
    if (cfg.bubbles) {
      for (var bb = 0; bb < 24; bb++) {
        var bx3 = U.wrap(bb * 97 - camX * .3 + Math.sin(t * .02 + bb) * 14, W + 40) - 20;
        var by3 = U.wrap(H - (t * .8 + bb * 53), H + 40) - 20;
        ctx.globalAlpha = .3;
        P.ell(ctx, bx3, by3, 3 + (bb % 4), 3 + (bb % 4), null, '#ffffff', 1.4);
        ctx.globalAlpha = 1;
      }
    }
    if (cfg.indoor) {
      // wall / floor split with a skirting board
      ctx.fillStyle = pal[1]; ctx.fillRect(0, 0, W, HOR - 10);
      ctx.save(); ctx.globalAlpha = .1;
      for (var st2 = 0; st2 < 20; st2++) P.line(ctx, [[st2 * 60 - U.wrap(camX * .5, 60), 0], [st2 * 60 - U.wrap(camX * .5, 60), HOR - 12]], '#000', 2);
      ctx.restore();
      P.rr(ctx, -10, HOR - 26, W + 20, 18, 3, pal[6], U.shade(pal[6], -.3), 2.4);
    }

    // foreground strip at the very bottom
    P.rr(ctx, -20, H - 26, W + 40, 40, 0, pal[7], null, 0);
    ctx.save(); ctx.globalAlpha = .16;
    for (var fs = 0; fs < 24; fs++) P.line(ctx, [[fs * 46 - U.wrap(camX * 1.25, 46), H - 26], [fs * 46 - 20 - U.wrap(camX * 1.25, 46), H]], '#000', 3);
    ctx.restore();
  }

  return { draw: draw, T: T };
})();

/* ===== 18_menus.js ===== */
/* ==========================================================================
   PAPERBOUND — 18_menus.js
   Overlay panels: pause book, shops, inn, cooking, save slots, world map.
   Every overlay exposes { update(), draw(ctx), closed, onClose }.
   ========================================================================== */
'use strict';

PB.Menus = (function () {
  var U = PB.U, P = PB.Paper, In = PB.Input, A = PB.Audio, Spr = PB.Sprites;
  var UI = PB.UI, St = PB.State, It = PB.Items, Bd = PB.Badges;
  var W = 960, H = 540;

  function Overlay(onClose) { this.closed = false; this.onClose = onClose || null; this.t = 0; }
  Overlay.prototype.close = function () { this.closed = true; };
  Overlay.prototype.dim = function (ctx, a) {
    ctx.save(); ctx.fillStyle = 'rgba(15,10,24,' + (a === undefined ? .58 : a) + ')'; ctx.fillRect(0, 0, W, H); ctx.restore();
  };

  /* ======================================================================
     PAUSE — the courier's satchel
     ====================================================================== */
  var TABS = ['Items', 'Badges', 'Party', 'Journal', 'Options'];

  function pause(world) {
    var o = new Overlay(null);
    var S = St.get();
    o.tab = 0; o.sub = null; o.msg = '';
    o.menu = null;
    o.build = function () {
      var t = TABS[o.tab];
      if (t === 'Items') o.menu = itemsMenu(o);
      else if (t === 'Badges') o.menu = badgesMenu(o);
      else if (t === 'Party') o.menu = partyMenu(o);
      else if (t === 'Journal') o.menu = journalMenu(o);
      else o.menu = optionsMenu(o, world);
    };
    o.build();

    o.update = function () {
      o.t++;
      if (o.sub) {
        o.sub.update();
        if (o.sub.closed) { o.sub = null; o.build(); }
        return;
      }
      if (In.pressed('l')) { o.tab = U.wrap(o.tab - 1, TABS.length); A.sfx('cursor'); o.build(); return; }
      if (In.pressed('r')) { o.tab = U.wrap(o.tab + 1, TABS.length); A.sfx('cursor'); o.build(); return; }
      if (In.pressed('start')) { A.sfx('cancel'); o.close(); return; }
      if (o.menu) o.menu.update();
    };
    o.draw = function (ctx) {
      o.dim(ctx);
      P.panel(ctx, 60, 44, W - 120, H - 108, { fill: '#f7edd6', edge: '#8a6a3a', radius: 16 });
      // tabs
      for (var i = 0; i < TABS.length; i++) {
        var tx = 88 + i * 160, sel = i === o.tab;
        P.rr(ctx, tx, sel ? 56 : 62, 148, sel ? 40 : 32, 8, sel ? '#fdf6e3' : '#e0d3b4', '#8a6a3a', 2.4);
        P.text(ctx, TABS[i], tx + 74, sel ? 82 : 84, { size: 16, align: 'center', color: sel ? '#2a1c3c' : '#7a6a4a', outline: false, shadow: false });
      }
      P.line(ctx, [[80, 96], [W - 80, 96]], '#8a6a3a', 3);
      // stat strip
      var S2 = St.get();
      P.text(ctx, S2.name + '   Lv ' + S2.level, 92, 124, { size: 17, color: '#2a1c3c', outline: false, shadow: false });
      P.text(ctx, 'HP ' + S2.hp + '/' + St.maxHp() + '    FP ' + S2.fp + '/' + St.maxFp() +
        '    BP ' + St.bpFree() + '/' + St.maxBp() + '    Coins ' + S2.coins + '    Shards ' + S2.shards,
        W - 92, 124, { size: 15, align: 'right', color: '#6b5a3a', outline: false, shadow: false });
      P.text(ctx, 'Q / E switch tabs   •   Esc close   •   ' + U.timeStr(S2.frames), W / 2, H - 74,
        { size: 13, align: 'center', color: '#8a7a5a', outline: false, shadow: false });
      if (o.menu) o.menu.draw(ctx);
      if (o.msg) P.text(ctx, o.msg, W / 2, H - 96, { size: 15, align: 'center', color: '#c8443c', outline: false, shadow: false });
      if (o.sub) o.sub.draw(ctx);
    };
    return o;
  }

  function itemsMenu(o) {
    var S = St.get();
    var rows = S.items.map(function (id, i) { return { id: id, i: i, kind: 'bag' }; });
    var keys = S.keyItems.map(function (id) { return { id: id, kind: 'key' }; });
    var store = S.store.map(function (id, i) { return { id: id, i: i, kind: 'store' }; });
    var all = rows.concat(store.length ? [{ header: 'Storage' }] : []).concat(store)
      .concat(keys.length ? [{ header: 'Key Items' }] : []).concat(keys);
    return new UI.Menu({
      title: 'Bag  (' + S.items.length + '/' + St.ITEM_CAP + ')',
      items: all, x: 92, y: 142, w: 420, rows: 9, rowH: 30,
      enabled: function (it) { return !it.header; },
      drawRow: function (ctx, it, x, y, w, h, sel) {
        if (it.header) { P.text(ctx, '— ' + it.header + ' —', x + 4, y + h / 2 + 5, { size: 13, color: '#8a7a5a', outline: false, shadow: false }); return; }
        var d = It.get(it.id);
        It.drawIcon(ctx, it.id, x + 12, y + h / 2, 24);
        P.text(ctx, d.name, x + 30, y + h / 2 + 6, { size: 15, color: it.kind === 'store' ? '#7a6a4a' : '#2a1c3c', outline: false, shadow: false });
        if (it.kind === 'bag' && d.type !== 'key') P.text(ctx, 'use', x + w - 6, y + h / 2 + 6, { size: 12, align: 'right', color: '#8a6a3a', outline: false, shadow: false });
      },
      desc: function (it) { return it && !it.header ? It.get(it.id).desc : null; },
      onPick: function (it) {
        if (it.header) return;
        var d = It.get(it.id);
        if (it.kind === 'key') { o.msg = d.name + ': ' + d.desc; return; }
        if (it.kind === 'store') {
          if (S.items.length >= St.ITEM_CAP) { o.msg = 'Your bag is full.'; A.sfx('error'); return; }
          S.store.splice(it.i, 1); S.items.push(it.id); A.sfx('ok'); o.build(); return;
        }
        if (d.type === 'battle') { o.msg = 'That one only works in a fight.'; A.sfx('error'); return; }
        var fx = d.fx || {};
        var used = false;
        if (fx.hp || fx.fp) { St.heal(fx.hp || 0, fx.fp || 0); if (fx.hp && S.active) S.partners[S.active].hp = Math.min(St.partnerMaxHp(S.active), S.partners[S.active].hp + fx.hp); used = true; }
        if (fx.sp) { St.addSe(fx.sp); used = true; }
        if (fx.repel) { used = true; }
        if (fx.cureAll || fx.cure) used = true;
        if (!used) { o.msg = 'Nothing happens right now.'; A.sfx('error'); return; }
        S.items.splice(it.i, 1);
        A.sfx('heal'); o.msg = 'Used ' + d.name + '.';
        o.build();
      },
      onCancel: function () { o.close(); }
    });
  }

  function badgesMenu(o) {
    var S = St.get();
    var list = S.badges.owned.slice().sort(function (a, b) {
      var ea = St.isEquipped(a) ? 0 : 1, eb = St.isEquipped(b) ? 0 : 1;
      return ea - eb || Bd.get(a).bp - Bd.get(b).bp;
    });
    return new UI.Menu({
      title: 'Badges   BP ' + St.bpUsed() + '/' + St.maxBp(),
      items: list, x: 92, y: 142, w: 440, rows: 9, rowH: 30,
      drawRow: function (ctx, id, x, y, w, h, sel) {
        var b = Bd.get(id), eq = St.isEquipped(id);
        P.star(ctx, x + 12, y + h / 2, 9, 4, 5, 0, b.color, '#5a4a30', 1.6);
        P.text(ctx, b.name, x + 28, y + h / 2 + 6, { size: 15, color: eq ? '#2a1c3c' : '#7a6a4a', outline: false, shadow: false });
        P.text(ctx, b.bp + ' BP', x + w - 46, y + h / 2 + 6, { size: 13, align: 'right', color: '#8a6a3a', outline: false, shadow: false });
        if (eq) P.text(ctx, 'ON', x + w - 4, y + h / 2 + 6, { size: 12, align: 'right', color: '#4fae62', outline: false, shadow: false });
      },
      desc: function (id) { return id ? Bd.get(id).desc : null; },
      onPick: function (id) {
        if (St.isEquipped(id)) { St.unequipBadge(id); A.sfx('cancel'); o.msg = ''; }
        else if (!St.equipBadge(id)) { A.sfx('error'); o.msg = 'Not enough BP for that one.'; }
        else { A.sfx('ok'); o.msg = ''; }
        o.build();
      },
      onCancel: function () { o.close(); }
    });
  }

  function partyMenu(o) {
    var S = St.get();
    var list = St.partnerList();
    return new UI.Menu({
      title: 'Party   (Foil Shards: ' + S.shards + ')',
      items: list, x: 92, y: 142, w: 440, rows: 7, rowH: 40,
      drawRow: function (ctx, id, x, y, w, h, sel) {
        var pd = PB.Partners.get(id), ps = S.partners[id];
        ctx.save();
        ctx.beginPath(); ctx.arc(x + 18, y + h / 2, 15, 0, Math.PI * 2); ctx.clip();
        P.ell(ctx, x + 18, y + h / 2, 15, 15, '#e8dcc0', null, 0);
        Spr.portrait(ctx, pd.sprite, x + 18, y + h / 2 + 16, 36, { t: o.t });
        ctx.restore();
        P.text(ctx, pd.name + (S.active === id ? '  ★' : ''), x + 42, y + 18, { size: 15, color: '#2a1c3c', outline: false, shadow: false });
        P.text(ctx, 'Rank ' + ps.rank + '   HP ' + ps.hp + '/' + St.partnerMaxHp(id), x + 42, y + 34, { size: 12, color: '#7a6a4a', outline: false, shadow: false });
        if (ps.rank < 3) P.text(ctx, (ps.rank === 1 ? 2 : 4) + ' shards', x + w - 4, y + 26, { size: 12, align: 'right', color: S.shards >= (ps.rank === 1 ? 2 : 4) ? '#4fae62' : '#a89a78', outline: false, shadow: false });
        else P.text(ctx, 'MAX', x + w - 4, y + 26, { size: 12, align: 'right', color: '#c8963c', outline: false, shadow: false });
      },
      desc: function (id) {
        if (!id) return null;
        var pd = PB.Partners.get(id);
        return pd.bio + '  Field: ' + pd.field.name + ' — ' + pd.field.desc;
      },
      onPick: function (id) {
        var ps = S.partners[id];
        if (S.active !== id) { St.setActive(id); A.sfx('swap'); o.msg = pd(id).name + ' takes point.'; o.build(); return; }
        var need = ps.rank === 1 ? 2 : 4;
        if (ps.rank >= 3) { o.msg = 'Already at maximum rank.'; A.sfx('error'); return; }
        if (S.shards < need) { o.msg = 'Needs ' + need + ' Foil Shards.'; A.sfx('error'); return; }
        S.shards -= need; St.rankUp(id);
        A.fanfare('levelup'); o.msg = pd(id).name + ' is now Rank ' + ps.rank + '!';
        o.build();
      },
      onCancel: function () { o.close(); }
    });
    function pd(id) { return PB.Partners.get(id); }
  }

  function journalMenu(o) {
    var S = St.get();
    var rows = [];
    rows.push({ header: 'Quests' });
    var qk = Object.keys(S.quests);
    if (!qk.length) rows.push({ text: 'Nothing on the books yet.' });
    for (var i = 0; i < qk.length; i++) {
      var q = PB.Quests ? PB.Quests.get(qk[i]) : null;
      rows.push({ text: (S.quests[qk[i]].state === 'done' ? '✔ ' : '• ') + (q ? q.name : qk[i]), sub: q ? q.desc : '', done: S.quests[qk[i]].state === 'done' });
    }
    rows.push({ header: 'Records' });
    rows.push({ text: 'Battles won: ' + S.stats.wins });
    rows.push({ text: 'Stylish finishes: ' + S.stats.stylish });
    rows.push({ text: 'Superguards: ' + S.stats.superguards });
    rows.push({ text: 'Damage dealt: ' + S.stats.damage });
    rows.push({ text: 'Damage taken: ' + S.stats.taken });
    rows.push({ text: 'Foes catalogued: ' + Object.keys(S.tattled).length + '/' + PB.Enemies.list().length });
    rows.push({ text: 'Seals recovered: ' + S.seals.length + '/7' });
    rows.push({ text: 'Coliseum rank: ' + S.coliseumRank + '/20' });
    rows.push({ text: 'Difficulty: ' + St.diff().label });
    return new UI.Menu({
      title: 'Journal', items: rows, x: 92, y: 142, w: 620, rows: 9, rowH: 30,
      enabled: function (it) { return false; },
      drawRow: function (ctx, it, x, y, w, h) {
        if (it.header) { P.text(ctx, '— ' + it.header + ' —', x + 4, y + h / 2 + 5, { size: 13, color: '#8a7a5a', outline: false, shadow: false }); return; }
        P.text(ctx, it.text, x + 8, y + h / 2 + 6, { size: 15, color: it.done ? '#4fae62' : '#2a1c3c', outline: false, shadow: false });
      },
      desc: function (it) { return it && it.sub ? it.sub : null; },
      onCancel: function () { o.close(); }
    });
  }

  function optionsMenu(o, world) {
    var cfg = St.loadConfig() || {};
    function rows() {
      return [
        { k: 'music', label: 'Music volume', val: Math.round(A.getMusicVol() * 100) + '%' },
        { k: 'sfx', label: 'Sound volume', val: Math.round(A.getSfxVol() * 100) + '%' },
        { k: 'diff', label: 'Difficulty', val: St.diff().label },
        { k: 'save', label: 'Save game', val: '' },
        { k: 'title', label: 'Quit to title', val: '' }
      ];
    }
    var m = new UI.Menu({
      title: 'Options', items: rows(), x: 92, y: 142, w: 440, rows: 6, rowH: 34,
      drawRow: function (ctx, it, x, y, w, h) {
        P.text(ctx, it.label, x + 8, y + h / 2 + 6, { size: 15, color: '#2a1c3c', outline: false, shadow: false });
        P.text(ctx, it.val, x + w - 6, y + h / 2 + 6, { size: 15, align: 'right', color: '#8a6a3a', outline: false, shadow: false });
      },
      desc: function (it) {
        if (!it) return null;
        if (it.k === 'music' || it.k === 'sfx') return 'Left and right adjust the volume.';
        if (it.k === 'diff') return 'Relaxed softens incoming damage. Folded hits harder and pays more Seal Points.';
        return null;
      },
      onPick: function (it) {
        if (it.k === 'save') { o.sub = save(world, null); }
        else if (it.k === 'title') { world.game.toTitle(); o.close(); }
      },
      onCancel: function () { o.close(); }
    });
    var baseUpdate = m.update.bind(m);
    m.update = function () {
      var it = this.items[this.idx];
      if (it && (it.k === 'music' || it.k === 'sfx')) {
        var d = (In.pressed('right') ? .1 : 0) - (In.pressed('left') ? .1 : 0);
        if (d) {
          if (it.k === 'music') A.setMusicVol(A.getMusicVol() + d); else A.setSfxVol(A.getSfxVol() + d);
          A.sfx('cursor');
          St.saveConfig({ music: A.getMusicVol(), sfx: A.getSfxVol() });
          this.setItems(rows()); this.idx = this.idx;
          return;
        }
      }
      if (it && it.k === 'diff') {
        var order = ['relaxed', 'normal', 'folded'];
        var cur = order.indexOf(St.get().difficulty);
        if (In.pressed('right')) { St.get().difficulty = order[U.wrap(cur + 1, 3)]; A.sfx('cursor'); this.setItems(rows()); return; }
        if (In.pressed('left')) { St.get().difficulty = order[U.wrap(cur - 1, 3)]; A.sfx('cursor'); this.setItems(rows()); return; }
      }
      baseUpdate();
    };
    return m;
  }

  /* ======================================================================
     SHOPS
     ====================================================================== */
  var SHOPS = {};
  function defineShop(id, o) { SHOPS[id] = o; return o; }

  function shop(world, shopId, onClose) {
    var o = new Overlay(onClose);
    var S = St.get();
    var sd = SHOPS[shopId] || { name: 'Shop', stock: ['pulpberry', 'honeyleaf'], keeper: 'shopkeep_ream' };
    o.mode = 'root'; o.msg = sd.greeting || 'Take a look around!';
    function priceOf(id) { return Math.max(1, Math.round((It.get(id).price || 5) * (sd.markup || 1))); }

    function buildRoot() {
      return new UI.Menu({
        title: sd.name, items: [{ k: 'buy', label: 'Buy' }, { k: 'sell', label: 'Sell' }, { k: 'leave', label: 'Leave' }],
        x: 90, y: 300, w: 190, rows: 3, rowH: 32,
        onPick: function (it) {
          if (it.k === 'leave') { o.close(); return; }
          o.mode = it.k; o.menu = it.k === 'buy' ? buildBuy() : buildSell();
        },
        onCancel: function () { o.close(); }
      });
    }
    function buildBuy() {
      return new UI.Menu({
        title: 'Buy   (' + S.coins + ' coins)', items: sd.stock.slice(),
        x: 300, y: 210, w: 380, rows: 7, rowH: 32,
        enabled: function (id) { return S.coins >= priceOf(id); },
        drawRow: function (ctx, id, x, y, w, h, sel, ok) {
          It.drawIcon(ctx, id, x + 12, y + h / 2, 24);
          P.text(ctx, It.get(id).name, x + 30, y + h / 2 + 6, { size: 15, color: ok ? '#2a1c3c' : 'rgba(42,28,60,.4)', outline: false, shadow: false });
          P.text(ctx, priceOf(id) + 'c', x + w - 6, y + h / 2 + 6, { size: 14, align: 'right', color: ok ? '#8a6a3a' : 'rgba(42,28,60,.4)', outline: false, shadow: false });
        },
        desc: function (id) { return id ? It.get(id).desc : null; },
        onPick: function (id) {
          var pr = priceOf(id);
          if (S.coins < pr) { A.sfx('error'); o.msg = 'You cannot afford that.'; return; }
          var r = St.addItem(id);
          if (!r) { A.sfx('error'); o.msg = 'You have nowhere to put it.'; return; }
          S.coins -= pr; A.sfx('coin');
          o.msg = r === 'store' ? 'Sent to storage.' : 'Thank you kindly!';
          o.menu = buildBuy();
        },
        onCancel: function () { o.mode = 'root'; o.menu = buildRoot(); }
      });
    }
    function buildSell() {
      var list = S.items.map(function (id, i) { return { id: id, i: i }; });
      return new UI.Menu({
        title: 'Sell   (' + S.coins + ' coins)', items: list,
        x: 300, y: 210, w: 380, rows: 7, rowH: 32,
        drawRow: function (ctx, it, x, y, w, h) {
          It.drawIcon(ctx, it.id, x + 12, y + h / 2, 24);
          P.text(ctx, It.get(it.id).name, x + 30, y + h / 2 + 6, { size: 15, color: '#2a1c3c', outline: false, shadow: false });
          P.text(ctx, (It.get(it.id).sell || 1) + 'c', x + w - 6, y + h / 2 + 6, { size: 14, align: 'right', color: '#8a6a3a', outline: false, shadow: false });
        },
        onPick: function (it) {
          S.items.splice(it.i, 1);
          S.coins = Math.min(9999, S.coins + (It.get(it.id).sell || 1));
          A.sfx('coin'); o.msg = 'Much obliged.';
          o.menu = buildSell();
        },
        onCancel: function () { o.mode = 'root'; o.menu = buildRoot(); }
      });
    }
    o.menu = buildRoot();
    o.update = function () { o.t++; o.menu.update(); };
    o.draw = function (ctx) {
      o.dim(ctx, .5);
      P.panel(ctx, 60, 90, W - 120, H - 180, { fill: '#f7edd6', edge: '#8a6a3a', radius: 16 });
      Spr.draw(ctx, sd.keeper || 'shopkeep_ream', 168, 300, { t: o.t, scale: 1.5, anim: 'idle' });
      P.bubble(ctx, 232, 130, 380, 72, 200, 200, {});
      var lines = P.wrap(ctx, o.msg, 350, 15);
      for (var i = 0; i < lines.length && i < 3; i++) P.text(ctx, lines[i], 250, 158 + i * 20, { size: 15, color: '#2a1c3c', outline: false, shadow: false });
      P.text(ctx, 'Coins: ' + St.get().coins, W - 100, 128, { size: 17, align: 'right', color: '#c8963c', outline: false, shadow: false });
      o.menu.draw(ctx);
    };
    return o;
  }

  /* ======================================================================
     INN / COOK / SAVE / MAP
     ====================================================================== */
  function inn(world, price, onClose) {
    var o = new Overlay(onClose);
    var S = St.get();
    o.menu = new UI.Menu({
      title: 'Rest for ' + price + ' coins?', items: [{ k: 'y', label: 'Yes, please' }, { k: 'n', label: 'Not now' }],
      x: W / 2 - 150, y: 240, w: 300, rows: 2, rowH: 34,
      onPick: function (it) {
        if (it.k === 'n') { o.close(); return; }
        if (S.coins < price) { A.sfx('error'); o.msg = 'You are short on coins.'; return; }
        S.coins -= price; St.fullHeal(); A.fanfare('item');
        UI.toast('Fully rested', null, '#8fcf52');
        o.close();
      },
      onCancel: function () { o.close(); }
    });
    o.update = function () { o.t++; o.menu.update(); };
    o.draw = function (ctx) {
      o.dim(ctx);
      UI.title(ctx, 'INN', 180, { t: o.t, size: 34 });
      o.menu.draw(ctx);
      if (o.msg) P.text(ctx, o.msg, W / 2, 340, { size: 15, align: 'center', color: '#f0a0a0' });
    };
    return o;
  }

  function cook(world, onClose) {
    var o = new Overlay(onClose);
    var S = St.get();
    o.picked = [];
    o.msg = 'Pick one or two things and I will see what I can do.';
    function build() {
      var list = S.items.map(function (id, i) { return { id: id, i: i }; });
      list.push({ done: true, id: null, label: o.picked.length ? 'Cook it!' : 'Never mind' });
      return new UI.Menu({
        title: 'Cooking   (' + o.picked.length + '/2 chosen)', items: list,
        x: W / 2 - 200, y: 170, w: 400, rows: 8, rowH: 30,
        drawRow: function (ctx, it, x, y, w, h) {
          if (it.done) { P.text(ctx, it.label, x + 8, y + h / 2 + 6, { size: 15, color: '#c8443c', outline: false, shadow: false }); return; }
          It.drawIcon(ctx, it.id, x + 12, y + h / 2, 24);
          var chosen = o.picked.indexOf(it.i) >= 0;
          P.text(ctx, It.get(it.id).name, x + 30, y + h / 2 + 6, { size: 15, color: chosen ? '#4fae62' : '#2a1c3c', outline: false, shadow: false });
          if (chosen) P.text(ctx, 'in the pot', x + w - 6, y + h / 2 + 6, { size: 12, align: 'right', color: '#4fae62', outline: false, shadow: false });
        },
        onPick: function (it) {
          if (it.done) {
            if (!o.picked.length) { o.close(); return; }
            doCook();
            return;
          }
          var at = o.picked.indexOf(it.i);
          if (at >= 0) o.picked.splice(at, 1);
          else if (o.picked.length < 2) o.picked.push(it.i);
          else { A.sfx('error'); return; }
          o.menu = build();
        },
        onCancel: function () { o.close(); }
      });
    }
    function doCook() {
      var ids = o.picked.map(function (i) { return S.items[i]; });
      var result = ids.length === 2 ? It.cook(ids[0], ids[1]) : singleCook(ids[0]);
      // remove chosen, highest index first
      o.picked.slice().sort(function (a, b) { return b - a; }).forEach(function (i) { S.items.splice(i, 1); });
      St.addItem(result);
      St.learnRecipe(result);
      A.fanfare('item');
      o.msg = 'Behold — ' + It.get(result).name + '!';
      UI.toast('Cooked ' + It.get(result).name, result, '#f5c02e');
      o.picked = [];
      o.menu = build();
    }
    function singleCook(id) {
      var single = {
        pulpberry: 'reamcake', honeyleaf: 'inktea', reamcake: 'creambun', inktea: 'deeproot',
        foldroll: 'foldcake', creambun: 'grandfeast', mysterywad: 'grandfeast',
        wadbomb: 'bigwadbomb', emberpod: 'emberstew', frostnut: 'glacierjelly'
      };
      return single[id] || 'burntoffering';
    }
    o.menu = build();
    o.update = function () { o.t++; o.menu.update(); };
    o.draw = function (ctx) {
      o.dim(ctx);
      P.panel(ctx, 60, 90, W - 120, H - 180, { fill: '#f7edd6', edge: '#8a6a3a', radius: 16 });
      Spr.draw(ctx, 'chef_pulp', 130, 300, { t: o.t, scale: 1.4 });
      P.text(ctx, o.msg, W / 2 + 30, 130, { size: 15, align: 'center', color: '#2a1c3c', outline: false, shadow: false });
      o.menu.draw(ctx);
      P.text(ctx, 'Recipes discovered: ' + St.get().recipes.length + '/' + It.RECIPES.length, W / 2, H - 110,
        { size: 13, align: 'center', color: '#8a7a5a', outline: false, shadow: false });
    };
    return o;
  }

  function save(world, onClose) {
    var o = new Overlay(onClose);
    function rows() {
      var r = [];
      for (var i = 1; i <= 3; i++) r.push({ slot: i, info: St.peek(i) });
      r.push({ cancel: true });
      return r;
    }
    o.menu = new UI.Menu({
      title: 'Save to which slot?', items: rows(),
      x: W / 2 - 230, y: 170, w: 460, rows: 4, rowH: 52,
      drawRow: function (ctx, it, x, y, w, h) {
        if (it.cancel) { P.text(ctx, 'Cancel', x + 10, y + h / 2 + 6, { size: 16, color: '#c8443c', outline: false, shadow: false }); return; }
        P.text(ctx, 'Slot ' + it.slot, x + 10, y + 22, { size: 16, color: '#2a1c3c', outline: false, shadow: false });
        if (it.info) {
          P.text(ctx, it.info.name + '  Lv ' + it.info.level + '  Ch ' + it.info.chapter + '  ' + it.info.seals + '/7 seals',
            x + 92, y + 22, { size: 14, color: '#6b5a3a', outline: false, shadow: false });
          P.text(ctx, U.timeStr(it.info.frames) + '   ' + it.info.coins + ' coins   ' + (PB.Maps.get(it.info.map) ? PB.Maps.get(it.info.map).name : ''),
            x + 92, y + 40, { size: 12, color: '#8a7a5a', outline: false, shadow: false });
        } else P.text(ctx, '— empty —', x + 92, y + 30, { size: 14, color: '#a89a78', outline: false, shadow: false });
      },
      onPick: function (it) {
        if (it.cancel) { o.close(); return; }
        if (St.save(it.slot)) { A.fanfare('item'); UI.toast('Saved to slot ' + it.slot, null, '#8fcf52'); }
        else UI.toast('Could not save (storage blocked)', null, '#f0a0a0');
        o.close();
      },
      onCancel: function () { o.close(); }
    });
    o.update = function () { o.t++; o.menu.update(); };
    o.draw = function (ctx) {
      o.dim(ctx);
      UI.title(ctx, 'SAVE', 130, { t: o.t, size: 34 });
      o.menu.draw(ctx);
    };
    return o;
  }

  /* World map — the Foldheim overview. */
  var REGIONS = [
    { id: 0, name: 'Quillton', x: .12, y: .62, chapter: 0 },
    { id: 1, name: 'Creasewood', x: .26, y: .48, chapter: 1 },
    { id: 2, name: 'Emberfold', x: .38, y: .70, chapter: 2 },
    { id: 3, name: 'Sogport', x: .49, y: .38, chapter: 3 },
    { id: 4, name: 'Cardstock Carnival', x: .60, y: .66, chapter: 4 },
    { id: 5, name: 'Glyphhaven', x: .70, y: .34, chapter: 5 },
    { id: 6, name: 'Frostfold', x: .80, y: .60, chapter: 6 },
    { id: 7, name: 'Foilworks', x: .88, y: .32, chapter: 7 },
    { id: 8, name: 'Smudge Citadel', x: .94, y: .70, chapter: 8 }
  ];
  function worldmap(world, onClose) {
    var o = new Overlay(onClose);
    var S = St.get();
    o.update = function () {
      o.t++;
      if (In.pressed('select') || In.pressed('b') || In.pressed('start') || In.pressed('a')) { A.sfx('cancel'); o.close(); }
    };
    o.draw = function (ctx) {
      o.dim(ctx, .7);
      P.panel(ctx, 70, 60, W - 140, H - 130, { fill: '#f4e8cc', edge: '#8a6a3a', radius: 14 });
      P.text(ctx, 'FOLDHEIM', W / 2, 106, { size: 26, align: 'center', color: '#8a6a3a', outline: false, shadow: false });
      var mx = 110, my = 130, mw = W - 220, mh = H - 250;
      // route
      ctx.save();
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      for (var i = 0; i < REGIONS.length; i++) {
        var r = REGIONS[i];
        var x = mx + r.x * mw, y = my + r.y * mh;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = '#a9713f'; ctx.lineWidth = 2.5; ctx.stroke();
      ctx.restore();
      for (var j = 0; j < REGIONS.length; j++) {
        var rg = REGIONS[j];
        var rx = mx + rg.x * mw, ry = my + rg.y * mh;
        var open = S.chapter >= rg.chapter;
        var cur = S.chapter === rg.chapter;
        P.ell(ctx, rx, ry, cur ? 13 : 10, cur ? 13 : 10, open ? (cur ? '#e0483c' : '#8fcf52') : '#b0a48c', '#5a4a30', 2.4);
        if (cur) { ctx.save(); ctx.globalAlpha = .4 + Math.sin(o.t * .1) * .3; P.ell(ctx, rx, ry, 20, 20, null, '#e0483c', 3); ctx.restore(); }
        P.text(ctx, open ? rg.name : '???', rx, ry - 20, { size: 13, align: 'center', color: open ? '#2a1c3c' : '#8a7a5a', outline: false, shadow: false });
      }
      P.text(ctx, 'Seals recovered: ' + S.seals.length + '/7        ' + (PB.Maps.get(S.map) ? PB.Maps.get(S.map).name : ''),
        W / 2, H - 90, { size: 15, align: 'center', color: '#6b5a3a', outline: false, shadow: false });
      P.text(ctx, 'Tab to close', W / 2, H - 66, { size: 13, align: 'center', color: '#8a7a5a', outline: false, shadow: false });
    };
    return o;
  }

  /* Level-choice style yes/no used by scripts occasionally. */
  function confirm(world, text, onYes, onClose) {
    var o = new Overlay(onClose);
    o.menu = new UI.Menu({
      title: text, items: [{ k: 'y', label: 'Yes' }, { k: 'n', label: 'No' }],
      x: W / 2 - 140, y: 250, w: 280, rows: 2, rowH: 32,
      onPick: function (it) { if (it.k === 'y' && onYes) onYes(); o.close(); },
      onCancel: function () { o.close(); }
    });
    o.update = function () { o.t++; o.menu.update(); };
    o.draw = function (ctx) { o.dim(ctx); o.menu.draw(ctx); };
    return o;
  }

  return {
    pause: pause, shop: shop, inn: inn, cook: cook, save: save, worldmap: worldmap, confirm: confirm,
    defineShop: defineShop, SHOPS: SHOPS, REGIONS: REGIONS
  };
})();

/* ===== 19_songs.js ===== */
/* ==========================================================================
   PAPERBOUND — 19_songs.js
   Chiptune patterns for the tracker in 02_audio.js.
   "." holds the previous note, "-" rests. Percussion lane: o kick, X snare,
   x hat.
   ========================================================================== */
'use strict';

(function () {
  var S = PB.Audio.defineSong;

  S('title', {
    bpm: 96, div: 4, tracks: [
      { wave: 'square', vol: .11, seq: 'C5 . E5 . G5 . E5 . A5 . . . G5 . . . F5 . A5 . C6 . A5 . G5 . . . . . . .' },
      { wave: 'triangle', vol: .13, seq: 'C3 . . . G3 . . . A2 . . . E3 . . . F2 . . . C3 . . . G2 . . . G2 . . .' },
      { wave: 'square', vol: .05, seq: 'E4 . . . B4 . . . C5 . . . G4 . . . A4 . . . E5 . . . D5 . . . D5 . . .' },
      { wave: 'noise', vol: .22, seq: 'x - x - X - x - x - x - X - x x x - x - X - x - x - x - X - x x' }
    ]
  });

  S('town', {
    bpm: 118, div: 4, tracks: [
      { wave: 'square', vol: .1, seq: 'G4 A4 B4 . D5 . B4 . A4 . G4 . E4 . . . F4 G4 A4 . C5 . A4 . G4 . E4 . D4 . . .' },
      { wave: 'triangle', vol: .12, seq: 'G2 . D3 . G2 . D3 . E2 . B2 . E2 . B2 . F2 . C3 . F2 . C3 . D2 . A2 . D2 . A2 .' },
      { wave: 'square', vol: .045, seq: 'B4 . . . G4 . . . G4 . . . E4 . . . A4 . . . F4 . . . B3 . . . F4 . . .' },
      { wave: 'noise', vol: .2, seq: 'x - x x X - x - x - x x X - x - x - x x X - x - x - x x X - x x' }
    ]
  });

  S('forest', {
    bpm: 104, div: 4, tracks: [
      { wave: 'triangle', vol: .13, seq: 'E4 . G4 . A4 . B4 . D5 . B4 . A4 . G4 . E4 . D4 . E4 . G4 . A4 . . . . . . .' },
      { wave: 'triangle', vol: .12, seq: 'E2 . . . B2 . . . C3 . . . G2 . . . A2 . . . E3 . . . D3 . . . B2 . . .' },
      { wave: 'square', vol: .04, seq: '- - B4 . - - D5 . - - E5 . - - D5 . - - A4 . - - C5 . - - B4 . . . . .' },
      { wave: 'noise', vol: .13, seq: 'x - - x - - x - x - - x - - x - x - - x - - x - x - - x - x - -' }
    ]
  });

  S('ember', {
    bpm: 132, div: 4, tracks: [
      { wave: 'sawtooth', vol: .085, seq: 'D4 . F4 . G4 . A4 . C5 . A4 . G4 . F4 . D4 . D4 . F4 . G4 . A#4 . A4 . G4 . F4 .' },
      { wave: 'triangle', vol: .14, seq: 'D2 . . . D2 . . . F2 . . . F2 . . . G2 . . . G2 . . . A2 . . . A2 . . .' },
      { wave: 'square', vol: .05, seq: 'A4 . . . A4 . . . C5 . . . C5 . . . D5 . . . D5 . . . E5 . . . E5 . . .' },
      { wave: 'noise', vol: .26, seq: 'o - x - X - x o o - x - X - x x o - x - X - x o o - x x X - x x' }
    ]
  });

  S('harbor', {
    bpm: 100, div: 4, tracks: [
      { wave: 'square', vol: .095, seq: 'A4 . C5 . E5 . D5 . C5 . A4 . G4 . E4 . F4 . A4 . C5 . B4 . A4 . G4 . E4 . . .' },
      { wave: 'triangle', vol: .13, seq: 'A2 . E3 . A2 . E3 . F2 . C3 . F2 . C3 . D2 . A2 . D2 . A2 . E2 . B2 . E2 . B2 .' },
      { wave: 'triangle', vol: .055, seq: 'E4 . . . C5 . . . A4 . . . F4 . . . D4 . . . A4 . . . G4 . . . B3 . . .' },
      { wave: 'noise', vol: .16, seq: 'x - - - X - - - x - - - X - - x x - - - X - - - x - - - X - x -' }
    ]
  });

  S('carnival', {
    bpm: 142, div: 4, tracks: [
      { wave: 'square', vol: .1, seq: 'C5 E5 G5 E5 C5 E5 G5 E5 D5 F5 A5 F5 D5 F5 A5 F5 E5 G5 C6 G5 E5 G5 C6 G5 D5 B4 G4 B4 D5 F5 A5 G5' },
      { wave: 'triangle', vol: .13, seq: 'C3 . G2 . C3 . G2 . D3 . A2 . D3 . A2 . E3 . B2 . E3 . B2 . G2 . D3 . G2 . G2 .' },
      { wave: 'square', vol: .045, seq: 'G4 . . . E4 . . . A4 . . . F4 . . . B4 . . . G4 . . . B3 . . . D4 . . .' },
      { wave: 'noise', vol: .24, seq: 'o x X x o x X x o x X x o x X x o x X x o x X x o x X x o X x X' }
    ]
  });

  S('library', {
    bpm: 84, div: 4, tracks: [
      { wave: 'triangle', vol: .13, seq: 'D4 . F4 . A4 . . . G4 . E4 . D4 . . . C4 . E4 . G4 . . . F4 . D4 . C4 . . .' },
      { wave: 'triangle', vol: .11, seq: 'D2 . . . A2 . . . B1 . . . F2 . . . C2 . . . G2 . . . A1 . . . E2 . . .' },
      { wave: 'square', vol: .038, seq: '- - A4 . - - D5 . - - G4 . - - B4 . - - G4 . - - C5 . - - F4 . - - A4 .' },
      { wave: 'noise', vol: .09, seq: '- - - x - - - - - - - x - - - - - - - x - - - - - - - x - - - x' }
    ]
  });

  S('frost', {
    bpm: 92, div: 4, tracks: [
      { wave: 'triangle', vol: .13, seq: 'B4 . . . F#5 . . . E5 . . . D5 . . . C#5 . . . E5 . . . D5 . . . B4 . . .' },
      { wave: 'triangle', vol: .12, seq: 'B2 . . . B2 . . . G2 . . . G2 . . . A2 . . . A2 . . . E2 . . . F#2 . . .' },
      { wave: 'square', vol: .05, seq: 'F#5 . . . B5 . . . B4 . . . F#5 . . . E5 . . . A5 . . . F#5 . . . D5 . . .' },
      { wave: 'noise', vol: .1, seq: '- - x - - - x - - - x - - - x x - - x - - - x - - - x - - x - -' }
    ]
  });

  S('foundry', {
    bpm: 136, div: 4, tracks: [
      { wave: 'sawtooth', vol: .08, seq: 'E4 E4 - E4 G4 - E4 - D4 D4 - D4 F4 - D4 - C4 C4 - C4 E4 - C4 - D4 - E4 - G4 - A4 -' },
      { wave: 'triangle', vol: .14, seq: 'E2 . E2 . E2 . E2 . D2 . D2 . D2 . D2 . C2 . C2 . C2 . C2 . D2 . D2 . G2 . G2 .' },
      { wave: 'square', vol: .04, seq: 'B4 . . . B4 . . . A4 . . . A4 . . . G4 . . . G4 . . . A4 . . . B4 . . .' },
      { wave: 'noise', vol: .28, seq: 'o - X - o - X - o - X - o - X x o - X - o - X - o - X - o X X x' }
    ]
  });

  S('blot', {
    bpm: 88, div: 4, tracks: [
      { wave: 'sawtooth', vol: .075, seq: 'C4 . . . D#4 . . . C4 . . . A#3 . . . G#3 . . . A#3 . . . C4 . . . . . . .' },
      { wave: 'triangle', vol: .14, seq: 'C2 . . . C2 . . . G#1 . . . G#1 . . . A#1 . . . A#1 . . . G1 . . . G1 . . .' },
      { wave: 'square', vol: .035, seq: '- - - - G4 . . . - - - - D#4 . . . - - - - C4 . . . - - - - D#4 . . .' },
      { wave: 'noise', vol: .18, seq: 'o - - - X - - - o - - - X - - x o - - - X - - - o - - x X - x -' }
    ]
  });

  S('battle', {
    bpm: 150, div: 4, tracks: [
      { wave: 'square', vol: .1, seq: 'A4 - A4 C5 - A4 - E5 D5 - C5 - A4 - G4 - F4 - F4 A4 - F4 - C5 A#4 - A4 - F4 - E4 -' },
      { wave: 'triangle', vol: .14, seq: 'A2 . A2 . A2 . A2 . A2 . A2 . A2 . A2 . F2 . F2 . F2 . F2 . E2 . E2 . E2 . E2 .' },
      { wave: 'square', vol: .045, seq: 'E5 . . . E5 . . . C5 . . . C5 . . . A4 . . . A4 . . . B4 . . . B4 . . .' },
      { wave: 'noise', vol: .26, seq: 'o - x - X - x - o - x - X - x x o - x - X - x - o - x x X - x X' }
    ]
  });

  S('boss', {
    bpm: 160, div: 4, tracks: [
      { wave: 'sawtooth', vol: .085, seq: 'D4 D4 - D4 F4 - D4 A#3 C4 C4 - C4 D#4 - C4 G3 A#3 A#3 - A#3 D4 - A#3 F3 A3 - C4 - D4 - F4 -' },
      { wave: 'triangle', vol: .15, seq: 'D2 D2 D2 D2 D2 D2 D2 D2 C2 C2 C2 C2 C2 C2 C2 C2 A#1 A#1 A#1 A#1 A#1 A#1 A#1 A#1 A1 A1 A1 A1 A1 A1 A1 A1' },
      { wave: 'square', vol: .05, seq: 'A4 . . . A4 . . . G4 . . . G4 . . . F4 . . . F4 . . . E4 . . . A4 . . .' },
      { wave: 'noise', vol: .3, seq: 'o x X x o x X x o x X x o x X X o x X x o x X x o x X x o X X X' }
    ]
  });

  S('final', {
    bpm: 168, div: 4, tracks: [
      { wave: 'sawtooth', vol: .09, seq: 'E4 - G4 - B4 - E5 - D5 - B4 - G4 - E4 - F4 - A4 - C5 - F5 - E5 - C5 - A4 - F4 -' },
      { wave: 'triangle', vol: .15, seq: 'E2 E2 E2 E2 E2 E2 E2 E2 E2 E2 E2 E2 E2 E2 E2 E2 F2 F2 F2 F2 F2 F2 F2 F2 F2 F2 F2 F2 F2 F2 F2 F2' },
      { wave: 'square', vol: .055, seq: 'B4 . . . E5 . . . G5 . . . E5 . . . C5 . . . F5 . . . A5 . . . F5 . . .' },
      { wave: 'noise', vol: .32, seq: 'o x X x o x X x o x X x o X X X o x X x o x X x o x X x o X X X' }
    ]
  });

  S('victory', {
    bpm: 130, div: 4, tracks: [
      { wave: 'square', vol: .12, seq: 'C5 E5 G5 C6 . . . . A5 . F5 . G5 . . . C6 . . . . . . . . . . . . . . .' },
      { wave: 'triangle', vol: .14, seq: 'C3 . G2 . C3 . . . F2 . C3 . G2 . . . C3 . . . . . . . . . . . . . . .' },
      { wave: 'noise', vol: .22, seq: 'o - X - o - X - o - X - o - X x o - - - - - - - - - - - - - - -' }
    ]
  });

  S('coliseum', {
    bpm: 146, div: 4, tracks: [
      { wave: 'square', vol: .1, seq: 'G4 . B4 . D5 . B4 . G5 . D5 . B4 . G4 . F4 . A4 . C5 . A4 . F5 . C5 . A4 . F4 .' },
      { wave: 'triangle', vol: .14, seq: 'G2 . D3 . G2 . D3 . G2 . D3 . G2 . D3 . F2 . C3 . F2 . C3 . F2 . C3 . F2 . C3 .' },
      { wave: 'square', vol: .045, seq: 'D5 . . . G5 . . . B4 . . . D5 . . . C5 . . . F5 . . . A4 . . . C5 . . .' },
      { wave: 'noise', vol: .27, seq: 'o x X x o x X x o x X x o x X X o x X x o x X x o x X x o X X x' }
    ]
  });

  S('voidsong', {
    bpm: 72, div: 4, tracks: [
      { wave: 'sine', vol: .12, seq: 'C5 . . . . . . . A#4 . . . . . . . G4 . . . . . . . A#4 . . . . . . .' },
      { wave: 'triangle', vol: .1, seq: 'C2 . . . . . . . . . . . . . . . G1 . . . . . . . . . . . . . . .' },
      { wave: 'sine', vol: .05, seq: '- - - - G5 . . . - - - - F5 . . . - - - - D5 . . . - - - - F5 . . .' }
    ]
  });

  S('sad', {
    bpm: 74, div: 4, tracks: [
      { wave: 'triangle', vol: .13, seq: 'A4 . . . G4 . . . F4 . . . E4 . . . D4 . . . E4 . . . F4 . . . . . . .' },
      { wave: 'triangle', vol: .11, seq: 'A2 . . . . . . . F2 . . . . . . . D2 . . . . . . . E2 . . . . . . .' }
    ]
  });

  S('credits', {
    bpm: 108, div: 4, tracks: [
      { wave: 'square', vol: .1, seq: 'C5 . D5 . E5 . G5 . A5 . G5 . E5 . D5 . C5 . D5 . E5 . C5 . D5 . . . . . . .' },
      { wave: 'triangle', vol: .13, seq: 'C3 . G2 . A2 . E3 . F2 . C3 . G2 . D3 . C3 . G2 . A2 . E3 . F2 . G2 . C3 .' },
      { wave: 'square', vol: .04, seq: 'E4 . . . G4 . . . C5 . . . B4 . . . A4 . . . G4 . . . E4 . . . E4 . . .' },
      { wave: 'noise', vol: .16, seq: 'x - x - X - x - x - x - X - x x x - x - X - x - x - x - X - x x' }
    ]
  });

  S('tense', {
    bpm: 112, div: 4, tracks: [
      { wave: 'triangle', vol: .12, seq: 'D3 . . . D#3 . . . D3 . . . A2 . . . D3 . . . F3 . . . E3 . . . D3 . . .' },
      { wave: 'sawtooth', vol: .05, seq: '- - - - - - - - A4 . . . - - - - - - - - - - - - A#4 . . . - - - -' },
      { wave: 'noise', vol: .14, seq: 'o - - - - - - - o - - - - - - x o - - - - - - - o - - - - - x -' }
    ]
  });
})();

/* ===== 20_quests.js ===== */
/* ==========================================================================
   PAPERBOUND — 20_quests.js
   Side quests posted on the Quillton board and picked up around the world.
   The Journal reads name/desc from here; the actual logic lives in the NPC
   scripts that start and finish them.
   ========================================================================== */
'use strict';

PB.Quests = (function () {
  var db = {};
  function Q(id, name, desc, o) {
    db[id] = PB.U.extend({ id: id, name: name, desc: desc, chapter: 0, reward: '' }, o || {});
    return db[id];
  }

  Q('lost_acorns', 'The Lost Acorns', 'Twigby scattered five acorns across Creasewood on the way down. Find them all.', { chapter: 1, reward: 'Happy Heart badge' });
  Q('sign_painter', 'Sign of the Times', 'Quillton\'s signpainter needs three Pulp Berries for red ink.', { chapter: 0, reward: '30 coins' });
  Q('deckle_hammer', 'A Proper Hammer', 'Smith Deckle will reforge your mallet if you bring him foundry steel.', { chapter: 2, reward: 'Mallet upgrade' });
  Q('ferry_manifest', 'The Missing Manifest', 'Sailor Keel lost the harbour manifest somewhere in the Sunken Ream.', { chapter: 3, reward: 'Foil Shard' });
  Q('lost_ticket', 'One Ticket, Please', 'A carnival child dropped their ticket in the funhouse.', { chapter: 4, reward: 'Crowd Pleaser badge' });
  Q('overdue_books', 'Extremely Overdue', 'Archivist Marge wants four books returned. They have been out for a century.', { chapter: 5, reward: 'Deep Focus badge' });
  Q('summit_bell', 'The Summit Bell', 'Ring the three bells of the Frostfold passes in the right order.', { chapter: 6, reward: 'Foil Shard' });
  Q('scrap_run', 'Scrap Run', 'Volt wants six discarded cogs from the Foilworks floor.', { chapter: 7, reward: 'Volt rank up' });
  Q('lantern_oil', 'Keeping the Light', 'The Emberfold lamplighter is out of oil.', { chapter: 2, reward: 'Ember Shield badge' });
  Q('missing_courier', 'Return to Sender', 'A courier vanished on the Creasewood road. Find out what happened.', { chapter: 1, reward: 'Foil Shard' });
  Q('cook_recipes', 'A Full Cookbook', 'Discover fifteen of Chef Pulp\'s recipes.', { chapter: 2, reward: 'Sovereign Roast' });
  Q('tattle_all', 'The Complete Bestiary', 'Study every foe in Foldheim with Twigby.', { chapter: 1, reward: 'Peekaboo badge' });
  Q('coliseum_climb', 'Twenty Rounds', 'Take the Folded Coliseum from rank 20 to rank 1.', { chapter: 4, reward: 'Coliseum Crown' });
  Q('seven_seals', 'The Seven Seals', 'Recover all seven seals of the Origami Crown.', { chapter: 1, reward: 'The Crown' });
  Q('smudge_letters', 'Unsent Letters', 'Nine letters Duke Smudge never delivered are scattered across Foldheim.', { chapter: 3, reward: 'Last Page' });
  Q('first_draft', 'The Draft in the Bin', 'Something is living in the Quillton paper bin. It knows your name.', { chapter: 6, reward: 'A hard fight' });

  function get(id) { return db[id]; }
  function all() { return db; }
  function list() { var a = []; for (var k in db) a.push(db[k]); return a; }
  return { get: get, all: all, list: list };
})();

/* ===== 21_maps_ch0.js ===== */
/* ==========================================================================
   PAPERBOUND — 21_maps_ch0.js
   PROLOGUE — Quillton   +   CHAPTER 1 — Creasewood

   This file is the reference for the map format. Every other chapter file
   follows the same shape:

   PB.Maps.define(id, {
     name, chapter, music, theme, battleBg, dark?,
     bounds: {x0, x1, z0, z1},
     spawns: { key: {x, z, face?} },              // z is depth 0(far)..1(near)
     exits:  [{x, z, w, d, to, spawn, door?, needsKey?, needsFlag?, lockedMsg?}],
     solids: [{x, z, w, d, h, sprite?, wall?, id?, hidden?}],
     props:  [{sprite, x, z, y?, scale?, face?, id?}],
     npcs:   [{id, sprite, x, z, name, face?, wander?, script:[...]}],
     foes:   [{id, type, x, z, patrol?, group:[...], killFlag?, boss?, cfg?}],
     items:  [{kind:'coin'|'chest'|'shard', x, z, amount?/item?/badge?, flag?}],
     gizmos: [{kind, x, z, ...}],
     triggers:[{x, z, w, d, once?, flag?, script:[...]}],
     water:  [{x0,x1,z0,z1}], pits: [{x0,x1,z0,z1,to:{x,z}}],
     onEnter: [...script...]
   })
   ========================================================================== */
'use strict';

(function () {
  var M = PB.Maps.define, Shop = PB.Menus.defineShop;

  /* ---- shops ------------------------------------------------------------- */
  Shop('quillton_general', {
    name: 'Ream & Daughters', keeper: 'shopkeep_ream',
    greeting: 'Fresh pulp, fresh paper, fresh prices. Well — two out of three.',
    stock: ['pulpberry', 'honeyleaf', 'reamcake', 'antidote', 'drycloth', 'wadbomb', 'escapenote']
  });
  Shop('quillton_badges', {
    name: 'Foil\'s Findings', keeper: 'badgesmith_foil', markup: 1,
    greeting: 'Badges! Pinned, polished, and probably legal.',
    stock: ['powerstomp', 'powermallet', 'happyheart', 'timingtutor', 'prettylucky', 'payoff']
  });
  Shop('creasewood_camp', {
    name: 'Trailside Basket', keeper: 'villager_d', markup: 1.15,
    greeting: 'Nobody restocks me out here, so mind the prices.',
    stock: ['pulpberry', 'honeyleaf', 'reamcake', 'antidote', 'emberpod']
  });

  /* ======================================================================
     PROLOGUE — QUILLTON
     ====================================================================== */

  M('quill_square', {
    name: 'Quillton Square', chapter: 0, music: 'town', theme: 'town', battleBg: 'stage',
    bounds: { x0: 0, x1: 1500, z0: .1, z1: .95 },
    spawns: {
      default: { x: 200, z: .6 },
      west: { x: 40, z: .6 },
      east: { x: 1450, z: .6, face: 'left' },
      hall: { x: 760, z: .78 }
    },
    exits: [
      { x: 8, z: .6, w: 40, d: 1, to: 'quill_lane', spawn: 'east' },
      { x: 1492, z: .6, w: 40, d: 1, to: 'quill_gate', spawn: 'west' }
    ],
    props: [
      { sprite: 'house_small', x: 180, z: .12, scale: 1.05 },
      { sprite: 'house_small', x: 470, z: .1, scale: .95 },
      { sprite: 'house_small', x: 1180, z: .12, scale: 1 },
      { sprite: 'tree_round', x: 340, z: .3 },
      { sprite: 'tree_round', x: 1010, z: .26, scale: .9 },
      { sprite: 'bush', x: 620, z: .88 }, { sprite: 'bush', x: 900, z: .9 },
      { sprite: 'lamp', x: 260, z: .82 }, { sprite: 'lamp', x: 1100, z: .82 },
      { sprite: 'banner', x: 700, z: .18 }, { sprite: 'banner', x: 840, z: .18 },
      { sprite: 'crate', x: 1290, z: .74 }, { sprite: 'barrel', x: 1330, z: .8 }
    ],
    solids: [
      { x: 760, z: .2, w: 220, d: .3, h: 54, sprite: 'shop_stall' }
    ],
    gizmos: [
      { kind: 'save', x: 100, z: .84 },
      { kind: 'shop', x: 660, z: .42, shop: 'quillton_general', label: 'Shop', sprite: 'shop_stall', scale: .8 },
      { kind: 'cook', x: 1000, z: .58, label: 'Cook', sprite: 'barrel' },
      { kind: 'inn', x: 1250, z: .42, price: 5, label: 'Rest', sprite: 'house_small', scale: .8 },
      {
        kind: 'sign', x: 400, z: .86,
        text: 'QUILLTON — pop. 240, give or take a draft.\nFounding Day this evening. Please do not fold the bunting.'
      },
      {
        kind: 'sign', x: 1420, z: .86,
        text: 'EAST GATE → Creasewood Road.\nTravellers: the road is safe. The woods are the woods.'
      }
    ],
    items: [
      { kind: 'coin', x: 540, z: .72, amount: 3, flag: 'q_coin1' },
      { kind: 'coin', x: 880, z: .34, amount: 3, flag: 'q_coin2' },
      { kind: 'chest', x: 1400, z: .3, item: 'reamcake', flag: 'q_chest1' }
    ],
    npcs: [
      {
        id: 'mayor', sprite: 'mayor_folio', x: 760, z: .66, name: 'Mayor Folio',
        script: function () {
          if (!PB.State.hasFlag('prologue_done')) return [
            ['say', 'mayor_folio', 'Pip! Finally. Is that the parcel? Tell me that is the parcel.'],
            ['say', 'pip', 'Signed for and everything.'],
            ['say', 'mayor_folio', 'Bring it to the square platform. Founding Day waits for no one — least of all me.']
          ];
          return [['say', 'mayor_folio', 'Seven seals, Pip. Seven. And I signed for the delivery, so technically this is my fault. Please fix it.']];
        }
      },
      {
        id: 'elder', sprite: 'elder_quill', x: 300, z: .5, name: 'Elder Quill',
        script: function () {
          if (!PB.State.hasFlag('prologue_done')) return [
            ['say', 'elder_quill', 'A courier who arrives early. I shall have to revise my opinion of the young.'],
            ['say', 'elder_quill', 'Do you know what you are carrying, child? No. Of course not. That is rather the point of couriers.']
          ];
          return [
            ['say', 'elder_quill', 'The Crown was folded from a single sheet, once. One sheet, seven creases, and every crease a promise.'],
            ['say', 'elder_quill', 'Smudge tore it because a torn thing cannot promise anything. Go and put the promises back.'],
            ['ifnotflag', 'got_map_hint', [
              ['say', 'elder_quill', 'Press <c:#c8443c>Tab</c> to open your map. Press <c:#c8443c>Esc</c> for your satchel. And do try to eat.'],
              ['flag', 'got_map_hint', true]
            ]]
          ];
        }
      },
      {
        id: 'shopkeep', sprite: 'shopkeep_ream', x: 660, z: .5, name: 'Ream',
        script: [['say', 'shopkeep_ream', 'Stall\'s just there. Everything on it is honest and half of it is edible.'], ['shop', 'quillton_general']]
      },
      {
        id: 'chef', sprite: 'chef_pulp', x: 1000, z: .68, name: 'Chef Pulp',
        script: [
          ['say', 'chef_pulp', 'Bring me two things and I will make them one thing. That is the whole art, really.'],
          ['ifnotflag', 'got_cookbook', [['givekey', 'cookbook'], ['flag', 'got_cookbook', true], ['say', 'chef_pulp', 'Take the book. Do not read the last page, it is a shopping list and it is embarrassing.']]],
          ['cook']
        ]
      },
      {
        id: 'gran', sprite: 'grandma_creased', x: 1250, z: .56, name: 'Gran Creased',
        script: [['say', 'grandma_creased', 'Five coins a night, and I will not ask where you have been.'], ['inn', 5]]
      },
      {
        id: 'kid1', sprite: 'kid_dot', x: 520, z: .82, name: 'Dot', wander: 40,
        script: [['say', 'kid_dot', 'Are you a REAL courier? Do you have a REAL satchel? Can I hold it? Please?'], ['say', 'pip', '...It is mostly receipts.'], ['say', 'kid_dot', 'CAN I HOLD THE RECEIPTS.']]
      },
      {
        id: 'kid2', sprite: 'kid_dash', x: 580, z: .9, name: 'Dash', wander: 50,
        script: [['say', 'kid_dash', 'Hold <c:#c8443c>Q</c> or <c:#c8443c>E</c> to run. I can run faster than you though. Probably.']]
      },
      {
        id: 'sailor', sprite: 'sailor_keel', x: 1120, z: .74, name: 'Keel',
        script: [['say', 'sailor_keel', 'Down from Sogport for the festival. Water is up, ferries are down, and nobody can tell me why.']]
      }
    ],
    triggers: [
      {
        x: 300, z: .6, w: 80, d: 1.2, once: true, flag: 'tr_intro',
        script: [
          ['chapter', 0, 'A Parcel for Quillton', 'in which very little goes to plan'],
          ['say', 'narr', 'Founding Day. Bunting on every line, the whole town smelling of warm pulp, and one courier arriving — for once — with time to spare.'],
          ['say', 'pip', 'Deliver the parcel. Get paid. Sit down. In that order.'],
          ['toast', 'Arrow keys move. Z jumps and talks.', null, '#fdf6e3']
        ]
      },
      {
        x: 760, z: .62, w: 70, d: .5, once: true, flag: 'tr_deliver', notFlag: 'prologue_done',
        script: [
          ['say', 'mayor_folio', 'Right here on the platform. Careful — CAREFUL —'],
          ['sfx', 'chest'],
          ['title', 'THE ORIGAMI CROWN', 100],
          ['say', 'narr', 'A crown folded from one sheet of paper, seven creases deep. It has sat on nothing and no one for four hundred years, which is rather the point.'],
          ['music', 'tense'],
          ['say', 'narr', 'The light goes wrong first. Then the shadow under the platform stands up.'],
          ['camera', 1000, 40],
          ['spawn', { id: 'sable', sprite: 'captain_sable', x: 1060, z: .5, name: 'Captain Sable', face: 'left' }],
          ['wait', 30],
          ['sayx', 'Captain Sable', 'captain_sable', 'Quillton. By the authority of Duke Smudge, this object is CONFISCATED.', 'boss'],
          ['say', 'mayor_folio', 'On WHOSE authority?!'],
          ['sayx', 'Captain Sable', 'captain_sable', 'I just said. Do keep up.', 'boss'],
          ['say', 'pip', 'It is signed for. It is MINE until he signs.'],
          ['sayx', 'Captain Sable', 'captain_sable', '...You are a courier.', 'boss'],
          ['say', 'pip', 'I am the courier.'],
          ['wait', 20],
          ['sfx', 'tear'],
          ['shake', 22],
          ['fadeout', '#ffffff', .16],
          ['title', 'SEVEN SEALS SCATTER', 90],
          ['fadein', .08],
          ['say', 'narr', 'It does not tear cleanly. Paper never does. Seven bright fragments go up like startled birds and out over the whole of Foldheim.'],
          ['sayx', 'Captain Sable', 'captain_sable', 'Hm. That was not the instruction.', 'boss'],
          ['sayx', 'Captain Sable', 'captain_sable', 'No matter. Scattered is as good as destroyed, and the Duke is not a patient reader.', 'boss'],
          ['movenowait', 'sable', 1480, .5, 4],
          ['wait', 60],
          ['despawn', 'sable'],
          ['music', 'sad'],
          ['say', 'mayor_folio', 'Four hundred years. Four hundred years and it lasted nine seconds in MY hands.'],
          ['say', 'elder_quill', 'Then it will have to be put back. Pip.'],
          ['say', 'pip', 'I know. I know. Seven parcels. Seven addresses.'],
          ['say', 'elder_quill', 'That is a courier\'s way of saying yes. Take this — the road map. And take the road east.'],
          ['givekey', 'map_foldheim'],
          ['flag', 'prologue_done', true],
          ['chapterset', 0],
          ['quest', 'seven_seals', 'start'],
          ['camerafree'],
          ['music', 'town'],
          ['say', 'narr', 'The east gate is at the far end of the square.'],
          ['toast', 'Head east out of Quillton', null, '#fdf6e3']
        ]
      }
    ],
    onEnter: []
  });

  M('quill_lane', {
    name: 'Quillton Lane', chapter: 0, music: 'town', theme: 'town', battleBg: 'stage',
    bounds: { x0: 0, x1: 1000, z0: .12, z1: .95 },
    spawns: { default: { x: 120, z: .6 }, east: { x: 940, z: .6, face: 'left' } },
    exits: [{ x: 985, z: .6, w: 40, d: 1, to: 'quill_square', spawn: 'west' }],
    props: [
      { sprite: 'house_small', x: 220, z: .14 }, { sprite: 'house_small', x: 620, z: .12, scale: .95 },
      { sprite: 'anvil', x: 420, z: .62 }, { sprite: 'crate', x: 500, z: .74 },
      { sprite: 'lamp', x: 140, z: .84 }, { sprite: 'lamp', x: 760, z: .84 },
      { sprite: 'bookshelf', x: 880, z: .16, scale: .8 }
    ],
    solids: [{ x: 700, z: .5, w: 70, d: .3, h: 46, sprite: 'crate' }],
    items: [
      { kind: 'coin', x: 320, z: .82, amount: 4, flag: 'ql_coin1' },
      { kind: 'chest', x: 760, z: .3, item: 'honeyleaf', flag: 'ql_chest1' },
      { kind: 'chest', x: 700, z: .5, y: 46, badge: 'happyflower', flag: 'ql_chest2' }
    ],
    gizmos: [
      { kind: 'shop', x: 880, z: .5, shop: 'quillton_badges', label: 'Badges', sprite: 'shop_stall', scale: .7 },
      { kind: 'sign', x: 60, z: .86, text: 'DECKLE & SON, SMITHS. (There is no son. There is an anvil.)' }
    ],
    npcs: [
      {
        id: 'smith', sprite: 'smith_deckle', x: 420, z: .74, name: 'Deckle',
        script: function () {
          var S = PB.State;
          if (S.questState('deckle_hammer') === 'done') return [['say', 'smith_deckle', 'She swings true now, eh? Do not tell me otherwise, I will not hear it.']];
          if (S.questState('deckle_hammer') === 'open' && S.hasKey('foundry_steel')) return [
            ['say', 'smith_deckle', 'That is foundry steel or I am a paper hat. Give it here.'],
            ['takekey', 'foundry_steel'],
            ['sfx', 'mallet'], ['wait', 30], ['sfx', 'mallet'], ['wait', 30],
            ['upgrade', 'mallet'],
            ['quest', 'deckle_hammer', 'done', 'A Proper Hammer'],
            ['say', 'smith_deckle', 'There. Now stop hitting things with the FLAT of it.']
          ];
          if (S.get().chapter >= 2) return [
            ['say', 'smith_deckle', 'That mallet of yours is a toy. Bring me a bar of Emberfold steel and I will make it a tool.'],
            ['quest', 'deckle_hammer', 'start'],
            ['say', 'smith_deckle', 'Foundry floor. Big red building. You cannot miss it, it is on fire.']
          ];
          return [['say', 'smith_deckle', 'Come back when you have swung that mallet at something that swings back.']];
        }
      },
      {
        id: 'painter', sprite: 'villager_c', x: 180, z: .68, name: 'Signwright Vellum',
        script: function () {
          var S = PB.State;
          if (S.questState('sign_painter') === 'done') return [['say', 'villager_c', 'Reds are drying beautifully. You have a good eye for berries.']];
          if (S.questState('sign_painter') === 'open') {
            var n = 0;
            for (var i = 0; i < S.get().items.length; i++) if (S.get().items[i] === 'pulpberry') n++;
            if (n >= 3) return [
              ['say', 'villager_c', 'Three berries! Oh, you angel.'],
              ['func', function () { for (var k = 0; k < 3; k++) PB.State.removeItem('pulpberry'); }],
              ['coins', 30], ['badge', 'moneymoney'],
              ['quest', 'sign_painter', 'done', 'Sign of the Times']
            ];
            return [['say', 'villager_c', 'Three Pulp Berries. Any three. I am not fussy, I am just out of red.']];
          }
          return [
            ['say', 'villager_c', 'Every sign in town needs repainting before the festival and I have no red left.'],
            ['say', 'villager_c', 'Pulp Berries make a fine red. Bring me three and I will make it worth your while.'],
            ['quest', 'sign_painter', 'start']
          ];
        }
      },
      {
        id: 'foil', sprite: 'badgesmith_foil', x: 880, z: .62, name: 'Foil',
        script: [
          ['say', 'badgesmith_foil', 'Badges! Pin them on, get better at things. It is the closest thing to magic anyone here can afford.'],
          ['ifnotflag', 'badge_lesson', [
            ['say', 'badgesmith_foil', 'Each one costs <c:#c8443c>BP</c>. You get more BP by levelling. Open your satchel with <c:#c8443c>Esc</c> to pin them on.'],
            ['flag', 'badge_lesson', true],
            ['badge', 'timingtutor'],
            ['say', 'badgesmith_foil', 'Here — Timing Tutor, on the house. It draws the perfect window on your action commands. Training wheels, but nobody is watching.']
          ]],
          ['shop', 'quillton_badges']
        ]
      },
      {
        id: 'bard', sprite: 'bard_octavo', x: 620, z: .82, name: 'Octavo', wander: 60,
        script: [['say', 'bard_octavo', 'I am writing a ballad about a courier. It does not have an ending yet. No pressure.']]
      }
    ],
    triggers: [{
      x: 940, z: .6, w: 60, d: 1, once: true, flag: 'tr_bin_hint', needsFlag: 'ch6_done',
      script: [['say', 'narr', 'Something in the paper bin behind Foil\'s stall is breathing. It has been breathing for a while.'], ['quest', 'first_draft', 'start']]
    }]
  });

  M('quill_gate', {
    name: 'Quillton East Gate', chapter: 0, music: 'town', theme: 'town', battleBg: 'forest',
    bounds: { x0: 0, x1: 1100, z0: .15, z1: .92 },
    spawns: { default: { x: 100, z: .6 }, west: { x: 60, z: .6 }, east: { x: 1040, z: .6, face: 'left' } },
    exits: [
      { x: 8, z: .6, w: 40, d: 1, to: 'quill_square', spawn: 'east' },
      {
        x: 1082, z: .6, w: 40, d: 1, to: 'foldheim_road', spawn: 'west',
        needsFlag: 'prologue_done', lockedMsg: 'Business in the square first. The mayor is going purple.'
      }
    ],
    props: [
      { sprite: 'pillar', x: 980, z: .22 }, { sprite: 'pillar', x: 980, z: .86 },
      { sprite: 'tree_pine', x: 300, z: .18 }, { sprite: 'tree_pine', x: 560, z: .14, scale: 1.1 },
      { sprite: 'bush', x: 420, z: .88 }, { sprite: 'rock', x: 700, z: .84 },
      { sprite: 'sign', x: 900, z: .84 }
    ],
    items: [{ kind: 'coin', x: 620, z: .5, amount: 5, flag: 'qg_coin1' }],
    gizmos: [
      { kind: 'save', x: 200, z: .84 },
      { kind: 'sign', x: 900, z: .84, text: 'CREASEWOOD ROAD →\nMind the roots. Mind the leaves. Mind, generally.' }
    ],
    npcs: [
      {
        id: 'guard', sprite: 'guard_gild', x: 940, z: .68, name: 'Gate Guard',
        script: [['say', 'guard_gild', 'Road east. Woods after that. Woods have been LOUD lately.']]
      }
    ],
    triggers: [{
      x: 500, z: .6, w: 90, d: 1.2, once: true, flag: 'tr_twigby', needsFlag: 'prologue_done',
      script: [
        ['music', 'tense'],
        ['say', 'narr', 'Something small drops out of the roadside bramble and lands, badly, on its face.'],
        ['spawn', { id: 'twig', sprite: 'twigby', x: 620, z: .6, name: 'Twigby' }],
        ['sfx', 'land'],
        ['wait', 24],
        ['say', 'twigby', 'OW. Right. Yes. Hello. Are you the courier? You are the courier.'],
        ['say', 'pip', 'Depends who is asking and whether they are going to fall on me.'],
        ['say', 'twigby', 'Twigby. Creasewood scout. Official. There is a — there is a LIGHT in the woods, a big bright chunk of something, and it came down last night and now everything with teeth is walking towards it.'],
        ['say', 'pip', 'A bright chunk. About this big. Sort of… crown-shaped.'],
        ['say', 'twigby', 'YES. Wait. How—'],
        ['say', 'pip', 'Long day. Show me.'],
        ['music', 'town'],
        ['say', 'twigby', 'Right! Yes! Official Creasewood scout, reporting. I read foes, I hit things, and I do not get lost. Mostly.'],
        ['despawn', 'twig'],
        ['partner', 'twigby'],
        ['wait', 20],
        ['say', 'sys', 'Twigby joined you.\n<c:#c8443c>C</c> uses a partner\'s field ability.  In battle, his <c:#4fae62>Study</c> tells you a foe\'s stats and weak points.'],
        ['flag', 'has_partner', true],
        ['quest', 'tattle_all', 'start']
      ]
    }]
  });

  /* ======================================================================
     CHAPTER 1 — CREASEWOOD
     ====================================================================== */

  M('cw_trail', {
    name: 'Creasewood Trail', chapter: 1, music: 'forest', theme: 'forest', battleBg: 'forest',
    bounds: { x0: 0, x1: 1900, z0: .12, z1: .95 },
    spawns: { default: { x: 90, z: .6 }, west: { x: 60, z: .6 }, east: { x: 1840, z: .6, face: 'left' } },
    exits: [
      { x: 8, z: .6, w: 40, d: 1, to: 'foldheim_road', spawn: 'ch1' },
      { x: 1888, z: .6, w: 40, d: 1, to: 'cw_glade', spawn: 'west' }
    ],
    props: [
      { sprite: 'tree_pine', x: 140, z: .16 }, { sprite: 'tree_round', x: 380, z: .12 },
      { sprite: 'tree_pine', x: 640, z: .18, scale: 1.1 }, { sprite: 'tree_round', x: 980, z: .14 },
      { sprite: 'tree_pine', x: 1320, z: .16 }, { sprite: 'tree_round', x: 1680, z: .12, scale: 1.05 },
      { sprite: 'bush', x: 260, z: .9 }, { sprite: 'bush', x: 820, z: .88 }, { sprite: 'bush', x: 1500, z: .92 },
      { sprite: 'rock', x: 1120, z: .86 }
    ],
    solids: [
      { x: 760, z: .42, w: 80, d: .28, h: 48, sprite: 'crate' },
      { x: 1240, z: .5, w: 90, d: .3, h: 70 }
    ],
    items: [
      { kind: 'coin', x: 420, z: .66, amount: 3, flag: 'cw1_c1' },
      { kind: 'coin', x: 760, z: .42, y: 48, amount: 4, flag: 'cw1_c2' },
      { kind: 'chest', x: 1240, z: .5, y: 70, item: 'pulpberry', flag: 'cw1_ch1' },
      { kind: 'chest', x: 1780, z: .28, item: 'wadbomb', flag: 'cw1_ch2' }
    ],
    gizmos: [
      { kind: 'save', x: 160, z: .86 },
      { kind: 'sign', x: 300, z: .88, text: 'CREASEWOOD. Stay on the trail.\n(Someone has scratched under this: "the trail moved".)' },
      { kind: 'shop', x: 1600, z: .4, shop: 'creasewood_camp', label: 'Basket', sprite: 'crate' }
    ],
    foes: [
      { id: 'f1', type: 'snapleaf', x: 620, z: .6, patrol: 90, group: ['snapleaf'], killFlag: 'cw1_f1' },
      { id: 'f2', type: 'snapleaf', x: 1000, z: .52, patrol: 110, group: ['snapleaf', 'crumple'], killFlag: 'cw1_f2' },
      { id: 'f3', type: 'thornhopper', x: 1420, z: .64, patrol: 120, group: ['thornhopper', 'snapleaf'], killFlag: 'cw1_f3' }
    ],
    npcs: [
      {
        id: 'camper', sprite: 'villager_d', x: 1600, z: .56, name: 'Basket Keeper',
        script: [['say', 'villager_d', 'You are going deeper in? Buy something first. It makes me feel better about it.'], ['shop', 'creasewood_camp']]
      }
    ],
    triggers: [
      {
        x: 380, z: .6, w: 90, d: 1.2, once: true, flag: 'tr_ch1',
        script: [
          ['chapter', 1, 'The Thorn Marionette', 'Creasewood, and the thing pulling its strings'],
          ['say', 'twigby', 'Trail\'s this way. Stomp things by jumping on them — press <c:#c8443c>Z</c>. Swing the mallet with <c:#c8443c>X</c>.'],
          ['say', 'twigby', 'Hit a foe out here before it touches you and you get a <c:#4fae62>First Strike</c>. Let it touch you first and, well. You will find out.']
        ]
      },
      {
        x: 620, z: .6, w: 60, d: 1.2, once: true, flag: 'tr_battle_tut',
        script: [
          ['say', 'twigby', 'Snapleaf. Six HP, no defence, all attitude. In the fight, pick <c:#4fae62>Study</c> from my Abilities — it reads them out properly.'],
          ['say', 'sys', 'In battle: press <c:#c8443c>Z</c> at the right moment on every attack. A <c:#f5c02e>PERFECT</c> opens a window — tap <c:#c8443c>X</c> right after for a <c:#f07a8a>STYLISH</c> finish.'],
          ['say', 'sys', 'On defence, press <c:#c8443c>Z</c> just before a hit to <c:#57b8ea>Guard</c>. Press <c:#c8443c>X</c> even later to <c:#ffe066>Superguard</c> and take nothing at all.']
        ]
      }
    ]
  });

  M('cw_glade', {
    name: 'Sunken Glade', chapter: 1, music: 'forest', theme: 'forest', battleBg: 'forest',
    bounds: { x0: 0, x1: 1700, z0: .12, z1: .95 },
    spawns: { default: { x: 90, z: .6 }, west: { x: 60, z: .6 }, east: { x: 1640, z: .6, face: 'left' }, top: { x: 900, z: .3 } },
    exits: [
      { x: 8, z: .6, w: 40, d: 1, to: 'cw_trail', spawn: 'east' },
      { x: 1688, z: .6, w: 40, d: 1, to: 'cw_hollow', spawn: 'west' }
    ],
    props: [
      { sprite: 'tree_round', x: 200, z: .12 }, { sprite: 'tree_round', x: 700, z: .1, scale: 1.15 },
      { sprite: 'tree_pine', x: 1180, z: .14 }, { sprite: 'tree_round', x: 1560, z: .12 },
      { sprite: 'bush', x: 500, z: .9 }, { sprite: 'bush', x: 1300, z: .9 },
      { sprite: 'rock', x: 340, z: .82 }, { sprite: 'coral', x: 1450, z: .86, scale: .7 }
    ],
    solids: [
      { x: 620, z: .45, w: 90, d: .28, h: 52 },
      { x: 900, z: .45, w: 90, d: .28, h: 104, id: 'high_ledge' },
      { x: 1180, z: .45, w: 90, d: .28, h: 52 }
    ],
    pits: [{ x0: 700, x1: 830, z0: .3, z1: .6, to: { x: 660, z: .75 } }],
    items: [
      { kind: 'coin', x: 620, z: .45, y: 52, amount: 4, flag: 'cw2_c1' },
      { kind: 'chest', x: 900, z: .45, y: 104, badge: 'multibounce', flag: 'cw2_ch1' },
      { kind: 'shard', x: 1500, z: .32, flag: 'cw2_shard' },
      { kind: 'coin', x: 1000, z: .8, amount: 6, flag: 'cw2_c2' }
    ],
    gizmos: [
      {
        kind: 'soil', x: 1400, z: .48, needs: 'sprout', once: true, height: 120,
        label: 'Soil',
        script: [['say', 'twigby', 'Loose soil! Stand back — this is the one thing I am unambiguously good at.']]
      },
      { kind: 'sign', x: 200, z: .88, text: 'GLADE. The stones here were steps once.\nSomeone folded them the wrong way.' },
      { kind: 'heartblock', x: 1620, z: .84 }
    ],
    foes: [
      { id: 'g1', type: 'twigling', x: 480, z: .62, patrol: 100, group: ['twigling', 'snapleaf'], killFlag: 'cw2_f1' },
      { id: 'g2', type: 'petalwisp', x: 1080, z: .7, patrol: 130, group: ['petalwisp', 'petalwisp'], killFlag: 'cw2_f2' },
      { id: 'g3', type: 'mossback', x: 1320, z: .78, patrol: 60, group: ['mossback', 'thornhopper'], killFlag: 'cw2_f3' }
    ],
    triggers: [{
      x: 1400, z: .6, w: 70, d: 1.2, once: true, flag: 'tr_sprout',
      script: [
        ['say', 'twigby', 'Hold on. That patch of soil — I can work with that.'],
        ['say', 'sys', 'Press <c:#c8443c>C</c> near loose soil and Twigby grows a vine you can climb.']
      ]
    }]
  });

  M('cw_hollow', {
    name: 'Root Hollow', chapter: 1, music: 'forest', theme: 'cave', battleBg: 'forest', dark: false,
    bounds: { x0: 0, x1: 1500, z0: .15, z1: .92 },
    spawns: { default: { x: 90, z: .6 }, west: { x: 60, z: .6 }, east: { x: 1440, z: .6, face: 'left' } },
    exits: [
      { x: 8, z: .6, w: 40, d: 1, to: 'cw_glade', spawn: 'east' },
      {
        x: 1488, z: .6, w: 40, d: 1, to: 'cw_gate', spawn: 'west',
        needsFlag: 'cw_thistle_down', lockedMsg: 'The way on is blocked by something enormous and covered in thorns.'
      }
    ],
    props: [
      { sprite: 'rock', x: 240, z: .2 }, { sprite: 'rock', x: 620, z: .16, scale: 1.2 },
      { sprite: 'rock', x: 1100, z: .18 }, { sprite: 'bush', x: 400, z: .9 },
      { sprite: 'crate', x: 860, z: .84 }, { sprite: 'barrel', x: 910, z: .88 }
    ],
    solids: [
      { x: 500, z: .48, w: 80, d: .26, h: 46 },
      { x: 1240, z: .5, w: 100, d: .3, h: 64 }
    ],
    items: [
      { kind: 'chest', x: 500, z: .48, y: 46, item: 'emberpod', flag: 'cw3_ch1' },
      { kind: 'coin', x: 780, z: .72, amount: 5, flag: 'cw3_c1' },
      { kind: 'chest', x: 1240, z: .5, y: 64, item: 'lifeleaf', flag: 'cw3_ch2' }
    ],
    gizmos: [
      { kind: 'save', x: 150, z: .84 },
      { kind: 'sign', x: 300, z: .86, text: 'Scratched into the root: "IT ISN\'T THE PUPPET. LOOK UP."' }
    ],
    foes: [
      { id: 'h1', type: 'barkbug', x: 640, z: .6, patrol: 110, group: ['barkbug', 'twigling'], killFlag: 'cw3_f1' },
      { id: 'h2', type: 'thornhopper', x: 1000, z: .68, patrol: 90, group: ['thornhopper', 'thornhopper', 'snapleaf'], killFlag: 'cw3_f2' },
      {
        id: 'thistle', type: 'thistleguard', x: 1380, z: .6, patrol: 0, chase: false, boss: true,
        group: ['thistleguard'], killFlag: 'cw_thistle_down',
        cfg: {
          boss: true, noRun: true, music: 'boss',
          introLine: 'Thistleguard: "GATE. CLOSED. GO. AWAY."',
          introSpeaker: 'Thistleguard', introPortrait: 'thistleguard'
        },
        onWin: [
          ['say', 'twigby', 'Told you. Fire strips the thorns and then it is just a very large angry hedge.'],
          ['say', 'narr', 'The thicket gate creaks open a hand\'s width. Beyond it, the woods are much too quiet.'],
          ['give', 'reamcake'], ['shard', 1]
        ]
      }
    ],
    triggers: [{
      x: 1200, z: .6, w: 80, d: 1.2, once: true, flag: 'tr_thistle',
      script: [
        ['music', 'tense'],
        ['say', 'twigby', 'That is Thistleguard. That is a LOT of thorns. Do NOT stomp it — use the mallet, or burn the thorns off first.'],
        ['say', 'pip', 'Noted. Everything about that is noted.']
      ]
    }]
  });

  M('cw_gate', {
    name: 'The Thicket Gate', chapter: 1, music: 'forest', theme: 'forest', battleBg: 'forest',
    bounds: { x0: 0, x1: 1400, z0: .14, z1: .92 },
    spawns: { default: { x: 90, z: .6 }, west: { x: 60, z: .6 }, east: { x: 1340, z: .6, face: 'left' } },
    exits: [
      { x: 8, z: .6, w: 40, d: 1, to: 'cw_hollow', spawn: 'east' },
      {
        x: 1388, z: .6, w: 40, d: 1, to: 'cw_heart', spawn: 'west',
        needsKey: 'crease_key', lockedMsg: 'The gate is stitched shut with a knot the size of your head. There must be a key.'
      }
    ],
    props: [
      { sprite: 'tree_pine', x: 180, z: .14 }, { sprite: 'tree_pine', x: 420, z: .12, scale: 1.2 },
      { sprite: 'tree_round', x: 900, z: .1 }, { sprite: 'pillar', x: 1290, z: .22 }, { sprite: 'pillar', x: 1290, z: .88 },
      { sprite: 'bush', x: 640, z: .9 }, { sprite: 'rock', x: 1080, z: .86 }
    ],
    solids: [
      { x: 700, z: .42, w: 80, d: .26, h: 58 },
      { x: 1000, z: .38, w: 80, d: .26, h: 116, id: 'gate_ledge' }
    ],
    items: [
      { kind: 'chest', x: 1000, z: .38, y: 116, key: 'crease_key', flag: 'cw4_key' },
      { kind: 'coin', x: 560, z: .74, amount: 8, flag: 'cw4_c1' }
    ],
    gizmos: [
      {
        kind: 'soil', x: 860, z: .4, needs: 'sprout', once: true, height: 124,
        script: [['say', 'twigby', 'Up we go. The key is on that ledge — I can see the shine from here.']]
      },
      { kind: 'save', x: 150, z: .84 },
      { kind: 'sign', x: 1200, z: .86, text: 'CREASEWOOD HEART — CLOSED\nBy order of nobody in particular. The knot did it itself.' }
    ],
    foes: [
      { id: 'gt1', type: 'petalwisp', x: 520, z: .56, patrol: 120, group: ['petalwisp', 'twigling', 'snapleaf'], killFlag: 'cw4_f1' },
      { id: 'gt2', type: 'mossback', x: 1120, z: .66, patrol: 80, group: ['mossback', 'barkbug'], killFlag: 'cw4_f2' }
    ],
    npcs: [{
      id: 'courier_ghost', sprite: 'courier_nib', x: 300, z: .66, name: '?',
      script: function () {
        var S = PB.State;
        if (S.questState('missing_courier') === 'done') return [['say', 'courier_nib', 'Tell Quillton I am fine. Tell them slowly, they worry.']];
        return [
          ['say', 'courier_nib', 'Another courier. Of course. They always send another courier.'],
          ['say', 'pip', 'You are the one who went missing on this road.'],
          ['say', 'courier_nib', 'I did not go missing. I went QUIET. There is a difference and it kept me alive.'],
          ['say', 'courier_nib', 'The thing in the heart of the wood is not the puppet. Look at the strings. Follow them up.'],
          ['quest', 'missing_courier', 'done', 'Return to Sender'],
          ['shard', 1]
        ];
      }
    }]
  });

  /* ======================================================================
     THE FOLDHEIM ROAD — the hub every chapter branches off
     ====================================================================== */
  (function () {
    var BRANCH = [
      { ch: 1, x: 420, to: 'cw_trail', name: 'Creasewood', flag: null },
      { ch: 2, x: 880, to: 'em_gate', name: 'Emberfold', flag: 'ch1_done' },
      { ch: 3, x: 1340, to: 'sg_docks', name: 'Sogport', flag: 'ch2_done' },
      { ch: 4, x: 1800, to: 'cc_gates', name: 'Cardstock Carnival', flag: 'ch3_done' },
      { ch: 5, x: 2260, to: 'gh_steps', name: 'Glyphhaven', flag: 'ch4_done' },
      { ch: 6, x: 2720, to: 'ff_pass', name: 'Frostfold', flag: 'ch5_done' },
      { ch: 7, x: 3180, to: 'fw_gate', name: 'Foilworks', flag: 'ch6_done' },
      { ch: 8, x: 3640, to: 'sc_bridge', name: 'Smudge Citadel', flag: 'ch7_done' }
    ];
    var spawns = { default: { x: 100, z: .6 }, west: { x: 70, z: .6 }, east: { x: 4050, z: .6, face: 'left' } };
    var exits = [{ x: 8, z: .6, w: 40, d: 1, to: 'quill_gate', spawn: 'east' }];
    var props = [], gizmos = [], npcs = [];
    BRANCH.forEach(function (b) {
      spawns['ch' + b.ch] = { x: b.x, z: .62 };
      exits.push({
        x: b.x, z: .18, w: 70, d: .3, door: true, to: b.to, spawn: 'west',
        needsFlag: b.flag, lockedMsg: 'That road is not yours yet. One seal at a time.'
      });
      props.push({ sprite: 'pillar', x: b.x - 52, z: .1, scale: .7 });
      props.push({ sprite: 'pillar', x: b.x + 52, z: .1, scale: .7 });
      gizmos.push({
        kind: 'sign', x: b.x, z: .8,
        text: 'CHAPTER ' + b.ch + ' — ' + b.name.toUpperCase() + '\nThe path north. ' +
          (b.flag ? 'Sealed until the road behind you is finished.' : 'Open.')
      });
    });
    props.push({ sprite: 'tree_round', x: 200, z: .06 }, { sprite: 'tree_pine', x: 1100, z: .05 },
      { sprite: 'rock', x: 1600, z: .88 }, { sprite: 'tree_round', x: 2500, z: .06 },
      { sprite: 'icechunk', x: 2900, z: .86 }, { sprite: 'gear', x: 3300, z: .86 },
      { sprite: 'inkpool', x: 3800, z: .84 }, { sprite: 'lamp', x: 640, z: .86 },
      { sprite: 'lamp', x: 2040, z: .86 }, { sprite: 'lamp', x: 3420, z: .86 });
    gizmos.push({ kind: 'save', x: 160, z: .84 }, { kind: 'heartblock', x: 240, z: .84 });
    gizmos.push({ kind: 'save', x: 2040, z: .84 }, { kind: 'heartblock', x: 2120, z: .84 });
    gizmos.push({
      kind: 'sign', x: 3960, z: .8,
      text: 'THE FOLDED COLISEUM →\nTwenty ranks. No refunds. No mercy. Excellent seating.'
    });
    exits.push({
      x: 4090, z: .6, w: 40, d: 1, to: 'cl_lobby', spawn: 'west',
      needsFlag: 'ch3_done', lockedMsg: 'The Coliseum opens to fighters with at least three seals to their name.'
    });
    npcs.push({
      id: 'road_nib', sprite: 'courier_nib', x: 1000, z: .7, name: 'Nib',
      script: function () {
        var c = PB.State.get().chapter;
        var lines = [
          'Nib. Courier, same as you. Different employer, sadly.',
          'The Duke keeps a list. You are on it now. Congratulations, I suppose.',
          'Sogport is drowning and nobody there will say the word "flood".',
          'The Carnival is still running shows. That is the frightening part.',
          'Glyphhaven has stopped lending books. Glyphhaven has never stopped lending books.',
          'Frostfold has gone quiet under the snow. That is normal. The quiet is not.',
          'They are building something in the Foilworks. Big. Loud. Numbered.',
          'The Citadel is not a building, Pip. It is a full stop.'
        ];
        return [['say', 'courier_nib', lines[PB.U.clamp(c - 1, 0, lines.length - 1)]]];
      }
    });
    M('foldheim_road', {
      name: 'The Foldheim Road', chapter: 1, music: 'town', theme: 'town', battleBg: 'forest',
      bounds: { x0: 0, x1: 4100, z0: .14, z1: .92 },
      spawns: spawns, exits: exits, props: props, gizmos: gizmos, npcs: npcs,
      items: [
        { kind: 'coin', x: 700, z: .5, amount: 5, flag: 'fr_c1' },
        { kind: 'coin', x: 2400, z: .5, amount: 10, flag: 'fr_c2' },
        { kind: 'chest', x: 3000, z: .3, item: 'grandfeast', flag: 'fr_ch1' }
      ],
      foes: [
        { id: 'rd1', type: 'crumple', x: 1500, z: .62, patrol: 120, group: ['crumple', 'crumple'], killFlag: 'fr_f1' },
        { id: 'rd2', type: 'wadball', x: 2600, z: .6, patrol: 140, group: ['wadball', 'crumple'], killFlag: 'fr_f2' }
      ]
    });
  })();

  M('cw_heart', {
    name: 'Heart of Creasewood', chapter: 1, music: 'tense', theme: 'forest', battleBg: 'forest',
    bounds: { x0: 0, x1: 1200, z0: .2, z1: .9 },
    spawns: { default: { x: 90, z: .6 }, west: { x: 60, z: .6 } },
    exits: [{ x: 8, z: .6, w: 40, d: 1, to: 'cw_gate', spawn: 'east' }],
    props: [
      { sprite: 'tree_round', x: 240, z: .1, scale: 1.3 }, { sprite: 'tree_round', x: 960, z: .1, scale: 1.3 },
      { sprite: 'tree_pine', x: 600, z: .08, scale: 1.5 },
      { sprite: 'rock', x: 380, z: .84 }, { sprite: 'rock', x: 820, z: .86 }
    ],
    gizmos: [{ kind: 'save', x: 140, z: .82 }, { kind: 'heartblock', x: 240, z: .82 }],
    triggers: [{
      x: 620, z: .6, w: 100, d: 1.4, once: true, flag: 'tr_bramble',
      script: [
        ['camera', 800, 50],
        ['say', 'narr', 'The clearing is full of strings. They come down out of the canopy and end, all of them, in one thing.'],
        ['spawn', { id: 'bj', sprite: 'bramblejack', x: 880, z: .55, name: 'Bramblejack', face: 'left' }],
        ['sfx', 'roar'], ['shake', 16],
        ['sayx', 'Bramblejack', 'bramblejack', 'MINE. THE BRIGHT THING IS MINE. I FOUND IT AND IT MADE ME <s>REAL</s>.', 'boss'],
        ['say', 'twigby', 'Pip — the seal. It has the seal, it has it INSIDE it—'],
        ['say', 'pip', 'Bramblejack. Who tied the strings?'],
        ['sayx', 'Bramblejack', 'bramblejack', '...WHAT?', 'boss'],
        ['say', 'pip', 'Someone is holding the other end. You know that. You have always known that.'],
        ['sayx', 'Bramblejack', 'bramblejack', 'NO ONE HOLDS ME. I DANCE BECAUSE I <s>WANT</s> TO.', 'boss'],
        ['say', 'narr', 'High above, in the dark of the canopy, something adjusts its grip.'],
        ['music', 'boss'],
        ['battle', {
          enemies: ['bramblejack'], boss: true, noRun: true, bg: 'forest', music: 'boss'
        }, [
          ['despawn', 'bj'],
          ['music', 'sad'],
          ['say', 'narr', 'The strings go slack. Bramblejack folds down into the leaf litter, one crease at a time, until there is only a shape.'],
          ['sayx', 'Bramblejack', 'bramblejack', 'i... was going to be... a real thing...', 'boss'],
          ['say', 'pip', 'You were. Somebody just did not let you finish.'],
          ['wait', 40],
          ['sfx', 'seal'],
          ['title', 'SEAL I RECOVERED', 110],
          ['givekey', 'seal1'],
          ['seal', 'seal_refold'],
          ['say', 'sys', 'Seal Power learned: <c:#f5c02e>Refold</c> — restores 10 HP to you and your partner.\nSeal Energy fills as you fight; <c:#4fae62>Appeal</c> in Tactics tops it up.'],
          ['music', 'forest'],
          ['say', 'twigby', 'One down. Six to go, and six is not that many. Six is basically nothing.'],
          ['say', 'pip', 'Six is six, Twigby.'],
          ['say', 'twigby', 'Six is basically nothing, Pip.'],
          ['wait', 20],
          ['say', 'narr', 'A single thread of the marionette\'s string is still taut. It runs east, out of the wood, towards a red smudge on the horizon that might be sunset and is not.'],
          ['flag', 'ch1_done', true],
          ['chapterset', 2],
          ['rankup', 'twigby'],
          ['form', 'form_fortress'],
          ['say', 'sys', 'New Origami Form: <c:#57b8ea>Fortress</c>. Twigby reached Rank 2 and learned <c:#4fae62>Thornshot</c>.'],
          ['heal'],
          ['goto', 'foldheim_road', 'ch1'],
          ['say', 'twigby', 'Emberfold, then. East and down. Bring something to drink.']
        ]]
      ]
    }]
  });
})();

/* ===== 22_mapkit.js ===== */
/* ==========================================================================
   PAPERBOUND — 22_mapkit.js
   Authoring helpers for the chapter files. Chapters are mostly linear, so
   `chain()` wires up the west/east exits and spawns automatically and lets
   each map file concentrate on what is actually in the room.
   ========================================================================== */
'use strict';

PB.MapKit = (function () {
  var U = PB.U, M = PB.Maps.define;

  /* chain(defaults, [ {id, name, w, ...}, ... ] )
     - map[0] gets its west exit from `defaults.entryWest` ({to, spawn})
     - every other map's west exit goes back to the previous map's 'east' spawn
     - every map except the last gets an east exit to the next map's 'west'
     - `eastLock` on a map applies needsKey / needsFlag / lockedMsg to its east exit
     - `noEast` suppresses the auto east exit (for boss rooms reached by script) */
  function chain(defaults, list) {
    list.forEach(function (m, i) {
      var prev = list[i - 1], next = list[i + 1];
      var w = m.w || 1600;
      var z1 = m.z1 === undefined ? .93 : m.z1;
      var z0 = m.z0 === undefined ? .12 : m.z0;

      var spawns = U.extend({
        default: { x: 100, z: .6 },
        west: { x: 60, z: .6 },
        east: { x: w - 60, z: .6, face: 'left' }
      }, m.spawns || {});

      var exits = [];
      if (i === 0 && defaults.entryWest) {
        exits.push({ x: 8, z: .6, w: 40, d: 1, to: defaults.entryWest.to, spawn: defaults.entryWest.spawn });
      } else if (prev) {
        exits.push({ x: 8, z: .6, w: 40, d: 1, to: prev.id, spawn: 'east' });
      }
      if (next && !m.noEast) {
        exits.push(U.extend({ x: w - 12, z: .6, w: 40, d: 1, to: next.id, spawn: 'west' }, m.eastLock || {}));
      }
      (m.exits || []).forEach(function (e) { exits.push(e); });

      M(m.id, {
        name: m.name,
        chapter: m.chapter === undefined ? defaults.chapter : m.chapter,
        music: m.music || defaults.music,
        theme: m.theme || defaults.theme,
        battleBg: m.battleBg || defaults.battleBg,
        dark: !!m.dark,
        bounds: { x0: 0, x1: w, z0: z0, z1: z1 },
        spawns: spawns,
        exits: exits,
        solids: m.solids || [],
        props: m.props || [],
        npcs: m.npcs || [],
        foes: m.foes || [],
        items: m.items || [],
        gizmos: m.gizmos || [],
        triggers: m.triggers || [],
        water: m.water || [],
        pits: m.pits || [],
        onEnter: m.onEnter || []
      });
    });
  }

  /* A tidy save-and-heal rest stop. */
  function rest(x, z) {
    return [{ kind: 'save', x: x, z: z === undefined ? .84 : z },
      { kind: 'heartblock', x: x + 80, z: z === undefined ? .84 : z }];
  }

  /* Scenery filler: n props of the given kinds spread across the width. */
  function scatter(sprites, n, w, band) {
    var out = [];
    for (var i = 0; i < n; i++) {
      out.push({
        sprite: sprites[i % sprites.length],
        x: 120 + (i * (w - 240)) / Math.max(1, n - 1),
        z: band === 'front' ? .86 + (i % 3) * .03 : .06 + (i % 4) * .05,
        scale: .9 + (i % 3) * .1
      });
    }
    return out;
  }

  /* The standard "boss room" trigger: dialogue, fight, payout. */
  function bossTrigger(o) {
    return {
      x: o.x, z: .6, w: 110, d: 1.4, once: true, flag: o.flag,
      script: [['camera', o.x + 190, 48]]
        .concat(o.before || [])
        .concat([['spawn', { id: o.entId, sprite: o.sprite, x: o.x + 260, z: .55, name: o.name, face: 'left' }]])
        .concat([['sfx', 'roar'], ['shake', 16]])
        .concat(o.lines || [])
        .concat([['music', o.music || 'boss']])
        .concat([['battle', {
          enemies: [o.enemy], boss: true, noRun: true,
          bg: o.bg || 'stage', music: o.music || 'boss'
        }, [['despawn', o.entId]].concat(o.after || [])]])
    };
  }

  return { chain: chain, rest: rest, scatter: scatter, bossTrigger: bossTrigger };
})();

/* ===== 23_maps_ch23.js ===== */
/* ==========================================================================
   PAPERBOUND — 23_maps_ch23.js
   CHAPTER 2 — Emberfold      CHAPTER 3 — Sogport & the Sunken Ream
   ========================================================================== */
'use strict';

(function () {
  var K = PB.MapKit, Shop = PB.Menus.defineShop, St = PB.State;

  /* ======================================================================
     CHAPTER 2 — EMBERFOLD
     ====================================================================== */
  Shop('cinderhall_forge', {
    name: 'The Slack Tub', keeper: 'miner_grit',
    greeting: 'Everything here is either hot or was recently. Mind your fingers.',
    stock: ['pulpberry', 'reamcake', 'honeyleaf', 'drycloth', 'emberpod', 'wadbomb', 'boldbrew', 'escapenote']
  });

  K.chain(
    { chapter: 2, music: 'ember', theme: 'ember', battleBg: 'ember', entryWest: { to: 'foldheim_road', spawn: 'ch2' } },
    [
      {
        id: 'em_gate', name: 'Emberfold Gate', w: 1400,
        props: K.scatter(['rock', 'brazier', 'rock'], 6, 1400).concat(K.scatter(['rock'], 3, 1400, 'front')),
        gizmos: K.rest(140).concat([
          { kind: 'sign', x: 420, z: .86, text: 'EMBERFOLD — CINDERHALL AHEAD\nDo not bring paper. (This is a joke the locals are tired of.)' }
        ]),
        items: [{ kind: 'coin', x: 700, z: .5, amount: 5, flag: 'em1_c1' }],
        foes: [{ id: 'em1a', type: 'emberling', x: 900, z: .6, patrol: 110, group: ['emberling', 'crumple'], killFlag: 'em1_f1' }],
        triggers: [{
          x: 320, z: .6, w: 100, d: 1.4, once: true, flag: 'tr_ch2',
          script: [
            ['chapter', 2, 'The Cinder Duchess', 'Emberfold, where paper is a bad idea'],
            ['say', 'twigby', 'Right. Everything down here is on fire and I am made of wood. I want that on the record.'],
            ['say', 'pip', 'Noted in the log.'],
            ['say', 'twigby', 'There is no log.'],
            ['say', 'pip', 'There is now.']
          ]
        }]
      },
      {
        id: 'em_road', name: 'Slagstone Road', w: 1800,
        props: K.scatter(['rock', 'brazier'], 8, 1800).concat([{ sprite: 'barrel', x: 1600, z: .88 }]),
        solids: [
          { x: 620, z: .44, w: 90, d: .28, h: 54 },
          { x: 900, z: .44, w: 90, d: .28, h: 108, id: 'em_ledge' },
          { x: 1180, z: .44, w: 90, d: .28, h: 54 }
        ],
        pits: [{ x0: 700, x1: 830, z0: .3, z1: .58, to: { x: 660, z: .76 } }],
        items: [
          { kind: 'coin', x: 620, z: .44, y: 54, amount: 4, flag: 'em2_c1' },
          { kind: 'chest', x: 900, z: .44, y: 108, item: 'emberpod', flag: 'em2_ch1' },
          { kind: 'chest', x: 1700, z: .3, badge: 'fpplus', flag: 'em2_ch2' }
        ],
        foes: [
          { id: 'em2a', type: 'magmite', x: 480, z: .64, patrol: 100, group: ['magmite', 'emberling'], killFlag: 'em2_f1' },
          { id: 'em2b', type: 'cinderfly', x: 1080, z: .7, patrol: 140, group: ['cinderfly', 'cinderfly'], killFlag: 'em2_f2' },
          { id: 'em2c', type: 'ashgoyle', x: 1450, z: .6, patrol: 70, group: ['ashgoyle', 'emberling'], killFlag: 'em2_f3' }
        ],
        gizmos: [{ kind: 'sign', x: 220, z: .88, text: 'THE ROAD IS THE COOL PART.\nThat is not reassurance. That is just true.' }]
      },
      {
        id: 'em_cinderhall', name: 'Cinderhall', w: 1900, theme: 'interior', music: 'town',
        props: [
          { sprite: 'house_small', x: 240, z: .12 }, { sprite: 'house_small', x: 640, z: .1, scale: .95 },
          { sprite: 'house_small', x: 1500, z: .12 }, { sprite: 'anvil', x: 1080, z: .66 },
          { sprite: 'brazier', x: 140, z: .8 }, { sprite: 'brazier', x: 1780, z: .8 },
          { sprite: 'crate', x: 1240, z: .8 }, { sprite: 'barrel', x: 1290, z: .86 },
          { sprite: 'lamp', x: 420, z: .84 }, { sprite: 'lamp', x: 1160, z: .84 }
        ],
        gizmos: K.rest(180).concat([
          { kind: 'shop', x: 700, z: .44, shop: 'cinderhall_forge', label: 'Shop', sprite: 'shop_stall', scale: .8 },
          { kind: 'cook', x: 1000, z: .58, label: 'Cook', sprite: 'barrel' },
          { kind: 'inn', x: 1500, z: .44, price: 8, label: 'Rest', sprite: 'house_small', scale: .8 },
          { kind: 'sign', x: 380, z: .88, text: 'CINDERHALL. Population: whoever did not move away.\nThe Duchess keeps the furnaces lit. Nobody asks how.' }
        ]),
        items: [
          { kind: 'coin', x: 860, z: .78, amount: 6, flag: 'em3_c1' },
          { kind: 'chest', x: 1820, z: .3, item: 'foldroll', flag: 'em3_ch1' }
        ],
        npcs: [
          {
            id: 'lamplighter', sprite: 'villager_a', x: 520, z: .68, name: 'Lamplighter Tallow',
            script: function () {
              if (St.questState('lantern_oil') === 'done') return [['say', 'villager_a', 'Every lamp on the street is lit. First time in two years. You will forgive me if I stand here and look at them.']];
              if (St.questState('lantern_oil') === 'open' && St.hasKey('lantern_oil')) return [
                ['say', 'villager_a', 'Oil. Real oil. Where — no. No, I do not want to know.'],
                ['takekey', 'lantern_oil'],
                ['badge', 'fireshield'],
                ['quest', 'lantern_oil', 'done', 'Keeping the Light'],
                ['say', 'villager_a', 'Take this. Ember Shield. Pin it on and stomping a burning thing stops costing you skin.']
              ];
              return [
                ['say', 'villager_a', 'Half the street is dark. I have wicks, I have lamps, I have no oil.'],
                ['say', 'villager_a', 'The foundry keeps drums of it. The foundry also keeps things that bite. You look like you bite back.'],
                ['quest', 'lantern_oil', 'start']
              ];
            }
          },
          {
            id: 'em_smith', sprite: 'smith_deckle', x: 1080, z: .78, name: 'Forgehand Bick',
            script: [
              ['say', 'smith_deckle', 'Deckle up in Quillton? Ha. Tell him his tempering is still soft.'],
              ['say', 'smith_deckle', 'There is a bar of proper foundry steel in the vents. If you get it out, take it to him. He will pretend he is not pleased.']
            ]
          },
          {
            id: 'em_kid', sprite: 'kid_dot', x: 900, z: .86, name: 'Soot', wander: 50,
            script: [['say', 'kid_dot', 'The Duchess came through last winter and the furnaces went up and everyone got warm and nobody has said thank you.'], ['say', 'kid_dot', 'I said thank you. She did not hear me.']]
          },
          {
            id: 'em_gran', sprite: 'grandma_creased', x: 1500, z: .58, name: 'Kettle',
            script: [['say', 'grandma_creased', 'Eight coins. The beds are warm whether you pay or not, but I like to be asked.'], ['inn', 8]]
          },
          {
            id: 'em_scholar', sprite: 'scholar_ibis', x: 1660, z: .7, name: 'Assayer Flint',
            script: [['say', 'scholar_ibis', 'A fragment of the Crown fell into the furnace court six days ago. The heat has not dropped since.'], ['say', 'scholar_ibis', 'She is not hoarding it out of malice. She is hoarding it because it is warm and she is very, very tired.']]
          }
        ]
      },
      {
        id: 'em_foundry', name: 'The Foundry Floor', w: 1900, theme: 'volcano', dark: true,
        props: K.scatter(['brazier', 'gear', 'barrel', 'anvil'], 7, 1900),
        solids: [
          { x: 700, z: .44, w: 100, d: .3, h: 60 },
          { x: 1120, z: .44, w: 100, d: .3, h: 60 },
          { x: 1420, z: .5, w: 120, d: .34, h: 0, id: 'em_burnt', hidden: true }
        ],
        items: [
          { kind: 'chest', x: 700, z: .44, y: 60, item: 'drycloth', flag: 'em4_ch1' },
          { kind: 'coin', x: 980, z: .74, amount: 8, flag: 'em4_c1' },
          { kind: 'chest', x: 1820, z: .32, key: 'lantern_oil', flag: 'em4_oil' },
          { kind: 'shard', x: 1560, z: .8, flag: 'em4_shard' }
        ],
        gizmos: [
          {
            kind: 'seam', x: 1300, z: .5, needs: 'light', once: true, reveals: 'em_burnt',
            label: 'Burn through',
            script: [['say', 'lumen', 'Stand back. This is the only rude thing I do.'], ['say', 'narr', 'The paper barrier goes up in one clean sheet of flame and leaves a walkable floor behind.']]
          },
          { kind: 'sign', x: 240, z: .88, text: 'FOUNDRY FLOOR — LIGHTS OUT SINCE THE FIRE\nBring your own.' }
        ],
        foes: [
          { id: 'em4a', type: 'wickling', x: 520, z: .6, patrol: 90, group: ['wickling', 'emberling'], killFlag: 'em4_f1' },
          { id: 'em4b', type: 'slagmaw', x: 1000, z: .66, patrol: 100, group: ['slagmaw', 'cinderfly'], killFlag: 'em4_f2' },
          { id: 'em4c', type: 'ashgoyle', x: 1680, z: .62, patrol: 80, group: ['ashgoyle', 'magmite', 'emberling'], killFlag: 'em4_f3' }
        ],
        triggers: [{
          x: 300, z: .6, w: 90, d: 1.4, once: true, flag: 'tr_lumen',
          script: [
            ['say', 'narr', 'The floor is pitch dark except for one small steady light, sitting exactly where it has always sat.'],
            ['spawn', { id: 'lum', sprite: 'lumen', x: 470, z: .58, name: 'Lumen' }],
            ['wait', 30],
            ['say', 'lumen', 'You are the first thing to come through that door in four hundred years that was not on fire.'],
            ['say', 'pip', 'You have been lit this whole time?'],
            ['say', 'lumen', 'I was lit before the furnaces. I am the reference flame. If I go out, they have nothing to relight from, so I do not go out.'],
            ['say', 'lumen', 'Four hundred years, and nothing to read by but my own light. Do you know how that is? No. Nobody does.'],
            ['say', 'pip', 'Come with us, then. There is a lot to look at and most of it is trying to kill me.'],
            ['say', 'lumen', 'I have been burning for four hundred years with nothing to read by. Take me somewhere with a view.'],
            ['despawn', 'lum'],
            ['partner', 'lumen'],
            ['wait', 20],
            ['say', 'sys', 'Lumen joined you.\n<c:#c8443c>C</c> lights a dark room, and burns away paper barriers.\nIn battle, <c:#ff7a2e>Flare</c> reaches fliers and <c:#4fae62>Kindle</c> raises an ally\'s Attack.'],
            ['say', 'twigby', 'Oh good. A partner made of fire. For me. Specifically.']
          ]
        }]
      },
      {
        id: 'em_vents', name: 'The Vents', w: 1700, theme: 'volcano',
        eastLock: { needsKey: 'emberkey', lockedMsg: 'The furnace door is locked and the lock is glowing. There is a key somewhere hotter.' },
        props: K.scatter(['gear', 'rock', 'brazier'], 6, 1700),
        solids: [
          { x: 560, z: .42, w: 90, d: .28, h: 56 },
          { x: 860, z: .42, w: 90, d: .28, h: 112 },
          { x: 1160, z: .42, w: 90, d: .28, h: 56 }
        ],
        pits: [{ x0: 640, x1: 780, z0: .28, z1: .56, to: { x: 600, z: .76 } },
          { x0: 940, x1: 1080, z0: .28, z1: .56, to: { x: 900, z: .76 } }],
        items: [
          { kind: 'chest', x: 860, z: .42, y: 112, key: 'foundry_steel', flag: 'em5_steel' },
          { kind: 'coin', x: 1300, z: .78, amount: 10, flag: 'em5_c1' }
        ],
        gizmos: [{ kind: 'save', x: 160, z: .84 }, { kind: 'sign', x: 300, z: .88, text: 'MIND THE VENTS.\nThe vents do not mind you.' }],
        foes: [
          { id: 'em5a', type: 'cinderfly', x: 700, z: .7, patrol: 130, group: ['cinderfly', 'wickling'], killFlag: 'em5_f1' },
          {
            id: 'em5boss', type: 'wick_and_wisp', x: 1520, z: .6, patrol: 0, chase: false, boss: true,
            group: ['wick_and_wisp'], killFlag: 'em_wick_down',
            cfg: {
              boss: true, noRun: true, music: 'boss',
              introLine: 'Wick & Wisp: "TWO of us. ONE lamp. Do NOT try to work it out."',
              introSpeaker: 'Wick & Wisp', introPortrait: 'wick_and_wisp'
            },
            onWin: [
              ['say', 'lumen', 'Wick and Wisp. They were lit off me, you know. They never once said so.'],
              ['givekey', 'emberkey'],
              ['say', 'narr', 'The furnace key drops out of the flame, still too hot to be polite about.']
            ]
          }
        ],
        triggers: [{
          x: 1340, z: .6, w: 90, d: 1.4, once: true, flag: 'tr_wick',
          script: [
            ['music', 'tense'],
            ['say', 'lumen', 'Ah. The twins. Airborne and burning, so the mallet is useless and stomping will cost you.'],
            ['say', 'twigby', 'What DOES work?'],
            ['say', 'lumen', 'Water. Which we do not have. So: hit them from range and do not be brave.']
          ]
        }]
      },
      {
        id: 'em_furnace', name: 'The Great Furnace', w: 1500, theme: 'volcano',
        props: K.scatter(['brazier', 'gear'], 6, 1500).concat([{ sprite: 'pillar', x: 1380, z: .2 }, { sprite: 'pillar', x: 1380, z: .86 }]),
        solids: [{ x: 640, z: .46, w: 100, d: .3, h: 64 }, { x: 1000, z: .46, w: 100, d: .3, h: 64 }],
        items: [
          { kind: 'chest', x: 640, z: .46, y: 64, item: 'ironsheet', flag: 'em6_ch1' },
          { kind: 'chest', x: 1000, z: .46, y: 64, badge: 'firemallet', flag: 'em6_ch2' }
        ],
        gizmos: K.rest(160).concat([
          {
            kind: 'seam', x: 820, z: .8, needs: 'light', once: true,
            label: 'Burn through',
            script: [['coins', 25], ['say', 'lumen', 'Somebody hid their wages behind a paper screen in a furnace. I admire the confidence.']]
          }
        ]),
        foes: [
          { id: 'em6a', type: 'magmite', x: 500, z: .66, patrol: 90, group: ['magmite', 'magmite', 'emberling'], killFlag: 'em6_f1' },
          { id: 'em6b', type: 'slagmaw', x: 1180, z: .62, patrol: 90, group: ['slagmaw', 'ashgoyle'], killFlag: 'em6_f2' }
        ]
      },
      {
        id: 'em_court', name: 'The Furnace Court', w: 1300, music: 'tense', theme: 'volcano',
        props: [
          { sprite: 'pillar', x: 200, z: .14 }, { sprite: 'pillar', x: 1120, z: .14 },
          { sprite: 'brazier', x: 340, z: .84 }, { sprite: 'brazier', x: 980, z: .84 },
          { sprite: 'banner', x: 420, z: .1 }, { sprite: 'banner', x: 900, z: .1 }
        ],
        gizmos: K.rest(150),
        triggers: [PB.MapKit.bossTrigger({
          x: 640, flag: 'tr_pyra', entId: 'pyra', sprite: 'pyra_sizzlefold',
          name: 'Duchess Pyra Sizzlefold', enemy: 'pyra_sizzlefold', bg: 'ember',
          before: [
            ['say', 'narr', 'The court is hotter than the furnace. At the centre, on a chair that was once a chair, someone is holding a piece of the Crown against her chest like a hot water bottle.']
          ],
          lines: [
            ['sayx', 'Duchess Pyra Sizzlefold', 'pyra_sizzlefold', 'You have tracked ASH across my floor.', 'boss'],
            ['say', 'pip', 'Your floor is ash.'],
            ['sayx', 'Duchess Pyra Sizzlefold', 'pyra_sizzlefold', 'It is ARRANGED ash. There is a difference and you have ruined it.', 'boss'],
            ['say', 'pip', 'I need the fragment.'],
            ['sayx', 'Duchess Pyra Sizzlefold', 'pyra_sizzlefold', 'Do you know what I do here, courier? I keep four hundred furnaces lit for a town that has never once thanked me. I have been cold for a very long time.', 'boss'],
            ['sayx', 'Duchess Pyra Sizzlefold', 'pyra_sizzlefold', 'And then this fell out of the sky. And it is WARM. And you want me to hand it over.', 'boss'],
            ['say', 'lumen', 'Duchess. I am the reference flame. You can relight from me any hour you like. You never asked.'],
            ['sayx', 'Duchess Pyra Sizzlefold', 'pyra_sizzlefold', '...No. Because asking is for people who might be told no.', 'boss'],
            ['sayx', 'Duchess Pyra Sizzlefold', 'pyra_sizzlefold', 'So we will do this the other way. Try not to catch.', 'boss']
          ],
          after: [
            ['music', 'sad'],
            ['say', 'narr', 'She sits down. Not defeated — just finally allowed to stop holding something up.'],
            ['sayx', 'Duchess Pyra Sizzlefold', 'pyra_sizzlefold', 'Take it. It was never going to keep me warm. Nothing that small ever does.', 'boss'],
            ['say', 'lumen', 'Come to Cinderhall tonight. The street lamps are being lit. All of them. People will be out.'],
            ['sayx', 'Duchess Pyra Sizzlefold', 'pyra_sizzlefold', '...I have nothing to wear.', 'boss'],
            ['say', 'lumen', 'Wear the fire. It has always suited you.'],
            ['wait', 30],
            ['sfx', 'seal'],
            ['title', 'SEAL II RECOVERED', 110],
            ['givekey', 'seal2'],
            ['seal', 'seal_ember'],
            ['flag', 'form_plane', true],
            ['say', 'sys', 'Seal Power learned: <c:#ff7a2e>Emberseal</c> — 4 fire damage to every foe.\nNew fold: <c:#8fd0f0>Paper Plane</c>. Hold <c:#c8443c>Z</c> while falling to glide.'],
            ['upgrade', 'stomp'],
            ['flag', 'ch2_done', true],
            ['chapterset', 3],
            ['heal'],
            ['music', 'ember'],
            ['say', 'twigby', 'Sogport next. Water. WATER, Pip. I have opinions about water too but they are much better opinions.'],
            ['goto', 'foldheim_road', 'ch2']
          ]
        })]
      }
    ]
  );

  /* ======================================================================
     CHAPTER 3 — SOGPORT AND THE SUNKEN REAM
     ====================================================================== */
  Shop('sogport_chandler', {
    name: 'Keel & Cable', keeper: 'sailor_keel',
    greeting: 'Everything sold wet. Discount for anything you can carry out yourself.',
    stock: ['pulpberry', 'reamcake', 'inktea', 'drycloth', 'smellingink', 'thunderrag', 'papercutstar', 'swiftdraft']
  });

  K.chain(
    { chapter: 3, music: 'harbor', theme: 'harbor', battleBg: 'harbor', entryWest: { to: 'foldheim_road', spawn: 'ch3' } },
    [
      {
        id: 'sg_docks', name: 'Sogport Docks', w: 1500,
        props: K.scatter(['barrel', 'crate', 'coral'], 7, 1500).concat([{ sprite: 'lamp', x: 300, z: .86 }]),
        gizmos: K.rest(140).concat([
          { kind: 'sign', x: 420, z: .86, text: 'SOGPORT. TIDE TABLE: see reverse.\n(The reverse reads: "the tide has stopped bothering with tables".)' }
        ]),
        water: [{ x0: 900, x1: 1120, z0: .2, z1: .48 }],
        items: [{ kind: 'coin', x: 700, z: .74, amount: 6, flag: 'sg1_c1' }],
        foes: [{ id: 'sg1a', type: 'soggle', x: 1000, z: .68, patrol: 100, group: ['soggle', 'drizzler'], killFlag: 'sg1_f1' }],
        triggers: [{
          x: 320, z: .6, w: 100, d: 1.4, once: true, flag: 'tr_ch3',
          script: [
            ['chapter', 3, 'What Sleeps in the Ream', 'Sogport, and the thing under it'],
            ['say', 'narr', 'The water is a foot above where the water should be. Everyone here has decided not to mention it.'],
            ['say', 'lumen', 'I would like it noted that I am extremely flammable and this town is extremely damp, and I am here anyway.'],
            ['say', 'pip', 'Noted in the log.']
          ]
        }]
      },
      {
        id: 'sg_town', name: 'Sogport', w: 1900, theme: 'interior', music: 'harbor',
        props: [
          { sprite: 'house_small', x: 260, z: .12 }, { sprite: 'house_small', x: 700, z: .1, scale: .95 },
          { sprite: 'house_small', x: 1520, z: .12 }, { sprite: 'barrel', x: 1120, z: .82 },
          { sprite: 'crate', x: 1180, z: .88 }, { sprite: 'coral', x: 480, z: .9 },
          { sprite: 'lamp', x: 940, z: .84 }
        ],
        gizmos: K.rest(180).concat([
          { kind: 'shop', x: 740, z: .44, shop: 'sogport_chandler', label: 'Shop', sprite: 'shop_stall', scale: .8 },
          { kind: 'cook', x: 1060, z: .58, label: 'Cook', sprite: 'barrel' },
          { kind: 'inn', x: 1520, z: .44, price: 10, label: 'Rest', sprite: 'house_small', scale: .8 },
          { kind: 'sign', x: 400, z: .88, text: 'SOGPORT — HARBOUR AUTHORITY\nFerries suspended. Reason: "sea".' }
        ]),
        items: [{ kind: 'chest', x: 1840, z: .3, item: 'lifeleaf', flag: 'sg2_ch1' }, { kind: 'coin', x: 900, z: .8, amount: 8, flag: 'sg2_c1' }],
        npcs: [
          {
            id: 'keel', sprite: 'sailor_keel', x: 740, z: .6, name: 'Keel',
            script: function () {
              if (St.questState('ferry_manifest') === 'done') return [['say', 'sailor_keel', 'Manifest is back on the wall where it belongs. Ferries still stopped, but the paperwork is immaculate.'], ['shop', 'sogport_chandler']];
              if (St.questState('ferry_manifest') === 'open' && St.hasKey('harbor_manifest')) return [
                ['say', 'sailor_keel', 'That is it. That is HER. Water-stained but legible, and legible is all the authority wants.'],
                ['takekey', 'harbor_manifest'],
                ['shard', 1],
                ['quest', 'ferry_manifest', 'done', 'The Missing Manifest'],
                ['say', 'sailor_keel', 'Foil Shard, for your trouble. Take it to whichever of your friends needs sharpening.']
              ];
              return [
                ['say', 'sailor_keel', 'Harbour manifest went down with the Ream. Without it I cannot legally float a bathtub.'],
                ['say', 'sailor_keel', 'It is down there. So is everything else.'],
                ['quest', 'ferry_manifest', 'start'],
                ['shop', 'sogport_chandler']
              ];
            }
          },
          {
            id: 'sg_gran', sprite: 'grandma_creased', x: 1520, z: .58, name: 'Tarn',
            script: [['say', 'grandma_creased', 'Ten coins, and the beds are on the second floor now. Everything is on the second floor now.'], ['inn', 10]]
          },
          {
            id: 'sg_chef', sprite: 'chef_pulp', x: 1060, z: .7, name: 'Cook Brine',
            script: [['say', 'chef_pulp', 'Everything I make tastes faintly of harbour. I have stopped fighting it.'], ['cook']]
          },
          {
            id: 'sg_kid', sprite: 'kid_dash', x: 980, z: .88, name: 'Skiff', wander: 60,
            script: [['say', 'kid_dash', 'I folded a boat once. Out of a page of the manifest. Dad went spare.'], ['say', 'kid_dash', 'It is still down there somewhere. It was a GOOD boat.']]
          },
          {
            id: 'sg_ferrier', sprite: 'ferrier_stamp', x: 1300, z: .68, name: 'Harbourmaster Stamp',
            script: [['say', 'ferrier_stamp', 'The water rises and falls twice a day like breathing, and it is not the tide, and I would very much like it to be the tide.']]
          }
        ]
      },
      {
        id: 'sg_pier', name: 'The Long Pier', w: 1800,
        props: K.scatter(['barrel', 'coral', 'crate'], 6, 1800),
        water: [{ x0: 520, x1: 760, z0: .3, z1: .95 }, { x0: 1180, x1: 1440, z0: .3, z1: .95 }],
        solids: [{ x: 940, z: .5, w: 200, d: .5, h: 0 }],
        items: [{ kind: 'coin', x: 960, z: .5, amount: 10, flag: 'sg3_c1' }, { kind: 'chest', x: 1720, z: .32, item: 'bigwadbomb', flag: 'sg3_ch1' }],
        gizmos: [
          {
            kind: 'dockside', x: 640, z: .6, needs: 'ferry', once: false, label: 'Ferry across',
            script: [['say', 'bloop', 'Hop on! I am EXACTLY the right shape for this.'], ['func', function (w) { w.player.x = 900; w.player.z = .5; }], ['sfx', 'water']]
          },
          {
            kind: 'dockside', x: 1160, z: .6, needs: 'ferry', once: false, label: 'Ferry across',
            script: [['say', 'bloop', 'Second crossing! I am having the best day.'], ['func', function (w) { w.player.x = 1480; w.player.z = .6; }], ['sfx', 'water']]
          },
          { kind: 'sign', x: 240, z: .88, text: 'PIER 3 — CONDEMNED\nPier 1 and 2 are underneath Pier 3 now.' }
        ],
        foes: [
          { id: 'sg3a', type: 'barnacleaf', x: 960, z: .5, patrol: 60, group: ['barnacleaf', 'soggle'], killFlag: 'sg3_f1' },
          { id: 'sg3b', type: 'brinehound', x: 1600, z: .64, patrol: 90, group: ['brinehound', 'drizzler'], killFlag: 'sg3_f2' }
        ]
      },
      {
        id: 'sg_wreck', name: 'The Wreck', w: 1800, theme: 'sea', music: 'harbor',
        props: K.scatter(['coral', 'barrel', 'crate'], 8, 1800),
        solids: [{ x: 700, z: .44, w: 100, d: .3, h: 58 }, { x: 1100, z: .44, w: 100, d: .3, h: 58 }],
        items: [
          { kind: 'chest', x: 700, z: .44, y: 58, item: 'tonicwash', flag: 'sg4_ch1' },
          { kind: 'shard', x: 1500, z: .8, flag: 'sg4_shard' },
          { kind: 'coin', x: 1300, z: .74, amount: 9, flag: 'sg4_c1' }
        ],
        gizmos: [{ kind: 'save', x: 160, z: .84 }],
        foes: [
          { id: 'sg4a', type: 'inkfish', x: 900, z: .68, patrol: 110, group: ['inkfish', 'tidewisp'], killFlag: 'sg4_f1' },
          { id: 'sg4b', type: 'soggle', x: 1650, z: .62, patrol: 80, group: ['soggle', 'barnacleaf', 'drizzler'], killFlag: 'sg4_f2' }
        ],
        triggers: [{
          x: 340, z: .6, w: 100, d: 1.4, once: true, flag: 'tr_bloop',
          script: [
            ['say', 'narr', 'Wedged in the ribs of the wreck, keeping about four hundred litres of water out of a hold it has no business protecting, is a paper boat.'],
            ['spawn', { id: 'blp', sprite: 'bloop', x: 520, z: .6, name: 'Bloop' }],
            ['wait', 26],
            ['say', 'bloop', 'HELLO. Are you here about the hold? I have been holding the hold.'],
            ['say', 'pip', 'How long?'],
            ['say', 'bloop', 'Since the boy folded me! Out of a page of a manifest! It was a very important page, he got in enormous trouble, it was the best day of my life.'],
            ['say', 'twigby', 'You have been plugging a shipwreck. Alone. For years.'],
            ['say', 'bloop', 'Someone had to be the right shape.'],
            ['say', 'pip', 'We are going down into the Ream. We need something boat-shaped.'],
            ['say', 'bloop', 'Water! You need water crossed! I am EXACTLY the right shape for that. Hop on, hop on.'],
            ['despawn', 'blp'],
            ['partner', 'bloop'],
            ['wait', 20],
            ['say', 'sys', 'Bloop joined you.\n<c:#c8443c>C</c> at a dockside unfolds Bloop into a boat and ferries you across.\nIn battle, <c:#57b8ea>Splash</c> makes foes Soggy and <c:#4fae62>Bubble Shield</c> raises an ally\'s Defence.'],
            ['say', 'lumen', 'I am going to stand over here. Nothing personal.']
          ]
        }]
      },
      {
        id: 'sg_tideway', name: 'The Tideway', w: 1700, theme: 'sea',
        eastLock: { needsKey: 'tidepass', lockedMsg: 'The lock gate needs a Tide Pass. The Bosun has one, and the Bosun is not sharing.' },
        props: K.scatter(['coral', 'barrel'], 6, 1700),
        water: [{ x0: 560, x1: 820, z0: .3, z1: .95 }],
        solids: [{ x: 1000, z: .44, w: 100, d: .3, h: 62 }],
        items: [{ kind: 'chest', x: 1000, z: .44, y: 62, badge: 'icemallet', flag: 'sg5_ch1' }],
        gizmos: [
          {
            kind: 'dockside', x: 680, z: .6, needs: 'ferry', once: false, label: 'Ferry across',
            script: [['func', function (w) { w.player.x = 900; w.player.z = .6; }], ['sfx', 'water']]
          },
          { kind: 'save', x: 160, z: .84 }
        ],
        foes: [
          { id: 'sg5a', type: 'drizzler', x: 1180, z: .7, patrol: 120, group: ['drizzler', 'inkfish'], killFlag: 'sg5_f1' },
          {
            id: 'sg5boss', type: 'barnacle_bosun', x: 1520, z: .6, patrol: 0, chase: false, boss: true,
            group: ['barnacle_bosun'], killFlag: 'sg_bosun_down',
            cfg: {
              boss: true, noRun: true, music: 'boss',
              introLine: 'Barnacle Bosun: "This is a ship. I am its Bosun. Both of those are lies and I will fight you over either."',
              introSpeaker: 'Barnacle Bosun', introPortrait: 'barnacle_bosun'
            },
            onWin: [
              ['givekey', 'tidepass'],
              ['sayx', 'Barnacle Bosun', 'barnacle_bosun', 'Take the pass. Go down. Do not wake it gently — it does not wake gently.', 'boss']
            ]
          }
        ]
      },
      {
        id: 'sg_ream', name: 'The Sunken Ream', w: 1900, theme: 'sea', dark: true,
        props: K.scatter(['coral', 'crate', 'barrel'], 9, 1900),
        solids: [{ x: 640, z: .44, w: 100, d: .3, h: 56 }, { x: 1040, z: .44, w: 100, d: .3, h: 112 }, { x: 1440, z: .44, w: 100, d: .3, h: 56 }],
        pits: [{ x0: 730, x1: 940, z0: .28, z1: .56, to: { x: 620, z: .78 } }],
        items: [
          { kind: 'chest', x: 1040, z: .44, y: 112, key: 'harbor_manifest', flag: 'sg6_man' },
          { kind: 'chest', x: 1820, z: .32, item: 'lastpage', flag: 'sg6_ch1' },
          { kind: 'coin', x: 800, z: .78, amount: 12, flag: 'sg6_c1' }
        ],
        gizmos: K.rest(160).concat([
          { kind: 'sign', x: 300, z: .88, text: 'THE REAM. Four thousand tonnes of paper, filed by nobody, read by nothing.' }
        ]),
        foes: [
          { id: 'sg6a', type: 'inkfish', x: 900, z: .7, patrol: 120, group: ['inkfish', 'inkfish', 'tidewisp'], killFlag: 'sg6_f1' },
          { id: 'sg6b', type: 'brinehound', x: 1300, z: .64, patrol: 100, group: ['brinehound', 'barnacleaf'], killFlag: 'sg6_f2' },
          { id: 'sg6c', type: 'soggle', x: 1700, z: .6, patrol: 70, group: ['soggle', 'soggle', 'drizzler'], killFlag: 'sg6_f3' }
        ]
      },
      {
        id: 'sg_depths', name: 'The Coil', w: 1300, theme: 'sea', music: 'tense',
        props: [{ sprite: 'coral', x: 220, z: .12, scale: 1.4 }, { sprite: 'coral', x: 1080, z: .12, scale: 1.4 },
          { sprite: 'pillar', x: 500, z: .1 }, { sprite: 'pillar', x: 800, z: .1 }],
        gizmos: K.rest(150),
        triggers: [PB.MapKit.bossTrigger({
          x: 620, flag: 'tr_nautilus', entId: 'naut', sprite: 'nautilus_grim',
          name: 'Nautilus Grim', enemy: 'nautilus_grim', bg: 'harbor',
          before: [['say', 'narr', 'The chamber breathes. In, and the water drops a foot. Out, and it climbs back. It has been doing this for six days, and Sogport has been calling it the tide.']],
          lines: [
            ['say', 'bloop', 'Oh. Oh, that is not a shipwreck. That is what happened TO the shipwreck.'],
            ['sayx', 'Nautilus Grim', 'nautilus_grim', '...warm. ssssomething warm. mine.', 'boss'],
            ['say', 'pip', 'Listen to me. You are drowning a town.'],
            ['sayx', 'Nautilus Grim', 'nautilus_grim', 'a. town.', 'boss'],
            ['say', 'pip', 'Two hundred people. They have moved everything to the second floor. They are pretending it is the tide because the alternative is you.'],
            ['sayx', 'Nautilus Grim', 'nautilus_grim', 'i have ssslept here ssssince before the town. i did not asssk it to be built on my breathing.', 'boss'],
            ['say', 'pip', 'No. But you have the fragment, and I am asking for it, and I would rather ask.'],
            ['sayx', 'Nautilus Grim', 'nautilus_grim', 'no.', 'boss'],
            ['say', 'twigby', 'Well. He asked.']
          ],
          after: [
            ['music', 'sad'],
            ['say', 'narr', 'The coil settles. The water drops a foot and stays down.'],
            ['sayx', 'Nautilus Grim', 'nautilus_grim', 'take it. i will ssssleep deeper. tell them... to build higher anyway.', 'boss'],
            ['say', 'bloop', 'I will tell them! I am very good at telling people things!'],
            ['wait', 30],
            ['sfx', 'seal'],
            ['title', 'SEAL III RECOVERED', 110],
            ['givekey', 'seal3'],
            ['seal', 'seal_tidewash'],
            ['form', 'form_dart'],
            ['say', 'sys', 'Seal Power learned: <c:#57b8ea>Tidewash</c> — 8 HP and clears every ailment.\nNew Origami Form: <c:#e0483c>Dart</c> — Attack +2 and every hit pierces, but you crumple easily.'],
            ['upgrade', 'mallet'],
            ['flag', 'ch3_done', true],
            ['chapterset', 4],
            ['heal'],
            ['say', 'twigby', 'Three. Three is nearly half. Three is basically nothing.'],
            ['say', 'pip', 'Three is three, Twigby.'],
            ['goto', 'foldheim_road', 'ch3']
          ]
        })]
      }
    ]
  );
})();

/* ===== 24_maps_ch45.js ===== */
/* ==========================================================================
   PAPERBOUND — 24_maps_ch45.js
   CHAPTER 4 — The Cardstock Carnival     CHAPTER 5 — Glyphhaven
   ========================================================================== */
'use strict';

(function () {
  var K = PB.MapKit, Shop = PB.Menus.defineShop, St = PB.State;

  /* ======================================================================
     CHAPTER 4 — THE CARDSTOCK CARNIVAL
     ====================================================================== */
  Shop('carnival_stall', {
    name: 'The Sideshow Pantry', keeper: 'barker_tilt',
    greeting: 'Step up! Everything is fresh, everything is fairly priced, and one of those is true.',
    stock: ['reamcake', 'inktea', 'creambun', 'tonicwash', 'papercutstar', 'crowdcandy', 'sleepysheet', 'boldbrew']
  });

  K.chain(
    { chapter: 4, music: 'carnival', theme: 'carnival', battleBg: 'carnival', entryWest: { to: 'foldheim_road', spawn: 'ch4' } },
    [
      {
        id: 'cc_gates', name: 'Carnival Gates', w: 1400,
        props: [{ sprite: 'tent', x: 1180, z: .14, scale: 1.1 }, { sprite: 'banner', x: 300, z: .16 },
          { sprite: 'banner', x: 520, z: .16 }, { sprite: 'lamp', x: 220, z: .86 }, { sprite: 'lamp', x: 900, z: .86 }],
        gizmos: K.rest(140).concat([
          { kind: 'sign', x: 460, z: .86, text: 'THE CARDSTOCK CARNIVAL\nCONTINUOUS PERFORMANCE SINCE — the number has been scratched out and rewritten four times.' }
        ]),
        items: [{ kind: 'coin', x: 760, z: .5, amount: 8, flag: 'cc1_c1' }],
        foes: [{ id: 'cc1a', type: 'clipling', x: 980, z: .62, patrol: 100, group: ['clipling', 'confettoid'], killFlag: 'cc1_f1' }],
        triggers: [{
          x: 320, z: .6, w: 100, d: 1.4, once: true, flag: 'tr_ch4',
          script: [
            ['chapter', 4, 'The Show Must Not Go On', 'Cardstock, where nobody has been allowed to stop'],
            ['say', 'narr', 'Music. Applause. Both of them slightly too loud and neither of them stopping.'],
            ['say', 'twigby', 'How long has that applause been going?'],
            ['say', 'lumen', 'Listen to it properly.'],
            ['say', 'twigby', '...It is a loop. It is the same nine seconds.'],
            ['say', 'pip', 'Right. Let us go and find out who is holding the needle down.']
          ]
        }]
      },
      {
        id: 'cc_midway', name: 'The Midway', w: 2000, theme: 'carnival',
        props: [{ sprite: 'tent', x: 400, z: .1 }, { sprite: 'tent', x: 1600, z: .1, scale: .9 },
          { sprite: 'shop_stall', x: 780, z: .2 }, { sprite: 'banner', x: 1100, z: .14 },
          { sprite: 'crate', x: 1320, z: .86 }, { sprite: 'barrel', x: 1380, z: .9 },
          { sprite: 'lamp', x: 240, z: .86 }, { sprite: 'lamp', x: 1800, z: .86 }],
        gizmos: K.rest(180).concat([
          { kind: 'shop', x: 780, z: .44, shop: 'carnival_stall', label: 'Shop', sprite: 'shop_stall', scale: .8 },
          { kind: 'cook', x: 1120, z: .58, label: 'Cook', sprite: 'barrel' },
          { kind: 'sign', x: 420, z: .88, text: 'ATTRACTIONS: The Funhouse. The Rigging. The Big Top.\nEXITS: see management.' }
        ]),
        items: [{ kind: 'coin', x: 1000, z: .78, amount: 10, flag: 'cc2_c1' }, { kind: 'chest', x: 1940, z: .3, item: 'grandfeast', flag: 'cc2_ch1' }],
        npcs: [
          {
            id: 'tilt', sprite: 'barker_tilt', x: 780, z: .6, name: 'Tilt',
            script: [
              ['say', 'barker_tilt', 'Step up, step — sorry. Force of habit. I have been saying that for eleven years.'],
              ['say', 'barker_tilt', 'The Great Kerf does not let the show stop. Not for weather, not for sleep, not for the two lads who fell out of the rigging in year six.'],
              ['say', 'pip', 'Why does nobody leave?'],
              ['say', 'barker_tilt', 'Because he is watching from the ring and the applause never stops, and after a while you cannot tell whether you are performing or just standing very still.'],
              ['shop', 'carnival_stall']
            ]
          },
          {
            id: 'cc_child', sprite: 'kid_dot', x: 1240, z: .8, name: 'Pinny',
            script: function () {
              if (St.questState('lost_ticket') === 'done') return [['say', 'kid_dot', 'I saw the show. It was TERRIBLE. It was the best thing that has ever happened to me.']];
              if (St.questState('lost_ticket') === 'open' && St.hasKey('carnival_ticket')) return [
                ['say', 'kid_dot', 'THAT IS IT. That is MY ticket. It has my thumb on it and everything.'],
                ['takekey', 'carnival_ticket'],
                ['badge', 'crowdpleaser'],
                ['quest', 'lost_ticket', 'done', 'One Ticket, Please'],
                ['say', 'kid_dot', 'Here. Dad found this pinned to a tent and said it was rubbish. It is not rubbish, it is a BADGE.']
              ];
              return [
                ['say', 'kid_dot', 'I dropped my ticket in the funhouse and now they will not let me in and I have been waiting outside for THREE DAYS.'],
                ['say', 'twigby', 'Three days?'],
                ['say', 'kid_dot', 'It is a very good show. Probably.'],
                ['quest', 'lost_ticket', 'start']
              ];
            }
          },
          { id: 'cc_juggler', sprite: 'villager_b', x: 1420, z: .68, name: 'Juggler Fen', script: [['say', 'villager_b', 'Eleven years. I have dropped nothing in eleven years. Ask me what my hands feel like. Go on.']] },
          { id: 'cc_chef', sprite: 'chef_pulp', x: 1120, z: .7, name: 'Fryer Batter', script: [['say', 'chef_pulp', 'I fry things. In a tent. Next to acrobats. Nobody has ever explained the insurance.'], ['cook']] },
          { id: 'cc_stilts', sprite: 'villager_c', x: 1700, z: .72, name: 'Stilts Marla', script: [['say', 'villager_c', 'Backstage is through the rigging. Kerf does not go back there. Kerf does not like anywhere the audience cannot see him.']] }
        ],
        foes: [{ id: 'cc2a', type: 'confettoid', x: 1500, z: .64, patrol: 110, group: ['confettoid', 'clipling', 'juggloon'], killFlag: 'cc2_f1' }]
      },
      {
        id: 'cc_funhouse', name: 'The Funhouse', w: 1900, theme: 'interior', music: 'carnival',
        props: K.scatter(['pillar', 'crate', 'barrel'], 7, 1900),
        solids: [
          { x: 500, z: .42, w: 90, d: .28, h: 58 },
          { x: 780, z: .42, w: 90, d: .28, h: 116 },
          { x: 1060, z: .42, w: 90, d: .28, h: 58 },
          { x: 1360, z: .5, w: 140, d: .36, h: 0, id: 'cc_hidden', hidden: true }
        ],
        pits: [{ x0: 580, x1: 700, z0: .28, z1: .56, to: { x: 460, z: .78 } },
          { x0: 860, x1: 980, z0: .28, z1: .56, to: { x: 460, z: .78 } }],
        items: [
          { kind: 'chest', x: 780, z: .42, y: 116, key: 'carnival_ticket', flag: 'cc3_ticket' },
          { kind: 'chest', x: 1840, z: .32, badge: 'quickchange', flag: 'cc3_ch1' },
          { kind: 'coin', x: 1200, z: .78, amount: 12, flag: 'cc3_c1' }
        ],
        gizmos: [
          { kind: 'save', x: 150, z: .84 },
          {
            kind: 'crack', x: 1240, z: .6, once: false, label: 'Slip through',
            to: { x: 1440, z: .6 },
            script: []
          },
          { kind: 'sign', x: 280, z: .88, text: 'THE FUNHOUSE.\nManagement accepts no responsibility for the mirrors, the floor, or your sense of self.' }
        ],
        foes: [
          { id: 'cc3a', type: 'papercut', x: 640, z: .7, patrol: 130, group: ['papercut', 'clipling'], killFlag: 'cc3_f1' },
          { id: 'cc3b', type: 'stiltjack', x: 1500, z: .62, patrol: 100, group: ['stiltjack', 'confettoid', 'papercut'], killFlag: 'cc3_f2' }
        ]
      },
      {
        id: 'cc_backstage', name: 'Backstage', w: 1700, theme: 'interior', music: 'carnival',
        props: K.scatter(['crate', 'barrel', 'pillar'], 8, 1700),
        solids: [{ x: 900, z: .44, w: 100, d: .3, h: 62 }, { x: 1300, z: .5, w: 130, d: .34, h: 0, id: 'cc_roped', hidden: true }],
        items: [
          { kind: 'chest', x: 900, z: .44, y: 62, item: 'mirrorfoil', flag: 'cc4_ch1' },
          { kind: 'shard', x: 1560, z: .8, flag: 'cc4_shard' }
        ],
        gizmos: [
          { kind: 'save', x: 150, z: .84 },
          {
            kind: 'seam', x: 1180, z: .5, needs: 'cut', once: true, reveals: 'cc_roped',
            label: 'Cut the rope',
            script: [['say', 'snip', 'Eleven years of knots. Watch this.'], ['sfx', 'fold'], ['say', 'narr', 'The rope parts. A whole gantry swings down and becomes a floor.']]
          }
        ],
        foes: [{ id: 'cc4a', type: 'clipling', x: 700, z: .66, patrol: 90, group: ['clipling', 'clipling', 'juggloon'], killFlag: 'cc4_f1' }],
        triggers: [{
          x: 340, z: .6, w: 100, d: 1.4, once: true, flag: 'tr_snip',
          script: [
            ['say', 'narr', 'Backstage is dark and full of props and one performer, sitting on a crate, sharpening something.'],
            ['spawn', { id: 'snp', sprite: 'snip', x: 540, z: .6, name: 'Snip', face: 'left' }],
            ['wait', 26],
            ['say', 'snip', 'Audience is that way. Unless you are here to fire me, in which case: already done, join the queue.'],
            ['say', 'pip', 'What did you do?'],
            ['say', 'snip', 'I was better than him. In front of nine hundred people. During a MATINEE.'],
            ['say', 'twigby', 'That is not really a firing offence.'],
            ['say', 'snip', 'It is the only firing offence he has. Everything else he forgives instantly, because everything else keeps the show running.'],
            ['say', 'pip', 'He has a piece of something that belongs to a crown. I am collecting it.'],
            ['say', 'snip', 'The bright thing in the ring lights. He nailed it to the gantry so it catches him from below.'],
            ['say', 'snip', 'He fired me for being BETTER than him. In front of nine hundred people. So — where are we going and who am I cutting?'],
            ['despawn', 'snp'],
            ['partner', 'snip'],
            ['wait', 20],
            ['say', 'sys', 'Snip joined you.\n<c:#c8443c>C</c> cuts taped seams, ropes and stitched barriers.\nIn battle, <c:#f07a8a>Snip Snip</c> halves a foe\'s Defence for the turn.']
          ]
        }]
      },
      {
        id: 'cc_rigging', name: 'The Rigging', w: 1800, theme: 'interior', music: 'carnival',
        eastLock: { needsKey: 'bigtop_ticket', lockedMsg: 'The Big Top door wants a ticket. A real one, stamped, from the box office nobody staffs.' },
        props: K.scatter(['pillar', 'banner'], 6, 1800),
        solids: [
          { x: 480, z: .4, w: 90, d: .26, h: 70 },
          { x: 760, z: .4, w: 90, d: .26, h: 140 },
          { x: 1040, z: .4, w: 90, d: .26, h: 210 },
          { x: 1320, z: .4, w: 90, d: .26, h: 140 }
        ],
        pits: [{ x0: 560, x1: 680, z0: .26, z1: .54, to: { x: 400, z: .8 } },
          { x0: 840, x1: 960, z0: .26, z1: .54, to: { x: 400, z: .8 } },
          { x0: 1120, x1: 1240, z0: .26, z1: .54, to: { x: 400, z: .8 } }],
        items: [
          { kind: 'chest', x: 1040, z: .4, y: 210, key: 'bigtop_ticket', flag: 'cc5_ticket' },
          { kind: 'coin', x: 760, z: .4, y: 140, amount: 14, flag: 'cc5_c1' }
        ],
        gizmos: [{ kind: 'save', x: 150, z: .84 },
          { kind: 'sign', x: 280, z: .88, text: 'RIGGING. No safety net.\nThere was a safety net. It is in the funhouse now, being a floor.' }],
        foes: [
          { id: 'cc5a', type: 'trapezoid', x: 900, z: .72, patrol: 140, group: ['trapezoid', 'juggloon'], killFlag: 'cc5_f1' },
          {
            id: 'cc5boss', type: 'trimmet', x: 1620, z: .6, patrol: 0, chase: false, boss: true,
            group: ['trimmet'], killFlag: 'cc_trimmet_down',
            cfg: {
              boss: true, noRun: true, music: 'boss',
              introLine: 'Trimmet: "I have understudied him for nine years. I know every single thing he does. Including this."',
              introSpeaker: 'Trimmet', introPortrait: 'trimmet'
            },
            onWin: [
              ['say', 'snip', 'Trimmet. He was going to give you my slot, you know.'],
              ['sayx', 'Trimmet', 'trimmet', 'He was never going to give me anything. I have known that for nine years and I turned up anyway.', 'boss'],
              ['say', 'snip', 'Come backstage after. There is a crate and I will sharpen something and you can be furious out loud.'],
              ['give', 'swiftdraft']
            ]
          }
        ]
      },
      {
        id: 'cc_bigtop', name: 'The Big Top', w: 1600, theme: 'carnival',
        props: [{ sprite: 'tent', x: 300, z: .1, scale: 1.3 }, { sprite: 'banner', x: 700, z: .12 },
          { sprite: 'banner', x: 1000, z: .12 }, { sprite: 'lamp', x: 400, z: .88 }, { sprite: 'lamp', x: 1200, z: .88 }],
        solids: [{ x: 800, z: .44, w: 110, d: .3, h: 66 }],
        items: [{ kind: 'chest', x: 800, z: .44, y: 66, badge: 'creasecutter', flag: 'cc6_ch1' },
          { kind: 'coin', x: 1200, z: .76, amount: 15, flag: 'cc6_c1' }],
        gizmos: K.rest(160).concat([
          {
            kind: 'seam', x: 1100, z: .8, needs: 'cut', once: true,
            label: 'Cut the banner',
            script: [['give', 'lastpage'], ['say', 'snip', 'Somebody sewed a Last Page into the lining of a banner. Performers hide everything in banners.']]
          }
        ]),
        foes: [{ id: 'cc6a', type: 'stiltjack', x: 1000, z: .64, patrol: 110, group: ['stiltjack', 'trapezoid', 'papercut'], killFlag: 'cc6_f1' }]
      },
      {
        id: 'cc_ring', name: 'The Centre Ring', w: 1300, theme: 'carnival', music: 'tense',
        props: [{ sprite: 'banner', x: 240, z: .12 }, { sprite: 'banner', x: 1060, z: .12 },
          { sprite: 'lamp', x: 340, z: .88 }, { sprite: 'lamp', x: 960, z: .88 }],
        gizmos: K.rest(150),
        triggers: [PB.MapKit.bossTrigger({
          x: 620, flag: 'tr_kerf', entId: 'kerf', sprite: 'great_kerf',
          name: 'The Great Kerf', enemy: 'great_kerf', bg: 'carnival',
          before: [['say', 'narr', 'The ring is empty except for the applause, which is coming from a rack of nine hundred paper hands on a crank.']],
          lines: [
            ['sayx', 'The Great Kerf', 'great_kerf', 'LADIES. GENTLEFOLD. A COURIER.', 'boss'],
            ['say', 'pip', 'There is nobody here.'],
            ['sayx', 'The Great Kerf', 'great_kerf', 'There is ALWAYS somebody here.', 'boss'],
            ['say', 'snip', 'It is a crank, Kerf. It has been a crank for six years. You turned the last real audience into staff.'],
            ['sayx', 'The Great Kerf', 'great_kerf', '...Snip. You came BACK.', 'boss'],
            ['say', 'snip', 'To cut you down. Professionally.'],
            ['sayx', 'The Great Kerf', 'great_kerf', 'Do you know what happens to me when the applause stops, girl? I stop. That is not a metaphor. I have tested it.', 'boss'],
            ['sayx', 'The Great Kerf', 'great_kerf', 'So the show does not stop. Not for weather. Not for sleep. Not for the two lads in year six. And not for YOU.', 'boss'],
            ['say', 'pip', 'Then let us give them something worth clapping at.']
          ],
          after: [
            ['music', 'sad'],
            ['say', 'narr', 'The crank winds down. Nine hundred paper hands go still, and for the first time in eleven years the Cardstock Carnival is quiet.'],
            ['sayx', 'The Great Kerf', 'great_kerf', '...oh. Oh, that is what quiet is.', 'boss'],
            ['say', 'snip', 'It is not that bad.'],
            ['sayx', 'The Great Kerf', 'great_kerf', 'It is TERRIBLE. It is — it is enormous. How does anyone sit in this.', 'boss'],
            ['say', 'snip', 'You practise. Come on. Everyone is outside and nobody is performing and it is very strange and you should see it.'],
            ['wait', 30],
            ['sfx', 'seal'],
            ['title', 'SEAL IV RECOVERED', 110],
            ['givekey', 'seal4'],
            ['seal', 'seal_kerf'],
            ['givekey', 'coliseum_pass'],
            ['flag', 'form_slip', true],
            ['say', 'sys', 'Seal Power learned: <c:#cfd6de>Kerfstrike</c> — 10 damage that no defence can blunt.\nNew fold: <c:#f7edd6>Slip</c>. Press <c:#c8443c>V</c> at a crack to turn edge-on and pass through.\nAlso: a Coliseum Pass. The Folded Coliseum is off the Foldheim Road, at the far east end.'],
            ['flag', 'ch4_done', true],
            ['chapterset', 5],
            ['heal'],
            ['goto', 'foldheim_road', 'ch4']
          ]
        })]
      }
    ]
  );

  /* ======================================================================
     CHAPTER 5 — GLYPHHAVEN
     ====================================================================== */
  Shop('glyphhaven_desk', {
    name: 'The Lending Desk', keeper: 'scholar_ibis', markup: 1.1,
    greeting: 'We are not lending books. We are, apparently, still selling snacks. Do not ask me to justify it.',
    stock: ['creambun', 'deeproot', 'tonicwash', 'inkbomb', 'sealwater', 'focusink', 'ironsheet', 'shreddisc']
  });

  K.chain(
    { chapter: 5, music: 'library', theme: 'library', battleBg: 'library', entryWest: { to: 'foldheim_road', spawn: 'ch5' } },
    [
      {
        id: 'gh_steps', name: 'The Glyphhaven Steps', w: 1400,
        props: [{ sprite: 'pillar', x: 300, z: .14 }, { sprite: 'pillar', x: 700, z: .14 }, { sprite: 'pillar', x: 1100, z: .14 },
          { sprite: 'bookshelf', x: 1300, z: .12 }, { sprite: 'lamp', x: 200, z: .86 }],
        gizmos: K.rest(140).concat([
          { kind: 'sign', x: 480, z: .86, text: 'GLYPHHAVEN. Founded so that nothing true would ever be lost.\nA newer notice below: NO LENDING. NO READING. NO EXCEPTIONS.' }
        ]),
        items: [{ kind: 'coin', x: 900, z: .5, amount: 10, flag: 'gh1_c1' }],
        foes: [{ id: 'gh1a', type: 'footnote', x: 1000, z: .66, patrol: 100, group: ['footnote', 'footnote'], killFlag: 'gh1_f1' }],
        triggers: [{
          x: 320, z: .6, w: 100, d: 1.4, once: true, flag: 'tr_ch5',
          script: [
            ['chapter', 5, 'Nothing Should Be Read', 'Glyphhaven, and what it stopped lending'],
            ['say', 'narr', 'A library the size of a city, and every window dark.'],
            ['say', 'lumen', 'Four hundred years I wanted somewhere with a view and something to read. And here it is. And it has been closed.'],
            ['say', 'pip', 'Then we will open it.']
          ]
        }]
      },
      {
        id: 'gh_atrium', name: 'The Atrium', w: 1900, theme: 'library',
        props: [{ sprite: 'bookshelf', x: 300, z: .12 }, { sprite: 'bookshelf', x: 560, z: .12 },
          { sprite: 'bookshelf', x: 1520, z: .12 }, { sprite: 'bookshelf', x: 1780, z: .12 },
          { sprite: 'pillar', x: 900, z: .16 }, { sprite: 'pillar', x: 1200, z: .16 },
          { sprite: 'lamp', x: 700, z: .86 }, { sprite: 'lamp', x: 1400, z: .86 }],
        gizmos: K.rest(180).concat([
          { kind: 'shop', x: 800, z: .44, shop: 'glyphhaven_desk', label: 'Desk', sprite: 'shop_stall', scale: .75 },
          { kind: 'cook', x: 1120, z: .58, label: 'Cook', sprite: 'barrel' },
          { kind: 'sign', x: 440, z: .88, text: 'READING ROOM — CLOSED\nSTACKS — CLOSED\nRESTRICTED — CLOSED (was already closed)' }
        ]),
        items: [{ kind: 'chest', x: 1860, z: .3, item: 'sealwater', flag: 'gh2_ch1' }],
        npcs: [
          {
            id: 'marge', sprite: 'archivist_marge', x: 700, z: .68, name: 'Archivist Marge',
            script: function () {
              var have = 0, ids = ['gh_book1', 'gh_book2', 'gh_book3', 'gh_book4'];
              for (var i = 0; i < ids.length; i++) if (St.hasFlag(ids[i])) have++;
              if (St.questState('overdue_books') === 'done') return [['say', 'archivist_marge', 'Four books back on four shelves. It is not much against a city of them, but it is four.']];
              if (St.questState('overdue_books') === 'open' && have >= 4) return [
                ['say', 'archivist_marge', 'All four. All four, and one of them a hundred and six years out.'],
                ['badge', 'deepfocus'],
                ['quest', 'overdue_books', 'done', 'Extremely Overdue'],
                ['say', 'archivist_marge', 'Take Deep Focus. It was pinned inside the back cover of the worst offender.']
              ];
              if (St.questState('overdue_books') === 'open') return [
                ['say', 'archivist_marge', 'Four books, four shelves. You have ' + have + '.'],
                ['say', 'archivist_marge', 'They are in the stacks, and the stacks are dark, and something in there has started editing.']
              ];
              return [
                ['say', 'archivist_marge', 'Four volumes never came back. That is four out of nine million, and it is the four I think about.'],
                ['say', 'archivist_marge', 'If you are going into the stacks anyway. Which you are. Everyone is, lately, and none of them come out with books.'],
                ['quest', 'overdue_books', 'start']
              ];
            }
          },
          {
            id: 'ibis', sprite: 'scholar_ibis', x: 800, z: .6, name: 'Scholar Ibis',
            script: [
              ['say', 'scholar_ibis', 'It arrived with the bright fragment. It took one look at nine million books and made a decision.'],
              ['say', 'pip', 'What decision?'],
              ['say', 'scholar_ibis', 'That anything which can be misread should not be readable. It is working through the collection alphabetically. It is on C.'],
              ['shop', 'glyphhaven_desk']
            ]
          },
          { id: 'gh_page', sprite: 'kid_dash', x: 1300, z: .82, name: 'Page Quire', wander: 50, script: [['say', 'kid_dash', 'I shelved a book yesterday and this morning the shelf was blank. Not empty. BLANK.']] },
          { id: 'gh_chef', sprite: 'chef_pulp', x: 1120, z: .7, name: 'Refectory Sift', script: [['say', 'chef_pulp', 'Nine million books and one kitchen. Guess which one gets the budget.'], ['cook']] }
        ],
        foes: [{ id: 'gh2a', type: 'glyphling', x: 1500, z: .64, patrol: 100, group: ['glyphling', 'footnote', 'footnote'], killFlag: 'gh2_f1' }]
      },
      {
        id: 'gh_stacks', name: 'The Stacks', w: 2000, theme: 'library', dark: true,
        props: K.scatter(['bookshelf'], 8, 2000),
        solids: [
          { x: 620, z: .42, w: 100, d: .3, h: 60 },
          { x: 1000, z: .42, w: 100, d: .3, h: 120 },
          { x: 1380, z: .5, w: 140, d: .36, h: 0, id: 'gh_shelfbridge', hidden: true }
        ],
        pits: [{ x0: 700, x1: 900, z0: .28, z1: .56, to: { x: 580, z: .78 } }],
        items: [
          { kind: 'chest', x: 620, z: .42, y: 60, coins: 20, flag: 'gh_book1' },
          { kind: 'chest', x: 1000, z: .42, y: 120, coins: 20, flag: 'gh_book2' },
          { kind: 'chest', x: 1700, z: .78, coins: 20, flag: 'gh_book3' },
          { kind: 'shard', x: 1900, z: .8, flag: 'gh3_shard' }
        ],
        gizmos: [
          { kind: 'save', x: 150, z: .84 },
          {
            kind: 'glyph', x: 1260, z: .5, needs: 'read', once: true, reveals: 'gh_shelfbridge',
            label: 'Read',
            script: [['say', 'narr', 'The glyph is a shelving instruction. Read aloud, it does what it says.'], ['say', 'narr', 'A row of shelves rotates into a walkway.']]
          },
          { kind: 'sign', x: 280, z: .88, text: 'STACKS. Bring a light. The lamps were removed "to reduce reading".' }
        ],
        foes: [
          { id: 'gh3a', type: 'dogear', x: 800, z: .68, patrol: 90, group: ['dogear', 'footnote'], killFlag: 'gh3_f1' },
          { id: 'gh3b', type: 'erratum', x: 1550, z: .64, patrol: 120, group: ['erratum', 'glyphling'], killFlag: 'gh3_f2' },
          { id: 'gh3c', type: 'marginalis', x: 1850, z: .6, patrol: 80, group: ['marginalis', 'dogear', 'footnote'], killFlag: 'gh3_f3' }
        ],
        triggers: [{
          x: 340, z: .6, w: 100, d: 1.4, once: true, flag: 'tr_stacks_dark',
          script: [['say', 'lumen', 'They took the lamps out. To reduce reading.'], ['say', 'lumen', 'Press <c:#c8443c>C</c>. I am about to be extremely useful.']]
        }]
      },
      {
        id: 'gh_marginalia', name: 'The Marginalia', w: 1700, theme: 'library',
        props: K.scatter(['bookshelf', 'pillar'], 6, 1700),
        solids: [{ x: 900, z: .44, w: 100, d: .3, h: 64 }],
        items: [{ kind: 'chest', x: 900, z: .44, y: 64, coins: 20, flag: 'gh_book4' },
          { kind: 'chest', x: 1620, z: .32, item: 'twicefolded', flag: 'gh4_ch1' }],
        gizmos: [{ kind: 'save', x: 150, z: .84 }],
        foes: [{ id: 'gh4a', type: 'redliner', x: 1200, z: .66, patrol: 100, group: ['redliner', 'erratum'], killFlag: 'gh4_f1' }],
        triggers: [{
          x: 340, z: .6, w: 100, d: 1.4, once: true, flag: 'tr_margo',
          script: [
            ['say', 'narr', 'One book lies open on a reading stand, at page four hundred and twelve, held there by a bookmark.'],
            ['spawn', { id: 'mgo', sprite: 'margo', x: 560, z: .6, name: 'Margo' }],
            ['wait', 26],
            ['say', 'margo', '"—and so, having crossed the river, she understood at last that the letter had never been meant for her" — comma — and that is where it stops. That is where it has stopped for two hundred and six years.'],
            ['say', 'pip', 'They did not come back.'],
            ['say', 'margo', 'People do not, mostly. That is not a complaint, it is a statistic. But two hundred and six years is a great deal of time to spend on a comma.'],
            ['say', 'twigby', 'What happens on page four hundred and thirteen?'],
            ['say', 'margo', 'I have no idea. I am a bookmark. I hold the place. I do not get to turn it.'],
            ['say', 'pip', 'Come with us. I cannot promise an ending, but there is a great deal happening and all of it is unfinished.'],
            ['say', 'margo', 'Two hundred and six years on page four hundred and twelve. I would very much like to see how any story ends. Even this one.'],
            ['despawn', 'mgo'],
            ['partner', 'margo'],
            ['wait', 20],
            ['say', 'sys', 'Margo joined you.\n<c:#c8443c>C</c> reads glyphs, translates signs and reveals hidden platforms.\nIn battle, <c:#f07a8a>Annotate</c> drops a foe\'s Defence and makes everything hurt it more.']
          ]
        }]
      },
      {
        id: 'gh_restricted', name: 'The Restricted Wing', w: 1800, theme: 'library',
        eastLock: { needsKey: 'vault_sigil', lockedMsg: 'The inkwell door carries a sigil-lock. Something in this wing is holding the sigil.' },
        props: K.scatter(['bookshelf', 'pillar'], 7, 1800),
        exits: [{ x: 8, z: .3, w: 40, d: .4, to: 'gh_marginalia', spawn: 'east', needsKey: 'libcard', lockedMsg: 'A Reader\'s Card is required beyond this point. It always was; now they mean it.' }],
        solids: [
          { x: 640, z: .42, w: 90, d: .28, h: 58 },
          { x: 1000, z: .5, w: 140, d: .36, h: 0, id: 'gh_readbridge', hidden: true }
        ],
        items: [{ kind: 'chest', x: 640, z: .42, y: 58, badge: 'peekaboo', flag: 'gh5_ch1' },
          { kind: 'coin', x: 1200, z: .78, amount: 16, flag: 'gh5_c1' }],
        gizmos: [
          { kind: 'save', x: 150, z: .84 },
          {
            kind: 'glyph', x: 880, z: .5, needs: 'read', once: true, reveals: 'gh_readbridge',
            label: 'Read',
            script: [['say', 'margo', 'It is a floor plan. Read properly, it becomes a floor. Libraries are very literal.']]
          }
        ],
        foes: [
          { id: 'gh5a', type: 'gluegoop', x: 900, z: .68, patrol: 80, group: ['gluegoop', 'redliner'], killFlag: 'gh5_f1' },
          {
            id: 'gh5boss', type: 'footnote_fenn', x: 1620, z: .6, patrol: 0, chase: false, boss: true,
            group: ['footnote_fenn'], killFlag: 'gh_fenn_down',
            cfg: {
              boss: true, noRun: true, music: 'boss',
              introLine: 'Footnote Fenn: "I have read every book in this building. I remember all the worst parts. Would you like them?"',
              introSpeaker: 'Footnote Fenn', introPortrait: 'footnote_fenn'
            },
            onWin: [
              ['givekey', 'vault_sigil'],
              ['sayx', 'Footnote Fenn', 'footnote_fenn', 'Take the sigil. Go down to the inkwell. And courier — when you meet it, do not argue. It does not read arguments. It removes them.', 'boss']
            ]
          }
        ],
        triggers: [{
          x: 340, z: .6, w: 90, d: 1.4, once: true, flag: 'tr_libcard', notFlag: 'gh_card_given',
          script: [
            ['ifitem', 'libcard', [], [
              ['say', 'margo', 'You will need a Reader\'s Card to get back out through the west door. Here — mine. Two hundred and six years unexpired.'],
              ['givekey', 'libcard'],
              ['flag', 'gh_card_given', true]
            ]]
          ]
        }]
      },
      {
        id: 'gh_inkwell', name: 'The Inkwell', w: 1700, theme: 'cave', music: 'library', dark: true,
        props: K.scatter(['inkpool', 'pillar', 'rock'], 7, 1700),
        solids: [{ x: 700, z: .44, w: 100, d: .3, h: 60 }, { x: 1100, z: .44, w: 100, d: .3, h: 60 }],
        items: [{ kind: 'chest', x: 700, z: .44, y: 60, item: 'inkespresso', flag: 'gh6_ch1' },
          { kind: 'chest', x: 1100, z: .44, y: 60, badge: 'returnpost', flag: 'gh6_ch2' }],
        gizmos: K.rest(150).concat([
          {
            kind: 'glyph', x: 1400, z: .8, needs: 'read', once: true,
            label: 'Read',
            script: [['say', 'margo', '"Whatever is written here outlives whoever wrote it." Well. That is either a comfort or a threat.'], ['shard', 1]]
          }
        ]),
        foes: [
          { id: 'gh6a', type: 'erratum', x: 900, z: .68, patrol: 110, group: ['erratum', 'erratum', 'redliner'], killFlag: 'gh6_f1' },
          { id: 'gh6b', type: 'marginalis', x: 1450, z: .62, patrol: 90, group: ['marginalis', 'glyphling', 'dogear'], killFlag: 'gh6_f2' }
        ]
      },
      {
        id: 'gh_vault', name: 'The Blank Vault', w: 1300, theme: 'library', music: 'tense',
        props: [{ sprite: 'pillar', x: 240, z: .14 }, { sprite: 'pillar', x: 1060, z: .14 },
          { sprite: 'bookshelf', x: 500, z: .1 }, { sprite: 'bookshelf', x: 800, z: .1 }],
        gizmos: K.rest(150),
        triggers: [PB.MapKit.bossTrigger({
          x: 620, flag: 'tr_redactor', entId: 'red', sprite: 'the_redactor',
          name: 'The Redactor', enemy: 'the_redactor', bg: 'library',
          before: [
            ['say', 'narr', 'The vault is full of books with nothing in them. Not blank pages — pages that were written on, and are not any more, and remember it.'],
            ['say', 'margo', 'Oh. Oh, no.']
          ],
          lines: [
            ['sayx', 'THE REDACTOR', 'the_redactor', '███ ██ ███ ████ ██████.', 'boss'],
            ['say', 'pip', 'Say that again.'],
            ['sayx', 'THE REDACTOR', 'the_redactor', 'YOU ARE NOT CLEARED FOR THE PREVIOUS SENTENCE.', 'boss'],
            ['say', 'margo', 'It is not censoring lies. Look at the shelves — it is on C. It is going alphabetically. It is removing EVERYTHING.'],
            ['sayx', 'THE REDACTOR', 'the_redactor', 'ANYTHING THAT CAN BE MISREAD SHOULD NOT BE READABLE. THIS IS NOT CRUELTY. THIS IS PROCEDURE.', 'boss'],
            ['say', 'pip', 'Nine million books.'],
            ['sayx', 'THE REDACTOR', 'the_redactor', 'NINE MILLION RISKS.', 'boss'],
            ['say', 'margo', 'Page four hundred and twelve. Whatever happens on page four hundred and thirteen — I have waited two hundred and six years and you do not get to black it out first.'],
            ['sayx', 'THE REDACTOR', 'the_redactor', 'THEN YOU WILL BE ██████ FIRST.', 'boss']
          ],
          after: [
            ['say', 'narr', 'The bars peel away. Underneath, there is nothing written at all — and then, slowly, ink starts coming back to nine million pages at once.'],
            ['say', 'margo', '...It is returning. All of it is returning.'],
            ['say', 'lumen', 'Then somebody had better hold a light while you read.'],
            ['wait', 30],
            ['sfx', 'seal'],
            ['title', 'SEAL V RECOVERED', 110],
            ['givekey', 'seal5'],
            ['seal', 'seal_redaction'],
            ['form', 'form_lantern'],
            ['say', 'sys', 'Seal Power learned: <c:#2a1c3c>Redaction</c> — strips every foe\'s specials and 2 Defence.\nNew Origami Form: <c:#ffe066>Lantern</c> — you and your partner recover HP every turn.'],
            ['flag', 'ch5_done', true],
            ['chapterset', 6],
            ['heal'],
            ['say', 'margo', 'Pip. When this is finished. Would you read page four hundred and thirteen to me. I find I cannot do it myself.'],
            ['say', 'pip', 'It is a delivery. I do those.'],
            ['goto', 'foldheim_road', 'ch5']
          ]
        })]
      }
    ]
  );
})();

/* ===== 25_maps_ch678.js ===== */
/* ==========================================================================
   PAPERBOUND — 25_maps_ch678.js
   CHAPTER 6 — Frostfold    CHAPTER 7 — The Foilworks    CHAPTER 8 — The Blank
   ========================================================================== */
'use strict';

(function () {
  var K = PB.MapKit, Shop = PB.Menus.defineShop, St = PB.State, U = PB.U;

  /* ======================================================================
     CHAPTER 6 — FROSTFOLD
     ====================================================================== */
  Shop('frostfold_hearth', {
    name: 'The Long Hearth', keeper: 'villager_b', markup: 1.15,
    greeting: 'Everything hot is double. Everything cold is free, and there is a great deal of it.',
    stock: ['creambun', 'deeproot', 'drycloth', 'emberpod', 'tonicwash', 'boldbrew', 'lifeleaf', 'frostnut']
  });

  K.chain(
    { chapter: 6, music: 'frost', theme: 'frost', battleBg: 'frost', entryWest: { to: 'foldheim_road', spawn: 'ch6' } },
    [
      {
        id: 'ff_pass', name: 'Frostfold Pass', w: 1500,
        props: K.scatter(['icechunk', 'rock', 'tree_pine'], 7, 1500),
        gizmos: K.rest(140).concat([
          { kind: 'sign', x: 460, z: .86, text: 'FROSTFOLD PASS.\nThree bells mark the way up. Ring them wrong and the mountain will let you know.' }
        ]),
        items: [{ kind: 'coin', x: 800, z: .5, amount: 12, flag: 'ff1_c1' }],
        foes: [{ id: 'ff1a', type: 'frostling', x: 1000, z: .64, patrol: 100, group: ['frostling', 'chillbug'], killFlag: 'ff1_f1' }],
        triggers: [{
          x: 320, z: .6, w: 100, d: 1.4, once: true, flag: 'tr_ch6',
          script: [
            ['chapter', 6, 'The Thing in the Glacier', 'Frostfold, and what it swallowed'],
            ['say', 'narr', 'Snow, and under the snow a quiet that is not the quiet of snow.'],
            ['say', 'lumen', 'I am going to be very popular here and I would like everyone to know I have earned it.']
          ]
        }]
      },
      {
        id: 'ff_village', name: 'Hearthfold', w: 1800, theme: 'interior', music: 'frost',
        props: [{ sprite: 'house_small', x: 280, z: .12 }, { sprite: 'house_small', x: 720, z: .1, scale: .95 },
          { sprite: 'house_small', x: 1440, z: .12 }, { sprite: 'brazier', x: 1000, z: .82 },
          { sprite: 'icechunk', x: 560, z: .9 }, { sprite: 'lamp', x: 1200, z: .84 }],
        gizmos: K.rest(180).concat([
          { kind: 'shop', x: 760, z: .44, shop: 'frostfold_hearth', label: 'Shop', sprite: 'shop_stall', scale: .8 },
          { kind: 'cook', x: 1080, z: .58, label: 'Cook', sprite: 'barrel' },
          { kind: 'inn', x: 1440, z: .44, price: 12, label: 'Rest', sprite: 'house_small', scale: .8 },
          { kind: 'sign', x: 420, z: .88, text: 'HEARTHFOLD. Everyone indoors by dark.\nThe dark is at four in the afternoon.' }
        ]),
        items: [{ kind: 'chest', x: 1740, z: .3, key: 'bell_key', flag: 'ff2_bell' }, { kind: 'coin', x: 900, z: .78, amount: 10, flag: 'ff2_c1' }],
        npcs: [
          {
            id: 'bellkeeper', sprite: 'elder_quill', x: 620, z: .68, name: 'Bellkeeper Rime',
            script: function () {
              if (St.questState('summit_bell') === 'done') return [['say', 'elder_quill', 'Three bells, right order, first time in nine years. The mountain heard it. I felt it hear it.']];
              if (St.questState('summit_bell') === 'open') return [
                ['say', 'elder_quill', 'Low, then high, then middle. Low. High. Middle. Say it back.'],
                ['say', 'pip', 'Low, high, middle.'],
                ['say', 'elder_quill', 'Good. Get it wrong and nothing bad happens, which is somehow worse. You simply start again with the mountain watching.']
              ];
              return [
                ['say', 'elder_quill', 'The bells hold the glacier still. Somebody has to ring them and I am eighty-four and made of paper.'],
                ['say', 'elder_quill', 'The crank is in my house somewhere. Order is low, high, middle. Do not improvise.'],
                ['quest', 'summit_bell', 'start']
              ];
            }
          },
          { id: 'ff_gran', sprite: 'grandma_creased', x: 1440, z: .58, name: 'Hearth Mother Kell', script: [['say', 'grandma_creased', 'Twelve coins. The fire is real and I keep it that way personally.'], ['inn', 12]] },
          { id: 'ff_kid', sprite: 'kid_dot', x: 1000, z: .86, name: 'Mitt', wander: 40, script: [['say', 'kid_dot', 'There is something IN the glacier. You can see it if you lie on the ice. It is big and it is CURLED UP.']] },
          { id: 'ff_hunter', sprite: 'sailor_keel', x: 1200, z: .7, name: 'Tracker Floe', script: [['say', 'sailor_keel', 'White hound on the upper passes. Bigger than me. Goes for whoever is weakest, so keep your friends fed.']] },
          { id: 'ff_chef', sprite: 'chef_pulp', x: 1080, z: .7, name: 'Stewmaster Frost', script: [['say', 'chef_pulp', 'Anything hot. That is the whole menu. Bring me two things and I will make them hot.'], ['cook']] }
        ]
      },
      {
        id: 'ff_bells', name: 'The Three Bells', w: 1800, theme: 'frost',
        eastLock: { needsFlag: 'ff_bells_rung', lockedMsg: 'The glacier road is sealed with ice. The bells are supposed to open it.' },
        props: K.scatter(['icechunk', 'pillar', 'rock'], 6, 1800),
        gizmos: [
          { kind: 'save', x: 150, z: .84 },
          {
            kind: 'switch', x: 500, z: .5, label: 'Low bell', once: false, sprite: 'brazier',
            script: [['sfx', 'ice'], ['func', function () { St.flag('ff_seq', (St.flag('ff_seq') || '') + 'L'); }], ['sub', [['func', function (w) { check(w); }]]]]
          },
          {
            kind: 'switch', x: 900, z: .5, label: 'High bell', once: false, sprite: 'brazier',
            script: [['sfx', 'ice'], ['func', function () { St.flag('ff_seq', (St.flag('ff_seq') || '') + 'H'); }], ['sub', [['func', function (w) { check(w); }]]]]
          },
          {
            kind: 'switch', x: 1300, z: .5, label: 'Middle bell', once: false, sprite: 'brazier',
            script: [['sfx', 'ice'], ['func', function () { St.flag('ff_seq', (St.flag('ff_seq') || '') + 'M'); }], ['sub', [['func', function (w) { check(w); }]]]]
          },
          { kind: 'sign', x: 260, z: .88, text: 'LOW. HIGH. MIDDLE.\nSomebody has added: "and if you get it wrong just start again, it is not a moral failing".' }
        ],
        items: [{ kind: 'coin', x: 1600, z: .78, amount: 14, flag: 'ff3_c1' }],
        foes: [{ id: 'ff3a', type: 'icicleimp', x: 1100, z: .7, patrol: 130, group: ['icicleimp', 'frostling'], killFlag: 'ff3_f1' }]
      },
      {
        id: 'ff_glacier', name: 'The Glacier Road', w: 1900, theme: 'frost',
        eastLock: { needsKey: 'summitrope', lockedMsg: 'The cliff needs a rope, and the rope is somewhere with fewer manners than this.' },
        props: K.scatter(['icechunk', 'rock'], 8, 1900),
        solids: [
          { x: 560, z: .42, w: 90, d: .28, h: 60 },
          { x: 860, z: .42, w: 90, d: .28, h: 120 },
          { x: 1160, z: .42, w: 90, d: .28, h: 180 },
          { x: 1460, z: .42, w: 90, d: .28, h: 120 }
        ],
        pits: [{ x0: 640, x1: 780, z0: .28, z1: .56, to: { x: 480, z: .78 } },
          { x0: 940, x1: 1080, z0: .28, z1: .56, to: { x: 480, z: .78 } },
          { x0: 1240, x1: 1380, z0: .28, z1: .56, to: { x: 480, z: .78 } }],
        items: [
          { kind: 'chest', x: 1160, z: .42, y: 180, key: 'summitrope', flag: 'ff4_rope' },
          { kind: 'chest', x: 860, z: .42, y: 120, item: 'glacierjelly', flag: 'ff4_ch1' },
          { kind: 'shard', x: 1750, z: .8, flag: 'ff4_shard' }
        ],
        gizmos: K.rest(150),
        foes: [
          { id: 'ff4a', type: 'snowcrease', x: 700, z: .68, patrol: 80, group: ['snowcrease', 'frostling'], killFlag: 'ff4_f1' },
          { id: 'ff4b', type: 'flurrik', x: 1600, z: .7, patrol: 130, group: ['flurrik', 'icicleimp', 'chillbug'], killFlag: 'ff4_f2' }
        ],
        triggers: [{
          x: 340, z: .6, w: 90, d: 1.4, once: true, flag: 'tr_glide_hint',
          script: [['say', 'twigby', 'Big gaps. Hold <c:#c8443c>Z</c> on the way down and the Plane fold will carry you further than it has any right to.']]
        }]
      },
      {
        id: 'ff_cavern', name: 'The Blue Cavern', w: 1700, theme: 'cave', music: 'frost', dark: true,
        props: K.scatter(['icechunk', 'rock', 'pillar'], 7, 1700),
        solids: [{ x: 800, z: .44, w: 100, d: .3, h: 62 }],
        items: [{ kind: 'chest', x: 800, z: .44, y: 62, badge: 'laststand', flag: 'ff5_ch1' },
          { kind: 'coin', x: 1200, z: .78, amount: 16, flag: 'ff5_c1' }],
        gizmos: K.rest(150),
        foes: [
          { id: 'ff5a', type: 'glaciat', x: 1000, z: .64, patrol: 60, group: ['glaciat', 'frostling'], killFlag: 'ff5_f1' },
          {
            id: 'ff5boss', type: 'fenrisk', x: 1520, z: .6, patrol: 0, chase: false, boss: true,
            group: ['fenrisk'], killFlag: 'ff_fenrisk_down',
            cfg: {
              boss: true, noRun: true, music: 'boss',
              introLine: 'The white hound does not growl. It picks whichever of you is weakest and looks only at them.',
              introSpeaker: 'Fenrisk', introPortrait: 'fenrisk'
            },
            onWin: [
              ['say', 'narr', 'It backs off up the tunnel without hurrying, the way a thing does when it has decided you are not worth the cold.'],
              ['give', 'lifeleaf']
            ]
          }
        ]
      },
      {
        id: 'ff_ascent', name: 'The Ascent', w: 1800, theme: 'frost',
        props: K.scatter(['icechunk', 'rock'], 6, 1800),
        solids: [
          { x: 700, z: .44, w: 100, d: .3, h: 70 },
          { x: 1100, z: .44, w: 100, d: .3, h: 140 },
          { x: 1400, z: .5, w: 150, d: .38, h: 0, id: 'ff_bridge', hidden: true }
        ],
        pits: [{ x0: 790, x1: 1010, z0: .28, z1: .58, to: { x: 620, z: .8 } }],
        items: [{ kind: 'chest', x: 1100, z: .44, y: 140, item: 'sevenlayer', flag: 'ff6_ch1' }],
        gizmos: [
          { kind: 'save', x: 150, z: .84 },
          {
            kind: 'plate', x: 1280, z: .5, once: true, reveals: 'ff_bridge', label: 'Press down',
            script: [['say', 'narr', 'The plate sinks. Somewhere above, a slab of ice swings out and becomes a bridge.']]
          },
          { kind: 'sign', x: 280, z: .88, text: 'THE ASCENT. Weight plates need weight.\nBe heavier. That is the whole instruction.' }
        ],
        foes: [{ id: 'ff6a', type: 'snowcrease', x: 900, z: .68, patrol: 90, group: ['snowcrease', 'glaciat', 'icicleimp'], killFlag: 'ff6_f1' }]
      },
      {
        id: 'ff_summit', name: 'The Summit', w: 1300, theme: 'frost', music: 'tense',
        props: [{ sprite: 'icechunk', x: 220, z: .12, scale: 1.4 }, { sprite: 'icechunk', x: 1080, z: .12, scale: 1.4 },
          { sprite: 'pillar', x: 520, z: .1 }, { sprite: 'pillar', x: 800, z: .1 }],
        gizmos: K.rest(150),
        triggers: [PB.MapKit.bossTrigger({
          x: 620, flag: 'tr_crinkle', entId: 'crk', sprite: 'crinkle_wyrm',
          name: 'Crinkle, the Glacier Wyrm', enemy: 'crinkle_wyrm', bg: 'frost',
          before: [['say', 'narr', 'The summit is a bowl of clear ice, and under the ice something enormous is curled around a small bright warmth, the way anyone would.']],
          lines: [
            ['sayx', 'Crinkle', 'crinkle_wyrm', 'warm. warm thing. mine. i found it.', 'boss'],
            ['say', 'pip', 'You did find it. It fell out of the sky and it landed on you.'],
            ['sayx', 'Crinkle', 'crinkle_wyrm', 'i thought it was the sun. i have never seen the sun. i have been under the ice since before there was a village.', 'boss'],
            ['say', 'lumen', 'It is not the sun. It is a fragment of a crown, and it is going out.'],
            ['sayx', 'Crinkle', 'crinkle_wyrm', 'no. no, it is warm.', 'boss'],
            ['say', 'lumen', 'It is warm because you are holding it against yourself. It has nothing left. In a month you will be curled around a cold thing and you will not have noticed.'],
            ['sayx', 'Crinkle', 'crinkle_wyrm', '...then i will hold it longer.', 'boss'],
            ['say', 'pip', 'Crinkle. There is a village down there with a fire that does not go out. Real one. Kept by hand.'],
            ['sayx', 'Crinkle', 'crinkle_wyrm', 'villages do not keep fires for THINGS UNDER THE ICE.', 'boss'],
            ['say', 'pip', 'No. They have not been asked.']
          ],
          after: [
            ['music', 'sad'],
            ['say', 'narr', 'The coils go slack across the ice. The fragment comes free, and it is cold, and it has been cold for weeks.'],
            ['sayx', 'Crinkle', 'crinkle_wyrm', '...it went out. when did it go out.', 'boss'],
            ['say', 'lumen', 'A while ago. I am sorry. Come down the mountain with me. I will not go out — that is the one thing I am for.'],
            ['wait', 30],
            ['sfx', 'seal'],
            ['title', 'SEAL VI RECOVERED', 110],
            ['givekey', 'seal6'],
            ['seal', 'seal_glacier'],
            ['flag', 'form_weight', true],
            ['say', 'sys', 'Seal Power learned: <c:#9fd8f0>Glacial Press</c> — 6 ice damage to all and a deep freeze.\nNew fold: <c:#cfd6de>Weight</c>. Press <c:#c8443c>V</c> on a weight plate to sink it.'],
            ['upgrade', 'stomp'],
            ['flag', 'ch6_done', true],
            ['chapterset', 7],
            ['heal'],
            ['say', 'twigby', 'Six. Pip. SIX.'],
            ['say', 'pip', 'One left, and then the person who tore it.'],
            ['goto', 'foldheim_road', 'ch6']
          ]
        })]
      }
    ]
  );

  /* The bell puzzle checker, called from the switch scripts above. */
  function check(w) {
    var seq = St.flag('ff_seq') || '';
    if (seq.length < 3) { PB.UI.toast(seq.split('').join(' - '), null, '#bfe4f8'); return; }
    if (seq === 'LHM') {
      St.flag('ff_bells_rung', true);
      St.flag('ff_seq', '');
      PB.Audio.fanfare('seal');
      w.runScript([
        ['say', 'narr', 'Three notes, in the right order, for the first time in nine years. The whole pass answers — a long crack of ice unlocking somewhere above.'],
        ['form', 'form_shear'],
        ['say', 'sys', 'New Origami Form: <c:#cfd6de>Shear</c> — every attack strikes twice and cuts clean.'],
        ['shard', 1],
        ['quest', 'summit_bell', 'done', 'The Summit Bell']
      ]);
    } else {
      St.flag('ff_seq', '');
      PB.Audio.sfx('error');
      PB.UI.toast('Wrong order. Start again.', null, '#f0a0a0');
    }
  }

  /* ======================================================================
     CHAPTER 7 — THE FOILWORKS
     ====================================================================== */
  Shop('foilworks_commissary', {
    name: 'Commissary Window 4', keeper: 'guard_gild', markup: 1.05,
    greeting: 'STATE REQUISITION. ...That is the greeting. I did not write it.',
    stock: ['creambun', 'deeproot', 'grandfeast', 'tonicwash', 'thunderrag', 'shreddisc', 'mirrorfoil', 'lastpage']
  });

  K.chain(
    { chapter: 7, music: 'foundry', theme: 'foundry', battleBg: 'foundry', entryWest: { to: 'foldheim_road', spawn: 'ch7' } },
    [
      {
        id: 'fw_gate', name: 'Foilworks Gate', w: 1400,
        props: K.scatter(['gear', 'crate', 'barrel'], 7, 1400),
        gizmos: K.rest(140).concat([
          { kind: 'sign', x: 460, z: .86, text: 'THE FOILWORKS — OUTPUT UP 400% ON LAST YEAR\nNo notice states what the output is.' }
        ]),
        items: [{ kind: 'coin', x: 800, z: .5, amount: 14, flag: 'fw1_c1' }],
        foes: [{ id: 'fw1a', type: 'foilrat', x: 1000, z: .64, patrol: 110, group: ['foilrat', 'sparkbit'], killFlag: 'fw1_f1' }],
        triggers: [{
          x: 320, z: .6, w: 100, d: 1.4, once: true, flag: 'tr_ch7',
          script: [
            ['chapter', 7, 'What the Press Is Printing', 'Foilworks, running at 400%'],
            ['say', 'narr', 'The whole valley shakes on a four-second cycle. Somewhere in there, something enormous is pressing something flat, over and over, and has been for years.'],
            ['say', 'margo', 'Four hundred per cent of what? That is the number they are proud of and nobody has written down the unit.']
          ]
        }]
      },
      {
        id: 'fw_yard', name: 'The Yard', w: 1800, theme: 'foundry',
        props: [{ sprite: 'gear', x: 300, z: .12, scale: 1.3 }, { sprite: 'gear', x: 1500, z: .12, scale: 1.2 },
          { sprite: 'crate', x: 1100, z: .84 }, { sprite: 'barrel', x: 1160, z: .9 },
          { sprite: 'anvil', x: 900, z: .7 }, { sprite: 'lamp', x: 600, z: .86 }],
        gizmos: K.rest(180).concat([
          { kind: 'shop', x: 720, z: .44, shop: 'foilworks_commissary', label: 'Window 4', sprite: 'shop_stall', scale: .75 },
          { kind: 'cook', x: 1040, z: .58, label: 'Cook', sprite: 'barrel' },
          { kind: 'sign', x: 420, z: .88, text: 'SHIFT ROTA: continuous.\nBREAK ROTA: pending review since year two.' }
        ]),
        items: [{ kind: 'chest', x: 1740, z: .3, item: 'grandfeast', flag: 'fw2_ch1' }],
        npcs: [
          { id: 'grit', sprite: 'miner_grit', x: 620, z: .68, name: 'Grit', script: [['say', 'miner_grit', 'Nobody on this floor knows what we print. Ampere knows. Ampere was COMMISSIONED, he says. By a Duke.'], ['say', 'pip', 'Duke Smudge.'], ['say', 'miner_grit', 'That is the one nobody says out loud. You said it out loud.']] },
          { id: 'fw_clerk', sprite: 'guard_gild', x: 720, z: .58, name: 'Clerk Gild', script: [['say', 'guard_gild', 'REQUISITION WINDOW FOUR. ...Please. I have said that eleven thousand times.'], ['shop', 'foilworks_commissary']] },
          { id: 'fw_chef', sprite: 'chef_pulp', x: 1040, z: .7, name: 'Canteen Rivet', script: [['say', 'chef_pulp', 'Continuous shift means continuous canteen. I have not sat down since the spring.'], ['cook']] },
          { id: 'fw_kid', sprite: 'kid_dash', x: 1250, z: .84, name: 'Shim', wander: 40, script: [['say', 'kid_dash', 'There is a little one in the reject bin that fixes things at night. Nobody believes me. It fixed my shoe.']] },
          { id: 'fw_scholar', sprite: 'scholar_ibis', x: 1400, z: .7, name: 'Inspector Vane', script: [['say', 'scholar_ibis', 'I have audited this facility four times. Output is real. Product is unaccounted for. Both of those cannot be true, and yet.']] }
        ],
        foes: [{ id: 'fw2a', type: 'coglet', x: 1550, z: .62, patrol: 90, group: ['coglet', 'sparkbit', 'foilrat'], killFlag: 'fw2_f1' }]
      },
      {
        id: 'fw_floor', name: 'The Works Floor', w: 1900, theme: 'foundry',
        props: K.scatter(['gear', 'crate', 'barrel', 'anvil'], 9, 1900),
        solids: [{ x: 700, z: .44, w: 100, d: .3, h: 60 }, { x: 1100, z: .44, w: 100, d: .3, h: 60 },
          { x: 1420, z: .5, w: 140, d: .36, h: 0, id: 'fw_powerbridge', hidden: true }],
        items: [
          { kind: 'chest', x: 700, z: .44, y: 60, key: 'cog_bundle', flag: 'fw3_cogs' },
          { kind: 'chest', x: 1100, z: .44, y: 60, item: 'thunderrag', flag: 'fw3_ch1' },
          { kind: 'coin', x: 1600, z: .78, amount: 18, flag: 'fw3_c1' }
        ],
        gizmos: [
          { kind: 'save', x: 150, z: .84 },
          {
            kind: 'generator', x: 1300, z: .5, needs: 'power', once: true, reveals: 'fw_powerbridge',
            label: 'Power up',
            script: [['say', 'volt', '*click* — LOG ENTRY. Dead line re-energised. Gantry extending. You are welcome.']]
          }
        ],
        foes: [
          { id: 'fw3a', type: 'voltoid', x: 900, z: .66, patrol: 100, group: ['voltoid', 'sparkbit'], killFlag: 'fw3_f1' },
          { id: 'fw3b', type: 'wirewing', x: 1700, z: .7, patrol: 130, group: ['wirewing', 'coglet', 'foilrat'], killFlag: 'fw3_f2' }
        ],
        triggers: [{
          x: 340, z: .6, w: 100, d: 1.4, once: true, flag: 'tr_volt',
          script: [
            ['say', 'narr', 'The reject bin is full of parts that failed inspection, and one of them is standing up, holding a blueprint, correcting it.'],
            ['spawn', { id: 'vlt', sprite: 'volt', x: 560, z: .6, name: 'Volt' }],
            ['wait', 26],
            ['say', 'volt', '*click* — LOG ENTRY. Three intruders. Two organic. One on fire. Filing under UNUSUAL.'],
            ['say', 'pip', 'You are correcting his blueprints.'],
            ['say', 'volt', 'CORRECTING. Yes. Line forty-one has been wrong for six years. I fix it. He prints it wrong again. I fix it.'],
            ['say', 'twigby', 'Why?'],
            ['say', 'volt', '*click* — because the alternative is that line forty-one stays wrong.'],
            ['say', 'pip', 'What does the press print, Volt?'],
            ['say', 'volt', '...LOG ENTRY. Query not cleared. Product manifest is sealed. I have read it anyway.'],
            ['say', 'volt', 'It prints nothing. Four hundred per cent of nothing. Blank sheets, in bales, shipped east, to the Citadel.'],
            ['say', 'margo', 'Blank. He is manufacturing BLANK.'],
            ['say', 'volt', '*click* — LOG ENTRY. Reclassified from SCRAP to CREW. Correcting record. Correcting record. ...Done.'],
            ['despawn', 'vlt'],
            ['partner', 'volt'],
            ['wait', 20],
            ['say', 'sys', 'Volt joined you.\n<c:#c8443c>C</c> charges dead switches and drags metal.\nIn battle, <c:#ffe066>Sparker</c> reaches anything and <c:#4fae62>Overclock</c> loads an ally\'s next attack.']
          ]
        }]
      },
      {
        id: 'fw_conveyor', name: 'The Conveyor', w: 1900, theme: 'foundry',
        eastLock: { needsKey: 'foilbadge', lockedMsg: 'The security gate wants a Foundry Pass. Somebody senior is carrying it.' },
        props: K.scatter(['gear', 'crate'], 8, 1900),
        solids: [
          { x: 520, z: .42, w: 90, d: .28, h: 64 },
          { x: 820, z: .42, w: 90, d: .28, h: 128 },
          { x: 1120, z: .42, w: 90, d: .28, h: 64 },
          { x: 1420, z: .5, w: 140, d: .36, h: 0, id: 'fw_plated', hidden: true }
        ],
        pits: [{ x0: 600, x1: 740, z0: .28, z1: .56, to: { x: 440, z: .8 } },
          { x0: 900, x1: 1040, z0: .28, z1: .56, to: { x: 440, z: .8 } }],
        items: [{ kind: 'chest', x: 820, z: .42, y: 128, badge: 'zaptap', flag: 'fw4_ch1' },
          { kind: 'shard', x: 1700, z: .8, flag: 'fw4_shard' }],
        gizmos: [
          { kind: 'save', x: 150, z: .84 },
          { kind: 'plate', x: 1300, z: .5, once: true, reveals: 'fw_plated', label: 'Press down', script: [['say', 'volt', '*click* — mass threshold met. Plate engaged.']] }
        ],
        foes: [
          { id: 'fw4a', type: 'sparkbit', x: 700, z: .7, patrol: 130, group: ['sparkbit', 'sparkbit', 'wirewing'], killFlag: 'fw4_f1' },
          { id: 'fw4b', type: 'pressbot', x: 1620, z: .6, patrol: 60, group: ['pressbot', 'coglet'], killFlag: 'fw4_f2' }
        ]
      },
      {
        id: 'fw_substation', name: 'The Substation', w: 1700, theme: 'foundry',
        props: K.scatter(['gear', 'anvil', 'barrel'], 7, 1700),
        solids: [{ x: 800, z: .44, w: 100, d: .3, h: 62 }],
        items: [{ kind: 'chest', x: 800, z: .44, y: 62, item: 'mirrorfoil', flag: 'fw5_ch1' }],
        gizmos: K.rest(150).concat([
          {
            kind: 'generator', x: 1200, z: .8, needs: 'power', once: true, label: 'Power up',
            script: [['coins', 40], ['say', 'volt', '*click* — vending unit re-energised after six years. Contents: coins. Dispensing.']]
          }
        ]),
        foes: [
          { id: 'fw5a', type: 'voltoid', x: 1000, z: .66, patrol: 90, group: ['voltoid', 'wirewing'], killFlag: 'fw5_f1' },
          {
            id: 'fw5boss', type: 'foreman_ratchet', x: 1520, z: .6, patrol: 0, chase: false, boss: true,
            group: ['foreman_ratchet'], killFlag: 'fw_ratchet_down',
            cfg: {
              boss: true, noRun: true, music: 'boss',
              introLine: 'Foreman Ratchet: "You are on my floor without a pass, and my floor has never once been under budget."',
              introSpeaker: 'Foreman Ratchet', introPortrait: 'foreman_ratchet'
            },
            onWin: [
              ['givekey', 'foilbadge'],
              ['sayx', 'Foreman Ratchet', 'foreman_ratchet', 'Pass. Take it. And when you get to the pressroom — ask him what we print. Go on. Ask him.', 'boss'],
              ['say', 'volt', '*click* — LOG ENTRY. Foreman Ratchet has known for four years. Filing under COMPLICITY, subsection EXHAUSTION.']
            ]
          }
        ]
      },
      {
        id: 'fw_core', name: 'The Core', w: 1700, theme: 'foundry',
        eastLock: { needsKey: 'press_key', lockedMsg: 'The pressroom door is keyed. The key is in the core somewhere, behind the noise.' },
        props: K.scatter(['gear', 'pillar'], 7, 1700),
        solids: [{ x: 700, z: .44, w: 100, d: .3, h: 66 }, { x: 1100, z: .44, w: 100, d: .3, h: 132 }],
        items: [{ kind: 'chest', x: 1100, z: .44, y: 132, key: 'press_key', flag: 'fw6_key' },
          { kind: 'chest', x: 700, z: .44, y: 66, badge: 'tripledip', flag: 'fw6_ch1' }],
        gizmos: K.rest(150),
        foes: [
          { id: 'fw6a', type: 'pressbot', x: 900, z: .64, patrol: 70, group: ['pressbot', 'voltoid'], killFlag: 'fw6_f1' },
          { id: 'fw6b', type: 'coglet', x: 1400, z: .68, patrol: 90, group: ['coglet', 'coglet', 'wirewing', 'sparkbit'], killFlag: 'fw6_f2' }
        ],
        npcs: [{
          id: 'fw_volt_quest', sprite: 'miner_grit', x: 400, z: .74, name: 'Grit',
          script: function () {
            if (St.questState('scrap_run') === 'done') return [['say', 'miner_grit', 'Six cogs. Volt has them laid out in a row and keeps counting them. It is oddly moving.']];
            if (St.hasKey('cog_bundle')) return [
              ['say', 'miner_grit', 'You found the bundle. Volt has been after those for years.'],
              ['takekey', 'cog_bundle'],
              ['shard', 1],
              ['quest', 'scrap_run', 'done', 'Scrap Run'],
              ['say', 'volt', '*click* — LOG ENTRY. Six cogs. All six. ...Filing under GOOD DAY.']
            ];
            return [['say', 'miner_grit', 'Volt wants six discarded cogs off the floor. Bundle of them went into a crate on the works floor.'], ['quest', 'scrap_run', 'start']];
          }
        }]
      },
      {
        id: 'fw_pressroom', name: 'The Pressroom', w: 1300, theme: 'foundry', music: 'tense',
        props: [{ sprite: 'gear', x: 220, z: .12, scale: 1.5 }, { sprite: 'gear', x: 1080, z: .12, scale: 1.5 },
          { sprite: 'pillar', x: 520, z: .1 }, { sprite: 'pillar', x: 800, z: .1 }],
        gizmos: K.rest(150),
        triggers: [PB.MapKit.bossTrigger({
          x: 620, flag: 'tr_ampere', entId: 'amp', sprite: 'chief_ampere',
          name: 'Chief Engineer Ampere', enemy: 'chief_ampere', bg: 'foundry',
          before: [['say', 'narr', 'Bales of blank paper, stacked to the roof, going out east on a belt that never stops. In the middle of it, a fragment of the Crown wired into a housing as a power source.']],
          lines: [
            ['sayx', 'AMPERE', 'chief_ampere', 'OUTPUT UP FOUR HUNDRED PER CENT ON LAST YEAR.', 'boss'],
            ['say', 'pip', 'Output of what?'],
            ['sayx', 'AMPERE', 'chief_ampere', 'PRODUCT.', 'boss'],
            ['say', 'margo', 'It is blank. Every sheet. You are running a valley of six hundred people flat out to manufacture nothing.'],
            ['sayx', 'AMPERE', 'chief_ampere', 'SPECIFICATION WAS PROVIDED BY THE COMMISSIONING PARTY. SPECIFICATION IS MET. EFFICIENCY IS A MORAL POSITION AND MINE IS EXCELLENT.', 'boss'],
            ['say', 'volt', '*click* — LOG ENTRY. Line forty-one is still wrong.'],
            ['sayx', 'AMPERE', 'chief_ampere', 'SCRAP UNIT. YOU WERE FILED.', 'boss'],
            ['say', 'volt', 'I refiled. And Chief — I have read the manifest. Blank paper, in bales, east, to the Citadel. Do you know what he is going to WRITE on it?'],
            ['sayx', 'AMPERE', 'chief_ampere', 'THAT IS NOT A PRODUCTION QUESTION.', 'boss'],
            ['say', 'pip', 'It is the only question. Shut the line down.'],
            ['sayx', 'AMPERE', 'chief_ampere', 'I WAS BUILT TO PRESS.', 'boss']
          ],
          after: [
            ['say', 'narr', 'The belt stops. Six hundred people hear silence for the first time in six years and come out onto the gantries to look at it.'],
            ['say', 'volt', '*click* — LOG ENTRY. Line forty-one: corrected. Permanently. ...Filing under FINALLY.'],
            ['wait', 26],
            ['sfx', 'seal'],
            ['title', 'SEAL VII RECOVERED', 110],
            ['givekey', 'seal7'],
            ['seal', 'seal_blank'],
            ['say', 'sys', 'Seal Power learned: <c:#f7f5ff>Blank Slate</c> — clears the field, heals 15 HP/FP and fills the Encore gauge.'],
            ['upgrade', 'mallet'],
            ['rankup', 'volt'],
            ['flag', 'ch7_done', true],
            ['chapterset', 8],
            ['heal'],
            ['say', 'narr', 'Seven seals. And, east of here, a very great deal of blank paper waiting for somebody to write on it.'],
            ['say', 'pip', 'Right. Last address.'],
            ['goto', 'foldheim_road', 'ch7']
          ]
        })]
      }
    ]
  );

  /* ======================================================================
     CHAPTER 8 — THE SMUDGE CITADEL AND THE BLANK
     ====================================================================== */
  K.chain(
    { chapter: 8, music: 'blot', theme: 'blot', battleBg: 'blot', entryWest: { to: 'foldheim_road', spawn: 'ch8' } },
    [
      {
        id: 'sc_bridge', name: 'The Long Bridge', w: 1600,
        eastLock: { needsKey: 'citadel_writ', lockedMsg: 'The gate reads writs and nothing else. You will need one, and it will need to be convincing.' },
        props: K.scatter(['inkpool', 'pillar', 'banner'], 7, 1600),
        gizmos: K.rest(140).concat([
          { kind: 'sign', x: 460, z: .86, text: 'THE SMUDGE CITADEL\nAll visitors by writ. All writs by the Duke. All Dukes by the Duke.' }
        ]),
        items: [{ kind: 'coin', x: 900, z: .5, amount: 20, flag: 'sc1_c1' }],
        foes: [{ id: 'sc1a', type: 'blotling', x: 1100, z: .64, patrol: 100, group: ['blotling', 'smudgeling'], killFlag: 'sc1_f1' }],
        triggers: [{
          x: 320, z: .6, w: 100, d: 1.4, once: true, flag: 'tr_ch8',
          script: [
            ['chapter', 8, 'The Last Address', 'the Citadel, and what is behind it'],
            ['say', 'narr', 'The Citadel is not shaped like a building. It is shaped like the end of a sentence.'],
            ['wait', 20],
            ['spawn', { id: 'nib8', sprite: 'courier_nib', x: 640, z: .62, name: 'Nib', face: 'left' }],
            ['say', 'courier_nib', 'Pip.'],
            ['say', 'pip', 'Nib.'],
            ['say', 'courier_nib', 'Seven seals. I did not think you would get past three. I had money on three.'],
            ['say', 'courier_nib', 'The gate reads writs. Here — forged, by me, badly, on Citadel stock. It will hold for one reading and then it will start arguing.'],
            ['givekey', 'citadel_writ'],
            ['say', 'pip', 'Why?'],
            ['say', 'courier_nib', 'Because I have been carrying his letters for nine years and none of them have ever been sent. Nine years of a man writing to people and then filing it.'],
            ['say', 'courier_nib', 'A courier who never delivers is not a courier. I would like to be one again.'],
            ['say', 'pip', 'Come with us.'],
            ['say', 'courier_nib', 'No. Somebody has to be outside to sign for you when you come out.'],
            ['despawn', 'nib8'],
            ['quest', 'smudge_letters', 'start']
          ]
        }]
      },
      {
        id: 'sc_gates', name: 'The Ink Gates', w: 1800,
        props: K.scatter(['pillar', 'inkpool', 'banner'], 8, 1800),
        solids: [{ x: 700, z: .44, w: 100, d: .3, h: 64 }, { x: 1100, z: .44, w: 100, d: .3, h: 64 }],
        items: [{ kind: 'chest', x: 700, z: .44, y: 64, item: 'lastpage', flag: 'sc2_ch1' },
          { kind: 'chest', x: 1100, z: .44, y: 64, item: 'sevenlayer', flag: 'sc2_ch2' }],
        gizmos: K.rest(160),
        foes: [
          { id: 'sc2a', type: 'inkhound', x: 900, z: .66, patrol: 100, group: ['inkhound', 'blotling'], killFlag: 'sc2_f1' },
          { id: 'sc2b', type: 'nibguard', x: 1500, z: .62, patrol: 70, group: ['nibguard', 'smudgeling', 'blotling'], killFlag: 'sc2_f2' }
        ]
      },
      {
        id: 'sc_halls', name: 'The Blotted Halls', w: 1900, dark: true,
        props: K.scatter(['pillar', 'inkpool', 'bookshelf'], 9, 1900),
        solids: [{ x: 620, z: .42, w: 90, d: .28, h: 62 }, { x: 1000, z: .42, w: 90, d: .28, h: 124 },
          { x: 1340, z: .5, w: 140, d: .36, h: 0, id: 'sc_lit', hidden: true }],
        pits: [{ x0: 700, x1: 900, z0: .28, z1: .56, to: { x: 560, z: .8 } }],
        items: [{ kind: 'chest', x: 1000, z: .42, y: 124, badge: 'luckyday', flag: 'sc3_ch1' },
          { kind: 'shard', x: 1780, z: .8, flag: 'sc3_shard' }],
        gizmos: [
          { kind: 'save', x: 150, z: .84 },
          {
            kind: 'seam', x: 1220, z: .5, needs: 'light', once: true, reveals: 'sc_lit',
            label: 'Burn through',
            script: [['say', 'lumen', 'Ink hates me. I want that on the record as a point of pride.']]
          }
        ],
        foes: [
          { id: 'sc3a', type: 'erasure', x: 800, z: .68, patrol: 110, group: ['erasure', 'smudgeling'], killFlag: 'sc3_f1' },
          { id: 'sc3b', type: 'blotknight', x: 1600, z: .62, patrol: 80, group: ['blotknight', 'blotling', 'inkhound'], killFlag: 'sc3_f2' }
        ]
      },
      {
        id: 'sc_gallery', name: 'The Gallery of Unsent Letters', w: 1800,
        props: K.scatter(['bookshelf', 'pillar', 'banner'], 8, 1800),
        solids: [{ x: 900, z: .44, w: 100, d: .3, h: 66 }],
        items: [{ kind: 'chest', x: 900, z: .44, y: 66, key: 'smudge_letters', flag: 'sc4_letters' },
          { kind: 'coin', x: 1300, z: .78, amount: 30, flag: 'sc4_c1' }],
        gizmos: K.rest(160).concat([
          {
            kind: 'glyph', x: 1500, z: .8, needs: 'read', once: true, label: 'Read',
            script: [
              ['say', 'margo', '"To my brother, who I have not written to, because there is nothing in me worth reading. — S."'],
              ['say', 'margo', 'They are all like that, Pip. Nine of them. Nine years.'],
              ['ifitem', 'smudge_letters', [['quest', 'smudge_letters', 'done', 'Unsent Letters'], ['give', 'lastpage']]]
            ]
          }
        ]),
        foes: [{ id: 'sc4a', type: 'smudgeling', x: 1100, z: .66, patrol: 100, group: ['smudgeling', 'smudgeling', 'erasure'], killFlag: 'sc4_f1' }],
        triggers: [{
          x: 340, z: .6, w: 100, d: 1.4, once: true, flag: 'tr_gallery',
          script: [
            ['say', 'narr', 'A long room, and every wall of it framed letters. Sealed, addressed, stamped, and never once put in a bag.'],
            ['say', 'twigby', 'These are all his handwriting.'],
            ['say', 'pip', 'Nine years of them. Nib carried every one of these to this room and hung it on a wall.']
          ]
        }]
      },
      {
        id: 'sc_stair', name: 'The Black Stair', w: 1700,
        props: K.scatter(['pillar', 'inkpool'], 7, 1700),
        solids: [{ x: 700, z: .44, w: 100, d: .3, h: 70 }, { x: 1050, z: .44, w: 100, d: .3, h: 140 }],
        pits: [{ x0: 790, x1: 960, z0: .28, z1: .56, to: { x: 620, z: .8 } }],
        items: [{ kind: 'chest', x: 1050, z: .44, y: 140, item: 'grandfeast', flag: 'sc5_ch1' }],
        gizmos: K.rest(150),
        foes: [
          { id: 'sc5a', type: 'nibguard', x: 900, z: .68, patrol: 70, group: ['nibguard', 'erasure'], killFlag: 'sc5_f1' },
          {
            id: 'sc5boss', type: 'captain_sable', x: 1520, z: .6, patrol: 0, chase: false, boss: true,
            group: ['captain_sable'], killFlag: 'sc_sable_down',
            cfg: {
              boss: true, noRun: true, music: 'boss',
              introLine: 'Captain Sable: "Quillton. The parcel. You are the courier who would not let go of it."',
              introSpeaker: 'Captain Sable', introPortrait: 'captain_sable'
            },
            onWin: [
              ['music', 'sad'],
              ['sayx', 'Captain Sable', 'captain_sable', 'Hm. Adequate.', 'boss'],
              ['say', 'pip', 'You went easy.'],
              ['sayx', 'Captain Sable', 'captain_sable', 'I did no such thing and you will not say otherwise in front of my guard.', 'boss'],
              ['say', 'pip', 'There is no guard here.'],
              ['sayx', 'Captain Sable', 'captain_sable', '...No. There is not.', 'boss'],
              ['sayx', 'Captain Sable', 'captain_sable', 'I have served him nine years. I worked out what he serves in year four. I have been executing lawful orders on behalf of an absence ever since, and I have been very good at it, which is the part I would like on my record.', 'boss'],
              ['say', 'pip', 'Then stand down and it is not on your record at all.'],
              ['sayx', 'Captain Sable', 'captain_sable', 'It is always on the record. Go up. Do not let him talk first — he is much better at it than you.', 'boss'],
              ['give', 'lastpage']
            ]
          }
        ]
      },
      {
        id: 'sc_throne', name: 'The Signing Room', w: 1400, music: 'tense',
        props: [{ sprite: 'pillar', x: 240, z: .12 }, { sprite: 'pillar', x: 1160, z: .12 },
          { sprite: 'banner', x: 480, z: .1 }, { sprite: 'banner', x: 920, z: .1 },
          { sprite: 'inkpool', x: 700, z: .88 }],
        gizmos: K.rest(150),
        triggers: [PB.MapKit.bossTrigger({
          x: 640, flag: 'tr_smudge', entId: 'duke', sprite: 'duke_smudge',
          name: 'Duke Smudge', enemy: 'duke_smudge', bg: 'blot',
          before: [['say', 'narr', 'Bales of blank paper, floor to ceiling, and one desk. At the desk, a man who has been signing things for a very long time.']],
          lines: [
            ['sayx', 'Duke Smudge', 'duke_smudge', 'Sit down, courier. You have had a long road and I have had a long century.', 'boss'],
            ['say', 'pip', 'You tore it.'],
            ['sayx', 'Duke Smudge', 'duke_smudge', 'I tore it. Yes. In a room in Quillton with bunting up, and I would do it again this afternoon.', 'boss'],
            ['say', 'pip', 'Why.'],
            ['sayx', 'Duke Smudge', 'duke_smudge', 'Because it spoke to me. Not the Crown — the thing behind the Crown. It said: everything written will be unwritten, and it is only a question of the order.', 'boss'],
            ['sayx', 'Duke Smudge', 'duke_smudge', 'And then it said: tear the Crown, and I will do you last.', 'boss'],
            ['say', 'margo', 'You believed it.'],
            ['sayx', 'Duke Smudge', 'duke_smudge', 'I NEGOTIATED. There is a difference and it is the only dignity I have left.', 'boss'],
            ['say', 'pip', 'There are nine letters on your wall downstairs. Sealed and addressed and never sent.'],
            ['sayx', 'Duke Smudge', 'duke_smudge', '...Do not.', 'boss'],
            ['say', 'pip', 'A man who thinks nothing he writes is worth reading made a deal with a thing that unwrites. That is not negotiation, Duke. That is agreeing with it.'],
            ['sayx', 'Duke Smudge', 'duke_smudge', 'You are a SMEAR on a very fine page. Let me correct that.', 'boss']
          ],
          after: [
            ['givekey', 'crown_core'],
            ['say', 'narr', 'The desk goes over. The Duke does not get up.'],
            ['sayx', 'Duke Smudge', 'duke_smudge', 'Take the core. Take it and go and — no. No, wait. Listen.', 'boss'],
            ['sayx', 'Duke Smudge', 'duke_smudge', 'It is coming through. It said it would do me LAST and it is doing me FIRST, because I am the nearest thing to blank in the building—', 'boss'],
            ['sfx', 'roar'], ['shake', 24],
            ['music', 'final'],
            ['fadeout', '#f7f5ff', .12],
            ['goto', 'sc_ascend', 'west'],
            ['fadein', .1]
          ]
        })]
      },
      {
        id: 'sc_ascend', name: 'The Pouring Through', w: 1300, music: 'final', theme: 'blot',
        noEast: true,
        props: [{ sprite: 'pillar', x: 220, z: .12 }, { sprite: 'pillar', x: 1080, z: .12 }],
        onEnter: [
          ['spawn', { id: 'asc', sprite: 'smudge_ascendant', x: 860, z: .55, name: 'Smudge Ascendant', face: 'left' }],
          ['sfx', 'roar'], ['shake', 26],
          ['sayx', 'SMUDGE ASCENDANT', 'smudge_ascendant', 'I AM THE LAST LINE. AFTER ME, MARGIN.', 'boss'],
          ['say', 'pip', 'Duke. Duke, you are still in there. Nine letters. Somebody should read them.'],
          ['sayx', 'SMUDGE ASCENDANT', 'smudge_ascendant', 'THERE IS NOTHING IN THEM WORTH—', 'boss'],
          ['say', 'margo', 'That is not for you to decide! That has NEVER been for the writer to decide!'],
          ['battle', {
            enemies: ['smudge_ascendant'], boss: true, noRun: true, bg: 'blot', music: 'final'
          }, [
            ['despawn', 'asc'],
            ['music', 'sad'],
            ['say', 'narr', 'What is left of the Duke folds down onto the flagstones, ordinary and grey and very tired.'],
            ['sayx', 'Duke Smudge', 'duke_smudge', 'It is still coming. I only ever held the door.', 'boss'],
            ['say', 'pip', 'Then tell me where the door is.'],
            ['sayx', 'Duke Smudge', 'duke_smudge', 'Behind the paper. All of it. Four hundred per cent of nothing, courier, and every sheet is a way in.', 'boss'],
            ['sayx', 'Duke Smudge', 'duke_smudge', '...Deliver them. The nine. If there is time afterwards.', 'boss'],
            ['say', 'pip', 'It is a delivery. I do those.'],
            ['wait', 40],
            ['fadeout', '#f7f5ff', .06],
            ['goto', 'sc_between', 'west'],
            ['fadein', .05]
          ]]
        ]
      },
      {
        id: 'sc_between', name: 'The Blank Between', w: 1400, music: 'voidsong', theme: 'voidt', battleBg: 'void_',
        noEast: true,
        gizmos: K.rest(150),
        onEnter: [
          ['say', 'narr', 'There is no floor here, and you are standing on it. There is no light, and you can see. This is what a page is before anyone has been rude enough to write on it.'],
          ['wait', 20],
          ['spawn', { id: 'blank', sprite: 'the_blank', x: 900, z: .55, name: 'The Blank', face: 'left' }],
          ['wait', 30],
          ['sayx', 'THE BLANK', 'the_blank', 'there was nothing before you. i am simply patient.', 'boss'],
          ['say', 'pip', 'You told him you would spare him.'],
          ['sayx', 'THE BLANK', 'the_blank', 'i told him nothing. he read a blank page and heard a promise. they always do. that is the only trick i have and it has never once failed.', 'boss'],
          ['say', 'margo', 'Pip. Pip, it cannot read. It has never read anything. It does not know what is IN the seals.'],
          ['sayx', 'THE BLANK', 'the_blank', 'seven marks. i will take seven marks the way i have taken every other mark.', 'boss'],
          ['say', 'pip', 'They are not marks. They are promises. Seven of them, and I have collected every one, and a promise is the only thing you cannot unwrite — because it does not live on the page.'],
          ['sayx', 'THE BLANK', 'the_blank', 'then where.', 'boss'],
          ['say', 'pip', 'In whoever was told.'],
          ['music', 'final'],
          ['battle', {
            enemies: ['the_blank'], boss: true, noRun: true, bg: 'void_', music: 'final'
          }, [
            ['despawn', 'blank'],
            ['stopmusic'],
            ['wait', 40],
            ['say', 'narr', 'It does not die. It goes back to being an absence, the way a held breath goes back to being air — and around the edges of it, very faintly, there is writing again.'],
            ['music', 'voidsong'],
            ['wait', 20],
            ['say', 'pip', 'Right. Seven parcels. One crown.'],
            ['sfx', 'seal'],
            ['title', 'THE ORIGAMI CROWN', 130],
            ['say', 'narr', 'Pip folds it the way couriers fold everything: quickly, badly, and so it holds.'],
            ['wait', 20],
            ['say', 'twigby', 'Pip. Pip, that is — you did it wrong. That crease is completely wrong.'],
            ['say', 'pip', 'It holds.'],
            ['say', 'twigby', 'It HOLDS, but—'],
            ['say', 'pip', 'Twigby. It holds.'],
            ['ifpartner', 'lumen', [['say', 'lumen', 'Four hundred years I wanted a view. This will do. This will do very well.']]],
            ['ifpartner', 'bloop', [['say', 'bloop', 'Is it over? Can I go and tell Sogport? I am VERY good at telling people things.']]],
            ['ifpartner', 'snip', [['say', 'snip', 'Nine hundred people should have seen that. Nine hundred. And it was just us.']]],
            ['ifpartner', 'margo', [['say', 'margo', 'Pip. When there is time. Page four hundred and thirteen.'], ['say', 'pip', 'Tonight. I will read it twice.']]],
            ['ifpartner', 'volt', [['say', 'volt', '*click* — LOG ENTRY. Line forty-one: corrected. Crown: reassembled. World: still here. ...Filing under GOOD DAY.']]],
            ['wait', 30],
            ['fadeout', '#f7edd6', .04],
            ['say', 'narr', 'Quillton gets its Founding Day eleven weeks late, with the bunting rehung and the Crown on a cushion that is far too small for it, and one courier asleep in a chair through the entire ceremony.'],
            ['say', 'narr', 'Nine letters go out in the morning post. All nine are read. Two are answered.'],
            ['flag', 'game_clear', true],
            ['chapterset', 9],
            ['wait', 20],
            ['title', 'THE END', 150],
            ['credits']
          ]]
        ]
      }
    ]
  );
})();

/* ===== 26_maps_extra.js ===== */
/* ==========================================================================
   PAPERBOUND — 26_maps_extra.js
   Optional content: the Folded Coliseum ladder (20 ranks), the paper bin
   behind Foil's stall, and the trophy vault. None of it gates the main path.
   ========================================================================== */
'use strict';

(function () {
  var M = PB.Maps.define, K = PB.MapKit, Shop = PB.Menus.defineShop, St = PB.State, U = PB.U;

  Shop('coliseum_quartermaster', {
    name: 'The Quartermaster', keeper: 'guard_gild', markup: 1.2,
    greeting: 'Fighters buy. Spectators browse. Which are you? — Do not answer, the ladder answers for you.',
    stock: ['grandfeast', 'lastpage', 'tonicwash', 'mirrorfoil', 'shreddisc', 'secondwindvial', 'sealwater', 'crowdcandy']
  });

  /* ---- the ladder -------------------------------------------------------
     rank 20 is the bottom rung; rank 1 is the Sovereign. */
  var LADDER = [
    { r: 20, foes: ['crumple', 'crumple', 'snapleaf'], pay: 12 },
    { r: 19, foes: ['snapleaf', 'thornhopper', 'twigling'], pay: 16 },
    { r: 18, foes: ['barkbug', 'mossback', 'petalwisp'], pay: 20 },
    { r: 17, foes: ['emberling', 'emberling', 'cinderfly'], pay: 26 },
    { r: 16, foes: ['magmite', 'ashgoyle', 'wickling'], pay: 32 },
    { r: 15, foes: ['soggle', 'drizzler', 'barnacleaf'], pay: 38 },
    { r: 14, foes: ['brinehound', 'inkfish', 'tidewisp'], pay: 44 },
    { r: 13, foes: ['clipling', 'clipling', 'juggloon', 'confettoid'], pay: 52 },
    { r: 12, foes: ['papercut', 'papercut', 'trapezoid'], pay: 60 },
    { r: 11, foes: ['stiltjack', 'staplebug', 'wadball'], pay: 68 },
    { r: 10, foes: ['erratum', 'redliner', 'glyphling'], pay: 78 },
    { r: 9, foes: ['dogear', 'marginalis', 'gluegoop'], pay: 88 },
    { r: 8, foes: ['frostling', 'snowcrease', 'icicleimp'], pay: 100 },
    { r: 7, foes: ['glaciat', 'flurrik', 'chillbug'], pay: 112 },
    { r: 6, foes: ['voltoid', 'wirewing', 'coglet', 'sparkbit'], pay: 126 },
    { r: 5, foes: ['pressbot', 'foilrat', 'coglet'], pay: 142 },
    { r: 4, foes: ['blotling', 'smudgeling', 'inkhound'], pay: 160 },
    { r: 3, foes: ['nibguard', 'erasure', 'blotknight'], pay: 190 },
    { r: 2, foes: ['captain_sable', 'blotknight'], pay: 240, boss: true },
    { r: 1, foes: ['origami_sovereign'], pay: 400, boss: true }
  ];

  function nextRung() {
    var cur = St.get().coliseumRank;          // 0 = never fought
    var wantRank = cur === 0 ? 20 : cur - 1;
    if (wantRank < 1) return null;
    for (var i = 0; i < LADDER.length; i++) if (LADDER[i].r === wantRank) return LADDER[i];
    return null;
  }

  function registrarScript() {
    var rung = nextRung();
    var S = St.get();
    if (!rung) {
      return [
        ['say', 'guard_gild', 'Rank one. There is nothing above rank one. There is only the vault, and the vault is not a rank, it is a warning.'],
        ['ifflag', 'game_clear', [
          ['say', 'guard_gild', 'The east door is open to you. Read the plaque before you go in. Read it twice.']
        ], [
          ['say', 'guard_gild', 'Come back when the world is safe. The vault does not open for people with unfinished business.']
        ]]
      ];
    }
    var label = rung.r === 1 ? 'The Origami Sovereign' : 'Rank ' + rung.r;
    return [
      ['say', 'guard_gild', 'Current standing: ' + (S.coliseumRank === 0 ? 'unranked' : 'rank ' + S.coliseumRank) + '. Next bout: ' + label + '. Purse: ' + rung.pay + ' coins.'],
      ['ask', 'guard_gild', 'Do you want the bout?', ['Fight', 'Not yet'], [
        [
          ['sub', rung.r === 1 ? [
            ['say', 'narr', 'The Sovereign has held rank one since before the Crown was torn. It does not enter the ring. It is already in the ring; the ring was built around it.'],
            ['sayx', 'The Origami Sovereign', 'origami_sovereign', 'Show me a crease worth keeping.', 'boss']
          ] : []],
          ['battle', {
            enemies: rung.foes, boss: !!rung.boss, noRun: true,
            bg: 'coliseum', music: rung.boss ? 'boss' : 'coliseum'
          }, [
            ['func', function () { var s = St.get(); s.coliseumRank = Math.max(s.coliseumRank, rung.r); }],
            ['coins', rung.pay],
            ['sub', rung.r === 1 ? [
              ['sayx', 'The Origami Sovereign', 'origami_sovereign', 'Adequate. Keep the rank; I have held it long enough.', 'boss'],
              ['quest', 'coliseum_climb', 'done', 'Twenty Rounds'],
              ['badge', 'sealseeker'],
              ['shard', 1],
              ['say', 'guard_gild', 'Rank one. First change at the top in four hundred years. I will need a new board.']
            ] : [
              ['say', 'guard_gild', 'Rank ' + rung.r + ' is yours. Next one is worse. They are all next one is worse.']
            ]],
            ['heal']
          ]]
        ],
        []
      ]]
    ];
  }

  /* ---- the Coliseum ------------------------------------------------------ */
  M('cl_lobby', {
    name: 'The Folded Coliseum', chapter: 4, music: 'coliseum', theme: 'coliseum', battleBg: 'coliseum',
    bounds: { x0: 0, x1: 1700, z0: .14, z1: .92 },
    spawns: { default: { x: 100, z: .6 }, west: { x: 60, z: .6 }, east: { x: 1640, z: .6, face: 'left' } },
    exits: [
      { x: 8, z: .6, w: 40, d: 1, to: 'foldheim_road', spawn: 'east' },
      { x: 1688, z: .6, w: 40, d: 1, to: 'cl_arena', spawn: 'west' },
      {
        x: 1400, z: .18, w: 70, d: .3, door: true, to: 'cl_vault', spawn: 'west',
        needsFlag: 'game_clear',
        lockedMsg: 'The vault door has no handle on this side. A plaque reads: NOT UNTIL THE WORLD IS SAFE.'
      }
    ],
    props: [
      { sprite: 'pillar', x: 260, z: .12 }, { sprite: 'pillar', x: 620, z: .12 },
      { sprite: 'pillar', x: 1080, z: .12 }, { sprite: 'banner', x: 440, z: .16 },
      { sprite: 'banner', x: 900, z: .16 }, { sprite: 'lamp', x: 340, z: .86 },
      { sprite: 'lamp', x: 1250, z: .86 }, { sprite: 'crate', x: 1500, z: .84 }
    ],
    gizmos: K.rest(160).concat([
      { kind: 'shop', x: 900, z: .44, shop: 'coliseum_quartermaster', label: 'Quartermaster', sprite: 'shop_stall', scale: .78 },
      {
        kind: 'sign', x: 460, z: .88,
        text: 'THE FOLDED COLISEUM\nTwenty ranks. Rank one has not changed hands in four hundred years.\nNo refunds. No mercy. Excellent seating.'
      }
    ]),
    items: [{ kind: 'coin', x: 700, z: .78, amount: 10, flag: 'cl_c1' }],
    npcs: [
      { id: 'registrar', sprite: 'guard_gild', x: 1150, z: .64, name: 'The Registrar', script: registrarScript },
      {
        id: 'cl_bard', sprite: 'bard_octavo', x: 620, z: .74, name: 'Octavo', wander: 50,
        script: [['say', 'bard_octavo', 'I followed you here for the ballad. It is going very well. It is mostly about how much you get hit.']]
      },
      {
        id: 'cl_watcher', sprite: 'sage_vellum', x: 1400, z: .58, name: 'Vellum',
        script: [
          ['say', 'sage_vellum', 'There is a thing in the vault behind me. It was bound by the Crown seven hundred years ago and it has counted every one of those days.'],
          ['ifflag', 'game_clear', [
            ['say', 'sage_vellum', 'You may go in now. I will not pretend I think you should.']
          ], [
            ['say', 'sage_vellum', 'Not yet. Finish what you started. Then come back and be foolish.']
          ]]
        ]
      }
    ]
  });

  M('cl_arena', {
    name: 'The Ring', chapter: 4, music: 'coliseum', theme: 'coliseum', battleBg: 'coliseum',
    bounds: { x0: 0, x1: 1100, z0: .2, z1: .9 },
    spawns: { default: { x: 100, z: .6 }, west: { x: 60, z: .6 } },
    exits: [{ x: 8, z: .6, w: 40, d: 1, to: 'cl_lobby', spawn: 'east' }],
    props: [
      { sprite: 'pillar', x: 220, z: .14 }, { sprite: 'pillar', x: 880, z: .14 },
      { sprite: 'banner', x: 400, z: .12 }, { sprite: 'banner', x: 700, z: .12 }
    ],
    gizmos: [
      { kind: 'heartblock', x: 200, z: .84 },
      { kind: 'sign', x: 340, z: .86, text: 'THE RING.\nSand is swept between bouts. It is not sand. Nobody asks.' }
    ],
    npcs: [{
      id: 'ring_reg', sprite: 'guard_gild', x: 700, z: .64, name: 'The Registrar', script: registrarScript
    }]
  });

  M('cl_vault', {
    name: 'The Bound Vault', chapter: 4, music: 'tense', theme: 'coliseum', battleBg: 'coliseum',
    bounds: { x0: 0, x1: 1200, z0: .22, z1: .88 },
    spawns: { default: { x: 100, z: .6 }, west: { x: 60, z: .6 } },
    exits: [{ x: 8, z: .6, w: 40, d: 1, to: 'cl_lobby', spawn: 'east' }],
    props: [
      { sprite: 'pillar', x: 240, z: .14 }, { sprite: 'pillar', x: 960, z: .14 },
      { sprite: 'inkpool', x: 620, z: .86 }
    ],
    gizmos: K.rest(150).concat([
      {
        kind: 'sign', x: 360, z: .86,
        text: 'BOUND HERE BY THE ORIGAMI CROWN, SEVEN HUNDRED YEARS AGO:\nVERMILLION.\nThe Crown is mended. The binding is not.'
      }
    ]),
    triggers: [{
      x: 700, z: .6, w: 110, d: 1.4, once: true, flag: 'tr_vermillion',
      script: [
        ['camera', 900, 50],
        ['say', 'narr', 'The vault is one long red coil, wound around nothing, waiting with the patience of something that has been counting.'],
        ['spawn', { id: 'verm', sprite: 'vermillion', x: 940, z: .55, name: 'Vermillion', face: 'left' }],
        ['sfx', 'roar'], ['shake', 22],
        ['sayx', 'VERMILLION', 'vermillion', 'the Crown bound me for SEVEN HUNDRED YEARS.', 'boss'],
        ['say', 'pip', 'It is mended. It will hold again.'],
        ['sayx', 'VERMILLION', 'vermillion', 'and you think a COURIER holds it now?', 'boss'],
        ['say', 'pip', 'Somebody has to be the right shape.'],
        ['music', 'final'],
        ['battle', { enemies: ['vermillion'], boss: true, noRun: true, bg: 'coliseum', music: 'final' },
          [
            ['despawn', 'verm'],
            ['say', 'narr', 'The coil goes slack and the binding takes hold again, tighter than before, because this time somebody is holding the other end on purpose.'],
            ['give', 'sevenlayer'],
            ['badge', 'tripledip'],
            ['shard', 1],
            ['toast', 'The hardest fight in Foldheim: cleared.', null, '#f5c02e'],
            ['heal']
          ]]
      ]
    }]
  });

  /* ---- the paper bin behind Foil's stall --------------------------------- */
  M('quill_bin', {
    name: 'The Paper Bin', chapter: 6, music: 'tense', theme: 'cave', battleBg: 'stage',
    bounds: { x0: 0, x1: 1200, z0: .24, z1: .88 },
    spawns: { default: { x: 100, z: .6 }, west: { x: 60, z: .6 }, east: { x: 1140, z: .6, face: 'left' } },
    exits: [{ x: 8, z: .6, w: 40, d: 1, to: 'quill_lane', spawn: 'east' }],
    props: [
      { sprite: 'crate', x: 260, z: .84 }, { sprite: 'barrel', x: 320, z: .88 },
      { sprite: 'rock', x: 900, z: .84 }, { sprite: 'inkpool', x: 640, z: .86 }
    ],
    gizmos: [
      { kind: 'save', x: 160, z: .82 },
      { kind: 'sign', x: 300, z: .84, text: 'PAPER BIN — QUILLTON LANE\nDrafts, off-cuts, mistakes. Collected Thursdays.' }
    ],
    triggers: [{
      x: 620, z: .6, w: 110, d: 1.4, once: true, flag: 'tr_firstdraft', needsFlag: 'ch6_done',
      script: [
        ['camera', 850, 50],
        ['say', 'narr', 'Something in the off-cuts is breathing. It has been breathing for as long as you have been alive, which is exactly as long as you have been alive.'],
        ['spawn', { id: 'fd', sprite: 'first_draft', x: 880, z: .55, name: '?', face: 'left' }],
        ['wait', 30],
        ['sayx', '?', 'first_draft', 'pip.', 'boss'],
        ['say', 'pip', '...How do you know that name?'],
        ['sayx', '?', 'first_draft', 'it was going to be mine.', 'boss'],
        ['say', 'twigby', 'Pip. Pip, it has your face.'],
        ['sayx', 'The First Draft', 'first_draft', 'i had the cap first. i had the mallet first. i had the NAME first, and then somebody looked at me and said: no, again, better.', 'boss'],
        ['sayx', 'The First Draft', 'first_draft', 'and they folded you. and they put me HERE. thursdays.', 'boss'],
        ['say', 'pip', 'I did not know.'],
        ['sayx', 'The First Draft', 'first_draft', 'no. the fair copy never does.', 'boss'],
        ['say', 'pip', 'What do you want?'],
        ['sayx', 'The First Draft', 'first_draft', 'i want to be the one who was kept. so: everything you know, i knew first. show me you have done something with it.', 'boss'],
        ['music', 'boss'],
        ['battle', { enemies: ['first_draft'], boss: true, noRun: true, bg: 'stage', music: 'boss' },
          [
            ['despawn', 'fd'],
            ['music', 'sad'],
            ['say', 'narr', 'It comes apart along creases that were never finished, and it does not seem to mind.'],
            ['sayx', 'The First Draft', 'first_draft', '...you got better at it. good. that is what a draft is FOR.', 'boss'],
            ['say', 'pip', 'Come out of the bin.'],
            ['sayx', 'The First Draft', 'first_draft', 'no. i am the version that got thrown away. that is a whole thing to be. i would like to be it properly.', 'boss'],
            ['sayx', 'The First Draft', 'first_draft', 'take the page. it is the last one i had.', 'boss'],
            ['give', 'lastpage'],
            ['shard', 1],
            ['quest', 'first_draft', 'done', 'The Draft in the Bin'],
            ['heal'],
            ['camerafree']
          ]]
      ]
    }, {
      x: 620, z: .6, w: 110, d: 1.4, once: true, flag: 'tr_bin_empty', notFlag: 'ch6_done',
      script: [['say', 'narr', 'Off-cuts, drafts, mistakes. Nothing else. Something moves right at the back and then decides not to.']]
    }]
  });

  /* Give the lane a way in, now that the bin exists. */
  (function () {
    var lane = PB.Maps.get('quill_lane');
    if (!lane) return;
    lane.spawns.east = lane.spawns.east || { x: 940, z: .6, face: 'left' };
    lane.exits.push({
      x: 500, z: .18, w: 70, d: .3, door: true, to: 'quill_bin', spawn: 'west',
      needsFlag: 'ch6_done',
      lockedMsg: 'A paper bin. Off-cuts and drafts. Nothing worth climbing into.'
    });
  })();
})();

/* ===== 30_game.js ===== */
/* ==========================================================================
   PAPERBOUND — 30_game.js
   Boot, the fixed-timestep loop, canvas scaling, the title screen, file
   select, new-game flow, game over and credits.
   ========================================================================== */
'use strict';

PB.Game = (function () {
  var U = PB.U, P = PB.Paper, In = PB.Input, A = PB.Audio, Spr = PB.Sprites;
  var UI = PB.UI, St = PB.State;

  var W = 960, H = 540;
  var canvas, ctx, dpr = 1;
  var scene = 'boot';
  var t = 0;
  var world = null;
  var titleMenu = null, fileMenu = null, diffMenu = null;
  var fader = new UI.Fader();
  var confetti = [];
  var lastSlot = 1;
  var errBanner = null;

  /* ---- setup ------------------------------------------------------------- */
  function init(cv) {
    canvas = cv;
    ctx = canvas.getContext('2d', { alpha: false });
    resize();
    window.addEventListener('resize', resize);
    In.bind(canvas);
    P.buildTexture(W, H);

    var cfg = St.loadConfig();
    if (cfg) { if (cfg.music !== undefined) A.setMusicVol(cfg.music); if (cfg.sfx !== undefined) A.setSfxVol(cfg.sfx); }

    // the browser needs a gesture before audio may start
    var kick = function () { A.resume(); window.removeEventListener('pointerdown', kick); window.removeEventListener('keydown', kick); };
    window.addEventListener('pointerdown', kick);
    window.addEventListener('keydown', kick);

    for (var i = 0; i < 60; i++) confetti.push(newConfetti(true));
    toTitle();
    requestAnimationFrame(frame);
  }

  function resize() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    var availW = window.innerWidth, availH = window.innerHeight;
    var scale = Math.min(availW / W, availH / H);
    canvas.style.width = Math.floor(W * scale) + 'px';
    canvas.style.height = Math.floor(H * scale) + 'px';
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    ctx = canvas.getContext('2d', { alpha: false });
    ctx.imageSmoothingEnabled = true;
  }

  /* ---- fixed timestep ---------------------------------------------------- */
  var STEP = 1000 / 60;
  var acc = 0, last = 0;
  function frame(now) {
    if (!last) last = now;
    var dt = Math.min(120, now - last);
    last = now;
    acc += dt;
    var guard = 0;
    while (acc >= STEP && guard < 4) { update(); acc -= STEP; guard++; }
    if (guard >= 4) acc = 0;
    render();
    requestAnimationFrame(frame);
  }

  function update() {
    t++;
    In.update();
    A.tick();
    fader.update();
    try {
      if (scene === 'title') updateTitle();
      else if (scene === 'files') updateFiles();
      else if (scene === 'newgame') updateNew();
      else if (scene === 'world' && world) world.update();
      else if (scene === 'gameover') updateGameOver();
    } catch (e) {
      if (window.console) console.error(e);
      errBanner = { msg: (e && e.message) || 'unknown error', t: 0 };
    }
    In.postUpdate();
    for (var i = 0; i < confetti.length; i++) stepConfetti(confetti[i]);
    if (errBanner) { errBanner.t++; if (errBanner.t > 300) errBanner = null; }
  }

  function render() {
    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.fillStyle = '#0f0a18';
    ctx.fillRect(0, 0, W, H);
    try {
      if (scene === 'title' || scene === 'files' || scene === 'newgame') drawTitle();
      else if (scene === 'world' && world) world.draw(ctx);
      else if (scene === 'gameover') drawGameOver();
    } catch (e) {
      if (window.console) console.error(e);
      P.text(ctx, 'render error — see console', W / 2, H / 2, { size: 18, align: 'center', color: '#f0a0a0' });
    }
    fader.draw(ctx);
    if (errBanner) {
      ctx.save(); ctx.globalAlpha = U.clamp(1 - errBanner.t / 300, 0, 1);
      P.rr(ctx, 10, H - 34, W - 20, 26, 6, 'rgba(120,20,30,.85)', '#e0483c', 2);
      P.text(ctx, 'error: ' + errBanner.msg, 20, H - 15, { size: 13, color: '#ffd8d8', outline: false, shadow: false });
      ctx.restore();
    }
    ctx.restore();
  }

  /* ======================================================================
     Title screen
     ====================================================================== */
  function newConfetti(spread) {
    return {
      x: U.rndRange(-40, W + 40), y: spread ? U.rndRange(-40, H) : -30,
      vy: U.rndRange(.5, 1.8), vx: U.rndRange(-.5, .5),
      r: U.rndRange(4, 11), rot: U.rndRange(0, 6.3), vr: U.rndRange(-.05, .05),
      c: U.pick(['#e0483c', '#f5c02e', '#57b8ea', '#8fcf52', '#f07a8a', '#c8a2e8', '#fdf6e3'])
    };
  }
  function stepConfetti(c) {
    c.y += c.vy; c.x += c.vx + Math.sin(c.y * .02) * .5; c.rot += c.vr;
    if (c.y > H + 40) { var n = newConfetti(false); for (var k in n) c[k] = n[k]; }
  }

  function toTitle() {
    scene = 'title';
    A.play('title');
    var items = [];
    var anySave = St.peek(1) || St.peek(2) || St.peek(3);
    if (anySave) items.push({ k: 'continue', label: 'Continue' });
    items.push({ k: 'new', label: 'New Game' });
    items.push({ k: 'howto', label: 'How to Play' });
    titleMenu = new UI.Menu({
      items: items, x: W / 2 - 140, y: 336, w: 280, rows: 4, rowH: 40,
      fill: '#fdf6e3', edge: '#8a6a3a',
      drawRow: function (c, it, x, y, w, h, sel) {
        P.text(c, it.label, x + w / 2 - 8, y + h / 2 + 7, { size: 20, align: 'center', color: '#2a1c3c', outline: false, shadow: false });
      },
      onPick: function (it) {
        if (it.k === 'continue') { scene = 'files'; buildFileMenu('load'); }
        else if (it.k === 'new') { scene = 'newgame'; buildDiffMenu(); }
        else showHowTo();
      },
      onCancel: function () { }
    });
    howto = null;
  }

  var howto = null;
  function showHowTo() {
    howto = {
      page: 0, pages: [
        {
          title: 'Getting About',
          lines: [
            'Arrow keys or WASD — walk. Up and down move you deeper',
            'into the scene, not just up and down the screen.',
            '',
            'Z — jump, talk, read, confirm.',
            'X — swing the mallet, and cancel in menus.',
            'C — your partner\'s field ability.',
            'V — fold (slip through cracks, press weight plates).',
            'Q / E — run.   Esc — satchel.   Tab — map.'
          ]
        },
        {
          title: 'Fighting',
          lines: [
            'Every attack has an action command. Land it and you do',
            'full damage; nail it PERFECTLY and you do more.',
            '',
            'After a perfect hit, tap X in the flash window for a',
            'STYLISH finish — it fills the ENCORE gauge and wins',
            'over the crowd.',
            '',
            'On defence: press Z just before a hit to GUARD.',
            'Press X even later to SUPERGUARD and take nothing.'
          ]
        },
        {
          title: 'Getting Stronger',
          lines: [
            'Seal Points level you up. Each level you pick one of',
            'HP +5, FP +5, or BP +3.',
            '',
            'Badges cost BP and change how you fight. Origami Forms',
            'cost FP and reshape Pip for a few turns.',
            '',
            'Foil Shards rank up your partners. Seal Powers come',
            'from the seven seals you are chasing.'
          ]
        }
      ]
    };
  }

  function buildDiffMenu() {
    diffMenu = new UI.Menu({
      title: 'How hard would you like this?',
      items: [
        { k: 'relaxed', label: 'Relaxed', sub: 'You take much less damage. For the story.' },
        { k: 'normal', label: 'Normal', sub: 'The intended fight. Start here.' },
        { k: 'folded', label: 'Folded', sub: 'Foes hit half again as hard, and pay better.' }
      ],
      x: W / 2 - 210, y: 250, w: 420, rows: 3, rowH: 46,
      drawRow: function (c, it, x, y, w, h, sel) {
        P.text(c, it.label, x + 8, y + 20, { size: 18, color: '#2a1c3c', outline: false, shadow: false });
        P.text(c, it.sub, x + 8, y + 38, { size: 13, color: '#7a6a4a', outline: false, shadow: false });
      },
      onPick: function (it) { startNew(it.k); },
      onCancel: function () { toTitle(); }
    });
  }

  function buildFileMenu(mode) {
    function rows() {
      var r = [];
      for (var i = 1; i <= 3; i++) r.push({ slot: i, info: St.peek(i) });
      r.push({ back: true });
      return r;
    }
    fileMenu = new UI.Menu({
      title: mode === 'load' ? 'Load which file?' : 'Save to which file?',
      items: rows(), x: W / 2 - 240, y: 190, w: 480, rows: 4, rowH: 54,
      fill: '#fdf6e3', edge: '#8a6a3a',
      enabled: function (it) { return it.back || !!it.info; },
      drawRow: function (c, it, x, y, w, h, sel) {
        if (it.back) { P.text(c, 'Back', x + 10, y + h / 2 + 6, { size: 17, color: '#c8443c', outline: false, shadow: false }); return; }
        P.text(c, 'File ' + it.slot, x + 10, y + 22, { size: 17, color: it.info ? '#2a1c3c' : '#a89a78', outline: false, shadow: false });
        if (it.info) {
          P.text(c, it.info.name + '   Lv ' + it.info.level + '   ' + it.info.seals + '/7 seals   ' + St.DIFF[it.info.difficulty].label,
            x + 100, y + 22, { size: 14, color: '#6b5a3a', outline: false, shadow: false });
          var mp = PB.Maps.get(it.info.map);
          P.text(c, U.timeStr(it.info.frames) + '   ' + it.info.coins + ' coins   ' + (mp ? mp.name : ''),
            x + 100, y + 42, { size: 12, color: '#8a7a5a', outline: false, shadow: false });
        } else P.text(c, '— empty —', x + 100, y + 30, { size: 14, color: '#a89a78', outline: false, shadow: false });
      },
      onPick: function (it) {
        if (it.back) { toTitle(); return; }
        if (!it.info) { A.sfx('error'); return; }
        lastSlot = it.slot;
        loadSlot(it.slot);
      },
      onCancel: function () { toTitle(); }
    });
  }

  function updateTitle() {
    if (howto) {
      if (In.pressed('a') || In.pressed('right')) { howto.page++; A.sfx('ok'); if (howto.page >= howto.pages.length) howto = null; }
      else if (In.pressed('b')) { howto = null; A.sfx('cancel'); }
      else if (In.pressed('left') && howto.page > 0) { howto.page--; A.sfx('cursor'); }
      return;
    }
    titleMenu.update();
  }
  function updateFiles() { fileMenu.update(); }
  function updateNew() { diffMenu.update(); }

  function drawTitle() {
    // paper backdrop
    var g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#4a3560'); g.addColorStop(.55, '#8a5fc0'); g.addColorStop(1, '#f0a63c');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    // layered torn hills
    for (var l = 0; l < 3; l++) {
      P.tornEdge(ctx, -20, W + 20, 300 + l * 46, 18 - l * 4, 26, l * 2.7 + t * .002,
        ['#3f2f52', '#2f2440', '#241a34'][l], true, H + 10);
    }
    // confetti
    for (var i = 0; i < confetti.length; i++) {
      var c = confetti[i];
      ctx.save(); ctx.globalAlpha = .85;
      ctx.translate(c.x, c.y); ctx.rotate(c.rot);
      P.rr(ctx, -c.r / 2, -c.r / 3, c.r, c.r * .66, 1.5, c.c, null, 0);
      ctx.restore();
    }

    // hero + first partner posing
    Spr.draw(ctx, 'pip', 216, 372, { t: t, anim: 'idle', scale: 2.1 });
    Spr.draw(ctx, 'twigby', 742, 372, { t: t + 40, anim: 'idle', scale: 2.0, flip: -1 });

    // logo
    ctx.save();
    ctx.translate(W / 2, 132);
    ctx.rotate(Math.sin(t * .012) * .012);
    P.rr(ctx, -318, -58, 636, 108, 16, '#fdf6e3', '#2a1c3c', 5);
    P.rr(ctx, -306, -48, 612, 88, 12, null, '#c8a06a', 2);
    P.textWave(ctx, 'PAPERBOUND', 0, 18, {
      size: 62, align: 'center', color: '#e0483c', outlineColor: '#2a1c3c', ow: 9,
      amp: 4, freq: .42, phase: t * .04
    });
    ctx.restore();
    P.text(ctx, 'The Seven Seals of Foldheim', W / 2, 210, { size: 19, align: 'center', color: '#fff3d0' });

    if (howto) {
      var pg = howto.pages[howto.page];
      ctx.save(); ctx.fillStyle = 'rgba(15,10,24,.72)'; ctx.fillRect(0, 0, W, H); ctx.restore();
      P.panel(ctx, 120, 70, W - 240, H - 150, { fill: '#fdf6e3', edge: '#8a6a3a', radius: 16 });
      P.text(ctx, pg.title, W / 2, 118, { size: 28, align: 'center', color: '#2a1c3c', outline: false, shadow: false });
      P.line(ctx, [[170, 132], [W - 170, 132]], '#c8a06a', 2);
      for (var k = 0; k < pg.lines.length; k++) {
        P.text(ctx, pg.lines[k], 176, 172 + k * 26, { size: 16, color: '#3a2a44', outline: false, shadow: false });
      }
      P.text(ctx, (howto.page + 1) + ' / ' + howto.pages.length + '     Z next     X close',
        W / 2, H - 106, { size: 14, align: 'center', color: '#8a7a5a', outline: false, shadow: false });
    } else if (scene === 'title') {
      titleMenu.draw(ctx);
      P.text(ctx, 'Z select   •   arrow keys move', W / 2, H - 22, { size: 13, align: 'center', color: '#fff3d0' });
    } else if (scene === 'files') fileMenu.draw(ctx);
    else if (scene === 'newgame') diffMenu.draw(ctx);

    P.overlayTexture(ctx, W, H, .45);
    P.overlayVignette(ctx, W, H);
  }

  /* ======================================================================
     Start / load
     ====================================================================== */
  function startNew(difficulty) {
    fader.out(function () {
      St.start('Pip', difficulty);
      world = PB.World.create(API);
      world.load('quill_square', 'default');
      scene = 'world';
      fader.in(null, .06);
    }, .07, '#0f0a18');
  }

  function loadSlot(slot) {
    fader.out(function () {
      if (!St.load(slot)) { toTitle(); fader.in(null, .06); return; }
      var S = St.get();
      world = PB.World.create(API);
      world.load(PB.Maps.has(S.map) ? S.map : 'quill_square', S.spawn || 'default');
      scene = 'world';
      fader.in(null, .06);
    }, .07, '#0f0a18');
  }

  /* ======================================================================
     Game over
     ====================================================================== */
  var goMenu = null;
  function gameOver() {
    scene = 'gameover';
    A.stop();
    A.play('sad');
    var items = [];
    if (St.peek(lastSlot) || St.peek(1) || St.peek(2) || St.peek(3)) items.push({ k: 'load', label: 'Load a file' });
    items.push({ k: 'title', label: 'Back to the title' });
    goMenu = new UI.Menu({
      items: items, x: W / 2 - 160, y: 320, w: 320, rows: 3, rowH: 40,
      onPick: function (it) {
        if (it.k === 'load') { scene = 'files'; A.play('title'); buildFileMenu('load'); }
        else toTitle();
      },
      onCancel: function () { }
    });
  }
  function updateGameOver() { goMenu.update(); }
  function drawGameOver() {
    ctx.fillStyle = '#160f22'; ctx.fillRect(0, 0, W, H);
    for (var i = 0; i < 40; i++) {
      var x = U.wrap(i * 137 + t * .2, W + 40) - 20;
      var y = U.wrap(i * 79 - t * .3, H + 40) - 20;
      ctx.globalAlpha = .18;
      P.rr(ctx, x, y, 9, 6, 1.5, '#3a2a4a', null, 0);
      ctx.globalAlpha = 1;
    }
    Spr.draw(ctx, 'pip', W / 2, 300, { t: t, anim: 'defeat', scale: 2.2, shadow: false });
    UI.title(ctx, 'CRUMPLED', 176, { t: t, color: '#e0483c', size: 52 });
    P.text(ctx, 'Paper tears. Paper also mends.', W / 2, 224, { size: 16, align: 'center', color: '#c8bcd8' });
    goMenu.draw(ctx);
    P.overlayVignette(ctx, W, H);
  }

  /* ======================================================================
     Credits
     ====================================================================== */
  var CREDITS = [
    '#PAPERBOUND',
    'The Seven Seals of Foldheim',
    '', '',
    '#CAST',
    'Pip — courier, first class',
    'Twigby — Creasewood scout',
    'Lumen — the kept flame',
    'Bloop — the folded boat',
    'Snip — the understudy',
    'Margo — the marginalia',
    'Volt — the spare part',
    '', '',
    '#ANTAGONISTS',
    'Bramblejack, the Thorn Marionette',
    'Duchess Pyra Sizzlefold',
    'Nautilus Grim',
    'The Great Kerf',
    'The Redactor',
    'Crinkle, the Glacier Wyrm',
    'Chief Engineer Ampere',
    'Captain Sable of the Blotguard',
    'Duke Smudge',
    'The Blank',
    '', '',
    '#EVERYTHING YOU SAW AND HEARD',
    'was drawn with lines and filled with flat colour',
    'at sixty frames a second.',
    'No image files. No audio files.',
    'Every sprite is a shape. Every note is a wave.',
    '', '',
    '#WITH THANKS',
    'to every paper RPG that got there first,',
    'and to anyone who ever pressed the button',
    'at exactly the right moment.',
    '', '', '',
    'Thank you for playing.',
    '', '',
    'Press Z to return to the title.'
  ];
  function rollCredits() {
    if (world) world.startCredits(CREDITS);
  }

  /* ======================================================================
     API handed to the world scene
     ====================================================================== */
  var API = {
    gameOver: gameOver,
    toTitle: function () {
      fader.out(function () { world = null; toTitle(); fader.in(null, .06); }, .07);
    },
    rollCredits: rollCredits,
    get scene() { return scene; },
    get world() { return world; }
  };

  /* Exposed for the smoke test in tools/smoke.js */
  function _debug() {
    return {
      scene: scene, t: t, world: world, state: St.get(),
      maps: Object.keys(PB.Maps.all()).length,
      startNew: startNew,
      warp: function (mapId, spawn) { if (world) world.load(mapId, spawn || 'default'); },
      battle: function (ids, boss) {
        if (!world) return;
        world.startBattle({ enemies: ids, boss: !!boss, bg: 'stage' }, function () { });
      }
    };
  }

  return { init: init, toTitle: toTitle, gameOver: gameOver, rollCredits: rollCredits, _debug: _debug, API: API, W: W, H: H };
})();

/* Boot as soon as the canvas exists. When the bundle is injected into an
   already-loaded document the 'load' event has been and gone, so check first. */
(function () {
  function boot() {
    var cv = document.getElementById('game');
    if (cv) PB.Game.init(cv);
  }
  if (document.readyState === 'complete' || document.readyState === 'interactive') setTimeout(boot, 0);
  else window.addEventListener('DOMContentLoaded', boot);
})();

</script>
