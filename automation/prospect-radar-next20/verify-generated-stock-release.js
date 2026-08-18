#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const baseUrl = String(process.argv[2] || '').replace(/\/$/, '');
const receiptPath = path.resolve(String(process.argv[3] || ''));
const outputDir = path.resolve(String(process.argv[4] || ''));
if (!/^https:\/\//.test(baseUrl) || !fs.existsSync(receiptPath)) {
  throw new Error('Usage: verify-generated-stock-release.js <https-base-url> <receipt-json> <output-dir>');
}
fs.mkdirSync(outputDir, { recursive: true });

const receipt = JSON.parse(fs.readFileSync(receiptPath, 'utf8'));
const slugs = receipt.sites.map(site => site.slug);
const representative = [
  'lees-hoagie-house',
  'ban-ban-asian-bistro',
  'countryside-animal-clinic-kurt-krusen-dvm',
  'fillman-and-sons-floors-and-more',
  'crosson-and-richetti-llc',
  'maclaren-kitchen-bath',
  'golden-eagle-jewelry',
  'morton-electric-pool-spa',
];
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'no-preference' });
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  page.on('console', message => { if (message.type() === 'error' && !/favicon\.ico/i.test(message.text())) consoleErrors.push(message.text()); });
  page.on('pageerror', error => pageErrors.push(error.message));

  try {
    const rootResponse = await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle', timeout: 45000 });
    const root = await page.evaluate(() => ({
      cards: document.querySelectorAll('.card').length,
      heading: document.querySelector('h1')?.textContent?.trim(),
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      scrollLabBanners: document.querySelectorAll('a.scroll-lab-banner').length,
    }));
    check(rootResponse?.status() === 200, `root HTTP ${rootResponse?.status()}`);
    check(root.cards === 50, `root has ${root.cards}/50 cards`);
    check(root.heading === 'Prospect Radar next 50', `unexpected root heading: ${root.heading}`);
    check(root.overflow <= 0, `root horizontal overflow ${root.overflow}px`);
    check(root.scrollLabBanners === 0, 'root features the excluded scroll lab');
    await page.screenshot({ path: path.join(outputDir, 'hub-mobile.png'), fullPage: true });

    const routes = [];
    let checkedAssets = 0;
    for (const slug of slugs) {
      const route = `/sites/${slug}/`;
      const response = await context.request.get(`${baseUrl}${route}`, { timeout: 45000 });
      const html = await response.text();
      const stockReferenceList = html.match(/assets\/generated-stock-[1-4]\.webp/g) || [];
      const stockReferences = stockReferenceList.length;
      const uniqueStockReferences = new Set(stockReferenceList).size;
      const disclosed = html.includes('Illustrative generated imagery. These are concept visuals');
      const noindex = (response.headers()['x-robots-tag'] || '').includes('noindex');
      routes.push({ route, status: response.status(), noindex, stockReferences, uniqueStockReferences, disclosed });
      check(response.status() === 200, `${route} HTTP ${response.status()}`);
      check(noindex, `${route} noindex header missing`);
      check(stockReferences >= 3, `${route} has only ${stockReferences} generated image references`);
      check(stockReferences <= 4 && uniqueStockReferences === stockReferences, `${route} repeats generated image references (${stockReferences} refs, ${uniqueStockReferences} unique)`);
      check(disclosed, `${route} generated-image disclosure missing`);
      for (let image = 1; image <= 4; image += 1) {
        const asset = await context.request.get(`${baseUrl}${route}assets/generated-stock-${image}.webp`, { timeout: 45000 });
        checkedAssets += 1;
        check(asset.status() === 200, `${route}assets/generated-stock-${image}.webp HTTP ${asset.status()}`);
        check((asset.headers()['content-type'] || '').includes('image/webp'), `${route}generated-stock-${image} wrong content type`);
      }
    }

    const pages = [];
    for (const slug of representative) {
      const route = `/sites/${slug}/`;
      const response = await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle', timeout: 45000 });
      await page.evaluate(async () => document.fonts?.ready);
      const height = await page.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y <= height; y += 680) {
        await page.evaluate(position => window.scrollTo(0, position), y);
        await page.waitForTimeout(35);
      }
      await page.waitForFunction(() => [...document.images].every(image => image.complete), null, { timeout: 15000 });
      const metrics = await page.evaluate(() => {
        const stock = [...document.querySelectorAll('img[src*="generated-stock-"]')];
        const disclosure = [...document.querySelectorAll('.generated-imagery-disclosure')][0];
        return {
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          stockImages: stock.length,
          uniqueStockImages: new Set(stock.map(image => image.getAttribute('src'))).size,
          brokenStockImages: stock.filter(image => image.naturalWidth === 0).length,
          disclosureVisible: Boolean(disclosure && disclosure.getBoundingClientRect().height > 0),
          robots: document.querySelector('meta[name="robots"]')?.content || '',
        };
      });
      pages.push({ route, status: response?.status(), ...metrics });
      check(response?.status() === 200, `${route} browser HTTP ${response?.status()}`);
      check(metrics.overflow <= 0, `${route} horizontal overflow ${metrics.overflow}px`);
      check(metrics.stockImages >= 3 && metrics.brokenStockImages === 0, `${route} stock images ${metrics.stockImages}, broken ${metrics.brokenStockImages}`);
      check(metrics.stockImages <= 4 && metrics.uniqueStockImages === metrics.stockImages, `${route} repeats rendered stock images (${metrics.stockImages} rendered, ${metrics.uniqueStockImages} unique)`);
      check(metrics.disclosureVisible, `${route} disclosure is not visible`);
      check(metrics.robots.includes('noindex'), `${route} meta noindex missing`);
      await page.screenshot({ path: path.join(outputDir, `${slug}-mobile.png`), fullPage: true });
    }

    check(consoleErrors.length === 0, `console errors: ${consoleErrors.join(' | ')}`);
    check(pageErrors.length === 0, `page errors: ${pageErrors.join(' | ')}`);
    const result = {
      verifiedAt: new Date().toISOString(), baseUrl, status: failures.length ? 'FAIL' : 'PASS',
      root, siteCount: slugs.length, checkedAssets, routes, representativePages: pages,
      consoleErrors, pageErrors, failures,
    };
    fs.writeFileSync(path.join(outputDir, 'GENERATED-STOCK-QA.json'), `${JSON.stringify(result, null, 2)}\n`, 'utf8');
    console.log(JSON.stringify({ status: result.status, siteCount: result.siteCount, checkedAssets, representativePages: pages.length, failures }, null, 2));
    if (failures.length) process.exitCode = 1;
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
