#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');
const { runBatch } = require('../../_templates/site-factory/build-batch.js');
const { assessLogoEligibility, dedupeDecisions } = require('../../_os/automation/lib/logo-eligibility');

const root = path.resolve(__dirname, '..', '..');
const runId = process.env.PROSPECT_RADAR_RUN_ID || process.argv[2];
if (!/^\d{8}-\d{6}$/.test(runId || '')) throw new Error('Run id must use yyyyMMdd-HHmmss.');

const skipQa = process.argv.includes('--skip-qa');
const batchDir = path.join(root, '02_Campaigns', 'AI Site Builder Outreach Engine', 'batches', `radar-next20-${runId}`);
const selectionPath = path.join(batchDir, 'SELECTION-EVIDENCE.json');
const sourcesPath = path.join(batchDir, 'SOURCE-STATUS.json');
const registryPath = path.join(root, '12_Brain', 'state', 'radar', 'registry.json');
const fontCache = path.join(__dirname, 'font-cache');

const sha256 = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const hashText = (value) => crypto.createHash('sha256').update(String(value)).digest('hex');
const atomicJson = (file, value) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temp = `${file}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(temp, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  fs.renameSync(temp, file);
};
const atomicText = (file, value) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temp = `${file}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(temp, value, 'utf8');
  fs.renameSync(temp, file);
};
const copy = (from, to) => {
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
};
const titleCase = (value) => String(value || 'local business')
  .replace(/[-_]+/g, ' ')
  .replace(/\b\w/g, (char) => char.toUpperCase());
