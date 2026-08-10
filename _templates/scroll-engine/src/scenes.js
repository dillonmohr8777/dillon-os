import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

/*
  Data-driven descendant of the trio engine.

  The trio proved the grammar: the photographic plate lives inside the scene as
  a fogged, graded backdrop; built geometry stands on real ground in front of
  it; editorial stills hang in world space as panels; one camera rides a
  beat-timed route through all of it. This file keeps that stage but takes the
  whole world — materials, props, choreography, lighting, particles, panels —
  from a per-business spec, so ten sites share one engine without sharing one
  look. Brighter by default than the trio: the consumer has to SEE the world.
*/

const clamp = THREE.MathUtils.clamp;
const lerp = THREE.MathUtils.lerp;
const smooth = (t) => t * t * (3 - 2 * t);
const smoother = (t) => t * t * t * (t * (t * 6 - 15) + 10);
const phase = (p, a, b) => smooth(clamp((p - a) / Math.max(0.0001, b - a), 0, 1));
const damp = (value, target, rate, dt) => lerp(value, target, 1 - Math.exp(-rate * dt));

const loader = new THREE.TextureLoader();

function texture(path, repeat = [1, 1]) {
  const map = loader.load(path);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(...repeat);
  map.anisotropy = 8;
  return map;
}

function plateTexture(path, onReady) {
  const map = loader.load(path, (loaded) => onReady?.(loaded));
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 8;
  return map;
}

