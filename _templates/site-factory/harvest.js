#!/usr/bin/env node
/**
 * Reference harvester for the mirror-and-improve workflow.
 *
 *   node _templates/site-factory/harvest.js <slug> <site-url> [social-url ...]
 *   node _templates/site-factory/harvest.js --from targets.json
 *
 * For each target it captures, into harvest/<slug>/:
 *   shots/          full-page desktop + mobile screenshots of the site and each social profile
 *   images/         downloaded candidate imagery (og:image, hero, gallery), largest first
 *   harvest.json    their copy, voice samples, real palette, fonts, contact facts, social handles
 *
 * The palette and fonts come from computed styles on their live page, so the brand
 * derivation in DESIGN-SYSTEM.md starts from what the business actually uses.
 *
 * Requires Playwright: npm i --no-save playwright && npx playwright install chromium
 * Every target is isolated; one failure never kills the run. Login-walled socials
 * are recorded as blocked rather than silently skipped.
 */
const fs = require('fs');
const path = require('path');

let chromium;
try {
  ({ chromium } = require('playwright'));
} catch {
  console.error('Playwright is required. Run: npm i --no-save playwright && npx playwright install chromium');
  process.exit(1);
}

const argv = process.argv.slice(2);
let targets = [];
if (argv[0] === '--from') {
  targets = JSON.parse(fs.readFileSync(argv[1], 'utf8'));
} else {
  const [slug, siteUrl, ...socials] = argv;
  if (!slug || !siteUrl) {
    console.error('Usage: node harvest.js <slug> <site-url> [social-url ...]   |   node harvest.js --from targets.json');
    process.exit(1);
  }
  targets = [{ slug, siteUrl, socials }];
}

const OUT_ROOT = path.join(__dirname, 'harvest');
const VIEWPORTS = [
  ['desktop', 1440, 900],
  ['phone', 390, 844],
];

const clean = (s) => String(s || '').replace(/\s+/g, ' ').trim();

