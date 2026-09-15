// Collision against real building footprints.
//
// A rasterised walkability grid is the obvious approach and the wrong one
// here: at 1 m resolution a single 1024 m tile is a megabyte, and fifty
// resident tiles would cost more memory than the whole city binary. Instead
// this indexes footprint EDGES into a uniform spatial hash and resolves the
// player as a circle against the segments in the nine neighbouring cells.
//
// Each edge carries its OUTWARD normal, and resolution places the player on
// the outside of the edge at exactly the collision radius. Pushing away from
// the nearest point instead looks equivalent and is not: a player already
// inside a footprint gets shoved further in, because the nearest point is the
// wall behind them. A footprint is a solid region, not a thin wall.
'use strict';

const COLLIDER_CELL = 24;      // metres; a Philadelphia block is about 120
const STRIDE = 7;              // x0, y0, x1, y1, nx, ny, id

class Collider {
  constructor(cell = COLLIDER_CELL) {
    this.cell = cell;
    this.cells = new Map();     // "cx,cy" -> flat segment array
    this.tiles = new Set();
    this.segments = 0;
    this.nextId = 1;
  }

  key(cx, cy) { return `${cx},${cy}`; }

  _push(cx, cy, seg) {
    const k = this.key(cx, cy);
    let arr = this.cells.get(k);
    if (!arr) { arr = []; this.cells.set(k, arr); }
    for (let i = 0; i < STRIDE; i++) arr.push(seg[i]);
  }

  // Insert every footprint edge of a decoded tile, stamping each segment into
  // all cells its bounding box touches so a long wall is found from anywhere
  // along it. Ring winding is normalised first, because the source is not
  // consistent and the outward normal depends on it.
  addTile(tile) {
    const id = `${tile.tx},${tile.ty}`;
    if (this.tiles.has(id)) return 0;
    this.tiles.add(id);
    const { n, npts, starts, x, y } = tile;
    const seg = new Float64Array(STRIDE);
    let added = 0;

    for (let i = 0; i < n; i++) {
      const s = starts[i], c = npts[i];
      let a2 = 0;
      for (let k = 0; k < c; k++) {
        const j = (k + 1) % c;
        a2 += x[s + k] * y[s + j] - x[s + j] * y[s + k];
      }
      const ccw = a2 >= 0;
      for (let k = 0; k < c; k++) {
        const ia = ccw ? s + k : s + (c - 1 - k);
        const ib = ccw ? s + ((k + 1) % c) : s + (c - 1 - ((k + 1) % c));
        const x0 = x[ia], y0 = y[ia], x1 = x[ib], y1 = y[ib];
        const dx = x1 - x0, dy = y1 - y0;
        const L = Math.hypot(dx, dy);
        if (L < 1e-6) continue;
        seg[0] = x0; seg[1] = y0; seg[2] = x1; seg[3] = y1;
        seg[4] = dy / L; seg[5] = -dx / L;      // outward normal for CCW
        seg[6] = this.nextId++;                 // identity, for ray dedup
        const cx0 = Math.floor(Math.min(x0, x1) / this.cell);
        const cx1 = Math.floor(Math.max(x0, x1) / this.cell);
        const cy0 = Math.floor(Math.min(y0, y1) / this.cell);
        const cy1 = Math.floor(Math.max(y0, y1) / this.cell);
        for (let cx = cx0; cx <= cx1; cx++) {
          for (let cy = cy0; cy <= cy1; cy++) this._push(cx, cy, seg);
        }
        added++;
      }
    }
    this.segments += added;
    return added;
  }

  dropTile(tx, ty) {
    // Cheap eviction: forget the tile so it can be re-added. Cells are not
    // pruned, which costs some stale segments but never lets the player walk
    // through a wall that is still standing.
    this.tiles.delete(`${tx},${ty}`);
  }

  static _closest(px, py, ax, ay, bx, by) {
    const dx = bx - ax, dy = by - ay;
    const L2 = dx * dx + dy * dy;
    let t = L2 > 0 ? ((px - ax) * dx + (py - ay) * dy) / L2 : 0;
    t = t < 0 ? 0 : (t > 1 ? 1 : t);
    return { qx: ax + t * dx, qy: ay + t * dy };
  }

  // Place the circle outside every wall it overlaps. Iterated so inside
  // corners settle instead of ping-ponging between two edges.
  resolve(px, py, radius, iterations = 4) {
    let x = px, y = py, hit = false, hnx = 0, hny = 0;
    for (let it = 0; it < iterations; it++) {
      let moved = false;
      const cx = Math.floor(x / this.cell), cy = Math.floor(y / this.cell);
      for (let ox = -1; ox <= 1; ox++) {
        for (let oy = -1; oy <= 1; oy++) {
          const arr = this.cells.get(this.key(cx + ox, cy + oy));
          if (!arr) continue;
          for (let i = 0; i < arr.length; i += STRIDE) {
            const x0 = arr[i], y0 = arr[i + 1], x1 = arr[i + 2], y1 = arr[i + 3];
            const nx = arr[i + 4], ny = arr[i + 5];
            const c = Collider._closest(x, y, x0, y0, x1, y1);
            const ex = x - c.qx, ey = y - c.qy;
            if (ex * ex + ey * ey >= radius * radius) continue;
            // signed distance along the edge's own outward normal
            const s = (x - x0) * nx + (y - y0) * ny;
            if (s >= radius) continue;
            x = c.qx + nx * radius;
            y = c.qy + ny * radius;
            hnx = nx; hny = ny;
            moved = true; hit = true;
          }
        }
      }
      if (!moved) break;
    }
    return { x, y, hit, nx: hnx, ny: hny };
  }

