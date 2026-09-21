'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { sha256, stableJson } = require('../lib/outcome-graph');
const {
  FINAL_NAMES,
  runWeeklyTrancheDurable,
} = require('../lib/outcome-graph-weekly-tranche');

function fixtureSources() {
  const window = {
    prepared: '2026-08-24',
    period_start: '2026-08-17',
    period_end: '2026-08-23',
    month: '2026-08',
  };
  const manifest = [
    { locator: 'fixture/content.md', sha256: 'a'.repeat(64), bytes: 100 },
    { locator: 'fixture/report.json', sha256: 'b'.repeat(64), bytes: 200 },
    { locator: 'fixture/experiment.md', sha256: 'c'.repeat(64), bytes: 300 },
  ];
  return {
    captured_at: new Date().toISOString(),
    window,
    report_directory_name: 'fixture-report-window',
    queue: {
      locator: 'client-operations/queue/work-items.json',
      revision: 7,
      sha256: 'd'.repeat(64),
      updated_at: '2026-08-24T12:00:00.000Z',
      active_items: [{
        id: 'fixture-active',
        version: 1,
        client_id: 'fixture-client',
        title: 'Fixture review',
        status: 'ready',
        owner: 'marketing-chief',
        due_date: null,
      }],
      content_commitments: [],
    },
    registry: {
      locator: 'client-operations/registry/clients.json',
      sha256: 'e'.repeat(64),
      client_count: 1,
    },
    content_sources: [{
      client_id: 'fixture-client',
      client_name: 'Fixture Client',
      client_status: 'active',
      source_locator: 'fixture/content.md',
      source_sha256: 'a'.repeat(64),
      source_bytes: 100,
      physical_path: 'never-publish/content.md',
      modified_at: '2026-08-24T12:00:00.000Z',
      month: '2026-08',
      text: 'Reference calendar only. Re-confirm scope before scheduling.',
      commitments: [],
    }],
    reports: [{
      client_id: 'fixture-client',
      client_name: 'Fixture Client',
      client_status: 'active',
      directory_locator: 'fixture/report-package',
      source_data_locator: 'fixture/report.json',
      source_data_sha256: 'b'.repeat(64),
      source_data_bytes: 200,
      source_data: {
        reporting_window: '2026-08-17 through 2026-08-23',
        prepared: '2026-08-24',
        evidence_mode: 'fixture-live-equivalent',
        metrics: [
          ['Impressions', '100'],
          ['Clicks', '10'],
          ['CTR', '10.00%'],
          ['Spend', '$20.00'],
          ['Avg. CPC', '$2.00'],
        ],
        sources: ['Fixture platform export'],
      },
      html_locator: 'fixture/report.html',
      html_sha256: 'f'.repeat(64),
      html_bytes: 400,
      html: '<p>Impressions 100</p><p>Clicks 10</p><p>CTR 10.00%</p><p>Spend $20.00</p><p>Avg. CPC $2.00</p><span>private-lead@example.invalid</span>',
      pdf_locator: 'fixture/report.pdf',
      pdf_sha256: '1'.repeat(64),
      pdf_bytes: 500,
      pdf_revisions: [{
        locator: 'fixture/report.pdf',
        sha256: '1'.repeat(64),
        bytes: 500,
        modified_at: '2026-08-24T12:00:00.000Z',
      }],
      physical: {
        source_data: 'never-publish/source-data.json',
        html: 'never-publish/report.html',
        pdf: 'never-publish/report.pdf',
      },
    }],
    experiments: [{
      experiment_id: 'EXP-FIXTURE',
      source_locator: 'fixture/experiment.md',
      source_sha256: 'c'.repeat(64),
      source_bytes: 300,
      physical_path: 'never-publish/experiment.md',
      text: [
        '---',
        'status: proposed',
        'experiment_id: EXP-FIXTURE',
        'experiment_stage: intake',
        'outcome: "Prove a bounded fixture outcome."',
        'next_action: "Run one deterministic fixture check."',
        'verification_status: unverified',
        'risk: low',
        '---',
        '',
        '# Fixture experiment',
      ].join('\n'),
    }],
    context: {
      w09_w11: {
        locator: 'fixture/W09-W11/run-receipt.json',
        sha256: '2'.repeat(64),
        outcome: 'complete',
        terminal_truth: true,
        run_id: 'OGD-FIXTURE',
        terminal_assertions: [{ id: 'fixture', passed: true }],
      },
      health: {
        locator: '12_Brain/09_Ops/Health.md',
        sha256: '3'.repeat(64),
        blocked: true,
        warning_count: 35,
      },
    },
    source_manifest: manifest,
    source_set_sha256: sha256(stableJson(manifest)),
  };
}

test('durable W04 W06 W08 W10 tranche verifies, protects private source detail, and dedupes', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'weekly-tranche-test-'));
  const outputDir = path.join(root, 'output');
  const stateRoot = path.join(root, 'state');
  const template = fixtureSources();
  let collections = 0;
  const collectSources = async () => {
    collections += 1;
    return {
      ...structuredClone(template),
      captured_at: new Date().toISOString(),
    };
  };
  const options = {
    outputDir,
    stateRoot,
    logicalRoot: 'fixture-weekly-tranche',
    safeOutput: false,
    collectSources,
    window: template.window,
  };

  try {
    const first = await runWeeklyTrancheDurable(options);
    assert.equal(first.outcome, 'complete');
    assert.equal(first.terminal_truth, true);
    assert.equal(first.deduped, false);
    assert.equal(first.graph_iterations[0].workers.length, 3);
    assert.ok(first.graph_iterations[0].workers.every((worker) => worker.status === 'verified'));

    for (const name of FINAL_NAMES) {
      assert.equal(fs.existsSync(path.join(outputDir, name)), true, name);
    }
    const w04 = JSON.parse(fs.readFileSync(path.join(outputDir, FINAL_NAMES[0]), 'utf8'));
    const w06 = JSON.parse(fs.readFileSync(path.join(outputDir, FINAL_NAMES[1]), 'utf8'));
    const w08 = JSON.parse(fs.readFileSync(path.join(outputDir, FINAL_NAMES[2]), 'utf8'));
    const w10 = JSON.parse(fs.readFileSync(path.join(outputDir, FINAL_NAMES[3]), 'utf8'));
    assert.equal(w04.summary.production_ready_items, 0);
    assert.equal(w04.summary.held_source_records, 1);
    assert.deepEqual(w06.summary, {
      discovered: 1,
      passed: 1,
      pending_delivery_route: 1,
    });
    assert.equal(w08.summary.inconclusive, 1);
    assert.equal(w08.summary.verified_outcome_receipts, 0);
    assert.equal(w10.proposal_only, true);
    assert.equal(w10.canonical_write_attempted, false);
    assert.equal(w10.external_action_attempted, false);
    assert.equal(w10.risks[0].warning_count, 35);

    const published = FINAL_NAMES.map((name) =>
      fs.readFileSync(path.join(outputDir, name), 'utf8')
    ).join('\n');
    assert.doesNotMatch(published, /private-lead@example\.invalid/i);
    assert.doesNotMatch(published, /never-publish/i);
    assert.doesNotMatch(published, /resume_locator/i);

    const collectionsBeforeDuplicate = collections;
    const duplicate = await runWeeklyTrancheDurable(options);
    assert.equal(duplicate.outcome, 'complete');
    assert.equal(duplicate.deduped, true);
    assert.equal(duplicate.run_id, first.run_id);
    assert.equal(collections, collectionsBeforeDuplicate + 2);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
