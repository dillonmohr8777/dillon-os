// Crowns: the part of the skyline the LiDAR survey cannot see.
//
// LI_BUILDING_FOOTPRINTS.approx_hgt is derived from a LiDAR point cloud, so it
// measures the dominant roof mass. A tower, spire or mast that is too slender
// returns too few returns to register: City Hall comes back as its 170 ft
// cornice, not its 548 ft tower.
//
// A crown is NOT a correction to that measurement. The surveyed mass is still
// drawn exactly as surveyed. The crown is separately sourced geometry stacked
// on top of it, from data/philly-crowns.json, attached by objectid so it can
// never bind to the wrong building.
//
// The tiers are a silhouette approximation: each is the parent footprint scaled
// uniformly about its own centroid. Tier placement is centroid-based, not a
// survey of where the tower actually stands on the block.
'use strict';

const FT_TO_M = 0.3048;

// Tiers whose material is masonry, stone or metal rather than floors of
// offices. These get no window grid: a spire with windows looks wrong in a way
// a plain shaft does not.
const SOLID_KINDS = new Set(['spire', 'mast', 'statue', 'finial', 'belfry']);

// Oriented bounding box of a ring: centre, the two spans, and the angle of its
// longest edge. Philadelphia's blocks sit on Penn's grid, nine degrees off
// cardinal, so a tier squared to the ring's own axes lands square on the block;
// one squared to east/north lands askew on it.
function ringObb(x, y, s, c) {
  let bestLen = -1, ang = 0;
  for (let k = 0; k < c; k++) {
    const j = (k + 1) % c;
    const dx = x[s + j] - x[s + k], dy = y[s + j] - y[s + k];
    const L = Math.hypot(dx, dy);
    if (L > bestLen) { bestLen = L; ang = Math.atan2(dy, dx); }
  }
  const ca = Math.cos(-ang), sa = Math.sin(-ang);
  let lox = Infinity, hix = -Infinity, loy = Infinity, hiy = -Infinity;
  for (let k = 0; k < c; k++) {
    const px = x[s + k] * ca - y[s + k] * sa;
    const py = x[s + k] * sa + y[s + k] * ca;
    if (px < lox) lox = px; if (px > hix) hix = px;
    if (py < loy) loy = py; if (py > hiy) hiy = py;
  }
  const mx = (lox + hix) / 2, my = (loy + hiy) / 2;
  return {
    cx: mx * Math.cos(ang) - my * Math.sin(ang),
    cy: mx * Math.sin(ang) + my * Math.cos(ang),
    w: hix - lox, d: hiy - loy, ang,
  };
}

// Area centroid of a ring, falling back to the vertex mean when the ring is
// degenerate (zero area happens on collapsed footprints in the source).
function ringCentroid(x, y, s, c) {
  let a2 = 0, cx = 0, cy = 0;
  for (let k = 0; k < c; k++) {
    const j = (k + 1) % c;
    const cr = x[s + k] * y[s + j] - x[s + j] * y[s + k];
    a2 += cr;
    cx += (x[s + k] + x[s + j]) * cr;
    cy += (y[s + k] + y[s + j]) * cr;
  }
  if (Math.abs(a2) > 1e-6) return [cx / (3 * a2), cy / (3 * a2)];
  let mx = 0, my = 0;
  for (let k = 0; k < c; k++) { mx += x[s + k]; my += y[s + k]; }
  return [mx / c, my / c];
}

// Turn the crown table into a Map keyed by objectid, dropping anything that
// does not describe a rising, narrowing stack. A malformed entry is skipped
// rather than drawn wrong.
function indexCrowns(json) {
  const byId = new Map();
  const list = (json && json.crowns) || [];
  for (const c of list) {
    if (!Number.isFinite(c.objectid) || !Array.isArray(c.tiers) || !c.tiers.length) continue;
    let lastTop = -Infinity, lastFrac = Infinity, ok = true;
    for (const t of c.tiers) {
      if (!(t.frac > 0) || t.frac > 1 || !(t.to_ft > lastTop) || t.frac > lastFrac) { ok = false; break; }
      lastTop = t.to_ft; lastFrac = t.frac;
    }
    if (ok) byId.set(c.objectid, c);
  }
  return byId;
}

