const MANIFEST_URL = "../2026-08-11-grok-bot-routine-recording-manifest.json";

const stages = [
  { key: "sense", label: "Sense", verb: "Observe", title: "Sense the trigger" },
  { key: "route", label: "Route", verb: "Resolve", title: "Pin the exact operating route" },
  { key: "prioritize", label: "Prioritize", verb: "Rank", title: "Choose the next safe outcome" },
  { key: "build", label: "Build", verb: "Execute", title: "Run the bounded procedure" },
  { key: "verify", label: "Verify", verb: "Falsify", title: "Test the claimed result" },
  { key: "approve", label: "Approve", verb: "Gate", title: "Apply the authority boundary" },
  { key: "deliver", label: "Deliver", verb: "Produce", title: "Create the local or simulated delivery" },
  { key: "readback", label: "Read back", verb: "Confirm", title: "Read back the resulting state" },
  { key: "learn", label: "Learn", verb: "Record", title: "Seal the evidence receipt" }
];

const els = Object.fromEntries([
  "routineList", "routineSearch", "routineCount", "routineId", "cadenceLabel",
  "protocolTitle", "ownerBot", "stageTrack", "specimenTitle", "specimenData",
  "stageNumber", "stageVerb", "stageTitle", "stagePurpose", "stageAction",
  "stageResult", "approvalBoundary", "externalState", "resetButton", "nextButton",
  "progressMessage", "sessionRoutine", "sessionStage", "receiptStatus",
  "receiptSummary", "receiptLedger", "receiptJson"
].map(id => [id, document.getElementById(id)]));

const state = {
  routines: [],
  selected: null,
  filter: "all",
  query: "",
  stage: 0,
  complete: new Set(),
  route: "Pending",
  artifact: "Pending",
  approval: "Pending",
  externalAction: "Not attempted"
};

const queryParams = new URLSearchParams(location.search);
const recordingMode = queryParams.get("record") === "1";
const fixtureId = (queryParams.get("fixture") || "A").toUpperCase() === "B" ? "B" : "A";
const moduleDefinitions = {
  command: ["D01", "D02", "D08", "D09", "D10", "D11", "D27", "E01", "E02", "M04", "W01", "W10"],
  communications: ["D04", "D05", "D06", "D20", "D21", "D22", "D23", "D26", "W07", "W11", "E07", "E11", "M05"],
  web: ["D12", "D13", "D14", "D15", "D24", "D25", "W05", "E03", "E05", "M02"],
  performance: ["D17", "D18", "D19", "W02", "W03", "W06", "E06", "M03"],
  growth: ["D16", "W04", "W08", "E09"],
  reliability: ["D03", "D07", "W09", "M01", "E04", "E08", "E10"]
};
const moduleKey = queryParams.get("module") || "";
const moduleIds = moduleDefinitions[moduleKey] || [];
const moduleState = {
  running: false,
  complete: false,
  routineIndex: 0,
  completedRoutines: 0,
  completedStages: 0,
  receipts: []
};
const recordingEls = {
  controls: document.getElementById("recordingControls"),
  state: document.getElementById("recordState"),
  execute: document.getElementById("recordExecute"),
  advance: document.getElementById("recordAdvance")
};

if (recordingMode) {
  document.body.classList.add("recording-mode");
  recordingEls.controls.hidden = false;
}

function cadenceGroup(cadence) {
  if (cadence.startsWith("weekly")) return "weekly";
  return cadence;
}

function safeText(value) {
  return String(value ?? "");
}

function routeFor(routine) {
  if (routine.id === "W05") return "dillon-os / Prospect Radar / local-only";
  if (/client|email|slack|paid|report|campaign|crm/i.test(routine.name)) {
    return "synthetic-client / exact account / fixture repository";
  }
  if (/knowledge|dillon os/i.test(routine.name)) {
    return "dillon-os / 00_Inbox/Agent-Proposals/Grok";
  }
  return "internal / agent-vault / training fixture";
}

function artifactFor(routine) {
  return `training/${routine.id.toLowerCase()}-${routine.output.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}.json`;
}

function priorityFor(routine) {
  if (routine.cadence === "event") return "P1 when triggered · safety and scope first";
  if (routine.id === "W05") return "P1 production lane · readiness required";
  return "P2 recurring operations · evidence ready";
}

