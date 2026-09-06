'use strict';
// System/writing-rules.md rule 1 in this vault reads, verbatim:
//   "**No em dashes anywhere. Ever.** Use periods, commas, colons, or
//    restructure the sentence."
// and it states that it applies to ALL output, documentation included. It is a
// house rule with no automated enforcement anywhere else, so it gets one here.
//
// The character is built from its code point rather than written out, because
// this file is inside the tree it scans and would otherwise fail on itself.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const EM = String.fromCharCode(0x2014);
const ROOT = path.join(__dirname, '..');
const SKIP = new Set(['node_modules', '.git', 'renders', 'data', 'dist', '__pycache__']);
const EXT = new Set(['.md', '.js', '.py', '.html', '.gd', '.json']);

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (EXT.has(path.extname(name))) out.push(p);
  }
  return out;
}

test('no em dashes anywhere, per System/writing-rules.md rule 1', () => {
  const offenders = [];
  for (const file of walk(ROOT)) {
    const text = fs.readFileSync(file, 'utf8');
    if (!text.includes(EM)) continue;
    const rel = path.relative(ROOT, file);
    text.split('\n').forEach((line, i) => {
      if (line.includes(EM)) offenders.push(`${rel}:${i + 1}  ${line.trim().slice(0, 88)}`);
    });
  }
  assert.deepStrictEqual(offenders, [],
    `em dashes found:\n  ${offenders.join('\n  ')}`);
});

test('the rule this test enforces still says what it says', () => {
  // If the vault rule is ever relaxed, this test should be deleted rather than
  // quietly kept, so it fails loudly if the source of the rule moves or changes.
  const rules = path.join(ROOT, '..', 'System', 'writing-rules.md');
  if (!fs.existsSync(rules)) return;                 // running outside the vault
  const text = fs.readFileSync(rules, 'utf8');
  assert.ok(/No em dashes anywhere/i.test(text),
    'System/writing-rules.md no longer bans em dashes; delete this test');
});
