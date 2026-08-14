/**
 * Prospect → site-factory brief. Starts from the canonical example and swaps
 * identity fields. Used for new weekly batches, not for the already-built 238.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const EXAMPLE = path.join(__dirname, '../../..', '_templates/site-factory/example-brief.json');
const ATTITUDES = ['glass', 'editorial', 'brutal', 'warm', 'industrial', 'neon'];

const PALETTES = [
  { paper: '#F4EFE4', ink: '#1B2430', accent: '#C2410C', accent2: '#F4B942', panel: '#D8DCE2', deep: '#152032' },
  { paper: '#F6F1E8', ink: '#1C1917', accent: '#0F766E', accent2: '#D6B25E', panel: '#E7E0D4', deep: '#14221F' },
  { paper: '#F3EEE6', ink: '#111827', accent: '#1D4ED8', accent2: '#F59E0B', panel: '#D9E2EC', deep: '#0F172A' },
  { paper: '#F7F0E8', ink: '#1A120B', accent: '#9A3412', accent2: '#CA8A04', panel: '#E8DCCB', deep: '#1C1410' },
];

function loadBase() {
  return JSON.parse(fs.readFileSync(EXAMPLE, 'utf8'));
}

function briefFromProspect(prospect, index = 0) {
  const b = loadBase();
  delete b.social;
  delete b.spotlight;
  const name = prospect.business_name || prospect.name;
  const slug = prospect.slug;
  const vertical = prospect.vertical || b.vertical;
  const city = prospect.city || 'Philadelphia';
  b.slug = slug;
  b.name = name;
  b.city = city;
  b.category = vertical;
  b.vertical = vertical;
  b.attitude = ATTITUDES[index % ATTITUDES.length];
  b.url = prospect.live_site || prospect.website || 'https://example.com';
  b.phone = prospect.phone || '215-555-0100';
  b.address = prospect.address || 'Philadelphia, PA';
  b.noindex = true;
  b.prospectId = prospect.prospect_id;
  b.description = `${name} in ${city}. A clearer homepage for the work they already do.`;
  const pal = PALETTES[index % PALETTES.length];
  b.tokens = { ...b.tokens, ...pal };
  b.hero = {
    ...b.hero,
    eyebrow: `${city} | ${vertical}`,
    headline: name,
    sub: b.description,
    ctaPrimary: { label: 'Book a visit', href: '#visit' },
    glassFloat: { title: name, sub: city },
  };
  b.story = {
    heading: 'About',
    paragraphs: [
      `${name} is a ${vertical.toLowerCase()} shop rooted in ${city}.`,
      'This page is a private staging concept: their name, their work, a layout that does not look ten years old.',
    ],
  };
  b.images = Array.from({ length: 12 }, (_, i) => ({
    file: `image-${i + 1}.webp`,
    alt: `${name} ${vertical} ${i + 1}`,
  }));
  b.gallery = { imageIndexes: [3, 4, 5, 6, 7, 12] };
  return b;
}

module.exports = { briefFromProspect, loadBase };
