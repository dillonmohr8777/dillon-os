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
