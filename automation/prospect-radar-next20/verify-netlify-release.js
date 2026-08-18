#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const baseUrl = String(process.argv[2] || '').replace(/\/$/, '');
const batchDir = path.resolve(String(process.argv[3] || ''));
const outputDir = path.resolve(String(process.argv[4] || ''));
if (!/^https:\/\//.test(baseUrl) || !fs.existsSync(path.join(batchDir, 'batch-summary.json'))) {
  throw new Error('Usage: verify-netlify-release.js <https-base-url> <batch-dir> <output-dir>');
}
fs.mkdirSync(outputDir, { recursive: true });

const summary = JSON.parse(fs.readFileSync(path.join(batchDir, 'batch-summary.json'), 'utf8'));
const slugs = summary.results.map((item) => item.slug);
const preservedRoutes = [
  '/sites/elverson-supply/',
  '/sites/maclaren-kitchen-bath/',
  '/sites/golden-eagle-jewelry/',
  '/sites/morton-electric-pool-spa/',
  '/labs/prospect-3d-scroll-trio/',
];
const representative = ['harvest-dental', 'architerra', 'jcl-automotive'];
const failures = [];
const check = (condition, message) => {
  if (!condition) failures.push(message);
};

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 375, height: 812 }, reducedMotion: 'no-preference' });
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));

  try {
    const rootResponse = await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle', timeout: 45000 });
    const rootHeaders = rootResponse?.headers() || {};
    const root = await page.evaluate(() => {
      const card = document.querySelector('.card');
      const style = card ? getComputedStyle(card) : null;
      return {
        title: document.title,
        heading: document.querySelector('h1')?.textContent?.trim(),
        cards: document.querySelectorAll('.card').length,
        labBanners: document.querySelectorAll('a.scroll-lab-banner').length,
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        cardDisplay: style?.display,
        cardBackground: style?.backgroundColor,
        searchVisible: Boolean(document.querySelector('#q')?.getBoundingClientRect().height),
      };
    });
    check(rootResponse?.status() === 200, `root HTTP ${rootResponse?.status()}`);
    check(root.cards === 50, `root has ${root.cards}/50 cards`);
    check(root.heading === 'Prospect Radar next 50', `unexpected root heading: ${root.heading}`);
    check(root.labBanners === 0, 'root still features the scroll lab');
    check(root.overflow <= 0, `root horizontal overflow ${root.overflow}px`);
    check(['block', 'flex', 'grid'].includes(root.cardDisplay) && root.cardBackground !== 'rgba(0, 0, 0, 0)', 'root card CSS did not apply');
    check(root.searchVisible, 'root search control is not visible');
    check((rootHeaders['x-robots-tag'] || '').includes('noindex'), 'root noindex header missing');
    check((rootHeaders['content-security-policy'] || '').includes("style-src 'self' 'unsafe-inline'"), 'release CSP is not compatible with embedded styles');
    await page.screenshot({ path: path.join(outputDir, 'hub-mobile.png'), fullPage: true });
    await page.fill('#q', 'Harvest Dental');
    root.filteredCards = await page.locator('.card:visible').count();
    check(root.filteredCards === 1, `root search returned ${root.filteredCards} visible cards for Harvest Dental`);
    await page.fill('#q', '');

    const routeResults = [];
    for (const route of [...slugs.map((slug) => `/sites/${slug}/`), ...preservedRoutes]) {
      const response = await context.request.get(`${baseUrl}${route}`, { timeout: 45000 });
      const headers = response.headers();
      routeResults.push({ route, status: response.status(), noindex: (headers['x-robots-tag'] || '').includes('noindex') });
      check(response.status() === 200, `${route} HTTP ${response.status()}`);
      check((headers['x-robots-tag'] || '').includes('noindex'), `${route} noindex header missing`);
    }

    const pageResults = [];
    for (const slug of representative) {
      const route = `/sites/${slug}/`;
      const response = await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle', timeout: 45000 });
      await page.evaluate(async () => document.fonts?.ready);
      const height = await page.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y <= height; y += 520) {
        await page.evaluate((position) => window.scrollTo(0, position), y);
        await page.waitForTimeout(65);
      }
      const imageLocator = page.locator('img');
      const imageCount = await imageLocator.count();
      for (let index = 0; index < imageCount; index += 1) {
        await imageLocator.nth(index).scrollIntoViewIfNeeded();
        await page.waitForTimeout(45);
      }
      await page.waitForFunction(() => [...document.images].every((image) => image.complete), null, { timeout: 15000 });
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await page.waitForTimeout(1300);
      const metrics = await page.evaluate(() => {
        const logo = document.querySelector('.logo-outro .ink-logo');
        const logoStyle = logo ? getComputedStyle(logo) : null;
        const images = [...document.images];
        return {
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          robots: document.querySelector('meta[name="robots"]')?.content || '',
          images: images.length,
          brokenImages: images.filter((image) => !image.complete || image.naturalWidth === 0).length,
          logoOpacity: Number(logoStyle?.opacity || 0),
          logoNaturalWidth: logo?.naturalWidth || 0,
          logoVisibleClass: logo?.classList.contains('visible') || false,
          displayFont: getComputedStyle(document.querySelector('h1')).fontFamily,
        };
      });
      pageResults.push({ route, status: response?.status(), ...metrics });
      check(response?.status() === 200, `${route} browser HTTP ${response?.status()}`);
      check(metrics.overflow <= 0, `${route} horizontal overflow ${metrics.overflow}px`);
      check(metrics.robots.includes('noindex'), `${route} meta noindex missing`);
      check(metrics.brokenImages === 0 && metrics.images >= 13, `${route} has ${metrics.brokenImages} broken images across ${metrics.images}`);
      check(metrics.logoOpacity >= 0.8 && metrics.logoNaturalWidth > 0 && metrics.logoVisibleClass, `${route} ink logo did not resolve after scrolling`);
      await page.screenshot({ path: path.join(outputDir, `${slug}-bottom-mobile.png`), fullPage: false });
    }

    const relevantConsoleErrors = consoleErrors.filter((message) => !/favicon\.ico/i.test(message));
    check(relevantConsoleErrors.length === 0, `browser console errors: ${relevantConsoleErrors.join(' | ')}`);
    check(pageErrors.length === 0, `page errors: ${pageErrors.join(' | ')}`);

    const result = {
      verifiedAt: new Date().toISOString(),
      baseUrl,
      status: failures.length ? 'FAIL' : 'PASS',
      root,
      routes: routeResults,
      representativePages: pageResults,
      consoleErrors: relevantConsoleErrors,
      pageErrors,
      failures,
    };
    fs.writeFileSync(path.join(outputDir, 'NETLIFY-RELEASE-QA.json'), `${JSON.stringify(result, null, 2)}\n`, 'utf8');
    console.log(JSON.stringify({ status: result.status, routeChecks: routeResults.length, representativePages: pageResults.length, failures }, null, 2));
    if (failures.length) process.exitCode = 1;
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
