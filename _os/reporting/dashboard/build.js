#!/usr/bin/env node
// Builds the Momentum 360 client reporting dashboard into a single, fully
// self-contained HTML file you can drop straight onto Netlify (or any static
// host). Inlines the client data (clients.json) and every logo as a data URI,
// so there are no external asset requests.
//
//   node _os/reporting/dashboard/build.js
//   → _os/reporting/dashboard/dist/index.html
//
// To edit the report: change clients.json (numbers, review contact email,
// documents, wins, etc.), drop new logos in assets/, then rebuild.

const { readFileSync, writeFileSync, mkdirSync, existsSync } = require("node:fs");
const { join } = require("node:path");

const here = __dirname;
const clients = JSON.parse(readFileSync(join(here, "clients.json"), "utf8"));
const template = readFileSync(join(here, "app.template.html"), "utf8");

function dataUri(file) {
  const path = join(here, "assets", file);
  if (!existsSync(path)) return "";
  const b64 = readFileSync(path).toString("base64");
  return `data:image/png;base64,${b64}`;
}

// Collect the logo files referenced by the data, plus the brand mark.
const logos = {};
for (const slug of Object.keys(clients)) {
  const f = clients[slug].logoFile;
  if (f && !logos[f]) logos[f] = dataUri(f);
}
const brandLogo = dataUri("momentum-mark.png");

const payload = { clients, logos, brandLogo };
const html = template.replace("__DATA__", JSON.stringify(payload).replace(/</g, "\\u003c"));

const outDir = join(here, "dist");
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "index.html");
writeFileSync(outPath, html);

const kb = Math.round(Buffer.byteLength(html) / 1024);
console.log(`Dashboard built: ${outPath} (${kb} KB, ${Object.keys(clients).length} clients, self-contained)`);
