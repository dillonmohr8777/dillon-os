#!/usr/bin/env node
/**
 * Recapture the 25 mapped wow homepages only. Does not rewrite wow-library.json.
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const BATCH = path.join(__dirname, '..');
const SHOT_DIR = '/workspace/12_Brain/private/design-references/shots';
const wow = JSON.parse(fs.readFileSync(path.join(BATCH, 'wow-library.json'), 'utf8'));
const briefsDir = path.join(BATCH, 'briefs');
const urls = [
  ...new Set(
    fs
      .readdirSync(briefsDir)
      .filter((f) => f.endsWith('.json'))
      .map((f) => JSON.parse(fs.readFileSync(path.join(briefsDir, f), 'utf8')).composition_ref)
      .filter(Boolean)
  ),
];

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
  });
  for (const url of urls) {
    const item = (wow.items || []).find((i) => i.url === url);
    const slug = item && item.slug ? item.slug : 'mapped';
    const file = path.join(SHOT_DIR, `${slug}.jpg`);
    const page = await context.newPage();
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25000 });
      await page.waitForTimeout(2500);
      await page.screenshot({ path: file, type: 'jpeg', quality: 70, fullPage: false });
      const bytes = fs.statSync(file).size;
      console.log('ok', url, bytes);
    } catch (err) {
      console.log('fail', url, String(err.message || err).split('\n')[0]);
    } finally {
      await page.close();
    }
  }
  await browser.close();
})();
