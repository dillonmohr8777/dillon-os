/**
 * Brand-safety and evidence guardrails.
 *
 * The failure mode this exists to prevent, in the words of people who paid for
 * the incumbent product: "everything it recommended me was outdated - super
 * generic - outright a bad idea", and "garbage in, slightly more organized
 * garbage out". Generated marketing copy fails in specific, detectable ways,
 * and the detectable ones should never reach a human reviewer, let alone a
 * client.
 *
 * The rule that matters most: A FACTUAL CLAIM WITHOUT A SOURCE IS BLOCKING.
 * Not a warning, not a score - the artifact cannot be approved. Every number,
 * superlative, and guarantee in generated copy either points at a capture in
 * the evidence store or the artifact does not ship. That is the same contract
 * the vault applies to its own notes, and it is the only thing that makes
 * delegating review to someone else safe.
 *
 * Findings come back in three severities:
 *   blocking - approval is refused until resolved
 *   warn     - a human must look, but may approve
 *   info     - recorded, not gating
 */

import { GuardrailError } from '../core/errors.js';

export const BLOCKING = 'blocking';
export const WARN = 'warn';
export const INFO = 'info';

/**
 * Unqualified superlatives and absolutes. Each is a claim someone could be
 * asked to substantiate, which in regulated verticals means an actual
 * complaint, not just weak copy.
 */
const SUPERLATIVES = [
  'best', 'cheapest', 'fastest', 'number one', '#1', 'the only', 'guaranteed',
  'always', 'never fails', 'unbeatable', 'lowest price', 'top rated',
  'world class', 'industry leading', 'award winning', 'most trusted',
];

/**
 * Phrases that read as machine-written. Not a style preference: reviewers of
 * the incumbent report its output being recognisable as AI, and community
 * platforms punish that fast.
 */
const AI_TELLS = [
  'in today\'s fast-paced', 'in the ever-evolving', 'it\'s important to note',
  'when it comes to', 'look no further', 'dive into', 'delve into',
  'unlock the power', 'game-changer', 'revolutionize', 'seamlessly integrate',
  'in conclusion', 'furthermore', 'moreover', 'elevate your',
  'navigate the complexities', 'a testament to', 'at the end of the day',
  'that being said', 'harness the power', 'cutting-edge solution',
];

/**
 * Claims that are legally loaded in the verticals a local-services agency
 * actually works in. `pattern` is matched case-insensitively.
 */
const REGULATED_CLAIMS = [
  { pattern: /\b(licensed|certified|insured|bonded|accredited)\b/i, requires: 'license or certificate number in the evidence store', vertical: 'trades' },
  { pattern: /\b(guarantee|warranty|money.back)\b/i, requires: 'the written terms of the guarantee', vertical: 'any' },
  { pattern: /\b(cure|treat|heal|diagnose|prevent)\b/i, requires: 'clinical substantiation - health claims are regulated', vertical: 'health' },
  { pattern: /\b(free)\b/i, requires: 'the conditions attached to "free", or it reads as bait', vertical: 'any' },
  { pattern: /\b(financing|apr|interest.free|no credit check)\b/i, requires: 'the lending terms and disclosure', vertical: 'finance' },
  { pattern: /\b(same.day|24.7|emergency)\b/i, requires: 'evidence the service level is actually offered', vertical: 'trades' },
];

/**
 * Detect factual claims that need a source.
 *
 * Deliberately conservative in what counts as a claim and aggressive about
 * requiring evidence for it: a false negative here means an unsourced statistic
 * lands in a client deliverable.
 */
export function extractClaims(text) {
  const body = String(text || '');
  const claims = [];
  const seen = new Set();

  // Deduplicate on the MATCHED TEXT, not on the surrounding sentence. Keying by
  // sentence collapses "97% satisfaction, 2,400+ customers, 15 years, 3x
  // faster" into a single claim, which undercounts exactly the numbers that
  // need a source - and undercounting is the failure direction that lets an
  // unsourced statistic through.
  const add = (kind, span, offset, needs, matched = null) => {
    const key = `${kind}:${String(matched ?? span).trim().toLowerCase()}:${offset}`;
    if (seen.has(key)) return;
    seen.add(key);
    claims.push({ kind, span: span.trim(), matched: matched ?? null, offset, needs });
  };

  // Numbers, percentages, money, multiples - anything a reader will take as fact.
  // `[\d,]` on the count branch so "2,400+ customers" is captured whole rather
  // than clipped to "400+ customers" at the comma.
  const numeric = /(\$\s?[\d,]+(?:\.\d+)?(?:\s?(?:k|m|bn|billion|million|thousand))?|\b\d[\d,]*(?:\.\d+)?\s?%|\b\d[\d,]*(?:\.\d+)?x\b|\b\d[\d,]{1,}\+?\s+(?:years|customers|clients|reviews|projects|installs|homes|jobs)\b)/gi;
  let m;
  while ((m = numeric.exec(body)) !== null) {
    add('statistic', sentenceAt(body, m.index), m.index, 'a source_ref pointing at the capture this number came from', m[0]);
  }

  // Superlatives and absolutes.
  for (const word of SUPERLATIVES) {
    const re = new RegExp(`(?<![A-Za-z])${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![A-Za-z])`, 'gi');
    while ((m = re.exec(body)) !== null) {
      add('superlative', sentenceAt(body, m.index), m.index, 'evidence for the comparison, or soften the wording', m[0]);
    }
  }

  // Ranking and comparison claims.
  const comparative = /\b(more|less|better|worse|higher|lower|faster|slower|cheaper)\s+than\b/gi;
  while ((m = comparative.exec(body)) !== null) {
    add('comparison', sentenceAt(body, m.index), m.index, 'the measurement behind the comparison', m[0]);
  }

  // Regulated language.
  for (const rule of REGULATED_CLAIMS) {
    const re = new RegExp(rule.pattern.source, 'gi');
    while ((m = re.exec(body)) !== null) {
      add('regulated', sentenceAt(body, m.index), m.index, rule.requires, m[0]);
    }
  }

  return claims.sort((a, b) => a.offset - b.offset);
}

