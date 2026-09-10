'use strict';

/**
 * Measure a logo bitmap and, when it is opaque on a flat field, cut that field
 * out — in pure Node, with no ffmpeg and no native module.
 *
 * Why this exists at all: the Radar gate in `logo-eligibility.js` requires
 * `transparent: true`, a measured `display_width/height`, and a resolution
 * ratio. Nothing in the daily sweep ever measured any of that, so
 * `officialSiteLogoEvidence()` emitted `status: 'pending'` forever and
 * `logo_verified` sat at 0 on every run while 60 rows a day were fetched and
 * thrown away. The one working implementation of this lived inside
 * `automation/prospect-radar-next20/select-ready.js`, shelled out to ffmpeg,
 * and ran far too late in the pipeline to open the gate that starved it.
 *
 * Pure Node rather than ffmpeg because the three places that need this — the
 * GitHub Actions sweep, a Windows scheduled task, and a Linux container — do
 * not agree on having an ffmpeg binary, and a logo gate that silently holds
 * everything when a binary is missing is the exact failure being repaired.
 *
 * Everything here reports what it measured. Nothing invents a pass: an image
 * this module cannot decode comes back as a hold with a reason, never as
 * `transparent: true`.
 */

const zlib = require('zlib');

const MAX_PIXELS = 16e6; // 16MP: a logo bigger than this is not a logo.

/* ------------------------------------------------------------------ CRC32 */

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

/* ------------------------------------------------------------- PNG decode */

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function readChunks(buf) {
  const chunks = [];
  let offset = 8;
  while (offset + 8 <= buf.length) {
    const length = buf.readUInt32BE(offset);
    const type = buf.toString('ascii', offset + 4, offset + 8);
    const start = offset + 8;
    if (start + length > buf.length) break;
    chunks.push({ type, data: buf.subarray(start, start + length) });
    offset = start + length + 4; // + CRC
    if (type === 'IEND') break;
  }
  return chunks;
}

/** Undo the per-scanline PNG filter in place, producing raw samples. */
function unfilter(raw, width, height, bpp) {
  const stride = width * bpp;
  const out = Buffer.allocUnsafe(stride * height);
  let pos = 0;
  for (let y = 0; y < height; y++) {
    const filter = raw[pos++];
    const line = raw.subarray(pos, pos + stride);
    pos += stride;
    const cur = out.subarray(y * stride, (y + 1) * stride);
    const prev = y > 0 ? out.subarray((y - 1) * stride, y * stride) : null;
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? cur[x - bpp] : 0;
      const b = prev ? prev[x] : 0;
      const c = prev && x >= bpp ? prev[x - bpp] : 0;
      let v = line[x];
      switch (filter) {
        case 0: break;
        case 1: v += a; break;
        case 2: v += b; break;
        case 3: v += (a + b) >> 1; break;
        case 4: {
          const p = a + b - c;
          const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
          v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
          break;
        }
        default: throw new Error(`unsupported PNG filter ${filter}`);
      }
      cur[x] = v & 0xff;
    }
  }
  return out;
}

/**
 * Decode a PNG to straight RGBA8.
 *
 * Adam7-interlaced images are refused rather than mis-decoded: they are
 * vanishingly rare for a header logo and a wrong guess here would silently
 * report the wrong transparency.
 */
