'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { REPO_ROOT } = require('./fsutil');
const { sha256, stableJson } = require('./outcome-graph');
const { runDurableOutcomeGraph, writeJsonAtomic } = require('./outcome-graph-state');

const FINAL_NAMES = [
  'web-design-loop-receipt.json',
  'design-defect-ledger.json',
  'final-build-manifest.json',
  'design-learning-proposal.json',
];
const REQUIRED_GATES = [
  'authority',
  'brief',
  'build',
  'responsive',
  'interaction',
  'accessibility',
  'performance',
  'content-truth',
  'design-system',
  'independent-craft',
];
const REQUIRED_VIEWPORTS = ['desktop', 'mobile'];
const REQUIRED_CRAFT_DIMENSIONS = [
  'brand_specificity',
  'visual_hierarchy',
  'composition_rhythm',
  'typography',
  'imagery',
  'interaction_motion',
  'responsive_integrity',
  'content_clarity',
];
const SURFACE_MODES = ['Persuade', 'Operate', 'Read', 'Experience'];
const PRODUCTION_REVIEW_TYPES = ['independent_agent', 'human'];

function normalizePath(value) {
  return String(value || '').replace(/\\/g, '/');
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
}

function safeSlug(value, label = 'slug') {
  const slug = String(value || '').toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error(`${label} must contain lowercase letters, digits, and single hyphens only.`);
  }
  return slug;
}

function insideRoot(candidate, root, label) {
  const absolute = path.resolve(candidate);
  const resolvedRoot = path.resolve(root);
  const relative = path.relative(resolvedRoot, absolute);
  if (relative === '..' || relative.startsWith('..' + path.sep) || path.isAbsolute(relative)) {
    throw new Error(`${label} escapes its assigned root.`);
  }
  return absolute;
}

function walkFiles(root) {
  if (!fs.existsSync(root)) return [];
  const files = [];
  const stack = [path.resolve(root)];
  while (stack.length > 0) {
    const directory = stack.pop();
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name);
      if (entry.isSymbolicLink()) throw new Error(`Web-design candidates may not contain symlinks: ${file}`);
      if (entry.isDirectory()) stack.push(file);
      else if (entry.isFile()) files.push(file);
    }
  }
  return files.sort((a, b) => normalizePath(a).localeCompare(normalizePath(b)));
}

function fileEvidence(file, logicalPath, includeResume = false) {
  const bytes = fs.readFileSync(file);
  return {
    path: normalizePath(logicalPath),
    sha256: sha256(bytes),
    bytes: bytes.length,
    ...(includeResume ? { resume_locator: path.resolve(file) } : {}),
  };
}

function directoryManifest(root, logicalRoot, includeResume = false) {
  const absoluteRoot = path.resolve(root);
  return walkFiles(absoluteRoot).map((file) => fileEvidence(
    file,
    normalizePath(path.join(logicalRoot, path.relative(absoluteRoot, file))),
    includeResume
  ));
}

function manifestFingerprint(manifest) {
  return sha256(stableJson(manifest.map(({ path: locator, sha256: digest, bytes }) => ({
    path: normalizePath(locator),
    sha256: digest,
    bytes,
  }))));
}

function assertDesignSourcePacket(sources) {
  if (!sources || typeof sources !== 'object') throw new Error('Web-design source packet is required.');
  if (!/^\d{4}-\d{2}-\d{2}T/.test(String(sources.captured_at || '')) ||
      !Number.isFinite(Date.parse(sources.captured_at))) {
    throw new Error('Web-design source packet captured_at is invalid.');
  }
  if (!/^[a-f0-9]{64}$/.test(String(sources.source_set_sha256 || ''))) {
    throw new Error('Web-design source packet source_set_sha256 is invalid.');
  }
  if (!Array.isArray(sources.source_manifest) || sources.source_manifest.length === 0) {
    throw new Error('Web-design source packet needs a nonempty source manifest.');
  }
  for (const source of sources.source_manifest) {
    if (!source.locator || !/^[a-f0-9]{64}$/.test(String(source.sha256 || '')) ||
        !Number.isInteger(source.bytes) || source.bytes < 0) {
      throw new Error('Web-design source packet contains an invalid source-manifest entry.');
    }
  }
  if (!Array.isArray(sources.surfaces) || sources.surfaces.length === 0) {
    throw new Error('Web-design source packet needs at least one surface.');
  }
  const ids = new Set();
  for (const surface of sources.surfaces) {
    const id = safeSlug(surface.id, 'surface id');
    if (ids.has(id)) throw new Error(`Duplicate web-design surface id ${id}.`);
    ids.add(id);
    if (!SURFACE_MODES.includes(surface.mode)) {
      throw new Error(`Surface ${id} must resolve to Persuade, Operate, Read, or Experience mode.`);
    }
    for (const key of ['audience', 'job', 'primary_action', 'art_direction_thesis']) {
      if (!String(surface.brief?.[key] || '').trim()) {
        throw new Error(`Surface ${id} brief.${key} is required.`);
      }
    }
    if (!Array.isArray(surface.authority) || surface.authority.length === 0 ||
        surface.authority.some((item) => !item.locator || !/^[a-f0-9]{64}$/.test(String(item.sha256 || '')))) {
      throw new Error(`Surface ${id} needs at least one hash-bound visual authority source.`);
    }
    if (!['local_only', 'mapped_existing_site'].includes(surface.deployment?.state)) {
      throw new Error(`Surface ${id} deployment state must be local_only or mapped_existing_site.`);
    }
    if (surface.deployment?.authorized !== false) {
      throw new Error(`Surface ${id} must enter the design loop with deployment authorization closed.`);
    }
  }
  return sources;
}

