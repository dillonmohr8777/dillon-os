// Remove every trace of the fixture smoke run so it can be reseeded cleanly.
import { openDb } from "../core/db.mjs";

const db = openDb();
const RUN = "fixture-smoke";
const SLUG = "fixture-germantown";
const del = (sql, ...args) => db.prepare(sql).run(...args).changes;

let n = 0;
n += del(`DELETE FROM stage_executions WHERE run_id = ?`, RUN);
n += del(`DELETE FROM prospects WHERE run_id = ?`, RUN);
n += del(`DELETE FROM budgets WHERE run_id = ?`, RUN);
n += del(`DELETE FROM scores WHERE run_id = ?`, RUN);
n += del(`DELETE FROM design_signatures WHERE run_id = ?`, RUN);
n += del(`DELETE FROM approvals WHERE run_id = ?`, RUN);
n += del(`DELETE FROM runs WHERE run_id = ?`, RUN);
n += del(`DELETE FROM evidence WHERE prospect_id = ?`, SLUG);
n += del(`DELETE FROM logos WHERE prospect_id = ?`, SLUG);
n += del(`DELETE FROM images WHERE prospect_id = ?`, SLUG);
n += del(`DELETE FROM fonts WHERE site_slug = ?`, SLUG);
n += del(`DELETE FROM built_sites WHERE prospect_id = ?`, SLUG);
console.log(`cleared ${n} fixture rows`);
db.close();
