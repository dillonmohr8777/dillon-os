'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { loadViewer } = require('./harness');

const ctx = loadViewer(['math.js']);
const { M4, frustumPlanes, boxInFrustum } = ctx;

function xf(m, p) {
  return [
    m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12],
    m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13],
    m[2] * p[0] + m[6] * p[1] + m[10] * p[2] + m[14],
    m[3] * p[0] + m[7] * p[1] + m[11] * p[2] + m[15],
  ];
}

test('perspective matrix matches the standard form', () => {
  const p = M4.perspective(M4.create(), Math.PI / 4, 16 / 9, 1, 1000);
  assert.ok(Math.abs(p[0] - (1 / Math.tan(Math.PI / 8)) / (16 / 9)) < 1e-6);
  assert.ok(Math.abs(p[5] - 1 / Math.tan(Math.PI / 8)) < 1e-6);
  assert.strictEqual(p[11], -1);
});

test('lookAt puts the target straight down -Z with +Z as up', () => {
  // camera 10 m south of the origin, looking north, world Z up
  const v = M4.lookAt(M4.create(), [0, -10, 0], [0, 0, 0], [0, 0, 1]);
  const o = xf(v, [0, 0, 0]);
  assert.ok(Math.abs(o[0]) < 1e-6, 'origin centred horizontally');
  assert.ok(Math.abs(o[1]) < 1e-6, 'origin centred vertically');
  assert.ok(Math.abs(o[2] + 10) < 1e-6, 'origin 10 m in front');

  const up = xf(v, [0, 0, 5]);
  assert.ok(up[1] > 4.9, 'a point above the origin is up in view space');

  const right = xf(v, [5, 0, 0]);
  assert.ok(right[0] > 4.9, 'a point east of the origin is to the right');
});

test('near and far planes map to -1 and +1 in clip space', () => {
  const p = M4.perspective(M4.create(), Math.PI / 3, 1, 2, 500);
  const nearPt = xf(p, [0, 0, -2]);
  const farPt = xf(p, [0, 0, -500]);
  assert.ok(Math.abs(nearPt[2] / nearPt[3] + 1) < 1e-5);
  assert.ok(Math.abs(farPt[2] / farPt[3] - 1) < 1e-5);
});

test('frustum culling keeps what is visible and drops what is not', () => {
  const p = M4.perspective(M4.create(), Math.PI / 4, 16 / 9, 1, 1000);
  const v = M4.lookAt(M4.create(), [0, -100, 20], [0, 0, 0], [0, 0, 1]);
  const planes = frustumPlanes(M4.multiply(M4.create(), p, v));

  assert.ok(boxInFrustum(planes, -20, -20, 0, 20, 20, 40), 'box at the target');
  assert.ok(!boxInFrustum(planes, -20, -400, 0, 20, -380, 40), 'box behind the camera');
  assert.ok(!boxInFrustum(planes, 4000, -20, 0, 4040, 20, 40), 'box far off to the side');
  assert.ok(!boxInFrustum(planes, -20, 4000, 0, 20, 4040, 40), 'box beyond the far plane');
});

test('multiply composes in the expected order', () => {
  const a = M4.identity(M4.create());
  const b = M4.perspective(M4.create(), Math.PI / 4, 1, 1, 100);
  const r = M4.multiply(M4.create(), a, b);
  for (let i = 0; i < 16; i++) assert.ok(Math.abs(r[i] - b[i]) < 1e-9);
});
