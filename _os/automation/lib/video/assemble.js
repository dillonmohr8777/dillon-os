'use strict';

/**
 * FFmpeg assembly: frames -> clip, clips -> master, master -> aspect derivatives.
 *
 * ffmpeg is located rather than assumed, and its capabilities are probed rather
 * than trusted. That check exists because of a real trap: Playwright ships an
 * ffmpeg at /opt/pw-browsers/ffmpeg-* that is built with `--disable-everything`
 * plus VP8/webm only. It answers `ffmpeg -version` perfectly happily and then
 * cannot mux an MP4 or encode h264. Finding it on PATH and using it produces a
 * confusing failure deep inside a render that has already spent money on clips.
 * `probe()` therefore reports which muxers and encoders are actually compiled in,
 * and callers refuse to start a paid render without them.
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const FFMPEG_CANDIDATES = [
  process.env.FFMPEG_PATH,
  'ffmpeg',
  '/usr/bin/ffmpeg',
  '/usr/local/bin/ffmpeg',
  'C:\\ffmpeg\\bin\\ffmpeg.exe',
  'C:\\Program Files\\ffmpeg\\bin\\ffmpeg.exe',
].filter(Boolean);

function tryRun(bin, args, timeoutMs = 15000) {
  try {
    return execFileSync(bin, args, { encoding: 'utf8', timeout: timeoutMs, stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (err) {
    // ffmpeg writes its banner to stderr and exits non-zero for some probes;
    // stdout captured before the throw is still usable.
    if (err && typeof err.stdout === 'string' && err.stdout) return err.stdout;
    return null;
  }
}

function findFfmpeg() {
  for (const c of FFMPEG_CANDIDATES) {
    if (c.includes(path.sep) || c.includes('/')) {
      if (!fs.existsSync(c)) continue;
    }
    if (tryRun(c, ['-version'], 8000)) return c;
  }
  return null;
}

/**
 * What can this ffmpeg actually do?
 * @returns {{ok:boolean, bin:string|null, h264:boolean, mp4:boolean, aac:boolean, concat:boolean, missing:string[]}}
 */
function probe(bin = findFfmpeg()) {
  if (!bin) {
    return { ok: false, bin: null, h264: false, mp4: false, aac: false, concat: false, missing: ['ffmpeg not found'] };
  }
  const encoders = tryRun(bin, ['-hide_banner', '-encoders']) || '';
  const muxers = tryRun(bin, ['-hide_banner', '-muxers']) || '';
  const demuxers = tryRun(bin, ['-hide_banner', '-demuxers']) || '';

  const h264 = /\blibx264\b/.test(encoders) || /\bh264_nvenc\b/.test(encoders) || /\bh264_videotoolbox\b/.test(encoders);
  const mp4 = /\bmp4\b/.test(muxers);
  const aac = /\baac\b/.test(encoders);
  const concat = /\bconcat\b/.test(demuxers);

  const missing = [];
  if (!h264) missing.push('an h264 encoder (libx264)');
  if (!mp4) missing.push('the mp4 muxer');
  if (!concat) missing.push('the concat demuxer');

  return { ok: missing.length === 0, bin, h264, mp4, aac, concat, missing };
}

