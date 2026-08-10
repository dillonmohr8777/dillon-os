import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

/*
  One composited world per business.

  The photographic plates do not sit behind the canvas in CSS any more — they are
  planes inside the scene. The far plate takes the scene fog and the scene grade,
  the cut-out plate rides close to the lens as a real occluder, and the editorial
  frames hang in world space as panels the camera travels past. Everything shares
  one camera, so there is no seam between "the 3D" and "the art direction".
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
  return mesh(new THREE.TubeGeometry(curve, 56, radius, 12, false), material);
}

/* ---------------------------------------------------------------------------
   Procedural lighting environment.
   A tiny equirect image (dark room, one practical lamp, one cool window slab)
   run through PMREM. Metal and glass need something to reflect or they read as
   grey plastic; this is cheaper than shipping an HDR and it matches each grade.
--------------------------------------------------------------------------- */
function buildEnvironment(renderer, config) {
  const width = 128;
  const height = 64;
  const data = new Float32Array(width * height * 4);
  const sky = new THREE.Color(config.envSky);
  const floor = new THREE.Color(config.envFloor);
  const lamp = new THREE.Color(config.envLamp);
  const cool = new THREE.Color(config.envCool);
  const tint = new THREE.Color();
  const scratch = new THREE.Color();

  for (let y = 0; y < height; y++) {
    const v = y / (height - 1);
    const elevation = 1 - v;
    for (let x = 0; x < width; x++) {
      const u = x / (width - 1);
      tint.copy(floor).lerp(sky, smooth(clamp(elevation * 1.35, 0, 1)));

      // warm practical, upper right quadrant
      const lampD = Math.hypot((u - config.envLampUV[0]) * 2.0, (v - config.envLampUV[1]) * 3.4);
      const lampFall = Math.exp(-lampD * lampD * 7.5);
      tint.add(scratch.copy(lamp).multiplyScalar(lampFall * config.envLampPower));

      // cool slab, opposite side — reads as a window or a bench strip
      const coolD = Math.hypot((u - config.envCoolUV[0]) * 1.5, (v - config.envCoolUV[1]) * 4.2);
      const coolFall = Math.exp(-coolD * coolD * 4.0);
      tint.add(scratch.copy(cool).multiplyScalar(coolFall * config.envCoolPower));

      const i = (y * width + x) * 4;
      data[i] = tint.r;
      data[i + 1] = tint.g;
      data[i + 2] = tint.b;
      data[i + 3] = 1;
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
   Camera route.
   Beats carry their own timing, so two beats close in space but far apart in
   `at` make the camera dwell. That hold is most of what makes the reference
   feel directed instead of merely animated.
--------------------------------------------------------------------------- */
function buildRoute(beats) {
  const positions = beats.map((b) => new THREE.Vector3(...b.position));
  const targets = beats.map((b) => new THREE.Vector3(...b.target));
  const positionCurve = new THREE.CatmullRomCurve3(positions, false, "catmullrom", 0.35);
  const targetCurve = new THREE.CatmullRomCurve3(targets, false, "catmullrom", 0.35);
  const segments = beats.length - 1;

  return {
    beats,
    sample(progress, outPosition, outTarget) {
      const p = clamp(progress, 0, 1);
      let index = 0;
      while (index < segments - 1 && p > beats[index + 1].at) index++;
      const start = beats[index];
      const end = beats[index + 1];
      const span = Math.max(0.0001, end.at - start.at);
      const local = clamp((p - start.at) / span, 0, 1);
      const eased = smoother(local);
      const u = (index + eased) / segments;
      positionCurve.getPointAt(clamp(u, 0, 1), outPosition);
      targetCurve.getPointAt(clamp(u, 0, 1), outTarget);
      return {
        fov: lerp(start.fov, end.fov, eased),
        roll: lerp(start.roll ?? 0, end.roll ?? 0, eased),
        index,
        local: eased
      };
    }
  };
}

/* ---------------------------------------------------------------------------
   Plate planes.
   Sized from the camera frustum so a plate always covers, then left alone in
   world space so it parallaxes honestly as the camera travels.
--------------------------------------------------------------------------- */
function fitPlate(plane, camera, distance, imageAspect, overscanX, overscanY = overscanX) {
  const fovRad = THREE.MathUtils.degToRad(camera.fov * 1.25);
  const frustumHeight = 2 * Math.tan(fovRad / 2) * distance;
  const frustumWidth = frustumHeight * Math.max(camera.aspect, 0.5);
  const needWidth = frustumWidth * overscanX;
  const needHeight = frustumHeight * overscanY;
  let width = needWidth;
  let height = width / imageAspect;
  if (height < needHeight) {
    height = needHeight;
    width = height * imageAspect;
  }
  plane.scale.set(width, height, 1);
}

function makeStage(canvas, options, config) {
  const coarse = matchMedia("(pointer: coarse)").matches;
  const low = coarse || innerWidth < 720;
  const renderer = new THREE.WebGLRenderer({
    canvas, alpha: false, antialias: !low, powerPreference: "high-performance"
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
  scene.environment = buildEnvironment(renderer, config);
  scene.environmentIntensity = config.envIntensity ?? 1;

  const route = buildRoute(config.beats);
  const camera = new THREE.PerspectiveCamera(config.beats[0].fov, 1, 0.1, 260);

  const hemisphere = new THREE.HemisphereLight(config.sky, config.ground, config.ambient);
  const key = new THREE.DirectionalLight(config.cold, config.coldIntensity);
  key.position.set(...config.coldPosition);
  key.castShadow = !low;
  key.shadow.mapSize.set(low ? 512 : 1536, low ? 512 : 1536);
  key.shadow.camera.near = 0.5;
  key.shadow.camera.far = 60;
  key.shadow.camera.left = key.shadow.camera.bottom = -14;
  key.shadow.camera.right = key.shadow.camera.top = 14;
  key.shadow.bias = -0.0012;
  key.shadow.normalBias = 0.02;
  const warm = new THREE.PointLight(config.warm, config.warmIntensity, config.warmRange ?? 26, 2);
  warm.position.set(...config.warmPosition);
  scene.add(hemisphere, key, warm);

  /* Far plate — takes fog, takes the grade, never takes a second lighting pass. */
  const plateGrade = new THREE.Color(config.plateGrade ?? 0xffffff);
  const plateMaterial = new THREE.MeshBasicMaterial({
    map: plateTexture(config.plate, (map) => {
      backdropAspect = map.image.width / map.image.height;
      layout();
    }),
    color: plateGrade,
    fog: true,
    depthWrite: false,
    toneMapped: true
  });
  const backdrop = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), plateMaterial);
  backdrop.position.set(...config.platePosition);
  backdrop.renderOrder = -20;
  backdrop.frustumCulled = false;
  let backdropAspect = 16 / 9;
  scene.add(backdrop);

  /* Atmospheric separation between the plate and the built geometry. */
  const hazeMaterial = new THREE.MeshBasicMaterial({
    color: config.haze ?? config.fog,
    transparent: true,
    opacity: config.hazeOpacity ?? 0.32,
    depthWrite: false,
    fog: false
  });
  const haze = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), hazeMaterial);
  haze.position.set(config.platePosition[0], config.platePosition[1], config.platePosition[2] + config.hazeOffset);
  haze.renderOrder = -18;
  haze.frustumCulled = false;
  scene.add(haze);

  /* Near plate — the cut-out rides in front of the lens and occludes. */
  let foregroundAspect = 16 / 9;
  const foregroundMaterial = new THREE.MeshBasicMaterial({
    map: plateTexture(config.foreground, (map) => {
      foregroundAspect = map.image.width / map.image.height;
      layout();
    }),
    color: new THREE.Color(config.foregroundGrade ?? 0x8a8a8a),
    transparent: true,
    opacity: 0,
    depthWrite: false,
    fog: true,
    toneMapped: true
  });
  /*
    The near plate rides the camera at a fixed distance instead of sitting in
    world space. A world-locked cut-out breaks the moment the camera travels
    past it, and these routes travel a long way. The lateral offset lags behind
    the camera, so it still swings and parallaxes like a real foreground element
    while never ending up behind the lens.
  */
  const foreground = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), foregroundMaterial);
  foreground.renderOrder = 40;
  foreground.frustumCulled = false;
  scene.add(foreground);
  const foregroundLag = new THREE.Vector2(0, 0);
  const forward = new THREE.Vector3();
  const right = new THREE.Vector3();
  const up = new THREE.Vector3();

  /*
    The cut-out is a full-frame plate, so it stays centred and lets its own alpha
    decide what occludes. The sway is expressed as a fraction of the plate's own
    width and clamped well inside the overscan, so the plate drifts against the
    camera without ever showing an edge.
  */
  function placeForeground(dt) {
    const sway = config.foregroundSway ?? 0.05;
    camera.getWorldDirection(forward);
    right.crossVectors(forward, camera.up).normalize();
    up.crossVectors(right, forward).normalize();
    foregroundLag.x = damp(foregroundLag.x, clamp(camera.position.x * sway * 0.1, -0.5, 0.5), 1.6, dt);
    foregroundLag.y = damp(foregroundLag.y, clamp(camera.position.y * sway * 0.1, -0.5, 0.5), 1.6, dt);
    const limit = ((config.foregroundOverscan ?? 1.15) - 1) * 0.42;
    foreground.position.copy(camera.position)
      .addScaledVector(forward, config.foregroundDistance)
      .addScaledVector(right, clamp(foregroundLag.x, -limit, limit) * foreground.scale.x)
      .addScaledVector(up, clamp(foregroundLag.y, -limit, limit) * foreground.scale.y);
    foreground.quaternion.copy(camera.quaternion);
  }

  /*
    The lens shift moves the visible window sideways, so every full-frame plate
    has to be widened by the same amount or its edge walks into shot.
  */
  /*
    Two things push a plate's edge into shot: the lens shift moves the visible
    window sideways, and a tilted camera looks past the top or bottom of an
    upright plane. Both get their own allowance, vertical being the larger of
    the two because these routes crane a long way down.
  */
  function layout() {
    const shiftAllowance = 1 + 2.4 * (config.lensShift ?? 0);
    const tiltAllowance = config.tiltAllowance ?? 2.1;
    const plateOverscan = config.plateOverscan ?? 1.35;
    fitPlate(backdrop, camera, Math.abs(config.plateDistance), backdropAspect,
      plateOverscan * shiftAllowance, plateOverscan * tiltAllowance);
    fitPlate(haze, camera, Math.abs(config.plateDistance) - config.hazeOffset, backdropAspect,
      plateOverscan * 1.02 * shiftAllowance, plateOverscan * 1.02 * tiltAllowance);
    fitPlate(foreground, camera, config.foregroundDistance, foregroundAspect,
      (config.foregroundOverscan ?? 1.15) * shiftAllowance, (config.foregroundOverscan ?? 1.15) * 1.35);
  }

  let composer = null;
  if (!low && !options.reducedMotion) {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(new UnrealBloomPass(new THREE.Vector2(1, 1), config.bloom ?? 0.2, 0.45, 0.92));
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
    if (next !== state.renderScale) {
      state.renderScale = next;
      resize(state.width, state.height);
    }
  }

  function updateRig(progress, time, elapsed) {
    if (state.firstTime === null) state.firstTime = time;
    const dt = clamp(elapsed / 1000, 0.001, 0.05);
    state.pointerX = damp(state.pointerX, state.targetX, 3.0, dt);
    state.pointerY = damp(state.pointerY, state.targetY, 3.0, dt);

    const shot = route.sample(progress, p, t);
    let fov = shot.fov;

    /* Portrait viewports get their own framing rather than a squeezed desktop. */
    const tall = clamp((1.15 - camera.aspect) / 0.55, 0, 1);
    view.subVectors(p, t).normalize();
    p.addScaledVector(view, tall * config.mobilePullback);
    p.y += tall * config.mobileLift;
    fov *= 1 + tall * 0.16;

    const intro = options.reducedMotion ? 1 : smoother(clamp((time - state.firstTime) / 2.6, 0, 1));
    p.addScaledVector(view, (1 - intro) * config.introDistance);
    p.y += (1 - intro) * 0.55;

    const parallax = 1 - progress * 0.35;
    p.x += state.pointerX * 0.5 * parallax;
    p.y += state.pointerY * 0.26 * parallax;
    t.x -= state.pointerX * 0.14 * parallax;
    t.y -= state.pointerY * 0.07 * parallax;

    camera.position.copy(p);
    camera.lookAt(t);
    camera.rotation.z += shot.roll + state.pointerX * 0.006;
    camera.fov = fov;

    /*
      A lens shift rather than a pan: the subject sits in the right of the frame
      so the copy column keeps its own air, and the camera still points where it
      is actually pointing. Portrait drops the shift and recentres.
    */
    const shift = (1 - tall) * (config.lensShift ?? 0);
    if (Math.abs(shift) > 0.001) {
      camera.setViewOffset(state.width, state.height, -state.width * shift, 0, state.width, state.height);
    } else {
      camera.clearViewOffset();
    }
    camera.updateProjectionMatrix();
    placeForeground(dt);

    foregroundMaterial.opacity = intro * (config.foregroundOpacity ?? 0.92);
    adapt(elapsed);
    return shot;
  }

  const onPointerMove = (event) => {
    if (event.pointerType === "touch") return;
    state.targetX = (event.clientX / innerWidth - 0.5) * 2;
    state.targetY = (0.5 - event.clientY / innerHeight) * 2;
  };
  window.addEventListener("pointermove", onPointerMove, { passive: true });

  return {
    renderer, scene, camera, key, warm, hemisphere, low,
    backdrop, foreground, plateMaterial, foregroundMaterial, hazeMaterial,
    resize, updateRig, layout,
    render: () => composer ? composer.render() : renderer.render(scene, camera),
    dispose() {
      window.removeEventListener("pointermove", onPointerMove);
      scene.traverse((object) => {
        object.geometry?.dispose?.();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.filter(Boolean).forEach((material) => material.dispose?.());
      });
      scene.environment?.dispose?.();
      composer?.dispose();
      renderer.dispose();
    }
  };
}

