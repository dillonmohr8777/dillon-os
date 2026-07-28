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
