import { useCallback, useRef, type PointerEvent as ReactPointerEvent, type PropsWithChildren } from 'react';

/**
 * Magnetic hover. The element leans toward the cursor and a specular
 * highlight tracks it, so buttons feel physical rather than rectangular.
 *
 * Writes CSS custom properties instead of transforms directly, which lets the
 * stylesheet decide how much each element leans and lets the reduced-motion
 * media query neutralise all of it in one rule.
 */
export function Magnetic({
  children,
  className = '',
  strength = 8
}: PropsWithChildren<{ className?: string; strength?: number }>) {
  const ref = useRef<HTMLSpanElement>(null);
  const frame = useRef(0);

  const track = useCallback((event: ReactPointerEvent<HTMLSpanElement>) => {
    const node = ref.current;
    if (!node) return;
    const { clientX, clientY } = event;
    if (frame.current) return;
    frame.current = window.requestAnimationFrame(() => {
      frame.current = 0;
      const rect = node.getBoundingClientRect();
      const relativeX = (clientX - rect.left) / rect.width;
      const relativeY = (clientY - rect.top) / rect.height;
      node.style.setProperty('--pull-x', `${(relativeX - 0.5) * strength}px`);
      node.style.setProperty('--pull-y', `${(relativeY - 0.5) * strength}px`);
      node.style.setProperty('--spec-x', `${relativeX * 100}%`);
      node.style.setProperty('--spec-y', `${relativeY * 100}%`);
    });
  }, [strength]);

  const release = useCallback(() => {
    const node = ref.current;
    if (!node) return;
    if (frame.current) {
      window.cancelAnimationFrame(frame.current);
      frame.current = 0;
    }
    node.style.setProperty('--pull-x', '0px');
    node.style.setProperty('--pull-y', '0px');
  }, []);

  return (
    <span
      ref={ref}
      className={`magnetic ${className}`.trim()}
      onPointerMove={track}
      onPointerLeave={release}
    >
      {children}
    </span>
  );
}
