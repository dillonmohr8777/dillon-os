/**
 * Haoqi craft-word picker: honest hooks only.
 * Run: node --test _os/test/haoqi-craft-words.test.js
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pickWord, rankRadar } = require('../automation/lib/haoqi-craft-words');

const VAULT = path.resolve(__dirname, '..', '..');

describe('haoqi craft word picker', () => {
  it('gives dentists smile and skips HVAC', () => {
    assert.equal(pickWord({ business_name: 'Andorra Family Dentistry', vertical: 'dentist' }).word, 'smile');
    assert.equal(pickWord({ business_name: 'Jarman Sales & Service', vertical: 'hvac' }).skip, true);
  });

  it('does not treat beauty bar or Chicago Style as food/salon collisions', () => {
    assert.equal(pickWord({ business_name: 'Fanta C Beauty Bar', vertical: 'beauty' }).word, 'glow');
    assert.equal(pickWord({ business_name: 'UNO Chicago Style Pizza', vertical: 'restaurant' }).word, 'taste');
    assert.equal(pickWord({ business_name: 'The Juice Merchant', vertical: 'restaurant' }).word, 'sip');
  });

  it('keeps climbing and float as exact-trade words', () => {
    assert.equal(
      pickWord({ business_name: 'Go Vertical - Indoor Rock Climbing Gym', vertical: 'fitness-centre' }).word,
      'climb',
    );
    assert.equal(pickWord({ business_name: 'Sense Zero Float Center', vertical: 'beauty' }).word, 'float');
  });

  it('ranks the live registry to 100 without phones', () => {
    const registry = JSON.parse(fs.readFileSync(path.join(VAULT, '12_Brain/state/radar/registry.json'), 'utf8'));
    const report = rankRadar(registry.prospects, { limit: 100, perWord: 12, minQuality: 84 });
    assert.equal(report.scanned, 1042);
    assert.equal(report.top.length, 100);
    assert.ok(report.eligible >= 100);
    const words = new Set(report.top.map((r) => r.word));
    assert.equal(words.has('smile'), true);
    assert.equal(report.top.filter((r) => r.word === 'smile').length <= 18, true);
    const blob = JSON.stringify(report.top);
    assert.doesNotMatch(blob, /\b\d{3}[-.)]\d{3}[-.)]\d{4}\b/);
  });
});
