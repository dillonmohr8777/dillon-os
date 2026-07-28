/* ==========================================================================
   PAPERBOUND — 11_state.js
   The save object and every rule that reads or writes it: levelling, party
   stats, inventory limits, flags, quests, and three localStorage slots.
   ========================================================================== */
'use strict';

PB.State = (function () {
  var U = PB.U;
  var SAVE_KEY = 'paperbound.save.';
  var CFG_KEY = 'paperbound.config';
  var VERSION = 3;

  var S = null;                  // the live save object

  var ITEM_CAP = 20, STORE_CAP = 40, KEY_CAP = 64;

  function fresh(name, difficulty) {
    return {
      v: VERSION,
      name: name || 'Pip',
      difficulty: difficulty || 'normal',   // relaxed | normal | folded
      chapter: 0,
      level: 1, sp: 0, spTotal: 0,
      hp: 15, maxHp: 15,
      fp: 8, maxFp: 8,
      bp: 3,
      se: 100, maxSe: 100,        // Seal Energy; max grows with each Seal
      stompRank: 1, malletRank: 1,
      coins: 0,
      shards: 0,                  // Foil Shards upgrade partners
      partners: {},               // id -> {rank, hp, unlocked}
      active: null,
      items: [],
      store: [],
      keyItems: [],
      badges: { owned: [], equipped: [] },
      seals: [],                  // unlocked Seal Power move ids
      forms: [],                  // unlocked Origami Form move ids
      recipes: [],                // discovered recipe result ids
      flags: {},
      quests: {},                 // id -> {state:'open'|'done', progress}
      tattled: {},
      defeated: {},               // enemy id -> count
      map: 'quill_square', spawn: 'default',
      coliseumRank: 0,
      frames: 0,
      stats: { battles: 0, wins: 0, flees: 0, stylish: 0, damage: 0, taken: 0, steps: 0, superguards: 0 }
    };
  }

  function start(name, difficulty) {
    S = fresh(name, difficulty);
    givePartner('twigby');
    S.active = 'twigby';
    addKey('map_foldheim');
    unlockForm('form_crane');
    return S;
  }

  function get() { return S; }
  function set(obj) { S = obj; migrate(); return S; }

  function migrate() {
    if (!S) return;
    var d = fresh();
    for (var k in d) if (S[k] === undefined) S[k] = d[k];
    for (var sk in d.stats) if (S.stats[sk] === undefined) S.stats[sk] = d.stats[sk];
    S.v = VERSION;
  }

  /* ---- levelling --------------------------------------------------------
     100 Seal Points per level, flat, like the games this owes a debt to.
     On level-up the player picks HP +5 / FP +5 / BP +3. */
  function spToNext() { return 100; }
  function addSp(n) {
    var m = badgeMods();
    n = Math.max(0, Math.round(n * (1 + (m.spBonus || 0))));
    S.sp += n; S.spTotal += n;
    var levels = 0;
    while (S.sp >= spToNext() && S.level < 40) { S.sp -= spToNext(); S.level++; levels++; }
    return { gained: n, levels: levels };
  }
  function applyLevelChoice(choice) {
    if (choice === 'hp') { S.maxHp += 5; S.hp = Math.min(maxHp(), S.hp + 5); }
    else if (choice === 'fp') { S.maxFp += 5; S.fp = Math.min(maxFp(), S.fp + 5); }
    else { S.bp += 3; }
  }

  /* ---- derived stats ----------------------------------------------------- */
  function badgeMods() { return PB.Badges.mods(S ? S.badges.equipped : []); }
  function maxHp() { return S.maxHp + (badgeMods().maxHp || 0); }
  function maxFp() { return S.maxFp + (badgeMods().maxFp || 0); }
  function maxBp() { return S.bp + (badgeMods().bonusBp || 0); }
  function bpUsed() { return PB.Badges.cost(S.badges.equipped); }
  function bpFree() { return maxBp() - bpUsed(); }
  function partnerMaxHp(id) {
    var p = S.partners[id]; if (!p) return 0;
    return PB.Partners.maxHp(id, p.rank) + (badgeMods().maxHpP || 0);
  }
  function heal(hp, fp) {
    if (hp) S.hp = U.clamp(S.hp + hp, 0, maxHp());
    if (fp) S.fp = U.clamp(S.fp + fp, 0, maxFp());
  }
  function healParty(hp) {
    heal(hp, 0);
    var a = S.active;
    if (a && S.partners[a]) S.partners[a].hp = U.clamp(S.partners[a].hp + hp, 0, partnerMaxHp(a));
  }
  function fullHeal() {
    S.hp = maxHp(); S.fp = maxFp();
    for (var k in S.partners) S.partners[k].hp = partnerMaxHp(k);
  }
  function addSe(n) { S.se = U.clamp(S.se + n, 0, S.maxSe); }

  /* ---- partners ---------------------------------------------------------- */
  function givePartner(id) {
    if (S.partners[id]) return false;
    S.partners[id] = { rank: 1, hp: PB.Partners.maxHp(id, 1) };
    if (!S.active) S.active = id;
    return true;
  }
  function hasPartner(id) { return !!S.partners[id]; }
  function partnerList() {
    return PB.Partners.order.filter(function (id) { return !!S.partners[id]; });
  }
  function rankUp(id) {
    var p = S.partners[id]; if (!p || p.rank >= 3) return false;
    p.rank++;
    p.hp = partnerMaxHp(id);
    return true;
  }
  function setActive(id) { if (S.partners[id]) S.active = id; }
  function activePartner() { return S.active && S.partners[S.active] ? S.active : null; }

  /* ---- inventory --------------------------------------------------------- */
  function itemCount() { return S.items.length; }
  function addItem(id, toStore) {
    if (!PB.Items.get(id)) return false;
    if (PB.Items.isKey(id)) return addKey(id);
    if (!toStore && S.items.length < ITEM_CAP) { S.items.push(id); return true; }
    if (S.store.length < STORE_CAP) { S.store.push(id); return 'store'; }
    return false;
  }
  function removeItem(id) {
    var i = S.items.indexOf(id);
    if (i < 0) return false;
    S.items.splice(i, 1); return true;
  }
  function hasItem(id) { return S.items.indexOf(id) >= 0; }
  function addKey(id) {
    if (S.keyItems.indexOf(id) >= 0) return false;
    if (S.keyItems.length >= KEY_CAP) return false;
    S.keyItems.push(id); return true;
  }
  function hasKey(id) { return S.keyItems.indexOf(id) >= 0; }
  function removeKey(id) {
    var i = S.keyItems.indexOf(id);
    if (i < 0) return false;
    S.keyItems.splice(i, 1); return true;
  }
  function addCoins(n) {
    var m = badgeMods();
    if (n > 0 && m.coinBonus) n = Math.round(n * (1 + m.coinBonus));
    S.coins = U.clamp(S.coins + n, 0, 9999);
    return n;
  }

  /* ---- badges / forms / seals -------------------------------------------- */
  function giveBadge(id) {
    if (!PB.Badges.get(id) || S.badges.owned.indexOf(id) >= 0) return false;
    S.badges.owned.push(id); return true;
  }
  function hasBadge(id) { return S.badges.owned.indexOf(id) >= 0; }
  function isEquipped(id) { return S.badges.equipped.indexOf(id) >= 0; }
  function equipBadge(id) {
    if (!hasBadge(id) || isEquipped(id)) return false;
    var b = PB.Badges.get(id);
    if (b.bp > bpFree()) return false;
    S.badges.equipped.push(id); return true;
  }
  function unequipBadge(id) {
    var i = S.badges.equipped.indexOf(id);
    if (i < 0) return false;
    S.badges.equipped.splice(i, 1);
    S.hp = Math.min(S.hp, maxHp()); S.fp = Math.min(S.fp, maxFp());
    return true;
  }
  function unlockForm(id) {
    if (S.forms.indexOf(id) >= 0) return false;
    S.forms.push(id); return true;
  }
  function unlockSeal(id) {
    if (S.seals.indexOf(id) >= 0) return false;
    S.seals.push(id);
    S.maxSe = Math.min(700, 100 + S.seals.length * 100);
    S.se = S.maxSe;
    return true;
  }
  function learnRecipe(id) {
    if (S.recipes.indexOf(id) >= 0) return false;
    S.recipes.push(id); return true;
  }

  /* ---- flags & quests ----------------------------------------------------- */
  function flag(k, v) {
    if (v === undefined) return S.flags[k];
    S.flags[k] = v; return v;
  }
  function hasFlag(k) { return !!S.flags[k]; }
  function questStart(id) { if (!S.quests[id]) S.quests[id] = { state: 'open', p: 0 }; }
  function questProgress(id, n) {
    if (!S.quests[id]) questStart(id);
    S.quests[id].p += (n === undefined ? 1 : n);
  }
  function questDone(id) { if (!S.quests[id]) questStart(id); S.quests[id].state = 'done'; }
  function questState(id) { return S.quests[id] ? S.quests[id].state : 'none'; }
  function tattle(id) { S.tattled[id] = true; }
  function isTattled(id) { return !!S.tattled[id]; }
  function recordDefeat(id) { S.defeated[id] = (S.defeated[id] || 0) + 1; }

  /* ---- difficulty ---------------------------------------------------------
     Damage the player takes is scaled; Seal Point income moves the other way
     so a harder run also levels a little faster. */
  var DIFF = {
    relaxed: { inDmg: .6, outDmg: 1.25, sp: .85, label: 'Relaxed' },
    normal: { inDmg: 1, outDmg: 1, sp: 1, label: 'Normal' },
    folded: { inDmg: 1.5, outDmg: .9, sp: 1.3, label: 'Folded' }
  };
  function diff() { return DIFF[S && S.difficulty ? S.difficulty : 'normal']; }

  /* ---- persistence -------------------------------------------------------- */
  function canStore() {
    try { return typeof localStorage !== 'undefined'; } catch (e) { return false; }
  }
  function save(slot) {
    if (!canStore() || !S) return false;
    try {
      localStorage.setItem(SAVE_KEY + slot, JSON.stringify(S));
      return true;
    } catch (e) { return false; }
  }
  function load(slot) {
    if (!canStore()) return null;
    try {
      var raw = localStorage.getItem(SAVE_KEY + slot);
      if (!raw) return null;
      var o = JSON.parse(raw);
      S = o; migrate();
      return S;
    } catch (e) { return null; }
  }
  function peek(slot) {
    if (!canStore()) return null;
    try {
      var raw = localStorage.getItem(SAVE_KEY + slot);
      if (!raw) return null;
      var o = JSON.parse(raw);
      return {
        name: o.name, level: o.level, chapter: o.chapter, coins: o.coins,
        frames: o.frames, map: o.map, seals: (o.seals || []).length,
        difficulty: o.difficulty || 'normal'
      };
    } catch (e) { return null; }
  }
  function erase(slot) {
    if (!canStore()) return;
    try { localStorage.removeItem(SAVE_KEY + slot); } catch (e) { }
  }
  function saveConfig(cfg) {
    if (!canStore()) return;
    try { localStorage.setItem(CFG_KEY, JSON.stringify(cfg)); } catch (e) { }
  }
  function loadConfig() {
    if (!canStore()) return null;
    try { return JSON.parse(localStorage.getItem(CFG_KEY) || 'null'); } catch (e) { return null; }
  }

  return {
    VERSION: VERSION, ITEM_CAP: ITEM_CAP, STORE_CAP: STORE_CAP,
    fresh: fresh, start: start, get: get, set: set,
    spToNext: spToNext, addSp: addSp, applyLevelChoice: applyLevelChoice,
    badgeMods: badgeMods, maxHp: maxHp, maxFp: maxFp, maxBp: maxBp,
    bpUsed: bpUsed, bpFree: bpFree, partnerMaxHp: partnerMaxHp,
    heal: heal, healParty: healParty, fullHeal: fullHeal, addSe: addSe,
    givePartner: givePartner, hasPartner: hasPartner, partnerList: partnerList,
    rankUp: rankUp, setActive: setActive, activePartner: activePartner,
    itemCount: itemCount, addItem: addItem, removeItem: removeItem, hasItem: hasItem,
    addKey: addKey, hasKey: hasKey, removeKey: removeKey, addCoins: addCoins,
    giveBadge: giveBadge, hasBadge: hasBadge, isEquipped: isEquipped,
    equipBadge: equipBadge, unequipBadge: unequipBadge,
    unlockForm: unlockForm, unlockSeal: unlockSeal, learnRecipe: learnRecipe,
    flag: flag, hasFlag: hasFlag,
    questStart: questStart, questProgress: questProgress, questDone: questDone, questState: questState,
    tattle: tattle, isTattled: isTattled, recordDefeat: recordDefeat,
    diff: diff, DIFF: DIFF,
    save: save, load: load, peek: peek, erase: erase,
    saveConfig: saveConfig, loadConfig: loadConfig
  };
})();
