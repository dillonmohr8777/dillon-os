#!/usr/bin/env node
/**
 * After harvest: briefs, build, harvest images, atmosphere fills, unique hashes.
 * Visual QA is left to build-batch.js so this step can iterate on spec fit.
 */
const fs = require('fs');
const path = require('path');
const { buildBrief, fitBriefToMeasuredSpec } = require('/workspace/_templates/site-factory/brief-from-harvest.js');
const { buildSite } = require('/workspace/_templates/site-factory/build-site.js');
const { applyHarvestImages } = require('/workspace/_templates/site-factory/apply-harvest-images.js');
const { fillAtmosphereImages } = require('/workspace/_templates/site-factory/fill-atmosphere-images.js');
const { uniquifyAssets } = require('/workspace/_templates/site-factory/uniquify-assets.js');
const { checkSpec } = require('/workspace/_templates/site-factory/lib/spec.js');

const BATCH = path.join(__dirname, '..');
const targets = JSON.parse(fs.readFileSync(path.join(BATCH, 'targets.json'), 'utf8'));
const wowPath = path.join(BATCH, 'wow-library.json');
const wow = fs.existsSync(wowPath) ? JSON.parse(fs.readFileSync(wowPath, 'utf8')) : { items: [] };
const wowOk = (wow.items || []).filter((i) => i.ok && i.url);
const verifiedPath = path.join(BATCH, 'verified-facts.json');
const verified = fs.existsSync(verifiedPath) ? JSON.parse(fs.readFileSync(verifiedPath, 'utf8')) : {};

(async () => {
  const briefsDir = path.join(BATCH, 'briefs');
  const sitesRoot = path.join(BATCH, 'sites');
  fs.mkdirSync(briefsDir, { recursive: true });
  fs.mkdirSync(sitesRoot, { recursive: true });
  const report = [];

  for (const [i, target] of targets.entries()) {
    const harvestFile = path.join('/workspace/_templates/site-factory/harvest', target.slug, 'harvest.json');
    if (!fs.existsSync(harvestFile)) {
      report.push({ slug: target.slug, status: 'no-harvest' });
      console.log('SKIP no harvest', target.slug);
      continue;
    }
    const harvest = JSON.parse(fs.readFileSync(harvestFile, 'utf8'));
    const extra = verified[target.slug];
    if (extra && extra.address) {
      harvest.facts = harvest.facts || {};
      harvest.facts.address = extra.address;
    }
    if (harvest.site && harvest.site.error && !(harvest.voice && harvest.voice.headings && harvest.voice.headings.length)) {
      report.push({ slug: target.slug, status: 'harvest-failed', error: harvest.site.error });
      console.log('SKIP failed harvest', target.slug, harvest.site.error);
      continue;
    }
    const composition = wowOk[i] || wowOk[i % Math.max(wowOk.length, 1)] || null;
    target.composition_ref = composition && composition.url;
    const brief = buildBrief(harvest, target, target.composition_ref);
    const briefPath = path.join(briefsDir, `${target.slug}.json`);
    const built = buildSite(brief, sitesRoot);
    applyHarvestImages(target.slug, built.outDir);
    await fillAtmosphereImages(built.outDir, brief, path.dirname(harvestFile));
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
      address: Boolean(brief.address),
      composition_ref: brief.composition_ref,
      layout: brief.layout,
      specFails,
    });
    console.log(
      target.slug,
      measured.words,
      'words',
      measured.images,
      'images',
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
