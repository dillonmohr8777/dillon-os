import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport:{width:1920,height:1080} });
await p.goto('file://' + process.cwd() + '/index.html');
await p.evaluate(() => window.__ready);
const lines = await p.evaluate(() => {
  const out = [];
  document.querySelectorAll('#stage .scene, #stage .footer').forEach(s => {
    const txt = s.innerText.replace(/\s+/g, ' ').trim();
    if (txt) out.push([s.id || 'footer', txt]);
  });
  return out;
});
await b.close();
// The one hyphen we mean to ship. Everything else is still a failure.
const ALLOWED = ['Go-live', 'go-live'];

let bad = 0;
for (const [id, txt] of lines) {
  let scan = txt;
  for (const ok of ALLOWED) scan = scan.split(ok).join('');
  const hits = scan.match(/[-‐-―−]/g);
  console.log((hits ? 'DASH ' : '  ok ') + id.padEnd(6) + ' ' + txt);
  if (hits) bad++;
}
console.log(bad ? `\n${bad} scene(s) contain a dash` : '\nno dashes in any on screen copy');
