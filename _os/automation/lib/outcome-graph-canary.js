'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');
const { runOutcomeGraph, sha256 } = require('./outcome-graph');

const execFileAsync = promisify(execFile);

function fileEvidence(file, logicalPath) {
  const bytes = fs.readFileSync(file);
  return {
    path: logicalPath.replace(/\\/g, '/'),
    sha256: sha256(bytes),
    bytes: bytes.length,
  };
}

function makeSource(root, name, body) {
  const file = path.join(root, 'src', name + '.js');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, body, 'utf8');
}

function standaloneTestEnv() {
  const env = { ...process.env };
  delete env.NODE_TEST_CONTEXT;
  return env;
}

function createCanaryHarness(options = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'outcome-graph-canary-'));
  makeSource(root, 'add', "'use strict';\nmodule.exports = (a, b) => a + b;\n");
  makeSource(root, 'multiply', "'use strict';\nmodule.exports = (a, b) => a * b;\n");
  const workspaces = new Map();
  const checkedAt = (options.checkedAt || new Date()).toISOString();

  const contract = {
    schema_version: 1,
    graph_id: 'expense-tracker-test-coverage-canary',
    objective: 'Every JavaScript file under src has a matching passing test.',
    value_signal: 'Exact source-to-test coverage and the real test command both pass.',
    constraints: [
      'Synthetic temporary workspace only.',
      'No network or external actions.',
      'No Dillon OS source artifact is changed by worker adapters.',
    ],
    upstream_artifacts: [
      'temporary-canary-workspace/src/*.js',
    ],
    scope: {
      root: 'temporary-canary-workspace',
      isolation_key: 'source-file',
      data_class: 'synthetic',
    },
    source_freshness: {
      checked_at: checkedAt,
      max_age_seconds: 300,
      evidence: 'Synthetic source tree created at canary start.',
    },
    finish_line: {
      predicate: 'For every src/<name>.js, tests/<name>.test.js exists and node --test passes.',
      required_artifacts: [
        'tests/add.test.js',
        'tests/multiply.test.js',
      ],
    },
    stopping: {
      max_graph_iterations: 2,
      max_worker_attempts: 2,
      timeout_seconds: 30,
      max_parallel: 2,
      budget_units: 20,
    },
    adapters: {
      planner: 'canary-planner',
      maker: 'canary-test-writer',
      checker: 'canary-test-reviewer',
      reducer: 'canary-artifact-merger',
      terminal_verifier: 'canary-independent-validator',
      learner: 'canary-correction-ledger',
    },
    approval: {
      external_actions: false,
      required_before: [],
    },
    governance: {
      orchestrator: 'Codex test harness',
      canonical_state: 'none; synthetic canary only',
      dedupe_key: 'synthetic:expense-tracker-test-coverage-canary',
      checkpoint: 'synthetic://canary-run-receipt',
      rollback: 'Delete the temporary canary workspace.',
      escalation: 'Return blocked with exact verifier findings.',
      allowed_actions: [
        'read_synthetic_files',
        'write_synthetic_files',
        'run_local_test',
        'hash_artifacts',
      ],
      forbidden_actions: [
        'network',
        'external_action',
        'canonical_write',
      ],
    },
    learning: {
      fingerprint_inputs: ['src-tree', 'test-tree', 'node-test-result'],
      corrections_ledger: 'synthetic://canary-corrections',
    },
  };

  const adapters = {
    'canary-planner': async () => {
      const sourceFiles = fs.readdirSync(path.join(root, 'src'))
        .filter((name) => name.endsWith('.js'))
        .sort();
      return {
        evidence: 'Enumerated ' + sourceFiles.length + ' source files from the fresh synthetic tree.',
        items: sourceFiles.map((name) => {
          const sourceFile = path.join(root, 'src', name);
          return {
            id: path.basename(name, '.js'),
            source_name: name,
            isolation_key: 'src:' + name,
            input_fingerprint: sha256(fs.readFileSync(sourceFile)),
          };
        }),
      };
    },

    'canary-test-writer': async ({
      item,
      graph_attempt: graphAttempt,
      attempt,
      previous_findings: previousFindings,
    }) => {
      const isolationId = item.id + '-graph-' + graphAttempt + '-attempt-' + attempt;
      const isolatedRoot = path.join(root, '.isolated', isolationId);
      const sourceDir = path.join(isolatedRoot, 'src');
      const testDir = path.join(isolatedRoot, 'tests');
      fs.mkdirSync(sourceDir, { recursive: true });
      fs.mkdirSync(testDir, { recursive: true });
      fs.copyFileSync(
        path.join(root, 'src', item.source_name),
        path.join(sourceDir, item.source_name)
      );

      const testName = item.id + '.test.js';
      const testFile = path.join(testDir, testName);
      const operands = item.id === 'add' ? [2, 3] : [2, 3];
      const correctExpected = item.id === 'add' ? 5 : 6;
      const expected = item.id === 'multiply' && attempt === 1 ? 7 : correctExpected;
      const body = [
        "'use strict';",
        "const test = require('node:test');",
        "const assert = require('node:assert/strict');",
        "const subject = require('../src/" + item.id + ".js');",
        "test('" + item.id + " has a matching behavior test', () => {",
        '  assert.equal(subject(' + operands[0] + ', ' + operands[1] + '), ' + expected + ');',
        '});',
        '',
      ].join('\n');
      fs.writeFileSync(testFile, body, 'utf8');
      workspaces.set(isolationId, isolatedRoot);
      return {
        evidence: 'Wrote ' + testName + ' in isolated workspace ' + isolationId +
          (previousFindings.length ? ' after checker findings.' : '.'),
        isolation_id: isolationId,
        artifacts: [fileEvidence(testFile, 'tests/' + testName)],
      };
    },

    'canary-test-reviewer': async ({ item, maker_result: makerResult }) => {
      const isolatedRoot = workspaces.get(makerResult.isolation_id);
      const testFile = path.join(isolatedRoot, 'tests', item.id + '.test.js');
      try {
        await execFileAsync(process.execPath, ['--test', testFile], {
          cwd: isolatedRoot,
          encoding: 'utf8',
          env: standaloneTestEnv(),
          stdio: ['ignore', 'pipe', 'pipe'],
          timeout: 10000,
        });
        return {
          evidence: 'Independent node:test execution passed for ' + item.id + '.',
          passed: true,
          findings: [],
        };
      } catch (error) {
        return {
          evidence: 'Independent node:test execution failed for ' + item.id + '.',
          passed: false,
          findings: ['node:test exit code ' + String(error.code ?? 'unknown')],
        };
      }
    },

    'canary-artifact-merger': async ({ worker_results: workerResults }) => {
      const destination = path.join(root, 'tests');
      fs.mkdirSync(destination, { recursive: true });
      const artifacts = [];
      for (const worker of workerResults) {
        const isolatedRoot = workspaces.get(worker.isolation_id);
        const name = worker.item_id + '.test.js';
        const source = path.join(isolatedRoot, 'tests', name);
        const target = path.join(destination, name);
        if (fs.existsSync(target)) {
          throw new Error('Reducer collision at tests/' + name);
        }
        fs.copyFileSync(source, target);
        artifacts.push(fileEvidence(target, 'tests/' + name));
      }
      return {
        evidence: 'Merged ' + artifacts.length + ' independently checked artifacts with no collisions.',
        artifacts,
      };
    },

    'canary-independent-validator': async () => {
      const sourceNames = fs.readdirSync(path.join(root, 'src'))
        .filter((name) => name.endsWith('.js'))
        .map((name) => path.basename(name, '.js'))
        .sort();
      const testDir = path.join(root, 'tests');
      const testNames = fs.existsSync(testDir)
        ? fs.readdirSync(testDir)
          .filter((name) => name.endsWith('.test.js'))
          .map((name) => name.replace(/\.test\.js$/, ''))
          .sort()
        : [];
      const coveragePassed = JSON.stringify(sourceNames) === JSON.stringify(testNames);
      let testsPassed = false;
      let testEvidence = 'node:test was not run because no tests were present.';
      const testFiles = testNames.map((name) => path.join(testDir, name + '.test.js'));
      if (testFiles.length > 0) {
        try {
          await execFileAsync(process.execPath, ['--test', ...testFiles], {
            cwd: root,
            encoding: 'utf8',
            env: standaloneTestEnv(),
            stdio: ['ignore', 'pipe', 'pipe'],
            timeout: 10000,
          });
          testsPassed = true;
          testEvidence = 'node:test passed for all merged tests.';
        } catch (error) {
          testEvidence = 'node:test failed with exit code ' + String(error.code ?? 'unknown') + '.';
        }
      }
      const manifest = testFiles.filter((file) => fs.existsSync(file)).map((file) =>
        fileEvidence(file, 'tests/' + path.basename(file))
      );
      return {
        evidence: 'Independent terminal check: exact source-to-test coverage and real node:test execution.',
        passed: coveragePassed && testsPassed,
        assertions: [
          {
            id: 'matching-test-per-source',
            passed: coveragePassed,
            detail: coveragePassed
              ? 'Every source has exactly one matching test.'
              : 'Source names ' + sourceNames.join(',') + ' differ from test names ' + testNames.join(',') + '.',
          },
          {
            id: 'test-command-passes',
            passed: testsPassed,
            detail: testEvidence,
          },
        ],
        artifact_manifest: manifest,
      };
    },

    'canary-correction-ledger': async ({ outcome }) => {
      const corrections = outcome === 'terminal_true'
        ? ['Retain isolated maker and checker separation.']
        : ['Route explicit checker findings into the next bounded attempt.'];
      const entry = { outcome, corrections };
      return {
        evidence: 'Recorded the canary outcome ' + outcome + ' in the in-memory correction ledger.',
        corrections,
        ledger_receipt: {
          locator: contract.learning.corrections_ledger,
          entry_sha256: sha256(JSON.stringify(entry)),
        },
      };
    },
  };

  return {
    root,
    contract,
    adapters,
    cleanup() {
      fs.rmSync(root, { recursive: true, force: true });
    },
  };
}

async function runCanary(options = {}) {
  const harness = createCanaryHarness(options);
  try {
    return await runOutcomeGraph(harness.contract, {
      adapters: harness.adapters,
      now: options.now,
    });
  } finally {
    if (!options.preserve) harness.cleanup();
  }
}

module.exports = {
  createCanaryHarness,
  runCanary,
};
