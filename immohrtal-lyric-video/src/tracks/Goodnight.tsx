import React from 'react';
import {AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig} from 'remotion';
import lyricsData from './goodnight-lyrics.json';
import {FloatingIcons, IconShape} from '../FloatingIcons';
import {LyricVideoBase, LyricsData} from '../LyricVideoBase';
import {TrackPalette} from '../TrackTheme';
import {FONT_FAMILY} from '../theme';

// "Goodnight" — hushed midnight lullaby: lavender + moonlight blue on the
// IMMOHRTAL night base. A sleeping crescent moon breathes in the corner,
// Zzz trails rise like slow exhales, and dim stars twinkle half-asleep.
// Everything moves slower and sits dimmer than the other videos.
export const goodnightLyrics = lyricsData as LyricsData;

export const GOODNIGHT_PALETTE: TrackPalette = {
  accentA: '#c3b2fa', // dusty lavender
  accentB: '#5fb4f0', // moonlight blue
  softA: '#e3daff',
  softB: '#c3e5ff',
  washA: 'rgba(122, 102, 236, 0.20)',
  washB: 'rgba(48, 128, 206, 0.13)',
};

// -- drifting icon shapes (for the FloatingIcons depth layer) ---------------

const Moon: IconShape = ({color}) => (
  <svg viewBox="0 0 44 44" fill="none" style={{width: '100%', height: '100%'}}>
    <path
      d="M38 27.5A17 17 0 1 1 16.5 6 13.5 13.5 0 0 0 38 27.5z"
      stroke={color}
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
  </svg>
);

const SparkleIcon: IconShape = ({color}) => (
  <svg viewBox="0 0 44 44" fill="none" style={{width: '100%', height: '100%'}}>
    <path
      d="M22 6c1.6 8.6 5.4 12.4 14 14-8.6 1.6-12.4 5.4-14 14-1.6-8.6-5.4-12.4-14-14 8.6-1.6 12.4-5.4 14-14z"
      fill={color}
      fillOpacity="0.7"
    />
  </svg>
);

// -- the sleeping moon: fixed anchor, breathing halo, closed eyes -----------

