#!/usr/bin/env node
'use strict';

/**
 * Grade one website. The quick answer to "should we pitch this one?"
 *
 *   node _os/automation/bin/grade-site.js https://surayaphilly.com --name "Suraya" --vertical restaurant
 *   node _os/automation/bin/grade-site.js https://example.com --json
 *   node _os/automation/bin/grade-site.js https://example.com --max-pass 2   # allow the render pass
 */

const { gradeTarget, PASS } = require('../lib/grader');
const { slugify } = require('../lib/fsutil');

function parseArgs(argv) {
  const out = { url: null, name: '', vertical: '', reviews: null, rating: null, maxPass: PASS.STATIC, json: false, noCrawlFiles: false, ads: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--name') out.name = argv[++i];
    else if (a === '--vertical') out.vertical = argv[++i];
    else if (a === '--reviews') out.reviews = Number(argv[++i]);
    else if (a === '--rating') out.rating = Number(argv[++i]);
    else if (a === '--max-pass') out.maxPass = Number(argv[++i]);
    else if (a === '--render') out.maxPass = PASS.RENDER;
    else if (a === '--json') out.json = true;
    else if (a === '--no-crawl-files') out.noCrawlFiles = true;
    else if (a === '--ads') out.ads = true;
    else if (!a.startsWith('--')) out.url = a;
  }
  return out;
}

const BAR_WIDTH = 22;
function bar(score, max) {
  if (score == null) return '·'.repeat(BAR_WIDTH);
  const filled = Math.round((score / max) * BAR_WIDTH);
  return '█'.repeat(filled) + '░'.repeat(BAR_WIDTH - filled);
}

function report(r) {
  const lines = [];
  const title = r.business_name || r.url_graded || r.url_on_file || '(unnamed)';
  lines.push('');
  lines.push(`  ${title}`);
  lines.push(`  ${'─'.repeat(Math.max(20, Math.min(72, title.length + 4)))}`);
  lines.push(`  state      ${r.state}  ${r.state_reason ? `— ${r.state_reason}` : ''}`);
  if (r.url_graded) lines.push(`  graded     ${r.final_url || r.url_graded}`);

  if (r.signal) {
    lines.push('');
    lines.push(`  SIGNAL     ${String(r.signal.score).padStart(3)} / 100   ${r.signal.band_label}   (confidence ${Math.round(r.signal.confidence * 100)}%)`);
    lines.push(`             ${r.signal.band_meaning}`);
    lines.push('');
    for (const [, d] of Object.entries(r.signal.dimensions)) {
      const val = d.score == null ? ' n/a' : `${String(Math.round(d.score)).padStart(2)}/${d.max}`;
      lines.push(`  ${d.letter}  ${d.label.padEnd(12)} ${bar(d.score, d.max)}  ${val}`);
    }
    if (r.signal.top_gaps.length) {
      lines.push('');
      lines.push('  Biggest gaps (these are the outreach hooks)');
      for (const g of r.signal.top_gaps) lines.push(`    −${String(g.lost).padStart(4)}  ${g.label}: ${g.evidence}`);
    }
    if (r.signal.strengths.length) {
      lines.push('');
      lines.push('  Already good');
      for (const s of r.signal.strengths.slice(0, 4)) lines.push(`     ok   ${s.label}: ${s.evidence}`);
    }
    if (r.signal.render_findings && r.signal.render_findings.length) {
      lines.push('');
      lines.push('  Render pass found');
      for (const f of r.signal.render_findings) lines.push(`         ${f}`);
    }
  }

  lines.push('');
  lines.push(`  Viability  ${String(r.viability.score).padStart(3)} / 100   ${r.viability.enriched ? '' : '(unenriched — floor applied)'}`);
  for (const reason of r.viability.reasons.slice(0, 5)) lines.push(`             ${reason}`);

  lines.push('');
  lines.push(`  LANE       ${r.lane_label}`);
  lines.push(`  why        ${r.why}`);
  lines.push(`  offer      ${r.offer}`);
  lines.push(`  priority   ${r.priority}${r.outreach_eligible ? '' : '   (not outreach eligible)'}`);
  lines.push('');
  lines.push(`  passes     ${r.passes_run.join(' → ')}`);
  for (const e of r.escalations) {
    if (e.skipped) lines.push(`  skipped    ${e.pass}: ${e.skipped}`);
    else lines.push(`  escalated  ${e.pass}: ${(e.reasons || []).join('; ')}`);
  }
  lines.push(`  expires    ${r.expires}   (weights ${r.weights_version})`);
  lines.push('');
  return lines.join('\n');
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.url) {
    console.error('Usage: node grade-site.js <url> [--name "Business"] [--vertical hvac] [--reviews 120] [--rating 4.7] [--ads] [--render] [--json]');
    process.exit(1);
  }

  const target = {
    prospect_id: `adhoc:${slugify(args.name || args.url)}`,
    business_name: args.name || null,
    slug: slugify(args.name || args.url.replace(/^https?:\/\//, '')),
    website: args.url,
    vertical: args.vertical,
    review_count: args.reviews,
    rating: args.rating,
    ad_presence: args.ads || undefined,
    has_phone: true,
  };

  const result = await gradeTarget(target, { maxPass: args.maxPass, crawlFiles: !args.noCrawlFiles });

  if (args.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(report(result));
  }
  // Exit code carries the decision so a shell pipeline can branch on it.
  process.exit(result.outreach_eligible ? 0 : 3);
}

main().catch((err) => {
  console.error(err.stack || err.message);
  process.exit(1);
});