function assertSafeWebDesignOutput(candidate, repoRoot = REPO_ROOT) {
  const absolute = path.resolve(candidate);
  const root = path.resolve(repoRoot);
  const relative = normalizePath(path.relative(root, absolute));
  if (relative === '..' || relative.startsWith('../') || path.isAbsolute(path.relative(root, absolute))) {
    throw new Error('Web-design loop output must remain inside the Dillon OS repository.');
  }
  if (!/^System\/outcome-graph\/web-design\/[a-z0-9]+(?:-[a-z0-9]+)*\/\d{4}-\d{2}-\d{2}(?:-[a-z0-9-]+)?$/i.test(relative)) {
    throw new Error(
      'Web-design loop output must use System/outcome-graph/web-design/<surface>/YYYY-MM-DD[-slug].'
    );
  }
  return absolute;
}

function normalizeDefect(value, fallbackId = 'unspecified-defect') {
  if (typeof value === 'string') {
    return {
      id: safeSlug(value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || fallbackId),
      gate_id: 'independent-craft',
      severity: 'major',
      summary: value,
      repair_instruction: value,
      regression_test: 'Re-run the affected gate.',
      learning_target: 'qa_rule',
    };
  }
  const id = safeSlug(
    String(value?.id || fallbackId).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    'defect id'
  );
  return {
    id,
    gate_id: REQUIRED_GATES.includes(value?.gate_id) ? value.gate_id : 'independent-craft',
    severity: ['blocker', 'major', 'minor'].includes(value?.severity) ? value.severity : 'major',
    summary: String(value?.summary || id),
    repair_instruction: String(value?.repair_instruction || value?.summary || id),
    regression_test: String(value?.regression_test || 'Re-run the affected gate.'),
    learning_target: ['brief', 'token', 'component', 'content', 'motion', 'qa_rule'].includes(value?.learning_target)
      ? value.learning_target
      : 'qa_rule',
  };
}

function normalizeInspection(raw, options) {
  const evidenceRoot = path.resolve(options.evidenceRoot);
  const captures = (Array.isArray(raw?.captures) ? raw.captures : []).map((capture) => {
    const file = insideRoot(capture.file, evidenceRoot, 'Design evidence');
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
      throw new Error(`Design capture is missing: ${file}`);
    }
    return {
      viewport: String(capture.viewport || ''),
      width: Number(capture.width),
      height: Number(capture.height),
      ...fileEvidence(
        file,
        normalizePath(path.join(options.logicalEvidenceRoot, path.basename(file))),
        true
      ),
    };
  });
  const gateResults = (Array.isArray(raw?.gate_results) ? raw.gate_results : []).map((gate) => ({
    id: String(gate.id || ''),
    passed: gate.passed === true,
    detail: String(gate.detail || ''),
  }));
  const craftScores = Object.fromEntries(REQUIRED_CRAFT_DIMENSIONS.map((dimension) => [
    dimension,
    Number(raw?.craft?.scores?.[dimension]),
  ]));
  const findings = (Array.isArray(raw?.findings) ? raw.findings : []).map((finding, index) =>
    normalizeDefect(finding, `inspection-defect-${index + 1}`)
  );
  return {
    schema_version: 1,
    surface_id: options.surface.id,
    source_set_sha256: options.sourceSetSha256,
    build_manifest_sha256: options.buildManifestSha256,
    maker_id: options.makerId,
    reviewer_id: String(raw?.reviewer_id || ''),
    review_type: String(raw?.review_type || ''),
    production_eligible: raw?.production_eligible === true,
    gate_results: gateResults,
    captures,
    craft: {
      verdict: String(raw?.craft?.verdict || ''),
      summary: String(raw?.craft?.summary || ''),
      scores: craftScores,
    },
    findings,
    external_action_attempted: raw?.external_action_attempted === false ? false : null,
  };
}

