/**
 * Tiny PNG writer for D.I.L.L.O.N. OS home-screen icons.
 * No native deps — iOS Add to Home Screen needs real PNGs, not SVG.
 */
'use strict';

const zlib = require('node:zlib');

const INK = [10, 15, 12, 255];
const GREEN = [134, 239, 172, 255];

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function chunk(tag, data) {
  const t = Buffer.from(tag);
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const crcBuf = Buffer.concat([t, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcBuf));
  return Buffer.concat([len, t, data, crc]);
}

function encodePng(width, height, rgba) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    const row = y * (width * 4 + 1);
    raw[row] = 0;
    rgba.copy(raw, row + 1, y * width * 4, (y + 1) * width * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function setPx(rgba, w, x, y, color) {
  if (x < 0 || y < 0 || x >= w || y >= w) return;
  const i = (y * w + x) * 4;
  rgba[i] = color[0];
  rgba[i + 1] = color[1];
  rgba[i + 2] = color[2];
  rgba[i + 3] = color[3];
}

function fillCircle(rgba, w, cx, cy, r, color) {
  const r2 = r * r;
  const x0 = Math.max(0, Math.floor(cx - r));
  const x1 = Math.min(w - 1, Math.ceil(cx + r));
  const y0 = Math.max(0, Math.floor(cy - r));
  const y1 = Math.min(w - 1, Math.ceil(cy + r));
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const dx = x + 0.5 - cx;
      const dy = y + 0.5 - cy;
      if (dx * dx + dy * dy <= r2) setPx(rgba, w, x, y, color);
    }
  }
}

function drawD(rgba, w) {
  const cx = w / 2;
  const cy = w / 2;
  const stemX0 = Math.round(w * 0.32);
  const stemX1 = Math.round(w * 0.42);
  const y0 = Math.round(w * 0.30);
  const y1 = Math.round(w * 0.70);
  const bowlR = w * 0.20;
  const bowlCx = w * 0.42;
  const innerR = bowlR - w * 0.09;
  for (let y = y0; y <= y1; y++) {
    for (let x = stemX0; x <= stemX1; x++) setPx(rgba, w, x, y, GREEN);
  }
  fillCircle(rgba, w, bowlCx, cy, bowlR, GREEN);
  fillCircle(rgba, w, bowlCx, cy, innerR, INK);
  for (let y = y0; y <= y1; y++) {
    for (let x = stemX0; x <= stemX1; x++) setPx(rgba, w, x, y, GREEN);
  }
}

function iconPng(size) {
  const rgba = Buffer.alloc(size * size * 4);
  for (let i = 0; i < size * size; i++) {
    rgba[i * 4] = INK[0];
    rgba[i * 4 + 1] = INK[1];
    rgba[i * 4 + 2] = INK[2];
    rgba[i * 4 + 3] = 255;
  }
  const cx = size / 2;
  const outer = size * 0.46;
  const inner = size * 0.40;
  fillCircle(rgba, size, cx, cx, outer, GREEN);
  fillCircle(rgba, size, cx, cx, inner, INK);
  drawD(rgba, size);
  return encodePng(size, size, rgba);
}

function writeIcons(dir, fs, path) {
  fs.mkdirSync(dir, { recursive: true });
  const files = {
    'icon-192.png': iconPng(192),
    'icon-512.png': iconPng(512),
    'apple-touch-icon.png': iconPng(180),
  };
  for (const [name, buf] of Object.entries(files)) {
    fs.writeFileSync(path.join(dir, name), buf);
  }
  return Object.keys(files);
}

module.exports = { iconPng, writeIcons };
