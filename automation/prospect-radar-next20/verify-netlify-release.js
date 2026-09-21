#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..', '..');
const baseUrl = String(process.argv[2] || '').replace(/\/$/, '');
const batchDir = path.resolve(String(process.argv[3] || ''));
const outputDir = path.resolve(String(process.argv[4] || ''));
const pointerPath = path.join(__dirname, 'CURRENT-PRODUCTION.json');
if (!/^https:\/\//.test(baseUrl) || !fs.existsSync(path.join(batchDir, 'batch-summary.json')) || !fs.existsSync(pointerPath)) {
  throw new Error('Usage: verify-netlify-release.js <https-base-url> <batch-dir> <output-dir>');
}
fs.mkdirSync(outputDir, { recursive: true });

const summary = JSON.parse(fs.readFileSync(path.join(batchDir, 'batch-summary.json'), 'utf8'));
const selection = JSON.parse(fs.readFileSync(path.join(batchDir, 'SELECTION-EVIDENCE.json'), 'utf8'));
const pointer = JSON.parse(fs.readFileSync(pointerPath, 'utf8'));
const selectedBySlug = new Map(selection.selection.map((item) => [item.slug, item]));
const slugs = summary.results.map((item) => item.slug);
if (slugs.length !== 20 || new Set(slugs).size !== 20) throw new Error('Live verification requires exactly 20 unique selected routes.');

const failures = [];
const check = (condition, message) => {
  if (!condition) failures.push(message);
};
const noindex = (headers) => (headers['x-robots-tag'] || '').toLowerCase().includes('noindex');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  page.on('console', (message) => {
    if (message.type() === 'error' && !/favicon\.ico/i.test(message.text())) consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));

  try {
    const rootResponse = await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle', timeout: 45000 });
    const rootHeaders = rootResponse?.headers() || {};
    const root = await page.evaluate(() => ({
      title: document.title,
      heading: document.querySelector('h1')?.textContent?.trim() || '',
      siteLinks: [...document.querySelectorAll('a.build[href^="/sites/"]')].map((link) => link.getAttribute('href')),
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      metaRobots: document.querySelector('meta[name="robots"]')?.content || '',
    }));
    const expectedRootCount = Number(pointer.indexed_businesses) + 20;
    check(rootResponse?.status() === 200, `root HTTP ${rootResponse?.status()}`);
    check(root.siteLinks.length === expectedRootCount, `root has ${root.siteLinks.length}/${expectedRootCount} indexed site links`);
    check(root.overflow <= 0, `root horizontal overflow ${root.overflow}px`);
    check(noindex(rootHeaders), 'root noindex header missing');
    check(root.metaRobots.includes('noindex'), 'root noindex meta missing');
    for (const slug of slugs) check(root.siteLinks.includes(`/sites/${slug}/`), `root missing new route link ${slug}`);
    await page.screenshot({ path: path.join(outputDir, 'hub-mobile.png'), fullPage: true });

    const routeResults = [];
    for (const slug of slugs) {
      const route = `/sites/${slug}/`;
      const selected = selectedBySlug.get(slug);
      const response = await context.request.get(`${baseUrl}${route}`, { timeout: 45000 });
      const headers = response.headers();
      const heroResponse = await context.request.get(`${baseUrl}${route}assets/image-1.webp`, { timeout: 45000 });
      const provenanceResponse = await context.request.get(`${baseUrl}${route}assets/ALIGN-IMAGE-PROVENANCE.json`, { timeout: 45000 });
      let provenance = null;
      try { provenance = await provenanceResponse.json(); } catch {}
      const heroContentType = heroResponse.headers()['content-type'] || '';
      const assetResults = [];
      for (const output of provenance?.outputs || []) {
        const assetResponse = await context.request.get(`${baseUrl}${route}assets/${output.output}`, { timeout: 45000 });
        assetResults.push({
          output: output.output,
          status: assetResponse.status(),
          contentType: assetResponse.headers()['content-type'] || '',
        });
      }
      const assetFailures = assetResults.filter((asset) => asset.status !== 200 || !/image\/webp/i.test(asset.contentType));
      const result = {
        slug,
        route,
        status: response.status(),
        noindex: noindex(headers),
        heroStatus: heroResponse.status(),
        heroContentType,
        provenanceStatus: provenanceResponse.status(),
        provenanceBusiness: provenance?.business || null,
        provenanceBoard: provenance?.board?.key || null,
        provenanceOutputs: provenance?.outputs?.length || 0,
        assetsChecked: assetResults.length,
        assetFailures,
      };
      routeResults.push(result);
      check(result.status === 200, `${route} HTTP ${result.status}`);
      check(result.noindex, `${route} noindex header missing`);
      check(result.heroStatus === 200 && /image\/webp/i.test(heroContentType), `${route} hero asset missing or wrong type (${result.heroStatus}, ${heroContentType || 'no content type'})`);
      check(result.provenanceStatus === 200, `${route} Align provenance file missing`);
      check(result.provenanceBusiness === selected?.name && result.provenanceBoard === slug && result.provenanceOutputs === 12, `${route} provenance mismatch`);
      check(result.assetsChecked === 12 && result.assetFailures.length === 0, `${route} derivative asset verification failed`);
    }

    const pageResults = [];
    for (const slug of slugs) {
      const route = `/sites/${slug}/`;
      const response = await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle', timeout: 45000 });
      await page.evaluate(async () => document.fonts?.ready);
      const metrics = await page.evaluate(() => {
        const images = [...document.images];
        const hero = document.querySelector('.hero img');
        return {
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          robots: document.querySelector('meta[name="robots"]')?.content || '',
          heading: document.querySelector('h1')?.textContent?.trim() || '',
          images: images.length,
          heroLoaded: Boolean(hero?.complete && hero.naturalWidth > 0),
          disclosure: document.body.textContent.includes('Generated imagery does not depict'),
        };
      });
      pageResults.push({ slug, route, status: response?.status(), ...metrics });
      check(response?.status() === 200, `${route} browser HTTP ${response?.status()}`);
      check(metrics.overflow <= 0, `${route} horizontal overflow ${metrics.overflow}px`);
      check(metrics.robots.includes('noindex'), `${route} meta noindex missing`);
      check(metrics.heading.length > 0, `${route} hero heading missing`);
      check(metrics.images >= 12 && metrics.heroLoaded, `${route} visual asset failure (${metrics.images} total, hero loaded=${metrics.heroLoaded})`);
      check(metrics.disclosure, `${route} generated-image disclosure missing`);
    }

    check(consoleErrors.length === 0, `browser console errors: ${consoleErrors.join(' | ')}`);
    check(pageErrors.length === 0, `page errors: ${pageErrors.join(' | ')}`);
    const result = {
      schema: 1,
      verifiedAt: new Date().toISOString(),
      baseUrl,
      status: failures.length ? 'FAIL' : 'PASS',
      expectedRootCount,
      root: { ...root, status: rootResponse?.status(), noindexHeader: noindex(rootHeaders) },
      routes: routeResults,
      pages: pageResults,
      consoleErrors,
      pageErrors,
      failures,
    };
    fs.writeFileSync(path.join(outputDir, 'NETLIFY-RELEASE-QA.json'), `${JSON.stringify(result, null, 2)}\n`, 'utf8');
    console.log(JSON.stringify({ status: result.status, indexed: root.siteLinks.length, routeChecks: routeResults.length, pageChecks: pageResults.length, failures }, null, 2));
    if (failures.length) process.exitCode = 1;
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
