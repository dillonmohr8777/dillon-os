import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: 1700, height: 500 } });
await p.setContent(`<body style="margin:0;background:transparent"><img id="l" src="file:///home/user/dillon-os/02_FullTimeJob/AlignHCM/broker-video/assets/raw/beumer.svg" width="1600"></body>`);
await p.waitForTimeout(500);
await p.locator('#l').screenshot({ path: 'assets/raw/beumer.png', omitBackground: true });
await b.close();
