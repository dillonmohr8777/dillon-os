import "./styles.css";
import { createScrollScene } from "./scenes.js";

const body = document.body;
const site = body.dataset.site;
const canvas = document.querySelector("#scene-canvas");
const stage = document.querySelector(".scene-stage");
const anchorLayer = document.querySelector(".panel-anchors");
const stateOutput = document.querySelector("#scene-state");
const beatOutput = document.querySelector("#scene-beat");
const chapters = [...document.querySelectorAll("[data-scene-state]")];
const railItems = [...document.querySelectorAll(".chapter-rail li")];
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
let stageWidth = 1;
let stageHeight = 1;
const chips = new Map();

function scrollProgress() {
  const distance = document.documentElement.scrollHeight - innerHeight;
  return distance > 0 ? clamp(scrollY / distance, 0, 1) : 0;
}

function updateTarget() {
  targetProgress = reducedMotion ? 1 : scrollProgress();
  document.documentElement.style.setProperty("--scroll-progress", targetProgress.toFixed(4));
  /*
    The closing sections sit below the last chapter, so once the reader is past
    them the observer has nothing left in its band. Latch the final state rather
    than leaving the readout on whichever chapter fired last.
  */
  if (stateOutput && targetProgress > 0.92) {
    const last = chapters.at(-1);
    if (last) {
      stateOutput.textContent = last.dataset.sceneState;
      railItems.forEach((item, i) => item.classList.toggle("is-on", i === chapters.length - 1));
    }
  }
}

function resize() {
  if (!scene || !stage) return;
  const rect = stage.getBoundingClientRect();
  stageWidth = Math.max(1, Math.round(rect.width));
  stageHeight = Math.max(1, Math.round(rect.height));
  scene.resize(stageWidth, stageHeight);
}

/* Captions are HTML so the type stays crisp, but they are positioned from the
   projected world anchor of each panel — the label belongs to the object. */
function ensureChip(anchor) {
  let chip = chips.get(anchor.id);
  if (chip) return chip;
  chip = document.createElement("figcaption");
  chip.className = "panel-anchor";
  chip.innerHTML = `<b></b><span></span>`;
  chip.querySelector("b").textContent = anchor.label;
  chip.querySelector("span").textContent = anchor.meta;
  anchorLayer?.appendChild(chip);
  chips.set(anchor.id, chip);
  return chip;
}

function updateAnchors() {
  if (!anchorLayer || !scene?.anchors) return;
  const anchors = scene.anchors(stageWidth, stageHeight);
  for (const anchor of anchors) {
    const chip = ensureChip(anchor);
    const onScreen = anchor.visible
      && anchor.x > -140 && anchor.x < stageWidth + 140
      && anchor.y > -80 && anchor.y < stageHeight + 80;
    chip.style.opacity = onScreen ? anchor.opacity.toFixed(3) : "0";
    if (!onScreen) continue;
    chip.style.transform = `translate3d(${anchor.x.toFixed(1)}px, ${anchor.y.toFixed(1)}px, 0)`;
  }
}

function updateVisualState(value) {
  const style = document.documentElement.style;
  const worldReveal = smooth((value - 0.04) / 0.6);
  const lateReveal = smooth((value - 0.55) / 0.35);
  style.setProperty("--world-reveal", worldReveal.toFixed(4));
  style.setProperty("--late-reveal", lateReveal.toFixed(4));
}

function render(time = 0) {
  if (!scene || !pageVisible) return;
  const raw = time - lastTime || 16.67;
  lastTime = time;
  /*
    Scene animation gets a tightly clamped step so a stalled tab cannot fling
    the choreography forward. Scroll damping gets the longer step, so a slow
    device still catches up to where the reader actually is.
  */
  const elapsed = clamp(raw, 1, 50);
  const scrollStep = clamp(raw, 1, 260) / 1000;
  progress = reducedMotion ? 1 : damp(progress, targetProgress, 4.4, scrollStep);
  if (!reducedMotion && Math.abs(targetProgress - progress) < 0.0015) progress = targetProgress;
  updateVisualState(progress);
  const shot = scene.update(progress, time / 1000, elapsed);
  scene.render();
  updateAnchors();
  body.dataset.sceneProgress = progress.toFixed(2);
  if (beatOutput && shot) beatOutput.textContent = String(shot.index + 1).padStart(2, "0");
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
addEventListener("resize", () => {
  resize();
  updateTarget();
}, { passive: true });

addEventListener("orientationchange", () => {
  setTimeout(() => {
    resize();
    updateTarget();
  }, 220);
});

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
    if (!entry.isIntersecting) continue;
    if (stateOutput) stateOutput.textContent = entry.target.dataset.sceneState;
    const index = chapters.indexOf(entry.target);
    railItems.forEach((item, i) => item.classList.toggle("is-on", i === index));
  }
}, { rootMargin: "-40% 0px -40% 0px", threshold: 0 });

chapters.forEach((chapter) => observer.observe(chapter));

addEventListener("pagehide", () => {
  if (frameId) cancelAnimationFrame(frameId);
  observer.disconnect();
  scene?.dispose();
}, { once: true });
