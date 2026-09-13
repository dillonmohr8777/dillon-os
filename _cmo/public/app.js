/* CMO OS dashboard client.
   Vanilla JS, no framework, no build step. Every value shown here comes from
   the same API the CLI uses, so the two can never disagree. */

'use strict';

const state = {
  workspaces: [],
  wsId: null,
  view: 'feed',
  overview: null,
  agents: null,
  health: null,
  actor: localStorage.getItem('cmo.actor') || '',
};

const $ = (sel) => document.querySelector(sel);
const main = $('#main');

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

/** Escape everything that reaches the DOM. Agent output is untrusted text. */
function esc(v) {
  return String(v ?? '').replace(/[&<>"']/g, (ch) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]
  ));
}

const usd = (n) => `$${Number(n || 0).toFixed(4)}`;
const pct = (n, digits = 1) => `${(Number(n || 0) * 100).toFixed(digits)}%`;
const when = (iso) => (iso ? String(iso).slice(5, 16).replace('T', ' ') : '');

async function api(path, options) {
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: { 'content-type': 'application/json', ...(options?.headers || {}) },
  });
  const text = await res.text();
  let payload = null;
  try { payload = text ? JSON.parse(text) : null; } catch { payload = { error: text }; }
  if (!res.ok) throw Object.assign(new Error(payload?.error || `HTTP ${res.status}`), { status: res.status, payload });
  return payload;
}

function riskBadge(risk) {
  const cls = risk === 'high' ? 'danger' : risk === 'medium' ? 'warn' : '';
  return `<span class="badge ${cls}">${esc(risk)} risk</span>`;
}

function modeBadge(mode) {
  const cls = mode === 'live' ? 'ok' : mode === 'substitute' ? 'accent' : mode === 'fixture' ? 'warn' : '';
  return `<span class="badge ${cls}">${esc(mode)}</span>`;
}

function statusBadge(status) {
  const cls = status === 'ok' ? 'ok' : status === 'skipped' ? 'warn' : status === 'failed' ? 'danger' : '';
  return `<span class="badge ${cls}">${esc(status)}</span>`;
}

function meter(fraction) {
  const f = Math.max(0, Math.min(1, fraction || 0));
  const cls = f > 0.9 ? 'danger' : f > 0.7 ? 'warn' : '';
  return `<div class="meter"><i class="${cls}" style="width:${(f * 100).toFixed(1)}%"></i></div>`;
}

/** The confidence-interval bar. This widget is the product's whole argument. */
function ciBar(value, low, high) {
  const scale = (n) => `${Math.max(0, Math.min(100, n * 100)).toFixed(1)}%`;
  const width = Math.max(0.6, (high - low) * 100);
  return `
    <div class="ci" title="95% confidence interval">
      <span class="band" style="left:${scale(low)};width:${width.toFixed(1)}%"></span>
      <span class="point" style="left:${scale(value)}"></span>
    </div>
    <div class="ci-labels"><span>${pct(low)}</span><span>${pct(value)}</span><span>${pct(high)}</span></div>`;
}

function card(title, bodyHtml, { right = '', tight = false } = {}) {
  return `<section class="card">
    <div class="card-head"><h2>${esc(title)}</h2><div>${right}</div></div>
    <div class="card-body${tight ? ' tight' : ''}">${bodyHtml}</div>
  </section>`;
}

function stat(label, value, sub, cls = '') {
  return `<div class="card stat ${cls}">
    <div class="label">${esc(label)}</div>
    <div class="value">${value}</div>
    ${sub ? `<div class="sub">${sub}</div>` : ''}
  </div>`;
}

// ---------------------------------------------------------------------------
// drawer
// ---------------------------------------------------------------------------

function openDrawer(title, html) {
  $('#drawer-title').textContent = title;
  $('#drawer-body').innerHTML = html;
  $('#drawer').hidden = false;
  $('#scrim').hidden = false;
}
function closeDrawer() {
  $('#drawer').hidden = true;
  $('#scrim').hidden = true;
}
$('#drawer-close').addEventListener('click', closeDrawer);
$('#scrim').addEventListener('click', closeDrawer);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeDrawer(); });

// ---------------------------------------------------------------------------
// views
// ---------------------------------------------------------------------------

