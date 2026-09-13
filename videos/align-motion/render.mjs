/* =============================================================================
   render.mjs · deterministic frame capture -> H.264 MP4
   -----------------------------------------------------------------------------
   Usage:
     node render.mjs align-in-motion.html out/align-in-motion.mp4 [--fps 30]
     node render.mjs align-in-motion.html --stills 0,2.4,7.1     (QC frames only)

   The page exposes window.__seek(t) and window.__DUR. We drive the clock
   ourselves instead of letting the page animate, so the Nth frame is always
   byte-identical across runs.
   ========================================================================== */
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdir, rm, readdir } from 'node:fs/promises';
import path from 'node:path';

const argv = process.argv.slice(2);
const page_file = argv[0];
if (!page_file) {
  console.error('usage: node render.mjs <page.html> <out.mp4> [--fps N] [--stills t1,t2]');
  process.exit(1);
}
const flag = (n, d) => {
  const i = argv.indexOf('--' + n);
  return i === -1 ? d : argv[i + 1];
};
const stills = flag('stills', null);
const outMp4 = argv[1] && !argv[1].startsWith('--') ? argv[1] : null;
const FPS = Number(flag('fps', 30));
const HERE = path.resolve('.');
const TMP = path.join(HERE, '.frames');

function sh(cmd, args) {
  return new Promise((res, rej) => {
    const p = spawn(cmd, args, { stdio: ['ignore', 'inherit', 'inherit'] });
    p.on('close', (c) => (c === 0 ? res() : rej(new Error(cmd + ' exited ' + c))));
  });
}

const browser = await chromium.launch({
  args: ['--force-device-scale-factor=1', '--hide-scrollbars', '--font-render-hinting=none']
});
const page = await browser.newPage({
  viewport: { width: 1920, height: 1080 },
  deviceScaleFactor: 1
});

const url = 'file://' + path.join(HERE, page_file) + '?capture=1';
await page.goto(url, { waitUntil: 'load' });
await page.waitForFunction('window.__ready === true', null, { timeout: 45000 });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(350);

const DUR = await page.evaluate(() => window.__DUR);
console.log(`page=${page_file}  duration=${DUR.toFixed(2)}s  fps=${FPS}`);

if (stills) {
  await mkdir(path.join(HERE, 'out', 'stills'), { recursive: true });
  for (const s of stills.split(',')) {
    const t = Number(s);
    await page.evaluate((tt) => window.__seek(tt), t);
    const f = path.join(HERE, 'out', 'stills', `t${s.replace('.', '_')}.png`);
    await page.screenshot({ path: f });
    console.log('still', f);
  }
  await browser.close();
  process.exit(0);
}

await rm(TMP, { recursive: true, force: true });
await mkdir(TMP, { recursive: true });

const total = Math.round(DUR * FPS);
const t_start = Date.now();
/* Intermediate frames are JPEG, not PNG. Chromium's PNG encoder costs ~830ms
   per 1080p frame versus ~130ms for JPEG, a 6x difference on a 1700-frame
   render. At quality 98 the delta against PNG is ~0.9/255 mean, far below what
   the libx264 CRF 18 pass below discards anyway. */
for (let i = 0; i < total; i++) {
  const t = i / FPS;
  await page.evaluate((tt) => window.__seek(tt), t);
  await page.screenshot({
    path: path.join(TMP, String(i).padStart(5, '0') + '.jpg'),
    type: 'jpeg', quality: 98,
    animations: 'disabled'
  });
  if (i % 60 === 0 || i === total - 1) {
    const el = (Date.now() - t_start) / 1000;
    const rate = (i + 1) / el;
    process.stdout.write(
      `\r  frame ${i + 1}/${total}  ${rate.toFixed(1)} fps  eta ${((total - i - 1) / rate).toFixed(0)}s   `
    );
  }
}
process.stdout.write('\n');
await browser.close();

const n = (await readdir(TMP)).length;
console.log(`captured ${n} frames, encoding...`);
await mkdir(path.dirname(path.join(HERE, outMp4)), { recursive: true });
await sh('ffmpeg', [
  '-y', '-hide_banner', '-loglevel', 'error',
  '-framerate', String(FPS),
  '-i', path.join(TMP, '%05d.jpg'),
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '18',
  '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-level', '4.2',
  '-movflags', '+faststart',
  path.join(HERE, outMp4)
]);
await rm(TMP, { recursive: true, force: true });
console.log('wrote', outMp4);
