const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { buildSvg, motifKind, uniqueTokens } = require('../lib/align-illustrations.js');

describe('align illustrations', () => {
  it('maps categories onto distinct motifs', () => {
    assert.equal(motifKind('Health', 'Pediatric dentistry'), 'dentist');
    assert.equal(motifKind('Health', 'Veterinary hospital'), 'veterinary');
    assert.equal(motifKind('Home Services', 'HVAC'), 'hvac');
    assert.equal(motifKind('Professional Services', 'Personal injury law'), 'lawyer');
  });

  it('emits unique animated SVGs across a 25-site batch', () => {
    const slugs = Array.from({ length: 25 }, (_, i) => `prospect-${i + 1}`);
    const hashes = new Set();
    for (const slug of slugs) {
      for (let index = 1; index <= 13; index++) {
        const svg = buildSvg({
          slug,
          index,
          vertical: 'Health',
          category: iMotif(slug),
          name: slug,
        });
        assert.match(svg, /<svg /);
        assert.match(svg, /animation:/);
        assert.doesNotMatch(svg, /photoreal|unsplash|pexels/i);
        hashes.add(crypto.createHash('sha1').update(svg).digest('hex'));
      }
    }
    assert.equal(hashes.size, 25 * 13);
  });

  it('keeps Align teal/navy tokens in the Align family', () => {
    const t = uniqueTokens('pennsylvania-dental-group');
    assert.equal(t.ink, '#0A1628');
    assert.match(t.accent, /^#[0-9A-F]{6}$/i);
    assert.match(t.accent2, /^#[0-9A-F]{6}$/i);
  });
});

function iMotif(slug) {
  const n = Number(slug.split('-')[1]);
  const cats = [
    'dentistry', 'veterinary', 'eyecare', 'urgent care', 'hormone clinic',
    'HVAC', 'electric', 'manufacturing', 'landscaping', 'kitchen',
    'flooring', 'insurance', 'law', 'financial', 'fitness',
    'auto repair', 'pediatric dentistry', 'animal hospital', 'plastic surgery',
    'bath and kitchen', 'tags and insurance', 'personal injury', 'training',
    'family dentistry', 'optometry',
  ];
  return cats[(n - 1) % cats.length];
}
