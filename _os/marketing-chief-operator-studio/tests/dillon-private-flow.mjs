import { AxeBuilder } from "@axe-core/playwright";
import { chromium } from "@playwright/test";
import { readFileSync } from "node:fs";

const target = process.env.DILLON_PRIVATE_URL ?? "http://localhost:3010";
const machineToken = process.env.MC_MACHINE_SYNC_TOKEN ?? "local-test-only-not-production-secret-0001";
const expectedSnapshot = JSON.parse(
  readFileSync(new URL("../data/seed-snapshot.json", import.meta.url), "utf8")
);
const identity = {
  "oai-authenticated-user-email": "dillonmohr8777@gmail.com",
  "oai-authenticated-user-full-name": "Dillon%20Mohr",
  "oai-authenticated-user-full-name-encoding": "percent-encoded-utf-8"
};
const checks = [];

function check(condition, label, detail = "") {
  if (!condition) throw new Error(`${label}${detail ? `: ${detail}` : ""}`);
  checks.push(label);
}

async function studioApi(method = "GET", body) {
  const response = await fetch(`${target}/api/studio`, {
    method,
    headers: {
      ...identity,
      accept: "application/json",
      ...(body ? { "content-type": "application/json" } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await response.json();
  return { response, data };
}

async function machineApi(method = "GET", body, token = machineToken) {
  const response = await fetch(`${target}/api/machine`, {
    method,
    headers: {
      authorization: `Bearer ${token}`,
      accept: "application/json",
      ...(body ? { "content-type": "application/json" } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await response.json();
  return { response, data };
}

async function openDesktopView(page, name, heading) {
  const navigation = page.getByRole("navigation", { name: "Studio navigation" });
  const button = navigation.getByRole("button", { name: new RegExp(`^${name}`) });
  await button.click();
  await page.getByRole("heading", { name: heading }).waitFor();
}

const browser = await chromium.launch({ channel: "msedge", headless: true });
try {
  const initial = await studioApi();
  check(initial.response.ok, "authenticated private API responds");
  const snapshot = initial.data.snapshot;
  check(
    snapshot.queue.revision === expectedSnapshot.queue.revision,
    "canonical queue revision matches the exported Windows source"
  );
  check(snapshot.clients.length === 21, "all 21 canonical client dossiers are loaded");
  check(
    snapshot.clients.slice(0, 3).map((client) => client.name).join("|") ===
      "Bridge Software|VA Claims Edge|Momentum 360",
    "portfolio begins with the governed client order"
  );
  check(
    snapshot.workItems.length === expectedSnapshot.workItems.length,
    "all governed work items are loaded"
  );
  check(initial.data.identity.email === identity["oai-authenticated-user-email"], "owner identity is bound to the payload");
  check(initial.data.evaluations.length >= 1, "daily evaluation exists");
  const unauthenticatedMachine = await machineApi("GET", undefined, "not-authorized");
  check(unauthenticatedMachine.response.status === 401, "machine sync rejects an invalid credential");
  const machineBefore = await machineApi();
  check(machineBefore.response.ok, "authenticated Windows bridge can read the handoff plane");
  check(machineBefore.data.snapshot.queue.revision === snapshot.queue.revision, "Windows bridge receives the exact queue revision");
  check(Array.isArray(machineBefore.data.ownerIntents), "Windows bridge receives the owner-intent handoff plane");
  const staleSnapshot = structuredClone(snapshot);
  staleSnapshot.queue.revision -= 1;
  const staleSync = await machineApi("POST", { action: "sync-snapshot", snapshot: staleSnapshot });
  check(staleSync.response.status === 400, "Windows bridge cannot replace the mirror with a stale snapshot");
  const currentSync = await machineApi("POST", { action: "sync-snapshot", snapshot });
  check(currentSync.response.ok && currentSync.data.snapshot.clientCount === 21, "Windows bridge refreshes the allowlisted mirror");

  const consoleErrors = [];
  const failedRequests = [];
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 960 },
    colorScheme: "light",
    extraHTTPHeaders: identity
  });
  const desktop = await desktopContext.newPage();
  desktop.on("console", (message) => {
    const text = message.text();
    const localVinextFont = target.startsWith("http://localhost") &&
      /Not allowed to load local resource: file:\/\/\/.*\/\.vinext\/fonts\//i.test(text);
    if (message.type() === "error" && !localVinextFont) consoleErrors.push(text);
  });
  desktop.on("requestfailed", (request) => {
    const url = request.url();
    const localVinextFont = target.startsWith("http://localhost") && /^file:\/\/\/.*\/\.vinext\/fonts\//i.test(url);
    if (!localVinextFont) failedRequests.push(`${url} ${request.failure()?.errorText ?? "failed"}`);
  });
  await desktop.goto(target, { waitUntil: "networkidle" });
  await desktop.getByRole("heading", { name: "Your marketing system, in focus." }).waitFor();
  await desktop.waitForFunction(() => document.querySelector(".topbar small")?.textContent?.includes("synced"));
  check(await desktop.getByText("Dillon Mohr · owner only", { exact: true }).isVisible(), "owner-only identity is visible");
  check((await desktop.getByRole("navigation", { name: "Studio navigation" }).getByRole("button").count()) === 8, "desktop exposes all eight operator views");
  check(await desktop.getByRole("heading", { name: "What do you want done?" }).isVisible(), "universal owner command is immediately available");

  await openDesktopView(desktop, "Clients", "Every client, one record.");
  const clientList = desktop.locator('[aria-label="Client list"]');
  check((await clientList.locator(":scope > button").count()) === 21, "desktop renders 21 real clients");
  await desktop.getByLabel("Search clients").fill("Bridge Software");
  check((await clientList.locator(":scope > button").count()) === 1, "client search isolates Bridge Software");
  await clientList.getByRole("button", { name: /Bridge Software/ }).click();
  check(await desktop.getByRole("heading", { name: "Bridge Software" }).isVisible(), "Bridge dossier opens");

  await openDesktopView(desktop, "Queue", "One source of operational truth.");
  await desktop.getByLabel("Filter queue").selectOption("all");
  await desktop.getByLabel("Search queue").fill("Prepare Bridge milestone and decision brief");
  const bridgeItem = snapshot.workItems.find((item) =>
    item.clientName === "Bridge Software" &&
    item.automaticEligible &&
    item.reversible &&
    !item.externalAction
  );
  check(Boolean(bridgeItem), "a reversible Bridge local action is available");
  const bridgeRow = desktop.locator(".queue-table article").filter({ hasText: bridgeItem.title });
  check((await bridgeRow.count()) === 1, "Bridge action remains client-routed in the queue");
  await bridgeRow.getByRole("button", { name: "Queue local run" }).click();
  const operatorDialog = desktop.getByRole("dialog");
  await operatorDialog.locator("textarea").fill("Do all safe local preparation, preserve approval gates, and return verified evidence.");
  await operatorDialog.getByRole("button", { name: "Queue local run" }).click();
  await operatorDialog.waitFor({ state: "detached" });
  await desktop.getByRole("heading", { name: "Intent becomes governed work." }).waitFor();
  check(
    await desktop.locator(".activity-ledger").getByText("Prepare Bridge milestone and decision brief", { exact: true }).first().isVisible(),
    "Windows handoff appears in the operator ledger"
  );

  await openDesktopView(desktop, "Today", "Your marketing system, in focus.");
  const commandTitle = `Verify Studio client command path ${Date.now()}`;
  await desktop.getByLabel("Command client").selectOption("bridge-software");
  await desktop.getByLabel("Command title").fill(commandTitle);
  await desktop.getByLabel("Command instruction").fill("Prepare a local verification brief and keep all external actions behind explicit approval.");
  await desktop.locator('input[name="work-mode"][value="prepare"]').check();
  await desktop.getByRole("button", { name: "Send to Marketing Chief" }).click();
  await desktop.getByText(/Captured\. Windows Marketing Chief/i).waitFor();
  check(true, "owner command confirms governed Windows capture");
  await openDesktopView(desktop, "Work", "Intent becomes governed work.");
  check(await desktop.locator(".intent-ledger").getByText(commandTitle, { exact: true }).isVisible(), "owner command is visible in the operating ledger");

  await openDesktopView(desktop, "Today", "Your marketing system, in focus.");
  const decisionCard = desktop.locator('.recommendation[data-lane="decision"]');
  await decisionCard.getByRole("button", { name: "Train choice" }).click();
  const choiceDialog = desktop.getByRole("dialog");
  await choiceDialog.locator('input[value="accept"]').check();
  await choiceDialog.locator('textarea[placeholder^="Short rationale"]').fill("Correct next move. Keep it governed and continue.");
  await choiceDialog.getByRole("button", { name: "Record choice" }).click();
  await choiceDialog.waitFor({ state: "detached" });
  await desktop.getByRole("heading", { name: "Operational learning, honestly measured." }).waitFor();
  check(await desktop.getByText("Correct next move. Keep it governed and continue.", { exact: false }).isVisible(), "deliberate Dillon choice becomes a visible label");

  await openDesktopView(desktop, "Runs", "Every run leaves a trace.");
  check((await desktop.locator(".run-board li").count()) > 0, "execution evidence graph renders");
  await openDesktopView(desktop, "Health", "Healthy means current, routed, and reversible.");
  check((await desktop.locator(".source-ledger article").count()) === 4, "GitHub, Gmail, Slack, and HubSpot routes are visible");

  const accessibility = await new AxeBuilder({ page: desktop })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  check(
    accessibility.violations.length === 0,
    "desktop has no targeted accessibility violations",
    JSON.stringify(accessibility.violations.map((item) => ({
      id: item.id,
      nodes: item.nodes.map((node) => ({ target: node.target, html: node.html, summary: node.failureSummary }))
    })))
  );
  check(await desktop.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), "desktop has no horizontal overflow");
  check(consoleErrors.length === 0, "desktop emits no console errors", consoleErrors.join(" | "));
  check(failedRequests.length === 0, "desktop emits no failed requests", failedRequests.join(" | "));

  const afterUi = await studioApi();
  check(afterUi.data.overlay.persistedChoices >= 1, "choice persists in D1");
  const bridgeRequests = afterUi.data.operatorRequests.filter((request) =>
    request.workItemId === bridgeItem.id &&
    request.workItemVersion === bridgeItem.version &&
    request.queueRevision === snapshot.queue.revision &&
    request.requestType === "execute_local"
  );
  check(bridgeRequests.length === 1, "operator request persists once");

  const requestBody = {
    action: "request-operator",
    workItemId: bridgeItem.id,
    workItemVersion: bridgeItem.version,
    queueRevision: snapshot.queue.revision,
    requestType: "execute_local",
    rationale: "Idempotency replay from the Dillon workflow verifier."
  };
  const replayOne = await studioApi("POST", requestBody);
  const replayTwo = await studioApi("POST", requestBody);
  check(replayOne.response.ok && replayTwo.response.ok, "idempotent operator replay succeeds");
  const replayCount = replayTwo.data.operatorRequests.filter((request) =>
    request.workItemId === bridgeItem.id &&
    request.workItemVersion === bridgeItem.version &&
    request.queueRevision === snapshot.queue.revision &&
    request.requestType === "execute_local"
  ).length;
  check(replayCount === 1, "idempotent replay does not duplicate the Windows handoff");

  const intentId = `test-intent-${Date.now()}`;
  const intentBody = {
    action: "capture-intent",
    id: intentId,
    clientId: "bridge-software",
    queueRevision: snapshot.queue.revision,
    title: "Build an idempotent Studio verification packet",
    instruction: "Prepare a local verification packet and preserve every external approval gate.",
    mode: "prepare",
    priority: "P1",
    dueAt: ""
  };
  const intentOne = await studioApi("POST", intentBody);
  const intentTwo = await studioApi("POST", intentBody);
  check(intentOne.response.ok && intentTwo.response.ok, "idempotent owner-intent replay succeeds");
  check(intentTwo.data.ownerIntents.filter((intent) => intent.id === intentId).length === 1, "idempotent owner-intent replay does not duplicate work");
  check(
    intentTwo.data.ownerIntents.find((intent) => intent.id === intentId)?.clientName === "Bridge Software",
    "owner intent preserves the exact canonical client route"
  );
  const unsafeIntent = await studioApi("POST", {
    ...intentBody,
    id: `unsafe-intent-${Date.now()}`,
    instruction: "password=do-not-store-this"
  });
  check(unsafeIntent.response.status === 400, "owner intent rejects secret-shaped material");
  const inactiveClient = snapshot.clients.find((client) => client.status !== "active");
  check(Boolean(inactiveClient), "inactive client guardrail fixture exists");
  const inactiveIntent = await studioApi("POST", {
    ...intentBody,
    id: `inactive-intent-${Date.now()}`,
    clientId: inactiveClient.id
  });
  check(inactiveIntent.response.status === 400, "owner intent rejects an inactive client route");

  const externalItem = snapshot.workItems.find((item) => item.externalAction);
  check(Boolean(externalItem), "an external-action guardrail fixture exists");
  const blockedAutomatic = await studioApi("POST", {
    action: "request-operator",
    workItemId: externalItem.id,
    workItemVersion: externalItem.version,
    queueRevision: snapshot.queue.revision,
    requestType: "execute_local"
  });
  check(blockedAutomatic.response.status === 400, "external actions cannot be queued as automatic local execution");

  const recommendation = snapshot.recommendations.ranked[0];
  const staleChoice = await studioApi("POST", {
    action: "record-choice",
    workItemId: recommendation.workItemId,
    workItemVersion: recommendation.workItemVersion,
    queueRevision: snapshot.queue.revision - 1,
    predictionLane: recommendation.lane,
    decision: "accept",
    predictedAction: recommendation.nextAction
  });
  check(staleChoice.response.status === 400, "stale preference labels are rejected");

  const activeRequest = replayTwo.data.operatorRequests.find((request) =>
    request.workItemId === bridgeItem.id &&
    request.workItemVersion === bridgeItem.version &&
    request.queueRevision === snapshot.queue.revision &&
    request.requestType === "execute_local"
  );
  const resolved = await machineApi("POST", {
    action: "resolve-operator",
    id: activeRequest.id,
    state: "completed",
    resolutionSummary: "Verified local test completed without external delivery or canonical queue mutation.",
    safeResultRef: `queue-item:${bridgeItem.id}`
  });
  check(resolved.response.ok, "verified operator resolution is recorded");
  check(
    resolved.data.operatorRequest?.state === "completed" &&
      resolved.data.operatorRequest?.resolvedBy === "marketing-chief-windows@local",
    "resolved handoff carries the completed state"
  );
  const resolvedIntent = await machineApi("POST", {
    action: "resolve-intent",
    id: intentId,
    state: "completed",
    resolutionSummary: "Verified owner instruction captured for the exact client without external action.",
    safeResultRef: `queue-item:${bridgeItem.id}`
  });
  check(resolvedIntent.response.ok, "verified owner-intent resolution is recorded");
  check(
    resolvedIntent.data.ownerIntent?.state === "completed" &&
      resolvedIntent.data.ownerIntent?.resolvedBy === "marketing-chief-windows@local",
    "resolved owner intent carries the Windows writer identity"
  );

  const secondGet = await studioApi();
  check(secondGet.data.evaluations[0].id === afterUi.data.evaluations[0].id, "daily evaluation is idempotent for an unchanged label state");

  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    colorScheme: "light",
    extraHTTPHeaders: identity
  });
  const mobile = await mobileContext.newPage();
  await mobile.goto(target, { waitUntil: "networkidle" });
  const mobileNav = mobile.getByRole("navigation", { name: "Mobile navigation" });
  check(await mobileNav.isVisible(), "mobile navigation is visible");
  check((await mobileNav.getByRole("button").count()) === 5, "mobile keeps five core operating workflows");
  check(await mobile.getByRole("heading", { name: "What do you want done?" }).isVisible(), "mobile exposes the universal owner command");
  await mobileNav.getByRole("button", { name: "Clients" }).click();
  await mobile.getByRole("heading", { name: "Every client, one record." }).waitFor();
  check((await mobile.locator('[aria-label="Client list"] > button').count()) === 21, "mobile exposes every canonical client");
  check(await mobile.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), "mobile has no horizontal overflow");

  console.log(JSON.stringify({
    target,
    browser: "Microsoft Edge",
    queueRevision: snapshot.queue.revision,
    clients: snapshot.clients.length,
    workItems: snapshot.workItems.length,
    checksPassed: checks.length,
    checks
  }, null, 2));
} finally {
  await browser.close();
}
