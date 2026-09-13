import { chromium } from 'playwright';
import fs from 'node:fs';

const OUT = '/tmp/claude-0/-home-user/a6c90d98-413c-5bfd-b5d7-b94d53309c04/scratchpad/shots';
fs.mkdirSync(OUT, { recursive: true });

const TARGET = process.env.TARGET || 'http://localhost:4173/';
const TAG = process.env.TAG || 'v2';
const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 834, height: 1112 },
  { name: 'mobile', width: 390, height: 844 }
];

const report = { target: TARGET, tag: TAG, viewports: [], console: [], failedRequests: [] };

const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox']
});

for (const vp of VIEWPORTS) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
    reducedMotion: process.env.REDUCED === '1' ? 'reduce' : 'no-preference'
  });
  const page = await context.newPage();

  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') {
      report.console.push({ vp: vp.name, type: m.type(), text: m.text().slice(0, 300) });
    }
  });
  page.on('pageerror', (e) => report.console.push({ vp: vp.name, type: 'pageerror', text: String(e).slice(0, 300) }));
  page.on('requestfailed', (r) => report.failedRequests.push({ vp: vp.name, url: r.url(), err: r.failure()?.errorText }));
  page.on('response', (r) => {
    if (r.status() >= 400) report.failedRequests.push({ vp: vp.name, url: r.url(), status: r.status() });
  });

  await page.goto(TARGET, { waitUntil: 'networkidle', timeout: 60000 });

  // The page sets scroll-behavior: smooth. Left on, every scrollTo below
  // animates, and screenshots land mid-flight: half-faded reveals and
  // un-rasterized compositor gaps that look like layout bugs but are not.
  await page.addStyleTag({ content: 'html { scroll-behavior: auto !important; }' });

  // Let the particle field build its point cloud and the fonts settle.
  await page.waitForTimeout(5500);

  const suffix = process.env.REDUCED === '1' ? '-reduced' : '';
  await page.screenshot({ path: `${OUT}/${TAG}-${vp.name}${suffix}-top.png` });

  // Horizontal overflow is the classic responsive failure.
  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    bodyScroll: document.body.scrollWidth
  }));

  // Walk the page so scroll-driven sections actually run.
  const full = await page.evaluate(() => document.documentElement.scrollHeight);
  const steps = 9;
  for (let i = 1; i <= steps; i += 1) {
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), Math.round((full / steps) * i));
    // Long enough for reveals (0.86s) to finish before the shutter.
    await page.waitForTimeout(1200);
    if (i === 3 || i === 5 || i === 7) {
      await page.screenshot({ path: `${OUT}/${TAG}-${vp.name}${suffix}-scroll${i}.png` });
    }
  }
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/${TAG}-${vp.name}${suffix}-bottom.png` });

  const overflowAfter = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth
  }));

  // Copy audit: pull every visible text node for a verbatim diff vs v1.
  const text = await page.evaluate(() => {
    const skip = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT']);
    const out = [];
    const walk = (node) => {
      if (node.nodeType === 3) {
        const t = node.textContent.replace(/\s+/g, ' ').trim();
        if (t) out.push(t);
        return;
      }
      if (node.nodeType !== 1 || skip.has(node.tagName)) return;
      for (const child of node.childNodes) walk(child);
    };
    walk(document.body);
    return out;
  });

  /* Scrollwidth alone is not enough. Sections here set overflow:hidden, so
     content that runs past the viewport is CLIPPED rather than scrollable and
     document.scrollWidth stays clean while text is silently sliced off. This
     walks the tree for boxes whose right edge escapes the viewport. Marquees
     are deliberately wider than the screen and are excluded by name. */
  const clipped = await page.evaluate(() => {
    const allowed = ['signal-hero__ticker-run', 'signal-rail', 'signal-particle-spine'];
    const out = [];
    for (const el of document.querySelectorAll('body *')) {
      if (allowed.some((c) => el.classList.contains(c))) continue;
      if (el.closest('.signal-hero__ticker, .signal-rail')) continue;
      if (el.closest('[aria-hidden="true"]')) continue;
      const style = getComputedStyle(el);
      if (style.position === 'fixed' || style.visibility === 'hidden' || style.display === 'none') continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      // Only boxes that actually carry copy matter. Glows, lenses and wipes
      // are deliberately larger than the viewport and bleed by design.
      const ownText = [...el.childNodes]
        .filter((n) => n.nodeType === 3)
        .map((n) => n.textContent.trim())
        .join('');
      if (!ownText) continue;
      const spill = Math.round(r.right - document.documentElement.clientWidth);
      if (spill > 2) {
        out.push({
          tag: el.tagName.toLowerCase(),
          cls: (el.className || '').toString().slice(0, 60),
          spill,
          text: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 50)
        });
      }
    }
    return out;
  });

  const canvases = await page.evaluate(() => document.querySelectorAll('canvas').length);
  const imgsMissingDims = await page.evaluate(() =>
    [...document.querySelectorAll('img')].filter((i) => !i.getAttribute('width') || !i.getAttribute('height')).map((i) => i.src)
  );
  const imgsMissingAlt = await page.evaluate(() =>
    [...document.querySelectorAll('img')].filter((i) => !i.hasAttribute('alt')).map((i) => i.src)
  );

  report.viewports.push({
    ...vp,
    overflow,
    overflowAfter,
    horizontalOverflow: overflow.scrollWidth > overflow.clientWidth + 1,
    clipped,
    canvases,
    imgsMissingDims,
    imgsMissingAlt,
    textCount: text.length,
    text
  });

  fs.writeFileSync(`${OUT}/${TAG}-${vp.name}${suffix}-text.json`, JSON.stringify(text, null, 2));
  await context.close();
}

await browser.close();
fs.writeFileSync(`${OUT}/${TAG}${process.env.REDUCED === '1' ? '-reduced' : ''}-report.json`, JSON.stringify(report, null, 2));

console.log('=== ' + TAG + (process.env.REDUCED === '1' ? ' (reduced motion)' : '') + ' ===');
for (const v of report.viewports) {
  console.log(`${v.name} ${v.width}x${v.height}: overflow=${v.horizontalOverflow} (${v.overflow.scrollWidth}/${v.overflow.clientWidth}) clipped=${v.clipped.length} canvases=${v.canvases} textNodes=${v.textCount} imgsNoDims=${v.imgsMissingDims.length} imgsNoAlt=${v.imgsMissingAlt.length}`);
  for (const c of v.clipped.slice(0, 6)) {
    console.log(`    CLIPPED +${c.spill}px  <${c.tag} class="${c.cls}">  "${c.text}"`);
  }
}
console.log('console errors/warnings:', report.console.length);
for (const c of report.console.slice(0, 12)) console.log(`  [${c.vp}] ${c.type}: ${c.text}`);
console.log('failed requests:', report.failedRequests.length);
for (const f of report.failedRequests.slice(0, 12)) console.log(`  [${f.vp}] ${f.status || f.err} ${f.url}`);
