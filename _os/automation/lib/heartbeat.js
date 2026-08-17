'use strict';

/**
 * System heartbeat — pure checks over an injectable snapshot of the estate.
 *
 * Fail closed on ungoverned power. Advisory findings never fail the run.
 * Ranking is by live risk, not alphabetically: a command that can act now and
 * is invisible to the registry outranks a token-blocked deploy.
 */

const fs = require('fs');
const path = require('path');
const { redactText } = require('../../public-safety');
const { parseFrontmatter } = require('./frontmatter');
const { repoPath, REPO_ROOT, todayISO, slugify } = require('./fsutil');
const { loadRegistry } = require('./registry');
const { scanEntry } = require('./heartbeat-scan');
const {
  loadSchedulerTomlFile,
  collectShadowDefinitions,
  resolveSchedulerSource,
} = require('./heartbeat-toml');

const SEVERITY = Object.freeze({ critical: 'critical', warn: 'warn', info: 'info' });
const NEAR_EXPIRY_DAYS = 14;
const BLOCKED_STATUSES = new Set([
  'gated',
  'pending-gate',
  'pending-secret',
  'hard-blocked',
  'blocked',
  'paused',
  'external-dependency',
]);
const COMMAND_DIRS = ['_os/automation/bin', '_os/dev/bin'];
const STATE_FILE = '12_Brain/state/heartbeat.json';
const MANIFEST_FILE = 'Daily-Briefs/heartbeat-manifest.md';
const SCHEDULER_CHECKS = Object.freeze(['missing-registration', 'shadow-duplicate']);

function posix(rel) {
  return String(rel || '').split(path.sep).join('/');
}

function relToRoot(file, root = REPO_ROOT) {
  return posix(path.relative(root, file));
}

function parseDate(value) {
  const text = String(value || '').slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return null;
  const ms = Date.parse(`${text}T00:00:00.000Z`);
  return Number.isNaN(ms) ? null : ms;
}

function daysUntil(asOf, expires) {
  const start = parseDate(asOf);
  const end = parseDate(expires);
  if (start == null || end == null) return null;
  return Math.round((end - start) / 86400000);
}

function isBlockedStatus(status) {
  return BLOCKED_STATUSES.has(String(status || '').toLowerCase());
}

function isActiveStatus(status) {
  const value = String(status || 'ACTIVE').toUpperCase();
  return !['PAUSED', 'DISABLED', 'STOPPED', 'RETIRED'].includes(value);
}

