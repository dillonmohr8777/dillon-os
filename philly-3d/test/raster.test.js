'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { loadViewer } = require('./harness');

const ctx = loadViewer(['gl.js']);
const { rasterizeHeights } = ctx;

// one building, given in the shape decode() produces
function tileOf(xs, ys, height, base = 0) {
  return {
    n: 1,
    starts: new Uint32Array([0]),
    npts: new Uint8Array([xs.length]),
    x: new Float32Array(xs),
    y: new Float32Array(ys),
    height: new Float32Array([height]),
    base: new Float32Array([base]),
  };
}

test('a square footprint fills exactly its own cells', () => {
  const w = 20, h = 20, cell = 1;
  const g = new Float32Array(w * h);
  rasterizeHeights(g, w, h, 0, 0, cell,
    [tileOf([5, 10, 10, 5], [5, 5, 10, 10], 30)]);
  let filled = 0;
  for (let i = 0; i < g.length; i++) if (g[i] > 0) filled++;
  assert.strictEqual(filled, 25, 'a 5x5 m square on a 1 m grid');
  assert.strictEqual(g[7 * w + 7], 30, 'interior carries the roof height');
  assert.strictEqual(g[2 * w + 2], 0, 'outside stays empty');
});

test('overlapping footprints keep the taller roof', () => {
  const w = 20, h = 20;
  const g = new Float32Array(w * h);
  rasterizeHeights(g, w, h, 0, 0, 1, [
    tileOf([4, 12, 12, 4], [4, 4, 12, 12], 20),
    tileOf([6, 10, 10, 6], [6, 6, 10, 10], 60),
  ]);
  assert.strictEqual(g[8 * w + 8], 60, 'the taller building wins');
  assert.strictEqual(g[5 * w + 5], 20, 'the shorter one still fills its area');
});

test('an L-shaped footprint leaves its notch empty', () => {
  const w = 30, h = 30;
  const g = new Float32Array(w * h);
  rasterizeHeights(g, w, h, 0, 0, 1,
    [tileOf([2, 20, 20, 10, 10, 2], [2, 2, 10, 10, 24, 24], 15)]);
  assert.strictEqual(g[5 * w + 5], 15, 'inside the foot of the L');
  assert.strictEqual(g[20 * w + 5], 15, 'inside the upright of the L');
  assert.strictEqual(g[20 * w + 15], 0, 'the notch is not filled');
});

test('base elevation is carried into the roof height', () => {
  const w = 12, h = 12;
  const g = new Float32Array(w * h);
  rasterizeHeights(g, w, h, 0, 0, 1,
    [tileOf([2, 8, 8, 2], [2, 2, 8, 8], 10, 25)]);
  assert.strictEqual(g[5 * w + 5], 35, 'roof is base plus height');
});

test('footprints outside the grid do not write out of bounds', () => {
  const w = 10, h = 10;
  const g = new Float32Array(w * h);
  rasterizeHeights(g, w, h, 0, 0, 1,
    [tileOf([-50, -40, -40, -50], [-50, -50, -40, -40], 30),
     tileOf([500, 520, 520, 500], [500, 500, 520, 520], 30)]);
  for (let i = 0; i < g.length; i++) assert.strictEqual(g[i], 0);
});