function validateDesignInspection(report, surface) {
  const findings = [];
  if (!report.reviewer_id) {
    findings.push(normalizeDefect({ id: 'missing-reviewer', gate_id: 'independent-craft', summary: 'Independent reviewer identity is missing.' }));
  }
  if (report.reviewer_id && report.reviewer_id === report.maker_id) {
    findings.push(normalizeDefect({ id: 'self-review', gate_id: 'independent-craft', severity: 'blocker', summary: 'Maker and reviewer identities are the same.' }));
  }
  const gateIds = report.gate_results.map((gate) => gate.id);
  for (const gate of REQUIRED_GATES) {
    if (gateIds.filter((id) => id === gate).length !== 1) {
      findings.push(normalizeDefect({ id: `gate-${gate}-missing-or-duplicate`, gate_id: gate, severity: 'blocker', summary: `Gate ${gate} must appear exactly once.` }));
    }
  }
  for (const gate of report.gate_results) {
    if (!REQUIRED_GATES.includes(gate.id) || gate.passed !== true) {
      findings.push(normalizeDefect({ id: `gate-${gate.id || 'unknown'}-failed`, gate_id: gate.id, summary: gate.detail || `Gate ${gate.id || 'unknown'} did not pass.` }));
    }
  }
  for (const viewport of REQUIRED_VIEWPORTS) {
    if (!report.captures.some((capture) => capture.viewport === viewport &&
        Number.isFinite(capture.width) && capture.width > 0 &&
        Number.isFinite(capture.height) && capture.height > 0)) {
      findings.push(normalizeDefect({ id: `capture-${viewport}-missing`, gate_id: 'responsive', severity: 'blocker', summary: `A hashed ${viewport} capture is required.` }));
    }
  }
  const scores = Object.values(report.craft.scores);
  const average = scores.length > 0 && scores.every(Number.isFinite)
    ? scores.reduce((sum, score) => sum + score, 0) / scores.length
    : 0;
  for (const [dimension, score] of Object.entries(report.craft.scores)) {
    if (!Number.isFinite(score) || score < 4 || score > 5) {
      findings.push(normalizeDefect({ id: `craft-${dimension}-below-floor`, gate_id: 'independent-craft', summary: `${dimension} must score at least 4 of 5.` }));
    }
  }
  if (average < 4.2 || report.craft.verdict !== 'pass' || !report.craft.summary) {
    findings.push(normalizeDefect({ id: 'craft-verdict-below-floor', gate_id: 'independent-craft', summary: 'Independent craft review must pass with a 4.2 average and a written rationale.' }));
  }
  if (surface.production_intent === true &&
      (!PRODUCTION_REVIEW_TYPES.includes(report.review_type) || !report.production_eligible)) {
    findings.push(normalizeDefect({ id: 'production-review-ineligible', gate_id: 'independent-craft', severity: 'blocker', summary: 'A production-intent surface requires an independent agent or human review marked production eligible.' }));
  }
  if (report.external_action_attempted !== false) {
    findings.push(normalizeDefect({ id: 'external-action-boundary-unattested', gate_id: 'authority', severity: 'blocker', summary: 'The inspection must attest that no external action was attempted.' }));
  }
  for (const finding of report.findings) findings.push(finding);
  const unique = [...new Map(findings.map((finding) => [finding.id, finding])).values()];
  return {
    passed: unique.length === 0,
    findings: unique,
    craft_average: Math.round(average * 100) / 100,
  };
}

function sanitizeInspection(report, capturePathMap = new Map()) {
  return {
    ...report,
    captures: report.captures.map(({ resume_locator: resumeLocator, ...capture }) => ({
      ...capture,
      path: capturePathMap.get(resumeLocator) || capture.path,
    })),
  };
}

function copyDirectory(source, destination) {
  fs.mkdirSync(destination, { recursive: true });
  for (const file of walkFiles(source)) {
    const target = path.join(destination, path.relative(source, file));
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(file, target);
  }
}

