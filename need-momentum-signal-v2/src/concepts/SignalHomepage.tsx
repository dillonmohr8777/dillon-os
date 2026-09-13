import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent
} from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, MoveRight, Play } from 'lucide-react';
import { FinalCta, Footer } from '../components/Footer';
import { Founders } from '../components/Founders';
import { Header } from '../components/Header';
import { LazyParticleSpine, LazySignalScene } from '../components/LazyScene';
import { Magnetic } from '../components/Magnetic';
import { Reveal, RevealWords } from '../components/Reveal';
import { ScrollProgress } from '../components/ScrollProgress';
import { sizeOf } from '../shared/imageMeta';
import { pulseSignal } from '../shared/signalBus';
import { auditUrl, proofImages, services } from '../shared/content';

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return reduced;
}

/**
 * Leans the hero ticker with scroll velocity. Writes one custom property to
 * one node — the marquee animation is never restarted, so the run never jumps.
 */
function useScrollSkew() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let previous = window.scrollY;
    let frame = 0;
    let settle = 0;
    const write = () => {
      frame = 0;
      const current = window.scrollY;
      const velocity = Math.max(-1, Math.min(1, (current - previous) / 46));
      previous = current;
      node.style.setProperty('--velocity', velocity.toFixed(3));
      window.clearTimeout(settle);
      settle = window.setTimeout(() => node.style.setProperty('--velocity', '0'), 160);
    };
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(write);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.clearTimeout(settle);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);
  return ref;
}

/**
 * The swipe rail, rebuilt as a depth-staged corridor.
 *
 * Two behavioural changes from v1:
 *  - the 4.2s auto-advance is gone. An autoplaying carousel moves content out
 *    from under the reader and is explicitly ruled out by the repo's
 *    motion-design standard.
 *  - arrow keys drive it, so it is operable without a pointer.
 */
