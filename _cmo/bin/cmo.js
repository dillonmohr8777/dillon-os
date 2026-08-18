#!/usr/bin/env node
/**
 * CMO OS command line.
 *
 * Every capability the web UI has is reachable here, on purpose. A marketing
 * platform you cannot drive from a script is a platform you cannot put in a
 * cron job, a CI check, or another agent's tool list - which is the specific
 * complaint levelled at the closed incumbent: "no public API, no MCP server,
 * and no Zapier or Make hooks, so you cannot orchestrate its agents from your
 * own stack."
 *
 *   cmo demo                          seed a demo workspace and run the pipeline
 *   cmo doctor                        provider, connectors, budgets, approvals needed
 *   cmo workspaces                    list workspaces
 *   cmo seed --ws <id> --url <url>    create a workspace from a URL
 *   cmo agents [--lane <lane>]        the roster
 *   cmo run <agent> --ws <id>         run one agent
 *   cmo cycle --ws <id>               run every agent whose cadence is due
 *   cmo runs --ws <id>                recent runs
 *   cmo explain <runId> --ws <id>     every step, source and cost of one run
 *   cmo replay <runId> --ws <id>      re-run, reusing unchanged steps
 *   cmo approvals --ws <id>           the approval board
 *   cmo approve <id> --ws <id> --by <name>
 *   cmo reject  <id> --ws <id> --by <name> [--note "..."]
 *   cmo cost --ws <id>                the dollar ledger
 *   cmo geo --ws <id>                 an AI-visibility scan
 *   cmo robots --ws <id>              generate/audit the AI crawler policy
 *   cmo serve                         start the HUD
 */

import process from 'node:process';
import { createApp } from '../lib/app.js';
import { DEMO_WORKSPACE, DEMO_PROFILE, DEMO_VOICE, DEMO_RECONCILIATION } from '../lib/connectors/fixtures.js';
import { ROSTER, LANES, describeAgentList } from '../lib/agents/registry-view.js';
import { explainRun } from '../lib/runtime/journal.js';
import { rollup } from '../lib/runtime/budget.js';
import { robotsPolicy, auditRobots } from '../lib/geo/crawlers.js';
import { marginOfError } from '../lib/geo/stats.js';

const CSI = `${String.fromCharCode(27)}[`;
const C = {
  reset: `${CSI}0m`, dim: `${CSI}2m`, bold: `${CSI}1m`,
  red: `${CSI}31m`, green: `${CSI}32m`, yellow: `${CSI}33m`, blue: `${CSI}36m`, magenta: `${CSI}35m`,
};
const useColor = process.stdout.isTTY && !process.env.NO_COLOR;
const c = (color, s) => (useColor ? `${C[color]}${s}${C.reset}` : String(s));

function parseArgs(argv) {
  const positional = [];
  const flags = {};
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('--')) flags[key] = true;
      else { flags[key] = next; i += 1; }
    } else positional.push(a);
  }
  return { positional, flags };
}

const { positional, flags } = parseArgs(process.argv.slice(2));
const command = positional[0] || 'help';

function die(message, code = 1) {
  process.stderr.write(`${c('red', 'error')} ${message}\n`);
  process.exit(code);
}

function heading(text) {
  process.stdout.write(`\n${c('bold', text)}\n${c('dim', '─'.repeat(Math.min(72, text.length + 8)))}\n`);
}

function table(rows, columns) {
  if (!rows.length) { process.stdout.write(`${c('dim', '  (none)')}\n`); return; }
  const widths = columns.map((col) => Math.max(col.label.length, ...rows.map((r) => String(col.get(r) ?? '').length)));
  process.stdout.write(`  ${columns.map((col, i) => c('dim', col.label.padEnd(widths[i]))).join('  ')}\n`);
  for (const row of rows) {
    process.stdout.write(`  ${columns.map((col, i) => {
      const raw = String(col.get(row) ?? '');
      const padded = raw.padEnd(widths[i]);
      return col.color ? c(col.color(row), padded) : padded;
    }).join('  ')}\n`);
  }
}