function renderRoutineList() {
  const filtered = state.routines.filter(routine => {
    const group = cadenceGroup(routine.cadence);
    const matchesFilter = state.filter === "all" || group === state.filter;
    const haystack = `${routine.id} ${routine.name} ${routine.owner_bot}`.toLowerCase();
    return matchesFilter && haystack.includes(state.query.toLowerCase());
  });

  els.routineList.replaceChildren(...filtered.map(routine => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "routine-button";
    button.dataset.routine = routine.id;
    button.setAttribute("aria-current", String(state.selected?.id === routine.id));
    button.innerHTML = `<span class="routine-code">${safeText(routine.id)}</span><span><span class="routine-name">${safeText(routine.name)}</span><span class="routine-owner">${safeText(routine.owner_bot)}</span></span>`;
    button.addEventListener("click", () => selectRoutine(routine.id));
    return button;
  }));
}

function renderStageTrack() {
  els.stageTrack.replaceChildren(...stages.map((stage, index) => {
    const li = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = stage.label;
    button.dataset.index = String(index + 1).padStart(2, "0");
    button.dataset.state = state.complete.has(index) ? "complete" : "open";
    if (index === state.stage) button.setAttribute("aria-current", "step");
    button.disabled = index > state.stage && !state.complete.has(index - 1);
    button.addEventListener("click", () => {
      if (!button.disabled) {
        state.stage = index;
        render();
      }
    });
    li.append(button);
    return li;
  }));
}

function specimenRows(routine) {
  const fixtureInput = fixtureId === "B"
    ? `${routine.demo_input} (fixture B: changed timestamps, ordering, and one bounded ambiguity)`
    : `${routine.demo_input} (fixture A: baseline)`;
  return [
    ["Trigger", routine.trigger],
    ["Demo input", fixtureInput],
    ["Fixture", fixtureId],
    ["Client", "Synthetic / separated"],
    ["Operator", routine.owner_bot],
    ["Finish line", routine.output]
  ];
}

function renderSpecimen(routine, stage) {
  els.specimenTitle.textContent = stage.key === "sense" ? "Signal under review" : `${stage.label} evidence`;
  els.specimenData.replaceChildren(...specimenRows(routine).map(([term, value]) => {
    const row = document.createElement("div");
    const dt = document.createElement("dt");
    const dd = document.createElement("dd");
    dt.textContent = term;
    dd.textContent = value;
    row.append(dt, dd);
    return row;
  }));
}

function stageCopy(routine, stage) {
  const copy = {
    sense: `Confirm the trigger and inspect only the bounded synthetic source. The routine begins from evidence, never from a guessed task.`,
    route: `Resolve one client, account, repository, environment, and owner before work moves. Ambiguity produces a stop, not a blended route.`,
    prioritize: `Rank the requested outcome by impact, urgency, readiness, evidence freshness, and approval state.`,
    build: `Execute the routine's declared steps on the synthetic fixture. The procedure may create local artifacts and run safe local checks.`,
    verify: `Try to falsify the claimed result using the routine's explicit success evidence. Configuration or confidence alone does not pass.`,
    approve: `Apply the exact boundary to the resulting artifact. Training can simulate approval, but it never grants a live external action.`,
    deliver: `Produce the local artifact or a clearly labeled simulated provider receipt. Do not collapse local completion into external delivery.`,
    readback: `Read back the persisted or simulated provider state and compare it with the exact intended target and version.`,
    learn: `Seal a redacted receipt with route, artifacts, sources, checks, assumptions, approval, external-action state, and next safest action.`
  };
  return copy[stage.key];
}

