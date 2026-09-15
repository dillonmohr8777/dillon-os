'use strict';

/**
 * Local, zero-cost scene renderer.
 *
 * This is the module that decides whether the whole stack is cheap or not.
 *
 * A generative video model bills per second and cannot reliably spell. Asking one
 * to draw a title card, a logo sting, a stat, a UI mock or a stick-figure
 * explainer means paying $0.03-$0.40/second for text that will come back
 * misspelled and off-brand. All of that is deterministic motion graphics, so it
 * is rendered here instead: HTML and CSS animation, seeked frame by frame in
 * headless Chromium, encoded with ffmpeg. Cost is electricity.
 *
 * Frames are captured by seeking, not by waiting. The page reads `?t=` and sets
 * `currentTime` on every running animation via the Web Animations API, so frame
 * N is a pure function of N. That makes renders reproducible and lets a failed
 * render resume mid-sequence instead of restarting.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync, execFileSync: _e } = require('child_process');

const DEFAULT_FPS = 24;

/** Chromium locations, in the order worth trying. */
const CHROMIUM_CANDIDATES = [
  process.env.VIDEO_CHROMIUM_PATH,
  process.env.CHROME_PATH,
  '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  '/opt/pw-browsers/chromium/chrome-linux/chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/usr/bin/google-chrome',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
].filter(Boolean);

function findChromium() {
  for (const c of CHROMIUM_CANDIDATES) {
    try {
      if (fs.existsSync(c)) return c;
    } catch { /* unreadable path, keep looking */ }
  }
  return null;
}

function escapeHtml(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
  );
}

const DEFAULT_BRAND = {
  bg: '#0b0f14',
  fg: '#f5f7fa',
  accent: '#3b82f6',
  muted: '#8b98a9',
  font: "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
};

/**
 * Scene body markup + CSS per scene type.
 *
 * Each returns markup whose animations are declarative CSS keyframes. Nothing
 * may depend on wall-clock time or requestAnimationFrame, because the capture
 * harness seeks rather than plays — a scene driven by rAF would render frame 0
 * a hundred times.
 */