function isPathLikeOutput(value) {
  const text = String(value || '').trim();
  if (!text) return false;
  if (/[<>]/.test(text) || text.includes('*')) return false;
  if (/\s/.test(text) && !/[\\/]/.test(text)) return false;
  if (/^(12_Brain|_os|Daily-Briefs|01_Clients|08_Prospects|_templates)\//.test(text)) return true;
  if (/^[._A-Za-z0-9-]+\/.+\.[A-Za-z0-9]{1,8}$/.test(text)) return true;
  if (!/\s/.test(text) && /\.[A-Za-z0-9]{1,8}$/.test(text) && text.includes('/')) return true;
  return false;
}

function extractCommandPath(command) {
  const text = String(command || '');
  const match = text.match(
    /(?:^|[\s"'`])((?:_os|_templates|\.github|12_Brain)\/[\w./-]+\.(?:js|ps1|ya?ml))/i,
  );
  return match ? posix(match[1]) : null;
}

function basenameOf(file) {
  return path.basename(String(file || '')).toLowerCase();
}

function stemOf(file) {
  return path.basename(String(file || ''), path.extname(String(file || ''))).toLowerCase();
}

function matchRegistry(registry, candidate) {
  const automations = registry?.automations || [];
  const id = String(candidate.id || '').toLowerCase();
  const commandPath = posix(candidate.path || candidate.command || '');
  const base = basenameOf(commandPath || candidate.subject || '');
  return automations.find((auto) => {
    if (id && String(auto.id || '').toLowerCase() === id) return true;
    const hay = `${auto.command || ''} ${auto.id || ''}`.toLowerCase();
    if (base && hay.includes(base)) return true;
    if (commandPath && hay.includes(commandPath.toLowerCase())) return true;
    return false;
  }) || null;
}

function netlifyGatePending(registry) {
  const gates = registry?.gates || {};
  return String(gates.netlify_deploy_token || '').toLowerCase().includes('pending');
}

function findingId(family, code, subject) {
  return `${family}:${slugify(`${code}-${subject}`)}`;
}

function makeFinding(partial) {
  const evidence = redactText(String(partial.evidence || partial.detail || ''));
  return {
    id: partial.id,
    code: partial.code,
    family: partial.family,
    severity: partial.severity,
    lane: partial.severity === SEVERITY.critical ? 'critical' : 'advisory',
    subject: partial.subject,
    subject_path: partial.subject_path || null,
    detail: redactText(String(partial.detail || '')),
    evidence,
    next_action: partial.next_action || null,
    live: Boolean(partial.live),
    registered: Boolean(partial.registered),
    token_blocked: Boolean(partial.token_blocked),
    priority: 0,
  };
}

function priorityScore(finding) {
  let score = 0;
  if (finding.severity === SEVERITY.critical) score += 1000;
  else if (finding.severity === SEVERITY.warn) score += 100;
  else score += 10;
  if (!finding.registered) score += 200;
  if (finding.live) score += 100;
  if (finding.token_blocked) score -= 80;
  if (finding.code === 'unregistered-external-action') score += 50;
  if (finding.code === 'missing-registration') score += 20;
  if (finding.code === 'check-skipped') score += 250;
  return score;
}

function rankFindings(findings) {
  return [...findings].sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority;
    if (a.severity !== b.severity) {
      const order = { critical: 0, warn: 1, info: 2 };
      return (order[a.severity] || 9) - (order[b.severity] || 9);
    }
    return String(a.id).localeCompare(String(b.id));
  });
}

function nextActionLine(findings) {
  const critical = findings.filter((finding) => finding.severity === SEVERITY.critical);
  if (critical.length) {
    const top = critical[0];
    if (top.next_action) return top.next_action;
    return `Resolve \`${top.subject}\` (${top.code}).`;
  }
  const skipped = findings.filter((finding) => finding.code === 'check-skipped');
  if (skipped.length) {
    const names = [...new Set(skipped.map((finding) => finding.subject))].join(', ');
    const others = findings.filter((finding) => finding.code !== 'check-skipped');
    if (!others.length) {
      return `Skipped ${names} — absence of evidence is not evidence of health.`;
    }
    return `Skipped ${names} — absence of evidence is not evidence of health. ${others.length} advisory finding(s) remain.`;
  }
  if (!findings.length) return 'No ungoverned power. Heartbeat is clean.';
  return `No ungoverned power. ${findings.length} advisory finding(s) remain.`;
}

function coverageStatus(value) {
  if (value == null) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'object') return value.status || null;
  return null;
}

function resolveCoverage(input = {}) {
  const provided = input.coverage || {};
  const scheduler = coverageStatus(provided.scheduler)
    || (Object.prototype.hasOwnProperty.call(input, 'definitions') ? 'present' : 'absent');
  const workflows = coverageStatus(provided.workflows)
    || (Object.prototype.hasOwnProperty.call(input, 'workflows') ? 'present' : 'not-applicable');
  const commands = coverageStatus(provided.commands)
    || (Object.prototype.hasOwnProperty.call(input, 'commands') ? 'present' : 'not-applicable');
  const registry = coverageStatus(provided.registry)
    || (input.registry ? 'present' : 'not-applicable');
  return {
    scheduler: {
      status: scheduler,
      path: provided.scheduler?.path || null,
      reason: provided.scheduler?.reason || (scheduler === 'absent' ? 'no automation.toml in default locations' : null),
    },
    workflows: {
      status: workflows,
      count: provided.workflows?.count ?? (Array.isArray(input.workflows) ? input.workflows.length : null),
    },
    commands: {
      status: commands,
      count: provided.commands?.count ?? (Array.isArray(input.commands) ? input.commands.length : null),
    },
    registry: {
      status: registry,
    },
  };
}

