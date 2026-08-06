/* ==========================================================================
   PAPERBOUND — 23_maps_ch23.js
   CHAPTER 2 — Emberfold      CHAPTER 3 — Sogport & the Sunken Ream
   ========================================================================== */
'use strict';

(function () {
  var K = PB.MapKit, Shop = PB.Menus.defineShop, St = PB.State;

  /* ======================================================================
     CHAPTER 2 — EMBERFOLD
     ====================================================================== */
  Shop('cinderhall_forge', {
    name: 'The Slack Tub', keeper: 'miner_grit',
    greeting: 'Everything here is either hot or was recently. Mind your fingers.',
    stock: ['pulpberry', 'reamcake', 'honeyleaf', 'drycloth', 'emberpod', 'wadbomb', 'boldbrew', 'escapenote']
  });

  K.chain(
    { chapter: 2, music: 'ember', theme: 'ember', battleBg: 'ember', entryWest: { to: 'foldheim_road', spawn: 'ch2' } },
    [
      {
        id: 'em_gate', name: 'Emberfold Gate', w: 1400,
        props: K.scatter(['rock', 'brazier', 'rock'], 6, 1400).concat(K.scatter(['rock'], 3, 1400, 'front')),
        gizmos: K.rest(140).concat([
          { kind: 'sign', x: 420, z: .86, text: 'EMBERFOLD — CINDERHALL AHEAD\nDo not bring paper. (This is a joke the locals are tired of.)' }
        ]),
        items: [{ kind: 'coin', x: 700, z: .5, amount: 5, flag: 'em1_c1' }],
        foes: [{ id: 'em1a', type: 'emberling', x: 900, z: .6, patrol: 110, group: ['emberling', 'crumple'], killFlag: 'em1_f1' }],
        triggers: [{
          x: 320, z: .6, w: 100, d: 1.4, once: true, flag: 'tr_ch2',
          script: [
            ['chapter', 2, 'The Cinder Duchess', 'Emberfold, where paper is a bad idea'],
            ['say', 'twigby', 'Right. Everything down here is on fire and I am made of wood. I want that on the record.'],
            ['say', 'pip', 'Noted in the log.'],
            ['say', 'twigby', 'There is no log.'],
            ['say', 'pip', 'There is now.']
          ]
        }]
      },
      {
        id: 'em_road', name: 'Slagstone Road', w: 1800,
        props: K.scatter(['rock', 'brazier'], 8, 1800).concat([{ sprite: 'barrel', x: 1600, z: .88 }]),
        solids: [
          { x: 620, z: .44, w: 90, d: .28, h: 54 },
          { x: 900, z: .44, w: 90, d: .28, h: 108, id: 'em_ledge' },
          { x: 1180, z: .44, w: 90, d: .28, h: 54 }
        ],
        pits: [{ x0: 700, x1: 830, z0: .3, z1: .58, to: { x: 660, z: .76 } }],
        items: [
          { kind: 'coin', x: 620, z: .44, y: 54, amount: 4, flag: 'em2_c1' },
          { kind: 'chest', x: 900, z: .44, y: 108, item: 'emberpod', flag: 'em2_ch1' },
          { kind: 'chest', x: 1700, z: .3, badge: 'fpplus', flag: 'em2_ch2' }
        ],
        foes: [
          { id: 'em2a', type: 'magmite', x: 480, z: .64, patrol: 100, group: ['magmite', 'emberling'], killFlag: 'em2_f1' },
          { id: 'em2b', type: 'cinderfly', x: 1080, z: .7, patrol: 140, group: ['cinderfly', 'cinderfly'], killFlag: 'em2_f2' },
          { id: 'em2c', type: 'ashgoyle', x: 1450, z: .6, patrol: 70, group: ['ashgoyle', 'emberling'], killFlag: 'em2_f3' }
        ],
        gizmos: [{ kind: 'sign', x: 220, z: .88, text: 'THE ROAD IS THE COOL PART.\nThat is not reassurance. That is just true.' }]
      },
      {
        id: 'em_cinderhall', name: 'Cinderhall', w: 1900, theme: 'interior', music: 'town',
        props: [
          { sprite: 'house_small', x: 240, z: .12 }, { sprite: 'house_small', x: 640, z: .1, scale: .95 },
          { sprite: 'house_small', x: 1500, z: .12 }, { sprite: 'anvil', x: 1080, z: .66 },
          { sprite: 'brazier', x: 140, z: .8 }, { sprite: 'brazier', x: 1780, z: .8 },
          { sprite: 'crate', x: 1240, z: .8 }, { sprite: 'barrel', x: 1290, z: .86 },
          { sprite: 'lamp', x: 420, z: .84 }, { sprite: 'lamp', x: 1160, z: .84 }
        ],
        gizmos: K.rest(180).concat([
          { kind: 'shop', x: 700, z: .44, shop: 'cinderhall_forge', label: 'Shop', sprite: 'shop_stall', scale: .8 },
          { kind: 'cook', x: 1000, z: .58, label: 'Cook', sprite: 'barrel' },
          { kind: 'inn', x: 1500, z: .44, price: 8, label: 'Rest', sprite: 'house_small', scale: .8 },
          { kind: 'sign', x: 380, z: .88, text: 'CINDERHALL. Population: whoever did not move away.\nThe Duchess keeps the furnaces lit. Nobody asks how.' }
        ]),
        items: [
          { kind: 'coin', x: 860, z: .78, amount: 6, flag: 'em3_c1' },
          { kind: 'chest', x: 1820, z: .3, item: 'foldroll', flag: 'em3_ch1' }
        ],
        npcs: [
          {
            id: 'lamplighter', sprite: 'villager_a', x: 520, z: .68, name: 'Lamplighter Tallow',
            script: function () {
              if (St.questState('lantern_oil') === 'done') return [['say', 'villager_a', 'Every lamp on the street is lit. First time in two years. You will forgive me if I stand here and look at them.']];
              if (St.questState('lantern_oil') === 'open' && St.hasKey('lantern_oil')) return [
                ['say', 'villager_a', 'Oil. Real oil. Where — no. No, I do not want to know.'],
                ['takekey', 'lantern_oil'],
                ['badge', 'fireshield'],
                ['quest', 'lantern_oil', 'done', 'Keeping the Light'],
                ['say', 'villager_a', 'Take this. Ember Shield. Pin it on and stomping a burning thing stops costing you skin.']
              ];
              return [
                ['say', 'villager_a', 'Half the street is dark. I have wicks, I have lamps, I have no oil.'],
                ['say', 'villager_a', 'The foundry keeps drums of it. The foundry also keeps things that bite. You look like you bite back.'],
                ['quest', 'lantern_oil', 'start']
              ];
            }
          },
          {
            id: 'em_smith', sprite: 'smith_deckle', x: 1080, z: .78, name: 'Forgehand Bick',
            script: [
              ['say', 'smith_deckle', 'Deckle up in Quillton? Ha. Tell him his tempering is still soft.'],
              ['say', 'smith_deckle', 'There is a bar of proper foundry steel in the vents. If you get it out, take it to him. He will pretend he is not pleased.']
            ]
          },
          {
            id: 'em_kid', sprite: 'kid_dot', x: 900, z: .86, name: 'Soot', wander: 50,
            script: [['say', 'kid_dot', 'The Duchess came through last winter and the furnaces went up and everyone got warm and nobody has said thank you.'], ['say', 'kid_dot', 'I said thank you. She did not hear me.']]
          },
          {
            id: 'em_gran', sprite: 'grandma_creased', x: 1500, z: .58, name: 'Kettle',
            script: [['say', 'grandma_creased', 'Eight coins. The beds are warm whether you pay or not, but I like to be asked.'], ['inn', 8]]
          },
          {
            id: 'em_scholar', sprite: 'scholar_ibis', x: 1660, z: .7, name: 'Assayer Flint',
            script: [['say', 'scholar_ibis', 'A fragment of the Crown fell into the furnace court six days ago. The heat has not dropped since.'], ['say', 'scholar_ibis', 'She is not hoarding it out of malice. She is hoarding it because it is warm and she is very, very tired.']]
          }
        ]
      },
      {
        id: 'em_foundry', name: 'The Foundry Floor', w: 1900, theme: 'volcano', dark: true,
        props: K.scatter(['brazier', 'gear', 'barrel', 'anvil'], 7, 1900),
        solids: [
          { x: 700, z: .44, w: 100, d: .3, h: 60 },
          { x: 1120, z: .44, w: 100, d: .3, h: 60 },
          { x: 1420, z: .5, w: 120, d: .34, h: 0, id: 'em_burnt', hidden: true }
        ],
        items: [
          { kind: 'chest', x: 700, z: .44, y: 60, item: 'drycloth', flag: 'em4_ch1' },
          { kind: 'coin', x: 980, z: .74, amount: 8, flag: 'em4_c1' },
          { kind: 'chest', x: 1820, z: .32, key: 'lantern_oil', flag: 'em4_oil' },
          { kind: 'shard', x: 1560, z: .8, flag: 'em4_shard' }
        ],
        gizmos: [
          {
            kind: 'seam', x: 1300, z: .5, needs: 'light', once: true, reveals: 'em_burnt',
            label: 'Burn through',
            script: [['say', 'lumen', 'Stand back. This is the only rude thing I do.'], ['say', 'narr', 'The paper barrier goes up in one clean sheet of flame and leaves a walkable floor behind.']]
          },
          { kind: 'sign', x: 240, z: .88, text: 'FOUNDRY FLOOR — LIGHTS OUT SINCE THE FIRE\nBring your own.' }
        ],
        foes: [
          { id: 'em4a', type: 'wickling', x: 520, z: .6, patrol: 90, group: ['wickling', 'emberling'], killFlag: 'em4_f1' },
          { id: 'em4b', type: 'slagmaw', x: 1000, z: .66, patrol: 100, group: ['slagmaw', 'cinderfly'], killFlag: 'em4_f2' },
          { id: 'em4c', type: 'ashgoyle', x: 1680, z: .62, patrol: 80, group: ['ashgoyle', 'magmite', 'emberling'], killFlag: 'em4_f3' }
        ],
        triggers: [{
          x: 300, z: .6, w: 90, d: 1.4, once: true, flag: 'tr_lumen',
          script: [
            ['say', 'narr', 'The floor is pitch dark except for one small steady light, sitting exactly where it has always sat.'],
            ['spawn', { id: 'lum', sprite: 'lumen', x: 470, z: .58, name: 'Lumen' }],
            ['wait', 30],
            ['say', 'lumen', 'You are the first thing to come through that door in four hundred years that was not on fire.'],
            ['say', 'pip', 'You have been lit this whole time?'],
            ['say', 'lumen', 'I was lit before the furnaces. I am the reference flame. If I go out, they have nothing to relight from, so I do not go out.'],
            ['say', 'lumen', 'Four hundred years, and nothing to read by but my own light. Do you know how that is? No. Nobody does.'],
            ['say', 'pip', 'Come with us, then. There is a lot to look at and most of it is trying to kill me.'],
            ['say', 'lumen', 'I have been burning for four hundred years with nothing to read by. Take me somewhere with a view.'],
            ['despawn', 'lum'],
            ['partner', 'lumen'],
            ['wait', 20],
            ['say', 'sys', 'Lumen joined you.\n<c:#c8443c>C</c> lights a dark room, and burns away paper barriers.\nIn battle, <c:#ff7a2e>Flare</c> reaches fliers and <c:#4fae62>Kindle</c> raises an ally\'s Attack.'],
            ['say', 'twigby', 'Oh good. A partner made of fire. For me. Specifically.']
          ]
        }]
      },
      {
        id: 'em_vents', name: 'The Vents', w: 1700, theme: 'volcano',
        eastLock: { needsKey: 'emberkey', lockedMsg: 'The furnace door is locked and the lock is glowing. There is a key somewhere hotter.' },
        props: K.scatter(['gear', 'rock', 'brazier'], 6, 1700),
        solids: [
          { x: 560, z: .42, w: 90, d: .28, h: 56 },
          { x: 860, z: .42, w: 90, d: .28, h: 112 },
          { x: 1160, z: .42, w: 90, d: .28, h: 56 }
        ],
        pits: [{ x0: 640, x1: 780, z0: .28, z1: .56, to: { x: 600, z: .76 } },
          { x0: 940, x1: 1080, z0: .28, z1: .56, to: { x: 900, z: .76 } }],
        items: [
          { kind: 'chest', x: 860, z: .42, y: 112, key: 'foundry_steel', flag: 'em5_steel' },
          { kind: 'coin', x: 1300, z: .78, amount: 10, flag: 'em5_c1' }
        ],
        gizmos: [{ kind: 'save', x: 160, z: .84 }, { kind: 'sign', x: 300, z: .88, text: 'MIND THE VENTS.\nThe vents do not mind you.' }],
        foes: [
          { id: 'em5a', type: 'cinderfly', x: 700, z: .7, patrol: 130, group: ['cinderfly', 'wickling'], killFlag: 'em5_f1' },
          {
            id: 'em5boss', type: 'wick_and_wisp', x: 1520, z: .6, patrol: 0, chase: false, boss: true,
            group: ['wick_and_wisp'], killFlag: 'em_wick_down',
            cfg: {
              boss: true, noRun: true, music: 'boss',
              introLine: 'Wick & Wisp: "TWO of us. ONE lamp. Do NOT try to work it out."',
              introSpeaker: 'Wick & Wisp', introPortrait: 'wick_and_wisp'
            },
            onWin: [
              ['say', 'lumen', 'Wick and Wisp. They were lit off me, you know. They never once said so.'],
              ['givekey', 'emberkey'],
              ['say', 'narr', 'The furnace key drops out of the flame, still too hot to be polite about.']
            ]
          }
        ],
        triggers: [{
          x: 1340, z: .6, w: 90, d: 1.4, once: true, flag: 'tr_wick',
          script: [
            ['music', 'tense'],
            ['say', 'lumen', 'Ah. The twins. Airborne and burning, so the mallet is useless and stomping will cost you.'],
            ['say', 'twigby', 'What DOES work?'],
            ['say', 'lumen', 'Water. Which we do not have. So: hit them from range and do not be brave.']
          ]
        }]
      },
      {
        id: 'em_furnace', name: 'The Great Furnace', w: 1500, theme: 'volcano',
        props: K.scatter(['brazier', 'gear'], 6, 1500).concat([{ sprite: 'pillar', x: 1380, z: .2 }, { sprite: 'pillar', x: 1380, z: .86 }]),
        solids: [{ x: 640, z: .46, w: 100, d: .3, h: 64 }, { x: 1000, z: .46, w: 100, d: .3, h: 64 }],
        items: [
          { kind: 'chest', x: 640, z: .46, y: 64, item: 'ironsheet', flag: 'em6_ch1' },
          { kind: 'chest', x: 1000, z: .46, y: 64, badge: 'firemallet', flag: 'em6_ch2' }
        ],
        gizmos: K.rest(160).concat([
          {
            kind: 'seam', x: 820, z: .8, needs: 'light', once: true,
            label: 'Burn through',
            script: [['coins', 25], ['say', 'lumen', 'Somebody hid their wages behind a paper screen in a furnace. I admire the confidence.']]
          }
        ]),
        foes: [
          { id: 'em6a', type: 'magmite', x: 500, z: .66, patrol: 90, group: ['magmite', 'magmite', 'emberling'], killFlag: 'em6_f1' },
          { id: 'em6b', type: 'slagmaw', x: 1180, z: .62, patrol: 90, group: ['slagmaw', 'ashgoyle'], killFlag: 'em6_f2' }
        ]
      },
      {
        id: 'em_court', name: 'The Furnace Court', w: 1300, music: 'tense', theme: 'volcano',
        props: [
          { sprite: 'pillar', x: 200, z: .14 }, { sprite: 'pillar', x: 1120, z: .14 },
          { sprite: 'brazier', x: 340, z: .84 }, { sprite: 'brazier', x: 980, z: .84 },
          { sprite: 'banner', x: 420, z: .1 }, { sprite: 'banner', x: 900, z: .1 }
        ],
        gizmos: K.rest(150),
        triggers: [PB.MapKit.bossTrigger({
          x: 640, flag: 'tr_pyra', entId: 'pyra', sprite: 'pyra_sizzlefold',
          name: 'Duchess Pyra Sizzlefold', enemy: 'pyra_sizzlefold', bg: 'ember',
          before: [
            ['say', 'narr', 'The court is hotter than the furnace. At the centre, on a chair that was once a chair, someone is holding a piece of the Crown against her chest like a hot water bottle.']
          ],
          lines: [
            ['sayx', 'Duchess Pyra Sizzlefold', 'pyra_sizzlefold', 'You have tracked ASH across my floor.', 'boss'],
            ['say', 'pip', 'Your floor is ash.'],
            ['sayx', 'Duchess Pyra Sizzlefold', 'pyra_sizzlefold', 'It is ARRANGED ash. There is a difference and you have ruined it.', 'boss'],
            ['say', 'pip', 'I need the fragment.'],
            ['sayx', 'Duchess Pyra Sizzlefold', 'pyra_sizzlefold', 'Do you know what I do here, courier? I keep four hundred furnaces lit for a town that has never once thanked me. I have been cold for a very long time.', 'boss'],
            ['sayx', 'Duchess Pyra Sizzlefold', 'pyra_sizzlefold', 'And then this fell out of the sky. And it is WARM. And you want me to hand it over.', 'boss'],
            ['say', 'lumen', 'Duchess. I am the reference flame. You can relight from me any hour you like. You never asked.'],
            ['sayx', 'Duchess Pyra Sizzlefold', 'pyra_sizzlefold', '...No. Because asking is for people who might be told no.', 'boss'],
            ['sayx', 'Duchess Pyra Sizzlefold', 'pyra_sizzlefold', 'So we will do this the other way. Try not to catch.', 'boss']
          ],
          after: [
            ['music', 'sad'],
            ['say', 'narr', 'She sits down. Not defeated — just finally allowed to stop holding something up.'],
            ['sayx', 'Duchess Pyra Sizzlefold', 'pyra_sizzlefold', 'Take it. It was never going to keep me warm. Nothing that small ever does.', 'boss'],
            ['say', 'lumen', 'Come to Cinderhall tonight. The street lamps are being lit. All of them. People will be out.'],
            ['sayx', 'Duchess Pyra Sizzlefold', 'pyra_sizzlefold', '...I have nothing to wear.', 'boss'],
            ['say', 'lumen', 'Wear the fire. It has always suited you.'],
            ['wait', 30],
            ['sfx', 'seal'],
            ['title', 'SEAL II RECOVERED', 110],
            ['givekey', 'seal2'],
            ['seal', 'seal_ember'],
            ['flag', 'form_plane', true],
            ['say', 'sys', 'Seal Power learned: <c:#ff7a2e>Emberseal</c> — 4 fire damage to every foe.\nNew fold: <c:#8fd0f0>Paper Plane</c>. Hold <c:#c8443c>Z</c> while falling to glide.'],
            ['upgrade', 'stomp'],
            ['flag', 'ch2_done', true],
            ['chapterset', 3],
            ['heal'],
            ['music', 'ember'],
            ['say', 'twigby', 'Sogport next. Water. WATER, Pip. I have opinions about water too but they are much better opinions.'],
            ['goto', 'foldheim_road', 'ch2']
          ]
        })]
      }
    ]
  );

  /* ======================================================================
     CHAPTER 3 — SOGPORT AND THE SUNKEN REAM
     ====================================================================== */
  Shop('sogport_chandler', {
    name: 'Keel & Cable', keeper: 'sailor_keel',
    greeting: 'Everything sold wet. Discount for anything you can carry out yourself.',
    stock: ['pulpberry', 'reamcake', 'inktea', 'drycloth', 'smellingink', 'thunderrag', 'papercutstar', 'swiftdraft']
  });

  K.chain(
    { chapter: 3, music: 'harbor', theme: 'harbor', battleBg: 'harbor', entryWest: { to: 'foldheim_road', spawn: 'ch3' } },
    [
      {
        id: 'sg_docks', name: 'Sogport Docks', w: 1500,
        props: K.scatter(['barrel', 'crate', 'coral'], 7, 1500).concat([{ sprite: 'lamp', x: 300, z: .86 }]),
        gizmos: K.rest(140).concat([
          { kind: 'sign', x: 420, z: .86, text: 'SOGPORT. TIDE TABLE: see reverse.\n(The reverse reads: "the tide has stopped bothering with tables".)' }
        ]),
        water: [{ x0: 900, x1: 1120, z0: .2, z1: .48 }],
        items: [{ kind: 'coin', x: 700, z: .74, amount: 6, flag: 'sg1_c1' }],
        foes: [{ id: 'sg1a', type: 'soggle', x: 1000, z: .68, patrol: 100, group: ['soggle', 'drizzler'], killFlag: 'sg1_f1' }],
        triggers: [{
          x: 320, z: .6, w: 100, d: 1.4, once: true, flag: 'tr_ch3',
          script: [
            ['chapter', 3, 'What Sleeps in the Ream', 'Sogport, and the thing under it'],
            ['say', 'narr', 'The water is a foot above where the water should be. Everyone here has decided not to mention it.'],
            ['say', 'lumen', 'I would like it noted that I am extremely flammable and this town is extremely damp, and I am here anyway.'],
            ['say', 'pip', 'Noted in the log.']
          ]
        }]
      },
      {
        id: 'sg_town', name: 'Sogport', w: 1900, theme: 'interior', music: 'harbor',
        props: [
          { sprite: 'house_small', x: 260, z: .12 }, { sprite: 'house_small', x: 700, z: .1, scale: .95 },
          { sprite: 'house_small', x: 1520, z: .12 }, { sprite: 'barrel', x: 1120, z: .82 },
          { sprite: 'crate', x: 1180, z: .88 }, { sprite: 'coral', x: 480, z: .9 },
          { sprite: 'lamp', x: 940, z: .84 }
        ],
        gizmos: K.rest(180).concat([
          { kind: 'shop', x: 740, z: .44, shop: 'sogport_chandler', label: 'Shop', sprite: 'shop_stall', scale: .8 },
          { kind: 'cook', x: 1060, z: .58, label: 'Cook', sprite: 'barrel' },
          { kind: 'inn', x: 1520, z: .44, price: 10, label: 'Rest', sprite: 'house_small', scale: .8 },
          { kind: 'sign', x: 400, z: .88, text: 'SOGPORT — HARBOUR AUTHORITY\nFerries suspended. Reason: "sea".' }
        ]),
        items: [{ kind: 'chest', x: 1840, z: .3, item: 'lifeleaf', flag: 'sg2_ch1' }, { kind: 'coin', x: 900, z: .8, amount: 8, flag: 'sg2_c1' }],
        npcs: [
          {
            id: 'keel', sprite: 'sailor_keel', x: 740, z: .6, name: 'Keel',
            script: function () {
              if (St.questState('ferry_manifest') === 'done') return [['say', 'sailor_keel', 'Manifest is back on the wall where it belongs. Ferries still stopped, but the paperwork is immaculate.'], ['shop', 'sogport_chandler']];
              if (St.questState('ferry_manifest') === 'open' && St.hasKey('harbor_manifest')) return [
                ['say', 'sailor_keel', 'That is it. That is HER. Water-stained but legible, and legible is all the authority wants.'],
                ['takekey', 'harbor_manifest'],
                ['shard', 1],
                ['quest', 'ferry_manifest', 'done', 'The Missing Manifest'],
                ['say', 'sailor_keel', 'Foil Shard, for your trouble. Take it to whichever of your friends needs sharpening.']
              ];
              return [
                ['say', 'sailor_keel', 'Harbour manifest went down with the Ream. Without it I cannot legally float a bathtub.'],
                ['say', 'sailor_keel', 'It is down there. So is everything else.'],
                ['quest', 'ferry_manifest', 'start'],
                ['shop', 'sogport_chandler']
              ];
            }
          },
          {
            id: 'sg_gran', sprite: 'grandma_creased', x: 1520, z: .58, name: 'Tarn',
            script: [['say', 'grandma_creased', 'Ten coins, and the beds are on the second floor now. Everything is on the second floor now.'], ['inn', 10]]
          },
          {
            id: 'sg_chef', sprite: 'chef_pulp', x: 1060, z: .7, name: 'Cook Brine',
            script: [['say', 'chef_pulp', 'Everything I make tastes faintly of harbour. I have stopped fighting it.'], ['cook']]
          },
          {
            id: 'sg_kid', sprite: 'kid_dash', x: 980, z: .88, name: 'Skiff', wander: 60,
            script: [['say', 'kid_dash', 'I folded a boat once. Out of a page of the manifest. Dad went spare.'], ['say', 'kid_dash', 'It is still down there somewhere. It was a GOOD boat.']]
          },
          {
            id: 'sg_ferrier', sprite: 'ferrier_stamp', x: 1300, z: .68, name: 'Harbourmaster Stamp',
            script: [['say', 'ferrier_stamp', 'The water rises and falls twice a day like breathing, and it is not the tide, and I would very much like it to be the tide.']]
          }
        ]
      },
      {
        id: 'sg_pier', name: 'The Long Pier', w: 1800,
        props: K.scatter(['barrel', 'coral', 'crate'], 6, 1800),
        water: [{ x0: 520, x1: 760, z0: .3, z1: .95 }, { x0: 1180, x1: 1440, z0: .3, z1: .95 }],
        solids: [{ x: 940, z: .5, w: 200, d: .5, h: 0 }],
        items: [{ kind: 'coin', x: 960, z: .5, amount: 10, flag: 'sg3_c1' }, { kind: 'chest', x: 1720, z: .32, item: 'bigwadbomb', flag: 'sg3_ch1' }],
        gizmos: [
          {
            kind: 'dockside', x: 640, z: .6, needs: 'ferry', once: false, label: 'Ferry across',
            script: [['say', 'bloop', 'Hop on! I am EXACTLY the right shape for this.'], ['func', function (w) { w.player.x = 900; w.player.z = .5; }], ['sfx', 'water']]
          },
          {
            kind: 'dockside', x: 1160, z: .6, needs: 'ferry', once: false, label: 'Ferry across',
            script: [['say', 'bloop', 'Second crossing! I am having the best day.'], ['func', function (w) { w.player.x = 1480; w.player.z = .6; }], ['sfx', 'water']]
          },
          { kind: 'sign', x: 240, z: .88, text: 'PIER 3 — CONDEMNED\nPier 1 and 2 are underneath Pier 3 now.' }
        ],
        foes: [
          { id: 'sg3a', type: 'barnacleaf', x: 960, z: .5, patrol: 60, group: ['barnacleaf', 'soggle'], killFlag: 'sg3_f1' },
          { id: 'sg3b', type: 'brinehound', x: 1600, z: .64, patrol: 90, group: ['brinehound', 'drizzler'], killFlag: 'sg3_f2' }
        ]
      },
      {
        id: 'sg_wreck', name: 'The Wreck', w: 1800, theme: 'sea', music: 'harbor',
        props: K.scatter(['coral', 'barrel', 'crate'], 8, 1800),
        solids: [{ x: 700, z: .44, w: 100, d: .3, h: 58 }, { x: 1100, z: .44, w: 100, d: .3, h: 58 }],
        items: [
          { kind: 'chest', x: 700, z: .44, y: 58, item: 'tonicwash', flag: 'sg4_ch1' },
          { kind: 'shard', x: 1500, z: .8, flag: 'sg4_shard' },
          { kind: 'coin', x: 1300, z: .74, amount: 9, flag: 'sg4_c1' }
        ],
        gizmos: [{ kind: 'save', x: 160, z: .84 }],
        foes: [
          { id: 'sg4a', type: 'inkfish', x: 900, z: .68, patrol: 110, group: ['inkfish', 'tidewisp'], killFlag: 'sg4_f1' },
          { id: 'sg4b', type: 'soggle', x: 1650, z: .62, patrol: 80, group: ['soggle', 'barnacleaf', 'drizzler'], killFlag: 'sg4_f2' }
        ],
        triggers: [{
          x: 340, z: .6, w: 100, d: 1.4, once: true, flag: 'tr_bloop',
          script: [
            ['say', 'narr', 'Wedged in the ribs of the wreck, keeping about four hundred litres of water out of a hold it has no business protecting, is a paper boat.'],
            ['spawn', { id: 'blp', sprite: 'bloop', x: 520, z: .6, name: 'Bloop' }],
            ['wait', 26],
            ['say', 'bloop', 'HELLO. Are you here about the hold? I have been holding the hold.'],
            ['say', 'pip', 'How long?'],
            ['say', 'bloop', 'Since the boy folded me! Out of a page of a manifest! It was a very important page, he got in enormous trouble, it was the best day of my life.'],
            ['say', 'twigby', 'You have been plugging a shipwreck. Alone. For years.'],
            ['say', 'bloop', 'Someone had to be the right shape.'],
            ['say', 'pip', 'We are going down into the Ream. We need something boat-shaped.'],
            ['say', 'bloop', 'Water! You need water crossed! I am EXACTLY the right shape for that. Hop on, hop on.'],
            ['despawn', 'blp'],
            ['partner', 'bloop'],
            ['wait', 20],
            ['say', 'sys', 'Bloop joined you.\n<c:#c8443c>C</c> at a dockside unfolds Bloop into a boat and ferries you across.\nIn battle, <c:#57b8ea>Splash</c> makes foes Soggy and <c:#4fae62>Bubble Shield</c> raises an ally\'s Defence.'],
            ['say', 'lumen', 'I am going to stand over here. Nothing personal.']
          ]
        }]
      },
      {
        id: 'sg_tideway', name: 'The Tideway', w: 1700, theme: 'sea',
        eastLock: { needsKey: 'tidepass', lockedMsg: 'The lock gate needs a Tide Pass. The Bosun has one, and the Bosun is not sharing.' },
        props: K.scatter(['coral', 'barrel'], 6, 1700),
        water: [{ x0: 560, x1: 820, z0: .3, z1: .95 }],
        solids: [{ x: 1000, z: .44, w: 100, d: .3, h: 62 }],
        items: [{ kind: 'chest', x: 1000, z: .44, y: 62, badge: 'icemallet', flag: 'sg5_ch1' }],
        gizmos: [
          {
            kind: 'dockside', x: 680, z: .6, needs: 'ferry', once: false, label: 'Ferry across',
            script: [['func', function (w) { w.player.x = 900; w.player.z = .6; }], ['sfx', 'water']]
          },
          { kind: 'save', x: 160, z: .84 }
        ],
        foes: [
          { id: 'sg5a', type: 'drizzler', x: 1180, z: .7, patrol: 120, group: ['drizzler', 'inkfish'], killFlag: 'sg5_f1' },
          {
            id: 'sg5boss', type: 'barnacle_bosun', x: 1520, z: .6, patrol: 0, chase: false, boss: true,
            group: ['barnacle_bosun'], killFlag: 'sg_bosun_down',
            cfg: {
              boss: true, noRun: true, music: 'boss',
              introLine: 'Barnacle Bosun: "This is a ship. I am its Bosun. Both of those are lies and I will fight you over either."',
              introSpeaker: 'Barnacle Bosun', introPortrait: 'barnacle_bosun'
            },
            onWin: [
              ['givekey', 'tidepass'],
              ['sayx', 'Barnacle Bosun', 'barnacle_bosun', 'Take the pass. Go down. Do not wake it gently — it does not wake gently.', 'boss']
            ]
          }
        ]
      },
      {
        id: 'sg_ream', name: 'The Sunken Ream', w: 1900, theme: 'sea', dark: true,
        props: K.scatter(['coral', 'crate', 'barrel'], 9, 1900),
        solids: [{ x: 640, z: .44, w: 100, d: .3, h: 56 }, { x: 1040, z: .44, w: 100, d: .3, h: 112 }, { x: 1440, z: .44, w: 100, d: .3, h: 56 }],
        pits: [{ x0: 730, x1: 940, z0: .28, z1: .56, to: { x: 620, z: .78 } }],
        items: [
          { kind: 'chest', x: 1040, z: .44, y: 112, key: 'harbor_manifest', flag: 'sg6_man' },
          { kind: 'chest', x: 1820, z: .32, item: 'lastpage', flag: 'sg6_ch1' },
          { kind: 'coin', x: 800, z: .78, amount: 12, flag: 'sg6_c1' }
        ],
        gizmos: K.rest(160).concat([
          { kind: 'sign', x: 300, z: .88, text: 'THE REAM. Four thousand tonnes of paper, filed by nobody, read by nothing.' }
        ]),
        foes: [
          { id: 'sg6a', type: 'inkfish', x: 900, z: .7, patrol: 120, group: ['inkfish', 'inkfish', 'tidewisp'], killFlag: 'sg6_f1' },
          { id: 'sg6b', type: 'brinehound', x: 1300, z: .64, patrol: 100, group: ['brinehound', 'barnacleaf'], killFlag: 'sg6_f2' },
          { id: 'sg6c', type: 'soggle', x: 1700, z: .6, patrol: 70, group: ['soggle', 'soggle', 'drizzler'], killFlag: 'sg6_f3' }
        ]
      },
      {
        id: 'sg_depths', name: 'The Coil', w: 1300, theme: 'sea', music: 'tense',
        props: [{ sprite: 'coral', x: 220, z: .12, scale: 1.4 }, { sprite: 'coral', x: 1080, z: .12, scale: 1.4 },
          { sprite: 'pillar', x: 500, z: .1 }, { sprite: 'pillar', x: 800, z: .1 }],
        gizmos: K.rest(150),
        triggers: [PB.MapKit.bossTrigger({
          x: 620, flag: 'tr_nautilus', entId: 'naut', sprite: 'nautilus_grim',
          name: 'Nautilus Grim', enemy: 'nautilus_grim', bg: 'harbor',
          before: [['say', 'narr', 'The chamber breathes. In, and the water drops a foot. Out, and it climbs back. It has been doing this for six days, and Sogport has been calling it the tide.']],
          lines: [
            ['say', 'bloop', 'Oh. Oh, that is not a shipwreck. That is what happened TO the shipwreck.'],
            ['sayx', 'Nautilus Grim', 'nautilus_grim', '...warm. ssssomething warm. mine.', 'boss'],
            ['say', 'pip', 'Listen to me. You are drowning a town.'],
            ['sayx', 'Nautilus Grim', 'nautilus_grim', 'a. town.', 'boss'],
            ['say', 'pip', 'Two hundred people. They have moved everything to the second floor. They are pretending it is the tide because the alternative is you.'],
            ['sayx', 'Nautilus Grim', 'nautilus_grim', 'i have ssslept here ssssince before the town. i did not asssk it to be built on my breathing.', 'boss'],
            ['say', 'pip', 'No. But you have the fragment, and I am asking for it, and I would rather ask.'],
            ['sayx', 'Nautilus Grim', 'nautilus_grim', 'no.', 'boss'],
            ['say', 'twigby', 'Well. He asked.']
          ],
          after: [
            ['music', 'sad'],
            ['say', 'narr', 'The coil settles. The water drops a foot and stays down.'],
            ['sayx', 'Nautilus Grim', 'nautilus_grim', 'take it. i will ssssleep deeper. tell them... to build higher anyway.', 'boss'],
            ['say', 'bloop', 'I will tell them! I am very good at telling people things!'],
            ['wait', 30],
            ['sfx', 'seal'],
            ['title', 'SEAL III RECOVERED', 110],
            ['givekey', 'seal3'],
            ['seal', 'seal_tidewash'],
            ['form', 'form_dart'],
            ['say', 'sys', 'Seal Power learned: <c:#57b8ea>Tidewash</c> — 8 HP and clears every ailment.\nNew Origami Form: <c:#e0483c>Dart</c> — Attack +2 and every hit pierces, but you crumple easily.'],
            ['upgrade', 'mallet'],
            ['flag', 'ch3_done', true],
            ['chapterset', 4],
            ['heal'],
            ['say', 'twigby', 'Three. Three is nearly half. Three is basically nothing.'],
            ['say', 'pip', 'Three is three, Twigby.'],
            ['goto', 'foldheim_road', 'ch3']
          ]
        })]
      }
    ]
  );
})();
