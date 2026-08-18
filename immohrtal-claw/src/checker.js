'use strict';

const { CATALOG, resolveSelection, readiness, probeOllama, wantedOllamaTags, hasTag } = require('./models');
const { complete } = require('./providers');

/**
 * Second-brain check. A consequential answer gets verified by a different
 * model family, so a single model's confident mistake does not ship.
 *
 * Honest failure modes, in order:
 *  - only one family has a key  -> checked:false, say so
 *  - the checker call errors    -> checked:false, carry the error
 * Never fabricate a verdict, and never fall back to the same family, because
 * a model agreeing with itself is not a check.
 */
const CHECK_PROMPT = `You are the checker brain for IMMOHRTAL CLAW. A different model produced the claim below.
Your job is to find what is WRONG with it, not to be agreeable.

Rules:
- Judge only against the sources given. If a claim has no supporting source, that is "unsupported", not "true".
- Vault facts must cite a path. An uncited vault fact is unsupported.
- Be specific: name the exact sentence you dispute.

Reply as strict JSON, no prose outside it:
{"verdict":"agree"|"disagree"|"unsupported","contradictions":["..."],"missing":["..."],"note":"one sentence"}`;

function familyOf(id) {
  const entry = CATALOG.find((m) => m.id === id);
  return entry ? entry.family : '';
}

// readiness() treats an unprobed Ollama as soft-ready, which is fine for the
// picker but wrong here: picking a tag that was never pulled turns the check
// into a 404. A local model only counts as a checker if the tag really exists.
async function readyCheckers() {
  const tags = await probeOllama();
  return CATALOG.filter((m) => {
    if (!readiness(m, tags).ready) return false;
    if (!m.ollama) return true;
    return wantedOllamaTags(m).some((tag) => hasTag(tags, tag));
  });
}

/**
 * Prefer an explicit override, then Grok, then Gemini, then anything ready in
 * another family. Cloud first: a checker that disagrees is only useful if it
 * is actually a peer.
 */
async function pickChecker(currentId) {
  const mine = familyOf(currentId) || 'none';
  const ready = await readyCheckers();
  const others = ready.filter((m) => m.family !== mine);
  const forced = process.env.CLAW_CHECKER_MODEL;
  if (forced) {
    const hit = others.find((m) => m.id === forced);
    if (hit) return hit;
  }
  const order = ['grok-4.6', 'gemini-2.5-pro', 'claude-opus-5', 'gpt-5.6-sol'];
  for (const id of order) {
    const hit = others.find((m) => m.id === id && m.group === 'cloud');
    if (hit) return hit;
  }
  return others.find((m) => m.group === 'cloud') || others[0] || null;
}

function parseVerdict(text) {
  const raw = String(text || '');
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start === -1 || end <= start) return { verdict: 'unparsed', note: raw.slice(0, 400) };
  try {
    return JSON.parse(raw.slice(start, end + 1));
  } catch {
    return { verdict: 'unparsed', note: raw.slice(0, 400) };
  }
}

async function secondOpinion({ config, claim, sources = '' }) {
  const text = String(claim || '').trim();
  if (!text) throw new Error('claim required');

  const checker = await pickChecker(config.modelId);
  if (!checker) {
    return {
      ok: true,
      checked: false,
      reason: 'No second model family is ready on this box. Add a second cloud key or pull a local tag; one family cannot check itself.',
      maker: config.provider.label || config.modelId,
    };
  }

  const { entry, provider } = resolveSelection(checker.id);
  const checkerConfig = { ...config, modelId: entry.id, provider };
  const messages = [
    { role: 'system', content: CHECK_PROMPT },
    {
      role: 'user',
      content: `CLAIM (from ${config.provider.label || config.modelId}):\n${text}\n\nSOURCES:\n${sources || '(none supplied)'}`,
    },
  ];

  try {
    const reply = await complete({ config: checkerConfig, messages, tools: [] });
    const parsed = parseVerdict(reply.content);
    return {
      ok: true,
      checked: true,
      maker: config.provider.label || config.modelId,
      makerFamily: familyOf(config.modelId) || 'none',
      checker: entry.label,
      checkerFamily: entry.family,
      ...parsed,
    };
  } catch (err) {
    return {
      ok: false,
      checked: false,
      checker: entry.label,
      error: err.message,
      reason: 'Checker call failed. Treat the claim as unverified.',
    };
  }
}

module.exports = { secondOpinion, pickChecker, parseVerdict };
