#!/usr/bin/env node
/* ==========================================================================
   PAPERBOUND — tools/balance.js
   Monte-Carlo balance probe for every boss fight.

   Re-implements the damage pipeline from 14_battle.js (dealDamage,
   attackerPower, defenceOf, the enemy multi-hit path) against the real stat
   data in 09_enemies.js / 08_moves.js / 07_badges.js, then plays each boss
   out thousands of times at a range of player levels and skill levels.

   The point is to answer "is this boss beatable, and by whom" with numbers
   instead of impressions.

   Usage:
     node tools/balance.js                 # summary table, all bosses
     node tools/balance.js --boss bramblejack --verbose
     node tools/balance.js --difficulty folded
   ========================================================================== */
'use strict';

const fs = require('fs');
const path = require('path');

/* ---- load the game modules under a headless shim ----------------------- */
const JS = path.join(path.resolve(__dirname, '..'), 'js');
global.window = { addEventListener() {}, console };
global.document = {
  getElementById: () => null, addEventListener() {},
  createElement: () => ({ getContext: () => null, style: {} })
};
global.requestAnimationFrame = () => 0;
global.AudioContext = function () { return {}; };
global.performance = { now: () => 0 };
/* The browser puts every file in one shared global scope. 00_util.js opens with
   `var PB = window.PB || (window.PB = {})`, so running each file in its own
   Function scope leaves PB.U undefined for every later file and silently drops
   most of the content. Concatenate and evaluate once. */
const SRC = fs.readdirSync(JS).filter(f => /^\d+_.*\.js$/.test(f)).sort()
  .map(f => fs.readFileSync(path.join(JS, f), 'utf8')).join('\n;\n');
const PB = (new Function(SRC + '\n;return PB;'))();
global.PB = PB;

const E = PB.Enemies.all();
const Mv = PB.Moves;
const Badges = PB.Badges.all();

const argv = process.argv;
const arg = (k, d) => { const i = argv.indexOf(k); return i > 0 ? argv[i + 1] : d; };
const DIFFICULTY = arg('--difficulty', 'normal');
const ONLY = arg('--boss', null);
const VERBOSE = argv.includes('--verbose');
const TRIALS = parseInt(arg('--trials', '4000'), 10);

const DIFF = { relaxed: { inDmg: .6, outDmg: 1.25 }, normal: { inDmg: 1, outDmg: 1 }, folded: { inDmg: 1.5, outDmg: .9 } }[DIFFICULTY];

/* ---- rng --------------------------------------------------------------- */
let seed = 12345;
function rnd() { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }
function chance(p) { return rnd() < p; }
function pickWeighted(list) {
  let tot = 0; for (const m of list) tot += (m.weight || 1);
  let r = rnd() * tot;
  for (const m of list) { r -= (m.weight || 1); if (r <= 0) return m; }
  return list[list.length - 1];
}

/* ---- element multiplier (mirrors elementMult) --------------------------- */
function elementMult(foe, el) {
  if (!el) return 1;
  if ((foe.immune || []).includes(el)) return 0;
  if ((foe.weak || []).includes(el)) return 1.5;
  if ((foe.resist || []).includes(el)) return 0.5;
  return 1;
}

/* ======================================================================
   Player build for a given level
   ====================================================================== */
/* Levels grant one of HP+5 / FP+5 / BP+3. A player who is trying to survive
   spends most of them on HP, so model a 2:1:1 HP/FP/BP split — then a
   BP-heavy variant separately, since that is what unlocks Power Plus. */
function buildPlayer(level, style) {
  const ups = level - 1;
  let hpUps, fpUps, bpUps;
  if (style === 'bp') { bpUps = Math.ceil(ups * .5); hpUps = Math.ceil(ups * .3); fpUps = ups - bpUps - hpUps; }
  else { hpUps = Math.ceil(ups * .5); fpUps = Math.ceil(ups * .25); bpUps = ups - hpUps - fpUps; }

  const maxHp = 15 + hpUps * 5;
  const maxFp = 8 + fpUps * 5;
  const bp = 3 + bpUps * 3;

  /* Spend BP the way a player actually would: Power Plus first if affordable
     (biggest single damage lever), then the partner one, then Multibounce. */
  const mods = { atk: 0, atkP: 0, def: 0, defP: 0 };
  let spent = 0;
  if (bp - spent >= 6) { mods.atk += 1; spent += 6; }    // Power Plus, +1 (only one exists)
  if (bp - spent >= 6) { mods.atkP += 1; spent += 6; }   // Power Plus P
  if (bp - spent >= 6) { mods.def += 1; spent += 6; }    // Defend Plus

  /* Ranks come from bosses cleared, which tracks chapter, which tracks level.
     Two upgrades land by ch3 and the rest by ch7 in the shipped scripts. */
  const stompRank = level >= 22 ? 3 : level >= 10 ? 2 : 1;
  const malletRank = level >= 26 ? 3 : level >= 14 ? 2 : 1;
  const partnerRank = level >= 20 ? 3 : level >= 9 ? 2 : 1;

  return { maxHp, hp: maxHp, maxFp, fp: maxFp, bp, mods, stompRank, malletRank, partnerRank, bpSpent: spent };
}

