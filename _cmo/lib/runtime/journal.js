/**
 * The run journal: step-level checkpointing, audit, and deterministic replay.
 *
 * This is the difference between an agent product you can trust and one you
 * have to take on faith. Every step of every run is recorded with its input
 * hash, its output, the model that produced it, what it cost, and which
 * sources it read. Three things fall out of that:
 *
 *   AUDIT     - "why did the agent claim we rank #3?" is answerable by reading
 *               one journal, not by re-running anything.
 *   REPLAY    - re-run a run and every unchanged step returns its recorded
 *               output instantly. Change one prompt and only that step and the
 *               steps after it re-execute. Fixing a prompt costs one step, not
 *               a whole crawl.
 *   COST      - spend is attributable to a step, not just to a month.
 *
 * Replay semantics mirror a build cache: the longest unchanged PREFIX of steps
 * is reused. The first step whose (name, inputHash) differs from the recording
 * executes live, and every step after it executes live too - because its
 * inputs may now differ even if its own hash happens to match.
 */

import { digest, canonicalJson } from '../core/hash.js';
import { errorPayload } from '../core/errors.js';

export const RECORD = 'record';
export const REPLAY = 'replay';

const MAX_INLINE_OUTPUT = 24_000; // characters; larger outputs are hashed, not inlined

export function createJournal({
  store, wsId, runId, clock, mode = RECORD, priorEntries = null,
  replayOfRun = null, logger = null,
}) {
  const ws = store.ws(wsId);
  const entries = [];
  // `priorEntries` is the recording being replayed. It belongs to a DIFFERENT
  // run than `runId`: a replay always writes under its own new run id so the
  // journal stays append-only with exactly one entry per (runId, seq). Without
  // that, replaying twice would leave duplicate seq values and the third
  // replay would read a corrupted recording.
  const prior = (Array.isArray(priorEntries) ? priorEntries : [])
    .filter((e) => e.seq != null && e.kind !== 'note')
    .slice()
    .sort((a, b) => a.seq - b.seq);
  let seq = 0;
  let diverged = mode !== REPLAY;   // in record mode everything is "live"
  let divergedAt = null;
  const stats = { steps: 0, replayed: 0, live: 0, usd: 0, tokensIn: 0, tokensOut: 0, ms: 0 };

  function priorFor(index, name) {
    const candidate = prior[index];
    if (!candidate) return null;
    return candidate.name === name ? candidate : null;
  }

  async function write(entry) {
    const full = replayOfRun ? { ...entry, replayOfRun } : entry;
    entries.push(full);
    await ws.append('journal', full);
    if (logger) {
      logger.debug(`step ${full.name}`, {
        seq: full.seq, source: full.source, status: full.status, ms: full.ms, usd: full.usd || 0,
      });
    }
    return full;
  }

  function summarizeOutput(value) {
    const json = canonicalJson(value ?? null);
    if (json.length <= MAX_INLINE_OUTPUT) return { output: value ?? null, outputHash: digest(json), truncated: false };
    return {
      output: null,
      outputHash: digest(json),
      truncated: true,
      outputBytes: json.length,
      outputPreview: json.slice(0, 800),
    };
  }

  /**
   * Run one journaled step.
   *
   * `inputs` is whatever determines the step's result - it is hashed, and the
   * hash is what replay compares. Put the prompt, the model, and the source
   * data in here; leave timestamps and run ids out, or nothing will ever
   * match on replay.
   */
  async function step(name, fn, { inputs = null, kind = 'compute', cacheable = true } = {}) {
    const index = seq;
    seq += 1;
    stats.steps += 1;
    const inputHash = digest(canonicalJson(inputs ?? null));

    if (mode === REPLAY && !diverged && cacheable) {
      const recorded = priorFor(index, name);
      if (recorded && recorded.inputHash === inputHash && recorded.status === 'ok' && !recorded.truncated) {
        stats.replayed += 1;
        await write({
          runId, seq: index, name, kind, source: 'replay', status: 'ok',
          inputHash, outputHash: recorded.outputHash, output: recorded.output,
          ms: 0, usd: 0, replayOf: recorded.ts || null, ts: clock.iso(),
        });
        return recorded.output;
      }
      if (!diverged) {
        diverged = true;
        divergedAt = { seq: index, name, reason: !recorded
          ? 'no recorded step at this position'
          : recorded.name !== name
            ? `recorded step was ${recorded.name}`
            : recorded.inputHash !== inputHash
              ? 'inputs changed'
              : recorded.status !== 'ok'
                ? `recorded status ${recorded.status}`
                : 'recorded output was not inlined' };
        if (logger) logger.info('journal diverged - executing live from here', divergedAt);
      }
    }

    const startedAt = clock.now();
    const meter = { usd: 0, tokensIn: 0, tokensOut: 0, model: null, sources: [], notes: [] };
    try {
      const result = await fn(meter);
      const ms = clock.now() - startedAt;
      stats.live += 1;
      stats.usd += meter.usd; stats.tokensIn += meter.tokensIn; stats.tokensOut += meter.tokensOut; stats.ms += ms;
      await write({
        runId, seq: index, name, kind, source: 'live', status: 'ok',
        inputHash, ...summarizeOutput(result),
        ms, usd: round6(meter.usd), tokensIn: meter.tokensIn, tokensOut: meter.tokensOut,
        model: meter.model, sources: meter.sources.slice(0, 50), notes: meter.notes.slice(0, 20),
        ts: clock.iso(),
      });
      return result;
    } catch (err) {
      const ms = clock.now() - startedAt;
      stats.ms += ms;
      await write({
        runId, seq: index, name, kind, source: 'live', status: 'error',
        inputHash, error: errorPayload(err), ms, usd: round6(meter.usd),
        model: meter.model, ts: clock.iso(),
      });
      throw err;
    }
  }

  /** A non-step annotation. Decisions, skips, breaker trips, guardrail hits. */
  async function note(kind, data = {}) {
    return write({ runId, seq: null, name: kind, kind: 'note', source: 'note', status: 'ok', ts: clock.iso(), ...data });
  }

  return {
    mode,
    runId,
    step,
    note,
    entries: () => entries.slice(),
    stats: () => ({ ...stats, usd: round6(stats.usd) }),
    diverged: () => ({ diverged, at: divergedAt }),
  };
}

