#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { runVerticalSlice, finishVerticalSlice } = require('../lib/pipeline.ts');
const { createServer } = require('../lib/web.ts');
const { createAdapters } = require('../lib/adapters.ts');
const { renderPdf } = require('../lib/reports.ts');

async function shot(page, file) {
  await page.screenshot({ path: file, fullPage: true });
}

async function main() {
  const outDir = path.join(__dirname, '..', 'fixtures', 'cedar-ridge-hvac', 'output');
  fs.mkdirSync(outDir, { recursive: true });
  const paused = await runVerticalSlice({ fixtureName: 'cedar-ridge-hvac', reviewer: 'qa.reviewer', pauseAt: 'qa_pending' });
  if (paused.prospect.lifecycle !== 'qa_pending') {
    throw new Error(`expected qa_pending, got ${paused.prospect.lifecycle}`);
  }
  fs.writeFileSync(path.join(outDir, 'report.html'), paused.report.html);
  const pdfPath = path.join(outDir, 'report.pdf');
  const pdf = await renderPdf(paused.report.html, pdfPath);

  const playwright = require('playwright');
  const browser = await playwright.chromium.launch({ headless: true });
  const cfg = { ...paused.cfg, qaToken: 'qa-test-token', port: 4344 };
  const adapters = createAdapters(cfg);
  const server = createServer({ store: paused.store, adapters, campaign: paused.campaign, cfg });
  await new Promise((resolve) => server.listen(cfg.port, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${cfg.port}`;

  try {
    for (const width of [390, 1280]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      await page.setContent(paused.report.html, { waitUntil: 'load' });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 4);
      await shot(page, path.join(outDir, `report-${width}.png`));
      await page.goto(`${origin}/intake`, { waitUntil: 'load' });
      await shot(page, path.join(outDir, `intake-${width}.png`));
      await page.goto(`${origin}/qa/${paused.prospect.id}?token=${cfg.qaToken}`, { waitUntil: 'load' });
      await shot(page, path.join(outDir, `qa-${width}.png`));
      await page.close();
      fs.writeFileSync(path.join(outDir, `visual-${width}.json`), JSON.stringify({ width, overflow, qaLifecycle: paused.prospect.lifecycle }, null, 2));
    }

    const result = await finishVerticalSlice(paused);
    for (const width of [390, 1280]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      await page.goto(`${origin}/funnel?token=${cfg.qaToken}`, { waitUntil: 'load' });
      await shot(page, path.join(outDir, `funnel-${width}.png`));
      await page.close();
    }
    fs.writeFileSync(path.join(outDir, 'funnel.json'), JSON.stringify(result.funnel, null, 2));
    fs.writeFileSync(path.join(outDir, 'slice-summary.json'), JSON.stringify({
      prospect: result.prospect.business_name,
      lifecycle: result.prospect.lifecycle,
      qa_lifecycle_at_screenshot: 'qa_pending',
      offer: result.offer.offer,
      scores: {
        site_quality_score: result.snapshot.site_quality_score,
        rebuild_opportunity: result.snapshot.rebuild_opportunity,
        selected_offer: result.snapshot.selected_offer,
      },
      report_url: result.report.reportUrl,
      pdf: pdf.ok ? { ok: true, path: pdf.path } : pdf,
      crm_live: result.adaptersCalled.crmLive,
      email_sent: result.adaptersCalled.emailSent,
      network_outbound: result.network.outbound,
    }, null, 2));
  } finally {
    await browser.close();
    server.close();
  }

  console.log(JSON.stringify({
    pdf: pdf.ok ? pdf.path : pdf.reason,
    shots: fs.readdirSync(outDir).filter((f) => f.endsWith('.png')),
    qa_lifecycle: 'qa_pending',
    final_lifecycle: 'won',
    offer: paused.offer.offer,
  }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
