#!/usr/bin/env node
/**
 * Stage 8 ingest. No PII.
 *
 *   node _os/outreach-engine/bin/record-results.js <batch-dir> --prospect J238-001 --event scan --vertical "HVAC"
 */
'use strict';

const { loadLedger, saveLedger, recordEvent, emptyLedger } = require('../lib/ledger');
const fs = require('fs');
const path = require('path');

function parseArgs(argv) {
  const out = { dir: null, prospect: '', event: '', vertical: '', revenue: 0 };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--prospect') out.prospect = argv[++i];
    else if (a === '--event') out.event = argv[++i];
    else if (a === '--vertical') out.vertical = argv[++i];
    else if (a === '--revenue') out.revenue = Number(argv[++i]);
    else if (!a.startsWith('-')) out.dir = a;
  }
  return out;
}

try {
  const opts = parseArgs(process.argv);
  if (!opts.dir) throw new Error('batch directory required');
  let ledger = loadLedger(opts.dir);
  if (!ledger) {
    const batch = JSON.parse(fs.readFileSync(path.join(opts.dir, 'batch.json'), 'utf8'));
    ledger = emptyLedger(batch);
  }
  recordEvent(ledger, {
    type: opts.event,
    prospect_id: opts.prospect,
    vertical: opts.vertical,
    revenue: opts.revenue,
  });
  saveLedger(opts.dir, ledger);
  console.log(`${opts.event} recorded for ${opts.prospect}`);
} catch (err) {
  console.error(err.message || err);
  process.exit(1);
}