function renderFeed(o) {
  const capFraction = o.cost.caps.dailyUsd ? o.cost.today / o.cost.caps.dailyUsd : 0;
  const blocked = o.feed.filter((f) => !f.guardrails.passed).length;

  const tiles = `<div class="grid cols-4">
    ${stat('Waiting on you', o.approvals.counts.pending || 0,
    o.approvals.oldestPendingDays > 0 ? `oldest ${o.approvals.oldestPendingDays}d` : 'nothing stale',
    (o.approvals.counts.pending || 0) > 0 ? 'accent' : '')}
    ${stat('Blocked by guardrail', blocked, blocked ? 'cannot be approved as-is' : 'all artifacts clean', blocked ? 'danger' : 'ok')}
    ${stat('Spend today', usd(o.cost.today), `of ${usd(o.cost.caps.dailyUsd)} cap${meter(capFraction)}`, capFraction > 0.7 ? 'warn' : '')}
    ${stat('Runs', o.runs.length, `${o.runs.filter((r) => r.status === 'ok').length} ok · ${o.runs.filter((r) => r.status === 'failed').length} failed`)}
  </div>`;

  const feedRows = o.feed.length ? o.feed.map((f) => `
    <div class="row ${!f.guardrails.passed ? 'blocked' : f.risk === 'high' ? 'high' : ''}" data-artifact="${esc(f.id)}">
      <div class="row-top">
        <span class="row-title">${esc(f.title || f.kind)}</span>
        <span class="badge">${esc(f.kind)}</span>
        ${riskBadge(f.risk)}
        ${f.guardrails.passed ? '' : `<span class="badge danger">blocked: ${esc(f.guardrails.blocking.map((b) => b.rule).join(', '))}</span>`}
        ${f.evidenceCount ? `<span class="badge ok">${f.evidenceCount} source${f.evidenceCount === 1 ? '' : 's'}</span>` : '<span class="badge warn">no sources</span>'}
      </div>
      <div class="row-sub">${esc(f.summary || '')}</div>
      <div class="faint mono">${esc(f.agentId)} · ${esc(f.effect)} · ${when(f.updatedAt)}</div>
    </div>`).join('') : '<div class="empty">No artifacts yet. Run <code>cmo demo</code> or start an agent.</div>';

  return `${tiles}
    <div class="grid cols-2" style="margin-top:16px">
      ${card(`Agents feed (${o.feed.length})`, feedRows, { tight: true, right: '<span class="faint">click any row for the full artifact, its claims and its sources</span>' })}
      ${card('Latest AI visibility', renderGeoSummary(o.geo), { tight: false })}
    </div>`;
}

function renderGeoSummary(geo) {
  if (!geo) return '<div class="empty">No scan yet. Run the <code>geo-visibility</code> agent.</div>';
  return `
    ${geo.simulated ? '<div class="note danger"><strong>SIMULATED</strong> — no real engine adapter; these are not measurements of the named engines.</div>' : ''}
    <div class="faint mono">instrument ${esc(geo.promptSet.sha256.slice(0, 16))} · ${esc(geo.promptSet.setId)} v${esc(geo.promptSet.version)}</div>
    ${geo.engines.map((e) => `
      <h3>${esc(e.engine)} <span class="faint">(${esc(e.channel)})</span></h3>
      ${ciBar(e.visibility, e.low, e.high)}
      <div class="row-sub">n_eff ${Number(e.nEff).toFixed(0)} · appears on ${pct(e.coverage, 0)} of prompts · citation share (normalized) ${e.citationShareNormalized}</div>
      <div class="note">${esc(e.lever.message)}</div>
    `).join('')}
    <div class="faint" style="margin-top:12px">${esc(geo.note)}</div>`;
}

