// Minimal column-major 4x4 / vec3 maths. No dependencies by design: this whole
// viewer has to run from a single directory with nothing installed.
'use strict';
const M4 = {
  create() { return new Float32Array(16); },

  identity(o) {
    o.fill(0); o[0] = o[5] = o[10] = o[15] = 1; return o;
  },

  perspective(o, fovy, aspect, near, far) {
    const f = 1 / Math.tan(fovy / 2);
    o.fill(0);
    o[0] = f / aspect; o[5] = f; o[11] = -1;
    o[10] = (far + near) / (near - far);
    o[14] = (2 * far * near) / (near - far);
    return o;
  },

  lookAt(o, eye, center, up) {
    let zx = eye[0] - center[0], zy = eye[1] - center[1], zz = eye[2] - center[2];
    let l = Math.hypot(zx, zy, zz) || 1;
    zx /= l; zy /= l; zz /= l;
    let xx = up[1] * zz - up[2] * zy,
        xy = up[2] * zx - up[0] * zz,
        xz = up[0] * zy - up[1] * zx;
    l = Math.hypot(xx, xy, xz) || 1;
    xx /= l; xy /= l; xz /= l;
    const yx = zy * xz - zz * xy,
          yy = zz * xx - zx * xz,
          yz = zx * xy - zy * xx;
    o[0] = xx; o[1] = yx; o[2] = zx; o[3] = 0;
    o[4] = xy; o[5] = yy; o[6] = zy; o[7] = 0;
    o[8] = xz; o[9] = yz; o[10] = zz; o[11] = 0;
    o[12] = -(xx * eye[0] + xy * eye[1] + xz * eye[2]);
    o[13] = -(yx * eye[0] + yy * eye[1] + yz * eye[2]);
    o[14] = -(zx * eye[0] + zy * eye[1] + zz * eye[2]);
    o[15] = 1;
    return o;
  },

  multiply(o, a, b) {
    for (let c = 0; c < 4; c++) {
      const b0 = b[c * 4], b1 = b[c * 4 + 1], b2 = b[c * 4 + 2], b3 = b[c * 4 + 3];
      o[c * 4]     = a[0] * b0 + a[4] * b1 + a[8]  * b2 + a[12] * b3;
      o[c * 4 + 1] = a[1] * b0 + a[5] * b1 + a[9]  * b2 + a[13] * b3;
      o[c * 4 + 2] = a[2] * b0 + a[6] * b1 + a[10] * b2 + a[14] * b3;
      o[c * 4 + 3] = a[3] * b0 + a[7] * b1 + a[11] * b2 + a[15] * b3;
    }
    return o;
  },
};

// Frustum planes in world space, extracted from a view-projection matrix.
// Used to skip tiles the camera cannot see, which is most of them.
function frustumPlanes(m) {
  const p = [];
  for (let i = 0; i < 3; i++) {
    for (const s of [1, -1]) {
      p.push([
        m[3] + s * m[i], m[7] + s * m[4 + i],
        m[11] + s * m[8 + i], m[15] + s * m[12 + i],
      ]);
    }
  }
  return p.map((q) => {
    const l = Math.hypot(q[0], q[1], q[2]) || 1;
    return [q[0] / l, q[1] / l, q[2] / l, q[3] / l];
  });
}

function boxInFrustum(planes, minx, miny, minz, maxx, maxy, maxz) {
  for (const [a, b, c, d] of planes) {
    // the box corner furthest along the plane normal
    const x = a > 0 ? maxx : minx;
    const y = b > 0 ? maxy : miny;
    const z = c > 0 ? maxz : minz;
    if (a * x + b * y + c * z + d < 0) return false;
  }
  return true;
}

// Exported explicitly: a classic script's top-level `const` is a lexical
// binding, not a property of the global object, so the node test harness
// cannot otherwise reach it. Browsers do not care either way.
globalThis.M4 = M4;
globalThis.frustumPlanes = frustumPlanes;
globalThis.boxInFrustum = boxInFrustum;
