// Philadelphia 3D viewer.
//
// Streams tiles of the PHLCITY2 container by distance from the camera, builds
// meshes on the fly, and recomputes a cast-shadow field whenever the sun or
// the view moves far enough to matter.
'use strict';

const LOD = [
  { km: 1.6, minHeight: 0 },      // everything close in: the rowhouse fabric
  { km: 3.6, minHeight: 12 },     // mid field: anything that reads at distance
  { km: 9.0, minHeight: 25 },     // far field: the skyline only
];
const TRI_BUDGET = 3_200_000;
const SHADOW_SIZE = 1024;
const SHADOW_CELL = 12.0;

class Viewer {
  constructor(canvas, statusEl) {
    this.canvas = canvas;
    this.statusEl = statusEl;
    this.gl = createContext(canvas);
    if (!this.gl) throw new Error('WEBGL2_UNAVAILABLE');

    this.camera = new Camera({ target: [0, 0, 30], distance: 3200,
      azimuth: 232, elevation: 24 });
    this.city = null;
    this.tiles = new Map();          // "tx,ty" -> {vao, vbo, count, bounds}
    this.pending = new Set();
    this.triCount = 0;
    this.date = new Date(Date.UTC(2026, 7, 28, 22, 30));
    this.sun = { elevation: 20, azimuth: 262 };
    this.shadowDirty = true;
    this.shadowCentre = [1e9, 1e9];
    this.lastFrame = performance.now();
    this.frames = 0;
    this.fps = 0;
    this.needsRebuild = true;

    this.initGL();
    this.initInput();
  }

  status(msg) { if (this.statusEl) this.statusEl.textContent = msg; }