function renderApprovals(o) {
  const actorInput = `<div class="actions" style="margin-bottom:14px">
    <label class="dim">Deciding as</label>
    <input id="actor" placeholder="your name" value="${esc(state.actor)}" style="width:180px">
    <span class="faint">an agent can never approve its own work</span>
  </div>`;

  const waiting = o.approvals.waiting.length ? o.approvals.waiting.map((a) => `
    <div class="row ${a.blocking.length ? 'blocked' : a.risk === 'high' ? 'high' : ''}">
      <div class="row-top">
        <span class="row-title">${esc(a.title)}</span>
        ${riskBadge(a.risk)}
        <span class="badge">${esc(a.effect)}</span>
        ${a.blocking.length ? `<span class="badge danger">blocked: ${esc(a.blocking.join(', '))}</span>` : ''}
      </div>
      <div class="row-sub faint mono">${esc(a.id)} · opened by ${esc(a.createdBy)} · ${when(a.openedAt)}</div>
      <div class="actions" style="margin-top:6px">
        <button class="primary" data-approve="${esc(a.id)}" ${a.blocking.length ? 'disabled title="resolve the blocking guardrail first"' : ''}>Approve</button>
        <button class="danger" data-reject="${esc(a.id)}">Reject</button>
        <button data-artifact="${esc(a.artifactId)}">View artifact</button>
      </div>
    </div>`).join('') : '<div class="empty">Nothing waiting.</div>';

  const ready = o.approvals.readyToPublish.length
    ? o.approvals.readyToPublish.map((a) => `<div class="row"><div class="row-top">
        <span class="row-title">${esc(a.title)}</span><span class="badge">${esc(a.effect)}</span>
        <span class="badge ok">approved by ${esc(a.decidedBy || '')}</span></div></div>`).join('')
    : '<div class="empty">Nothing approved yet.</div>';

  return `${actorInput}
    <div class="grid cols-2">
      ${card(`Waiting on a human (${o.approvals.waiting.length})`, waiting, { tight: true })}
      ${card('Approved, ready to perform', ready, { tight: true, right: '<span class="faint">approval authorises the effect; performing it is a separate step</span>' })}
    </div>`;
}

function renderGeo(o) {
  if (!o.geo) return '<div class="empty">No scan yet. Run <code>cmo geo --ws ' + esc(state.wsId) + '</code>.</div>';
  const g = o.geo;
  const engines = g.engines.map((e) => `
    ${card(`${e.engine} · ${e.channel}`, `
      ${ciBar(e.visibility, e.low, e.high)}
      <div class="grid cols-3" style="margin-top:14px">
        ${stat('Weighted presence', pct(e.visibility), `95% CI ${pct(e.low)}–${pct(e.high)}`, 'accent')}
        ${stat('Effective sample', Number(e.nEff).toFixed(0), 'Kish n_eff, not raw run count')}
        ${stat('Coverage', pct(e.coverage, 0), 'prompts with any mention')}
      </div>
      <h3>Citations</h3>
      <div class="row-sub">normalized share <strong>${e.citationShareNormalized}</strong> · median ${e.medianCitations} citations per answer</div>
      <div class="faint">Normalized within engine: an engine citing 15 sources and one citing 3 are not comparable on raw share.</div>
      <h3>Share of voice</h3>
      <div class="row-sub">brand <strong>${pct(e.sov.brand, 0)}</strong> · other <strong>${pct(e.sov.other, 0)}</strong> · buckets sum to ${e.sov.sumCheck}</div>
      ${e.sov.otherTopNames?.length ? `<div class="faint">outside the declared set: ${esc(e.sov.otherTopNames.map((n) => n.name).join(', '))}</div>` : ''}
      <h3>Which lever moves this</h3>
      <div class="note">${esc(e.lever.message)}</div>
      <h3>Control cohort</h3>
      <div class="row-sub">brand presence in control prompts: ${e.controlPresence == null ? 'n/a' : pct(e.controlPresence, 0)}
        <span class="faint">— should be ~0. If controls move between scans, the engine changed, not the marketing.</span></div>
      <div class="faint mono" style="margin-top:12px">${esc(e.metricName)}</div>
    `)}`).join('');

  const warnings = g.warnings?.length
    ? card('Warnings', g.warnings.map((w) => `<div class="note ${w.severity === 'warn' ? 'warn' : ''}"><strong>${esc(w.code)}</strong> — ${esc(w.message)}</div>`).join(''))
    : '';

  const simBanner = g.simulated ? `<div class="note danger">
      <strong>SIMULATED — not a measurement of these engines.</strong>
      No real engine adapter is configured, so ${esc([...new Set(g.engines.flatMap((e) => e.answeredBy || []))].join(', ') || 'the configured model')}
      was asked to answer as each engine would. Useful for exercising the pipeline and for evals; not for a client
      report, and not trendable against a real scan.
    </div>` : '';
  return `${simBanner}<div class="note">${esc(g.note)}</div>
    <div class="faint mono" style="margin:8px 0 16px">instrument ${esc(g.promptSet.sha256)} · ${esc(g.promptSet.setId)} v${esc(g.promptSet.version)}
    ${g.promptSet.weighting?.capRelaxed ? ` · <span class="badge warn">weight cap relaxed to ${g.promptSet.weighting.effectiveCap}</span>` : ''}</div>
    <div class="grid cols-2">${engines}</div>
    ${warnings}`;
}

