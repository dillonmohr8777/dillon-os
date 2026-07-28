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
