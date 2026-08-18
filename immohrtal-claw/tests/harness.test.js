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

// Fixtures for retrieval ranking, the front door, and generated-map filtering.
const vaultFile = (rel, body) => {
  const abs = path.join(vault, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, body);
};
vaultFile('System/operating-status.md', '---\nlast_updated: 2026-08-17\n---\n\n# Operating Status\n\nActive roster: Omega Landscaping.\n');
vaultFile('System/approval-queue.md', '---\nlast_updated: 2026-08-17\n---\n\n# Approval Queue\n\n## Current client actions\n\n- [ ] Omega - approve budget change after call\n\n## Rules\n\nlots of long body text that must not reach the brief.\n');
vaultFile('12_Brain/05_Projects/IMMOHRTAL CLAW.md', '---\nnote_type: project\nupdated: 2026-08-18\n---\n\n# IMMOHRTAL CLAW\n\nPicoClaw-class personal agent.\n');
// Title carries the term; body does not repeat it. Title boost must win.
vaultFile('12_Brain/03_Concepts/Kestrel Protocol.md', '---\nnote_type: concept\nupdated: 2026-08-15\n---\n\n# Kestrel Protocol\n\nA short concept note about routing.\n');
// Body mentions the term many times but the title does not.
vaultFile('12_Brain/01_Captures/kestrel-mentions.md', `---\nnote_type: capture\nupdated: 2024-01-01\n---\n\n# Unrelated capture\n\n${'kestrel appears here. '.repeat(40)}\n`);
vaultFile('12_Brain/10_Maps/Generated/Kestrel Map.md', '---\nnote_type: map\ngenerated: true\nupdated: 2026-08-18\n---\n\n# Kestrel Map\n\nkestrel kestrel kestrel generated rollup.\n');
vaultFile('01_Clients/Omega/status.md', '---\nnote_type: client\nupdated: 2026-08-16\n---\n\n# Omega\n\n## Lead quality\n\nForm reconciliation is pending.\n');

const http = require('node:http');
const { assertInside } = require('../src/sandbox');
const { WORKSPACE, NOTES } = require('../src/paths');
const { loadSkills, summary } = require('../src/skills-loader');
const memory = require('../src/memory-store');
const { execute, schemas } = require('../src/tools');
const { loadConfig, selectModel, resolvePort } = require('../src/config');
const { CATALOG, readiness, resolveOllamaTag, rememberOllamaTags, resolveSelection } = require('../src/models');
const knowledge = require('../src/knowledge');
const browser = require('../src/browser');
const { compileBrief } = require('../src/front-door');
const { buildSystemPrompt } = require('../src/context-builder');
const { streamLive } = require('../src/providers');
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
      assert.match(html, /brain-deck/);
      assert.match(html, /IBM\+Plex\+Sans/);
      assert.match(html, /pop-3d/);
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

describe('retrieval quality', () => {
  it('ranks a title match above a body-spam match', () => {
    const hits = knowledge.searchKnowledge({ query: 'kestrel', limit: 10 });
    const paths = hits.map((h) => h.path);
    const title = paths.indexOf('12_Brain/03_Concepts/Kestrel Protocol.md');
    const body = paths.indexOf('12_Brain/01_Captures/kestrel-mentions.md');
    assert.ok(title !== -1, 'title-match note is present');
    assert.ok(body !== -1, 'body-match note is present');
    assert.ok(title < body, 'title boost outranks raw term frequency');
    assert.match(hits[title].why, /title:/);
  });

  it('hides generated maps unless asked for them', () => {
    const plain = knowledge.searchKnowledge({ query: 'kestrel', limit: 10 }).map((h) => h.path);
    assert.ok(!plain.includes('12_Brain/10_Maps/Generated/Kestrel Map.md'));
    const withMaps = knowledge
      .searchKnowledge({ query: 'kestrel', limit: 10, includeGenerated: true })
      .map((h) => h.path);
    assert.ok(withMaps.includes('12_Brain/10_Maps/Generated/Kestrel Map.md'));
  });

  it('filters by note_type', () => {
    const hits = knowledge.searchKnowledge({ query: 'kestrel', limit: 10, noteType: 'concept' });
    assert.ok(hits.length > 0);
    assert.ok(hits.every((h) => h.note_type === 'concept'));
  });

  it('kb_open returns a small sourced excerpt, not the whole note', async () => {
    const opened = await execute('kb_open', {
      path: '01_Clients/Omega/status.md',
      query: 'lead quality form reconciliation',
    }, config);
    assert.match(opened.cite, /^01_Clients\/Omega\/status\.md:\d+$/);
    assert.match(opened.excerpt, /Lead quality/);
    assert.ok(opened.excerpt.length <= 1200, 'excerpt respects the cap');
    const whole = await execute('kb_read', { path: '01_Clients/Omega/status.md' }, config);
    assert.ok(opened.excerpt.length <= whole.content.length);
  });

  it('kb_open honours the same allowlist as kb_read', () => {
    assert.throws(
      () => knowledge.openKnowledge({ path: '12_Brain/private/secrets.md', query: 'x' }),
      /allowlist|escapes|private/,
    );
    assert.throws(
      () => knowledge.openKnowledge({ path: '../../etc/passwd', query: 'x' }),
      /escapes|allowlist/,
    );
  });
});

