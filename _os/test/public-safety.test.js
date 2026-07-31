/**
 * Deterministic public-safety checks for tracked 12_Brain content.
 * Run: node --test _os/test/public-safety.test.js
 *
 * Never prints matched secret/PII values — only rule ids and file paths.
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  assertPublicSafe,
  scanText,
  redactText,
  SAFE_FIXTURE_ALLOWLIST,
} = require('../public-safety');

const VAULT = path.resolve(__dirname, '..', '..');
const FIXTURE = path.join(VAULT, '_os/test/fixtures/public-safety-allowlisted.md');

describe('12_Brain public-safety scanner', () => {
  it('flags emails, phones, credentials, locators, and private paths in text', () => {
    // Synthetic fixture strings only — not real secrets.
    const sample = [
      'contact me at user@example.com please',
      'call 555-123-4567 tomorrow',
      'api_key: EXAMPLEONLY',
      'open bw://item/example',
      'path C:\\Users\\ExampleUser\\Documents\\note.md',
      'also /Users/example/Library/Application Support/x',
      'ads cid 123-456-7890',
    ].join('\n');
    const hits = scanText(sample);
    const ids = new Set(hits.map((h) => h.id));
    for (const need of [
      'email', 'phone', 'credential_shaped', 'bitwarden_locator',
      'private_abs_win', 'private_abs_unix', 'google_ads_cid',
    ]) {
      assert.ok(ids.has(need), `expected rule ${need}`);
    }
  });

  it('does not flag clean architecture prose', () => {
    const clean = [
      '# Second Brain Architecture',
      'Compile raw notes into entities and concepts.',
      'Never store credentials in public Git.',
      'Use the private layer for sensitive operator notes.',
    ].join('\n');
    assert.deepEqual(scanText(clean), []);
  });

  it('allowlisted fixture path is skipped by vault scan', () => {
    assert.ok(SAFE_FIXTURE_ALLOWLIST.has('_os/test/fixtures/public-safety-allowlisted.md'));
    fs.mkdirSync(path.dirname(FIXTURE), { recursive: true });
    fs.writeFileSync(
      FIXTURE,
      'fixture-only: user@example.com 555-000-0000 bw://item/x api_key: FIXTURE\n',
      'utf8',
    );
    // Fixture is outside 12_Brain so listBrainFiles won't see it; allowlist is for
    // future in-tree fixtures. Document membership here.
    assert.equal(
      SAFE_FIXTURE_ALLOWLIST.has('_os/test/fixtures/public-safety-allowlisted.md'),
      true,
    );
  });

  it('tracked 12_Brain tree is publicly safe', () => {
    const result = assertPublicSafe(VAULT);
    if (!result.ok) {
      const summary = result.findings.map((f) =>
        `${f.file}: ${f.hits.map((h) => `${h.id}x${h.count}`).join(',')}`,
      );
      assert.fail(`public-safety findings (${result.findings.length}): ${summary.join(' | ')}`);
    }
    assert.ok(result.scannedFiles >= 10);
    assert.equal(result.ok, true);
  });

  it('redacts tool output so it is safe to embed in a tracked note', () => {
    // Shape of real npx output during an MCP Inspector probe: package warnings
    // carry a maintainer email, and the config path exposes a home directory.
    const output = 'npm warn deprecated inflight@1.0.6: contact i@izs.me\n'
      + 'reading /home/operator/tmp/inspector-config.json\n'
      + '{"tools":[{"name":"search_components"}]}';
    const redacted = redactText(output);
    assert.deepEqual(scanText(redacted), []);
    assert.match(redacted, /\[redacted:email\]/);
    assert.match(redacted, /\[redacted:private_abs_unix\]/);
    // The payload the reviewer actually needs survives.
    assert.match(redacted, /"name":"search_components"/);
    assert.equal(redactText('clean tools/list output'), 'clean tools/list output');
  });

  it('private layer gitignore keeps sensitive notes out of Git', () => {
    const gi = fs.readFileSync(path.join(VAULT, '.gitignore'), 'utf8');
    assert.match(gi, /12_Brain\/private\/\*\*/);
    assert.match(gi, /!12_Brain\/private\/README\.md/);
    assert.ok(fs.existsSync(path.join(VAULT, '12_Brain/private/README.md')));
    assert.match(
      fs.readFileSync(path.join(VAULT, '12_Brain/private/README.md'), 'utf8'),
      /PUBLIC/i,
    );
  });
});