// Build a synthetic tile of tier prisms for one decoded city tile.
//
// The return value has the same shape as a decoded tile, deliberately: it goes
// straight through buildTileMesh for geometry and rasterizeHeights for the
// shadow field, with no special cases in either. `ids` carries the PARENT
// objectid so a crown gets the same per-building tint as the mass under it.
function buildCrownTile(tile, byId) {
  if (!byId || byId.size === 0) return null;
  const rings = [];
  for (let i = 0; i < tile.n; i++) {
    const crown = byId.get(tile.ids[i]);
    if (!crown) continue;
    const s = tile.starts[i], c = tile.npts[i];
    if (c < 3) continue;
    const [cx, cy] = ringCentroid(tile.x, tile.y, s, c);
    const box = ringObb(tile.x, tile.y, s, c);
    // Stack from the surveyed top, not from the crown's recorded mass_ft: if
    // the dataset is rebuilt and the survey moves, the crown still lands on it.
    let z = tile.base[i] + tile.height[i];
    const massTop = tile.height[i];           // shading height: match the mass
    // to_ft is measured from the building's own grade, the same datum as
    // approx_hgt, so the footprint's base elevation has to be added back. Miss
    // this and every crown is squashed by however high the block sits.
    const grade = tile.base[i];
    for (const t of crown.tiers) {
      const top = grade + t.to_ft * FT_TO_M;
      if (top <= z + 0.05) continue;            // already taller than this tier
      // Two ways to shape a tier. "footprint" scales the building's own outline,
      // which is right for a setback that follows the tower below it. "square"
      // makes a centred square on the block's own axes, sized from the shorter
      // span, which is right for a tower that is square in plan on a footprint
      // that is not - City Hall's tower on a 470 by 250 ft block.
      let px, py, pc;
      if (t.shape === 'square') {
        const half = t.frac * Math.min(box.w, box.d) / 2;
        const ca = Math.cos(box.ang), sa = Math.sin(box.ang);
        px = new Float32Array(4); py = new Float32Array(4);
        const corners = [[-half, -half], [half, -half], [half, half], [-half, half]];
        for (let k = 0; k < 4; k++) {
          px[k] = box.cx + corners[k][0] * ca - corners[k][1] * sa;
          py[k] = box.cy + corners[k][0] * sa + corners[k][1] * ca;
        }
        pc = 4;
      } else {
        px = new Float32Array(c); py = new Float32Array(c);
        for (let k = 0; k < c; k++) {
          px[k] = cx + (tile.x[s + k] - cx) * t.frac;
          py[k] = cy + (tile.y[s + k] - cy) * t.frac;
        }
        pc = c;
      }
      rings.push({ px, py, c: pc, base: z, height: top - z, shade: massTop,
        id: tile.ids[i],
        solid: (t.solid != null ? t.solid : SOLID_KINDS.has(t.kind)) ? 1 : 0 });
      z = top;
    }
  }
  if (!rings.length) return null;

  let total = 0;
  for (const r of rings) total += r.c;
  const out = {
    n: rings.length,
    total,
    starts: new Int32Array(rings.length),
    npts: new Int32Array(rings.length),
    x: new Float32Array(total),
    y: new Float32Array(total),
    base: new Float32Array(rings.length),
    height: new Float32Array(rings.length),
    ids: new Int32Array(rings.length),
    solid: new Uint8Array(rings.length),
    shadeHeight: new Float32Array(rings.length),
  };
  let o = 0;
  for (let i = 0; i < rings.length; i++) {
    const r = rings[i];
    out.starts[i] = o;
    out.npts[i] = r.c;
    out.x.set(r.px, o);
    out.y.set(r.py, o);
    out.base[i] = r.base;
    out.height[i] = r.height;
    out.ids[i] = r.id;
    out.solid[i] = r.solid;
    out.shadeHeight[i] = r.shade;
    o += r.c;
  }
  return out;
}

globalThis.indexCrowns = indexCrowns;
globalThis.buildCrownTile = buildCrownTile;
globalThis.ringCentroid = ringCentroid;
globalThis.ringObb = ringObb;
globalThis.SOLID_KINDS = SOLID_KINDS;
