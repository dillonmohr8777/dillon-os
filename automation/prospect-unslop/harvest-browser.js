'use strict';

/**
 * Browser harvest for official sites that return Cloudflare "Just a moment"
 * or empty image lists to fetch-only harvest-lite.
 */

const { chromium } = require('playwright');

let browserPromise;

function getBrowser() {
  if (!browserPromise) {
    browserPromise = chromium.launch({
      headless: true,
      args: ['--disable-blink-features=AutomationControlled', '--no-sandbox'],
    });
  }
  return browserPromise;
}

function isChallenge(title, html) {
  const hay = `${title || ''} ${(html || '').slice(0, 2500)}`;
  return /just a moment|cf-challenge|attention required|enable javascript and cookies|verify you are human/i.test(
    hay
  );
}

async function collectFromPage(url, timeoutMs = 28000) {
  const browser = await getBrowser();
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1440, height: 1100 },
    locale: 'en-US',
  });
  const page = await context.newPage();
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: timeoutMs });
    await new Promise((r) => setTimeout(r, 2200));
    let title = await page.title();
    if (isChallenge(title, '')) {
      await new Promise((r) => setTimeout(r, 6000));
      title = await page.title();
    }
    const data = await page.evaluate(() => {
      const images = [];
      const push = (src, alt) => {
        if (!src || src.startsWith('data:')) return;
        images.push({ src, alt: alt || '' });
      };
      for (const img of document.images) {
        push(img.currentSrc || img.src, img.alt);
        const ss = img.getAttribute('srcset') || img.getAttribute('data-srcset') || '';
        for (const part of ss.split(',')) {
          const u = part.trim().split(/\s+/)[0];
          if (u) push(u, img.alt);
        }
      }
      for (const el of document.querySelectorAll('[style*="background"]')) {
        const m = String(el.getAttribute('style') || '').match(/url\((['"]?)([^"')]+)\1\)/i);
        if (m) push(m[2], '');
      }
      const og = document.querySelector('meta[property="og:image"]');
      if (og?.content) push(og.content, 'og:image');
      return {
        title: document.title,
        href: location.href,
        html: document.documentElement.outerHTML.slice(0, 250000),
        images,
      };
    });
    await context.close();
    if (isChallenge(data.title, data.html)) {
      return { ok: false, reason: 'cloudflare-challenge', url, title: data.title, images: [] };
    }
    return { ok: true, url: data.href || url, title: data.title, html: data.html, images: data.images };
  } catch (err) {
    await context.close().catch(() => {});
    return { ok: false, reason: String(err.message || err), url, images: [] };
  }
}

async function closeBrowser() {
  if (!browserPromise) return;
  const browser = await browserPromise;
  await browser.close().catch(() => {});
  browserPromise = null;
}

module.exports = { collectFromPage, closeBrowser, isChallenge };
