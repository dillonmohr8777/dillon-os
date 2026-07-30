#!/usr/bin/env node
/**
 * Copy harvested site/social imagery into a built site's assets folder.
 *
 *   node _templates/site-factory/apply-harvest-images.js <slug> [site-dir]
 *
 * Reads _templates/site-factory/harvest/<slug>/images/* (from harvest.js)
 * and writes image-1.webp ... into <site-dir>/assets/ (default: cwd/sites/<slug>).
 *
 * Prefer real harvested photos. If harvest is thin (<6 images), the CLI prints
 * a GENERATE_SIMILAR hint so an agent can create lookalike imagery with the
 * image tool — never invent photos and claim they are the business's own.
 */
const fs = require('fs');
const path = require('path');
const { assertSafeSlug } = require('./lib/validate.js');

function applyHarvestImages(slug, siteDir, opts = {}) {
  const safe = assertSafeSlug(slug);
  const harvestDir = opts.harvestDir || path.join(__dirname, 'harvest', safe);
  const imagesDir = path.join(harvestDir, 'images');
  const outAssets = path.join(siteDir, 'assets');
  fs.mkdirSync(outAssets, { recursive: true });

  if (!fs.existsSync(imagesDir)) {
    return { slug: safe, copied: 0, sources: [], hint: 'NO_HARVEST_IMAGES' };
  }

  const files = fs
    .readdirSync(imagesDir)
    .filter((f) => /\.(webp|jpg|jpeg|png|avif|gif)$/i.test(f))
    .sort();

  const targetCount = opts.targetCount || 12;
  const sources = files.slice(0, targetCount);
  const copied = [];

  sources.forEach((file, i) => {
    const ext = path.extname(file).toLowerCase().replace('jpeg', 'jpg');
    // Keep original bytes; rename to the factory's image-N convention.
    // WebP conversion is optional downstream; browsers accept jpg/png in .webp
    // named slots only if we keep real extension — so preserve real ext via mapping.
    const destName = `image-${i + 1}${ext === '.webp' ? '.webp' : ext}`;
    // Factory HTML expects .webp filenames by default; copy as image-N.webp bytes
    // regardless of source format so paths match the brief.
    const dest = path.join(outAssets, `image-${i + 1}.webp`);
    fs.copyFileSync(path.join(imagesDir, file), dest);
    copied.push({ from: file, to: path.basename(dest), as: destName });
  });

  let hint = null;
  if (copied.length < 6) {
    hint =
      'GENERATE_SIMILAR: harvest returned fewer than 6 images. Use the image generation tool to create lookalike atmosphere shots matching harvest screenshots and palette — label them as generated, never as official photography.';
  }

  // Write provenance note next to assets
  const harvestMeta = path.join(harvestDir, 'harvest.json');
  const provenance = {
    slug: safe,
    appliedAt: new Date().toISOString(),
    harvestDir,
    copied: copied.length,
    sources: copied,
    hint,
    siteUrl: fs.existsSync(harvestMeta) ? JSON.parse(fs.readFileSync(harvestMeta, 'utf8')).siteUrl : null,
  };
  fs.writeFileSync(path.join(outAssets, 'PROVENANCE.json'), JSON.stringify(provenance, null, 2));

  return provenance;
}

module.exports = { applyHarvestImages };

if (require.main === module) {
  const slug = process.argv[2];
  const siteDir = process.argv[3] || path.join(process.cwd(), 'sites', slug);
  if (!slug) {
    console.error('Usage: node apply-harvest-images.js <slug> [site-dir]');
    process.exit(1);
  }
  try {
    const result = applyHarvestImages(slug, siteDir);
    console.log(`Copied ${result.copied} harvest images into ${path.join(siteDir, 'assets')}`);
    if (result.hint) console.log(result.hint);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}
