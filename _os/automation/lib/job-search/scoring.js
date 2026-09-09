'use strict';

/**
 * Two scores, deliberately kept apart.
 *
 *   fit  — how well the role matches what Dillon has actually done.
 *   odds — how realistic it is that this application goes anywhere.
 *
 * They are not the same axis and averaging them into one number early hides the
 * interesting rows. A CMO seat at a hyperscaler is high fit and near-zero odds;
 * a marketing manager job at a 30-person agency is the reverse. Both scores are
 * carried through to the report so the tradeoff stays visible.
 */

const YEARS_OF_EXPERIENCE = 7;

// Household names draw thousands of applicants for one marketing seat. This is a
// competition proxy, not a judgement about the company.
const HIGH_COMPETITION = [
  'google', 'meta', 'facebook', 'amazon', 'apple', 'microsoft', 'netflix',
  'openai', 'anthropic', 'nvidia', 'tesla', 'spotify', 'airbnb', 'uber',
  'stripe', 'figma', 'notion', 'canva', 'duolingo', 'linkedin', 'salesforce',
  'adobe', 'coinbase', 'databricks', 'snowflake', 'perplexity', 'cursor',
];

function lc(value) {
  return String(value || '').toLowerCase();
}

function haystack(job) {
  return lc(`${job.title} ${job.description} ${(job.tags || []).join(' ')}`);
}

function daysOld(job, now = Date.now()) {
  if (!job.posted_at) return null;
  const posted = new Date(job.posted_at).getTime();
  if (Number.isNaN(posted)) return null;
  return Math.max(0, Math.round((now - posted) / 86400000));
}

function matchesAny(text, needles) {
  return (needles || []).some((n) => text.includes(lc(n)));
}

/** Which seniority band the posting is written for. */
function bandOf(title, profile) {
  const t = lc(title);
  const bands = profile.seniority_bands || {};
  if (matchesAny(t, bands.executive)) return 'executive';
  if (matchesAny(t, bands.director)) return 'director';
  if (matchesAny(t, bands.junior)) return 'junior';
  if (matchesAny(t, bands.manager)) return 'manager';
  return 'unspecified';
}

/** Years of experience the posting asks for, when it says so plainly. */
function requiredYears(description) {
  const text = lc(description);
  const patterns = [
    /(\d{1,2})\s*\+?\s*(?:-|to)?\s*(?:\d{1,2})?\s*years?[^.]{0,40}?experience/g,
    /experience[^.]{0,40}?(\d{1,2})\s*\+?\s*years?/g,
  ];
  const found = [];
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const years = Number(match[1]);
      if (Number.isInteger(years) && years > 0 && years <= 25) found.push(years);
    }
  }
  return found.length ? Math.max(...found) : null;
}

// Location gating learned the hard way. Three separate bugs came from matching
// two-letter state codes as substrings of lowercased free text:
//   "APAC"        contains "pa"  -> Pennsylvania
//   "manager:in"  contains "in"  -> Indiana
//   "BC, or NS"   contains "or"  -> Oregon, and shipped a Canada-only role at #1
// English is full of words that are also state codes. So the rule is inverted:
// a posting must show a POSITIVE US signal to pass. Silence is not consent.
const US_STATES = new Set([
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL',
  'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT',
  'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI',
  'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC',
]);

const US_PHRASE = /\b(united states|usa|u\.s\.a?\.?|nationwide|philadelphia|pennsylvania|new jersey|delaware|new york|san francisco|bay area|boston|chicago|austin|atlanta|denver|seattle|los angeles|san diego|miami|dallas|houston|phoenix|portland|nashville|charlotte|minneapolis|detroit|pittsburgh|baltimore|washington d\.?c\.?)\b/i;

