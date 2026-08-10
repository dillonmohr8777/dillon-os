import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { chromium } from "playwright";
import { ORDER, SITES } from "../src/config.mjs";

/*
  Browser QA across all eleven routes. Desktop and mobile run the full scroll
  journey per site; reduced-motion and forced-fallback run as fast checks per
  site. Expected scene states come from each site's own spec.
*/

const root = resolve(import.meta.dirname, "..");
const baseUrl = (process.argv[2] || "http://127.0.0.1:4178").replace(/\/$/, "");
const round = process.argv[3] || "round-1";
const output = join(root, "artifacts", "browser", round);
mkdirSync(output, { recursive: true });

const launch = () => chromium.launch({
  headless: true,
  ...(process.env.CHROME_BIN ? { executablePath: process.env.CHROME_BIN } : {}),
  args: ["--enable-unsafe-swiftshader", "--use-gl=swiftshader"]
});

const results = [];
const reportPath = join(root, "artifacts", `BROWSER-QA-${round}.json`);
const writeProgress = (complete = false) => writeFileSync(reportPath, `${JSON.stringify({
  generatedAt: new Date().toISOString(), baseUrl, round, complete,
  ok: complete ? results.every((r) => r.passed) : undefined, results
}, null, 2)}\n`);

const viewports = [["desktop", { width: 1440, height: 1000 }], ["mobile", { width: 390, height: 844 }]];

/* Lab index first. */
for (const [viewportName, viewport] of viewports) {
  const browser = await launch();
  const page = await (await browser.newContext({ viewport })).newPage();
  const consoleErrors = [];
  page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text()); });
  page.on("pageerror", (e) => consoleErrors.push("PAGEERROR " + e.message));
  const response = await page.goto(`${baseUrl}/`, { waitUntil: "networkidle", timeout: 45000 });
  await page.waitForTimeout(900);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  await page.screenshot({ path: join(output, `lab-${viewportName}.png`) });
  results.push({ name: "lab", viewport: viewportName, status: response?.status() ?? 0, overflow, consoleErrors, passed: response?.ok() === true && overflow <= 1 && consoleErrors.length === 0 });
  await browser.close();
  writeProgress();
}

for (const slug of ORDER) {
  const spec = SITES[slug];
  for (const [viewportName, viewport] of viewports) {
    const browser = await launch();
    const page = await (await browser.newContext({ viewport })).newPage();
    const consoleErrors = [];
    page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text()); });
    page.on("pageerror", (e) => consoleErrors.push("PAGEERROR " + e.message));
    const response = await page.goto(`${baseUrl}/sites/${slug}/`, { waitUntil: "networkidle", timeout: 45000 });
    await page.waitForTimeout(1600);
    const metrics = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth - innerWidth,
      h1: document.querySelector("h1")?.textContent?.trim() || "",
      webgl: document.body.classList.contains("webgl-ready"),
      fallback: document.body.classList.contains("webgl-fallback"),
      brokenImages: [...document.images].filter((i) => !i.complete || i.naturalWidth === 0).length
    }));
    await page.screenshot({ path: join(output, `${slug}-${viewportName}-hero.png`) });
    await page.evaluate(() => window.scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * 0.55));
    await page.waitForTimeout(5200);
    const midState = await page.evaluate(() => document.querySelector("#scene-state")?.textContent?.trim());
    await page.screenshot({ path: join(output, `${slug}-${viewportName}-mid.png`) });
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(5200);
    const finalState = await page.evaluate(() => document.querySelector("#scene-state")?.textContent?.trim());
    await page.screenshot({ path: join(output, `${slug}-${viewportName}-final.png`) });
    await page.keyboard.press("Home");
    await page.waitForTimeout(150);
    await page.keyboard.press("Tab");
    const focused = await page.evaluate(() => document.activeElement?.className || "");
    results.push({
      name: slug, viewport: viewportName, status: response?.status() ?? 0,
      ...metrics, midState, finalState, focused, consoleErrors,
      passed: response?.ok() === true && metrics.overflow <= 1 && metrics.brokenImages === 0
        && consoleErrors.length === 0 && Boolean(metrics.h1)
        && (metrics.webgl || metrics.fallback)
        && midState !== spec.states[0]
        && finalState === spec.states[3]
    });
    await browser.close();
    writeProgress();
  }
}

/* Reduced motion: parks on the final beat, hides the rail, page fully composed. */
for (const slug of ORDER) {
  const browser = await launch();
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto(`${baseUrl}/sites/${slug}/`, { waitUntil: "networkidle", timeout: 45000 });
  await page.waitForTimeout(1400);
  const reduced = await page.evaluate(() => ({
    reducedClass: document.body.classList.contains("webgl-reduced"),
    progressRail: getComputedStyle(document.querySelector(".progress-rail")).display,
    sceneProgress: document.body.dataset.sceneProgress || "",
    hiddenReveals: [...document.querySelectorAll("[data-reveal]")].filter((el) => getComputedStyle(el).opacity === "0").length
  }));
  results.push({ name: slug, viewport: "mobile-reduced-motion", ...reduced, passed: reduced.reducedClass && reduced.progressRail === "none" && reduced.sceneProgress === "1.00" && reduced.hiddenReveals === 0 });
  await browser.close();
  writeProgress();
}

/* Forced WebGL fallback: the static plate composes the page. */
for (const slug of ORDER) {
  const browser = await launch();
  const page = await (await browser.newContext({ viewport: { width: 390, height: 844 } })).newPage();
  const response = await page.goto(`${baseUrl}/sites/${slug}/?forceWebglFallback=1`, { waitUntil: "networkidle", timeout: 45000 });
  await page.waitForTimeout(900);
  const fallback = await page.evaluate(() => ({
    fallbackClass: document.body.classList.contains("webgl-fallback"),
    fallbackOpacity: Number.parseFloat(getComputedStyle(document.querySelector(".scene-fallback")).opacity),
    canvasOpacity: Number.parseFloat(getComputedStyle(document.querySelector("#scene-canvas")).opacity),
    visibleActions: [...document.querySelectorAll(".primary-action, .secondary-action")].filter((a) => {
      const r = a.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    }).length
  }));
  results.push({ name: slug, viewport: "mobile-webgl-fallback", status: response?.status() ?? 0, ...fallback, passed: response?.ok() === true && fallback.fallbackClass && fallback.fallbackOpacity >= 0.99 && fallback.canvasOpacity === 0 && fallback.visibleActions >= 2 });
  await browser.close();
  writeProgress();
}

writeProgress(true);
const ok = results.every((r) => r.passed);
console.log(`Browser QA ${ok ? "PASS" : "FAIL"} — ${results.filter((r) => r.passed).length}/${results.length}`);
if (!ok) {
  for (const r of results.filter((x) => !x.passed)) console.log("FAIL", r.name, r.viewport, JSON.stringify(r).slice(0, 300));
  process.exit(1);
}
