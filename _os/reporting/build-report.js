#!/usr/bin/env node
// Client report builder: merges a per-client JSON data file into the report
// template and writes a self-contained HTML deliverable.
//
//   node _os/reporting/build-report.js _os/reporting/data/bar-crawl-usa-2026-06.json
//
// Output lands in Daily-Briefs/reports/<slug>-<period>.html and opens in any
// browser, attaches to any email, or publishes to any static host as-is.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const vaultRoot = join(here, "..", "..");

const dataPath = process.argv[2];
if (!dataPath) {
  console.error("Usage: node _os/reporting/build-report.js <data.json>");
  process.exit(1);
}

const data = JSON.parse(readFileSync(dataPath, "utf8"));
for (const key of ["client", "period", "periodLabel"]) {
  if (!data[key]) {
    console.error(`Data file is missing required field: ${key}`);
    process.exit(1);
  }
}

const template = readFileSync(join(here, "report-template.html"), "utf8");
const html = template
  .replace("__TITLE__", `${data.client} — ${data.periodLabel}`)
  .replace("__DATA__", JSON.stringify(data).replace(/</g, "\\u003c"));

const slug = data.client.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const outDir = join(vaultRoot, "Daily-Briefs", "reports");
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, `${slug}-${data.period}.html`);
writeFileSync(outPath, html);
console.log(`Report written: ${outPath}`);
if (data.sampleData) console.log("Note: sampleData flag is set, so the report renders a draft banner.");
