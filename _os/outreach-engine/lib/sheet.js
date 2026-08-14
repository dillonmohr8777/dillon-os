/**
 * Sheet-ready CSVs for Mac's Zapier contract.
 * QRTiger reads qr_target_url. PostGrid/StackAdapt read address + mail_ready.
 * Generated mail_ready is always hold.
 */
'use strict';

function csvCell(v) {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function csv(header, rows) {
  return [header.join(','), ...rows.map((r) => header.map((h) => csvCell(r[h])).join(','))].join('\n') + '\n';
}

function zapierRows(prospects, batch) {
  return prospects.map((p) => ({
    Platform: 'Direct Mail',
    Campaign: batch.id,
    Ad_Set: p.vertical || '',
    Name: '',
    Number: '',
    Email: '',
    Business: p.business_name || p.name || '',
    Website_other: p.live_site || p.qr_target_url || '',
    prospect_id: p.prospect_id,
    qr_target_url: p.qr_target_url || '',
    qa_ready: p.qa_ready || 'hold',
    mail_ready: 'hold',
    address: p.address || '',
    notes: p.notes || 'phones/emails stay in the Google Sheet; this repo is public',
  }));
}

function emitSheets(prospects, batch) {
  const zapier = csv(
    [
      'Platform',
      'Campaign',
      'Ad_Set',
      'Name',
      'Number',
      'Email',
      'Business',
      'Website_other',
      'prospect_id',
      'qr_target_url',
      'qa_ready',
      'mail_ready',
      'address',
      'notes',
    ],
    zapierRows(prospects, batch)
  );
  const qrtiger = csv(
    ['prospect_id', 'business', 'qr_target_url', 'mail_ready'],
    prospects.map((p) => ({
      prospect_id: p.prospect_id,
      business: p.business_name || p.name || '',
      qr_target_url: p.qr_target_url || '',
      mail_ready: 'hold',
    }))
  );
  const postgrid = csv(
    ['prospect_id', 'business', 'address', 'qr_target_url', 'mail_ready'],
    prospects.map((p) => ({
      prospect_id: p.prospect_id,
      business: p.business_name || p.name || '',
      address: p.address || '',
      qr_target_url: p.qr_target_url || '',
      mail_ready: 'hold',
    }))
  );
  return { zapier, qrtiger, postgrid };
}

module.exports = { csv, csvCell, emitSheets, zapierRows };
