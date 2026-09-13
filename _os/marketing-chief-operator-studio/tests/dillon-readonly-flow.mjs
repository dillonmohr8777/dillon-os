import { AxeBuilder } from "@axe-core/playwright";
import { chromium } from "@playwright/test";
import { readFileSync } from "node:fs";

const target =
  process.env.DILLON_PRIVATE_URL ??
  "http://localhost:3010";
const bypassToken = process.env.OAI_SITES_BYPASS_TOKEN;
const expectedSnapshot = JSON.parse(
  readFileSync(new URL("../data/seed-snapshot.json", import.meta.url), "utf8")
);
const identity = {
  "oai-authenticated-user-email": "dillonmohr8777@gmail.com",
  "oai-authenticated-user-full-name": "Dillon%20Mohr",
  "oai-authenticated-user-full-name-encoding": "percent-encoded-utf-8",
  ...(bypassToken
    ? { "OAI-Sites-Authorization": `Bearer ${bypassToken}` }
    : {})
};
const checks = [];

function check(condition, label, detail = "") {
  if (!condition) throw new Error(`${label}${detail ? `: ${detail}` : ""}`);
  checks.push(label);
}

async function studioApi() {
  const response = await fetch(`${target}/api/studio`, {
    headers: { ...identity, accept: "application/json" }
  });
  const data = await response.json();
  return { response, data };
}

async function openDesktopView(page, name, heading) {
  const navigation = page.getByRole("navigation", { name: "Studio navigation" });
  await navigation.getByRole("button", { name: new RegExp(`^${name}`) }).click();
  await page.getByRole("heading", { name: heading }).waitFor();
}

const initial = await studioApi();
check(initial.response.ok, "private API responds", String(initial.response.status));
const snapshot = initial.data.snapshot;
check(
  snapshot.queue.revision === expectedSnapshot.queue.revision,
  "queue revision matches the exported Windows source"
);
check(snapshot.clients.length === 21, "all 21 canonical clients are present");
check(
  snapshot.workItems.length === expectedSnapshot.workItems.length,
  "all governed work items are present"
);
check(
  initial.data.identity.email === identity["oai-authenticated-user-email"],
  "the private surface binds the owner identity"
);
check(initial.data.evaluations.length >= 1, "the private surface exposes daily evaluations");
const initialChoiceCount = initial.data.overlay.persistedChoices;
const initialOperatorCount = initial.data.operatorRequests.length;
const initialIntentCount = initial.data.ownerIntents.length;

