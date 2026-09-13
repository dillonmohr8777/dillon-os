import { Suspense, lazy } from 'react';

/**
 * three.js and @react-three/fiber are roughly a megabyte parsed. Holding first
 * paint behind them was v1's biggest load-time cost, so both scenes resolve
 * lazily and the page renders its type, colour and layout immediately.
 */
const Scene = lazy(() => import('./SignalScene').then((module) => ({ default: module.SignalScene })));
const Spine = lazy(() => import('./SignalScene').then((module) => ({ default: module.AmbientParticleSpine })));

export function LazySignalScene({ variant }: { variant?: 'mark' | 'wordmark' | 'm360' }) {
  return (
    <Suspense fallback={<div className="signal-canvas signal-canvas--pending" />}>
      <Scene variant={variant} />
    </Suspense>
  );
}

export function LazyParticleSpine() {
  return (
    <Suspense fallback={null}>
      <Spine />
    </Suspense>
  );
}
