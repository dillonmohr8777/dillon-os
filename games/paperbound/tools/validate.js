#!/usr/bin/env node
/* ==========================================================================
   PAPERBOUND — tools/validate.js
   Loads every game script in a minimal DOM shim and checks the content data:
   unknown sprite / enemy / item / badge / theme / music ids, broken exits,
   missing spawns, unreachable maps, and malformed script commands.

   Usage:  node tools/validate.js            (from games/paperbound)
   Exit code 1 if any ERROR is found; warnings do not fail the build.
   ========================================================================== */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const JS = path.join(ROOT, 'js');

/* ---- minimal browser shim ------------------------------------------------ */
function fakeCtx() {
  const noop = () => { };
  const c = new Proxy({}, {
    get(t, k) {
      if (k === 'measureText') return () => ({ width: 8 });
      if (k === 'createLinearGradient' || k === 'createRadialGradient' || k === 'createPattern')
        return () => ({ addColorStop: noop });
      if (k === 'getImageData' || k === 'createImageData')
        return () => ({ data: new Uint8ClampedArray(4 * 128 * 128) });
      if (k === 'canvas') return { width: 960, height: 540 };
      return noop;
    },
    set() { return true; }
  });
  return c;
}
const doc = {
  createElement: () => ({ width: 0, height: 0, getContext: fakeCtx, style: {}, addEventListener: () => { } }),
  getElementById: () => null,
  querySelectorAll: () => [],
  addEventListener: () => { }
};
const win = {
  addEventListener: () => { }, removeEventListener: () => { },
  AudioContext: null, webkitAudioContext: null,
  requestAnimationFrame: () => 0, console: console,
  devicePixelRatio: 1, innerWidth: 960, innerHeight: 540
};
const sandbox = {
  window: win, document: doc, navigator: {}, console,
  localStorage: undefined, Math, Date, JSON, parseInt, parseFloat, isNaN,
  Uint8ClampedArray, Object, Array, String, Number, Boolean, Error, RegExp
};
sandbox.globalThis = sandbox;
sandbox.self = sandbox;
vm.createContext(sandbox);

/* ---- load every js file in order ----------------------------------------- */
const files = fs.readdirSync(JS).filter(f => /^\d+_.*\.js$/.test(f)).sort();
const loaded = [];
for (const f of files) {
  const src = fs.readFileSync(path.join(JS, f), 'utf8');
  try {
    vm.runInContext(src, sandbox, { filename: f });
    loaded.push(f);
  } catch (e) {
    console.error(`\x1b[31mLOAD ERROR\x1b[0m ${f}: ${e.message}`);
    if (e.stack) console.error(e.stack.split('\n').slice(0, 4).join('\n'));
    process.exit(1);
  }
}

const PB = sandbox.window.PB;
if (!PB || !PB.Maps) { console.error('PB.Maps never initialised'); process.exit(1); }

/* ---- gather legal id sets ------------------------------------------------ */
const SPRITES = new Set(Object.keys(PB.Sprites.all()));
const ENEMIES = new Set(Object.keys(PB.Enemies.all()));
const ITEMS = new Set(Object.keys(PB.Items.all()));
const BADGES = new Set(Object.keys(PB.Badges.all()));
const MOVES = new Set(Object.keys(PB.Moves.all()));
const PARTNERS = new Set(Object.keys(PB.Partners.all()));
const THEMES = new Set(Object.keys(PB.Themes.T));
const QUESTS = new Set(Object.keys(PB.Quests.all()));
const SHOPS = new Set(Object.keys(PB.Menus.SHOPS));
const MAPS = PB.Maps.all();
const MAPIDS = new Set(Object.keys(MAPS));

const OPS = new Set(['say', 'sayx', 'ask', 'wait', 'stop', 'func', 'ifflag', 'ifnotflag', 'ifitem',
  'ifpartner', 'ifquest', 'sub', 'flag', 'chapterset', 'quest', 'give', 'givekey', 'takekey', 'coins',
  'badge', 'shard', 'rankup', 'form', 'seal', 'recipe', 'upgrade', 'heal', 'toast', 'partner',
  'setactive', 'entity', 'move', 'movenowait', 'face', 'anim', 'spawn', 'despawn', 'hop', 'camera',
  'camerafree', 'shake', 'music', 'stopmusic', 'sfx', 'fanfare', 'fadeout', 'fadein', 'chapter',
  'title', 'goto', 'setspawn', 'battle', 'shop', 'inn', 'cook', 'save', 'credits']);

