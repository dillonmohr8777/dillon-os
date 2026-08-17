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

const AUTOMATION_ID = 'daily-communications-brain';
const STATE_FILE = repoPath('12_Brain/state/daily-communications-brain.json');
const CAPTURE_DIR = repoPath('12_Brain/01_Captures/Communications');
const REVIEW_DIR = repoPath('12_Brain/07_Reviews/Daily Intelligence');
const SOURCE_TYPES = new Set(['gmail', 'slack']);
const CONNECTOR_STATES = new Set(['ok', 'degraded', 'failed']);
const RUN_STATES = new Set(['success', 'degraded']);
const KINDS = new Set([
  'decision',
  'commitment',
  'deliverable',
  'deadline',
  'blocker',
  'meeting',
  'metric',
  'client-change',
  'follow-up',
  'process-knowledge',
]);
const PRIORITIES = new Set(['high', 'normal', 'low']);
const ROUTE_TYPES = new Set(['client', 'full-time', 'venture', 'operations', 'unresolved']);
const FORBIDDEN_KEY = /(^|_)(raw|body|html|mime|password|passcode|api_?key|access_?token|refresh_?token|secret|cookie|otp|one_?time|recovery_?code|payment|card)(_|$)/i;
const FORBIDDEN_VALUE = /(password|passcode|api[ _-]?key|access[ _-]?token|refresh[ _-]?token|session[ _-]?cookie|one[ _-]?time[ _-]?code|recovery[ _-]?code|credit[ _-]?card|card[ _-]?number)\s*[:=]\s*\S+/i;

function sha256(value) {
  return crypto.createHash('sha256').update(String(value), 'utf8').digest('hex');
}

function cleanLine(value, fallback = '') {
  return String(value ?? fallback).replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim();
}

