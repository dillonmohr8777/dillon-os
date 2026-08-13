const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { buildSite } = require('../build-site.js');
const { passingBrief } = require('./helpers.js');

function imageSrcs(html) {
  return [...html.matchAll(/src="assets\/(image-\d+\.webp)"/g)].map((m) => m[1]);
}

describe('filled cards, unique images, embedded map', () => {
  it('fills offering, experience, and catalog cards with a heading and body', () => {
    const built = buildSite(
      passingBrief({ slug: 'card-copy-co', name: 'Card Copy Co' }),
      '/tmp/card-copy-test'
    );
    assert.match(built.html, /<article class="offering-card[^"]*">[\s\S]*?<h3>[^<]+<\/h3>\s*<p>[^<]{12,}<\/p>/);
    assert.match(built.html, /<div class="experience-grid">[\s\S]*?<h3>[^<]+<\/h3>\s*<p>[^<]{12,}<\/p>/);
    assert.match(built.html, /<article class="catalog-card[^"]*">[\s\S]*?<h3>[^<]+<\/h3>\s*<p>[^<]{12,}<\/p>/);
  });

  it('embeds a square Google Map iframe for the verified address', () => {
    const built = buildSite(
      passingBrief({ slug: 'map-shop', name: 'Map Shop' }),
      '/tmp/map-test'
    );
    assert.match(built.html, /class="map-embed"/);
    assert.match(built.html, /<iframe[^>]+src="https:\/\/maps\.google\.com\/maps\?q=[^"]+output=embed"/);
    assert.match(built.html, /aspect-ratio:1\/1/);
    assert.match(built.html, /width:min\(100%,1080px\)/);
    assert.match(built.html, /1234 Frankford Ave/);
  });

  it('still embeds a name-and-city map when no street address is on file', () => {
    const brief = passingBrief({ slug: 'city-only-co', name: 'City Only Co' });
    delete brief.address;
    const built = buildSite(brief, '/tmp/city-map-test');
    assert.match(built.html, /class="map-embed"/);
    assert.match(built.html, /output=embed/);
    assert.match(built.html, /<span>Location<\/span><strong>Philadelphia<\/strong>/);
  });

  it('never repeats an image file on the page, even when briefs collide', () => {
    const built = buildSite(
      passingBrief({
        slug: 'no-dup-co',
        name: 'No Dup Co',
        social: { heading: 'Feed', imageIndexes: [3, 4, 5, 6, 7, 8] },
        spotlight: { heading: 'Extra line', text: 'A second business line.', imageIndex: 6 },
      }),
      '/tmp/no-dup-test'
    );
    const srcs = imageSrcs(built.html);
    assert.equal(new Set(srcs).size, srcs.length, `duplicate srcs: ${srcs}`);
    assert.equal(srcs.length, 12);
  });

  it('soaks the logo into paper and never highlights type', () => {
    const built = buildSite(
      passingBrief({
        slug: 'ink-logo-co',
        name: 'Ink Logo Co',
        offerings: {
          heading: 'Five shops, <mark>one standard.</mark>',
          items: [
            'Residential dryer vent cleaning with before-and-after airflow readings',
            'Bird guard and vent cap installation to keep nests out for good',
            'Multi-unit and laundromat service with scheduled maintenance plans',
          ],
        },
      }),
      '/tmp/ink-logo-test'
    );
    assert.doesNotMatch(built.html, /<mark[\s>]/);
    assert.match(built.html, /<h2>Five shops, one standard\.<\/h2>/);
    assert.match(built.html, /class="ink-reveal reveal"/);
    assert.match(built.html, /logo-outro-wordmark/);
    assert.match(built.html, /logo-outro-tag/);
    assert.doesNotMatch(built.html, /<h2>[^<]*,\s*<\/h2>/);
  });

  it('never splits a heading on a comma or mid-phrase', () => {
    const built = buildSite(
      passingBrief({
        slug: 'comma-head-co',
        name: 'Comma Head Co',
        offerings: {
          heading: 'Dentistry for all ages.',
          items: [
            'Follow-up is a real person, not a portal maze.',
            'Family exams and cleanings so kids, parents, and grandparents share one office.',
            'A comfort-first chairside manner the reviews keep naming by name.',
          ],
        },
        experience: {
          heading: 'What a visit actually feels like.',
          items: [
            'You call or schedule online. The front desk is the first proof they mean comfort.',
            'Treatment is explained in plain language before anything starts.',
            'Follow-up is a real person, not a portal maze.',
          ],
        },
      }),
      '/tmp/comma-head-test'
    );
    assert.match(built.html, /<h3>Follow-up is a real person, not a portal maze<\/h3>/);
    assert.match(built.html, /<h3>Family exams and cleanings so kids, parents, and grandparents share one office<\/h3>/);
    assert.match(built.html, /<h3>A comfort-first chairside manner the reviews keep naming by name<\/h3>/);
    assert.match(built.html, /<h3>You call or schedule online<\/h3>/);
    assert.doesNotMatch(built.html, /<h3>Follow-up is a real person, not<\/h3>/);
    assert.doesNotMatch(built.html, /<h3>Family exams and cleanings so kids<\/h3>/);
    assert.doesNotMatch(built.html, /<h3>A comfort-first chairside manner the reviews<\/h3>/);
  });
});
