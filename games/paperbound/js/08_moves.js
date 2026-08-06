/* ==========================================================================
   PAPERBOUND — 08_moves.js
   Hero attacks, Origami Forms, Seal Powers, partner abilities and duets.

   cmd.type is one of: press | mash | charge | multi | seq | aim | hold |
                       rotate | none
   target: oneAny | oneGround | oneAir | front | allGround | allAir | all |
           self | ally | party
   ========================================================================== */
'use strict';

PB.Moves = (function () {
  var db = {};
  function M(id, o) { o.id = id; db[id] = o; return o; }

  /* ============================ HERO : STOMP ============================= */
  /* Stomp is the flexible option: reaches airborne foes, but a spiked or
     burning top punishes you for landing on it. */
  M('stomp', {
    name: 'Stomp', cat: 'stomp', fp: 0, target: 'oneAny', power: [1, 2, 3], hits: 2,
    contact: 'top', element: 'blunt',
    cmd: { type: 'press', dur: 46, good: [0.62, 0.86], perfect: [0.72, 0.80] },
    desc: 'Two quick hops on a single foe. Reaches anything in the air.'
  });
  M('stomp_power', {
    name: 'Power Stomp', cat: 'stomp', fp: 2, target: 'oneAny', power: [3, 4, 5], hits: 1,
    contact: 'top', element: 'blunt',
    cmd: { type: 'charge', dur: 70, zone: [0.68, 0.92] },
    desc: 'Wind up, then drop with everything you have.'
  });
  M('stomp_multi', {
    name: 'Multibounce', cat: 'stomp', fp: 2, target: 'allGround', power: [1, 2, 3], hits: 1, chain: true,
    contact: 'top', element: 'blunt',
    cmd: { type: 'multi', n: 6, spacing: 24 },
    desc: 'Bounce from foe to foe. Keep the rhythm and the chain keeps going.'
  });
  M('stomp_sleep', {
    name: 'Sleepy Stomp', cat: 'stomp', fp: 2, target: 'oneAny', power: [1, 2, 2], hits: 1,
    contact: 'top', element: 'blunt', status: { type: 'sleep', chance: .6, turns: 3 },
    cmd: { type: 'hold', dur: 78, width: .2 },
    desc: 'A slow, lulling landing. Often puts the foe to sleep.'
  });
  M('stomp_dizzy', {
    name: 'Dizzy Stomp', cat: 'stomp', fp: 2, target: 'oneAny', power: [1, 2, 3], hits: 1,
    contact: 'top', element: 'blunt', status: { type: 'dizzy', chance: .65, turns: 3 },
    cmd: { type: 'rotate', dur: 66, target: 14 },
    desc: 'Spin the foe like a top until it cannot aim straight.'
  });
  M('stomp_pierce', {
    name: 'Pin Stomp', cat: 'stomp', fp: 3, target: 'oneAny', power: [2, 3, 4], hits: 1,
    contact: 'top', element: 'blunt', pierce: true,
    cmd: { type: 'aim', dur: 110, speed: .026, zone: .17 },
    desc: 'Land on the one crease that defence cannot cover.'
  });
  M('stomp_tornado', {
    name: 'Updraft Stomp', cat: 'stomp', fp: 3, target: 'allAir', power: [2, 3, 4], hits: 1,
    contact: 'none', element: 'wind', ground: true,
    cmd: { type: 'mash', dur: 66, need: 18 },
    desc: 'Whip up a gust that drags every flier to the floor.'
  });
  M('stomp_spring', {
    name: 'Spring Stomp', cat: 'stomp', fp: 4, target: 'oneAny', power: [1, 2, 3], hits: 3, escalate: 1,
    contact: 'top', element: 'blunt',
    cmd: { type: 'multi', n: 3, spacing: 30, rising: true },
    desc: 'Three rising hops, each one harder than the last.'
  });

  /* ============================ HERO : MALLET ============================ */
  /* Mallet only reaches the front grounded foe, but it hits far harder and
     spikes on top cannot punish it. */
  M('mallet', {
    name: 'Mallet', cat: 'mallet', fp: 0, target: 'front', power: [2, 3, 4], hits: 1,
    contact: 'side', element: 'blunt',
    cmd: { type: 'charge', dur: 62, zone: [0.7, 0.95] },
    desc: 'A solid swing at whatever is standing closest.'
  });
  M('mallet_power', {
    name: 'Power Mallet', cat: 'mallet', fp: 2, target: 'front', power: [4, 5, 6], hits: 1,
    contact: 'side', element: 'blunt',
    cmd: { type: 'charge', dur: 80, zone: [0.76, 0.94] },
    desc: 'Both hands, full arc. Hold the swing to the very edge.'
  });
  M('mallet_quake', {
    name: 'Quake Mallet', cat: 'mallet', fp: 3, target: 'allGround', power: [2, 3, 4], hits: 1,
    contact: 'none', element: 'blunt',
    cmd: { type: 'mash', dur: 72, need: 20 },
    desc: 'Hammer the stage until every grounded foe loses its footing.'
  });
  M('mallet_fire', {
    name: 'Ember Mallet', cat: 'mallet', fp: 3, target: 'front', power: [3, 4, 5], hits: 1,
    contact: 'side', element: 'fire', status: { type: 'burn', chance: .7, turns: 3 },
    cmd: { type: 'mash', dur: 60, need: 16 },
    desc: 'Friction lights the head of the hammer. Paper does not like it.'
  });
  M('mallet_ice', {
    name: 'Frost Mallet', cat: 'mallet', fp: 3, target: 'front', power: [3, 4, 5], hits: 1,
    contact: 'side', element: 'ice', status: { type: 'freeze', chance: .55, turns: 2 },
    cmd: { type: 'hold', dur: 80, width: .18 },
    desc: 'Draw the cold in slowly, then let it out all at once.'
  });
  M('mallet_shrink', {
    name: 'Shrink Mallet', cat: 'mallet', fp: 3, target: 'front', power: [2, 3, 3], hits: 1,
    contact: 'side', element: 'blunt', status: { type: 'shrink', chance: .7, turns: 4 },
    cmd: { type: 'seq', n: 4 },
    desc: 'Flatten a foe until its attacks barely land.'
  });
  M('mallet_pierce', {
    name: 'Wedge Mallet', cat: 'mallet', fp: 3, target: 'front', power: [3, 4, 5], hits: 1,
    contact: 'side', element: 'blunt', pierce: true,
    cmd: { type: 'aim', dur: 120, speed: .028, zone: .15 },
    desc: 'Find the seam. Defence stops mattering.'
  });
  M('mallet_spin', {
    name: 'Spin Slam', cat: 'mallet', fp: 5, target: 'front', power: [2, 3, 4], hits: 3,
    contact: 'side', element: 'blunt',
    cmd: { type: 'rotate', dur: 84, target: 20 },
    desc: 'Three revolutions, three impacts, one very flat foe.'
  });
  M('mallet_crease', {
    name: 'Crease Cutter', cat: 'mallet', fp: 4, target: 'front', power: [3, 4, 5], hits: 1,
    contact: 'side', element: 'cut', status: { type: 'crumple', chance: .8, turns: 4 },
    cmd: { type: 'press', dur: 38, good: [0.66, 0.88], perfect: [0.75, 0.82] },
    desc: 'A clean slice down the fold line. Halves what it does not cut.'
  });

  /* ============================ ORIGAMI FORMS ============================
     The signature system. Folding costs FP up front and reshapes what Pip
     is for a few turns — a standing trade rather than a one-off attack. */
  M('form_crane', {
    name: 'Crane Form', cat: 'form', fp: 4, target: 'self', turns: 3,
    form: { id: 'crane', evade: .5, counter: 2, atk: 0, def: 0 },
    cmd: { type: 'seq', n: 3 },
    desc: 'Fold into a crane. Half of all attacks miss, and each miss counters for 2.'
  });
  M('form_fortress', {
    name: 'Fortress Form', cat: 'form', fp: 4, target: 'self', turns: 3,
    form: { id: 'fortress', def: 3, atk: -1, thorns: 1 },
    cmd: { type: 'mash', dur: 60, need: 14 },
    desc: 'Fold into a block. Defence +3 and attackers take 1, but your attacks soften.'
  });
  M('form_dart', {
    name: 'Dart Form', cat: 'form', fp: 5, target: 'self', turns: 3,
    form: { id: 'dart', atk: 2, def: -2, pierce: true },
    cmd: { type: 'charge', dur: 72, zone: [0.72, 0.94] },
    desc: 'Fold into a dart. Attack +2 and every hit pierces, but you crumple easily.'
  });
  M('form_lantern', {
    name: 'Lantern Form', cat: 'form', fp: 6, target: 'self', turns: 4,
    form: { id: 'lantern', regen: 3, regenParty: 2, light: true },
    cmd: { type: 'hold', dur: 90, width: .22 },
    desc: 'Fold into a lantern. You and your partner recover HP every turn.'
  });
  M('form_shear', {
    name: 'Shear Form', cat: 'form', fp: 6, target: 'self', turns: 3,
    form: { id: 'shear', atk: 1, extraHit: 1, element: 'cut' },
    cmd: { type: 'rotate', dur: 78, target: 18 },
    desc: 'Fold into shears. Every attack strikes twice and cuts clean.'
  });
  M('form_unfold', {
    name: 'Unfold', cat: 'form', fp: 0, target: 'self',
    unfold: true, cmd: { type: 'none' },
    desc: 'Return to your ordinary shape at once.'
  });

  /* ============================ SEAL POWERS ==============================
     Fuelled by Seal Energy (SE). 100 SE = one wedge on the gauge. */
  M('seal_refold', {
    name: 'Refold', cat: 'seal', se: 100, target: 'party',
    heal: { hp: 10 }, cmd: { type: 'mash', dur: 60, need: 16 },
    desc: 'Smooth out the creases. Restores 10 HP to you and your partner.'
  });
  M('seal_ember', {
    name: 'Emberseal', cat: 'seal', se: 100, target: 'all', power: 4, element: 'fire',
    status: { type: 'burn', chance: .5, turns: 3 },
    cmd: { type: 'press', dur: 44, good: [0.6, 0.88], perfect: [0.71, 0.8] },
    desc: 'A ring of controlled fire. 4 damage to every foe.'
  });
  M('seal_tidewash', {
    name: 'Tidewash', cat: 'seal', se: 200, target: 'party',
    heal: { hp: 8, cureAll: true }, cmd: { type: 'hold', dur: 84, width: .24 },
    desc: 'A clean rinse. Restores 8 HP and washes off every ailment.'
  });
  M('seal_kerf', {
    name: 'Kerfstrike', cat: 'seal', se: 200, target: 'oneAny', power: 10, pierce: true, element: 'cut',
    cmd: { type: 'aim', dur: 130, speed: .03, zone: .16 },
    desc: 'One perfect cut. 10 damage that no defence can blunt.'
  });
  M('seal_redaction', {
    name: 'Redaction', cat: 'seal', se: 200, target: 'all',
    status: { type: 'silence', chance: 1, turns: 3 }, debuff: { def: -2, turns: 3 },
    cmd: { type: 'seq', n: 5 },
    desc: 'Black out their playbook. Foes lose their special moves and 2 Defence.'
  });
  M('seal_glacier', {
    name: 'Glacial Press', cat: 'seal', se: 300, target: 'all', power: 6, element: 'ice',
    status: { type: 'freeze', chance: .7, turns: 2 },
    cmd: { type: 'rotate', dur: 90, target: 22 },
    desc: 'Press the whole stage flat under ice. 6 damage and a deep freeze.'
  });
  M('seal_blank', {
    name: 'Blank Slate', cat: 'seal', se: 300, target: 'field',
    blankSlate: true, cmd: { type: 'multi', n: 5, spacing: 22 },
    desc: 'Wipe the page. Clears every buff on the field, heals 15 HP/FP and fills the Encore gauge.'
  });

  /* ============================ TACTICS ================================== */
  M('tac_defend', { name: 'Defend', cat: 'tactic', fp: 0, target: 'self', defend: true, cmd: { type: 'none' }, desc: 'Brace. Halves damage this turn.' });
  M('tac_appeal', { name: 'Appeal', cat: 'tactic', fp: 0, target: 'self', appeal: true, cmd: { type: 'none' }, desc: 'Play to the crowd for Seal Energy and applause.' });
  M('tac_swap', { name: 'Swap', cat: 'tactic', fp: 0, target: 'self', swap: true, cmd: { type: 'none' }, desc: 'Bring out a different partner.' });
  M('tac_run', { name: 'Run', cat: 'tactic', fp: 0, target: 'self', run: true, cmd: { type: 'mash', dur: 60, need: 18 }, desc: 'Try to leave. Costs Seal Points.' });
  M('tac_charge', { name: 'Charge', cat: 'tactic', fp: 2, target: 'self', buff: { type: 'charge', amt: 2, turns: 99 }, cmd: { type: 'charge', dur: 66, zone: [0.7, 0.95] }, desc: 'Bank 2 extra damage onto your next attack.' });
  M('tac_charge_p', { name: 'Charge', cat: 'tactic', fp: 2, target: 'self', buff: { type: 'charge', amt: 2, turns: 99 }, cmd: { type: 'charge', dur: 66, zone: [0.7, 0.95] }, desc: 'Bank 2 extra damage onto your partner\'s next attack.' });

  /* ============================ PARTNERS ================================= */
  /* rank 1 moves are available immediately; rank 2/3 unlock with Foil Shards. */

  // --- Twigby (Sprout) -------------------------------------------------
  M('tw_bonk', {
    name: 'Bonk', cat: 'partner', fp: 0, target: 'front', power: [2, 3, 4], hits: 1, rank: 1,
    contact: 'side', element: 'blunt',
    cmd: { type: 'press', dur: 44, good: [0.6, 0.86], perfect: [0.7, 0.79] },
    desc: 'A blunt little headbutt. Costs nothing.'
  });
  M('tw_study', {
    name: 'Study', cat: 'partner', fp: 0, target: 'oneAny', rank: 1, tattle: true,
    cmd: { type: 'none' },
    desc: 'Read a foe aloud: HP, Attack, Defence and its weak points.'
  });
  M('tw_thornshot', {
    name: 'Thornshot', cat: 'partner', fp: 3, target: 'oneAny', power: [4, 5, 6], hits: 1, rank: 2,
    pierce: true, element: 'cut',
    cmd: { type: 'aim', dur: 110, speed: .026, zone: .18 },
    desc: 'Fires a seed-thorn that slips past armour.'
  });
  M('tw_rootsnare', {
    name: 'Root Snare', cat: 'partner', fp: 4, target: 'allGround', power: [2, 3, 3], hits: 1, rank: 3,
    status: { type: 'tangled', chance: .6, turns: 2 },
    cmd: { type: 'mash', dur: 70, need: 20 },
    desc: 'Roots burst through the stage and bind everything standing on it.'
  });

  // --- Lumen ------------------------------------------------------------
  M('lu_flare', {
    name: 'Flare', cat: 'partner', fp: 0, target: 'oneAny', power: [2, 3, 4], hits: 1, rank: 1,
    element: 'fire',
    cmd: { type: 'press', dur: 42, good: [0.62, 0.88], perfect: [0.72, 0.81] },
    desc: 'A short, bright burst of flame. Reaches fliers.'
  });
  M('lu_kindle', {
    name: 'Kindle', cat: 'partner', fp: 2, target: 'ally', rank: 1,
    buff: { type: 'atkUp', amt: 2, turns: 3 },
    cmd: { type: 'hold', dur: 72, width: .24 },
    desc: 'Warms an ally up. Attack +2 for three turns.'
  });
  M('lu_sunburst', {
    name: 'Sunburst', cat: 'partner', fp: 4, target: 'all', power: [3, 4, 5], hits: 1, rank: 2,
    element: 'fire', status: { type: 'burn', chance: .5, turns: 3 },
    cmd: { type: 'charge', dur: 76, zone: [0.72, 0.95] },
    desc: 'Flares out in every direction. Burns the whole stage.'
  });
  M('lu_beacon', {
    name: 'Beacon', cat: 'partner', fp: 5, target: 'party', rank: 3,
    heal: { hp: 10, cureAll: true },
    cmd: { type: 'multi', n: 4, spacing: 26 },
    desc: 'A steady light. Heals 10 HP and clears every ailment.'
  });

  // --- Bloop ------------------------------------------------------------
  M('bl_splash', {
    name: 'Splash', cat: 'partner', fp: 0, target: 'oneAny', power: [2, 3, 4], hits: 1, rank: 1,
    element: 'water', status: { type: 'soggy', chance: .4, turns: 3 },
    cmd: { type: 'press', dur: 44, good: [0.6, 0.86], perfect: [0.7, 0.79] },
    desc: 'A well-aimed slap of water. Soggy foes hit softer.'
  });
  M('bl_bubble', {
    name: 'Bubble Shield', cat: 'partner', fp: 3, target: 'ally', rank: 1,
    buff: { type: 'defUp', amt: 3, turns: 3 },
    cmd: { type: 'hold', dur: 80, width: .22 },
    desc: 'Wraps an ally in a bubble. Defence +3 for three turns.'
  });
  M('bl_tidalroll', {
    name: 'Tidal Roll', cat: 'partner', fp: 4, target: 'all', power: [3, 4, 5], hits: 1, rank: 2,
    element: 'water', status: { type: 'soggy', chance: .7, turns: 3 },
    cmd: { type: 'rotate', dur: 76, target: 18 },
    desc: 'Rolls the whole stage under a wave.'
  });
  M('bl_deluge', {
    name: 'Deluge', cat: 'partner', fp: 6, target: 'all', power: [5, 6, 7], hits: 1, rank: 3,
    element: 'water', douse: true,
    cmd: { type: 'mash', dur: 80, need: 24 },
    desc: 'A wall of water. Snuffs out anything burning, foe or field.'
  });

  // --- Snip -------------------------------------------------------------
  M('sn_snip', {
    name: 'Snip Snip', cat: 'partner', fp: 0, target: 'front', power: [2, 3, 4], hits: 2, rank: 1,
    element: 'cut', halveDef: true,
    cmd: { type: 'multi', n: 2, spacing: 26 },
    desc: 'Two quick cuts that shear a foe\'s defence in half for the turn.'
  });
  M('sn_ribbon', {
    name: 'Ribbon Whirl', cat: 'partner', fp: 3, target: 'all', power: [2, 3, 3], hits: 2, rank: 1,
    element: 'cut',
    cmd: { type: 'rotate', dur: 70, target: 16 },
    desc: 'Spins on the spot, catching every foe twice.'
  });
  M('sn_confetti', {
    name: 'Confetti Cut', cat: 'partner', fp: 4, target: 'oneAny', power: [5, 6, 7], hits: 1, rank: 2,
    element: 'cut', status: { type: 'poison', chance: .6, turns: 4 },
    cmd: { type: 'seq', n: 4 },
    desc: 'A hundred tiny cuts. The paper keeps fraying afterwards.'
  });
  M('sn_curtain', {
    name: 'Curtain Call', cat: 'partner', fp: 6, target: 'all', power: [4, 5, 6], hits: 1, rank: 3,
    element: 'cut', status: { type: 'crumple', chance: .8, turns: 4 },
    cmd: { type: 'charge', dur: 84, zone: [0.74, 0.96] },
    desc: 'Brings the curtain down on everyone. Defence falls with it.'
  });

  // --- Margo ------------------------------------------------------------
  M('mg_footnote', {
    name: 'Footnote', cat: 'partner', fp: 0, target: 'oneAny', power: [2, 3, 4], hits: 1, rank: 1,
    pierce: true,
    cmd: { type: 'press', dur: 40, good: [0.64, 0.88], perfect: [0.73, 0.81] },
    desc: 'A small correction, delivered at speed. Ignores defence.'
  });
  M('mg_annotate', {
    name: 'Annotate', cat: 'partner', fp: 2, target: 'oneAny', rank: 1,
    debuff: { def: -2, vuln: 2, turns: 4 },
    cmd: { type: 'seq', n: 3 },
    desc: 'Marks a foe up. Defence -2, and it takes 2 extra damage from everything.'
  });
  M('mg_redline', {
    name: 'Redline', cat: 'partner', fp: 4, target: 'oneAny', power: [5, 6, 7], hits: 1, rank: 2,
    status: { type: 'silence', chance: .8, turns: 3 },
    cmd: { type: 'aim', dur: 116, speed: .028, zone: .17 },
    desc: 'Strikes a foe\'s best move off the page.'
  });
  M('mg_index', {
    name: 'Index', cat: 'partner', fp: 6, target: 'all', power: [3, 4, 5], hits: 1, rank: 3,
    status: { type: 'inked', chance: .8, turns: 3 },
    cmd: { type: 'mash', dur: 78, need: 22 },
    desc: 'Files every foe under "blinded".'
  });

  // --- Volt -------------------------------------------------------------
  M('vo_sparker', {
    name: 'Sparker', cat: 'partner', fp: 0, target: 'oneAny', power: [2, 3, 4], hits: 1, rank: 1,
    element: 'shock',
    cmd: { type: 'mash', dur: 46, need: 12 },
    desc: 'A crackling jolt. Reaches anything, grounded or not.'
  });
  M('vo_overclock', {
    name: 'Overclock', cat: 'partner', fp: 3, target: 'ally', rank: 1,
    buff: { type: 'charge', amt: 4, turns: 99 },
    cmd: { type: 'rotate', dur: 72, target: 18 },
    desc: 'Winds an ally up. Their next attack deals 4 extra damage.'
  });
  M('vo_chain', {
    name: 'Chain Lightning', cat: 'partner', fp: 4, target: 'all', power: [3, 4, 5], hits: 1, rank: 2,
    element: 'shock', pierce: true,
    cmd: { type: 'seq', n: 5 },
    desc: 'Arcs between every foe on the stage, straight through armour.'
  });
  M('vo_magnet', {
    name: 'Magnet Pull', cat: 'partner', fp: 5, target: 'all', power: [3, 4, 4], hits: 1, rank: 3,
    element: 'shock', ground: true, status: { type: 'dizzy', chance: .5, turns: 2 },
    cmd: { type: 'hold', dur: 88, width: .2 },
    desc: 'Drags every flier to the floor and rattles the lot of them.'
  });

  /* ============================ DUETS (Encore) ===========================
     Unleashed when the Encore gauge fills. One per partner. */
  M('duet_twigby', {
    name: 'Duet: Thicket Bloom', cat: 'duet', target: 'all', power: 10, element: 'cut', pierce: true,
    status: { type: 'tangled', chance: .8, turns: 2 },
    cmd: { type: 'mash', dur: 100, need: 30 },
    desc: 'Pip plants, Twigby grows: the whole stage erupts in thorns.'
  });
  M('duet_lumen', {
    name: 'Duet: Solar Fold', cat: 'duet', target: 'all', power: 12, element: 'fire',
    status: { type: 'burn', chance: .9, turns: 4 },
    cmd: { type: 'charge', dur: 110, zone: [0.8, 0.98] },
    desc: 'Pip folds a mirror; Lumen fills it with the sun.'
  });
  M('duet_bloop', {
    name: 'Duet: Full Fathom', cat: 'duet', target: 'all', power: 11, element: 'water',
    status: { type: 'soggy', chance: 1, turns: 4 }, douse: true,
    cmd: { type: 'rotate', dur: 108, target: 30 },
    desc: 'The stage floods to the rafters and drains in one breath.'
  });
  M('duet_snip', {
    name: 'Duet: Paper Chain', cat: 'duet', target: 'all', power: 6, hits: 3, element: 'cut',
    cmd: { type: 'multi', n: 8, spacing: 18 },
    desc: 'A chain of cut-out dancers whirls through the whole line-up.'
  });
  M('duet_margo', {
    name: 'Duet: Full Revision', cat: 'duet', target: 'all', power: 13, pierce: true,
    status: { type: 'silence', chance: 1, turns: 4 }, debuff: { def: -3, turns: 4 },
    cmd: { type: 'seq', n: 8 },
    desc: 'Margo rewrites the scene and Pip staples it shut.'
  });
  M('duet_volt', {
    name: 'Duet: Grand Circuit', cat: 'duet', target: 'all', power: 12, element: 'shock', pierce: true,
    status: { type: 'dizzy', chance: .8, turns: 3 }, ground: true,
    cmd: { type: 'hold', dur: 120, width: .16 },
    desc: 'Volt closes the loop; Pip is the conductor.'
  });

  function get(id) { return db[id]; }
  function all() { return db; }
  /* Power scales with hero rank (1..3) or partner rank. */
  function power(move, rank) {
    if (move.power === undefined) return 0;
    if (typeof move.power === 'number') return move.power;
    return move.power[Math.max(0, Math.min(move.power.length - 1, (rank || 1) - 1))];
  }

  return { get: get, all: all, power: power };
})();
