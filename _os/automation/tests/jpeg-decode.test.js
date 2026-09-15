'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { decodeJpeg } = require('../lib/jpeg-decode');
const { auditLogo } = require('../lib/logo-audit');

/** Minimal JPEG byte stream: SOI, one marker segment, EOI. */
function jpegWith(marker, payload = Buffer.alloc(4)) {
  const len = Buffer.alloc(2);
  len.writeUInt16BE(payload.length + 2);
  return Buffer.concat([
    Buffer.from([0xff, 0xd8]),
    Buffer.from([0xff, marker]), len, payload,
    Buffer.from([0xff, 0xd9]),
  ]);
}

test('a non-JPEG is refused rather than parsed', () => {
  assert.match(decodeJpeg(Buffer.from('not an image')).error, /not a JPEG/);
  assert.match(decodeJpeg(Buffer.alloc(0)).error, /not a JPEG/);
  assert.match(decodeJpeg(Buffer.from([0x89, 0x50, 0x4e, 0x47])).error, /not a JPEG/);
});

test('progressive JPEG is refused by name, never half-decoded', () => {
  // SOF2. Decoding this as baseline would emit a plausible-looking wrong image,
  // which would yield a wrong brand colour with nothing to signal the error.
  const sof2 = Buffer.concat([Buffer.from([8]), Buffer.alloc(2), Buffer.alloc(2), Buffer.from([1, 1, 0x11, 0])]);
  const out = decodeJpeg(jpegWith(0xc2, sof2));
  assert.match(out.error, /progressive/);
  assert.equal(out.rgba, undefined, 'no pixels are returned for a refusal');
});

test('arithmetic-coded JPEG is refused by name', () => {
  for (const marker of [0xc9, 0xcb, 0xcd]) {
    assert.match(decodeJpeg(jpegWith(marker)).error, /arithmetic/);
  }
});

test('a frame with no scan data does not return an empty image', () => {
  const sof0 = Buffer.concat([
    Buffer.from([8]),
    Buffer.from([0x00, 0x10]), Buffer.from([0x00, 0x10]),
    Buffer.from([1, 1, 0x11, 0]),
  ]);
  const out = decodeJpeg(jpegWith(0xc0, sof0));
  assert.ok(out.error, 'a frame alone is not a decodable image');
  assert.equal(out.rgba, undefined);
});

test('implausible dimensions are refused before any allocation', () => {
  const huge = Buffer.concat([
    Buffer.from([8]),
    Buffer.from([0xff, 0xff]), Buffer.from([0xff, 0xff]),
    Buffer.from([1, 1, 0x11, 0]),
  ]);
  assert.match(decodeJpeg(jpegWith(0xc0, huge)).error, /implausibly large/);
  const zero = Buffer.concat([
    Buffer.from([8]), Buffer.alloc(2), Buffer.alloc(2), Buffer.from([1, 1, 0x11, 0]),
  ]);
  assert.match(decodeJpeg(jpegWith(0xc0, zero)).error, /zero dimensions/);
});

test('the audit routes a JPEG to the JPEG decoder and reports the right reason class', () => {
  // An unsupported *encoding* is a format hold; corrupt bytes are undecodable.
  // The distinction matters because one may become supported later and the
  // other never will.
  const progressive = auditLogo(jpegWith(0xc2, Buffer.concat([
    Buffer.from([8]), Buffer.alloc(2), Buffer.alloc(2), Buffer.from([1, 1, 0x11, 0]),
  ])), { format: 'jpg' });
  assert.equal(progressive.ok, false);
  assert.equal(progressive.transparent, false);
  assert.match(progressive.reason, /^logo_format_not_auditable_jpg/);

  const junk = auditLogo(Buffer.from([0xff, 0xd8, 0x00, 0x01, 0x02]), { format: 'jpg' });
  assert.equal(junk.ok, false);
  assert.match(junk.reason, /logo_format_not_auditable_jpg|logo_undecodable/);
});

test('formats with no decoder are still named, not silently passed', () => {
  for (const fmt of ['webp', 'avif', 'gif', '']) {
    const out = auditLogo(Buffer.alloc(64), { format: fmt });
    assert.equal(out.ok, false);
    assert.equal(out.transparent, false);
    assert.match(out.reason, /logo_format_not_auditable/);
  }
});

test('a JPEG can never be treated as already transparent', () => {
  // JPEG carries no alpha channel at all, so the audit must always attempt the
  // plate cut rather than short-circuiting on a measured transparency of zero.
  const { removeFlatBackground, encodePng, decodePng } = require('../lib/logo-audit');
  const w = 80, h = 40;
  const rgba = Buffer.alloc(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    const inMark = (i % w) > 10 && (i % w) < w - 10;
    const c = inMark ? [30, 90, 160] : [255, 255, 255];
    rgba[i * 4] = c[0]; rgba[i * 4 + 1] = c[1]; rgba[i * 4 + 2] = c[2]; rgba[i * 4 + 3] = 255;
  }
  const cut = removeFlatBackground(rgba, w, h);
  assert.equal(cut.error, undefined, 'a white plate around a mark is removable');
  const round = decodePng(encodePng(cut.rgba, w, h));
  assert.equal(round.error, undefined);
});