function sceneBody(scene, brand) {
  const headline = escapeHtml(scene.headline || scene.text || scene.title || '');
  const sub = escapeHtml(scene.subhead || scene.caption || '');
  const items = Array.isArray(scene.items) ? scene.items : [];

  switch (scene.scene_type) {
    case 'title_card':
    case 'end_card':
      return `
<div class="stage center">
  <h1 class="rise" style="animation-delay:.05s">${headline}</h1>
  ${sub ? `<p class="rise muted" style="animation-delay:.35s">${sub}</p>` : ''}
  <div class="rule" style="animation-delay:.6s"></div>
</div>`;

    case 'kinetic_type': {
      // Word-by-word entrance. Split server-side so each word is its own
      // animated element with a deterministic delay.
      const words = String(scene.headline || scene.text || '').split(/\s+/).filter(Boolean);
      const spans = words
        .map((w, i) => `<span class="word" style="animation-delay:${(0.08 * i).toFixed(2)}s">${escapeHtml(w)}</span>`)
        .join(' ');
      return `<div class="stage center"><h1 class="kinetic">${spans}</h1></div>`;
    }

    case 'lower_third':
      return `
<div class="stage lower">
  <div class="lt">
    <div class="lt-bar" style="animation-delay:.05s"></div>
    <div class="lt-text">
      <div class="lt-title rise" style="animation-delay:.25s">${headline}</div>
      ${sub ? `<div class="lt-sub rise muted" style="animation-delay:.4s">${sub}</div>` : ''}
    </div>
  </div>
</div>`;

    case 'logo_sting':
      return `
<div class="stage center">
  <div class="sting">${headline || '&#9679;'}</div>
  <div class="sting-ring"></div>
</div>`;

    case 'chart': {
      // Values are normalised to the tallest bar so a chart never overflows the
      // frame regardless of the numbers the director invents.
      const max = Math.max(1, ...items.map((it) => Number(it.value) || 0));
      const bars = items
        .map((it, i) => {
          const pct = Math.round(((Number(it.value) || 0) / max) * 100);
          return `<div class="bar-row">
            <div class="bar-label">${escapeHtml(it.label || '')}</div>
            <div class="bar-track"><div class="bar-fill" style="--pct:${pct}%;animation-delay:${(0.15 * i + 0.2).toFixed(2)}s"></div></div>
            <div class="bar-value">${escapeHtml(it.display || it.value || '')}</div>
          </div>`;
        })
        .join('');
      return `<div class="stage pad">
        ${headline ? `<h2 class="rise">${headline}</h2>` : ''}
        <div class="chart">${bars}</div>
      </div>`;
    }

    case 'ui_mock': {
      const rows = items.length ? items : [{ label: '' }, { label: '' }, { label: '' }];
      const lines = rows
        .map((it, i) => `<div class="ui-row rise" style="animation-delay:${(0.1 * i + 0.3).toFixed(2)}s">
            <div class="ui-dot"></div><div class="ui-line">${escapeHtml(it.label || '')}</div>
          </div>`)
        .join('');
      return `<div class="stage pad">
        <div class="ui-window rise">
          <div class="ui-chrome"><i></i><i></i><i></i><span>${headline}</span></div>
          <div class="ui-body">${lines}</div>
        </div>
      </div>`;
    }

    case 'stick_figure':
      return `
<div class="stage center">
  <svg class="stick" viewBox="0 0 200 200" width="46%" aria-hidden="true">
    <g stroke="${brand.fg}" stroke-width="5" stroke-linecap="round" fill="none">
      <circle cx="100" cy="45" r="22" class="draw" style="animation-delay:.1s"/>
      <line x1="100" y1="67" x2="100" y2="130" class="draw" style="animation-delay:.45s"/>
      <line x1="100" y1="85" x2="62"  y2="112" class="draw arm-l" style="animation-delay:.7s"/>
      <line x1="100" y1="85" x2="138" y2="112" class="draw arm-r" style="animation-delay:.7s"/>
      <line x1="100" y1="130" x2="72"  y2="180" class="draw" style="animation-delay:.95s"/>
      <line x1="100" y1="130" x2="128" y2="180" class="draw" style="animation-delay:.95s"/>
    </g>
  </svg>
  ${headline ? `<p class="rise" style="animation-delay:1.2s">${headline}</p>` : ''}
</div>`;

    default:
      return `<div class="stage center"><h1 class="rise">${headline}</h1></div>`;
  }
}

