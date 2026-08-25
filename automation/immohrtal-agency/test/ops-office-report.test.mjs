import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  buildOfficeSnapshot,
  parseCommandBoard,
  renderOfficeDashboard,
  writeOfficeRun
} from '../ops/lib/office-report.mjs';

const agencyRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(agencyRoot, '..', '..');
const fixedAsOf = '2026-08-25T20:00:00.000Z';

test('office snapshot derives five truthful seat states from the real command board', () => {
  const snapshot = buildOfficeSnapshot({ repoRoot, asOf: fixedAsOf, mode: 'both' });

  assert.equal(snapshot.roster.length, 5);
  assert.equal(new Set(snapshot.roster.map((role) => role.role_id)).size, 5);
  assert.ok(snapshot.roster.every((role) => role.runtime_state === 'NOT_OBSERVED'));
  assert.ok(snapshot.roster.every((role) => role.online_claim === false));
  assert.equal(snapshot.board.total_items, 13);
  assert.equal(snapshot.board.status_counts.READY_FOR_REVIEW, 4);
  assert.equal(snapshot.board.status_counts.BLOCKED, 2);
  assert.equal(snapshot.board.status_counts.IN_PROGRESS, 1);
  assert.equal(snapshot.board.status_counts.DEFERRED ?? 0, 0);
  assert.equal(snapshot.office_lifecycle.current_state, 'CONFIGURED_WITH_RECORDED_BLOCKERS');
  assert.equal(snapshot.office_lifecycle.background_runtime_state, 'NOT_VERIFIED_RUNNING');
  assert.equal(snapshot.office_lifecycle.schedule_state, 'NOT_INSTALLED_OR_CHANGED_BY_THIS_RUNNER');
  assert.equal(snapshot.office_lifecycle.codex_heartbeat_state, 'ACTIVE');
  assert.equal(snapshot.standup.commercial_truth.gmail_drafts_created, 5);
  assert.equal(snapshot.standup.commercial_truth.gmail_drafts_directly_read_back, 5);
  assert.equal(snapshot.standup.commercial_truth.gmail_drafts_compliance_blocked, 5);
  assert.equal(snapshot.standup.commercial_truth.researched_today, 16);
  assert.equal(snapshot.standup.commercial_truth.identity_confirmed_today, 13);
  assert.equal(snapshot.standup.commercial_truth.identity_blocked_today, 3);
  assert.equal(snapshot.standup.commercial_truth.qualified_today, 0);
  assert.equal(snapshot.standup.commercial_truth.owner_status_updates_sent, 1);
  assert.equal(snapshot.standup.commercial_truth.messages_sent, 0);
  assert.equal(snapshot.standup.commercial_truth.replies, 0);
  assert.equal(snapshot.standup.commercial_truth.meetings_booked, 0);
  assert.equal(snapshot.standup.commercial_truth.active_clients, 0);
  assert.equal(snapshot.standup.commercial_truth.verified_new_revenue_usd, 0);
  assert.ok(Object.values(snapshot.external_actions_performed_by_report_loop).every((value) => value === 0));
  assert.equal(snapshot.privacy.raw_communications_included, false);
  assert.equal(snapshot.privacy.secrets_included, false);
});

test('office snapshot consumes the latest real agency receipt without treating it as employee runtime', () => {
  const snapshot = buildOfficeSnapshot({ repoRoot, asOf: fixedAsOf, mode: 'both' });

  assert.equal(snapshot.agency_run_evidence.available, true);
  assert.equal(snapshot.agency_run_evidence.run_id, '20260825-081000');
  assert.equal(snapshot.agency_run_evidence.counts.total, 25);
  assert.equal(snapshot.agency_run_evidence.counts.awaiting_approval, 25);
  assert.equal(snapshot.agency_run_evidence.source_authority_state, 'legacy_excluded_source');
  assert.equal(snapshot.agency_run_evidence.truth_state, 'confirmed_historical_legacy_excluded_source');
  assert.ok(Object.values(snapshot.agency_run_evidence.external_actions).every((value) => value === 0));
  assert.match(snapshot.agency_run_evidence.does_not_prove, /contributes zero active pipeline records/i);
});

test('command-board parser fails closed when a required handoff field is missing', () => {
  const markdown = `### OPS-999

- \`item_id\`: \`OPS-999\`
- \`objective\`: Test a failure
`;
  assert.throws(
    () => parseCommandBoard(markdown, ['item_id', 'objective', 'owner_role_id']),
    /missing required fields: owner_role_id/
  );
});