const clip = (value, max = 230) => {
  const clean = String(value || '').replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max).replace(/\s+\S*$/, '')}.`;
};

const palettes = [
  { paper: '#EAF4F0', ink: '#14251F', accent: '#006B55', accent2: '#F36B35', panel: '#D4E7DE', deep: '#073F34', onPaper: '#14251F', onAccent: '#FFFFFF', onAccent2: '#14251F', onPanel: '#14251F', onDeep: '#FFFFFF', border: '1px', radius: '12px' },
  { paper: '#EAF0FA', ink: '#17213E', accent: '#2446A8', accent2: '#F3BF37', panel: '#D8E2F4', deep: '#111A37', onPaper: '#17213E', onAccent: '#FFFFFF', onAccent2: '#17213E', onPanel: '#17213E', onDeep: '#FFFFFF', border: '1px', radius: '16px' },
  { paper: '#F4E7EC', ink: '#331D20', accent: '#9C2E40', accent2: '#E7A843', panel: '#E9D1DB', deep: '#401C25', onPaper: '#331D20', onAccent: '#FFFFFF', onAccent2: '#331D20', onPanel: '#331D20', onDeep: '#FFFFFF', border: '1px', radius: '10px' },
  { paper: '#E7F3F4', ink: '#132B32', accent: '#146B72', accent2: '#E36D4F', panel: '#CFE5E5', deep: '#0D353B', onPaper: '#132B32', onAccent: '#FFFFFF', onAccent2: '#132B32', onPanel: '#132B32', onDeep: '#FFFFFF', border: '1px', radius: '18px' },
  { paper: '#EFE9F7', ink: '#24221E', accent: '#5E3F96', accent2: '#D5E15B', panel: '#DED4EC', deep: '#292039', onPaper: '#24221E', onAccent: '#FFFFFF', onAccent2: '#24221E', onPanel: '#24221E', onDeep: '#FFFFFF', border: '1px', radius: '14px' },
];

const fontPairs = [
  { id: 'bricolage-manrope', display: 'Bricolage Grotesque', text: 'Manrope' },
  { id: 'alegreya-karla', display: 'Alegreya', text: 'Karla' },
  { id: 'newsreader-figtree', display: 'Newsreader', text: 'Figtree' },
  { id: 'bodoni-urbanist', display: 'Bodoni Moda', text: 'Urbanist' },
  { id: 'syne-work', display: 'Syne', text: 'Work Sans' },
];

async function fetchBytes(url) {
  const response = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 AppleWebKit/537.36 Chrome/126 Safari/537.36' } });
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  return Buffer.from(await response.arrayBuffer());
}

async function ensureFamily(family, role, directory) {
  const query = family.trim().replace(/ /g, '+');
  const cssResponse = await fetch(`https://fonts.googleapis.com/css2?family=${query}:wght@400;700&display=swap`, {
    headers: { 'user-agent': 'Mozilla/5.0 AppleWebKit/537.36 Chrome/126 Safari/537.36' },
  });
  if (!cssResponse.ok) throw new Error(`Font CSS failed for ${family}: HTTP ${cssResponse.status}`);
  const css = await cssResponse.text();
  const blocks = [...css.matchAll(/@font-face\s*\{([\s\S]*?)\}/g)].map((match) => match[1]);
  for (const weight of [400, 700]) {
    const candidates = blocks.filter((block) => new RegExp(`font-weight:\\s*${weight}\\s*;`).test(block));
    const block = candidates[candidates.length - 1] || blocks[blocks.length - 1];
    const url = block?.match(/src:\s*url\(([^)]+)\)\s*format\(['"]woff2['"]\)/)?.[1];
    if (!url) throw new Error(`No WOFF2 URL for ${family} ${weight}`);
    const file = path.join(directory, `font-${role}-${weight}.woff2`);
    const bytes = await fetchBytes(url.replace(/["']/g, ''));
    if (bytes.subarray(0, 4).toString('ascii') !== 'wOF2') throw new Error(`Invalid WOFF2 payload for ${family} ${weight}`);
    fs.writeFileSync(file, bytes);
  }
}

async function ensureFontPair(pair) {
  const directory = path.join(fontCache, pair.id);
  const files = ['font-display-400.woff2', 'font-display-700.woff2', 'font-text-400.woff2', 'font-text-700.woff2'];
  if (!files.every((file) => fs.existsSync(path.join(directory, file)))) {
    fs.mkdirSync(directory, { recursive: true });
    await ensureFamily(pair.display, 'display', directory);
    await ensureFamily(pair.text, 'text', directory);
  }
  return directory;
}

function descriptor(vertical, group) {
  const haystack = `${vertical} ${group}`.toLowerCase();
  if (/architect|landscape|engineer|construction/.test(haystack)) return { family: 'built environment', headline: 'Places designed for what comes next.', verb: 'project', attitude: 'editorial' };
  if (/medical|doctor|dental|veter|health|therapy/.test(haystack)) return { family: 'care practice', headline: 'A calmer route to the right next step.', verb: 'care question', attitude: 'editorial' };
  if (/legal|law|attorney/.test(haystack)) return { family: 'legal practice', headline: 'Clarity for the question in front of you.', verb: 'legal question', attitude: 'editorial' };
  if (/home|roof|hvac|plumb|floor|electric|contractor|repair/.test(haystack)) return { family: 'home service', headline: 'Built around the work that matters.', verb: 'project question', attitude: 'industrial' };
  if (/spa|wellness|salon|fitness/.test(haystack)) return { family: 'wellness studio', headline: 'A more considered way to begin.', verb: 'visit', attitude: 'warm' };
  return { family: 'local business', headline: 'A clearer first impression, from the first tap.', verb: 'question', attitude: 'warm' };
}

function makePhotoDerivative(input, output, index, rank) {
  const x = [0, 48, 96, 144][index % 4];
  const y = [0, 42, 84][Math.floor(index / 4) % 3];
  const saturation = (0.94 + ((index + rank) % 5) * 0.025).toFixed(3);
  const contrast = (1.01 + ((index * 3 + rank) % 5) * 0.018).toFixed(3);
  const brightness = (-0.018 + ((index + rank) % 4) * 0.009).toFixed(3);
  const filter = `scale=1400:1050:force_original_aspect_ratio=increase,crop=1200:900:${x}:${y},eq=saturation=${saturation}:contrast=${contrast}:brightness=${brightness},unsharp=5:5:0.35:5:5:0.0`;
  const result = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', input, '-frames:v', '1', '-vf', filter, '-c:v', 'libwebp', '-quality', '86', '-compression_level', '6', output], { encoding: 'utf8' });
  if (result.status !== 0) throw new Error(result.stderr || `ffmpeg failed for ${output}`);
  return filter;
}

function siteDocuments(item, source, brief, palette, pair, direction) {
  const siteDir = path.join(batchDir, 'sites', item.slug);
  const sourceNote = source.description ? `The official source describes the practice as: “${clip(source.description, 210)}”` : 'Current service language stays on the official source until it can be reviewed in full.';
  atomicText(path.join(siteDir, 'PRODUCT.md'), `# ${item.name}\n\n<!-- impeccable:product-schema 1 -->\n\n## Platform\n\nWeb\n\n## Users\n\nPeople using a phone to understand ${item.name} and reach its official source.\n\n## Product Purpose\n\nA private, noindex homepage concept grounded in the exact first-party identity and current official source.\n\n## Evidence\n\n${sourceNote}\n\nNo prices, awards, outcomes, testimonials, availability, or operational details are invented.\n\n## Accessibility\n\nKeyboard access, visible focus, reduced motion, 44 pixel touch targets, meaningful alternatives, and zero horizontal overflow at 320 pixels are required.\n`);
  atomicText(path.join(siteDir, 'DESIGN.md'), `---\nimpeccable:\n  schema: 1\n  status: built\n  version: 4.0.4\nmode: Persuade\ntokens:\n  color:\n    paper: ${palette.paper}\n    ink: ${palette.ink}\n    signal: ${palette.accent}\n    deep: ${palette.deep}\n  type:\n    display: ${pair.display}\n    text: ${pair.text}\n  radius:\n    media: ${palette.radius}\n  motion:\n    authoredMoment: ink-logo-reveal\n---\n\n# Design system: ${item.name}\n\n## Direction\n\n${direction} composition with source-led imagery, decisive mobile type, and an exact-logo finale.\n\n## Composition\n\nThe phone order is primary. Image, type, proof, and action move in one vertical sequence. Desktop expands that sequence without reordering it.\n\n## Typography\n\n${pair.display} leads the expressive hierarchy. ${pair.text} carries body copy and controls. Both are self-hosted WOFF2 assets.\n\n## Color\n\nPaper ${palette.paper}; ink ${palette.ink}; signal ${palette.accent}; secondary ${palette.accent2}; panel ${palette.panel}; deep ${palette.deep}.\n\n## Components\n\nLarge direct actions, full-width media, bounded proof rows, and a quiet contact system. Decorative card grids and repeated eyebrow labels are excluded.\n\n## Motion\n\nContent reveals progressively and resolved fields may soften after passing. The exact transparent logo resolves from blur and contrast in the final ink field. Reduced motion displays every element in its final state.\n\n## Asset rules\n\nThe logo is copied byte for byte from the first-party source. All content images are traceable first-party derivatives. See assets/PROVENANCE.json.\n\n## Responsive rules\n\nMobile owns the hierarchy, type scale, button width, crop, and logo size. The final logo remains clear at 320, 375, and 390 pixels.\n\n## Finish gate\n\nStatic checks, browser QA, detector review, duplicate hashes, exact-logo hash, and provenance must pass before completion.\n`);
  atomicText(path.join(siteDir, 'DIRECTION-CONTRACT.md'), `# Direction contract\n\n- Thesis: ${brief.directionContract.thesis}\n- Own world: ${brief.directionContract.ownWorld}\n- Story: ${brief.directionContract.story}\n- First viewport: ${brief.directionContract.firstViewport}\n- Form: ${brief.directionContract.form}\n- Mobile family: ${direction}\n`);
  atomicJson(path.join(siteDir, '.impeccable', 'design.json'), {
    schema: 1,
    generatedBy: 'Prospect Radar Next 20',
    impeccableVersion: '4.0.4',
    mode: 'Persuade',
    direction,
    tokens: { palette, fonts: pair },
    exactLogoSha256: item.logoSha256,
  });
}

function makeBrief(item, source, prospect, pair, palette, rank) {
  const d = descriptor(item.vertical, item.verticalGroup);
  const category = titleCase(item.vertical || d.family);
  const locality = item.city || prospect?.city || item.area || 'Pennsylvania';
  const sourceDescription = clip(source.description || '', 210);
  const directions = ['image first', 'type first', 'split signal'];
  const direction = directions[(rank - 1) % directions.length];
  const officialLine = sourceDescription || `${item.name} is listed by Prospect Radar as a ${category.toLowerCase()} in ${locality}. Current details remain on the official source.`;
  const brief = {
    slug: item.slug,
    prospectId: `RADAR-NEXT20-${String(rank).padStart(3, '0')}`,
    name: item.name,
    city: locality,
    market: item.area || 'Pennsylvania',
    address: `${locality}, Pennsylvania`,
    category,
    vertical: item.vertical,
    attitude: d.attitude,
    url: item.sourceFinalUrl || item.website,
    description: `Private mobile-first concept for ${item.name}, grounded in its official identity and first-party visual source.`,
    logo: true,
    logoFile: item.logoFile,
    logoOutroLine: `${locality} | ${category}`,
    noindex: true,
    schemaType: 'LocalBusiness',
    qualityPolicy: { minImages: 12, maxWords: 500 },
    sections: ['hero', 'proof', 'offerings', 'story', 'experience', 'gallery', 'feature', 'catalog', 'contact', 'closing'],
    tokens: palette,
    fonts: { display: pair.display, displayFallback: 'Georgia,serif', text: pair.text, textFallback: 'Arial,sans-serif' },
    directionContract: {
      thesis: `${item.name} should feel immediate, composed, and unmistakably itself on a phone.`,
      ownWorld: `${direction} editorial system drawn from the exact identity and first-party project material.`,
      story: `Move from orientation to ${d.verb}, source context, visual proof, and a direct official action.`,
      firstViewport: `Exact identity, one clear proposition, a first-party image, and one thumb-ready action.`,
      form: `Mobile-first ${d.family} homepage with an ink-resolved identity finale.`,
    },
    hero: {
      eyebrow: `${locality} | ${category}`,
      headline: d.headline,
      sub: `${item.name} deserves a first screen that makes the next step legible without flattening the character of the work. This private concept begins with the official identity and first-party source material.`,
      ctaPrimary: { label: 'Visit official website', href: item.sourceFinalUrl || item.website },
      ctaSecondary: { label: 'Explore the concept', href: '#offerings' },
      glassFloat: null,
      marquee: [],
    },
    proof: { items: [item.name, `${locality}, Pennsylvania`, category, 'Official source connected'] },
    offerings: {
      heading: 'A homepage organized around the decision a visitor is actually making.',
      items: [
        `Understand the role of ${item.name} without searching through the page`,
        `See first-party visual context before choosing the next ${d.verb}`,
        'Reach the official source through one direct, clearly labelled action',
      ],
    },
    story: {
      heading: 'Identity and evidence lead. The interface follows.',
      imageIndex: 2,
      paragraphs: [
        `${officialLine}`,
        `This concept treats the source material as visual evidence, not decoration. The composition gives each image room to establish scale and character while the written hierarchy stays concise enough for a phone.`,
        `No testimonial, result, price, award, schedule, or service promise is added here. Current operational details remain under the control of the official website.`,
      ],
    },
    experience: {
      heading: 'A deliberate path from first impression to official action.',
      items: [
        'Immediate identity and location context',
        'Readable source-led narrative with decisive image rhythm',
        'A consistent action that stays reachable without interrupting the page',
      ],
    },
    gallery: { heading: 'First-party source material, recut for a mobile editorial rhythm.', imageIndexes: [3, 4, 5, 6, 7, 8] },
    feature: {
      heading: 'The page disappears behind the work, then returns to the identity.',
      text: `As each section passes, progressive motion lets completed information soften without turning the page into a scroll experiment. The final scene resolves the exact ${item.name} logo over a code-native ink field, crisp on every phone density.`,
      imageIndex: 9,
      cta: { label: 'Open official source', href: item.sourceFinalUrl || item.website },
    },
    catalog: {
      heading: 'Three useful routes, kept honest and direct.',
      items: [
        { title: 'Review current services and project information', href: item.sourceFinalUrl || item.website, imageIndex: 10 },
        { title: 'Confirm current location and contact details', href: item.sourceFinalUrl || item.website, imageIndex: 11 },
        { title: `Decide whether the next ${d.verb} makes sense`, href: item.sourceFinalUrl || item.website, imageIndex: 12 },
      ],
    },
    contact: {
      heading: 'Current details belong to the official source.',
      sub: `This private concept does not collect or send information. Use the official ${item.name} website to confirm services, availability, hours, and direct contact details.`,
    },
    closing: { heading: 'A stronger first impression, resolved to the exact mark.', cta: { label: 'Visit official website', href: item.sourceFinalUrl || item.website } },
    links: [{ label: 'Official website', href: item.sourceFinalUrl || item.website }],
    images: Array.from({ length: 12 }, (_, index) => ({ file: `image-${index + 1}.webp`, alt: `First-party visual reference for ${item.name}, mobile crop ${index + 1}` })),
  };
  return { brief, direction };
}

async function prepare() {
  if (!fs.existsSync(selectionPath) || !fs.existsSync(sourcesPath)) throw new Error('Selection and source evidence must exist before build preparation.');
  const selection = JSON.parse(fs.readFileSync(selectionPath, 'utf8'));
  const sourceStatus = JSON.parse(fs.readFileSync(sourcesPath, 'utf8'));
  const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
  if (selection.selection?.length !== 20 || sourceStatus.selected?.length !== 20) throw new Error('Exactly 20 selected and source-ready rows are required.');

  const sourceByDomain = new Map(sourceStatus.selected.map((source) => [source.domain, source]));
  const eligibility = dedupeDecisions(selection.selection.map(item => ({
    ...(registry.prospects[item.domain] || {}), slug: item.slug,
  })));
  if (eligibility.some(result => !result.eligible)) throw new Error('Selected batch contains an unverified or duplicate business logo');
  const fontDirectories = new Map();
  for (const pair of fontPairs) fontDirectories.set(pair.id, await ensureFontPair(pair));

  const order = [];
  for (const item of selection.selection) {
    const source = sourceByDomain.get(item.domain);
    if (!source) throw new Error(`Missing source evidence for ${item.domain}`);
    const prospect = registry.prospects[item.domain] || {};
    const reviewedLogo = assessLogoEligibility(prospect);
    if (!reviewedLogo.eligible || source.logo.sourceUrl !== reviewedLogo.source_url ||
        (source.logo.sourceSha256 || item.logoSha256) !== reviewedLogo.source_sha256) {
      throw new Error(`Logo review no longer matches selected source for ${item.domain}`);
    }
    const rank = item.rank;
    const pair = fontPairs[(rank - 1) % fontPairs.length];
    const palette = palettes[(rank - 1) % palettes.length];
    const assetsDir = path.join(batchDir, 'sites', item.slug, 'assets');
    fs.mkdirSync(assetsDir, { recursive: true });

    const sourceDir = path.join(batchDir, 'source-assets', item.slug);
    const sourceLogo = path.join(sourceDir, item.logoFile);
    const outputLogo = path.join(assetsDir, item.logoFile);
    copy(sourceLogo, outputLogo);
    if (sha256(outputLogo) !== item.logoSha256) throw new Error(`Exact-logo hash mismatch for ${item.slug}`);

    const references = source.references.map((reference) => path.join(sourceDir, reference.fileName));
    if (!references.length || references.some((file) => !fs.existsSync(file))) throw new Error(`Missing first-party reference for ${item.slug}`);
    const provenance = [{ role: 'exact identity', output: item.logoFile, sourceUrl: source.logo.sourceUrl, sourceSha256: source.logo.sourceSha256 || item.logoSha256, outputSha256: item.logoSha256, transformation: source.logo.transformation || 'none; byte-for-byte copy', transparent: true }];
    for (let index = 0; index < 12; index += 1) {
      const input = references[index % references.length];
      const output = path.join(assetsDir, `image-${index + 1}.webp`);
      const filter = makePhotoDerivative(input, output, index, rank);
      const reference = source.references[index % source.references.length];
      provenance.push({
        role: `homepage visual ${index + 1}`,
        output: path.basename(output),
        sourceType: 'first-party photo derivative',
        sourceUrl: reference.sourceUrl,
        sourceFile: reference.fileName,
        sourceSha256: reference.sha256,
        transformation: filter,
        outputSha256: sha256(output),
      });
    }

    const fonts = fontDirectories.get(pair.id);
    for (const file of ['font-display-400.woff2', 'font-display-700.woff2', 'font-text-400.woff2', 'font-text-700.woff2']) copy(path.join(fonts, file), path.join(assetsDir, file));
    const { brief, direction } = makeBrief(item, source, prospect, pair, palette, rank);
    atomicJson(path.join(batchDir, 'briefs', `${item.slug}.json`), brief);
    atomicJson(path.join(assetsDir, 'PROVENANCE.json'), {
      slug: item.slug,
      preparedAt: new Date().toISOString(),
      sourceSite: item.website,
      sourceFinalUrl: source.finalUrl,
      sourcePageSha256: source.pageSha256,
      exactLogoRequired: true,
      exactLogoSha256: item.logoSha256,
      firstPartyDerivativePolicy: 'Content visuals preserve first-party source photography while adapting crop and tonal balance for the private mobile concept. They are not evidence of additional projects or outcomes.',
      generatedCompositionReference: 'automation/prospect-radar-next20/.impeccable/mocks/architerra-mobile-three-directions.png',
      assets: provenance,
      fonts: { pair, source: 'Google Fonts CSS API', files: ['font-display-400.woff2', 'font-display-700.woff2', 'font-text-400.woff2', 'font-text-700.woff2'].map((file) => ({ file, sha256: sha256(path.join(assetsDir, file)) })) },
    });
    siteDocuments(item, source, brief, palette, pair, direction);
    order.push(item.slug);
  }

  atomicJson(path.join(batchDir, 'batch.json'), {
    id: `radar-next20-${runId}`,
    idPrefix: 'RADAR-NEXT20-',
    title: 'Prospect Radar Next 20 | Mobile First',
    market: 'Pennsylvania',
    week: runId.slice(0, 8),
    targetCount: 20,
    order,
    noindex: true,
    deployBaseUrl: '',
    source: 'Current Prospect Radar plus exact first-party identity and visual preflight.',
    selectionPolicy: selection.readinessPolicy,
    note: 'Private local review. Exact source logos, source-led visuals, mobile-first hierarchy, and ink-logo finales. No outreach, publishing, or deployment.',
  });
  return selection;
}

async function main() {
  const selection = await prepare();
  const summary = await runBatch(batchDir, { skipQa });
  const prepared = {
    runId,
    generatedAt: new Date().toISOString(),
    status: summary.ok ? 'built-and-browser-qa-passed' : 'built-with-holds',
    selected: selection.selection.length,
    qaReady: summary.qaReadyCount,
    skipQa,
    batchDir: path.relative(root, batchDir).replace(/\\/g, '/'),
    batchSummarySha256: sha256(path.join(batchDir, 'batch-summary.json')),
    visualDirectionReceiptSha256: hashText(fs.readFileSync(path.join(__dirname, 'VISUALIZE-RECEIPT.md'), 'utf8')),
  };
  atomicJson(path.join(batchDir, 'BUILD-RECEIPT.json'), prepared);
  atomicJson(path.join(__dirname, 'runs', runId, 'BUILD-RECEIPT.json'), prepared);
  if (!summary.ok) process.exitCode = 1;
}

main().catch((error) => {
  const receipt = { runId, status: 'blocked-build', failedAt: new Date().toISOString(), reason: error.message };
  atomicJson(path.join(__dirname, 'runs', runId, 'BLOCKED-BUILD-RECEIPT.json'), receipt);
  console.error(error.stack || error);
  process.exit(1);
});
