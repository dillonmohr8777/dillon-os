// 240s light-EDM bed for the Dayforce booth loop. 124 BPM four-on-the-floor.
// Chapters: intro(0-20) groove(20-50) full(50-128) breakdown(128-164 w/ build)
//           lift(164-222) outro fade(222-240). Risers at chapter cuts.
// Output: assets/ambient.wav (44.1kHz stereo 16-bit)
import { writeFileSync } from 'fs';

const SR = 44100, DUR = 135, N = SR * DUR;
const L = new Float64Array(N), R = new Float64Array(N);
const TWO_PI = Math.PI * 2;
const BPM = 124, BEAT = 60 / BPM, BAR = BEAT * 4;

const CHD = {
  Am: [110.00, 220.00, 261.63, 329.63],
  F:  [87.31,  220.00, 261.63, 349.23],
  C:  [130.81, 196.00, 261.63, 329.63],
  G:  [98.00,  196.00, 246.94, 293.66],
  Am9:[110.00, 246.94, 261.63, 329.63],
  Fma7:[87.31, 220.00, 261.63, 329.63],
};
const PROG_MAIN = [CHD.Am, CHD.F, CHD.C, CHD.G];
const PROG_LIFT = [CHD.Am9, CHD.Fma7, CHD.C, CHD.G];
const chordAt = t => (t >= 93 ? PROG_LIFT : PROG_MAIN)[Math.floor(t / BAR) % 4];

const inSec = (t, a, b, rise = 1.5, fall = 1.5) =>
  Math.min(1, Math.max(0, (t - a) / rise)) * Math.min(1, Math.max(0, (b - t) / fall));
const kickFullOn = t => inSec(t, 11.2, 72.9, .01, .8) + inSec(t, 92.9, 128, .01, 2.5);
const kickIntroOn = t => inSec(t, 2, 11.2, 1, .01) + inSec(t, 88, 92.9, 2.5, .01);
const hatOn   = t => inSec(t, 13, 72.9, 1.2, .8) + inSec(t, 94, 126, .8, 2.5);
const hat16On = t => inSec(t, 28, 72.9, 1.5, .8) + inSec(t, 96, 124, .8, 2.5);
const arpOn   = t => inSec(t, 20, 72.9, 2.5, 1) + inSec(t, 75, 127, 3, 2.5);
const bassOn  = t => inSec(t, 11.2, 73.3, 1, 1.5) + inSec(t, 92.9, 127, .4, 2.5);
const master  = t => Math.min(1, t / 1.2) * Math.min(1, Math.max(0, (DUR - t - 1) / 6));

let seed = 424242;
const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff * 2 - 1; };
const noiseBuf = new Float64Array(N);
for (let i = 0; i < N; i++) noiseBuf[i] = rnd();

const ARP_STEP = BEAT / 4;
const ARP_ORDER = [1, 2, 3, 2, 1, 3, 2, 3];
const risers = [10.9, 27.9, 54.9, 72.9, 92.9, 109.9, 124.9];

const phases = new Float64Array(8);
let bassPhase = 0, bassPhase2 = 0, lpHat = 0, lpNoise = 0, lpIntro = 0;