/** Full standalone HTML document for one scene. */
function sceneHtml(scene, opts = {}) {
  const width = opts.width || 1080;
  const height = opts.height || 1350;
  const brand = { ...DEFAULT_BRAND, ...(opts.brand || {}) };
  const caption = scene.caption ? escapeHtml(scene.caption) : '';

  // Type scale is derived from frame height so one template serves 1080x1350,
  // 1080x1920 and 1920x1080 without a separate design per aspect.
  const unit = height / 100;

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>${escapeHtml(scene.id || 'scene')}</title>
<style>
  *{box-sizing:border-box}
  html,body{margin:0;padding:0;width:${width}px;height:${height}px;overflow:hidden;
    background:${brand.bg};color:${brand.fg};font-family:${brand.font};
    -webkit-font-smoothing:antialiased}
  .stage{position:absolute;inset:0;display:flex;flex-direction:column;gap:${unit * 1.6}px}
  .center{align-items:center;justify-content:center;text-align:center;padding:${unit * 8}px}
  .pad{justify-content:center;padding:${unit * 7}px}
  .lower{justify-content:flex-end;padding:${unit * 6}px}
  h1{font-size:${unit * 7.2}px;line-height:1.08;margin:0;letter-spacing:-.02em;font-weight:800}
  h2{font-size:${unit * 4.6}px;line-height:1.1;margin:0 0 ${unit * 3}px;font-weight:700}
  p{font-size:${unit * 3.1}px;line-height:1.35;margin:0;max-width:78%}
  .muted{color:${brand.muted}}
  .rule{width:${unit * 9}px;height:${unit * 0.7}px;background:${brand.accent};border-radius:99px;
    transform-origin:left center;animation:grow .6s cubic-bezier(.2,.7,.2,1) both}
  .rise{animation:rise .7s cubic-bezier(.2,.7,.2,1) both}
  @keyframes rise{from{opacity:0;transform:translateY(${unit * 2.4}px)}to{opacity:1;transform:none}}
  @keyframes grow{from{opacity:0;transform:scaleX(0)}to{opacity:1;transform:none}}

  .kinetic{display:flex;flex-wrap:wrap;gap:0 ${unit * 1.4}px;justify-content:center}
  .word{display:inline-block;animation:rise .55s cubic-bezier(.2,.7,.2,1) both}

  .lt{display:flex;gap:${unit * 2}px;align-items:stretch}
  .lt-bar{width:${unit * 0.9}px;background:${brand.accent};border-radius:99px;
    transform-origin:bottom;animation:growY .5s cubic-bezier(.2,.7,.2,1) both}
  @keyframes growY{from{opacity:0;transform:scaleY(0)}to{opacity:1;transform:none}}
  .lt-title{font-size:${unit * 4}px;font-weight:800}
  .lt-sub{font-size:${unit * 2.4}px;margin-top:${unit * .6}px}

  .sting{font-size:${unit * 9}px;font-weight:900;letter-spacing:-.03em;
    animation:sting .9s cubic-bezier(.2,.8,.2,1) both}
  @keyframes sting{from{opacity:0;transform:scale(.86)}60%{opacity:1;transform:scale(1.02)}to{opacity:1;transform:scale(1)}}
  .sting-ring{position:absolute;width:${unit * 40}px;height:${unit * 40}px;border-radius:50%;
    border:${unit * .4}px solid ${brand.accent};opacity:0;animation:ring 1.4s ease-out .25s both}
  @keyframes ring{from{opacity:.75;transform:scale(.5)}to{opacity:0;transform:scale(1.35)}}

  .chart{display:flex;flex-direction:column;gap:${unit * 1.8}px;width:100%}
  .bar-row{display:grid;grid-template-columns:26% 1fr auto;gap:${unit * 1.6}px;align-items:center}
  .bar-label{font-size:${unit * 2.3}px;color:${brand.muted};text-align:right}
  .bar-track{height:${unit * 3.2}px;background:rgba(255,255,255,.07);border-radius:99px;overflow:hidden}
  .bar-fill{height:100%;width:var(--pct);background:${brand.accent};border-radius:99px;
    transform-origin:left;animation:growX .8s cubic-bezier(.2,.7,.2,1) both}
  @keyframes growX{from{transform:scaleX(0)}to{transform:scaleX(1)}}
  .bar-value{font-size:${unit * 2.4}px;font-weight:700;font-variant-numeric:tabular-nums}

  .ui-window{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);
    border-radius:${unit * 1.4}px;overflow:hidden}
  .ui-chrome{display:flex;align-items:center;gap:${unit * .8}px;padding:${unit * 1.4}px ${unit * 2}px;
    background:rgba(255,255,255,.05);font-size:${unit * 1.9}px;color:${brand.muted}}
  .ui-chrome i{width:${unit * 1.1}px;height:${unit * 1.1}px;border-radius:50%;background:rgba(255,255,255,.2)}
  .ui-chrome span{margin-left:${unit * 1.2}px}
  .ui-body{padding:${unit * 2.4}px;display:flex;flex-direction:column;gap:${unit * 1.6}px}
  .ui-row{display:flex;align-items:center;gap:${unit * 1.4}px}
  .ui-dot{width:${unit * 2.2}px;height:${unit * 2.2}px;border-radius:${unit * .6}px;background:${brand.accent};flex:none}
  .ui-line{font-size:${unit * 2.3}px;color:${brand.fg}}

  .stick .draw{stroke-dasharray:220;stroke-dashoffset:220;animation:draw .5s ease forwards}
  @keyframes draw{to{stroke-dashoffset:0}}

  .caption{position:absolute;left:6%;right:6%;bottom:${unit * 6}px;text-align:center;
    font-size:${unit * 2.6}px;font-weight:600;line-height:1.3;
    text-shadow:0 ${unit * .2}px ${unit * .8}px rgba(0,0,0,.7)}
