/* ============================================================
   ALIGN IN MOTION — motion engine (v2)

   One GSAP master timeline drives everything. That buys two
   things at once:

   1. Smooth real-time playback. GSAP animates only GPU
      properties (transform / opacity / filter / clip-path),
      batches all writes into a single ticker, and manages
      will-change for us. lagSmoothing(0) keeps the timeline
      honest instead of letting it "catch up" in a jump.

   2. Frame-accurate export. The whole video is a pure function
      of time, so window.AIM.renderAt(t) puts the frame in an
      exact state. render-frames.js walks t in 1/FPS steps and
      screenshots each one, which produces a perfectly smooth
      MP4 with zero dropped or duplicated frames. Real-time
      screen capture cannot promise that.

   Scene lengths come from data-dur on each .scene. Add or
   reorder scenes freely; the timeline rebuilds itself.
   ============================================================ */
(function () {
  "use strict";

  var stage = document.getElementById("stage");
  if (!stage || typeof gsap === "undefined") return;

  var XF = 0.9;          // cross-dissolve length between scenes (s)
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  gsap.ticker.lagSmoothing(0);            // never fast-forward to "catch up"
  gsap.config({ force3D: true, nullTargetWarn: false });

  var scenes = gsap.utils.toArray(".scene", stage);
  var pager = stage.querySelector(".pager");
  var totalPages = scenes.filter(function (s) { return s.hasAttribute("data-page"); }).length;

  /* ---------- fit the fixed stage into the viewport ---------- */
  function fit() {
    var s = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    gsap.set(stage, { scale: s });
  }
  window.addEventListener("resize", fit);
  fit();

  /* ---------- prep: split headlines into words, wrap lines ---------- */
  function splitWords(el) {
    // wrap each word in .w, preserving <em> accents
    var out = [];
    Array.prototype.slice.call(el.childNodes).forEach(function (node) {
      if (node.nodeType === 3) {
        var frag = document.createDocumentFragment();
        node.textContent.split(/(\s+)/).forEach(function (tok) {
          if (!tok) return;
          if (/^\s+$/.test(tok)) { frag.appendChild(document.createTextNode(tok)); return; }
          var s = document.createElement("span");
          s.className = "w"; s.textContent = tok;
          frag.appendChild(s); out.push(s);
        });
        el.replaceChild(frag, node);
      } else if (node.nodeType === 1) {
        // <em> accent: split its inner words too, keep the em styling
        var inner = [];
        node.textContent.split(/(\s+)/).forEach(function (tok) {
          if (!tok) return;
          if (/^\s+$/.test(tok)) { inner.push(document.createTextNode(tok)); return; }
          var s = document.createElement("span");
          s.className = "w"; s.textContent = tok;
          inner.push(s); out.push(s);
        });
        node.textContent = "";
        inner.forEach(function (n) { node.appendChild(n); });
      }
    });
    return out;
  }

  scenes.forEach(function (sc) {
    sc.querySelectorAll(".headline").forEach(function (h) { h._words = splitWords(h); });
    // wrap body / quote / attr text in an overflow mask for curtain reveals
    sc.querySelectorAll(".body, .quote, .attr, .st-t, .st-b").forEach(function (el) {
      if (el.parentNode.classList.contains("mask")) return;
      var m = document.createElement("div");
      m.className = "mask";
      el.parentNode.insertBefore(m, el);
      m.appendChild(el);
    });
  });

  /* ---------- ambient background motion (its own looping timeline) ----
     Kept separate from the master so it is continuous and never
     restarts at scene boundaries. Transform/opacity only.          */
  var ambient = gsap.timeline({ repeat: -1 });
  if (!reduced) {
    // aura drift (yoyo inside one repeating parent so it stays seekable)
    ambient
      .to(".aura-a", { xPercent: 9, yPercent: 7, scale: 1.10, duration: 26, ease: "sine.inOut", yoyo: true, repeat: 1 }, 0)
      .to(".aura-b", { xPercent: -11, yPercent: 9, scale: 1.14, duration: 32, ease: "sine.inOut", yoyo: true, repeat: 1 }, 0)
      .to(".aura-c", { xPercent: -8, yPercent: -11, scale: 1.12, duration: 30, ease: "sine.inOut", yoyo: true, repeat: 1 }, 0)
      .to(".aura-d", { xPercent: 12, yPercent: -8, scale: 1.08, duration: 36, ease: "sine.inOut", yoyo: true, repeat: 1 }, 0);

    // light sweep passes across the frame every ~11s
    ambient.fromTo(".sweep", { xPercent: -140 },
      { xPercent: 240, duration: 4.2, ease: "power1.inOut", repeat: 5, repeatDelay: 6.8 }, 0);

    // embers drift, built once
    var motes = stage.querySelector(".motes");
    if (motes) {
      for (var i = 0; i < 26; i++) {
        var d = document.createElement("i");
        d.className = "mote" + (i % 3 === 0 ? " cool" : "");
        var sz = 3 + (i % 4);
        d.style.width = sz + "px"; d.style.height = sz + "px";
        d.style.left = ((i * 37) % 100) + "%";
        d.style.top = (12 + (i * 29) % 80) + "%";
        motes.appendChild(d);
        ambient.to(d, {
          y: -140 - (i % 5) * 60, x: (i % 2 ? 40 : -40),
          opacity: 0.75, duration: 9 + (i % 6),
          ease: "sine.inOut", yoyo: true, repeat: 7
        }, (i % 10) * 0.9);
      }
    }
  }

  /* ---------- per-scene entrance choreography ---------- */
  function sceneIn(sc, tl, at) {
    var q = function (sel) { return sc.querySelectorAll(sel); };
    var E = "power3.out";

    // panel: clip-path wipe + parallax drift + slow ken burns
    var panel = sc.querySelector(".panel");
    if (panel) {
      tl.fromTo(panel,
        { clipPath: "inset(0 0 0 100%)", xPercent: 6 },
        { clipPath: "inset(0 0 0 0%)", xPercent: 0, duration: 1.25, ease: "power4.out" }, at);
      tl.fromTo(panel.querySelector("img"),
        { scale: 1.16 }, { scale: 1.03, duration: (sc._dur || 8) + 0.4, ease: "none" }, at);
    }

    // watermark word: slow drift in
    var ghost = sc.querySelector(".ghost");
    if (ghost) tl.fromTo(ghost, { opacity: 0, xPercent: -3 },
      { opacity: 1, xPercent: 1.5, duration: (sc._dur || 8), ease: "none" }, at);

    // eyebrow: rule draws out, label rises
    var eb = sc.querySelector(".eyebrow");
    if (eb) {
      tl.fromTo(eb.querySelector("i"), { scaleX: 0 }, { scaleX: 1, duration: .7, ease: "power3.inOut" }, at + .05);
      tl.fromTo(eb.querySelector("span"), { opacity: 0, x: -18 },
        { opacity: 1, x: 0, duration: .7, ease: E }, at + .16);
    }

    // headline: words rise with a tight stagger
    q(".headline").forEach(function (h) {
      tl.fromTo(h._words && h._words.length ? h._words : h,
        { yPercent: 118, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 1.0, ease: "power4.out", stagger: 0.045 }, at + .22);
    });

    // body / quote / attr: curtain up from their masks
    q(".mask > *").forEach(function (el, k) {
      tl.fromTo(el, { yPercent: 105, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: .95, ease: "power4.out" }, at + .46 + k * .1);
    });

    // quote mark pops
    var qm = sc.querySelector(".quote-mark");
    if (qm) tl.fromTo(qm, { opacity: 0, scale: .6, y: 20 },
      { opacity: 1, scale: 1, y: 0, duration: .8, ease: "back.out(2.2)" }, at + .3);

    // numbered list rows
    q(".li").forEach(function (li, k) {
      tl.fromTo(li, { opacity: 0, y: 46 },
        { opacity: 1, y: 0, duration: .85, ease: E }, at + .55 + k * .16);
      var n = li.querySelector(".num");
      if (n) tl.fromTo(n, { opacity: 0, scale: .7 },
        { opacity: 1, scale: 1, duration: .7, ease: "back.out(2.4)" }, at + .55 + k * .16);
    });

    // big stat: count up + glow pop
    var big = sc.querySelector(".big");
    if (big) {
      var target = parseFloat(big.getAttribute("data-count") || big.textContent) || 0;
      var obj = { v: 0 };
      tl.fromTo(big, { opacity: 0, scale: .78 },
        { opacity: 1, scale: 1, duration: 1.1, ease: "back.out(1.9)" }, at + .25);
      tl.to(obj, {
        v: target, duration: 1.5, ease: "power2.out",
        onUpdate: function () { big.textContent = Math.round(obj.v); }
      }, at + .3);
    }

    // cards: rise, rule draws, light sweeps across
    q(".card").forEach(function (c, k) {
      tl.fromTo(c, { opacity: 0, y: 62, scale: .96 },
        { opacity: 1, y: 0, scale: 1, duration: .95, ease: E }, at + .5 + k * .14);
      var r = c.querySelector(".rule");
      if (r) tl.fromTo(r, { scaleX: 0 }, { scaleX: 1, duration: .7, ease: "power3.inOut" }, at + .95 + k * .14);
      var sh = c.querySelector(".shine");
      if (sh) tl.fromTo(sh, { xPercent: -180 },
        { xPercent: 320, duration: 1.5, ease: "power2.inOut" }, at + 1.0 + k * .16);
    });

    // outro lockup
    var lg = sc.querySelector(".lg");
    if (lg) {
      tl.fromTo(lg, { opacity: 0, scale: .88, y: 18 },
        { opacity: 1, scale: 1, y: 0, duration: 1.1, ease: "back.out(1.6)" }, at + .2);
      tl.fromTo(sc.querySelector(".halo"), { opacity: 0, scale: .7 },
        { opacity: 1, scale: 1, duration: 1.6, ease: "power2.out" }, at + .2);
      tl.fromTo(sc.querySelector(".divider"), { scaleX: 0 },
        { scaleX: 1, duration: .9, ease: "power3.inOut" }, at + .7);
      tl.fromTo(sc.querySelectorAll(".tag, .u"), { opacity: 0, y: 26 },
        { opacity: 1, y: 0, duration: .9, ease: E, stagger: .14 }, at + .85);
    }
  }

  /* ---------- build the master timeline ---------- */
  var master = gsap.timeline({ paused: true });
  var t = 0;

  // chrome intro (once)
  master.fromTo(".topbar i", { scaleX: 0 }, { scaleX: 1, duration: 1.3, ease: "power3.inOut" }, 0)
        .fromTo(".logo", { opacity: 0, y: -16 }, { opacity: 1, y: 0, duration: .9, ease: "power3.out" }, .15)
        .fromTo(".footer", { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: .9, ease: "power3.out" }, .25);

  scenes.forEach(function (sc, i) {
    var dur = parseFloat(sc.getAttribute("data-dur")) || 8;
    sc._dur = dur; sc._start = t;

    // cross-dissolve in (autoAlpha handles visibility for free)
    master.fromTo(sc,
      { autoAlpha: 0, scale: 1.028 },
      { autoAlpha: 1, scale: 1, duration: i === 0 ? 1.0 : XF, ease: "power2.out" }, t);

    sceneIn(sc, master, t + (i === 0 ? .25 : .1));

    // cross-dissolve out (overlapping the next scene's fade in)
    if (i < scenes.length - 1) {
      master.to(sc, { autoAlpha: 0, scale: .988, duration: XF, ease: "power2.inOut" }, t + dur - XF * 0.5);
    }

    // pager swap, exactly on the cut
    master.call(function () { setPager(sc); }, null, t + 0.01);

    t += dur;
  });

  var TOTAL = t;
  master.to({}, { duration: 0.001 }, TOTAL);   // pin the end

  function setPager(sc) {
    if (!pager) return;
    if (sc.hasAttribute("data-page")) {
      pager.style.opacity = 1;
      pager.innerHTML = "<b>" + String(+sc.getAttribute("data-page")).padStart(2, "0") +
                        "</b> / " + String(totalPages).padStart(2, "0");
    } else {
      pager.style.opacity = 0;
    }
  }

  if (reduced) master.timeScale(1e6);   // land on final states instantly

  /* ---------- playback UI (writes only when values change) ---------- */
  var fill = document.getElementById("t-fill");
  var tcur = document.getElementById("t-cur");
  var btnPlay = document.getElementById("btn-play");
  var lastSec = -1;

  function fmt(s) {
    s = Math.max(0, Math.floor(s));
    return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
  }
  var totalStr = fmt(TOTAL);

  master.eventCallback("onUpdate", function () {
    var p = master.progress();
    if (fill) gsap.set(fill, { scaleX: p });          // transform, not width
    var s = Math.floor(master.time());
    if (tcur && s !== lastSec) { lastSec = s; tcur.textContent = fmt(s) + " / " + totalStr; }
  });

  function play() { master.play(); if (btnPlay) btnPlay.textContent = "❘❘"; }
  function pause() { master.pause(); if (btnPlay) btnPlay.textContent = "▶"; }
  function toggle() { master.paused() ? play() : pause(); }
  function restart() { master.restart(); play(); }

  master.eventCallback("onComplete", function () { master.restart(); });   // seamless loop

  if (btnPlay) btnPlay.addEventListener("click", toggle);
  var btnReset = document.getElementById("btn-reset");
  if (btnReset) btnReset.addEventListener("click", restart);

  var track = document.getElementById("track");
  if (track) {
    var drag = false;
    var frac = function (e) {
      var r = track.getBoundingClientRect();
      var x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
      return Math.max(0, Math.min(1, x / r.width));
    };
    track.addEventListener("mousedown", function (e) { drag = true; master.progress(frac(e)); });
    window.addEventListener("mousemove", function (e) { if (drag) master.progress(frac(e)); });
    window.addEventListener("mouseup", function () { drag = false; });
  }

  document.addEventListener("keydown", function (e) {
    if (e.code === "Space") { e.preventDefault(); toggle(); }
    else if (e.key === "r" || e.key === "R") restart();
    else if (e.key === "h" || e.key === "H") hideUI(true);
    else if (e.key === "ArrowRight") master.time(Math.min(TOTAL, master.time() + 3));
    else if (e.key === "ArrowLeft") master.time(Math.max(0, master.time() - 3));
  });

  /* ---------- auto-hide UI so screen captures stay clean ---------- */
  var controls = document.querySelector(".controls");
  var hint = document.querySelector(".hint");
  var timer = null, forced = false;
  function showUI() {
    if (forced) return;
    if (controls) controls.classList.remove("hide");
    if (hint) hint.classList.remove("hide");
    clearTimeout(timer);
    timer = setTimeout(function () {
      if (controls) controls.classList.add("hide");
      if (hint) hint.classList.add("hide");
    }, 2600);
  }
  function hideUI(t) {
    forced = t ? !forced : forced;
    if (forced) {
      if (controls) controls.classList.add("hide");
      if (hint) hint.classList.add("hide");
    } else showUI();
  }
  window.addEventListener("mousemove", showUI);
  window.addEventListener("touchstart", showUI);

  /* ---------- export / scripting API ---------- */
  window.AIM = {
    tl: master,
    total: TOTAL,
    play: play, pause: pause, restart: restart,
    seek: function (s) { master.time(s); },

    /* Put the whole composition at an exact time. Used by
       render-frames.js for deterministic, judder-free export.
       Ambient loops are seeked too so nothing is frozen. */
    renderAt: function (s) {
      s = Math.max(0, Math.min(TOTAL - 0.0001, s));
      master.pause();
      ambient.pause();
      master.time(s, false);
      // totalTime so the repeating ambient timeline maps correctly
      ambient.totalTime(s, false);
      return s;
    },

    /* Freeze looping ambient motion and strip UI for export. */
    exportMode: function () {
      stage.classList.add("exporting");
      // display:none, not a fade — a CSS transition would still be
      // mid-flight when the first frames are captured.
      if (controls) controls.style.display = "none";
      if (hint) hint.style.display = "none";
      forced = true;
      clearTimeout(timer);
      gsap.globalTimeline.pause();
      return { total: TOTAL, scenes: scenes.length };
    }
  };

  /* ---------- go ---------- */
  master.progress(0).pause();
  setPager(scenes[0]);
  showUI();
  setTimeout(play, 350);
})();