const GIZMOS = new Set(['sign', 'save', 'heartblock', 'block', 'switch', 'spring', 'shop', 'inn', 'cook',
  'soil', 'crack', 'seam', 'glyph', 'generator', 'plate', 'brazier', 'dockside', 'ferry', 'web']);
const ABILITIES = new Set(['sprout', 'light', 'ferry', 'cut', 'read', 'power']);

/* Dynamic NPC scripts branch on live save state. Each probe sets up a
   different point in the run so every branch gets walked. */
const ALL_QUESTS = Object.keys(PB.Quests.all());
const STATE_PROBES = [
  function fresh() { PB.State.start('Pip', 'normal'); },
  function midgame() {
    PB.State.start('Pip', 'normal');
    const S = PB.State.get();
    S.chapter = 5; S.coliseumRank = 0;
    ALL_QUESTS.forEach(q => PB.State.questStart(q));
  },
  function questsHeld() {
    PB.State.start('Pip', 'normal');
    const S = PB.State.get();
    S.chapter = 7; S.coliseumRank = 7;
    ALL_QUESTS.forEach(q => PB.State.questStart(q));
    // hand over every key item and stock the bag so "turn it in" branches fire
    Object.keys(PB.Items.all()).forEach(id => {
      if (PB.Items.get(id).type === 'key') PB.State.addKey(id);
    });
    for (let i = 0; i < 5; i++) PB.State.addItem('pulpberry');
    ['gh_book1', 'gh_book2', 'gh_book3', 'gh_book4', 'ch1_done', 'ch2_done', 'ch6_done'].forEach(f => PB.State.flag(f, true));
  },
  function cleared() {
    PB.State.start('Pip', 'normal');
    const S = PB.State.get();
    S.chapter = 9; S.coliseumRank = 1;
    ALL_QUESTS.forEach(q => PB.State.questDone(q));
    PB.State.flag('game_clear', true);
  }
];

const errors = [];
const warns = [];
function err(where, msg) { errors.push(`${where}: ${msg}`); }
function warn(where, msg) { warns.push(`${where}: ${msg}`); }

/* ---- walk scripts -------------------------------------------------------- */
function walkScript(where, script, depth) {
  if (!script) return;
  if (typeof script === 'function') { warn(where, 'script is a function — not statically checkable'); return; }
  if (!Array.isArray(script)) { err(where, 'script is not an array'); return; }
  if ((depth || 0) > 8) return;
  script.forEach((cmd, i) => {
    if (typeof cmd === 'function') return;
    if (!Array.isArray(cmd)) { err(where, `command ${i} is not an array`); return; }
    const op = cmd[0];
    if (!OPS.has(op)) { err(where, `unknown script op "${op}" at index ${i}`); return; }
    const at = `${where}[${i}] ${op}`;
    switch (op) {
      case 'say':
        if (cmd[1] && !PB.Script.SPEAKERS[cmd[1]] && !SPRITES.has(cmd[1]))
          err(at, `speaker "${cmd[1]}" is neither a SPEAKERS key nor a sprite id`);
        if (typeof cmd[2] !== 'string') err(at, 'missing text');
        break;
      case 'sayx':
        if (cmd[2] && !SPRITES.has(cmd[2])) err(at, `portrait sprite "${cmd[2]}" does not exist`);
        break;
      case 'give': case 'takekey':
        if (!ITEMS.has(cmd[1])) err(at, `unknown item "${cmd[1]}"`);
        break;
      case 'givekey':
        if (!ITEMS.has(cmd[1])) err(at, `unknown key item "${cmd[1]}"`);
        else if (PB.Items.get(cmd[1]).type !== 'key') warn(at, `"${cmd[1]}" is not a key item`);
        break;
      case 'badge':
        if (!BADGES.has(cmd[1])) err(at, `unknown badge "${cmd[1]}"`);
        break;
      case 'seal': case 'form':
        if (!MOVES.has(cmd[1])) err(at, `unknown move "${cmd[1]}"`);
        break;
      case 'partner': case 'rankup': case 'setactive': case 'ifpartner':
        if (!PARTNERS.has(cmd[1])) err(at, `unknown partner "${cmd[1]}"`);
        break;
      case 'quest':
        if (!QUESTS.has(cmd[1])) warn(at, `quest "${cmd[1]}" is not in 20_quests.js`);
        break;
      case 'shop':
        if (!SHOPS.has(cmd[1])) err(at, `unknown shop "${cmd[1]}"`);
        break;
      case 'goto':
        if (!MAPIDS.has(cmd[1])) err(at, `goto unknown map "${cmd[1]}"`);
        else if (cmd[2] && !(MAPS[cmd[1]].spawns || {})[cmd[2]])
          err(at, `map "${cmd[1]}" has no spawn "${cmd[2]}"`);
        break;
      case 'spawn':
        if (!cmd[1] || !SPRITES.has(cmd[1].sprite)) err(at, `spawn sprite "${cmd[1] && cmd[1].sprite}" does not exist`);
        break;
      case 'upgrade':
        if (cmd[1] !== 'stomp' && cmd[1] !== 'mallet') err(at, `upgrade must be "stomp" or "mallet"`);
        break;
      case 'battle': {
        const c = cmd[1] || {};
        (c.enemies || []).forEach(e => { if (!ENEMIES.has(e)) err(at, `unknown enemy "${e}"`); });
        if (!c.enemies || !c.enemies.length) err(at, 'battle has no enemies');
        if (c.introPortrait && !SPRITES.has(c.introPortrait)) err(at, `intro portrait "${c.introPortrait}" does not exist`);
        if (cmd[2]) walkScript(`${at}.onWin`, cmd[2], (depth || 0) + 1);
        break;
      }
      case 'ifflag': case 'ifnotflag': case 'ifitem':
        walkScript(`${at}.then`, cmd[2], (depth || 0) + 1);
        walkScript(`${at}.else`, cmd[3], (depth || 0) + 1);
        break;
      case 'ifquest':
        walkScript(`${at}.then`, cmd[3], (depth || 0) + 1);
        walkScript(`${at}.else`, cmd[4], (depth || 0) + 1);
        break;
      case 'ask':
        if (!Array.isArray(cmd[3])) err(at, 'ask needs a choices array');
        (cmd[4] || []).forEach((b, bi) => walkScript(`${at}.branch${bi}`, b, (depth || 0) + 1));
        break;
      case 'sub':
        walkScript(`${at}.sub`, cmd[1], (depth || 0) + 1);
        break;
    }
  });
}

