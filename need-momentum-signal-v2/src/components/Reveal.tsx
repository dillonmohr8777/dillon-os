import {
  Fragment,
  useEffect,
  useRef,
  type ComponentType,
  type ElementType,
  type HTMLAttributes,
  type PropsWithChildren,
  type Ref
} from 'react';
import gsap from 'gsap';

/**
 * TypeScript resolves the props of a bare `ElementType` to the intersection of
 * every possible element, which is `never`. These two lines are the standard
 * escape hatch: keep `ElementType` on the public prop for a good call-site
 * experience, then narrow to a concrete signature for the actual JSX.
 */
type PolymorphicProps = HTMLAttributes<HTMLElement> & { ref?: Ref<HTMLElement> };
const asComponent = (tag: ElementType) => tag as unknown as ComponentType<PolymorphicProps>;

type RevealProps = PropsWithChildren<{
  className?: string;
  /** Direction the element travels in from. */
  from?: 'up' | 'left' | 'right';
  /** 0-3, maps to the --delay steps in the stylesheet. */
  delay?: 0 | 1 | 2 | 3;
  as?: ElementType;
}>;

/**
 * Structural scroll reveal. CSS owns the motion so the un-revealed state is
 * expressed as a class, not as inline styles — that keeps the no-JS and
 * reduced-motion opt-outs in one place in the stylesheet.
 */
export function Reveal({ children, className = '', from = 'up', delay = 0, as = 'div' }: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const Tag = asComponent(as);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      node.classList.add('is-revealed');
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      node.classList.add('is-revealed');
      observer.disconnect();
    }, { threshold: 0.16, rootMargin: '0px 0px -6% 0px' });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={`reveal reveal--${from} reveal--delay-${delay} ${className}`.trim()}
    >
      {children}
    </Tag>
  );
}

/**
 * Word-level heading reveal. v1 only did this for the founder bios; headings
 * got a single blurred block fade. GSAP earns its place here — a per-word
 * stagger with an expo curve is the one thing plain CSS does clumsily.
 *
 * The text is split on spaces and reassembled with real spaces between the
 * spans, so the rendered string is character-identical to the input.
 */
export function RevealWords({
  text,
  className = '',
  as = 'h2',
  emphasis
}: {
  text: string;
  className?: string;
  as?: ElementType;
  /**
   * Word to set in the editorial serif. Purely a styling hook — the word is
   * matched against the existing text, never substituted, so the rendered
   * string stays identical.
   */
  emphasis?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const Tag = asComponent(as);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const words = node.querySelectorAll<HTMLElement>('.reveal-word__inner');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(words, { yPercent: 0, opacity: 1 });
      return;
    }
    gsap.set(words, { yPercent: 108, opacity: 0 });
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      gsap.to(words, {
        yPercent: 0,
        opacity: 1,
        duration: 0.92,
        ease: 'expo.out',
        stagger: 0.055,
        clearProps: 'transform,opacity'
      });
      observer.disconnect();
    }, { threshold: 0.24 });
    observer.observe(node);
    return () => observer.disconnect();
  }, [text]);

  // A "\n" in the source string becomes a real <br>, so headings that were
  // hard-broken in v1 keep the exact same line break.
  const lines = text.split('\n');

  return (
    <Tag ref={ref} className={`reveal-words ${className}`.trim()}>
      {lines.map((line, lineIndex) => {
        const words = line.split(' ');
        return (
          <Fragment key={`line-${lineIndex}`}>
            {lineIndex > 0 ? <br /> : null}
            {words.map((word, index) => (
              /* The inter-word space MUST be a sibling of .reveal-word, not a
                 child of it: .reveal-word is an inline-block with
                 overflow:hidden (it is the clipping mask the word slides up
                 inside), and a trailing space within that box gets clipped —
                 which ran every heading together as one word. */
              <Fragment key={`${word}-${index}`}>
                <span className="reveal-word">
                  <span className={word === emphasis ? 'reveal-word__inner editorial' : 'reveal-word__inner'}>
                    {word}
                  </span>
                </span>
                {index < words.length - 1 ? ' ' : null}
              </Fragment>
            ))}
          </Fragment>
        );
      })}
    </Tag>
  );
}