function actionModel(routine, stage) {
  const models = {
    sense: {
      steps: [
        `Confirm trigger: ${routine.trigger}`,
        `Bound input to: ${routine.demo_input}`,
        "Mark all people, messages, metrics, and provider state synthetic"
      ],
      button: "Accept bounded synthetic signal",
      result: "Signal accepted. Source scope is synthetic and freshness is recorded."
    },
    route: {
      steps: [
        `Resolve route: ${routeFor(routine)}`,
        `Assign operator: ${routine.owner_bot}`,
        "Quarantine any identity or account ambiguity"
      ],
      button: "Pin exact route",
      result: `Route pinned: ${routeFor(routine)}.`
    },
    prioritize: {
      steps: [
        `Priority proposal: ${priorityFor(routine)}`,
        "Check dependency readiness and evidence freshness",
        "Keep canonical queue write as a Marketing Chief action"
      ],
      button: "Accept priority proposal",
      result: `Priority accepted for training: ${priorityFor(routine)}.`
    },
    build: {
      steps: routine.steps,
      button: "Execute simulated procedure",
      result: `Procedure complete. Local output prepared: ${routine.output}.`
    },
    verify: {
      steps: [
        `Acceptance claim: ${routine.success_evidence}`,
        "Compare artifact with exact route, source, and requested scope",
        "Return pass, revise, blocked, or abstain from reproduced evidence"
      ],
      button: "Run independent verification",
      result: `PASS on synthetic fixture: ${routine.success_evidence}.`
    },
    approve: {
      steps: [
        `Boundary: ${routine.approval_boundary}`,
        "Bind any approval to one displayed version and destination",
        "Keep live external action unapproved during training"
      ],
      button: "Apply training approval gate",
      result: "Gate applied. Simulated continuation approved; live external action remains unapproved."
    },
    deliver: {
      steps: [
        `Create artifact: ${artifactFor(routine)}`,
        "Label provider result SIMULATED when a delivery step is represented",
        "Record externalActionAttempted=false"
      ],
      button: "Produce local / simulated artifact",
      result: `Artifact produced locally: ${artifactFor(routine)}.`
    },
    readback: {
      steps: [
        "Read the exact artifact path or simulated provider receipt",
        "Confirm target, version, timestamp, and resulting state",
        "Do not advance status after a failed readback"
      ],
      button: "Verify simulated readback",
      result: "Readback verified. Intended and resulting synthetic states match."
    },
    learn: {
      steps: [
        "Record route, artifact, sources, freshness, checks, and assumptions",
        "Record privacy=redacted and exact approval state",
        "Assign one next safest action and preserve canonical authority"
      ],
      button: "Seal training receipt",
      result: "Receipt sealed. This protocol is ready for a second-fixture replay."
    }
  };
  return models[stage.key];
}

function executeStage(index) {
  const routine = state.selected;
  const stage = stages[index];
  const model = actionModel(routine, stage);
  state.complete.add(index);

  if (stage.key === "route") state.route = routeFor(routine);
  if (stage.key === "approve") state.approval = "Synthetic continuation only; live action unapproved";
  if (stage.key === "deliver") state.artifact = artifactFor(routine);
  if (stage.key === "readback") state.externalAction = "Not attempted; simulated readback verified";

  els.stageResult.dataset.state = "complete";
  els.stageResult.innerHTML = `<strong>Stage complete.</strong> ${safeText(model.result)}${stage.key === "build" ? `<pre class="terminal">$ protocol run ${safeText(routine.id)} --fixture synthetic\n[route] ${safeText(routeFor(routine))}\n[steps] ${routine.steps.length}/${routine.steps.length} complete\n[external] not attempted\n[result] local artifact ready</pre>` : ""}`;
  renderReceipt();
  updateControls();
  renderStageTrack();
}

function renderAction(routine, stage, index) {
  const model = actionModel(routine, stage);
  const template = document.getElementById("stepListTemplate").content.cloneNode(true);
  const list = template.querySelector("ol");
  list.replaceChildren(...model.steps.map(step => {
    const li = document.createElement("li");
    li.textContent = step;
    return li;
  }));
  const button = template.querySelector("button");
  button.textContent = model.button;
  button.disabled = state.complete.has(index);
  button.addEventListener("click", () => executeStage(index));
  els.stageAction.replaceChildren(template);
  els.stageResult.replaceChildren();
  els.stageResult.removeAttribute("data-state");
  if (state.complete.has(index)) {
    els.stageResult.dataset.state = "complete";
    els.stageResult.textContent = `Stage already complete. ${model.result}`;
  }
}

