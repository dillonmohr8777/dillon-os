'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const { loadViewer } = require('./harness');

const ctx = loadViewer(['phlbin.js', 'mesh.js']);
const { triangulateRing, buildTileMesh, VERTEX_FLOATS } = ctx;

function ringArea(x, y, s, c) {
  let a = 0;
  for (let i = 0; i < c; i++) {
    const j = (i + 1) % c;
    a += x[s + i] * y[s + j] - x[s + j] * y[s + i];
  }
  return Math.abs(a) / 2;
}

function triArea(ax, ay, bx, by, cx, cy) {
  return Math.abs((bx - ax) * (cy - ay) - (by - ay) * (cx - ax)) / 2;
}

test('triangulating a square gives 2 triangles covering its area', () => {
  const x = new Float32Array([0, 10, 10, 0]);
  const y = new Float32Array([0, 0, 10, 10]);
  let area = 0, tris = 0;
  const n = triangulateRing(x, y, 0, 4, (a, b, c) => {
    tris++; area += triArea(x[a], y[a], x[b], y[b], x[c], y[c]);
  });
  assert.strictEqual(n, 2);
  assert.strictEqual(tris, 2);
  assert.ok(Math.abs(area - 100) < 1e-4, `area ${area}`);
});

test('an L-shape triangulates without covering the notch', () => {
  // 40x60 L: a centroid fan would spill triangles into the missing corner
  const x = new Float32Array([0, 40, 40, 20, 20, 0]);
  const y = new Float32Array([0, 0, 20, 20, 60, 60]);
  const want = ringArea(x, y, 0, 6);
  let area = 0;
  const n = triangulateRing(x, y, 0, 6, (a, b, c) => {
    area += triArea(x[a], y[a], x[b], y[b], x[c], y[c]);
  });
  assert.strictEqual(n, 4, 'n-2 triangles for a 6-gon');
  assert.ok(Math.abs(area - want) < 1e-3,
    `triangulated area ${area} should equal ring area ${want}`);
});

test('a clockwise ring triangulates to the same area', () => {
  const x = new Float32Array([0, 0, 20, 20]);
  const y = new Float32Array([0, 20, 20, 0]);          // clockwise
  let area = 0;
  triangulateRing(x, y, 0, 4, (a, b, c) => {
    area += triArea(x[a], y[a], x[b], y[b], x[c], y[c]);
  });
  assert.ok(Math.abs(area - 400) < 1e-4, `area ${area}`);
});

test('a degenerate ring terminates instead of spinning', () => {
  const x = new Float32Array([0, 1, 2, 3]);            // all collinear
  const y = new Float32Array([0, 0, 0, 0]);
  const n = triangulateRing(x, y, 0, 4, () => {});
  assert.ok(n >= 0 && n <= 2);
});

test('a real tile builds a mesh with the expected vertex count', async () => {
  const f = fs.readFileSync(path.join(__dirname, '..', 'data', 'philly-buildings.bin'));
  const ab = f.buffer.slice(f.byteOffset, f.byteOffset + f.byteLength);
  const city = new ctx.PhlCity(ab, async (b) => new Uint8Array(zlib.inflateSync(Buffer.from(b))));
  const tile = await city.decode(0, 0);
  const mesh = buildTileMesh(tile, null);

  let expectVerts = 0;
  for (let i = 0; i < tile.n; i++) {
    expectVerts += tile.npts[i] * 6 + Math.max(0, tile.npts[i] - 2) * 3;
  }
  assert.strictEqual(mesh.data.length % VERTEX_FLOATS, 0);
  // ear clipping can bail on a degenerate ring, so allow at or below the cap
  assert.ok(mesh.vertexCount <= expectVerts, 'no more vertices than the cap');
  assert.ok(mesh.vertexCount > expectVerts * 0.99, 'essentially all rings triangulated');
  assert.ok(mesh.triCount > 0);

  // every vertex must sit inside the tile and at a physical height
  for (let i = 0; i < mesh.vertexCount; i++) {
    const z = mesh.data[i * VERTEX_FLOATS + 2];
    assert.ok(z >= -60 && z < 500, `z out of range: ${z}`);
  }
});

test('the height selector filters buildings', async () => {
  const f = fs.readFileSync(path.join(__dirname, '..', 'data', 'philly-buildings.bin'));
  const ab = f.buffer.slice(f.byteOffset, f.byteOffset + f.byteLength);
  const city = new ctx.PhlCity(ab, async (b) => new Uint8Array(zlib.inflateSync(Buffer.from(b))));
  const tile = await city.decode(0, 0);
  const all = buildTileMesh(tile, null);
  const tall = buildTileMesh(tile, (i) => tile.height[i] >= 40);
  assert.ok(tall.vertexCount < all.vertexCount);
  assert.ok(tall.vertexCount > 0, 'the City Hall tile has buildings over 40 m');
});

test('tint is deterministic and in range', () => {
  const a = ctx.tintFor(12345), b = ctx.tintFor(12345);
  assert.strictEqual(a, b);
  assert.ok(a >= 0 && a <= 1);
  assert.notStrictEqual(ctx.tintFor(1), ctx.tintFor(2));

  // The tint is packed alongside integer kind flags and used as a mix factor,
  // so it has to stay inside [0, 1]. It did not: ^= returns a signed int32.
  let lo = Infinity, hi = -Infinity;
  for (let id = 1; id < 200000; id++) {
    const t = ctx.tintFor(id);
    if (t < lo) lo = t;
    if (t > hi) hi = t;
  }
  assert.ok(lo >= 0, `tint went negative: ${lo}`);
  assert.ok(hi <= 1, `tint went over one: ${hi}`);
});
