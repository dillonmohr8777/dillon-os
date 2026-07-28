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
