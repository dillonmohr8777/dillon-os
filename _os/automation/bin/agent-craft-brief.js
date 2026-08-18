#!/usr/bin/env node
'use strict';

/**
 * Agent craft brief - the recursive layer.
 *
 * Every other automation here reports on client work. This one reports on the
 * agent infrastructure itself: which routines actually complete, which gates do
 * the blocking, which build commands break, and how that changed. It reads the
 * loop's own receipt logs, so the training signal is this estate's real
 * operating history rather than generic advice.
 *
 * Deterministic and read-only apart from its own output. No model call: every
 * number below is counted from 12_Brain/queue/claude-loop-*.jsonl.
 *
 *   node _os/automation/bin/agent-craft-brief.js [--days 14] [--write]
 *
 * Dry-run by default, matching the other bin CLIs. --write updates 12_Brain/11_Craft/.
 */

const fs = require('fs');
const path = require('path');
const { repoPath, readJson, ensureDir, todayISO } = require('../lib/fsutil');
const { writeRunState } = require('../lib/registry');

const QUEUE_DIR = repoPath('12_Brain/queue');
const CRAFT_DIR = repoPath('12_Brain/11_Craft');
const TEAM = repoPath('11_Agents/claude-operating-team.json');

const DONE = new Set(['complete', 'complete_degraded']);
const FAILED = new Set(['failed', 'verification_failed']);

function argInt(flag, dflt) {
  const i = process.argv.indexOf(flag);
  if (i < 0) return dflt;
  const n = parseInt(process.argv[i + 1], 10);
  return Number.isFinite(n) ? n : dflt;
}

/** Receipt logs, one file per day, oldest first. */
function loadDays(limit) {
  let names;
  try { names = fs.readdirSync(QUEUE_DIR); } catch { return []; }
  return names
    .filter((f) => /^claude-loop-\d{4}-\d{2}-\d{2}\.jsonl$/.test(f))
    .sort()
    .slice(-limit)
    .map((f) => {
      const day = f.slice('claude-loop-'.length, -'.jsonl'.length);
      const rows = [];
      for (const line of fs.readFileSync(path.join(QUEUE_DIR, f), 'utf8').split('\n')) {
        const t = line.trim();
        if (!t) continue;
        try { rows.push(JSON.parse(t)); } catch { /* skip a torn line */ }
      }
      return { day, rows };
    });
}

function analyse(days) {
  const perRoutine = new Map();
  const gateBlocks = new Map();
  const failReasons = new Map();

  for (const { day, rows } of days) {
    for (const r of rows) {
      const id = r.routine_id;
      if (!id) continue;
      if (!perRoutine.has(id)) perRoutine.set(id, { id, done: [], failed: [], blocked: [] });
      const rec = perRoutine.get(id);
      if (DONE.has(r.outcome)) {
        rec.done.push(day);
      } else if (FAILED.has(r.outcome)) {
        rec.failed.push(day);
        const next = (r.receipt || {}).next_safest_action || 'no next action recorded';
        failReasons.set(id, `${r.stages_ok ?? '?'}/9 stages ok; next: ${next}`);
      } else if (r.outcome === 'blocked') {
        rec.blocked.push(day);
        for (const g of String(r.blocked_by || '').split('+').filter(Boolean)) {
          gateBlocks.set(g, (gateBlocks.get(g) || 0) + 1);
        }
      }
    }
  }
  return { perRoutine, gateBlocks, failReasons };
}

const STANDING_LESSONS = [
  '**`blocked` is usually healthy.** Most blocks are `G6_dedupe`: the routine already ran today. Read `G5_stale_source` and `G8_circuit_breaker` instead.',
  '**A driver that reports `noop` cannot distinguish "nothing to do" from "everything is stuck."** The receipt log is the only honest signal.',
  '**A fail-closed probe pointed at a source nothing writes is not caution, it is a dead routine.** Verify something actually produces the state a gate reads.',
  '**One unapproved input must not sink a finished batch.** Collect refusals per item; never let item 20 discard items 1-19.',
  '**Untracked code that a scheduler runs is the highest-risk code in an estate.** Source belongs in git; artifacts do not.',
  '**A generated file and its generator drift.** Fix the generator, then verify it reproduces the committed output before regenerating.',
  '**Installed is not live.** Bright Data skills without `BRIGHTDATA_API_KEY` are not a rung. Firecrawl stealth lives on `FIRECRAWL_BATCH_SCRAPE`, not every Firecrawl call.',
  '**Append lessons to a file the brief generator cannot overwrite.** Dated operating briefs are regenerated; `earned-lessons.md` is the compounding log.',
  '**A live interactive process owns its state.** A second writer does not share it politely. Never attach to port 9222, Dillon\'s default Chrome, or a live Codex/Claude TUI session (`attach_live=false`).',
  '**MCP catalogs are directional.** Cursor user MCP, Claude Code `.claude.json`, and vault project MCP are three files. Restarting one runtime does not load another runtime\'s servers.',
];

