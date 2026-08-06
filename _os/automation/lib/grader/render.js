'use strict';

/**
 * Pass 2. A real browser, only for the sites where the static pass could not
 * decide. Playwright is optional: if it is not installed, the pass reports
 * unavailable and the orchestrator keeps the static verdict with its confidence
 * intact rather than pretending.
 */

const fs = require('fs');
const path = require('path');
const { repoPath, ensureDir } = require('../fsutil');
const { UA } = require('./http');

const SHOT_ROOT = repoPath('_os/automation/state/grader-shots');

function playwrightAvailable() {
  try {
    require.resolve('playwright');
    return true;
  } catch {
    return false;
  }
}

/**
 * The installed playwright package pins a browser build number, but a managed
 * environment often ships a different one under PLAYWRIGHT_BROWSERS_PATH. Rather
 * than download a second copy, use whichever chromium is actually on disk.
 * Returns null to let playwright resolve its own default.
 */
function findChromium() {
  const root = process.env.PLAYWRIGHT_BROWSERS_PATH;
  if (!root || !fs.existsSync(root)) return null;
  const candidates = fs
    .readdirSync(root)
    .filter((d) => /^chromium(-\d+)?$/.test(d))
    .sort()
    .reverse()
    .flatMap((d) => [
      path.join(root, d, 'chrome-linux', 'chrome'),
      path.join(root, d, 'chrome-linux64', 'chrome'),
      path.join(root, d),
    ]);
  return candidates.find((p) => {
    try {
      return fs.statSync(p).isFile();
    } catch {
      return false;
    }
  }) || null;
}

/**
 * @returns {Promise<{available:boolean, reason?:string, ...metrics}>}
 */
async function renderGrade(url, { slug = 'site', shots = true, timeoutMs = 30000 } = {}) {
  if (!playwrightAvailable()) {
    return { available: false, reason: 'playwright not installed — run: npm i --no-save playwright && npx playwright install chromium' };
  }
  // eslint-disable-next-line global-require
  const { chromium } = require('playwright');

  const executablePath = findChromium();
  // Honour an egress proxy the same way the rest of the toolchain does. Node's
  // fetch reads these vars automatically; chromium has to be told.
  const proxyUrl = process.env.HTTPS_PROXY || process.env.https_proxy || process.env.HTTP_PROXY || process.env.http_proxy || null;
  const noProxy = process.env.NO_PROXY || process.env.no_proxy || null;

  const launchOpts = {};
  if (executablePath) launchOpts.executablePath = executablePath;
  if (proxyUrl) {
    launchOpts.proxy = { server: proxyUrl };
    if (noProxy) launchOpts.proxy.bypass = noProxy;
  }

  let browser;
  try {
    browser = await chromium.launch(launchOpts);
  } catch (err) {
    return { available: false, reason: `chromium failed to launch: ${err.message.split('\n')[0]}` };
  }
  try {
    const context = await browser.newContext({
      userAgent: UA,
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();

    const started = Date.now();
    let mainStatus = null;
    page.on('response', (res) => {
      if (res.url() === url || res.url() === `${url}/`) mainStatus = res.status();
    });

    let navError = null;
    try {
      await page.goto(url, { waitUntil: 'load', timeout: timeoutMs });
      await page.waitForTimeout(1200); // let lazy hero art and fonts settle
    } catch (err) {
      navError = err.message;
    }
    const loadMs = Date.now() - started;

    const metrics = await page.evaluate(() => {
      const paint = performance.getEntriesByType('paint');
      const nav = performance.getEntriesByType('navigation')[0] || {};
      const styleText = [...document.styleSheets]
        .map((sheet) => {
          try {
            return [...sheet.cssRules].map((r) => r.cssText).join('\n');
          } catch {
            return ''; // cross-origin sheet
          }
        })
        .join('\n');
      const bodyText = (document.body?.innerText || '').replace(/\s+/g, ' ').trim();
      const imgs = [...document.images];
      return {
        fcpMs: Math.round(paint.find((p) => p.name === 'first-contentful-paint')?.startTime || 0) || null,
        domContentLoadedMs: Math.round(nav.domContentLoadedEventEnd || 0) || null,
        words: bodyText ? bodyText.split(/\s+/).length : 0,
        textLength: bodyText.length,
        title: document.title || null,
        h1Count: document.querySelectorAll('h1').length,
        imgCount: imgs.length,
        imgNoAlt: imgs.filter((i) => !i.getAttribute('alt')).length,
        webfonts: (document.fonts ? [...document.fonts].length : 0) > 0 || /@font-face/i.test(styleText),
        usesModernCss: {
          customProps: /--[a-z0-9-]+\s*:/i.test(styleText) || Boolean(getComputedStyle(document.documentElement).getPropertyValue('--x') !== undefined && styleText.includes('--')),
          grid: /display\s*:\s*grid/i.test(styleText),
          flex: /display\s*:\s*flex/i.test(styleText),
          clamp: /clamp\(/i.test(styleText),
        },
        cssRuleCount: styleText.split('}').length,
      };
    }).catch(() => ({}));

    // Mobile behaviour is where dated sites actually fail.
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(400);
    const mobile = await page.evaluate(() => ({
      overflowPx: Math.max(0, document.documentElement.scrollWidth - window.innerWidth),
      smallestTapTarget: Math.min(
        ...[...document.querySelectorAll('a,button')].slice(0, 120).map((el) => {
          const r = el.getBoundingClientRect();
          return r.width && r.height ? Math.min(r.width, r.height) : 999;
        }),
        999
      ),
      baseFontPx: parseFloat(getComputedStyle(document.body).fontSize) || null,
    })).catch(() => ({}));

    let shotPaths = null;
    if (shots) {
      const dir = path.join(SHOT_ROOT, slug);
      ensureDir(dir);
      try {
        await page.screenshot({ path: path.join(dir, 'phone.png'), fullPage: false });
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.waitForTimeout(300);
        await page.screenshot({ path: path.join(dir, 'desktop.png'), fullPage: false });
        shotPaths = {
          phone: path.relative(repoPath('.'), path.join(dir, 'phone.png')),
          desktop: path.relative(repoPath('.'), path.join(dir, 'desktop.png')),
        };
      } catch {
        shotPaths = null;
      }
    }

    return {
      available: true,
      navError,
      status: mainStatus,
      loadMs,
      ...metrics,
      mobile,
      hasViewportBehavior: mobile.overflowPx != null ? mobile.overflowPx <= 4 : null,
      screenshots: shotPaths,
    };
  } finally {
    await browser.close();
  }
}

module.exports = { renderGrade, playwrightAvailable, SHOT_ROOT };
