"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  chiefCapabilities,
  everydayStack,
  predictionCapabilities,
  predictionLaneOrder,
  skillInventoryCount
} from "./autonomy-catalog";
import type {
  DecisionValue,
  EvaluationRun,
  HostedChoice,
  StudioPayload,
  StudioRecommendation,
  StudioWorkItem,
  WatchtowerStatus
} from "./studio-types";

interface AutonomyLoopViewProps {
  payload: StudioPayload;
  onPayload(payload: StudioPayload): void;
  onChoose(item: StudioRecommendation): void;
  onOpenApprovals(): void;
  onOpenRuns(): void;
}

function humanize(value: string) {
  return value.replaceAll("_", " ").replaceAll("-", " ");
}

function relativeTime(value: string | null | undefined) {
  if (!value) return "not reported";
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) return "not reported";
  const minutes = Math.max(0, Math.round((Date.now() - parsed) / 60_000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 1_440) return `${Math.round(minutes / 60)}h ago`;
  return `${Math.round(minutes / 1_440)}d ago`;
}

function absoluteTime(value: string | null | undefined) {
  if (!value) return "Not reported";
  const parsed = new Date(value);
  if (!Number.isFinite(parsed.getTime())) return "Not reported";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/New_York",
    timeZoneName: "short"
  }).format(parsed);
}

function StatusMark({ state }: { state: string }) {
  return <span className="status-dot" data-state={state} aria-hidden />;
}

function LedgerMetric({ label, value, note }: { label: string; value: string | number; note: string }) {
  return <div className="metric"><span>{label}</span><strong>{value}</strong><small>{note}</small></div>;
}

function SectionHeading({ label, title, note, action }: {
  label: string;
  title: string;
  note: string;
  action?: ReactNode;
}) {
  return <div className="section-title"><div><span className="eyebrow">{label}</span><h2>{title}</h2></div><p>{note}</p>{action}</div>;
}

function fallbackWatchtower(payload: StudioPayload): WatchtowerStatus {
  const { snapshot } = payload;
  const status: WatchtowerStatus["status"] = snapshot.health.stale ? "delayed" : "unavailable";
  return {
    observedAt: snapshot.health.observedAt ?? snapshot.generatedAt,
    status,
    policyVersion: "telemetry-unreported",
    slack: {
      state: "telemetry unavailable",
      mode: "read-only",
      intervalMinutes: 0,
      lastPollAt: null,
      nextPollAt: null,
      lastResult: null
    },
    worker: {
      state: "telemetry unavailable",
      intervalMinutes: 0,
      lastRunAt: null,
      nextRunAt: null,
      lastResult: null,
      lastEpisodeId: null
    },
    intake: {
      pending: snapshot.queue.intakeCount,
      quarantined: 0,
      resolved: 0,
      acknowledged: 0,
      occurrenceDuplicates: 0,
      semanticDuplicates: 0
    },
    signals: []
  };
}

function choiceFor(item: StudioWorkItem, choices: HostedChoice[]) {
  return choices.find((choice) => choice.workItemId === item.id && choice.workItemVersion === item.version);
}

function evaluationMetric(evaluation: EvaluationRun | undefined, key: "guardrail" | "coverage" | "acceptance") {
  if (!evaluation) return "Pending";
  const value = key === "guardrail"
    ? evaluation.guardrailPassRate
    : key === "coverage"
      ? evaluation.clientCoverage
      : evaluation.acceptanceRate;
  return `${Math.round(value * 100)}%`;
}

const stageLabels = [
  ["Watch", "Read-only Slack and Gmail sensors observe without writing the queue."],
  ["Exact route", "Registry identity, active-client status, ambiguity, and dedupe are checked."],
  ["Prioritize", "Current evidence, portfolio policy, deadlines, risk, and learned choices rank the work."],
  ["Build", "Only local, reversible research, drafting, artifacts, and tests run automatically."],
  ["Verify", "A separate check proves the artifact and definition of done before it advances."],
  ["Learn", "Version-bound choices and verified outcomes calibrate the next ranking pass."],
  ["Final gate", "Delivery, publishing, spend, account changes, auth, and destructive actions stop once here."]
] as const;