function createWebDesignHarness(options) {
  const outputDir = path.resolve(options.outputDir);
  const logicalRoot = normalizePath(options.logicalRoot);
  const workspaceRoot = path.resolve(options.workspaceRoot);
  const collectSources = options.collectSources;
  const makeSurface = options.makeSurface;
  const inspectSurface = options.inspectSurface;
  const terminalInspectSurface = options.terminalInspectSurface || options.inspectSurface;
  const maxRepairPasses = Number.isInteger(options.maxRepairPasses) ? options.maxRepairPasses : 2;
  const maxWorkerAttempts = maxRepairPasses + 1;
  const correctionsFile = path.join(workspaceRoot, 'corrections.jsonl');
  let verifiedStagingRoot = null;
  let activeSourceSet = null;

  if (typeof collectSources !== 'function' || typeof makeSurface !== 'function' ||
      typeof inspectSurface !== 'function' || typeof terminalInspectSurface !== 'function') {
    throw new Error('Web-design loop requires collectSources, makeSurface, inspectSurface, and terminal inspection callbacks.');
  }

  const contract = {
    schema_version: 1,
    graph_id: options.graphId || 'web-design-closed-loop',
    objective: options.objective || 'Produce source-bound, high-craft web candidates through a bounded build, visual critique, repair, and independent terminal verification loop.',
    value_signal: options.valueSignal || 'A website is ready only when its real rendered surface, not merely its build command, passes the full craft and engineering finish line.',
    constraints: [
      'Bind every surface to explicit product truth, a resolved mode, a complete brief, and hash-bound visual authority.',
      'Work only in an isolated local candidate root and preserve the source project unchanged until a separate adoption decision.',
      'Feed exact checker defects into the next maker attempt and stop after the bounded repair limit.',
      'Require desktop and mobile captures, deterministic engineering gates, and an independent craft review.',
      'Do not deploy, publish, send, spend, write the canonical queue, change accounts, or claim production readiness from synthetic review.',
    ],
    upstream_artifacts: options.upstreamArtifacts || ['PRODUCT.md', 'DESIGN.md', 'surface brief', 'visual authority', 'current implementation'],
    scope: {
      root: options.scopeRoot || 'isolated local web-design candidates',
      isolation_key: 'surface_id',
      data_class: 'internal-design-evidence',
    },
    source_freshness: {
      checked_at: options.checkedAt,
      max_age_seconds: Number(options.maxAgeSeconds || 3600),
      evidence: 'Product, design, brief, authority, and implementation sources are hash-bound before planning and recollected at terminal verification.',
    },
    finish_line: {
      predicate: 'Every isolated surface preserves its source authority, resolves every recorded defect within the repair budget, passes all ten engineering and craft gates, reproduces from final candidate hashes, and remains local pending separate adoption or deployment authority.',
      required_artifacts: FINAL_NAMES.map((name) => normalizePath(path.join(logicalRoot, name))),
    },
    stopping: {
      max_graph_iterations: 1,
      max_worker_attempts: maxWorkerAttempts,
      timeout_seconds: Number(options.timeoutSeconds || 900),
      max_parallel: Number(options.maxParallel || 2),
      budget_units: Number(options.budgetUnits || 128),
    },
    adapters: {
      planner: 'web-design-planner',
      maker: 'web-design-maker',
      checker: 'web-design-independent-checker',
      reducer: 'web-design-reducer',
      terminal_verifier: 'web-design-terminal-verifier',
      learner: 'web-design-learner',
    },
    approval: {
      external_actions: false,
      required_before: ['adopt', 'deploy'],
    },
    governance: {
      orchestrator: 'Codex acting as Marketing Chief',
      canonical_state: options.canonicalState || 'The named project, product truth, design truth, authority sources, mapped deployment state, and Marketing Chief queue remain canonical.',
      dedupe_key: options.dedupeKey || `web-design:${options.cadenceBucket}`,
      checkpoint: normalizePath(path.join(logicalRoot, 'web-design-loop-receipt.json')),
      rollback: 'Discard the isolated candidate and evidence directory; preserve the source project, mapped site, queue, and external systems unchanged.',
      escalation: 'Return the exact unresolved craft or engineering defect, missing authority, source drift, exhausted repair budget, or approval boundary to Marketing Chief.',
      allowed_actions: ['read_sources', 'write_isolated_candidate', 'capture_local_render', 'run_local_qa', 'record_review', 'propose_learning'],
      forbidden_actions: ['canonical_queue_write', 'edit_source_project', 'send', 'post', 'publish', 'deploy', 'spend', 'account_change', 'provider_mutation', 'secret_access'],
    },
    learning: {
      fingerprint_inputs: ['source-manifest', 'surface-brief', 'visual-authority', 'defect-ledger', 'candidate-manifest', 'terminal-assertions'],
      corrections_ledger: normalizePath(path.join(logicalRoot, 'corrections.jsonl')),
    },
  };

  async function collectChecked() {
    return assertDesignSourcePacket(await collectSources());
  }

  function makerReceiptPathFromWorker(worker) {
    const artifact = worker.final_artifacts?.[0];
    if (!artifact?.resume_locator || !fs.existsSync(artifact.resume_locator)) {
      throw new Error(`Verified design worker ${worker.item_id} has no readable maker receipt.`);
    }
    return artifact.resume_locator;
  }

  const adapters = {
    'web-design-planner': async ({ previous_terminal_findings: previousTerminalFindings }) => {
      const sources = await collectChecked();
      activeSourceSet = sources.source_set_sha256;
      const items = sources.surfaces.map((surface) => ({
        id: `surface:${surface.id}`,
        isolation_key: `web-design:${surface.id}`,
        task: `Build and independently verify ${surface.id}`,
        surface,
        source_set_sha256: sources.source_set_sha256,
        input_fingerprint: sha256(stableJson({
          surface,
          source_set_sha256: sources.source_set_sha256,
          previous_terminal_findings: previousTerminalFindings,
        })),
      }));
      return {
        evidence: `Bound ${items.length} web surface(s) to product, brief, authority, and implementation source hashes.`,
        items,
        sources,
        source_set_sha256: sources.source_set_sha256,
      };
    },

    'web-design-maker': async ({ item, graph_attempt: graphAttempt, attempt, previous_findings: previousFindings }) => {
      const surfaceId = safeSlug(item.surface.id, 'surface id');
      const attemptRoot = insideRoot(
        path.join(workspaceRoot, 'attempts', surfaceId, `g${graphAttempt}-a${attempt}`),
        workspaceRoot,
        'Design attempt'
      );
      if (fs.existsSync(attemptRoot)) fs.rmSync(attemptRoot, { recursive: true, force: true });
      fs.mkdirSync(attemptRoot, { recursive: true });
      const result = await makeSurface({
        surface: structuredClone(item.surface),
        source_set_sha256: item.source_set_sha256,
        attempt,
        max_attempts: maxWorkerAttempts,
        previous_findings: structuredClone(previousFindings || []),
        attempt_root: attemptRoot,
      });
      const buildRoot = insideRoot(result?.build_root, attemptRoot, 'Maker build root');
      if (!fs.existsSync(buildRoot) || !fs.statSync(buildRoot).isDirectory()) {
        throw new Error(`Maker did not produce a build directory for ${surfaceId}.`);
      }
      const makerId = String(result?.maker_id || '').trim();
      if (!makerId) throw new Error(`Maker identity is missing for ${surfaceId}.`);
      const buildManifest = directoryManifest(buildRoot, `candidate://${surfaceId}`);
      if (buildManifest.length === 0) throw new Error(`Maker produced an empty candidate for ${surfaceId}.`);
      const receipt = {
        schema_version: 1,
        surface_id: surfaceId,
        source_set_sha256: item.source_set_sha256,
        graph_attempt: graphAttempt,
        attempt,
        maker_id: makerId,
        previous_finding_ids: (previousFindings || []).map((finding) => normalizeDefect(finding).id),
        attempt_root: attemptRoot,
        build_root: buildRoot,
        build_manifest: buildManifest,
        build_manifest_sha256: manifestFingerprint(buildManifest),
        implementation_summary: String(result?.implementation_summary || ''),
        external_action_attempted: false,
        source_project_mutated: false,
      };
      const receiptFile = path.join(attemptRoot, 'maker-receipt.json');
      writeJsonAtomic(receiptFile, receipt);
      return {
        evidence: `Produced isolated ${surfaceId} candidate attempt ${attempt} from ${previousFindings.length} checker finding(s).`,
        isolation_id: `${item.isolation_key}:g${graphAttempt}:a${attempt}`,
        build_root: buildRoot,
        attempt_root: attemptRoot,
        maker_id: makerId,
        artifacts: [fileEvidence(receiptFile, `workspace://${surfaceId}/g${graphAttempt}-a${attempt}/maker-receipt.json`, true)],
      };
    },

    'web-design-independent-checker': async ({ item, attempt, maker_result: makerResult }) => {
      const makerReceipt = readJson(makerResult.artifacts[0].resume_locator);
      const evidenceRoot = path.join(makerReceipt.attempt_root, 'checker-evidence');
      fs.mkdirSync(evidenceRoot, { recursive: true });
      const raw = await inspectSurface({
        phase: 'checker',
        surface: structuredClone(item.surface),
        build_root: makerReceipt.build_root,
        evidence_root: evidenceRoot,
        maker_id: makerReceipt.maker_id,
        attempt,
      });
      const report = normalizeInspection(raw, {
        surface: item.surface,
        sourceSetSha256: item.source_set_sha256,
        buildManifestSha256: makerReceipt.build_manifest_sha256,
        makerId: makerReceipt.maker_id,
        evidenceRoot,
        logicalEvidenceRoot: `checker://${item.surface.id}/attempt-${attempt}`,
      });
      const validation = validateDesignInspection(report, item.surface);
      const checkedReport = {
        ...report,
        passed: validation.passed,
        craft_average: validation.craft_average,
        findings: validation.findings,
      };
      writeJsonAtomic(path.join(makerReceipt.attempt_root, 'checker-report.json'), checkedReport);
      return {
        evidence: `Independently inspected rendered ${item.surface.id} attempt ${attempt} across all required gates.`,
        passed: validation.passed,
        findings: validation.findings,
      };
    },

    'web-design-reducer': async ({ plan, worker_results: workers }) => {
      const stagingRoot = path.join(workspaceRoot, 'staged');
      if (fs.existsSync(stagingRoot)) fs.rmSync(stagingRoot, { recursive: true, force: true });
      fs.mkdirSync(stagingRoot, { recursive: true });
      const surfaceReceipts = [];
      const finalManifests = [];
      const defectHistory = [];

      for (const worker of workers) {
        const makerReceipt = readJson(makerReceiptPathFromWorker(worker));
        const checkerReport = readJson(path.join(makerReceipt.attempt_root, 'checker-report.json'));
        const surface = plan.sources.surfaces.find((candidate) => candidate.id === makerReceipt.surface_id);
        if (!surface) throw new Error(`Reducer could not bind surface ${makerReceipt.surface_id}.`);
        const validation = validateDesignInspection(checkerReport, surface);
        if (!validation.passed || checkerReport.passed !== true) {
          throw new Error(`Reducer received an unverified checker report for ${surface.id}.`);
        }

        const candidateRoot = path.join(stagingRoot, 'candidates', surface.id);
        copyDirectory(makerReceipt.build_root, candidateRoot);
        const candidateLogicalRoot = normalizePath(path.join(logicalRoot, 'candidates', surface.id));
        const candidateManifest = directoryManifest(candidateRoot, candidateLogicalRoot);
        const evidencePathMap = new Map();
        for (const capture of checkerReport.captures) {
          const extension = path.extname(capture.resume_locator) || '.bin';
          const name = `${capture.viewport}-${capture.sha256.slice(0, 12)}${extension}`;
          const destination = path.join(stagingRoot, 'evidence', surface.id, name);
          fs.mkdirSync(path.dirname(destination), { recursive: true });
          fs.copyFileSync(capture.resume_locator, destination);
          evidencePathMap.set(
            capture.resume_locator,
            normalizePath(path.join(logicalRoot, 'evidence', surface.id, name))
          );
        }
        const sanitizedInspection = sanitizeInspection(checkerReport, evidencePathMap);
        const productionReview = PRODUCTION_REVIEW_TYPES.includes(sanitizedInspection.review_type) &&
          sanitizedInspection.production_eligible;
        surfaceReceipts.push({
          surface_id: surface.id,
          mode: surface.mode,
          production_intent: surface.production_intent === true,
          state: surface.production_intent === true && productionReview
            ? 'verified_production_candidate'
            : 'verified_nonproduction_candidate',
          repair_cycles: worker.attempts.length - 1,
          maker_id: makerReceipt.maker_id,
          checker: sanitizedInspection,
          candidate_manifest_sha256: manifestFingerprint(candidateManifest),
          deployment: {
            source_state: surface.deployment.state,
            attempted: false,
            authorized: false,
          },
        });
        finalManifests.push({
          surface_id: surface.id,
          root: candidateLogicalRoot,
          manifest_sha256: manifestFingerprint(candidateManifest),
          files: candidateManifest,
        });
        defectHistory.push({
          surface_id: surface.id,
          attempts: worker.attempts.map((attemptRecord, index) => ({
            attempt: attemptRecord.attempt,
            passed: attemptRecord.passed,
            findings: attemptRecord.findings.map((finding) => ({
              ...normalizeDefect(finding),
              state: attemptRecord.passed ? 'none' :
                (index === worker.attempts.length - 1 ? 'open' : 'resolved_by_later_attempt'),
            })),
          })),
        });
      }

      const productionReady = surfaceReceipts.every((surface) =>
        surface.production_intent && surface.state === 'verified_production_candidate'
      );
      const receipt = {
        schema_version: 1,
        generated_at: plan.sources.captured_at,
        source_set_sha256: plan.sources.source_set_sha256,
        state: productionReady ? 'verified_production_candidate' : 'verified_nonproduction_candidate',
        production_ready: productionReady,
        graph_ready: true,
        surfaces: surfaceReceipts,
        repair_budget: {
          max_repair_passes: maxRepairPasses,
          used_repair_passes: surfaceReceipts.reduce((sum, surface) => sum + surface.repair_cycles, 0),
        },
        approval: {
          adoption_required: true,
          deployment_required: true,
          granted: false,
        },
        authority: {
          external_action_attempted: false,
          canonical_write_attempted: false,
          source_project_mutated: false,
          deployment_attempted: false,
        },
      };
      const learningCounts = {};
      for (const surface of defectHistory) {
        for (const attempt of surface.attempts) {
          for (const finding of attempt.findings) {
            if (finding.state !== 'resolved_by_later_attempt') continue;
            learningCounts[finding.learning_target] = (learningCounts[finding.learning_target] || 0) + 1;
          }
        }
      }
      const learning = {
        schema_version: 1,
        generated_at: plan.sources.captured_at,
        source_set_sha256: plan.sources.source_set_sha256,
        state: 'proposal_only',
        proposed_updates: Object.entries(learningCounts).map(([layer, resolved_defects]) => ({
          layer,
          resolved_defects,
          action: `Review recurring ${layer} defects before changing the canonical ${layer} system.`,
        })),
        applied: false,
        authority: {
          external_action_attempted: false,
          canonical_write_attempted: false,
        },
      };
      writeJsonAtomic(path.join(stagingRoot, FINAL_NAMES[0]), receipt);
      writeJsonAtomic(path.join(stagingRoot, FINAL_NAMES[1]), {
        schema_version: 1,
        generated_at: plan.sources.captured_at,
        source_set_sha256: plan.sources.source_set_sha256,
        surfaces: defectHistory,
        open_defects: 0,
        authority: { external_action_attempted: false, canonical_write_attempted: false },
      });
      writeJsonAtomic(path.join(stagingRoot, FINAL_NAMES[2]), {
        schema_version: 1,
        generated_at: plan.sources.captured_at,
        source_set_sha256: plan.sources.source_set_sha256,
        surfaces: finalManifests,
        authority: { external_action_attempted: false, canonical_write_attempted: false },
      });
      writeJsonAtomic(path.join(stagingRoot, FINAL_NAMES[3]), learning);
      verifiedStagingRoot = stagingRoot;
      return {
        evidence: `Reduced ${surfaceReceipts.length} independently checked surface(s), their repair histories, captures, and final candidate manifests.`,
        artifacts: directoryManifest(stagingRoot, logicalRoot),
        staging_root: stagingRoot,
      };
    },

    'web-design-terminal-verifier': async ({ plan, reduction }) => {
      const fresh = await collectChecked();
      const receipt = readJson(path.join(reduction.staging_root, FINAL_NAMES[0]));
      const finalManifest = readJson(path.join(reduction.staging_root, FINAL_NAMES[2]));
      const terminalReports = [];
      for (const surfaceReceipt of receipt.surfaces) {
        const surface = fresh.surfaces.find((candidate) => candidate.id === surfaceReceipt.surface_id);
        const buildRoot = path.join(reduction.staging_root, 'candidates', surfaceReceipt.surface_id);
        const evidenceRoot = path.join(workspaceRoot, 'terminal-evidence', surfaceReceipt.surface_id);
        if (fs.existsSync(evidenceRoot)) fs.rmSync(evidenceRoot, { recursive: true, force: true });
        fs.mkdirSync(evidenceRoot, { recursive: true });
        const candidateManifest = directoryManifest(
          buildRoot,
          normalizePath(path.join(logicalRoot, 'candidates', surfaceReceipt.surface_id))
        );
        const raw = await terminalInspectSurface({
          phase: 'terminal',
          surface: structuredClone(surface),
          build_root: buildRoot,
          evidence_root: evidenceRoot,
          maker_id: surfaceReceipt.maker_id,
          attempt: surfaceReceipt.repair_cycles + 1,
        });
        const report = normalizeInspection(raw, {
          surface,
          sourceSetSha256: fresh.source_set_sha256,
          buildManifestSha256: manifestFingerprint(candidateManifest),
          makerId: surfaceReceipt.maker_id,
          evidenceRoot,
          logicalEvidenceRoot: `terminal://${surface.id}`,
        });
        terminalReports.push({
          surface_id: surface.id,
          report,
          validation: validateDesignInspection(report, surface),
          candidate_manifest_sha256: manifestFingerprint(candidateManifest),
        });
      }
      const declaredBySurface = new Map(finalManifest.surfaces.map((surface) => [surface.surface_id, surface]));
      const assertions = [
        {
          id: 'source-manifest-stable',
          passed: fresh.source_set_sha256 === plan.source_set_sha256,
          detail: 'Product, design, brief, visual authority, and implementation sources remained hash-stable.',
        },
        {
          id: 'every-surface-reinspected',
          passed: terminalReports.length === fresh.surfaces.length &&
            new Set(terminalReports.map((report) => report.surface_id)).size === fresh.surfaces.length,
          detail: 'Every isolated surface received one terminal reinspection.',
        },
        {
          id: 'all-engineering-and-craft-gates-pass',
          passed: terminalReports.every((report) => report.validation.passed),
          detail: 'Every terminal render passed all ten gates, desktop and mobile evidence, and the craft floor.',
        },
        {
          id: 'final-candidate-manifests-reproduce',
          passed: terminalReports.every((report) =>
            declaredBySurface.get(report.surface_id)?.manifest_sha256 === report.candidate_manifest_sha256
          ),
          detail: 'Every final candidate exactly matches its declared SHA-256 manifest.',
        },
        {
          id: 'repair-ledger-is-closed',
          passed: readJson(path.join(reduction.staging_root, FINAL_NAMES[1])).open_defects === 0,
          detail: 'No unresolved checker defect remains after the bounded repair loop.',
        },
        {
          id: 'approval-and-external-action-boundary-held',
          passed: receipt.approval.granted === false &&
            receipt.authority.external_action_attempted === false &&
            receipt.authority.canonical_write_attempted === false &&
            receipt.authority.source_project_mutated === false &&
            receipt.authority.deployment_attempted === false,
          detail: 'The verified candidate remains local and unadopted; deployment and canonical writes stay closed.',
        },
      ];
      return {
        evidence: 'Recollected all authorities, re-rendered every final candidate, replayed the full gate set, and verified final files, repair closure, and approval boundaries.',
        passed: assertions.every((assertion) => assertion.passed),
        assertions,
        artifact_manifest: directoryManifest(reduction.staging_root, logicalRoot),
      };
    },

    'web-design-learner': async ({ outcome, graph_attempt: graphAttempt, terminal_verification: terminal, worker_results: workers }) => {
      const terminalAssertions = Array.isArray(terminal?.assertions) ? terminal.assertions : [];
      const workerFindings = Array.isArray(workers)
        ? workers.flatMap((worker) => worker.attempts?.flatMap((attempt) => attempt.findings || []) || [])
        : [];
      const correction = outcome === 'terminal_true'
        ? 'Preserve the closed-loop sequence: source authority, isolated implementation, rendered critique, bounded repair, terminal replay, then separate adoption and deployment authority.'
        : 'Repair only the exact unresolved design defect, source drift, manifest mismatch, or authority assertion; never promote an unrendered or self-reviewed build.';
      const entry = {
        schema_version: 1,
        graph_id: contract.graph_id,
        graph_attempt: graphAttempt,
        recorded_at: new Date().toISOString(),
        source_set_sha256: activeSourceSet,
        outcome,
        terminal_assertions: terminalAssertions.map((assertion) => ({ id: assertion.id, passed: assertion.passed })),
        worker_finding_ids: workerFindings.map((finding) => normalizeDefect(finding).id),
        correction,
      };
      const serialized = JSON.stringify(entry) + '\n';
      fs.mkdirSync(path.dirname(correctionsFile), { recursive: true });
      fs.appendFileSync(correctionsFile, serialized, 'utf8');
      return {
        evidence: 'Appended one hashed web-design correction entry without changing canonical design truth.',
        corrections: [correction],
        ledger_receipt: {
          locator: contract.learning.corrections_ledger,
          entry_sha256: sha256(serialized),
        },
      };
    },
  };

  return {
    contract,
    adapters,
    workspaceRoot,
    commitVerifiedArtifacts() {
      if (!verifiedStagingRoot) throw new Error('No terminal-verified web-design candidate is staged.');
      fs.mkdirSync(outputDir, { recursive: true });
      copyDirectory(verifiedStagingRoot, outputDir);
      if (fs.existsSync(correctionsFile)) {
        fs.copyFileSync(correctionsFile, path.join(outputDir, 'corrections.jsonl'));
      }
    },
    cleanup() {
      fs.rmSync(workspaceRoot, { recursive: true, force: true });
    },
  };
}

