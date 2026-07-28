/* ==========================================================================
   PAPERBOUND — 21_maps_ch0.js
   PROLOGUE — Quillton   +   CHAPTER 1 — Creasewood

   This file is the reference for the map format. Every other chapter file
   follows the same shape:

   PB.Maps.define(id, {
     name, chapter, music, theme, battleBg, dark?,
     bounds: {x0, x1, z0, z1},
     spawns: { key: {x, z, face?} },              // z is depth 0(far)..1(near)
     exits:  [{x, z, w, d, to, spawn, door?, needsKey?, needsFlag?, lockedMsg?}],
     solids: [{x, z, w, d, h, sprite?, wall?, id?, hidden?}],
     props:  [{sprite, x, z, y?, scale?, face?, id?}],
     npcs:   [{id, sprite, x, z, name, face?, wander?, script:[...]}],
     foes:   [{id, type, x, z, patrol?, group:[...], killFlag?, boss?, cfg?}],
     items:  [{kind:'coin'|'chest'|'shard', x, z, amount?/item?/badge?, flag?}],
     gizmos: [{kind, x, z, ...}],
     triggers:[{x, z, w, d, once?, flag?, script:[...]}],
     water:  [{x0,x1,z0,z1}], pits: [{x0,x1,z0,z1,to:{x,z}}],
     onEnter: [...script...]
   })
   ========================================================================== */
'use strict';