async function main() {
  if (command === 'help' || flags.help) return printHelp();

  // The demo runs entirely on committed fixtures: no network, no credentials,
  // no dependency on a real site being reachable. That is the whole point of
  // fixture mode being a first-class product mode rather than a test double.
  const app = createApp({
    root: flags.data ? String(flags.data) : null,
    forceFixtures: command === 'demo' && !flags.live ? ['crawl'] : [],
  });

  switch (command) {
    case 'doctor': return doctor(app);
    case 'workspaces': return listWorkspaces(app);
    case 'agents': return listAgents();
    case 'seed': return seed(app);
    case 'demo': return demo(app);
    case 'run': return runAgent(app);
    case 'cycle': return cycle(app);
    case 'runs': return listRuns(app);
    case 'explain': return explain(app);
    case 'replay': return replay(app);
    case 'approvals': return board(app);
    case 'approve': return decide(app, 'approve');
    case 'reject': return decide(app, 'reject');
    case 'cost': return cost(app);
    case 'geo': return geo(app);
    case 'robots': return robots(app);
    case 'serve': {
      const { startServer } = await import('./serve.js');
      return startServer(app);
    }
    default: return die(`unknown command: ${command}. Run \`cmo help\`.`);
  }
}

// ---------------------------------------------------------------------------

function printHelp() {
  process.stdout.write(`
${c('bold', 'CMO OS')} ${c('dim', '- the auditable AI CMO. Multi-client, paid + organic, every claim carries a receipt.')}

${c('bold', 'Getting started')}
  cmo demo                            seed a demo workspace and run the whole pipeline
  cmo doctor                          what is configured, what is degraded, what needs an approval

${c('bold', 'Workspaces')}
  cmo workspaces                      list every client workspace
  cmo seed --ws <id> --url <url>      create a workspace and crawl its site

${c('bold', 'Agents')}
  cmo agents [--lane organic|paid|local|measurement|ops]
  cmo run <agentId> --ws <id> [--dry] [--param.key value]
  cmo cycle --ws <id> [--cadence daily|weekly|monthly]

${c('bold', 'Audit and replay')}
  cmo runs --ws <id> [--limit 20]
  cmo explain <runId> --ws <id>       every step, model, source and dollar
  cmo replay <runId> --ws <id>        re-run reusing unchanged steps

${c('bold', 'Approvals')} ${c('dim', '(nothing leaves the system without one)')}
  cmo approvals --ws <id>
  cmo approve <approvalId> --ws <id> --by <your-name> [--note "..."]
  cmo reject  <approvalId> --ws <id> --by <your-name> [--note "..."]

${c('bold', 'Measurement')}
  cmo cost --ws <id>                  real dollars, by model and by agent
  cmo geo --ws <id> [--replicates 5]  AI answer visibility with confidence intervals
  cmo robots --ws <id> [--audit]      AI crawler policy

${c('bold', 'Server')}
  cmo serve                           http://127.0.0.1:4343

${c('dim', 'Provider: set ANTHROPIC_API_KEY for live model calls, or leave it unset to run')}
${c('dim', 'the deterministic offline provider. Everything works either way.')}
`);
}

