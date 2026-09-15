'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { sha256 } = require('./outcome-graph');

function parseJsonl(text) {
  const rows = [];
  const errors = [];
  for (const [index, line] of String(text || '').split(/\r?\n/).entries()) {
    if (!line.trim()) continue;
    try {
      rows.push(JSON.parse(line));
    } catch (error) {
      errors.push({ line: index + 1, error: error.message });
    }
  }
  return { rows, errors };
}

function normalize(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\.\/+/, '');
}

function executableRoutine(routine) {
  return routine?.claude_may_execute === true && routine?.claude_role !== 'never';
}

function routineContractGaps(routine) {
  const gaps = [];
  if (!String(routine?.objective || routine?.goal || '').trim()) gaps.push('objective');
  if (!String(routine?.terminal_predicate || routine?.finish_line?.predicate || '').trim()) {
    gaps.push('terminal_predicate');
  }
  if (!Array.isArray(routine?.artifact_paths) || routine.artifact_paths.length === 0) {
    gaps.push('required_artifact_paths');
  }
  if (!routine?.executable_verifier && !routine?.terminal_verifier) {
    gaps.push('executable_terminal_verifier');
  }
  if (!routine?.stopping_condition && !routine?.stopping) gaps.push('stopping_condition');
  return gaps;
}

function receiptRisk(receipt, routine) {
  if (receipt?.outcome !== 'complete') return null;
  const artifactPaths = Array.isArray(receipt?.receipt?.artifact_paths)
    ? receipt.receipt.artifact_paths.map(normalize)
    : [];
  const loopLog = artifactPaths.filter((item) =>
    /^12_Brain\/queue\/claude-loop-\d{4}-\d{2}-\d{2}\.jsonl$/.test(item)
  );
  const checkpoint = normalize(routine?.checkpoint_resume);
  const plumbingOnly = artifactPaths.length > 0 && artifactPaths.every((item) =>
    loopLog.includes(item) || (checkpoint && item === checkpoint)
  );
  const checks = String(receipt?.receipt?.checks || '');
  const structuralOnly = receipt?.independent_verified === true &&
    /gates?\s+\d+\/\d+/i.test(checks) &&
    /stages?\s+(?:ok\s+)?\d+\/\d+/i.test(checks) &&
    !/(artifact|sha256|recomput|assertion|acceptance|test result)/i.test(checks);
  const missingArtifactEvidence = artifactPaths.length === 0;
  const risks = [];
  if (plumbingOnly) risks.push('only_loop_log_and_checkpoint_evidenced');
  if (structuralOnly) risks.push('independent_verification_is_structural_only');
  if (missingArtifactEvidence) risks.push('no_artifact_paths_evidenced');
  if (risks.length === 0) return null;
  return {
    run_id: receipt.run_id || null,
    routine_id: receipt.routine_id || null,
    declared_artifact: routine?.artifact || null,
    declared_value_signal: routine?.value_signal || null,
    evidenced_paths: artifactPaths,
    checks,
    risks,
  };
}

function auditLegacy({ registry, receipts, registryPath = null, receiptPath = null, auditedAt = null }) {
  const routines = Array.isArray(registry?.routines) ? registry.routines : [];
  const executable = routines.filter(executableRoutine);
  const byId = new Map(routines.map((routine) => [routine.routine_id, routine]));
  const routineFindings = executable.map((routine) => ({
    routine_id: routine.routine_id,
    name: routine.name,
    cadence: routine.cadence,
    declared_artifact: routine.artifact,
    declared_value_signal: routine.value_signal,
    gaps: routineContractGaps(routine),
  }));
  const receiptFindings = receipts
    .map((receipt) => receiptRisk(receipt, byId.get(receipt.routine_id)))
    .filter(Boolean);
  const gapCounts = {};
  for (const finding of routineFindings) {
    for (const gap of finding.gaps) gapCounts[gap] = (gapCounts[gap] || 0) + 1;
  }
  const riskCounts = {};
  for (const finding of receiptFindings) {
    for (const risk of finding.risks) riskCounts[risk] = (riskCounts[risk] || 0) + 1;
  }
  const highRisk = routineFindings.some((finding) => finding.gaps.length > 0) ||
    receiptFindings.length > 0;
  return {
    schema_version: 1,
    audited_at: auditedAt || new Date().toISOString(),
    sources: {
      registry_path: registryPath,
      registry_sha256: sha256(JSON.stringify(registry)),
      receipt_path: receiptPath,
      receipt_sha256: sha256(JSON.stringify(receipts)),
    },
    counts: {
      routines_total: routines.length,
      routines_executable: executable.length,
      receipts_total: receipts.length,
      receipts_complete: receipts.filter((receipt) => receipt?.outcome === 'complete').length,
      receipts_with_false_completion_risk: receiptFindings.length,
    },
    contract_gap_counts: gapCounts,
    receipt_risk_counts: riskCounts,
    verdict: highRisk ? 'migration_required' : 'outcome_contract_present',
    finding: highRisk
      ? 'The legacy loop can prove that orchestration ran without proving the declared outcome.'
      : 'No structural false-completion risk was detected in the supplied snapshot.',
    executable_routine_findings: routineFindings,
    receipt_findings: receiptFindings,
  };
}

function auditFiles(registryFile, receiptFile, auditedAt = null) {
  const registryText = fs.readFileSync(registryFile, 'utf8').replace(/^﻿/, '');
  const receiptText = fs.readFileSync(receiptFile, 'utf8').replace(/^﻿/, '');
  const parsed = parseJsonl(receiptText);
  if (parsed.errors.length > 0) {
    const first = parsed.errors[0];
    throw new Error('Invalid receipt JSONL at line ' + first.line + ': ' + first.error);
  }
  return auditLegacy({
    registry: JSON.parse(registryText),
    receipts: parsed.rows,
    registryPath: path.normalize(registryFile),
    receiptPath: path.normalize(receiptFile),
    auditedAt,
  });
}

module.exports = {
  parseJsonl,
  routineContractGaps,
  receiptRisk,
  auditLegacy,
  auditFiles,
};
