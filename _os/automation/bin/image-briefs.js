#!/usr/bin/env node
'use strict';

/**
 * Write image-generation briefs for rebuild targets that own no photographs.
 *
 *   node _os/automation/bin/image-briefs.js [--limit N] [--force]
 *
 * The operator's decision, 2026-08-07: prospects with no usable imagery get
 * **generated** images (Codex runs the generation) instead of being held out of
 * the build queue forever. This script is the handoff — it turns each
 * zero-photo rebuild row into a precise work order: which slots to fill, what
 * each slot depicts on the arch template, per-vertical scene direction, exact
 * filenames and dimensions, and the constraints that keep a generated demo
 * honest.
 *
 * The constraints are not decoration:
 *
 * - **Illustrative, never passed off.** Pages built from generated assets carry
 *   a disclosure line (arch-build injects it when told the assets are
 *   generated). A demo that presents fake photos as the business's own work
 *   would poison the pitch it exists to make.
 * - **No text, lettering or signage in images.** Image models garble text, and
 *   a generated storefront sign would also invent a fake sign for a real
 *   business.
 * - **No faces.** Generated people photoreal enough to pass invite "who is
 *   that?" in the exact meeting the demo is for.
 * - **Their real logo is kept when they have one** — only the photo slots are
 *   generated. Many zero-photo prospects still have a logo (39 of 106 surveyed).
 *
 * Output paths are deliberate: briefs are tracked (they contain nothing beyond
 * what the registry already publishes — name, vertical, city); the generated
 * binaries go to the gitignored private layer, because ~7 images x dozens of
 * prospects is repo bloat, and the Netlify draft is the real artifact.
 */

const fs = require('fs');
const path = require('path');
const radar = require('../lib/radar');
const { repoPath, ensureDir, todayISO } = require('../lib/fsutil');

const BRIEFS_DIR = '12_Brain/state/radar/image-briefs';
const ASSETS_DIR = '12_Brain/private/generated-assets';

/**
 * What each slot IS on the arch homepage, measured from the template:
 * image-1 sits in the hero, image-2/3 in the story section, image-4/5/6 in the
 * gallery. Dimensions match how the template crops them.
 */
const SLOTS = [
  { file: 'image-1.png', role: 'hero', px: '1600x1100', about: 'wide establishing shot; carries the top of the page' },
  { file: 'image-2.png', role: 'story', px: '1200x900', about: 'process or workspace detail; sits beside the story copy' },
  { file: 'image-3.png', role: 'story', px: '1200x900', about: 'second process detail; must read differently from image-2' },
  { file: 'image-4.png', role: 'gallery', px: '1200x900', about: 'finished work, subject one' },
  { file: 'image-5.png', role: 'gallery', px: '1200x900', about: 'finished work, subject two' },
  { file: 'image-6.png', role: 'gallery', px: '1200x900', about: 'finished work, subject three' },
];

/**
 * Scene direction per vertical. `hero` sets the establishing shot; `story` two
 * process scenes; `gallery` three distinct finished-work subjects. Written for
 * the verticals actually present in the held-out set, with a trade-generic
 * fallback so an unmapped vertical still gets a usable brief.
 */
