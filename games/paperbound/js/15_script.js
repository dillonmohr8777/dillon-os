/* ==========================================================================
   PAPERBOUND — 15_script.js
   The cutscene / interaction interpreter.

   A script is an array of command arrays, e.g.
       [ ['say','twigby','Look at THAT.'],
         ['flag','saw_gate',true],
         ['battle',{enemies:['snapleaf','snapleaf']}] ]

   Scripts run as generators stepped by the world scene, so they can block on
   dialogue, battles, movement and fades without any callback nesting.
   ========================================================================== */
'use strict';

PB.Script = (function () {
  var U = PB.U, St = PB.State, A = PB.Audio, UI = PB.UI;

  /* Speaker shorthand -> {name, portrait}. Anything not listed is treated as
     a literal display name with no portrait. */
  var SPEAKERS = {
    pip: { name: 'Pip', portrait: 'pip' },
    twigby: { name: 'Twigby', portrait: 'twigby' },
    lumen: { name: 'Lumen', portrait: 'lumen' },
    bloop: { name: 'Bloop', portrait: 'bloop' },
    snip: { name: 'Snip', portrait: 'snip' },
    margo: { name: 'Margo', portrait: 'margo' },
    volt: { name: 'Volt', portrait: 'volt' },
    narr: { name: '', portrait: null, style: 'narr' },
    sys: { name: '', portrait: null, style: 'sys' }
  };
  function speaker(key) {
    if (!key) return { name: '', portrait: null };
    if (SPEAKERS[key]) return SPEAKERS[key];
    if (PB.Sprites.has(key)) {
      var nm = key.replace(/_/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); });
      return { name: nm, portrait: key };
    }
    return { name: key, portrait: null };
  }
  function defineSpeaker(key, name, portrait, style) { SPEAKERS[key] = { name: name, portrait: portrait, style: style }; }

  /* ======================================================================
     run(world, script) -> generator
     `world` supplies the hooks the commands need.
     ====================================================================== */
  function* run(world, script, ctxVars) {
    if (!script || !script.length) return;
    var vars = ctxVars || {};
    for (var i = 0; i < script.length; i++) {
      var c = script[i];
      if (!c) continue;
      if (typeof c === 'function') { c(world, vars); continue; }
      var op = c[0];
      var r = yield* exec(world, op, c, vars);
      if (r === 'stop') return;
    }
  }

  function* exec(world, op, c, vars) {
    var S = St.get();
    switch (op) {

      /* ---- dialogue ---- */
      case 'say': {
        var sp = speaker(c[1]);
        var opts = U.extend({ speaker: sp.name, portrait: sp.portrait, style: sp.style || 'normal' }, c[3] || {});
        world.dlg.say(c[2], opts);
        yield { until: function () { return !world.dlg.isBusy(); } };
        break;
      }
      case 'sayx': {  // explicit: ['sayx', name, portrait, text, style]
        world.dlg.say(c[3], { speaker: c[1], portrait: c[2], style: c[4] || 'normal' });
        yield { until: function () { return !world.dlg.isBusy(); } };
        break;
      }
      case 'ask': {
        var sp2 = speaker(c[1]);
        var choice = -1;
        world.dlg.ask(c[2], c[3], function (i) { choice = i; },
          { speaker: sp2.name, portrait: sp2.portrait, style: sp2.style || 'normal' });
        yield { until: function () { return choice >= 0 && !world.dlg.isBusy(); } };
        var branch = c[4] && c[4][choice];
        vars.choice = choice;
        if (branch) { var r = yield* run(world, branch, vars); if (r === 'stop') return 'stop'; }
        break;
      }

      /* ---- flow ---- */
      case 'wait': yield (c[1] || 30); break;
      case 'stop': return 'stop';
      case 'func': if (c[1]) c[1](world, vars); break;
      case 'ifflag': {
        if (St.hasFlag(c[1])) { if (c[2]) { var r2 = yield* run(world, c[2], vars); if (r2 === 'stop') return 'stop'; } }
        else if (c[3]) { var r3 = yield* run(world, c[3], vars); if (r3 === 'stop') return 'stop'; }
        break;
      }
      case 'ifnotflag': {
        if (!St.hasFlag(c[1])) { var r4 = yield* run(world, c[2], vars); if (r4 === 'stop') return 'stop'; }
        else if (c[3]) { var r5 = yield* run(world, c[3], vars); if (r5 === 'stop') return 'stop'; }
        break;
      }
      case 'ifitem': {
        var have = St.hasKey(c[1]) || St.hasItem(c[1]);
        if (have) { if (c[2]) { var r6 = yield* run(world, c[2], vars); if (r6 === 'stop') return 'stop'; } }
        else if (c[3]) { var r7 = yield* run(world, c[3], vars); if (r7 === 'stop') return 'stop'; }
        break;
      }
      case 'ifpartner': {
        if (St.hasPartner(c[1])) { if (c[2]) { var r8 = yield* run(world, c[2], vars); if (r8 === 'stop') return 'stop'; } }
        else if (c[3]) { var r9 = yield* run(world, c[3], vars); if (r9 === 'stop') return 'stop'; }
        break;
      }
      case 'ifquest': {
        if (St.questState(c[1]) === c[2]) { if (c[3]) { var ra = yield* run(world, c[3], vars); if (ra === 'stop') return 'stop'; } }
        else if (c[4]) { var rb = yield* run(world, c[4], vars); if (rb === 'stop') return 'stop'; }
        break;
      }
      case 'sub': { var rc = yield* run(world, c[1], vars); if (rc === 'stop') return 'stop'; break; }

      /* ---- state ---- */
      case 'flag': St.flag(c[1], c[2] === undefined ? true : c[2]); break;
      case 'chapterset': S.chapter = c[1]; break;
      case 'quest':
        if (c[2] === 'start') St.questStart(c[1]);
        else if (c[2] === 'done') { St.questDone(c[1]); UI.toast('Quest complete: ' + (c[3] || c[1]), null, '#8fcf52'); A.fanfare('item'); }
        else St.questProgress(c[1], c[2]);
        break;

      /* ---- rewards ---- */
      case 'give': {
        var d = PB.Items.get(c[1]);
        if (d) {
          var ok = St.addItem(c[1]);
          A.fanfare('item');
          if (ok === 'store') UI.toast(d.name + ' → storage', c[1], '#e8dcc0');
          else if (ok) UI.toast('Got ' + d.name + '!', c[1], '#fdf6e3');
          else UI.toast('Bag full! ' + d.name + ' left behind.', c[1], '#f0a0a0');
        }
        break;
      }
      case 'givekey': {
        var kd = PB.Items.get(c[1]);
        if (kd) { St.addKey(c[1]); A.fanfare('item'); UI.toast('Got ' + kd.name + '!', c[1], '#ffe9a8'); }
        break;
      }
      case 'takekey': St.removeKey(c[1]); break;
      case 'coins': { var got = St.addCoins(c[1]); A.sfx('coin'); UI.toast('+' + got + ' coins', 'seal1', '#ffe9a8'); break; }
      case 'badge': {
        if (St.giveBadge(c[1])) { A.fanfare('item'); UI.toast('Badge: ' + PB.Badges.get(c[1]).name, null, '#f5c02e'); }
        break;
      }
      case 'shard': {
        S.shards += (c[1] || 1);
        A.fanfare('item');
        UI.toast('Foil Shard ×' + (c[1] || 1), null, '#c8d2dc');
        break;
      }
      case 'rankup': {
        if (St.rankUp(c[1])) {
          A.fanfare('levelup');
          var pn = PB.Partners.get(c[1]).name;
          UI.toast(pn + ' ranked up!', null, '#8fd0f0');
        }
        break;
      }
      case 'form': if (St.unlockForm(c[1])) { A.fanfare('seal'); UI.toast('New Form: ' + PB.Moves.get(c[1]).name, null, '#8fd0f0'); } break;
      case 'seal': if (St.unlockSeal(c[1])) { A.fanfare('seal'); UI.toast('Seal Power: ' + PB.Moves.get(c[1]).name, null, '#ffe066'); } break;
      case 'recipe': St.learnRecipe(c[1]); break;
      case 'upgrade':
        if (c[1] === 'stomp') { S.stompRank = Math.min(3, S.stompRank + 1); UI.toast('Stomp upgraded!', null, '#e0483c'); }
        else { S.malletRank = Math.min(3, S.malletRank + 1); UI.toast('Mallet upgraded!', null, '#a9713f'); }
        A.fanfare('levelup');
        break;
      case 'heal': St.fullHeal(); A.sfx('heal'); UI.toast('Fully restored', null, '#8fcf52'); break;
      case 'toast': UI.toast(c[1], c[2] || null, c[3] || '#fdf6e3'); break;

      /* ---- party ---- */
      case 'partner': {
        var pd = PB.Partners.get(c[1]);
        if (pd && St.givePartner(c[1])) {
          St.setActive(c[1]);
          A.fanfare('levelup');
          UI.toast(pd.name + ' joined!', null, '#8fd0f0');
        }
        break;
      }
      case 'setactive': St.setActive(c[1]); break;

      /* ---- world ---- */
      case 'entity': world.setEntity(c[1], c[2]); break;
      case 'move': {
        var done = false;
        world.moveEntity(c[1], c[2], c[3], c[4] || 2, function () { done = true; });
        yield { until: function () { return done; } };
        break;
      }
      case 'movenowait': world.moveEntity(c[1], c[2], c[3], c[4] || 2, null); break;
      case 'face': world.faceEntity(c[1], c[2]); break;
      case 'anim': world.animEntity(c[1], c[2]); break;
      case 'spawn': world.spawnEntity(c[1]); break;
      case 'despawn': world.despawnEntity(c[1]); break;
      case 'hop': { var hd = false; world.hopEntity(c[1], c[2] || 1, function () { hd = true; }); yield { until: function () { return hd; } }; break; }
      case 'camera': { world.cameraTo(c[1], c[2] || 60); yield (c[3] === undefined ? (c[2] || 60) : c[3]); break; }
      case 'camerafree': world.cameraFollow(); break;
      case 'shake': world.shake = c[1] || 10; break;

      /* ---- presentation ---- */
      case 'music': A.play(c[1]); break;
      case 'stopmusic': A.stop(); break;
      case 'sfx': A.sfx(c[1]); break;
      case 'fanfare': A.fanfare(c[1]); break;
      case 'fadeout': {
        var f1 = false;
        world.fader.out(function () { f1 = true; }, c[2] || .06, c[1] || '#0f0a18', c[3]);
        yield { until: function () { return f1; } };
        break;
      }
      case 'fadein': {
        var f2 = false;
        world.fader.in(function () { f2 = true; }, c[1] || .06);
        yield { until: function () { return f2; } };
        break;
      }
      case 'chapter': {
        world.chapterCard = { n: c[1], title: c[2], sub: c[3] || '', t: 0 };
        S.chapter = c[1];
        A.fanfare('seal');
        yield { until: function () { return world.chapterCard === null; } };
        break;
      }
      case 'title': {
        world.bigText = { txt: c[1], t: 0, life: c[2] || 120, color: c[3] || '#fff8e0' };
        yield (c[2] || 120);
        break;
      }

      /* ---- transitions ---- */
      case 'goto': {
        var g = false;
        world.travel(c[1], c[2] || 'default', function () { g = true; });
        yield { until: function () { return g; } };
        break;
      }
      case 'setspawn': S.map = c[1]; S.spawn = c[2] || 'default'; break;

      /* ---- battle ---- */
      case 'battle': {
        var res = null;
        world.startBattle(c[1] || {}, function (r) { res = r; });
        yield { until: function () { return res !== null; } };
        vars.battle = res;
        if (res.result === 'lose') return 'stop';
        if (c[2] && res.result === 'win') { var rw = yield* run(world, c[2], vars); if (rw === 'stop') return 'stop'; }
        break;
      }

      /* ---- shops & services ---- */
      case 'shop': {
        var sd = false;
        world.openShop(c[1], function () { sd = true; });
        yield { until: function () { return sd; } };
        break;
      }
      case 'inn': {
        var idone = false;
        world.openInn(c[1] || 5, function () { idone = true; });
        yield { until: function () { return idone; } };
        break;
      }
      case 'cook': {
        var cd = false;
        world.openCook(function () { cd = true; });
        yield { until: function () { return cd; } };
        break;
      }
      case 'save': {
        var svd = false;
        world.openSave(function () { svd = true; });
        yield { until: function () { return svd; } };
        break;
      }
      case 'credits': world.rollCredits(); yield { until: function () { return false; } }; break;

      default:
        if (window.console) console.warn('unknown script op', op);
    }
    return null;
  }

  return { run: run, speaker: speaker, defineSpeaker: defineSpeaker, SPEAKERS: SPEAKERS };
})();
