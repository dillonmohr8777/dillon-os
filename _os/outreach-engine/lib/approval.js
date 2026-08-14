/**
 * Fail-closed mail approval. Automation may never set mail_ready=ready.
 * Only an explicit approver name plus prospect ids may flip rows.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { csv, csvCell } = require('./sheet');

function parseCsv(text) {
  const lines = text.trim().split('\n');
  const parseLine = (l) => {
    const out = [];
    let cur = '';
    let q = false;
    for (let i = 0; i < l.length; i++) {
      const c = l[i];
      if (q) {
        if (c === '"' && l[i + 1] === '"') {
          cur += '"';
          i++;
        } else if (c === '"') q = false;
        else cur += c;
      } else if (c === '"') q = true;
      else if (c === ',') {
        out.push(cur);
        cur = '';
      } else cur += c;
    }
    out.push(cur);
    return out;
  };
  const header = parseLine(lines[0]);
  return lines.slice(1).map((l) => {
    const cols = parseLine(l);
    const row = {};
    header.forEach((h, i) => {
      row[h] = cols[i];
    });
    return row;
  });
}

function approveBatch(batchDir, opts) {
  const approver = String(opts.approver || '').trim();
  if (!approver) throw new Error('approver is required');
  if (approver === 'automation' || approver === 'engine') {
    throw new Error('approver must be a human name');
  }
  const ids = new Set((opts.prospects || []).map(String));
  if (!ids.size) throw new Error('at least one prospect_id is required');

  const file = path.join(batchDir, 'prospects.csv');
  if (!fs.existsSync(file)) throw new Error('prospects.csv missing');
  const rows = parseCsv(fs.readFileSync(file, 'utf8'));
  const now = new Date().toISOString();
  let flipped = 0;
  for (const row of rows) {
    if (!ids.has(row.prospect_id)) continue;
    if (row.qa_ready !== 'ready') {
      throw new Error(`${row.prospect_id} is not qa_ready; cannot flip mail_ready`);
    }
    row.mail_ready = 'ready';
    row.approved_by = approver;
    row.approved_at = now;
    flipped += 1;
  }
  if (flipped !== ids.size) {
    throw new Error(`approval matched ${flipped} of ${ids.size} ids`);
  }
  const header = Object.keys(rows[0]);
  fs.writeFileSync(file, csv(header, rows));
  const record = {
    approved: true,
    approved_by: approver,
    approved_at: now,
    prospect_ids: [...ids],
    mail_ready: 'ready',
  };
  fs.writeFileSync(path.join(batchDir, 'approval.json'), JSON.stringify(record, null, 2) + '\n');
  return record;
}

module.exports = { approveBatch, parseCsv, csvCell };