</style></head>
<body>
${sceneBody(scene, brand)}
${caption ? `<div class="caption">${caption}</div>` : ''}
<script>
  // Deterministic seek. The capture harness passes ?t=<seconds>; every animation
  // is paused and moved to that exact time, so frame N never depends on how long
  // the browser took to start. Without this, slow cold starts silently drop the
  // first frames of every scene.
  (function () {
    var t = parseFloat(new URLSearchParams(location.search).get('t') || '0');
    var seek = function () {
      document.getAnimations().forEach(function (a) {
        try { a.pause(); a.currentTime = t * 1000; } catch (e) { /* finished animation */ }
      });
      document.documentElement.setAttribute('data-seeked', String(t));
    };
    seek();
    document.addEventListener('DOMContentLoaded', seek);
  })();
</script>
</body></html>`;
}

/** Capture one scene to a directory of PNG frames. */
function renderFrames(scene, outDir, opts = {}) {
  const chromium = opts.chromium || findChromium();
  if (!chromium) {
    return { ok: false, reason: 'no Chromium found; set VIDEO_CHROMIUM_PATH', frames: [] };
  }

  const fps = opts.fps || DEFAULT_FPS;
  const width = opts.width || 1080;
  const height = opts.height || 1350;
  const duration = Number(scene.duration_seconds) || 4;
  const frameCount = Math.max(1, Math.round(duration * fps));

  fs.mkdirSync(outDir, { recursive: true });
  const htmlPath = path.join(outDir, 'scene.html');
  fs.writeFileSync(htmlPath, sceneHtml(scene, { width, height, brand: opts.brand }), 'utf8');

  const frames = [];
  for (let i = 0; i < frameCount; i += 1) {
    const t = i / fps;
    const framePath = path.join(outDir, `frame-${String(i).padStart(5, '0')}.png`);
    // Resume support: an existing frame is trusted, so a killed render restarts
    // where it stopped rather than re-shooting the whole scene.
    if (opts.resume && fs.existsSync(framePath)) {
      frames.push(framePath);
      continue;
    }
    try {
      execFileSync(
        chromium,
        [
          '--headless', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
          '--force-device-scale-factor=1',
          `--window-size=${width},${height}`,
          // A small virtual-time budget lets layout and fonts settle without
          // advancing the (already seeked) animation clock in real time.
          '--virtual-time-budget=250',
          `--screenshot=${framePath}`,
          `file://${htmlPath}?t=${t.toFixed(4)}`,
        ],
        { stdio: 'ignore', timeout: opts.frameTimeoutMs || 30000 }
      );
    } catch (err) {
      return { ok: false, reason: `chromium failed on frame ${i}: ${err.message}`, frames };
    }
    if (!fs.existsSync(framePath)) {
      return { ok: false, reason: `chromium produced no output for frame ${i}`, frames };
    }
    frames.push(framePath);
  }

  return { ok: true, frames, htmlPath, fps, width, height, frameCount, durationSeconds: duration };
}

module.exports = {
  DEFAULT_BRAND, DEFAULT_FPS,
  findChromium, sceneHtml, sceneBody, renderFrames, escapeHtml,
};
