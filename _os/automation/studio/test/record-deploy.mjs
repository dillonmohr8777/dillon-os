// One-shot: record the PR-270 next10 batch deploy as live_verified.
import { openDb } from "../core/db.mjs";
const db = openDb();
db.prepare(
  `INSERT INTO deploys (run_id, site_name, site_id, deploy_id, prior_deploy_id, state, url, verified_at, created_at)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
).run("pr270-next10", "gleeful-alpaca-ebc328", "3ba3c14e-5a9a-4977-8b52-77b4c3daf6f4",
  "6a7a94f041e4418097166af2", "6a7a8a4d02f9633430108859", "live_verified",
  "https://gleeful-alpaca-ebc328.netlify.app", Date.now(), Date.now());
console.log("deploy recorded: pr270-next10 live_verified (prior: fixture deploy)");
db.close();
