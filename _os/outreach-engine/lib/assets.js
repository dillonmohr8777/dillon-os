/**
 * Tiny unique placeholder images so a demo site-factory build can hit spec
 * without harvesting third-party photos into this public repo.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function png(r, g, b) {
  const w = 8;
  const h = 8;
  const raw = Buffer.alloc((w * 3 + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (w * 3 + 1)] = 0;
    for (let x = 0; x < w; x++) {
      const o = y * (w * 3 + 1) + 1 + x * 3;
      raw[o] = r;
      raw[o + 1] = g;
      raw[o + 2] = b;
    }
  }
  const crc = (bb) => {
    let c = ~0;
    for (const by of bb) {
      c ^= by;
      for (let i = 0; i < 8; i++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
    }
    return ~c >>> 0;
  };
  const chunk = (t, d) => {
    const l = Buffer.alloc(4);
    l.writeUInt32BE(d.length);
    const td = Buffer.concat([Buffer.from(t), d]);
    const cr = Buffer.alloc(4);
    cr.writeUInt32BE(crc(td));
    return Buffer.concat([l, td, cr]);
  };
  const ih = Buffer.alloc(13);
  ih.writeUInt32BE(w, 0);
  ih.writeUInt32BE(h, 4);
  ih[8] = 8;
  ih[9] = 2;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ih),
    chunk('IDAT', zlib.deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function writeUniqueAssets(siteDir, salt = 1, imageCount = 12) {
  const dir = path.join(siteDir, 'assets');
  fs.mkdirSync(dir, { recursive: true });
  for (let i = 1; i <= imageCount; i++) {
    fs.writeFileSync(
      path.join(dir, `image-${i}.webp`),
      png((salt * 53 + i * 17) % 256, (i * 29 + salt * 7) % 256, (salt * 97 + i * 13) % 256)
    );
  }
}

module.exports = { png, writeUniqueAssets };
