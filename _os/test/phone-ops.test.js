/**
 * Phone operator: capture, Today toggles, queue lines.
 * Run: node --test _os/test/phone-ops.test.js
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const PhoneOps = require('../public/phone-ops');
const { scanText } = require('../public-safety');

const DASH = fs.readFileSync(path.resolve(__dirname, '..', '..', 'Dashboard.md'), 'utf8');

describe('phone operator helpers', () => {
  it('toggles a Today checkbox without eating other lines', () => {
    const done = PhoneOps.toggleDirective(DASH, 'Check inbox and process', true);
    assert.match(done, /- \[x\] Check inbox and process/);
    assert.match(done, /- \[ \] Review active campaigns/);
    const back = PhoneOps.toggleDirective(done, 'Check inbox and process', false);
    assert.match(back, /- \[ \] Check inbox and process/);
  });

  it('adds a Today line under the heading', () => {
    const next = PhoneOps.addDirective(DASH, 'Call Mac about mail vendor');
    assert.match(next, /## Today\n- \[ \] Call Mac about mail vendor\n/);
  });

  it('builds a public-safe inbox note and path', () => {
    const at = new Date('2026-08-14T20:00:00.000Z');
    const text = 'Follow up with Jesse on the 238 sheet';
    const rel = PhoneOps.inboxPath(text, at);
    const md = PhoneOps.inboxNote(text, at);
    assert.equal(rel, '00_Inbox/phone/2026-08-14-follow-up-with-jesse-on-the-238-sheet.md');
    assert.match(md, /source: dillon-os-phone/);
    assert.match(md, /Follow up with Jesse on the 238 sheet/);
    assert.deepEqual(scanText(md), []);
  });

  it('appends a skill queue line', () => {
    const q = PhoneOps.appendQueue('', 'plan-today', new Date('2026-08-14T20:00:00.000Z'));
    const row = JSON.parse(q.trim());
    assert.equal(row.automation_id, 'phone-hud');
    assert.equal(row.skill, 'plan-today');
    assert.equal(row.action, 'queue_skill');
  });

  it('refuses tel and mailto', () => {
    assert.throws(() => PhoneOps.assertNoContact('mailto:user@example.com'), /no calls/);
    assert.throws(() => PhoneOps.assertNoContact('tel:+15555550100'), /no calls/);
    assert.equal(PhoneOps.assertNoContact(PhoneOps.LINKS.sheet), PhoneOps.LINKS.sheet);
  });

  it('refuses to encode a PII capture as safe', () => {
    const md = PhoneOps.inboxNote('email me at user@example.com please', new Date());
    assert.ok(scanText(md).some((h) => h.id === 'email'));
  });
});