test('office writer emits hashed JSON, Markdown, and a private dashboard idempotently', (t) => {
  const outputRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'immohrtal-office-'));
  t.after(() => fs.rmSync(outputRoot, { recursive: true, force: true }));
  const snapshot = buildOfficeSnapshot({
    repoRoot,
    asOf: fixedAsOf,
    mode: 'both',
    includeLatestAgencyReceipt: false
  });

  const first = writeOfficeRun(snapshot, { outputRoot, runId: '20260825-160000-test' });
  assert.equal(first.reused, false);
  assert.ok(fs.existsSync(first.receiptPath));
  assert.ok(fs.existsSync(first.reportJsonPath));
  assert.ok(fs.existsSync(first.reportMarkdownPath));
  assert.ok(fs.existsSync(first.dashboardPath));

  const receipt = JSON.parse(fs.readFileSync(first.receiptPath, 'utf8'));
  assert.equal(receipt.status, 'complete');
  assert.equal(receipt.artifact_sha256.office_report_json.length, 64);
  assert.equal(receipt.artifact_sha256.office_report_markdown.length, 64);
  assert.equal(receipt.artifact_sha256.office_dashboard_html.length, 64);
  assert.ok(Object.values(receipt.external_actions_performed).every((value) => value === 0));

  const dashboard = fs.readFileSync(first.dashboardPath, 'utf8');
  assert.match(dashboard, /name="robots" content="noindex,nofollow,noarchive,nosnippet"/);
  assert.equal((dashboard.match(/<article class="seat-row"/g) || []).length, 5);
  assert.match(dashboard, /NOT_OBSERVED/);
  assert.match(dashboard, /Work truth, without theater/);
  assert.doesNotMatch(dashboard, /animation\s*:/i);
  assert.doesNotMatch(dashboard, /setInterval|WebSocket|EventSource/);

  const second = writeOfficeRun(snapshot, { outputRoot, runId: '20260825-160000-test' });
  assert.equal(second.reused, true);
  assert.equal(second.receipt.input_fingerprint, receipt.input_fingerprint);
});

test('dashboard renderer exposes exact due times and blockers with no secret or contact payloads', () => {
  const snapshot = buildOfficeSnapshot({
    repoRoot,
    asOf: fixedAsOf,
    mode: 'both',
    includeLatestAgencyReceipt: false
  });
  const dashboard = renderOfficeDashboard(snapshot);

  assert.match(dashboard, /2026-08-25T12:00:00-04:00/);
  assert.match(dashboard, /Legal seller, registrations, banking, payments/);
  assert.match(dashboard, /Prospect messages sent/);
  assert.match(dashboard, /Owner status updates sent/);
  assert.match(dashboard, /Drafts held<\/span><strong>5<\/strong>/);
  assert.match(dashboard, /Daily Codex heartbeat/);
  assert.doesNotMatch(dashboard, /contact_email|contact_name|sheet_id|sender_email/);
});

test('CLI requires the explicit dry-run safety marker and emits a receipt when supplied', (t) => {
  const cli = path.join(agencyRoot, 'ops', 'run-office-report.mjs');
  const blocked = spawnSync(process.execPath, [cli, '--no-agency-receipt'], { cwd: repoRoot, encoding: 'utf8' });
  assert.equal(blocked.status, 1);
  assert.match(blocked.stderr, /Pass --dry-run explicitly/);

  const outputRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'immohrtal-office-cli-'));
  t.after(() => fs.rmSync(outputRoot, { recursive: true, force: true }));
  const completed = spawnSync(process.execPath, [
    cli,
    '--dry-run',
    '--mode', 'both',
    '--as-of', fixedAsOf,
    '--run-id', '20260825-160001-cli',
    '--repo-root', repoRoot,
    '--output-root', outputRoot,
    '--no-agency-receipt'
  ], { cwd: repoRoot, encoding: 'utf8' });

  assert.equal(completed.status, 0, completed.stderr);
  const result = JSON.parse(completed.stdout);
  assert.equal(result.status, 'complete');
  assert.equal(result.background_runtime_state, 'NOT_VERIFIED_RUNNING');
  assert.equal(result.schedule_state, 'NOT_INSTALLED_OR_CHANGED_BY_THIS_RUNNER');
  assert.ok(fs.existsSync(result.receipt));
  assert.ok(fs.existsSync(result.dashboard));
  assert.ok(Object.values(result.external_actions_performed).every((value) => value === 0));
});

test('schedule artifact is manifest-only and cannot authorize installation', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(agencyRoot, 'ops', 'office-daily.manifest.json'), 'utf8'));
  assert.equal(manifest.status, 'manifest_only_not_installed');
  assert.equal(manifest.safety.schedule_installation_authorized, false);
  assert.equal(manifest.future_registration_contract.state, 'not_performed');
  assert.equal(manifest.future_registration_contract.direct_scheduled_powershell_prohibited, true);
  assert.equal(manifest.output_contract.latest_pointer_written, false);
});
