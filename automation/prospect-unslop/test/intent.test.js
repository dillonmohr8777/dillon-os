'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { familyFor, modeFor, scenesFor } = require('../intent');

test('food businesses get food mode, not people stock', () => {
  assert.equal(familyFor("Al Tacos Locos"), 'food');
  assert.equal(modeFor('food'), 'food');
  assert.equal(familyFor("Harry's Hotdogs"), 'food');
  assert.equal(familyFor('Nottingham Creamery'), 'food');
  assert.equal(familyFor("Rocco's Brick Oven Pizzeria"), 'food');
  assert.equal(familyFor('Katana Pittsburgh', 'katana'), 'food');
  assert.equal(familyFor('Eastern Dragon', 'eastern-dragon'), 'food');
  assert.equal(familyFor('Artisan Wine and Cheese Cellars'), 'food');
  assert.equal(familyFor('Manatawny Still Works'), 'food');
  assert.notEqual(familyFor('MacLaren Kitchen and Bath'), 'food');
  assert.notEqual(familyFor('The Restaurant Store Plymouth Meeting'), 'food');
});

test('pool-and-spa trade is not a nail salon', () => {
  assert.equal(familyFor('Morton Electric Pool & Spa'), 'trade');
});

test('service businesses stay people-focused', () => {
  assert.equal(modeFor(familyFor('Always Dental Care')), 'people');
  assert.equal(modeFor(familyFor('Art City Vets & Urgent Care')), 'people');
  assert.equal(modeFor(familyFor("Kehan's Auto Service")), 'people');
  assert.equal(familyFor('Always Dental Care'), 'dental');
  assert.equal(familyFor('Art City Vets & Urgent Care'), 'veterinary');
});

test('five unique scene prompts per family', () => {
  for (const family of ['food', 'dental', 'veterinary', 'auto', 'bridal']) {
    const scenes = scenesFor(family, 'Test Biz');
    assert.equal(scenes.length, 5);
    assert.equal(new Set(scenes).size, 5);
    for (const scene of scenes) {
      assert.match(scene, /no text|no logos/i);
    }
  }
  const food = scenesFor('food', 'Al Tacos Locos').join(' ');
  assert.match(food, /taco|dish|kitchen|plate|ingredient|food/i);
  assert.doesNotMatch(food, /handshake in a sunlit atrium/i);
  const pizza = scenesFor('food', "Rocco's Brick Oven Pizzeria").join(' ');
  assert.match(pizza, /pizza/i);
});
