
(function () {
  "use strict";
  document.documentElement.classList.add("js");
  var reducedMq = window.matchMedia("(prefers-reduced-motion: reduce)");
  var reduced = reducedMq.matches;
  var fine = window.matchMedia("(pointer: fine)").matches;

  /* ---------- framerate-independent lerp ---------- */
  function elerp(cur, target, k, dt) {
    var a = 1 - Math.exp(-k * dt);
    var next = cur + (target - cur) * a;
    return Math.abs(target - next) < 0.0005 ? target : next;
  }

  /* ---------- loader (launch sequence) ---------- */
  var loader = document.getElementById("loader");
  var countEl = document.getElementById("load-count");
  var barEl = document.getElementById("load-bar");
  var checkEl = document.getElementById("load-check");
  var CHECKS = [
    [0,  "SIGNAL ......... LOCKED"],
    [30, "ROSTER ......... 8/8 ONLINE"],
    [60, "TRAJECTORY ..... PLOTTED"],
    [90, "CLEARANCE ...... <b>GO</b>"]
  ];
  var launchPulse = 0, pulseV = 0, booted = false;
  var bootMs = reduced ? 0 : 1300;
  var t0 = performance.now();
  function boot(now) {
    var p = bootMs ? Math.min(1, (now - t0) / bootMs) : 1;
    var eased = 1 - Math.pow(1 - p, 3);
    var v = Math.round(eased * 100);
    countEl.textContent = (v < 10 ? "00" : v < 100 ? "0" : "") + v;
    barEl.style.transform = "scaleX(" + eased + ")";
    for (var i = CHECKS.length - 1; i >= 0; i--) {
      if (v >= CHECKS[i][0]) { if (checkEl.dataset.k != i) { checkEl.dataset.k = i; checkEl.innerHTML = CHECKS[i][1]; } break; }
    }
    if (p < 1) { requestAnimationFrame(boot); }
    else {
      setTimeout(function () {
        loader.classList.add("done");
        launchPulse = 1;
        booted = true;
        document.body.classList.add("loaded");
      }, reduced ? 0 : 200);
    }
  }
  requestAnimationFrame(boot);

  /* ---------- nav ---------- */
  var nav = document.getElementById("nav");
  addEventListener("scroll", function () {
    nav.classList.toggle("scrolled", scrollY > 40);
  }, { passive: true });

  /* ---------- reveal ---------- */
  function decode(el) {
    if (reduced) return;
    var final = el.textContent, GLYPHS = "01/·|—×+", t0d = performance.now(), DUR = 600;
    el.setAttribute("aria-label", final);
    (function tick(now) {
      var p = Math.min(1, (now - t0d) / DUR);
      var solved = Math.floor(final.length * p), out = final.slice(0, solved);
      for (var i = solved; i < final.length; i++) {
        out += final[i] === " " ? " " : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      el.textContent = out;
      if (p < 1) requestAnimationFrame(tick);
    })(t0d);
  }
  function countUp(sec) {
    if (reduced) return;
    var specs = [[3145, function (v) { return Math.round(v).toLocaleString("en-US"); }],
                 [62,   function (v) { return "\u221262%"; }],
                 [4.1,  function (v) { return v.toFixed(1) + "\u00d7"; }]];
    sec.querySelectorAll(".result .big em").forEach(function (em, i) {
      var target = specs[i][0], fmt = specs[i][1], final = em.textContent;
      if (i === 1) { /* percentage animates its digits */ fmt = function (v) { return "\u2212" + Math.round(v) + "%"; }; }
      var t0c = performance.now(), DUR = 1200;
      (function tick(now) {
        var p = Math.min(1, (now - t0c) / DUR), eased = 1 - Math.pow(1 - p, 3);
        em.textContent = p < 1 ? fmt(target * eased) : final;
        if (p < 1) requestAnimationFrame(tick);
        else if (i === 0) { launchPulse = 1; pulseV = 4 / 6; }
      })(t0c);
    });
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        var idxEl = e.target.querySelector(".sec-head .idx");
        if (idxEl) decode(idxEl);
        if (e.target.id === "results") countUp(e.target);
        io.unobserve(e.target);
      }
    });
  }, { rootMargin: "0px 0px -12% 0px", threshold: 0.05 });
  document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });

  /* ---------- spine rail ---------- */
  var CFG = window.__SPINE || {};
  var ANCHORS = CFG.anchors || [".hero", "#agents", "#systems", "#method", "#results", "#pricing", "#faq", "#start"];
  var WPT_NAMES = CFG.wpts || ["DEPARTURE", "CREW DECK", "ENGINEERING", "NAV CHART", "TELEMETRY", "DOCKING", "COMMS", "IGNITION"];
  var V_TARGETS = CFG.vtargets || ANCHORS.map(function(_,i){return ANCHORS.length>1?i/(ANCHORS.length-1):0;});
  var rail = document.getElementById("rail");
  var railReadout = document.getElementById("rail-readout");
  var hudStage = document.getElementById("hud-stage");
  var ticks = [];
  ANCHORS.forEach(function (sel, i) {
    var b = document.createElement("button");
    b.className = "tick"; b.type = "button";
    b.setAttribute("aria-label", "Waypoint " + i + " — " + WPT_NAMES[i]);
    b.addEventListener("click", function () {
      var el = document.querySelector(sel);
      if (el) el.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
    });
    rail.insertBefore(b, railReadout);
    ticks.push(b);
    if (i < ANCHORS.length - 1) {
      var s = document.createElement("span"); s.className = "stem";
      rail.insertBefore(s, railReadout);
    }
  });

  /* section registry: scroll fractions per anchor, zero rect reads in rAF */
  var sFracs = new Array(ANCHORS.length).fill(0);
  function computeRegistry() {
    var max = document.documentElement.scrollHeight - innerHeight;
    ANCHORS.forEach(function (sel, i) {
      var el = document.querySelector(sel);
      if (!el || max <= 0) { sFracs[i] = i / (ANCHORS.length - 1); return; }
      sFracs[i] = Math.min(1, Math.max(0, (el.offsetTop + el.offsetHeight / 2 - innerHeight / 2) / max));
    });
    sFracs[0] = 0; sFracs[ANCHORS.length - 1] = Math.max(sFracs[ANCHORS.length - 1], 0.999);
  }
  computeRegistry();
  if (window.ResizeObserver) new ResizeObserver(function () { computeRegistry(); }).observe(document.body);

  function scrollToV(s) {
    if (s <= sFracs[0]) return V_TARGETS[0];
    for (var i = 0; i < sFracs.length - 1; i++) {
      if (s <= sFracs[i + 1]) {
        var t = (s - sFracs[i]) / Math.max(1e-5, sFracs[i + 1] - sFracs[i]);
        var sm = t * t * (3 - 2 * t);
        var tb = 0.5 * t + 0.5 * sm;
        return V_TARGETS[i] + (V_TARGETS[i + 1] - V_TARGETS[i]) * tb;
      }
    }
    return V_TARGETS[V_TARGETS.length - 1];
  }

  var activeTick = -1, lastStagePct = "";
  function updateHud(vCam) {
    var idx = 0;
    var s = (document.documentElement.scrollHeight - innerHeight) > 0 ? scrollY / (document.documentElement.scrollHeight - innerHeight) : 0;
    for (var i = 0; i < sFracs.length; i++) if (s >= sFracs[i] - 0.04) idx = i;
    var pct = (vCam * 100).toFixed(1);
    while (pct.length < 5) pct = "0" + pct;
    var padded = pct + "%";
    if (idx !== activeTick) {
      activeTick = idx;
      ticks.forEach(function (t, k) { t.classList.toggle("on", k === idx); });
      railReadout.innerHTML = "<em>WPT 0" + idx + " · " + WPT_NAMES[idx] + "</em> · STAGE <span id='rail-pct'>" + padded + "</span>";
      lastStagePct = pct;
      if (hudStage) hudStage.textContent = padded;
    } else if (pct !== lastStagePct) {
      lastStagePct = pct;
      var rp = document.getElementById("rail-pct");
      if (rp) rp.textContent = padded;
      if (hudStage) hudStage.textContent = padded;
    }
  }

  /* ---------- cursor state (rendered inside GL loop) ---------- */
  var dot = document.getElementById("cur-dot");
  var ring = document.getElementById("cur-ring");
  var mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
  var cursorOn = fine && !reduced;
  if (cursorOn) {
    document.documentElement.classList.add("customcur");
    addEventListener("mousemove", function (e) { mx = e.clientX; my = e.clientY; }, { passive: true });
    document.querySelectorAll("a, summary, button, .btn").forEach(function (el) {
      el.addEventListener("mouseenter", function () { ring.classList.add("hot"); });
      el.addEventListener("mouseleave", function () { ring.classList.remove("hot"); });
    });
  } else { dot.remove(); ring.remove(); }
  function renderCursor(dt) {
    if (!cursorOn) return;
    rx = elerp(rx, mx, 10, dt); ry = elerp(ry, my, 10, dt);
    dot.style.transform = "translate(" + mx + "px," + my + "px)";
    ring.style.transform = "translate(" + rx + "px," + ry + "px)";
  }

  /* ---------- card tilt (rect cached on enter, rAF-throttled) ---------- */
  if (fine && !reduced) {
    document.querySelectorAll(".tilt").forEach(function (card) {
      var rect = null, queued = false, ex = 0, ey = 0;
      card.addEventListener("mouseenter", function () { rect = card.getBoundingClientRect(); });
      card.addEventListener("mousemove", function (e) {
        ex = e.clientX; ey = e.clientY;
        if (queued || !rect) return;
        queued = true;
        requestAnimationFrame(function () {
          queued = false;
          var px = (ex - rect.left) / rect.width - 0.5;
          var py = (ey - rect.top) / rect.height - 0.5;
          card.style.transform = "perspective(700px) rotateY(" + (px * 7) + "deg) rotateX(" + (py * -7) + "deg)";
        });
      });
      card.addEventListener("mouseleave", function () { rect = null; card.style.transform = ""; });
    });
  }

  /* ---------- agent hover → GL crew highlight ---------- */
  var activeAgent = -1, actStr = 0;
  document.querySelectorAll(".agent[data-agent]").forEach(function (card) {
    card.addEventListener("mouseenter", function () { activeAgent = +card.dataset.agent; });
    card.addEventListener("mouseleave", function () { activeAgent = -1; });
  });
  /* CTA pre-burn */
  var burn = 0, burnTarget = 0;
  var ignite = document.getElementById("ignite");
  if (ignite) {
    ignite.addEventListener("mouseenter", function () { burnTarget = 1; });
    ignite.addEventListener("mouseleave", function () { burnTarget = 0; });
  }

  /* =================================================================
     WEBGL SPINE STAGE
     ================================================================= */
  var canvas = document.getElementById("stage");
  function staticFallback() {
    if (canvas.parentNode) canvas.remove();
    if (!document.querySelector(".stage-fallback")) {
      var fb = document.createElement("div");
      fb.className = "stage-fallback";
      document.body.insertBefore(fb, document.body.firstChild);
    }
    if (cursorOn) (function cl(prev) {
      requestAnimationFrame(function (now) { renderCursor(Math.min(0.05, (now - (prev || now)) / 1000) || 0.016); cl(now); });
    })();
  }
  var gl = !reduced && canvas.getContext("webgl", {
    antialias: false, alpha: false, depth: false, stencil: false,
    powerPreference: "low-power", failIfMajorPerformanceCaveat: true
  });
  if (!gl) { staticFallback(); return; }
  reducedMq.addEventListener && reducedMq.addEventListener("change", function (e) { if (e.matches) location.reload(); });

  function compile(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.error(gl.getShaderInfoLog(s)); return null; }
    return s;
  }
  function program(vs, fs) {
    var v = compile(gl.VERTEX_SHADER, vs), f = compile(gl.FRAGMENT_SHADER, fs);
    if (!v || !f) return null;
    var p = gl.createProgram();
    gl.attachShader(p, v); gl.attachShader(p, f); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) { console.error(gl.getProgramInfoLog(p)); return null; }
    return p;
  }

  /* ---- point shaders ---- */
  var POINT_VS = [
    "attribute vec3 aHome; attribute vec3 aScatter; attribute vec3 aMeta;",
    "uniform mat4 uProj; uniform mat4 uView;",
    "uniform float uTime, uMaxV, uFocusV, uVel, uPulse, uPulseV, uActive, uActStr, uBurn, uSizeMul, uMinPx, uAspect;",
    "uniform vec2 uMouse;",
    "varying vec3 vCol; varying float vA;",
    "void main(){",
    "  float v = aMeta.x; float rnd = aMeta.y; float role = aMeta.z;",
    "  float assemble = smoothstep(v - 0.10, v - 0.03, uMaxV);",
    "  vec3 pos = mix(aScatter, aHome, assemble);",
    "  float da = (1.0 - assemble) * 0.6 + 0.045;",
    "  pos += da * vec3(sin(uTime*0.7 + rnd*31.0), sin(uTime*0.55 + rnd*47.0), cos(uTime*0.62 + rnd*23.0)) * (0.3 + 0.7*rnd);",
    "  float isRing = step(0.5, role) * (1.0 - step(1.5, role));",
    "  float isStn  = step(1.5, role) * (1.0 - step(2.5, role));",
    "  float isDust = step(2.5, role);",
    "  float wGate = isStn * exp(-pow((v - 0.3333) * 22.0, 2.0));",
    "  pos.y += sin(pos.x*2.6 + uTime*0.9) * cos(pos.z*2.6 + uTime*0.7) * 0.22 * wGate;",
    "  float fGate = isStn * exp(-pow((v - 1.0) * 22.0, 2.0));",
    "  pos.xz *= 1.0 - fGate * uBurn * 0.25;",
    "  float lit = exp(-pow((v - uFocusV) * 40.0, 2.0)) * isRing;",
    "  float crew = isStn * exp(-pow((v - 0.16667) * 60.0, 2.0));",
    "  float sel = (1.0 - min(abs(floor(rnd * 8.0) - uActive), 1.0)) * step(-0.5, uActive);",
    "  float act = crew * sel * uActStr;",
    "  float dimOther = crew * (1.0 - sel) * uActStr;",
    "  vec4 clip = uProj * (uView * vec4(pos, 1.0));",
    "  vec2 sc = clip.xy / max(clip.w, 0.001);",
    "  vec2 d = sc - uMouse;",
    "  float dl = length(d);",
    "  if (dl > 0.0001) {",
    "    vec2 dc = d * vec2(uAspect, 1.0);",
    "    float f = exp(-dot(dc, dc) * 22.0);",
    "    clip.xy += (d / dl) * f * 0.14 * clip.w;",
    "  }",
    "  gl_Position = clip;",
    "  float w = max(clip.w, 0.4);",
    "  float fogB = exp(-max(0.0, w - 3.0) * 0.22);",
    "  float tw = 0.8 + 0.3 * sin(uTime*1.6 + rnd*40.0);",
    "  float bright = tw * fogB;",
    "  bright *= 1.0 + 1.6*lit + 1.2*act - 0.5*dimOther;",
    "  bright *= 1.0 + uPulse * exp(-pow((v - uPulseV) * 20.0, 2.0)) * 2.2;",
    "  bright *= 1.0 + isDust * uVel * 1.5 + fGate * uBurn * 0.9;",
    "  vec3 BLU = vec3(0.102, 0.373, 0.878);",
    "  vec3 TEA = vec3(0.098, 0.718, 0.612);",
    "  vec3 GRN = vec3(0.208, 0.816, 0.498);",
    "  vec3 col = mix(mix(BLU, TEA, clamp(v*2.0, 0.0, 1.0)), GRN, clamp(v*2.0 - 1.0, 0.0, 1.0));",
    "  float hero = isStn * exp(-pow(v * 30.0, 2.0));",
    "  col = mix(col, mix(GRN, BLU, step(pos.x, 0.0)), hero * 0.7);",
    "  col = mix(col, vec3(0.75, 0.85, 1.0), 0.5 * lit);",
    "  col = mix(col, vec3(0.95, 0.97, 1.0), 0.85 * step(0.96, rnd));",
    "  vCol = col;",
    "  vA = clamp(bright, 0.0, 2.2) * (0.35 + 0.65 * assemble);",
    "  float roleSz = 1.0 + 0.15 * (1.0 - min(role, 1.0)) - 0.25 * isDust;",
    "  float sz = uSizeMul * (0.9 + rnd*1.9) * roleSz * (1.0 + 0.8*lit + 0.6*act) / w;",
    "  gl_PointSize = max(sz, uMinPx);",
    "}"
  ].join("\n");

  var POINT_FS = [
    "precision mediump float;",
    "varying vec3 vCol; varying float vA;",
    "void main(){",
    "  float d = length(gl_PointCoord - 0.5) * 2.0;",
    "  float core = exp(-d*d*14.0);",
    "  float halo = 0.40 * exp(-d*d*3.2);",
    "  float a = (core + halo) * vA;",
    "  vec3 col = vCol * (1.0 + 0.9 * smoothstep(0.30, 0.0, d));",
    "  gl_FragColor = vec4(col * a, a);",
    "}"
  ].join("\n");

  /* ---- fullscreen shaders ---- */
  var QUAD_VS = "attribute vec2 aP; varying vec2 vUv; void main(){ vUv = aP*0.5+0.5; gl_Position = vec4(aP,0.0,1.0); }";
  var COMP_FS = [
    "precision mediump float; varying vec2 vUv;",
    "uniform sampler2D uBloom; uniform float uBloomOn, uStrength, uExposure;",
    "void main(){",
    "  vec3 top = vec3(0.018, 0.035, 0.070);",
    "  vec3 bot = vec3(0.006, 0.012, 0.028);",
    "  vec3 c = mix(bot, top, vUv.y);",
    "  vec2 p1 = vUv - vec2(0.25, 0.72); c += vec3(0.06, 0.14, 0.34) * 0.16 * exp(-dot(p1,p1)*5.0);",
    "  vec2 p2 = vUv - vec2(0.78, 0.28); c += vec3(0.08, 0.30, 0.18) * 0.13 * exp(-dot(p2,p2)*5.0);",
    "  vec3 bl = texture2D(uBloom, vUv).rgb * uStrength * uBloomOn;",
    "  c = mix(c + bl, 1.0 - exp(-(c + bl) * uExposure), uBloomOn);",
    "  float ign = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));",
    "  c += (ign - 0.5) * (1.5 / 255.0);",
    "  gl_FragColor = vec4(c, 1.0);",
    "}"
  ].join("\n");
  var KAWASE_DOWN_FS = [
    "precision mediump float; varying vec2 vUv;",
    "uniform sampler2D uTex; uniform vec2 uTexel; uniform float uOff;",
    "void main(){",
    "  vec2 hp = uTexel * uOff;",
    "  vec4 s = texture2D(uTex, vUv) * 4.0;",
    "  s += texture2D(uTex, vUv - hp);",
    "  s += texture2D(uTex, vUv + hp);",
    "  s += texture2D(uTex, vUv + vec2(hp.x, -hp.y));",
    "  s += texture2D(uTex, vUv - vec2(hp.x, -hp.y));",
    "  gl_FragColor = s / 8.0;",
    "}"
  ].join("\n");
  var KAWASE_UP_FS = [
    "precision mediump float; varying vec2 vUv;",
    "uniform sampler2D uTex; uniform vec2 uTexel; uniform float uOff;",
    "void main(){",
    "  vec2 hp = uTexel * uOff;",
    "  vec4 s = texture2D(uTex, vUv + vec2(-hp.x*2.0, 0.0));",
    "  s += texture2D(uTex, vUv + vec2(-hp.x, hp.y)) * 2.0;",
    "  s += texture2D(uTex, vUv + vec2(0.0, hp.y*2.0));",
    "  s += texture2D(uTex, vUv + vec2(hp.x, hp.y)) * 2.0;",
    "  s += texture2D(uTex, vUv + vec2(hp.x*2.0, 0.0));",
    "  s += texture2D(uTex, vUv + vec2(hp.x, -hp.y)) * 2.0;",
    "  s += texture2D(uTex, vUv + vec2(0.0, -hp.y*2.0));",
    "  s += texture2D(uTex, vUv + vec2(-hp.x, -hp.y)) * 2.0;",
    "  gl_FragColor = s / 12.0;",
    "}"
  ].join("\n");

  var progPoints = program(POINT_VS, POINT_FS);
  var progComp = program(QUAD_VS, COMP_FS);
  var progDown = program(QUAD_VS, KAWASE_DOWN_FS);
  var progUp = program(QUAD_VS, KAWASE_UP_FS);
  if (!progPoints || !progComp) { staticFallback(); return; }

  /* ---------- geometry: the spine world ---------- */
  var mobile = Math.min(innerWidth, innerHeight) < 700;
  var SCALE = mobile ? 0.51 : 1;
  var N_STR = Math.floor(3600 * SCALE), N_RING = Math.floor(180 * SCALE) * 7,
      N_STN = Math.floor(2700 * SCALE), N_DUST = Math.floor(640 * SCALE);
  var N = N_STR + N_RING + N_STN + N_DUST;
  var home = new Float32Array(N * 3), scat = new Float32Array(N * 3), meta = new Float32Array(N * 3);
  var TAU = Math.PI * 2;
  function C(v, out) { out[0] = 1.1 * Math.sin(TAU * 1.25 * v); out[1] = -44 * v; out[2] = 1.1 * Math.sin(TAU * v + 1.7); return out; }
  var c0 = [0, 0, 0], cT = [0, 0, 0];
  var idx = 0;
  function put(x, y, z, v, rnd, role, scatBig) {
    var j = idx * 3;
    home[j] = x; home[j + 1] = y; home[j + 2] = z;
    var mag = scatBig ? (2 + 4 * Math.random()) : 0.05;
    var th = Math.random() * TAU, ph = Math.acos(2 * Math.random() - 1);
    scat[j] = x + Math.sin(ph) * Math.cos(th) * mag;
    scat[j + 1] = y + Math.sin(ph) * Math.sin(th) * mag;
    scat[j + 2] = z + Math.cos(ph) * mag;
    meta[j] = v; meta[j + 1] = rnd; meta[j + 2] = role;
    idx++;
  }
  /* role 0 — triple-helix strands + chord rungs */
  var i, k, v, th2, rr;
  var nRung = Math.floor(N_STR * 0.08);
  for (i = 0; i < N_STR - nRung; i++) {
    v = (i + Math.random()) / (N_STR - nRung);
    th2 = TAU * 9 * v + (i % 3) * 2.094;
    rr = 0.34 + 0.05 * Math.random();
    C(v, c0);
    put(c0[0] + Math.cos(th2) * rr, c0[1], c0[2] + Math.sin(th2) * rr, v, Math.random(), 0, false);
  }
  for (i = 0; i < nRung; i++) {
    v = Math.floor(i / 4) / Math.floor(nRung / 4 || 1);
    var tChord = Math.random();
    th2 = TAU * 9 * v; rr = 0.36;
    var thB = th2 + 2.094;
    C(v, c0);
    var x1 = Math.cos(th2) * rr, z1 = Math.sin(th2) * rr, x2 = Math.cos(thB) * rr, z2 = Math.sin(thB) * rr;
    put(c0[0] + x1 + (x2 - x1) * tChord, c0[1], c0[2] + z1 + (z2 - z1) * tChord, v, Math.random(), 0, false);
  }
  /* role 1 — vertebra double rings at 7 stations */
  var perRing = Math.floor(180 * SCALE);
  for (k = 0; k < 7; k++) {
    var vk = k / 6; C(vk, c0);
    for (i = 0; i < perRing; i++) {
      var ringR = (i % 2 === 0 ? 0.85 : 1.15) + (Math.random() - 0.5) * 0.06;
      th2 = Math.random() * TAU;
      put(c0[0] + Math.cos(th2) * ringR, c0[1] + (Math.random() - 0.5) * 0.04, c0[2] + Math.sin(th2) * ringR, vk, Math.random(), 1, true);
    }
  }
  /* role 2 — station structures (hero gets a double-weight share) */
  var STN_W = [2.2, 1, 1, 1, 1, 1, 1], STN_WSUM = 8.2;
  var GA = Math.PI * (3 - Math.sqrt(5));
  for (k = 0; k < 7; k++) {
    var perStn = Math.floor(N_STN * STN_W[k] / STN_WSUM);
    var vs = k / 6; C(vs, c0);
    for (i = 0; i < perStn; i++) {
      var rnd2 = Math.random(), x = 0, y = 0, z = 0;
      if (k === 0) { /* fib sphere R1.55, blue/green hemispheres via shader */
        var yy = 1 - (i / (perStn - 1)) * 2, rad = Math.sqrt(Math.max(0, 1 - yy * yy)), t3 = GA * i;
        var R0 = 1.55 + (rnd2 - 0.5) * 0.1;
        x = Math.cos(t3) * rad * R0; y = yy * R0; z = Math.sin(t3) * rad * R0;
      } else if (k === 1) { /* 8 crew pods on orbit ring */
        var pod = i % 8;
        var pa = (pod / 8) * TAU;
        var cx = Math.cos(pa) * 1.7, cz = Math.sin(pa) * 1.7;
        var yy2 = 1 - ((i / 8) / Math.max(1, (perStn / 8) - 1)) * 2, rad2 = Math.sqrt(Math.max(0, 1 - yy2 * yy2)), t4 = GA * i;
        x = cx + Math.cos(t4) * rad2 * 0.22; y = yy2 * 0.22; z = cz + Math.sin(t4) * rad2 * 0.22;
        rnd2 = (pod + 0.5) / 8 + (Math.random() - 0.5) * 0.05; /* encode pod index for hover */
      } else if (k === 2) { /* wave grid deck */
        x = (Math.random() - 0.5) * 4.6; y = (Math.random() - 0.5) * 0.1; z = (Math.random() - 0.5) * 4.6;
      } else if (k === 3) { /* torus knot p2 q3, axis vertical, framed tube */
        var t5 = (i / perStn) * TAU;
        var kr = 0.95 + 0.42 * Math.cos(3 * t5);
        var kx = kr * Math.cos(2 * t5), ky = kr * Math.sin(2 * t5), kz = 0.42 * Math.sin(3 * t5);
        /* numeric tangent → normal/binormal frame */
        var e = 0.01;
        var kr2 = 0.95 + 0.42 * Math.cos(3 * (t5 + e));
        var tx = kr2 * Math.cos(2 * (t5 + e)) - kx, ty = kr2 * Math.sin(2 * (t5 + e)) - ky, tz = 0.42 * Math.sin(3 * (t5 + e)) - kz;
        var tl = Math.sqrt(tx * tx + ty * ty + tz * tz) || 1; tx /= tl; ty /= tl; tz /= tl;
        var nx = -kx, ny = -ky, nz = 0; var nl = Math.sqrt(nx * nx + ny * ny) || 1; nx /= nl; ny /= nl;
        var bx = ty * nz - tz * ny, by = tz * nx - tx * nz, bz = tx * ny - ty * nx;
        var tube = 0.14 * Math.random(), pa2 = Math.random() * TAU;
        var ox = Math.cos(pa2) * tube, oy = Math.sin(pa2) * tube;
        /* knot plane XY → world XZ (axis vertical) */
        x = (kx + nx * ox + bx * oy) * 1.15;
        z = (ky + ny * ox + by * oy) * 1.15;
        y = (kz + nz * ox + bz * oy) * 1.6;
      } else if (k === 4) { /* 3 tilted concentric rings */
        var ring3 = i % 3, r3 = [1.0, 1.4, 1.8][ring3], tilt = [0.5, -0.35, 0.2][ring3];
        th2 = Math.random() * TAU;
        var px = Math.cos(th2) * r3, pz = Math.sin(th2) * r3;
        x = px; y = pz * Math.sin(tilt) + (Math.random() - 0.5) * 0.04; z = pz * Math.cos(tilt);
      } else if (k === 5) { /* 3 docking pods */
        var pod2 = i % 3;
        var yy3 = 1 - ((i / 3) / Math.max(1, (perStn / 3) - 1)) * 2, rad3 = Math.sqrt(Math.max(0, 1 - yy3 * yy3)), t6 = GA * i;
        x = [-1.2, 0, 1.2][pod2] + Math.cos(t6) * rad3 * 0.3; y = yy3 * 0.3; z = Math.sin(t6) * rad3 * 0.3;
        if (pod2 === 0) rnd2 = Math.min(0.959, rnd2 + 0.25); /* lead pod brighter via twinkle bias */
      } else { /* k=6 vortex funnel, mouth up */
        var h = Math.random(), ang = h * 14 + Math.random() * 2;
        var fr = (0.25 + h * 1.7) * (0.85 + 0.3 * Math.random());
        x = Math.cos(ang) * fr; y = (h - 0.5) * 3.2; z = Math.sin(ang) * fr;
      }
      put(c0[0] + x, c0[1] + y, c0[2] + z, vs, rnd2, 2, true);
    }
  }
  /* role 3 — transit dust */
  for (i = 0; i < N_DUST; i++) {
    v = Math.random(); C(v, c0);
    var dr = 6 + Math.random() * 8; th2 = Math.random() * TAU;
    put(c0[0] + Math.cos(th2) * dr, c0[1] + (Math.random() - 0.5) * 3, c0[2] + Math.sin(th2) * dr, v, Math.random(), 3, false);
  }
  N = idx;
  /* shuffle draw order so any drawN prefix samples all roles uniformly */
  (function () {
    for (var a = N - 1; a > 0; a--) {
      var b = (Math.random() * (a + 1)) | 0;
      for (var c = 0; c < 3; c++) {
        var ja = a * 3 + c, jb = b * 3 + c, t2;
        t2 = home[ja]; home[ja] = home[jb]; home[jb] = t2;
        t2 = scat[ja]; scat[ja] = scat[jb]; scat[jb] = t2;
        t2 = meta[ja]; meta[ja] = meta[jb]; meta[jb] = t2;
      }
    }
  })();

  gl.useProgram(progPoints);
  function attach(name, data) {
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(progPoints, name);
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 3, gl.FLOAT, false, 0, 0);
    return buf;
  }
  var bufHome = attach("aHome", home), bufScat = attach("aScatter", scat), bufMeta = attach("aMeta", meta);
  function rebindPoints() {
    [["aHome", bufHome], ["aScatter", bufScat], ["aMeta", bufMeta]].forEach(function (p) {
      gl.bindBuffer(gl.ARRAY_BUFFER, p[1]);
      var loc = gl.getAttribLocation(progPoints, p[0]);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 3, gl.FLOAT, false, 0, 0);
    });
  }

  var quadBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  function bindQuad(prog) {
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
    var loc = gl.getAttribLocation(prog, "aP");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  }

  var U = {};
  ["uProj","uView","uTime","uMaxV","uFocusV","uVel","uPulse","uPulseV","uActive","uActStr","uBurn","uSizeMul","uMinPx","uAspect","uMouse"].forEach(function (n) {
    U[n] = gl.getUniformLocation(progPoints, n);
  });
  var UC = { uBloom: gl.getUniformLocation(progComp, "uBloom"), uBloomOn: gl.getUniformLocation(progComp, "uBloomOn"),
             uStrength: gl.getUniformLocation(progComp, "uStrength"), uExposure: gl.getUniformLocation(progComp, "uExposure") };
  var UD = progDown && { uTex: gl.getUniformLocation(progDown, "uTex"), uTexel: gl.getUniformLocation(progDown, "uTexel"), uOff: gl.getUniformLocation(progDown, "uOff") };
  var UU = progUp && { uTex: gl.getUniformLocation(progUp, "uTex"), uTexel: gl.getUniformLocation(progUp, "uTexel"), uOff: gl.getUniformLocation(progUp, "uOff") };

  /* ---------- FBOs (bloom, desktop only) ---------- */
  var bloomOn = fine && progDown && progUp;
  var fbos = null;
  function makeFBO(w, h) {
    var tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    var fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    var ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    if (!ok) { gl.deleteFramebuffer(fb); gl.deleteTexture(tex); return null; }
    return { fb: fb, tex: tex, w: w, h: h };
  }
  function allocFBOs() {
    if (fbos) { fbos.forEach(function (f) { if (f) { gl.deleteFramebuffer(f.fb); gl.deleteTexture(f.tex); } }); fbos = null; }
    if (!bloomOn) return;
    var qw = Math.max(2, canvas.width >> 2), qh = Math.max(2, canvas.height >> 2);
    fbos = [
      makeFBO(qw, qh), makeFBO(qw >> 1, qh >> 1), makeFBO(qw >> 2, qh >> 2),
      makeFBO(qw >> 1, qh >> 1), makeFBO(qw, qh)
    ];
    if (fbos.some(function (f) { return !f; })) { bloomOn = false; fbos = null; }
  }

  /* ---------- sizing ---------- */
  var coarse = !fine;
  var dpr = Math.min(devicePixelRatio || 1, coarse ? 1.5 : 2);
  var lastW = 0, lastH = 0, resizeTimer = 0;
  function doResize() {
    dpr = Math.min(devicePixelRatio || 1, coarse ? 1.5 : 2) * dprGov;
    canvas.width = Math.floor(innerWidth * dpr); canvas.height = Math.floor(innerHeight * dpr);
    lastW = innerWidth; lastH = innerHeight;
    allocFBOs();
    computeRegistry();
  }
  addEventListener("resize", function () {
    if (coarse && innerWidth === lastW && Math.abs(innerHeight - lastH) < 120) return;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(doResize, 200);
  });

  /* ---------- context loss ---------- */
  var contextLost = false;
  canvas.addEventListener("webglcontextlost", function (e) { e.preventDefault(); contextLost = true; });
  canvas.addEventListener("webglcontextrestored", function () { location.reload(); });

  /* ---------- matrices (preallocated) ---------- */
  var proj = new Float32Array(16), view = new Float32Array(16);
  var eye = [0, 0, 0], tgt = [0, 0, 0];
  function perspective(out, fov, asp, near, far) {
    var f = 1 / Math.tan(fov / 2), nf = 1 / (near - far);
    out[0] = f / asp; out[1] = 0; out[2] = 0; out[3] = 0;
    out[4] = 0; out[5] = f; out[6] = 0; out[7] = 0;
    out[8] = 0; out[9] = 0; out[10] = (far + near) * nf; out[11] = -1;
    out[12] = 0; out[13] = 0; out[14] = 2 * far * near * nf; out[15] = 0;
  }
  function lookAt(out, e, c) {
    var zx = e[0] - c[0], zy = e[1] - c[1], zz = e[2] - c[2];
    var zl = Math.sqrt(zx * zx + zy * zy + zz * zz) || 1; zx /= zl; zy /= zl; zz /= zl;
    /* up = (0,1,0) */
    var xx = -zz, xy2 = 0, xz = zx;
    var xl = Math.sqrt(xx * xx + xz * xz) || 1; xx /= xl; xz /= xl;
    var yx = zy * xz - zz * xy2, yy = zz * xx - zx * xz, yz = zx * xy2 - zy * xx;
    out[0] = xx; out[1] = yx; out[2] = zx; out[3] = 0;
    out[4] = xy2; out[5] = yy; out[6] = zy; out[7] = 0;
    out[8] = xz; out[9] = yz; out[10] = zz; out[11] = 0;
    out[12] = -(xx * e[0] + xy2 * e[1] + xz * e[2]);
    out[13] = -(yx * e[0] + yy * e[1] + yz * e[2]);
    out[14] = -(zx * e[0] + zy * e[1] + zz * e[2]);
    out[15] = 1;
  }

  /* ---------- render state ---------- */
  var vCam = 0, maxV = 0.02, smX = 0, smY = 0, mouseX = 0, mouseY = 0;
  var vel = 0, lastScrollY = scrollY, lastNow = performance.now();
  var lastInput = performance.now();
  var dprGov = 1, govStage = 0, frameCount = 0, deltas = [];
  var drawN = N;
  addEventListener("mousemove", function (e) {
    mouseX = (e.clientX / innerWidth) * 2 - 1;
    mouseY = -((e.clientY / innerHeight) * 2 - 1);
    lastInput = performance.now();
  }, { passive: true });
  addEventListener("scroll", function () { lastInput = performance.now(); }, { passive: true });
  addEventListener("touchstart", function () { lastInput = performance.now(); }, { passive: true });

  gl.disable(gl.DEPTH_TEST);
  doResize();

  var V_STATIONS = [0, 1/6, 2/6, 3/6, 4/6, 5/6, 1.0];
  var frameIdx = 0;

  function frame(now) {
    requestAnimationFrame(frame);
    if (contextLost) return;
    var dt = Math.min(0.05, (now - lastNow) / 1000) || 0.016;
    lastNow = now;
    frameIdx++;

    /* idle demotion: no input 4s → alternate ticks */
    if (now - lastInput > 4000 && (frameIdx & 1)) return;

    /* adaptive governor: first 60 frames post-load */
    if (govStage < 3 && booted) {
      deltas.push(dt * 1000);
      if (deltas.length >= 60) {
        deltas.sort(function (a, b) { return a - b; });
        var med = deltas[30];
        deltas = [];
        if (med > 20) {
          govStage++;
          if (govStage === 1) { dprGov = 1 / Math.min(devicePixelRatio || 1, 2); doResize(); }
          else if (govStage === 2) { bloomOn = false; allocFBOs(); }
          else { drawN = Math.floor(N / 2); }
        } else { govStage = 3; }
      }
    }

    /* smoothed signals */
    var max = document.documentElement.scrollHeight - innerHeight;
    var s = max > 0 ? scrollY / max : 0;
    var vTarget = scrollToV(s);
    vCam = elerp(vCam, vTarget, 8, dt);
    if (vCam > maxV) maxV = vCam;
    smX = elerp(smX, mouseX, 4, dt); smY = elerp(smY, mouseY, 4, dt);
    var vRaw = Math.min(3000, Math.abs((scrollY - lastScrollY) / Math.max(dt, 0.001)));
    lastScrollY = scrollY;
    vel = elerp(vel, vRaw / 3000, 5, dt);
    actStr = elerp(actStr, activeAgent >= 0 ? 1 : 0, 5, dt);
    burn = elerp(burn, burnTarget, 5, dt);
    if (launchPulse > 0) launchPulse = Math.max(0, launchPulse - dt / 1.2);

    /* camera along the spine */
    var t = now * 0.001;
    C(vCam, c0);
    var prox = 0;
    for (var si = 0; si < 7; si++) {
      var p = Math.exp(-Math.pow((vCam - V_STATIONS[si]) * 18, 2));
      if (p > prox) prox = p;
    }
    var rCam = 2.6 + 0.9 * prox;
    var phi = TAU * 1.75 * vCam + smX * 0.35 + t * 0.02;
    eye[0] = c0[0] + Math.cos(phi) * rCam;
    eye[1] = c0[1] + 0.4 + smY * 0.3;
    eye[2] = c0[2] + Math.sin(phi) * rCam;
    C(Math.min(1, vCam + 0.015), cT);
    tgt[0] = cT[0]; tgt[1] = cT[1]; tgt[2] = cT[2];
    var asp = canvas.width / canvas.height;
    perspective(proj, 1.0 + 0.25 * Math.min(1, vel * 2.5), asp, 0.1, 48);
    lookAt(view, eye, tgt);

    /* HUD */
    updateHud(vCam);
    renderCursor(dt);

    /* uniforms shared by both point passes */
    gl.useProgram(progPoints);
    gl.uniformMatrix4fv(U.uProj, false, proj);
    gl.uniformMatrix4fv(U.uView, false, view);
    gl.uniform1f(U.uTime, t);
    gl.uniform1f(U.uMaxV, maxV);
    gl.uniform1f(U.uFocusV, Math.min(1, vCam + 0.045));
    gl.uniform1f(U.uVel, vel);
    gl.uniform1f(U.uPulse, launchPulse);
    gl.uniform1f(U.uPulseV, pulseV);
    gl.uniform1f(U.uActive, activeAgent);
    gl.uniform1f(U.uActStr, actStr);
    gl.uniform1f(U.uBurn, burn);
    gl.uniform1f(U.uAspect, asp);
    gl.uniform2f(U.uMouse, smX, smY);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);

    if (bloomOn && fbos) {
      /* 1. points → quarter-res */
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbos[0].fb);
      gl.viewport(0, 0, fbos[0].w, fbos[0].h);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      rebindPoints();
      gl.uniform1f(U.uSizeMul, 7.5 * dpr * 0.25);
      gl.uniform1f(U.uMinPx, 1.5);
      gl.drawArrays(gl.POINTS, 0, drawN);
      /* 2. dual-Kawase chain */
      gl.disable(gl.BLEND);
      var chain = [[progDown, UD, 0, 1], [progDown, UD, 1, 2], [progUp, UU, 2, 3], [progUp, UU, 3, 4]];
      for (var ci = 0; ci < chain.length; ci++) {
        var prog = chain[ci][0], uu = chain[ci][1], srcF = fbos[chain[ci][2]], dstF = fbos[chain[ci][3]];
        gl.useProgram(prog);
        bindQuad(prog);
        gl.bindFramebuffer(gl.FRAMEBUFFER, dstF.fb);
        gl.viewport(0, 0, dstF.w, dstF.h);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, srcF.tex);
        gl.uniform1i(uu.uTex, 0);
        gl.uniform2f(uu.uTexel, 1 / srcF.w, 1 / srcF.h);
        gl.uniform1f(uu.uOff, 1.4);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      }
      /* 3. composite bg + bloom to canvas */
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(progComp);
      bindQuad(progComp);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, fbos[4].tex);
      gl.uniform1i(UC.uBloom, 0);
      gl.uniform1f(UC.uBloomOn, 1);
      gl.uniform1f(UC.uStrength, 1.15);
      gl.uniform1f(UC.uExposure, 1.5);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      /* 4. sharp points on top */
      gl.enable(gl.BLEND);
      gl.useProgram(progPoints);
      rebindPoints();
      gl.uniform1f(U.uSizeMul, 7.5 * dpr);
      gl.uniform1f(U.uMinPx, 0);
      gl.drawArrays(gl.POINTS, 0, drawN);
    } else {
      /* mobile tier: bg pass + points */
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.disable(gl.BLEND);
      gl.useProgram(progComp);
      bindQuad(progComp);
      gl.uniform1f(UC.uBloomOn, 0);
      gl.uniform1f(UC.uStrength, 0);
      gl.uniform1f(UC.uExposure, 1.5);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.enable(gl.BLEND);
      gl.useProgram(progPoints);
      rebindPoints();
      gl.uniform1f(U.uSizeMul, 7.5 * dpr);
      gl.uniform1f(U.uMinPx, 0);
      gl.drawArrays(gl.POINTS, 0, drawN);
    }
  }
  requestAnimationFrame(frame);
})();
