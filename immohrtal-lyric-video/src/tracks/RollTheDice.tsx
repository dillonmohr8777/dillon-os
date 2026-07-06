import React from 'react';
import {AbsoluteFill, random, useCurrentFrame, useVideoConfig} from 'remotion';
import lyricsData from './roll-the-dice-lyrics.json';
import {LyricVideoBase, LyricsData} from '../LyricVideoBase';
import {TrackPalette} from '../TrackTheme';

// "Roll the Dice" — high-roller casino night: electric purple + table-felt gold
// on the IMMOHRTAL night base. Dice tumble end-over-end through the frame
// (faces swap mid-flip for a 3D feel) and every few seconds a die gets
// "thrown" hard across the screen leaving a ghost-trail streak.
export const rollTheDiceLyrics = lyricsData as LyricsData;

export const ROLL_THE_DICE_PALETTE: TrackPalette = {
  accentA: '#c084fc', // electric violet — active-word gradient top
  accentB: '#fbbf24', // casino gold — active-word gradient bottom
  softA: '#e9d5ff',
  softB: '#fde68a',
  washA: 'rgba(147, 51, 234, 0.24)',
  washB: 'rgba(245, 158, 11, 0.14)',
};

const PAL = ROLL_THE_DICE_PALETTE;

// ---------------------------------------------------------------------------
// Die face — pip layouts for 1..6 on a rounded square (viewBox 48x48).
// ---------------------------------------------------------------------------
const PIPS: Record<number, [number, number][]> = {
  1: [[24, 24]],
  2: [[15, 15], [33, 33]],
  3: [[14, 14], [24, 24], [34, 34]],
  4: [[15, 15], [33, 15], [15, 33], [33, 33]],
  5: [[14, 14], [34, 14], [24, 24], [14, 34], [34, 34]],
  6: [[15, 13], [33, 13], [15, 24], [33, 24], [15, 35], [33, 35]],
};

const DieFace: React.FC<{face: number; color: string; pip: string}> = ({
  face,
  color,
  pip,
}) => (
  <svg viewBox="0 0 48 48" style={{width: '100%', height: '100%', display: 'block'}}>
    <rect
      x="3"
      y="3"
      width="42"
      height="42"
      rx="9"
      fill={color}
      fillOpacity={0.16}
      stroke={color}
      strokeWidth="2.6"
    />
    {/* top-edge sheen for a lit-from-above chrome feel */}
    <path
      d="M 12 3.5 H 36"
      stroke={pip}
      strokeOpacity={0.55}
      strokeWidth="2"
      strokeLinecap="round"
    />
    {(PIPS[face] ?? PIPS[1]).map(([cx, cy], i) => (
      <circle key={i} cx={cx} cy={cy} r={face === 1 ? 4.6 : 3.5} fill={pip} />
    ))}
  </svg>
);

// Deterministic face pick that changes on every half-flip.
const pickFace = (seed: string): number => 1 + Math.floor(random(seed) * 6);

// ---------------------------------------------------------------------------
// Ambient tumblers — dice drifting up through the night, flipping end-over-end.
// The flip is faked in 3D: the die squashes along its own axis (scaleY via
// cos) and the pip face swaps at the thin point of each half-turn.
// ---------------------------------------------------------------------------
const TumblingDie: React.FC<{seed: number}> = ({seed}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();

  const baseX = random(`dx-${seed}`) * width;
  const baseY = random(`dy-${seed}`) * height;
  const size = 44 + random(`ds-${seed}`) * 62;
  const phase = random(`dp-${seed}`) * Math.PI * 2;
  const rise = 0.14 + random(`dr-${seed}`) * 0.12;

  const x = baseX + Math.sin(frame / 88 + phase) * 44;
  const span = height + 160;
  const y = ((baseY - frame * rise) % span + span) % span - 80;

  // Slow continuous roll + end-over-end flip.
  const spinDir = random(`dd-${seed}`) > 0.5 ? 1 : -1;
  const rot = spinDir * frame * (0.22 + random(`dw-${seed}`) * 0.3) + phase * 57;
  const t = frame / (20 + random(`dt-${seed}`) * 16) + phase;
  const half = Math.floor(t / Math.PI);
  const squashRaw = Math.cos(t);
  const squash = Math.sign(squashRaw || 1) * Math.max(0.16, Math.abs(squashRaw));
  const face = pickFace(`df-${seed}-${half}`);

  const gold = random(`dc-${seed}`) > 0.55;
  const color = gold ? PAL.accentB : PAL.accentA;
  const pip = gold ? PAL.softB : PAL.softA;
  const opacity = 0.09 + random(`do-${seed}`) * 0.08;

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: size,
        height: size,
        opacity,
        transform: `rotate(${rot}deg) scaleY(${squash})`,
        filter: `drop-shadow(0 0 ${size * 0.16}px ${color})`,
      }}
    >
      <DieFace face={face} color={color} pip={pip} />
    </div>
  );
};

// ---------------------------------------------------------------------------
// Thrown dice — every few seconds a die whips across the screen in an arc,
// spinning fast, with fading ghost copies trailing behind like motion blur.
// ---------------------------------------------------------------------------
const THROW_FRAMES = 42;

