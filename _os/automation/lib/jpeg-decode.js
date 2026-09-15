'use strict';

/**
 * Baseline JPEG decoder, pure Node, no dependencies.
 *
 * Exists because a large share of small-business logos are JPEGs on a flat
 * white plate -- precisely the case lib/logo-audit.js's flood fill was built
 * for -- and the audit was refusing them unread as `logo_format_not_auditable`.
 * They were 5 of 70 rows in the live yield sample.
 *
 * Scope is deliberate. Baseline sequential DCT (SOF0/SOF1) is decoded;
 * progressive (SOF2) and arithmetic coding are refused by name rather than
 * half-decoded into a plausible-looking wrong image, because a wrong image here
 * would produce a wrong brand colour and a wrong logo with no signal that
 * anything went astray.
 *
 * Pure Node rather than shelling to ffmpeg: this runs on a GitHub runner, on
 * Windows, and in a Linux container, and those do not agree on having ffmpeg.
 * A decoder that silently holds every logo when a binary is missing is the
 * original failure of this lane, repeated.
 */

const ZIGZAG = new Int32Array([
  0, 1, 8, 16, 9, 2, 3, 10, 17, 24, 32, 25, 18, 11, 4, 5,
  12, 19, 26, 33, 40, 48, 41, 34, 27, 20, 13, 6, 7, 14, 21, 28,
  35, 42, 49, 56, 57, 50, 43, 36, 29, 22, 15, 23, 30, 37, 44, 51,
  58, 59, 52, 45, 38, 31, 39, 46, 53, 60, 61, 54, 47, 55, 62, 63,
]);

const MAX_PIXELS = 16e6;
const clampByte = (v) => (v < 0 ? 0 : v > 255 ? 255 : v | 0);

/** Canonical JPEG Huffman table: code lengths to a lookup by (length, code). */
function buildHuffman(bits, values) {
  const lookup = [];
  let code = 0;
  let k = 0;
  for (let length = 1; length <= 16; length++) {
    const map = new Map();
    for (let i = 0; i < bits[length - 1]; i++) {
      map.set(code, values[k++]);
      code++;
    }
    lookup[length] = map;
    code <<= 1;
  }
  return lookup;
}

/** Bit reader that swallows the 0x00 stuffed after every 0xFF in entropy data. */
class BitReader {
  constructor(data, offset) {
    this.data = data;
    this.pos = offset;
    this.bitBuffer = 0;
    this.bitCount = 0;
    this.marker = 0;
  }

  readBit() {
    if (this.bitCount === 0) {
      if (this.pos >= this.data.length) return null;
      let byte = this.data[this.pos++];
      if (byte === 0xff) {
        const next = this.data[this.pos];
        if (next === 0x00) {
          this.pos++;
        } else if (next >= 0xd0 && next <= 0xd7) {
          // Restart marker: the caller resets DC predictors and continues.
          this.marker = next;
          this.pos++;
          byte = this.data[this.pos++] ?? 0;
        } else {
          this.marker = next;
          return null;
        }
      }
      this.bitBuffer = byte;
      this.bitCount = 8;
    }
    this.bitCount--;
    return (this.bitBuffer >> this.bitCount) & 1;
  }

  receive(length) {
    let value = 0;
    for (let i = 0; i < length; i++) {
      const bit = this.readBit();
      if (bit === null) return null;
      value = (value << 1) | bit;
    }
    return value;
  }

  decodeHuffman(table) {
    let code = 0;
    for (let length = 1; length <= 16; length++) {
      const bit = this.readBit();
      if (bit === null) return null;
      code = (code << 1) | bit;
      const hit = table[length]?.get(code);
      if (hit !== undefined) return hit;
    }
    return null;
  }

  /** Discard partial bits at a restart boundary. */
  align() {
    this.bitCount = 0;
  }
}

/** Signed value from a JPEG magnitude category. */
function extend(value, length) {
  return value < 1 << (length - 1) ? value - (1 << length) + 1 : value;
}

/** AAN-style separable inverse DCT, float, adequate for colour measurement. */
function idct(block, out) {
  const tmp = new Float32Array(64);
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      let sum = 0;
      for (let v = 0; v < 8; v++) {
        for (let u = 0; u < 8; u++) {
          const coefficient = block[v * 8 + u];
          if (!coefficient) continue;
          sum += CU[u] * CU[v] * coefficient * COS[u * 8 + x] * COS[v * 8 + y];
        }
      }
      tmp[y * 8 + x] = sum / 4;
    }
  }
  for (let i = 0; i < 64; i++) out[i] = clampByte(Math.round(tmp[i]) + 128);
}

