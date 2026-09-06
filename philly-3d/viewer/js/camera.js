// Orbit camera in the scene frame: +X east, +Y north, +Z up, metres.
//
// Kept as plain state plus a step() so the same code can be unit tested
// without a canvas. Damping is frame-rate independent: the smoothing factor
// is derived from dt rather than applied once per frame, so the camera feels
// the same at 30 and 144 Hz.
'use strict';

class Camera {
  constructor(opts = {}) {
    this.target = opts.target ? opts.target.slice() : [0, 0, 40];
    this.distance = opts.distance ?? 2600;
    this.azimuth = opts.azimuth ?? 215;      // compass degrees, camera bearing
    this.elevation = opts.elevation ?? 26;   // degrees above the horizon
    this.fov = opts.fov ?? 50;

    this.minDistance = 40;
    this.maxDistance = 26000;
    this.minElevation = 1.5;
    this.maxElevation = 88;

    this.goal = {
      target: this.target.slice(),
      distance: this.distance,
      azimuth: this.azimuth,
      elevation: this.elevation,
    };
    this.damping = 8.0;
  }

  orbit(dAzDeg, dElDeg) {
    this.goal.azimuth += dAzDeg;
    this.goal.elevation = Math.max(this.minElevation,
      Math.min(this.maxElevation, this.goal.elevation + dElDeg));
  }

  zoom(factor) {
    this.goal.distance = Math.max(this.minDistance,
      Math.min(this.maxDistance, this.goal.distance * factor));
  }

  // Pan across the ground plane, in screen-relative directions, scaled so a
  // drag moves the ground under the cursor at roughly the same rate at any
  // zoom level.
  pan(dxPixels, dyPixels, viewportHeight) {
    const scale = (this.goal.distance * 2 *
      Math.tan(this.fov * Math.PI / 360)) / viewportHeight;
    const a = this.goal.azimuth * Math.PI / 180;
    // screen right and screen "forward" projected onto the ground
    const rightX = Math.cos(a), rightY = -Math.sin(a);
    const fwdX = Math.sin(a), fwdY = Math.cos(a);
    this.goal.target[0] += (-dxPixels * rightX + dyPixels * fwdX) * scale;
    this.goal.target[1] += (-dxPixels * rightY + dyPixels * fwdY) * scale;
  }

  flyTo(target, distance, azimuth, elevation) {
    this.goal.target = target.slice();
    if (distance != null) this.goal.distance = distance;
    if (azimuth != null) this.goal.azimuth = azimuth;
    if (elevation != null) this.goal.elevation = elevation;
  }

  step(dt) {
    const k = 1 - Math.exp(-this.damping * Math.min(dt, 0.1));
    for (let i = 0; i < 3; i++) {
      this.target[i] += (this.goal.target[i] - this.target[i]) * k;
    }
    this.distance += (this.goal.distance - this.distance) * k;
    this.elevation += (this.goal.elevation - this.elevation) * k;
    // take the short way round the compass
    let da = ((this.goal.azimuth - this.azimuth + 540) % 360) - 180;
    this.azimuth += da * k;
  }

  // Eye position. Azimuth is the compass bearing the camera sits at relative
  // to the target, so azimuth 180 puts the camera south of it, looking north.
  eye() {
    const e = this.elevation * Math.PI / 180;
    const a = this.azimuth * Math.PI / 180;
    const horiz = Math.cos(e) * this.distance;
    return [
      this.target[0] + horiz * Math.sin(a),
      this.target[1] + horiz * Math.cos(a),
      this.target[2] + Math.sin(e) * this.distance,
    ];
  }

  // Near and far chosen from the current distance: a tight near plane keeps
  // depth precision at street level, a generous far plane keeps the far
  // skyline in view from altitude.
  clip() {
    const near = Math.max(0.8, this.distance * 0.004);
    return [near, Math.max(24000, this.distance * 12)];
  }
}

globalThis.Camera = Camera;
