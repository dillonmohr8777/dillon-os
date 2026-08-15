/**
 * Factory runtime for Jakubantalik/transitions.dev snippets.
 * querySelectorAll everywhere. No demo replay loops. Respects
 * prefers-reduced-motion. Pointer tilt lives on the outer .t-tilt.
 */
(function () {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  function showStagger(el) {
    el.classList.remove("is-hiding");
    el.classList.remove("is-shown");
    void el.offsetHeight;
    el.classList.add("is-shown");
  }

  document.querySelectorAll(".t-stagger").forEach((block) => {
    if (reduce.matches) {
      block.classList.add("is-shown");
      return;
    }
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              showStagger(entry.target);
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.2 }
      );
      io.observe(block);
    } else {
      showStagger(block);
    }
  });

  const MAX = 14;

  document.querySelectorAll(".t-tilt").forEach((tilt) => {
    const card = tilt.querySelector(".t-tilt-card");
    if (!card) return;

    function reset() {
      tilt.classList.remove("is-hover");
      card.classList.remove("is-tilting");
      card.style.setProperty("--tilt-rx", "0deg");
      card.style.setProperty("--tilt-ry", "0deg");
    }

    function track(e) {
      if (reduce.matches) return;
      const r = tilt.getBoundingClientRect();
      const px = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
      const py = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
      tilt.classList.add("is-hover");
      card.classList.add("is-tilting");
      card.style.setProperty("--tilt-ry", ((px - 0.5) * MAX).toFixed(2) + "deg");
      card.style.setProperty("--tilt-rx", ((0.5 - py) * MAX).toFixed(2) + "deg");
      card.style.setProperty("--tilt-gx", (px * 100).toFixed(1) + "%");
      card.style.setProperty("--tilt-gy", (py * 100).toFixed(1) + "%");
    }

    tilt.addEventListener("pointerdown", (e) => {
      if (e.pointerType !== "mouse") {
        try {
          tilt.setPointerCapture(e.pointerId);
        } catch (_) {
          /* ignore */
        }
      }
    });
    tilt.addEventListener("pointermove", track);
    tilt.addEventListener("pointerup", reset);
    tilt.addEventListener("pointercancel", reset);
    tilt.addEventListener("pointerleave", (e) => {
      if (e.pointerType === "mouse") reset();
    });
  });

  document.querySelectorAll(".t-acc").forEach((acc) => {
    const head = acc.querySelector(".t-acc-head");
    if (!head) return;
    head.addEventListener("click", () => {
      const open = acc.getAttribute("data-open") === "true";
      acc.setAttribute("data-open", String(!open));
      head.setAttribute("aria-expanded", String(!open));
    });
  });

  document.querySelectorAll(".t-tabs").forEach((root) => {
    const pill = root.querySelector(".t-tabs-pill");
    const tabs = [...root.querySelectorAll("[role=tab]")];
    if (!tabs.length) return;

    function panelFor(tab) {
      const id = tab.getAttribute("aria-controls");
      return id ? document.getElementById(id) : null;
    }

    function movePill(tab, animate) {
      if (!pill) return;
      if (!animate) {
        const prev = pill.style.transition;
        pill.style.transition = "none";
        pill.style.transform = `translateX(${tab.offsetLeft}px)`;
        pill.style.width = `${tab.offsetWidth}px`;
        void pill.offsetWidth;
        pill.style.transition = prev;
      } else {
        pill.style.transform = `translateX(${tab.offsetLeft}px)`;
        pill.style.width = `${tab.offsetWidth}px`;
      }
    }

    function activate(next, { focus = true, animate = true } = {}) {
      tabs.forEach((t, i) => {
        const on = i === next;
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.tabIndex = on ? 0 : -1;
        if (on && focus) t.focus();
        if (on) {
          const panel = panelFor(t);
          if (panel && animate) panel.scrollIntoView({ behavior: reduce.matches ? "auto" : "smooth", block: "nearest" });
        }
      });
      movePill(tabs[next], animate && !reduce.matches);
    }

    root.addEventListener("click", (e) => {
      const tab = e.target.closest("[role=tab]");
      if (!tab) return;
      activate(tabs.indexOf(tab), { focus: false });
    });

    root.addEventListener("keydown", (e) => {
      const i = tabs.indexOf(document.activeElement);
      if (i < 0) return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        activate((i + 1) % tabs.length);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        activate((i - 1 + tabs.length) % tabs.length);
      } else if (e.key === "Home") {
        e.preventDefault();
        activate(0);
      } else if (e.key === "End") {
        e.preventDefault();
        activate(tabs.length - 1);
      }
    });

    requestAnimationFrame(() => activate(0, { focus: false, animate: false }));
    window.addEventListener("resize", () => {
      const current = tabs.find((t) => t.getAttribute("aria-selected") === "true") || tabs[0];
      movePill(current, false);
    });
  });
})();
