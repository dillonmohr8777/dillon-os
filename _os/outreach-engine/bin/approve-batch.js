#!/usr/bin/env node
/**
 * Explicit human approval. The only way mail_ready becomes ready.
 *
 *   node _os/outreach-engine/bin/approve-batch.js <batch-dir> --approver "Mac Frederick" --prospects J238-001,J238-002
 */
'use strict';

const { approveBatch } = require('../lib/approval');

function parseArgs(argv) {
  const out = { dir: null, approver: '', prospects: [] };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--approver') out.approver = argv[++i];
    else if (a === '--prospects') out.prospects = String(argv[++i] || '').split(',').map((s) => s.trim()).filter(Boolean);
    else if (!a.startsWith('-')) out.dir = a;
  }
  return out;
}

try {
  const opts = parseArgs(process.argv);
  if (!opts.dir) throw new Error('batch directory required');
  const record = approveBatch(opts.dir, opts);
  console.log(`approved ${record.prospect_ids.length} rows by ${record.approved_by}`);
} catch (err) {
  console.error(err.message || err);
  process.exit(1);
}
