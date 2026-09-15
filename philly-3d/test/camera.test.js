'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { loadViewer } = require('./harness');

const ctx = loadViewer(['camera.js']);
const { Camera } = ctx;

function settle(cam, seconds = 4) {
  for (let t = 0; t < seconds * 60; t++) cam.step(1 / 60);
}

test('azimuth 180 puts the camera south of its target', () => {
  const c = new Camera({ target: [0, 0, 0], distance: 1000, azimuth: 180, elevation: 0 });
  settle(c);
  const e = c.eye();
  assert.ok(Math.abs(e[0]) < 1, `x ${e[0]}`);
  assert.ok(Math.abs(e[1] + 1000) < 1, `y ${e[1]}`);
});

test('azimuth 270 puts the camera west of its target', () => {
  const c = new Camera({ target: [0, 0, 0], distance: 500, azimuth: 270, elevation: 0 });
  settle(c);
  const e = c.eye();
  assert.ok(Math.abs(e[0] + 500) < 1, `x ${e[0]}`);
  assert.ok(Math.abs(e[1]) < 1, `y ${e[1]}`);
});

test('elevation 90 puts the camera straight overhead', () => {
  const c = new Camera({ target: [10, 20, 0], distance: 800, azimuth: 0, elevation: 88 });
  settle(c);
  const e = c.eye();
  assert.ok(Math.abs(e[0] - 10) < 30 && Math.abs(e[1] - 20) < 30);
  assert.ok(e[2] > 780, `height ${e[2]}`);
});

test('zoom and elevation stay inside their limits', () => {
  const c = new Camera();
  for (let i = 0; i < 200; i++) c.zoom(0.5);
  settle(c);
  assert.ok(c.distance >= c.minDistance - 1e-6, `distance ${c.distance}`);
  for (let i = 0; i < 400; i++) c.zoom(2);
  settle(c);
  assert.ok(c.distance <= c.maxDistance + 1e-6, `distance ${c.distance}`);
  for (let i = 0; i < 200; i++) c.orbit(0, -20);
  settle(c);
  assert.ok(c.elevation >= c.minElevation - 1e-6, `elevation ${c.elevation}`);
});

test('orbiting takes the short way round the compass', () => {
  const c = new Camera({ azimuth: 350 });
  settle(c);
  c.goal.azimuth = 370;                 // ie 10 degrees, crossing north
  const before = c.azimuth;
  c.step(1 / 60);
  assert.ok(c.azimuth > before, 'moves forward through north, not backwards');
  assert.ok(c.azimuth - before < 5, 'and takes the 20 degree route, not 340');
});

test('damping is frame-rate independent', () => {
  const a = new Camera({ distance: 1000 });
  const b = new Camera({ distance: 1000 });
  a.goal.distance = 2000; b.goal.distance = 2000;
  for (let i = 0; i < 60; i++) a.step(1 / 60);      // 60 Hz for one second
  for (let i = 0; i < 144; i++) b.step(1 / 144);    // 144 Hz for one second
  assert.ok(Math.abs(a.distance - b.distance) < 5,
    `60Hz ${a.distance} vs 144Hz ${b.distance}`);
});

test('panning moves the target and scales with zoom', () => {
  const near = new Camera({ target: [0, 0, 0], distance: 200, azimuth: 180 });
  const far = new Camera({ target: [0, 0, 0], distance: 4000, azimuth: 180 });
  near.pan(100, 0, 800);
  far.pan(100, 0, 800);
  const dn = Math.hypot(near.goal.target[0], near.goal.target[1]);
  const df = Math.hypot(far.goal.target[0], far.goal.target[1]);
  assert.ok(dn > 0 && df > dn * 10, `near ${dn} far ${df}`);
});

test('clip planes bracket the scene at every zoom', () => {
  for (const d of [50, 500, 5000, 20000]) {
    const c = new Camera({ distance: d });
    settle(c);
    const [near, far] = c.clip();
    assert.ok(near > 0 && near < d, `near ${near} for distance ${d}`);
    assert.ok(far > d * 1.5, `far ${far} for distance ${d}`);
    assert.ok(far / near < 4e5, `depth ratio ${far / near} risks z-fighting`);
  }
});
