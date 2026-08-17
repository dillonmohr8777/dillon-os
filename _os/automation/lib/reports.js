'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const {
  repoPath,
  ensureDir,
  readJson,
  writeJson,
  nowISO,
  slugify,
} = require('./fsutil');
const { enqueue } = require('./registry');

const AUTOMATION_ID = 'report-brain-ingest';
const REPORT_STATE = repoPath('12_Brain/state/report-brain-ingest.json');
const CAPTURE_ROOT = repoPath('12_Brain/01_Captures/Reports');
const REVIEW_ROOT = repoPath('12_Brain/07_Reviews/Reports');
const DEFAULT_SOURCE_ROOTS = [
  'C:/Users/dillo/Documents/Codex/projects/client-operations/clients',
  repoPath('Daily-Briefs/reports'),
].map((value) => path.resolve(value));
const ALLOWED_EXTENSIONS = new Set(['.pdf', '.html', '.md']);
const ALLOWED_CADENCES = new Set(['weekly', 'monthly']);
const ALLOWED_VERIFICATION = new Set(['verified', 'partial', 'unverified', 'disputed']);

function cleanScalar(value, fallback = '') {
  return String(value ?? fallback).replace(/\r?\n/g, ' ').trim();
}

function yamlString(value) {
  return JSON.stringify(cleanScalar(value));
}

function yamlList(values) {
  const unique = [...new Set((values || []).filter(Boolean).map((value) => cleanScalar(value)))];
  if (!unique.length) return '[]';
  return `\n${unique.map((value) => `  - ${yamlString(value)}`).join('\n')}`;
}

function slash(value) {
  return String(value).replace(/\\/g, '/');
}

function isDateOnly(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ''));
}

