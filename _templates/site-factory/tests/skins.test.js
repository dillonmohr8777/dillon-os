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
    assert.match(neon, /linear-gradient\(160deg,var\(--deep\)/);
    assert.notEqual(glass, brutal);
    assert.notEqual(brutal, neon);
  });

  it('emits Align HCM industry-solutions skin when attitude is align', () => {
    const align = buildSkinCss({ slug: 'align-shop', attitude: 'align', fonts: { display: 'Plus Jakarta Sans' } });
    assert.match(align, /var\(--accent\)/);
    assert.doesNotMatch(align, /--align-teal:#2BB5A0/);
    assert.match(align, /align-tilt/);
    assert.match(align, /align-ken/);
  });

  it('buildSite injects attitude meta and Align media captions', () => {
    const brief = passingBrief({ slug: 'glass-shop', name: 'Glass Shop', attitude: 'glass' });
    const built = buildSite(brief, '/tmp/skin-test');
    assert.match(built.html, /name="attitude" content="glass"/);
    assert.match(built.html, /media-caption/);
    assert.match(built.html, /card-icon/);
    assert.doesNotMatch(built.html, /glass-float/);
    assert.match(built.html, /marquee-strip/);
    assert.match(built.html, /mobile-action/);
    assert.match(built.html, /vanish-out/);
    assert.match(built.html, /t-stagger/);
    assert.match(built.html, /t-tilt/);
    assert.match(built.html, /t-learn/);
    assert.match(built.html, /t-acc/);
    assert.match(built.html, /t-tabs/);
    assert.match(built.html, /t-shimmer/);
  });

  it('align attitude keeps captions, copper icons, maps embed, and ink-reveal closing', () => {
    const brief = passingBrief({
      slug: 'align-clinic',
      name: 'Align Clinic',
      attitude: 'align',
      address: '1 Market St, Philadelphia, PA 19103',
    });
    const built = buildSite(brief, '/tmp/align-skin-test');
    assert.match(built.html, /name="attitude" content="align"/);
    assert.match(built.html, /media-caption/);
    assert.match(built.html, /media-kicker/);
    assert.match(built.html, /card-icon/);
    assert.doesNotMatch(built.html, /glass-float/);
    assert.match(built.html, /map-embed/);
    assert.match(built.html, /maps\.google\.com\/maps\?q=/);
    assert.match(built.html, /ink-reveal/);
    assert.match(built.html, /var\(--accent\)/);
    assert.doesNotMatch(built.html, /--align-teal:#2BB5A0/);
  });
});