/** Pull copy, palette, fonts, and contact facts out of a live page. */
async function extractPage(page) {
  return page.evaluate(() => {
    const txt = (el) => (el.textContent || '').replace(/\s+/g, ' ').trim();
    const uniq = (arr) => [...new Set(arr.filter(Boolean))];

    const headings = uniq([...document.querySelectorAll('h1,h2,h3')].map(txt).filter((t) => t.length > 1 && t.length < 200));
    const paragraphs = uniq([...document.querySelectorAll('p,li')].map(txt).filter((t) => t.length > 40 && t.length < 600));
    const navLabels = uniq([...document.querySelectorAll('nav a, header a')].map(txt).filter((t) => t && t.length < 40));
    const ctaLabels = uniq(
      [...document.querySelectorAll('a,button')]
        .map(txt)
        .filter((t) => t && t.length < 40 && /book|call|order|shop|menu|contact|quote|schedule|reserve|buy|get|start|learn/i.test(t))
    );

    // Their real palette: count computed colors weighted by how much area uses them.
    const colorCount = {};
    const bump = (raw, weight) => {
      if (!raw) return;
      const m = raw.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/);
      if (!m) return;
      const a = m[4] === undefined ? 1 : parseFloat(m[4]);
      if (a < 0.5) return;
      const [r, g, b] = [m[1], m[2], m[3]].map((n) => Math.round(parseFloat(n)));
      const hex = '#' + [r, g, b].map((n) => n.toString(16).padStart(2, '0')).join('').toUpperCase();
      colorCount[hex] = (colorCount[hex] || 0) + weight;
    };
    const fontCount = {};
    [...document.querySelectorAll('body *')].slice(0, 3000).forEach((el) => {
      const cs = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      const area = Math.max(0, rect.width) * Math.max(0, rect.height);
      if (area > 0) bump(cs.backgroundColor, area);
      if (txt(el).length > 0) bump(cs.color, Math.min(area, 20000));
      const fam = (cs.fontFamily || '').split(',')[0].replace(/["']/g, '').trim();
      if (fam && txt(el).length > 2) {
        const w = parseInt(cs.fontWeight, 10) || 400;
        fontCount[fam] = fontCount[fam] || { area: 0, maxSize: 0, weights: {} };
        fontCount[fam].area += area;
        fontCount[fam].maxSize = Math.max(fontCount[fam].maxSize, parseFloat(cs.fontSize) || 0);
        fontCount[fam].weights[w] = (fontCount[fam].weights[w] || 0) + 1;
      }
    });

    const palette = Object.entries(colorCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([hex, weight]) => ({ hex, weight: Math.round(weight) }));
    const fonts = Object.entries(fontCount)
      .sort((a, b) => b[1].area - a[1].area)
      .slice(0, 6)
      .map(([family, d]) => ({ family, maxSizePx: Math.round(d.maxSize), area: Math.round(d.area) }));

    // Contact facts, preferring structured data over scraped text.
    const bodyText = document.body.innerText || '';
    const phone =
      (document.querySelector('a[href^="tel:"]') || {}).textContent?.trim() ||
      (bodyText.match(/\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}/) || [])[0] ||
      '';
    const jsonLd = [...document.querySelectorAll('script[type="application/ld+json"]')]
      .map((s) => {
        try {
          return JSON.parse(s.textContent);
        } catch {
          return null;
        }
      })
      .filter(Boolean);
    const hoursMatch = bodyText.match(/((mon|tue|wed|thu|fri|sat|sun)[a-z]*[^\n]{0,60}(am|pm)[^\n]{0,40})/i);

    const meta = (sel, attr = 'content') => (document.querySelector(sel) || {}).getAttribute?.(attr) || '';

    const images = [...document.querySelectorAll('img')]
      .map((img) => ({
        src: img.currentSrc || img.src,
        alt: (img.alt || '').trim(),
        w: img.naturalWidth || 0,
        h: img.naturalHeight || 0,
      }))
      .filter((i) => i.src && i.src.startsWith('http') && i.w >= 400 && i.h >= 300);
    const ogImage = meta('meta[property="og:image"]');
    if (ogImage) images.unshift({ src: ogImage, alt: 'og:image', w: 1200, h: 630 });

    const socialLinks = [...document.querySelectorAll('a[href]')]
      .map((a) => a.href)
      .filter((h) => /instagram\.com|facebook\.com|tiktok\.com|x\.com|twitter\.com|linkedin\.com|youtube\.com|yelp\.com/i.test(h));

    return {
      title: document.title || '',
      metaDescription: meta('meta[name="description"]'),
      ogTitle: meta('meta[property="og:title"]'),
      ogDescription: meta('meta[property="og:description"]'),
      headings,
      paragraphs: paragraphs.slice(0, 60),
      navLabels,
      ctaLabels,
      palette,
      fonts,
      phone,
      hours: hoursMatch ? hoursMatch[0].trim() : '',
      jsonLd,
      images: images.slice(0, 40),
      socialLinks: uniq(socialLinks),
      hasViewport: !!document.querySelector('meta[name="viewport"]'),
      copyrightYear: (bodyText.match(/(?:©|copyright)\s*(\d{4})/i) || [])[1] || '',
    };
  });
}

async function shoot(context, url, dir, label) {
  const result = { url, label, shots: [], blocked: false, error: null };
  for (const [name, width, height] of VIEWPORTS) {
    const page = await context.newPage();
    await page.setViewportSize({ width, height });
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForTimeout(2500);
      const file = path.join(dir, `${label}-${name}.png`);
      await page.screenshot({ path: file, fullPage: name === 'desktop' });
      result.shots.push(path.relative(OUT_ROOT, file));
      if (name === 'desktop') {
        const body = (await page.evaluate(() => document.body.innerText || '')).toLowerCase();
        if (/log in to continue|sign up to see|login required|content isn't available/.test(body)) {
          result.blocked = true;
        }
        if (label === 'site') result.extracted = await extractPage(page);
      }
    } catch (err) {
      result.error = err.message.split('\n')[0];
    } finally {
      await page.close();
    }
  }
  return result;
}

