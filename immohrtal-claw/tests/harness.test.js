'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { describe, it, before } = require('node:test');
const assert = require('node:assert/strict');

const root = path.join(__dirname, '..');
const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'immohrtal-claw-'));
const workspace = path.join(tmpRoot, 'workspace');
fs.cpSync(path.join(root, 'workspace'), workspace, { recursive: true });
process.env.CLAW_DATA_DIR = path.join(tmpRoot, 'data');
process.env.CLAW_WORKSPACE = workspace;
fs.mkdirSync(process.env.CLAW_DATA_DIR, { recursive: true });

const { assertInside } = require('../src/sandbox');
const { WORKSPACE, NOTES } = require('../src/paths');
const { loadSkills } = require('../src/skills-loader');
const memory = require('../src/memory-store');
const { execute } = require('../src/tools');
const { loadConfig } = require('../src/config');
const { runTurn } = require('../src/agent-loop');
const { createServer } = require('../src/gateway');

const config = loadConfig();

before(() => {
  memory.bootstrap();
});

describe('sandbox', () => {
  it('blocks path escape', () => {
    assert.throws(() => assertInside(WORKSPACE, '../../etc/passwd'), /escapes/);
    assert.throws(() => assertInside(WORKSPACE, '/etc/passwd'), /escapes/);
  });

  it('allows workspace-relative files', () => {
    const inside = assertInside(WORKSPACE, 'SOUL.md');
    assert.match(inside, /SOUL\.md$/);
  });
});

describe('skills and memory', () => {
  it('loads bundled SKILL.md modules', () => {
    const ids = loadSkills().map((s) => s.id);
    for (const need of ['album-bible', 'memory-keeper', 'session-hud', 'booth-notes']) {
      assert.ok(ids.includes(need), need);
    }
  });

  it('writes and searches long-term memory', () => {
    const marker = `lake-effect-notebook-${Date.now()}`;
    memory.writeMemory({
      text: marker,
      pin: true,
      kind: 'test',
      maxBytes: config.memoryMaxBytes,
    });
    const hits = memory.searchMemory({
      query: marker,
      scanBytes: config.searchScanBytes,
      limit: 5,
    });
    assert.ok(hits.some((h) => String(h.text).includes(marker)));
  });
});

describe('tools', () => {
  it('returns the album bible', () => {
    const result = execute('album_catalog', '{}', config);
    assert.equal(result.album, 'Dance With The Delusional');
    assert.equal(result.tracks.length, 11);
  });

  it('writes, appends, and edits notes inside the sandbox', () => {
    execute('write_file', { path: 'scratch.md', content: 'bar one\n', area: 'notes' }, config);
    execute('append_file', { path: 'scratch.md', content: 'bar two\n', area: 'notes' }, config);
    execute('edit_file', {
      path: 'scratch.md',
      area: 'notes',
      old_string: 'bar two',
      new_string: 'bar two rewritten',
    }, config);
    const file = path.join(NOTES, 'scratch.md');
    const text = fs.readFileSync(file, 'utf8');
    assert.match(text, /bar one/);
    assert.match(text, /bar two rewritten/);
  });

  it('refuses write_file path escape', () => {
    assert.throws(
      () => execute('write_file', { path: '../../etc/passwd', content: 'nope' }, config),
      /escapes/,
    );
  });

  it('keeps exec staged-off', () => {
    assert.throws(() => execute('exec', { command: 'echo hi' }, config), /staged-off/);
  });
});

describe('agent loop', () => {
  it('uses album_catalog for a tracklist ask', async () => {
    const result = await runTurn({
      config,
      sessionId: `test_album_${Date.now()}`,
      userText: 'Give me the IMMOHRTAL album tracklist',
    });
    assert.ok(result.toolKinds.includes('album_catalog'));
    assert.match(result.content, /814 Blood/);
  });

  it('pins a memory when asked to remember', async () => {
    const stamp = `booth-bar-${Date.now()}`;
    const result = await runTurn({
      config,
      sessionId: `test_mem_${Date.now()}`,
      userText: `Remember ${stamp}`,
    });
    assert.ok(result.toolKinds.includes('memory_write'));
    assert.match(result.content, new RegExp(stamp));
  });
});

describe('gateway', () => {
  it('serves health, robots, and openai-compatible chat', async () => {
    const server = createServer(config);
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    const { port } = server.address();
    try {
      const health = await fetch(`http://127.0.0.1:${port}/api/health`);
      const healthJson = await health.json();
      assert.equal(healthJson.ok, true);
      assert.equal(healthJson.publish, 'blocked');
      assert.equal(healthJson.product, 'IMMOHRTAL CLAW');

      const robots = await fetch(`http://127.0.0.1:${port}/robots.txt`);
      const robotsText = await robots.text();
      assert.match(robotsText, /Disallow: \//);

      const chat = await fetch(`http://127.0.0.1:${port}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          model: 'immohrtal-claw-booth',
          messages: [{ role: 'user', content: 'Who are you?' }],
        }),
      });
      const json = await chat.json();
      assert.match(json.choices[0].message.content, /IMMOHRTAL CLAW/i);
    } finally {
      server.close();
    }
  });
});