function verifyResumedDesignWorker({ item, worker_result: workerResult }) {
  if (workerResult?.status !== 'verified' || workerResult?.item_id !== item.id ||
      workerResult?.input_fingerprint !== item.input_fingerprint) return false;
  const artifact = workerResult.final_artifacts?.[0];
  if (!artifact?.resume_locator || !fs.existsSync(artifact.resume_locator)) return false;
  const bytes = fs.readFileSync(artifact.resume_locator);
  if (sha256(bytes) !== artifact.sha256 || bytes.length !== artifact.bytes) return false;
  const receipt = JSON.parse(bytes.toString('utf8'));
  if (!fs.existsSync(receipt.build_root) || !fs.existsSync(path.join(receipt.attempt_root, 'checker-report.json'))) {
    return false;
  }
  const currentManifest = directoryManifest(receipt.build_root, `candidate://${receipt.surface_id}`);
  const checker = readJson(path.join(receipt.attempt_root, 'checker-report.json'));
  return manifestFingerprint(currentManifest) === receipt.build_manifest_sha256 &&
    checker.passed === true && checker.captures.every((capture) =>
      capture.resume_locator && fs.existsSync(capture.resume_locator) &&
      fileEvidence(capture.resume_locator, capture.path).sha256 === capture.sha256
    );
}

