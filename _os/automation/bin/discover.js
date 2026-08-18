#!/usr/bin/env node
'use strict';

const path = require('path');
const { repoPath, writeJson, nowISO } = require('../lib/fsutil');
const { buildSuppressSets } = require('../lib/clients');
const {
  readRows,
  normalizeProspect,
  missingDiscoveryFields,
  dedupeProspects,
  loadSuppressionFiles,
  loadMailedSuppressions,
} = require('../lib/prospects');

function parseArgs(argv) {
  const args = {
    from: null,
    out: null,
    suppress: [],
    target: 25,
    allowPartial: false,
    clientsRoot: repoPath('01_Clients'),
    batchesRoot: repoPath('02_Campaigns', 'AI Site Builder Outreach Engine', 'batches'),
  };
  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index];
    if (arg === '--from') args.from = argv[++index];
    else if (arg === '--out') args.out = argv[++index];
    else if (arg === '--suppress') args.suppress.push(argv[++index]);
    else if (arg === '--target') args.target = Number(argv[++index]);
    else if (arg === '--allow-partial') args.allowPartial = true;
    else if (arg === '--clients-root') args.clientsRoot = argv[++index];
    else if (arg === '--batches-root') args.batchesRoot = argv[++index];
  }
  return args;
}

function absoluteInput(file) {
  return path.isAbsolute(file) ? file : repoPath(file);
}

function runDiscovery(options) {
  if (!options.from) throw new Error('discover requires --from <prospects.csv|json>');
  const from = absoluteInput(options.from);
  const rawRows = readRows(from);
  const normalized = rawRows.map(normalizeProspect);
  const { prospects, duplicateRows } = dedupeProspects(normalized);
  const clientSuppress = buildSuppressSets(options.clientsRoot);
  const explicitSuppress = loadSuppressionFiles((options.suppress || []).map(absoluteInput));
  const mailedSuppress = loadMailedSuppressions(options.batchesRoot);
  const suppressIds = new Set([
    ...[...clientSuppress.suppressIds].map((value) => String(value).toLowerCase()),
    ...[...explicitSuppress.ids].map((value) => String(value).toLowerCase()),
    ...[...mailedSuppress.ids].map((value) => String(value).toLowerCase()),
  ]);
  const suppressDomains = new Set([
    ...clientSuppress.suppressDomains,
    ...explicitSuppress.domains,
    ...mailedSuppress.domains,
  ]);

  const candidates = [];
  const invalid = [];
  const suppressed = [];
  for (const prospect of prospects) {
    const id = prospect.prospect_id.toLowerCase();
    const name = prospect.business_name.toLowerCase();
    if (suppressIds.has(id) || suppressIds.has(name) || (prospect.domain && suppressDomains.has(prospect.domain))) {
      suppressed.push({ ...prospect, suppression_reason: 'existing client, current pipeline, or previously mailed' });
      continue;
    }
    const missing_fields = missingDiscoveryFields(prospect);
    if (missing_fields.length) {
      invalid.push({ ...prospect, missing_fields });
      continue;
    }
    candidates.push(prospect);
  }

  const target = Number.isFinite(options.target) && options.target > 0 ? Math.floor(options.target) : 25;
  const ready = candidates.length >= target;
  const result = {
    automation_id: 'discover-import',
    generated_at: nowISO(),
    source_file: from,
    target_count: target,
    status: ready ? 'ready' : options.allowPartial ? 'partial' : 'hold',
    outbound_actions: false,
    counts: {
      imported: rawRows.length,
      deduped: prospects.length,
      candidates: candidates.length,
      invalid: invalid.length,
      suppressed: suppressed.length,
      duplicates: duplicateRows.length,
    },
    prospects: candidates,
    invalid,
    suppressed,
    duplicates: duplicateRows,
    gates: {
      target_count_met: ready,
      human_approval_required_before_activation: true,
      mail_ready: 'hold',
    },
  };

  const stateFile = repoPath('12_Brain', 'state', 'discover-last.json');
  if (options.writeState !== false) writeJson(stateFile, result);
  if (options.out) writeJson(path.isAbsolute(options.out) ? options.out : repoPath(options.out), result);
  return result;
}

if (require.main === module) {
  try {
    const options = parseArgs(process.argv.slice(2));
    const result = runDiscovery(options);
    console.log(JSON.stringify({
      status: result.status,
      counts: result.counts,
      target_count: result.target_count,
      state: repoPath('12_Brain', 'state', 'discover-last.json'),
    }, null, 2));
    process.exitCode = result.status === 'ready' || options.allowPartial ? 0 : 1;
  } catch (error) {
    console.error(error.message || error);
    process.exit(1);
  }
}

module.exports = { parseArgs, runDiscovery };
