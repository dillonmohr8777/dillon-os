import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const appUrl = new URL("../app/StudioApp.tsx", import.meta.url);
const autonomyUrl = new URL("../app/AutonomyLoopView.tsx", import.meta.url);
const catalogUrl = new URL("../app/autonomy-catalog.ts", import.meta.url);
const sanitizerUrl = new URL("../app/snapshot-sanitizer.ts", import.meta.url);
const storeUrl = new URL("../app/studio-store.ts", import.meta.url);
const machineRouteUrl = new URL("../app/api/machine/route.ts", import.meta.url);
const schemaUrl = new URL("../db/schema.ts", import.meta.url);
const choiceMigrationUrl = new URL("../drizzle/0004_lean_greymalkin.sql", import.meta.url);
const portfolioMigrationUrl = new URL("../drizzle/0005_cute_alex_power.sql", import.meta.url);
const layoutUrl = new URL("../app/layout.tsx", import.meta.url);
const seedUrl = new URL("../data/seed-snapshot.json", import.meta.url);

test("ships the private Marketing Chief operator surface", async () => {
  const [app, autonomy, layout, seedText] = await Promise.all([
    readFile(appUrl, "utf8"),
    readFile(autonomyUrl, "utf8"),
    readFile(layoutUrl, "utf8"),
    readFile(seedUrl, "utf8")
  ]);
  const seed = JSON.parse(seedText);
  assert.match(layout, /Marketing Chief Operator Studio/);
  assert.match(app, /The Chief is already working/);
  assert.match(autonomy, /The Chief is running\./);
  assert.match(app, /owner-only/i);
  assert.equal(seed.schemaVersion, 2);
  assert.ok(Number.isSafeInteger(seed.queue.revision) && seed.queue.revision > 0);
  assert.equal(seed.portfolio.totalClients, 21);
  assert.equal(seed.portfolio.fullyIntegratedClients, 21);
  assert.equal(seed.workItems.length, 36);
  assert.deepEqual(seed.clients.slice(0, 3).map((client) => client.name), ["Bridge Software", "VA Claims Edge", "Momentum 360"]);
  assert.equal(seed.training.sourceObservations.gmailBaseMessages, 2555);
  assert.equal(seed.training.sourceObservations.slackMessagesReviewed, 1232);
  assert.equal(seed.health.warningCount, 0);
  assert.equal(seed.health.revisionDrift, 0);
});

test("contains interactive command, navigation, evidence, and training controls", async () => {
  const [app, autonomy, catalog] = await Promise.all([
    readFile(appUrl, "utf8"),
    readFile(autonomyUrl, "utf8"),
    readFile(catalogUrl, "utf8")
  ]);
  for (const label of ["Today", "Watchtower", "Work", "Clients", "Queue", "Approvals", "Runs", "Health"]) assert.match(app, new RegExp(label));
  for (const proof of ["Execution evidence", "independent verification", "canonical Windows writer"]) assert.match(app, new RegExp(proof, "i"));
  assert.match(autonomy, /Safe work moves\. Outside-world actions stop here/);
  assert.match(autonomy, /The interface does not invent sensor content/);
  assert.match(app, /Train this choice/);
  assert.match(app, /Queue local run/);
  assert.match(app, /Hosted requests waiting on Windows/);
  assert.match(autonomy, /Seven checks\. One current state\./);
  assert.match(autonomy, /About two minutes/);
  assert.match(autonomy, /Prediction, judgment, reality, adjustment/);
  assert.match(autonomy, /Twenty skills, one measurable protocol/);
  assert.match(autonomy, /Required: 0/);
  assert.doesNotMatch(autonomy, /Boundary incidents<\/span><strong>0</);
  assert.equal((catalog.match(/rank: \d+/g) ?? []).length, 25);
  assert.equal((catalog.match(/\{ id: "[^"]+", name: "[^"]+", scope: "(?:project|global)"/g) ?? []).length, 20);
  assert.match(app, /What do you want done/);
  assert.match(app, /capture-intent/);
  assert.match(app, /All active clients/);
  assert.match(app, /Send to all/);
  assert.match(app, /Portfolio run/);
  assert.match(app, /Find any client or work item/);
  assert.match(app, /fetch\("\/api\/studio"/);
  assert.match(app, /Marketing Chief remains the only canonical Windows writer/i);
});

test("fans one portfolio command into isolated client-routed tasks", async () => {
  const [app, store, schema, migration] = await Promise.all([
    readFile(appUrl, "utf8"),
    readFile(storeUrl, "utf8"),
    readFile(schemaUrl, "utf8"),
    readFile(portfolioMigrationUrl, "utf8")
  ]);
  assert.match(store, /PORTFOLIO_CLIENT_ID = "portfolio:active"/);
  assert.match(store, /snapshot\.clients\.filter\(\(candidate\) => candidate\.status === "active"\)/);
  assert.match(store, /stableDigest\(\{ batchId: id, clientId: client\.id \}\)/);
  assert.match(store, /batchSize: isPortfolio \? targetClients\.length : null/);
  assert.match(store, /targetClients\.length > 100/);
  assert.match(store, /missingBindings\.slice\(index, index \+ 5\)/);
  assert.match(app, /Each task keeps its own route, evidence, queue record, and approval gate/);
  assert.match(app, /Exact client routes/);
  assert.match(schema, /batchId: text\("batch_id"\)/);
  assert.match(migration, /ALTER TABLE `owner_intents` ADD `batch_id`/);
  assert.match(migration, /ALTER TABLE `owner_intents` ADD `batch_index` integer/);
  assert.match(migration, /ALTER TABLE `owner_intents` ADD `batch_size` integer/);
});

test("fails closed on private telemetry and counts only unreconciled hosted choices", async () => {
  const [sanitizer, store, machineRoute, schema, migration] = await Promise.all([
    readFile(sanitizerUrl, "utf8"),
    readFile(storeUrl, "utf8"),
    readFile(machineRouteUrl, "utf8"),
    readFile(schemaUrl, "utf8"),
    readFile(choiceMigrationUrl, "utf8")
  ]);
  for (const forbiddenField of ["sourcelocator", "lastsummary", "rawmessage", "workeroutput"]) {
    assert.match(sanitizer, new RegExp(`"${forbiddenField}"`));
  }
  assert.match(sanitizer, /sanitizeSnapshotForPersistence/);
  assert.match(store, /eq\(hostedChoices\.state, "pending"\)/);
  assert.match(store, /resolveHostedChoice/);
  assert.match(machineRoute, /action === "resolve-choice"/);
  assert.match(schema, /text\("state"\)\.notNull\(\)\.default\("pending"\)/);
  assert.match(migration, /ALTER TABLE `hosted_choices` ADD `state`/);
});
