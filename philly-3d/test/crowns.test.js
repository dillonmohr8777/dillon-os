'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { loadViewer } = require('./harness');

const ctx = loadViewer(['mesh.js', 'crowns.js']);
const { indexCrowns, buildCrownTile, ringCentroid, ringObb, buildTileMesh,
  VERTEX_FLOATS, SOLID_BIAS, ROOF_BIAS } = ctx;

const CROWNS = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'data', 'philly-crowns.json'), 'utf8'));
const LANDMARKS = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'data', 'philly-landmarks.json'), 'utf8'));

const FT = 0.3048;

// A minimal decoded-tile stand-in: two square buildings, ids 100 and 200.
function fakeTile(ids = [100, 200], heights = [51.816, 20]) {
  const sq = (cx, cy, r) => [cx - r, cy - r, cx + r, cy - r, cx + r, cy + r, cx - r, cy + r];
  const a = sq(0, 0, 50), b = sq(300, 0, 20);
  const x = new Float32Array(8), y = new Float32Array(8);
  for (let i = 0; i < 4; i++) { x[i] = a[i * 2]; y[i] = a[i * 2 + 1]; }
  for (let i = 0; i < 4; i++) { x[4 + i] = b[i * 2]; y[4 + i] = b[i * 2 + 1]; }
  return {
    n: 2, total: 8,
    starts: new Int32Array([0, 4]),
    npts: new Int32Array([4, 4]),
    x, y,
    base: new Float32Array([0, 0]),
    height: new Float32Array(heights),
    ids: new Int32Array(ids),
  };
}

test('the shipped crown table is well formed and every entry survives indexing', () => {
  assert.ok(Array.isArray(CROWNS.crowns) && CROWNS.crowns.length > 0);
  const byId = indexCrowns(CROWNS);
  assert.strictEqual(byId.size, CROWNS.crowns.length,
    'indexCrowns dropped an entry, so a crown is malformed');
  for (const c of CROWNS.crowns) {
    assert.ok(Number.isInteger(c.objectid), `${c.name} has no objectid`);
    assert.ok(c.source, `${c.name} has no source`);
    assert.ok(c.architectural_ft > c.mass_ft,
      `${c.name}: a crown that does not rise above the survey is not a crown`);
    const top = c.tiers[c.tiers.length - 1].to_ft;
    assert.strictEqual(top, c.architectural_ft,
      `${c.name}: top tier ${top} ft does not reach the published ${c.architectural_ft} ft`);
    assert.ok(c.tiers[0].to_ft > c.mass_ft,
      `${c.name}: first tier starts below the surveyed mass`);
  }
});

// The crown table and the built dataset record the same published heights.
// build_dataset.py reads the table, so a drift here means the shipped .bin was
// built before an edit and the two no longer agree.
test('every crown matches the building it names in the shipped dataset', () => {
  const byId = new Map(LANDMARKS.map((l) => [l.id, l]));
  for (const c of CROWNS.crowns) {
    const l = byId.get(c.objectid);
    assert.ok(l, `${c.name}: objectid ${c.objectid} is not in the dataset`);
    assert.strictEqual(l.name, c.name,
      `objectid ${c.objectid} is ${l.name}, not ${c.name}`);
    assert.strictEqual(l.height_ft, c.mass_ft,
      `${c.name}: the survey measures ${l.height_ft} ft, the table says ${c.mass_ft}`);
    assert.strictEqual(l.crown_ft, c.architectural_ft,
      `${c.name}: the dataset records ${l.crown_ft} ft, the table says ${c.architectural_ft}`);
  }
  // and nothing in the dataset claims a crown the table does not carry
  const named = new Set(CROWNS.crowns.map((c) => c.objectid));
  for (const l of LANDMARKS) {
    if (l.crown_ft != null) {
      assert.ok(named.has(l.id), `${l.name} has a crown height but no crown geometry`);
    }
  }
});

test('indexCrowns rejects a stack that widens or falls', () => {
  const widening = { crowns: [{ objectid: 1, tiers: [
    { frac: 0.3, to_ft: 300 }, { frac: 0.6, to_ft: 400 }] }] };
  assert.strictEqual(indexCrowns(widening).size, 0);
  const falling = { crowns: [{ objectid: 1, tiers: [
    { frac: 0.6, to_ft: 400 }, { frac: 0.3, to_ft: 300 }] }] };
  assert.strictEqual(indexCrowns(falling).size, 0);
  const empty = { crowns: [{ objectid: 1, tiers: [] }] };
  assert.strictEqual(indexCrowns(empty).size, 0);
});

