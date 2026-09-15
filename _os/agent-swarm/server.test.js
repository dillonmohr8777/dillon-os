'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const {
  ApiError,
  MissionStore,
  MODEL_CHOICES,
  normalizeMissionInput,
  OpenAIClient,
  createServer,
  fetchSubagents,
  pollActiveMissions,
  reconcileMission,
  refreshMission,
  resolveUncertainMission,
  sendMissionMessage,
  startMission,
} = require('./server');

const team = {
  id: 'engineering',
  name: 'Engineering',
  description: 'Build and check.',
  instructions: 'Use bounded changes.',
  roles: [
    { name: 'Builder', task: 'Build.' },
    { name: 'Tester', task: 'Test.' },
    { name: 'Reviewer', task: 'Review.' },
  ],
};

test('new missions default to GPT-5.5 xhigh and retain explicit model choices', () => {
  const input = { title: 'Default lead', brief: 'Check defaults.' };
  assert.equal(MODEL_CHOICES.find(model => model.default).id, 'gpt-5.5');
  assert.equal(normalizeMissionInput(input, [team]).model, 'gpt-5.5');
  assert.equal(normalizeMissionInput(input, [team]).reasoning, 'xhigh');
  assert.equal(normalizeMissionInput({ ...input, model: 'gpt-5.5' }, [team]).reasoning, 'xhigh');
});

function tempDir(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-swarm-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  return dir;
}

function writeTeams(t) {
  const file = path.join(tempDir(t), 'teams.json');
  fs.writeFileSync(file, `${JSON.stringify([team], null, 2)}\n`, 'utf8');
  return file;
}

function missionInput(overrides = {}) {
  return {
    title: 'Test mission',
    brief: 'Do the thing.',
    team: 'engineering',
    model: 'gpt-5.5',
    reasoning: 'xhigh',
    workers: 1,
    ...overrides,
  };
}

class FakeClient {
  constructor(options = {}) {
    Object.assign(this, {
      configured: true,
      createCalls: [],
      events: [],
      paginateCalls: [],
      createResponse: { id: 'sess_1', status: 'in_progress' },
      session: { status: 'idle' },
      turns: [{ id: 'turn_1', status: 'in_progress', created_at: 1000 }],
      items: [],
      subagents: [],
      subagentTurns: [],
      artifacts: [],
    }, options);
  }

  keyConfigured() {
    return this.configured;
  }

  async createSession(payload) {
    this.createCalls.push(payload);
    if (this.createError) throw this.createError;
    return this.createResponse;
  }

  async getSession() {
    return this.session;
  }

  async paginate(apiPath) {
    this.paginateCalls.push(apiPath);
    if (apiPath.includes('/subagents/') && apiPath.includes('/turns')) return this.subagentTurns;
    if (apiPath.includes('/subagents')) return this.subagents;
    if (apiPath.includes('/turns')) return this.turns;
    if (apiPath.includes('/items')) return this.items;
    if (apiPath.includes('/artifacts')) return this.artifacts;
    return [];
  }

  async sendEvents(sessionId, events) {
    this.events.push({ sessionId, events });
    if (this.eventError) throw this.eventError;
    return {};
  }
}

test('latest main turn controls lifecycle and recovered failures become warnings', () => {
  const mission = { ...missionInput(), id: 'm_1', status: 'running', messages: [], artifacts: [], usage: {} };
  const oldFailedItem = { id: 'item_old', turn_id: 'turn_old', type: 'mcp_call', status: 'failed' };
  const newerCompleted = reconcileMission(mission, {
    session: { status: 'idle' },
    turns: [
      { id: 'turn_old', status: 'completed', created_at: 1000 },
      { id: 'turn_new', status: 'completed', created_at: 2000 },
    ],
    items: [oldFailedItem],
    subagents: [],
    artifacts: [],
  });
  assert.equal(newerCompleted.status, 'completed');

  const newerRunning = reconcileMission(mission, {
    session: { status: 'idle' },
    turns: [
      { id: 'turn_old', status: 'completed', created_at: 1000 },
      { id: 'turn_new', status: 'in_progress', created_at: 2000 },
    ],
    items: [oldFailedItem],
    subagents: [],
    artifacts: [],
  });
  assert.equal(newerRunning.status, 'running');

  const latestToolWarning = reconcileMission(mission, {
    session: { status: 'idle' },
    turns: [{ id: 'turn_new', status: 'completed', created_at: 2000 }],
    items: [{ id: 'item_new', turn_id: 'turn_new', type: 'mcp_call', status: 'failed' }],
    subagents: [],
    artifacts: [],
  });
  assert.equal(latestToolWarning.status, 'completed_with_warnings');
});

