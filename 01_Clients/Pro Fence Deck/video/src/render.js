/* Deterministic frame-by-frame render -> H.264 MP4.
   Frames are piped straight into ffmpeg, so nothing accumulates on disk. */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const { spawn } = require('child_process');

const B   = '/tmp/claude-0/-home-user/5229e18d-bbaf-5c73-8cd2-126b6ec9af59/scratchpad/';
const FF  = '/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2';
const FPS = 30;
const OUT = B + 'ProFenceDeck-BuiltToLast-1080p.mp4';

(async () => {
  const br = await chromium.launch({ args: [
    '--force-color-profile=srgb', '--font-render-hinting=none',
    '--disable-lcd-text', '--hide-scrollbars', '--disable-gpu',
  ]});
  const pg = await br.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  pg.on('pageerror', e => console.log('PAGEERR:', e.message));
  pg.on('console', m => { if (m.type() === 'error') console.log('CONSOLE:', m.text()); });

  await pg.addInitScript(() => { window.__RENDER = true; });
  await pg.goto('file://'+B+'render.html');
  await pg.waitForFunction(() => window.__DURATION > 0, { timeout: 30000 });

  // every photo and both webfonts must be resident before frame 0
  await pg.evaluate(() => document.fonts.ready);
  await pg.evaluate(() => Promise.all([...document.images].map(
    i => i.complete ? null : new Promise(r => { i.onload = i.onerror = r; }))));
  await pg.waitForTimeout(2500);

  const D = await pg.evaluate(() => window.__DURATION);
  const N = Math.floor(D * FPS);
  console.log(`duration ${D.toFixed(2)}s -> ${N} frames @ ${FPS}fps`);

  const ff = spawn(FF, [
    '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-i', 'pipe:0',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '20',
    '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-level', '4.2',
    '-g', String(FPS * 2), '-movflags', '+faststart',
    '-r', String(FPS), OUT,
  ], { stdio: ['pipe', 'ignore', 'pipe'] });
  let ffErr = '';
  ff.stderr.on('data', d => { ffErr = (ffErr + d).slice(-4000); });
  const done = new Promise((res, rej) => {
    ff.on('close', c => c === 0 ? res() : rej(new Error('ffmpeg exit ' + c + '\n' + ffErr)));
  });

  const t0 = Date.now();
  for (let i = 0; i < N; i++) {
    await pg.evaluate(t => window.__seek(t), i / FPS);
    const buf = await pg.screenshot({ type: 'jpeg', quality: 94 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % 300 === 0) {
      const el = (Date.now() - t0) / 1000;
      const eta = i ? (el / i) * (N - i) : 0;
      console.log(`  ${i}/${N}  ${(i / N * 100).toFixed(1)}%  elapsed ${el.toFixed(0)}s  eta ${eta.toFixed(0)}s`);
    }
  }
  ff.stdin.end();
  await done;
  await br.close();
  console.log('WROTE', OUT);
})().catch(e => { console.error('FAILED', e); process.exit(1); });
