"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AutonomyLoopView } from "./AutonomyLoopView";
import type {
  ClientProfile,
  DecisionValue,
  OperatorRequest,
  OperatorRequestType,
  OwnerIntent,
  OwnerIntentMode,
  OwnerIntentPriority,
  StudioPayload,
  StudioRecommendation,
  StudioSnapshot,
  StudioWorkItem
} from "./studio-types";

type View = "today" | "work" | "clients" | "queue" | "approvals" | "runs" | "learning" | "ai" | "health";
type Identity = NonNullable<StudioPayload["identity"]>;

interface CommandSeed {
  clientId?: string;
  title?: string;
  instruction?: string;
  mode?: OwnerIntentMode;
}

const views: Array<{ id: View; label: string; detail: string }> = [
  { id: "today", label: "Today", detail: "Briefing and command" },
  { id: "learning", label: "Watchtower", detail: "Autonomy and calibration" },
  { id: "work", label: "Work", detail: "Intent and activity" },
  { id: "clients", label: "Clients", detail: "Portfolio intelligence" },
  { id: "queue", label: "Queue", detail: "Canonical work" },
  { id: "approvals", label: "Approvals", detail: "Human gates" },
  { id: "runs", label: "Runs", detail: "Execution evidence" },
  { id: "ai", label: "AI Stack", detail: "Models, APIs, and MCP" },
  { id: "health", label: "Health", detail: "Sources and schedules" }
];

const mobileViews = new Set<View>(["today", "learning", "work", "clients", "approvals", "health"]);
const PORTFOLIO_CLIENT_ID = "portfolio:active";
const modeCopy: Record<OwnerIntentMode, { label: string; detail: string }> = {
  analyze: { label: "Analyze", detail: "Research and make sense of it" },
  prepare: { label: "Prepare", detail: "Build the local deliverable" },
  execute_safe: { label: "Execute safe", detail: "Run reversible local work" },
  draft_for_approval: { label: "Draft", detail: "Prepare, then hold for approval" },
  monitor: { label: "Monitor", detail: "Verify and keep watching" }
};

function shortDate(value: string | null | undefined) {
  if (!value) return "No deadline";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "America/New_York"
  }).format(new Date(value));
}

function relativeSnapshot(value: string | null | undefined) {
  if (!value) return "pending";
  const minutes = Math.max(0, Math.round((Date.now() - Date.parse(value)) / 60_000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 1_440) return `${Math.round(minutes / 60)}h ago`;
  return `${Math.round(minutes / 1_440)}d ago`;
}

function humanize(value: string) {
  return value.replaceAll("_", " ").replaceAll("-", " ");
}

function StatusDot({ state }: { state: string }) {
  return <span className="status-dot" data-state={state} aria-hidden />;
}

function Metric({ label, value, note }: { label: string; value: string | number; note?: string }) {
  return <div className="metric"><span>{label}</span><strong>{value}</strong>{note ? <small>{note}</small> : null}</div>;
}

function SectionTitle({ kicker, title, note, action }: {
  kicker: string;
  title: string;
  note: string;
  action?: ReactNode;
}) {
  return <div className="section-title"><div><span className="eyebrow">{kicker}</span><h2>{title}</h2></div><p>{note}</p>{action}</div>;
}

function requestTypeFor(item: StudioWorkItem): OperatorRequestType {
  if (item.approvalStatus === "pending") return "approve";
  if (item.status === "blocked") return "refresh_evidence";
  if (item.automaticEligible && item.reversible && !item.externalAction) return "execute_local";
  return "defer";
}

function requestLabel(type: OperatorRequestType) {
  return ({
    execute_local: "Queue local run",
    approve: "Approve path",
    defer: "Defer unchanged",
    refresh_evidence: "Refresh evidence"
  } satisfies Record<OperatorRequestType, string>)[type];
}

function RecommendationCard({ item, label, workItem, onChoose, onRequest }: {
  item: StudioRecommendation | null;
  label: string;
  workItem?: StudioWorkItem;
  onChoose(item: StudioRecommendation): void;
  onRequest(item: StudioWorkItem, type: OperatorRequestType): void;
}) {
  if (!item) {
    return <article className="recommendation empty"><span>{label}</span><strong>Clear</strong><p>No eligible item currently occupies this lane.</p></article>;
  }
  const requestType = workItem ? requestTypeFor(workItem) : null;
  return <article className="recommendation" data-lane={item.lane}>
    <header><span>{label}</span><strong>{item.priority}</strong></header>
    <div className="recommendation-client"><StatusDot state={item.status} />{item.clientName}<small>{humanize(item.actionClass)}</small></div>
    <h3>{item.title}</h3>
    <p>{item.nextAction}</p>
    <div className="recommendation-reason"><span>Why this ranks</span><p>{item.why}</p></div>
    <footer>
      <span>{shortDate(item.dueAt)}</span><span>{Math.round(item.confidence * 100)}% confidence</span>
      <div className="card-actions"><button onClick={() => onChoose(item)}>Train choice</button>{workItem && requestType ? <button className="filled" onClick={() => onRequest(workItem, requestType)}>{requestLabel(requestType)}</button> : null}</div>
    </footer>
  </article>;
}

function OwnerCommandComposer({ payload, seed, onSaved }: {
  payload: StudioPayload;
  seed: CommandSeed;
  onSaved(payload: StudioPayload): void;
}) {
  const activeClients = payload.snapshot.clients.filter((client) => client.status === "active");
  const [clientId, setClientId] = useState(seed.clientId ?? activeClients[0]?.id ?? "");
  const [title, setTitle] = useState(seed.title ?? "");
  const [instruction, setInstruction] = useState(seed.instruction ?? "");
  const [mode, setMode] = useState<OwnerIntentMode>(seed.mode ?? "prepare");
  const [priority, setPriority] = useState<OwnerIntentPriority>("P1");
  const [dueAt, setDueAt] = useState("");
  const [state, setState] = useState<"ready" | "saving" | "error" | "saved">("ready");
  const [message, setMessage] = useState("");
  const isPortfolio = clientId === PORTFOLIO_CLIENT_ID;

  async function save() {
    setState("saving");
    setMessage("");
    try {
      const response = await fetch("/api/studio", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "capture-intent",
          id: crypto.randomUUID(),
          clientId,
          queueRevision: payload.snapshot.queue.revision,
          title,
          instruction,
          mode,
          priority,
          dueAt: dueAt ? new Date(`${dueAt}T17:00:00-04:00`).toISOString() : ""
        })
      });
      const data: unknown = await response.json();
      if (!response.ok) {
        throw new Error(data && typeof data === "object" && "error" in data ? String(data.error) : "The instruction could not be captured.");
      }
      const savedPayload = data as StudioPayload;
      setState("saved");
      setMessage(savedPayload.capture?.scope === "portfolio"
        ? `Portfolio run created. ${savedPayload.capture.clientCount} exact client tasks are waiting on Windows.`
        : "Captured. Windows Marketing Chief will bind it to the exact client and canonical queue.");
      setTitle("");
      setInstruction("");
      setDueAt("");
      onSaved(savedPayload);
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "The instruction could not be captured.");
    }
  }

  return <section className="owner-command" aria-labelledby="owner-command-title">
    <header>
      <div><span className="eyebrow">Owner command</span><h2 id="owner-command-title">What do you want done?</h2></div>
      <div className="command-contract"><StatusDot state="healthy" /><span>Exact client route</span><span>Canonical handoff</span><span>Approval gates stay on</span></div>
    </header>
    <div className="command-form">
      <label className="command-client">Client
        <select aria-label="Command client" value={clientId} onChange={(event) => setClientId(event.target.value)}>
          <option value={PORTFOLIO_CLIENT_ID} disabled={!activeClients.length}>All active clients · {activeClients.length}</option>
          <optgroup label="One client">
            {activeClients.map((client) => <option value={client.id} key={client.id}>{client.name}</option>)}
          </optgroup>
        </select>
      </label>
      <label className="command-title-field">Outcome
        <input aria-label="Command title" maxLength={180} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Name the result you want" />
      </label>
      {isPortfolio ? <div className="portfolio-scope" aria-live="polite">
        <div><span>Portfolio run</span><strong>{activeClients.length} exact client tasks</strong></div>
        <p>One instruction fans out to every active client. Each task keeps its own route, evidence, queue record, and approval gate. Inactive clients stay excluded.</p>
      </div> : null}
      <label className="command-instruction">Instruction
        <textarea aria-label="Command instruction" maxLength={3000} rows={4} value={instruction} onChange={(event) => setInstruction(event.target.value)} placeholder="Tell Marketing Chief what to analyze, prepare, verify, or execute locally." />
      </label>
      <fieldset className="mode-fieldset"><legend>Work mode</legend><div className="mode-grid">
        {(Object.keys(modeCopy) as OwnerIntentMode[]).map((value) => <label key={value} data-selected={mode === value}>
          <input type="radio" name="work-mode" value={value} checked={mode === value} onChange={() => setMode(value)} />
          <strong>{modeCopy[value].label}</strong><small>{modeCopy[value].detail}</small>
        </label>)}
      </div></fieldset>
      <div className="command-options">
        <label>Priority<select aria-label="Command priority" value={priority} onChange={(event) => setPriority(event.target.value as OwnerIntentPriority)}><option>P0</option><option>P1</option><option>P2</option><option>P3</option></select></label>
        <label>Due date <span>(optional)</span><input aria-label="Command due date" type="date" value={dueAt} onChange={(event) => setDueAt(event.target.value)} /></label>
        <button className="primary-action command-submit" onClick={() => void save()} disabled={state === "saving" || !clientId || !title.trim() || !instruction.trim() || (isPortfolio && !activeClients.length)}>
          {state === "saving" ? "Capturing..." : isPortfolio ? `Send to all ${activeClients.length} clients` : "Send to Marketing Chief"}
        </button>
      </div>
    </div>
    <footer>
      <p>Use the outcome, not passwords, codes, raw emails, or raw Slack messages. The hosted layer records your intent; Marketing Chief remains the only canonical Windows writer.</p>
      {message ? <p className={state === "error" ? "form-error" : "form-success"} role="status">{message}</p> : null}
    </footer>
  </section>;
}

