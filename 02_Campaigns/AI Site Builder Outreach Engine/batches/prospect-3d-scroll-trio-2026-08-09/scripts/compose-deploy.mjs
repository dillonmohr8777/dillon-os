import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const baseRoot = resolve(process.argv[2] || process.env.PROSPECT_RADAR_BASE || "");
const distRoot = join(root, "dist");
const outputRoot = resolve(process.argv[3] || process.env.PROSPECT_RADAR_DEPLOY_OUTPUT || join(root, "deploy-site"));

if (!process.argv[2] && !process.env.PROSPECT_RADAR_BASE) {
  throw new Error("Pass the verified 30-route base directory as the first argument or PROSPECT_RADAR_BASE.");
}
if (!existsSync(join(baseRoot, "index.html"))) throw new Error(`Base site is invalid: ${baseRoot}`);
if (!existsSync(join(distRoot, "index.html"))) throw new Error("Run npm run build before composing the deployment.");
if (outputRoot === baseRoot || outputRoot === distRoot || outputRoot.length < 20) throw new Error(`Unsafe deployment output: ${outputRoot}`);

rmSync(outputRoot, { recursive: true, force: true });
cpSync(baseRoot, outputRoot, { recursive: true });

const overlays = [
  [join(distRoot, "assets"), join(outputRoot, "assets")],
  [join(distRoot, "sites", "maclaren-kitchen-bath"), join(outputRoot, "sites", "maclaren-kitchen-bath")],
  [join(distRoot, "sites", "golden-eagle-jewelry"), join(outputRoot, "sites", "golden-eagle-jewelry")],
  [join(distRoot, "sites", "morton-electric-pool-spa"), join(outputRoot, "sites", "morton-electric-pool-spa")]
];

for (const [source, destination] of overlays) {
  rmSync(destination, { recursive: true, force: true });
  mkdirSync(dirname(destination), { recursive: true });
  cpSync(source, destination, { recursive: true });
}

const labRoot = join(outputRoot, "labs", "prospect-3d-scroll-trio");
mkdirSync(labRoot, { recursive: true });
cpSync(join(distRoot, "index.html"), join(labRoot, "index.html"));
cpSync(join(distRoot, "_headers"), join(outputRoot, "_headers"));
cpSync(join(distRoot, "robots.txt"), join(outputRoot, "robots.txt"));

const hubPath = join(outputRoot, "index.html");
let hub = readFileSync(hubPath, "utf8");
const builds = [
  ["maclaren-kitchen-bath", 166],
  ["golden-eagle-jewelry", 167],
  ["morton-electric-pool-spa", 168]
];

for (const [slug, build] of builds) {
  const routePattern = new RegExp(`(<a class='card'[^>]*href='[^']*/sites/${slug}/'[^>]*>[\\s\\S]*?<span class="spec">)[^<]*(</span>[\\s\\S]*?</a>)`);
  hub = hub.replace(routePattern, `$1Build ${build} · Scroll-driven 3D · mail hold$2`);
}

const banner = `<a class="scroll-lab-banner" href="/labs/prospect-3d-scroll-trio/"><strong>New: builds 166–168</strong><span>Open the Three.js Scroll Lab</span></a>`;
hub = hub.replace("<main class=\"wrap\">", `<main class="wrap">${banner}`);
hub = hub.replace("</style>", `.scroll-lab-banner{display:flex;align-items:center;justify-content:space-between;gap:20px;margin:0 0 24px;padding:18px 22px;color:#fff;background:#10100f;text-decoration:none;border-radius:14px}.scroll-lab-banner strong{font-size:16px}.scroll-lab-banner span{color:#ffca77;font-weight:800}@media(max-width:640px){.scroll-lab-banner{align-items:flex-start;flex-direction:column}}\n</style>`);
hub = hub.replace("</body>", "<!-- Scroll Lab overlay: baseline 165; builds 166-168 -->\n</body>");
writeFileSync(hubPath, hub);

const routeCount = readdirSync(join(outputRoot, "sites"), { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && existsSync(join(outputRoot, "sites", entry.name, "index.html"))).length;
if (routeCount !== 30) throw new Error(`Expected to preserve 30 prospect routes, found ${routeCount}.`);
for (const [slug, build] of builds) {
  const routeHtml = readFileSync(join(outputRoot, "sites", slug, "index.html"), "utf8");
  if (!routeHtml.includes("/assets/site-") || !routeHtml.includes(`Build ${build}`)) {
    throw new Error(`Overlay verification failed for ${slug}.`);
  }
  if (!hub.includes(`Build ${build} · Scroll-driven 3D · mail hold`)) {
    throw new Error(`Hub badge verification failed for build ${build}.`);
  }
}

const receipt = {
  composedAt: new Date().toISOString(),
  baseRoot,
  baseRoutesPreserved: routeCount,
  overlayRoutes: builds.map(([slug, build]) => ({ slug, build })),
  labRoute: "/labs/prospect-3d-scroll-trio/",
  outputRoot
};
writeFileSync(join(root, "artifacts", "COMPOSE-RECEIPT.json"), `${JSON.stringify(receipt, null, 2)}\n`);
console.log(JSON.stringify(receipt, null, 2));
