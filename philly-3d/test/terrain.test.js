'use strict';
// The terrain is the ground the whole city stands on, and it is derived from
// the survey's own base_elevation field rather than a second dataset. These
// tests hold the two things that can silently go wrong: the height field not
// agreeing with the building bases it came from, and the JS lookup not
// agreeing with the GLSL one, which would leave the player standing at a
// different height from the ground drawn under them.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const { loadViewer } = require('./harness');

const ctx = loadViewer(['terrain.js']);
const { Terrain } = ctx;

const BIN = path.join(__dirname, '..', 'data', 'philly-terrain.bin');
const raw = fs.readFileSync(BIN);
const terrain = new Terrain(raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.length));
terrain.decode(zlib.inflateSync(raw.subarray(terrain.payloadOffset)));

const FT = 0.3048;

test('the header describes a grid that covers Philadelphia', () => {
  assert.ok(terrain.nx > 400 && terrain.ny > 400, `grid ${terrain.nx}x${terrain.ny}`);
  const km = (n) => n * terrain.cell / 1000;
  assert.ok(km(terrain.nx) > 25 && km(terrain.nx) < 40, `${km(terrain.nx)} km wide`);
  assert.ok(km(terrain.ny) > 25 && km(terrain.ny) < 40, `${km(terrain.ny)} km tall`);
  // the origin is City Hall, so the grid must straddle it
  assert.ok(terrain.x0 < 0 && terrain.y0 < 0);
  assert.ok(terrain.x0 + terrain.nx * terrain.cell > 0);
  assert.ok(terrain.y0 + terrain.ny * terrain.cell > 0);
});

test('the elevations are physically possible for this city', () => {
  // Philadelphia runs from tidal river level to about 440 ft in Chestnut Hill.
  assert.ok(terrain.min > -10 && terrain.min < 5,
    `lowest ground ${terrain.min} m`);
  assert.ok(terrain.max > 90 && terrain.max < 180,
    `highest ground ${terrain.max} m = ${(terrain.max / FT).toFixed(0)} ft`);
});

test('the ground under City Hall matches the survey', () => {
  // philly-landmarks.json records City Hall's own base_elevation as 34.5 ft.
  const landmarks = JSON.parse(fs.readFileSync(
    path.join(__dirname, '..', 'data', 'philly-landmarks.json'), 'utf8'));
  const ch = landmarks.find((l) => l.id === 489794);
  assert.ok(ch, 'City Hall is missing from the landmark table');
  const here = terrain.heightAt(ch.x, ch.y);
  assert.ok(Math.abs(here - ch.base_ft * FT) < 3,
    `terrain says ${here.toFixed(1)} m, the survey says ${(ch.base_ft * FT).toFixed(1)} m`);
});

test('the height field agrees with the base elevations it was built from', () => {
  // The real test of the whole idea: sample the terrain at 400 landmarks and
  // compare it to each building's own recorded base. A systematic offset here
  // would put the entire city above or below its own ground.
  const landmarks = JSON.parse(fs.readFileSync(
    path.join(__dirname, '..', 'data', 'philly-landmarks.json'), 'utf8'));
  const errs = [];
  for (let i = 0; i < landmarks.length; i += Math.ceil(landmarks.length / 400)) {
    const l = landmarks[i];
    if (typeof l.base_ft !== 'number' || typeof l.x !== 'number') continue;
    errs.push(terrain.heightAt(l.x, l.y) - l.base_ft * FT);
  }
  assert.ok(errs.length > 200, `only ${errs.length} samples`);
  const mean = errs.reduce((a, b) => a + b, 0) / errs.length;
  errs.sort((a, b) => Math.abs(a) - Math.abs(b));
  const p90 = Math.abs(errs[Math.floor(errs.length * 0.9)]);
  assert.ok(Math.abs(mean) < 0.6,
    `systematic offset of ${mean.toFixed(2)} m between terrain and building bases`);
  assert.ok(p90 < 6, `p90 disagreement ${p90.toFixed(2)} m is too large`);
});

test('the JS lookup uses the same fade curve as the shader', () => {
  // The GLSL applies Perlin's fade to the interpolant. If the JS did plain
  // bilinear the player would float or sink relative to the drawn ground on
  // every slope, worst at the middle of a cell.
  const src = fs.readFileSync(
    path.join(__dirname, '..', 'viewer', 'js', 'terrain.js'), 'utf8');
  assert.ok(/rx \* rx \* \(3 - 2 \* rx\)/.test(src), 'JS is missing the fade curve');
  const glsl = fs.readFileSync(
    path.join(__dirname, '..', 'viewer', 'js', 'shaders.js'), 'utf8');
  assert.ok(/raw \* raw \* \(3\.0 - 2\.0 \* raw\)/.test(glsl),
    'GLSL is missing the fade curve');

  // and reproduce one interpolation by hand against the raw grid
  const { nx, x0, y0, cell, heights } = terrain;
  const gx = 300, gy = 300;
  const x = x0 + (gx + 0.5 + 0.37) * cell;
  const y = y0 + (gy + 0.5 + 0.62) * cell;
  const fade = (t) => t * t * (3 - 2 * t);
  const fx = fade(0.37), fy = fade(0.62);
  const at = (i, j) => heights[j * nx + i];
  const want = (at(gx, gy) + (at(gx + 1, gy) - at(gx, gy)) * fx) * (1 - fy) +
               (at(gx, gy + 1) + (at(gx + 1, gy + 1) - at(gx, gy + 1)) * fx) * fy;
  assert.ok(Math.abs(terrain.heightAt(x, y) - want) < 1e-4,
    `heightAt ${terrain.heightAt(x, y)} vs ${want}`);
});

test('the lookup is defined outside the grid instead of returning garbage', () => {
  for (const [x, y] of [[-1e6, 0], [1e6, 0], [0, -1e6], [0, 1e6], [1e6, 1e6]]) {
    const h = terrain.heightAt(x, y);
    assert.ok(Number.isFinite(h) && h >= terrain.min - 1e-3 && h <= terrain.max + 1e-3,
      `heightAt(${x}, ${y}) = ${h}`);
  }
});

test('a bad magic is rejected rather than decoded as noise', () => {
  const bad = new Uint8Array(64);
  assert.throws(() => new Terrain(bad.buffer), /magic/);
});
