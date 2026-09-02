#!/usr/bin/env node
// Download completed Higgsfield results into sites/<slug>/assets/image-N.webp
//   node tools/fetch-images.js <slug> <urls.json>   (urls.json: { "1": "https://...png", ... })
const fs = require('fs'); const path = require('path'); const { execFileSync } = require('child_process');
const sharp = require('/home/user/dillon-os/node_modules/sharp');
const [slug, urlsFile] = process.argv.slice(2);
const urls = JSON.parse(fs.readFileSync(urlsFile, 'utf8'));
const out = path.join(__dirname, '..', 'sites', slug, 'assets'); fs.mkdirSync(out, { recursive: true });
(async () => {
  let ok = 0;
  for (const [n, url] of Object.entries(urls)) {
    const tmp = path.join(out, `raw-${n}.png`);
    try {
      execFileSync('curl', ['-s', '-L', '--max-time', '90', '-o', tmp, url]);
      const info = await sharp(tmp).resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 76 }).toFile(path.join(out, `image-${n}.webp`));
      fs.unlinkSync(tmp); ok++;
      process.stdout.write(`${n}:${Math.round(info.size / 1024)}k `);
    } catch (e) { console.error(`\nFAIL image-${n}: ${e.message.split('\n')[0]}`); }
  }
  console.log(`\n${slug}: ${ok}/${Object.keys(urls).length} images`);
})();
