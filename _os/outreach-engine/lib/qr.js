/**
 * Byte-mode QR encoder, ECC-M, versions 1–12. Zero dependencies.
 * Emits a module matrix and an SVG. Good enough for tracked mail URLs.
 */
'use strict';

const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);
(function initGf() {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x;
    GF_LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) GF_EXP[i] = GF_EXP[i - 255];
})();

function gfMul(a, b) {
  if (!a || !b) return 0;
  return GF_EXP[GF_LOG[a] + GF_LOG[b]];
}

function rsGenerator(ecCount) {
  let poly = [1];
  for (let i = 0; i < ecCount; i++) {
    const next = new Array(poly.length + 1).fill(0);
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= poly[j];
      next[j + 1] ^= gfMul(poly[j], GF_EXP[i]);
    }
    poly = next;
  }
  return poly;
}

function rsEncode(data, ecCount) {
  const gen = rsGenerator(ecCount);
  const rec = data.concat(new Array(ecCount).fill(0));
  for (let i = 0; i < data.length; i++) {
    const coef = rec[i];
    if (!coef) continue;
    for (let j = 0; j < gen.length; j++) rec[i + j] ^= gfMul(gen[j], coef);
  }
  return rec.slice(data.length);
}

/** ECC-M block layout: [totalCW, ecPerBlock, g1Blocks, g1Data, g2Blocks, g2Data] */
const VERSIONS = {
  1: [26, 10, 1, 16, 0, 0],
  2: [44, 16, 1, 28, 0, 0],
  3: [70, 26, 1, 44, 0, 0],
  4: [100, 18, 2, 32, 0, 0],
  5: [134, 24, 2, 43, 0, 0],
  6: [172, 16, 4, 27, 0, 0],
  7: [196, 18, 4, 31, 0, 0],
  8: [242, 22, 2, 38, 2, 39],
  9: [292, 22, 3, 36, 2, 37],
  10: [346, 26, 4, 43, 1, 44],
  11: [404, 30, 1, 50, 4, 51],
  12: [466, 22, 6, 36, 2, 37],
};

const ALIGN = {
  2: [6, 18],
  3: [6, 22],
  4: [6, 26],
  5: [6, 30],
  6: [6, 34],
  7: [6, 22, 38],
  8: [6, 24, 42],
  9: [6, 26, 46],
  10: [6, 28, 50],
  11: [6, 30, 54],
  12: [6, 32, 58],
};

const REMAINDER = {
  1: 0, 2: 7, 3: 7, 4: 7, 5: 7, 6: 7, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0,
};

function sizeOf(version) {
  return 21 + 4 * (version - 1);
}

function byteCapacity(version) {
  const [, , g1, d1, g2, d2] = VERSIONS[version];
  const dataCw = g1 * d1 + g2 * d2;
  // 4 mode + 8 count + 4 terminator, rounded into bytes: dataCw - 2 (mode/count) roughly
  return dataCw - 2;
}

function chooseVersion(byteLen) {
  for (let v = 1; v <= 12; v++) {
    if (byteCapacity(v) >= byteLen) return v;
  }
  throw new Error(`QR payload too long (${byteLen} bytes); max ${byteCapacity(12)}`);
}

function bitsToBytes(bits) {
  const out = [];
  for (let i = 0; i < bits.length; i += 8) {
    let b = 0;
    for (let j = 0; j < 8; j++) b = (b << 1) | (bits[i + j] || 0);
    out.push(b);
  }
  return out;
}

function encodeData(text, version) {
  const bytes = Buffer.from(String(text), 'utf8');
  const [, , g1, d1, g2, d2] = VERSIONS[version];
  const dataCw = g1 * d1 + g2 * d2;
  const bits = [];
  const push = (val, n) => {
    for (let i = n - 1; i >= 0; i--) bits.push((val >> i) & 1);
  };
  push(0b0100, 4); // byte mode
  push(bytes.length, 8);
  for (const b of bytes) push(b, 8);
  const maxBits = dataCw * 8;
  const pad = Math.min(4, maxBits - bits.length);
  for (let i = 0; i < pad; i++) bits.push(0);
  while (bits.length % 8) bits.push(0);
  const data = bitsToBytes(bits);
  const pads = [0xec, 0x11];
  let p = 0;
  while (data.length < dataCw) data.push(pads[p++ % 2]);
  return data.slice(0, dataCw);
}

