import { chromium } from 'playwright-core';
import { readFileSync } from 'fs';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
for (const [src,out] of [['assets/raw/dayforce.svg','assets/logos/dayforce-blue.png'],['assets/raw/dayforce-white.svg','assets/logos/dayforce-white.png']]) {
  const svg = readFileSync(src,'utf8').replace('<svg ','<svg width="1600" height="381" ');
  const p = await b.newPage({ viewport: { width: 1700, height: 500 } });
  await p.setContent(`<body style="margin:0;background:transparent">${svg}</body>`);
  await p.waitForTimeout(200);
  await p.locator('svg').screenshot({ path: out, omitBackground: true });
  await p.close();
}
await b.close(); console.log('done');