function checkSkippedSources(input, findings) {
  const coverage = resolveCoverage(input);
  if (coverage.scheduler.status !== 'absent') return;
  const reason = coverage.scheduler.reason || 'no automation.toml in default locations';
  findings.push(makeFinding({
    id: findingId('coverage', 'skipped', 'scheduler'),
    code: 'check-skipped',
    family: 'coverage',
    severity: SEVERITY.warn,
    subject: 'scheduler',
    subject_path: coverage.scheduler.path,
    detail: `Scheduler source absent (${reason}). ${SCHEDULER_CHECKS.join(' and ')} did not see \`automation.toml\`. GitHub workflows, if present, were still checked.`,
    evidence: reason,
    next_action: 'Point heartbeat at the scheduler with `--definitions <dir-or-toml>` or place `automation.toml` at the repo root. Absence of evidence is not evidence of health.',
    live: false,
    registered: true,
  }));
}

function checkExpiredEvidence(input, findings) {
  for (const record of input.evidence || []) {
    const remaining = daysUntil(input.as_of, record.expires);
    if (remaining == null) continue;
    const subject = record.id || record.path || 'evidence';
    if (remaining < 0) {
      findings.push(makeFinding({
        id: findingId('evidence', 'expired', subject),
        code: 'expired-evidence',
        family: 'evidence',
        severity: SEVERITY.critical,
        subject,
        subject_path: record.path || null,
        detail: `Claim \`${subject}\` expired on ${record.expires} (as-of ${input.as_of}).`,
        evidence: record.evidence || record.path || '',
        next_action: `Refresh or retire the expired claim \`${subject}\` (expired ${record.expires}).`,
        live: true,
        registered: true,
      }));
    } else if (remaining <= NEAR_EXPIRY_DAYS) {
      findings.push(makeFinding({
        id: findingId('evidence', 'near-expiry', subject),
        code: 'near-expiry',
        family: 'evidence',
        severity: SEVERITY.warn,
        subject,
        subject_path: record.path || null,
        detail: `Claim \`${subject}\` expires on ${record.expires} (${remaining} day(s) from ${input.as_of}).`,
        evidence: record.path || '',
        live: false,
        registered: true,
      }));
    }
  }
}

function schedulerDefinitions(input) {
  const coverage = resolveCoverage(input);
  if (coverage.scheduler.status === 'absent') return [];
  return (input.definitions || []).filter((def) => def.kind !== 'workflow');
}

function registrationDefinitions(input) {
  const coverage = resolveCoverage(input);
  const defs = [];
  if (coverage.scheduler.status !== 'absent') {
    defs.push(...(input.definitions || []).filter((def) => def.kind !== 'workflow' && def.kind !== 'shadow'));
  }
  if (coverage.workflows.status === 'present') {
    const workflows = input.workflows
      || (input.definitions || []).filter((def) => def.kind === 'workflow');
    defs.push(...workflows);
  }
  return defs;
}

function checkShadowDuplicates(input, findings) {
  const coverage = resolveCoverage(input);
  if (coverage.scheduler.status === 'absent') return;
  const byId = new Map();
  for (const def of schedulerDefinitions(input)) {
    const id = String(def.id || '').toLowerCase();
    if (!id) continue;
    if (!byId.has(id)) byId.set(id, []);
    byId.get(id).push(def);
  }
  for (const [id, group] of byId) {
    if (group.length < 2) continue;
    const sources = group.map((def) => def.source || def.path || def.id).join(', ');
    findings.push(makeFinding({
      id: findingId('definition', 'shadow-duplicate', id),
      code: 'shadow-duplicate',
      family: 'definition',
      severity: SEVERITY.info,
      subject: group[0].id,
      detail: `Shadow definitions for \`${group[0].id}\` (${group.length}): ${sources}. Nonblocking.`,
      evidence: sources,
      live: false,
      registered: Boolean(matchRegistry(input.registry, group[0])),
    }));
  }
}

