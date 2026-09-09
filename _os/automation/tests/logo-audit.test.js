'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {
  auditLogo, auditSvg, decodePng, encodePng, measureAlpha, removeFlatBackground,
} = require('../lib/logo-audit');

/** Build an RGBA buffer: flat `bg` field with a solid `fg` rectangle inset. */
function synth(width, height, bg, fg, inset = 8, alpha = 255) {
  const rgba = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const o = (y * width + x) * 4;
      const inMark = x >= inset && x < width - inset && y >= inset && y < height - inset;
      const c = inMark ? fg : bg;
      rgba[o] = c[0]; rgba[o + 1] = c[1]; rgba[o + 2] = c[2];
      rgba[o + 3] = inMark ? 255 : alpha;
    }
  }
  return rgba;
}

test('encode and decode round-trip preserves every channel', () => {
  const rgba = synth(64, 32, [255, 255, 255], [20, 80, 160]);
  const png = encodePng(rgba, 64, 32);
  const back = decodePng(png);
  assert.equal(back.error, undefined);
  assert.equal(back.width, 64);
  assert.equal(back.height, 32);
  assert.ok(back.rgba.equals(rgba), 'pixels survive the round trip');
});

test('an opaque logo on a flat white plate gets its background removed', () => {
  const rgba = synth(200, 80, [255, 255, 255], [16, 74, 140], 10);
  const png = encodePng(rgba, 200, 80);

  const before = measureAlpha(rgba, 200, 80);
  assert.equal(before.transparentRatio, 0, 'starts fully opaque');

  const result = auditLogo(png, { format: 'png' });
  assert.equal(result.ok, true, result.reason);
  assert.equal(result.transparent, true);
  assert.equal(result.background_removed, true);
  assert.ok(result.transparent_ratio > 0.02, 'real transparent area exists');
  assert.match(result.transformation, /flood fill/);

  // The emitted bytes must themselves decode as genuinely transparent.
  const out = decodePng(result.bytes);
  assert.equal(out.error, undefined);
  const after = measureAlpha(out.rgba, out.width, out.height);
  assert.ok(after.transparentRatio > 0, 'emitted PNG carries alpha');
});

test('a mark that reuses the plate colour inside itself keeps those pixels', () => {
  // White ring on white plate: a global colour key would hollow the ring out.
  const w = 120, h = 120;
  const rgba = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const o = (y * w + x) * 4;
      const d = Math.hypot(x - w / 2, y - h / 2);
      const onRing = d > 30 && d < 50;
      const c = onRing ? [10, 40, 90] : [255, 255, 255];
      rgba[o] = c[0]; rgba[o + 1] = c[1]; rgba[o + 2] = c[2]; rgba[o + 3] = 255;
    }
  }
  const result = auditLogo(encodePng(rgba, w, h), { format: 'png' });
  assert.equal(result.ok, true, result.reason);

  const out = decodePng(result.bytes);
  const cx = (out.width / 2) | 0, cy = (out.height / 2) | 0;
  const centreAlpha = out.rgba[(cy * out.width + cx) * 4 + 3];
  assert.equal(centreAlpha, 255, 'the white centre inside the ring is preserved, not keyed out');
});

test('an already-transparent logo is passed through untouched', () => {
  const rgba = synth(160, 60, [0, 0, 0], [200, 30, 30], 12, 0);
  const result = auditLogo(encodePng(rgba, 160, 60), { format: 'png' });
  assert.equal(result.ok, true, result.reason);
  assert.equal(result.background_removed, false);
  assert.match(result.transformation, /byte-for-byte/);
});

test('a photograph is refused rather than mangled into a fake cut-out', () => {
  const w = 100, h = 100;
  const rgba = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const o = (y * w + x) * 4;
      rgba[o] = (x * 7) % 256; rgba[o + 1] = (y * 11) % 256; rgba[o + 2] = (x * y) % 256; rgba[o + 3] = 255;
    }
  }
  const result = auditLogo(encodePng(rgba, w, h), { format: 'png' });
  assert.equal(result.ok, false);
  assert.equal(result.transparent, false);
  assert.match(result.reason, /background_not_removable|border is not a single/);
});

test('measurement rejects a transparent canvas that is effectively empty', () => {
  const w = 300, h = 300;
  const rgba = Buffer.alloc(w * h * 4); // all zero = fully transparent
  for (let y = 0; y < 3; y++) for (let x = 0; x < 3; x++) rgba[(y * w + x) * 4 + 3] = 255;
  const result = auditLogo(encodePng(rgba, w, h), { format: 'png' });
  assert.equal(result.ok, false, 'a 3x3 speck on a huge canvas is not a logo');
});

test('undersized marks are held', () => {
  const rgba = synth(40, 12, [255, 255, 255], [0, 0, 0], 2);
  const result = auditLogo(encodePng(rgba, 40, 12), { format: 'png' });
  assert.equal(result.ok, false);
});

test('SVG plate detection separates a real vector mark from a backed one', () => {
  assert.equal(auditSvg(Buffer.from('<svg viewBox="0 0 240 80"><path d="M0 0h10v10z"/></svg>')).ok, true);
  const backed = '<svg viewBox="0 0 240 80"><rect width="100%" height="100%" fill="#ffffff"/><path d="M0 0h10v10z"/></svg>';
  assert.equal(auditSvg(Buffer.from(backed)).ok, false);
  const cleared = '<svg viewBox="0 0 240 80"><rect width="100%" height="100%" fill="none"/></svg>';
  assert.equal(auditSvg(Buffer.from(cleared)).ok, true);
  const vector = auditLogo(Buffer.from('<svg viewBox="0 0 240 80"><path d="M0 0h10v10z"/></svg>'), { format: 'svg' });
  assert.equal(vector.transparent, true);
  assert.equal(vector.width, 240);
});

test('formats with no usable alpha are held with a named reason, never passed', () => {
  const jpg = auditLogo(Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0]), { format: 'jpg' });
  assert.equal(jpg.ok, false);
  assert.equal(jpg.transparent, false);
  assert.match(jpg.reason, /not_auditable/);
  const junk = auditLogo(Buffer.from('nonsense'), { format: 'png' });
  assert.equal(junk.ok, false);
});

test('flood fill refuses a border whose corners disagree', () => {
  const w = 60, h = 60;
  const rgba = Buffer.alloc(w * h * 4, 255);
  for (let i = 0; i < 3; i++) rgba[i] = 0; // one corner black, the rest white
  const out = removeFlatBackground(rgba, w, h);
  assert.ok(out.error, 'mixed corners are not a flat plate');
});
