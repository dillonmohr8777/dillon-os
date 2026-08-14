const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { encode, encodeSvg, sizeOf } = require('../lib/qr');
const { mailPieceHtml } = require('../lib/mail-piece');
const { gatekeepHtml, trackedUrl } = require('../lib/gatekeep');
const { emitSheets } = require('../lib/sheet');
const { emptyLedger, recordEvent } = require('../lib/ledger');
const { approveBatch } = require('../lib/approval');
const { loadJesse238, summarize } = require('../lib/jesse-238');
const { runEngine } = require('../lib/pipeline');

describe('QR encoder', () => {
  it('builds a versioned matrix with finder patterns', () => {
    const q = encode('https://example.com/gate/demo/?utm_source=directmail');
    assert.equal(q.size, sizeOf(q.version));
    assert.equal(q.modules[0][0], true);
    assert.equal(q.modules[6][0], true);
    assert.equal(q.modules[0][6], true);
    const svg = encodeSvg('https://example.com/a').svg;
    assert.match(svg, /<svg /);
    assert.match(svg, /<path /);
  });

  it('different payloads produce different drawings', () => {
    const a = encodeSvg('https://example.com/one').svg;
    const b = encodeSvg('https://example.com/two').svg;
    assert.notEqual(a, b);
  });
});

describe('jesse-238 fixture', () => {
  it('loads 238 public-safe rows with no phones or emails', () => {
    const pack = loadJesse238();
    assert.equal(pack.count, 238);
    const stats = summarize(pack);
    assert.equal(stats.with_email, 71);
    const blob = JSON.stringify(pack.prospects);
    assert.equal(/\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b/.test(blob), false);
    assert.equal(/@/.test(blob), false);
    assert.ok(pack.prospects[0].live_site.startsWith('https://'));
    assert.ok(pack.prospects.every((p) => p.mail_ready === 'hold'));
  });
});

describe('activate + approval fail-closed', () => {
  it('builds QR, gate, mail, sheets and never flips mail_ready', async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'oe-'));
    const summary = await runEngine({
      source: 'jesse-238',
      count: 3,
      batchDir: root,
      batchId: 'jesse-238-test',
      quiet: true,
    });
    assert.equal(summary.count, 3);
    assert.equal(summary.mailReadyAlwaysHold, true);
    assert.equal(summary.qaReadyCount, 3);
    const prospects = fs.readFileSync(path.join(root, 'prospects.csv'), 'utf8');
    assert.match(prospects, /mail_ready/);
    assert.ok(prospects.split('\n').slice(1).every((line) => /,hold,/.test(line) || !line));
    assert.ok(fs.existsSync(path.join(root, 'index.html')));
    assert.ok(fs.existsSync(path.join(root, 'zapier.csv')));
    assert.ok(fs.existsSync(path.join(root, 'qrtiger.csv')));
    assert.ok(fs.existsSync(path.join(root, 'results.md')));
    const slug = JSON.parse(fs.readFileSync(path.join(root, 'engine-summary.json'), 'utf8'));
    assert.equal(slug.ok, true);

    assert.throws(() => approveBatch(root, { approver: 'automation', prospects: ['J238-001'] }));
    const rec = approveBatch(root, { approver: 'Mac Frederick', prospects: ['J238-001'] });
    assert.equal(rec.approved, true);
    const after = fs.readFileSync(path.join(root, 'prospects.csv'), 'utf8');
    assert.match(after, /J238-001.*ready/);
  });
});

describe('ledger and copy', () => {
  it('records scans and calls without inventing revenue', () => {
    const ledger = emptyLedger({ id: 'x', hypothesis: 'test' });
    recordEvent(ledger, { type: 'scan', prospect_id: 'J238-001', vertical: 'HVAC' });
    recordEvent(ledger, { type: 'call_booked', prospect_id: 'J238-001', vertical: 'HVAC' });
    assert.equal(ledger.scans, 1);
    assert.equal(ledger.calls_booked, 1);
    assert.equal(ledger.revenue, 0);
  });

  it('mail and gate pages stay noindex and held', () => {
    const mail = mailPieceHtml({ business_name: 'Demo Co', prospect_id: 'D1', qrSvg: '<svg></svg>' });
    assert.match(mail, /mail_ready = hold/);
    const gate = gatekeepHtml({ business_name: 'Demo Co', prospect_id: 'D1', batch_id: 'b', live_site: 'https://example.com' });
    assert.match(gate, /noindex/);
    assert.match(trackedUrl('https://hub.example', 'demo-co', 'b', 'D1'), /utm_medium=qr/);
    const sheets = emitSheets(
      [{ prospect_id: 'D1', business_name: 'Demo Co', qr_target_url: 'https://x', qa_ready: 'ready' }],
      { id: 'b' }
    );
    assert.match(sheets.zapier, /mail_ready/);
    assert.match(sheets.zapier, /hold/);
  });
});
