'use strict';
// The Godot side cannot be executed here, so the export itself is held to the
// invariants the GDScript relies on. A malformed district would otherwise only
// surface as a broken world inside the editor.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const DIR = path.join(__dirname, '..', 'godot', 'data');
const district = JSON.parse(fs.readFileSync(path.join(DIR, 'philadelphia_district.json'), 'utf8'));
const rows = JSON.parse(fs.readFileSync(path.join(DIR, 'philadelphia_buildings.json'), 'utf8')).buildings;
// Crown tiers ride in the same array so the engine's build loop needs no new
// plumbing, but they are not footprints: no ring, no unique id, no street
// presence. Every invariant below that is about footprints excludes them.
const crowns = rows.filter((r) => r.crown);
const buildings = rows.filter((r) => !r.crown);

test('the district declares its frame and bearing', () => {
  assert.strictEqual(district.frame.up, '+Y');
  assert.strictEqual(district.frame.east, '+X');
  assert.strictEqual(district.frame.north, '-Z');
  // Measured from Centre City's own footprints rather than hard-coded, so it
  // lands near the 9.21 degrees docs/SOURCES.md derives from the six named
  // streets without being expected to match it exactly. The per-district
  // bearings live in districts.test.js.
  assert.ok(Math.abs(district.grid_bearing_deg - 9.21) < 0.5,
    `bearing ${district.grid_bearing_deg}`);
  assert.ok(district.world_half > 0);
});

test('every building is physically plausible', () => {
  assert.ok(buildings.length > 100, `only ${buildings.length} buildings`);
  for (const b of buildings) {
    assert.ok(Number.isFinite(b.height) && b.height > 0 && b.height < 400,
      `height ${b.height} on ${b.id}`);
    assert.strictEqual(b.centre.length, 3);
    assert.strictEqual(b.size.length, 2);
    assert.ok(b.size[0] > 0 && b.size[1] > 0, `size ${b.size} on ${b.id}`);
    assert.ok(b.size[0] < 400 && b.size[1] < 400, `implausible size on ${b.id}`);
    assert.ok(Number.isFinite(b.rot_y));
    assert.ok(Array.isArray(b.ring) && b.ring.length >= 3, `ring on ${b.id}`);
  }
});

test('crown tiers stack on a real building without replacing it', () => {
  assert.ok(crowns.length > 0, 'no crown tiers were exported');
  assert.strictEqual(district.crown_count, crowns.length);
  const byId = new Map(buildings.map((b) => [b.id, b]));
  const stackTop = new Map();
  for (const c of crowns) {
    const mass = byId.get(c.id);
    assert.ok(mass, `crown for ${c.of} has no surveyed building under it`);
    assert.ok(c.height > 0 && c.height < 200, `tier height ${c.height} on ${c.of}`);
    assert.ok(c.size[0] > 0 && c.size[1] > 0);
    assert.strictEqual(c.rot_y, mass.rot_y, `${c.of}: tier is not on the block axes`);
    assert.ok(typeof c.solid === 'boolean');
    // the mass is drawn exactly as surveyed; the tier starts where it ends
    const massTop = mass.centre[1] + mass.height;
    const floorOf = stackTop.get(c.id) ?? massTop;
    assert.ok(Math.abs(c.centre[1] - floorOf) < 0.05,
      `${c.of} ${c.kind}: tier floor ${c.centre[1]} but the stack reached ${floorOf}`);
    assert.ok(c.size[0] <= mass.size[0] + 0.01 && c.size[1] <= mass.size[1] + 0.01,
      `${c.of} ${c.kind}: tier is wider than the building`);
    stackTop.set(c.id, c.centre[1] + c.height);
  }
  // and every tier is narrower than the one below it
  const seen = new Map();
  for (const c of crowns) {
    const prev = seen.get(c.id);
    if (prev) {
      assert.ok(Math.max(c.size[0], c.size[1]) < Math.max(prev[0], prev[1]) + 0.01,
        `${c.of} ${c.kind}: the stack widens as it rises`);
    }
    seen.set(c.id, c.size);
  }
});

test('City Hall gets its tower back, to the published height', () => {
  const tiers = crowns.filter((c) => c.of === 'City Hall');
  assert.strictEqual(tiers.length, 4, 'City Hall should have four tiers');
  const mass = buildings.find((b) => tiers[0].id === b.id);
  const top = tiers[tiers.length - 1];
  const aboveGrade = (top.centre[1] + top.height - mass.centre[1]) / 0.3048;
  assert.ok(Math.abs(aboveGrade - 548) < 0.5,
    `City Hall reaches ${aboveGrade.toFixed(1)} ft above its grade, not 548`);
  // the tower is squared to the block, near its real 30 m width
  const tower = tiers[0];
  assert.ok(Math.abs(tower.size[0] - tower.size[1]) < 0.01, 'the tower is not square');
  assert.ok(tower.size[0] > 24 && tower.size[0] < 36,
    `tower is ${tower.size[0]} m across`);
  assert.ok(tiers.every((t) => t.solid), 'the granite tower should not be curtain wall');
});

