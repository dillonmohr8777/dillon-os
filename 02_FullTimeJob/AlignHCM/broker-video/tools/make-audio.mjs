// Procedurally synthesized ambient bed for the 120s broker video.
// Warm slow pad + soft sub pulse + noise swells at scene transitions.
// Output: assets/ambient.wav (44.1kHz stereo 16-bit)
import { writeFileSync } from 'fs';

const SR = 44100, DUR = 120, N = SR * DUR;
const L = new Float64Array(N), R = new Float64Array(N);

// ---- chord plan (freqs in Hz), one chord per section/page ----
// A warm suspended progression, lifting near the end.
const chords = [
  { t: 0,     f: [110.00, 164.81, 220.00, 329.63] },          // A2 E3 A3 E4  (open)
  { t: 10,    f: [110.00, 164.81, 261.63, 329.63] },          // + C4 (Am color)
  { t: 24,    f: [87.31,  130.81, 261.63, 392.00] },          // F2 C3 C4 G4
  { t: 36.4,  f: [98.00,  146.83, 293.66, 349.23] },          // G2 D3 D4 F4
  { t: 48.8,  f: [110.00, 164.81, 261.63, 440.00] },          // Am add A4
  { t: 61.2,  f: [87.31,  174.61, 261.63, 349.23] },          // F2 F3 C4 F4
  { t: 73.6,  f: [98.00,  196.00, 293.66, 392.00] },          // G stack
  { t: 86,    f: [110.00, 220.00, 277.18, 329.63] },          // A2 A3 C#4 E4 (lift to A major)
  { t: 102,   f: [110.00, 220.00, 277.18, 440.00] },          // brighter A
  { t: 120.1, f: [110.00, 220.00, 277.18, 440.00] },
];
const XFADE = 3.0; // seconds of crossfade between chords

function chordAt(t) {
  for (let i = chords.length - 2; i >= 0; i--) {
    if (t >= chords[i].t) return [chords[i], chords[i + 1]];
  }
  return [chords[0], chords[1]];
}

// master envelope: fade in 2s, fade out last 4s
const master = t => Math.min(1, t / 2) * Math.min(1, Math.max(0, (DUR - t) / 4));

// transition swooshes (band-limited noise swells centered on scene changes)
const swooshes = [9.9, 23.9, 36.4, 48.8, 61.2, 73.6, 85.9, 101.9];

// simple seeded PRNG for noise
let seed = 12345;
const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff * 2 - 1; };

// pre-render noise, low-passed
let lp = 0;
const noise = new Float64Array(N);
for (let i = 0; i < N; i++) { lp += 0.02 * (rnd() - lp); noise[i] = lp; }

const TWO_PI = Math.PI * 2;
// oscillator phases per voice (max 4 voices x 2 detunes)
const phases = new Float64Array(16);

for (let i = 0; i < N; i++) {
  const t = i / SR;
  const [cur, next] = chordAt(t);
  // crossfade factor into next chord
  const untilNext = next.t - t;
  const xf = untilNext < XFADE ? 1 - untilNext / XFADE : 0;

  // ---- pad: detuned sine pairs per chord tone ----
  let pad = 0;
  for (let v = 0; v < 4; v++) {
    const fA = cur.f[v], fB = next.f[v];
    const f = fA + (fB - fA) * xf; // glide
    const det = 1 + 0.0015 * Math.sin(TWO_PI * 0.05 * t + v * 1.7);
    phases[v * 2]     += TWO_PI * f / SR;
    phases[v * 2 + 1] += TWO_PI * f * det * 1.002 / SR;
    const amp = (v === 0 ? 0.32 : 0.16) * (0.85 + 0.15 * Math.sin(TWO_PI * 0.07 * t + v));
    pad += amp * (Math.sin(phases[v * 2]) + Math.sin(phases[v * 2 + 1])) * 0.5;
  }
  pad *= 0.16;

  // ---- soft sub pulse, 97 bpm feel, ducked in intro ----
  const beat = t % 0.6186;
  const pulseEnv = Math.exp(-beat * 18) * (t > 10 ? 1 : t / 10 * 0.4);
  const pulse = Math.sin(TWO_PI * 55 * t) * pulseEnv * 0.10;

  // ---- transition swooshes ----
  let sw = 0;
  for (const s of swooshes) {
    const d = t - s;
    if (d > -1.2 && d < 0.6) {
      const env = d < 0 ? Math.pow((d + 1.2) / 1.2, 2) : Math.pow(1 - d / 0.6, 2);
      sw += noise[i] * env * 0.16;
    }
  }

  // ---- gentle high shimmer in intro & CTA ----
  const shimmerOn = (t < 10 ? 1 - t / 10 : 0) + (t > 102 ? Math.min(1, (t - 102) / 4) : 0);
  const shim = Math.sin(TWO_PI * 1318.5 * t) * Math.exp(-((t * 4) % 7)) * 0.008 * shimmerOn;

  const m = master(t);
  const dry = (pad + pulse + sw + shim) * m;
  // subtle stereo: haas-ish detune via phase offset on right
  L[i] = dry;
  R[i] = dry * 0.96 + (pad * 0.04 * Math.sin(TWO_PI * 0.11 * t)) * m;
}

// normalize to -8 dBFS peak
let peak = 0;
for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
const gain = Math.pow(10, -8 / 20) / peak;

const pcm = Buffer.alloc(N * 4);
for (let i = 0; i < N; i++) {
  pcm.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i] * gain)) * 32767), i * 4);
  pcm.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i] * gain)) * 32767), i * 4 + 2);
}
const hdr = Buffer.alloc(44);
hdr.write('RIFF', 0); hdr.writeUInt32LE(36 + pcm.length, 4); hdr.write('WAVE', 8);
hdr.write('fmt ', 12); hdr.writeUInt32LE(16, 16); hdr.writeUInt16LE(1, 20); hdr.writeUInt16LE(2, 22);
hdr.writeUInt32LE(SR, 24); hdr.writeUInt32LE(SR * 4, 28); hdr.writeUInt16LE(4, 32); hdr.writeUInt16LE(16, 34);
hdr.write('data', 36); hdr.writeUInt32LE(pcm.length, 40);
writeFileSync('assets/ambient.wav', Buffer.concat([hdr, pcm]));
console.log('wrote assets/ambient.wav', ((44 + pcm.length) / 1e6).toFixed(1), 'MB');
