/* ==========================================================================
   PAPERBOUND — 22_mapkit.js
   Authoring helpers for the chapter files. Chapters are mostly linear, so
   `chain()` wires up the west/east exits and spawns automatically and lets
   each map file concentrate on what is actually in the room.
   ========================================================================== */
'use strict';

PB.MapKit = (function () {
  var U = PB.U, M = PB.Maps.define;

  /* chain(defaults, [ {id, name, w, ...}, ... ] )
     - map[0] gets its west exit from `defaults.entryWest` ({to, spawn})
     - every other map's west exit goes back to the previous map's 'east' spawn
     - every map except the last gets an east exit to the next map's 'west'
     - `eastLock` on a map applies needsKey / needsFlag / lockedMsg to its east exit
     - `noEast` suppresses the auto east exit (for boss rooms reached by script) */
  function chain(defaults, list) {
    list.forEach(function (m, i) {
      var prev = list[i - 1], next = list[i + 1];
      var w = m.w || 1600;
      var z1 = m.z1 === undefined ? .93 : m.z1;
      var z0 = m.z0 === undefined ? .12 : m.z0;

      var spawns = U.extend({
        default: { x: 100, z: .6 },
        west: { x: 60, z: .6 },
        east: { x: w - 60, z: .6, face: 'left' }
      }, m.spawns || {});

      var exits = [];
      if (i === 0 && defaults.entryWest) {
        exits.push({ x: 8, z: .6, w: 40, d: 1, to: defaults.entryWest.to, spawn: defaults.entryWest.spawn });
      } else if (prev) {
        exits.push({ x: 8, z: .6, w: 40, d: 1, to: prev.id, spawn: 'east' });
      }
      if (next && !m.noEast) {
        exits.push(U.extend({ x: w - 12, z: .6, w: 40, d: 1, to: next.id, spawn: 'west' }, m.eastLock || {}));
      }
      (m.exits || []).forEach(function (e) { exits.push(e); });

      M(m.id, {
        name: m.name,
        chapter: m.chapter === undefined ? defaults.chapter : m.chapter,
        music: m.music || defaults.music,
        theme: m.theme || defaults.theme,
        battleBg: m.battleBg || defaults.battleBg,
        dark: !!m.dark,
        bounds: { x0: 0, x1: w, z0: z0, z1: z1 },
        spawns: spawns,
        exits: exits,
        solids: m.solids || [],
        props: m.props || [],
        npcs: m.npcs || [],
        foes: m.foes || [],
        items: m.items || [],
        gizmos: m.gizmos || [],
        triggers: m.triggers || [],
        water: m.water || [],
        pits: m.pits || [],
        onEnter: m.onEnter || []
      });
    });
  }

  /* A tidy save-and-heal rest stop. */
  function rest(x, z) {
    return [{ kind: 'save', x: x, z: z === undefined ? .84 : z },
      { kind: 'heartblock', x: x + 80, z: z === undefined ? .84 : z }];
  }

  /* Scenery filler: n props of the given kinds spread across the width. */
  function scatter(sprites, n, w, band) {
    var out = [];
    for (var i = 0; i < n; i++) {
      out.push({
        sprite: sprites[i % sprites.length],
        x: 120 + (i * (w - 240)) / Math.max(1, n - 1),
        z: band === 'front' ? .86 + (i % 3) * .03 : .06 + (i % 4) * .05,
        scale: .9 + (i % 3) * .1
      });
    }
    return out;
  }

  /* The standard "boss room" trigger: dialogue, fight, payout. */
  function bossTrigger(o) {
    return {
      x: o.x, z: .6, w: 110, d: 1.4, once: true, flag: o.flag,
      script: [['camera', o.x + 190, 48]]
        .concat(o.before || [])
        .concat([['spawn', { id: o.entId, sprite: o.sprite, x: o.x + 260, z: .55, name: o.name, face: 'left' }]])
        .concat([['sfx', 'roar'], ['shake', 16]])
        .concat(o.lines || [])
        .concat([['music', o.music || 'boss']])
        .concat([['battle', {
          enemies: [o.enemy], boss: true, noRun: true,
          bg: o.bg || 'stage', music: o.music || 'boss'
        }, [['despawn', o.entId]].concat(o.after || [])]])
    };
  }

  return { chain: chain, rest: rest, scatter: scatter, bossTrigger: bossTrigger };
})();