function yamlString(value) {
  return `"${cleanLine(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

function yamlList(values) {
  const unique = [...new Set((values || []).filter(Boolean).map(cleanLine))];
  if (!unique.length) return '[]';
  return `\n${unique.map((value) => `  - ${yamlString(value)}`).join('\n')}`;
}

function validDateTime(value) {
  return typeof value === 'string' && value.length >= 10 && !Number.isNaN(Date.parse(value));
}

function dateOnly(value) {
  return validDateTime(value) ? value.slice(0, 10) : nowISO().slice(0, 10);
}

function relativeSafePath(value) {
  const text = String(value || '').replace(/\\/g, '/');
  return text && !path.isAbsolute(text) && !text.split('/').includes('..');
}

function findForbidden(value, at = '$', errors = []) {
  if (Array.isArray(value)) {
    value.forEach((entry, index) => findForbidden(entry, `${at}[${index}]`, errors));
    return errors;
  }
  if (value && typeof value === 'object') {
    for (const [key, entry] of Object.entries(value)) {
      if (FORBIDDEN_KEY.test(key)) errors.push(`${at}.${key} is a forbidden field`);
      findForbidden(entry, `${at}.${key}`, errors);
    }
    return errors;
  }
  if (typeof value === 'string' && FORBIDDEN_VALUE.test(value)) {
    errors.push(`${at} appears to contain a secret value`);
  }
  return errors;
}

function validateCommunicationEnvelope(envelope) {
  const errors = [];
  if (!envelope || typeof envelope !== 'object' || Array.isArray(envelope)) {
    return { ok: false, errors: ['input must be a JSON object'] };
  }

  if (!cleanLine(envelope.run_id)) errors.push('run_id is required');
  if (!validDateTime(envelope.run_at)) errors.push('run_at must be a date-time');
  if (!RUN_STATES.has(envelope.status)) errors.push('status must be success or degraded');
  if (!envelope.window || !validDateTime(envelope.window.started_at) || !validDateTime(envelope.window.ended_at)) {
    errors.push('window.started_at and window.ended_at must be date-times');
  }
  if (!Number.isInteger(envelope.window?.overlap_hours) || envelope.window.overlap_hours < 0 || envelope.window.overlap_hours > 72) {
    errors.push('window.overlap_hours must be an integer from 0 to 72');
  }
  for (const source of SOURCE_TYPES) {
    if (!CONNECTOR_STATES.has(envelope.connectors?.[source])) errors.push(`connectors.${source} is invalid`);
  }
  if (!Array.isArray(envelope.items)) errors.push('items must be an array');
  if (!envelope.excluded_counts || typeof envelope.excluded_counts !== 'object' || Array.isArray(envelope.excluded_counts)) {
    errors.push('excluded_counts must be an object');
  }
  if (!envelope.checkpoints || typeof envelope.checkpoints !== 'object' || Array.isArray(envelope.checkpoints)) {
    errors.push('checkpoints must be an object');
  }

  const seen = new Set();
  for (const [index, item] of (envelope.items || []).entries()) {
    const prefix = `items[${index}]`;
    if (!cleanLine(item.dedupe_key)) errors.push(`${prefix}.dedupe_key is required`);
    if (seen.has(item.dedupe_key)) errors.push(`${prefix}.dedupe_key is duplicated in this run`);
    seen.add(item.dedupe_key);
    if (!SOURCE_TYPES.has(item.source_type)) errors.push(`${prefix}.source_type is invalid`);
    if (!String(item.dedupe_key || '').startsWith(`${item.source_type}:`)) errors.push(`${prefix}.dedupe_key must start with the source type`);
    if (!cleanLine(item.source_ref)) errors.push(`${prefix}.source_ref is required`);
    if (item.source_type === 'gmail' && !/^gmail:\/\/(message|thread)\//.test(item.source_ref || '')) {
      errors.push(`${prefix}.source_ref must be a Gmail message or thread locator`);
    }
    if (item.source_type === 'slack' && !(/(^slack:\/\/)|(^slack:)|slack\.com\/archives\//).test(item.source_ref || '')) {
      errors.push(`${prefix}.source_ref must be a Slack locator or permalink`);
    }
    if (!validDateTime(item.occurred_at)) errors.push(`${prefix}.occurred_at must be a date-time`);
    if (!KINDS.has(item.kind)) errors.push(`${prefix}.kind is invalid`);
    if (!PRIORITIES.has(item.priority)) errors.push(`${prefix}.priority is invalid`);
    if (!ROUTE_TYPES.has(item.route?.type)) errors.push(`${prefix}.route.type is invalid`);
    if (!cleanLine(item.route?.name)) errors.push(`${prefix}.route.name is required`);
    if (!relativeSafePath(item.route?.path)) errors.push(`${prefix}.route.path must be a safe repository-relative path`);
    for (const field of ['summary', 'evidence', 'next_safe_action']) {
      if (!cleanLine(item[field])) errors.push(`${prefix}.${field} is required`);
    }
    if (!Array.isArray(item.write_targets)) errors.push(`${prefix}.write_targets must be an array`);
    for (const target of item.write_targets || []) {
      if (!relativeSafePath(target)) errors.push(`${prefix}.write_targets contains an unsafe path`);
      if (item.route?.type === 'client' && String(target).replace(/\\/g, '/').startsWith('01_Clients/')) {
        const routeDir = path.posix.dirname(String(item.route.path).replace(/\\/g, '/'));
        if (!String(target).replace(/\\/g, '/').startsWith(`${routeDir}/`) && String(target).replace(/\\/g, '/') !== item.route.path.replace(/\\/g, '/')) {
          errors.push(`${prefix}.write_targets crosses the routed client folder`);
        }
      }
    }
  }

  findForbidden(envelope, '$', errors);
  return { ok: errors.length === 0, errors };
}

function normalizeCommunicationItems(items) {
  const unique = new Map();
  for (const item of items || []) {
    if (!unique.has(item.dedupe_key)) {
      unique.set(item.dedupe_key, {
        ...item,
        participants: [...new Set((item.participants || []).map(cleanLine).filter(Boolean))],
        summary: cleanLine(item.summary),
        evidence: cleanLine(item.evidence),
        uncertainty: cleanLine(item.uncertainty, 'None recorded.'),
        next_safe_action: cleanLine(item.next_safe_action),
        write_targets: [...new Set((item.write_targets || []).map((target) => String(target).replace(/\\/g, '/')))],
      });
    }
  }
  return [...unique.values()];
}

function renderItem(item) {
  const participants = item.participants?.length ? item.participants.join(', ') : 'Not retained';
  const targets = item.write_targets.length ? item.write_targets.map((target) => `  - \`${target}\``).join('\n') : '  - Daily review only';
  return `### ${cleanLine(item.route.name)} - ${cleanLine(item.kind)}

- Priority: **${item.priority}**
- Occurred: ${cleanLine(item.occurred_at)}
- Participants: ${participants}
- Source: ${cleanLine(item.source_ref)}
- Summary: ${cleanLine(item.summary)}
- Evidence: ${cleanLine(item.evidence)}
- Uncertainty: ${cleanLine(item.uncertainty)}
- Next safe action: ${cleanLine(item.next_safe_action)}
- Intended compile targets:
${targets}`;
}