const browser = await chromium.launch({ channel: "msedge", headless: true });
try {
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
    const localVinextFont =
      target.startsWith("http://localhost") &&
      /Not allowed to load local resource: file:\/\/\/.*\/\.vinext\/fonts\//i.test(text);
    if (message.type() === "error" && !localVinextFont) consoleErrors.push(text);
  });
  desktop.on("requestfailed", (request) => {
    const url = request.url();
    const localVinextFont =
      target.startsWith("http://localhost") &&
      /^file:\/\/\/.*\/\.vinext\/fonts\//i.test(url);
    if (!localVinextFont) {
      failedRequests.push(`${url} ${request.failure()?.errorText ?? "failed"}`);
    }
  });

  await desktop.goto(target, { waitUntil: "networkidle" });
  await desktop.getByRole("heading", { name: "Your marketing system, in focus." }).waitFor();
  await desktop.waitForFunction(() =>
    document.querySelector(".topbar small")?.textContent?.includes("synced")
  );
  check(
    await desktop.getByText(/Dillon Mohr.*owner only/i).isVisible(),
    "the surface shows the owner-only identity"
  );
  check(
    (await desktop
      .getByRole("navigation", { name: "Studio navigation" })
      .getByRole("button")
      .count()) === 8,
    "desktop exposes all eight operator views"
  );
  check(
    await desktop.getByRole("heading", { name: "What do you want done?" }).isVisible(),
    "desktop exposes the owner command without auto-submitting it"
  );

  await openDesktopView(desktop, "Work", "Intent becomes governed work.");
  const boardTitles = await desktop.locator(".work-board article > strong").allTextContents();
  check(
    new Set(boardTitles).size === boardTitles.length,
    "visual work board assigns each item to one operating lane"
  );

  await openDesktopView(desktop, "Clients", "Every client, one record.");
  const clientList = desktop.locator('[aria-label="Client list"]');
  check(
    (await clientList.locator(":scope > button").count()) === 21,
    "desktop lists all 21 clients"
  );
  await desktop.getByLabel("Search clients").fill("Bridge Software");
  check(
    (await clientList.locator(":scope > button").count()) === 1,
    "client search isolates Bridge Software"
  );
  await clientList.getByRole("button", { name: /Bridge Software/ }).click();
  check(
    await desktop.getByRole("heading", { name: "Bridge Software" }).isVisible(),
    "the Bridge dossier opens"
  );

  await openDesktopView(desktop, "Queue", "One source of operational truth.");
  await desktop.getByLabel("Filter queue").selectOption("all");
  await desktop
    .getByLabel("Search queue")
    .fill("Prepare Bridge milestone and decision brief");
  const bridgeRow = desktop
    .locator(".queue-table article")
    .filter({ hasText: "Prepare Bridge milestone and decision brief" });
  check(
    (await bridgeRow.count()) === 1,
    "the Bridge action remains client-routed"
  );
  await bridgeRow.getByRole("button", { name: "Queue local run" }).click();
  await desktop.getByRole("heading", { name: "Queue local run" }).waitFor();
  check(
    await desktop
      .getByText(/No external delivery, publishing, spend/i)
      .isVisible(),
    "the operator dialog preserves external-action gates"
  );
  await desktop.getByRole("button", { name: "Close dialog" }).click();
  check(
    (await desktop.getByRole("dialog").count()) === 0,
    "the operator dialog closes without mutation"
  );

  await openDesktopView(desktop, "Approvals", "Nothing consequential slips through.");
  const expectedApprovalCount = snapshot.workItems.filter((item) =>
    !["completed", "deferred", "blocked"].includes(item.status) &&
    (item.approvalStatus === "pending" || item.status === "needs_approval")
  ).length;
  check(
    (await desktop.locator(".approval-ledger article").count()) === expectedApprovalCount,
    "approval desk contains only current pending owner decisions"
  );

  await openDesktopView(desktop, "Today", "Your marketing system, in focus.");
  await desktop
    .locator('.recommendation[data-lane="decision"]')
    .getByRole("button", { name: "Train choice" })
    .click();
  await desktop.getByRole("heading", { name: "Train this choice" }).waitFor();
  check(
    await desktop
      .getByText(/Saved to the private learning overlay/i)
      .isVisible(),
    "the choice dialog explains governed learning"
  );
  await desktop.getByRole("button", { name: "Close dialog" }).click();
  check(
    (await desktop.getByRole("dialog").count()) === 0,
    "the choice dialog closes without a fake label"
  );

  await openDesktopView(desktop, "Runs", "Every run leaves a trace.");
  check(
    (await desktop.locator(".run-board li").count()) > 0,
    "the execution evidence graph renders"
  );
  await openDesktopView(desktop, "Learning", "Operational learning, honestly measured.");
  check(
    await desktop
      .getByText(/only deliberate choices and verified outcomes become labels/i)
      .isVisible(),
    "the learning view exposes the deliberate-label contract"
  );
  await openDesktopView(desktop, "Health", "Healthy means current, routed, and reversible.");
  check(
    (await desktop.locator(".source-ledger article").count()) === 4,
    "the health view shows the approved source routes"
  );

  const accessibility = await new AxeBuilder({ page: desktop })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  check(
    accessibility.violations.length === 0,
    "desktop has no targeted accessibility violations",
    accessibility.violations.map((item) => item.id).join(", ")
  );
  check(
    await desktop.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth
    ),
    "desktop has no horizontal overflow"
  );
  check(
    consoleErrors.length === 0,
    "desktop emits no console errors",
    consoleErrors.join(" | ")
  );
  check(
    failedRequests.length === 0,
    "desktop emits no failed requests",
    failedRequests.join(" | ")
  );

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
  check(
    (await mobileNav.getByRole("button").count()) === 5,
    "mobile exposes five core workflows"
  );
  check(
    await mobile.getByRole("heading", { name: "What do you want done?" }).isVisible(),
    "mobile exposes the owner command"
  );
  await mobileNav.getByRole("button", { name: "Clients" }).click();
  await mobile.getByRole("heading", { name: "Every client, one record." }).waitFor();
  check(
    (await mobile.locator('[aria-label="Client list"] > button').count()) === 21,
    "mobile lists all 21 clients"
  );
  check(
    await mobile.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth
    ),
    "mobile has no horizontal overflow"
  );

  const after = await studioApi();
  check(
    after.data.overlay.persistedChoices === initialChoiceCount,
    "read-only test records no fake training choice"
  );
  check(
    after.data.operatorRequests.length === initialOperatorCount,
    "read-only test queues no fake operator request"
  );
  check(
    after.data.ownerIntents.length === initialIntentCount,
    "read-only test records no fake owner intent"
  );

  console.log(
    JSON.stringify(
      {
        target,
        browser: "Microsoft Edge",
        queueRevision: snapshot.queue.revision,
        clients: snapshot.clients.length,
        workItems: snapshot.workItems.length,
        checksPassed: checks.length,
        checks
      },
      null,
      2
    )
  );
} finally {
  await browser.close();
}