function checkMissingRegistration(input, findings) {
  const seen = new Set();
  for (const def of registrationDefinitions(input)) {
    const status = def.status || (def.active === false ? 'PAUSED' : 'ACTIVE');
    if (!isActiveStatus(status) || String(status).toUpperCase() === 'PAUSED') continue;
    if (def.active === false) continue;
    const key = String(def.id || def.path || def.command || '').toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    const matched = matchRegistry(input.registry, def);
    if (matched) continue;
    const subject = def.id || basenameOf(def.path || def.command || 'routine');
    findings.push(makeFinding({
      id: findingId('registration', 'missing', subject),
      code: 'missing-registration',
      family: 'registration',
      severity: SEVERITY.critical,
      subject,
      subject_path: def.path || def.source || def.command || null,
      detail: `ACTIVE routine \`${subject}\` has no registry entry.`,
      evidence: def.source || def.path || '',
      next_action: `Register \`${subject}\` in \`12_Brain/registry/automations.json\` with the tier matching what it can do.`,
      live: true,
      registered: false,
    }));
  }
}

function commandLive(cap, registry) {
  if (!cap) return false;
  if (cap.token_blocked_signals && netlifyGatePending(registry)) return false;
  return cap.external_action;
}

function checkUnregisteredExternal(input, capabilities, findings) {
  for (const command of input.commands || []) {
    const cap = capabilities[command.path];
    if (!cap || !cap.external_action) continue;
    const matched = matchRegistry(input.registry, command);
    const live = commandLive(cap, input.registry);
    const tokenBlocked = Boolean(cap.token_blocked_signals && netlifyGatePending(input.registry));
    if (matched && matched.external_actions === true) continue;
    if (matched && isBlockedStatus(matched.status) && matched.external_actions !== true) {
      findings.push(makeFinding({
        id: findingId('conflict', 'undeclared-external', command.id || basenameOf(command.path)),
        code: 'undeclared-external-action',
        family: 'conflict',
        severity: SEVERITY.warn,
        subject: basenameOf(command.path),
        subject_path: command.path,
        detail: `Registry entry \`${matched.id}\` can mutate but does not declare \`external_actions: true\`.`,
        live: false,
        registered: true,
        token_blocked: tokenBlocked,
      }));
      continue;
    }
    if (matched) continue;
    const subject = basenameOf(command.path);
    const mutation = [...new Set((cap.mutations || []).map((fact) => fact.id))].join(', ') || 'external write';
    findings.push(makeFinding({
      id: findingId('external_action', 'unregistered-external', subject),
      code: 'unregistered-external-action',
      family: 'external_action',
      severity: SEVERITY.critical,
      subject,
      subject_path: command.path,
      detail: `\`${subject}\` can ${mutation} and has no registry entry declaring \`external_actions: true\`.`,
      evidence: (cap.mutations || []).map((fact) => `${fact.id}@${fact.module}`).join('; '),
      next_action: `Register \`${subject}\` with \`external_actions: true\` and an approval tier matching what it can do — ${mutation}.`,
      live,
      registered: false,
      token_blocked: tokenBlocked,
    }));
  }
}

function checkUnclassifiedOutbound(input, capabilities, findings) {
  for (const command of input.commands || []) {
    const cap = capabilities[command.path];
    if (!cap || !(cap.unclassified_outbound || []).length) continue;
    const subject = basenameOf(command.path);
    const modules = [...new Set(cap.unclassified_outbound.map((fact) => fact.module))];
    findings.push(makeFinding({
      id: findingId('classification', 'unclassified-outbound', subject),
      code: 'unclassified-outbound',
      family: 'classification',
      severity: SEVERITY.info,
      subject,
      subject_path: command.path,
      detail: `\`${subject}\` reaches outbound HTTP (${cap.unclassified_outbound.map((f) => f.verb).join('/')}) in ${modules.join(', ')}. Not classified as a mutation.`,
      evidence: modules.join(', '),
      live: false,
      registered: Boolean(matchRegistry(input.registry, command)),
    }));
  }
}

