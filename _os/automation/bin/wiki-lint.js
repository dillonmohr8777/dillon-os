#!/usr/bin/env node
'use strict';

/**
 * Deterministic brain-layer lint.
 *
 *   node _os/automation/bin/wiki-lint.js            # report, exit 0
 *   node _os/automation/bin/wiki-lint.js --strict    # exit 1 on any error finding
 *   node _os/automation/bin/wiki-lint.js --json      # machine-readable only
 *   node _os/automation/bin/wiki-lint.js --no-report # skip the markdown brief
 *
 * The `/wiki-lint` skill still owns the judgment calls (duplicate pages,
 * contradictions). This owns the mechanical checks so they cannot drift.
 */

const fs = require('fs');
const path = require('path');
const { repoPath, ensureDir, nowISO, todayISO } = require('../lib/fsutil');
const { writeRunState } = require('../lib/registry');
const { lint, loadPolicy, groupByRule } = require('../lib/wikilint');

const AUTOMATION_ID = 'wiki-lint';

function renderReport(result, policy) {
  const groups = groupByRule(result.findings);
  const byId = new Map((policy.rules || []).map((r) => [r.id, r]));
  const lines = [
    `# Wiki lint — ${result.today}`,
    '',
    `Generated: ${nowISO()}`,
    `Status: **${result.status}**`,
    '',
    `- Pages scanned: ${result.counts.scanned}`,
    `- Linkable files indexed: ${result.counts.linkable}`,
    `- Reachable from \`${policy.index}\`: ${result.counts.reachable ?? 'n/a'}`,
    `- Errors: ${result.counts.errors}`,
    `- Warnings: ${result.counts.warnings}`,
    '',
  ];

  if (!result.findings.length) {
    lines.push('No findings. The brain layer satisfies every rule in', '', `\`${require('../lib/wikilint').POLICY_PATH}\`.`, '');
    return lines.join('\n');
  }

  for (const [ruleId, findings] of groups) {
    const rule = byId.get(ruleId) || {};
    lines.push(
      `## ${ruleId} — ${findings.length} ${findings.length === 1 ? 'finding' : 'findings'} (${rule.severity || 'error'})`,
      '',
      rule.description ? `${rule.description}` : '',
      '',
    );
    for (const f of findings) {
      const where = f.line ? `\`${f.file}\`:${f.line}` : `\`${f.file}\``;
      lines.push(`- ${where} — ${f.detail}`);
    }
    lines.push('');
  }

  lines.push(
    '## How to clear these',
    '',
    '- `source-present` / `expires-present`: add real provenance. Never invent a source — if the capture is private, point at `12_Brain/private/raw/`.',
    '- `link-resolves`: fix the target or create the missing page. Gitignored-by-design prefixes are configured in the policy, not worked around per link.',
    '- `index-reachable`: add the page to `12_Brain/INDEX.md` or to a folder index INDEX already links.',
    '- `expires-fresh`: re-verify the finding and move the date, or delete the page. A wrong page is worse than no page.',
    '',
  );
  return lines.join('\n');
}

function main() {
  const argv = process.argv.slice(2);
  const strict = argv.includes('--strict');
  const jsonOnly = argv.includes('--json');
  const writeReport = !argv.includes('--no-report');

  const policy = loadPolicy();
  const result = lint({ policy, today: todayISO() });

  const summary = {
    automation_id: AUTOMATION_ID,
    started_at: nowISO(),
    status: result.status,
    counts: result.counts,
    findings: result.findings.map(({ rule, severity, file, detail, line, target, expires }) => ({
      rule,
      severity,
      file,
      detail,
      ...(line ? { line } : {}),
      ...(target ? { target } : {}),
      ...(expires ? { expires } : {}),
    })),
  };

  const stateFile = writeRunState(AUTOMATION_ID, summary);
  let reportPath = null;
  if (writeReport) {
    reportPath = repoPath('Daily-Briefs', `wiki-lint-${result.today}.md`);
    ensureDir(path.dirname(reportPath));
    fs.writeFileSync(reportPath, renderReport(result, policy));
  }

  const out = {
    status: result.status,
    counts: result.counts,
    state: path.relative(repoPath(), stateFile),
    report: reportPath ? path.relative(repoPath(), reportPath) : null,
  };

  if (jsonOnly) {
    console.log(JSON.stringify(summary, null, 2));
  } else {
    console.log(JSON.stringify(out, null, 2));
    for (const [ruleId, findings] of groupByRule(result.findings)) {
      console.log(`\n${ruleId} (${findings.length}):`);
      for (const f of findings) {
        console.log(`  ${f.file}${f.line ? `:${f.line}` : ''} — ${f.detail}`);
      }
    }
  }

  process.exit(strict && result.counts.errors > 0 ? 1 : 0);
}

main();