/**
 * Run every guardrail over an artifact.
 *
 * @param {object} artifact
 * @param {string} artifact.body        the generated copy
 * @param {Array}  artifact.evidence    [{ ref, url?, note? }] source receipts
 * @param {string} artifact.effect      publish.cms, draft.social, ...
 * @param {object} profile              brand profile (bannedPhrases, requiredDisclosures, voice)
 * @param {object} options
 * @param {boolean} options.requireEvidence  default true; false only for internal drafts
 */
export function runGuardrails(artifact, profile = {}, options = {}) {
  const {
    requireEvidence = true,
    // Disclosures are a property of PUBLISHED copy, not of every artifact. An
    // internal technical audit does not need the contractor licence number in
    // it, and enforcing that on internal work blocks the entire feed for a
    // reason nobody can act on.
    requireDisclosures = requireEvidence,
    maxAiTells = 2,
    readingGradeMax = 12,
  } = options;

  const body = String(artifact.body || '');
  const evidence = Array.isArray(artifact.evidence) ? artifact.evidence : [];
  const findings = [];

  // --- 1. Unsourced factual claims (the blocking one) ----------------------
  const claims = extractClaims(body);
  const hasEvidence = evidence.length > 0;
  if (claims.length && requireEvidence && !hasEvidence) {
    findings.push({
      rule: 'unsourced-claim',
      severity: BLOCKING,
      count: claims.length,
      message: `${claims.length} factual claim(s) with no evidence attached. A claim without a source is labelled unverified and cannot be published.`,
      examples: claims.slice(0, 5).map((c) => ({ kind: c.kind, span: truncate(c.span, 140), needs: c.needs })),
    });
  } else if (claims.length && requireEvidence) {
    // Evidence exists, but is there enough of it to cover the claims made?
    // One capture cited under fifteen statistics is not sourcing.
    const ratio = evidence.length / claims.length;
    if (ratio < 0.34) {
      findings.push({
        rule: 'thin-evidence',
        severity: WARN,
        count: claims.length,
        message: `${claims.length} factual claims are backed by only ${evidence.length} source(s). Verify each number traces to a real capture before approving.`,
        examples: claims.slice(0, 5).map((c) => ({ kind: c.kind, span: truncate(c.span, 140) })),
      });
    }
  }

  // --- 2. Banned phrases from the brand profile ---------------------------
  const banned = (profile.bannedPhrases || []).filter((p) => p && body.toLowerCase().includes(String(p).toLowerCase()));
  if (banned.length) {
    findings.push({
      rule: 'banned-phrase',
      severity: BLOCKING,
      message: `copy contains ${banned.length} phrase(s) this brand has explicitly banned`,
      examples: banned.map((p) => ({ span: p })),
    });
  }

  // --- 3. Required disclosures -------------------------------------------
  const missing = requireDisclosures
    ? (profile.requiredDisclosures || []).filter((d) => d && !body.toLowerCase().includes(String(d.text || d).toLowerCase()))
    : [];
  if (missing.length) {
    findings.push({
      rule: 'missing-disclosure',
      severity: BLOCKING,
      message: `${missing.length} required disclosure(s) absent from the copy`,
      examples: missing.map((d) => ({ span: truncate(String(d.text || d), 120) })),
    });
  }

  // --- 4. AI tells --------------------------------------------------------
  const tells = AI_TELLS.filter((t) => body.toLowerCase().includes(t));
  if (tells.length > maxAiTells) {
    findings.push({
      rule: 'ai-tells',
      severity: WARN,
      count: tells.length,
      message: `${tells.length} stock AI phrases. Community platforms and readers recognise these; rewrite before this goes out under a person's name.`,
      examples: tells.slice(0, 6).map((t) => ({ span: t })),
    });
  } else if (tells.length) {
    findings.push({ rule: 'ai-tells', severity: INFO, count: tells.length, message: `${tells.length} stock AI phrase(s) present`, examples: tells.map((t) => ({ span: t })) });
  }

  // --- 5. Readability -----------------------------------------------------
  const readability = fleschKincaid(body);
  if (readability.grade > readingGradeMax) {
    findings.push({
      rule: 'reading-level',
      severity: WARN,
      message: `reading grade ${readability.grade.toFixed(1)} exceeds the target of ${readingGradeMax}. Homeowners and local buyers do not read at this level.`,
      detail: readability,
    });
  }

  // --- 6. Voice adherence -------------------------------------------------
  if (profile.voice?.forbiddenTone?.length) {
    const hits = profile.voice.forbiddenTone.filter((t) => body.toLowerCase().includes(String(t).toLowerCase()));
    if (hits.length) {
      findings.push({ rule: 'off-voice', severity: WARN, message: `copy uses tone this brand rejects: ${hits.join(', ')}`, examples: hits.map((h) => ({ span: h })) });
    }
  }

  // --- 7. Empty or truncated output --------------------------------------
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  if (words < 10) {
    findings.push({ rule: 'empty-output', severity: BLOCKING, message: `only ${words} words of output; the generation failed rather than produced a draft` });
  }
  // No leading \b here: it can never match before "[", since "[" is not a word
  // character, so a space-then-bracket placeholder would slip through.
  if (/(lorem ipsum|\bTODO\b|\bFIXME\b|\[insert|\[your|\[company|\{\{|<placeholder|XXXX)/i.test(body)) {
    findings.push({ rule: 'placeholder-text', severity: BLOCKING, message: 'copy still contains placeholder text' });
  }

  const blocking = findings.filter((f) => f.severity === BLOCKING);
  const warnings = findings.filter((f) => f.severity === WARN);

  return {
    passed: blocking.length === 0,
    blocking,
    warnings,
    info: findings.filter((f) => f.severity === INFO),
    findings,
    claims: claims.map((c) => ({ kind: c.kind, matched: c.matched, span: truncate(c.span, 160), offset: c.offset })),
    evidenceCount: evidence.length,
    readability,
    // A single number for the UI, but the findings are what a human acts on.
    score: Math.max(0, 100 - blocking.length * 35 - warnings.length * 8),
  };
}

/** Throwing form, for the engine's publish path. */
export function assertPublishable(artifact, profile, options) {
  const result = runGuardrails(artifact, profile, options);
  if (!result.passed) {
    throw new GuardrailError(
      `artifact failed ${result.blocking.length} blocking guardrail(s): ${result.blocking.map((b) => b.rule).join(', ')}`,
      { blocking: result.blocking, artifactId: artifact.id },
    );
  }
  return result;
}

/**
 * Flesch-Kincaid grade level. Approximate by design - it is a tripwire for
 * "this reads like a consultant wrote it", not a linguistic instrument.
 */
export function fleschKincaid(text) {
  const body = String(text || '');
  const sentences = Math.max(1, (body.match(/[.!?]+/g) || []).length);
  const words = body.trim().split(/\s+/).filter(Boolean);
  const wordCount = Math.max(1, words.length);
  const syllables = words.reduce((a, w) => a + countSyllables(w), 0);
  const grade = 0.39 * (wordCount / sentences) + 11.8 * (syllables / wordCount) - 15.59;
  const ease = 206.835 - 1.015 * (wordCount / sentences) - 84.6 * (syllables / wordCount);
  return {
    grade: Math.round(Math.max(0, grade) * 10) / 10,
    ease: Math.round(ease * 10) / 10,
    words: wordCount,
    sentences,
    avgWordsPerSentence: Math.round((wordCount / sentences) * 10) / 10,
  };
}

function countSyllables(word) {
  const w = String(word).toLowerCase().replace(/[^a-z]/g, '');
  if (!w) return 0;
  if (w.length <= 3) return 1;
  const groups = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '').replace(/^y/, '').match(/[aeiouy]{1,2}/g);
  return Math.max(1, groups ? groups.length : 1);
}

/**
 * The sentence containing `offset`.
 *
 * A period between two digits is a decimal point, not a sentence end. Without
 * that check, the claim "+46.2%" reports its span as "…| +24 (+46." - a clipped
 * fragment that tells a reviewer nothing about what needs a source.
 */
function sentenceAt(body, offset, max = 260) {
  const text = String(body || '');
  const isBreak = (i) => {
    const ch = text[i];
    if (ch === '\n') return true;
    if (ch !== '.' && ch !== '!' && ch !== '?') return false;
    if (ch === '.' && /\d/.test(text[i - 1] || '') && /\d/.test(text[i + 1] || '')) return false;
    return true;
  };
  let start = offset;
  while (start > 0 && !isBreak(start - 1)) start -= 1;
  let end = offset;
  while (end < text.length && !isBreak(end)) end += 1;
  return text.slice(start, Math.min(end + 1, start + max)).trim();
}

function truncate(s, n) {
  const str = String(s || '');
  return str.length <= n ? str : `${str.slice(0, n - 1)}…`;
}
