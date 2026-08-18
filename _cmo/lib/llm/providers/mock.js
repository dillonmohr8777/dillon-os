/**
 * Deterministic offline provider.
 *
 * This is not a stub for tests only - it is a first-class mode. `cmo demo`
 * runs the entire product on it: no API key, no network, no spend, and the
 * same output every time. Two reasons that matters:
 *
 *   1. Every reviewer of the incumbent product complains the free tier is a
 *      demo that never finishes ("Analyzing your website..." stuck, "zero
 *      value delivered"). A deterministic local mode means the whole pipeline
 *      is inspectable before anyone pays for a token.
 *   2. Tests that assert on real model output are flaky tests. Tests here
 *      assert on the RUNTIME - journal, guardrails, routing, approvals - with
 *      model output held constant.
 *
 * Responses are derived from a seeded PRNG over the prompt hash, so they are
 * stable across processes and machines.
 */

import { digest, seededRandom, canonicalJson } from '../../core/hash.js';
import { estimateTokens } from '../pricing.js';

// Named in answers to prompts outside the client's category, so the control
// cohort measures what it is supposed to measure.
const OFF_TOPIC_VENDORS = ['Northwind Tools', 'Harbor & Vale', 'Kestrel Supply'];

const STOPWORDS = new Set(['what', 'best', 'that', 'this', 'with', 'from', 'your', 'near', 'does', 'work', 'about', 'which', 'when', 'they', 'have']);

const FILLER = [
  'Homeowners searching in this category compare on response time before price.',
  'The strongest differentiator in the transcript evidence is same-day dispatch.',
  'Competitor pages bury pricing, which leaves an opening for a transparent range.',
  'Seasonal demand peaks two weeks before the first sustained freeze.',
  'Review volume is the binding constraint on local pack position here.',
];

/**
 * @param {object} opts
 * @param {string[]} opts.topicHints
 *   Seed terms describing the vendor pool's category. A probe prompt that
 *   shares no term with these is treated as off-topic and gets generic vendors
 *   instead - which is what a real answer engine does, and what makes the
 *   control cohort read near zero. Without this the simulator names the client
 *   in "what is the best cordless drill?" and the control cohort correctly
 *   flags contamination.
 * @param {string[]} opts.vendorPool
 *   Brand names the simulator may name when answering a probe-style prompt.
 *   Without this the mock never names anyone, every GEO measurement reads 0%,
 *   and the demo shows an instrument that appears broken rather than one that
 *   works. Naming is deterministic per (prompt, brand), so replicates vary the
 *   way real answers vary while the whole scan stays reproducible.
 */
export function createMockProvider({ latencyMs = 0, failFirst = 0, vendorPool = [], topicHints = [] } = {}) {
  let calls = 0;
  const hints = topicHints
    .flatMap((t) => String(t).toLowerCase().split(/\s+/))
    .filter((w) => w.length > 3 && !STOPWORDS.has(w));

  return {
    name: 'mock',
    isMock: true,
    supportsCaching: true,

    async complete({ model, system = '', messages = [], schema = null, maxTokens = 4000, taskClass = 'draft' }) {
      calls += 1;
      if (calls <= failFirst) {
        const err = new Error('mock transient failure');
        err.code = 'ECONNRESET';
        throw err;
      }
      if (latencyMs) await new Promise((r) => setTimeout(r, latencyMs));

      const seedSource = canonicalJson({ model, system, messages, schema: schema?.name || null });
      const rng = seededRandom(seedSource);
      const promptText = messages.map((m) => (typeof m.content === 'string' ? m.content : canonicalJson(m.content))).join('\n');

      const isProbe = /general-purpose AI assistant/i.test(system);
      const onTopic = !hints.length || hints.some((h) => promptText.toLowerCase().includes(h));
      const output = schema
        ? synthesizeForSchema(schema, rng, promptText)
        : isProbe
          ? synthesizeAnswer(rng, promptText, onTopic ? vendorPool : OFF_TOPIC_VENDORS)
          : synthesizeProse(rng, promptText, taskClass);

      const text = typeof output === 'string' ? output : JSON.stringify(output, null, 2);
      const inTok = estimateTokens(system) + estimateTokens(promptText);
      const outTok = Math.min(maxTokens, estimateTokens(text));

      return {
        text,
        parsed: schema ? output : null,
        model,
        stopReason: 'end_turn',
        usage: { input_tokens: inTok, output_tokens: outTok, cache_creation_input_tokens: 0, cache_read_input_tokens: 0 },
        provider: 'mock',
        fingerprint: digest(seedSource, 10),
      };
    },

    stats: () => ({ calls }),
  };
}

