// Turns a decoded tile into GPU-ready vertex data.
//
// Each building becomes a quad per wall edge plus a triangulated roof cap.
// Normals are not stored: the fragment shader derives the face normal from
// screen-space derivatives, which is exact for flat faces and saves 12 bytes
// on every vertex.
'use strict';

// Ear clipping. A centroid fan is not good enough here: Philadelphia is full
// of L-shaped and U-shaped footprints, and a fan across a reflex vertex puts
// roof triangles outside the building.
function triangulateRing(x, y, s, c, emit) {
  if (c < 3) return 0;
  const idx = [];
  let area2 = 0;
  for (let i = 0; i < c; i++) {
    const j = (i + 1) % c;
    area2 += x[s + i] * y[s + j] - x[s + j] * y[s + i];
  }
  // ear clipping assumes counter-clockwise input
  if (area2 < 0) { for (let i = c - 1; i >= 0; i--) idx.push(i); }
  else { for (let i = 0; i < c; i++) idx.push(i); }

  const cross = (ax, ay, bx, by, cx, cy) =>
    (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);

  const inside = (ax, ay, bx, by, cx, cy, px, py) =>
    cross(ax, ay, bx, by, px, py) >= 0 &&
    cross(bx, by, cx, cy, px, py) >= 0 &&
    cross(cx, cy, ax, ay, px, py) >= 0;

  let tris = 0;
  let guard = 0;
  while (idx.length > 3 && guard++ < 4 * c) {
    let clipped = false;
    for (let i = 0; i < idx.length; i++) {
      const i0 = idx[(i + idx.length - 1) % idx.length];
      const i1 = idx[i];
      const i2 = idx[(i + 1) % idx.length];
      const ax = x[s + i0], ay = y[s + i0];
      const bx = x[s + i1], by = y[s + i1];
      const cx = x[s + i2], cy = y[s + i2];
      if (cross(ax, ay, bx, by, cx, cy) <= 0) continue;      // reflex, not an ear
      let contains = false;
      for (const k of idx) {
        if (k === i0 || k === i1 || k === i2) continue;
        if (inside(ax, ay, bx, by, cx, cy, x[s + k], y[s + k])) { contains = true; break; }
      }
      if (contains) continue;
      emit(i0, i1, i2);
      tris++;
      idx.splice(i, 1);
      clipped = true;
      break;
    }
    if (!clipped) break;      // degenerate ring; stop rather than spin
  }
  if (idx.length === 3) { emit(idx[0], idx[1], idx[2]); tris++; }
  return tris;
}

const VERTEX_FLOATS = 5;    // x, y, z, height, tintKind

// Deterministic per-building variation. Same building, same colour, every run.
function tintFor(id) {
  let h = (id * 2654435761) >>> 0;
  h ^= h >>> 13; h = (h * 1274126177) >>> 0; h ^= h >>> 16;
  return (h % 1000) / 999;
}

function buildTileMesh(tile, select) {
  const { n, npts, starts, x, y, height, base, ids } = tile;

  let verts = 0;
  const keep = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    if (select && !select(i)) continue;
    keep[i] = 1;
    verts += npts[i] * 6;                   // walls: two triangles per edge
    verts += Math.max(0, npts[i] - 2) * 3;  // roof: n-2 triangles
  }
  const out = new Float32Array(verts * VERTEX_FLOATS);
  let o = 0;

  const push = (px, py, pz, h, tk) => {
    out[o] = px; out[o + 1] = py; out[o + 2] = pz;
    out[o + 3] = h; out[o + 4] = tk; o += VERTEX_FLOATS;
  };

  let triCount = 0;
  for (let i = 0; i < n; i++) {
    if (!keep[i]) continue;
    const s = starts[i], c = npts[i];
    const z0 = base[i], z1 = base[i] + height[i], h = height[i];
    const tint = tintFor(ids[i]);

    // Ring winding is not consistent in the source, so normalise here too.
    let a2 = 0;
    for (let k = 0; k < c; k++) {
      const j = (k + 1) % c;
      a2 += x[s + k] * y[s + j] - x[s + j] * y[s + k];
    }
    const ccw = a2 >= 0;

    for (let k = 0; k < c; k++) {
      const k0 = ccw ? k : (c - 1 - k);
      const k1 = ccw ? (k + 1) % c : (c - 1 - ((k + 1) % c));
      const x0 = x[s + k0], y0 = y[s + k0];
      const x1 = x[s + k1], y1 = y[s + k1];
      // wall quad, counter-clockwise seen from outside -> outward normal
      push(x0, y0, z0, h, tint);
      push(x1, y1, z0, h, tint);
      push(x1, y1, z1, h, tint);
      push(x0, y0, z0, h, tint);
      push(x1, y1, z1, h, tint);
      push(x0, y0, z1, h, tint);
      triCount += 2;
    }

    triCount += triangulateRing(x, y, s, c, (a, b, cc) => {
      push(x[s + a], y[s + a], z1, h, tint + 1000);   // +1000 marks a roof
      push(x[s + b], y[s + b], z1, h, tint + 1000);
      push(x[s + cc], y[s + cc], z1, h, tint + 1000);
    });
  }

  return { data: out.subarray(0, o), vertexCount: o / VERTEX_FLOATS, triCount };
}

globalThis.triangulateRing = triangulateRing;
globalThis.buildTileMesh = buildTileMesh;
globalThis.tintFor = tintFor;
globalThis.VERTEX_FLOATS = VERTEX_FLOATS;