/* ---- walk maps ----------------------------------------------------------- */
const referenced = new Set(['quill_square']);

for (const id of Object.keys(MAPS)) {
  const m = MAPS[id];
  const W = `map ${id}`;
  if (!m.name) err(W, 'missing name');
  if (!m.bounds) { err(W, 'missing bounds'); continue; }
  if (m.theme && !THEMES.has(m.theme)) err(W, `unknown theme "${m.theme}"`);
  if (!m.spawns || !m.spawns.default) err(W, 'missing spawns.default');

  (m.exits || []).forEach((e, i) => {
    const at = `${W}.exits[${i}]`;
    if (!MAPIDS.has(e.to)) { err(at, `points at unknown map "${e.to}"`); return; }
    referenced.add(e.to);
    const sp = e.spawn || 'default';
    if (!(MAPS[e.to].spawns || {})[sp]) err(at, `target "${e.to}" has no spawn "${sp}"`);
    if (e.needsKey && !ITEMS.has(e.needsKey)) err(at, `needsKey "${e.needsKey}" is not an item`);
    if (e.script) walkScript(at, e.script);
  });

  (m.props || []).forEach((p, i) => {
    if (!SPRITES.has(p.sprite)) err(`${W}.props[${i}]`, `unknown sprite "${p.sprite}"`);
  });
  (m.solids || []).forEach((s, i) => {
    if (s.sprite && !SPRITES.has(s.sprite)) err(`${W}.solids[${i}]`, `unknown sprite "${s.sprite}"`);
    if (typeof s.x !== 'number' || typeof s.w !== 'number') err(`${W}.solids[${i}]`, 'needs numeric x and w');
  });
  (m.npcs || []).forEach((n, i) => {
    const at = `${W}.npcs[${i}]${n.id ? ' #' + n.id : ''}`;
    if (!SPRITES.has(n.sprite)) err(at, `unknown sprite "${n.sprite}"`);
    if (typeof n.script === 'function') {
      // Exercise the closure across several game states so every branch of a
      // dynamic NPC script gets its ids checked, not just the opening one.
      STATE_PROBES.forEach((probe, pi) => {
        probe();
        try {
          walkScript(`${at}.script()#${pi}`, n.script({}));
        } catch (e) { warn(at, `script() threw in probe ${pi}: ${e.message}`); }
      });
    } else walkScript(at + '.script', n.script);
  });
  (m.foes || []).forEach((f, i) => {
    const at = `${W}.foes[${i}]`;
    if (!ENEMIES.has(f.type)) err(at, `unknown enemy type "${f.type}"`);
    (f.group || []).forEach(g => { if (!ENEMIES.has(g)) err(at, `unknown enemy in group "${g}"`); });
    if (f.cfg && f.cfg.introPortrait && !SPRITES.has(f.cfg.introPortrait)) err(at, `intro portrait "${f.cfg.introPortrait}" missing`);
    if (f.onWin) walkScript(at + '.onWin', f.onWin);
  });
  (m.items || []).forEach((it, i) => {
    const at = `${W}.items[${i}]`;
    if (it.item && !ITEMS.has(it.item)) err(at, `unknown item "${it.item}"`);
    if (it.key && !ITEMS.has(it.key)) err(at, `unknown key item "${it.key}"`);
    if (it.badge && !BADGES.has(it.badge)) err(at, `unknown badge "${it.badge}"`);
    if (it.script) walkScript(at, it.script);
    if (['coin', 'chest', 'shard', 'blockq'].indexOf(it.kind) < 0) err(at, `unknown pickup kind "${it.kind}"`);
  });
  (m.gizmos || []).forEach((g, i) => {
    const at = `${W}.gizmos[${i}]`;
    if (!GIZMOS.has(g.kind)) err(at, `unknown gizmo kind "${g.kind}"`);
    if (g.needs && !ABILITIES.has(g.needs)) err(at, `unknown ability "${g.needs}"`);
    if (g.sprite && !SPRITES.has(g.sprite)) err(at, `unknown sprite "${g.sprite}"`);
    if (g.shop && !SHOPS.has(g.shop)) err(at, `unknown shop "${g.shop}"`);
    if (g.item && !ITEMS.has(g.item)) err(at, `unknown item "${g.item}"`);
    if (g.script) walkScript(at, g.script);
  });
  (m.triggers || []).forEach((t, i) => walkScript(`${W}.triggers[${i}]`, t.script));
  if (m.onEnter) walkScript(`${W}.onEnter`, typeof m.onEnter === 'function' ? m.onEnter() : m.onEnter);
}