describe('front door', () => {
  it('compiles the four sources and keeps the queue to titles', () => {
    const brief = compileBrief({ force: true });
    assert.match(brief, /INDEX\.md/);
    assert.match(brief, /operating-status\.md/);
    assert.match(brief, /approval-queue\.md/);
    assert.match(brief, /IMMOHRTAL CLAW\.md/);
    assert.match(brief, /Omega - approve budget change/);
    // Titles only: the queue body must not ride along.
    assert.doesNotMatch(brief, /must not reach the brief/);
  });

  it('rides in the system prompt without swallowing the vault', () => {
    const built = buildSystemPrompt(config);
    assert.match(built.prompt, /Operator front door/);
    assert.match(built.prompt, /Active roster: Omega Landscaping/);
    assert.doesNotMatch(built.prompt, /redacted/);
  });
});

describe('brief_write', () => {
  it('writes into Daily-Briefs and refuses everything else', async () => {
    const out = await execute('brief_write', {
      name: '2026-08-18 - harness check',
      content: '# check\n\nbody\n',
    }, config);
    assert.equal(out.path, 'Daily-Briefs/2026-08-18 - harness check.md');
    assert.ok(fs.existsSync(path.join(vault, out.path)));

    for (const bad of [{ name: '../escape.md' }, { name: 'sub/dir.md' }]) {
      await assert.rejects(
        () => execute('brief_write', { ...bad, content: 'x' }, config),
        /bare filename|escapes/,
      );
    }
    await assert.rejects(
      () => execute('brief_write', { name: 'empty.md', content: '   ' }, config),
      /empty/,
    );
    await assert.rejects(
      () => execute('brief_write', { name: '2026-08-18 - harness check', content: 'again' }, config),
      /already exists/,
    );
  });
});

describe('memory hygiene', () => {
  it('refuses to persist credentials', () => {
    for (const secret of [
      'sk-ant-api03-AbCdEfGhIjKlMnOpQrStUvWx',
      'XAI_API_KEY=xai-abcdefghijklmnopqrstuv',
      'password: hunter2xyz',
      '-----BEGIN RSA PRIVATE KEY-----',
    ]) {
      assert.throws(
        () => memory.writeMemory({ text: secret, maxBytes: config.memoryMaxBytes }),
        /credential/,
        secret.slice(0, 20),
      );
    }
  });

  it('still stores ordinary facts and pointers', () => {
    assert.ok(memory.writeMemory({
      text: 'the xAI key lives in immohrtal-claw/.env',
      kind: 'pref',
      maxBytes: config.memoryMaxBytes,
    }));
    // A git SHA is not a secret; the guard must not be trigger-happy.
    assert.ok(memory.writeMemory({
      text: 'commit a6aa1b1483f2c9e0d1b2c3d4e5f60718293a4b5c is the baseline',
      maxBytes: config.memoryMaxBytes,
    }));
  });

  it('compiles a deduplicated daily tape', () => {
    const marker = `tape-dupe-${Date.now()}`;
    for (let i = 0; i < 3; i += 1) {
      memory.writeMemory({ text: marker, kind: 'pref', maxBytes: config.memoryMaxBytes });
    }
    const tape = memory.compileDailyTape();
    assert.ok(tape.unique < tape.raw, 'duplicates collapse');
    const body = fs.readFileSync(tape.path, 'utf8');
    assert.equal(body.split(marker).length - 1, 1, 'marker appears exactly once');
  });
});

