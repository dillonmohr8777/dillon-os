/* Frame exporter for the Align HCM brand intro.
 *
 * Drives index.html through window.__seek(t) one frame at a time and pipes each
 * screenshot straight into ffmpeg as a PNG stream, so a 45 second render never
 * lands on disk as 1350 loose files.
 *
 * Chromium's PNG encoder is the bottleneck (about a second a frame in software
 * rendering), so the timeline is cut into contiguous segments rendered by
 * parallel browsers and concatenated at the end.
 *
 *   node render.mjs                    full render, no audio
 *   node render.mjs --music            mux the synthesised underscore
 *   node render.mjs --jobs 1           single browser, easier to debug
 *   node render.mjs --from 10 --to 13 --out build/probe.mp4
 *
 * FFMPEG and CHROME env vars override the binary paths.
 */
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { existsSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const HERE = path.dirname(new URL(import.meta.url).pathname);
const BUILD = path.join(HERE, 'build');

const argv = process.argv.slice(2);
const flag = n => argv.includes(n);
const opt = (n, d) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : d; };

const FFMPEG = process.env.FFMPEG
  || '/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2';
const CHROME = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

const FPS = Number(opt('--fps', 30));
const FROM = Number(opt('--from', 0));
const MUSIC = flag('--music');   // silent unless asked; the cut ships mute
const JOBS = Math.max(1, Number(opt('--jobs', Math.min(3, Math.max(1, os.cpus().length - 1)))));
const OUT = path.resolve(HERE, opt('--out', MUSIC ? 'align-hcm-intro-music.mp4' : 'align-hcm-intro.mp4'));
const AUDIO = path.join(BUILD, 'underscore.wav');
const PAGE = 'file://' + path.join(HERE, 'index.html');

const VCODEC = [
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '19',
  '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-level', '4.1',
];

mkdirSync(BUILD, { recursive: true });

/* open a page that is warmed up, in export chrome, and pinned at 1:1 */
async function openStage() {
  const browser = await chromium.launch({ executablePath: CHROME });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  await page.goto(PAGE);
  await page.evaluate(() => { document.body.classList.add('export'); window.dispatchEvent(new Event('resize')); });
  await page.evaluate(() => window.__ready);
  const tf = await page.evaluate(() => getComputedStyle(document.getElementById('stage')).transform);
  if (tf !== 'none' && tf !== 'matrix(1, 0, 0, 1, 0, 0)') {
    throw new Error(`stage is not at 1:1 (${tf}); frames would be resampled`);
  }
  return { browser, page, errors };
}

/* render frames [f0, f1) of the global timeline into `dest`, video only */
async function renderSegment(f0, f1, dest, onProgress) {
  const { browser, page, errors } = await openStage();
  const ff = spawn(FFMPEG, [
    '-y', '-hide_banner', '-loglevel', 'error',
    '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', 'pipe:0',
    ...VCODEC, '-an', dest,
  ], { stdio: ['pipe', 'inherit', 'inherit'] });
  const closed = once(ff, 'close');

  const stage = page.locator('#stage');
  for (let f = f0; f < f1; f++) {
    const t = FROM + f / FPS;
    await page.evaluate(t => window.__seek(t), t);
    const buf = await stage.screenshot({ type: 'png', animations: 'disabled' });
    if (!ff.stdin.write(buf)) await once(ff.stdin, 'drain');
    onProgress();
  }
  ff.stdin.end();
  await browser.close();
  const [code] = await closed;
  if (code !== 0) throw new Error(`ffmpeg exited ${code} on ${dest}`);
  return errors;
}

function run(args) {
  return new Promise((res, rej) => {
    const c = spawn(FFMPEG, args, { stdio: ['ignore', 'inherit', 'inherit'] });
    c.on('close', code => (code === 0 ? res() : rej(new Error(`ffmpeg exited ${code}`))));
  });
}

/* ------------------------------------------------------------------- main */

const probe = await openStage();
const DURATION = Number(opt('--to', await probe.page.evaluate(() => window.DURATION)));
await probe.browser.close();

const total = Math.round((DURATION - FROM) * FPS);
const jobs = Math.min(JOBS, total);
console.log(`rendering ${total} frames, ${FROM}s to ${DURATION}s at ${FPS}fps across ${jobs} job(s)`);

const bounds = [];
for (let i = 0; i < jobs; i++) {
  bounds.push([Math.round((i * total) / jobs), Math.round(((i + 1) * total) / jobs)]);
}

let done = 0;
const t0 = Date.now();
const tick = () => {
  done++;
  if (done % 60 === 0 || done === total) {
    const el = (Date.now() - t0) / 1000;
    const eta = (el / done) * (total - done);
    console.log(`  ${String(done).padStart(4)}/${total}  ${el.toFixed(0)}s elapsed, ~${eta.toFixed(0)}s left`);
  }
};

const segFiles = bounds.map((_, i) => path.join(BUILD, `seg_${i}.mp4`));
const allErrors = (await Promise.all(
  bounds.map(([a, b], i) => renderSegment(a, b, segFiles[i], tick)),
)).flat();

let videoOnly = segFiles[0];
if (jobs > 1) {
  const list = path.join(BUILD, 'segments.txt');
  writeFileSync(list, segFiles.map(f => `file '${f}'`).join('\n') + '\n');
  videoOnly = path.join(BUILD, 'video_only.mp4');
  await run(['-y', '-hide_banner', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', videoOnly]);
}

const useAudio = MUSIC && existsSync(AUDIO);
if (MUSIC && !useAudio) console.log('no build/underscore.wav found, run audio.py first; writing a silent cut');

await run([
  '-y', '-hide_banner', '-loglevel', 'error',
  '-i', videoOnly,
  ...(useAudio ? ['-i', AUDIO] : []),
  '-map', '0:v:0', '-c:v', 'copy',
  ...(useAudio ? ['-map', '1:a:0', '-c:a', 'aac', '-b:a', '192k', '-ac', '2', '-shortest'] : []),
  '-movflags', '+faststart', OUT,
]);

for (const f of segFiles) rmSync(f, { force: true });
rmSync(path.join(BUILD, 'video_only.mp4'), { force: true });
rmSync(path.join(BUILD, 'segments.txt'), { force: true });

if (allErrors.length) console.log('page errors:\n' + [...new Set(allErrors)].join('\n'));
console.log(`wrote ${OUT} in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
