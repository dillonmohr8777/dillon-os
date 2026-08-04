/* ==========================================================================
   The Ironic Ineptocracy — behaviour, in the IMMOHRTAL idiom.
   No dependencies, no CDN. Everything here is progressive enhancement: remove
   this file and the page is still fully readable, navigable and submittable.

     1. duality      — the light/dark switch, persisted
     2. loader       — the mono readout counts the file open, then dissolves
     3. field        — one fixed ambient particle canvas, tinted per surface
     4. rail         — the right-edge HUD: section dots + rotated readout
     5. tint         — per-word colour ramp on the serif quote
     6. tilt         — TiltBox-style 3D on plates and cards
     7. marquee      — the slogan band, built once so the loop seams correctly
     8. reveals, mobile nav, form state
   ========================================================================== */
(() => {
  "use strict";

  const root = document.documentElement;
  root.setAttribute("data-js", "");

  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const DPR = Math.min(devicePixelRatio || 1, 2);
  const MOBILE = matchMedia("(max-width: 767px)").matches;
  const KEY = "ii-duality";

  /* -- 1. duality ---------------------------------------------------------
     IMMOHRTAL ships two finished palettes and lets the visitor choose. Default
     here is the dark side, because it is a case file. */
  const dualBtn = document.getElementById("dualBtn");
  const dualLabel = document.getElementById("dualLabel");
  let light = false;
  try {
    light = localStorage.getItem(KEY) === "light";
  } catch {}

  function applyDuality() {
    root.dataset.duality = light ? "light" : "dark";
    if (dualBtn) dualBtn.setAttribute("aria-pressed", String(light));
    if (dualLabel) dualLabel.textContent = light ? "Declassified" : "Redacted";
  }
  applyDuality();

  dualBtn?.addEventListener("click", () => {
    light = !light;
    try {
      localStorage.setItem(KEY, light ? "light" : "dark");
    } catch {}
    applyDuality();
    field?.retint();
  });

  /* -- 2. loader ---------------------------------------------------------- */
  const loader = document.getElementById("loader");
  const loaderRead = document.getElementById("loaderRead");
  if (loader) {
    if (reduce.matches) loader.classList.add("done");
    else {
      const steps = [
        "CASE 017 // OPENING FILE",
        "CASE 017 // VERIFYING CLEARANCE",
        "CASE 017 // REDACTIONS APPLIED",
        "CASE 017 // FILE OPEN",
      ];
      let i = 0;
      const tick = setInterval(() => {
        i += 1;
        if (loaderRead && i < steps.length) loaderRead.textContent = steps[i];
        if (i >= steps.length - 1) clearInterval(tick);
      }, 380);
      const dismiss = () => {
        clearInterval(tick);
        loader.classList.add("done");
      };
      const min = new Promise((r) => setTimeout(r, 1550));
      const loaded =
        document.readyState === "complete"
          ? Promise.resolve()
          : new Promise((r) => addEventListener("load", r, { once: true }));
      Promise.all([min, loaded]).then(dismiss);
      setTimeout(dismiss, 2600); // failsafe: never trap a slow connection
    }
  }

  /* -- 3. ambient field ---------------------------------------------------
     One fixed Canvas2D canvas. The tint is read from the live --signal /
     --green tokens, so flipping the duality re-tints the field for free rather
     than needing a second palette here. */
  function initField() {
    const cv = document.getElementById("field");
    if (!cv || reduce.matches) return null;
    let net = null;
    try {
      net = navigator.connection || null;
    } catch {}
    if (net && net.saveData === true) return null;

    const cores = navigator.hardwareConcurrency || 4;
    let COUNT = MOBILE ? 520 : innerWidth < 1100 ? 950 : 1500;
    if (cores <= 4) COUNT = Math.round(COUNT * 0.6);
    if ((devicePixelRatio || 1) >= 3) COUNT = Math.round(COUNT * 0.75);

    let W = 0,
      H = 0,
      ctx = null;
    const P = [];
    let sprites = [];

    function size() {
      W = innerWidth;
      H = innerHeight;
      // Both the backing store AND the CSS box, or the canvas lays out at its
      // attribute width in CSS pixels and overflows narrow viewports.
      cv.width = Math.round(W * DPR);
      cv.height = Math.round(H * DPR);
      cv.style.width = W + "px";
      cv.style.height = H + "px";
      ctx = cv.getContext("2d");
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }

    function buildSprites() {
      const cs = getComputedStyle(root);
      const isLight = root.dataset.duality === "light";
      // On a light ground a dot needs more area and less alpha to read as the
      // same weight it has on a dark one.
      const tints = [
        cs.getPropertyValue("--signal").trim() || "#1f9eff",
        cs.getPropertyValue("--green").trim() || "#17a86b",
      ];
      const alpha = isLight ? 0.2 : 0.34;
      const rad = isLight ? 1.7 : 1.25;
      sprites = tints.map((c) => {
        const r = rad * 3.4;
        const s = document.createElement("canvas");
        s.width = s.height = Math.ceil(r * 2 * DPR);
        const g = s.getContext("2d");
        g.scale(DPR, DPR);
        const grd = g.createRadialGradient(r, r, 0, r, r, r);
        grd.addColorStop(0, c);
        grd.addColorStop(0.45, c);
        grd.addColorStop(1, "transparent");
        g.fillStyle = grd;
        g.beginPath();
        g.arc(r, r, r, 0, Math.PI * 2);
        g.fill();
        return { cv: s, r, alpha };
      });
    }

    function seed() {
      P.length = 0;
      for (let i = 0; i < COUNT; i++) {
        P.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.14,
          vy: (Math.random() - 0.5) * 0.14 - 0.04,
          s: 0.6 + Math.random() * 0.85,
          ph: Math.random() * Math.PI * 2,
          k: Math.random() < 0.68 ? 0 : 1,
        });
      }
    }

    let mx = -9999,
      my = -9999;
    addEventListener(
      "pointermove",
      (e) => {
        if (e.pointerType === "touch") return;
        mx = e.clientX;
        my = e.clientY;
      },
      { passive: true }
    );
    addEventListener("pointerleave", () => (mx = my = -9999));

    let raf = 0,
      dead = false,
      last = performance.now(),
      times = [],
      slow = 0,
      live = COUNT;

    function frame(now) {
      if (dead) return;
      const dt = Math.min(48, now - last);
      last = now;
      const t0 = performance.now();
      ctx.clearRect(0, 0, W, H);

      for (let i = 0; i < live; i++) {
        const p = P[i];
        p.x += p.vx * dt * 0.06;
        p.y += p.vy * dt * 0.06;
        if (mx > -9998) {
          const dx = p.x - mx,
            dy = p.y - my,
            d2 = dx * dx + dy * dy;
          if (d2 < 12100 && d2 > 1) {
            const f = (1 - Math.sqrt(d2) / 110) * 0.5;
            p.x += dx * f * 0.06;
            p.y += dy * f * 0.06;
          }
        }
        if (p.x < -8) p.x = W + 8;
        else if (p.x > W + 8) p.x = -8;
        if (p.y < -8) p.y = H + 8;
        else if (p.y > H + 8) p.y = -8;

        const sp = sprites[p.k] || sprites[0];
        if (!sp) continue;
        ctx.globalAlpha = sp.alpha * (Math.sin(p.ph + now * 0.0006) * 0.3 + 0.7);
        const r = sp.r * p.s;
        ctx.drawImage(sp.cv, p.x - r, p.y - r, r * 2, r * 2);
      }
      ctx.globalAlpha = 1;

      times.push(performance.now() - t0);
      if (times.length > 30) times.shift();
      const mean = times.reduce((a, b) => a + b, 0) / times.length;
      if (mean > 20) {
        if (++slow > 60) {
          live = Math.max(240, Math.round(live * 0.75));
          slow = 0;
          times = [];
        }
      } else slow = 0;

      raf = requestAnimationFrame(frame);
    }

    function onResize() {
      size();
      buildSprites();
      seed();
      live = P.length;
    }

    size();
    buildSprites();
    seed();
    addEventListener("resize", onResize);
    raf = requestAnimationFrame(frame);

    return {
      retint: buildSprites,
      destroy() {
        dead = true;
        cancelAnimationFrame(raf);
        removeEventListener("resize", onResize);
        ctx && ctx.clearRect(0, 0, W, H);
      },
    };
  }
  let field = initField();
  reduce.addEventListener?.("change", () => {
    field?.destroy();
    field = initField();
  });

  /* -- 4. the HUD rail ---------------------------------------------------- */
  const sections = [...document.querySelectorAll("[data-rail]")];
  const dotsHost = document.getElementById("railDots");
  const railRead = document.getElementById("railRead");

  if (dotsHost && sections.length) {
    sections.forEach((s, i) => {
      if (i) {
        const t = document.createElement("span");
        t.className = "rail__tick";
        dotsHost.appendChild(t);
      }
      const b = document.createElement("button");
      b.type = "button";
      b.className = "rail__dot";
      b.setAttribute("aria-label", s.dataset.rail);
      b.addEventListener("click", () =>
        s.scrollIntoView({ behavior: reduce.matches ? "auto" : "smooth", block: "start" })
      );
      dotsHost.appendChild(b);
    });

    const dots = [...dotsHost.querySelectorAll(".rail__dot")];
    let rafR = 0;
    const update = () => {
      if (rafR) return;
      rafR = requestAnimationFrame(() => {
        rafR = 0;
        const mid = innerHeight * 0.4;
        let active = 0;
        sections.forEach((s, i) => {
          const r = s.getBoundingClientRect();
          if (r.top <= mid && r.bottom > mid) active = i;
        });
        dots.forEach((d, i) => d.setAttribute("aria-current", String(i === active)));
        const max = document.documentElement.scrollHeight - innerHeight;
        const pct = max > 0 ? Math.min(100, (scrollY / max) * 100) : 100;
        if (railRead) {
          railRead.textContent =
            `Case 017 · ${sections[active].dataset.rail} · clearance ${pct.toFixed(1)}%`.toUpperCase();
        }
      });
    };
    update();
    addEventListener("scroll", update, { passive: true });
    addEventListener("resize", update);
  }

  /* -- 5. per-word tint on the serif quote --------------------------------
     IMMOHRTAL's signature text treatment. Each word gets a position along a
     blue-to-green ramp plus a slight opacity wobble, so the sentence reads like
     a signal drifting in and out. Done in JS because it needs one span per word;
     with JS off the quote renders as ordinary type. */
  document.querySelectorAll("[data-tint]").forEach((q) => {
    const cite = q.querySelector("cite");
    const text = [...q.childNodes]
      .filter((n) => n.nodeType === 3)
      .map((n) => n.textContent)
      .join(" ")
      .trim();
    if (!text) return;
    const words = text.split(/\s+/);
    const frag = document.createDocumentFragment();
    words.forEach((word, i) => {
      const w = document.createElement("w");
      w.textContent = word;
      const t = words.length > 1 ? i / (words.length - 1) : 0.5;
      w.style.setProperty("--i", t.toFixed(3));
      // a gentle, deterministic wobble — no Math.random, so it is stable
      w.style.setProperty("--o", (0.62 + 0.38 * Math.abs(Math.sin(i * 1.7))).toFixed(3));
      frag.appendChild(w);
      if (i < words.length - 1) frag.appendChild(document.createTextNode(" "));
    });
    [...q.childNodes].forEach((n) => n.nodeType === 3 && n.remove());
    q.insertBefore(frag, cite || null);
  });

  /* -- 6. tilt ------------------------------------------------------------ */
  document.querySelectorAll("[data-tilt]").forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      if (e.pointerType === "touch" || reduce.matches) return;
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty("--tx", `${(-y * 6).toFixed(2)}deg`);
      el.style.setProperty("--ty", `${(x * 8).toFixed(2)}deg`);
    });
    el.addEventListener("pointerleave", () => {
      el.style.setProperty("--tx", "0deg");
      el.style.setProperty("--ty", "0deg");
    });
  });

  /* -- 7. the slogan marquee ---------------------------------------------
     Built here rather than in markup so the track is exactly two identical
     halves — that is what makes the -50% loop seamless instead of jumping. */
  const track = document.getElementById("marqTrack");
  if (track) {
    const slogans = [
      "Obey",
      "Secure",
      "Comply",
      "<b>Make America obedient again</b>",
      "Freedom is not free",
      "<b>Processing fee applies</b>",
    ];
    const half = slogans.map((s) => `<span>${s} <b>·</b></span>`).join("");
    track.innerHTML = half + half;
  }

  /* -- 8. reveals, nav, form --------------------------------------------- */
  const rises = document.querySelectorAll(".rise");
  if (reduce.matches) rises.forEach((e) => e.classList.add("in"));
  else {
    const io = new IntersectionObserver(
      (es) => {
        for (const e of es) {
          if (!e.isIntersecting) continue;
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    rises.forEach((e) => io.observe(e));
  }

  // character art warms to full colour when it is the thing you are looking at
  const seen = document.querySelectorAll("[data-seen]");
  if (seen.length && !reduce.matches) {
    const so = new IntersectionObserver(
      (es) => es.forEach((e) => e.target.classList.toggle("seen", e.isIntersecting)),
      { threshold: 0.6 }
    );
    seen.forEach((s) => so.observe(s));
  } else seen.forEach((s) => s.classList.add("seen"));

  const mb = document.getElementById("menuBtn");
  const mn = document.getElementById("mnav");
  const close = () => {
    if (!mn || mn.hidden) return;
    mn.hidden = true;
    mb.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    mb.focus();
  };
  mb?.addEventListener("click", () => {
    const open = mn.hidden;
    mn.hidden = !open;
    mb.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
    if (open) mn.querySelector("a")?.focus();
  });
  mn?.addEventListener("click", (e) => e.target.closest("a") && close());
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
    if (e.key !== "Tab" || !mn || mn.hidden) return;
    const items = [mb, ...mn.querySelectorAll("a,button")];
    const first = items[0],
      last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  const form = document.querySelector(".form");
  form?.addEventListener("submit", (e) => {
    const s = form.querySelector(".form__status");
    if (s) s.textContent = "Transmitting…";
    if (e.submitter) e.submitter.disabled = true;
  });
})();
