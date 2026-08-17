'use strict';

/**
 * Round-trip guard for frontmatter list serialization.
 * A wikilink inside a list used to serialize as [[[...]]], which neither YAML
 * nor Obsidian reads back as a one-element list.
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { parseFrontmatter, serializeFrontmatter } = require('../lib/frontmatter');

test('wikilink list elements survive a serialize/parse round trip', () => {
  const link = '[[12_Brain/01_Captures/2026-06-26 - transfer]]';
  const out = serializeFrontmatter({ source_refs: [link] }, '# Body\n');
  assert.match(out, /source_refs: \["\[\[12_Brain\/01_Captures\/2026-06-26 - transfer\]\]"\]/);
  assert.doesNotMatch(out, /\[\[\[/, 'must not emit a triple-bracket list');
  assert.deepEqual(parseFrontmatter(out).data.source_refs, [link]);
});

test('plain tag lists stay unquoted', () => {
  const out = serializeFrontmatter({ tags: ['brain', 'captures'] }, '# B\n');
  assert.match(out, /tags: \[brain, captures\]/);
});

test('an empty list serializes as an empty list', () => {
  const out = serializeFrontmatter({ source_refs: [] }, '# B\n');
  assert.match(out, /source_refs: \[\]/);
  assert.deepEqual(parseFrontmatter(out).data.source_refs, []);
});
