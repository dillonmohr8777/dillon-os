'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { identifyBusiness, compareNames, tokenize, decodeEntities } = require('../lib/business-identity');

const page = (...strings) => ({ voice: { title: strings[0], headings: strings.slice(1) } });

test('HTML entities are resolved before any comparison', () => {
  // The bug this whole module exists for: `&amp;` survived normalisation as the
  // literal token "amp", so every trade name with an ampersand failed.
  assert.equal(decodeEntities('Plumbing &amp; Heating'), 'Plumbing & Heating');
  assert.equal(decodeEntities('Madonna&#39;s'), "Madonna's");
  assert.equal(decodeEntities('Caf&#xe9;'), 'Café');
  assert.ok(!tokenize('Avon Chiropractic &amp; Injury Center').includes('amp'));
  assert.deepEqual(
    tokenize('Plumbing &amp; Heating'),
    tokenize('Plumbing & Heating'),
    'the entity and the character normalise identically',
  );
});

test('the real-world false negatives now match', () => {
  const cases = [
    ['Avon Chiropractic and Injury Center', 'Avon Chiropractic &amp; Injury Center'],
    ['Alderfer Glass Company', 'Home - Alderfer Glass'],
    ['Oaks Nail Spa', 'Oaks Nails Spa'],
    ["Madonna's Beer Distributors", 'Madonna&#39;s Beer Distributor'],
    ['Wm. Henderson Plumbing & Heating Inc.', 'Wm Henderson'],
    ['The Restaurant Store', 'Restaurant Store'],
  ];
  for (const [registry, site] of cases) {
    assert.equal(compareNames(registry, site).match, true, `${registry} vs ${site}`);
  }
});

test('a different business is still refused', () => {
  const cases = [
    ['Smith Plumbing', 'Jones Plumbing'],
    ['Grand Prix Worx', 'Speedy Auto Detail'],
    ['Avon Chiropractic', 'Bristol Chiropractic'],
    // One shared distinctive word is never enough on its own.
    ['Henderson Plumbing and Heating', 'Plumbing'],
    ['Acme Roofing', 'Acme'],
  ];
  for (const [registry, site] of cases) {
    assert.equal(compareNames(registry, site).match, false, `${registry} must not match ${site}`);
  }
});

test('generic industry words cannot carry a match by themselves', () => {
  assert.equal(compareNames('Philadelphia Dental Center', 'Dental Center').match, false);
  assert.equal(compareNames('Main Street Services LLC', 'Services Company').match, false);
});

test('a challenge, 404 or suspension page is unverified, not a mismatch', () => {
  for (const dead of ['Just a moment...', '404 Page Not Found', 'Account Suspended', 'Attention Required!']) {
    const out = identifyBusiness({ business_name: 'Uncommon Roofing' }, page(dead));
    assert.equal(out.match, false);
    assert.equal(out.reason, 'business_identity_unverified', dead);
    assert.equal(out.dead, true);
  }
});

test('a page with no readable identity is unverified rather than rejected', () => {
  const out = identifyBusiness({ business_name: 'Acme Plumbing' }, { voice: {} });
  assert.equal(out.reason, 'business_identity_unverified');
});

test('a genuinely wrong business is a mismatch, which is a different verdict', () => {
  const out = identifyBusiness({ business_name: 'Acme Plumbing' }, page('Zenith Bakery', 'Fresh Bread Daily'));
  assert.equal(out.match, false);
  assert.equal(out.reason, 'business_identity_mismatch');
});

test('any one candidate string on the page can carry the match', () => {
  const out = identifyBusiness(
    { business_name: 'Alderfer Glass Company' },
    page('Windows and Doors in Souderton PA', 'Alderfer Glass'),
  );
  assert.equal(out.match, true);
  assert.equal(out.observed, 'Alderfer Glass');
});

test('possessives and plurals do not break a real match', () => {
  assert.equal(compareNames("Pabby's Pet Pantry", 'Pabby Pet Pantry').match, true);
  assert.equal(compareNames('Toad Hollow Athletics', 'Toad Hollow Athletic').match, true);
  assert.equal(compareNames('Bakeries of Bucks', 'Bakery of Bucks').match, true);
});

test('the short-branding rule needs two distinctive words, not one', () => {
  assert.equal(compareNames('Henderson Plumbing and Heating Inc', 'Wm Henderson').match, false,
    'a single shared surname is not identity');
  assert.equal(compareNames('Wm Henderson Plumbing and Heating Inc', 'Wm Henderson').match, true);
});