describe('ollama tag matching', () => {
  it('requires an exact tag, not a prefix', () => {
    const gemma = CATALOG.find((m) => m.id === 'gemma4-31b');
    assert.equal(readiness(gemma, ['gemma4:31b-cloud']).ready, false, 'gemma4:31b-cloud must not satisfy gemma4:31b');
    assert.match(readiness(gemma, ['gemma4:31b-cloud']).blocker, /ollama pull/);
    assert.equal(readiness(gemma, ['gemma4:31b']).ready, true);
  });

  it('accepts workstation near-misses as exact aliases', () => {
    const gemma = CATALOG.find((m) => m.id === 'gemma4-31b');
    const coder = CATALOG.find((m) => m.id === 'qwen3-coder');
    const qwen = CATALOG.find((m) => m.id === 'qwen3.6-27b');
    assert.equal(readiness(gemma, ['gemma4:26b']).ready, true);
    assert.equal(resolveOllamaTag(gemma, ['gemma4:26b']), 'gemma4:26b');
    assert.equal(readiness(coder, ['qwen3-coder:30b']).ready, true);
    assert.equal(resolveOllamaTag(coder, ['qwen3-coder:30b']), 'qwen3-coder:30b');
    assert.equal(readiness(qwen, ['qwen3.5:27b-q4_K_M']).ready, false, 'reasoning 27B must not alias to Qwen3.6');
  });

  it('calls the resolved alias tag, not the missing canonical', () => {
    rememberOllamaTags(['gemma4:26b', 'qwen3-coder:30b']);
    assert.equal(resolveSelection('gemma4-31b').provider.model, 'gemma4:26b');
    assert.equal(resolveSelection('qwen3-coder').provider.model, 'qwen3-coder:30b');
    rememberOllamaTags([]);
  });
});

describe('cloud catalog', () => {
  it('wires Sol and Grok to their real endpoints and key names', () => {
    const sol = CATALOG.find((m) => m.id === 'gpt-5.6-sol');
    const grok = CATALOG.find((m) => m.id === 'grok-4.6');
    const opus = CATALOG.find((m) => m.id === 'claude-opus-5');
    assert.equal(sol.keyEnv, 'OPENAI_API_KEY');
    assert.equal(sol.model, 'gpt-5.6-sol');
    assert.equal(sol.defaultBaseUrl, 'https://api.openai.com/v1');
    assert.equal(grok.keyEnv, 'XAI_API_KEY');
    assert.equal(grok.model, 'grok-4.6');
    assert.equal(grok.defaultBaseUrl, 'https://api.x.ai/v1');
    assert.equal(opus.keyEnv, 'ANTHROPIC_API_KEY');
    if (!process.env.OPENAI_API_KEY) {
      assert.equal(readiness(sol, []).ready, false);
      assert.match(readiness(sol, []).blocker, /OPENAI_API_KEY/);
    }
    if (!process.env.XAI_API_KEY && !process.env.GROK_API_KEY) {
      assert.equal(readiness(grok, []).ready, false);
      assert.match(readiness(grok, []).blocker, /XAI_API_KEY/);
    }
  });
});

describe('listen port', () => {
  it('defaults to 4810 and lets CLAW_PORT win over PORT', () => {
    const prevPort = process.env.PORT;
    const prevClaw = process.env.CLAW_PORT;
    delete process.env.PORT;
    delete process.env.CLAW_PORT;
    assert.equal(resolvePort(), 4810);
    process.env.PORT = '4800';
    assert.equal(resolvePort(), 4800);
    process.env.CLAW_PORT = '4810';
    assert.equal(resolvePort(), 4810);
    if (prevPort == null) delete process.env.PORT; else process.env.PORT = prevPort;
    if (prevClaw == null) delete process.env.CLAW_PORT; else process.env.CLAW_PORT = prevClaw;
  });
});

describe('env load order', () => {
  it('loads .env before anything reads process.env at module scope', () => {
    const src = fs.readFileSync(path.join(root, 'server.js'), 'utf8');
    const loaded = src.indexOf('loadDotEnv(ENV_FILE)');
    const config = src.indexOf("require('./src/config')");
    const gateway = src.indexOf("require('./src/gateway')");
    assert.ok(loaded > 0, 'server.js loads .env');
    // models.js builds CATALOG at require time from process.env. Requiring
    // config first silently drops every CLAW_*_MODEL and OLLAMA_HOST override.
    assert.ok(loaded < config, '.env must load before src/config');
    assert.ok(loaded < gateway, '.env must load before src/gateway');
  });
});

describe('browser transport', () => {
  const clearCdp = () => {
    delete process.env.CLAW_CDP_URL;
    delete process.env.BOX_CDP_URL;
  };

  it('registers browser_read only when a CDP endpoint is configured', () => {
    clearCdp();
    assert.equal(schemas(config).some((t) => t.function.name === 'browser_read'), false);
    process.env.CLAW_CDP_URL = 'http://127.0.0.1:59999';
    assert.equal(schemas(config).some((t) => t.function.name === 'browser_read'), true);
    clearCdp();
  });

  it('refuses to run at all without an endpoint', async () => {
    clearCdp();
    await assert.rejects(() => browser.readPage({ url: 'https://example.com' }), /CLAW_CDP_URL/);
  });

  it('blocks private hosts through the browser path, not just web_fetch', async () => {
    process.env.CLAW_CDP_URL = 'http://127.0.0.1:59999';
    for (const bad of ['http://127.0.0.1/secret', 'http://localhost/admin']) {
      await assert.rejects(() => browser.readPage({ url: bad }), /private/);
    }
    clearCdp();
  });
});