function checkBrokenContracts(input, findings) {
  const known = new Set((input.commands || []).map((command) => posix(command.path)));
  const existsMap = input.files || {};
  for (const auto of input.registry?.automations || []) {
    if (isBlockedStatus(auto.status)) continue;
    if (!auto.command) continue;
    const extracted = extractCommandPath(auto.command);
    if (!extracted) continue;
    const present = known.has(extracted) || existsMap[extracted] === true;
    const missing = existsMap[extracted] === false || (!present && existsMap[extracted] !== true && input.assume_missing_unlisted);
    if (missing) {
      findings.push(makeFinding({
        id: findingId('contract', 'missing-command', auto.id),
        code: 'missing-command',
        family: 'contract',
        severity: SEVERITY.warn,
        subject: auto.id,
        subject_path: extracted,
        detail: `Registry command for \`${auto.id}\` resolves to \`${extracted}\`, which is missing.`,
        registered: true,
        live: false,
      }));
    }
  }
}

function hasRunEvidence(auto, files) {
  if (files[`12_Brain/state/${auto.id}.json`] === true) return true;
  return (auto.outputs || []).some((output) => isPathLikeOutput(output) && files[output] === true);
}

function checkMissingOutputs(input, findings) {
  const files = input.files || {};
  for (const auto of input.registry?.automations || []) {
    if (!hasRunEvidence(auto, files)) continue;
    for (const output of auto.outputs || []) {
      if (!isPathLikeOutput(output)) continue;
      if (files[output] !== false) continue;
      const stateMatch = String(output).match(/12_Brain\/state\/([^/]+)\.json$/);
      if (stateMatch && stateMatch[1] !== auto.id) continue;
      findings.push(makeFinding({
        id: findingId('contract', 'missing-output', `${auto.id}-${output}`),
        code: 'missing-output',
        family: 'contract',
        severity: SEVERITY.warn,
        subject: auto.id,
        subject_path: output,
        detail: `Declared output \`${output}\` for \`${auto.id}\` is missing.`,
        registered: true,
        live: false,
      }));
    }
  }
}

function checkConflicts(input, findings) {
  for (const auto of input.registry?.automations || []) {
    for (const output of auto.outputs || []) {
      const match = String(output).match(/12_Brain\/state\/([^/]+)\.json$/);
      if (!match) continue;
      const stem = match[1];
      if (stem === auto.id) continue;
      const actualState = `12_Brain/state/${auto.id}.json`;
      if ((input.files || {})[actualState] !== true) continue;
      findings.push(makeFinding({
        id: findingId('conflict', 'state-name', auto.id),
        code: 'state-name-mismatch',
        family: 'conflict',
        severity: SEVERITY.warn,
        subject: auto.id,
        subject_path: output,
        detail: `Registry id \`${auto.id}\` declares state file \`${output}\`; writeRunState would use \`12_Brain/state/${auto.id}.json\`.`,
        registered: true,
        live: false,
      }));
    }
  }

  const byStem = new Map();
  for (const command of input.commands || []) {
    const stem = stemOf(command.path);
    if (!byStem.has(stem)) byStem.set(stem, []);
    byStem.get(stem).push(command);
  }
  for (const [stem, group] of byStem) {
    if (group.length < 2) continue;
    const registered = group.filter((command) => matchRegistry(input.registry, command));
    if (!registered.length) continue;
    const paths = group.map((command) => command.path).join(', ');
    findings.push(makeFinding({
      id: findingId('conflict', 'variant-ambiguity', stem),
      code: 'variant-ambiguity',
      family: 'conflict',
      severity: SEVERITY.warn,
      subject: stem,
      detail: `Command stem \`${stem}\` has multiple variants (${paths}); registry match is ambiguous.`,
      evidence: paths,
      registered: true,
      live: false,
    }));
  }
}

