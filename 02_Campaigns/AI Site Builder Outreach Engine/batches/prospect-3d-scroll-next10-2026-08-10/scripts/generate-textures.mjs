import { mkdirSync, rmSync, writeFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = resolve(import.meta.dirname, "..");
const output = join(root, "public", "assets", "materials");
const temp = join(root, ".texture-work");
const width = 512;
const height = 512;

mkdirSync(output, { recursive: true });
mkdirSync(temp, { recursive: true });

const clamp = (value) => Math.max(0, Math.min(255, Math.round(value)));
const hash = (x, y, seed = 1) => {
  let n = Math.imul(x + seed * 173, 374761393) + Math.imul(y - seed * 97, 668265263);
  n = (n ^ (n >>> 13)) * 1274126177;
  return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
};

/*
  Periodic value noise. Wrapping the lattice on an integer period means every
  octave — and therefore the whole fBm stack — tiles exactly across the unit
  square, so these maps repeat across a surface without a seam.
*/
const wrap = (value, period) => ((value % period) + period) % period;
const pnoise = (x, y, period, seed) => {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const tx = x - x0;
  const ty = y - y0;
  const a = hash(wrap(x0, period), wrap(y0, period), seed);
  const b = hash(wrap(x0 + 1, period), wrap(y0, period), seed);
  const c = hash(wrap(x0, period), wrap(y0 + 1, period), seed);
  const d = hash(wrap(x0 + 1, period), wrap(y0 + 1, period), seed);
  const sx = tx * tx * (3 - 2 * tx);
  const sy = ty * ty * (3 - 2 * ty);
  const top = a + (b - a) * sx;
  const bottom = c + (d - c) * sx;
  return top + (bottom - top) * sy;
};

const fbm = (u, v, frequency, seed, octaves = 5) => {
  let amplitude = 0.5;
  let total = 0;
  let norm = 0;
  let freq = frequency;
  for (let i = 0; i < octaves; i++) {
    total += pnoise(u * freq, v * freq, freq, seed + i * 13) * amplitude;
    norm += amplitude;
    amplitude *= 0.5;
    freq *= 2;
  }
  return total / norm;
};

/* Ridged noise: the thin bright network that reads as caustics or fracture. */
const ridge = (u, v, frequency, seed, octaves = 4) =>
  1 - Math.abs(fbm(u, v, frequency, seed, octaves) * 2 - 1);
const smoothstep = (edge0, edge1, x) => {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
};
const mix = (a, b, t) => a + (b - a) * t;

const textures = {
  /* Rings distorted by a warp field, plus fine fibre running with the grain. */
  "wood-grain": (u, v) => {
    const warp = (fbm(u, v, 3, 11) - 0.5) * 2;
    const drift = (fbm(u, v, 2, 5) - 0.5) * 2;
    const rings = 0.5 + 0.5 * Math.sin((v * 9 + warp * 1.7 + drift * 0.8) * Math.PI * 2);
    const soft = Math.pow(rings, 1.7);
    const fibre = (fbm(u, v, 64, 21, 3) - 0.5) * 0.16;
    const pore = Math.max(0, fbm(u, v, 96, 33, 2) - 0.68) * 0.9;
    const shade = 0.5 + soft * 0.28 + fibre - pore * 0.4;
    return [shade * 168, shade * 108, shade * 66];
  },
  /* Marble: broad soft veining over a low-contrast field, not contour lines. */
  "stone-vein": (u, v) => {
    const q = (fbm(u, v, 3, 7) - 0.5) * 2;
    const warp = (fbm(u + q * 0.22, v + q * 0.18, 4, 17) - 0.5) * 2;
    const seam = 0.5 + 0.5 * Math.sin((u * 2 - v * 1 + warp * 0.9 + q * 0.6) * Math.PI * 2);
    const vein = Math.pow(1 - seam, 5) * 0.55 + Math.pow(1 - seam, 14) * 0.45;
    const grit = (fbm(u, v, 48, 41, 3) - 0.5) * 0.07;
    const base = 0.84 + grit - vein * 0.34;
    return [base * 238, base * 234, base * 226];
  },
  /* Rough mineral: mottled body with a sparse fracture network. */
  "raw-gem": (u, v) => {
    const body = fbm(u, v, 6, 13);
    const warp = (fbm(u, v, 4, 23) - 0.5) * 2;
    const fracture = Math.pow(ridge(u + warp * 0.12, v + warp * 0.1, 8, 19, 3), 9);
    const shade = 0.42 + body * 0.5 + fracture * 0.3;
    return [shade * 150, shade * 118, shade * 88];
  },
  "polished-gem": (u, v) => {
    const x = u - 0.5;
    const y = v - 0.5;
    const angle = Math.atan2(y, x);
    const radius = Math.hypot(x, y);
    const facet = Math.floor((angle + Math.PI) / (Math.PI / 8)) % 2;
    const sheen = 0.4 + 0.4 * Math.cos(angle * 4 - radius * 9) + facet * 0.14;
    const grain = (fbm(u, v, 32, 61, 3) - 0.5) * 0.1;
    const shade = Math.max(0, sheen + grain);
    return [22 + shade * 44, 58 + shade * 96, 104 + shade * 118];
  },
  /* Overlapping ridged networks read as light focused through moving water. */
  "water-caustics": (u, v) => {
    const drift = (fbm(u, v, 3, 23) - 0.5) * 2;
    const a = Math.pow(ridge(u + drift * 0.16, v + drift * 0.13, 6, 31, 3), 6);
    const b = Math.pow(ridge(u - drift * 0.12, v + drift * 0.17, 9, 37, 3), 9);
    const caustic = Math.min(1, a * 0.75 + b * 0.55);
    const deep = fbm(u, v, 4, 47) * 0.22;
    return [10 + caustic * 92 + deep * 20, 74 + caustic * 150 + deep * 46, 104 + caustic * 140 + deep * 58];
  },
  /* Patina as blotches eating into the metal, no regular streaking. */
  "copper-patina": (u, v) => {
    const warp = (fbm(u, v, 3, 31) - 0.5) * 2;
    const blotch = fbm(u + warp * 0.2, v + warp * 0.16, 5, 43);
    const patina = smoothstep(0.46, 0.72, blotch);
    const grime = (fbm(u, v, 40, 51, 3) - 0.5) * 0.12;
    const shade = 1 + grime;
    return [
      mix(176, 88, patina) * shade,
      mix(102, 142, patina) * shade,
      mix(60, 116, patina) * shade
    ];
  },
  /* Fine neutral grain for the film layer — mostly high frequency. */
  "steam-noise": (u, v) => {
    const fine = hash(Math.floor(u * width) % width, Math.floor(v * height) % height, 43);
    const soft = fbm(u, v, 24, 71, 3);
    const value = 90 + fine * 96 + soft * 60;
    return [value, value, value];
  }
};

for (const [name, sample] of Object.entries(textures)) {
  const hasAlpha = name === "steam-noise";
  const channels = hasAlpha ? 4 : 3;
  const pixels = Buffer.alloc(width * height * channels);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const u = x / (width - 1);
      const v = y / (height - 1);
      const [r, g, b] = sample(u, v);
      const index = (y * width + x) * channels;
      pixels[index] = clamp(r);
      pixels[index + 1] = clamp(g);
      pixels[index + 2] = clamp(b);
      if (hasAlpha) {
        const edgeFade = Math.min(1, Math.max(0, Math.min(u, v, 1 - u, 1 - v) * 8));
        const vapor = Math.max(0, (r - 118) / 137);
        pixels[index + 3] = clamp(edgeFade * vapor * 210);
      }
    }
  }
  const ppmPath = join(temp, `${name}.${hasAlpha ? "pam" : "ppm"}`);
  const webpPath = join(output, `${name}.webp`);
  const header = hasAlpha
    ? `P7\nWIDTH ${width}\nHEIGHT ${height}\nDEPTH 4\nMAXVAL 255\nTUPLTYPE RGB_ALPHA\nENDHDR\n`
    : `P6\n${width} ${height}\n255\n`;
  writeFileSync(ppmPath, Buffer.concat([Buffer.from(header), pixels]));
  const result = spawnSync("ffmpeg", ["-y", "-loglevel", "error", "-i", ppmPath, "-frames:v", "1", "-c:v", "libwebp", "-quality", "84", webpPath], { encoding: "utf8" });
  if (result.status !== 0) throw new Error(`ffmpeg failed for ${name}: ${result.stderr}`);
  if (statSync(webpPath).size < 1024) throw new Error(`Generated texture is unexpectedly small: ${name}`);
}

rmSync(temp, { recursive: true, force: true });
console.log(`Generated ${Object.keys(textures).length} deterministic WebP material assets.`);
