'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const { loadViewer } = require('./harness');

const ctx = loadViewer(['phlbin.js', 'collision.js']);
const { Collider } = ctx;

// one square building, in the shape decode() produces
function squareTile(cx, cy, half) {
  return {
    tx: 0, ty: 0, n: 1,
    starts: new Uint32Array([0]),
    npts: new Uint8Array([4]),
    x: new Float32Array([cx - half, cx + half, cx + half, cx - half]),
    y: new Float32Array([cy - half, cy - half, cy + half, cy + half]),
  };
}

test('a footprint indexes one segment per edge', () => {
  const c = new Collider();
  const added = c.addTile(squareTile(0, 0, 10));
  assert.strictEqual(added, 4);
  assert.strictEqual(c.segmentCount(), 4);
});

test('the same tile is not indexed twice', () => {
  const c = new Collider();
  const t = squareTile(0, 0, 10);
  c.addTile(t);
  assert.strictEqual(c.addTile(t), 0);
  assert.strictEqual(c.segmentCount(), 4);
});

test('walking into a wall is stopped at the radius', () => {
  const c = new Collider();
  c.addTile(squareTile(0, 0, 10));           // wall face at y = -10
  const r = 0.4;
  const out = c.resolve(0, -9.8, r);          // 0.2 m inside the wall
  assert.ok(out.hit, 'collision detected');
  assert.ok(out.y <= -10 - r + 1e-3,
    `pushed clear of the wall, got y=${out.y}`);
});

test('open street is left untouched', () => {
  const c = new Collider();
  c.addTile(squareTile(0, 0, 10));
  const out = c.resolve(40, 40, 0.4);
  assert.ok(!out.hit);
  assert.strictEqual(out.x, 40);
  assert.strictEqual(out.y, 40);
});

test('an inside corner resolves instead of oscillating', () => {
  const c = new Collider();
  // two buildings forming a corner at the origin
  c.addTile(squareTile(-15, 0, 10));
  c.addTile({ ...squareTile(0, -15, 10), tx: 1 });
  const out = c.resolve(-5.2, -5.2, 0.5);
  assert.ok(Number.isFinite(out.x) && Number.isFinite(out.y));
  // and it must end outside both footprints
  const inA = out.x > -25 && out.x < -5 && out.y > -10 && out.y < 10;
  const inB = out.x > -10 && out.x < 10 && out.y > -25 && out.y < -5;
  assert.ok(!inA && !inB, `ended inside a building at ${out.x},${out.y}`);
});

test('sliding along a wall keeps the parallel component', () => {
  const c = new Collider();
  c.addTile(squareTile(0, 0, 10));            // wall face at y = -10
  // running north-east into the south face: north is blocked, east is free
  const out = c.move(0, -10.5, 2, 2, 0.4);
  assert.ok(out.hit, 'the wall was hit');
  assert.ok(out.x > 1.0, `slid east along the wall, got x=${out.x}`);
  assert.ok(out.y <= -10.4 + 1e-3, `did not enter the building, y=${out.y}`);
});

test('an unobstructed move is exact', () => {
  const c = new Collider();
  c.addTile(squareTile(0, 0, 10));
  const out = c.move(50, 50, 1.5, -2.5, 0.4);
  assert.strictEqual(out.x, 51.5);
  assert.strictEqual(out.y, 47.5);
  assert.ok(!out.hit);
});

test('real Center City footprints index and block', async () => {
  const f = fs.readFileSync(path.join(__dirname, '..', 'data', 'philly-buildings.bin'));
  const ab = f.buffer.slice(f.byteOffset, f.byteOffset + f.byteLength);
  const city = new ctx.PhlCity(ab, async (b) => new Uint8Array(zlib.inflateSync(Buffer.from(b))));
  const tile = await city.decode(0, 0);
  const c = new Collider();
  const added = c.addTile(tile);

  let edges = 0;
  for (let i = 0; i < tile.n; i++) edges += tile.npts[i];
  assert.strictEqual(added, edges, 'every footprint edge indexed');
  assert.ok(c.cells.size > 100, `spatial hash populated: ${c.cells.size} cells`);

  // walk a line across the tile and confirm we are blocked somewhere: the
  // City Hall tile is dense, a straight 1 km line cannot be clear
  let blocked = 0;
  for (let s = 0; s < 400; s++) {
    const px = 20 + s * 2.4, py = 500;
    if (c.resolve(px, py, 0.45).hit) blocked++;
  }
  assert.ok(blocked > 0, 'a line across Center City hits buildings');
  assert.ok(blocked < 400, 'and is not blocked everywhere - streets exist');
});

test('a long step cannot tunnel through a wall', () => {
  const c = new Collider();
  c.addTile(squareTile(0, 0, 10));
  // 40 m step straight through the building, far longer than the radius
  const out = c.move(0, -30, 0, 60, 0.4);
  assert.ok(out.hit, 'the wall was hit');
  assert.ok(out.y < -10, `stopped before the south wall, got y=${out.y}`);
  assert.ok(!c.inside(out.x, out.y), 'and did not end up inside');
});

test('inside reports containment correctly', () => {
  const c = new Collider();
  c.addTile(squareTile(0, 0, 10));
  assert.ok(c.inside(0, 0), 'centre is inside');
  assert.ok(c.inside(9, -9), 'near a corner is inside');
  assert.ok(!c.inside(40, 0), 'east of the building is outside');
  assert.ok(!c.inside(-40, 0), 'west of the building is outside');
  assert.ok(!c.inside(0, 40), 'north of the building is outside');
});

test('inside is not fooled by a second building further along the ray', () => {
  const c = new Collider();
  c.addTile(squareTile(0, 0, 10));
  c.addTile({ ...squareTile(200, 0, 10), tx: 9 });
  assert.ok(!c.inside(-40, 0), 'two buildings east still reads as outside');
  assert.ok(c.inside(0, 0), 'inside the first is still inside');
  assert.ok(!c.inside(100, 0), 'the gap between them is outside');
});

test('unstick walks a trapped player out to the street', () => {
  const c = new Collider();
  c.addTile(squareTile(0, 0, 30));            // a big block, player in the middle
  const out = c.unstick(0, 0, 0.5);
  assert.ok(out.moved, 'the player was moved');
  assert.ok(!c.resolve(out.x, out.y, 0.5).hit, 'and ended somewhere clear');
});

test('unstick leaves an already-clear position alone', () => {
  const c = new Collider();
  c.addTile(squareTile(0, 0, 10));
  const out = c.unstick(60, 60, 0.5);
  assert.strictEqual(out.moved, false);
  assert.strictEqual(out.x, 60);
});

test('resolve terminates on a pathological cluster', () => {
  const c = new Collider();
  for (let i = 0; i < 40; i++) c.addTile({ ...squareTile(i * 0.5, 0, 6), tx: i });
  const out = c.resolve(0, 0, 0.5);
  assert.ok(Number.isFinite(out.x) && Number.isFinite(out.y));
});
