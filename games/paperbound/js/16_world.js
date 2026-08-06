/* ==========================================================================
   PAPERBOUND — 16_world.js
   The overworld: a 2.5D plane where x runs left/right, z runs into the screen
   (0 = far, 1 = near) and y is height above the floor. Sprites are flat paper
   billboards sorted by depth, which is exactly how the games this is modelled
   on fake a third dimension.
   ========================================================================== */
'use strict';

PB.Maps = (function () {
  var db = {};
  function define(id, o) { o.id = id; db[id] = o; return o; }
  function get(id) { return db[id]; }
  function all() { return db; }
  function has(id) { return !!db[id]; }
  return { define: define, get: get, all: all, has: has };
})();

PB.World = (function () {
  var U = PB.U, P = PB.Paper, In = PB.Input, A = PB.Audio, Spr = PB.Sprites;
  var UI = PB.UI, St = PB.State, Maps = PB.Maps, Sc = PB.Script;

  var W = 960, H = 540;
  var HORIZON = 296, DEPTH = 124;
  var GRAV = 0.62, JUMP_V = 10.4, WALK = 3.1, RUN = 4.5;

  function proj(x, z, y, camX) {
    return { sx: x - camX, sy: HORIZON + z * DEPTH - (y || 0), sc: 0.98 + z * 0.44 };
  }

  /* ======================================================================
     Entities
     ====================================================================== */
  function Ent(o) {
    U.extend(this, {
      id: o.id || ('e' + U.rndInt(1e9)), kind: o.kind || 'npc',
      sprite: o.sprite || 'villager_a', x: o.x || 0, z: o.z === undefined ? .5 : o.z, y: o.y || 0,
      vx: 0, vz: 0, vy: 0, flip: o.face === 'left' ? -1 : 1, flipT: o.face === 'left' ? 1 : 0,
      anim: 'idle', t: U.rndInt(200), scale: o.scale || 1, name: o.name || '',
      script: o.script || null, solid: o.solid !== false, hidden: !!o.hidden,
      moveTo: null, moveCb: null, speed: 2, hopCb: null,
      bob: !!o.bob, data: o
    }, {});
  }

  /* ======================================================================
     World scene
     ====================================================================== */
  function World(game) {
    this.game = game;
    this.t = 0;
    this.map = null;
    this.camX = 0; this.camTarget = null; this.camLock = false; this.camLerp = .1;
    this.player = { x: 0, z: .5, y: 0, vx: 0, vz: 0, vy: 0, onGround: true, flip: 1, flipT: 0, anim: 'idle', t: 0, standing: null, form: null, formT: 0, gliding: false };
    this.partnerEnt = { x: 0, z: .5, y: 0, flip: 1, flipT: 0, anim: 'idle', t: 0, trail: [] };
    this.ents = [];
    this.foes = [];
    this.pickups = [];
    this.gizmos = [];
    this.triggers = [];
    this.blocks = [];
    this.dlg = new UI.Dialogue();
    this.fader = new UI.Fader();
    this.co = null;              // running script coroutine
    this.busy = false;           // cutscene lock
    this.shake = 0;
    this.chapterCard = null;
    this.bigText = null;
    this.hint = null;
    this.battle = null;
    this.battleCb = null;
    this.overlay = null;         // shop / pause / save panel
    this.darkness = 0;
    this.lightRadius = 0;
    this.swing = 0;
    this.fx = [];
    this.encounterCooldown = 0;
    this.lastSafe = { x: 0, z: .5 };
    this.repel = 0;
    this.stepT = 0;
    this.credits = null;
    this.fastTravel = false;
  }

  /* ---- loading ------------------------------------------------------------ */
  World.prototype.load = function (mapId, spawnId) {
    var m = Maps.get(mapId);
    if (!m) { if (window.console) console.error('missing map', mapId); m = Maps.get('quill_square'); }
    this.map = m;
    var S = St.get();
    S.map = m.id; S.spawn = spawnId || 'default';

    this.ents = []; this.foes = []; this.pickups = []; this.gizmos = []; this.triggers = []; this.blocks = [];
    this.fx = []; this.hint = null; this.darkness = m.dark ? 1 : 0;

    var i;
    (m.solids || []).forEach(function (s) {
      this.blocks.push({ x: s.x, z: s.z === undefined ? .5 : s.z, w: s.w, d: s.d === undefined ? .3 : s.d, h: s.h || 40, sprite: s.sprite, wall: !!s.wall, id: s.id, hidden: !!s.hidden, water: !!s.water });
    }, this);
    (m.props || []).forEach(function (p) {
      this.ents.push(new Ent({ id: p.id, kind: 'prop', sprite: p.sprite, x: p.x, z: p.z, y: p.y || 0, scale: p.scale, face: p.face, solid: false, hidden: p.hidden }));
    }, this);
    (m.npcs || []).forEach(function (n) {
      this.ents.push(new Ent(U.extend({ kind: 'npc' }, n)));
    }, this);
    (m.foes || []).forEach(function (f) {
      if (f.flag && St.hasFlag(f.flag)) return;
      if (f.killFlag && St.hasFlag(f.killFlag)) return;
      this.foes.push({
        id: f.id || ('f' + U.rndInt(1e9)), type: f.type, group: f.group || [f.type],
        x: f.x, z: f.z === undefined ? .5 : f.z, y: 0, homeX: f.x, patrol: f.patrol || 0,
        dir: 1, t: U.rndInt(200), anim: 'walk', flip: 1, flipT: 0, stunned: 0, dead: false,
        killFlag: f.killFlag, boss: !!f.boss, cfg: f.cfg || null, speed: f.speed || 1.1,
        chase: f.chase === undefined ? true : f.chase, vy: 0
      });
    }, this);
    (m.items || []).forEach(function (it) {
      if (it.flag && St.hasFlag(it.flag)) return;
      this.pickups.push(U.extend({ t: U.rndInt(200), taken: false }, it));
    }, this);
    (m.gizmos || []).forEach(function (g) {
      this.gizmos.push(U.extend({ t: U.rndInt(200), used: !!(g.flag && St.hasFlag(g.flag)) }, g));
    }, this);
    (m.triggers || []).forEach(function (tr) {
      this.triggers.push(U.extend({ fired: !!(tr.flag && St.hasFlag(tr.flag)) }, tr));
    }, this);

    var sp = (m.spawns && m.spawns[spawnId]) || (m.spawns && m.spawns.default) || { x: (m.bounds.x0 + 60), z: .5 };
    this.player.x = sp.x; this.player.z = sp.z === undefined ? .5 : sp.z;
    this.player.y = sp.y || 0; this.player.vx = this.player.vy = this.player.vz = 0;
    this.player.onGround = true;
    if (sp.face === 'left') { this.player.flip = -1; this.player.flipT = 1; }
    this.lastSafe = { x: this.player.x, z: this.player.z };
    this.partnerEnt.x = this.player.x - 30; this.partnerEnt.z = this.player.z;
    this.camX = this.clampCam(this.player.x - W / 2);
    this.camLock = false;

    A.play(m.music || 'town');
    this.busy = false;
    this.co = null;
    if (m.onEnter) {
      var script = typeof m.onEnter === 'function' ? m.onEnter() : m.onEnter;
      if (script && script.length) this.runScript(script);
    }
  };

  World.prototype.clampCam = function (x) {
    var b = this.map.bounds;
    var span = b.x1 - b.x0;
    if (span <= W) return b.x0 - (W - span) / 2;
    return U.clamp(x, b.x0, b.x1 - W);
  };

  /* ---- script plumbing ----------------------------------------------------- */
  World.prototype.runScript = function (script, vars) {
    if (!script) return;
    this.busy = true;
    this.coro = makeCoro(Sc.run(this, script, vars || {}));
    this.player.anim = 'idle';
  };
  function makeCoro(gen) {
    return {
      g: gen, wait: 0, until: null, done: false,
      step: function () {
        if (this.done) return true;
        if (this.wait > 0) { this.wait--; return false; }
        if (this.until) { if (!this.until()) return false; this.until = null; }
        var r;
        try { r = this.g.next(); }
        catch (e) { if (window.console) console.error('script error', e); this.done = true; return true; }
        if (r.done) { this.done = true; return true; }
        var v = r.value;
        if (typeof v === 'number') this.wait = v;
        else if (v && v.until) this.until = v.until;
        return false;
      }
    };
  }

  /* ---- script hooks -------------------------------------------------------- */
  World.prototype.findEnt = function (id) {
    if (id === 'player' || id === 'pip') return this.player;
    if (id === 'partner') return this.partnerEnt;
    for (var i = 0; i < this.ents.length; i++) if (this.ents[i].id === id) return this.ents[i];
    for (var j = 0; j < this.foes.length; j++) if (this.foes[j].id === id) return this.foes[j];
    return null;
  };
  World.prototype.moveEntity = function (id, x, z, speed, cb) {
    var e = this.findEnt(id);
    if (!e) { if (cb) cb(); return; }
    e.moveTo = { x: x, z: z === undefined ? e.z : z }; e.speed = speed || 2; e.moveCb = cb || null;
    e.anim = 'walk';
  };
  World.prototype.faceEntity = function (id, dir) {
    var e = this.findEnt(id); if (!e) return;
    e.flip = dir === 'left' ? -1 : 1;
    e.flipT = dir === 'left' ? 1 : 0;
  };
  World.prototype.animEntity = function (id, an) { var e = this.findEnt(id); if (e) e.anim = an; };
  World.prototype.hopEntity = function (id, n, cb) {
    var e = this.findEnt(id); if (!e) { if (cb) cb(); return; }
    e.vy = 8; e.hopCb = cb; A.sfx('jump');
  };
  World.prototype.setEntity = function (id, props) { var e = this.findEnt(id); if (e) U.extend(e, props); };
  World.prototype.spawnEntity = function (def) { this.ents.push(new Ent(def)); };
  World.prototype.despawnEntity = function (id) {
    for (var i = this.ents.length - 1; i >= 0; i--) if (this.ents[i].id === id) this.ents.splice(i, 1);
    for (var j = this.foes.length - 1; j >= 0; j--) if (this.foes[j].id === id) this.foes.splice(j, 1);
  };
  World.prototype.cameraTo = function (x, frames) { this.camLock = true; this.camTarget = x; this.camLerp = 2 / Math.max(4, frames); };
  World.prototype.cameraFollow = function () { this.camLock = false; this.camLerp = .1; };
  World.prototype.travel = function (mapId, spawn, cb) {
    var self = this;
    A.sfx('door');
    this.fader.out(function () {
      self.load(mapId, spawn);
      self.fader.in(function () { if (cb) cb(); }, .07);
    }, .08, '#0f0a18');
  };
  World.prototype.startBattle = function (cfg, cb) {
    var self = this;
    A.sfx('tear');
    this.fader.out(function () {
      self.battle = PB.Battle.start(cfg, function (res) {
        self.battle = null;
        A.play(self.map.music || 'town');
        self.fader.in(null, .07);
        if (res.result === 'lose') { self.game.gameOver(); return; }
        if (cb) cb(res);
      });
      self.fader.in(null, .09);
    }, .1, '#0f0a18', 'iris');
  };
  World.prototype.openShop = function (shopId, cb) { this.overlay = PB.Menus.shop(this, shopId, cb); };
  World.prototype.openInn = function (price, cb) { this.overlay = PB.Menus.inn(this, price, cb); };
  World.prototype.openCook = function (cb) { this.overlay = PB.Menus.cook(this, cb); };
  World.prototype.openSave = function (cb) { this.overlay = PB.Menus.save(this, cb); };
  World.prototype.rollCredits = function () { this.game.rollCredits(); };

  /* ======================================================================
     Collision
     ====================================================================== */
  World.prototype.blockAt = function (x, z, y, r) {
    r = r || 13;
    for (var i = 0; i < this.blocks.length; i++) {
      var b = this.blocks[i];
      if (b.hidden) continue;
      if (Math.abs(x - b.x) < b.w / 2 + r && Math.abs(z - b.z) < b.d / 2 + .06) {
        if (b.wall || y < b.h - 3) return b;
      }
    }
    return null;
  };
  World.prototype.floorAt = function (x, z, fromY) {
    var best = 0, bb = null;
    for (var i = 0; i < this.blocks.length; i++) {
      var b = this.blocks[i];
      if (b.hidden || b.wall) continue;
      if (Math.abs(x - b.x) < b.w / 2 + 4 && Math.abs(z - b.z) < b.d / 2 + .04) {
        if (b.h <= fromY + 6 && b.h > best) { best = b.h; bb = b; }
      }
    }
    return { y: best, block: bb };
  };
  World.prototype.inPit = function (x, z) {
    var pits = this.map.pits || [];
    for (var i = 0; i < pits.length; i++) {
      var p = pits[i];
      if (x > p.x0 && x < p.x1 && z > (p.z0 === undefined ? -1 : p.z0) && z < (p.z1 === undefined ? 2 : p.z1)) return p;
    }
    return null;
  };
  World.prototype.inWater = function (x, z) {
    var ws = this.map.water || [];
    for (var i = 0; i < ws.length; i++) {
      var w = ws[i];
      if (x > w.x0 && x < w.x1 && z > (w.z0 === undefined ? -1 : w.z0) && z < (w.z1 === undefined ? 2 : w.z1)) return w;
    }
    return null;
  };

  /* ======================================================================
     Update
     ====================================================================== */
  World.prototype.update = function () {
    this.t++;
    St.get().frames++;
    this.fader.update();
    this.dlg.update();
    UI.updateToasts();
    if (this.repel > 0) this.repel--;
    if (this.encounterCooldown > 0) this.encounterCooldown--;

    if (this.battle) { this.battle.update(); return; }
    if (this.credits) { this.updateCredits(); return; }

    if (this.chapterCard) {
      this.chapterCard.t++;
      if (this.chapterCard.t > 190 || (this.chapterCard.t > 40 && In.pressed('a'))) this.chapterCard = null;
      return;
    }
    if (this.bigText) { this.bigText.t++; if (this.bigText.t > this.bigText.life) this.bigText = null; }

    if (this.overlay) {
      this.overlay.update();
      if (this.overlay.closed) { var cb = this.overlay.onClose; this.overlay = null; if (cb) cb(); }
      return;
    }

    // running cutscene
    if (this.coro && !this.coro.done) {
      if (!this.dlg.isBusy()) this.coro.step();
      if (this.coro.done) { this.coro = null; this.busy = false; }
    }

    if (!this.busy && !this.fader.busy()) {
      if (In.pressed('start')) { this.overlay = PB.Menus.pause(this); A.sfx('ok'); return; }
      if (In.pressed('select')) { this.overlay = PB.Menus.worldmap(this); A.sfx('ok'); return; }
      this.updatePlayer();
    } else {
      this.player.vx = U.approach(this.player.vx, 0, .6);
      this.player.x += this.player.vx;
    }

    this.updatePhysics();
    this.updatePartner();
    this.updateEnts();
    this.updateFoes();
    this.updatePickups();
    this.updateHint();
    this.updateTriggers();
    this.updateCamera();

    for (var i = this.fx.length - 1; i >= 0; i--) {
      var e = this.fx[i]; e.t++;
      if (e.vx !== undefined) { e.x += e.vx; e.y += e.vy; e.vy += .2; }
      if (e.t > e.life) this.fx.splice(i, 1);
    }
    if (this.shake > 0) this.shake *= .86;
    if (this.swing > 0) this.swing--;
    if (this.player.formT > 0) this.player.formT--;
  };

  World.prototype.updatePlayer = function () {
    var p = this.player, m = this.map;
    var ax = In.axisX(), az = In.axisZ();
    var run = In.down('r') || In.down('l');
    var sp = (run ? RUN : WALK) * (p.form === 'weight' ? .55 : 1);

    if (ax || az) {
      var len = Math.sqrt(ax * ax + az * az) || 1;
      p.vx = (ax / len) * sp;
      p.vz = (az / len) * sp * 0.011;
      if (ax !== 0) {
        var want = ax > 0 ? 0 : 1;
        p.flipT = U.approach(p.flipT, want, .22);
      }
      p.anim = p.onGround ? (run ? 'run' : 'walk') : p.anim;
      if (p.onGround) {
        this.stepT++;
        if (this.stepT % (run ? 9 : 13) === 0) { A.sfx('step'); St.get().stats.steps++; }
      }
    } else {
      p.vx = U.approach(p.vx, 0, 1.2);
      p.vz = U.approach(p.vz, 0, .01);
      if (p.onGround) p.anim = 'idle';
    }

    // jump
    if (In.pressed('a') && p.onGround && !this.talkTarget()) {
      p.vy = JUMP_V; p.onGround = false; p.anim = 'jump'; A.sfx('jump');
    }
    // glide (Plane form)
    p.gliding = false;
    if (!p.onGround && p.vy < 0 && In.down('a') && St.hasFlag('form_plane')) {
      p.vy = Math.max(p.vy, -1.7); p.gliding = true; p.anim = 'fall';
      if (this.t % 6 === 0) A.sfx('rustle', 1.6);
    }

    // interact
    if (In.pressed('a') && p.onGround) {
      var tgt = this.talkTarget();
      if (tgt) { this.interact(tgt); In.clearAll(); return; }
    }
    // mallet swing
    if (In.pressed('b') && this.swing <= 0) {
      this.swing = 22; A.sfx('mallet'); p.anim = 'attack';
      this.fieldSwing();
    }
    // partner ability
    if (In.pressed('x')) this.usePartnerAbility();
    // fold (contextual)
    if (In.pressed('y')) this.useFold();
    // cycle partner
    if (In.pressed('l') && In.pressed('r')) { /* both = run, ignore */ }
  };

  World.prototype.updatePhysics = function () {
    var p = this.player, b = this.map.bounds;
    // x axis
    var nx = p.x + p.vx;
    if (!this.blockAt(nx, p.z, p.y)) p.x = nx; else p.vx = 0;
    p.x = U.clamp(p.x, b.x0 + 14, b.x1 - 14);
    // z axis
    var nz = U.clamp(p.z + p.vz, b.z0 === undefined ? .06 : b.z0, b.z1 === undefined ? .98 : b.z1);
    if (!this.blockAt(p.x, nz, p.y)) p.z = nz; else p.vz = 0;
    // y axis
    p.vy -= GRAV;
    p.y += p.vy;
    var f = this.floorAt(p.x, p.z, p.y - p.vy);
    if (p.y <= f.y) {
      if (!p.onGround && p.vy < -3) { A.sfx('land'); this.puff(p.x, p.z, f.y, '#e8dcc0', 5); }
      p.y = f.y; p.vy = 0; p.onGround = true; p.standing = f.block;
      if (p.anim === 'jump' || p.anim === 'fall') p.anim = 'idle';
    } else {
      p.onGround = false;
      if (p.vy < 0 && !p.gliding) p.anim = 'fall';
    }
    if (p.onGround) {
      var pit = this.inPit(p.x, p.z);
      if (pit) this.fallInPit(pit);
      else if (this.inWater(p.x, p.z) && this.player.form !== 'boat') this.fallInWater();
      else { this.lastSafe.x = p.x; this.lastSafe.z = p.z; }
    }
    p.t++;
  };

  World.prototype.fallInPit = function (pit) {
    var self = this, S = St.get();
    this.busy = true;
    A.sfx('hurt');
    var dmg = Math.max(1, Math.round(2 * St.diff().inDmg));
    S.hp = Math.max(1, S.hp - dmg);
    UI.toast('-' + dmg + ' HP', null, '#f0a0a0');
    this.fader.out(function () {
      self.player.x = pit.to ? pit.to.x : self.lastSafe.x;
      self.player.z = pit.to ? pit.to.z : self.lastSafe.z;
      self.player.y = 0; self.player.vy = 0;
      self.fader.in(function () { self.busy = false; }, .08);
    }, .1, '#0f0a18');
  };
  World.prototype.fallInWater = function () {
    var self = this;
    this.busy = true;
    A.sfx('water');
    this.fader.out(function () {
      self.player.x = self.lastSafe.x; self.player.z = self.lastSafe.z; self.player.y = 0; self.player.vy = 0;
      self.fader.in(function () { self.busy = false; }, .08);
    }, .12, '#3f6a8a');
  };

  World.prototype.puff = function (x, z, y, color, n) {
    for (var i = 0; i < (n || 6); i++) {
      this.fx.push({ k: 'bit', x: x + U.rndRange(-10, 10), z: z, y: y, vx: U.rndRange(-1.2, 1.2), vy: U.rndRange(1, 3), r: U.rndRange(2, 5), c: color, t: 0, life: 30 });
    }
  };

  /* ---- partner follows ------------------------------------------------------ */
  World.prototype.updatePartner = function () {
    var pe = this.partnerEnt, p = this.player;
    var id = St.get().active;
    if (!id) return;
    pe.sprite = PB.Partners.get(id).sprite;
    var tx = p.x - (p.flipT > .5 ? -34 : 34), tz = p.z - .04;
    var dx = tx - pe.x, dz = tz - pe.z;
    var d = Math.abs(dx);
    if (d > 6) {
      pe.x += U.clamp(dx * .16, -5.4, 5.4);
      pe.anim = d > 40 ? 'run' : 'walk';
      pe.flipT = U.approach(pe.flipT, dx > 0 ? 0 : 1, .2);
    } else pe.anim = 'idle';
    pe.z += dz * .16;
    pe.y = U.lerp(pe.y, Math.max(0, p.y - 6), .2);
    pe.t++;
  };

  /* ---- npcs ----------------------------------------------------------------- */
  World.prototype.updateEnts = function () {
    for (var i = 0; i < this.ents.length; i++) {
      var e = this.ents[i];
      e.t++;
      if (e.moveTo) {
        var dx = e.moveTo.x - e.x, dz = e.moveTo.z - e.z;
        var dist = Math.abs(dx) + Math.abs(dz) * 300;
        if (dist < e.speed + .5) {
          e.x = e.moveTo.x; e.z = e.moveTo.z; e.moveTo = null; e.anim = 'idle';
          if (e.moveCb) { var cb = e.moveCb; e.moveCb = null; cb(); }
        } else {
          var ang = Math.atan2(dz * 300, dx);
          e.x += Math.cos(ang) * e.speed;
          e.z += Math.sin(ang) * e.speed / 300;
          e.flipT = U.approach(e.flipT, dx > 0 ? 0 : 1, .2);
          e.anim = 'walk';
        }
      }
      if (e.vy || e.y > 0) {
        e.vy -= GRAV; e.y += e.vy;
        if (e.y <= 0) { e.y = 0; e.vy = 0; if (e.hopCb) { var hc = e.hopCb; e.hopCb = null; hc(); } }
      }
      if (e.data && e.data.wander && !e.moveTo && !this.busy && U.chance(.004)) {
        e.moveTo = { x: e.data.x + U.rndRange(-e.data.wander, e.data.wander), z: U.clamp(e.z + U.rndRange(-.1, .1), .1, .95) };
        e.speed = 1.1;
      }
    }
  };

  /* ---- field foes ------------------------------------------------------------ */
  World.prototype.updateFoes = function () {
    var p = this.player;
    for (var i = this.foes.length - 1; i >= 0; i--) {
      var f = this.foes[i];
      f.t++;
      if (f.stunned > 0) { f.stunned--; f.anim = 'dizzy'; continue; }
      if (this.busy || this.fader.busy()) { f.anim = 'idle'; continue; }

      var dx = p.x - f.x, dist = Math.abs(dx);
      var seeing = f.chase && dist < 170 && Math.abs(p.z - f.z) < .34 && this.repel <= 0;
      if (seeing) {
        f.x += U.sign(dx) * f.speed * 1.5;
        f.z += U.sign(p.z - f.z) * .006;
        f.flipT = U.approach(f.flipT, dx > 0 ? 0 : 1, .25);
        f.anim = 'run';
      } else if (f.patrol > 0) {
        f.x += f.dir * f.speed * .6;
        if (f.x > f.homeX + f.patrol) f.dir = -1;
        if (f.x < f.homeX - f.patrol) f.dir = 1;
        f.flipT = U.approach(f.flipT, f.dir > 0 ? 0 : 1, .18);
        f.anim = 'walk';
      } else f.anim = 'idle';

      // contact
      if (this.encounterCooldown <= 0 && Math.abs(p.x - f.x) < 26 && Math.abs(p.z - f.z) < .17 && p.y < 34) {
        this.beginFieldBattle(f, p.y > 8 ? 1 : (f.anim === 'run' && !seeing ? 0 : (seeing ? -1 : 0)));
        return;
      }
    }
  };

  World.prototype.fieldSwing = function () {
    var p = this.player;
    var reach = p.flipT > .5 ? -52 : 52;
    for (var i = 0; i < this.foes.length; i++) {
      var f = this.foes[i];
      if (Math.abs((p.x + reach) - f.x) < 40 && Math.abs(p.z - f.z) < .2) {
        f.stunned = 90;
        this.puff(f.x, f.z, 20, '#ffe066', 6);
        A.sfx('hit');
        this.beginFieldBattle(f, 1);
        return;
      }
    }
    // break blocks / hit gizmos
    for (var g = 0; g < this.gizmos.length; g++) {
      var gz = this.gizmos[g];
      if (gz.kind === 'block' && Math.abs((p.x + reach) - gz.x) < 34 && Math.abs(p.z - gz.z) < .2) {
        this.activateGizmo(gz);
        return;
      }
    }
    this.puff(p.x + reach * .6, p.z, 10, '#e8dcc0', 4);
  };

  World.prototype.beginFieldBattle = function (foe, advantage) {
    var self = this;
    this.encounterCooldown = 90;
    var group = foe.group && foe.group.length ? foe.group : [foe.type];
    var cfg = U.extend({
      enemies: group, firstStrike: advantage,
      bg: this.map.battleBg || 'stage',
      music: foe.boss ? 'boss' : 'battle',
      boss: !!foe.boss
    }, foe.cfg || {});
    this.startBattle(cfg, function (res) {
      if (res.result === 'win') {
        self.removeFoe(foe);
        if (foe.killFlag) St.flag(foe.killFlag, true);
        if (foe.onWin) self.runScript(foe.onWin);
      } else if (res.result === 'flee') {
        self.encounterCooldown = 180; self.repel = 240;
        foe.stunned = 120;
      }
    });
  };
  World.prototype.removeFoe = function (foe) {
    var i = this.foes.indexOf(foe);
    if (i >= 0) this.foes.splice(i, 1);
  };

  /* ---- pickups --------------------------------------------------------------- */
  World.prototype.updatePickups = function () {
    var p = this.player;
    for (var i = this.pickups.length - 1; i >= 0; i--) {
      var it = this.pickups[i];
      it.t++;
      if (it.taken) continue;
      if (it.kind === 'coin' || it.kind === 'shard') {
        if (Math.abs(p.x - it.x) < 26 && Math.abs(p.z - it.z) < .2 && Math.abs(p.y - (it.y || 0)) < 40) {
          it.taken = true;
          if (it.kind === 'coin') { var got = St.addCoins(it.amount || 1); A.sfx('coin'); UI.toast('+' + got + ' coins', 'seal1', '#ffe9a8'); }
          else { St.get().shards += 1; A.fanfare('item'); UI.toast('Foil Shard!', null, '#c8d2dc'); }
          if (it.flag) St.flag(it.flag, true);
          this.pickups.splice(i, 1);
        }
      }
    }
  };

  /* ---- interaction ------------------------------------------------------------ */
  World.prototype.talkTarget = function () {
    var p = this.player, best = null, bd = 999;
    var reachX = 46;
    for (var i = 0; i < this.ents.length; i++) {
      var e = this.ents[i];
      if (e.kind !== 'npc' || e.hidden || !e.script) continue;
      var d = Math.abs(p.x - e.x);
      if (d < reachX && Math.abs(p.z - e.z) < .22 && d < bd) { bd = d; best = { type: 'npc', ent: e }; }
    }
    for (var g = 0; g < this.gizmos.length; g++) {
      var gz = this.gizmos[g];
      if (gz.hidden) continue;
      if (gz.kind === 'soil' || gz.kind === 'seam' || gz.kind === 'glyph' || gz.kind === 'crack' || gz.kind === 'generator' || gz.kind === 'dockside') continue;
      var d2 = Math.abs(p.x - gz.x);
      if (d2 < reachX && Math.abs(p.z - (gz.z === undefined ? .5 : gz.z)) < .24 && d2 < bd) { bd = d2; best = { type: 'gizmo', giz: gz }; }
    }
    for (var k = 0; k < this.pickups.length; k++) {
      var pk = this.pickups[k];
      if (pk.taken || (pk.kind !== 'chest' && pk.kind !== 'blockq')) continue;
      var d3 = Math.abs(p.x - pk.x);
      if (d3 < reachX && Math.abs(p.z - pk.z) < .24 && d3 < bd) { bd = d3; best = { type: 'pickup', pk: pk }; }
    }
    // exits are walked into, not talked to, except doors
    for (var x = 0; x < (this.map.exits || []).length; x++) {
      var ex = this.map.exits[x];
      if (!ex.door) continue;
      var d4 = Math.abs(p.x - ex.x);
      if (d4 < reachX && Math.abs(p.z - (ex.z === undefined ? .5 : ex.z)) < .3 && d4 < bd) { bd = d4; best = { type: 'exit', ex: ex }; }
    }
    return best;
  };

  World.prototype.interact = function (tgt) {
    var self = this;
    if (tgt.type === 'npc') {
      var e = tgt.ent;
      e.flipT = this.player.x > e.x ? 0 : 1;
      var sc = typeof e.script === 'function' ? e.script(this) : e.script;
      this.runScript(sc);
    } else if (tgt.type === 'gizmo') {
      this.activateGizmo(tgt.giz);
    } else if (tgt.type === 'pickup') {
      this.openChest(tgt.pk);
    } else if (tgt.type === 'exit') {
      this.useExit(tgt.ex);
    }
  };

  World.prototype.openChest = function (pk) {
    if (pk.taken) return;
    pk.taken = true;
    A.sfx('chest');
    if (pk.flag) St.flag(pk.flag, true);
    var script = [];
    if (pk.item) script.push(['give', pk.item]);
    if (pk.key) script.push(['givekey', pk.key]);
    if (pk.badge) script.push(['badge', pk.badge]);
    if (pk.coins) script.push(['coins', pk.coins]);
    if (pk.shard) script.push(['shard', pk.shard]);
    if (pk.script) script = script.concat(pk.script);
    this.runScript(script);
  };

  World.prototype.useExit = function (ex) {
    if (ex.needsFlag && !St.hasFlag(ex.needsFlag)) {
      if (ex.lockedMsg) this.runScript([['say', 'narr', ex.lockedMsg]]);
      return;
    }
    if (ex.needsKey && !St.hasKey(ex.needsKey)) {
      this.runScript([['say', 'narr', ex.lockedMsg || 'It is locked tight.']]);
      return;
    }
    if (ex.script) { this.runScript(ex.script); return; }
    this.runScript([['goto', ex.to, ex.spawn || 'default']]);
  };

  /* ---- gizmos ---------------------------------------------------------------- */
  World.prototype.activateGizmo = function (g) {
    var self = this;
    if (g.once && g.used) {
      if (g.usedMsg) this.runScript([['say', 'narr', g.usedMsg]]);
      return;
    }
    switch (g.kind) {
      case 'sign':
        this.runScript([['say', 'narr', g.text || '...']]);
        break;
      case 'save':
        this.runScript([['say', 'sys', 'Rest here and record your progress?'], ['save']]);
        break;
      case 'heartblock':
        St.fullHeal();
        A.fanfare('item');
        UI.toast('Fully restored!', null, '#f07a8a');
        this.ringFx(g.x, g.z, '#f07a8a');
        break;
      case 'block':
        g.used = true;
        A.sfx('chest');
        this.runScript((g.item ? [['give', g.item]] : []).concat(g.coins ? [['coins', g.coins]] : []).concat(g.script || []));
        break;
      case 'switch':
        g.used = true;
        A.sfx('ok');
        this.shake = 8;
        this.runScript(g.script || []);
        break;
      case 'spring':
        this.player.vy = 17; this.player.onGround = false; A.sfx('jump', 1.3);
        break;
      case 'shop': this.runScript([['shop', g.shop]]); break;
      case 'inn': this.runScript([['inn', g.price || 5]]); break;
      case 'cook': this.runScript([['cook']]); break;
      default:
        if (g.script) this.runScript(g.script);
    }
    if (g.once) g.used = true;
    if (g.flag) St.flag(g.flag, true);
  };

  World.prototype.ringFx = function (x, z, c) { this.fx.push({ k: 'ring', x: x, z: z, y: 20, c: c, t: 0, life: 30 }); };

  /* ---- partner field ability --------------------------------------------------- */
  World.prototype.usePartnerAbility = function () {
    var S = St.get(), id = S.active;
    if (!id) return;
    var pd = PB.Partners.get(id), ability = pd.field.id;
    var p = this.player;
    // find a gizmo in range that this ability answers
    for (var i = 0; i < this.gizmos.length; i++) {
      var g = this.gizmos[i];
      if (g.hidden) continue;
      if (g.needs !== ability) continue;
      if (Math.abs(p.x - g.x) > 62 || Math.abs(p.z - (g.z === undefined ? .5 : g.z)) > .3) continue;
      if (g.once && g.used) continue;
      this.doAbility(ability, g);
      return;
    }
    // ambient effects with no target
    if (ability === 'light') {
      this.lightRadius = 260; this.lightT = 300;
      A.sfx('fire');
      UI.toast('Lumen brightens the room.', null, '#ffe9a8');
      return;
    }
    A.sfx('error');
    this.flashHint(pd.name + ' has nothing to work with here.');
  };

  World.prototype.doAbility = function (ability, g) {
    var self = this;
    g.used = true;
    if (g.flag) St.flag(g.flag, true);
    switch (ability) {
      case 'sprout':
        A.sfx('rustle');
        g.grown = true;
        this.blocks.push({ x: g.x, z: g.z === undefined ? .5 : g.z, w: 46, d: .22, h: g.height || 110, sprite: null, vine: true });
        this.puff(g.x, g.z, 10, '#6fbb52', 10);
        UI.toast('A vine springs up!', null, '#8fcf52');
        break;
      case 'light':
        A.sfx('fire');
        this.lightRadius = 300; this.lightT = 600;
        this.puff(g.x, g.z, 30, '#ffb545', 12);
        break;
      case 'cut':
        A.sfx('fold');
        this.puff(g.x, g.z, 30, '#f7edd6', 12);
        break;
      case 'ferry':
        A.sfx('water');
        break;
      case 'read':
        A.sfx('blip2');
        break;
      case 'power':
        A.sfx('zap');
        this.shake = 10;
        this.puff(g.x, g.z, 30, '#ffe066', 12);
        break;
    }
    // unhide linked blocks, remove barriers, run script
    if (g.reveals) {
      for (var i = 0; i < this.blocks.length; i++) if (this.blocks[i].id === g.reveals) this.blocks[i].hidden = false;
      for (var j = 0; j < this.ents.length; j++) if (this.ents[j].id === g.reveals) this.ents[j].hidden = false;
      for (var k = 0; k < this.gizmos.length; k++) if (this.gizmos[k].id === g.reveals) this.gizmos[k].hidden = false;
    }
    if (g.removes) {
      for (var b = this.blocks.length - 1; b >= 0; b--) if (this.blocks[b].id === g.removes) this.blocks.splice(b, 1);
      for (var e = this.ents.length - 1; e >= 0; e--) if (this.ents[e].id === g.removes) this.ents.splice(e, 1);
    }
    if (g.script) this.runScript(g.script);
  };

  /* ---- origami field forms ------------------------------------------------------ */
  World.prototype.useFold = function () {
    var p = this.player;
    // slip through a crack
    for (var i = 0; i < this.gizmos.length; i++) {
      var g = this.gizmos[i];
      if (g.kind !== 'crack' && g.kind !== 'plate') continue;
      if (Math.abs(p.x - g.x) > 52 || Math.abs(p.z - (g.z === undefined ? .5 : g.z)) > .3) continue;
      if (g.kind === 'crack' && St.hasFlag('form_slip')) {
        A.sfx('fold');
        this.runScript([['fadeout', '#f7edd6', .12], ['func', function (w) {
          w.player.x = g.to ? g.to.x : p.x + 90;
          w.player.z = g.to && g.to.z !== undefined ? g.to.z : p.z;
          if (g.to && g.to.map) { w.load(g.to.map, g.to.spawn || 'default'); }
        }], ['fadein', .12]]);
        return;
      }
      if (g.kind === 'plate' && St.hasFlag('form_weight')) {
        A.sfx('mallet');
        this.shake = 10;
        g.used = true;
        if (g.flag) St.flag(g.flag, true);
        if (g.removes) for (var b = this.blocks.length - 1; b >= 0; b--) if (this.blocks[b].id === g.removes) this.blocks.splice(b, 1);
        if (g.reveals) for (var c = 0; c < this.blocks.length; c++) if (this.blocks[c].id === g.reveals) this.blocks[c].hidden = false;
        if (g.script) this.runScript(g.script);
        UI.toast('The plate sinks with a clunk.', null, '#cfd6de');
        return;
      }
    }
    if (St.hasFlag('form_plane')) { this.flashHint('Hold Z while falling to glide.'); A.sfx('rustle'); }
    else { A.sfx('error'); }
  };

  World.prototype.flashHint = function (txt) { this.hintMsg = { txt: txt, t: 0 }; };

  /* ---- hints & triggers ---------------------------------------------------------- */
  World.prototype.updateHint = function () {
    if (this.hintMsg) { this.hintMsg.t++; if (this.hintMsg.t > 90) this.hintMsg = null; }
    if (this.lightT > 0) { this.lightT--; if (this.lightT <= 0) this.lightRadius = 0; }
    this.hint = null;
    if (this.busy) return;
    var tgt = this.talkTarget();
    if (tgt) {
      var label = 'Z  Talk';
      if (tgt.type === 'gizmo') {
        var k = tgt.giz.kind;
        label = k === 'sign' ? 'Z  Read' : k === 'save' ? 'Z  Save' : k === 'shop' ? 'Z  Shop'
          : k === 'inn' ? 'Z  Rest' : k === 'cook' ? 'Z  Cook' : k === 'heartblock' ? 'Z  Restore'
            : k === 'switch' ? 'Z  Press' : 'Z  Use';
        if (tgt.giz.label) label = 'Z  ' + tgt.giz.label;
      } else if (tgt.type === 'pickup') label = 'Z  Open';
      else if (tgt.type === 'exit') label = 'Z  Enter';
      this.hint = { txt: label, x: tgt.ent ? tgt.ent.x : (tgt.giz ? tgt.giz.x : (tgt.pk ? tgt.pk.x : tgt.ex.x)), z: (tgt.ent || tgt.giz || tgt.pk || tgt.ex).z };
    } else {
      // partner ability prompt
      var S = St.get(), id = S.active;
      if (id) {
        var ab = PB.Partners.get(id).field;
        var p = this.player;
        for (var i = 0; i < this.gizmos.length; i++) {
          var g = this.gizmos[i];
          if (g.hidden || g.needs !== ab.id || (g.once && g.used)) continue;
          if (Math.abs(p.x - g.x) < 62 && Math.abs(p.z - (g.z === undefined ? .5 : g.z)) < .3) {
            this.hint = { txt: 'C  ' + ab.name, x: g.x, z: g.z };
            return;
          }
        }
        for (var j = 0; j < this.gizmos.length; j++) {
          var g2 = this.gizmos[j];
          if (g2.hidden || (g2.once && g2.used)) continue;
          if (g2.kind === 'crack' && St.hasFlag('form_slip') && Math.abs(p.x - g2.x) < 52) { this.hint = { txt: 'V  Slip through', x: g2.x, z: g2.z }; return; }
          if (g2.kind === 'plate' && St.hasFlag('form_weight') && Math.abs(p.x - g2.x) < 52) { this.hint = { txt: 'V  Press down', x: g2.x, z: g2.z }; return; }
        }
      }
    }
  };

  World.prototype.updateTriggers = function () {
    if (this.busy) return;
    var p = this.player;
    for (var i = 0; i < this.triggers.length; i++) {
      var tr = this.triggers[i];
      if (tr.fired && tr.once !== false) continue;
      if (tr.needsFlag && !St.hasFlag(tr.needsFlag)) continue;
      if (tr.notFlag && St.hasFlag(tr.notFlag)) continue;
      if (Math.abs(p.x - tr.x) < (tr.w || 60) / 2 && Math.abs(p.z - (tr.z === undefined ? .5 : tr.z)) < (tr.d || 1) / 2) {
        tr.fired = true;
        if (tr.flag) St.flag(tr.flag, true);
        this.runScript(tr.script);
        return;
      }
    }
    // walk-in exits
    for (var e = 0; e < (this.map.exits || []).length; e++) {
      var ex = this.map.exits[e];
      if (ex.door) continue;
      if (Math.abs(p.x - ex.x) < (ex.w || 40) / 2 && Math.abs(p.z - (ex.z === undefined ? .5 : ex.z)) < (ex.d || 1) / 2) {
        this.useExit(ex);
        return;
      }
    }
  };

  World.prototype.updateCamera = function () {
    if (this.camLock && this.camTarget !== null) {
      this.camX = U.lerp(this.camX, this.clampCam(this.camTarget - W / 2), this.camLerp);
    } else {
      var want = this.clampCam(this.player.x - W / 2 + (this.player.flipT > .5 ? -40 : 40));
      this.camX = U.lerp(this.camX, want, .09);
    }
  };

  /* ======================================================================
     Drawing
     ====================================================================== */
  World.prototype.draw = function (ctx) {
    if (this.battle) { this.battle.draw(ctx); return; }
    if (this.credits) { this.drawCredits(ctx); return; }

    ctx.save();
    if (this.shake > .4) ctx.translate(U.rndRange(-this.shake, this.shake), U.rndRange(-this.shake, this.shake) * .6);

    PB.Themes.draw(ctx, this.map.theme || 'town', this.camX, this.t, this.map);

    // build the draw list
    var list = [];
    var i;
    for (i = 0; i < this.blocks.length; i++) {
      var b = this.blocks[i];
      if (b.hidden) continue;
      list.push({ z: b.z, y: 0, kind: 'block', o: b });
    }
    for (i = 0; i < this.ents.length; i++) {
      if (this.ents[i].hidden) continue;
      list.push({ z: this.ents[i].z, y: this.ents[i].y, kind: 'ent', o: this.ents[i] });
    }
    for (i = 0; i < this.foes.length; i++) list.push({ z: this.foes[i].z, y: 0, kind: 'foe', o: this.foes[i] });
    for (i = 0; i < this.pickups.length; i++) if (!this.pickups[i].taken) list.push({ z: this.pickups[i].z, y: 0, kind: 'pick', o: this.pickups[i] });
    for (i = 0; i < this.gizmos.length; i++) if (!this.gizmos[i].hidden) list.push({ z: this.gizmos[i].z === undefined ? .5 : this.gizmos[i].z, y: 0, kind: 'giz', o: this.gizmos[i] });
    list.push({ z: this.partnerEnt.z, y: 0, kind: 'partner', o: this.partnerEnt });
    list.push({ z: this.player.z, y: 0, kind: 'player', o: this.player });
    for (i = 0; i < this.fx.length; i++) list.push({ z: this.fx[i].z, y: 0, kind: 'fx', o: this.fx[i] });

    list.sort(function (a, b2) { return a.z - b2.z; });

    for (i = 0; i < list.length; i++) this.drawItem(ctx, list[i]);

    // darkness
    if (this.map.dark) {
      var lr = this.lightRadius;
      ctx.save();
      ctx.globalCompositeOperation = 'source-over';
      var pp = proj(this.player.x, this.player.z, 0, this.camX);
      var g = ctx.createRadialGradient(pp.sx, pp.sy - 30, Math.max(20, lr * .3), pp.sx, pp.sy - 30, Math.max(70, lr));
      g.addColorStop(0, 'rgba(8,6,16,0)');
      g.addColorStop(.7, 'rgba(8,6,16,0.55)');
      g.addColorStop(1, 'rgba(8,6,16,0.94)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }

    ctx.restore();

    P.overlayTexture(ctx, W, H, .4);
    P.overlayVignette(ctx, W, H);

    // hint bubble
    if (this.hint) {
      var hp = proj(this.hint.x, this.hint.z === undefined ? .5 : this.hint.z, 0, this.camX);
      UI.prompt(ctx, this.hint.txt, hp.sx, hp.sy - 96);
    }
    if (this.hintMsg) {
      ctx.save(); ctx.globalAlpha = U.clamp(1 - this.hintMsg.t / 90, 0, 1);
      UI.prompt(ctx, this.hintMsg.txt, W / 2, H - 150);
      ctx.restore();
    }

    UI.drawHud(ctx, St.get(), { t: this.t });
    P.text(ctx, this.map.name || '', W - 18, H - 18, { size: 14, align: 'right', color: '#f7edd6' });
    UI.drawToasts(ctx);

    if (this.bigText) {
      var a = U.clamp(Math.min(this.bigText.t, this.bigText.life - this.bigText.t) / 20, 0, 1);
      ctx.save(); ctx.globalAlpha = a;
      UI.title(ctx, this.bigText.txt, H / 2, { t: this.t, color: this.bigText.color, size: 40 });
      ctx.restore();
    }

    this.dlg.draw(ctx);
    if (this.overlay) this.overlay.draw(ctx);
    if (this.chapterCard) this.drawChapterCard(ctx);
    this.fader.draw(ctx);
  };

  World.prototype.drawItem = function (ctx, item) {
    var o = item.o, pr;
    switch (item.kind) {
      case 'block': {
        pr = proj(o.x, o.z, 0, this.camX);
        if (pr.sx < -220 || pr.sx > W + 220) return;
        if (o.vine) {
          P.rr(ctx, pr.sx - 9, pr.sy - o.h, 18, o.h, 8, '#4f9a48', '#2f6a2c', 2.4);
          for (var v = 0; v < o.h / 26; v++) {
            P.ell(ctx, pr.sx + (v % 2 ? 13 : -13), pr.sy - 16 - v * 26, 12, 8, '#6fbb52', '#2f6a2c', 2, v % 2 ? .3 : -.3);
          }
          P.ell(ctx, pr.sx, pr.sy - o.h, 26, 8, '#6fbb52', '#2f6a2c', 2.4);
        } else if (o.sprite) {
          Spr.draw(ctx, o.sprite, pr.sx, pr.sy, { t: this.t, scale: pr.sc * (o.scale || 1), shadow: true });
        } else if (!o.wall) {
          var w2 = o.w, hh = o.h;
          P.rr(ctx, pr.sx - w2 / 2, pr.sy - hh, w2, hh, 5, '#c8a06a', '#8a5a30', 2.6);
          P.creaseLines(ctx, pr.sx - w2 / 2, pr.sy - hh, w2, hh, 3, .1);
          P.rr(ctx, pr.sx - w2 / 2 - 3, pr.sy - hh - 6, w2 + 6, 9, 3, '#d8b47a', '#8a5a30', 2.2);
        }
        break;
      }
      case 'ent': {
        pr = proj(o.x, o.z, o.y, this.camX);
        if (pr.sx < -240 || pr.sx > W + 240) return;
        Spr.draw(ctx, o.sprite, pr.sx, pr.sy, {
          t: o.t, anim: o.anim, flipT: o.flipT, scale: pr.sc * (o.scale || 1),
          blink: (o.t % 210 < 8) ? 1 : 0
        });
        if (o.kind === 'npc' && o.name && !this.busy) {
          var d = Math.abs(this.player.x - o.x);
          if (d < 120) {
            ctx.save(); ctx.globalAlpha = U.clamp((120 - d) / 60, 0, 1) * .9;
            P.text(ctx, o.name, pr.sx, pr.sy - Spr.height(o.sprite) * pr.sc - 12, { size: 13, align: 'center', color: '#fff8e0' });
            ctx.restore();
          }
        }
        break;
      }
      case 'foe': {
        pr = proj(o.x, o.z, o.y, this.camX);
        if (pr.sx < -200 || pr.sx > W + 200) return;
        var ed = PB.Enemies.get(o.type);
        Spr.draw(ctx, ed ? ed.sprite : 'crumple', pr.sx, pr.sy, {
          t: o.t, anim: o.stunned > 0 ? 'dizzy' : o.anim, flipT: o.flipT, scale: pr.sc * 1.02
        });
        if (o.boss) P.text(ctx, ed ? ed.name : '', pr.sx, pr.sy - 96, { size: 13, align: 'center', color: '#f0a0a0' });
        if (o.stunned > 0) {
          for (var s = 0; s < 3; s++) {
            var a2 = this.t * .08 + s * 2.1;
            P.star(ctx, pr.sx + Math.cos(a2) * 20, pr.sy - 70 + Math.sin(a2) * 7, 6, 2.6, 5, 0, '#ffe066', '#8a6a2a', 1.4);
          }
        }
        break;
      }
      case 'pick': {
        pr = proj(o.x, o.z, o.y || 0, this.camX);
        if (pr.sx < -80 || pr.sx > W + 80) return;
        if (o.kind === 'coin') Spr.draw(ctx, 'coin', pr.sx, pr.sy - (o.y || 0), { t: o.t, scale: pr.sc });
        else if (o.kind === 'shard') Spr.draw(ctx, 'sealshard', pr.sx, pr.sy, { t: o.t, scale: pr.sc });
        else if (o.kind === 'chest') Spr.draw(ctx, 'chest', pr.sx, pr.sy, { t: o.t, scale: pr.sc });
        else if (o.kind === 'blockq') Spr.draw(ctx, 'blockq', pr.sx, pr.sy - 46, { t: o.t, scale: pr.sc, shadow: false });
        break;
      }
      case 'giz': {
        pr = proj(o.x, o.z === undefined ? .5 : o.z, 0, this.camX);
        if (pr.sx < -100 || pr.sx > W + 100) return;
        var spr = GIZMO_SPRITE[o.kind];
        if (o.sprite) spr = o.sprite;
        if (spr) Spr.draw(ctx, spr, pr.sx, pr.sy, { t: o.t, scale: pr.sc * (o.scale || 1) });
        if (o.needs && !(o.once && o.used)) {
          ctx.save(); ctx.globalAlpha = .35 + Math.sin(this.t * .07) * .18;
          P.ell(ctx, pr.sx, pr.sy - 18, 26, 12, '#ffe066', null);
          ctx.restore();
        }
        break;
      }
      case 'partner': {
        var S = St.get();
        if (!S.active) return;
        pr = proj(o.x, o.z, o.y, this.camX);
        Spr.draw(ctx, PB.Partners.get(S.active).sprite, pr.sx, pr.sy, {
          t: o.t, anim: o.anim, flipT: o.flipT, scale: pr.sc,
          blink: (o.t % 230 < 8) ? 1 : 0
        });
        break;
      }
      case 'player': {
        pr = proj(o.x, o.z, o.y, this.camX);
        var an = o.anim;
        if (this.swing > 12) an = 'attack';
        Spr.draw(ctx, 'pip', pr.sx, pr.sy, {
          t: o.t, anim: an, flipT: o.flipT, scale: pr.sc,
          blink: (o.t % 200 < 8) ? 1 : 0,
          squashX: o.gliding ? 1.18 : 1, squashY: o.gliding ? .86 : 1
        });
        if (o.gliding) {
          ctx.save(); ctx.globalAlpha = .5;
          P.poly(ctx, [[pr.sx - 30, pr.sy - 40], [pr.sx + 30, pr.sy - 46], [pr.sx + 10, pr.sy - 26]], '#f7edd6', '#8a6a3a', 2);
          ctx.restore();
        }
        if (this.swing > 0 && this.swing > 8) {
          var dir = o.flipT > .5 ? -1 : 1;
          ctx.save(); ctx.globalAlpha = U.clamp(this.swing / 22, 0, 1);
          ctx.translate(pr.sx + dir * 30, pr.sy - 34);
          ctx.rotate(dir * (1.2 - this.swing * .06));
          P.rr(ctx, -4, -4, 8, 26, 3, '#a9713f', '#6f4a28', 2);
          P.rr(ctx, -14, -18, 28, 16, 4, '#d9dde3', '#8a939e', 2.4);
          ctx.restore();
        }
        break;
      }
      case 'fx': {
        pr = proj(o.x, o.z, o.y || 0, this.camX);
        var al = 1 - o.t / o.life;
        ctx.save(); ctx.globalAlpha = U.clamp(al, 0, 1);
        if (o.k === 'ring') {
          var rr2 = 50 * (o.t / o.life);
          P.ell(ctx, pr.sx, pr.sy - 24, rr2, rr2 * .4, null, o.c, 3);
        } else {
          P.rr(ctx, pr.sx - o.r / 2, pr.sy - (o.y || 0) - o.r / 2, o.r, o.r * .7, 1, o.c, null, 0);
        }
        ctx.restore();
        break;
      }
    }
  };

  var GIZMO_SPRITE = {
    sign: 'sign', save: 'savepoint', heartblock: 'heartblock', block: 'brickblock',
    switch: 'switch_plate', spring: 'spring', soil: 'soil', crack: 'crack', seam: 'seam',
    glyph: 'glyph', shop: 'shop_stall', inn: 'house_small', cook: 'barrel',
    generator: 'gear', plate: 'switch_plate', brazier: 'brazier', dockside: 'barrel'
  };

  World.prototype.drawChapterCard = function (ctx) {
    var c = this.chapterCard;
    var a = U.clamp(Math.min(c.t, 190 - c.t) / 26, 0, 1);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = 'rgba(15,10,24,.86)'; ctx.fillRect(0, 0, W, H);
    var slide = U.Ease.outCubic(U.clamp(c.t / 30, 0, 1));
    ctx.translate((1 - slide) * -60, 0);
    P.rr(ctx, 120, 190, 720, 160, 14, '#f7edd6', '#8a6a3a', 4);
    P.text(ctx, c.n === 0 ? 'PROLOGUE' : 'CHAPTER ' + c.n, W / 2, 244, { size: 20, align: 'center', color: '#8a6a3a', outline: false, shadow: false });
    P.text(ctx, c.title, W / 2, 290, { size: 34, align: 'center', color: '#2a1c3c', outline: false, shadow: false });
    if (c.sub) P.text(ctx, c.sub, W / 2, 324, { size: 16, align: 'center', color: '#6b5a3a', outline: false, shadow: false });
    ctx.restore();
  };

  /* ---- credits ------------------------------------------------------------------ */
  World.prototype.startCredits = function (lines) { this.credits = { lines: lines, y: H + 40, t: 0 }; A.play('credits'); };
  World.prototype.updateCredits = function () {
    this.credits.t++;
    this.credits.y -= .55;
    if (In.down('a')) this.credits.y -= 2.2;
    if (this.credits.y < -this.credits.lines.length * 34 - 100) this.game.toTitle();
  };
  World.prototype.drawCredits = function (ctx) {
    ctx.fillStyle = '#0f0a18'; ctx.fillRect(0, 0, W, H);
    for (var i = 0; i < this.credits.lines.length; i++) {
      var l = this.credits.lines[i];
      var y = this.credits.y + i * 34;
      if (y < -40 || y > H + 40) continue;
      var big = l.charAt(0) === '#';
      P.text(ctx, big ? l.slice(1) : l, W / 2, y, {
        size: big ? 24 : 17, align: 'center',
        color: big ? '#ffe066' : '#f7edd6'
      });
    }
    P.overlayTexture(ctx, W, H, .3);
  };

  return {
    World: World, proj: proj, HORIZON: HORIZON, DEPTH: DEPTH,
    create: function (game) { return new World(game); }
  };
})();
