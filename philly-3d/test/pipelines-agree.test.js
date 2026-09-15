'use strict';
// Two pipelines read the same survey and produce two worlds: the PHLCITY2
// binary the WebGL viewer streams, and the JSON district the Godot engine
// builds. Nothing checked that they still agreed about the same building.
//
// That gap cost real time. The viewer's floating-city bug was fixed while the
// identical bug sat undetected in the Godot export, because each pipeline was
// only ever tested against itself. These are the cross-checks.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const { loadViewer } = require('./harness');

const ROOT = path.join(__dirname, '..');
const D = (f) => path.join(ROOT, 'data', f);
const G = (f) => path.join(ROOT, 'godot', 'data', f);

const district = JSON.parse(fs.readFileSync(G('philadelphia_district.json'), 'utf8'));
const rows = JSON.parse(fs.readFileSync(G('philadelphia_buildings.json'), 'utf8')).buildings;
const landmarks = JSON.parse(fs.readFileSync(D('philly-landmarks.json'), 'utf8'));
const crowns = JSON.parse(fs.readFileSync(D('philly-crowns.json'), 'utf8')).crowns;

const FT = 0.3048;
const byId = new Map(landmarks.map((l) => [l.id, l]));

test('both pipelines give a building the same height', () => {
  let checked = 0;
  for (const r of rows) {
    if (r.crown) continue;
    const l = byId.get(r.id);
    if (!l) continue;            // not a named or tall building, no landmark row
    assert.ok(Math.abs(r.height - l.height_ft * FT) < 0.2,
      `${l.name || r.id}: Godot says ${r.height} m, the survey says ` +
      `${(l.height_ft * FT).toFixed(2)} m`);
    checked++;
  }
  assert.ok(checked > 40, `only ${checked} buildings were in both`);
});

test('both pipelines agree on the ground under a building', () => {
  // The Godot district is shifted onto the engine floor by a single datum. Undo
  // that and every base must come back to the surveyed base_elevation.
  const datum = district.ground_datum_m;
  let checked = 0;
  const errs = [];
  for (const r of rows) {
    if (r.crown) continue;
    const l = byId.get(r.id);
    if (!l) continue;
    errs.push((r.centre[1] + datum) - l.base_ft * FT);
    checked++;
  }
  assert.ok(checked > 40, `only ${checked} buildings were in both`);
  const worst = Math.max(...errs.map(Math.abs));
  assert.ok(worst < 0.2,
    `undoing the datum leaves ${worst.toFixed(2)} m of disagreement with the survey`);
});

test('both pipelines put the same crown on the same building', () => {
  const godotCrowns = rows.filter((r) => r.crown);
  const ids = new Set(godotCrowns.map((r) => r.id));
  const inWindow = crowns.filter((c) => ids.has(c.objectid));
  assert.ok(inWindow.length >= 4,
    `only ${inWindow.length} of the ${crowns.length} crowns reached the district`);

  const datum = district.ground_datum_m;
  for (const c of inWindow) {
    const tiers = godotCrowns.filter((r) => r.id === c.objectid);
    const top = tiers.reduce((hi, t) => Math.max(hi, t.centre[1] + t.height), -Infinity);
    const grade = byId.get(c.objectid).base_ft * FT;
    const reached = (top + datum - grade) / FT;
    assert.ok(Math.abs(reached - c.architectural_ft) < 0.5,
      `${c.name}: Godot reaches ${reached.toFixed(1)} ft above its grade, the ` +
      `table says ${c.architectural_ft}`);
  }
});

test('the viewer and the district place City Hall at the same point', () => {
  const ch = byId.get(489794);
  const bearing = district.grid_bearing_deg * Math.PI / 180;
  // the export rotates local ENU by the grid bearing, then maps to Godot
  const cx = district.centre_enu[0], cy = district.centre_enu[1];
  const ex = ch.x - cx, ey = ch.y - cy;
  const ax = ex * Math.cos(bearing) - ey * Math.sin(bearing);
  const ay = ex * Math.sin(bearing) + ey * Math.cos(bearing);
  const want = [ax, -ay];
  const got = district.landmarks.city_hall.position;
  assert.ok(Math.abs(got[0] - want[0]) < 0.6 && Math.abs(got[2] - want[1]) < 0.6,
    `district says [${got[0]}, ${got[2]}], the projection says ` +
    `[${want[0].toFixed(2)}, ${want[1].toFixed(2)}]`);
});

test('the terrain the viewer samples and the grid Godot lays down agree', () => {
  const ctx = loadViewer(['terrain.js']);
  const raw = fs.readFileSync(D('philly-terrain.bin'));
  const t = new ctx.Terrain(raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.length));
  t.decode(zlib.inflateSync(raw.subarray(t.payloadOffset)));

  const g = district.ground_grid;
  const [cx, cy] = district.centre_enu;
  const half = district.world_half;
  const datum = district.ground_datum_m;
  let worst = 0;
  for (let j = 0; j < g.cells; j++) {
    for (let i = 0; i < g.cells; i++) {
      const px = cx - half + (i + 0.5) * g.step_m;
      const py = cy - half + (j + 0.5) * g.step_m;
      worst = Math.max(worst, Math.abs((t.heightAt(px, py) - datum) - g.z[j][i]));
    }
  }
  assert.ok(worst < 0.02,
    `the Godot ground grid drifts ${worst.toFixed(3)} m from the terrain the ` +
    'viewer samples, so the two worlds are not the same shape');
});
