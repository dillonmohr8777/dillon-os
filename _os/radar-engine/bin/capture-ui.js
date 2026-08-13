#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { runVerticalSlice } = require('../lib/pipeline.ts');
const { createServer, intakeForm, layout } = require('../lib/web.ts');
const { createAdapters } = require('../lib/adapters.ts');
const { escapeHtml } = require('../lib/redact.ts');
const { renderPdf } = require('../lib/reports.ts');

async function shot(page, file) {
  await page.screenshot({ path: file, fullPage: true });
}

async function main() {
  const outDir = path.join(__dirname, '..', 'fixtures', 'cedar-ridge-hvac', 'output');
  fs.mkdirSync(outDir, { recursive: true });
  const result = await runVerticalSlice({ fixtureName: 'cedar-ridge-hvac', reviewer: 'qa.reviewer' });
  fs.writeFileSync(path.join(outDir, 'report.html'), result.report.html);
  const pdfPath = path.join(outDir, 'report.pdf');
  const pdf = await renderPdf(result.report.html, pdfPath);
  const playwright = require('playwright');
  const browser = await playwright.chromium.launch({ headless: true });
  const cfg = { ...result.cfg, qaToken: 'qa-test-token', port: 4344 };
  const adapters = createAdapters(cfg);
  const server = createServer({ store: result.store, adapters, campaign: result.campaign, cfg });
  await new Promise((resolve) => server.listen(cfg.port, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${cfg.port}`;

  try {
    for (const width of [390, 1280]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      await page.setContent(result.report.html, { waitUntil: 'load' });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 4);
      await shot(page, path.join(outDir, `report-${width}.png`));
      await page.goto(`${origin}/intake`, { waitUntil: 'load' });
      await shot(page, path.join(outDir, `intake-${width}.png`));
      await page.goto(`${origin}/qa/${result.prospect.id}?token=${cfg.qaToken}`, { waitUntil: 'load' });
      await shot(page, path.join(outDir, `qa-${width}.png`));
      await page.goto(`${origin}/funnel?token=${cfg.qaToken}`, { waitUntil: 'load' });
      await shot(page, path.join(outDir, `funnel-${width}.png`));
      await page.close();
      fs.writeFileSync(path.join(outDir, `visual-${width}.json`), JSON.stringify({ width, overflow }, null, 2));
    }
  } finally {
    await browser.close();
    server.close();
  }

  console.log(JSON.stringify({
    pdf: pdf.ok ? pdf.path : pdf.reason,
    shots: fs.readdirSync(outDir).filter((f) => f.endsWith('.png')),
    lifecycle: result.prospect.lifecycle,
    offer: result.offer.offer,
  }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
