'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { parseCsv, buildDirectMailPlan } = require('../lib/direct-mail');

test('direct-mail CSV parser preserves quoted commas and quotes', () => {
  const rows = parseCsv(
    'prospect_id,business,address,qr_target_url,qa_ready,mail_ready\n' +
      'P001,"Mohr ""Test"", LLC","123 Main St, Philadelphia, PA",https://example.test,ready,hold\n'
  );
  assert.equal(rows.length, 1);
  assert.equal(rows[0].business, 'Mohr "Test", LLC');
  assert.equal(rows[0].address, '123 Main St, Philadelphia, PA');
});

test('direct-mail plan permits test preview but never authorizes live send', () => {
  const plan = buildDirectMailPlan([
    {
      prospect_id: 'P001',
      business: 'Fixture LLC',
      address: '123 Main St',
      qr_target_url: 'https://example.test/?utm_content=P001',
      qa_ready: 'ready',
      mail_ready: 'hold',
    },
  ]);
  assert.equal(plan.test_preview_eligible, 1);
  assert.equal(plan.live_send_authorized, false);
  assert.equal(plan.external_action_performed, false);
  assert.equal(plan.prospects[0].live_send_eligible, false);
});

test('direct-mail plan holds rows missing QA, address, QR, or safe mail state', () => {
  const plan = buildDirectMailPlan([
    {
      prospect_id: 'P002',
      business: 'Held LLC',
      address: '',
      qr_target_url: '',
      qa_ready: 'hold',
      mail_ready: 'ready',
    },
  ]);
  assert.equal(plan.test_preview_eligible, 0);
  assert.deepEqual(plan.prospects[0].issues, [
    'qa_not_ready',
    'address_missing',
    'qr_target_missing',
    'mail_ready_must_remain_hold',
  ]);
});

test('direct-mail plan calculates a bounded estimate when unit cost is supplied', () => {
  const rows = ['1', '2'].map((id) => ({
    prospect_id: id,
    business: `Fixture ${id}`,
    address: `${id} Main St`,
    qr_target_url: `https://example.test/${id}`,
    qa_ready: 'ready',
    mail_ready: 'hold',
  }));
  const plan = buildDirectMailPlan(rows, { unitCost: '0.95' });
  assert.equal(plan.estimated_cost, 1.9);
});
