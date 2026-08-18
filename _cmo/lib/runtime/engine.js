/**
 * The agent engine.
 *
 * One code path runs every agent, and it is the path that makes an agent run
 * accountable rather than magical:
 *
 *   context  -> the workspace profile, voice, and connector snapshots the
 *               agent is allowed to see, assembled once and hashed so the
 *               journal records exactly what the agent knew
 *   journal  -> every step checkpointed; a run can be explained or replayed
 *   guardrails -> every artifact checked before it can reach a human
 *   approval -> every external effect opened as an approval, never performed
 *   ledger   -> every model call priced in dollars, attributed to this agent
 *
 * An agent is a plain object with a `run({ ctx, step, emit })` function. It
 * cannot reach the store, the provider, or a connector directly - everything
 * arrives through `ctx`. That is what keeps one client's data out of another
 * client's run, and it is what makes agents testable without a network.
 */

import { newId } from '../core/ids.js';
import { digest } from '../core/hash.js';
import { errorPayload, ValidationError, ApprovalRequired } from '../core/errors.js';
import { createJournal, loadJournal, RECORD, REPLAY, explainRun } from './journal.js';
import { runGuardrails } from '../brand/guardrails.js';
import { riskFor, RISK } from './approval.js';

export const RUN_RUNNING = 'running';
export const RUN_OK = 'ok';
export const RUN_FAILED = 'failed';
export const RUN_SKIPPED = 'skipped';

/**
 * @typedef {object} AgentDef
 * @property {string} id
 * @property {string} label
 * @property {string} lane           organic | paid | local | measurement | ops
 * @property {string} cadence        daily | weekly | monthly | on_demand
 * @property {string[]} needs        connector ids this agent wants
 * @property {string[]} optional     connectors it can work without
 * @property {string} produces       artifact kind
 * @property {string} effect         approval effect id (decides risk tier)
 * @property {function} run          async ({ ctx, step, emit }) => summary
 */

