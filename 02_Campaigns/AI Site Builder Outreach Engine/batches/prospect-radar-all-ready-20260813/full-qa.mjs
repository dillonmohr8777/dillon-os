import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const scriptRoot = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const valueAfter = flag => args.includes(flag) ? args[args.indexOf(flag) + 1] : '';
const releaseRoot = path.resolve(valueAfter('--release') || 'C:/Users/dillo/Documents/Codex/work/prospect-radar-all-245-20260813');
const outputName = valueAfter('--output') || 'FULL-QA.json';
const captureScreenshots = args.includes('--screenshots');
const updateReady = args.includes('--mark-ready');
const dist = path.join(releaseRoot, 'dist');
const manifestPath = path.join(releaseRoot, 'ALL-BUSINESSES-MANIFEST.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const callable = manifest.records.filter(record => record.state === 'callable');
const aliases = manifest.records.filter(record => record.state === 'alias');
const exclusions = manifest.records.filter(record => record.state === 'excluded');
if (callable.length !== 238 || aliases.length !== 5 || exclusions.length !== 2) {
  throw new Error(`Unexpected route inventory: ${callable.length} callable, ${aliases.length} aliases, ${exclusions.length} exclusions`);
}

const playwrightPath = path.resolve(valueAfter('--playwright') || path.join(scriptRoot, '.release-build', 'next10', 'node_modules', 'playwright', 'index.mjs'));
if (!fs.existsSync(playwrightPath)) {
  throw new Error(`Playwright package entry is missing: ${playwrightPath}. Pass --playwright <path-to-index.mjs>.`);
}
const { chromium } = await import(pathToFileURL(playwrightPath).href);
const host = '127.0.0.1';
const port = 48245;
const baseUrl = `http://${host}:${port}`;
const mime = {
  '.avif': 'image/avif', '.css': 'text/css', '.gif': 'image/gif', '.html': 'text/html', '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg', '.jpg': 'image/jpeg', '.js': 'application/javascript', '.json': 'application/json',
  '.mjs': 'application/javascript', '.mp4': 'video/mp4', '.png': 'image/png', '.svg': 'image/svg+xml',
  '.webm': 'video/webm', '.webp': 'image/webp', '.woff': 'font/woff', '.woff2': 'font/woff2',
};
const aliasMap = new Map(aliases.map(record => [record.slug, record.aliasOf]));
const excludedSet = new Set(exclusions.map(record => record.slug));

const server = http.createServer((request, response) => {
  try {
    const url = new URL(request.url, baseUrl);
    const routeMatch = url.pathname.match(/^\/sites\/([^/]+)(\/.*)?$/);
    if (routeMatch && aliasMap.has(routeMatch[1])) {
      const suffix = routeMatch[2] || '/';
      response.writeHead(301, { Location: `/sites/${aliasMap.get(routeMatch[1])}${suffix}` }).end();
      return;
    }
    if (routeMatch && excludedSet.has(routeMatch[1])) {
      response.writeHead(302, { Location: `/?excluded=${routeMatch[1]}` }).end();
      return;
    }
    const pathname = decodeURIComponent(url.pathname);
    let file = path.resolve(dist, `.${pathname}`);
    if (!file.startsWith(path.resolve(dist))) return response.writeHead(403).end('Forbidden');
    if (pathname.endsWith('/') || (fs.existsSync(file) && fs.statSync(file).isDirectory())) file = path.join(file, 'index.html');
    if (!fs.existsSync(file) && fs.existsSync(`${file}.html`)) file = `${file}.html`;
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) return response.writeHead(404).end('Not found');
    const contentType = mime[path.extname(file).toLowerCase()] || 'application/octet-stream';
    response.setHeader('Content-Type', /^(text\/|application\/(?:javascript|json))/.test(contentType) ? `${contentType}; charset=utf-8` : contentType);
    response.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
    fs.createReadStream(file).pipe(response);
  } catch (error) {
    response.writeHead(500).end(String(error));
  }
});

const viewports = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 850, height: 1000 },
  { name: 'desktop', width: 1440, height: 1000 },
];
const digits = value => String(value || '').replace(/\D/g, '').replace(/^1(?=\d{10}$)/, '');

