#!/usr/bin/env node
/* ==========================================================================
   PAPERBOUND — tools/smoke.js
   Drives the real game in headless Chromium: boots it, starts a new file,
   walks the prologue, forces a battle, exercises the pause menu and every
   map in the game, and fails on any console error or thrown exception.

   Usage:  node tools/smoke.js [--shots DIR]
   Requires playwright (any recent version) resolvable from NODE_PATH.
   ========================================================================== */
'use strict';

const path = require('path');
const fs = require('fs');

let playwright;
try { playwright = require('playwright'); }
catch (e) {
  console.error('smoke: playwright not resolvable. Set NODE_PATH to a dir containing it.');
  process.exit(2);
}

const ROOT = path.resolve(__dirname, '..');
const shotsIdx = process.argv.indexOf('--shots');
const SHOTS = shotsIdx > 0 ? process.argv[shotsIdx + 1] : null;
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });

const EXEC = ['/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell',
  '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find(p => fs.existsSync(p));

const errors = [];
let shotN = 0;

(async () => {
  const browser = await playwright.chromium.launch({
    executablePath: EXEC || undefined,
    args: ['--no-sandbox', '--mute-audio', '--disable-gpu']
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 760 } });

  page.on('console', m => {
    if (m.type() === 'error') errors.push('console: ' + m.text());
  });
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('requestfailed', r => errors.push('requestfailed: ' + r.url()));

  await page.goto('file://' + path.join(ROOT, 'index.html'), { waitUntil: 'load' });

  const shot = async (name) => {
    if (!SHOTS) return;
    shotN++;
    await page.screenshot({ path: path.join(SHOTS, String(shotN).padStart(2, '0') + '-' + name + '.png') });
  };
  const wait = (ms) => page.waitForTimeout(ms);
  const key = async (k, n = 1, gap = 90) => {
    for (let i = 0; i < n; i++) { await page.keyboard.press(k); await wait(gap); }
  };
  const hold = async (k, ms) => {
    await page.keyboard.down(k); await wait(ms); await page.keyboard.up(k);
  };
  const dbg = () => page.evaluate(() => {
    const d = PB.Game._debug();
    return {
      scene: d.scene, maps: d.maps,
      map: d.world && d.world.map ? d.world.map.id : null,
      inBattle: !!(d.world && d.world.world ? false : (d.world && d.world.battle)),
      battlePhase: d.world && d.world.battle ? d.world.battle.phase : null,
      hp: d.state ? d.state.hp : null,
      level: d.state ? d.state.level : null,
      chapter: d.state ? d.state.chapter : null,
      partner: d.state ? d.state.active : null,
      busy: d.world ? d.world.busy : null
    };
  });

  const step = async (label, fn) => {
    const before = errors.length;
    await fn();
    const added = errors.slice(before);
    const state = await dbg();
    console.log(`  ${added.length ? '\x1b[31mFAIL\x1b[0m' : '\x1b[32m ok \x1b[0m'} ${label}` +
      `   [scene=${state.scene} map=${state.map} hp=${state.hp} lv=${state.level}]`);
    added.forEach(e => console.log('        ' + e));
  };

  console.log('PAPERBOUND smoke test\n');

  await wait(900);
  await step('boots to title screen', async () => {
    const s = await dbg();
    if (s.scene !== 'title') throw new Error('expected title, got ' + s.scene);
    if (s.maps < 50) errors.push('only ' + s.maps + ' maps registered');
    await shot('title');
  });

  await step('opens How to Play', async () => {
    await key('ArrowDown', 2); await key('KeyZ'); await wait(300);
    await shot('howto');
    await key('KeyX'); await wait(200);
  });

  await step('starts a new file on Normal', async () => {
    await page.evaluate(() => { PB.Game._debug().startNew('normal'); });
    await wait(1400);
    const s = await dbg();
    if (s.scene !== 'world') throw new Error('expected world, got ' + s.scene);
    await shot('quillton');
  });

  await step('runs the prologue intro cutscene', async () => {
    await key('ArrowRight', 1, 60);
    await hold('ArrowRight', 900);
    for (let i = 0; i < 40; i++) { await key('KeyZ', 1, 110); const s = await dbg(); if (!s.busy) break; }
    await shot('prologue');
  });

  await step('walks east and talks to the mayor', async () => {
    await hold('ArrowRight', 2600);
    for (let i = 0; i < 90; i++) {
      await key('KeyZ', 1, 90);
      const s = await dbg();
      if (!s.busy && i > 8) break;
    }
    await shot('crown-torn');
  });

  await step('opens the pause satchel and every tab', async () => {
    await key('Escape'); await wait(320); await shot('pause-items');
    await key('KeyE'); await wait(260); await shot('pause-badges');
    await key('KeyE'); await wait(260); await shot('pause-party');
    await key('KeyE'); await wait(260); await shot('pause-journal');
    await key('KeyE'); await wait(260); await shot('pause-options');
    await key('Escape'); await wait(300);
  });

  await step('opens the world map', async () => {
    await key('Tab'); await wait(320); await shot('worldmap');
    await key('Tab'); await wait(260);
  });

  await step('forces a battle and plays a full round', async () => {
    await page.evaluate(() => { PB.Game._debug().battle(['snapleaf', 'crumple'], false); });
    await wait(1600);
    let s = await dbg();
    if (!s.battlePhase) throw new Error('battle did not start');
    await shot('battle-menu');
    // hero: Stomp -> first move -> target -> action command (mash Z)
    await key('KeyZ', 1, 300);        // Stomp
    await key('KeyZ', 1, 300);        // first stomp move
    await key('KeyZ', 1, 400);        // confirm target
    await shot('battle-command');
    await key('KeyZ', 6, 90);         // attempt the timing window
    await wait(1800);
    await shot('battle-after-hero');
    // partner turn
    await key('KeyZ', 1, 300);
    await key('KeyZ', 1, 300);
    await key('KeyZ', 1, 400);
    await key('KeyZ', 6, 90);
    await wait(2600);
    await shot('battle-enemy-turn');
    // guard attempts during the enemy phase
    for (let i = 0; i < 24; i++) { await key('KeyZ', 1, 120); }
    await wait(1200);
    s = await dbg();
    await shot('battle-late');
    if (s.hp === null) throw new Error('lost the state object mid-battle');
  });

  await step('escapes the battle back to the world', async () => {
    // mash through victory / level-up / defeat screens until we are back
    for (let i = 0; i < 70; i++) {
      const s = await dbg();
      if (s.scene === 'world' && !s.battlePhase) break;
      await key('KeyZ', 1, 160);
    }
    const s = await dbg();
    await shot('back-in-world');
    if (s.scene !== 'world' && s.scene !== 'gameover') throw new Error('stuck in ' + s.scene);
  });

  /* Load every map in turn and render a few frames. This is the broadest
     check available: it catches bad sprite ids, missing spawns and any draw
     path that throws only for one particular room. */
  await step('renders every map in the game', async () => {
    const ids = await page.evaluate(() => Object.keys(PB.Maps.all()));
    console.log('        ' + ids.length + ' maps');
    const failed = [];
    for (const id of ids) {
      const before = errors.length;
      await page.evaluate((m) => { PB.Game._debug().warp(m); }, id);
      await wait(140);
      // nudge the player so movement + collision run in this room too
      await page.keyboard.down('ArrowRight'); await wait(120); await page.keyboard.up('ArrowRight');
      await wait(90);
      if (errors.length > before) failed.push(id + ' -> ' + errors.slice(before).join('; '));
    }
    if (failed.length) throw new Error('maps with errors:\n        ' + failed.join('\n        '));
  });

  await step('renders a boss battle stage', async () => {
    await page.evaluate(() => { PB.Game._debug().warp('cw_heart'); });
    await wait(300);
    await page.evaluate(() => { PB.Game._debug().battle(['bramblejack'], true); });
    await wait(2000);
    await shot('boss-battle');
    const s = await dbg();
    if (!s.battlePhase) throw new Error('boss battle did not start');
  });

  await step('renders the final boss stage', async () => {
    await page.evaluate(() => { PB.Game._debug().battle(['the_blank'], true); });
    await wait(2200);
    await shot('final-boss');
  });

  await browser.close();

  console.log('');
  if (errors.length) {
    console.log(`\x1b[31m${errors.length} error(s) during the run:\x1b[0m`);
    [...new Set(errors)].slice(0, 40).forEach(e => console.log('  x ' + e));
    process.exit(1);
  }
  console.log('\x1b[32mSmoke test clean — no console errors, no exceptions.\x1b[0m');
  if (SHOTS) console.log('screenshots: ' + SHOTS);
})().catch(e => {
  console.error('\nsmoke harness failed:', e && e.stack || e);
  if (errors.length) {
    console.error('collected page errors:');
    [...new Set(errors)].slice(0, 20).forEach(x => console.error('  x ' + x));
  }
  process.exit(1);
});