function interleave(data, version) {
  const [, ec, g1, d1, g2, d2] = VERSIONS[version];
  const blocks = [];
  let offset = 0;
  for (let i = 0; i < g1; i++) {
    const chunk = data.slice(offset, offset + d1);
    offset += d1;
    blocks.push({ data: chunk, ec: rsEncode(chunk, ec) });
  }
  for (let i = 0; i < g2; i++) {
    const chunk = data.slice(offset, offset + d2);
    offset += d2;
    blocks.push({ data: chunk, ec: rsEncode(chunk, ec) });
  }
  const maxData = Math.max(d1, d2);
  const out = [];
  for (let i = 0; i < maxData; i++) {
    for (const b of blocks) if (i < b.data.length) out.push(b.data[i]);
  }
  for (let i = 0; i < ec; i++) {
    for (const b of blocks) out.push(b.ec[i]);
  }
  return out;
}

function placeFinder(mod, reserved, x, y) {
  for (let dy = -1; dy <= 7; dy++) {
    for (let dx = -1; dx <= 7; dx++) {
      const xx = x + dx;
      const yy = y + dy;
      if (xx < 0 || yy < 0 || xx >= mod.length || yy >= mod.length) continue;
      const on =
        dx === -1 || dy === -1 || dx === 7 || dy === 7
          ? false
          : dx === 0 || dy === 0 || dx === 6 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4);
      mod[yy][xx] = on;
      reserved[yy][xx] = true;
    }
  }
}

function placeAlignment(mod, reserved, cx, cy) {
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      const xx = cx + dx;
      const yy = cy + dy;
      if (reserved[yy][xx]) return;
    }
  }
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      const on = dx === -2 || dy === -2 || dx === 2 || dy === 2 || (dx === 0 && dy === 0);
      mod[cy + dy][cx + dx] = on;
      reserved[cy + dy][cx + dx] = true;
    }
  }
}

function placeTiming(mod, reserved) {
  const n = mod.length;
  for (let i = 0; i < n; i++) {
    if (!reserved[6][i]) {
      mod[6][i] = i % 2 === 0;
      reserved[6][i] = true;
    }
    if (!reserved[i][6]) {
      mod[i][6] = i % 2 === 0;
      reserved[i][6] = true;
    }
  }
}

function maskFn(id) {
  return [
    (x, y) => (x + y) % 2 === 0,
    (x, y) => y % 2 === 0,
    (x, y) => x % 3 === 0,
    (x, y) => (x + y) % 3 === 0,
    (x, y) => (Math.floor(y / 2) + Math.floor(x / 3)) % 2 === 0,
    (x, y) => ((x * y) % 2) + ((x * y) % 3) === 0,
    (x, y) => (((x * y) % 2) + ((x * y) % 3)) % 2 === 0,
    (x, y) => (((x + y) % 2) + ((x * y) % 3)) % 2 === 0,
  ][id];
}

function formatBits(mask) {
  // ECC-M = 00. BCH(15,5) over 0x537, xor 0x5412
  let data = (0b00 << 3) | mask;
  let d = data << 10;
  const gen = 0b10100110111;
  for (let i = 14; i >= 10; i--) {
    if ((d >> i) & 1) d ^= gen << (i - 10);
  }
  return ((data << 10) | d) ^ 0x5412;
}

function placeFormat(mod, reserved, mask) {
  const bits = formatBits(mask);
  const n = mod.length;
  const set = (x, y, bit) => {
    mod[y][x] = !!bit;
    reserved[y][x] = true;
  };
  for (let i = 0; i < 15; i++) {
    const bit = (bits >> (14 - i)) & 1;
    // horizontal near top-left finder, skipping timing
    if (i < 6) set(i, 8, bit);
    else if (i < 8) set(i + 1, 8, bit);
    else set(n - 15 + i, 8, bit);
    // vertical
    if (i < 8) set(8, n - 1 - i, bit);
    else if (i < 9) set(8, 15 - i, bit);
    else set(8, 14 - i, bit);
  }
  set(8, n - 8, 1); // dark module
}

