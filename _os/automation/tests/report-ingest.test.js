'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const {
  isWithin,
  validateReportEnvelope,
  renderReportNote,
} = require('../lib/reports');

function fixture() {
  return {
    batch_id: 'REPORTS-2026-08-03-TEST',
    generated_at: '2026-08-03T14:00:00Z',
    reports: [{
      report_id: 'client-july-2026',
      cadence: 'monthly',
      title: 'Client July 2026 report',
      period_start: '2026-07-01',
      period_end: '2026-07-31',
      client: {
        id: 'client',
        name: 'Client',
        vault_note: '01_Clients/Client/overview.md',
      },
      artifact: { path: 'C:/approved/report.pdf' },
      verification_status: 'verified',
    }],
  };
}

test('report envelope accepts exact weekly and monthly routes only', () => {
  assert.equal(validateReportEnvelope(fixture()).ok, true);
  const invalid = fixture();
  invalid.reports[0].cadence = 'daily';
  assert.equal(validateReportEnvelope(invalid).ok, false);
});

test('report client note cannot escape the vault', () => {
  const invalid = fixture();
  invalid.reports[0].client.vault_note = '../outside.md';
  assert.equal(validateReportEnvelope(invalid).ok, false);
});

test('approved source root check rejects sibling prefixes and traversal', () => {
  const root = path.resolve('C:/approved/reports');
  assert.equal(isWithin(root, path.resolve(root, 'client/report.pdf')), true);
  assert.equal(isWithin(root, path.resolve('C:/approved/reports-evil/report.pdf')), false);
});

test('report review is connected to brain, archive, reporting, and client hubs', () => {
  const note = renderReportNote({
    report_id: 'client-july-2026',
    title: 'Client July 2026 report',
    cadence: 'monthly',
    period_start: '2026-07-01',
    period_end: '2026-07-31',
    generated_at: '2026-08-03T14:00:00Z',
    client_id: 'client',
    client_name: 'Client',
    client_note: '01_Clients/Client/overview.md',
    canonical_source: 'C:/approved/report.pdf',
    archived_artifact: '12_Brain/01_Captures/Reports/2026-07/client/client-july-2026.pdf',
    artifact_sha256: 'a'.repeat(64),
    verification_status: 'verified',
    delivery_status: 'not-recorded',
    source_refs: [],
    summary: '',
    ingested_on: '2026-08-03',
  });
  assert.match(note, /\[\[12_Brain\/00_Home\|Brain Home\]\]/);
  assert.match(note, /\[\[12_Brain\/07_Reviews\/Reports\/README\|Report Archive\]\]/);
  assert.match(note, /\[\[01_Clients\/Client\/overview\|Client\]\]/);
  assert.match(note, /obsidian:\/\/open\?vault=dillon-os&file=/);
  assert.doesNotMatch(note, /\[\[12_Brain\/01_Captures\/Reports\//);
});