function seeded(seed = 1) {
  return () => {
    seed |= 0;
    seed = seed + 0x6d2b79f5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/* ---------------------------------------------------------------------------
   Lighting environment — tiny equirect run through PMREM so metal and glass
   have something honest to reflect. Palette comes from the spec.
--------------------------------------------------------------------------- */
function buildEnvironment(renderer, env) {
  const width = 128;
  const height = 64;
  const data = new Float32Array(width * height * 4);
  const sky = new THREE.Color(env.sky);
  const floor = new THREE.Color(env.floor);
  const lamp = new THREE.Color(env.lamp);
  const cool = new THREE.Color(env.cool);
  const tint = new THREE.Color();
  const scratch = new THREE.Color();

  for (let y = 0; y < height; y++) {
    const v = y / (height - 1);
    for (let x = 0; x < width; x++) {
      const u = x / (width - 1);
      tint.copy(floor).lerp(sky, smooth(clamp((1 - v) * 1.35, 0, 1)));
      const lampD = Math.hypot((u - env.lampUV[0]) * 2.0, (v - env.lampUV[1]) * 3.4);
      tint.add(scratch.copy(lamp).multiplyScalar(Math.exp(-lampD * lampD * 7.5) * env.lampPower));
      const coolD = Math.hypot((u - env.coolUV[0]) * 1.5, (v - env.coolUV[1]) * 4.2);
      tint.add(scratch.copy(cool).multiplyScalar(Math.exp(-coolD * coolD * 4.0) * env.coolPower));
      const i = (y * width + x) * 4;
      data[i] = tint.r; data[i + 1] = tint.g; data[i + 2] = tint.b; data[i + 3] = 1;
    }
  }

  const source = new THREE.DataTexture(data, width, height, THREE.RGBAFormat, THREE.FloatType);
  source.mapping = THREE.EquirectangularReflectionMapping;
  source.needsUpdate = true;
  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();
  const target = pmrem.fromEquirectangular(source);
  pmrem.dispose();
  source.dispose();
  return target.texture;
}

/* ---------------------------------------------------------------------------
   Camera routes. Beats carry their own timing so the rig can dwell. Four
   parameterized presets give the ten sites different movement personalities
   without ten hand-authored splines; specs may still override beats outright.
--------------------------------------------------------------------------- */
export const ROUTES = {
  orbitArc({ r = 9, h = 2.6, low = 1.2, target = [0, -0.2, 0], fov = 33 }) {
    return [
      { at: 0.00, position: [r * 0.95, h * 1.5, r * 1.35], target, fov: fov + 1, roll: 0.012 },
      { at: 0.20, position: [r * 0.72, h * 1.15, r * 1.1], target, fov, roll: 0.008 },
      { at: 0.42, position: [-r * 0.82, h * 1.1, r * 1.05], target, fov: fov + 3, roll: -0.012 },
      { at: 0.62, position: [-r * 0.34, low, r * 0.8], target: [target[0], target[1] - 0.35, target[2]], fov: fov - 1, roll: -0.004 },
      { at: 0.82, position: [r * 0.6, low + 0.4, r * 0.78], target: [target[0] + 0.2, target[1] - 0.2, target[2]], fov: fov - 1, roll: 0.006 },
      { at: 1.00, position: [r * 0.08, h, r * 0.95], target, fov: fov - 2, roll: 0 }
    ];
  },
  pushReveal({ r = 9, h = 2.2, low = 0.9, target = [0, -0.3, 0], fov = 34 }) {
    return [
      { at: 0.00, position: [r * 0.35, h * 1.35, r * 1.5], target, fov: fov + 2, roll: 0.01 },
      { at: 0.20, position: [r * 0.28, h, r * 1.15], target, fov, roll: 0.006 },
      { at: 0.42, position: [-r * 0.42, h * 0.85, r * 0.92], target, fov: fov + 2, roll: -0.01 },
      { at: 0.62, position: [-r * 0.15, low, r * 0.66], target: [target[0], target[1] - 0.4, target[2]], fov: fov - 2, roll: -0.005 },
      { at: 0.82, position: [r * 0.5, low + 0.5, r * 0.7], target: [target[0] + 0.15, target[1] - 0.25, target[2]], fov: fov - 1, roll: 0.007 },
      { at: 1.00, position: [r * 0.12, h * 0.9, r * 0.9], target, fov: fov - 2, roll: 0 }
    ];
  },
  craneDown({ r = 9, h = 4.2, low = 1.1, target = [0, -0.4, 0], fov = 35 }) {
    return [
      { at: 0.00, position: [r * 0.65, h * 1.6, r * 1.2], target, fov, roll: 0.01 },
      { at: 0.20, position: [r * 0.5, h * 1.15, r * 1.02], target, fov: fov - 1, roll: 0.006 },
      { at: 0.42, position: [-r * 0.7, h * 0.72, r * 0.98], target, fov: fov + 2, roll: -0.012 },
      { at: 0.62, position: [-r * 0.28, low, r * 0.72], target: [target[0], target[1] - 0.45, target[2]], fov: fov - 1, roll: -0.006 },
      { at: 0.82, position: [r * 0.52, low + 0.35, r * 0.75], target: [target[0] + 0.2, target[1] - 0.3, target[2]], fov: fov - 2, roll: 0.008 },
      { at: 1.00, position: [r * 0.1, h * 0.95, r * 1.0], target, fov: fov - 1, roll: 0 }
    ];
  },
  driftLateral({ r = 9, h = 2.0, low = 1.0, target = [0, -0.2, 0], fov = 33 }) {
    return [
      { at: 0.00, position: [-r * 0.85, h * 1.2, r * 1.3], target, fov: fov + 1, roll: -0.01 },
      { at: 0.20, position: [-r * 0.45, h, r * 1.12], target, fov, roll: -0.006 },
      { at: 0.42, position: [r * 0.45, h * 1.05, r * 1.02], target, fov: fov + 2, roll: 0.01 },
      { at: 0.62, position: [r * 0.2, low, r * 0.7], target: [target[0], target[1] - 0.35, target[2]], fov: fov - 1, roll: 0.004 },
      { at: 0.82, position: [-r * 0.5, low + 0.45, r * 0.76], target: [target[0] - 0.15, target[1] - 0.2, target[2]], fov: fov - 1, roll: -0.007 },
      { at: 1.00, position: [-r * 0.05, h, r * 0.95], target, fov: fov - 2, roll: 0 }
    ];
  }
};

function buildRoute(beats) {
  const positionCurve = new THREE.CatmullRomCurve3(beats.map((b) => new THREE.Vector3(...b.position)), false, "catmullrom", 0.35);
  const targetCurve = new THREE.CatmullRomCurve3(beats.map((b) => new THREE.Vector3(...b.target)), false, "catmullrom", 0.35);
  const segments = beats.length - 1;
  return {
    sample(progress, outPosition, outTarget) {
      const p = clamp(progress, 0, 1);
      let index = 0;
      while (index < segments - 1 && p > beats[index + 1].at) index++;
      const start = beats[index];
      const end = beats[index + 1];
      const local = clamp((p - start.at) / Math.max(0.0001, end.at - start.at), 0, 1);
      const eased = smoother(local);
      const u = (index + eased) / segments;
      positionCurve.getPointAt(clamp(u, 0, 1), outPosition);
      targetCurve.getPointAt(clamp(u, 0, 1), outTarget);
      return { fov: lerp(start.fov, end.fov, eased), roll: lerp(start.roll ?? 0, end.roll ?? 0, eased), index, local: eased };
    }
  };
}

function fitPlate(plane, camera, distance, imageAspect, overscanX, overscanY = overscanX) {
  const fovRad = THREE.MathUtils.degToRad(camera.fov * 1.25);
  const frustumHeight = 2 * Math.tan(fovRad / 2) * distance;
  const frustumWidth = frustumHeight * Math.max(camera.aspect, 0.5);
  let width = frustumWidth * overscanX;
  let height = width / imageAspect;
  if (height < frustumHeight * overscanY) {
    height = frustumHeight * overscanY;
    width = height * imageAspect;
  }
  plane.scale.set(width, height, 1);
}

/* ---------------------------------------------------------------------------
   Material library. Specs reference these by name and may tint them.
--------------------------------------------------------------------------- */
function makeMaterials(spec, low) {
  const maps = {
    wood: () => texture("/assets/materials/wood-grain.webp", [3, 2]),
    stone: () => texture("/assets/materials/stone-vein.webp", [3, 2]),
    copper: () => texture("/assets/materials/copper-patina.webp", [3, 1]),
    caustic: () => texture("/assets/materials/water-caustics.webp", [2, 2]),
    raw: () => texture("/assets/materials/raw-gem.webp", [2, 2])
  };
  const M = {
    steel: () => new THREE.MeshStandardMaterial({ color: 0x9aa2ab, metalness: 0.9, roughness: 0.3, envMapIntensity: 1.6 }),
    darkSteel: () => new THREE.MeshStandardMaterial({ color: 0x3a4148, metalness: 0.72, roughness: 0.42 }),
    copper: () => new THREE.MeshStandardMaterial({ color: 0xa66038, map: maps.copper(), metalness: 0.86, roughness: 0.36, envMapIntensity: 1.5 }),
    brass: () => new THREE.MeshStandardMaterial({ color: 0xb08d4f, metalness: 0.92, roughness: 0.24, envMapIntensity: 1.8 }),
    porcelain: () => new THREE.MeshStandardMaterial({ color: 0xe8e4dc, roughness: 0.26, metalness: 0.02, envMapIntensity: 1.1 }),
    ceramicWhite: () => new THREE.MeshStandardMaterial({ color: 0xdfe3e6, roughness: 0.2, metalness: 0.03, envMapIntensity: 1.2 }),
    ceramicBlack: () => new THREE.MeshStandardMaterial({ color: 0x181b1f, roughness: 0.18, metalness: 0.08, envMapIntensity: 1.6 }),
    rubber: () => new THREE.MeshStandardMaterial({ color: 0x202225, roughness: 0.96, metalness: 0.02 }),
    wood: () => new THREE.MeshStandardMaterial({ color: 0x6a4a2e, map: maps.wood(), roughness: 0.62, metalness: 0.03 }),
    stone: () => new THREE.MeshStandardMaterial({ color: 0x8e8b83, map: maps.stone(), roughness: 0.4, metalness: 0.02 }),
    cloth: () => new THREE.MeshStandardMaterial({ color: 0x7d8a7a, roughness: 1, metalness: 0 }),
    leather: () => new THREE.MeshStandardMaterial({ color: 0x6d4b30, map: maps.raw(), roughness: 0.72, metalness: 0.04 }),
    paper: () => new THREE.MeshStandardMaterial({ color: 0xe6ddc8, roughness: 0.92, metalness: 0 }),
    bread: () => new THREE.MeshStandardMaterial({ color: 0xb97f3f, map: maps.raw(), roughness: 0.85, metalness: 0 }),
    glass: () => new THREE.MeshPhysicalMaterial({
      color: 0x9fb6bd, roughness: 0.06, metalness: 0,
      transmission: low ? 0 : 0.55, thickness: 0.5, ior: 1.45,
      transparent: true, opacity: low ? 0.4 : 0.85, envMapIntensity: 1.6
    }),
    glow: () => new THREE.MeshBasicMaterial({ color: 0xffc98a, transparent: true, opacity: 0, fog: false })
  };
  return (name, tint) => {
    const material = (M[name] || M.steel)();
    if (tint != null && material.color) material.color.set(tint);
    return material;
  };
}

const GEOS = {
  box: (s) => new THREE.BoxGeometry(...s),
  cylinder: (s) => new THREE.CylinderGeometry(s[0], s[1] ?? s[0], s[2], s[3] ?? 28),
  torus: (s) => new THREE.TorusGeometry(s[0], s[1], s[2] ?? 18, s[3] ?? 72),
  sphere: (s) => new THREE.SphereGeometry(s[0], s[1] ?? 28, s[2] ?? 20),
  capsule: (s) => new THREE.CapsuleGeometry(s[0], s[1], 6, 14),
  cone: (s) => new THREE.ConeGeometry(s[0], s[1], s[2] ?? 28, 1, s[3] ?? false),
  disc: (s) => new THREE.CylinderGeometry(s[0], s[0], s[1], s[2] ?? 40),
  ring: (s) => new THREE.TorusGeometry(s[0], s[1], 12, 64, s[2] ?? Math.PI * 2),
  plane: (s) => new THREE.PlaneGeometry(s[0], s[1], s[2] ?? 1, s[3] ?? 1)
};

function makeTube(points, radius) {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)), false, "catmullrom", 0.35);
  return new THREE.TubeGeometry(curve, 56, radius, 12, false);
}

