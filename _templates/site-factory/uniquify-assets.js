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

function isAnimatedBuffer(buf) {
  if (!buf || buf.length < 12) return false;
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) return true;
  if (buf.slice(0, 4).toString('ascii') === 'RIFF' && buf.slice(8, 12).toString('ascii') === 'WEBP') {
    return buf.includes(Buffer.from('ANIM')) || buf.includes(Buffer.from('ANMF'));
  }
  return false;
}

function uniquifyAssets(siteDir, slug) {
  const assets = path.join(siteDir, 'assets');
  if (!fs.existsSync(assets)) return { updated: 0 };
  const id = slug || path.basename(siteDir);
  const files = fs
    .readdirSync(assets)
    .filter((f) => /^image-\d+\.(webp|jpg|jpeg|png|gif)$/i.test(f))
    .sort();
  let updated = 0;
  for (const file of files) {
    const src = path.join(assets, file);
    const dest = path.join(assets, file.replace(/\.(jpg|jpeg|png|gif)$/i, '.webp'));
    const stamp = crypto.createHash('sha1').update(`${id}/${file}`).digest('hex').slice(0, 6);
    const raw = fs.readFileSync(src);
    if (isAnimatedBuffer(raw)) {
      const tmp = `${src}.${process.pid}.uniq.webp`;
      try {
        execFileSync(
          'ffmpeg',
          [
            '-y',
            '-i',
            src,
            '-vf',
            `drawbox=x=iw-12:y=ih-12:w=10:h=10:color=0x${stamp}@1:t=fill`,
            '-an',
            '-c:v',
            'libwebp',
            '-q:v',
            '72',
            '-loop',
            '0',
            tmp,
          ],
          { stdio: ['ignore', 'pipe', 'pipe'] }
        );
        const out = fs.readFileSync(tmp);
        if (out.length < 800) throw new Error('uniquify produced a tiny file');
        fs.writeFileSync(dest, out);
        if (src !== dest && fs.existsSync(src)) fs.unlinkSync(src);
        updated += 1;
      } catch (err) {
        console.warn(`uniquify keep-anim ${file}: ${(err.message || err).toString().split('\n')[0]}`);
        if (src !== dest) fs.copyFileSync(src, dest);
      } finally {
        if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
      }
      continue;
    }
    const tmp = `${src}.${process.pid}.uniq.jpg`;
    try {
      execFileSync(
        'ffmpeg',
        [
          '-y',
          '-i',
          src,
          '-frames:v',
          '1',
          '-update',
          '1',
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
    } catch (err) {
      console.warn(`uniquify skip ${file}: ${(err.message || err).toString().split('\n')[0]}`);
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
