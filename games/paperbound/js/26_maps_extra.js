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
