/* Frame renderer: drives film.html deterministically and writes PNG frames. */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const DIR = __dirname;
const OUT = process.env.OUT_DIR || path.join(DIR, 'frames');
const ONLY = process.env.ONLY ? process.env.ONLY.split(',').map(Number) : null;
const FROM = process.env.FROM ? Number(process.env.FROM) : 0;
const TO   = process.env.TO   ? Number(process.env.TO)   : null;

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH || undefined,
    args: ['--force-color-profile=srgb', '--disable-lcd-text', '--font-render-hinting=none',
           '--hide-scrollbars', '--enable-font-antialiasing']
  });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  page.on('console', m => { if (m.type() === 'error') console.error('PAGE ERR:', m.text()); });
  page.on('pageerror', e => console.error('PAGE EXCEPTION:', e.message));

  await page.goto((process.env.BASE || 'http://127.0.0.1:8791') + '/film.html');
  await page.waitForFunction('window.FILM_READY === true', { timeout: 60000 });
  const total = await page.evaluate('window.TOTAL_FRAMES');
  console.log('assets ready, total frames =', total);

  // prime caches (glyph atlases, icon lengths) so frame 0 matches a re-render
  await page.evaluate(() => { for (const f of [0, 200, 400, 620, 850, 1050, 1200, 1300]) window.renderFrame(f); });

  const list = ONLY || Array.from({ length: (TO ?? total) - FROM }, (_, i) => i + FROM);
  const canvas = await page.$('#stage');
  let done = 0;
  const t0 = Date.now();
  for (const f of list) {
    await page.evaluate(n => window.renderFrame(n), f);
    await canvas.screenshot({ path: path.join(OUT, 'f' + String(f).padStart(5, '0') + '.png') });
    if (++done % 60 === 0) {
      const el = (Date.now() - t0) / 1000;
      console.log(`${done}/${list.length}  ${el.toFixed(0)}s  eta ${((el / done) * (list.length - done)).toFixed(0)}s`);
    }
  }
  console.log('rendered', done, 'frames in', ((Date.now() - t0) / 1000).toFixed(0) + 's');
  await browser.close();
})();
