'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { loadViewer } = require('./harness');

const ctx = loadViewer(['collision.js', 'player.js']);
const { Player, Collider } = ctx;

function run(p, seconds, fwd, right, collider, hz = 60) {
  const dt = 1 / hz;
  for (let i = 0; i < seconds * hz; i++) p.step(dt, fwd, right, collider);
}

test('yaw 0 walks north', () => {
  const p = new Player({ x: 0, y: 0, yaw: 0 });
  run(p, 2, 1, 0, null);
  assert.ok(p.y > 3, `moved north, y=${p.y}`);
  assert.ok(Math.abs(p.x) < 0.05, `no lateral drift, x=${p.x}`);
});

test('yaw 90 degrees walks east', () => {
  const p = new Player({ x: 0, y: 0, yaw: Math.PI / 2 });
  run(p, 2, 1, 0, null);
  assert.ok(p.x > 3, `moved east, x=${p.x}`);
  assert.ok(Math.abs(p.y) < 0.05, `no drift, y=${p.y}`);
});

test('strafing goes right of the facing direction', () => {
  const p = new Player({ x: 0, y: 0, yaw: 0 });   // facing north
  run(p, 2, 0, 1, null);
  assert.ok(p.x > 3, `strafed east, x=${p.x}`);
});

test('walking tops out at a real walking pace', () => {
  const p = new Player({ x: 0, y: 0 });
  run(p, 4, 1, 0, null);
  assert.ok(p.speed() <= 3.11, `walk speed ${p.speed()}`);
  assert.ok(p.speed() > 3.0, `and actually reaches it: ${p.speed()}`);
});

test('running is faster than walking but still bounded', () => {
  const p = new Player({ x: 0, y: 0 });
  p.running = true;
  run(p, 4, 1, 0, null);
  assert.ok(p.speed() > 7.0 && p.speed() <= 7.41, `run speed ${p.speed()}`);
});

test('diagonal movement gets no speed bonus', () => {
  const straight = new Player({ x: 0, y: 0 });
  const diagonal = new Player({ x: 0, y: 0 });
  run(straight, 4, 1, 0, null);
  run(diagonal, 4, 1, 1, null);
  assert.ok(Math.abs(straight.speed() - diagonal.speed()) < 0.02,
    `straight ${straight.speed()} vs diagonal ${diagonal.speed()}`);
});

test('releasing the keys brings you to a stop', () => {
  const p = new Player({ x: 0, y: 0 });
  run(p, 2, 1, 0, null);
  assert.ok(p.speed() > 3);
  run(p, 2, 0, 0, null);
  assert.strictEqual(p.speed(), 0);
});

test('movement is frame-rate independent', () => {
  const a = new Player({ x: 0, y: 0 });
  const b = new Player({ x: 0, y: 0 });
  run(a, 3, 1, 0, null, 30);
  run(b, 3, 1, 0, null, 144);
  assert.ok(Math.abs(a.y - b.y) < 0.15, `30Hz y=${a.y} vs 144Hz y=${b.y}`);
});

test('pitch is clamped so the view never flips', () => {
  const p = new Player({});
  for (let i = 0; i < 200; i++) p.look(0, 0.1);
  assert.ok(p.pitch < Math.PI / 2, `pitch ${p.pitch}`);
  for (let i = 0; i < 400; i++) p.look(0, -0.1);
  assert.ok(p.pitch > -Math.PI / 2, `pitch ${p.pitch}`);
});

test('yaw stays in range over a long session', () => {
  const p = new Player({});
  for (let i = 0; i < 5000; i++) p.look(0.05, 0);
  assert.ok(Math.abs(p.yaw) <= Math.PI + 1e-9, `yaw ${p.yaw}`);
});

test('you cannot walk through a building', () => {
  const c = new Collider();
  c.addTile({
    tx: 0, ty: 0, n: 1,
    starts: new Uint32Array([0]),
    npts: new Uint8Array([4]),
    x: new Float32Array([-20, 20, 20, -20]),
    y: new Float32Array([0, 0, 40, 40]),
  });
  const p = new Player({ x: 0, y: -10, yaw: 0 });   // facing north, wall at y=0
  p.running = true;
  run(p, 6, 1, 0, c);
  assert.ok(p.y < 0, `stopped outside the wall, y=${p.y}`);
  assert.ok(!c.inside(p.x, p.y), 'and is not inside the building');
});

test('running along a wall keeps you moving', () => {
  const c = new Collider();
  c.addTile({
    tx: 0, ty: 0, n: 1,
    starts: new Uint32Array([0]),
    npts: new Uint8Array([4]),
    x: new Float32Array([-200, 200, 200, -200]),
    y: new Float32Array([0, 0, 40, 40]),
  });
  // facing 30 degrees east of north, into a long east-west wall
  const p = new Player({ x: 0, y: -5, yaw: Math.PI / 6 });
  p.running = true;
  run(p, 5, 1, 0, c);
  assert.ok(p.y < 0, 'still outside the wall');
  assert.ok(p.x > 10, `slid a long way east along it, x=${p.x}`);
});

test('the eye sits at head height and looks where the yaw points', () => {
  const p = new Player({ x: 5, y: 7, groundZ: 3 });
  const e = p.eye();
  assert.ok(Math.abs(e[0] - 5) < 1e-9 && Math.abs(e[1] - 7) < 1e-9);
  assert.ok(e[2] > 3 + 1.6 && e[2] < 3 + 1.8, `eye height ${e[2]}`);
  const t = p.target();
  assert.ok(t[1] > e[1], 'looks north at yaw 0');
});

test('reduced motion removes the head bob', () => {
  const p = new Player({ reducedMotion: true });
  run(p, 3, 1, 0, null);
  const e = p.eye();
  assert.strictEqual(e[2], EYE_HEIGHT_FOR_TEST(p));
  function EYE_HEIGHT_FOR_TEST(pl) { return pl.groundZ + 1.68; }
});
