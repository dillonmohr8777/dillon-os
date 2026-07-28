/* ==========================================================================
   PAPERBOUND — 30_game.js
   Boot, the fixed-timestep loop, canvas scaling, the title screen, file
   select, new-game flow, game over and credits.
   ========================================================================== */
'use strict';

PB.Game = (function () {
  var U = PB.U, P = PB.Paper, In = PB.Input, A = PB.Audio, Spr = PB.Sprites;
  var UI = PB.UI, St = PB.State;

  var W = 960, H = 540;
  var canvas, ctx, dpr = 1;
  var scene = 'boot';
  var t = 0;
  var world = null;
  var titleMenu = null, fileMenu = null, diffMenu = null;
  var fader = new UI.Fader();
  var confetti = [];
  var lastSlot = 1;
  var errBanner = null;

  /* ---- setup ------------------------------------------------------------- */
  function init(cv) {
    canvas = cv;
    ctx = canvas.getContext('2d', { alpha: false });
    resize();
    window.addEventListener('resize', resize);
    In.bind(canvas);
    P.buildTexture(W, H);

    var cfg = St.loadConfig();
    if (cfg) { if (cfg.music !== undefined) A.setMusicVol(cfg.music); if (cfg.sfx !== undefined) A.setSfxVol(cfg.sfx); }

    // the browser needs a gesture before audio may start
    var kick = function () { A.resume(); window.removeEventListener('pointerdown', kick); window.removeEventListener('keydown', kick); };
    window.addEventListener('pointerdown', kick);
    window.addEventListener('keydown', kick);

    for (var i = 0; i < 60; i++) confetti.push(newConfetti(true));
    toTitle();
    requestAnimationFrame(frame);
  }

  function resize() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    var availW = window.innerWidth, availH = window.innerHeight;
    var scale = Math.min(availW / W, availH / H);
    canvas.style.width = Math.floor(W * scale) + 'px';
    canvas.style.height = Math.floor(H * scale) + 'px';
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    ctx = canvas.getContext('2d', { alpha: false });
    ctx.imageSmoothingEnabled = true;
  }

  /* ---- fixed timestep ---------------------------------------------------- */
  var STEP = 1000 / 60;
  var acc = 0, last = 0;
  function frame(now) {
    if (!last) last = now;
    var dt = Math.min(120, now - last);
    last = now;
    acc += dt;
    var guard = 0;
    while (acc >= STEP && guard < 4) { update(); acc -= STEP; guard++; }
    if (guard >= 4) acc = 0;
    render();
    requestAnimationFrame(frame);
  }

  function update() {
    t++;
    In.update();
    A.tick();
    fader.update();
    try {
      if (scene === 'title') updateTitle();
      else if (scene === 'files') updateFiles();
      else if (scene === 'newgame') updateNew();
      else if (scene === 'world' && world) world.update();
      else if (scene === 'gameover') updateGameOver();
    } catch (e) {
      if (window.console) console.error(e);
      errBanner = { msg: (e && e.message) || 'unknown error', t: 0 };
    }
    In.postUpdate();
    for (var i = 0; i < confetti.length; i++) stepConfetti(confetti[i]);
    if (errBanner) { errBanner.t++; if (errBanner.t > 300) errBanner = null; }
  }

  function render() {
    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.fillStyle = '#0f0a18';
    ctx.fillRect(0, 0, W, H);
    try {
      if (scene === 'title' || scene === 'files' || scene === 'newgame') drawTitle();
      else if (scene === 'world' && world) world.draw(ctx);
      else if (scene === 'gameover') drawGameOver();
    } catch (e) {
      if (window.console) console.error(e);
      P.text(ctx, 'render error — see console', W / 2, H / 2, { size: 18, align: 'center', color: '#f0a0a0' });
    }
    fader.draw(ctx);
    if (errBanner) {
      ctx.save(); ctx.globalAlpha = U.clamp(1 - errBanner.t / 300, 0, 1);
      P.rr(ctx, 10, H - 34, W - 20, 26, 6, 'rgba(120,20,30,.85)', '#e0483c', 2);
      P.text(ctx, 'error: ' + errBanner.msg, 20, H - 15, { size: 13, color: '#ffd8d8', outline: false, shadow: false });
      ctx.restore();
    }
    ctx.restore();
  }

  /* ======================================================================
     Title screen
     ====================================================================== */
  function newConfetti(spread) {
    return {
      x: U.rndRange(-40, W + 40), y: spread ? U.rndRange(-40, H) : -30,
      vy: U.rndRange(.5, 1.8), vx: U.rndRange(-.5, .5),
      r: U.rndRange(4, 11), rot: U.rndRange(0, 6.3), vr: U.rndRange(-.05, .05),
      c: U.pick(['#e0483c', '#f5c02e', '#57b8ea', '#8fcf52', '#f07a8a', '#c8a2e8', '#fdf6e3'])
    };
  }
  function stepConfetti(c) {
    c.y += c.vy; c.x += c.vx + Math.sin(c.y * .02) * .5; c.rot += c.vr;
    if (c.y > H + 40) { var n = newConfetti(false); for (var k in n) c[k] = n[k]; }
  }

  function toTitle() {
    scene = 'title';
    A.play('title');
    var items = [];
    var anySave = St.peek(1) || St.peek(2) || St.peek(3);
    if (anySave) items.push({ k: 'continue', label: 'Continue' });
    items.push({ k: 'new', label: 'New Game' });
    items.push({ k: 'howto', label: 'How to Play' });
    titleMenu = new UI.Menu({
      items: items, x: W / 2 - 140, y: 336, w: 280, rows: 4, rowH: 40,
      fill: '#fdf6e3', edge: '#8a6a3a',
      drawRow: function (c, it, x, y, w, h, sel) {
        P.text(c, it.label, x + w / 2 - 8, y + h / 2 + 7, { size: 20, align: 'center', color: '#2a1c3c', outline: false, shadow: false });
      },
      onPick: function (it) {
        if (it.k === 'continue') { scene = 'files'; buildFileMenu('load'); }
        else if (it.k === 'new') { scene = 'newgame'; buildDiffMenu(); }
        else showHowTo();
      },
      onCancel: function () { }
    });
    howto = null;
  }

  var howto = null;
  function showHowTo() {
    howto = {
      page: 0, pages: [
        {
          title: 'Getting About',
          lines: [
            'Arrow keys or WASD — walk. Up and down move you deeper',
            'into the scene, not just up and down the screen.',
            '',
            'Z — jump, talk, read, confirm.',
            'X — swing the mallet, and cancel in menus.',
            'C — your partner\'s field ability.',
            'V — fold (slip through cracks, press weight plates).',
            'Q / E — run.   Esc — satchel.   Tab — map.'
          ]
        },
        {
          title: 'Fighting',
          lines: [
            'Every attack has an action command. Land it and you do',
            'full damage; nail it PERFECTLY and you do more.',
            '',
            'After a perfect hit, tap X in the flash window for a',
            'STYLISH finish — it fills the ENCORE gauge and wins',
            'over the crowd.',
            '',
            'On defence: press Z just before a hit to GUARD.',
            'Press X even later to SUPERGUARD and take nothing.'
          ]
        },
        {
          title: 'Getting Stronger',
          lines: [
            'Seal Points level you up. Each level you pick one of',
            'HP +5, FP +5, or BP +3.',
            '',
            'Badges cost BP and change how you fight. Origami Forms',
            'cost FP and reshape Pip for a few turns.',
            '',
            'Foil Shards rank up your partners. Seal Powers come',
            'from the seven seals you are chasing.'
          ]
        }
      ]
    };
  }

  function buildDiffMenu() {
    diffMenu = new UI.Menu({
      title: 'How hard would you like this?',
      items: [
        { k: 'relaxed', label: 'Relaxed', sub: 'You take much less damage. For the story.' },
        { k: 'normal', label: 'Normal', sub: 'The intended fight. Start here.' },
        { k: 'folded', label: 'Folded', sub: 'Foes hit half again as hard, and pay better.' }
      ],
      x: W / 2 - 210, y: 250, w: 420, rows: 3, rowH: 46,
      drawRow: function (c, it, x, y, w, h, sel) {
        P.text(c, it.label, x + 8, y + 20, { size: 18, color: '#2a1c3c', outline: false, shadow: false });
        P.text(c, it.sub, x + 8, y + 38, { size: 13, color: '#7a6a4a', outline: false, shadow: false });
      },
      onPick: function (it) { startNew(it.k); },
      onCancel: function () { toTitle(); }
    });
  }

  function buildFileMenu(mode) {
    function rows() {
      var r = [];
      for (var i = 1; i <= 3; i++) r.push({ slot: i, info: St.peek(i) });
      r.push({ back: true });
      return r;
    }
    fileMenu = new UI.Menu({
      title: mode === 'load' ? 'Load which file?' : 'Save to which file?',
      items: rows(), x: W / 2 - 240, y: 190, w: 480, rows: 4, rowH: 54,
      fill: '#fdf6e3', edge: '#8a6a3a',
      enabled: function (it) { return it.back || !!it.info; },
      drawRow: function (c, it, x, y, w, h, sel) {
        if (it.back) { P.text(c, 'Back', x + 10, y + h / 2 + 6, { size: 17, color: '#c8443c', outline: false, shadow: false }); return; }
        P.text(c, 'File ' + it.slot, x + 10, y + 22, { size: 17, color: it.info ? '#2a1c3c' : '#a89a78', outline: false, shadow: false });
        if (it.info) {
          P.text(c, it.info.name + '   Lv ' + it.info.level + '   ' + it.info.seals + '/7 seals   ' + St.DIFF[it.info.difficulty].label,
            x + 100, y + 22, { size: 14, color: '#6b5a3a', outline: false, shadow: false });
          var mp = PB.Maps.get(it.info.map);
          P.text(c, U.timeStr(it.info.frames) + '   ' + it.info.coins + ' coins   ' + (mp ? mp.name : ''),
            x + 100, y + 42, { size: 12, color: '#8a7a5a', outline: false, shadow: false });
        } else P.text(c, '— empty —', x + 100, y + 30, { size: 14, color: '#a89a78', outline: false, shadow: false });
      },
      onPick: function (it) {
        if (it.back) { toTitle(); return; }
        if (!it.info) { A.sfx('error'); return; }
        lastSlot = it.slot;
        loadSlot(it.slot);
      },
      onCancel: function () { toTitle(); }
    });
  }

  function updateTitle() {
    if (howto) {
      if (In.pressed('a') || In.pressed('right')) { howto.page++; A.sfx('ok'); if (howto.page >= howto.pages.length) howto = null; }
      else if (In.pressed('b')) { howto = null; A.sfx('cancel'); }
      else if (In.pressed('left') && howto.page > 0) { howto.page--; A.sfx('cursor'); }
      return;
    }
    titleMenu.update();
  }
  function updateFiles() { fileMenu.update(); }
  function updateNew() { diffMenu.update(); }

  function drawTitle() {
    // paper backdrop
    var g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#4a3560'); g.addColorStop(.55, '#8a5fc0'); g.addColorStop(1, '#f0a63c');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    // layered torn hills
    for (var l = 0; l < 3; l++) {
      P.tornEdge(ctx, -20, W + 20, 300 + l * 46, 18 - l * 4, 26, l * 2.7 + t * .002,
        ['#3f2f52', '#2f2440', '#241a34'][l], true, H + 10);
    }
    // confetti
    for (var i = 0; i < confetti.length; i++) {
      var c = confetti[i];
      ctx.save(); ctx.globalAlpha = .85;
      ctx.translate(c.x, c.y); ctx.rotate(c.rot);
      P.rr(ctx, -c.r / 2, -c.r / 3, c.r, c.r * .66, 1.5, c.c, null, 0);
      ctx.restore();
    }

    // hero + first partner posing
    Spr.draw(ctx, 'pip', 216, 372, { t: t, anim: 'idle', scale: 2.1 });
    Spr.draw(ctx, 'twigby', 742, 372, { t: t + 40, anim: 'idle', scale: 2.0, flip: -1 });

    // logo
    ctx.save();
    ctx.translate(W / 2, 132);
    ctx.rotate(Math.sin(t * .012) * .012);
    P.rr(ctx, -318, -58, 636, 108, 16, '#fdf6e3', '#2a1c3c', 5);
    P.rr(ctx, -306, -48, 612, 88, 12, null, '#c8a06a', 2);
    P.textWave(ctx, 'PAPERBOUND', 0, 18, {
      size: 62, align: 'center', color: '#e0483c', outlineColor: '#2a1c3c', ow: 9,
      amp: 4, freq: .42, phase: t * .04
    });
    ctx.restore();
    P.text(ctx, 'The Seven Seals of Foldheim', W / 2, 210, { size: 19, align: 'center', color: '#fff3d0' });

    if (howto) {
      var pg = howto.pages[howto.page];
      ctx.save(); ctx.fillStyle = 'rgba(15,10,24,.72)'; ctx.fillRect(0, 0, W, H); ctx.restore();
      P.panel(ctx, 120, 70, W - 240, H - 150, { fill: '#fdf6e3', edge: '#8a6a3a', radius: 16 });
      P.text(ctx, pg.title, W / 2, 118, { size: 28, align: 'center', color: '#2a1c3c', outline: false, shadow: false });
      P.line(ctx, [[170, 132], [W - 170, 132]], '#c8a06a', 2);
      for (var k = 0; k < pg.lines.length; k++) {
        P.text(ctx, pg.lines[k], 176, 172 + k * 26, { size: 16, color: '#3a2a44', outline: false, shadow: false });
      }
      P.text(ctx, (howto.page + 1) + ' / ' + howto.pages.length + '     Z next     X close',
        W / 2, H - 106, { size: 14, align: 'center', color: '#8a7a5a', outline: false, shadow: false });
    } else if (scene === 'title') {
      titleMenu.draw(ctx);
      P.text(ctx, 'Z select   •   arrow keys move', W / 2, H - 22, { size: 13, align: 'center', color: '#fff3d0' });
    } else if (scene === 'files') fileMenu.draw(ctx);
    else if (scene === 'newgame') diffMenu.draw(ctx);

    P.overlayTexture(ctx, W, H, .45);
    P.overlayVignette(ctx, W, H);
  }

  /* ======================================================================
     Start / load
     ====================================================================== */
  function startNew(difficulty) {
    fader.out(function () {
      St.start('Pip', difficulty);
      world = PB.World.create(API);
      world.load('quill_square', 'default');
      scene = 'world';
      fader.in(null, .06);
    }, .07, '#0f0a18');
  }

  function loadSlot(slot) {
    fader.out(function () {
      if (!St.load(slot)) { toTitle(); fader.in(null, .06); return; }
      var S = St.get();
      world = PB.World.create(API);
      world.load(PB.Maps.has(S.map) ? S.map : 'quill_square', S.spawn || 'default');
      scene = 'world';
      fader.in(null, .06);
    }, .07, '#0f0a18');
  }

  /* ======================================================================
     Game over
     ====================================================================== */
  var goMenu = null;
  function gameOver() {
    scene = 'gameover';
    A.stop();
    A.play('sad');
    var items = [];
    if (St.peek(lastSlot) || St.peek(1) || St.peek(2) || St.peek(3)) items.push({ k: 'load', label: 'Load a file' });
    items.push({ k: 'title', label: 'Back to the title' });
    goMenu = new UI.Menu({
      items: items, x: W / 2 - 160, y: 320, w: 320, rows: 3, rowH: 40,
      onPick: function (it) {
        if (it.k === 'load') { scene = 'files'; A.play('title'); buildFileMenu('load'); }
        else toTitle();
      },
      onCancel: function () { }
    });
  }
  function updateGameOver() { goMenu.update(); }
  function drawGameOver() {
    ctx.fillStyle = '#160f22'; ctx.fillRect(0, 0, W, H);
    for (var i = 0; i < 40; i++) {
      var x = U.wrap(i * 137 + t * .2, W + 40) - 20;
      var y = U.wrap(i * 79 - t * .3, H + 40) - 20;
      ctx.globalAlpha = .18;
      P.rr(ctx, x, y, 9, 6, 1.5, '#3a2a4a', null, 0);
      ctx.globalAlpha = 1;
    }
    Spr.draw(ctx, 'pip', W / 2, 300, { t: t, anim: 'defeat', scale: 2.2, shadow: false });
    UI.title(ctx, 'CRUMPLED', 176, { t: t, color: '#e0483c', size: 52 });
    P.text(ctx, 'Paper tears. Paper also mends.', W / 2, 224, { size: 16, align: 'center', color: '#c8bcd8' });
    goMenu.draw(ctx);
    P.overlayVignette(ctx, W, H);
  }

  /* ======================================================================
     Credits
     ====================================================================== */
  var CREDITS = [
    '#PAPERBOUND',
    'The Seven Seals of Foldheim',
    '', '',
    '#CAST',
    'Pip — courier, first class',
    'Twigby — Creasewood scout',
    'Lumen — the kept flame',
    'Bloop — the folded boat',
    'Snip — the understudy',
    'Margo — the marginalia',
    'Volt — the spare part',
    '', '',
    '#ANTAGONISTS',
    'Bramblejack, the Thorn Marionette',
    'Duchess Pyra Sizzlefold',
    'Nautilus Grim',
    'The Great Kerf',
    'The Redactor',
    'Crinkle, the Glacier Wyrm',
    'Chief Engineer Ampere',
    'Captain Sable of the Blotguard',
    'Duke Smudge',
    'The Blank',
    '', '',
    '#EVERYTHING YOU SAW AND HEARD',
    'was drawn with lines and filled with flat colour',
    'at sixty frames a second.',
    'No image files. No audio files.',
    'Every sprite is a shape. Every note is a wave.',
    '', '',
    '#WITH THANKS',
    'to every paper RPG that got there first,',
    'and to anyone who ever pressed the button',
    'at exactly the right moment.',
    '', '', '',
    'Thank you for playing.',
    '', '',
    'Press Z to return to the title.'
  ];
  function rollCredits() {
    if (world) world.startCredits(CREDITS);
  }

  /* ======================================================================
     API handed to the world scene
     ====================================================================== */
  var API = {
    gameOver: gameOver,
    toTitle: function () {
      fader.out(function () { world = null; toTitle(); fader.in(null, .06); }, .07);
    },
    rollCredits: rollCredits,
    get scene() { return scene; },
    get world() { return world; }
  };

  /* Exposed for the smoke test in tools/smoke.js */
  function _debug() {
    return {
      scene: scene, t: t, world: world, state: St.get(),
      maps: Object.keys(PB.Maps.all()).length,
      startNew: startNew,
      warp: function (mapId, spawn) { if (world) world.load(mapId, spawn || 'default'); },
      battle: function (ids, boss) {
        if (!world) return;
        world.startBattle({ enemies: ids, boss: !!boss, bg: 'stage' }, function () { });
      }
    };
  }

  return { init: init, toTitle: toTitle, gameOver: gameOver, rollCredits: rollCredits, _debug: _debug, API: API, W: W, H: H };
})();

/* Boot as soon as the canvas exists. When the bundle is injected into an
   already-loaded document the 'load' event has been and gone, so check first. */
(function () {
  function boot() {
    var cv = document.getElementById('game');
    if (cv) PB.Game.init(cv);
  }
  if (document.readyState === 'complete' || document.readyState === 'interactive') setTimeout(boot, 0);
  else window.addEventListener('DOMContentLoaded', boot);
})();
