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
