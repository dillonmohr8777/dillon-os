/* ==========================================================================
   PAPERBOUND — 25_maps_ch678.js
   CHAPTER 6 — Frostfold    CHAPTER 7 — The Foilworks    CHAPTER 8 — The Blank
   ========================================================================== */
'use strict';

(function () {
  var K = PB.MapKit, Shop = PB.Menus.defineShop, St = PB.State, U = PB.U;

  /* ======================================================================
     CHAPTER 6 — FROSTFOLD
     ====================================================================== */
  Shop('frostfold_hearth', {
    name: 'The Long Hearth', keeper: 'villager_b', markup: 1.15,
    greeting: 'Everything hot is double. Everything cold is free, and there is a great deal of it.',
    stock: ['creambun', 'deeproot', 'drycloth', 'emberpod', 'tonicwash', 'boldbrew', 'lifeleaf', 'frostnut']
  });

  K.chain(
    { chapter: 6, music: 'frost', theme: 'frost', battleBg: 'frost', entryWest: { to: 'foldheim_road', spawn: 'ch6' } },
    [
      {
        id: 'ff_pass', name: 'Frostfold Pass', w: 1500,
        props: K.scatter(['icechunk', 'rock', 'tree_pine'], 7, 1500),
        gizmos: K.rest(140).concat([
          { kind: 'sign', x: 460, z: .86, text: 'FROSTFOLD PASS.\nThree bells mark the way up. Ring them wrong and the mountain will let you know.' }
        ]),
        items: [{ kind: 'coin', x: 800, z: .5, amount: 12, flag: 'ff1_c1' }],
        foes: [{ id: 'ff1a', type: 'frostling', x: 1000, z: .64, patrol: 100, group: ['frostling', 'chillbug'], killFlag: 'ff1_f1' }],
        triggers: [{
          x: 320, z: .6, w: 100, d: 1.4, once: true, flag: 'tr_ch6',
          script: [
            ['chapter', 6, 'The Thing in the Glacier', 'Frostfold, and what it swallowed'],
            ['say', 'narr', 'Snow, and under the snow a quiet that is not the quiet of snow.'],
            ['say', 'lumen', 'I am going to be very popular here and I would like everyone to know I have earned it.']
          ]
        }]
      },
      {
        id: 'ff_village', name: 'Hearthfold', w: 1800, theme: 'interior', music: 'frost',
        props: [{ sprite: 'house_small', x: 280, z: .12 }, { sprite: 'house_small', x: 720, z: .1, scale: .95 },
          { sprite: 'house_small', x: 1440, z: .12 }, { sprite: 'brazier', x: 1000, z: .82 },
          { sprite: 'icechunk', x: 560, z: .9 }, { sprite: 'lamp', x: 1200, z: .84 }],
        gizmos: K.rest(180).concat([
          { kind: 'shop', x: 760, z: .44, shop: 'frostfold_hearth', label: 'Shop', sprite: 'shop_stall', scale: .8 },
          { kind: 'cook', x: 1080, z: .58, label: 'Cook', sprite: 'barrel' },
          { kind: 'inn', x: 1440, z: .44, price: 12, label: 'Rest', sprite: 'house_small', scale: .8 },
          { kind: 'sign', x: 420, z: .88, text: 'HEARTHFOLD. Everyone indoors by dark.\nThe dark is at four in the afternoon.' }
        ]),
        items: [{ kind: 'chest', x: 1740, z: .3, key: 'bell_key', flag: 'ff2_bell' }, { kind: 'coin', x: 900, z: .78, amount: 10, flag: 'ff2_c1' }],
        npcs: [
          {
            id: 'bellkeeper', sprite: 'elder_quill', x: 620, z: .68, name: 'Bellkeeper Rime',
            script: function () {
              if (St.questState('summit_bell') === 'done') return [['say', 'elder_quill', 'Three bells, right order, first time in nine years. The mountain heard it. I felt it hear it.']];
              if (St.questState('summit_bell') === 'open') return [
                ['say', 'elder_quill', 'Low, then high, then middle. Low. High. Middle. Say it back.'],
                ['say', 'pip', 'Low, high, middle.'],
                ['say', 'elder_quill', 'Good. Get it wrong and nothing bad happens, which is somehow worse. You simply start again with the mountain watching.']
              ];
              return [
                ['say', 'elder_quill', 'The bells hold the glacier still. Somebody has to ring them and I am eighty-four and made of paper.'],
                ['say', 'elder_quill', 'The crank is in my house somewhere. Order is low, high, middle. Do not improvise.'],
                ['quest', 'summit_bell', 'start']
              ];
            }
          },
          { id: 'ff_gran', sprite: 'grandma_creased', x: 1440, z: .58, name: 'Hearth Mother Kell', script: [['say', 'grandma_creased', 'Twelve coins. The fire is real and I keep it that way personally.'], ['inn', 12]] },
          { id: 'ff_kid', sprite: 'kid_dot', x: 1000, z: .86, name: 'Mitt', wander: 40, script: [['say', 'kid_dot', 'There is something IN the glacier. You can see it if you lie on the ice. It is big and it is CURLED UP.']] },
          { id: 'ff_hunter', sprite: 'sailor_keel', x: 1200, z: .7, name: 'Tracker Floe', script: [['say', 'sailor_keel', 'White hound on the upper passes. Bigger than me. Goes for whoever is weakest, so keep your friends fed.']] },
          { id: 'ff_chef', sprite: 'chef_pulp', x: 1080, z: .7, name: 'Stewmaster Frost', script: [['say', 'chef_pulp', 'Anything hot. That is the whole menu. Bring me two things and I will make them hot.'], ['cook']] }
        ]
      },
      {
        id: 'ff_bells', name: 'The Three Bells', w: 1800, theme: 'frost',
        eastLock: { needsFlag: 'ff_bells_rung', lockedMsg: 'The glacier road is sealed with ice. The bells are supposed to open it.' },
        props: K.scatter(['icechunk', 'pillar', 'rock'], 6, 1800),
        gizmos: [
          { kind: 'save', x: 150, z: .84 },
          {
            kind: 'switch', x: 500, z: .5, label: 'Low bell', once: false, sprite: 'brazier',
            script: [['sfx', 'ice'], ['func', function () { St.flag('ff_seq', (St.flag('ff_seq') || '') + 'L'); }], ['sub', [['func', function (w) { check(w); }]]]]
          },
          {
            kind: 'switch', x: 900, z: .5, label: 'High bell', once: false, sprite: 'brazier',
            script: [['sfx', 'ice'], ['func', function () { St.flag('ff_seq', (St.flag('ff_seq') || '') + 'H'); }], ['sub', [['func', function (w) { check(w); }]]]]
          },
          {
            kind: 'switch', x: 1300, z: .5, label: 'Middle bell', once: false, sprite: 'brazier',
            script: [['sfx', 'ice'], ['func', function () { St.flag('ff_seq', (St.flag('ff_seq') || '') + 'M'); }], ['sub', [['func', function (w) { check(w); }]]]]
          },
          { kind: 'sign', x: 260, z: .88, text: 'LOW. HIGH. MIDDLE.\nSomebody has added: "and if you get it wrong just start again, it is not a moral failing".' }
        ],
        items: [{ kind: 'coin', x: 1600, z: .78, amount: 14, flag: 'ff3_c1' }],
        foes: [{ id: 'ff3a', type: 'icicleimp', x: 1100, z: .7, patrol: 130, group: ['icicleimp', 'frostling'], killFlag: 'ff3_f1' }]
      },
      {
        id: 'ff_glacier', name: 'The Glacier Road', w: 1900, theme: 'frost',
        eastLock: { needsKey: 'summitrope', lockedMsg: 'The cliff needs a rope, and the rope is somewhere with fewer manners than this.' },
        props: K.scatter(['icechunk', 'rock'], 8, 1900),
        solids: [
          { x: 560, z: .42, w: 90, d: .28, h: 60 },
          { x: 860, z: .42, w: 90, d: .28, h: 120 },
          { x: 1160, z: .42, w: 90, d: .28, h: 180 },
          { x: 1460, z: .42, w: 90, d: .28, h: 120 }
        ],
        pits: [{ x0: 640, x1: 780, z0: .28, z1: .56, to: { x: 480, z: .78 } },
          { x0: 940, x1: 1080, z0: .28, z1: .56, to: { x: 480, z: .78 } },
          { x0: 1240, x1: 1380, z0: .28, z1: .56, to: { x: 480, z: .78 } }],
        items: [
          { kind: 'chest', x: 1160, z: .42, y: 180, key: 'summitrope', flag: 'ff4_rope' },
          { kind: 'chest', x: 860, z: .42, y: 120, item: 'glacierjelly', flag: 'ff4_ch1' },
          { kind: 'shard', x: 1750, z: .8, flag: 'ff4_shard' }
        ],
        gizmos: K.rest(150),
        foes: [
          { id: 'ff4a', type: 'snowcrease', x: 700, z: .68, patrol: 80, group: ['snowcrease', 'frostling'], killFlag: 'ff4_f1' },
          { id: 'ff4b', type: 'flurrik', x: 1600, z: .7, patrol: 130, group: ['flurrik', 'icicleimp', 'chillbug'], killFlag: 'ff4_f2' }
        ],
        triggers: [{
          x: 340, z: .6, w: 90, d: 1.4, once: true, flag: 'tr_glide_hint',
          script: [['say', 'twigby', 'Big gaps. Hold <c:#c8443c>Z</c> on the way down and the Plane fold will carry you further than it has any right to.']]
        }]
      },
      {
        id: 'ff_cavern', name: 'The Blue Cavern', w: 1700, theme: 'cave', music: 'frost', dark: true,
        props: K.scatter(['icechunk', 'rock', 'pillar'], 7, 1700),
        solids: [{ x: 800, z: .44, w: 100, d: .3, h: 62 }],
        items: [{ kind: 'chest', x: 800, z: .44, y: 62, badge: 'laststand', flag: 'ff5_ch1' },
          { kind: 'coin', x: 1200, z: .78, amount: 16, flag: 'ff5_c1' }],
        gizmos: K.rest(150),
        foes: [
          { id: 'ff5a', type: 'glaciat', x: 1000, z: .64, patrol: 60, group: ['glaciat', 'frostling'], killFlag: 'ff5_f1' },
          {
            id: 'ff5boss', type: 'fenrisk', x: 1520, z: .6, patrol: 0, chase: false, boss: true,
            group: ['fenrisk'], killFlag: 'ff_fenrisk_down',
            cfg: {
              boss: true, noRun: true, music: 'boss',
              introLine: 'The white hound does not growl. It picks whichever of you is weakest and looks only at them.',
              introSpeaker: 'Fenrisk', introPortrait: 'fenrisk'
            },
            onWin: [
              ['say', 'narr', 'It backs off up the tunnel without hurrying, the way a thing does when it has decided you are not worth the cold.'],
              ['give', 'lifeleaf']
            ]
          }
        ]
      },
      {
        id: 'ff_ascent', name: 'The Ascent', w: 1800, theme: 'frost',
        props: K.scatter(['icechunk', 'rock'], 6, 1800),
        solids: [
          { x: 700, z: .44, w: 100, d: .3, h: 70 },
          { x: 1100, z: .44, w: 100, d: .3, h: 140 },
          { x: 1400, z: .5, w: 150, d: .38, h: 0, id: 'ff_bridge', hidden: true }
        ],
        pits: [{ x0: 790, x1: 1010, z0: .28, z1: .58, to: { x: 620, z: .8 } }],
        items: [{ kind: 'chest', x: 1100, z: .44, y: 140, item: 'sevenlayer', flag: 'ff6_ch1' }],
        gizmos: [
          { kind: 'save', x: 150, z: .84 },
          {
            kind: 'plate', x: 1280, z: .5, once: true, reveals: 'ff_bridge', label: 'Press down',
            script: [['say', 'narr', 'The plate sinks. Somewhere above, a slab of ice swings out and becomes a bridge.']]
          },
          { kind: 'sign', x: 280, z: .88, text: 'THE ASCENT. Weight plates need weight.\nBe heavier. That is the whole instruction.' }
        ],
        foes: [{ id: 'ff6a', type: 'snowcrease', x: 900, z: .68, patrol: 90, group: ['snowcrease', 'glaciat', 'icicleimp'], killFlag: 'ff6_f1' }]
      },
      {
        id: 'ff_summit', name: 'The Summit', w: 1300, theme: 'frost', music: 'tense',
        props: [{ sprite: 'icechunk', x: 220, z: .12, scale: 1.4 }, { sprite: 'icechunk', x: 1080, z: .12, scale: 1.4 },
          { sprite: 'pillar', x: 520, z: .1 }, { sprite: 'pillar', x: 800, z: .1 }],
        gizmos: K.rest(150),
        triggers: [PB.MapKit.bossTrigger({
          x: 620, flag: 'tr_crinkle', entId: 'crk', sprite: 'crinkle_wyrm',
          name: 'Crinkle, the Glacier Wyrm', enemy: 'crinkle_wyrm', bg: 'frost',
          before: [['say', 'narr', 'The summit is a bowl of clear ice, and under the ice something enormous is curled around a small bright warmth, the way anyone would.']],
          lines: [
            ['sayx', 'Crinkle', 'crinkle_wyrm', 'warm. warm thing. mine. i found it.', 'boss'],
            ['say', 'pip', 'You did find it. It fell out of the sky and it landed on you.'],
            ['sayx', 'Crinkle', 'crinkle_wyrm', 'i thought it was the sun. i have never seen the sun. i have been under the ice since before there was a village.', 'boss'],
            ['say', 'lumen', 'It is not the sun. It is a fragment of a crown, and it is going out.'],
            ['sayx', 'Crinkle', 'crinkle_wyrm', 'no. no, it is warm.', 'boss'],
            ['say', 'lumen', 'It is warm because you are holding it against yourself. It has nothing left. In a month you will be curled around a cold thing and you will not have noticed.'],
            ['sayx', 'Crinkle', 'crinkle_wyrm', '...then i will hold it longer.', 'boss'],
            ['say', 'pip', 'Crinkle. There is a village down there with a fire that does not go out. Real one. Kept by hand.'],
            ['sayx', 'Crinkle', 'crinkle_wyrm', 'villages do not keep fires for THINGS UNDER THE ICE.', 'boss'],
            ['say', 'pip', 'No. They have not been asked.']
          ],
          after: [
            ['music', 'sad'],
            ['say', 'narr', 'The coils go slack across the ice. The fragment comes free, and it is cold, and it has been cold for weeks.'],
            ['sayx', 'Crinkle', 'crinkle_wyrm', '...it went out. when did it go out.', 'boss'],
            ['say', 'lumen', 'A while ago. I am sorry. Come down the mountain with me. I will not go out — that is the one thing I am for.'],
            ['wait', 30],
            ['sfx', 'seal'],
            ['title', 'SEAL VI RECOVERED', 110],
            ['givekey', 'seal6'],
            ['seal', 'seal_glacier'],
            ['flag', 'form_weight', true],
            ['say', 'sys', 'Seal Power learned: <c:#9fd8f0>Glacial Press</c> — 6 ice damage to all and a deep freeze.\nNew fold: <c:#cfd6de>Weight</c>. Press <c:#c8443c>V</c> on a weight plate to sink it.'],
            ['upgrade', 'stomp'],
            ['flag', 'ch6_done', true],
            ['chapterset', 7],
            ['heal'],
            ['say', 'twigby', 'Six. Pip. SIX.'],
            ['say', 'pip', 'One left, and then the person who tore it.'],
            ['goto', 'foldheim_road', 'ch6']
          ]
        })]
      }
    ]
  );

  /* The bell puzzle checker, called from the switch scripts above. */
  function check(w) {
    var seq = St.flag('ff_seq') || '';
    if (seq.length < 3) { PB.UI.toast(seq.split('').join(' - '), null, '#bfe4f8'); return; }
    if (seq === 'LHM') {
      St.flag('ff_bells_rung', true);
      St.flag('ff_seq', '');
      PB.Audio.fanfare('seal');
      w.runScript([
        ['say', 'narr', 'Three notes, in the right order, for the first time in nine years. The whole pass answers — a long crack of ice unlocking somewhere above.'],
        ['form', 'form_shear'],
        ['say', 'sys', 'New Origami Form: <c:#cfd6de>Shear</c> — every attack strikes twice and cuts clean.'],
        ['shard', 1],
        ['quest', 'summit_bell', 'done', 'The Summit Bell']
      ]);
    } else {
      St.flag('ff_seq', '');
      PB.Audio.sfx('error');
      PB.UI.toast('Wrong order. Start again.', null, '#f0a0a0');
    }
  }

  /* ======================================================================
     CHAPTER 7 — THE FOILWORKS
     ====================================================================== */
  Shop('foilworks_commissary', {
    name: 'Commissary Window 4', keeper: 'guard_gild', markup: 1.05,
    greeting: 'STATE REQUISITION. ...That is the greeting. I did not write it.',
    stock: ['creambun', 'deeproot', 'grandfeast', 'tonicwash', 'thunderrag', 'shreddisc', 'mirrorfoil', 'lastpage']
  });

  K.chain(
    { chapter: 7, music: 'foundry', theme: 'foundry', battleBg: 'foundry', entryWest: { to: 'foldheim_road', spawn: 'ch7' } },
    [
      {
        id: 'fw_gate', name: 'Foilworks Gate', w: 1400,
        props: K.scatter(['gear', 'crate', 'barrel'], 7, 1400),
        gizmos: K.rest(140).concat([
          { kind: 'sign', x: 460, z: .86, text: 'THE FOILWORKS — OUTPUT UP 400% ON LAST YEAR\nNo notice states what the output is.' }
        ]),
        items: [{ kind: 'coin', x: 800, z: .5, amount: 14, flag: 'fw1_c1' }],
        foes: [{ id: 'fw1a', type: 'foilrat', x: 1000, z: .64, patrol: 110, group: ['foilrat', 'sparkbit'], killFlag: 'fw1_f1' }],
        triggers: [{
          x: 320, z: .6, w: 100, d: 1.4, once: true, flag: 'tr_ch7',
          script: [
            ['chapter', 7, 'What the Press Is Printing', 'Foilworks, running at 400%'],
            ['say', 'narr', 'The whole valley shakes on a four-second cycle. Somewhere in there, something enormous is pressing something flat, over and over, and has been for years.'],
            ['say', 'margo', 'Four hundred per cent of what? That is the number they are proud of and nobody has written down the unit.']
          ]
        }]
      },
      {
        id: 'fw_yard', name: 'The Yard', w: 1800, theme: 'foundry',
        props: [{ sprite: 'gear', x: 300, z: .12, scale: 1.3 }, { sprite: 'gear', x: 1500, z: .12, scale: 1.2 },
          { sprite: 'crate', x: 1100, z: .84 }, { sprite: 'barrel', x: 1160, z: .9 },
          { sprite: 'anvil', x: 900, z: .7 }, { sprite: 'lamp', x: 600, z: .86 }],
        gizmos: K.rest(180).concat([
          { kind: 'shop', x: 720, z: .44, shop: 'foilworks_commissary', label: 'Window 4', sprite: 'shop_stall', scale: .75 },
          { kind: 'cook', x: 1040, z: .58, label: 'Cook', sprite: 'barrel' },
          { kind: 'sign', x: 420, z: .88, text: 'SHIFT ROTA: continuous.\nBREAK ROTA: pending review since year two.' }
        ]),
        items: [{ kind: 'chest', x: 1740, z: .3, item: 'grandfeast', flag: 'fw2_ch1' }],
        npcs: [
          { id: 'grit', sprite: 'miner_grit', x: 620, z: .68, name: 'Grit', script: [['say', 'miner_grit', 'Nobody on this floor knows what we print. Ampere knows. Ampere was COMMISSIONED, he says. By a Duke.'], ['say', 'pip', 'Duke Smudge.'], ['say', 'miner_grit', 'That is the one nobody says out loud. You said it out loud.']] },
          { id: 'fw_clerk', sprite: 'guard_gild', x: 720, z: .58, name: 'Clerk Gild', script: [['say', 'guard_gild', 'REQUISITION WINDOW FOUR. ...Please. I have said that eleven thousand times.'], ['shop', 'foilworks_commissary']] },
          { id: 'fw_chef', sprite: 'chef_pulp', x: 1040, z: .7, name: 'Canteen Rivet', script: [['say', 'chef_pulp', 'Continuous shift means continuous canteen. I have not sat down since the spring.'], ['cook']] },
          { id: 'fw_kid', sprite: 'kid_dash', x: 1250, z: .84, name: 'Shim', wander: 40, script: [['say', 'kid_dash', 'There is a little one in the reject bin that fixes things at night. Nobody believes me. It fixed my shoe.']] },
          { id: 'fw_scholar', sprite: 'scholar_ibis', x: 1400, z: .7, name: 'Inspector Vane', script: [['say', 'scholar_ibis', 'I have audited this facility four times. Output is real. Product is unaccounted for. Both of those cannot be true, and yet.']] }
        ],
        foes: [{ id: 'fw2a', type: 'coglet', x: 1550, z: .62, patrol: 90, group: ['coglet', 'sparkbit', 'foilrat'], killFlag: 'fw2_f1' }]
      },
      {
        id: 'fw_floor', name: 'The Works Floor', w: 1900, theme: 'foundry',
        props: K.scatter(['gear', 'crate', 'barrel', 'anvil'], 9, 1900),
        solids: [{ x: 700, z: .44, w: 100, d: .3, h: 60 }, { x: 1100, z: .44, w: 100, d: .3, h: 60 },
          { x: 1420, z: .5, w: 140, d: .36, h: 0, id: 'fw_powerbridge', hidden: true }],
        items: [
          { kind: 'chest', x: 700, z: .44, y: 60, key: 'cog_bundle', flag: 'fw3_cogs' },
          { kind: 'chest', x: 1100, z: .44, y: 60, item: 'thunderrag', flag: 'fw3_ch1' },
          { kind: 'coin', x: 1600, z: .78, amount: 18, flag: 'fw3_c1' }
        ],
        gizmos: [
          { kind: 'save', x: 150, z: .84 },
          {
            kind: 'generator', x: 1300, z: .5, needs: 'power', once: true, reveals: 'fw_powerbridge',
            label: 'Power up',
            script: [['say', 'volt', '*click* — LOG ENTRY. Dead line re-energised. Gantry extending. You are welcome.']]
          }
        ],
        foes: [
          { id: 'fw3a', type: 'voltoid', x: 900, z: .66, patrol: 100, group: ['voltoid', 'sparkbit'], killFlag: 'fw3_f1' },
          { id: 'fw3b', type: 'wirewing', x: 1700, z: .7, patrol: 130, group: ['wirewing', 'coglet', 'foilrat'], killFlag: 'fw3_f2' }
        ],
        triggers: [{
          x: 340, z: .6, w: 100, d: 1.4, once: true, flag: 'tr_volt',
          script: [
            ['say', 'narr', 'The reject bin is full of parts that failed inspection, and one of them is standing up, holding a blueprint, correcting it.'],
            ['spawn', { id: 'vlt', sprite: 'volt', x: 560, z: .6, name: 'Volt' }],
            ['wait', 26],
            ['say', 'volt', '*click* — LOG ENTRY. Three intruders. Two organic. One on fire. Filing under UNUSUAL.'],
            ['say', 'pip', 'You are correcting his blueprints.'],
            ['say', 'volt', 'CORRECTING. Yes. Line forty-one has been wrong for six years. I fix it. He prints it wrong again. I fix it.'],
            ['say', 'twigby', 'Why?'],
            ['say', 'volt', '*click* — because the alternative is that line forty-one stays wrong.'],
            ['say', 'pip', 'What does the press print, Volt?'],
            ['say', 'volt', '...LOG ENTRY. Query not cleared. Product manifest is sealed. I have read it anyway.'],
            ['say', 'volt', 'It prints nothing. Four hundred per cent of nothing. Blank sheets, in bales, shipped east, to the Citadel.'],
            ['say', 'margo', 'Blank. He is manufacturing BLANK.'],
            ['say', 'volt', '*click* — LOG ENTRY. Reclassified from SCRAP to CREW. Correcting record. Correcting record. ...Done.'],
            ['despawn', 'vlt'],
            ['partner', 'volt'],
            ['wait', 20],
            ['say', 'sys', 'Volt joined you.\n<c:#c8443c>C</c> charges dead switches and drags metal.\nIn battle, <c:#ffe066>Sparker</c> reaches anything and <c:#4fae62>Overclock</c> loads an ally\'s next attack.']
          ]
        }]
      },
      {
        id: 'fw_conveyor', name: 'The Conveyor', w: 1900, theme: 'foundry',
        eastLock: { needsKey: 'foilbadge', lockedMsg: 'The security gate wants a Foundry Pass. Somebody senior is carrying it.' },
        props: K.scatter(['gear', 'crate'], 8, 1900),
        solids: [
          { x: 520, z: .42, w: 90, d: .28, h: 64 },
          { x: 820, z: .42, w: 90, d: .28, h: 128 },
          { x: 1120, z: .42, w: 90, d: .28, h: 64 },
          { x: 1420, z: .5, w: 140, d: .36, h: 0, id: 'fw_plated', hidden: true }
        ],
        pits: [{ x0: 600, x1: 740, z0: .28, z1: .56, to: { x: 440, z: .8 } },
          { x0: 900, x1: 1040, z0: .28, z1: .56, to: { x: 440, z: .8 } }],
        items: [{ kind: 'chest', x: 820, z: .42, y: 128, badge: 'zaptap', flag: 'fw4_ch1' },
          { kind: 'shard', x: 1700, z: .8, flag: 'fw4_shard' }],
        gizmos: [
          { kind: 'save', x: 150, z: .84 },
          { kind: 'plate', x: 1300, z: .5, once: true, reveals: 'fw_plated', label: 'Press down', script: [['say', 'volt', '*click* — mass threshold met. Plate engaged.']] }
        ],
        foes: [
          { id: 'fw4a', type: 'sparkbit', x: 700, z: .7, patrol: 130, group: ['sparkbit', 'sparkbit', 'wirewing'], killFlag: 'fw4_f1' },
          { id: 'fw4b', type: 'pressbot', x: 1620, z: .6, patrol: 60, group: ['pressbot', 'coglet'], killFlag: 'fw4_f2' }
        ]
      },
      {
        id: 'fw_substation', name: 'The Substation', w: 1700, theme: 'foundry',
        props: K.scatter(['gear', 'anvil', 'barrel'], 7, 1700),
        solids: [{ x: 800, z: .44, w: 100, d: .3, h: 62 }],
        items: [{ kind: 'chest', x: 800, z: .44, y: 62, item: 'mirrorfoil', flag: 'fw5_ch1' }],
        gizmos: K.rest(150).concat([
          {
            kind: 'generator', x: 1200, z: .8, needs: 'power', once: true, label: 'Power up',
            script: [['coins', 40], ['say', 'volt', '*click* — vending unit re-energised after six years. Contents: coins. Dispensing.']]
          }
        ]),
        foes: [
          { id: 'fw5a', type: 'voltoid', x: 1000, z: .66, patrol: 90, group: ['voltoid', 'wirewing'], killFlag: 'fw5_f1' },
          {
            id: 'fw5boss', type: 'foreman_ratchet', x: 1520, z: .6, patrol: 0, chase: false, boss: true,
            group: ['foreman_ratchet'], killFlag: 'fw_ratchet_down',
            cfg: {
              boss: true, noRun: true, music: 'boss',
              introLine: 'Foreman Ratchet: "You are on my floor without a pass, and my floor has never once been under budget."',
              introSpeaker: 'Foreman Ratchet', introPortrait: 'foreman_ratchet'
            },
            onWin: [
              ['givekey', 'foilbadge'],
              ['sayx', 'Foreman Ratchet', 'foreman_ratchet', 'Pass. Take it. And when you get to the pressroom — ask him what we print. Go on. Ask him.', 'boss'],
              ['say', 'volt', '*click* — LOG ENTRY. Foreman Ratchet has known for four years. Filing under COMPLICITY, subsection EXHAUSTION.']
            ]
          }
        ]
      },
      {
        id: 'fw_core', name: 'The Core', w: 1700, theme: 'foundry',
        eastLock: { needsKey: 'press_key', lockedMsg: 'The pressroom door is keyed. The key is in the core somewhere, behind the noise.' },
        props: K.scatter(['gear', 'pillar'], 7, 1700),
        solids: [{ x: 700, z: .44, w: 100, d: .3, h: 66 }, { x: 1100, z: .44, w: 100, d: .3, h: 132 }],
        items: [{ kind: 'chest', x: 1100, z: .44, y: 132, key: 'press_key', flag: 'fw6_key' },
          { kind: 'chest', x: 700, z: .44, y: 66, badge: 'tripledip', flag: 'fw6_ch1' }],
        gizmos: K.rest(150),
        foes: [
          { id: 'fw6a', type: 'pressbot', x: 900, z: .64, patrol: 70, group: ['pressbot', 'voltoid'], killFlag: 'fw6_f1' },
          { id: 'fw6b', type: 'coglet', x: 1400, z: .68, patrol: 90, group: ['coglet', 'coglet', 'wirewing', 'sparkbit'], killFlag: 'fw6_f2' }
        ],
        npcs: [{
          id: 'fw_volt_quest', sprite: 'miner_grit', x: 400, z: .74, name: 'Grit',
          script: function () {
            if (St.questState('scrap_run') === 'done') return [['say', 'miner_grit', 'Six cogs. Volt has them laid out in a row and keeps counting them. It is oddly moving.']];
            if (St.hasKey('cog_bundle')) return [
              ['say', 'miner_grit', 'You found the bundle. Volt has been after those for years.'],
              ['takekey', 'cog_bundle'],
              ['shard', 1],
              ['quest', 'scrap_run', 'done', 'Scrap Run'],
              ['say', 'volt', '*click* — LOG ENTRY. Six cogs. All six. ...Filing under GOOD DAY.']
            ];
            return [['say', 'miner_grit', 'Volt wants six discarded cogs off the floor. Bundle of them went into a crate on the works floor.'], ['quest', 'scrap_run', 'start']];
          }
        }]
      },
      {
        id: 'fw_pressroom', name: 'The Pressroom', w: 1300, theme: 'foundry', music: 'tense',
        props: [{ sprite: 'gear', x: 220, z: .12, scale: 1.5 }, { sprite: 'gear', x: 1080, z: .12, scale: 1.5 },
          { sprite: 'pillar', x: 520, z: .1 }, { sprite: 'pillar', x: 800, z: .1 }],
        gizmos: K.rest(150),
        triggers: [PB.MapKit.bossTrigger({
          x: 620, flag: 'tr_ampere', entId: 'amp', sprite: 'chief_ampere',
          name: 'Chief Engineer Ampere', enemy: 'chief_ampere', bg: 'foundry',
          before: [['say', 'narr', 'Bales of blank paper, stacked to the roof, going out east on a belt that never stops. In the middle of it, a fragment of the Crown wired into a housing as a power source.']],
          lines: [
            ['sayx', 'AMPERE', 'chief_ampere', 'OUTPUT UP FOUR HUNDRED PER CENT ON LAST YEAR.', 'boss'],
            ['say', 'pip', 'Output of what?'],
            ['sayx', 'AMPERE', 'chief_ampere', 'PRODUCT.', 'boss'],
            ['say', 'margo', 'It is blank. Every sheet. You are running a valley of six hundred people flat out to manufacture nothing.'],
            ['sayx', 'AMPERE', 'chief_ampere', 'SPECIFICATION WAS PROVIDED BY THE COMMISSIONING PARTY. SPECIFICATION IS MET. EFFICIENCY IS A MORAL POSITION AND MINE IS EXCELLENT.', 'boss'],
            ['say', 'volt', '*click* — LOG ENTRY. Line forty-one is still wrong.'],
            ['sayx', 'AMPERE', 'chief_ampere', 'SCRAP UNIT. YOU WERE FILED.', 'boss'],
            ['say', 'volt', 'I refiled. And Chief — I have read the manifest. Blank paper, in bales, east, to the Citadel. Do you know what he is going to WRITE on it?'],
            ['sayx', 'AMPERE', 'chief_ampere', 'THAT IS NOT A PRODUCTION QUESTION.', 'boss'],
            ['say', 'pip', 'It is the only question. Shut the line down.'],
            ['sayx', 'AMPERE', 'chief_ampere', 'I WAS BUILT TO PRESS.', 'boss']
          ],
          after: [
            ['say', 'narr', 'The belt stops. Six hundred people hear silence for the first time in six years and come out onto the gantries to look at it.'],
            ['say', 'volt', '*click* — LOG ENTRY. Line forty-one: corrected. Permanently. ...Filing under FINALLY.'],
            ['wait', 26],
            ['sfx', 'seal'],
            ['title', 'SEAL VII RECOVERED', 110],
            ['givekey', 'seal7'],
            ['seal', 'seal_blank'],
            ['say', 'sys', 'Seal Power learned: <c:#f7f5ff>Blank Slate</c> — clears the field, heals 15 HP/FP and fills the Encore gauge.'],
            ['upgrade', 'mallet'],
            ['rankup', 'volt'],
            ['flag', 'ch7_done', true],
            ['chapterset', 8],
            ['heal'],
            ['say', 'narr', 'Seven seals. And, east of here, a very great deal of blank paper waiting for somebody to write on it.'],
            ['say', 'pip', 'Right. Last address.'],
            ['goto', 'foldheim_road', 'ch7']
          ]
        })]
      }
    ]
  );

  /* ======================================================================
     CHAPTER 8 — THE SMUDGE CITADEL AND THE BLANK
     ====================================================================== */
  K.chain(
    { chapter: 8, music: 'blot', theme: 'blot', battleBg: 'blot', entryWest: { to: 'foldheim_road', spawn: 'ch8' } },
    [
      {
        id: 'sc_bridge', name: 'The Long Bridge', w: 1600,
        eastLock: { needsKey: 'citadel_writ', lockedMsg: 'The gate reads writs and nothing else. You will need one, and it will need to be convincing.' },
        props: K.scatter(['inkpool', 'pillar', 'banner'], 7, 1600),
        gizmos: K.rest(140).concat([
          { kind: 'sign', x: 460, z: .86, text: 'THE SMUDGE CITADEL\nAll visitors by writ. All writs by the Duke. All Dukes by the Duke.' }
        ]),
        items: [{ kind: 'coin', x: 900, z: .5, amount: 20, flag: 'sc1_c1' }],
        foes: [{ id: 'sc1a', type: 'blotling', x: 1100, z: .64, patrol: 100, group: ['blotling', 'smudgeling'], killFlag: 'sc1_f1' }],
        triggers: [{
          x: 320, z: .6, w: 100, d: 1.4, once: true, flag: 'tr_ch8',
          script: [
            ['chapter', 8, 'The Last Address', 'the Citadel, and what is behind it'],
            ['say', 'narr', 'The Citadel is not shaped like a building. It is shaped like the end of a sentence.'],
            ['wait', 20],
            ['spawn', { id: 'nib8', sprite: 'courier_nib', x: 640, z: .62, name: 'Nib', face: 'left' }],
            ['say', 'courier_nib', 'Pip.'],
            ['say', 'pip', 'Nib.'],
            ['say', 'courier_nib', 'Seven seals. I did not think you would get past three. I had money on three.'],
            ['say', 'courier_nib', 'The gate reads writs. Here — forged, by me, badly, on Citadel stock. It will hold for one reading and then it will start arguing.'],
            ['givekey', 'citadel_writ'],
            ['say', 'pip', 'Why?'],
            ['say', 'courier_nib', 'Because I have been carrying his letters for nine years and none of them have ever been sent. Nine years of a man writing to people and then filing it.'],
            ['say', 'courier_nib', 'A courier who never delivers is not a courier. I would like to be one again.'],
            ['say', 'pip', 'Come with us.'],
            ['say', 'courier_nib', 'No. Somebody has to be outside to sign for you when you come out.'],
            ['despawn', 'nib8'],
            ['quest', 'smudge_letters', 'start']
          ]
        }]
      },
      {
        id: 'sc_gates', name: 'The Ink Gates', w: 1800,
        props: K.scatter(['pillar', 'inkpool', 'banner'], 8, 1800),
        solids: [{ x: 700, z: .44, w: 100, d: .3, h: 64 }, { x: 1100, z: .44, w: 100, d: .3, h: 64 }],
        items: [{ kind: 'chest', x: 700, z: .44, y: 64, item: 'lastpage', flag: 'sc2_ch1' },
          { kind: 'chest', x: 1100, z: .44, y: 64, item: 'sevenlayer', flag: 'sc2_ch2' }],
        gizmos: K.rest(160),
        foes: [
          { id: 'sc2a', type: 'inkhound', x: 900, z: .66, patrol: 100, group: ['inkhound', 'blotling'], killFlag: 'sc2_f1' },
          { id: 'sc2b', type: 'nibguard', x: 1500, z: .62, patrol: 70, group: ['nibguard', 'smudgeling', 'blotling'], killFlag: 'sc2_f2' }
        ]
      },
      {
        id: 'sc_halls', name: 'The Blotted Halls', w: 1900, dark: true,
        props: K.scatter(['pillar', 'inkpool', 'bookshelf'], 9, 1900),
        solids: [{ x: 620, z: .42, w: 90, d: .28, h: 62 }, { x: 1000, z: .42, w: 90, d: .28, h: 124 },
          { x: 1340, z: .5, w: 140, d: .36, h: 0, id: 'sc_lit', hidden: true }],
        pits: [{ x0: 700, x1: 900, z0: .28, z1: .56, to: { x: 560, z: .8 } }],
        items: [{ kind: 'chest', x: 1000, z: .42, y: 124, badge: 'luckyday', flag: 'sc3_ch1' },
          { kind: 'shard', x: 1780, z: .8, flag: 'sc3_shard' }],
        gizmos: [
          { kind: 'save', x: 150, z: .84 },
          {
            kind: 'seam', x: 1220, z: .5, needs: 'light', once: true, reveals: 'sc_lit',
            label: 'Burn through',
            script: [['say', 'lumen', 'Ink hates me. I want that on the record as a point of pride.']]
          }
        ],
        foes: [
          { id: 'sc3a', type: 'erasure', x: 800, z: .68, patrol: 110, group: ['erasure', 'smudgeling'], killFlag: 'sc3_f1' },
          { id: 'sc3b', type: 'blotknight', x: 1600, z: .62, patrol: 80, group: ['blotknight', 'blotling', 'inkhound'], killFlag: 'sc3_f2' }
        ]
      },
      {
        id: 'sc_gallery', name: 'The Gallery of Unsent Letters', w: 1800,
        props: K.scatter(['bookshelf', 'pillar', 'banner'], 8, 1800),
        solids: [{ x: 900, z: .44, w: 100, d: .3, h: 66 }],
        items: [{ kind: 'chest', x: 900, z: .44, y: 66, key: 'smudge_letters', flag: 'sc4_letters' },
          { kind: 'coin', x: 1300, z: .78, amount: 30, flag: 'sc4_c1' }],
        gizmos: K.rest(160).concat([
          {
            kind: 'glyph', x: 1500, z: .8, needs: 'read', once: true, label: 'Read',
            script: [
              ['say', 'margo', '"To my brother, who I have not written to, because there is nothing in me worth reading. — S."'],
              ['say', 'margo', 'They are all like that, Pip. Nine of them. Nine years.'],
              ['ifitem', 'smudge_letters', [['quest', 'smudge_letters', 'done', 'Unsent Letters'], ['give', 'lastpage']]]
            ]
          }
        ]),
        foes: [{ id: 'sc4a', type: 'smudgeling', x: 1100, z: .66, patrol: 100, group: ['smudgeling', 'smudgeling', 'erasure'], killFlag: 'sc4_f1' }],
        triggers: [{
          x: 340, z: .6, w: 100, d: 1.4, once: true, flag: 'tr_gallery',
          script: [
            ['say', 'narr', 'A long room, and every wall of it framed letters. Sealed, addressed, stamped, and never once put in a bag.'],
            ['say', 'twigby', 'These are all his handwriting.'],
            ['say', 'pip', 'Nine years of them. Nib carried every one of these to this room and hung it on a wall.']
          ]
        }]
      },
      {
        id: 'sc_stair', name: 'The Black Stair', w: 1700,
        props: K.scatter(['pillar', 'inkpool'], 7, 1700),
        solids: [{ x: 700, z: .44, w: 100, d: .3, h: 70 }, { x: 1050, z: .44, w: 100, d: .3, h: 140 }],
        pits: [{ x0: 790, x1: 960, z0: .28, z1: .56, to: { x: 620, z: .8 } }],
        items: [{ kind: 'chest', x: 1050, z: .44, y: 140, item: 'grandfeast', flag: 'sc5_ch1' }],
        gizmos: K.rest(150),
        foes: [
          { id: 'sc5a', type: 'nibguard', x: 900, z: .68, patrol: 70, group: ['nibguard', 'erasure'], killFlag: 'sc5_f1' },
          {
            id: 'sc5boss', type: 'captain_sable', x: 1520, z: .6, patrol: 0, chase: false, boss: true,
            group: ['captain_sable'], killFlag: 'sc_sable_down',
            cfg: {
              boss: true, noRun: true, music: 'boss',
              introLine: 'Captain Sable: "Quillton. The parcel. You are the courier who would not let go of it."',
              introSpeaker: 'Captain Sable', introPortrait: 'captain_sable'
            },
            onWin: [
              ['music', 'sad'],
              ['sayx', 'Captain Sable', 'captain_sable', 'Hm. Adequate.', 'boss'],
              ['say', 'pip', 'You went easy.'],
              ['sayx', 'Captain Sable', 'captain_sable', 'I did no such thing and you will not say otherwise in front of my guard.', 'boss'],
              ['say', 'pip', 'There is no guard here.'],
              ['sayx', 'Captain Sable', 'captain_sable', '...No. There is not.', 'boss'],
              ['sayx', 'Captain Sable', 'captain_sable', 'I have served him nine years. I worked out what he serves in year four. I have been executing lawful orders on behalf of an absence ever since, and I have been very good at it, which is the part I would like on my record.', 'boss'],
              ['say', 'pip', 'Then stand down and it is not on your record at all.'],
              ['sayx', 'Captain Sable', 'captain_sable', 'It is always on the record. Go up. Do not let him talk first — he is much better at it than you.', 'boss'],
              ['give', 'lastpage']
            ]
          }
        ]
      },
      {
        id: 'sc_throne', name: 'The Signing Room', w: 1400, music: 'tense',
        props: [{ sprite: 'pillar', x: 240, z: .12 }, { sprite: 'pillar', x: 1160, z: .12 },
          { sprite: 'banner', x: 480, z: .1 }, { sprite: 'banner', x: 920, z: .1 },
          { sprite: 'inkpool', x: 700, z: .88 }],
        gizmos: K.rest(150),
        triggers: [PB.MapKit.bossTrigger({
          x: 640, flag: 'tr_smudge', entId: 'duke', sprite: 'duke_smudge',
          name: 'Duke Smudge', enemy: 'duke_smudge', bg: 'blot',
          before: [['say', 'narr', 'Bales of blank paper, floor to ceiling, and one desk. At the desk, a man who has been signing things for a very long time.']],
          lines: [
            ['sayx', 'Duke Smudge', 'duke_smudge', 'Sit down, courier. You have had a long road and I have had a long century.', 'boss'],
            ['say', 'pip', 'You tore it.'],
            ['sayx', 'Duke Smudge', 'duke_smudge', 'I tore it. Yes. In a room in Quillton with bunting up, and I would do it again this afternoon.', 'boss'],
            ['say', 'pip', 'Why.'],
            ['sayx', 'Duke Smudge', 'duke_smudge', 'Because it spoke to me. Not the Crown — the thing behind the Crown. It said: everything written will be unwritten, and it is only a question of the order.', 'boss'],
            ['sayx', 'Duke Smudge', 'duke_smudge', 'And then it said: tear the Crown, and I will do you last.', 'boss'],
            ['say', 'margo', 'You believed it.'],
            ['sayx', 'Duke Smudge', 'duke_smudge', 'I NEGOTIATED. There is a difference and it is the only dignity I have left.', 'boss'],
            ['say', 'pip', 'There are nine letters on your wall downstairs. Sealed and addressed and never sent.'],
            ['sayx', 'Duke Smudge', 'duke_smudge', '...Do not.', 'boss'],
            ['say', 'pip', 'A man who thinks nothing he writes is worth reading made a deal with a thing that unwrites. That is not negotiation, Duke. That is agreeing with it.'],
            ['sayx', 'Duke Smudge', 'duke_smudge', 'You are a SMEAR on a very fine page. Let me correct that.', 'boss']
          ],
          after: [
            ['givekey', 'crown_core'],
            ['say', 'narr', 'The desk goes over. The Duke does not get up.'],
            ['sayx', 'Duke Smudge', 'duke_smudge', 'Take the core. Take it and go and — no. No, wait. Listen.', 'boss'],
            ['sayx', 'Duke Smudge', 'duke_smudge', 'It is coming through. It said it would do me LAST and it is doing me FIRST, because I am the nearest thing to blank in the building—', 'boss'],
            ['sfx', 'roar'], ['shake', 24],
            ['music', 'final'],
            ['fadeout', '#f7f5ff', .12],
            ['goto', 'sc_ascend', 'west'],
            ['fadein', .1]
          ]
        })]
      },
      {
        id: 'sc_ascend', name: 'The Pouring Through', w: 1300, music: 'final', theme: 'blot',
        noEast: true,
        props: [{ sprite: 'pillar', x: 220, z: .12 }, { sprite: 'pillar', x: 1080, z: .12 }],
        onEnter: [
          ['spawn', { id: 'asc', sprite: 'smudge_ascendant', x: 860, z: .55, name: 'Smudge Ascendant', face: 'left' }],
          ['sfx', 'roar'], ['shake', 26],
          ['sayx', 'SMUDGE ASCENDANT', 'smudge_ascendant', 'I AM THE LAST LINE. AFTER ME, MARGIN.', 'boss'],
          ['say', 'pip', 'Duke. Duke, you are still in there. Nine letters. Somebody should read them.'],
          ['sayx', 'SMUDGE ASCENDANT', 'smudge_ascendant', 'THERE IS NOTHING IN THEM WORTH—', 'boss'],
          ['say', 'margo', 'That is not for you to decide! That has NEVER been for the writer to decide!'],
          ['battle', {
            enemies: ['smudge_ascendant'], boss: true, noRun: true, bg: 'blot', music: 'final'
          }, [
            ['despawn', 'asc'],
            ['music', 'sad'],
            ['say', 'narr', 'What is left of the Duke folds down onto the flagstones, ordinary and grey and very tired.'],
            ['sayx', 'Duke Smudge', 'duke_smudge', 'It is still coming. I only ever held the door.', 'boss'],
            ['say', 'pip', 'Then tell me where the door is.'],
            ['sayx', 'Duke Smudge', 'duke_smudge', 'Behind the paper. All of it. Four hundred per cent of nothing, courier, and every sheet is a way in.', 'boss'],
            ['sayx', 'Duke Smudge', 'duke_smudge', '...Deliver them. The nine. If there is time afterwards.', 'boss'],
            ['say', 'pip', 'It is a delivery. I do those.'],
            ['wait', 40],
            ['fadeout', '#f7f5ff', .06],
            ['goto', 'sc_between', 'west'],
            ['fadein', .05]
          ]]
        ]
      },
      {
        id: 'sc_between', name: 'The Blank Between', w: 1400, music: 'voidsong', theme: 'voidt', battleBg: 'void_',
        noEast: true,
        gizmos: K.rest(150),
        onEnter: [
          ['say', 'narr', 'There is no floor here, and you are standing on it. There is no light, and you can see. This is what a page is before anyone has been rude enough to write on it.'],
          ['wait', 20],
          ['spawn', { id: 'blank', sprite: 'the_blank', x: 900, z: .55, name: 'The Blank', face: 'left' }],
          ['wait', 30],
          ['sayx', 'THE BLANK', 'the_blank', 'there was nothing before you. i am simply patient.', 'boss'],
          ['say', 'pip', 'You told him you would spare him.'],
          ['sayx', 'THE BLANK', 'the_blank', 'i told him nothing. he read a blank page and heard a promise. they always do. that is the only trick i have and it has never once failed.', 'boss'],
          ['say', 'margo', 'Pip. Pip, it cannot read. It has never read anything. It does not know what is IN the seals.'],
          ['sayx', 'THE BLANK', 'the_blank', 'seven marks. i will take seven marks the way i have taken every other mark.', 'boss'],
          ['say', 'pip', 'They are not marks. They are promises. Seven of them, and I have collected every one, and a promise is the only thing you cannot unwrite — because it does not live on the page.'],
          ['sayx', 'THE BLANK', 'the_blank', 'then where.', 'boss'],
          ['say', 'pip', 'In whoever was told.'],
          ['music', 'final'],
          ['battle', {
            enemies: ['the_blank'], boss: true, noRun: true, bg: 'void_', music: 'final'
          }, [
            ['despawn', 'blank'],
            ['stopmusic'],
            ['wait', 40],
            ['say', 'narr', 'It does not die. It goes back to being an absence, the way a held breath goes back to being air — and around the edges of it, very faintly, there is writing again.'],
            ['music', 'voidsong'],
            ['wait', 20],
            ['say', 'pip', 'Right. Seven parcels. One crown.'],
            ['sfx', 'seal'],
            ['title', 'THE ORIGAMI CROWN', 130],
            ['say', 'narr', 'Pip folds it the way couriers fold everything: quickly, badly, and so it holds.'],
            ['wait', 20],
            ['say', 'twigby', 'Pip. Pip, that is — you did it wrong. That crease is completely wrong.'],
            ['say', 'pip', 'It holds.'],
            ['say', 'twigby', 'It HOLDS, but—'],
            ['say', 'pip', 'Twigby. It holds.'],
            ['ifpartner', 'lumen', [['say', 'lumen', 'Four hundred years I wanted a view. This will do. This will do very well.']]],
            ['ifpartner', 'bloop', [['say', 'bloop', 'Is it over? Can I go and tell Sogport? I am VERY good at telling people things.']]],
            ['ifpartner', 'snip', [['say', 'snip', 'Nine hundred people should have seen that. Nine hundred. And it was just us.']]],
            ['ifpartner', 'margo', [['say', 'margo', 'Pip. When there is time. Page four hundred and thirteen.'], ['say', 'pip', 'Tonight. I will read it twice.']]],
            ['ifpartner', 'volt', [['say', 'volt', '*click* — LOG ENTRY. Line forty-one: corrected. Crown: reassembled. World: still here. ...Filing under GOOD DAY.']]],
            ['wait', 30],
            ['fadeout', '#f7edd6', .04],
            ['say', 'narr', 'Quillton gets its Founding Day eleven weeks late, with the bunting rehung and the Crown on a cushion that is far too small for it, and one courier asleep in a chair through the entire ceremony.'],
            ['say', 'narr', 'Nine letters go out in the morning post. All nine are read. Two are answered.'],
            ['flag', 'game_clear', true],
            ['chapterset', 9],
            ['wait', 20],
            ['title', 'THE END', 150],
            ['credits']
          ]]
        ]
      }
    ]
  );
})();