function renderRuns(o) {
  const rows = o.runs.map((r) => `
    <tr class="clickable" data-run="${esc(r.id)}">
      <td class="mono">${esc(r.id.slice(-8))}</td>
      <td>${esc(r.agentId)}</td>
      <td>${statusBadge(r.status)}</td>
      <td class="num">${r.live ?? 0}L / ${r.replayed ?? 0}R</td>
      <td class="num">${usd(r.usd)}</td>
      <td>${when(r.startedAt)}</td>
      <td>${esc((r.summary || '').slice(0, 70))}</td>
    </tr>`).join('');
  return card(`Runs (${o.runs.length})`, `<div class="table-wrap"><table>
    <thead><tr><th>RUN</th><th>AGENT</th><th>STATUS</th><th class="num">STEPS</th><th class="num">COST</th><th>WHEN</th><th>SUMMARY</th></tr></thead>
    <tbody>${rows || '<tr><td colspan="7" class="empty">No runs yet.</td></tr>'}</tbody></table></div>`,
  { tight: true, right: '<span class="faint">click a run for its full step journal</span>' });
}

function renderCost(o) {
  const c = o.cost;
  const dayF = c.caps.dailyUsd ? c.today / c.caps.dailyUsd : 0;
  const monthF = c.caps.monthlyUsd ? c.month / c.caps.monthlyUsd : 0;
  const byModel = Object.entries(c.byModel).sort((a, b) => b[1] - a[1]);
  const byAgent = Object.entries(c.byAgent).sort((a, b) => b[1] - a[1]);
  return `
    <div class="grid cols-4">
      ${stat('Today', usd(c.today), `of ${usd(c.caps.dailyUsd)}${meter(dayF)}`, dayF > 0.7 ? 'warn' : '')}
      ${stat('This month', usd(c.month), `of ${usd(c.caps.monthlyUsd)}${meter(monthF)}`, monthF > 0.7 ? 'warn' : '')}
      ${stat('All time', usd(c.total), `${c.calls} model calls`)}
      ${stat('Saved by caching', usd(c.cacheSavingsUsd), 'prompt-cache reads vs full price', 'ok')}
    </div>
    <div class="grid cols-2" style="margin-top:16px">
      ${card('By model', `<div class="table-wrap"><table><thead><tr><th>MODEL</th><th class="num">USD</th></tr></thead><tbody>
        ${byModel.map(([m, v]) => `<tr><td>${esc(m)}</td><td class="num">${usd(v)}</td></tr>`).join('') || '<tr><td colspan="2" class="empty">none</td></tr>'}
      </tbody></table></div>`, { tight: true })}
      ${card('By agent', `<div class="table-wrap"><table><thead><tr><th>AGENT</th><th class="num">USD</th></tr></thead><tbody>
        ${byAgent.map(([a, v]) => `<tr><td>${esc(a)}</td><td class="num">${usd(v)}</td></tr>`).join('') || '<tr><td colspan="2" class="empty">none</td></tr>'}
      </tbody></table></div>`, { tight: true })}
    </div>
    <div class="note" style="margin-top:16px">Dollars, not credits. Every figure is derived from the token counts the API returned, priced from one table you can read.</div>`;
}