/* ---- hero damage (mirrors the hero attack path) ------------------------- */
function heroHit(move, rank, mods, tier, stylish, foe, bossDef) {
  const base = Mv.power(move, rank);
  let perHit = base + (mods.atk || 0);
  if (tier === 2) perHit += 1;
  if (tier === 0) perHit = Math.floor(perHit * 0.5);
  if (stylish) perHit += 1;
  perHit = Math.max(0, perHit);

  const hits = move.hits || 1;
  let total = 0;
  for (let h = 0; h < hits; h++) {
    const mult = elementMult(foe, move.element);
    if (mult === 0) continue;
    let d = mult > 1 ? Math.ceil(perHit * mult) : (mult < 1 ? Math.floor(perHit * mult) : perHit);
    if (!move.pierce) d -= bossDef;
    d = Math.round(d * DIFF.outDmg);
    total += Math.max(0, d);
  }
  return total;
}

/* ---- enemy damage on a player-side target -------------------------------
   NOTE: the game does NOT feed phase atk mods into this. 14_battle.js:1323
   increments f.atk on a phase change, but the damage path at :1398-1404 reads
   only mv.power plus the 'atkUp' buff — f.atk is never consulted. So phase
   attack buffs are a no-op on real boss attacks, and this models that. */
function foeHit(mv, atkBuff, guard, playerDef) {
  let power = (mv.power || 0) + atkBuff;
  const hits = mv.hits || 1;
  const applied = (hits > 1 && mv.power !== power) ? Math.max(1, Math.round(power / 1.6)) : power;
  let total = 0;
  for (let h = 0; h < hits; h++) {
    let d = applied;
    d -= playerDef;
    if (guard === 'guard') d -= 1;
    if (guard === 'superguard') d = 0;
    d = Math.round(d * DIFF.inDmg);
    total += Math.max(0, d);
  }
  return total;
}

/* ======================================================================
   One simulated fight
   ====================================================================== */