function scanCommands(input) {
  const capabilities = {};
  const scanOptions = {
    sources: input.sources || {},
    exists: (file) => {
      const key = posix(file);
      if (input.sources && Object.prototype.hasOwnProperty.call(input.sources, key)) return true;
      if (input.files && input.files[key] === true) return true;
      return false;
    },
    readFile: (file) => {
      const key = posix(file);
      if (input.sources && Object.prototype.hasOwnProperty.call(input.sources, key)) {
        return input.sources[key];
      }
      throw new Error(`no in-memory source for ${key}`);
    },
  };
  const useFs = !input.sources;
  for (const command of input.commands || []) {
    capabilities[command.path] = useFs
      ? scanEntry(path.isAbsolute(command.path) ? command.path : repoPath(command.path))
      : scanEntry(command.path, scanOptions);
  }
  return capabilities;
}

function runHeartbeat(input = {}, options = {}) {
  const coverage = resolveCoverage(input);
  const snapshot = {
    as_of: input.as_of || options.asOf || todayISO(),
    registry: input.registry || { automations: [], gates: {} },
    definitions: input.definitions || [],
    workflows: input.workflows || [],
    coverage,
    evidence: input.evidence || [],
    commands: input.commands || [],
    sources: input.sources,
    files: input.files || {},
    assume_missing_unlisted: Boolean(input.assume_missing_unlisted),
  };
  const capabilities = options.capabilities || scanCommands(snapshot);
  const findings = [];
  checkSkippedSources(snapshot, findings);
  checkExpiredEvidence(snapshot, findings);
  checkShadowDuplicates(snapshot, findings);
  checkMissingRegistration(snapshot, findings);
  checkUnregisteredExternal(snapshot, capabilities, findings);
  checkUnclassifiedOutbound(snapshot, capabilities, findings);
  checkBrokenContracts(snapshot, findings);
  checkMissingOutputs(snapshot, findings);
  checkConflicts(snapshot, findings);

  for (const finding of findings) finding.priority = priorityScore(finding);
  const ranked = rankFindings(findings);
  const critical = ranked.filter((finding) => finding.severity === SEVERITY.critical);
  const advisory = ranked.filter((finding) => finding.severity !== SEVERITY.critical);
  const status = critical.length ? 'fail' : advisory.length ? 'advisory' : 'ok';
  const nextAction = nextActionLine(ranked);
  const result = {
    automation_id: 'heartbeat',
    as_of: snapshot.as_of,
    checked_at: `${snapshot.as_of}T00:00:00.000Z`,
    status,
    counts: {
      critical: critical.length,
      advisory: advisory.length,
      warn: ranked.filter((finding) => finding.severity === SEVERITY.warn).length,
      info: ranked.filter((finding) => finding.severity === SEVERITY.info).length,
      total: ranked.length,
    },
    next_action: nextAction,
    coverage,
    skipped: ranked
      .filter((finding) => finding.code === 'check-skipped')
      .map((finding) => ({
        check: SCHEDULER_CHECKS.join(', '),
        source: finding.subject,
        reason: finding.evidence || finding.detail,
      })),
    findings: ranked,
    capabilities: Object.fromEntries(
      Object.entries(capabilities).map(([key, cap]) => [
        key,
        {
          external_action: cap.external_action,
          mutations: cap.mutations,
          unclassified_outbound: cap.unclassified_outbound,
          visited: cap.visited,
        },
      ]),
    ),
  };
  return result;
}

function canonicalResult(result) {
  return {
    as_of: result.as_of,
    status: result.status,
    counts: result.counts,
    next_action: result.next_action,
    coverage: result.coverage,
    skipped: result.skipped,
    findings: result.findings,
  };
}