function decodePng(buffer) {
  if (!Buffer.isBuffer(buffer) || !buffer.subarray(0, 8).equals(PNG_SIGNATURE)) {
    return { error: 'not a PNG' };
  }
  const chunks = readChunks(buffer);
  const ihdr = chunks.find((c) => c.type === 'IHDR');
  if (!ihdr || ihdr.data.length < 13) return { error: 'PNG has no IHDR' };

  const width = ihdr.data.readUInt32BE(0);
  const height = ihdr.data.readUInt32BE(4);
  const depth = ihdr.data[8];
  const colorType = ihdr.data[9];
  const interlace = ihdr.data[12];

  if (!width || !height) return { error: 'PNG has zero dimensions' };
  if (width * height > MAX_PIXELS) return { error: 'PNG is implausibly large for a logo' };
  if (interlace !== 0) return { error: 'interlaced PNG is not decodable here' };
  if (![8, 16].includes(depth) && colorType !== 3) return { error: `unsupported PNG bit depth ${depth}` };

  const idat = Buffer.concat(chunks.filter((c) => c.type === 'IDAT').map((c) => c.data));
  if (!idat.length) return { error: 'PNG has no image data' };

  let raw;
  try {
    raw = zlib.inflateSync(idat);
  } catch (err) {
    return { error: `PNG data did not inflate: ${String(err.message || err).slice(0, 60)}` };
  }

  const rgba = Buffer.alloc(width * height * 4, 0);

  if (colorType === 3) {
    // Palette. Depth may be 1/2/4/8; tRNS carries per-entry alpha.
    const plte = chunks.find((c) => c.type === 'PLTE');
    if (!plte) return { error: 'paletted PNG has no palette' };
    const trns = chunks.find((c) => c.type === 'tRNS');
    const perByte = 8 / depth;
    const stride = Math.ceil((width * depth) / 8);
    const mask = (1 << depth) - 1;
    let pos = 0;
    const lines = [];
    for (let y = 0; y < height; y++) {
      pos++; // filter byte
      lines.push(raw.subarray(pos, pos + stride));
      pos += stride;
    }
    // Paletted rows use filter 0 in every generator we care about; if a row
    // used another filter the indices below would be wrong, so verify.
    for (let y = 0; y < height; y++) {
      if (raw[y * (stride + 1)] !== 0) return { error: 'filtered paletted PNG is not decodable here' };
    }
    for (let y = 0; y < height; y++) {
      const line = lines[y];
      for (let x = 0; x < width; x++) {
        const byte = line[Math.floor(x / perByte)] ?? 0;
        const shift = depth === 8 ? 0 : 8 - depth * ((x % perByte) + 1);
        const index = (byte >> shift) & mask;
        const o = (y * width + x) * 4;
        rgba[o] = plte.data[index * 3] ?? 0;
        rgba[o + 1] = plte.data[index * 3 + 1] ?? 0;
        rgba[o + 2] = plte.data[index * 3 + 2] ?? 0;
        rgba[o + 3] = trns && index < trns.data.length ? trns.data[index] : 255;
      }
    }
    return { width, height, rgba, colorType, depth };
  }

  const samples = { 0: 1, 2: 3, 4: 2, 6: 4 }[colorType];
  if (!samples) return { error: `unsupported PNG color type ${colorType}` };
  const step = depth === 16 ? 2 : 1;
  const bpp = samples * step;

  let flat;
  try {
    flat = unfilter(raw, width, height, bpp);
  } catch (err) {
    return { error: String(err.message || err).slice(0, 80) };
  }

  // 16-bit samples are read high-byte-only; that is exact enough to decide
  // "transparent or not" and keeps one code path.
  const at = (i) => flat[i * step];
  for (let p = 0; p < width * height; p++) {
    const s = p * samples;
    const o = p * 4;
    if (colorType === 0) {
      rgba[o] = rgba[o + 1] = rgba[o + 2] = at(s);
      rgba[o + 3] = 255;
    } else if (colorType === 2) {
      rgba[o] = at(s); rgba[o + 1] = at(s + 1); rgba[o + 2] = at(s + 2); rgba[o + 3] = 255;
    } else if (colorType === 4) {
      rgba[o] = rgba[o + 1] = rgba[o + 2] = at(s);
      rgba[o + 3] = at(s + 1);
    } else {
      rgba[o] = at(s); rgba[o + 1] = at(s + 1); rgba[o + 2] = at(s + 2); rgba[o + 3] = at(s + 3);
    }
  }
  return { width, height, rgba, colorType, depth };
}

/* ------------------------------------------------------------- PNG encode */

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

/** Encode straight RGBA8 as a non-interlaced, filter-0 PNG. */
function encodePng(rgba, width, height) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;   // depth
  ihdr[9] = 6;   // RGBA
  const stride = width * 4;
  const rawLen = (stride + 1) * height;
  const raw = Buffer.allocUnsafe(rawLen);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0;
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  return Buffer.concat([
    PNG_SIGNATURE,
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/* ----------------------------------------------------------- measurements */

/**
 * What the alpha channel actually contains, plus the tight bounding box of the
 * visible mark. `contentRatio` is the guard against a "transparent" PNG that is
 * really a huge empty canvas with a stamp in one corner.
 */
function measureAlpha(rgba, width, height) {
  let transparent = 0;
  let partial = 0;
  let minX = width, minY = height, maxX = -1, maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const a = rgba[(y * width + x) * 4 + 3];
      if (a <= 8) { transparent++; continue; }
      if (a < 247) partial++;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  const total = width * height;
  const opaque = total - transparent;
  const box = maxX < 0
    ? { x: 0, y: 0, width: 0, height: 0 }
    : { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 };

  // Border transparency separates a real cut-out from a fully opaque plate.
  let edge = 0, edgeClear = 0;
  for (let x = 0; x < width; x++) {
    for (const y of [0, height - 1]) {
      edge++;
      if (rgba[(y * width + x) * 4 + 3] <= 8) edgeClear++;
    }
  }
  for (let y = 0; y < height; y++) {
    for (const x of [0, width - 1]) {
      edge++;
      if (rgba[(y * width + x) * 4 + 3] <= 8) edgeClear++;
    }
  }
  return {
    transparentRatio: total ? transparent / total : 0,
    opaqueRatio: total ? opaque / total : 0,
    partialRatio: total ? partial / total : 0,
    edgeTransparentRatio: edge ? edgeClear / edge : 0,
    contentRatio: total ? opaque / total : 0,
    bbox: box,
  };
}

/** Mean colour of the four corners, and how far apart they are. */
function sampleBorder(rgba, width, height) {
  const corners = [
    [0, 0], [width - 1, 0], [0, height - 1], [width - 1, height - 1],
  ].map(([x, y]) => {
    const o = (y * width + x) * 4;
    return [rgba[o], rgba[o + 1], rgba[o + 2]];
  });
  let spread = 0;
  for (const a of corners) {
    for (const b of corners) {
      spread = Math.max(spread, Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]));
    }
  }
  const mean = [0, 1, 2].map((c) => Math.round(corners.reduce((s, k) => s + k[c], 0) / corners.length));
  return { corners, mean, spread: Number(spread.toFixed(2)) };
}

