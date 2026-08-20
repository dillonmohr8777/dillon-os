import { chromium } from 'playwright';

const baseUrl = process.env.QA_URL ?? 'http://127.0.0.1:4173';
const outputDir = process.env.QA_OUTPUT;
const suffix = process.env.QA_SUFFIX ?? 'final';

if (!outputDir) {
  throw new Error('QA_OUTPUT is required');
}

const browser = await chromium.launch({ headless: true });
const results = [];

async function inspect(name, viewport, options = {}) {
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: 1,
    reducedMotion: options.reducedMotion ?? 'no-preference',
    colorScheme: 'dark',
  });
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];

  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1800);

  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  const step = Math.max(360, Math.floor(viewport.height * 0.72));
  for (let y = 0; y < height; y += step) {
    await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y);
    await page.waitForTimeout(options.reducedMotion === 'reduce' ? 70 : 160);
  }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.waitForTimeout(250);

  if (options.openMenu) {
    await page.locator('.menu-button').click();
    await page.waitForTimeout(350);
  }

  const metrics = await page.evaluate(() => ({
    title: document.title,
    width: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    height: document.documentElement.scrollHeight,
    canvases: document.querySelectorAll('canvas').length,
    videos: document.querySelectorAll('video').length,
    links: document.querySelectorAll('a[href]').length,
    missingImages: [...document.images]
      .filter((image) => !image.complete || image.naturalWidth === 0)
      .map((image) => image.currentSrc || image.src),
    activeReveals: document.querySelectorAll('[data-reveal].is-visible').length,
    totalReveals: document.querySelectorAll('[data-reveal]').length,
  }));

  await page.screenshot({
    path: `${outputDir}/${name}.png`,
    fullPage: !options.openMenu,
    animations: 'disabled',
  });

  results.push({ name, viewport, metrics, consoleErrors, pageErrors });
  await context.close();
}

await inspect(`portfolio-desktop-${suffix}`, { width: 1440, height: 1000 });
await inspect(`portfolio-mobile-${suffix}`, { width: 390, height: 844 });
await inspect(`portfolio-menu-mobile-${suffix}`, { width: 390, height: 844 }, { openMenu: true });
await inspect(
  `portfolio-reduced-motion-${suffix}`,
  { width: 1440, height: 1000 },
  { reducedMotion: 'reduce' },
);

await browser.close();
console.log(JSON.stringify(results, null, 2));
