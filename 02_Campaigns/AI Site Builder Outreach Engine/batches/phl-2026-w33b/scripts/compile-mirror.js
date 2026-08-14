#!/usr/bin/env node
/**
 * Mirror-and-improve compile: harvest owns brand, copy, photos, palette.
 * No wow-library composition_ref. Layout comes from inferMirrorLayout.
 */
const fs = require('fs');
const path = require('path');
const { buildBrief, fitBriefToMeasuredSpec } = require('/workspace/_templates/site-factory/brief-from-harvest.js');
const { buildSite } = require('/workspace/_templates/site-factory/build-site.js');
const { applyHarvestImages } = require('/workspace/_templates/site-factory/apply-harvest-images.js');
const { generateUniqueMedia } = require('/workspace/_templates/site-factory/generate-unique-media.js');
const { uniquifyAssets } = require('/workspace/_templates/site-factory/uniquify-assets.js');
const { checkSpec } = require('/workspace/_templates/site-factory/lib/spec.js');

const BATCH = path.join(__dirname, '..');
const targets = JSON.parse(fs.readFileSync(path.join(BATCH, 'targets.json'), 'utf8'));

(async () => {
  const briefsDir = path.join(BATCH, 'briefs');
  const sitesRoot = path.join(BATCH, 'sites');
  fs.mkdirSync(briefsDir, { recursive: true });
  fs.mkdirSync(sitesRoot, { recursive: true });
  const report = [];

  for (const target of targets) {
    const harvestFile = path.join('/workspace/_templates/site-factory/harvest', target.slug, 'harvest.json');
    if (!fs.existsSync(harvestFile)) {
      report.push({ slug: target.slug, status: 'no-harvest' });
      console.log('SKIP no harvest', target.slug);
      continue;
    }
    const harvest = JSON.parse(fs.readFileSync(harvestFile, 'utf8'));
    if (harvest.site && harvest.site.error && !(harvest.voice && harvest.voice.headings && harvest.voice.headings.length)) {
      report.push({ slug: target.slug, status: 'harvest-failed', error: harvest.site.error });
      console.log('SKIP failed harvest', target.slug, harvest.site.error);
      continue;
    }
    const brief = buildBrief(harvest, target, null);
    const briefPath = path.join(briefsDir, `${target.slug}.json`);
    const built = buildSite(brief, sitesRoot);
    applyHarvestImages(target.slug, built.outDir);
    await generateUniqueMedia(built.outDir, brief, path.dirname(harvestFile));
    uniquifyAssets(built.outDir, target.slug);
    const measured = fitBriefToMeasuredSpec(brief, () => buildSite(brief, sitesRoot));
    fs.writeFileSync(briefPath, JSON.stringify(brief, null, 2));
    const specFails = checkSpec({
      sections: measured.sections.length,
      words: measured.words,
      images: measured.images,
    });
    report.push({
      slug: target.slug,
      status: specFails.length ? 'spec-hold' : 'compiled',
      words: measured.words,
      images: measured.images,
      sections: measured.sections.length,
      attitude: brief.attitude,
      layout: brief.layout,
      headline: brief.hero && brief.hero.headline,
      address: Boolean(brief.address),
      specFails,
    });
    console.log(
      target.slug,
      brief.layout,
      measured.words,
      'words',
      brief.attitude,
      specFails.length ? specFails.join('; ') : 'spec-ok'
    );
  }

  fs.writeFileSync(path.join(BATCH, 'compile-report.json'), JSON.stringify(report, null, 2));
  console.log('compile-report', report.length);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
