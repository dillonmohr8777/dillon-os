'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { honestCopy, voiceFromHtml, wordCount, clean } = require('../copy');

test('honestCopy keeps harvested headings and never invents a phone', () => {
  const copy = honestCopy(
    {
      name: 'Narberth Pizza and Steaks',
      city: 'Narberth',
      url: 'https://www.narberthpizza.com/',
      phone: '6106641111',
    },
    {
      voice: {
        headings: ['Narberth Pizza and Steaks', 'Pizza, steaks, and hoagies', 'Family kitchen', 'Late slices'],
        paragraphs: [
          'Neighborhood pizza and steaks in Narberth, cooked in a kitchen you can actually picture.',
          'Pies come out of the oven. Steaks hit the griddle. Nothing here invents a secret menu.',
        ],
        ctaLabels: ['Order online'],
      },
    },
    'food'
  );
  assert.equal(copy.headline, 'Narberth Pizza and Steaks');
  assert.match(copy.sub, /Neighborhood pizza/);
  assert.equal(copy.offerings[0].title, 'Pizza, steaks, and hoagies');
  assert.equal(copy.catalog[0].href, 'https://www.narberthpizza.com/');
  assert.equal(copy.catalog[1].href, 'tel:6106641111');
  assert.doesNotMatch(JSON.stringify(copy), /\u2014/);
  assert.ok(copy.wordCount >= 200);
});

test('honestCopy stays honest when harvest is empty', () => {
  const copy = honestCopy({ name: "Kehan's Auto Service", city: 'Pennsylvania' }, null, 'auto');
  assert.equal(copy.headline, "Kehan's Auto Service");
  assert.equal(copy.catalog.length, 0);
  assert.doesNotMatch(copy.sub, /123 Main|555-|menu item #/i);
  assert.equal(copy.offerings.length, 3);
  assert.ok(wordCount(copy) >= 180);
});

test('voiceFromHtml pulls headings and strips junk tags', () => {
  const voice = voiceFromHtml(
    '<html><head><title>Kehan Auto</title></head><body><h1>Full service auto repair</h1><p>Kehan\'s Auto Service works on cars in the bay, with advisors who can walk the inspection.</p><a href="/book">Book a visit</a></body></html>'
  );
  assert.equal(voice.title, 'Kehan Auto');
  assert.equal(voice.headings[0], 'Full service auto repair');
  assert.match(voice.paragraphs[0], /works on cars/);
  assert.ok(voice.ctaLabels.includes('Book a visit'));
});

test('empty harvest still writes a real homepage word count', () => {
  const copy = honestCopy({ name: "Kehan's Auto Service", city: 'Pennsylvania' }, null, 'auto');
  assert.ok(copy.wordCount >= 320, copy.wordCount);
});

test('clean replaces em dashes', () => {
  assert.equal(clean('Pizza — steaks'), 'Pizza, steaks');
});
