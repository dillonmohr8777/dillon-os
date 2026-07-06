import React from 'react';
import {Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {useTrackPalette} from './TrackTheme';

// The IMMOHRTAL mark with a "super 3D" treatment: perspective tilt that
// slowly oscillates, a light sweep masked to the logo's alpha, dual-color
// glow, and a floor reflection.
export const Logo3D: React.FC<{
  width: number;
  sweep?: boolean;
  reflection?: boolean;
  wobble?: number; // degrees of continuous 3D oscillation
}> = ({width, sweep = true, reflection = true, wobble = 5}) => {
  const pal = useTrackPalette();
  const frame = useCurrentFrame();
  const src = staticFile('logo.png');
  const height = width * (763 / 1099);

  const rotY = Math.sin(frame / 70) * wobble;
  const rotX = Math.cos(frame / 95) * wobble * 0.45;

  // Light sweep position loops across the mark.
  const sweepT = (frame % 150) / 150;
  const sweepX = interpolate(sweepT, [0, 1], [-60, 160]);

  return (
    <div style={{perspective: 1100, width, height: reflection ? height * 1.5 : height}}>
      <div
        style={{
          width,
          height,
          transform: `rotateY(${rotY}deg) rotateX(${rotX}deg)`,
          transformStyle: 'preserve-3d',
          position: 'relative',
        }}
      >
        <Img
          src={src}
          style={{
            width: '100%',
            height: '100%',
            filter: `drop-shadow(0 0 ${width * 0.045}px ${pal.accentB}66) drop-shadow(0 0 ${width * 0.11}px ${pal.accentA}40) drop-shadow(0 ${width * 0.02}px ${width * 0.03}px rgba(0,0,0,0.8))`,
          }}
        />
        {sweep ? (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              maskImage: `url(${src})`,
              WebkitMaskImage: `url(${src})`,
              maskSize: '100% 100%',
              WebkitMaskSize: '100% 100%',
              background: `linear-gradient(115deg, transparent ${sweepX - 18}%, rgba(244,248,255,0.85) ${sweepX}%, transparent ${sweepX + 18}%)`,
              mixBlendMode: 'screen',
            }}
          />
        ) : null}
      </div>
      {reflection ? (
        <div
          style={{
            width,
            height,
            transform: `scaleY(-1) rotateY(${rotY}deg) rotateX(${-rotX}deg)`,
            marginTop: 6,
            position: 'relative',
          }}
        >
          <Img
            src={src}
            style={{
              width: '100%',
              height: '100%',
              opacity: 0.22,
              maskImage: 'linear-gradient(to top, rgba(0,0,0,0.9) 55%, transparent 95%)',
              WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,0.9) 55%, transparent 95%)',
              filter: 'blur(2px)',
            }}
          />
        </div>
      ) : null}
    </div>
  );
};
