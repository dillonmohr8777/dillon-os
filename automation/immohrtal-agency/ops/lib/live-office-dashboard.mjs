const ROLE_ABBREVIATIONS = Object.freeze({
  operations_finance_controller: 'OPS',
  demand_intelligence_lead: 'DEMAND',
  revenue_pipeline_manager: 'REVENUE',
  delivery_client_success_lead: 'DELIVERY',
  quality_risk_auditor: 'QUALITY'
});

const WORKER_ACCENTS = ['cyan', 'mint', 'cobalt', 'amber', 'coral'];
const SLOT_OFFSETS = [[-10, 5], [10, 5], [-13, -5], [13, -5], [0, 0]];
const FLOOR_ACTOR_MOTION_FIELDS = Object.freeze([
  'target_station_id',
  'dominant_item_id',
  'dominant_item_status',
  'board_updated_at'
]);

export function floorActorMotionKey(actor = {}) {
  return FLOOR_ACTOR_MOTION_FIELDS.map((field) => String(actor[field] ?? '')).join('\u001f');
}

export function changedFloorActors(previousActors = [], nextActors = []) {
  const previousByRole = new Map(previousActors.map((actor) => [actor.role_id, actor]));
  return nextActors.filter((actor) => floorActorMotionKey(previousByRole.get(actor.role_id)) !== floorActorMotionKey(actor));
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function safeJson(value) {
  return JSON.stringify(value)
    .replaceAll('<', '\\u003c')
    .replaceAll('>', '\\u003e')
    .replaceAll('&', '\\u0026');
}

function safeLocalPath(value, fallback = '') {
  const candidate = String(value ?? '').trim();
  return /^(?:\/|\.{1,2}\/)[A-Za-z0-9._/-]*$/.test(candidate) ? candidate.replace(/\/$/, '') : fallback;
}

function statusTone(state) {
  const value = String(state || '').toUpperCase();
  if ([
    'BLOCKED',
    'FAILED_QA',
    'WAITING_APPROVAL',
    'HAS_BLOCKED_WORK',
    'BLOCKED_SCOPE_RECONCILIATION_REQUIRED',
    'CONFIGURED_WITH_RECORDED_BLOCKERS'
  ].includes(value)) return 'attention';
  if ([
    'VERIFIED',
    'DONE',
    'VERIFIED_OR_DONE',
    'COMPLETED_LOCAL_DRY_RUN',
    'BUILT',
    'CONFIGURED',
    'ACTIVE'
  ].includes(value)) return 'verified';
  if ([
    'READY_FOR_REVIEW',
    'ASSIGNED',
    'IN_PROGRESS',
    'IN_PROGRESS_RECORDED'
  ].includes(value)) return 'active';
  return 'neutral';
}

function actorPosition(actor, stations) {
  const station = stations.find((item) => item.station_id === actor.target_station_id) || stations[0];
  const offset = Number(actor.station_occupancy || 1) > 1
    ? SLOT_OFFSETS[Number(actor.station_slot || 0) % SLOT_OFFSETS.length]
    : [0, 0];
  return {
    x: Math.max(6, Math.min(94, Number(station?.x || 50) + offset[0])),
    y: Math.max(8, Math.min(92, Number(station?.y || 50) + offset[1]))
  };
}

function renderWorker(actor, index, stations) {
  const position = actorPosition(actor, stations);
  const accent = WORKER_ACCENTS[index % WORKER_ACCENTS.length];
  const shortTitle = ROLE_ABBREVIATIONS[actor.role_id] || 'SEAT';
  const item = actor.dominant_item_id || 'NO ITEM';
  return `
    <div class="worker-track" data-role-id="${escapeHtml(actor.role_id)}" data-target-station="${escapeHtml(actor.target_station_id)}" data-home-station="${escapeHtml(actor.home_station_id)}" data-station-slot="${escapeHtml(actor.station_slot)}" style="--worker-x:${position.x}%;--worker-y:${position.y}%;--worker-delay:${index * 90}ms">
      <button class="worker-button worker--${accent}" type="button" aria-expanded="false" aria-controls="worker-inspector" aria-label="${escapeHtml(actor.title)}, ${escapeHtml(actor.target_station_id)} station, runtime ${escapeHtml(actor.runtime_state)}">
        <span class="worker-figure" aria-hidden="true">
          <span class="worker-shadow"></span>
          <span class="worker-head"><span class="worker-visor"></span></span>
          <span class="worker-torso"><span class="worker-core"></span></span>
          <span class="worker-arm worker-arm--left"></span>
          <span class="worker-arm worker-arm--right"></span>
          <span class="worker-leg worker-leg--left"></span>
          <span class="worker-leg worker-leg--right"></span>
        </span>
        <span class="worker-name"><b>${escapeHtml(shortTitle)}</b><small>${escapeHtml(item)}</small></span>
      </button>
    </div>`;
}

function renderStation(station) {
  return `
    <a class="station station--${escapeHtml(station.station_id)}" href="#activity-ledger" style="--station-x:${escapeHtml(station.x)}%;--station-y:${escapeHtml(station.y)}%" aria-label="${escapeHtml(station.label)} station. ${escapeHtml(station.purpose)}">
      <span class="station-node" aria-hidden="true"></span>
      <strong>${escapeHtml(station.short_label)}</strong>
      <small>${escapeHtml(station.label)}</small>
    </a>`;
}

function renderSeat(role, index) {
  const assignments = role.board_assignments.length
    ? role.board_assignments.map((item) => `
        <li class="assignment-row">
          <div class="assignment-id"><strong>${escapeHtml(item.item_id)}</strong><span class="status-chip ${statusTone(item.status)}">${escapeHtml(item.status)}</span></div>
          <div class="assignment-main"><p>${escapeHtml(item.next_action)}</p><dl><div><dt>Updated</dt><dd>${escapeHtml(item.updated_at)}</dd></div><div><dt>Due</dt><dd>${escapeHtml(item.due_at)}</dd></div><div><dt>Blocker</dt><dd>${escapeHtml(item.blocker)}</dd></div></dl></div>
        </li>`).join('')
    : '<li class="assignment-empty">No board assignment is recorded. This seat is idle with reason.</li>';
  return `
    <article class="seat-row" id="seat-${escapeHtml(role.role_id)}" aria-labelledby="seat-title-${escapeHtml(role.role_id)}">
      <header class="seat-identity">
        <span class="seat-index" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span>
        <div><h3 id="seat-title-${escapeHtml(role.role_id)}">${escapeHtml(role.title)}</h3><p>${escapeHtml(role.kind)} · reports to ${escapeHtml(role.reports_to)}</p></div>
      </header>
      <div class="seat-state">
        <span class="status-chip ${statusTone(role.work_state)}">${escapeHtml(role.work_state)}</span>
        <span class="runtime-truth"><b>Runtime</b> ${escapeHtml(role.runtime_state)}</span>
        <p>${escapeHtml(role.runtime_truth)}</p>
      </div>
      <ol class="assignment-list" aria-label="Current assignments for ${escapeHtml(role.title)}">${assignments}</ol>
    </article>`;
}

function renderMetric(label, value, key, prefix = '') {
  return `<div class="metric"><dt>${escapeHtml(label)}</dt><dd data-metric="${escapeHtml(key)}">${escapeHtml(prefix)}${escapeHtml(value)}</dd></div>`;
}

export function renderLiveOfficeDashboard(snapshot, options = {}) {
  const liveEndpoint = safeLocalPath(options.liveEndpoint, '');
  const fontBase = safeLocalPath(
    options.fontBase,
    '../../../../../../immohrtal-marketing-site/public/fonts'
  );
  const stations = snapshot.floor?.stations || [];
  const actors = snapshot.floor?.actors || [];
  const commercial = snapshot.standup.commercial_truth;
  const agency = snapshot.agency_run_evidence;
  const receiptGeneratedAt = snapshot.receipt_generated_at || snapshot.as_of;
  const initialActor = actors[0] || {};
  const initialRole = snapshot.roster.find((role) => role.role_id === initialActor.role_id) || snapshot.roster[0] || {};
  const initialAssignment = initialRole.board_assignments?.find((item) => item.item_id === initialActor.dominant_item_id)
    || initialRole.board_assignments?.[0]
    || {};

  const stationMarkup = stations.map(renderStation).join('');
  const workerMarkup = actors.map((actor, index) => renderWorker(actor, index, stations)).join('');
  const seatMarkup = snapshot.roster.map(renderSeat).join('');
  const lifecycleMarkup = [
    ['Artifacts', snapshot.office_lifecycle.build_state, 'Roster, board, runner, and receipt contract'],
    ['Configuration', snapshot.office_lifecycle.configuration_state, 'Current sources parsed and validated'],
    ['Invocation', snapshot.office_lifecycle.current_invocation_state, snapshot.as_of],
    ['Background runtime', snapshot.office_lifecycle.background_runtime_state, 'No persistent per-seat heartbeat supplied'],
    ['Daily Codex heartbeat', snapshot.office_lifecycle.codex_heartbeat_state, String(snapshot.office_lifecycle.codex_heartbeat_id || 'not supplied') + ' · ' + String(snapshot.office_lifecycle.codex_heartbeat_cadence || 'cadence unknown')],
    ['Manifest', snapshot.office_lifecycle.schedule_state === 'NOT_INSTALLED_OR_CHANGED_BY_THIS_RUNNER' ? 'NOT_INSTALLED_OR_CHANGED' : snapshot.office_lifecycle.schedule_state, 'No task change by this view']
  ].map(([label, state, detail]) => `<li><span>${escapeHtml(label)}</span><strong class="${statusTone(state)}-text">${escapeHtml(state)}</strong><small>${escapeHtml(detail)}</small></li>`).join('');

  const blockerMarkup = snapshot.board.blocking_items.length
    ? snapshot.board.blocking_items.map((item) => `
        <tr>
          <td data-label="Item"><strong>${escapeHtml(item.item_id)}</strong><span>${escapeHtml(item.status)}</span></td>
          <td data-label="Exact blocker">${escapeHtml(item.blocker)}</td>
          <td data-label="Required next action">${escapeHtml(item.next_action)}</td>
        </tr>`).join('')
    : '<tr><td data-label="Item"><strong>None</strong></td><td data-label="Exact blocker">No recorded blockers.</td><td data-label="Required next action">Continue the verified board flow.</td></tr>';

  const boardCounts = Object.entries(snapshot.board.status_counts)
    .filter(([, count]) => count > 0)
    .map(([state, count]) => `<div class="board-count"><span>${escapeHtml(state)}</span><strong>${escapeHtml(count)}</strong></div>`)
    .join('');

  const completedMarkup = snapshot.end_of_day.completed_or_verified_items.length
    ? snapshot.end_of_day.completed_or_verified_items.map((item) => `<li><strong>${escapeHtml(item.item_id)}</strong><span>${escapeHtml(item.status)}</span><p>${escapeHtml(item.artifact_locator)}</p></li>`).join('')
    : '<li><strong>None</strong><span>NO VERIFIED ITEM</span><p>No completed artifact is recorded.</p></li>';

  const agencyMarkup = agency.available
    ? `<dl class="receipt-ledger">
        <div><dt>Run</dt><dd>${escapeHtml(agency.run_id)}</dd></div>
        <div><dt>Observed</dt><dd>${escapeHtml(agency.as_of)}</dd></div>
        <div><dt>Status</dt><dd>${escapeHtml(agency.status)}</dd></div>
        <div><dt>Source authority</dt><dd>${escapeHtml(agency.source_authority_state)}</dd></div>
        <div><dt>External actions</dt><dd>${Object.values(agency.external_actions || {}).every((value) => Number(value || 0) === 0) ? '0' : 'VERIFY'}</dd></div>
      </dl>`
    : '<p class="empty-copy">No usable agency run receipt was found.</p>';

  const metricMarkup = [
    renderMetric('Researched', commercial.researched_today, 'researched_today'),
    renderMetric('Current', commercial.identity_confirmed_today, 'identity_confirmed_today'),
    renderMetric('Provisional', commercial.identity_provisional_today, 'identity_provisional_today'),
    renderMetric('Identity holds', commercial.identity_blocked_today, 'identity_blocked_today'),
    renderMetric('Qualified', commercial.qualified_today, 'qualified_today'),
    renderMetric('Social cards', commercial.social_post_ready_cards_created, 'social_post_ready_cards_created'),
    renderMetric('Messages', commercial.messages_sent, 'messages_sent'),
    renderMetric('Booked', commercial.meetings_booked, 'meetings_booked'),
    renderMetric('Clients', commercial.active_clients, 'active_clients'),
    renderMetric('New revenue', commercial.verified_new_revenue_usd, 'verified_new_revenue_usd', '$')
  ].join('');

  const outcomeMarkup = [
    ['Companies researched today', commercial.researched_today],
    ['Populated source rows', commercial.authorized_source_populated_rows],
    ['Company candidates', commercial.authorized_company_source_rows],
    ['Invalid non-company rows', commercial.invalid_non_company_source_rows],
    ['Current identities confirmed today', commercial.identity_confirmed_today],
    ['Provisional identities today', commercial.identity_provisional_today],
    ['Identities blocked today', commercial.identity_blocked_today],
    ['Authorized company rows remaining', commercial.remaining_authorized_source_rows],
    ['Governance clears', commercial.account_governance_cleared_current_exact_sources],
    ['Governance holds', commercial.account_governance_held_current_exact_sources],
    ['Governance pending', commercial.account_governance_pending_current_exact_sources],
    ['Qualified today', commercial.qualified_today],
    ['Drafts held', commercial.gmail_drafts_compliance_blocked],
    ['Post-ready social cards', commercial.social_post_ready_cards_created],
    ['Content queue items', commercial.content_queue_items],
    ['Social posts published', commercial.social_posts_published],
    ['HubSpot blueprint', commercial.hubspot_blueprint_created ? 'CREATED' : 'NOT CREATED'],
    ['HubSpot portal route', commercial.hubspot_portal_route_verified ? 'VERIFIED' : 'BLOCKED'],
    ['HubSpot configuration writes', commercial.hubspot_configuration_writes],
    ['Prospect messages sent', commercial.messages_sent],
    ['Owner status updates sent', commercial.owner_status_updates_sent],
    ['Meetings booked', commercial.meetings_booked],
    ['Active IMMOHRTAL clients', commercial.active_clients],
    ['Closed won', commercial.closed_won],
    ['Verified new revenue', '$' + commercial.verified_new_revenue_usd]
  ].map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join('');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex,nofollow,noarchive,nosnippet">
  <meta name="color-scheme" content="dark">
  <title>IMMOHRTAL Live Office · ${escapeHtml(snapshot.date_et)}</title>
  <script>document.documentElement.classList.add('has-js');if(new URLSearchParams(location.search).get('preview')==='mobile'){document.documentElement.classList.add('preview-mobile')}</script>
  <style>
    @font-face{font-family:"Unbounded Variable";src:url("${escapeHtml(fontBase)}/Unbounded-Variable-Latin.woff2") format("woff2");font-weight:100 900;font-display:swap}
    @font-face{font-family:"Manrope Variable";src:url("${escapeHtml(fontBase)}/Manrope-Variable-Latin.woff2") format("woff2");font-weight:100 900;font-display:swap}
    @font-face{font-family:"Foundry Mono";src:url("${escapeHtml(fontBase)}/FoundryMono-400.woff2") format("woff2");font-weight:400;font-display:swap}
    @font-face{font-family:"Foundry Mono";src:url("${escapeHtml(fontBase)}/FoundryMono-500.woff2") format("woff2");font-weight:500;font-display:swap}
    :root{color-scheme:dark;--ink:#020711;--observatory:#07101f;--raised:#0b1729;--paper:#f3f7fb;--platinum:#dce4ed;--muted:#a7bbd1;--cyan:#18c8ff;--mint:#58edb2;--cobalt:#287dff;--amber:#ffc56e;--coral:#ff8d8d;--line:rgba(166,204,240,.22);--line-strong:rgba(181,218,250,.42);--display:"Unbounded Variable","Arial Black",sans-serif;--body:"Manrope Variable","Segoe UI",sans-serif;--mono:"Foundry Mono","Cascadia Mono",monospace;--max:1480px}
    *{box-sizing:border-box}html{min-width:320px;background:var(--ink);scroll-behavior:smooth}body{margin:0;overflow-x:hidden;background:radial-gradient(circle at 50% -20%,rgba(40,125,255,.14),transparent 38%),var(--ink);color:var(--paper);font:400 1rem/1.5 var(--body);text-rendering:optimizeLegibility;-webkit-font-smoothing:antialiased}a{color:inherit}button{font:inherit}h1,h2,h3,p{margin-top:0}.visually-hidden{position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;white-space:nowrap!important;border:0!important}:focus-visible{outline:3px solid var(--mint);outline-offset:4px}.skip-link{position:fixed;z-index:100;top:12px;left:12px;transform:translateY(-160%);padding:10px 14px;border-radius:10px;background:var(--paper);color:var(--ink)}.skip-link:focus{transform:none}.shell{width:min(100% - 40px,var(--max));margin:0 auto}
    .masthead{padding:24px 0 18px;border-bottom:1px solid var(--line);background:rgba(2,7,17,.88)}.topline{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:28px;align-items:center}.brand-lockup{display:flex;align-items:center;gap:13px;color:var(--muted);font:500 .67rem/1.25 var(--mono);letter-spacing:.08em;text-transform:uppercase}.brand-mark{width:18px;height:18px;border:1px solid var(--cyan);border-radius:50%;box-shadow:inset 0 0 0 4px var(--ink),inset 0 0 0 6px var(--mint)}.hero-line{display:flex;align-items:flex-end;justify-content:space-between;gap:32px;margin-top:18px}.hero-copy h1{margin:0;font:720 clamp(2rem,4vw,4.2rem)/.96 var(--display);letter-spacing:-.045em}.hero-copy p{max-width:72ch;margin:10px 0 0;color:var(--muted);font-size:.92rem}.live-controls{display:flex;align-items:center;justify-content:flex-end;gap:9px;flex-wrap:wrap}.control-button{min-height:44px;padding:9px 13px;border:1px solid var(--line-strong);border-radius:12px;background:var(--raised);color:var(--paper);cursor:pointer;font:500 .67rem/1.2 var(--mono);letter-spacing:.04em;text-transform:uppercase}.control-button:hover{border-color:var(--cyan);transform:translateY(-1px)}.control-button:disabled{opacity:.48;cursor:not-allowed;transform:none}.feed-chip{display:inline-flex;align-items:center;gap:8px;min-height:34px;padding:7px 10px;border:1px solid var(--line-strong);border-radius:999px;color:var(--muted);font:500 .65rem/1.2 var(--mono);letter-spacing:.06em}.feed-chip::before{content:"";width:7px;height:7px;border-radius:50%;background:currentColor}.feed-chip.live{border-color:rgba(24,200,255,.5);color:var(--cyan)}.feed-chip.replay{border-color:rgba(255,197,110,.5);color:var(--amber)}.feed-chip.paused{color:var(--amber)}
    .live-office{padding:22px 0 44px}.office-layout{display:grid;grid-template-columns:minmax(0,1fr) 310px;gap:18px;align-items:start}.office-map{position:relative;height:460px;min-height:460px;overflow:hidden;contain:layout paint;border:1px solid var(--line-strong);border-radius:16px;background:linear-gradient(rgba(24,200,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(24,200,255,.04) 1px,transparent 1px),radial-gradient(circle at 50% 50%,rgba(40,125,255,.16),transparent 34%),var(--observatory);background-size:34px 34px,34px 34px,auto,auto;box-shadow:0 32px 90px rgba(0,0,0,.34);isolation:isolate}.office-map::before{content:"";position:absolute;inset:6%;border:1px solid var(--line);border-radius:50%;transform:scaleY(.62);pointer-events:none}.office-map::after{content:"";position:absolute;left:50%;top:50%;width:48%;height:1px;background:linear-gradient(90deg,transparent,var(--line-strong),transparent);transform:translate(-50%,-50%) rotate(-24deg);pointer-events:none}.map-label{position:absolute;z-index:2;top:18px;left:20px;display:flex;align-items:center;gap:10px;color:var(--muted);font:500 .64rem/1.2 var(--mono);letter-spacing:.08em;text-transform:uppercase}.map-label b{color:var(--platinum);font-weight:500}.station{position:absolute;z-index:3;left:var(--station-x);top:var(--station-y);display:grid;place-items:center;width:92px;min-height:72px;padding:8px;color:var(--muted);text-align:center;text-decoration:none;transform:translate(-50%,-50%)}.station-node{width:38px;height:26px;border:1px solid var(--line-strong);border-radius:10px;background:rgba(11,23,41,.8);box-shadow:inset 0 0 0 6px rgba(2,7,17,.55)}.station strong{margin-top:5px;color:var(--platinum);font:500 .62rem/1 var(--mono);letter-spacing:.08em}.station small{font-size:.64rem}.station--blocker .station-node{border-color:rgba(255,141,141,.52);box-shadow:inset 0 0 0 6px rgba(255,141,141,.08)}.station--evidence .station-node{border-color:rgba(88,237,178,.5);box-shadow:inset 0 0 0 6px rgba(88,237,178,.08)}.station:hover .station-node{border-color:var(--cyan)}
    .worker-track{position:absolute;z-index:8;left:var(--worker-x);top:var(--worker-y);width:90px;height:96px;pointer-events:none;transform:translate3d(-50%,-50%,0)}.worker-button{position:relative;width:90px;height:96px;padding:0;border:0;background:transparent;color:var(--paper);pointer-events:auto;cursor:pointer}.worker-figure{position:absolute;left:50%;top:0;width:50px;height:66px;transform:translateX(-50%);filter:drop-shadow(0 12px 16px rgba(0,0,0,.44))}.worker-shadow{position:absolute;left:6px;bottom:-2px;width:38px;height:9px;border-radius:50%;background:rgba(0,0,0,.44);transform:scaleX(.82)}.worker-head{position:absolute;left:13px;top:2px;width:24px;height:22px;border:2px solid currentColor;border-radius:10px;background:var(--raised)}.worker-head::before,.worker-head::after{content:"";position:absolute;top:-5px;width:2px;height:5px;background:currentColor}.worker-head::before{left:5px}.worker-head::after{right:5px}.worker-visor{position:absolute;left:4px;right:4px;top:7px;height:5px;border-radius:999px;background:currentColor;box-shadow:0 0 12px currentColor}.worker-torso{position:absolute;left:10px;top:25px;width:30px;height:27px;border:2px solid currentColor;border-radius:10px;background:var(--raised)}.worker-core{position:absolute;left:50%;top:7px;width:7px;height:7px;border:1px solid currentColor;border-radius:50%;transform:translateX(-50%)}.worker-arm,.worker-leg{position:absolute;width:5px;border-radius:999px;background:currentColor;transform-origin:top center}.worker-arm{top:29px;height:24px}.worker-arm--left{left:4px;transform:rotate(8deg)}.worker-arm--right{right:4px;transform:rotate(-8deg)}.worker-leg{top:50px;height:17px}.worker-leg--left{left:16px}.worker-leg--right{right:16px}.worker-name{position:absolute;left:50%;bottom:0;display:block;min-width:88px;padding:5px 7px;border:1px solid var(--line);border-radius:10px;background:rgba(2,7,17,.92);text-align:center;transform:translateX(-50%)}.worker-name b,.worker-name small{display:block;white-space:nowrap}.worker-name b{font:500 .56rem/1.15 var(--mono);letter-spacing:.07em}.worker-name small{margin-top:3px;color:var(--muted);font:400 .52rem/1.1 var(--mono)}.worker--cyan{color:var(--cyan)}.worker--mint{color:var(--mint)}.worker--cobalt{color:var(--cobalt)}.worker--amber{color:var(--amber)}.worker--coral{color:var(--coral)}.worker-button:hover .worker-name,.worker-button[aria-expanded="true"] .worker-name{border-color:currentColor}.worker-button[aria-expanded="true"] .worker-core{background:currentColor}.worker-track.is-moving .worker-arm--left{animation:walk-arm-left .38s ease-in-out infinite alternate}.worker-track.is-moving .worker-arm--right{animation:walk-arm-right .38s ease-in-out infinite alternate}.worker-track.is-moving .worker-leg--left{animation:walk-leg-left .38s ease-in-out infinite alternate}.worker-track.is-moving .worker-leg--right{animation:walk-leg-right .38s ease-in-out infinite alternate}@keyframes walk-arm-left{to{transform:rotate(-20deg)}}@keyframes walk-arm-right{to{transform:rotate(20deg)}}@keyframes walk-leg-left{to{transform:rotate(15deg)}}@keyframes walk-leg-right{to{transform:rotate(-15deg)}}
    .insight-rail{display:flex;flex-direction:column;min-width:0;height:460px;overflow-y:auto;border:1px solid var(--line-strong);border-radius:16px;background:var(--raised);box-shadow:0 32px 90px rgba(0,0,0,.28);scrollbar-color:var(--line-strong) transparent}.rail-head{padding:18px 18px 15px;border-bottom:1px solid var(--line)}.rail-kicker{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px;color:var(--muted);font:500 .62rem/1.2 var(--mono);letter-spacing:.07em;text-transform:uppercase}.rail-head h2{margin:0;font:650 1.08rem/1.2 var(--display);letter-spacing:-.025em}.rail-head p{margin:8px 0 0;color:var(--muted);font-size:.72rem}.metrics{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));margin:0;padding:0 18px;border-bottom:1px solid var(--line)}.metric{padding:13px 0}.metric:nth-child(even){padding-left:14px;border-left:1px solid var(--line)}.metric:nth-child(odd){padding-right:14px}.metric:nth-child(n+3){border-top:1px solid var(--line)}.metric dt{color:var(--muted);font-size:.64rem}.metric dd{margin:2px 0 0;font:600 1.35rem/1.15 var(--display);letter-spacing:-.04em}.worker-inspector{flex:1;padding:17px 18px}.worker-inspector .eyebrow{color:var(--cyan);font:500 .61rem/1.2 var(--mono);letter-spacing:.07em;text-transform:uppercase}.worker-inspector h3{margin:7px 0 4px;font-size:1rem}.worker-inspector .inspector-state{margin:0 0 13px;color:var(--muted);font-size:.7rem}.inspector-grid{margin:0}.inspector-grid>div{display:grid;grid-template-columns:78px minmax(0,1fr);gap:12px;padding:8px 0;border-top:1px solid var(--line)}.inspector-grid dt{color:var(--muted);font-size:.64rem}.inspector-grid dd{margin:0;font:400 .65rem/1.45 var(--mono);overflow-wrap:anywhere}.truth-boundary{padding:14px 18px;border-bottom:1px solid var(--line);color:var(--muted);font-size:.68rem}.truth-boundary strong{display:block;margin-bottom:5px;color:var(--amber);font:500 .61rem/1.2 var(--mono);letter-spacing:.07em}
    .lifecycle{padding:0 0 64px}.lifecycle-list{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));margin:0;padding:0;border-block:1px solid var(--line);list-style:none}.lifecycle-list li{min-width:0;padding:18px 16px}.lifecycle-list li+li{border-left:1px solid var(--line)}.lifecycle-list span,.lifecycle-list small{display:block;color:var(--muted)}.lifecycle-list span{margin-bottom:6px;font-size:.67rem}.lifecycle-list strong{display:block;overflow-wrap:anywhere;font:500 .62rem/1.35 var(--mono)}.lifecycle-list small{margin-top:6px;font-size:.63rem;line-height:1.4}.verified-text{color:var(--mint)!important}.attention-text{color:var(--amber)!important}.active-text{color:var(--cyan)!important}.neutral-text{color:var(--muted)!important}
    .section-head{display:grid;grid-template-columns:minmax(220px,.7fr) minmax(0,1.3fr);gap:60px;align-items:end;margin-bottom:30px}.section-head h2{margin:0;font:680 clamp(1.55rem,3vw,2.8rem)/1 var(--display);letter-spacing:-.04em}.section-head p{max-width:70ch;margin:0;color:var(--muted)}.activity-ledger{padding:52px 0 90px}.seat-row{display:grid;grid-template-columns:minmax(220px,.7fr) minmax(200px,.5fr) minmax(0,1.3fr);gap:34px;padding:30px 0;border-top:1px solid var(--line)}.seat-row:last-child{border-bottom:1px solid var(--line)}.seat-identity{display:flex;gap:14px}.seat-index{padding-top:4px;color:var(--cyan);font:500 .66rem/1 var(--mono)}.seat-identity h3{margin:0 0 7px;font-size:1.04rem;line-height:1.2}.seat-identity p{margin:0;color:var(--muted);font-size:.72rem}.status-chip{display:inline-flex;width:max-content;max-width:100%;padding:5px 8px;border:1px solid var(--line-strong);border-radius:999px;font:500 .59rem/1.2 var(--mono);letter-spacing:.04em;overflow-wrap:anywhere}.status-chip.verified{border-color:rgba(88,237,178,.48);color:var(--mint)}.status-chip.active{border-color:rgba(24,200,255,.5);color:var(--cyan)}.status-chip.attention{border-color:rgba(255,197,110,.52);color:var(--amber)}.status-chip.neutral{color:var(--muted)}.runtime-truth{display:block;margin-top:11px;color:var(--platinum);font-size:.72rem}.runtime-truth b{margin-right:6px;color:var(--muted);font:500 .6rem/1 var(--mono);letter-spacing:.06em;text-transform:uppercase}.seat-state p{margin:10px 0 0;color:var(--muted);font-size:.72rem}.assignment-list{margin:0;padding:0;list-style:none}.assignment-row{display:grid;grid-template-columns:125px minmax(0,1fr);gap:18px;padding-bottom:18px}.assignment-row+.assignment-row{padding-top:18px;border-top:1px solid var(--line)}.assignment-id{display:flex;flex-direction:column;align-items:flex-start;gap:8px}.assignment-id strong{font:500 .7rem/1.2 var(--mono)}.assignment-main p{margin:0 0 12px;color:var(--platinum);font-size:.8rem}.assignment-main dl{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:0}.assignment-main dt{margin-bottom:4px;color:var(--muted);font:500 .57rem/1.2 var(--mono);letter-spacing:.05em;text-transform:uppercase}.assignment-main dd{margin:0;color:var(--muted);font-size:.68rem;overflow-wrap:anywhere}.assignment-empty{color:var(--muted);font-size:.8rem}
    .control-floor{padding:84px 0;background:var(--observatory);border-block:1px solid var(--line)}.board-grid{display:grid;grid-template-columns:minmax(250px,.58fr) minmax(0,1.42fr);gap:62px;align-items:start}.board-counts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));border-top:1px solid var(--line)}.board-count{display:flex;align-items:baseline;justify-content:space-between;gap:15px;padding:15px 0;border-bottom:1px solid var(--line)}.board-count:nth-child(odd){padding-right:15px}.board-count:nth-child(even){padding-left:15px;border-left:1px solid var(--line)}.board-count span{color:var(--muted);font:500 .6rem/1.3 var(--mono);overflow-wrap:anywhere}.board-count strong{font:650 1.32rem/1 var(--display)}.ledger-table{width:100%;border-collapse:collapse}.ledger-table caption{padding:0 0 12px;color:var(--muted);text-align:left;font:500 .61rem/1.3 var(--mono);letter-spacing:.06em;text-transform:uppercase}.ledger-table th,.ledger-table td{padding:14px 12px;border-bottom:1px solid var(--line);vertical-align:top;text-align:left}.ledger-table th{color:var(--muted);font:500 .59rem/1.3 var(--mono);letter-spacing:.06em;text-transform:uppercase}.ledger-table td{color:var(--muted);font-size:.73rem}.ledger-table td:first-child{width:110px;color:var(--paper)}.ledger-table td strong,.ledger-table td span{display:block}.ledger-table td span{margin-top:4px;color:var(--amber);font:500 .57rem/1.2 var(--mono)}
    .closeout{padding:86px 0}.closeout-grid{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(300px,.8fr);gap:70px}.completed-list{margin:24px 0 0;padding:0;border-top:1px solid var(--line);list-style:none}.completed-list li{display:grid;grid-template-columns:84px 120px minmax(0,1fr);gap:16px;padding:15px 0;border-bottom:1px solid var(--line)}.completed-list strong{font:500 .67rem/1.4 var(--mono)}.completed-list span{color:var(--mint);font:500 .58rem/1.4 var(--mono)}.completed-list p{margin:0;color:var(--muted);font-size:.72rem;overflow-wrap:anywhere}.receipt-panel{padding:24px;border:1px solid var(--line);border-radius:14px;background:var(--raised);box-shadow:0 26px 70px rgba(0,0,0,.28)}.receipt-panel h2{margin-bottom:10px;font-size:1.08rem}.receipt-panel>p{color:var(--muted);font-size:.75rem}.receipt-ledger{margin:18px 0 0}.receipt-ledger>div{display:flex;justify-content:space-between;gap:18px;padding:9px 0;border-top:1px solid var(--line)}.receipt-ledger dt{color:var(--muted);font-size:.65rem}.receipt-ledger dd{margin:0;text-align:right;font:500 .62rem/1.35 var(--mono);overflow-wrap:anywhere}.outcomes{margin-top:58px}.outcome-line{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));margin:0;border-block:1px solid var(--line)}.outcome-line div{padding:18px 14px}.outcome-line div+div{border-left:1px solid var(--line)}.outcome-line div:nth-child(6n+1){border-left:0}.outcome-line div:nth-child(n+7){border-top:1px solid var(--line)}.outcome-line dt{color:var(--muted);font-size:.62rem}.outcome-line dd{margin:5px 0 0;font:650 1.28rem/1 var(--display);letter-spacing:-.04em}.footer{padding:28px 0 44px;border-top:1px solid var(--line);color:var(--muted);font-size:.7rem}.footer p{max-width:96ch;margin:0}.empty-copy{color:var(--muted)}
    @media(max-width:1120px){.office-layout{grid-template-columns:1fr}.insight-rail{display:grid;grid-template-columns:1fr 1.4fr;height:auto;overflow:visible}.rail-head,.metrics{grid-column:1}.truth-boundary{grid-column:1}.worker-inspector{grid-column:2;grid-row:1/span 3}.office-map{height:520px;min-height:520px}.lifecycle-list{grid-template-columns:repeat(3,minmax(0,1fr))}.lifecycle-list li:nth-child(4){border-left:0}.lifecycle-list li:nth-child(n+4){border-top:1px solid var(--line)}.section-head,.board-grid,.closeout-grid{grid-template-columns:1fr;gap:30px}.seat-row{grid-template-columns:minmax(220px,.7fr) minmax(0,1.3fr)}.seat-state{grid-column:1}.assignment-list{grid-column:2;grid-row:1/span 2}.outcome-line{grid-template-columns:repeat(3,minmax(0,1fr))}.outcome-line div:nth-child(3n+1){border-left:0}.outcome-line div:nth-child(n+4){border-top:1px solid var(--line)}}
    @media(max-width:720px){.shell{width:min(100% - 26px,var(--max))}.masthead{padding-top:18px}.topline{grid-template-columns:1fr}.live-controls{justify-content:flex-start}.hero-line{display:block}.hero-copy h1{font-size:2.2rem}.hero-copy p{font-size:.82rem}.live-office{padding-top:14px}.office-map{height:460px;min-height:460px;overflow:hidden}.office-map::before{inset:8% 2%}.station{width:76px;min-height:64px}.station small{display:none}.worker-track,.worker-button{width:78px;height:88px}.worker-name{min-width:76px}.worker-name b{font-size:.5rem}.worker-name small{font-size:.48rem}.insight-rail{display:block;height:auto;overflow:visible}.metrics{grid-template-columns:repeat(2,minmax(0,1fr))}.worker-inspector{border-top:1px solid var(--line)}.lifecycle{padding-bottom:48px}.lifecycle-list{display:block}.lifecycle-list li,.lifecycle-list li+li{padding:14px 0;border-left:0}.lifecycle-list li+li{border-top:1px solid var(--line)}.activity-ledger{padding:30px 0 64px}.section-head{margin-bottom:18px}.seat-row{display:block;padding:24px 0}.seat-state{margin:18px 0 24px}.assignment-row{grid-template-columns:1fr}.assignment-id{flex-direction:row;align-items:center}.assignment-main dl{grid-template-columns:1fr}.control-floor,.closeout{padding:62px 0}.board-counts{display:block}.board-count,.board-count:nth-child(even),.board-count:nth-child(odd){padding:14px 0;border-left:0}.ledger-table,.ledger-table tbody,.ledger-table tr,.ledger-table td{display:block;width:100%}.ledger-table thead{display:none}.ledger-table tr{padding:16px 0;border-bottom:1px solid var(--line)}.ledger-table td,.ledger-table td:first-child{width:auto;padding:5px 0;border:0}.ledger-table td::before{content:attr(data-label);display:block;margin-bottom:3px;color:var(--muted);font:500 .56rem/1.2 var(--mono);letter-spacing:.06em;text-transform:uppercase}.completed-list li{grid-template-columns:72px minmax(0,1fr)}.completed-list p{grid-column:1/-1}.outcome-line{display:block}.outcome-line div,.outcome-line div+div{border-top:1px solid var(--line);border-left:0}.outcome-line div:first-child{border-top:0}}
    html.preview-mobile{width:390px;max-width:390px;overflow-x:hidden}html.preview-mobile body{width:390px;max-width:390px}.preview-mobile .shell{width:min(100% - 26px,var(--max))}.preview-mobile .masthead{padding-top:18px}.preview-mobile .topline{grid-template-columns:1fr}.preview-mobile .live-controls{justify-content:flex-start}.preview-mobile .hero-line{display:block}.preview-mobile .hero-copy h1{font-size:2.2rem}.preview-mobile .hero-copy p{font-size:.82rem}.preview-mobile .live-office{padding-top:14px}.preview-mobile .office-layout{grid-template-columns:1fr}.preview-mobile .office-map{min-height:460px;overflow:hidden}.preview-mobile .office-map::before{inset:8% 2%}.preview-mobile .station{width:76px;min-height:64px}.preview-mobile .station small{display:none}.preview-mobile .worker-track,.preview-mobile .worker-button{width:78px;height:88px}.preview-mobile .worker-name{min-width:76px}.preview-mobile .worker-name b{font-size:.5rem}.preview-mobile .worker-name small{font-size:.48rem}.preview-mobile .insight-rail{display:block}.preview-mobile .metrics{grid-template-columns:repeat(2,minmax(0,1fr))}.preview-mobile .worker-inspector{border-top:1px solid var(--line)}.preview-mobile .lifecycle{padding-bottom:48px}.preview-mobile .lifecycle-list{display:block}.preview-mobile .lifecycle-list li,.preview-mobile .lifecycle-list li+li{padding:14px 0;border-left:0}.preview-mobile .lifecycle-list li+li{border-top:1px solid var(--line)}.preview-mobile .activity-ledger{padding:30px 0 64px}.preview-mobile .section-head{display:block;margin-bottom:18px}.preview-mobile .section-head p{margin-top:14px}.preview-mobile .seat-row{display:block;padding:24px 0}.preview-mobile .seat-state{margin:18px 0 24px}.preview-mobile .assignment-row{grid-template-columns:1fr}.preview-mobile .assignment-id{flex-direction:row;align-items:center}.preview-mobile .assignment-main dl{grid-template-columns:1fr}.preview-mobile .control-floor,.preview-mobile .closeout{padding:62px 0}.preview-mobile .board-counts{display:block}.preview-mobile .board-count,.preview-mobile .board-count:nth-child(even),.preview-mobile .board-count:nth-child(odd){padding:14px 0;border-left:0}.preview-mobile .ledger-table,.preview-mobile .ledger-table tbody,.preview-mobile .ledger-table tr,.preview-mobile .ledger-table td{display:block;width:100%}.preview-mobile .ledger-table thead{display:none}.preview-mobile .ledger-table tr{padding:16px 0;border-bottom:1px solid var(--line)}.preview-mobile .ledger-table td,.preview-mobile .ledger-table td:first-child{width:auto;padding:5px 0;border:0}.preview-mobile .ledger-table td::before{content:attr(data-label);display:block;margin-bottom:3px;color:var(--muted);font:500 .56rem/1.2 var(--mono);letter-spacing:.06em;text-transform:uppercase}.preview-mobile .closeout-grid{grid-template-columns:1fr}.preview-mobile .completed-list li{grid-template-columns:72px minmax(0,1fr)}.preview-mobile .completed-list p{grid-column:1/-1}.preview-mobile .outcome-line{display:block}.preview-mobile .outcome-line div,.preview-mobile .outcome-line div+div{border-top:1px solid var(--line);border-left:0}.preview-mobile .outcome-line div:first-child{border-top:0}
    @media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}.worker-track{transition:none!important}.worker-track.is-moving .worker-arm,.worker-track.is-moving .worker-leg{animation:none!important}.control-button:hover{transform:none}}
    @media print{body{background:var(--paper);color:var(--ink)}.masthead,.control-floor{background:var(--paper)}.office-map,.insight-rail,.receipt-panel{border:1px solid var(--muted);background:var(--paper);box-shadow:none}.worker-track{transition:none}.worker-figure{filter:none}.worker-name,.station-node{background:var(--paper)}.hero-copy p,.rail-head p,.metric dt,.worker-inspector .inspector-state,.inspector-grid dt,.truth-boundary,.section-head p,.seat-identity p,.seat-state p,.assignment-main dd,.ledger-table td,.completed-list p,.receipt-panel>p,.footer{color:var(--raised)}.status-chip{color:var(--ink)!important;border-color:var(--muted)}.shell{width:100%}.control-button{display:none}}
  </style>
  <style>
    .receipt-stamp,.receipt-evidence-note{display:flex;gap:10px;align-items:flex-start;padding:12px 14px;border:1px solid var(--line);border-radius:10px;background:rgba(11,23,41,.56);color:var(--muted);font-size:.68rem}.receipt-stamp{margin-top:14px}.receipt-stamp strong,.receipt-evidence-note strong{flex:0 0 auto;color:var(--amber);font:500 .58rem/1.3 var(--mono);letter-spacing:.06em;text-transform:uppercase}.receipt-evidence-note{margin:0 0 24px}.receipt-evidence-note time{font-family:var(--mono);color:var(--platinum)}
  </style>