export function createEngine({
  store, wsId, clock, llm, approvals, budget, breakers, connectors = {}, logger,
  actor = 'agent', agents = {},
}) {
  const ws = store.ws(wsId);

  /**
   * Assemble the context an agent is allowed to see.
   *
   * Hashed into `contextHash`, which goes on the run header. Two runs with the
   * same context hash and the same agent version should produce the same work;
   * when they do not, the journal shows which step diverged.
   */
  async function buildContext({ agent, runId, journal, params = {} }) {
    const profile = (await ws.getSingleton('profile')) || { name: wsId, unverified: true };
    const voice = (await ws.getSingleton('voice')) || null;
    const guardrailPolicy = (await ws.getSingleton('guardrails')) || {};
    const workspace = (await store.getWorkspace(wsId)) || { id: wsId };

    // Connector snapshots: each connector reports whether it is live, degraded
    // (fixture-backed), or unavailable. An agent that needs a connector which
    // is unavailable is SKIPPED with a named reason, not failed silently.
    const conn = {};
    for (const id of [...(agent.needs || []), ...(agent.optional || [])]) {
      const c = connectors[id];
      conn[id] = c
        ? { id, mode: c.mode, available: c.mode !== 'unavailable', capabilities: c.capabilities || [] }
        : { id, mode: 'unavailable', available: false, capabilities: [] };
    }

    const evidence = [];
    const ctx = {
      workspaceId: wsId,
      workspace,
      profile,
      voice,
      guardrailPolicy,
      params,
      connectors: conn,
      runId,
      today: clock.date(),
      now: clock.iso(),

      /** Read a connector, through the breaker, journaled as its own step. */
      async fetch(connectorId, method, args = {}) {
        // NOTE: journal.step, not a shared closure variable. Two workspaces can
        // run concurrently in one process, and a module-scoped step binding
        // would cross-write their journals.
        const c = connectors[connectorId];
        if (!c) throw new ValidationError(`connector ${connectorId} is not configured`);
        if (typeof c[method] !== 'function') throw new ValidationError(`connector ${connectorId} has no method ${method}`);
        return journal.step(`connector:${connectorId}.${method}`, async (meter) => {
          const out = await c[method](args);
          if (out?.sources) meter.sources.push(...out.sources);
          meter.notes.push(`${connectorId}.${method} in ${c.mode} mode`);
          return out;
        }, { inputs: { connectorId, method, args, mode: c.mode }, kind: 'connector' });
      },

      /** Call the model. Cost, routing rationale, and retries are journaled. */
      async model({ taskClass, system, user, schema, nocache = false, name = null }) {
        return journal.step(name || `model:${taskClass}`, async (meter) => {
          const out = await llm.complete({
            taskClass, system, user, schema, meter, agent: agent.id, runId, nocache,
          });
          return { text: out.text, parsed: out.parsed, model: out.model, usd: out.usd, cached: out.cached };
        }, { inputs: { taskClass, system, user, schema: schema?.name || null }, kind: 'model' });
      },

      /** Record a source receipt. Immutable; this is what claims point at. */
      async cite({ ref, url = null, note = null, kind = 'source' }) {
        const record = { ref, url, note, kind, agent: agent.id, runId };
        evidence.push(record);
        await ws.append('evidence', record);
        return record;
      },

      evidence: () => evidence.slice(),
      logger: logger.child(agent.id, { workspaceId: wsId, runId }),
    };
    return ctx;
  }

  /**
   * Run one agent.
   *
   * @param {object} opts
   * @param {string} opts.agentId
   * @param {object} opts.params
   * @param {string} opts.replayOf   a prior run id to replay from
   */
  async function run({ agentId, params = {}, replayOf = null, dryRun = false }) {
    const agent = agents[agentId];
    if (!agent) throw new ValidationError(`unknown agent: ${agentId}`, { agentId, known: Object.keys(agents) });

    const runId = newId('run', { clock });
    const startedAt = clock.iso();
    const priorEntries = replayOf ? await loadJournal(store, wsId, replayOf) : null;
    const journal = createJournal({
      store, wsId, runId, clock,
      mode: replayOf ? REPLAY : RECORD,
      priorEntries,
      replayOfRun: replayOf,
      logger: logger.child('journal', { runId }),
    });
    const runLog = logger.child(agent.id, { workspaceId: wsId, runId });
    const artifacts = [];
    const openedApprovals = [];

    // Connector preflight: skip rather than fail when a required connector is
    // simply not connected. A workspace with no Google Ads account should not
    // see a red failed run every morning - it should see "skipped: not connected".
    const missing = (agent.needs || []).filter((id) => !connectors[id] || connectors[id].mode === 'unavailable');
    if (missing.length) {
      await journal.note('skipped', { reason: 'required connectors unavailable', connectors: missing });
      const header = {
        kind: 'run', agentId, status: RUN_SKIPPED, startedAt, endedAt: clock.iso(),
        skipReason: `required connector(s) not available: ${missing.join(', ')}`,
        artifacts: [], approvals: [], usd: 0, replayOf,
      };
      await ws.put('runs', runId, header);
      runLog.warn('run skipped', { missing });
      return { ...header, id: runId, journal: journal.stats() };
    }

    const ctx = await buildContext({ agent, runId, journal, params });
    const contextHash = digest({
      profile: ctx.profile, voice: ctx.voice, params, agentVersion: agent.version || 1,
    });

    await ws.put('runs', runId, {
      kind: 'run', agentId, agentLabel: agent.label, lane: agent.lane,
      status: RUN_RUNNING, startedAt, contextHash, replayOf,
      artifacts: [], approvals: [], usd: 0,
    });

    /**
     * An agent emits artifacts through this. Guardrails run here, not in the
     * agent, so no agent can skip them.
     */
    async function emit({
      kind, title, body = '', data = null, effect = null, evidence = null,
      channel = null, target = null, summary = '',
    }) {
      const artifactId = newId('art', { clock });
      const effectId = effect || agent.effect || 'internal.brief';
      const risk = riskFor(effectId);
      const useEvidence = evidence || ctx.evidence();

      // Internal artifacts do not need external-grade sourcing; anything that
      // could reach a client or a live account does.
      // Internal artifacts do not carry client-facing disclosure requirements
      // and are not held to external-grade sourcing. Anything that could reach
      // a client or a live account is.
      const requireEvidence = risk !== RISK.low;
      const requireDisclosures = risk !== RISK.low;
      const guard = runGuardrails(
        { id: artifactId, body, evidence: useEvidence, effect: effectId },
        { ...(ctx.profile || {}), voice: ctx.voice, ...(ctx.guardrailPolicy || {}) },
        { requireEvidence, requireDisclosures },
      );

      const artifact = {
        kind, title, body, data, summary,
        effect: effectId, risk, channel, target,
        agentId, runId,
        evidence: useEvidence,
        guardrails: {
          passed: guard.passed,
          score: guard.score,
          blocking: guard.blocking,
          warnings: guard.warnings,
          claims: guard.claims,
          readability: guard.readability,
        },
        status: guard.passed ? 'ready' : 'blocked',
      };
      await ws.put('artifacts', artifactId, artifact);
      artifacts.push({ id: artifactId, kind, title, risk, passed: guard.passed });

      await journal.note('artifact', {
        artifactId, kind, effect: effectId, risk,
        guardrailPassed: guard.passed,
        blocking: guard.blocking.map((b) => b.rule),
        warnings: guard.warnings.map((w) => w.rule),
      });

      // Open an approval unless this is a dry run. A blocked artifact still
      // gets an approval row - so a human sees the blocked work and why,
      // rather than it vanishing.
      if (!dryRun && approvals) {
        const approvalId = newId('apr', { clock });
        await approvals.open({
          id: approvalId, artifactId, runId, effect: effectId, risk,
          title: title || kind, summary: summary || truncate(body, 240),
          createdBy: `agent:${agentId}`,
          evidence: useEvidence,
          payload: data,
          channel, target,
          guardrails: guard.passed ? null : { blocking: guard.blocking },
        });
        openedApprovals.push(approvalId);
      }

      return { artifactId, guardrails: guard };
    }

    let status = RUN_OK;
    let summary = null;
    let error = null;
    try {
      summary = await agent.run({ ctx, step: journal.step, emit, note: journal.note });
    } catch (err) {
      status = RUN_FAILED;
      error = errorPayload(err);
      runLog.error('run failed', { code: error.code, message: error.message });
      await journal.note('failed', { error });
      // A terminal failure goes to the dead-letter stream so a human sees it
      // instead of it being buried in a log file.
      if (!(err instanceof ApprovalRequired)) {
        await ws.append('deadletter', { runId, agentId, error, params });
      }
    }

    if (llm?.flush) await llm.flush();
    const stats = journal.stats();
    const header = {
      kind: 'run', agentId, agentLabel: agent.label, lane: agent.lane,
      status, startedAt, endedAt: clock.iso(), contextHash, replayOf,
      artifacts, approvals: openedApprovals,
      usd: stats.usd, tokensIn: stats.tokensIn, tokensOut: stats.tokensOut,
      steps: stats.steps, replayedSteps: stats.replayed, liveSteps: stats.live,
      durationMs: stats.ms,
      summary: typeof summary === 'string' ? summary : (summary?.summary || null),
      result: typeof summary === 'object' ? summary : null,
      error,
      diverged: journal.diverged(),
    };
    await ws.put('runs', runId, header);
    await ws.append('events', {
      type: `run.${status}`, runId, agentId, usd: stats.usd,
      artifacts: artifacts.length, approvals: openedApprovals.length,
    });
    runLog.info(`run ${status}`, { usd: stats.usd, artifacts: artifacts.length, steps: stats.steps, replayed: stats.replayed });
    return { ...header, id: runId, journal: stats };
  }

  /** Explain a completed run: every step, source, and cost. */
  async function explain(runId) {
    const header = await ws.get('runs', runId);
    const entries = (await ws.read('journal')).filter((e) => e.runId === runId);
    return { header, ...explainRun(entries) };
  }

  return { run, explain, agents: () => Object.values(agents).map(describeAgent) };
}

export function describeAgent(a) {
  return {
    id: a.id, label: a.label, lane: a.lane, cadence: a.cadence,
    needs: a.needs || [], optional: a.optional || [],
    produces: a.produces, effect: a.effect, risk: riskFor(a.effect || 'internal.brief'),
    description: a.description || '',
  };
}

function truncate(s, n) {
  const str = String(s || '').replace(/\s+/g, ' ').trim();
  return str.length <= n ? str : `${str.slice(0, n - 1)}…`;
}