async function doctor(app) {
  const h = app.health();
  heading('Provider');
  process.stdout.write(`  ${h.provider.mock ? c('yellow', 'mock (offline, deterministic)') : c('green', 'anthropic')}   routing profile: ${c('blue', h.routingProfile)}  ${c('dim', `(available: ${h.routingProfiles.join(', ')})`)}\n`);
  if (h.provider.mock) {
    process.stdout.write(`  ${c('dim', 'No ANTHROPIC_API_KEY found. The full pipeline runs offline on deterministic output;')}\n`);
    process.stdout.write(`  ${c('dim', 'set the key for live model calls. Nothing else needs to change.')}\n`);
  }

  heading('Store');
  process.stdout.write(`  driver ${h.store.driver}   ${c('dim', h.store.root || '(memory)')}\n`);

  heading('Budget caps (per workspace)');
  process.stdout.write(`  daily $${h.budget.dailyUsd}   monthly $${h.budget.monthlyUsd}   per-run $${h.budget.perRunUsd}\n`);

  heading('Connectors');
  table(h.connectors.rows, [
    { label: 'ID', get: (r) => r.id },
    { label: 'LANE', get: (r) => r.lane },
    { label: 'MODE', get: (r) => r.mode, color: (r) => (r.mode === 'live' ? 'green' : r.mode === 'substitute' ? 'blue' : r.mode === 'fixture' ? 'yellow' : 'dim') },
    { label: 'WHY', get: (r) => truncate(r.reason, 62) },
  ]);
  process.stdout.write(`\n  ${c('dim', 'live')} = real credentials · ${c('dim', 'substitute')} = a different real source standing in\n`);
  process.stdout.write(`  ${c('dim', 'fixture')} = committed sample data, labelled in every report · ${c('dim', 'unavailable')} = no data path\n`);

  if (h.connectors.blockingApprovals.length) {
    heading('Start these today - they are calendar time, not engineering time');
    for (const b of h.connectors.blockingApprovals) {
      process.stdout.write(`  ${c('yellow', b.id.padEnd(12))} ${truncate(b.action, 92)}\n`);
    }
  }

  const workspaces = await app.store.listWorkspaces();
  heading(`Workspaces (${workspaces.length})`);
  table(workspaces, [
    { label: 'ID', get: (w) => w.id },
    { label: 'NAME', get: (w) => w.name || '' },
    { label: 'UPDATED', get: (w) => (w.updatedAt || '').slice(0, 16).replace('T', ' ') },
  ]);
  if (!workspaces.length) process.stdout.write(`\n  ${c('dim', 'Run `cmo demo` to create one.')}\n`);
  process.stdout.write('\n');
}

function listAgents() {
  const lane = flags.lane ? String(flags.lane) : null;
  const rows = describeAgentList().filter((a) => !lane || a.lane === lane);
  heading(`Agent roster (${rows.length}${lane ? ` in ${lane}` : ` across ${LANES.length} lanes`})`);
  for (const l of LANES) {
    const set = rows.filter((a) => a.lane === l);
    if (!set.length) continue;
    process.stdout.write(`\n  ${c('bold', l.toUpperCase())}\n`);
    for (const a of set) {
      const riskColor = a.risk === 'high' ? 'red' : a.risk === 'medium' ? 'yellow' : 'dim';
      process.stdout.write(`    ${c('blue', a.id.padEnd(24))} ${a.cadence.padEnd(9)} ${c(riskColor, a.risk.padEnd(7))} ${truncate(a.description, 86)}\n`);
    }
  }
  process.stdout.write(`\n  ${c('dim', 'risk is a property of the EFFECT, not the content. high-risk effects can never be auto-approved.')}\n\n`);
}

async function listWorkspaces(app) {
  const list = await app.store.listWorkspaces();
  heading(`Workspaces (${list.length})`);
  for (const w of list) {
    const ws = app.store.ws(w.id);
    const runs = await ws.list('runs', { limit: 200 });
    const approvals = await ws.list('approvals', { where: { state: 'pending' } });
    const ledger = await ws.read('ledger');
    const spend = rollup(ledger, app.clock.iso());
    process.stdout.write(`  ${c('bold', w.id.padEnd(20))} ${String(w.name || '').padEnd(24)} ${String(runs.length).padStart(4)} runs  ${String(approvals.length).padStart(3)} pending  $${spend.monthUsd.toFixed(4)} this month\n`);
  }
  process.stdout.write('\n');
}

async function ensureWs(app, wsId) {
  if (!wsId) die('--ws <workspaceId> is required. `cmo workspaces` lists them.');
  const found = await app.store.getWorkspace(wsId);
  if (!found) die(`no workspace "${wsId}". Run \`cmo workspaces\`, or \`cmo demo\` to create one.`);
  return app.workspace(wsId, { routingProfile: flags.profile ? String(flags.profile) : null });
}

async function seed(app) {
  const wsId = String(flags.ws || '');
  const url = flags.url ? String(flags.url) : null;
  if (!wsId) die('--ws <id> is required');
  await app.store.upsertWorkspace({ id: wsId, name: flags.name ? String(flags.name) : wsId, kind: 'client' });
  const w = app.workspace(wsId);
  if (url) {
    await w.ws.putSingleton('profile', { name: flags.name ? String(flags.name) : wsId, url });
    process.stdout.write(`  ${c('green', 'created')} ${wsId}; crawling ${url}\n`);
    const res = await w.engine.run({ agentId: 'site-intel', params: { url } });
    printRunResult(res);
  } else {
    process.stdout.write(`  ${c('green', 'created')} ${wsId}  ${c('dim', '(no --url given, so no profile was built)')}\n`);
  }
}

