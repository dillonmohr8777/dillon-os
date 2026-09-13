#!/usr/bin/env node
/* ============================================================
   Deterministic frame renderer for Align in Motion.

   Real-time screen capture drops frames whenever the recorder
   and the browser disagree about timing, and resampling the
   result (25fps -> 30fps) adds judder. This instead walks the
   GSAP master timeline in exact 1/FPS steps, screenshots each
   step, and hands ffmpeg a numbered image sequence. Every
   output frame is rendered from a known timeline state, so the
   result is perfectly smooth no matter how slow the render was.

   Usage:
     node render-frames.js 04-public-service-cannot-pause.html out.mp4 [fps]
     node render-frames.js 05-gtaa-case-study.html out.mp4 60

   Requires: playwright-core, ffmpeg, and Chromium on the box.
   ============================================================ */
const { chromium } = require('playwright-core');
const { execFile } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const HTML = process.argv[2];
const OUT = process.argv[3] || 'out.mp4';
const FPS = parseInt(process.argv[4] || '30', 10);

const CHROME = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const FFMPEG = process.env.FFMPEG_PATH || 'ffmpeg';

if (!HTML) {
  console.error('usage: node render-frames.js <file.html> <out.mp4> [fps]');
  process.exit(1);
}

const run = (cmd, args) => new Promise((res, rej) =>
  execFile(cmd, args, { maxBuffer: 1 << 28 }, (e, so, se) => (e ? rej(new Error(se || e.message)) : res(so))));

(async () => {
  const frameDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aim-frames-'));
  const url = 'file://' + path.resolve(HTML);

  const browser = await chromium.launch({
    executablePath: CHROME,
    args: ['--no-sandbox', '--force-color-profile=srgb', '--font-render-hinting=none',
           '--disable-lcd-text', '--hide-scrollbars'],
  });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  page.on('pageerror', e => console.error('[page]', e.message));

  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.AIM);
  // fonts + images fully decoded before the first frame
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => Promise.all(
    Array.from(document.images).filter(i => !i.complete).map(i => i.decode().catch(() => {}))));

  const info = await page.evaluate(() => window.AIM.exportMode());
  const total = info.total;
  const count = Math.floor(total * FPS);
  console.log(`${path.basename(HTML)} — ${total.toFixed(2)}s · ${FPS}fps · ${count} frames · ${info.scenes} scenes`);

  const t0 = Date.now();
  for (let i = 0; i < count; i++) {
    const t = i / FPS;
    await page.evaluate(tt => window.AIM.renderAt(tt), t);
    await page.screenshot({
      path: path.join(frameDir, String(i).padStart(5, '0') + '.jpg'),
      type: 'jpeg', quality: 96,
    });
    if (i % 150 === 0 && i) {
      const pct = (100 * i / count).toFixed(0);
      const rate = i / ((Date.now() - t0) / 1000);
      console.log(`  ${pct}% · ${i}/${count} · ${rate.toFixed(1)} fps render`);
    }
  }
  await browser.close();

  console.log('encoding…');
  await run(FFMPEG, [
    '-y', '-framerate', String(FPS),
    '-i', path.join(frameDir, '%05d.jpg'),
    '-c:v', 'libx264', '-profile:v', 'high', '-preset', 'slow',
    '-crf', '18', '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart',
    '-r', String(FPS),
    OUT,
  ]);
  fs.rmSync(frameDir, { recursive: true, force: true });
  console.log('wrote ' + OUT);
})().catch(e => { console.error(e); process.exit(1); });
