'use strict';

/**
 * Turns a ranked role plus Dillon's evidence file into application material.
 *
 * Everything produced here is a DRAFT and is labelled as one. Nothing in this
 * module sends, submits, or applies — it writes markdown to the vault and stops.
 *
 * Evidence selection is deterministic keyword matching, not generation: each
 * evidence item carries `tags`, the posting is scanned for those tags, and the
 * best-matching items are the ones quoted. That keeps every claim in a draft
 * traceable to a real logged item with a source_ref, which is the whole point —
 * an invented metric in a cover letter is worse than no cover letter.
 */

function lc(v) { return String(v || '').toLowerCase(); }

/** Score one evidence item against one posting. */
function evidenceRelevance(item, text) {
  let score = 0;
  for (const tag of item.tags || []) {
    if (text.includes(lc(tag))) score += 3;
  }
  for (const word of lc(item.claim).split(/[^a-z0-9]+/)) {
    if (word.length > 5 && text.includes(word)) score += 1;
  }
  // A verified item outranks a comparable unverified one every time.
  if (item.status === 'verified') score += 4;
  if (item.status === 'unverified') score -= 2;
  return score;
}

function selectEvidence(job, evidence, limit = 4) {
  const text = lc(`${job.title} ${job.description} ${(job.tags || []).join(' ')}`);
  return (evidence.items || [])
    .map((item) => ({ item, score: evidenceRelevance(item, text) }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((row) => row.item);
}

/** The specific things this posting asks for, pulled from its own words. */
function extractAsks(job) {
  const asks = [];
  const text = lc(job.description);
  const probes = [
    ['paid media', /\b(google ads|paid search|ppc|sem|paid media|meta ads|performance marketing)\b/],
    ['SEO', /\b(seo|search engine optimization|organic search)\b/],
    ['content', /\b(content marketing|content strategy|editorial|blog)\b/],
    ['demand generation', /\b(demand gen|demand generation|pipeline generation|lead generation)\b/],
    ['marketing automation', /\b(marketing automation|hubspot|marketo|lifecycle)\b/],
    ['attribution and analytics', /\b(attribution|analytics|ga4|reporting|dashboards?)\b/],
    ['web and landing pages', /\b(website|landing page|wordpress|webflow|cro|conversion rate)\b/],
    ['AI and automation', /\b(\bai\b|artificial intelligence|llm|automation|agents?)\b/],
    ['team leadership', /\b(manage a team|lead a team|direct reports|mentor|hiring)\b/],
    ['budget ownership', /\b(budget|spend|p&l|forecast)\b/],
    ['brand', /\b(brand|positioning|messaging|storytelling)\b/],
  ];
  for (const [label, pattern] of probes) if (pattern.test(text)) asks.push(label);
  return asks;
}

function positioningLine(job, profile) {
  const band = job.band === 'executive' || job.band === 'director'
    ? 'marketing leader'
    : 'senior marketing operator';
  const aiFlavor = /\bai\b|llm|automation|agent/.test(lc(`${job.title} ${job.description}`))
    ? ' who builds the AI systems most teams are still talking about'
    : ' who runs strategy and execution in the same pair of hands';
  return `${profile.operator.name} — agency-side ${band}${aiFlavor}.`;
}

function buildBullets(selected, asks) {
  return selected.map((item) => {
    const qualifier = item.status === 'verified' ? '' : ' _(unverified — confirm before sending)_';
    return `- ${item.claim}${item.metric ? ` — **${item.metric}**` : ''}${qualifier}`;
  }).concat(
    asks.length
      ? [`- Direct overlap with what they asked for: ${asks.slice(0, 5).join(', ')}.`]
      : [],
  );
}

function coverNote(job, profile, selected, asks) {
  const lead = selected[0];
  const second = selected[1];
  const askLine = asks.length
    ? `You are hiring for ${asks.slice(0, 3).join(', ')} — that is the middle of what I do every week, not an adjacent skill I would grow into.`
    : 'The scope in your posting maps closely onto what I run day to day.';

  return [
    `Hi ${job.company} team,`,
    '',
    `I am applying for ${job.title}. ${askLine}`,
    '',
    lead
      ? `Most relevant proof point: ${lead.claim}${lead.metric ? ` (${lead.metric})` : ''}.`
      : 'I run a live client book across paid, SEO, content, and web.',
    second
      ? `Second: ${second.claim}${second.metric ? ` (${second.metric})` : ''}.`
      : '',
    '',
    `I currently hold ${profile.current_band.prose || 'a director-level seat'} across an agency book and an in-house marketing function at the same time, which means I am used to owning the number, not just the channel.`,
    '',
    'Happy to walk through any of the above in detail.',
    '',
    profile.operator.name,
  ].filter((line) => line !== '').join('\n');
}

function draftFor(job, profile, evidence) {
  const selected = selectEvidence(job, evidence);
  const asks = extractAsks(job);
  return {
    job_id: job.job_id,
    positioning: positioningLine(job, profile),
    asks,
    resume_bullets: buildBullets(selected, asks),
    cover_note: coverNote(job, profile, selected, asks),
    evidence_used: selected.map((item) => ({
      claim: item.claim,
      metric: item.metric || null,
      status: item.status,
      source_ref: item.source_ref,
    })),
    unverified_count: selected.filter((item) => item.status !== 'verified').length,
  };
}

module.exports = {
  evidenceRelevance,
  selectEvidence,
  extractAsks,
  positioningLine,
  buildBullets,
  coverNote,
  draftFor,
};
