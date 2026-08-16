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

  it('committed MCP configs carry no literal token', () => {
    // Every credential must arrive from the environment; a bare token in these
    // files would be published the moment the repo syncs.
    for (const rel of ['.cursor/mcp.json', '.mcp.json']) {
      const raw = fs.readFileSync(path.join(VAULT, rel), 'utf8');
      const parsed = JSON.parse(raw);
      const landingfolio = parsed.mcpServers.landingfolio;
      assert.equal(landingfolio.url, 'https://mcp.landingfolio.com/mcp');
      assert.match(landingfolio.headers.Authorization, /\$\{(env:)?LANDINGFOLIO_TOKEN\}/);
      assert.ok(parsed.mcpServers['twilio-docs'], `${rel} missing twilio-docs`);
      assert.equal(parsed.mcpServers['twilio-docs'].url, 'https://mcp.twilio.com/docs');
      assert.equal(parsed.mcpServers.callrail, undefined, `${rel} must not invent a CallRail URL`);
      assert.equal(parsed.mcpServers.context7.url, 'https://mcp.context7.com/mcp');
      assert.equal(parsed.mcpServers.firecrawl.url, 'https://mcp.firecrawl.dev/v2/mcp');
      assert.equal(parsed.mcpServers.firecrawl.headers, undefined, `${rel} firecrawl must stay keyless`);
      assert.equal(parsed.mcpServers['google-design'].url, 'https://design.googleapis.com/mcp');
      assert.deepEqual(parsed.mcpServers.playwright.args, ['-y', '@playwright/mcp@latest']);
      assert.equal(parsed.mcpServers.brandfetch.url, 'https://mcp.brandfetch.io/mcp');
      assert.equal(parsed.mcpServers.netlify.url, 'https://netlify-mcp.netlify.app/mcp');
      assert.deepEqual(parsed.mcpServers['google-analytics'].args, ['run', 'analytics-mcp']);
      assert.equal(parsed.mcpServers.gmail.url, 'https://gmailmcp.googleapis.com/mcp/v1');
      assert.equal(parsed.mcpServers['google-drive'].url, 'https://drivemcp.googleapis.com/mcp/v1');
      assert.equal(parsed.mcpServers['google-calendar'].url, 'https://calendarmcp.googleapis.com/mcp/v1');
      assert.deepEqual(
        parsed.mcpServers['google-ads'].args,
        ['run', '--spec', 'git+https://github.com/googleads/google-ads-mcp.git', 'google-ads-mcp'],
      );
      assert.equal(parsed.mcpServers['google-ads'].url, undefined, `${rel} must not invent a Google Ads URL`);
      assert.match(
        parsed.mcpServers['google-ads'].env.GOOGLE_ADS_DEVELOPER_TOKEN,
        /\$\{(env:)?GOOGLE_ADS_DEVELOPER_TOKEN\}/,
      );
      assert.match(
        parsed.mcpServers['google-ads'].env.GOOGLE_PROJECT_ID,
        /\$\{(env:)?GOOGLE_PROJECT_ID\}/,
      );
      assert.equal(parsed.mcpServers['maps-grounding-lite'].url, 'https://mapstools.googleapis.com/mcp');
      assert.equal(parsed.mcpServers['maps-grounding-lite'].headers, undefined, `${rel} maps must not ship an empty API key header`);
      assert.equal(parsed.mcpServers['developer-knowledge'].url, 'https://developerknowledge.googleapis.com/mcp');
      assert.equal(parsed.mcpServers['google-business-profile'], undefined, `${rel} must not invent a GBP MCP`);
      assert.equal(parsed.mcpServers.merchant, undefined, `${rel} must not wire Merchant as GBP`);
      assert.doesNotMatch(raw, /mybusiness\.googleapis\.com\/mcp/, `${rel} must not invent a my-business MCP URL`);
      assert.doesNotMatch(raw, /merchantapi\.googleapis\.com\/mcp/, `${rel} must not wire Merchant MCP`);
      assert.doesNotMatch(raw, /storage\.googleapis\.com\/storage\/mcp/, `${rel} must not add a Cloud Storage data lake`);
      assert.equal(parsed.mcpServers['chrome-devtools'], undefined, `${rel} must not also wire Chrome DevTools`);
      for (const [name, server] of Object.entries(parsed.mcpServers)) {
        if (server.headers && server.headers.Authorization) {
          assert.match(
            server.headers.Authorization,
            /\$\{/,
            `${rel} ${name} Authorization must interpolate from the environment`,
          );
        }
      }
      assert.doesNotMatch(raw, /\blf_[A-Za-z0-9]/, `${rel} looks like it holds a real token`);
      assert.deepEqual(scanText(raw), [], `${rel} trips the public-safety scanner`);
    }
  });

  it('environment files stay out of Git', () => {
    const gi = fs.readFileSync(path.join(VAULT, '.gitignore'), 'utf8');
    assert.match(gi, /^\.env$/m);
    assert.match(gi, /^\.env\.\*$/m);
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