const ThrownDie: React.FC<{lane: number}> = ({lane}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();

  const period = 240 + lane * 88 + Math.floor(random(`tp-${lane}`) * 60);
  const offset = Math.floor(random(`to-${lane}`) * period);
  const local = (frame + offset) % period;
  if (local >= THROW_FRAMES) return null;

  const cycle = Math.floor((frame + offset) / period);
  const p = local / THROW_FRAMES;
  const dir = random(`td-${lane}-${cycle}`) > 0.5 ? 1 : -1;
  const y0 = height * (0.18 + random(`ty-${lane}-${cycle}`) * 0.6);
  const size = 52 + random(`ts-${lane}-${cycle}`) * 26;
  const gold = random(`tc-${lane}-${cycle}`) > 0.5;
  const color = gold ? PAL.accentB : PAL.accentA;
  const pip = gold ? PAL.softB : PAL.softA;

  const posAt = (q: number) => {
    const xq = dir === 1 ? -140 + q * (width + 280) : width + 140 - q * (width + 280);
    const yq = y0 - Math.sin(q * Math.PI) * height * 0.16; // toss arc
    return {x: xq, y: yq};
  };

  // Face swaps twice mid-flight so the roll reads as a real tumble.
  const face = pickFace(`tf-${lane}-${cycle}-${Math.floor(p * 3)}`);
  const ghosts = [0, 1, 2, 3]; // 0 = the die itself, rest = trailing blur

  return (
    <>
      {ghosts.map((g) => {
        const q = p - g * 0.042;
        if (q < 0) return null;
        const {x, y} = posAt(q);
        const rot = dir * q * 760 + lane * 40;
        const fade = Math.sin(Math.min(1, Math.max(0, q)) * Math.PI); // ease in/out at edges
        const opacity = [0.2, 0.11, 0.06, 0.03][g] * fade;
        return (
          <div
            key={g}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: size,
              height: size,
              opacity,
              transform: `rotate(${rot}deg)`,
              filter: g === 0 ? `drop-shadow(0 0 12px ${color})` : 'blur(1px)',
            }}
          >
            <DieFace face={face} color={color} pip={pip} />
          </div>
        );
      })}
    </>
  );
};

// ---------------------------------------------------------------------------
// Poker chips — a few slow-spinning edge-striped chips for table flavor.
// ---------------------------------------------------------------------------
const Chip: React.FC<{color: string}> = ({color}) => (
  <svg viewBox="0 0 48 48" fill="none" style={{width: '100%', height: '100%'}}>
    <circle cx="24" cy="24" r="20" stroke={color} strokeWidth="2.4" />
    <circle cx="24" cy="24" r="12.5" stroke={color} strokeWidth="1.6" strokeDasharray="4 3.4" />
    {Array.from({length: 6}, (_, i) => {
      const a = (i * Math.PI) / 3;
      const x1 = 24 + Math.cos(a) * 15.5;
      const y1 = 24 + Math.sin(a) * 15.5;
      const x2 = 24 + Math.cos(a) * 20;
      const y2 = 24 + Math.sin(a) * 20;
      return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="3.4" />;
    })}
  </svg>
);

const DriftingChip: React.FC<{seed: number}> = ({seed}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const baseX = random(`cx-${seed}`) * width;
  const baseY = random(`cy-${seed}`) * height;
  const size = 34 + random(`cs-${seed}`) * 30;
  const phase = random(`cp-${seed}`) * Math.PI * 2;
  const span = height + 120;
  const y = ((baseY - frame * 0.1) % span + span) % span - 60;
  const x = baseX + Math.sin(frame / 105 + phase) * 30;
  const rot = frame * 0.5 * (random(`cd-${seed}`) > 0.5 ? 1 : -1);
  const wobble = 0.55 + 0.45 * Math.abs(Math.sin(frame / 60 + phase)); // coin-spin squash
  const color = random(`cc-${seed}`) > 0.5 ? PAL.accentB : PAL.accentA;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: size,
        height: size,
        opacity: 0.08 + random(`co-${seed}`) * 0.04,
        transform: `rotate(${rot}deg) scaleX(${wobble})`,
        filter: `drop-shadow(0 0 8px ${color})`,
      }}
    >
      <Chip color={color} />
    </div>
  );
};

const RollTheDiceMotifs: React.FC = () => (
  <AbsoluteFill style={{overflow: 'hidden', pointerEvents: 'none'}}>
    {Array.from({length: 4}, (_, i) => (
      <DriftingChip key={`c${i}`} seed={i} />
    ))}
    {Array.from({length: 9}, (_, i) => (
      <TumblingDie key={`d${i}`} seed={i} />
    ))}
    {Array.from({length: 3}, (_, i) => (
      <ThrownDie key={`t${i}`} lane={i} />
    ))}
  </AbsoluteFill>
);

export const RollTheDiceVideo: React.FC = () => (
  <LyricVideoBase
    audioFile="roll-the-dice.mp3"
    lyrics={rollTheDiceLyrics}
    palette={ROLL_THE_DICE_PALETTE}
    Motifs={RollTheDiceMotifs}
  />
);
