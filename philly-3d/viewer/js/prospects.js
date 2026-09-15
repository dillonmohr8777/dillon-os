// The Philadelphia prospect layer: 25 businesses pinned to the real buildings
// they occupy, each linking to the spec homepage already built for it.
//
// Labels are DOM anchors positioned from the projected world point rather than
// text drawn into the canvas. That keeps them crisp at any zoom, keyboard
// reachable, and readable by a screen reader, none of which is true of glyphs
// rasterised into WebGL.
'use strict';

class Prospects {
  constructor(gl, layerEl, siteBase) {
    this.gl = gl;
    this.layer = layerEl;
    this.siteBase = siteBase;
    this.items = [];
    this.count = 0;
    this.selected = null;
    this.onSelect = null;
  }

  async load(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
    const doc = await res.json();
    this.items = (doc.prospects || []).filter((p) => p.x != null && p.y != null);
    this.meta = {
      count: doc.count, geocoded: doc.geocoded, withBuilding: doc.with_building,
      byContainment: doc.matched_by_containment, byProximity: doc.matched_by_proximity,
    };
    this.buildMarkers();
    this.buildBeams();
    return this.items.length;
  }

  topOf(p) {
    const b = p.building;
    if (!b) return 12;
    return (b.base_ft || 0) * 0.3048 + (b.height_ft || 40) * 0.3048;
  }

  buildMarkers() {
    this.layer.textContent = '';
    for (const p of this.items) {
      const a = document.createElement('a');
      a.className = 'pin';
      a.href = `${this.siteBase}/${p.slug}/index.html`;
      a.target = '_blank';
      a.rel = 'noopener';
      a.dataset.code = p.code;
      const b = p.building;
      const detail = b
        ? `${b.height_ft} ft · ${b.match === 'contains'
            ? 'on its own footprint' : `nearest footprint, ${b.match_distance_m} m`}`
        : 'no footprint matched';
      a.innerHTML =
        `<span class="pin-dot" aria-hidden="true"></span>` +
        `<span class="pin-body"><b>${p.name}</b>` +
        `<span class="pin-sub">${p.address.split(',')[0]} · ${detail}</span></span>`;
      a.title = `${p.name}: open the spec homepage`;
      a.addEventListener('click', (ev) => {
        if (this.onSelect) this.onSelect(p, ev);
      });
      p._el = a;
      this.layer.appendChild(a);
    }
    this.count = this.items.length;
  }

  // A tapered beam over each building so the pin has something to stand on
  // when the label itself is too small to read.
  buildBeams() {
    const gl = this.gl;
    const data = [];
    for (const p of this.items) {
      const z0 = this.topOf(p);
      const z1 = z0 + 55;
      // two triangles, expanded to face the camera in the vertex shader
      data.push(p.x, p.y, z0, -1, p.x, p.y, z0, 1, p.x, p.y, z1, 1);
      data.push(p.x, p.y, z0, -1, p.x, p.y, z1, 1, p.x, p.y, z1, -1);
    }
    this.beamCount = this.items.length * 6;
    this.beamData = new Float32Array(data);
  }

  // Project to normalised device coordinates, then declutter: nearest label
  // wins its space and anything overlapping it collapses to a dot. Without
  // this the Center City cluster is an unreadable pile, because twelve of the
  // twenty five sit within a kilometre of each other.
  update(mvp, eye, maxDist, viewW, viewH) {
    const placed = [];
    const visible = [];

    for (const p of this.items) {
      const z = this.topOf(p) + 62;
      const cx = mvp[0] * p.x + mvp[4] * p.y + mvp[8] * z + mvp[12];
      const cy = mvp[1] * p.x + mvp[5] * p.y + mvp[9] * z + mvp[13];
      const cw = mvp[3] * p.x + mvp[7] * p.y + mvp[11] * z + mvp[15];
      const el = p._el;
      const dist = Math.hypot(eye[0] - p.x, eye[1] - p.y, eye[2] - z);
      if (cw <= 0 || dist > maxDist) { el.hidden = true; continue; }
      const nx = cx / cw, ny = cy / cw;
      if (nx < -1.25 || nx > 1.25 || ny < -1.25 || ny > 1.25) { el.hidden = true; continue; }
      visible.push({ p, el, dist, sx: (nx * 0.5 + 0.5) * viewW, sy: (0.5 - ny * 0.5) * viewH });
    }

    visible.sort((a, b) => a.dist - b.dist);
    for (const v of visible) {
      // measured once and cached: reading offsetWidth every frame for every
      // label forces a layout flush and costs more than the labels do
      if (!v.el._w) {
        v.el.classList.remove('collapsed');
        v.el._w = v.el.offsetWidth || 190;
        v.el._h = v.el.offsetHeight || 34;
      }
      const w = v.el._w, h = v.el._h;
      const box = [v.sx - w / 2, v.sy - h, v.sx + w / 2, v.sy];
      const clash = placed.some((q) =>
        box[0] < q[2] && box[2] > q[0] && box[1] < q[3] && box[3] > q[1]);
      v.el.hidden = false;
      v.el.classList.toggle('collapsed', clash);
      if (!clash) placed.push(box);
      v.el.style.left = `${v.sx}px`;
      v.el.style.top = `${v.sy}px`;
      v.el.style.setProperty('--near',
        String(Math.max(0, Math.min(1, 1 - v.dist / maxDist))));
      v.el.style.zIndex = String(100000 - Math.round(v.dist));
    }
  }

  focus(code) {
    return this.items.find((p) => p.code === code) || null;
  }
}

globalThis.Prospects = Prospects;