for (let i = 0; i < N; i++) {
  const t = i / SR;
  const ch = chordAt(t);
  const m = master(t);
  const beatPos = t % BEAT;
  const kOn = kickFullOn(t);
  const pumpAmt = .68 * kOn + .3 * kickIntroOn(t);
  const duck = 1 - pumpAmt * Math.exp(-beatPos * 7.5);

  let pad = 0;
  for (let v = 0; v < 3; v++) {
    const f = ch[v + 1];
    phases[v * 2]     += TWO_PI * f * 0.999 / SR;
    phases[v * 2 + 1] += TWO_PI * f * 1.0015 / SR;
    pad += (Math.sin(phases[v * 2]) + Math.sin(phases[v * 2 + 1])) * .5;
  }
  pad *= .12 * (.9 + .1 * Math.sin(TWO_PI * .06 * t)) * (1 - .3 * arpOn(t)) * duck;

  let kick = 0;
  const kEnv = Math.exp(-beatPos * 20);
  if (kEnv > .001) {
    const kf = 44 + 120 * Math.exp(-beatPos * 60);
    const body = Math.sin(TWO_PI * kf * beatPos) * kEnv;
    const click = noiseBuf[i] * Math.exp(-beatPos * 900) * .8;
    kick = (body * .5 + click * .18) * kOn;
    lpIntro += .012 * (body - lpIntro);
    kick += lpIntro * 34 * .28 * kickIntroOn(t);
  }

  const offPos = (t + BEAT / 2) % BEAT;
  lpHat += .6 * (noiseBuf[i] - lpHat);
  const hpNoise = noiseBuf[i] - lpHat;
  const hat = hpNoise * Math.exp(-offPos * 70) * .16 * hatOn(t);
  const pos16 = t % (BEAT / 4);
  const hat16 = hpNoise * Math.exp(-pos16 * 220) * .05 * hat16On(t);

  const barPos = t % BAR;
  const clapT = Math.min(Math.abs(barPos - BEAT), Math.abs(barPos - 3 * BEAT));
  const clapEnv = clapT < .25 ? (Math.exp(-clapT * 34) + .4 * Math.exp(-Math.max(0, clapT - .012) * 30)) : 0;
  const clap = (noiseBuf[i] * .6 + (i > 4 ? noiseBuf[i - 4] : 0) * .4) * clapEnv * .13 * hatOn(t);

  const rootF = ch[0] / 2;
  bassPhase += TWO_PI * rootF / SR;
  bassPhase2 += TWO_PI * rootF * 2.003 / SR;
  const gate = (t % (BEAT / 2)) < (BEAT / 2) * .74 ? 1 : .2;
  const saw = 2 * ((bassPhase2 / TWO_PI) % 1) - 1;
  const bass = (Math.sin(bassPhase) * .26 + saw * .05) * bassOn(t) * gate * duck;

  let arp = 0;
  const aAmt = arpOn(t);
  if (aAmt > .001) {
    const stepIdx = Math.floor(t / ARP_STEP);
    const stepT = t - stepIdx * ARP_STEP;
    const tone = ch[ARP_ORDER[stepIdx % ARP_ORDER.length]];
    const f = tone * 2;
    const env = Math.exp(-stepT * 18);
    arp = (Math.sin(TWO_PI * f * stepT) + .4 * Math.sin(TWO_PI * f * 2 * stepT)) * env * .14 * aAmt * duck;
  }

  let rise = 0;
  for (const s of risers) {
    const d = t - s;
    if (d > -1.7 && d < .1) {
      const p = (d + 1.7) / 1.7;
      lpNoise += (.04 + .34 * p) * (noiseBuf[i] - lpNoise);
      rise += lpNoise * p * p * .2;
    }
  }

  const dry = (pad + kick + hat + hat16 + clap + bass + arp + rise) * m;
  const side = (hat * .5 + hat16 * .4 - arp * .3);
  L[i] = dry + side;
  R[i] = dry - side;
}

let peak = 0;
for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
const drive = 5.5 / peak;
const ceil = Math.pow(10, -1.2 / 20);
const lim = x => Math.tanh(x * drive) * ceil;

const pcm = Buffer.alloc(N * 4);
for (let i = 0; i < N; i++) {
  pcm.writeInt16LE(Math.round(lim(L[i]) * 32767), i * 4);
  pcm.writeInt16LE(Math.round(lim(R[i]) * 32767), i * 4 + 2);
}
const hdr = Buffer.alloc(44);
hdr.write('RIFF', 0); hdr.writeUInt32LE(36 + pcm.length, 4); hdr.write('WAVE', 8);
hdr.write('fmt ', 12); hdr.writeUInt32LE(16, 16); hdr.writeUInt16LE(1, 20); hdr.writeUInt16LE(2, 22);
hdr.writeUInt32LE(SR, 24); hdr.writeUInt32LE(SR * 4, 28); hdr.writeUInt16LE(4, 32); hdr.writeUInt16LE(16, 34);
hdr.write('data', 36); hdr.writeUInt32LE(pcm.length, 40);
writeFileSync('assets/ambient.wav', Buffer.concat([hdr, pcm]));
console.log('wrote assets/ambient.wav (booth EDM, 124bpm, 135s)', ((44 + pcm.length) / 1e6).toFixed(1), 'MB');