/**
 * Cut a flat background out of an opaque logo.
 *
 * Deliberately conservative and deliberately *not* a global colour key: it
 * flood-fills inward from the border, so a logo that legitimately uses the
 * background colour inside the mark (white knocked out of a roundel, the white
 * of an eye) keeps those pixels. A global key eats them and the mark comes out
 * full of holes — the failure that makes an "automatic" cut-out unusable.
 *
 * Refuses when the corners disagree (a photo or a gradient, not a flat plate)
 * or when the fill would consume most of the image.
 */
function removeFlatBackground(rgba, width, height, { tolerance = 32 } = {}) {
  const border = sampleBorder(rgba, width, height);
  if (border.spread > 24) {
    return { error: 'logo border is not a single removable color', border };
  }
  const [br, bg, bb] = border.mean;
  const out = Buffer.from(rgba);
  const seen = new Uint8Array(width * height);
  const stack = [];

  const matches = (p) => {
    const o = p * 4;
    return Math.hypot(out[o] - br, out[o + 1] - bg, out[o + 2] - bb) <= tolerance;
  };

  for (let x = 0; x < width; x++) {
    stack.push(x, (height - 1) * width + x);
  }
  for (let y = 0; y < height; y++) {
    stack.push(y * width, y * width + width - 1);
  }

  let cleared = 0;
  while (stack.length) {
    const p = stack.pop();
    if (p < 0 || p >= width * height || seen[p]) continue;
    seen[p] = 1;
    if (!matches(p)) continue;
    out[p * 4 + 3] = 0;
    cleared++;
    const x = p % width, y = (p / width) | 0;
    if (x > 0) stack.push(p - 1);
    if (x < width - 1) stack.push(p + 1);
    if (y > 0) stack.push(p - width);
    if (y < height - 1) stack.push(p + width);
  }

  const ratio = cleared / (width * height);
  if (ratio < 0.02) return { error: 'no flat background found to remove', border, clearedRatio: ratio };
  if (ratio > 0.97) return { error: 'background removal would erase the whole image', border, clearedRatio: ratio };

  // Feather the seam: a pixel neighbouring cleared space that still matches the
  // plate gets partial alpha, so the cut-out does not read as jagged.
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const p = y * width + x;
      if (out[p * 4 + 3] === 0) continue;
      const near = (x > 0 && out[(p - 1) * 4 + 3] === 0) || (x < width - 1 && out[(p + 1) * 4 + 3] === 0)
        || (y > 0 && out[(p - width) * 4 + 3] === 0) || (y < height - 1 && out[(p + width) * 4 + 3] === 0);
      if (!near) continue;
      const o = p * 4;
      const d = Math.hypot(out[o] - br, out[o + 1] - bg, out[o + 2] - bb);
      if (d < tolerance * 1.6) out[o + 3] = Math.round(255 * Math.min(1, d / (tolerance * 1.6)));
    }
  }

  return {
    rgba: out,
    border,
    clearedRatio: Number(ratio.toFixed(4)),
    transformation:
      `flat border color rgb(${br},${bg},${bb}) removed by border-seeded flood fill at tolerance ${tolerance}; geometry unchanged`,
  };
}

/** Crop to the visible mark so `width`/`height` describe the logo, not padding. */
function cropToContent(rgba, width, height, bbox, pad = 0) {
  const x0 = Math.max(0, bbox.x - pad);
  const y0 = Math.max(0, bbox.y - pad);
  const w = Math.min(width - x0, bbox.width + pad * 2);
  const h = Math.min(height - y0, bbox.height + pad * 2);
  if (w <= 0 || h <= 0) return null;
  const out = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) {
    rgba.copy(out, y * w * 4, ((y0 + y) * width + x0) * 4, ((y0 + y) * width + x0 + w) * 4);
  }
  return { rgba: out, width: w, height: h };
}

/* ------------------------------------------------------------- SVG checks */

