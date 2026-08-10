import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { chromium } from "playwright";

const root = resolve(import.meta.dirname, "..");
const baseUrl = (process.argv[2] || "http://127.0.0.1:4177").replace(/\/$/, "");
const round = process.argv[3] || "round-1";
const routeFilter = process.argv[4] || "";
const labRoute = process.argv[5] || "/";
const output = join(root, "artifacts", "browser", round);
mkdirSync(output, { recursive: true });

const routes = [
  ["lab", labRoute],
  ["maclaren", "/sites/maclaren-kitchen-bath/"],
  ["golden", "/sites/golden-eagle-jewelry/"],
  ["morton", "/sites/morton-electric-pool-spa/"]
];
const selectedRoutes = routeFilter && routeFilter !== "all" ? routes.filter(([name]) => name === routeFilter) : routes;
if (selectedRoutes.length === 0) throw new Error(`Unknown route filter: ${routeFilter}`);
const viewports = [
  ["desktop", { width: 1440, height: 1000 }],
  ["mobile", { width: 390, height: 844 }]
];
const results = [];
const reportPath = join(root, "artifacts", `BROWSER-QA-${round}.json`);
const writeProgress = () => writeFileSync(reportPath, `${JSON.stringify({
  generatedAt: new Date().toISOString(), baseUrl, round, complete: false, results
}, null, 2)}\n`);

for (const [viewportName, viewport] of viewports) {
  for (const [name, route] of selectedRoutes) {
    const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_BIN ? { executablePath: process.env.CHROME_BIN } : {}) });
    const context = await browser.newContext({ viewport, reducedMotion: "no-preference" });
    const page = await context.newPage();
    const consoleErrors = [];
    const pageErrors = [];
    page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
    page.on("pageerror", (error) => pageErrors.push(error.message));
    const response = await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(900);
    const metrics = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth - window.innerWidth,
      title: document.title,
      h1: document.querySelector("h1")?.textContent?.trim() || "",
      webgl: document.body.classList.contains("webgl-ready"),
      fallback: document.body.classList.contains("webgl-fallback"),
      brokenImages: [...document.images].filter((image) => !image.complete || image.naturalWidth === 0).length
    }));
    const screenshot = join(output, `${name}-${viewportName}.png`);
    const heroScreenshot = join(output, `${name}-${viewportName}-hero.png`);
    await page.screenshot({ path: heroScreenshot, fullPage: false });
    await page.screenshot({ path: screenshot, fullPage: true });
    await page.evaluate(() => window.scrollTo(0, (document.documentElement.scrollHeight - window.innerHeight) * 0.56));
    await page.waitForTimeout(500);
    const midScreenshot = join(output, `${name}-${viewportName}-mid.png`);
    await page.screenshot({ path: midScreenshot, fullPage: false });
    const midState = await page.evaluate(() => document.querySelector("#scene-state")?.textContent?.trim() || "not-applicable");
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight - window.innerHeight));
    await page.waitForTimeout(600);
    const finalScreenshot = join(output, `${name}-${viewportName}-final.png`);
    await page.screenshot({ path: finalScreenshot, fullPage: false });
    const finalState = await page.evaluate(() => document.querySelector("#scene-state")?.textContent?.trim() || "not-applicable");
    let finalSceneScreenshot = "";
    if (name !== "lab") {
      finalSceneScreenshot = join(output, `${name}-${viewportName}-scene-final.png`);
      await page.evaluate(() => {
        document.querySelector("main").style.visibility = "hidden";
        document.querySelector(".site-footer").style.visibility = "hidden";
      });
      await page.waitForTimeout(120);
      await page.screenshot({ path: finalSceneScreenshot, fullPage: false });
      await page.evaluate(() => {
        document.querySelector("main").style.removeProperty("visibility");
        document.querySelector(".site-footer").style.removeProperty("visibility");
      });
    }
    await page.keyboard.press("Home");
    await page.waitForTimeout(100);
    await page.keyboard.press("Tab");
    const focused = await page.evaluate(() => document.activeElement?.className || document.activeElement?.tagName || "");
    results.push({
      name, route, viewport: viewportName, status: response?.status() || 0, screenshot,
      focused, midState, finalState, finalScreenshot, finalSceneScreenshot, consoleErrors, pageErrors, ...metrics,
      passed: response?.ok() === true && metrics.overflow <= 1 && metrics.brokenImages === 0 && consoleErrors.length === 0 && pageErrors.length === 0 && Boolean(metrics.h1) && (name === "lab" || metrics.webgl || metrics.fallback) && (name === "lab" || midState !== "Plan" && midState !== "Uncut" && midState !== "Surface") && (name === "lab" || finalState === "Ready to verify" || finalState === "Complete")
    });
    await context.close();
    await browser.close();
    writeProgress();
  }
}

for (const [name, route] of selectedRoutes.filter(([name]) => name !== "lab")) {
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_BIN ? { executablePath: process.env.CHROME_BIN } : {}) });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle", timeout: 30000 });
  const reduced = await page.evaluate(() => ({
    reducedClass: document.body.classList.contains("webgl-reduced"),
    progressRail: getComputedStyle(document.querySelector(".progress-rail")).display,
    sceneProgress: document.body.dataset.sceneProgress || ""
  }));
  results.push({ name, route, viewport: "mobile-reduced-motion", ...reduced, passed: reduced.reducedClass && reduced.progressRail === "none" && reduced.sceneProgress === "1.00" });
  await context.close();
  await browser.close();
  writeProgress();
}

for (const [name, route] of selectedRoutes.filter(([name]) => name !== "lab")) {
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_BIN ? { executablePath: process.env.CHROME_BIN } : {}) });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const response = await page.goto(`${baseUrl}${route}?forceWebglFallback=1`, { waitUntil: "networkidle", timeout: 30000 });
  const fallback = await page.evaluate(() => ({
    fallbackClass: document.body.classList.contains("webgl-fallback"),
    fallbackOpacity: Number.parseFloat(getComputedStyle(document.querySelector(".scene-fallback")).opacity),
    canvasOpacity: Number.parseFloat(getComputedStyle(document.querySelector("#scene-canvas")).opacity),
    visibleActions: [...document.querySelectorAll(".primary-action, .secondary-action")].filter((action) => {
      const rect = action.getBoundingClientRect();
      const style = getComputedStyle(action);
      return rect.width > 0 && rect.height > 0 && style.visibility !== "hidden" && style.display !== "none";
    }).length
  }));
  const screenshot = join(output, `${name}-mobile-webgl-fallback.png`);
  await page.screenshot({ path: screenshot, fullPage: false });
  results.push({
    name, route, viewport: "mobile-webgl-fallback", status: response?.status() || 0, screenshot, ...fallback,
    passed: response?.ok() === true && fallback.fallbackClass && fallback.fallbackOpacity >= 0.99 && fallback.canvasOpacity === 0 && fallback.visibleActions >= 2
  });
  await context.close();
  await browser.close();
  writeProgress();
}

const report = { generatedAt: new Date().toISOString(), baseUrl, round, complete: true, ok: results.every((item) => item.passed), results };
writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
if (!report.ok) process.exit(1);