function run(bin, args, opts = {}) {
  try {
    execFileSync(bin, args, { stdio: opts.verbose ? 'inherit' : 'ignore', timeout: opts.timeoutMs || 600000 });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/** PNG frame sequence -> a single clip. */
function encodeFrames(framesDir, outPath, opts = {}) {
  const bin = opts.bin || findFfmpeg();
  if (!bin) return { ok: false, error: 'ffmpeg not found' };
  const fps = opts.fps || 24;

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  const res = run(bin, [
    '-y', '-framerate', String(fps),
    '-i', path.join(framesDir, 'frame-%05d.png'),
    '-c:v', opts.encoder || 'libx264',
    '-pix_fmt', 'yuv420p',
    '-crf', String(opts.crf ?? 18),
    '-preset', opts.preset || 'medium',
    // Fragmented moov at the front so the file starts playing before it fully
    // downloads — Telegram and every browser preview care about this.
    '-movflags', '+faststart',
    outPath,
  ], opts);
  if (!res.ok) return res;
  return { ok: true, path: outPath, bytes: fs.existsSync(outPath) ? fs.statSync(outPath).size : 0 };
}

/**
 * Concatenate clips into one master.
 *
 * Re-encodes rather than stream-copying. Clips come from different sources —
 * local Chromium renders and several different generative models — and their
 * codec parameters, frame rates and colour ranges do not match. A stream copy of
 * mismatched clips produces a file that plays the first clip and then stutters or
 * shows green frames, which is worse than a slower render.
 */
function concatClips(clipPaths, outPath, opts = {}) {
  const bin = opts.bin || findFfmpeg();
  if (!bin) return { ok: false, error: 'ffmpeg not found' };
  if (!clipPaths.length) return { ok: false, error: 'no clips to concatenate' };

  const listPath = path.join(path.dirname(outPath), 'concat-list.txt');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  // Single quotes are escaped per ffmpeg's concat demuxer rules.
  fs.writeFileSync(
    listPath,
    clipPaths.map((p) => `file '${path.resolve(p).replace(/'/g, "'\\''")}'`).join('\n'),
    'utf8'
  );

  const args = ['-y', '-f', 'concat', '-safe', '0', '-i', listPath];
  const { width, height, fps } = opts;
  const filters = [];
  if (width && height) {
    // Fit inside the frame, then pad — never crop or stretch. A stretched logo
    // is the fastest way to make a client video look cheap.
    filters.push(`scale=${width}:${height}:force_original_aspect_ratio=decrease`);
    filters.push(`pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2:color=${opts.padColor || 'black'}`);
    filters.push('setsar=1');
  }
  if (filters.length) args.push('-vf', filters.join(','));
  if (fps) args.push('-r', String(fps));
  args.push('-c:v', opts.encoder || 'libx264', '-pix_fmt', 'yuv420p', '-crf', String(opts.crf ?? 19),
    '-preset', opts.preset || 'medium', '-movflags', '+faststart', outPath);

  const res = run(bin, args, opts);
  if (!res.ok) return res;
  return { ok: true, path: outPath, bytes: fs.existsSync(outPath) ? fs.statSync(outPath).size : 0, listPath };
}

/** Derive a differently-shaped cut from the master (1080x1350 -> 9:16, 16:9). */
function deriveAspect(masterPath, outPath, { width, height, ...opts } = {}) {
  const bin = opts.bin || findFfmpeg();
  if (!bin) return { ok: false, error: 'ffmpeg not found' };

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  const res = run(bin, [
    '-y', '-i', masterPath,
    '-vf', [
      `scale=${width}:${height}:force_original_aspect_ratio=decrease`,
      `pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2:color=${opts.padColor || 'black'}`,
      'setsar=1',
    ].join(','),
    '-c:v', opts.encoder || 'libx264', '-pix_fmt', 'yuv420p',
    '-crf', String(opts.crf ?? 20), '-preset', opts.preset || 'medium',
    '-movflags', '+faststart',
    ...(opts.copyAudio === false ? ['-an'] : ['-c:a', 'copy']),
    outPath,
  ], opts);
  if (!res.ok) {
    // `-c:a copy` fails when the master has no audio track. Retry silent.
    if (opts.copyAudio !== false) return deriveAspect(masterPath, outPath, { width, height, ...opts, copyAudio: false });
    return res;
  }
  return { ok: true, path: outPath, bytes: fs.existsSync(outPath) ? fs.statSync(outPath).size : 0 };
}

/** Mux a narration track over the master, trimming to whichever is shorter. */
function addNarration(videoPath, audioPath, outPath, opts = {}) {
  const bin = opts.bin || findFfmpeg();
  if (!bin) return { ok: false, error: 'ffmpeg not found' };
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  const res = run(bin, [
    '-y', '-i', videoPath, '-i', audioPath,
    '-map', '0:v:0', '-map', '1:a:0',
    '-c:v', 'copy', '-c:a', opts.audioEncoder || 'aac', '-b:a', opts.audioBitrate || '192k',
    '-shortest', '-movflags', '+faststart',
    outPath,
  ], opts);
  if (!res.ok) return res;
  return { ok: true, path: outPath, bytes: fs.existsSync(outPath) ? fs.statSync(outPath).size : 0 };
}

/** Seconds -> SRT timestamp. */
function srtTime(seconds) {
  const ms = Math.max(0, Math.round(seconds * 1000));
  const h = String(Math.floor(ms / 3600000)).padStart(2, '0');
  const m = String(Math.floor((ms % 3600000) / 60000)).padStart(2, '0');
  const s = String(Math.floor((ms % 60000) / 1000)).padStart(2, '0');
  const f = String(ms % 1000).padStart(3, '0');
  return `${h}:${m}:${s},${f}`;
}

/** Build an SRT from scene captions and their running start times. */
function buildSrt(scenes) {
  let t = 0;
  const blocks = [];
  scenes.forEach((scene, i) => {
    const dur = Number(scene.duration_seconds) || 0;
    const text = scene.caption || scene.narration;
    if (text) {
      blocks.push(`${blocks.length + 1}\n${srtTime(t)} --> ${srtTime(t + dur)}\n${text}`);
    }
    t += dur;
  });
  return blocks.join('\n\n') + (blocks.length ? '\n' : '');
}

module.exports = {
  findFfmpeg, probe, encodeFrames, concatClips, deriveAspect, addNarration,
  buildSrt, srtTime,
};
