#!/usr/bin/env node
'use strict';
/**
 * The runtime half of the command channel: phone to cloud to runtime.
 *
 * The console mirror is read only because a mirror must not write into a
 * runtime it does not control. So the phone does not reach in; it leaves an
 * intent in a queue, and THIS process, running on the machine that actually
 * holds the credentials, decides whether to honour it. That direction of
 * control is the entire safety property. It also fails safe: when the
 * runtime is off, commands simply sit unclaimed, and the console says so.
 *
 * What it will execute, and nothing else:
 *   run_agent    { agent_id }  run one roster agent, free tier only
 *   toggle_agent { agent_id, enabled }  flip an agent's enabled flag
 *
 * Deliberately absent: any kind that runs arbitrary text, shell, or a model
 * prompt. A queue that can execute anything is a remote shell with extra
 * steps. New kinds get added here, in code, reviewed, never by payload.
 *
 * Authority rules, enforced here rather than trusted from the request:
 *   - Only the operator tenant may queue an executable command. A client
 *     tenant's row is marked needs_approval and left for a human.
 *   - The agent named must already exist in the registry and be enabled.
 *   - external_actions agents are refused outright, whoever asked.
 *
 * Usage:
 *   node _os/automation/bin/command-poller.js [--once] [--dry-run]
 *
 * Needs CLOUDFLARE_API_TOKEN (D1 Edit) + CLOUDFLARE_ACCOUNT_ID. Without
 * them it reports that and exits 0, same as sync-cloud-console.js.
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { appendRun } = require('../lib/run-record');

const VAULT = path.resolve(__dirname, '..', '..', '..');
const REGISTRY = path.join(VAULT, '12_Brain/registry/automations.json');
const DB_ID = 'e9e219c7-740c-4573-8008-f192317ed992';
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN || null;
const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || null;
const OPERATOR = 'momentum';
const POLL_MS = 30000;
const DRY = process.argv.includes('--dry-run');

const KINDS = new Set(['run_agent', 'toggle_agent']);

async function d1(sql, params) {
  const r = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/d1/database/${DB_ID}/query`,
    {
      method: 'POST',
      headers: { authorization: `Bearer ${API_TOKEN}`, 'content-type': 'application/json' },
      body: JSON.stringify(params ? { sql, params } : { sql }),
    },
  );
  const j = await r.json();
  if (!j.success) throw new Error(`D1: ${JSON.stringify(j.errors)}`);
  return j.result;
}

function registry() {
  return JSON.parse(fs.readFileSync(REGISTRY, 'utf8'));
}

// Same rule the roster runner uses: node, no required <placeholders>.
function runnableCommand(cmd) {
  if (!cmd || !/^node /.test(cmd)) return null;
  if (/<[^>]+>/.test(cmd)) return null;
  return cmd.replace(/\[[^\]]*\]/g, '').replace(/\s+/g, ' ').trim() || null;
}

/** Decide, locally, whether a queued command may run. Never trust the row. */
function authorize(cmd, reg) {
  if (!KINDS.has(cmd.kind)) return { refuse: `unknown kind "${cmd.kind}"` };
  if (cmd.created_by !== OPERATOR && !cmd.approved_by) {
    return { defer: 'queued by a client tenant, needs operator approval' };
  }
  let payload;
  try { payload = JSON.parse(cmd.payload || '{}'); } catch { return { refuse: 'unparseable payload' }; }
  const agent = reg.automations.find((a) => a.id === payload.agent_id);
  if (!agent) return { refuse: `no such agent "${payload.agent_id}"` };
  if (agent.external_actions) return { refuse: `${agent.id} has external actions, approval gated` };

  if (cmd.kind === 'toggle_agent') {
    if (typeof payload.enabled !== 'boolean') return { refuse: 'enabled must be true or false' };
    return { ok: { agent, toggle: payload.enabled } };
  }
  if (!agent.enabled) return { refuse: `${agent.id} is disabled` };
  const run = runnableCommand(agent.command);
  if (!run) return { refuse: `${agent.id} is not free tier runnable, needs a model or arguments` };
  return { ok: { agent, run } };
}

