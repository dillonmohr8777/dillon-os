/* ==========================================================================
   PAPERBOUND — 24_maps_ch45.js
   CHAPTER 4 — The Cardstock Carnival     CHAPTER 5 — Glyphhaven
   ========================================================================== */
'use strict';

(function () {
  var K = PB.MapKit, Shop = PB.Menus.defineShop, St = PB.State;

  /* ======================================================================
     CHAPTER 4 — THE CARDSTOCK CARNIVAL
     ====================================================================== */
  Shop('carnival_stall', {
    name: 'The Sideshow Pantry', keeper: 'barker_tilt',
    greeting: 'Step up! Everything is fresh, everything is fairly priced, and one of those is true.',
    stock: ['reamcake', 'inktea', 'creambun', 'tonicwash', 'papercutstar', 'crowdcandy', 'sleepysheet', 'boldbrew']
  });

  K.chain(
    { chapter: 4, music: 'carnival', theme: 'carnival', battleBg: 'carnival', entryWest: { to: 'foldheim_road', spawn: 'ch4' } },
    [
      {
        id: 'cc_gates', name: 'Carnival Gates', w: 1400,
        props: [{ sprite: 'tent', x: 1180, z: .14, scale: 1.1 }, { sprite: 'banner', x: 300, z: .16 },
          { sprite: 'banner', x: 520, z: .16 }, { sprite: 'lamp', x: 220, z: .86 }, { sprite: 'lamp', x: 900, z: .86 }],
        gizmos: K.rest(140).concat([
          { kind: 'sign', x: 460, z: .86, text: 'THE CARDSTOCK CARNIVAL\nCONTINUOUS PERFORMANCE SINCE — the number has been scratched out and rewritten four times.' }
        ]),
        items: [{ kind: 'coin', x: 760, z: .5, amount: 8, flag: 'cc1_c1' }],
        foes: [{ id: 'cc1a', type: 'clipling', x: 980, z: .62, patrol: 100, group: ['clipling', 'confettoid'], killFlag: 'cc1_f1' }],
        triggers: [{
          x: 320, z: .6, w: 100, d: 1.4, once: true, flag: 'tr_ch4',
          script: [
            ['chapter', 4, 'The Show Must Not Go On', 'Cardstock, where nobody has been allowed to stop'],
            ['say', 'narr', 'Music. Applause. Both of them slightly too loud and neither of them stopping.'],
            ['say', 'twigby', 'How long has that applause been going?'],
            ['say', 'lumen', 'Listen to it properly.'],
            ['say', 'twigby', '...It is a loop. It is the same nine seconds.'],
            ['say', 'pip', 'Right. Let us go and find out who is holding the needle down.']
          ]
        }]
      },
      {
        id: 'cc_midway', name: 'The Midway', w: 2000, theme: 'carnival',
        props: [{ sprite: 'tent', x: 400, z: .1 }, { sprite: 'tent', x: 1600, z: .1, scale: .9 },
          { sprite: 'shop_stall', x: 780, z: .2 }, { sprite: 'banner', x: 1100, z: .14 },
          { sprite: 'crate', x: 1320, z: .86 }, { sprite: 'barrel', x: 1380, z: .9 },
          { sprite: 'lamp', x: 240, z: .86 }, { sprite: 'lamp', x: 1800, z: .86 }],
        gizmos: K.rest(180).concat([
          { kind: 'shop', x: 780, z: .44, shop: 'carnival_stall', label: 'Shop', sprite: 'shop_stall', scale: .8 },
          { kind: 'cook', x: 1120, z: .58, label: 'Cook', sprite: 'barrel' },
          { kind: 'sign', x: 420, z: .88, text: 'ATTRACTIONS: The Funhouse. The Rigging. The Big Top.\nEXITS: see management.' }
        ]),
        items: [{ kind: 'coin', x: 1000, z: .78, amount: 10, flag: 'cc2_c1' }, { kind: 'chest', x: 1940, z: .3, item: 'grandfeast', flag: 'cc2_ch1' }],
        npcs: [
          {
            id: 'tilt', sprite: 'barker_tilt', x: 780, z: .6, name: 'Tilt',
            script: [
              ['say', 'barker_tilt', 'Step up, step — sorry. Force of habit. I have been saying that for eleven years.'],
              ['say', 'barker_tilt', 'The Great Kerf does not let the show stop. Not for weather, not for sleep, not for the two lads who fell out of the rigging in year six.'],
              ['say', 'pip', 'Why does nobody leave?'],
              ['say', 'barker_tilt', 'Because he is watching from the ring and the applause never stops, and after a while you cannot tell whether you are performing or just standing very still.'],
              ['shop', 'carnival_stall']
            ]
          },
          {
            id: 'cc_child', sprite: 'kid_dot', x: 1240, z: .8, name: 'Pinny',
            script: function () {
              if (St.questState('lost_ticket') === 'done') return [['say', 'kid_dot', 'I saw the show. It was TERRIBLE. It was the best thing that has ever happened to me.']];
              if (St.questState('lost_ticket') === 'open' && St.hasKey('carnival_ticket')) return [
                ['say', 'kid_dot', 'THAT IS IT. That is MY ticket. It has my thumb on it and everything.'],
                ['takekey', 'carnival_ticket'],
                ['badge', 'crowdpleaser'],
                ['quest', 'lost_ticket', 'done', 'One Ticket, Please'],
                ['say', 'kid_dot', 'Here. Dad found this pinned to a tent and said it was rubbish. It is not rubbish, it is a BADGE.']
              ];
              return [
                ['say', 'kid_dot', 'I dropped my ticket in the funhouse and now they will not let me in and I have been waiting outside for THREE DAYS.'],
                ['say', 'twigby', 'Three days?'],
                ['say', 'kid_dot', 'It is a very good show. Probably.'],
                ['quest', 'lost_ticket', 'start']
              ];
            }
          },
          { id: 'cc_juggler', sprite: 'villager_b', x: 1420, z: .68, name: 'Juggler Fen', script: [['say', 'villager_b', 'Eleven years. I have dropped nothing in eleven years. Ask me what my hands feel like. Go on.']] },
          { id: 'cc_chef', sprite: 'chef_pulp', x: 1120, z: .7, name: 'Fryer Batter', script: [['say', 'chef_pulp', 'I fry things. In a tent. Next to acrobats. Nobody has ever explained the insurance.'], ['cook']] },
          { id: 'cc_stilts', sprite: 'villager_c', x: 1700, z: .72, name: 'Stilts Marla', script: [['say', 'villager_c', 'Backstage is through the rigging. Kerf does not go back there. Kerf does not like anywhere the audience cannot see him.']] }
        ],
        foes: [{ id: 'cc2a', type: 'confettoid', x: 1500, z: .64, patrol: 110, group: ['confettoid', 'clipling', 'juggloon'], killFlag: 'cc2_f1' }]
      },
      {
        id: 'cc_funhouse', name: 'The Funhouse', w: 1900, theme: 'interior', music: 'carnival',
        props: K.scatter(['pillar', 'crate', 'barrel'], 7, 1900),
        solids: [
          { x: 500, z: .42, w: 90, d: .28, h: 58 },
          { x: 780, z: .42, w: 90, d: .28, h: 116 },
          { x: 1060, z: .42, w: 90, d: .28, h: 58 },
          { x: 1360, z: .5, w: 140, d: .36, h: 0, id: 'cc_hidden', hidden: true }
        ],
        pits: [{ x0: 580, x1: 700, z0: .28, z1: .56, to: { x: 460, z: .78 } },
          { x0: 860, x1: 980, z0: .28, z1: .56, to: { x: 460, z: .78 } }],
        items: [
          { kind: 'chest', x: 780, z: .42, y: 116, key: 'carnival_ticket', flag: 'cc3_ticket' },
          { kind: 'chest', x: 1840, z: .32, badge: 'quickchange', flag: 'cc3_ch1' },
          { kind: 'coin', x: 1200, z: .78, amount: 12, flag: 'cc3_c1' }
        ],
        gizmos: [
          { kind: 'save', x: 150, z: .84 },
          {
            kind: 'crack', x: 1240, z: .6, once: false, label: 'Slip through',
            to: { x: 1440, z: .6 },
            script: []
          },
          { kind: 'sign', x: 280, z: .88, text: 'THE FUNHOUSE.\nManagement accepts no responsibility for the mirrors, the floor, or your sense of self.' }
        ],
        foes: [
          { id: 'cc3a', type: 'papercut', x: 640, z: .7, patrol: 130, group: ['papercut', 'clipling'], killFlag: 'cc3_f1' },
          { id: 'cc3b', type: 'stiltjack', x: 1500, z: .62, patrol: 100, group: ['stiltjack', 'confettoid', 'papercut'], killFlag: 'cc3_f2' }
        ]
      },
      {
        id: 'cc_backstage', name: 'Backstage', w: 1700, theme: 'interior', music: 'carnival',
        props: K.scatter(['crate', 'barrel', 'pillar'], 8, 1700),
        solids: [{ x: 900, z: .44, w: 100, d: .3, h: 62 }, { x: 1300, z: .5, w: 130, d: .34, h: 0, id: 'cc_roped', hidden: true }],
        items: [
          { kind: 'chest', x: 900, z: .44, y: 62, item: 'mirrorfoil', flag: 'cc4_ch1' },
          { kind: 'shard', x: 1560, z: .8, flag: 'cc4_shard' }
        ],
        gizmos: [
          { kind: 'save', x: 150, z: .84 },
          {
            kind: 'seam', x: 1180, z: .5, needs: 'cut', once: true, reveals: 'cc_roped',
            label: 'Cut the rope',
            script: [['say', 'snip', 'Eleven years of knots. Watch this.'], ['sfx', 'fold'], ['say', 'narr', 'The rope parts. A whole gantry swings down and becomes a floor.']]
          }
        ],
        foes: [{ id: 'cc4a', type: 'clipling', x: 700, z: .66, patrol: 90, group: ['clipling', 'clipling', 'juggloon'], killFlag: 'cc4_f1' }],
        triggers: [{
          x: 340, z: .6, w: 100, d: 1.4, once: true, flag: 'tr_snip',
          script: [
            ['say', 'narr', 'Backstage is dark and full of props and one performer, sitting on a crate, sharpening something.'],
            ['spawn', { id: 'snp', sprite: 'snip', x: 540, z: .6, name: 'Snip', face: 'left' }],
            ['wait', 26],
            ['say', 'snip', 'Audience is that way. Unless you are here to fire me, in which case: already done, join the queue.'],
            ['say', 'pip', 'What did you do?'],
            ['say', 'snip', 'I was better than him. In front of nine hundred people. During a MATINEE.'],
            ['say', 'twigby', 'That is not really a firing offence.'],
            ['say', 'snip', 'It is the only firing offence he has. Everything else he forgives instantly, because everything else keeps the show running.'],
            ['say', 'pip', 'He has a piece of something that belongs to a crown. I am collecting it.'],
            ['say', 'snip', 'The bright thing in the ring lights. He nailed it to the gantry so it catches him from below.'],
            ['say', 'snip', 'He fired me for being BETTER than him. In front of nine hundred people. So — where are we going and who am I cutting?'],
            ['despawn', 'snp'],
            ['partner', 'snip'],
            ['wait', 20],
            ['say', 'sys', 'Snip joined you.\n<c:#c8443c>C</c> cuts taped seams, ropes and stitched barriers.\nIn battle, <c:#f07a8a>Snip Snip</c> halves a foe\'s Defence for the turn.']
          ]
        }]
      },
      {
        id: 'cc_rigging', name: 'The Rigging', w: 1800, theme: 'interior', music: 'carnival',
        eastLock: { needsKey: 'bigtop_ticket', lockedMsg: 'The Big Top door wants a ticket. A real one, stamped, from the box office nobody staffs.' },
        props: K.scatter(['pillar', 'banner'], 6, 1800),
        solids: [
          { x: 480, z: .4, w: 90, d: .26, h: 70 },
          { x: 760, z: .4, w: 90, d: .26, h: 140 },
          { x: 1040, z: .4, w: 90, d: .26, h: 210 },
          { x: 1320, z: .4, w: 90, d: .26, h: 140 }
        ],
        pits: [{ x0: 560, x1: 680, z0: .26, z1: .54, to: { x: 400, z: .8 } },
          { x0: 840, x1: 960, z0: .26, z1: .54, to: { x: 400, z: .8 } },
          { x0: 1120, x1: 1240, z0: .26, z1: .54, to: { x: 400, z: .8 } }],
        items: [
          { kind: 'chest', x: 1040, z: .4, y: 210, key: 'bigtop_ticket', flag: 'cc5_ticket' },
          { kind: 'coin', x: 760, z: .4, y: 140, amount: 14, flag: 'cc5_c1' }
        ],
        gizmos: [{ kind: 'save', x: 150, z: .84 },
          { kind: 'sign', x: 280, z: .88, text: 'RIGGING. No safety net.\nThere was a safety net. It is in the funhouse now, being a floor.' }],
        foes: [
          { id: 'cc5a', type: 'trapezoid', x: 900, z: .72, patrol: 140, group: ['trapezoid', 'juggloon'], killFlag: 'cc5_f1' },
          {
            id: 'cc5boss', type: 'trimmet', x: 1620, z: .6, patrol: 0, chase: false, boss: true,
            group: ['trimmet'], killFlag: 'cc_trimmet_down',
            cfg: {
              boss: true, noRun: true, music: 'boss',
              introLine: 'Trimmet: "I have understudied him for nine years. I know every single thing he does. Including this."',
              introSpeaker: 'Trimmet', introPortrait: 'trimmet'
            },
            onWin: [
              ['say', 'snip', 'Trimmet. He was going to give you my slot, you know.'],
              ['sayx', 'Trimmet', 'trimmet', 'He was never going to give me anything. I have known that for nine years and I turned up anyway.', 'boss'],
              ['say', 'snip', 'Come backstage after. There is a crate and I will sharpen something and you can be furious out loud.'],
              ['give', 'swiftdraft']
            ]
          }
        ]
      },
      {
        id: 'cc_bigtop', name: 'The Big Top', w: 1600, theme: 'carnival',
        props: [{ sprite: 'tent', x: 300, z: .1, scale: 1.3 }, { sprite: 'banner', x: 700, z: .12 },
          { sprite: 'banner', x: 1000, z: .12 }, { sprite: 'lamp', x: 400, z: .88 }, { sprite: 'lamp', x: 1200, z: .88 }],
        solids: [{ x: 800, z: .44, w: 110, d: .3, h: 66 }],
        items: [{ kind: 'chest', x: 800, z: .44, y: 66, badge: 'creasecutter', flag: 'cc6_ch1' },
          { kind: 'coin', x: 1200, z: .76, amount: 15, flag: 'cc6_c1' }],
        gizmos: K.rest(160).concat([
          {
            kind: 'seam', x: 1100, z: .8, needs: 'cut', once: true,
            label: 'Cut the banner',
            script: [['give', 'lastpage'], ['say', 'snip', 'Somebody sewed a Last Page into the lining of a banner. Performers hide everything in banners.']]
          }
        ]),
        foes: [{ id: 'cc6a', type: 'stiltjack', x: 1000, z: .64, patrol: 110, group: ['stiltjack', 'trapezoid', 'papercut'], killFlag: 'cc6_f1' }]
      },
      {
        id: 'cc_ring', name: 'The Centre Ring', w: 1300, theme: 'carnival', music: 'tense',
        props: [{ sprite: 'banner', x: 240, z: .12 }, { sprite: 'banner', x: 1060, z: .12 },
          { sprite: 'lamp', x: 340, z: .88 }, { sprite: 'lamp', x: 960, z: .88 }],
        gizmos: K.rest(150),
        triggers: [PB.MapKit.bossTrigger({
          x: 620, flag: 'tr_kerf', entId: 'kerf', sprite: 'great_kerf',
          name: 'The Great Kerf', enemy: 'great_kerf', bg: 'carnival',
          before: [['say', 'narr', 'The ring is empty except for the applause, which is coming from a rack of nine hundred paper hands on a crank.']],
          lines: [
            ['sayx', 'The Great Kerf', 'great_kerf', 'LADIES. GENTLEFOLD. A COURIER.', 'boss'],
            ['say', 'pip', 'There is nobody here.'],
            ['sayx', 'The Great Kerf', 'great_kerf', 'There is ALWAYS somebody here.', 'boss'],
            ['say', 'snip', 'It is a crank, Kerf. It has been a crank for six years. You turned the last real audience into staff.'],
            ['sayx', 'The Great Kerf', 'great_kerf', '...Snip. You came BACK.', 'boss'],
            ['say', 'snip', 'To cut you down. Professionally.'],
            ['sayx', 'The Great Kerf', 'great_kerf', 'Do you know what happens to me when the applause stops, girl? I stop. That is not a metaphor. I have tested it.', 'boss'],
            ['sayx', 'The Great Kerf', 'great_kerf', 'So the show does not stop. Not for weather. Not for sleep. Not for the two lads in year six. And not for YOU.', 'boss'],
            ['say', 'pip', 'Then let us give them something worth clapping at.']
          ],
          after: [
            ['music', 'sad'],
            ['say', 'narr', 'The crank winds down. Nine hundred paper hands go still, and for the first time in eleven years the Cardstock Carnival is quiet.'],
            ['sayx', 'The Great Kerf', 'great_kerf', '...oh. Oh, that is what quiet is.', 'boss'],
            ['say', 'snip', 'It is not that bad.'],
            ['sayx', 'The Great Kerf', 'great_kerf', 'It is TERRIBLE. It is — it is enormous. How does anyone sit in this.', 'boss'],
            ['say', 'snip', 'You practise. Come on. Everyone is outside and nobody is performing and it is very strange and you should see it.'],
            ['wait', 30],
            ['sfx', 'seal'],
            ['title', 'SEAL IV RECOVERED', 110],
            ['givekey', 'seal4'],
            ['seal', 'seal_kerf'],
            ['givekey', 'coliseum_pass'],
            ['flag', 'form_slip', true],
            ['say', 'sys', 'Seal Power learned: <c:#cfd6de>Kerfstrike</c> — 10 damage that no defence can blunt.\nNew fold: <c:#f7edd6>Slip</c>. Press <c:#c8443c>V</c> at a crack to turn edge-on and pass through.\nAlso: a Coliseum Pass. The Folded Coliseum is off the Foldheim Road, at the far east end.'],
            ['flag', 'ch4_done', true],
            ['chapterset', 5],
            ['heal'],
            ['goto', 'foldheim_road', 'ch4']
          ]
        })]
      }
    ]
  );

  /* ======================================================================
     CHAPTER 5 — GLYPHHAVEN
     ====================================================================== */
  Shop('glyphhaven_desk', {
    name: 'The Lending Desk', keeper: 'scholar_ibis', markup: 1.1,
    greeting: 'We are not lending books. We are, apparently, still selling snacks. Do not ask me to justify it.',
    stock: ['creambun', 'deeproot', 'tonicwash', 'inkbomb', 'sealwater', 'focusink', 'ironsheet', 'shreddisc']
  });

  K.chain(
    { chapter: 5, music: 'library', theme: 'library', battleBg: 'library', entryWest: { to: 'foldheim_road', spawn: 'ch5' } },
    [
      {
        id: 'gh_steps', name: 'The Glyphhaven Steps', w: 1400,
        props: [{ sprite: 'pillar', x: 300, z: .14 }, { sprite: 'pillar', x: 700, z: .14 }, { sprite: 'pillar', x: 1100, z: .14 },
          { sprite: 'bookshelf', x: 1300, z: .12 }, { sprite: 'lamp', x: 200, z: .86 }],
        gizmos: K.rest(140).concat([
          { kind: 'sign', x: 480, z: .86, text: 'GLYPHHAVEN. Founded so that nothing true would ever be lost.\nA newer notice below: NO LENDING. NO READING. NO EXCEPTIONS.' }
        ]),
        items: [{ kind: 'coin', x: 900, z: .5, amount: 10, flag: 'gh1_c1' }],
        foes: [{ id: 'gh1a', type: 'footnote', x: 1000, z: .66, patrol: 100, group: ['footnote', 'footnote'], killFlag: 'gh1_f1' }],
        triggers: [{
          x: 320, z: .6, w: 100, d: 1.4, once: true, flag: 'tr_ch5',
          script: [
            ['chapter', 5, 'Nothing Should Be Read', 'Glyphhaven, and what it stopped lending'],
            ['say', 'narr', 'A library the size of a city, and every window dark.'],
            ['say', 'lumen', 'Four hundred years I wanted somewhere with a view and something to read. And here it is. And it has been closed.'],
            ['say', 'pip', 'Then we will open it.']
          ]
        }]
      },
      {
        id: 'gh_atrium', name: 'The Atrium', w: 1900, theme: 'library',
        props: [{ sprite: 'bookshelf', x: 300, z: .12 }, { sprite: 'bookshelf', x: 560, z: .12 },
          { sprite: 'bookshelf', x: 1520, z: .12 }, { sprite: 'bookshelf', x: 1780, z: .12 },
          { sprite: 'pillar', x: 900, z: .16 }, { sprite: 'pillar', x: 1200, z: .16 },
          { sprite: 'lamp', x: 700, z: .86 }, { sprite: 'lamp', x: 1400, z: .86 }],
        gizmos: K.rest(180).concat([
          { kind: 'shop', x: 800, z: .44, shop: 'glyphhaven_desk', label: 'Desk', sprite: 'shop_stall', scale: .75 },
          { kind: 'cook', x: 1120, z: .58, label: 'Cook', sprite: 'barrel' },
          { kind: 'sign', x: 440, z: .88, text: 'READING ROOM — CLOSED\nSTACKS — CLOSED\nRESTRICTED — CLOSED (was already closed)' }
        ]),
        items: [{ kind: 'chest', x: 1860, z: .3, item: 'sealwater', flag: 'gh2_ch1' }],
        npcs: [
          {
            id: 'marge', sprite: 'archivist_marge', x: 700, z: .68, name: 'Archivist Marge',
            script: function () {
              var have = 0, ids = ['gh_book1', 'gh_book2', 'gh_book3', 'gh_book4'];
              for (var i = 0; i < ids.length; i++) if (St.hasFlag(ids[i])) have++;
              if (St.questState('overdue_books') === 'done') return [['say', 'archivist_marge', 'Four books back on four shelves. It is not much against a city of them, but it is four.']];
              if (St.questState('overdue_books') === 'open' && have >= 4) return [
                ['say', 'archivist_marge', 'All four. All four, and one of them a hundred and six years out.'],
                ['badge', 'deepfocus'],
                ['quest', 'overdue_books', 'done', 'Extremely Overdue'],
                ['say', 'archivist_marge', 'Take Deep Focus. It was pinned inside the back cover of the worst offender.']
              ];
              if (St.questState('overdue_books') === 'open') return [
                ['say', 'archivist_marge', 'Four books, four shelves. You have ' + have + '.'],
                ['say', 'archivist_marge', 'They are in the stacks, and the stacks are dark, and something in there has started editing.']
              ];
              return [
                ['say', 'archivist_marge', 'Four volumes never came back. That is four out of nine million, and it is the four I think about.'],
                ['say', 'archivist_marge', 'If you are going into the stacks anyway. Which you are. Everyone is, lately, and none of them come out with books.'],
                ['quest', 'overdue_books', 'start']
              ];
            }
          },
          {
            id: 'ibis', sprite: 'scholar_ibis', x: 800, z: .6, name: 'Scholar Ibis',
            script: [
              ['say', 'scholar_ibis', 'It arrived with the bright fragment. It took one look at nine million books and made a decision.'],
              ['say', 'pip', 'What decision?'],
              ['say', 'scholar_ibis', 'That anything which can be misread should not be readable. It is working through the collection alphabetically. It is on C.'],
              ['shop', 'glyphhaven_desk']
            ]
          },
          { id: 'gh_page', sprite: 'kid_dash', x: 1300, z: .82, name: 'Page Quire', wander: 50, script: [['say', 'kid_dash', 'I shelved a book yesterday and this morning the shelf was blank. Not empty. BLANK.']] },
          { id: 'gh_chef', sprite: 'chef_pulp', x: 1120, z: .7, name: 'Refectory Sift', script: [['say', 'chef_pulp', 'Nine million books and one kitchen. Guess which one gets the budget.'], ['cook']] }
        ],
        foes: [{ id: 'gh2a', type: 'glyphling', x: 1500, z: .64, patrol: 100, group: ['glyphling', 'footnote', 'footnote'], killFlag: 'gh2_f1' }]
      },
      {
        id: 'gh_stacks', name: 'The Stacks', w: 2000, theme: 'library', dark: true,
        props: K.scatter(['bookshelf'], 8, 2000),
        solids: [
          { x: 620, z: .42, w: 100, d: .3, h: 60 },
          { x: 1000, z: .42, w: 100, d: .3, h: 120 },
          { x: 1380, z: .5, w: 140, d: .36, h: 0, id: 'gh_shelfbridge', hidden: true }
        ],
        pits: [{ x0: 700, x1: 900, z0: .28, z1: .56, to: { x: 580, z: .78 } }],
        items: [
          { kind: 'chest', x: 620, z: .42, y: 60, coins: 20, flag: 'gh_book1' },
          { kind: 'chest', x: 1000, z: .42, y: 120, coins: 20, flag: 'gh_book2' },
          { kind: 'chest', x: 1700, z: .78, coins: 20, flag: 'gh_book3' },
          { kind: 'shard', x: 1900, z: .8, flag: 'gh3_shard' }
        ],
        gizmos: [
          { kind: 'save', x: 150, z: .84 },
          {
            kind: 'glyph', x: 1260, z: .5, needs: 'read', once: true, reveals: 'gh_shelfbridge',
            label: 'Read',
            script: [['say', 'narr', 'The glyph is a shelving instruction. Read aloud, it does what it says.'], ['say', 'narr', 'A row of shelves rotates into a walkway.']]
          },
          { kind: 'sign', x: 280, z: .88, text: 'STACKS. Bring a light. The lamps were removed "to reduce reading".' }
        ],
        foes: [
          { id: 'gh3a', type: 'dogear', x: 800, z: .68, patrol: 90, group: ['dogear', 'footnote'], killFlag: 'gh3_f1' },
          { id: 'gh3b', type: 'erratum', x: 1550, z: .64, patrol: 120, group: ['erratum', 'glyphling'], killFlag: 'gh3_f2' },
          { id: 'gh3c', type: 'marginalis', x: 1850, z: .6, patrol: 80, group: ['marginalis', 'dogear', 'footnote'], killFlag: 'gh3_f3' }
        ],
        triggers: [{
          x: 340, z: .6, w: 100, d: 1.4, once: true, flag: 'tr_stacks_dark',
          script: [['say', 'lumen', 'They took the lamps out. To reduce reading.'], ['say', 'lumen', 'Press <c:#c8443c>C</c>. I am about to be extremely useful.']]
        }]
      },
      {
        id: 'gh_marginalia', name: 'The Marginalia', w: 1700, theme: 'library',
        props: K.scatter(['bookshelf', 'pillar'], 6, 1700),
        solids: [{ x: 900, z: .44, w: 100, d: .3, h: 64 }],
        items: [{ kind: 'chest', x: 900, z: .44, y: 64, coins: 20, flag: 'gh_book4' },
          { kind: 'chest', x: 1620, z: .32, item: 'twicefolded', flag: 'gh4_ch1' }],
        gizmos: [{ kind: 'save', x: 150, z: .84 }],
        foes: [{ id: 'gh4a', type: 'redliner', x: 1200, z: .66, patrol: 100, group: ['redliner', 'erratum'], killFlag: 'gh4_f1' }],
        triggers: [{
          x: 340, z: .6, w: 100, d: 1.4, once: true, flag: 'tr_margo',
          script: [
            ['say', 'narr', 'One book lies open on a reading stand, at page four hundred and twelve, held there by a bookmark.'],
            ['spawn', { id: 'mgo', sprite: 'margo', x: 560, z: .6, name: 'Margo' }],
            ['wait', 26],
            ['say', 'margo', '"—and so, having crossed the river, she understood at last that the letter had never been meant for her" — comma — and that is where it stops. That is where it has stopped for two hundred and six years.'],
            ['say', 'pip', 'They did not come back.'],
            ['say', 'margo', 'People do not, mostly. That is not a complaint, it is a statistic. But two hundred and six years is a great deal of time to spend on a comma.'],
            ['say', 'twigby', 'What happens on page four hundred and thirteen?'],
            ['say', 'margo', 'I have no idea. I am a bookmark. I hold the place. I do not get to turn it.'],
            ['say', 'pip', 'Come with us. I cannot promise an ending, but there is a great deal happening and all of it is unfinished.'],
            ['say', 'margo', 'Two hundred and six years on page four hundred and twelve. I would very much like to see how any story ends. Even this one.'],
            ['despawn', 'mgo'],
            ['partner', 'margo'],
            ['wait', 20],
            ['say', 'sys', 'Margo joined you.\n<c:#c8443c>C</c> reads glyphs, translates signs and reveals hidden platforms.\nIn battle, <c:#f07a8a>Annotate</c> drops a foe\'s Defence and makes everything hurt it more.']
          ]
        }]
      },
      {
        id: 'gh_restricted', name: 'The Restricted Wing', w: 1800, theme: 'library',
        eastLock: { needsKey: 'vault_sigil', lockedMsg: 'The inkwell door carries a sigil-lock. Something in this wing is holding the sigil.' },
        props: K.scatter(['bookshelf', 'pillar'], 7, 1800),
        exits: [{ x: 8, z: .3, w: 40, d: .4, to: 'gh_marginalia', spawn: 'east', needsKey: 'libcard', lockedMsg: 'A Reader\'s Card is required beyond this point. It always was; now they mean it.' }],
        solids: [
          { x: 640, z: .42, w: 90, d: .28, h: 58 },
          { x: 1000, z: .5, w: 140, d: .36, h: 0, id: 'gh_readbridge', hidden: true }
        ],
        items: [{ kind: 'chest', x: 640, z: .42, y: 58, badge: 'peekaboo', flag: 'gh5_ch1' },
          { kind: 'coin', x: 1200, z: .78, amount: 16, flag: 'gh5_c1' }],
        gizmos: [
          { kind: 'save', x: 150, z: .84 },
          {
            kind: 'glyph', x: 880, z: .5, needs: 'read', once: true, reveals: 'gh_readbridge',
            label: 'Read',
            script: [['say', 'margo', 'It is a floor plan. Read properly, it becomes a floor. Libraries are very literal.']]
          }
        ],
        foes: [
          { id: 'gh5a', type: 'gluegoop', x: 900, z: .68, patrol: 80, group: ['gluegoop', 'redliner'], killFlag: 'gh5_f1' },
          {
            id: 'gh5boss', type: 'footnote_fenn', x: 1620, z: .6, patrol: 0, chase: false, boss: true,
            group: ['footnote_fenn'], killFlag: 'gh_fenn_down',
            cfg: {
              boss: true, noRun: true, music: 'boss',
              introLine: 'Footnote Fenn: "I have read every book in this building. I remember all the worst parts. Would you like them?"',
              introSpeaker: 'Footnote Fenn', introPortrait: 'footnote_fenn'
            },
            onWin: [
              ['givekey', 'vault_sigil'],
              ['sayx', 'Footnote Fenn', 'footnote_fenn', 'Take the sigil. Go down to the inkwell. And courier — when you meet it, do not argue. It does not read arguments. It removes them.', 'boss']
            ]
          }
        ],
        triggers: [{
          x: 340, z: .6, w: 90, d: 1.4, once: true, flag: 'tr_libcard', notFlag: 'gh_card_given',
          script: [
            ['ifitem', 'libcard', [], [
              ['say', 'margo', 'You will need a Reader\'s Card to get back out through the west door. Here — mine. Two hundred and six years unexpired.'],
              ['givekey', 'libcard'],
              ['flag', 'gh_card_given', true]
            ]]
          ]
        }]
      },
      {
        id: 'gh_inkwell', name: 'The Inkwell', w: 1700, theme: 'cave', music: 'library', dark: true,
        props: K.scatter(['inkpool', 'pillar', 'rock'], 7, 1700),
        solids: [{ x: 700, z: .44, w: 100, d: .3, h: 60 }, { x: 1100, z: .44, w: 100, d: .3, h: 60 }],
        items: [{ kind: 'chest', x: 700, z: .44, y: 60, item: 'inkespresso', flag: 'gh6_ch1' },
          { kind: 'chest', x: 1100, z: .44, y: 60, badge: 'returnpost', flag: 'gh6_ch2' }],
        gizmos: K.rest(150).concat([
          {
            kind: 'glyph', x: 1400, z: .8, needs: 'read', once: true,
            label: 'Read',
            script: [['say', 'margo', '"Whatever is written here outlives whoever wrote it." Well. That is either a comfort or a threat.'], ['shard', 1]]
          }
        ]),
        foes: [
          { id: 'gh6a', type: 'erratum', x: 900, z: .68, patrol: 110, group: ['erratum', 'erratum', 'redliner'], killFlag: 'gh6_f1' },
          { id: 'gh6b', type: 'marginalis', x: 1450, z: .62, patrol: 90, group: ['marginalis', 'glyphling', 'dogear'], killFlag: 'gh6_f2' }
        ]
      },
      {
        id: 'gh_vault', name: 'The Blank Vault', w: 1300, theme: 'library', music: 'tense',
        props: [{ sprite: 'pillar', x: 240, z: .14 }, { sprite: 'pillar', x: 1060, z: .14 },
          { sprite: 'bookshelf', x: 500, z: .1 }, { sprite: 'bookshelf', x: 800, z: .1 }],
        gizmos: K.rest(150),
        triggers: [PB.MapKit.bossTrigger({
          x: 620, flag: 'tr_redactor', entId: 'red', sprite: 'the_redactor',
          name: 'The Redactor', enemy: 'the_redactor', bg: 'library',
          before: [
            ['say', 'narr', 'The vault is full of books with nothing in them. Not blank pages — pages that were written on, and are not any more, and remember it.'],
            ['say', 'margo', 'Oh. Oh, no.']
          ],
          lines: [
            ['sayx', 'THE REDACTOR', 'the_redactor', '███ ██ ███ ████ ██████.', 'boss'],
            ['say', 'pip', 'Say that again.'],
            ['sayx', 'THE REDACTOR', 'the_redactor', 'YOU ARE NOT CLEARED FOR THE PREVIOUS SENTENCE.', 'boss'],
            ['say', 'margo', 'It is not censoring lies. Look at the shelves — it is on C. It is going alphabetically. It is removing EVERYTHING.'],
            ['sayx', 'THE REDACTOR', 'the_redactor', 'ANYTHING THAT CAN BE MISREAD SHOULD NOT BE READABLE. THIS IS NOT CRUELTY. THIS IS PROCEDURE.', 'boss'],
            ['say', 'pip', 'Nine million books.'],
            ['sayx', 'THE REDACTOR', 'the_redactor', 'NINE MILLION RISKS.', 'boss'],
            ['say', 'margo', 'Page four hundred and twelve. Whatever happens on page four hundred and thirteen — I have waited two hundred and six years and you do not get to black it out first.'],
            ['sayx', 'THE REDACTOR', 'the_redactor', 'THEN YOU WILL BE ██████ FIRST.', 'boss']
          ],
          after: [
            ['say', 'narr', 'The bars peel away. Underneath, there is nothing written at all — and then, slowly, ink starts coming back to nine million pages at once.'],
            ['say', 'margo', '...It is returning. All of it is returning.'],
            ['say', 'lumen', 'Then somebody had better hold a light while you read.'],
            ['wait', 30],
            ['sfx', 'seal'],
            ['title', 'SEAL V RECOVERED', 110],
            ['givekey', 'seal5'],
            ['seal', 'seal_redaction'],
            ['form', 'form_lantern'],
            ['say', 'sys', 'Seal Power learned: <c:#2a1c3c>Redaction</c> — strips every foe\'s specials and 2 Defence.\nNew Origami Form: <c:#ffe066>Lantern</c> — you and your partner recover HP every turn.'],
            ['flag', 'ch5_done', true],
            ['chapterset', 6],
            ['heal'],
            ['say', 'margo', 'Pip. When this is finished. Would you read page four hundred and thirteen to me. I find I cannot do it myself.'],
            ['say', 'pip', 'It is a delivery. I do those.'],
            ['goto', 'foldheim_road', 'ch5']
          ]
        })]
      }
    ]
  );
})();