describe('second opinion', () => {
  it('refuses honestly rather than letting one family check itself', async () => {
    const out = await execute('second_opinion', { claim: 'Omega is at risk.' }, config);
    assert.equal(out.checked, false);
    assert.ok(/second model family|Checker call failed/.test(out.reason));
  });
});

describe('skills', () => {
  it('loads the new PicoClaw skills and gates the unconfigured ones', () => {
    const skills = loadSkills();
    const ids = skills.map((s) => s.id);
    for (const need of ['inbox-triage', 'client-pulse', 'gbp-content-drafts', 'report-builder', 'brain-roster']) {
      assert.ok(ids.includes(need), need);
    }
    const gated = skills.filter((s) => !s.available).map((s) => s.id);
    assert.deepEqual(gated.sort(), ['browser-read', 'calendar-read']);

    // A gated skill must not be advertised as usable in the system prompt.
    const text = summary(skills);
    assert.match(text, /inbox-triage/);
    assert.match(text, /calendar-read: UNAVAILABLE/);
  });
});

describe('streaming', () => {
  const frames = {
    openai: [
      '{"choices":[{"delta":{"content":"Check"}}]}',
      '{"choices":[{"delta":{"content":"ing"}}]}',
      '{"choices":[{"delta":{"tool_calls":[{"index":0,"id":"c1","function":{"name":"kb_sea"}}]}}]}',
      '{"choices":[{"delta":{"tool_calls":[{"index":0,"function":{"name":"rch","arguments":"{\\"q"}}]}}]}',
      '{"choices":[{"delta":{"tool_calls":[{"index":0,"function":{"arguments":"\\":1}"}}]}}]}',
      '[DONE]',
    ],
    anthropic: [
      '{"type":"content_block_start","index":0,"content_block":{"type":"text"}}',
      '{"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":"Check"}}',
      '{"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":"ing"}}',
      '{"type":"content_block_start","index":1,"content_block":{"type":"tool_use","id":"t1","name":"kb_search"}}',
      '{"type":"content_block_delta","index":1,"delta":{"type":"input_json_delta","partial_json":"{\\"q"}}',
      '{"type":"content_block_delta","index":1,"delta":{"type":"input_json_delta","partial_json":"\\":1}"}}',
    ],
    google: [
      '{"candidates":[{"content":{"parts":[{"text":"Check"}]}}]}',
      '{"candidates":[{"content":{"parts":[{"text":"ing"}]}}]}',
      '{"candidates":[{"content":{"parts":[{"functionCall":{"name":"kb_search","args":{"q":1}}}]}}]}',
    ],
  };

  for (const api of ['openai', 'anthropic', 'google']) {
    it(`streams ${api} text and reassembles tool calls split across chunks`, async () => {
      const server = http.createServer((req, res) => {
        res.writeHead(200, { 'content-type': 'text/event-stream' });
        for (const f of frames[api]) {
          const line = `data: ${f}\n\n`;
          // Split mid-line to prove the reader reassembles across chunks.
          res.write(line.slice(0, 9));
          res.write(line.slice(9));
        }
        res.end();
      });
      await new Promise((r) => server.listen(0, '127.0.0.1', r));
      const { port } = server.address();
      const deltas = [];
      try {
        const msg = await streamLive({
          config: {
            provider: {
              api, baseUrl: `http://127.0.0.1:${port}`, apiKey: 'k', model: 'm', label: api,
            },
          },
          messages: [{ role: 'system', content: 'sys' }, { role: 'user', content: 'hi' }],
          tools: [],
          onDelta: (t) => deltas.push(t),
        });
        assert.deepEqual(deltas, ['Check', 'ing'], 'tokens arrive incrementally');
        assert.equal(msg.content, 'Checking');
        assert.equal(msg.tool_calls.length, 1);
        assert.equal(msg.tool_calls[0].function.name, 'kb_search');
        assert.deepEqual(JSON.parse(msg.tool_calls[0].function.arguments), { q: 1 });
      } finally {
        server.close();
      }
    });
  }

  it('emits llm.delta through the gateway SSE stream', async () => {
    const server = createServer(config);
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    const { port } = server.address();
    try {
      const res = await fetch(`http://127.0.0.1:${port}/api/chat`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ session_id: 'stream_test', message: 'Who are you?', stream: true }),
      });
      assert.equal(res.headers.get('x-accel-buffering'), 'no', 'proxies must not buffer SSE');
      const text = await res.text();
      assert.match(text, /event: llm\.delta/);
      assert.match(text, /event: done/);
    } finally {
      server.close();
    }
  });
});