function execute(decision) {
  const { agent, run, toggle } = decision;

  if (typeof toggle === 'boolean') {
    const reg = registry();
    const rec = reg.automations.find((a) => a.id === agent.id);
    rec.enabled = toggle;
    reg.updated = new Date().toISOString().slice(0, 10);
    const tmp = `${REGISTRY}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(reg, null, 2) + '\n');
    fs.renameSync(tmp, REGISTRY);
    return `${agent.id} enabled=${toggle}`;
  }

  const startedAt = new Date().toISOString();
  let exit = 0;
  let note = '';
  try {
    // execFileSync, not execSync: no shell, so nothing in the command string
    // can be interpreted as a shell metacharacter. The string comes from the
    // registry rather than the queued payload, so it is not attacker reachable
    // today, but the queue is exactly the kind of surface where that stops
    // being true quietly. ponytail: whitespace split is fine because registry
    // script paths have no spaces; switch to an argv array in the registry if
    // that ever changes.
    const [bin, ...args] = run.split(/\s+/);
    execFileSync(bin, args, { cwd: VAULT, timeout: 120000, stdio: 'pipe' });
  } catch (err) {
    exit = Number.isInteger(err.status) ? err.status : 1;
    note = String(err.stderr || err.message || '').split('\n')[0].slice(0, 180);
  }
  // exit 2 is this vault's "ran fine, reporting bad news".
  const failed = exit !== 0 && exit !== 2;
  try {
    appendRun({
      agent_id: agent.id, started: startedAt, exit_code: exit,
      status: failed ? 'failed' : 'ok',
      artifact: Array.isArray(agent.outputs) ? agent.outputs[0] || null : null,
      note: note || 'via command channel',
    });
  } catch (e) { console.error(`  run-record: ${e.message}`); }
  return `${agent.id} exit=${exit}${note ? ` (${note})` : ''}`;
}

async function pass() {
  const res = await d1(
    "SELECT id, tenant, created_by, kind, payload, approved_by FROM commands WHERE status='pending' ORDER BY created_at LIMIT 10",
  );
  const rows = (res[0] && res[0].results) || [];
  if (!rows.length) { console.log('  no pending commands'); return 0; }

  const reg = registry();
  for (const cmd of rows) {
    const d = authorize(cmd, reg);
    const now = new Date().toISOString();

    if (d.refuse) {
      console.log(`  REFUSED ${cmd.id}: ${d.refuse}`);
      if (!DRY) await d1(`UPDATE commands SET status='rejected', completed_at=?, receipt=? WHERE id=?`,
        [now, d.refuse, cmd.id]);
      continue;
    }
    if (d.defer) {
      console.log(`  DEFERRED ${cmd.id}: ${d.defer}`);
      if (!DRY) await d1(`UPDATE commands SET status='needs_approval', receipt=? WHERE id=?`,
        [d.defer, cmd.id]);
      continue;
    }

    console.log(`  RUN ${cmd.id}: ${cmd.kind} ${d.ok.agent.id}${DRY ? ' (dry run)' : ''}`);
    if (DRY) continue;

    await d1(`UPDATE commands SET status='claimed', claimed_at=? WHERE id=?`, [now, cmd.id]);
    let receipt, status = 'done';
    try { receipt = execute(d.ok); }
    catch (e) { receipt = `failed: ${e.message}`; status = 'failed'; }
    await d1(`UPDATE commands SET status=?, completed_at=?, receipt=? WHERE id=?`,
      [status, new Date().toISOString(), receipt, cmd.id]);
    console.log(`    -> ${receipt}`);
  }
  return rows.length;
}

async function main() {
  if (!API_TOKEN || !ACCOUNT_ID) {
    console.log('command-poller: skipped, CLOUDFLARE_API_TOKEN / CLOUDFLARE_ACCOUNT_ID not set');
    process.exit(0);
  }
  if (process.argv.includes('--once')) { await pass(); return; }
  console.log(`command-poller: polling every ${POLL_MS / 1000}s, Ctrl+C to stop`);
  for (;;) {
    try { await pass(); } catch (e) { console.error(`  poll failed: ${e.message}`); }
    await new Promise((r) => setTimeout(r, POLL_MS));
  }
}

main().catch((e) => { console.error(`command-poller: ${e.message}`); process.exit(1); });
