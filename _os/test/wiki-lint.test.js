'use strict';

/**
 * Tests for the deterministic brain-layer lint.
 *
 * The rule engine is exercised against purpose-built temp vaults so the
 * assertions stay stable as the real vault grows. A final suite runs the policy
 * against the real 12_Brain tree and requires it to be clean, which is what
 * actually stops the writing rules from drifting again.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const {
  stripCode,
  extractLinks,
  buildVaultIndex,
  resolveLink,
  reachableFromIndex,
  inboundCounts,
  isPastDate,
  daysUntil,
  lint,
  loadPolicy,
} = require('../automation/lib/wikilint');

const VAULT = path.resolve(__dirname, '../..');

function tempVault(files) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'wikilint-'));
  for (const [rel, body] of Object.entries(files)) {
    const abs = path.join(root, rel);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, body);
  }
  return root;
}

const POLICY = {
  index: '12_Brain/INDEX.md',
  vault_scan: { exclude_dirs: ['.git'] },
  untracked_by_design: { prefixes: ['12_Brain/private/'] },
  rules: [
    { id: 'frontmatter-present', severity: 'error', scope: ['12_Brain/'], exclude: ['12_Brain/raw/'] },
    { id: 'source-present', severity: 'error', any_of: ['source', 'source_refs'], scope: ['12_Brain/concepts/'], exclude: ['README.md'] },
    { id: 'expires-present', severity: 'error', requires: ['expires'], scope: ['12_Brain/research/'], exclude: ['README.md'] },
    { id: 'expires-soon', severity: 'warn', horizon_days: 14, scope: ['12_Brain/'] },
    { id: 'expires-fresh', severity: 'warn', scope: ['12_Brain/'] },
    { id: 'link-resolves', severity: 'error', scope: ['12_Brain/'], exclude: ['12_Brain/raw/'] },
    { id: 'index-reachable', severity: 'error', scope: ['12_Brain/'], exclude: ['12_Brain/raw/'] },
    { id: 'no-rival-brain', severity: 'error', forbidden_paths: ['1Z_Brain'] },
  ],
};

test('link extraction', async (t) => {
  await t.test('ignores link syntax inside fenced and inline code', () => {
    const text = [
      'Real link to [[Alpha]].',
      '',
      'Prose about `[[wikilinks]]` should not count.',
      '',
      '```',
      'nor [[Fenced]] inside a fence',
      '```',
      '',
      'But [[Beta|an alias]] does.',
    ].join('\n');
    const targets = extractLinks(text).map((l) => l.target);
    assert.deepEqual(targets, ['Alpha', 'Beta']);
  });

  await t.test('stripCode preserves offsets so line numbers stay accurate', () => {
    const text = 'line one\n`[[hidden]]`\nlink [[Target]] here\n';
    const stripped = stripCode(text);
    assert.equal(stripped.length, text.length);
    assert.equal(stripped.split('\n').length, text.split('\n').length);
    assert.equal(extractLinks(text)[0].line, 3);
  });

  await t.test('strips heading, block and alias suffixes from the target', () => {
    const links = extractLinks('[[Page#Section|Alias]] and ![[Embed^block]]');
    assert.deepEqual(links.map((l) => l.target), ['Page', 'Embed']);
    assert.equal(links[0].alias, 'Alias');
  });

  await t.test('handles the escaped alias pipe a markdown table requires', () => {
    const link = extractLinks('| cell | [[12_Brain/entities/Hermes\\|Hermes]] |')[0];
    assert.equal(link.target, '12_Brain/entities/Hermes', 'trailing backslash must not survive');
    assert.equal(link.alias, 'Hermes');
  });
});

test('link resolution', async (t) => {
  const root = tempVault({
    '12_Brain/INDEX.md': '---\ntags: [index]\n---\n\n# INDEX\n',
    '12_Brain/entities/Hermes.md': '---\nsource: x\n---\n\nbody\n',
    '12_Brain/bases/Clients.base': 'filters: {}\n',
  });
  const index = buildVaultIndex(root, POLICY);

  await t.test('resolves a full vault-relative path', () => {
    assert.equal(resolveLink('12_Brain/entities/Hermes', index, POLICY).status, 'ok');
  });

  await t.test('resolves a bare basename the way Obsidian does', () => {
    assert.equal(resolveLink('Hermes', index, POLICY).to, '12_Brain/entities/Hermes.md');
  });

  await t.test('resolves a partial path by suffix', () => {
    assert.equal(resolveLink('entities/Hermes', index, POLICY).to, '12_Brain/entities/Hermes.md');
  });

  await t.test('does not fall back to the basename for a stale path', () => {
    // The bug this pins: `[[12_Brain/04_Decisions/README]]` pointing at a deleted
    // folder resolved to an unrelated README.md and hid the breakage.
    const resolved = resolveLink('12_Brain/no-such-folder/INDEX', index, POLICY);
    assert.equal(resolved.status, 'broken', 'a path target must not match a bare basename elsewhere');
  });

  await t.test('resolves non-markdown link targets such as Bases', () => {
    assert.equal(resolveLink('12_Brain/bases/Clients.base', index, POLICY).status, 'ok');
  });

  await t.test('reports gitignored-by-design targets as private, not broken', () => {
    const resolved = resolveLink('12_Brain/private/raw/2026-06-26 - transfer', index, POLICY);
    assert.equal(resolved.status, 'private');
  });

  await t.test('reports a genuinely missing target as broken', () => {
    assert.equal(resolveLink('No Such Page', index, POLICY).status, 'broken');
  });
});

test('INDEX reachability follows the trail across folders', () => {
  const root = tempVault({
    '12_Brain/INDEX.md': '---\ntags: [i]\n---\n\n- [[01_Clients/Client Index]]\n',
    '01_Clients/Client Index.md': '---\ntags: [i]\n---\n\n- [[01_Clients/Acme]]\n',
    '01_Clients/Acme.md': '---\ntags: [c]\n---\n\n- [[12_Brain/10_Maps/Comms Map]]\n',
    '12_Brain/10_Maps/Comms Map.md': '---\nsource: x\n---\n\nbody\n',
    '12_Brain/concepts/Marooned.md': '---\nsource: x\n---\n\nnothing links here\n',
  });
  const index = buildVaultIndex(root, POLICY);
  const reachable = reachableFromIndex(index, POLICY);

  assert.ok(
    reachable.has('12_Brain/10_Maps/Comms Map.md'),
    'a brain page reached through a client page is still reachable',
  );
  assert.ok(!reachable.has('12_Brain/concepts/Marooned.md'));
});

test('inbound counts identify pages nothing links to', () => {
  const root = tempVault({
    '12_Brain/INDEX.md': '---\ntags: [i]\n---\n\n- [[12_Brain/concepts/Linked]]\n',
    '12_Brain/concepts/Linked.md': '---\nsource: x\n---\n\n- [[12_Brain/concepts/Linked]] self link\n',
    '12_Brain/concepts/Orphan.md': '---\nsource: x\n---\n\nbody\n',
  });
  const counts = inboundCounts(buildVaultIndex(root, POLICY), POLICY);
  assert.equal(counts.get('12_Brain/concepts/Linked.md'), 1, 'self links do not count as inbound');
  assert.equal(counts.get('12_Brain/concepts/Orphan.md'), 0);
});

test('isPastDate compares ISO dates without timezone drift', () => {
  assert.equal(isPastDate('2026-07-30', '2026-07-31'), true);
  assert.equal(isPastDate('2026-07-31', '2026-07-31'), false, 'expiring today is still fresh');
  assert.equal(isPastDate('2026-08-01', '2026-07-31'), false);
  assert.equal(isPastDate('', '2026-07-31'), false);
  assert.equal(isPastDate('not-a-date', '2026-07-31'), false);
});

test('daysUntil counts whole days across month boundaries', () => {
  assert.equal(daysUntil('2026-08-14', '2026-07-31'), 14);
  assert.equal(daysUntil('2026-07-31', '2026-07-31'), 0);
  assert.equal(daysUntil('2026-07-30', '2026-07-31'), -1);
  assert.equal(daysUntil('nope', '2026-07-31'), null);
});

test('rule engine', async (t) => {
  const root = tempVault({
    '1Z_Brain/README.md': 'rival tree\n',
    '12_Brain/INDEX.md': '---\ntags: [i]\n---\n\n- [[12_Brain/concepts/Good]]\n- [[Ghost Page]]\n',
    '12_Brain/concepts/Good.md': '---\nsource: "[[12_Brain/private/raw/capture]]"\n---\n\nbody\n',
    '12_Brain/concepts/NoSource.md': '---\ntags: [c]\n---\n\nbody\n',
    '12_Brain/concepts/BlockSeq.md': '---\nsource_refs:\n  - "https://example.com"\n---\n\nbody\n',
    '12_Brain/concepts/Bare.md': '# no frontmatter\n',
    '12_Brain/research/Stale.md': '---\nsource: x\nexpires: 2026-01-01\n---\n\nbody\n',
    '12_Brain/research/NoExpiry.md': '---\nsource: x\n---\n\nbody\n',
    '12_Brain/research/DueSoon.md': '---\nsource: x\nexpires: 2026-08-10\n---\n\nbody\n',
    '12_Brain/research/DueLater.md': '---\nsource: x\nexpires: 2026-12-01\n---\n\nbody\n',
    '12_Brain/raw/verbatim.md': 'raw capture with [[Broken On Purpose]] and no frontmatter\n',
  });
  const result = lint({ root, policy: POLICY, today: '2026-07-31' });
  const byRule = (id) => result.findings.filter((f) => f.rule === id).map((f) => f.file);

  await t.test('fails overall when any error rule fires', () => {
    assert.equal(result.status, 'fail');
    assert.ok(result.counts.errors > 0);
  });

  await t.test('flags a competing brain tree', () => {
    assert.deepEqual(byRule('no-rival-brain'), ['1Z_Brain']);
  });

  await t.test('flags missing provenance but accepts source_refs block sequences', () => {
    const flagged = byRule('source-present');
    assert.ok(flagged.includes('12_Brain/concepts/NoSource.md'));
    assert.ok(flagged.includes('12_Brain/concepts/Bare.md'));
    assert.ok(!flagged.includes('12_Brain/concepts/BlockSeq.md'), 'source_refs counts as provenance');
    assert.ok(!flagged.includes('12_Brain/concepts/Good.md'));
  });

  await t.test('accepts a source: pointing into the gitignored private layer', () => {
    assert.ok(!byRule('link-resolves').includes('12_Brain/concepts/Good.md'));
  });

  await t.test('flags missing and expired research dates separately', () => {
    assert.deepEqual(byRule('expires-present'), ['12_Brain/research/NoExpiry.md']);
    assert.deepEqual(byRule('expires-fresh'), ['12_Brain/research/Stale.md']);
    const stale = result.findings.find((f) => f.rule === 'expires-fresh');
    assert.equal(stale.severity, 'warn', 'stale knowledge warns; missing provenance errors');
  });

  await t.test('warns inside the re-verification horizon but not beyond it', () => {
    const soon = byRule('expires-soon');
    assert.deepEqual(soon, ['12_Brain/research/DueSoon.md'], 'only the page inside 14 days');
    const finding = result.findings.find((f) => f.rule === 'expires-soon');
    assert.equal(finding.daysUntil, 10);
    assert.match(finding.detail, /expires in 10 days/);
  });

  await t.test('an already-expired page is not double-reported as due soon', () => {
    assert.ok(!byRule('expires-soon').includes('12_Brain/research/Stale.md'));
  });

  await t.test('flags a broken link in INDEX itself', () => {
    const broken = result.findings.filter((f) => f.rule === 'link-resolves');
    assert.equal(broken.length, 1);
    assert.equal(broken[0].file, '12_Brain/INDEX.md');
    assert.equal(broken[0].target, 'Ghost Page');
    assert.equal(broken[0].line, 6);
  });

  await t.test('never lints raw/ — it is read-only verbatim history', () => {
    for (const rule of ['frontmatter-present', 'link-resolves', 'index-reachable']) {
      assert.ok(!byRule(rule).some((f) => f.startsWith('12_Brain/raw/')), `${rule} touched raw/`);
    }
  });

  await t.test('flags pages no trail from INDEX reaches', () => {
    const unreachable = byRule('index-reachable');
    assert.ok(unreachable.includes('12_Brain/concepts/NoSource.md'));
    assert.ok(!unreachable.includes('12_Brain/concepts/Good.md'));
  });

  await t.test('a clean vault reports ok', () => {
    const clean = tempVault({
      '12_Brain/INDEX.md': '---\ntags: [i]\n---\n\n- [[12_Brain/concepts/Good]]\n',
      '12_Brain/concepts/Good.md': '---\nsource: "[[12_Brain/INDEX]]"\n---\n\nbody\n',
    });
    const ok = lint({ root: clean, policy: POLICY, today: '2026-07-31' });
    assert.equal(ok.status, 'ok', JSON.stringify(ok.findings, null, 2));
  });
});

test('the real 12_Brain tree satisfies its own writing rules', async (t) => {
  const policy = loadPolicy(VAULT);
  const result = lint({ root: VAULT, policy, today: '2026-07-31' });

  await t.test('policy is loaded from the registry, not the built-in fallback', () => {
    assert.ok(policy.rules.length >= 7, 'expected the registry policy to define every rule');
    assert.equal(policy.index, '12_Brain/INDEX.md');
  });

  await t.test('has no error-level findings', () => {
    const errors = result.findings.filter((f) => f.severity === 'error');
    const detail = errors.map((e) => `${e.file}${e.line ? `:${e.line}` : ''} — ${e.rule}: ${e.detail}`).join('\n');
    assert.equal(errors.length, 0, `brain layer has ${errors.length} lint errors:\n${detail}`);
  });

  await t.test('every brain page is reachable from INDEX.md', () => {
    assert.ok(result.counts.reachable > 0);
    assert.ok(!result.findings.some((f) => f.rule === 'index-reachable'));
  });
});