const SleepingMoon: React.FC<{endFadeStart: number}> = ({endFadeStart}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  // Slow breath: ~11s cycle, like sleep.
  const breath = 0.5 + 0.5 * Math.sin(frame / 52);
  const opacity = 0.1 + 0.05 * breath;
  const tilt = -14 + Math.sin(frame / 140) * 2.5;
  const bob = Math.sin(frame / 120) * 6;
  const fade = interpolate(frame, [endFadeStart, durationInFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const size = 168;
  const cA = GOODNIGHT_PALETTE.softA;
  return (
    <div
      style={{
        position: 'absolute',
        left: '76.5%',
        top: `${9 + bob / 7}%`,
        width: size,
        height: size,
        opacity: opacity * fade,
      }}
    >
      {/* breathing halo */}
      <div
        style={{
          position: 'absolute',
          inset: -size * 0.55,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${GOODNIGHT_PALETTE.accentA}55 0%, transparent 68%)`,
          opacity: 0.55 + 0.45 * breath,
        }}
      />
      <svg
        viewBox="0 0 120 120"
        fill="none"
        style={{width: '100%', height: '100%', transform: `rotate(${tilt}deg)`}}
      >
        {/* crescent body */}
        <path
          d="M100 74A44 44 0 1 1 46 20a34 34 0 0 0 54 54z"
          fill={cA}
          fillOpacity="0.16"
          stroke={cA}
          strokeWidth="2.6"
          strokeLinejoin="round"
        />
        {/* closed, sleeping eyes + tiny content mouth */}
        <path
          d="M38 66q5 6 11 0M58 76q5 6 11 0"
          stroke={cA}
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        <path d="M52 90q4 3.4 8 0" stroke={cA} strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    </div>
  );
};

// -- Zzz trails: three z's rise like a slow exhale, loop forever ------------

const ZzzTrail: React.FC<{
  seed: string;
  x: number; // percent
  y: number; // percent (where the breath starts)
  scale?: number;
  endFadeStart: number;
}> = ({seed, x, y, scale = 1, endFadeStart}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const period = 290 + random(`zp-${seed}`) * 70; // ~10-12s per breath
  const phase = random(`zf-${seed}`) * period;
  const fade = interpolate(frame, [endFadeStart, durationInFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <div style={{position: 'absolute', left: `${x}%`, top: `${y}%`}}>
      {[0, 1, 2].map((k) => {
        // Each z trails the previous by a beat.
        const t = (((frame + phase - k * 34) % period) + period) % period;
        const p = t / period;
        const rise = p * 150 * scale;
        const sway = Math.sin(p * Math.PI * 2.2 + k * 1.7) * 15;
        // Ease in, hold soft, sigh out.
        const env = Math.sin(Math.min(p, 1) * Math.PI);
        const opacity = env * 0.13 * fade;
        const fontSize = (17 + k * 9) * scale * (0.85 + p * 0.3);
        const rot = -8 + k * 7 + Math.sin(p * Math.PI * 2 + k) * 6;
        return (
          <span
            key={k}
            style={{
              position: 'absolute',
              left: sway + k * 16 * scale,
              top: -rise - k * 13 * scale,
              fontFamily: FONT_FAMILY,
              fontSize,
              color: k % 2 === 0 ? GOODNIGHT_PALETTE.softA : GOODNIGHT_PALETTE.softB,
              opacity,
              transform: `rotate(${rot}deg)`,
              filter: `drop-shadow(0 0 8px ${GOODNIGHT_PALETTE.accentA})`,
            }}
          >
            Z
          </span>
        );
      })}
    </div>
  );
};

// -- half-asleep stars: dim pinpoints + a few four-point sparkles -----------

const NightStars: React.FC<{endFadeStart: number}> = ({endFadeStart}) => {
  const frame = useCurrentFrame();
  const {width, height, durationInFrames} = useVideoConfig();
  const fade = interpolate(frame, [endFadeStart, durationInFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      {Array.from({length: 20}, (_, i) => {
        const sx = random(`st-x-${i}`) * width;
        // Keep stars in the upper 2/3 so the floor grid stays clean.
        const sy = random(`st-y-${i}`) * height * 0.66;
        const isSparkle = i % 4 === 0;
        const size = isSparkle ? 14 + random(`st-s-${i}`) * 12 : 2.5 + random(`st-s-${i}`) * 3;
        const phase = random(`st-p-${i}`) * Math.PI * 2;
        // A long lazy twinkle (~8-13s) instead of a flicker.
        const speed = 38 + random(`st-v-${i}`) * 26;
        const tw = 0.5 + 0.5 * Math.sin(frame / speed + phase);
        const opacity = (0.045 + 0.095 * tw) * fade;
        const color = random(`st-c-${i}`) > 0.5 ? GOODNIGHT_PALETTE.softA : GOODNIGHT_PALETTE.softB;
        return isSparkle ? (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: sx,
              top: sy,
              width: size,
              height: size,
              opacity,
              transform: `scale(${0.8 + 0.25 * tw})`,
            }}
          >
            <SparkleIcon color={color} />
          </div>
        ) : (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: sx,
              top: sy,
              width: size,
              height: size,
              borderRadius: '50%',
              background: color,
              opacity,
              boxShadow: `0 0 ${size * 3}px ${color}`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// -- assemble ----------------------------------------------------------------

const GoodnightMotifs: React.FC = () => {
  const {durationInFrames} = useVideoConfig();
  const endFadeStart = durationInFrames - 45;
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <NightStars endFadeStart={endFadeStart} />
      {/* far depth layer: tiny outline moons drifting up barely faster than still */}
      <FloatingIcons
        shapes={[Moon]}
        colors={[GOODNIGHT_PALETTE.accentA, GOODNIGHT_PALETTE.accentB]}
        count={6}
        sizeRange={[26, 58]}
        riseSpeed={0.04}
        spin={6}
        opacityRange={[0.06, 0.1]}
      />
      <SleepingMoon endFadeStart={endFadeStart} />
      {/* the moon itself snores... */}
      <ZzzTrail seed="moon" x={88.5} y={13} scale={0.85} endFadeStart={endFadeStart} />
      {/* ...and slow breaths rise from the lower corners */}
      <ZzzTrail seed="left" x={7} y={74} scale={1.2} endFadeStart={endFadeStart} />
      <ZzzTrail seed="right" x={80} y={68} scale={1} endFadeStart={endFadeStart} />
      <ZzzTrail seed="mid" x={26} y={38} scale={0.7} endFadeStart={endFadeStart} />
    </AbsoluteFill>
  );
};

export const GoodnightVideo: React.FC = () => (
  <LyricVideoBase
    audioFile="goodnight.mp3"
    lyrics={goodnightLyrics}
    palette={GOODNIGHT_PALETTE}
    Motifs={GoodnightMotifs}
  />
);