async function downloadImages(context, images, dir, limit = 14) {
  fs.mkdirSync(dir, { recursive: true });
  const sorted = [...images].sort((a, b) => b.w * b.h - a.w * a.h).slice(0, limit);
  const saved = [];
  for (const [i, img] of sorted.entries()) {
    try {
      const resp = await context.request.get(img.src, { timeout: 30000 });
      if (!resp.ok()) continue;
      const buf = await resp.body();
      if (buf.length < 8000) continue;
      const ext = (img.src.match(/\.(webp|jpg|jpeg|png|avif)/i) || [, 'jpg'])[1].toLowerCase();
      const file = path.join(dir, `source-${String(i + 1).padStart(2, '0')}.${ext}`);
      fs.writeFileSync(file, buf);
      saved.push({ file: path.basename(file), src: img.src, alt: img.alt, w: img.w, h: img.h, bytes: buf.length });
    } catch {
      /* skip unreachable asset */
    }
  }
  return saved;
}

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
    locale: 'en-US',
  });

  for (const target of targets) {
    const slug = target.slug;
    const dir = path.join(OUT_ROOT, slug);
    const shotsDir = path.join(dir, 'shots');
    fs.mkdirSync(shotsDir, { recursive: true });
    console.log(`\n=== ${slug} ===`);

    const site = await shoot(context, target.siteUrl, shotsDir, 'site');
    console.log(`site: ${site.error ? 'ERROR ' + site.error : site.shots.length + ' shots'}`);

    const extracted = site.extracted || {};
    const socialUrls = [...new Set([...(target.socials || []), ...(extracted.socialLinks || [])])].slice(0, 6);
    const socials = [];
    for (const [i, url] of socialUrls.entries()) {
      const platform = (url.match(/(instagram|facebook|tiktok|x|twitter|linkedin|youtube|yelp)/i) || [, 'social'])[1].toLowerCase();
      const res = await shoot(context, url, shotsDir, `social-${platform}-${i + 1}`);
      socials.push({ platform, ...res });
      console.log(`social ${platform}: ${res.error ? 'ERROR' : res.blocked ? 'login-walled (shot kept)' : res.shots.length + ' shots'}`);
    }

    let savedImages = [];
    if (extracted.images && extracted.images.length) {
      savedImages = await downloadImages(context, extracted.images, path.join(dir, 'images'));
      console.log(`images: ${savedImages.length} downloaded`);
    }

    const harvest = {
      slug,
      harvestedAt: new Date().toISOString(),
      siteUrl: target.siteUrl,
      site: { shots: site.shots, error: site.error },
      voice: {
        title: clean(extracted.title),
        metaDescription: clean(extracted.metaDescription),
        ogTitle: clean(extracted.ogTitle),
        ogDescription: clean(extracted.ogDescription),
        headings: extracted.headings || [],
        paragraphs: extracted.paragraphs || [],
        navLabels: extracted.navLabels || [],
        ctaLabels: extracted.ctaLabels || [],
      },
      brand: { palette: extracted.palette || [], fonts: extracted.fonts || [] },
      facts: {
        phone: clean(extracted.phone),
        hours: clean(extracted.hours),
        jsonLd: extracted.jsonLd || [],
      },
      decaySignals: {
        missingViewport: extracted.hasViewport === false,
        staleCopyrightYear: extracted.copyrightYear || null,
      },
      images: savedImages,
      socials,
    };
    fs.writeFileSync(path.join(dir, 'harvest.json'), JSON.stringify(harvest, null, 2));
    console.log(`wrote ${path.relative(process.cwd(), path.join(dir, 'harvest.json'))}`);
  }

  await browser.close();
  console.log(`\nHarvest root: ${OUT_ROOT}`);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
