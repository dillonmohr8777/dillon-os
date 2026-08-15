const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { isAnimatedSlug, sceneFor } = require('../generate-unique-media.js');

describe('unique media split', () => {
  it('animates every factory slug', () => {
    assert.equal(isAnimatedSlug('train-and-nourish'), true);
    assert.equal(isAnimatedSlug('pipe-xpress-inc'), true);
    assert.equal(isAnimatedSlug('johnny-s-pizza'), true);
  });

  it('returns distinct scene lines per slot', () => {
    const brief = { vertical: 'hardware', slug: 'pipe-xpress-inc' };
    const scenes = Array.from({ length: 12 }, (_, i) => sceneFor(brief, i + 1));
    assert.equal(new Set(scenes).size, 12);
  });
});
