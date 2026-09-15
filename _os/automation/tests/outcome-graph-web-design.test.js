'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { sha256, stableJson } = require('../lib/outcome-graph');
const {
  FINAL_NAMES,
  REQUIRED_CRAFT_DIMENSIONS,
  REQUIRED_GATES,
  assertSafeWebDesignOutput,
  runWebDesignLoopDurable,
  validateDesignInspection,
} = require('../lib/outcome-graph-web-design');

function fixtureSources(capturedAt, { productionIntent = false } = {}) {
  const sourceManifest = [
    { locator: 'fixture/PRODUCT.md', sha256: 'a'.repeat(64), bytes: 320 },
    { locator: 'fixture/DESIGN.md', sha256: 'b'.repeat(64), bytes: 480 },
    { locator: 'fixture/surface-brief.json', sha256: 'c'.repeat(64), bytes: 240 },
  ];
  return {
    captured_at: capturedAt,
    binding_version: 'fixture-design-v1',
    source_manifest: sourceManifest,
    source_set_sha256: sha256(stableJson(sourceManifest)),
    surfaces: [{
      id: 'fixture-surface',
      mode: 'Persuade',
      production_intent: productionIntent,
      brief: {
        audience: 'A reviewer evaluating the closed-loop design runtime',
        job: 'Understand the value and inspect one exact candidate',
        primary_action: 'Review the candidate evidence',
        art_direction_thesis: 'Editorial clarity with a single strong signal and no generic dashboard chrome',
      },
      authority: [
        { locator: 'fixture/DESIGN.md', sha256: 'b'.repeat(64), role: 'design-truth' },
      ],
      deployment: { state: 'local_only', authorized: false },
    }],
  };
}

function gateResults(failed = []) {
  return REQUIRED_GATES.map((id) => ({
    id,
    passed: !failed.includes(id),
    detail: failed.includes(id) ? `${id} needs repair` : `${id} passed`,
  }));
}

function craftScores(value) {
  return Object.fromEntries(REQUIRED_CRAFT_DIMENSIONS.map((dimension) => [dimension, value]));
}

function writeCapture(root, name, contents) {
  fs.mkdirSync(root, { recursive: true });
  const file = path.join(root, name);
  fs.writeFileSync(file, Buffer.from(contents));
  return file;
}

function passingReport(overrides = {}) {
  return {
    surface_id: 'fixture-surface',
    source_set_sha256: 'd'.repeat(64),
    build_manifest_sha256: 'e'.repeat(64),
    maker_id: 'fixture-maker',
    reviewer_id: 'fixture-checker',
    review_type: 'synthetic_canary',
    production_eligible: false,
    gate_results: gateResults(),
    captures: [
      { viewport: 'desktop', width: 1440, height: 1000, path: 'desktop.png', sha256: '1'.repeat(64), bytes: 100 },
      { viewport: 'mobile', width: 390, height: 844, path: 'mobile.png', sha256: '2'.repeat(64), bytes: 100 },
    ],
    craft: {
      verdict: 'pass',
      summary: 'The hierarchy, typography, rhythm, and responsive behavior are coherent and specific.',
      scores: craftScores(4.5),
    },
    findings: [],
    external_action_attempted: false,
    ...overrides,
  };
}