const NON_US_REGIONS = /\b(apac|emea|latam|anz|mena|asia|pacific|europe|european|united kingdom|england|scotland|ireland|germany|deutschland|france|spain|italy|portugal|india|singapore|japan|korea|china|australia|new zealand|canada|toronto|vancouver|brazil|mexico|argentina|poland|romania|netherlands|amsterdam|sweden|denmark|norway|finland|switzerland|austria|belgium|israel|dubai|uae|south africa|nigeria|kenya|philippines|vietnam|thailand|indonesia|malaysia|berlin|munich|hamburg|bremen|cologne|frankfurt|paris|madrid|barcelona|milan|rome|dublin|london|zurich|prague|warsaw|lisbon|athens|istanbul|bangalore|mumbai|delhi|hyderabad|pune|remote europe|remote emea)\b/i;

const OPEN_REMOTE = /\b(remote|anywhere|worldwide|global|distributed|work from home|wfh)\b/i;

// Hybrid and on-site are not remote, however the board tags them. Several
// company boards set a remote flag on a req whose location reads
// "Hybrid - San Francisco", and Dillon cannot take those.
const NOT_REMOTE = /\b(hybrid|on-?site|in-?office|in person|relocation required)\b/i;

/** Two-letter codes only count in a real place pattern: "Philadelphia, PA". */
function hasUsStateCode(raw) {
  for (const match of String(raw).matchAll(/,\s*([A-Z]{2})\b/g)) {
    if (US_STATES.has(match[1])) return true;
  }
  return false;
}

/** Remote is a hard requirement, not a preference. */
function isRemoteRole(job) {
  const raw = `${job.location || ''} ${job.title || ''}`;
  if (NOT_REMOTE.test(raw)) return false;
  return Boolean(job.remote) || OPEN_REMOTE.test(raw);
}

/** Separately: is the role open to someone working from the US? */
function isUsEligible(job) {
  // Original case matters — ", PA" is a state, "pa" inside "apac" is not.
  const raw = `${job.location || ''} ${job.title || ''}`;

  // An explicit US location always wins, even alongside a foreign office.
  if (US_PHRASE.test(raw) || hasUsStateCode(raw)) return true;

  // Named somewhere else and nothing says US — that is a foreign req.
  if (NON_US_REGIONS.test(raw)) return false;

  // Unqualified remote is the only remaining way through: a US company board
  // posting a bare "Remote" req is almost always US-or-Americas.
  return Boolean(job.remote) || OPEN_REMOTE.test(raw);
}

/**
 * Hard gate. Rows that fail here never reach scoring — they are not near-misses,
 * they are the wrong job or the wrong country.
 */
function isEligible(job, profile, now = Date.now()) {
  const title = lc(job.title);
  if (!job.title || !job.company) return { ok: false, reason: 'incomplete posting' };

  if (matchesAny(title, profile.target_titles.exclude)) {
    return { ok: false, reason: 'excluded title' };
  }

  const isMarketing = matchesAny(title, profile.functions)
    || matchesAny(title, profile.target_titles.primary)
    || matchesAny(title, profile.target_titles.adjacent)
    || /\bmarketing\b|\bgrowth\b|\bbrand\b|\bdemand gen|\bseo\b|\bcontent\b|\bpaid media\b/.test(title);
  if (!isMarketing) return { ok: false, reason: 'not a marketing or growth role' };

  if (!isRemoteRole(job)) return { ok: false, reason: 'not remote' };
  if (!isUsEligible(job)) return { ok: false, reason: 'outside US' };

  const age = daysOld(job, now);
  const maxAge = (profile.hard_filters && profile.hard_filters.min_days_fresh) || 45;
  if (age != null && age > maxAge) return { ok: false, reason: `stale posting (${age}d)` };

  return { ok: true };
}