const SCENES = {
  dentist: {
    hero: 'a calm, modern dental treatment room, chair and overhead light, morning window light',
    story: ['gloved hands arranging sterilized instruments on a tray', 'a bright reception desk with plants, unoccupied'],
    gallery: ['a close, clean dental operatory', 'a panoramic x-ray viewer on a wall', 'a tidy consultation room with two chairs'],
  },
  doctor: {
    hero: 'a bright, modern medical exam room, table and diagnostic wall unit, soft daylight',
    story: ['a stethoscope and chart on a clean desk', 'a welcoming clinic corridor with wayfinding colors'],
    gallery: ['an exam room detail', 'a clean waiting area with natural light', 'a lab corner with neat equipment'],
  },
  veterinary: {
    hero: 'a modern veterinary exam room with a stainless table, warm and calm',
    story: ['a technician\'s gloved hands holding a clipboard beside kennels', 'a retail wall of pet-care products, neatly faced'],
    gallery: ['a clean surgical suite', 'a bright lobby with bench seating', 'an exam room with a small dog bed'],
  },
  hvac: {
    hero: 'a technician\'s van interior view of organized HVAC tools and gauges, shallow depth',
    story: ['hands adjusting a manifold gauge set on a condenser', 'a neatly wired thermostat on a fresh wall'],
    gallery: ['a new condenser unit on a level pad beside a house', 'clean ductwork runs in an unfinished basement', 'a mini-split head mounted above a doorway'],
  },
  electrician: {
    hero: 'a clean, newly finished electrical panel with labeled breakers, garage light',
    story: ['gloved hands stripping wire at a workbench', 'conduit runs along a commercial ceiling, neat parallel lines'],
    gallery: ['recessed lighting glowing in a finished living room', 'an EV charger mounted on a garage wall', 'a generator transfer switch installation'],
  },
  plumber: {
    hero: 'copper and PEX supply lines neatly manifolded in a utility room',
    story: ['hands soldering a copper joint, focused close-up', 'a tidy service van shelf of fittings'],
    gallery: ['a finished bathroom vanity with new fixtures', 'a tankless water heater neatly plumbed', 'a sump pit with fresh piping'],
  },
  roofer: {
    hero: 'a freshly shingled roofline against a clear sky, ridge vent visible',
    story: ['hands nailing a shingle course, close-up', 'bundles staged neatly on a driveway'],
    gallery: ['a completed asphalt roof from the street', 'new flashing detail around a chimney', 'a flat commercial roof with clean seams'],
  },
  'car-repair': {
    hero: 'a clean two-bay garage with a car on a lift, morning light through the door',
    story: ['hands with a torque wrench at a wheel hub', 'an organized tool chest, drawers open'],
    gallery: ['a car on an alignment rack', 'fresh brake rotors installed', 'a detailed engine bay after service'],
  },
  restaurant: {
    hero: 'a warm dining room set for service, evening light, no patrons',
    story: ['a chef\'s hands plating in a stainless kitchen', 'fresh ingredients on a prep counter'],
    gallery: ['a signature plated dish, overhead', 'a bar top with glassware backlit', 'a corner booth with warm lighting'],
  },
  fitness: {
    hero: 'a spacious climbing or training space with dramatic light, unoccupied',
    story: ['chalked hands gripping a hold, close-up', 'a rack of neatly organized equipment'],
    gallery: ['a bouldering wall of varied routes', 'a training area with clean mats', 'a stretching corner with natural light'],
  },
  _generic: {
    hero: 'the workspace of a small {vertical} business in {city}, Pennsylvania, wide and naturally lit, unoccupied',
    story: ['hands at work with the tools of a {vertical} trade, close-up', 'an organized workspace detail for a {vertical} business'],
    gallery: ['finished {vertical} work, subject one', 'finished {vertical} work, a second distinct subject', 'finished {vertical} work, a third distinct subject'],
  },
};

const CONSTRAINTS = [
  'Photorealistic. Natural light. No HDR glow, no fisheye.',
  'ABSOLUTELY NO text, lettering, signage, logos or brand marks anywhere in the image.',
  'No human faces. Hands at work are fine.',
  'No recognizable real locations or other businesses\' premises.',
  'One consistent light temperature across all six images so the page reads as one shoot.',
];

function sceneFor(vertical, group) {
  const v = String(vertical || '').toLowerCase();
  if (SCENES[v]) return SCENES[v];
  if (/dent/.test(v)) return SCENES.dentist;
  if (/vet/.test(v)) return SCENES.veterinary;
  if (/electric/.test(v)) return SCENES.electrician;
  if (/plumb/.test(v)) return SCENES.plumber;
  if (/roof/.test(v)) return SCENES.roofer;
  if (/hvac|heating|cooling|air/.test(v)) return SCENES.hvac;
  if (/auto|car|tire|mechanic/.test(v)) return SCENES['car-repair'];
  if (/restaurant|pizz|food|cafe|bistro|deli|hoagie/.test(v)) return SCENES.restaurant;
  if (/gym|fitness|climb|yoga/.test(v)) return SCENES.fitness;
  if (/clinic|medical|health|pediatric/.test(v)) return SCENES.doctor;
  return SCENES._generic;
}

function slugify(s) {
  return String(s || '').toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
}

function fill(t, p) {
  return String(t).replace(/\{vertical\}/g, p.vertical || 'trade').replace(/\{city\}/g, p.city || 'Philadelphia');
}