function receiptObject() {
  const sealed = state.complete.size === stages.length;
  return {
    routine_id: state.selected.id,
    routine: state.selected.name,
    operator: state.selected.owner_bot,
    status: sealed ? "canary-recorded" : "open",
    route: state.route,
    artifact: state.artifact,
    sources: [MANIFEST_URL, `synthetic training fixture ${fixtureId}`],
    freshness: "2026-08-11",
    checks: `${state.complete.size}/${stages.length}`,
    verification: state.complete.has(4) ? "pass on synthetic fixture" : "pending",
    assumptions: ["all displayed records are synthetic", "no live provider is connected", `fixture=${fixtureId}`],
    privacy: "redacted",
    approval_state: state.approval,
    external_action_attempted: false,
    external_state: state.externalAction,
    canonical_write_attempted: false,
    next_safest_action: sealed ? "Replay against a second synthetic fixture" : `Complete ${stages[state.stage].label}`
  };
}

function renderReceipt() {
  const receipt = receiptObject();
  const sealed = state.complete.size === stages.length;
  els.receiptStatus.textContent = sealed ? "SEALED" : "OPEN";
  els.receiptStatus.dataset.state = sealed ? "sealed" : "open";
  els.receiptSummary.textContent = sealed
    ? "All nine stages passed on synthetic data. Replay verification is next."
    : "The receipt seals only after the protocol reaches Learn.";
  const rows = [
    ["Route", receipt.route],
    ["Artifact", receipt.artifact],
    ["Checks", receipt.checks],
    ["Approval", receipt.approval_state],
    ["Privacy", receipt.privacy],
    ["Next action", receipt.next_safest_action]
  ];
  els.receiptLedger.replaceChildren(...rows.map(([term, value]) => {
    const row = document.createElement("div");
    const dt = document.createElement("dt");
    const dd = document.createElement("dd");
    dt.textContent = term;
    dd.textContent = value;
    row.append(dt, dd);
    return row;
  }));
  els.receiptJson.textContent = JSON.stringify(receipt, null, 2);
}

function updateControls() {
  const complete = state.complete.has(state.stage);
  const last = state.stage === stages.length - 1;
  els.nextButton.disabled = !complete || last;
  els.nextButton.textContent = last ? "Protocol complete" : `Advance to ${stages[state.stage + 1].label}`;
  els.progressMessage.textContent = last && complete
    ? "Receipt sealed. Replay this routine on fixture B."
    : complete
      ? `${stages[state.stage].label} complete. Continue when ready.`
      : "Complete the stage action to continue.";

  if (recordingMode) {
    if (moduleIds.length) {
      const totalStages = moduleIds.length * stages.length;
      recordingEls.execute.disabled = moduleState.running || moduleState.complete;
      recordingEls.execute.textContent = moduleState.complete
        ? "Module complete"
        : moduleState.running
          ? `Running ${state.selected.id} / ${stages[state.stage].label}`
          : "Run module end to end";
      recordingEls.advance.disabled = true;
      recordingEls.advance.textContent = moduleState.complete
        ? `${moduleState.completedRoutines}/${moduleIds.length} routines sealed`
        : `${moduleState.completedStages}/${totalStages} stages`;
      recordingEls.state.textContent = moduleState.complete
        ? `${moduleKey.toUpperCase()} · SEALED · ${moduleState.completedRoutines}/${moduleIds.length} routines · ${moduleState.completedStages}/${totalStages} stages`
        : `${moduleKey.toUpperCase()} · ${state.selected.id} · ${stages[state.stage].label} · fixture ${fixtureId}`;
      return;
    }
    recordingEls.execute.disabled = complete;
    recordingEls.execute.textContent = complete ? `${stages[state.stage].label} complete` : `Execute ${stages[state.stage].label}`;
    recordingEls.advance.disabled = !complete || last;
    recordingEls.advance.textContent = last ? "Protocol complete" : `Advance to ${stages[state.stage + 1].label}`;
    recordingEls.state.textContent = `${state.selected.id} · ${stages[state.stage].label} · ${complete ? "verified" : "action pending"}`;
  }
}