/* ---------------------------------------------------------------------------
   Editorial panels.
   Real planes in world space carrying the photography, with a thin lit edge.
   Their anchors get projected every frame so the HTML captions track them —
   crisp type, real depth, one world.
--------------------------------------------------------------------------- */
function makePanels(stage, specs) {
  const group = new THREE.Group();
  stage.scene.add(group);
  const panels = specs.map((spec, index) => {
    const map = plateTexture(spec.src);
    const material = new THREE.MeshBasicMaterial({
      map, transparent: true, opacity: 0, depthWrite: false, fog: true,
      color: new THREE.Color(spec.grade ?? 0xffffff)
    });
    const frameMaterial = new THREE.MeshBasicMaterial({
      color: spec.edge ?? 0xc8c2b4, transparent: true, opacity: 0, depthWrite: false, fog: true
    });
    const [w, h] = spec.size;
    const panel = new THREE.Mesh(new THREE.PlaneGeometry(w, h), material);
    const frame = new THREE.Mesh(new THREE.PlaneGeometry(w + 0.04, h + 0.04), frameMaterial);
    frame.position.z = -0.01;
    panel.add(frame);
    panel.position.set(...spec.position);
    panel.rotation.set(spec.rotation?.[0] ?? 0, spec.rotation?.[1] ?? 0, spec.rotation?.[2] ?? 0);
    panel.renderOrder = 10 + index;
    frame.renderOrder = 9 + index;
    group.add(panel);
    return { panel, material, frameMaterial, spec, anchor: new THREE.Vector3() };
  });

  const projected = new THREE.Vector3();
  return {
    group,
    panels,
    update(progress) {
      panels.forEach(({ panel, material, frameMaterial, spec }) => {
        const shown = phase(progress, spec.in[0], spec.in[1]) * (1 - phase(progress, spec.out[0], spec.out[1]));
        material.opacity = shown * (spec.opacity ?? 1);
        frameMaterial.opacity = shown * 0.22;
        panel.visible = shown > 0.004;
        const drift = spec.drift ?? 0;
        panel.position.z = spec.position[2] + shown * drift;
        panel.scale.setScalar(lerp(0.94, 1, shown));
      });
    },
    readAnchors(camera, width, height) {
      return panels.map(({ panel, spec, material }) => {
        panel.getWorldPosition(projected);
        projected.y -= (spec.size[1] / 2) * 0.98;
        projected.project(camera);
        return {
          id: spec.id,
          label: spec.label,
          meta: spec.meta,
          x: (projected.x * 0.5 + 0.5) * width,
          y: (-projected.y * 0.5 + 0.5) * height,
          visible: material.opacity > 0.06 && projected.z < 1,
          opacity: material.opacity
        };
      });
    }
  };
}