function renderCapture(envelope, items) {
  const day = dateOnly(envelope.run_at);
  const sourceRefs = items.map((item) => item.source_ref);
  return `---
note_type: capture
status: compiled
created: ${day}
updated: ${day}
captured_at: ${yamlString(envelope.run_at)}
source_type: communication_intelligence
run_id: ${yamlString(envelope.run_id)}
verification_status: ${envelope.status === 'success' ? 'verified' : 'partial'}
source_refs:${yamlList(sourceRefs)}
tags:
  - brain
  - capture
  - gmail
  - slack
  - communication-intelligence
---

# ${day} - Gmail and Slack intelligence capture

> [!source] Curated receipt
> This preserves verified operational summaries and source locators, not raw
> email or Slack archives. No message was sent or posted during ingestion.

## Run scope

- Run: ${cleanLine(envelope.run_id)}
- Window: ${cleanLine(envelope.window.started_at)} to ${cleanLine(envelope.window.ended_at)}
- Gmail: ${envelope.connectors.gmail}
- Slack: ${envelope.connectors.slack}
- New durable items: ${items.length}

## Curated evidence

${items.length ? items.map(renderItem).join('\n\n') : 'No new durable communication items were found.'}

## Exclusions

${Object.entries(envelope.excluded_counts || {}).length
    ? Object.entries(envelope.excluded_counts).map(([reason, count]) => `- ${cleanLine(reason)}: ${count}`).join('\n')
    : '- No exclusion counts were supplied.'}
`;
}

function groupedItems(items, kinds) {
  return items.filter((item) => kinds.includes(item.kind));
}

function renderList(items) {
  if (!items.length) return '- None.';
  return items.map((item) => `- **${cleanLine(item.route.name)}:** ${cleanLine(item.summary)} Next: ${cleanLine(item.next_safe_action)} ([source](${item.source_ref}))`).join('\n');
}

function renderDailyReview(envelope, items, captureRel) {
  const day = dateOnly(envelope.run_at);
  const high = items.filter((item) => item.priority === 'high');
  const unresolved = items.filter((item) => item.route.type === 'unresolved');
  const clientUpdates = items.filter((item) => item.route.type === 'client');
  return `---
note_type: communication_intelligence
status: active
created: ${day}
updated: ${day}
owner: Dillon Mohr
review_cadence: daily
run_id: ${yamlString(envelope.run_id)}
verification_status: ${envelope.status === 'success' ? 'verified' : 'partial'}
item_count: ${items.length}
high_priority_count: ${high.length}
client_update_count: ${clientUpdates.length}
unresolved_count: ${unresolved.length}
source_refs:
  - ${yamlString(`[[${captureRel.replace(/\\/g, '/').replace(/\.md$/, '')}]]`)}
tags:
  - brain
  - review
  - daily-intelligence
  - gmail
  - slack
---

# ${day} - Communication Intelligence

## Executive pulse

- ${items.length} new durable item${items.length === 1 ? '' : 's'} compiled.
- ${high.length} high-priority item${high.length === 1 ? '' : 's'}.
- ${clientUpdates.length} client-routed update${clientUpdates.length === 1 ? '' : 's'}.
- ${unresolved.length} item${unresolved.length === 1 ? '' : 's'} held for routing review.
- Gmail connector: **${envelope.connectors.gmail}**. Slack connector: **${envelope.connectors.slack}**.
- Nothing was sent, posted, published, purchased, or changed in an external account.

## Do first

${renderList(high)}

## Decisions and commitments

${renderList(groupedItems(items, ['decision', 'commitment']))}

## Deliverables and deadlines

${renderList(groupedItems(items, ['deliverable', 'deadline']))}

## Blockers and follow-ups

${renderList(groupedItems(items, ['blocker', 'follow-up']))}

## Client changes and metrics

${renderList(groupedItems(items, ['client-change', 'metric']))}

## Meetings and reusable process knowledge

${renderList(groupedItems(items, ['meeting', 'process-knowledge']))}

## Unresolved routing

${renderList(unresolved)}

## Run receipt

- Capture: [[${captureRel.replace(/\\/g, '/').replace(/\.md$/, '')}]]
- Run: ${cleanLine(envelope.run_id)}
- Evidence window: ${cleanLine(envelope.window.started_at)} to ${cleanLine(envelope.window.ended_at)}
- Dedupe overlap: ${envelope.window.overlap_hours} hours
`;
}