test('web-design output guard accepts only the dedicated surface/date route', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'web-design-path-'));
  try {
    const allowed = path.join(root, 'System', 'outcome-graph', 'web-design', 'fixture-surface', '2026-08-24-canary');
    assert.equal(assertSafeWebDesignOutput(allowed, root), path.resolve(allowed));
    assert.throws(
      () => assertSafeWebDesignOutput(path.join(root, 'System', 'outcome-graph', 'fixture'), root),
      /must use System\/outcome-graph\/web-design/
    );
    assert.throws(
      () => assertSafeWebDesignOutput(path.join(root, '..', 'outside'), root),
      /inside the Dillon OS repository/
    );
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('production-intent design cannot pass with synthetic or self review', () => {
  const surface = fixtureSources(new Date().toISOString(), { productionIntent: true }).surfaces[0];
  const synthetic = validateDesignInspection(passingReport(), surface);
  assert.equal(synthetic.passed, false);
  assert.ok(synthetic.findings.some((finding) => finding.id === 'production-review-ineligible'));

  const selfReviewed = validateDesignInspection(passingReport({
    reviewer_id: 'fixture-maker',
    review_type: 'independent_agent',
    production_eligible: true,
  }), surface);
  assert.equal(selfReviewed.passed, false);
  assert.ok(selfReviewed.findings.some((finding) => finding.id === 'self-review'));

  const independent = validateDesignInspection(passingReport({
    review_type: 'independent_agent',
    production_eligible: true,
  }), surface);
  assert.equal(independent.passed, true);
  assert.equal(independent.craft_average, 4.5);
});

test('web-design durable loop feeds critique into repair, rechecks the render, and dedupes', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'web-design-loop-'));
  const outputDir = path.join(root, 'output');
  const stateRoot = path.join(root, 'state');
  const logicalRoot = 'fixture/web-design/fixture-surface/2026-08-24';
  let makerCalls = 0;
  let checkerCalls = 0;
  let terminalCalls = 0;
  const collectSources = async () => fixtureSources(new Date().toISOString());
  const makeSurface = async ({ attempt, previous_findings: previousFindings, attempt_root: attemptRoot }) => {
    makerCalls += 1;
    const buildRoot = path.join(attemptRoot, 'build');
    fs.mkdirSync(buildRoot, { recursive: true });
    const repaired = attempt > 1 && previousFindings.some((finding) => finding.id === 'hero-hierarchy-flat');
    fs.writeFileSync(
      path.join(buildRoot, 'index.html'),
      repaired
        ? '<!doctype html><title>Closed loop</title><main><h1>One clear outcome</h1><a href="#proof">Review proof</a><section id="proof">Verified</section></main>'
        : '<!doctype html><title>Draft</title><main><p>Everything has equal weight</p></main>',
      'utf8'
    );
    return {
      maker_id: 'fixture-maker',
      build_root: buildRoot,
      implementation_summary: repaired ? 'Applied the exact hierarchy and responsive repair.' : 'Produced the first source-bound draft.',
    };
  };
  const inspectSurface = async ({ phase, attempt, evidence_root: evidenceRoot }) => {
    if (phase === 'terminal') terminalCalls += 1;
    else checkerCalls += 1;
    const failing = phase === 'checker' && attempt === 1;
    const desktop = writeCapture(evidenceRoot, 'desktop.png', `desktop:${phase}:${attempt}`);
    const mobile = writeCapture(evidenceRoot, 'mobile.png', `mobile:${phase}:${attempt}`);
    return {
      reviewer_id: phase === 'terminal' ? 'fixture-terminal-checker' : 'fixture-checker',
      review_type: 'synthetic_canary',
      production_eligible: false,
      gate_results: gateResults(failing ? ['responsive', 'independent-craft'] : []),
      captures: [
        { viewport: 'desktop', width: 1440, height: 1000, file: desktop },
        { viewport: 'mobile', width: 390, height: 844, file: mobile },
      ],
      craft: {
        verdict: failing ? 'fail' : 'pass',
        summary: failing
          ? 'The first screen has no usable hierarchy.'
          : 'The repaired candidate has a clear first-screen hierarchy and consistent responsive rhythm.',
        scores: craftScores(failing ? 3 : 4.5),
      },
      findings: failing ? [{
        id: 'hero-hierarchy-flat',
        gate_id: 'independent-craft',
        severity: 'major',
        summary: 'The hero does not establish a primary message or action.',
        repair_instruction: 'Create one dominant headline and one primary action in the first viewport.',
        regression_test: 'Desktop and mobile review identify one dominant message and one primary action.',
        learning_target: 'brief',
      }] : [],
      external_action_attempted: false,
    };
  };
  const options = {
    cadenceBucket: '2026-08-24',
    graphId: 'fixture-web-design-loop',
    outputDir,
    stateRoot,
    logicalRoot,
    safeOutput: false,
    collectSources,
    makeSurface,
    inspectSurface,
    terminalInspectSurface: inspectSurface,
    maxRepairPasses: 2,
  };

  try {
    const result = await runWebDesignLoopDurable(options);
    assert.equal(result.outcome, 'awaiting_approval', JSON.stringify(result, null, 2));
    assert.equal(result.terminal_truth, true);
    assert.equal(result.deduped, false);
    assert.equal(result.graph_iterations[0].workers[0].attempts.length, 2);
    assert.equal(makerCalls, 2);
    assert.equal(checkerCalls, 2);
    assert.equal(terminalCalls, 1);

    for (const name of FINAL_NAMES) assert.equal(fs.existsSync(path.join(outputDir, name)), true);
    const receipt = JSON.parse(fs.readFileSync(path.join(outputDir, FINAL_NAMES[0]), 'utf8'));
    assert.equal(receipt.graph_ready, true);
    assert.equal(receipt.production_ready, false);
    assert.equal(receipt.state, 'verified_nonproduction_candidate');
    assert.equal(receipt.surfaces[0].repair_cycles, 1);
    assert.equal(receipt.authority.external_action_attempted, false);
    assert.equal(receipt.authority.deployment_attempted, false);

    const defects = JSON.parse(fs.readFileSync(path.join(outputDir, FINAL_NAMES[1]), 'utf8'));
    assert.equal(defects.open_defects, 0);
    assert.ok(defects.surfaces[0].attempts[0].findings.some((finding) =>
      finding.id === 'hero-hierarchy-flat' && finding.state === 'resolved_by_later_attempt'
    ));
    const candidate = fs.readFileSync(path.join(outputDir, 'candidates', 'fixture-surface', 'index.html'), 'utf8');
    assert.match(candidate, /One clear outcome/);

    const countsBeforeDedupe = { makerCalls, checkerCalls, terminalCalls };
    const duplicate = await runWebDesignLoopDurable(options);
    assert.equal(duplicate.outcome, 'awaiting_approval');
    assert.equal(duplicate.deduped, true);
    assert.equal(duplicate.run_id, result.run_id);
    assert.deepEqual({ makerCalls, checkerCalls, terminalCalls }, countsBeforeDedupe);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
