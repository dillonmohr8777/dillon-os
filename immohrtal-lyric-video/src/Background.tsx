import React from 'react';
import {AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FPS} from './theme';

// Drifting light particle — rises slowly, inspirational vibe.
const Particle: React.FC<{seed: number}> = ({seed}) => {
  const frame = useCurrentFrame();
  const {height, width, durationInFrames} = useVideoConfig();
  const x = random(`px-${seed}`) * width;
  const size = 2 + random(`ps-${seed}`) * 5;
  const speed = 0.25 + random(`pv-${seed}`) * 0.55; // px per frame upward
  const phase = random(`pp-${seed}`) * Math.PI * 2;
  const total = height + 80;
  const y = ((random(`py-${seed}`) * total + total - frame * speed) % total + total) % total - 40;
  const drift = Math.sin(frame / 55 + phase) * 26;
  const twinkle = 0.25 + 0.55 * (0.5 + 0.5 * Math.sin(frame / 22 + phase * 3));
  const fadeOut = interpolate(frame, [durationInFrames - 45, durationInFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const color = random(`pc-${seed}`) > 0.5 ? C.greenSoft : C.blueSoft;
  return (
    <div
      style={{
        position: 'absolute',
        left: x + drift,
        top: y,
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        opacity: twinkle * 0.5 * fadeOut,
        boxShadow: `0 0 ${size * 3}px ${color}`,
      }}
    />
  );
};

// Diagonal light streak that sweeps across periodically.
const Streak: React.FC<{seed: number}> = ({seed}) => {
  const frame = useCurrentFrame();
  const {width} = useVideoConfig();
  const period = 260 + random(`sk-${seed}`) * 200;
  const offset = random(`so-${seed}`) * period;
  const t = ((frame + offset) % period) / period;
  const x = interpolate(t, [0, 1], [-width * 0.6, width * 1.3]);
  const opacity = Math.sin(t * Math.PI) * 0.14;
  const color = random(`sc-${seed}`) > 0.5 ? C.blue : C.green;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: '-20%',
        width: 3 + random(`sw-${seed}`) * 4,
        height: '150%',
        transform: `rotate(${18 + random(`sr-${seed}`) * 10}deg)`,
        background: `linear-gradient(to bottom, transparent, ${color}, transparent)`,
        opacity,
        filter: 'blur(2px)',
      }}
    />
  );
};

// Perspective floor grid — subtle stage-floor lines scrolling toward the horizon.
const FloorGrid: React.FC = () => {
  const frame = useCurrentFrame();
  const shift = (frame * 1.2) % 90;
  return (
    <div
      style={{
        position: 'absolute',
        left: '-25%',
        right: '-25%',
        bottom: '-12%',
        height: '46%',
        transform: 'perspective(700px) rotateX(62deg)',
        transformOrigin: 'bottom center',
        backgroundImage: `repeating-linear-gradient(to top, ${C.steel}22 0px, ${C.steel}22 2px, transparent 2px, transparent 90px),
          repeating-linear-gradient(to right, ${C.steel}14 0px, ${C.steel}14 2px, transparent 2px, transparent 130px)`,
        backgroundPositionY: `${shift}px`,
        maskImage: 'linear-gradient(to top, rgba(0,0,0,0.55), transparent)',
        WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,0.55), transparent)',
      }}
    />
  );
};

export const Background: React.FC<{pulseTimes?: number[]}> = ({pulseTimes = []}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();

  // Slow hue drift between blue-leaning and green-leaning washes.
  const mix = 0.5 + 0.5 * Math.sin(frame / (FPS * 14));
  const glowA = `rgba(53, 167, 255, ${0.16 + 0.08 * mix})`;
  const glowB = `rgba(53, 209, 143, ${0.20 - 0.08 * mix})`;

  // Beat-ish flash: brief bloom right after each lyric line lands.
  let pulse = 0;
  for (const t of pulseTimes) {
    const pf = t * FPS;
    if (frame >= pf && frame < pf + 14) {
      pulse = Math.max(pulse, interpolate(frame, [pf, pf + 14], [0.16, 0]));
    }
  }

  const endFade = interpolate(
    frame,
    [durationInFrames - 40, durationInFrames],
    [0, 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );

  return (
    <AbsoluteFill style={{backgroundColor: C.bgDeep, overflow: 'hidden'}}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(120% 90% at 20% 10%, ${glowA}, transparent 60%),
            radial-gradient(110% 90% at 85% 85%, ${glowB}, transparent 55%),
            linear-gradient(160deg, ${C.bgNavy} 0%, ${C.bgDeep} 45%, ${C.bgSlate} 100%)`,
        }}
      />
      <FloorGrid />
      {Array.from({length: 8}, (_, i) => (
        <Streak key={i} seed={i} />
      ))}
      {Array.from({length: 34}, (_, i) => (
        <Particle key={i} seed={i} />
      ))}
      {/* vignette */}
      <AbsoluteFill
        style={{
          background: 'radial-gradient(90% 75% at 50% 48%, transparent 55%, rgba(2,4,8,0.75) 100%)',
        }}
      />
      {pulse > 0 ? (
        <AbsoluteFill style={{background: C.ice, opacity: pulse, mixBlendMode: 'overlay'}} />
      ) : null}
      {endFade > 0 ? <AbsoluteFill style={{background: '#000', opacity: endFade}} /> : null}
    </AbsoluteFill>
  );
};
