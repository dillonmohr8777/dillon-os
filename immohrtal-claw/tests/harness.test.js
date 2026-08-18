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
const vault = path.join(tmpRoot, 'vault');
fs.mkdirSync(path.join(vault, '12_Brain', 'private'), { recursive: true });
fs.writeFileSync(path.join(vault, 'INDEX.md'), '# Dillon OS Index\n\nIMMOHRTAL CLAW is a personal agent.\n');
fs.writeFileSync(path.join(vault, '12_Brain', 'private', 'secrets.md'), 'redacted\n');
process.env.CLAW_VAULT_ROOT = vault;
fs.mkdirSync(process.env.CLAW_DATA_DIR, { recursive: true });

const { assertInside } = require('../src/sandbox');
const { WORKSPACE, NOTES } = require('../src/paths');
const { loadSkills } = require('../src/skills-loader');
const memory = require('../src/memory-store');
const { execute } = require('../src/tools');
const { loadConfig, selectModel } = require('../src/config');
const { CATALOG } = require('../src/models');
const knowledge = require('../src/knowledge');
const { runTurn } = require('../src/agent-loop');
const { createServer } = require('../src/gateway');
const { assertPublicHttpUrl } = require('../src/net');
const cron = require('../src/cron');

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
    for (const need of [
      'memory-keeper', 'web-search', 'cron-jobs', 'spawn-tasks',
      'knowledge-base', 'model-router', 'vault-protocol', 'approval-gate',
    ]) {
      assert.ok(ids.includes(need), need);
    }
    assert.equal(ids.includes('album-bible'), false);
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
  it('writes, appends, and edits notes inside the sandbox', async () => {
    await execute('write_file', { path: 'scratch.md', content: 'bar one\n', area: 'notes' }, config);
    await execute('append_file', { path: 'scratch.md', content: 'bar two\n', area: 'notes' }, config);
    await execute('edit_file', {
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

  it('refuses write_file path escape', async () => {
    await assert.rejects(
      () => execute('write_file', { path: '../../etc/passwd', content: 'nope' }, config),
      /escapes/,
    );
  });

  it('keeps exec staged-off', async () => {
    await assert.rejects(() => execute('exec', { command: 'echo hi' }, config), /staged-off/);
  });

  it('blocks private web_fetch hosts', async () => {
    await assert.rejects(() => assertPublicHttpUrl('http://127.0.0.1/secret'), /private/);
    await assert.rejects(() => assertPublicHttpUrl('http://localhost/'), /private/);
  });

  it('adds and lists cron jobs', () => {
    const job = cron.addJob({ text: 'check the inbox', everyMinutes: 30 });
    const jobs = cron.loadJobs();
    assert.ok(jobs.some((j) => j.id === job.id));
  });
});

describe('agent loop', () => {
  it('pins a memory when asked to remember', async () => {
    const stamp = `claw-note-${Date.now()}`;
    const result = await runTurn({
      config,
      sessionId: `test_mem_${Date.now()}`,
      userText: `Remember ${stamp}`,
    });
    assert.ok(result.toolKinds.includes('memory_write'));
    assert.match(result.content, new RegExp(stamp));
  });

  it('searches memory on a later turn in the same session', async () => {
    const stamp = `pickle-chips-${Date.now()}`;
    const sessionId = `test_multiturn_${Date.now()}`;
    await runTurn({
      config,
      sessionId,
      userText: `Remember ${stamp}`,
    });
    const result = await runTurn({
      config,
      sessionId,
      userText: 'What do you remember about pickle chips?',
    });
    assert.ok(result.toolKinds.includes('memory_search'));
    assert.match(result.content, new RegExp(stamp));
  });
});

describe('gateway', () => {
  it('serves health, robots, and identity without music copy', async () => {
    const server = createServer(config);
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    const { port } = server.address();
    try {
      const health = await fetch(`http://127.0.0.1:${port}/api/health`);
      const healthJson = await health.json();
      assert.equal(healthJson.ok, true);
      assert.equal(healthJson.product, 'IMMOHRTAL CLAW');
      assert.equal(healthJson.chatgpt, 'later');
      assert.equal(healthJson.brains, 10);

      const page = await fetch(`http://127.0.0.1:${port}/`);
      const html = await page.text();
      assert.match(html, /IMMOHRTAL CLAW/);
      assert.match(html, /Personal agent/);
      assert.match(html, /chrome-text/);
      assert.match(html, /modelPick/);
      assert.doesNotMatch(html, /SESSION 001/);
      assert.doesNotMatch(html, /Dance With The Delusional/);
      assert.doesNotMatch(html, /Listen Now/);
      assert.doesNotMatch(html, /Tracklist/);

      const chat = await fetch(`http://127.0.0.1:${port}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          model: 'immohrtal-claw-rehearsal',
          messages: [{ role: 'user', content: 'Who are you?' }],
        }),
      });
      const json = await chat.json();
      assert.match(json.choices[0].message.content, /IMMOHRTAL CLAW/i);
      assert.match(json.choices[0].message.content, /not a music product/i);
    } finally {
      server.close();
    }
  });

  it('requires a gate code when configured', async () => {
    const gated = { ...config, gateToken: 'test-gate' };
    const server = createServer(gated);
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    const { port } = server.address();
    try {
      const blocked = await fetch(`http://127.0.0.1:${port}/api/state`);
      assert.equal(blocked.status, 401);
      const login = await fetch(`http://127.0.0.1:${port}/api/login`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token: 'test-gate' }),
      });
      assert.equal(login.status, 200);
      const cookie = login.headers.get('set-cookie');
      assert.match(cookie, /claw_gate=/);
      const ok = await fetch(`http://127.0.0.1:${port}/api/state`, {
        headers: { cookie },
      });
      assert.equal(ok.status, 200);
    } finally {
      server.close();
    }
  });
});

describe('brains and knowledge', () => {
  it('catalogs five local and five cloud brains', () => {
    assert.equal(CATALOG.length, 10);
    assert.equal(CATALOG.filter((m) => m.group === 'local').length, 5);
    assert.equal(CATALOG.filter((m) => m.group === 'cloud').length, 5);
    assert.equal(CATALOG.find((m) => m.slot === 'cloud-5').family, 'google');
    assert.equal(CATALOG.find((m) => m.id === 'composer-2.5').cursorOnly, true);
    assert.ok(CATALOG.some((m) => m.id === 'claude-opus-5'));
    assert.ok(CATALOG.some((m) => m.id === 'grok-4.6'));
  });

  it('searches the vault and refuses private files', async () => {
    const hits = knowledge.searchKnowledge({ query: 'IMMOHRTAL CLAW personal agent' });
    assert.ok(hits.some((h) => h.path === 'INDEX.md'));
    const page = knowledge.readKnowledge('INDEX.md');
    assert.match(page.content, /personal agent/i);
    assert.throws(() => knowledge.readKnowledge('12_Brain/private/secrets.md'), /allowlist|escapes|private/);
    assert.throws(() => knowledge.readKnowledge('../../etc/passwd'), /escapes|allowlist/);
    const listed = await execute('model_list', {}, config);
    assert.equal(listed.models.length, 10);
    assert.throws(() => selectModel('not-a-brain'), /unknown model/);
  });
});
