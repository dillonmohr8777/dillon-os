import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const baseUrl = (process.argv[2] || "").replace(/\/$/, "");
const round = process.argv[3] || "preview";
if (!/^https:\/\//.test(baseUrl)) throw new Error("Pass the HTTPS deploy URL as the first argument.");

const receiptPath = join(root, "artifacts", "COMPOSE-RECEIPT.json");
if (!existsSync(receiptPath)) throw new Error("Compose the 30-route deployment before verifying it.");
const receipt = JSON.parse(readFileSync(receiptPath, "utf8"));
const siteRoot = receipt.outputRoot;
const slugs = readdirSync(join(siteRoot, "sites"), { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && existsSync(join(siteRoot, "sites", entry.name, "index.html")))
  .map((entry) => entry.name)
  .sort();

const paths = ["/", "/labs/prospect-3d-scroll-trio/", ...slugs.map((slug) => `/sites/${slug}/`)];
const routes = await Promise.all(paths.map(async (path) => {
  const response = await fetch(`${baseUrl}${path}`, { redirect: "follow" });
  const html = await response.text();
  const title = html.match(/<title>([^<]+)<\/title>/i)?.[1] || "";
  const assets = [...html.matchAll(/(?:src|href)=["'](\/assets\/[^"']+)["']/gi)].map((match) => match[1]);
  return {
    path,
    status: response.status,
    title,
    noindex: (response.headers.get("x-robots-tag") || "").toLowerCase().includes("noindex"),
    build166: html.includes("Build 166"),
    build167: html.includes("Build 167"),
    build168: html.includes("Build 168"),
    assets
  };
}));

const assetPaths = [...new Set(routes.flatMap((route) => route.assets))].sort();
const assets = await Promise.all(assetPaths.map(async (path) => {
  const response = await fetch(`${baseUrl}${path}`);
  return { path, status: response.status, bytes: Number(response.headers.get("content-length") || 0) };
}));

const overlays = {
  lab: routes.find((route) => route.path === "/labs/prospect-3d-scroll-trio/"),
  maclaren: routes.find((route) => route.path === "/sites/maclaren-kitchen-bath/"),
  golden: routes.find((route) => route.path === "/sites/golden-eagle-jewelry/"),
  morton: routes.find((route) => route.path === "/sites/morton-electric-pool-spa/")
};

const checks = [
  { label: "Exactly 30 prospect routes are present", passed: slugs.length === 30 },
  { label: "Root, lab, and all 30 prospect routes return HTTP 200", passed: routes.length === 32 && routes.every((route) => route.status === 200) },
  { label: "Every route ships a noindex response header", passed: routes.every((route) => route.noindex) },
  { label: "Every referenced production asset returns HTTP 200", passed: assets.length > 0 && assets.every((asset) => asset.status === 200) },
  { label: "Scroll Lab title is live", passed: overlays.lab?.title === "Prospect Radar — Three.js Scroll Lab" },
  { label: "Build 166 overlay is live", passed: overlays.maclaren?.build166 === true && overlays.maclaren.title.includes("MacLaren") },
  { label: "Build 167 overlay is live", passed: overlays.golden?.build167 === true && overlays.golden.title.includes("Golden Eagle") },
  { label: "Build 168 overlay is live", passed: overlays.morton?.build168 === true && overlays.morton.title.includes("Morton Electric") }
];

const report = {
  generatedAt: new Date().toISOString(),
  baseUrl,
  round,
  ok: checks.every((check) => check.passed),
  checks,
  routeCount: routes.length,
  prospectRouteCount: slugs.length,
  routes,
  assets
};
const reportPath = join(root, "artifacts", `DEPLOY-QA-${round}.json`);
writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ ...report, routes: undefined, assets: undefined }, null, 2));
if (!report.ok) process.exit(1);
