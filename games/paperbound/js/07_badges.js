/* ==========================================================================
   PAPERBOUND — 07_badges.js
   52 badges. Two kinds:
     kind:'move'    — unlocks an extra command in the hero's attack menus
     kind:'passive' — the battle engine reads `mod` keys directly
   `bp` is the Badge Point cost of wearing it.
   ========================================================================== */
'use strict';

PB.Badges = (function () {
  var db = {}, order = [];

  function B(id, name, bp, desc, o) {
    o = o || {};
    o.id = id; o.name = name; o.bp = bp; o.desc = desc;
    o.kind = o.kind || 'passive';
    o.color = o.color || '#f5c02e';
    db[id] = o; order.push(id);
    return o;
  }

  /* ======================= attack badges ================================= */
  B('powerstomp', 'Power Stomp', 2, 'Adds Power Stomp: a heavier landing that deals 2 extra damage.',
    { kind: 'move', color: '#e0483c', move: 'stomp_power', slot: 'stomp' });
  B('multibounce', 'Multibounce', 2, 'Adds Multibounce: chain-hop across every grounded foe.',
    { kind: 'move', color: '#e0483c', move: 'stomp_multi', slot: 'stomp' });
  B('sleepystomp', 'Sleepy Stomp', 2, 'Adds Sleepy Stomp: a lullaby landing that may put a foe to sleep.',
    { kind: 'move', color: '#8a5fc0', move: 'stomp_sleep', slot: 'stomp' });
  B('dizzystomp', 'Dizzy Stomp', 2, 'Adds Dizzy Stomp: rattles a foe until it staggers.',
    { kind: 'move', color: '#f5c02e', move: 'stomp_dizzy', slot: 'stomp' });
  B('piercestomp', 'Pin Stomp', 3, 'Adds Pin Stomp: drives straight through a foe\'s defence.',
    { kind: 'move', color: '#57b8ea', move: 'stomp_pierce', slot: 'stomp' });
  B('tornadostomp', 'Updraft Stomp', 3, 'Adds Updraft Stomp: knocks every flying foe out of the air.',
    { kind: 'move', color: '#8fd0f0', move: 'stomp_tornado', slot: 'stomp' });
  B('springstomp', 'Spring Stomp', 4, 'Adds Spring Stomp: three rising hops, each stronger than the last.',
    { kind: 'move', color: '#8fcf52', move: 'stomp_spring', slot: 'stomp' });

  B('powermallet', 'Power Mallet', 2, 'Adds Power Mallet: a two-handed swing for 2 extra damage.',
    { kind: 'move', color: '#a9713f', move: 'mallet_power', slot: 'mallet' });
  B('quakemallet', 'Quake Mallet', 3, 'Adds Quake Mallet: shakes the stage and hits every grounded foe.',
    { kind: 'move', color: '#a9713f', move: 'mallet_quake', slot: 'mallet' });
  B('firemallet', 'Ember Mallet', 3, 'Adds Ember Mallet: a burning strike that sets paper alight.',
    { kind: 'move', color: '#ff7a2e', move: 'mallet_fire', slot: 'mallet' });
  B('icemallet', 'Frost Mallet', 3, 'Adds Frost Mallet: a chilling strike that can freeze a foe solid.',
    { kind: 'move', color: '#9fd8f0', move: 'mallet_ice', slot: 'mallet' });
  B('shrinkmallet', 'Shrink Mallet', 3, 'Adds Shrink Mallet: flattens a foe so its attacks lose their bite.',
    { kind: 'move', color: '#c8a2e8', move: 'mallet_shrink', slot: 'mallet' });
  B('piercemallet', 'Wedge Mallet', 3, 'Adds Wedge Mallet: ignores defence entirely.',
    { kind: 'move', color: '#6f7a8c', move: 'mallet_pierce', slot: 'mallet' });
  B('spinslam', 'Spin Slam', 5, 'Adds Spin Slam: three furious swings at a single foe.',
    { kind: 'move', color: '#e0483c', move: 'mallet_spin', slot: 'mallet' });
  B('creasecutter', 'Crease Cutter', 4, 'Adds Crease Cutter: a slicing arc that halves a foe\'s defence.',
    { kind: 'move', color: '#cfd6de', move: 'mallet_crease', slot: 'mallet' });

  /* ======================= stat passives ================================= */
  B('powerplus', 'Power Plus', 6, 'Every attack you make deals 1 extra damage.', { mod: { atk: 1 }, color: '#e0483c' });
  B('powerplus2', 'Power Plus P', 6, 'Your partner\'s attacks deal 1 extra damage.', { mod: { atkP: 1 }, color: '#e0483c' });
  B('defendplus', 'Defend Plus', 6, 'Reduces all damage you take by 1.', { mod: { def: 1 }, color: '#57b8ea' });
  B('defendplus2', 'Defend Plus P', 6, 'Reduces all damage your partner takes by 1.', { mod: { defP: 1 }, color: '#57b8ea' });
  B('hpplus', 'HP Plus', 3, 'Raises maximum HP by 5.', { mod: { maxHp: 5 }, color: '#f07a8a' });
  B('fpplus', 'FP Plus', 3, 'Raises maximum FP by 5.', { mod: { maxFp: 5 }, color: '#8fcf52' });
  B('hpplusp', 'HP Plus P', 3, 'Raises your partner\'s maximum HP by 5.', { mod: { maxHpP: 5 }, color: '#f07a8a' });
  B('happyheart', 'Happy Heart', 3, 'Recover 1 HP at the end of each of your turns.', { mod: { regenHp: 1 }, color: '#f07a8a' });
  B('happyflower', 'Happy Flower', 3, 'Recover 1 FP at the end of each of your turns.', { mod: { regenFp: 1 }, color: '#8fcf52' });
  B('happyseal', 'Happy Seal', 4, 'Recover a little Seal Energy each turn.', { mod: { regenSp: 20 }, color: '#ffe066' });
  B('flowersaver', 'Flower Saver', 4, 'Every move costs 1 less FP, to a minimum of 1.', { mod: { fpDiscount: 1 }, color: '#8fcf52' });
  B('flowersaverp', 'Flower Saver P', 4, 'Your partner\'s moves cost 1 less FP.', { mod: { fpDiscountP: 1 }, color: '#8fcf52' });

  /* ======================= risk / reward ================================= */
  B('powerrush', 'Power Rush', 2, 'While you are at 5 HP or less, your attacks deal 3 extra damage.', { mod: { powerRush: 3 }, color: '#e0483c' });
  B('megarush', 'Mega Rush', 1, 'While you are at exactly 1 HP, your attacks deal 6 extra damage.', { mod: { megaRush: 6 }, color: '#c8443c' });
  B('laststand', 'Last Stand', 2, 'While you are at 5 HP or less, incoming damage is halved.', { mod: { lastStand: 1 }, color: '#57b8ea' });
  B('closecall', 'Close Call', 2, 'While you are at 5 HP or less, foes often miss you outright.', { mod: { closeCall: .35 }, color: '#8fd0f0' });
  B('allornothing', 'All or Nothing', 4, 'Perfect action commands add 2 damage. Anything less deals none at all.', { mod: { allOrNothing: 2 }, color: '#f5c02e' });
  B('fragilefold', 'Fragile Fold', 0, 'You take double damage, but earn 50% more Seal Points.', { mod: { fragile: 1, spBonus: .5 }, color: '#8a5fc0', challenge: true });
  B('featherweight', 'Featherweight', 0, 'All your attacks deal exactly 1 damage. Coins earned are doubled.', { mod: { featherweight: 1, coinBonus: 1 }, color: '#f5c02e', challenge: true });
  B('nofolding', 'Purist Crease', 0, 'Origami Forms are disabled, but you gain 2 extra BP.', { mod: { noForms: 1, bonusBp: 2 }, color: '#6f7a8c', challenge: true });

  /* ======================= defence / status ============================== */
  B('feelingfine', 'Feeling Fine', 4, 'You cannot be afflicted with any negative status.', { mod: { statusImmune: 1 }, color: '#7fe0d0' });
  B('feelingfinep', 'Feeling Fine P', 4, 'Your partner cannot be afflicted with any negative status.', { mod: { statusImmuneP: 1 }, color: '#7fe0d0' });
  B('spikeshield', 'Spike Shield', 2, 'Stomping a spiked foe no longer hurts you.', { mod: { spikeShield: 1 }, color: '#9aa3b0' });
  B('fireshield', 'Ember Shield', 2, 'Stomping a burning foe no longer hurts you.', { mod: { fireShield: 1 }, color: '#ff7a2e' });
  B('icepower', 'Ice Power', 2, 'You take no damage from frozen foes and deal 1 extra to them.', { mod: { icePower: 1 }, color: '#9fd8f0' });
  B('zaptap', 'Zap Tap', 4, 'Foes that touch you take 1 shock damage.', { mod: { zapTap: 1 }, color: '#ffe066' });
  B('returnpost', 'Return Postage', 3, 'Reflect a quarter of the damage you take back at the attacker.', { mod: { returnPost: .25 }, color: '#c8a2e8' });
  B('damagedodge', 'Damage Dodge', 2, 'A perfectly timed Guard reduces damage by 2 more.', { mod: { damageDodge: 2 }, color: '#57b8ea' });
  B('prettylucky', 'Pretty Lucky', 2, 'Foes sometimes miss you entirely.', { mod: { luck: .12 }, color: '#8fcf52' });
  B('luckyday', 'Lucky Day', 5, 'Foes miss you far more often.', { mod: { luck: .28 }, color: '#8fcf52' });

  /* ======================= technique ===================================== */
  B('charge', 'Charge', 2, 'Adds Charge to Tactics: bank 2 extra damage onto your next attack.',
    { kind: 'move', color: '#f5c02e', move: 'tac_charge', slot: 'tactics' });
  B('chargep', 'Charge P', 2, 'Adds Charge to your partner\'s Tactics.', { kind: 'move', color: '#f5c02e', move: 'tac_charge_p', slot: 'tacticsP' });
  B('doubledip', 'Double Dip', 3, 'Use two items in a single turn.', { mod: { itemsPerTurn: 2 }, color: '#f07a8a' });
  B('tripledip', 'Triple Dip', 6, 'Use three items in a single turn.', { mod: { itemsPerTurn: 3 }, color: '#f07a8a' });
  B('quickchange', 'Quick Change', 4, 'Swapping partners no longer uses up your turn.', { mod: { quickChange: 1 }, color: '#39b3a6' });
  B('deepfocus', 'Deep Focus', 1, 'Appeal restores considerably more Seal Energy.', { mod: { deepFocus: 40 }, color: '#ffe066' });
  B('stylishsavvy', 'Stylish Savvy', 2, 'Stylish finishes fill the Encore gauge twice as fast.', { mod: { stylish: 1 }, color: '#f07a8a' });
  B('crowdpleaser', 'Crowd Pleaser', 3, 'The audience grows twice as fast and throws twice as many gifts.', { mod: { crowd: 1 }, color: '#e8506a' });
  B('origamiadept', 'Origami Adept', 3, 'Origami Forms cost 2 less FP and last one turn longer.', { mod: { formDiscount: 2, formTurns: 1 }, color: '#57b8ea' });
  B('firststrike', 'First Strike', 3, 'Hitting a foe in the field before battle deals double first-strike damage.', { mod: { firstStrike: 1 }, color: '#e0483c' });
  B('timingtutor', 'Timing Tutor', 1, 'Shows a hint bar for every action command.', { mod: { tutor: 1 }, color: '#8fd0f0' });
  B('peekaboo', 'Peekaboo', 3, 'Shows each foe\'s remaining HP in battle.', { mod: { peekaboo: 1 }, color: '#c8a2e8' });

  /* ======================= economy ======================================= */
  B('payoff', 'Pay-Off', 2, 'Foes drop a coin whenever you damage them.', { mod: { payoff: 1 }, color: '#f5c02e' });
  B('refund', 'Refund', 3, 'Recover 75% of an item\'s value in coins when you use it.', { mod: { refund: .75 }, color: '#f5c02e' });
  B('runawaypay', 'Runaway Pay', 2, 'Fleeing no longer costs you Seal Points.', { mod: { runawayPay: 1 }, color: '#8fcf52' });
  B('moneymoney', 'Money Money', 4, 'Coins found in the field are worth double.', { mod: { coinBonus: 1 }, color: '#f5c02e' });
  B('itemhunter', 'Item Hunter', 3, 'Foes drop items far more often.', { mod: { dropRate: 1 }, color: '#8fcf52' });
  B('sealseeker', 'Seal Seeker', 3, 'Earn 25% more Seal Points from every battle.', { mod: { spBonus: .25 }, color: '#ffe066' });

  function get(id) { return db[id]; }
  function all() { return db; }
  function list() { return order.map(function (k) { return db[k]; }); }

  /* Sum every `mod` key across a set of equipped badge ids. */
  function mods(ids) {
    var m = {};
    for (var i = 0; i < ids.length; i++) {
      var b = db[ids[i]];
      if (!b || !b.mod) continue;
      for (var k in b.mod) m[k] = (m[k] || 0) + b.mod[k];
    }
    return m;
  }
  function movesFrom(ids, slot) {
    var out = [];
    for (var i = 0; i < ids.length; i++) {
      var b = db[ids[i]];
      if (b && b.kind === 'move' && b.slot === slot) out.push(b.move);
    }
    return out;
  }
  function cost(ids) {
    var t = 0;
    for (var i = 0; i < ids.length; i++) if (db[ids[i]]) t += db[ids[i]].bp;
    return t;
  }

  return { get: get, all: all, list: list, mods: mods, movesFrom: movesFrom, cost: cost };
})();
