import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const [pageArg, ...rest] = process.argv.slice(2);
const times = rest.map(Number);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
const errs = []; p.on('pageerror', e => errs.push(String(e)));
await p.goto('file://' + process.cwd() + '/' + pageArg + '.html');
await p.evaluate(() => { document.body.classList.add('export'); window.dispatchEvent(new Event('resize')); });
await p.evaluate(() => window.__ready);
for (const t of times) {
  await p.evaluate(t => window.__seek(t), t);
  await p.locator('#stage').screenshot({ path: `build/t_${pageArg}_${t.toFixed(2)}.png` });
}
await b.close();
console.log(errs.length ? 'ERRORS:\n' + errs.join('\n') : 'no page errors');
