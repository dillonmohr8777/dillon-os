'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { sha256, stableJson } = require('../lib/outcome-graph');
const {
  artifactAttestsNoExternalAction,
  assertArtifactPrivacy,
  assertSafeRoutineOutput,
  runSourceBoundRoutineDurable,
} = require('../lib/outcome-graph-source-bound');

function authority() {
  return {
    external_action_attempted: false,
    canonical_write_attempted: false,
    provider_mutation_attempted: false,
    restart_attempted: false,
    checkpoint_advance_attempted: false,
  };
}

function fixtureSources(capturedAt) {
  const manifest = [
    { locator: 'fixture/current-state.json', sha256: 'a'.repeat(64), bytes: 128 },
  ];
  return {
    captured_at: capturedAt,
    binding_version: 'fixture-v1',
    source_manifest: manifest,
    source_set_sha256: sha256(stableJson(manifest)),
    entries: [{ id: 'held-lane', state: 'held_pending_validation' }],
  };
}

function fixtureAdapter() {
  return {
    buildItems(sources) {
      return sources.entries.map((entry) => ({
        id: entry.id,
        isolation_key: `fixture:${entry.id}`,
        snapshot: entry,
      }));
    },
    evaluateItem(item, sources, context) {
      return {
        schema_version: 1,
        id: item.id,
        isolation_key: item.isolation_key,
        observed_at: context.captured_at,
        source_set_sha256: context.source_set_sha256,
        outcome_state: item.snapshot.state,
        workflow_ready: false,
        authority: authority(),
      };
    },
    reduce(records, sources, context) {
      return {
        'result.json': {
          schema_version: 1,
          generated_at: context.captured_at,
          source_set_sha256: context.source_set_sha256,
          workflow_ready: records.every((record) => record.workflow_ready),
          records,
          authority: authority(),
        },
      };
    },
    terminalAssertions({ actualArtifacts, expectedRecords }) {
      return [{
        id: 'negative-workflow-state-preserved',
        passed: actualArtifacts['result.json'].workflow_ready === false &&
          expectedRecords.every((record) => record.outcome_state === 'held_pending_validation'),
        detail: 'A terminally verified graph can preserve a truthful business hold.',
      }];
    },
    successCorrection: 'Retain the explicit held state until source-bound validation changes.',
  };
}

