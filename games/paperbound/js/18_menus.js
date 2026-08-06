/* ==========================================================================
   PAPERBOUND — 18_menus.js
   Overlay panels: pause book, shops, inn, cooking, save slots, world map.
   Every overlay exposes { update(), draw(ctx), closed, onClose }.
   ========================================================================== */
'use strict';

PB.Menus = (function () {
  var U = PB.U, P = PB.Paper, In = PB.Input, A = PB.Audio, Spr = PB.Sprites;
  var UI = PB.UI, St = PB.State, It = PB.Items, Bd = PB.Badges;
  var W = 960, H = 540;

  function Overlay(onClose) { this.closed = false; this.onClose = onClose || null; this.t = 0; }
  Overlay.prototype.close = function () { this.closed = true; };
  Overlay.prototype.dim = function (ctx, a) {
    ctx.save(); ctx.fillStyle = 'rgba(15,10,24,' + (a === undefined ? .58 : a) + ')'; ctx.fillRect(0, 0, W, H); ctx.restore();
  };

  /* ======================================================================
     PAUSE — the courier's satchel
     ====================================================================== */
  var TABS = ['Items', 'Badges', 'Party', 'Journal', 'Options'];

  function pause(world) {
    var o = new Overlay(null);
    var S = St.get();
    o.tab = 0; o.sub = null; o.msg = '';
    o.menu = null;
    o.build = function () {
      var t = TABS[o.tab];
      if (t === 'Items') o.menu = itemsMenu(o);
      else if (t === 'Badges') o.menu = badgesMenu(o);
      else if (t === 'Party') o.menu = partyMenu(o);
      else if (t === 'Journal') o.menu = journalMenu(o);
      else o.menu = optionsMenu(o, world);
    };
    o.build();

    o.update = function () {
      o.t++;
      if (o.sub) {
        o.sub.update();
        if (o.sub.closed) { o.sub = null; o.build(); }
        return;
      }
      if (In.pressed('l')) { o.tab = U.wrap(o.tab - 1, TABS.length); A.sfx('cursor'); o.build(); return; }
      if (In.pressed('r')) { o.tab = U.wrap(o.tab + 1, TABS.length); A.sfx('cursor'); o.build(); return; }
      if (In.pressed('start')) { A.sfx('cancel'); o.close(); return; }
      if (o.menu) o.menu.update();
    };
    o.draw = function (ctx) {
      o.dim(ctx);
      P.panel(ctx, 60, 44, W - 120, H - 108, { fill: '#f7edd6', edge: '#8a6a3a', radius: 16 });
      // tabs
      for (var i = 0; i < TABS.length; i++) {
        var tx = 88 + i * 160, sel = i === o.tab;
        P.rr(ctx, tx, sel ? 56 : 62, 148, sel ? 40 : 32, 8, sel ? '#fdf6e3' : '#e0d3b4', '#8a6a3a', 2.4);
        P.text(ctx, TABS[i], tx + 74, sel ? 82 : 84, { size: 16, align: 'center', color: sel ? '#2a1c3c' : '#7a6a4a', outline: false, shadow: false });
      }
      P.line(ctx, [[80, 96], [W - 80, 96]], '#8a6a3a', 3);
      // stat strip
      var S2 = St.get();
      P.text(ctx, S2.name + '   Lv ' + S2.level, 92, 124, { size: 17, color: '#2a1c3c', outline: false, shadow: false });
      P.text(ctx, 'HP ' + S2.hp + '/' + St.maxHp() + '    FP ' + S2.fp + '/' + St.maxFp() +
        '    BP ' + St.bpFree() + '/' + St.maxBp() + '    Coins ' + S2.coins + '    Shards ' + S2.shards,
        W - 92, 124, { size: 15, align: 'right', color: '#6b5a3a', outline: false, shadow: false });
      P.text(ctx, 'Q / E switch tabs   •   Esc close   •   ' + U.timeStr(S2.frames), W / 2, H - 74,
        { size: 13, align: 'center', color: '#8a7a5a', outline: false, shadow: false });
      if (o.menu) o.menu.draw(ctx);
      if (o.msg) P.text(ctx, o.msg, W / 2, H - 96, { size: 15, align: 'center', color: '#c8443c', outline: false, shadow: false });
      if (o.sub) o.sub.draw(ctx);
    };
    return o;
  }

  function itemsMenu(o) {
    var S = St.get();
    var rows = S.items.map(function (id, i) { return { id: id, i: i, kind: 'bag' }; });
    var keys = S.keyItems.map(function (id) { return { id: id, kind: 'key' }; });
    var store = S.store.map(function (id, i) { return { id: id, i: i, kind: 'store' }; });
    var all = rows.concat(store.length ? [{ header: 'Storage' }] : []).concat(store)
      .concat(keys.length ? [{ header: 'Key Items' }] : []).concat(keys);
    return new UI.Menu({
      title: 'Bag  (' + S.items.length + '/' + St.ITEM_CAP + ')',
      items: all, x: 92, y: 142, w: 420, rows: 9, rowH: 30,
      enabled: function (it) { return !it.header; },
      drawRow: function (ctx, it, x, y, w, h, sel) {
        if (it.header) { P.text(ctx, '— ' + it.header + ' —', x + 4, y + h / 2 + 5, { size: 13, color: '#8a7a5a', outline: false, shadow: false }); return; }
        var d = It.get(it.id);
        It.drawIcon(ctx, it.id, x + 12, y + h / 2, 24);
        P.text(ctx, d.name, x + 30, y + h / 2 + 6, { size: 15, color: it.kind === 'store' ? '#7a6a4a' : '#2a1c3c', outline: false, shadow: false });
        if (it.kind === 'bag' && d.type !== 'key') P.text(ctx, 'use', x + w - 6, y + h / 2 + 6, { size: 12, align: 'right', color: '#8a6a3a', outline: false, shadow: false });
      },
      desc: function (it) { return it && !it.header ? It.get(it.id).desc : null; },
      onPick: function (it) {
        if (it.header) return;
        var d = It.get(it.id);
        if (it.kind === 'key') { o.msg = d.name + ': ' + d.desc; return; }
        if (it.kind === 'store') {
          if (S.items.length >= St.ITEM_CAP) { o.msg = 'Your bag is full.'; A.sfx('error'); return; }
          S.store.splice(it.i, 1); S.items.push(it.id); A.sfx('ok'); o.build(); return;
        }
        if (d.type === 'battle') { o.msg = 'That one only works in a fight.'; A.sfx('error'); return; }
        var fx = d.fx || {};
        var used = false;
        if (fx.hp || fx.fp) { St.heal(fx.hp || 0, fx.fp || 0); if (fx.hp && S.active) S.partners[S.active].hp = Math.min(St.partnerMaxHp(S.active), S.partners[S.active].hp + fx.hp); used = true; }
        if (fx.sp) { St.addSe(fx.sp); used = true; }
        if (fx.repel) { used = true; }
        if (fx.cureAll || fx.cure) used = true;
        if (!used) { o.msg = 'Nothing happens right now.'; A.sfx('error'); return; }
        S.items.splice(it.i, 1);
        A.sfx('heal'); o.msg = 'Used ' + d.name + '.';
        o.build();
      },
      onCancel: function () { o.close(); }
    });
  }

  function badgesMenu(o) {
    var S = St.get();
    var list = S.badges.owned.slice().sort(function (a, b) {
      var ea = St.isEquipped(a) ? 0 : 1, eb = St.isEquipped(b) ? 0 : 1;
      return ea - eb || Bd.get(a).bp - Bd.get(b).bp;
    });
    return new UI.Menu({
      title: 'Badges   BP ' + St.bpUsed() + '/' + St.maxBp(),
      items: list, x: 92, y: 142, w: 440, rows: 9, rowH: 30,
      drawRow: function (ctx, id, x, y, w, h, sel) {
        var b = Bd.get(id), eq = St.isEquipped(id);
        P.star(ctx, x + 12, y + h / 2, 9, 4, 5, 0, b.color, '#5a4a30', 1.6);
        P.text(ctx, b.name, x + 28, y + h / 2 + 6, { size: 15, color: eq ? '#2a1c3c' : '#7a6a4a', outline: false, shadow: false });
        P.text(ctx, b.bp + ' BP', x + w - 46, y + h / 2 + 6, { size: 13, align: 'right', color: '#8a6a3a', outline: false, shadow: false });
        if (eq) P.text(ctx, 'ON', x + w - 4, y + h / 2 + 6, { size: 12, align: 'right', color: '#4fae62', outline: false, shadow: false });
      },
      desc: function (id) { return id ? Bd.get(id).desc : null; },
      onPick: function (id) {
        if (St.isEquipped(id)) { St.unequipBadge(id); A.sfx('cancel'); o.msg = ''; }
        else if (!St.equipBadge(id)) { A.sfx('error'); o.msg = 'Not enough BP for that one.'; }
        else { A.sfx('ok'); o.msg = ''; }
        o.build();
      },
      onCancel: function () { o.close(); }
    });
  }

  function partyMenu(o) {
    var S = St.get();
    var list = St.partnerList();
    return new UI.Menu({
      title: 'Party   (Foil Shards: ' + S.shards + ')',
      items: list, x: 92, y: 142, w: 440, rows: 7, rowH: 40,
      drawRow: function (ctx, id, x, y, w, h, sel) {
        var pd = PB.Partners.get(id), ps = S.partners[id];
        ctx.save();
        ctx.beginPath(); ctx.arc(x + 18, y + h / 2, 15, 0, Math.PI * 2); ctx.clip();
        P.ell(ctx, x + 18, y + h / 2, 15, 15, '#e8dcc0', null, 0);
        Spr.portrait(ctx, pd.sprite, x + 18, y + h / 2 + 16, 36, { t: o.t });
        ctx.restore();
        P.text(ctx, pd.name + (S.active === id ? '  ★' : ''), x + 42, y + 18, { size: 15, color: '#2a1c3c', outline: false, shadow: false });
        P.text(ctx, 'Rank ' + ps.rank + '   HP ' + ps.hp + '/' + St.partnerMaxHp(id), x + 42, y + 34, { size: 12, color: '#7a6a4a', outline: false, shadow: false });
        if (ps.rank < 3) P.text(ctx, (ps.rank === 1 ? 2 : 4) + ' shards', x + w - 4, y + 26, { size: 12, align: 'right', color: S.shards >= (ps.rank === 1 ? 2 : 4) ? '#4fae62' : '#a89a78', outline: false, shadow: false });
        else P.text(ctx, 'MAX', x + w - 4, y + 26, { size: 12, align: 'right', color: '#c8963c', outline: false, shadow: false });
      },
      desc: function (id) {
        if (!id) return null;
        var pd = PB.Partners.get(id);
        return pd.bio + '  Field: ' + pd.field.name + ' — ' + pd.field.desc;
      },
      onPick: function (id) {
        var ps = S.partners[id];
        if (S.active !== id) { St.setActive(id); A.sfx('swap'); o.msg = pd(id).name + ' takes point.'; o.build(); return; }
        var need = ps.rank === 1 ? 2 : 4;
        if (ps.rank >= 3) { o.msg = 'Already at maximum rank.'; A.sfx('error'); return; }
        if (S.shards < need) { o.msg = 'Needs ' + need + ' Foil Shards.'; A.sfx('error'); return; }
        S.shards -= need; St.rankUp(id);
        A.fanfare('levelup'); o.msg = pd(id).name + ' is now Rank ' + ps.rank + '!';
        o.build();
      },
      onCancel: function () { o.close(); }
    });
    function pd(id) { return PB.Partners.get(id); }
  }

  function journalMenu(o) {
    var S = St.get();
    var rows = [];
    rows.push({ header: 'Quests' });
    var qk = Object.keys(S.quests);
    if (!qk.length) rows.push({ text: 'Nothing on the books yet.' });
    for (var i = 0; i < qk.length; i++) {
      var q = PB.Quests ? PB.Quests.get(qk[i]) : null;
      rows.push({ text: (S.quests[qk[i]].state === 'done' ? '✔ ' : '• ') + (q ? q.name : qk[i]), sub: q ? q.desc : '', done: S.quests[qk[i]].state === 'done' });
    }
    rows.push({ header: 'Records' });
    rows.push({ text: 'Battles won: ' + S.stats.wins });
    rows.push({ text: 'Stylish finishes: ' + S.stats.stylish });
    rows.push({ text: 'Superguards: ' + S.stats.superguards });
    rows.push({ text: 'Damage dealt: ' + S.stats.damage });
    rows.push({ text: 'Damage taken: ' + S.stats.taken });
    rows.push({ text: 'Foes catalogued: ' + Object.keys(S.tattled).length + '/' + PB.Enemies.list().length });
    rows.push({ text: 'Seals recovered: ' + S.seals.length + '/7' });
    rows.push({ text: 'Coliseum rank: ' + S.coliseumRank + '/20' });
    rows.push({ text: 'Difficulty: ' + St.diff().label });
    return new UI.Menu({
      title: 'Journal', items: rows, x: 92, y: 142, w: 620, rows: 9, rowH: 30,
      enabled: function (it) { return false; },
      drawRow: function (ctx, it, x, y, w, h) {
        if (it.header) { P.text(ctx, '— ' + it.header + ' —', x + 4, y + h / 2 + 5, { size: 13, color: '#8a7a5a', outline: false, shadow: false }); return; }
        P.text(ctx, it.text, x + 8, y + h / 2 + 6, { size: 15, color: it.done ? '#4fae62' : '#2a1c3c', outline: false, shadow: false });
      },
      desc: function (it) { return it && it.sub ? it.sub : null; },
      onCancel: function () { o.close(); }
    });
  }

  function optionsMenu(o, world) {
    var cfg = St.loadConfig() || {};
    function rows() {
      return [
        { k: 'music', label: 'Music volume', val: Math.round(A.getMusicVol() * 100) + '%' },
        { k: 'sfx', label: 'Sound volume', val: Math.round(A.getSfxVol() * 100) + '%' },
        { k: 'diff', label: 'Difficulty', val: St.diff().label },
        { k: 'save', label: 'Save game', val: '' },
        { k: 'title', label: 'Quit to title', val: '' }
      ];
    }
    var m = new UI.Menu({
      title: 'Options', items: rows(), x: 92, y: 142, w: 440, rows: 6, rowH: 34,
      drawRow: function (ctx, it, x, y, w, h) {
        P.text(ctx, it.label, x + 8, y + h / 2 + 6, { size: 15, color: '#2a1c3c', outline: false, shadow: false });
        P.text(ctx, it.val, x + w - 6, y + h / 2 + 6, { size: 15, align: 'right', color: '#8a6a3a', outline: false, shadow: false });
      },
      desc: function (it) {
        if (!it) return null;
        if (it.k === 'music' || it.k === 'sfx') return 'Left and right adjust the volume.';
        if (it.k === 'diff') return 'Relaxed softens incoming damage. Folded hits harder and pays more Seal Points.';
        return null;
      },
      onPick: function (it) {
        if (it.k === 'save') { o.sub = save(world, null); }
        else if (it.k === 'title') { world.game.toTitle(); o.close(); }
      },
      onCancel: function () { o.close(); }
    });
    var baseUpdate = m.update.bind(m);
    m.update = function () {
      var it = this.items[this.idx];
      if (it && (it.k === 'music' || it.k === 'sfx')) {
        var d = (In.pressed('right') ? .1 : 0) - (In.pressed('left') ? .1 : 0);
        if (d) {
          if (it.k === 'music') A.setMusicVol(A.getMusicVol() + d); else A.setSfxVol(A.getSfxVol() + d);
          A.sfx('cursor');
          St.saveConfig({ music: A.getMusicVol(), sfx: A.getSfxVol() });
          this.setItems(rows()); this.idx = this.idx;
          return;
        }
      }
      if (it && it.k === 'diff') {
        var order = ['relaxed', 'normal', 'folded'];
        var cur = order.indexOf(St.get().difficulty);
        if (In.pressed('right')) { St.get().difficulty = order[U.wrap(cur + 1, 3)]; A.sfx('cursor'); this.setItems(rows()); return; }
        if (In.pressed('left')) { St.get().difficulty = order[U.wrap(cur - 1, 3)]; A.sfx('cursor'); this.setItems(rows()); return; }
      }
      baseUpdate();
    };
    return m;
  }

  /* ======================================================================
     SHOPS
     ====================================================================== */
  var SHOPS = {};
  function defineShop(id, o) { SHOPS[id] = o; return o; }

  function shop(world, shopId, onClose) {
    var o = new Overlay(onClose);
    var S = St.get();
    var sd = SHOPS[shopId] || { name: 'Shop', stock: ['pulpberry', 'honeyleaf'], keeper: 'shopkeep_ream' };
    o.mode = 'root'; o.msg = sd.greeting || 'Take a look around!';
    function priceOf(id) { return Math.max(1, Math.round((It.get(id).price || 5) * (sd.markup || 1))); }

    function buildRoot() {
      return new UI.Menu({
        title: sd.name, items: [{ k: 'buy', label: 'Buy' }, { k: 'sell', label: 'Sell' }, { k: 'leave', label: 'Leave' }],
        x: 90, y: 300, w: 190, rows: 3, rowH: 32,
        onPick: function (it) {
          if (it.k === 'leave') { o.close(); return; }
          o.mode = it.k; o.menu = it.k === 'buy' ? buildBuy() : buildSell();
        },
        onCancel: function () { o.close(); }
      });
    }
    function buildBuy() {
      return new UI.Menu({
        title: 'Buy   (' + S.coins + ' coins)', items: sd.stock.slice(),
        x: 300, y: 210, w: 380, rows: 7, rowH: 32,
        enabled: function (id) { return S.coins >= priceOf(id); },
        drawRow: function (ctx, id, x, y, w, h, sel, ok) {
          It.drawIcon(ctx, id, x + 12, y + h / 2, 24);
          P.text(ctx, It.get(id).name, x + 30, y + h / 2 + 6, { size: 15, color: ok ? '#2a1c3c' : 'rgba(42,28,60,.4)', outline: false, shadow: false });
          P.text(ctx, priceOf(id) + 'c', x + w - 6, y + h / 2 + 6, { size: 14, align: 'right', color: ok ? '#8a6a3a' : 'rgba(42,28,60,.4)', outline: false, shadow: false });
        },
        desc: function (id) { return id ? It.get(id).desc : null; },
        onPick: function (id) {
          var pr = priceOf(id);
          if (S.coins < pr) { A.sfx('error'); o.msg = 'You cannot afford that.'; return; }
          var r = St.addItem(id);
          if (!r) { A.sfx('error'); o.msg = 'You have nowhere to put it.'; return; }
          S.coins -= pr; A.sfx('coin');
          o.msg = r === 'store' ? 'Sent to storage.' : 'Thank you kindly!';
          o.menu = buildBuy();
        },
        onCancel: function () { o.mode = 'root'; o.menu = buildRoot(); }
      });
    }
    function buildSell() {
      var list = S.items.map(function (id, i) { return { id: id, i: i }; });
      return new UI.Menu({
        title: 'Sell   (' + S.coins + ' coins)', items: list,
        x: 300, y: 210, w: 380, rows: 7, rowH: 32,
        drawRow: function (ctx, it, x, y, w, h) {
          It.drawIcon(ctx, it.id, x + 12, y + h / 2, 24);
          P.text(ctx, It.get(it.id).name, x + 30, y + h / 2 + 6, { size: 15, color: '#2a1c3c', outline: false, shadow: false });
          P.text(ctx, (It.get(it.id).sell || 1) + 'c', x + w - 6, y + h / 2 + 6, { size: 14, align: 'right', color: '#8a6a3a', outline: false, shadow: false });
        },
        onPick: function (it) {
          S.items.splice(it.i, 1);
          S.coins = Math.min(9999, S.coins + (It.get(it.id).sell || 1));
          A.sfx('coin'); o.msg = 'Much obliged.';
          o.menu = buildSell();
        },
        onCancel: function () { o.mode = 'root'; o.menu = buildRoot(); }
      });
    }
    o.menu = buildRoot();
    o.update = function () { o.t++; o.menu.update(); };
    o.draw = function (ctx) {
      o.dim(ctx, .5);
      P.panel(ctx, 60, 90, W - 120, H - 180, { fill: '#f7edd6', edge: '#8a6a3a', radius: 16 });
      Spr.draw(ctx, sd.keeper || 'shopkeep_ream', 168, 300, { t: o.t, scale: 1.5, anim: 'idle' });
      P.bubble(ctx, 232, 130, 380, 72, 200, 200, {});
      var lines = P.wrap(ctx, o.msg, 350, 15);
      for (var i = 0; i < lines.length && i < 3; i++) P.text(ctx, lines[i], 250, 158 + i * 20, { size: 15, color: '#2a1c3c', outline: false, shadow: false });
      P.text(ctx, 'Coins: ' + St.get().coins, W - 100, 128, { size: 17, align: 'right', color: '#c8963c', outline: false, shadow: false });
      o.menu.draw(ctx);
    };
    return o;
  }

  /* ======================================================================
     INN / COOK / SAVE / MAP
     ====================================================================== */
  function inn(world, price, onClose) {
    var o = new Overlay(onClose);
    var S = St.get();
    o.menu = new UI.Menu({
      title: 'Rest for ' + price + ' coins?', items: [{ k: 'y', label: 'Yes, please' }, { k: 'n', label: 'Not now' }],
      x: W / 2 - 150, y: 240, w: 300, rows: 2, rowH: 34,
      onPick: function (it) {
        if (it.k === 'n') { o.close(); return; }
        if (S.coins < price) { A.sfx('error'); o.msg = 'You are short on coins.'; return; }
        S.coins -= price; St.fullHeal(); A.fanfare('item');
        UI.toast('Fully rested', null, '#8fcf52');
        o.close();
      },
      onCancel: function () { o.close(); }
    });
    o.update = function () { o.t++; o.menu.update(); };
    o.draw = function (ctx) {
      o.dim(ctx);
      UI.title(ctx, 'INN', 180, { t: o.t, size: 34 });
      o.menu.draw(ctx);
      if (o.msg) P.text(ctx, o.msg, W / 2, 340, { size: 15, align: 'center', color: '#f0a0a0' });
    };
    return o;
  }

  function cook(world, onClose) {
    var o = new Overlay(onClose);
    var S = St.get();
    o.picked = [];
    o.msg = 'Pick one or two things and I will see what I can do.';
    function build() {
      var list = S.items.map(function (id, i) { return { id: id, i: i }; });
      list.push({ done: true, id: null, label: o.picked.length ? 'Cook it!' : 'Never mind' });
      return new UI.Menu({
        title: 'Cooking   (' + o.picked.length + '/2 chosen)', items: list,
        x: W / 2 - 200, y: 170, w: 400, rows: 8, rowH: 30,
        drawRow: function (ctx, it, x, y, w, h) {
          if (it.done) { P.text(ctx, it.label, x + 8, y + h / 2 + 6, { size: 15, color: '#c8443c', outline: false, shadow: false }); return; }
          It.drawIcon(ctx, it.id, x + 12, y + h / 2, 24);
          var chosen = o.picked.indexOf(it.i) >= 0;
          P.text(ctx, It.get(it.id).name, x + 30, y + h / 2 + 6, { size: 15, color: chosen ? '#4fae62' : '#2a1c3c', outline: false, shadow: false });
          if (chosen) P.text(ctx, 'in the pot', x + w - 6, y + h / 2 + 6, { size: 12, align: 'right', color: '#4fae62', outline: false, shadow: false });
        },
        onPick: function (it) {
          if (it.done) {
            if (!o.picked.length) { o.close(); return; }
            doCook();
            return;
          }
          var at = o.picked.indexOf(it.i);
          if (at >= 0) o.picked.splice(at, 1);
          else if (o.picked.length < 2) o.picked.push(it.i);
          else { A.sfx('error'); return; }
          o.menu = build();
        },
        onCancel: function () { o.close(); }
      });
    }
    function doCook() {
      var ids = o.picked.map(function (i) { return S.items[i]; });
      var result = ids.length === 2 ? It.cook(ids[0], ids[1]) : singleCook(ids[0]);
      // remove chosen, highest index first
      o.picked.slice().sort(function (a, b) { return b - a; }).forEach(function (i) { S.items.splice(i, 1); });
      St.addItem(result);
      St.learnRecipe(result);
      A.fanfare('item');
      o.msg = 'Behold — ' + It.get(result).name + '!';
      UI.toast('Cooked ' + It.get(result).name, result, '#f5c02e');
      o.picked = [];
      o.menu = build();
    }
    function singleCook(id) {
      var single = {
        pulpberry: 'reamcake', honeyleaf: 'inktea', reamcake: 'creambun', inktea: 'deeproot',
        foldroll: 'foldcake', creambun: 'grandfeast', mysterywad: 'grandfeast',
        wadbomb: 'bigwadbomb', emberpod: 'emberstew', frostnut: 'glacierjelly'
      };
      return single[id] || 'burntoffering';
    }
    o.menu = build();
    o.update = function () { o.t++; o.menu.update(); };
    o.draw = function (ctx) {
      o.dim(ctx);
      P.panel(ctx, 60, 90, W - 120, H - 180, { fill: '#f7edd6', edge: '#8a6a3a', radius: 16 });
      Spr.draw(ctx, 'chef_pulp', 130, 300, { t: o.t, scale: 1.4 });
      P.text(ctx, o.msg, W / 2 + 30, 130, { size: 15, align: 'center', color: '#2a1c3c', outline: false, shadow: false });
      o.menu.draw(ctx);
      P.text(ctx, 'Recipes discovered: ' + St.get().recipes.length + '/' + It.RECIPES.length, W / 2, H - 110,
        { size: 13, align: 'center', color: '#8a7a5a', outline: false, shadow: false });
    };
    return o;
  }

  function save(world, onClose) {
    var o = new Overlay(onClose);
    function rows() {
      var r = [];
      for (var i = 1; i <= 3; i++) r.push({ slot: i, info: St.peek(i) });
      r.push({ cancel: true });
      return r;
    }
    o.menu = new UI.Menu({
      title: 'Save to which slot?', items: rows(),
      x: W / 2 - 230, y: 170, w: 460, rows: 4, rowH: 52,
      drawRow: function (ctx, it, x, y, w, h) {
        if (it.cancel) { P.text(ctx, 'Cancel', x + 10, y + h / 2 + 6, { size: 16, color: '#c8443c', outline: false, shadow: false }); return; }
        P.text(ctx, 'Slot ' + it.slot, x + 10, y + 22, { size: 16, color: '#2a1c3c', outline: false, shadow: false });
        if (it.info) {
          P.text(ctx, it.info.name + '  Lv ' + it.info.level + '  Ch ' + it.info.chapter + '  ' + it.info.seals + '/7 seals',
            x + 92, y + 22, { size: 14, color: '#6b5a3a', outline: false, shadow: false });
          P.text(ctx, U.timeStr(it.info.frames) + '   ' + it.info.coins + ' coins   ' + (PB.Maps.get(it.info.map) ? PB.Maps.get(it.info.map).name : ''),
            x + 92, y + 40, { size: 12, color: '#8a7a5a', outline: false, shadow: false });
        } else P.text(ctx, '— empty —', x + 92, y + 30, { size: 14, color: '#a89a78', outline: false, shadow: false });
      },
      onPick: function (it) {
        if (it.cancel) { o.close(); return; }
        if (St.save(it.slot)) { A.fanfare('item'); UI.toast('Saved to slot ' + it.slot, null, '#8fcf52'); }
        else UI.toast('Could not save (storage blocked)', null, '#f0a0a0');
        o.close();
      },
      onCancel: function () { o.close(); }
    });
    o.update = function () { o.t++; o.menu.update(); };
    o.draw = function (ctx) {
      o.dim(ctx);
      UI.title(ctx, 'SAVE', 130, { t: o.t, size: 34 });
      o.menu.draw(ctx);
    };
    return o;
  }

  /* World map — the Foldheim overview. */
  var REGIONS = [
    { id: 0, name: 'Quillton', x: .12, y: .62, chapter: 0 },
    { id: 1, name: 'Creasewood', x: .26, y: .48, chapter: 1 },
    { id: 2, name: 'Emberfold', x: .38, y: .70, chapter: 2 },
    { id: 3, name: 'Sogport', x: .49, y: .38, chapter: 3 },
    { id: 4, name: 'Cardstock Carnival', x: .60, y: .66, chapter: 4 },
    { id: 5, name: 'Glyphhaven', x: .70, y: .34, chapter: 5 },
    { id: 6, name: 'Frostfold', x: .80, y: .60, chapter: 6 },
    { id: 7, name: 'Foilworks', x: .88, y: .32, chapter: 7 },
    { id: 8, name: 'Smudge Citadel', x: .94, y: .70, chapter: 8 }
  ];
  function worldmap(world, onClose) {
    var o = new Overlay(onClose);
    var S = St.get();
    o.update = function () {
      o.t++;
      if (In.pressed('select') || In.pressed('b') || In.pressed('start') || In.pressed('a')) { A.sfx('cancel'); o.close(); }
    };
    o.draw = function (ctx) {
      o.dim(ctx, .7);
      P.panel(ctx, 70, 60, W - 140, H - 130, { fill: '#f4e8cc', edge: '#8a6a3a', radius: 14 });
      P.text(ctx, 'FOLDHEIM', W / 2, 106, { size: 26, align: 'center', color: '#8a6a3a', outline: false, shadow: false });
      var mx = 110, my = 130, mw = W - 220, mh = H - 250;
      // route
      ctx.save();
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      for (var i = 0; i < REGIONS.length; i++) {
        var r = REGIONS[i];
        var x = mx + r.x * mw, y = my + r.y * mh;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = '#a9713f'; ctx.lineWidth = 2.5; ctx.stroke();
      ctx.restore();
      for (var j = 0; j < REGIONS.length; j++) {
        var rg = REGIONS[j];
        var rx = mx + rg.x * mw, ry = my + rg.y * mh;
        var open = S.chapter >= rg.chapter;
        var cur = S.chapter === rg.chapter;
        P.ell(ctx, rx, ry, cur ? 13 : 10, cur ? 13 : 10, open ? (cur ? '#e0483c' : '#8fcf52') : '#b0a48c', '#5a4a30', 2.4);
        if (cur) { ctx.save(); ctx.globalAlpha = .4 + Math.sin(o.t * .1) * .3; P.ell(ctx, rx, ry, 20, 20, null, '#e0483c', 3); ctx.restore(); }
        P.text(ctx, open ? rg.name : '???', rx, ry - 20, { size: 13, align: 'center', color: open ? '#2a1c3c' : '#8a7a5a', outline: false, shadow: false });
      }
      P.text(ctx, 'Seals recovered: ' + S.seals.length + '/7        ' + (PB.Maps.get(S.map) ? PB.Maps.get(S.map).name : ''),
        W / 2, H - 90, { size: 15, align: 'center', color: '#6b5a3a', outline: false, shadow: false });
      P.text(ctx, 'Tab to close', W / 2, H - 66, { size: 13, align: 'center', color: '#8a7a5a', outline: false, shadow: false });
    };
    return o;
  }

  /* Level-choice style yes/no used by scripts occasionally. */
  function confirm(world, text, onYes, onClose) {
    var o = new Overlay(onClose);
    o.menu = new UI.Menu({
      title: text, items: [{ k: 'y', label: 'Yes' }, { k: 'n', label: 'No' }],
      x: W / 2 - 140, y: 250, w: 280, rows: 2, rowH: 32,
      onPick: function (it) { if (it.k === 'y' && onYes) onYes(); o.close(); },
      onCancel: function () { o.close(); }
    });
    o.update = function () { o.t++; o.menu.update(); };
    o.draw = function (ctx) { o.dim(ctx); o.menu.draw(ctx); };
    return o;
  }

  return {
    pause: pause, shop: shop, inn: inn, cook: cook, save: save, worldmap: worldmap, confirm: confirm,
    defineShop: defineShop, SHOPS: SHOPS, REGIONS: REGIONS
  };
})();
