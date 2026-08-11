// One-shot: record the fixture-smoke rehearsal deploy as live_verified.
import { openDb } from "../core/db.mjs";
const db = openDb();
db.prepare(
  `INSERT INTO deploys (run_id, site_name, site_id, deploy_id, state, url, verified_at, created_at)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
).run("fixture-smoke", "gleeful-alpaca-ebc328", "3ba3c14e-5a9a-4977-8b52-77b4c3daf6f4",
  "6a7a8a4d02f9633430108859", "live_verified", "https://gleeful-alpaca-ebc328.netlify.app",
  Date.now(), Date.now());
console.log("deploy recorded: live_verified");
db.close();
