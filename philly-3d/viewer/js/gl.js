// Thin WebGL2 helpers. Every failure path reports something a human can act
// on, because the most common problem with a page like this is not a bug in
// the renderer but a machine that cannot give us a WebGL2 context at all.
'use strict';

function createContext(canvas) {
  const gl = canvas.getContext('webgl2', {
    antialias: true,
    depth: true,
    powerPreference: 'high-performance',
    alpha: false,
  });
  if (!gl) return null;
  return gl;
}

function compileShader(gl, type, src, label) {
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(sh);
    gl.deleteShader(sh);
    throw new Error(`${label} shader failed to compile:\n${log}`);
  }
  return sh;
}

function createProgram(gl, vsSrc, fsSrc, label = 'program') {
  const vs = compileShader(gl, gl.VERTEX_SHADER, vsSrc, `${label} vertex`);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, fsSrc, `${label} fragment`);
  const p = gl.createProgram();
  gl.attachShader(p, vs);
  gl.attachShader(p, fs);
  gl.linkProgram(p);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(p);
    gl.deleteProgram(p);
    throw new Error(`${label} failed to link:\n${log}`);
  }
  return p;
}

function uniformMap(gl, program) {
  const out = {};
  const n = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < n; i++) {
    const info = gl.getActiveUniform(program, i);
    out[info.name.replace(/\[0\]$/, '')] = gl.getUniformLocation(program, info.name);
  }
  return out;
}

// Rasterise building footprints into a height grid with a scanline fill,
// keeping the taller value where footprints overlap. This feeds the shadow
// sweep, which needs a height field rather than triangles.
function rasterizeHeights(grid, w, h, x0, y0, cell, tiles) {
  const xs = [];
  for (const t of tiles) {
    for (let i = 0; i < t.n; i++) {
      const s = t.starts[i], c = t.npts[i];
      const top = t.base[i] + t.height[i];
      let minY = Infinity, maxY = -Infinity;
      for (let k = 0; k < c; k++) {
        const gy = (t.y[s + k] - y0) / cell;
        if (gy < minY) minY = gy;
        if (gy > maxY) maxY = gy;
      }
      const r0 = Math.max(0, Math.ceil(minY - 0.5));
      const r1 = Math.min(h - 1, Math.floor(maxY - 0.5));
      for (let r = r0; r <= r1; r++) {
        const sy = r + 0.5;
        xs.length = 0;
        for (let k = 0; k < c; k++) {
          const k2 = (k + 1) % c;
          const ay = (t.y[s + k] - y0) / cell, by = (t.y[s + k2] - y0) / cell;
          if ((ay <= sy && by > sy) || (by <= sy && ay > sy)) {
            const ax = (t.x[s + k] - x0) / cell, bx = (t.x[s + k2] - x0) / cell;
            xs.push(ax + (sy - ay) / (by - ay) * (bx - ax));
          }
        }
        if (xs.length < 2) continue;
        xs.sort((a, b) => a - b);
        for (let p = 0; p + 1 < xs.length; p += 2) {
          const c0 = Math.max(0, Math.ceil(xs[p] - 0.5));
          const c1 = Math.min(w - 1, Math.floor(xs[p + 1] - 0.5));
          const base = r * w;
          for (let cx = c0; cx <= c1; cx++) {
            if (top > grid[base + cx]) grid[base + cx] = top;
          }
        }
      }
    }
  }
  return grid;
}

globalThis.createContext = createContext;
globalThis.createProgram = createProgram;
globalThis.uniformMap = uniformMap;
globalThis.rasterizeHeights = rasterizeHeights;