function scoreFit(job, profile) {
  const text = haystack(job);
  const title = lc(job.title);
  const reasons = [];
  let score = 0;

  // 1. Title match, 0-40. A primary target title is the strongest single signal.
  if (matchesAny(title, profile.target_titles.primary)) {
    score += 40;
    reasons.push('Title sits in his target band (director/head/VP-level marketing or growth)');
  } else if (matchesAny(title, profile.target_titles.adjacent)) {
    score += 28;
    reasons.push('Adjacent title — one band below his current scope but squarely in his lane');
  } else {
    score += 12;
    reasons.push('Marketing-family title without an exact band match');
  }

  // 2. Skill overlap, 0-25. Counts distinct skills, so a description that says
  //    "SEO" six times does not outrank one that genuinely spans his stack.
  const hits = (profile.skills || []).filter((skill) => text.includes(lc(skill)));
  const skillScore = Math.min(25, Math.round((hits.length / 12) * 25));
  score += skillScore;
  if (hits.length) {
    reasons.push(`${hits.length} of his named skills appear in the posting (${hits.slice(0, 6).join(', ')}${hits.length > 6 ? '…' : ''})`);
  }

  // 3. AI-forward, 0-15. His stated differentiator, so it is worth real weight.
  const aiHits = (profile.target_titles.ai_forward || []).filter((k) => text.includes(lc(k)));
  if (aiHits.length) {
    const aiScore = Math.min(15, 5 + aiHits.length * 3);
    score += aiScore;
    reasons.push(`AI-forward posting (${aiHits.slice(0, 4).join(', ')}) — matches how he actually works`);
  }

  // 4. Domain fit, 0-10: agency-side and B2B/SaaS are where his evidence lands.
  if (/\bagency\b|\bclient\b|\baccounts?\b/.test(text)) {
    score += 6;
    reasons.push('Agency/client-facing context — he runs a live client book');
  }
  if (/\bb2b\b|\bsaas\b|\bhubspot\b/.test(text)) {
    score += 4;
    reasons.push('B2B/SaaS motion matches his Align HCM and DataStrike work');
  }

  // 5. Location, 0-10. Every row that reaches scoring is already remote, so
  //    this grades how clearly US-eligible it is rather than where the office is.
  const raw = `${job.location || ''} ${job.title || ''}`;
  if (US_PHRASE.test(raw) || hasUsStateCode(raw)) {
    score += 10;
    reasons.push('Remote and explicitly open to the US');
  } else {
    score += 7;
    reasons.push('Remote with an unqualified location — confirm US eligibility before applying');
  }

  return { score: Math.max(0, Math.min(100, Math.round(score))), reasons };
}

