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
const buildings = JSON.parse(fs.readFileSync(path.join(DIR, 'philadelphia_buildings.json'), 'utf8')).buildings;

test('the district declares its frame and bearing', () => {
  assert.strictEqual(district.frame.up, '+Y');
  assert.strictEqual(district.frame.east, '+X');
  assert.strictEqual(district.frame.north, '-Z');
  assert.ok(Math.abs(district.grid_bearing_deg - 9.21) < 0.01);
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

test('City Hall sits where the projection says it does', () => {
  // The district is centred on ENU (-40, -20) and rotated by the grid bearing,
  // so City Hall lands at a known offset. If the rotation were dropped or
  // doubled this is the first thing that would move.
  const ch = district.landmarks.city_hall.position;
  const [cx, cy] = district.centre_enu;
  const r = district.grid_bearing_deg * Math.PI / 180;
  const ex = -cx, ey = -cy;
  const wantX = ex * Math.cos(r) - ey * Math.sin(r);
  const wantZ = -(ex * Math.sin(r) + ey * Math.cos(r));
  assert.ok(Math.abs(ch[0] - wantX) < 0.02, `x ${ch[0]} want ${wantX}`);
  assert.ok(Math.abs(ch[2] - wantZ) < 0.02, `z ${ch[2]} want ${wantZ}`);
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