function reasonsFor(check) {
  const reasons = [];
  if (check.httpStatus !== 200) reasons.push(`HTTP_${check.httpStatus ?? 'NO_RESPONSE'}`);
  if (!check.title) reasons.push('MISSING_TITLE');
  if (!check.metaNoindex) reasons.push('MISSING_NOINDEX');
  if (check.h1Count !== 1) reasons.push(`H1_COUNT_${check.h1Count}`);
  if (check.wordCount < 180) reasons.push(`THIN_COPY_${check.wordCount}`);
  if (!check.hasMain || !check.hasHeader || !check.hasFooter) reasons.push('MISSING_LANDMARK');
  if (check.documentOverflow) reasons.push('DOCUMENT_OVERFLOW');
  if (check.headingOverflow.length) reasons.push(`HEADING_OVERFLOW_${check.headingOverflow.length}`);
  if (check.brokenLocalImages.length) reasons.push(`BROKEN_LOCAL_IMAGES_${check.brokenLocalImages.length}`);
  if (check.imagesMissingAlt) reasons.push(`IMAGES_MISSING_ALT_${check.imagesMissingAlt}`);
  if (check.localErrors.length) reasons.push(`BROKEN_LOCAL_REQUESTS_${check.localErrors.length}`);
  if (check.pageErrors.length) reasons.push(`PAGE_ERRORS_${check.pageErrors.length}`);
  if (check.consoleErrors.length) reasons.push(`CONSOLE_ERRORS_${check.consoleErrors.length}`);
  if (check.emptyLinks) reasons.push(`EMPTY_LINKS_${check.emptyLinks}`);
  if (check.duplicateIds.length) reasons.push(`DUPLICATE_IDS_${check.duplicateIds.length}`);
  if (check.callReadySections !== 1) reasons.push(`CALL_READY_SECTION_COUNT_${check.callReadySections}`);
  if (!check.expectedPhonePresent) reasons.push('PHONE_MISMATCH');
  if (!check.directionLinks) reasons.push('MISSING_DIRECTIONS_LINK');
  if (!check.maps.length) reasons.push('MISSING_MAP');
  if (check.maps.some(map => map.width < 280 || map.height < 260 || !map.title)) reasons.push('INVALID_MAP_EMBED');
  if (check.unnamedControls) reasons.push(`UNNAMED_CONTROLS_${check.unnamedControls}`);
  if (check.smallPrimaryTargets.length) reasons.push(`SMALL_PRIMARY_TARGETS_${check.smallPrimaryTargets.length}`);
  if (!check.reducedMotionRule) reasons.push('MISSING_REDUCED_MOTION_RULE');
  return reasons;
}

