const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { ANIMATED_SLUGS, sceneFor } = require('../generate-unique-media.js');

describe('unique media split', () => {
  it('marks exactly twelve slugs for animation', () => {
    assert.equal(ANIMATED_SLUGS.size, 12);
    assert.ok(ANIMATED_SLUGS.has('train-and-nourish'));
    assert.ok(!ANIMATED_SLUGS.has('pipe-xpress-inc'));
  });

  it('returns distinct scene lines per slot', () => {
    const brief = { vertical: 'hardware', slug: 'pipe-xpress-inc' };
    const scenes = Array.from({ length: 12 }, (_, i) => sceneFor(brief, i + 1));
    assert.equal(new Set(scenes).size, 12);
  });
});
