import "./styles.css";
import { createScrollScene } from "./scenes.js";

const body = document.body;
const site = body.dataset.site;
const canvas = document.querySelector("#scene-canvas");
const stage = document.querySelector(".scene-stage");
const stateOutput = document.querySelector("#scene-state");
const chapters = [...document.querySelectorAll("[data-scene-state]")];
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const damp = (value, target, rate, dt) => value + (target - value) * (1 - Math.exp(-rate * dt));
const smooth = (value) => {
  const t = clamp(value, 0, 1);
  return t * t * (3 - 2 * t);
};

let progress = reducedMotion ? 1 : 0;
let targetProgress = progress;
let scene = null;
let frameId = 0;
let lastTime = 0;
let pageVisible = !document.hidden;

function scrollProgress() {
  const distance = document.documentElement.scrollHeight - innerHeight;
  return distance > 0 ? clamp(scrollY / distance, 0, 1) : 0;
}

function updateTarget() {
  targetProgress = reducedMotion ? 1 : scrollProgress();
  document.documentElement.style.setProperty("--scroll-progress", targetProgress.toFixed(4));
  if (stateOutput && targetProgress > 0.92) {
    stateOutput.textContent = chapters.at(-1)?.dataset.sceneState || stateOutput.textContent;
  }
}

function resize() {
  if (!scene || !stage) return;
  const rect = stage.getBoundingClientRect();
  scene.resize(Math.max(1, Math.round(rect.width)), Math.max(1, Math.round(rect.height)));
}

function updateVisualState(value) {
  const worldReveal = smooth((value - 0.06) / 0.7);
  const lateReveal = smooth((value - 0.43) / 0.3);
  const middle = Math.sin(value * Math.PI);
  const style = document.documentElement.style;
  style.setProperty("--world-reveal", worldReveal.toFixed(4));
  style.setProperty("--late-reveal", lateReveal.toFixed(4));
  style.setProperty("--plate-brightness", (0.62 + worldReveal * 0.38).toFixed(4));
  style.setProperty("--plate-saturation", (0.72 + worldReveal * 0.28).toFixed(4));
  style.setProperty("--plate-scale", (1.09 + middle * 0.075).toFixed(4));
  style.setProperty("--plate-x", `${(-2.8 * middle + 1.2 * lateReveal).toFixed(3)}vw`);
  style.setProperty("--plate-y", `${(1.2 * middle - 0.55 * lateReveal).toFixed(3)}vh`);
  style.setProperty("--webgl-opacity", (0.5 + middle * 0.18 - lateReveal * 0.16).toFixed(4));
}

function render(time = 0) {
  if (!scene || !pageVisible) return;
  const elapsed = clamp(time - lastTime || 16.67, 1, 50);
  lastTime = time;
  progress = reducedMotion ? 1 : damp(progress, targetProgress, 5.2, elapsed / 1000);
  updateVisualState(progress);
  scene.update(progress, time / 1000, elapsed);
  scene.render();
  body.dataset.sceneProgress = progress.toFixed(2);
  if (!reducedMotion) frameId = requestAnimationFrame(render);
}

try {
  if (new URLSearchParams(location.search).has("forceWebglFallback")) {
    throw new Error("Forced WebGL fallback for release verification.");
  }
  scene = createScrollScene(site, canvas, { reducedMotion });
  body.classList.add("webgl-ready");
  body.dataset.sceneQuality = scene.quality;
  if (reducedMotion) body.classList.add("webgl-reduced");
  updateTarget();
  resize();
  render();
} catch (error) {
  body.classList.add("webgl-fallback");
  console.info("Scroll Lab is using the static scene fallback.", error instanceof Error ? error.message : error);
}

addEventListener("scroll", updateTarget, { passive: true });
addEventListener("resize", resize, { passive: true });

document.addEventListener("visibilitychange", () => {
  pageVisible = !document.hidden;
  if (!pageVisible && frameId) cancelAnimationFrame(frameId);
  if (pageVisible && scene && !reducedMotion) {
    lastTime = performance.now();
    frameId = requestAnimationFrame(render);
  }
});

const observer = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    entry.target.classList.toggle("is-active", entry.isIntersecting);
    if (entry.isIntersecting && stateOutput) stateOutput.textContent = entry.target.dataset.sceneState;
  }
}, { rootMargin: "-38% 0px -38% 0px", threshold: 0 });

chapters.forEach((chapter) => observer.observe(chapter));

addEventListener("pagehide", () => {
  if (frameId) cancelAnimationFrame(frameId);
  observer.disconnect();
  scene?.dispose();
}, { once: true });
