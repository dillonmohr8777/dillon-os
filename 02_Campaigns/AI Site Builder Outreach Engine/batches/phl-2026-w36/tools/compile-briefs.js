#!/usr/bin/env node
/**
 * Expand compact wave-4 specs into full site-factory briefs.
 *
 *   node tools/compile-briefs.js            (run from the batch directory)
 *
 * Reads specs/*.json (each an array of compact specs), writes briefs/<slug>.json
 * and prompts.json (slug -> 12 illustrative image prompts, in asset order).
 *
 * Image plan per site (always 12, inside the measured 12-13 spec):
 *   hero 1, gallery 5 (with spotlight) or 6, story, feature, spotlight (optional), catalog 3
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const specsDir = path.join(root, 'specs');
const briefsDir = path.join(root, 'briefs');
fs.mkdirSync(briefsDir, { recursive: true });

const STYLE =
  ' Photorealistic editorial photograph, natural light, real-world texture, shallow depth of field, no text, no letters, no logos, no signage, no watermark, no people looking at camera.';

function lum(hex) {
  const h = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((c) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
const onColor = (hex) => ((lum(hex) + 0.05) / (0 + 0.05) >= (1.05) / (lum(hex) + 0.05) ? '#090909' : '#FFFFFF');

function words(s) {
  return String(s || '')
    .split(/\s+/)
    .filter(Boolean).length;
}

const specs = fs
  .readdirSync(specsDir)
  .filter((f) => f.endsWith('.json') && f !== 'overrides.json')
  .sort()
  .flatMap((f) => JSON.parse(fs.readFileSync(path.join(specsDir, f), 'utf8')));

// Optional copy overrides (trim pass): specs/overrides.json = { slug: { field: value, ... } }
const overridesPath = path.join(specsDir, 'overrides.json');
const overrides = fs.existsSync(overridesPath) ? JSON.parse(fs.readFileSync(overridesPath, 'utf8')) : {};
for (const s of specs) {
  const o = overrides[s.slug];
  if (!o) continue;
  for (const [k, v] of Object.entries(o)) {
    if (v && typeof v === 'object' && !Array.isArray(v) && s[k] && typeof s[k] === 'object') Object.assign(s[k], v);
    else s[k] = v;
  }
}

const prompts = {};
const report = [];

for (const s of specs) {
  if (!Array.isArray(s.images) || s.images.length < 12) {
    throw new Error(`${s.slug}: need at least 12 image scenes, got ${(s.images || []).length}`);
  }
  const scenes = s.images.slice(0, 12);
  const hasSpot = !!(s.spotlight && s.spotlight.heading);
  // 12 images: hero 1, gallery 5 or 6, story, feature, spotlight (optional), catalog 3.
  const galleryIdx = hasSpot ? [2, 3, 4, 5, 6] : [2, 3, 4, 5, 6, 7];
  const storyIdx = hasSpot ? 7 : 8;
  const featureIdx = hasSpot ? 8 : 9;
  const spotIdx = 9;
  const catalogIdx = [10, 11, 12];
  const t = s.tokens;
  const tokens = {
    paper: t.paper,
    ink: t.ink,
    accent: t.accent,
    accent2: t.accent2,
    panel: t.panel,
    deep: t.deep,
    onPaper: onColor(t.paper),
    onAccent: onColor(t.accent),
    onAccent2: onColor(t.accent2),
    onPanel: onColor(t.panel),
    onDeep: onColor(t.deep),
    border: t.border,
    radius: t.radius,
  };
  const primary = s.primary; // {label, href}
  const brief = {
    slug: s.slug,
    name: s.name,
    city: s.city,
    category: s.category,
    vertical: s.vertical,
    attitude: s.attitude,
    url: s.url,
    phone: s.phone,
    address: s.address,
    hours: s.hours,
    description: s.description,
    tagline: s.tagline,
    noindex: true,
    imageDisclosure: true,
    schemaType: s.schemaType || 'LocalBusiness',
    marquee: s.marquee,
    tokens,
    fonts: s.fonts,
    logo: false,
    nav: s.nav || [
      { label: 'Explore', href: '#offerings' },
      { label: 'Gallery', href: '#gallery' },
      { label: 'Visit', href: '#visit' },
    ],
    hero: {
      eyebrow: s.hero.eyebrow,
      headline: s.hero.headline,
      sub: s.hero.sub,
      ctaPrimary: primary,
      ctaSecondary: s.hero.ctaSecondary || { label: 'Plan a visit', href: '#visit' },
      glassFloat: s.hero.glassFloat,
      marquee: s.marquee,
    },
    offerings: { heading: s.offerings.heading, kicker: s.offerings.kicker, items: s.offerings.items },
    proof: { heading: s.proof.heading, items: s.proof.items },
    gallery: { heading: s.gallery.heading, imageIndexes: galleryIdx },
    story: { heading: s.story.heading, paragraphs: s.story.paragraphs, imageIndex: storyIdx },
    experience: { heading: s.experience.heading, items: s.experience.items },
    feature: { heading: s.feature.heading, text: s.feature.text, cta: s.feature.cta || primary, imageIndex: featureIdx },
    ...(hasSpot && {
      spotlight: { heading: s.spotlight.heading, text: s.spotlight.text, cta: s.spotlight.cta || primary, imageIndex: spotIdx },
    }),
    catalog: {
      heading: s.catalog.heading,
      items: s.catalog.items.map((it, i) => ({ title: it.title, href: it.href, imageIndex: catalogIdx[i] })),
    },
    contact: { heading: s.contact && s.contact.heading },
    closing: { heading: s.closing.heading, kicker: s.closing.kicker, cta: s.closing.cta || primary },
    links: s.links,
    sections: ['hero', 'offerings', 'proof', 'gallery', 'story', 'experience', 'feature', 'spotlight', 'catalog', 'contact', 'closing'],
    images: scenes.map((alt, i) => ({ file: `image-${i + 1}.webp`, alt: `Illustrative concept: ${alt}` })),
  };
  fs.writeFileSync(path.join(briefsDir, `${s.slug}.json`), JSON.stringify(brief, null, 2));
  prompts[s.slug] = scenes.map((scene) => `${scene}. ${s.imageStyle || ''}${STYLE}`.replace(/\s+/g, ' ').trim());

  const copy = [
    s.hero.headline,
    s.hero.sub,
    ...(s.offerings.items || []),
    ...(s.proof.items || []),
    ...(s.story.paragraphs || []),
    ...(s.experience.items || []),
    s.feature.heading,
    s.feature.text,
    hasSpot ? s.spotlight.heading + ' ' + s.spotlight.text : '',
    ...s.catalog.items.map((i) => i.title),
    s.closing.heading,
  ].map(words).reduce((a, b) => a + b, 0);
  const emDash = JSON.stringify(s).includes('—') || JSON.stringify(s).includes('–');
  report.push(`${s.slug.padEnd(34)} sections ${hasSpot ? 11 : 10}  copy~${copy}  ${emDash ? 'EM/EN DASH FOUND' : ''}`);
}

fs.writeFileSync(path.join(root, 'prompts.json'), JSON.stringify(prompts, null, 1));
console.log(report.join('\n'));
console.log(`\n${specs.length} briefs written to ${briefsDir}`);
