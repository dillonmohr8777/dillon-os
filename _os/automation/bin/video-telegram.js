#!/usr/bin/env node
'use strict';

/**
 * Telegram gateway for the video stack.
 *
 *   /plan <brief>    write a storyboard and price it            (free)
 *   /saas <brief>    30s SaaS explainer, planned                (free)
 *   /draft <brief>   cheapest tier, planned                     (free)
 *   /render <id>     execute a plan                             (SPENDS)
 *   /models          cheapest model per tier right now          (free)
 *   /budget          today's spend and caps                     (free)
 *   /status          config health                              (free)
 *   /jobs            recent plans awaiting approval             (free)
 *
 * Two safety properties this file exists to guarantee:
 *
 * 1. NOTHING SPENDS WITHOUT A SECOND MESSAGE. Every brief produces a priced plan
 *    and stops. Rendering requires /render with that plan's id. The vault's
 *    approval boundary says spend is gated; this is that gate, and it also means
 *    a fat-fingered message cannot start a $12 render.
 *
 * 2. ONLY ALLOWLISTED CHATS ARE OBEYED. A bot token in a group, or leaked, is
 *    otherwise an open cheque against the OpenRouter account. Unknown chat ids
 *    get one refusal and are never acted on. With no allowlist configured the
 *    bot answers read-only commands and refuses every spend path.
 */

const fs = require('fs');
const path = require('path');

const tg = require('../lib/video/telegram');
const pipeline = require('../lib/video/pipeline');
const ledger = require('../lib/video/ledger');
const { loadRouting } = require('../lib/video/router');
const { routeShot } = require('../lib/video/router');
const { loadCatalog } = require('../lib/video/registry');
const assemble = require('../lib/video/assemble');
const localRender = require('../lib/video/local-render');
const { directorConfig } = require('../lib/video/director');

const STATE_PATH = path.join(__dirname, '..', 'state', 'video-telegram.json');
const PLAN_TTL_MS = 24 * 60 * 60 * 1000;

function allowedChats() {
  return new Set(
    String(process.env.TELEGRAM_ALLOWED_CHAT_IDS || '')
      .split(',').map((s) => s.trim()).filter(Boolean)
  );
}

function loadState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
  } catch {
    return { offset: 0, plans: {} };
  }
}

function saveState(state) {
  fs.mkdirSync(path.dirname(STATE_PATH), { recursive: true });
  // Plans are pruned on every save so a long-running bot does not accumulate
  // stale priced plans that could be approved days later at a stale price.
  const cutoff = Date.now() - PLAN_TTL_MS;
  for (const [id, entry] of Object.entries(state.plans || {})) {
    if (!entry?.savedAt || entry.savedAt < cutoff) delete state.plans[id];
  }
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2), 'utf8');
}

const money = (n) => `$${Number(n || 0).toFixed(2)}`;

function formatPlan(planned) {
  const lines = [];
  lines.push(`PLAN ${planned.id}`);
  lines.push(planned.storyboard.title || '(untitled)');
  lines.push('');

  planned.routed.routed.forEach((r) => {
    const scene = r.shot;
    const n = String(r.index + 1).padStart(2, '0');
    if (!r.ok) {
      lines.push(`${n}. [BLOCKED] ${scene.scene_type} — ${r.reason}`);
      return;
    }
    const where = r.engine === 'local' ? 'local $0' : `${r.model.id} ${money(r.cost.usd)}`;
    lines.push(`${n}. ${scene.scene_type} ${r.cost.durationSeconds || scene.duration_seconds}s — ${where}`);
    const text = scene.headline || scene.prompt || scene.caption || '';
    if (text) lines.push(`    ${String(text).slice(0, 90)}`);
  });

  lines.push('');
  lines.push(`${planned.localCount} local (free) + ${planned.paidCount} generated`);
  lines.push(`Estimated: ${money(planned.totalUsd)}${planned.costConfidence === 'estimated' ? ' (token-priced models are estimates)' : ''}`);
  lines.push(`Today so far: ${money(planned.budget.dailySpent)}${planned.budget.dailyCap != null ? ` of ${money(planned.budget.dailyCap)}` : ''}`);

  if (!planned.budget.ok) {
    lines.push('');
    lines.push(`BLOCKED BY BUDGET: ${planned.budget.reason}`);
  } else if (planned.ok) {
    lines.push('');
    lines.push(`Approve with:  /render ${planned.id}`);
  }
  if (planned.warnings?.length) {
    lines.push('');
    lines.push(`Warnings: ${planned.warnings.join('; ')}`);
  }
  return lines.join('\n');
}

