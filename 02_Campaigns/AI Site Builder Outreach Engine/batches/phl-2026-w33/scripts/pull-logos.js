#!/usr/bin/env node
/**
 * Pull each prospect's real logo from harvest JSON-LD or the live header.
 * Writes assets/logo.png (or .svg) beside the built site. Never invents a mark.
 */
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { chromium } = require('playwright');

const BATCH = path.join(__dirname, '..');
const HARVEST = '/workspace/_templates/site-factory/harvest';
const briefs = fs.readdirSync(path.join(BATCH, 'briefs')).filter((f) => f.endsWith('.json'));

function download(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(
      url,
      {
        headers: {
          'user-agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
          accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
        },
        timeout: 20000,
      },
      (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          res.resume();
          return download(new URL(res.headers.location, url).href).then(resolve, reject);
        }
        if (res.statusCode !== 200) {
          res.resume();
          return reject(new Error(`HTTP ${res.statusCode}`));
        }
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => resolve({ buf: Buffer.concat(chunks), type: res.headers['content-type'] || '' }));
      }
    );
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('timeout'));
    });
  });
}

function walkLogos(obj, out = []) {
  if (!obj || typeof obj !== 'object') return out;
  if (Array.isArray(obj)) {
    obj.forEach((x) => walkLogos(x, out));
    return out;
  }
  for (const [k, v] of Object.entries(obj)) {
    if (/logo/i.test(k) && typeof v === 'string' && /^https?:/i.test(v)) out.push(v);
    else if (v && typeof v === 'object') walkLogos(v, out);
  }
  return out;
}

function writeLogo(destDir, buf, type, url) {
  fs.mkdirSync(destDir, { recursive: true });
  const svg = /svg/i.test(type) || /\.svg(\?|$)/i.test(url);
  const file = svg ? 'logo.svg' : 'logo.png';
  fs.writeFileSync(path.join(destDir, file), buf);
  return file;
}

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  for (const file of briefs) {
    const brief = JSON.parse(fs.readFileSync(path.join(BATCH, 'briefs', file), 'utf8'));
    const harvestFile = path.join(HARVEST, brief.slug, 'harvest.json');
    const harvest = fs.existsSync(harvestFile) ? JSON.parse(fs.readFileSync(harvestFile, 'utf8')) : {};
    const dest = path.join(BATCH, 'sites', brief.slug, 'assets');
    const known = walkLogos(harvest);
    let saved = null;
    for (const url of known) {
      try {
        const { buf, type } = await download(url);
        if (buf.length > 800) {
          saved = writeLogo(dest, buf, type, url);
          console.log('jsonld', brief.slug, saved, url);
          break;
        }
      } catch (err) {
        console.log('skip', brief.slug, url, err.message);
      }
    }
    if (saved) continue;
    if (!brief.url) {
      console.log('nologo', brief.slug);
      continue;
    }
    const page = await context.newPage();
    try {
      await page.goto(brief.url, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForTimeout(1200);
      const urls = await page.evaluate(() => {
        const out = [];
        const push = (u) => {
          if (u && !u.startsWith('data:')) out.push(u);
        };
        document.querySelectorAll('script[type="application/ld+json"]').forEach((s) => {
          try {
            const j = JSON.parse(s.textContent);
            (Array.isArray(j) ? j : [j]).forEach((o) => {
              if (o && o.logo) push(typeof o.logo === 'string' ? o.logo : o.logo.url);
            });
          } catch {
            /* ignore */
          }
        });
        document
          .querySelectorAll('header img, .logo img, img[class*="logo" i], img[alt*="logo" i], a[class*="logo" i] img')
          .forEach((img) => push(img.currentSrc || img.src));
        const icon = document.querySelector('link[rel="apple-touch-icon"]');
        if (icon) push(icon.href);
        return [...new Set(out)];
      });
      for (const url of urls) {
        try {
          const { buf, type } = await download(url);
          if (buf.length > 800 && !/icon|favicon/i.test(url)) {
            saved = writeLogo(dest, buf, type, url);
            console.log('live', brief.slug, saved, url);
            break;
          }
        } catch {
          /* try next */
        }
      }
      if (!saved) console.log('nologo', brief.slug);
    } catch (err) {
      console.log('fail', brief.slug, String(err.message || err).split('\n')[0]);
    } finally {
      await page.close();
    }
  }
  await browser.close();
})();