</head>
<body data-live-endpoint="${escapeHtml(liveEndpoint)}">
  <a class="skip-link" href="#live-office">Skip to live office</a>
  <header class="masthead">
    <div class="shell">
      <div class="topline">
        <div class="brand-lockup"><span class="brand-mark" aria-hidden="true"></span>IMMOHRTAL Marketing Solutions · Private operating floor</div>
        <div class="live-controls" aria-label="Office controls">
          <span class="feed-chip" id="feed-chip">STATIC RECEIPT</span>
          <button class="control-button" id="replay-receipt" type="button">Replay receipt</button>
          <button class="control-button" id="refresh-state" type="button"${liveEndpoint ? '' : ' disabled'}>Refresh state</button>
          <button class="control-button" id="pause-updates" type="button"${liveEndpoint ? '' : ' disabled'}>Pause updates</button>
        </div>
      </div>
      <div class="hero-line">
        <div class="hero-copy"><h1>The crew is on the floor.</h1><p>Five accountable seats move through recorded work. The local feed can update the board in real time, while per-seat runtime stays <strong>NOT_OBSERVED</strong> until a current process receipt exists.</p></div>
      </div>
    </div>
  </header>
  <main>
    <section class="live-office" id="live-office" aria-labelledby="live-office-heading">
      <h2 class="visually-hidden" id="live-office-heading">Live local IMMOHRTAL office</h2>
      <div class="shell office-layout">
        <div class="office-map" id="office-map" data-source-fingerprint="${escapeHtml(snapshot.floor?.source_state_fingerprint)}">
          <div class="map-label"><b>Living evidence floor</b><span id="map-mode">RECORDED SNAPSHOT</span></div>
          ${stationMarkup}
          ${workerMarkup}
        </div>
        <aside class="insight-rail" aria-label="Real-time office insights">
          <header class="rail-head">
            <div class="rail-kicker"><span>Local feed checked</span><time id="local-feed-checked">Not checked</time></div>
            <h2>Commercial truth</h2>
            <p id="feed-detail">Embedded receipt. No local poll has succeeded yet.</p>
            <div class="receipt-stamp"><strong>Static receipt</strong><span>Generated <time datetime="${escapeHtml(receiptGeneratedAt)}">${escapeHtml(receiptGeneratedAt)}</time>. Lower evidence stays at this receipt timestamp.</span></div>
          </header>
          <div class="truth-boundary"><strong>RUNTIME TRUTH</strong><span id="truth-boundary">${escapeHtml(snapshot.floor?.motion_truth)}</span></div>
          <dl class="metrics">${metricMarkup}</dl>
          <section class="worker-inspector" id="worker-inspector" aria-live="polite">
            <span class="eyebrow" id="inspector-role">${escapeHtml(initialActor.target_station_id || 'control')} station</span>
            <h3 id="inspector-title">${escapeHtml(initialRole.title || 'No selected seat')}</h3>
            <p class="inspector-state" id="inspector-state">${escapeHtml(initialRole.work_state || 'NO_STATE')} · runtime ${escapeHtml(initialRole.runtime_state || 'NOT_OBSERVED')}</p>
            <dl class="inspector-grid">
              <div><dt>Item</dt><dd id="inspector-item">${escapeHtml(initialAssignment.item_id || 'No current item')}</dd></div>
              <div><dt>Updated</dt><dd id="inspector-updated">${escapeHtml(initialAssignment.updated_at || 'Not recorded')}</dd></div>
              <div><dt>Blocker</dt><dd id="inspector-blocker">${escapeHtml(initialAssignment.blocker || 'No recorded blocker')}</dd></div>
              <div><dt>Next</dt><dd id="inspector-next">${escapeHtml(initialAssignment.next_action || 'No recorded next action')}</dd></div>
            </dl>
          </section>
        </aside>
      </div>
    </section>
    <section class="lifecycle" aria-labelledby="lifecycle-heading">
      <div class="shell"><h2 class="visually-hidden" id="lifecycle-heading">Office lifecycle</h2><ul class="lifecycle-list">${lifecycleMarkup}</ul></div>
    </section>
    <section class="activity-ledger" id="activity-ledger" aria-labelledby="activity-heading">
      <div class="shell">
        <header class="section-head"><h2 id="activity-heading">Every seat, inspectable.</h2><p>Board state and runtime state remain separate. The worker floor is a navigable view of the same item IDs, timestamps, blockers, and next actions recorded below.</p></header>
        <div class="receipt-evidence-note" data-static-receipt="true"><strong>Static receipt evidence</strong><span>Generated <time datetime="${escapeHtml(receiptGeneratedAt)}">${escapeHtml(receiptGeneratedAt)}</time>. This lower ledger does not refresh from the local feed.</span></div>
        ${seatMarkup}
      </div>
    </section>
    <section class="control-floor" aria-labelledby="control-heading">
      <div class="shell">
        <header class="section-head"><h2 id="control-heading">Board and exceptions</h2><p><span data-board-total>${escapeHtml(snapshot.board.total_items)}</span> current items. <span data-board-active>${escapeHtml(snapshot.board.active_items)}</span> remain active. Exact blockers stay visible until evidence or authority resolves them.</p></header>
        <div class="receipt-evidence-note" data-static-receipt="true"><strong>Static receipt evidence</strong><span>Generated <time datetime="${escapeHtml(receiptGeneratedAt)}">${escapeHtml(receiptGeneratedAt)}</time>. These board counts and blockers do not refresh from the local feed.</span></div>
        <div class="board-grid">
          <div class="board-counts">${boardCounts}</div>
          <table class="ledger-table"><caption>Current blockers and required next actions</caption><thead><tr><th>Item</th><th>Exact blocker</th><th>Required next action</th></tr></thead><tbody>${blockerMarkup}</tbody></table>
        </div>
      </div>
    </section>
    <section class="closeout" aria-labelledby="closeout-heading">
      <div class="shell">
        <header class="section-head"><h2 id="closeout-heading">Daily closeout</h2><p>${escapeHtml(snapshot.end_of_day.process_correction)}</p></header>
        <div class="receipt-evidence-note" data-static-receipt="true"><strong>Static receipt evidence</strong><span>Generated <time datetime="${escapeHtml(receiptGeneratedAt)}">${escapeHtml(receiptGeneratedAt)}</time>. This closeout remains the embedded receipt and does not refresh.</span></div>
        <div class="closeout-grid">
          <div><h2>Verified or done</h2><ul class="completed-list">${completedMarkup}</ul></div>
          <aside class="receipt-panel"><h2>Latest agency evidence</h2><p>${escapeHtml(agency.does_not_prove)}</p>${agencyMarkup}</aside>
        </div>
        <section class="outcomes" aria-labelledby="outcome-heading"><h2 class="visually-hidden" id="outcome-heading">Daily research and commercial outcomes</h2><dl class="outcome-line">${outcomeMarkup}</dl></section>
      </div>
    </section>
  </main>
  <footer class="footer"><div class="shell"><p>Receipt evidence generated <time id="receipt-generated-at" datetime="${escapeHtml(receiptGeneratedAt)}">${escapeHtml(receiptGeneratedAt)}</time> from hashed local roster, command-board, scorecard, live dashboard renderer, and available run-receipt sources. The local feed checked timestamp above is separate. This view performs no message, calendar, CRM, deployment, purchase, schedule, or credential write.</p></div></footer>
  <div class="visually-hidden" id="office-announcer" aria-live="polite" aria-atomic="true"></div>
  <script type="application/json" id="office-initial-state">${safeJson(snapshot)}</script>
  <script>
  (() => {
    'use strict';
    const stateNode = document.getElementById('office-initial-state');
    const endpoint = document.body.dataset.liveEndpoint || '';
    const map = document.getElementById('office-map');
    const feedChip = document.getElementById('feed-chip');
    const feedDetail = document.getElementById('feed-detail');
    const mapMode = document.getElementById('map-mode');
    const localFeedChecked = document.getElementById('local-feed-checked');
    const announcer = document.getElementById('office-announcer');
    const replayButton = document.getElementById('replay-receipt');
    const refreshButton = document.getElementById('refresh-state');
    const pauseButton = document.getElementById('pause-updates');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let currentState = JSON.parse(stateNode.textContent);
    let connected = false;
    let paused = false;
    let pollTimer = 0;
    let replayTimer = 0;

    function announce(message) {
      window.clearTimeout(announce.timer);
      announce.timer = window.setTimeout(() => { announcer.textContent = message; }, 120);
    }

    function setFeed(mode, detail) {
      feedChip.textContent = mode;
      feedChip.className = 'feed-chip';
      if (mode === 'LIVE LOCAL') feedChip.classList.add('live');
      if (mode === 'RECEIPT REPLAY') feedChip.classList.add('replay');
      if (mode.startsWith('PAUSED')) feedChip.classList.add('paused');
      if (detail) feedDetail.textContent = detail;
      mapMode.textContent = mode;
    }

    function setLocalFeedChecked(timestamp) {
      const checkedAt = timestamp || new Date().toISOString();
      localFeedChecked.dateTime = checkedAt;
      localFeedChecked.textContent = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit', second: '2-digit' }).format(new Date(checkedAt));
    }

    function stationsById(state) {
      return new Map((state.floor?.stations || []).map((station) => [station.station_id, station]));
    }

    function actorMotionKey(actor) {
      return [actor?.target_station_id, actor?.dominant_item_id, actor?.dominant_item_status, actor?.board_updated_at].map((value) => String(value ?? '')).join('\\u001f');
    }

    function changedFloorActors(previousActors, nextActors) {
      const previousByRole = new Map(previousActors.map((actor) => [actor.role_id, actor]));
      return nextActors.filter((actor) => actorMotionKey(previousByRole.get(actor.role_id)) !== actorMotionKey(actor));
    }

    function positionFor(actor, stationId, slotOverride) {
      const station = stationsById(currentState).get(stationId) || { x: 50, y: 50 };
      const slot = Number(slotOverride ?? actor.station_slot ?? 0) % ${SLOT_OFFSETS.length};
      const offsets = ${JSON.stringify(SLOT_OFFSETS)};
      const offset = Number(actor.station_occupancy || 1) > 1 ? offsets[slot] : [0, 0];
      return {
        x: Math.max(6, Math.min(94, Number(station.x || 50) + offset[0])),
        y: Math.max(8, Math.min(92, Number(station.y || 50) + offset[1]))
      };
    }

    function moveTrack(track, actor, stationId, slot, animate) {
      const previousRect = track.getBoundingClientRect();
      const position = positionFor(actor, stationId, slot);
      track.style.setProperty('--worker-x', position.x + '%');
      track.style.setProperty('--worker-y', position.y + '%');
      track.dataset.targetStation = actor.target_station_id;
      track.dataset.stationSlot = String(actor.station_slot || 0);
      const button = track.querySelector('.worker-button');
      button.setAttribute('aria-label', actor.title + ', ' + actor.target_station_id + ' station, runtime ' + actor.runtime_state);
      const item = button.querySelector('.worker-name small');
      if (item) item.textContent = actor.dominant_item_id || 'NO ITEM';
      if (animate && !reducedMotion.matches) {
        const nextRect = track.getBoundingClientRect();
        const deltaX = previousRect.left - nextRect.left;
        const deltaY = previousRect.top - nextRect.top;
        track.getAnimations().forEach((animation) => animation.cancel());
        track.animate([
          { transform: 'translate3d(calc(-50% + ' + deltaX + 'px),calc(-50% + ' + deltaY + 'px),0)' },
          { transform: 'translate3d(-50%,-50%,0)' }
        ], { duration: 760, delay: Number.parseInt(getComputedStyle(track).getPropertyValue('--worker-delay'), 10) || 0, easing: 'cubic-bezier(.16,1,.3,1)' });
        track.classList.add('is-moving');
        window.setTimeout(() => track.classList.remove('is-moving'), 900);
      }
    }

    function updateInspector(roleId) {
      const role = currentState.roster.find((item) => item.role_id === roleId);
      const actor = currentState.floor?.actors?.find((item) => item.role_id === roleId);
      if (!role || !actor) return;
      const assignment = role.board_assignments.find((item) => item.item_id === actor.dominant_item_id)
        || role.board_assignments[0]
        || {};
      document.getElementById('inspector-role').textContent = actor.target_station_id + ' station';
      document.getElementById('inspector-title').textContent = role.title;
      document.getElementById('inspector-state').textContent = role.work_state + ' · runtime ' + role.runtime_state;
      document.getElementById('inspector-item').textContent = assignment.item_id || 'No current item';
      document.getElementById('inspector-updated').textContent = assignment.updated_at || 'Not recorded';
      document.getElementById('inspector-blocker').textContent = assignment.blocker || 'No recorded blocker';
      document.getElementById('inspector-next').textContent = assignment.next_action || 'No recorded next action';
      map.querySelectorAll('.worker-button').forEach((button) => button.setAttribute('aria-expanded', 'false'));
      const selected = map.querySelector('[data-role-id="' + CSS.escape(roleId) + '"] .worker-button');
      if (selected) selected.setAttribute('aria-expanded', 'true');
    }

    function updateMetrics(state) {
      const commercial = state.standup?.commercial_truth || {};
      document.querySelectorAll('[data-metric]').forEach((element) => {
        const key = element.dataset.metric;
        const prefix = key === 'verified_new_revenue_usd' ? '$' : '';
        element.textContent = prefix + String(commercial[key] ?? 0);
      });
      const total = document.querySelector('[data-board-total]');
      const active = document.querySelector('[data-board-active]');
      if (total) total.textContent = String(state.board?.total_items ?? 0);
      if (active) active.textContent = String(state.board?.active_items ?? 0);
    }

    function applySnapshot(nextState, servedAt) {
      const previousActors = currentState.floor?.actors || [];
      const changedActors = changedFloorActors(previousActors, nextState.floor?.actors || []);
      const changedRoleIds = new Set(changedActors.map((actor) => actor.role_id));
      currentState = nextState;
      map.dataset.sourceFingerprint = nextState.floor?.source_state_fingerprint || '';
      updateMetrics(nextState);
      setLocalFeedChecked(servedAt);
      (nextState.floor?.actors || []).forEach((actor) => {
        const track = map.querySelector('[data-role-id="' + CSS.escape(actor.role_id) + '"]');
        if (track) moveTrack(track, actor, actor.target_station_id, actor.station_slot, changedRoleIds.has(actor.role_id) && !paused);
      });
      const selected = map.querySelector('.worker-button[aria-expanded="true"]')?.closest('[data-role-id]')?.dataset.roleId
        || nextState.floor?.actors?.[0]?.role_id;
      if (selected) updateInspector(selected);
      if (changedActors.length) {
        const labels = changedActors.map((actor) => actor.title || actor.role_id).join(', ');
        announce('Recorded state changed for ' + labels + '. Only those workers moved.');
      }
    }

    async function pollState() {
      window.clearTimeout(pollTimer);
      if (!endpoint || paused || document.hidden) return;
      setLocalFeedChecked();
      try {
        const response = await fetch(endpoint, { cache: 'no-store', headers: { Accept: 'application/json' } });
        if (!response.ok) throw new Error('HTTP ' + response.status);
        const payload = await response.json();
        if (!payload?.snapshot) throw new Error('Missing snapshot');
        applySnapshot(payload.snapshot, payload.served_at);
        connected = true;
        setFeed('LIVE LOCAL', 'Read-only localhost feed connected. Seat runtime still requires separate current receipts.');
      } catch {
        connected = false;
        setFeed('STATIC RECEIPT', 'Local polling is unavailable. The embedded receipt remains visible.');
      } finally {
        if (!paused && !document.hidden) pollTimer = window.setTimeout(pollState, 4800);
      }
    }

    function replayReceipt({ automatic = false } = {}) {
      window.clearTimeout(replayTimer);
      const actors = currentState.floor?.actors || [];
      if (reducedMotion.matches) {
        actors.forEach((actor) => {
          const track = map.querySelector('[data-role-id="' + CSS.escape(actor.role_id) + '"]');
          if (track) moveTrack(track, actor, actor.target_station_id, actor.station_slot, false);
        });
        announce('Receipt replay is shown at final stations because reduced motion is enabled.');
        return;
      }
      setFeed('RECEIPT REPLAY', 'Authored movement through recorded stations. This is not an online claim.');
      actors.forEach((actor, index) => {
        const track = map.querySelector('[data-role-id="' + CSS.escape(actor.role_id) + '"]');
        if (!track) return;
        moveTrack(track, actor, actor.home_station_id, index % 2, false);
      });
      window.setTimeout(() => {
        actors.forEach((actor) => {
          const track = map.querySelector('[data-role-id="' + CSS.escape(actor.role_id) + '"]');
          if (track) moveTrack(track, actor, actor.target_station_id, actor.station_slot, true);
        });
      }, 120);
      replayTimer = window.setTimeout(() => {
        setFeed(connected ? 'LIVE LOCAL' : 'STATIC RECEIPT', connected
          ? 'Read-only localhost feed connected. Seat runtime still requires separate current receipts.'
          : 'Embedded receipt. No local poll has succeeded yet.');
        if (!automatic) announce('Receipt replay complete. Workers are parked at their recorded stations.');
      }, 1450);
    }

    map.addEventListener('click', (event) => {
      const button = event.target.closest('.worker-button');
      const roleId = button?.closest('[data-role-id]')?.dataset.roleId;
      if (roleId) updateInspector(roleId);
    });
    replayButton.addEventListener('click', () => replayReceipt());
    refreshButton.addEventListener('click', () => pollState());
    pauseButton.addEventListener('click', () => {
      paused = !paused;
      pauseButton.textContent = paused ? 'Resume updates' : 'Pause updates';
      window.clearTimeout(pollTimer);
      if (paused) {
        setFeed('PAUSED', 'Local updates are paused. The current receipt remains visible.');
        announce('Office updates paused.');
      } else {
        announce('Office updates resumed.');
        pollState();
      }
    });
    document.addEventListener('visibilitychange', () => {
      window.clearTimeout(pollTimer);
      if (document.hidden) {
        if (!paused) setFeed('PAUSED HIDDEN', 'Polling pauses while this tab is hidden.');
      } else if (!paused) {
        pollState();
      }
    });
    reducedMotion.addEventListener?.('change', () => {
      if (reducedMotion.matches) {
        currentState.floor?.actors?.forEach((actor) => {
          const track = map.querySelector('[data-role-id="' + CSS.escape(actor.role_id) + '"]');
          if (track) moveTrack(track, actor, actor.target_station_id, actor.station_slot, false);
        });
      }
    });

    if (currentState.floor?.actors?.[0]?.role_id) updateInspector(currentState.floor.actors[0].role_id);
    window.setTimeout(() => replayReceipt({ automatic: true }), 260);
    if (endpoint) pollState();
  })();
  </script>
</body>
</html>
`;
}