function renderAgents() {
  const a = state.agents;
  if (!a) return '<div class="empty">Loading…</div>';
  const lanes = a.lanes.map((lane) => {
    const set = a.agents.filter((x) => x.lane === lane.lane);
    return card(`${lane.lane} (${set.length})`, set.map((x) => `
      <div class="row" data-agent="${esc(x.id)}">
        <div class="row-top">
          <span class="row-title">${esc(x.label)}</span>
          ${riskBadge(x.risk)}
          <span class="badge">${esc(x.cadence)}</span>
          ${x.needs.length ? `<span class="badge">needs ${esc(x.needs.join(', '))}</span>` : ''}
        </div>
        <div class="row-sub">${esc(x.description)}</div>
        <div class="faint mono">${esc(x.id)} → ${esc(x.effect)}</div>
      </div>`).join(''), { tight: true });
  }).join('');
  return `<div class="note">Risk is a property of the <strong>effect</strong>, not the content. A high-risk effect can never be auto-approved at any setting.</div>
    <div class="grid cols-2" style="margin-top:16px">${lanes}</div>`;
}

function renderConnectors(o) {
  const h = o.connectors;
  const rows = h.rows.map((r) => `<tr>
    <td class="mono">${esc(r.id)}</td><td>${esc(r.lane)}</td><td>${modeBadge(r.mode)}</td>
    <td>${esc(r.reason)}</td>
  </tr>`).join('');
  const blocking = h.blockingApprovals?.length
    ? card('Start these today — they are calendar time, not engineering time', h.blockingApprovals.map((b) => `<div class="note warn"><strong>${esc(b.id)}</strong> — ${esc(b.action)}</div>`).join(''))
    : '';
  return `<div class="note"><strong>live</strong> = real credentials · <strong>substitute</strong> = a different real source standing in ·
    <strong>fixture</strong> = committed sample data, labelled in every report · <strong>unavailable</strong> = no data path.
    The mode travels with the data into the client report, so a degraded window shows as a footnote rather than a silently missing bar.</div>
    ${card('Connectors', `<div class="table-wrap"><table><thead><tr><th>ID</th><th>LANE</th><th>MODE</th><th>WHY</th></tr></thead><tbody>${rows}</tbody></table></div>`, { tight: true })}
    ${blocking}`;
}

// ---------------------------------------------------------------------------
// detail views
// ---------------------------------------------------------------------------

async function showArtifact(id) {
  const a = await api(`/ws/${encodeURIComponent(state.wsId)}/artifacts/${encodeURIComponent(id)}`);
  const g = a.guardrails || {};
  openDrawer(a.title || a.kind, `
    <div class="row-top">
      <span class="badge">${esc(a.kind)}</span>${riskBadge(a.risk)}
      <span class="badge">${esc(a.effect)}</span>
      ${g.passed ? '<span class="badge ok">guardrails passed</span>' : '<span class="badge danger">blocked</span>'}
      <span class="badge">score ${g.score ?? '?'}</span>
    </div>
    ${(g.blocking || []).length ? `<h3>Blocking</h3>${g.blocking.map((b) => `<div class="note danger"><strong>${esc(b.rule)}</strong> — ${esc(b.message)}
      ${(b.examples || []).length ? `<ul>${b.examples.map((e) => `<li class="mono">${esc(e.span || '')}${e.needs ? ` <span class="faint">needs: ${esc(e.needs)}</span>` : ''}</li>`).join('')}</ul>` : ''}</div>`).join('')}` : ''}
    ${(g.warnings || []).length ? `<h3>Warnings</h3>${g.warnings.map((b) => `<div class="note warn"><strong>${esc(b.rule)}</strong> — ${esc(b.message)}</div>`).join('')}` : ''}
    <h3>Claims detected (${(g.claims || []).length})</h3>
    ${(g.claims || []).length ? `<ul>${g.claims.map((cl) => `<li><span class="badge">${esc(cl.kind)}</span> ${
      cl.matched ? `<strong class="mono">${esc(cl.matched)}</strong> <span class="faint">${esc(cl.span)}</span>` : `<span class="mono">${esc(cl.span)}</span>`
    }</li>`).join('')}</ul>` : '<div class="faint">No factual claims requiring a source.</div>'}
    <h3>Sources (${(a.evidence || []).length})</h3>
    ${(a.evidence || []).length ? `<ul>${a.evidence.map((e) => `<li class="mono">${esc(e.ref)}${e.note ? ` — <span class="faint">${esc(e.note)}</span>` : ''}</li>`).join('')}</ul>` : '<div class="note warn">No sources attached. Any factual claim here is unverified.</div>'}
    ${g.readability ? `<h3>Readability</h3><div class="row-sub">grade ${g.readability.grade} · ${g.readability.words} words · ${g.readability.avgWordsPerSentence} words/sentence</div>` : ''}
    <h3>Body</h3><pre>${esc(a.body || '(no body)')}</pre>
    <h3>Data</h3><pre>${esc(JSON.stringify(a.data, null, 2) || 'null')}</pre>
  `);
}

