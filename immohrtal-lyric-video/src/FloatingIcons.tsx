import React from 'react';
import {AbsoluteFill, random, useCurrentFrame, useVideoConfig} from 'remotion';

export type IconShape = React.FC<{color: string}>;

// Reusable drift engine for per-track themed background icons: slow rise,
// sine wander, gentle rotation, low opacity so lyrics stay dominant.
export const FloatingIcons: React.FC<{
  shapes: IconShape[];
  colors: string[];
  count?: number;
  opacityRange?: [number, number];
  sizeRange?: [number, number];
  riseSpeed?: number; // px per frame upward; negative drifts down
  spin?: number; // max degrees of rotation wobble
}> = ({
  shapes,
  colors,
  count = 9,
  opacityRange = [0.1, 0.17],
  sizeRange = [42, 108],
  riseSpeed = 0.12,
  spin = 14,
}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      {Array.from({length: count}, (_, seed) => {
        const Shape = shapes[Math.floor(random(`m-${seed}`) * shapes.length)];
        const color = colors[Math.floor(random(`mc-${seed}`) * colors.length)];
        const baseX = random(`mx-${seed}`) * width;
        const baseY = random(`my-${seed}`) * height;
        const size = sizeRange[0] + random(`ms-${seed}`) * (sizeRange[1] - sizeRange[0]);
        const phase = random(`mp-${seed}`) * Math.PI * 2;
        const x = baseX + Math.sin(frame / 90 + phase) * 46;
        const y = baseY + Math.cos(frame / 110 + phase) * 34 - frame * riseSpeed;
        const rot = Math.sin(frame / 130 + phase) * spin;
        const span = height + 140;
        const wrappedY = ((y % span) + span) % span - 70;
        const opacity =
          opacityRange[0] + random(`mo-${seed}`) * (opacityRange[1] - opacityRange[0]);
        return (
          <div
            key={seed}
            style={{
              position: 'absolute',
              left: x,
              top: wrappedY,
              width: size,
              height: size,
              opacity,
              transform: `rotate(${rot}deg)`,
              filter: `drop-shadow(0 0 10px ${color})`,
            }}
          >
            <Shape color={color} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
