#!/usr/bin/env node
/**
 * hero-qa.mjs — QA gate for a scroll-hero output directory.
 *
 *   node hero-qa.mjs --dir <build-dir>/hero
 *
 * Reads hero-loop.mp4, hero-loop.webm, hero-poster.jpg (and, if present,
 * hero-loop.html) out of --dir, checks them against the scroll-hero QA
 * contract, and writes <dir>/hero-qa.json. Exits 0 on pass, 1 on fail.
 *
 * No npm dependencies. Uses `ffprobe` for duration/dimensions/fps when it's
 * on PATH; without it, those checks are skipped and reported as
 * "probe": "ffprobe missing" rather than guessed at.
 */
import { existsSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const MAX_VIDEO_BYTES = 2 * 1024 * 1024; // 2,097,152
const MAX_POSTER_BYTES = 120 * 1024; // 122,880
const MIN_DURATION_S = 6;
const MAX_DURATION_S = 8;
const ALLOWED_DIMS = [
  [1920, 1080],
  [1600, 900],
];

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--dir') out.dir = argv[++i];
  }
  return out;
}

function hasFfprobe() {
  const res = spawnSync('ffprobe', ['-version'], { stdio: 'ignore' });
  return !res.error && res.status === 0;
}

/** Probe duration (s), width, height, fps for a video file via ffprobe. */
function probeVideo(file) {
  const res = spawnSync('ffprobe', [
    '-v', 'error',
    '-select_streams', 'v:0',
    '-show_entries', 'stream=width,height,r_frame_rate:format=duration',
    '-of', 'json',
    file,
  ]);
  if (res.status !== 0 || res.error) {
    return { error: (res.stderr || res.error?.message || 'ffprobe failed').toString().trim().slice(0, 300) };
  }
  let data;
  try {
    data = JSON.parse(res.stdout.toString());
  } catch (e) {
    return { error: `ffprobe output did not parse: ${e.message}` };
  }
  const stream = (data.streams || [])[0] || {};
  const duration = data.format?.duration ? parseFloat(data.format.duration) : null;
  let fps = null;
  if (stream.r_frame_rate) {
    const [num, den] = stream.r_frame_rate.split('/').map(Number);
    if (den) fps = Math.round((num / den) * 100) / 100;
  }
  return {
    width: stream.width || null,
    height: stream.height || null,
    fps,
    duration_s: duration,
  };
}

/** Extract the first and last frame of a video as raw pixel buffers (PPM) and compare. */
function framesDiffer(file) {
  const extractFrame = (selectExpr) => {
    const res = spawnSync('ffmpeg', [
      '-v', 'error',
      '-i', file,
      '-vf', `select='${selectExpr}'`,
      '-vsync', '0',
      '-frames:v', '1',
      '-f', 'image2pipe',
      '-pix_fmt', 'rgb24',
      '-vcodec', 'ppm',
      'pipe:1',
    ]);
    if (res.status !== 0 || res.error || !res.stdout || !res.stdout.length) return null;
    return res.stdout;
  };
  const first = extractFrame('eq(n\\,0)');
  // eslint-disable-next-line no-unused-vars
  const last = extractFrame("eq(n\\,N-1)");
  if (!first || !last) return null; // couldn't extract; caller treats as "unknown"
  if (first.length !== last.length) return true;
  // Sample-compare rather than byte-for-byte to tolerate re-encode noise.
  let diffCount = 0;
  const step = Math.max(1, Math.floor(first.length / 5000));
  for (let i = 0; i < first.length; i += step) {
    if (Math.abs(first[i] - last[i]) > 6) diffCount++;
  }
  const sampled = Math.ceil(first.length / step);
  return diffCount / sampled > 0.02; // >2% of sampled bytes differ -> not seamless
}

function fileSize(path) {
  try {
    return statSync(path).size;
  } catch {
    return null;
  }
}