/* reachability: anything never referenced by an exit or goto */
const gotoTargets = new Set();
function collectGotos(script) {
  if (!Array.isArray(script)) return;
  script.forEach(c => {
    if (!Array.isArray(c)) return;
    if (c[0] === 'goto') gotoTargets.add(c[1]);
    if (c[0] === 'battle' && c[2]) collectGotos(c[2]);
    if (c[0] === 'ifflag' || c[0] === 'ifnotflag' || c[0] === 'ifitem') { collectGotos(c[2]); collectGotos(c[3]); }
    if (c[0] === 'ifquest') { collectGotos(c[3]); collectGotos(c[4]); }
    if (c[0] === 'ask' && c[4]) c[4].forEach(collectGotos);
  });
}
for (const id of Object.keys(MAPS)) {
  const m = MAPS[id];
  (m.triggers || []).forEach(t => collectGotos(t.script));
  (m.gizmos || []).forEach(g => collectGotos(g.script));
  (m.npcs || []).forEach(n => { if (typeof n.script !== 'function') collectGotos(n.script); });
  if (Array.isArray(m.onEnter)) collectGotos(m.onEnter);
}
for (const id of Object.keys(MAPS)) {
  if (!referenced.has(id) && !gotoTargets.has(id) && id !== 'quill_square')
    warn(`map ${id}`, 'no exit or goto reaches this map');
}

/* ---- report -------------------------------------------------------------- */
console.log(`loaded ${loaded.length} files, ${MAPIDS.size} maps, ${ENEMIES.size} enemies, ${SPRITES.size} sprites`);
if (warns.length) {
  console.log(`\n\x1b[33m${warns.length} warning(s)\x1b[0m`);
  warns.forEach(w => console.log('  ! ' + w));
}
if (errors.length) {
  console.log(`\n\x1b[31m${errors.length} ERROR(S)\x1b[0m`);
  errors.forEach(e => console.log('  x ' + e));
  process.exit(1);
}
console.log('\n\x1b[32mAll content checks passed.\x1b[0m');
