#!/usr/bin/env node
// Buyers-guide style client report builder: merges a per-client JSON data file
// into the print template, writes a self-contained HTML file, and prints a PDF
// through headless Chromium.
//
//   node _os/reporting/build-guide.js _os/reporting/data/<slug>-<period>.json
//
// HTML lands in Daily-Briefs/reports/, PDF in Daily-Briefs/reports/pdf/.
// Set CHROMIUM_BIN to override the browser binary.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const vaultRoot = join(here, "..", "..");

const dataPath = process.argv[2];
if (!dataPath) {
  console.error("Usage: node _os/reporting/build-guide.js <data.json>");
  process.exit(1);
}

const data = JSON.parse(readFileSync(dataPath, "utf8"));
for (const key of ["client", "period", "periodLabel"]) {
  if (!data[key]) {
    console.error(`Data file is missing required field: ${key}`);
    process.exit(1);
  }
}

const font = w => readFileSync(join(here, "fonts", `poppins-latin-${w}.woff2`)).toString("base64");

if (data.logoFile) {
  const logoPath = join(here, "logos", data.logoFile);
  if (existsSync(logoPath)) {
    const ext = data.logoFile.split(".").pop().toLowerCase();
    const mime = ext === "png" ? "image/png" : ext === "svg" ? "image/svg+xml" : "image/jpeg";
    data.logo = `data:${mime};base64,${readFileSync(logoPath).toString("base64")}`;
  } else {
    console.warn(`Logo file not found, using wordmark: ${logoPath}`);
  }
}

const template = readFileSync(join(here, "guide-template.html"), "utf8");
const html = template
  .replace("__TITLE__", `${data.client} — ${data.periodLabel} Performance Report`)
  .replace("__FONT400__", font(400))
  .replace("__FONT600__", font(600))
  .replace("__FONT700__", font(700))
  .replace("__DATA__", JSON.stringify(data).replace(/</g, "\\u003c"));

const slug = data.client.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const outDir = join(vaultRoot, "Daily-Briefs", "reports");
const pdfDir = join(outDir, "pdf");
mkdirSync(pdfDir, { recursive: true });
const htmlPath = join(outDir, `${slug}-${data.period}-guide.html`);
writeFileSync(htmlPath, html);
console.log(`HTML written: ${htmlPath}`);

const chromium = process.env.CHROMIUM_BIN ||
  ["/opt/pw-browsers/chromium", "/usr/bin/chromium", "/usr/bin/chromium-browser", "/usr/bin/google-chrome"]
    .find(existsSync);
if (!chromium) {
  console.error("No Chromium binary found. Set CHROMIUM_BIN to print the PDF.");
  process.exit(2);
}

const pdfPath = join(pdfDir, `${slug}-${data.period}.pdf`);
execFileSync(chromium, [
  "--headless",
  "--no-sandbox",
  "--disable-gpu",
  "--force-color-profile=srgb",
  "--virtual-time-budget=8000",
  "--no-pdf-header-footer",
  `--print-to-pdf=${pdfPath}`,
  `file://${resolve(htmlPath)}`,
], { stdio: "pipe" });
console.log(`PDF written: ${pdfPath}`);
if (data.sampleData) console.log("Note: sampleData flag is set, so the report carries a draft ribbon.");