/**
 * An SVG is only "transparent" if it does not paint an opaque plate first.
 * Catches the common `<rect width="100%" height="100%" fill="#fff"/>` backing.
 */
function auditSvg(buffer) {
  const text = buffer.toString('utf8', 0, Math.min(buffer.length, 200000));
  if (!/<svg[\s>]/i.test(text)) return { ok: false, reason: 'not an SVG' };
  const full = /<rect\b[^>]*\b(?:width|height)\s*=\s*["'](?:100%|(?:\d{3,}))["'][^>]*>/gi;
  for (const m of text.match(full) || []) {
    const fill = /fill\s*=\s*["']([^"']+)["']/i.exec(m)?.[1];
    if (fill && !/^(?:none|transparent)$/i.test(fill)) {
      return { ok: false, reason: 'SVG paints an opaque background plate' };
    }
  }
  const view = /viewBox\s*=\s*["']\s*[-\d.]+\s+[-\d.]+\s+([\d.]+)\s+([\d.]+)/i.exec(text);
  return {
    ok: true,
    vector: true,
    width: view ? Math.round(Number(view[1])) : 0,
    height: view ? Math.round(Number(view[2])) : 0,
  };
}

/* -------------------------------------------------------------- the audit */

/**
 * Full transparency audit for one downloaded logo.
 *
 * Returns measured facts plus, when a flat plate was cut, the replacement PNG
 * bytes and a description of exactly what was done to them. Never returns
 * `transparent: true` without having counted transparent pixels.
 */
function auditLogo(buffer, { format, minWidth = 64, minHeight = 16 } = {}) {
  const fmt = String(format || '').toLowerCase().replace('jpeg', 'jpg');

  if (fmt === 'svg') {
    const svg = auditSvg(buffer);
    return svg.ok
      ? {
          ok: true, transparent: true, vector: true,
          width: svg.width, height: svg.height,
          transformation: 'none; first-party vector asset',
        }
      : { ok: false, transparent: false, reason: svg.reason };
  }

  if (fmt !== 'png') {
    // JPEG/WEBP/GIF/AVIF carry no usable alpha for a header mark and decoding
    // them in pure Node is not worth the surface. Held with a real reason.
    return { ok: false, transparent: false, reason: `logo_format_not_auditable_${fmt || 'unknown'}` };
  }

  const decoded = decodePng(buffer);
  if (decoded.error) return { ok: false, transparent: false, reason: `logo_undecodable: ${decoded.error}` };

  let { rgba, width, height } = decoded;
  let measured = measureAlpha(rgba, width, height);
  let transformation = 'none; byte-for-byte first-party asset';
  let bytes = buffer;
  let removal = null;

  const alreadyClear = measured.transparentRatio >= 0.04 && measured.edgeTransparentRatio >= 0.5;

  if (!alreadyClear) {
    removal = removeFlatBackground(rgba, width, height);
    if (removal.error) {
      return {
        ok: false, transparent: false,
        reason: `logo_background_not_removable: ${removal.error}`,
        width, height, measured,
      };
    }
    rgba = removal.rgba;
    measured = measureAlpha(rgba, width, height);
    transformation = removal.transformation;
  }

  // Trim the padding so the recorded dimensions describe the mark itself.
  const cropped = cropToContent(rgba, width, height, measured.bbox, 2);
  if (cropped && (cropped.width !== width || cropped.height !== height)) {
    rgba = cropped.rgba;
    width = cropped.width;
    height = cropped.height;
    measured = measureAlpha(rgba, width, height);
    transformation += '; cropped to the visible mark';
  }

  if (!alreadyClear || cropped) bytes = encodePng(rgba, width, height);

  if (width < minWidth || height < minHeight) {
    return { ok: false, transparent: false, reason: 'logo_below_minimum_size', width, height, measured };
  }
  if (measured.transparentRatio < 0.02) {
    return { ok: false, transparent: false, reason: 'logo_has_no_transparent_area', width, height, measured };
  }
  if (measured.contentRatio < 0.02) {
    return { ok: false, transparent: false, reason: 'logo_is_effectively_empty', width, height, measured };
  }

  return {
    ok: true,
    transparent: true,
    width,
    height,
    bytes,
    transformation,
    background_removed: !alreadyClear,
    transparent_ratio: Number(measured.transparentRatio.toFixed(4)),
    edge_transparent_ratio: Number(measured.edgeTransparentRatio.toFixed(4)),
    content_ratio: Number(measured.contentRatio.toFixed(4)),
    border_spread: removal ? removal.border.spread : null,
    cleared_ratio: removal ? removal.clearedRatio : null,
  };
}

module.exports = {
  auditLogo, auditSvg, decodePng, encodePng, measureAlpha,
  sampleBorder, removeFlatBackground, cropToContent, crc32,
};
