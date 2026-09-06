// GLSL for the city pass and the ground pass.
'use strict';

const CITY_VS = `#version 300 es
in vec3 aPos;
in float aHeight;
in float aTintKind;      // fractional part is the tint; >=500 marks a roof
uniform mat4 uViewProj;
out vec3 vWorld;
out float vHeight;
out float vTint;
out float vIsRoof;
void main() {
  vWorld = aPos;
  vHeight = aHeight;
  vIsRoof = aTintKind >= 500.0 ? 1.0 : 0.0;
  vTint = aTintKind - vIsRoof * 1000.0;
  gl_Position = uViewProj * vec4(aPos, 1.0);
}`;

// The normal comes from screen-space derivatives rather than a stored
// attribute. That is exact for flat faces, and with back-face culling on, the
// visible side is always the outward side, so flipping toward the eye
// recovers the true outward normal.
const SHADING = `
float shadowAt(vec3 p) {
  vec2 uv = (p.xy - uShadowOrigin) / (uShadowCell * uShadowSize);
  if (uv.x < 0.0 || uv.y < 0.0 || uv.x > 1.0 || uv.y > 1.0) return 1.0;
  vec2 t = uv * uShadowSize - 0.5;
  vec2 f = fract(t);
  vec2 b = (floor(t) + 0.5) / uShadowSize;
  float s00 = texture(uShadow, b).r;
  float s10 = texture(uShadow, b + vec2(1.0 / uShadowSize, 0.0)).r;
  float s01 = texture(uShadow, b + vec2(0.0, 1.0 / uShadowSize)).r;
  float s11 = texture(uShadow, b + vec2(1.0 / uShadowSize)).r;
  float ceilH = mix(mix(s00, s10, f.x), mix(s01, s11, f.x), f.y);
  return clamp((p.z - (ceilH - 1.2)) / 1.6, 0.0, 1.0);
}

vec3 surfaceColor(float h, float tint, float isRoof) {
  vec3 brick  = mix(vec3(0.300, 0.150, 0.110), vec3(0.520, 0.300, 0.210), tint);
  vec3 stone  = mix(vec3(0.430, 0.370, 0.300), vec3(0.680, 0.640, 0.560), tint);
  vec3 glass  = mix(vec3(0.055, 0.080, 0.105), vec3(0.090, 0.130, 0.150), tint);
  vec3 c = mix(brick, stone, smoothstep(12.0, 30.0, h));
  c = mix(c, glass, smoothstep(38.0, 55.0, h));
  return mix(c, c * 0.34 + vec3(0.030), isRoof);
}

float hash11(float p) {
  p = fract(p * 0.1031);
  p *= p + 33.33;
  p *= p + p;
  return fract(p);
}
float hash21(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

// Facade detail without a texture. The wall's own plane gives the UVs: u runs
// along the wall from a stable origin, v is height above the pavement. From
// that we get floor bands, a window grid, a taller ground floor with
// storefronts, and a cornice. Storey height and bay spacing come from the
// building's height and tint, so a rowhouse and a tower do not get the same
// rhythm, and every building keeps its own rhythm between frames.
//
// A flat extrusion will never be a real roof, but this is what makes it read
// as a building rather than a box.
struct Facade { float shade; float window; float lit; };

Facade facade(vec3 world, vec3 n, float h, float tint, float isRoof) {
  Facade f;
  f.shade = 1.0; f.window = 0.0; f.lit = 0.0;
  if (isRoof > 0.5) return f;

  float storey = mix(3.15, 4.05, smoothstep(10.0, 70.0, h)) + tint * 0.25;
  float ground = storey * 1.55;

  // stable horizontal coordinate along the wall plane
  vec2 tang = normalize(vec2(-n.y, n.x));
  float u = dot(world.xy, tang);
  float v = world.z;

  float bay = mix(2.55, 3.35, tint);
  float seedU = floor(u / bay);
  float col = fract(u / bay);

  bool isGround = v < ground;
  float fv = isGround ? v / ground : (v - ground) / storey;
  float floorIdx = isGround ? 0.0 : floor((v - ground) / storey) + 1.0;
  float row = fract(fv);

  // spandrel band between storeys
  float band = smoothstep(0.0, 0.06, row) * (1.0 - smoothstep(0.80, 0.92, row));
  // window opening, inset from the bay edges
  float wcol = smoothstep(0.20, 0.28, col) * (1.0 - smoothstep(0.72, 0.80, col));
  float wrow = isGround
    ? smoothstep(0.14, 0.22, row) * (1.0 - smoothstep(0.74, 0.84, row))
    : smoothstep(0.16, 0.26, row) * (1.0 - smoothstep(0.72, 0.82, row));
  f.window = clamp(wcol * wrow, 0.0, 1.0);

  // mortar/floor lines and a little vertical relief between bays
  float line = 1.0 - 0.30 * (1.0 - band);
  float pier = 1.0 - 0.10 * smoothstep(0.46, 0.5, abs(col - 0.5));
  f.shade = line * pier;

  // cornice: a bright lip just under the roof, dark shadow just below it
  float underRoof = h - (v - 0.0);
  f.shade *= 1.0 + 0.55 * smoothstep(1.3, 0.35, underRoof)
                 - 0.30 * smoothstep(3.4, 1.5, underRoof);
  // plinth at the pavement
  f.shade *= 1.0 - 0.22 * (1.0 - smoothstep(0.0, 1.1, v));

  // which windows have a light on: stable per bay, per floor, per building
  float occupancy = mix(0.16, 0.62, tint);
  f.lit = step(1.0 - occupancy, hash21(vec2(seedU * 7.13 + tint * 91.7, floorIdx)));
  return f;
}`;

