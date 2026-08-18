#!/usr/bin/env node
'use strict';

/**
 * Rebuild the 25 Haoqi demos from existing page facts + hand-cut copy.
 * Does not touch jarman-sales or andorra-family-dentistry.
 */

const fs = require('fs');
const path = require('path');
const { repoPath } = require('../lib/fsutil');
const { render } = require('../lib/haoqi-craft-page');
const { titlesFor, markFromName, signFromName } = require('../lib/haoqi-craft-copy');
const overrides = require('../lib/haoqi-craft-overrides');

const ROOT = repoPath('haoqi-radar-sites');
const SKIP = new Set(['jarman-sales', 'andorra-family-dentistry', 'lib']);

const SCHEMA_TO_VERTICAL = {
  Dentist: 'dentist',
  HVACBusiness: 'hvac',
  VeterinaryCare: 'veterinary',
  Restaurant: 'restaurant',
  LegalService: 'lawyer',
  Store: 'shoes',
  HomeGoodsStore: 'fireplace',
  HomeAndConstructionBusiness: 'gardener',
  LocalBusiness: 'tattoo',
  MedicalClinic: 'doctor',
  SportsActivityLocation: 'fitness-centre',
  Electrician: 'electrician',
  IceCreamShop: 'ice-cream',
  RealEstateAgent: 'estate-agent',
  Physician: 'physiotherapist',
  CafeOrCoffeeShop: 'cafe',
  Florist: 'florist',
  AutoWash: 'car-wash',
  Optician: 'optician',
};

function slugs() {
  return fs
    .readdirSync(ROOT, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !SKIP.has(e.name))
    .map((e) => e.name)
    .sort();
}

function decode(s) {
  return String(s || '')
    .replace(/&amp;/g, '&')
    .replace(/&apos;|&#039;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function parsePage(html) {
  const json = JSON.parse((html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/) || ['', '{}'])[1]);
  const brand = (html.match(/--brand:\s*(#[0-9A-Fa-f]{6})/) || [])[1] || '#1d6fe8';
  const word = (html.match(/word:\s*"([^"]+)"/) || [])[1] || '';
  const imgIn = (section) => {
    const blob = (html.match(new RegExp(`class="${section}"[\\s\\S]*?<\\/section>`)) || [''])[0];
    const m = blob.match(/<img src="assets\/([^"]+)" alt="([^"]*)"(?: width="(\d+)")?(?: height="(\d+)")?/);
    if (!m || /^logo\./.test(m[1])) return null;
    return { src: m[1], alt: decode(m[2]), width: Number(m[3] || 1200), height: Number(m[4] || 900), caption: decode(m[2]).slice(0, 40) };
  };
  const note = decode((html.match(/class="note">([\s\S]*?)<\/p>/) || [])[1] || '');
  return {
    name: json.name,
    siteUrl: json.url,
    phone: String(json.telephone || '').replace(/\D/g, ''),
    street: json.address?.streetAddress || '',
    city: json.address?.addressLocality || '',
    region: json.address?.addressRegion || 'PA',
    postcode: json.address?.postalCode || '',
    vertical: SCHEMA_TO_VERTICAL[json['@type']] || 'LocalBusiness',
    brand,
    word,
    logo: '',
    images: {
      portrait: imgIn('portrait'),
      story: imgIn('story'),
      gallery: imgIn('gallery'),
    },
    note,
  };
}

function existingLogo(slug, over) {
  if (over.dropLogo) return '';
  const dir = path.join(ROOT, slug, 'assets');
  if (fs.existsSync(path.join(dir, 'logo.png'))) return 'logo.png';
  if (fs.existsSync(path.join(dir, 'logo.svg'))) return 'logo.svg';
  return '';
}

function buildPage(slug, parsed, over) {
  const titles = titlesFor(over.word || parsed.word, parsed.vertical);
  const name = over.name || parsed.name;
  const word = over.word || parsed.word;
  const phone = Object.prototype.hasOwnProperty.call(over, 'phone') ? over.phone : parsed.phone;
  const city = over.city || parsed.city;
  const logo = existingLogo(slug, over);
  const images = {
    portrait: over.dropPortraitImage ? null : parsed.images.portrait,
    story: over.dropStoryImage ? null : parsed.images.story,
    gallery: over.dropGalleryImage ? null : parsed.images.gallery,
  };
  if (images.story && images.portrait && images.story.src === images.portrait.src) images.story = null;
  const siteUrl = over.siteUrl || parsed.siteUrl;
  return {
    slug,
    name,
    vertical: parsed.vertical,
    siteUrl,
    word,
    phone,
    hours: over.hours || '',
    street: over.street || parsed.street,
    city,
    region: over.region || parsed.region || 'PA',
    postcode: over.postcode || parsed.postcode,
    palette: [{ hex: parsed.brand }],
    logo,
    mark: markFromName(name),
    sign: signFromName(name),
    shotMeta: `${String(city || '').slice(0, 18).toUpperCase()}  ${over.postcode || parsed.postcode || ''}`.trim(),
    title: over.title || `${name} | ${city}`,
    description: over.description,
    headline: over.headline,
    lede: over.lede,
    offerTitle: titles.offer,
    offers: over.offers,
    proofTitle: titles.proof,
    proofs: over.proofs,
    processTitle: titles.process,
    steps: over.steps,
    expTitle: titles.exp,
    experience: over.experience,
    areaTitle: titles.area,
    areas: over.areas,
    storyTitle: over.storyTitle,
    story: over.story,
    galleryTitle: 'From their site',
    visitTitle: over.visitTitle || 'Come in',
    closeTitle: titles.close,
    closeBody: over.closeBody,
    navWork: titles.offer.split(' ')[0],
    navStory: 'Story',
    ghostLabel: 'Plan a visit',
    ghostHref: '#visit',
    images,
    note: `Prospect demo. noindex. Copy mirrored from ${siteUrl} on 2026-08-16, then recut so proof, process, and area follow the Jarman and Andorra arc.${logo ? ' Header mark is their logo, background cut to alpha.' : ' No clean logo on the homepage, so the mark stays type.'}${images.portrait || images.story || images.gallery ? ' Photographs are theirs.' : ' No usable photographs on the homepage.'}`,
  };
}

function main() {
  const missing = [];
  for (const slug of slugs()) {
    const over = overrides[slug];
    if (!over) {
      missing.push(slug);
      continue;
    }
    const html = fs.readFileSync(path.join(ROOT, slug, 'index.html'), 'utf8');
    const parsed = parsePage(html);
    const page = buildPage(slug, parsed, over);
    fs.writeFileSync(path.join(ROOT, slug, 'index.html'), render(page));
    process.stdout.write(`recut ${slug} logo=${page.logo || 'type'} word=${page.word}\n`);
  }
  if (missing.length) {
    console.error(`missing overrides: ${missing.join(', ')}`);
    process.exit(1);
  }
}

module.exports = { parsePage, buildPage };

if (require.main === module) main();