  // Does the movement segment cross a wall? Proximity at the destination is
  // not enough: a step longer than the radius jumps clean over a wall and
  // lands on the far side with nothing within radius to object. Returns the
  // fraction of the step at first contact, or 1 if the path is clear.
  _sweep(px, py, dx, dy, radius) {
    let best = 1, bnx = 0, bny = 0;
    const minx = Math.min(px, px + dx) - radius, maxx = Math.max(px, px + dx) + radius;
    const miny = Math.min(py, py + dy) - radius, maxy = Math.max(py, py + dy) + radius;
    const c0x = Math.floor(minx / this.cell), c1x = Math.floor(maxx / this.cell);
    const c0y = Math.floor(miny / this.cell), c1y = Math.floor(maxy / this.cell);
    for (let cx = c0x; cx <= c1x; cx++) {
      for (let cy = c0y; cy <= c1y; cy++) {
        const arr = this.cells.get(this.key(cx, cy));
        if (!arr) continue;
        for (let i = 0; i < arr.length; i += STRIDE) {
          const x0 = arr[i], y0 = arr[i + 1], x1 = arr[i + 2], y1 = arr[i + 3];
          const ex = x1 - x0, ey = y1 - y0;
          const den = dx * ey - dy * ex;
          if (Math.abs(den) < 1e-12) continue;           // parallel
          const rx = x0 - px, ry = y0 - py;
          const t = (rx * ey - ry * ex) / den;            // along the move
          const u = (rx * dy - ry * dx) / den;            // along the wall
          if (t < 0 || t > 1 || u < 0 || u > 1) continue;
          if (t < best) { best = t; bnx = arr[i + 4]; bny = arr[i + 5]; }
        }
      }
    }
    return { t: best, nx: bnx, ny: bny };
  }

  // Swept move: stop at first contact, then slide the remaining motion along
  // the wall. Without the slide, brushing a wall stops the player dead instead
  // of letting them run along it, which is the difference between feeling
  // stuck and feeling solid.
  move(px, py, dx, dy, radius) {
    const sweep = this._sweep(px, py, dx, dy, radius);
    if (sweep.t >= 1) {
      const settled = this.resolve(px + dx, py + dy, radius);
      return { x: settled.x, y: settled.y, hit: settled.hit,
               nx: settled.nx, ny: settled.ny };
    }
    // advance to just before contact
    const skin = 0.02;
    const tt = Math.max(0, sweep.t - skin);
    let x = px + dx * tt, y = py + dy * tt;
    // project the leftover motion onto the wall and try again
    const rx = dx * (1 - tt), ry = dy * (1 - tt);
    const dot = rx * sweep.nx + ry * sweep.ny;
    const sx = rx - dot * sweep.nx, sy = ry - dot * sweep.ny;
    const slide = this._sweep(x, y, sx, sy, radius);
    const st = Math.max(0, slide.t - skin);
    x += sx * st; y += sy * st;
    const settled = this.resolve(x, y, radius);
    return { x: settled.x, y: settled.y, hit: true,
             nx: sweep.nx, ny: sweep.ny };
  }

  // Is the point inside a footprint? Horizontal ray cast counting wall
  // crossings; odd means inside. Segments are stamped into several cells, so
  // each is counted once by identity. Buildings top out around 300 m across,
  // so a 3 km ray is always long enough, and any further building it passes
  // through contributes an entry and an exit, which cancel.
  inside(px, py) {
    const seen = new Set();
    let crossings = 0;
    const cy = Math.floor(py / this.cell);
    const c0 = Math.floor(px / this.cell);
    const c1 = c0 + Math.ceil(3000 / this.cell);
    for (let cx = c0; cx <= c1; cx++) {
      const arr = this.cells.get(this.key(cx, cy));
      if (!arr) continue;
      for (let i = 0; i < arr.length; i += STRIDE) {
        const id = arr[i + 6];
        if (seen.has(id)) continue;
        seen.add(id);
        const x0 = arr[i], y0 = arr[i + 1], x1 = arr[i + 2], y1 = arr[i + 3];
        if ((y0 > py) === (y1 > py)) continue;
        const xAt = x0 + ((py - y0) / (y1 - y0)) * (x1 - x0);
        if (xAt > px) crossings++;
      }
    }
    return (crossings & 1) === 1;
  }

  // Last resort for a player who starts life inside a building: walk outward
  // until the position is clear. Used on spawn and on teleport, never per frame.
  unstick(px, py, radius, maxRadius = 200) {
    if (!this.inside(px, py) && !this.resolve(px, py, radius).hit) {
      return { x: px, y: py, moved: false };
    }
    for (let r = 4; r <= maxRadius; r += 4) {
      for (let a = 0; a < 24; a++) {
        const th = (a / 24) * Math.PI * 2;
        const tx = px + Math.cos(th) * r, ty = py + Math.sin(th) * r;
        if (!this.inside(tx, ty) && !this.resolve(tx, ty, radius).hit) {
          return { x: tx, y: ty, moved: true };
        }
      }
    }
    return { x: px, y: py, moved: false };
  }

  segmentCount() { return this.segments; }
}

globalThis.Collider = Collider;
globalThis.COLLIDER_CELL = COLLIDER_CELL;