async function cmdStatus(chatId) {
  const routing = loadRouting();
  const catalog = loadCatalog();
  const ff = assemble.probe();
  const chromium = localRender.findChromium();
  const director = directorConfig();

  const lines = [
    'VIDEO STACK STATUS',
    '',
    `Catalog:   ${catalog.models.length} models (fetched ${catalog.fetchedAt})`,
    `Director:  ${director.model} @ ${director.baseUrl}`,
    `OpenRouter key: ${process.env.OPENROUTER_API_KEY ? 'set' : 'MISSING — renders will fail'}`,
    `Chromium:  ${chromium || 'MISSING — local scenes cannot render'}`,
    `ffmpeg:    ${ff.ok ? ff.bin : `UNUSABLE${ff.bin ? ` (${ff.bin})` : ''} — missing ${ff.missing.join(', ')}`}`,
    `Allowlist: ${allowedChats().size ? `${allowedChats().size} chat(s)` : 'EMPTY — spend commands disabled'}`,
    '',
    `Budget: ${money(routing.budget.per_shot_usd)}/shot, ${money(routing.budget.per_job_usd)}/job, ${money(routing.budget.daily_usd)}/day`,
    `Spent today: ${money(ledger.spendOn())}`,
  ];
  await tg.sendMessage(chatId, lines.join('\n'));
}

async function cmdModels(chatId) {
  const routing = loadRouting();
  const lines = ['CHEAPEST ROUTE PER TIER (6s, 16:9)', ''];
  for (const tier of Object.keys(routing.tiers)) {
    const r = routeShot({ tier, duration_seconds: 6, aspect_ratio: '16:9', prompt: 'probe', scene_type: 'generative' });
    lines.push(r.ok
      ? `${tier.padEnd(9)} ${r.model.id} — ${money(r.cost.usd)} (${r.cost.usdPerSecond}/s)`
      : `${tier.padEnd(9)} unavailable: ${r.reason}`);
  }
  lines.push('', 'Local scene types cost $0: ' + routing.local_scene_types.types.join(', '));
  await tg.sendMessage(chatId, lines.join('\n'));
}

async function cmdBudget(chatId) {
  const routing = loadRouting();
  const spent = ledger.spendOn();
  const accuracy = ledger.accuracyReport();
  const lines = [
    'BUDGET',
    '',
    `Today: ${money(spent)} of ${money(routing.budget.daily_usd)}`,
    `Caps:  ${money(routing.budget.per_shot_usd)}/shot, ${money(routing.budget.per_job_usd)}/job`,
  ];
  if (accuracy.length) {
    lines.push('', 'Estimate accuracy (actual/estimated):');
    accuracy.forEach((a) => lines.push(`  ${a.model}: ${a.meanActualOverEstimate}x over ${a.samples} jobs`));
  }
  await tg.sendMessage(chatId, lines.join('\n'));
}

async function cmdPlan(chatId, brief, opts, state) {
  if (!brief.trim()) {
    await tg.sendMessage(chatId, 'Give me a brief. Example:\n/saas Bridge Signal 30-second clean 2D explainer');
    return;
  }
  await tg.sendMessage(chatId, `Directing: ${brief.slice(0, 120)}\nThis runs on the local model and costs nothing.`);

  const planned = await pipeline.plan(brief, opts);
  if (!planned.ok && planned.stage === 'director') {
    await tg.sendMessage(chatId, `Director failed: ${planned.error}\n\nIs the local model running? /status shows the endpoint.`);
    return;
  }
  if (!planned.ok && planned.stage === 'validate') {
    await tg.sendMessage(chatId, `Storyboard was invalid: ${planned.error}`);
    return;
  }

  state.plans[planned.id] = { savedAt: Date.now(), chatId, plan: planned };
  saveState(state);
  await tg.sendMessage(chatId, formatPlan(planned));
}

async function cmdRender(chatId, id, state) {
  const entry = state.plans[id];
  if (!entry) {
    await tg.sendMessage(chatId, `No plan '${id}'. Plans expire after 24h. /jobs lists what is still approvable.`);
    return;
  }
  const planned = entry.plan;

  // Re-check the budget at approval time. The plan may have been priced before
  // other renders spent against today's cap.
  const routing = loadRouting();
  const recheck = ledger.checkBudget(planned.totalUsd, routing.budget);
  if (!recheck.ok) {
    await tg.sendMessage(chatId, `Blocked: ${recheck.reason}`);
    return;
  }

  await tg.sendMessage(chatId, `Rendering ${id}. Estimated ${money(planned.totalUsd)}. ${planned.paidCount} generated + ${planned.localCount} local scenes.`);

  const result = await pipeline.execute(planned, {
    confirm: true,
    continueOnError: false,
    onScene: (r) => {
      if (r.engine === 'openrouter') {
        tg.sendMessage(chatId, `  scene ${r.index + 1}: ${r.model.id} (${money(r.cost.usd)})`).catch(() => {});
      }
    },
  });

  if (!result.ok) {
    await tg.sendMessage(chatId, `Render failed at ${result.stage}: ${result.error}${result.spentUsd ? `\nSpent before failing: ${money(result.spentUsd)}` : ''}`);
    return;
  }

  delete state.plans[id];
  saveState(state);

  const sent = await tg.sendVideo(chatId, result.masterPath,
    `${planned.storyboard.title || id} — master\nSpent ${money(result.spentUsd)} (estimated ${money(result.estimatedUsd)})`);
  if (!sent.ok) {
    await tg.sendMessage(chatId, `Rendered but could not upload: ${sent.error}\nFile: ${result.masterPath}`);
    return;
  }

  for (const d of result.derivatives.filter((x) => x.ok)) {
    const res = await tg.sendVideo(chatId, d.path, `${d.name} cut`);
    if (!res.ok) await tg.sendMessage(chatId, `${d.name} cut ready but not uploaded (${res.error}): ${d.path}`);
  }
}