async function showRun(runId) {
  const r = await api(`/ws/${encodeURIComponent(state.wsId)}/runs/${encodeURIComponent(runId)}/explain`);
  const h = r.header || {};
  openDrawer(`Run ${runId.slice(-8)} · ${h.agentId || ''}`, `
    <div class="row-top">${statusBadge(h.status)}
      <span class="badge">${r.totals.live} live</span>
      <span class="badge accent">${r.totals.replayed} replayed</span>
      <span class="badge">${usd(r.totals.usd)}</span>
      <span class="badge">${r.totals.tokensIn} in / ${r.totals.tokensOut} out</span>
      ${h.replayOf ? `<span class="badge accent">replay of ${esc(h.replayOf.slice(-8))}</span>` : ''}
    </div>
    <div class="faint mono" style="margin-top:6px">context ${esc(h.contextHash || '')}</div>
    <h3>Steps</h3>
    <div class="table-wrap"><table><thead><tr><th>#</th><th>STEP</th><th>SRC</th><th>MODEL</th><th class="num">COST</th><th class="num">MS</th><th>INPUT HASH</th></tr></thead><tbody>
      ${r.steps.map((s) => `<tr>
        <td class="num">${s.seq}</td><td>${esc(s.name)}</td>
        <td>${s.source === 'replay' ? '<span class="badge accent">replay</span>' : '<span class="badge">live</span>'}</td>
        <td>${esc((s.model || '').replace('claude-', ''))}</td>
        <td class="num">${usd(s.usd)}</td><td class="num">${s.ms}</td>
        <td class="mono">${esc((s.inputHash || '').slice(0, 10))}</td></tr>`).join('')}
    </tbody></table></div>
    <h3>Sources (${r.sources.length})</h3>
    ${r.sources.length ? `<ul>${r.sources.map((s) => `<li class="mono">${esc(s.url || s.ref || JSON.stringify(s))}</li>`).join('')}</ul>` : '<div class="faint">none</div>'}
    <h3>Notes</h3>
    ${r.notes.length ? `<pre>${esc(r.notes.map((n) => `${n.name}: ${JSON.stringify(n)}`).join('\n'))}</pre>` : '<div class="faint">none</div>'}
    <div class="actions" style="margin-top:16px">
      <button class="primary" data-replay="${esc(runId)}">Replay this run</button>
      <span class="faint">unchanged steps are reused at zero cost; the first changed step and everything after it runs live</span>
    </div>
  `);
}

// ---------------------------------------------------------------------------
// events
// ---------------------------------------------------------------------------

main.addEventListener('click', async (e) => {
  const artifactEl = e.target.closest('[data-artifact]');
  const runEl = e.target.closest('[data-run]');
  const approveBtn = e.target.closest('[data-approve]');
  const rejectBtn = e.target.closest('[data-reject]');
  const agentEl = e.target.closest('[data-agent]');

  try {
    if (approveBtn) { e.stopPropagation(); return decide(approveBtn.dataset.approve, 'approve'); }
    if (rejectBtn) { e.stopPropagation(); return decide(rejectBtn.dataset.reject, 'reject'); }
    if (artifactEl) return showArtifact(artifactEl.dataset.artifact);
    if (runEl) return showRun(runEl.dataset.run);
    if (agentEl) return runAgent(agentEl.dataset.agent);
  } catch (err) {
    alert(err.message);
  }
});

document.addEventListener('click', async (e) => {
  const replayBtn = e.target.closest('[data-replay]');
  if (!replayBtn) return;
  replayBtn.disabled = true;
  replayBtn.textContent = 'Replaying…';
  try {
    const out = await api(`/ws/${encodeURIComponent(state.wsId)}/runs/${encodeURIComponent(replayBtn.dataset.replay)}/replay`, { method: 'POST' });
    closeDrawer();
    await load();
    alert(`Replay complete: ${out.replayedSteps} step(s) reused, ${out.liveSteps} run live, cost ${usd(out.usd)}.`);
  } catch (err) {
    alert(err.message);
  }
});

