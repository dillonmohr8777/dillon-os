/* ============================================================
   ALIGN IN MOTION — timeline driver
   Reads .scene elements (with data-dur seconds) inside #stage,
   plays them in order, scales the 1920x1080 stage to the window,
   and exposes play / pause / restart / scrub. UI auto-hides so
   the deck can be screen-recorded cleanly.
   ============================================================ */
(function () {
  "use strict";
  var stage = document.getElementById("stage");
  var wrap = document.getElementById("stage-wrap");
  if (!stage) return;

  var scenes = Array.prototype.slice.call(stage.querySelectorAll(".scene"));
  var pager = stage.querySelector(".pager");

  // build timeline
  var t = 0, tl = [];
  scenes.forEach(function (el) {
    var dur = parseFloat(el.getAttribute("data-dur")) || 8;
    tl.push({ el: el, start: t, dur: dur, end: t + dur });
    t += dur;
  });
  var TOTAL = t || 1;

  // total pages (scenes carrying a data-page)
  var totalPages = scenes.filter(function (s) { return s.hasAttribute("data-page"); }).length;

  /* ---- fit the fixed stage into the viewport ---- */
  function fit() {
    var s = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    stage.style.transform = "scale(" + s + ")";
  }
  window.addEventListener("resize", fit);
  fit();

  /* ---- playback state ---- */
  var elapsed = 0, playing = false, last = 0, curIdx = -1, raf = null;

  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function fmt(sec) {
    sec = Math.max(0, Math.floor(sec));
    return pad(Math.floor(sec / 60)) + ":" + pad(sec % 60);
  }

  var fill = document.getElementById("t-fill");
  var tcur = document.getElementById("t-cur");
  var btnPlay = document.getElementById("btn-play");

  function setScene(i) {
    if (i === curIdx) return;
    curIdx = i;
    scenes.forEach(function (el, k) { el.classList.toggle("active", k === i); });
    var sc = scenes[i];
    if (!sc) return;
    stage.classList.toggle("is-outro", sc.classList.contains("outro"));
    if (pager) {
      if (sc.hasAttribute("data-page")) {
        pager.style.display = "";
        pager.innerHTML = "<b>" + pad(+sc.getAttribute("data-page")) + "</b> / " + pad(totalPages);
      } else {
        pager.style.display = "none";
      }
    }
  }

  function indexAt(time) {
    for (var i = 0; i < tl.length; i++) if (time < tl[i].end) return i;
    return tl.length - 1;
  }

  function render() {
    setScene(indexAt(elapsed));
    if (fill) fill.style.width = (100 * elapsed / TOTAL).toFixed(3) + "%";
    if (tcur) tcur.textContent = fmt(elapsed) + " / " + fmt(TOTAL);
  }

  function tick(now) {
    if (!playing) return;
    if (!last) last = now;
    elapsed += (now - last) / 1000;
    last = now;
    if (elapsed >= TOTAL) { elapsed = 0; curIdx = -1; }   // loop
    render();
    raf = requestAnimationFrame(tick);
  }

  function play() {
    if (playing) return;
    playing = true; last = 0;
    if (btnPlay) btnPlay.textContent = "❘❘";
    raf = requestAnimationFrame(tick);
  }
  function pause() {
    playing = false;
    if (raf) cancelAnimationFrame(raf);
    if (btnPlay) btnPlay.textContent = "▶";
  }
  function toggle() { playing ? pause() : play(); }
  function restart() { elapsed = 0; curIdx = -1; render(); if (!playing) play(); }
  function seek(frac) {
    elapsed = Math.max(0, Math.min(0.999, frac)) * TOTAL;
    curIdx = -1; last = 0; render();
  }

  /* ---- controls ---- */
  if (btnPlay) btnPlay.addEventListener("click", toggle);
  var btnReset = document.getElementById("btn-reset");
  if (btnReset) btnReset.addEventListener("click", restart);

  var track = document.getElementById("track");
  if (track) {
    var drag = false;
    var toFrac = function (e) {
      var r = track.getBoundingClientRect();
      var x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
      return x / r.width;
    };
    track.addEventListener("mousedown", function (e) { drag = true; seek(toFrac(e)); });
    window.addEventListener("mousemove", function (e) { if (drag) seek(toFrac(e)); });
    window.addEventListener("mouseup", function () { drag = false; });
  }

  document.addEventListener("keydown", function (e) {
    if (e.code === "Space") { e.preventDefault(); toggle(); }
    else if (e.key === "r" || e.key === "R") restart();
    else if (e.key === "h" || e.key === "H") toggleUI(true);
    else if (e.key === "ArrowRight") seek((elapsed + 3) / TOTAL);
    else if (e.key === "ArrowLeft") seek((elapsed - 3) / TOTAL);
  });

  /* ---- auto-hide UI for clean recording ---- */
  var controls = document.querySelector(".controls");
  var hint = document.querySelector(".hint");
  var hideTimer = null, forcedHidden = false;
  function showUI() {
    if (forcedHidden) return;
    if (controls) controls.classList.remove("hide");
    if (hint) hint.classList.remove("hide");
    clearTimeout(hideTimer);
    hideTimer = setTimeout(function () {
      if (controls) controls.classList.add("hide");
      if (hint) hint.classList.add("hide");
    }, 2600);
  }
  function toggleUI(force) {
    forcedHidden = force ? !forcedHidden : forcedHidden;
    if (forcedHidden) {
      if (controls) controls.classList.add("hide");
      if (hint) hint.classList.add("hide");
    } else { showUI(); }
  }
  window.addEventListener("mousemove", showUI);
  window.addEventListener("touchstart", showUI);

  /* ---- scripting / export hook ---- */
  window.AIM = {
    play: play, pause: pause, restart: restart, total: TOTAL, scenes: scenes,
    seekTime: function (s) { seek(s / TOTAL); },
    seekFrac: seek,
    gotoScene: function (i) { pause(); curIdx = -1; elapsed = tl[i] ? tl[i].start : 0; setScene(i); }
  };

  /* ---- go ---- */
  render();
  showUI();
  // brief beat, then auto-play
  setTimeout(play, 500);
})();