test('a crown attaches only to its own objectid', () => {
  const byId = indexCrowns({ crowns: [{ objectid: 200, mass_ft: 65,
    tiers: [{ frac: 0.5, to_ft: 200, kind: 'tower' }] }] });
  const crowned = buildCrownTile(fakeTile(), byId);
  assert.strictEqual(crowned.n, 1);
  assert.strictEqual(crowned.ids[0], 200,
    'the crown landed on the wrong building');
  // building 200 is the 40 m square centred at (300, 0)
  let cx = 0;
  for (let k = 0; k < crowned.npts[0]; k++) cx += crowned.x[crowned.starts[0] + k];
  assert.ok(Math.abs(cx / 4 - 300) < 1e-3, `crown centred at ${cx / 4}`);
});

test('tiers stack from the surveyed top, narrowing as they rise', () => {
  const byId = indexCrowns({ crowns: [{ objectid: 100, mass_ft: 170,
    tiers: [
      { frac: 0.30, to_ft: 337, kind: 'tower' },
      { frac: 0.13, to_ft: 510, kind: 'spire' },
    ] }] });
  const t = fakeTile();
  const crowned = buildCrownTile(t, byId);
  assert.strictEqual(crowned.n, 2);

  // first tier starts exactly where the surveyed mass ends
  assert.ok(Math.abs(crowned.base[0] - (t.base[0] + t.height[0])) < 1e-4);
  const top0 = crowned.base[0] + crowned.height[0];
  assert.ok(Math.abs(top0 - (t.base[0] + 337 * FT)) < 1e-3, `tier 0 top ${top0}`);
  // second tier starts where the first ended: no gap, no overlap
  assert.ok(Math.abs(crowned.base[1] - top0) < 1e-4);
  const top1 = crowned.base[1] + crowned.height[1];
  assert.ok(Math.abs(top1 - (t.base[0] + 510 * FT)) < 1e-3, `tier 1 top ${top1}`);

  const span = (i) => {
    let lo = Infinity, hi = -Infinity;
    for (let k = 0; k < crowned.npts[i]; k++) {
      const v = crowned.x[crowned.starts[i] + k];
      if (v < lo) lo = v; if (v > hi) hi = v;
    }
    return hi - lo;
  };
  assert.ok(span(1) < span(0), 'the spire is not narrower than the tower');
  assert.ok(Math.abs(span(0) - 100 * 0.30) < 1e-3, `tower width ${span(0)}`);
});

test('a tier already below the surveyed top is dropped, not sunk into the mass', () => {
  // the survey already reads 120 m; a 200 ft (61 m) tier has nothing to add
  const byId = indexCrowns({ crowns: [{ objectid: 100,
    tiers: [{ frac: 0.5, to_ft: 200 }, { frac: 0.3, to_ft: 500 }] }] });
  const crowned = buildCrownTile(fakeTile([100, 200], [120, 20]), byId);
  assert.strictEqual(crowned.n, 1);
  assert.ok(crowned.base[0] >= 120);
});

test('no crowns means no crown tile at all', () => {
  assert.strictEqual(buildCrownTile(fakeTile(), new Map()), null);
  assert.strictEqual(buildCrownTile(fakeTile(), null), null);
});

test('solid tiers are flagged for the shader, framed ones are not', () => {
  const byId = indexCrowns({ crowns: [{ objectid: 100, tiers: [
    { frac: 0.5, to_ft: 300, kind: 'setback' },
    { frac: 0.2, to_ft: 500, kind: 'spire' },
  ] }] });
  const crowned = buildCrownTile(fakeTile(), byId);
  assert.deepStrictEqual([...crowned.solid], [0, 1]);

  const mesh = buildTileMesh(crowned, null);
  const kinds = new Set();
  for (let v = 0; v < mesh.vertexCount; v++) {
    kinds.add(Math.floor(mesh.data[v * VERTEX_FLOATS + 5] / 1000));
  }
  // setback walls 0, setback roof 1, spire walls 2, spire roof 3
  assert.deepStrictEqual([...kinds].sort(), [0, 1, 2, 3]);
});

// to_ft shares approx_hgt's datum: height above the building's own grade. The
// footprint also carries a base elevation, and City Hall sits 34.5 ft up. Drop
// that and every tier lands low and the whole crown is squashed.
test('tier heights are measured from the building grade, not from sea level', () => {
  const byId = indexCrowns({ crowns: [{ objectid: 100,
    tiers: [{ frac: 0.4, to_ft: 400, kind: 'tower' }] }] });
  const t = fakeTile();
  t.base[0] = 10.5;                       // 34.5 ft, City Hall's own grade
  const crowned = buildCrownTile(t, byId);
  const top = crowned.base[0] + crowned.height[0];
  assert.ok(Math.abs(top - (10.5 + 400 * FT)) < 1e-3,
    `tier top ${top} m; ignoring the 10.5 m grade would give ${400 * FT}`);
});

