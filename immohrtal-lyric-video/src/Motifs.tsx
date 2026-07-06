import React from 'react';
import {AbsoluteFill, random, useCurrentFrame, useVideoConfig} from 'remotion';
import {C} from './theme';

// Low-opacity floating inspirational motifs — sparkle, star, bolt — drifting
// upward with parallax so the frame always has quiet motion behind the lyrics.

const Sparkle: React.FC<{color: string}> = ({color}) => (
  <svg viewBox="0 0 40 40" fill="none" style={{width: '100%', height: '100%'}}>
    <path
      d="M20 2c1.5 8.5 4.5 14 16 18-11.5 4-14.5 9.5-16 18-1.5-8.5-4.5-14-16-18 11.5-4 14.5-9.5 16-18z"
      stroke={color}
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
  </svg>
);

const Star: React.FC<{color: string}> = ({color}) => (
  <svg viewBox="0 0 40 40" fill="none" style={{width: '100%', height: '100%'}}>
    <path
      d="M20 3l4.7 10.7L36 15.2l-8.5 8 2.3 11.5L20 28.9 10.2 34.7l2.3-11.5-8.5-8 11.3-1.5L20 3z"
      stroke={color}
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
  </svg>
);

const Bolt: React.FC<{color: string}> = ({color}) => (
  <svg viewBox="0 0 28 44" fill="none" style={{width: '100%', height: '100%'}}>
    <path d="M17 2L4 26h8l-3 16 15-26h-9l2-14z" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />
  </svg>
);

const SHAPES = [Sparkle, Star, Bolt];

const FloatingMotif: React.FC<{seed: number}> = ({seed}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const Shape = SHAPES[Math.floor(random(`m-${seed}`) * SHAPES.length)];
  const color = random(`mc-${seed}`) > 0.5 ? C.blue : C.green;
  const baseX = random(`mx-${seed}`) * width;
  const baseY = random(`my-${seed}`) * height;
  const size = 42 + random(`ms-${seed}`) * 66;
  const phase = random(`mp-${seed}`) * Math.PI * 2;
  const x = baseX + Math.sin(frame / 90 + phase) * 46;
  const y = baseY + Math.cos(frame / 110 + phase) * 34 - frame * 0.12;
  const rot = Math.sin(frame / 130 + phase) * 14;
  const wrappedY = ((y % (height + 140)) + height + 140) % (height + 140) - 70;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: wrappedY,
        width: size,
        height: size,
        opacity: 0.10 + random(`mo-${seed}`) * 0.07,
        transform: `rotate(${rot}deg)`,
        filter: `drop-shadow(0 0 10px ${color})`,
      }}
    >
      <Shape color={color} />
    </div>
  );
};

export const Motifs: React.FC = () => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    {Array.from({length: 9}, (_, i) => (
      <FloatingMotif key={i} seed={i} />
    ))}
  </AbsoluteFill>
);