const COS = new Float32Array(64);
for (let u = 0; u < 8; u++) {
  for (let x = 0; x < 8; x++) COS[u * 8 + x] = Math.cos(((2 * x + 1) * u * Math.PI) / 16);
}
const CU = new Float32Array(8).fill(1);
CU[0] = Math.SQRT1_2;

/**
 * Decode a baseline JPEG to straight RGBA8 (alpha always 255 -- JPEG has none,
 * which is exactly why these need the flood fill afterwards).
 *
 * @returns {{width,height,rgba}|{error:string}}
 */
function decodeJpeg(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) {
    return { error: 'not a JPEG' };
  }

  const quant = [];
  const huffDC = [];
  const huffAC = [];
  let frame = null;
  let restartInterval = 0;
  let pos = 2;
  let adobeTransform = -1;

  while (pos < buffer.length - 1) {
    if (buffer[pos] !== 0xff) { pos++; continue; }
    const marker = buffer[pos + 1];
    pos += 2;
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
    if (marker === 0xd9) break;
    if (pos + 2 > buffer.length) break;
    const length = buffer.readUInt16BE(pos);
    const segment = buffer.subarray(pos + 2, pos + length);

    if (marker === 0xdb) {                                    // DQT
      let i = 0;
      while (i < segment.length) {
        const precision = segment[i] >> 4;
        const id = segment[i] & 15;
        i++;
        const table = new Int32Array(64);
        for (let k = 0; k < 64; k++) {
          table[ZIGZAG[k]] = precision ? segment.readUInt16BE(i + k * 2) : segment[i + k];
        }
        i += precision ? 128 : 64;
        quant[id] = table;
      }
    } else if (marker === 0xc0 || marker === 0xc1) {           // SOF0/SOF1
      const height = segment.readUInt16BE(1);
      const width = segment.readUInt16BE(3);
      if (!width || !height) return { error: 'JPEG has zero dimensions' };
      if (width * height > MAX_PIXELS) return { error: 'JPEG is implausibly large for a logo' };
      const count = segment[5];
      const components = [];
      for (let i = 0; i < count; i++) {
        const off = 6 + i * 3;
        components.push({
          id: segment[off],
          h: segment[off + 1] >> 4,
          v: segment[off + 1] & 15,
          q: segment[off + 2],
        });
      }
      frame = { width, height, components };
    } else if (marker === 0xc2) {
      return { error: 'progressive JPEG is not decodable here' };
    } else if (marker === 0xc9 || marker === 0xcb || marker === 0xcd) {
      return { error: 'arithmetic-coded JPEG is not decodable here' };
    } else if (marker === 0xc4) {                              // DHT
      let i = 0;
      while (i < segment.length) {
        const cls = segment[i] >> 4;
        const id = segment[i] & 15;
        i++;
        const bits = Array.from(segment.subarray(i, i + 16));
        i += 16;
        const total = bits.reduce((a, b) => a + b, 0);
        const values = Array.from(segment.subarray(i, i + total));
        i += total;
        const table = buildHuffman(bits, values);
        if (cls === 0) huffDC[id] = table; else huffAC[id] = table;
      }
    } else if (marker === 0xdd) {                              // DRI
      restartInterval = segment.readUInt16BE(0);
    } else if (marker === 0xee) {                              // APP14 / Adobe
      if (segment.subarray(0, 5).toString('latin1') === 'Adobe') adobeTransform = segment[11];
    } else if (marker === 0xda) {                              // SOS
      if (!frame) return { error: 'JPEG scan before frame header' };
      const count = segment[0];
      const scan = [];
      for (let i = 0; i < count; i++) {
        const id = segment[1 + i * 2];
        const tables = segment[2 + i * 2];
        const component = frame.components.find((c) => c.id === id);
        if (!component) return { error: 'JPEG scan names an unknown component' };
        scan.push({ component, dc: tables >> 4, ac: tables & 15 });
      }
      return decodeScan(buffer, pos + length, frame, scan, quant, huffDC, huffAC, restartInterval, adobeTransform);
    }
    pos += length;
  }
  return { error: 'JPEG has no scan data' };
}