function simulate(bossId, level, skill, style) {
  const B = E[bossId];
  const p = buildPlayer(level, style);
  /* The partner is a separate target with its own HP pool. Charging every
     boss hit to the hero roughly doubled incoming damage in the first draft. */
  const partnerHp = { hp: 10 + Math.floor(level * 1.6), max: 10 + Math.floor(level * 1.6) };
  const boss = {
    hp: B.hp, maxHp: B.hp, def: B.def || 0,
    atkUp: 0, atkUpTurns: 0,          // 'atkUp' takes MAX and expires (14_battle.js:156)
    guardAmt: 0, guardTurns: 0,       // guard moves raise Defence (:1337, :320)
    moves: (B.moves || []).slice(), phaseIdx: 0
  };

  const pool = [Mv.get('stomp'), Mv.get('mallet')];
  if (skill.optimal) {
    let bpLeft = p.bp - p.bpSpent;
    if (bpLeft >= 3) { pool.push(Mv.get('mallet_pierce')); bpLeft -= 3; }
    if (bpLeft >= 2) { pool.push(Mv.get('mallet_power')); bpLeft -= 2; }
    if (bpLeft >= 3) { pool.push(Mv.get('stomp_pierce')); bpLeft -= 3; }
  }
  const partnerM = Mv.get(skill.partnerMove || 'tw_bonk');
  const duet = Mv.get(skill.duet || 'duet_twigby');
  let encore = 0, charge = 0;

  let heals = skill.items;
  let round = 0;
  /* There is NO turn limit in 14_battle.js. This cap is a runaway guard only,
     and hitting it is reported separately — never scored as a loss. */
  const RUNAWAY = 400;

  while (boss.hp > 0 && p.hp > 0 && round < RUNAWAY) {
    round++;
    if (boss.atkUpTurns > 0 && --boss.atkUpTurns === 0) boss.atkUp = 0;
    if (boss.guardTurns > 0) boss.guardTurns--;
    const effDef = boss.def + (boss.guardTurns > 0 ? boss.guardAmt : 0);

    /* --- hero --- */
    const tier = chance(skill.perfect) ? 2 : (chance(skill.land / (1 - skill.perfect + 1e-9)) ? 1 : 0);
    const stylish = tier === 2 && chance(skill.stylish);

    if (p.hp <= Math.max(4, p.maxHp * 0.3) && heals > 0) {
      p.hp = Math.min(p.maxHp, p.hp + 10); heals--;
    } else if (encore >= 100) {
      boss.hp -= heroHit(duet, 3, p.mods, 2, false, B, effDef);
      encore = 0;
    } else {
      let best = 0, chosen = null;
      for (const mv of pool) {
        if ((mv.fp || 0) > p.fp) continue;
        const rank = mv.cat === 'mallet' ? p.malletRank : p.stompRank;
        const d = heroHit(mv, rank, { atk: (p.mods.atk || 0) + charge }, tier, stylish, B, effDef);
        if (d > best) { best = d; chosen = mv; }
      }
      if (chosen) { p.fp -= (chosen.fp || 0); boss.hp -= best; charge = 0; }
      encore += tier === 2 ? (stylish ? 14 : 7) : (tier === 1 ? 3 : 0);
    }
    if (boss.hp <= 0) break;

    /* --- partner (only if standing) --- */
    if (partnerHp.hp > 0) {
      const tierP = chance(skill.perfect) ? 2 : (chance(skill.land / (1 - skill.perfect + 1e-9)) ? 1 : 0);
      boss.hp -= heroHit(partnerM, p.partnerRank, { atk: p.mods.atkP }, tierP, false, B, effDef);
      encore += tierP === 2 ? 7 : (tierP === 1 ? 3 : 0);
      if (boss.hp <= 0) break;
    }

    /* --- phases: ordered cursor, matching 14_battle.js:1320 --- */
    while (boss.phaseIdx < (B.phases || []).length &&
           boss.hp / boss.maxHp <= B.phases[boss.phaseIdx].at) {
      const ph = B.phases[boss.phaseIdx++];
      /* ph.mods.atk is deliberately NOT applied: the game increments f.atk,
         which its own damage path never reads. ph.mods.def IS real. */
      if (ph.mods && ph.mods.def) boss.def = Math.max(0, boss.def + ph.mods.def);
      if (ph.add) boss.moves = boss.moves.concat(ph.add);
    }

    /* --- boss --- */
    const mv = pickWeighted(boss.moves);
    if (mv.target === 'self' || mv.guard || mv.heal) {
      if (mv.atkBuff) { boss.atkUp = Math.max(boss.atkUp, mv.atkBuff); boss.atkUpTurns = mv.turns || 3; }
      if (mv.guard) { boss.guardAmt = mv.guard; boss.guardTurns = mv.turns || 2; }
      if (mv.heal) boss.hp = Math.min(boss.maxHp, boss.hp + mv.heal);
      continue;
    }
    const g = () => chance(skill.superguard) ? 'superguard' : (chance(skill.guard) ? 'guard' : 'none');
    if (mv.target === 'both') {
      p.hp -= foeHit(mv, boss.atkUp, g(), p.mods.def || 0);
      if (partnerHp.hp > 0) partnerHp.hp -= foeHit(mv, boss.atkUp, g(), p.mods.defP || 0);
    } else if (mv.target === 'partner') {
      if (partnerHp.hp > 0) partnerHp.hp -= foeHit(mv, boss.atkUp, g(), p.mods.defP || 0);
      else p.hp -= foeHit(mv, boss.atkUp, g(), p.mods.def || 0);
    } else {
      /* 'random' (the m() factory default) picks uniformly among standing
         players — 14_battle.js:1396 `victims = [U.pick(players)]` */
      if (partnerHp.hp > 0 && chance(0.5)) partnerHp.hp -= foeHit(mv, boss.atkUp, g(), p.mods.defP || 0);
      else p.hp -= foeHit(mv, boss.atkUp, g(), p.mods.def || 0);
    }
  }

  return {
    win: boss.hp <= 0, dead: p.hp <= 0, rounds: round,
    hpLeft: Math.max(0, p.hp), maxHp: p.maxHp, runaway: round >= RUNAWAY && boss.hp > 0
  };
}

function trial(bossId, level, skill, style, n) {
  let wins = 0, rounds = 0, hpLeft = 0, runaways = 0, deaths = 0;
  for (let i = 0; i < n; i++) {
    const r = simulate(bossId, level, skill, style);
    if (r.win) { wins++; rounds += r.rounds; hpLeft += r.hpLeft; }
    if (r.dead) deaths++;
    if (r.runaway) runaways++;
  }
  return {
    winRate: wins / n, deathRate: deaths / n,
    avgRounds: wins ? rounds / wins : Infinity,
    avgHpLeft: wins ? hpLeft / wins : 0,
    runawayRate: runaways / n
  };
}