test('subagent status is derived from worker turns when provider object stays active', async () => {
  const client = new FakeClient({
    subagents: [{ id: 'sub_1', name: 'Builder', status: 'active' }],
    subagentTurns: [{ id: 'sub_turn_1', status: 'completed', created_at: 1000 }],
  });
  const subagents = await fetchSubagents(client, 'sess_1');
  assert.equal(subagents[0].provider_status, 'active');
  assert.equal(subagents[0].status, 'completed');
  assert.equal(subagents[0].completed_turn_count, 1);
  assert.equal(subagents[0].model, null);
});

test('store persists missions and restart marks interrupted creates uncertain', (t) => {
  const dir = tempDir(t);
  const store = new MissionStore({ dataDir: dir });
  const mission = store.create(missionInput());
  mission.status = 'starting';
  store.save(mission);

  const restarted = new MissionStore({ dataDir: dir });
  restarted.recoverUncertainCreates();
  const recovered = restarted.get(mission.id);
  assert.equal(recovered.status, 'uncertain_create');
  assert.match(recovered.error, /not retried/);
});

test('HTTP rejects invalid mission input, bad hosts, cross-site origins, and non-JSON mutations', async (t) => {
  const server = createServer({
    dataDir: tempDir(t),
    teamsPath: writeTeams(t),
    startPolling: false,
    env: { OPENAI_API_KEY: 'test-key' },
  });
  const port = await listen(server);
  t.after(() => close(server));

  assert.equal((await request(port, 'GET', '/api/state', { host: 'evil.test' })).status, 403);
  assert.equal((await request(port, 'POST', '/api/missions', {
    origin: 'http://evil.test',
    body: missionInput(),
  })).status, 403);
  assert.equal((await request(port, 'POST', '/api/missions', {
    secFetchSite: 'cross-site',
    body: missionInput(),
  })).status, 403);
  assert.equal((await request(port, 'POST', '/api/missions', {
    rawBody: JSON.stringify(missionInput()),
    contentType: null,
  })).status, 415);

  const invalid = await request(port, 'POST', '/api/missions', {
    origin: `http://127.0.0.1:${port}`,
    body: missionInput({ workers: 4 }),
  });
  assert.equal(invalid.status, 400);
  assert.match(invalid.json.error, /workers/);

  const overlong = await request(port, 'POST', '/api/missions', {
    origin: `http://127.0.0.1:${port}`,
    body: missionInput({ title: 'x'.repeat(161) }),
  });
  assert.equal(overlong.status, 400);
  assert.match(overlong.json.error, /title/);
});

test('start creates exactly one hosted session and duplicate starts do not retry', async (t) => {
  const store = new MissionStore({ dataDir: tempDir(t) });
  const mission = store.create(missionInput({ workers: 1 }));
  const client = new FakeClient();
  const teamsPath = writeTeams(t);

  const first = await startMission(store, mission.id, client, teamsPath);
  assert.equal(first.ok, true);
  assert.equal(client.createCalls.length, 1);
  assert.equal(client.createCalls[0].agent.multi_agent.enabled, true);
  assert.equal(client.createCalls[0].agent.multi_agent.max_concurrent_subagents, 1);
  assert.match(client.createCalls[0].agent.instructions, /initial mission turn only, create exactly 1 named subagent/);
  assert.match(client.createCalls[0].agent.instructions, /later user directions.*coordinator/);

  const second = await startMission(store, mission.id, client, teamsPath);
  assert.equal(second.ok, false);
  assert.equal(second.code, 409);
  assert.equal(client.createCalls.length, 1);
});

