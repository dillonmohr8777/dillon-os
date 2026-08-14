#!/usr/bin/env node
/**
 * Fill missing factory image slots with unique atmosphere frames.
 * Never claimed as the business's photography. PROVENANCE.json records generated.
 *
 *   node fill-atmosphere-images.js <site-dir> <brief.json> [harvest-dir]
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

async function fillAtmosphereImages(siteDir, brief, harvestDir) {
  const assets = path.join(siteDir, 'assets');
  fs.mkdirSync(assets, { recursive: true });
  const needed = (brief.images || []).length || 12;
  const missing = [];
  for (let i = 1; i <= needed; i++) {
    const dest = path.join(assets, `image-${i}.webp`);
    if (!fs.existsSync(dest) || fs.statSync(dest).size < 800) missing.push(i);
  }
  if (!missing.length) return { generated: 0 };

  const t = brief.tokens || {};
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 980 } });
  const generated = [];
  for (const n of missing) {
    const salt = String(brief.slug || brief.name || 'site')
      .split('')
      .reduce((a, c) => a + c.charCodeAt(0), 0);
    const html = `<!doctype html><meta charset="utf-8">
<style>
  html,body{margin:0;height:100%;font-family:Georgia,serif;color:${t.onDeep || '#fff'}}
  body{background:
    radial-gradient(900px 500px at ${12 + n * 7 + (salt % 11)}% ${18 + n * 5 + (salt % 9)}%, ${t.accent2 || '#D4A017'}, transparent 55%),
    radial-gradient(700px 420px at ${80 - n * 4 - (salt % 7)}% ${70 - n * 3}%, ${t.accent || '#C2410C'}, transparent 60%),
    linear-gradient(${135 + (salt % 40)}deg, ${t.deep || '#12161C'}, ${t.panel || '#C9B8A4'});
  }
  .mark{position:absolute;inset:auto 8% 10% 8%;font-size:42px;letter-spacing:-.03em;opacity:.22}
</style>
<div class="mark">${brief.name || ''} ${brief.slug || ''} ${n}</div>`;
    await page.setContent(html);
    const buf = await page.screenshot({ type: 'png' });
    fs.writeFileSync(path.join(assets, `image-${n}.webp`), buf);
    generated.push(n);
  }
  await browser.close();

  const provPath = path.join(assets, 'PROVENANCE.json');
  const prev = fs.existsSync(provPath) ? JSON.parse(fs.readFileSync(provPath, 'utf8')) : {};
  prev.generatedAtmosphere = generated;
  prev.generatedNote = 'Atmosphere fills. Not the business\'s official photography.';
  prev.harvestDir = harvestDir || prev.harvestDir || null;
  fs.writeFileSync(provPath, JSON.stringify(prev, null, 2));
  return { generated: generated.length, slots: generated };
}

module.exports = { fillAtmosphereImages };

if (require.main === module) {
  const siteDir = process.argv[2];
  const brief = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));
  fillAtmosphereImages(siteDir, brief, process.argv[4]).then((r) => {
    console.log(JSON.stringify(r));
  });
}