async function cmdJobs(chatId, state) {
  const entries = Object.entries(state.plans).filter(([, e]) => String(e.chatId) === String(chatId));
  if (!entries.length) {
    await tg.sendMessage(chatId, 'No plans awaiting approval.');
    return;
  }
  const lines = ['PLANS AWAITING APPROVAL', ''];
  entries.forEach(([id, e]) => {
    const ageMin = Math.round((Date.now() - e.savedAt) / 60000);
    lines.push(`${id} — ${money(e.plan.totalUsd)} — ${e.plan.storyboard.title || '(untitled)'} (${ageMin}m ago)`);
  });
  await tg.sendMessage(chatId, lines.join('\n'));
}

const HELP = [
  'DILLON OS VIDEO',
  '',
  '/saas <brief>   30s explainer, client tier',
  '/draft <brief>  cheapest possible pass',
  '/plan <brief>   plan at the standard tier',
  '/render <id>    approve and render a plan (spends)',
  '/jobs           plans awaiting approval',
  '/models         cheapest model per tier',
  '/budget         spend today',
  '/status         config health',
  '',
  'Every brief is planned and priced first. Nothing spends until you send /render.',
].join('\n');

async function handle(message, state) {
  const chatId = message.chat?.id;
  const text = String(message.text || '').trim();
  if (!chatId || !text.startsWith('/')) return;

  const [rawCmd, ...rest] = text.split(/\s+/);
  const cmd = rawCmd.split('@')[0].toLowerCase();
  const arg = rest.join(' ');

  const allow = allowedChats();
  const permitted = allow.has(String(chatId));

  // Read-only commands are answered for anyone who finds the bot; anything that
  // can spend, or that reveals the plan queue, requires the allowlist.
  const SPEND_OR_PRIVATE = new Set(['/plan', '/saas', '/draft', '/render', '/jobs']);
  if (SPEND_OR_PRIVATE.has(cmd) && !permitted) {
    await tg.sendMessage(chatId, `This chat (${chatId}) is not authorised. Add it to TELEGRAM_ALLOWED_CHAT_IDS and restart the gateway.`);
    return;
  }

  switch (cmd) {
    case '/start':
    case '/help':
      return void (await tg.sendMessage(chatId, HELP));
    case '/status':
      return void (await cmdStatus(chatId));
    case '/models':
      return void (await cmdModels(chatId));
    case '/budget':
      return void (await cmdBudget(chatId));
    case '/jobs':
      return void (await cmdJobs(chatId, state));
    case '/saas':
      return void (await cmdPlan(chatId, arg, { tier: 'standard', targetSeconds: 30, aspectRatio: '16:9' }, state));
    case '/draft':
      return void (await cmdPlan(chatId, arg, { tier: 'draft', targetSeconds: 20, aspectRatio: '16:9' }, state));
    case '/plan':
      return void (await cmdPlan(chatId, arg, { tier: 'standard', targetSeconds: 30 }, state));
    case '/render':
      return void (await cmdRender(chatId, arg.trim(), state));
    default:
      return void (await tg.sendMessage(chatId, `Unknown command ${cmd}\n\n${HELP}`));
  }
}

async function main() {
  const me = await tg.getMe();
  if (!me.ok) {
    console.error(`Cannot reach Telegram: ${me.error}`);
    process.exit(1);
  }
  const allow = allowedChats();
  console.log(`Gateway up as @${me.result.username}`);
  console.log(allow.size
    ? `Allowlisted chats: ${[...allow].join(', ')}`
    : 'WARNING: TELEGRAM_ALLOWED_CHAT_IDS is empty — spend commands are disabled. Message the bot and use the chat id it reports.');

  const state = loadState();

  for (;;) {
    const updates = await tg.getUpdates(state.offset || 0);
    if (!updates.ok) {
      console.error(`getUpdates: ${updates.error}`);
      await new Promise((r) => setTimeout(r, 5000));
      continue;
    }
    for (const update of updates.result) {
      state.offset = update.update_id + 1;
      saveState(state);
      if (!update.message) continue;
      try {
        await handle(update.message, state);
      } catch (err) {
        console.error(`handler error: ${tg.redact(err.message)}`);
        try {
          await tg.sendMessage(update.message.chat.id, `Error: ${tg.redact(err.message)}`);
        } catch { /* chat unreachable */ }
      }
    }
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error(tg.redact(err.stack || err.message));
    process.exit(1);
  });
}

module.exports = { handle, formatPlan, allowedChats, loadState, saveState, HELP };