test('provider 4xx fails safely while provider 5xx and network create uncertainty hold the lock', async (t) => {
  const teamsPath = writeTeams(t);
  const providerStore = new MissionStore({ dataDir: tempDir(t) });
  const providerMission = providerStore.create(missionInput());
  const providerClient = new FakeClient({ createError: new ApiError(400, 'bad request', { provider: true }) });
  const providerResult = await startMission(providerStore, providerMission.id, providerClient, teamsPath);
  assert.equal(providerResult.code, 502);
  assert.equal(providerStore.get(providerMission.id).status, 'failed');

  const uncertainStore = new MissionStore({ dataDir: tempDir(t) });
  const uncertainMission = uncertainStore.create(missionInput());
  const uncertainClient = new FakeClient({ createError: new ApiError(500, 'server error after possible create', { provider: true, uncertain: true }) });
  const uncertainResult = await startMission(uncertainStore, uncertainMission.id, uncertainClient, teamsPath);
  assert.equal(uncertainResult.code, 202);
  assert.equal(uncertainStore.get(uncertainMission.id).status, 'uncertain_create');
  assert.equal(uncertainStore.activeMission().id, uncertainMission.id);

  const duplicate = await startMission(uncertainStore, uncertainMission.id, uncertainClient, teamsPath);
  assert.equal(duplicate.code, 409);
  assert.equal(uncertainClient.createCalls.length, 1);
});

test('followup waits for a new main turn instead of treating old completion as done', async (t) => {
  const store = new MissionStore({ dataDir: tempDir(t) });
  const mission = store.create(missionInput());
  mission.status = 'completed';
  mission.sessionId = 'sess_1';
  mission.turns = [{ id: 'turn_old', status: 'completed', created_at: 1000 }];
  store.save(mission);

  const client = new FakeClient({
    turns: [{ id: 'turn_old', status: 'completed', created_at: 1000 }],
  });
  const sent = await sendMissionMessage(store, mission.id, client, 'Please revise.');
  assert.equal(sent.ok, true);
  assert.equal(store.get(mission.id).status, 'running');
  assert.equal(store.get(mission.id).pendingTurn.baselineTurnId, 'turn_old');

  client.turns = [{ id: 'turn_new', status: 'completed', created_at: 1000 }];
  const refreshed = await refreshMission(store, mission.id, client);
  assert.equal(refreshed.status, 'completed');
  assert.equal(refreshed.pendingTurn, null);
});

test('followup timestamp fallback is used only when turn IDs are missing', async (t) => {
  const store = new MissionStore({ dataDir: tempDir(t) });
  const mission = store.create(missionInput());
  mission.status = 'completed';
  mission.sessionId = 'sess_1';
  mission.turns = [{ id: null, status: 'completed', created_at: 1000 }];
  store.save(mission);

  const oldClient = new FakeClient({ turns: [{ id: null, status: 'completed', created_at: 1000 }] });
  await sendMissionMessage(store, mission.id, oldClient, 'Try again.');
  assert.equal(store.get(mission.id).status, 'running');

  const fresh = store.get(mission.id);
  fresh.pendingTurn.submittedAt = new Date(1000 * 1000).toISOString();
  store.save(fresh);
  oldClient.turns = [{ id: null, status: 'completed', created_at: 1000 }];
  const sameSecond = await refreshMission(store, mission.id, oldClient);
  assert.equal(sameSecond.status, 'completed');
  assert.equal(sameSecond.pendingTurn, null);
});