function TodayView({ payload, commandSeed, onCommandSaved, onChoose, onRequest, onView }: {
  payload: StudioPayload;
  commandSeed: CommandSeed;
  onCommandSaved(payload: StudioPayload): void;
  onChoose(item: StudioRecommendation): void;
  onRequest(item: StudioWorkItem, type: OperatorRequestType): void;
  onView(view: View): void;
}) {
  const { snapshot } = payload;
  const workItemMap = new Map(snapshot.workItems.map((item) => [item.id, item]));
  return <div className="view-stack">
    <section className="command-panel">
      <div><span className="eyebrow">Dillon command center</span><h1>The Chief is already working.</h1><p>Watchtower observes redacted communication signals, exact-routes them across {snapshot.portfolio.totalClients} client records, finishes safe local deliverables, verifies the result, and saves your attention for the final consequential gate.</p></div>
      <div className="command-metrics">
        <Metric label="Queue" value={`r${snapshot.queue.revision}`} note={`${snapshot.queue.workItemCount} items`} />
        <Metric label="Autonomy" value={snapshot.watchtower ? humanize(snapshot.watchtower.status) : "Unavailable"} note={snapshot.watchtower ? "read-only sensors" : "Windows sync required"} />
        <Metric label="Final gates" value={snapshot.health.humanGateCount} note="only hard interruptions" />
      </div>
    </section>
    <OwnerCommandComposer key={`${commandSeed.clientId ?? "default"}:${commandSeed.mode ?? "prepare"}:${commandSeed.title ?? ""}`} payload={payload} seed={commandSeed} onSaved={onCommandSaved} />
    <section>
      <SectionTitle kicker="Next actions" title="Three governed lanes" note="The operator ranks the next safe action, owner decision, and unblock without blending clients." action={<button className="text-action" onClick={() => onView("queue")}>Open full queue</button>} />
      <div className="recommendation-grid">
        <RecommendationCard item={snapshot.recommendations.nextAutomatic} label="Automatic" workItem={snapshot.recommendations.nextAutomatic ? workItemMap.get(snapshot.recommendations.nextAutomatic.workItemId) : undefined} onChoose={onChoose} onRequest={onRequest} />
        <RecommendationCard item={snapshot.recommendations.nextDecision} label="Decision" workItem={snapshot.recommendations.nextDecision ? workItemMap.get(snapshot.recommendations.nextDecision.workItemId) : undefined} onChoose={onChoose} onRequest={onRequest} />
        <RecommendationCard item={snapshot.recommendations.nextUnblock} label="Unblock" workItem={snapshot.recommendations.nextUnblock ? workItemMap.get(snapshot.recommendations.nextUnblock.workItemId) : undefined} onChoose={onChoose} onRequest={onRequest} />
      </div>
    </section>
    <section className="system-strip">
      <button onClick={() => onView("health")}><StatusDot state={snapshot.health.warningCount ? "warning" : "healthy"} /><span>System health</span><strong>{humanize(snapshot.health.overall)}</strong></button>
      <div><span>Normal WIP</span><strong>{snapshot.queue.normalWip.used}/{snapshot.queue.normalWip.limit}</strong></div>
      <button onClick={() => onView("learning")}><span>Watchtower</span><strong>{snapshot.watchtower ? humanize(snapshot.watchtower.status) : "UNAVAILABLE"}</strong></button>
      <button onClick={() => onView("approvals")}><span>Human gates</span><strong>{snapshot.health.humanGateCount}</strong></button>
    </section>
  </div>;
}

function intentStateNote(intent: OwnerIntent) {
  if (intent.state === "queued") return "Waiting for the Windows bridge";
  if (intent.state === "acknowledged") return "Bound to governed local execution";
  return intent.resolutionSummary ?? humanize(intent.state);
}

function IntentRow({ intent }: { intent: OwnerIntent }) {
  return <article className="intent-row" data-state={intent.state}>
    <div className="intent-route"><StatusDot state={intent.state} /><span>{intent.clientName}</span><strong>{intent.priority}</strong></div>
    <div><strong>{intent.title}</strong><p>{intent.instruction}</p></div>
    <div className="intent-meta"><span>{modeCopy[intent.mode].label}</span><span>{relativeSnapshot(intent.createdAt)}</span><small>{intentStateNote(intent)}</small></div>
  </article>;
}

interface OwnerIntentGroup {
  key: string;
  intents: OwnerIntent[];
}