function delay(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

async function runModule() {
  if (!moduleIds.length || moduleState.running || moduleState.complete) return;
  moduleState.running = true;
  updateControls();

  for (let routineIndex = 0; routineIndex < moduleIds.length; routineIndex += 1) {
    moduleState.routineIndex = routineIndex;
    selectRoutine(moduleIds[routineIndex]);
    await delay(400);

    for (let stageIndex = 0; stageIndex < stages.length; stageIndex += 1) {
      state.stage = stageIndex;
      render();
      await delay(450);
      executeStage(stageIndex);
      moduleState.completedStages += 1;
      updateControls();
      await delay(550);
    }

    moduleState.receipts.push(receiptObject());
    moduleState.completedRoutines += 1;
    updateControls();
    await delay(450);
  }

  moduleState.running = false;
  moduleState.complete = true;
  window.__protocol54ModuleRun = {
    module: moduleKey,
    fixture: fixtureId,
    routines: moduleState.completedRoutines,
    stages: moduleState.completedStages,
    privacy: "redacted",
    externalActionAttempted: false,
    canonicalWriteAttempted: false,
    receipts: moduleState.receipts
  };
  updateControls();
}

function resetRun() {
  state.stage = 0;
  state.complete = new Set();
  state.route = "Pending";
  state.artifact = "Pending";
  state.approval = "Pending";
  state.externalAction = "Not attempted";
  render();
}

function selectRoutine(id) {
  const routine = state.routines.find(item => item.id === id);
  if (!routine) return;
  state.selected = routine;
  history.replaceState(null, "", `#${routine.id}`);
  resetRun();
  document.querySelector(`[data-routine="${CSS.escape(id)}"]`)?.scrollIntoView({ block: "nearest" });
}

function render() {
  const routine = state.selected;
  const stage = stages[state.stage];
  if (!routine) return;

  els.routineId.textContent = routine.id;
  els.cadenceLabel.textContent = routine.cadence;
  els.protocolTitle.textContent = routine.name;
  els.ownerBot.textContent = routine.owner_bot;
  els.sessionRoutine.textContent = routine.id;
  els.sessionStage.textContent = stage.label;
  els.stageNumber.textContent = String(state.stage + 1).padStart(2, "0");
  els.stageVerb.textContent = stage.verb;
  els.stageTitle.textContent = stage.title;
  els.stagePurpose.textContent = stageCopy(routine, stage);
  els.approvalBoundary.textContent = routine.approval_boundary;
  els.externalState.textContent = state.externalAction;

  renderRoutineList();
  renderStageTrack();
  renderSpecimen(routine, stage);
  renderAction(routine, stage, state.stage);
  renderReceipt();
  updateControls();
}

function bindEvents() {
  els.routineSearch.addEventListener("input", event => {
    state.query = event.target.value;
    renderRoutineList();
  });

  document.querySelectorAll("[data-filter]").forEach(button => {
    button.addEventListener("click", () => {
      state.filter = button.dataset.filter;
      document.querySelectorAll("[data-filter]").forEach(item => item.setAttribute("aria-pressed", String(item === button)));
      renderRoutineList();
    });
  });

  els.resetButton.addEventListener("click", resetRun);
  els.nextButton.addEventListener("click", () => {
    if (!els.nextButton.disabled && state.stage < stages.length - 1) {
      state.stage += 1;
      render();
    }
  });

  if (recordingMode) {
    recordingEls.execute.addEventListener("click", () => {
      if (moduleIds.length) {
        runModule();
        return;
      }
      document.querySelector(".execute-action:not(:disabled)")?.click();
    });
    recordingEls.advance.addEventListener("click", () => {
      if (!recordingEls.advance.disabled) els.nextButton.click();
    });
  }

  document.addEventListener("keydown", event => {
    if (event.altKey && event.key === "ArrowRight" && !els.nextButton.disabled) {
      els.nextButton.click();
    }
    if (event.altKey && event.key.toLowerCase() === "x") {
      document.querySelector(".execute-action:not(:disabled)")?.click();
    }
  });
}

async function boot() {
  try {
    const response = await fetch(MANIFEST_URL, { cache: "no-store" });
    if (!response.ok) throw new Error(`Manifest request failed: ${response.status}`);
    const manifest = await response.json();
    state.routines = manifest.routines;
    els.routineCount.textContent = `${state.routines.length} protocols`;
    const hashId = location.hash.replace("#", "").toUpperCase();
    const initialId = moduleIds[0] || hashId;
    state.selected = state.routines.find(routine => routine.id === initialId) || state.routines[0];
    bindEvents();
    render();
  } catch (error) {
    els.protocolTitle.textContent = "Training manifest unavailable";
    els.stagePurpose.textContent = error.message;
    els.nextButton.disabled = true;
  }
}

boot();