test('known rejected followup clears pending and restores prior lifecycle, uncertain stays held', async (t) => {
  const knownStore = new MissionStore({ dataDir: tempDir(t) });
  const known = knownStore.create(missionInput());
  known.status = 'completed';
  known.sessionId = 'sess_known';
  known.turns = [{ id: 'turn_done', status: 'completed', created_at: 1000 }];
  knownStore.save(known);
  const knownClient = new FakeClient({ eventError: new ApiError(400, 'bad followup', { provider: true }) });
  const knownResult = await sendMissionMessage(knownStore, known.id, knownClient, 'bad');
  assert.equal(knownResult.code, 502);
  assert.equal(knownStore.get(known.id).status, 'completed');
  assert.equal(knownStore.get(known.id).pendingTurn, null);
  assert.equal(knownStore.get(known.id).messages.at(-1).status, 'failed');

  const uncertainStore = new MissionStore({ dataDir: tempDir(t) });
  const uncertain = uncertainStore.create(missionInput());
  uncertain.status = 'completed';
  uncertain.sessionId = 'sess_uncertain';
  uncertain.turns = [{ id: 'turn_done', status: 'completed', created_at: 1000 }];
  uncertainStore.save(uncertain);
  const uncertainClient = new FakeClient({ eventError: new ApiError(502, 'network error; mutation status uncertain', { uncertain: true, responseKnown: false }) });
  const uncertainResult = await sendMissionMessage(uncertainStore, uncertain.id, uncertainClient, 'maybe sent');
  assert.equal(uncertainResult.code, 202);
  assert.equal(uncertainStore.get(uncertain.id).status, 'running');
  assert.equal(uncertainStore.get(uncertain.id).pendingTurn.baselineTurnId, 'turn_done');
  assert.equal(uncertainStore.get(uncertain.id).messages.at(-1).status, 'uncertain');
});

test('uncertain create can be explicitly released as an unresolved orphan without retrying', async (t) => {
  const store = new MissionStore({ dataDir: tempDir(t) });
  const mission = store.create(missionInput());
  mission.status = 'uncertain_create';
  store.save(mission);

  const denied = await resolveUncertainMission(store, mission.id, {});
  assert.equal(denied.code, 400);
  assert.equal(store.activeMission().id, mission.id);

  const released = await resolveUncertainMission(store, mission.id, { acknowledgeOrphan: true });
  assert.equal(released.ok, true);
  const updated = store.get(mission.id);
  assert.equal(updated.status, 'unresolved_orphan');
  assert.match(updated.warning, /does NOT cancel any possible hosted orphan/);
  assert.equal(store.activeMission(), null);
});

test('resolve-uncertain route requires acknowledgement and only releases sessionless uncertain creates', async (t) => {
  const store = new MissionStore({ dataDir: tempDir(t) });
  const mission = store.create(missionInput());
  mission.status = 'uncertain_create';
  store.save(mission);
  const server = createServer({
    store,
    teamsPath: writeTeams(t),
    startPolling: false,
    env: { OPENAI_API_KEY: 'test-key' },
  });
  const port = await listen(server);
  t.after(() => close(server));

  const response = await request(port, 'POST', `/api/missions/${mission.id}/resolve-uncertain`, {
    origin: `http://127.0.0.1:${port}`,
    body: { acknowledgeOrphan: true },
  });
  assert.equal(response.status, 200);
  assert.equal(response.json.mission.status, 'unresolved_orphan');
});

test('same mission operations reject concurrent refresh and polling skips busy missions', async (t) => {
  const store = new MissionStore({ dataDir: tempDir(t) });
  const mission = store.create(missionInput());
  mission.status = 'running';
  mission.sessionId = 'sess_busy';
  mission.turns = [{ id: 'turn_1', status: 'in_progress', created_at: 1000 }];
  store.save(mission);

  let release;
  let entered;
  const enteredPromise = new Promise((resolve) => { entered = resolve; });
  const releasePromise = new Promise((resolve) => { release = resolve; });
  const client = new FakeClient();
  client.paginate = async (apiPath) => {
    client.paginateCalls.push(apiPath);
    if (apiPath.includes('/turns') && !apiPath.includes('/subagents/')) {
      entered();
      await releasePromise;
      return [{ id: 'turn_1', status: 'in_progress', created_at: 1000 }];
    }
    return [];
  };

  const refreshing = refreshMission(store, mission.id, client);
  await enteredPromise;
  const rejected = await sendMissionMessage(store, mission.id, client, 'while busy');
  assert.equal(rejected.code, 409);
  await pollActiveMissions(store, client);
  assert.equal(store.get(mission.id).error, null);
  release();
  await refreshing;
});

