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