(function () {
  var M = PB.Maps.define, Shop = PB.Menus.defineShop;

  /* ---- shops ------------------------------------------------------------- */
  Shop('quillton_general', {
    name: 'Ream & Daughters', keeper: 'shopkeep_ream',
    greeting: 'Fresh pulp, fresh paper, fresh prices. Well — two out of three.',
    stock: ['pulpberry', 'honeyleaf', 'reamcake', 'antidote', 'drycloth', 'wadbomb', 'escapenote']
  });
  Shop('quillton_badges', {
    name: 'Foil\'s Findings', keeper: 'badgesmith_foil', markup: 1,
    greeting: 'Badges! Pinned, polished, and probably legal.',
    stock: ['powerstomp', 'powermallet', 'happyheart', 'timingtutor', 'prettylucky', 'payoff']
  });
  Shop('creasewood_camp', {
    name: 'Trailside Basket', keeper: 'villager_d', markup: 1.15,
    greeting: 'Nobody restocks me out here, so mind the prices.',
    stock: ['pulpberry', 'honeyleaf', 'reamcake', 'antidote', 'emberpod']
  });

  /* ======================================================================
     PROLOGUE — QUILLTON
     ====================================================================== */

  M('quill_square', {
    name: 'Quillton Square', chapter: 0, music: 'town', theme: 'town', battleBg: 'stage',
    bounds: { x0: 0, x1: 1500, z0: .1, z1: .95 },
    spawns: {
      default: { x: 200, z: .6 },
      west: { x: 40, z: .6 },
      east: { x: 1450, z: .6, face: 'left' },
      hall: { x: 760, z: .78 }
    },
    exits: [
      { x: 8, z: .6, w: 40, d: 1, to: 'quill_lane', spawn: 'east' },
      { x: 1492, z: .6, w: 40, d: 1, to: 'quill_gate', spawn: 'west' }
    ],
    props: [
      { sprite: 'house_small', x: 180, z: .12, scale: 1.05 },
      { sprite: 'house_small', x: 470, z: .1, scale: .95 },
      { sprite: 'house_small', x: 1180, z: .12, scale: 1 },
      { sprite: 'tree_round', x: 340, z: .3 },
      { sprite: 'tree_round', x: 1010, z: .26, scale: .9 },
      { sprite: 'bush', x: 620, z: .88 }, { sprite: 'bush', x: 900, z: .9 },
      { sprite: 'lamp', x: 260, z: .82 }, { sprite: 'lamp', x: 1100, z: .82 },
      { sprite: 'banner', x: 700, z: .18 }, { sprite: 'banner', x: 840, z: .18 },
      { sprite: 'crate', x: 1290, z: .74 }, { sprite: 'barrel', x: 1330, z: .8 }
    ],
    solids: [
      { x: 760, z: .2, w: 220, d: .3, h: 54, sprite: 'shop_stall' }
    ],
    gizmos: [
      { kind: 'save', x: 100, z: .84 },
      { kind: 'shop', x: 660, z: .42, shop: 'quillton_general', label: 'Shop', sprite: 'shop_stall', scale: .8 },
      { kind: 'cook', x: 1000, z: .58, label: 'Cook', sprite: 'barrel' },
      { kind: 'inn', x: 1250, z: .42, price: 5, label: 'Rest', sprite: 'house_small', scale: .8 },
      {
        kind: 'sign', x: 400, z: .86,
        text: 'QUILLTON — pop. 240, give or take a draft.\nFounding Day this evening. Please do not fold the bunting.'
      },
      {
        kind: 'sign', x: 1420, z: .86,
        text: 'EAST GATE → Creasewood Road.\nTravellers: the road is safe. The woods are the woods.'
      }
    ],
    items: [
      { kind: 'coin', x: 540, z: .72, amount: 3, flag: 'q_coin1' },
      { kind: 'coin', x: 880, z: .34, amount: 3, flag: 'q_coin2' },
      { kind: 'chest', x: 1400, z: .3, item: 'reamcake', flag: 'q_chest1' }
    ],
    npcs: [
      {
        id: 'mayor', sprite: 'mayor_folio', x: 760, z: .66, name: 'Mayor Folio',
        script: function () {
          if (!PB.State.hasFlag('prologue_done')) return [
            ['say', 'mayor_folio', 'Pip! Finally. Is that the parcel? Tell me that is the parcel.'],
            ['say', 'pip', 'Signed for and everything.'],
            ['say', 'mayor_folio', 'Bring it to the square platform. Founding Day waits for no one — least of all me.']
          ];
          return [['say', 'mayor_folio', 'Seven seals, Pip. Seven. And I signed for the delivery, so technically this is my fault. Please fix it.']];
        }
      },
      {
        id: 'elder', sprite: 'elder_quill', x: 300, z: .5, name: 'Elder Quill',
        script: function () {
          if (!PB.State.hasFlag('prologue_done')) return [
            ['say', 'elder_quill', 'A courier who arrives early. I shall have to revise my opinion of the young.'],
            ['say', 'elder_quill', 'Do you know what you are carrying, child? No. Of course not. That is rather the point of couriers.']
          ];
          return [
            ['say', 'elder_quill', 'The Crown was folded from a single sheet, once. One sheet, seven creases, and every crease a promise.'],
            ['say', 'elder_quill', 'Smudge tore it because a torn thing cannot promise anything. Go and put the promises back.'],
            ['ifnotflag', 'got_map_hint', [
              ['say', 'elder_quill', 'Press <c:#c8443c>Tab</c> to open your map. Press <c:#c8443c>Esc</c> for your satchel. And do try to eat.'],
              ['flag', 'got_map_hint', true]
            ]]
          ];
        }
      },
      {
        id: 'shopkeep', sprite: 'shopkeep_ream', x: 660, z: .5, name: 'Ream',
        script: [['say', 'shopkeep_ream', 'Stall\'s just there. Everything on it is honest and half of it is edible.'], ['shop', 'quillton_general']]
      },
      {
        id: 'chef', sprite: 'chef_pulp', x: 1000, z: .68, name: 'Chef Pulp',
        script: [
          ['say', 'chef_pulp', 'Bring me two things and I will make them one thing. That is the whole art, really.'],
          ['ifnotflag', 'got_cookbook', [['givekey', 'cookbook'], ['flag', 'got_cookbook', true], ['say', 'chef_pulp', 'Take the book. Do not read the last page, it is a shopping list and it is embarrassing.']]],
          ['cook']
        ]
      },
      {
        id: 'gran', sprite: 'grandma_creased', x: 1250, z: .56, name: 'Gran Creased',
        script: [['say', 'grandma_creased', 'Five coins a night, and I will not ask where you have been.'], ['inn', 5]]
      },
      {
        id: 'kid1', sprite: 'kid_dot', x: 520, z: .82, name: 'Dot', wander: 40,
        script: [['say', 'kid_dot', 'Are you a REAL courier? Do you have a REAL satchel? Can I hold it? Please?'], ['say', 'pip', '...It is mostly receipts.'], ['say', 'kid_dot', 'CAN I HOLD THE RECEIPTS.']]
      },
      {
        id: 'kid2', sprite: 'kid_dash', x: 580, z: .9, name: 'Dash', wander: 50,
        script: [['say', 'kid_dash', 'Hold <c:#c8443c>Q</c> or <c:#c8443c>E</c> to run. I can run faster than you though. Probably.']]
      },
      {
        id: 'sailor', sprite: 'sailor_keel', x: 1120, z: .74, name: 'Keel',
        script: [['say', 'sailor_keel', 'Down from Sogport for the festival. Water is up, ferries are down, and nobody can tell me why.']]
      }
    ],
    triggers: [
      {
        x: 300, z: .6, w: 80, d: 1.2, once: true, flag: 'tr_intro',
        script: [
          ['chapter', 0, 'A Parcel for Quillton', 'in which very little goes to plan'],
          ['say', 'narr', 'Founding Day. Bunting on every line, the whole town smelling of warm pulp, and one courier arriving — for once — with time to spare.'],
          ['say', 'pip', 'Deliver the parcel. Get paid. Sit down. In that order.'],
          ['toast', 'Arrow keys move. Z jumps and talks.', null, '#fdf6e3']
        ]
      },
      {
        x: 760, z: .62, w: 70, d: .5, once: true, flag: 'tr_deliver', notFlag: 'prologue_done',
        script: [
          ['say', 'mayor_folio', 'Right here on the platform. Careful — CAREFUL —'],
          ['sfx', 'chest'],
          ['title', 'THE ORIGAMI CROWN', 100],
          ['say', 'narr', 'A crown folded from one sheet of paper, seven creases deep. It has sat on nothing and no one for four hundred years, which is rather the point.'],
          ['music', 'tense'],
          ['say', 'narr', 'The light goes wrong first. Then the shadow under the platform stands up.'],
          ['camera', 1000, 40],
          ['spawn', { id: 'sable', sprite: 'captain_sable', x: 1060, z: .5, name: 'Captain Sable', face: 'left' }],
          ['wait', 30],
          ['sayx', 'Captain Sable', 'captain_sable', 'Quillton. By the authority of Duke Smudge, this object is CONFISCATED.', 'boss'],
          ['say', 'mayor_folio', 'On WHOSE authority?!'],
          ['sayx', 'Captain Sable', 'captain_sable', 'I just said. Do keep up.', 'boss'],
          ['say', 'pip', 'It is signed for. It is MINE until he signs.'],
          ['sayx', 'Captain Sable', 'captain_sable', '...You are a courier.', 'boss'],
          ['say', 'pip', 'I am the courier.'],
          ['wait', 20],
          ['sfx', 'tear'],
          ['shake', 22],
          ['fadeout', '#ffffff', .16],
          ['title', 'SEVEN SEALS SCATTER', 90],
          ['fadein', .08],
          ['say', 'narr', 'It does not tear cleanly. Paper never does. Seven bright fragments go up like startled birds and out over the whole of Foldheim.'],
          ['sayx', 'Captain Sable', 'captain_sable', 'Hm. That was not the instruction.', 'boss'],
          ['sayx', 'Captain Sable', 'captain_sable', 'No matter. Scattered is as good as destroyed, and the Duke is not a patient reader.', 'boss'],
          ['movenowait', 'sable', 1480, .5, 4],
          ['wait', 60],
          ['despawn', 'sable'],
          ['music', 'sad'],
          ['say', 'mayor_folio', 'Four hundred years. Four hundred years and it lasted nine seconds in MY hands.'],
          ['say', 'elder_quill', 'Then it will have to be put back. Pip.'],
          ['say', 'pip', 'I know. I know. Seven parcels. Seven addresses.'],
          ['say', 'elder_quill', 'That is a courier\'s way of saying yes. Take this — the road map. And take the road east.'],
          ['givekey', 'map_foldheim'],
          ['flag', 'prologue_done', true],
          ['chapterset', 0],
          ['quest', 'seven_seals', 'start'],
          ['camerafree'],
          ['music', 'town'],
          ['say', 'narr', 'The east gate is at the far end of the square.'],
          ['toast', 'Head east out of Quillton', null, '#fdf6e3']
        ]
      }
    ],
    onEnter: []
  });

  M('quill_lane', {
    name: 'Quillton Lane', chapter: 0, music: 'town', theme: 'town', battleBg: 'stage',
    bounds: { x0: 0, x1: 1000, z0: .12, z1: .95 },
    spawns: { default: { x: 120, z: .6 }, east: { x: 940, z: .6, face: 'left' } },
    exits: [{ x: 985, z: .6, w: 40, d: 1, to: 'quill_square', spawn: 'west' }],
    props: [
      { sprite: 'house_small', x: 220, z: .14 }, { sprite: 'house_small', x: 620, z: .12, scale: .95 },
      { sprite: 'anvil', x: 420, z: .62 }, { sprite: 'crate', x: 500, z: .74 },
      { sprite: 'lamp', x: 140, z: .84 }, { sprite: 'lamp', x: 760, z: .84 },
      { sprite: 'bookshelf', x: 880, z: .16, scale: .8 }
    ],
    solids: [{ x: 700, z: .5, w: 70, d: .3, h: 46, sprite: 'crate' }],
    items: [
      { kind: 'coin', x: 320, z: .82, amount: 4, flag: 'ql_coin1' },
      { kind: 'chest', x: 760, z: .3, item: 'honeyleaf', flag: 'ql_chest1' },
      { kind: 'chest', x: 700, z: .5, y: 46, badge: 'happyflower', flag: 'ql_chest2' }
    ],
    gizmos: [
      { kind: 'shop', x: 880, z: .5, shop: 'quillton_badges', label: 'Badges', sprite: 'shop_stall', scale: .7 },
      { kind: 'sign', x: 60, z: .86, text: 'DECKLE & SON, SMITHS. (There is no son. There is an anvil.)' }
    ],
    npcs: [
      {
        id: 'smith', sprite: 'smith_deckle', x: 420, z: .74, name: 'Deckle',
        script: function () {
          var S = PB.State;
          if (S.questState('deckle_hammer') === 'done') return [['say', 'smith_deckle', 'She swings true now, eh? Do not tell me otherwise, I will not hear it.']];
          if (S.questState('deckle_hammer') === 'open' && S.hasKey('foundry_steel')) return [
            ['say', 'smith_deckle', 'That is foundry steel or I am a paper hat. Give it here.'],
            ['takekey', 'foundry_steel'],
            ['sfx', 'mallet'], ['wait', 30], ['sfx', 'mallet'], ['wait', 30],
            ['upgrade', 'mallet'],
            ['quest', 'deckle_hammer', 'done', 'A Proper Hammer'],
            ['say', 'smith_deckle', 'There. Now stop hitting things with the FLAT of it.']
          ];
          if (S.get().chapter >= 2) return [
            ['say', 'smith_deckle', 'That mallet of yours is a toy. Bring me a bar of Emberfold steel and I will make it a tool.'],
            ['quest', 'deckle_hammer', 'start'],
            ['say', 'smith_deckle', 'Foundry floor. Big red building. You cannot miss it, it is on fire.']
          ];
          return [['say', 'smith_deckle', 'Come back when you have swung that mallet at something that swings back.']];
        }
      },
      {
        id: 'painter', sprite: 'villager_c', x: 180, z: .68, name: 'Signwright Vellum',
        script: function () {
          var S = PB.State;
          if (S.questState('sign_painter') === 'done') return [['say', 'villager_c', 'Reds are drying beautifully. You have a good eye for berries.']];
          if (S.questState('sign_painter') === 'open') {
            var n = 0;
            for (var i = 0; i < S.get().items.length; i++) if (S.get().items[i] === 'pulpberry') n++;
            if (n >= 3) return [
              ['say', 'villager_c', 'Three berries! Oh, you angel.'],
              ['func', function () { for (var k = 0; k < 3; k++) PB.State.removeItem('pulpberry'); }],
              ['coins', 30], ['badge', 'moneymoney'],
              ['quest', 'sign_painter', 'done', 'Sign of the Times']
            ];
            return [['say', 'villager_c', 'Three Pulp Berries. Any three. I am not fussy, I am just out of red.']];
          }
          return [
            ['say', 'villager_c', 'Every sign in town needs repainting before the festival and I have no red left.'],
            ['say', 'villager_c', 'Pulp Berries make a fine red. Bring me three and I will make it worth your while.'],
            ['quest', 'sign_painter', 'start']
          ];
        }
      },
      {
        id: 'foil', sprite: 'badgesmith_foil', x: 880, z: .62, name: 'Foil',
        script: [
          ['say', 'badgesmith_foil', 'Badges! Pin them on, get better at things. It is the closest thing to magic anyone here can afford.'],
          ['ifnotflag', 'badge_lesson', [
            ['say', 'badgesmith_foil', 'Each one costs <c:#c8443c>BP</c>. You get more BP by levelling. Open your satchel with <c:#c8443c>Esc</c> to pin them on.'],
            ['flag', 'badge_lesson', true],
            ['badge', 'timingtutor'],
            ['say', 'badgesmith_foil', 'Here — Timing Tutor, on the house. It draws the perfect window on your action commands. Training wheels, but nobody is watching.']
          ]],
          ['shop', 'quillton_badges']
        ]
      },
      {
        id: 'bard', sprite: 'bard_octavo', x: 620, z: .82, name: 'Octavo', wander: 60,
        script: [['say', 'bard_octavo', 'I am writing a ballad about a courier. It does not have an ending yet. No pressure.']]
      }
    ],
    triggers: [{
      x: 940, z: .6, w: 60, d: 1, once: true, flag: 'tr_bin_hint', needsFlag: 'ch6_done',
      script: [['say', 'narr', 'Something in the paper bin behind Foil\'s stall is breathing. It has been breathing for a while.'], ['quest', 'first_draft', 'start']]
    }]
  });

  M('quill_gate', {
    name: 'Quillton East Gate', chapter: 0, music: 'town', theme: 'town', battleBg: 'forest',
    bounds: { x0: 0, x1: 1100, z0: .15, z1: .92 },
    spawns: { default: { x: 100, z: .6 }, west: { x: 60, z: .6 }, east: { x: 1040, z: .6, face: 'left' } },
    exits: [
      { x: 8, z: .6, w: 40, d: 1, to: 'quill_square', spawn: 'east' },
      {
        x: 1082, z: .6, w: 40, d: 1, to: 'foldheim_road', spawn: 'west',
        needsFlag: 'prologue_done', lockedMsg: 'Business in the square first. The mayor is going purple.'
      }
    ],
    props: [
      { sprite: 'pillar', x: 980, z: .22 }, { sprite: 'pillar', x: 980, z: .86 },
      { sprite: 'tree_pine', x: 300, z: .18 }, { sprite: 'tree_pine', x: 560, z: .14, scale: 1.1 },
      { sprite: 'bush', x: 420, z: .88 }, { sprite: 'rock', x: 700, z: .84 },
      { sprite: 'sign', x: 900, z: .84 }
    ],
    items: [{ kind: 'coin', x: 620, z: .5, amount: 5, flag: 'qg_coin1' }],
    gizmos: [
      { kind: 'save', x: 200, z: .84 },
      { kind: 'sign', x: 900, z: .84, text: 'CREASEWOOD ROAD →\nMind the roots. Mind the leaves. Mind, generally.' }
    ],
    npcs: [
      {
        id: 'guard', sprite: 'guard_gild', x: 940, z: .68, name: 'Gate Guard',
        script: [['say', 'guard_gild', 'Road east. Woods after that. Woods have been LOUD lately.']]
      }
    ],
    triggers: [{
      x: 500, z: .6, w: 90, d: 1.2, once: true, flag: 'tr_twigby', needsFlag: 'prologue_done',
      script: [
        ['music', 'tense'],
        ['say', 'narr', 'Something small drops out of the roadside bramble and lands, badly, on its face.'],
        ['spawn', { id: 'twig', sprite: 'twigby', x: 620, z: .6, name: 'Twigby' }],
        ['sfx', 'land'],
        ['wait', 24],
        ['say', 'twigby', 'OW. Right. Yes. Hello. Are you the courier? You are the courier.'],
        ['say', 'pip', 'Depends who is asking and whether they are going to fall on me.'],
        ['say', 'twigby', 'Twigby. Creasewood scout. Official. There is a — there is a LIGHT in the woods, a big bright chunk of something, and it came down last night and now everything with teeth is walking towards it.'],
        ['say', 'pip', 'A bright chunk. About this big. Sort of… crown-shaped.'],
        ['say', 'twigby', 'YES. Wait. How—'],
        ['say', 'pip', 'Long day. Show me.'],
        ['music', 'town'],
        ['say', 'twigby', 'Right! Yes! Official Creasewood scout, reporting. I read foes, I hit things, and I do not get lost. Mostly.'],
        ['despawn', 'twig'],
        ['partner', 'twigby'],
        ['wait', 20],
        ['say', 'sys', 'Twigby joined you.\n<c:#c8443c>C</c> uses a partner\'s field ability.  In battle, his <c:#4fae62>Study</c> tells you a foe\'s stats and weak points.'],
        ['flag', 'has_partner', true],
        ['quest', 'tattle_all', 'start']
      ]
    }]
  });

  /* ======================================================================
     CHAPTER 1 — CREASEWOOD
     ====================================================================== */

  M('cw_trail', {
    name: 'Creasewood Trail', chapter: 1, music: 'forest', theme: 'forest', battleBg: 'forest',
    bounds: { x0: 0, x1: 1900, z0: .12, z1: .95 },
    spawns: { default: { x: 90, z: .6 }, west: { x: 60, z: .6 }, east: { x: 1840, z: .6, face: 'left' } },
    exits: [
      { x: 8, z: .6, w: 40, d: 1, to: 'foldheim_road', spawn: 'ch1' },
      { x: 1888, z: .6, w: 40, d: 1, to: 'cw_glade', spawn: 'west' }
    ],
    props: [
      { sprite: 'tree_pine', x: 140, z: .16 }, { sprite: 'tree_round', x: 380, z: .12 },
      { sprite: 'tree_pine', x: 640, z: .18, scale: 1.1 }, { sprite: 'tree_round', x: 980, z: .14 },
      { sprite: 'tree_pine', x: 1320, z: .16 }, { sprite: 'tree_round', x: 1680, z: .12, scale: 1.05 },
      { sprite: 'bush', x: 260, z: .9 }, { sprite: 'bush', x: 820, z: .88 }, { sprite: 'bush', x: 1500, z: .92 },
      { sprite: 'rock', x: 1120, z: .86 }
    ],
    solids: [
      { x: 760, z: .42, w: 80, d: .28, h: 48, sprite: 'crate' },
      { x: 1240, z: .5, w: 90, d: .3, h: 70 }
    ],
    items: [
      { kind: 'coin', x: 420, z: .66, amount: 3, flag: 'cw1_c1' },
      { kind: 'coin', x: 760, z: .42, y: 48, amount: 4, flag: 'cw1_c2' },
      { kind: 'chest', x: 1240, z: .5, y: 70, item: 'pulpberry', flag: 'cw1_ch1' },
      { kind: 'chest', x: 1780, z: .28, item: 'wadbomb', flag: 'cw1_ch2' }
    ],
    gizmos: [
      { kind: 'save', x: 160, z: .86 },
      { kind: 'sign', x: 300, z: .88, text: 'CREASEWOOD. Stay on the trail.\n(Someone has scratched under this: "the trail moved".)' },
      { kind: 'shop', x: 1600, z: .4, shop: 'creasewood_camp', label: 'Basket', sprite: 'crate' }
    ],
    foes: [
      { id: 'f1', type: 'snapleaf', x: 620, z: .6, patrol: 90, group: ['snapleaf'], killFlag: 'cw1_f1' },
      { id: 'f2', type: 'snapleaf', x: 1000, z: .52, patrol: 110, group: ['snapleaf', 'crumple'], killFlag: 'cw1_f2' },
      { id: 'f3', type: 'thornhopper', x: 1420, z: .64, patrol: 120, group: ['thornhopper', 'snapleaf'], killFlag: 'cw1_f3' }
    ],
    npcs: [
      {
        id: 'camper', sprite: 'villager_d', x: 1600, z: .56, name: 'Basket Keeper',
        script: [['say', 'villager_d', 'You are going deeper in? Buy something first. It makes me feel better about it.'], ['shop', 'creasewood_camp']]
      }
    ],
    triggers: [
      {
        x: 380, z: .6, w: 90, d: 1.2, once: true, flag: 'tr_ch1',
        script: [
          ['chapter', 1, 'The Thorn Marionette', 'Creasewood, and the thing pulling its strings'],
          ['say', 'twigby', 'Trail\'s this way. Stomp things by jumping on them — press <c:#c8443c>Z</c>. Swing the mallet with <c:#c8443c>X</c>.'],
          ['say', 'twigby', 'Hit a foe out here before it touches you and you get a <c:#4fae62>First Strike</c>. Let it touch you first and, well. You will find out.']
        ]
      },
      {
        x: 620, z: .6, w: 60, d: 1.2, once: true, flag: 'tr_battle_tut',
        script: [
          ['say', 'twigby', 'Snapleaf. Six HP, no defence, all attitude. In the fight, pick <c:#4fae62>Study</c> from my Abilities — it reads them out properly.'],
          ['say', 'sys', 'In battle: press <c:#c8443c>Z</c> at the right moment on every attack. A <c:#f5c02e>PERFECT</c> opens a window — tap <c:#c8443c>X</c> right after for a <c:#f07a8a>STYLISH</c> finish.'],
          ['say', 'sys', 'On defence, press <c:#c8443c>Z</c> just before a hit to <c:#57b8ea>Guard</c>. Press <c:#c8443c>X</c> even later to <c:#ffe066>Superguard</c> and take nothing at all.']
        ]
      }
    ]
  });

  M('cw_glade', {
    name: 'Sunken Glade', chapter: 1, music: 'forest', theme: 'forest', battleBg: 'forest',
    bounds: { x0: 0, x1: 1700, z0: .12, z1: .95 },
    spawns: { default: { x: 90, z: .6 }, west: { x: 60, z: .6 }, east: { x: 1640, z: .6, face: 'left' }, top: { x: 900, z: .3 } },
    exits: [
      { x: 8, z: .6, w: 40, d: 1, to: 'cw_trail', spawn: 'east' },
      { x: 1688, z: .6, w: 40, d: 1, to: 'cw_hollow', spawn: 'west' }
    ],
    props: [
      { sprite: 'tree_round', x: 200, z: .12 }, { sprite: 'tree_round', x: 700, z: .1, scale: 1.15 },
      { sprite: 'tree_pine', x: 1180, z: .14 }, { sprite: 'tree_round', x: 1560, z: .12 },
      { sprite: 'bush', x: 500, z: .9 }, { sprite: 'bush', x: 1300, z: .9 },
      { sprite: 'rock', x: 340, z: .82 }, { sprite: 'coral', x: 1450, z: .86, scale: .7 }
    ],
    solids: [
      { x: 620, z: .45, w: 90, d: .28, h: 52 },
      { x: 900, z: .45, w: 90, d: .28, h: 104, id: 'high_ledge' },
      { x: 1180, z: .45, w: 90, d: .28, h: 52 }
    ],
    pits: [{ x0: 700, x1: 830, z0: .3, z1: .6, to: { x: 660, z: .75 } }],
    items: [
      { kind: 'coin', x: 620, z: .45, y: 52, amount: 4, flag: 'cw2_c1' },
      { kind: 'chest', x: 900, z: .45, y: 104, badge: 'multibounce', flag: 'cw2_ch1' },
      { kind: 'shard', x: 1500, z: .32, flag: 'cw2_shard' },
      { kind: 'coin', x: 1000, z: .8, amount: 6, flag: 'cw2_c2' }
    ],
    gizmos: [
      {
        kind: 'soil', x: 1400, z: .48, needs: 'sprout', once: true, height: 120,
        label: 'Soil',
        script: [['say', 'twigby', 'Loose soil! Stand back — this is the one thing I am unambiguously good at.']]
      },
      { kind: 'sign', x: 200, z: .88, text: 'GLADE. The stones here were steps once.\nSomeone folded them the wrong way.' },
      { kind: 'heartblock', x: 1620, z: .84 }
    ],
    foes: [
      { id: 'g1', type: 'twigling', x: 480, z: .62, patrol: 100, group: ['twigling', 'snapleaf'], killFlag: 'cw2_f1' },
      { id: 'g2', type: 'petalwisp', x: 1080, z: .7, patrol: 130, group: ['petalwisp', 'petalwisp'], killFlag: 'cw2_f2' },
      { id: 'g3', type: 'mossback', x: 1320, z: .78, patrol: 60, group: ['mossback', 'thornhopper'], killFlag: 'cw2_f3' }
    ],
    triggers: [{
      x: 1400, z: .6, w: 70, d: 1.2, once: true, flag: 'tr_sprout',
      script: [
        ['say', 'twigby', 'Hold on. That patch of soil — I can work with that.'],
        ['say', 'sys', 'Press <c:#c8443c>C</c> near loose soil and Twigby grows a vine you can climb.']
      ]
    }]
  });

  M('cw_hollow', {
    name: 'Root Hollow', chapter: 1, music: 'forest', theme: 'cave', battleBg: 'forest', dark: false,
    bounds: { x0: 0, x1: 1500, z0: .15, z1: .92 },
    spawns: { default: { x: 90, z: .6 }, west: { x: 60, z: .6 }, east: { x: 1440, z: .6, face: 'left' } },
    exits: [
      { x: 8, z: .6, w: 40, d: 1, to: 'cw_glade', spawn: 'east' },
      {
        x: 1488, z: .6, w: 40, d: 1, to: 'cw_gate', spawn: 'west',
        needsFlag: 'cw_thistle_down', lockedMsg: 'The way on is blocked by something enormous and covered in thorns.'
      }
    ],
    props: [
      { sprite: 'rock', x: 240, z: .2 }, { sprite: 'rock', x: 620, z: .16, scale: 1.2 },
      { sprite: 'rock', x: 1100, z: .18 }, { sprite: 'bush', x: 400, z: .9 },
      { sprite: 'crate', x: 860, z: .84 }, { sprite: 'barrel', x: 910, z: .88 }
    ],
    solids: [
      { x: 500, z: .48, w: 80, d: .26, h: 46 },
      { x: 1240, z: .5, w: 100, d: .3, h: 64 }
    ],
    items: [
      { kind: 'chest', x: 500, z: .48, y: 46, item: 'emberpod', flag: 'cw3_ch1' },
      { kind: 'coin', x: 780, z: .72, amount: 5, flag: 'cw3_c1' },
      { kind: 'chest', x: 1240, z: .5, y: 64, item: 'lifeleaf', flag: 'cw3_ch2' }
    ],
    gizmos: [
      { kind: 'save', x: 150, z: .84 },
      { kind: 'sign', x: 300, z: .86, text: 'Scratched into the root: "IT ISN\'T THE PUPPET. LOOK UP."' }
    ],
    foes: [
      { id: 'h1', type: 'barkbug', x: 640, z: .6, patrol: 110, group: ['barkbug', 'twigling'], killFlag: 'cw3_f1' },
      { id: 'h2', type: 'thornhopper', x: 1000, z: .68, patrol: 90, group: ['thornhopper', 'thornhopper', 'snapleaf'], killFlag: 'cw3_f2' },
      {
        id: 'thistle', type: 'thistleguard', x: 1380, z: .6, patrol: 0, chase: false, boss: true,
        group: ['thistleguard'], killFlag: 'cw_thistle_down',
        cfg: {
          boss: true, noRun: true, music: 'boss',
          introLine: 'Thistleguard: "GATE. CLOSED. GO. AWAY."',
          introSpeaker: 'Thistleguard', introPortrait: 'thistleguard'
        },
        onWin: [
          ['say', 'twigby', 'Told you. Fire strips the thorns and then it is just a very large angry hedge.'],
          ['say', 'narr', 'The thicket gate creaks open a hand\'s width. Beyond it, the woods are much too quiet.'],
          ['give', 'reamcake'], ['shard', 1]
        ]
      }
    ],
    triggers: [{
      x: 1200, z: .6, w: 80, d: 1.2, once: true, flag: 'tr_thistle',
      script: [
        ['music', 'tense'],
        ['say', 'twigby', 'That is Thistleguard. That is a LOT of thorns. Do NOT stomp it — use the mallet, or burn the thorns off first.'],
        ['say', 'pip', 'Noted. Everything about that is noted.']
      ]
    }]
  });

  M('cw_gate', {
    name: 'The Thicket Gate', chapter: 1, music: 'forest', theme: 'forest', battleBg: 'forest',
    bounds: { x0: 0, x1: 1400, z0: .14, z1: .92 },
    spawns: { default: { x: 90, z: .6 }, west: { x: 60, z: .6 }, east: { x: 1340, z: .6, face: 'left' } },
    exits: [
      { x: 8, z: .6, w: 40, d: 1, to: 'cw_hollow', spawn: 'east' },
      {
        x: 1388, z: .6, w: 40, d: 1, to: 'cw_heart', spawn: 'west',
        needsKey: 'crease_key', lockedMsg: 'The gate is stitched shut with a knot the size of your head. There must be a key.'
      }
    ],
    props: [
      { sprite: 'tree_pine', x: 180, z: .14 }, { sprite: 'tree_pine', x: 420, z: .12, scale: 1.2 },
      { sprite: 'tree_round', x: 900, z: .1 }, { sprite: 'pillar', x: 1290, z: .22 }, { sprite: 'pillar', x: 1290, z: .88 },
      { sprite: 'bush', x: 640, z: .9 }, { sprite: 'rock', x: 1080, z: .86 }
    ],
    solids: [
      { x: 700, z: .42, w: 80, d: .26, h: 58 },
      { x: 1000, z: .38, w: 80, d: .26, h: 116, id: 'gate_ledge' }
    ],
    items: [
      { kind: 'chest', x: 1000, z: .38, y: 116, key: 'crease_key', flag: 'cw4_key' },
      { kind: 'coin', x: 560, z: .74, amount: 8, flag: 'cw4_c1' }
    ],
    gizmos: [
      {
        kind: 'soil', x: 860, z: .4, needs: 'sprout', once: true, height: 124,
        script: [['say', 'twigby', 'Up we go. The key is on that ledge — I can see the shine from here.']]
      },
      { kind: 'save', x: 150, z: .84 },
      { kind: 'sign', x: 1200, z: .86, text: 'CREASEWOOD HEART — CLOSED\nBy order of nobody in particular. The knot did it itself.' }
    ],
    foes: [
      { id: 'gt1', type: 'petalwisp', x: 520, z: .56, patrol: 120, group: ['petalwisp', 'twigling', 'snapleaf'], killFlag: 'cw4_f1' },
      { id: 'gt2', type: 'mossback', x: 1120, z: .66, patrol: 80, group: ['mossback', 'barkbug'], killFlag: 'cw4_f2' }
    ],
    npcs: [{
      id: 'courier_ghost', sprite: 'courier_nib', x: 300, z: .66, name: '?',
      script: function () {
        var S = PB.State;
        if (S.questState('missing_courier') === 'done') return [['say', 'courier_nib', 'Tell Quillton I am fine. Tell them slowly, they worry.']];
        return [
          ['say', 'courier_nib', 'Another courier. Of course. They always send another courier.'],
          ['say', 'pip', 'You are the one who went missing on this road.'],
          ['say', 'courier_nib', 'I did not go missing. I went QUIET. There is a difference and it kept me alive.'],
          ['say', 'courier_nib', 'The thing in the heart of the wood is not the puppet. Look at the strings. Follow them up.'],
          ['quest', 'missing_courier', 'done', 'Return to Sender'],
          ['shard', 1]
        ];
      }
    }]
  });

  /* ======================================================================
     THE FOLDHEIM ROAD — the hub every chapter branches off
     ====================================================================== */
  (function () {
    var BRANCH = [
      { ch: 1, x: 420, to: 'cw_trail', name: 'Creasewood', flag: null },
      { ch: 2, x: 880, to: 'em_gate', name: 'Emberfold', flag: 'ch1_done' },
      { ch: 3, x: 1340, to: 'sg_docks', name: 'Sogport', flag: 'ch2_done' },
      { ch: 4, x: 1800, to: 'cc_gates', name: 'Cardstock Carnival', flag: 'ch3_done' },
      { ch: 5, x: 2260, to: 'gh_steps', name: 'Glyphhaven', flag: 'ch4_done' },
      { ch: 6, x: 2720, to: 'ff_pass', name: 'Frostfold', flag: 'ch5_done' },
      { ch: 7, x: 3180, to: 'fw_gate', name: 'Foilworks', flag: 'ch6_done' },
      { ch: 8, x: 3640, to: 'sc_bridge', name: 'Smudge Citadel', flag: 'ch7_done' }
    ];
    var spawns = { default: { x: 100, z: .6 }, west: { x: 70, z: .6 }, east: { x: 4050, z: .6, face: 'left' } };
    var exits = [{ x: 8, z: .6, w: 40, d: 1, to: 'quill_gate', spawn: 'east' }];
    var props = [], gizmos = [], npcs = [];
    BRANCH.forEach(function (b) {
      spawns['ch' + b.ch] = { x: b.x, z: .62 };
      exits.push({
        x: b.x, z: .18, w: 70, d: .3, door: true, to: b.to, spawn: 'west',
        needsFlag: b.flag, lockedMsg: 'That road is not yours yet. One seal at a time.'
      });
      props.push({ sprite: 'pillar', x: b.x - 52, z: .1, scale: .7 });
      props.push({ sprite: 'pillar', x: b.x + 52, z: .1, scale: .7 });
      gizmos.push({
        kind: 'sign', x: b.x, z: .8,
        text: 'CHAPTER ' + b.ch + ' — ' + b.name.toUpperCase() + '\nThe path north. ' +
          (b.flag ? 'Sealed until the road behind you is finished.' : 'Open.')
      });
    });
    props.push({ sprite: 'tree_round', x: 200, z: .06 }, { sprite: 'tree_pine', x: 1100, z: .05 },
      { sprite: 'rock', x: 1600, z: .88 }, { sprite: 'tree_round', x: 2500, z: .06 },
      { sprite: 'icechunk', x: 2900, z: .86 }, { sprite: 'gear', x: 3300, z: .86 },
      { sprite: 'inkpool', x: 3800, z: .84 }, { sprite: 'lamp', x: 640, z: .86 },
      { sprite: 'lamp', x: 2040, z: .86 }, { sprite: 'lamp', x: 3420, z: .86 });
    gizmos.push({ kind: 'save', x: 160, z: .84 }, { kind: 'heartblock', x: 240, z: .84 });
    gizmos.push({ kind: 'save', x: 2040, z: .84 }, { kind: 'heartblock', x: 2120, z: .84 });
    gizmos.push({
      kind: 'sign', x: 3960, z: .8,
      text: 'THE FOLDED COLISEUM →\nTwenty ranks. No refunds. No mercy. Excellent seating.'
    });
    exits.push({
      x: 4090, z: .6, w: 40, d: 1, to: 'cl_lobby', spawn: 'west',
      needsFlag: 'ch3_done', lockedMsg: 'The Coliseum opens to fighters with at least three seals to their name.'
    });
    npcs.push({
      id: 'road_nib', sprite: 'courier_nib', x: 1000, z: .7, name: 'Nib',
      script: function () {
        var c = PB.State.get().chapter;
        var lines = [
          'Nib. Courier, same as you. Different employer, sadly.',
          'The Duke keeps a list. You are on it now. Congratulations, I suppose.',
          'Sogport is drowning and nobody there will say the word "flood".',
          'The Carnival is still running shows. That is the frightening part.',
          'Glyphhaven has stopped lending books. Glyphhaven has never stopped lending books.',
          'Frostfold has gone quiet under the snow. That is normal. The quiet is not.',
          'They are building something in the Foilworks. Big. Loud. Numbered.',
          'The Citadel is not a building, Pip. It is a full stop.'
        ];
        return [['say', 'courier_nib', lines[PB.U.clamp(c - 1, 0, lines.length - 1)]]];
      }
    });
    M('foldheim_road', {
      name: 'The Foldheim Road', chapter: 1, music: 'town', theme: 'town', battleBg: 'forest',
      bounds: { x0: 0, x1: 4100, z0: .14, z1: .92 },
      spawns: spawns, exits: exits, props: props, gizmos: gizmos, npcs: npcs,
      items: [
        { kind: 'coin', x: 700, z: .5, amount: 5, flag: 'fr_c1' },
        { kind: 'coin', x: 2400, z: .5, amount: 10, flag: 'fr_c2' },
        { kind: 'chest', x: 3000, z: .3, item: 'grandfeast', flag: 'fr_ch1' }
      ],
      foes: [
        { id: 'rd1', type: 'crumple', x: 1500, z: .62, patrol: 120, group: ['crumple', 'crumple'], killFlag: 'fr_f1' },
        { id: 'rd2', type: 'wadball', x: 2600, z: .6, patrol: 140, group: ['wadball', 'crumple'], killFlag: 'fr_f2' }
      ]
    });
  })();

  M('cw_heart', {
    name: 'Heart of Creasewood', chapter: 1, music: 'tense', theme: 'forest', battleBg: 'forest',
    bounds: { x0: 0, x1: 1200, z0: .2, z1: .9 },
    spawns: { default: { x: 90, z: .6 }, west: { x: 60, z: .6 } },
    exits: [{ x: 8, z: .6, w: 40, d: 1, to: 'cw_gate', spawn: 'east' }],
    props: [
      { sprite: 'tree_round', x: 240, z: .1, scale: 1.3 }, { sprite: 'tree_round', x: 960, z: .1, scale: 1.3 },
      { sprite: 'tree_pine', x: 600, z: .08, scale: 1.5 },
      { sprite: 'rock', x: 380, z: .84 }, { sprite: 'rock', x: 820, z: .86 }
    ],
    gizmos: [{ kind: 'save', x: 140, z: .82 }, { kind: 'heartblock', x: 240, z: .82 }],
    triggers: [{
      x: 620, z: .6, w: 100, d: 1.4, once: true, flag: 'tr_bramble',
      script: [
        ['camera', 800, 50],
        ['say', 'narr', 'The clearing is full of strings. They come down out of the canopy and end, all of them, in one thing.'],
        ['spawn', { id: 'bj', sprite: 'bramblejack', x: 880, z: .55, name: 'Bramblejack', face: 'left' }],
        ['sfx', 'roar'], ['shake', 16],
        ['sayx', 'Bramblejack', 'bramblejack', 'MINE. THE BRIGHT THING IS MINE. I FOUND IT AND IT MADE ME <s>REAL</s>.', 'boss'],
        ['say', 'twigby', 'Pip — the seal. It has the seal, it has it INSIDE it—'],
        ['say', 'pip', 'Bramblejack. Who tied the strings?'],
        ['sayx', 'Bramblejack', 'bramblejack', '...WHAT?', 'boss'],
        ['say', 'pip', 'Someone is holding the other end. You know that. You have always known that.'],
        ['sayx', 'Bramblejack', 'bramblejack', 'NO ONE HOLDS ME. I DANCE BECAUSE I <s>WANT</s> TO.', 'boss'],
        ['say', 'narr', 'High above, in the dark of the canopy, something adjusts its grip.'],
        ['music', 'boss'],
        ['battle', {
          enemies: ['bramblejack'], boss: true, noRun: true, bg: 'forest', music: 'boss'
        }, [
          ['despawn', 'bj'],
          ['music', 'sad'],
          ['say', 'narr', 'The strings go slack. Bramblejack folds down into the leaf litter, one crease at a time, until there is only a shape.'],
          ['sayx', 'Bramblejack', 'bramblejack', 'i... was going to be... a real thing...', 'boss'],
          ['say', 'pip', 'You were. Somebody just did not let you finish.'],
          ['wait', 40],
          ['sfx', 'seal'],
          ['title', 'SEAL I RECOVERED', 110],
          ['givekey', 'seal1'],
          ['seal', 'seal_refold'],
          ['say', 'sys', 'Seal Power learned: <c:#f5c02e>Refold</c> — restores 10 HP to you and your partner.\nSeal Energy fills as you fight; <c:#4fae62>Appeal</c> in Tactics tops it up.'],
          ['music', 'forest'],
          ['say', 'twigby', 'One down. Six to go, and six is not that many. Six is basically nothing.'],
          ['say', 'pip', 'Six is six, Twigby.'],
          ['say', 'twigby', 'Six is basically nothing, Pip.'],
          ['wait', 20],
          ['say', 'narr', 'A single thread of the marionette\'s string is still taut. It runs east, out of the wood, towards a red smudge on the horizon that might be sunset and is not.'],
          ['flag', 'ch1_done', true],
          ['chapterset', 2],
          ['rankup', 'twigby'],
          ['form', 'form_fortress'],
          ['say', 'sys', 'New Origami Form: <c:#57b8ea>Fortress</c>. Twigby reached Rank 2 and learned <c:#4fae62>Thornshot</c>.'],
          ['heal'],
          ['goto', 'foldheim_road', 'ch1'],
          ['say', 'twigby', 'Emberfold, then. East and down. Bring something to drink.']
        ]]
      ]
    }]
  });
})();
