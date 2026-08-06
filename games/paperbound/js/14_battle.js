/* ==========================================================================
   PAPERBOUND — 14_battle.js
   Turn-based stage combat. Hero and partner each act, then every foe acts.

   Sequencing is written as generators and stepped one frame at a time by
   Coro, which keeps multi-beat animations readable:
       yield 20;                  // wait 20 frames
       yield {cmd: actionCommand}; // run a minigame, receive its result
       yield {until: fn};          // block until fn() is true
   ========================================================================== */
'use strict';

PB.Battle = (function () {
  var U = PB.U, P = PB.Paper, In = PB.Input, A = PB.Audio, Spr = PB.Sprites;
  var UI = PB.UI, St = PB.State, Mv = PB.Moves, En = PB.Enemies, It = PB.Items;
  var AC = PB.ActionCmd;

  var W = 960, H = 540;
  var FLOOR = 392;            // stage baseline
  /* The party sits clear of the command menu in the bottom-left, and the four
     foe slots stay inside the curtains. */
  var HERO_X = 424, PART_X = 322;
  var FOE_X = [612, 700, 782, 856];

  /* ======================================================================
     Coroutine runner
     ====================================================================== */
  function Coro(gen) { this.g = gen; this.wait = 0; this.until = null; this.cmd = null; this.guard = null; this.done = false; this.send = undefined; }
  Coro.prototype.step = function (ctxObj) {
    if (this.done) return true;
    if (this.wait > 0) { this.wait--; return false; }
    if (this.cmd) {
      if (!this.cmd.update()) return false;
      this.send = this.cmd.result; this.cmd = null;
    }
    if (this.guard) {
      if (!this.guard.update()) return false;
      this.send = this.guard; this.guard = null;
    }
    if (this.until) { if (!this.until()) return false; this.until = null; }
    var r;
    try { r = this.g.next(this.send); }
    catch (e) { if (window.console) console.error('battle coroutine', e); this.done = true; return true; }
    this.send = undefined;
    if (r.done) { this.done = true; return true; }
    var v = r.value;
    if (typeof v === 'number') this.wait = v;
    else if (v && v.cmd) this.cmd = v.cmd;
    else if (v && v.guard) this.guard = v.guard;
    else if (v && v.until) this.until = v.until;
    return false;
  };
  Coro.prototype.drawExtra = function (ctx) {
    if (this.cmd) this.cmd.draw(ctx, W / 2, H - 118);
  };

  /* ======================================================================
     Combatants
     ====================================================================== */
  function mkHero() {
    var S = St.get();
    return {
      side: 'player', kind: 'hero', id: 'pip', name: S.name, sprite: 'pip',
      hp: S.hp, maxHp: St.maxHp(), atk: 0, def: 0,
      flags: ['ground'], weak: [], resist: [], immune: [],
      st: [], buffs: [], form: null, formTurns: 0,
      x: HERO_X, y: FLOOR, z: 0, anim: 'idle', t: U.rndInt(60), flip: 1,
      down: false, defending: false, hitFlash: 0, shake: 0, lift: 0
    };
  }
  function mkPartner(id) {
    var S = St.get(), pd = PB.Partners.get(id);
    return {
      side: 'player', kind: 'partner', id: id, name: pd.name, sprite: pd.sprite,
      hp: S.partners[id].hp, maxHp: St.partnerMaxHp(id), atk: 0, def: 0,
      rank: S.partners[id].rank,
      flags: ['ground'], weak: [], resist: [], immune: [],
      st: [], buffs: [],
      x: PART_X, y: FLOOR, z: 0, anim: 'idle', t: U.rndInt(60), flip: 1,
      down: false, defending: false, hitFlash: 0, shake: 0, lift: 0
    };
  }
  function mkFoe(eid, slot) {
    var d = En.get(eid);
    if (!d) d = En.get('crumple');
    var air = d.flags.indexOf('air') >= 0;
    return {
      side: 'enemy', kind: 'enemy', id: d.id, name: d.name, sprite: d.sprite, data: d,
      hp: d.hp, maxHp: d.hp, atk: d.atk, def: d.def,
      flags: d.flags.slice(), weak: d.weak.slice(), resist: d.resist.slice(), immune: d.immune.slice(),
      st: [], buffs: [], guardTurns: 0, guardAmt: 0, evade: 0, evadeTurns: 0,
      moves: d.moves.slice(), phaseIdx: 0,
      slot: slot, x: FOE_X[slot] || (FOE_X[3] + (slot - 3) * 70), y: FLOOR, z: 0,
      anim: 'idle', t: U.rndInt(60), flip: -1, down: false, hitFlash: 0, shake: 0, lift: air ? 0 : 0,
      grounded: !air, lastCopy: null
    };
  }

  function isAir(c) { return c.flags.indexOf('air') >= 0 && c.grounded !== true; }
  function hasFlag(c, f) { return c.flags.indexOf(f) >= 0; }

  /* ======================================================================
     Status effects
     ====================================================================== */
  var STATUS = {
    poison: { name: 'Poison', color: '#8fcf52', dot: 2, icon: 'drop' },
    burn: { name: 'Burn', color: '#ff7a2e', dot: 2, icon: 'orb' },
    freeze: { name: 'Frozen', color: '#9fd8f0', skip: true, icon: 'orb' },
    sleep: { name: 'Asleep', color: '#c8a2e8', skip: true, wake: true, icon: 'orb' },
    dizzy: { name: 'Dizzy', color: '#f5c02e', miss: .5, icon: 'star' },
    soggy: { name: 'Soggy', color: '#57b8ea', atk: -2, icon: 'drop' },
    crumple: { name: 'Crumpled', color: '#a9713f', def: -2, icon: 'card' },
    inked: { name: 'Inked', color: '#4a3560', miss: .45, icon: 'bottle' },
    shrink: { name: 'Shrunk', color: '#c8a2e8', atkMul: .5, icon: 'orb' },
    tangled: { name: 'Tangled', color: '#8a5a30', skip: true, icon: 'coil' },
    silence: { name: 'Silenced', color: '#2a1c3c', silence: true, icon: 'card' },
    electrified: { name: 'Electrified', color: '#ffe066', thorns: 1, icon: 'bolt' }
  };
  var BUFFS = {
    atkUp: { name: 'Attack Up', color: '#e0483c' },
    defUp: { name: 'Defence Up', color: '#57b8ea' },
    dodgy: { name: 'Dodgy', color: '#8fd0f0' },
    charge: { name: 'Charged', color: '#f5c02e' },
    regen: { name: 'Regen', color: '#7fe0d0' },
    thorns: { name: 'Thorns', color: '#c8a2e8' },
    vuln: { name: 'Marked', color: '#f07a8a' }
  };

  function statusImmune(c) {
    if (c.kind === 'hero') return !!St.badgeMods().statusImmune;
    if (c.kind === 'partner') return !!St.badgeMods().statusImmuneP;
    return false;
  }
  function addStatus(c, type, turns, amt) {
    if (!STATUS[type]) return false;
    if (c.immune.indexOf(type) >= 0) return false;
    if (statusImmune(c)) return false;
    if (c.down) return false;
    for (var i = 0; i < c.st.length; i++) {
      if (c.st[i].type === type) { c.st[i].turns = Math.max(c.st[i].turns, turns); return true; }
    }
    c.st.push({ type: type, turns: turns, amt: amt || 0 });
    return true;
  }
  function hasStatus(c, t) {
    for (var i = 0; i < c.st.length; i++) if (c.st[i].type === t) return true;
    return false;
  }
  function clearStatus(c, t) {
    for (var i = c.st.length - 1; i >= 0; i--) if (c.st[i].type === t) c.st.splice(i, 1);
  }
  function clearAllStatus(c) { c.st.length = 0; }
  function addBuff(c, type, amt, turns) {
    for (var i = 0; i < c.buffs.length; i++) {
      if (c.buffs[i].type === type) {
        c.buffs[i].amt = type === 'charge' ? c.buffs[i].amt + amt : Math.max(c.buffs[i].amt, amt);
        c.buffs[i].turns = Math.max(c.buffs[i].turns, turns);
        return;
      }
    }
    c.buffs.push({ type: type, amt: amt, turns: turns });
  }
  function buffAmt(c, type) {
    for (var i = 0; i < c.buffs.length; i++) if (c.buffs[i].type === type) return c.buffs[i].amt;
    return 0;
  }
  function clearBuff(c, type) {
    for (var i = c.buffs.length - 1; i >= 0; i--) if (c.buffs[i].type === type) c.buffs.splice(i, 1);
  }
  function dispel(c) { c.buffs.length = 0; if (c.kind === 'hero') { c.form = null; c.formTurns = 0; } }

  function statMod(c, key) {
    var v = 0;
    for (var i = 0; i < c.st.length; i++) {
      var d = STATUS[c.st[i].type];
      if (d && d[key]) v += d[key];
    }
    return v;
  }
  function statMul(c, key) {
    var v = 1;
    for (var i = 0; i < c.st.length; i++) {
      var d = STATUS[c.st[i].type];
      if (d && d[key] !== undefined) v *= d[key];
    }
    return v;
  }

  /* ======================================================================
     The scene
     ====================================================================== */
  function Battle(cfg, onEnd) {
    this.cfg = cfg || {};
    this.onEnd = onEnd || function () { };
    this.t = 0;
    this.phase = 'intro';
    this.co = null;
    this.log = [];
    this.numbers = [];
    this.fx = [];
    this.shake = 0;
    this.dlg = new UI.Dialogue();
    this.fader = new UI.Fader();
    this.result = null;
    this.round = 0;
    this.actor = null;
    this.menuStack = [];
    this.audience = cfg.audience === undefined ? 24 : cfg.audience;
    this.audienceMax = 100;
    this.encore = 0;
    this.itemsUsed = 0;
    this.ranAway = false;
    this.spGained = 0; this.coinsGained = 0; this.itemsGained = [];
    this.firstStrike = cfg.firstStrike || 0;   // 1 = player advantage, -1 = ambushed
    this.boss = !!cfg.boss;
    this.bg = cfg.bg || 'stage';
    this.tattleTarget = null;
    this.lastPlayerMove = null;
    this.msg = null; this.msgT = 0;
    this.crowdTossT = 0;

    var S = St.get();
    this.hero = mkHero();
    this.partner = S.active ? mkPartner(S.active) : null;
    this.foes = [];
    var list = cfg.enemies || ['crumple'];
    for (var i = 0; i < list.length && i < 5; i++) this.foes.push(mkFoe(list[i], i));

    this.everyone = function () {
      var a = [this.hero];
      if (this.partner) a.push(this.partner);
      return a.concat(this.foes);
    };
    A.play(cfg.music || (this.boss ? 'boss' : 'battle'));
    this.co = new Coro(this.introSeq());
  }

  Battle.prototype.alive = function (side) {
    var out = [];
    if (side === 'enemy') {
      for (var i = 0; i < this.foes.length; i++) if (!this.foes[i].down) out.push(this.foes[i]);
    } else {
      if (!this.hero.down) out.push(this.hero);
      if (this.partner && !this.partner.down) out.push(this.partner);
    }
    return out;
  };
  Battle.prototype.frontFoe = function () {
    var a = this.alive('enemy').filter(function (f) { return !isAir(f); });
    if (!a.length) return null;
    a.sort(function (p, q) { return p.x - q.x; });
    return a[0];
  };

  /* ---- feedback helpers --------------------------------------------------- */
  Battle.prototype.number = function (txt, x, y, color, crit) {
    this.numbers.push({ txt: '' + txt, x: x, y: y, t: 0, c: color || '#fff', crit: !!crit });
  };
  Battle.prototype.say = function (txt, style, speaker, portrait) {
    this.dlg.say(txt, { style: style || 'normal', speaker: speaker || '', portrait: portrait || null });
  };
  Battle.prototype.banner = function (txt, col) { this.msg = { txt: txt, c: col || '#ffe066' }; this.msgT = 70; };
  Battle.prototype.puff = function (x, y, color, n, spd) {
    for (var i = 0; i < (n || 8); i++) {
      this.fx.push({
        k: 'bit', x: x, y: y, vx: U.rndRange(-1, 1) * (spd || 3), vy: U.rndRange(-3.4, -0.6) * (spd ? spd / 3 : 1),
        r: U.rndRange(2.5, 6), c: color || '#f7edd6', t: 0, life: 42, rot: U.rndRange(0, 6.28), vr: U.rndRange(-.3, .3)
      });
    }
  };
  Battle.prototype.slash = function (x, y, color) { this.fx.push({ k: 'slash', x: x, y: y, c: color || '#fff', t: 0, life: 18, a: U.rndRange(-.7, .7) }); };
  Battle.prototype.ring = function (x, y, color, r) { this.fx.push({ k: 'ring', x: x, y: y, c: color || '#fff', t: 0, life: 26, r: r || 40 }); };

  /* ---- audience ------------------------------------------------------------ */
  Battle.prototype.addAudience = function (n) {
    var m = St.badgeMods();
    if (n > 0 && m.crowd) n *= 2;
    this.audience = U.clamp(this.audience + n, 0, this.audienceMax);
  };
  Battle.prototype.addEncore = function (n) {
    var m = St.badgeMods();
    if (m.stylish) n *= 2;
    this.encore = U.clamp(this.encore + n, 0, 100);
  };

  /* ======================================================================
     Damage
     ====================================================================== */
  function elementMult(target, element) {
    if (!element || element === 'none') return 1;
    if (target.immune.indexOf(element) >= 0) return 0;
    if (target.weak.indexOf(element) >= 0) return 1.5;
    if (target.resist.indexOf(element) >= 0) return 0.5;
    return 1;
  }

  Battle.prototype.attackerPower = function (src, move) {
    var p = 0, m = St.badgeMods();
    if (src.kind === 'hero') {
      p += (m.atk || 0);
      if (src.form) {
        var f = Mv.get(src.form) && Mv.get(src.form).form;
        if (f && f.atk) p += f.atk;
      }
      var S = St.get();
      if (St.maxHp() > 0) {
        if (S.hp <= 1 && m.megaRush) p += m.megaRush;
        else if (S.hp <= 5 && m.powerRush) p += m.powerRush;
      }
    } else if (src.kind === 'partner') p += (m.atkP || 0);
    p += buffAmt(src, 'atkUp');
    p += buffAmt(src, 'charge');
    p += statMod(src, 'atk');
    p = Math.round(p * statMul(src, 'atkMul'));
    return p;
  };

  Battle.prototype.defenceOf = function (c) {
    var d = 0, m = St.badgeMods();
    if (c.kind === 'enemy') d = c.def + (c.guardTurns > 0 ? c.guardAmt : 0);
    else {
      if (c.kind === 'hero') {
        d = (m.def || 0);
        if (c.form) { var f = Mv.get(c.form) && Mv.get(c.form).form; if (f && f.def) d += f.def; }
      } else d = (m.defP || 0);
    }
    d += buffAmt(c, 'defUp');
    d += statMod(c, 'def');
    return d;
  };

  /* Returns the number actually dealt. Applies status, thorns and death. */
  Battle.prototype.dealDamage = function (src, tgt, raw, opts) {
    opts = opts || {};
    if (tgt.down) return 0;
    var dmg = raw;
    var mult = elementMult(tgt, opts.element);
    if (mult === 0) { this.number('IMMUNE', tgt.x, tgt.y - 70, '#9aa3b0'); return 0; }
    dmg = mult > 1 ? Math.ceil(dmg * mult) : (mult < 1 ? Math.floor(dmg * mult) : dmg);
    if (!opts.pierce) dmg -= this.defenceOf(tgt);
    dmg += buffAmt(tgt, 'vuln');
    var m = St.badgeMods();
    if (tgt.side === 'player') {
      if (tgt.defending) dmg = Math.ceil(dmg / 2);
      if (opts.guard === 'guard') dmg -= 1 + (m.damageDodge || 0);
      if (opts.guard === 'superguard') dmg = 0;
      if (m.lastStand && St.get().hp <= 5 && tgt.kind === 'hero') dmg = Math.ceil(dmg / 2);
      if (m.fragile) dmg = Math.round(dmg * 2);
      dmg = Math.round(dmg * St.diff().inDmg);
      if (m.icePower && hasFlag(src, 'icy')) dmg = 0;
    } else {
      dmg = Math.round(dmg * St.diff().outDmg);
      if (m.featherweight && src && src.side === 'player') dmg = Math.min(dmg, 1);
      if (m.icePower && hasStatus(tgt, 'freeze')) dmg += 1;
    }
    dmg = Math.max(0, dmg);

    if (dmg === 0) {
      this.number(opts.guard === 'superguard' ? 'BLOCK!' : '0', tgt.x, tgt.y - 70, '#cfd6de');
    } else {
      tgt.hp = Math.max(0, tgt.hp - dmg);
      tgt.hitFlash = 14; tgt.shake = 10;
      this.number(dmg, tgt.x, tgt.y - 70, tgt.side === 'player' ? '#ff8a8a' : '#fff8e0', mult > 1);
      this.shake = Math.min(16, this.shake + 3 + dmg * .4);
      A.sfx(dmg >= 8 ? 'hitBig' : 'hit');
      this.puff(tgt.x, tgt.y - 30, mult > 1 ? '#ffe066' : '#f7edd6', 6 + Math.min(10, dmg));
      if (mult > 1) this.banner('WEAK POINT!', '#ffe066');
      if (tgt.side === 'player') St.get().stats.taken += dmg;
      else St.get().stats.damage += dmg;
      if (src && src.side === 'player' && m.payoff) { this.coinsGained += 1; }
    }

    // wake sleepers
    if (dmg > 0 && hasStatus(tgt, 'sleep')) clearStatus(tgt, 'sleep');
    if (dmg > 0 && hasStatus(tgt, 'freeze') && opts.element === 'fire') clearStatus(tgt, 'freeze');
    if (dmg > 0 && hasStatus(tgt, 'burn') && (opts.element === 'water' || opts.douse)) clearStatus(tgt, 'burn');

    // status rider
    if (dmg > 0 && opts.status && U.chance(opts.status.chance * (opts.perfect ? 1.4 : 1))) {
      if (addStatus(tgt, opts.status.type, opts.status.turns)) {
        this.number(STATUS[opts.status.type].name + '!', tgt.x, tgt.y - 92, STATUS[opts.status.type].color);
      }
    }
    if (opts.halveDef && tgt.kind === 'enemy') { tgt.def = Math.floor(tgt.def / 2); this.number('DEF HALVED', tgt.x, tgt.y - 92, '#cfd6de'); }

    // thorns / contact punishment
    if (src && opts.contact && opts.contact !== 'none' && dmg >= 0 && !tgt.down) {
      var back = 0, why = '';
      if (tgt.side === 'enemy') {
        if (opts.contact === 'top' && hasFlag(tgt, 'spiked') && !(src.kind === 'hero' && m.spikeShield)) { back = 1; why = 'spike'; }
        if (hasFlag(tgt, 'fiery') && !(src.kind === 'hero' && m.fireShield)) { back = Math.max(back, 1); why = 'fire'; }
        if (hasFlag(tgt, 'electric')) { back = Math.max(back, 1); why = 'shock'; }
        back += buffAmt(tgt, 'thorns');
      } else {
        if (m.zapTap) { back += 1; why = 'shock'; }
        if (m.returnPost) back += Math.round(dmg * m.returnPost);
        back += buffAmt(tgt, 'thorns');
        if (tgt.kind === 'hero' && tgt.form === 'form_fortress') back += 1;
      }
      if (back > 0 && !src.down) {
        src.hp = Math.max(0, src.hp - back);
        src.hitFlash = 10;
        this.number(back, src.x, src.y - 70, '#ffb0b0');
        A.sfx(why === 'shock' ? 'zap' : (why === 'fire' ? 'fire' : 'hit'));
        this.checkDown(src);
      }
    }

    this.checkDown(tgt);
    return dmg;
  };

  Battle.prototype.checkDown = function (c) {
    if (c.hp > 0 || c.down) return;
    if (c.kind === 'hero') {
      // Life Leaf style auto-revive
      var S = St.get();
      var rev = null;
      for (var i = 0; i < S.items.length; i++) {
        var d = It.get(S.items[i]);
        if (d && d.fx && d.fx.revive) { rev = S.items[i]; break; }
      }
      if (rev) {
        var fx = It.get(rev).fx;
        S.items.splice(S.items.indexOf(rev), 1);
        c.hp = Math.min(c.maxHp, fx.hp || 10);
        S.hp = c.hp;
        if (fx.fp) St.heal(0, fx.fp);
        this.banner(It.get(rev).name + '!', '#7fe0d0');
        A.fanfare('item');
        this.number('REVIVED', c.x, c.y - 92, '#7fe0d0');
        return;
      }
    }
    c.down = true; c.anim = 'defeat';
    A.sfx('defeat');
    this.puff(c.x, c.y - 30, '#e8dcc0', 14, 4);
    if (c.side === 'enemy') {
      this.addAudience(5);
      St.recordDefeat(c.id);
    }
  };

  Battle.prototype.healTarget = function (c, hp, fp) {
    if (c.down) return;
    if (hp) {
      var before = c.hp;
      c.hp = Math.min(c.maxHp, c.hp + hp);
      if (c.hp > before) { this.number('+' + (c.hp - before), c.x, c.y - 70, '#8fcf52'); this.ring(c.x, c.y - 34, '#8fcf52', 34); }
    }
    if (fp && c.kind === 'hero') {
      var S = St.get();
      var b2 = S.fp;
      St.heal(0, fp);
      if (S.fp > b2) this.number('+' + (S.fp - b2) + ' FP', c.x + 24, c.y - 92, '#8fd0f0');
    }
    A.sfx('heal');
  };

  /* ======================================================================
     Sequences
     ====================================================================== */
  Battle.prototype.introSeq = function* () {
    var self = this;
    this.phase = 'intro';
    yield 26;
    if (this.cfg.introLine) {
      this.say(this.cfg.introLine, this.boss ? 'boss' : 'normal', this.cfg.introSpeaker || '', this.cfg.introPortrait || null);
      yield { until: function () { return !self.dlg.isBusy(); } };
    }
    if (this.firstStrike > 0) {
      this.banner('FIRST STRIKE!', '#8fcf52');
      var f = this.alive('enemy')[0];
      if (f) {
        var m = St.badgeMods();
        var d = (2 + St.get().stompRank) * (m.firstStrike ? 2 : 1);
        yield* this.hopAttack(this.hero, f, function () {
          self.dealDamage(self.hero, f, d, { contact: 'top', element: 'blunt' });
        });
      }
      yield 16;
    } else if (this.firstStrike < 0) {
      this.banner('AMBUSHED!', '#e0483c');
      var e0 = this.alive('enemy')[0];
      if (e0) {
        yield* this.foeLunge(e0, this.hero, function () {
          self.dealDamage(e0, self.hero, e0.atk, { contact: 'side' });
        });
      }
      yield 16;
    }
    yield* this.roundStart();
  };

  Battle.prototype.roundStart = function* () {
    this.round++;
    var i;
    // reset per-round flags
    var all = this.everyone();
    for (i = 0; i < all.length; i++) { all[i].defending = false; }
    for (i = 0; i < this.foes.length; i++) {
      var f = this.foes[i];
      if (f.guardTurns > 0) f.guardTurns--;
      if (f.evadeTurns > 0) f.evadeTurns--; else f.evade = 0;
    }
    yield* this.playerPhase();
  };

  Battle.prototype.playerPhase = function* () {
    var self = this;
    // hero
    if (!this.hero.down) {
      var skip = yield* this.statusGate(this.hero);
      if (!skip) { this.actor = this.hero; yield* this.heroTurn(); }
      yield* this.endOfEntityTurn(this.hero);
    }
    if (this.checkBattleEnd()) { yield* this.finishSeq(); return; }
    // partner
    if (this.partner && !this.partner.down) {
      var skip2 = yield* this.statusGate(this.partner);
      if (!skip2) { this.actor = this.partner; yield* this.partnerTurn(); }
      yield* this.endOfEntityTurn(this.partner);
    }
    this.actor = null;
    if (this.checkBattleEnd()) { yield* this.finishSeq(); return; }
    if (this.ranAway) { yield* this.finishSeq(); return; }
    yield* this.crowdGift();
    yield* this.enemyPhase();
  };

  /* Frozen / asleep / tangled skip the turn and tick down. */
  Battle.prototype.statusGate = function* (c) {
    var blocked = null;
    for (var i = 0; i < c.st.length; i++) {
      var d = STATUS[c.st[i].type];
      if (d && d.skip) { blocked = c.st[i]; break; }
    }
    if (!blocked) return false;
    this.banner(c.name + ' is ' + STATUS[blocked.type].name + '!', STATUS[blocked.type].color);
    this.number(STATUS[blocked.type].name, c.x, c.y - 92, STATUS[blocked.type].color);
    c.anim = blocked.type === 'sleep' ? 'sleep' : 'hurt';
    yield 52;
    c.anim = 'idle';
    return true;
  };

  Battle.prototype.endOfEntityTurn = function* (c) {
    var i, d, m = St.badgeMods();
    // damage over time
    for (i = c.st.length - 1; i >= 0; i--) {
      d = STATUS[c.st[i].type];
      if (d && d.dot && !c.down) {
        c.hp = Math.max(0, c.hp - d.dot);
        this.number(d.dot, c.x, c.y - 70, d.color);
        c.hitFlash = 8;
        A.sfx('hit');
        this.checkDown(c);
      }
      c.st[i].turns--;
      if (c.st[i].turns <= 0) c.st.splice(i, 1);
    }
    // regen buffs / badges
    if (!c.down) {
      var reg = buffAmt(c, 'regen');
      if (c.kind === 'hero') {
        if (m.regenHp) reg += m.regenHp;
        if (m.regenFp) St.heal(0, m.regenFp);
        if (m.regenSp) St.addSe(m.regenSp);
        if (c.form === 'form_lantern') reg += 3;
      }
      if (c.kind === 'partner' && this.hero.form === 'form_lantern') reg += 2;
      if (reg > 0) this.healTarget(c, reg, 0);
    }
    for (i = c.buffs.length - 1; i >= 0; i--) {
      if (c.buffs[i].type === 'charge') continue;   // charge persists until used
      c.buffs[i].turns--;
      if (c.buffs[i].turns <= 0) c.buffs.splice(i, 1);
    }
    if (c.kind === 'hero' && c.form) {
      c.formTurns--;
      if (c.formTurns <= 0) {
        this.banner('Form released', '#cfd6de');
        c.form = null;
      }
    }
    this.syncState();
    if (this.checkBattleEnd()) return;
    yield 6;
  };

  Battle.prototype.crowdGift = function* () {
    var m = St.badgeMods();
    var chance = this.audience / 300 * (m.crowd ? 2 : 1);
    if (!U.chance(chance)) return;
    var kind = U.rnd();
    this.crowdTossT = 40;
    A.sfx('coin');
    if (kind < .45) { this.healTarget(this.hero, 3, 0); this.banner('The crowd tosses a snack!', '#f07a8a'); }
    else if (kind < .8) { St.heal(0, 3); this.number('+3 FP', this.hero.x + 20, this.hero.y - 96, '#8fd0f0'); this.banner('The crowd tosses a flower!', '#8fcf52'); }
    else { St.addSe(60); this.banner('The crowd is roaring!', '#ffe066'); }
    yield 30;
  };

  /* ======================================================================
     Hero turn — menu driven
     ====================================================================== */
  Battle.prototype.heroTurn = function* () {
    var self = this;
    this.itemsUsed = 0;
    var doneTurn = false;
    while (!doneTurn) {
      var pick = yield* this.runMenu(function () { return self.buildHeroRoot(); });
      if (!pick) continue;
      if (pick.act === 'cancel') continue;
      var r = yield* this.performPlayerAction(this.hero, pick);
      if (r !== 'again') doneTurn = true;
    }
  };
  Battle.prototype.partnerTurn = function* () {
    var self = this;
    var doneTurn = false;
    while (!doneTurn) {
      var pick = yield* this.runMenu(function () { return self.buildPartnerRoot(); });
      if (!pick) continue;
      if (pick.act === 'cancel') continue;
      var r = yield* this.performPlayerAction(this.partner, pick);
      if (r !== 'again') doneTurn = true;
    }
  };

  /* ---- menu plumbing ------------------------------------------------------
     runMenu pushes a Menu and blocks until the player picks a leaf entry or
     backs all the way out. Leaves resolve to {move, targetMode} objects. */
  Battle.prototype.runMenu = function* (rootBuilder) {
    var self = this;
    var chosen = null, cancelled = false;
    var stack = [rootBuilder()];
    this.menuStack = stack;
    while (chosen === null && !cancelled) {
      var top = stack[stack.length - 1];
      var out = null;
      top.onPick = function (item) {
        if (item.disabled) { A.sfx('error'); return; }
        if (item.sub) { out = { push: item.sub() }; }
        else out = { leaf: item };
      };
      top.onCancel = function () { out = { pop: true }; };
      yield { until: function () { top.update(); return out !== null; } };
      if (out.push) { stack.push(out.push); this.menuStack = stack; }
      else if (out.pop) {
        stack.pop(); this.menuStack = stack;
        if (!stack.length) { if (this.actor === this.hero) { stack = [rootBuilder()]; this.menuStack = stack; } else cancelled = true; }
      } else if (out.leaf) chosen = out.leaf;
    }
    this.menuStack = [];
    return chosen || { act: 'cancel' };
  };

  function mkMenu(title, items, x, y, w, desc) {
    return new UI.Menu({
      title: title, items: items, x: x === undefined ? 26 : x, y: y === undefined ? H - 216 : y,
      w: w || 268, rows: 6, rowH: 29, fill: '#fdf6e3', edge: '#8a6a3a', desc: desc,
      drawRow: function (ctx, it, rx, ry, rw, rh, sel, ok) {
        var col = it.disabled ? 'rgba(42,28,60,.35)' : '#2a1c3c';
        if (it.icon) { It.drawIcon(ctx, it.icon, rx + 10, ry + rh / 2, 22); rx += 22; }
        P.text(ctx, it.label, rx + 4, ry + rh / 2 + 6, { size: 15, color: col, outline: false, shadow: false });
        if (it.cost) P.text(ctx, it.cost, rx + rw - 8, ry + rh / 2 + 6, { size: 14, align: 'right', color: it.disabled ? 'rgba(42,28,60,.35)' : '#8a5a30', outline: false, shadow: false });
      }
    });
  }

  Battle.prototype.buildHeroRoot = function () {
    var self = this, S = St.get(), m = St.badgeMods();
    var items = [];
    items.push({ label: 'Stomp', sub: function () { return self.buildMoveMenu('stomp'); } });
    items.push({ label: 'Mallet', sub: function () { return self.buildMoveMenu('mallet'); } });
    if (S.forms.length && !m.noForms) items.push({ label: 'Fold', sub: function () { return self.buildFormMenu(); } });
    if (S.seals.length) items.push({
      label: 'Seals', sub: function () { return self.buildSealMenu(); },
      disabled: hasStatus(this.hero, 'silence')
    });
    if (this.encore >= 100 && this.partner && !this.partner.down) {
      items.push({ label: '★ ENCORE ★', sub: null, encore: true, move: PB.Partners.get(this.partner.id).duet, user: 'duet' });
    }
    items.push({ label: 'Items', sub: function () { return self.buildItemMenu(self.hero); }, disabled: !S.items.length });
    items.push({ label: 'Tactics', sub: function () { return self.buildTacticsMenu(self.hero); } });
    return mkMenu(S.name, items, 26, H - 232, 246, function (it) {
      if (it.encore) return 'Unleash the duet you and your partner have been building all fight.';
      return null;
    });
  };
  Battle.prototype.buildPartnerRoot = function () {
    var self = this, S = St.get();
    var items = [];
    items.push({ label: 'Abilities', sub: function () { return self.buildPartnerMoves(); } });
    items.push({ label: 'Items', sub: function () { return self.buildItemMenu(self.partner); }, disabled: !S.items.length });
    items.push({ label: 'Tactics', sub: function () { return self.buildTacticsMenu(self.partner); } });
    return mkMenu(this.partner.name, items, 26, H - 232, 246);
  };

  Battle.prototype.fpCost = function (move, who) {
    var m = St.badgeMods();
    var c = move.fp || 0;
    if (!c) return 0;
    var disc = who === 'partner' ? (m.fpDiscountP || 0) : (m.fpDiscount || 0);
    if (move.cat === 'form') disc += (m.formDiscount || 0);
    return Math.max(1, c - disc);
  };

  Battle.prototype.buildMoveMenu = function (slot) {
    var self = this, S = St.get();
    var ids = [slot].concat(PB.Badges.movesFrom(S.badges.equipped, slot));
    var items = ids.map(function (id) {
      var mv = Mv.get(id); if (!mv) return null;
      var cost = self.fpCost(mv, 'hero');
      return {
        label: mv.name, cost: cost ? cost + ' FP' : '—', move: id, user: 'hero',
        disabled: cost > S.fp, desc: mv.desc
      };
    }).filter(Boolean);
    return mkMenu(slot === 'stomp' ? 'Stomp' : 'Mallet', items, 288, H - 232, 274,
      function (it) { return it ? Mv.get(it.move).desc : null; });
  };
  Battle.prototype.buildFormMenu = function () {
    var self = this, S = St.get();
    var ids = S.forms.slice();
    if (this.hero.form) ids.push('form_unfold');
    var items = ids.map(function (id) {
      var mv = Mv.get(id); if (!mv) return null;
      var cost = self.fpCost(mv, 'hero');
      return {
        label: mv.name + (self.hero.form === id ? ' (active)' : ''), cost: cost ? cost + ' FP' : '—',
        move: id, user: 'hero', disabled: cost > S.fp || self.hero.form === id
      };
    }).filter(Boolean);
    return mkMenu('Origami Forms', items, 288, H - 232, 274, function (it) { return it ? Mv.get(it.move).desc : null; });
  };
  Battle.prototype.buildSealMenu = function () {
    var self = this, S = St.get();
    var items = S.seals.map(function (id) {
      var mv = Mv.get(id); if (!mv) return null;
      return {
        label: mv.name, cost: (mv.se / 100) + ' SE', move: id, user: 'hero',
        disabled: S.se < mv.se
      };
    }).filter(Boolean);
    return mkMenu('Seal Powers', items, 288, H - 232, 274, function (it) { return it ? Mv.get(it.move).desc : null; });
  };
  Battle.prototype.buildPartnerMoves = function () {
    var self = this, S = St.get();
    var ids = PB.Partners.moves(this.partner.id, this.partner.rank);
    var items = ids.map(function (id) {
      var mv = Mv.get(id); if (!mv) return null;
      var cost = self.fpCost(mv, 'partner');
      return { label: mv.name, cost: cost ? cost + ' FP' : '—', move: id, user: 'partner', disabled: cost > S.fp };
    }).filter(Boolean);
    return mkMenu(this.partner.name, items, 288, H - 232, 274, function (it) { return it ? Mv.get(it.move).desc : null; });
  };
  Battle.prototype.buildItemMenu = function (user) {
    var S = St.get();
    var items = S.items.map(function (id, i) {
      var d = It.get(id);
      return { label: d.name, icon: id, item: id, index: i, user: user === this.hero ? 'hero' : 'partner' };
    }, this);
    return mkMenu('Items', items, 288, H - 232, 274, function (it) { return it ? It.get(it.item).desc : null; });
  };
  Battle.prototype.buildTacticsMenu = function (user) {
    var self = this, S = St.get();
    var isHero = user === this.hero;
    var items = [];
    items.push({ label: 'Defend', move: 'tac_defend', user: isHero ? 'hero' : 'partner' });
    items.push({ label: 'Appeal', move: 'tac_appeal', user: isHero ? 'hero' : 'partner' });
    var extra = PB.Badges.movesFrom(S.badges.equipped, isHero ? 'tactics' : 'tacticsP');
    for (var i = 0; i < extra.length; i++) {
      var mv = Mv.get(extra[i]);
      if (mv) items.push({ label: mv.name, cost: this.fpCost(mv, isHero ? 'hero' : 'partner') + ' FP', move: extra[i], user: isHero ? 'hero' : 'partner', disabled: this.fpCost(mv, 'hero') > S.fp });
    }
    if (isHero && St.partnerList().length > 1) items.push({ label: 'Swap Partner', sub: function () { return self.buildSwapMenu(); } });
    if (!this.cfg.noRun && !this.boss) items.push({ label: 'Run Away', move: 'tac_run', user: isHero ? 'hero' : 'partner' });
    return mkMenu('Tactics', items, 288, H - 232, 274, function (it) { return it && it.move ? Mv.get(it.move).desc : null; });
  };
  Battle.prototype.buildSwapMenu = function () {
    var self = this, S = St.get();
    var items = St.partnerList().filter(function (id) { return id !== S.active; }).map(function (id) {
      var p = PB.Partners.get(id);
      return { label: p.name, swap: id, cost: S.partners[id].hp + ' HP' };
    });
    return mkMenu('Swap to…', items, 574, H - 232, 210);
  };

  /* ---- targeting ---------------------------------------------------------- */
  Battle.prototype.pickTarget = function* (mode, user) {
    var self = this;
    var pool = [];
    if (mode === 'front') { var f = this.frontFoe(); pool = f ? [f] : []; }
    else if (mode === 'oneGround') pool = this.alive('enemy').filter(function (e) { return !isAir(e); });
    else if (mode === 'oneAir') pool = this.alive('enemy').filter(isAir);
    else if (mode === 'oneAny') pool = this.alive('enemy');
    else if (mode === 'ally') pool = this.alive('player');
    else return { auto: true };
    if (!pool.length) return null;
    if (pool.length === 1 && mode === 'front') return { list: pool };
    var idx = 0, out = null;
    this.targetCursor = { pool: pool, idx: 0 };
    yield {
      until: function () {
        if (In.pressed('left') || In.pressed('up')) { idx = U.wrap(idx - 1, pool.length); A.sfx('cursor'); }
        if (In.pressed('right') || In.pressed('down')) { idx = U.wrap(idx + 1, pool.length); A.sfx('cursor'); }
        self.targetCursor.idx = idx;
        if (In.pressed('a')) { A.sfx('ok'); out = { list: [pool[idx]] }; return true; }
        if (In.pressed('b')) { A.sfx('cancel'); out = null; return true; }
        return false;
      }
    };
    this.targetCursor = null;
    return out;
  };

  Battle.prototype.resolveTargets = function (move, user, picked) {
    var t = move.target;
    if (t === 'all') return this.alive('enemy');
    if (t === 'allGround') return this.alive('enemy').filter(function (e) { return !isAir(e); });
    if (t === 'allAir') return this.alive('enemy').filter(isAir);
    if (t === 'self') return [user];
    if (t === 'party') return this.alive('player');
    if (t === 'field') return this.alive('enemy');
    return picked ? picked.list : [];
  };

  /* ---- perform ------------------------------------------------------------ */
  Battle.prototype.performPlayerAction = function* (user, pick) {
    var self = this, S = St.get();

    if (pick.swap) {
      var m = St.badgeMods();
      S.partners[S.active].hp = this.partner.hp;
      S.active = pick.swap;
      this.partner = mkPartner(pick.swap);
      A.sfx('swap');
      this.banner(this.partner.name + ' steps in!', '#8fd0f0');
      yield 30;
      return m.quickChange ? 'again' : 'done';
    }

    if (pick.item) {
      var used = yield* this.useItem(user, pick.item, pick.index);
      if (!used) return 'again';
      this.itemsUsed++;
      var cap = St.badgeMods().itemsPerTurn || 1;
      return this.itemsUsed < cap ? 'again' : 'done';
    }

    var id = pick.move;
    var move = Mv.get(id);
    if (!move) return 'done';

    // targeting
    var picked = null;
    var needPick = ['oneAny', 'oneGround', 'oneAir', 'front', 'ally'].indexOf(move.target) >= 0;
    if (needPick) {
      picked = yield* this.pickTarget(move.target, user);
      if (!picked) return 'again';
      if (!picked.list || !picked.list.length) { this.banner('No valid target.', '#e0483c'); yield 24; return 'again'; }
    }

    // cost
    if (move.se) {
      if (S.se < move.se) { A.sfx('error'); return 'again'; }
      S.se -= move.se;
    } else {
      var cost = this.fpCost(move, user.kind === 'partner' ? 'partner' : 'hero');
      if (cost > S.fp) { A.sfx('error'); return 'again'; }
      S.fp -= cost;
    }
    if (pick.encore) { this.encore = 0; }

    this.lastPlayerMove = id;
    yield* this.executeMove(user, move, picked, { encore: !!pick.encore });
    return 'done';
  };

  Battle.prototype.useItem = function* (user, itemId, index) {
    var self = this, S = St.get(), d = It.get(itemId);
    if (!d) return false;
    var fx = d.fx || {};
    var picked = null;
    if (fx.dmg && fx.target === 'one') {
      picked = yield* this.pickTarget('oneAny', user);
      if (!picked) return false;
    }
    // remove
    var i = S.items.indexOf(itemId);
    if (i >= 0) S.items.splice(i, 1);
    var m = St.badgeMods();
    if (m.refund) this.coinsGained += Math.round((d.sell || 0) * m.refund);

    user.anim = 'cast'; A.sfx('ok');
    yield 18;
    this.ring(user.x, user.y - 40, '#ffe066', 40);

    if (fx.mystery) {
      var roll = U.rnd();
      if (roll < .3) fx = { hp: 15, fp: 5 };
      else if (roll < .5) fx = { dmg: 8, target: 'all' };
      else if (roll < .65) fx = { buff: { type: 'atkUp', amt: 3, turns: 3 } };
      else if (roll < .8) fx = { target: 'all', status: { type: 'sleep', chance: .8, turns: 3 } };
      else if (roll < .92) fx = { sp: 200 };
      else fx = { dmg: 3, target: 'self' };
      this.banner('Mystery!', '#f5c02e');
      yield 16;
    }

    if (fx.hp || fx.fp) {
      this.healTarget(this.hero, fx.hp || 0, fx.fp || 0);
      if (this.partner && !this.partner.down && fx.hp) this.healTarget(this.partner, fx.hp, 0);
    }
    if (fx.sp) { St.addSe(fx.sp); this.number('+SEAL', this.hero.x, this.hero.y - 100, '#ffe066'); A.sfx('seal'); }
    if (fx.cureAll) { clearAllStatus(this.hero); if (this.partner) clearAllStatus(this.partner); this.banner('Cleansed!', '#7fe0d0'); }
    if (fx.cure) for (var c = 0; c < fx.cure.length; c++) { clearStatus(this.hero, fx.cure[c]); if (this.partner) clearStatus(this.partner, fx.cure[c]); }
    if (fx.buff) { addBuff(user, fx.buff.type, fx.buff.amt, fx.buff.turns); this.number(BUFFS[fx.buff.type].name, user.x, user.y - 92, BUFFS[fx.buff.type].color); }
    if (fx.audience) { this.addAudience(fx.audience); this.banner('The crowd loves it!', '#f07a8a'); }
    if (fx.escape) { this.ranAway = true; this.banner('Escaped!', '#8fcf52'); yield 24; return true; }
    if (fx.dmg || fx.status) {
      var targets = fx.target === 'all' ? this.alive('enemy') : (picked ? picked.list : this.alive('enemy').slice(0, 1));
      for (var k = 0; k < targets.length; k++) {
        var tg = targets[k];
        if (fx.dmg) {
          this.slash(tg.x, tg.y - 40, '#ffe066');
          this.dealDamage(user, tg, fx.dmg, { element: fx.element, pierce: fx.pierce, status: fx.status, contact: 'none' });
        } else if (fx.status && U.chance(fx.status.chance)) {
          if (addStatus(tg, fx.status.type, fx.status.turns)) this.number(STATUS[fx.status.type].name + '!', tg.x, tg.y - 92, STATUS[fx.status.type].color);
        }
        yield 6;
      }
    }
    user.anim = 'idle';
    this.syncState();
    yield 18;
    return true;
  };

  /* ---- the main attack routine -------------------------------------------- */
  Battle.prototype.executeMove = function* (user, move, picked, opts) {
    var self = this, S = St.get();
    opts = opts || {};
    var m = St.badgeMods();

    // pure tactics
    if (move.defend) { user.defending = true; user.anim = 'guard'; this.banner(user.name + ' braces.', '#57b8ea'); yield 34; user.anim = 'idle'; return; }
    if (move.appeal) {
      user.anim = 'cheer'; A.sfx('stylish');
      var gain = 60 + (m.deepFocus || 0);
      St.addSe(gain);
      this.addAudience(8);
      this.addEncore(6);
      this.banner('Appeal! Seal Energy up.', '#ffe066');
      this.ring(user.x, user.y - 40, '#ffe066', 50);
      yield 40; user.anim = 'idle'; return;
    }
    if (move.run) {
      var cmd = AC.make(move.cmd, { tutor: !!m.tutor, label: 'Get away!' });
      var res = yield { cmd: cmd };
      if (res.tier >= 1) {
        this.ranAway = true;
        if (!m.runawayPay) { S.sp = Math.max(0, S.sp - 20); }
        St.get().stats.flees++;
        this.banner('Got away!', '#8fcf52');
      } else this.banner('Could not escape!', '#e0483c');
      yield 26; return;
    }
    if (move.unfold) { user.form = null; user.formTurns = 0; this.banner('Unfolded.', '#cfd6de'); A.sfx('fold'); yield 24; return; }

    // form
    if (move.form) {
      var cmdF = AC.make(move.cmd, { tutor: !!m.tutor, label: move.name });
      user.anim = 'cast';
      var rF = yield { cmd: cmdF };
      A.sfx('fold');
      this.ring(user.x, user.y - 40, '#8fd0f0', 54);
      this.puff(user.x, user.y - 40, '#f7edd6', 12, 2.4);
      user.form = move.id;
      user.formTurns = (move.turns || 3) + (m.formTurns || 0) + (rF.tier === 2 ? 1 : 0);
      this.banner(move.name + '!', '#57b8ea');
      if (rF.tier === 2) { this.addEncore(10); this.addAudience(4); S.stats.stylish++; }
      yield 34; user.anim = 'idle'; return;
    }

    // targets
    var targets = this.resolveTargets(move, user, picked);
    if (move.target === 'party') targets = this.alive('player');
    if (!targets.length && !move.heal && !move.blankSlate) { this.banner('Nothing to hit.', '#e0483c'); yield 20; return; }

    // tattle
    if (move.tattle) {
      var tgt = targets[0];
      if (tgt) {
        St.tattle(tgt.id);
        this.tattleTarget = tgt;
        user.anim = 'cast';
        yield 20;
        this.say(tgt.data.tattle, 'normal', this.partner ? this.partner.name : 'Study', this.partner ? this.partner.sprite : null);
        yield { until: function () { return !self.dlg.isBusy(); } };
        this.tattleTarget = null;
        user.anim = 'idle';
      }
      return;
    }

    // buffs / debuffs with no damage
    if (!move.power && (move.buff || move.debuff || move.heal || move.blankSlate)) {
      var cmdB = AC.make(move.cmd, { tutor: !!m.tutor, label: move.name });
      user.anim = 'cast';
      var rB = yield { cmd: cmdB };
      var scale = rB.tier === 0 ? .5 : (rB.tier === 2 ? 1.25 : 1);
      A.sfx(move.cat === 'seal' ? 'seal' : 'heal');
      if (move.blankSlate) {
        var foes = this.alive('enemy');
        for (var bi = 0; bi < foes.length; bi++) { dispel(foes[bi]); foes[bi].guardTurns = 0; }
        this.healTarget(this.hero, 15, 15);
        if (this.partner && !this.partner.down) this.healTarget(this.partner, 15, 0);
        this.encore = 100;
        this.banner('BLANK SLATE!', '#f7f5ff');
        this.ring(W / 2, FLOOR - 60, '#ffffff', 220);
      }
      if (move.heal) {
        var hs = Math.round((move.heal.hp || 0) * scale);
        for (var hi = 0; hi < targets.length; hi++) {
          if (move.heal.cureAll) clearAllStatus(targets[hi]);
          this.healTarget(targets[hi], hs, 0);
        }
      }
      if (move.buff) {
        for (var ui = 0; ui < targets.length; ui++) {
          addBuff(targets[ui], move.buff.type, move.buff.amt, move.buff.turns);
          this.number(BUFFS[move.buff.type].name, targets[ui].x, targets[ui].y - 92, BUFFS[move.buff.type].color);
        }
      }
      if (move.debuff) {
        for (var di = 0; di < targets.length; di++) {
          var td = targets[di];
          if (move.debuff.def) { td.def = Math.max(0, td.def + move.debuff.def); this.number('DEF ' + move.debuff.def, td.x, td.y - 92, '#8fd0f0'); }
          if (move.debuff.vuln) addBuff(td, 'vuln', move.debuff.vuln, move.debuff.turns || 3);
          if (move.debuff.atk) { td.atk = Math.max(0, td.atk + move.debuff.atk); }
        }
      }
      if (move.status) {
        for (var si = 0; si < targets.length; si++) {
          if (U.chance(move.status.chance * (rB.tier === 2 ? 1.3 : 1))) {
            if (addStatus(targets[si], move.status.type, move.status.turns)) this.number(STATUS[move.status.type].name + '!', targets[si].x, targets[si].y - 92, STATUS[move.status.type].color);
          }
        }
      }
      if (rB.tier === 2) { this.addEncore(10); this.addAudience(4); S.stats.stylish++; }
      this.banner(move.name + '!', move.cat === 'seal' ? '#ffe066' : '#8fcf52');
      yield 32; user.anim = 'idle';
      this.syncState();
      return;
    }

    /* ---- damaging attack ---- */
    var rank = user.kind === 'partner' ? user.rank : (move.cat === 'mallet' ? S.malletRank : S.stompRank);
    var base = Mv.power(move, rank);
    var cmdSpec = move.cmd || { type: 'none' };
    var label = move.name;
    var cmd = AC.make(cmdSpec, { tutor: !!m.tutor, label: label });
    user.anim = 'attack';
    var res = yield { cmd: cmd };

    // Stylish window: a quick B press right after a perfect command.
    var stylish = false;
    if (res.tier === 2) {
      this.stylishWindow = 16;
      var sw = 16, got = false;
      yield {
        until: function () {
          sw--; self.stylishWindow = sw;
          if (In.pressed('b')) { got = true; return true; }
          return sw <= 0;
        }
      };
      this.stylishWindow = 0;
      if (got) {
        stylish = true; S.stats.stylish++;
        A.sfx('stylish'); this.banner('STYLISH!', '#f07a8a');
        this.addEncore(14); this.addAudience(8);
        for (var s = 0; s < 3; s++) this.fx.push({ k: 'star', x: user.x + U.rndRange(-20, 20), y: user.y - 50, t: 0, life: 34, c: '#ffe066' });
      } else { this.addEncore(7); this.addAudience(3); }
    } else if (res.tier === 1) { this.addEncore(3); this.addAudience(1); }
    else { this.addAudience(-2); }

    // damage per target
    var powerAdd = this.attackerPower(user, move);
    var hits = (move.hits || 1) + (user.kind === 'hero' && user.form === 'form_shear' ? 1 : 0);
    var pierce = move.pierce || (user.kind === 'hero' && user.form === 'form_dart');
    var element = move.element;
    if (user.kind === 'hero' && user.form === 'form_shear' && (!element || element === 'blunt')) element = 'cut';

    var perHit = base + powerAdd;
    if (res.tier === 2) perHit += 1;
    if (res.tier === 0) {
      if (m.allOrNothing) perHit = 0;
      else perHit = Math.floor(perHit * 0.5);
    } else if (m.allOrNothing && res.tier === 2) perHit += m.allOrNothing;
    // ratio-scaled commands
    if (['mash', 'hold', 'rotate', 'multi'].indexOf(cmdSpec.type) >= 0 && res.tier === 1) {
      perHit = Math.max(1, Math.round(perHit * (0.6 + res.ratio * 0.4)));
    }
    if (stylish) perHit += 1;
    if (opts.encore) perHit += 2;
    perHit = Math.max(0, perHit);

    var usedCharge = buffAmt(user, 'charge') > 0;

    // animation + application
    if (move.cat === 'duet') {
      yield* this.duetSeq(user, move, targets, perHit, element, pierce, res);
    } else if (move.chain) {
      // Multibounce: one hop per target, stopping at the number of hits landed
      var maxT = Math.max(1, Math.min(targets.length, Math.max(1, cmd.hits || targets.length)));
      for (var ci = 0; ci < maxT; ci++) {
        var tc = targets[ci];
        if (!tc || tc.down) continue;
        yield* this.hopAttack(user, tc, (function (tt) {
          return function () {
            self.dealDamage(user, tt, perHit, { element: element, pierce: pierce, status: move.status, contact: move.contact, perfect: res.tier === 2, halveDef: move.halveDef, douse: move.douse });
          };
        })(tc));
      }
    } else if (move.target === 'all' || move.target === 'allGround' || move.target === 'allAir') {
      yield* this.areaAttack(user, move, targets, function (tt, i) {
        self.dealDamage(user, tt, perHit, { element: element, pierce: pierce, status: move.status, contact: move.contact, perfect: res.tier === 2, douse: move.douse });
      });
    } else {
      var tgt2 = targets[0];
      for (var h = 0; h < hits; h++) {
        if (!tgt2 || tgt2.down) break;
        var pw = perHit + (move.escalate ? move.escalate * h : 0);
        if (move.cat === 'stomp' || move.contact === 'top') {
          yield* this.hopAttack(user, tgt2, (function (p) {
            return function () {
              self.dealDamage(user, tgt2, p, { element: element, pierce: pierce, status: move.status, contact: move.contact, perfect: res.tier === 2, halveDef: move.halveDef, douse: move.douse });
            };
          })(pw));
        } else {
          yield* this.meleeAttack(user, tgt2, (function (p) {
            return function () {
              self.dealDamage(user, tgt2, p, { element: element, pierce: pierce, status: move.status, contact: move.contact, perfect: res.tier === 2, halveDef: move.halveDef, douse: move.douse });
            };
          })(pw), element);
        }
        yield 5;
      }
    }

    if (move.ground) {
      for (var gi = 0; gi < targets.length; gi++) {
        if (isAir(targets[gi])) { targets[gi].grounded = true; this.number('GROUNDED', targets[gi].x, targets[gi].y - 92, '#8fd0f0'); }
      }
    }
    if (move.douse) {
      for (var di2 = 0; di2 < targets.length; di2++) {
        var fd = targets[di2], fi = fd.flags.indexOf('fiery');
        if (fi >= 0) { fd.flags.splice(fi, 1); this.number('DOUSED', fd.x, fd.y - 92, '#57b8ea'); }
      }
    }
    if (usedCharge) clearBuff(user, 'charge');

    user.anim = 'idle';
    this.syncState();
    yield 16;
  };

  /* ---- attack animations ---------------------------------------------------- */
  Battle.prototype.hopAttack = function* (user, tgt, apply) {
    var sx = user.x, sy = user.y;
    var tx = tgt.x - 4, ty = tgt.y - (isAir(tgt) ? 40 : 0);
    var n = 14;
    for (var i = 1; i <= n; i++) {
      var p = i / n;
      user.x = U.lerp(sx, tx, p);
      user.lift = Math.sin(p * Math.PI) * 74 + (isAir(tgt) ? p * 40 : 0);
      user.anim = 'jump';
      yield 1;
    }
    A.sfx('jump');
    user.lift = 0; user.anim = 'attack';
    apply();
    this.puff(tgt.x, tgt.y - 16, '#f7edd6', 6, 2);
    yield 10;
    for (var j = 1; j <= 12; j++) {
      var q = j / 12;
      user.x = U.lerp(tx, sx, q);
      user.lift = Math.sin(q * Math.PI) * 46;
      yield 1;
    }
    user.x = sx; user.y = sy; user.lift = 0; user.anim = 'idle';
  };

  Battle.prototype.meleeAttack = function* (user, tgt, apply, element) {
    var sx = user.x;
    var tx = tgt.x - 56;
    var n = 10;
    for (var i = 1; i <= n; i++) { user.x = U.lerp(sx, tx, U.Ease.outQuad(i / n)); user.anim = 'run'; yield 1; }
    user.anim = 'attack';
    yield 6;
    A.sfx(element === 'fire' ? 'fire' : (element === 'ice' ? 'ice' : (element === 'cut' ? 'fold' : 'mallet')));
    this.slash(tgt.x - 10, tgt.y - 34, element === 'fire' ? '#ff9f2e' : (element === 'ice' ? '#bfe4f8' : (element === 'cut' ? '#ffffff' : '#ffe066')));
    apply();
    yield 12;
    for (var j = 1; j <= 10; j++) { user.x = U.lerp(tx, sx, j / 10); yield 1; }
    user.x = sx; user.anim = 'idle';
  };

  Battle.prototype.areaAttack = function* (user, move, targets, apply) {
    user.anim = 'cast';
    var col = move.element === 'fire' ? '#ff8a2e' : move.element === 'ice' ? '#bfe4f8'
      : move.element === 'shock' ? '#ffe066' : move.element === 'water' ? '#57b8ea'
        : move.element === 'cut' ? '#ffffff' : '#f5c02e';
    A.sfx(move.element === 'fire' ? 'fire' : move.element === 'ice' ? 'ice' : move.element === 'shock' ? 'zap' : move.element === 'water' ? 'water' : 'hitBig');
    this.ring(W / 2 + 120, FLOOR - 50, col, 190);
    this.shake = 12;
    yield 14;
    for (var i = 0; i < targets.length; i++) {
      if (targets[i].down) continue;
      this.slash(targets[i].x, targets[i].y - 36, col);
      apply(targets[i], i);
      yield 4;
    }
    yield 10;
    user.anim = 'idle';
  };

  Battle.prototype.duetSeq = function* (user, move, targets, perHit, element, pierce, res) {
    var self = this;
    this.duetFlash = 60;
    A.sfx('seal');
    this.banner(move.name, '#f07a8a');
    var hero = this.hero, part = this.partner;
    var hx = hero.x, px = part ? part.x : 0;
    for (var i = 1; i <= 20; i++) {
      hero.x = U.lerp(hx, W / 2 - 40, i / 20);
      if (part) part.x = U.lerp(px, W / 2 - 100, i / 20);
      hero.anim = 'cheer'; if (part) part.anim = 'cheer';
      yield 1;
    }
    yield 20;
    var hits = move.hits || 1;
    for (var h = 0; h < hits; h++) {
      this.ring(W / 2 + 140, FLOOR - 60, '#ffe066', 240);
      this.shake = 18;
      A.sfx('hitBig');
      for (var t = 0; t < targets.length; t++) {
        if (targets[t].down) continue;
        this.slash(targets[t].x, targets[t].y - 40, '#ffe066');
        this.dealDamage(user, targets[t], perHit, { element: element, pierce: pierce, status: move.status, contact: 'none', perfect: true, douse: move.douse });
      }
      yield 14;
    }
    if (move.debuff) {
      for (var d = 0; d < targets.length; d++) if (move.debuff.def) targets[d].def = Math.max(0, targets[d].def + move.debuff.def);
    }
    this.duetFlash = 0;
    for (var j = 1; j <= 16; j++) {
      hero.x = U.lerp(W / 2 - 40, hx, j / 16);
      if (part) part.x = U.lerp(W / 2 - 100, px, j / 16);
      yield 1;
    }
    hero.x = hx; if (part) part.x = px;
    hero.anim = 'idle'; if (part) part.anim = 'idle';
    this.addAudience(20);
  };

  /* ======================================================================
     Enemy phase
     ====================================================================== */
  Battle.prototype.enemyPhase = function* () {
    var self = this;
    var foes = this.alive('enemy');
    for (var i = 0; i < foes.length; i++) {
      var f = foes[i];
      if (f.down) continue;
      if (this.checkBattleEnd()) break;
      this.actor = f;
      var skip = yield* this.statusGate(f);
      if (!skip) yield* this.foeAct(f);
      yield* this.endOfEntityTurn(f);
      if (this.checkBattleEnd()) break;
      yield 8;
    }
    this.actor = null;
    if (this.checkBattleEnd()) { yield* this.finishSeq(); return; }
    yield* this.roundStart();
  };

  Battle.prototype.pickFoeMove = function (f) {
    var pool = [], i;
    var hpRatio = f.hp / f.maxHp;
    for (i = 0; i < f.moves.length; i++) {
      var mv = f.moves[i];
      if (mv.cond === 'lowhp' && hpRatio > 0.35) continue;
      if (mv.cond === 'heroLow' && this.hero.hp > this.hero.maxHp * 0.4) continue;
      if (mv.summon && this.foes.length >= 5) continue;
      if (mv.copyLast && !this.lastPlayerMove) continue;
      if (mv.guard && f.guardTurns > 0) continue;
      var w = mv.weight;
      pool.push({ mv: mv, w: w });
    }
    if (!pool.length) return f.moves[0];
    var total = 0;
    for (i = 0; i < pool.length; i++) total += pool[i].w;
    var r = U.rnd() * total;
    for (i = 0; i < pool.length; i++) { r -= pool[i].w; if (r <= 0) return pool[i].mv; }
    return pool[0].mv;
  };

  Battle.prototype.foeAct = function* (f) {
    var self = this, S = St.get();
    // boss phase transitions
    if (f.data.phases) {
      while (f.phaseIdx < f.data.phases.length && f.hp / f.maxHp <= f.data.phases[f.phaseIdx].at) {
        var ph = f.data.phases[f.phaseIdx++];
        if (ph.say) { this.say(ph.say, 'boss', f.name, f.sprite); yield { until: function () { return !self.dlg.isBusy(); } }; }
        if (ph.mods) { if (ph.mods.atk) f.atk += ph.mods.atk; if (ph.mods.def) f.def = Math.max(0, f.def + ph.mods.def); }
        if (ph.add) f.moves = f.moves.concat(ph.add);
        A.sfx('roar'); this.shake = 20;
        this.ring(f.x, f.y - 50, '#e0483c', 120);
        yield 24;
      }
    }

    var mv = this.pickFoeMove(f);
    if (!mv) return;

    if (mv.telegraph) { this.banner(mv.telegraph, '#f5c02e'); yield 34; }

    // non-attacking behaviours
    if (mv.guard) {
      f.guardTurns = mv.turns || 2; f.guardAmt = mv.guard;
      if (mv.thorns) addBuff(f, 'thorns', mv.thorns, mv.turns || 2);
      if (mv.evade) { f.evade = mv.evade; f.evadeTurns = mv.turns || 2; }
      if (mv.heal) this.healTarget(f, mv.heal, 0);
      if (mv.target === 'allies') { var al = this.alive('enemy'); for (var g = 0; g < al.length; g++) { al[g].guardTurns = mv.turns || 2; al[g].guardAmt = mv.guard; } }
      f.anim = 'guard'; this.number('DEF UP', f.x, f.y - 92, '#57b8ea');
      A.sfx('guard');
      yield 34; f.anim = 'idle'; return;
    }
    if (mv.heal && !mv.power) {
      var tgts = mv.target === 'allies' ? this.alive('enemy') : [f];
      f.anim = 'cast'; A.sfx('heal');
      for (var h = 0; h < tgts.length; h++) this.healTarget(tgts[h], mv.heal, 0);
      yield 34; f.anim = 'idle'; return;
    }
    if (mv.atkBuff && !mv.power) {
      var t2 = mv.target === 'allies' ? this.alive('enemy') : [f];
      f.anim = 'cheer';
      for (var b = 0; b < t2.length; b++) { addBuff(t2[b], 'atkUp', mv.atkBuff, mv.turns || 3); this.number('ATK UP', t2[b].x, t2[b].y - 92, '#e0483c'); }
      A.sfx('charge');
      yield 34; f.anim = 'idle'; return;
    }
    if (mv.summon) {
      var cnt = mv.count || 1;
      f.anim = 'cast'; A.sfx('roar');
      for (var s = 0; s < cnt && this.foes.length < 5; s++) {
        var nf = mkFoe(mv.summon, this.foes.length);
        nf.x = FOE_X[Math.min(3, this.foes.length)] + (this.foes.length > 3 ? 60 : 0);
        this.foes.push(nf);
        this.puff(nf.x, nf.y - 30, '#c8a2e8', 10, 3);
      }
      this.banner(f.name + ' calls for backup!', '#e0483c');
      yield 40; f.anim = 'idle'; return;
    }
    if (mv.stealAudience) {
      var st2 = Math.min(this.audience, mv.stealAudience);
      this.audience -= st2;
      if (mv.atkBuff) addBuff(f, 'atkUp', mv.atkBuff, 3);
      f.anim = 'cheer'; A.sfx('stylish');
      this.banner(f.name + ' wins over the crowd!', '#e0483c');
      yield 40; f.anim = 'idle'; return;
    }
    if (mv.evade && !mv.power) {
      f.evade = mv.evade; f.evadeTurns = mv.turns || 1;
      this.number('EVASIVE', f.x, f.y - 92, '#8fd0f0');
      yield 30; return;
    }

    // choose a victim
    var victims = [];
    var players = this.alive('player');
    if (!players.length) return;
    if (mv.target === 'both') victims = players.slice();
    else if (mv.target === 'hero') victims = [this.hero.down ? players[0] : this.hero];
    else if (mv.target === 'partner') victims = [this.partner && !this.partner.down ? this.partner : players[0]];
    else if (mv.target === 'weakest') {
      players.sort(function (a, b) { return (a.hp / a.maxHp) - (b.hp / b.maxHp); });
      victims = [players[0]];
    } else victims = [U.pick(players)];

    var power = mv.power;
    if (mv.copyLast && this.lastPlayerMove) {
      var lm = Mv.get(this.lastPlayerMove);
      if (lm && lm.power) power = Math.max(power, Mv.power(lm, 2) + 2);
      this.banner(f.name + ' copies your move!', '#e0483c');
    }
    power += buffAmt(f, 'atkUp') + statMod(f, 'atk');
    power = Math.max(0, Math.round(power * statMul(f, 'atkMul')));

    var hits = mv.hits || 1;
    for (var v = 0; v < victims.length; v++) {
      var tv = victims[v];
      if (tv.down) continue;
      for (var hh = 0; hh < hits; hh++) {
        if (tv.down) break;
        // accuracy: dizzy/inked make the foe miss
        var missChance = statMod(f, 'miss');
        var m2 = St.badgeMods();
        var dodge = (m2.luck || 0) + (buffAmt(tv, 'dodgy') ? .5 : 0);
        if (tv.kind === 'hero' && tv.form === 'form_crane') dodge += .5;
        if (m2.closeCall && tv.kind === 'hero' && St.get().hp <= 5) dodge += m2.closeCall;
        if (U.chance(missChance) || U.chance(dodge)) {
          yield* this.foeLunge(f, tv, function () { });
          this.number('MISS', tv.x, tv.y - 70, '#8fd0f0');
          A.sfx('swap');
          if (tv.kind === 'hero' && tv.form === 'form_crane') {
            this.dealDamage(tv, f, 2, { contact: 'none' });
            this.number('COUNTER', f.x, f.y - 92, '#8fd0f0');
          }
          continue;
        }
        // guard window
        var self2 = this;
        var guard = new AC.Guard(30);
        this.activeGuard = guard;
        var appliedPower = (hits > 1 && mv.power !== power) ? Math.max(1, Math.round(power / 1.6)) : power;
        yield* this.foeLunge(f, tv, null, guard);
        var gr = guard.result;
        this.activeGuard = null;
        if (gr === 'superguard') St.get().stats.superguards++;
        this.dealDamage(f, tv, appliedPower, {
          element: mv.element, pierce: mv.pierce, status: mv.status,
          contact: mv.contact === undefined ? 'side' : mv.contact, guard: gr
        });
        if (gr === 'superguard' && (mv.contact === undefined || mv.contact === 'side')) {
          this.dealDamage(tv, f, 1, { contact: 'none' });
          this.number('COUNTER', f.x, f.y - 92, '#ffe066');
        }
        if (gr !== 'none') { this.addAudience(gr === 'superguard' ? 6 : 2); this.addEncore(gr === 'superguard' ? 8 : 3); }
        if (mv.drain && !f.down) this.healTarget(f, Math.max(1, Math.round(appliedPower / 2)), 0);
        if (mv.dispel) { dispel(tv); this.number('DISPELLED', tv.x, tv.y - 92, '#c8a2e8'); }
        if (mv.steal) {
          var S2 = St.get();
          if (S2.coins > 0) { var amt = Math.min(S2.coins, 5 + U.rndInt(10)); S2.coins -= amt; this.number('-' + amt + ' coins', tv.x, tv.y - 100, '#f5c02e'); }
        }
        if (mv.debuff) {
          if (mv.debuff.atk) addBuff(tv, 'atkUp', mv.debuff.atk, mv.debuff.turns || 3);
          if (mv.debuff.def) addBuff(tv, 'defUp', mv.debuff.def, mv.debuff.turns || 3);
        }
        yield 8;
      }
    }
    if (mv.selfKO) {
      f.hp = 0; this.checkDown(f);
      this.puff(f.x, f.y - 30, '#ff8a2e', 18, 5);
    }
    this.syncState();
    f.anim = 'idle';
    yield 10;
  };

  Battle.prototype.foeLunge = function* (f, tgt, apply, guard) {
    var sx = f.x;
    var tx = tgt.x + 62;
    var n = 12;
    for (var i = 1; i <= n; i++) {
      f.x = U.lerp(sx, tx, U.Ease.inQuad(i / n));
      f.anim = 'run';
      if (guard) guard.update();
      yield 1;
    }
    f.anim = 'attack';
    A.sfx('hit');
    for (var k = 0; k < 6; k++) { if (guard) guard.update(); yield 1; }
    if (apply) apply();
    if (guard) { while (guard.t < guard.impact) { guard.update(); yield 1; } }
    yield 6;
    for (var j = 1; j <= 10; j++) { f.x = U.lerp(tx, sx, j / 10); yield 1; }
    f.x = sx; f.anim = 'idle';
  };

  /* ======================================================================
     End of battle
     ====================================================================== */
  Battle.prototype.checkBattleEnd = function () {
    if (this.result) return true;
    if (!this.alive('enemy').length) { this.result = 'win'; return true; }
    if (this.hero.down) { this.result = 'lose'; return true; }
    if (this.ranAway) { this.result = 'flee'; return true; }
    return false;
  };

  Battle.prototype.syncState = function () {
    var S = St.get();
    S.hp = U.clamp(this.hero.hp, 0, St.maxHp());
    if (this.partner && S.partners[this.partner.id]) S.partners[this.partner.id].hp = U.clamp(this.partner.hp, 0, this.partner.maxHp);
  };

  Battle.prototype.finishSeq = function* () {
    var self = this, S = St.get();
    this.syncState();
    this.phase = 'end';
    yield 24;

    if (this.result === 'lose') {
      A.stop();
      this.banner('DOWN...', '#e0483c');
      yield 60;
      this.phase = 'gameover';
      return;
    }
    if (this.result === 'flee') {
      yield 16;
      this.close();
      return;
    }

    // rewards
    S.stats.battles++; S.stats.wins++;
    var sp = 0, coins = this.coinsGained;
    for (var i = 0; i < this.foes.length; i++) {
      var d = this.foes[i].data;
      var scaled = Math.max(1, Math.round(d.sp * (1 - U.clamp((S.level - d.tier * 3) / 22, 0, 0.65))));
      sp += scaled;
      coins += d.coins + U.rndInt(3);
      var m = St.badgeMods();
      var dropChance = m.dropRate ? 2 : 1;
      if (d.drops) for (var k = 0; k < d.drops.length; k++) {
        if (U.chance(Math.min(1, d.drops[k][1] * dropChance))) this.itemsGained.push(d.drops[k][0]);
      }
    }
    sp = Math.round(sp * St.diff().sp);
    this.spGained = sp;
    this.coinsGained = coins;

    A.play('victory');
    A.fanfare('victory');
    this.phase = 'victory';
    this.hero.anim = 'cheer';
    if (this.partner && !this.partner.down) this.partner.anim = 'cheer';
    yield 40;

    var lv = St.addSp(sp);
    St.addCoins(coins);
    for (var g = 0; g < this.itemsGained.length; g++) St.addItem(this.itemsGained[g]);

    yield { until: function () { return In.pressed('a') || self.victoryT > 260; } };

    // level ups
    for (var l = 0; l < lv.levels; l++) {
      yield* this.levelUpSeq();
    }
    this.close();
  };

  Battle.prototype.levelUpSeq = function* () {
    var self = this, S = St.get();
    this.phase = 'levelup';
    A.fanfare('levelup');
    var choice = 0;
    var picked = null;
    this.levelMenu = new UI.Menu({
      title: 'LEVEL ' + S.level + '!  Choose an upgrade',
      items: [
        { label: 'Heart  —  Max HP +5', k: 'hp' },
        { label: 'Flower —  Max FP +5', k: 'fp' },
        { label: 'Badge  —  BP +3', k: 'bp' }
      ],
      x: W / 2 - 190, y: 190, w: 380, rowH: 40, rows: 3,
      onPick: function (it) { picked = it.k; },
      onCancel: function () { }
    });
    yield { until: function () { self.levelMenu.update(); return picked !== null; } };
    St.applyLevelChoice(picked);
    St.heal(999, 999);
    this.hero.maxHp = St.maxHp();
    this.hero.hp = S.hp;
    this.levelMenu = null;
    this.phase = 'victory';
    A.sfx('levelup');
    yield 30;
  };

  Battle.prototype.close = function () {
    var self = this;
    this.syncState();
    this.fader.out(function () {
      self.onEnd({ result: self.result, sp: self.spGained, coins: self.coinsGained, items: self.itemsGained });
    }, .07, '#0f0a18');
  };

  /* ======================================================================
     Update / draw
     ====================================================================== */
  Battle.prototype.update = function () {
    this.t++;
    if (this.phase === 'victory') this.victoryT = (this.victoryT || 0) + 1;
    this.fader.update();
    this.dlg.update();

    if (this.phase === 'gameover') {
      if (In.pressed('a')) {
        var self = this;
        this.fader.out(function () { self.onEnd({ result: 'lose' }); }, .06);
      }
      return;
    }

    if (this.co && !this.dlg.isBusy()) this.co.step(this);

    var all = this.everyone();
    for (var i = 0; i < all.length; i++) {
      var c = all[i];
      c.t++;
      if (c.hitFlash > 0) c.hitFlash--;
      if (c.shake > 0) c.shake--;
      if (c.down && c.anim !== 'defeat') c.anim = 'defeat';
    }
    for (var n = this.numbers.length - 1; n >= 0; n--) {
      this.numbers[n].t++;
      if (this.numbers[n].t > 56) this.numbers.splice(n, 1);
    }
    for (var f = this.fx.length - 1; f >= 0; f--) {
      var e = this.fx[f]; e.t++;
      if (e.k === 'bit') { e.x += e.vx; e.y += e.vy; e.vy += 0.18; e.rot += e.vr; }
      if (e.k === 'star') { e.y -= 1.4; }
      if (e.t > e.life) this.fx.splice(f, 1);
    }
    if (this.shake > 0) this.shake *= 0.86;
    if (this.msgT > 0) this.msgT--;
    if (this.crowdTossT > 0) this.crowdTossT--;
    if (this.duetFlash > 0) this.duetFlash--;

    // remove defeated foes after their collapse animation
    for (var q = this.foes.length - 1; q >= 0; q--) {
      if (this.foes[q].down) {
        this.foes[q].deadT = (this.foes[q].deadT || 0) + 1;
        if (this.foes[q].deadT > 46) this.foes.splice(q, 1);
      }
    }
  };

  /* ---- stage ------------------------------------------------------------- */
  function drawStage(ctx, b) {
    var t = b.t;
    // backdrop
    var g = ctx.createLinearGradient(0, 0, 0, H);
    var pal = STAGE_BG[b.bg] || STAGE_BG.stage;
    g.addColorStop(0, pal[0]); g.addColorStop(1, pal[1]);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    // back scenery: layered torn paper hills
    for (var l = 0; l < 3; l++) {
      var y = 210 + l * 40;
      P.tornEdge(ctx, -20, W + 20, y, 14 - l * 3, 26, l * 3.3, U.rgba(pal[2 + l] || pal[1], 1), true, FLOOR + 6);
    }

    // stage floor
    P.rr(ctx, -20, FLOOR, W + 40, H - FLOOR, 0, pal[5] || '#8a5a30', null, 0);
    P.line(ctx, [[0, FLOOR], [W, FLOOR]], U.shade(pal[5] || '#8a5a30', -.35), 4);
    ctx.save(); ctx.globalAlpha = .12;
    for (var p = 0; p < 22; p++) P.line(ctx, [[p * 46 - 10, FLOOR], [p * 46 - 40, H]], '#000', 2);
    ctx.restore();

    // footlights
    for (var fl = 0; fl < 9; fl++) {
      var fx2 = 60 + fl * 108;
      P.ell(ctx, fx2, FLOOR + 8, 13, 7, '#f5c02e', '#8a6a2a', 2);
      ctx.save(); ctx.globalAlpha = .075 + Math.sin(t * .04 + fl) * .025;
      ctx.beginPath();
      ctx.moveTo(fx2 - 13, FLOOR + 6); ctx.lineTo(fx2 + 13, FLOOR + 6);
      ctx.lineTo(fx2 + 78, 120); ctx.lineTo(fx2 - 78, 120);
      ctx.closePath(); ctx.fillStyle = '#ffe9a8'; ctx.fill();
      ctx.restore();
    }

    // curtains
    var cw = 92;
    for (var s = 0; s < 2; s++) {
      var x0 = s === 0 ? 0 : W - cw;
      ctx.save();
      P.rr(ctx, x0 - 8, -12, cw + 16, 330, 10, '#8a1a2a', '#5a0a16', 3);
      for (var d = 0; d < 5; d++) {
        P.line(ctx, [[x0 + 12 + d * 22, -8], [x0 + 16 + d * 22, 320]], U.rgba('#5a0a16', .5), 6);
      }
      ctx.restore();
    }
    P.rr(ctx, -10, -24, W + 20, 56, 10, '#8a1a2a', '#5a0a16', 3);
    for (var sc = 0; sc < 18; sc++) {
      P.ell(ctx, 20 + sc * 54, 30, 28, 18, '#a02434', '#5a0a16', 2.4);
    }

    // audience
    drawAudience(ctx, b);
  }

  var STAGE_BG = {
    stage: ['#3a2a4a', '#1c1226', '#4a3560', '#3f2f52', '#2f2440', '#8a5a30'],
    forest: ['#7fc7e8', '#cfe9c0', '#4f9a48', '#3f8a3c', '#2f6a2c', '#8a5a30'],
    ember: ['#f09a4a', '#5a1a10', '#c8442a', '#8a2a18', '#5a1a10', '#6a3a22'],
    harbor: ['#8fd0f0', '#2f5a7a', '#4f8aa8', '#3f6a8a', '#2f4a60', '#7a6a4a'],
    carnival: ['#f0a0c0', '#5a2b6e', '#8a5fc0', '#6b3f7a', '#4a2f5a', '#8a1a2a'],
    library: ['#d8c8a0', '#4a3560', '#7b4fa0', '#5a3f7a', '#3f2f52', '#7a5230'],
    frost: ['#cfe8f8', '#4f7a9a', '#9fd8f0', '#7ab8d8', '#4f8aa8', '#8fb0c8'],
    foundry: ['#c8b48a', '#3a3f4a', '#6f7a8c', '#5a626e', '#3f4650', '#5a5f6a'],
    blot: ['#4a3560', '#0f0a18', '#2f2440', '#241a34', '#160f22', '#241a34'],
    void_: ['#f2f0ff', '#c8c4e0', '#e0dcf0', '#d0ccE8', '#bfbad8', '#a8a4c0'],
    coliseum: ['#f0d8a0', '#8a5a30', '#c8a06a', '#a9713f', '#7a5230', '#c8a06a']
  };

  function drawAudience(ctx, b) {
    var rows = 2, per = 22;
    var n = Math.round(U.clamp(b.audience, 0, 100) / 100 * rows * per);
    var t = b.t;
    var cheering = b.msgT > 40 || b.crowdTossT > 0;
    var i = 0;
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < per; c++) {
        if (i >= n) break;
        var x = 24 + c * 43 + (r % 2) * 20;
        var y = H - 34 + r * 22;
        var bob = Math.sin(t * (cheering ? 0.28 : 0.05) + i * 0.7) * (cheering ? 5 : 1.6);
        var col = AUD_COL[i % AUD_COL.length];
        ctx.save();
        ctx.globalAlpha = 0.95;
        P.ell(ctx, x, y - bob, 14, 13, col, U.shade(col, -.4), 2);
        P.ell(ctx, x - 4.5, y - bob - 1, 2.2, 2.6, '#2a1c3c', null);
        P.ell(ctx, x + 4.5, y - bob - 1, 2.2, 2.6, '#2a1c3c', null);
        ctx.restore();
        i++;
      }
    }
    // stage lip
    P.rr(ctx, -10, H - 58, W + 20, 12, 4, '#5a3a20', '#3a2412', 2.4);
  }
  var AUD_COL = ['#e8b96a', '#9fd0e8', '#d8a0c8', '#a8d8a0', '#f0c060', '#c0a8e8', '#f0a090', '#88ccc0'];

  /* ---- combatant drawing --------------------------------------------------- */
  function drawCombatant(ctx, b, c) {
    var st = {
      t: c.t, anim: c.anim,
      flip: c.side === 'enemy' ? -1 : 1,
      scale: 1.42,
      lift: c.lift || 0,
      tint: c.hitFlash > 0 ? '#ffffff' : null,
      tintAmt: c.hitFlash > 0 ? (c.hitFlash / 14) * .85 : 0,
      blink: (c.t % 190 < 8) ? 1 : 0,
      talking: false
    };
    var x = c.x + (c.shake > 0 ? U.rndRange(-c.shake / 2.4, c.shake / 2.4) : 0);
    var y = c.y;
    if (c.down) {
      st.alpha = Math.max(0, 1 - (c.deadT || 0) / 46);
      st.rot = -1.2;
    }
    if (hasStatus(c, 'freeze')) { st.tint = '#9fd8f0'; st.tintAmt = .5; }
    if (hasStatus(c, 'inked')) { st.tint = '#2a1c3c'; st.tintAmt = .35; }
    if (hasStatus(c, 'shrink')) st.scale = st.scale * .68;
    if (c.kind === 'hero' && c.form) st.scale *= 1.02;
    Spr.draw(ctx, c.sprite, x, y, st);

    // form aura
    if (c.kind === 'hero' && c.form) {
      var fm = Mv.get(c.form);
      var col = c.form === 'form_crane' ? '#8fd0f0' : c.form === 'form_fortress' ? '#9aa3b0'
        : c.form === 'form_dart' ? '#e0483c' : c.form === 'form_lantern' ? '#ffe066' : '#cfd6de';
      ctx.save(); ctx.globalAlpha = .25 + Math.sin(c.t * .08) * .1;
      P.ell(ctx, x, y - 40, 42, 50, null, col, 3);
      ctx.restore();
      P.text(ctx, fm.name.replace(' Form', ''), x, y + 22, { size: 11, align: 'center', color: col });
    }

    // status icons
    var sy = y - Spr.height(c.sprite) * 1.15 - 18;
    for (var i = 0; i < c.st.length; i++) {
      var d = STATUS[c.st[i].type];
      if (!d) continue;
      var ix = x - (c.st.length - 1) * 9 + i * 18;
      P.ell(ctx, ix, sy, 8, 8, d.color, '#2a1c3c', 1.8);
      P.text(ctx, '' + c.st[i].turns, ix, sy + 4, { size: 10, align: 'center', color: '#2a1c3c', outline: false, shadow: false });
    }
    for (var q = 0; q < c.buffs.length; q++) {
      var bd = BUFFS[c.buffs[q].type];
      if (!bd) continue;
      var bx = x - (c.buffs.length - 1) * 9 + q * 18;
      P.star(ctx, bx, sy - 18, 7, 3, 5, 0, bd.color, '#2a1c3c', 1.4);
    }

    // enemy HP bar (Peekaboo, tattled, or boss)
    if (c.side === 'enemy' && !c.down) {
      var show = St.badgeMods().peekaboo || St.isTattled(c.id) || hasFlag(c, 'boss');
      if (show) {
        var bw = hasFlag(c, 'boss') ? 84 : 56;
        UI.bar(ctx, x - bw / 2, y + 12, bw, 8, c.hp / c.maxHp, '#e0483c', '#f0908a');
        if (St.badgeMods().peekaboo) P.text(ctx, c.hp + '/' + c.maxHp, x, y + 32, { size: 11, align: 'center', color: '#fff' });
      }
      if (c.guardTurns > 0) P.text(ctx, '🛡', x + 28, y - 6, { size: 14, align: 'center', color: '#57b8ea' });
    }
  }

  Battle.prototype.draw = function (ctx) {
    var self = this;
    ctx.save();
    if (this.shake > 0.4) ctx.translate(U.rndRange(-this.shake, this.shake), U.rndRange(-this.shake, this.shake) * .5);

    drawStage(ctx, this);

    if (this.duetFlash > 0) {
      ctx.save(); ctx.globalAlpha = U.clamp(this.duetFlash / 60, 0, 1) * .35;
      ctx.fillStyle = '#ffe9a8'; ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }

    // depth sort
    var all = this.everyone().slice().sort(function (a, b2) { return (a.y - (a.lift || 0)) - (b2.y - (b2.lift || 0)); });
    for (var i = 0; i < all.length; i++) drawCombatant(ctx, this, all[i]);

    // fx
    for (var f = 0; f < this.fx.length; f++) {
      var e = this.fx[f];
      var a = 1 - e.t / e.life;
      ctx.save(); ctx.globalAlpha = U.clamp(a, 0, 1);
      if (e.k === 'bit') {
        ctx.translate(e.x, e.y); ctx.rotate(e.rot);
        P.rr(ctx, -e.r / 2, -e.r / 2, e.r, e.r * .7, 1, e.c, null, 0);
      } else if (e.k === 'slash') {
        ctx.translate(e.x, e.y); ctx.rotate(e.a);
        var w2 = 70 * (0.4 + e.t / e.life);
        P.poly(ctx, [[-w2, -4], [w2, -10], [w2, 10], [-w2, 4]], e.c, null, 0);
      } else if (e.k === 'ring') {
        var rr2 = e.r * (e.t / e.life);
        P.ell(ctx, e.x, e.y, rr2, rr2 * .5, null, e.c, 4);
      } else if (e.k === 'star') {
        P.star(ctx, e.x, e.y, 10, 4, 5, e.t * .1, e.c, '#2a1c3c', 1.4);
      }
      ctx.restore();
    }

    // damage numbers
    for (var n = 0; n < this.numbers.length; n++) {
      var num = this.numbers[n];
      UI.damageNumber(ctx, num.txt, num.x, num.y, num.t, num.c, num.crit);
    }

    ctx.restore();

    // ---- HUD ----
    this.drawBattleHud(ctx);

    // target cursor
    if (this.targetCursor) {
      var tc = this.targetCursor.pool[this.targetCursor.idx];
      if (tc) {
        var bob = Math.sin(this.t * .18) * 4;
        P.poly(ctx, [[tc.x - 14, tc.y - 104 - bob], [tc.x + 14, tc.y - 104 - bob], [tc.x, tc.y - 84 - bob]], '#ffe066', '#2a1c3c', 2.4);
        P.text(ctx, tc.name, tc.x, tc.y - 112 - bob, { size: 13, align: 'center', color: '#fff8e0' });
      }
    }

    // menus
    for (var mi = 0; mi < this.menuStack.length; mi++) this.menuStack[mi].draw(ctx);

    // action command widget
    if (this.co) this.co.drawExtra(ctx);
    if (this.activeGuard) this.activeGuard.draw(ctx, this.hero.x, this.hero.y - 44);
    if (this.stylishWindow > 0) {
      var sa = this.stylishWindow / 16;
      ctx.save(); ctx.globalAlpha = sa;
      P.text(ctx, 'X for STYLISH!', W / 2, H - 150, { size: 22, align: 'center', color: '#f07a8a' });
      ctx.restore();
    }

    // banner
    if (this.msgT > 0 && this.msg) {
      var ba = U.clamp(this.msgT / 22, 0, 1);
      ctx.save(); ctx.globalAlpha = ba;
      P.textWave(ctx, this.msg.txt, W / 2, 118, { size: 26, align: 'center', color: this.msg.c, amp: 2, phase: this.t * .1 });
      ctx.restore();
    }

    if (this.phase === 'victory') this.drawVictory(ctx);
    if (this.phase === 'levelup' && this.levelMenu) {
      ctx.save(); ctx.fillStyle = 'rgba(15,10,24,.6)'; ctx.fillRect(0, 0, W, H); ctx.restore();
      UI.title(ctx, 'LEVEL UP!', 150, { t: this.t, color: '#ffe066', size: 40 });
      this.levelMenu.draw(ctx);
    }
    if (this.phase === 'gameover') {
      ctx.save(); ctx.fillStyle = 'rgba(15,10,24,.82)'; ctx.fillRect(0, 0, W, H); ctx.restore();
      UI.title(ctx, 'CRUMPLED', 230, { t: this.t, color: '#e0483c', size: 52 });
      P.text(ctx, 'Press Z to continue', W / 2, 300, { size: 18, align: 'center', color: '#f7edd6' });
    }

    this.dlg.draw(ctx);
    this.fader.draw(ctx);
  };

  Battle.prototype.drawBattleHud = function (ctx) {
    var S = St.get();
    // hero panel
    P.panel(ctx, 14, 12, 214, 62, { fill: '#fdf6e3', edge: '#8a6a3a', radius: 10, stackRot: -.01 });
    P.text(ctx, S.name, 26, 32, { size: 15, color: '#4a3a24', outline: false, shadow: false });
    P.text(ctx, 'Lv' + S.level, 190, 32, { size: 13, align: 'right', color: '#8a6a3a', outline: false, shadow: false });
    UI.bar(ctx, 26, 38, 108, 11, this.hero.hp / this.hero.maxHp, '#e0483c', '#f0908a');
    P.text(ctx, this.hero.hp + '/' + this.hero.maxHp, 140, 48, { size: 12, color: '#4a3a24', outline: false, shadow: false });
    UI.bar(ctx, 26, 54, 108, 11, S.fp / St.maxFp(), '#4fae62', '#8fcf52');
    P.text(ctx, S.fp + '/' + St.maxFp(), 140, 64, { size: 12, color: '#4a3a24', outline: false, shadow: false });

    // partner panel
    if (this.partner) {
      P.panel(ctx, 236, 12, 186, 62, { fill: '#fdf6e3', edge: '#8a6a3a', radius: 10, stack: false });
      P.text(ctx, this.partner.name, 248, 32, { size: 15, color: '#4a3a24', outline: false, shadow: false });
      P.text(ctx, 'R' + this.partner.rank, 408, 32, { size: 12, align: 'right', color: '#8a6a3a', outline: false, shadow: false });
      UI.bar(ctx, 248, 40, 108, 12, this.partner.hp / this.partner.maxHp, '#3f76c9', '#8fd0f0');
      P.text(ctx, this.partner.hp + '/' + this.partner.maxHp, 362, 51, { size: 12, color: '#4a3a24', outline: false, shadow: false });
    }

    // seal energy
    var sx = W - 232, sy = 12;
    P.panel(ctx, sx, sy, 218, 62, { fill: '#fdf6e3', edge: '#8a6a3a', radius: 10, stack: false });
    P.text(ctx, 'SEAL', sx + 12, sy + 22, { size: 12, color: '#8a6a3a', outline: false, shadow: false });
    var wedges = Math.max(1, S.seals.length);
    for (var i = 0; i < wedges; i++) {
      var filled = S.se >= (i + 1) * 100;
      var partial = !filled && S.se > i * 100 ? (S.se - i * 100) / 100 : 0;
      P.star(ctx, sx + 62 + i * 21, sy + 18, 9, 4, 5, 0,
        filled ? '#ffe066' : (partial > 0 ? U.mix('#7a6a4a', '#ffe066', partial) : '#cfc2a8'), '#8a6a3a', 1.6);
    }
    // encore gauge
    P.text(ctx, 'ENCORE', sx + 12, sy + 46, { size: 12, color: '#8a6a3a', outline: false, shadow: false });
    UI.bar(ctx, sx + 66, sy + 36, 136, 13, this.encore / 100, this.encore >= 100 ? '#f5c02e' : '#8a5fc0', '#c8a2e8');
    if (this.encore >= 100) {
      ctx.save(); ctx.globalAlpha = .5 + Math.sin(this.t * .16) * .5;
      P.text(ctx, 'READY', sx + 134, sy + 47, { size: 11, align: 'center', color: '#2a1c3c', outline: false, shadow: false });
      ctx.restore();
    }
    // audience
    P.panel(ctx, W - 232, 82, 218, 26, { fill: '#fdf6e3', edge: '#8a6a3a', radius: 8, stack: false });
    P.text(ctx, 'CROWD', W - 220, 100, { size: 11, color: '#8a6a3a', outline: false, shadow: false });
    UI.bar(ctx, W - 168, 89, 142, 12, this.audience / 100, '#e8506a', '#f0a0b0');
  };

  Battle.prototype.drawVictory = function (ctx) {
    var S = St.get();
    ctx.save(); ctx.fillStyle = 'rgba(15,10,24,.5)'; ctx.fillRect(0, 0, W, H); ctx.restore();
    var bw = 400, bh = 208, bx = (W - bw) / 2, by = 130;
    P.panel(ctx, bx, by, bw, bh, { fill: '#fdf6e3', edge: '#8a6a3a', radius: 14 });
    UI.title(ctx, 'VICTORY', by - 22, { t: this.t, size: 38, color: '#ffe066' });
    P.text(ctx, 'Seal Points', bx + 32, by + 52, { size: 17, color: '#4a3a24', outline: false, shadow: false });
    P.text(ctx, '+' + this.spGained, bx + bw - 32, by + 52, { size: 17, align: 'right', color: '#c8443c', outline: false, shadow: false });
    P.text(ctx, 'Coins', bx + 32, by + 84, { size: 17, color: '#4a3a24', outline: false, shadow: false });
    P.text(ctx, '+' + this.coinsGained, bx + bw - 32, by + 84, { size: 17, align: 'right', color: '#c8963c', outline: false, shadow: false });
    // next level bar
    P.text(ctx, 'Lv ' + S.level, bx + 32, by + 118, { size: 15, color: '#8a6a3a', outline: false, shadow: false });
    UI.bar(ctx, bx + 84, by + 106, bw - 150, 14, S.sp / St.spToNext(), '#f5c02e', '#ffe37a');
    P.text(ctx, S.sp + '/' + St.spToNext(), bx + bw - 32, by + 118, { size: 13, align: 'right', color: '#8a6a3a', outline: false, shadow: false });
    var iy = by + 142;
    if (this.itemsGained.length) {
      P.text(ctx, 'Found:', bx + 32, iy + 14, { size: 15, color: '#4a3a24', outline: false, shadow: false });
      for (var i = 0; i < Math.min(5, this.itemsGained.length); i++) {
        It.drawIcon(ctx, this.itemsGained[i], bx + 104 + i * 34, iy + 8, 28);
      }
    }
    ctx.save(); ctx.globalAlpha = .6 + Math.sin(this.t * .1) * .4;
    P.text(ctx, 'Z to continue', W / 2, by + bh + 26, { size: 15, align: 'center', color: '#f7edd6' });
    ctx.restore();
  };

  function start(cfg, onEnd) { return new Battle(cfg, onEnd); }

  return { start: start, Battle: Battle, STATUS: STATUS, BUFFS: BUFFS, FLOOR: FLOOR };
})();
