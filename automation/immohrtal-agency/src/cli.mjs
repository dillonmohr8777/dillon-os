#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { loadInput, loadSuppressions } from './input-adapters.mjs';
import { executeRun } from './orchestrator.mjs';
import { prospectKey } from './policy.mjs';
import { enrichWithWebsiteEvidence } from './evidence.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function argsOf(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    if (!argv[i].startsWith('--')) throw new Error(`Unexpected argument ${argv[i]}`);
    const key = argv[i].slice(2);
    const value = argv[i + 1];
    if (!value || value.startsWith('--')) throw new Error(`Missing value for --${key}`);
    args[key] = value;
    i += 1;
  }
  return args;
}

function atomicJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(temp, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  fs.renameSync(temp, file);
}

let lockPath;
let lockOwned = false;
let failureContext = null;
try {
  const args = argsOf(process.argv.slice(2));
  const inputPath = args.input || path.join(root, 'fixtures', 'prospects.json');
  const suppressionPath = args.suppression || path.join(root, 'fixtures', 'suppressions.json');
  const configPath = args.config || path.join(root, 'config', 'default.json');
  const outputRoot = path.resolve(args.output || path.join(root, 'runs'));
  const runId = args['run-id'] || new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 8) + '-' + new Date().toISOString().replace(/[-:TZ.]/g, '').slice(8, 14);
  const asOf = args['as-of'] || new Date().toISOString();
  const stateDir = path.resolve(args.state || path.join(root, 'state'));
  const useModel = String(args['use-model'] || 'false').toLowerCase() === 'true';
  failureContext = { stateDir, outputRoot, runId, asOf, useModel };
  fs.mkdirSync(stateDir, { recursive: true });
  lockPath = path.join(stateDir, 'orchestrator.lock');
  let lockHandle;
  try {
    lockHandle = fs.openSync(lockPath, 'wx');
    fs.writeFileSync(lockHandle, JSON.stringify({ pid: process.pid, run_id: runId, started_at: asOf }));
    lockOwned = true;
  } catch (error) {
    if (error.code === 'EEXIST') throw new Error(`Fail-closed overlap: lock exists at ${lockPath}.`);
    throw error;
  } finally {
    if (lockHandle !== undefined) fs.closeSync(lockHandle);
  }

  const config = JSON.parse(fs.readFileSync(path.resolve(configPath), 'utf8'));
  const input = loadInput(inputPath);
  const suppressions = loadSuppressions(suppressionPath);
  const indexPath = path.join(stateDir, 'prospect-index.json');
  const index = fs.existsSync(indexPath) ? JSON.parse(fs.readFileSync(indexPath, 'utf8')) : { keys: [] };
  if (!Array.isArray(index.keys)) throw new Error('Persistent prospect index must contain a keys array.');
  const prior = new Set(index.keys);
  const remaining = input.prospects.filter((prospect) => !prior.has(prospectKey(prospect)));
  const deferred = Math.max(0, remaining.length - config.limits.max_prospects_per_run);
  input.prospects = remaining.slice(0, config.limits.max_prospects_per_run);
  input.prospects = await enrichWithWebsiteEvidence(input.prospects, config.evidence, asOf);
  input.source.batch = { selected: input.prospects.length, deferred, prior_index_keys: index.keys.length };
  atomicJson(path.join(stateDir, 'latest-state.json'), { status: 'running', run_id: runId, as_of: asOf, delivery: 'draft_only' });
  const result = executeRun({ config, input, suppressions, runId, asOf, outputRoot, priorKeys: index.keys, useModel, agencyRoot: root });
  if (!result.resumed && result.records) {
    const newlyQueued = result.records.filter((record) => record.state === 'AWAITING_APPROVAL').map((record) => prospectKey(record.prospect));
    atomicJson(indexPath, { updated_at: asOf, keys: [...new Set([...index.keys, ...newlyQueued])].sort() });
  }
  atomicJson(path.join(stateDir, 'latest-state.json'), { status: result.receipt.status, run_id: runId, as_of: asOf, run_dir: result.runDir, resumed: result.resumed, delivery: 'draft_only', analysis_mode: useModel ? 'codex_cli_model_analysis' : 'deterministic_only', batch: input.source.batch });
  process.stdout.write(`${JSON.stringify({ ok: true, run_dir: result.runDir, status: result.receipt.status, counts: result.receipt.counts, resumed: result.resumed })}\n`);
} catch (error) {
  if (failureContext) {
    const reason = String(error.message || error).replace(/https?:\/\/\S+/gi, '[url-redacted]').slice(0, 600);
    try {
      atomicJson(path.join(failureContext.stateDir, 'latest-state.json'), {
        status: 'blocked',
        run_id: failureContext.runId,
        as_of: failureContext.asOf,
        reason,
        delivery: 'draft_only',
        analysis_mode: failureContext.useModel ? 'codex_cli_model_analysis' : 'deterministic_only'
      });
      atomicJson(path.join(failureContext.outputRoot, failureContext.runId, 'blocked-receipt.json'), {
        automation: 'IMMOHRTAL Agency Daily Orchestrator',
        run_id: failureContext.runId,
        status: 'blocked',
        reason,
        external_actions: 0
      });
    } catch (receiptError) {
      process.stderr.write(`Blocked receipt warning: ${receiptError.message}\n`);
    }
  }
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
} finally {
  if (lockPath && lockOwned) {
    try { fs.unlinkSync(lockPath); } catch (error) { if (error.code !== 'ENOENT') process.stderr.write(`Lock cleanup warning: ${error.message}\n`); }
  }
}
