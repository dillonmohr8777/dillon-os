/* Haoqi craft runtime: scramble, glass hello, dither stickers, WebGL refraction. */
(function (global) {
  const BAYER = [
    [0, 32, 8, 40, 2, 34, 10, 42],
    [48, 16, 56, 24, 50, 18, 58, 26],
    [12, 44, 4, 36, 14, 46, 6, 38],
    [60, 28, 52, 20, 62, 30, 54, 22],
    [3, 35, 11, 43, 1, 33, 9, 41],
    [51, 19, 59, 27, 49, 17, 57, 25],
    [15, 47, 7, 39, 13, 45, 5, 37],
    [63, 31, 55, 23, 61, 29, 53, 21],
  ];

  const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789{}[]<>/*#";

  function reduced() {
    return global.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function pointerBus() {
    const state = { x: 0.62, y: 0.42, inside: false };
    const onMove = (e) => {
      const t = e.touches ? e.touches[0] : e;
      state.x = t.clientX / innerWidth;
      state.y = t.clientY / innerHeight;
      state.inside = true;
    };
    const off = () => { state.inside = false; };
    addEventListener("pointermove", onMove, { passive: true });
    addEventListener("touchmove", onMove, { passive: true });
    addEventListener("pointerleave", off);
    addEventListener("blur", off);
    return state;
  }

  function scramble(root) {
    const nodes = [...root.querySelectorAll("[data-scramble]")];
    nodes.forEach((el) => { el.dataset.final = el.textContent; });
    let tick = 0;
    const id = setInterval(() => {
      tick += 1;
      nodes.forEach((el, i) => {
        const final = el.dataset.final || "";
        const progress = Math.min(1, Math.max(0, (tick - i * 3) / 18));
        el.textContent = [...final].map((ch, n) => {
          if (ch === " " || ch === "." || ch === "," || ch === "'" || ch === "—") return ch;
          if (n / final.length < progress) return final[n];
          return GLYPHS[(tick + n + i) % GLYPHS.length];
        }).join("");
      });
      if (tick > 36) {
        nodes.forEach((el) => { el.textContent = el.dataset.final; });
        clearInterval(id);
      }
    }, 40);
  }

  function clock(el, city) {
    const paint = () => {
      const d = new Date();
      const hh = String(d.getHours()).padStart(2, "0");
      const mm = String(d.getMinutes()).padStart(2, "0");
      el.textContent = `${hh}:${mm}  ${city}`;
    };
    paint();
    setInterval(paint, 15000);
  }

  function ditherSprite(size, color, draw) {
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#fff";
    draw(ctx, size);
    const img = ctx.getImageData(0, 0, size, size);
    const [r, g, b] = color;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const i = (y * size + x) * 4;
        const a = img.data[i + 3];
        const t = BAYER[y % 8][x % 8] * 4;
        if (a < t + 20) {
          img.data[i + 3] = 0;
        } else {
          img.data[i] = r;
          img.data[i + 1] = g;
          img.data[i + 2] = b;
          img.data[i + 3] = 255;
        }
      }
    }
    ctx.putImageData(img, 0, 0);
    return c;
  }

  function makeStickers() {
    const heart = ditherSprite(72, [255, 92, 168], (ctx, s) => {
      ctx.beginPath();
      ctx.moveTo(s * 0.5, s * 0.78);
      ctx.bezierCurveTo(s * 0.1, s * 0.5, s * 0.18, s * 0.18, s * 0.5, s * 0.34);
      ctx.bezierCurveTo(s * 0.82, s * 0.18, s * 0.9, s * 0.5, s * 0.5, s * 0.78);
      ctx.fill();
    });
    const leaf = ditherSprite(64, [72, 196, 92], (ctx, s) => {
      ctx.beginPath();
      ctx.ellipse(s * 0.5, s * 0.5, s * 0.22, s * 0.38, 0.5, 0, Math.PI * 2);
      ctx.fill();
    });
    const smile = ditherSprite(58, [255, 208, 48], (ctx, s) => {
      ctx.beginPath();
      ctx.arc(s * 0.5, s * 0.5, s * 0.32, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(s * 0.4, s * 0.44, s * 0.04, 0, Math.PI * 2);
      ctx.arc(s * 0.6, s * 0.44, s * 0.04, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#000";
      ctx.beginPath();
      ctx.arc(s * 0.5, s * 0.5, s * 0.16, 0.2, Math.PI - 0.2);
      ctx.stroke();
    });
    const head = ditherSprite(60, [40, 40, 44], (ctx, s) => {
      ctx.fillRect(s * 0.28, s * 0.22, s * 0.44, s * 0.36);
      ctx.fillRect(s * 0.36, s * 0.56, s * 0.28, s * 0.18);
    });
    const zig = ditherSprite(70, [64, 140, 255], (ctx, s) => {
      ctx.lineWidth = 7;
      ctx.strokeStyle = "#fff";
      ctx.beginPath();
      ctx.moveTo(s * 0.18, s * 0.7);
      ctx.lineTo(s * 0.4, s * 0.28);
      ctx.lineTo(s * 0.58, s * 0.62);
      ctx.lineTo(s * 0.82, s * 0.24);
      ctx.stroke();
    });
    return [
      { img: heart, x: 0.72, y: 0.58, s: 0.11, vx: 0.00004, vy: -0.00003 },
      { img: leaf, x: 0.12, y: 0.28, s: 0.09, vx: -0.00003, vy: 0.00004 },
      { img: smile, x: 0.82, y: 0.22, s: 0.08, vx: 0.00002, vy: 0.00003 },
      { img: head, x: 0.18, y: 0.62, s: 0.08, vx: -0.00002, vy: -0.00002 },
      { img: zig, x: 0.58, y: 0.18, s: 0.1, vx: 0.00003, vy: -0.00004 },
    ];
  }

  function drawHello(ctx, w, h, word, ptr, t) {
    const x = w * 0.54 + (ptr.x - 0.5) * 28;
    const y = h * 0.40 + (ptr.y - 0.5) * 16;
    const size = Math.min(w, h) * 0.30;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-0.1 + Math.sin(t * 0.0004) * 0.02);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `700 ${size}px Pacifico, cursive`;

    ctx.fillStyle = "rgba(255,50,90,0.32)";
    ctx.fillText(word, -4, 3);
    ctx.fillStyle = "rgba(40,90,255,0.32)";
    ctx.fillText(word, 4, -2);

    const g = ctx.createLinearGradient(-size, -size * 0.4, size, size * 0.6);
    g.addColorStop(0, getComputedStyle(document.documentElement).getPropertyValue("--glass-a").trim() || "#7ec8ff");
    g.addColorStop(0.45, getComputedStyle(document.documentElement).getPropertyValue("--glass-b").trim() || "#1d6fe8");
    g.addColorStop(1, getComputedStyle(document.documentElement).getPropertyValue("--glass-c").trim() || "#0a3fa8");
    ctx.shadowColor = "rgba(20,80,200,0.4)";
    ctx.shadowBlur = 34;
    ctx.fillStyle = g;
    ctx.fillText(word, 0, 0);

    ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(255,255,255,0.62)";
    ctx.lineWidth = Math.max(1.5, size * 0.018);
    ctx.strokeText(word, -size * 0.012, -size * 0.02);

    const angle = Math.atan2(0.5 - ptr.y, ptr.x - 0.5);
    const rimX = Math.cos(angle) * size * 0.22;
    const rimY = Math.sin(angle) * size * 0.12;
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.beginPath();
    ctx.ellipse(rimX, rimY - size * 0.08, size * 0.08, size * 0.03, angle, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return { x, y, size };
  }

  function drawPointer(ctx, hello, ptr) {
    const px = hello.x + hello.size * 0.42;
    const py = hello.y + hello.size * 0.28;
    ctx.save();
    ctx.translate(px + (ptr.x - 0.5) * 10, py + (ptr.y - 0.5) * 8);
    ctx.rotate(-0.7);
    const g = ctx.createLinearGradient(-8, -8, 28, 28);
    g.addColorStop(0, "#9ad4ff");
    g.addColorStop(1, "#1558c8");
    ctx.fillStyle = g;
    ctx.shadowColor = "rgba(20,80,200,0.35)";
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(34, 14);
    ctx.lineTo(16, 16);
    ctx.lineTo(18, 34);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawSparkles(ctx, w, h, t) {
    ctx.fillStyle = "#fff";
    for (let i = 0; i < 14; i++) {
      const seed = Math.sin(i * 12.9898 + t * 0.001) * 43758.5453;
      const flicker = (seed - Math.floor(seed));
      if (flicker < 0.55) continue;
      const x = (Math.sin(i * 3.1 + t * 0.0003) * 0.5 + 0.5) * w * 0.7 + w * 0.15;
      const y = (Math.cos(i * 2.4 + t * 0.00025) * 0.5 + 0.5) * h * 0.45 + h * 0.18;
      const s = 0.8 + flicker * 1.8;
      ctx.fillRect(x, y, s, s);
    }
  }

  function createGL(glCanvas, srcCanvas) {
    const gl = glCanvas.getContext("webgl", { premultipliedAlpha: false, alpha: true });
    if (!gl) return null;
    const vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs, "attribute vec2 a; varying vec2 v; void main(){ v=(a+1.0)*0.5; v.y=1.0-v.y; gl_Position=vec4(a,0,1); }");
    gl.compileShader(vs);
    const fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fs, [
      "precision highp float;",
      "varying vec2 v;",
      "uniform sampler2D uTex;",
      "uniform vec2 uRes;",
      "uniform vec2 uPtr;",
      "uniform float uTime;",
      "void main(){",
      " vec2 uv=v;",
      " vec2 p=(uv-uPtr)*vec2(uRes.x/uRes.y,1.0);",
      " float d=length(p);",
      " float bulge=exp(-d*7.5)*0.045;",
      " vec2 dir=normalize(p+1e-4);",
      " vec2 r=uv-dir*bulge*1.25;",
      " vec2 g=uv-dir*bulge;",
      " vec2 b=uv-dir*bulge*0.65;",
      " vec3 col=vec3(texture2D(uTex,r).r, texture2D(uTex,g).g, texture2D(uTex,b).b);",
      " float luma=dot(col,vec3(0.2126,0.7152,0.0722));",
      " float n=fract(sin(dot(uv*uRes+uTime, vec2(12.9898,78.233)))*43758.5453);",
      " if(luma>0.82 && n>0.975) col+=vec3(0.85);",
      " gl_FragColor=vec4(col, texture2D(uTex,uv).a);",
      "}",
    ].join("\n"));
    gl.compileShader(fs);
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "a");
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return function draw(ptr, time) {
      glCanvas.width = srcCanvas.width;
      glCanvas.height = srcCanvas.height;
      gl.viewport(0, 0, glCanvas.width, glCanvas.height);
      gl.useProgram(prog);
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, srcCanvas);
      gl.uniform1i(gl.getUniformLocation(prog, "uTex"), 0);
      gl.uniform2f(gl.getUniformLocation(prog, "uRes"), glCanvas.width, glCanvas.height);
      gl.uniform2f(gl.getUniformLocation(prog, "uPtr"), ptr.x, 1 - ptr.y);
      gl.uniform1f(gl.getUniformLocation(prog, "uTime"), time);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
  }

  function bootLoader(el) {
    const bar = el.querySelector(".load-bar");
    let w = 8;
    const id = setInterval(() => {
      w = Math.min(100, w + (100 - w) * 0.18 + 4);
      bar.style.width = w + "%";
      if (w > 98) {
        clearInterval(id);
        el.classList.add("is-done");
      }
    }, 40);
    addEventListener("load", () => { w = 100; });
  }

  function mount(opts) {
    document.documentElement.classList.remove("no-js");
    document.body.classList.add("js");
    const word = opts.word || "hello";
    const city = opts.cityMeta || "26°C";
    const stage = document.getElementById("stage");
    const glCanvas = document.getElementById("gl");
    const load = document.querySelector(".load");
    const meta = document.getElementById("meta");
    const readout = document.getElementById("readout");
    const menuBtn = document.querySelector(".menu-btn");
    const overlay = document.querySelector(".overlay");
    if (load) bootLoader(load);
    if (meta) clock(meta, city);
    if (!reduced()) scramble(document);

    const ptr = pointerBus();
    const stickers = makeStickers();
    const ctx = stage.getContext("2d");
    let glDraw = null;
    try { glDraw = createGL(glCanvas, stage); } catch { glDraw = null; }

    const loop = (t) => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      stage.width = innerWidth * dpr;
      stage.height = innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      stickers.forEach((s) => {
        if (!reduced()) {
          s.x += s.vx;
          s.y += s.vy;
          if (s.x < 0.04 || s.x > 0.92) s.vx *= -1;
          if (s.y < 0.08 || s.y > 0.78) s.vy *= -1;
        }
        const size = Math.min(innerWidth, innerHeight) * s.s;
        ctx.drawImage(s.img, s.x * innerWidth, s.y * innerHeight, size, size);
      });
      const fade = reduced() ? 1 : Math.max(0, 1 - (scrollY || 0) / (innerHeight * 0.85));
      ctx.globalAlpha = fade;
      const hello = drawHello(ctx, innerWidth, innerHeight, word, ptr, t);
      drawPointer(ctx, hello, ptr);
      drawSparkles(ctx, innerWidth, innerHeight, t);
      ctx.globalAlpha = 1;
      if (glDraw && !reduced() && fade > 0.05) {
        glCanvas.style.opacity = String(fade);
        glDraw(ptr, t * 0.001);
      } else if (glCanvas) {
        glCanvas.style.opacity = "0";
      }
      if (readout) {
        const x = String(Math.round(ptr.x * 1000)).padStart(4, "0");
        const y = String(Math.round(ptr.y * 1000)).padStart(4, "0");
        readout.textContent = `${new Date().toISOString().slice(11, 16)}  ${x} X  ${y} Y`;
      }
      requestAnimationFrame(loop);
    };
    const startLoop = () => requestAnimationFrame(loop);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(startLoop);
    else startLoop();
    if (menuBtn && overlay) {
      menuBtn.addEventListener("click", () => {
        const open = overlay.classList.toggle("is-open");
        overlay.hidden = !open;
        menuBtn.setAttribute("aria-expanded", String(open));
      });
      overlay.querySelectorAll("a").forEach((a) => {
        a.addEventListener("click", () => {
          overlay.classList.remove("is-open");
          overlay.hidden = true;
        });
      });
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); });
    }, { threshold: 0.16 });
    document.querySelectorAll(".reveal").forEach((n) => io.observe(n));
  }

  global.HaoqiCraft = { mount };
})(window);
