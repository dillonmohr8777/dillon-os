'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { loadViewer } = require('./harness');

const ctx = loadViewer(['sun.js']);
const { sunPosition, sunVector, shadowCeiling } = ctx;

test('sunset on 2026-09-06 is 19:22 EDT, matching published tables', () => {
  const p = sunPosition(new Date(Date.UTC(2026, 8, 6, 23, 22)));
  assert.ok(Math.abs(p.elevation) < 0.3, `elevation ${p.elevation}`);
});

test('solstice noon elevations match the known values for Philadelphia', () => {
  const summer = sunPosition(new Date(Date.UTC(2026, 5, 21, 17, 1)));
  assert.ok(Math.abs(summer.elevation - 73.5) < 0.3, `summer ${summer.elevation}`);
  assert.ok(Math.abs(summer.azimuth - 180) < 2, `summer az ${summer.azimuth}`);

  const winter = sunPosition(new Date(Date.UTC(2026, 11, 21, 17, 1)));
  assert.ok(Math.abs(winter.elevation - 26.6) < 0.3, `winter ${winter.elevation}`);
});

test('the Phillyhenge frame lands on the measured street bearing', () => {
  // Penn's grid runs 9.21 degrees off cardinal, measured from 285 street
  // centreline segments, so the aligned sunset azimuth is 279.21.
  const p = sunPosition(new Date(Date.UTC(2026, 7, 28, 23, 14)));
  assert.ok(Math.abs(p.azimuth - 279.21) < 0.1, `azimuth ${p.azimuth}`);
  assert.ok(p.elevation > 3 && p.elevation < 5, `elevation ${p.elevation}`);
});

test('sun vector points the right way for the cardinal azimuths', () => {
  const east = sunVector(10, 90);
  assert.ok(east[0] > 0.9 && Math.abs(east[1]) < 0.01);
  const west = sunVector(10, 270);
  assert.ok(west[0] < -0.9 && Math.abs(west[1]) < 0.01);
  const south = sunVector(10, 180);
  assert.ok(south[1] < -0.9 && Math.abs(south[0]) < 0.01);
  const north = sunVector(10, 0);
  assert.ok(north[1] > 0.9 && Math.abs(north[0]) < 0.01);
  assert.ok(Math.abs(north[2] - Math.sin(10 * Math.PI / 180)) < 1e-9);
});

test('a 100 m block at 45 degrees throws a 100 m shadow away from the sun', () => {
  const w = 81, h = 41, cell = 5;
  const height = new Float32Array(w * h);
  for (let r = 18; r < 23; r++) for (let c = 38; c < 43; c++) height[r * w + c] = 100;

  const ceil = shadowCeiling(height, w, h, cell, 45, 270);   // sun due west
  const row = 20;
  // The block occupies columns 38..42, so column 43 is the first shadowed
  // cell and the ceiling drops one cell-height (5 m at 45 degrees) per cell.
  assert.ok(Math.abs(ceil[row * w + 43] - 95) < 0.01, `col43 ${ceil[row * w + 43]}`);
  assert.ok(Math.abs(ceil[row * w + 44] - 90) < 0.01, `col44 ${ceil[row * w + 44]}`);
  assert.ok(Math.abs(ceil[row * w + 53] - 45) < 0.01, `col53 ${ceil[row * w + 53]}`);
  let len = 0;
  for (let i = 43; i < w; i++) if (ceil[row * w + i] > 0.5) len++;
  assert.ok(Math.abs(len * cell - 100) <= cell, `shadow length ${len * cell} m`);
  // and nothing falls toward the sun
  for (let i = 30; i < 38; i++) {
    assert.ok(ceil[row * w + i] < 0.5, `cell ${i} should be lit`);
  }
});

test('a lower sun throws a proportionally longer shadow', () => {
  const w = 200, h = 21, cell = 5;
  const height = new Float32Array(w * h);
  for (let r = 9; r < 12; r++) for (let c = 20; c < 23; c++) height[r * w + c] = 50;
  const measure = (elev) => {
    const ceil = shadowCeiling(height, w, h, cell, elev, 270);
    let len = 0;
    for (let i = 23; i < w; i++) if (ceil[10 * w + i] > 0.5) len++;
    return len * cell;
  };
  const at45 = measure(45), at26 = measure(26.565);   // tan 26.565 = 0.5
  assert.ok(Math.abs(at45 - 50) <= cell, `45 deg -> ${at45} m`);
  assert.ok(Math.abs(at26 - 100) <= 2 * cell, `26.6 deg -> ${at26} m`);
});
