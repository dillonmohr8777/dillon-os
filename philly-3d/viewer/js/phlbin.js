// Reader for the PHLCITY3 container. This is the exact mirror of
// tools/pack.py; docs/FORMAT.md is the contract between them and
// test/phlbin.test.js checks a real tile round-trips.
'use strict';

const PHL_MAGIC = 'PHLCITY3';
const PHL_HEADER_SIZE = 64;
const PHL_INDEX_ENTRY = 20;

class PhlCity {
  constructor(buffer, inflate) {
    this.buf = buffer;
    this.inflate = inflate;
    const dv = new DataView(buffer);

    let magic = '';
    for (let i = 0; i < 8; i++) magic += String.fromCharCode(dv.getUint8(i));
    if (magic !== PHL_MAGIC) throw new Error(`bad magic: ${magic}`);

    this.version = dv.getUint32(8, true);
    this.originLat = dv.getFloat64(16, true);
    this.originLon = dv.getFloat64(24, true);
    this.tileSize = dv.getFloat32(32, true);
    this.quant = dv.getFloat32(36, true);
    this.tileCount = dv.getUint32(40, true);
    this.buildingCount = dv.getUint32(44, true);
    this.minTx = dv.getInt32(48, true);
    this.minTy = dv.getInt32(52, true);
    this.maxTx = dv.getInt32(56, true);
    this.maxTy = dv.getInt32(60, true);
    this.coordOffset = -512.0;

    this.tiles = new Map();
    const payloadStart = PHL_HEADER_SIZE + this.tileCount * PHL_INDEX_ENTRY;
    for (let i = 0; i < this.tileCount; i++) {
      const o = PHL_HEADER_SIZE + i * PHL_INDEX_ENTRY;
      const tx = dv.getInt32(o, true);
      const ty = dv.getInt32(o + 4, true);
      this.tiles.set(`${tx},${ty}`, {
        tx, ty,
        count: dv.getUint32(o + 8, true),
        start: payloadStart + dv.getUint32(o + 12, true),
        length: dv.getUint32(o + 16, true),
      });
    }
    this.cache = new Map();
  }

  tileBounds(t) {
    // Buildings are filed by centroid but may overhang, hence the slack.
    const x0 = t.tx * this.tileSize + this.coordOffset;
    const y0 = t.ty * this.tileSize + this.coordOffset;
    return { x0, y0, x1: x0 + this.tileSize * 3, y1: y0 + this.tileSize * 3 };
  }

  // Decode one tile into flat typed arrays in world metres.
  async decode(tx, ty) {
    const key = `${tx},${ty}`;
    if (this.cache.has(key)) return this.cache.get(key);
    const t = this.tiles.get(key);
    if (!t) return null;

    const raw = await this.inflate(
      new Uint8Array(this.buf, t.start, t.length));
    const dv = new DataView(raw.buffer, raw.byteOffset, raw.byteLength);
    let o = 0;
    const n = dv.getUint32(o, true); o += 4;

    const ids = new Uint32Array(n);
    let acc = 0;
    for (let i = 0; i < n; i++) { acc += dv.getUint32(o + i * 4, true); ids[i] = acc; }
    o += 4 * n;

    const height = new Float32Array(n);
    for (let i = 0; i < n; i++) height[i] = dv.getUint16(o + i * 2, true) * 0.1;
    o += 2 * n;

    const base = new Float32Array(n);
    for (let i = 0; i < n; i++) base[i] = dv.getInt16(o + i * 2, true) * 0.1;
    o += 2 * n;

    // roof: generated pitched-cap height above the flat top; 0 = flat roof.
    // See docs/FORMAT.md and viewer/js/mesh.js.
    const roof = new Float32Array(n);
    for (let i = 0; i < n; i++) roof[i] = dv.getUint16(o + i * 2, true) * 0.1;
    o += 2 * n;

    const flags = new Uint8Array(raw.buffer, raw.byteOffset + o, n).slice();
    o += n;
    const npts = new Uint8Array(raw.buffer, raw.byteOffset + o, n).slice();
    o += n;

    let total = 0;
    const starts = new Uint32Array(n);
    for (let i = 0; i < n; i++) { starts[i] = total; total += npts[i]; }

    const x = new Float32Array(total);
    const y = new Float32Array(total);
    const ox = tx * this.tileSize + this.coordOffset;
    const oy = ty * this.tileSize + this.coordOffset;
    const q = this.quant;

    // Per-ring delta decode: first point absolute (biased into int16), then
    // running sum. Mirrors pack.delta_rings / undelta_rings.
    const xo = o, yo = o + 2 * total;
    for (let i = 0; i < n; i++) {
      const s = starts[i], c = npts[i];
      let vx = dv.getInt16(xo + s * 2, true) + 32768;
      let vy = dv.getInt16(yo + s * 2, true) + 32768;
      x[s] = vx * q + ox; y[s] = vy * q + oy;
      for (let j = 1; j < c; j++) {
        vx += dv.getInt16(xo + (s + j) * 2, true);
        vy += dv.getInt16(yo + (s + j) * 2, true);
        x[s + j] = vx * q + ox; y[s + j] = vy * q + oy;
      }
    }

    const out = { tx, ty, n, ids, height, base, roof, flags, npts, starts, x, y, total };
    this.cache.set(key, out);
    return out;
  }
}

// Browser inflate. The payload is zlib-wrapped deflate, which is exactly what
// DecompressionStream('deflate') expects.
async function inflateBrowser(bytes) {
  const ds = new DecompressionStream('deflate');
  const stream = new Blob([bytes]).stream().pipeThrough(ds);
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

globalThis.PhlCity = PhlCity;
globalThis.inflateBrowser = inflateBrowser;
globalThis.PHL_HEADER_SIZE = PHL_HEADER_SIZE;
globalThis.PHL_INDEX_ENTRY = PHL_INDEX_ENTRY;