  initGL() {
    const gl = this.gl;
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    gl.frontFace(gl.CCW);
    gl.clearColor(0.05, 0.07, 0.12, 1);

    this.progCity = createProgram(gl, CITY_VS, CITY_FS, 'city');
    this.uCity = uniformMap(gl, this.progCity);
    this.progGround = createProgram(gl, GROUND_VS, GROUND_FS, 'ground');
    this.uGround = uniformMap(gl, this.progGround);
    this.progSky = createProgram(gl, SKY_VS, SKY_FS, 'sky');
    this.uSky = uniformMap(gl, this.progSky);

    const quad = new Float32Array([-1, -1, 3, -1, -1, 3]);
    this.skyVao = gl.createVertexArray();
    gl.bindVertexArray(this.skyVao);
    const sb = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sb);
    gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);
    const skyLoc = gl.getAttribLocation(this.progSky, 'aXY');
    gl.enableVertexAttribArray(skyLoc);
    gl.vertexAttribPointer(skyLoc, 2, gl.FLOAT, false, 0, 0);

    const G = 90000;
    this.groundVao = gl.createVertexArray();
    gl.bindVertexArray(this.groundVao);
    const gb = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, gb);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -G, -G, G, -G, G, G, -G, -G, G, G, -G, G]), gl.STATIC_DRAW);
    const gLoc = gl.getAttribLocation(this.progGround, 'aXY');
    gl.enableVertexAttribArray(gLoc);
    gl.vertexAttribPointer(gLoc, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);

    this.shadowTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.shadowTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, SHADOW_SIZE, SHADOW_SIZE, 0,
      gl.RED, gl.FLOAT, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    this.shadowGrid = new Float32Array(SHADOW_SIZE * SHADOW_SIZE);
    this.heightGrid = new Float32Array(SHADOW_SIZE * SHADOW_SIZE);
    this.shadowOrigin = [0, 0];

    this.mvp = M4.create();
    this.invMvp = M4.create();
    this.view = M4.create();
    this.proj = M4.create();
  }

  async load(url) {
    this.status('Loading the city…');
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
    const total = Number(res.headers.get('content-length')) || 0;
    const reader = res.body.getReader();
    const parts = [];
    let got = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      parts.push(value);
      got += value.length;
      if (total) this.status(`Loading the city… ${Math.round(100 * got / total)}%`);
    }
    const buf = new Uint8Array(got);
    let o = 0;
    for (const p of parts) { buf.set(p, o); o += p.length; }
    this.city = new PhlCity(buf.buffer, inflateBrowser);
    this.status(`${this.city.buildingCount.toLocaleString()} buildings`);
    this.setTime(this.date);
    return this.city;
  }

  setTime(date) {
    this.date = date;
    this.sun = sunPosition(date);
    this.shadowDirty = true;
  }

  lodFor(distKm) {
    for (const l of LOD) if (distKm <= l.km) return l.minHeight;
    return null;
  }

  // Decide which tiles should be resident, then load and drop to match.
  async updateTiles() {
    if (!this.city) return;
    const t = this.camera.target;
    const want = new Map();
    const ts = this.city.tileSize;
    for (const tile of this.city.tiles.values()) {
      const cx = (tile.tx + 0.5) * ts, cy = (tile.ty + 0.5) * ts;
      const d = Math.hypot(cx - t[0], cy - t[1]) / 1000;
      const minH = this.lodFor(d);
      if (minH === null) continue;
      want.set(`${tile.tx},${tile.ty}`, { tile, minH, d });
    }

    for (const [key, entry] of this.tiles) {
      if (!want.has(key) || want.get(key).minH !== entry.minH) {
        this.gl.deleteVertexArray(entry.vao);
        this.gl.deleteBuffer(entry.vbo);
        this.triCount -= entry.tris;
        this.tiles.delete(key);
      }
    }

    const todo = [...want.entries()]
      .filter(([k]) => !this.tiles.has(k) && !this.pending.has(k))
      .sort((a, b) => a[1].d - b[1].d);

    for (const [key, { tile, minH }] of todo) {
      if (this.triCount > TRI_BUDGET) break;
      this.pending.add(key);
      const decoded = await this.city.decode(tile.tx, tile.ty);
      this.pending.delete(key);
      if (!decoded) continue;
      const mesh = buildTileMesh(decoded,
        minH > 0 ? (i) => decoded.height[i] >= minH : null);
      if (mesh.vertexCount === 0) { this.tiles.set(key, { empty: true, minH, tris: 0 }); continue; }
      this.uploadTile(key, mesh, decoded, minH);
      this.shadowDirty = true;
    }
    this.status(`${this.tiles.size} tiles · ${this.triCount.toLocaleString()} triangles · ` +
      `${this.city.buildingCount.toLocaleString()} buildings in the dataset`);
  }

  uploadTile(key, mesh, decoded, minH) {
    const gl = this.gl;
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, mesh.data, gl.STATIC_DRAW);
    const stride = VERTEX_FLOATS * 4;
    const pos = gl.getAttribLocation(this.progCity, 'aPos');
    const hgt = gl.getAttribLocation(this.progCity, 'aHeight');
    const tk = gl.getAttribLocation(this.progCity, 'aTintKind');
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 3, gl.FLOAT, false, stride, 0);
    gl.enableVertexAttribArray(hgt);
    gl.vertexAttribPointer(hgt, 1, gl.FLOAT, false, stride, 12);
    gl.enableVertexAttribArray(tk);
    gl.vertexAttribPointer(tk, 1, gl.FLOAT, false, stride, 16);
    gl.bindVertexArray(null);

    let minx = Infinity, miny = Infinity, maxx = -Infinity, maxy = -Infinity, maxz = 0;
    for (let i = 0; i < decoded.total; i++) {
      if (decoded.x[i] < minx) minx = decoded.x[i];
      if (decoded.x[i] > maxx) maxx = decoded.x[i];
      if (decoded.y[i] < miny) miny = decoded.y[i];
      if (decoded.y[i] > maxy) maxy = decoded.y[i];
    }
    for (let i = 0; i < decoded.n; i++) {
      const top = decoded.base[i] + decoded.height[i];
      if (top > maxz) maxz = top;
    }
    this.tiles.set(key, { vao, vbo, count: mesh.vertexCount, tris: mesh.triCount,
      minH, decoded, bounds: [minx, miny, -30, maxx, maxy, maxz + 5] });
    this.triCount += mesh.triCount;
  }

  rebuildShadows() {
    const t = this.camera.target;
    const half = SHADOW_SIZE * SHADOW_CELL / 2;
    const ox = Math.round((t[0] - half) / SHADOW_CELL) * SHADOW_CELL;
    const oy = Math.round((t[1] - half) / SHADOW_CELL) * SHADOW_CELL;
    this.shadowOrigin = [ox, oy];
    this.heightGrid.fill(0);
    const tiles = [];
    for (const e of this.tiles.values()) if (e.decoded) tiles.push(e.decoded);
    rasterizeHeights(this.heightGrid, SHADOW_SIZE, SHADOW_SIZE,
      ox, oy, SHADOW_CELL, tiles);
    this.shadowGrid = shadowCeiling(this.heightGrid, SHADOW_SIZE, SHADOW_SIZE,
      SHADOW_CELL, Math.max(this.sun.elevation, 0.6), this.sun.azimuth);
    const gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, this.shadowTex);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, SHADOW_SIZE, SHADOW_SIZE,
      gl.RED, gl.FLOAT, this.shadowGrid);
    this.shadowDirty = false;
    this.shadowCentre = [t[0], t[1]];
  }

  skyColours() {
    const e = this.sun.elevation;
    const warm = Math.max(0, Math.min(1, 1 - e / 20));
    const night = Math.max(0, Math.min(1, -e / 8));
    // Night has to cool as it darkens. Scaling a warm sunset horizon toward
    // zero keeps it pink, which reads as permanent dusk.
    const dayHorizon = [0.72 * warm + 0.44 * (1 - warm),
      0.50 * warm + 0.53 * (1 - warm), 0.37 * warm + 0.66 * (1 - warm)];
    const nightHorizon = [0.055, 0.070, 0.115];
    const horizon = dayHorizon.map((v, i) => v * (1 - night) + nightHorizon[i] * night);
    const dayZenith = [0.055 + 0.05 * warm, 0.105 + 0.035 * warm, 0.300 - 0.05 * warm];
    const nightZenith = [0.012, 0.018, 0.045];
    const zenith = dayZenith.map((v, i) => v * (1 - night) + nightZenith[i] * night);
    const strength = Math.max(0, Math.min(1, (e + 4) / 14));
    const sun = [
      1.55 * strength * (0.55 + 0.45 * warm),
      1.30 * strength * (0.42 + 0.48 * (1 - warm * 0.55)),
      1.05 * strength * (0.30 + 0.60 * (1 - warm)),
    ];
    const sky = [(0.20 + 0.16 * (1 - night)) * (1 - night * 0.80),
      (0.26 + 0.16 * (1 - night)) * (1 - night * 0.80),
      (0.40 + 0.18 * (1 - night)) * (1 - night * 0.70)];
    return { horizon, zenith, sun, sky };
  }

  render(now) {
    const gl = this.gl;
    const dt = Math.min(0.1, (now - this.lastFrame) / 1000);
    this.lastFrame = now;
    this.camera.step(dt);

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.floor(this.canvas.clientWidth * dpr);
    const h = Math.floor(this.canvas.clientHeight * dpr);
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w; this.canvas.height = h;
    }
    gl.viewport(0, 0, w, h);

    const eye = this.camera.eye();
    const [near, far] = this.camera.clip();
    M4.perspective(this.proj, this.camera.fov * Math.PI / 180, w / h, near, far);
    M4.lookAt(this.view, eye, this.camera.target, [0, 0, 1]);
    M4.multiply(this.mvp, this.proj, this.view);

    if (Math.hypot(this.camera.target[0] - this.shadowCentre[0],
      this.camera.target[1] - this.shadowCentre[1]) > SHADOW_SIZE * SHADOW_CELL * 0.22) {
      this.shadowDirty = true;
    }
    if (this.shadowDirty) this.rebuildShadows();

    const c = this.skyColours();
    const sd = sunVector(this.sun.elevation, this.sun.azimuth);
    const fogDist = 16000 + this.camera.distance * 5.5;

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.disable(gl.DEPTH_TEST);
    gl.useProgram(this.progSky);
    gl.bindVertexArray(this.skyVao);
    gl.uniformMatrix4fv(this.uSky.uInvViewProj, false,
      M4.invert(this.invMvp, this.mvp) || this.mvp);
    gl.uniform3fv(this.uSky.uEye, eye);
    gl.uniform3fv(this.uSky.uZenith, c.zenith);
    gl.uniform3fv(this.uSky.uHorizon, c.horizon);
    gl.uniform3fv(this.uSky.uSunColor, c.sun);
    gl.uniform3fv(this.uSky.uSunDir, sd);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.enable(gl.DEPTH_TEST);

    const bindCommon = (u) => {
      gl.uniformMatrix4fv(u.uViewProj, false, this.mvp);
      gl.uniform3fv(u.uEye, eye);
      gl.uniform3fv(u.uSunDir, sd);
      gl.uniform3fv(u.uSunColor, c.sun);
      gl.uniform3fv(u.uSkyColor, c.sky);
      gl.uniform3fv(u.uHorizon, c.horizon);
      gl.uniform2fv(u.uShadowOrigin, this.shadowOrigin);
      gl.uniform1f(u.uShadowCell, SHADOW_CELL);
      gl.uniform1f(u.uShadowSize, SHADOW_SIZE);
      gl.uniform1f(u.uFogDist, fogDist);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.shadowTex);
      gl.uniform1i(u.uShadow, 0);
    };

    gl.useProgram(this.progGround);
    bindCommon(this.uGround);
    gl.bindVertexArray(this.groundVao);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    gl.useProgram(this.progCity);
    bindCommon(this.uCity);
    const planes = frustumPlanes(this.mvp);
    let drawn = 0;
    for (const e of this.tiles.values()) {
      if (e.empty) continue;
      const b = e.bounds;
      if (!boxInFrustum(planes, b[0], b[1], b[2], b[3], b[4], b[5])) continue;
      gl.bindVertexArray(e.vao);
      gl.drawArrays(gl.TRIANGLES, 0, e.count);
      drawn++;
    }
    gl.bindVertexArray(null);
    this.drawnTiles = drawn;

    this.frames++;
    if (!this._fpsAt || now - this._fpsAt > 500) {
      this.fps = Math.round(this.frames * 1000 / (now - (this._fpsAt || now - 500)));
      this._fpsAt = now; this.frames = 0;
    }
  }

  initInput() {
    const el = this.canvas;
    let dragging = null, lastX = 0, lastY = 0;

    el.addEventListener('pointerdown', (ev) => {
      el.setPointerCapture(ev.pointerId);
      dragging = (ev.button === 2 || ev.shiftKey) ? 'pan' : 'orbit';
      lastX = ev.clientX; lastY = ev.clientY;
    });
    el.addEventListener('pointermove', (ev) => {
      if (!dragging) return;
      const dx = ev.clientX - lastX, dy = ev.clientY - lastY;
      lastX = ev.clientX; lastY = ev.clientY;
      if (dragging === 'orbit') this.camera.orbit(-dx * 0.28, dy * 0.22);
      else this.camera.pan(dx, dy, el.clientHeight);
    });
    const end = (ev) => {
      dragging = null;
      if (el.hasPointerCapture?.(ev.pointerId)) el.releasePointerCapture(ev.pointerId);
      this.needsRebuild = true;
    };
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
    el.addEventListener('contextmenu', (ev) => ev.preventDefault());

    el.addEventListener('wheel', (ev) => {
      ev.preventDefault();
      this.camera.zoom(Math.exp(ev.deltaY * 0.0012));
      this.needsRebuild = true;
    }, { passive: false });

    // Keyboard: the whole viewer must be usable without a pointer.
    el.setAttribute('tabindex', '0');
    el.addEventListener('keydown', (ev) => {
      const step = ev.shiftKey ? 3 : 1;
      switch (ev.key) {
        case 'ArrowLeft':  this.camera.orbit(-6 * step, 0); break;
        case 'ArrowRight': this.camera.orbit(6 * step, 0); break;
        case 'ArrowUp':    this.camera.orbit(0, 4 * step); break;
        case 'ArrowDown':  this.camera.orbit(0, -4 * step); break;
        case '+': case '=': this.camera.zoom(0.82); break;
        case '-': case '_': this.camera.zoom(1.22); break;
        case 'w': this.camera.pan(0, 60 * step, el.clientHeight); break;
        case 's': this.camera.pan(0, -60 * step, el.clientHeight); break;
        case 'a': this.camera.pan(60 * step, 0, el.clientHeight); break;
        case 'd': this.camera.pan(-60 * step, 0, el.clientHeight); break;
        default: return;
      }
      ev.preventDefault();
      this.needsRebuild = true;
    });
  }
}

globalThis.Viewer = Viewer;
globalThis.LOD = LOD;
