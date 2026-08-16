/**
 * Haoqi craft-word picker: two-word outcome lines.
 * Run: node --test _os/test/haoqi-craft-words.test.js
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  pickWord,
  skipReason,
  scoreProspect,
  rankRadar,
  topWords,
} = require('../automation/lib/haoqi-craft-words');

const VAULT = path.resolve(__dirname, '..', '..');

describe('haoqi craft word picker', () => {
  it('gives dentists smile more, not a treatment noun', () => {
    assert.equal(pickWord({ business_name: 'Andorra Family Dentistry', vertical: 'dentist' }).word, 'smile more');
    assert.equal(
      pickWord({ name: 'Andorra Family Dentistry', host: 'andorradental.com', notes: 'dentist' }).word,
      'smile more',
    );
  });

  it('unlocks HVAC as stay cool, not a catalog line', () => {
    assert.equal(pickWord({ business_name: 'Jarman Sales & Service', vertical: 'hvac' }).word, 'stay cool');
    assert.equal(
      pickWord({
        name: 'Jarman Sales & Service',
        host: 'jarmansalesandservice.com',
        notes: 'HVAC. window and wall units.',
      }).word,
      'stay cool',
    );
  });

  it('splits heat-only, mixed, and catalog HVAC', () => {
    assert.equal(
      pickWord({ name: 'Hearth & Home Heating', host: 'hearthheat.example', notes: 'furnace and boiler heating only' }).word,
      'stay warm',
    );
    assert.equal(
      pickWord({ name: 'Valley Air & Heat', host: 'valleyair.example', notes: 'heating and cooling' }).word,
      'breathe easy',
    );
    assert.match(
      skipReason({ name: 'Window Wall Depot', host: 'windowwall.example', notes: 'window and wall units' }),
      /catalog line/i,
    );
  });

  it('uses outcome verbs for vet, eye, spa, salon, food, gym', () => {
    assert.equal(pickWord({ business_name: 'Main Line Animal Hospital', vertical: 'veterinary' }).word, 'come home');
    assert.equal(pickWord({ business_name: 'King of Prussia Eye Associates', notes: 'optometry' }).word, 'see more');
    assert.equal(pickWord({ business_name: 'Fanta C Beauty Bar', vertical: 'beauty' }).word, 'glow up');
    assert.equal(pickWord({ business_name: 'Cut & Color Salon', notes: 'hair salon' }).word, 'fresh cut');
    assert.equal(pickWord({ business_name: 'UNO Chicago Style Pizza', vertical: 'restaurant' }).word, 'come hungry');
    assert.equal(pickWord({ business_name: 'The Juice Merchant', vertical: 'restaurant' }).word, 'sip more');
    assert.equal(
      pickWord({ business_name: 'Sprinkles Icecream', domain: 'sprinklesicecreamelkinspark.com', vertical: 'ice-cream' }).word,
      'one scoop',
    );
    assert.equal(pickWord({ business_name: 'Iron Temple Gym', notes: 'strength gym' }).word, 'go hard');
  });

  it('keeps climbing and float as exact-trade lines', () => {
    assert.equal(
      pickWord({ business_name: 'Go Vertical - Indoor Rock Climbing Gym', vertical: 'fitness-centre' }).word,
      'go up',
    );
    assert.equal(pickWord({ business_name: 'Sense Zero Float Center', vertical: 'beauty' }).word, 'sink in');
  });

  it('unlocks lawyers and roofing', () => {
    assert.equal(pickWord({ business_name: 'Harbor Injury Law', notes: 'personal injury attorney' }).word, 'your side');
    assert.equal(pickWord({ business_name: 'Peak Roofing', notes: 'roofing contractor' }).word, 'stay dry');
  });

  it('skips funeral, campus, tax, and IT', () => {
    assert.match(skipReason({ name: 'Oliver H. Bair', host: 'bair.example', notes: 'funeral home' }), /funeral/i);
    assert.match(
      skipReason({ name: 'Wistar Institute', host: 'wistar.org', notes: 'translational research' }),
      /campus/i,
    );
    assert.match(skipReason({ name: 'Liberty Tax', host: 'libertytax.example', notes: 'tax prep' }), /tax/i);
    assert.match(skipReason({ name: 'Main Line IT', host: 'mlit.example', notes: 'managed IT services' }), /it shop/i);
  });

  it('scored rows stay two words or fewer and lowercase', () => {
    const row = scoreProspect({
      name: 'Andorra Family Dentistry',
      host: 'andorradental.com',
      notes: 'dentist',
      opportunity: 78,
    });
    assert.equal(row.skip, false);
    assert.equal(row.word, 'smile more');
    assert.ok(row.word.split(/\s+/).length <= 2);
    assert.equal(row.word, row.word.toLowerCase());
  });

  it('topWords prefers smile more over smile', () => {
    const rows = topWords(
      [
        { name: 'Andorra Family Dentistry', host: 'andorradental.com', notes: 'dentist', opportunity: 78 },
        { name: 'King of Prussia Eye Associates', host: 'kopeye.example', notes: 'optometry', opportunity: 90 },
        { name: 'Main Line Animal Hospital', host: 'mvet.example', notes: 'veterinary', opportunity: 88 },
        { name: 'Jarman Sales & Service', host: 'jarman.example', notes: 'HVAC', opportunity: 82 },
      ],
      4,
    );
    const words = rows.map((row) => row.word);
    assert.ok(words.includes('smile more'));
    assert.ok(!words.includes('smile'));
    assert.ok(words.includes('stay cool'));
  });

  it('ranks the live registry to 100 without phones or one-word leftovers', () => {
    const registry = JSON.parse(fs.readFileSync(path.join(VAULT, '12_Brain/state/radar/registry.json'), 'utf8'));
    const report = rankRadar(registry.prospects, { limit: 100, perWord: 12, minQuality: 84 });
    assert.equal(report.scanned, 1042);
    assert.equal(report.top.length, 100);
    assert.ok(report.eligible >= 100);
    const words = new Set(report.top.map((r) => r.word));
    assert.equal(words.has('smile more'), true);
    assert.equal(words.has('stay cool'), true);
    assert.equal(words.has('smile'), false);
    assert.equal(words.has('paws'), false);
    assert.equal(words.has('taste'), false);
    assert.equal(report.top.filter((r) => r.word === 'smile more').length <= 16, true);
    const blob = JSON.stringify(report.top);
    assert.doesNotMatch(blob, /\b\d{3}[-.)]\d{3}[-.)]\d{4}\b/);
    for (const row of report.top) {
      assert.ok(row.word.split(/\s+/).length <= 2, row.word);
      assert.equal(row.word, row.word.toLowerCase());
    }
  });
});