async function decide(approvalId, action) {
  const actor = ($('#actor')?.value || state.actor || '').trim();
  if (!actor) { alert('Enter your name first — a decision has to record who made it.'); return; }
  state.actor = actor;
  localStorage.setItem('cmo.actor', actor);
  try {
    await api(`/ws/${encodeURIComponent(state.wsId)}/approvals/${encodeURIComponent(approvalId)}/${action}`, {
      method: 'POST',
      body: JSON.stringify({ by: actor }),
    });
    await load();
  } catch (err) {
    alert(`${err.payload?.code || 'Refused'}: ${err.message}`);
  }
}

async function runAgent(agentId) {
  if (!confirm(`Run ${agentId} for ${state.wsId}?`)) return;
  try {
    const out = await api(`/ws/${encodeURIComponent(state.wsId)}/runs`, {
      method: 'POST',
      body: JSON.stringify({ agentId, params: {} }),
    });
    await load();
    alert(`${agentId}: ${out.status}. ${out.summary || out.skipReason || ''} (${out.artifacts.length} artifacts, ${usd(out.usd)})`);
  } catch (err) {
    alert(err.message);
  }
}

document.querySelectorAll('.tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');
    state.view = tab.dataset.view;
    render();
  });
});

$('#ws-select').addEventListener('change', (e) => {
  state.wsId = e.target.value;
  localStorage.setItem('cmo.ws', state.wsId);
  load();
});

$('#theme-toggle').addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  localStorage.setItem('cmo.theme', next);
});

// ---------------------------------------------------------------------------
// boot
// ---------------------------------------------------------------------------

function render() {
  const o = state.overview;
  if (!o) { main.innerHTML = '<div class="empty">No workspace. Run <code>cmo demo</code> to create one.</div>'; return; }
  const views = {
    feed: () => renderFeed(o),
    approvals: () => renderApprovals(o),
    geo: () => renderGeo(o),
    runs: () => renderRuns(o),
    cost: () => renderCost(o),
    agents: () => renderAgents(),
    connectors: () => renderConnectors(o),
  };
  main.innerHTML = (views[state.view] || views.feed)();
  $('#approval-count').textContent = o.approvals.counts.pending || '';
  $('#footer-note').textContent = `${o.workspace.name || o.workspace.id} · ${o.profile?.url || 'no site configured'} · ${o.runs.length} runs · ${usd(o.cost.total)} lifetime spend`;
}

async function load() {
  try {
    const [{ workspaces }, health, agents] = await Promise.all([
      api('/workspaces'), api('/health'), state.agents ? Promise.resolve(state.agents) : api('/agents'),
    ]);
    state.workspaces = workspaces;
    state.health = health;
    state.agents = agents;

    const badge = $('#provider-badge');
    badge.textContent = health.provider.mock ? 'offline provider' : health.provider.name;
    badge.className = `badge ${health.provider.mock ? 'warn' : 'ok'}`;
    badge.title = health.provider.mock
      ? 'No API key set: running the deterministic offline provider. Everything works; output is synthetic.'
      : `Live provider · routing profile ${health.routingProfile}`;

    const sel = $('#ws-select');
    sel.innerHTML = workspaces.map((w) => `<option value="${esc(w.id)}">${esc(w.name || w.id)}${w.pendingApprovals ? ` (${w.pendingApprovals})` : ''}</option>`).join('');
    if (!workspaces.length) { state.overview = null; render(); return; }
    const saved = localStorage.getItem('cmo.ws');
    state.wsId = workspaces.some((w) => w.id === state.wsId) ? state.wsId
      : (workspaces.some((w) => w.id === saved) ? saved : workspaces[0].id);
    sel.value = state.wsId;

    state.overview = await api(`/ws/${encodeURIComponent(state.wsId)}/overview`);
    render();
  } catch (err) {
    main.innerHTML = `<div class="empty">Failed to load: ${esc(err.message)}</div>`;
  }
}

const savedTheme = localStorage.getItem('cmo.theme');
document.documentElement.dataset.theme = savedTheme
  || (window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
load();
setInterval(() => { if ($('#drawer').hidden) load(); }, 20000);