const CITY_FS = `#version 300 es
precision highp float;
in vec3 vWorld;
in float vHeight;
in float vTint;
in float vIsRoof;
uniform vec3 uEye;
uniform vec3 uSunDir;         // unit vector pointing at the sun
uniform vec3 uSunColor;
uniform vec3 uSkyColor;
uniform vec3 uHorizon;
uniform sampler2D uShadow;
uniform vec2 uShadowOrigin;
uniform float uShadowCell;
uniform float uShadowSize;
uniform float uFogDist;
uniform float uSunElev;
out vec4 frag;
${SHADING}
void main() {
  vec3 n = normalize(cross(dFdx(vWorld), dFdy(vWorld)));
  vec3 toEye = uEye - vWorld;
  float dist = length(toEye);
  vec3 V = toEye / dist;
  if (dot(n, V) < 0.0) n = -n;

  float lam = max(dot(n, uSunDir), 0.0) * shadowAt(vWorld + n * 0.35);
  float sky = 0.30 + 0.50 * max(n.z, 0.0);          // hemisphere fill
  vec3 base = surfaceColor(vHeight, vTint, vIsRoof);

  // Facade detail fades out with distance so the far skyline stays clean
  // instead of aliasing into noise.
  Facade fa = facade(vWorld, n, vHeight, vTint, vIsRoof);
  float detail = 1.0 - smoothstep(700.0, 2200.0, dist);
  float shade = mix(1.0, fa.shade, detail);
  float win = fa.window * detail;

  // glass darkens into the opening; masonry recesses it
  vec3 glassy3 = mix(vec3(0.045, 0.062, 0.080), vec3(0.10, 0.13, 0.16), vTint);
  base = mix(base * shade, mix(base * 0.42, glassy3, 0.65), win);

  vec3 col = base * (uSkyColor * sky + uSunColor * lam);

  // Curtain wall picks up a sharp sun glint; masonry does not.
  float glassy = smoothstep(38.0, 55.0, vHeight) * (1.0 - vIsRoof);
  vec3 H = normalize(uSunDir + V);
  col += uSunColor * glassy * lam * pow(max(dot(n, H), 0.0), 60.0) * 1.6;
  // windows catch a sharper reflection than the wall around them
  col += uSunColor * win * lam * pow(max(dot(n, H), 0.0), 120.0) * 1.1;

  // Lights come on as the sun goes down. This is what makes the city read at
  // night, when there is no sun term left to shape it.
  float night = clamp(1.0 - (uSunElev + 2.0) / 8.0, 0.0, 1.0);
  vec3 warm = mix(vec3(1.0, 0.80, 0.50), vec3(0.85, 0.92, 1.0), vTint * 0.55);
  col += warm * win * fa.lit * night * 1.35;

  float fog = 1.0 - exp(-dist / uFogDist);
  col = mix(col, uHorizon, fog * fog);
  frag = vec4(pow(clamp(col, 0.0, 1.0), vec3(1.0 / 2.2)), 1.0);
}`;

