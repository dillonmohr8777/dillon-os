'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { renderSite, jsonLd } = require('../render');
const { honestCopy } = require('../copy');

function sampleBrief(over = {}) {
  const copy = honestCopy(
    {
      name: 'Narberth Pizza and Steaks',
      city: 'Narberth',
      url: 'https://www.narberthpizza.com/',
      phone: '6106641111',
      address: '832 Montgomery Ave, Narberth, PA',
    },
    {
      voice: {
        headings: ['Narberth Pizza and Steaks', 'The pie', 'The steak', 'The room'],
        paragraphs: [
          'A Narberth kitchen that leads with pizza and steaks, not a stock dining room.',
          'The preview shows the plate and the pass. Hours stay on their official site.',
        ],
      },
    },
    'food'
  );
  return {
    slug: 'narberth-pizza',
    name: 'Narberth Pizza and Steaks',
    city: 'Narberth',
    category: 'Food',
    family: 'food',
    mode: 'food',
    url: 'https://www.narberthpizza.com/',
    phone: '6106641111',
    address: '832 Montgomery Ave, Narberth, PA',
    hours: '',
    logo: true,
    logoSrc: 'assets/logo.png',
    tokens: {
      paper: '#F4EFE7',
      ink: '#1A1410',
      accent: '#C2410C',
      accent2: '#E7A843',
      panel: '#E8D9C8',
      deep: '#2A1810',
      onPaper: '#090909',
      onAccent: '#FFFFFF',
      onDeep: '#FFFFFF',
      radius: '22px',
      border: '1px',
    },
    fonts: { display: 'Newsreader', text: 'Figtree' },
    attitude: 'warm',
    marquee: ['Narberth Pizza and Steaks', 'Narberth', 'The plate'],
    imageAlts: ['Plate', 'Pass', 'Prep', 'Room', 'Craft'],
    imageDisclosure: 'Photographs harvested from the official site and recomposed as concept collages.',
    ...copy,
    ...over,
  };
}

test('renderSite ships the design-system homepage, not a four-section stub', () => {
  const html = renderSite(sampleBrief());
  assert.match(html, /noindex/);
  assert.match(html, /application\/ld\+json/);
  assert.match(html, /class="hero"/);
  assert.match(html, /offering-card/);
  assert.match(html, /catalog-card/);
  assert.match(html, /contact-system/);
  assert.match(html, /mobile-action/);
  assert.match(html, /prefers-reduced-motion/);
  assert.match(html, /skip-link/);
  assert.ok((html.match(/<section/g) || []).length >= 9);
  assert.ok((html.match(/class="slide/g) || []).length >= 5);
  assert.doesNotMatch(html, /\u2014/);
  assert.doesNotMatch(html, /scene-canvas|forcegl/);
  const ld = JSON.parse(jsonLd(sampleBrief()));
  assert.equal(ld['@type'], 'LocalBusiness');
  assert.equal(ld.telephone, '6106641111');
});

test('harvested hours cannot smuggle an em dash into the page', () => {
  const html = renderSite(sampleBrief({ hours: 'Monday 8:00 AM \u2014 5:00 PM' }));
  assert.doesNotMatch(html, /\u2014/);
  assert.match(html, /Monday 8:00 AM - 5:00 PM/);
});

test('wordmark fallback when no first-party logo exists', () => {
  const html = renderSite(sampleBrief({ logo: false, logoSrc: '' }));
  assert.match(html, /wordmark/);
  assert.doesNotMatch(html, /class="brand-logo"/);
});