function appendReview(reviewFile, rendered, runId) {
  ensureDir(path.dirname(reviewFile));
  if (!fs.existsSync(reviewFile)) {
    fs.writeFileSync(reviewFile, rendered, 'utf8');
    return 'created';
  }
  const current = fs.readFileSync(reviewFile, 'utf8');
  if (current.includes(`Run: ${runId}`) || current.includes(`run_id: "${runId}"`)) return 'unchanged';
  const bodyStart = rendered.indexOf('## Executive pulse');
  const body = (bodyStart >= 0 ? rendered.slice(bodyStart) : rendered)
    .replace(/^## /gm, '### ');
  const section = `## Additional run - ${cleanLine(runId)}\n\n${body.trim()}\n`;
  fs.writeFileSync(reviewFile, `${current.trimEnd()}\n\n---\n\n${section}`, 'utf8');
  return 'appended';
}

function ingestCommunicationRun(envelope, options = {}) {
  const validation = validateCommunicationEnvelope(envelope);
  if (!validation.ok) throw new Error(`Invalid communication run envelope: ${validation.errors.join('; ')}`);

  const normalizedItems = normalizeCommunicationItems(envelope.items);
  const state = readJson(STATE_FILE, {
    version: 1,
    automation_id: AUTOMATION_ID,
    processed: {},
    runs: {},
    checkpoints: { gmail: null, slack: null },
  });
  if (!options.force && state.runs?.[envelope.run_id]) {
    return { status: 'duplicate-run', run_id: envelope.run_id, ...state.runs[envelope.run_id] };
  }

  const newItems = options.force
    ? normalizedItems
    : normalizedItems.filter((item) => !state.processed?.[item.dedupe_key]);
  const payloadHash = sha256(JSON.stringify({ ...envelope, items: normalizedItems }));
  const day = dateOnly(envelope.run_at);
  const captureName = `${day} - daily-communications-${slugify(envelope.run_id)}.md`;
  const captureFile = path.join(CAPTURE_DIR, captureName);
  const captureRel = path.relative(repoPath(), captureFile);
  const reviewFile = path.join(REVIEW_DIR, `${day} - Communication Intelligence.md`);
  const reviewRel = path.relative(repoPath(), reviewFile);

  ensureDir(CAPTURE_DIR);
  if (fs.existsSync(captureFile) && !options.force) {
    throw new Error(`Capture already exists outside run state: ${captureRel}`);
  }
  fs.writeFileSync(captureFile, renderCapture(envelope, newItems), 'utf8');
  const reviewAction = appendReview(reviewFile, renderDailyReview(envelope, newItems, captureRel), envelope.run_id);

  for (const item of newItems) {
    enqueue(AUTOMATION_ID, 'compile_communication_item', {
      run_id: envelope.run_id,
      dedupe_key: item.dedupe_key,
      source_ref: item.source_ref,
      route: item.route,
      kind: item.kind,
      priority: item.priority,
      summary: item.summary,
      evidence: item.evidence,
      next_safe_action: item.next_safe_action,
      write_targets: item.write_targets,
      capture_file: captureRel,
      review_file: reviewRel,
    });
    state.processed[item.dedupe_key] = {
      source_ref: item.source_ref,
      occurred_at: item.occurred_at,
      route: item.route,
      run_id: envelope.run_id,
      processed_at: nowISO(),
    };
  }

  state.version = 1;
  state.automation_id = AUTOMATION_ID;
  state.checkpoints = {
    gmail: envelope.connectors.gmail === 'failed' ? state.checkpoints?.gmail || null : envelope.checkpoints.gmail,
    slack: envelope.connectors.slack === 'failed' ? state.checkpoints?.slack || null : envelope.checkpoints.slack,
  };
  state.last_successful_run = envelope.status === 'success' ? envelope.run_at : state.last_successful_run || null;
  state.last_run = envelope.run_at;
  state.last_status = envelope.status;
  state.runs = state.runs || {};
  state.runs[envelope.run_id] = {
    status: envelope.status,
    payload_hash: payloadHash,
    new_items: newItems.length,
    duplicate_items: normalizedItems.length - newItems.length,
    capture_file: captureRel,
    review_file: reviewRel,
    review_action: reviewAction,
    written_at: nowISO(),
  };
  state.updated_at = nowISO();
  writeJson(STATE_FILE, state);

  return {
    status: 'ingested',
    run_id: envelope.run_id,
    payload_hash: payloadHash,
    new_items: newItems.length,
    duplicate_items: normalizedItems.length - newItems.length,
    capture_file: captureRel,
    review_file: reviewRel,
    review_action: reviewAction,
  };
}

module.exports = {
  validateCommunicationEnvelope,
  normalizeCommunicationItems,
  renderCapture,
  renderDailyReview,
  appendReview,
  ingestCommunicationRun,
};
