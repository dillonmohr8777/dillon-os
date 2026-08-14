#!/usr/bin/env node
/**
 * Back-compat wrapper. Unique photoreal / animated fills live in
 * generate-unique-media.js.
 *
 *   node fill-atmosphere-images.js <site-dir> <brief.json> [harvest-dir]
 */
const fs = require('fs');
const { generateUniqueMedia } = require('./generate-unique-media.js');

async function fillAtmosphereImages(siteDir, brief, harvestDir) {
  return generateUniqueMedia(siteDir, brief, harvestDir);
}

module.exports = { fillAtmosphereImages };

if (require.main === module) {
  const siteDir = process.argv[2];
  const brief = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));
  fillAtmosphereImages(siteDir, brief, process.argv[4]).then((r) => {
    console.log(JSON.stringify(r));
  });
}
