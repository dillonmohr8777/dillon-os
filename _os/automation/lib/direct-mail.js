'use strict';

const crypto = require('node:crypto');

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;

  for (let i = 0; i < String(text).length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (quoted && char === '"' && next === '"') {
      cell += '"';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (!quoted && char === ',') {
      row.push(cell);
      cell = '';
    } else if (!quoted && (char === '\n' || char === '\r')) {
      if (char === '\r' && next === '\n') i += 1;
      row.push(cell);
      cell = '';
      if (row.some((value) => value !== '')) rows.push(row);
      row = [];
    } else {
      cell += char;
    }
  }

  if (cell !== '' || row.length) {
    row.push(cell);
    if (row.some((value) => value !== '')) rows.push(row);
  }

  if (!rows.length) return [];
  const headers = rows.shift().map((header) => header.trim());
  return rows.map((values) =>
    Object.fromEntries(headers.map((header, index) => [header, values[index] ?? '']))
  );
}

function fingerprint(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex').slice(0, 16);
}

function buildDirectMailPlan(rows, options = {}) {
  const vendor = String(options.vendor || 'postgrid').toLowerCase();
  if (vendor !== 'postgrid') {
    throw new Error('Only the selected PostGrid test-mode path is supported.');
  }

  const unitCost =
    options.unitCost === undefined || options.unitCost === null || options.unitCost === ''
      ? null
      : Number(options.unitCost);
  if (unitCost !== null && (!Number.isFinite(unitCost) || unitCost < 0)) {
    throw new Error('unitCost must be a non-negative number.');
  }

  const requiredColumns = [
    'prospect_id',
    'business',
    'address',
    'qr_target_url',
    'qa_ready',
    'mail_ready',
  ];
  const available = new Set(Object.keys(rows[0] || {}));
  const missingColumns = requiredColumns.filter((column) => !available.has(column));
  if (missingColumns.length) {
    throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
  }

  const prospects = rows.map((row) => {
    const issues = [];
    if (row.qa_ready !== 'ready') issues.push('qa_not_ready');
    if (!String(row.address || '').trim()) issues.push('address_missing');
    if (!String(row.qr_target_url || '').trim()) issues.push('qr_target_missing');
    if (row.mail_ready !== 'hold') issues.push('mail_ready_must_remain_hold');

    return {
      prospect_id: row.prospect_id,
      business: row.business,
      record_fingerprint: fingerprint(
        [row.prospect_id, row.business, row.address, row.qr_target_url].join('|')
      ),
      test_preview_eligible: issues.length === 0,
      live_send_eligible: false,
      issues,
    };
  });

  const testPreviewCount = prospects.filter((row) => row.test_preview_eligible).length;
  const estimate =
    unitCost === null ? null : Number((testPreviewCount * unitCost).toFixed(2));

  return {
    schema_version: 1,
    vendor: 'postgrid',
    mode: 'test-only',
    rows: rows.length,
    test_preview_eligible: testPreviewCount,
    held: rows.length - testPreviewCount,
    estimated_cost: estimate,
    unit_cost: unitCost,
    live_send_authorized: false,
    external_action_performed: false,
    production_gates: [
      'approved PostGrid live account and secret locator',
      'verified return address and creative proof',
      'exact approved prospect rows',
      'approved unit cost and total spend cap',
      'different maker and checker evidence',
      'explicit human approval for this exact batch',
    ],
    prospects,
  };
}

module.exports = { parseCsv, buildDirectMailPlan };