function decodeScan(buffer, offset, frame, scan, quant, huffDC, huffAC, restartInterval, adobeTransform) {
  const { width, height, components } = frame;
  const maxH = Math.max(...components.map((c) => c.h));
  const maxV = Math.max(...components.map((c) => c.v));
  const mcusX = Math.ceil(width / (8 * maxH));
  const mcusY = Math.ceil(height / (8 * maxV));

  for (const c of components) {
    c.blocksPerLine = mcusX * c.h;
    c.blocksPerColumn = mcusY * c.v;
    c.pixels = new Uint8ClampedArray(c.blocksPerLine * 8 * c.blocksPerColumn * 8);
    c.lineWidth = c.blocksPerLine * 8;
    c.pred = 0;
  }

  const reader = new BitReader(buffer, offset);
  const block = new Int32Array(64);
  const out = new Uint8ClampedArray(64);
  let mcu = 0;
  const totalMcus = mcusX * mcusY;

  while (mcu < totalMcus) {
    if (restartInterval && mcu > 0 && mcu % restartInterval === 0) {
      reader.align();
      // Skip the restart marker itself if the reader has not already consumed it.
      while (reader.pos < buffer.length - 1
             && buffer[reader.pos] === 0xff && buffer[reader.pos + 1] >= 0xd0 && buffer[reader.pos + 1] <= 0xd7) {
        reader.pos += 2;
      }
      for (const s of scan) s.component.pred = 0;
    }
    const mcuY = Math.floor(mcu / mcusX);
    const mcuX = mcu % mcusX;

    for (const s of scan) {
      const c = s.component;
      for (let v = 0; v < c.v; v++) {
        for (let h = 0; h < c.h; h++) {
          block.fill(0);
          const dcTable = huffDC[s.dc];
          const acTable = huffAC[s.ac];
          if (!dcTable || !acTable) return { error: 'JPEG references a missing Huffman table' };

          const t = reader.decodeHuffman(dcTable);
          if (t === null) { mcu = totalMcus; break; }
          let diff = 0;
          if (t) {
            const received = reader.receive(t);
            if (received === null) { mcu = totalMcus; break; }
            diff = extend(received, t);
          }
          c.pred += diff;
          block[0] = c.pred;

          let k = 1;
          while (k < 64) {
            const rs = reader.decodeHuffman(acTable);
            if (rs === null) { k = 64; break; }
            const r = rs >> 4;
            const size = rs & 15;
            if (size === 0) {
              if (r !== 15) break;   // EOB
              k += 16;
              continue;
            }
            k += r;
            if (k > 63) break;
            const received = reader.receive(size);
            if (received === null) break;
            block[ZIGZAG[k]] = extend(received, size);
            k++;
          }

          const q = quant[c.q];
          if (!q) return { error: 'JPEG references a missing quantisation table' };
          for (let i = 0; i < 64; i++) block[i] *= q[i];
          idct(block, out);

          const bx = (mcuX * c.h + h) * 8;
          const by = (mcuY * c.v + v) * 8;
          for (let y = 0; y < 8; y++) {
            const dst = (by + y) * c.lineWidth + bx;
            for (let x = 0; x < 8; x++) c.pixels[dst + x] = out[y * 8 + x];
          }
        }
      }
    }
    mcu++;
  }

  // Upsample each component to full resolution, then convert to RGBA.
  const rgba = Buffer.alloc(width * height * 4, 255);
  const sample = (c, x, y) => {
    const sx = Math.min(c.lineWidth - 1, (x * c.h / maxH) | 0);
    const sy = Math.min(c.blocksPerColumn * 8 - 1, (y * c.v / maxV) | 0);
    return c.pixels[sy * c.lineWidth + sx];
  };

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const o = (y * width + x) * 4;
      if (components.length === 1) {
        const g = sample(components[0], x, y);
        rgba[o] = rgba[o + 1] = rgba[o + 2] = g;
      } else if (components.length === 3) {
        const Y = sample(components[0], x, y);
        const Cb = sample(components[1], x, y) - 128;
        const Cr = sample(components[2], x, y) - 128;
        rgba[o] = clampByte(Y + 1.402 * Cr);
        rgba[o + 1] = clampByte(Y - 0.344136 * Cb - 0.714136 * Cr);
        rgba[o + 2] = clampByte(Y + 1.772 * Cb);
      } else if (components.length === 4) {
        // YCCK/CMYK. Adobe transform 2 means YCCK; 0 means plain CMYK.
        let c0 = sample(components[0], x, y);
        let c1 = sample(components[1], x, y);
        let c2 = sample(components[2], x, y);
        const k = sample(components[3], x, y);
        if (adobeTransform !== 0) {
          const Y = c0, Cb = c1 - 128, Cr = c2 - 128;
          c0 = clampByte(Y + 1.402 * Cr);
          c1 = clampByte(Y - 0.344136 * Cb - 0.714136 * Cr);
          c2 = clampByte(Y + 1.772 * Cb);
        }
        rgba[o] = clampByte((c0 * k) / 255);
        rgba[o + 1] = clampByte((c1 * k) / 255);
        rgba[o + 2] = clampByte((c2 * k) / 255);
      } else {
        return { error: `unsupported JPEG component count ${components.length}` };
      }
      rgba[o + 3] = 255;
    }
  }
  return { width, height, rgba };
}

module.exports = { decodeJpeg };