function scoreOdds(job, profile, now = Date.now()) {
  const text = haystack(job);
  const reasons = [];
  // Start from a realistic baseline for a strong-but-not-referred applicant.
  let score = 58;

  // Seniority reach. Executive seats are winnable but rarely from a cold apply.
  const band = bandOf(job.title, profile);
  if (band === 'executive') {
    score -= 22;
    reasons.push('Executive seat — usually filled through network or search firm, not a cold application');
  } else if (band === 'director') {
    score -= 4;
    reasons.push('Director band — matches his current scope');
  } else if (band === 'manager') {
    score += 14;
    reasons.push('Manager band — he is over-qualified on paper, which reads as a safe hire');
  } else if (band === 'junior') {
    score -= 8;
    reasons.push('Below his band — likely screened out as over-qualified');
  }

  // Stated experience requirement against his ~7 years.
  const years = requiredYears(job.description);
  if (years != null) {
    if (years <= YEARS_OF_EXPERIENCE) {
      score += 10;
      reasons.push(`Asks for ${years}+ years; he has about ${YEARS_OF_EXPERIENCE}`);
    } else if (years <= YEARS_OF_EXPERIENCE + 3) {
      score -= 6;
      reasons.push(`Asks for ${years}+ years — a stretch of ${years - YEARS_OF_EXPERIENCE}`);
    } else {
      score -= 18;
      reasons.push(`Asks for ${years}+ years — well past his ${YEARS_OF_EXPERIENCE}`);
    }
  }

  // Competition proxies.
  const company = lc(job.company);
  if (HIGH_COMPETITION.some((c) => company.includes(c))) {
    score -= 20;
    reasons.push('Household-name employer — very high applicant volume per seat');
  }
  if (job.remote && /worldwide|anywhere|global/.test(lc(job.location))) {
    score -= 10;
    reasons.push('Open worldwide — the widest possible applicant pool');
  }

  // Freshness. A posting in its first week is read by a human; a month-old one
  // is usually already down to finalists.
  const age = daysOld(job, now);
  if (age != null) {
    if (age <= 3) { score += 14; reasons.push(`Posted ${age}d ago — early, before the pile builds`); }
    else if (age <= 7) { score += 8; reasons.push(`Posted ${age}d ago — still fresh`); }
    else if (age <= 21) { score += 0; reasons.push(`Posted ${age}d ago`); }
    else { score -= 10; reasons.push(`Posted ${age}d ago — likely deep into the pipeline`); }
  } else {
    reasons.push('No posting date published — freshness unknown');
  }

  // Requirements he genuinely does not hold.
  if (/\bmba\b\s*(required|is required)/.test(text)) {
    score -= 12;
    reasons.push('MBA stated as required');
  }
  if (/\b(pharma|clinical|biotech|fda|hipaa|medical device)\b/.test(text)) {
    score -= 8;
    reasons.push('Regulated vertical he has no logged experience in');
  }
  if (/\b(sql|python|r\b|tableau|looker)\b/.test(text) && /required/.test(text)) {
    score -= 5;
    reasons.push('Hard analytics tooling listed as required');
  }

  // Things that genuinely help him.
  if (/\bagency\b/.test(text)) {
    score += 8;
    reasons.push('Agency background is an explicit asset here');
  }
  if (/\bplayer.?coach\b|\bhands.?on\b|\bwear many hats\b|\bscrappy\b|\bsmall team\b/.test(text)) {
    score += 10;
    reasons.push('Wants a hands-on operator, not a pure people-manager — his actual shape');
  }

  return { score: Math.max(1, Math.min(99, Math.round(score))), reasons };
}

function rank(job, profile, now = Date.now()) {
  const fit = scoreFit(job, profile);
  const odds = scoreOdds(job, profile, now);
  // Fit leads because a badly-matched role is not worth applying to at any odds,
  // but odds carry nearly half so the list does not fill with unwinnable seats.
  const priority = Math.round(fit.score * 0.55 + odds.score * 0.45);
  return {
    ...job,
    fit_score: fit.score,
    fit_reasons: fit.reasons,
    odds_score: odds.score,
    odds_reasons: odds.reasons,
    priority_score: priority,
    days_old: daysOld(job, now),
    band: bandOf(job.title, profile),
    required_years: requiredYears(job.description),
  };
}

function rankAll(jobs, profile, now = Date.now()) {
  const eligible = [];
  const rejected = [];
  // A fit floor, applied after scoring. Odds alone can float a role that is easy
  // to get but is not the job he wants — an easy yes to the wrong thing is not
  // a result worth printing.
  const minFit = (profile.hard_filters && profile.hard_filters.min_fit_score) || 0;
  for (const job of jobs) {
    const gate = isEligible(job, profile, now);
    if (!gate.ok) { rejected.push({ title: job.title, company: job.company, reason: gate.reason }); continue; }
    const scored = rank(job, profile, now);
    if (scored.fit_score < minFit) {
      rejected.push({ title: job.title, company: job.company, reason: `below fit floor (${scored.fit_score} < ${minFit})` });
      continue;
    }
    eligible.push(scored);
  }
  eligible.sort((a, b) =>
    b.priority_score - a.priority_score
    || b.fit_score - a.fit_score
    || (a.days_old ?? 999) - (b.days_old ?? 999));
  return { ranked: eligible, rejected };
}

module.exports = {
  YEARS_OF_EXPERIENCE,
  NON_US_REGIONS,
  US_STATES,
  hasUsStateCode,
  HIGH_COMPETITION,
  daysOld,
  bandOf,
  requiredYears,
  isRemoteRole,
  isUsEligible,
  isEligible,
  scoreFit,
  scoreOdds,
  rank,
  rankAll,
};
