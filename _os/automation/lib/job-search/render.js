'use strict';

/**
 * Markdown rendering for the daily job-search run.
 *
 * Two surfaces, on purpose:
 *   - the full dated list, which lives in the JobSearch folder and is the record
 *   - a short brief in Daily-Briefs/, which is where Dillon actually looks at 07:00
 */

function bar(score) {
  const filled = Math.round(score / 10);
  return `${'█'.repeat(filled)}${'░'.repeat(10 - filled)}`;
}

function verdict(row) {
  if (row.priority_score >= 72) return 'Apply today';
  if (row.priority_score >= 60) return 'Worth applying';
  if (row.priority_score >= 48) return 'Only if the day is quiet';
  return 'Skip unless something changes';
}

function frontmatter(fields) {
  const lines = ['---'];
  for (const [key, value] of Object.entries(fields)) {
    if (Array.isArray(value)) lines.push(`${key}: [${value.join(', ')}]`);
    else lines.push(`${key}: ${value}`);
  }
  lines.push('---');
  return lines.join('\n');
}

function renderRankedList({ date, ranked, drafts, stats, profile }) {
  const top = ranked.slice(0, 15);
  const out = [];

  out.push(frontmatter({
    type: 'job-search-daily',
    date,
    roles_found: stats.eligible,
    roles_screened: stats.raw_count,
    generated_by: 'job-search-daily',
    status: 'draft-only',
  }));
  out.push('');
  out.push(`# Job search — ranked roles for ${date}`);
  out.push('');
  out.push(`Screened **${stats.raw_count}** postings from ${stats.sources_ok}/${stats.sources_total} sources; **${stats.eligible}** survived the marketing/US/freshness gate. Top ${top.length} below.`);
  out.push('');
  out.push('**Draft only.** Nothing here has been sent or applied to. Every apply link is a link — clicking it is Dillon\'s decision.');
  out.push('');

  if (!top.length) {
    out.push('> No eligible roles today. That is a real result, not a failure — check the source table at the bottom before assuming the run broke.');
    out.push('');
  }

  out.push('## The list');
  out.push('');
  out.push('| # | Role | Company | Fit | Odds | Priority | Verdict |');
  out.push('|---|------|---------|-----|------|----------|---------|');
  top.forEach((row, index) => {
    out.push(`| ${index + 1} | [${row.title}](${row.url}) | ${row.company} | ${row.fit_score} | ${row.odds_score} | **${row.priority_score}** | ${verdict(row)} |`);
  });
  out.push('');

  out.push('## Why each one ranked where it did');
  out.push('');
  top.forEach((row, index) => {
    const draft = drafts[row.job_id];
    out.push(`### ${index + 1}. ${row.title} — ${row.company}`);
    out.push('');
    out.push(`**[Open the posting](${row.url})** · ${row.location || 'location not stated'} · ${row.days_old != null ? `posted ${row.days_old}d ago` : 'no posting date'} · source: \`${row.source}\``);
    out.push('');
    out.push(`\`\`\`
Fit      ${bar(row.fit_score)}  ${row.fit_score}/100
Odds     ${bar(row.odds_score)}  ${row.odds_score}/100
Priority ${bar(row.priority_score)}  ${row.priority_score}/100
\`\`\``);
    out.push('');
    out.push('**Fit because:**');
    row.fit_reasons.forEach((reason) => out.push(`- ${reason}`));
    out.push('');
    out.push('**Odds because:**');
    row.odds_reasons.forEach((reason) => out.push(`- ${reason}`));
    out.push('');
    if (draft) {
      out.push(`**Drafted material:** [[${date}-${row.job_id}-draft|open the draft]]`);
      if (draft.unverified_count > 0) {
        out.push('');
        out.push(`> ${draft.unverified_count} of the evidence items in this draft are unverified. Confirm them before this goes anywhere.`);
      }
      out.push('');
    }
    out.push('---');
    out.push('');
  });

  out.push('## Sources this run');
  out.push('');
  out.push('| Source | Result |');
  out.push('|--------|--------|');
  for (const source of stats.sources) {
    out.push(`| \`${source.source}\` | ${source.ok ? `${source.count} postings` : `failed — ${source.error}`} |`);
  }
  out.push('');
  out.push(`_Profile driving the scoring: \`02_FullTimeJob/JobSearch/profile/dillon-profile.json\`. Compensation band and the ${profile.indeed_preferences_on_file ? 'Indeed preference mismatch' : 'profile'} are working assumptions — correct them there and the next run follows._`);

  return out.join('\n');
}