/* ---- three player archetypes ------------------------------------------- */
const SKILLS = {
  /* never learns the timing, never guards, carries a couple of heals */
  flailing: { perfect: 0.05, land: 0.35, stylish: 0, guard: 0.05, superguard: 0.00, items: 2 },
  /* lands most commands, guards about half, rarely superguards */
  average: { perfect: 0.35, land: 0.80, stylish: 0.15, guard: 0.45, superguard: 0.05, items: 4 },
  /* near-perfect commands and reliable superguards */
  expert: { perfect: 0.85, land: 0.98, stylish: 0.70, guard: 0.60, superguard: 0.45, items: 6 },
  /* A player who has read the badge list, builds for pierce, and superguards
     most incoming hits. This is close to the theoretical ceiling. */
  optimal: { perfect: 0.95, land: 1.0, stylish: 0.9, guard: 0.3, superguard: 0.65, items: 10, optimal: true }
};

/* Chapter each boss belongs to, for the "level you'd plausibly be" column. */
const CH = {
  bramblejack: 1, pyra_sizzlefold: 2, nautilus_grim: 3, great_kerf: 4,
  the_redactor: 5, crinkle_wyrm: 6, chief_ampere: 7, duke_smudge: 8,
  smudge_ascendant: 8, the_blank: 8,
  wick_and_wisp: 2, barnacle_bosun: 3, trimmet: 4, footnote_fenn: 5,
  fenrisk: 6, foreman_ratchet: 7, captain_sable: 8,
  origami_sovereign: 9, vermillion: 9, first_draft: 6
};
/* Rough level a player reaches by each chapter: bosses give 60-200 SP, rank
   and file 3-12, 100 SP per level, with income taxed as you out-level. */
/* Derived by replaying every placed encounter through the real SP formula
   (see the level-curve walk in the commit message), not assumed. */
const EXPECTED_LEVEL = { 1: 2, 2: 5, 3: 8, 4: 12, 5: 17, 6: 22, 7: 27, 8: 32, 9: 35 };

const bossIds = Object.keys(E).filter(k => (E[k].flags || []).includes('boss'));
const list = ONLY ? [ONLY] : bossIds;

console.log(`PAPERBOUND balance probe — difficulty=${DIFFICULTY}, ${TRIALS} trials per cell\n`);
console.log('boss                  ch  lv   HP  atk def | flailing average  expert  optimal | rnds hp/max');
console.log('-'.repeat(104));

const flagged = [];
for (const id of list) {
  const B = E[id];
  if (!B) { console.log(`  ?? unknown boss ${id}`); continue; }
  const ch = CH[id] || 1;
  const lv = EXPECTED_LEVEL[ch];

  const f = trial(id, lv, SKILLS.flailing, 'hp', TRIALS);
  const a = trial(id, lv, SKILLS.average, 'hp', TRIALS);
  const x = trial(id, lv, SKILLS.expert, 'bp', TRIALS);
  const o = trial(id, lv, SKILLS.optimal, 'bp', TRIALS);

  const pct = (v) => (v * 100).toFixed(0).padStart(3) + '%';
  console.log(
    `${id.padEnd(20)} ${String(ch).padStart(2)} ${String(lv).padStart(3)} ${String(B.hp).padStart(4)} ` +
    `${String(B.atk).padStart(3)} ${String(B.def || 0).padStart(3)} | ` +
    `${pct(f.winRate)}   ${pct(a.winRate)}   ${pct(x.winRate)}   ${pct(o.winRate)}  | ` +
    `${(o.avgRounds === Infinity ? ' -' : o.avgRounds.toFixed(0)).padStart(4)} ` +
    `${o.winRate ? (o.avgHpLeft).toFixed(0) + '/' + buildPlayer(lv, 'bp').maxHp : '-'}`
  );

  if (a.winRate < 0.5) flagged.push({ id, ch, lv, winRate: a.winRate, hp: B.hp, atk: B.atk });

  if (VERBOSE) {
    for (const [name, sk] of Object.entries(SKILLS)) {
      const row = [];
      for (let L = Math.max(1, lv - 6); L <= lv + 10; L += 2) {
        row.push(`lv${L}:${(trial(id, L, sk, 'hp', 1200).winRate * 100).toFixed(0)}%`);
      }
      console.log(`    ${name.padEnd(9)} ${row.join('  ')}`);
    }
  }
}

if (flagged.length) {
  console.log('\n\x1b[33mBosses an average player loses to at the expected level:\x1b[0m');
  for (const f of flagged) {
    console.log(`  ${f.id} (ch${f.ch}, lv${f.lv}) — ${(f.winRate * 100).toFixed(0)}% win rate, ${f.hp} HP / ${f.atk} atk`);
    /* how much level would it take? */
    let need = null;
    for (let L = f.lv; L <= 40; L++) {
      if (trial(f.id, L, SKILLS.average, 'hp', 1500).winRate >= 0.7) { need = L; break; }
    }
    console.log(`      average play needs ~lv${need === null ? '40+' : need} for a 70% win rate` +
      (need ? ` (${need - f.lv} levels of grinding)` : ''));
  }
} else {
  console.log('\n\x1b[32mEvery boss is winnable by an average player at the expected level.\x1b[0m');
}