async function demo(app) {
  heading('Seeding demo workspace');
  await app.store.upsertWorkspace(DEMO_WORKSPACE);
  const w = app.workspace(DEMO_WORKSPACE.id);
  await w.ws.putSingleton('profile', DEMO_PROFILE);
  await w.ws.putSingleton('voice', DEMO_VOICE);
  process.stdout.write(`  ${c('green', DEMO_WORKSPACE.id)} - ${DEMO_PROFILE.name}, ${DEMO_PROFILE.serviceArea}\n`);
  process.stdout.write(`  ${c('dim', `provider: ${app.provider.name}${app.provider.isMock ? ' (offline, deterministic)' : ''}`)}\n`);

  const sequence = [
    ['site-intel', { url: DEMO_PROFILE.url }],
    ['seo-technical', { url: DEMO_PROFILE.url }],
    ['aeo-engineer', { url: DEMO_PROFILE.url }],
    ['geo-visibility', { replicates: Number(flags.replicates || 3), engines: ['chatgpt', 'gemini'] }],
    ['content-brief', { topic: 'furnace making a banging noise' }],
    ['social-writer', {}],
    ['community-watch', {}],
    ['local-seo', {}],
    ['gbp-post-writer', {}],
    ['paid-search-analyst', { days: 30 }],
    ['paid-social-analyst', { days: 30 }],
    ['ad-copy-lab', { terms: ['emergency furnace repair philadelphia', 'flat rate hvac pricing'] }],
    ['competitor-watch', {}],
    ['attribution-reconciler', DEMO_RECONCILIATION],
  ];

  heading(`Running ${sequence.length} agents`);
  const results = [];
  for (const [agentId, params] of sequence) {
    const res = await w.engine.run({ agentId, params });
    results.push(res);
    const status = res.status === 'ok' ? c('green', 'ok  ') : res.status === 'skipped' ? c('yellow', 'skip') : c('red', 'fail');
    process.stdout.write(`  ${status} ${agentId.padEnd(24)} ${String(res.artifacts.length).padStart(2)} artifacts  $${(res.usd || 0).toFixed(4)}  ${c('dim', truncate(res.summary || res.skipReason || res.error?.message || '', 58))}\n`);
  }

  const b = await w.approvals.board();
  const ledger = rollup(await w.ws.read('ledger'), app.clock.iso());
  const blocked = (await w.ws.list('artifacts', { where: { status: 'blocked' } })).length;

  heading('Result');
  process.stdout.write(`  runs        ${results.length} (${results.filter((r) => r.status === 'ok').length} ok, ${results.filter((r) => r.status === 'skipped').length} skipped, ${results.filter((r) => r.status === 'failed').length} failed)\n`);
  process.stdout.write(`  artifacts   ${results.reduce((a, r) => a + r.artifacts.length, 0)} (${blocked} blocked by a guardrail)\n`);
  process.stdout.write(`  approvals   ${b.counts.pending} waiting on a human, ${b.counts.approved} approved\n`);
  process.stdout.write(`  spend       $${ledger.totalUsd.toFixed(4)} across ${ledger.calls} model calls\n`);
  process.stdout.write(`  by model    ${Object.entries(ledger.byModel).map(([m, v]) => `${m.replace('claude-', '')} $${v.toFixed(4)}`).join('  ') || '(none)'}\n`);

  heading('Next');
  process.stdout.write(`  cmo approvals --ws ${DEMO_WORKSPACE.id}      ${c('dim', 'see what is waiting on you')}\n`);
  process.stdout.write(`  cmo runs --ws ${DEMO_WORKSPACE.id}           ${c('dim', 'then `cmo explain <runId>` for step-level audit')}\n`);
  process.stdout.write(`  cmo serve                          ${c('dim', 'the dashboard')}\n\n`);
}

