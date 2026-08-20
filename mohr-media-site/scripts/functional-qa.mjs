import { AxeBuilder } from '@axe-core/playwright';
import { chromium } from 'playwright';

const baseUrl = process.env.QA_URL ?? 'http://127.0.0.1:4173';
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await context.newPage();
const consoleErrors = [];
const pageErrors = [];
const failedRequests = [];

page.on('console', (message) => {
  if (message.type() === 'error') consoleErrors.push(message.text());
});
page.on('pageerror', (error) => pageErrors.push(error.message));
page.on('requestfailed', (request) => {
  const abortedMediaSwap = request.resourceType() === 'media' && request.failure()?.errorText === 'net::ERR_ABORTED';
  if (!abortedMediaSwap) failedRequests.push(`${request.method()} ${request.url()}: ${request.failure()?.errorText}`);
});

await page.goto(baseUrl, { waitUntil: 'networkidle' });
await page.waitForTimeout(1700);

const menuButton = page.locator('.nav-toggle');
await menuButton.click();
const menuOpened = await menuButton.getAttribute('aria-expanded');
await page.keyboard.press('Escape');
const menuClosed = await menuButton.getAttribute('aria-expanded');

const firstVideoSource = await page.locator('video source').getAttribute('src');
await page.locator('#video-tab-0').focus();
await page.keyboard.press('ArrowRight');
const secondTabSelected = await page.locator('#video-tab-1').getAttribute('aria-selected');
const secondVideoSource = await page.locator('video source').getAttribute('src');

const imageResults = await page.evaluate(async () => {
  const sources = [...new Set([...document.images].map((image) => image.currentSrc || image.src))];
  return Promise.all(sources.map(async (source) => {
    const image = new Image();
    image.src = source;
    try {
      await image.decode();
      return { source, ok: image.naturalWidth > 0, width: image.naturalWidth, height: image.naturalHeight };
    } catch (error) {
      return { source, ok: false, error: String(error) };
    }
  }));
});

const localResources = await page.evaluate(() => [...new Set([
  ...[...document.querySelectorAll('a[href^="/"]')].map((node) => node.href),
  ...[...document.querySelectorAll('source[src^="/"]')].map((node) => node.src),
])]);
const resourceResults = [];
for (const url of localResources) {
  const response = await page.request.head(url);
  resourceResults.push({ url, status: response.status(), ok: response.ok() });
}

const targetBlankProblems = await page.evaluate(() => [...document.querySelectorAll('a[target="_blank"]')]
  .filter((link) => !link.relList.contains('noreferrer'))
  .map((link) => link.href));

const layout = await page.evaluate(() => ({
  clientWidth: document.documentElement.clientWidth,
  scrollWidth: document.documentElement.scrollWidth,
  landmarks: {
    main: document.querySelectorAll('main').length,
    navigation: document.querySelectorAll('nav').length,
    headings: document.querySelectorAll('h1').length,
  },
}));

const axe = await new AxeBuilder({ page }).analyze();

const reducedContext = await browser.newContext({
  viewport: { width: 390, height: 844 },
  reducedMotion: 'reduce',
});
const reducedPage = await reducedContext.newPage();
await reducedPage.goto(baseUrl, { waitUntil: 'networkidle' });
await reducedPage.waitForTimeout(400);
const reducedMotion = await reducedPage.evaluate(() => ({
  canvases: document.querySelectorAll('canvas').length,
  staticLogo: Boolean(document.querySelector('.particle-logo--static img')),
}));

const report = {
  menuOpened,
  menuClosed,
  videoKeyboard: {
    firstVideoSource,
    secondTabSelected,
    secondVideoSource,
    changed: firstVideoSource !== secondVideoSource,
  },
  layout,
  reducedMotion,
  imageFailures: imageResults.filter((item) => !item.ok),
  resourceFailures: resourceResults.filter((item) => !item.ok),
  targetBlankProblems,
  consoleErrors,
  pageErrors,
  failedRequests,
  axeViolations: axe.violations.map((violation) => ({
    id: violation.id,
    impact: violation.impact,
    help: violation.help,
    nodes: violation.nodes.length,
    targets: violation.nodes.flatMap((node) => node.target),
    details: violation.nodes.map((node) => ({
      html: node.html,
      summary: node.failureSummary,
    })),
  })),
};

console.log(JSON.stringify(report, null, 2));

await reducedContext.close();
await context.close();
await browser.close();

const failed = menuOpened !== 'true'
  || menuClosed !== 'false'
  || secondTabSelected !== 'true'
  || firstVideoSource === secondVideoSource
  || layout.scrollWidth > layout.clientWidth
  || !reducedMotion.staticLogo
  || report.imageFailures.length > 0
  || report.resourceFailures.length > 0
  || targetBlankProblems.length > 0
  || consoleErrors.length > 0
  || pageErrors.length > 0
  || failedRequests.length > 0
  || report.axeViolations.length > 0;

if (failed) process.exitCode = 1;
