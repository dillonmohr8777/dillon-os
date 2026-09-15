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

test('invert round-trips a view-projection matrix', () => {
  const p = M4.perspective(M4.create(), Math.PI / 3, 16 / 9, 1, 20000);
  const v = M4.lookAt(M4.create(), [1200, -900, 400], [0, 0, 30], [0, 0, 1]);
  const vp = M4.multiply(M4.create(), p, v);
  const inv = M4.invert(M4.create(), vp);
  assert.ok(inv, 'matrix is invertible');
  const id = M4.multiply(M4.create(), vp, inv);
  for (let i = 0; i < 16; i++) {
    const want = i % 5 === 0 ? 1 : 0;
    assert.ok(Math.abs(id[i] - want) < 1e-4, `identity[${i}] = ${id[i]}`);
  }
});

test('the inverse turns a screen position back into a view ray', () => {
  // This is what puts the sky horizon in the right place.
  const eye = [0, -1000, 300];
  const p = M4.perspective(M4.create(), Math.PI / 3, 1, 1, 20000);
  const v = M4.lookAt(M4.create(), eye, [0, 0, 300], [0, 0, 1]);
  const inv = M4.invert(M4.create(), M4.multiply(M4.create(), p, v));
  const unproject = (nx, ny) => {
    const w = inv[3] * nx + inv[7] * ny + inv[11] + inv[15];
    const x = (inv[0] * nx + inv[4] * ny + inv[8] + inv[12]) / w - eye[0];
    const y = (inv[1] * nx + inv[5] * ny + inv[9] + inv[13]) / w - eye[1];
    const z = (inv[2] * nx + inv[6] * ny + inv[10] + inv[14]) / w - eye[2];
    const l = Math.hypot(x, y, z);
    return [x / l, y / l, z / l];
  };
  const centre = unproject(0, 0);
  assert.ok(centre[1] > 0.99, 'screen centre looks due north');
  assert.ok(Math.abs(centre[2]) < 0.02, 'and level, since the camera is level');
  const top = unproject(0, 1);
  assert.ok(top[2] > 0.4, 'the top of the screen looks upward');
  const bottom = unproject(0, -1);
  assert.ok(bottom[2] < -0.4, 'the bottom looks downward');
});

test('invert reports failure on a singular matrix', () => {
  const zero = M4.create();
  assert.strictEqual(M4.invert(M4.create(), zero), null);
});
