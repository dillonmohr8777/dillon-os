import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {Logo3D} from './Logo3D';
import {C, FONT_FAMILY, extrude} from './theme';

// Closer: the mark returns with a slow zoom and glow, then fades with the music.
export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, durationInFrames} = useVideoConfig();

  const appear = interpolate(frame, [0, 40], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const grow = interpolate(frame, [0, durationInFrames], [0.92, 1.05]);
  const fade = interpolate(frame, [durationInFrames - 35, durationInFrames - 5], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{justifyContent: 'center', alignItems: 'center', opacity: appear * fade}}
    >
      <div style={{transform: `scale(${grow})`}}>
        <Logo3D width={width * 0.3} wobble={3} />
      </div>
      <div
        style={{
          marginTop: -4,
          fontFamily: FONT_FAMILY,
          fontSize: 24,
          letterSpacing: '0.5em',
          color: C.steel,
          textTransform: 'uppercase',
          textShadow: extrude(3),
        }}
      >
        Immohrtal
      </div>
    </AbsoluteFill>
  );
};
