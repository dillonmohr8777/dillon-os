#!/usr/bin/env node
'use strict';

const path = require('path');
const fs = require('fs');
const { loadConfig } = require('../lib/config.ts');
const { createStore, migrate, listMigrationTables } = require('../lib/store.ts');
const { createAdapters } = require('../lib/adapters.ts');
const { createServer } = require('../lib/web.ts');
const { runVerticalSlice, createCampaign } = require('../lib/pipeline.ts');

async function main() {
  const args = process.argv.slice(2);
  const cmd = args[0] || 'help';
  const cfg = loadConfig();

  if (cmd === 'migrate') {
    const result = await migrate(cfg.databaseUrl);
    console.log(JSON.stringify({ ...result, tables: listMigrationTables() }, null, 2));
    return;
  }

  if (cmd === 'slice') {
    const fixture = argValue(args, '--fixture') || 'cedar-ridge-hvac';
    const result = await runVerticalSlice({ fixtureName: fixture, reviewer: 'qa.reviewer' });
    const outDir = path.join(__dirname, '..', 'fixtures', fixture, 'output');
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'report.html'), result.report.html);
    fs.writeFileSync(path.join(outDir, 'funnel.json'), JSON.stringify(result.funnel, null, 2));
    fs.writeFileSync(path.join(outDir, 'slice-summary.json'), JSON.stringify({
      prospect: result.prospect.business_name,
      lifecycle: result.prospect.lifecycle,
      offer: result.offer.offer,
      scores: {
        site_quality_score: result.snapshot.site_quality_score,
        rebuild_opportunity: result.snapshot.rebuild_opportunity,
        selected_offer: result.snapshot.selected_offer,
      },
      report_url: result.report.reportUrl,
      pdf: result.report.pdf,
      crm_live: result.adaptersCalled.crmLive,
      email_sent: result.adaptersCalled.emailSent,
      network_outbound: result.network.outbound,
    }, null, 2));
    if (result.store.kind === 'postgres' && result.store.persistAll) await result.store.persistAll();
    console.log(JSON.stringify({
      ok: true,
      lifecycle: result.prospect.lifecycle,
      offer: result.offer.offer,
      report: path.relative(process.cwd(), path.join(outDir, 'report.html')),
      pdf: result.report.pdf.ok ? result.report.pdf.path : result.report.pdf.reason,
      revenue: result.funnel.revenue,
      live_crm: result.adaptersCalled.crmLive,
      outbound: result.network.outbound,
    }, null, 2));
    return;
  }

  if (cmd === 'serve') {
    const store = await createStore({ databaseUrl: cfg.databaseUrl });
    const adapters = createAdapters(cfg);
    const campaign = await createCampaign(store);
    const server = createServer({ store, adapters, campaign, cfg });
    await new Promise((resolve) => server.listen(cfg.port, cfg.host, resolve));
    console.log(JSON.stringify({ listen: `http://${cfg.host}:${cfg.port}`, killSwitch: cfg.killSwitch }, null, 2));
    return;
  }

  console.log(`Usage:
  node --experimental-strip-types _os/radar-engine/bin/radar-v2.js migrate
  node --experimental-strip-types _os/radar-engine/bin/radar-v2.js slice --fixture cedar-ridge-hvac
  node --experimental-strip-types _os/radar-engine/bin/radar-v2.js serve`);
}

function argValue(args, flag) {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : '';
}

main().catch((err) => {
  console.error(String(err && err.stack || err));
  process.exit(1);
});
