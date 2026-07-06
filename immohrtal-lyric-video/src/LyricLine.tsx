import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT_FAMILY} from './theme';

export type Word = {word: string; start: number; end: number};
export type Line = {start: number; end: number; words: Word[]};

// Entrance variants cycled per line so the cuts stay dynamic.
const VARIANTS = ['zoomIn', 'slideLeft', 'slideRight', 'riseUp', 'tiltSnap', 'dropIn'] as const;
type Variant = (typeof VARIANTS)[number];

const entranceTransform = (v: Variant, p: number): string => {
  const inv = 1 - p;
  switch (v) {
    case 'zoomIn':
      return `scale(${0.6 + 0.4 * p})`;
    case 'slideLeft':
      return `translateX(${inv * 260}px) rotate(${inv * 4}deg)`;
    case 'slideRight':
      return `translateX(${-inv * 260}px) rotate(${-inv * 4}deg)`;
    case 'riseUp':
      return `translateY(${inv * 200}px) scale(${0.85 + 0.15 * p})`;
    case 'tiltSnap':
      return `perspective(900px) rotateX(${inv * 65}deg) scale(${0.9 + 0.1 * p})`;
    case 'dropIn':
      return `translateY(${-inv * 220}px) scale(${1.25 - 0.25 * p})`;
  }
};

const WordSpan: React.FC<{
  w: Word;
  audioOffset: number;
  fontSize: number;
}> = ({w, audioOffset, fontSize}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const startF = (w.start + audioOffset) * fps;
  const endF = (w.end + audioOffset) * fps;

  const sung = frame >= startF;
  const active = frame >= startF && frame <= Math.max(endF, startF + 8);

  // The pop: springs the moment the word is sung.
  const pop = sung
    ? spring({frame: frame - startF, fps, config: {damping: 11, stiffness: 190, mass: 0.6}})
    : 0;
  const scale = sung ? 1 + (active ? 0.13 : 0.04) * Math.min(pop, 1.15) : 0.94;
  const lift = sung ? -12 * Math.min(pop, 1) : 0;

  const gradient = active
    ? `linear-gradient(178deg, ${C.white} 8%, ${C.greenSoft} 38%, ${C.green} 60%, ${C.blue} 100%)`
    : sung
      ? `linear-gradient(178deg, ${C.white} 10%, ${C.ice} 45%, ${C.steel} 100%)`
      : `linear-gradient(178deg, ${C.steel} 20%, #4a5a72 100%)`;

  // NOTE: two nested spans on purpose — filter and background-clip:text on
  // the same element makes Chrome drop the clip and paint a ghost copy of
  // the gradient. Shadows/transform live on the outer span, the clipped
  // gradient fill on the inner one. No text-shadow anywhere for the same
  // reason.
  return (
    <span
      style={{
        display: 'inline-block',
        margin: `0 ${fontSize * 0.17}px`,
        transform: `translateY(${lift}px) scale(${scale})`,
        filter: active
          ? `drop-shadow(2px 3px 0 #020408) drop-shadow(2px 3px 0 #0b1420) drop-shadow(2px 2px 0 #0b1420) drop-shadow(0 0 ${fontSize * 0.2}px ${C.green}99)`
          : `drop-shadow(2px 3px 0 #020408) drop-shadow(2px 3px 0 #0b1420) drop-shadow(1px 2px 1px rgba(0,0,0,0.65))`,
      }}
    >
      <span
        style={{
          fontFamily: FONT_FAMILY,
          fontSize,
          lineHeight: 1.12,
          textTransform: 'uppercase',
          backgroundImage: gradient,
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          color: 'transparent',
        }}
      >
        {w.word}
      </span>
    </span>
  );
};

export const LyricLine: React.FC<{
  line: Line;
  index: number;
  audioOffset: number;
  exitFrame: number; // frame (local) at which this line starts leaving
}> = ({line, index, audioOffset, exitFrame}) => {
  const frame = useCurrentFrame();
  const {fps, width} = useVideoConfig();

  const variant = VARIANTS[index % VARIANTS.length];
  const enter = spring({frame, fps, config: {damping: 16, stiffness: 130, mass: 0.8}});

  const exit = interpolate(frame, [exitFrame, exitFrame + 10], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const exitTransform =
    index % 2 === 0
      ? `translateY(${-exit * 140}px) scale(${1 + exit * 0.25})`
      : `translateY(${exit * 120}px) scale(${1 - exit * 0.2})`;

  // Slight camera punch-in over the life of the line.
  const drift = 1 + Math.min(frame / (fps * 6), 1) * 0.045;

  const totalChars = line.words.reduce((n, w) => n + w.word.length + 1, 0);
  const fontSize = Math.min(104, Math.max(56, (width * 1.35) / Math.max(totalChars, 10)));

  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
      <div
        style={{
          width: '82%',
          textAlign: 'center',
          opacity: (1 - exit) * interpolate(enter, [0, 0.25], [0, 1], {extrapolateRight: 'clamp'}),
          transform: `${exitTransform} ${entranceTransform(variant, enter)} scale(${drift}) perspective(1000px) rotateX(6deg)`,
        }}
      >
        {line.words.map((w, i) => (
          <WordSpan key={i} w={w} audioOffset={audioOffset} fontSize={fontSize} />
        ))}
      </div>
    </AbsoluteFill>
  );
};
