// Light EDM bed for the 120s broker video. 122 BPM four-on-the-floor:
// soft kick, offbeat hats, sidechained pad chords, pluck arp, sub bass.
// Sections: intro pads (0-10) -> groove (10-24) -> full (24-86)
//           breakdown (86-102) -> lift (102-116) -> outro fade.
// Output: assets/ambient.wav (44.1kHz stereo 16-bit)
import { writeFileSync } from 'fs';

const SR = 44100, DUR = 120, N = SR * DUR;
const L = new Float64Array(N), R = new Float64Array(N);
const TWO_PI = Math.PI * 2;

const BPM = 122, BEAT = 60 / BPM;               // 0.4918s
const BAR = BEAT * 4;

// ---- chord plan: Am - F - C - G loop, brightened in lift ----
// voiced as [root(low), 3 upper tones]
const CH = {
  Am: [110.00, 220.00, 261.63, 329.63],
  F:  [87.31,  220.00, 261.63, 349.23],
  C:  [130.81, 196.00, 261.63, 329.63],
  G:  [98.00,  196.00, 246.94, 293.66],
  Am9:[110.00, 246.94, 261.63, 329.63],
  Fma7:[87.31, 220.00, 261.63, 329.63],
};
// one chord per bar, looping
const PROG_MAIN = [CH.Am, CH.F, CH.C, CH.G];
const PROG_LIFT = [CH.Am9, CH.Fma7, CH.C, CH.G];

function chordAt(t) {
  const bar = Math.floor(t / BAR);
  const prog = t >= 102 ? PROG_LIFT : PROG_MAIN;
  return prog[bar % 4];
}

// section gains
const inSec = (t, a, b, rise = 1.5, fall = 1.5) =>
  Math.min(1, Math.max(0, (t - a) / rise)) * Math.min(1, Math.max(0, (b - t) / fall));
const kickOn  = t => inSec(t, 10.2, 85.9, .01, 1.2) + inSec(t, 101.9, 116, .01, 2.5);
const hatOn   = t => inSec(t, 12.5, 85.9, 2, 1.2) + inSec(t, 103.5, 115, 1, 2.5);
const arpOn   = t => inSec(t, 24, 85.9, 2.5, 1.5) + inSec(t, 88, 114, 4, 2.5);
const bassOn  = t => inSec(t, 10.2, 86.5, 1.5, 2) + inSec(t, 101.9, 115.5, .5, 2.5);
const master  = t => Math.min(1, t / 1.5) * Math.min(1, Math.max(0, (DUR - t) / 4));

// deterministic noise
let seed = 424242;
const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff * 2 - 1; };
const noiseBuf = new Float64Array(N);
for (let i = 0; i < N; i++) noiseBuf[i] = rnd();

// arp pattern: 16th-note pluck cycling chord tones (up-down)
const ARP_STEP = BEAT / 4;
const ARP_ORDER = [1, 2, 3, 2, 1, 3, 2, 3]; // indices into chord upper tones

// swoosh risers into section changes
const risers = [23.9, 85.9, 101.9];

const phases = new Float64Array(8);
let bassPhase = 0, lpHat = 0, lpNoise = 0;

for (let i = 0; i < N; i++) {
  const t = i / SR;
  const ch = chordAt(t);
  const m = master(t);

  // ---- beat clocks ----
  const beatPos = t % BEAT;                    // position within beat
  const sinceKick = beatPos;                   // kick on every beat
  // sidechain: duck after each kick when kick is active
  const duckDepth = .55 * kickOn(t);
  const duck = 1 - duckDepth * Math.exp(-sinceKick * 9);

  // ---- pads: detuned pairs on the 3 upper chord tones ----
  let pad = 0;
  for (let v = 0; v < 3; v++) {
    const f = ch[v + 1];
    phases[v * 2]     += TWO_PI * f * 0.999 / SR;
    phases[v * 2 + 1] += TWO_PI * f * 1.0015 / SR;
    pad += (Math.sin(phases[v * 2]) + Math.sin(phases[v * 2 + 1])) * .5;
  }
  // slow shimmer LFO + slightly quieter during full groove (arp carries)
  pad *= .105 * (.9 + .1 * Math.sin(TWO_PI * .06 * t)) * (1 - .25 * arpOn(t)) * duck;

  // ---- kick: pitch-swept sine thump on every beat ----
  let kick = 0;
  const kEnv = Math.exp(-sinceKick * 26);
  if (kEnv > .001) {
    const kf = 42 + 110 * Math.exp(-sinceKick * 55);
    kick = Math.sin(TWO_PI * kf * sinceKick) * kEnv * .34 * kickOn(t);
  }

  // ---- hats: offbeat (8th between kicks), highpassed noise ----
  const eighthPos = (t + BEAT / 2) % BEAT;     // offset by half-beat -> offbeats
  const hEnv = Math.exp(-eighthPos * 90);
  lpHat += .55 * (noiseBuf[i] - lpHat);
  const hat = (noiseBuf[i] - lpHat) * hEnv * .12 * hatOn(t);

  // ---- clap on beats 2 & 4 (soft) ----
  const barPos = t % BAR;
  const clapT = Math.min(
    Math.abs(barPos - BEAT), Math.abs(barPos - 3 * BEAT));
  const clapEnv = clapT < .2 ? Math.exp(-clapT * 40) : 0;
  const clap = (noiseBuf[i] * .5 + (i > 3 ? noiseBuf[i - 3] : 0) * .5) * clapEnv * .09 * hatOn(t);

  // ---- sub bass: root note, 8th-note gated, sidechained ----
  const rootF = ch[0] / 2;                      // an octave down
  bassPhase += TWO_PI * rootF / SR;
  const gate = (t % (BEAT / 2)) < (BEAT / 2) * .72 ? 1 : .25;
  const bass = Math.sin(bassPhase) * .21 * bassOn(t) * gate * duck;

  // ---- arp pluck: 16ths cycling upper tones ----
  let arp = 0;
  const aAmt = arpOn(t);
  if (aAmt > .001) {
    const stepIdx = Math.floor(t / ARP_STEP);
    const stepT = t - stepIdx * ARP_STEP;
    const tone = ch[ARP_ORDER[stepIdx % ARP_ORDER.length]];
    const f = tone * 2;                         // octave up, sparkly
    const env = Math.exp(-stepT * 22);
    arp = (Math.sin(TWO_PI * f * stepT) + .35 * Math.sin(TWO_PI * f * 2 * stepT)) * env * .10 * aAmt * duck;
  }

  // ---- risers into transitions ----
  let rise = 0;
  for (const s of risers) {
    const d = t - s;
    if (d > -1.6 && d < .1) {
      const p = (d + 1.6) / 1.6;
      lpNoise += (.04 + .3 * p) * (noiseBuf[i] - lpNoise);
      rise += lpNoise * p * p * .16;
    }
  }

  const dry = (pad + kick + hat + clap + bass + arp + rise) * m;
  // gentle stereo width: hats/arp slightly panned
  L[i] = dry + (hat * .4 - arp * .25);
  R[i] = dry - (hat * .4 - arp * .25);
}

// normalize to -7.5 dBFS peak
let peak = 0;
for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
const gain = Math.pow(10, -7.5 / 20) / peak;

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
console.log('wrote assets/ambient.wav (light EDM, 122bpm)', ((44 + pcm.length) / 1e6).toFixed(1), 'MB');
