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
