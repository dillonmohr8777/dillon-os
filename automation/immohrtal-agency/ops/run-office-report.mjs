#!/usr/bin/env node
import path from 'node:path';
import { buildOfficeSnapshot, DEFAULT_REPO_ROOT, safeDefaultRunId, writeOfficeRun } from './lib/office-report.mjs';

function usage() {
  return `Usage: node run-office-report.mjs [options]

Options:
  --dry-run                     Required safety marker. This runner has no external mode.
  --mode standup|eod|both       Report sections to include. Default: both.
  --as-of <ISO timestamp>       Evidence observation time. Default: current time.
  --run-id <safe identifier>    Receipt directory identifier. Default: ET timestamp.
  --repo-root <path>            Repository root. Default: detected repository.
  --output-root <path>          Receipt root. Default: ops/receipts.
  --agency-receipt <path>       Use one explicit agency run receipt.
  --no-agency-receipt           Do not inspect agency run receipts.
  --help                        Show this help.

This command writes local JSON, Markdown, HTML dashboard, and receipt artifacts.
It cannot send, post, schedule, book, publish, spend, or mutate an external system.`;
}

function parseArgs(argv) {
  const options = { mode: 'both', dryRun: false, includeLatestAgencyReceipt: true };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--help' || arg === '-h') options.help = true;
    else if (arg === '--dry-run') options.dryRun = true;
    else if (arg === '--no-agency-receipt') options.includeLatestAgencyReceipt = false;
    else if (['--mode', '--as-of', '--run-id', '--repo-root', '--output-root', '--agency-receipt'].includes(arg)) {
      const value = argv[index + 1];
      if (!value || value.startsWith('--')) throw new Error(`${arg} requires a value.`);
      const key = {
        '--mode': 'mode',
        '--as-of': 'asOf',
        '--run-id': 'runId',
        '--repo-root': 'repoRoot',
        '--output-root': 'outputRoot',
        '--agency-receipt': 'agencyReceiptPath'
      }[arg];
      options[key] = value;
      index += 1;
    } else throw new Error(`Unknown option: ${arg}.`);
  }
  return options;
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    process.stdout.write(`${usage()}\n`);
    return;
  }
  if (!options.dryRun) throw new Error('This entrypoint is local dry-run only. Pass --dry-run explicitly.');

  const repoRoot = path.resolve(options.repoRoot || DEFAULT_REPO_ROOT);
  const asOf = options.asOf || new Date().toISOString();
  const runId = options.runId || safeDefaultRunId(new Date(asOf));
  const outputRoot = path.resolve(options.outputRoot || path.join(repoRoot, 'automation', 'immohrtal-agency', 'ops', 'receipts'));
  const snapshot = buildOfficeSnapshot({
    repoRoot,
    asOf,
    mode: options.mode,
    agencyReceiptPath: options.agencyReceiptPath,
    includeLatestAgencyReceipt: options.includeLatestAgencyReceipt
  });
  const result = writeOfficeRun(snapshot, { outputRoot, runId });
  process.stdout.write(`${JSON.stringify({
    status: result.receipt.status,
    reused: result.reused,
    run_id: result.receipt.run_id,
    date_et: result.receipt.date_et,
    office_state: result.receipt.office_lifecycle.current_state,
    receipt: result.receiptPath,
    report_json: result.reportJsonPath,
    report_markdown: result.reportMarkdownPath,
    dashboard: result.dashboardPath,
    background_runtime_state: result.receipt.office_lifecycle.background_runtime_state,
    schedule_state: result.receipt.office_lifecycle.schedule_state,
    external_actions_performed: result.receipt.external_actions_performed
  }, null, 2)}\n`);
}

try {
  main();
} catch (error) {
  process.stderr.write(`IMMOHRTAL office report blocked: ${String(error?.message || error).slice(0, 600)}\n`);
  process.exitCode = 1;
}