function round6(n) { return Math.round(Number(n || 0) * 1e6) / 1e6; }

/** Load a prior run's journal entries, ordered, for replay. */
export async function loadJournal(store, wsId, runId) {
  const all = await store.ws(wsId).read('journal');
  const steps = all.filter((e) => e.runId === runId && e.kind !== 'note' && e.seq != null);
  // Defensive de-dupe: keep the first entry per seq. New runs cannot produce
  // duplicates, but a journal written by an older build might.
  const bySeq = new Map();
  for (const e of steps) if (!bySeq.has(e.seq)) bySeq.set(e.seq, e);
  return [...bySeq.values()].sort((a, b) => a.seq - b.seq);
}

/**
 * A human-readable explanation of one run. This is what the UI shows under
 * "why did this happen" and what `cmo runs explain <id>` prints.
 */
export function explainRun(entries) {
  const steps = entries.filter((e) => e.seq != null).sort((a, b) => a.seq - b.seq);
  const notes = entries.filter((e) => e.kind === 'note');
  const sources = new Map();
  for (const s of steps) for (const src of s.sources || []) sources.set(src.url || src.ref || String(src), src);
  return {
    steps: steps.map((s) => ({
      seq: s.seq, name: s.name, source: s.source, status: s.status,
      ms: s.ms, usd: s.usd || 0, model: s.model || null,
      inputHash: s.inputHash, outputHash: s.outputHash,
      sourceCount: (s.sources || []).length,
      error: s.error || null,
    })),
    notes: notes.map((n) => ({ name: n.name, ...stripBase(n) })),
    totals: {
      steps: steps.length,
      replayed: steps.filter((s) => s.source === 'replay').length,
      live: steps.filter((s) => s.source === 'live').length,
      failed: steps.filter((s) => s.status === 'error').length,
      usd: round6(steps.reduce((a, s) => a + (s.usd || 0), 0)),
      ms: steps.reduce((a, s) => a + (s.ms || 0), 0),
      tokensIn: steps.reduce((a, s) => a + (s.tokensIn || 0), 0),
      tokensOut: steps.reduce((a, s) => a + (s.tokensOut || 0), 0),
    },
    sources: [...sources.values()],
  };
}

function stripBase(entry) {
  const { runId, seq, name, kind, source, status, ts, ...rest } = entry;
  return rest;
}
