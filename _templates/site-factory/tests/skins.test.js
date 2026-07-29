const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { inferAttitude, inferVertical, buildSkinCss } = require('../lib/skins.js');
const { buildSite } = require('../build-site.js');
const { passingBrief } = require('./helpers.js');

describe('attitude skins', () => {
  it('infers attitude from tokens when omitted', () => {
    assert.equal(
      inferAttitude({ tokens: { border: '5px', radius: '0px' }, category: 'Roofing' }),
      'brutal'
    );
    assert.equal(
      inferAttitude({ tokens: { border: '1px', radius: '28px' }, category: 'Wine Bar' }),
      'glass'
    );
  });

  it('emits distinct per-slug skin CSS for different attitudes', () => {
    const glass = buildSkinCss({ slug: 'a', attitude: 'glass', fonts: { display: 'X' } });
    const brutal = buildSkinCss({ slug: 'b', attitude: 'brutal', fonts: { display: 'X' } });
    const neon = buildSkinCss({ slug: 'c', attitude: 'neon', fonts: { display: 'X' } });
    assert.match(glass, /--glass-blur:28px/);
    assert.match(brutal, /border-radius:0/);
    assert.match(neon, /text-shadow/);
    assert.notEqual(glass, brutal);
    assert.notEqual(brutal, neon);
  });

  it('infers business verticals from the brief', () => {
    assert.equal(inferVertical({ category: 'HVAC repair' }), 'home-services');
    assert.equal(inferVertical({ category: 'Coffee shop' }), 'hospitality');
    assert.equal(inferVertical({ category: 'Accounting firm' }), 'professional');
  });

  it('buildSite injects attitude, vertical structure, and stable readable motion', () => {
    const brief = passingBrief({ slug: 'glass-shop', name: 'Glass Shop', attitude: 'glass' });
    brief.catalog.items[0].href = '#contact';
    const built = buildSite(brief, '/tmp/skin-test');
    assert.match(built.html, /name="attitude" content="glass"/);
    assert.match(built.html, /name="vertical" content="home-services"/);
    assert.match(built.html, /vertical-home-services/);
    assert.match(built.html, /glass-float/);
    assert.match(built.html, /signal-strip/);
    assert.match(built.html, /mobile-action/);
    assert.doesNotMatch(built.html, /marquee-strip|vanish-out/);
    assert.match(built.html, /<a href="#contact">Explore<\/a>/);
    assert.doesNotMatch(built.html, /Plan a visit|Open map/);
    assert.equal(built.sections.length, 10);
    assert.equal(built.images, 12);
    assert.deepEqual(built.duplicateImageReferences, []);
  });
});