function placeData(mod, reserved, codewords, maskId, version) {
  const n = mod.length;
  const bits = [];
  for (const cw of codewords) {
    for (let i = 7; i >= 0; i--) bits.push((cw >> i) & 1);
  }
  const rem = REMAINDER[version] || 0;
  for (let i = 0; i < rem; i++) bits.push(0);
  const mask = maskFn(maskId);
  let bi = 0;
  let upward = true;
  for (let x = n - 1; x > 0; x -= 2) {
    if (x === 6) x--;
    for (let yOff = 0; yOff < n; yOff++) {
      const y = upward ? n - 1 - yOff : yOff;
      for (const dx of [0, -1]) {
        const xx = x + dx;
        if (reserved[y][xx]) continue;
        const bit = bits[bi++] || 0;
        mod[y][xx] = mask(xx, y) ? !bit : !!bit;
      }
    }
    upward = !upward;
  }
}

function penalty(mod) {
  const n = mod.length;
  let score = 0;
  const runScore = (run) => (run >= 5 ? 3 + (run - 5) : 0);
  for (let y = 0; y < n; y++) {
    let run = 1;
    for (let x = 1; x < n; x++) {
      if (mod[y][x] === mod[y][x - 1]) run++;
      else {
        score += runScore(run);
        run = 1;
      }
    }
    score += runScore(run);
  }
  for (let x = 0; x < n; x++) {
    let run = 1;
    for (let y = 1; y < n; y++) {
      if (mod[y][x] === mod[y - 1][x]) run++;
      else {
        score += runScore(run);
        run = 1;
      }
    }
    score += runScore(run);
  }
  for (let y = 0; y < n - 1; y++) {
    for (let x = 0; x < n - 1; x++) {
      const v = mod[y][x];
      if (v === mod[y][x + 1] && v === mod[y + 1][x] && v === mod[y + 1][x + 1]) score += 3;
    }
  }
  let dark = 0;
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (mod[y][x]) dark++;
  const pct = (100 * dark) / (n * n);
  score += 10 * Math.floor(Math.abs(pct - 50) / 5);
  return score;
}

function buildMatrix(codewords, version, maskId) {
  const n = sizeOf(version);
  const mod = Array.from({ length: n }, () => Array(n).fill(false));
  const reserved = Array.from({ length: n }, () => Array(n).fill(false));
  placeFinder(mod, reserved, 0, 0);
  placeFinder(mod, reserved, n - 7, 0);
  placeFinder(mod, reserved, 0, n - 7);
  for (const y of ALIGN[version] || []) {
    for (const x of ALIGN[version] || []) {
      placeAlignment(mod, reserved, x, y);
    }
  }
  placeTiming(mod, reserved);
  // reserve format areas
  for (let i = 0; i < 9; i++) {
    reserved[8][i] = true;
    reserved[i][8] = true;
  }
  for (let i = 0; i < 8; i++) {
    reserved[8][n - 1 - i] = true;
    reserved[n - 1 - i][8] = true;
  }
  reserved[8][n - 8] = true;
  placeData(mod, reserved, codewords, maskId, version);
  placeFormat(mod, reserved, maskId);
  return mod;
}

function encode(text) {
  const bytes = Buffer.from(String(text), 'utf8');
  const version = chooseVersion(bytes.length);
  const data = encodeData(text, version);
  const codewords = interleave(data, version);
  let best = null;
  let bestScore = Infinity;
  let bestMask = 0;
  for (let mask = 0; mask < 8; mask++) {
    const mod = buildMatrix(codewords, version, mask);
    const score = penalty(mod);
    if (score < bestScore) {
      bestScore = score;
      best = mod;
      bestMask = mask;
    }
  }
  return { text: String(text), version, mask: bestMask, size: best.length, modules: best };
}

function toSvg(encoded, opts = {}) {
  const scale = opts.scale || 4;
  const margin = opts.margin == null ? 4 : opts.margin;
  const dark = opts.dark || '#111111';
  const light = opts.light || '#ffffff';
  const n = encoded.size;
  const dim = (n + margin * 2) * scale;
  const parts = [];
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      if (!encoded.modules[y][x]) continue;
      parts.push(`M${(x + margin) * scale},${(y + margin) * scale}h${scale}v${scale}h-${scale}z`);
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${dim} ${dim}" width="${dim}" height="${dim}" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="${light}"/><path fill="${dark}" d="${parts.join('')}"/></svg>`;
}

function encodeSvg(text, opts) {
  const encoded = encode(text);
  return { ...encoded, svg: toSvg(encoded, opts) };
}

module.exports = { encode, toSvg, encodeSvg, chooseVersion, byteCapacity, sizeOf };
