/* radar-next10-2026-09-02c kit.js — no dependencies. Enhancement only: the
   page is complete with JS off; all of it no-ops under reduced motion. */
(function () {
  "use strict";
  var doc = document, root = doc.documentElement;
  var still = !window.matchMedia ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Until this runs CSS keeps [data-reveal] visible: no-JS works.
  if (!still && "IntersectionObserver" in window) root.classList.add("js");

  function ready(fn) {
    if (doc.readyState !== "loading") fn();
    else doc.addEventListener("DOMContentLoaded", fn);
  }
  ready(function () {
    // 1. Reveals: data-reveal="" | left | right. data-stagger on a parent
    //    cascades children 90ms apart, capped at 6.
    if (!still && "IntersectionObserver" in window) {
      [].forEach.call(doc.querySelectorAll("[data-stagger]"), function (g) {
        var kids = g.querySelectorAll("[data-reveal]");
        for (var i = 0; i < kids.length; i++)
          kids[i].style.setProperty("--d", Math.min(i, 6) * 90 + "ms");
      });
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting) return;
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        });
      }, { rootMargin: "0px 0px -12% 0px", threshold: 0.12 });
      [].forEach.call(doc.querySelectorAll("[data-reveal]"), function (el) {
        io.observe(el);
      });

      // 2. Count-up: <span data-count="250" data-suffix="+">250+</span>. The
      //    final value MUST already be in the HTML, so no-JS and reduced-
      //    motion readers see the real number, with no shift.
      var nums = doc.querySelectorAll("[data-count]");
      var cio = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting) return;
          cio.unobserve(e.target);
          count(e.target);
        });
      }, { threshold: 0.5 });
      [].forEach.call(nums, function (el) { cio.observe(el); });
    }

    function count(el) {
      var target = parseFloat(el.getAttribute("data-count"));
      if (isNaN(target)) return;
      var dec = el.getAttribute("data-decimals") | 0, t0 = 0;
      var pre = el.getAttribute("data-prefix") || "";
      var suf = el.getAttribute("data-suffix") || "";
      function step(now) {
        if (!t0) t0 = now;
        var p = Math.min((now - t0) / 1100, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = pre + (target * eased).toFixed(dec) + suf;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    // 3. Marquee: CSS pauses on :hover; focus/touch stop it without a mouse.
    [].forEach.call(doc.querySelectorAll(".marquee"), function (m) {
      function hold() { m.setAttribute("data-paused", ""); }
      function go() { m.removeAttribute("data-paused"); }
      var t = { passive: true };
      m.addEventListener("focusin", hold);
      m.addEventListener("focusout", go);
      m.addEventListener("touchstart", hold, t);
      m.addEventListener("touchend", go, t);
      if (still) hold();
    });

    // 4. Parallax: [data-parallax="14"] = max px travel (default 10). Sets two
    //    custom props; CSS owns the transform. Fine pointers only.
    var px = doc.querySelectorAll("[data-parallax]");
    if (!still && px.length && window.matchMedia("(pointer: fine)").matches) {
      var pending = false, mx = 0, my = 0;
      window.addEventListener("pointermove", function (ev) {
        mx = ev.clientX / window.innerWidth - 0.5;
        my = ev.clientY / window.innerHeight - 0.5;
        if (pending) return;
        pending = true;
        requestAnimationFrame(function () {
          pending = false;
          [].forEach.call(px, function (el) {
            var d = parseFloat(el.getAttribute("data-parallax")) || 10;
            el.style.setProperty("--px", (mx * d).toFixed(2));
            el.style.setProperty("--py", (my * d).toFixed(2));
          });
        });
      }, { passive: true });
    }
  });
})();