function briefFor(p) {
  const scene = sceneFor(p.vertical, p.vertical_group);
  const slug = slugify(p.business_name || p.domain);
  const storyScenes = [...scene.story];
  const galleryScenes = [...scene.gallery];
  const slots = SLOTS.map((s) => {
    const subject =
      s.role === 'hero' ? scene.hero : s.role === 'story' ? storyScenes.shift() : galleryScenes.shift();
    return {
      file: s.file,
      role: s.role,
      dimensions: s.px,
      where_it_lands: s.about,
      prompt: `${fill(subject, p)}. ${CONSTRAINTS.join(' ')}`,
    };
  });
  return {
    slug,
    domain: p.domain,
    business_name: p.business_name,
    vertical: p.vertical || p.vertical_group,
    city: p.city || '',
    county: p.area || '',
    logo: p.imagery?.logo
      ? 'They have a real logo — DO NOT generate one. Harvest theirs; only the photo slots below are generated.'
      : 'No logo found. Generate assets/logo-display.png: a flat, minimal monogram badge using the business initials only, transparent background, 512x512. No other text.',
    output_dir: `${ASSETS_DIR}/${slug}/`,
    disclosure:
      'This build MUST be deployed with generated-imagery disclosure on. ' +
      'arch-build injects it when passed { generatedAssets: true }. Never present these images as their photographs.',
    slots,
  };
}

function parseArgs(argv) {
  const o = { limit: 100, force: false };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--limit') o.limit = Math.max(1, parseInt(argv[++i], 10) || 100);
    else if (argv[i] === '--force') o.force = true;
    else if (argv[i] === '--help' || argv[i] === '-h') o.help = true;
  }
  return o;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(fs.readFileSync(__filename, 'utf8').split('*/')[0].split('/**')[1].replace(/^\s*\* ?/gm, ''));
    return;
  }
  const today = todayISO();
  const registry = radar.load();

  // The queue: rebuild targets whose imagery was checked and came back empty.
  const targets = Object.values(registry.prospects)
    .filter((p) => p.current?.verdict === 'rebuild')
    .filter((p) => p.imagery && p.imagery.checked && p.imagery.usable === 0)
    .sort((a, b) => (b.priority_score || 0) - (a.priority_score || 0))
    .slice(0, args.limit);

  const dir = repoPath(BRIEFS_DIR);
  ensureDir(dir);

  let written = 0;
  const index = [];
  for (const p of targets) {
    const brief = briefFor(p);
    const file = path.join(dir, `${brief.slug}.json`);
    if (!args.force && fs.existsSync(file)) {
      index.push(brief);
      continue;
    }
    fs.writeFileSync(file, JSON.stringify(brief, null, 2));
    written += 1;
    index.push(brief);
  }

  // The handoff document Codex actually reads.
  const queueDoc = `# Codex image queue — generated ${today}

${index.length} rebuild targets own no usable photographs. Each has a brief in
this directory specifying exactly what to generate, slot by slot.

## The contract

1. Read \`<slug>.json\`. Generate each slot's image from its \`prompt\` at its
   \`dimensions\`. Six photos per prospect; a logo ONLY if the brief says so.
2. Write outputs to the brief's \`output_dir\` (under \`12_Brain/private/\`,
   which is gitignored — the binaries never enter this public repo).
3. Every image: photorealistic, natural light, **no text or lettering
   anywhere**, **no faces**, one consistent light temperature per prospect.
4. Build with \`buildArchSite(prospect, { generatedAssets: true, ... })\` or
   pass \`--generated-assets\` to the deploy runner. That flag injects the
   disclosure line; a page from generated imagery without it must not ship.
5. The rule stands: these images are illustrative concepts. They are never
   presented as the business's own photographs, in the page or in the pitch.

## Queue (priority order)

| # | Business | Vertical | City | Brief |
|---|---|---|---|---|
${index.map((b, i) => `| ${i + 1} | ${b.business_name} | ${b.vertical} | ${b.city} | ${b.slug}.json |`).join('\n')}
`;
  fs.writeFileSync(path.join(dir, 'CODEX-QUEUE.md'), queueDoc);

  console.log(JSON.stringify({
    status: 'ok', date: today, queue: index.length, written_new: written,
    briefs: BRIEFS_DIR, assets_go_to: ASSETS_DIR,
  }, null, 2));
}

main();
