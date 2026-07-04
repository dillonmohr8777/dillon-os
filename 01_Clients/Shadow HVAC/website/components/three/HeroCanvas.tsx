"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/* 3D outdoor AC condenser unit: spinning top fan, coil louvers, copper line-set,
   condenser pad, status LED, and cool-air particles. Mouse-reactive + floating. */
export default function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
    } catch {
      return;
    }
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.38;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 3.0, 8.8);
    camera.lookAt(0, -0.15, 0);

    scene.add(new THREE.AmbientLight(0xffffff, 0.9));
    const key = new THREE.DirectionalLight(0xffffff, 2.1);
    key.position.set(4, 9, 7);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xdfe8ff, 1.5);
    fill.position.set(-1, 2, 9);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0xffb27a, 0.9);
    rim.position.set(6, 3, -4);
    scene.add(rim);
    const ember = new THREE.PointLight(0xff6a2a, 95, 45);
    ember.position.set(-5, 2, 4);
    scene.add(ember);
    const ice = new THREE.PointLight(0x38bdf8, 95, 45);
    ice.position.set(5, 1, 4);
    scene.add(ice);

    const unit = new THREE.Group();
    scene.add(unit);

    const steel = new THREE.MeshStandardMaterial({ color: 0x475869, metalness: 0.75, roughness: 0.4 });
    const darkSteel = new THREE.MeshStandardMaterial({ color: 0x1a212e, metalness: 0.8, roughness: 0.5 });
    const trim = new THREE.MeshStandardMaterial({ color: 0x0e131d, metalness: 0.7, roughness: 0.5 });
    const grilleMat = new THREE.MeshStandardMaterial({ color: 0x080b12, metalness: 0.5, roughness: 0.7 });
    const copper = new THREE.MeshStandardMaterial({ color: 0xc4703a, metalness: 0.9, roughness: 0.34, emissive: 0x3a1a08, emissiveIntensity: 0.35 });
    const fanMat = new THREE.MeshStandardMaterial({ color: 0x11161f, metalness: 0.7, roughness: 0.5 });

    const W = 2.6, H = 2.4, D = 2.6;

    unit.add(new THREE.Mesh(new THREE.BoxGeometry(W, H, D), steel));
    const top = new THREE.Mesh(new THREE.BoxGeometry(W * 1.03, 0.14, D * 1.03), trim);
    top.position.y = H / 2 + 0.03;
    unit.add(top);
    const baseR = new THREE.Mesh(new THREE.BoxGeometry(W * 1.05, 0.2, D * 1.05), trim);
    baseR.position.y = -H / 2 - 0.03;
    unit.add(baseR);

    for (let cx = -1; cx <= 1; cx += 2)
      for (let cz = -1; cz <= 1; cz += 2) {
        const rail = new THREE.Mesh(new THREE.BoxGeometry(0.16, H + 0.12, 0.16), darkSteel);
        rail.position.set((cx * W) / 2, 0, (cz * D) / 2);
        unit.add(rail);
      }

    const louvers = (px: number, pz: number, ry: number, span: number) => {
      const g = new THREE.Group();
      const n = 18, usable = span - 0.42;
      for (let i = 0; i < n; i++) {
        const slat = new THREE.Mesh(new THREE.BoxGeometry((usable / n) * 0.6, H - 0.55, 0.06), darkSteel);
        slat.position.x = -usable / 2 + (i + 0.5) * (usable / n);
        g.add(slat);
      }
      g.position.set(px, 0, pz);
      g.rotation.y = ry;
      unit.add(g);
    };
    louvers(0, D / 2 + 0.02, 0, W);
    louvers(0, -D / 2 - 0.02, Math.PI, W);
    louvers(W / 2 + 0.02, 0, Math.PI / 2, D);
    louvers(-W / 2 - 0.02, 0, -Math.PI / 2, D);

    const fanHub = new THREE.Group();
    fanHub.position.y = H / 2 + 0.14;
    unit.add(fanHub);
    fanHub.add(new THREE.Mesh(new THREE.CylinderGeometry(1.12, 1.12, 0.12, 48), trim));
    const well = new THREE.Mesh(
      new THREE.CylinderGeometry(1.02, 1.02, 0.5, 48, 1, true),
      new THREE.MeshStandardMaterial({ color: 0x05070c, metalness: 0.3, roughness: 0.95 })
    );
    well.position.y = -0.2;
    fanHub.add(well);

    const fan = new THREE.Group();
    fan.position.y = 0.02;
    fanHub.add(fan);
    fan.add(new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.14, 20), fanMat));
    const NB = 5;
    for (let bi = 0; bi < NB; bi++) {
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.025, 0.36), fanMat);
      blade.position.x = 0.55;
      blade.rotation.z = 0.34;
      const arm = new THREE.Group();
      arm.rotation.y = (bi / NB) * Math.PI * 2;
      arm.add(blade);
      fan.add(arm);
    }

    const grille = new THREE.Group();
    grille.position.y = 0.14;
    fanHub.add(grille);
    [0.32, 0.58, 0.82, 1.04].forEach((rr) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(rr, 0.022, 8, 56), grilleMat);
      ring.rotation.x = Math.PI / 2;
      grille.add(ring);
    });
    for (let s = 0; s < 4; s++) {
      const spoke = new THREE.Mesh(new THREE.BoxGeometry(2.08, 0.022, 0.03), grilleMat);
      spoke.rotation.y = (s / 4) * Math.PI;
      grille.add(spoke);
    }

    const pad = new THREE.Mesh(
      new THREE.CylinderGeometry(2.35, 2.45, 0.2, 6),
      new THREE.MeshStandardMaterial({ color: 0x141a24, metalness: 0.2, roughness: 0.95 })
    );
    pad.position.y = -H / 2 - 0.23;
    pad.rotation.y = Math.PI / 6;
    unit.add(pad);

    [0.14, -0.16].forEach((oy, i) => {
      const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.07 - 0.02 * i, 0.07 - 0.02 * i, 0.6, 14), copper);
      pipe.rotation.z = Math.PI / 2;
      pipe.position.set(W / 2 + 0.3, -H * 0.12 + oy, D * 0.22);
      unit.add(pipe);
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.09 - 0.02 * i, 0.09 - 0.02 * i, 0.1, 14), darkSteel);
      cap.rotation.z = Math.PI / 2;
      cap.position.set(W / 2 + 0.58, -H * 0.12 + oy, D * 0.22);
      unit.add(cap);
    });

    const led = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.14, 0.05),
      new THREE.MeshStandardMaterial({ color: 0xff6a2a, emissive: 0xff6a2a, emissiveIntensity: 2.4 })
    );
    led.position.set(W * 0.3, -H * 0.32, D / 2 + 0.06);
    unit.add(led);
    const strip = new THREE.Mesh(
      new THREE.BoxGeometry(W * 0.5, 0.16, 0.04),
      new THREE.MeshStandardMaterial({ color: 0x0a0e16, metalness: 0.6, roughness: 0.4, emissive: 0x38bdf8, emissiveIntensity: 0.25 })
    );
    strip.position.set(-W * 0.12, H * 0.32, D / 2 + 0.05);
    unit.add(strip);

    const COUNT = 240;
    const pos = new Float32Array(COUNT * 3);
    const spd = new Float32Array(COUNT);
    const seed = (i: number, fresh: boolean) => {
      const a = Math.random() * Math.PI * 2, r = Math.random() * 1.0;
      pos[i * 3] = Math.cos(a) * r;
      pos[i * 3 + 1] = H / 2 + 0.3 + (fresh ? Math.random() * 3.2 : 0);
      pos[i * 3 + 2] = Math.sin(a) * r;
      spd[i] = 0.5 + Math.random() * 1.1;
    };
    for (let i = 0; i < COUNT; i++) seed(i, true);
    const pg = new THREE.BufferGeometry();
    pg.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const air = new THREE.Points(
      pg,
      new THREE.PointsMaterial({ color: 0x7dd3fc, size: 0.05, transparent: true, opacity: 0.65, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    unit.add(air);

    const ptr = { x: 0, y: 0, tx: 0, ty: 0 };
    const onMove = (e: PointerEvent) => {
      ptr.tx = (e.clientX / window.innerWidth) * 2 - 1;
      ptr.ty = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    let wide = true;
    const resize = () => {
      const w = canvas.clientWidth || canvas.offsetWidth;
      const h = canvas.clientHeight || canvas.offsetHeight;
      if (!w || !h) return;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      wide = w > 820;
      unit.position.x = wide ? 2.55 : 0;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    let t = 0;
    let raf = 0;
    const parr = pg.attributes.position.array as Float32Array;
    const frame = () => {
      t += 0.016;
      ptr.x += (ptr.tx - ptr.x) * 0.05;
      ptr.y += (ptr.ty - ptr.y) * 0.05;
      unit.rotation.y = -0.5 + Math.sin(t * 0.25) * 0.22 + ptr.x * 0.3;
      unit.rotation.x = -0.04 + ptr.y * -0.08;
      unit.position.y = (wide ? -0.2 : -0.6) + Math.sin(t * 0.8) * 0.05;
      fan.rotation.y += 0.4;
      for (let i = 0; i < COUNT; i++) {
        parr[i * 3 + 1] += spd[i] * 0.016;
        if (parr[i * 3 + 1] > H / 2 + 3.4) seed(i, false);
      }
      pg.attributes.position.needsUpdate = true;
      renderer.render(scene, camera);
      if (!reduce) raf = requestAnimationFrame(frame);
    };
    frame();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      renderer.dispose();
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
        const mat = (m as THREE.Mesh).material as THREE.Material | THREE.Material[];
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
        else if (mat) mat.dispose();
      });
    };
  }, []);

  return <canvas ref={canvasRef} className="h-full w-full" />;
}