test('source-bound output guard accepts only the named routine shadow path', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'source-bound-path-test-'));
  try {
    const allowed = path.join(
      root,
      'System',
      'outcome-graph',
      'routines',
      'T99',
      '2026-08-24-fixture-shadow'
    );
    assert.equal(assertSafeRoutineOutput(allowed, 'T99', root), path.resolve(allowed));
    assert.throws(
      () => assertSafeRoutineOutput(path.join(root, 'System', 'result'), 'T99', root),
      /must use System\/outcome-graph\/routines\/T99/
    );
    assert.throws(
      () => assertSafeRoutineOutput(path.join(root, '..', 'outside'), 'T99', root),
      /inside the Dillon OS repository/
    );
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('source-bound privacy inspection catches direct identity and secret-bearing fields', () => {
  const findings = assertArtifactPrivacy({
    recipient: 'private@example.com',
    access_token: 'not-a-real-token',
  });
  assert.ok(findings.includes('direct-email-present'));
  assert.ok(findings.includes('secret-bearing-field-present'));
  assert.deepEqual(assertArtifactPrivacy({ state: 'redacted', authority: authority() }), []);
});

test('source-bound artifacts accept a reviewable Markdown proposal with explicit authority', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'source-bound-markdown-test-'));
  const outputDir = path.join(root, 'output');
  const proposalFile = path.join(root, 'proposal-inbox', 'proposal.md');
  const stateRoot = path.join(root, 'state');
  const collectSources = async () => fixtureSources(new Date().toISOString());
  const adapter = fixtureAdapter();
  adapter.reduce = (records, sources, context) => ({
    'proposal.md': [
      '---',
      'external_action_attempted: false',
      'canonical_write_attempted: false',
      '---',
      '',
      '# Reviewable proposal',
      '',
      `Source set: ${context.source_set_sha256}`,
      '',
      `Observed records: ${records.length}`,
      '',
    ].join('\n'),
  });
  adapter.terminalAssertions = ({ actualArtifacts }) => [{
    id: 'markdown-proposal-preserved',
    passed: actualArtifacts['proposal.md'].includes('# Reviewable proposal'),
    detail: 'The Markdown proposal is reproduced exactly from the source-bound reducer.',
  }];

  try {
    const result = await runSourceBoundRoutineDurable({
      routineId: 'T98',
      cadenceBucket: '2026-08-24',
      graphId: 'fixture-source-bound-markdown-shadow',
      objective: 'Verify a source-bound Markdown proposal without canonical mutation.',
      valueSignal: 'Knowledge work remains human-reviewable while retaining graph evidence.',
      finishLine: 'One exact Markdown proposal reproduces with explicit authority boundaries.',
      isolationKey: 'fixture_markdown_lane',
      artifactNames: ['proposal.md'],
      upstreamArtifacts: ['fixture/current-state.json'],
      canonicalState: 'The fixture source remains canonical and read only.',
      sourceEvidence: 'One stable fixture source manifest.',
      outputDir,
      stateRoot,
      logicalRoot: 'fixture/T98/2026-08-24',
      artifactOutputs: {
        'proposal.md': {
          file: proposalFile,
          logicalPath: '00_Inbox/Agent-Proposals/Codex/fixture-knowledge-proposal.md',
        },
      },
      safeOutput: false,
      adapter,
      collectSources,
    });
    assert.equal(result.outcome, 'complete', JSON.stringify(result, null, 2));
    const markdown = fs.readFileSync(proposalFile, 'utf8');
    assert.equal(fs.existsSync(path.join(outputDir, 'proposal.md')), false);
    assert.equal(artifactAttestsNoExternalAction(markdown), true);
    assert.deepEqual(assertArtifactPrivacy(markdown), []);
    const duplicate = await runSourceBoundRoutineDurable({
      routineId: 'T98',
      cadenceBucket: '2026-08-24',
      graphId: 'fixture-source-bound-markdown-shadow',
      objective: 'Verify a source-bound Markdown proposal without canonical mutation.',
      valueSignal: 'Knowledge work remains human-reviewable while retaining graph evidence.',
      finishLine: 'One exact Markdown proposal reproduces with explicit authority boundaries.',
      isolationKey: 'fixture_markdown_lane',
      artifactNames: ['proposal.md'],
      upstreamArtifacts: ['fixture/current-state.json'],
      canonicalState: 'The fixture source remains canonical and read only.',
      sourceEvidence: 'One stable fixture source manifest.',
      outputDir,
      stateRoot,
      logicalRoot: 'fixture/T98/2026-08-24',
      artifactOutputs: {
        'proposal.md': {
          file: proposalFile,
          logicalPath: '00_Inbox/Agent-Proposals/Codex/fixture-knowledge-proposal.md',
        },
      },
      safeOutput: false,
      adapter,
      collectSources,
    });
    assert.equal(duplicate.deduped, true);
    assert.equal(duplicate.run_id, result.run_id);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('source-bound durable run freezes evaluation time, preserves a negative state, and dedupes', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'source-bound-durable-test-'));
  const outputDir = path.join(root, 'output');
  const stateRoot = path.join(root, 'state');
  const captures = [];
  let collection = 0;
  const collectSources = async () => {
    const capturedAt = new Date(
      Date.parse('2026-08-24T14:00:00.000Z') + collection * 2000
    ).toISOString();
    collection += 1;
    captures.push(capturedAt);
    return fixtureSources(capturedAt);
  };
  const options = {
    routineId: 'T99',
    cadenceBucket: '2026-08-24',
    graphId: 'fixture-source-bound-shadow',
    objective: 'Verify a reusable source-bound negative-state workflow.',
    valueSignal: 'The same stable sources reproduce one truthful held result.',
    finishLine: 'One held fixture is reconstructed exactly and remains held.',
    isolationKey: 'fixture_lane',
    artifactNames: ['result.json'],
    upstreamArtifacts: ['fixture/current-state.json'],
    canonicalState: 'The fixture current-state source remains canonical and read only.',
    sourceEvidence: 'One stable fixture source manifest.',
    outputDir,
    stateRoot,
    logicalRoot: 'fixture/T99/2026-08-24',
    safeOutput: false,
    adapter: fixtureAdapter(),
    collectSources,
  };

  try {
    const first = await runSourceBoundRoutineDurable(options);
    assert.equal(first.outcome, 'complete', JSON.stringify(first, null, 2));
    assert.equal(first.terminal_truth, true);
    assert.equal(first.deduped, false);
    assert.ok(captures.length >= 5);
    assert.ok(new Set(captures).size >= 5);

    const artifact = JSON.parse(fs.readFileSync(path.join(outputDir, 'result.json'), 'utf8'));
    assert.equal(artifact.workflow_ready, false);
    assert.equal(artifact.records.length, 1);
    assert.equal(artifact.records[0].outcome_state, 'held_pending_validation');
    assert.equal(artifact.generated_at, artifact.records[0].observed_at);
    assert.notEqual(artifact.generated_at, captures[captures.length - 1]);
    assert.equal(artifact.authority.external_action_attempted, false);

    const beforeDuplicate = collection;
    const duplicate = await runSourceBoundRoutineDurable(options);
    assert.equal(duplicate.outcome, 'complete');
    assert.equal(duplicate.terminal_truth, true);
    assert.equal(duplicate.deduped, true);
    assert.equal(duplicate.run_id, first.run_id);
    assert.ok(collection >= beforeDuplicate + 2);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
