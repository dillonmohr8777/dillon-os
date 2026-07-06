import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Logo3D} from './Logo3D';
import {C, FONT_FAMILY, extrude} from './theme';

// Calm opening: dark stage, the mark rises and settles with a slow 3D
// rotation and light sweep, then breathes until the first lyric line.
export const Intro: React.FC<{fadeOutStart: number; fadeOutEnd: number}> = ({
  fadeOutStart,
  fadeOutEnd,
}) => {
  const frame = useCurrentFrame();
  const {fps, width} = useVideoConfig();

  const enter = spring({frame, fps, config: {damping: 200, mass: 1.4}, durationInFrames: 70});
  const scale = interpolate(enter, [0, 1], [0.78, 1]);
  const rise = interpolate(enter, [0, 1], [70, 0]);
  const rotIn = interpolate(enter, [0, 1], [-32, 0]);
  const fadeIn = interpolate(frame, [0, 26], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const titleIn = interpolate(frame, [55, 85], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Exit: quick zoom-through toward the camera as the lyrics take over.
  const exit = interpolate(frame, [fadeOutStart, fadeOutEnd], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const exitScale = 1 + exit * 2.1;
  const exitOpacity = 1 - exit;

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        opacity: fadeIn * exitOpacity,
        transform: `scale(${exitScale})`,
      }}
    >
      <div
        style={{
          transform: `translateY(${rise}px) scale(${scale}) perspective(1200px) rotateY(${rotIn}deg)`,
        }}
      >
        <Logo3D width={width * 0.34} wobble={4} />
      </div>
      <div
        style={{
          marginTop: -6,
          fontFamily: FONT_FAMILY,
          fontSize: 30,
          letterSpacing: '0.55em',
          color: C.steel,
          textTransform: 'uppercase',
          opacity: titleIn,
          transform: `translateY(${(1 - titleIn) * 18}px)`,
          textShadow: extrude(3),
        }}
      >
        Immohrtal
      </div>
    </AbsoluteFill>
  );
};
