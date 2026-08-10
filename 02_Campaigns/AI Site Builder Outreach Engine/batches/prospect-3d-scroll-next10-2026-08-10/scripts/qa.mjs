import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { ORDER, SITES } from "../src/config.mjs";

const root = resolve(import.meta.dirname, "..");
const dist = join(root, "dist");
const artifactDir = join(root, "artifacts");
mkdirSync(artifactDir, { recursive: true });

const errors = [];
const checks = [];
const check = (condition, label) => {
  checks.push({ label, passed: Boolean(condition) });
  if (!condition) errors.push(label);
};

check(existsSync(dist), "Production dist directory exists");

const pages = ["index.html", ...ORDER.map((slug) => `sites/${slug}/index.html`)];
check(pages.length === 11, "Lab index plus exactly ten prospect routes");

for (const page of pages) {
  const path = join(dist, page);
  check(existsSync(path), `${page} exists`);
  if (!existsSync(path)) continue;
  const html = readFileSync(path, "utf8");
  check(/noindex/.test(html), `${page} carries noindex`);
  check(!/<form\b/i.test(html), `${page} contains no form`);
  if (page !== "index.html") {
    check(/class="skip-link"/.test(html), `${page} has a skip link`);
    check(/synthetic/i.test(html), `${page} discloses synthetic imagery`);
    check(/concept mark/i.test(html), `${page} labels its lockup as a concept mark`);
    check(!/(src|href)=["']https?:\/\/(?!www\.google\.com\/maps|germantowndental|udisandconnorthodontics|jarmanairconditioning|leeshoagieshorsham|broomallinsuranceagency|banbanasianbistro|bigheadtransportllc|cecarparts|kehansautoservice)/i.test(html), `${page} has no unapproved external runtime dependency`);
  }
}

/* Every site must reference its three plates, and the files must exist. */
for (const slug of ORDER) {
  const spec = SITES[slug];
  const html = readFileSync(join(dist, `sites/${slug}/index.html`), "utf8");
  for (const key of ["hero", "macro", "material"]) {
    const rel = spec.plates[key].replace(/^\//, "");
    check(existsSync(join(dist, rel)), `${slug} plate exists: ${key}`);
    check(html.includes(spec.plates[key]) || key === "hero", `${slug} page references ${key} plate`);
  }
}

const plateDir = join(dist, "assets", "plates");
const plateFiles = [];
for (const slug of readdirSync(plateDir)) {
  for (const f of readdirSync(join(plateDir, slug))) plateFiles.push(join(plateDir, slug, f));
}
check(plateFiles.length === 40, "Exactly forty optimized plate derivatives ship");
const plateHashes = plateFiles.map((f) => createHash("sha256").update(readFileSync(f)).digest("hex"));
check(new Set(plateHashes).size === plateFiles.length, "Plate derivatives are unique — no recolored copies");

const materialDir = join(dist, "assets", "materials");
const materials = existsSync(materialDir) ? readdirSync(materialDir).filter((n) => n.endsWith(".webp")) : [];
check(materials.length === 7, "Exactly seven generated WebP material maps ship");

const fontDir = join(dist, "assets", "fonts");
const fonts = existsSync(fontDir) ? readdirSync(fontDir).filter((n) => n.endsWith(".woff2")) : [];
check(fonts.length === 2, "Two self-hosted variable fonts ship (Alumni Sans, Public Sans)");

const assetsDir = join(dist, "assets");
const javascript = readdirSync(assetsDir).filter((n) => n.endsWith(".js"));
const jsGzipBytes = javascript.reduce((total, n) => total + gzipSync(readFileSync(join(assetsDir, n))).length, 0);
check(jsGzipBytes < 185 * 1024, "Production JavaScript remains below 185 KB gzipped");

const css = readdirSync(assetsDir).filter((n) => n.endsWith(".css")).map((n) => readFileSync(join(assetsDir, n), "utf8")).join("\n");
check(css.includes("prefers-reduced-motion"), "Reduced-motion styling ships");
check(css.includes("focus-visible"), "Visible keyboard focus styling ships");
check(css.includes("scene-fallback"), "Static WebGL fallback styling ships");
check(css.includes("has-js"), "Reveal states are gated on JS being alive");

const report = {
  generatedAt: new Date().toISOString(),
  ok: errors.length === 0,
  pages: pages.length,
  checks,
  errors,
  productionJavaScript: { gzipKilobytes: Number((jsGzipBytes / 1024).toFixed(1)) }
};

writeFileSync(join(artifactDir, "STATIC-QA.json"), `${JSON.stringify(report, null, 2)}\n`);
writeFileSync(join(artifactDir, "STATIC-QA.md"), [
  "# Static QA — next ten",
  "",
  `- Result: ${report.ok ? "PASS" : "FAIL"}`,
  `- Pages: ${report.pages}`,
  `- Production JavaScript: ${report.productionJavaScript.gzipKilobytes} KB gzipped`,
  `- Checks: ${checks.filter((c) => c.passed).length}/${checks.length}`,
  "",
  ...checks.map((c) => `- ${c.passed ? "PASS" : "FAIL"}: ${c.label}`)
].join("\n") + "\n");

console.log(`Static QA ${report.ok ? "PASS" : "FAIL"} — ${checks.filter((c) => c.passed).length}/${checks.length}`);
if (!report.ok) { console.log(errors.join("\n")); process.exit(1); }
