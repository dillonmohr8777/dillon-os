// First-person walk mode.
//
// Movement is acceleration and friction rather than direct velocity, because
// a camera that starts and stops instantly reads as a cursor, not a person.
// Everything is integrated against dt so the feel is identical at 30 and
// 144 Hz, and collision is delegated to the footprint collider so you cannot
// walk through Philadelphia.
'use strict';

const EYE_HEIGHT = 1.68;       // metres
const BODY_RADIUS = 0.42;
const WALK_SPEED = 3.1;        // m/s, a real walking pace
const RUN_SPEED = 7.4;
const ACCEL = 34.0;
const FRICTION = 12.0;
const MAX_STEP = 0.85;         // metres per substep, so a sprint cannot skip a wall

class Player {
  constructor(opts = {}) {
    this.x = opts.x ?? 0;
    this.y = opts.y ?? -60;
    this.groundZ = opts.groundZ ?? 0;
    this.yaw = opts.yaw ?? 0;        // radians, 0 looks north (+Y)
    this.pitch = opts.pitch ?? 0;    // radians, positive looks up
    this.vx = 0;
    this.vy = 0;
    this.running = false;
    this.bob = 0;
    this.reducedMotion = !!opts.reducedMotion;
    this.maxPitch = Math.PI / 2 - 0.03;
  }

  look(dYaw, dPitch) {
    this.yaw += dYaw;
    // keep yaw in range so it never loses precision over a long session
    if (this.yaw > Math.PI) this.yaw -= Math.PI * 2;
    if (this.yaw < -Math.PI) this.yaw += Math.PI * 2;
    this.pitch = Math.max(-this.maxPitch, Math.min(this.maxPitch, this.pitch + dPitch));
  }

  // forward/right are -1..1 from the keys; the caller decides the mapping.
  step(dt, forward, right, collider) {
    dt = Math.min(dt, 0.1);
    const speed = this.running ? RUN_SPEED : WALK_SPEED;

    // yaw 0 faces +Y (north); +yaw turns east
    const fx = Math.sin(this.yaw), fy = Math.cos(this.yaw);
    const rx = Math.cos(this.yaw), ry = -Math.sin(this.yaw);

    let ax = fx * forward + rx * right;
    let ay = fy * forward + ry * right;
    const mag = Math.hypot(ax, ay);
    if (mag > 1e-6) { ax /= mag; ay /= mag; }        // no diagonal speed bonus

    if (mag > 1e-6) {
      this.vx += ax * ACCEL * dt;
      this.vy += ay * ACCEL * dt;
    } else {
      const f = Math.max(0, 1 - FRICTION * dt);
      this.vx *= f; this.vy *= f;
      if (Math.hypot(this.vx, this.vy) < 0.02) { this.vx = 0; this.vy = 0; }
    }

    const v = Math.hypot(this.vx, this.vy);
    if (v > speed) { this.vx = this.vx / v * speed; this.vy = this.vy / v * speed; }

    let dx = this.vx * dt, dy = this.vy * dt;

    // Substep so a sprint at a low frame rate still cannot skip a wall. The
    // sweep in the collider handles one long step, but chaining short ones
    // also keeps the slide direction honest around corners.
    const dist = Math.hypot(dx, dy);
    const steps = Math.max(1, Math.ceil(dist / MAX_STEP));
    let blocked = false;
    for (let i = 0; i < steps; i++) {
      const sx = dx / steps, sy = dy / steps;
      if (collider) {
        const r = collider.move(this.x, this.y, sx, sy, BODY_RADIUS);
        this.x = r.x; this.y = r.y;
        if (r.hit) {
          blocked = true;
          // Remove only the component of velocity going INTO the wall.
          // Scaling the whole vector instead bleeds away the along-wall
          // motion too, and running past a building grinds to a halt.
          const into = this.vx * r.nx + this.vy * r.ny;
          if (into < 0) { this.vx -= into * r.nx; this.vy -= into * r.ny; }
        }
      } else {
        this.x += sx; this.y += sy;
      }
    }

    if (!this.reducedMotion) {
      this.bob += Math.hypot(this.vx, this.vy) * dt * 2.2;
    }
    return { blocked };
  }

  // Eye position, with a small vertical bob while moving.
  eye() {
    const amp = this.reducedMotion ? 0 : 0.045;
    return [this.x, this.y, this.groundZ + EYE_HEIGHT + Math.sin(this.bob * 2) * amp];
  }

  // A point one metre ahead, for the camera to look at.
  target() {
    const cp = Math.cos(this.pitch);
    const e = this.eye();
    return [
      e[0] + Math.sin(this.yaw) * cp,
      e[1] + Math.cos(this.yaw) * cp,
      e[2] + Math.sin(this.pitch),
    ];
  }

  speed() { return Math.hypot(this.vx, this.vy); }
}

globalThis.Player = Player;
globalThis.EYE_HEIGHT = EYE_HEIGHT;
globalThis.BODY_RADIUS = BODY_RADIUS;