test('nothing escapes the district window', () => {
  const lim = district.world_half + 220;   // a large footprint may overhang
  for (const b of buildings) {
    assert.ok(Math.abs(b.centre[0]) <= lim, `x ${b.centre[0]} on ${b.id}`);
    assert.ok(Math.abs(b.centre[2]) <= lim, `z ${b.centre[2]} on ${b.id}`);
  }
});

test('building ids are unique', () => {
  const seen = new Set();
  for (const b of buildings) {
    assert.ok(!seen.has(b.id), `duplicate id ${b.id}`);
    seen.add(b.id);
  }
});

test('the grid rotation actually aligns the city to the axes', () => {
  // This is the whole reason the export rotates: the engine's road constants,
  // lane maths and window punching are axis-aligned.
  let aligned = 0;
  for (const b of buildings) {
    const deg = Math.abs(b.rot_y * 180 / Math.PI) % 90;
    if (Math.min(deg, 90 - deg) < 5) aligned++;
  }
  const pct = aligned / buildings.length;
  assert.ok(pct > 0.85, `only ${(pct * 100).toFixed(0)}% within 5 degrees of an axis`);
});

test('the tallest buildings are the real Center City towers', () => {
  const tall = [...buildings].sort((a, b) => b.height - a.height);
  // Comcast Center is 297.5 m by the city's LiDAR; nothing in Philadelphia
  // is taller, so a bigger number here means the export corrupted a height.
  assert.ok(Math.abs(tall[0].height - 297.5) < 1, `tallest is ${tall[0].height}`);
  assert.ok(tall[1].height > 270 && tall[1].height < 285, `second ${tall[1].height}`);
  assert.ok(tall.filter((b) => b.height > 200).length >= 5,
    'Center City has at least five buildings over 200 m');
});

test('roads carry real widths from the city road class', () => {
  assert.ok(district.roads.length > 20, `only ${district.roads.length} roads`);
  const widths = new Set(district.roads.map((r) => r.width));
  assert.ok(widths.size >= 3, 'more than one road class is represented');
  for (const r of district.roads) {
    assert.ok(r.width >= 5 && r.width <= 30, `width ${r.width} on ${r.name}`);
    assert.ok(r.points.length >= 2);
    for (const p of r.points) assert.strictEqual(p.length, 3);
  }
});

test('landmarks are real addresses and point at real sites', () => {
  const keys = Object.keys(district.landmarks);
  assert.ok(keys.length > 0);
  assert.ok(keys.includes('city_hall'));
  for (const k of keys) {
    const l = district.landmarks[k];
    assert.ok(l.label && l.label.length > 1, `label on ${k}`);
    assert.strictEqual(l.position.length, 3);
    if (l.site) {
      assert.ok(l.site.startsWith('philly-sites/'), `site path on ${k}`);
      assert.ok(l.site.endsWith('/index.html'));
    }
  }
});

test('City Hall sits where the survey puts it, not where the origin is', () => {
  // This test used to derive the expected position from the ENU origin, on the
  // assumption that the origin IS City Hall. It is not: the origin is Penn
  // Square and the survey puts the building's footprint centre 144.4 m east and
  // 17.5 m south of it. The test passed anyway because the exporter made the
  // same assumption, so the two agreed with each other and both were wrong.
  //
  // It is checked against the surveyed footprint now, which keeps its real
  // purpose: a dropped or doubled grid rotation moves this first.
  const landmarks = JSON.parse(fs.readFileSync(
    path.join(__dirname, '..', 'data', 'philly-landmarks.json'), 'utf8'));
  const survey = landmarks.find((l) => l.id === 489794);
  assert.ok(survey, 'City Hall is missing from the landmark table');
  assert.ok(Math.hypot(survey.x, survey.y) > 100,
    'the survey now puts City Hall at the origin, so this test is moot');

  const ch = district.landmarks.city_hall.position;
  const [cx, cy] = district.centre_enu;
  const r = district.grid_bearing_deg * Math.PI / 180;
  const ex = survey.x - cx, ey = survey.y - cy;
  const wantX = ex * Math.cos(r) - ey * Math.sin(r);
  const wantZ = -(ex * Math.sin(r) + ey * Math.cos(r));
  assert.ok(Math.abs(ch[0] - wantX) < 1.0, `x ${ch[0]} want ${wantX.toFixed(2)}`);
  assert.ok(Math.abs(ch[2] - wantZ) < 1.0, `z ${ch[2]} want ${wantZ.toFixed(2)}`);
});