test('a crown tile meshes like any other tile, so shadows and draw need no special case', () => {
  const byId = indexCrowns(CROWNS);
  // City Hall as the dataset holds it: 170 ft of masonry on a 34.5 ft grade
  const t = fakeTile([489794, 200], [170 * FT, 20]);
  t.base[0] = 34.5 * FT;
  const crowned = buildCrownTile(t, byId);
  assert.strictEqual(crowned.n, 4, 'City Hall should contribute four tiers');
  const mesh = buildTileMesh(crowned, null);
  assert.ok(mesh.triCount > 0);
  assert.strictEqual(mesh.vertexCount * VERTEX_FLOATS, mesh.data.length);

  let hi = 0;
  for (let v = 0; v < mesh.vertexCount; v++) {
    hi = Math.max(hi, mesh.data[v * VERTEX_FLOATS + 2]);
  }
  const aboveGrade = hi / FT - 34.5;
  assert.ok(Math.abs(aboveGrade - 548) < 0.05,
    `City Hall tops out at ${aboveGrade.toFixed(1)} ft above its grade, not 548`);

  // every crown vertex carries the mass height for material and its own tier
  // top for the cornice: the two must not be the same number
  let sawSplit = false;
  for (let v = 0; v < mesh.vertexCount; v++) {
    const h = mesh.data[v * VERTEX_FLOATS + 3];
    const top = mesh.data[v * VERTEX_FLOATS + 4];
    if (Math.abs(h - top) > 1) sawSplit = true;
  }
  assert.ok(sawSplit, 'shading height and cornice top collapsed into one value');
});

test('the area centroid, not the vertex mean, anchors an L-shaped footprint', () => {
  // vertex mean of this L is pulled toward the crowded corner; the area
  // centroid is not. A tower hung off the vertex mean leans off its building.
  const x = new Float32Array([0, 60, 60, 20, 20, 0]);
  const y = new Float32Array([0, 0, 20, 20, 60, 60]);
  const [cx, cy] = ringCentroid(x, y, 0, 6);
  assert.ok(cx > 0 && cx < 60 && cy > 0 && cy < 60);
  let mx = 0, my = 0;
  for (let k = 0; k < 6; k++) { mx += x[k]; my += y[k]; }
  assert.ok(Math.abs(cx - mx / 6) > 1e-3 || Math.abs(cy - my / 6) > 1e-3);
});

test('a square tier sits on the block axes, not on east and north', () => {
  // a 100 x 40 rectangle rotated 30 degrees, which is what a Philadelphia
  // block looks like: Penn's grid is nine degrees off cardinal
  const a = Math.PI / 6, ca = Math.cos(a), sa = Math.sin(a);
  const corners = [[-50, -20], [50, -20], [50, 20], [-50, 20]];
  const x = new Float32Array(4), y = new Float32Array(4);
  for (let k = 0; k < 4; k++) {
    x[k] = corners[k][0] * ca - corners[k][1] * sa;
    y[k] = corners[k][0] * sa + corners[k][1] * ca;
  }
  const box = ringObb(x, y, 0, 4);
  assert.ok(Math.abs(Math.max(box.w, box.d) - 100) < 1e-3, `span ${box.w} x ${box.d}`);
  assert.ok(Math.abs(Math.min(box.w, box.d) - 40) < 1e-3);

  const tile = {
    n: 1, total: 4, starts: new Int32Array([0]), npts: new Int32Array([4]),
    x, y, base: new Float32Array([0]), height: new Float32Array([30]),
    ids: new Int32Array([7]),
  };
  const byId = indexCrowns({ crowns: [{ objectid: 7, tiers: [
    { frac: 0.5, to_ft: 300, kind: 'tower', shape: 'square' }] }] });
  const c = buildCrownTile(tile, byId);
  assert.strictEqual(c.npts[0], 4, 'a square tier is four points whatever the footprint was');
  const sq = ringObb(c.x, c.y, 0, 4);
  // side is frac x the SHORTER span: 0.5 x 40
  assert.ok(Math.abs(sq.w - 20) < 1e-3 && Math.abs(sq.d - 20) < 1e-3,
    `tier is ${sq.w} x ${sq.d}, not square`);
  // and it is turned onto the block's axes, not left cardinal
  const turn = Math.abs(((sq.ang - box.ang) % (Math.PI / 2) + Math.PI) % (Math.PI / 2));
  assert.ok(turn < 1e-3 || Math.abs(turn - Math.PI / 2) < 1e-3,
    `tier is ${(turn * 180 / Math.PI).toFixed(2)} deg off the block`);
});

test("City Hall's tower is squared to its block and reads at the right width", () => {
  const ch = CROWNS.crowns.find((c) => c.name === 'City Hall');
  assert.ok(ch, 'City Hall is missing from the crown table');
  for (const t of ch.tiers) {
    assert.strictEqual(t.shape, 'square',
      `${t.kind}: the surveyed footprint is the whole block, so a scaled outline ` +
      'would put the tower around the courtyard');
  }
  // the block measures about 152 x 148 m; the tower should read near 30 m
  const side = ch.tiers[0].frac * 148.2;
  assert.ok(side > 24 && side < 36, `tower would be ${side.toFixed(1)} m across`);
});
