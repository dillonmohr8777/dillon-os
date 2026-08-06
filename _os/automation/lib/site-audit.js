'use strict';

/**
 * Tiered evidence collection for the Site Quality Score (./site-grader.js).
 *
 * The whole point of tiering is cost. A PA market pull is 300+ candidates; we
 * only want to spend a browser render on the ones still in contention after a
 * cheap pass, and only want a human's eyes on the ones still in contention
 * after that.
 *
 *   Tier 0  auditTier0()      fetch + raw HTML regex. No dependencies, ~1 req
 *                             per candidate. Catches dead domains, no-HTTPS,
 *                             missing viewport, framesets, table layouts,
 *                             parked pages, thin copy, stale copyright, missing
 *                             schema. Enough to disqualify most of a list.
 *   Tier 1  auditTier1()      Playwright render: real computed palette/fonts,
 *                             overflow at 3 viewports, payload weight, request
 *                             count, oversized images, tap targets.
 *   Tier 1b auditFromHarvest() free Tier-1-grade evidence reused from an
 *                             existing _templates/site-factory/harvest.json,
 *                             so a graded prospect never gets harvested twice.
 *   Tier 2  applyTaste()      folds an agent/human 1–5 taste verdict in.
 *
 * Field names are shared across tiers on purpose; site-grader.mergeAudits()
 * layers them.
 */

const { URL } = require('url');
const { httpGet, assertPublicHttpUrl, classifyFetchError } = require('./net');

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) ' +
  'Chrome/124.0 Safari/537.36 MomentumSiteGrader/1.0 (+prospect site audit)';

const DEFAULT_TIMEOUT_MS = 15000;
const MAX_HTML_BYTES = 3_000_000;

/**
 * Proxy-aware page fetch. Delegates to lib/net.js so HTTPS_PROXY is honoured —
 * without it every fetch fails behind a proxy and the grader would score real
 * businesses as "dead domain". See the note at the top of lib/net.js.
 */
async function fetchPage(rawUrl, { timeoutMs = DEFAULT_TIMEOUT_MS, maxRedirects = 5 } = {}) {
  const res = await httpGet(rawUrl, {
    timeoutMs,
    maxRedirects,
    maxBytes: MAX_HTML_BYTES,
    userAgent: UA,
  });
  // Normalize to this module's historical field name.
  if (res.ok) return { ...res, html: res.body };
  return res;
}

/* ------------------------------------------------------------------ *
 * Tier 0: everything derivable from raw HTML + headers.
 * Exported separately so it is unit-testable without a network.
 * ------------------------------------------------------------------ */

const PARKED_PATTERNS = [
  /this domain (is|may be) for sale/i,
  /buy this domain/i,
  /domain (is )?parked/i,
  /future home of something quite cool/i,
  /default web site page/i,
  /website coming soon/i,
  /account (has been )?suspended/i,
  /if you are the owner of this website/i,
  /godaddy\.com\/domains\/searchresults/i,
];

const CONSTRUCTION_PATTERNS = [
  /under construction/i,
  /site (is )?coming soon/i,
  /check back (soon|later)/i,
  /lorem ipsum/i,
  /insert (your )?(text|content) here/i,
  /\byour (company|business) name here\b/i,
];