test('the GDScript only calls kit helpers that exist', () => {
  // Cheap guard against drift in the engine API, since Godot cannot run here.
  const src = fs.readFileSync(
    path.join(__dirname, '..', 'godot', 'scripts', 'philadelphia_world_builder.gd'), 'utf8');
  const KNOWN = ['mat', 'box', 'flat', 'batch_box', 'flush', 'sign_text'];
  const calls = [...src.matchAll(/\bkit\.([a-z_]+)\s*\(/g)].map((m) => m[1]);
  assert.ok(calls.length > 5, 'the builder actually uses the kit');
  for (const c of new Set(calls)) {
    assert.ok(KNOWN.includes(c), `kit.${c}() is not a known civic_kit helper`);
  }
  const MATERIALS = ['asphalt','brick_brown','brick_buff','brick_red','concrete_dark',
    'glass_office','glass_tower','sidewalk','stone','stone_pale','window_dark','window_lit'];
  const mats = [...src.matchAll(/kit\.mat\("([a-z_0-9]+)"\)/g)].map((m) => m[1]);
  for (const m of new Set(mats)) {
    assert.ok(MATERIALS.includes(m), `material "${m}" is not in civic_kit`);
  }
});

test('the builder exposes the surface the rest of the game calls', () => {
  const src = fs.readFileSync(
    path.join(__dirname, '..', 'godot', 'scripts', 'philadelphia_world_builder.gd'), 'utf8');
  for (const fn of ['build', 'landmark', 'road_coords', 'road_half', 'world_half',
    'blackspots', 'block_bounds']) {
    assert.ok(new RegExp(`func ${fn}\\(`).test(src), `missing func ${fn}()`);
  }
});

test('the district sits on the engine floor, not thirteen metres above it', () => {
  // The engine draws its ground as one slab at y = 0. Exporting absolute
  // base_elevation left every footprint floating at its measured elevation:
  // median 13.4 m across this window.
  assert.ok(typeof district.ground_datum_m === 'number',
    'the district records no ground datum');
  assert.ok(district.ground_datum_m > 1,
    `a ${district.ground_datum_m} m datum means nothing was shifted`);
  const ys = buildings.map((b) => b.centre[1]).sort((a, b) => a - b);
  const median = ys[Math.floor(ys.length / 2)];
  assert.ok(Math.abs(median) < 1.5,
    `median building base is ${median.toFixed(1)} m off the floor`);
  // and the real relief between footprints survives the shift
  assert.ok(ys[ys.length - 1] - ys[0] > 5,
    'every building landed at the same height, so the relief was flattened');
});

test('the ground grid covers the district and matches the buildings on it', () => {
  const g = district.ground_grid;
  assert.ok(g && Array.isArray(g.z) && g.z.length > 8, 'no ground grid');
  assert.strictEqual(g.z.length, g.cells);
  for (const row of g.z) {
    assert.strictEqual(row.length, g.cells, 'the grid is not square');
    for (const v of row) assert.ok(Number.isFinite(v), `bad cell ${v}`);
  }
  assert.ok(Math.abs(g.cells * g.step_m - district.world_half * 2) < 1,
    `${g.cells} cells of ${g.step_m} m do not span the ${district.world_half * 2} m district`);
  const flat = g.z.flat();
  const lo = Math.min(...flat), hi = Math.max(...flat);
  assert.ok(hi - lo > 2, `only ${(hi - lo).toFixed(1)} m of relief, is the grid real?`);
  assert.ok(hi - lo < 60, `${(hi - lo).toFixed(1)} m of relief in 840 m is not Center City`);
  // the ground and the buildings must be on the same datum
  const ys = buildings.map((b) => b.centre[1]);
  const median = ys.sort((a, b) => a - b)[Math.floor(ys.length / 2)];
  assert.ok(median > lo - 3 && median < hi + 3,
    `buildings sit at ${median.toFixed(1)} m but the ground runs ${lo.toFixed(1)} to ${hi.toFixed(1)}`);
});

test('the GDScript lays the ground grid and puts roads on it', () => {
  const gd = fs.readFileSync(path.join(__dirname, '..', 'godot', 'scripts',
    'philadelphia_world_builder.gd'), 'utf8');
  assert.ok(/func _ground_at\(/.test(gd), 'no ground sampler');
  assert.ok(/_ground_at\(mx, mz\)/.test(gd),
    'roads still sit at a fixed height above a flat slab');
  assert.ok(/ground_grid/.test(gd), 'the builder never reads the ground grid');
});
