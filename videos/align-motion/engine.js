/* =============================================================================
   Align in Motion · deterministic motion-graphics engine
   -----------------------------------------------------------------------------
   Every visual is a pure function of time. Nothing depends on requestAnimation-
   Frame deltas, Math.random() at draw time, or CSS transitions. That is what
   lets render.mjs seek to an exact timestamp and screenshot a reproducible
   frame, while the same file still plays live when opened in Chrome.

   Layers, back to front:
     1. CSS background gradient          (static, painted by the stylesheet)
     2. #lattice canvas                  atom field: drifting nodes + bonds
     3. .stage DOM                       slides, type, photo panels, cards
     4. #fx canvas                       logo particle system
     5. .grain / .vignette               static texture overlays
     6. .chrome                          progress bar, rail, slide counter
   ========================================================================== */
(function (global) {
  'use strict';

  var W = 1920, H = 1080;
  var ORANGE = [254, 146, 53];          // #FE9235  sampled from the logo mark
  var COOL = [214, 230, 255];           // cool white for lattice + particles

  /* ---------------------------------------------------------------- easing */
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function c01(v) { return clamp(v, 0, 1); }
  function outCubic(t) { t = c01(t); return 1 - Math.pow(1 - t, 3); }
  function outQuint(t) { t = c01(t); return 1 - Math.pow(1 - t, 5); }
  function inOut(t) { t = c01(t); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function smooth(t) { t = c01(t); return t * t * (3 - 2 * t); }
  function mix(a, b, t) { return a + (b - a) * t; }

  /* Deterministic hash-based PRNG. Same index always yields the same value,
     so particle "randomness" survives a seek to an arbitrary frame. */
  function rnd(i, salt) {
    var x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
    return x - Math.floor(x);
  }

  /* ============================================================== LATTICE ==
     The "atoms" motif that runs underneath every slide. Nodes drift on
     closed sinusoidal paths (so motion loops smoothly and is seekable) and
     bond to neighbours inside a radius. Deliberately low-contrast: it should
     register as texture, never compete with the headline.
     ====================================================================== */
  function Lattice(canvas, count) {
    this.ctx = canvas.getContext('2d');
    this.nodes = [];
    for (var i = 0; i < count; i++) {
      this.nodes.push({
        bx: rnd(i, 1) * W,
        by: rnd(i, 2) * H,
        ax: 26 + rnd(i, 3) * 62,          // drift amplitude
        ay: 20 + rnd(i, 4) * 54,
        fx: 0.055 + rnd(i, 5) * 0.10,     // drift frequency
        fy: 0.048 + rnd(i, 6) * 0.10,
        px: rnd(i, 7) * 6.283,            // phase
        py: rnd(i, 8) * 6.283,
        r: 1.1 + rnd(i, 9) * 2.3,
        warm: rnd(i, 10) < 0.24           // ~1 in 4 nodes carries brand orange
      });
    }
  }
  Lattice.prototype.draw = function (t, intensity) {
    var ctx = this.ctx, n = this.nodes, i, j, a, b, d, dx, dy;
    ctx.clearRect(0, 0, W, H);
    if (intensity <= 0.001) return;
    for (i = 0; i < n.length; i++) {
      a = n[i];
      a.x = a.bx + Math.sin(t * a.fx * 6.283 + a.px) * a.ax;
      a.y = a.by + Math.cos(t * a.fy * 6.283 + a.py) * a.ay;
    }
    /* bonds first so nodes sit on top of their own lines */
    ctx.lineWidth = 1;
    for (i = 0; i < n.length; i++) {
      a = n[i];
      for (j = i + 1; j < n.length; j++) {
        b = n[j];
        dx = a.x - b.x; dy = a.y - b.y;
        d = dx * dx + dy * dy;
        if (d > 46000) continue;
        d = Math.sqrt(d);
        var al = (1 - d / 214) * 0.16 * intensity;
        if (al <= 0.004) continue;
        var warm = a.warm && b.warm;
        ctx.strokeStyle = warm
          ? 'rgba(254,146,53,' + al.toFixed(4) + ')'
          : 'rgba(150,190,255,' + al.toFixed(4) + ')';
        ctx.beginPath();
        ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
    for (i = 0; i < n.length; i++) {
      a = n[i];
      /* slow twinkle keeps the field alive during long holds */
      var tw = 0.55 + 0.45 * Math.sin(t * 1.7 + a.px * 3);
      var al = (a.warm ? 0.50 : 0.34) * tw * intensity;
      var c = a.warm ? ORANGE : COOL;
      ctx.fillStyle = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + al.toFixed(4) + ')';
      ctx.beginPath();
      ctx.arc(a.x, a.y, a.r, 0, 6.283);
      ctx.fill();
    }
  };

  /* ============================================================ LOGO ATOMS ==
     The centrepiece. The mark is sampled into ~3.6k particles which:
       converge  -> particles swarm in from off-screen and lock onto the mark
       solidify  -> crossfade to the crisp bitmap so the logo reads FULL
       hold      -> full logo, breathing scale, specular sheen sweep
       disperse  -> crossfade back to particles, which accelerate outward and
                    fade, handing the frame to the slide underneath
     A subset of particles act as lattice "nodes" and draw bonds while in
     motion, which is what sells the molecular read.
     ====================================================================== */
  function LogoAtoms(img, targetCount) {
    this.img = img;
    this.pts = [];
    var iw = img.naturalWidth, ih = img.naturalHeight;
    var c = document.createElement('canvas');
    c.width = iw; c.height = ih;
    var cx = c.getContext('2d', { willReadFrequently: true });
    cx.drawImage(img, 0, 0);
    var data = cx.getImageData(0, 0, iw, ih).data;

    /* pick a sampling step that lands near the requested particle budget */
    var opaque = 0, s;
    for (s = 0; s < iw * ih; s += 7) { if (data[s * 4 + 3] > 140) opaque++; }
    var est = opaque * 7;
    var step = Math.max(2, Math.round(Math.sqrt(est / targetCount)));

    var k = 0;
    for (var y = 0; y < ih; y += step) {
      for (var x = 0; x < iw; x += step) {
        var o = (y * iw + x) * 4;
        if (data[o + 3] < 140) continue;
        var r = data[o], g = data[o + 1], b = data[o + 2];
        this.pts.push({
          u: x / iw, v: y / ih,
          warm: (r - b) > 55,                       // orange chevron vs white wordmark
          sz: 1.5 + rnd(k, 21) * 1.5,
          a1: rnd(k, 22), a2: rnd(k, 23),
          a3: rnd(k, 24), a4: rnd(k, 25),
          node: (k % 27 === 0)
        });
        k++;
      }
    }
    this.sprites = { cool: sprite(COOL), warm: sprite(ORANGE) };

    function sprite(c) {
      var S = 22, cv = document.createElement('canvas');
      cv.width = cv.height = S;
      var g = cv.getContext('2d').createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
      g.addColorStop(0, 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',1)');
      g.addColorStop(0.32, 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',0.62)');
      g.addColorStop(1, 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',0)');
      var g2 = cv.getContext('2d');
      g2.fillStyle = g; g2.fillRect(0, 0, S, S);
      return cv;
    }
  }

  /* lt = local time inside the logo beat; ph = phase boundaries in seconds */
  LogoAtoms.prototype.draw = function (ctx, lt, ph, box) {
    var img = this.img, pts = this.pts;
    var lw = box.w, lh = lw * img.naturalHeight / img.naturalWidth;
    var lx = box.cx - lw / 2, ly = box.cy - lh / 2;

    var conv = c01((lt - ph.t0) / (ph.t1 - ph.t0));      // 0..1 swarm in
    var solid = c01((lt - ph.t1) / (ph.t2 - ph.t1));     // 0..1 become crisp
    var disp = c01((lt - ph.t3) / (ph.t4 - ph.t3));      // 0..1 blow apart

    /* ---- crisp bitmap: the "appears full" beat --------------------------
       It hands off early in the dispersal (gone by disp 0.5) so the particles
       carry the exit. Holding it longer leaves a ghost logo floating over the
       incoming slide. */
    var crisp = smooth(solid) * (1 - smooth(c01(disp / 0.5)));
    if (crisp > 0.002) {
      var breath = 1 + 0.008 * Math.sin((lt - ph.t1) * 1.5);
      var bw = lw * breath, bh = lh * breath;
      ctx.save();
      ctx.globalAlpha = crisp;
      ctx.drawImage(img, box.cx - bw / 2, box.cy - bh / 2, bw, bh);
      /* specular sheen travelling along the mark's own diagonal */
      var sh = (lt - ph.t1) / (ph.t3 - ph.t1);
      if (sh > 0.05 && sh < 1.05) {
        var sx = mix(-0.45, 1.45, c01(sh)) * bw;
        var gr = ctx.createLinearGradient(
          box.cx - bw / 2 + sx - 190, box.cy - bh / 2,
          box.cx - bw / 2 + sx + 190, box.cy + bh / 2);
        gr.addColorStop(0, 'rgba(255,255,255,0)');
        gr.addColorStop(0.5, 'rgba(255,255,255,' + (0.30 * crisp).toFixed(3) + ')');
        gr.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.globalCompositeOperation = 'source-atop';
        ctx.fillStyle = gr;
        ctx.fillRect(box.cx - bw / 2, box.cy - bh / 2, bw, bh);
      }
      ctx.restore();
    }

    /* ---- particle field ------------------------------------------------- */
    /* visible while swarming in, dimmed to a sparkle during the hold, then
       brought back to full for the dispersal */
    var pAlpha = (1 - 0.82 * smooth(solid)) * (1 - smooth(c01((disp - 0.55) / 0.45)));
    if (disp > 0) pAlpha = Math.max(pAlpha, smooth(c01(disp / 0.30)) * (1 - smooth(c01((disp - 0.4) / 0.6))));
    if (pAlpha <= 0.004) return;

    var diag = Math.sqrt(W * W + H * H) * 0.62;
    var nodes = [];
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    var batches = [
      { key: 'cool', warm: false },
      { key: 'warm', warm: true }
    ];
    for (var bi = 0; bi < batches.length; bi++) {
      var sp = this.sprites[batches[bi].key], want = batches[bi].warm;
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i];
        if (p.warm !== want) continue;

        var tx = lx + p.u * lw, ty = ly + p.v * lh;
        var x = tx, y = ty, a = pAlpha, sc = 1;

        if (conv < 1) {
          /* staggered arrival: each particle has its own delay + travel time */
          var d0 = p.a2 * 0.34;
          var cp = outQuint(c01((conv - d0) / (1 - d0)));
          var ang = p.a1 * 6.283 + (1 - cp) * 1.5;      // swirl as they close in
          var rad = (0.55 + p.a3 * 0.95) * diag * (1 - cp);
          x = tx + Math.cos(ang) * rad;
          y = ty + Math.sin(ang) * rad * 0.72;
          a *= smooth(c01(cp * 1.9));
          sc = mix(2.1, 1, cp);
        }
        if (disp > 0) {
          var dp = Math.pow(disp, 1.75);
          var dx = tx - box.cx, dy = ty - box.cy;
          var m = Math.sqrt(dx * dx + dy * dy) || 1;
          var rot = (p.a1 - 0.5) * 0.85;
          var ux = (dx / m) * Math.cos(rot) - (dy / m) * Math.sin(rot);
          var uy = (dx / m) * Math.sin(rot) + (dy / m) * Math.cos(rot);
          var spd = 300 + p.a4 * 1150;
          /* turbulence keeps the cloud from looking like a clean radial burst */
          var turb = Math.sin(p.a2 * 21 + disp * 7.5) * 78 * disp;
          x += ux * spd * dp + turb;
          y += uy * spd * dp - 150 * dp + Math.cos(p.a3 * 17 + disp * 6) * 62 * disp;
          sc = mix(1, 2.5, dp);
          a *= (1 - smooth(c01((disp - 0.25) / 0.75)));
        }
        if (a <= 0.004) continue;

        var s = p.sz * sc * 4.2;
        ctx.globalAlpha = a;
        ctx.drawImage(sp, x - s / 2, y - s / 2, s, s);
        if (p.node && (conv < 1 || disp > 0)) nodes.push(x, y, a);
      }
    }

    /* bonds between node-particles: the molecular read, only while in motion */
    if (nodes.length) {
      ctx.lineWidth = 1;
      for (var n = 0; n < nodes.length; n += 3) {
        for (var m2 = n + 3; m2 < nodes.length; m2 += 3) {
          var ddx = nodes[n] - nodes[m2], ddy = nodes[n + 1] - nodes[m2 + 1];
          var dd = ddx * ddx + ddy * ddy;
          if (dd > 15000) continue;
          var la = (1 - Math.sqrt(dd) / 122) * 0.30 * Math.min(nodes[n + 2], nodes[m2 + 2]);
          if (la <= 0.004) continue;
          ctx.strokeStyle = 'rgba(255,178,110,' + la.toFixed(4) + ')';
          ctx.beginPath();
          ctx.moveTo(nodes[n], nodes[n + 1]);
          ctx.lineTo(nodes[m2], nodes[m2 + 1]);
          ctx.stroke();
        }
      }
    }

    /* orbiting "electrons" during the solid hold */
    var orb = smooth(solid) * (1 - smooth(disp));
    if (orb > 0.01) {
      for (var e = 0; e < 14; e++) {
        var ea = rnd(e, 41) * 6.283 + lt * (0.55 + rnd(e, 42) * 0.85) * (e % 2 ? 1 : -1);
        var rx = lw * (0.56 + rnd(e, 43) * 0.30);
        var ry = lh * (0.62 + rnd(e, 44) * 0.55);
        var ex = box.cx + Math.cos(ea) * rx;
        var ey = box.cy + Math.sin(ea) * ry;
        var es = 5 + rnd(e, 45) * 7;
        ctx.globalAlpha = orb * (0.34 + 0.30 * Math.sin(lt * 2.4 + e));
        ctx.drawImage(this.sprites.warm, ex - es, ey - es, es * 2, es * 2);
      }
    }
    ctx.restore();
  };

  /* ================================================================ SCENES ==
     Markup is generated once, up front. render(t) only mutates inline styles,
     which keeps per-frame cost low and output deterministic.
     ====================================================================== */

  /* "the same {five walls}" -> accent span. Braces mark the accent phrase,
     " // " forces a line break so headlines break where the writer wants. */
  function accentize(s) {
    return String(s)
      .replace(/\{([^}]*)\}/g, '<em class="ac">$1</em>')
      .replace(/\s*\/\/\s*/g, '<br>');
  }
  /* split into word spans so headlines can rise in with a stagger */
  function words(s) {
    var html = accentize(s);
    var tmp = document.createElement('div');
    tmp.innerHTML = html;
    var out = [], idx = 0;
    (function walk(node, cls) {
      for (var i = 0; i < node.childNodes.length; i++) {
        var ch = node.childNodes[i];
        if (ch.nodeType === 3) {
          var parts = ch.nodeValue.split(/(\s+)/);
          for (var j = 0; j < parts.length; j++) {
            if (!parts[j]) continue;
            if (/^\s+$/.test(parts[j])) { out.push({ sp: true }); continue; }
            out.push({ w: parts[j], cls: cls, i: idx++ });
          }
        } else if (ch.nodeType === 1) {
          if (ch.tagName === 'BR') { out.push({ br: true }); continue; }
          walk(ch, ch.className || '');
        }
      }
    })(tmp, '');
    var h = '';
    for (var k = 0; k < out.length; k++) {
      if (out[k].br) { h += '<br>'; continue; }
      if (out[k].sp) { h += ' '; continue; }
      h += '<span class="wd' + (out[k].cls ? ' ' + out[k].cls : '') +
        '" data-s="' + out[k].i + '">' + out[k].w + '</span>';
    }
    return h;
  }

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  function buildScene(sc, assets) {
    var root = el('section', 'scene s-' + sc.kind);
    var body = el('div', 'body');

    if (sc.ghost) root.appendChild(el('div', 'ghost', sc.ghost));

    if (sc.eyebrow) {
      body.appendChild(el('div', 'eyebrow anim', '<i class="rule"></i>' + sc.eyebrow));
    }
    if (sc.headline) {
      var h = el('h1', 'headline', words(sc.headline));
      if (sc.underline) h.classList.add('has-ul');
      body.appendChild(h);
    }
    if (sc.sub) body.appendChild(el('p', 'sub anim', accentize(sc.sub)));

    if (sc.kind === 'chips') {
      var cw = el('div', 'chips');
      sc.chips.forEach(function (c, i) {
        cw.appendChild(el('span', 'chip anim', '<i class="dot"></i>' + c));
      });
      body.appendChild(cw);
    }

    if (sc.kind === 'cards') {
      var cg = el('div', 'cards');
      sc.cards.forEach(function (c) {
        var d = el('div', 'card anim');
        var im = el('img');
        im.src = assets.base + 'card-' + c + '.png';
        d.appendChild(im);
        cg.appendChild(d);
      });
      body.appendChild(cg);
      if (sc.caption) body.appendChild(el('p', 'caption anim', accentize(sc.caption)));
    }

    if (sc.kind === 'list') {
      var lw = el('div', 'list');
      sc.items.forEach(function (it, i) {
        var n = el('div', 'li anim');
        n.appendChild(el('span', 'num', String(i + 1).padStart(2, '0')));
        var tx = el('div', 'ltx');
        tx.appendChild(el('div', 'lt', accentize(it.t)));
        if (it.d) tx.appendChild(el('div', 'ld', accentize(it.d)));
        n.appendChild(tx);
        lw.appendChild(n);
      });
      body.appendChild(lw);
    }

    if (sc.kind === 'grid') {
      var gw = el('div', 'grid');
      sc.items.forEach(function (it, i) {
        var g = el('div', 'gi anim');
        g.appendChild(el('span', 'gn', String(i + 1).padStart(2, '0')));
        g.appendChild(el('span', 'gt', it));
        gw.appendChild(g);
      });
      body.appendChild(gw);
    }

    if (sc.kind === 'lockup') {
      var lk = el('div', 'lockup anim');
      var li = el('img');
      li.src = assets.base + sc.image;
      lk.appendChild(li);
      body.insertBefore(lk, body.firstChild);
      if (sc.caption) body.appendChild(el('p', 'caption anim', accentize(sc.caption)));
    }

    if (sc.kind === 'bignum') {
      var bn = el('div', 'bignum anim');
      bn.appendChild(el('span', 'nv', '0'));
      bn.appendChild(el('span', 'nsuf', sc.suffix || ''));
      bn.appendChild(el('span', 'nlab', sc.label || ''));
      body.appendChild(bn);
      var st = el('div', 'stars anim');
      for (var s = 0; s < 5; s++) st.appendChild(el('i', 'star', '★'));
      body.appendChild(st);
      if (sc.caption) body.appendChild(el('p', 'caption anim', accentize(sc.caption)));
    }

    root.appendChild(body);

    if (sc.photo) {
      var pn = el('div', 'panel');
      var pi = el('div', 'pimg');
      pi.style.backgroundImage = 'url("' + assets.base + 'panel-' + sc.photo + '.png")';
      pn.appendChild(pi);
      pn.appendChild(el('i', 'pedge'));
      root.appendChild(pn);
      root.classList.add('split');
    }

    if (sc.kind === 'endcard') {
      root.classList.add('s-endcard');
      var ec = el('div', 'endwrap');
      ec.appendChild(el('div', 'ehcm anim', sc.lockupText || 'HUMAN CAPITAL MANAGEMENT'));
      ec.appendChild(el('i', 'erule anim'));
      ec.appendChild(el('div', 'etag anim', accentize(sc.tagline)));
      ec.appendChild(el('div', 'eurl anim', sc.url));
      root.appendChild(ec);
    }
    if (sc.kind === 'logo') {
      root.classList.add('s-logo');
      var lg = el('div', 'logowrap');
      lg.appendChild(el('div', 'ehcm anim', 'HUMAN CAPITAL MANAGEMENT'));
      root.appendChild(lg);
    }
    return root;
  }

  /* ================================================================== BOOT ==*/
  function boot(cfg) {
    var host = document.getElementById('app');
    var assets = { base: cfg.assetBase || 'assets/' };

    /* ---- chrome + layers ---- */
    host.innerHTML =
      '<canvas id="lattice" width="' + W + '" height="' + H + '"></canvas>' +
      '<div class="warm"></div>' +
      '<div class="stage"></div>' +
      '<canvas id="fx" width="' + W + '" height="' + H + '"></canvas>' +
      '<div class="vignette"></div><div class="grain"></div>' +
      '<div class="chrome">' +
      '  <div class="pbar"><i class="pfill"></i></div>' +
      '  <div class="counter"><b></b><span> / ' + '</span><u></u></div>' +
      '  <div class="rail">' +
      '    <span class="rl"><i class="rdot"></i><b>ALIGN HCM</b> · ' + cfg.rail + '</span>' +
      '    <span class="rr">' + cfg.url + '</span>' +
      '  </div>' +
      '</div>';

    var stage = host.querySelector('.stage');
    var fx = document.getElementById('fx').getContext('2d');
    var lattice = new Lattice(document.getElementById('lattice'), 74);
    var pfill = host.querySelector('.pfill');
    var counter = host.querySelector('.counter');
    var cNum = counter.querySelector('b'), cTot = counter.querySelector('u');

    /* ---- scene timeline ---- */
    var scenes = cfg.scenes, t0 = 0;
    var chapters = scenes.filter(function (s) { return s.chapter; }).length;
    var chIdx = 0;
    scenes.forEach(function (s) {
      s._in = t0; s._out = t0 + s.dur; t0 += s.dur;
      s._node = buildScene(s, assets);
      s._anim = s._node.querySelectorAll('.anim');
      s._wds = s._node.querySelectorAll('.wd');
      s._ghost = s._node.querySelector('.ghost');
      s._panel = s._node.querySelector('.pimg');
      s._ul = s._node.querySelector('.headline.has-ul');
      s._nv = s._node.querySelector('.nv');
      if (s.chapter) { chIdx++; s._ch = chIdx; }
      stage.appendChild(s._node);
    });
    var DUR = t0;
    cTot.textContent = String(chapters).padStart(2, '0');

    /* ---- logo atoms ----
       The sampler needs getImageData on the mark, which a file:// <img> would
       taint. assets/mark-data.js carries the same PNG as a data URI, which is
       same-origin everywhere, so the page works by double-click with no server. */
    var atoms = null, markImg = new Image();
    var ready = 0, need = 1 + host.querySelectorAll('.stage img').length, markDone = false;
    function tick() { if (++ready >= need) global.__ready = true; }
    function markReady() {
      if (markDone) return;
      markDone = true;
      if (markImg.naturalWidth) atoms = new LogoAtoms(markImg, 3600);
      tick();
    }
    markImg.onload = markReady;
    markImg.onerror = markReady;
    markImg.src = global.ALIGN_MARK_DATAURL || (assets.base + 'align-mark.png');
    if (markImg.complete && markImg.naturalWidth) markReady();
    Array.prototype.forEach.call(host.querySelectorAll('.stage img'), function (im) {
      if (im.complete) tick(); else { im.onload = tick; im.onerror = tick; }
    });

    /* ------------------------------------------------------------- render */
    function render(t) {
      t = clamp(t, 0, DUR - 0.0001);

      /* progress bar + rail */
      pfill.style.width = (t / DUR * 100).toFixed(3) + '%';

      /* lattice dims out under logo beats so the particles read cleanly */
      var latI = 1;
      for (var q = 0; q < scenes.length; q++) {
        var s2 = scenes[q];
        if (t >= s2._in && t < s2._out && (s2.kind === 'logo' || s2.kind === 'endcard')) {
          var l2 = t - s2._in;
          latI = 0.35 + 0.65 * c01(Math.min(l2 / 1.2, (s2.dur - l2) / 1.0));
        }
      }
      lattice.draw(t, latI);
      fx.clearRect(0, 0, W, H);

      var activeCh = 0;
      for (var i = 0; i < scenes.length; i++) {
        var sc = scenes[i];
        var pad = 0.7;                       // scenes stay live briefly for crossfade
        if (t < sc._in - 0.05 || t > sc._out + pad) {
          if (sc._node.style.display !== 'none') sc._node.style.display = 'none';
          continue;
        }
        sc._node.style.display = '';
        var lt = t - sc._in;
        drawScene(sc, lt, t);
        if (sc._ch && t < sc._out) activeCh = sc._ch;
      }

      if (activeCh) { counter.style.opacity = '1'; cNum.textContent = String(activeCh).padStart(2, '0'); }
      else counter.style.opacity = '0';
    }

    function drawScene(sc, lt, T) {
      var dur = sc.dur;
      var outT = 0.62, outStart = dur - outT;
      var ex = smooth(c01((lt - outStart) / outT));

      /* scene-level fade so nothing pops */
      sc._node.style.opacity = String(1 - ex * (sc.kind === 'logo' ? 1 : 0.0));

      /* staggered word reveal */
      var wStep = sc.wordStep != null ? sc.wordStep : 0.045;
      for (var i = 0; i < sc._wds.length; i++) {
        var w = sc._wds[i];
        var d = 0.16 + i * wStep;
        var p = smooth(c01((lt - d) / 0.66));
        var o = p * (1 - ex);
        w.style.opacity = o.toFixed(3);
        var ty = (1 - p) * 30 + ex * -16;
        w.style.transform = 'translate3d(0,' + ty.toFixed(2) + 'px,0)';
        w.style.filter = (p < 0.995 || ex > 0.005)
          ? 'blur(' + ((1 - p) * 11 + ex * 7).toFixed(2) + 'px)' : 'none';
      }

      /* everything else with .anim, staggered after the headline */
      var base = 0.16 + Math.min(sc._wds.length, 9) * wStep * 0.55;
      for (var j = 0; j < sc._anim.length; j++) {
        var n = sc._anim[j];
        var dd = base + j * 0.085;
        var pp = smooth(c01((lt - dd) / 0.70));
        n.style.opacity = (pp * (1 - ex)).toFixed(3);
        var yy = (1 - pp) * 24 + ex * -12;
        var extra = n.classList.contains('card') || n.classList.contains('chip')
          ? ' scale(' + mix(0.86, 1, outCubic(pp)).toFixed(4) + ')' : '';
        n.style.transform = 'translate3d(0,' + yy.toFixed(2) + 'px,0)' + extra;
        n.style.filter = (pp < 0.995 || ex > 0.005)
          ? 'blur(' + ((1 - pp) * 9 + ex * 6).toFixed(2) + 'px)' : 'none';
      }

      /* accent underline draws itself in */
      if (sc._ul) {
        var up = smooth(c01((lt - 0.85) / 0.75)) * (1 - ex);
        sc._ul.style.setProperty('--ul', (up * 100).toFixed(2) + '%');
      }

      /* ghost word: slow parallax drift */
      if (sc._ghost) {
        var gp = smooth(c01(lt / 1.5)) * (1 - ex);
        sc._ghost.style.opacity = (gp * 0.9).toFixed(3);
        sc._ghost.style.transform =
          'translate3d(' + (-40 + lt * 9).toFixed(1) + 'px,0,0) scale(' + (1 + lt * 0.004).toFixed(4) + ')';
      }

      /* photo panel: reveal wipe + slow ken burns */
      if (sc._panel) {
        var rp = outQuint(c01((lt - 0.10) / 1.15));
        sc._panel.parentNode.style.clipPath = 'inset(0 0 0 ' + ((1 - rp) * 100).toFixed(2) + '%)';
        sc._panel.parentNode.style.opacity = String(1 - ex);
        sc._panel.style.transform = 'scale(' + (1.085 - 0.085 * c01(lt / dur) - 0.0).toFixed(4) + ')';
      }

      /* count-up number */
      if (sc._nv) {
        var np = inOut(c01((lt - 0.35) / 1.5));
        sc._nv.textContent = String(Math.round(mix(0, sc.value, np)));
      }

      /* logo beats own the fx canvas */
      if (sc.kind === 'logo' || sc.kind === 'endcard') {
        if (!atoms) return;
        var ph = sc.phases;
        var box = { cx: W / 2, cy: sc.logoY || H * 0.44, w: sc.logoW || 900 };
        atoms.draw(fx, lt, ph, box);
        /* HCM subline + endcard type keyed to the solid phase */
        var tags = sc._node.querySelectorAll('.anim');
        for (var k = 0; k < tags.length; k++) {
          var kk = tags[k];
          var sd = smooth(c01(((lt - ph.t1) - k * 0.13) / 0.6)) *
            (1 - smooth(c01(((lt - ph.t3) - k * 0.05) / 0.5)));
          kk.style.opacity = sd.toFixed(3);
          kk.style.transform = 'translate3d(0,' + ((1 - sd) * 16).toFixed(2) + 'px,0)';
          kk.style.filter = sd < 0.99 ? 'blur(' + ((1 - sd) * 7).toFixed(2) + 'px)' : 'none';
        }
      }
    }

    /* ------------------------------------------------- capture / playback */
    global.__DUR = DUR;
    global.__FPS = cfg.fps || 30;
    global.__seek = function (t) { render(t); };

    var qs = new URLSearchParams(location.search);
    if (qs.get('capture') === '1') {
      render(0);
      return;
    }
    /* live playback for eyeballing it in Chrome */
    var start = null;
    (function loop(ts) {
      if (start == null) start = ts;
      var t = ((ts - start) / 1000) % DUR;
      render(t);
      requestAnimationFrame(loop);
    })(performance.now());
  }

  global.AlignMotion = { boot: boot };
})(window);
