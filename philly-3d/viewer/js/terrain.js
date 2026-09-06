// Philadelphia's terrain, taken from the building survey rather than a second
// dataset.
//
// LI_BUILDING_FOOTPRINTS carries base_elevation per footprint: the ground the
// building stands on, in feet, on the same vertical datum as the heights. That
// is 546,415 measured ground samples across the county. tools/build_terrain.py
// rasterises them to a 50 m grid; this reads the result.
//
// The bug this exists to fix: the viewer drew its ground as a plane at z = 0
// while every building started at its own base elevation. In Center City the
// median base is 12 m, so the whole city floated twelve metres above its own
// ground and a walking player stood in a pit looking up at the undersides.
'use strict';

class Terrain {
  constructor(buf) {
    const dv = new DataView(buf);
    let magic = '';
    for (let i = 0; i < 8; i++) magic += String.fromCharCode(dv.getUint8(i));
    if (magic !== 'PHLTERR1') throw new Error(`bad terrain magic: ${magic}`);
    this.nx = dv.getUint32(8, true);
    this.ny = dv.getUint32(12, true);
    this.x0 = dv.getFloat32(16, true);
    this.y0 = dv.getFloat32(20, true);
    this.cell = dv.getFloat32(24, true);
    this.zmin = dv.getFloat32(28, true);
    this.zscale = dv.getFloat32(32, true);
    this.payloadOffset = 36;
    this.heights = null;          // Float32Array, metres, filled by decode()
  }

  // Quantised uint16 in, metres out. Kept as one flat Float32Array because
  // that is exactly what texImage2D wants for an R32F upload.
  decode(inflated) {
    const q = new Uint16Array(inflated.buffer, inflated.byteOffset,
      inflated.byteLength >> 1);
    if (q.length < this.nx * this.ny) {
      throw new Error(`terrain short: ${q.length} of ${this.nx * this.ny}`);
    }
    const out = new Float32Array(this.nx * this.ny);
    for (let i = 0; i < out.length; i++) out[i] = this.zmin + q[i] * this.zscale;
    this.heights = out;
    let lo = Infinity, hi = -Infinity;
    for (const v of out) { if (v < lo) lo = v; if (v > hi) hi = v; }
    this.min = lo; this.max = hi;
    return out;
  }

  // Must match terrainAt() in the shaders EXACTLY, fade curve included, or the
  // player stands at a different height from the ground drawn under them.
  heightAt(x, y) {
    if (!this.heights) return 0;
    const tx = (x - this.x0) / this.cell - 0.5;
    const ty = (y - this.y0) / this.cell - 0.5;
    const bx = Math.floor(tx), by = Math.floor(ty);
    const rx = tx - bx, ry = ty - by;
    // Perlin's fade, the same one the GLSL applies: plain bilinear is only C0
    // and creases along every cell edge.
    const fx = rx * rx * (3 - 2 * rx);
    const fy = ry * ry * (3 - 2 * ry);
    const cl = (v, hi) => (v < 0 ? 0 : (v > hi ? hi : v));
    const hx = this.nx - 1, hy = this.ny - 1;
    const at = (ix, iy) => this.heights[cl(iy, hy) * this.nx + cl(ix, hx)];
    const s00 = at(bx, by), s10 = at(bx + 1, by);
    const s01 = at(bx, by + 1), s11 = at(bx + 1, by + 1);
    return (s00 + (s10 - s00) * fx) * (1 - fy) +
           (s01 + (s11 - s01) * fx) * fy;
  }
}

globalThis.Terrain = Terrain;
