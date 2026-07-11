// Render broker-video.html to MP4: seek each frame, screenshot JPEG,
// pipe straight into ffmpeg (libx264 + AAC ambient bed). No frames on disk.
// Usage: node tools/render.mjs [out.mp4] [fps]
import { chromium } from 'playwright-core';
import { spawn, execSync } from 'child_process';

const OUT = process.argv[2] || 'Align-Broker-Implementation-Video.mp4';
const FPS = Number(process.argv[3] || 30);
const FF = execSync('python3 -c "import imageio_ffmpeg,sys;sys.stdout.write(imageio_ffmpeg.get_ffmpeg_exe())"').toString();

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
await p.goto('file://' + process.cwd() + '/booth-video.html#render');
await p.waitForFunction(() => document.fonts.status === 'loaded');
await p.waitForTimeout(500);
const DUR = await p.evaluate(() => window.VIDEO_DURATION);
const FRAMES = Math.round(DUR * FPS);

const ff = spawn(FF, [
  '-y',
  '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
  '-i', 'assets/ambient.wav',
  '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-pix_fmt', 'yuv420p',
  '-c:a', 'aac', '-b:a', '160k',
  '-movflags', '+faststart', '-shortest',
  OUT,
], { stdio: ['pipe', 'inherit', 'inherit'] });

const t0 = Date.now();
for (let f = 0; f < FRAMES; f++) {
  const t = f / FPS;
  await p.evaluate(t => window.seek(t), t);
  const buf = await p.screenshot({ type: 'jpeg', quality: 92 });
  if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
  if (f % 300 === 0) {
    const el = (Date.now() - t0) / 1000;
    console.log(`frame ${f}/${FRAMES} (${(f / FRAMES * 100).toFixed(0)}%) elapsed ${el.toFixed(0)}s`);
  }
}
ff.stdin.end();
await new Promise((res, rej) => ff.on('close', c => c === 0 ? res() : rej(new Error('ffmpeg exit ' + c))));
await b.close();
console.log('done:', OUT, 'in', ((Date.now() - t0) / 1000).toFixed(0) + 's');
