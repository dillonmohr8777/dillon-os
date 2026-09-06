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
    this.terrain = null;             // see terrain.js; null means a flat city
    this.crowns = new Map();         // objectid -> crown entry, see crowns.js
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

    // Walk mode
    this.mode = 'orbit';
    this.collider = new Collider();
    this.player = new Player({
      x: 380, y: -70, yaw: Math.PI * 1.5,        // Market St, looking west
      reducedMotion: typeof matchMedia === 'function'
        && matchMedia('(prefers-reduced-motion: reduce)').matches,
    });
    this.keys = Object.create(null);
    this.pointerLocked = false;

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
    this.progWater = createProgram(gl, WATER_VS, WATER_FS, 'water');
    this.uWater = uniformMap(gl, this.progWater);
    this.waterCount = 0;
    this.progDetail = createProgram(gl, DETAIL_VS, DETAIL_FS, 'detail');
    this.uDetail = uniformMap(gl, this.progDetail);
    this.detailCount = 0;
    this.progBeam = createProgram(gl, BEAM_VS, BEAM_FS, 'beam');
    this.uBeam = uniformMap(gl, this.progBeam);
    this.beamCount = 0;
    this.showPins = true;

    const quad = new Float32Array([-1, -1, 3, -1, -1, 3]);
    this.skyVao = gl.createVertexArray();
    gl.bindVertexArray(this.skyVao);
    const sb = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sb);
    gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);
    const skyLoc = gl.getAttribLocation(this.progSky, 'aXY');
    gl.enableVertexAttribArray(skyLoc);
    gl.vertexAttribPointer(skyLoc, 2, gl.FLOAT, false, 0, 0);

    // The ground used to be two triangles, which is all a flat plane needs.
    // It carries terrain now, so it has to be tessellated: a 96 x 96 grid in
    // unit space, warped toward the camera in the vertex shader.
    const G = 96;
    const grid = new Float32Array(G * G * 12);
    let gi = 0;
    for (let j = 0; j < G; j++) {
      for (let i = 0; i < G; i++) {
        const u0 = (i / G) * 2 - 1, u1 = ((i + 1) / G) * 2 - 1;
        const v0 = (j / G) * 2 - 1, v1 = ((j + 1) / G) * 2 - 1;
        grid[gi++] = u0; grid[gi++] = v0;
        grid[gi++] = u1; grid[gi++] = v0;
        grid[gi++] = u1; grid[gi++] = v1;
        grid[gi++] = u0; grid[gi++] = v0;
        grid[gi++] = u1; grid[gi++] = v1;
        grid[gi++] = u0; grid[gi++] = v1;
      }
    }
    this.groundVerts = gi / 2;
    this.groundVao = gl.createVertexArray();
    gl.bindVertexArray(this.groundVao);
    const gb = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, gb);
    gl.bufferData(gl.ARRAY_BUFFER, grid, gl.STATIC_DRAW);
    const gLoc = gl.getAttribLocation(this.progGround, 'aXY');
    gl.enableVertexAttribArray(gLoc);
    gl.vertexAttribPointer(gLoc, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);

    // A 1x1 flat texture so the terrain lookup is valid before the real height
    // field arrives, and stays valid if it never does.
    this.terrainTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.terrainTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, 1, 1, 0, gl.RED, gl.FLOAT,
      new Float32Array([0]));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    this.terrainRect = [0, 0, 1];
    this.terrainSize = [1, 1];

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

  // The terrain the city stands on. Optional: without it the ground is a plane
  // at z = 0 and Center City floats twelve metres above it, which is the bug
  // this file exists to fix, so a failure here is warned about rather than
  // swallowed.
  async loadTerrain(url) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = new Uint8Array(await res.arrayBuffer());
      const t = new Terrain(buf.buffer.slice(buf.byteOffset,
        buf.byteOffset + buf.byteLength));
      const heights = t.decode(await inflateBrowser(buf.subarray(t.payloadOffset)));
      const gl = this.gl;
      gl.bindTexture(gl.TEXTURE_2D, this.terrainTex);
      gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, t.nx, t.ny, 0,
        gl.RED, gl.FLOAT, heights);
      this.terrain = t;
      this.terrainRect = [t.x0, t.y0, t.cell];
      this.terrainSize = [t.nx, t.ny];
      this.player.groundZ = t.heightAt(this.player.x, this.player.y);
      return t;
    } catch (err) {
      console.warn('terrain unavailable, the city will sit on a flat plane:',
        err.message);
      return null;
    }
  }

  // The crown table: skyline the LiDAR survey cannot see. Optional. The city
  // renders correctly without it, just with flat-topped towers.
  async loadCrowns(url) {
    try {
      const res = await fetch(url);
      if (!res.ok) return 0;
      this.crowns = indexCrowns(await res.json());
    } catch (err) {
      this.crowns = new Map();
    }
    return this.crowns.size;
  }

  // Parks and street centrelines, one flat inlay just above the ground plane.
  async loadGround(url) {
    try {
      const res = await fetch(url);
      if (!res.ok) return;
      const buf = new Uint8Array(await res.arrayBuffer());
      const dv = new DataView(buf.buffer);
      let magic = '';
      for (let i = 0; i < 8; i++) magic += String.fromCharCode(dv.getUint8(i));
      if (magic !== 'PHLGRND1') throw new Error(`bad ground magic: ${magic}`);
      const raw = await inflateBrowser(buf.subarray(16));
      const rv = new DataView(raw.buffer, raw.byteOffset, raw.byteLength);
      const n = rv.getUint32(0, true);
      const data = new Float32Array(n * 9);
      for (let i = 0; i < n * 9; i++) data[i] = rv.getFloat32(4 + i * 4, true);

      const gl = this.gl;
      this.detailVao = gl.createVertexArray();
      gl.bindVertexArray(this.detailVao);
      const vb = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vb);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(this.progDetail, 'aXYK');
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 3, gl.FLOAT, false, 0, 0);
      gl.bindVertexArray(null);
      this.detailCount = n * 3;
    } catch (err) {
      console.warn('ground detail unavailable:', err.message);
      this.detailCount = 0;
    }
  }

  // Water arrives as a flat triangle soup: 7,000 triangles is small enough
  // that an index buffer would cost more than it saves.
  async loadWater(url) {
    try {
      const res = await fetch(url);
      if (!res.ok) return;
      const buf = new Uint8Array(await res.arrayBuffer());
      const dv = new DataView(buf.buffer);
      let magic = '';
      for (let i = 0; i < 8; i++) magic += String.fromCharCode(dv.getUint8(i));
      if (magic !== 'PHLWATR1') throw new Error(`bad water magic: ${magic}`);
      const triCount = dv.getUint32(12, true);
      this.waterZ = dv.getFloat32(16, true);
      const raw = await inflateBrowser(buf.subarray(20));
      const rv = new DataView(raw.buffer, raw.byteOffset, raw.byteLength);
      const n = rv.getUint32(0, true);
      const xy = new Float32Array(n * 6);
      for (let i = 0; i < n * 6; i++) xy[i] = rv.getFloat32(4 + i * 4, true);

      const gl = this.gl;
      this.waterVao = gl.createVertexArray();
      gl.bindVertexArray(this.waterVao);
      const vb = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vb);
      gl.bufferData(gl.ARRAY_BUFFER, xy, gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(this.progWater, 'aXY');
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      gl.bindVertexArray(null);
      this.waterCount = n * 3;
      if (n !== triCount) console.warn(`water triangle count ${n} != header ${triCount}`);
    } catch (err) {
      console.warn('water layer unavailable:', err.message);
      this.waterCount = 0;
    }
  }

  attachProspects(prospects) {
    this.prospects = prospects;
    const gl = this.gl;
    this.beamVao = gl.createVertexArray();
    gl.bindVertexArray(this.beamVao);
    const vb = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vb);
    gl.bufferData(gl.ARRAY_BUFFER, prospects.beamData, gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(this.progBeam, 'aPosSide');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 4, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);
    this.beamCount = prospects.beamCount;
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
    const t = this.mode === 'walk'
      ? [this.player.x, this.player.y, this.player.groundZ]
      : this.camera.target;
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
        if (entry.crownVao) {
          this.gl.deleteVertexArray(entry.crownVao);
          this.gl.deleteBuffer(entry.crownVbo);
        }
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

  // One city-format VAO: position, height, packed tint/kind.
  cityVao(data) {
    const gl = this.gl;
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    const stride = VERTEX_FLOATS * 4;
    const pos = gl.getAttribLocation(this.progCity, 'aPos');
    const hgt = gl.getAttribLocation(this.progCity, 'aHeight');
    const top = gl.getAttribLocation(this.progCity, 'aTop');
    const tk = gl.getAttribLocation(this.progCity, 'aTintKind');
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 3, gl.FLOAT, false, stride, 0);
    gl.enableVertexAttribArray(hgt);
    gl.vertexAttribPointer(hgt, 1, gl.FLOAT, false, stride, 12);
    gl.enableVertexAttribArray(top);
    gl.vertexAttribPointer(top, 1, gl.FLOAT, false, stride, 16);
    gl.enableVertexAttribArray(tk);
    gl.vertexAttribPointer(tk, 1, gl.FLOAT, false, stride, 20);
    gl.bindVertexArray(null);
    return { vao, vbo };
  }

  uploadTile(key, mesh, decoded, minH) {
    const { vao, vbo } = this.cityVao(mesh.data);

    // Crowns ride with the tile they belong to so they are evicted with it.
    // They ignore the LOD height filter: a spire is the whole reason its
    // building is worth drawing from three kilometres away.
    let crownVao = null, crownVbo = null, crownCount = 0, crownTris = 0;
    let crownTile = null;
    const crowned = buildCrownTile(decoded, this.crowns);
    if (crowned) {
      const cm = buildTileMesh(crowned, null);
      if (cm.vertexCount) {
        const b = this.cityVao(cm.data);
        crownVao = b.vao; crownVbo = b.vbo;
        crownCount = cm.vertexCount; crownTris = cm.triCount;
        crownTile = crowned;
      }
    }

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
    if (crownTile) {
      for (let i = 0; i < crownTile.n; i++) {
        const top = crownTile.base[i] + crownTile.height[i];
        if (top > maxz) maxz = top;
      }
    }
    this.collider.addTile(decoded);
    this.tiles.set(key, { vao, vbo, count: mesh.vertexCount,
      tris: mesh.triCount + crownTris,
      crownVao, crownVbo, crownCount, crownTile,
      minH, decoded, bounds: [minx, miny, -30, maxx, maxy, maxz + 5] });
    this.triCount += mesh.triCount + crownTris;
  }

  rebuildShadows() {
    const t = this.mode === 'walk'
      ? [this.player.x, this.player.y, 0] : this.camera.target;
    const half = SHADOW_SIZE * SHADOW_CELL / 2;
    const ox = Math.round((t[0] - half) / SHADOW_CELL) * SHADOW_CELL;
    const oy = Math.round((t[1] - half) / SHADOW_CELL) * SHADOW_CELL;
    this.shadowOrigin = [ox, oy];
    this.heightGrid.fill(0);
    const tiles = [];
    for (const e of this.tiles.values()) {
      if (e.decoded) tiles.push(e.decoded);
      if (e.crownTile) tiles.push(e.crownTile);   // a 378 ft tower casts a real shadow
    }
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

    let eye, lookAt, near, far, fov;
    if (this.mode === 'walk') {
      const fwd = (this.keys.w ? 1 : 0) - (this.keys.s ? 1 : 0);
      const rgt = (this.keys.d ? 1 : 0) - (this.keys.a ? 1 : 0);
      this.player.running = !!this.keys.shift;
      this.player.step(dt, fwd, rgt, this.collider);
      // Follow the ground rather than a plane. Sampled after the step so the
      // eye height is measured at the position actually reached this frame.
      if (this.terrain) {
        this.player.groundZ =
          this.terrain.heightAt(this.player.x, this.player.y);
      }
      eye = this.player.eye();
      lookAt = this.player.target();
      near = 0.12;
      far = 22000;
      // a slightly wider lens while running reads as speed without motion blur
      fov = 68 + Math.min(8, this.player.speed() * 1.1);
    } else {
      eye = this.camera.eye();
      lookAt = this.camera.target;
      const c = this.camera.clip();
      near = c[0]; far = c[1];
      fov = this.camera.fov;
    }
    M4.perspective(this.proj, fov * Math.PI / 180, w / h, near, far);
    M4.lookAt(this.view, eye, lookAt, [0, 0, 1]);
    M4.multiply(this.mvp, this.proj, this.view);

    const focus = this.mode === 'walk'
      ? [this.player.x, this.player.y] : this.camera.target;
    if (Math.hypot(focus[0] - this.shadowCentre[0],
      focus[1] - this.shadowCentre[1]) > SHADOW_SIZE * SHADOW_CELL * 0.22) {
      this.shadowDirty = true;
    }
    if (this.shadowDirty) this.rebuildShadows();

    const c = this.skyColours();
    const sd = sunVector(this.sun.elevation, this.sun.azimuth);
    const fogDist = this.mode === 'walk'
      ? 3200
      : 16000 + this.camera.distance * 5.5;

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
      if (u.uSunElev) gl.uniform1f(u.uSunElev, this.sun.elevation);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.shadowTex);
      gl.uniform1i(u.uShadow, 0);
    };

    // Terrain lives on unit 1; the shadow field owns unit 0.
    const bindTerrain = (u) => {
      if (!u.uTerrain) return;
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, this.terrainTex);
      gl.uniform1i(u.uTerrain, 1);
      gl.uniform3fv(u.uTerrainRect, this.terrainRect);
      gl.uniform2fv(u.uTerrainSize, this.terrainSize);
      gl.activeTexture(gl.TEXTURE0);
    };

    gl.useProgram(this.progGround);
    bindCommon(this.uGround);
    bindTerrain(this.uGround);
    // sized to sit just inside the far plane, centred under the viewer
    gl.uniform2fv(this.uGround.uGroundCentre, [eye[0], eye[1]]);
    gl.uniform1f(this.uGround.uGroundScale, far * 0.62);
    gl.bindVertexArray(this.groundVao);
    gl.drawArrays(gl.TRIANGLES, 0, this.groundVerts);

    if (this.detailCount) {
      gl.useProgram(this.progDetail);
      const u = this.uDetail;
      gl.uniformMatrix4fv(u.uViewProj, false, this.mvp);
      gl.uniform1f(u.uZ, 0.25);
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
      bindTerrain(u);
      gl.bindVertexArray(this.detailVao);
      gl.disable(gl.CULL_FACE);
      gl.drawArrays(gl.TRIANGLES, 0, this.detailCount);
      gl.enable(gl.CULL_FACE);
    }

    if (this.waterCount) {
      gl.useProgram(this.progWater);
      const u = this.uWater;
      gl.uniformMatrix4fv(u.uViewProj, false, this.mvp);
      gl.uniform1f(u.uWaterZ, this.waterZ || 0);
      gl.uniform3fv(u.uEye, eye);
      gl.uniform3fv(u.uSunDir, sd);
      gl.uniform3fv(u.uSunColor, c.sun);
      gl.uniform3fv(u.uSkyColor, c.sky);
      gl.uniform3fv(u.uZenith, c.zenith);
      gl.uniform3fv(u.uHorizon, c.horizon);
      gl.uniform1f(u.uFogDist, fogDist);
      gl.bindVertexArray(this.waterVao);
      gl.disable(gl.CULL_FACE);
      gl.drawArrays(gl.TRIANGLES, 0, this.waterCount);
      gl.enable(gl.CULL_FACE);
    }

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
      if (e.crownCount) {
        gl.bindVertexArray(e.crownVao);
        gl.drawArrays(gl.TRIANGLES, 0, e.crownCount);
      }
      drawn++;
    }
    if (this.beamCount && this.showPins) {
      gl.useProgram(this.progBeam);
      gl.uniformMatrix4fv(this.uBeam.uViewProj, false, this.mvp);
      gl.uniform3fv(this.uBeam.uEye, eye);
      gl.uniform1f(this.uBeam.uWidth, 1.0);
      gl.uniform3fv(this.uBeam.uColor, [1.0, 0.62, 0.24]);
      gl.bindVertexArray(this.beamVao);
      gl.disable(gl.CULL_FACE);
      gl.drawArrays(gl.TRIANGLES, 0, this.beamCount);
      gl.enable(gl.CULL_FACE);
    }
    if (this.prospects && this.showPins) {
      this.prospects.update(this.mvp, eye,
        this.mode === 'walk' ? 900 : 9000,
        this.canvas.clientWidth, this.canvas.clientHeight);
    }

    gl.bindVertexArray(null);
    this.drawnTiles = drawn;

    this.frames++;
    if (!this._fpsAt || now - this._fpsAt > 500) {
      this.fps = Math.round(this.frames * 1000 / (now - (this._fpsAt || now - 500)));
      this._fpsAt = now; this.frames = 0;
    }
  }

  enterWalk(spawn) {
    if (this.mode === 'walk') return;
    // Default drop-in is the Market Street axis east of City Hall, looking
    // west down the street. Dropping at the camera target instead puts you
    // inside City Hall, whose footprint is 153,719 square feet.
    const t = spawn || [900, -142, 0];
    const fixed = this.collider.unstick(t[0], t[1], BODY_RADIUS);
    this.player.x = fixed.x;
    this.player.y = fixed.y;
    this.player.groundZ = this.terrain
      ? this.terrain.heightAt(fixed.x, fixed.y) : 0;
    this.player.vx = this.player.vy = 0;
    this.player.yaw = spawn
      ? (this.camera.azimuth + 180) * Math.PI / 180
      : -Math.PI / 2 - 0.161;                 // west along Market, grid-aligned
    this.player.pitch = 0.0;
    this.mode = 'walk';
    this.needsRebuild = true;
    this.shadowDirty = true;
    if (this.canvas.requestPointerLock) this.canvas.requestPointerLock();
  }

  exitWalk() {
    if (this.mode !== 'walk') return;
    this.mode = 'orbit';
    this.camera.goal.target = [this.player.x, this.player.y, 30];
    this.camera.target = [this.player.x, this.player.y, 30];
    this.camera.goal.distance = 900;
    this.camera.goal.azimuth = (this.player.yaw * 180 / Math.PI) + 180;
    this.camera.goal.elevation = 28;
    this.needsRebuild = true;
    this.shadowDirty = true;
    if (typeof document !== 'undefined' && document.exitPointerLock) {
      document.exitPointerLock();
    }
  }

  initInput() {
    const el = this.canvas;
    let dragging = null, lastX = 0, lastY = 0;

    document.addEventListener('pointerlockchange', () => {
      this.pointerLocked = document.pointerLockElement === el;
      if (!this.pointerLocked && this.mode === 'walk') this.exitWalk();
    });

    el.addEventListener('pointerdown', (ev) => {
      if (this.mode === 'walk') {
        if (!this.pointerLocked && el.requestPointerLock) el.requestPointerLock();
        return;
      }
      el.setPointerCapture(ev.pointerId);
      dragging = (ev.button === 2 || ev.shiftKey) ? 'pan' : 'orbit';
      lastX = ev.clientX; lastY = ev.clientY;
    });
    el.addEventListener('pointermove', (ev) => {
      if (this.mode === 'walk') {
        if (!this.pointerLocked) return;
        this.player.look(ev.movementX * 0.0022, -ev.movementY * 0.0022);
        return;
      }
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
      if (this.mode === 'walk') return;
      this.camera.zoom(Math.exp(ev.deltaY * 0.0012));
      this.needsRebuild = true;
    }, { passive: false });

    // Keyboard: the whole viewer must be usable without a pointer.
    el.setAttribute('tabindex', '0');
    const track = (ev, down) => {
      const k = ev.key.toLowerCase();
      if (k === 'shift') { this.keys.shift = down; return true; }
      if (k === 'w' || k === 'a' || k === 's' || k === 'd') {
        this.keys[k] = down;
        return true;
      }
      if (k === 'arrowup') { this.keys.w = down; return true; }
      if (k === 'arrowdown') { this.keys.s = down; return true; }
      if (k === 'arrowleft') { this.keys.a = down; return true; }
      if (k === 'arrowright') { this.keys.d = down; return true; }
      return false;
    };
    el.addEventListener('keyup', (ev) => {
      if (this.mode === 'walk' && track(ev, false)) ev.preventDefault();
    });

    el.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape' && this.mode === 'walk') { this.exitWalk(); return; }
      if (this.mode === 'walk') {
        if (track(ev, true)) { ev.preventDefault(); this.needsRebuild = true; }
        return;
      }
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