function ServiceRail() {
  const rail = useRef<HTMLDivElement>(null);
  const activeRef = useRef(0);
  const drag = useRef({ active: false, x: 0, scrollLeft: 0, moved: false });
  const [active, setActive] = useState(0);
  const [dragging, setDragging] = useState(false);
  const reducedMotion = useReducedMotion();

  const moveTo = useCallback((nextIndex: number, wrap = false) => {
    const next = wrap
      ? (nextIndex + services.length) % services.length
      : Math.max(0, Math.min(services.length - 1, nextIndex));
    activeRef.current = next;
    setActive(next);
    const item = rail.current?.children[next] as HTMLElement | undefined;
    if (item && rail.current) {
      rail.current.scrollTo({
        left: item.offsetLeft - Math.max(22, (rail.current.clientWidth - item.clientWidth) / 2),
        behavior: reducedMotion ? 'auto' : 'smooth'
      });
    }
  }, [reducedMotion]);

  const updateActiveFromScroll = () => {
    const node = rail.current;
    if (!node) return;
    const center = node.scrollLeft + node.clientWidth / 2;
    let nearest = 0;
    let distance = Number.POSITIVE_INFINITY;
    Array.from(node.children).forEach((child, index) => {
      const element = child as HTMLElement;
      const nextDistance = Math.abs((element.offsetLeft + element.clientWidth / 2) - center);
      if (nextDistance < distance) {
        distance = nextDistance;
        nearest = index;
      }
    });
    activeRef.current = nearest;
    setActive(nearest);
  };

  const beginDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    drag.current = { active: true, x: event.clientX, scrollLeft: rail.current?.scrollLeft || 0, moved: false };
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const continueDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag.current.active || !rail.current) return;
    const delta = event.clientX - drag.current.x;
    if (Math.abs(delta) > 4) drag.current.moved = true;
    rail.current.scrollLeft = drag.current.scrollLeft - delta * 1.2;
  };

  const endDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag.current.active) return;
    drag.current.active = false;
    setDragging(false);
    event.currentTarget.releasePointerCapture(event.pointerId);
    updateActiveFromScroll();
    moveTo(activeRef.current);
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      moveTo(activeRef.current + 1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      moveTo(activeRef.current - 1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      moveTo(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      moveTo(services.length - 1);
    }
  };

  const tiltCard = (event: ReactPointerEvent<HTMLElement>) => {
    if (reducedMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 13;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * -10;
    event.currentTarget.style.setProperty('--tilt-x', `${y}deg`);
    event.currentTarget.style.setProperty('--tilt-y', `${x}deg`);
    event.currentTarget.style.setProperty('--glow-x', `${((event.clientX - rect.left) / rect.width) * 100}%`);
    event.currentTarget.style.setProperty('--glow-y', `${((event.clientY - rect.top) / rect.height) * 100}%`);
  };

  const resetCard = (event: ReactPointerEvent<HTMLElement>) => {
    event.currentTarget.style.setProperty('--tilt-x', '0deg');
    event.currentTarget.style.setProperty('--tilt-y', '0deg');
  };

  return (
    <section className="signal-services surface-panel" aria-labelledby="signal-services-title">
      <div className="signal-services__top">
        <RevealWords as="h2" text="Swipe the whole system." className="signal-services__title" />
        <div className="rail-controls">
          <button type="button" onClick={() => moveTo(active - 1, true)} aria-label="Previous service"><ArrowLeft /></button>
          <span className="rail-counter" aria-live="polite">
            <span className="rail-counter__digit" key={active}>{active + 1}</span>
            <i aria-hidden="true">/</i>
            <span className="rail-counter__total">{services.length}</span>
          </span>
          <button type="button" onClick={() => moveTo(active + 1, true)} aria-label="Next service"><ArrowRight /></button>
        </div>
      </div>

      <div className="signal-rail__track" aria-hidden="true">
        <span style={{ transform: `scaleX(${(active + 1) / services.length})` }} />
      </div>

      <div className="signal-rail__stage">
        <div
          className={dragging ? 'signal-rail is-dragging' : 'signal-rail'}
          ref={rail}
          role="region"
          aria-labelledby="signal-services-title"
          tabIndex={0}
          onKeyDown={onKeyDown}
          onScroll={updateActiveFromScroll}
          onPointerDown={beginDrag}
          onPointerMove={continueDrag}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          {services.map(({ title, short, description, icon: Icon, hue }, index) => (
            <article
              className={index === active ? 'signal-service is-active' : 'signal-service'}
              key={title}
              data-hue={hue === 'yellow' ? 'warm' : 'cool'}
              style={{ '--offset': index - active, '--card-index': index } as CSSProperties}
              onPointerMove={tiltCard}
              onPointerLeave={resetCard}
            >
              <div className="signal-service__particles" aria-hidden="true"><i /><i /><i /><i /></div>
              <div className="signal-service__rim" aria-hidden="true" />
              <div className="signal-service__number">
                <em>{String(index + 1).padStart(2, '0')}</em>
                <Icon />
              </div>
              <p>{short}</p>
              <h3>{title}</h3>
              <span>{description}</span>
              <a href={auditUrl} onClick={(event) => { if (drag.current.moved) event.preventDefault(); }}>
                Put this to work <MoveRight />
              </a>
              <div className="signal-service__floor" aria-hidden="true" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function SignalProof() {
  const section = useRef<HTMLElement>(null);
  useEffect(() => {
    const node = section.current;
    if (!node || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        const rect = node.getBoundingClientRect();
        const progress = Math.min(1, Math.max(0, (window.innerHeight - rect.top) / (rect.height + window.innerHeight)));
        node.style.setProperty('--proof-progress', String(progress));
        frame = 0;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section className="signal-proof surface-deep" id="work" ref={section}>
      <div className="signal-proof__sticky">
        <div className="signal-proof__copy">
          <RevealWords as="h2" text="The work becomes proof." emphasis="proof." />
          <Reveal as="p" delay={1}>Real photos from Momentum 360 appear, sharpen and dissolve as the next place takes over.</Reveal>
        </div>
        <div className="signal-proof__stage">
          {proofImages.slice(0, 4).map((image, index) => {
            const { width, height } = sizeOf(image.src);
            return (
              <figure className={`proof-layer proof-layer--${index + 1}`} key={image.src}>
                <img
                  src={image.src}
                  alt={image.alt}
                  width={width}
                  height={height}
                  loading="lazy"
                  decoding="async"
                />
                <figcaption>{image.label}</figcaption>
              </figure>
            );
          })}
          <div className="signal-proof__reticle" aria-hidden="true"><span /><span /><span /><span /></div>
          <div className="signal-proof__wipe" aria-hidden="true" />
          <div className="signal-proof__meter" aria-hidden="true"><i /></div>
        </div>
      </div>
    </section>
  );
}

export function SignalHomepage() {
  useEffect(() => {
    document.title = 'Need Momentum — Make It Move.';
  }, []);

  const ticker = useScrollSkew();
  const m360 = sizeOf('/assets/proof/hospitality.jpg');

  return (
    <div className="signal-page signal-page--v3" id="top">
      <a className="skip-link" href="#main">Skip to content</a>
      <LazyParticleSpine />
      <ScrollProgress />

      <main id="main">
        <section className="signal-hero">
          <Header />
          <div className="signal-hero__scene" aria-hidden="true">
            <div className="signal-hero__lens" />
            <LazySignalScene />
          </div>
          <div className="signal-hero__content">
            {/* The inner .hero-line__face carries the visible text. The outer
                span's data-text feeds the ::before extrusion and ::after
                chromatic ghosts via content: attr(). Only the inner span is a
                text node, so the rendered copy is unchanged. */}
            <h1>
              <span className="hero-line" data-text="Need Momentum?">
                <span className="hero-line__face">Need Momentum?</span>
              </span>
              <span className="hero-line" data-text="Make It Move.">
                <span className="hero-line__face">Make It Move.</span>
              </span>
            </h1>
            <p className="signal-hero__intro">One connected agency for getting found, looking exceptional and turning attention into action.</p>
            <div className="hero-actions">
              <Magnetic className="magnetic--hero" strength={11}>
                <a className="button button--yellow button--signal-3d" href={auditUrl} onPointerEnter={pulseSignal}>
                  Request a free audit <ArrowUpRight />
                </a>
              </Magnetic>
              <a className="text-link text-link--glass" href="#system">See how it works <ArrowDown /></a>
            </div>
          </div>
          <div className="signal-hero__ticker" aria-hidden="true">
            <div className="signal-hero__ticker-run" ref={ticker}>
              <span>GET FOUND</span><i /> <span>GET CHOSEN</span><i /> <span>SHOW THE SPACE</span><i /> <span>BUILD MOMENTUM</span><i />
              <span>GET FOUND</span><i /> <span>GET CHOSEN</span><i /> <span>SHOW THE SPACE</span><i /> <span>BUILD MOMENTUM</span><i />
            </div>
          </div>
        </section>

        <section className="signal-manifesto surface-paper" id="system">
          <div className="signal-manifesto__bleed signal-manifesto__bleed--top" aria-hidden="true" />
          <div className="signal-manifesto__line"><span>Search finds you.</span><strong>Story holds attention.</strong></div>
          <div className="signal-manifesto__line"><strong>Space builds trust.</strong><span>Systems move people.</span></div>
          <p>One company moves every part together.</p>
          <div className="signal-manifesto__bleed signal-manifesto__bleed--bottom" aria-hidden="true" />
        </section>

        <ServiceRail />
        <SignalProof />

        <section className="signal-m360 surface-panel" id="momentum-360">
          <div className="signal-m360__media">
            <img
              src="/assets/proof/hospitality.jpg"
              alt="A hospitality space captured for Momentum 360"
              width={m360.width}
              height={m360.height}
              loading="lazy"
              decoding="async"
            />
            <a href="https://www.momentumvirtualtours.com/services/custom-360-virtual-tours/" aria-label="Explore the Momentum 360 virtual tour story">
              <Play fill="currentColor" />
            </a>
            <span>Move through the space</span>
          </div>
          <Reveal className="signal-m360__copy">
            <div className="signal-m360__logo-chamber" role="img" aria-label="Momentum 360 logo forming from particles">
              <span className="logo-orbit logo-orbit--one" aria-hidden="true" />
              <span className="logo-orbit logo-orbit--two" aria-hidden="true" />
              <span className="logo-orbit logo-orbit--three" aria-hidden="true" />
              <div className="signal-m360__particle-logo" aria-hidden="true"><LazySignalScene variant="m360" /></div>
            </div>
            <h2>The spatial-media arm of Need Momentum.</h2>
            <p>Virtual tours, photography, video and 3D rendering make a business tangible before the customer ever arrives.</p>
            <Magnetic className="magnetic--inline" strength={7}>
              <a className="signal-inline-cta" href="https://www.momentumvirtualtours.com/services/custom-360-virtual-tours/">
                Step inside the work <ArrowUpRight />
              </a>
            </Magnetic>
          </Reveal>
        </section>

        <section className="signal-decision surface-deep">
          <RevealWords as="h2" text={'Not more noise.\nMore momentum.'} emphasis="momentum." className="signal-decision__title" />
          <div className="signal-decision__paths">
            <div className="signal-decision__thread" aria-hidden="true" />
            <Reveal as="article" delay={0}><span>01</span><h3>Find the gap</h3><p>Start with the free audit. See what customers see and where the journey breaks.</p></Reveal>
            <Reveal as="article" delay={1}><span>02</span><h3>Choose the lever</h3><p>Focus first on the channel, page or experience with the clearest upside.</p></Reveal>
            <Reveal as="article" delay={2}><span>03</span><h3>Connect the system</h3><p>Layer the right capabilities so momentum compounds.</p></Reveal>
          </div>
        </section>

        <Founders />

        <section className="signal-awards surface-paper">
          <p>Recognition earned by the team behind the work.</p>
          <div className="signal-awards__row">
            <span className="award-plinth"><img src="/assets/badges/inc-5000.png" alt="Inc. 5000" width={363} height={363} loading="lazy" decoding="async" /></span>
            <span className="award-plinth"><img src="/assets/badges/philly-100.png" alt="Philadelphia 100" width={891} height={892} loading="lazy" decoding="async" /></span>
            {/* The Google Partner lockup is a white mark on transparency, so it
                vanished entirely on a light plinth. It gets the dark surface
                its brand guidelines assume. */}
            <span className="award-plinth" data-surface="dark"><img src="/assets/badges/google-partner.webp" alt="Google Partner" width={89} height={50} loading="lazy" decoding="async" /></span>
          </div>
        </section>

        <FinalCta />
      </main>

      <Footer />
    </div>
  );
}
