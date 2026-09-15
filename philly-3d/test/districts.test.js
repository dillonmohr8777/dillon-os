'use strict';
// Four districts are exported, each a window on the same survey. These are the
// invariants that must hold for all of them, as opposed to the Centre City
// specifics in godot-export.test.js.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const DIR = path.join(__dirname, '..', 'godot', 'data');
const SLUGS = ['philadelphia', 'market_east', 'south_philly', 'fishtown'];

const load = (slug) => ({
  slug,
  district: JSON.parse(fs.readFileSync(path.join(DIR, `${slug}_district.json`), 'utf8')),
  rows: JSON.parse(fs.readFileSync(path.join(DIR, `${slug}_buildings.json`), 'utf8')).buildings,
});
const all = SLUGS.map(load);

test('all four districts exported and none is truncated', () => {
  for (const { slug, district, rows } of all) {
    assert.ok(rows.length > 300, `${slug} has only ${rows.length} rows`);
    // load_buildings caps at MAX_BUILDINGS by keeping the TALLEST, which in a
    // rowhouse district deletes the rowhouses. Hitting the cap is a bug.
    assert.ok(rows.length < 4000,
      `${slug} hit the building cap at ${rows.length}, so its fabric is truncated`);
    assert.strictEqual(district.name, slug);
    assert.ok(district.label && district.label.length > 3);
  }
});

test('each district measured its own grid bearing, not Centre City\'s', () => {
  const bearings = all.map((d) => d.district.grid_bearing_deg);
  for (const { slug, district } of all) {
    assert.ok(Number.isFinite(district.grid_bearing_deg));
    assert.ok(Math.abs(district.grid_bearing_deg) < 45,
      `${slug}: a grid bearing of ${district.grid_bearing_deg} is not in (-45, 45]`);
    assert.ok(district.grid_strength > 0.3 && district.grid_strength <= 1,
      `${slug}: grid strength ${district.grid_strength}`);
  }
  // and they are genuinely not all the same number
  assert.ok(Math.max(...bearings) - Math.min(...bearings) > 0.5,
    'every district got the same bearing, so nothing was measured per district');
});

test('Centre City still agrees with the published 9.21 degrees', () => {
  // docs/SOURCES.md derives 9.21 from Market, Arch, Chestnut, Spruce, Walnut and
  // Broad specifically. This estimator uses every footprint in the window, so it
  // should land close without being expected to match exactly.
  const cc = all.find((d) => d.slug === 'philadelphia').district;
  assert.ok(Math.abs(cc.grid_bearing_deg - 9.21) < 0.5,
    `Centre City measured ${cc.grid_bearing_deg}, published is 9.21`);
  assert.ok(cc.grid_strength > 0.9, `Centre City grid strength ${cc.grid_strength}`);
});

test('Fishtown is honestly reported as barely having a grid', () => {
  // Frankford Avenue is an old turnpike and the blocks are built off it. Half
  // the district is not square to anything, and the export says so rather than
  // pretending a bearing fits.
  const f = all.find((d) => d.slug === 'fishtown').district;
  assert.ok(f.grid_strength < 0.7,
    `Fishtown reports a grid strength of ${f.grid_strength}, which is too ` +
    'confident for a district built off a diagonal turnpike');
  assert.ok(f.grid_strength_note && /no single grid/.test(f.grid_strength_note),
    'the low strength is not explained in the export');
});

test('every district sits on the engine floor and carries its ground', () => {
  for (const { slug, district, rows } of all) {
    assert.ok(district.ground_datum_m > 0.5, `${slug} datum ${district.ground_datum_m}`);
    const ys = rows.filter((r) => !r.crown).map((r) => r.centre[1]).sort((a, b) => a - b);
    const median = ys[Math.floor(ys.length / 2)];
    assert.ok(Math.abs(median) < 1.5, `${slug} floats at ${median.toFixed(1)} m`);
    const g = district.ground_grid;
    assert.ok(g && g.z.length === g.cells, `${slug} has no ground grid`);
    assert.ok(Math.abs(g.cells * g.step_m - district.world_half * 2) < 1,
      `${slug} ground grid does not span the district`);
  }
});

test('each district holds a real cluster of the Philadelphia 25', () => {
  const want = { philadelphia: 2, market_east: 2, south_philly: 5, fishtown: 5 };
  for (const { slug, district } of all) {
    const sites = Object.values(district.landmarks)
      .filter((l) => typeof l.site === 'string' && l.site.endsWith('index.html'));
    assert.ok(sites.length >= want[slug],
      `${slug} holds ${sites.length} prospects, expected at least ${want[slug]}`);
  }
});
