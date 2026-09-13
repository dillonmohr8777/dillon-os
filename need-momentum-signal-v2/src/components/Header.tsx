import { ArrowUpRight, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { auditUrl } from '../shared/content';
import { pulseSignal } from '../shared/signalBus';
import { Magnetic } from './Magnetic';

export function BrandLockup({ inverse = false }: { inverse?: boolean }) {
  return (
    <a className={`brand-lockup ${inverse ? 'brand-lockup--inverse' : ''}`} href="#top" aria-label="Need Momentum home">
      <span className="brand-lockup__need">Need</span>
      <span className="brand-lockup__plate">
        <img src="/assets/brand/need-momentum-logo.png" alt="Momentum" width={800} height={172} />
      </span>
    </a>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const [lifted, setLifted] = useState(false);

  useEffect(() => {
    const close = () => setOpen(false);
    window.addEventListener('resize', close);
    return () => window.removeEventListener('resize', close);
  }, []);

  // Escape closes the mobile sheet — v1 could only be dismissed by tapping the
  // toggle again, which is a keyboard trap on narrow viewports.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  // The bar earns its glass and its shadow only once the page has moved.
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setLifted(window.scrollY > 24);
    };
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <header className={`site-header${lifted ? ' is-lifted' : ''}${open ? ' is-open' : ''}`}>
      <BrandLockup inverse />
      <button className="menu-button" type="button" aria-expanded={open} aria-controls="site-nav" onClick={() => setOpen(!open)}>
        <span className="sr-only">{open ? 'Close navigation' : 'Open navigation'}</span>
        {open ? <X /> : <Menu />}
      </button>
      <nav id="site-nav" className={open ? 'site-nav is-open' : 'site-nav'} aria-label="Primary">
        <a href="#system" onClick={() => setOpen(false)}><span>Services</span></a>
        <a href="#momentum-360" onClick={() => setOpen(false)}><span>Momentum 360</span></a>
        <a href="#work" onClick={() => setOpen(false)}><span>Work</span></a>
        <a href="#founders" onClick={() => setOpen(false)}><span>About</span></a>
      </nav>
      <Magnetic className="magnetic--header-cta" strength={6}>
        <a className="header-cta" href={auditUrl} onPointerEnter={pulseSignal}>
          Free audit <ArrowUpRight aria-hidden="true" />
        </a>
      </Magnetic>
    </header>
  );
}