/* ---------------------------------------------------------------------------
   Panels — the macro and material plates hanging in world space, with their
   anchors projected each frame for the DOM captions.
--------------------------------------------------------------------------- */
function makePanels(scene, specs) {
  const projected = new THREE.Vector3();
  const panels = specs.map((spec, index) => {
    const material = new THREE.MeshBasicMaterial({
      map: plateTexture(spec.src), transparent: true, opacity: 0, depthWrite: false, fog: true, color: 0xffffff
    });
    const frameMaterial = new THREE.MeshBasicMaterial({ color: 0xc8c2b4, transparent: true, opacity: 0, depthWrite: false, fog: true });
    const [w, h] = spec.size;
    const panel = new THREE.Mesh(new THREE.PlaneGeometry(w, h), material);
    const frame = new THREE.Mesh(new THREE.PlaneGeometry(w + 0.04, h + 0.04), frameMaterial);
    frame.position.z = -0.01;
    panel.add(frame);
    panel.position.set(...spec.position);
    panel.rotation.set(0, spec.rotY ?? 0, spec.rotZ ?? 0);
    panel.renderOrder = 10 + index;
    scene.add(panel);
    return { panel, material, frameMaterial, spec };
  });

  return {
    update(progress) {
      for (const { panel, material, frameMaterial, spec } of panels) {
        const shown = phase(progress, spec.in[0], spec.in[1]) * (1 - phase(progress, spec.out[0], spec.out[1]));
        material.opacity = shown;
        frameMaterial.opacity = shown * 0.22;
        panel.visible = shown > 0.004;
        panel.position.z = spec.position[2] + shown * (spec.drift ?? 0.4);
        panel.scale.setScalar(lerp(0.94, 1, shown));
      }
    },
    readAnchors(camera, width, height) {
      return panels.map(({ panel, material, spec }) => {
        panel.getWorldPosition(projected);
        projected.y -= (spec.size[1] / 2) * 0.98;
        projected.project(camera);
        return {
          id: spec.id, label: spec.label, meta: spec.meta,
          x: (projected.x * 0.5 + 0.5) * width,
          y: (-projected.y * 0.5 + 0.5) * height,
          visible: material.opacity > 0.06 && projected.z < 1,
          opacity: material.opacity
        };
      });
    }
  };
}