function main() {
  const { dir } = parseArgs(process.argv.slice(2));
  if (!dir) {
    console.error('Usage: node hero-qa.mjs --dir <build-dir>/hero');
    process.exit(1);
  }

  mkdirSync(dir, { recursive: true });

  const mp4Path = join(dir, 'hero-loop.mp4');
  const webmPath = join(dir, 'hero-loop.webm');
  const posterPath = join(dir, 'hero-poster.jpg');

  const failures = [];
  const probeAvailable = hasFfprobe();

  const result = {
    duration_s: null,
    width: null,
    height: null,
    fps: null,
    size_bytes_mp4: fileSize(mp4Path),
    size_bytes_webm: fileSize(webmPath),
    loops_seamlessly: null,
    poster_bytes: fileSize(posterPath),
    pass: false,
    failures,
  };

  if (!probeAvailable) {
    result.probe = 'ffprobe missing';
  }

  // Existence checks first — everything downstream depends on the files being there.
  if (result.size_bytes_mp4 === null) failures.push('hero-loop.mp4 is missing');
  if (result.size_bytes_webm === null) failures.push('hero-loop.webm is missing');
  if (result.poster_bytes === null) failures.push('hero-poster.jpg is missing');

  // Size checks (always run — no ffprobe required).
  if (result.size_bytes_mp4 !== null && result.size_bytes_mp4 > MAX_VIDEO_BYTES) {
    failures.push(`hero-loop.mp4 is ${result.size_bytes_mp4} bytes, over the ${MAX_VIDEO_BYTES} byte budget`);
  }
  if (result.size_bytes_webm !== null && result.size_bytes_webm > MAX_VIDEO_BYTES) {
    failures.push(`hero-loop.webm is ${result.size_bytes_webm} bytes, over the ${MAX_VIDEO_BYTES} byte budget`);
  }
  if (result.poster_bytes !== null && result.poster_bytes > MAX_POSTER_BYTES) {
    failures.push(`hero-poster.jpg is ${result.poster_bytes} bytes, over the ${MAX_POSTER_BYTES} byte budget`);
  }

  // Duration / dimensions / fps / loop-seam via ffprobe+ffmpeg, when available.
  if (probeAvailable && existsSync(mp4Path)) {
    const probe = probeVideo(mp4Path);
    if (probe.error) {
      failures.push(`ffprobe could not read hero-loop.mp4: ${probe.error}`);
    } else {
      result.duration_s = probe.duration_s;
      result.width = probe.width;
      result.height = probe.height;
      result.fps = probe.fps;

      if (probe.duration_s === null) {
        failures.push('could not determine duration from hero-loop.mp4');
      } else if (probe.duration_s < MIN_DURATION_S || probe.duration_s > MAX_DURATION_S) {
        failures.push(`duration ${probe.duration_s}s is outside the ${MIN_DURATION_S}-${MAX_DURATION_S}s window`);
      }

      const dimsOk = ALLOWED_DIMS.some(([w, h]) => w === probe.width && h === probe.height);
      if (!dimsOk) {
        failures.push(`dimensions ${probe.width}x${probe.height} do not match an allowed size (${ALLOWED_DIMS.map((d) => d.join('x')).join(' or ')})`);
      }

      const seam = framesDiffer(mp4Path);
      if (seam === null) {
        result.loops_seamlessly = null; // unknown; not a hard fail
      } else {
        result.loops_seamlessly = !seam;
        if (seam) failures.push('first and last frame differ noticeably — loop is not seamless (warning, not a hard fail)');
      }
    }
  } else if (!probeAvailable) {
    failures.push('duration/dimensions/fps/loop-seam not checked — ffprobe missing from PATH');
  }

  // Hard-fail set excludes the seamless-loop warning per the QA contract.
  const hardFailures = failures.filter((f) => !f.includes('warning, not a hard fail'));
  result.pass = hardFailures.length === 0;

  writeFileSync(join(dir, 'hero-qa.json'), JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));

  process.exit(result.pass ? 0 : 1);
}

main();