const GROUND_VS = `#version 300 es
in vec2 aXY;
uniform mat4 uViewProj;
out vec3 vWorld;
void main() {
  vWorld = vec3(aXY, 0.0);
  gl_Position = uViewProj * vec4(aXY, 0.0, 1.0);
}`;

const GROUND_FS = `#version 300 es
precision highp float;
in vec3 vWorld;
uniform vec3 uEye;
uniform vec3 uSunDir;
uniform vec3 uSunColor;
uniform vec3 uSkyColor;
uniform vec3 uHorizon;
uniform sampler2D uShadow;
uniform vec2 uShadowOrigin;
uniform float uShadowCell;
uniform float uShadowSize;
uniform float uFogDist;
out vec4 frag;
${SHADING}
void main() {
  float dist = length(uEye - vWorld);
  float lam = max(uSunDir.z, 0.0) * shadowAt(vWorld + vec3(0.0, 0.0, 0.25));
  vec3 base = vec3(0.062, 0.064, 0.068);
  vec3 col = base * (uSkyColor * 0.80 + uSunColor * lam);
  float fog = 1.0 - exp(-dist / uFogDist);
  col = mix(col, uHorizon, fog * fog);
  frag = vec4(pow(clamp(col, 0.0, 1.0), vec3(1.0 / 2.2)), 1.0);
}`;

const SKY_VS = `#version 300 es
in vec2 aXY;
out vec2 vNdc;
void main() { vNdc = aXY; gl_Position = vec4(aXY, 1.0, 1.0); }`;

const SKY_FS = `#version 300 es
precision highp float;
in vec2 vNdc;
uniform mat4 uInvViewProj;
uniform vec3 uEye;
uniform vec3 uZenith;
uniform vec3 uHorizon;
uniform vec3 uSunColor;
uniform vec3 uSunDir;
out vec4 frag;
// The gradient is keyed to the elevation of the view ray, not to screen
// position. With the camera pitched down, a screen-space gradient puts a hard
// band across the middle of the frame instead of a horizon.
void main() {
  vec4 far = uInvViewProj * vec4(vNdc, 1.0, 1.0);
  vec3 dir = normalize(far.xyz / far.w - uEye);
  float up = clamp(dir.z, -1.0, 1.0);
  vec3 c = mix(uHorizon, uZenith, pow(clamp(up, 0.0, 1.0), 0.55));
  c = mix(c, uHorizon * 0.72, clamp(-up * 6.0, 0.0, 1.0));
  float ca = max(dot(dir, uSunDir), 0.0);
  c += uSunColor * (pow(ca, 8.0) * 0.30 + pow(ca, 900.0) * 6.0);
  frag = vec4(pow(clamp(c, 0.0, 1.0), vec3(1.0 / 2.2)), 1.0);
}`;

const WATER_VS = `#version 300 es
in vec2 aXY;
uniform mat4 uViewProj;
uniform float uWaterZ;
out vec3 vWorld;
void main() {
  vWorld = vec3(aXY, uWaterZ);
  gl_Position = uViewProj * vec4(vWorld, 1.0);
}`;