function dustField(spec) {
  const random = seeded(spec.seed ?? 7);
  const count = spec.count ?? 120;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (random() - 0.5) * spec.spread[0];
    positions[i * 3 + 1] = (random() - 0.5) * spec.spread[1];
    positions[i * 3 + 2] = (random() - 0.5) * spec.spread[2];
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const spriteCanvas = document.createElement("canvas");
  spriteCanvas.width = spriteCanvas.height = 32;
  const context = spriteCanvas.getContext("2d");
  const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.25, "rgba(255,255,255,.75)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 32, 32);
  const material = new THREE.PointsMaterial({
    color: spec.color, map: new THREE.CanvasTexture(spriteCanvas), size: spec.size ?? 0.03,
    transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true
  });
  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  points.position.set(...(spec.position ?? [0, 0.6, 0]));
  return points;
}

/* ---------------------------------------------------------------------------
   The stage + the prop choreography DSL.
--------------------------------------------------------------------------- */
export function createScrollScene(spec, canvas, options = {}) {
  if (!(canvas instanceof HTMLCanvasElement)) throw new Error("Scene canvas is missing.");
  const w = spec.world;
  const coarse = matchMedia("(pointer: coarse)").matches;
  const low = coarse || innerWidth < 720;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: false, antialias: !low, powerPreference: "high-performance" });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = w.exposure ?? 1.22;
  renderer.setClearColor(w.clear, 1);
  renderer.shadowMap.enabled = !low;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(w.clear);
  scene.fog = new THREE.FogExp2(w.fog, w.fogDensity ?? 0.016);
  scene.environment = buildEnvironment(renderer, w.env);
  scene.environmentIntensity = w.env.intensity ?? 1;

  const beats = Array.isArray(w.beats) ? w.beats : ROUTES[w.beats.preset](w.beats);
  const route = buildRoute(beats);
  const camera = new THREE.PerspectiveCamera(beats[0].fov, 1, 0.1, 260);

  const hemisphere = new THREE.HemisphereLight(w.sky, w.ground ?? 0x0a0c0d, w.ambient ?? 1.0);
  const key = new THREE.DirectionalLight(w.cold, w.coldIntensity ?? 2.6);
  key.position.set(...(w.coldPosition ?? [-8, 11, 8]));
  key.castShadow = !low;
  key.shadow.mapSize.set(low ? 512 : 1536, low ? 512 : 1536);
  key.shadow.camera.near = 0.5;
  key.shadow.camera.far = 60;
  key.shadow.camera.left = key.shadow.camera.bottom = -14;
  key.shadow.camera.right = key.shadow.camera.top = 14;
  key.shadow.bias = -0.0012;
  key.shadow.normalBias = 0.02;
  const warm = new THREE.PointLight(w.warm, w.warmIntensity ?? 2, w.warmRange ?? 20, 2);
  warm.position.set(...(w.warmPosition ?? [1.5, 2, 2]));
  scene.add(hemisphere, key, warm);

  /* Backdrop plate — brighter grade than the trio so the image reads at once. */
  let backdropAspect = 16 / 11;
  const plateMaterial = new THREE.MeshBasicMaterial({
    map: plateTexture(spec.plates.hero, (map) => { backdropAspect = map.image.width / map.image.height; layout(); }),
    color: 0xffffff, fog: true, depthWrite: false, toneMapped: true
  });
  const backdrop = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), plateMaterial);
  backdrop.position.set(...(w.platePosition ?? [0.5, 1.6, -15]));
  backdrop.renderOrder = -20;
  backdrop.frustumCulled = false;
  scene.add(backdrop);

  const hazeMaterial = new THREE.MeshBasicMaterial({
    color: w.haze ?? w.fog, transparent: true, opacity: w.hazeOpacity ?? 0.26, depthWrite: false, fog: false
  });
  const haze = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), hazeMaterial);
  haze.position.set(backdrop.position.x, backdrop.position.y, backdrop.position.z + (w.hazeOffset ?? 5));
  haze.renderOrder = -18;
  haze.frustumCulled = false;
  scene.add(haze);

  const material = makeMaterials(spec, low);
  const root = new THREE.Group();
  root.rotation.y = w.rootYaw ?? -0.06;
  scene.add(root);

  /* Ground */
  if (w.groundMat !== "none") {
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(34, 26), material(w.groundMat ?? "stone", w.groundTint));
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = w.groundY ?? -1.75;
    ground.receiveShadow = true;
    root.add(ground);
  }

  /* Props from the spec DSL. */
  const props = (w.props ?? []).map((p) => {
    const mat = material(p.mat, p.tint);
    if (p.opacity != null) { mat.transparent = true; mat.opacity = p.opacity; }
    const geometry = p.geo === "tube" ? makeTube(p.pts, p.r ?? 0.08) : GEOS[p.geo](p.size ?? []);
    const mesh = new THREE.Mesh(geometry, mat);
    mesh.position.set(...p.pos);
    if (p.rot) mesh.rotation.set(...p.rot);
    if (p.scale) mesh.scale.setScalar(p.scale);
    mesh.castShadow = p.glow !== true;
    mesh.receiveShadow = true;
    root.add(mesh);
    const home = mesh.position.clone();
    const start = p.from ? home.clone().add(new THREE.Vector3(...p.from)) : home.clone();
    return { mesh, mat, spec: p, home, start, baseRot: mesh.rotation.clone() };
  });

  /* Particles + practical ramps. */
  const particles = (w.particles ?? []).map((p) => {
    const points = dustField(p);
    scene.add(points);
    return { points, spec: p };
  });

  const panels = makePanels(scene, (spec.panels ?? []).map((p) => ({ ...p, src: spec.plates[p.src] })));

  let composer = null;
  if (!low && !options.reducedMotion) {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(new UnrealBloomPass(new THREE.Vector2(1, 1), w.bloom ?? 0.18, 0.45, 0.92));
    composer.addPass(new OutputPass());
  }

  const state = {
    width: 1, height: 1, renderScale: 1, dprCap: low ? 1.25 : 1.75,
    pointerX: 0, pointerY: 0, targetX: 0, targetY: 0,
    firstTime: null, sampleTime: 0, sampleFrames: 0
  };
  const p = new THREE.Vector3();
  const t = new THREE.Vector3();
  const view = new THREE.Vector3();

  function layout() {
    const shiftAllowance = 1 + 2.4 * (w.lensShift ?? 0.13);
    const overscan = w.plateOverscan ?? 1.3;
    fitPlate(backdrop, camera, Math.abs(w.plateDistance ?? 26), backdropAspect, overscan * shiftAllowance, overscan * 2.1);
    fitPlate(haze, camera, Math.abs(w.plateDistance ?? 26) - (w.hazeOffset ?? 5), backdropAspect, overscan * 1.02 * shiftAllowance, overscan * 1.02 * 2.1);
  }

  function resize(width, height) {
    state.width = width;
    state.height = height;
    const ratio = Math.min(devicePixelRatio || 1, state.dprCap) * state.renderScale;
    renderer.setPixelRatio(ratio);
    renderer.setSize(width, height, false);
    if (composer) { composer.setPixelRatio(ratio); composer.setSize(width, height); }
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    layout();
  }

  function adapt(elapsed) {
    if (options.reducedMotion) return;
    state.sampleTime += elapsed;
    state.sampleFrames++;
    if (state.sampleTime < 1400) return;
    const average = state.sampleTime / state.sampleFrames;
    const next = average > 26 ? Math.max(0.6, state.renderScale - 0.12)
      : average < 17 && state.renderScale < 1 ? Math.min(1, state.renderScale + 0.06) : state.renderScale;
    state.sampleTime = 0;
    state.sampleFrames = 0;
    if (next !== state.renderScale) { state.renderScale = next; resize(state.width, state.height); }
  }

  function updateRig(progress, time, elapsed) {
    if (state.firstTime === null) state.firstTime = time;
    const dt = clamp(elapsed / 1000, 0.001, 0.05);
    state.pointerX = damp(state.pointerX, state.targetX, 3.0, dt);
    state.pointerY = damp(state.pointerY, state.targetY, 3.0, dt);

    const shot = route.sample(progress, p, t);
    let fov = shot.fov;
    const tall = clamp((1.15 - camera.aspect) / 0.55, 0, 1);
    view.subVectors(p, t).normalize();
    p.addScaledVector(view, tall * (w.mobilePullback ?? 4.2));
    p.y += tall * (w.mobileLift ?? 0.7);
    fov *= 1 + tall * 0.16;

    const intro = options.reducedMotion ? 1 : smoother(clamp((time - state.firstTime) / 2.4, 0, 1));
    p.addScaledVector(view, (1 - intro) * (w.introDistance ?? 4.2));
    p.y += (1 - intro) * 0.5;

    const parallax = 1 - progress * 0.35;
    p.x += state.pointerX * 0.5 * parallax;
    p.y += state.pointerY * 0.26 * parallax;
    t.x -= state.pointerX * 0.14 * parallax;
    t.y -= state.pointerY * 0.07 * parallax;

    camera.position.copy(p);
    camera.lookAt(t);
    camera.rotation.z += shot.roll + state.pointerX * 0.006;
    camera.fov = fov;
    const shift = (1 - tall) * (w.lensShift ?? 0.13);
    if (Math.abs(shift) > 0.001) camera.setViewOffset(state.width, state.height, -state.width * shift, 0, state.width, state.height);
    else camera.clearViewOffset();
    camera.updateProjectionMatrix();
    adapt(elapsed);
    return shot;
  }

  const onPointerMove = (event) => {
    if (event.pointerType === "touch") return;
    state.targetX = (event.clientX / innerWidth - 0.5) * 2;
    state.targetY = (0.5 - event.clientY / innerHeight) * 2;
  };
  window.addEventListener("pointermove", onPointerMove, { passive: true });

  const scratchRot = new THREE.Vector3();
  function update(progress, time, elapsed) {
    /* Choreography */
    for (const prop of props) {
      const s = prop.spec;
      let settled = 1;
      if (s.phase) {
        settled = phase(progress, s.phase[0], s.phase[1]);
        prop.mesh.position.lerpVectors(prop.start, prop.home, settled);
        if (s.fadeIn) { prop.mat.transparent = true; prop.mat.opacity = (s.opacity ?? 1) * settled; }
        if (s.arcLift) prop.mesh.position.y += Math.sin(settled * Math.PI) * s.arcLift;
      }
      if (s.spin) {
        const ramp = s.spin.ramp ? phase(progress, s.spin.ramp[0], s.spin.ramp[1]) : 1;
        prop.mesh.rotation[s.spin.axis ?? "y"] = prop.baseRot[s.spin.axis ?? "y"] + time * s.spin.speed * (0.15 + ramp * 0.85);
      }
      if (s.sway) {
        scratchRot.copy(prop.home);
        prop.mesh.position.y = prop.mesh.position.y + Math.sin(time * s.sway.speed + (s.sway.offset ?? 0)) * s.sway.amp * settled;
      }
      if (s.glowRamp) {
        prop.mat.opacity = lerp(s.glowRamp[2], s.glowRamp[3], phase(progress, s.glowRamp[0], s.glowRamp[1]))
          * (s.pulse ? 0.72 + 0.28 * Math.sin(time * s.pulse) : 1);
      }
    }
    /* Practical + grade ramps: the world switches on as the story lands. */
    const lit = phase(progress, ...(w.warmRamp ?? [0.45, 0.85]));
    warm.intensity = lerp(w.warmIntensity ?? 2, w.warmPeak ?? (w.warmIntensity ?? 2) * 4, lit);
    key.intensity = lerp(w.coldIntensity ?? 2.6, (w.coldIntensity ?? 2.6) * 0.8, phase(progress, 0.5, 0.95));
    plateMaterial.color.setScalar(lerp(w.plateGradeIn ?? 1.0, w.plateGradeOut ?? 1.24, phase(progress, 0.08, 0.85)));
    hazeMaterial.opacity = lerp(w.hazeOpacity ?? 0.26, (w.hazeOpacity ?? 0.26) * 0.4, phase(progress, 0.15, 0.85));

    for (const { points, spec: ps } of particles) {
      points.material.opacity = (ps.opacity ?? 0.2) * (ps.ramp ? phase(progress, ps.ramp[0], ps.ramp[1]) : 1);
      points.rotation.y = time * (ps.driftSpeed ?? 0.02);
      if (ps.riseSpeed) points.position.y = (ps.position?.[1] ?? 0.6) + Math.sin(time * ps.riseSpeed) * 0.12;
    }

    panels.update(progress);
    return updateRig(progress, time, elapsed);
  }

  return {
    quality: low ? "adaptive-low" : "adaptive-high",
    resize,
    update(progress, time, elapsed) {
      return update(options.reducedMotion ? 1 : clamp(progress, 0, 1), options.reducedMotion ? 4 : time, elapsed);
    },
    anchors(width, height) {
      return panels.readAnchors(camera, width, height);
    },
    render: () => composer ? composer.render() : renderer.render(scene, camera),
    dispose() {
      window.removeEventListener("pointermove", onPointerMove);
      scene.traverse((object) => {
        object.geometry?.dispose?.();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.filter(Boolean).forEach((m) => m.dispose?.());
      });
      scene.environment?.dispose?.();
      composer?.dispose();
      renderer.dispose();
    }
  };
}