function collectParams() {
  const params = {};
  for (const [k, v] of Object.entries(flags)) {
    if (!k.startsWith('param.')) continue;
    const key = k.slice('param.'.length);
    params[key] = v === 'true' ? true : v === 'false' ? false : (Number.isFinite(Number(v)) && v !== true ? Number(v) : v);
  }
  return params;
}

async function runAgent(app) {
  const agentId = positional[1];
  if (!agentId) die('usage: cmo run <agentId> --ws <id>');
  const w = await ensureWs(app, flags.ws && String(flags.ws));
  const params = collectParams();
  if (agentId === 'attribution-reconciler' && !params.platformConversions) Object.assign(params, DEMO_RECONCILIATION);
  const res = await w.engine.run({ agentId, params, dryRun: Boolean(flags.dry) });
  printRunResult(res);
}

async function cycle(app) {
  const w = await ensureWs(app, flags.ws && String(flags.ws));
  const cadence = flags.cadence ? String(flags.cadence) : 'daily';
  const due = ROSTER.filter((a) => a.cadence === cadence);
  heading(`Cycle: ${cadence} (${due.length} agents)`);
  for (const a of due) {
    const res = await w.engine.run({ agentId: a.id, params: {} });
    const status = res.status === 'ok' ? c('green', 'ok  ') : res.status === 'skipped' ? c('yellow', 'skip') : c('red', 'fail');
    process.stdout.write(`  ${status} ${a.id.padEnd(24)} ${c('dim', truncate(res.summary || res.skipReason || '', 66))}\n`);
  }
  process.stdout.write('\n');
}

function printRunResult(res) {
  const status = res.status === 'ok' ? c('green', res.status) : res.status === 'skipped' ? c('yellow', res.status) : c('red', res.status);
  heading(`Run ${res.id} - ${res.agentId} [${res.status}]`);
  process.stdout.write(`  status      ${status}\n`);
  if (res.summary) process.stdout.write(`  summary     ${res.summary}\n`);
  if (res.skipReason) process.stdout.write(`  skipped     ${res.skipReason}\n`);
  if (res.error) process.stdout.write(`  error       ${c('red', res.error.code)} ${res.error.message}\n`);
  process.stdout.write(`  steps       ${res.steps} (${res.liveSteps} live, ${res.replayedSteps} replayed)\n`);
  process.stdout.write(`  cost        $${(res.usd || 0).toFixed(4)}  ${res.tokensIn || 0} in / ${res.tokensOut || 0} out\n`);
  process.stdout.write(`  artifacts   ${res.artifacts.length}\n`);
  for (const a of res.artifacts) {
    process.stdout.write(`              ${a.passed ? c('green', 'pass') : c('red', 'BLOCKED')} ${a.kind.padEnd(14)} ${truncate(a.title, 56)}\n`);
  }
  if (res.approvals?.length) process.stdout.write(`  approvals   ${res.approvals.length} opened\n`);
  process.stdout.write(`\n  ${c('dim', `cmo explain ${res.id} --ws <id>`)}\n\n`);
}

async function listRuns(app) {
  const w = await ensureWs(app, flags.ws && String(flags.ws));
  const runs = await w.ws.list('runs', { limit: Number(flags.limit || 20) });
  heading(`Runs (${runs.length})`);
  table(runs, [
    { label: 'RUN', get: (r) => r.id },
    { label: 'AGENT', get: (r) => r.agentId },
    { label: 'STATUS', get: (r) => r.status, color: (r) => (r.status === 'ok' ? 'green' : r.status === 'skipped' ? 'yellow' : 'red') },
    { label: 'STEPS', get: (r) => `${r.liveSteps ?? 0}L/${r.replayedSteps ?? 0}R` },
    { label: 'COST', get: (r) => `$${(r.usd || 0).toFixed(4)}` },
    { label: 'WHEN', get: (r) => (r.startedAt || '').slice(5, 16).replace('T', ' ') },
    { label: 'SUMMARY', get: (r) => truncate(r.summary || r.skipReason || '', 46) },
  ]);
  process.stdout.write('\n');
}