function renderDraft({ date, row, draft, profile }) {
  const out = [];
  out.push(frontmatter({
    type: 'job-application-draft',
    date,
    company: JSON.stringify(row.company),
    role: JSON.stringify(row.title),
    priority: row.priority_score,
    status: 'draft-never-sent',
  }));
  out.push('');
  out.push(`# Draft — ${row.title} at ${row.company}`);
  out.push('');
  out.push(`> **Draft only. Never sent.** Review, edit, and submit yourself at [the posting](${row.url}).`);
  out.push('');
  out.push(`**Priority ${row.priority_score}** (fit ${row.fit_score} / odds ${row.odds_score}) · ${row.location || 'location not stated'} · ${row.days_old != null ? `posted ${row.days_old}d ago` : 'no date'}`);
  out.push('');
  out.push('## Positioning');
  out.push('');
  out.push(draft.positioning);
  out.push('');
  if (draft.asks.length) {
    out.push('## What they asked for');
    out.push('');
    draft.asks.forEach((ask) => out.push(`- ${ask}`));
    out.push('');
  }
  out.push('## Resume bullets to lead with');
  out.push('');
  draft.resume_bullets.forEach((bullet) => out.push(bullet));
  out.push('');
  out.push('## Cover note draft');
  out.push('');
  out.push('```');
  out.push(draft.cover_note);
  out.push('```');
  out.push('');
  out.push('## Evidence used');
  out.push('');
  if (!draft.evidence_used.length) {
    out.push('_No logged evidence matched this posting. The bullets above are generic — strengthen `profile/evidence.json` before applying._');
  } else {
    out.push('| Claim | Metric | Status | Source |');
    out.push('|-------|--------|--------|--------|');
    draft.evidence_used.forEach((item) => {
      out.push(`| ${item.claim} | ${item.metric || '—'} | ${item.status} | \`${item.source_ref}\` |`);
    });
  }
  out.push('');
  out.push(`_Generated by \`job-search-daily\` on ${date}. Evidence is selected by keyword match against logged items — no claim here was generated, and anything marked unverified needs confirming before it is used._`);
  return out.join('\n');
}

function renderBrief({ date, ranked, stats }) {
  const top = ranked.slice(0, 5);
  const out = [];
  out.push(frontmatter({ type: 'daily-brief', subtype: 'job-search', date }));
  out.push('');
  out.push(`# Job search — ${date}`);
  out.push('');
  if (!top.length) {
    out.push('No eligible roles surfaced today.');
    out.push('');
    out.push(`Screened ${stats.raw_count} postings across ${stats.sources_ok}/${stats.sources_total} sources.`);
    out.push('');
    out.push(`Full run: [[${date}-ranked-roles]]`);
    return out.join('\n');
  }
  out.push(`**${stats.eligible} eligible roles** out of ${stats.raw_count} screened. Top ${top.length}:`);
  out.push('');
  top.forEach((row, index) => {
    out.push(`${index + 1}. **[${row.title}](${row.url})** — ${row.company}`);
    out.push(`   Priority ${row.priority_score} · fit ${row.fit_score} · odds ${row.odds_score} · ${verdict(row)}`);
  });
  out.push('');
  out.push(`Full ranked list and drafted material: [[${date}-ranked-roles]]`);
  out.push('');
  out.push('_Draft only — nothing has been sent or applied to._');
  return out.join('\n');
}

module.exports = { bar, verdict, frontmatter, renderRankedList, renderDraft, renderBrief };
