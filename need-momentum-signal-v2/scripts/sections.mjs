/**
 * Section-anchored screenshots. Scroll-fraction shots miss whichever section
 * happens to fall between steps, so this walks named selectors instead and
 * frames each one.
 */
import { chromium } from 'playwright';
import fs from 'node:fs';

const OUT = process.env.OUT || '/tmp/claude-0/-home-user/a6c90d98-413c-5bfd-b5d7-b94d53309c04/scratchpad/shots';
fs.mkdirSync(OUT, { recursive: true });

const TARGET = process.env.TARGET || 'http://localhost:4173/';
const TAG = process.env.TAG || 'sec';
const WIDTH = Number(process.env.WIDTH || 1440);
const HEIGHT = Number(process.env.HEIGHT || 900);

const SECTIONS = [
  ['manifesto', '.signal-manifesto'],
  ['services', '.signal-services'],
  ['m360', '.signal-m360'],
  ['decision', '.signal-decision'],
  ['founders', '.founders'],
  ['awards', '.signal-awards'],
  ['finalcta', '.final-cta'],
  ['footer', '.footer']
];

const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox']
});

const context = await browser.newContext({
  viewport: { width: WIDTH, height: HEIGHT },
  deviceScaleFactor: 1,
  reducedMotion: process.env.REDUCED === '1' ? 'reduce' : 'no-preference'
});
const page = await context.newPage();
await page.goto(TARGET, { waitUntil: 'networkidle', timeout: 60000 });
await page.addStyleTag({ content: 'html { scroll-behavior: auto !important; }' });
await page.waitForTimeout(4500);

const suffix = process.env.REDUCED === '1' ? '-reduced' : '';

for (const [name, selector] of SECTIONS) {
  const el = page.locator(selector).first();
  if (await el.count() === 0) {
    console.log(`MISSING ${name} (${selector})`);
    continue;
  }
  await el.scrollIntoViewIfNeeded();
  // Nudge so the fixed header does not cover the section's own heading.
  await page.evaluate(() => window.scrollBy({ top: -90, behavior: 'instant' }));
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${OUT}/${TAG}-${name}${suffix}.png` });
  console.log(`shot ${name}`);
}

await browser.close();
