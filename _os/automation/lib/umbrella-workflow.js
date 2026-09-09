'use strict';

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { repoPath, readJson, writeJson, todayISO, nowISO } = require('./fsutil');

function loadWorkflow(file = repoPath('12_Brain/registry/umbrella-workflow.json')) {
  const wf = readJson(file, null);
  if (!wf || !Array.isArray(wf.phases)) {
    throw new Error(`invalid umbrella workflow: ${file}`);
  }
  return wf;
}

function isWeekday(date = new Date()) {
  const d = date.getUTCDay();
  return d >= 1 && d <= 5;
}

function shouldRunPhase(phase, opts = {}) {
  if (phase.weekdays_only && !opts.weekdaysOnly) return false;
  if (opts.phase && phase.phase_id !== opts.phase) return false;
  if (opts.skipPhases && opts.skipPhases.has(phase.phase_id)) return false;
  return true;
}

function expandCommand(lane, opts) {
  if (lane.kind !== 'command') return null;
  const cmd = [...lane.command];
  if (lane.optional_flag && opts.flags && opts.flags.has(lane.optional_flag.replace(/^--/, ''))) {
    cmd.push(lane.optional_flag);
  }
  return cmd;
}

function runCommand(cmd, { cwd, timeoutSeconds = 120, blockedExit = [] } = {}) {
  return new Promise((resolve) => {
    const started = Date.now();
    const exe = cmd[0];
    const args = cmd.slice(1);
    const child = spawn(exe, args, {
      cwd,
      env: process.env,
      shell: false,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (d) => { stdout += d; });
    child.stderr.on('data', (d) => { stderr += d; });
    const timer = setTimeout(() => {
      child.kill('SIGTERM');
      resolve({
        status: 'timeout',
        exit_code: null,
        duration_ms: Date.now() - started,
        stdout: stdout.slice(0, 8000),
        stderr: stderr.slice(0, 4000),
      });
    }, timeoutSeconds * 1000);
    child.on('close', (code) => {
      clearTimeout(timer);
      let status = 'ok';
      if (code !== 0) {
        status = blockedExit.includes(code) ? 'blocked' : 'failed';
      }
      resolve({
        status,
        exit_code: code,
        duration_ms: Date.now() - started,
        stdout: stdout.slice(0, 8000),
        stderr: stderr.slice(0, 4000),
      });
    });
    child.on('error', (err) => {
      clearTimeout(timer);
      resolve({
        status: 'failed',
        exit_code: null,
        duration_ms: Date.now() - started,
        stdout,
        stderr: String(err.message || err),
      });
    });
  });
}

async function runWithConcurrency(items, limit, worker) {
  const results = new Array(items.length);
  let next = 0;
  async function pump() {
    while (next < items.length) {
      const i = next++;
      results[i] = await worker(items[i], i);
    }
  }
  const workers = Array.from({ length: Math.min(limit, items.length) }, () => pump());
  await Promise.all(workers);
  return results;
}

function checkEnv(wf) {
  const warnings = [];
  const clientOps = process.env.DILLON_CLIENT_OPERATIONS_ROOT;
  if (!clientOps) {
    warnings.push('DILLON_CLIENT_OPERATIONS_ROOT unset; predict-work may degrade');
  } else if (!fs.existsSync(path.join(clientOps, 'registry', 'clients.json'))) {
    warnings.push(`client-operations root missing registry: ${clientOps}`);
  }
  if (!process.env.DILLON_REPORT_SOURCE_ROOTS) {
    warnings.push('DILLON_REPORT_SOURCE_ROOTS unset; report ingest may degrade');
  }
  return {
    status: warnings.length ? 'warn' : 'ok',
    warnings,
    client_ops_root: clientOps || null,
  };
}

async function runLane(lane, ctx) {
  const base = {
    lane_id: lane.lane_id,
    kind: lane.kind,
    started_at: nowISO(),
  };
  if (lane.kind === 'builtin' && lane.handler === 'checkEnv') {
    const result = checkEnv(ctx.workflow);
    return { ...base, finished_at: nowISO(), ...result };
  }
  if (lane.kind === 'command') {
    const cmd = expandCommand(lane, ctx.opts);
    if (!cmd) {
      return { ...base, finished_at: nowISO(), status: 'failed', detail: 'no command' };
    }
    const abs = cmd.map((part, i) => (i === 0 ? part : part));
    const result = await runCommand(abs, {
      cwd: ctx.repoRoot,
      timeoutSeconds: lane.timeout_seconds || 120,
      blockedExit: lane.blocked_exit || [],
    });
    return { ...base, finished_at: nowISO(), command: cmd, ...result };
  }
  if (lane.kind === 'agent') {
    return {
      ...base,
      finished_at: nowISO(),
      status: 'deferred',
      agent: lane.agent,
      skill: lane.skill || null,
      outputs: lane.outputs || [],
      detail: 'agent lane runs in Cursor orchestrator session, not local CLI',
    };
  }
  return { ...base, finished_at: nowISO(), status: 'skipped', detail: `unknown kind ${lane.kind}` };
}

async function runWorkflow(opts = {}) {
  const workflow = loadWorkflow(opts.workflowPath);
  const repoRoot = opts.repoRoot || repoPath();
  const runId = opts.runId || `UMB-${todayISO()}-${Date.now()}`;
  const ctx = {
    workflow,
    repoRoot,
    opts: {
      flags: opts.flags || new Set(),
      phase: opts.phase || null,
      skipPhases: opts.skipPhases || null,
      weekdaysOnly: opts.weekdaysOnly !== false && isWeekday(),
    },
  };
  const receipt = {
    workflow_id: workflow.workflow_id,
    run_id: runId,
    started_at: nowISO(),
    dry_run: !!opts.dryRun,
    phases: [],
    summary: { ok: 0, blocked: 0, failed: 0, deferred: 0, skipped: 0 },
  };

  for (const phase of workflow.phases) {
    if (!shouldRunPhase(phase, ctx.opts)) {
      receipt.phases.push({
        phase_id: phase.phase_id,
        status: 'skipped',
        reason: phase.weekdays_only ? 'weekend' : 'filtered',
        lanes: [],
      });
      receipt.summary.skipped += 1;
      continue;
    }
    const lanes = phase.lanes || [];
    const max = phase.parallel ? (phase.max_concurrency || lanes.length) : 1;
    let laneResults;
    if (opts.dryRun) {
      laneResults = lanes.map((lane) => ({
        lane_id: lane.lane_id,
        kind: lane.kind,
        status: 'dry-run',
        finished_at: nowISO(),
      }));
    } else if (phase.parallel) {
      laneResults = await runWithConcurrency(lanes, max, (lane) => runLane(lane, ctx));
    } else {
      laneResults = [];
      for (const lane of lanes) {
        laneResults.push(await runLane(lane, ctx));
      }
    }
    for (const lr of laneResults) {
      const bucket = lr.status === 'deferred' ? 'deferred' : lr.status;
      if (receipt.summary[bucket] !== undefined) receipt.summary[bucket] += 1;
      else if (lr.status === 'ok' || lr.status === 'warn') receipt.summary.ok += 1;
      else if (lr.status === 'blocked') receipt.summary.blocked += 1;
      else receipt.summary.failed += 1;
    }
    receipt.phases.push({
      phase_id: phase.phase_id,
      parallel: !!phase.parallel,
      lanes: laneResults,
    });
  }

  receipt.finished_at = nowISO();
  receipt.status = receipt.summary.failed > 0 ? 'warn' : 'ok';
  return receipt;
}

function writeReceipt(receipt, opts = {}) {
  const statePath = repoPath('12_Brain/state/competitive-task-orchestrator.json');
  writeJson(statePath, receipt);
  const day = todayISO();
  const mdPath = repoPath('Daily-Briefs', `umbrella-run-${day}.json`);
  writeJson(mdPath, receipt);
  if (opts.writeBriefSkeleton) {
    const briefPath = repoPath('Daily-Briefs/competitive-task-today.md');
    if (!fs.existsSync(briefPath)) {
      const lines = [
      '---',
      'tags: [daily-brief, competitive-task, umbrella]',
      `created: ${day}`,
      'status: machine-receipt',
      '---',
      '',
      `# Competitive task — ${day}`,
      '',
      `Run \`${receipt.run_id}\` · workflow \`${receipt.workflow_id}\``,
      '',
      '## Machine phase receipt',
      '',
      `| Phase | Lanes |`,
      `| --- | --- |`,
    ];
    for (const phase of receipt.phases) {
      const laneSummary = (phase.lanes || [])
        .map((l) => `${l.lane_id}:${l.status}`)
        .join(', ');
      lines.push(`| ${phase.phase_id} | ${laneSummary || phase.status || '—'} |`);
    }
    lines.push('', '_Agent synthesis pending — see orchestrator session._', '');
    fs.writeFileSync(briefPath, lines.join('\n'));
    }
  }
  return { statePath, receipt };
}

module.exports = {
  loadWorkflow,
  runWorkflow,
  writeReceipt,
  isWeekday,
  checkEnv,
};