test('failed polling preserves newer local state written before error save', async (t) => {
  const store = new MissionStore({ dataDir: tempDir(t) });
  const mission = store.create(missionInput());
  mission.status = 'running';
  mission.sessionId = 'sess_poll_error';
  mission.turns = [{ id: 'turn_1', status: 'in_progress', created_at: 1000 }];
  store.save(mission);

  const injectedMessage = { id: 'local_new', source: 'local', role: 'user', status: 'sent', createdAt: '2026-01-01T00:00:01.000Z', text: 'newer followup' };
  const originalWithLock = store.withLock.bind(store);
  let injectCountdown = 0;
  store.withLock = async (fn) => {
    if (injectCountdown > 0) {
      injectCountdown -= 1;
      if (injectCountdown === 0) {
        const data = store.readData();
        const current = data.missions.find((item) => item.id === mission.id);
        current.messages = [injectedMessage];
        current.pendingTurn = { type: 'message', baselineTurnId: 'turn_1', baselineWasActive: true, priorStatus: 'running', submittedAt: injectedMessage.createdAt };
        current.updatedAt = injectedMessage.createdAt;
        store.writeData(data);
      }
    }
    return originalWithLock(fn);
  };

  const client = new FakeClient();
  client.getSession = async () => {
    injectCountdown = 2;
    throw new ApiError(502, 'provider unavailable', { provider: true });
  };

  await pollActiveMissions(store, client);
  const updated = store.get(mission.id);
  assert.equal(updated.error, 'provider unavailable');
  assert.deepEqual(updated.messages, [injectedMessage]);
  assert.equal(updated.pendingTurn.baselineTurnId, 'turn_1');
  assert.equal(updated.status, 'running');
});

test('watchdog version resets for genuinely new turns', () => {
  const mission = {
    ...missionInput(),
    id: 'm_watch',
    status: 'running',
    messages: [],
    artifacts: [],
    usage: {},
    watchdogTurnKey: 'id:turn_old',
    autoCancelRequestedAt: '2026-01-01T00:00:00.000Z',
  };
  const same = reconcileMission(mission, {
    session: { status: 'idle' },
    turns: [{ id: 'turn_old', status: 'in_progress', created_at: 1000 }],
    items: [],
    subagents: [],
    artifacts: [],
  });
  assert.equal(same.autoCancelRequestedAt, '2026-01-01T00:00:00.000Z');

  const next = reconcileMission(mission, {
    session: { status: 'idle' },
    turns: [{ id: 'turn_new', status: 'in_progress', created_at: 1001 }],
    items: [],
    subagents: [],
    artifacts: [],
  });
  assert.equal(next.watchdogTurnKey, 'id:turn_new');
  assert.equal(next.autoCancelRequestedAt, null);
});

test('OpenAI client uses Agents beta header and paginates list resources', async () => {
  const requests = [];
  const client = new OpenAIClient({
    apiKey: 'test-key',
    fetch: async (url, options) => {
      requests.push({ url, options });
      const parsed = new URL(url);
      const after = parsed.searchParams.get('after');
      const body = after
        ? { data: [{ id: 'turn_2' }], has_more: false }
        : { data: [{ id: 'turn_1' }], has_more: true, last_id: 'turn_1' };
      return new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json' } });
    },
  });
  const rows = await client.paginate('agents/sessions/sess_1/turns');
  assert.deepEqual(rows.map((row) => row.id), ['turn_1', 'turn_2']);
  assert.equal(requests[0].options.headers.authorization, 'Bearer test-key');
  assert.equal(requests[0].options.headers['openai-beta'], 'agents=v1');
  assert.match(requests[1].url, /after=turn_1/);
});

function listen(server) {
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve(server.address().port));
  });
}

function close(server) {
  return new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  });
}

function request(port, method, route, options = {}) {
  return new Promise((resolve, reject) => {
    const body = options.rawBody !== undefined ? options.rawBody : options.body === undefined ? null : JSON.stringify(options.body);
    const headers = { host: options.host || `127.0.0.1:${port}` };
    if (options.origin) headers.origin = options.origin;
    if (options.secFetchSite) headers['sec-fetch-site'] = options.secFetchSite;
    if (body != null && options.contentType !== null) headers['content-type'] = options.contentType || 'application/json';
    const req = http.request({ hostname: '127.0.0.1', port, method, path: route, headers }, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const text = Buffer.concat(chunks).toString('utf8');
        let json = null;
        try {
          json = JSON.parse(text);
        } catch {}
        resolve({ status: res.statusCode, headers: res.headers, text, json });
      });
    });
    req.on('error', reject);
    if (body != null) req.write(body);
    req.end();
  });
}
