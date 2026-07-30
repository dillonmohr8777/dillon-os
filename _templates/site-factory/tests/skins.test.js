const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { inferAttitude, buildSkinCss } = require('../lib/skins.js');
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

  it('buildSite injects attitude meta and liquid-glass float', () => {
    const brief = passingBrief({ slug: 'glass-shop', name: 'Glass Shop', attitude: 'glass' });
    const built = buildSite(brief, '/tmp/skin-test');
    assert.match(built.html, /name="attitude" content="glass"/);
    assert.match(built.html, /glass-float/);
    assert.match(built.html, /marquee-strip/);
    assert.match(built.html, /mobile-action/);
    assert.match(built.html, /vanish-out/);
  });
});
