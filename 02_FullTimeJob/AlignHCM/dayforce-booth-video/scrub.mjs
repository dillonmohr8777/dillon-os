// Scrub key timestamps of broker-video.html to PNGs for visual QA.
// Usage: node tools/scrub.mjs [t1 t2 ...]   (defaults to scene-boundary set)
import { chromium } from 'playwright-core';
import { mkdirSync } from 'fs';

const times = process.argv.length > 2
  ? process.argv.slice(2).map(Number)
  : [0.8, 2.2, 4.2, 5.8, 7.6, 9.9, 12, 17, 22, 26, 31, 34.5, 40, 46, 52, 58, 64, 70, 76, 82, 85.9, 88, 92, 97, 100, 104, 110, 114, 119];

mkdirSync('scrubs', { recursive: true });
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
await p.goto('file://' + process.cwd() + '/broker-video.html#render');
await p.waitForFunction(() => document.fonts.status === 'loaded');
await p.waitForTimeout(400);
for (const t of times) {
  await p.evaluate(t => window.seek(t), t);
  await p.waitForTimeout(60);
  await p.screenshot({ path: `scrubs/t${String(t).padStart(5, '0')}.png` });
}
await b.close();
console.log('scrubbed', times.length, 'frames');
