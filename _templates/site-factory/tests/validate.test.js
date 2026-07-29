const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  assertSafeSlug,
  assertPublicHttpUrl,
  assertSafeImageContentType,
  assertSafeImageExt,
  assertImageByteLimit,
  MAX_IMAGE_BYTES,
} = require('../lib/validate.js');
const { checkSpec, SPEC } = require('../lib/spec.js');

describe('validate.slug', () => {
  it('accepts kebab-case slugs', () => {
    assert.equal(assertSafeSlug('corner-tap-house'), 'corner-tap-house');
    assert.equal(assertSafeSlug('a'), 'a');
  });

  it('rejects traversal and hostile slugs', () => {
    for (const bad of ['../etc', 'foo/bar', 'foo\\bar', 'UPPER', 'has_under', 'spaced out', '', 'foo..bar', '-leading', 'trail-']) {
      assert.throws(() => assertSafeSlug(bad), /slug/);
    }
  });
});

describe('validate.urls', () => {
  it('accepts public http(s)', () => {
    assert.match(assertPublicHttpUrl('https://example.com/path'), /^https:\/\//);
    assert.match(assertPublicHttpUrl('http://example.com'), /^http:\/\//);
  });

  it('rejects non-public and non-http schemes', () => {
    for (const bad of [
      'file:///etc/passwd',
      'javascript:alert(1)',
      'data:text/html,hi',
      'https://localhost/x',
      'https://127.0.0.1/x',
      'https://192.168.1.1/x',
      'https://10.0.0.2/x',
      'https://169.254.169.254/latest',
      'https://metadata.google.internal/',
      'not-a-url',
    ]) {
      assert.throws(() => assertPublicHttpUrl(bad), /url|host|http/i);
    }
  });
});

describe('validate.images', () => {
  it('caps bytes and content types', () => {
    assert.equal(assertSafeImageContentType('image/webp'), 'image/webp');
    assert.throws(() => assertSafeImageContentType('application/octet-stream'), /content-type/);
    assert.equal(assertSafeImageExt('JPEG'), 'jpg');
    assert.throws(() => assertSafeImageExt('exe'), /extension/);
    assert.equal(assertImageByteLimit(9000), 9000);
    assert.throws(() => assertImageByteLimit(100), /too small/);
    assert.throws(() => assertImageByteLimit(MAX_IMAGE_BYTES + 1), /cap/);
  });
});

describe('spec.checkSpec', () => {
  it('passes in-range metrics', () => {
    assert.deepEqual(checkSpec({ sections: 10, words: 400, images: 12 }), []);
  });

  it('fails outside canonical ranges', () => {
    const fails = checkSpec({ sections: 8, words: 200, images: 11 });
    assert.equal(fails.length, 3);
    assert.ok(fails.some((f) => f.includes('sections')));
    assert.ok(fails.some((f) => f.includes('words')));
    assert.ok(fails.some((f) => f.includes('images')));
  });

  it('exports measured ranges', () => {
    assert.deepEqual(SPEC.sections, [9, 11]);
    assert.deepEqual(SPEC.words, [350, 500]);
    assert.deepEqual(SPEC.images, [12, 13]);
  });
});