/**
 * Simulate an answer-engine response: name some subset of the vendor pool, in a
 * varying order, with prose around it. Each vendor's appearance is an
 * independent draw, which is what gives the aggregate a real distribution to
 * measure rather than a constant.
 */
function synthesizeAnswer(rng, prompt, vendorPool) {
  const named = [];
  for (const vendor of vendorPool) {
    // Deterministic per (prompt, vendor): the first vendor in the pool is the
    // most likely to be named, matching how incumbency actually behaves.
    const bias = 0.62 - named.length * 0.06;
    if (rng() < bias) named.push(vendor);
  }
  if (!named.length) {
    return `There are several options worth comparing. ${FILLER[Math.floor(rng() * FILLER.length)]} Check recent reviews before booking.`;
  }
  // Shuffle so ordinal position varies, since prominence depends on it.
  for (let i = named.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [named[i], named[j]] = [named[j], named[i]];
  }
  const lead = named[0];
  const rest = named.slice(1);
  const parts = [`${lead} is commonly recommended here.`];
  if (rest.length) parts.push(`${rest.join(' and ')} also come up regularly.`);
  parts.push(FILLER[Math.floor(rng() * FILLER.length)]);
  if (rng() < 0.45) parts.push(`See https://${slugHost(lead)}/services for details.`);
  return parts.join(' ');
}

function slugHost(name) {
  return `${String(name).toLowerCase().replace(/[^a-z0-9]+/g, '')}.example`;
}

function synthesizeProse(rng, prompt, taskClass) {
  const topic = (prompt.match(/about ([^.\n]{3,60})/i)?.[1] || 'the offer').trim();
  const lines = [];
  const sentences = taskClass === 'longform' ? 9 : 4;
  lines.push(`Draft (${taskClass}) on ${topic}.`);
  for (let i = 0; i < sentences; i += 1) {
    lines.push(FILLER[Math.floor(rng() * FILLER.length)]);
  }
  return lines.join(' ');
}

/**
 * Build an object that satisfies a JSON Schema. Only the subset the agents
 * actually use is supported; anything unrecognised becomes null, which the
 * validator will then flag rather than silently accept.
 */
function synthesizeForSchema(schema, rng, prompt) {
  const shape = schema.input_schema || schema.schema || schema;
  return buildValue(shape, rng, prompt, 0);
}

function buildValue(node, rng, prompt, depth) {
  if (!node || depth > 8) return null;
  if (Array.isArray(node.enum) && node.enum.length) return node.enum[Math.floor(rng() * node.enum.length)];
  switch (node.type) {
    case 'object': {
      const out = {};
      const props = node.properties || {};
      for (const [key, sub] of Object.entries(props)) out[key] = buildValue(sub, rng, prompt, depth + 1);
      return out;
    }
    case 'array': {
      const min = node.minItems ?? 2;
      const n = Math.max(min, Math.min(node.maxItems ?? 3, min + Math.floor(rng() * 2)));
      return Array.from({ length: n }, () => buildValue(node.items || { type: 'string' }, rng, prompt, depth + 1));
    }
    case 'integer': return Math.floor((node.minimum ?? 1) + rng() * ((node.maximum ?? 100) - (node.minimum ?? 1)));
    case 'number': return Math.round(((node.minimum ?? 0) + rng() * ((node.maximum ?? 1) - (node.minimum ?? 0))) * 100) / 100;
    case 'boolean': return rng() > 0.35;
    case 'string': return mockString(node, rng, prompt);
    default: return null;
  }
}

function mockString(node, rng, prompt) {
  const hint = `${node.description || ''} ${node.title || ''}`.toLowerCase();
  if (hint.includes('url') || node.format === 'uri') return `https://example.test/${digest(prompt + rng(), 6)}`;
  if (hint.includes('date') || node.format === 'date') return '2026-08-18';
  if (hint.includes('keyword') || hint.includes('query')) return 'emergency furnace repair near me';
  if (hint.includes('headline') || hint.includes('title')) return 'Same-day furnace repair, flat-rate pricing';
  if (hint.includes('source') || hint.includes('citation')) return 'capture:2026-08-18-site-crawl';
  if (hint.includes('reason') || hint.includes('rationale') || hint.includes('why')) {
    return FILLER[Math.floor(rng() * FILLER.length)];
  }
  return FILLER[Math.floor(rng() * FILLER.length)].slice(0, 80);
}
