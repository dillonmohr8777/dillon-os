/* =============================================================================
   checkfit.mjs · assert every scene's content sits inside the safe area
   -----------------------------------------------------------------------------
   The type is large enough that a long line of copy can silently run under the
   bottom rail or off the right edge. This walks each scene at its fully-revealed
   moment, measures the union of every visible text box, and reports anything
   outside the safe area.

     node checkfit.mjs align-in-motion.html
   ========================================================================== */
import { chromium } from 'playwright';
import path from 'node:path';

const page_file = process.argv[2];
if (!page_file) { console.error('usage: node checkfit.mjs <page.html>'); process.exit(1); }

/* 4px progress bar at the top, 42px rail at the bottom, plus a little air */
const SAFE = { top: 16, bottom: 1030, left: 24, right: 1896 };

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
await page.goto('file://' + path.join(path.resolve('.'), page_file) + '?capture=1', { waitUntil: 'load' });
await page.waitForFunction('window.__ready === true');
await page.evaluate(() => document.fonts.ready);

const scenes = await page.evaluate(() => window.__SCENES);
let bad = 0;

for (const s of scenes) {
  /* sample where everything has landed but the exit has not begun */
  const t = s.in + Math.min(s.dur * 0.62, s.dur - 0.75);
  await page.evaluate((tt) => window.__seek(tt), t);
  const r = await page.evaluate(() => {
    const sel = '.eyebrow,.headline,.sub,.caption,.li,.chip,.card,.bignum,.stars,' +
      '.lockup,.reel .row,.ehcm,.eurl,.ghost';
    let box = null;
    for (const n of document.querySelectorAll('.scene')) {
      if (n.style.display === 'none') continue;
      for (const e of n.querySelectorAll(sel)) {
        if (e.classList.contains('ghost')) continue;          // decorative, may bleed
        const o = parseFloat(getComputedStyle(e).opacity);
        if (!(o > 0.55)) continue;
        /* Measure text ink, not the box. A centred full-width paragraph has a
           1920px-wide box but short lines, and reporting the box produces false
           overflows on every centred element. A Range over the contents returns
           the union of the line boxes, which is what actually has to fit. */
        let b;
        const hasText = e.textContent.trim().length > 0;
        if (hasText) {
          const rg = document.createRange();
          rg.selectNodeContents(e);
          b = rg.getBoundingClientRect();
          rg.detach();
        }
        if (!b || b.width < 2) b = e.getBoundingClientRect();
        if (b.width < 2 || b.height < 2) continue;
        box = box
          ? { top: Math.min(box.top, b.top), bottom: Math.max(box.bottom, b.bottom),
              left: Math.min(box.left, b.left), right: Math.max(box.right, b.right) }
          : { top: b.top, bottom: b.bottom, left: b.left, right: b.right };
      }
    }
    return box;
  });
  if (!r) { console.log(`  ${s.kind.padEnd(10)} t=${t.toFixed(1)}  (nothing measurable)`); continue; }

  const errs = [];
  if (r.top < SAFE.top) errs.push(`top ${r.top.toFixed(0)} < ${SAFE.top}`);
  if (r.bottom > SAFE.bottom) errs.push(`bottom ${r.bottom.toFixed(0)} > ${SAFE.bottom}`);
  if (r.left < SAFE.left) errs.push(`left ${r.left.toFixed(0)} < ${SAFE.left}`);
  if (r.right > SAFE.right) errs.push(`right ${r.right.toFixed(0)} > ${SAFE.right}`);

  const tag = errs.length ? 'OVERFLOW' : 'ok';
  if (errs.length) bad++;
  console.log(
    `  ${tag.padEnd(9)} ${s.kind.padEnd(10)} t=${String(t.toFixed(1)).padStart(5)}  ` +
    `y ${r.top.toFixed(0)}..${r.bottom.toFixed(0)}  x ${r.left.toFixed(0)}..${r.right.toFixed(0)}` +
    (errs.length ? '   <- ' + errs.join(', ') : '')
  );
}

await browser.close();
console.log(bad ? `\n${bad} scene(s) overflow the safe area.` : '\nAll scenes fit.');
process.exit(bad ? 1 : 0);