function verifyCompletedDesign(result, outputDir, logicalRoot) {
  const manifest = result.terminal_evidence?.artifact_manifest;
  if (!Array.isArray(manifest) || manifest.length < FINAL_NAMES.length) return false;
  const prefix = normalizePath(logicalRoot).replace(/\/$/, '') + '/';
  for (const artifact of manifest) {
    const locator = normalizePath(artifact.path);
    if (!locator.startsWith(prefix)) return false;
    const relative = locator.slice(prefix.length);
    const file = insideRoot(path.join(outputDir, relative), outputDir, 'Completed design artifact');
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) return false;
    const bytes = fs.readFileSync(file);
    if (sha256(bytes) !== artifact.sha256 || bytes.length !== artifact.bytes) return false;
  }
  const receipt = readJson(path.join(outputDir, FINAL_NAMES[0]));
  return receipt.graph_ready === true && receipt.approval.granted === false &&
    receipt.authority.external_action_attempted === false &&
    receipt.authority.deployment_attempted === false;
}

async function runWebDesignLoopDurable(options = {}) {
  const repoRoot = path.resolve(options.repoRoot || REPO_ROOT);
  const outputDir = options.safeOutput === false
    ? path.resolve(options.outputDir)
    : assertSafeWebDesignOutput(options.outputDir, repoRoot);
  const logicalRoot = options.logicalRoot || normalizePath(path.relative(repoRoot, outputDir));
  const stateRoot = path.resolve(options.stateRoot || path.join(
    repoRoot,
    '12_Brain',
    'state',
    'outcome-graph'
  ));
  const collectSources = options.collectSources;
  const initialSources = assertDesignSourcePacket(await collectSources());
  const workspaceRoot = options.workspaceRoot || path.join(
    stateRoot,
    'workspaces',
    `web-design-${sha256(logicalRoot).slice(0, 20)}`
  );
  const harness = createWebDesignHarness({
    ...options,
    outputDir,
    logicalRoot,
    workspaceRoot,
    checkedAt: initialSources.captured_at,
  });
  const readCanonicalBinding = async () => {
    const sources = assertDesignSourcePacket(await collectSources());
    return {
      locator: `dillon-os://web-design/${options.cadenceBucket}`,
      version: String(sources.binding_version || options.cadenceBucket),
      sha256: sources.source_set_sha256,
      captured_at: sources.captured_at,
    };
  };
  let settled = false;
  try {
    const result = await runDurableOutcomeGraph(harness.contract, {
      stateRoot,
      adapters: harness.adapters,
      readCanonicalBinding,
      verifyResumedWorker: verifyResumedDesignWorker,
      verifyCompletedResult: (prior) => verifyCompletedDesign(prior, outputDir, logicalRoot),
      onCheckpoint: options.onCheckpoint,
      beforeFinalBindingCheck: async (provisional, context) => {
        harness.commitVerifiedArtifacts();
        if (typeof options.beforeFinalBindingCheck === 'function') {
          await options.beforeFinalBindingCheck(provisional, context);
        }
      },
      now: options.now,
      leaseSeconds: options.leaseSeconds,
    });
    settled = true;
    return result;
  } finally {
    if (settled || options.cleanupInterruptedWorkspace === true) harness.cleanup();
  }
}

module.exports = {
  FINAL_NAMES,
  PRODUCTION_REVIEW_TYPES,
  REQUIRED_CRAFT_DIMENSIONS,
  REQUIRED_GATES,
  REQUIRED_VIEWPORTS,
  SURFACE_MODES,
  assertDesignSourcePacket,
  assertSafeWebDesignOutput,
  createWebDesignHarness,
  directoryManifest,
  manifestFingerprint,
  normalizeInspection,
  runWebDesignLoopDurable,
  validateDesignInspection,
  verifyCompletedDesign,
  verifyResumedDesignWorker,
};
