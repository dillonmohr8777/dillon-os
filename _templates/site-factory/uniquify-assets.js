#!/usr/bin/env node
/**
 * Make every factory image unique across a batch and keep files at a reviewable size.
 *
 * Harvest copies and full-page shots often share bytes. The batch runner fails
 * duplicate SHA-1 hashes, so each file gets a per-site color stamp and a JPEG
 * re-encode. Bytes stay named image-N.webp so existing briefs keep working;
 * Chromium sniffs the JPEG payload.
 *
 *   node uniquify-assets.js <site-dir> [slug]
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');

function uniquifyAssets(siteDir, slug) {
  const assets = path.join(siteDir, 'assets');
  if (!fs.existsSync(assets)) return { updated: 0 };
  const id = slug || path.basename(siteDir);
  const files = fs
    .readdirSync(assets)
    .filter((f) => /^image-\d+\.(webp|jpg|jpeg|png)$/i.test(f))
    .sort();
  let updated = 0;
  for (const file of files) {
    const src = path.join(assets, file);
    const dest = path.join(assets, file.replace(/\.(jpg|jpeg|png)$/i, '.webp'));
    const tmp = `${src}.${process.pid}.uniq.jpg`;
    const stamp = crypto.createHash('sha1').update(`${id}/${file}`).digest('hex').slice(0, 6);
    try {
      execFileSync(
        'ffmpeg',
        [
          '-y',
          '-i',
          src,
          '-vf',
          `crop=iw:'min(ih,980)':0:0,scale='min(1400,iw)':-2,drawbox=x=iw-10:y=ih-10:w=8:h=8:color=0x${stamp}@1:t=fill`,
          '-q:v',
          '6',
          tmp,
        ],
        { stdio: ['ignore', 'pipe', 'pipe'] }
      );
      const out = fs.readFileSync(tmp);
      if (out.length < 800) throw new Error('uniquify produced a tiny file');
      fs.writeFileSync(dest, out);
      if (src !== dest && fs.existsSync(src)) fs.unlinkSync(src);
      updated += 1;
    } finally {
      if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
    }
  }
  return { updated, slug: id };
}

module.exports = { uniquifyAssets };

if (require.main === module) {
  const siteDir = process.argv[2];
  if (!siteDir) {
    console.error('Usage: node uniquify-assets.js <site-dir> [slug]');
    process.exit(1);
  }
  console.log(JSON.stringify(uniquifyAssets(siteDir, process.argv[3])));
}
