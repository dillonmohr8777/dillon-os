// Renders a case study HTML file to a single page, letter width PDF.
// Usage: node build-pdf.mjs wck-dayforce-win-story.html
// Requires playwright and Chromium (PLAYWRIGHT_BROWSERS_PATH or a local install).
import { chromium } from 'playwright';
import { resolve, dirname, basename } from 'node:path';

const DESIGN_WIDTH_PX = 1320; // the .sheet width the layout is composed at
const PAGE_WIDTH_IN = 8.5;

const input = process.argv[2] ?? 'wck-dayforce-win-story.html';
const src = resolve(dirname(new URL(import.meta.url).pathname), input);
const out = src.replace(/\.html$/, '.pdf');

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
});
const page = await browser.newPage({ viewport: { width: DESIGN_WIDTH_PX, height: 1200 } });
await page.goto('file://' + src, { waitUntil: 'load' });
await page.emulateMedia({ media: 'print' });

const contentPx = await page.evaluate(() =>
  Math.ceil(document.querySelector('.sheet').getBoundingClientRect().height));

// Scale the design width down to the page width so the poster lands on one page.
const scale = (PAGE_WIDTH_IN * 96) / DESIGN_WIDTH_PX;
const heightIn = +(contentPx * scale / 96 + 0.02).toFixed(3); // buffer stops a blank spill page

await page.pdf({
  path: out,
  width: PAGE_WIDTH_IN + 'in',
  height: heightIn + 'in',
  scale,
  printBackground: true,
  margin: { top: 0, right: 0, bottom: 0, left: 0 },
});
await browser.close();

console.log(`${basename(out)}: 1 page, ${PAGE_WIDTH_IN}in x ${heightIn}in`);
