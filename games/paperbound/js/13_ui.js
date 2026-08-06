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
