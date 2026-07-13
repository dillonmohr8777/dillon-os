import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: 1440, height: 2400 } });
await p.goto('file://' + process.cwd() + '/landing/index.html');
await p.waitForTimeout(1800);
await p.screenshot({ path: 'landing-preview.png', fullPage: true });
await b.close(); console.log('shot');
