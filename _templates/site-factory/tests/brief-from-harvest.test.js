const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { buildBrief, fitBriefToMeasuredSpec, looksLikePhone, looksLikeHours } = require('../brief-from-harvest.js');
const { buildSite } = require('../build-site.js');
const { checkSpec } = require('../lib/spec.js');

const harvest = {
  title: 'Test Dental',
  siteUrl: 'https://example.com',
  voice: {
    metaDescription: 'Family dentistry in Philadelphia with Saturday hours for new patients.',
    headings: ['Family dentistry', 'New patients welcome'],
    paragraphs: [
      'Our dentists see families in Philadelphia and keep visits on time for school-day schedules.',
      'Call the front desk to book a cleaning or a same-day emergency exam on Ridge Avenue.',
    ],
    ctaLabels: ['Facebook icon', 'Book a visit'],
  },
  brand: {
    palette: [
      { hex: '#C2410C', weight: 1 },
      { hex: '#F4B942', weight: 1 },
    ],
    fonts: [{ family: 'Georgia' }],
  },
  facts: {
    phone: 'Call Us',
    hours: 'Friendly team focused on comfort and quality dental c',
    jsonLd: [
      {
        '@type': 'Dentist',
        telephone: '(215) 555-0199',
        address: {
          streetAddress: '100 Market St',
          addressLocality: 'Philadelphia',
          addressRegion: 'PA',
          postalCode: '19103',
        },
      },
    ],
  },
};

const target = {
  slug: 'test-dental',
  name: 'Test Dental',
  city: 'Philadelphia',
  vertical: 'dentist',
  vertical_group: 'medical',
};

describe('brief-from-harvest', () => {
  it('keeps JSON-LD phone and address, drops fake hours and social clones', () => {
    const brief = buildBrief(harvest, target, 'https://stripe.com');
    assert.equal(looksLikePhone('Call Us'), false);
    assert.equal(looksLikeHours(harvest.facts.hours), false);
    assert.match(brief.phone, /555/);
    assert.match(brief.address, /Market/);
    assert.equal(brief.hours, undefined);
    assert.equal(brief.social, undefined);
    assert.equal(brief.hero.marquee, undefined);
    assert.equal(brief.hero.ctaPrimary.label, 'Book a visit');
    assert.deepEqual(brief.gallery.imageIndexes, [3, 4, 5, 6, 7]);
    assert.equal(brief.images.length, 12);
    assert.equal(brief.spotlight.imageIndex, 12);
    assert.equal(brief.catalog.items.length, 3);
    assert.equal(brief.composition_ref, 'https://stripe.com');
    assert.equal(brief.attitude, 'glass');
    assert.equal(brief.noindex, true);
  });

  it('fits HTML into the canonical word and image spec', () => {
    const brief = buildBrief(harvest, target, 'https://linear.app');
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'sf-brief-'));
    const measured = fitBriefToMeasuredSpec(brief, () => buildSite(brief, tmp));
    const fails = checkSpec({
      sections: measured.sections.length,
      words: measured.words,
      images: measured.images,
    });
    assert.deepEqual(fails, [], fails.join('; '));
    assert.ok(measured.words >= 350 && measured.words <= 500);
    assert.ok(measured.images >= 12 && measured.images <= 13);
  });
});
