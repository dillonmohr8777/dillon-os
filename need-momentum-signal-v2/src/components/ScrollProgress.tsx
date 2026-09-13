import { useEffect, useRef } from 'react';

/**
 * Scroll progress rail. v1 re-rendered React on every scroll frame to set a
 * transform; this writes the value straight to the node inside a single
 * rAF-throttled handler, so scrolling costs nothing in the React tree.
 */
export function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = bar.current;
    if (!node) return;
    let frame = 0;
    const write = () => {
      frame = 0;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const progress = height > 0 ? window.scrollY / height : 0;
      node.style.setProperty('--progress', String(progress));
    };
    const update = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(write);
    };
    write();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="scroll-progress" ref={bar} aria-hidden="true">
      <span className="scroll-progress__fill" />
      <span className="scroll-progress__head" />
    </div>
  );
}
