/* ==========================================================================
   PAPERBOUND — 09_enemies.js
   The bestiary. Every foe carries its own move table and a weighted AI.

   flags: ground | air | spiked (punishes stomps) | fiery (punishes contact)
          electric (punishes contact) | icy | slick (mallet slides off)
          ceiling | heavy (immune to ground/flip) | boss
   weak/resist/immune are element or status keys.
   ========================================================================== */
'use strict';

PB.Enemies = (function () {
  var db = {};

  /* Enemy move factory. */
  function m(name, power, o) {
    o = o || {};
    o.name = name; o.power = power;
    o.target = o.target || 'random';
    o.weight = o.weight === undefined ? 10 : o.weight;
    o.anim = o.anim || 'lunge';
    o.guardable = o.guardable !== false;
    return o;
  }

  function E(id, name, o) {
    o.id = id; o.name = name;
    o.sprite = o.sprite || id;
    o.flags = o.flags || ['ground'];
    o.weak = o.weak || []; o.resist = o.resist || []; o.immune = o.immune || [];
    o.moves = o.moves || [m('Tackle', o.atk)];
    o.tier = o.tier || 1;
    o.sp = o.sp === undefined ? Math.max(1, Math.round(o.hp * 0.6 + o.atk)) : o.sp;
    o.coins = o.coins === undefined ? Math.max(1, Math.round(o.tier * 1.6)) : o.coins;
    db[id] = o;
    return o;
  }

  var has = function (e, f) { return e.flags.indexOf(f) >= 0; };

  /* ===================== CHAPTER 1 — CREASEWOOD ========================== */
  E('snapleaf', 'Snapleaf', {
    tier: 1, hp: 6, atk: 2, def: 0, flags: ['ground'], weak: ['fire'], resist: ['water'],
    tattle: 'A Snapleaf. 6 HP, 2 Attack, no Defence. It only knows how to lunge, and it lunges very badly. Fire makes short work of it — it is, after all, a leaf.',
    moves: [m('Chomp', 2), m('Leaf Spin', 1, { hits: 2, weight: 6 })],
    drops: [['pulpberry', .3]]
  });
  E('thornhopper', 'Thornhopper', {
    tier: 1, hp: 7, atk: 2, def: 1, flags: ['ground', 'spiked'], weak: ['fire'],
    tattle: 'A Thornhopper. 7 HP, 2 Attack, 1 Defence, and a back full of thorns. Do not stomp it unless you enjoy regret — swing the mallet instead.',
    moves: [m('Thorn Hop', 2), m('Bramble Roll', 3, { weight: 5, telegraph: 'It curls up tight...' })],
    drops: [['honeyleaf', .25]]
  });
  E('barkbug', 'Barkbug', {
    tier: 1, hp: 9, atk: 2, def: 2, flags: ['ground', 'heavy'], weak: ['fire', 'shock'], resist: ['blunt'],
    tattle: 'A Barkbug. 9 HP, 2 Attack, and 2 Defence under all that bark. Blunt hits bounce off. Pierce it, cut it, or burn it.',
    moves: [m('Gore', 3), m('Shell Up', 0, { guard: 3, turns: 2, weight: 5, telegraph: 'It tucks into its bark.' })],
    drops: [['pulpberry', .2]]
  });
  E('mossback', 'Mossback', {
    tier: 1, hp: 12, atk: 1, def: 1, flags: ['ground'], weak: ['fire'], resist: ['water'], immune: ['poison'],
    tattle: 'A Mossback. 12 HP but only 1 Attack — it would much rather nap than fight. It regrows a little every turn, so finish it quickly.',
    moves: [m('Slump', 1), m('Photosynthesise', 0, { heal: 3, target: 'self', weight: 8, telegraph: 'It soaks up the light.' })],
    drops: [['antidote', .25]]
  });
  E('twigling', 'Twigling', {
    tier: 1, hp: 5, atk: 3, def: 0, flags: ['ground'], weak: ['fire'],
    tattle: 'A Twigling. Only 5 HP, but 3 Attack — brittle and mean. Take it out first or it will keep poking holes in you.',
    moves: [m('Twig Jab', 3), m('Rally', 0, { atkBuff: 1, target: 'allies', weight: 4, telegraph: 'It rattles its branches.' })],
    drops: [['pulpberry', .3]]
  });
  E('petalwisp', 'Petalwisp', {
    tier: 1, hp: 5, atk: 2, def: 0, flags: ['air'], weak: ['wind', 'shock'], resist: ['fire'],
    tattle: 'A Petalwisp, drifting well out of mallet range. 5 HP. Stomp it, shock it, or knock it down with a gust.',
    moves: [m('Pollen Puff', 2, { status: { type: 'sleep', chance: .3, turns: 2 } })],
    drops: [['honeyleaf', .3]]
  });

  /* ===================== CHAPTER 2 — EMBERFOLD =========================== */
  E('emberling', 'Emberling', {
    tier: 2, hp: 9, atk: 3, def: 0, flags: ['ground', 'fiery'], weak: ['water', 'ice'], immune: ['burn'],
    tattle: 'An Emberling. 9 HP, 3 Attack, and it is on fire, so touching it hurts. Douse it with water first and it becomes a very ordinary lump.',
    moves: [m('Singe', 3, { element: 'fire', status: { type: 'burn', chance: .4, turns: 3 } }), m('Flare Up', 4, { element: 'fire', weight: 5, telegraph: 'It flares white-hot!' })],
    drops: [['emberpod', .2]]
  });
  E('cinderfly', 'Cinderfly', {
    tier: 2, hp: 7, atk: 3, def: 0, flags: ['air', 'fiery'], weak: ['water', 'wind'], immune: ['burn'],
    tattle: 'A Cinderfly. 7 HP, airborne, and burning. Stomping it is a bad idea without an Ember Shield. Water clips its wings nicely.',
    moves: [m('Cinder Dive', 3, { element: 'fire' }), m('Ash Cloud', 1, { target: 'both', status: { type: 'inked', chance: .5, turns: 2 }, weight: 5 })],
    drops: [['drycloth', .25]]
  });
  E('ashgoyle', 'Ashgoyle', {
    tier: 2, hp: 14, atk: 4, def: 2, flags: ['ground', 'heavy'], weak: ['water', 'shock'], resist: ['fire'],
    tattle: 'An Ashgoyle. 14 HP, 4 Attack, 2 Defence. Slow, heavy, and entirely made of yesterday\'s fire. Water is its least favourite thing.',
    moves: [m('Slam', 4), m('Ash Breath', 3, { target: 'both', element: 'fire', weight: 6, telegraph: 'Soot gathers in its throat.' })],
    drops: [['ironsheet', .15]]
  });
  E('magmite', 'Magmite', {
    tier: 2, hp: 11, atk: 3, def: 1, flags: ['ground', 'fiery'], weak: ['water'], immune: ['burn', 'freeze'],
    tattle: 'A Magmite. 11 HP, 3 Attack, 1 Defence. It splits its own crust to throw at you. Soggy it and it stops splitting.',
    moves: [m('Crust Toss', 3, { element: 'fire' }), m('Molten Spit', 4, { element: 'fire', status: { type: 'burn', chance: .6, turns: 3 }, weight: 6 })],
    drops: [['emberpod', .2]]
  });
  E('wickling', 'Wickling', {
    tier: 2, hp: 8, atk: 2, def: 0, flags: ['ground', 'fiery'], weak: ['water', 'wind'], immune: ['burn'],
    tattle: 'A Wickling. 8 HP and a very short fuse — literally. When its wick burns down it detonates, so either finish it fast or put it out.',
    moves: [m('Wick Whip', 2, { element: 'fire' }), m('Burn Down', 7, { target: 'both', element: 'fire', selfKO: true, weight: 3, cond: 'lowhp', telegraph: 'Its wick is almost gone!' })],
    drops: [['drycloth', .3]]
  });
  E('slagmaw', 'Slagmaw', {
    tier: 2, hp: 16, atk: 4, def: 1, flags: ['ground', 'fiery'], weak: ['water', 'ice'], immune: ['burn'],
    tattle: 'A Slagmaw. 16 HP, 4 Attack. It swallows fire and spits it back out hotter. Bloop makes this fight considerably shorter.',
    moves: [m('Maul', 4, { hits: 2 }), m('Slag Spray', 3, { target: 'both', element: 'fire', status: { type: 'burn', chance: .5, turns: 3 }, weight: 7 })],
    drops: [['boldbrew', .15]]
  });

  /* ===================== CHAPTER 3 — SOGPORT ============================= */
  E('drizzler', 'Drizzler', {
    tier: 3, hp: 11, atk: 3, def: 0, flags: ['air'], weak: ['shock'], resist: ['water', 'fire'],
    tattle: 'A Drizzler. 11 HP, floats, and rains on everything. Shock travels beautifully through wet paper — ask Volt.',
    moves: [m('Downpour', 3, { target: 'both', element: 'water', status: { type: 'soggy', chance: .5, turns: 3 } })],
    drops: [['drycloth', .3]]
  });
  E('soggle', 'Soggle', {
    tier: 3, hp: 15, atk: 3, def: 2, flags: ['ground'], weak: ['shock', 'fire'], resist: ['water'], immune: ['soggy'],
    tattle: 'A Soggle. 15 HP, 2 Defence, and permanently waterlogged. Heavy and slow. Dry it out with fire and its Defence falls apart.',
    moves: [m('Sop', 3, { status: { type: 'soggy', chance: .6, turns: 3 } }), m('Wring Out', 0, { heal: 5, target: 'self', weight: 5 })],
    drops: [['pressiron', .2]]
  });
  E('barnacleaf', 'Barnacleaf', {
    tier: 3, hp: 13, atk: 4, def: 2, flags: ['ground', 'spiked'], weak: ['shock'], resist: ['water', 'cut'],
    tattle: 'A Barnacleaf. 13 HP, 4 Attack, 2 Defence and a crust of spikes. Never stomp it. Blunt force and shock both work.',
    moves: [m('Shell Scrape', 4, { element: 'cut' }), m('Clamp', 3, { status: { type: 'tangled', chance: .4, turns: 2 }, weight: 6 })],
    drops: [['papercutstar', .2]]
  });
  E('inkfish', 'Inkfish', {
    tier: 3, hp: 12, atk: 3, def: 1, flags: ['air'], weak: ['shock'], resist: ['ink', 'water'],
    tattle: 'An Inkfish. 12 HP and a bottomless supply of ink. Being Inked halves your accuracy, so bring Margo or a Tonic Wash.',
    moves: [m('Ink Jet', 3, { element: 'ink', status: { type: 'inked', chance: .7, turns: 3 } }), m('Tentacle', 4, { weight: 7 })],
    drops: [['inkbomb', .2]]
  });
  E('tidewisp', 'Tidewisp', {
    tier: 3, hp: 10, atk: 3, def: 0, flags: ['air'], weak: ['shock'], resist: ['water'],
    tattle: 'A Tidewisp. 10 HP. Harmless-looking, and then it heals everything else on the stage. Kill it first. Always kill it first.',
    moves: [m('Mist', 2, { element: 'water' }), m('Tide Song', 0, { heal: 6, target: 'allies', weight: 12, telegraph: 'It hums a rising note.' })],
    drops: [['pulpberry', .35]]
  });
  E('brinehound', 'Brinehound', {
    tier: 3, hp: 18, atk: 5, def: 1, flags: ['ground'], weak: ['shock'], resist: ['water'],
    tattle: 'A Brinehound. 18 HP, 5 Attack — the hardest hitter on the docks. It bites twice if you let it get close.',
    moves: [m('Savage Bite', 5, { hits: 2 }), m('Howl', 0, { atkBuff: 2, target: 'allies', weight: 5, telegraph: 'It throws back its head.' })],
    drops: [['boldbrew', .2]]
  });

  /* ===================== CHAPTER 4 — CARDSTOCK CARNIVAL ================== */
  E('clipling', 'Clipling', {
    tier: 4, hp: 12, atk: 4, def: 3, flags: ['ground', 'heavy'], weak: ['shock', 'fire'], resist: ['cut', 'blunt'],
    tattle: 'A Clipling. 12 HP and a genuinely irritating 3 Defence. Piercing moves and shock cut straight through. Blunt does almost nothing.',
    moves: [m('Pinch', 4), m('Clamp Down', 0, { guard: 4, turns: 2, weight: 6 })],
    drops: [['papercutstar', .25]]
  });
  E('juggloon', 'Juggloon', {
    tier: 4, hp: 14, atk: 4, def: 0, flags: ['air'], weak: ['cut', 'wind'], resist: ['blunt'],
    tattle: 'A Juggloon. 14 HP, no Defence, and full of hot air. One good cut pops it. It throws whatever it is juggling at you.',
    moves: [m('Juggle Toss', 4, { hits: 3, power: 2 }), m('Pop Off', 6, { weight: 4, cond: 'lowhp', selfKO: true, telegraph: 'It swells alarmingly.' })],
    drops: [['crowdcandy', .25]]
  });
  E('confettoid', 'Confettoid', {
    tier: 4, hp: 13, atk: 3, def: 1, flags: ['ground'], weak: ['water'], resist: ['cut'],
    tattle: 'A Confettoid. 13 HP. It bursts into a shower of confetti that dazzles the whole party. Water turns the confetti into pulp.',
    moves: [m('Streamer Whip', 3), m('Confetti Burst', 2, { target: 'both', status: { type: 'dizzy', chance: .6, turns: 2 }, weight: 8 })],
    drops: [['crowdcandy', .3]]
  });
  E('trapezoid', 'Trapezoid', {
    tier: 4, hp: 16, atk: 5, def: 1, flags: ['air'], weak: ['shock'], resist: ['blunt'],
    tattle: 'A Trapezoid. 16 HP, 5 Attack, and it swings in from above where the mallet cannot follow. Ground it with Volt or Updraft Stomp.',
    moves: [m('Swing Kick', 5), m('Aerial Drop', 6, { weight: 5, telegraph: 'It climbs to the top of the arc.' })],
    drops: [['swiftdraft', .2]]
  });
  E('papercut', 'Papercut', {
    tier: 4, hp: 10, atk: 6, def: 0, flags: ['air'], weak: ['water', 'blunt'], resist: ['cut'],
    tattle: 'A Papercut. Only 10 HP, but 6 Attack and it always goes for the soft edges. Kill it immediately. This is not negotiable.',
    moves: [m('Slice', 6, { element: 'cut', status: { type: 'poison', chance: .3, turns: 3 } })],
    drops: [['papercutstar', .3]]
  });
  E('stiltjack', 'Stiltjack', {
    tier: 4, hp: 17, atk: 4, def: 2, flags: ['ground'], weak: ['cut'], resist: ['blunt'],
    tattle: 'A Stiltjack. 17 HP, 2 Defence, and standing far too high to mallet comfortably. Cut the stilts out from under it.',
    moves: [m('Stomp Down', 4), m('High Kick', 5, { target: 'hero', weight: 7 })],
    drops: [['ironsheet', .2]]
  });

  /* ===================== CHAPTER 5 — GLYPHHAVEN =========================== */
  E('footnote', 'Footnote', {
    tier: 5, hp: 9, atk: 3, def: 1, flags: ['air'], weak: ['fire'], resist: ['ink'],
    tattle: 'A Footnote. 9 HP. Individually trivial; they never come alone. Fire is very effective and very frowned upon in a library.',
    moves: [m('Cite', 3), m('Summon Footnote', 0, { summon: 'footnote', weight: 6, telegraph: 'It references something below.' })],
    drops: [['pulpberry', .3]]
  });
  E('erratum', 'Erratum', {
    tier: 5, hp: 16, atk: 5, def: 2, flags: ['air'], weak: ['fire', 'light'], resist: ['ink'],
    tattle: 'An Erratum. 16 HP, 5 Attack. It copies your last move back at you, badly. Vary your attacks and it stays confused.',
    moves: [m('Correction', 5, { element: 'ink' }), m('Mirror Error', 4, { copyLast: true, weight: 7, telegraph: 'It reads your last move aloud.' })],
    drops: [['inkbomb', .2]]
  });
  E('glyphling', 'Glyphling', {
    tier: 5, hp: 14, atk: 4, def: 2, flags: ['ground'], weak: ['shock'], resist: ['ink', 'light'],
    tattle: 'A Glyphling. 14 HP, 2 Defence. It shields whatever is next to it, so it is always the wrong thing to attack second.',
    moves: [m('Rune Bolt', 4, { element: 'light' }), m('Ward', 0, { guard: 3, turns: 2, target: 'allies', weight: 8 })],
    drops: [['ironsheet', .2]]
  });
  E('redliner', 'Redliner', {
    tier: 5, hp: 15, atk: 5, def: 1, flags: ['ground'], weak: ['fire'], immune: ['inked'],
    tattle: 'A Redliner. 15 HP, 5 Attack, and it silences your Seal Powers. Deal with it before you plan anything clever.',
    moves: [m('Strike Through', 5, { element: 'cut' }), m('Red Pen', 3, { status: { type: 'silence', chance: .7, turns: 3 }, weight: 8, telegraph: 'It uncaps a red pen.' })],
    drops: [['tonicwash', .2]]
  });
  E('dogear', 'Dogear', {
    tier: 5, hp: 20, atk: 3, def: 3, flags: ['ground', 'heavy'], weak: ['cut'], resist: ['blunt'], immune: ['crumple'],
    tattle: 'A Dogear. 20 HP and 3 Defence — a very stubborn crease. Snip cuts through it in one turn. Everything else takes several.',
    moves: [m('Fold Over', 3, { status: { type: 'crumple', chance: .5, turns: 3 } }), m('Press Flat', 5, { weight: 6 })],
    drops: [['pressiron', .25]]
  });
  E('marginalis', 'Marginalis', {
    tier: 5, hp: 19, atk: 6, def: 2, flags: ['air'], weak: ['light'], resist: ['ink'],
    tattle: 'A Marginalis. 19 HP, 6 Attack, and it drains HP to heal itself. Lumen\'s light hurts it badly.',
    moves: [m('Margin Slash', 6, { element: 'cut' }), m('Drain Note', 4, { drain: true, weight: 8, telegraph: 'It leans in close to read you.' })],
    drops: [['inktea', .25]]
  });

  /* ===================== CHAPTER 6 — FROSTFOLD ============================ */
  E('frostling', 'Frostling', {
    tier: 6, hp: 16, atk: 5, def: 1, flags: ['ground', 'icy'], weak: ['fire'], immune: ['freeze'],
    tattle: 'A Frostling. 16 HP, 5 Attack. It freezes whatever it touches. Lumen or any fire move melts its Defence right off.',
    moves: [m('Chill Touch', 5, { element: 'ice', status: { type: 'freeze', chance: .4, turns: 2 } })],
    drops: [['frostnut', .25]]
  });
  E('snowcrease', 'Snowcrease', {
    tier: 6, hp: 22, atk: 6, def: 3, flags: ['ground', 'icy', 'heavy'], weak: ['fire'], resist: ['ice', 'blunt'],
    tattle: 'A Snowcrease. 22 HP, 6 Attack, 3 Defence. A wall of packed snow with a grudge. Burn it or pierce it; nothing else dents it.',
    moves: [m('Avalanche Arm', 6), m('Pack Down', 0, { guard: 4, heal: 4, target: 'self', turns: 2, weight: 6 })],
    drops: [['glacierjelly', .15]]
  });
  E('icicleimp', 'Icicleimp', {
    tier: 6, hp: 14, atk: 6, def: 0, flags: ['air', 'icy'], weak: ['fire', 'wind'], immune: ['freeze'],
    tattle: 'An Icicleimp. 14 HP, 6 Attack, no Defence at all. Glass cannon. Break the glass.',
    moves: [m('Icicle Drop', 6, { element: 'ice', pierce: true })],
    drops: [['frostnut', .3]]
  });
  E('chillbug', 'Chillbug', {
    tier: 6, hp: 18, atk: 5, def: 2, flags: ['ground', 'icy'], weak: ['fire'], resist: ['ice'],
    tattle: 'A Chillbug. 18 HP, 5 Attack. It scuttles behind you and bites the back of your knees, which is exactly as rude as it sounds.',
    moves: [m('Frost Bite', 5, { element: 'ice', hits: 2, power: 3 }), m('Burrow', 0, { evade: 1, turns: 1, weight: 5, telegraph: 'It vanishes into the drift.' })],
    drops: [['pulpberry', .3]]
  });
  E('glaciat', 'Glaciat', {
    tier: 6, hp: 28, atk: 6, def: 4, flags: ['ground', 'icy', 'heavy'], weak: ['fire'], resist: ['ice', 'blunt', 'cut'], immune: ['freeze', 'tangled'],
    tattle: 'A Glaciat. 28 HP and a monstrous 4 Defence. Blunt and cut both slide off. Fire, shock, and anything piercing are your friends here.',
    moves: [m('Glacier Slam', 6), m('Deep Freeze', 4, { target: 'both', element: 'ice', status: { type: 'freeze', chance: .5, turns: 2 }, weight: 6 })],
    drops: [['lifeleaf', .12]]
  });
  E('flurrik', 'Flurrik', {
    tier: 6, hp: 15, atk: 4, def: 0, flags: ['air'], weak: ['fire', 'wind'], resist: ['ice'],
    tattle: 'A Flurrik. 15 HP. It blows the whole party around and makes everyone miss. Ground it fast.',
    moves: [m('Flurry', 3, { target: 'both', element: 'ice' }), m('Whiteout', 0, { target: 'both', status: { type: 'inked', chance: .8, turns: 3 }, weight: 8 })],
    drops: [['smellingink', .25]]
  });

  /* ===================== CHAPTER 7 — FOILWORKS ============================ */
  E('sparkbit', 'Sparkbit', {
    tier: 7, hp: 14, atk: 5, def: 0, flags: ['air', 'electric'], weak: ['water'], immune: ['shock'],
    tattle: 'A Sparkbit. 14 HP and live to the touch — contact attacks hurt you back. Water shorts it out instantly.',
    moves: [m('Arc', 5, { element: 'shock' })],
    drops: [['thunderrag', .25]]
  });
  E('foilrat', 'Foilrat', {
    tier: 7, hp: 19, atk: 6, def: 2, flags: ['ground'], weak: ['shock'], resist: ['cut'],
    tattle: 'A Foilrat. 19 HP, 6 Attack. It steals coins and runs. If you want your money back, be quick about it.',
    moves: [m('Gnaw', 6), m('Snatch', 2, { steal: true, weight: 6, telegraph: 'Its eyes go to your purse.' })],
    drops: [['pulpberry', .25]]
  });
  E('coglet', 'Coglet', {
    tier: 7, hp: 16, atk: 5, def: 4, flags: ['ground', 'heavy'], weak: ['shock'], resist: ['blunt', 'cut'], immune: ['poison', 'sleep'],
    tattle: 'A Coglet. 16 HP behind 4 Defence. It repairs itself if you leave it alone. Piercing damage is the only sane answer.',
    moves: [m('Piston Punch', 5), m('Self-Repair', 0, { heal: 6, target: 'self', weight: 7 })],
    drops: [['pressiron', .25]]
  });
  E('voltoid', 'Voltoid', {
    tier: 7, hp: 20, atk: 6, def: 1, flags: ['ground', 'electric'], weak: ['water'], immune: ['shock'],
    tattle: 'A Voltoid. 20 HP, 6 Attack, and it electrifies its friends. Water is a bad idea for it and an excellent idea for you.',
    moves: [m('Discharge', 6, { element: 'shock' }), m('Energise', 0, { atkBuff: 2, target: 'allies', weight: 7, telegraph: 'The air starts to hum.' })],
    drops: [['thunderrag', .25]]
  });
  E('wirewing', 'Wirewing', {
    tier: 7, hp: 17, atk: 6, def: 1, flags: ['air', 'electric'], weak: ['water'], immune: ['shock'],
    tattle: 'A Wirewing. 17 HP, airborne and live. It jams your action commands, so expect the timing windows to lie to you.',
    moves: [m('Buzz Strike', 6, { element: 'shock' }), m('Jam', 0, { target: 'both', status: { type: 'dizzy', chance: .8, turns: 2 }, weight: 7 })],
    drops: [['smellingink', .25]]
  });
  E('pressbot', 'Pressbot', {
    tier: 7, hp: 30, atk: 8, def: 4, flags: ['ground', 'heavy'], weak: ['shock', 'water'], resist: ['blunt', 'cut'], immune: ['poison', 'sleep', 'dizzy'],
    tattle: 'A Pressbot. 30 HP, 8 Attack, 4 Defence. It flattens things for a living and is very good at it. Bring everything you have.',
    moves: [m('Hydraulic Press', 8, { status: { type: 'crumple', chance: .6, turns: 3 } }), m('Overheat', 6, { target: 'both', element: 'fire', weight: 5, telegraph: 'Steam vents from every seam.' })],
    drops: [['lastpage', .1]]
  });

  /* ===================== CHAPTER 8 — THE BLOT ============================= */
  E('blotling', 'Blotling', {
    tier: 8, hp: 22, atk: 7, def: 2, flags: ['ground'], weak: ['light', 'fire'], resist: ['ink'], immune: ['inked'],
    tattle: 'A Blotling. 22 HP, 7 Attack. Raw spilled ink with an opinion. Light hurts it more than anything else does.',
    moves: [m('Splatter', 7, { element: 'ink', status: { type: 'inked', chance: .5, turns: 3 } }), m('Absorb', 4, { drain: true, weight: 6 })],
    drops: [['inktea', .25]]
  });
  E('smudgeling', 'Smudgeling', {
    tier: 8, hp: 19, atk: 6, def: 1, flags: ['air'], weak: ['light'], resist: ['ink'], immune: ['inked'],
    tattle: 'A Smudgeling. 19 HP. It smears your stats — expect Attack and Defence to slide. Lumen burns it off cleanly.',
    moves: [m('Smear', 6, { element: 'ink' }), m('Blur', 0, { target: 'both', debuff: { atk: -2, def: -1, turns: 3 }, weight: 8, telegraph: 'The stage goes soft at the edges.' })],
    drops: [['tonicwash', .25]]
  });
  E('inkhound', 'Inkhound', {
    tier: 8, hp: 26, atk: 8, def: 2, flags: ['ground'], weak: ['light', 'fire'], resist: ['ink'],
    tattle: 'An Inkhound. 26 HP, 8 Attack, and it hunts in pairs. If you see one, the other is already behind you.',
    moves: [m('Rend', 8, { hits: 2, power: 5 }), m('Bay', 0, { summon: 'blotling', weight: 5, telegraph: 'Its howl echoes down the hall.' })],
    drops: [['boldbrew', .2]]
  });
  E('nibguard', 'Nibguard', {
    tier: 8, hp: 28, atk: 7, def: 5, flags: ['ground', 'heavy'], weak: ['shock'], resist: ['blunt', 'cut', 'ink'], immune: ['poison', 'sleep'],
    tattle: 'A Nibguard. 28 HP behind 5 Defence — the toughest shell in the Citadel. Pierce it or shock it; nothing else registers.',
    moves: [m('Nib Thrust', 7, { pierce: true }), m('Guard Stance', 0, { guard: 5, turns: 2, weight: 6 })],
    drops: [['mirrorfoil', .15]]
  });
  E('erasure', 'Erasure', {
    tier: 8, hp: 24, atk: 7, def: 3, flags: ['air'], weak: ['ink'], resist: ['light', 'fire', 'ice', 'shock'], immune: ['crumple'],
    tattle: 'An Erasure. 24 HP, and it deletes things — your buffs, your Forms, occasionally your item. Ink is the one thing it cannot unmake.',
    moves: [m('Rub Out', 7, { dispel: true }), m('Blank', 5, { target: 'both', status: { type: 'silence', chance: .6, turns: 3 }, weight: 7 })],
    drops: [['sealwater', .2]]
  });
  E('blotknight', 'Blotknight', {
    tier: 8, hp: 34, atk: 9, def: 4, flags: ['ground', 'heavy'], weak: ['light'], resist: ['ink', 'cut'], immune: ['tangled'],
    tattle: 'A Blotknight. 34 HP, 9 Attack, 4 Defence. Duke Smudge\'s personal guard, and it fights like it. No shortcuts here.',
    moves: [m('Cleave', 9, { element: 'cut' }), m('Ink Wall', 0, { guard: 4, target: 'allies', turns: 2, weight: 5 }), m('Executioner', 12, { weight: 4, cond: 'heroLow', telegraph: 'It raises the blade high.' })],
    drops: [['lastpage', .15]]
  });

  /* ===================== ROAMING / OPTIONAL =============================== */
  E('crumple', 'Crumple', {
    tier: 1, hp: 4, atk: 1, def: 0, flags: ['ground'], weak: ['fire'],
    tattle: 'A Crumple. 4 HP, 1 Attack. A discarded draft that woke up angry. It is not very good at being angry.',
    moves: [m('Bump', 1)], drops: [['pulpberry', .4]]
  });
  E('wadball', 'Wadball', {
    tier: 3, hp: 14, atk: 4, def: 2, flags: ['ground', 'heavy'], weak: ['fire', 'water'], resist: ['blunt'],
    tattle: 'A Wadball. 14 HP, 2 Defence. Rolls over anything in its way. Wet paper does not roll.',
    moves: [m('Roll Over', 4), m('Compact', 0, { guard: 3, turns: 2, weight: 5 })],
    drops: [['pressiron', .2]]
  });
  E('staplebug', 'Staplebug', {
    tier: 4, hp: 12, atk: 5, def: 3, flags: ['ground', 'spiked', 'heavy'], weak: ['shock'], resist: ['blunt', 'cut'],
    tattle: 'A Staplebug. 12 HP, 3 Defence and spiked. Do not stomp it. Shock is the clean answer.',
    moves: [m('Staple', 5, { pierce: true })], drops: [['papercutstar', .25]]
  });
  E('gluegoop', 'Gluegoop', {
    tier: 5, hp: 20, atk: 3, def: 1, flags: ['ground'], weak: ['fire', 'ice'], immune: ['tangled', 'crumple'],
    tattle: 'A Gluegoop. 20 HP. It sticks you in place, which is worse than it sounds when there are Papercuts about.',
    moves: [m('Stick', 3, { status: { type: 'tangled', chance: .6, turns: 2 } }), m('Engulf', 5, { weight: 6 })],
    drops: [['tonicwash', .2]]
  });

  /* ===================== MINI-BOSSES ====================================== */
  E('thistleguard', 'Thistleguard', {
    tier: 1, hp: 30, atk: 4, def: 2, flags: ['ground', 'spiked', 'heavy', 'miniboss'], weak: ['fire'], immune: ['tangled'],
    sp: 30, coins: 20,
    tattle: 'Thistleguard, warden of the thicket gate. 30 HP, 4 Attack, 2 Defence, and covered in thorns — stomping it will cost you. Fire strips the thorns; then the mallet does the rest.',
    moves: [
      m('Thorn Sweep', 4, { target: 'both' }),
      m('Bramble Wall', 0, { guard: 3, turns: 2, weight: 7, telegraph: 'It raises a wall of brambles.' }),
      m('Impale', 7, { pierce: true, weight: 6, telegraph: 'Every thorn turns toward you.' })
    ],
    drops: [['reamcake', 1]]
  });
  E('wick_and_wisp', 'Wick & Wisp', {
    tier: 2, hp: 34, atk: 5, def: 1, flags: ['air', 'fiery', 'miniboss'], weak: ['water'], immune: ['burn'],
    sp: 36, coins: 24,
    tattle: 'Wick & Wisp, the Foundry\'s twin lamplighters — one body, two tempers. 34 HP, 5 Attack. Airborne and burning, so stomping hurts. Bloop turns this fight around completely.',
    moves: [
      m('Twin Flame', 5, { target: 'both', element: 'fire' }),
      m('Wick Snap', 6, { element: 'fire', status: { type: 'burn', chance: .7, turns: 3 }, weight: 8 }),
      m('Relight', 0, { heal: 8, target: 'self', weight: 5, cond: 'lowhp', telegraph: 'The pair flare back to life.' })
    ],
    drops: [['drycloth', 1]]
  });
  E('barnacle_bosun', 'Barnacle Bosun', {
    tier: 3, hp: 44, atk: 6, def: 3, flags: ['ground', 'spiked', 'miniboss'], weak: ['shock'], resist: ['water'],
    sp: 44, coins: 30,
    tattle: 'The Barnacle Bosun, who runs the Sogport wreck like a ship he no longer has. 44 HP, 6 Attack, 3 Defence, spiked. Volt\'s shock cuts through the salt water and the armour at once.',
    moves: [
      m('Anchor Swing', 6),
      m('Rally the Crew', 0, { summon: 'barnacleaf', weight: 6, telegraph: 'He whistles for the crew.' }),
      m('Broadside', 4, { target: 'both', hits: 2, weight: 7, telegraph: 'He wheels the deck gun around.' })
    ],
    drops: [['ironsheet', 1]]
  });
  E('trimmet', 'Trimmet', {
    tier: 4, hp: 52, atk: 7, def: 2, flags: ['ground', 'miniboss'], weak: ['water'], resist: ['cut'],
    sp: 52, coins: 36,
    tattle: 'Trimmet, understudy to the Great Kerf and desperate about it. 52 HP, 7 Attack. She copies whatever you did last turn, so keep changing your mind.',
    moves: [
      m('Snip Flurry', 4, { hits: 3, element: 'cut' }),
      m('Understudy', 5, { copyLast: true, weight: 8, telegraph: 'She watches your hands very carefully.' }),
      m('Spotlight', 3, { target: 'both', status: { type: 'dizzy', chance: .7, turns: 2 }, weight: 6 })
    ],
    drops: [['swiftdraft', 1]]
  });
  E('footnote_fenn', 'Footnote Fenn', {
    tier: 5, hp: 58, atk: 7, def: 3, flags: ['air', 'miniboss'], weak: ['fire', 'light'], resist: ['ink'],
    sp: 58, coins: 40,
    tattle: 'Footnote Fenn, who has read every book in Glyphhaven and remembers all the worst parts. 58 HP, 7 Attack, 3 Defence. He buries you in citations — clear the small ones or they add up fast.',
    moves: [
      m('Citation Storm', 3, { target: 'both', hits: 2 }),
      m('Append', 0, { summon: 'footnote', count: 2, weight: 9, telegraph: 'He appends two more notes.' }),
      m('Errata', 7, { element: 'ink', status: { type: 'silence', chance: .6, turns: 2 }, weight: 7 })
    ],
    drops: [['tonicwash', 1]]
  });
  E('fenrisk', 'Fenrisk', {
    tier: 6, hp: 66, atk: 8, def: 3, flags: ['ground', 'icy', 'miniboss'], weak: ['fire'], resist: ['ice'], immune: ['freeze'],
    sp: 66, coins: 46,
    tattle: 'Fenrisk, the white hound of the Frostfold passes. 66 HP, 8 Attack, 3 Defence. It hunts whoever is weakest, so keep your partner\'s HP up.',
    moves: [
      m('Rime Fang', 8, { element: 'ice', status: { type: 'freeze', chance: .4, turns: 2 } }),
      m('Cull', 10, { target: 'weakest', weight: 8, telegraph: 'It fixes on the weaker of you.' }),
      m('Blizzard Howl', 4, { target: 'both', element: 'ice', debuff: { atk: -2, turns: 3 }, weight: 6 })
    ],
    drops: [['glacierjelly', 1]]
  });
  E('foreman_ratchet', 'Foreman Ratchet', {
    tier: 7, hp: 74, atk: 9, def: 5, flags: ['ground', 'heavy', 'miniboss'], weak: ['shock', 'water'], resist: ['blunt', 'cut'], immune: ['poison', 'sleep'],
    sp: 74, coins: 52,
    tattle: 'Foreman Ratchet, who runs the Foilworks floor and has never once been under budget. 74 HP, 9 Attack and a brutal 5 Defence. Piercing and shock are the only things that touch him.',
    moves: [
      m('Rivet Gun', 5, { hits: 2, pierce: true }),
      m('Assembly Line', 0, { summon: 'coglet', count: 2, weight: 7, telegraph: 'The line starts up behind him.' }),
      m('Overpressure', 9, { target: 'both', weight: 6, cond: 'lowhp', telegraph: 'Every gauge redlines.' })
    ],
    drops: [['mirrorfoil', 1]]
  });
  E('captain_sable', 'Captain Sable', {
    tier: 8, hp: 88, atk: 10, def: 4, flags: ['ground', 'miniboss'], weak: ['light'], resist: ['ink', 'cut'], immune: ['inked', 'sleep'],
    sp: 88, coins: 60,
    tattle: 'Captain Sable of the Blotguard. 88 HP, 10 Attack, 4 Defence. She fights cleanly and hits like a printing press. Light is her only real weakness, and she knows it.',
    moves: [
      m('Sable Cut', 10, { element: 'cut' }),
      m('Ink Veil', 0, { guard: 4, evade: .4, turns: 2, weight: 6, telegraph: 'Ink pools around her.' }),
      m('Condemn', 6, { target: 'both', element: 'ink', status: { type: 'inked', chance: .8, turns: 3 }, weight: 7 })
    ],
    drops: [['lastpage', 1]]
  });

  /* ===================== CHAPTER BOSSES ===================================
     Bosses have `phases`: when HP drops below `at` (fraction), the phase
     fires once — printing a line, applying stat mods, and swapping movesets. */
  E('bramblejack', 'Bramblejack', {
    tier: 1, hp: 45, atk: 5, def: 1, flags: ['ground', 'boss'], weak: ['fire'], immune: ['tangled', 'sleep'],
    sp: 60, coins: 40, noRun: true,
    tattle: 'Bramblejack, the Thorn Marionette. 45 HP, 5 Attack, 1 Defence. Someone else is pulling those strings — cut them and he loses his rhythm. Fire is his weakness, and he hates being off-balance.',
    moves: [
      m('Puppet Swipe', 5),
      m('Thorn Volley', 3, { target: 'both', hits: 2, weight: 8 }),
      m('String Pull', 0, { atkBuff: 2, target: 'self', weight: 5, telegraph: 'The strings above him go taut.' })
    ],
    phases: [{
      at: .5, say: 'Bramblejack: "CUT? CUT MY STRINGS? I DANCE FOR NO ONE—"',
      mods: { atk: 2 }, add: [m('Frenzy', 4, { target: 'both', hits: 2 }), m('Root Cage', 3, { status: { type: 'tangled', chance: .7, turns: 2 } })]
    }],
    drops: [['seal1', 1]]
  });
  E('pyra_sizzlefold', 'Duchess Pyra Sizzlefold', {
    tier: 2, hp: 62, atk: 6, def: 2, flags: ['ground', 'fiery', 'boss'], weak: ['water'], resist: ['fire'], immune: ['burn', 'sleep'],
    sp: 90, coins: 55, noRun: true,
    tattle: 'Duchess Pyra Sizzlefold, who rules the Emberfold and dresses for it. 62 HP, 6 Attack, 2 Defence, and permanently alight — contact attacks burn you. Douse her and she loses both the Defence and the temper.',
    moves: [
      m('Cinder Fan', 4, { target: 'both', element: 'fire' }),
      m('Sizzling Rebuke', 6, { element: 'fire', status: { type: 'burn', chance: .6, turns: 3 }, weight: 9 }),
      m('Court Summons', 0, { summon: 'emberling', count: 2, weight: 6, telegraph: 'She claps twice for the court.' })
    ],
    phases: [{
      at: .45, say: 'Pyra: "You have RUINED the drapes. Very well — we burn the whole wing."',
      mods: { atk: 2, def: -1 }, add: [m('Inferno Waltz', 5, { target: 'both', element: 'fire', hits: 2 })]
    }],
    drops: [['seal2', 1]]
  });
  E('nautilus_grim', 'Nautilus Grim', {
    tier: 3, hp: 80, atk: 7, def: 3, flags: ['air', 'boss'], weak: ['shock'], resist: ['water'], immune: ['soggy', 'tangled'],
    sp: 120, coins: 70, noRun: true,
    tattle: 'Nautilus Grim, the coil that sank the Sunken Ream. 80 HP, 7 Attack, 3 Defence. It coils to raise its Defence and uncoils to strike. Shock the water and the whole length of it lights up.',
    moves: [
      m('Coil Crush', 7),
      m('Undertow', 4, { target: 'both', element: 'water', status: { type: 'soggy', chance: .6, turns: 3 }, weight: 8 }),
      m('Deep Coil', 0, { guard: 4, turns: 2, weight: 7, telegraph: 'It winds in on itself.' })
    ],
    phases: [{
      at: .5, say: 'The coil unwinds to its full length. The water goes very still.',
      mods: { atk: 2, def: -2 }, add: [m('Maelstrom', 6, { target: 'both', element: 'water', hits: 2 })]
    }, {
      at: .2, say: 'Nautilus Grim: "...ssssalt. and. sssssilence."',
      mods: { atk: 3 }, add: [m('Abyss Bite', 12, { target: 'hero' })]
    }],
    drops: [['seal3', 1]]
  });
  E('great_kerf', 'The Great Kerf', {
    tier: 4, hp: 96, atk: 8, def: 3, flags: ['ground', 'boss'], weak: ['water'], resist: ['cut'], immune: ['crumple'],
    sp: 150, coins: 85, noRun: true,
    tattle: 'The Great Kerf, ringmaster of the Cardstock Carnival. 96 HP, 8 Attack, 3 Defence. He plays to the crowd — every cheer he earns makes him stronger, so keep the audience on YOUR side.',
    moves: [
      m('Ringmaster\'s Cut', 8, { element: 'cut' }),
      m('Crowd Work', 0, { stealAudience: 20, atkBuff: 1, target: 'self', weight: 8, telegraph: 'He turns to the crowd and bows.' }),
      m('Send in the Acts', 0, { summon: 'clipling', count: 2, weight: 6 })
    ],
    phases: [{
      at: .55, say: 'Kerf: "LADIES AND GENTLEFOLD — the SECOND act!"',
      mods: { atk: 2 }, add: [m('Twelve-Blade Finale', 4, { target: 'both', hits: 3, element: 'cut' })]
    }, {
      at: .22, say: 'Kerf: "No. No, no, no. They are looking at YOU."',
      mods: { atk: 3, def: -1 }, add: [m('Curtain Drop', 13, { target: 'hero' })]
    }],
    drops: [['seal4', 1]]
  });
  E('the_redactor', 'The Redactor', {
    tier: 5, hp: 110, atk: 9, def: 4, flags: ['air', 'boss'], weak: ['light', 'fire'], resist: ['ink'], immune: ['inked', 'silence'],
    sp: 190, coins: 100, noRun: true,
    tattle: 'The Redactor. 110 HP, 9 Attack, 4 Defence. It removes things: your buffs, your Forms, and eventually your moves. It cannot redact what it cannot read, so Lumen\'s light is your lifeline.',
    moves: [
      m('Black Bar', 9, { element: 'ink' }),
      m('Redact', 0, { target: 'both', dispel: true, status: { type: 'silence', chance: .8, turns: 3 }, weight: 9, telegraph: 'A bar slides across the page.' }),
      m('Classified', 5, { target: 'both', element: 'ink', status: { type: 'inked', chance: .8, turns: 3 }, weight: 7 })
    ],
    phases: [{
      at: .6, say: 'THE REDACTOR: "███ ███ ██ ████ ████ ██████."',
      mods: { atk: 2 }, add: [m('Full Censure', 6, { target: 'both', hits: 2, element: 'ink' })]
    }, {
      at: .25, say: 'The bars peel away. Underneath, there is nothing written at all.',
      mods: { def: -3, atk: 3 }, add: [m('Unwritten', 14, { target: 'random', pierce: true })]
    }],
    drops: [['seal5', 1]]
  });
  E('crinkle_wyrm', 'Crinkle, the Glacier Wyrm', {
    tier: 6, hp: 130, atk: 10, def: 4, flags: ['air', 'icy', 'boss'], weak: ['fire'], resist: ['ice', 'blunt'], immune: ['freeze', 'soggy'],
    sp: 240, coins: 120, noRun: true,
    tattle: 'Crinkle, the Glacier Wyrm. 130 HP, 10 Attack, 4 Defence. It armours itself in fresh ice every few turns — melt the shell with fire before you try anything else, or you will be here all week.',
    moves: [
      m('Rime Coil', 10, { element: 'ice' }),
      m('Glacier Shell', 0, { guard: 5, turns: 3, weight: 9, telegraph: 'Fresh ice sheets over its scales.' }),
      m('Hailstorm', 5, { target: 'both', element: 'ice', hits: 2, weight: 8 })
    ],
    phases: [{
      at: .55, say: 'The shell cracks. Something older is moving underneath it.',
      mods: { atk: 2 }, add: [m('Frostbite Lash', 7, { target: 'both', element: 'ice', status: { type: 'freeze', chance: .5, turns: 2 } })]
    }, {
      at: .22, say: 'Crinkle: "warm... thing... STOP being WARM..."',
      mods: { atk: 4, def: -2 }, add: [m('Absolute Zero', 16, { target: 'random', element: 'ice' })]
    }],
    drops: [['seal6', 1]]
  });
  E('chief_ampere', 'Chief Engineer Ampere', {
    tier: 7, hp: 150, atk: 11, def: 5, flags: ['ground', 'electric', 'heavy', 'boss'], weak: ['water'], resist: ['blunt', 'cut'], immune: ['shock', 'poison', 'sleep', 'tangled'],
    sp: 300, coins: 140, noRun: true,
    tattle: 'Chief Engineer Ampere. 150 HP, 11 Attack, 5 Defence, and live to the touch. Every contact attack shocks you back. Water is the great equaliser — Bloop can flood the floor and short the whole chassis.',
    moves: [
      m('Piston Hammer', 11),
      m('Grounding Rod', 0, { guard: 5, thorns: 3, turns: 3, weight: 8, telegraph: 'It drives a rod into the floor.' }),
      m('Arc Flash', 6, { target: 'both', element: 'shock', pierce: true, weight: 9 }),
      m('Deploy Coglets', 0, { summon: 'coglet', count: 2, weight: 5 })
    ],
    phases: [{
      at: .6, say: 'AMPERE: "EFFICIENCY BELOW TARGET. SWITCHING TO OVERDRIVE."',
      mods: { atk: 3 }, add: [m('Overdrive Slam', 8, { target: 'both', hits: 2 })]
    }, {
      at: .25, say: 'AMPERE: "I WAS BUILT TO PRESS. I WILL PRESS UNTIL I AM SWITCHED OFF."',
      mods: { atk: 4, def: -2 }, add: [m('Total Discharge', 18, { target: 'both', element: 'shock', pierce: true })]
    }],
    drops: [['seal7', 1]]
  });
  E('duke_smudge', 'Duke Smudge', {
    tier: 8, hp: 170, atk: 12, def: 5, flags: ['ground', 'boss'], weak: ['light'], resist: ['ink', 'cut'], immune: ['inked', 'sleep', 'dizzy'],
    sp: 400, coins: 180, noRun: true,
    tattle: 'Duke Smudge. 170 HP, 12 Attack, 5 Defence. Everything he does is a signature — he writes conditions onto the stage and then enforces them. He is also, and he would hate this, only ink. Light undoes ink.',
    moves: [
      m('Signature', 12, { element: 'ink' }),
      m('Clause of Silence', 0, { target: 'both', status: { type: 'silence', chance: .9, turns: 3 }, weight: 8, telegraph: 'He inscribes a clause in the air.' }),
      m('Blotguard', 0, { summon: 'nibguard', weight: 6 }),
      m('Contract', 7, { target: 'both', element: 'ink', drain: true, weight: 8 })
    ],
    phases: [{
      at: .6, say: 'Smudge: "You are a smear on a very fine page, courier. Let me correct that."',
      mods: { atk: 3 }, add: [m('Overwrite', 9, { target: 'both', dispel: true })]
    }, {
      at: .25, say: 'Smudge: "I served the Blank so it would spare ME. Do you understand? It spares NO ONE."',
      mods: { atk: 4, def: -2 }, add: [m('Final Draft', 20, { target: 'hero', element: 'ink' })]
    }],
    drops: [['crown_core', 1]]
  });
  E('smudge_ascendant', 'Smudge Ascendant', {
    tier: 8, hp: 210, atk: 14, def: 6, flags: ['ground', 'boss'], weak: ['light'], resist: ['ink', 'cut', 'blunt'], immune: ['inked', 'sleep', 'dizzy', 'tangled'],
    sp: 500, coins: 220, noRun: true,
    tattle: 'Smudge Ascendant — the Duke with the Blank pouring through him. 210 HP, 14 Attack, 6 Defence. He is not steering any more. Light still works; keep the Seals ready and do not stop moving.',
    moves: [
      m('Ascendant Blot', 14, { element: 'ink' }),
      m('Unmaking Hand', 8, { target: 'both', dispel: true, pierce: true, weight: 9 }),
      m('Voidcall', 0, { summon: 'erasure', weight: 6 }),
      m('The Last Word', 22, { target: 'hero', weight: 4, cond: 'heroLow', telegraph: 'Everything on the page goes quiet.' })
    ],
    phases: [{
      at: .5, say: 'SMUDGE ASCENDANT: "I AM THE LAST LINE. AFTER ME, MARGIN."',
      mods: { atk: 3, def: -1 }, add: [m('Margin Collapse', 9, { target: 'both', hits: 2, pierce: true })]
    }],
    drops: []
  });
  E('the_blank', 'The Blank', {
    tier: 8, hp: 260, atk: 15, def: 7, flags: ['air', 'boss'], weak: ['ink'], resist: ['light', 'fire', 'ice', 'shock', 'cut', 'blunt', 'water'],
    immune: ['inked', 'sleep', 'dizzy', 'tangled', 'poison', 'burn', 'freeze', 'crumple', 'shrink', 'silence'],
    sp: 900, coins: 400, noRun: true,
    tattle: 'The Blank. 260 HP, 15 Attack, 7 Defence, and it resists nearly everything — because nearly everything is *something*. Ink is the one weapon it has no answer to. Write on it. Keep writing on it.',
    moves: [
      m('Erase', 15, { pierce: true }),
      m('White Out', 8, { target: 'both', dispel: true, status: { type: 'silence', chance: .7, turns: 2 }, weight: 9 }),
      m('Unpage', 10, { target: 'both', pierce: true, weight: 8 }),
      m('Nothing At All', 0, { guard: 6, evade: .5, turns: 2, weight: 6, telegraph: 'The page in front of you goes completely empty.' })
    ],
    phases: [{
      at: .7, say: 'THE BLANK: "there was nothing before you. i am simply patient."',
      mods: { atk: 2 }, add: [m('Silence Absolute', 11, { target: 'both', pierce: true })]
    }, {
      at: .4, say: 'THE BLANK: "you keep making MARKS. why do you keep making MARKS."',
      mods: { atk: 3, def: -1 }, add: [m('Full Erasure', 13, { target: 'both', dispel: true, pierce: true })]
    }, {
      at: .15, say: 'THE BLANK: "...stop. STOP WRITING. STOP—"',
      mods: { atk: 5, def: -3 }, add: [m('Last Blank', 24, { target: 'hero', pierce: true })]
    }],
    drops: []
  });

  /* ===================== SUPERBOSSES ====================================== */
  E('origami_sovereign', 'The Origami Sovereign', {
    tier: 8, hp: 300, atk: 14, def: 6, flags: ['ground', 'boss'], weak: [], resist: ['cut', 'blunt', 'ink'],
    immune: ['sleep', 'dizzy', 'tangled', 'crumple', 'shrink'],
    sp: 800, coins: 500, noRun: true,
    tattle: 'The Origami Sovereign, champion of the Folded Coliseum since before the Crown was torn. 300 HP, 14 Attack, 6 Defence. It refolds itself into a new stance every few turns and each stance answers a different strategy. There is no single trick. There is only playing well.',
    moves: [
      m('Sovereign Fold', 14),
      m('Crane Stance', 0, { guard: 3, evade: .5, turns: 3, weight: 8, telegraph: 'It folds into a crane.' }),
      m('Dart Stance', 0, { atkBuff: 4, turns: 3, target: 'self', weight: 8, telegraph: 'It folds into a dart.' }),
      m('Thousand Cranes', 5, { target: 'both', hits: 3, weight: 7 })
    ],
    phases: [{
      at: .5, say: 'The Sovereign inclines its head. "Adequate. Again."', mods: { atk: 3 },
      add: [m('Perfect Crease', 18, { target: 'random', pierce: true })]
    }],
    drops: [['sovereignroast', 1]]
  });
  E('first_draft', 'The First Draft', {
    tier: 8, hp: 240, atk: 13, def: 5, flags: ['ground', 'boss'], weak: ['ink'], resist: ['blunt'],
    immune: ['sleep', 'silence'],
    sp: 700, coins: 400, noRun: true,
    tattle: 'The First Draft — the version of you that got crumpled and thrown away. 240 HP, 13 Attack, 5 Defence. It knows every move you know, because it learned them first. It copies your last action every single turn. The only way to beat it is to stop being predictable.',
    moves: [
      m('Rough Stomp', 13),
      m('Mirror', 10, { copyLast: true, weight: 14, telegraph: 'It moves exactly as you did.' }),
      m('Crumpled Fury', 6, { target: 'both', hits: 2, weight: 7 })
    ],
    phases: [{
      at: .4, say: 'The First Draft: "you got to be the FAIR COPY. i got the BIN."', mods: { atk: 4 },
      add: [m('Revision', 16, { target: 'hero', pierce: true })]
    }],
    drops: [['lastpage', 1]]
  });
  E('vermillion', 'Vermillion, the Unbound Blot', {
    tier: 8, hp: 400, atk: 17, def: 7, flags: ['air', 'boss'], weak: [], resist: ['ink', 'cut', 'blunt', 'fire', 'ice', 'shock', 'water'],
    immune: ['sleep', 'dizzy', 'tangled', 'crumple', 'shrink', 'poison', 'burn', 'freeze', 'silence', 'inked'],
    sp: 1500, coins: 900, noRun: true,
    tattle: 'Vermillion, the Unbound Blot. 400 HP, 17 Attack, 7 Defence, and resistant to everything you own. This is the fight the Coliseum warns people about. Duets, Seals, and perfect action commands — nothing less will do.',
    moves: [
      m('Unbound Lash', 17, { pierce: true }),
      m('Crimson Flood', 10, { target: 'both', hits: 2, weight: 9 }),
      m('Rewrite Reality', 0, { dispel: true, target: 'both', atkBuff: 3, weight: 8, telegraph: 'The stage itself starts to run.' }),
      m('Seven Coils', 6, { target: 'both', hits: 3, weight: 8 })
    ],
    phases: [{
      at: .66, say: 'VERMILLION: "the Crown bound me for SEVEN HUNDRED YEARS."', mods: { atk: 3 },
      add: [m('Scarlet Ruin', 14, { target: 'both', pierce: true })]
    }, {
      at: .33, say: 'VERMILLION: "and you think a COURIER holds it now?"', mods: { atk: 5, def: -2 },
      add: [m('Unbinding', 26, { target: 'hero', pierce: true })]
    }],
    drops: [['sevenlayer', 1]]
  });

  function get(id) { return db[id]; }
  function all() { return db; }
  function list() { var a = []; for (var k in db) a.push(db[k]); return a; }
  function byTier(t) { return list().filter(function (e) { return e.tier === t && !e.flags.some(function (f) { return f === 'boss' || f === 'miniboss'; }); }); }

  return { get: get, all: all, list: list, byTier: byTier, has: has, m: m };
})();