function renderCoverage(coverage) {
  if (!coverage) return [];
  const lines = ['## Coverage', ''];
  for (const key of ['scheduler', 'workflows', 'commands', 'registry']) {
    const source = coverage[key];
    if (!source) continue;
    const status = source.status || 'unknown';
    if (status === 'not-applicable') continue;
    const extra = [];
    if (source.path) extra.push(source.path);
    if (source.count != null) extra.push(`${source.count}`);
    if (status === 'absent' && source.reason) extra.push(source.reason);
    const suffix = extra.length ? ` — ${extra.join(' · ')}` : '';
    lines.push(`- ${key}: **${status}**${suffix}`);
  }
  lines.push('');
  return lines;
}

function renderManifest(result) {
  const lines = [
    '# Heartbeat manifest',
    '',
    `status ${result.status} · critical ${result.counts.critical} · advisory ${result.counts.advisory} · as-of ${result.as_of}`,
    '',
    ...renderCoverage(result.coverage),
    '## Next action',
    '',
    result.next_action,
    '',
    '## Critical',
    '',
  ];
  const critical = result.findings.filter((finding) => finding.severity === SEVERITY.critical);
  const advisory = result.findings.filter((finding) => finding.severity !== SEVERITY.critical);
  if (!critical.length) lines.push('None.');
  else {
    for (const finding of critical) {
      lines.push(`- **${finding.subject}** — ${finding.detail}`);
    }
  }
  lines.push('', '## Advisory', '');
  if (!advisory.length) lines.push('None.');
  else {
    for (const finding of advisory) {
      lines.push(`- \`${finding.severity}\` **${finding.subject}** (${finding.code}) — ${finding.detail}`);
    }
  }
  lines.push('');
  return lines.join('\n');
}

function listFiles(dir, predicate) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .map((name) => path.join(dir, name))
    .filter((full) => fs.statSync(full).isFile() && predicate(full));
}

function parseDefinitionFile(file, root) {
  const text = fs.readFileSync(file, 'utf8');
  const rel = relToRoot(file, root);
  if (file.endsWith('.json')) {
    const data = JSON.parse(text);
    return {
      id: data.id,
      name: data.name,
      status: String(data.status || 'ACTIVE').toUpperCase(),
      command: data.command,
      expires: data.expires,
      source: rel,
      path: data.path || rel,
      active: data.active !== false,
    };
  }
  const { data } = parseFrontmatter(text);
  return {
    id: data.id || slugify(path.basename(file, path.extname(file))),
    name: data.name || data.title,
    status: String(data.status || 'ACTIVE').toUpperCase(),
    command: data.command,
    expires: data.expires,
    source: rel,
    path: rel,
    active: data.active !== false && String(data.status || 'ACTIVE').toUpperCase() !== 'PAUSED',
  };
}