function isWithin(root, target) {
  const relative = path.relative(path.resolve(root), path.resolve(target));
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

function sha256File(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function validateReportEnvelope(envelope) {
  const errors = [];
  if (!envelope || typeof envelope !== 'object' || Array.isArray(envelope)) {
    return { ok: false, errors: ['input must be a JSON object'] };
  }
  if (!cleanScalar(envelope.batch_id)) errors.push('batch_id is required');
  if (!cleanScalar(envelope.generated_at)) errors.push('generated_at is required');
  if (!Array.isArray(envelope.reports) || envelope.reports.length === 0) {
    errors.push('reports must be a non-empty array');
    return { ok: false, errors };
  }
  if (envelope.reports.length > 100) errors.push('reports may contain at most 100 items');

  const reportIds = new Set();
  envelope.reports.forEach((report, index) => {
    const prefix = `reports[${index}]`;
    if (!report || typeof report !== 'object' || Array.isArray(report)) {
      errors.push(`${prefix} must be an object`);
      return;
    }
    const reportId = cleanScalar(report.report_id);
    if (!reportId) errors.push(`${prefix}.report_id is required`);
    else if (reportIds.has(reportId)) errors.push(`${prefix}.report_id must be unique`);
    else reportIds.add(reportId);

    if (!ALLOWED_CADENCES.has(cleanScalar(report.cadence).toLowerCase())) {
      errors.push(`${prefix}.cadence must be weekly or monthly`);
    }
    if (!cleanScalar(report.title)) errors.push(`${prefix}.title is required`);
    if (!isDateOnly(report.period_start)) errors.push(`${prefix}.period_start must be YYYY-MM-DD`);
    if (!isDateOnly(report.period_end)) errors.push(`${prefix}.period_end must be YYYY-MM-DD`);
    if (isDateOnly(report.period_start) && isDateOnly(report.period_end) && report.period_end < report.period_start) {
      errors.push(`${prefix}.period_end must not precede period_start`);
    }

    if (!report.client || typeof report.client !== 'object') {
      errors.push(`${prefix}.client is required`);
    } else {
      if (!cleanScalar(report.client.id)) errors.push(`${prefix}.client.id is required`);
      if (!cleanScalar(report.client.name)) errors.push(`${prefix}.client.name is required`);
      const note = slash(cleanScalar(report.client.vault_note));
      if (!note || path.isAbsolute(note) || note.startsWith('../') || note.includes('/../') || !note.endsWith('.md')) {
        errors.push(`${prefix}.client.vault_note must be a safe vault-relative Markdown path`);
      }
    }

    const artifactPath = cleanScalar(report.artifact?.path);
    if (!artifactPath) errors.push(`${prefix}.artifact.path is required`);
    const extension = path.extname(artifactPath).toLowerCase();
    if (artifactPath && !ALLOWED_EXTENSIONS.has(extension)) {
      errors.push(`${prefix}.artifact.path must end in .pdf, .html, or .md`);
    }
    const verification = cleanScalar(report.verification_status || 'partial').toLowerCase();
    if (!ALLOWED_VERIFICATION.has(verification)) {
      errors.push(`${prefix}.verification_status is invalid`);
    }
  });

  return { ok: errors.length === 0, errors };
}

function getSourceRoots(options = {}) {
  const fromOptions = options.sourceRoots;
  const fromEnvironment = cleanScalar(process.env.DILLON_REPORT_SOURCE_ROOTS)
    .split(';')
    .filter(Boolean);
  return (fromOptions?.length ? fromOptions : fromEnvironment.length ? fromEnvironment : DEFAULT_SOURCE_ROOTS)
    .map((value) => path.resolve(value));
}

function resolveClientNote(relativePath) {
  const normalized = slash(relativePath).replace(/^\.\//, '');
  const full = repoPath(...normalized.split('/'));
  if (!isWithin(repoPath(), full)) throw new Error(`Client note escapes the vault: ${relativePath}`);
  if (!fs.existsSync(full)) throw new Error(`Client note does not exist: ${relativePath}`);
  return { full, relative: normalized };
}

function renderReportNote(record) {
  const clientLink = `[[${record.client_note.replace(/\.md$/, '')}|${record.client_name}]]`;
  const artifactLink = `[Open archived ${record.cadence} report](obsidian://open?vault=dillon-os&file=${encodeURIComponent(record.archived_artifact)})`;
  const sourceRefs = [
    `[[${record.client_note.replace(/\.md$/, '')}]]`,
    record.canonical_source,
    ...(record.source_refs || []),
  ];
  return `---
note_type: review
review_kind: ${record.cadence}_report
status: archived
created: ${record.ingested_on}
updated: ${record.ingested_on}
owner: Dillon Mohr
client_id: ${yamlString(record.client_id)}
client: ${yamlString(`[[${record.client_note.replace(/\.md$/, '')}]]`)}
period_start: ${record.period_start}
period_end: ${record.period_end}
generated_at: ${yamlString(record.generated_at)}
verification_status: ${record.verification_status}
delivery_status: ${yamlString(record.delivery_status)}
archived_artifact: ${yamlString(record.archived_artifact)}
artifact_sha256: ${record.artifact_sha256}
source_refs:${yamlList(sourceRefs)}
tags:
  - brain
  - review
  - reporting
  - ${record.cadence}
  - ${record.client_id}
---

# ${record.title}

> [!info] Obsidian brain archive
> The finalized report artifact is preserved in the vault with its canonical
> source path and SHA-256 integrity hash. The canonical business source remains
> in client operations.

## Brain connections

- [[12_Brain/00_Home|Brain Home]]
- [[12_Brain/07_Reviews/Reports/README|Report Archive]]
- [[12_Brain/03_Concepts/Client Reporting and Outcome Scoreboards|Client reporting and outcome scoreboards]]
- [[11_Agents/Reporting Agent|Reporting Agent]]
- ${clientLink}

## Report

- Artifact: ${artifactLink}
- Cadence: **${record.cadence}**
- Period: **${record.period_start} through ${record.period_end}**
- Canonical source: \`${record.canonical_source}\`
- Integrity: \`${record.artifact_sha256}\`

## Verification

- Source route was restricted to an approved reporting root.
- Client route resolved to an existing vault note.
- Archived artifact hash matches the canonical source hash.
- Verification status: **${record.verification_status}**

## Context

${record.summary || 'Review the archived report for the source-grounded narrative, metrics, uncertainty, and next actions.'}

## Delivery boundary

Archiving this report does not record or authorize email, Slack, publishing,
spend, account changes, or any other external delivery.
`;
}

function buildReportPlan(envelope, options = {}) {
  const validation = validateReportEnvelope(envelope);
  if (!validation.ok) throw new Error(`Invalid report envelope: ${validation.errors.join('; ')}`);

  const state = readJson(REPORT_STATE, { version: 1, processed: {} });
  const sourceRoots = getSourceRoots(options);
  return envelope.reports.map((report) => {
    const source = path.resolve(report.artifact.path);
    if (!fs.existsSync(source) || !fs.statSync(source).isFile()) {
      throw new Error(`Report artifact does not exist: ${source}`);
    }
    if (!sourceRoots.some((root) => isWithin(root, source))) {
      throw new Error(`Report artifact is outside approved source roots: ${source}`);
    }
    const clientNote = resolveClientNote(report.client.vault_note);
    const artifactHash = sha256File(source);
    const cadence = cleanScalar(report.cadence).toLowerCase();
    const key = crypto.createHash('sha256')
      .update(`${report.client.id}|${cadence}|${report.period_start}|${report.period_end}|${artifactHash}`)
      .digest('hex');
    const month = report.period_end.slice(0, 7);
    const archiveDir = path.join(CAPTURE_ROOT, month, slugify(report.client.id));
    const safeBase = `${slugify(report.report_id)}${path.extname(source).toLowerCase()}`;
    let archivedArtifact = path.join(archiveDir, safeBase);
    if (fs.existsSync(archivedArtifact) && sha256File(archivedArtifact) !== artifactHash) {
      archivedArtifact = path.join(archiveDir, `${slugify(report.report_id)}-${artifactHash.slice(0, 8)}${path.extname(source).toLowerCase()}`);
    }
    const reviewFile = path.join(
      REVIEW_ROOT,
      month,
      `${report.period_end} - ${slugify(report.client.id)} - ${cadence} - ${slugify(report.report_id)}.md`,
    );
    const prior = state.processed[key];
    const priorIntact = Boolean(
      prior
      && fs.existsSync(repoPath(...slash(prior.archived_artifact).split('/')))
      && fs.existsSync(repoPath(...slash(prior.review_file).split('/'))),
    );
    return {
      key,
      duplicate: priorIntact,
      prior,
      report,
      source,
      clientNote,
      artifactHash,
      archivedArtifact,
      reviewFile,
    };
  });
}

function ingestReportBatch(envelope, options = {}) {
  const plan = buildReportPlan(envelope, options);
  if (options.validateOnly) {
    return {
      status: 'validated',
      batch_id: envelope.batch_id,
      reports: plan.map((item) => ({
        report_id: item.report.report_id,
        duplicate: item.duplicate,
        client_id: item.report.client.id,
        source: slash(item.source),
      })),
    };
  }

  const state = readJson(REPORT_STATE, { version: 1, processed: {} });
  const ingestedOn = nowISO().slice(0, 10);
  const results = [];
  for (const item of plan) {
    if (item.duplicate) {
      if (options.refreshExisting) {
        const reviewFile = repoPath(...slash(item.prior.review_file).split('/'));
        if (!isWithin(REVIEW_ROOT, reviewFile)) throw new Error(`Stored review path is unsafe: ${item.prior.review_file}`);
        ensureDir(path.dirname(reviewFile));
        fs.writeFileSync(reviewFile, renderReportNote(item.prior), 'utf8');
        results.push({ status: 'refreshed', report_id: item.report.report_id, ...item.prior });
      } else {
        results.push({ status: 'duplicate', report_id: item.report.report_id, ...item.prior });
      }
      continue;
    }

    ensureDir(path.dirname(item.archivedArtifact));
    if (!fs.existsSync(item.archivedArtifact)) fs.copyFileSync(item.source, item.archivedArtifact);
    const archivedHash = sha256File(item.archivedArtifact);
    if (archivedHash !== item.artifactHash) {
      throw new Error(`Archived report hash mismatch: ${item.archivedArtifact}`);
    }

    const record = {
      report_id: cleanScalar(item.report.report_id),
      title: cleanScalar(item.report.title),
      cadence: cleanScalar(item.report.cadence).toLowerCase(),
      period_start: item.report.period_start,
      period_end: item.report.period_end,
      generated_at: cleanScalar(item.report.generated_at || envelope.generated_at),
      client_id: cleanScalar(item.report.client.id),
      client_name: cleanScalar(item.report.client.name),
      client_note: item.clientNote.relative,
      canonical_source: slash(item.source),
      archived_artifact: slash(path.relative(repoPath(), item.archivedArtifact)),
      review_file: slash(path.relative(repoPath(), item.reviewFile)),
      artifact_sha256: item.artifactHash,
      verification_status: cleanScalar(item.report.verification_status || 'partial').toLowerCase(),
      delivery_status: cleanScalar(item.report.delivery_status || 'not-recorded'),
      source_refs: (item.report.source_refs || []).map(slash),
      summary: cleanScalar(item.report.summary),
      ingested_at: nowISO(),
      ingested_on: ingestedOn,
      batch_id: cleanScalar(envelope.batch_id),
    };

    ensureDir(path.dirname(item.reviewFile));
    fs.writeFileSync(item.reviewFile, renderReportNote(record), 'utf8');
    state.processed[item.key] = record;
    enqueue(AUTOMATION_ID, 'archived_report', {
      batch_id: record.batch_id,
      report_id: record.report_id,
      client_id: record.client_id,
      cadence: record.cadence,
      period_start: record.period_start,
      period_end: record.period_end,
      archived_artifact: record.archived_artifact,
      review_file: record.review_file,
      artifact_sha256: record.artifact_sha256,
    });
    results.push({ status: 'ingested', ...record });
  }

  state.updated_at = nowISO();
  state.last_batch_id = cleanScalar(envelope.batch_id);
  writeJson(REPORT_STATE, state);
  return {
    status: 'complete',
    batch_id: envelope.batch_id,
    ingested: results.filter((result) => result.status === 'ingested').length,
    refreshed: results.filter((result) => result.status === 'refreshed').length,
    duplicates: results.filter((result) => result.status === 'duplicate').length,
    reports: results,
  };
}

module.exports = {
  ALLOWED_CADENCES,
  isWithin,
  validateReportEnvelope,
  renderReportNote,
  buildReportPlan,
  ingestReportBatch,
};