export function AutonomyLoopView({
  payload,
  onPayload,
  onChoose,
  onOpenApprovals,
  onOpenRuns
}: AutonomyLoopViewProps) {
  const { snapshot } = payload;
  const watchtower = snapshot.watchtower ?? fallbackWatchtower(payload);
  const hasWatchtowerTelemetry = Boolean(snapshot.watchtower);
  const [savingId, setSavingId] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const finalGates = snapshot.workItems.filter((item) =>
    !["done", "completed", "deferred"].includes(item.status) &&
    (item.approvalStatus === "pending" || item.status === "needs_approval" || item.externalAction)
  );
  const safeWork = snapshot.workItems.filter((item) =>
    item.automaticEligible &&
    item.reversible &&
    !item.externalAction &&
    !["done", "completed", "deferred"].includes(item.status)
  );
  const verifiedOutcomes = snapshot.workItems
    .filter((item) => item.outcomeSummary)
    .sort((left, right) => Date.parse(right.updatedAt ?? "") - Date.parse(left.updatedAt ?? ""))
    .slice(0, 8);
  const labeledBindings = new Set(payload.hostedChoices.map((choice) =>
    `${choice.workItemId}:${choice.workItemVersion}:${choice.predictionLane}`
  ));
  const teachCandidates = snapshot.recommendations.ranked.filter((item) =>
    !labeledBindings.has(`${item.workItemId}:${item.workItemVersion}:${item.lane}`)
  ).slice(0, 6);
  const latestEvaluation = payload.evaluations[0];
  const activeRuns = snapshot.graphs.filter((graph) => !["completed", "done", "failed"].includes(graph.status));
  const predictionLanes = predictionLaneOrder.map((lane) => ({
    lane,
    capabilities: predictionCapabilities.filter((capability) => capability.lane === lane)
  }));

  const reportedStages = new Map((watchtower.stages ?? []).map((stage) => [stage.id, stage.state]));
  const stageStates = [
    reportedStages.get("watch") ?? "unavailable",
    reportedStages.get("route") ?? "unavailable",
    reportedStages.get("prioritize") ?? "unavailable",
    reportedStages.get("build") ?? "unavailable",
    reportedStages.get("verify") ?? "unavailable",
    reportedStages.get("learn") ?? "unavailable",
    reportedStages.get("final_gate") ?? "unavailable"
  ];
  const primarySafeWork = safeWork[0];
  const activeStageIndex = stageStates.findIndex((state) => state === "active");
  const watchtowerHealthy = ["active", "polling"].includes(watchtower.status);
  const blockedCount = snapshot.workItems.filter((item) => item.status === "blocked").length;

  const outcomeRows = useMemo(() => verifiedOutcomes.map((item) => {
    const choice = choiceFor(item, payload.hostedChoices);
    const pattern = snapshot.learning.patterns?.find((candidate) =>
      candidate.clientId === item.clientId && candidate.actionClass === item.actionClass
    );
    return { item, choice, pattern };
  }), [verifiedOutcomes, payload.hostedChoices, snapshot.learning.patterns]);

  async function recordFastChoice(item: StudioRecommendation, decision: Exclude<DecisionValue, "modify">) {
    setSavingId(item.workItemId);
    setSaveMessage("");
    try {
      const response = await fetch("/api/studio", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "record-choice",
          workItemId: item.workItemId,
          workItemVersion: item.workItemVersion,
          queueRevision: snapshot.queue.revision,
          predictionLane: item.lane,
          decision,
          predictedAction: item.nextAction,
          replacementAction: "",
          rationale: ""
        })
      });
      const data: unknown = await response.json();
      if (!response.ok) {
        throw new Error(data && typeof data === "object" && "error" in data ? String(data.error) : "The judgment could not be saved.");
      }
      onPayload(data as StudioPayload);
      setSaveMessage("Saved against this exact queue and work-item version. Queued for the next Windows calibration.");
    } catch (error) {
      setSaveMessage(error instanceof Error ? error.message : "The judgment could not be saved.");
    } finally {
      setSavingId("");
    }
  }

  return <div className="view-stack autonomy-view">
    <section className="watchtower-command watchtower-command-v2">
      <div className="watchtower-copy">
        <div className="operating-kicker">
          <span><StatusMark state={watchtowerHealthy ? "healthy" : "warning"} />Watchtower {humanize(watchtower.status)}</span>
          <span>{watchtower.policyVersion}</span>
        </div>
        <h1>{watchtowerHealthy ? "The Chief is running." : "Watchtower needs attention."}</h1>
        <p>One live view of what Marketing Chief is watching, doing, and holding for you. Safe work moves. Outside-world actions stop here.</p>
        <div className="watchtower-contract">
          <span>Observed {absoluteTime(watchtower.observedAt)}</span>
          <span>Queue r{snapshot.queue.revision}</span>
          <span>{activeRuns.length} active run{activeRuns.length === 1 ? "" : "s"}</span>
        </div>
        <div className="watchtower-actions">
          <button className="command-action" onClick={onOpenRuns}>View execution</button>
          <button className="quiet-action" onClick={onOpenApprovals}>Review decisions</button>
        </div>
      </div>
      <div className="live-cycle" aria-label="Current Marketing Chief cycle">
        <header>
          <span>Current cycle</span>
          <strong><StatusMark state={watchtower.worker.state} />{humanize(watchtower.worker.state)}</strong>
        </header>
        <div className="cycle-focus">
          <small>{primarySafeWork ? "Next safe work" : "Worker state"}</small>
          <strong>{primarySafeWork?.title ?? "No eligible episode right now"}</strong>
          <p>{primarySafeWork?.nextAction ?? "Watchtower is polling and will start when a newly eligible, exact-routed item appears."}</p>
        </div>
        <dl>
          <div><dt>Slack</dt><dd>{humanize(watchtower.slack.state)} · {watchtower.slack.lastPollAt ? relativeTime(watchtower.slack.lastPollAt) : "awaiting sync"}</dd></div>
          <div><dt>Next pass</dt><dd>{watchtower.worker.nextRunAt ? absoluteTime(watchtower.worker.nextRunAt) : "not reported"}</dd></div>
          <div><dt>Safe queue</dt><dd>{safeWork.length} item{safeWork.length === 1 ? "" : "s"}</dd></div>
        </dl>
      </div>
    </section>

    <section className="operating-desk">
      <div className="loop-board">
        <header>
          <div><span className="eyebrow">Live operating loop</span><h2>Seven checks. One current state.</h2></div>
          <button className="text-action" onClick={onOpenRuns}>Execution evidence</button>
        </header>
        <ol className="autonomy-spine autonomy-spine-v2">
          {stageLabels.map(([label, note], index) => <li key={label} data-state={stageStates[index]} data-current={index === activeStageIndex}>
            <span className="autonomy-index">{String(index + 1).padStart(2, "0")}</span>
            <div><strong>{label}</strong><p>{note}</p></div>
            <span className="autonomy-state"><StatusMark state={stageStates[index]} />{humanize(stageStates[index])}</span>
          </li>)}
        </ol>
      </div>
      <aside className="final-gate-dossier">
        <div className="gate-count"><span>Needs you</span><strong>{finalGates.length}</strong></div>
        <h2>{finalGates.length ? "The work stops here." : "Nothing needs approval."}</h2>
        <p>{finalGates.length ? "Local preparation stays in motion. These are the exact actions that change the outside world." : "Watchtower has no consequential action waiting for your authority."}</p>
        {finalGates[0] ? <div className="gate-subject"><small>{finalGates[0].clientName} · {finalGates[0].priority}</small><strong>{finalGates[0].title}</strong><p>{finalGates[0].nextAction}</p></div> : <div className="gate-clear"><StatusMark state="healthy" />Approval desk clear</div>}
        <div className="gate-meta"><span>{blockedCount} blocked</span><span>{snapshot.queue.intakeCount} intake</span></div>
        <button className="primary-action" onClick={onOpenApprovals}>{finalGates.length ? `Review ${finalGates.length} decision${finalGates.length === 1 ? "" : "s"}` : "Open approval history"}</button>
      </aside>
    </section>

    <section className="decision-studio">
      <SectionHeading
        label="Teach the Chief"
        title={teachCandidates.length ? `${teachCandidates.length} judgments. About two minutes.` : "The Chief is caught up."}
        note="Your choices bind to the exact queue and work-item version. They teach ranking without pretending a click is a business outcome."
      />
      {teachCandidates.length ? <div className="teach-folio teach-folio-v2">
        {teachCandidates.map((item, index) => <article key={`${item.workItemId}:${item.workItemVersion}`}>
          <div className="folio-index"><span>{String(index + 1).padStart(2, "0")}</span><small>{item.lane}</small></div>
          <div className="folio-subject"><small>{item.clientName} · {item.priority} · v{item.workItemVersion}</small><strong>{item.title}</strong><p>{item.nextAction}</p></div>
          <div className="folio-proof"><span>{Math.round(item.confidence * 100)}% confidence</span><span>score {item.score}</span><p>{item.why}</p></div>
          <fieldset disabled={savingId === item.workItemId}>
            <legend>Your judgment</legend>
            <button onClick={() => void recordFastChoice(item, "accept")}>Accept</button>
            <button onClick={() => onChoose(item)}>Modify</button>
            <button onClick={() => void recordFastChoice(item, "defer")}>Defer</button>
            <button onClick={() => void recordFastChoice(item, "reject")}>Reject</button>
          </fieldset>
        </article>)}
      </div> : <div className="empty-panel">Every current case has a version-bound judgment. Fresh work will appear after the next meaningful queue change.</div>}
      <p className="teach-status" aria-live="polite">{saveMessage || `${payload.overlay.totalLabeledChoices} total labels · last calibration ${relativeTime(payload.overlay.lastCalibrationAt)}.`}</p>
    </section>

    <details className="system-drawer outcome-drawer">
      <summary><span><small>Verified reality</small><strong>{verifiedOutcomes.length} outcome episodes</strong></span><em>Open ledger</em></summary>
      <div className="drawer-content">
        <SectionHeading
          label="Outcome loop"
          title="Prediction, judgment, reality, adjustment"
          note="The system learns only when canonical work carries a verified outcome."
        />
        {outcomeRows.length ? <div className="episode-ledger" tabIndex={0} aria-label="Outcome episode ledger">
          <header><span>Episode</span><span>Predicted</span><span>Dillon</span><span>Reality</span><span>Learned</span></header>
          {outcomeRows.map(({ item, choice, pattern }) => <article key={item.id}>
            <div><small>{item.clientName} · v{item.version}</small><strong>{item.title}</strong></div>
            <p>{item.nextAction}</p>
            <div>{choice ? <><strong className="choice-decision" data-decision={choice.decision}>{choice.decision}</strong><small>{choice.replacementAction ?? "Original action retained"}</small></> : <><strong>No override</strong><small>canonical execution only</small></>}</div>
            <div><strong>{humanize(item.outcomeStatus ?? "verified")}</strong><p>{item.outcomeSummary}</p></div>
            <div><strong>{pattern ? `${pattern.adjustment > 0 ? "+" : ""}${pattern.adjustment} rank` : "No active prior"}</strong><small>{pattern ? `${pattern.sampleCount} comparable outcomes` : `Requires ${snapshot.learning.minimumSamples} comparable outcomes`}</small></div>
          </article>)}
        </div> : <div className="empty-panel">No verified outcome summary is available in this snapshot yet.</div>}
      </div>
    </details>

    <details className="system-drawer intelligence-drawer">
      <summary><span><small>Chief intelligence</small><strong>Policy, prediction, and capabilities</strong></span><em>Inspect system</em></summary>
      <div className="drawer-content intelligence-stack">
        <section className="policy-bench">
          <div>
            <SectionHeading label="Policy bench" title="Promotion requires evidence" note="No challenger silently replaces the operating policy." />
            <div className="policy-ledger">
              <article><span>Guardrails</span><strong>{evaluationMetric(latestEvaluation, "guardrail")}</strong><small>ranked action checks</small></article>
              <article><span>Label coverage</span><strong>{evaluationMetric(latestEvaluation, "coverage")}</strong><small>active clients with training evidence</small></article>
              <article><span>Acceptance</span><strong>{evaluationMetric(latestEvaluation, "acceptance")}</strong><small>{latestEvaluation?.labeledChoiceCount ?? 0} evaluated labels</small></article>
              <article><span>Verified outcomes</span><strong>{verifiedOutcomes.length}</strong><small>visible in current ledger</small></article>
              <article><span>Boundary incidents</span><strong>Required: 0</strong><small>any incident blocks promotion</small></article>
              <article><span>Challenger</span><strong>Shadow only</strong><small>no automatic promotion</small></article>
            </div>
          </div>
          <aside>
            <span className="eyebrow">Non-negotiable invariants</span>
            {snapshot.training.safeguards.map((guardrail) => <p key={guardrail}><StatusMark state="healthy" />{guardrail}</p>)}
          </aside>
        </section>

        <section className="prediction-lab">
          <SectionHeading label="Prediction lab" title="Twenty skills, one measurable protocol" note="Challengers train and evaluate in shadow before any governed promotion." />
          <div className="prediction-contract">
            <LedgerMetric label="Verified skills" value="20 / 20" note="10 project · 10 global" />
            <LedgerMetric label="Training state" value="Shadow only" note="no model promotion started" />
            <LedgerMetric label="Golden set" value="Required" note="versioned, outcome-bound cases" />
            <LedgerMetric label="Promotion" value="Evidence gated" note="quality up, zero safety regression" />
          </div>
          <div className="prediction-pipeline" aria-label="Prediction improvement pipeline">
            {predictionLanes.map(({ lane, capabilities }, index) => <article key={lane}>
              <header><span>{String(index + 1).padStart(2, "0")}</span><strong>{lane}</strong></header>
              <div>{capabilities.map((capability) => <p key={capability.id}><span>{capability.name}</span><small>{capability.role}</small></p>)}</div>
            </article>)}
          </div>
        </section>

        <section>
          <SectionHeading label="Capability brain" title="The right specialist at the right checkpoint" note={`${skillInventoryCount} installed skill files feed a deliberately small operating spine.`} />
          <div className="everyday-stack" aria-label="Everyday marketing stack">
            {everydayStack.map((capability, index) => <div key={capability}><span>{String(index + 1).padStart(2, "0")}</span><strong>{capability}</strong>{index < everydayStack.length - 1 ? <small aria-hidden>→</small> : null}</div>)}
          </div>
          <div className="capability-register" tabIndex={0} aria-label="Ranked marketing capability register">
            <header><span>Rank</span><span>Capability</span><span>Operating role</span><span>Loop position</span></header>
            {chiefCapabilities.map((capability) => <article key={capability.id}>
              <span>{String(capability.rank).padStart(2, "0")}</span>
              <div><strong>{capability.name}</strong><small>{capability.id}</small></div>
              <p>{capability.role}</p>
              <span>{capability.group}</span>
            </article>)}
          </div>
        </section>
      </div>
    </details>

    <details className="system-drawer signal-drawer">
      <summary><span><small>Redacted sensor evidence</small><strong>{watchtower.signals.length || snapshot.queue.intakeCount} intake records</strong></span><em>Inspect signals</em></summary>
      <div className="drawer-content">
        <SectionHeading label="Signal ledger" title="Intake without surveillance theater" note={hasWatchtowerTelemetry
          ? `${watchtower.intake.pending} pending · ${watchtower.intake.quarantined} quarantined · ${watchtower.intake.occurrenceDuplicates + watchtower.intake.semanticDuplicates} duplicates suppressed.`
          : `${snapshot.queue.intakeCount} canonical intake items · Watchtower counts unavailable.`} />
        {watchtower.signals.length ? <div className="signal-ledger">
          {watchtower.signals.map((signal) => <article key={signal.id}>
            <time>{absoluteTime(signal.receivedAt)}</time>
            <div><strong>{signal.clientName ?? "Route unresolved"}</strong><small>{humanize(signal.sourceChannel)} · {humanize(signal.route)}</small></div>
            <span><StatusMark state={signal.state === "quarantined" ? "warning" : signal.state} />{humanize(signal.state)}</span>
            <small>{signal.quarantineReason ? humanize(signal.quarantineReason) : signal.id}</small>
          </article>)}
        </div> : <div className="empty-panel">No redacted Watchtower signal telemetry is available. The interface does not invent sensor content.</div>}
      </div>
    </details>
  </div>;
}
