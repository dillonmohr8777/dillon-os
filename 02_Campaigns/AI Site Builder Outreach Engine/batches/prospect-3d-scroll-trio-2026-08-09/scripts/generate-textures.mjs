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
const smoothNoise = (x, y, seed) => {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const tx = x - x0;
  const ty = y - y0;
  const a = hash(x0, y0, seed);
  const b = hash(x0 + 1, y0, seed);
  const c = hash(x0, y0 + 1, seed);
  const d = hash(x0 + 1, y0 + 1, seed);
  const sx = tx * tx * (3 - 2 * tx);
  const sy = ty * ty * (3 - 2 * ty);
  return (a + (b - a) * sx) + ((c + (d - c) * sx) - (a + (b - a) * sx)) * sy;
};
const octave = (x, y, seed) => smoothNoise(x, y, seed) * 0.55 + smoothNoise(x * 2, y * 2, seed + 3) * 0.3 + smoothNoise(x * 4, y * 4, seed + 8) * 0.15;

const textures = {
  "wood-grain": (u, v) => {
    const n = octave(u * 8, v * 3, 2);
    const grain = Math.sin((v * 66 + n * 7 + Math.sin(u * 8) * 2) * Math.PI) * 0.5 + 0.5;
    const pore = hash(Math.floor(u * 512), Math.floor(v * 512), 19) * 8;
    return [112 + grain * 54 + pore, 61 + grain * 38 + pore * 0.4, 31 + grain * 24];
  },
  "stone-vein": (u, v) => {
    const n = octave(u * 5, v * 5, 7);
    const wave = Math.abs(Math.sin((u * 3.4 + v * 1.7 + n * 1.8) * Math.PI * 2));
    const vein = Math.pow(1 - wave, 18);
    const gold = Math.pow(1 - Math.abs(Math.sin((u * 1.7 - v * 2.3 + n) * Math.PI * 2)), 28);
    return [220 - vein * 88 + gold * 24, 216 - vein * 84 + gold * 8, 207 - vein * 72 - gold * 18];
  },
  "raw-gem": (u, v) => {
    const n = octave(u * 12, v * 12, 13);
    const fracture = Math.pow(Math.abs(Math.sin((u * 9 + n * 2.1) * Math.PI) * Math.cos((v * 7 - n) * Math.PI)), 12);
    return [74 + n * 68 + fracture * 34, 50 + n * 44, 61 + n * 54 + fracture * 14];
  },
  "polished-gem": (u, v) => {
    const x = u - 0.5;
    const y = v - 0.5;
    const angle = Math.atan2(y, x);
    const radius = Math.hypot(x, y);
    const facet = Math.floor((angle + Math.PI) / (Math.PI / 6)) % 2;
    const light = 0.45 + 0.45 * Math.cos(angle * 3 - radius * 12) + facet * 0.16;
    return [24 + light * 48, 61 + light * 104, 112 + light * 126];
  },
  "water-caustics": (u, v) => {
    const n = octave(u * 8, v * 8, 23);
    const c1 = Math.pow(Math.abs(Math.sin((u * 7.1 + n * 1.7) * Math.PI) * Math.sin((v * 5.3 - n) * Math.PI)), 6);
    const c2 = Math.pow(Math.abs(Math.cos((u * 4.2 - v * 6.4 + n) * Math.PI)), 14);
    const caustic = Math.min(1, c1 + c2 * 0.65);
    return [8 + caustic * 76, 88 + caustic * 144, 118 + caustic * 137];
  },
  "copper-patina": (u, v) => {
    const n = octave(u * 10, v * 5, 31);
    const patina = Math.pow(Math.max(0, n - 0.55) * 2.2, 1.35);
    const streak = Math.sin((u * 1.6 + v * 18 + n * 2) * Math.PI) * 5;
    return [169 - patina * 105 + streak, 82 + patina * 92, 45 + patina * 70];
  },
  "steam-noise": (u, v) => {
    const n = octave(u * 9, v * 9, 43);
    const curl = Math.sin((u * 4 + v * 7 + n * 4) * Math.PI) * 0.5 + 0.5;
    const value = 112 + n * 104 + curl * 34;
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
