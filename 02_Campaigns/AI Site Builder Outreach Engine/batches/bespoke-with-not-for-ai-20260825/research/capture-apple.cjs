const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const outDir = path.join(__dirname, 'apple-opening-frames');
fs.mkdirSync(outDir, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true,
    reducedMotion: 'no-preference',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1',
  });
  const page = await context.newPage();
  const events = [];
  page.on('console', (message) => {
    if (message.type() === 'error') events.push({ type: 'console', text: message.text() });
  });
  page.on('pageerror', (error) => events.push({ type: 'pageerror', text: error.message }));

  await page.goto('https://www.apple.com/mac-mini/', { waitUntil: 'domcontentloaded', timeout: 90000 });
  for (let index = 0; index < 28; index += 1) {
    const elapsedMs = index * 250;
    if (index > 0) await page.waitForTimeout(250);
    await page.screenshot({
      path: path.join(outDir, `frame-${String(index).padStart(2, '0')}-${elapsedMs}ms.png`),
      fullPage: false,
      animations: 'allow',
    });
  }

  const state = await page.evaluate(() => ({
    title: document.title,
    scrollY: window.scrollY,
    scrollHeight: document.documentElement.scrollHeight,
    viewport: { width: innerWidth, height: innerHeight },
    bodyClasses: document.body.className,
    headings: [...document.querySelectorAll('h1,h2')].slice(0, 12).map((node) => node.textContent.trim()),
  }));
  fs.writeFileSync(path.join(outDir, 'capture.json'), JSON.stringify({ state, events }, null, 2));
  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
