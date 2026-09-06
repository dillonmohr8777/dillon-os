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

  vec3 col = base * (uSkyColor * sky + uSunColor * lam);

  // Curtain wall picks up a sharp sun glint; masonry does not.
  float glassy = smoothstep(38.0, 55.0, vHeight) * (1.0 - vIsRoof);
  vec3 H = normalize(uSunDir + V);
  col += uSunColor * glassy * lam * pow(max(dot(n, H), 0.0), 60.0) * 1.6;

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

globalThis.CITY_VS = CITY_VS;
globalThis.CITY_FS = CITY_FS;
globalThis.GROUND_VS = GROUND_VS;
globalThis.GROUND_FS = GROUND_FS;
globalThis.SKY_VS = SKY_VS;
globalThis.SKY_FS = SKY_FS;
