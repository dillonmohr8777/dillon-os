/* Frame exporter for the Align HCM industry films.
 *
 * Drives index.html through window.__seek(t) one frame at a time and pipes each
 * screenshot straight into ffmpeg as a PNG stream, so a 45 second render never
 * lands on disk as 1350 loose files.
 *
 * Chromium's PNG encoder is the bottleneck (about a second a frame in software
 * rendering), so the timeline is cut into contiguous segments rendered by
 * parallel browsers and concatenated at the end.
 *
 *   node render.mjs                    render industries.html
 *   node render.mjs --jobs 1           single browser, easier to debug
 *   node render.mjs --from 10 --to 24 --out build/probe.mp4
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
const JOBS = Math.max(1, Number(opt('--jobs', Math.min(3, Math.max(1, os.cpus().length - 1)))));

const FILMS = ['industries'];
const named = argv.filter(a => FILMS.includes(a));
const films = named.length ? named : FILMS;

/* CRF 22 rather than the 19 the dark films use. The light stage carries film
   grain over large flat white areas, which is the most expensive thing you can
   ask x264 to encode; at 19 the file lands near 5 Mbps and most of those bits
   are noise. 22 is visually identical on this content (40.7 dB against a 19
   encode, no visible artefact on the marks) and roughly halves the file. */
const VCODEC = [
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '22',
  '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-level', '4.1',
];

mkdirSync(BUILD, { recursive: true });

/* open a page that is warmed up, in export chrome, and pinned at 1:1 */
async function openStage(pageUrl) {
  const browser = await chromium.launch({ executablePath: CHROME });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  await page.goto(pageUrl);
  await page.evaluate(() => { document.body.classList.add('export'); window.dispatchEvent(new Event('resize')); });
  await page.evaluate(() => window.__ready);
  const tf = await page.evaluate(() => getComputedStyle(document.getElementById('stage')).transform);
  if (tf !== 'none' && tf !== 'matrix(1, 0, 0, 1, 0, 0)') {
    throw new Error(`stage is not at 1:1 (${tf}); frames would be resampled`);
  }
  return { browser, page, errors };
}

/* render frames [f0, f1) of one film into `dest`, video only */
async function renderSegment(pageUrl, from, f0, f1, dest, onProgress) {
  const { browser, page, errors } = await openStage(pageUrl);
  const ff = spawn(FFMPEG, [
    '-y', '-hide_banner', '-loglevel', 'error',
    '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', 'pipe:0',
    ...VCODEC, '-an', dest,
  ], { stdio: ['pipe', 'inherit', 'inherit'] });
  const closed = once(ff, 'close');

  const stage = page.locator('#stage');
  for (let f = f0; f < f1; f++) {
    await page.evaluate(t => window.__seek(t), from + f / FPS);
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

async function renderFilm(film) {
  const pageFile = path.join(HERE, `${film}.html`);
  if (!existsSync(pageFile)) throw new Error(`${film}.html not built; run python3 build.py`);
  const pageUrl = 'file://' + pageFile;
  /* Named for the calendar slot the film ships into rather than for this
     directory, so the file arrives ready to schedule. */
  const SLOTS = { industries: '2026-08-19 - Every Industry Depends On It' };
  const out = path.resolve(HERE, opt('--out', `${SLOTS[film] || 'align-hcm-' + film}.mp4`));

  const probe = await openStage(pageUrl);
  const duration = Number(opt('--to', await probe.page.evaluate(() => window.DURATION)));
  await probe.browser.close();

  const total = Math.round((duration - FROM) * FPS);
  const jobs = Math.min(JOBS, total);
  console.log(`${film}: ${total} frames, ${FROM}s to ${duration}s at ${FPS}fps across ${jobs} job(s)`);

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
      console.log(`  ${String(done).padStart(4)}/${total}  ${el.toFixed(0)}s elapsed, ~${((el / done) * (total - done)).toFixed(0)}s left`);
    }
  };

  const segFiles = bounds.map((_, i) => path.join(BUILD, `seg_${film}_${i}.mp4`));
  const errors = (await Promise.all(
    bounds.map(([a, b], i) => renderSegment(pageUrl, FROM, a, b, segFiles[i], tick)),
  )).flat();

  let videoOnly = segFiles[0];
  if (jobs > 1) {
    const list = path.join(BUILD, `segments_${film}.txt`);
    writeFileSync(list, segFiles.map(f => `file '${f}'`).join('\n') + '\n');
    videoOnly = path.join(BUILD, `video_only_${film}.mp4`);
    await run(['-y', '-hide_banner', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', videoOnly]);
    rmSync(list, { force: true });
  }

  await run(['-y', '-hide_banner', '-loglevel', 'error', '-i', videoOnly,
             '-c', 'copy', '-movflags', '+faststart', out]);
  for (const f of segFiles) rmSync(f, { force: true });
  rmSync(path.join(BUILD, `video_only_${film}.mp4`), { force: true });

  if (errors.length) console.log('page errors:\n' + [...new Set(errors)].join('\n'));
  console.log(`wrote ${out} in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
}

for (const film of films) await renderFilm(film);
