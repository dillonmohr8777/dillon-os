/**
 * Stage 8 Learn ledger. Every batch is a hypothesis.
 * Ingest scan / call_booked / mailed / closed / revenue without storing PII.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const EVENTS = new Set(['scan', 'call_booked', 'mailed', 'closed', 'no_answer', 'not_interested', 'wrong_number']);

function emptyLedger(batch) {
  return {
    batch_id: batch.id,
    created: new Date().toISOString().slice(0, 10),
    hypothesis: batch.hypothesis || 'QR + homepage + gatekeep books more calls than cold phone alone',
    mailed: 0,
    scans: 0,
    calls_booked: 0,
    closes: 0,
    revenue: 0,
    by_vertical: {},
    events: [],
  };
}

function loadLedger(batchDir) {
  const file = path.join(batchDir, 'results.json');
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function saveLedger(batchDir, ledger) {
  fs.writeFileSync(path.join(batchDir, 'results.json'), JSON.stringify(ledger, null, 2) + '\n');
  fs.writeFileSync(path.join(batchDir, 'results.md'), renderMarkdown(ledger));
  return ledger;
}

function recordEvent(ledger, event) {
  const type = String(event.type || '');
  if (!EVENTS.has(type)) throw new Error(`unknown event type: ${type}`);
  if (!event.prospect_id) throw new Error('prospect_id required');
  const row = {
    type,
    prospect_id: String(event.prospect_id),
    vertical: event.vertical || '',
    at: event.at || new Date().toISOString(),
    revenue: type === 'closed' ? Number(event.revenue || 0) : 0,
  };
  ledger.events.push(row);
  if (type === 'mailed') ledger.mailed += 1;
  if (type === 'scan') ledger.scans += 1;
  if (type === 'call_booked') ledger.calls_booked += 1;
  if (type === 'closed') {
    ledger.closes += 1;
    ledger.revenue += row.revenue;
  }
  const v = row.vertical || 'unspecified';
  ledger.by_vertical[v] = ledger.by_vertical[v] || { mailed: 0, scans: 0, calls_booked: 0, closes: 0, revenue: 0 };
  if (type === 'mailed') ledger.by_vertical[v].mailed += 1;
  if (type === 'scan') ledger.by_vertical[v].scans += 1;
  if (type === 'call_booked') ledger.by_vertical[v].calls_booked += 1;
  if (type === 'closed') {
    ledger.by_vertical[v].closes += 1;
    ledger.by_vertical[v].revenue += row.revenue;
  }
  return ledger;
}

function renderMarkdown(ledger) {
  const verts = Object.keys(ledger.by_vertical);
  return `---
tags: [campaign, results, ledger]
batch: ${ledger.batch_id}
generated: ${ledger.created}
---

# Results: ${ledger.batch_id}

Hypothesis: ${ledger.hypothesis}

| Mailed | Scans | Calls booked | Closes | Revenue |
|---:|---:|---:|---:|---:|
| ${ledger.mailed} | ${ledger.scans} | ${ledger.calls_booked} | ${ledger.closes} | ${ledger.revenue} |

## By vertical

${
  verts.length
    ? `| Vertical | Mailed | Scans | Calls | Closes | Revenue |
|---|---:|---:|---:|---:|---:|
${verts
  .map((v) => {
    const r = ledger.by_vertical[v];
    return `| ${v} | ${r.mailed} | ${r.scans} | ${r.calls_booked} | ${r.closes} | ${r.revenue} |`;
  })
  .join('\n')}`
    : '_No outcomes yet._'
}

Nothing here is outbound-ready. Events are logged after a human acts.
`;
}

module.exports = { EVENTS, emptyLedger, loadLedger, saveLedger, recordEvent, renderMarkdown };