function detectPlatform(html, headers = {}) {
  const gen = (html.match(/<meta[^>]+name=["']generator["'][^>]+content=["']([^"']+)/i) || [])[1] || '';
  const hay = `${gen} ${html.slice(0, 200000)} ${JSON.stringify(headers)}`.toLowerCase();
  const table = [
    ['wix', /wix\.com|_wixcssimports|wixstatic/],
    ['squarespace', /squarespace|static1\.squarespace/],
    ['shopify', /cdn\.shopify|shopify\.com/],
    ['webflow', /webflow\.(com|io)|wf-/],
    ['wordpress', /wp-content|wp-includes|wordpress/],
    ['duda', /dudaone|duda\.co|multiscreensite/],
    ['weebly', /weebly|editmysite/],
    ['godaddy', /godaddy|websitebuilder|starfieldtech/],
    ['bizland', /bizland/],
    ['homestead', /homestead\.com/],
    ['networksolutions', /networksolutions|netsol/],
  ];
  for (const [name, re] of table) if (re.test(hay)) return name;
  return gen ? gen.slice(0, 40) : '';
}

/** Strip markup and return visible-ish text. */
function visibleText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Turn a fetch result into Tier 0 audit fields.
 * @param {object} res  fetchPage() result
 * @param {string} requestedUrl
 */
function analyzeTier0(res, requestedUrl) {
  const audit = { tier: 0, url: requestedUrl };

  if (!res.ok) {
    const kind = classifyFetchError(res.error);
    audit.error = res.error || 'fetch failed';
    audit.errorKind = kind;
    audit.responseMs = res.responseMs ?? null;
    if (res.status) audit.httpStatus = res.status;

    if (kind === 'dead') {
      audit.reachable = false;
    } else if (kind === 'broken_tls') {
      // The host exists and answered; TLS is what fails. Grade it as a real
      // foundation fault rather than a missing domain.
      audit.reachable = true;
      audit.brokenTls = true;
      audit.https = false;
    } else {
      // Inconclusive: leave `reachable` unset so the grader returns a null score
      // and the runner routes this to a retry instead of asserting the site is
      // down. Our proxy timing out is not their website being broken.
      audit.fetchInconclusive = true;
    }
    return audit;
  }

  const html = res.html || '';
  const text = visibleText(html);
  const finalUrl = res.finalUrl || requestedUrl;

  audit.reachable = true;
  audit.finalUrl = finalUrl;
  audit.httpStatus = res.status;
  audit.https = /^https:/i.test(finalUrl);
  audit.responseMs = res.responseMs ?? null;
  audit.transferBytes = res.bytes ?? null;
  audit.redirects = (res.hops || []).length - 1;
  audit.platform = detectPlatform(html, res.headers);

  // Foundation
  audit.frameset = /<frameset[\s>]/i.test(html);
  audit.flash = /\.swf\b|application\/x-shockwave-flash/i.test(html);
  audit.parked = PARKED_PATTERNS.some((re) => re.test(text.slice(0, 4000)));
  // Only real subresource loads count. `"@context": "http://schema.org"` and
  // rel=canonical/alternate/profile links are not mixed content, and matching
  // them flagged essentially every site on the first calibration run.
  audit.mixedContent =
    audit.https &&
    (html.match(/<(?:img|script|iframe|source|video|audio|embed|link)\b[^>]*>/gi) || []).some((tag) => {
      const m = tag.match(/\b(?:src|srcset|href)\s*=\s*["'](http:\/\/[^"']+)/i);
      if (!m) return false;
      if (/<link\b/i.test(tag) && !/rel\s*=\s*["'](?:stylesheet|preload|icon|apple-touch-icon)/i.test(tag)) {
        return false;
      }
      return !/^http:\/\/(?:schema\.org|www\.w3\.org|purl\.org|ogp\.me|gmpg\.org|xmlns\.com)/i.test(m[1]);
    });

  // Mobile
  audit.hasViewport = /<meta[^>]+name=["']viewport["']/i.test(html);
  const tableCount = (html.match(/<table[\s>]/gi) || []).length;
  const layoutTable = /<table[^>]*(?:width=["']?(?:\d{3,}|100%)|role=["']presentation)/i.test(html);
  audit.tableLayout = tableCount > 0 && (layoutTable || tableCount >= 4) && !/<thead|<th[\s>]/i.test(html);
  audit.usesMediaQueries = /@media[^{]*\((?:max|min)-width/i.test(html) || null;
  audit.usesModernLayout = /display\s*:\s*(?:flex|grid)|(?:\bgrid-template|\bflex-direction)/i.test(html) || null;
  audit.usesCustomProperties = /--[a-z0-9-]+\s*:/i.test(html) || null;
  const fixedWidth = (html.match(/(?:max-)?width\s*:\s*(\d{3,4})px/gi) || [])
    .map((m) => parseInt((m.match(/(\d{3,4})/) || [])[1], 10))
    .filter((n) => Number.isFinite(n));
  audit.fixedWidthPx = fixedWidth.length ? Math.max(...fixedWidth) : null;
  // A max-width container is good practice; a fixed body width is not.
  if (/max-width\s*:\s*\d{3,4}px/i.test(html) && !/(?:body|#wrapper|\.wrapper)[^{]*\{[^}]*\bwidth\s*:\s*\d{3,4}px/i.test(html)) {
    audit.fixedWidthPx = null;
  }
  const inlineStyles = (html.match(/\sstyle=["']/gi) || []).length;
  audit.inlineStyleHeavy = inlineStyles > 40;

  // --- Client-side rendering detection -----------------------------------
  // Tier 0 reads source HTML, so a 2005 server-rendered page exposes all its
  // text while a modern React/Squarespace/Wix site exposes almost none. Judging
  // content from source therefore penalises exactly the sites that are newest —
  // the opposite of what this grader is for. When we detect client-side
  // rendering we keep POSITIVE findings (if the phone is in the source, it is
  // really there) and suppress NEGATIVE ones (absence proves nothing until we
  // render). `renderPending` also forces escalation to Tier 1.
  const scriptBytes = (html.match(/<script[\s\S]*?<\/script>/gi) || []).join('').length;
  const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
  const spaRoot = /<div[^>]+id=["'](?:root|__next|app|__nuxt)["']|data-reactroot|ng-app=|<div[^>]+data-server-rendered/i.test(html);
  const jsBuilder = /^(wix|squarespace|webflow|duda|shopify)$/i.test(audit.platform || '');
  audit.renderPending =
    spaRoot ||
    (words < 260 && scriptBytes > 60000) ||
    (jsBuilder && words < 400) ||
    (words < 120 && html.length > 40000);
  audit.scriptBytes = scriptBytes;

  // Content & conversion
  audit.wordCount = words;
  audit.clickToCall = /href=["']tel:/i.test(html);
  audit.phoneVisible = audit.clickToCall || /\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}/.test(text);
  audit.hasCta =
    /<(?:a|button)[^>]*>(?:\s|<[^>]+>)*(?:book|schedule|call|contact|get a (?:free )?(?:quote|estimate)|request|order|shop|reserve|apply|start)/i.test(
      html
    );
  audit.hoursVisible = /(mon|tue|wed|thu|fri|sat|sun)[a-z]*[^.\n]{0,40}(?:am|pm|a\.m|p\.m|closed)/i.test(text);
  audit.hasContactPath =
    /<form[\s>]/i.test(html) ||
    /href=["'][^"']*contact/i.test(html) ||
    /href=["']mailto:/i.test(html) ||
    /\b\d{1,6}\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:St|Street|Ave|Avenue|Rd|Road|Blvd|Dr|Drive|Ln|Lane|Way|Pike|Hwy)\b/.test(text);
  audit.hasBookingFlow =
    /calendly|acuity|squareup\.com\/appointments|opentable|resy|housecallpro|servicetitan|jobber|schedulicity|mindbody|toasttab|clover|book(?:ing)?now/i.test(
      html
    );
  audit.underConstruction = CONSTRUCTION_PATTERNS.some((re) => re.test(text.slice(0, 6000)));

  // Discoverability
  const title = (html.match(/<title[^>]*>([\s\S]{0,300}?)<\/title>/i) || [])[1] || '';
  audit.hasTitle = title.trim().length > 3;
  audit.hasMetaDescription = /<meta[^>]+name=["']description["'][^>]+content=["'][^"']{20,}/i.test(html);
  const ldBlocks = html.match(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi) || [];
  audit.schemaCount = ldBlocks.length;
  audit.hasLocalBusinessSchema = /"@type"\s*:\s*"(?:LocalBusiness|Restaurant|Dentist|HomeAndConstructionBusiness|Plumber|HVACBusiness|Electrician|MedicalBusiness|ProfessionalService|Store|HealthAndBeautyBusiness|Attorney|LegalService)"/i.test(
    html
  );
  audit.hasOgTags = /<meta[^>]+property=["']og:(?:title|image|description)["']/i.test(html);
  const imgs = html.match(/<img\b[^>]*>/gi) || [];
  const withAlt = imgs.filter((t) => /\salt=["'][^"']+["']/i.test(t)).length;
  audit.altTextRatio = imgs.length ? Math.round((withAlt / imgs.length) * 100) / 100 : null;
  audit.imageCount = imgs.length;
  audit.hasHeroImage =
    imgs.length > 0 &&
    (/<meta[^>]+property=["']og:image["']/i.test(html) || /background-image\s*:\s*url/i.test(html) || imgs.length >= 3);
  audit.usesModernImageFormats = /\.(?:webp|avif)\b/i.test(html);
  audit.usesLazyLoading = /loading=["']lazy["']/i.test(html);
  const yr = (text.match(/(?:©|&copy;|copyright)\s*(?:\d{4}\s*[-–]\s*)?(\d{4})/i) || [])[1];
  audit.copyrightYear = yr ? parseInt(yr, 10) : null;
  audit.noindex = /<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(html);

  return audit;
}

/**
 * Tier 0 audit: one HTTP GET, no browser.
 * @param {string} url
 * @param {object} [opts]
 */
async function auditTier0(url, opts = {}) {
  const res = await fetchPage(url, opts);
  const audit = analyzeTier0(res, url);

  // Cheap extra: does bare http:// redirect to https://?
  if (audit.reachable && audit.https && opts.checkHttpRedirect !== false) {
    try {
      const httpUrl = new URL(url);
      httpUrl.protocol = 'http:';
      const r = await fetchPage(httpUrl.href, { ...opts, maxRedirects: 3 });
      audit.httpsRedirect = r.ok ? /^https:/i.test(r.finalUrl || '') : null;
    } catch {
      audit.httpsRedirect = null;
    }
  }
  return audit;
}

/* ------------------------------------------------------------------ *
 * Tier 1: rendered evidence via Playwright.
 * ------------------------------------------------------------------ */

const VIEWPORTS = [
  ['phone', 390, 844],
  ['tablet', 850, 1180],
  ['desktop', 1440, 900],
];

/**
 * Find a usable Chromium even when the installed Playwright expects a different
 * build number than the one on disk. Environments that pre-bake browsers (CI,
 * sandboxes, PLAYWRIGHT_BROWSERS_PATH images) routinely drift a build or two
 * from whatever `npm i playwright` resolves to, and the default error
 * ("Executable doesn't exist") reads like a missing dependency rather than a
 * version skew.
 */
function resolveChromiumPath(chromium) {
  const fs = require('fs');
  const path = require('path');
  const candidates = [];
  try {
    const p = chromium.executablePath();
    if (p) candidates.push(p);
  } catch {
    /* not resolvable without a download */
  }
  if (process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE) candidates.push(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE);

  const root = process.env.PLAYWRIGHT_BROWSERS_PATH;
  if (root && fs.existsSync(root)) {
    let dirs = [];
    try {
      dirs = fs
        .readdirSync(root)
        .filter((d) => /^chromium(_headless_shell)?(-\d+)?$/.test(d))
        // Prefer full chromium over headless_shell, and newer builds first.
        .sort((a, b) => {
          const shellA = a.includes('headless_shell') ? 1 : 0;
          const shellB = b.includes('headless_shell') ? 1 : 0;
          if (shellA !== shellB) return shellA - shellB;
          return (parseInt((b.match(/-(\d+)$/) || [])[1] || '0', 10) -
                  parseInt((a.match(/-(\d+)$/) || [])[1] || '0', 10));
        });
    } catch {
      dirs = [];
    }
    for (const d of dirs) {
      for (const rel of [
        'chrome-linux64/chrome',
        'chrome-linux/chrome',
        'chrome-linux/headless_shell',
        'chrome-mac/Chromium.app/Contents/MacOS/Chromium',
      ]) {
        candidates.push(path.join(root, d, rel));
      }
    }
  }
  for (const c of ['/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome']) candidates.push(c);

  return candidates.find((c) => {
    try {
      return c && fs.existsSync(c);
    } catch {
      return false;
    }
  }) || null;
}

/**
 * Tier 1 audit. Requires Playwright; throws a clear message if absent so the
 * runner can degrade to Tier 0 instead of dying.
 */
async function auditTier1(url, opts = {}) {
  let chromium;
  try {
    ({ chromium } = require('playwright'));
  } catch {
    const err = new Error('PLAYWRIGHT_MISSING');
    err.hint = 'npm i --no-save playwright && npx playwright install chromium --with-deps';
    throw err;
  }

  const timeoutMs = opts.timeoutMs || 30000;
  const exe = resolveChromiumPath(chromium);
  const launchOpts = { args: ['--no-sandbox', '--disable-dev-shm-usage'] };
  if (exe) launchOpts.executablePath = exe;
  // Chromium does not read HTTPS_PROXY from the environment. Without this the
  // browser gets ERR_CONNECTION_RESET on every navigation, Tier 1 reports the
  // site unreachable, and the grader scores a healthy business as a dead domain.
  const proxyEnv = process.env.https_proxy || process.env.HTTPS_PROXY || process.env.http_proxy || process.env.HTTP_PROXY;
  if (proxyEnv) {
    launchOpts.proxy = { server: proxyEnv };
    if (process.env.no_proxy || process.env.NO_PROXY) {
      launchOpts.proxy.bypass = (process.env.no_proxy || process.env.NO_PROXY)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .join(',');
    }
  }
  const browser = await chromium.launch(launchOpts);
  const audit = { tier: 1, url };
  try {
    const context = await browser.newContext({ userAgent: UA, viewport: { width: 1440, height: 900 } });

    let transferBytes = 0;
    let requestCount = 0;
    const failed = [];
    context.on('response', (res) => {
      requestCount += 1;
      const len = parseInt(res.headers()['content-length'] || '0', 10);
      if (Number.isFinite(len)) transferBytes += len;
      if (res.status() >= 400) failed.push(`${res.status()} ${res.url().slice(0, 120)}`);
    });

    const page = await context.newPage();
    const t0 = Date.now();
    let resp = null;
    try {
      resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: timeoutMs });
    } catch (err) {
      // A failed RENDER is not evidence the site is down — Tier 0 may have
      // fetched it fine. Never emit `reachable:false` here: mergeAudits would
      // overwrite a good Tier 0 result and the grader would treat a live
      // business as a dead domain. Report the failure and keep tier at 0 so the
      // caller knows no rendered evidence was added.
      return {
        tier: 0,
        url,
        tier1Failed: true,
        tier1Error: String(err.message || err).split('\n')[0].slice(0, 200),
      };
    }
    try {
      await page.waitForLoadState('load', { timeout: Math.min(12000, timeoutMs) });
    } catch {
      /* a slow site is data, not a failure */
    }
    audit.loadMs = Date.now() - t0;
    audit.reachable = true;
    audit.httpStatus = resp ? resp.status() : null;
    audit.finalUrl = page.url();
    audit.https = /^https:/i.test(page.url());
    audit.requestCount = requestCount;
    if (transferBytes > 0) audit.transferBytes = transferBytes;
    audit.failedRequests = failed.slice(0, 10);

    const rendered = await page.evaluate(() => {
      const txt = (el) => (el.textContent || '').replace(/\s+/g, ' ').trim();

      // Palette weighted by painted area — same method as harvest.js so the two
      // stay comparable.
      const colorCount = {};
      const fontCount = {};
      const bump = (raw, weight) => {
        if (!raw) return;
        const m = raw.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/);
        if (!m) return;
        if (m[4] !== undefined && parseFloat(m[4]) < 0.5) return;
        const hex =
          '#' +
          [m[1], m[2], m[3]]
            .map((n) => Math.round(parseFloat(n)).toString(16).padStart(2, '0'))
            .join('')
            .toUpperCase();
        colorCount[hex] = (colorCount[hex] || 0) + weight;
      };
      let smallestBody = Infinity;
      let smallTapTargets = 0;
      let tapTargets = 0;
      [...document.querySelectorAll('body *')].slice(0, 3000).forEach((el) => {
        const cs = getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        const area = Math.max(0, rect.width) * Math.max(0, rect.height);
        const t = txt(el);
        if (area > 0) bump(cs.backgroundColor, area);
        if (t.length > 0) bump(cs.color, Math.min(area, 20000));
        const fam = (cs.fontFamily || '').split(',')[0].replace(/["']/g, '').trim();
        if (fam && t.length > 2) {
          fontCount[fam] = fontCount[fam] || { area: 0, maxSize: 0 };
          fontCount[fam].area += area;
          fontCount[fam].maxSize = Math.max(fontCount[fam].maxSize, parseFloat(cs.fontSize) || 0);
        }
        const fs = parseFloat(cs.fontSize) || 0;
        if (t.length > 20 && fs > 0) smallestBody = Math.min(smallestBody, fs);
        if (/^(A|BUTTON)$/.test(el.tagName) && rect.width > 0) {
          tapTargets += 1;
          if (rect.height < 44 || rect.width < 30) smallTapTargets += 1;
        }
      });

      const imgs = [...document.querySelectorAll('img')];
      let oversized = 0;
      imgs.forEach((img) => {
        const shown = img.clientWidth || 0;
        if (img.naturalWidth > 0 && shown > 0 && img.naturalWidth > shown * 2.5 && img.naturalWidth > 1000) {
          oversized += 1;
        }
      });

      const text = document.body ? document.body.innerText || '' : '';
      return {
        palette: Object.entries(colorCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 12)
          .map(([hex, weight]) => ({ hex, weight: Math.round(weight) })),
        fonts: Object.entries(fontCount)
          .sort((a, b) => b[1].area - a[1].area)
          .slice(0, 6)
          .map(([family, d]) => ({ family, maxSizePx: Math.round(d.maxSize) })),
        wordCount: text.split(/\s+/).filter(Boolean).length,
        minBodyFontPx: Number.isFinite(smallestBody) ? Math.round(smallestBody) : null,
        tapTargetsOk: tapTargets === 0 ? null : smallTapTargets / tapTargets < 0.25,
        oversizedImages: oversized,
        imageCount: imgs.length,
        altTextRatio: imgs.length
          ? Math.round((imgs.filter((i) => (i.alt || '').trim()).length / imgs.length) * 100) / 100
          : null,
        hasViewport: !!document.querySelector('meta[name="viewport"]'),
        schemaCount: document.querySelectorAll('script[type="application/ld+json"]').length,
        hasHeroImage: (() => {
          const first = imgs.find((i) => i.getBoundingClientRect().top < 700 && i.clientWidth > 300);
          if (first) return true;
          const banner = [...document.querySelectorAll('header,section,div')]
            .slice(0, 40)
            .some((el) => /url\(/.test(getComputedStyle(el).backgroundImage || ''));
          return banner;
        })(),
      };
    });
    Object.assign(audit, rendered);

    // Horizontal overflow at each viewport — the single most legible mobile fail.
    audit.horizontalOverflow = {};
    for (const [name, width, height] of VIEWPORTS) {
      await page.setViewportSize({ width, height });
      await page.waitForTimeout(250);
      audit.horizontalOverflow[name] = await page.evaluate(
        (w) => document.documentElement.scrollWidth > w + 4,
        width
      );
    }
    audit.usesMediaQueries = await page.evaluate(() => {
      let found = false;
      for (const sheet of Array.from(document.styleSheets)) {
        try {
          for (const rule of Array.from(sheet.cssRules || [])) {
            if (rule.type === CSSRule.MEDIA_RULE && /(?:max|min)-width/.test(rule.conditionText || '')) {
              found = true;
              break;
            }
          }
        } catch {
          /* cross-origin sheet */
        }
        if (found) break;
      }
      return found;
    });

    if (opts.screenshotDir) {
      const fs = require('fs');
      const path = require('path');
      fs.mkdirSync(opts.screenshotDir, { recursive: true });
      for (const [name, width, height] of VIEWPORTS) {
        await page.setViewportSize({ width, height });
        await page.waitForTimeout(200);
        const file = path.join(opts.screenshotDir, `${name}.png`);
        await page.screenshot({ path: file, fullPage: name !== 'desktop' });
      }
      audit.screenshotDir = opts.screenshotDir;
    }
  } finally {
    await browser.close();
  }
  return audit;
}

/**
 * Reuse an existing site-factory harvest.json as Tier 1 evidence. Free — the
 * batch pipeline already paid for it.
 */
function auditFromHarvest(harvest, url) {
  if (!harvest || typeof harvest !== 'object') return null;
  const ds = harvest.decaySignals || {};
  const facts = harvest.facts || {};
  const voice = harvest.voice || {};
  const brand = harvest.brand || {};
  const paragraphs = Array.isArray(voice.paragraphs) ? voice.paragraphs : [];
  const ctas = Array.isArray(voice.ctaLabels) ? voice.ctaLabels : [];
  const jsonLd = Array.isArray(facts.jsonLd) ? facts.jsonLd : [];
  const siteUrl = url || harvest.siteUrl || '';

  const audit = {
    tier: 1,
    url: siteUrl,
    source: 'harvest',
    reachable: true,
    https: siteUrl ? /^https:/i.test(siteUrl) : null,
    hasViewport: ds.missingViewport === true ? false : ds.missingViewport === false ? true : null,
    tableLayout: ds.tableLayout === true ? true : null,
    palette: brand.palette || [],
    fonts: brand.fonts || [],
    wordCount: paragraphs.length ? paragraphs.join(' ').split(/\s+/).filter(Boolean).length : null,
    phoneVisible: facts.phone ? true : null,
    hoursVisible: facts.hours ? true : null,
    hasCta: ctas.length > 0 ? true : null,
    schemaCount: jsonLd.length,
    hasLocalBusinessSchema: jsonLd.some((b) =>
      /LocalBusiness|Restaurant|Dentist|Plumber|HVAC|Electrician|Store|ProfessionalService|Attorney/i.test(
        JSON.stringify(b && b['@type'] ? b['@type'] : '')
      )
    ),
    hasTitle: voice.title ? true : null,
    hasMetaDescription: voice.metaDescription ? voice.metaDescription.length > 20 : null,
    hasOgTags: voice.ogTitle || voice.ogDescription ? true : null,
    hasHeroImage: Array.isArray(harvest.images) && harvest.images.length > 0 ? true : null,
    imageCount: Array.isArray(harvest.images) ? harvest.images.length : null,
    copyrightYear: ds.staleCopyrightYear ? parseInt(ds.staleCopyrightYear, 10) : null,
    slowLoadMs: ds.slowLoadMs != null ? Number(ds.slowLoadMs) : null,
  };
  if (audit.slowLoadMs != null) audit.loadMs = audit.slowLoadMs;
  delete audit.slowLoadMs;
  // Drop nulls so mergeAudits never lets harvest erase a Tier 0 measurement.
  for (const k of Object.keys(audit)) if (audit[k] === null) delete audit[k];
  return audit;
}

/** Tier 2: fold in a human/agent taste verdict (1–5) and optional note. */
function applyTaste(audit, tasteScore, tasteNote = '') {
  const n = Number(tasteScore);
  if (!Number.isFinite(n)) return audit;
  return { ...audit, tier: 2, tasteScore: Math.max(1, Math.min(5, n)), tasteNote: String(tasteNote || '') };
}

module.exports = {
  auditTier0,
  resolveChromiumPath,
  auditTier1,
  auditFromHarvest,
  applyTaste,
  analyzeTier0,
  fetchPage,
  visibleText,
  detectPlatform,
  assertPublicHttpUrl,
  VIEWPORTS,
};