// Water is the one surface where the sky matters more than the albedo. A
// Schlick fresnel raises reflectance at grazing angles, the reflected ray
// picks up the sky gradient, and a broad specular lobe gives the sun path
// that shows up on the Schuylkill at low sun.
const WATER_FS = `#version 300 es
precision highp float;
in vec3 vWorld;
uniform vec3 uEye;
uniform vec3 uSunDir;
uniform vec3 uSunColor;
uniform vec3 uSkyColor;
uniform vec3 uZenith;
uniform vec3 uHorizon;
uniform float uFogDist;
out vec4 frag;
void main() {
  vec3 toEye = uEye - vWorld;
  float dist = length(toEye);
  vec3 V = toEye / dist;
  vec3 N = vec3(0.0, 0.0, 1.0);

  float f = 0.02 + 0.98 * pow(1.0 - max(dot(N, V), 0.0), 5.0);
  vec3 R = reflect(-V, N);
  vec3 skyRefl = mix(uHorizon, uZenith, pow(clamp(R.z, 0.0, 1.0), 0.55));

  vec3 deep = vec3(0.013, 0.026, 0.034) * (uSkyColor * 0.9);
  vec3 col = mix(deep, skyRefl, f);

  vec3 H = normalize(uSunDir + V);
  float spec = pow(max(dot(N, H), 0.0), 220.0);
  float glint = pow(max(dot(N, H), 0.0), 18.0) * 0.10;
  col += uSunColor * (spec * 2.2 + glint) * step(0.0, uSunDir.z);

  float fog = 1.0 - exp(-dist / uFogDist);
  col = mix(col, uHorizon, fog * fog);
  frag = vec4(pow(clamp(col, 0.0, 1.0), vec3(1.0 / 2.2)), 1.0);
}`;

// Camera-facing beam: the quad is a degenerate line in the buffer, expanded
// sideways in view space so it keeps a constant on-screen width at any zoom.
const BEAM_VS = `#version 300 es
in vec4 aPosSide;
uniform mat4 uViewProj;
uniform vec3 uEye;
uniform float uWidth;
out float vT;
void main() {
  vec3 p = aPosSide.xyz;
  vec3 toEye = normalize(uEye - p);
  vec3 side = normalize(cross(toEye, vec3(0.0, 0.0, 1.0)));
  float dist = length(uEye - p);
  p += side * aPosSide.w * uWidth * dist * 0.0016;
  vT = clamp((aPosSide.z - 0.0) / 1.0, 0.0, 1.0);
  gl_Position = uViewProj * vec4(p, 1.0);
}`;

const BEAM_FS = `#version 300 es
precision highp float;
in float vT;
uniform vec3 uColor;
out vec4 frag;
void main() { frag = vec4(uColor, 1.0); }`;

// Parks and roads as one flat inlay. A class byte per vertex picks the
// palette, so both draw in a single pass.
const DETAIL_VS = `#version 300 es
in vec3 aXYK;
uniform mat4 uViewProj;
uniform float uZ;
out vec3 vWorld;
out float vKind;
void main() {
  vWorld = vec3(aXYK.xy, uZ);
  vKind = aXYK.z;
  gl_Position = uViewProj * vec4(vWorld, 1.0);
}`;

const DETAIL_FS = `#version 300 es
precision highp float;
in vec3 vWorld;
in float vKind;
uniform vec3 uEye;
uniform vec3 uSunDir;
uniform vec3 uSunColor;
uniform vec3 uSkyColor;
uniform vec3 uHorizon;
uniform sampler2D uShadow;
uniform vec2 uShadowOrigin;
uniform float uShadowCell;
uniform float uShadowSize;
uniform float uFogDist;
out vec4 frag;
${SHADING}
void main() {
  float dist = length(uEye - vWorld);
  float lam = max(uSunDir.z, 0.0) * shadowAt(vWorld + vec3(0.0, 0.0, 0.3));
  vec3 park = vec3(0.052, 0.094, 0.048);
  vec3 road = vec3(0.104, 0.103, 0.107);
  vec3 base = mix(park, road, step(0.5, vKind));
  vec3 col = base * (uSkyColor * 0.85 + uSunColor * lam);
  float fog = 1.0 - exp(-dist / uFogDist);
  col = mix(col, uHorizon, fog * fog);
  frag = vec4(pow(clamp(col, 0.0, 1.0), vec3(1.0 / 2.2)), 1.0);
}`;

globalThis.DETAIL_VS = DETAIL_VS;
globalThis.DETAIL_FS = DETAIL_FS;
globalThis.BEAM_VS = BEAM_VS;
globalThis.BEAM_FS = BEAM_FS;
globalThis.WATER_VS = WATER_VS;
globalThis.WATER_FS = WATER_FS;
globalThis.CITY_VS = CITY_VS;
globalThis.CITY_FS = CITY_FS;
globalThis.GROUND_VS = GROUND_VS;
globalThis.GROUND_FS = GROUND_FS;
globalThis.SKY_VS = SKY_VS;
globalThis.SKY_FS = SKY_FS;