function dustField(count, color, spread, seed, size = 0.03, opacity = 0.34) {
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
  gradient.addColorStop(0.25, "rgba(255,255,255,.75)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 32, 32);
  const sprite = new THREE.CanvasTexture(spriteCanvas);
  const material = new THREE.PointsMaterial({
    color, map: sprite, size, transparent: true, opacity, depthWrite: false,
    blending: THREE.AdditiveBlending, sizeAttenuation: true
  });
  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  return points;
}

/* =========================================================================
   MacLaren Kitchen & Bath — a room assembling itself out of the dark.
   Carcass, stone, island, light. The payoff is the room switching on.
========================================================================= */
const MACLAREN = {
  clear: 0x0d0f10, fog: 0x1b2124, fogDensity: 0.0165, exposure: 0.92,
  sky: 0xbcd6dd, ground: 0x2a2019, ambient: 0.42,
  cold: 0xa9cfdd, coldIntensity: 1.9, coldPosition: [-9, 11, 8],
  warm: 0xffb066, warmIntensity: 2.0, warmPosition: [0, 1.5, 1.6], warmRange: 22,
  envSky: 0x2b3a42, envFloor: 0x0d0c0b, envLamp: 0xffb066, envCool: 0x9fc9dc,
  envLampUV: [0.72, 0.52], envLampPower: 2.4, envCoolUV: [0.2, 0.3], envCoolPower: 2.1,
  envIntensity: 0.85, bloom: 0.14,
  plate: "/assets/scenes/maclaren-hero.webp",
  plateGrade: 0x9aa0a4, platePosition: [0.4, 1.8, -19], plateDistance: 35, plateOverscan: 1.3,
  haze: 0x1d252a, hazeOpacity: 0.34, hazeOffset: 7,
  foreground: "/assets/scenes/maclaren-foreground.png",
  foregroundGrade: 0x54514c, foregroundDistance: 2.7,
  foregroundSway: 0.035, foregroundOverscan: 1.5, foregroundOpacity: 0.62,
  lensShift: 0.13,
  introDistance: 5.4, mobilePullback: 5.2, mobileLift: 0.9,
  beats: [
    { at: 0.00, position: [8.2, 2.6, 12.4], target: [0.2, -0.35, -2.6], fov: 34, roll: 0.012 },
    { at: 0.20, position: [6.4, 2.1, 10.4], target: [0.1, -0.4, -2.6], fov: 33, roll: 0.008 },
    { at: 0.42, position: [-7.0, 2.0, 10.2], target: [-0.2, -0.45, -2.7], fov: 37, roll: -0.012 },
    { at: 0.62, position: [-3.0, 1.15, 8.4], target: [0.3, -0.6, -2.3], fov: 34, roll: -0.004 },
    { at: 0.82, position: [5.4, 1.4, 8.2], target: [0.6, -0.5, -2.1], fov: 33, roll: 0.006 },
    { at: 1.00, position: [0.7, 1.9, 9.6], target: [0, -0.3, -2.3], fov: 32, roll: 0 }
  ]
};

function createMacLaren(canvas, options) {
  const stage = makeStage(canvas, options, MACLAREN);
  const { scene, warm, key } = stage;
  const root = new THREE.Group();
  root.rotation.y = -0.05;
  scene.add(root);

  const woodMap = texture("/assets/materials/wood-grain.webp", [3, 2]);
  const floorMap = texture("/assets/materials/wood-grain.webp", [9, 7]);
  const stoneMap = texture("/assets/materials/stone-vein.webp", [2, 1]);
  const plaster = new THREE.MeshStandardMaterial({ color: 0x3a3835, roughness: 0.96, metalness: 0 });
  const walnut = new THREE.MeshStandardMaterial({ color: 0x38271d, map: woodMap, roughness: 0.66, metalness: 0.04 });
  const oak = new THREE.MeshStandardMaterial({ color: 0x5f4530, map: woodMap, roughness: 0.62, metalness: 0.03 });
  const boards = new THREE.MeshStandardMaterial({ color: 0x2f241b, map: floorMap, roughness: 0.78, metalness: 0.02 });
  const stone = new THREE.MeshStandardMaterial({ color: 0x8e8b81, map: stoneMap, roughness: 0.26, metalness: 0.02 });
  const brass = new THREE.MeshStandardMaterial({ color: 0xa8895a, metalness: 0.92, roughness: 0.26 });
  const glow = new THREE.MeshBasicMaterial({ color: 0xffc98a, transparent: true, opacity: 0 });

  const floor = mesh(new THREE.PlaneGeometry(30, 24), boards, [0, -1.75, 0]);
  floor.rotation.x = -Math.PI / 2;
  floor.castShadow = false;
  root.add(floor);

  /*
    The back wall is built as four segments around a real opening, so the plate
    is genuinely seen through a window rather than pasted behind the room. The
    finished light at the end of the sequence arrives through this hole.
  */
  const OPENING = { halfWidth: 2.55, bottom: 0.6, top: 3.4 };
  const wall = new THREE.Group();
  [
    [-5.025, 2.1, 4.95, 8.4],
    [5.025, 2.1, 4.95, 8.4],
    [0, (OPENING.bottom - 2.1) / 2, 5.1, OPENING.bottom + 2.1],
    [0, (OPENING.top + 6.3) / 2, 5.1, 6.3 - OPENING.top]
  ].forEach(([x, y, w, h]) => {
    const segment = box([w, h, 0.3], plaster, [x, y, 0]);
    segment.castShadow = false;
    wall.add(segment);
  });
  wall.position.z = -3.6;
  root.add(wall);

  /* Reveal returns around the opening, so the wall reads as having thickness. */
  const reveal = new THREE.Group();
  [[-2.55, 2.0], [2.55, 2.0]].forEach(([x, y]) => reveal.add(box([0.3, 2.9, 0.42], plaster, [x, y, 0])));
  reveal.add(box([5.4, 0.3, 0.42], plaster, [0, 3.4, 0]));
  reveal.add(box([5.4, 0.3, 0.42], plaster, [0, 0.6, 0]));
  reveal.position.set(0, 0, -3.4);
  root.add(reveal);

  const cabinets = [];
  [-4.05, -2.55, -1.05, 1.05, 2.55, 4.05].forEach((x, i) => {
    const carcass = box([1.4, 2.3, 0.9], i % 2 ? oak : walnut, [x, -0.55, -2.85]);
    carcass.userData.home = carcass.position.clone();
    carcass.position.add(new THREE.Vector3(i < 3 ? -9 : 9, i % 2 ? 4.5 : -1.2, -2.4));
    carcass.userData.start = carcass.position.clone();
    const pull = box([0.05, 0.66, 0.07], brass, [i % 2 ? -0.47 : 0.47, 0.15, 0.5]);
    carcass.add(pull);
    root.add(carcass);
    cabinets.push(carcass);
  });

  /* Under-cabinet strip light — the practical that sells the switch-on. */
  const strip = box([8.9, 0.05, 0.5], glow, [0, 0.5, -2.5]);
  strip.castShadow = false;
  root.add(strip);

  const counter = box([9.9, 0.22, 1.22], stone, [0, 6.4, -2.8]);
  counter.userData.home = new THREE.Vector3(0, 0.68, -2.8);
  root.add(counter);

  const splash = box([9.9, 1.55, 0.1], stone, [0, 1.56, -3.31]);
  splash.userData.home = splash.position.clone();
  splash.scale.y = 0.001;
  root.add(splash);

  const island = new THREE.Group();
  island.add(
    box([4.0, 1.7, 1.9], walnut, [0, -0.8, 0]),
    box([4.55, 0.22, 2.24], stone, [0, 0.16, 0])
  );
  const faucet = pipe([[-0.65, 0.27, 0], [-0.65, 1.35, 0], [0.12, 1.62, 0], [0.28, 0.86, 0]], brass, 0.05);
  const basin = mesh(new THREE.BoxGeometry(1.15, 0.16, 0.78), stone, [-0.2, 0.1, 0.05]);
  island.add(faucet, basin);
  island.position.set(7.4, -0.75, 4.9);
  island.rotation.y = -0.78;
  root.add(island);

  const pendants = [-1.35, 0, 1.35].map((x) => {
    const pendant = new THREE.Group();
    pendant.add(mesh(new THREE.CylinderGeometry(0.022, 0.022, 2.4, 8), brass, [0, 1.9, 0]));
    const shade = mesh(new THREE.ConeGeometry(0.4, 0.5, 32, 1, true), brass, [0, 0.5, 0]);
    shade.material = brass;
    const bulb = mesh(new THREE.SphereGeometry(0.1, 16, 12), glow, [0, 0.36, 0]);
    bulb.castShadow = false;
    pendant.add(shade, bulb);
    pendant.position.set(x, 6.2, 0.35);
    pendant.userData.homeY = 2.45;
    root.add(pendant);
    return pendant;
  });

  const dust = dustField(110, 0xffd6ab, [11, 5, 7], 19, 0.02, 0.13);
  dust.position.y = 1;
  scene.add(dust);

  const panels = makePanels(stage, [
    {
      id: "survey", label: "Survey", meta: "Existing room / measured",
      src: "/assets/editorial/maclaren/01.webp", size: [3.5, 4.35],
      position: [-6.6, 1.5, 1.4], rotation: [0, 0.42, 0.01], grade: 0xffffff,
      in: [0.06, 0.18], out: [0.34, 0.44], drift: 0.7
    },
    {
      id: "carcass", label: "Carcass", meta: "Cabinet run / dry fit",
      src: "/assets/editorial/maclaren/03.webp", size: [3.1, 3.85],
      position: [6.4, 1.1, 0.9], rotation: [0, -0.5, -0.015], grade: 0xffffff,
      in: [0.2, 0.32], out: [0.48, 0.58], drift: 0.6
    },
    {
      id: "stone", label: "Stone", meta: "Slab / seam / edge profile",
      src: "/assets/editorial/maclaren/04.webp", size: [3.0, 2.1],
      position: [-5.2, 2.9, 3.2], rotation: [0, 0.34, 0.02], grade: 0xffffff,
      in: [0.42, 0.54], out: [0.7, 0.8], drift: 0.5
    },
    {
      id: "finish", label: "Finish", meta: "Hardware / light / the last pass",
      src: "/assets/editorial/maclaren/05.webp", size: [3.3, 4.1],
      position: [5.4, 1.6, 3.6], rotation: [0, -0.4, 0.01], grade: 0xffffff,
      in: [0.62, 0.74], out: [0.94, 1.01], drift: 0.6
    }
  ]);

  return {
    ...stage,
    panels,
    update(progress, time, elapsed) {
      cabinets.forEach((carcass, i) => {
        const t = phase(progress, 0.05 + i * 0.022, 0.3 + i * 0.026);
        carcass.position.lerpVectors(carcass.userData.start, carcass.userData.home, t);
      });
      const slab = phase(progress, 0.3, 0.52);
      counter.position.lerpVectors(new THREE.Vector3(0, 6.4, -2.8), counter.userData.home, slab);
      splash.scale.y = Math.max(0.001, phase(progress, 0.44, 0.6));
      splash.position.y = lerp(0.79, 1.56, phase(progress, 0.44, 0.6));

      const islandT = phase(progress, 0.5, 0.75);
      island.position.set(lerp(7.4, 0.6, islandT), -0.75, lerp(4.9, 0.7, islandT));
      island.rotation.y = lerp(-0.78, 0.02, islandT);

      pendants.forEach((pendant, i) => {
        pendant.position.y = lerp(6.2, pendant.userData.homeY, phase(progress, 0.62 + i * 0.03, 0.82 + i * 0.03));
      });

      const switchOn = phase(progress, 0.44, 0.8);
      glow.opacity = switchOn;
      warm.intensity = lerp(1.6, 11, switchOn);
      key.intensity = lerp(1.9, 1.1, phase(progress, 0.5, 0.95));
      stage.plateMaterial.color.setScalar(lerp(0.6, 1.15, phase(progress, 0.1, 0.9)));
      stage.hazeMaterial.opacity = lerp(0.42, 0.16, phase(progress, 0.15, 0.85));

      dust.rotation.y = time * 0.016;
      dust.material.opacity = lerp(0.05, 0.17, phase(progress, 0.25, 0.85));
      panels.update(progress);
      return stage.updateRig(progress, time, elapsed);
    }
  };
}

/* =========================================================================
   Golden Eagle Jewelry — the bench, not a floating solid.
   A rough stone sitting on wood under one hard lamp, cut down into a faceted
   gem, then seated into a band. Everything has a surface under it.
========================================================================= */
const GOLDEN = {
  clear: 0x040405, fog: 0x090809, fogDensity: 0.03, exposure: 0.98,
  sky: 0x1d1710, ground: 0x020202, ambient: 0.46,
  cold: 0x6f95d8, coldIntensity: 1.5, coldPosition: [-7, 5.5, 5],
  warm: 0xffc06a, warmIntensity: 7, warmPosition: [1.4, 2.2, 1.9], warmRange: 12,
  envSky: 0x14100b, envFloor: 0x010101, envLamp: 0xffcf8d, envCool: 0x4f6f9e,
  envLampUV: [0.62, 0.36], envLampPower: 5.5, envCoolUV: [0.16, 0.42], envCoolPower: 1.5,
  envIntensity: 1.15, bloom: 0.22,
  plate: "/assets/scenes/golden-hero.webp",
  plateGrade: 0x5f5a52, platePosition: [0.6, 0.4, -9], plateDistance: 17, plateOverscan: 1.3,
  haze: 0x0a0908, hazeOpacity: 0.3, hazeOffset: 4.2,
  foreground: "/assets/scenes/golden-foreground.png",
  foregroundGrade: 0x46403a, foregroundDistance: 1.7,
  foregroundSway: 0.03, foregroundOverscan: 1.5, foregroundOpacity: 0.58,
  lensShift: 0.14,
  introDistance: 2.6, mobilePullback: 2.6, mobileLift: 0.4,
  beats: [
    { at: 0.00, position: [2.6, 1.9, 8.2], target: [-0.15, -0.3, 0], fov: 32, roll: 0.008 },
    { at: 0.18, position: [1.9, 1.15, 5.9], target: [-0.1, -0.22, 0], fov: 30, roll: 0.004 },
    { at: 0.40, position: [-3.4, 1.5, 5.4], target: [-0.05, -0.14, 0], fov: 32, roll: -0.01 },
    { at: 0.60, position: [-1.3, 0.62, 4.5], target: [0, -0.08, 0], fov: 28, roll: -0.003 },
    { at: 0.80, position: [3.1, 1.3, 5.0], target: [0.05, -0.12, 0], fov: 30, roll: 0.008 },
    { at: 1.00, position: [1.5, 1.55, 6.0], target: [-0.05, -0.18, 0], fov: 30, roll: 0 }
  ]
};

/* A believable brilliant: crown facets, a girdle, and a pavilion that comes to
   a point. Built from lathe profiles so the facets catch the lamp separately. */
function brilliantGeometry(radius = 1, segments = 16) {
  const crown = new THREE.ConeGeometry(radius, radius * 0.42, segments, 1);
  crown.translate(0, radius * 0.21, 0);
  const table = new THREE.CylinderGeometry(radius * 0.56, radius, radius * 0.34, segments, 1);
  table.translate(0, radius * 0.59, 0);
  const girdle = new THREE.CylinderGeometry(radius, radius, radius * 0.09, segments, 1);
  girdle.translate(0, -radius * 0.045, 0);
  const pavilion = new THREE.ConeGeometry(radius, radius * 1.25, segments, 1);
  pavilion.rotateX(Math.PI);
  pavilion.translate(0, -radius * 0.72, 0);
  return [crown, table, girdle, pavilion];
}

function createGolden(canvas, options) {
  const stage = makeStage(canvas, options, GOLDEN);
  const { scene, warm, key, low } = stage;
  const root = new THREE.Group();
  scene.add(root);

  const woodMap = texture("/assets/materials/wood-grain.webp", [2, 2]);
  const rawMap = texture("/assets/materials/raw-gem.webp", [2, 2]);

  /* The bench. Nothing in this scene floats without something under it. */
  const benchTop = new THREE.MeshStandardMaterial({ color: 0x2c1d13, map: woodMap, roughness: 0.72, metalness: 0.05 });
  const bench = box([9, 0.42, 5.2], benchTop, [0, -1.05, -0.2]);
  bench.castShadow = false;
  const benchEdge = box([9, 0.16, 0.2], benchTop, [0, -0.8, 2.3]);
  const pad = mesh(new THREE.CircleGeometry(1.5, 48), new THREE.MeshStandardMaterial({ color: 0x14100c, roughness: 0.98 }), [0, -0.835, 0]);
  pad.rotation.x = -Math.PI / 2;
  pad.castShadow = false;
  root.add(bench, benchEdge, pad);

  /* Bench tools, kept quiet and in the near-dark so they read as context. */
  const steel = new THREE.MeshStandardMaterial({ color: 0x8e9299, metalness: 0.9, roughness: 0.34 });
  const tools = new THREE.Group();
  [-2.35, -2.12, -1.89].forEach((x, i) => {
    const tool = mesh(new THREE.CylinderGeometry(0.022, 0.012, 0.92 + i * 0.1, 10), steel, [x, -0.62, -1.5]);
    tool.rotation.z = 1.42 + i * 0.06;
    tool.rotation.y = 0.2;
    tools.add(tool);
  });
  const loupe = new THREE.Group();
  loupe.add(mesh(new THREE.TorusGeometry(0.19, 0.032, 12, 36), steel));
  loupe.add(mesh(new THREE.CircleGeometry(0.175, 28), new THREE.MeshPhysicalMaterial({
    color: 0x1a2530, roughness: 0.08, metalness: 0, transparent: true, opacity: 0.42
  })));
  loupe.position.set(1.9, -0.8, 0.75);
  loupe.rotation.set(-Math.PI / 2.05, 0, 0.4);
  tools.add(loupe);
  root.add(tools);

  /* Raw stone → cut gem. */
  const rawMat = new THREE.MeshStandardMaterial({
    color: 0x7d6d5c, map: rawMap, roughness: 0.92, metalness: 0.08, transparent: true, depthWrite: true
  });
  const raw = mesh(new THREE.DodecahedronGeometry(0.52, 1), rawMat, [0, -0.36, 0]);
  raw.rotation.set(0.3, 0.5, 0.15);

  const gemMat = new THREE.MeshPhysicalMaterial({
    color: 0x0d3d5c, roughness: 0.02, metalness: 0,
    transmission: low ? 0 : 0.7, thickness: 0.9, ior: 2.15,
    clearcoat: 1, clearcoatRoughness: 0.02,
    attenuationColor: new THREE.Color(0x1f7fa8), attenuationDistance: 0.55,
    transparent: true, opacity: 0, depthWrite: false,
    envMapIntensity: 1.15, specularIntensity: 1
  });
  const gem = new THREE.Group();
  brilliantGeometry(0.46, 18).forEach((geometry) => {
    const part = new THREE.Mesh(geometry, gemMat);
    part.castShadow = true;
    gem.add(part);
  });
  gem.position.set(0, -0.21, 0);
  gem.visible = false;
  root.add(raw, gem);

  /* Chips fly off during the cut and settle on the pad. */
  const chipMat = new THREE.MeshStandardMaterial({ color: 0x8f7a52, roughness: 0.34, metalness: 0.3, transparent: true, opacity: 0 });
  const chipRandom = seeded(404);
  const chips = Array.from({ length: 10 }, () => {
    const chip = mesh(new THREE.TetrahedronGeometry(0.018 + chipRandom() * 0.016), chipMat);
    const angle = chipRandom() * Math.PI * 2;
    const radius = 0.7 + chipRandom() * 1.2;
    chip.userData.rest = new THREE.Vector3(Math.cos(angle) * radius * 0.6, -0.78, Math.sin(angle) * radius * 0.42);
    chip.userData.spin = new THREE.Vector3(chipRandom(), chipRandom(), chipRandom()).multiplyScalar(2.4);
    root.add(chip);
    return chip;
  });

  /* The band rises from under the bench line and takes the stone. */
  const gold = new THREE.MeshStandardMaterial({
    color: 0xf0b24a, metalness: 1, roughness: 0.14, envMapIntensity: 2.2
  });
  const ring = new THREE.Group();
  const band = mesh(new THREE.TorusGeometry(0.42, 0.055, 18, 80), gold, [0, -0.36, 0]);
  band.rotation.x = Math.PI / 2 - 0.2;
  ring.add(band);
  for (let i = 0; i < 4; i++) {
    const a = i * Math.PI / 2 + Math.PI / 4;
    const prong = mesh(new THREE.CapsuleGeometry(0.026, 0.34, 4, 10), gold, [Math.cos(a) * 0.31, 0.04, Math.sin(a) * 0.31]);
    prong.rotation.set(Math.sin(a) * 0.24, 0, -Math.cos(a) * 0.24);
    ring.add(prong);
  }
  const seat = mesh(new THREE.CylinderGeometry(0.33, 0.24, 0.12, 24, 1, true), gold, [0, -0.13, 0]);
  ring.add(seat);
  ring.position.y = -2.4;
  root.add(ring);

  const sparks = dustField(110, 0xffe2a4, [3.4, 2.2, 2.2], 77, 0.008, 0.14);
  sparks.position.y = -0.1;
  scene.add(sparks);

  const panels = makePanels(stage, [
    {
      id: "rough", label: "Rough", meta: "Before any decision is made",
      src: "/assets/editorial/golden/01.webp", size: [1.9, 2.35],
      position: [-3.5, 0.95, 0.4], rotation: [0, 0.5, 0.015], grade: 0xffffff,
      in: [0.05, 0.16], out: [0.32, 0.42], drift: 0.35
    },
    {
      id: "cut", label: "Cut", meta: "Angle, table, girdle",
      src: "/assets/editorial/golden/03.webp", size: [1.7, 2.1],
      position: [3.3, 0.75, 0.2], rotation: [0, -0.55, -0.02], grade: 0xffffff,
      in: [0.24, 0.36], out: [0.5, 0.6], drift: 0.3
    },
    {
      id: "setting", label: "Setting", meta: "Metal closing on stone",
      src: "/assets/editorial/golden/04.webp", size: [1.6, 1.95],
      position: [-3.0, 1.35, 1.5], rotation: [0, 0.46, 0.02], grade: 0xffffff,
      in: [0.46, 0.58], out: [0.74, 0.84], drift: 0.3
    },
    {
      id: "worn", label: "Worn", meta: "The object in a life",
      src: "/assets/editorial/golden/05.webp", size: [1.8, 2.2],
      position: [2.9, 1.1, 1.7], rotation: [0, -0.44, 0.01], grade: 0xffffff,
      in: [0.68, 0.8], out: [0.96, 1.02], drift: 0.3
    }
  ]);

  const chipStart = new THREE.Vector3();
  return {
    ...stage,
    panels,
    update(progress, time, elapsed) {
      const cut = phase(progress, 0.16, 0.44);
      rawMat.opacity = 1 - cut;
      raw.visible = cut < 0.99;
      raw.scale.setScalar(lerp(1, 0.86, cut));
      raw.rotation.y = 0.5 + time * 0.09 + progress * 0.9;

      gemMat.opacity = cut;
      gem.visible = cut > 0.01;
      gem.scale.setScalar(lerp(0.6, 1, cut));
      gem.rotation.y = time * 0.11 + progress * 1.6;

      chipMat.opacity = phase(progress, 0.2, 0.34) * (1 - phase(progress, 0.86, 1)) * 0.85;
      chips.forEach((chip, i) => {
        const t = phase(progress, 0.2 + i * 0.006, 0.42 + i * 0.008);
        chipStart.set(0, -0.34, 0);
        chip.position.lerpVectors(chipStart, chip.userData.rest, t);
        chip.position.y += Math.sin(t * Math.PI) * 0.42;
        chip.rotation.set(chip.userData.spin.x * t * 4, chip.userData.spin.y * t * 4, chip.userData.spin.z * t * 4);
      });

      const set = phase(progress, 0.42, 0.68);
      ring.position.y = lerp(-2.4, -0.42, set);
      ring.rotation.y = lerp(-0.7, 0.06, set) + time * 0.05;
      gem.position.y = lerp(-0.21, -0.10, set);

      const light = phase(progress, 0.6, 0.94);
      warm.intensity = lerp(3.4, 11, light);
      warm.position.x = 1.4 + Math.cos(time * 0.22) * 0.5;
      warm.position.z = 1.9 + Math.sin(time * 0.22) * 0.4;
      key.intensity = lerp(0.9, 1.9, phase(progress, 0.3, 0.9));
      sparks.rotation.y = time * 0.02;
      sparks.material.opacity = lerp(0.06, 0.2, cut);
      stage.plateMaterial.color.setScalar(lerp(0.62, 1.05, phase(progress, 0.1, 0.9)));
      stage.hazeMaterial.opacity = lerp(0.4, 0.14, phase(progress, 0.15, 0.85));

      panels.update(progress);
      return stage.updateRig(progress, time, elapsed);
    }
  };
}

/* =========================================================================
   Morton Electric Pool & Spa — the deck opens and the system underneath
   becomes the subject. Water, then what moves the water.
========================================================================= */
const MORTON = {
  clear: 0x04141a, fog: 0x07222b, fogDensity: 0.019, exposure: 1.08,
  sky: 0x74dcea, ground: 0x03151b, ambient: 0.92,
  cold: 0xb2f2ff, coldIntensity: 2.9, coldPosition: [-6, 12, 9],
  warm: 0xff8a3d, warmIntensity: 1.2, warmPosition: [-1.0, -1.7, 0.5], warmRange: 17,
  envSky: 0x1d4a58, envFloor: 0x020d11, envLamp: 0xff9c52, envCool: 0x8fe6f7,
  envLampUV: [0.78, 0.62], envLampPower: 2.2, envCoolUV: [0.24, 0.24], envCoolPower: 3.0,
  envIntensity: 0.95, bloom: 0.2,
  plate: "/assets/scenes/morton-hero.webp",
  plateGrade: 0x63696d, platePosition: [0.2, 2.6, -16], plateDistance: 32, plateOverscan: 1.3,
  haze: 0x0a2530, hazeOpacity: 0.36, hazeOffset: 6.5,
  foreground: "/assets/scenes/morton-foreground.png",
  foregroundGrade: 0x4c5153, foregroundDistance: 2.8,
  foregroundSway: 0.035, foregroundOverscan: 1.5, foregroundOpacity: 0.6,
  lensShift: 0.13,
  introDistance: 5.6, mobilePullback: 5.6, mobileLift: 1.05,
  beats: [
    { at: 0.00, position: [7.8, 3.9, 12.2], target: [0, -0.8, 0], fov: 36, roll: 0.01 },
    { at: 0.20, position: [5.6, 3.0, 10.4], target: [0, -0.9, 0], fov: 35, roll: 0.006 },
    { at: 0.42, position: [-7.4, 2.6, 10.2], target: [-0.2, -1.2, 0], fov: 37, roll: -0.012 },
    /*
      The plant sits ~3 units down inside a 4.5-deep shell, and the static apron
      runs from z 2.4 outward. Any camera low enough to feel "at the poolside"
      puts its sight line under the apron lip, which is why the reveal never
      read. These three beats crane up as the deck opens so the line into the
      shell clears the near coping — the payoff is only a payoff if it is in
      frame.
    */
    { at: 0.62, position: [-4.0, 7.0, 7.6], target: [0, -2.3, 0], fov: 40, roll: -0.006 },
    { at: 0.82, position: [4.6, 6.6, 7.0], target: [0.3, -2.4, 0], fov: 38, roll: 0.008 },
    { at: 1.00, position: [1.6, 7.4, 8.2], target: [0.1, -2.1, 0], fov: 40, roll: 0 }
  ]
};

function createMorton(canvas, options) {
  const stage = makeStage(canvas, options, MORTON);
  const { scene, warm, key, low } = stage;
  const root = new THREE.Group();
  root.rotation.y = -0.1;
  scene.add(root);

  const waterMap = texture("/assets/materials/water-caustics.webp", [2, 2]);
  const copperMap = texture("/assets/materials/copper-patina.webp", [3, 1]);
  const stoneMap = texture("/assets/materials/stone-vein.webp", [3, 2]);

  const concrete = new THREE.MeshStandardMaterial({ color: 0x8f9490, map: stoneMap, roughness: 0.88, metalness: 0.02, transparent: true });
  const shellMat = concrete.clone();
  const deckMat = concrete.clone();
  deckMat.color.setHex(0x6e736f);
  const linerMat = new THREE.MeshStandardMaterial({ color: 0x0a3f4e, roughness: 0.55, metalness: 0.04 });

  const waterMat = new THREE.MeshPhysicalMaterial({
    color: 0x0e5f74, map: waterMap, roughness: 0.05, metalness: 0.02,
    transmission: low ? 0 : 0.3, thickness: 0.6, ior: 1.33,
    transparent: true, opacity: 0.94, envMapIntensity: 2.4
  });

  const copper = new THREE.MeshStandardMaterial({
    color: 0x9a6a48, map: copperMap, metalness: 0.82, roughness: 0.42,
    transparent: true, opacity: 0, envMapIntensity: 1.6
  });
  const machine = new THREE.MeshStandardMaterial({ color: 0x27383f, metalness: 0.55, roughness: 0.42, transparent: true, opacity: 0 });
  const heatGlow = new THREE.MeshBasicMaterial({ color: 0xff7a2e, transparent: true, opacity: 0, fog: false });

  /* Pool shell sunk into a deck. */
  const shellFloor = box([7.4, 0.3, 4.5], shellMat, [0, -1.9, 0]);
  shellFloor.castShadow = false;
  const liner = [
    box([7.4, 1.95, 0.14], linerMat, [0, -0.92, -2.18]),
    box([7.4, 1.95, 0.14], linerMat, [0, -0.92, 2.18]),
    box([0.14, 1.95, 4.4], linerMat, [-3.63, -0.92, 0]),
    box([0.14, 1.95, 4.4], linerMat, [3.63, -0.92, 0])
  ];
  root.add(shellFloor, ...liner);

  const waterGeo = new THREE.PlaneGeometry(7.1, 4.2, 40, 28);
  const water = mesh(waterGeo, waterMat, [0, 0.02, 0]);
  water.rotation.x = -Math.PI / 2;
  water.castShadow = false;
  root.add(water);
  const base = waterGeo.attributes.position.array.slice();

  /*
    A static surround so the pool is a hole in a deck rather than a tank hanging
    in the dark. Only the four inner panels move.
  */
  const apronMat = new THREE.MeshStandardMaterial({
    color: 0x2a3236, map: texture("/assets/materials/stone-vein.webp", [14, 9]),
    roughness: 0.94, metalness: 0.02
  });
  const surround = new THREE.Group();
  [
    [0, -7.4, 24, 10],
    [0, 7.4, 24, 10],
    [-7.9, 0, 8.4, 4.6],
    [7.9, 0, 8.4, 4.6]
  ].forEach(([x, z, w, d]) => {
    const slab = box([w, 0.3, d], apronMat, [x, 0.16, z]);
    slab.castShadow = false;
    surround.add(slab);
  });
  root.add(surround);

  const deck = [
    box([7.6, 0.3, 1.1], deckMat, [0, 0.16, -1.7]),
    box([7.6, 0.3, 1.1], deckMat, [0, 0.16, 1.7]),
    box([1.1, 0.3, 2.4], deckMat, [-3.2, 0.16, 0]),
    box([1.1, 0.3, 2.4], deckMat, [3.2, 0.16, 0])
  ];
  const deckHome = deck.map((part) => part.position.clone());
  root.add(...deck);

  /* The system. Hidden until the deck opens, then it is the whole point. */
  const plant = new THREE.Group();
  const supply = pipe([[-3.0, -1.35, 1.4], [-2.3, -2.9, 1.4], [1.9, -2.9, 1.4], [3.0, -1.35, 0.9]], copper, 0.15);
  const ret = pipe([[3.0, -1.35, -1.1], [2.1, -3.45, -1.1], [-1.6, -3.45, -1.1], [-3.0, -1.35, -0.8]], copper, 0.15);
  const manifold = pipe([[-1.8, -3.45, -1.1], [-1.8, -3.2, 0.2], [-1.8, -2.9, 1.4]], copper, 0.11);
  plant.add(supply, ret, manifold);

  const pump = new THREE.Group();
  const pumpBody = mesh(new THREE.CylinderGeometry(0.62, 0.62, 1.5, 32), machine);
  pumpBody.rotation.z = Math.PI / 2;
  const pumpCap = mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.22, 32), copper, [0.84, 0, 0]);
  pumpCap.rotation.z = Math.PI / 2;
  const impeller = mesh(new THREE.TorusGeometry(0.34, 0.09, 10, 24), copper, [-0.8, 0, 0]);
  impeller.rotation.y = Math.PI / 2;
  pump.add(pumpBody, pumpCap, impeller);
  pump.position.set(1.1, -3.05, 0.2);
  plant.add(pump);

  const heater = new THREE.Group();
  heater.add(mesh(new THREE.BoxGeometry(1.25, 1.05, 0.95), machine));
  const coil = mesh(new THREE.TorusGeometry(0.3, 0.06, 10, 28), heatGlow, [0, 0, 0.5]);
  coil.castShadow = false;
  heater.add(coil);
  heater.position.set(-2.3, -3.0, -0.2);
  plant.add(heater);
  root.add(plant);

  const steam = dustField(90, 0xcdf6ff, [6.4, 2.4, 3.8], 103, 0.05, 0);
  steam.position.y = 0.7;
  scene.add(steam);
  const spray = dustField(45, 0x9de8ff, [5.2, 1.0, 3.0], 51, 0.014, 0);
  spray.position.y = 0.25;
  scene.add(spray);

  const panels = makePanels(stage, [
    {
      id: "surface", label: "Surface", meta: "What the customer sees",
      src: "/assets/editorial/morton/01.webp", size: [3.4, 2.4],
      position: [-6.2, 2.4, 2.2], rotation: [0, 0.44, 0.012], grade: 0xffffff,
      in: [0.05, 0.17], out: [0.33, 0.43], drift: 0.6
    },
    {
      id: "plant", label: "Plant", meta: "Pump, filter, heater",
      src: "/assets/editorial/morton/03.webp", size: [3.0, 3.7],
      position: [6.1, 1.5, 1.4], rotation: [0, -0.5, -0.015], grade: 0xffffff,
      in: [0.22, 0.34], out: [0.5, 0.6], drift: 0.5
    },
    {
      id: "service", label: "Service", meta: "The visit that prevents the failure",
      src: "/assets/editorial/morton/04.webp", size: [3.1, 2.2],
      position: [-5.4, 1.1, 3.4], rotation: [0, 0.38, 0.02], grade: 0xffffff,
      in: [0.44, 0.56], out: [0.72, 0.82], drift: 0.5
    },
    {
      id: "running", label: "Running", meta: "Whole system, working",
      src: "/assets/editorial/morton/06.webp", size: [3.4, 2.4],
      position: [5.0, 2.3, 3.8], rotation: [0, -0.4, 0.01], grade: 0xffffff,
      in: [0.66, 0.78], out: [0.95, 1.02], drift: 0.5
    }
  ]);

  return {
    ...stage,
    panels,
    update(progress, time, elapsed) {
      const open = phase(progress, 0.2, 0.48);
      deck.forEach((part, i) => {
        const home = deckHome[i];
        if (i < 2) part.position.z = home.z + (i ? 1 : -1) * open * 1.35;
        else part.position.x = home.x + (i === 3 ? 1 : -1) * open * 1.45;
        part.position.y = home.y + open * 0.07;
      });

      const reveal = phase(progress, 0.34, 0.62);
      /*
        Transmissive surfaces refract the opaque backbuffer, and three.js leaves
        transparent objects out of that pass — so the plant could never show
        through a transmissive pool. Trade refraction for plain alpha as the
        cutaway opens, and hand the plant back to the opaque pass once it has
        finished fading in, so it is genuinely visible rather than merely there.
      */
      waterMat.transmission = low ? 0 : lerp(0.3, 0, reveal);
      copper.transparent = reveal < 0.995;
      machine.transparent = reveal < 0.995;
      shellMat.opacity = lerp(1, 0.04, reveal);
      linerMat.opacity = lerp(1, 0.18, reveal);
      linerMat.transparent = true;
      waterMat.opacity = lerp(0.94, 0.13, reveal);
      copper.opacity = reveal;
      machine.opacity = reveal;
      plant.position.y = lerp(-1.1, 0.95, reveal);

      const run = phase(progress, 0.6, 0.88);
      heatGlow.opacity = run * 0.85;
      warm.intensity = lerp(0.4, 6.5, run);
      key.intensity = lerp(2.4, 1.7, phase(progress, 0.4, 0.95));
      impeller.rotation.x = time * (2 + run * 9);
      steam.material.opacity = run * 0.22;
      steam.rotation.y = time * 0.03;
      steam.position.y = 0.7 + Math.sin(time * 0.5) * 0.12;
      spray.material.opacity = lerp(0.07, 0.015, reveal);

      const positions = waterGeo.attributes.position;
      const chop = 1 - reveal * 0.55;
      for (let i = 0; i < positions.count; i++) {
        const x = base[i * 3];
        const y = base[i * 3 + 1];
        positions.setZ(i, (Math.sin(x * 1.6 + time * 1.15) * 0.04 + Math.cos(y * 2.0 - time * 0.9) * 0.026) * chop);
      }
      positions.needsUpdate = true;
      waterMap.offset.set(time * 0.012, time * 0.008);

      stage.plateMaterial.color.setScalar(lerp(0.62, 1.05, phase(progress, 0.1, 0.9)));
      stage.hazeMaterial.opacity = lerp(0.44, 0.18, phase(progress, 0.15, 0.85));
      root.rotation.y = lerp(-0.1, 0.14, smooth(progress));

      panels.update(progress);
      return stage.updateRig(progress, time, elapsed);
    }
  };
}

export function createScrollScene(site, canvas, options = {}) {
  if (!(canvas instanceof HTMLCanvasElement)) throw new Error("Scene canvas is missing.");
  const factory = site === "maclaren" ? createMacLaren
    : site === "golden" ? createGolden
      : site === "morton" ? createMorton : null;
  if (!factory) throw new Error(`Unknown scene: ${site}`);
  const world = factory(canvas, options);

  return {
    quality: world.low ? "adaptive-low" : "adaptive-high",
    resize: world.resize,
    update(progress, time, elapsed) {
      return world.update(
        options.reducedMotion ? 1 : clamp(progress, 0, 1),
        options.reducedMotion ? 4 : time,
        elapsed
      );
    },
    anchors(width, height) {
      return world.panels.readAnchors(world.camera, width, height);
    },
    render: world.render,
    dispose: world.dispose
  };
}
