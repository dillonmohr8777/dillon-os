/* Grab stills at given timestamps.
 *
 *   node build/shot.mjs index.html build/shots 12.4 31.6
 *
 * The export class hides the live scrubber and the shot is of #stage, so a still
 * is the same 1920x1080 the renderer would produce rather than the browser page.
 */
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const [file, outdir, ...ts] = process.argv.slice(2);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
const errs = [];
p.on('pageerror', e => errs.push(String(e)));
await p.goto('file://' + (file.startsWith('/') ? file : process.cwd() + '/' + file));
await p.evaluate(() => { document.body.classList.add('export'); window.dispatchEvent(new Event('resize')); });
await p.evaluate(() => window.__ready);
for (const t of ts) {
  await p.evaluate(v => window.__seek(v), Number(t));
  await p.locator('#stage').screenshot({ path: `${outdir}/t${t}.png` });
}
await b.close();
console.log(errs.length ? 'ERRORS:\n' + errs.join('\n') : 'no page errors');
