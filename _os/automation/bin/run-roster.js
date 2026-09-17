#!/usr/bin/env node
'use strict';
/**
 * Run every agent in the roster that can run without a model and without
 * arguments, record each into runs.jsonl, and write one dated report.
 *
 * This is the repeatable "run all agents" entry point. It deliberately
 * runs only the free, deterministic tier:
 *   - `node ...` commands with no <required> placeholders
 *   - optional [flags] are stripped, so the bare command runs
 * Everything else is reported as skipped WITH A REASON, never silently
 * dropped: model backed jobs (claude -p) cost weekly quota and belong to
 * the cadence driver, subagents run inside a session, disabled records
 * are off on purpose, and anything with external_actions stays gated.
 *
 * Usage: node _os/automation/bin/run-roster.js [--json]
 * Exit:  0 all ran clean, 1 at least one failed
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { appendRun } = require('../lib/run-record');

const VAULT = path.resolve(__dirname, '..', '..', '..');
const REGISTRY = path.join(VAULT, '12_Brain/registry/automations.json');
const OUT_DIR = path.join(VAULT, '12_Brain/07_Reviews/Cadence');
const TIMEOUT_MS = 120000;

// A command is runnable here only if it is node, needs no supplied values,
// and every remaining token is either the script or an optional flag.
function runnable(cmd) {
  if (!cmd || !/^node /.test(cmd)) return null;
  if (/<[^>]+>/.test(cmd)) return null;               // needs a real argument
  const stripped = cmd.replace(/\[[^\]]*\]/g, '').replace(/\s+/g, ' ').trim();
  return stripped || null;
}

function classify(a) {
  if (!a.enabled) return { skip: 'disabled' };
  if (a.external_actions) return { skip: 'external actions, approval gated' };
  if (a.kind === 'subagent') return { skip: 'subagent, runs inside a session' };
  const cmd = a.command || '';
  if (/claude -p/.test(cmd)) return { skip: 'model backed, costs weekly quota' };
  if (/run-roster.js/.test(cmd)) return { skip: 'this runner; running it from itself recursed 2026-09-17' };
  const run = runnable(cmd);
  if (!run) return { skip: cmd ? 'needs arguments' : 'no command' };
  return { run };
}

function main() {
  const reg = JSON.parse(fs.readFileSync(REGISTRY, 'utf8'));
  const started = new Date();
  const ran = [];
  const skipped = [];

  for (const a of reg.automations) {
    const c = classify(a);
    if (c.skip) { skipped.push({ id: a.id, reason: c.skip }); continue; }

    const t0 = Date.now();
    const startedAt = new Date().toISOString();
    let exit = 0;
    let note = '';
    try {
      execSync(c.run, { cwd: VAULT, timeout: TIMEOUT_MS, stdio: 'pipe' });
    } catch (err) {
      exit = Number.isInteger(err.status) ? err.status : 1;
      note = (err.stderr ? String(err.stderr) : err.message || '').split('\n')[0].slice(0, 180);
    }
    const ms = Date.now() - t0;
    // House convention across this vault: exit 2 is a successful run
    // reporting bad news, not a crash. daily-sweep and connector-health
    // both use it (connector-health: process.exit(fresh.length ? 0 : 2)).
    // Treat it as its own state so real failures stay visible.
    const ok = exit === 0 || exit === 2;
    const state = exit === 0 ? 'ok' : exit === 2 ? 'warn' : 'failed';
    ran.push({ id: a.id, name: a.name, exit, ms, ok, state, note });

    try {
      appendRun({
        agent_id: a.id, started: startedAt, exit_code: exit,
        status: state === 'failed' ? 'failed' : 'ok',
        artifact: Array.isArray(a.outputs) ? (a.outputs[0] || null) : null,
        note: note || (ok ? '' : 'nonzero exit'),
      });
    } catch (e) { console.error(`run-record failed for ${a.id}: ${e.message}`); }
  }

  const failed = ran.filter((r) => r.state === 'failed');
  const warned = ran.filter((r) => r.state === 'warn');
  const date = started.toISOString().slice(0, 10);

  const md = [
    '---', 'note_type: review', 'status: active', `date: ${date}`, `updated: ${date}`,
    'tags:', '  - cadence', '  - agents', '  - momentum',
    'source_refs:', '  - 12_Brain/registry/automations.json',
    '  - _os/automation/bin/run-roster.js', '  - _os/automation/runs.jsonl',
    '---', '',
    `# Roster run, ${date}`, '',
    `**${ran.length} ran, ${failed.length} failed, ${warned.length} reporting bad news, ` +
      `${skipped.length} skipped.** Free tier only: no model quota spent.`, '',
    '## Ran', '',
    '| Agent | Exit | ms | Result |', '|---|---|---|---|',
    ...ran.map((r) => `| ${r.id} | ${r.exit} | ${r.ms} | ${r.state === 'warn' ? 'ran, reporting bad news' : r.state === 'ok' ? 'ok' : 'FAILED ' + r.note} |`),
    '', '## Skipped, with reason', '',
    '| Agent | Reason |', '|---|---|',
    ...skipped.map((s) => `| ${s.id} | ${s.reason} |`),
    '', '## What this does not run', '',
    'Model backed cadence jobs, subagents, anything with external actions, and',
    'anything disabled. Those are deliberate: the first two cost weekly quota',
    'and the third is approval gated. Run the cadence driver for those.', '',
  ].join('\n');

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const outFile = path.join(OUT_DIR, `${date} - roster run.md`);
  fs.writeFileSync(outFile, md);

  if (process.argv.includes('--json')) {
    console.log(JSON.stringify({ ran, skipped, failed: failed.length, report: outFile }, null, 2));
  } else {
    console.log(`roster: ${ran.length} ran, ${failed.length} failed, ${warned.length} warn, ${skipped.length} skipped`);
    for (const f of failed) console.log(`  FAILED ${f.id} exit=${f.exit} ${f.note}`);
    console.log(`  report: ${path.relative(VAULT, outFile)}`);
  }
  process.exit(failed.length ? 1 : 0);
}

main();
