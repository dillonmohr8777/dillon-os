import React from 'react';
import {AbsoluteFill, random, useCurrentFrame, useVideoConfig} from 'remotion';
import lyricsData from './grade-a-love-lyrics.json';
import {LyricVideoBase, LyricsData} from '../LyricVideoBase';
import {TrackPalette} from '../TrackTheme';

// "Grade A Love" — warm romance on the IMMOHRTAL night base. Rose chrome
// melting into certificate gold (the "Grade A" stamp), with a sky of love
// icons: ember hearts rising, big outline hearts thumping like a heartbeat,
// and tiny heart-sparks twinkling in and out.
export const gradeALoveLyrics = lyricsData as LyricsData;

export const GRADE_A_LOVE_PALETTE: TrackPalette = {
  accentA: '#ff5d7e', // vivid rose — active word core + glow
  accentB: '#ffb35c', // grade-A gold — gradient base of the sung word
  softA: '#ffc4d1', // soft rose for particles
  softB: '#ffe2b8', // champagne for particles
  washA: 'rgba(244, 63, 94, 0.20)', // rose night wash, top-left
  washB: 'rgba(255, 158, 70, 0.13)', // warm amber wash, bottom-right
};

const HEART_PATH =
  'M22 37C10 28 3 21.5 3 13.5 3 7.5 7.5 3 13 3c3.6 0 7 1.9 9 5 2-3.1 5.4-5 9-5 5.5 0 10 4.5 10 10.5C41 21.5 34 28 22 37z';

const Heart: React.FC<{color: string; filled: boolean; strokeWidth?: number}> = ({
  color,
  filled,
  strokeWidth = 2.5,
}) => (
  <svg viewBox="0 0 44 40" fill="none" style={{width: '100%', height: '100%'}}>
    <path
      d={HEART_PATH}
      fill={filled ? color : 'none'}
      stroke={filled ? 'none' : color}
      strokeWidth={filled ? 0 : strokeWidth}
      strokeLinejoin="round"
    />
  </svg>
);

// Double-thump heartbeat curve: lub... dub... rest. Returns 0..1.
const heartbeat = (frame: number, period: number, phase: number): number => {
  const t = (((frame + phase) % period) + period) % period;
  const bump = (a: number, b: number): number =>
    t >= a && t <= b ? Math.sin(((t - a) / (b - a)) * Math.PI) : 0;
  return bump(0, 9) + 0.62 * bump(13, 22);
};

// Layer 1 — small filled hearts rising like embers off a fire, flickering.
const EmberHearts: React.FC<{colors: string[]}> = ({colors}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  return (
    <>
      {Array.from({length: 13}, (_, i) => {
        const seed = `ember-${i}`;
        const color = colors[Math.floor(random(`${seed}-c`) * colors.length)];
        const size = 13 + random(`${seed}-s`) * 22;
        const baseX = random(`${seed}-x`) * width;
        const speed = 0.5 + random(`${seed}-v`) * 0.65; // px/frame upward
        const phase = random(`${seed}-p`) * Math.PI * 2;
        const span = height + 120;
        const y =
          ((((random(`${seed}-y`) * span - frame * speed) % span) + span) % span) - 60;
        const x = baseX + Math.sin(frame / 42 + phase) * 30;
        const flicker = 0.55 + 0.45 * Math.sin(frame / 9 + phase * 5);
        // Fade out as embers near the top of the frame, like heat dying off.
        const heightFade = 0.35 + 0.65 * Math.min(Math.max(y / (height * 0.4), 0), 1);
        const rot = Math.sin(frame / 60 + phase) * 16;
        return (
          <div
            key={seed}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: size,
              height: size,
              opacity: (0.09 + random(`${seed}-o`) * 0.1) * flicker * heightFade,
              transform: `rotate(${rot}deg)`,
              filter: `drop-shadow(0 0 ${size * 0.5}px ${color})`,
            }}
          >
            <Heart color={color} filled />
          </div>
        );
      })}
    </>
  );
};

// Layer 2 — big outline hearts drifting slowly, pulsing to a heartbeat.
// Anchored toward the frame edges so the lyric band stays clean.
const BeatHearts: React.FC<{colors: string[]}> = ({colors}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const anchors: [number, number][] = [
    [0.13, 0.24],
    [0.86, 0.2],
    [0.09, 0.78],
    [0.9, 0.76],
    [0.5, 0.9],
  ];
  return (
    <>
      {anchors.map(([ax, ay], i) => {
        const seed = `beat-${i}`;
        const color = colors[Math.floor(random(`${seed}-c`) * colors.length)];
        const size = 96 + random(`${seed}-s`) * 78;
        const phase = random(`${seed}-p`) * Math.PI * 2;
        const period = 82 + Math.floor(random(`${seed}-t`) * 26); // ~2.7-3.6s
        const beat = heartbeat(frame, period, random(`${seed}-b`) * period);
        const x = ax * width + Math.sin(frame / 130 + phase) * 34 - size / 2;
        const y = ay * height + Math.cos(frame / 150 + phase) * 26 - size / 2;
        const scale = 1 + 0.13 * beat;
        const tilt = Math.sin(frame / 170 + phase) * 9;
        return (
          <div
            key={seed}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: size,
              height: size,
              opacity: 0.08 + 0.07 * beat,
              transform: `rotate(${tilt}deg) scale(${scale})`,
              filter: `drop-shadow(0 0 ${14 + beat * 16}px ${color})`,
            }}
          >
            <Heart color={color} filled={false} strokeWidth={2.2} />
          </div>
        );
      })}
    </>
  );
};

// Layer 3 — tiny heart-sparks that twinkle into existence and vanish.
const SparkHearts: React.FC<{colors: string[]}> = ({colors}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  return (
    <>
      {Array.from({length: 10}, (_, i) => {
        const seed = `spark-${i}`;
        const color = colors[Math.floor(random(`${seed}-c`) * colors.length)];
        const size = 8 + random(`${seed}-s`) * 9;
        const x = random(`${seed}-x`) * width;
        const y = random(`${seed}-y`) * height;
        const period = 70 + random(`${seed}-t`) * 90;
        const phase = random(`${seed}-p`) * period;
        // Sharp twinkle: mostly off, briefly bright.
        const wave = Math.max(0, Math.sin(((frame + phase) / period) * Math.PI * 2));
        const twinkle = wave ** 4;
        return (
          <div
            key={seed}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: size,
              height: size,
              opacity: twinkle * 0.22,
              transform: `scale(${0.4 + twinkle * 0.8}) rotate(${(random(`${seed}-r`) - 0.5) * 40}deg)`,
              filter: `drop-shadow(0 0 ${size}px ${color})`,
            }}
          >
            <Heart color={color} filled />
          </div>
        );
      })}
    </>
  );
};

const GradeALoveMotifs: React.FC = () => {
  const pal = GRADE_A_LOVE_PALETTE;
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <BeatHearts colors={[pal.accentA, pal.softA, pal.accentB]} />
      <EmberHearts colors={[pal.accentA, pal.accentB, pal.softA, pal.softB]} />
      <SparkHearts colors={[pal.softA, pal.softB]} />
    </AbsoluteFill>
  );
};

export const GradeALoveVideo: React.FC = () => (
  <LyricVideoBase
    audioFile="grade-a-love.mp3"
    lyrics={gradeALoveLyrics}
    palette={GRADE_A_LOVE_PALETTE}
    Motifs={GradeALoveMotifs}
  />
);
