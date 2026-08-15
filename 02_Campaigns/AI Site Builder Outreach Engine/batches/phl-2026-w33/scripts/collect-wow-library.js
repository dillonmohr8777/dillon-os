#!/usr/bin/env node
/**
 * Build a 200-site wow UI/UX reference catalog.
 *
 * Reddit's JSON API is blocked from this VM. r/web_design itself points people
 * at Godly, Land-book, Siteinspire, One Page Love, Awwwards, and CSSDA, so those
 * galleries plus a seed of widely cited product/agency homepages are the source.
 *
 *   node collect-wow-library.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SEED = JSON.parse(fs.readFileSync(path.join(__dirname, 'wow-seed.json'), 'utf8'));
const OUT = path.join(ROOT, 'wow-library.json');

const BLOCK = /reddit\.com|redd\.it|facebook\.com|instagram\.com|twitter\.com|x\.com|tiktok\.com|pinterest\.com|doubleclick|googleadservices|youtube\.com\/watch/i;

function norm(u) {
  try {
    const x = new URL(u);
    if (!/^https?:$/.test(x.protocol)) return null;
    x.hash = '';
    x.search = '';
    const host = x.hostname.replace(/^www\./, '');
    if (BLOCK.test(host + x.pathname)) return null;
    return x.toString().replace(/\/$/, '') || x.origin;
  } catch {
    return null;
  }
}

async function scrapeGallery(browser, startUrl, limit = 80) {
  const found = [];
  const page = await browser.newPage();
  try {
    await page.goto(startUrl, { waitUntil: 'domcontentloaded', timeout: 25000 });
    await page.waitForTimeout(2500);
    for (let i = 0; i < 8; i++) {
      await page.mouse.wheel(0, 1800);
      await page.waitForTimeout(400);
    }
    const hrefs = await page.$$eval('a[href]', (as) => as.map((a) => a.href).filter(Boolean));
    for (const h of hrefs) found.push(h);
  } catch (err) {
    console.error('scrape fail', startUrl, err.message.split('\n')[0]);
  } finally {
    await page.close();
  }
  return found.slice(0, limit);
}

(async () => {
  const urls = [];
  const seen = new Set();
  const add = (u, source) => {
    const n = norm(u);
    if (!n || seen.has(n)) return;
    seen.add(n);
    urls.push({ url: n, source });
  };

  for (const u of SEED.urls) add(u, 'seed');

  let chromium;
  try {
    ({ chromium } = require('playwright'));
  } catch {
    console.error('Playwright missing; writing seed-only catalog');
  }

  if (chromium) {
    const browser = await chromium.launch();
    const galleries = [
      'https://godly.design/sites',
      'https://godly.website',
      'https://land-book.com',
      'https://onepagelove.com/gallery',
      'https://www.siteinspire.com/websites',
      'https://www.cssdesignawards.com/wotd-award-winners',
    ];
    for (const g of galleries) {
      const hrefs = await scrapeGallery(browser, g, 120);
      for (const h of hrefs) add(h, g);
      console.log(g, 'now', urls.length);
    }
    await browser.close();
  }

  const catalog = {
    generated: new Date().toISOString(),
    target: 200,
    count: Math.min(200, urls.length),
    sourced: SEED.sourced,
    reddit_note:
      'Anonymous Reddit JSON was blocked (old.reddit.com returns Blocked). Catalog uses the galleries r/web_design names as the wow-site feed, plus Muzli April 2026 and Graphic Design Junction 2026 award roundups.',
    items: urls.slice(0, 200),
  };
  fs.writeFileSync(OUT, JSON.stringify(catalog, null, 2));
  console.log('wrote', OUT, catalog.count);
})();
