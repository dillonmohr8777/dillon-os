import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const dist = join(root, "dist");
const artifactDir = join(root, "artifacts");
mkdirSync(artifactDir, { recursive: true });

const pages = [
  "index.html",
  "sites/maclaren-kitchen-bath/index.html",
  "sites/golden-eagle-jewelry/index.html",
  "sites/morton-electric-pool-spa/index.html"
];
const errors = [];
const checks = [];
const check = (condition, label) => {
  checks.push({ label, passed: Boolean(condition) });
  if (!condition) errors.push(label);
};

check(existsSync(dist), "Production dist directory exists");
for (const page of pages) {
  const path = join(dist, page);
  check(existsSync(path), `${page} exists`);
  if (!existsSync(path)) continue;
  const html = readFileSync(path, "utf8");
  check(/noindex/.test(html), `${page} carries noindex`);
  check(/class="skip-link"/.test(html), `${page} has a skip link`);
  check(/FINISH: unreviewed and undocumented is unfinished/.test(html), `${page} preserves its direction contract`);
  check(!/<form\b/i.test(html), `${page} contains no form`);
  check(!/(src|href)=["']https?:\/\/(?!maclarenfab|goldeneaglejewelry|golden-eagle-jewelry|www\.facebook|www\.google|mortonelectric|www\.guildquality)/i.test(html), `${page} has no unapproved external runtime dependency`);
}

const materialDir = join(dist, "assets", "materials");
const materials = existsSync(materialDir) ? readdirSync(materialDir).filter((name) => name.endsWith(".webp")) : [];
check(materials.length === 7, "Exactly seven generated WebP material assets ship");
const materialHashes = materials.map((name) => createHash("sha256").update(readFileSync(join(materialDir, name))).digest("hex"));
check(new Set(materialHashes).size === materials.length, "Generated material assets have unique SHA-256 hashes");

const editorialRoot = join(dist, "assets", "editorial");
const editorialSites = ["maclaren", "golden", "morton"];
const editorialFrames = editorialSites.flatMap((site) => {
  const directory = join(editorialRoot, site);
  return existsSync(directory)
    ? readdirSync(directory).filter((name) => name.endsWith(".webp")).map((name) => ({ site, name, path: join(directory, name) }))
    : [];
});
check(editorialFrames.length === 18, "Exactly eighteen generated editorial WebP frames ship");
check(editorialSites.every((site) => editorialFrames.filter((frame) => frame.site === site).length === 6), "Each prospect ships six distributed editorial frames");
const editorialHashes = editorialFrames.map((frame) => createHash("sha256").update(readFileSync(frame.path)).digest("hex"));
check(new Set(editorialHashes).size === editorialFrames.length, "Editorial frames have unique SHA-256 hashes across all prospects");

const assetsDir = join(dist, "assets");
const javascript = existsSync(assetsDir) ? readdirSync(assetsDir).filter((name) => name.endsWith(".js")) : [];
const jsBytes = javascript.reduce((total, name) => total + statSync(join(assetsDir, name)).size, 0);
const jsGzipBytes = javascript.reduce((total, name) => total + gzipSync(readFileSync(join(assetsDir, name))).length, 0);
check(jsGzipBytes < 180 * 1024, "Production JavaScript remains below 180 KB gzipped");

const css = existsSync(assetsDir) ? readdirSync(assetsDir).filter((name) => name.endsWith(".css")).map((name) => readFileSync(join(assetsDir, name), "utf8")).join("\n") : "";
check(css.includes("prefers-reduced-motion"), "Reduced-motion styling ships");
check(css.includes("focus-visible"), "Visible keyboard focus styling ships");
check(css.includes("scene-fallback"), "Static WebGL fallback styling ships");

const report = {
  generatedAt: new Date().toISOString(),
  ok: errors.length === 0,
  pages: pages.length,
  checks,
  errors,
  materials: materials.map((name, index) => ({ name, bytes: statSync(join(materialDir, name)).size, sha256: materialHashes[index] })),
  editorialFrames: editorialFrames.map((frame, index) => ({ site: frame.site, name: frame.name, bytes: statSync(frame.path).size, sha256: editorialHashes[index] })),
  productionJavaScript: {
    files: javascript.map((name) => relative(root, join(assetsDir, name)).replaceAll("\\", "/")),
    bytes: jsBytes,
    gzipBytes: jsGzipBytes,
    gzipKilobytes: Number((jsGzipBytes / 1024).toFixed(1))
  }
};

writeFileSync(join(artifactDir, "STATIC-QA.json"), `${JSON.stringify(report, null, 2)}\n`);
writeFileSync(join(artifactDir, "STATIC-QA.md"), [
  "# Static QA",
  "",
  `- Result: ${report.ok ? "PASS" : "FAIL"}`,
  `- Pages: ${report.pages}`,
  `- Generated material WebPs: ${materials.length}`,
  `- Generated editorial WebPs: ${editorialFrames.length}`,
  `- Production JavaScript: ${report.productionJavaScript.gzipKilobytes} KB gzipped`,
  `- Checks: ${checks.filter((item) => item.passed).length}/${checks.length}`,
  "",
  ...checks.map((item) => `- ${item.passed ? "PASS" : "FAIL"}: ${item.label}`)
].join("\n") + "\n");

console.log(JSON.stringify(report, null, 2));
if (!report.ok) process.exit(1);
