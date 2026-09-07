'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const { loadViewer } = require('./harness');

const ctx = loadViewer(['phlbin.js']);
const BIN = path.join(__dirname, '..', 'data', 'philly-buildings.bin');
const inflate = async (b) => new Uint8Array(zlib.inflateSync(Buffer.from(b)));

function city() {
  const f = fs.readFileSync(BIN);
  const ab = f.buffer.slice(f.byteOffset, f.byteOffset + f.byteLength);
  return new ctx.PhlCity(ab, inflate);
}

test('header matches the manifest the build wrote', () => {
  const c = city();
  const m = JSON.parse(fs.readFileSync(
    path.join(__dirname, '..', 'data', 'manifest.json'), 'utf8'));
  assert.strictEqual(c.version, 3);
  assert.strictEqual(c.buildingCount, m.counts.buildings_written);
  assert.strictEqual(c.tileCount, m.counts.tiles);
  assert.strictEqual(c.tiles.size, m.counts.tiles);
  assert.ok(Math.abs(c.originLat - m.projection.origin_lat) < 1e-9);
  assert.ok(Math.abs(c.originLon - m.projection.origin_lon) < 1e-9);
  assert.strictEqual(c.tileSize, m.processing.tile_size_m);
  assert.ok(Math.abs(c.quant - m.processing.quant_m) < 1e-9);
});

test('tile counts in the index sum to the header count', () => {
  const c = city();
  let sum = 0;
  for (const t of c.tiles.values()) sum += t.count;
  assert.strictEqual(sum, c.buildingCount);
});

test('the City Hall tile decodes to real coordinates', async () => {
  const c = city();
  const t = await c.decode(0, 0);
  assert.ok(t, 'tile (0,0) exists');
  assert.strictEqual(t.n, c.tiles.get('0,0').count);
  assert.strictEqual(t.total, t.starts[t.n - 1] + t.npts[t.n - 1]);

  // every point must land inside the tile plus the documented overhang slack
  let minx = Infinity, maxx = -Infinity, miny = Infinity, maxy = -Infinity;
  for (let i = 0; i < t.total; i++) {
    if (t.x[i] < minx) minx = t.x[i];
    if (t.x[i] > maxx) maxx = t.x[i];
    if (t.y[i] < miny) miny = t.y[i];
    if (t.y[i] > maxy) maxy = t.y[i];
  }
  assert.ok(minx > -600 && maxx < 1700, `x range ${minx}..${maxx}`);
  assert.ok(miny > -600 && maxy < 1700, `y range ${miny}..${maxy}`);

  // rings must be closeable: at least 3 points, and not degenerate
  for (let i = 0; i < t.n; i++) assert.ok(t.npts[i] >= 3);

  // heights are physical
  for (let i = 0; i < t.n; i++) {
    assert.ok(t.height[i] > 0 && t.height[i] < 400, `height ${t.height[i]}`);
  }

  // roof is 0 (flat) or a bounded generated cap, never negative or absurd
  let roofed = 0;
  for (let i = 0; i < t.n; i++) {
    assert.ok(t.roof[i] >= 0 && t.roof[i] <= 31, `roof ${t.roof[i]}`);
    if (t.roof[i] > 0) roofed++;
  }
  assert.ok(roofed > 0, 'the City Hall tile has at least one roofed building');
});

test('decoded geometry matches an independent Python decode', async () => {
  // Fixture written by tools/dump_tile_fixture.py so the JS reader is checked
  // against the packer rather than against itself.
  const fx = path.join(__dirname, 'fixtures', 'tile-0-0.json');
  if (!fs.existsSync(fx)) { test.skip('fixture not generated'); return; }
  const want = JSON.parse(fs.readFileSync(fx, 'utf8'));
  const c = city();
  const t = await c.decode(0, 0);
  assert.strictEqual(t.n, want.n);
  let worst = 0;
  for (let i = 0; i < want.sample.length; i++) {
    const s = want.sample[i];
    const idx = t.starts[s.i];
    worst = Math.max(worst,
      Math.abs(t.x[idx] - s.x), Math.abs(t.y[idx] - s.y),
      Math.abs(t.height[s.i] - s.h),
      Math.abs(t.roof[s.i] - (s.r ?? 0)));
  }
  assert.ok(worst < 1e-3, `worst disagreement ${worst}`);
});

test('an unknown tile decodes to null rather than throwing', async () => {
  const c = city();
  assert.strictEqual(await c.decode(9999, 9999), null);
});