function parseWorkflow(file, root) {
  const text = fs.readFileSync(file, 'utf8');
  const rel = relToRoot(file, root);
  const nameLine = text.match(/^name:\s*(.+)$/m);
  const disabled = /^\s+if:\s*false\s*$/m.test(text);
  return {
    id: path.basename(file, path.extname(file)),
    name: (nameLine ? nameLine[1] : path.basename(file)).replace(/^['"]|['"]$/g, ''),
    status: disabled ? 'PAUSED' : 'ACTIVE',
    command: rel,
    source: rel,
    path: rel,
    kind: 'workflow',
    active: !disabled,
  };
}

function loadSchedulerDefinitions(root, definitionsDir) {
  const resolved = resolveSchedulerSource(root, definitionsDir);
  const definitions = [];
  if (resolved.status !== 'present') {
    return { definitions, coverage: resolved };
  }

  const tomlFile = resolved.path && /\.toml$/i.test(resolved.path)
    ? (path.isAbsolute(resolved.path) ? resolved.path : path.join(root, resolved.path))
    : null;
  if (tomlFile && fs.existsSync(tomlFile) && fs.statSync(tomlFile).isFile()) {
    definitions.push(...loadSchedulerTomlFile(tomlFile, root));
  }

  const explicitDir = definitionsDir
    ? (path.isAbsolute(definitionsDir) ? definitionsDir : path.join(root, definitionsDir))
    : null;
  const explicitDirExists = Boolean(
    explicitDir && fs.existsSync(explicitDir) && fs.statSync(explicitDir).isDirectory(),
  );
  if (explicitDirExists) {
    for (const file of listFiles(explicitDir, (full) => /\.(md|json)$/i.test(full))) {
      const def = parseDefinitionFile(file, root);
      def.kind = def.kind || 'scheduler';
      definitions.push(def);
    }
  }

  const scanDir = explicitDirExists ? explicitDir : resolved.dir;
  if (scanDir && fs.existsSync(scanDir) && fs.statSync(scanDir).isDirectory()) {
    const knownIds = definitions.map((def) => def.id).filter(Boolean);
    definitions.push(...collectShadowDefinitions(scanDir, knownIds, root));
  }

  return { definitions, coverage: resolved };
}

function collectLiveInput(options = {}) {
  const root = options.root || REPO_ROOT;
  const asOf = options.asOf || todayISO();
  const registry = options.registry || loadRegistry();
  const scheduler = loadSchedulerDefinitions(root, options.definitionsDir || null);
  const definitions = scheduler.definitions;
  const workflows = [];
  const workflowDir = path.join(root, '.github/workflows');
  const workflowsPresent = fs.existsSync(workflowDir) && options.includeWorkflows !== false;
  if (workflowsPresent) {
    for (const file of listFiles(workflowDir, (full) => /\.ya?ml$/i.test(full))) {
      workflows.push(parseWorkflow(file, root));
    }
  }

  const commands = [];
  for (const dir of COMMAND_DIRS) {
    const fullDir = path.join(root, dir);
    for (const file of listFiles(fullDir, (full) => /\.(js|ps1)$/i.test(full))) {
      commands.push({
        id: stemOf(file),
        path: relToRoot(file, root),
        exists: true,
      });
    }
  }

  const files = {};
  for (const auto of registry.automations || []) {
    const extracted = extractCommandPath(auto.command);
    if (extracted) files[extracted] = fs.existsSync(path.join(root, extracted));
    const statePath = `12_Brain/state/${auto.id}.json`;
    files[statePath] = fs.existsSync(path.join(root, statePath));
    for (const output of auto.outputs || []) {
      if (!isPathLikeOutput(output)) continue;
      files[output] = fs.existsSync(path.join(root, output));
    }
  }

  const evidence = [];
  for (const def of definitions) {
    if (def.expires) {
      evidence.push({
        id: def.id,
        path: def.source,
        expires: def.expires,
      });
    }
  }

  return {
    as_of: asOf,
    registry,
    definitions,
    workflows,
    evidence,
    commands,
    files,
    coverage: {
      scheduler: scheduler.coverage,
      workflows: {
        status: workflowsPresent ? 'present' : 'absent',
        count: workflows.length,
        path: workflowsPresent ? '.github/workflows' : null,
      },
      commands: {
        status: commands.length ? 'present' : 'absent',
        count: commands.length,
      },
      registry: { status: 'present' },
    },
  };
}

function exitCodeFor(result) {
  return result.status === 'fail' ? 2 : 0;
}

module.exports = {
  SEVERITY,
  NEAR_EXPIRY_DAYS,
  BLOCKED_STATUSES,
  STATE_FILE,
  MANIFEST_FILE,
  SCHEDULER_CHECKS,
  isBlockedStatus,
  isPathLikeOutput,
  extractCommandPath,
  matchRegistry,
  rankFindings,
  nextActionLine,
  resolveCoverage,
  runHeartbeat,
  canonicalResult,
  renderManifest,
  collectLiveInput,
  exitCodeFor,
  parseWorkflow,
  parseDefinitionFile,
};