function frontmatter(noteType, created, tags, sources) {
  return [
    '---',
    `note_type: ${noteType}`,
    'status: active',
    `created: ${created}`,
    `updated: ${todayISO()}`,
    `source_refs: [${sources}]`,
    `tags: [${tags}]`,
    '---',
    '',
  ];
}

function main() {
  const write = process.argv.includes('--write');
  const days = loadDays(argInt('--days', 14));
  if (!days.length) {
    process.stdout.write(`${JSON.stringify({
      automation_id: 'agent-craft-brief', status: 'blocked', detail: 'no receipt logs found',
    }, null, 2)}\n`);
    process.exit(2);
  }

  const { perRoutine, gateBlocks, failReasons } = analyse(days);
  const dayList = days.map((d) => d.day);
  const span = dayList.length;

  const team = readJson(TEAM, { routines: [] });
  const meta = new Map((team.routines || []).map((r) => [r.routine_id, r]));

  const rows = [...perRoutine.values()].map((r) => {
    const m = meta.get(r.id) || {};
    const attempts = r.done.length + r.failed.length;
    return {
      id: r.id,
      name: m.name || '(unknown routine)',
      cadence: m.cadence || '?',
      claude_role: m.claude_role || '?',
      completions: r.done.length,
      failures: r.failed.length,
      reliability: attempts ? Number((r.done.length / attempts).toFixed(2)) : null,
      last_completed: r.done.length ? r.done[r.done.length - 1] : null,
      fail_reason: failReasons.get(r.id) || null,
    };
  });

  // Cadence drift: a weekly/monthly routine completing every day proves the
  // dedupe key is date-based, so the declared cadence is decorative.
  const drift = rows.filter((r) => ['weekly', 'weekly-twice', 'monthly'].includes(r.cadence)
    && r.completions >= span);
  const driftIds = new Set(drift.map((r) => r.id));

  const unreliable = rows.filter((r) => r.failures > 0).sort((a, b) => b.failures - a.failures);
  const workhorses = rows.filter((r) => r.completions >= span && !driftIds.has(r.id))
    .sort((a, b) => b.completions - a.completions);
  const neverRan = (team.routines || [])
    .filter((r) => r.claude_role && r.claude_role !== 'never' && !perRoutine.has(r.routine_id))
    .map((r) => ({ id: r.routine_id, name: r.name, cadence: r.cadence }));

  const result = {
    automation_id: 'agent-craft-brief',
    status: 'ok',
    generated_for: todayISO(),
    window_days: span,
    days: dayList,
    counts: {
      routines_seen: rows.length,
      workhorses: workhorses.length,
      unreliable: unreliable.length,
      cadence_drift: drift.length,
      authorized_never_ran: neverRan.length,
    },
    gate_blocks: [...gateBlocks.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([gate, blocks]) => ({ gate, blocks })),
    workhorses,
    unreliable,
    cadence_drift: drift,
    authorized_never_ran: neverRan,
    dry_run: !write,
  };

  if (write) {
    ensureDir(CRAFT_DIR);
    const briefPath = path.join(CRAFT_DIR, `${todayISO()} - operating brief.md`);
    // A plain path, not a wikilink: 12_Brain/queue is a directory, so [[...]] would
    // register as an unresolved link target every single day.
    const L = frontmatter('review', todayISO(), 'craft, agent-infrastructure, generated',
      '"12_Brain/queue/claude-loop-*.jsonl"');
    L.push(`# Agent craft brief - ${todayISO()}`);
    L.push('');
    L.push(`Counted from ${span} day(s) of loop receipts (${dayList[0]} to ${dayList[span - 1]}).`);
    L.push('Generated by `_os/automation/bin/agent-craft-brief.js`. Every number is counted, not inferred.');
    L.push('');
    L.push('## What this infrastructure does reliably');
    L.push('');
    if (workhorses.length) {
      L.push('| Routine | Name | Completions | Reliability |');
      L.push('|---|---|---|---|');
      for (const r of workhorses) {
        L.push(`| ${r.id} | ${r.name} | ${r.completions}/${span} | ${r.reliability ?? '-'} |`);
      }
    } else {
      L.push('_Nothing completed on every day in the window._');
    }
    L.push('');
    L.push('## Where it breaks');
    L.push('');
    if (unreliable.length) {
      for (const r of unreliable) {
        L.push(`- **${r.id} ${r.name}** - ${r.failures} failure(s), reliability ${r.reliability ?? '-'}.`);
        if (r.fail_reason) L.push(`  Last failure: ${r.fail_reason}`);
      }
    } else {
      L.push('_No failures in the window._');
    }
    L.push('');
    L.push('## What does the blocking');
    L.push('');
    L.push('| Gate | Blocks |');
    L.push('|---|---|');
    for (const g of result.gate_blocks) L.push(`| ${g.gate} | ${g.blocks} |`);
    L.push('');
    L.push('`G6_dedupe` is healthy - it means the routine already ran today.');
    L.push('`G5_stale_source` and `G8_circuit_breaker` are the ones worth reading.');
    L.push('');
    if (drift.length) {
      L.push('## Cadence not enforced');
      L.push('');
      L.push('These declare a weekly or monthly cadence but complete every day, because the');
      L.push('dedupe key is date-based. They consume budget at up to 30x their intent:');
      L.push('');
      for (const r of drift) {
        L.push(`- ${r.id} **${r.name}** - declared ${r.cadence}, completed ${r.completions}/${span} days`);
      }
      L.push('');
    }
    if (neverRan.length) {
      L.push('## Authorized but never observed');
      L.push('');
      L.push('Claude-executable routines with no receipt in this window - either permanently');
      L.push('gated or defined and never wired:');
      L.push('');
      for (const r of neverRan) L.push(`- ${r.id} ${r.name} (${r.cadence})`);
      L.push('');
    }
    L.push('## Lesson');
    L.push('');
    L.push('This file is regenerated. Append evidence-backed lessons to');
    L.push('`12_Brain/11_Craft/earned-lessons.md`. When a lesson appears twice, promote it');
    L.push('into `12_Brain/03_Concepts/` and add it to `STANDING_LESSONS` in this script.');
    L.push('');
    fs.writeFileSync(briefPath, `${L.join('\n')}\n`);

    // Rolling index, so the section compounds instead of becoming a pile of dates.
    const briefs = fs.readdirSync(CRAFT_DIR)
      .filter((f) => / - operating brief\.md$/.test(f)).sort().reverse();
    const idx = frontmatter('index', '2026-08-18', 'craft, index', '');
    idx.push('# Agent Craft');
    idx.push('');
    idx.push('How to build the infrastructure this operating team runs on, learned from what this');
    idx.push('estate actually does. Briefs are generated daily from the loop receipts; lessons that');
    idx.push('repeat get promoted into `12_Brain/03_Concepts/` and linked back here.');
    idx.push('');
    idx.push('## Standing lessons');
    idx.push('');
    for (const l of STANDING_LESSONS) idx.push(`- ${l}`);
    idx.push('');
    idx.push('## Earned lessons log');
    idx.push('');
    idx.push('Agents append to [[12_Brain/11_Craft/earned-lessons|earned-lessons]]. Do not hand-edit the dated brief.');
    idx.push('');
    idx.push('## Briefs');
    idx.push('');
    for (const b of briefs) {
      const stem = b.replace(/\.md$/, '');
      idx.push(`- [[12_Brain/11_Craft/${stem}|${stem}]]`);
    }
    idx.push('');
    fs.writeFileSync(path.join(CRAFT_DIR, '00_Index.md'), `${idx.join('\n')}\n`);

    result.artifacts = [
      path.relative(repoPath(), briefPath).split(path.sep).join('/'),
      '12_Brain/11_Craft/00_Index.md',
    ];
  }

  try { writeRunState('agent-craft-brief', result); } catch { /* registry optional */ }
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

main();
