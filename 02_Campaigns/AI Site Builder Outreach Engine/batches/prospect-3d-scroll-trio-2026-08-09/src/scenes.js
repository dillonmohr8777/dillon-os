import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

const clamp = THREE.MathUtils.clamp;
const lerp = THREE.MathUtils.lerp;
const phase = (p, a, b) => {
  const t = clamp((p - a) / Math.max(0.001, b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
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

function seeded(seed = 1) {
  return () => {
    seed |= 0;
    seed = seed + 0x6d2b79f5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function mesh(geometry, material, position = [0, 0, 0]) {
  const object = new THREE.Mesh(geometry, material);
  object.position.set(...position);
  object.castShadow = true;
  object.receiveShadow = true;
  return object;
}

function box(size, material, position) {
  return mesh(new THREE.BoxGeometry(...size), material, position);
}

function pipe(points, material, radius = 0.1) {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)), false, "catmullrom", 0.35);
  return mesh(new THREE.TubeGeometry(curve, 52, radius, 10, false), material);
}

function particleField(count, color, spread, seed, size = 0.035) {
  const random = seeded(seed);
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (random() - 0.5) * spread[0];
    positions[i * 3 + 1] = (random() - 0.5) * spread[1];
    positions[i * 3 + 2] = (random() - 0.5) * spread[2];
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const spriteCanvas = document.createElement("canvas");
  spriteCanvas.width = spriteCanvas.height = 32;
  const context = spriteCanvas.getContext("2d");
  const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.22, "rgba(255,255,255,.82)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 32, 32);
  const sprite = new THREE.CanvasTexture(spriteCanvas);
  const material = new THREE.PointsMaterial({
    color, map: sprite, size, transparent: true, opacity: 0.38, depthWrite: false,
    blending: THREE.AdditiveBlending, sizeAttenuation: true
  });
  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  return points;
}

function makeWorld(canvas, options, config) {
  const coarse = matchMedia("(pointer: coarse)").matches;
  const low = coarse || innerWidth < 720;
  const renderer = new THREE.WebGLRenderer({
    canvas, alpha: false, antialias: low, powerPreference: "high-performance"
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = config.exposure;
  renderer.setClearColor(config.clear, 1);
  renderer.shadowMap.enabled = !low;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(config.clear);
  scene.fog = new THREE.FogExp2(config.fog, config.fogDensity);
  const camera = new THREE.PerspectiveCamera(config.shots[0].fov, 1, 0.2, 120);
  const positionCurve = new THREE.CatmullRomCurve3(
    config.shots.map((shot) => new THREE.Vector3(...shot.position)), false, "catmullrom", 0.42
  );
  const targetCurve = new THREE.CatmullRomCurve3(
    config.shots.map((shot) => new THREE.Vector3(...shot.target)), false, "catmullrom", 0.42
  );

  const hemisphere = new THREE.HemisphereLight(config.sky, config.ground, config.ambient);
  const cold = new THREE.DirectionalLight(config.cold, config.coldIntensity);
  cold.position.set(...config.coldPosition);
  cold.castShadow = true;
  cold.shadow.mapSize.set(low ? 512 : 1024, low ? 512 : 1024);
  cold.shadow.camera.near = 0.5;
  cold.shadow.camera.far = 50;
  const warm = new THREE.PointLight(config.warm, config.warmIntensity, 24, 2);
  warm.position.set(...config.warmPosition);
  scene.add(hemisphere, cold, warm);

  let composer = null;
  if (!low && !options.reducedMotion) {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(new UnrealBloomPass(new THREE.Vector2(1, 1), config.bloom ?? 0.24, 0.32, 0.9));
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

  function resize(width, height) {
    state.width = width;
    state.height = height;
    const ratio = Math.min(devicePixelRatio || 1, state.dprCap) * state.renderScale;
    renderer.setPixelRatio(ratio);
    renderer.setSize(width, height, false);
    if (composer) {
      composer.setPixelRatio(ratio);
      composer.setSize(width, height);
    }
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  function adapt(elapsed) {
    if (options.reducedMotion) return;
    state.sampleTime += elapsed;
    state.sampleFrames++;
    if (state.sampleTime < 1200) return;
    const average = state.sampleTime / state.sampleFrames;
    const next = average > 25 ? Math.max(0.62, state.renderScale - 0.12)
      : average < 17 && state.renderScale < 1 ? Math.min(1, state.renderScale + 0.06) : state.renderScale;
    state.sampleTime = 0;
    state.sampleFrames = 0;
    if (next !== state.renderScale) {
      state.renderScale = next;
      resize(state.width, state.height);
    }
  }

  function applyCamera(progress, time, elapsed) {
    if (state.firstTime === null) state.firstTime = time;
    const dt = clamp(elapsed / 1000, 0.001, 0.05);
    state.pointerX = damp(state.pointerX, state.targetX, 3.2, dt);
    state.pointerY = damp(state.pointerY, state.targetY, 3.2, dt);
    positionCurve.getPointAt(progress, p);
    targetCurve.getPointAt(progress, t);

    const segments = config.shots.length - 1;
    const scaled = progress * segments;
    const index = Math.min(segments - 1, Math.floor(scaled));
    let fov = lerp(config.shots[index].fov, config.shots[index + 1].fov, scaled - index);
    const tall = clamp((1.18 - camera.aspect) / 0.55, 0, 1);
    view.subVectors(p, t).normalize();
    p.addScaledVector(view, tall * config.mobilePullback);
    p.y += tall * 0.6;
    fov *= 1 + tall * 0.18;

    const intro = options.reducedMotion ? 1 : phase(time - state.firstTime, 0, 2.4);
    p.addScaledVector(view, (1 - intro) * config.introDistance);
    p.y += (1 - intro) * 0.5;
    const parallax = 1 - progress * 0.45;
    p.x += state.pointerX * 0.42 * parallax;
    p.y += state.pointerY * 0.22 * parallax;
    t.x -= state.pointerX * 0.12 * parallax;
    t.y -= state.pointerY * 0.06 * parallax;

    camera.position.copy(p);
    camera.lookAt(t);
    camera.fov = fov;
    camera.updateProjectionMatrix();
    adapt(elapsed);
  }

  const onPointerMove = (event) => {
    if (event.pointerType === "touch") return;
    state.targetX = (event.clientX / innerWidth - 0.5) * 2;
    state.targetY = (0.5 - event.clientY / innerHeight) * 2;
  };
  window.addEventListener("pointermove", onPointerMove, { passive: true });

  return {
    renderer, scene, camera, cold, warm, low,
    resize,
    updateRig: applyCamera,
    render: () => composer ? composer.render() : renderer.render(scene, camera),
    dispose() {
      window.removeEventListener("pointermove", onPointerMove);
      scene.traverse((object) => {
        object.geometry?.dispose?.();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.filter(Boolean).forEach((material) => material.dispose?.());
      });
      composer?.dispose();
      renderer.dispose();
    }
  };
}

const WORLDS = {
  maclaren: {
    clear: 0x171817, fog: 0x292b29, fogDensity: 0.026, exposure: 1.06,
    sky: 0xb9d0d4, ground: 0x2c211b, ambient: 1.4,
    cold: 0x9bc5d0, coldIntensity: 3.8, coldPosition: [-7, 9, 7],
    warm: 0xffad5f, warmIntensity: 6.2, warmPosition: [4, 3, 4], bloom: 0.17,
    introDistance: 4.8, mobilePullback: 5.6,
    shots: [
      { position: [8.8, 4.4, 11.8], target: [0, 0.1, -1.5], fov: 35 },
      { position: [-6.6, 3.2, 9.4], target: [0, -0.1, -1.8], fov: 41 },
      { position: [6.4, 2.3, 7.1], target: [0.5, -0.5, -0.2], fov: 34 },
      { position: [0.4, 3.6, 8.2], target: [0, -0.2, -1.2], fov: 31 }
    ]
  },
  golden: {
    clear: 0x030304, fog: 0x08070a, fogDensity: 0.043, exposure: 1.14,
    sky: 0x211a12, ground: 0x010102, ambient: 0.85,
    cold: 0x4a7bdc, coldIntensity: 5.2, coldPosition: [-7, 5, 6],
    warm: 0xffb43f, warmIntensity: 7.2, warmPosition: [5, 4, 5], bloom: 0.12,
    introDistance: 3.8, mobilePullback: 4.4,
    shots: [
      { position: [0.2, 1.0, 10.2], target: [0, 0, 0], fov: 30 },
      { position: [-5.3, 2.1, 7.7], target: [0, 0.1, 0], fov: 34 },
      { position: [4.4, 1.5, 6.6], target: [0, -0.1, 0], fov: 28 },
      { position: [0.1, 0.8, 7.2], target: [0, -0.3, 0], fov: 27 }
    ]
  },
  morton: {
    clear: 0x031014, fog: 0x071c21, fogDensity: 0.032, exposure: 1.06,
    sky: 0x6ed6e4, ground: 0x021014, ambient: 1.25,
    cold: 0xa8f2ff, coldIntensity: 5.5, coldPosition: [-5, 10, 8],
    warm: 0xf07d35, warmIntensity: 7.4, warmPosition: [3, -1, 3], bloom: 0.2,
    introDistance: 5, mobilePullback: 6.4,
    shots: [
      { position: [8.8, 7.1, 12.2], target: [0, -0.6, 0], fov: 38 },
      { position: [-7.2, 4.3, 9.4], target: [0, -0.9, 0], fov: 41 },
      { position: [6.2, 2.6, 7.2], target: [0.6, -2.1, 0], fov: 35 },
      { position: [0.2, 6.2, 10.4], target: [0, -0.7, 0], fov: 36 }
    ]
  }
};

function createMacLaren(canvas, options) {
  const world = makeWorld(canvas, options, WORLDS.maclaren);
  const { scene, warm } = world;
  const root = new THREE.Group();
  root.rotation.y = -0.04;
  scene.add(root);
  const woodMap = texture("/assets/materials/wood-grain.webp", [3, 2]);
  const stoneMap = texture("/assets/materials/stone-vein.webp", [2, 1]);
  const plaster = new THREE.MeshStandardMaterial({ color: 0xc8c1b5, roughness: 0.96 });
  const walnut = new THREE.MeshStandardMaterial({ color: 0x6e3f24, map: woodMap, roughness: 0.78 });
  const oak = new THREE.MeshStandardMaterial({ color: 0xa66b3a, map: woodMap, roughness: 0.7 });
  const stone = new THREE.MeshStandardMaterial({ color: 0xded8ca, map: stoneMap, roughness: 0.34 });
  const metal = new THREE.MeshStandardMaterial({ color: 0x7c6a4e, metalness: 0.82, roughness: 0.24 });
  const floor = mesh(new THREE.PlaneGeometry(13, 10), oak, [0, -1.72, 0]);
  floor.rotation.x = -Math.PI / 2;
  const wall = mesh(new THREE.PlaneGeometry(13, 7), plaster, [0, 1.5, -3.4]);
  root.add(floor, wall);

  const pieces = [];
  [-3.75, -2.25, -0.75, 0.75, 2.25, 3.75].forEach((x, i) => {
    const cabinet = box([1.36, 2.25, 0.85], i % 2 ? oak : walnut, [x, -0.56, -2.9]);
    cabinet.userData.home = cabinet.position.clone();
    cabinet.position.add(new THREE.Vector3(i < 2 ? -6 : i > 3 ? 6 : 0, i % 2 ? 5 : 0, 0));
    cabinet.userData.start = cabinet.position.clone();
    const pull = box([0.045, 0.62, 0.06], metal, [i % 2 ? -0.45 : 0.45, 0, 0.47]);
    cabinet.add(pull);
    root.add(cabinet);
    pieces.push(cabinet);
  });
  const counter = box([9.6, 0.2, 1.16], stone, [0, 5, -2.78]);
  counter.userData.home = new THREE.Vector3(0, 0.64, -2.78);
  root.add(counter);
  const island = new THREE.Group();
  island.add(box([3.8, 1.65, 1.8], walnut, [0, -0.78, 0]), box([4.3, 0.2, 2.14], stone, [0, 0.14, 0]));
  const faucet = pipe([[-0.6, 0.25, 0], [-0.6, 1.3, 0], [0.1, 1.55, 0], [0.25, 0.82, 0]], metal, 0.045);
  island.add(faucet);
  island.position.set(6.2, -0.7, 4.3);
  island.rotation.y = -0.7;
  root.add(island);
  const pendants = [-1.25, 0, 1.25].map((x) => {
    const pendant = new THREE.Group();
    pendant.add(mesh(new THREE.CylinderGeometry(0.025, 0.025, 2.2, 8), metal, [0, 1.8, 0]));
    const shade = mesh(new THREE.ConeGeometry(0.42, 0.55, 32, 1, true), metal, [0, 0.48, 0]);
    pendant.add(shade);
    pendant.position.set(x, 5.4, 0.2);
    pendant.userData.homeY = 2.6;
    root.add(pendant);
    return pendant;
  });
  const dust = particleField(170, 0xffd2a2, [12, 7, 8], 19, 0.028);
  scene.add(dust);

  return {
    ...world,
    update(progress, time, elapsed) {
      pieces.forEach((piece, i) => piece.position.lerpVectors(piece.userData.start, piece.userData.home, phase(progress, 0.04 + i * 0.025, 0.31 + i * 0.025)));
      counter.position.lerpVectors(new THREE.Vector3(0, 5, -2.78), counter.userData.home, phase(progress, 0.27, 0.5));
      const islandT = phase(progress, 0.46, 0.72);
      island.position.set(lerp(6.2, 0.55, islandT), -0.7, lerp(4.3, 0.5, islandT));
      island.rotation.y = lerp(-0.7, 0.03, islandT);
      pendants.forEach((pendant, i) => { pendant.position.y = lerp(5.4, pendant.userData.homeY, phase(progress, 0.58 + i * 0.025, 0.78 + i * 0.025)); });
      warm.intensity = lerp(2.4, 7.2, phase(progress, 0.58, 0.9));
      dust.rotation.y = time * 0.018;
      dust.material.opacity = lerp(0.16, 0.42, phase(progress, 0.25, 0.8));
      world.updateRig(progress, time, elapsed);
    }
  };
}

function createGolden(canvas, options) {
  const world = makeWorld(canvas, options, WORLDS.golden);
  const { scene, cold, warm } = world;
  const root = new THREE.Group();
  scene.add(root);
  const rawMap = texture("/assets/materials/raw-gem.webp", [2, 2]);
  const gemMap = texture("/assets/materials/polished-gem.webp");
  const rawMat = new THREE.MeshStandardMaterial({ color: 0x5a4336, map: rawMap, roughness: 1, transparent: true, depthWrite: false });
  const gemMat = new THREE.MeshPhysicalMaterial({
    color: 0x285c76, map: gemMap, roughness: 0.22, metalness: 0.04,
    transmission: 0.08, thickness: 1.1, ior: 1.76, clearcoat: 0.7, clearcoatRoughness: 0.18,
    transparent: true, opacity: 0, depthWrite: false
  });
  const gold = new THREE.MeshStandardMaterial({ color: 0xffc45e, metalness: 0.9, roughness: 0.16, emissive: 0x5c2600, emissiveIntensity: 0.45 });
  const velvet = mesh(new THREE.CircleGeometry(8, 96), new THREE.MeshStandardMaterial({ color: 0x050405, roughness: 1 }), [0, -2.45, 0]);
  velvet.rotation.x = -Math.PI / 2;
  scene.add(velvet);
  const raw = mesh(new THREE.DodecahedronGeometry(1.62, 1), rawMat);
  const gem = mesh(new THREE.OctahedronGeometry(1.62, 4), gemMat);
  raw.renderOrder = 1;
  gem.renderOrder = 2;
  root.add(raw, gem);
  const ring = new THREE.Group();
  const band = mesh(new THREE.TorusGeometry(2.0, 0.18, 24, 120), gold, [0, -0.5, -0.65]);
  band.rotation.x = -0.12;
  ring.add(band);
  for (let i = 0; i < 4; i++) {
    const a = i * Math.PI / 2;
    const prong = box([0.12, 1.2, 0.12], gold, [Math.cos(a) * 0.88, 0.95, Math.sin(a) * 0.88]);
    prong.rotation.z = Math.sin(a) * 0.18;
    ring.add(prong);
  }
  ring.position.y = -4;
  ring.scale.setScalar(0.42);
  root.add(ring);
  const halo = mesh(new THREE.TorusGeometry(3.25, 0.015, 8, 160), new THREE.MeshBasicMaterial({ color: 0xd7b05c, transparent: true, opacity: 0.22 }), [0, 0, -1.1]);
  halo.rotation.x = Math.PI / 2;
  scene.add(halo);
  const sparks = particleField(220, 0xffdc89, [10, 7, 7], 77, 0.014);
  scene.add(sparks);

  return {
    ...world,
    update(progress, time, elapsed) {
      const cut = phase(progress, 0.15, 0.43);
      rawMat.opacity = 1 - cut;
      raw.visible = cut < 0.985;
      gemMat.opacity = cut;
      gem.visible = cut > 0.015;
      raw.scale.setScalar(lerp(1, 1.08, cut));
      gem.scale.setScalar(lerp(0.76, 1, cut));
      const set = phase(progress, 0.3, 0.55);
      ring.position.y = lerp(-4, -0.72, set);
      ring.scale.setScalar(lerp(0.42, 1, set));
      raw.rotation.set(time * 0.08, time * 0.16 + progress * 1.3, 0.12);
      gem.rotation.set(-time * 0.045, time * 0.12 + progress * 2.1, 0.34);
      ring.rotation.x = -0.14;
      ring.rotation.y = lerp(-0.38, 0, phase(progress, 0.45, 0.92));
      halo.rotation.z = time * 0.06;
      sparks.rotation.y = time * 0.022;
      sparks.material.opacity = lerp(0.18, 0.62, cut);
      warm.position.x = Math.cos(time * 0.28) * 5;
      warm.position.z = Math.sin(time * 0.28) * 4 + 4;
      warm.intensity = lerp(4.0, 7.2, cut);
      cold.intensity = lerp(4.6, 5.6, phase(progress, 0.3, 0.85));
      world.updateRig(progress, time, elapsed);
    }
  };
}

function createMorton(canvas, options) {
  const world = makeWorld(canvas, options, WORLDS.morton);
  const { scene, warm } = world;
  const root = new THREE.Group();
  root.rotation.y = -0.1;
  scene.add(root);
  const waterMap = texture("/assets/materials/water-caustics.webp", [2, 2]);
  const copperMap = texture("/assets/materials/copper-patina.webp", [3, 1]);
  const concrete = new THREE.MeshStandardMaterial({ color: 0xbdbdb6, roughness: 0.9, transparent: true });
  const floorMat = concrete.clone();
  floorMat.depthWrite = false;
  const waterMat = new THREE.MeshPhysicalMaterial({ color: 0x20aebd, map: waterMap, roughness: 0.1, transmission: 0.22, transparent: true, opacity: 0.82 });
  const copper = new THREE.MeshStandardMaterial({
    color: 0xd9803f, map: copperMap, metalness: 0.75, roughness: 0.28,
    emissive: 0x542000, emissiveIntensity: 0.35, transparent: true, opacity: 0
  });
  const machine = new THREE.MeshStandardMaterial({ color: 0x263a40, metalness: 0.5, roughness: 0.38 });
  const floor = box([7.2, 0.24, 4.3], floorMat, [0, -1.75, 0]);
  const walls = [
    box([7.2, 1.85, 0.24], concrete, [0, -0.9, -2.05]),
    box([0.24, 1.85, 4.1], concrete, [-3.5, -0.9, 0]),
    box([0.24, 1.85, 4.1], concrete, [3.5, -0.9, 0])
  ];
  root.add(floor, ...walls);
  const waterGeo = new THREE.PlaneGeometry(6.8, 3.9, 34, 24);
  const water = mesh(waterGeo, waterMat, [0, 0, 0]);
  water.rotation.x = -Math.PI / 2;
  root.add(water);
  const base = waterGeo.attributes.position.array.slice();
  const deck = [
    box([8.2, 0.28, 0.84], concrete, [0, 0.14, -2.46]),
    box([8.2, 0.28, 0.84], concrete, [0, 0.14, 2.46]),
    box([0.84, 0.28, 4.1], concrete, [-3.96, 0.14, 0]),
    box([0.84, 0.28, 4.1], concrete, [3.96, 0.14, 0])
  ];
  const homes = deck.map((part) => part.position.clone());
  root.add(...deck);
  const flow = pipe([[-2.9, -1.2, 1.25], [-2.2, -2.6, 1.25], [1.8, -2.6, 1.25], [2.8, -1.2, 0.8]], copper, 0.14);
  const back = pipe([[2.8, -1.2, -1], [2, -3.15, -1], [-1.5, -3.15, -1], [-2.9, -1.2, -0.72]], copper, 0.14);
  root.add(flow, back);
  const pump = new THREE.Group();
  const body = mesh(new THREE.CylinderGeometry(0.68, 0.68, 1.5, 32), machine);
  body.rotation.z = Math.PI / 2;
  const cap = mesh(new THREE.CylinderGeometry(0.74, 0.74, 0.22, 32), copper, [0.85, 0, 0]);
  cap.rotation.z = Math.PI / 2;
  pump.add(body, cap);
  pump.position.set(0.9, -4.3, 0.25);
  root.add(pump);
  const mist = particleField(180, 0xb9f5ff, [7, 4, 5], 103, 0.055);
  mist.position.y = 0.5;
  scene.add(mist);

  return {
    ...world,
    update(progress, time, elapsed) {
      const open = phase(progress, 0.18, 0.46);
      deck.forEach((part, i) => {
        const home = homes[i];
        if (i < 2) part.position.z = home.z + (i ? 1 : -1) * open * 2.4;
        else part.position.x = home.x + (i === 3 ? 1 : -1) * open * 2.4;
      });
      walls[2].material.opacity = lerp(1, 0.16, open);
      const reveal = phase(progress, 0.3, 0.57);
      floorMat.opacity = lerp(1, 0.12, reveal);
      copper.opacity = reveal;
      pump.position.y = lerp(-4.3, -2.72, reveal);
      warm.intensity = lerp(1.5, 9, phase(progress, 0.35, 0.66));
      mist.material.opacity = phase(progress, 0.55, 0.82) * 0.42;
      mist.rotation.y = time * 0.025;
      const positions = waterGeo.attributes.position;
      for (let i = 0; i < positions.count; i++) {
        const x = base[i * 3];
        const y = base[i * 3 + 1];
        positions.setZ(i, Math.sin(x * 1.7 + time * 1.2) * 0.035 + Math.cos(y * 2.1 - time) * 0.022);
      }
      positions.needsUpdate = true;
      waterMap.offset.set(time * 0.011, time * 0.007);
      root.rotation.y = lerp(-0.1, 0.16, progress);
      world.updateRig(progress, time, elapsed);
    }
  };
}

export function createScrollScene(site, canvas, options = {}) {
  if (!(canvas instanceof HTMLCanvasElement)) throw new Error("Scene canvas is missing.");
  const factory = site === "maclaren" ? createMacLaren : site === "golden" ? createGolden : site === "morton" ? createMorton : null;
  if (!factory) throw new Error(`Unknown scene: ${site}`);
  const world = factory(canvas, options);
  return {
    quality: world.low ? "adaptive-low" : "adaptive-high",
    resize: world.resize,
    update(progress, time, elapsed) {
      world.update(options.reducedMotion ? 1 : clamp(progress, 0, 1), options.reducedMotion ? 0 : time, elapsed);
    },
    render: world.render,
    dispose: world.dispose
  };
}