function groupOwnerIntents(intents: OwnerIntent[]): OwnerIntentGroup[] {
  const seen = new Set<string>();
  const groups: OwnerIntentGroup[] = [];
  for (const intent of intents) {
    const key = intent.batchId ? `batch:${intent.batchId}` : `intent:${intent.id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    groups.push({
      key,
      intents: intent.batchId
        ? intents.filter((candidate) => candidate.batchId === intent.batchId)
          .sort((left, right) => (left.batchIndex ?? 0) - (right.batchIndex ?? 0))
        : [intent]
    });
  }
  return groups;
}

function PortfolioIntentRow({ intents }: { intents: OwnerIntent[] }) {
  const subject = intents[0];
  const completed = intents.filter((intent) => intent.state === "completed").length;
  const failed = intents.filter((intent) => intent.state === "failed").length;
  const active = intents.filter((intent) => ["queued", "acknowledged"].includes(intent.state)).length;
  const state = failed ? "failed" : completed === intents.length ? "completed" : active ? "queued" : "acknowledged";
  return <article className="portfolio-intent-row" data-state={state}>
    <header>
      <div><StatusDot state={state} /><span>Portfolio run</span><strong>{subject.priority}</strong></div>
      <p>{relativeSnapshot(subject.createdAt)} · queue r{subject.queueRevision}</p>
    </header>
    <div className="portfolio-intent-body">
      <div><strong>{subject.title}</strong><p>{subject.instruction}</p></div>
      <dl>
        <div><dt>Clients</dt><dd>{intents.length}</dd></div>
        <div><dt>Waiting</dt><dd>{active}</dd></div>
        <div><dt>Completed</dt><dd>{completed}</dd></div>
        <div><dt>Failed</dt><dd>{failed}</dd></div>
      </dl>
    </div>
    <details>
      <summary>Exact client routes</summary>
      <div>{intents.map((intent) => <span key={intent.id}><StatusDot state={intent.state} />{intent.clientName}<small>{humanize(intent.state)}</small></span>)}</div>
    </details>
  </article>;
}

function WorkView({ payload, onNewCommand, onRequest }: {
  payload: StudioPayload;
  onNewCommand(): void;
  onRequest(item: StudioWorkItem, type: OperatorRequestType): void;
}) {
  const intentGroups = groupOwnerIntents(payload.ownerIntents);
  const grouped = {
    now: payload.snapshot.workItems.filter((item) => ["ready", "in_progress"].includes(item.status)).slice(0, 8),
    approval: payload.snapshot.workItems.filter((item) =>
      !["completed", "deferred", "blocked"].includes(item.status) &&
      (item.approvalStatus === "pending" || item.status === "needs_approval")
    ).slice(0, 8),
    blocked: payload.snapshot.workItems.filter((item) => item.status === "blocked").slice(0, 8),
    done: payload.snapshot.workItems.filter((item) => ["completed", "deferred"].includes(item.status)).slice(0, 8)
  };
  const intentActivity = intentGroups.map(({ key, intents }) => {
    const subject = intents[0];
    const completed = intents.filter((intent) => intent.state === "completed").length;
    const failed = intents.filter((intent) => intent.state === "failed").length;
    return subject.batchId
      ? {
          id: key,
          at: subject.createdAt,
          kind: "Portfolio command",
          title: subject.title,
          note: `${intents.length} clients · ${completed} completed · ${failed} failed`
        }
      : {
          id: key,
          at: subject.createdAt,
          kind: "Owner command",
          title: subject.title,
          note: `${subject.clientName} · ${intentStateNote(subject)}`
        };
  });
  const activity = [
    ...intentActivity,
    ...payload.operatorRequests.map((item) => ({
      id: `request-${item.id}`,
      at: item.createdAt,
      kind: "Windows handoff",
      title: payload.snapshot.workItems.find((workItem) => workItem.id === item.workItemId)?.title ?? item.requestedAction,
      note: `${humanize(item.requestType)} · ${humanize(item.state)}`
    })),
    ...payload.hostedChoices.map((item) => ({ id: `choice-${item.id}`, at: item.createdAt, kind: "Training choice", title: item.predictedAction, note: `${item.decision} · ${item.predictionLane}` }))
  ].sort((left, right) => Date.parse(right.at) - Date.parse(left.at)).slice(0, 12);

  return <div className="view-stack">
    <section className="registry-head work-head"><div><span className="eyebrow">Operating ledger</span><h1>Intent becomes governed work.</h1><p>Every command keeps its client route, queue revision, work mode, approval boundary, and verified outcome visible.</p></div><button className="primary-action" onClick={onNewCommand}>New owner command</button></section>
    <section>
      <SectionTitle kicker="Command ledger" title="Your instructions" note={`${intentGroups.length} retained commands. ${payload.overlay.queuedOwnerIntents} exact client tasks currently waiting on Windows.`} />
      {intentGroups.length ? <div className="intent-ledger">{intentGroups.map((group) => group.intents[0].batchId
        ? <PortfolioIntentRow key={group.key} intents={group.intents} />
        : <IntentRow key={group.key} intent={group.intents[0]} />
      )}</div> : <div className="empty-panel">No owner command has been captured yet. Start from Today and route one client or the full active portfolio.</div>}
    </section>
    <section>
      <SectionTitle kicker="Visual queue" title="Work by operating state" note="The canonical queue remains the source of truth. This board is a visual projection, not a second queue." />
      <div className="work-board">
        {(Object.entries(grouped) as Array<[keyof typeof grouped, StudioWorkItem[]]>).map(([lane, items]) => <section key={lane}>
          <header><span>{humanize(lane)}</span><strong>{items.length}</strong></header>
          <div>{items.map((item) => <article key={item.id}><small>{item.priority} · {item.clientName}</small><strong>{item.title}</strong><p>{item.nextAction}</p>{lane === "done" ? <span className="work-state"><StatusDot state={item.status} />{humanize(item.status)}</span> : <button onClick={() => onRequest(item, requestTypeFor(item))}>{requestLabel(requestTypeFor(item))}</button>}</article>)}</div>
          {!items.length ? <p className="lane-empty">Nothing in this lane.</p> : null}
        </section>)}
      </div>
    </section>
    <section>
      <SectionTitle kicker="Activity" title="What changed" note="Commands, Windows handoffs, and deliberate training choices share one readable sequence." />
      {activity.length ? <ol className="activity-ledger">{activity.map((item) => <li key={item.id}><time>{relativeSnapshot(item.at)}</time><span>{item.kind}</span><div><strong>{item.title}</strong><small>{item.note}</small></div></li>)}</ol> : <div className="empty-panel">Activity will appear after the first owner command or governed choice.</div>}
    </section>
  </div>;
}

function ClientsView({ payload, selectedClientId, onSelectClient, onStartWork }: {
  payload: StudioPayload;
  selectedClientId: string;
  onSelectClient(clientId: string): void;
  onStartWork(client: ClientProfile): void;
}) {
  const { snapshot } = payload;
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("portfolio");
  const clients = useMemo(() => snapshot.clients.filter((client) => {
    const searchMatch = `${client.name} ${client.portfolioTier} ${client.contextSignals.join(" ")}`.toLowerCase().includes(query.toLowerCase());
    const filterMatch = filter === "portfolio" || (filter === "attention" ? client.attentionCount > 0 : client.status === filter);
    return searchMatch && filterMatch;
  }), [snapshot.clients, query, filter]);
  const selected = clients.find((client) => client.id === selectedClientId) ?? clients[0];
  const clientWork = selected ? snapshot.workItems.filter((item) => item.clientId === selected.id) : [];
  const clientIntents = selected ? payload.ownerIntents.filter((item) => item.clientId === selected.id) : [];
  return <div className="view-stack">
    <section className="registry-head"><div><span className="eyebrow">Canonical registry</span><h1>Every client, one record.</h1><p>{snapshot.portfolio.fullyIntegratedClients} of {snapshot.portfolio.totalClients} dossiers carry registry, context, priority, access coverage, and communication evidence.</p></div><div className="filter-pair"><label>Find a client<input aria-label="Search clients" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name, tier, or context" /></label><label>Portfolio view<select aria-label="Filter clients" value={filter} onChange={(event) => setFilter(event.target.value)}><option value="portfolio">All clients</option><option value="attention">Needs attention</option><option value="active">Active</option><option value="inactive">Inactive</option></select></label></div></section>
    <div className="client-layout">
      <section className="client-ledger" aria-label="Client list">
        {clients.map((client) => <button key={client.id} data-selected={selected?.id === client.id} onClick={() => onSelectClient(client.id)}><span className="client-rank">{client.portfolioRank ? String(client.portfolioRank).padStart(2, "0") : "—"}</span><span><strong>{client.name}</strong><small>{humanize(client.portfolioTier)} · {client.status}</small></span><span className="client-count">{client.workItemCount}<small>work</small></span></button>)}
      </section>
      {selected ? <ClientDossier client={selected} workItems={clientWork} intents={clientIntents} onStartWork={() => onStartWork(selected)} /> : <div className="empty-panel">No clients match this filter. Clear the search or choose another portfolio view.</div>}
    </div>
  </div>;
}

function ClientDossier({ client, workItems, intents, onStartWork }: {
  client: ClientProfile;
  workItems: StudioWorkItem[];
  intents: OwnerIntent[];
  onStartWork(): void;
}) {
  return <aside className="client-dossier">
    <header><span className="eyebrow">Client 360</span><h2>{client.name}</h2><p>{client.priorityRationale || "No additional portfolio rationale is recorded."}</p><button className="primary-action dossier-command" onClick={onStartWork} disabled={client.status !== "active"}>Start work for this client</button></header>
    <div className="dossier-metrics">
      <Metric label="Integration" value={client.integrationState} note={`${client.knowledgeSources.length} sources`} />
      <Metric label="Attention" value={client.attentionCount} note={`${client.workItemCount} work items`} />
      <Metric label="Commands" value={intents.length} note="owner instructions" />
    </div>
    <section><span className="eyebrow">Promoted context</span><ul>{client.contextSignals.length ? client.contextSignals.map((signal) => <li key={signal}>{signal}</li>) : <li>No promoted context signal.</li>}</ul></section>
    <section><span className="eyebrow">Current work</span>{workItems.length ? <div className="dossier-work">{workItems.slice(0, 5).map((item) => <article key={item.id}><small>{item.priority} · {humanize(item.status)}</small><strong>{item.title}</strong><p>{item.nextAction}</p></article>)}</div> : <p>The canonical queue has no active action for this client.</p>}</section>
    <section><span className="eyebrow">Integrated knowledge</span><p>{client.knowledgeSources.map(humanize).join(" · ")}</p></section>
    <footer><span>Gmail {client.gmailEvidenceConfidence === null ? "—" : `${Math.round(client.gmailEvidenceConfidence * 100)}%`}</span><span>Slack {client.slackEvidenceConfidence === null ? "—" : `${Math.round(client.slackEvidenceConfidence * 100)}%`}</span><span>{humanize(client.routeStatus)}</span></footer>
  </aside>;
}

function QueueView({ snapshot, initialQuery, onChoose, onRequest }: {
  snapshot: StudioSnapshot;
  initialQuery: string;
  onChoose(item: StudioRecommendation): void;
  onRequest(item: StudioWorkItem, type: OperatorRequestType): void;
}) {
  const [filter, setFilter] = useState(initialQuery ? "all" : "attention");
  const [query, setQuery] = useState(initialQuery);
  const recommendationMap = new Map(snapshot.recommendations.ranked.map((item) => [item.workItemId, item]));
  const statuses = Array.from(new Set(snapshot.workItems.map((item) => item.status)));
  const items = snapshot.workItems.filter((item) => {
    const statusMatch = filter === "all" || (filter === "attention" ? ["blocked", "needs_approval"].includes(item.status) : item.status === filter);
    return statusMatch && `${item.clientName} ${item.title} ${item.nextAction}`.toLowerCase().includes(query.toLowerCase());
  });
  return <div className="view-stack">
    <section className="registry-head"><div><span className="eyebrow">Canonical queue</span><h1>One source of operational truth.</h1><p>Prioritized, versioned, and approval-aware. Hosted requests stay pending until Windows Marketing Chief reconciles them.</p></div><div className="filter-pair"><label>Search queue<input aria-label="Search queue" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Client, work, or action" /></label><label>Filter status<select aria-label="Filter queue" value={filter} onChange={(event) => setFilter(event.target.value)}><option value="attention">Needs attention</option><option value="all">All statuses</option>{statuses.map((status) => <option key={status}>{status}</option>)}</select></label></div></section>
    <section className="queue-table" aria-label="Canonical work queue">
      <header><span>Priority</span><span>Client / work</span><span>Status</span><span>Next action</span><span>Due</span><span>Operator</span></header>
      {items.map((item) => <QueueRow key={item.id} item={item} recommendation={recommendationMap.get(item.id)} onChoose={onChoose} onRequest={onRequest} />)}
      {!items.length ? <div className="empty-panel">No work matches this view. Clear the search or change the status filter.</div> : null}
    </section>
  </div>;
}

function QueueRow({ item, recommendation, onChoose, onRequest }: {
  item: StudioWorkItem;
  recommendation?: StudioRecommendation;
  onChoose(item: StudioRecommendation): void;
  onRequest(item: StudioWorkItem, type: OperatorRequestType): void;
}) {
  const type = requestTypeFor(item);
  return <article><strong className="priority">{item.priority}</strong><div><small>{item.clientName}</small><strong>{item.title}</strong></div><span className="queue-status"><StatusDot state={item.status} />{humanize(item.status)}</span><p>{item.nextAction}</p><time>{shortDate(item.dueAt)}</time><div className="row-actions">{recommendation ? <button onClick={() => onChoose(recommendation)}>Train</button> : null}<button className="filled" onClick={() => onRequest(item, type)}>{requestLabel(type)}</button></div></article>;
}

function ApprovalsView({ snapshot, onRequest }: {
  snapshot: StudioSnapshot;
  onRequest(item: StudioWorkItem, type: OperatorRequestType): void;
}) {
  const approvals = snapshot.workItems.filter((item) =>
    !["completed", "deferred", "blocked"].includes(item.status) &&
    (item.approvalStatus === "pending" || item.status === "needs_approval")
  );
  const blocks = snapshot.workItems.filter((item) => item.status === "blocked");
  return <div className="view-stack">
    <section className="approval-command"><div><span className="eyebrow">Decision desk</span><h1>Nothing consequential slips through.</h1><p>External delivery, publishing, deployment, spend, account change, and destructive work remain visible here until the exact path is approved.</p></div><div><Metric label="Waiting" value={approvals.length} note="approval paths" /><Metric label="Blocked" value={blocks.length} note="need evidence or access" /></div></section>
    <section>
      <SectionTitle kicker="Approval ledger" title="Owner decisions" note="Approval records the exact path. It never performs the gated external action." />
      <div className="approval-ledger">{approvals.map((item) => <article key={item.id}><header><span>{item.priority}</span><small>{item.clientName}</small></header><h2>{item.title}</h2><p>{item.nextAction}</p><dl><div><dt>Action class</dt><dd>{humanize(item.actionClass)}</dd></div><div><dt>Evidence</dt><dd>{humanize(item.evidenceFreshness ?? "pending")}</dd></div><div><dt>Due</dt><dd>{shortDate(item.dueAt)}</dd></div></dl><button className="primary-action" onClick={() => onRequest(item, item.approvalStatus === "pending" ? "approve" : requestTypeFor(item))}>{item.approvalStatus === "pending" ? "Review and approve path" : requestLabel(requestTypeFor(item))}</button></article>)}</div>
      {!approvals.length ? <div className="empty-panel">No canonical item is waiting for approval.</div> : null}
    </section>
    {blocks.length ? <section><SectionTitle kicker="Unblock" title="Evidence and access gates" note="Refresh the source or complete the human-only gate before execution resumes." /><div className="block-ledger">{blocks.map((item) => <article key={item.id}><StatusDot state="blocked" /><div><strong>{item.clientName}</strong><h3>{item.title}</h3><p>{item.nextAction}</p></div><button onClick={() => onRequest(item, "refresh_evidence")}>Refresh evidence</button></article>)}</div></section> : null}
  </div>;
}

function RunsView({ snapshot }: { snapshot: StudioSnapshot }) {
  const [selectedId, setSelectedId] = useState(snapshot.graphs[0]?.graphRunId ?? "");
  const selected = snapshot.graphs.find((graph) => graph.graphRunId === selectedId) ?? snapshot.graphs[0];
  return <div className="view-stack">
    <section className="registry-head"><div><span className="eyebrow">Execution evidence</span><h1>Every run leaves a trace.</h1><p>Requirements, attempts, independent verification, and human gates stay visible without becoming a second queue.</p></div>{snapshot.graphs.length ? <label>Select run<select aria-label="Select execution run" value={selected?.graphRunId} onChange={(event) => setSelectedId(event.target.value)}>{snapshot.graphs.map((graph) => <option value={graph.graphRunId} key={graph.graphRunId}>{graph.workItemTitle}</option>)}</select></label> : null}</section>
    {selected ? <section className="run-board"><header><div><span>{selected.graphRunId}</span><h2>{selected.workItemTitle}</h2></div><strong>{humanize(selected.status)}</strong></header><ol>{selected.nodes.map((node, index) => <li key={node.id} data-state={node.status}><span className="run-index">{String(index + 1).padStart(2, "0")}</span><div><small>{humanize(node.kind)} · {node.owner || "unassigned"}</small><h3>{node.task}</h3><p>{node.requirementCount} requirements · {node.attemptCount}/{node.maxAttempts} attempts</p>{node.approvalGate ? <strong className="approval-flag">Human approval gate</strong> : null}</div><span className="run-state"><StatusDot state={node.status} />{humanize(node.status)}</span></li>)}</ol><footer><span>{selected.nodeCount} checkpoints</span><span>{selected.edgeCount} dependencies</span><span>{selected.blockerCount} blockers</span><span>Updated {relativeSnapshot(selected.updatedAt)}</span></footer></section> : <div className="empty-panel">No execution graph is available yet. The next nontrivial automatic action will create one on Windows.</div>}
  </div>;
}

function RequestRow({ request, snapshot }: { request: OperatorRequest; snapshot: StudioSnapshot }) {
  const item = snapshot.workItems.find((candidate) => candidate.id === request.workItemId);
  return <article><span className="request-state" data-state={request.state}><StatusDot state={request.state} />{humanize(request.state)}</span><div><strong>{item?.title ?? request.workItemId}</strong><small>{humanize(request.requestType)} · queue r{request.queueRevision} · {relativeSnapshot(request.createdAt)}</small></div><p>{request.resolutionSummary ?? request.requestedAction}</p></article>;
}

function AiStackView({ snapshot }: { snapshot: StudioSnapshot }) {
  const stack = snapshot.aiStack;
  if (!stack) {
    return <div className="view-stack">
      <section className="command-panel ai-command">
        <div><span className="eyebrow">AI capability plane</span><h1>The local model inventory is waiting for its first sync.</h1><p>The Studio will show verified local models, gateway routes, MCP servers, client wiring, and approval gates after the Windows bridge publishes the allowlisted stack record.</p></div>
      </section>
    </div>;
  }
  const gatewayHealthy = stack.gateway.status === "healthy" && stack.gateway.doctorFailures === 0;
  const runtimeHealthy = stack.localRuntime.status === "healthy" && stack.localRuntime.loopbackOnly;
  return <div className="view-stack">
    <section className="command-panel ai-command">
      <div><span className="eyebrow">Local-first AI capability plane</span><h1>One governed gateway. Eight private model lanes.</h1><p>Open-weight inference stays on this Windows machine by default. OmniRoute exposes the routing and MCP layer, while every cloud provider connection remains visible and separately gated.</p></div>
      <div className="command-metrics">
        <Metric label="Local models" value={stack.localRuntime.modelCount} note="downloaded and verified" />
        <Metric label="MCP tools" value={stack.gateway.mcpToolCount} note={`${stack.mcpServers.length} server packages`} />
        <Metric label="Cloud providers" value={stack.gateway.connectedProviderCount} note="connected accounts" />
      </div>
    </section>

    <section>
      <SectionTitle kicker="Capacity register" title="What Marketing Chief can call" note={`Verified ${relativeSnapshot(stack.observedAt)}. Counts are capability inventory, not a promise that gated providers are authorized.`} />
      <div className="ai-capacity-ledger">
        <article><StatusDot state={gatewayHealthy ? "healthy" : "warning"} /><div><strong>{stack.gateway.name} {stack.gateway.version}</strong><small>{stack.gateway.catalogRouteCount} catalog routes · {stack.gateway.providerModelRouteCount} provider models · {stack.gateway.aliasRouteCount} aliases</small></div><span>{gatewayHealthy ? "Gateway healthy" : "Review gateway"}</span></article>
        <article><StatusDot state={runtimeHealthy ? "healthy" : "warning"} /><div><strong>{stack.localRuntime.name} {stack.localRuntime.version}</strong><small>{stack.localRuntime.modelCount} local models · {stack.localRuntime.loopbackOnly ? "loopback only" : "binding review required"}</small></div><span>{runtimeHealthy ? "Private runtime" : "Review runtime"}</span></article>
        <article><StatusDot state={stack.gateway.connectedProviderCount === 0 ? "warning" : "healthy"} /><div><strong>Provider access</strong><small>{stack.gateway.freeProviderCount} free-provider families cataloged · {stack.gateway.connectedProviderCount} accounts connected</small></div><span>{stack.gateway.connectedProviderCount ? "Routes available" : "Human connection gate"}</span></article>
        <article><StatusDot state="healthy" /><div><strong>Twice-daily evidence pass</strong><small>{stack.policy.updateCadence}</small></div><span>9 AM + 5 PM ET</span></article>
      </div>
    </section>

    <section>
      <SectionTitle kicker="Local model shelf" title="Open-weight models on this machine" note="Role labels make the shelf useful. Model weights stay local and no client evidence is copied into the hosted database." />
      <div className="model-ledger">
        <div className="model-ledger-head"><span>Model</span><span>Operating role</span><span>Size</span><span>Capability</span><span>Status</span></div>
        {stack.localRuntime.models.map((model) => <article key={model.id}>
          <strong>{model.id}</strong>
          <p>{model.role}</p>
          <span>{model.sizeGb ? `${model.sizeGb.toFixed(1)} GB` : "embedded"}</span>
          <small>{model.capabilities.join(" · ")}</small>
          <span className="model-status"><StatusDot state={model.status === "ready" ? "healthy" : "warning"} />{humanize(model.status)}</span>
        </article>)}
      </div>
    </section>

    <section className="ai-split">
      <div>
        <SectionTitle kicker="Client wiring" title="Installed operator clients" note="Each profile remains separate from the default paid-provider configuration." />
        <div className="client-stack-ledger">{stack.clients.map((client) => <article key={client.name}><div><strong>{client.name}</strong><small>{client.version}</small></div><p>{client.connection}</p><span><StatusDot state={client.status === "ready" ? "healthy" : "warning"} />{humanize(client.status)}</span></article>)}</div>
      </div>
      <div>
        <SectionTitle kicker="MCP surface" title="Installed protocol servers" note="OmniRoute is the routing plane; filesystem access stays explicitly scoped." />
        <div className="client-stack-ledger">{stack.mcpServers.map((server) => <article key={server.name}><div><strong>{server.name}</strong><small>{server.version}</small></div><p>{server.scope}</p><span><StatusDot state={server.status === "ready" ? "healthy" : "warning"} />{humanize(server.status)}</span></article>)}</div>
      </div>
    </section>

    <section className="ai-policy">
      <div><span className="eyebrow">Data boundary</span><h2>Client evidence does not become free-provider test traffic.</h2><p>{stack.policy.dataBoundary}</p></div>
      <dl><div><dt>External provider rule</dt><dd>{stack.policy.externalProviderGate}</dd></div><div><dt>Gateway API</dt><dd>{stack.gateway.apiUrl}</dd></div><div><dt>Local runtime</dt><dd>{stack.localRuntime.endpoint}</dd></div></dl>
      <div className="ai-gates"><strong>{stack.pendingGates.length} human gates remain</strong>{stack.pendingGates.map((gate) => <span key={gate}>{gate}</span>)}</div>
    </section>
  </div>;
}

function HealthView({ payload, onRequest }: { payload: StudioPayload; onRequest(item: StudioWorkItem, type: OperatorRequestType): void }) {
  const { snapshot } = payload;
  const healthChecks = [
    ["Client registry", snapshot.health.clientRegistryValid !== false, `${snapshot.portfolio.totalClients} canonical records`],
    ["Access Broker", snapshot.health.accessBrokerValid !== false, "opaque credential routes only"],
    ["Access coverage", snapshot.health.accessCoverageValid !== false, "client separation enforced"],
    ["Queue alignment", snapshot.health.revisionDrift === 0, `${snapshot.health.revisionDrift} revision drift`],
    ["Daily calibration", snapshot.training.dailyCalibration.configured, relativeSnapshot(snapshot.training.dailyCalibration.lastRunAt)],
    ["Scheduled tasks", snapshot.health.scheduledTaskIssueCount === 0, `${snapshot.health.scheduledTaskCount} observed tasks`]
  ] as const;
  const refreshItem = snapshot.recommendations.ranked[0] ? snapshot.workItems.find((item) => item.id === snapshot.recommendations.ranked[0].workItemId) : undefined;
  return <div className="view-stack">
    <section className="command-panel health-command"><div><span className="eyebrow">Control plane</span><h1>Healthy means current, routed, and reversible.</h1><p>Authentication, source freshness, schedules, queue alignment, and human gates are inspected separately so green never hides missing evidence.</p></div><div className="command-metrics"><Metric label="Observed" value={relativeSnapshot(snapshot.health.observedAt)} note="system health" /><Metric label="Queue drift" value={snapshot.health.revisionDrift} note="must be zero" /><Metric label="Warnings" value={snapshot.health.warningCount} note={`${snapshot.health.humanGateCount} human gates`} /></div></section>
    <section><SectionTitle kicker="System checks" title="Current operating contract" note="Failures stay visible and include a recovery path." /><div className="health-ledger">{healthChecks.map(([label, good, note]) => <article key={label}><StatusDot state={good ? "healthy" : "warning"} /><div><strong>{label}</strong><small>{note}</small></div><span>{good ? "Passing" : "Review"}</span></article>)}</div></section>
    <section><SectionTitle kicker="Evidence routes" title="Connected source coverage" note="Raw messages and secrets never enter the hosted database." /><div className="source-ledger"><article><strong>GitHub + canonical repository</strong><p>The client registry, queue, priorities, execution graphs, and learning ledgers are mirrored from the verified client-operations source at queue r{snapshot.queue.revision}.</p><span>Canonical source</span></article><article><strong>Gmail</strong><p>{snapshot.training.sourceObservations.gmailBaseMessages.toLocaleString()} deduplicated messages plus {snapshot.training.sourceObservations.gmailSupplementMessages.toLocaleString()} exact-route supplements.</p><span>Read-only evidence</span></article><article><strong>Slack</strong><p>{snapshot.training.sourceObservations.slackMessagesReviewed.toLocaleString()} authored messages reviewed across the verified agency workspace.</p><span>Read-only evidence</span></article><article><strong>HubSpot</strong><p>Portal-specific CRM evidence remains client-routed and is never blended across accounts.</p><span>Exact portal only</span></article></div></section>
    <section className="request-ledger"><SectionTitle kicker="Operator handoff" title="Hosted requests waiting on Windows" note="No hosted click bypasses canonical scripts or approval policy." />{payload.operatorRequests.length ? <div>{payload.operatorRequests.map((request) => <RequestRow key={request.id} request={request} snapshot={snapshot} />)}</div> : <div className="empty-panel">No operator request has been recorded.</div>}{refreshItem ? <button className="primary-action inline-action" onClick={() => onRequest(refreshItem, "refresh_evidence")}>Request evidence refresh</button> : null}</section>
  </div>;
}

function DialogFrame({ titleId, onClose, children, className = "" }: {
  titleId: string;
  onClose(): void;
  children: ReactNode;
  className?: string;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  return <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className={`choice-dialog ${className}`} role="dialog" aria-modal="true" aria-labelledby={titleId}><button ref={closeRef} className="close-button floating-close" onClick={onClose} aria-label="Close dialog">×</button>{children}</section></div>;
}

function ChoiceDialog({ item, snapshot, onClose, onSaved }: {
  item: StudioRecommendation;
  snapshot: StudioSnapshot;
  onClose(): void;
  onSaved(payload: StudioPayload): void;
}) {
  const [decision, setDecision] = useState<DecisionValue>("accept");
  const [replacementAction, setReplacementAction] = useState(item.nextAction);
  const [rationale, setRationale] = useState("");
  const [state, setState] = useState<"ready" | "saving" | "error">("ready");
  const [message, setMessage] = useState("");
  async function save() {
    setState("saving");
    setMessage("");
    try {
      const response = await fetch("/api/studio", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "record-choice", workItemId: item.workItemId, workItemVersion: item.workItemVersion, queueRevision: snapshot.queue.revision, predictionLane: item.lane, decision, predictedAction: item.nextAction, replacementAction: decision === "modify" ? replacementAction : "", rationale }) });
      const data: unknown = await response.json();
      if (!response.ok) throw new Error(data && typeof data === "object" && "error" in data ? String(data.error) : "Choice could not be saved.");
      onSaved(data as StudioPayload);
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Choice could not be saved.");
    }
  }
  return <DialogFrame titleId="choice-title" onClose={onClose}><header><div><span className="eyebrow">Version-bound label</span><h2 id="choice-title">Train this choice</h2></div></header><div className="choice-subject"><span>{item.clientName} · {item.lane} · v{item.workItemVersion}</span><strong>{item.title}</strong><p>{item.nextAction}</p></div><fieldset><legend>Your decision</legend><div className="decision-grid">{(["accept", "modify", "defer", "reject"] as DecisionValue[]).map((value) => <label key={value} data-selected={decision === value}><input type="radio" name="decision" value={value} checked={decision === value} onChange={() => setDecision(value)} /><span>{value}</span></label>)}</div></fieldset>{decision === "modify" ? <label>Replacement action<textarea maxLength={3000} value={replacementAction} onChange={(event) => setReplacementAction(event.target.value)} rows={4} /></label> : null}<label>Why this choice? <span>(optional)</span><textarea maxLength={1200} value={rationale} onChange={(event) => setRationale(event.target.value)} rows={3} placeholder="Short rationale, no secrets or raw communications." /></label>{message ? <p className="form-error" role="alert">{message}</p> : null}<footer><p>Saved to the private learning overlay. Communication volume remains evidence, never a label.</p><div><button onClick={onClose}>Cancel</button><button className="primary-action" onClick={() => void save()} disabled={state === "saving" || (decision === "modify" && !replacementAction.trim())}>{state === "saving" ? "Saving..." : "Record choice"}</button></div></footer></DialogFrame>;
}

function OperatorDialog({ item, type, snapshot, onClose, onSaved }: {
  item: StudioWorkItem;
  type: OperatorRequestType;
  snapshot: StudioSnapshot;
  onClose(): void;
  onSaved(payload: StudioPayload): void;
}) {
  const [rationale, setRationale] = useState("");
  const [state, setState] = useState<"ready" | "saving" | "error">("ready");
  const [message, setMessage] = useState("");
  async function save() {
    setState("saving");
    setMessage("");
    try {
      const response = await fetch("/api/studio", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "request-operator", workItemId: item.id, workItemVersion: item.version, queueRevision: snapshot.queue.revision, requestType: type, rationale }) });
      const data: unknown = await response.json();
      if (!response.ok) throw new Error(data && typeof data === "object" && "error" in data ? String(data.error) : "Operator request could not be saved.");
      onSaved(data as StudioPayload);
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Operator request could not be saved.");
    }
  }
  return <DialogFrame titleId="operator-title" onClose={onClose}><header><div><span className="eyebrow">Owner instruction</span><h2 id="operator-title">{requestLabel(type)}</h2></div></header><div className="choice-subject"><span>{item.clientName} · queue r{snapshot.queue.revision} · v{item.version}</span><strong>{item.title}</strong><p>{type === "refresh_evidence" ? `Refresh allowlisted evidence before re-ranking: ${item.nextAction}` : item.nextAction}</p></div><div className="safety-note"><strong>What happens next</strong><p>This request is persisted in the owner-only handoff ledger. Windows Marketing Chief must recheck the exact queue revision, client route, evidence, and approval gate before any canonical change.</p></div><label>Instruction context <span>(optional)</span><textarea maxLength={1200} value={rationale} onChange={(event) => setRationale(event.target.value)} rows={3} placeholder="Add context without secrets, raw messages, or direct identifiers." /></label>{message ? <p className="form-error" role="alert">{message}</p> : null}<footer><p>No external delivery, publishing, spend, account change, or destructive action happens from this hosted request.</p><div><button onClick={onClose}>Cancel</button><button className="primary-action" onClick={() => void save()} disabled={state === "saving"}>{state === "saving" ? "Queuing..." : requestLabel(type)}</button></div></footer></DialogFrame>;
}

function GlobalSearch({ payload, onClose, onClient, onWork }: {
  payload: StudioPayload;
  onClose(): void;
  onClient(clientId: string): void;
  onWork(title: string): void;
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.focus(); }, []);
  const normalized = query.trim().toLowerCase();
  const clients = normalized ? payload.snapshot.clients.filter((client) => `${client.name} ${client.contextSignals.join(" ")}`.toLowerCase().includes(normalized)).slice(0, 6) : payload.snapshot.clients.slice(0, 4);
  const work = normalized ? payload.snapshot.workItems.filter((item) => `${item.clientName} ${item.title} ${item.nextAction}`.toLowerCase().includes(normalized)).slice(0, 8) : payload.snapshot.workItems.slice(0, 5);
  return <DialogFrame titleId="search-title" onClose={onClose} className="search-dialog"><header><div><span className="eyebrow">Command search</span><h2 id="search-title">Find any client or work item</h2></div></header><label className="search-field">Search<input ref={inputRef} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Client, context, deliverable, or next action" /></label><div className="search-results"><section><h3>Clients</h3>{clients.map((client) => <button key={client.id} onClick={() => onClient(client.id)}><span>{client.name}</span><small>{humanize(client.portfolioTier)} · {client.workItemCount} work items</small></button>)}</section><section><h3>Work</h3>{work.map((item) => <button key={item.id} onClick={() => onWork(item.title)}><span>{item.title}</span><small>{item.clientName} · {item.priority} · {humanize(item.status)}</small></button>)}</section></div><footer><p>Press Esc to close. Search uses the private allowlisted snapshot.</p></footer></DialogFrame>;
}

export function StudioApp({ initialSnapshot, owner }: { initialSnapshot: StudioSnapshot; owner: Identity }) {
  const initialPayload: StudioPayload = {
    snapshot: initialSnapshot,
    hostedChoices: [],
    operatorRequests: [],
    ownerIntents: [],
    evaluations: [],
    identity: owner,
    overlay: {
      persistedChoices: 0,
      totalLabeledChoices: initialSnapshot.training.labeledOutcomes,
      lastCalibrationAt: initialSnapshot.training.dailyCalibration.lastRunAt,
      lastCalibrationTrigger: initialSnapshot.training.dailyCalibration.trigger,
      queuedOperatorRequests: 0,
      queuedOwnerIntents: 0,
      lastEvaluationAt: null
    }
  };
  const [view, setView] = useState<View>("learning");
  const [payload, setPayload] = useState<StudioPayload>(initialPayload);
  const [choice, setChoice] = useState<StudioRecommendation | null>(null);
  const [operator, setOperator] = useState<{ item: StudioWorkItem; type: OperatorRequestType } | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [commandSeed, setCommandSeed] = useState<CommandSeed>({});
  const [selectedClientId, setSelectedClientId] = useState(initialSnapshot.clients[0]?.id ?? "");
  const [queueQuery, setQueueQuery] = useState("");
  const [syncState, setSyncState] = useState<"connecting" | "synced" | "snapshot" | "refreshing">("connecting");
  const [syncMessage, setSyncMessage] = useState("");
  const [clock, setClock] = useState(0);

  async function sync() {
    setSyncState((current) => current === "connecting" ? "connecting" : "refreshing");
    setSyncMessage("");
    try {
      const response = await fetch("/api/studio", { headers: { accept: "application/json" }, cache: "no-store" });
      if (!response.ok) throw new Error(response.status === 401 ? "Owner authentication expired. Sign in again." : "The private data layer did not respond.");
      setPayload(await response.json() as StudioPayload);
      setSyncState("synced");
    } catch (error) {
      setSyncState("snapshot");
      setSyncMessage(error instanceof Error ? error.message : "Showing the last safe snapshot.");
    }
  }

  useEffect(() => {
    let active = true;
    fetch("/api/studio", { headers: { accept: "application/json" }, cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error(response.status === 401 ? "Owner authentication expired. Sign in again." : "The private data layer did not respond.");
        return await response.json() as StudioPayload;
      })
      .then((next) => { if (active) { setPayload(next); setSyncState("synced"); } })
      .catch((error: unknown) => { if (active) { setSyncState("snapshot"); setSyncMessage(error instanceof Error ? error.message : "Showing the last safe snapshot."); } });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const updateClock = () => setClock(Date.now());
    const frame = window.requestAnimationFrame(updateClock);
    const interval = window.setInterval(updateClock, 60_000);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearInterval(interval);
    };
  }, []);

  const snapshot = payload.snapshot;
  const currentView = views.find((item) => item.id === view) ?? views[0];
  const watchtowerObservedAt = snapshot.watchtower?.observedAt ? Date.parse(snapshot.watchtower.observedAt) : Number.NaN;
  const watchtowerFresh = clock > 0 && Number.isFinite(watchtowerObservedAt) && clock - watchtowerObservedAt <= 15 * 60_000;
  const liveSystemHealthy = Boolean(
    snapshot.watchtower &&
    watchtowerFresh &&
    ["active", "polling"].includes(snapshot.watchtower.status) &&
    snapshot.health.warningCount === 0
  );
  const systemBadgeLabel = !snapshot.watchtower
    ? "Snapshot only"
    : !watchtowerFresh
      ? "Telemetry stale"
      : liveSystemHealthy
        ? "Healthy"
        : "Review";
  function choiceSaved(next: StudioPayload) { setPayload(next); setChoice(null); setView("learning"); setSyncState("synced"); }
  function operatorSaved(next: StudioPayload) { setPayload(next); setOperator(null); setView("work"); setSyncState("synced"); }
  function commandSaved(next: StudioPayload) { setPayload(next); setSyncState("synced"); }
  function startClientWork(client: ClientProfile) {
    setCommandSeed({ clientId: client.id, title: "", instruction: "", mode: "prepare" });
    setView("today");
  }
  function openClient(clientId: string) {
    setSelectedClientId(clientId);
    setSearchOpen(false);
    setView("clients");
  }
  function openWork(title: string) {
    setQueueQuery(title);
    setSearchOpen(false);
    setView("queue");
  }

  return <main className="studio-shell">
    <a className="skip-link" href="#studio-content">Skip to operator content</a>
    <aside className="sidebar">
      <div className="brand"><span>MC</span><div><strong>Marketing Chief</strong><small>Dillon Operating Studio</small></div></div>
      <button className="sidebar-command" onClick={() => { setCommandSeed({}); setView("today"); }}><span>+</span><strong>New owner command</strong><small>Route work to any client</small></button>
      <nav aria-label="Studio navigation">{views.map((item) => <button key={item.id} data-active={view === item.id} onClick={() => setView(item.id)}><strong>{item.label}</strong><small>{item.detail}</small>{item.id === "work" && payload.overlay.queuedOwnerIntents ? <span className="nav-count">{payload.overlay.queuedOwnerIntents}</span> : null}</button>)}</nav>
      <div className="sidebar-foot"><div><StatusDot state={liveSystemHealthy ? "healthy" : "warning"} /><span>{systemBadgeLabel}</span></div><small>{owner.displayName} · owner only</small></div>
    </aside>
    <div className="workspace">
      <header className="topbar">
        <button className="mobile-brand" onClick={() => setView("today")} aria-label="Open Today">MC</button>
        <div><span>{currentView.label}</span><small>Queue r{snapshot.queue.revision} · {syncState}</small></div>
        <button className="global-search-trigger" aria-label="Open global command search" onClick={() => setSearchOpen(true)}><span>Search clients and work</span><kbd>Ctrl K</kbd></button>
        <div className="topbar-status"><StatusDot state={syncState === "synced" ? "healthy" : "warning"} /><button onClick={() => setView("clients")}>{snapshot.portfolio.totalClients} clients</button><button onClick={() => setView("work")}>{payload.overlay.queuedOwnerIntents} commands</button><button className="refresh-control" onClick={() => void sync()} disabled={syncState === "refreshing" || syncState === "connecting"}>{syncState === "refreshing" ? "Refreshing..." : "Refresh"}</button></div>
      </header>
      {syncMessage ? <div className="sync-banner" role="status"><span>{syncMessage} The embedded allowlisted snapshot remains available.</span><button onClick={() => void sync()}>Try again</button></div> : null}
      <div className="workspace-body" id="studio-content" tabIndex={-1}>
        {view === "today" ? <TodayView payload={payload} commandSeed={commandSeed} onCommandSaved={commandSaved} onChoose={setChoice} onRequest={(item, type) => setOperator({ item, type })} onView={setView} /> : null}
        {view === "work" ? <WorkView payload={payload} onNewCommand={() => { setCommandSeed({}); setView("today"); }} onRequest={(item, type) => setOperator({ item, type })} /> : null}
        {view === "clients" ? <ClientsView payload={payload} selectedClientId={selectedClientId} onSelectClient={setSelectedClientId} onStartWork={startClientWork} /> : null}
        {view === "queue" ? <QueueView key={queueQuery || "queue"} snapshot={snapshot} initialQuery={queueQuery} onChoose={setChoice} onRequest={(item, type) => setOperator({ item, type })} /> : null}
        {view === "approvals" ? <ApprovalsView snapshot={snapshot} onRequest={(item, type) => setOperator({ item, type })} /> : null}
        {view === "runs" ? <RunsView snapshot={snapshot} /> : null}
        {view === "learning" ? <AutonomyLoopView payload={payload} onPayload={setPayload} onChoose={setChoice} onOpenApprovals={() => setView("approvals")} onOpenRuns={() => setView("runs")} /> : null}
        {view === "ai" ? <AiStackView snapshot={snapshot} /> : null}
        {view === "health" ? <HealthView payload={payload} onRequest={(item, type) => setOperator({ item, type })} /> : null}
      </div>
    </div>
    <nav className="mobile-nav" aria-label="Mobile navigation">{views.filter((item) => mobileViews.has(item.id)).map((item) => <button key={item.id} data-active={view === item.id} onClick={() => setView(item.id)}>{item.label}{item.id === "work" && payload.overlay.queuedOwnerIntents ? <span>{payload.overlay.queuedOwnerIntents}</span> : null}</button>)}</nav>
    {choice ? <ChoiceDialog item={choice} snapshot={snapshot} onClose={() => setChoice(null)} onSaved={choiceSaved} /> : null}
    {operator ? <OperatorDialog item={operator.item} type={operator.type} snapshot={snapshot} onClose={() => setOperator(null)} onSaved={operatorSaved} /> : null}
    {searchOpen ? <GlobalSearch payload={payload} onClose={() => setSearchOpen(false)} onClient={openClient} onWork={openWork} /> : null}
  </main>;
}