async function scan(page, record, viewport) {
  const pageErrors = [];
  const consoleErrors = [];
  const localErrors = [];
  const onPageError = error => pageErrors.push(String(error));
  const onConsole = message => {
    if (message.type() !== 'error') return;
    const value = message.text();
    if (/Failed to load resource: net::ERR_FAILED/i.test(value)) return;
    consoleErrors.push(value);
  };
  const onResponse = response => {
    const url = new URL(response.url());
    if (url.hostname === host && response.status() >= 400) localErrors.push(`${response.status()} ${url.pathname}`);
  };
  page.on('pageerror', onPageError);
  page.on('console', onConsole);
  page.on('response', onResponse);
  let response = null;
  let dom = null;
  try {
    response = await page.goto(`${baseUrl}${record.route}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(100);
    dom = await page.evaluate(expectedPhone => {
      const visible = element => {
        const style = getComputedStyle(element);
        const box = element.getBoundingClientRect();
        return style.display !== 'none' && style.visibility !== 'hidden' && box.width > 0 && box.height > 0;
      };
      const text = document.body?.innerText || '';
      const ids = [...document.querySelectorAll('[id]')].map(node => node.id).filter(Boolean);
      const counts = ids.reduce((map, id) => map.set(id, (map.get(id) || 0) + 1), new Map());
      const local = url => {
        try { return new URL(url, location.href).hostname === location.hostname; } catch { return false; }
      };
      const targets = [...document.querySelectorAll('button,input,select,textarea,[role="button"],a.button,.button,.mobile-action a,.site-header nav a,header nav a')]
        .filter(visible).map(node => {
          const box = node.getBoundingClientRect();
          return { tag: node.tagName, width: Math.round(box.width), height: Math.round(box.height), text: (node.textContent || node.getAttribute('aria-label') || '').trim().slice(0, 60) };
        });
      const telephoneDigits = [...document.querySelectorAll('a[href^="tel:"]')].map(node => node.getAttribute('href').replace(/\D/g, '').replace(/^1(?=\d{10}$)/, ''));
      return {
        finalUrl: location.href,
        title: document.title.trim(),
        metaNoindex: [...document.querySelectorAll('meta[name="robots"]')].some(node => /noindex/i.test(node.content)),
        h1Count: document.querySelectorAll('h1').length,
        wordCount: (text.match(/[A-Za-z0-9][A-Za-z0-9'’&.-]*/g) || []).length,
        hasMain: !!document.querySelector('main'),
        hasHeader: !!document.querySelector('header'),
        hasFooter: !!document.querySelector('footer'),
        documentOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
        headingOverflow: [...document.querySelectorAll('h1,h2,h3')].filter(node => visible(node) && node.scrollWidth > node.clientWidth + 12).map(node => ({ tag: node.tagName, text: node.textContent.trim().slice(0, 80), width: node.clientWidth, scrollWidth: node.scrollWidth })),
        brokenLocalImages: [...document.images].filter(image => local(image.currentSrc || image.src) && image.complete && image.naturalWidth === 0).map(image => image.getAttribute('src') || ''),
        imagesMissingAlt: [...document.images].filter(image => !image.hasAttribute('alt')).length,
        emptyLinks: [...document.querySelectorAll('a')].filter(link => visible(link) && !link.textContent.trim() && !link.getAttribute('aria-label') && !link.querySelector('img[alt]:not([alt=""])')).length,
        duplicateIds: [...counts.entries()].filter(([, count]) => count > 1).map(([id, count]) => ({ id, count })),
        callReadySections: document.querySelectorAll('.m360-call-ready').length,
        expectedPhonePresent: telephoneDigits.includes(expectedPhone),
        telephoneDigits,
        directionLinks: document.querySelectorAll('a[href*="google.com/maps/search"],a[href*="google.com/maps/dir"],a[href*="maps.google.com"]').length,
        maps: [...document.querySelectorAll('.m360-call-ready iframe')].filter(visible).map(frame => { const box = frame.getBoundingClientRect(); return { width: Math.round(box.width), height: Math.round(box.height), title: frame.title || '' }; }),
        unnamedControls: [...document.querySelectorAll('button,input,select,textarea')].filter(node => visible(node) && !(node.textContent || '').trim() && !node.getAttribute('aria-label') && !node.getAttribute('aria-labelledby') && !node.getAttribute('title') && !node.getAttribute('placeholder')).length,
        smallPrimaryTargets: targets.filter(target => target.width < 44 || target.height < 44).slice(0, 12),
        reducedMotionRule: [...document.styleSheets].some(sheet => { try { return [...sheet.cssRules].some(rule => String(rule.cssText).includes('prefers-reduced-motion')); } catch { return false; } }),
      };
    }, digits(record.phone));
  } catch (error) {
    pageErrors.push(String(error));
  } finally {
    page.off('pageerror', onPageError);
    page.off('console', onConsole);
    page.off('response', onResponse);
  }
  const check = {
    slug: record.slug, business: record.business, route: record.route, viewport: viewport.name,
    httpStatus: response?.status() ?? null,
    ...(dom || { finalUrl: '', title: '', metaNoindex: false, h1Count: 0, wordCount: 0, hasMain: false, hasHeader: false, hasFooter: false, documentOverflow: false, headingOverflow: [], brokenLocalImages: [], imagesMissingAlt: 0, emptyLinks: 0, duplicateIds: [], callReadySections: 0, expectedPhonePresent: false, telephoneDigits: [], directionLinks: 0, maps: [], unnamedControls: 0, smallPrimaryTargets: [], reducedMotionRule: false }),
    localErrors: [...new Set(localErrors)], pageErrors: [...new Set(pageErrors)], consoleErrors: [...new Set(consoleErrors)],
  };
  check.reasons = reasonsFor(check);
  check.pass = check.reasons.length === 0;
  return check;
}

await new Promise(resolve => server.listen(port, host, resolve));
const browser = await chromium.launch({ headless: true });
const checks = [];
const hubChecks = [];
const sampleIndexes = new Set([0, 19, 39, 59, 79, 99, 119, 139, 159, 179, 199, 237]);
const screenshotRoot = path.join(releaseRoot, 'QA-SCREENSHOTS');
if (captureScreenshots) {
  if (!path.resolve(screenshotRoot).startsWith(path.resolve(releaseRoot))) throw new Error(`Unsafe screenshot target: ${screenshotRoot}`);
  fs.rmSync(screenshotRoot, { recursive: true, force: true });
  fs.mkdirSync(screenshotRoot, { recursive: true });
}
try {
  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport });
    await page.route('**/*', route => {
      const url = new URL(route.request().url());
      if (url.hostname === host) return route.continue();
      return route.abort();
    });
    const hubResponse = await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
    hubChecks.push(await page.evaluate(({ name, expected }) => ({
      viewport: name,
      status: document.title ? 200 : 0,
      title: document.title,
      h1Count: document.querySelectorAll('h1').length,
      cards: document.querySelectorAll('.build').length,
      noindex: /noindex/i.test(document.querySelector('meta[name="robots"]')?.content || ''),
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      expected,
    }), { name: viewport.name, expected: callable.length }));
    hubChecks.at(-1).httpStatus = hubResponse?.status() || 0;
    hubChecks.at(-1).pass = hubChecks.at(-1).httpStatus === 200 && hubChecks.at(-1).h1Count === 1 && hubChecks.at(-1).cards === callable.length && hubChecks.at(-1).noindex && !hubChecks.at(-1).overflow;
    if (captureScreenshots && viewport.name !== 'tablet') await page.screenshot({ path: path.join(screenshotRoot, `hub-${viewport.name}.png`), fullPage: true });
    for (const [index, record] of callable.entries()) {
      const check = await scan(page, record, viewport);
      checks.push(check);
      if (captureScreenshots && sampleIndexes.has(index) && viewport.name !== 'tablet') {
        await page.screenshot({ path: path.join(screenshotRoot, `${String(index + 1).padStart(3, '0')}-${record.slug}-${viewport.name}.png`), fullPage: true });
      }
      if ((index + 1) % 25 === 0 || index + 1 === callable.length) process.stdout.write(`${viewport.name}: ${index + 1}/${callable.length}\n`);
    }
    await page.close();
  }
} finally {
  await browser.close();
}

const redirectChecks = [];
for (const record of [...aliases, ...exclusions]) {
  const response = await fetch(`${baseUrl}${record.route}`, { redirect: 'manual' });
  const expectedStatus = record.state === 'alias' ? 301 : 302;
  const expectedLocation = record.state === 'alias' ? `/sites/${record.aliasOf}/` : `/?excluded=${record.slug}`;
  redirectChecks.push({ slug: record.slug, state: record.state, status: response.status, location: response.headers.get('location') || '', expectedStatus, expectedLocation, pass: response.status === expectedStatus && response.headers.get('location') === expectedLocation });
}
server.close();

const perRoute = callable.map(record => {
  const routeChecks = checks.filter(check => check.slug === record.slug);
  const reasons = [...new Set(routeChecks.flatMap(check => check.reasons))].sort();
  return { slug: record.slug, business: record.business, currentBatch: record.currentBatch, pass: reasons.length === 0, reasons, checks: routeChecks };
});
const reasonCounts = new Map();
for (const route of perRoute) for (const reason of route.reasons) reasonCounts.set(reason, (reasonCounts.get(reason) || 0) + 1);
const report = {
  schemaVersion: 2,
  auditedAt: new Date().toISOString(),
  viewports,
  summary: {
    callableRoutes: perRoute.length,
    routePasses: perRoute.filter(route => route.pass).length,
    routeFailures: perRoute.filter(route => !route.pass).length,
    renders: checks.length,
    renderPasses: checks.filter(check => check.pass).length,
    renderFailures: checks.filter(check => !check.pass).length,
    hubPasses: hubChecks.filter(check => check.pass).length,
    redirectPasses: redirectChecks.filter(check => check.pass).length,
    routeInventory: manifest.summary,
    reasonCounts: [...reasonCounts.entries()].sort((a, b) => b[1] - a[1]).map(([reason, count]) => ({ reason, count })),
  },
  hubChecks,
  redirectChecks,
  routes: perRoute,
};
report.ok = report.summary.routeFailures === 0 && hubChecks.every(check => check.pass) && redirectChecks.every(check => check.pass);
fs.writeFileSync(path.join(releaseRoot, outputName), `${JSON.stringify(report, null, 2)}\n`, 'utf8');

if (report.ok && updateReady) {
  manifest.qaStatus = 'passed';
  manifest.callReady = true;
  manifest.qaVerifiedAt = report.auditedAt;
  for (const record of manifest.records) {
    if (record.state === 'callable') record.qaStatus = 'Passed: desktop, tablet, and mobile';
  }
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  const csvPath = path.join(releaseRoot, 'JESSE-CALL-SHEET.csv');
  fs.writeFileSync(csvPath, fs.readFileSync(csvPath, 'utf8').replaceAll('Pending final QA', 'Passed: desktop + tablet + mobile'), 'utf8');
  const hubPath = path.join(dist, 'index.html');
  fs.writeFileSync(hubPath, fs.readFileSync(hubPath, 'utf8').replaceAll('Call ready · desktop, tablet, mobile QA pending', 'Call ready · desktop, tablet, mobile QA passed'), 'utf8');
}

console.log(JSON.stringify({ ok: report.ok, output: path.join(releaseRoot, outputName), ...report.summary }, null, 2));
process.exitCode = report.ok ? 0 : 1;
