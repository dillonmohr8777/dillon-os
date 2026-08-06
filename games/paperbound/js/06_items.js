/* ==========================================================================
   PAPERBOUND — 06_items.js
   Consumables, key items, cooking recipes, and the procedural icon renderer
   they all share.
   ========================================================================== */
'use strict';

PB.Items = (function () {
  var P = PB.Paper, U = PB.U;
  var db = {};

  /* ---- icons ------------------------------------------------------------ */
  /* Every icon is drawn into a 32x32 box centred on (x, y). */
  var ICON = {
    leaf: function (c, a, b) {
      P.poly(c, [[0, 11], [-10, -2], [-3, -12], [8, -9], [11, 2]], a, null, 2);
      P.line(c, [[0, 11], [2, -8]], b, 1.6);
    },
    berry: function (c, a, b) {
      P.ell(c, -3, 3, 7, 7, a, null, 2); P.ell(c, 5, 1, 6, 6, U.shade(a, .12), null, 2);
      P.poly(c, [[0, -5], [-7, -12], [3, -10]], b, null, 1.6);
    },
    bottle: function (c, a, b) {
      P.rr(c, -6, -12, 12, 6, 2, b, null, 1.8);
      P.rr(c, -8, -6, 16, 20, 5, a, null, 2.2);
      P.ell(c, -3, 2, 2.5, 3.5, 'rgba(255,255,255,.5)', null);
    },
    flask: function (c, a, b) {
      P.poly(c, [[-4, -13], [4, -13], [10, 12], [-10, 12]], a, null, 2.2);
      P.rr(c, -5, -15, 10, 4, 2, b, null, 1.6);
      P.ell(c, 0, 6, 6, 3, U.shade(a, .3), null, 1.2);
    },
    cake: function (c, a, b) {
      P.rr(c, -11, -2, 22, 14, 3, a, null, 2.2);
      P.rr(c, -11, -8, 22, 7, 3, b, null, 2);
      P.ell(c, 0, -11, 3, 3, '#e8506a', null, 1.4);
    },
    bomb: function (c, a, b) {
      P.ell(c, 0, 3, 11, 11, a, null, 2.4);
      P.rr(c, -3, -11, 6, 5, 2, b, null, 1.6);
      P.line(c, [[0, -11], [6, -17]], '#c8a06a', 2);
      P.ell(c, -4, -1, 3, 2.5, 'rgba(255,255,255,.4)', null);
    },
    star: function (c, a, b) { P.star(c, 0, 0, 13, 5.5, 5, 0, a, b, 2); },
    card: function (c, a, b) {
      P.rr(c, -9, -12, 18, 24, 2, '#fdf6e3', null, 2);
      P.rr(c, -6, -9, 12, 12, 1, a, null, 1.4);
      P.line(c, [[-6, 6], [6, 6]], b, 1.6);
    },
    key: function (c, a, b) {
      P.ell(c, -4, -6, 6, 6, null, a, 3);
      P.line(c, [[-1, -2], [7, 10]], a, 3.2);
      P.line(c, [[4, 6], [8, 3]], a, 2.6);
      P.line(c, [[7, 10], [11, 7]], a, 2.6);
    },
    seal: function (c, a, b) {
      P.ell(c, 0, 0, 12, 12, b, null, 2);
      P.star(c, 0, 0, 9, 3.6, 5, 0, a, null, 1.6);
    },
    cloth: function (c, a, b) {
      P.poly(c, [[-11, -8], [11, -10], [9, 9], [-9, 11]], a, null, 2.2);
      P.line(c, [[-6, -4], [6, -6]], b, 1.6);
      P.line(c, [[-6, 2], [6, 0]], b, 1.6);
    },
    coil: function (c, a, b) {
      for (var i = 0; i < 4; i++) P.ell(c, 0, -8 + i * 5.5, 10 - i, 3.4, a, null, 1.8);
    },
    shell: function (c, a, b) {
      P.ell(c, 0, 2, 12, 10, a, null, 2.2);
      for (var i = -2; i <= 2; i++) P.line(c, [[0, -8], [i * 5, 11]], b, 1.4);
    },
    gear: function (c, a, b) {
      for (var i = 0; i < 6; i++) { var an = i / 6 * Math.PI * 2; P.rr(c, Math.cos(an) * 10 - 3, Math.sin(an) * 10 - 3, 6, 6, 1, a, null, 1.4); }
      P.ell(c, 0, 0, 7.5, 7.5, a, null, 2); P.ell(c, 0, 0, 3, 3, b, null, 1.4);
    },
    book: function (c, a, b) {
      P.rr(c, -10, -12, 20, 24, 2, a, null, 2.2);
      P.rr(c, -7, -9, 14, 18, 1, '#f6efd8', null, 1.2);
      P.line(c, [[0, -9], [0, 9]], b, 1.6);
    },
    orb: function (c, a, b) {
      P.ell(c, 0, 0, 11, 11, a, null, 2.2);
      P.ell(c, -3.5, -3.5, 3.5, 3, 'rgba(255,255,255,.55)', null);
      P.ell(c, 0, 0, 11, 11, null, b, 1.4);
    },
    scroll: function (c, a, b) {
      P.rr(c, -10, -9, 20, 18, 2, '#f4e8cc', null, 2);
      P.ell(c, -10, 0, 3, 9.5, a, null, 1.8);
      P.ell(c, 10, 0, 3, 9.5, a, null, 1.8);
      P.line(c, [[-5, -3], [5, -3]], b, 1.4); P.line(c, [[-5, 2], [3, 2]], b, 1.4);
    },
    bolt: function (c, a, b) {
      P.poly(c, [[2, -13], [-8, 2], [-1, 2], [-3, 13], [8, -2], [1, -2]], a, b, 1.8);
    },
    drop: function (c, a, b) {
      P.poly(c, [[0, -13], [8, 2], [0, 12], [-8, 2]], a, null, 2.2);
      P.ell(c, -2.5, 3, 2.5, 3, 'rgba(255,255,255,.5)', null);
    },
    crown: function (c, a, b) {
      P.poly(c, [[-11, 6], [-11, -4], [-5, 2], [0, -9], [5, 2], [11, -4], [11, 6]], a, null, 2);
      P.ell(c, 0, 6, 11, 2.6, b, null, 1.4);
    }
  };

  function drawIcon(ctx, id, x, y, size) {
    var it = db[id];
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(size / 32, size / 32);
    if (it && it.ic && ICON[it.ic[0]]) ICON[it.ic[0]](ctx, it.ic[1], it.ic[2] || U.shade(it.ic[1], -0.4));
    else ICON.card('#9aa3b0', '#5a626e');
    ctx.restore();
  }

  /* ---- definitions ------------------------------------------------------
     type:  'heal'   usable anywhere
            'battle' battle only
            'key'    quest item, never consumed by the player
     fx:    { hp, fp, sp, dmg, target, element, status, cure, buff, revive, ... }
     ------------------------------------------------------------------------ */
  function I(id, name, o) { o.id = id; o.name = name; db[id] = o; return o; }

  /* --- restoratives --- */
  I('pulpberry', 'Pulp Berry', { ic: ['berry', '#e8506a'], type: 'heal', price: 5, sell: 2, fx: { hp: 5 }, desc: 'A tart little berry. Restores 5 HP.' });
  I('honeyleaf', 'Honeyleaf', { ic: ['leaf', '#f5c02e'], type: 'heal', price: 6, sell: 3, fx: { fp: 5 }, desc: 'Sticky and sweet. Restores 5 FP.' });
  I('reamcake', 'Ream Cake', { ic: ['cake', '#f0b0c0', '#f7ecd8'], type: 'heal', price: 12, sell: 5, fx: { hp: 10 }, desc: 'Layered like a fresh ream. Restores 10 HP.' });
  I('inktea', 'Ink Tea', { ic: ['bottle', '#7b4fa0', '#4a3560'], type: 'heal', price: 14, sell: 6, fx: { fp: 8 }, desc: 'Bitter, bracing. Restores 8 FP.' });
  I('foldroll', 'Fold Roll', { ic: ['cake', '#e8b96a', '#c8964a'], type: 'heal', price: 22, sell: 9, fx: { hp: 10, fp: 5 }, desc: 'Restores 10 HP and 5 FP.' });
  I('creambun', 'Cream Bun', { ic: ['cake', '#f7ecd8', '#f0d8a0'], type: 'heal', price: 30, sell: 12, fx: { hp: 15 }, desc: 'Restores 15 HP.' });
  I('deeproot', 'Deep Root Tonic', { ic: ['flask', '#4f9a48', '#8a5a30'], type: 'heal', price: 40, sell: 16, fx: { fp: 15 }, desc: 'Restores 15 FP.' });
  I('grandfeast', 'Grand Feast', { ic: ['cake', '#f5c02e', '#e8506a'], type: 'heal', price: 90, sell: 40, fx: { hp: 30, fp: 30 }, desc: 'A whole spread. Restores 30 HP and 30 FP.' });
  I('lifeleaf', 'Life Leaf', { ic: ['leaf', '#7fe0d0'], type: 'heal', price: 60, sell: 25, fx: { revive: true, hp: 10 }, desc: 'Held in reserve, it revives you with 10 HP the moment you fall.' });
  I('lastpage', 'Last Page', { ic: ['scroll', '#f0a63c', '#8a5a30'], type: 'heal', price: 120, sell: 50, fx: { revive: true, hp: 30, fp: 10 }, desc: 'Revives you with 30 HP and 10 FP when you fall.' });
  I('sealwater', 'Seal Water', { ic: ['drop', '#ffe066', '#c8963c'], type: 'heal', price: 45, sell: 18, fx: { sp: 200 }, desc: 'Restores 2 Seal Energy.' });

  /* --- cures --- */
  I('antidote', 'Antidote Leaf', { ic: ['leaf', '#8fcf52'], type: 'heal', price: 8, sell: 3, fx: { cure: ['poison'] }, desc: 'Cures Poison.' });
  I('drycloth', 'Dry Cloth', { ic: ['cloth', '#f2e6cc'], type: 'heal', price: 8, sell: 3, fx: { cure: ['soggy', 'burn'] }, desc: 'Cures Soggy and Burn.' });
  I('smellingink', 'Smelling Ink', { ic: ['bottle', '#57b8ea', '#2f6a9a'], type: 'heal', price: 10, sell: 4, fx: { cure: ['sleep', 'dizzy'] }, desc: 'Cures Sleep and Dizzy.' });
  I('tonicwash', 'Tonic Wash', { ic: ['flask', '#7fe0d0', '#39b3a6'], type: 'heal', price: 28, sell: 11, fx: { cureAll: true }, desc: 'Washes away every negative status.' });
  I('pressiron', 'Pressing Iron', { ic: ['gear', '#c8d2dc', '#6f7a8c'], type: 'heal', price: 18, sell: 7, fx: { cure: ['crumple', 'shrink'] }, desc: 'Cures Crumpled and Shrunk.' });

  /* --- offensive --- */
  I('wadbomb', 'Wad Bomb', { ic: ['bomb', '#4a4258'], type: 'battle', price: 12, sell: 5, fx: { dmg: 6, target: 'one' }, desc: 'Deals 6 damage to one foe.' });
  I('bigwadbomb', 'Big Wad Bomb', { ic: ['bomb', '#2a1c3c'], type: 'battle', price: 34, sell: 14, fx: { dmg: 7, target: 'all' }, desc: 'Deals 7 damage to every foe.' });
  I('emberpod', 'Ember Pod', { ic: ['orb', '#ff7a2e', '#c04a10'], type: 'battle', price: 16, sell: 6, fx: { dmg: 6, target: 'all', element: 'fire', status: { type: 'burn', chance: .5, turns: 3 } }, desc: 'Burns all foes for 6 fire damage.' });
  I('frostnut', 'Frost Nut', { ic: ['orb', '#9fd8f0', '#4f8aa8'], type: 'battle', price: 16, sell: 6, fx: { dmg: 5, target: 'all', element: 'ice', status: { type: 'freeze', chance: .4, turns: 2 } }, desc: 'Chills all foes for 5 ice damage.' });
  I('thunderrag', 'Thunder Rag', { ic: ['bolt', '#ffe066', '#c8963c'], type: 'battle', price: 18, sell: 7, fx: { dmg: 5, target: 'all', element: 'shock', pierce: true }, desc: 'Deals 5 piercing shock damage to all foes.' });
  I('papercutstar', 'Papercut Star', { ic: ['star', '#f0f4f8', '#c8443c'], type: 'battle', price: 20, sell: 8, fx: { dmg: 5, target: 'one', element: 'cut', pierce: true }, desc: 'Ignores defence. 5 damage to one foe.' });
  I('sleepysheet', 'Sleepy Sheet', { ic: ['cloth', '#c8a2e8'], type: 'battle', price: 20, sell: 8, fx: { target: 'all', status: { type: 'sleep', chance: .7, turns: 3 } }, desc: 'Tries to put every foe to sleep.' });
  I('dizzydust', 'Dizzy Dust', { ic: ['drop', '#f5c02e', '#8a6a12'], type: 'battle', price: 15, sell: 6, fx: { target: 'all', status: { type: 'dizzy', chance: .7, turns: 3 } }, desc: 'Tries to make every foe Dizzy.' });
  I('tanglet', 'Tangle Twine', { ic: ['coil', '#a9713f'], type: 'battle', price: 24, sell: 10, fx: { target: 'one', status: { type: 'tangled', chance: .8, turns: 2 } }, desc: 'Binds one foe so it cannot act.' });
  I('inkbomb', 'Ink Bomb', { ic: ['bomb', '#241a34'], type: 'battle', price: 22, sell: 9, fx: { dmg: 4, target: 'all', element: 'ink', status: { type: 'inked', chance: .8, turns: 3 } }, desc: 'Blinds all foes and deals 4 damage.' });
  I('venomvial', 'Venom Vial', { ic: ['bottle', '#8fcf52', '#3f6a2c'], type: 'battle', price: 20, sell: 8, fx: { dmg: 2, target: 'one', status: { type: 'poison', chance: .9, turns: 5 } }, desc: 'Poisons one foe badly.' });
  I('shreddisc', 'Shred Disc', { ic: ['gear', '#cfd6de', '#7c848f'], type: 'battle', price: 40, sell: 16, fx: { dmg: 8, target: 'one', element: 'cut' }, desc: 'A whirling blade. 8 damage to one foe.' });

  /* --- buffs --- */
  I('boldbrew', 'Bold Brew', { ic: ['flask', '#e0483c', '#8a2018'], type: 'battle', price: 26, sell: 10, fx: { buff: { type: 'atkUp', amt: 2, turns: 3 } }, desc: 'Attack +2 for 3 turns.' });
  I('ironsheet', 'Iron Sheet', { ic: ['card', '#9aa3b0', '#4a5260'], type: 'battle', price: 26, sell: 10, fx: { buff: { type: 'defUp', amt: 2, turns: 3 } }, desc: 'Defence +2 for 3 turns.' });
  I('swiftdraft', 'Swift Draft', { ic: ['cloth', '#8fd0f0'], type: 'battle', price: 30, sell: 12, fx: { buff: { type: 'dodgy', amt: 1, turns: 3 } }, desc: 'Half of all attacks miss you for 3 turns.' });
  I('focusink', 'Focus Ink', { ic: ['bottle', '#5a4fb0', '#2f2a70'], type: 'battle', price: 24, sell: 9, fx: { buff: { type: 'charge', amt: 3, turns: 99 } }, desc: 'Your next attack deals 3 extra damage.' });
  I('mirrorfoil', 'Mirror Foil', { ic: ['card', '#e8f0f8', '#8e97a6'], type: 'battle', price: 44, sell: 18, fx: { buff: { type: 'thorns', amt: 2, turns: 3 } }, desc: 'Reflects 2 damage back at melee attackers for 3 turns.' });
  I('secondwindvial', 'Second Wind', { ic: ['drop', '#7fe0d0', '#39b3a6'], type: 'battle', price: 50, sell: 20, fx: { buff: { type: 'regen', amt: 3, turns: 4 } }, desc: 'Recover 3 HP at the end of each of your turns.' });

  /* --- utility --- */
  I('escapenote', 'Escape Note', { ic: ['scroll', '#8fcf52', '#3f6a2c'], type: 'battle', price: 10, sell: 4, fx: { escape: true }, desc: 'Flee any battle instantly. Bosses excepted.' });
  I('repelpowder', 'Repel Powder', { ic: ['drop', '#c8a2e8', '#5a4fb0'], type: 'heal', price: 24, sell: 10, fx: { repel: 3600 }, desc: 'Weak foes avoid you for a while.' });
  I('mysterywad', 'Mystery Wad', { ic: ['orb', '#f0e8c0', '#a89a78'], type: 'battle', price: 16, sell: 6, fx: { mystery: true }, desc: 'Nobody knows. Roll the dice.' });
  I('crowdcandy', 'Crowd Candy', { ic: ['star', '#f07a8a', '#c8443c'], type: 'battle', price: 18, sell: 7, fx: { audience: 30 }, desc: 'Wins over 30 audience members at once.' });

  /* --- cooked-only dishes --- */
  I('foldcake', 'Foldover Cake', { ic: ['cake', '#f5c02e', '#e8b96a'], type: 'heal', price: 0, sell: 22, fx: { hp: 20, fp: 10 }, desc: 'Restores 20 HP and 10 FP.' });
  I('emberstew', 'Ember Stew', { ic: ['flask', '#ff7a2e', '#8a2a10'], type: 'heal', price: 0, sell: 26, fx: { hp: 15, buff: { type: 'atkUp', amt: 2, turns: 4 } }, desc: 'Restores 15 HP and raises Attack.' });
  I('glacierjelly', 'Glacier Jelly', { ic: ['orb', '#bfe4f8', '#4f8aa8'], type: 'heal', price: 0, sell: 26, fx: { fp: 12, buff: { type: 'defUp', amt: 2, turns: 4 } }, desc: 'Restores 12 FP and raises Defence.' });
  I('sovereignroast', 'Sovereign Roast', { ic: ['cake', '#e8b96a', '#a9713f'], type: 'heal', price: 0, sell: 70, fx: { hp: 40, fp: 20 }, desc: 'A legendary meal. 40 HP and 20 FP.' });
  I('twicefolded', 'Twice-Folded Tart', { ic: ['cake', '#f0b0c0', '#8a5fc0'], type: 'heal', price: 0, sell: 34, fx: { hp: 12, fp: 12, cureAll: true }, desc: '12 HP, 12 FP, and cures everything.' });
  I('inkespresso', 'Ink Espresso', { ic: ['bottle', '#2a1c3c', '#8a5fc0'], type: 'heal', price: 0, sell: 30, fx: { fp: 20, buff: { type: 'charge', amt: 2, turns: 99 } }, desc: 'Restores 20 FP and charges your next hit.' });
  I('paperplanepie', 'Paper Plane Pie', { ic: ['cake', '#8fd0f0', '#f7ecd8'], type: 'heal', price: 0, sell: 28, fx: { hp: 10, buff: { type: 'dodgy', amt: 1, turns: 4 } }, desc: '10 HP and makes you hard to hit.' });
  I('sevenlayer', 'Seven-Layer Seal', { ic: ['seal', '#ffe066', '#c8963c'], type: 'heal', price: 0, sell: 90, fx: { hp: 25, fp: 25, sp: 300 }, desc: 'Restores 25 HP, 25 FP and 3 Seal Energy.' });
  I('burntoffering', 'Burnt Offering', { ic: ['cake', '#4a4258', '#2a1c3c'], type: 'heal', price: 0, sell: 1, fx: { hp: 1 }, desc: 'Something went wrong. Restores 1 HP.' });

  /* --- key items --- */
  function K(id, name, ic, desc) { I(id, name, { ic: ic, type: 'key', price: 0, sell: 0, fx: {}, desc: desc }); }
  K('map_foldheim', 'Foldheim Map', ['scroll', '#8fcf52'], 'A map of the whole realm. Press the pause key to read it.');
  K('crease_key', 'Creasewood Key', ['key', '#8fcf52'], 'Opens the thicket gate in Creasewood.');
  K('emberkey', 'Furnace Key', ['key', '#ff7a2e'], 'Opens the Emberfold furnace door.');
  K('tidepass', 'Tide Pass', ['card', '#57b8ea'], 'Lets you board the Sogport ferry.');
  K('bigtop_ticket', 'Big Top Ticket', ['card', '#e8506a'], 'Admits one to the Cardstock Carnival main tent.');
  K('libcard', 'Reader\'s Card', ['card', '#7b4fa0'], 'Grants access to the Glyphhaven stacks.');
  K('summitrope', 'Summit Rope', ['coil', '#e8dcc0'], 'Strong enough for the Frostfold cliffs.');
  K('foilbadge', 'Foundry Pass', ['gear', '#f0a63c'], 'Opens the Foilworks security gates.');
  K('blotlantern', 'Blot Lantern', ['orb', '#8a5fc0'], 'Its cold light holds back the Blot.');
  K('coliseum_pass', 'Coliseum Pass', ['crown', '#f5c02e'], 'Entry to the Folded Coliseum.');
  K('foundry_steel', 'Emberfold Steel', ['gear', '#c8443c'], 'A bar of foundry steel. Deckle in Quillton would want to see this.');
  K('lantern_oil', 'Lamp Oil', ['bottle', '#f0a63c'], 'Thick, slow-burning oil for the Emberfold lamps.');
  K('harbor_manifest', 'Harbour Manifest', ['scroll', '#57b8ea'], 'The Sogport shipping manifest, water-stained but legible.');
  K('carnival_ticket', 'Torn Ticket', ['card', '#e8506a'], 'A child\'s carnival ticket, dropped in the funhouse.');
  K('bell_key', 'Bell Crank', ['key', '#9fd8f0'], 'Turns the frozen bell mechanisms of the Frostfold passes.');
  K('cog_bundle', 'Bundle of Cogs', ['gear', '#8e97a6'], 'Six discarded cogs from the Foilworks floor. Volt wants them.');
  K('smudge_letters', 'Unsent Letters', ['scroll', '#4a3560'], 'Nine letters Duke Smudge wrote and never sent. They get sadder.');
  K('vault_sigil', 'Vault Sigil', ['seal', '#7b4fa0'], 'Opens the restricted vault beneath Glyphhaven.');
  K('press_key', 'Pressroom Key', ['key', '#f0a63c'], 'Opens the Foilworks pressroom.');
  K('citadel_writ', 'Citadel Writ', ['scroll', '#241a34'], 'A forged writ of passage into the Smudge Citadel.');
  K('cookbook', 'Pulp Cookbook', ['book', '#e8506a'], 'Chef Pulp\'s recipes. Now you know what pairs with what.');
  K('recipe_note', 'Scrawled Recipe', ['scroll', '#f5c02e'], 'A half-legible note about a legendary roast.');
  for (var s = 1; s <= 7; s++) {
    K('seal' + s, 'Seal of the Crown ' + ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'][s - 1], ['seal', '#ffe066', '#c8963c'],
      'One of the seven torn seals of the Origami Crown.');
  }
  K('crown_core', 'Crown Core', ['crown', '#ffd24a'], 'The heart of the Origami Crown, still warm.');

  /* ---- recipes ---------------------------------------------------------- */
  /* [a, b] -> result. Order does not matter. */
  var RECIPES = [
    ['pulpberry', 'reamcake', 'foldcake'],
    ['emberpod', 'reamcake', 'emberstew'],
    ['frostnut', 'inktea', 'glacierjelly'],
    ['grandfeast', 'foldroll', 'sovereignroast'],
    ['creambun', 'honeyleaf', 'twicefolded'],
    ['inktea', 'deeproot', 'inkespresso'],
    ['honeyleaf', 'swiftdraft', 'paperplanepie'],
    ['sealwater', 'grandfeast', 'sevenlayer'],
    ['pulpberry', 'honeyleaf', 'foldroll'],
    ['reamcake', 'reamcake', 'creambun'],
    ['inktea', 'inktea', 'deeproot'],
    ['antidote', 'drycloth', 'tonicwash'],
    ['wadbomb', 'wadbomb', 'bigwadbomb'],
    ['wadbomb', 'emberpod', 'shreddisc'],
    ['lifeleaf', 'grandfeast', 'lastpage'],
    ['mysterywad', 'mysterywad', 'grandfeast'],
    ['boldbrew', 'ironsheet', 'mirrorfoil'],
    ['deeproot', 'sealwater', 'sevenlayer'],
    ['pulpberry', 'venomvial', 'antidote'],
    ['frostnut', 'emberpod', 'thunderrag']
  ];

  function cook(a, b) {
    for (var i = 0; i < RECIPES.length; i++) {
      var r = RECIPES[i];
      if ((r[0] === a && r[1] === b) || (r[0] === b && r[1] === a)) return r[2];
    }
    return 'burntoffering';
  }

  function get(id) { return db[id]; }
  function all() { return db; }
  function isKey(id) { return db[id] && db[id].type === 'key'; }
  function list(type) {
    var out = [];
    for (var k in db) if (!type || db[k].type === type) out.push(db[k]);
    return out;
  }

  return { get: get, all: all, list: list, isKey: isKey, drawIcon: drawIcon, cook: cook, RECIPES: RECIPES, ICON: ICON };
})();