async function explain(app) {
  const runId = positional[1];
  if (!runId) die('usage: cmo explain <runId> --ws <id>');
  const w = await ensureWs(app, flags.ws && String(flags.ws));
  const out = await w.engine.explain(runId);
  if (!out.header) die(`no run ${runId} in this workspace`);

  heading(`Run ${runId} - ${out.header.agentId}`);
  process.stdout.write(`  status ${out.header.status}   context ${c('dim', out.header.contextHash || '?')}${out.header.replayOf ? `   replay of ${out.header.replayOf}` : ''}\n`);
  process.stdout.write(`  ${out.totals.steps} steps: ${c('green', `${out.totals.live} live`)}, ${c('blue', `${out.totals.replayed} replayed`)}, ${out.totals.failed} failed\n`);
  process.stdout.write(`  $${out.totals.usd.toFixed(4)}   ${out.totals.tokensIn} in / ${out.totals.tokensOut} out   ${out.totals.ms}ms\n`);

  heading('Steps');
  table(out.steps, [
    { label: '#', get: (s) => s.seq },
    { label: 'STEP', get: (s) => truncate(s.name, 34) },
    { label: 'SRC', get: (s) => s.source, color: (s) => (s.source === 'replay' ? 'blue' : 'dim') },
    { label: 'OK', get: (s) => (s.status === 'ok' ? 'ok' : 'ERR'), color: (s) => (s.status === 'ok' ? 'green' : 'red') },
    { label: 'MODEL', get: (s) => (s.model || '').replace('claude-', '') },
    { label: 'COST', get: (s) => `$${(s.usd || 0).toFixed(4)}` },
    { label: 'MS', get: (s) => s.ms },
    { label: 'INPUT', get: (s) => s.inputHash?.slice(0, 8) || '' },
  ]);

  if (out.notes.length) {
    heading('Notes');
    for (const n of out.notes) process.stdout.write(`  ${c('dim', n.name.padEnd(12))} ${truncate(JSON.stringify(rest(n)), 96)}\n`);
  }
  if (out.sources.length) {
    heading(`Sources (${out.sources.length})`);
    for (const s of out.sources) process.stdout.write(`  ${truncate(s.url || s.ref || JSON.stringify(s), 96)}\n`);
  }
  process.stdout.write(`\n  ${c('dim', `cmo replay ${runId} --ws ${w.id}   # re-run, reusing every unchanged step`)}\n\n`);
}

function rest(n) { const { name, ...r } = n; return r; }

async function replay(app) {
  const runId = positional[1];
  if (!runId) die('usage: cmo replay <runId> --ws <id>');
  const w = await ensureWs(app, flags.ws && String(flags.ws));
  const prior = await w.ws.get('runs', runId);
  if (!prior) die(`no run ${runId} in this workspace`);
  process.stdout.write(`  replaying ${runId} (${prior.agentId})\n`);
  const res = await w.engine.run({ agentId: prior.agentId, params: prior.result?.params || {}, replayOf: runId });
  printRunResult(res);
  const saved = (prior.usd || 0) - (res.usd || 0);
  process.stdout.write(`  ${c('green', `reused ${res.replayedSteps} step(s)`)}, saving $${Math.max(0, saved).toFixed(4)} vs the original run\n\n`);
}

async function board(app) {
  const w = await ensureWs(app, flags.ws && String(flags.ws));
  const b = await w.approvals.board();
  heading(`Approval board - ${w.id}`);
  process.stdout.write(`  ${Object.entries(b.counts).map(([k, v]) => `${k} ${v}`).join('   ')}\n`);
  if (b.oldestPendingDays > 0) process.stdout.write(`  ${c('yellow', `oldest pending item is ${b.oldestPendingDays} days old`)}\n`);

  heading('Waiting on you');
  table(b.waitingOnHuman, [
    { label: 'ID', get: (a) => a.id },
    { label: 'RISK', get: (a) => a.risk, color: (a) => (a.risk === 'high' ? 'red' : a.risk === 'medium' ? 'yellow' : 'dim') },
    { label: 'EFFECT', get: (a) => a.effect },
    { label: 'TITLE', get: (a) => truncate(a.title, 40) },
    { label: 'BLOCKED', get: (a) => (a.guardrails?.blocking?.length ? a.guardrails.blocking.map((x) => x.rule).join(',') : ''), color: () => 'red' },
  ]);
  if (b.readyToPublish.length) {
    heading('Approved, ready to publish');
    table(b.readyToPublish, [
      { label: 'ID', get: (a) => a.id },
      { label: 'EFFECT', get: (a) => a.effect },
      { label: 'BY', get: (a) => a.decidedBy || '' },
      { label: 'TITLE', get: (a) => truncate(a.title, 44) },
    ]);
  }
  process.stdout.write(`\n  ${c('dim', `cmo approve <id> --ws ${w.id} --by <your-name>`)}\n`);
  process.stdout.write(`  ${c('dim', 'an agent can never approve its own work; a named human must decide')}\n\n`);
}

async function decide(app, action) {
  const id = positional[1];
  if (!id) die(`usage: cmo ${action} <approvalId> --ws <id> --by <your-name>`);
  const by = flags.by ? String(flags.by) : null;
  if (!by) die('--by <your-name> is required: an approval records who decided it');
  const w = await ensureWs(app, flags.ws && String(flags.ws));
  try {
    const out = action === 'approve'
      ? await w.approvals.approve(id, { by, note: flags.note ? String(flags.note) : '' })
      : await w.approvals.reject(id, { by, note: flags.note ? String(flags.note) : '' });
    process.stdout.write(`  ${c('green', out.state)} ${id} by ${by}\n`);
    if (action === 'approve') process.stdout.write(`  ${c('dim', 'this authorises the effect; performing it is a separate step')}\n`);
  } catch (err) {
    die(`${err.code || 'error'}: ${err.message}`);
  }
}

async function cost(app) {
  const w = await ensureWs(app, flags.ws && String(flags.ws));
  const ledger = await w.ws.read('ledger');
  const r = rollup(ledger, app.clock.iso());
  const caps = w.budget.caps;
  heading(`Cost ledger - ${w.id}`);
  process.stdout.write(`  today       $${r.todayUsd.toFixed(4)} / $${caps.dailyUsd} cap   ${bar(r.todayUsd / caps.dailyUsd)}\n`);
  process.stdout.write(`  this month  $${r.monthUsd.toFixed(4)} / $${caps.monthlyUsd} cap  ${bar(r.monthUsd / caps.monthlyUsd)}\n`);
  process.stdout.write(`  all time    $${r.totalUsd.toFixed(4)} across ${r.calls} calls\n`);
  const savings = ledger.reduce((a, e) => a + (e.cacheSavingsUsd || 0), 0);
  if (savings > 0) process.stdout.write(`  ${c('green', `prompt caching saved $${savings.toFixed(4)}`)}\n`);
  heading('By model');
  for (const [m, v] of Object.entries(r.byModel).sort((a, b) => b[1] - a[1])) {
    process.stdout.write(`  ${m.padEnd(22)} $${v.toFixed(4)}\n`);
  }
  heading('By agent');
  for (const [a, v] of Object.entries(r.byAgent).sort((x, y) => y[1] - x[1])) {
    process.stdout.write(`  ${a.padEnd(26)} $${v.toFixed(4)}\n`);
  }
  process.stdout.write(`\n  ${c('dim', 'Dollars, not credits. Every figure derives from the token counts the API returned.')}\n\n`);
}

function bar(fraction, width = 24) {
  const f = Math.max(0, Math.min(1, fraction || 0));
  const filled = Math.round(f * width);
  const color = f > 0.9 ? 'red' : f > 0.7 ? 'yellow' : 'green';
  return `${c(color, '█'.repeat(filled))}${c('dim', '░'.repeat(width - filled))} ${(f * 100).toFixed(0)}%`;
}

async function geo(app) {
  const w = await ensureWs(app, flags.ws && String(flags.ws));
  const replicates = Number(flags.replicates || 3);
  const engines = flags.engines ? String(flags.engines).split(',') : ['chatgpt', 'gemini'];
  process.stdout.write(`  scanning with R=${replicates} across ${engines.join(', ')}\n`);
  const res = await w.engine.run({ agentId: 'geo-visibility', params: { replicates, engines } });
  if (res.status !== 'ok') return printRunResult(res);
  const art = await w.ws.get('artifacts', res.artifacts[0]?.id);
  const scan = art?.data?.scan;
  if (!scan) return printRunResult(res);

  heading(`AI answer visibility - ${scan.promptSet.setId} v${scan.promptSet.version}`);
  process.stdout.write(`  instrument ${c('dim', scan.promptSet.sha256.slice(0, 16))}   ${res.result.runs} runs   MoE ±${(marginOfError(res.result.runs / engines.length) * 100).toFixed(1)}pp\n`);
  for (const e of scan.engines) {
    process.stdout.write(`\n  ${c('bold', `${e.engine} (${e.channel})`)}\n`);
    process.stdout.write(`    presence   ${c('blue', `${(e.visibility.value * 100).toFixed(1)}%`)} ${c('dim', `[${(e.visibility.low * 100).toFixed(1)}–${(e.visibility.high * 100).toFixed(1)}] n_eff ${e.visibility.nEff.toFixed(0)}`)}\n`);
    process.stdout.write(`    coverage   ${(e.visibility.coverage * 100).toFixed(0)}% of prompts mention the brand at all\n`);
    process.stdout.write(`    citations  ${(e.citation.presenceRate * 100).toFixed(0)}% of answers cite us; normalized share ${e.citation.shareNormalized}\n`);
    process.stdout.write(`    SOV        brand ${(e.shareOfVoice.brand * 100).toFixed(0)}%  other ${(e.shareOfVoice.other * 100).toFixed(0)}%\n`);
    process.stdout.write(`    lever      ${truncate(e.retrieval.lever.message, 92)}\n`);
    process.stdout.write(`    control    ${e.control.runs} runs, brand presence ${e.control.presenceRate == null ? 'n/a' : `${(e.control.presenceRate * 100).toFixed(0)}%`}\n`);
  }
  if (scan.warnings.length) {
    heading('Warnings');
    for (const wn of scan.warnings) process.stdout.write(`  ${c(wn.severity === 'warn' ? 'yellow' : 'dim', `[${wn.severity}]`)} ${wn.code}: ${truncate(wn.message, 88)}\n`);
  }
  process.stdout.write(`\n  ${c('dim', scan.crossEngine.note)}\n\n`);
}

async function robots(app) {
  const w = await ensureWs(app, flags.ws && String(flags.ws));
  const profile = await w.ws.getSingleton('profile');
  const origin = profile?.url ? new URL(profile.url).origin : 'https://example.com';
  if (flags.audit) {
    const conn = app.connectors.crawl;
    let res;
    try {
      res = await conn.robots({ url: origin });
    } catch (err) {
      // A workspace whose site is unreachable should be told that, not handed a
      // stack trace. The generated policy below is still useful without it.
      process.stdout.write(`\n  ${c('yellow', 'could not fetch')} ${origin}/robots.txt - ${err.message}\n`);
      process.stdout.write(`  ${c('dim', 'Nothing to audit. Here is the policy this site should have:')}\n\n`);
      process.stdout.write(`${robotsPolicy({ stance: 'retrieval-friendly', sitemapUrl: `${origin}/sitemap.xml` })}\n`);
      return;
    }
    const audit = auditRobots(res.body || '');
    heading(`robots.txt audit - ${origin} (${res.provenance.mode})`);
    for (const f of audit.findings) {
      const color = f.severity === 'critical' ? 'red' : f.severity === 'high' ? 'yellow' : 'dim';
      process.stdout.write(`  ${c(color, `[${f.severity}]`.padEnd(11))} ${(f.token || '').padEnd(18)} ${truncate(f.message, 82)}\n`);
    }
    process.stdout.write('\n');
    return;
  }
  process.stdout.write(`${robotsPolicy({ stance: flags.stance ? String(flags.stance) : 'retrieval-friendly', sitemapUrl: `${origin}/sitemap.xml` })}\n`);
}

function truncate(s, n) {
  const str = String(s ?? '').replace(/\s+/g, ' ').trim();
  return str.length <= n ? str : `${str.slice(0, n - 1)}…`;
}

main().catch((err) => {
  process.stderr.write(`${c('red', 'fatal')} ${err?.stack || err}\n`);
  process.exit(1);
});
